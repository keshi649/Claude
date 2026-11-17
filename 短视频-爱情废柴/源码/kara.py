#!/usr/bin/env python3
"""从原 MV 的卡拉 OK 字幕量每一段歌词的擦色进度（未唱：黑字白边；唱过：蓝字白边）。
用法：python3 kara.py audio/song.mp4 out/kara_raw.json
字幕分上下两行，各自独立换词。每行逐帧记：蓝色像素的最左、最右一列和数量。"""
import subprocess, sys, json, numpy as np
src, out = sys.argv[1], sys.argv[2]
W, Y0, H, FPS = 960, 376, 132, 30
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'crop={W}:{H}:0:{Y0}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
rows = {'A': (6, 62), 'B': (66, 126)}          # 相对 Y0：上行、下行
res = {k: [] for k in rows}; ysum = np.zeros(H); n = 0
while True:
    b = p.stdout.read(W * H * 3)
    if len(b) < W * H * 3: break
    f = np.frombuffer(b, np.uint8).reshape(H, W, 3).astype(np.int16)
    r, g, bl = f[..., 0], f[..., 1], f[..., 2]
    blue = (bl > 170) & (r < 110) & (bl - g > 70) & (bl - r > 110)
    ysum += blue.sum(1)
    for k, (a, c) in rows.items():
        cols = blue[a:c].sum(0); idx = np.nonzero(cols >= 3)[0]
        res[k].append([int(idx[0]), int(idx[-1]), int(cols.sum())] if len(idx) >= 4 else [-1, -1, 0])
    n += 1
json.dump({'fps': FPS, 'n': n, 'rows': res, 'ysum': ysum.tolist()}, open(out, 'w'))
print('frames', n); print('blue by y:', [int(v / 1000) for v in ysum])
