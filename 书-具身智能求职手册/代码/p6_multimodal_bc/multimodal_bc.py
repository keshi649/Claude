"""项目六：模仿学习里的"多峰"问题——左边绕和右边绕都对，平均一下就撞上去。

场景：一个点状机器人从左边出发，要到右边的目标，正中间有个圆形障碍。
专家先直着走到障碍物跟前，再一半从上面绕、一半从下面绕，和起点在哪无关。
- 学生 A：普通行为克隆，神经网络回归"往哪个方向走"，损失函数是均方误差。
  两种示范一平均，正对障碍物的地方学到的是"直着走"，于是撞上去。
- 学生 B：把方向离散成 16 个格子，当分类问题学（交叉熵），每步取概率最大的格子。
  RT-1、RT-2 这类机器人大模型把动作离散成 token，就是这个思路。它能学出"上下各一半"，
  但每步都重新挑，在分叉点附近会在两种走法之间来回切换。
- 学生 C：把"接下来 8 步的方向"整段当成一个动作，先用 k 均值把示范里的动作段聚成 32 类，
  再学分类；选中一类就把这一段走完再重新决定。Behavior Transformer、VQ-BeT 用聚类或量化的
  动作 token，ACT 一次输出一段动作，都是在解决"选定一种走法、走得前后一致"这件事。
用法：python multimodal_bc.py     # 结果写到 out/
"""
import argparse
import csv
import os

import numpy as np
import torch
import torch.nn as nn

GOAL, OBST, R_OBST = np.array([10.0, 0.0]), np.array([5.0, 0.0]), 1.0
SPEED, DT, MAX_STEPS = 1.0, 0.1, 200          # 1 m/s，10 Hz
N_BINS, CHUNK, N_PROTO = 16, 8, 32


def expert_path(start, side):
    """专家：先直着朝障碍物走，到跟前 1.5 m 再决定从上面（side=+1）还是下面（side=-1）绕，最后走向目标。
    就像人走路，到了跟前才往左或往右让一下：分叉点上，两种示范的状态几乎一样，动作却相反。"""
    turn = np.array([OBST[0] - R_OBST - 0.5, start[1]])
    way = OBST + np.array([0.0, side * (R_OBST + 0.8)])
    pts, p = [start.copy()], start.copy()
    for target in (turn, way, GOAL):
        while np.linalg.norm(target - p) > SPEED * DT:
            p = p + SPEED * DT * (target - p) / np.linalg.norm(target - p)
            pts.append(p.copy())
    return np.array(pts)


def headings(path):
    d = np.diff(path, axis=0)
    return np.arctan2(d[:, 1], d[:, 0])


def make_demos(n, rng):
    X, H = [], []
    for i in range(n):
        start = np.array([0.0, rng.uniform(-0.3, 0.3)])
        path = expert_path(start, +1 if i % 2 == 0 else -1)
        X.append(path[:-1]); H.append(headings(path))
    return np.concatenate(X), np.concatenate(H), [len(h) for h in H]


def net(out_dim):
    return nn.Sequential(nn.Linear(2, 128), nn.ReLU(), nn.Linear(128, 128), nn.ReLU(), nn.Linear(128, out_dim))


def to_bin(h):
    return np.round((h % (2 * np.pi)) / (2 * np.pi) * N_BINS).astype(int) % N_BINS


def from_bin(b):
    return b * 2 * np.pi / N_BINS


def chunks_of(H, lengths):
    """每个示范状态往后 CHUNK 步的方向（不跨示范，末尾用最后一步补齐），编码成 (cos, sin)。"""
    out, k = [], 0
    for n in lengths:
        h = H[k:k + n]
        idx = np.minimum(np.arange(n)[:, None] + np.arange(CHUNK)[None], n - 1)
        out.append(h[idx]); k += n
    c = np.concatenate(out)
    return np.concatenate([np.cos(c), np.sin(c)], 1)


def kmeans(V, k, seed, iters=30):
    rng = np.random.default_rng(seed)
    C = V[rng.choice(len(V), k, replace=False)]
    for _ in range(iters):
        lab = ((V[:, None, :] - C[None]) ** 2).sum(-1).argmin(1)
        C = np.array([V[lab == j].mean(0) if np.any(lab == j) else C[j] for j in range(k)])
    return C, lab


def train(X, H, kind, seed, lengths=None, iters=3000):
    torch.manual_seed(seed)
    Xt = torch.tensor(X, dtype=torch.float32)
    protos = None
    if kind == "mse":                 # 回归方向向量 (cos, sin)
        f = net(2)
        Y = torch.tensor(np.stack([np.cos(H), np.sin(H)], 1), dtype=torch.float32)
        loss_fn = lambda: ((f(Xt) - Y) ** 2).mean()
    elif kind == "classify":          # 16 个方向格子的分类
        f = net(N_BINS)
        Y = torch.tensor(to_bin(H))
        loss_fn = lambda: nn.functional.cross_entropy(f(Xt), Y)
    else:                             # 整段动作聚类成 N_PROTO 个原型，再分类
        V = chunks_of(H, lengths)
        protos, lab = kmeans(V, N_PROTO, seed)
        f = net(N_PROTO)
        Y = torch.tensor(lab)
        loss_fn = lambda: nn.functional.cross_entropy(f(Xt), Y)
    opt = torch.optim.Adam(f.parameters(), lr=1e-3)
    for _ in range(iters):
        loss = loss_fn()
        opt.zero_grad(); loss.backward(); opt.step()
    return f, protos


def run(f, kind, start, protos=None):
    """执行一个回合，返回轨迹和结果：reached / collided / timeout。"""
    p, path, plan = start.copy(), [start.copy()], []
    for _ in range(MAX_STEPS):
        with torch.no_grad():
            out = f(torch.tensor(p, dtype=torch.float32)[None])[0]
        if kind == "mse":
            h = np.arctan2(out[1].item(), out[0].item())
        elif kind == "classify":
            h = from_bin(out.argmax().item())
        else:
            if not plan:              # 上一段走完了，才重新选一段
                c = protos[out.argmax().item()]
                plan = list(np.arctan2(c[CHUNK:], c[:CHUNK]))
            h = plan.pop(0)
        p = p + SPEED * DT * np.array([np.cos(h), np.sin(h)])
        path.append(p.copy())
        if np.linalg.norm(p - OBST) < R_OBST:
            return np.array(path), "collided"
        if np.linalg.norm(p - GOAL) < 0.3:
            return np.array(path), "reached"
    return np.array(path), "timeout"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="out")
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--demos", type=int, default=200)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    torch.set_num_threads(1)
    rng = np.random.default_rng(a.seed)
    X, H, lengths = make_demos(a.demos, rng)
    test_starts = [np.array([0.0, y]) for y in np.linspace(-0.3, 0.3, 61)]
    rows, paths = [], {}
    for kind in ("mse", "classify", "chunk"):
        f, protos = train(X, H, kind, a.seed, lengths)
        results = [run(f, kind, s, protos) for s in test_starts]
        counts = {k: sum(r == k for _, r in results) for k in ("reached", "collided", "timeout")}
        print(f"{kind:9} reached {counts['reached']:2d}/61  collided {counts['collided']:2d}  timeout {counts['timeout']:2d}")
        rows.append((kind, counts["reached"], counts["collided"], counts["timeout"]))
        paths[kind] = [results[i][0] for i in (0, 30, 60)]          # y = -0.3, 0, 0.3 三个起点
    with open(os.path.join(a.out, "summary.csv"), "w", newline="") as fh:
        w = csv.writer(fh); w.writerow(["policy", "reached", "collided", "timeout"]); w.writerows(rows)
    with open(os.path.join(a.out, "paths.csv"), "w", newline="") as fh:
        w = csv.writer(fh); w.writerow(["policy", "start_y", "x", "y"])
        for kind, ps in paths.items():
            for sy, p in zip((-0.3, 0.0, 0.3), ps):
                w.writerows([(kind, sy, round(x, 3), round(y, 3)) for x, y in p[::2]])
        for side in (+1, -1):          # 两条专家示范，画图用
            p = expert_path(np.array([0.0, 0.0]), side)
            w.writerows([("expert", side, round(x, 3), round(y, 3)) for x, y in p[::2]])


if __name__ == "__main__":
    main()
