"""《起风了》MV 的声音：原曲 + 两句画外音 + 少量音效和环境声（没有另加配乐）。
- 原曲：剪掉开头 0.30 秒的数字静音，原样放在第 0 秒；结尾补 0.25 秒淡出。
- 画外音（voice_cv3/，CosyVoice 3 合成的女声，加一点混响）：开头"如果能回到高中，你最想见谁？"（视频 0.15 秒起，
  前奏的钢琴里，人声开口之前）、结尾"你的青春里，有没有一句没说出口的话？"（歌曲 316.7 秒起，尾奏的钢琴里）。
  念的时候原曲压低约 4.5 dB，人声比钢琴高 8 dB 左右；这两段里只垫没有起音的底噪（车厢的轰隆声、夜里的风），短促的音效都挪到念完以后。
  顺手写出 timeline.json（两句画外音在成片里的时刻），给 工具/line_asr.py 核对用。
- 音效全用 numpy 合成，按画面的时刻放（时间写的是歌曲时间 s，和 scenes*.js 里一致；放的时候减去 TRIM）。
  有人声的地方音效再压低（按 Demucs 分出来的人声轨的音量，最多约 8 dB），短促的音效尽量放在两句之间的空隙里。
- 成片约 -16 LUFS，4 倍过采样找峰值，限幅到 -1.0 dBTP。
用法：python3 mix.py audio/song.wav out/mix.wav"""
import json, os, re, subprocess, sys
import numpy as np
from scipy.io import wavfile
from scipy.ndimage import minimum_filter1d, uniform_filter1d
from scipy.signal import butter, fftconvolve, resample_poly, sosfilt

SR = 44100
TRIM = 0.30                     # 和 main.js 一致
SONG_DUR = 321.782
CARD = 2.5
CARD_AT = SONG_DUR - 1.0
S_END = CARD_AT + CARD
DUR = S_END - TRIM
N = int(DUR * SR)
TARGET_LUFS = -16.0
CEIL_DB = -1.0
rng = np.random.default_rng(1975)
BPM, BEAT0 = 75.0, 0.612
BEAT = 60 / BPM
BAR = 4 * BEAT
def bar(n): return BEAT0 + n * BAR

src, dst = sys.argv[1], sys.argv[2]
sr, song = wavfile.read(src)
assert sr == SR
song = song.astype(np.float64) / (32768.0 if song.dtype == np.int16 else 1.0)
if song.ndim == 1: song = np.stack([song, song], 1)
song = song.T
song = song[:, int(TRIM * SR):]
fo = int(.25 * SR); song[:, -fo:] *= np.linspace(1, 0, fo)

# 人声的音量（给音效让位用）
try:
    _, voc = wavfile.read('audio/stems/vocals.wav')
    voc = voc.astype(np.float64) / (32768.0 if voc.dtype == np.int16 else 1.0)
    voc = np.abs(voc).mean(1) if voc.ndim > 1 else np.abs(voc)
    venv = uniform_filter1d(voc[int(TRIM * SR):], int(.15 * SR))
    venv = venv / (np.percentile(venv, 95) + 1e-9)
except FileNotFoundError:
    venv = np.zeros(song.shape[1])

sfx = np.zeros((2, N))
amb = np.zeros((2, N))
CUES = []

def tv(d): return np.arange(int(max(d, 1e-3) * SR)) / SR
def lp(x, fc, o=2): return sosfilt(butter(o, fc, 'low', fs=SR, output='sos'), x)
def hp(x, fc, o=2): return sosfilt(butter(o, fc, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def noise(d): return rng.standard_normal(int(max(d, 1e-3) * SR))
def mf(m): return 440.0 * 2 ** ((m - 69) / 12)
def db(x): return 10 ** (x / 20)
def fade(x, a=.05, b=.05):
    x = x.copy(); na, nb = min(int(a * SR), len(x) // 2), min(int(b * SR), len(x) // 2)
    if na: x[:na] *= np.linspace(0, 1, na)
    if nb: x[-nb:] *= np.linspace(1, 0, nb)
    return x

def place(bus, sig, s, gain_db=0.0, pan=0.0, name=''):
    """sig 放在歌曲时间 s（自动换成视频时间）；pan -1 左 … 1 右"""
    i = int(round((s - TRIM) * SR))
    if i >= N or i + len(sig) <= 0: return
    s0 = max(0, -i); i = max(0, i); j = min(N, i + len(sig) - s0)
    seg = sig[s0:s0 + j - i] * db(gain_db)
    bus[0, i:j] += seg * np.cos((pan + 1) * np.pi / 4) * 1.414
    bus[1, i:j] += seg * np.sin((pan + 1) * np.pi / 4) * 1.414
    if bus is sfx: CUES.append((round(s - TRIM, 3), name or 'sfx', round(len(sig) / SR, 3)))
def bed(fn, s0, s1, gain_db, pan=0.0, fi=.6, fo_=.6):
    """环境声：从 s0 到 s1，两头淡入淡出"""
    d = s1 - s0
    if d <= 0: return
    place(amb, fade(fn(d), fi, fo_), s0, gain_db, pan)

# ---------------- 音色 ----------------
def whoosh(d=.8, up=True, lo=300, hi=3000):
    n = int(d * SR); t = np.arange(n) / SR
    x = noise(d); f = np.linspace(lo, hi, n) if up else np.linspace(hi, lo, n)
    out = np.zeros(n); blk = 2048
    for k in range(0, n, blk):
        fc = f[min(n - 1, k + blk // 2)]
        out[k:k + blk] = bp(x[k:k + blk], max(60, fc * .6), min(SR / 2 - 100, fc * 1.6))[:len(out[k:k + blk])]
    return out * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5 * .9
def bell(m, d=2.5, bright=1.0):
    t = tv(d); f = mf(m)
    x = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / (d * dd)) for r, a, dd in [(1, 1, .5), (2.0, .5 * bright, .25), (2.76, .35 * bright, .18), (5.4, .2 * bright, .08)])
    x[:int(.003 * SR)] *= np.linspace(0, 1, int(.003 * SR))
    return x * .5
def chime(notes, gap=.09, d=1.6):
    out = np.zeros(int((len(notes) * gap + d) * SR))
    for i, m in enumerate(notes):
        b = bell(m, d, .6); k = int(i * gap * SR); out[k:k + len(b)] += b
    return out
def sparkle(d=1.0, base=96, n=12):
    out = np.zeros(int((d + .6) * SR))
    for i in range(n):
        m = base + rng.choice([0, 3, 5, 7, 10, 12]); b = bell(m, .5, .3) * (.4 + .6 * rng.random())
        k = int(rng.random() * d * SR); out[k:k + len(b)] += b
    return out * .6
def tick(f=2600):
    t = tv(.04); return (np.sin(2 * np.pi * f * t) * np.exp(-t / .006) + hp(noise(.04), 3000) * np.exp(-t / .003) * .5) * .6
def rewind(d=1.0):
    t = tv(d); f = 400 + 2400 * (t / d) ** 2
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * .25 + bp(noise(d), 1500, 6000) * .5
    return x * np.sin(np.pi * np.clip(t / d, 0, 1)) * (1 + .5 * np.sin(2 * np.pi * 30 * t))
def birds(d=3.0, n=7):
    out = np.zeros(int(d * SR))
    for _ in range(n):
        k = int(rng.random() * max(.1, d - .4) * SR)
        for j in range(rng.integers(2, 5)):
            t = tv(.07); f0 = 3200 + rng.random() * 1800
            c = np.sin(2 * np.pi * np.cumsum(f0 * (1 + .25 * np.sin(np.pi * t / .07))) / SR) * np.sin(np.pi * t / .07) ** 2
            kk = k + int(j * .09 * SR); out[kk:kk + len(c)] += c[:max(0, len(out) - kk)] * .35
    return out
def rain_bed(d):
    x = noise(d); x = lp(hp(x, 300), 6000) * .5 + lp(noise(d), 900) * .5
    drops = np.zeros(len(x)); idx = rng.integers(0, max(1, len(x) - 400), int(d * 60))
    for i in idx: drops[i:i + 300] += np.exp(-np.arange(300) / 40) * rng.uniform(-1, 1)
    return x * .5 + hp(drops, 1500) * .3
def room(d): return lp(noise(d), 500) * .3 + lp(hp(noise(d), 2000), 5000) * .05
def wind(d, lo=200, hi=900):
    x = bp(noise(d), lo, hi); t = tv(d)
    return x * (.6 + .4 * np.sin(2 * np.pi * .4 * t + rng.random() * 6))
def gust(d=2.2):
    t = tv(d); return bp(noise(d), 150, 2200) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2 * 1.2 + whoosh(d, True, 200, 2500) * .5
def rustle(d=1.5):
    t = tv(d); x = hp(noise(d), 2500) * (np.abs(np.sin(2 * np.pi * 7 * t + rng.random())) ** 3)
    return x * np.sin(np.pi * np.clip(t / d, 0, 1)) * .5
# 火车：轰隆的底噪 + 车轮过钢轨接缝的"咔嗒"
def rumble(d):
    t = tv(d); return lp(noise(d), 160, 4) * (1 + .25 * np.sin(2 * np.pi * 1.6 * t)) * 1.4 + lp(hp(noise(d), 400), 1200) * .12
def clack():
    t = tv(.12); return lp(noise(.12), 400) * np.exp(-t / .02) * 1.2 + bp(noise(.12), 1800, 4000) * np.exp(-t / .008) * .4
def clacks(s0, s1, gap=.62, gain=-24, avoid=()):
    k = 0; s = s0
    while s < s1:
        for dt in (0, .11):
            if not any(a <= s + dt <= b for a, b in avoid): place(sfx, clack(), s + dt, gain, -.2, 'clack')
        s += gap * (1 + .05 * np.sin(k)); k += 1
def brake(d=2.0):
    t = tv(d); f = 2400 + 300 * np.sin(2 * np.pi * 3 * t) * np.exp(-t)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * .15 + bp(noise(d), 1500, 3500) * .3) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5 * np.linspace(1, .3, len(t))
def horn(d=1.2):
    t = tv(d); x = sum(np.sign(np.sin(2 * np.pi * f * t)) * .2 for f in (311, 370))
    return lp(x, 2500) * np.clip(t / .05, 0, 1) * np.clip((d - t) / .2, 0, 1)
# 夏天：蝉、夜里的蛐蛐
def cicadas(d):
    t = tv(d); car = bp(noise(d), 4200, 7000) * (.5 + .5 * np.sin(2 * np.pi * 48 * t))
    swell = .55 + .45 * np.sin(2 * np.pi * .13 * t + rng.random() * 6)
    return car * swell * .7
def crickets(d):
    t = tv(d); out = np.zeros(len(t))
    for f0, rate in ((4400, 2.3), (4700, 2.9), (5100, 1.7)):
        chirp = (np.sin(2 * np.pi * rate * t + rng.random() * 6) > .6) * (np.sin(2 * np.pi * 30 * t) > 0)
        out += np.sin(2 * np.pi * f0 * t) * lp(chirp.astype(float), 200) * .25
    return out
# 人声的群体：说话声、欢呼、笑
def chatter(d, lo=300, hi=2600):
    t = tv(d); x = bp(noise(d), lo, hi)
    am = lp(np.abs(rng.standard_normal(len(t))), 6) * 40
    return x * np.clip(am, 0, 1.5) * .6
def cheer(d=2.0):
    t = tv(d); x = bp(noise(d), 400, 3500) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** .7
    return x * (1 + .3 * np.sin(2 * np.pi * 5 * t)) * .9
def laughs(d=2.0):
    t = tv(d); x = bp(noise(d), 500, 2800) * (np.abs(np.sin(2 * np.pi * 4.5 * t)) ** 4) * np.sin(np.pi * np.clip(t / d, 0, 1))
    return x * 1.2 + chatter(d) * .3
# 学校：电铃、自行车铃、粉笔头、翻书、写字、快门、抽屉、纸
def school_bell(d=2.4):
    t = tv(d); x = np.sin(2 * np.pi * 1050 * t) + .5 * np.sin(2 * np.pi * 2310 * t)
    return x * (.5 + .5 * np.sign(np.sin(2 * np.pi * 24 * t))) * np.clip((d - t) / .3, 0, 1) * .3
def bike_bell():
    out = np.zeros(int(.9 * SR))
    for k in (0, .16):
        b = bell(91, .7, .9); i = int(k * SR); out[i:i + len(b)] += b[:len(out) - i]
    return out
def pop():
    t = tv(.15); return (lp(noise(.15), 900) * np.exp(-t / .012) * 1.4 + np.sin(2 * np.pi * 180 * t) * np.exp(-t / .03))
def page():
    t = tv(.28); return bp(noise(.28), 1200, 7000) * np.sin(np.pi * t / .28) ** 2 * .7
def scribble(d=1.0):
    t = tv(d); return hp(noise(d), 3000) * (np.abs(np.sin(2 * np.pi * 6 * t)) ** 2) * .3
def shutter():
    out = np.zeros(int(.4 * SR)); c = hp(noise(.03), 2000) * np.exp(-tv(.03) / .004)
    for k in (0, .09): i = int(k * SR); out[i:i + len(c)] += c
    return out + lp(noise(.4), 3000) * np.exp(-tv(.4) / .1) * .1
def drawer():
    t = tv(.6); return lp(noise(.6), 800) * (.6 + .4 * np.sin(2 * np.pi * 30 * t)) * np.sin(np.pi * t / .6) * .8
def crinkle(d=1.0):
    t = tv(d); out = np.zeros(len(t))
    for i in rng.integers(0, max(1, len(t) - 600), int(d * 70)): out[i:i + 600] += hp(noise(600 / SR), 2500) * np.exp(-np.arange(600) / 60) * rng.uniform(.2, 1)
    return out * .5
def steps(d, rate=1.6, room_=False):
    out = np.zeros(int(d * SR)); t = 0.0
    while t < d - .1:
        s_ = lp(noise(.1), 600) * np.exp(-tv(.1) / .02) * .8 + hp(noise(.1), 3000) * np.exp(-tv(.1) / .005) * .2
        i = int(t * SR); out[i:i + len(s_)] += s_[:len(out) - i]; t += 1 / rate
    if room_:
        ir = rng.standard_normal(int(.5 * SR)) * np.exp(-np.arange(int(.5 * SR)) / SR / .12); out = out + fftconvolve(out, ir / 30)[:len(out)]
    return out
def drip():
    t = tv(.12); f = 1400 + 900 * t / .12; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .03) * .4

# ---------------- 摆放（歌曲时间） ----------------
VO1 = TRIM + .15                       # 开头那句画外音在文件里的起点（歌曲时间）
VO1_WORDS = (VO1 + .15, VO1 + 3.12)
# 开头：火车车厢。画外音念的时候只有轰隆声和窗外的风；念完以后才有"咔嗒咔嗒"
bed(rumble, TRIM, bar(8) - .4, -24, 0, fi=.05)
bed(lambda d: wind(d, 300, 1500), TRIM, bar(4), -32, .4, fi=.05)
clacks(VO1_WORDS[1] + .25, bar(7) + 1.0, avoid=())
place(sfx, gust(2.0), bar(4) - .9, -20, 0, 'gust')               # 片名：风起来
bed(rustle, bar(4), bar(6), -30, .3)
place(sfx, horn(1.0), bar(6) + .3, -30, -.5, 'horn')
place(sfx, brake(2.6), bar(7) + .2, -28, 0, 'brake')
# 第一段主歌：站台、出站口、阳光、老街、风
bed(lambda d: chatter(d) * .6, bar(8), bar(10), -34, -.3)
place(sfx, chime([79, 76, 72], .32, 1.4), bar(9) - .55, -32, .4, 'chime')   # 站台的提示音，落在上一句和这一句之间
bed(lambda d: steps(d, 1.7), bar(9), bar(10), -30, 0)
bed(lambda d: steps(d, 1.6, True), bar(10), bar(11), -30, 0)
bed(room, bar(10), bar(13), -34)
bed(cicadas, bar(13), 49.3, -30, .2, fi=.4)
bed(lambda d: birds(d, 4), 44.55, 46.2, -30, -.3)
place(sfx, gust(2.6), 47.2, -16, .2, 'gust')
bed(rustle, 47.3, 49.6, -24, .3)
place(sfx, whoosh(1.0, True, 400, 6000), 49.1, -20, 0, 'whoosh')
# 第一遍副歌（七年前）：校园、天台、运动会、走廊、她回头
bed(lambda d: chatter(d), 49.9, 57.7, -34, -.2)
bed(cicadas, 49.9, 76.5, -34, .3, fi=1.0)
place(sfx, whoosh(.6, True, 500, 4000), 53.0 - .3, -26, 0, 'whoosh')
place(sfx, whoosh(1.2, True, 300, 3000), 55.4, -28, .3, 'whoosh')
bed(cheer, 57.75, 62.8, -26, 0, fi=.3)
place(sfx, cheer(1.8), 61.25, -20, 0, 'cheer')
place(sfx, whoosh(.5, True, 600, 4000), 64.4, -28, .3, 'whoosh')       # 他把纸飞机扔出去
bed(lambda d: chatter(d) * .7, 62.85, 70.6, -34, 0)
place(sfx, page() * .4, 72.5, -24, -.2, 'tap')                  # 纸飞机碰到她的头
place(sfx, sparkle(.8, 96, 8), 73.45, -30, .2, 'sparkle')
bed(lambda d: wind(d, 300, 1200), 73.4, 76.5, -32, .4)
# 后半段：地图、睡觉、粉笔头、笑、翻本子、天台、折纸飞机、太阳雨
bed(room, 76.55, 96.3, -36)
for t_ in (77.3, 78.0, 78.6, 79.2, 79.8): place(sfx, whoosh(.4, True, 1500, 5000) * .5, t_, -32, .3, 'route')
bed(lambda d: lp(noise(d), 300) * (1 + .3 * np.sin(2 * np.pi * 2.2 * tv(d))), 80.5, 83.6, -34)   # 吊扇
place(sfx, whoosh(.5, True, 800, 3000), 84.55, -26, -.3, 'chalk')
place(sfx, pop(), 85.55, -18, 0, 'pop')
place(sfx, laughs(2.6), 86.7, -24, 0, 'laugh')
for i in range(8): place(sfx, page(), 89.65 + i * .5, -26, .3, 'page')
bed(cicadas, 93.15, 96.3, -28, .3)
bed(lambda d: wind(d, 200, 900), 93.15, 96.3, -32, -.3)
bed(lambda d: scribble(d), 96.4, 98.2, -30, .2)
place(sfx, crinkle(.8), 98.2, -28, .2, 'fold')
place(sfx, drawer(), 101.4, -28, -.2, 'drawer')
bed(lambda d: rain_bed(d), 102.0, 109.4, -24, 0, fi=.4, fo_=1.0)
for t_ in (110.0, 110.9, 111.6, 112.3): place(sfx, drip(), t_, -28, .4, 'drip')
place(sfx, sparkle(1.4, 91, 10), 109.9, -30, 0, 'sparkle')
for i in range(12): place(sfx, page() * .5, 113.0 + i * .45, -30, .3, 'page')
place(sfx, rewind(.8), 117.6, -30, 0, 'rewind')
# 第二段主歌（七年后）：楼梯、空教室、刻痕、钟、倒带 → 早读
bed(lambda d: steps(d, 1.3, True), 118.9, 121.4, -30, 0)
bed(room, 118.85, 137.2, -34)
for k_ in range(7): place(sfx, tick(2400), 131.8 + k_ * BEAT, -28, .2, 'tick')
place(sfx, rewind(2.2), 134.9, -22, 0, 'rewind')
bed(lambda d: birds(d, 6), 137.25, 142.8, -32, -.4)
bed(lambda d: chatter(d, 400, 2000) * .5, 137.25, 140.4, -38, .2)
# 第二遍副歌：骑车、长椅、晚自习、百日誓师、台灯、雪、元旦、日历、毕业照
place(sfx, bike_bell(), 142.95, -28, .3, 'bikebell')
bed(lambda d: crickets(d) * .6 + wind(d, 200, 700) * .3, 142.85, 147.6, -32, 0)
bed(crickets, 147.65, 150.4, -30, 0)
bed(cheer, 150.5, 153.1, -24, 0, fi=.2)
bed(lambda d: crickets(d) * .5 + scribble(d) * .6, 153.15, 155.6, -32, 0)
bed(lambda d: wind(d, 300, 1000), 155.7, 158.7, -32, .3)
place(sfx, cheer(1.6), 158.8, -24, 0, 'cheer')
for i in range(6): place(sfx, page(), 160.6 + i * .45, -28, .2, 'page')
place(sfx, shutter(), 166.25, -20, 0, 'shutter')
# 后半段：高考、铃、扔试卷、签名、晚会、散场
for k_ in range(5): place(sfx, tick(2200), 169.6 + k_ * BEAT, -30, -.3, 'tick')
bed(lambda d: scribble(d), 169.3, 173.3, -32, .2)
place(sfx, school_bell(2.2), 173.3, -20, 0, 'bell')
bed(cheer, 173.6, 176.4, -24, 0)
bed(lambda d: crinkle(d) * .6 + wind(d, 300, 1200) * .4, 176.5, 179.4, -26, 0)
bed(lambda d: laughs(d) * .6, 179.5, 182.0, -30, 0)
bed(lambda d: scribble(d), 182.2, 185.8, -30, -.2)
bed(lambda d: cheer(d) * .5, 186.0, 189.0, -30, 0)
bed(crickets, 189.05, bar(61), -34, 0)
# 间奏：空教室、两列火车、四季、回到现在
bed(lambda d: wind(d, 200, 900), bar(61), bar(62), -30, .3)
bed(rumble, bar(62), bar(64), -26, 0)
clacks(bar(62) + .2, bar(64) - .3, gap=.5, gain=-28)
place(sfx, horn(1.4), bar(62) + 1.0, -26, -.6, 'horn')
place(sfx, whoosh(2.0, True, 200, 2000), bar(63) + .4, -24, .5, 'pass')
bed(lambda d: birds(d, 10), bar(64), bar(66), -32, 0)
bed(lambda d: wind(d, 200, 900), bar(64), bar(66), -30, 0)
bed(lambda d: wind(d, 250, 1200), bar(66), bar(68), -28, .3)
place(sfx, gust(2.4), 216.0, -22, .3, 'gust')
# 桥段：晚风、槐花、树皮、眼睛、一笑生花、跑道、抽屉、铅笔画
bed(lambda d: wind(d, 200, 800) + crickets(d) * .3, bar(68), 233.3, -30, -.2)
place(sfx, sparkle(1.2, 93, 10), 219.0, -32, .2, 'sparkle')
place(sfx, gust(2.0), 230.5, -24, 0, 'gust')
bed(lambda d: crickets(d), 233.35, 237.3, -30, 0)
place(sfx, drawer(), 237.5, -24, .2, 'drawer')
bed(lambda d: scribble(d) * .6, 240.6, 245.0, -34, 0)
# 最后一遍副歌：同学聚会
bed(lambda d: chatter(d), 246.1, 262.6, -30, 0)
place(sfx, laughs(2.4), 249.9, -26, 0, 'laugh')
place(sfx, cheer(1.8), 253.9, -24, 0, 'cheer')
place(sfx, crinkle(1.0), 262.75, -24, 0, 'unfold')
place(sfx, gust(2.6), 266.4, -20, 0, 'gust')
bed(lambda d: wind(d, 200, 900), 266.1, 279.0, -30, .3)
place(sfx, page() * .6, 271.9, -26, 0, 'page')
place(sfx, sparkle(1.4, 91, 12), 273.8, -28, 0, 'sparkle')
# 尾奏
bed(lambda d: wind(d, 200, 900), bar(87), bar(89), -28, 0)
place(sfx, shutter(), 288.6, -20, 0, 'shutter')
bed(lambda d: chatter(d) * .6, bar(89), 290.2, -32, 0)
bed(lambda d: crickets(d) + wind(d, 200, 700) * .3, bar(92), bar(95), -30, 0)
bed(lambda d: steps(d, 1.6) * .6, bar(92), bar(92) + 6, -34, 0)
bed(lambda d: wind(d, 200, 800) * .6 + crickets(d) * .6, bar(95), CARD_AT + 1.0, -32, 0)
place(sfx, whoosh(1.2, True, 300, 3000), 309.3, -26, .4, 'launch')
place(sfx, sparkle(1.4, 96, 10), 311.6, -30, 0, 'sparkle')
# 结尾那句画外音（316.7 起，3.6 秒，念完到片子结束 3.0 秒）念的时候不放短促的音效；片尾卡也不加"叮"

# ---------------- 画外音（CosyVoice 3 女声）----------------
VOICE = [('h1', VO1), ('e1', 316.7)]
voice = np.zeros((2, N)); tl = []
def reverb(x, dur=.9, wet=.16):
    n = int(dur * SR); ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR / (dur / 5)); ir = lp(ir, 5000); ir /= np.sqrt(np.sum(ir ** 2))
    y = fftconvolve(x, ir)[:len(x) + n]; out = np.zeros(len(y)); out[:len(x)] += x; return out + y * wet
for lid, at in VOICE:
    f = f'voice_cv3/n_{lid}.wav'
    if not os.path.exists(f): continue
    vsr, v = wavfile.read(f); v = v.astype(np.float64) / (32768.0 if v.dtype == np.int16 else 1.0)
    if v.ndim > 1: v = v.mean(1)
    v = resample_poly(v, SR, vsr); v = hp(v, 80, 2)
    v *= db(-13.0) / (np.sqrt(np.mean(v[np.abs(v) > 1e-3] ** 2)) + 1e-9)     # 说话部分的有效值放到约 -13 dBFS：原曲很响，前奏的钢琴也有 -17 dB 左右
    v = reverb(v)
    place(voice, v, at, 0.0, 0)
    meta = json.load(open(f'voice_cv3/n_{lid}.json', encoding='utf-8'))
    tl.append({'id': lid, 'kind': 'N', 't0': round(at - TRIM, 3), 't1': round(at - TRIM + len(v) / SR - .8, 3), 'text': meta['say'],
               'chars': [[c, round(at - TRIM + a, 3), round(at - TRIM + b, 3)] for c, a, b in meta['chars']]})
json.dump({'lines': tl, 'duration': DUR, 'cues': CUES}, open('timeline.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
vg = uniform_filter1d((np.abs(voice).max(0) > 1e-3).astype(float), int(.3 * SR))
song_gain = 1 - .4 * np.clip(vg * 2, 0, 1)                       # 念的时候原曲让一让（约 -4.5 dB）

# ---------------- 混音 ----------------
v = np.zeros(N); v[:min(N, len(venv))] = venv[:N]
duck = 1 - .6 * np.clip(np.maximum(v, vg), 0, 1)
duck = uniform_filter1d(minimum_filter1d(duck, int(.1 * SR)), int(.08 * SR))
bedmix = (sfx + amb) * duck
out = np.zeros((2, N)); out[:, :min(N, song.shape[1])] += song[:, :N]
out *= song_gain
out += bedmix + voice

def measure(x):
    tmp = 'out/_measure.wav'
    wavfile.write(tmp, SR, (np.clip(x, -1, 1).T * 32767).astype(np.int16))
    r = subprocess.run(['ffmpeg', '-nostats', '-i', tmp, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    os.remove(tmp)
    summ = r[r.rfind('Summary'):]
    return float(re.search(r'I:\s+(-?[\d.]+) LUFS', summ).group(1)), float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', summ).group(1))
def limit(x, ceil_db=CEIL_DB, hold=.012):
    ceil = db(ceil_db)
    up = np.max(np.abs(resample_poly(x, 4, 1, axis=1)), axis=0)
    e = np.max(up[:x.shape[1] * 4].reshape(-1, 4), axis=1)
    g = np.minimum(1.0, ceil / np.maximum(e, 1e-9))
    k = int(hold * SR)
    g = uniform_filter1d(minimum_filter1d(g, size=2 * k + 1), size=k + 1)
    return x * g, -20 * np.log10(g.min()), np.mean(g < .999) * 100
L0, _ = measure(out)
gain = TARGET_LUFS - L0
for _ in range(2):
    y, gr, pct = limit(out * db(gain))
    L1, tp = measure(y)
    gain += TARGET_LUFS - L1
y, gr, pct = limit(out * db(gain))
L1, tp = measure(y)
print(f'mix: {DUR:.2f}s  原混音 {L0:.1f} LUFS → 加 {gain:+.1f} dB → {L1:.1f} LUFS，真峰值 {tp:.1f} dBTP；限幅最多 {gr:.1f} dB，{pct:.1f}% 的采样被压')
wavfile.write(dst, SR, (np.clip(y, -1, 1).T * 32767).astype(np.int16))
