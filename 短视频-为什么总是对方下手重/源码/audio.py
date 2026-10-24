"""《为什么总是对方下手重？》声音：旁白配音 + 音效 + 环境声，没有配乐。
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
def tink(vel=.4, f=2400):
    """短短的"叮" """
    t = tvec(.12)
    return (np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * f * 2.7 * t)) * np.exp(-t / .025) * vel * .16


def stare(vel=.4):
    """问号：低沉的"咚——" """
    t = tvec(.7)
    return (np.sin(2 * np.pi * 49 * t) + .5 * np.sin(2 * np.pi * 98 * t)) * np.exp(-t / .3) * np.minimum(1, t / .01) * vel * .4


def amb_dark(d):
    """黑底的报告 / 舞台：低低的嗡"""
    t = tvec(d)
    return (np.sin(2 * np.pi * 55 * t) * .05 + np.sin(2 * np.pi * 82.4 * t) * .025 + lp(noise(d), 200) * .04) * (.8 + .2 * np.sin(2 * np.pi * .5 * t))


def slap(vel=.5):
    """打一下：啪（高频噪声的短爆 + 一点低频）"""
    t = tvec(.18)
    x = bp(noise(.18), 1200, 6000) * np.exp(-t / .018) + np.sin(2 * np.pi * 140 * t) * np.exp(-t / .03) * .5
    return x * vel * .45


def pillow_hit(vel=.5):
    """枕头砸上去：噗（闷闷的低频 + 一阵沙沙）"""
    t = tvec(.4)
    x = lp(noise(.4), 700) * np.exp(-t / .07) * .9 + np.sin(2 * np.pi * 80 * t) * np.exp(-t / .08) * .6 + bp(noise(.4), 2000, 6000) * np.exp(-t / .15) * .12
    return x * vel * .45


def scritch(d=1.0, vel=.4, rate=9):
    """挠痒：一下一下的沙沙声（跟着手臂一上一下）"""
    t = tvec(d)
    x = bp(noise(d), 2500, 7000) * (.5 + .5 * np.sign(np.sin(2 * np.pi * rate * t)))
    return x * np.minimum(1, t / .1) * np.clip((d - t) / .15, 0, 1) * vel * .12


def laugh(d=1.2, vel=.4):
    """笑：一串"哈哈哈"（8 位风，音高一点点往下走）"""
    out = np.zeros(int(d * SR))
    n = int(d / .13)
    for k in range(n):
        s = square(79 - k * .8 + (k % 2) * 2, .09, .5, vel * (1 - k / n * .4), a=.003, dec=.05, sus=.6, rel=.02)
        i = int(k * .13 * SR)
        out[i:i + len(s)] += s[:len(out) - i]
    return out


def servo(d=1.0, vel=.4):
    """机器人的电机：嗡嗡地来回转"""
    t = tvec(d)
    ph = np.cumsum(180 + 60 * np.sin(2 * np.pi * 1.6 * t)) / SR
    x = (2 * (ph % 1) - 1) * .5 + bp(noise(d), 1500, 3000) * .15
    return bp(x, 150, 2500) * np.minimum(1, t / .1) * np.clip((d - t) / .2, 0, 1) * vel * .25


def alarm(d=.8, vel=.4):
    """对不上：嘀嘟嘀嘟"""
    out = np.zeros(int(d * SR))
    k = 0
    while k * .2 < d - .1:
        s = square(84 if k % 2 == 0 else 79, .16, .5, vel, a=.002, dec=.1, sus=.7, rel=.02)
        i = int(k * .2 * SR)
        out[i:i + len(s)] += s[:len(out) - i]
        k += 1
    return out


def bell(vel=.4):
    """上课铃：叮铃铃"""
    t = tvec(.9)
    x = sum(np.sin(2 * np.pi * f * t) for f in (2100, 2650)) * (.5 + .5 * np.sign(np.sin(2 * np.pi * 22 * t)))
    return x * np.exp(-t / .5) * np.minimum(1, t / .01) * vel * .08


def amb_living(d):
    """客厅：屋里的底噪 + 远处的城市"""
    return amb_room(d) + amb_city(d) * .5


def amb_lab(d):
    """实验室：设备的嗡嗡声 + 偶尔一声电子音"""
    x = amb_dark(d) * .8 + bp(noise(d), 2000, 4000) * .006
    k = .7
    while k < d - .2:
        b = np.sin(2 * np.pi * 2093 * tvec(.05)) * np.exp(-tvec(.05) / .02) * .02
        i = int(k * SR)
        x[i:i + len(b)] += b[:len(x) - i]
        k += 2.2 + rng.random() * 1.5
    return x


def amb_class(d):
    """教室：屋里的底噪 + 窗外很轻的鸟叫"""
    return amb_room(d) + amb_savanna(d) * .35


def beep(vel=.4):
    """仪器：嘀"""
    t = tvec(.09)
    return np.sin(2 * np.pi * 1760 * t) * np.minimum(1, t / .004) * np.clip((.09 - t) / .02, 0, 1) * vel * .14


SPK_PITCH = {'你': 76}


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
# 短促的音效（啪、弹出、叮、咔嗒）一律放在旁白字头前面（停顿里）或者对话框的时候（对话框不配音），免得把字盖住；
# 旁白念着的时候打闹只有画面，声音等到停顿或者对话框里再响。
def build():
    # —— 环境声 ——
    bed(amb_living, 0, S('h3') - .12, 1.0)
    bed(amb_lab, S('h3') - .12, S('h4') - .12, .9); bed(amb_room, S('h4') - .12, S('h6') - .12, .8); bed(amb_dark, S('h6') - .12, SE('hook'), .8)
    bed(amb_room, SS('tickle'), S('t3') - .15, .9); bed(amb_lab, S('t3') - .15, SE('tickle'), .9)
    bed(amb_room, SS('back'), S('b2') - .15, .9); bed(amb_living, S('b2') - .15, SE('back'), 1.0)
    bed(amb_living, SS('guide'), SE('guide'), 1.0)
    bed(amb_class, SS('end'), DUR, .9)
    dialog_beeps()

    # —— 开头：打闹（和 scenes1.js 的 hookFight 对应）——
    T = S('d1')
    place(sfx, slap(.4), .02, .5, .2)                        # 第一下在旁白开口之前
    place(sfx, slap(.55), T + .2, .55, -.2)                  # 对话框的时候不配音，打闹的声音放在这里
    place(sfx, pillow_hit(.7), T + .55, .6, .2)
    place(sfx, stamp_snd(), S('h2') - .2, .6)                # 章比这句开口早 0.2 秒落下，不压"你"字
    place(sfx, whoosh(.35, True, .45), S('h3') - .45, .55)
    place(sfx, whoosh(.35, True, .45), S('h4') - .42, .5)
    place(sfx, rise(2.6, 55, 79), S('h4') - .05, .12)        # 柱子一根根长高
    place(sfx, stamp_snd(), CH('h4', 3) - .22, .5)
    place(sfx, whoosh(.3, False, .4), S('h5') - .36, .5)
    place(sfx, pop_snd(84, .4), S('d2') + .05, .4)
    place(sfx, tink(.35, 1800), S('h6') - .3, .4)
    place(sfx, scritch(SE('hook') - S('h6'), .3), S('h6'), .5)

    # —— 挠自己为什么不痒 ——
    place(sfx, whoosh(.4, True, .45), SS('tickle') - .15, .5)
    place(sfx, scritch(max(.5, S('t2') - S('t1') - .2), .3), S('t1'), .5)
    place(sfx, pop_snd(80, .4), CH('t1', 1) - .2, .4)        # 大脑圆窗弹出来（"时，"后面的停顿里）
    place(sfx, cool_glide(.9, 1200, 300, .4), CH('t1', 3) - .2, .5)   # 推子拉到底（长的滑音，可以垫在字下面）
    place(sfx, scritch(max(.5, EN('t2') - S('t2') + .6), .45, 12), S('t2') + .3, .55)
    place(sfx, cool_glide(.9, 300, 1400, .4), CH('t2', 2) - .2, .5)   # 推子推到顶
    place(sfx, laugh(1.0, .4), EN('t2') + .03, .5)
    place(sfx, servo(max(1, SE('tickle') - S('t3')), .35), S('t3') - .1, .4)
    place(sfx, pop_snd(84, .4), S('t4') - .3, .4)            # 科学家冒出来
    place(sfx, tick(.45), CH('t4', 1) - .11, .5)              # 拧旋钮："偷偷"和"让"之间只有 0.1 秒的空
    place(sfx, beep(.5), S('t5') - .25, .4)
    place(sfx, alarm(1.0, .3), CH('t5', 1) - .3, .3)
    place(sfx, laugh(1.1, .4), EN('t5') + .03, .5)

    # —— 回到打闹 ——
    place(sfx, glitch(.4), SS('back') - .3, .5)
    place(sfx, slap(.45), CH('b1', 1) - .2, .5)
    place(sfx, cool_glide(.9, 900, 450, .35), CH('b1', 2) - .2, .45)
    place(sfx, whoosh(.3, True, .4), S('b2') - .36, .45)
    place(sfx, slap(.6), EN('b2') + .05, .55, .2)            # 越打越重：等这句念完、对话框的时候再噼里啪啦
    place(sfx, stamp_snd(), EN('b2') + .02, .5)
    for i, tt in enumerate((.3, .62, .94)):
        place(sfx, pillow_hit(.6 + i * .1), S('d4') + tt, .55, (-1) ** i * .3)
    place(sfx, pop_snd(76, .4), S('b3') - .3, .4)

    # —— 大脑静音键的使用说明 ——
    place(sfx, whoosh(.35, True, .45), S('g1') - .5, .5)
    for t0 in (S('g2'), S('g3'), S('g4')):
        place(sfx, coin(.4), t0 - .36, .45)

    # —— 结尾 ——
    place(sfx, bell(.5), SS('end') + .05, .45)
    place(sfx, pop_snd(84), S('d5') + .1, .4)
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
