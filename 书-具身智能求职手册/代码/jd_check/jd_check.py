"""第 3 章的工具：统计一批招聘启事里各项技能出现的次数，和你自己的技能对照，列出差距。

用法：
  python jd_check.py --jd 我收集的启事.txt --me 我的技能.txt
  python jd_check.py --jd 示例启事.txt --me 我的技能-示例.txt      # 先拿示例跑一遍
启事文件：把每条启事的全文复制进来，启事之间用单独一行 --- 隔开。
技能文件：一行写一项你会的技能，写法随意（"ROS2""ROS 2""ros"都认）。
"""
import argparse
import re
import unicodedata
from collections import Counter

# 技能词表：名称 -> 正则（不区分大小写）。想加新词，照着格式往里添。
SKILLS = {
    # 编程与系统
    "C++": r"c\+\+|cpp", "Python": r"python", "CUDA": r"cuda", "Linux": r"linux",
    "多线程/并发": r"多线程|并发|线程池", "实时系统": r"实时系统|实时性|rtos|freertos|实时操作系统|xenomai|preempt",
    "ROS/ROS 2": r"\bros\s?2?\b|ros1|ros2", "DDS": r"\bdds\b|cyclonedds|fastdds", "Docker": r"docker|容器",
    "Git": r"\bgit\b", "数据结构与算法": r"数据结构|leetcode|算法题",
    # 机器人基础
    "运动学": r"运动学|kinematics|\bfk\b|\bik\b|正逆解", "动力学": r"动力学|dynamics",
    "坐标变换/旋转表示": r"坐标变换|四元数|旋转矩阵|李群|李代数|\btf\b",
    "轨迹/运动规划": r"轨迹规划|运动规划|motion planning|轨迹优化", "路径规划/导航": r"路径规划|导航|navigation|nav2",
    # 控制
    "PID": r"\bpid\b", "LQR": r"\blqr\b", "MPC": r"\bmpc\b|模型预测控制", "WBC": r"\bwbc\b|全身控制|whole[- ]body",
    "力控/阻抗控制": r"力控|阻抗控制|导纳控制|impedance", "状态估计": r"状态估计|卡尔曼|kalman|\bekf\b|\bukf\b|滤波",
    "足式/人形运控": r"足式|四足|双足|人形|腿足|legged|humanoid|步态",
    # 学习
    "强化学习": r"强化学习|\brl\b|reinforcement", "PPO/SAC": r"\bppo\b|\bsac\b|\btd3\b",
    "模仿学习": r"模仿学习|imitation|行为克隆|behavior cloning|\bbc\b|dagger",
    "扩散策略/ACT": r"diffusion policy|扩散策略|\bact\b|action chunk|动作分块",
    "VLA/具身大模型": r"\bvla\b|vision-language-action|具身大模型|\brt-2\b|openvla|π0|pi0",
    "大模型/VLM": r"大模型|\bllm\b|\bvlm\b|多模态大模型|transformer", "世界模型": r"世界模型|world model",
    "Sim2Real": r"sim2real|sim-to-real|仿真到真机|虚实迁移", "域随机化": r"域随机化|domain randomization",
    "遥操作": r"遥操作|teleop", "PyTorch": r"pytorch|torch", "JAX": r"\bjax\b",
    # 仿真
    "MuJoCo": r"mujoco", "Isaac Gym/Sim/Lab": r"isaac", "Gazebo": r"gazebo", "PyBullet": r"pybullet",
    # 感知
    "SLAM": r"slam|建图|定位", "激光雷达/点云": r"激光雷达|lidar|点云|point cloud|pcl", "视觉/深度相机": r"视觉|相机|camera|rgb-?d|深度估计|opencv",
    "标定": r"标定|calibration", "传感器融合": r"传感器融合|多传感器|sensor fusion|imu",
    # 硬件
    "嵌入式": r"嵌入式|单片机|\bmcu\b|stm32|arm cortex", "电机控制/FOC": r"\bfoc\b|电机控制|电机驱动|永磁同步|无刷|bldc|pmsm",
    "总线(CAN/EtherCAT)": r"\bcan\b|canopen|ethercat|rs-?485|总线", "电路/PCB": r"\bpcb\b|原理图|电路设计|硬件设计|emc",
    "电池/电源": r"\bbms\b|电池|电源", "机械设计/CAD": r"solidworks|\bcad\b|creo|ug\b|nx\b|结构设计|机械设计",
    "有限元/仿真分析": r"有限元|ansys|abaqus|\bfea\b", "减速器/关节": r"减速器|谐波|行星|关节模组|执行器",
    # 数据与工程
    "数据采集/标注": r"数据采集|数采|标注", "数据管线": r"数据管线|data pipeline|etl|数据流水线|数据闭环",
    "测试/验证": r"测试|验证|test", "真机调试/部署": r"真机|实机|部署|落地|调试",
    "量产": r"量产|供应链|dfm", "论文/顶会": r"论文|顶会|icra|iros|rss|corl|cvpr|neurips|iclr",
    "竞赛": r"竞赛|robocon|robomaster|比赛",
}

DEGREES = {"本科": r"本科", "硕士": r"硕士|研究生", "博士": r"博士|ph\.?d"}


def pad(s, width):
    """按显示宽度补空格（一个汉字占两格），让终端里的表格对齐。"""
    w = sum(2 if unicodedata.east_asian_width(ch) in "WF" else 1 for ch in s)
    return s + " " * max(width - w, 0)


def load_jds(path):
    text = open(path, encoding="utf-8").read()
    parts = [p.strip() for p in re.split(r"(?m)^\s*-{3,}\s*$", text)]
    return [p for p in parts if p and not p.startswith("#")]


def find_skills(text):
    return {name for name, pat in SKILLS.items() if re.search(pat, text, re.I)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--jd", required=True, help="启事文件，启事之间用 --- 隔开")
    ap.add_argument("--me", help="你的技能，一行一项")
    ap.add_argument("--top", type=int, default=10)
    a = ap.parse_args()
    jds = load_jds(a.jd)
    n = len(jds)
    counts = Counter()
    for jd in jds:
        counts.update(find_skills(jd))
    mine = set()
    if a.me:
        for line in open(a.me, encoding="utf-8"):
            if line.strip() and not line.startswith("#"):
                mine |= find_skills(line.strip())

    print(f"共 {n} 条启事\n")
    print(f"{pad('技能', 20)}{pad('出现', 6)}{pad('占比', 6)}你有吗")
    for name, c in counts.most_common():
        print(f"{pad(name, 20)}{pad(str(c), 6)}{pad(f'{c / n:.0%}', 6)}{'✓' if name in mine else ('✗' if a.me else '')}")
    if a.me:
        gaps = [(name, c) for name, c in counts.most_common() if name not in mine]
        print(f"\n你最该补的 {a.top} 项（按出现次数排）：")
        for i, (name, c) in enumerate(gaps[: a.top], 1):
            print(f"  {i:>2}. {name}（{c}/{n} 条启事提到）")
        covered = sum(1 for jd in jds if len(find_skills(jd) & mine) >= 0.6 * max(len(find_skills(jd)), 1))
        print(f"\n你已经覆盖六成以上要求的启事：{covered}/{n} 条")
    print("\n学历：")
    for deg, pat in DEGREES.items():
        print(f"  提到{deg}：{sum(1 for jd in jds if re.search(pat, jd, re.I))}/{n} 条")
    years = [int(y) for jd in jds for y in re.findall(r"(\d+)\s*年(?:以上)?[^，。；,;\n]{0,8}?经验", jd)]
    if years:
        print(f"  提到工作年限的 {len(years)} 处，中位数 {sorted(years)[len(years) // 2]} 年")


if __name__ == "__main__":
    main()
