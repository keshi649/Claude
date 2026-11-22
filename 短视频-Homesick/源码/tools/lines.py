# 读歌词视频高亮那一行：10fps 截出高亮条，找出"停稳"的段，每段存一张图
import subprocess, numpy as np, sys, os
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
X, Y, W, H = 660, 296, 540, 80
FPS = 10
cmd = ['ffmpeg', '-loglevel', 'error', '-i', src, '-vf', f'fps={FPS},crop={W}:{H}:{X}:{Y},format=gray', '-f', 'rawvideo', '-']
raw = subprocess.run(cmd, capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W)
print('frames', len(fr))
b = (fr > 200).astype(np.int16)   # 亮白像素
d = np.abs(np.diff(b, axis=0)).sum(axis=(1, 2))
np.save(os.path.join(out, 'd.npy'), d)
# 稳定段：相邻帧差 < 阈值
th = 40
segs = []
s = None
for i in range(len(d)):
    if d[i] < th:
        if s is None: s = i
    else:
        if s is not None and i - s >= 3: segs.append((s, i))
        s = None
if s is not None: segs.append((s, len(d)))
print('segs', len(segs))
# 合并：同一内容（和上一段的代表帧差很小）
reps = []
for (a, z) in segs:
    m = (a + z) // 2
    if reps and np.abs(b[m] - b[reps[-1][2]]).sum() < 150:
        reps[-1] = (reps[-1][0], z, reps[-1][2])
        continue
    reps.append((a, z, m))
with open(os.path.join(out, 'segs.txt'), 'w') as f:
    for k, (a, z, m) in enumerate(reps):
        f.write(f'{k}\t{a/FPS:.1f}\t{z/FPS:.1f}\t{b[m].sum()}\n')
        Image.fromarray(fr[m]).save(os.path.join(out, f'L{k:03d}.png'))
print('lines', len(reps))
