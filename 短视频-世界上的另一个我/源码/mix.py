#!/usr/bin/env python3
"""混音：原曲片段 + 结尾的几个小音效。
原曲在 27.7 秒就淡出了，后面 2.7 秒是结尾反转，只靠画面会太空，所以补上：
  镜头飞上太空的风声、计数器每翻一倍"嘀"一声（音高一路升上去）、到 1,048,576 时一声"叮"、
  气泡弹出的"啵"、打字声、Clawd 眨眼时一声轻轻的"哔"。
时间点全部从 timing.js 里读，和画面用的是同一份。
用法：python3 mix.py audio/song.wav out/mix.wav
"""
import re
import sys

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44100
src = open('timing.js', encoding='utf-8').read()


def num(pat):
    return float(re.search(pat, src).group(1))


DURATION = num(r'const DURATION = ([\d.]+)')
TILT, SPACE, BUBBLE = num(r'\btilt: ([\d.]+)'), num(r'\bspace: ([\d.]+)'), num(r'\bbubble: ([\d.]+)')
ANSWER = '有。准确地说，还有 1,048,575 个。'      # 和 scenes.js 里的气泡文字一致

rate, song = wavfile.read(sys.argv[1])
assert rate == SR, f'需要 44.1kHz，实际 {rate}'
song = song.astype(np.float32) / (32768.0 if song.dtype == np.int16 else 1.0)
if song.ndim == 1:
    song = np.stack([song, song], 1)
n = int(DURATION * SR)
mix = np.zeros((n, 2), np.float32)
mix[:min(n, len(song))] = song[:n]
sfx = np.zeros(n, np.float32)
rng = np.random.default_rng(7)


def put(t0, x, gain):
    i = int(t0 * SR)
    j = min(n, i + len(x))
    if j > i:
        sfx[i:j] += x[:j - i] * gain


def env(length, attack, decay):
    t = np.arange(int(length * SR)) / SR
    return np.minimum(1, t / max(attack, 1e-4)) * np.exp(-t / decay)


def tone(freq, length, attack=.002, decay=.05):
    t = np.arange(int(length * SR)) / SR
    return np.sin(2 * np.pi * freq * t) * env(length, attack, decay)


# 1. 风声：带通噪声，从抬头开始鼓起来，到太空时最大
wl = (SPACE + .7) - (TILT - .05)
noise = rng.standard_normal(int(wl * SR)).astype(np.float32)
noise = sosfilt(butter(2, [300, 3200], 'bandpass', fs=SR, output='sos'), noise)
tt = np.arange(len(noise)) / SR
peak = SPACE - (TILT - .05)
whoosh = noise * np.where(tt < peak, (tt / peak) ** 2, np.exp(-(tt - peak) / .25))
put(TILT - .05, whoosh / np.abs(whoosh).max(), .16)

# 2. 计数器：n = 2^(1 + 19·u³)，第 k 次翻倍发生在 u = (k/19)^(1/3)
r0, r1 = SPACE + .3, BUBBLE + .05
for k in range(1, 20):
    tk = r0 + (k / 19) ** (1 / 3) * (r1 - r0)
    f = 660 * 2 ** (k / 9)
    put(tk, tone(f, .05, decay=.014) + .3 * tone(f * 2, .05, decay=.01), .11)
ding = tone(1318.5, 1.2, decay=.35) + .6 * tone(1975.5, 1.2, decay=.28) + .25 * tone(2637, 1.2, decay=.18)
put(r1, ding / np.abs(ding).max(), .22)

# 3. 气泡弹出："啵"（快速上滑的正弦）
pl = .09
tp = np.arange(int(pl * SR)) / SR
pop = np.sin(2 * np.pi * np.cumsum(np.linspace(240, 900, len(tp))) / SR) * env(pl, .003, .03)
put(BUBBLE, pop, .3)

# 4. 打字声：每个字一下短促的高频噪声
hp = butter(2, 2500, 'highpass', fs=SR, output='sos')
for i in range(1, len(ANSWER)):
    if ANSWER[i - 1] == ' ':
        continue
    click = sosfilt(hp, rng.standard_normal(int(.012 * SR))).astype(np.float32) * env(.012, .0005, .003)
    put(BUBBLE + i * .035 + rng.uniform(-.004, .004), click / np.abs(click).max(), .07 * rng.uniform(.7, 1.1))

# 5. Clawd 眨眼的"哔"
put(BUBBLE + 1.2, tone(1046.5, .08, decay=.03), .1)

mix += sfx[:, None]
peak = np.abs(mix).max()
if peak > .99:
    mix *= .99 / peak
wavfile.write(sys.argv[2], SR, (mix * 32767).astype(np.int16))
print(f'{sys.argv[2]}: {DURATION:.2f}s, peak {20 * np.log10(np.abs(mix).max()):.1f} dBFS')
