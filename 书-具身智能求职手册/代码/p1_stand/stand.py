"""项目一：在 MuJoCo 里让 Unitree Go2 从趴着站起来，比较不同的刚度 kp 和阻尼 kd。

用法：
  python stand.py --model ~/mujoco_menagerie/unitree_go2/scene.xml
  python stand.py --model ... --kp 60 --kd 2 --delay 3     # 只跑一组，控制延迟 3 ms
输出：out/ 下每组参数一个 CSV，外加一张对比图 stand.png；终端打印指标表。
"""
import argparse
import csv
import os

import numpy as np
import mujoco

# 每条腿三个关节：髋外展（abduction）、髋（thigh）、膝（calf），四条腿顺序 FL FR RL RR
LIE = np.array([0.0, 1.22, -2.44] * 4)    # 趴下的关节角（弧度）
STAND = np.array([0.0, 0.90, -1.80] * 4)  # 站立的关节角，和 Menagerie 的 home 关键帧一致
DT = 0.001                                # 仿真和控制都是 1 kHz


def smoothstep(x):
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3 - 2 * x)


def run(model_path, kp, kd, delay_ms=0, load_n=60.0, t_total=5.0):
    """跑一次：0–0.5 s 趴着，0.5–1.5 s 站起，3–4 s 机身上压 load_n 牛的力。返回逐步记录。"""
    m = mujoco.MjModel.from_xml_path(model_path)
    m.opt.timestep = DT
    d = mujoco.MjData(m)
    d.qpos[2] = 0.12            # 机身贴近地面
    d.qpos[7:] = LIE
    mujoco.mj_forward(m, d)
    lo, hi = m.actuator_ctrlrange[:, 0], m.actuator_ctrlrange[:, 1]
    base = m.body("base").id
    # 控制延迟：用 delay_ms 毫秒之前测到的关节角和角速度算力矩
    history = [(d.qpos[7:].copy(), d.qvel[6:].copy())] * (delay_ms + 1)
    rows = []
    for k in range(int(t_total / DT)):
        t = k * DT
        q_des = LIE + smoothstep((t - 0.5) / 1.0) * (STAND - LIE)
        d.xfrc_applied[base, 2] = -load_n if 3.0 <= t < 4.0 else 0.0
        history.append((d.qpos[7:].copy(), d.qvel[6:].copy()))
        q, dq = history.pop(0)
        tau = kp * (q_des - q) - kd * dq
        d.ctrl[:] = np.clip(tau, lo, hi)
        saturated = np.any(np.abs(tau) > hi)
        mujoco.mj_step(m, d)
        # 记录：时间、机身高度、左前膝的目标角和实际角、左前膝力矩、是否饱和
        rows.append((t, d.qpos[2], q_des[2], d.qpos[9], d.ctrl[2], int(saturated)))
    return np.array(rows)


def metrics(r):
    t, z, qd, q, tau, sat = r.T
    stand = (t >= 2.0) & (t < 3.0)
    loaded = (t >= 3.5) & (t < 4.0)
    return {
        "height_m": z[stand].mean(),
        "knee_err_deg": np.degrees(np.abs(qd[stand] - q[stand]).mean()),
        "sag_mm": (z[stand].mean() - z[loaded].mean()) * 1000,
        "jitter_deg": np.degrees(np.std(q[stand])),
        "max_tau_Nm": np.abs(tau).max(),
        "saturated_ms": int(sat.sum()),   # 1 kHz，一步就是 1 ms
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True, help="mujoco_menagerie/unitree_go2/scene.xml 的路径")
    ap.add_argument("--kp", type=float)
    ap.add_argument("--kd", type=float)
    ap.add_argument("--delay", type=int, default=0, help="控制延迟，毫秒")
    ap.add_argument("--out", default="out")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    if a.kp is not None:
        configs = [(a.kp, a.kd or 0.0, a.delay)]
    else:
        # 对照一：刚度从软到硬，没有延迟
        # 对照二：同样 kp=300、控制延迟 5 ms，比较 kd=3 和 kd=8
        configs = [(10, 0.5, 0), (40, 1.0, 0), (100, 2.0, 0), (300, 3.0, 0),
                   (300, 3.0, 5), (300, 8.0, 5)]
    print(f"{'kp':>5} {'kd':>4} {'delay':>5} | {'height':>6} {'knee_err':>8} {'sag':>6} {'jitter':>6} {'max_tau':>7} {'sat_ms':>6}")
    results = {}
    for kp, kd, delay in configs:
        r = run(a.model, kp, kd, delay)
        results[(kp, kd, delay)] = r
        name = f"kp{kp:g}_kd{kd:g}_delay{delay}"
        with open(os.path.join(a.out, name + ".csv"), "w", newline="") as f:
            w = csv.writer(f)
            w.writerow(["t", "base_z", "knee_des", "knee", "knee_tau", "saturated"])
            w.writerows(r[::2].round(5))       # 每 2 ms 存一行
        mt = metrics(r)
        print(f"{kp:5g} {kd:4g} {delay:5d} | {mt['height_m']:6.3f} {mt['knee_err_deg']:8.2f} "
              f"{mt['sag_mm']:6.1f} {mt['jitter_deg']:6.2f} {mt['max_tau_Nm']:7.1f} {mt['saturated_ms']:6d}")
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        fig, ax = plt.subplots(2, 1, figsize=(7, 6), sharex=True)
        for (kp, kd, delay), r in results.items():
            ax[0].plot(r[:, 0], r[:, 1], label=f"kp={kp:g} kd={kd:g} delay={delay}ms")
            ax[1].plot(r[:, 0], np.degrees(r[:, 3]))
        ax[1].plot(r[:, 0], np.degrees(r[:, 2]), "k--", label="target")
        ax[0].set_ylabel("base height (m)")
        ax[1].set_ylabel("FL knee angle (deg)")
        ax[1].set_xlabel("time (s)")
        ax[0].legend(fontsize=8)
        ax[1].legend(fontsize=8)
        fig.tight_layout()
        fig.savefig(os.path.join(a.out, "stand.png"), dpi=120)
    except ImportError:
        pass


if __name__ == "__main__":
    main()
