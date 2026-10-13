"""看配音里某几个字的声调（音高曲线）。按拼音比对查不出声调错，多音字和有两个读音的字（估、角、调、兴、空……）要用它看一眼。
用法：/home/user/tts/venv/bin/python 工具/tone_check.py 源码目录 编号 字[字...] [--vot]
怎么看（女声，单位 Hz；同一句里前面的字整体偏高）：
  一声：高而平；二声：往上升；三声：低，先降后升（在别的字前面只剩低降）；四声：从高处往下掉。
  例："高估"的"估"该是一声，第一版从 339 掉到 174，像四声 gù；加拼音重合成后在 360~400 之间，平中略升（问句）。
--vot：再打印这个字前后 0.1 秒、每 10 ms 一格的"低频/高频"能量（dB）。
  送气音（t、p、k、q、ch、c）在元音前有 50~80 ms 高频比低频还强的一段；不送气（d、b、g、j、zh、z）只有 10 ms 左右。
  例："调不够"的"调"该念 tiáo（送气 t），diào 是不送气的 d。"""
import json
import os
import sys

import numpy as np
import pyworld as pw
import soundfile as sf
from scipy.signal import butter, sosfilt

src, lid, chs = sys.argv[1], sys.argv[2], sys.argv[3]
base = os.path.join(src, 'voice_cv3', 'n_' + lid)
d = json.load(open(base + '.json', encoding='utf-8'))
x, sr = sf.read(base + '.wav')
x = x.astype(np.float64)
f0, t = pw.harvest(x, sr, frame_period=10)
lo = sosfilt(butter(4, 900, 'low', fs=sr, output='sos'), x)
hi = sosfilt(butter(4, [2500, 8000], 'band', fs=sr, output='sos'), x)
db = lambda v: 10 * np.log10(np.mean(v ** 2) + 1e-12)
print(d['say'])
for c, a, b in d['chars']:
    if c not in chs:
        continue
    sel = (t >= a) & (t <= b + .02) & (f0 > 0)
    print(f"{c} {a:.2f}~{b:.2f}s 音高 {np.round(f0[sel]).astype(int).tolist()}")
    if '--vot' in sys.argv:
        prof = []
        for tt in np.arange(a - .1, a + .12, .01):
            i = int(tt * sr)
            prof.append(f"{tt:.2f}:{db(lo[i:i + 240]):.0f}/{db(hi[i:i + 240]):.0f}")
        print('   低/高频', ' '.join(prof))
