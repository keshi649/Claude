"""《原始人为什么不过敏？》声音：音效、环境声和 8 句角色台词——没有旁白配音，也没有配乐。
全部按 timeline.json 对齐，音效和环境声用 numpy 合成；音效床的响度定在约 −18 LUFS（和前两集"只有音效"版一致），
角色台词（narration.py 合成）放在对话气泡弹出的那一刻，说话时音效和环境声自动压低一点；峰值压在 −1.5 dBTP 以下。
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


# ================= 按时间轴排音效（与 scenes*.js 对应） =================
HOOK_SNEEZE = [2.15, 6.6, 9.4]


def build():
    # —— 环境声 ——
    bed(amb_city, 0, SS('guard')); bed(amb_savanna, 0, SS('guard'), .6)
    bed(amb_nose, SS('guard'), S('g5') - .1)
    bed(amb_city, S('g5') - .1, SE('guard'))
    tA = CH('y1', 1) - .15
    bed(amb_savanna, SS('history'), tA)
    bed(amb_parlor, tA, S('y3') - .1)
    bed(amb_savanna, S('y3') - .1, S('y4') - .1)
    bed(amb_parlor, S('y4') - .1, SE('history'), .7); bed(amb_savanna, S('y4') - .1, SE('history'), .5)
    bed(amb_savanna, SS('train'), S('t4') - .15)
    bed(amb_room, S('t4') - .15, S('c4') - .2)
    bed(amb_nose, S('c4') - .2, SE('train'))
    bed(amb_savanna, SS('amish'), S('a4') - .1)
    bed(amb_lab, S('a4') - .1, SE('amish'))
    bed(amb_room, SS('peanut'), SE('peanut'))
    bed(amb_nose, SS('mismatch'), SE('mismatch'))
    bed(amb_clinic, SS('guide'), SE('guide'))
    bed(amb_nose, SS('end'), SE('end'))
    bed(amb_savanna, SS('card'), DUR)

    # —— 开头：标题、喷嚏、数据、想象 ——
    place(sfx, whoosh(.5, True, .5), 0, .6); place(sfx, sparkle(.6, 88, .35), .15, .5)
    for T in HOOK_SNEEZE:
        sneeze8(T, .9, .1)
    place(sfx, pop_snd(80), S('h2') - .1, .8)
    place(sfx, pop_snd(80), S('h3') - .1, .8)
    for i in range(6):
        place(sfx, pop_snd(84 + i * 2, .3), S('h3') + .1 + i * .07, .5, .3)
    place(sfx, sad_slide(), S('h3') + 1.6, .35, .3)
    for i in range(3):
        place(sfx, pop_snd(76 + i * 4, .4), S('h4') - .05 + i * .08, .6)
    for k in range(10):
        place(sfx, bp(noise(.12), 2000, 6000) * .12, S('h4') + .2 + k * .3, .6, -.2)
    place(sfx, pop_snd(72, .6), CH('h4', 1), .8)

    # —— 鼻腔检查站 ——
    place(sfx, whoosh(.5, False, .5), SS('guard') - .2, .6)
    place(sfx, pop_snd(84), S('g1') + .2, .7)
    for i in range(3):
        place(sfx, blip(76 + i * 4, .06), S('g1') + .4 + i * .12, .5)
    place(sfx, evil(.6), S('g2') + .1, .6, -.4)
    place(sfx, pop_snd(70), S('g2') + .5, .6, -.4); place(sfx, pop_snd(70), S('g2') + .9, .6, -.4)
    place(sfx, punch(.8), MK('g2'), .8); place(sfx, poof(.6), MK('g2') + .05, .8, -.2)
    for k in range(8):
        place(sfx, step_snd(.3), S('g3') + k * .3, .5, -.5)
    for i in range(3):
        place(sfx, pop_snd(86 - i * 3, .4), CH('g3', 0) + .25 + i * .6, .6, -.3)
    place(sfx, coin(.5), CH('g3', 1), .7)
    place(sfx, whistle(.5, .6), S('c1') - .35, .7)
    place(sfx, squeak(.3), S('c2') - .1, .5, -.3)
    place(sfx, buzz(.25, 42), CH('g4', 1), .5)
    place(sfx, siren(S('g5') - .1 - MK('g4'), vel=.55), MK('g4'), .8)
    place(sfx, thud(.6), MK('g4'), .6)
    # 喷嚏特写
    place(sfx, whoosh(.3, True, .4), S('g5') - .15, .6)
    for d in (.42, 1.87):
        sneeze8(S('g5') + d, 1.0, 0, -2)
    for i, dt in enumerate((.1, .75, 1.4)):
        place(sfx, pop_snd(80 + i * 3, .45), CH('g5', 0) + dt, .6, (i - 1) * .4)
    place(sfx, siren(SE('guard') - CH('g5', 1), vel=.25), CH('g5', 1), .6, .5)

    # —— 一百五十年前 ——
    place(sfx, pop_snd(76), S('y1') - .2, .6); place(sfx, pop_snd(70, .4), S('y1') + .3, .6)
    place(sfx, tape(.95), CH('y1', 1) - .45, 1)
    place(sfx, pop_snd(80), CH('y1', 1) + .1, .6)
    place(sfx, square(79, .12, .5, .5, slide=5), CH('y1', 2) + .6, .6)
    for T in (S('y2') + .9, S('y2') + 2.3):
        sneeze8(T, .8, .1, 2)
    for i, dt in enumerate((.1, .5, 1.3)):
        place(sfx, pop_snd(82 + i * 2, .4), S('y2') + dt, .6)
    place(sfx, whoosh(.4, True, .4), S('y3') - .15, .5)
    place(sfx, pop_snd(80), S('y3') + .4, .6); place(sfx, coin(.5), CH('y3', 1) + .1, .6)
    for i in range(2):
        place(sfx, pop_snd(76, .5), S('y4') + .2 + i * .6, .6)
    for dt in (.6, 1.8, 3.0):
        sneeze8(S('y4') + dt, .45, -.3, 2)
    place(sfx, thud(.5), CH('y4', 2), .6); place(sfx, square(74, .3, .5, .5, slide=-5), CH('y4', 2) + .05, .5)

    # —— 训练营 ——
    place(sfx, pop_snd(80), S('t1'), .6)
    for k in range(14):
        place(sfx, blip(70 + k, .04, .5, .35), CH('t2', 1) + k * .32, .35, .4)
    place(sfx, bloop(.5), MK('t2', 0), .7, -.5); place(sfx, bloop(.4), MK('t2', 0) + .25, .6, -.5)
    place(sfx, bark(.6), MK('t2', 1), .8, .5); place(sfx, bark(.5), MK('t2', 1) + .25, .6, .5)
    for k in range(6):
        place(sfx, step_snd(.35), MK('t2', 2) - .4 + k * .14, .6, .4)
    for k in range(10):
        place(sfx, pop_snd(88 + (k % 3) * 2, .25), MK('t2', 0) + .4 + k * .35, .4, (k % 3 - 1) * .4)
    place(sfx, coin(.5), CH('t3', 1) + .4, .6); place(sfx, buzz(.2, 44), CH('t3', 1) + .8, .5, .4)
    place(sfx, levelup(.55), CH('t3', 2) + .1, .8); place(sfx, chime(88, .5), CH('t3', 2) + .5, .8)
    # 现代的家
    place(sfx, whoosh(.4, False, .4), S('t4') - .2, .5)
    for k in range(6):
        place(sfx, blip(82 - k * 2, .05, .5, .35), S('t4') - .1 + k * .05, .4)
    k = S('t4')
    while k < S('c4') - .3:
        place(sfx, spray(.4, .5), k, .35, .5)
        k += 1.0
    place(sfx, sad_slide(), CH('t4', 2), .5)
    # 新兵
    place(sfx, squeak(.4), S('c4') - .1, .5, -.3)
    place(sfx, clank(.5, 1200), EN('c4') - .3, .6)
    place(sfx, siren(SE('train') - EN('c4') + .3, vel=.55), EN('c4') - .3, .8)
    for i in range(3):
        place(sfx, pop_snd(78 - i * 3, .4), S('t5') + .3 + i * .5, .6, (i - 1) * .4)

    # —— 两群农民 ——
    place(sfx, whoosh(.4, True, .5), S('a1') + .1, .6); place(sfx, thud(.5), S('a1') + .25, .5)
    place(sfx, pop_snd(80), CH('a1', 2) - .1, .6)
    place(sfx, moo(.6), S('a1') + 1.2, .6, -.5); place(sfx, moo(.5), CH('a2', 1) + .2, .7, -.5)
    for k in range(4):
        place(sfx, clop(.4), S('a1') + 2.0 + k * .4, .5, -.6)
    place(sfx, engine(S('a3') - SS('amish'), .5), SS('amish'), .55, .6)
    place(sfx, pop_snd(80), CH('a2', 1) + .3, .6, -.4); place(sfx, pop_snd(80), CH('a2', 2) + .3, .6, .4)
    place(sfx, whoosh(.4, True, .4), S('a3') - .1, .5)
    for k in range(8):
        place(sfx, blip(64 + k * 2, .04, .5, .35), S('a3') + .2 + k * .1, .4)
    place(sfx, stamp_snd(), CH('a3', 1), .8)
    # 小鼠
    place(sfx, whoosh(.3, True, .35), S('a4') - .15, .5)
    for k in range(5):
        place(sfx, squeak(.3), S('a4') + .2 + k * .7, .4, (-.5 if k % 2 else .5))
    place(sfx, sniff(.5), S('a4') + .5, .6, -.5); place(sfx, sniff(.5), S('a4') + .6, .6, .5)
    place(sfx, wheeze(1.2, .45), CH('a4', 1) + .2, .6, .5)
    place(sfx, buzz(.2, 44), CH('a4', 1) + .3, .5, .5); place(sfx, coin(.5), CH('a4', 2), .7, -.5)

    # —— 花生 ——
    place(sfx, giggle(.4), S('p1') + .2, .5)
    place(sfx, pop_snd(76), CH('p1', 1) - .1, .7); place(sfx, buzz(.15, 46), CH('p1', 3) + .1, .4)
    place(sfx, whoosh(.4, True, .4), S('p2') - .05, .5)
    for k in range(8):
        place(sfx, blip(64 + k * 2, .04, .5, .35), S('p2') + .1 + k * .1, .4)
    place(sfx, stamp_snd(), CH('p2', 1), .7)
    place(sfx, pop_snd(80), S('p3') - .1, .7)
    place(sfx, pop_snd(84), CH('p3', 2) - .1, .6, -.4); place(sfx, pop_snd(76), CH('p3', 3) - .1, .6, .4)
    for k in range(5):
        place(sfx, clank(.25, 2400), CH('p3', 2) + .2 + k * .45, .3, -.5)
    place(sfx, giggle(.35), S('c5') + .5, .4, -.4)
    place(sfx, whoosh(.4, True, .4), S('p4') - .15, .5)
    for k in range(5):
        place(sfx, blip(60 - k, .06, .5, .4), CH('p4', 1) + k * .07, .5, .4)
    place(sfx, pop_snd(70, .6), CH('p4', 1), .7, .4)
    place(sfx, blip(84, .06, .5, .4), CH('p4', 2), .5, -.4); place(sfx, coin(.5), CH('p4', 2) + .05, .6, -.4)
    place(sfx, stamp_snd(), CH('p5', 1), .9, .3)

    # —— 进化错配 ——
    place(sfx, glitch(.4), SS('mismatch') - .3, .7)
    place(sfx, lp(siren(SE('mismatch') - SS('mismatch'), vel=.4), 900), SS('mismatch'), .5)
    place(sfx, thud(.7), S('m1') - .05, .7); place(sfx, sparkle(.5, 72, .3), S('m1'), .5)
    place(sfx, pop_snd(80), S('m2') - .1, .7)
    place(sfx, blip(72, .08), S('m2') + .3, .5); place(sfx, blip(72, .08), S('m3'), .5)
    place(sfx, buzz(.35, 40), CH('m3', 1), .6)

    # —— 攻略 ——
    sneeze8(S('d1') + .4, .6, -.4, 0)
    place(sfx, whoosh(.5, True, .45), S('d1') + .3, .5)
    for t0 in (CH('d1', 2), CH('d2', 1), CH('d2', 2), S('d3'), CH('d4', 1), CH('d4', 2)):
        place(sfx, coin(.4), t0, .5)
    place(sfx, pop_snd(86), S('c6') - .2, .6, .3); place(sfx, chime(91, .4), S('c6') + .2, .6, .3)

    # —— 结尾 ——
    for k in range(6):
        place(sfx, step_snd(.3), SS('end') + .2 + k * .25, .5, -.5)
    place(sfx, chime(84, .4), S('c7') - .2, .5)
    place(sfx, whirr(.6, .5), EN('c7') - .3, .7, .3)
    for k in range(3):
        place(sfx, pop_snd(92 + k * 2, .3), S('c8') + k * .3, .5)
    for k in range(8):
        place(sfx, step_snd(.25), EN('c8') + .2 + k * .27, .4, .3)
    place(sfx, sparkle(.9, 84, .35), CH('e1', 2), .6)
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


# ================= 角色台词 =================
VOICE_LUFS = -15.0   # 每句台词的响度，比音效床（约 −18 LUFS）高一截
DUCK = .45           # 台词响起时，音效和环境声压到 55%（约 −5 dB）


def load_voice(path):
    """读语音：切掉前后的静音，两头各淡入淡出 10ms"""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, path), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    x = hp(np.frombuffer(raw, np.float32).astype(np.float64), 80)
    on = np.flatnonzero(np.abs(x) > np.abs(x).max() * .01)
    x = x[max(0, on[0] - int(.02 * SR)):on[-1] + int(.08 * SR)].copy()
    f = int(.01 * SR)
    x[:f] *= np.linspace(0, 1, f)
    x[-f:] *= np.linspace(1, 0, f)
    return x


def add_voices(bed_mix):
    """每句台词在气泡弹出后开口（时间轴里的 t0）；音效床提前约 0.1 秒压下去，说完再慢慢回来"""
    vox, env = np.zeros((2, N)), np.zeros(N)
    for l in TLD['lines']:
        if l['kind'] != 'C':
            continue
        x = load_voice(l['file'])
        x *= 10 ** ((VOICE_LUFS - lufs(np.vstack([x, x]))) / 20)
        t = l['t0'] - .02
        place(vox, x, t)
        i = int(round(t * SR))
        env[i:i + len(x)] = 1
    w = int(.12 * SR)
    env = uniform_filter1d(maximum_filter1d(env, size=2 * w + 1), size=w)
    return bed_mix * (1 - DUCK * env) + vox


def main(out):
    build()
    mix = sfx + amb
    gain = TARGET_LUFS - lufs(mix)
    mix = add_voices(mix * 10 ** (gain / 20))
    mix, red, share = limit(mix)
    wavfile.write(out, SR, (mix.T * 32767).astype(np.int16))
    print(f'写出 {out}  {DUR:.2f}s  音效床增益 {gain:+.1f} dB  限幅最多 {red:.1f} dB（{share:.2f}% 采样）  积分响度 {lufs(mix):.1f} LUFS')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'out/audio.wav')
