#!/usr/bin/env python3
"""混音：片头 2 秒 + 原曲片段（原样，不做改动）+ 尾声几秒的环境声。
原曲片段第 0 秒就开口唱"你"，结尾在 65.1 秒被剪断，所以：
  片头补上：打火机"咔嚓"、火苗一下子窜起来、烟头细细的噼啪声；
  原曲在被剪断前 0.5 秒淡出；
  尾声补上：车开走的引擎声、夜里的虫鸣、终端打字声、气泡弹出的"啵"、Clawd 那句话的打字声。
时间点都从 core.js / scenes3.js 里读，和画面用的是同一份。
用法：python3 mix.py audio/song.wav out/mix.wav
"""
import re
import sys

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44100
core = open('core.js', encoding='utf-8').read()
sc3 = open('scenes3.js', encoding='utf-8').read()
num = lambda src, pat: float(re.search(pat, src).group(1))
PRE = num(core, r'const PRE = ([\d.]+)')
MUSIC_END = num(core, r'const MUSIC_END = ([\d.]+)')
END_S = num(core, r'const END_S = ([\d.]+)')
MSG1, MSG2, BUB = (num(sc3, rf'{k}: ([\d.]+)') for k in ('msg1', 'msg2', 'bub'))
END_LINE = re.search(r"const END_LINE = '([^']+)'", sc3).group(1)
END_CPS = num(sc3, r'const END_CPS = ([\d.]+)')

rate, song = wavfile.read(sys.argv[1])
assert rate == SR, f'需要 44.1kHz，实际 {rate}'
song = song.astype(np.float32) / (32768.0 if song.dtype == np.int16 else 1.0)
if song.ndim == 1:
    song = np.stack([song, song], 1)
n = int(round((PRE + END_S) * SR))
mix = np.zeros((n, 2), np.float32)
# 原曲：开头 15 ms 淡入防爆音；在被剪断前 0.5 秒淡出
seg = song[:int(MUSIC_END * SR)].copy()
fi = int(.015 * SR); seg[:fi] *= np.linspace(0, 1, fi)[:, None]
fo = int(.5 * SR); seg[-fo:] *= (np.cos(np.linspace(0, np.pi, fo)) * .5 + .5)[:, None]
i0 = int(PRE * SR)
mix[i0:i0 + len(seg)] += seg
sfx = np.zeros((n, 2), np.float32)
rng = np.random.default_rng(23)
T = lambda s: s + PRE                      # 歌曲时间 → 成片时间


def put(t, x, gain, pan=0.0):
    i = int(T(t) * SR)
    j = min(n, i + len(x))
    if j > i:                              # pan：−1 全左，+1 全右
        sfx[i:j, 0] += x[:j - i] * gain * min(1, 1 - pan)
        sfx[i:j, 1] += x[:j - i] * gain * min(1, 1 + pan)


def env(length, attack, decay):
    t = np.arange(int(length * SR)) / SR
    return np.minimum(1, t / max(attack, 1e-4)) * np.exp(-t / decay)


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], 'bandpass', fs=SR, output='sos'), x).astype(np.float32)


def noise(length):
    return rng.standard_normal(int(length * SR)).astype(np.float32)


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


# ---- 片头 ----
# 打火机：两下金属"咔"，接着一口气的火苗
for k, t in enumerate((-1.92, -1.86)):
    click = bp(noise(.03), 1800, 7000) * env(.03, .0004, .006)
    put(t, norm(click), .45 if k else .3)
flame = bp(noise(.7), 400, 3000) * env(.7, .03, .22)
put(-1.84, norm(flame), .25)
# 烟头燃着时细细的噼啪（越到后面越密），一直到被掐灭
for i in range(60):
    t = -1.6 + rng.uniform(0, 2.05) ** 1.05
    if t > 0.45:
        continue
    c = bp(noise(.012), 2500, 9000) * env(.012, .0003, .002)
    put(t, norm(c), .05 + .05 * rng.random(), pan=rng.uniform(-.3, .3))
# 低低的房间底噪，进歌时退掉
room = bp(noise(PRE + .6), 80, 900)
room *= np.minimum(1, np.arange(len(room)) / (.4 * SR)) * np.clip((PRE + .6 - np.arange(len(room)) / SR) / .6, 0, 1)
put(-PRE, norm(room), .05)

# ---- 尾声 ----
# 车开走：低沉的引擎，越开越远（音量降、音高往下滑、高频被吃掉）
el = 1.5
tt = np.arange(int(el * SR)) / SR
f = 52 - 10 * tt / el
ph = 2 * np.pi * np.cumsum(f) / SR
eng = (np.sin(ph) + .5 * np.sin(2 * ph) + .25 * np.sin(3 * ph)) * (1 + .3 * np.sin(2 * np.pi * 9 * tt))
eng = sosfilt(butter(2, 400, 'lowpass', fs=SR, output='sos'), eng).astype(np.float32)
eng *= np.exp(-tt / .55) * np.minimum(1, tt / .05)
put(MUSIC_END + .02, norm(eng), .4, pan=.35)
# 夜里的虫鸣：4.6 kHz 左右的一串串短脉冲
for k in range(9):
    t0 = MUSIC_END + .5 + k * .45 + rng.uniform(0, .2)
    if t0 > END_S - .3:
        break
    for j in range(3):
        c = np.sin(2 * np.pi * (4500 + 300 * rng.random()) * np.arange(int(.035 * SR)) / SR) * env(.035, .004, .012)
        put(t0 + j * .055, c.astype(np.float32), .03 + .02 * rng.random(), pan=rng.uniform(-.6, .6))


def typing(t0, text, cps, gain):
    for i, ch in enumerate(text):
        if ch in ' ':
            continue
        c = bp(noise(.014), 2200, 8000) * env(.014, .0004, .003)
        put(t0 + i / cps + rng.uniform(-.006, .006), norm(c), gain * rng.uniform(.75, 1.1))


typing(MSG1, '会话已结束', 18, .12)
typing(MSG2, '想继续这段对话：', 22, .1)
typing(MSG2 + .4, 'claude --resume', 24, .1)
pl = .09
tp = np.arange(int(pl * SR)) / SR
pop = np.sin(2 * np.pi * np.cumsum(np.linspace(260, 880, len(tp))) / SR) * env(pl, .003, .03)
put(BUB, pop.astype(np.float32), .3)
typing(BUB + .15, END_LINE, END_CPS, .09)

mix += sfx
peak = np.abs(mix).max()
if peak > .99:
    mix *= .99 / peak
wavfile.write(sys.argv[2], SR, (mix * 32767).astype(np.int16))
print(f'{sys.argv[2]}: {(PRE + END_S):.2f}s, peak {20 * np.log10(np.abs(mix).max()):.1f} dBFS')
