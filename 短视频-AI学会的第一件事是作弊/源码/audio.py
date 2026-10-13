"""《我训练了一只 AI 小怪，它学会的第一件事是作弊》声音：旁白配音 + 音效 + 环境声，没有配乐。
对话框配"哔哔"打字音。音效全部按 timeline.json 对齐，用 numpy 合成；
回放里每一步的脚步、撞树、吃金币、"+1"、进终点，按 out/sfx.json（render.cjs sfx 导出，和画面用同一张时间表）放。
旁白配音（voice_cv3/，CosyVoice 3 合成）按时间轴放上去，说话时音效和环境声让一让。
成片响度约 −16 LUFS，峰值压在 −1.5 dBTP 以下。
用法：python3 audio.py out.wav     （先跑 node render.cjs sfx out/sfx.json）
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
def tink(vel=.4, f=2400):
    """短短的"叮" """
    t = tvec(.12)
    return (np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * f * 2.7 * t)) * np.exp(-t / .025) * vel * .16


def amb_dark(d):
    """黑底：低低的嗡"""
    t = tvec(d)
    return (np.sin(2 * np.pi * 55 * t) * .05 + np.sin(2 * np.pi * 82.4 * t) * .025 + lp(noise(d), 200) * .04) * (.8 + .2 * np.sin(2 * np.pi * .5 * t))


def amb_park(d, birds=True):
    """公园：风吹草叶 + 远处的鸟叫"""
    t = tvec(d)
    x = bp(noise(d), 300, 1800) * (.5 + .5 * np.sin(2 * np.pi * .13 * t + 1) * np.sin(2 * np.pi * .05 * t)) * .035
    if not birds:
        return x
    k = .5
    while k < d - .4:
        tt = tvec(.1)
        f0 = 2800 + rng.random() * 1600
        f = f0 + 700 * np.sin(np.pi * tt / .1) * (1 if rng.random() < .5 else -1)
        chirp = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / .1) * .022
        for r in range(int(rng.integers(1, 4))):
            i = int((k + r * .13) * SR)
            x[i:i + len(chirp)] += chirp[:max(0, len(x) - i)]
        k += 1.4 + rng.random() * 2.6
    return x


def amb_dusk(d):
    """傍晚：蛐蛐儿 + 很轻的风"""
    t = tvec(d)
    x = bp(noise(d), 300, 1200) * .02
    k = .2
    while k < d - .3:
        L = .18
        tt = tvec(L)
        cr = np.sin(2 * np.pi * 4300 * tt) * (np.sin(2 * np.pi * 32 * tt) > 0) * np.sin(np.pi * tt / L) * .018
        i = int(k * SR)
        x[i:i + len(cr)] += cr[:max(0, len(x) - i)]
        k += .45 + rng.random() * .5
    return x


def amb_hall(d):
    """空荡荡的大厅：低频的空调声"""
    t = tvec(d)
    return (lp(noise(d), 320) * .5 + np.sin(2 * np.pi * 50 * t) * .04 + bp(noise(d), 700, 1500) * .03) * .07


def paper(vel=.4, d=.35):
    """纸滑进来：沙沙"""
    t = tvec(d)
    return bp(noise(d), 1500, 6000) * np.sin(np.pi * t / d) ** 2 * vel * .22


def scribble(vel=.4, d=.4):
    """铅笔划几下"""
    t = tvec(d)
    x = bp(noise(d), 2500, 7000) * (.5 + .5 * np.sign(np.sin(2 * np.pi * 11 * t)))
    return x * np.minimum(1, t / .02) * np.clip((d - t) / .05, 0, 1) * vel * .15


def crumple(vel=.5, d=.5):
    """把纸揉成一团：一阵噼里啪啦的碎响"""
    out = np.zeros(int(d * SR))
    k = 0
    while k < len(out) - 800:
        L = int(rng.integers(200, 800))
        out[k:k + L] += bp(rng.standard_normal(L), 1200, 6000) * np.exp(-np.arange(L) / (L / 3)) * rng.uniform(.3, 1)
        k += int(rng.integers(150, 900))
    return out * vel * .3


def shutter(vel=.5):
    """相机快门：咔嚓"""
    t = tvec(.12)
    a = hp(noise(.12), 2500) * np.exp(-t / .008)
    b = np.zeros_like(a)
    i = int(.06 * SR)
    b[i:] = hp(noise(.12), 2000)[:len(b) - i] * np.exp(-t[:len(b) - i] / .01) * .8
    return (a + b) * vel * .4


def keys(d=1.0, vel=.35, rate=12):
    """敲键盘：一串不太均匀的嗒嗒声"""
    out = np.zeros(int(d * SR) + 2000)
    k = 0.0
    while k < d:
        s = tick(vel * rng.uniform(.6, 1))
        i = int(k * SR)
        out[i:i + len(s)] += s[:len(out) - i]
        k += 1 / rate * rng.uniform(.6, 1.4)
    return out


def rattle(d=1.5, vel=.4):
    """晃手机：咔哒咔哒"""
    out = np.zeros(int(d * SR))
    k = 0.0
    while k < d - .05:
        L = int(.02 * SR)
        i = int(k * SR)
        out[i:i + L] += bp(rng.standard_normal(L), 800, 3500) * np.exp(-np.arange(L) / (L / 4))
        k += .07 + rng.random() * .02
    return out * vel * .3


def rush(d=.8, vel=.4):
    """快放时一路小跑：很密的脚步 + 风声"""
    t = tvec(d)
    x = bp(noise(d), 400, 2500) * (.6 + .4 * np.sign(np.sin(2 * np.pi * 16 * t))) * .4 + bp(noise(d), 2000, 6000) * .2
    return x * np.minimum(1, t / .05) * np.clip((d - t) / .08, 0, 1) * vel * .35


def closer_snd(vel=.3):
    """往终点走近一步的 "+1"：轻轻往上挑一下"""
    return square(79, .04, .5, vel, a=.001, dec=.03, sus=.4, rel=.02, slide=5)


def fanfare(vel=.5):
    """进终点：短短的过关音（音效，不是配乐）"""
    out = np.zeros(int(1.3 * SR))
    for k, (m, d) in enumerate([(72, .1), (76, .1), (79, .1), (84, .35), (79, .1), (84, .5)]):
        s = square(m, d, .5, vel) + square(m - 12, d, .25, vel * .5)
        i = int([0, .09, .18, .27, .66, .76][k] * SR)
        out[i:i + len(s)] += s[:len(out) - i]
    return out


def boom(vel=.5):
    """片名出现：低沉的一下"""
    t = tvec(.8)
    f = 110 * np.exp(-t / .25) + 40
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .3) * vel * .5


def bonk(vel=.35):
    """叉：低低的"咚" """
    t = tvec(.2)
    return np.sin(2 * np.pi * np.cumsum(220 * np.exp(-t / .1) + 90) / SR) * np.exp(-t / .07) * vel * .4


SPK_PITCH = {'你': 76}


def dialog_beeps():
    """对话框逐字打出的"哔哔"声"""
    for l in TLD['lines']:
        if l['kind'] != 'D':
            continue
        m, n = SPK_PITCH.get(l['who'], 74), len(l['text'])
        for i, ch in enumerate(l['text']):
            if ch in '，。…！？：、 ～' or i % 2:
                continue
            place(sfx, blip(m + (i * 7 % 5) - 2, .035, .5, .45), l['t0'] + .08 + i * (l['typed'] - l['t0'] - .08) / n, .55)


# ================= 回放里的声音（out/sfx.json，和画面用同一张时间表） =================
def replay_sounds():
    p = os.path.join(HERE, 'out', 'sfx.json')
    ev = json.load(open(p, encoding='utf-8'))
    snd = {'step': lambda e: (step_snd(.32), .45), 'bump': lambda e: (thud(.35), .4), 'coin': lambda e: (coin(.32), .32),
           'closer': lambda e: (closer_snd(.3), .3), 'tick': lambda e: (tick(.45), .45), 'regrow': lambda e: (sparkle(.6, 88, .3), .4),
           'grab': lambda e: (whoosh(.25, True, .4), .45), 'finish': lambda e: (fanfare(.5), .6), 'rush': lambda e: (rush(e.get('d', .8), .45), .5)}
    for e in ev:
        f = snd.get(e['kind'])
        if not f:
            continue
        x, gain = f(e)
        place(sfx, x, e['t'], gain * e.get('q', 1), e.get('pan', 0) * .6)
    return len(ev)


# ================= 按时间轴排音效（与 scenes*.js 对应） =================
# 短促的音效（弹出、叮、咔嗒）尽量放在旁白字头前面（停顿里），画面也跟着提前，免得把字盖住
def build():
    tB, tC, tD = S('h2') - .02, S('h3') - .15, S('h4') - .2
    # —— 环境声 ——
    bed(amb_park, 0, tB, 1.0)
    bed(amb_dark, tB, tC, .9)
    bed(amb_park, tC, tD, 1.0)
    bed(amb_room, tD, SE('hook'), .9)
    bed(amb_park, SS('learn'), SE('dance'), 1.0)
    bed(amb_room, SS('judge'), S('j2') - .2, .9)
    bed(amb_hall, S('j2') - .2, SE('judge'), 1.0)
    bed(amb_room, SS('real'), SE('real'), .9)
    bed(amb_park, SS('fix'), SE('fix'), 1.0)
    bed(amb_room, SS('guide'), SE('guide'), .8)
    bed(amb_dusk, SS('end'), DUR, 1.0)
    dialog_beeps()
    n = replay_sounds()
    print('回放音效', n, '个')

    # —— 开头 ——
    k = TLD['lines']
    place(sfx, whoosh(.3, False, .4), tB - .12, .5)                            # 切到黑底
    place(sfx, stamp_snd(), LN['h2']['marks'][0] - .3 + .11, .6)               # "可它，" 后面那个停顿里盖章（画面同 T_HOOK.tStamp）
    place(sfx, whoosh(.6, False, .45), tC - .1, .55)                           # 拉远
    place(sfx, boom(.55), tD + .7, .6)                                         # 片名
    place(sfx, keys(2.3, .3), tD + .3, .3, .3)                                 # 敲命令

    # —— 第 1 局 ——
    place(sfx, tape(1.1), SS('learn') - .2, .5)
    place(sfx, paper(.45), CH('s1', 1) - .35, .35, -.5)
    for i in range(2):
        place(sfx, scribble(.4, .3), CH('s2', i) - .3, .3, -.5)
    place(sfx, pop_snd(80, .4), S('s4') - .35, .45)
    place(sfx, rise(1.0, 64, 76), CH('s4', 1) - .1, .14)

    # —— 小环路 ——
    place(sfx, pop_snd(84, .4), S('l4') - .32, .4)
    place(sfx, rise(.9, 60, 72), S('l4') - .1, .15)
    place(sfx, whoosh(.4, True, .4), S('l5') - .32, .45, .5)

    # —— 改规则：门口跳舞 ——
    place(sfx, glitch(.35), SS('dance') - .3, .4)
    place(sfx, paper(.45), SS('dance') - .1, .35, -.5)
    place(sfx, scribble(.4, .35), CH('p1', 1) - .1, .3, -.5)
    for i in range(3):
        place(sfx, poof(.35), CH('p1', 1) + .1 + i * .05, .25, -.6)
    place(sfx, scribble(.4, .3), CH('p1', 3) - .25, .28, -.5)
    place(sfx, whoosh(.3, False, .35), T_ARRIVE() - .05, .35, .4)               # 到门口，刹住
    place(sfx, pop_snd(80, .4), S('p4') - .32, .4, -.4)
    place(sfx, pop_snd(84, .4), S('p5') - .32, .45)

    # —— 看画面打分 ——
    place(sfx, whoosh(.4, True, .4), SS('judge') - .25, .45)
    for i in range(3):
        place(sfx, scribble(.35, .25), SS('judge') + .05 + i * .25, .3)
    tCrump = CH('j1', 1) - .1
    place(sfx, crumple(.5), tCrump, .35)
    place(sfx, chime(84, .3), tCrump + .45, .35)
    place(sfx, keys(1.2, .3), CH('j1', 2) - .4, .3)
    place(sfx, whoosh(.5, True, .4), S('j2') - .3, .45)
    tg = S('j3') - .2 + (len(EXP['replays']['ball']['path']) - 1) / 3.2
    place(sfx, levelup(.4), tg + .1, .4)
    place(sfx, stamp_snd(), tg + .32, .45)
    place(sfx, keys(1.3, .25, 18), tg + .45, .25)
    place(sfx, whoosh(.45, True, .5), S('j4') + .05, .5)
    place(sfx, shutter(.5), S('j4') + .3, .45)
    place(sfx, rise(.6, 64, 79), S('j5') - .25, .15)
    place(sfx, tink(.35, 2000), CH('j5', 1) - .25, .3)
    place(sfx, pop_snd(84, .4), S('j6') - .32, .45)
    place(sfx, whoosh(.4, True, .4), S('j7') - .32, .4, .5)

    # —— 现实里的 AI ——
    place(sfx, glitch(.35), SS('real') - .3, .4)
    for i in range(3):
        place(sfx, pop_snd(80 + i * 3, .35), SS('real') - .1 + i * .12, .35, (i - 1) * .5)
    place(sfx, whoosh(.4, True, .4), S('r2') - .28, .4)
    for i in range(3):
        t0 = CH('r3', i) - (.2 if i == 2 else .1)
        place(sfx, keys(1.0, .22, 14), t0, .22, .5)
    place(sfx, scribble(.4, .3), CH('r3', 2) - .1, .25)
    place(sfx, chime(88, .3), CH('r3', 3) + .15, .35)
    place(sfx, pop_snd(84, .4), S('r4') - .32, .45)
    place(sfx, rise(2.4, 55, 79), S('r4') - .1, .12)
    t4 = S('r4') - .1
    for b2, ok in [(400, 0), (700, 0), (800, 0), (850, 0), (1000, 1)]:
        tt = t4 + 2.4 * b2 / 1000
        place(sfx, chime(88, .3) if ok else bonk(.3), tt, .3)
    place(sfx, pop_snd(80, .4), CH('r5', 1) - .32, .35, -.5)
    place(sfx, rattle(1.8, .4), CH('r5', 1) - .1, .3, -.5)
    place(sfx, pop_snd(84, .4), CH('r5', 2) - .32, .35, .5)
    tp = CH('r5', 2) + .5
    place(sfx, shutter(.5), tp, .45, .5)
    place(sfx, chime(84, .3), tp + .1, .3, .5)
    for i in range(6):
        place(sfx, step_snd(.3), tp + .65 + i * .26, .35, .5 - i * .1)

    # —— 从头学 + 好奇心 ——
    place(sfx, whoosh(.4, True, .4), SS('fix') - .25, .45)
    place(sfx, glitch(.4), CH('f1', 1) - .1, .35)
    place(sfx, paper(.45), CH('f1', 2) - .35, .35, -.5)
    place(sfx, whoosh(.6, False, .35), S('f2') - .2, .4)
    place(sfx, bonk(.3), CH('f2', 1) - .25, .3, .5)
    place(sfx, pop_snd(84, .4), S('f3') - .32, .45)
    place(sfx, sparkle(.9, 84, .3), CH('f3', 1) - .2, .35)
    tArr = CH('f4', 1) + .5
    for i in range(8):
        place(sfx, pop_snd(86 + i % 3 * 3, .3), tArr + .1 + i * .07, .2, (i % 3 - 1) * .5)
    place(sfx, pop_snd(80, .4), S('f5') - .25, .35, -.5)
    place(sfx, chime(84, .3), CH('f5', 2) - .1, .3)

    # —— 三句话 ——
    place(sfx, pop_snd(84, .4), SS('guide') - .1, .45)
    for lid in ('g2', 'g3', 'g4'):
        place(sfx, coin(.35), S(lid) - .28, .38)

    # —— 结尾、片尾 ——
    place(sfx, chime(79, .3), CH('z1', 1) - .3, .3)
    place(sfx, sparkle(.9, 84, .3), SS('card') + .05, .5)
    place(sfx, pop_snd(84), SS('card') + .1, .5)


EXP = json.load(open(os.path.join(HERE, 'exp.json'), encoding='utf-8'))


def T_ARRIVE():
    """跳舞那段：跑到终点门口的时刻（和 scenes2.js 的 T_DANCE 一样算）"""
    path, dist = EXP['replays']['shaping']['path'], EXP['dist']
    arrive = next(i for i, c in enumerate(path) if dist[c] <= 1)
    return S('p2') - .1 + arrive / 5.2


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
