"""把各项目跑出来的原始结果整理成画图用的小 CSV（给 pgfplots 读）。

用法：python 图/data/prepare.py 结果根目录
结果根目录下应有 p1/ p2/ p3/ p4/ p5/ p6/ 六个子目录，分别是各项目 --out 指定的输出目录。
"""
import csv
import os
import sys

import numpy as np

ROOT = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))


def read(path):
    with open(path) as f:
        r = csv.reader(f)
        head = next(r)
        return head, np.array([[float(x) for x in row] for row in r])


def write(name, head, rows):
    with open(os.path.join(HERE, name), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(head)
        w.writerows(rows)


# 项目一：机身高度（每 10 ms 一个点）；延迟时的膝关节角（2.0–2.2 s，每 2 ms）
cols = []
for cfg in ["kp10_kd0.5_delay0", "kp40_kd1_delay0", "kp100_kd2_delay0", "kp300_kd3_delay0"]:
    h, d = read(os.path.join(ROOT, "p1", cfg + ".csv"))
    cols.append(d[::5, 1])
t = d[::5, 0]
write("p1_height.csv", ["t", "kp10", "kp40", "kp100", "kp300"], np.column_stack([t] + cols).round(4))
rows = []
for cfg in ["kp300_kd3_delay5", "kp300_kd8_delay5"]:
    h, d = read(os.path.join(ROOT, "p1", cfg + ".csv"))
    m = (d[:, 0] >= 2.0) & (d[:, 0] <= 2.2)
    rows.append(np.degrees(d[m, 3]))
write("p1_delay.csv", ["t", "kd3", "kd8", "target"],
      np.column_stack([d[m, 0], rows[0], rows[1], np.degrees(d[m, 2])]).round(3))

# 项目二：摆角和小车位置
for name in ["pid", "lqr", "lqr_delay80ms", "lqr_delay100ms"]:
    h, d = read(os.path.join(ROOT, "p2", name + ".csv"))
    write(f"p2_{name}.csv", ["t", "x", "theta_deg"], np.column_stack([d[:, 0], d[:, 1], np.degrees(d[:, 2])])[::2].round(4))

# 项目三：学习曲线（每 5 万步一个点，三个种子取平均）和测试结果
bins = np.arange(0, 1_000_001, 50_000)
curves = {}
for pol in ["nodr", "dr"]:
    per_seed = []
    for seed in (1, 2, 3):
        h, d = read(os.path.join(ROOT, "p3", f"Hopper-v5_{pol}_seed{seed}_curve.csv"))
        idx = np.digitize(d[:, 0], bins)
        per_seed.append([d[idx == i, 1].mean() if np.any(idx == i) else np.nan for i in range(1, len(bins))])
    curves[pol] = np.nanmean(np.array(per_seed), axis=0)
write("p3_curve.csv", ["step", "nodr", "dr"], np.column_stack([bins[1:], curves["nodr"], curves["dr"]]).round(1))
with open(os.path.join(ROOT, "p3", "eval.csv")) as f:
    r = list(csv.DictReader(f))
out = []
for case in ["nominal", "heavy_torso_x1.5", "slippery_x0.5", "weak_motor_x0.8"]:
    row = [case]
    for pol in ["nodr", "dr"]:
        v = [float(x["mean"]) for x in r if x["case"] == case and x["policy"] == pol]
        row += [round(np.mean(v), 1), round(min(v), 1), round(max(v), 1)]
    out.append(row)
write("p3_eval.csv", ["case", "nodr", "nodr_min", "nodr_max", "dr", "dr_min", "dr_max"], out)

# 项目四：位置误差（每 0.1 s）
h, d = read(os.path.join(ROOT, "p4", "kalman.csv"))
c = {k: i for i, k in enumerate(h)}
err = lambda k: np.abs(d[:, c[k]] - d[:, c["p_true"]])
write("p4_err.csv", ["t", "leg", "kf", "kfg", "slip"],
      np.column_stack([d[:, 0], err("p_leg"), err("p_kf"), err("p_kfg"), d[:, c["slip"]]])[::5].round(4))

# 项目五：关节速度（对数轴，下限 1e-3）
for name in ["pinv", "dls"]:
    h, d = read(os.path.join(ROOT, "p5", f"line_{name}.csv"))
    write(f"p5_{name}.csv", ["t", "err_mm", "speed", "sigma"],
          np.column_stack([d[:, 0], d[:, 1] * 1000, np.maximum(d[:, 2], 1e-3), d[:, 3]]).round(5))

# 项目六：轨迹
with open(os.path.join(ROOT, "p6", "paths.csv")) as f:
    rows = list(csv.DictReader(f))
for pol in ["mse", "classify", "chunk", "expert"]:
    for sy in sorted({r["start_y"] for r in rows if r["policy"] == pol}):
        pts = [(r["x"], r["y"]) for r in rows if r["policy"] == pol and r["start_y"] == sy]
        write(f"p6_{pol}_{float(sy):+.1f}.csv", ["x", "y"], pts)
print("done:", sorted(os.listdir(HERE)))
