"""混音：开头 3 秒唱片机预备（脚步、马达、唱针落下、底噪），接原曲，结尾补一点唱片空转的底噪。
原曲本身不做任何改动。用法：python3 mix.py audio/song.wav out/mix.wav"""
import sys
import numpy as np
from scipy.io import wavfile

PRE, SR = 3.0, 44100
END_S = 224.4                       # 和 main.js 的 END_S 保持一致
src, dst = sys.argv[1], sys.argv[2]
sr, song = wavfile.read(src)
assert sr == SR
song = song.astype(np.float32) / 32768.0
if song.ndim == 1: song = np.stack([song, song], 1)

n = int((PRE + END_S) * SR)
out = np.zeros((n, 2), np.float32)
rng = np.random.default_rng(23)
t = lambda s: int((s + PRE) * SR)     # 歌曲时间 → 采样点

def env(n_, a, d):
    e = np.exp(-np.arange(n_) / SR / d)
    e[:int(a * SR)] *= np.linspace(0, 1, int(a * SR)) if a > 0 else 1
    return e

def add(at, sig, gain=1.0, pan=0.0):
    i = t(at); j = min(n, i + len(sig))
    if j <= i: return
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    out[i:j, 0] += sig[:j - i] * gain * l * 1.414
    out[i:j, 1] += sig[:j - i] * gain * r * 1.414

# 小烛走进来的脚步（-3 → -1.9 秒）
for k, at in enumerate(np.arange(-2.9, -1.9, .23)):
    m = int(.06 * SR); x = rng.standard_normal(m) * env(m, 0, .012)
    x = np.convolve(x, np.ones(18) / 18, 'same')
    add(at, x, .35, .5 - k * .1)
# 唱机马达启动：低频嗡声慢慢起来
m = int(4.5 * SR); tt = np.arange(m) / SR
hum = (np.sin(2 * np.pi * 50 * tt) * .5 + np.sin(2 * np.pi * 100 * tt) * .2) * np.clip(tt / .8, 0, 1) * np.clip((4.5 - tt) / 2.5, 0, 1)
add(-1.0, hum, .02)
# 唱针落下："咔"
m = int(.12 * SR); x = rng.standard_normal(m) * env(m, 0, .01) + np.sin(2 * np.pi * 180 * np.arange(m) / SR) * env(m, 0, .03)
add(-.55, x, .35)
# 黑胶底噪：落针后响起，进歌之后慢慢退下去；结尾唱片空转时再回来
def crackle(dur, density, gain):
    m = int(dur * SR); x = rng.standard_normal(m) * .02
    pops = rng.random(m) < density / SR
    x[pops] += rng.choice([-1, 1], pops.sum()) * rng.uniform(.3, 1, pops.sum())
    x = np.convolve(x, np.ones(4) / 4, 'same')
    return x * gain
c = crackle(5.0, 40, .08); c *= np.clip((5.0 - np.arange(len(c)) / SR) / 3.5, 0, 1)
add(-.5, c)
c = crackle(END_S - 219.5, 30, .06); c *= np.clip((np.arange(len(c)) / SR) / 2, 0, 1) * np.clip((len(c) / SR - np.arange(len(c)) / SR) / 1.2, 0, 1)
add(219.5, c)
# 原曲
i = t(0); j = min(n, i + len(song)); out[i:j] += song[:j - i]

out = np.clip(out, -1, 1)
wavfile.write(dst, SR, (out * 32767).astype(np.int16))
print('mix', dst, f'{n / SR:.2f}s')
