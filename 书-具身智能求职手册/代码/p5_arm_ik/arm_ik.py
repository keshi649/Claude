"""项目五：六轴机械臂（UR5e 的 DH 参数）的正运动学、雅可比和数值逆运动学。

1. 用 DH 参数写正运动学；
2. 用几何法求雅可比，再用有限差分核对；
3. 让末端沿直线往外伸到够不着的地方，用"伪逆"和"阻尼最小二乘"两种方法解逆运动学，比较接近奇异位形时的关节速度。
用法：python arm_ik.py     # 结果写到 out/
"""
import argparse
import csv
import os

import numpy as np

# UR5e 的标准 DH 参数（单位 m、rad），来自 Universal Robots 公开的运动学参数
A = np.array([0.0, -0.425, -0.3922, 0.0, 0.0, 0.0])
D = np.array([0.1625, 0.0, 0.0, 0.1333, 0.0997, 0.0996])
ALPHA = np.array([np.pi / 2, 0.0, 0.0, np.pi / 2, -np.pi / 2, 0.0])


def dh(a, d, alpha, theta):
    ct, st, ca, sa = np.cos(theta), np.sin(theta), np.cos(alpha), np.sin(alpha)
    return np.array([[ct, -st * ca, st * sa, a * ct],
                     [st, ct * ca, -ct * sa, a * st],
                     [0, sa, ca, d],
                     [0, 0, 0, 1]])


def fk_all(q):
    """返回基座到每个关节坐标系的变换，T[0] 是基座，T[6] 是末端法兰。"""
    T = [np.eye(4)]
    for i in range(6):
        T.append(T[-1] @ dh(A[i], D[i], ALPHA[i], q[i]))
    return T


def fk(q):
    return fk_all(q)[-1]


def jacobian(q):
    """几何雅可比（6×6）：上三行线速度，下三行角速度。每个关节都是转动关节。"""
    T = fk_all(q)
    p_end = T[-1][:3, 3]
    J = np.zeros((6, 6))
    for i in range(6):
        z, p = T[i][:3, 2], T[i][:3, 3]
        J[:3, i] = np.cross(z, p_end - p)
        J[3:, i] = z
    return J


def rot_err(R_des, R):
    """姿态误差：用轴角表示的 R_des·Rᵀ（小角度时约等于角速度方向 × 角度）。"""
    Re = R_des @ R.T
    angle = np.arccos(np.clip((np.trace(Re) - 1) / 2, -1, 1))
    if angle < 1e-9:
        return np.zeros(3)
    axis = np.array([Re[2, 1] - Re[1, 2], Re[0, 2] - Re[2, 0], Re[1, 0] - Re[0, 1]]) / (2 * np.sin(angle))
    return axis * angle


def ik_step(q, T_des, damping):
    """一步数值逆运动学。damping=0 就是普通伪逆；>0 就是阻尼最小二乘（Levenberg–Marquardt）。"""
    T = fk(q)
    e = np.concatenate([T_des[:3, 3] - T[:3, 3], rot_err(T_des[:3, :3], T[:3, :3])])
    J = jacobian(q)
    if damping == 0:
        dq = np.linalg.pinv(J) @ e
    else:
        dq = J.T @ np.linalg.solve(J @ J.T + damping ** 2 * np.eye(6), e)
    return dq, np.linalg.norm(e[:3])


def check_jacobian(rng):
    """用有限差分核对几何雅可比的线速度部分。"""
    worst = 0.0
    for _ in range(100):
        q = rng.uniform(-np.pi, np.pi, 6)
        J = jacobian(q)
        for i in range(6):
            dq = np.zeros(6); dq[i] = 1e-6
            num = (fk(q + dq)[:3, 3] - fk(q - dq)[:3, 3]) / 2e-6
            worst = max(worst, np.abs(num - J[:3, i]).max())
    return worst


def track_line(damping, steps=300, overshoot=0.01):
    """末端姿态不变，沿着"远离肩膀"的直线往外伸，一直伸到比手臂够得着的位置还远 overshoot 米。
    手臂越接近伸直，雅可比越接近奇异：这正是伪逆最容易出事的地方。"""
    q = np.array([0.0, -1.0, 1.4, -1.97, -1.57, 0.0])
    T0 = fk(q)
    shoulder = fk_all(q)[1][:3, 3]
    u = T0[:3, 3] - shoulder
    dist0 = np.linalg.norm(u); u = u / dist0
    reach = abs(A[1]) + abs(A[2]) + 0.10          # 大致的最远距离（大臂 + 小臂 + 手腕）
    length = reach - dist0 + overshoot
    rows, dt = [], 0.01
    for k in range(steps):
        T_des = T0.copy()
        T_des[:3, 3] = T0[:3, 3] + u * length * k / (steps - 1)
        q_prev = q.copy()
        for _ in range(5):                           # 每个控制周期最多迭代 5 次
            dq, err = ik_step(q, T_des, damping)
            q = q + dq
        speed = np.abs(q - q_prev).max() / dt         # 这一个周期里关节转得最快的那个，rad/s
        sv = np.linalg.svd(jacobian(q), compute_uv=False)
        rows.append((k * dt, err, speed, sv.min()))
    return np.array(rows)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="out")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    rng = np.random.default_rng(0)
    print(f"jacobian check: max |numeric - analytic| = {check_jacobian(rng):.2e}")
    # 一个已知位姿：全零关节角时末端在哪
    print("FK at q=0:", np.round(fk(np.zeros(6))[:3, 3], 4))
    for name, lam in [("pinv", 0.0), ("dls", 0.05)]:
        r = track_line(lam)
        print(f"{name:5} max pos err {r[:, 1].max() * 1000:7.2f} mm   max joint speed {r[:, 2].max():8.2f} rad/s"
              f"   min singular value {r[:, 3].min():.4f}")
        with open(os.path.join(a.out, f"line_{name}.csv"), "w", newline="") as f:
            w = csv.writer(f); w.writerow(["t", "pos_err_m", "max_joint_speed", "min_singular_value"])
            w.writerows(r.round(6))


if __name__ == "__main__":
    main()
