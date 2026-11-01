"""查成片四边有没有露出黑边：镜头的像素缓冲没盖满画面（锚点挪了、推近时缓冲刚好 1920×1080）时，边上会露出一条纯黑的底色。
底下的那条常常被歌词、字幕挡着，单帧预览看不出来；做封面（不画字）时才发现。渲染完跑一遍，按时刻对回镜头表改缓冲大小。
做法：每秒抽 fps 帧（默认 2），看上、下、左、右各 10 像素宽的一条，九成以上是纯黑（RGB 之和 ≤ 6）就记下来；整帧本来就黑的（片头片尾、黑场）不算。
连在一起的时刻合并成一段打印。故意用纯黑做背景的镜头不受影响：场景里的"黑"一般是 #05060F 这样的深色，不是 0。
用法：python3 工具/edge_check.py 成片.mp4 [每秒几帧]"""
import subprocess, sys
import numpy as np

src = sys.argv[1]; fps = float(sys.argv[2]) if len(sys.argv) > 2 else 2
r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', src], capture_output=True, text=True, check=True)
W, H = map(int, r.stdout.strip().split(','))
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'fps={fps}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
k, hits = 0, []
while True:
    b = p.stdout.read(W * H * 3)
    if len(b) < W * H * 3: break
    a = np.frombuffer(b, np.uint8).reshape(H, W, 3).astype(np.int32).sum(axis=2) <= 6
    sides = [n for n, s in (('上', a[:10]), ('下', a[H - 10:]), ('左', a[:, :10]), ('右', a[:, W - 10:])) if s.mean() > .9]
    if sides and a.mean() < .85: hits.append((k / fps, ''.join(sides)))
    k += 1
spans = []
for t, s in hits:
    if spans and t - spans[-1][1] <= 1.5 / fps and s == spans[-1][2]: spans[-1][1] = t
    else: spans.append([t, t, s])
for a, b_, s in spans: print(f'{a:7.1f} ~ {b_:7.1f} 秒  {s}')
print(f'共查了 {k} 帧，有黑边的 {len(hits)} 帧（{len(spans)} 段）')
