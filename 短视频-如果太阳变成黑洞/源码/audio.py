"""《如果太阳变成黑洞》声音：旁白配音 + 音效 + 环境声，没有配乐。
环境声每个镜头一种（太空的低鸣、黑洞的嗡鸣、白天的海、夜里的海、结冰的风、深海），音效跟画面同一张时间表
（timeline.json + 镜头里的同一套时刻：太阳缩小、镜头冲过去、倒计时、天黑、月亮灭）。全部用 numpy 合成。
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
def MK(i, k): return LN[i]['marks'][k]
def SS(n): return SC[n]['t0']
def SE(n): return SC[n]['t1']


sfx = np.zeros((2, N))
amb = np.zeros((2, N))
OS = 4


CUES = []   # 每个音效的（开始时刻, 听得见的时长, 名字），给 工具/sfx_check.py 查有没有压在字上


def place(bus, sig, t, gain=1.0, pan=0.0):
    if bus is sfx and len(sig) and np.max(np.abs(sig)) > 0:
        loud = np.flatnonzero(np.abs(sig) > .1 * np.max(np.abs(sig)))      # 比峰值低 20 dB 以内算听得见
        fr = sys._getframe(1)
        CUES.append((t, (loud[-1] + 1) / SR, f'audio.py 第 {fr.f_lineno} 行'))
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


# ---------------- 本集的声音 ----------------
def slow_env(d, rate, lo=.4, hi=1.0, seed=0):
    """慢慢起伏的包络：每秒变 rate 次"""
    r = np.random.default_rng(seed)
    n = max(4, int(d * rate) + 3)
    k = r.random(n)
    x = np.interp(np.arange(int(d * SR)) / SR * rate, np.arange(n), k)
    return lo + (hi - lo) * uniform_filter1d(x, size=max(1, int(SR / rate / 2)))


def amb_sea(d, size=1.0, seed=1):
    """海：低沉的水声一阵一阵涌上来，浪头有沫，海上有一点风"""
    t = tvec(d)
    swell = .5 + .5 * np.sin(2 * np.pi * t / 6.8 + seed) * np.sin(2 * np.pi * t / 2.9 + 2 * seed)
    body = lp(noise(d), 420) * (.55 + .45 * swell)
    foam = bp(noise(d), 1400, 6000) * np.clip(swell - .5, 0, 1) * 1.6
    wind = bp(noise(d), 250, 900) * slow_env(d, .3, .3, 1, seed + 3)
    return (body * .11 + foam * .035 + wind * .035) * size


def amb_city_night(d):
    """夜里的海边城市：远处车流、一点电流的嗡、堤下的水拍"""
    t = tvec(d)
    traffic = lp(noise(d), 380) * slow_env(d, .5, .3, 1, 11) * .05
    hum = (np.sin(2 * np.pi * 50 * t) + .4 * np.sin(2 * np.pi * 100 * t)) * .004
    lap = np.zeros(int(d * SR))
    k = .2
    while k < d - .4:
        L = .25 + .2 * rng.random()
        tt = tvec(L)
        s = lp(noise(L), 900 + 600 * rng.random()) * np.sin(np.pi * tt / L) ** 2 * (.04 + .03 * rng.random())
        i = int(k * SR)
        lap[i:i + len(s)] += s[:len(lap) - i]
        k += .5 + .7 * rng.random()
    return traffic + hum + lap + amb_sea(d, .45, 5)


def amb_space(d, f0=41.2, seed=7):
    """太空：几个很低的正弦慢慢拍，加一层很轻的风噪（不成调子，不是配乐）"""
    t = tvec(d)
    x = (np.sin(2 * np.pi * f0 * t) + .7 * np.sin(2 * np.pi * f0 * 1.498 * t + 1) + .35 * np.sin(2 * np.pi * f0 * 2.003 * t + 2)) * .030
    x *= .7 + .3 * np.sin(2 * np.pi * .11 * t + seed)
    air = bp(noise(d), 120, 700) * slow_env(d, .25, .3, 1, seed) * .045
    return x + air


def amb_night(d):
    """山上的夜：风、远处一点虫鸣"""
    t = tvec(d)
    wind = bp(noise(d), 200, 1200) * slow_env(d, .35, .25, 1, 21) * .06
    bugs = np.zeros(int(d * SR))
    k = .3
    while k < d - .3:
        L = .05
        tt = tvec(L)
        s = np.sin(2 * np.pi * (4300 + 300 * rng.random()) * tt) * np.sin(np.pi * tt / L) * .006
        for r in range(3):
            i = int((k + r * .07) * SR)
            bugs[i:i + len(s)] += s[:max(0, len(bugs) - i)]
        k += .6 + rng.random() * .9
    return wind + bugs


def low_swell(d=1.6, vel=.5):
    """开场的低频涌上来（慢起，不是一声"砰"）"""
    t = tvec(d)
    env = np.minimum(1, t / .5) * np.exp(-np.maximum(t - .5, 0) / .6)
    return (np.sin(2 * np.pi * (38 + 6 * t / d) * t) * .8 + lp(noise(d), 160) * .5) * env * vel * .5


def splash(d=1.4, vel=.6):
    """浪拍过来：起得快，水声往低处落"""
    t = tvec(d)
    x = noise(d)
    hi = bp(x, 900, 7000) * np.exp(-t / .18)
    lo = lp(x, 700) * np.exp(-t / .45)
    att = np.minimum(1, t / .03)
    return (hi * .5 + lo * .9) * att * vel * .45


def surge(d=2.2, vel=.5):
    """潮水涌上来漫过海堤（慢起慢落的一大团水声）"""
    t = tvec(d)
    env = np.sin(np.pi * t / d) ** 1.5
    return (lp(noise(d), 1100) * .8 + bp(noise(d), 1500, 5000) * .25 * env) * env * vel * .45


def clock_ticks(d, rate=9.0, vel=.25):
    """快进的钟：密集的滴答"""
    out = np.zeros(int(d * SR))
    k = 0.0
    while k < d - .03:
        tt = tvec(.02)
        s = hp(noise(.02), 2500) * np.exp(-tt / .003) * vel * .5
        i = int(k * SR)
        out[i:i + len(s)] += s[:len(out) - i]
        k += 1 / rate
    return out


def tick(vel=.3):
    tt = tvec(.04)
    return (hp(noise(.04), 2000) * np.exp(-tt / .004) + np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt / .01) * .4) * vel * .45


def rumble(d, vel=.5):
    """越来越响的低频轰鸣（潮汐力在加大）"""
    t = tvec(d)
    x = lp(noise(d), 90, 2) * 3 + lp(noise(d), 300) * .3
    return x * (t / d) ** 1.6 * vel * .35


def crackle(d, vel=.5, dens=40):
    """岩石裂开：一串越来越密的咔嚓"""
    out = np.zeros(int(d * SR))
    k = 0.0
    while k < d:
        L = .015 + .03 * rng.random()
        tt = tvec(L)
        s = hp(noise(L), 1500) * np.exp(-tt / (L / 4)) * (.3 + .7 * rng.random())
        i = int(k * SR)
        out[i:i + len(s)] += s[:len(out) - i]
        k += (1 / dens) * (2.2 - 1.8 * k / d) * (.5 + rng.random())
    return out * vel * .35


def boom(d=2.6, vel=.8):
    """月亮碎掉：低频往下坠的一声闷响 + 碎石散开"""
    t = tvec(d)
    f = 70 * np.exp(-t / .9) + 26
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .8)
    body = lp(noise(d), 500) * np.exp(-t / .35)
    debris = bp(noise(d), 1200, 6000) * np.exp(-t / .9) * slow_env(d, 14, 0, 1, 9) * .25
    att = np.minimum(1, t / .008)
    return (sub * .9 + body * .7 + debris) * att * vel * .5


def shimmer(d, vel=.3, seed=3):
    """光环铺开：高处一片细碎的闪光（不成调子）"""
    r = np.random.default_rng(seed)
    out = np.zeros(int(d * SR))
    for _ in range(int(d * 14)):
        f = r.uniform(2400, 7000)
        L = r.uniform(.15, .4)
        tt = tvec(L)
        s = np.sin(2 * np.pi * f * tt) * np.sin(np.pi * tt / L) ** 2 * r.uniform(.2, 1)
        i = int(r.uniform(0, max(.01, d - L)) * SR)
        out[i:i + len(s)] += s[:len(out) - i]
    return out * np.minimum(1, tvec(d) / .6) * vel * .05


def meteor_bed(d, vel=.3, seed=5):
    """流星雨：一道道很轻的"嘶——"往下滑"""
    r = np.random.default_rng(seed)
    out = np.zeros(int(d * SR))
    k = .1
    while k < d - .8:
        L = r.uniform(.5, .9)
        tt = tvec(L)
        x = noise(L)
        s = bp(x, 1800, 6500) * np.sin(np.pi * tt / L) ** 2 * (1 - .5 * tt / L) * r.uniform(.3, 1)
        i = int(k * SR)
        out[i:i + len(s)] += s[:len(out) - i]
        k += r.uniform(.4, 1.3)
    return out * vel * .12


def bell(f=880, d=2.2, vel=.4):
    """叮——：几个不成谐音的分音，慢慢散开"""
    t = tvec(d)
    x = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t / (dd)) for m, a, dd in ((1, 1, .9), (2.76, .45, .4), (5.4, .25, .2), (8.93, .12, .1)))
    return x * np.minimum(1, t / .004) * vel * .18


def soft_pop(vel=.35):
    t = tvec(.09)
    return np.sin(2 * np.pi * np.cumsum(520 + 380 * t / .09) / SR) * np.sin(np.pi * t / .09) * vel * .25


def keys(n, span, vel=.18):
    """屏幕上逐字打出的轻轻的键声"""
    out = np.zeros(int((span + .1) * SR))
    for i in range(n):
        tt = tvec(.03)
        s = bp(noise(.03), 1500, 5000) * np.exp(-tt / .006) * vel
        k = int(i * span / max(1, n) * SR)
        out[k:k + len(s)] += s[:len(out) - k]
    return out


def implode(d=1.0, vel=.6):
    """太阳往里缩：噪声越来越高越来越响，底下一个往下沉的低音，最后一下收住"""
    t = tvec(d)
    u = t / d
    x = noise(d)
    hiss = bp(x, 400, 5000) * u ** 2.2
    f = 90 - 55 * u
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * u ** 1.5
    return (hiss * .35 + sub * .8) * np.clip((d - t) / .04, 0, 1) * vel * .5


def rush(d=.8, vel=.5):
    """镜头冲向黑洞：一阵越来越近的气流声（太空里本没有声音，这是给耳朵的提示）"""
    return whoosh(d, True, vel) + lp(noise(d), 200) * np.sin(np.pi * tvec(d) / d) ** 2 * vel * .25


def amb_bh(d, seed=31):
    """黑洞边上：很低的嗡鸣，两个频率慢慢拍，加一层被拉长的风噪"""
    t = tvec(d)
    x = (np.sin(2 * np.pi * 32.7 * t) + .8 * np.sin(2 * np.pi * 33.4 * t + 1) + .3 * np.sin(2 * np.pi * 65.6 * t + 2)) * .05
    air = bp(noise(d), 80, 400) * slow_env(d, .4, .3, 1, seed) * .06
    return x + air


def amb_beach(d, seed=41):
    """白天的海边：浪、海风，远处偶尔几声海鸥"""
    x = amb_sea(d, .9, seed)
    r = np.random.default_rng(seed)
    k = .8
    while k < d - .6:
        L = .32
        tt = tvec(L)
        f = 1650 + 700 * np.sin(np.pi * tt / L) ** .5 * (1 - tt / L)
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / L) * .010
        i = int(k * SR)
        x[i:i + len(s)] += s[:len(x) - i]
        k += r.uniform(2.0, 3.6)
    return x


def amb_cold(d, seed=51):
    """结冰的海：冷风呼呼地刮，冰面底下偶尔一声闷闷的冰鸣"""
    t = tvec(d)
    wind = bp(noise(d), 300, 2200) * slow_env(d, .5, .2, 1, seed) * .07
    howl = np.sin(2 * np.pi * np.cumsum(520 + 90 * slow_env(d, .3, -1, 1, seed + 1)) / SR) * slow_env(d, .25, 0, 1, seed + 2) ** 2 * .006
    groan = lp(noise(d), 120) * slow_env(d, .2, 0, 1, seed + 3) ** 3 * .25
    return wind + howl + groan


def amb_deep(d, seed=61):
    """深海：很闷的低频、热泉喷口一直在嘶嘶地冒、偶尔几串气泡"""
    t = tvec(d)
    low = lp(noise(d), 110) * .5 * slow_env(d, .3, .6, 1, seed)
    vent = bp(noise(d), 500, 2600) * (.6 + .4 * slow_env(d, 2.0, 0, 1, seed + 1)) * .035
    bub = np.zeros(int(d * SR))
    r = np.random.default_rng(seed)
    k = .3
    while k < d - .3:
        for j in range(r.integers(3, 7)):
            L = .03
            tt = tvec(L)
            f = r.uniform(500, 1100)
            s = np.sin(2 * np.pi * np.cumsum(f * (1 + 1.5 * tt / L)) / SR) * np.exp(-tt / .012) * .02
            i = int((k + j * .05) * SR)
            bub[i:i + len(s)] += s[:max(0, len(bub) - i)]
        k += r.uniform(.8, 1.8)
    return low + vent + lp(bub, 1800)


def amb_sun(d, seed=71):
    """真实的太阳：暖暖的低频翻滚（太阳表面在沸腾的提示）"""
    t = tvec(d)
    roll = lp(noise(d), 160) * slow_env(d, 1.2, .5, 1, seed) * .30
    tone = (np.sin(2 * np.pi * 55 * t) + .5 * np.sin(2 * np.pi * 82.4 * t + 1)) * .012
    return roll + tone


def blackout(vel=.9):
    """天一下子黑了：很低的一声闷响，耳朵里留一点点高频的嗡"""
    d = 3.2
    t = tvec(d)
    f = 48 * np.exp(-t / 1.2) + 24
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .9)
    body = lp(noise(d), 260) * np.exp(-t / .25)
    ring = np.sin(2 * np.pi * 6200 * t) * np.exp(-t / 1.1) * .012
    return (sub * 1.0 + body * .6 + ring) * np.minimum(1, t / .004) * vel * .55


def fade_tone(d=1.2, vel=.3):
    """月亮灭了：一个往下滑的很轻的低音（慢起慢落，不算短促的音效）"""
    t = tvec(d)
    f = 330 * np.exp(-t / d * 1.2)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 2 * vel * .12


def dark_pass(d=1.3, vel=.4):
    """黑暗扫过一颗行星：一团慢起慢落的低频"""
    t = tvec(d)
    env = np.sin(np.pi * np.minimum(t / d, 1)) ** 2
    return (lp(noise(d), 180) * .9 + np.sin(2 * np.pi * 46 * t) * .5) * env * vel * .35


def ice_crack(vel=.5, seed=0):
    """冰裂开：一声脆响，后面跟一串细碎的"嘶"往远处跑"""
    r = np.random.default_rng(seed)
    d = .9
    t = tvec(d)
    snap = hp(noise(d), 1800) * np.exp(-t / .012)
    zing = bp(noise(d), 2500, 9000) * np.exp(-t / .25) * (.5 + .5 * np.sin(2 * np.pi * r.uniform(30, 60) * t)) * .3
    boom_ = lp(noise(d), 200) * np.exp(-t / .2) * .5
    return (snap + zing + boom_) * vel * .45


# 和 js/ 里同一套时刻
HOOK_C0, HOOK_C1, HOOK_C2 = .30, 1.05, 1.85
MOON_LAG = 1.9


# ================= 按时间轴排音效（和 js/main.js 的镜头表对应） =================
# 短促的声音都放在旁白的停顿里；持续的、低频的（海、低鸣、风、倒计时快进的滴答串）可以垫在说话下面。
def build():
    tb = SS('dark')                 # 倒计时到 0、天黑
    # —— 环境声 ——
    bed(lambda d: amb_space(d, 41.2, 7), 0, HOOK_C1, .8)
    bed(amb_bh, HOOK_C1, S('h2'), 1.0)
    bed(lambda d: amb_space(d, 36.7, 13), S('h2'), S('h3') - .1, 1.0)
    bed(amb_beach, S('h3') - .1, SS('front'), 1.0)
    bed(lambda d: amb_space(d, 34.6, 17), SS('front'), SE('front'), 1.0)
    bed(amb_beach, SE('front'), tb, 1.0)
    bed(lambda d: amb_sea(d, .75, 9), tb + .9, SS('cold'), .9)         # 天黑以后：只剩浪声（先空出一小段，显得一下子安静）
    bed(amb_cold, SS('cold'), SS('vent'), 1.0)
    bed(amb_deep, SS('vent'), SS('twist'), 1.0)
    bed(amb_sun, SS('twist'), SS('card'), 1.0)
    bed(lambda d: amb_beach(d, 43), SS('card'), SS('end'), .9)
    bed(lambda d: amb_space(d, 32.7, 19), SS('end') - .2, DUR, .6)

    # —— 开头：太阳缩成黑洞 ——
    place(sfx, low_swell(1.2, .45), 0.0, .6)
    place(sfx, implode(HOOK_C1 - HOOK_C0, .7), HOOK_C0, .9)
    place(sfx, rush(HOOK_C2 - HOOK_C1 + .1, .55), HOOK_C1 - .05, .8)
    place(sfx, boom(2.6, .7), HOOK_C2 - .05, .8)

    # —— 倒计时：出现时一声钟，快进时一串密集的滴答，最后三秒一秒一下 ——
    place(sfx, bell(987.8, 1.6, .3), CH('h3', 1) - .02, .35)
    place(sfx, clock_ticks(SE('front') - EN('h3'), 7, .2), EN('h3') + .1, .45)
    for k in range(3):
        place(sfx, tick(.6), SE('front') + k * (SE('zero') - SE('front')) / 3 + .02, .9)
        place(sfx, thud(.25), SE('front') + k * (SE('zero') - SE('front')) / 3 + .02, .6)

    # —— 上帝视角：黑暗扫过水星、金星 ——
    place(sfx, dark_pass(1.4, .5), CH('f2', 1) - .25, .8)
    place(sfx, dark_pass(1.4, .5), CH('f2', 2) - .25, .8)

    # —— 天黑 ——
    place(sfx, blackout(1.0), tb, 1.0)
    place(sfx, fade_tone(1.2, .5), tb + MOON_LAG - .3, .6)                 # 月亮灭
    place(sfx, shimmer(SE('dark') - S('k3') + .6, .3, 5), S('k3') - .4, .6)  # 星星出来

    # —— 结冰 ——
    place(sfx, whoosh(.4, False, .3), SS('cold') - .25, .35)
    place(sfx, ice_crack(.7, 1), SS('cold') + .02, .7)
    place(sfx, ice_crack(.8, 2), EN('c1') + .05, .75)                     # 两句之间留了 0.4 秒给它
    place(sfx, ice_crack(.6, 3), EN('c2') + .05, .6)

    # —— 深海 ——
    place(sfx, whoosh(.5, False, .35), SS('vent') - .3, .4)

    # —— 真实的太阳、收藏卡、片尾 ——
    place(sfx, shimmer(1.4, .3, 9), SS('twist') - .3, .6)
    place(sfx, bell(880, 2.2, .35), SS('card') - .45, .5)
    place(sfx, bell(659.3, 2.6, .3), SS('end') + .05, .45)


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
