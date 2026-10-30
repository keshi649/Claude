"""项目二：小车倒立摆，比较"只管摆角的 PID"和"全状态 LQR"，再看模型不准、有延迟时谁更稳。

用法：python cartpole.py            # 跑全部对照，结果写到 out/
动力学用的是 Barto 等人 1983 年的经典小车倒立摆方程（均匀细杆，l 为半杆长），RK4 积分。
"""
import argparse
import csv
import os

import numpy as np
from scipy.linalg import solve_continuous_are

G = 9.81
P = dict(M=1.0, m=0.1, l=0.5)   # 小车 1 kg，杆 0.1 kg，半杆长 0.5 m
F_MAX = 10.0                     # 电机最大推力 10 N
DT_SIM, DT_CTRL = 0.001, 0.005   # 仿真 1 kHz，控制 200 Hz


def deriv(s, f, M, m, l):
    """s = [x, x_dot, theta, theta_dot]，theta = 0 表示杆竖直向上。"""
    x, xd, th, thd = s
    sin, cos = np.sin(th), np.cos(th)
    tmp = (f + m * l * thd ** 2 * sin) / (M + m)
    thdd = (G * sin - cos * tmp) / (l * (4.0 / 3.0 - m * cos ** 2 / (M + m)))
    xdd = tmp - m * l * thdd * cos / (M + m)
    return np.array([xd, xdd, thd, thdd])


def rk4(s, f, dt, **p):
    k1 = deriv(s, f, **p)
    k2 = deriv(s + dt / 2 * k1, f, **p)
    k3 = deriv(s + dt / 2 * k2, f, **p)
    k4 = deriv(s + dt * k3, f, **p)
    return s + dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4)


def lqr_gain(M, m, l, Q, R):
    """在竖直位置线性化，解连续时间 Riccati 方程，得到 u = -K s。"""
    den = l * (4.0 / 3.0 - m / (M + m))
    A = np.array([[0, 1, 0, 0],
                  [0, 0, -m * l * (G / den) / (M + m), 0],
                  [0, 0, 0, 1],
                  [0, 0, G / den, 0]])
    B = np.array([[0],
                  [1 / (M + m) + m * l / ((M + m) ** 2 * den)],
                  [0],
                  [-1 / ((M + m) * den)]])
    Pm = solve_continuous_are(A, B, Q, np.array([[R]]))
    return (B.T @ Pm / R).ravel()


class PID:
    """只看摆角。kp、ki、kd 都作用在 theta 上。"""
    def __init__(self, kp, ki, kd):
        self.kp, self.ki, self.kd, self.i = kp, ki, kd, 0.0

    def __call__(self, s):
        self.i += s[2] * DT_CTRL
        return self.kp * s[2] + self.ki * self.i + self.kd * s[3]


class LQR:
    def __init__(self, K):
        self.K = K

    def __call__(self, s):
        return -self.K @ s


def simulate(ctrl, plant=P, delay=0.0, t_total=8.0, push_at=2.0, push=8.0):
    """从 theta=0.1 rad 起步；push_at 秒时给小车 0.1 s、push 牛的侧推。delay 是控制延迟（秒）。"""
    s = np.array([0.0, 0.0, 0.1, 0.0])
    n_delay = int(round(delay / DT_CTRL))
    queue = [0.0] * n_delay
    f, rows = 0.0, []
    steps_per_ctrl = int(round(DT_CTRL / DT_SIM))
    for k in range(int(t_total / DT_SIM)):
        t = k * DT_SIM
        if k % steps_per_ctrl == 0:
            queue.append(float(np.clip(ctrl(s), -F_MAX, F_MAX)))
            f = queue.pop(0)
        dist = push if push_at <= t < push_at + 0.1 else 0.0
        s = rk4(s, f + dist, DT_SIM, **plant)
        rows.append((t, s[0], s[2], f))
        if abs(s[2]) > 1.0:          # 倒了就停
            break
    return np.array(rows)


def summarize(r, t_total=8.0):
    fell = r[-1, 0] < t_total - 0.01
    return {"fell": fell, "max_theta_deg": np.degrees(np.abs(r[:, 2]).max()),
            "final_x_m": r[-1, 1], "max_x_m": np.abs(r[:, 1]).max()}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="out")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)

    K = lqr_gain(**P, Q=np.diag([1.0, 1.0, 10.0, 1.0]), R=0.1)
    print("LQR K =", np.round(K, 2))
    heavy = dict(M=1.0, m=0.5, l=0.5)    # 实际的杆是模型的 5 倍重

    cases = {
        "pid": (lambda: PID(40.0, 0.0, 4.0), P, 0.0),         # 只管摆角
        "lqr": (lambda: LQR(K), P, 0.0),                      # 全状态
        "lqr_heavy_pole": (lambda: LQR(K), heavy, 0.0),       # 模型不准
        "lqr_delay80ms": (lambda: LQR(K), P, 0.080),          # 有延迟
        "lqr_delay100ms": (lambda: LQR(K), P, 0.100),
    }
    print(f"{'case':16} {'fell':>5} {'max_theta':>9} {'max_x':>6} {'final_x':>7}")
    for name, (make, plant, delay) in cases.items():
        r = simulate(make(), plant, delay)
        sm = summarize(r)
        print(f"{name:16} {str(sm['fell']):>5} {sm['max_theta_deg']:8.1f}° {sm['max_x_m']:6.2f} {sm['final_x_m']:7.2f}")
        with open(os.path.join(a.out, name + ".csv"), "w", newline="") as f:
            w = csv.writer(f)
            w.writerow(["t", "x", "theta", "force"])
            w.writerows(r[::10].round(5))   # 每 10 ms 存一行


if __name__ == "__main__":
    main()
