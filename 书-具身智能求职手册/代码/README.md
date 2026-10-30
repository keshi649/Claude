# 《具身智能求职手册》随书代码

书里每一张结果图、每一个数字都来自这里的代码。全部在一台 4 核 CPU、没有显卡的 Linux 机器上跑过（Python 3.13）。

| 目录 | 对应章节 | 回答什么问题 | 运行时间（4 核 CPU） |
|---|---|---|---|
| `jd_check/` | 第 3 章 | 一批招聘启事里哪些技能最常见，我缺哪些 | 不到 1 秒 |
| `p1_stand/` | 第 11 章项目一 | kp、kd 和控制延迟怎么影响机器狗站立 | 约 3 秒 |
| `p2_cartpole/` | 第 11 章项目二 | PID 和 LQR 有什么区别，延迟多大会倒 | 约 1 秒 |
| `p3_ppo/` | 第 11 章项目三 | 域随机化到底有没有用 | 一次训练约 13.5 分钟；完整对照约半小时 |
| `p4_kalman/` | 第 12 章项目四 | 脚打滑时卡尔曼滤波怎么办 | 不到 1 秒 |
| `p5_arm_ik/` | 第 12 章项目五 | 接近奇异时伪逆和阻尼最小二乘差多少 | 约 1 秒 |
| `p6_multimodal_bc/` | 第 12 章项目六 | 示范有两种做法时，行为克隆会怎样 | 40 条示范约 2 分钟，200 条约 13 分钟 |
| `模板/` | 附录 D | 简历、项目 README、复盘表、投递记录、岗位打分和 offer 比较 | — |

## 准备环境

```bash
python3 -m venv venv && source venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu   # CPU 版，先装
pip install -r requirements.txt
git clone https://github.com/google-deepmind/mujoco_menagerie.git ~/mujoco_menagerie   # 项目一要用 Go2 模型
```

版本都写死在 `requirements.txt` 里。换了版本，数字可能有小的出入，结论不应该变；如果结论变了，那本身就是一个值得写进 README 的发现。

下面每个项目都给了命令和应该看到的输出，跑完对一下。

## jd_check：招聘启事差距清单（第 3 章）

```bash
cd jd_check
python jd_check.py --jd 示例启事.txt --me 我的技能-示例.txt
```

`示例启事.txt` 是按常见写法改写的 10 条启事，`我的技能-示例.txt` 是一位虚构的自动驾驶感知工程师。换成你自己收集的启事（20 条以上，用 `---` 隔开）和你自己的技能（一行一项）再跑。输出：每项技能在多少条启事里出现、你缺的前十项、学历要求、年限要求的中位数。

## 项目一：让 Go2 站起来（第 11 章）

```bash
cd p1_stand
python stand.py --model ~/mujoco_menagerie/unitree_go2/scene.xml --out out
```

不加 `--kp/--kd/--delay` 就跑书里的六组对照，结果 CSV 和 `stand.png` 写进 `out/`。应该看到：

```text
   kp   kd delay | height knee_err    sag jitter max_tau sat_ms
   10  0.5     0 |  0.151    34.96   18.0   0.35     7.4      0
   40    1     0 |  0.241     8.23   17.6   0.01     8.9      0
  100    2     0 |  0.264     3.33    5.9   0.00    14.7      0
  300    3     0 |  0.272     1.08    2.3   0.00    27.8      0
  300    3     5 |  0.272     1.11    2.3   0.00    33.1      0
  300    8     5 |  0.269     2.89    4.2   1.46    45.4   4823
```

height 是站稳后的机身高度（米），knee_err 是膝关节误差（度），sag 是压 60 牛时的下沉（毫米），sat_ms 是 5 秒里力矩顶到上限的毫秒数。最后一行就是“延迟 5 毫秒、kd 加到 8 反而抖”。

## 项目二：倒立摆，PID 和 LQR（第 11 章）

```bash
cd p2_cartpole
python cartpole.py --out out
```

```text
LQR K = [ -3.16  -5.91 -49.54 -12.85]
case              fell max_theta  max_x final_x
pid              False      5.9°   0.46   -0.46
lqr              False      5.7°   0.20   -0.00
lqr_heavy_pole   False      5.7°   0.21   -0.00
lqr_delay80ms    False      8.2°   0.21   -0.00
lqr_delay100ms    True     57.4°   2.36   -2.36
```

## 项目三：PPO 训练 Hopper，对照域随机化（第 11 章）

单跑一次（约 13.5 分钟）：

```bash
cd p3_ppo
python ppo.py --seed 1 --dr --out runs          # 去掉 --dr 就是不加域随机化
python ppo.py --eval runs/Hopper-v5_dr_seed1.pt  # 在四种环境里各测 20 回合
```

书里的完整对照（3 个种子 × 加不加域随机化，同时跑 3 个进程，约半小时）：

```bash
bash run_all.sh runs        # 最后打印 runs/eval.csv
```

三个种子的平均分应该接近下表（强化学习对机器和线程数敏感，换一台机器会有出入，但“域随机化在原始环境差不多、在变化后的环境好得多”这个结论应该成立）：

| 测试环境 | 不加域随机化 | 加域随机化 |
|---|---|---|
| 原始环境 | 2,792 | 2,696 |
| 躯干重 1.5 倍 | 1,031 | 1,680 |
| 摩擦减半 | 364 | 691 |
| 电机力气八成 | 427 | 1,327 |

## 项目四：卡尔曼滤波融合 IMU 和腿式里程计（第 12 章）

```bash
cd p4_kalman
python kalman.py --out out
```

```text
estimator   pos_rmse final_err vel_rmse_slip
imu_only      15.929    35.698             -
leg_only       0.631     0.978             -
kf             0.341     0.392         0.698
kf_gated       0.012     0.007         0.011
bias estimate: no gate 0.083, gated 0.079 (true 0.08)
gated KF rejected 256 leg-velocity samples; slipping samples = 240
```

## 项目五：机械臂逆运动学（第 12 章）

```bash
cd p5_arm_ik
python arm_ik.py --out out
```

```text
jacobian check: max |numeric - analytic| = 1.75e-10
FK at q=0: [-0.8172 -0.2329  0.0628]
pinv  max pos err 1570.12 mm   max joint speed  3939.28 rad/s   min singular value 0.0015
dls   max pos err   23.83 mm   max joint speed     2.46 rad/s   min singular value 0.0000
```

## 项目六：模仿学习里的“多峰”问题（第 12 章）

```bash
cd p6_multimodal_bc
python multimodal_bc.py --demos 40 --out out40
python multimodal_bc.py --demos 200 --out out200
```

每次训练三种学生（mse 均方误差回归、classify 方向分类、chunk 动作段分类），从 61 个起点各跑一次。collided 就是书里表 12-3 的“撞了几次”：

```text
# --demos 40
mse       reached 53/61  collided  8  timeout  0
classify  reached 61/61  collided  0  timeout  0
chunk     reached 61/61  collided  0  timeout  0
# --demos 200
mse       reached 53/61  collided  8  timeout  0
classify  reached 56/61  collided  5  timeout  0
chunk     reached 61/61  collided  0  timeout  0
```

## 自己动手改

每个项目在书里都有“可以继续做”。改的时候记住三件事：一次只改一个变量；固定随机种子；把“我原本以为……，结果发现……”写进你自己的 README（附录 D.2 有模板）。

## 许可证

代码的下载地址和许可证在出版时公布（见版权页）。
