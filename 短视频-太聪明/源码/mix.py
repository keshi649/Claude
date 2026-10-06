"""混音：开头 2 秒夜里房间的环境声（底噪、钟的滴答、远处的车），接原曲，结尾补一点环境声收尾。
原曲本身不做任何改动。用法：python3 mix.py audio/song.wav out/mix.wav"""
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import lfilter

PRE, SR = 2.0, 44100
END_S = 261.6                       # 和 main.js 的 END_S 保持一致
src, dst = sys.argv[1], sys.argv[2]
sr, song = wavfile.read(src)
assert sr == SR
song = song.astype(np.float32) / 32768.0
if song.ndim == 1: song = np.stack([song, song], 1)

n = int((PRE + END_S) * SR)
out = np.zeros((n, 2), np.float32)
rng = np.random.default_rng(419)
t = lambda s: int((s + PRE) * SR)     # 歌曲时间 → 采样点

def add(at, sig, gain=1.0, pan=0.0):
    i = max(0, t(at)); j = min(n, i + len(sig))
    if j <= i: return
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    out[i:j, 0] += sig[:j - i] * gain * l * 1.414
    out[i:j, 1] += sig[:j - i] * gain * r * 1.414

def pink(m):
    # 简单的粉红噪声：白噪声过一个一阶低通
    w = rng.standard_normal(m).astype(np.float32)
    return lfilter([0.05], [1, -0.95], w).astype(np.float32)

# 房间底噪 + 远处的车（-2.0 → 0.6 秒，进歌后淡出）
m = int(2.8 * SR); tt = np.arange(m) / SR
room = pink(m) * np.clip(tt / .8, 0, 1) * np.clip((2.8 - tt) / 1.0, 0, 1)
add(-2.0, room, .5)
car = pink(m) * np.sin(np.clip(tt / 2.8, 0, 1) * np.pi) ** 2
add(-2.0, lfilter([0.02], [1, -0.98], car).astype(np.float32), 3.0, -.4)
# 钟的滴答（每秒一下）
for k, at in enumerate(np.arange(-1.8, 0.3, 1.0)):
    mm = int(.03 * SR); x = rng.standard_normal(mm) * np.exp(-np.arange(mm) / SR / .004)
    x += np.sin(2 * np.pi * 2400 * np.arange(mm) / SR) * np.exp(-np.arange(mm) / SR / .008) * .6
    add(at, x.astype(np.float32), .05 * (1 if k % 2 == 0 else .8), .5)
# 原曲
i = t(0); j = min(n, i + len(song)); out[i:j] += song[:j - i]
# 结尾：歌淡完之后，一点点房间底噪
m = int((END_S - 256.5) * SR); tt = np.arange(m) / SR
tail = pink(m) * np.clip(tt / 1.5, 0, 1) * np.clip((m / SR - tt) / 1.5, 0, 1)
add(256.5, tail, .35)

out = np.clip(out, -1, 1)
wavfile.write(dst, SR, (out * 32767).astype(np.int16))
print('mix', dst, f'{n / SR:.2f}s')
