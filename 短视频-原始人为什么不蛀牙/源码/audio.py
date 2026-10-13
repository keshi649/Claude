"""《原始人为什么不蛀牙？》声音：旁白配音 + 音效 + 环境声，没有配乐。
对话框和第一集一样配"哔哔"打字音。音效全部按 timeline.json 对齐，用 numpy 合成；
旁白配音（voice_cv3/，CosyVoice 3 合成）按时间轴放上去，说话时音效和环境声让一让。
成片响度约 −16 LUFS，峰值压在 −1.5 dBTP 以下。
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
VOICE_LUFS = -16.0     # 配音单独的响度
BED_LUFS = -23.0       # 音效和环境声的响度（给人声让位）
DUCK = .6              # 说话时音效压低到 40%（约 −8 dB），字头不被音效盖住
MIX_LUFS = -16.0       # 成片的响度


def S(i): return LN[i]['t0']
def CH(i, k): return LN[i]['chunks'][k][0]
def EN(i): return LN[i]['t1']
def SS(n): return SC[n]['t0']
def SE(n): return SC[n]['t1']


sfx = np.zeros((2, N))
amb = np.zeros((2, N))
OS = 4


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


def tick(vel=.4):
    t = tvec(.03)
    return hp(noise(.03), 3000) * np.exp(-t / .006) * vel * .4


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


def bed(fn, t0, t1, gain=1.0):
    d = t1 - t0 + .6
    x = fn(d)
    env = np.minimum(1, tvec(d) / .4) * np.clip((d - tvec(d)) / .4, 0, 1)
    place(amb, x * env, t0 - .3, gain)


def mixa(*xs):
    """把几段长短不一的声音叠在一起"""
    n = max(len(x) for x in xs)
    out = np.zeros(n)
    for x in xs:
        out[:len(x)] += x
    return out


def poof(vel=.5):
    t = tvec(.4)
    return mixa(bp(noise(.4), 600, 3000) * np.exp(-t / .1) * vel * .3, pop_snd(90, vel * .6))


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


def bloop(vel=.4):
    t = tvec(.15)
    return np.sin(2 * np.pi * np.cumsum(200 + 600 * t / .15) / SR) * np.sin(np.pi * t / .15) * vel * .25


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


def amb_room(d):
    t = tvec(d)
    return (lp(noise(d), 250) * .5 + np.sin(2 * np.pi * 60 * t) * .05) * .05


def munch(vel=.4):
    out = np.zeros(int(.16 * SR))
    for k in range(2):
        L = int(.03 * SR)
        o = int(k * .07 * SR)
        out[o:o + L] += bp(rng.standard_normal(L), 600, 3000) * np.exp(-np.arange(L) / (L / 3))
    return out * vel * .3


def cool_glide(d=1.0, f0=900, f1=300, vel=.4):
    """降温：从高往低滑的柔和音"""
    t = tvec(d)
    f = f0 * (f1 / f0) ** (t / d)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + .3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return x * np.minimum(1, t / .05) * np.clip((d - t) / .25, 0, 1) * vel * .18


def amb_ac(d):
    """空调：低低的嗡嗡声 + 出风"""
    t = tvec(d)
    return (lp(noise(d), 500) * .45 + np.sin(2 * np.pi * 100 * t) * .06 + bp(noise(d), 1000, 3000) * .05) * .06


def amb_bath(d):
    """淋浴：持续的水声 + 水珠"""
    x = bp(noise(d), 1500, 7000) * .045 + lp(noise(d), 400) * .02
    k = .05
    while k < d - .05:
        L = int(.012 * SR)
        drop = np.sin(2 * np.pi * (1800 + rng.random() * 1500) * tvec(.012)) * np.exp(-np.arange(L) / (L / 4)) * .03
        i = int(k * SR)
        x[i:i + L] += drop[:len(x) - i]
        k += .03 + rng.random() * .12
    return x


def rustle(vel=.4):
    """翻身：被子沙沙 + 床吱一声"""
    t = tvec(.45)
    x = bp(noise(.45), 1500, 6000) * np.sin(np.pi * t / .45) * .12
    sq = np.sin(2 * np.pi * (520 + 120 * np.sin(2 * np.pi * 3 * t)) * t) * np.exp(-((t - .25) / .06) ** 2) * .05
    return (x + sq) * vel


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


def load_voice(file):
    """读配音（任何格式，用 ffmpeg 解码成 44.1 kHz 单声道），去掉 80 Hz 以下的低频"""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', file, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return hp(np.frombuffer(raw, np.float32).astype(np.float64), 80, 2)


def compress(x, ratio=3.0, above=6.0, win=.02, smooth=.03):
    """人声压缩：比这句平均响度高出 above dB 的部分按 ratio 压下去，让字与字之间更平，限幅器少干活"""
    p = uniform_filter1d(x * x, size=max(1, int(win * SR))) + 1e-12
    lv = 10 * np.log10(p)
    th = 10 * np.log10(np.mean(x * x) + 1e-12) + above
    g = np.where(lv > th, (th - lv) * (1 - 1 / ratio), 0.0)
    g = uniform_filter1d(minimum_filter1d(g, size=max(1, int(.01 * SR))), size=max(1, int(smooth * SR)))
    return x * 10 ** (g / 20)


def voice_track():
    """把每句配音放到时间轴上；返回 (双声道人声, 说话的时段 0..1)"""
    v = np.zeros(N)
    gate = np.zeros(N)
    for l in TLD['lines']:
        if l['kind'] != 'N' or 'audio' not in l:
            continue
        x = load_voice(os.path.join(HERE, l['audio']))
        a0 = max(0.0, l['a0'] - .05)
        x = x[int(a0 * SR):int((l['a0'] + (l['t1'] - l['t0']) + .3) * SR)].copy()
        fade = int(.03 * SR)
        x[:fade] *= np.linspace(0, 1, fade)
        x[-fade:] *= np.linspace(1, 0, fade)
        x = compress(x)
        # 每句先调到差不多的响度，句与句之间不忽大忽小
        x *= 10 ** ((VOICE_LUFS - lufs(np.vstack([x, x]))) / 20)
        i = int((l['t0'] - .05) * SR)
        n = max(0, min(len(x), N - i))
        v[i:i + n] += x[:n]
        gate[max(0, int((l['t0'] - .12) * SR)):int((l['t1'] + .15) * SR)] = 1
    env = uniform_filter1d(maximum_filter1d(gate, size=int(.25 * SR)), size=int(.2 * SR))
    v *= 10 ** ((VOICE_LUFS - lufs(np.vstack([v, v]))) / 20)
    return np.vstack([v, v]), np.clip(env, 0, 1)


# ---------------- 本集新加的声音 ----------------
def amb_shop(d):
    """奶茶店：远远的人声嗡嗡 + 偶尔杯子碰一下"""
    t = tvec(d)
    x = bp(noise(d), 250, 1400) * (.6 + .4 * np.sin(2 * np.pi * .3 * t) * np.sin(2 * np.pi * .11 * t + 1)) * .05
    k = .3
    while k < d - .2:
        tt = tvec(.15)
        f = 2600 + rng.random() * 1400
        ping = np.sin(2 * np.pi * f * tt) * np.exp(-tt / .03) * .025
        i = int(k * SR)
        x[i:i + len(ping)] += ping[:len(x) - i]
        k += .8 + rng.random() * 1.6
    return x


def amb_mouth(d):
    """嘴里：低低的、湿乎乎的声音 + 偶尔冒个泡"""
    t = tvec(d)
    x = lp(noise(d), 180) * (.7 + .3 * np.sin(2 * np.pi * .2 * t)) * .09
    k = .2
    while k < d - .2:
        b = bloop(.25 + rng.random() * .2)
        i = int(k * SR)
        x[i:i + len(b)] += b[:len(x) - i] * .5
        k += .5 + rng.random() * 1.2
    return x


def amb_office(d):
    """办公室：空调 + 远处的城市 + 偶尔一串键盘声"""
    x = amb_ac(d) * .8 + amb_city(d) * .5
    k = .4
    while k < d - .6:
        for j in range(int(rng.integers(3, 8))):
            tk = tick(.3)
            i = int((k + j * (.07 + rng.random() * .05)) * SR)
            x[i:i + len(tk)] += tk[:max(0, len(x) - i)] * .35
        k += 1.5 + rng.random() * 2
    return x


def bee_buzz(d):
    """蜜蜂嗡嗡：两只，音高不一样，带颤音"""
    t = tvec(d)
    x = np.zeros(len(t))
    for f0, r in ((228, 6.5), (262, 8.1)):
        f = f0 * (1 + .04 * np.sin(2 * np.pi * r * t))
        saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
        x += bp(saw, 200, 2500) * (.6 + .4 * np.sin(2 * np.pi * .7 * t + f0))
    return x * np.minimum(1, t / .3) * np.clip((d - t) / .3, 0, 1) * .05


def sizzle(d=.35, vel=.4):
    """酸滋滋地咬牙面"""
    t = tvec(d)
    x = hp(noise(d), 4000) * (np.abs(np.sin(2 * np.pi * 37 * t)) ** 3)
    return x * np.minimum(1, t / .01) * np.exp(-t / (d * .6)) * vel * .25


def swoosh_water(d=1.6, vel=.5):
    """口水浪：从右往左冲过去的水声"""
    t = tvec(d)
    x = bp(noise(d), 400, 3000) * np.sin(np.pi * t / d) ** 1.5 * .2 + lp(noise(d), 300) * np.sin(np.pi * t / d) * .15
    return x * vel


def scrub(d=1.0, vel=.4):
    """刷牙：一下一下的沙沙声"""
    t = tvec(d)
    x = bp(noise(d), 2500, 8000) * (.25 + .75 * np.abs(np.sin(2 * np.pi * 5 * t)) ** 2)
    return x * np.minimum(1, t / .05) * np.clip((d - t) / .1, 0, 1) * vel * .22


def gulp(vel=.5):
    """咕咚"""
    t = tvec(.18)
    f = 180 + 260 * np.exp(-t / .04)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / .18) * vel * .35


def tink(vel=.4, f=2400):
    """糖块落下、砖放好：短短的"叮" """
    t = tvec(.12)
    return (np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * f * 2.7 * t)) * np.exp(-t / .025) * vel * .16


def ding_dong(vel=.5):
    """答题的"叮咚" """
    return np.concatenate([square(79, .16, .5, vel, dec=.3, sus=.8), square(74, .3, .5, vel, dec=.4, sus=.8)])


SPK_PITCH = {'你': 76, '原始人': 60, '蛀牙菌': 66, '口水修理工': 70}


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
    bed(amb_savanna, 0, S('h3') - .12, .6); bed(amb_shop, 0, S('h3') - .12, .8)
    bed(amb_room, S('h3') - .12, S('h5') - .12, 1.6)
    bed(amb_shop, S('h5') - .12, SE('hook'))
    bed(amb_mouth, SS('body'), SE('body'))
    bed(amb_savanna, SS('ancient'), SE('ancient'))
    bed(amb_office, SS('modern'), S('m2') - .12, 2.0); bed(amb_room, S('m2') - .12, SE('modern'), 1.6)
    bed(amb_mouth, SS('mismatch'), SE('mismatch'))
    bed(amb_room, SS('guide'), SE('guide'), 1.4); bed(amb_bath, SS('guide'), SE('guide'), .4)
    bed(amb_office, SS('end'), DUR, 2.0)
    dialog_beeps()

    # —— 开头：原始人一口白牙，"你"抱着奶茶 ——
    place(sfx, whoosh(.5, True, .5), 0, .6); place(sfx, sparkle(.6, 88, .35), .15, .5)
    k = 0.0
    while k < S('d1') - .3:          # "你"吸奶茶
        place(sfx, slurp(.4), k + .1, .45, .4)
        k += 1.6
    place(sfx, chime(96, .3), .5, .4, -.4); place(sfx, pop_snd(84), .5, .45, -.4); place(sfx, pop_snd(80), .9, .45, .4)
    place(sfx, sad_slide(), S('h2') - .05, .5); place(sfx, stamp_snd(), S('h2') + .05, .6)
    # 考古记录：一格格冒出 100 颗牙
    place(sfx, whoosh(.4, True, .45), S('h3') - .15, .6); place(sfx, pop_snd(80), S('h3') + .05, .6)
    for j in range(14):
        place(sfx, tick(.3), S('h3') + .3 + j * .06, .4, -.4)
    place(sfx, square(52, .25, .5, .4, dec=.3, sus=.6), CH('h3', 3), .45, -.4); place(sfx, pop_snd(76), CH('h3', 3) + .05, .5)
    place(sfx, whoosh(.4, True, .4), S('h4') - .2, .5)
    for j in range(14):
        place(sfx, tick(.3), S('h4') + .2 + j * .06, .4, .4)
    for j in range(10):
        place(sfx, blip(50 + (j % 3), .05, .5, .4), CH('h4', 1) + .1 + j * .09, .45, .4)
    place(sfx, buzz(.2, 44), CH('h4', 1) + .2, .4); place(sfx, pop_snd(74), CH('h4', 1) + .25, .5)
    # 线索：奶茶的喝法
    place(sfx, whoosh(.4, True, .45), S('h5') - .15, .6); place(sfx, pop_snd(78), S('h5') + .1, .5)
    for k in (.2, 1.2, 2.2):
        if S('h5') + k < SE('hook') - .3:
            place(sfx, slurp(.35), S('h5') + k, .35)
    place(sfx, rise(.3, 64, 79), CH('h5', 1) - .1, .45); place(sfx, pop_snd(86), CH('h5', 1), .5)
    k = CH('h5', 2)
    while k < SE('hook') - .2:
        place(sfx, tick(.35), k, .4, -.4)
        k += .25
    place(sfx, thud(.6), CH('h5', 2) + .15, .55); place(sfx, pop_snd(72, .6), CH('h5', 2) + .2, .6)

    # —— 嘴里：拆和补 ——
    place(sfx, whoosh(.4, True, .45), SS('body') - .15, .5)
    place(sfx, blip(84, .06), SS('body') + .2, .4); place(sfx, blip(88, .08), SS('body') + .3, .4)   # 血条出现（赶在旁白开口之前）
    place(sfx, crunch(.5), CH('s1', 1), .5, -.4); place(sfx, pop_snd(80), CH('s1', 1), .45, -.4)
    place(sfx, tink(.5, 2600), CH('s1', 2), .5, .4); place(sfx, pop_snd(86), CH('s1', 2), .45, .4)
    for i, pan in enumerate((-.5, 0, .5)):
        place(sfx, bloop(.45), CH('s2', 1) + i * .08, .5, pan)
    place(sfx, evil(.4), CH('s2', 1) + .3, .35)
    for j in range(9):
        place(sfx, tink(.35, 2000 + (j % 3) * 400), CH('s2', 2) + j * .13 + .55, .4, (j % 3 - 1) * .5)
    k = CH('s2', 3) - .05
    while k < CH('s2', 4) + .15:
        place(sfx, munch(.45), k, .5, (rng.random() - .5) * .8)
        k += .14
    for j in range(12):
        ts = CH('s2', 4) + j * .16 + .3
        if ts < EN('s2') + .5:
            place(sfx, bloop(.25), ts - .02, .3, (j % 3 - 1) * .5); place(sfx, sizzle(.35, .4), ts, .5, (j % 3 - 1) * .5)
    for j in range(3):
        place(sfx, blip(76 - j * 4, .07, .5, .4), CH('s2', 5) + j * .18, .45)
    place(sfx, swoosh_water(1.8, .6), S('s3') + .05, .6)
    for j in range(4):
        place(sfx, bloop(.35), S('s3') + .4 + j * .3, .35, .3)
    for j in range(6):
        place(sfx, step_snd(.35), CH('s3', 1) + j * .2, .45, .5)
    place(sfx, whoosh(.6, False, .35), CH('s3', 2), .45, -.5); place(sfx, square(84, .4, .5, .3, dec=.5, sus=1, slide=-12), CH('s3', 2) + .1, .3, -.5)
    tR = CH('s3', 3)
    span = max(.8, EN('s3') - tR) / 7
    for j in range(7):
        place(sfx, clank(.4, 1200 + (j % 2) * 300), tR + j * span + .3, .45, (j % 2 - .5) * .6)
    place(sfx, rise(.8, 64, 76), tR + .2, .35); place(sfx, coin(.4), tR + 7 * span + .3, .45)
    place(sfx, whoosh(.4, True, .4), S('s4') - .15, .5); place(sfx, pop_snd(80), S('s4'), .5)
    place(sfx, cool_glide(.7, 700, 250, .4), S('s4') + .15, .45)
    k = S('s4') + .8
    while k < CH('s4', 2) + .2:
        place(sfx, tick(.3), k, .35)
        k += .3
    place(sfx, blip(84, .08), CH('s4', 1), .45); place(sfx, coin(.4), CH('s4', 1) + .3, .4)
    place(sfx, rise(.6, 62, 74), CH('s4', 2) - .1, .35); place(sfx, chime(88, .35), CH('s4', 2) + .2, .45)
    for i, pan in enumerate((-.5, 0, .5)):
        place(sfx, bloop(.45), S('s5') - .1 + i * .08, .45, pan)
    place(sfx, scrape(1.2, .5), S('s5') + .4, .4); place(sfx, crunch(.5), S('s5') + .7, .45); place(sfx, crunch(.5), S('s5') + 1.1, .45)
    place(sfx, thud(.7), CH('s5', 1), .55); place(sfx, buzz(.3, 42), CH('s5', 1) + .1, .4)

    # —— 几十万年前：难得碰上甜的，一次吃完 ——
    place(sfx, tape(.95), SS('ancient') - .2, .55)
    place(sfx, pop_snd(80, .4), S('a1') - .35, .45)
    place(amb, bee_buzz(max(1.0, S('d4') - S('a1') + .5)), S('a1'), .4, .5)
    place(sfx, sparkle(.4, 84, .25), CH('a1', 1) - .45, .4, -.4); place(sfx, pop_snd(82, .4), CH('a1', 1) - .35, .4, -.4)
    for j in range(4):
        place(sfx, rustle(.4), CH('a1', 2) + j * .22, .4, .3)
    place(sfx, pop_snd(76), CH('a1', 2) + .1, .4)
    place(sfx, slurp(.45), CH('a1', 3) + .05, .5, .3); place(sfx, pop_snd(86), CH('a1', 3), .45, .3)
    for j in range(6):
        place(sfx, munch(.45), CH('a1', 4) + j * .13, .5, .2)
    place(sfx, gulp(.5), CH('a1', 4) + .85, .5); place(sfx, levelup(.4), CH('a1', 4) + .1, .4)
    place(sfx, whoosh(.4, True, .4), S('a2') - .15, .45); place(sfx, bloop(.4), S('a2') + .35, .45)
    place(sfx, blip(60, .1, .5, .35), S('a2') + .5, .4)
    place(sfx, chime(84, .35), CH('a2', 2), .45); place(sfx, sparkle(.5, 88, .25), CH('a2', 2) + .1, .4)

    # —— 如今：一天好几回 ——
    place(sfx, tape(.8), SS('modern') - .2, .5)
    k = SS('modern')
    while k < S('m2') - .5:          # "你"一口一口地抿
        place(sfx, slurp(.3), k + .05, .35, -.4)
        k += 1 / .6
    place(sfx, whoosh(.4, True, .4), S('m1') - .1, .45)
    T = [CH('m1', 1), CH('m1', 1) + .25, CH('m1', 1) + .5, CH('m1', 2), CH('m1', 2) + .3]
    for i, t0 in enumerate(T):
        place(sfx, pop_snd(80 + i * 2, .45), t0, .5, -.6 + i * .3); place(sfx, blip(52, .08, .5, .35), t0 + .12, .35, -.6 + i * .3)
    place(sfx, thud(.6), CH('m1', 3), .5); place(sfx, buzz(.25, 44), CH('m1', 3) + .05, .4)
    # 考考你
    place(sfx, whoosh(.4, True, .45), S('m2') - .15, .5); place(sfx, ding_dong(.45), S('m2') + .05, .5)
    place(sfx, pop_snd(84), CH('m2', 1), .45)
    place(sfx, pop_snd(80), CH('m2', 3), .45, -.3)
    for j in range(4):
        place(sfx, slurp(.45), CH('m2', 3) + .4 + j * .3, .45, -.3)
    place(sfx, pop_snd(76), CH('m2', 4), .45, .3)
    k = CH('m2', 4) + .5
    while k < EN('d6'):
        place(sfx, slurp(.2), k, .3, .3)
        k += 1.5
    place(sfx, rise(.3, 64, 79), CH('m2', 5) - .1, .45)
    k = CH('m2', 5) + .3
    while k < S('m3') - .1:
        place(sfx, tick(.35), k, .4)
        k += .25
    place(sfx, buzz(.35, 40), S('m3') + .05, .45); place(sfx, stamp_snd(), S('m3') + .3, .6)
    place(sfx, rise(.5, 60, 67), CH('m3', 1), .35, -.2); place(sfx, pop_snd(80), CH('m3', 1) + .5, .4)
    place(sfx, rise(.3, 60, 72), CH('m3', 4) - .45, .3, .2); place(sfx, pop_snd(74), CH('m3', 4) + .55, .3)
    place(sfx, clank(.5, 700), S('d6') + .1, .4)

    # —— 进化错配 ——
    place(sfx, glitch(.4), SS('mismatch') - .3, .7)
    place(sfx, thud(.7), S('x1') - .05, .7); place(sfx, sparkle(.5, 72, .3), S('x1'), .5)
    place(sfx, pop_snd(80), CH('x1', 1) - .1, .6); place(sfx, blip(60, .08), CH('x1', 1) + .05, .4); place(sfx, blip(60, .08), CH('x1', 1) + .2, .4)
    place(sfx, blip(72, .08), CH('x1', 1) + .2, .5); place(sfx, blip(72, .08), CH('x1', 3), .5)
    place(sfx, buzz(.35, 40), CH('x1', 4) + .3, .4)

    # —— 护牙攻略 ——
    place(sfx, whoosh(.5, True, .45), S('g1') - .5, .5)
    place(sfx, sparkle(.4, 84, .3), CH('g1', 2), .4)
    for t0 in (CH('g2', 0), S('g3'), S('g4'), S('g5')):     # 每条攻略比旁白早 0.2 秒弹出，"叮"不压在字头上
        place(sfx, coin(.4), t0 - .22, .45)
    place(sfx, scrub(max(.5, EN('g4') + 1.2 - S('g4')), .45), S('g4') - .1, .45)
    place(sfx, gulp(.4), S('g3') + .3, .35)

    # —— 结尾：一口气喝完，再来口清水 ——
    tD = S('d7')
    for j in range(4):
        place(sfx, slurp(.5), tD - .2 + j * .24, .5)
    for j in range(3):
        place(sfx, gulp(.5), tD + 1.0 + j * .25, .5)
    place(sfx, pop_snd(84), tD + 1.4, .45, .4)
    k = tD + 1.6
    while k < SS('card'):
        place(sfx, tink(.3, 1500), k, .3, .4)
        k += .34
    place(sfx, chime(84, .35), CH('z1', 1), .5)
    place(sfx, sparkle(.9, 84, .3), SS('card') + .05, .55); place(sfx, pop_snd(84), SS('card') + .1, .55)


def main(out):
    build()
    mix = sfx + amb
    mix = mix * 10 ** ((BED_LUFS - lufs(mix)) / 20)
    voice, env = voice_track()
    mix = mix * (1 - DUCK * env) + voice
    gain = MIX_LUFS - lufs(mix)
    mix, red, share = limit(mix * 10 ** (gain / 20))
    wavfile.write(out, SR, (mix.T * 32767).astype(np.int16))
    print(f'写出 {out}  {DUR:.2f}s  增益 {gain:+.1f} dB  限幅最多 {red:.1f} dB（{share:.2f}% 采样）  积分响度 {lufs(mix):.1f} LUFS')


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    main(args[0] if args else 'out/audio.wav')
