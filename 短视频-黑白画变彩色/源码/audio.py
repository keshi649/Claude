"""《盯住中间的点 20 秒，黑白画会变彩色》声音：旁白配音 + 音效 + 环境声，没有配乐。
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


def heartbeat(d=6.0, bpm=72, vel=.4):
    """心跳：低低的"咚咚"，一分钟 72 下（盯点的最后几秒，越来越响）"""
    out = np.zeros(int(d * SR))
    k = 0.0
    while k < d - .4:
        for dt, v in ((0, 1.0), (.18, .7)):
            tt = tvec(.16)
            thump = np.sin(2 * np.pi * 52 * tt) * np.exp(-tt / .05) * v
            i = int((k + dt) * SR)
            out[i:i + len(thump)] += thump[:max(0, len(out) - i)]
        k += 60 / bpm
    return out * np.linspace(.4, 1, len(out)) * vel * .5


def workers(d=2.0, vel=.35):
    """工人们出力：一下一下的"嘿咻"（8 位风的短音，一秒三下）"""
    out = np.zeros(int(d * SR))
    k = 0.0
    while k < d - .1:
        s = square(64 + (int(k * 3) % 2) * 3, .06, .5, vel, a=.002, dec=.04, sus=.4, rel=.02)
        i = int(k * SR)
        out[i:i + len(s)] += s[:len(out) - i]
        k += 1 / 3
    return out


def blink_snd(vel=.4):
    """眨眼：很短的"啵" """
    t = tvec(.08)
    return np.sin(2 * np.pi * np.cumsum(900 - 500 * t / .08) / SR) * np.sin(np.pi * t / .08) * vel * .25


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
# 盯点的 20 秒里只有很轻的屋里底噪，最后几秒垫一点心跳（低频、连着的，可以垫在说话下面）；
# 换成黑白画的那一下"叮"一声（在"一"和"现在"之间的停顿里）。短促的音效都放在旁白的停顿里。
def build():
    # —— 环境声 ——
    bed(amb_room, 0, SE('reveal'), .8)
    bed(amb_dark, SS('why'), SE('why'), .8)
    bed(amb_room, SS('guide'), DUR, .8)
    dialog_beeps()

    # —— 盯点 ——
    tSw = SS('reveal')
    place(sfx, heartbeat(max(2, tSw - S('s5') + .3), 72, .4), S('s5') - .3, .5)
    place(sfx, chime(91, .4), tSw + .02, .45)                # 变成黑白画的那一刻

    # —— 变成黑白画 ——
    place(sfx, pop_snd(84, .35), S('b3') - .3, .35)          # 取色笔
    place(sfx, blink_snd(.5), S('b4') - .25, .5)              # 眨眼

    # —— 为什么 ——
    place(sfx, glitch(.35), SS('why') - .3, .45)
    place(sfx, workers(max(1, CH('e1', 2) - S('e1')), .35), S('e1'), .2)
    place(sfx, sad_slide(), EN('e1') + .02, .3)               # 累了：在这句念完以后
    place(sfx, tink(.4, 2400), CH('e2', 2) - .2, .4)          # 没累的占了上风
    place(sfx, pop_snd(80, .4), S('e3') - .28, .4)
    place(sfx, pop_snd(84, .4), CH('e3', 2) - .2, .4)
    place(sfx, sparkle(.8, 84, .3), EN('e4') + .05, .45)

    # —— 没看到？ ——
    place(sfx, whoosh(.3, True, .45), S('g1') - .36, .5)
    place(sfx, pop_snd(88, .45), S('z1') - .3, .45)
    place(sfx, sparkle(.9, 84, .3), SS('card') + .05, .5); place(sfx, pop_snd(84), SS('card') + .1, .5)


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
