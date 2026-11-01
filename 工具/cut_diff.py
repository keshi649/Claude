"""量转场：每个换镜头的时刻 t，比 t−0.4 秒和 t+0.8 秒两帧的平均差（转场前后），再比 t−1.6 和 t−0.4 秒（同一镜头里 1.2 秒的变化）作对照。
measure.sh 用 ffmpeg 的 scene>0.25 数切镜头，只抓得到硬切；淡入、虚化、甩镜头这类 0.4~0.6 秒的柔和转场，每一帧的变化都不大，一次也数不到。
这时按分镜（镜头表）列出换镜头的时刻，用这个量：转场前后的差要明显大于同一镜头里的差。
用法：python3 工具/cut_diff.py 成片.mp4 时刻1,时刻2,...（成片里的时间，秒）
《起风了》前 20 秒：转场前后 43~55，同一镜头内 4~14（0~255 的平均绝对差，缩到 192×108 再比）。"""
import subprocess
import sys

import numpy as np

src, times = sys.argv[1], [float(x) for x in sys.argv[2].split(',') if x.strip()]


def frame(t):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{max(0, t):.3f}', '-i', src, '-frames:v', '1', '-vf', 'scale=192:108',
                        '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.uint8).reshape(108, 192, 3).astype(float)


for t in times:
    before = frame(t - .4)
    d = np.abs(frame(t + .8) - before).mean()
    c = np.abs(before - frame(t - 1.6)).mean()
    print(f'{t:7.2f} 秒  转场前后差 {d:5.1f}   同一镜头内 {c:5.1f}' + ('' if d > 2 * c and d > 20 else '   ← 不明显'))
