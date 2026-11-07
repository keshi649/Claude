"""《超过的车，为什么总在红灯追上你？》声音：旁白配音 + 音效 + 环境声，没有配乐。
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
    """低沉的"咚——"（低频，可以垫在说话下面）"""
    t = tvec(.7)
    return (np.sin(2 * np.pi * 49 * t) + .5 * np.sin(2 * np.pi * 98 * t)) * np.exp(-t / .3) * np.minimum(1, t / .01) * vel * .4


def engine(d, f0=32, f1=32, vel=.5, rough=.35):
    """发动机：低低的锯齿波（转速从 f0 变到 f1），带一点抖动和进气声，只留 220 Hz 以下（别盖住鼻音 n、m 的低频）"""
    t = tvec(d)
    f = f0 + (f1 - f0) * np.clip(t / max(d, 1e-3), 0, 1) + np.sin(2 * np.pi * 7 * t) * 1.2
    ph = np.cumsum(f) / SR
    x = (2 * (ph % 1) - 1) * .6 + np.sin(2 * np.pi * ph * 2) * .3
    x = x * (1 + rough * np.sin(2 * np.pi * f * .5 * t))
    x = lp(lp(x + lp(noise(d), 200) * .3, 220), 220)
    return x * np.minimum(1, t / .08) * np.clip((d - t) / .15, 0, 1) * vel * .5


def tire_hiss(d=.6, vel=.4):
    """车轮压过路面：低频的沙沙声"""
    t = tvec(d)
    return lp(noise(d), 500) * np.sin(np.pi * t / d) * vel * .4


def amb_street(d):
    """白天的街：车流的低鸣 + 远处偶尔开过去的车。不加鸟叫：开头"追上你"的"你"正好碰上一声鸟叫，被听成"瘾"（纯人声、人声 + 音效都对）"""
    t = tvec(d)
    x = lp(noise(d), 220) * .55 + bp(noise(d), 300, 900) * .025 * (1 + .6 * np.sin(2 * np.pi * .09 * t))
    k = 2.2
    while k < d - 1:          # 远处的车开过去：一阵慢慢起、慢慢落的呼声
        L = 2.4
        sw = lp(noise(L), 600) * np.sin(np.pi * tvec(L) / L) ** 2 * .22
        i = int(k * SR)
        x[i:i + len(sw)] += sw[:len(x) - i]
        k += 3.5 + rng.random() * 3
    return x * .08


def amb_dusk(d):
    """傍晚的街：车流更远、更轻，加一点虫鸣"""
    t = tvec(d)
    x = lp(noise(d), 200) * .05
    k = .3
    while k < d - .3:
        L = .18
        c = np.sin(2 * np.pi * 4300 * tvec(L)) * (.5 + .5 * np.sign(np.sin(2 * np.pi * 40 * tvec(L)))) * np.sin(np.pi * tvec(L) / L) * .006
        i = int(k * SR)
        x[i:i + len(c)] += c[:len(x) - i]
        k += .55 + rng.random() * .5
    return x


def amb_horror(d):
    """恐怖片：风声 + 低低的嗡 + 远处的闷雷（都是低频）"""
    t = tvec(d)
    wind = bp(noise(d), 200, 900) * (.5 + .5 * np.sin(2 * np.pi * .23 * t) * np.sin(2 * np.pi * .11 * t + 1)) * .05
    drone = (np.sin(2 * np.pi * 41 * t) + .5 * np.sin(2 * np.pi * 61.5 * t)) * .03 * (.8 + .2 * np.sin(2 * np.pi * .4 * t))
    return wind + drone


def amb_studio(d):
    """问答节目 / 转盘：棚里的底噪 + 很轻的观众窸窣（压在 200~1200 Hz，比人声低得多）"""
    t = tvec(d)
    return amb_room(d) * .8 + bp(noise(d), 200, 1200) * .012 * (1 + .5 * np.sin(2 * np.pi * .3 * t))


def thunder(vel=.6):
    """闪电：开头一下脆响（很短），后面是低频的闷雷"""
    t = tvec(2.2)
    crack = hp(noise(.16), 1500) * np.exp(-tvec(.16) / .03)
    roll = lp(noise(2.2), 160) * np.minimum(1, t / .45) * np.exp(-t / .9) * .8      # 闷雷慢慢起来，脆响过去以后才到最响
    out = roll.copy()
    out[:len(crack)] += crack * .9
    return out * vel * .5


def boom(vel=.6):
    """切到恐怖片：低频的"咚" """
    t = tvec(1.0)
    return (np.sin(2 * np.pi * 45 * t * (1 - .2 * t)) * np.exp(-t / .35) + lp(noise(1.0), 120) * np.exp(-t / .2) * .6) * vel * .6


def ratchet(d=.85, vel=.4, n=11):
    """转盘的棘轮：咔咔咔，一下比一下慢"""
    out = np.zeros(int((d + .1) * SR))
    for i in range(n):
        u = i / (n - 1)
        tt = d * (1 - (1 - u) ** 1.8)          # 越来越慢
        c = tick(vel * (1 - u * .3))
        k = int(tt * SR)
        out[k:k + len(c)] += c[:len(out) - k]
    return out


def whir(d=1.2, vel=.35):
    """转盘飞转：低低的呼呼声（低频，可以垫在字下面）"""
    t = tvec(d)
    x = lp(noise(d), 350) * (.6 + .4 * np.sin(2 * np.pi * 9 * t * (1 - .5 * t / d)))
    return x * np.minimum(1, t / .05) * np.clip((d - t) / .3, 0, 1) * vel * .6


def shutter(vel=.4):
    """相机快门：咔嚓"""
    a = hp(noise(.03), 2500) * np.exp(-tvec(.03) / .006)
    b = bp(noise(.05), 1200, 5000) * np.exp(-tvec(.05) / .01)
    out = np.zeros(int(.12 * SR))
    out[:len(a)] += a
    out[int(.06 * SR):int(.06 * SR) + len(b)] += b[:len(out) - int(.06 * SR)]
    return out * vel * .5


def horn(vel=.4):
    """小汽车喇叭：嘀嘀（两声）"""
    out = np.zeros(int(.5 * SR))
    for k in range(2):
        s = square(70, .11, .5, vel, a=.003, dec=.05, sus=.9, rel=.02) + square(74, .11, .5, vel * .7, a=.003, dec=.05, sus=.9, rel=.02)
        i = int(k * .19 * SR)
        out[i:i + len(s)] += s[:len(out) - i]
    return lp(out, 2500)


def tick_clock(d=1.2, vel=.35):
    """思考倒计时：嘀嗒嘀嗒"""
    out = np.zeros(int(d * SR))
    k = 0
    while k * .25 < d - .05:
        c = tick(vel) if k % 2 == 0 else tick(vel * .6)
        i = int(k * .25 * SR)
        out[i:i + len(c)] += c[:len(out) - i]
        k += 1
    return out


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
# 短促的音效（弹出、叮、咔、快门）一律放在旁白字头前面（字和字之间的空隙、句前停顿）或者句尾之后；
# 念着的时候只留低频、持续的声音（发动机、闷雷、转盘的呼呼声）。
def build():
    hS3, hC2, hS4 = S('h3') - .12, CH('h3', 2) - .15, S('h4') - .12
    # —— 环境声 ——
    bed(amb_street, 0, hS3, 1.0)
    bed(amb_room, hS3, hC2, .8)
    bed(amb_horror, hC2, hS4, 1.0)
    bed(amb_studio, hS4, SE('hook'), .9)
    bed(amb_street, SS('lead'), SE('lead'), 1.0)
    bed(amb_studio, SS('wheel'), SE('wheel'), .9)
    bed(amb_city, SS('map'), SE('map'), .8)
    bed(amb_street, SS('mirror'), CH('w1', 4) - .12, .9); bed(amb_room, CH('w1', 4) - .12, SE('mirror'), .8)
    bed(amb_dusk, SS('guide'), DUR, 1.0)
    dialog_beeps()

    # —— 开头：红灯前，他慢慢开过来停在你旁边 ——
    place(amb, engine(1.6, 40, 26, .8), 0, .25, .3)               # 他的车开过来、减速（低频，垫在字下面；压低一半，免得盖住句尾的"你"）
    place(amb, engine(hS3 + .2, 28, 28, .45, .5), 0, .18, -.2)    # 你的车在怠速
    place(sfx, stamp_snd(), S('h2') - .2, .6)                      # 章比"不"字早 0.2 秒落下
    place(sfx, whoosh(.32, True, .45), S('h2') + (EN('h2') - S('h2')) + .03, .5)   # 切到论文：在 h2、h3 之间
    place(sfx, paper(.4), CH('h3', 1) - .17, .5)                   # 贴纸拍上去（"它"和"名"之间 0.2 秒的空）
    place(sfx, boom(.6), hC2 - .1, .6)                              # 切到恐怖片："片"和"你"之间
    tf = CH('h3', 3) - .22
    place(sfx, thunder(.6), tf - .07, .6)                           # 闪电：脆响在"跑"和"杀"之间（比闪光早一点点），后面的闷雷是低频
    for k in range(5):                                              # 他慢慢走的脚步（低频的闷响，很轻）
        place(amb, thud(.25), hC2 + .4 + k * .75, .5, .4)
    place(sfx, stare(.6), CH('h3', 4) - .16, .6)                   # 一下就在你身后："走"和"却"之间
    place(sfx, pop_snd(80, .4), S('h4') - .3, .45)                 # 题板弹出来（句前停顿里）
    place(sfx, tink(.35, 2000), CH('h4', 1) - .13, .4)             # 选项 A（"猜"和"过"之间）
    place(sfx, tick_clock(SE('hook') - EN('h4') - .1, .3), EN('h4') + .05, .5)    # 念完以后：思考倒计时

    # —— 倒回去：你超过他，红灯，又碰面 ——
    L = lead_plan()
    place(sfx, tape(.55), SS('lead') - .25, .4)                      # 倒带（句前停顿里结束）
    place(amb, engine(L['Tstop'] - SS('lead') + .2, 46, 24, .9, .3), SS('lead') - .1, .55, .2)   # 你的车：开、刹车（低频）
    place(amb, tire_hiss(L['Tstop'] - SS('lead'), .5), SS('lead'), .4)
    place(amb, engine(L['Tarr'] - SS('lead') + .4, 30, 22, .7, .4), SS('lead'), .35, -.3)          # 他的车：慢慢开过来
    place(amb, engine(SE('lead') - L['Tstop'], 27, 27, .4, .5), L['Tstop'], .3)                    # 等红灯：怠速
    place(sfx, tink(.35, 1800), CH('e1', 1) - .13, .4)             # "你领先"那根条（"他"和"领"之间）
    place(sfx, stamp_snd(), EN('e2') + .0, .5)                     # 清零（句尾之后）

    # —— 转盘 ——
    place(sfx, whoosh(.35, True, .4), SS('wheel') - .3, .45)
    place(amb, engine(1.3, 40, 24, .4), SS('wheel'), .3)
    place(sfx, pop_snd(76, .45), CH('e3', 1) - .3, .5)             # 转盘弹出来（"时"和"红"之间）
    place(amb, whir(S('e4') - CH('e3', 3) - .2, .5), CH('e3', 3) + .1, .5)   # 飞转（低频，垫在"像转一次转盘"下面）
    place(sfx, ratchet(S('e4') - EN('e3') - .25, .45), EN('e3') + .03, .5)   # 念完以后：咔咔咔慢下来
    place(sfx, clank(.4, 900), S('e4') - .17, .4)                  # 停住
    place(sfx, tink(.35, 2200), CH('e4', 1) - .13, .4)             # "最后 10 秒"
    place(sfx, pop_snd(84, .35), CH('e4', 2) - .15, .4)            # 他蹦进红色那一块（"秒"和"他"之间）
    place(sfx, pop_snd(72, .4), S('e5') - .33, .45)                # 算式框
    place(sfx, tink(.35, 1600), CH('e5', 1) - .13, .4)             # − 8%（"半"和"减"之间）
    place(sfx, tink(.4, 2600), CH('e5', 2) - .19, .45)             # = 42%（"截"和"就"之间）
    place(sfx, levelup(.45), EN('e5') + .02, .5)                   # 答案：B 四成（句尾之后、对话框的时候）

    # —— 连过 8 个路口 ——
    place(sfx, whoosh(.35, True, .4), SS('map') - .3, .45)
    place(sfx, tink(.35, 1800), CH('e6', 0) - .28, .4)             # 第 1 个路口的标签（句前停顿里）
    place(amb, rise(EN('e6') - S('e6'), 55, 72), S('e6'), .07)     # 一个个路口往上数（很轻的长音）
    place(sfx, tink(.35, 2000), CH('e6', 1) - .2, .4)              # "口"和"连"之间
    place(sfx, tink(.35, 2400), CH('e6', 2) - .27, .4)             # 七成多（"个"和"七"之间）
    place(sfx, chime(84, .4), EN('e6') + .03, .45)                 # 差不多九成（句尾之后）

    # —— 甩开 / 被追上 / 记忆 ——
    place(sfx, glitch(.35), SS('mirror') - .3, .45)
    place(amb, engine(CH('w1', 2) - SS('mirror'), 44, 44, .6), SS('mirror'), .4, -.3)
    place(sfx, stare(.5), CH('w1', 1) - .2, .5)                    # 你看不见（低频）
    place(amb, engine(CH('w1', 4) - CH('w1', 2), 27, 27, .45, .5), CH('w1', 2) - .12, .35)
    place(sfx, shutter(.45), EN('w1') + .03, .5)                   # 照片（句尾之后）

    # —— 开车卡 ——
    place(sfx, whoosh(.32, True, .45), S('g1') - .52, .5)
    place(sfx, coin(.4), S('g1') - .36, .45)
    for a, b in (('g1', 'g2'), ('g2', 'g3')):
        place(sfx, tink(.35, 2000), EN(a) + .02, .4)               # 上一条打勾
        place(sfx, coin(.4), S(b) - .36, .45)                       # 下一条出来
    place(sfx, tink(.35, 2000), EN('g3') + .02, .4)

    # —— 结尾：绿灯，一起开走 ——
    place(amb, engine(SE('end') - SS('end'), 27, 27, .45, .5), SS('end'), .35)
    place(sfx, beep(.45), CH('z1', 1) - .22, .4)                   # 变绿灯（"友"和"跑"之间）
    place(amb, engine(2.0, 26, 48, .9), CH('z1', 2) - .1, .5)      # 两辆车一起开走（低频）
    place(sfx, horn(.4), EN('z1') + .04, .4)                       # 嘀嘀（句尾之后）
    place(sfx, sparkle(.9, 84, .3), SS('card') + .05, .55); place(sfx, pop_snd(84), SS('card') + .1, .55)


def lead_plan():
    """和 scenes2.js 的 leadPlan() 一样：超车、刹车、停住、他到的时刻"""
    Tpass, Tbrake, Tstop, Tarr = CH('e1', 0) + .35, CH('e1', 2) - .1, CH('e1', 3) + .6, CH('e2', 3) + .2
    return dict(Tpass=Tpass, Tbrake=Tbrake, Tstop=Tstop, Tarr=Tarr)


def paper(vel=.4):
    """贴纸拍到纸上：短短的"啪"（高频的纸声，0.08 秒）"""
    t = tvec(.08)
    return bp(noise(.08), 1500, 6000) * np.exp(-t / .015) * vel * .45


def beep(vel=.4):
    """红绿灯变灯：嘀"""
    t = tvec(.09)
    return np.sin(2 * np.pi * 1760 * t) * np.minimum(1, t / .004) * np.clip((.09 - t) / .02, 0, 1) * vel * .14


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
