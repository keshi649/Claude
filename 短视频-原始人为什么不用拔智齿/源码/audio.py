"""《原始人为什么不用拔智齿？》声音：只有音效和环境声——没有配音，也没有配乐。
全部按 timeline.json 对齐，用 numpy 合成；最后把响度定在约 −18 LUFS（和上一集"只有音效"版一致），峰值压在 −1.5 dBFS 以下。
用法：python3 audio.py out.wav
"""
import json
import os
import sys

import numpy as np
from scipy.io import wavfile
from scipy.ndimage import minimum_filter1d, uniform_filter1d
from scipy.signal import butter, lfilter, resample_poly, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__))
TLD = json.load(open(os.path.join(HERE, 'timeline.json'), encoding='utf-8'))
LN = {l['id']: l for l in TLD['lines']}
SC = {s['name']: s for s in TLD['scenes']}
SR = 44100
DUR = TLD['duration']
N = int(SR * DUR)
rng = np.random.default_rng(23)
TARGET_LUFS = -18.0


def S(i): return LN[i]['t0']
def EN(i): return LN[i]['t1']
def SS(n): return SC[n]['t0']
def SE(n): return SC[n]['t1']
def seg(t, a, b): return min(1.0, max(0.0, (t - a) / (b - a)))
def lerp(a, b, u): return a + (b - a) * u


sfx = np.zeros((2, N))
amb = np.zeros((2, N))


def place(bus, sig, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N or i + len(sig) <= 0:
        return
    s0 = max(0, -i)
    i = max(0, i)
    j = min(N, i + len(sig) - s0)
    seg_ = sig[s0:s0 + j - i] * gain
    gl, gr = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    bus[0, i:j] += seg_ * gl
    bus[1, i:j] += seg_ * gr


def tvec(d): return np.arange(int(max(d, 1e-3) * SR)) / SR
def lp(x, fc, o=2): return sosfilt(butter(o, fc, 'low', fs=SR, output='sos'), x)
def hp(x, fc, o=2): return sosfilt(butter(o, fc, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def noise(d): return rng.standard_normal(int(max(d, 1e-3) * SR))
def mf(m): return 440.0 * 2 ** ((m - 69) / 12)


OS = 4


def pulse_wave(freqs, duty):
    f = np.repeat(freqs, OS)
    ph = np.cumsum(f / (SR * OS)) % 1.0
    x = np.where(ph < duty, 1.0, -1.0) - (2 * duty - 1)
    return resample_poly(x, 1, OS)[:len(freqs)]


def adsr(n, a=.005, d=.08, s=.6, r=.05, gate=None):
    t = np.arange(n) / SR
    gate = gate if gate is not None else n / SR
    env = np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    return env * np.where(t > gate, np.clip(1 - (t - gate) / max(r, 1e-4), 0, 1), 1)


def square(m, d, duty=.25, vel=.5, a=.004, dec=.1, sus=.55, rel=.04, slide=0.0):
    n = int((d + rel) * SR)
    t = np.arange(n) / SR
    f = mf(m) * (2 ** (slide * np.clip(t / max(d, 1e-3), 0, 1) / 12))
    return pulse_wave(f, duty) * adsr(n, a, dec, sus, rel, d) * vel * .18


# ---------------- 游戏音效 ----------------
def blip(m, d=.05, duty=.5, vel=.5): return square(m, d, duty, vel, a=.001, dec=.03, sus=.4, rel=.02)


def pop_snd(m=84, vel=.5):
    t = tvec(.12)
    f = mf(m) * (1 + 1.5 * np.exp(-t / .02))
    return pulse_wave(f, .5) * np.exp(-t / .04) * vel * .2


def coin(vel=.5): return np.concatenate([blip(83, .06, .5, vel), blip(88, .18, .5, vel)])


def stamp_snd():
    t = tvec(.3)
    return (np.sin(2 * np.pi * 70 * t) * np.exp(-t / .06) * .8 + lp(noise(.3), 1500) * np.exp(-t / .03) * .6) * .3


def whoosh(d=.5, up=True, vel=.5):
    t = tvec(d)
    u = t / d
    fc = (300 + 4000 * u) if up else (4300 - 4000 * u)
    x = noise(d)
    y = np.zeros_like(x)
    k = int(.02 * SR)
    for i in range(0, len(x), k):
        c = fc[min(i, len(fc) - 1)]
        y[i:i + k] = bp(x[max(0, i - 2000):i + k], c * .7, min(c * 1.4, SR / 2 - 100))[-len(y[i:i + k]):]
    return y * np.sin(np.pi * u) * vel * .4


def tape(d=.9):
    t = tvec(d)
    x = pulse_wave(1800 - 1300 * t / d, .5) * .5 + .4 * hp(noise(d), 3000)
    x *= (.6 + .4 * np.sign(np.sin(2 * np.pi * 14 * t)))
    return x * np.minimum(1, t / .03) * np.clip((d - t) / .1, 0, 1) * .16


def buzz(d=.3, m=40):
    return square(m, d, .5, .7, a=.002, dec=.2, sus=.8, rel=.03) + square(m + .3, d, .25, .5, a=.002, dec=.2, sus=.8, rel=.03)


def thud(vel=.7):
    t = tvec(.35)
    return (np.sin(2 * np.pi * 55 * t) * np.exp(-t / .1) + lp(noise(.35), 600) * np.exp(-t / .05) * .7) * vel * .35


def sparkle(d=.8, base=84, vel=.4):
    out = np.zeros(int(d * SR) + SR // 2)
    for i in range(int(d / .05)):
        s = blip(base + int(rng.integers(0, 4)) * 3 + (i % 3) * 5, .04, .25, vel * (1 - i * .05 / d))
        k = int(i * .05 * SR)
        out[k:k + len(s)] += s[:len(out) - k]
    return out


def clank(vel=.5, f=820):
    t = tvec(.25)
    x = (np.sin(2 * np.pi * f * t) + .6 * np.sin(2 * np.pi * f * 2.76 * t) + .4 * np.sin(2 * np.pi * f * 5.4 * t)) * np.exp(-t / .06)
    return (x + .5 * bp(noise(.25), 2000, 8000) * np.exp(-t / .012)) * vel * .2


def scrape(d=1.0, vel=.5):
    """石头/骨头被推着滑动：低沉的摩擦声"""
    t = tvec(d)
    x = bp(noise(d), 120, 900) * (.6 + .4 * np.abs(np.sin(2 * np.pi * 7 * t)))
    return x * np.minimum(1, t / .08) * np.clip((d - t) / .15, 0, 1) * vel * .5


def crunch(vel=.6):
    """咬硬东西：几下短促的碎裂"""
    out = np.zeros(int(.18 * SR))
    for k in range(4):
        L = int((.015 + rng.random() * .02) * SR)
        burst = bp(rng.standard_normal(L), 1000, 5500) * np.exp(-np.arange(L) / (L / 3))
        o = int((k * .035 + rng.random() * .01) * SR)
        out[o:o + L] += burst[:len(out) - o] * (1 - k * .15)
    return out * vel * .2


def slurp(vel=.5):
    """吸溜：带共振的扫频噪声"""
    t = tvec(.35)
    x = noise(.35)
    y = np.zeros_like(x)
    k = int(.01 * SR)
    for i in range(0, len(x), k):
        c = 500 + 1400 * (i / len(x))
        y[i:i + k] = bp(x[max(0, i - 2000):i + k], c, c * 1.6)[-len(y[i:i + k]):]
    return y * np.sin(np.pi * t / .35) * vel * .35


def squeak(vel=.4):
    t = tvec(.09)
    f = 3000 + 1500 * np.sin(np.pi * t / .09)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / .09) * vel * .18


def zap(vel=.4):
    t = tvec(.12)
    f = 2400 * np.exp(-t / .04) + 300
    return pulse_wave(f, .25) * np.exp(-t / .05) * vel * .15


def drill(d=.5, vel=.4):
    """牙钻：高频嗡鸣 + 一点抖动"""
    t = tvec(d)
    f = 4200 + 160 * np.sin(2 * np.pi * 37 * t)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + .3 * np.sin(2 * np.pi * np.cumsum(f * 2) / SR)
    return x * np.minimum(1, t / .05) * np.clip((d - t) / .08, 0, 1) * vel * .12


def snore(d=1.2):
    t = tvec(d)
    return lp(noise(d), 400) * (np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2) * .25


def tick(vel=.4):
    t = tvec(.03)
    return hp(noise(.03), 3000) * np.exp(-t / .006) * vel * .4


def strain(d=.9):
    """智齿使劲往上顶：抖动的上滑音"""
    t = tvec(d)
    f = mf(55) * (1 + .5 * t / d) * (1 + .03 * np.sin(2 * np.pi * 18 * t))
    return pulse_wave(f, .25) * np.minimum(1, t / .05) * np.clip((d - t) / .1, 0, 1) * .08


def sad_slide(): return square(70, .5, .5, .5, dec=1, sus=1, slide=-7)


def rise(d=1.0, m0=60, m1=79): return square(m0, d, .125, .35, dec=2, sus=1, slide=m1 - m0)


def glitch(d=.4):
    out = np.zeros(int(d * SR))
    k = 0
    while k < len(out):
        L = int(rng.integers(300, 2500))
        s = square(36 + int(rng.integers(0, 40)), L / SR, [.125, .25, .5][int(rng.integers(0, 3))], .5, a=.0005, dec=.01, sus=1, rel=.001)[:L]
        out[k:k + len(s)] += s[:len(out) - k]
        k += L
    return out * .7


def speech_beeps(t0, text, m, cps=16, gain=.55):
    """对话气泡逐字打出的"哔哔"声（和 core.js 的 speech() 一样每秒 16 个字）"""
    for i, ch in enumerate(text):
        if ch in '，。…！？：、 ':
            continue
        if i % 2 == 0:
            place(sfx, blip(m + (i * 7 % 5) - 2, .035, .5, .45), t0 + .1 + i / cps, gain)


# ---------------- 环境声（很轻） ----------------
def amb_clinic(d):
    t = tvec(d)
    return (np.sin(2 * np.pi * 120 * t) * .25 + np.sin(2 * np.pi * 240 * t) * .1 + lp(noise(d), 300) * .4) * .05


def amb_city(d):
    t = tvec(d)
    x = lp(noise(d), 250) * .6 + bp(noise(d), 800, 2000) * .08 * (1 + np.sin(2 * np.pi * .13 * t))
    return x * .07


def amb_savanna(d):
    t = tvec(d)
    wind = bp(noise(d), 300, 1500) * (.5 + .5 * np.sin(2 * np.pi * .17 * t + 1) * np.sin(2 * np.pi * .07 * t))
    x = wind * .05
    k = 0.4
    while k < d - .3:   # 远处的鸟叫
        tt = tvec(.12)
        f = 3200 + 900 * np.sin(np.pi * tt / .12) * (1 if rng.random() < .5 else -1)
        chirp = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / .12) * .03
        i = int(k * SR)
        x[i:i + len(chirp)] += chirp[:len(x) - i]
        if rng.random() < .5:
            x[i + int(.16 * SR):i + int(.16 * SR) + len(chirp)] += chirp[:max(0, len(x) - i - int(.16 * SR))]
        k += 1.2 + rng.random() * 2.2
    return x


def amb_lab(d):
    t = tvec(d)
    return (np.sin(2 * np.pi * 100 * t) * .2 + hp(noise(d), 5000) * .06) * .05


def bed(fn, t0, t1, gain=1.0):
    d = t1 - t0 + .6
    x = fn(d)
    env = np.minimum(1, tvec(d) / .4) * np.clip((d - tvec(d)) / .4, 0, 1)
    place(amb, x * env, t0 - .3, gain)


# ================= 时间点（与 scenes*.js 对应） =================
def lot_age(t):
    if t < S('l2'):
        return 5
    if t < S('l3'):
        return lerp(5, 12, seg(t, S('l2') + .3, EN('l2') - .4))
    return lerp(12, 18, seg(t, S('l3') + .2, S('l3') + 2.2))


def first_t(fn, cond, t0, t1, step=1 / 120):
    t = t0
    while t < t1:
        if cond(fn(t)):
            return t
        t += step
    return None


def build():
    # —— 环境声 ——
    bed(amb_clinic, 0, SS('lot'))
    bed(amb_city, SS('lot'), SE('lot'))
    bed(amb_savanna, SS('past'), S('p2') - .2)
    bed(amb_city, SS('site'), S('s4') - .2)
    bed(amb_savanna, S('s4') - .2, S('s5') - .2)
    bed(amb_city, S('s5') - .2, S('s6') - .2)
    bed(amb_lab, SS('rats'), S('r4'))
    bed(amb_savanna, SS('wear'), S('w3') - .2)
    bed(amb_city, S('w3') - .2, SE('mismatch'), .7)
    bed(amb_clinic, SS('guide'), SE('guide'))
    bed(amb_savanna, SS('end'), DUR)

    # —— 开头 ——
    place(sfx, thud(.5), .02, .6)                                   # 观片灯亮
    place(sfx, bp(noise(.08), 1500, 6000) * np.exp(-tvec(.08) / .02) * .08, .02, 1)
    for k in range(2):
        place(sfx, square(88, .08, .5, .5, a=.001, dec=.05, sus=.8), .4 + k * .18, .7)
    place(sfx, pop_snd(80), S('h2') - .1, .8)
    for i in range(4):
        place(sfx, pop_snd(84 + i * 2, .3), S('h2') + .15 + i * .07, .5, -.3)
    place(sfx, sad_slide(), S('h2') + .5, .4, -.2)
    place(sfx, pop_snd(80), S('h3') - .1, .8)
    for i in range(20):
        place(sfx, pop_snd(90, .2), S('h3') + .1 + i * .03, .35, .4)
    place(sfx, blip(76, .08), S('h4'), .6); place(sfx, blip(81, .14), S('h4') + .1, .6)

    # —— 停车场 ——
    place(sfx, whoosh(.5, True, .5), SS('lot') - .25, .7)
    for i in range(8):
        place(sfx, tick(.5), S('l1') - .1 + i * .06, .6)
    m1 = first_t(lot_age, lambda a: a >= 5.6, S('l2'), S('l3'))
    m2 = first_t(lot_age, lambda a: a >= 11.6, S('l2'), S('l3'))
    w1a = first_t(lot_age, lambda a: a >= 5, S('l2'), S('l3'))
    w2a = first_t(lot_age, lambda a: a >= 11, S('l2'), S('l3'))
    if w1a:
        place(sfx, scrape(.6), w1a, .8, .5)
    if w2a:
        place(sfx, scrape(.6), w2a, .8, .5)
    for t in (m1, m2):
        if t:
            place(sfx, rise(.35, 64, 76), t, .6); place(sfx, coin(.4), t + .35, .6)
    place(sfx, pop_snd(72), S('l3') + 1.5, .7)
    place(sfx, strain(.9), S('l4') + .2, .9)
    place(sfx, buzz(.25, 46), S('l4') + .9, .55); place(sfx, buzz(.25, 46), S('l4') + 1.2, .55)
    place(sfx, thud(.8), S('l5') + .85, 1)
    place(sfx, pop_snd(70), S('l5') + .9, .7)
    speech_beeps(S('l5') + .5, '让一让……我也有车位票！', 76)
    for i in range(6):
        place(sfx, tick(.3), S('l6') + i * .15, .5)
    for k in range(3):
        place(sfx, lp(noise(.25), 200) * np.exp(-tvec(.25) / .08) * .5, S('l6') + 1 + k * .6, .7)   # 一跳一跳的胀痛
    for i in range(3):
        place(sfx, pop_snd(78 + i * 3), S('l6') + .3 + i * .5, .7)
    place(sfx, stamp_snd(), S('l7') + .8, 1)

    # —— 过去 ——
    place(sfx, tape(.95), SS('past') - .2, 1)
    place(sfx, rise(1.2, 55, 74), S('p1') + .6, .6)
    place(sfx, coin(.45), S('p1') + 1.9, .7)
    speech_beeps(S('p1') + 2.3, '有位置！', 84)
    place(sfx, whoosh(.4, True, .4), S('p2') - .25, .6)
    place(sfx, rise(2.2, 50, 74), S('p2'), .35)
    place(sfx, pop_snd(76), S('p2') + .9, .6)
    place(sfx, buzz(.2, 60), S('p2') + 2.2, .4); place(sfx, pop_snd(84), S('p2') + 2.2, .7)
    place(sfx, pop_snd(76), S('p4') - .05, .7); place(sfx, coin(.35), S('p4') + .2, .5)
    place(sfx, buzz(.2, 52), S('p4') + .5, .4)
    hard = [5, 5, 4, 2, 1, 1, 1, 0]
    for i, h in enumerate(hard):
        t = S('p5') + .1 + i * .35
        place(sfx, pop_snd(74 + i * 2, .35), t, .6)
        place(sfx, crunch(.5) if h >= 4 else (slurp(.35)[:int(.2 * SR)] if h <= 1 else tick(.4)), t + .08, .7)

    # —— 工地：咀嚼信号 ——
    place(sfx, whoosh(.45, True, .4), SS('site') - .25, .6)
    for t in np.arange(S('s2') + .5, S('s3') + 1.5, .9):
        place(sfx, scrape(.5, .4), t, .6, .5)
    # 现代小孩嚼东西（s3）：每 0.5 秒一下，信号每秒 2.2 个
    for t in np.arange(S('s3'), S('s4') - .2, .5):
        place(sfx, crunch(.3), t, .5, -.4)
    for k in range(int((S('s4') - .2 - S('s3')) * 2.2)):
        place(sfx, zap(.35), S('s3') + k / 2.2, .45, -.2)
    # 原始人小孩（s4）：嚼得又快又用力，工地推墙
    for t in np.arange(S('s4'), S('s5') - .2, .4):
        place(sfx, crunch(.6), t, .55, -.4)
    for k in range(int((S('s5') - .2 - S('s3')) * 5)):
        tt = S('s3') + k / 5
        if S('s4') - .2 < tt < S('s5') - .2:
            place(sfx, zap(.45), tt, .45, -.2)
    for t in np.arange(S('s4') + .2, EN('s4') - .3, .7):
        place(sfx, scrape(.6, .6), t, .7, .5)
    place(sfx, rise(1.0, 60, 79), EN('s4') - .9, .5); place(sfx, coin(.45), EN('s4') - .1, .6)
    # 现代小孩喝粥（s5）：吸溜，工地睡觉
    for t in np.arange(S('s5'), S('s6') - .3, 1.0):
        place(sfx, slurp(.5), t, .6, -.4)
    place(sfx, snore(1.4), S('s5') + .4, .6, .5); place(sfx, snore(1.4), S('s5') + 2.0, .5, .5)
    speech_beeps(S('s5') + 1.1, '今天又没活？', 72)
    place(sfx, whoosh(.4, False, .4), S('s6') - .3, .6)
    place(sfx, pop_snd(70), S('s6') + .6, .8); place(sfx, buzz(.18, 55), S('s6') + .75, .35)

    # —— 大鼠 ——
    place(sfx, whoosh(.45, True, .4), SS('rats') - .25, .6)
    for k in range(12):
        place(sfx, squeak(.5), SS('rats') + .5 + k * 1.3 + rng.random() * .5, .5, -.5 if k % 2 else .5)
    for t in np.arange(S('r2'), S('r4'), .55):
        place(sfx, crunch(.45), t, .55, -.6)
    for t in np.arange(S('r2') + .3, S('r4'), .9):
        place(sfx, slurp(.35), t, .45, .6)
    t0, t1 = S('r2') + 1.5, S('r3') + .3
    for k in range(60):
        place(sfx, tick(.35), t0 + (t1 - t0) * k / 60, .5)
    place(sfx, rise(.8, 55, 67), S('r3') + .3, .4)
    place(sfx, pop_snd(68), S('r3') + 1.3, .8); place(sfx, buzz(.2, 50), S('r3') + 1.45, .35)
    place(sfx, whoosh(.45, True, .4), S('r4') - .1, .6)
    place(sfx, pop_snd(80), S('r4') + .3, .6); place(sfx, pop_snd(76), S('r4') + .5, .6)
    place(sfx, coin(.4), S('r4') + 1.2, .6)

    # —— 磨牙 ——
    place(sfx, whoosh(.5, True, .4), SS('wear') - .25, .6)
    d = S('w2') + .8 - S('w1')
    grit = hp(noise(d), 2500) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 3 * tvec(d)))) * .05
    place(sfx, grit * np.minimum(1, tvec(d) / .3) * np.clip((d - tvec(d)) / .3, 0, 1), S('w1'), 1)
    place(sfx, pop_snd(76), S('w1') + .4, .7)
    place(sfx, scrape(1.2, .5), S('w2') + .3, .8, -.3)
    place(sfx, rise(1.4, 58, 77), S('w2') + 1.4, .5); place(sfx, coin(.45), S('w2') + 2.8, .6)
    speech_beeps(S('w2') + 2.6, '空出来了！', 84)
    for k in range(5):
        place(sfx, blip(96 + (k % 2) * 3, .05, .25, .35), S('w3') + .2 + k * .45, .45, .3)
    place(sfx, pop_snd(80), S('w3') + .3, .6)

    # —— 进化错配 ——
    place(sfx, glitch(.35), SS('mismatch') - .25, .45)
    place(sfx, stamp_snd(), S('m1') - .05, 1)
    place(sfx, buzz(.3, 42), S('m2') - .1, .55)
    for i in range(3):
        place(sfx, blip(72 + i * 3, .06), S('m2') + .3 + i * .45, .55)

    # —— 攻略 ——
    place(sfx, whoosh(.45, True, .4), SS('guide') - .25, .6)
    speech_beeps(S('g1') + .2, '疼……要不要拔？', 70)
    place(sfx, whoosh(.4, True, .45), S('g2') - .3, .6)
    for t in (S('g2') + .2, S('g2') + 1.8, S('g3') + .1, S('g4') + .1):
        place(sfx, coin(.35), t, .55)
    place(sfx, drill(.45, .35), S('g3') + .5, .5, .4)

    # —— 结尾 ——
    place(sfx, whoosh(.5, True, .4), SS('end') - .25, .6)
    speech_beeps(S('e0') + .2, '我没长错……只是来晚了。', 66)
    for k in range(6):
        place(sfx, tick(.3), S('e1') + .3 + k * .14, .5, .5)
    speech_beeps(S('e1') + 1.2, '嚼嚼？', 84)
    place(sfx, crunch(.6), EN('e1') - .2, .5, .5)
    place(sfx, sparkle(.9, 84, .3), SS('card') + .1, .6)
    place(sfx, pop_snd(84), SS('card') + .2, .6)


# ================= 响度（EBU R128 / ITU BS.1770） =================
def lufs(x):
    """x：(2, n)。K 计权 + 400ms 块 + 绝对 / 相对门限，返回积分响度"""
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621]
    y = lfilter(b2, a2, lfilter(b1, a1, x, axis=1), axis=1)
    blk, hop = int(.4 * SR), int(.1 * SR)
    ms = np.array([np.mean(y[:, i:i + blk] ** 2, axis=1).sum() for i in range(0, y.shape[1] - blk, hop)])
    lk = -0.691 + 10 * np.log10(ms + 1e-12)
    g = ms[lk > -70]
    rel = -0.691 + 10 * np.log10(g.mean()) - 10
    g = g[(-0.691 + 10 * np.log10(g + 1e-12)) > rel]
    return -0.691 + 10 * np.log10(g.mean())


def limit(x, ceil_db=-1.5, hold=.015):
    """前视限幅。峰值在 4 倍过采样后的信号上找（近似真峰值），免得采样点之间冒顶。"""
    ceil = 10 ** (ceil_db / 20)
    up = np.max(np.abs(resample_poly(x, 4, 1, axis=1)), axis=0)
    env = np.max(up[:x.shape[1] * 4].reshape(-1, 4), axis=1)
    g = np.minimum(1.0, ceil / np.maximum(env, 1e-9))
    k = int(hold * SR)
    g = uniform_filter1d(minimum_filter1d(g, size=2 * k + 1), size=k + 1)
    return x * g, -20 * np.log10(g.min()), np.mean(g < .999) * 100


def main(out):
    build()
    mix = sfx + amb
    gain = TARGET_LUFS - lufs(mix)
    mix, red, share = limit(mix * 10 ** (gain / 20))
    wavfile.write(out, SR, (mix.T * 32767).astype(np.int16))
    print(f'写出 {out}  {DUR:.2f}s  增益 {gain:+.1f} dB  限幅最多 {red:.1f} dB（{share:.2f}% 采样）  积分响度 {lufs(mix):.1f} LUFS')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'out/audio.wav')
