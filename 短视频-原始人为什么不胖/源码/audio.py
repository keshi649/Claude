"""《原始人为什么不胖？》声音：只有音效和环境声——没有旁白配音、没有角色配音，也没有配乐。
对话框和第一集一样配"哔哔"打字音。全部按 timeline.json 对齐，用 numpy 合成；
响度定在约 −18 LUFS（和前几集"只有音效"版一致），峰值压在 −1.5 dBTP 以下。
用法：python3 audio.py out.wav
"""
import json
import os
import subprocess
import sys

import numpy as np
from scipy.io import wavfile
from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d
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
def CH(i, k): return LN[i]['chunks'][k][0]
def MK(i, k=0): return LN[i]['marks'][k]
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
    """对话气泡逐字打出的"哔哔"声（本集的台词都有配音，留着备用）"""
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


# ---------------- 本集新加的音效 ----------------
def mixa(*xs):
    """把几段长短不一的声音叠在一起"""
    n = max(len(x) for x in xs)
    out = np.zeros(n)
    for x in xs:
        out[:len(x)] += x
    return out


def sneeze8(T, gain=1.0, pan=0.0, pitch=0):
    """8 位喷嚏：两声上扬的"啊——"，再一声"嚏！"；T 是喷出来的那一刻"""
    for dt, m in [(-.62, 64), (-.32, 69)]:
        place(sfx, square(m + pitch, .22, .5, .45, a=.01, dec=.3, sus=.8, rel=.05, slide=3), T + dt, gain * .8, pan)
    t = tvec(.35)
    burst = bp(noise(.35), 900, 4500) * np.exp(-t / .07) * .14 + pulse_wave(mf(80 + pitch) * np.exp(-t / .08) + 200, .5) * np.exp(-t / .05) * .1
    place(sfx, burst, T, gain, pan)


def siren(d, rate=2.2, vel=.5):
    """警报：两个音来回切"""
    t = tvec(d)
    f = np.where(np.sin(2 * np.pi * rate * t) > 0, 880.0, 660.0) * (1 + .01 * np.sin(2 * np.pi * 6 * t))
    x = pulse_wave(f, .5) * .5 + pulse_wave(f * 2, .25) * .15
    return lp(x, 3500) * np.minimum(1, t / .05) * np.clip((d - t) / .1, 0, 1) * vel * .18


def whistle(d=.45, vel=.5):
    """保安的哨子：带颤音的高音"""
    t = tvec(d)
    f = 2600 * (1 + .03 * np.sign(np.sin(2 * np.pi * 28 * t)))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + .25 * bp(noise(d), 2000, 4000)
    return x * np.minimum(1, t / .02) * np.clip((d - t) / .06, 0, 1) * vel * .14


def punch(vel=.7):
    t = tvec(.25)
    return (np.sin(2 * np.pi * np.cumsum(90 * (1 + np.exp(-t / .02))) / SR) * np.exp(-t / .06) + lp(noise(.25), 2500) * np.exp(-t / .02) * .8) * vel * .35


def poof(vel=.5):
    t = tvec(.4)
    return mixa(bp(noise(.4), 600, 3000) * np.exp(-t / .1) * vel * .3, pop_snd(90, vel * .6))


def moo(vel=.5):
    d = 1.0
    t = tvec(d)
    f = 125 - 25 * t / d + 6 * np.sin(2 * np.pi * 5 * t)
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    x = bp(saw, 250, 900) * 1.5 + lp(saw, 400) * .5
    return x * np.minimum(1, t / .15) * np.clip((d - t) / .25, 0, 1) * vel * .25


def clop(vel=.4):
    out = np.zeros(int(.25 * SR))
    for dt in (0, .11):
        L = int(.03 * SR)
        b = bp(rng.standard_normal(L), 900, 3000) * np.exp(-np.arange(L) / (L / 4))
        i = int(dt * SR)
        out[i:i + L] += b
    return out * vel * .5


def engine(d, vel=.4):
    t = tvec(d)
    x = pulse_wave(np.full(len(t), 55.0), .3) * (.7 + .3 * np.sin(2 * np.pi * 9 * t)) + lp(noise(d), 200) * .5
    return lp(x, 600) * np.minimum(1, t / .3) * np.clip((d - t) / .3, 0, 1) * vel * .25


def spray(d=.45, vel=.4):
    t = tvec(d)
    return hp(noise(d), 3500) * np.minimum(1, t / .02) * np.exp(-t / .25) * vel * .25


def levelup(vel=.5):
    out = np.zeros(int(.8 * SR))
    for k, m in enumerate([72, 76, 79, 84]):
        s = square(m, .1 if k < 3 else .3, .5, vel)
        i = int(k * .09 * SR)
        out[i:i + len(s)] += s[:len(out) - i]
    return out


def chime(m=88, vel=.4):
    t = tvec(.8)
    f = mf(m)
    return (np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t / .25) * vel * .15


def whirr(d=.6, vel=.4):
    t = tvec(d)
    return pulse_wave(180 + 120 * t / d, .25) * np.minimum(1, t / .03) * np.clip((d - t) / .08, 0, 1) * vel * .08


def bark(vel=.5):
    t = tvec(.18)
    return (pulse_wave(420 * np.exp(-t / .08) + 180, .5) * .6 + bp(noise(.18), 400, 2000) * .5) * np.exp(-t / .06) * vel * .3


def bloop(vel=.4):
    t = tvec(.15)
    return np.sin(2 * np.pi * np.cumsum(200 + 600 * t / .15) / SR) * np.sin(np.pi * t / .15) * vel * .25


def sniff(vel=.4):
    out = np.zeros(int(.4 * SR))
    for k in range(2):
        L = int(.08 * SR)
        out[int(k * .14 * SR):int(k * .14 * SR) + L] += bp(rng.standard_normal(L), 1500, 6000) * np.sin(np.pi * np.arange(L) / L)
    return out * vel * .2


def wheeze(d=.6, vel=.3):
    t = tvec(d)
    f = 1800 + 200 * np.sin(2 * np.pi * 3 * t)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * .4 + bp(noise(d), 2000, 5000) * .6) * (np.sin(np.pi * t / d) ** 2) * vel * .15


def giggle(vel=.4):
    out = np.zeros(int(.5 * SR))
    for k in range(5):
        s = blip(84 + (k % 2) * 3 + k, .05, .5, vel)
        out[int(k * .08 * SR):int(k * .08 * SR) + len(s)] += s[:len(out) - int(k * .08 * SR)]
    return out


def step_snd(vel=.3):
    t = tvec(.05)
    return lp(noise(.05), 900) * np.exp(-t / .012) * vel * .5


def evil(vel=.5):
    return mixa(square(40, .2, .5, vel, dec=.3, sus=.9), np.concatenate([np.zeros(int(.28 * SR)), square(39, .3, .5, vel, dec=.3, sus=.9)]))


def amb_nose(d):
    """身体里：慢慢的呼吸声 + 远远的心跳"""
    t = tvec(d)
    x = bp(noise(d), 200, 1200) * (.5 + .5 * np.sin(2 * np.pi * .25 * t)) ** 2 * .06
    for k in np.arange(.2, d - .3, .95):
        for dt, a in ((0, 1), (.22, .7)):
            tt = tvec(.18)
            beat = np.sin(2 * np.pi * 48 * tt) * np.exp(-tt / .05) * .12 * a
            i = int((k + dt) * SR)
            x[i:i + len(beat)] += beat[:len(x) - i]
    return x


def amb_parlor(d):
    """维多利亚时代的客厅：壁炉噼啪 + 座钟滴答"""
    x = lp(noise(d), 200) * .03
    k = .1
    while k < d - .05:
        L = int((.003 + rng.random() * .006) * SR)
        b = bp(rng.standard_normal(L), 800, 4000) * np.exp(-np.arange(L) / (L / 3)) * (.05 + rng.random() * .08)
        i = int(k * SR)
        x[i:i + L] += b[:len(x) - i]
        k += .05 + rng.random() * .35
    for k in np.arange(.3, d - .05, .5):
        tk = tick(.25)
        i = int(k * SR)
        x[i:i + len(tk)] += tk[:len(x) - i] * .5
    return x


def amb_room(d):
    t = tvec(d)
    return (lp(noise(d), 250) * .5 + np.sin(2 * np.pi * 60 * t) * .05) * .05



def bell_ding(vel=.5, f=1180):
    """饱腹警报的铃：叮——（几个不成谐波的泛音）"""
    t = tvec(1.2)
    x = (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / .3) + .3 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / .15))
    return x * np.exp(-t / .45) * np.minimum(1, t / .002) * vel * .16


def treadmill(d, vel=.4):
    out = np.zeros(int(d * SR))
    for k in np.arange(0, d - .1, .36):
        L = int(.06 * SR)
        b = lp(rng.standard_normal(L), 500) * np.exp(-np.arange(L) / (L / 4))
        i = int(k * SR)
        out[i:i + L] += b[:len(out) - i]
    return out * vel * .4


def munch(vel=.4):
    out = np.zeros(int(.16 * SR))
    for k in range(2):
        L = int(.03 * SR)
        o = int(k * .07 * SR)
        out[o:o + L] += bp(rng.standard_normal(L), 600, 3000) * np.exp(-np.arange(L) / (L / 3))
    return out * vel * .3


def amb_fire(d):
    """篝火：噼啪声 + 远处的虫鸣"""
    t = tvec(d)
    x = lp(noise(d), 300) * .04 + bp(noise(d), 4000, 7000) * .012 * (.5 + .5 * np.sign(np.sin(2 * np.pi * 9 * t)))
    k = .1
    while k < d - .05:
        L = int((.003 + rng.random() * .006) * SR)
        b = bp(rng.standard_normal(L), 800, 4000) * np.exp(-np.arange(L) / (L / 3)) * (.05 + rng.random() * .1)
        i = int(k * SR)
        x[i:i + L] += b[:len(x) - i]
        k += .05 + rng.random() * .3
    return x


SPK_PITCH = {'你': 76, '财务部': 64, '采购部': 72, '饱腹警报': 84}


def dialog_beeps():
    """对话框逐字打出的"哔哔"声（和第一集一样）"""
    for l in TLD['lines']:
        if l['kind'] != 'D':
            continue
        m, n = SPK_PITCH.get(l['who'], 74), len(l['text'])
        for i, ch in enumerate(l['text']):
            if ch in '，。…！？：、 ～' or i % 2:
                continue
            place(sfx, blip(m + (i * 7 % 5) - 2, .035, .5, .45), l['t0'] + .08 + i * (l['typed'] - l['t0'] - .08) / n, .55)


# ================= 按时间轴排音效（与 scenes*.js 对应） =================
def build():
    # —— 环境声 ——
    bed(amb_savanna, 0, S('h4') - .12)
    bed(amb_savanna, S('h4') - .12, S('h5') - .12, .5); bed(amb_city, S('h4') - .12, S('h5') - .12, .5)
    bed(amb_city, S('h5') - .12, SE('hook'))
    bed(amb_room, SS('budget'), SE('budget'))
    bed(amb_savanna, SS('ancient'), SE('ancient'))
    bed(amb_city, SS('modern'), SE('modern'), .6); bed(amb_room, SS('modern'), SE('modern'))
    bed(amb_lab, SS('lab'), SE('lab'))
    bed(amb_room, SS('mismatch'), SE('mismatch'))
    bed(amb_room, SS('guide'), SE('guide'))
    bed(amb_fire, SS('end'), SE('end'))
    bed(amb_savanna, SS('card'), DUR)
    dialog_beeps()

    # —— 开头 ——
    place(sfx, whoosh(.5, True, .5), 0, .6); place(sfx, sparkle(.6, 88, .35), .15, .5)
    for k in range(10):
        place(sfx, step_snd(.3), .3 + k * .3, .4, -.3)
    place(sfx, rise(.3, 64, 76), S('d1') - .3, .6, .4); place(sfx, pop_snd(84), S('d1') - .1, .6, .4)
    place(sfx, sad_slide(), S('h2') - .05, .5); place(sfx, stamp_snd(), S('h2') + .05, .6)
    place(sfx, whoosh(.4, True, .45), S('h3') - .15, .6)
    place(sfx, pop_snd(80), S('h3') + .05, .6); place(sfx, pop_snd(84, .4), CH('h3', 1), .5)
    k = CH('h3', 1) + .2
    while k < EN('h3') - .3:
        place(sfx, tick(.35), k, .5)
        k += .18
    place(sfx, coin(.5), EN('h3') - .25, .6)
    for k in range(8):
        place(sfx, step_snd(.25), S('h3') + k * .5, .35, -.2)
    place(sfx, whoosh(.4, True, .45), S('h4') - .15, .6)
    for k in range(8):
        place(sfx, blip(64 + k * 2, .04, .5, .35), CH('h4', 1) + k * .14, .4)
    place(sfx, coin(.6), CH('h4', 2), .7); place(sfx, pop_snd(76), CH('h4', 2), .6)
    place(sfx, whoosh(.4, True, .45), S('h5') - .15, .6)
    place(sfx, sparkle(.8, 84, .35), CH('h5', 1), .5)
    place(sfx, whoosh(.25, False, .35), CH('h5', 1) + .5, .5)
    place(sfx, thud(.7), S('h6') - .05, .6); place(sfx, pop_snd(72, .6), S('h6'), .7)

    # —— 财务部 ——
    place(sfx, whoosh(.5, False, .45), SS('budget') - .2, .5)
    for i in range(10):
        place(sfx, pop_snd(80 + (i % 5) * 2, .3), S('b1') + .2 + i * .08, .4, (i % 5 - 2) * .3)
    for i in range(5):
        place(sfx, blip(60 + i * 3, .05, .5, .4), CH('b1', 2) - .1 + i * .05, .5, (i - 2) * .3)
    place(sfx, buzz(.25, 44), CH('b1', 2) + .1, .5); place(sfx, thud(.6), CH('b1', 2) + .15, .6)
    place(sfx, whoosh(.4, True, .4), S('b2') - .2, .5)
    for k in range(10):
        place(sfx, tick(.3), S('b2') + .3 + k * .32, .4, -.3)
    place(sfx, treadmill(S('d2') + .4 - S('b3') + .2, .5), S('b3') - .2, .6, .5)
    place(sfx, square(76, .35, .5, .5, slide=-5), MK('b3'), .45); place(sfx, pop_snd(70, .5), MK('b3') + .1, .5)
    place(sfx, blip(70, .1), S('b4') + .2, .5, .5); place(sfx, blip(70, .1), S('b4') + .4, .5, .5)

    # —— 几十万年前 ——
    place(sfx, tape(.95), SS('ancient') - .2, .55)
    for k in range(12):
        place(sfx, step_snd(.25), S('a1') + k * .45, .35, -.2)
    place(sfx, whoosh(.3, True, .4), CH('a1', 3) - .2, .5)
    for k in range(4):
        place(sfx, pop_snd(86 + k * 2, .4), CH('a1', 3) + .4 + k * .3, .5, .3)
    place(sfx, pop_snd(80), S('a2') - .1, .6)
    for k in range(3):
        place(sfx, crunch(.5), CH('a2', 2) + k * .22, .5, -.3)
    place(sfx, pop_snd(84, .4), MK('a2', 0), .5); place(sfx, pop_snd(80, .4), MK('a2', 1), .5)
    place(sfx, bell_ding(.6), CH('a3', 1) - .05, .9); place(sfx, bell_ding(.45, 1320), CH('a3', 1) + .25, .7)

    # —— 如今 ——
    place(sfx, tape(.8), SS('modern') - .2, .5)
    place(sfx, engine(S('m4') - SS('modern'), .35), SS('modern'), .45, -.2)
    k = S('m1')
    while k < S('d4') - .2:
        place(sfx, munch(.4), k, .45, .4)
        k += .32
    for t0, pan in ((CH('m1', 1) + .2, 0), (CH('m1', 2), -.4), (CH('m1', 2) + .6, .4), (CH('m1', 3), 0)):
        place(sfx, pop_snd(82, .4), t0, .5, pan)
    place(sfx, whoosh(.3, True, .35), S('m2') - .1, .45)
    for i, n in enumerate((2, 2, 5)):
        for k in range(n):
            place(sfx, blip(72 + k * 3 + i * 2, .05, .5, .35), S('m2') + .2 + i * .35 + k * .06, .45)
    place(sfx, coin(.4), CH('m2', 2), .5)
    place(sfx, snore(1.2), CH('m3', 1), .6, -.4); place(sfx, snore(1.2), CH('m3', 1) + 1.3, .5, -.4)
    place(sfx, buzz(.25, 46), CH('m3', 2), .5)
    place(sfx, bell_ding(.35), S('d4') + .6, .6, -.4)
    place(sfx, whoosh(.3, True, .35), S('m4') - .15, .5); place(sfx, stamp_snd(), CH('m4', 2), .6)

    # —— 实验 ——
    place(sfx, whoosh(.5, False, .45), SS('lab') - .2, .5)
    for i in range(20):
        place(sfx, pop_snd(82 + (i % 4) * 2, .25), S('l1') + .2 + i * .07, .35, ((i % 10) - 4.5) * .1)
    place(sfx, pop_snd(78), CH('l1', 2), .6, -.4); place(sfx, pop_snd(84), CH('l1', 3), .6, .4)
    place(sfx, coin(.4), CH('l1', 4), .5)
    place(sfx, whoosh(.3, True, .35), S('l2') - .1, .45)
    place(sfx, blip(66, .15, .5, .5), S('l2') + .1, .5, -.4)
    place(sfx, thud(.6), CH('l2', 1) + .3, .6); place(sfx, buzz(.2, 46), CH('l2', 2), .5, -.4)
    place(sfx, blip(66, .15, .5, .5), S('l3') + .1, .5, .4); place(sfx, coin(.5), CH('l3', 1), .6, .4)

    # —— 进化错配 ——
    place(sfx, glitch(.4), SS('mismatch') - .3, .7)
    place(sfx, thud(.7), S('x1') - .05, .7); place(sfx, sparkle(.5, 72, .3), S('x1'), .5)
    place(sfx, pop_snd(80), CH('x1', 1) - .1, .6)
    place(sfx, blip(72, .08), CH('x1', 1) + .2, .5); place(sfx, blip(72, .08), CH('x1', 2), .5)
    place(sfx, buzz(.35, 40), CH('x1', 3) + .3, .4)
    place(sfx, engine(1.3, .5), CH('x1', 3) - .2, .4, -.6); place(sfx, square(84, .12, .5, .5), CH('x1', 3) + .3, .4)

    # —— 攻略 ——
    place(sfx, whoosh(.5, True, .45), S('g1') + .2, .5)
    for t0 in (CH('g1', 1), CH('g2', 2), S('g3'), S('g4'), CH('g4', 2)):
        place(sfx, coin(.4), t0, .5)
    for i in range(6):
        place(sfx, pop_snd(84 + i * 2, .35), CH('g2', 0) + i * .45, .45, (i - 2.5) * .2)

    # —— 结尾 ——
    place(sfx, chime(84, .35), CH('z2', 1), .5)
    place(sfx, sparkle(.9, 84, .3), SS('card') + .1, .6); place(sfx, pop_snd(84), SS('card') + .2, .6)


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
