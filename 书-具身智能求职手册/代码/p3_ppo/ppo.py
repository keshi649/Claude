"""项目三：用 PPO 训练 MuJoCo 的 Hopper（单腿跳跃机器人），对照"加不加域随机化"。

用法：
  python ppo.py --seed 1                 # 普通训练
  python ppo.py --seed 1 --dr            # 训练时每个回合随机改躯干质量、地面摩擦、电机力气
  python ppo.py --eval runs/xxx.pt       # 在几种"变了样"的环境里测试一个训好的策略
写法参考 CleanRL 的 ppo_continuous_action（单文件 PPO），观测归一化和回报缩放自己实现，方便保存。
"""
import argparse
import csv
import os
import time

import gymnasium as gym
import numpy as np
import torch
import torch.nn as nn
from torch.distributions import Normal


class RunningStat:
    """在线均值方差（Welford 的分组合并），用来归一化观测和缩放回报。"""
    def __init__(self, shape):
        self.mean, self.var, self.count = np.zeros(shape), np.ones(shape), 1e-4

    def update(self, x):
        bm, bv, bc = x.mean(0), x.var(0), x.shape[0]
        delta, tot = bm - self.mean, self.count + bc
        self.mean = self.mean + delta * bc / tot
        self.var = (self.var * self.count + bv * bc + delta ** 2 * self.count * bc / tot) / tot
        self.count = tot


# 训练时随机化的范围（相对原始值的倍数）
DR_RANGES = {"torso_mass": (0.7, 1.3), "friction": (0.6, 1.4), "motor": (0.85, 1.15)}
# 测试用的"变了样"的环境
TEST_CASES = {
    "nominal": dict(torso_mass=1.0, friction=1.0, motor=1.0),
    "heavy_torso_x1.5": dict(torso_mass=1.5, friction=1.0, motor=1.0),
    "slippery_x0.5": dict(torso_mass=1.0, friction=0.5, motor=1.0),
    "weak_motor_x0.8": dict(torso_mass=1.0, friction=1.0, motor=0.8),
}


class Dynamics(gym.Wrapper):
    """每次 reset 时把躯干质量、摩擦系数、电机力气乘上一个倍数。"""
    def __init__(self, env, randomize=False, fixed=None, seed=0):
        super().__init__(env)
        m = env.unwrapped.model
        self.base_mass = m.body_mass.copy()
        self.base_friction = m.geom_friction.copy()
        self.base_gear = m.actuator_gear.copy()
        self.torso = m.body("torso").id
        self.randomize, self.fixed = randomize, fixed or {}
        self.rng = np.random.default_rng(seed)

    def reset(self, **kw):
        m = self.env.unwrapped.model
        if self.randomize:
            f = {k: self.rng.uniform(*r) for k, r in DR_RANGES.items()}
        else:
            f = {"torso_mass": 1.0, "friction": 1.0, "motor": 1.0, **self.fixed}
        m.body_mass[:] = self.base_mass
        m.body_mass[self.torso] = self.base_mass[self.torso] * f["torso_mass"]
        m.geom_friction[:] = self.base_friction * np.array([f["friction"], 1, 1])
        m.actuator_gear[:] = self.base_gear * f["motor"]
        return self.env.reset(**kw)


def make_env(env_id, randomize, seed, fixed=None):
    def thunk():
        env = gym.make(env_id)
        env = Dynamics(env, randomize=randomize, fixed=fixed, seed=seed)
        env = gym.wrappers.RecordEpisodeStatistics(env)
        env = gym.wrappers.ClipAction(env)
        return env
    return thunk


def layer(i, o, std=np.sqrt(2)):
    l = nn.Linear(i, o)
    nn.init.orthogonal_(l.weight, std)
    nn.init.constant_(l.bias, 0.0)
    return l


class Agent(nn.Module):
    def __init__(self, n_obs, n_act):
        super().__init__()
        self.critic = nn.Sequential(layer(n_obs, 64), nn.Tanh(), layer(64, 64), nn.Tanh(), layer(64, 1, 1.0))
        self.actor = nn.Sequential(layer(n_obs, 64), nn.Tanh(), layer(64, 64), nn.Tanh(), layer(64, n_act, 0.01))
        self.log_std = nn.Parameter(torch.zeros(1, n_act))

    def value(self, x):
        return self.critic(x)

    def act(self, x, a=None):
        mu = self.actor(x)
        dist = Normal(mu, self.log_std.expand_as(mu).exp())
        if a is None:
            a = dist.sample()
        return a, dist.log_prob(a).sum(1), dist.entropy().sum(1), self.critic(x)


def train(a):
    torch.manual_seed(a.seed)
    np.random.seed(a.seed)
    torch.set_num_threads(1)
    # SAME_STEP：回合一结束就在同一步里重置，最后一帧观测放在 info["final_obs"]
    envs = gym.vector.SyncVectorEnv([make_env(a.env, a.dr, a.seed * 100 + i) for i in range(a.num_envs)],
                                    autoreset_mode=gym.vector.AutoresetMode.SAME_STEP)
    n_obs, n_act = envs.single_observation_space.shape[0], envs.single_action_space.shape[0]
    agent = Agent(n_obs, n_act)
    opt = torch.optim.Adam(agent.parameters(), lr=3e-4, eps=1e-5)
    obs_stat, ret_stat = RunningStat(n_obs), RunningStat(())
    T, N = a.rollout, a.num_envs
    buf_o = torch.zeros(T, N, n_obs); buf_a = torch.zeros(T, N, n_act)
    buf_lp = torch.zeros(T, N); buf_r = torch.zeros(T, N); buf_d = torch.zeros(T, N); buf_v = torch.zeros(T, N)
    raw, _ = envs.reset(seed=a.seed)
    ret_acc = np.zeros(N)
    done = torch.zeros(N)
    log, step, t0 = [], 0, time.time()
    n_updates = a.steps // (T * N)
    for upd in range(n_updates):
        for g in opt.param_groups:                 # 学习率线性衰减
            g["lr"] = 3e-4 * (1 - upd / n_updates)
        for t in range(T):
            obs_stat.update(raw)
            o = torch.tensor(np.clip((raw - obs_stat.mean) / np.sqrt(obs_stat.var + 1e-8), -10, 10), dtype=torch.float32)
            with torch.no_grad():
                act, lp, _, v = agent.act(o)
            raw, r, term, trunc, info = envs.step(act.numpy())
            ret_acc = ret_acc * 0.99 + r            # 用折扣回报的标准差来缩放奖励
            ret_stat.update(ret_acc)
            ret_acc[term | trunc] = 0.0
            r_scaled = np.clip(r / np.sqrt(ret_stat.var + 1e-8), -10, 10)
            # 超时（没摔倒）的回合不是真正的结束：把最后一帧的价值折算进奖励里
            for i in np.where(trunc & ~term)[0]:
                fo = np.clip((info["final_obs"][i] - obs_stat.mean) / np.sqrt(obs_stat.var + 1e-8), -10, 10)
                with torch.no_grad():
                    r_scaled[i] += 0.99 * agent.value(torch.tensor(fo, dtype=torch.float32)[None]).item()
            buf_o[t], buf_a[t], buf_lp[t], buf_v[t] = o, act, lp, v.flatten()
            buf_r[t] = torch.tensor(r_scaled, dtype=torch.float32)
            buf_d[t] = done
            done = torch.tensor(term | trunc, dtype=torch.float32)
            step += N
            fi = info.get("final_info", {})
            if "episode" in fi:
                for i in np.where(fi["_episode"])[0]:
                    log.append((step, float(fi["episode"]["r"][i])))
        with torch.no_grad():                         # GAE(λ) 优势估计
            o = torch.tensor(np.clip((raw - obs_stat.mean) / np.sqrt(obs_stat.var + 1e-8), -10, 10), dtype=torch.float32)
            nxt_v = agent.value(o).flatten()
            adv = torch.zeros(T, N); last = 0
            for t in reversed(range(T)):
                nd = 1.0 - (done if t == T - 1 else buf_d[t + 1])
                nv = nxt_v if t == T - 1 else buf_v[t + 1]
                delta = buf_r[t] + 0.99 * nv * nd - buf_v[t]
                adv[t] = last = delta + 0.99 * 0.95 * nd * last
            ret = adv + buf_v
        b_o, b_a, b_lp = buf_o.reshape(-1, n_obs), buf_a.reshape(-1, n_act), buf_lp.reshape(-1)
        b_adv, b_ret = adv.reshape(-1), ret.reshape(-1)
        idx = np.arange(T * N)
        for _ in range(10):                           # 每批数据用 10 遍，每遍 32 个小批
            np.random.shuffle(idx)
            for mb in np.array_split(idx, 32):
                _, lp, ent, v = agent.act(b_o[mb], b_a[mb])
                ratio = (lp - b_lp[mb]).exp()
                ad = b_adv[mb]
                ad = (ad - ad.mean()) / (ad.std() + 1e-8)
                pg = torch.max(-ad * ratio, -ad * ratio.clamp(0.8, 1.2)).mean()   # 截断的策略目标
                vl = 0.5 * ((v.flatten() - b_ret[mb]) ** 2).mean()
                loss = pg + 0.5 * vl - 0.0 * ent.mean()
                opt.zero_grad(); loss.backward()
                nn.utils.clip_grad_norm_(agent.parameters(), 0.5)
                opt.step()
        if (upd + 1) % 10 == 0 or upd == n_updates - 1:
            recent = [r for _, r in log[-20:]]
            print(f"step {step:>8}  return {np.mean(recent) if recent else 0:8.1f}  {step / (time.time() - t0):6.0f} steps/s", flush=True)
    name = f"{a.env}_{'dr' if a.dr else 'nodr'}_seed{a.seed}"
    os.makedirs(a.out, exist_ok=True)
    torch.save({"agent": agent.state_dict(), "obs_mean": obs_stat.mean, "obs_var": obs_stat.var,
                "env": a.env, "n_obs": n_obs, "n_act": n_act}, os.path.join(a.out, name + ".pt"))
    with open(os.path.join(a.out, name + "_curve.csv"), "w", newline="") as f:
        w = csv.writer(f); w.writerow(["step", "episode_return"]); w.writerows(log)
    print("saved", os.path.join(a.out, name + ".pt"), f"in {time.time() - t0:.0f} s")


def evaluate(path, episodes=20):
    ck = torch.load(path, weights_only=False)
    agent = Agent(ck["n_obs"], ck["n_act"]); agent.load_state_dict(ck["agent"])
    out = {}
    for case, fixed in TEST_CASES.items():
        env = make_env(ck["env"], False, 0, fixed)()
        rets = []
        for ep in range(episodes):
            raw, _ = env.reset(seed=10_000 + ep)
            total, end = 0.0, False
            while not end:
                o = torch.tensor(np.clip((raw - ck["obs_mean"]) / np.sqrt(ck["obs_var"] + 1e-8), -10, 10), dtype=torch.float32)
                with torch.no_grad():
                    act = agent.actor(o[None])[0].numpy()        # 测试时用均值动作，不加噪声
                raw, r, term, trunc, _ = env.step(act)
                total += r; end = term or trunc
            rets.append(total)
        out[case] = (float(np.mean(rets)), float(np.std(rets)))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--env", default="Hopper-v5")
    ap.add_argument("--steps", type=int, default=1_000_000)
    ap.add_argument("--num-envs", type=int, default=1)
    ap.add_argument("--rollout", type=int, default=2048)
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--dr", action="store_true", help="训练时做域随机化")
    ap.add_argument("--out", default="runs")
    ap.add_argument("--eval", help="测试一个保存好的 .pt")
    a = ap.parse_args()
    if a.eval:
        for case, (m, s) in evaluate(a.eval).items():
            print(f"{case:18} {m:8.1f} ± {s:6.1f}")
    else:
        train(a)


if __name__ == "__main__":
    main()
