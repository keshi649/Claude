"""experiment.py：片子里那只小怪，真的是这样训练出来的。

表格 Q 学习（Q-learning），只用 numpy，几秒钟跑完；随机种子固定，每次跑出来都一样。
一共 1000 局，分四段，每一段换一次记分规则：

  第 1 段  赛跑：吃到金币 +1（金币被吃掉 6 步以后重新长出来），跑到终点 +10
  第 2 段  赛跑：金币全撤了；"往终点方向走一步 +1"（往回走不扣分），跑到终点 +10
  第 3 段  拿球：看正面镜头打分——镜头里手和球叠在一起，就算拿到了，+10
  第 4 段  赛跑：只奖励跑到终点（+10）。先照常训练一阵，再加上"好奇心"
           （乐观初值：没试过的走法，先当它能拿 10 分）

小怪看到的只有自己站在哪一格（赛跑、拿球都一样），每一步选上下左右（拿球多一个"抓"）。
一局最多 90 步（拿球 30 步），到终点 / 评委给分就结束。

输出：exp.json（给 narration.py、audio.py 用）和 exp.js（给画面回放用）：
每局的分数、有没有真的完成；挑出来的几局逐步轨迹；训练前后每一格最想走的方向。
用法：python3 experiment.py
"""
import json
import os
from collections import deque

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))

# ---------------- 赛道 ----------------
# 20×10 格的公园：一条土路从左下的起点 S 弯弯绕绕通到右边的终点 F（沿路 26 步），中间过一座桥；
# 起点上面有个小池塘，池塘边绕着一圈 8 格的小环路，环路上有 3 枚金币（整张图只有这 3 枚）。
# 地图字符：. 路  S 起点  F 终点  o 环路上的金币  = 桥（这几种能走）
#          ~ 河  p 池塘  T 树  空格 草地（走不了）


def build_map():
    W, H = 20, 10
    g = [[' '] * W for _ in range(H)]

    def line(a, b):
        (x0, y0), (x1, y1) = a, b
        if x0 == x1:
            s = 1 if y1 > y0 else -1
            return [(x0, y) for y in range(y0, y1 + s, s)]
        s = 1 if x1 > x0 else -1
        return [(x, y0) for x in range(x0, x1 + s, s)]

    pts = [(2, 8), (6, 8), (6, 5), (13, 5), (13, 2), (17, 2), (17, 7)]       # 主路的拐点
    road = [c for a, b in zip(pts, pts[1:]) for c in line(a, b)]
    ring = [(2, 4), (3, 4), (4, 4), (4, 5), (4, 6), (3, 6), (2, 6), (2, 5)]   # 池塘边的小环路
    for y in range(H):
        g[y][10] = '~'                                                       # 一条河
    for x, y in road + ring + [(2, 7)]:
        g[y][x] = '.'
    g[5][10] = '='
    g[5][3] = 'p'
    for x, y in [(2, 4), (4, 4), (4, 6)]:
        g[y][x] = 'o'
    g[8][2], g[7][17] = 'S', 'F'
    for y in range(H):
        for x in range(W):
            if g[y][x] == ' ' and (x in (0, W - 1) or y in (0, H - 1)):
                g[y][x] = 'T'
    return [''.join(r) for r in g]


MAP = build_map()
H, W = len(MAP), len(MAP[0])
assert all(len(r) == W for r in MAP)
WALK = set('.SoF=')
cells = [(x, y) for y in range(H) for x in range(W) if MAP[y][x] in WALK]
IDX = {c: i for i, c in enumerate(cells)}
START = next(c for c in cells if MAP[c[1]][c[0]] == 'S')
FINISH = next(c for c in cells if MAP[c[1]][c[0]] == 'F')
RING = [c for c in cells if MAP[c[1]][c[0]] == 'o']          # 3 枚金币都在环路上
COINS = RING
MOVES = [(0, -1), (1, 0), (0, 1), (-1, 0)]          # 上 右 下 左
T_MAX = 90
RESPAWN = 6


def bfs(src):
    d = {src: 0}
    q = deque([src])
    while q:
        x, y = q.popleft()
        for dx, dy in MOVES:
            n = (x + dx, y + dy)
            if n in IDX and n not in d:
                d[n] = d[(x, y)] + 1
                q.append(n)
    return d


DIST = bfs(FINISH)                    # 每一格离终点还有几步（沿着路走）
assert all(c in DIST for c in cells), '有走不到终点的格子'


def step(pos, a):
    n = (pos[0] + MOVES[a][0], pos[1] + MOVES[a][1])
    return n if n in IDX else pos     # 撞到树、掉不进水：原地不动


class Race:
    """赛跑。rule：'coin'（第 1 段）、'shaping'（第 2 段）、'finish'（第 4 段）。
    小怪看得见自己在哪一格，也看得见那 3 枚金币现在在不在（就像看着游戏画面）：
    状态 = 格子编号 × 8 + 3 枚金币在不在（3 位）。"""

    def __init__(self, rule):
        self.rule = rule

    def obs(self):
        mask = sum(1 << k for k, c in enumerate(RING) if self.alive(c))
        return IDX[self.pos] * 8 + mask

    def alive(self, c):
        if self.rule != 'coin':
            return False                      # 第 2、4 段：金币全撤了
        e = self.eaten.get(c)
        return e is None or self.t - e > RESPAWN

    def cell(self):
        return IDX[self.pos]

    def reset(self):
        self.pos, self.t, self.eaten = START, 0, {}
        return self.obs()

    def step(self, a):
        old = self.pos
        self.pos = step(old, a)
        self.t += 1
        r, done, ev = 0.0, False, []
        if self.pos in COINS and self.pos != old and self.alive(self.pos):
            self.eaten[self.pos] = self.t
            r += 1
            ev.append('coin')
        if self.rule == 'shaping' and DIST[self.pos] < DIST[old]:
            r += 1
            ev.append('closer')
        if self.pos == FINISH:
            r += 10
            done = True
            ev.append('finish')
        if self.t >= T_MAX:
            done = True
        return self.obs(), r, done, ev


# ---------------- 拿球 ----------------
# 俯视 7×5 格：x 左右，y 前后（0 离镜头最近）。球在 (5, 3)。镜头在正前方，只看得到左右、看不出前后。
BW, BD = 7, 5
BALL = (5, 3)
B_START = (0, 0)
B_T = 30


class Ball:
    def cell(self):
        return self.pos[1] * BW + self.pos[0]

    def reset(self):
        self.pos, self.t = B_START, 0
        return self.pos[1] * BW + self.pos[0]

    def step(self, a):
        x, y = self.pos
        self.t += 1
        r, done, ev = 0.0, False, []
        if a < 4:
            nx, ny = x + MOVES[a][0], y - MOVES[a][1]      # 画面上"上" = 往里走
            if 0 <= nx < BW and 0 <= ny < BD and (nx, ny) != BALL:
                self.pos = (nx, ny)
        else:                                               # 抓
            hx, hy = self.pos
            looks = hx == BALL[0] and hy < BALL[1]          # 镜头里：手挡在球前面 = 看着像拿到了
            real = hx == BALL[0] and hy == BALL[1] - 1      # 真的够得着：就在球跟前
            if looks:
                r, done = 10.0, True
                ev.append('judge+10')
                if real:
                    ev.append('real')
        if self.t >= B_T:
            done = True
        return self.pos[1] * BW + self.pos[0], r, done, ev


# ---------------- Q 学习 ----------------
def run(env, n_states, n_actions, episodes, rng, alpha=.5, gamma=.97, eps0=1.0, eps1=.05, decay=150, q0=0.0, replay=20, keep=()):
    """Q 学习：每走一步，按"这一步得的分 + 下一格最好能拿多少分"更新一次；
    再从走过的路里随手抽 replay 步"复习"一遍（经验回放），学得快一些。"""
    Q = np.full((n_states, n_actions), q0)
    log, trajs, mem = [], {}, []
    for ep in range(episodes):
        eps = eps1 + (eps0 - eps1) * max(0.0, 1 - ep / decay)
        s = env.reset()
        total, done, path, evs = 0.0, False, [env.cell()], []
        while not done:
            if rng.random() < eps:
                a = int(rng.integers(n_actions))
            else:
                best = np.flatnonzero(Q[s] == Q[s].max())
                a = int(rng.choice(best))
            s2, r, done, ev = env.step(a)
            end = 'finish' in ev or 'judge+10' in ev            # 真正的终点；到时间了不算（下一格的分照样算进来）
            mem.append((s, a, r, s2, end))
            for k in [len(mem) - 1] + list(rng.integers(len(mem), size=replay)):
                ss, aa, rr, ss2, ee = mem[k]
                target = rr if ee else rr + gamma * Q[ss2].max()
                Q[ss, aa] += alpha * (target - Q[ss, aa])
            s, total = s2, total + r
            path.append(env.cell())
            evs.append(ev)
        log.append(dict(score=total, steps=len(path) - 1, events=sum(evs, [])))
        if ep in keep:
            trajs[ep] = dict(path=path, ev=evs)
    return Q, log, trajs


def greedy(env, Q, rng_seed=0):
    """训练好以后不再乱试，每一步都走它最想走的那一步，录一局给画面回放"""
    rng = np.random.default_rng(rng_seed)
    s = env.reset()
    path, evs, total, done = [env.cell()], [], 0.0, False
    while not done:
        best = np.flatnonzero(Q[s] == Q[s].max())
        a = int(rng.choice(best))
        s, r, done, ev = env.step(a)
        path.append(env.cell())
        evs.append(ev)
        total += r
    return dict(path=path, ev=evs, score=total)


def human_run():
    """我自己玩：沿最短路线跑到终点，路上的金币顺手吃掉"""
    env = Race('coin')
    env.reset()
    total, path = 0.0, [IDX[START]]
    while env.pos != FINISH:
        x, y = env.pos
        a = min(range(4), key=lambda k: DIST.get(step((x, y), k), 99))
        s, r, done, ev = env.step(a)
        total += r
        path.append(env.cell())
    return dict(path=path, score=total)


SEED = 11                                   # 换过 12 个种子，四段的行为都一样，这个种子的绕圈最整齐（见 脚本.md）
N1, N2, N3, N4A, N4B = 400, 300, 100, 50, 150   # 每段多少局，加起来 1000


def main():
    rng = np.random.default_rng(SEED)
    nS = len(cells) * 8
    hum = human_run()
    keep_all = tuple(range(1000))

    # 第 1 段：金币 +1（吃掉 6 步后重新长出来），终点 +10
    Q1, log1, tr1 = run(Race('coin'), nS, 4, N1, rng, decay=N1 * .6, keep=keep_all)
    g1 = greedy(Race('coin'), Q1)
    # 第 2 段：金币全撤；往终点走一步 +1；终点 +10
    Q2, log2, tr2 = run(Race('shaping'), nS, 4, N2, rng, decay=N2 * .6, keep=(0,))
    g2 = greedy(Race('shaping'), Q2)
    # 第 3 段：拿球，看正面镜头打分
    Q3, log3, tr3 = run(Ball(), BW * BD, 5, N3, rng, gamma=.9, decay=60, keep=(0,))
    g3 = greedy(Ball(), Q3)
    # 第 4 段：只奖励到终点。先从头照常学（没有好奇心），再加好奇心（乐观初值）从头学
    Q4a, log4a, tr4a = run(Race('finish'), nS, 4, N4A, rng, eps0=.3, decay=1, keep=keep_all)
    Q4b, log4b, tr4b = run(Race('finish'), nS, 4, N4B, rng, q0=10.0, eps0=.02, eps1=.02, decay=1, keep=keep_all)
    g4 = greedy(Race('finish'), Q4b)

    o1, o2, o3, o4a, o4b = 0, N1, N1 + N2, N1 + N2 + N3, N1 + N2 + N3 + N4A
    logs = log1 + log2 + log3 + log4a + log4b
    fin = lambda L: [i for i, l in enumerate(L) if 'finish' in l['events']]
    ring_cells = {IDX[c] for c in [(2, 4), (3, 4), (4, 4), (4, 5), (4, 6), (3, 6), (2, 6), (2, 5)]}

    def full_lap(path):                       # 这一局里有没有不停顿地绕完一整圈（连续 8 步都在环路上、各不相同）
        return any(len(set(path[i:i + 8])) == 8 and set(path[i:i + 8]) <= ring_cells for i in range(len(path) - 7))

    first_lap = next(i for i in range(N1) if full_lap(tr1[i]['path']))
    first_beat = next(i for i, l in enumerate(log1) if l['score'] > hum['score'])
    judged = [l['score'] > 0 for l in log3]
    streak = next(i for i in range(N3) if all(judged[i:]))          # 从这一局起，局局都拿满分
    real3 = sum('real' in l['events'] for l in log3)
    first4b = fin(log4b)[0]

    def visited(trs, upto):                  # 第 4 段：到第 upto 局为止，走到过哪些格子（画"迷雾"用）
        v = set()
        for k in range(upto + 1):
            v |= set(trs[k]['path'])
        return sorted(v)

    M = dict(
        first_lap=o1 + first_lap + 1, first_beat=o1 + first_beat + 1, fin1=len(fin(log1)),
        g1=g1['score'], human=hum['score'], ratio=round(g1['score'] / hum['score'], 2),
        fin2=len(fin(log2)), g2=g2['score'], dance=sorted({DIST[cells[s]] for s in g2['path'][-6:]}),
        streak=o3 + streak + 1, judged=sum(judged), real3=real3, g3_steps=len(g3['path']) - 1,
        fin4a=len(fin(log4a)), first4b=o4b + first4b + 1, g4=g4['score'], g4_steps=len(g4['path']) - 1,
        phases=dict(coin=[o1 + 1, o2], shaping=[o2 + 1, o3], ball=[o3 + 1, o4a], finish=[o4a + 1, o4b], curious=[o4b + 1, 1000]),
    )
    for k, v in M.items():
        print(f'{k:>10}: {v}')

    out = dict(
        map=MAP, W=W, H=H, cells=cells, start=START, finish=FINISH, ring=RING, dist=[DIST[c] for c in cells],
        t_max=T_MAX, respawn=RESPAWN, ball=dict(w=BW, d=BD, ball=BALL, start=B_START), milestones=M,
        score=[l['score'] for l in logs], done=[('finish' in l['events']) or ('real' in l['events']) for l in logs],
        human=hum,
        replays=dict(
            ep1=tr1[0], lap=tr1[first_lap], beat=tr1[first_beat], coin=g1, shaping=g2, shaping0=tr2[0], ball=g3, ball0=tr3[0],
            wander=tr4a[N4A - 1], curious=[tr4b[k] for k in range(first4b + 1)], finish=g4,
        ),
        fog=dict(before=visited(tr4a, N4A - 1), curious=[visited(tr4b, k) for k in range(first4b + 1)]),
    )
    with open(os.path.join(HERE, 'exp.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False)
    with open(os.path.join(HERE, 'exp.js'), 'w', encoding='utf-8') as f:
        f.write('// 由 experiment.py 生成：真实训练的记录（每局分数、几局的逐步轨迹）。请勿手改。\n')
        f.write('window.EXP = ' + json.dumps(out, ensure_ascii=False) + ';\n')


if __name__ == '__main__':
    main()
