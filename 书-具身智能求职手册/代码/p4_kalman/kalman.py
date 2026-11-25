"""项目四：用卡尔曼滤波融合 IMU 和腿式里程计，估计机身的位置、速度和 IMU 零偏；再加"打滑检测"。

一维的例子，原理和真机一样：
- IMU 200 Hz 测加速度，带一个固定零偏和噪声；
- 腿式里程计 200 Hz 测速度（由关节角和"脚不动"的假设算出来），脚打滑时会测错；
- 每 2 秒来一次绝对位置（比如激光雷达定位），噪声 5 cm。
用法：python kalman.py     # 结果写到 out/
"""
import argparse
import csv
import os

import numpy as np

DT = 0.005            # 200 Hz
T_END = 30.0
ACC_NOISE = 0.05      # IMU 加速度噪声（m/s²）
ACC_BIAS = 0.08       # IMU 零偏（m/s²），滤波器事先不知道
VEL_NOISE = 0.05      # 腿式里程计速度噪声（m/s）
POS_NOISE = 0.05      # 绝对位置噪声（m）
SLIPS = [(8.0, 8.4), (15.0, 15.5), (22.0, 22.3)]   # 打滑的时间段（s）
SLIP_ERR = 0.8        # 打滑时速度测量多出来的误差（m/s）


def truth():
    """真实运动：加速到 1 m/s，巡航时速度有起伏，最后减速停下。"""
    t = np.arange(0, T_END, DT)
    v = np.clip(t / 3.0, 0, 1) * np.clip((T_END - 2 - t) / 3.0, 0, 1) * (1.0 + 0.2 * np.sin(0.8 * t))
    a = np.gradient(v, DT)
    p = np.cumsum(v) * DT
    return t, p, v, a


def sensors(t, p, v, a, rng):
    imu = a + ACC_BIAS + rng.normal(0, ACC_NOISE, len(t))
    leg = v + rng.normal(0, VEL_NOISE, len(t))
    slipping = np.zeros(len(t), bool)
    for s, e in SLIPS:
        slipping |= (t >= s) & (t < e)
    leg[slipping] += SLIP_ERR
    fix_idx = np.arange(0, len(t), int(2.0 / DT))[1:]
    fix = p[fix_idx] + rng.normal(0, POS_NOISE, len(fix_idx))
    return imu, leg, slipping, dict(zip(fix_idx, fix))


def kalman(imu, leg, fixes, gate=None, r_vel=VEL_NOISE ** 2):
    """状态 x = [位置, 速度, 加速度零偏]。用 IMU 做预测，用腿速和绝对位置做更新。
    gate：卡方门限，新息的马氏距离平方超过它就当成打滑，丢掉这次腿速测量。"""
    F = np.array([[1, DT, -0.5 * DT ** 2], [0, 1, -DT], [0, 0, 1]])
    Bu = np.array([0.5 * DT ** 2, DT, 0])
    Q = np.diag([0.0, ACC_NOISE ** 2 * DT, 1e-8])     # 加速度噪声进速度，零偏允许极慢地漂
    H_v, H_p = np.array([[0, 1, 0]]), np.array([[1, 0, 0]])
    x, P = np.zeros(3), np.diag([0.01, 0.01, 0.1 ** 2])
    out, rejected = [], 0
    for k in range(len(imu)):
        x = F @ x + Bu * imu[k]                      # 预测
        P = F @ P @ F.T + Q
        for H, z, R in [(H_v, leg[k], r_vel)] + ([(H_p, fixes[k], POS_NOISE ** 2)] if k in fixes else []):
            y = z - (H @ x)[0]                       # 新息
            S = (H @ P @ H.T)[0, 0] + R
            if gate is not None and H is H_v and y * y / S > gate:
                rejected += 1
                continue
            K = (P @ H.T / S).ravel()
            x = x + K * y
            P = (np.eye(3) - np.outer(K, H)) @ P
        out.append(x.copy())
    return np.array(out), rejected


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="out")
    ap.add_argument("--seed", type=int, default=0)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    rng = np.random.default_rng(a.seed)
    t, p, v, acc = truth()
    imu, leg, slipping, fixes = sensors(t, p, v, acc, rng)

    est = {
        "imu_only": np.cumsum(np.cumsum(imu) * DT) * DT,      # IMU 两次积分
        "leg_only": np.cumsum(leg) * DT,                     # 腿速积分
    }
    kf, _ = kalman(imu, leg, fixes)
    kf_gate, n_rej = kalman(imu, leg, fixes, gate=9.0)      # 9 = 一维卡方分布 99.7% 分位，约等于 3σ
    est["kf"], est["kf_gated"] = kf[:, 0], kf_gate[:, 0]

    print(f"{'estimator':10} {'pos_rmse':>9} {'final_err':>9} {'vel_rmse_slip':>13}")
    for name, pe in est.items():
        ve = {"kf": kf[:, 1], "kf_gated": kf_gate[:, 1]}.get(name)
        vr = f"{np.sqrt(np.mean((ve[slipping] - v[slipping]) ** 2)):13.3f}" if ve is not None else f"{'-':>13}"
        print(f"{name:10} {np.sqrt(np.mean((pe - p) ** 2)):9.3f} {abs(pe[-1] - p[-1]):9.3f} {vr}")
    print(f"bias estimate: no gate {kf[-1, 2]:.3f}, gated {kf_gate[-1, 2]:.3f} (true {ACC_BIAS})")
    print(f"gated KF rejected {n_rej} leg-velocity samples; slipping samples = {slipping.sum()}")

    with open(os.path.join(a.out, "kalman.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["t", "p_true", "v_true", "p_imu", "p_leg", "p_kf", "p_kfg", "v_leg", "v_kf", "v_kfg", "slip"])
        for k in range(0, len(t), 4):        # 每 20 ms 存一行
            w.writerow([round(t[k], 3), round(p[k], 4), round(v[k], 4), round(est["imu_only"][k], 4),
                        round(est["leg_only"][k], 4), round(kf[k, 0], 4), round(kf_gate[k, 0], 4),
                        round(leg[k], 4), round(kf[k, 1], 4), round(kf_gate[k, 1], 4), int(slipping[k])])


if __name__ == "__main__":
    main()
