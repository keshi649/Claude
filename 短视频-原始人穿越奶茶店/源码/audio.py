"""《原始人穿越奶茶店》声音：配音 + 配乐 + 音效，全部按 timeline.json 对齐。
配乐与音效用 numpy 合成；配音来自 voice.py 生成的 voice/*.mp3。
用法：python3 audio.py out.wav
"""
import json
import os
import subprocess
import sys

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__))
TLD = json.load(open(os.path.join(HERE, 'timeline.json'), encoding='utf-8'))
LN = {l['id']: l for l in TLD['lines']}
SR = 44100
DUR = TLD['duration']
N = int(SR * DUR)
rng = np.random.default_rng(11)


def S(i): return LN[i]['v0']
def EN(i): return LN[i]['v1']
def CK(i, k): return LN[i]['chunks'][k][0]
def MK(i, k=0): return LN[i]['marks'][k]


# ---------------- 关键时刻（与 scenes1.js 的 T 完全一致） ----------------
class T:
    boom = MK('h1') + .2
    zoom = S('h2') - .12
    same = S('h3') - .14
    wild = S('p1') - .5
    dusk = S('p3')
    bolt = S('p3') + (EN('p3') - S('p3')) * .64
    shop = bolt + 1.3
    cup = S('p6') - .2
    past = S('p9') - .55
    rule = S('p15') - .45
    combo = S('p21') - .5
    egg = S('p27') - .5
    you = S('p30') - .5
    fix = S('p34') - .5
    end = S('p39') - .5
    order = S('c3') - .25
    card = EN('k2') + .3


music = np.zeros((2, N))
sfx = np.zeros((2, N))
voice = np.zeros((2, N))


def place(bus, sig, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N or i + len(sig) <= 0:
        return
    s0 = max(0, -i)
    i = max(0, i)
    j = min(N, i + len(sig) - s0)
    seg = sig[s0:s0 + j - i] * gain
    gl, gr = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    bus[0, i:j] += seg * gl
    bus[1, i:j] += seg * gr


def tvec(d): return np.arange(int(d * SR)) / SR
def lp(x, fc, o=2): return sosfilt(butter(o, fc, 'low', fs=SR, output='sos'), x)
def hp(x, fc, o=2): return sosfilt(butter(o, fc, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def noise(d): return rng.standard_normal(int(d * SR))
def env_ad(t, a, d): return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def nf(name):
    base = {'C': -9, 'D': -7, 'E': -5, 'F': -4, 'G': -2, 'A': 0, 'B': 2}[name[0]]
    rest = name[1:]
    if rest[0] == '#':
        base += 1; rest = rest[1:]
    elif rest[0] == 'b':
        base -= 1; rest = rest[1:]
    return 440.0 * 2 ** ((base + (int(rest) - 4) * 12) / 12)


def glide(f0, f1, d, shape=1.0):
    t = tvec(d)
    u = (t / d) ** shape
    fr = f0 * (f1 / f0) ** u
    return t, 2 * np.pi * np.cumsum(fr) / SR


# ---------------- 乐器 ----------------
def marimba(f, vel=.5, d=.9):
    t = tvec(d)
    out = (np.sin(2 * np.pi * f * t) * np.exp(-t / .32) + .3 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t / .05)
           + .12 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t / .012))
    return out * np.minimum(1, t / .002) * vel * .22


def pluck(f, vel=.5, d=.7, bright=1.0):
    t = tvec(d)
    out = np.zeros_like(t)
    for k in range(1, 9):
        if k * f > 12000:
            break
        out += np.sin(2 * np.pi * k * f * t + k) * np.exp(-t * (3 + k * 2.2 / bright)) / k ** 1.1
    return out * np.minimum(1, t / .002) * vel * .2


def bass(f, vel=.5, d=.45):
    t = tvec(d)
    out = np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t) + .12 * np.sin(6 * np.pi * f * t)
    return out * np.minimum(1, t / .004) * np.exp(-t / .22) * np.clip((d - t) / .05, 0, 1) * vel * .42


def epiano(f, vel=.4, d=1.6):
    t = tvec(d)
    mod = np.sin(2 * np.pi * f * 14 * t) * 1.2 * np.exp(-t / .15)
    out = np.sin(2 * np.pi * f * t + mod) * np.exp(-t / .9) + .2 * np.sin(4 * np.pi * f * t) * np.exp(-t / .3)
    return out * np.minimum(1, t / .004) * np.clip((d - t) / .2, 0, 1) * vel * .16


def bell(f, vel=.5, d=2.5):
    t = tvec(d)
    out = np.zeros_like(t)
    for r, a, tau in [(1, 1, 1.6), (2.76, .45, .8), (5.40, .25, .4), (8.93, .12, .2), (.5, .25, 1.2)]:
        out += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / tau)
    return out * np.minimum(1, t / .002) * vel * .12


def musicbox(f, vel=.5):
    t = tvec(1.8)
    out = (np.sin(2 * np.pi * f * t) * np.exp(-t / .8) + .35 * np.sin(4 * np.pi * f * t) * np.exp(-t / .3)
           + .12 * np.sin(2 * np.pi * f * 4.07 * t) * np.exp(-t / .1))
    return out * np.minimum(1, t / .0015) * vel * .12


def pad(freqs, d, vel=.5, att=.8, rel=1.0, bright=1.0, vib=0.0):
    t = tvec(d)
    out = np.zeros_like(t)
    for f in freqs:
        for det in (-8, 0, 8):
            fd = f * 2 ** (det / 1200)
            ph = 2 * np.pi * fd * t
            if vib:
                ph = ph + vib * fd / 5.5 * np.sin(2 * np.pi * 5.5 * t)
            for h in range(1, int(min(12, 6000 / fd)) + 1):
                out += np.exp(-h * .25 / bright) / h * np.sin(h * ph + rng.uniform(0, 6.28))
    env = np.minimum(1, t / att) * np.clip((d - t) / rel, 0, 1)
    return out * env * vel * .03 / max(1, len(freqs)) ** .5


def brass(f, d=.3, vel=.5):
    t = tvec(d + .15)
    saw = np.zeros_like(t)
    for k in range(1, 14):
        if k * f > 9000:
            break
        saw += np.sin(2 * np.pi * k * f * t) / k
    out = lp(saw, 2200) * np.minimum(1, t / .02) * np.clip((d + .1 - t) / .1, 0, 1)
    return out * vel * .2


# ---------------- 鼓 ----------------
def kick(v=1.0):
    t, ph = glide(160, 45, .35, .35)
    return (np.sin(ph) * np.exp(-t / .14) + .3 * hp(noise(.35), 2000) * np.exp(-t / .004)) * v * .55


def clap(v=1.0):
    d = .25; t = tvec(d); x = bp(noise(d), 900, 4000)
    e = sum(np.exp(-np.maximum(0, t - k * .011) / .006) * (t >= k * .011) for k in range(3)) + .7 * np.exp(-t / .07)
    return x * e * v * .25


def hat(v=1.0, open_=False):
    d = .3 if open_ else .06; t = tvec(d)
    return hp(noise(d), 7000) * np.exp(-t / (.09 if open_ else .015)) * v * .13


def shaker(v=1.0):
    d = .09; t = tvec(d)
    return bp(noise(d), 5000, 11000) * np.sin(np.pi * t / d) ** 2 * v * .08


def tom(f, v=1.0):
    t, ph = glide(f * 1.6, f, .45, .3)
    return (np.sin(ph) * np.exp(-t / .2) + .2 * lp(noise(.45), 1200) * np.exp(-t / .02)) * v * .4


def crash(v=1.0, d=2.0):
    t = tvec(d)
    return hp(noise(d), 4000) * np.exp(-t / .7) * np.minimum(1, t / .002) * v * .16


# ---------------- 音效 ----------------
def thump(v=1.0):
    t = tvec(.5)
    out = np.sin(2 * np.pi * (55 + 70 * np.exp(-t / .03)) * t) * np.exp(-t / .13)
    out += .5 * lp(noise(.5), 900) * np.exp(-t / .02)
    return out * v * .5


def pop(v=1.0, f0=420, f1=1000):
    t, ph = glide(f0, f1, .13, .5)
    return np.sin(ph) * np.exp(-t / .04) * np.minimum(1, t / .003) * v * .16


def plink(f=2093, v=1.0):
    t = tvec(.5)
    return (np.sin(2 * np.pi * f * t) + .5 * np.sin(3 * np.pi * f * t) + .3 * np.sin(2 * np.pi * f * 2.7 * t)) * np.exp(-t / .11) * v * .1


def sparkle(t0, base=2093, n=5, step=.06, v=.8):
    for k, r in enumerate([1, 1.26, 1.5, 2, 2.52, 3][:n]):
        place(sfx, plink(base * r, v * (1 - k * .1)), t0 + k * step, pan=-.4 + .2 * k)


def click(v=1.0):
    t = tvec(.05)
    return (np.sin(2 * np.pi * 1800 * t) * np.exp(-t / .008) + .8 * hp(noise(.05), 3000) * np.exp(-t / .0015)) * v * .14


def beep(f=1800, d=.07, v=1.0):
    t = tvec(d)
    sq = np.sign(np.sin(2 * np.pi * f * t)) * .5 + .5 * np.sin(2 * np.pi * f * t)
    return lp(sq, 6000) * np.clip((d - t) / .01, 0, 1) * np.minimum(1, t / .003) * v * .07


def swept(d, f0, f1, bw=.55, gain=1.0, shape=None):
    n = int(d * SR)
    x = rng.standard_normal(n + 2048)
    out = np.zeros(n + 2048)
    w = np.hanning(2048)
    freqs = np.fft.rfftfreq(2048, 1 / SR)
    for s in range(0, n, 512):
        fc = f0 * (f1 / f0) ** (s / n)
        X = np.fft.rfft(x[s:s + 2048] * w)
        out[s:s + 2048] += np.fft.irfft(X * np.exp(-.5 * (np.log(np.maximum(freqs, 1) / fc) / bw) ** 2)) * w
    out = out[:n]
    u = np.arange(n) / n
    out = out * (np.sin(np.pi * u) ** 1.5 if shape is None else shape(u))
    return out / (np.abs(out).max() + 1e-9) * gain


def whoosh(d=.45, up=True, g=.12): return swept(d, 300 if up else 3000, 3000 if up else 300, .5, g)


def slurp(d):
    t = tvec(d)
    x = bp(noise(d), 700, 2600) * (.5 + .5 * np.abs(np.sin(2 * np.pi * (9 + 5 * np.sin(t * 3)) * t)))
    _, ph = glide(300, 900, d, .7)
    tone = np.sin(ph + 3 * np.sin(2 * np.pi * 23 * t)) * .25
    bub = np.zeros_like(t)
    for k in range(int(d * 14)):
        i = int(rng.uniform(0, d - .05) * SR); tt, p2 = glide(rng.uniform(500, 900), rng.uniform(1200, 1800), .04)
        bub[i:i + len(tt)] += np.sin(p2) * np.exp(-tt / .015) * .5
    env = np.minimum(1, t / .08) * np.clip((d - t) / .05, 0, 1)
    return (x * .7 + tone + bub) * env * .2


def siren(d, v=1.0):
    t = tvec(d)
    f = np.where((t % .5) < .25, 880, 660).astype(float)
    f = lp(f, 30)
    ph = 2 * np.pi * np.cumsum(f) / SR
    out = sum(np.sin(k * ph) / k for k in (1, 3, 5, 7))
    return lp(out, 3500) * np.minimum(1, t / .05) * np.clip((d - t) / .1, 0, 1) * v * .07


def scratch(v=1.0):
    d = .45; t = tvec(d)
    pos = np.sin(2 * np.pi * 3.2 * t) * np.exp(-t / .3)
    rate = np.abs(np.gradient(pos)) * SR / 40
    x = bp(noise(d), 500, 5000) * np.clip(rate, 0, 1)
    _, ph = glide(800, 200, d)
    return (x + .3 * np.sin(ph * (1 + .5 * pos))) * np.clip((d - t) / .05, 0, 1) * v * .3


def boing(v=1.0, f=300):
    d = .5; t = tvec(d)
    fr = f * (1 + .6 * np.exp(-t / .08)) * (1 + .08 * np.sin(2 * np.pi * 18 * t))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / .15) * v * .2


def chirp_bird(v=1.0):
    out = np.zeros(int(.5 * SR))
    for k in range(3):
        tt, ph = glide(2600, 4200, .07, .5)
        i = int(k * .11 * SR); out[i:i + len(tt)] += np.sin(ph) * np.sin(np.pi * tt / .07) ** 2
    return out * v * .08


def flap(v=1.0, n=4):
    out = np.zeros(int((n * .09 + .1) * SR))
    for k in range(n):
        x = lp(noise(.06), 1500) * np.hanning(int(.06 * SR)); i = int(k * .09 * SR); out[i:i + len(x)] += x
    return out * v * .25


def ook(v=1.0):
    out = np.zeros(int(.6 * SR))
    for k, (a, b) in enumerate([(380, 560), (420, 640)]):
        tt, ph = glide(a, b, .16, .6)
        saw = sum(np.sin(h * ph) / h for h in range(1, 8))
        x = bp(saw, 400, 1600) * np.sin(np.pi * tt / .16)
        i = int(k * .22 * SR); out[i:i + len(x)] += x
    return out * v * .3


def blat(v=1.0):
    tt, ph = glide(130, 95, .35)
    saw = sum(np.sin(h * ph) / h for h in range(1, 14))
    return lp(saw, 1400) * np.minimum(1, tt / .02) * np.clip((.35 - tt) / .08, 0, 1) * v * .25


def buzz(d, f=230, v=1.0):
    t = tvec(d)
    ph = 2 * np.pi * np.cumsum(f * (1 + .05 * np.sin(2 * np.pi * 7 * t) + .03 * np.sin(2 * np.pi * 1.3 * t))) / SR
    saw = sum(np.sin(h * ph) / h for h in range(1, 12))
    return bp(saw, 200, 3000) * (.7 + .3 * np.sin(2 * np.pi * 31 * t)) * np.minimum(1, t / .1) * np.clip((d - t) / .2, 0, 1) * v * .06


def electric(d, v=1.0):
    t = tvec(d)
    saw = sum(np.sin(h * 2 * np.pi * 110 * t) / h for h in range(1, 20))
    x = saw * (.5 + .5 * np.sign(np.sin(2 * np.pi * 37 * t))) + .6 * hp(noise(d), 3000) * (rng.random(len(t)) > .97)
    return x * np.clip((d - t) / .05, 0, 1) * v * .08


def thunder(v=1.0):
    d = 2.4; t = tvec(d)
    x = lp(noise(d), 300, 3) * (np.exp(-t / .7) + .4 * np.exp(-((t - .3) / .25) ** 2))
    crack = hp(noise(.3), 1500) * np.exp(-tvec(.3) / .05)
    out = x * 1.4
    out[:len(crack)] += crack
    return out * v * .6


def wind(d, v=1.0):
    t = tvec(d)
    x = lp(noise(d), 500, 2) * (.5 + .5 * np.sin(2 * np.pi * .3 * t + 1)) + .3 * bp(noise(d), 800, 1600) * (.5 + .5 * np.sin(2 * np.pi * .23 * t))
    return x * np.minimum(1, t / .6) * np.clip((d - t) / .6, 0, 1) * v * .3


def crackle(d, v=1.0, rate=18):
    out = np.zeros(int(d * SR))
    for _ in range(int(d * rate)):
        i = int(rng.uniform(0, d - .02) * SR); x = hp(noise(.01), 2000) * np.exp(-tvec(.01) / .002) * rng.uniform(.3, 1)
        out[i:i + len(x)] += x
    return out * v * .2


def tink(v=1.0):
    t = tvec(.18)
    out = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / tau) for f, a, tau in [(2830, 1, .06), (4170, .6, .04), (6310, .4, .02)])
    return (out + .4 * lp(noise(.18), 600) * np.exp(-t / .01)) * v * .1


def drip(v=1.0):
    tt, ph = glide(900, 2200, .08, .4)
    return np.sin(ph) * np.exp(-tt / .03) * v * .1


def crickets(d, v=1.0):
    out = np.zeros(int(d * SR))
    k = 0
    while k * .42 < d - .2:
        for j in range(3):
            tt = tvec(.035); x = np.sin(2 * np.pi * 4400 * tt) * np.sin(np.pi * tt / .035) * (.6 + .4 * np.sin(2 * np.pi * 200 * tt))
            i = int((k * .42 + j * .05) * SR); out[i:i + len(x)] += x
        k += 1
    return out * v * .05


def engine(d, rev_at=None, v=1.0):
    t = tvec(d)
    f = np.full_like(t, 38.0)
    if rev_at is not None:
        f += 70 * np.clip((t - rev_at) / .35, 0, 1) * np.exp(-np.maximum(0, t - rev_at - .35) / 1.2)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = sum(np.sin(h * ph) / h for h in range(1, 18))
    x = lp(x, 900) * (.7 + .3 * np.sign(np.sin(ph / 2)))
    return x * np.minimum(1, t / .2) * np.clip((d - t) / .15, 0, 1) * v * .12


def rip(v=1.0):
    d = .3; t = tvec(d)
    return bp(noise(d), 1500, 7000) * (.5 + .5 * (rng.random(len(t)) > .6)) * np.exp(-t / .12) * v * .2


def clink(v=1.0):
    t = tvec(.2)
    return (np.sin(2 * np.pi * 3600 * t) * np.exp(-t / .04) + .5 * np.sin(2 * np.pi * 5300 * t) * np.exp(-t / .025)
            + .3 * lp(noise(.2), 700) * np.exp(-t / .01)) * v * .08


def plop(v=1.0):
    tt, ph = glide(420, 140, .09, .6)
    return np.sin(ph) * np.exp(-tt / .04) * v * .14


def pour(d, v=1.0):
    t = tvec(d)
    x = lp(noise(d), 900) * (.6 + .4 * np.sin(2 * np.pi * 11 * t + np.sin(2 * np.pi * 3 * t)))
    return x * np.minimum(1, t / .05) * np.clip((d - t) / .1, 0, 1) * v * .35


def notif(v=1.0):
    out = np.zeros(int(.7 * SR))
    for k, f in enumerate([nf('E6'), nf('B6')]):
        x = bell(f, .9, .5); i = int(k * .1 * SR); out[i:i + len(x)] += x
    return out * v


def poof(v=1.0):
    d = .5; t = tvec(d)
    return lp(noise(d), 2500) * np.exp(-t / .1) * np.minimum(1, t / .005) * v * .35


def wrong(v=1.0):
    t = tvec(.3)
    return lp(np.sign(np.sin(2 * np.pi * 150 * t)), 1800) * np.clip((.3 - t) / .05, 0, 1) * v * .06


def blah(d, v=1.0):
    """查理布朗老师那种“哇哇哇”"""
    out = np.zeros(int(d * SR))
    t0 = 0
    while t0 < d - .15:
        sd = rng.uniform(.12, .22); f = rng.uniform(150, 210)
        tt, ph = glide(f, f * rng.uniform(.85, 1.1), sd)
        saw = sum(np.sin(h * ph) / h for h in range(1, 14))
        x = lp(saw, 700) * np.sin(np.pi * tt / sd) ** .7
        i = int(t0 * SR); out[i:i + len(x)] += x[:len(out) - i]
        t0 += sd + rng.uniform(.03, .08)
    return out * v * .18


def rumble(d, v=1.0):
    t = tvec(d)
    return lp(noise(d), 160, 3) * np.minimum(1, t / .1) * np.clip((d - t) / .2, 0, 1) * v * .9


def tada(t0, root='C5', v=1.0):
    for k, iv in enumerate([0, 4, 7]):
        place(sfx, brass(nf(root) * 2 ** (iv / 12), .1, .5 * v), t0 + k * .08, pan=-.2 + .2 * k)
    for iv in (0, 4, 7, 12):
        place(sfx, brass(nf(root) * 2 ** (iv / 12), .6, .35 * v), t0 + .26)


def chime_up(t0, v=1.0):
    for k, n in enumerate(['C6', 'E6', 'G6']):
        place(sfx, bell(nf(n), .7 * v, 1.2), t0 + k * .07, pan=.2)


# ---------------- 律动（配乐） ----------------
BPM = 120
BEAT = 60 / BPM
CH = {
    'C': ['C', 'E', 'G'], 'Am': ['A', 'C', 'E'], 'F': ['F', 'A', 'C'], 'G': ['G', 'B', 'D'],
    'Dm': ['D', 'F', 'A'], 'Bb': ['Bb', 'D', 'F'], 'Em': ['E', 'G', 'B'],
}


def note(n, o): return nf(f'{n}{o}')


def env_window(t, a, b, fi=.3, fo=.5):
    return float(np.clip((t - a) / fi, 0, 1) * np.clip((b - t) / fo, 0, 1))


def groove(a, b, style, gain=1.0):
    """从 a 到 b 铺一段律动。"""
    nb = int((b - a) / BEAT)
    for k in range(nb):
        tb = a + k * BEAT
        w = env_window(tb, a, b, .01, .9) * gain
        if w <= 0:
            continue
        bar, bi = divmod(k, 4)
        if style in ('shop', 'bright', 'hope'):
            prog = {'shop': ['C', 'Am', 'F', 'G'], 'bright': ['F', 'G', 'Em', 'Am'], 'hope': ['F', 'C', 'Dm', 'Bb']}[style]
            ch = CH[prog[bar % 4]]
            if bi in (0, 2):
                place(music, kick(.8 * w), tb)
            if bi in (1, 3):
                place(music, clap(.55 * w), tb, pan=.1)
            for h in range(2):
                place(music, hat(.45 * w if h else .25 * w), tb + h * BEAT / 2, pan=.35)
            if bi in (0, 2):
                place(music, bass(note(ch[0], 2), .8 * w), tb)
            if bi == 3:
                place(music, bass(note(ch[0], 2) * 1.5, .5 * w, .2), tb + BEAT / 2)
            arp = [ch[0], ch[1], ch[2], ch[1]]
            for h in range(2):
                n = arp[(bi * 2 + h) % 4]
                o = 5 if n in ('C', 'D', 'E', 'F') or style == 'bright' else 4
                place(music, marimba(note(n, o), .55 * w), tb + h * BEAT / 2, pan=-.25)
            if style == 'hope' and bi == 0:
                place(music, pad([note(x, 3) for x in ch], BEAT * 4 + .3, .45 * w, att=.3, rel=.5), tb)
        elif style == 'stone':
            pent = ['A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'G4', 'E4', 'D4', 'C4', 'D4', 'E4', 'A3', 'E4', 'D4', 'C4']
            if bi in (0, 2):
                place(music, tom(85, .9 * w), tb)
            if bi == 1:
                place(music, tom(140, .6 * w), tb + BEAT / 2, pan=.2)
            if bi == 3:
                place(music, tom(110, .7 * w), tb, pan=-.2)
                place(music, tom(140, .5 * w), tb + BEAT / 2, pan=.2)
            for h in range(4):
                place(music, shaker(.6 * w if h % 2 else .35 * w), tb + h * BEAT / 4, pan=.4)
            for h in range(2):
                i = (k * 2 + h) % 16
                if (k * 2 + h) % 3 != 2:
                    place(music, marimba(nf(pent[i]), .6 * w, 1.2), tb + h * BEAT / 2, pan=-.2)
            if bi == 0:
                place(music, bass(nf('A1'), .6 * w, 1.0), tb)
        elif style == 'night':
            prog = [['F3', 'A3', 'C4', 'E4'], ['E3', 'G3', 'B3', 'D4'], ['D3', 'F3', 'A3', 'C4'], ['C3', 'E3', 'G3', 'B3']]
            ch = prog[bar % 4]
            if bi == 0:
                for n in ch:
                    place(music, epiano(nf(n), .5 * w, BEAT * 4), tb + rng.uniform(0, .02), pan=-.15)
                place(music, bass(nf(ch[0]) / 2, .6 * w, 1.0), tb)
            if bi == 2:
                place(music, bass(nf(ch[0]) / 2, .45 * w, .6), tb + BEAT / 2)
            if bi in (0,):
                place(music, kick(.55 * w), tb)
            if bi == 2:
                place(music, kick(.4 * w), tb + BEAT / 2)
            if bi in (1, 3):
                place(music, clap(.3 * w), tb, pan=.1)
            for h in range(2):
                place(music, hat(.25 * w), tb + h * BEAT / 2 + (.06 if h else 0), pan=.35)
        elif style == 'pluck':
            prog = ['C', 'G', 'Am', 'F']
            ch = CH[prog[bar % 4]]
            for h in range(2):
                if (bi * 2 + h) % 4 != 3:
                    n = [ch[0], ch[2], ch[1], ch[2]][(bi * 2 + h) % 4]
                    place(music, pluck(note(n, 4), .55 * w, .5), tb + h * BEAT / 2, pan=-.2 + .4 * h)
            if bi in (0, 2):
                place(music, pluck(note(ch[0], 2), .7 * w, .6, .6), tb)
            if bi in (1, 3):
                place(music, clap(.25 * w), tb)


def stinger(t0, chord=('C3', 'G3', 'C4', 'E4', 'G4'), v=1.0):
    place(music, kick(1.0 * v), t0)
    place(music, crash(.8 * v), t0)
    for n in chord:
        place(music, brass(nf(n), .5, .55 * v), t0)
    place(music, pad([nf(n) for n in chord], 1.4, .8 * v, att=.01, rel=1.0, bright=1.6), t0)


# ================= 编排 =================
# —— 钩子 ——
place(sfx, slurp(T.boom - .02), 0.0, .9, pan=.2)
# 第一口：短促有力的打击，不拖长音，免得盖住“全糖奶茶”
place(music, kick(1.0), T.boom)
place(music, crash(.4, 1.0), T.boom)
for n in ('C3', 'G3', 'C4', 'E4', 'G4'):
    place(music, brass(nf(n), .14, .5), T.boom)
place(sfx, thump(.45), T.boom)
place(sfx, swept(1.0, 2500, 8000, .6, .12, shape=lambda u: np.exp(-u * 4) * np.minimum(1, u * 40)), T.boom)
sparkle(T.boom + .05, base=nf('C7'), n=6, step=.05, v=.9)
for k in range(5):
    place(sfx, pop(.6, 500 + 120 * k, 1300 + 100 * k), T.boom + .15 + k * .09, pan=-.6 + .3 * k)
place(sfx, swept(.42, 400, 5000, .5, .2), T.zoom, pan=0)
place(sfx, siren(T.same - T.zoom - .1, 1.0), T.zoom + .3)
for k in range(int((T.same - T.zoom - .2) / (BEAT / 4))):
    place(music, bass(nf('A1'), .6, .12), T.zoom + .3 + k * BEAT / 4)
place(music, pad([nf('A2'), nf('E3'), nf('A3')], T.same - T.zoom, .5, att=.2, rel=.3, bright=1.4), T.zoom + .2)
place(sfx, whoosh(.4, False, .12), T.same - .05)
place(music, pad([nf('C3'), nf('G3'), nf('E4')], T.wild - T.same, .45, att=.3, rel=.4), T.same)
place(music, marimba(nf('E5'), .4), S('h3') + .05, pan=-.2)
place(music, marimba(nf('G5'), .4), S('h3') + .3, pan=.2)
place(sfx, pop(.8), T.same + .2)
place(sfx, pop(.9, 300, 700), S('h3') + .25)
place(sfx, thump(.5), CK('h3', 1) + .2)
place(sfx, crash(.2, 1.0), CK('h3', 1) + .2)
# —— 倒带 ——
rw = swept(.7, 500, 4000, .5, .25, shape=lambda u: np.sin(np.pi * u) ** .8)
tt = tvec(.7); rw += np.sin(2 * np.pi * np.cumsum(800 + 600 * np.sin(2 * np.pi * 14 * tt)) / SR) * .08 * np.sin(np.pi * tt / .7)
place(sfx, rw, T.wild - .2)

# —— 野外 ——
groove(T.wild + .35, T.dusk + .25, 'stone', .9)
place(sfx, swept(CK('p2', 1) - S('p2'), 2000, 6000, .8, .14, shape=lambda u: (.6 + .4 * np.abs(np.sin(u * 40))) * np.sin(np.pi * u) ** .5), S('p2'))
place(sfx, pop(.8, 600, 1400), CK('p2', 1) + .1)
for k in range(3):
    place(sfx, plink(nf('E6') * 2 ** (k * 4 / 12), .5), CK('p2', 1) + .2 + k * .07)
eat = CK('p2', 1) + .75
place(sfx, thump(.35), eat)
sour = eat + .25
tt = tvec(.8); place(sfx, np.sin(2 * np.pi * np.cumsum(500 * (1 - .4 * tt / .8) * (1 + .06 * np.sin(2 * np.pi * 12 * tt))) / SR) * np.exp(-tt / .4) * .12, sour)
place(sfx, wind(T.bolt - T.dusk + .4, 1.0), T.dusk)
place(sfx, rumble(1.2, .3), T.dusk + .4)
place(sfx, thunder(.75), T.bolt)
place(sfx, electric(.5, 1.0), T.bolt + .02)
place(sfx, swept(.8, 200, 4000, .5, .2, shape=lambda u: u ** .5 * (1 - u) ** .3), T.bolt + .4)
for k in range(8):
    place(sfx, plink(nf('A6') * 2 ** (k / 12 * 2), .3), T.bolt + .5 + k * .05, pan=-.5 + .12 * k)
place(sfx, swept(.5, 3000, 300, .5, .15), T.shop - .25)

# —— 奶茶店 ——
place(sfx, bell(nf('E6'), .7, 1.5), T.shop + .05, pan=.3)
place(sfx, bell(nf('C6'), .7, 1.8), T.shop + .3, pan=.3)
place(sfx, thump(1.0), T.shop + .45)
place(sfx, boing(.6, 220), T.shop + .47)
for k in range(5):
    place(sfx, chirp_bird(.6), T.shop + .6 + k * .14, pan=-.4 + .2 * k)
groove(S('k1') - .3, S('c1') - .1, 'shop', .85)
place(sfx, swept(.25, 1500, 5000, .5, .08), CK('p4', 1))
for k in range(3):
    place(sfx, swept(.12, 1800, 5000, .6, .12), CK('p4', 1) + .15 + k * .2)
for i in range(4):
    place(sfx, plink(nf(['C6', 'E6', 'G6', 'C7'][i]), .6), S('p5') + .1 + i * .28, pan=-.4 + .27 * i)
sparkle(CK('p5', 1), base=nf('E6'), n=5, step=.05, v=.35)
place(sfx, swept(.35, 300, 1200, .5, .1), S('c1') - .45)
place(sfx, scratch(1.0), S('c1') - .25)
place(sfx, thump(1.0), S('c1') - .1)
place(sfx, crash(.25, 1.0), S('c1') - .1)

# —— 做奶茶 ——
groove(T.cup, T.past + .2, 'shop', .8)
t0, tP, tF, tL = S('p6'), CK('p6', 1), CK('p6', 2), EN('p6') + .05
for k in range(5):
    place(sfx, beep(1900, .06, 1.0), t0 + k * .17, pan=.1)
    place(sfx, plop(.6), t0 + k * .17 + .45)
for k in range(14):
    place(sfx, plop(.8), tP + .25 + k * .045 + rng.uniform(0, .02), pan=rng.uniform(-.4, .4))
place(sfx, pour(.75, 1.0), tF - .05)
place(sfx, click(1.2), tL + .05)
place(sfx, poof(.3), tL + .27)
place(sfx, pop(.7, 800, 1600), tL + .28)
place(sfx, whoosh(.4, True, .1), S('p7') - .15)
place(sfx, plink(nf('A6'), .6), CK('p7', 1) - .05)
for k in range(12):
    place(sfx, tink(.5), CK('p7', 2) + k * .055)
place(sfx, bell(nf('E7'), .6, 1.0), CK('p7', 2) + .7)
place(sfx, bell(nf('A7'), .5, 1.0), CK('p7', 2) + .8)
tc = S('p8') - .1
for i in range(13):
    place(sfx, clink(.9), tc + i * .07 + .32, pan=-.5 + i * .08)
place(sfx, pop(.9), tc + .95)

# —— 远古的甜 ——
place(sfx, whoosh(.45, True, .12), T.past - .05)
groove(T.past + .1, T.rule + .1, 'stone', .8)
place(sfx, bell(nf('G6'), .8, 2.0), CK('p9', 1) - .1, pan=.2)
place(music, pad([nf('C4'), nf('E4'), nf('G4'), nf('C5')], 1.8, .7, att=.15, rel=1.0, bright=1.6, vib=.004), CK('p9', 1) - .1)
place(sfx, pop(.9), CK('p9', 1))
tB = S('p10') - .1
place(sfx, whoosh(.35, False, .1), tB - .05)
place(sfx, pop(.7, 900, 1800), tB + .05)
place(sfx, pop(.9, 300, 700), tB + .35)
place(sfx, boing(.5, 500), tB + .9)
tC = CK('p10', 1) - .05
for k in range(13):
    place(sfx, tink(.25), tC + k * .048)
place(sfx, bell(nf('E6'), .6, 1.0), tC + .4)
place(sfx, pop(.7), tC + .5)
place(sfx, wrong(.6), tC + .8)
u0 = S('p11')
place(sfx, flap(.8, 5), u0 - .1, pan=.5)
place(sfx, chirp_bird(1.0), u0 + .4, pan=.3)
place(sfx, ook(.5), u0 + .5, pan=-.4)
place(sfx, blat(.4), u0 + .6)
place(sfx, flap(.6, 4), u0 + .5, pan=-.5)
place(sfx, swept(.6, 1000, 5000, .6, .1), S('p12'))
sparkle(S('p12') + .1, base=nf('G6'), n=4, step=.08, v=.5)
for k in range(6):
    place(sfx, swept(.08, 1500, 3000, .6, .08), CK('p12', 1) + k * .16)
c2 = CK('p12', 2)
place(sfx, buzz(S('p13') - .15 - (S('p12') - .1), 230, .5), S('p12') - .1, pan=.3)
place(sfx, buzz(S('p13') - .15 - c2, 260, 1.0), c2, pan=-.2)
for k in range(3):
    place(sfx, boing(.6, 350 + 80 * k), c2 + .1 + k * .15)
tada(c2 + .55, 'C5', .6)
tF = S('p13') - .15
place(sfx, whoosh(.4, True, .1), tF - .05)
place(sfx, pop(.8), tF + .05)
for i in range(5):
    place(sfx, pop(.6, 500 + 80 * i, 1100 + 80 * i), CK('p13', 1) + i * .12, pan=-.6 + .3 * i)
for k in range(8):
    place(sfx, tink(.2), CK('p13', 1) + .7 + k * .1)
place(sfx, swept(.5, 400, 3000, .5, .1), S('p14') - .05)
tada(S('p14') + .35, 'F5', .7)
place(sfx, crackle(1.2, 1.0, 40), S('p14') + .4)

# —— 大脑的铁律 ——
place(music, pad([nf('A1'), nf('E2'), nf('A2')], S('p19') - .15 - T.rule, .6, att=.8, rel=.6, bright=.6), T.rule)
for k in range(int((S('p17') - T.rule) / .9)):
    place(sfx, drip(.5), T.rule + .3 + k * .9 + rng.uniform(0, .4), pan=rng.uniform(-.7, .7))
place(music, marimba(nf('A3'), .6, 1.5), T.rule + .2)
titleA = EN('p15') - .55
windows = [(titleA, titleA + .4)] + [(CK('p16', k), CK('p16', k) + .55) for k in range(3)]
for a, b in windows:
    k = 0
    while a + k * .112 < b:
        place(sfx, tink(.7 + .3 * rng.random()), a + k * .112, pan=-.1)
        k += 1
    place(sfx, thump(.35), b)
for k, n in enumerate(['A3', 'C4', 'E4']):
    place(music, marimba(nf(n), .6, 1.4), CK('p16', k) + .55)
tB = S('p17') - .15
place(sfx, wind(S('p18') - tB, 1.2), tB)
place(sfx, crackle(S('p18') - tB, .8, 22), tB, pan=.3)
place(music, pad([nf('D3'), nf('F3'), nf('A3')], S('p18') - tB + .2, .5, att=.4, rel=.4), tB)
for k, n in enumerate(['A5', 'F5', 'D5', 'E5', 'C5']):
    place(music, musicbox(nf(n), .5), tB + .3 + k * .32)
tC = S('p18') - .1
k = 0
while tC + k * .32 < S('p19') - .2:
    place(sfx, swept(.12, 2500, 6000, .6, .07), tC + k * .32, pan=(-1) ** k * .4)
    k += 1
for i in range(9):
    place(sfx, pop(.45, 400 + 40 * i, 900 + 60 * i), tC + i * .26, pan=-.7 + i * .17)
for i in range(7):
    place(music, marimba(nf(['A3', 'C4', 'E4', 'A4', 'C5', 'E5', 'A5'][i]), .55), tC + .2 + i * (EN('p18') - .4 - tC) / 6)
tD = S('p19') - .15
stomp = EN('p19') - .75
place(sfx, engine(S('p20') - tD, rev_at=stomp - tD, v=1.0), tD)
place(sfx, swept(1.0, 300, 3000, .5, .2), stomp)
place(sfx, crash(.4, 1.2), stomp)
place(sfx, swept(.5, 800, 120, .6, .1), S('p20') - .15)
place(sfx, crickets(T.combo - S('p20') + .2, 1.0), S('p20'), pan=-.3)
place(sfx, pop(.6), S('p20') + .1)
place(sfx, thump(.55), EN('p20') - .45 + .2)

# —— 糖油组合 ——
place(sfx, whoosh(.45, True, .12), T.combo - .05)
groove(T.combo + .1, T.egg + .2, 'shop', .75)
for k in range(3):
    place(sfx, pop(.4, 900, 1700), T.combo + .3 + k * .35)
tB = S('p22') - .1
place(sfx, swept(.8, 600, 2400, .5, .08, shape=lambda u: np.sin(np.pi * u)), tB + .1)
place(sfx, pop(.8), CK('p22', 1) + .3)
place(sfx, pop(.8, 500, 1100), S('p23'))
place(sfx, wrong(.4), S('p23') + .25)
place(sfx, pop(.8, 500, 1100), CK('p23', 1))
place(sfx, wrong(.4), CK('p23', 1) + .25)
place(sfx, pop(.9, 600, 1300), S('p24'))
chime_up(CK('p24', 1), .6)
for a, f0 in [(CK('p25', 1), 300), (CK('p25', 1) + .35, 330)]:
    tt, ph = glide(f0, f0 * 1.6, .6); place(sfx, np.sin(ph) * np.sin(np.pi * tt / .6) * .08, a)
place(sfx, swept(.3, 2000, 5000, .5, .06), S('p26') - .05)
tt, ph = glide(300, 900, .6); place(sfx, np.sin(ph) * np.sin(np.pi * tt / .6) ** .5 * .1, S('p26') + .35)
sparkle(CK('p26', 1) - .1, base=nf('C7'), n=6, step=.05, v=.8)
place(sfx, pop(.9), CK('p26', 1) - .1)

# —— 假蛋 ——
place(sfx, whoosh(.5, False, .12), T.egg - .05)
groove(T.egg + .2, T.you + .2, 'pluck', .85)
place(sfx, swept(T.you - T.egg, 200, 900, 1.2, .07, shape=lambda u: .6 + .4 * np.sin(2 * np.pi * u * 3) ** 2), T.egg, pan=-.3)
place(sfx, pop(.8), S('p27') - .1)
place(sfx, rumble(.6, .5), S('p28') - .35)
place(sfx, pop(.8, 300, 800), S('p28') + .3)
place(sfx, plink(nf('E7'), .5), S('p28') + .15)
place(sfx, boing(.8, 260), S('p28') + .55)
place(sfx, flap(.5, 5), S('p28') + .6)
place(sfx, plop(1.0), CK('p28', 1) + .25)
place(sfx, pop(.6, 700, 1400), CK('p28', 1) + .9)
place(sfx, whoosh(.4, True, .1), S('p29') - .2)
place(sfx, thump(.6), CK('p29', 1) + .55)

# —— 换成你 ——
place(sfx, whoosh(.4, True, .1), T.you - .05)
ts = S('p30') + (EN('p30') - S('p30')) * .6
place(sfx, poof(1.0), ts - .05)
sparkle(ts, base=nf('A6'), n=5, step=.05, v=.7)
place(sfx, pop(1.0, 400, 1000), ts + .2)
groove(ts + .1, T.fix + .2, 'night', .9)
place(sfx, swept(.5, 400, 3000, .5, .1), CK('p31', 1) - .25)
place(sfx, pop(.6), S('p31') + .05)
place(sfx, pop(.8), CK('p31', 1) + .25)
for i in range(3):
    place(sfx, notif(.35), S('p32') + .05 + i * .4, pan=.2)
place(sfx, pop(.7), CK('p32', 1) - .05)
place(sfx, swept(.25, 1000, 4000, .5, .12), CK('p32', 1) + .35)
for a in (S('p33') + .15, S('p33') + .6, S('p33') + 1.05):
    place(sfx, thump(.55), a + .2)
place(sfx, swept(.6, 800, 4000, .6, .07), CK('p33', 1) - .05)

# —— 怎么办 ——
place(sfx, whoosh(.45, True, .1), T.fix - .05)
place(sfx, lp(blah(EN('p34') - .5 - (T.fix + .3), .5), 500), T.fix + .3, pan=-.4)
nope = EN('p34') - .45
place(sfx, thump(.6), nope + .2)
place(sfx, wrong(.35), nope + .2)
groove(S('p35') - .2, T.end + .1, 'hope', .8)
place(sfx, wrong(.6), S('p35') - .05)
chime_up(CK('p35', 0) + .7)
tapA, tapB = CK('p36', 1) + .45, CK('p36', 1) + 1.0
place(sfx, click(1.4), tapA)
place(sfx, click(1.4), tapB)
place(sfx, pop(.6, 700, 1300), tapB + .02)
place(sfx, plink(nf('C7'), .6), CK('p36', 1) + 1.2)
for a in (S('p38') + .15, S('p38') + .55, S('p38') + .95):
    place(sfx, rip(.6), a)
place(sfx, pop(.7), CK('p38', 1) - .05)
place(sfx, boing(.5, 400), CK('p38', 1) + .1)
tt, ph = glide(400, 1100, .5); place(sfx, np.sin(ph) * np.sin(np.pi * tt / .5) * .09, CK('p38', 2))
chime_up(CK('p38', 2) + .3, .5)

# —— 通知 ——
place(sfx, whoosh(.45, False, .1), T.end - .05)
place(music, pad([nf('F2'), nf('C3'), nf('A3')], T.order - T.end + .2, .55, att=.6, rel=.4, bright=.8), T.end)
for k in range(3):
    place(sfx, drip(.4), T.end + .4 + k * .7, pan=rng.uniform(-.6, .6))
place(sfx, notif(1.3), S('p40') - .1)
place(music, pad([nf('F3'), nf('A3'), nf('C4'), nf('E4')], T.order - S('p40') + .2, .5, att=.3, rel=.4, bright=1.3), S('p40'))
sparkle(S('p41') + .2, base=nf('F6'), n=5, step=.06, v=.7)
for k, n in enumerate(['F5', 'A5', 'C6', 'F6']):
    place(music, musicbox(nf(n), .6), S('p41') + .3 + k * .18)

# —— 三分糖 ——
place(sfx, bell(nf('E6'), .5, 1.2), T.order + .02, pan=.3)
groove(T.order + .1, T.card + .1, 'bright', .8)
place(sfx, pop(.8), S('c3') - .05)
place(sfx, pop(.35, 500, 1200), S('c3') + .9)
place(sfx, pop(.9, 600, 1400), S('k2') - .05)
place(sfx, swept(.5, 1500, 600, .5, .08), S('k2'))
place(sfx, click(.8), S('k2') + .5)

# —— 片尾 ——
stinger(T.card + .05, chord=('F2', 'C3', 'F3', 'A3', 'C4', 'F4'), v=.8)
sparkle(T.card + .15, base=nf('F6'), n=6, step=.06, v=.8)
place(sfx, pop(.8), T.card + .5)
place(sfx, pop(.7), T.card + 1.0)
for k, n in enumerate(['F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'F5']):
    place(music, marimba(nf(n), .5), T.card + .6 + k * .25, pan=-.2 + .07 * k)
place(music, pad([nf('F3'), nf('A3'), nf('C4'), nf('F4')], DUR - T.card, .6, att=.4, rel=1.5, bright=1.2), T.card + .2)


# ---------------- 配音 ----------------
def decode(path, chain=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', path]
    if chain:
        cmd += ['-af', chain]
    cmd += ['-f', 'f32le', '-ac', '1', '-ar', str(SR), '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32).astype(np.float64)


for l in TLD['lines']:
    chain = None
    if l['spk'] == 'C':   # 原始人：压低音调、不改时长，再加一点颗粒感
        chain = 'asetrate=44100*0.84,aresample=44100,atempo=1.1905'
    x = decode(os.path.join(HERE, l['file']), chain)
    x = hp(x, 75)
    if l['spk'] == 'C':
        x = np.tanh(x * 2.2) / 2.2 * 1.3
        x = lp(x, 5200)
    act = np.abs(x) > .02
    rms = np.sqrt(np.mean(x[act] ** 2)) if act.any() else 1
    target = {'N': .14, 'K': .13, 'C': .15}[l['spk']]
    x = x * (target / rms)
    pan = {'N': 0, 'K': .25, 'C': -.15}[l['spk']]
    place(voice, x, l['start'], 1.0, pan)


# ---------------- 闪避、混响、混音 ----------------
def duck_curve(v, depth, att=.04, rel=.35):
    m = np.abs(v[0]) + np.abs(v[1])
    hop = 441
    fr = np.sqrt(np.mean(m[:len(m) // hop * hop].reshape(-1, hop) ** 2, axis=1))
    on = (fr > .02).astype(float)
    g = np.ones_like(on)
    cur = 1.0
    a_c, r_c = np.exp(-hop / SR / att), np.exp(-hop / SR / rel)
    for i, o in enumerate(on):
        tgt = 1 - depth * o
        c = a_c if tgt < cur else r_c
        cur = tgt + (cur - tgt) * c
        g[i] = cur
    gs = np.interp(np.arange(N), np.arange(len(g)) * hop, g)
    return gs


def reverb_ir(length=1.8, seed=0, decay=.45):
    r = np.random.default_rng(seed)
    t = tvec(length)
    ir = r.standard_normal(len(t)) * np.exp(-t / decay)
    ir = lp(ir, 5000) * .9 + lp(ir, 1200) * .3
    ir[:int(.012 * SR)] = 0
    return ir / np.sqrt(np.sum(ir ** 2))


dm = duck_curve(voice, .7)
ds = duck_curve(voice, .5)
irL, irR = reverb_ir(seed=1), reverb_ir(seed=2)
mix = np.zeros((2, N))
for bus, wet, gain, duck in [(music, .22, .55, dm), (sfx, .12, .8, ds)]:
    b = bus * duck * gain
    m = b[0] + b[1]
    mix[0] += b[0] + fftconvolve(m, irL)[:N] * wet * .5
    mix[1] += b[1] + fftconvolve(m, irR)[:N] * wet * .5
vm = voice[0] + voice[1]
vr = fftconvolve(vm, reverb_ir(1.0, 3, .18))[:N] * .05
mix[0] += voice[0] + vr
mix[1] += voice[1] + vr
mix = hp(mix, 30)
tail = int(.5 * SR)
mix[:, -tail:] *= np.linspace(1, 0, tail) ** 1.5
peak = np.abs(mix).max()
mix = mix / peak * .97
mix = np.tanh(mix * 1.6) / np.tanh(1.6)
mix *= .9
out = sys.argv[1] if len(sys.argv) > 1 else 'audio.wav'
wavfile.write(out, SR, (mix.T * 32767).astype(np.int16))
print('wrote', out, f'{DUR:.2f}s', 'peak', float(np.abs(mix).max()))

if os.environ.get('STEMS'):  # 调试：导出分轨，检查人声与背景的比例
    for name, b, k in [('voice', voice, 1), ('music', music * dm, .55), ('sfx', sfx * ds, .8)]:
        wavfile.write(out.replace('.wav', f'_{name}.wav'), SR, (np.clip(b.T * k / peak * .97, -1, 1) * 32767).astype(np.int16))
