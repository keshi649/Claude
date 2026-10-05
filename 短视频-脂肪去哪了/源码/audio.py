"""《你减掉的脂肪，去哪了？》声音：配音 + 配乐 + 音效，全部按 timeline.json 对齐。
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
rng = np.random.default_rng(23)


def S(i): return LN[i]['v0']
def EN(i): return LN[i]['v1']
def CK(i, k): return LN[i]['chunks'][k][0]
def MK(i, k=0): return LN[i]['marks'][k]


# ---------------- 关键时刻（与 scenes1.js 的 T 完全一致） ----------------
class T:
    q = S('h3') - .45
    surv = S('h6') - .3
    phys = S('h7') - .25
    ans = S('h8') - .5
    breath = MK('h8')
    split = S('h9') - .15
    water = S('h10') - .1
    lung = S('h11') - .2
    eq = EN('h11') + .35
    map = S('h12') - .35
    doors = CK('h13', 1)
    title = EN('h14') + .25
    xy = S('y1') - .3
    g1 = S('a1') - 1.25
    cells = S('a6') - .2
    flow = S('a12') - .5
    g2 = S('b1') - 1.25
    lept = S('b7') - .3
    brain = S('b9') - .3
    light = S('b11') - .4
    human = S('b14') - .35
    g3 = S('c1') - 1.25
    twins = S('d1') - .5
    how = S('e1') - .5
    fin = S('f1') - .6
    endcard = EN('f5') + .5


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




# ---------------- 新增的音效 ----------------
def tick(v=1.0, f=1400):
    t = tvec(.06)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t / .006) + .6 * hp(noise(.06), 3500) * np.exp(-t / .002)) * v * .12


def geiger(d, rate=14.0, v=1.0):
    out = np.zeros(int(d * SR))
    for _ in range(rng.poisson(rate * d)):
        i = int(rng.uniform(0, max(.01, d - .014)) * SR)
        x = bp(noise(.014), 2500, 7500) * np.exp(-tvec(.014) / .002) * rng.uniform(.4, 1)
        out[i:i + len(x)] += x
    return out * v * .55


def stamp_hit(v=1.0, f=70):
    t = tvec(.45)
    low = np.sin(2 * np.pi * (f + 60 * np.exp(-t / .02)) * t) * np.exp(-t / .1)
    snap = hp(noise(.45), 1800) * np.exp(-t / .012)
    return (low * .8 + snap * .5) * v * .5


def riser(d, v=1.0):
    n = int(d * SR); t = tvec(d); u = t / d
    x = swept(d, 300, 7500, .7, 1.0, shape=lambda uu: uu ** 2.2)
    _, ph = glide(180, 1700, d, 1.6)
    return (x * .6 + np.sin(ph) * u ** 2.5 * .25) * v * .22


def drumroll(d, v=1.0):
    out = np.zeros(int(d * SR)); tt = 0.0
    while tt < d - .03:
        u = tt / d; x = bp(noise(.09), 1200, 7000) * np.exp(-tvec(.09) / .028) * (.25 + .75 * u)
        i = int(tt * SR); out[i:i + len(x)] += x[:len(out) - i]
        tt += .17 - .12 * u
    return out * v * .35


def heartbeat(v=1.0):
    t = tvec(.5)
    return (np.sin(2 * np.pi * 58 * t) * np.exp(-t / .07) * np.minimum(1, t / .004) + .7 * np.where(t > .2, np.sin(2 * np.pi * 52 * (t - .2)) * np.exp(-(t - .2) / .07), 0)) * v * .5


def zap(v=1.0):
    tt, ph = glide(2200, 5200, .07, .5)
    return (np.sin(ph) * np.exp(-tt / .02) + .4 * hp(noise(.07), 4000) * np.exp(-tt / .004)) * v * .09


def switch_click(v=1.0):
    out = np.zeros(int(.2 * SR)); out[:int(.05 * SR)] += click(v)[:int(.05 * SR)]
    j = int(.07 * SR); out[j:j + int(.05 * SR)] += click(v * .6)[:int(.05 * SR)]
    t = tvec(.2); out += np.sin(2 * np.pi * 120 * t) * np.exp(-t / .03) * v * .12
    return out


def crunch(v=1.0):
    t = tvec(.05)
    return bp(noise(.05), 800, 3800) * np.exp(-t / .012) * np.minimum(1, t / .002) * v * .3


def breath_out(d=1.4, v=1.0):
    t = tvec(d); u = t / d
    return bp(noise(d), 400, 2600) * np.sin(np.pi * u) ** 1.6 * v * .2


def bubble_pop(v=1.0, f0=700, f1=1900):
    tt, ph = glide(f0, f1, .05, .5)
    return np.sin(ph) * np.exp(-tt / .018) * np.minimum(1, tt / .002) * v * .12


def door_thud(v=1.0):
    t = tvec(.7)
    out = lp(noise(.7), 420) * np.exp(-t / .16) * v * .35
    th = thump(v * .9)
    out[:len(th)] += th
    return out


def scrub(d, v=1.0):
    t = tvec(d)
    return bp(noise(d), 1200, 6500) * (.35 + .65 * np.abs(np.sin(2 * np.pi * 7.5 * t))) * np.minimum(1, t / .05) * np.clip((d - t) / .05, 0, 1) * v * .22


def whirr(d, v=1.0):
    t = tvec(d)
    f = 340 + 120 * np.sin(2 * np.pi * 2.2 * t) + 160 * t / d
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = lp(sum(np.sin(h * ph) / h for h in range(1, 9)), 1500) * (.6 + .4 * np.sin(2 * np.pi * 14 * t))
    return x * np.minimum(1, t / .1) * np.clip((d - t) / .15, 0, 1) * v * .1


def paper(v=1.0):
    t = tvec(.22)
    return hp(noise(.22), 1800) * np.sin(np.pi * t / .22) ** 2 * v * .16


def hum(d, f=140, v=1.0, rise=0.0):
    t = tvec(d); fr = f * (1 + rise * t / d)
    ph = 2 * np.pi * np.cumsum(fr) / SR
    x = np.sin(ph) + .4 * np.sin(2 * ph) + .2 * np.sin(3 * ph)
    return x * np.minimum(1, t / .15) * np.clip((d - t) / .2, 0, 1) * v * .08


def airleak(d, v=1.0):
    t = tvec(d)
    return hp(noise(d), 2500) * np.exp(-t / (d * .45)) * np.minimum(1, t / .02) * v * .18


def flow_noise(d, v=1.0):
    t = tvec(d)
    return lp(noise(d), 1400) * (.6 + .4 * np.sin(2 * np.pi * 1.7 * t + 2 * np.sin(2 * np.pi * .4 * t))) * np.minimum(1, t / .4) * np.clip((d - t) / .4, 0, 1) * v * .1


def sad_slide(v=1.0):
    tt, ph = glide(420, 150, .9, .8)
    return np.sin(ph + .4 * np.sin(2 * np.pi * 5 * tt)) * np.exp(-tt / .6) * v * .16


def clang(v=1.0):
    t = tvec(1.2)
    out = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / tau) for f, a, tau in [(310, 1, .5), (780, .6, .3), (1330, .4, .18), (2090, .25, .1)])
    return (out + .8 * hp(noise(1.2), 2500) * np.exp(-t / .01)) * v * .22


def sweep_up(d, v=.15, f0=300, f1=4000): return swept(d, f0, f1, .5, v)
def sweep_dn(d, v=.15, f0=4000, f1=300): return swept(d, f0, f1, .5, v)


# ---------------- 律动（配乐） ----------------
CH = {
    'C': ['C', 'E', 'G'], 'Am': ['A', 'C', 'E'], 'F': ['F', 'A', 'C'], 'G': ['G', 'B', 'D'], 'Dm': ['D', 'F', 'A'],
    'Bb': ['Bb', 'D', 'F'], 'Em': ['E', 'G', 'B'], 'D': ['D', 'F#', 'A'], 'Cm': ['C', 'Eb', 'G'], 'Gm': ['G', 'Bb', 'D'],
}


def note(n, o): return nf(f'{n}{o}')


def env_window(t, a, b, fi=.3, fo=.5):
    return float(np.clip((t - a) / fi, 0, 1) * np.clip((b - t) / fo, 0, 1))


def groove(a, b, style, gain=1.0, bpm=104):
    """从 a 到 b 铺一段配乐。每拍调用一次，w 是淡入淡出的权重。"""
    BEAT = 60 / bpm
    nb = int((b - a) / BEAT)
    for k in range(nb):
        tb = a + k * BEAT
        w = env_window(tb + BEAT / 2, a, b, .6, 1.2) * gain   # 取拍中点，第一拍不至于被淡成静音
        if w <= 0:
            continue
        bar, bi = divmod(k, 4)
        if style == 'quiz':
            ch = CH[['C', 'Am', 'F', 'G'][bar % 4]]
            if bi in (0, 2):
                place(music, bass(note(ch[0], 2), .7 * w), tb)
                place(music, kick(.32 * w), tb)
            if bi in (1, 3):
                place(music, click(.45 * w), tb, pan=.2)
            for h in range(2):
                place(music, shaker(.35 * w), tb + h * BEAT / 2 + BEAT / 4, pan=.35)
                n = [ch[0], ch[1], ch[2], ch[1]][(bi * 2 + h) % 4]
                place(music, marimba(note(n, 5), .5 * w), tb + h * BEAT / 2, pan=-.25)
        elif style == 'wonder':
            ch = CH[['C', 'G', 'Am', 'F'][bar % 4]]
            if bi == 0:
                place(music, pad([note(x, 3) for x in ch] + [note(ch[0], 2)], BEAT * 4 + .4, .55 * w, att=.5, rel=.9, bright=1.3), tb)
                place(music, bass(note(ch[0], 2), .5 * w, 1.0), tb)
            for h in range(2):
                n = [ch[2], ch[1], ch[0], ch[1]][(bi + h) % 4]
                place(music, bell(note(n, 6), .35 * w, 1.6), tb + h * BEAT / 2, pan=.3 * (1 if h else -1))
        elif style == 'mystery':
            ch = CH[['Am', 'F', 'Dm', 'G'][bar % 4]]
            if bi == 0:
                place(music, pad([note(x, 3) for x in ch], BEAT * 4 + .3, .5 * w, att=.5, rel=.8, bright=.9), tb)
                place(music, heartbeat(.55 * w), tb)
            if bi in (1, 3):
                place(music, pluck(note(ch[1], 4), .4 * w, .5, .6), tb + BEAT / 2, pan=-.2)
            if bi == 2:
                place(music, pluck(note(ch[2], 4), .35 * w, .5, .6), tb, pan=.2)
        elif style == 'drone':
            if k % 8 == 0:
                place(music, pad([nf('A1'), nf('E2'), nf('A2'), nf('C3')], BEAT * 8 + .6, .55 * w, att=1.2, rel=1.6, bright=.6), tb)
            if bi == 0:
                place(music, heartbeat(.35 * w), tb)
            if bi == 2 and bar % 2 == 1:
                place(music, pluck(note(['A', 'C', 'E', 'G'][bar % 4], 3), .35 * w, .8, .5), tb, pan=-.3)
        elif style == 'curious':
            ch = CH[['Dm', 'Bb', 'F', 'C'][bar % 4]]
            if bi == 0:
                place(music, pad([note(x, 3) for x in ch], BEAT * 4 + .3, .5 * w, att=.4, rel=.8, bright=1.0), tb)
                place(music, bass(note(ch[0], 2), .5 * w, .8), tb)
            for h in range(2):
                if (bi * 2 + h) % 3 != 2:
                    n = [ch[0], ch[2], ch[1], ch[2]][(bi * 2 + h) % 4]
                    place(music, musicbox(note(n, 5), .5 * w), tb + h * BEAT / 2, pan=-.25 + .5 * h)
            if bi in (1, 3):
                place(music, click(.25 * w), tb)
        elif style == 'flow':
            ch = CH[['C', 'G', 'Am', 'F'][bar % 4]]
            for h in range(2):
                n = [ch[0], ch[1], ch[2], ch[1], ch[2], ch[1]][(bi * 2 + h) % 6]
                place(music, pluck(note(n, 4 if (bi + h) % 2 else 5), .45 * w, .6), tb + h * BEAT / 2, pan=-.3 + .6 * h)
            if bi == 0:
                place(music, pad([note(x, 3) for x in ch], BEAT * 4 + .3, .45 * w, att=.5, rel=.8), tb)
                place(music, bass(note(ch[0], 2), .5 * w, .9), tb)
            if bi == 2:
                place(music, bell(note(ch[2], 6), .3 * w, 1.4), tb, pan=.3)
        elif style == 'lab':
            ch = CH[['Dm', 'Am', 'Bb', 'F'][bar % 4]]
            place(music, bass(note(ch[0], 2), .4 * w, .22), tb)
            place(music, bass(note(ch[0], 2) * 1.5, .25 * w, .15), tb + BEAT / 2)
            place(music, hat(.2 * w), tb + BEAT / 2, pan=.35)
            if bi == 0:
                for n in ch:
                    place(music, epiano(note(n, 4), .4 * w, BEAT * 3), tb + rng.uniform(0, .02), pan=-.15)
            if bi in (1, 3):
                place(music, click(.25 * w), tb)
        elif style == 'shimmer':
            if bi == 0:
                ch = CH[['Am', 'F', 'C', 'G'][bar % 4]]
                place(music, pad([note(x, 3) for x in ch], BEAT * 4 + .4, .5 * w, att=.7, rel=1.0, bright=1.3), tb)
                place(music, bass(note(ch[0], 2), .45 * w, 1.0), tb)
            if bi in (1, 3):
                n = ['E6', 'G6', 'A6', 'C7', 'D7'][int(rng.integers(0, 5))]
                place(music, bell(nf(n), .3 * w, 1.6), tb + rng.uniform(0, .2), pan=rng.uniform(-.5, .5))
        elif style == 'tense':
            ch = CH[['Dm', 'Bb', 'Gm', 'Am'][bar % 4]]
            if bi == 0:
                place(music, pad([note(x, 3) for x in ch] + [note(ch[0], 2)], BEAT * 4 + .3, .5 * w, att=.5, rel=.8, bright=.8), tb)
            if bi in (0, 2):
                place(music, bass(note(ch[0], 2), .55 * w, .5), tb)
            place(music, hat(.12 * w), tb, pan=.3)
        elif style == 'mystic':
            ch = CH[['Em', 'C', 'G', 'D'][bar % 4]]
            if bi == 0:
                place(music, pad([note(x, 3) for x in ch], BEAT * 4 + .4, .5 * w, att=.7, rel=1.0, bright=.9), tb)
                place(music, bass(note(ch[0], 2), .45 * w, 1.0), tb)
            for h in range(2):
                n = [ch[0], ch[2], ch[1], ch[2]][(bi * 2 + h) % 4]
                place(music, musicbox(note(n, 5 if (bi + h) % 2 else 6), .45 * w), tb + h * BEAT / 2, pan=-.3 + .6 * h)
        elif style == 'play':
            ch = CH[['G', 'D', 'Em', 'C'][bar % 4]]
            if bi in (0, 2):
                place(music, bass(note(ch[0], 2), .65 * w), tb)
                place(music, kick(.3 * w), tb)
            if bi in (1, 3):
                place(music, clap(.3 * w), tb, pan=.1)
            for h in range(2):
                n = [ch[0], ch[2], ch[1], ch[2]][(bi * 2 + h) % 4]
                place(music, pluck(note(n, 4), .5 * w, .5), tb + h * BEAT / 2, pan=-.3 + .6 * h)
                place(music, shaker(.3 * w), tb + h * BEAT / 2 + BEAT / 4, pan=.35)
        elif style in ('hope', 'warm'):
            ch = CH[['F', 'C', 'Dm', 'Bb'][bar % 4]]
            if style == 'hope':
                if bi in (0, 2):
                    place(music, kick(.55 * w), tb)
                    place(music, bass(note(ch[0], 2), .75 * w), tb)
                if bi in (1, 3):
                    place(music, clap(.38 * w), tb, pan=.1)
                for h in range(2):
                    place(music, hat(.3 * w if h else .18 * w), tb + h * BEAT / 2, pan=.35)
            else:
                if bi == 0:
                    place(music, bass(note(ch[0], 2), .5 * w, 1.1), tb)
            arp = [ch[0], ch[1], ch[2], ch[1]]
            for h in range(2):
                n = arp[(bi * 2 + h) % 4]
                place(music, marimba(note(n, 5 if n in ('C', 'D', 'E', 'F') else 4), .5 * w), tb + h * BEAT / 2, pan=-.25)
            if bi == 0:
                place(music, pad([note(x, 3) for x in ch], BEAT * 4 + .3, .5 * w, att=.4, rel=.8, bright=1.0), tb)


def stinger(t0, chord=('C3', 'G3', 'C4', 'E4', 'G4'), v=1.0, soft=False):
    if not soft:
        place(music, kick(.9 * v), t0)
        place(music, crash(.6 * v), t0)
    for n in chord:
        place(music, brass(nf(n), .4, .45 * v), t0)
    place(music, pad([nf(n) for n in chord], 1.8, .8 * v, att=.02, rel=1.4, bright=1.5), t0)


# ================= 编排 =================
# —— 开场：测验 ——
for k in range(int((3.0 - .75) * 14)):
    place(sfx, tick(.3, 1100 + 40 * (k % 3)), .75 + k / 14, pan=-.3)
place(sfx, plink(nf('A6'), 1.0), 3.0, pan=-.2); place(sfx, pop(.7, 500, 1100), 3.0)
for k in range(10):
    place(sfx, thump(.3 + .12 * (k % 3 == 0)), 1.0 + k * .17 + .18, pan=.3)
place(sfx, sweep_up(.45, .14), S('h2') - .12); place(sfx, pop(.9), S('h2') + .02)
place(music, marimba(nf('C5'), .5), S('h2') + .05); place(music, marimba(nf('G5'), .5), S('h2') + .2)
groove(.6, T.ans - .35, 'quiz', .85, 108)
for i in range(4):
    place(sfx, pop(.7, 480 + 70 * i, 1100 + 60 * i), CK('h3', i) - .05, pan=-.6 + .4 * i)
for i, off in enumerate([.18, .62, 1.0]):
    place(sfx, stamp_hit(.8 - .1 * i), S('h4') + off + .1, pan=-.4 + .4 * i)
place(sfx, stamp_hit(.55, 95), S('h5') + 1.0, pan=.5); place(sfx, boing(.5, 260), S('h5') + 1.05)
place(sfx, sweep_up(.9, .1, 500, 2600), S('h6') + .1)
for i in range(0, 150, 6):
    place(sfx, tick(.14, 1700), S('h6') + .05 + i * .006, pan=-.5 + (i % 30) / 30)
place(sfx, sweep_up(1.0, .12, 600, 3000), CK('h6', 1) + .15); place(sfx, plink(nf('E6'), .8), CK('h6', 2) - .1)
place(sfx, swept(1.0, 900, 300, .5, .09), S('h7') + .1)
place(sfx, stamp_hit(.7, 85), CK('h7', 1) + .1); place(sfx, plink(nf('G5'), .7), CK('h7', 1) + .12)
# 揭晓
place(sfx, riser(T.breath - (T.ans - .2), 1.0), T.ans - .2)
place(sfx, drumroll(T.breath - (T.ans - .2), .9), T.ans - .2)
place(music, kick(1.0), T.breath); place(music, crash(.7, 2.2), T.breath)
for n in ('C3', 'G3', 'C4', 'E4', 'G4'):
    place(music, brass(nf(n), .3, .4), T.breath)
place(sfx, thump(.6), T.breath); place(sfx, swept(1.4, 5000, 800, .6, .14, shape=lambda u: np.exp(-u * 3) * np.minimum(1, u * 30)), T.breath)
sparkle(T.breath + .05, base=nf('C7'), n=6, step=.05, v=.8)
place(sfx, swept(2.0, 250, 3200, .6, .12, shape=lambda u: np.sin(np.pi * u) ** 1.2), T.breath + .1)
groove(T.breath + .4, T.eq - .1, 'wonder', .9, 72)
for k in range(int((T.eq - T.breath - .3) * 8)):
    place(sfx, bubble_pop(.35, 600 + 120 * (k % 5), 1500 + 160 * (k % 4)), T.breath + .4 + k / 8 + rng.uniform(0, .08), pan=rng.uniform(.1, .8))
tb_ = T.breath + .3
while tb_ < T.eq - .5:
    place(sfx, breath_out(1.5, .8), tb_, pan=.5); tb_ += 2.4
place(sfx, sweep_up(.7, .1, 500, 2600), T.split); place(sfx, plink(nf('A6'), .8), CK('h9', 1)); sparkle(CK('h9', 2) + .1, base=nf('E6'), n=4, step=.06, v=.6)
place(sfx, drip(.9), T.water + .1); place(sfx, drip(.7), T.water + .35)
place(sfx, pop(.8), T.lung + .12); chime_up(T.lung + .12, .8)
# 质量守恒
groove(T.eq, T.map + .3, 'wonder', .6, 72)
for dt in (.1 + .6, .1 + .83 + .0, .1 + 0.0, .1 + .23):
    place(sfx, thump(.35), T.eq + dt + .15, pan=-.3 + .6 * (dt > .5))
place(sfx, sweep_up(.5, .1), T.eq + .1); place(sfx, plink(nf('C6'), .8), T.eq + 1.9); place(sfx, bell(nf('G6'), .5, 1.2), T.eq + 1.95)

# —— 路线图 ——
groove(T.map + .2, T.title - .1, 'mystery', .9, 84)
place(sfx, whoosh(.5, True, .12), T.map)
for i in range(28):
    place(sfx, bubble_pop(.25, 500, 1200), CK('h12', 2) + i * .015, pan=-.7 + i * .025)
for i in range(3):
    place(sfx, door_thud(.9), T.doors + i * .32 - .05 + .2, pan=-.4 + .4 * i)
    place(sfx, hp(noise(.35), 1500) * np.exp(-tvec(.35) / .1) * .06, T.doors + i * .32 + .2)
for i, n in enumerate(['E5', 'G5', 'B5']):
    place(sfx, plink(nf(n), .8), S('h14') + .3 + i * .6, pan=-.4 + .4 * i)
place(sfx, riser(.85, .8), T.title - .8)
stinger(T.title + .1, chord=('A2', 'E3', 'A3', 'C4', 'E4'), v=.9)
sparkle(T.title + .15, base=nf('A6'), n=6, step=.07, v=.7)
groove(S('y1') - .1, T.g1, 'quiz', .7, 112)
for lid in ('y1', 'y2', 'y3'):
    place(sfx, pop(.8, 500, 1300), S(lid) - .02, pan=-.3)
place(sfx, boing(.6, 340), S('y3') + .25)


# —— 关卡转场声（三次） ——
def gate_card(t0):
    place(sfx, swept(.4, 150, 800, .6, .2, shape=lambda u: np.sin(np.pi * u) ** .7), t0)
    place(sfx, door_thud(1.0), t0 + .3); place(sfx, door_thud(.7), t0 + .36, pan=.2)
    stinger(t0 + .45, chord=('D3', 'A3', 'D4', 'F4', 'A4'), v=.55, soft=True)
    sparkle(t0 + .5, base=nf('D6'), n=5, step=.07, v=.6)
    place(sfx, whoosh(.8, True, .16), t0 + 1.3)
    place(sfx, hp(noise(.7), 600) * np.sin(np.pi * tvec(.7) / .7) * .05, t0 + 1.35)


# —— 第一关：冷战的日期戳 ——
gate_card(T.g1)
tTest0 = S('a1') + 1.55; tChart = S('a3') - .4; tPath = S('a4') - .45; tDecl = S('a5') - .35
groove(T.g1 + .5, tPath + .7, 'drone', .8, 72)
place(sfx, hum(tChart - (T.g1 + .4) + .5, 60, .5), T.g1 + .4)
for k in range(5):
    place(sfx, tick(.7, 900), T.g1 + .4 + k * (tTest0 - (T.g1 + .4)) / 5)
td = (tChart - .1 - tTest0) / 4
for i in range(4):
    t0_ = tTest0 + i * td + .12 * td
    place(sfx, thunder(.55 - .06 * i), t0_ + .02, pan=-.3 + .2 * i)
    place(sfx, crash(.25, 1.4), t0_ + .02)
    place(sfx, geiger(td * .9, 10 + 14 * i, .7), t0_ + .1)
place(sfx, flow_noise(tChart - tTest0, .6), tTest0)
place(sfx, geiger(tTest0 - (T.g1 + .4), 5, .5), T.g1 + .4)
# 曲线与碳的旅程
place(sfx, whoosh(.6, True, .14), tChart)
tt_ = tvec(1.9); place(sfx, np.sin(2 * np.pi * np.cumsum(260 + 700 * (tt_ / 1.9) ** 1.5) / SR) * .06 * np.minimum(1, tt_ / .1) * np.clip((1.9 - tt_) / .1, 0, 1), tChart + .45)
place(sfx, plink(nf('A6'), .9), S('a3') + 2.1); place(sfx, stamp_hit(.5), S('a3') + 2.12)
groove(tPath, T.flow + .8, 'curious', .85, 96)   # 第一关中段一条到底（读出生日期、拆迁球、细胞更替）
place(sfx, whoosh(.5, True, .12), tPath)
for tt, n in ((tPath + .2, 'C6'), (CK('a4', 0) + .1, 'E6'), (CK('a4', 0) + 1.55, 'G6'), (CK('a4', 1) - .1, 'C7')):
    place(sfx, plink(nf(n), .8), tt, pan=.3); place(sfx, pop(.5), tt)
sparkle(CK('a4', 2) - .1, base=nf('E7'), n=5, step=.07, v=.6)
place(sfx, whoosh(.5, True, .12), tDecl)
tt_ = tvec(4.0); place(sfx, np.sin(2 * np.pi * np.cumsum(900 - 560 * (tt_ / 4.0) ** .8) / SR) * .05 * np.minimum(1, tt_ / .1) * np.clip((4.0 - tt_) / .3, 0, 1), tDecl + .2)
place(sfx, pop(.8), CK('a5', 1) - .05); place(sfx, stamp_hit(.9, 75), CK('a5', 2) + .17); place(sfx, bell(nf('E6'), .5, 1.2), CK('a5', 2) + .2)
# 读出生日期、显微镜、拆迁球
for k in range(6):
    place(sfx, beep(1500 + 150 * k, .06, .8), CK('a6', 1) + .2 + k * .15, pan=.4)
place(sfx, sweep_up(.8, .1, 400, 2400), CK('a6', 2) + .1)
place(sfx, swept(.6, 2000, 600, .5, .08), CK('a6', 2) + .9); place(sfx, bell(nf('A6'), .6, 1.2), CK('a6', 2) + 1.5)
place(sfx, whoosh(.5, True, .12), S('a7') - .35); place(sfx, pop(.8), S('a7') + .15)
tTitle = S('a8') - .45; hit = S('a8') + .85
place(sfx, swept(.9, 400, 1800, .6, .1, shape=lambda u: np.sin(np.pi * u) ** 1.5), tTitle + .3)
place(sfx, clang(1.0), hit); place(sfx, thump(.8), hit); place(sfx, stamp_hit(.8), hit + .45)
for i in range(16):
    place(sfx, pop(.35, 500 + 40 * (i % 6), 1100 + 60 * (i % 6)), CK('a9', 0) + i * .03, pan=-.7 + i * .02)
for i in range(25):
    place(sfx, pop(.35, 450 + 30 * (i % 7), 1000 + 50 * (i % 7)), CK('a9', 1) + i * .03, pan=.0 + i * .02)
place(sfx, airleak(1.6, .8), CK('a9', 2) - .1); place(sfx, plink(nf('E6'), .8), CK('a9', 2) + .6)
place(sfx, airleak(2.6, .9), CK('a10', 0) + .3); place(sfx, pop(.8), CK('a10', 1)); place(sfx, bell(nf('A5'), .6, 1.2), CK('a10', 2) + .1)
place(sfx, pop(.9, 400, 900), S('y4') - .02, pan=-.3); place(sfx, boing(.5, 420), S('y4') + .2)
tr0 = CK('a11', 0) + .2; tr1 = CK('a11', 1) + .4
for k in range(3):
    ts = tr0 + (tr1 - tr0) * (k + .75) / 3
    place(sfx, poof(.6), ts); sparkle(ts, base=nf('G6'), n=3, step=.05, v=.55)
place(sfx, plink(nf('C7'), .8), CK('a11', 1) + .1); place(sfx, pop(.8), CK('a11', 1) + .1)
# 油在流动
groove(T.flow, T.g2 - .3, 'flow', .85, 100)
place(sfx, whoosh(.6, True, .14), T.flow); place(sfx, pop(.8), S('a12') + .05); place(sfx, pop(.6), S('a12') + .3)
place(sfx, flow_noise(S('a15') - S('a13') + 1.5, .8), S('a13') - .3)
for i in range(6):
    place(sfx, marimba(nf(['C5', 'D5', 'E5', 'G5', 'A5', 'C6'][i]), .6), CK('a13', 1) + .2 + i * .42, pan=-.5 + .2 * i)
place(sfx, pop(.7), CK('a13', 2) + .1); place(sfx, bell(nf('G6'), .5, 1.2), CK('a13', 2) + .12)
place(sfx, pop(.7), CK('a14', 0) + .3); place(sfx, pop(.7), CK('a14', 1) + .2)
place(sfx, flow_noise(6.0, .9), S('a15') - .2); place(sfx, pop(.6, 380, 800), S('a15') - .3, pan=-.5)
place(sfx, pop(.7), CK('a15', 1) + .1); place(sfx, wrong(.6), CK('a15', 1) + .15)
place(sfx, pop(.8, 400, 900), S('y5') - .02, pan=-.3)

# —— 第二关：会说话的脂肪 ——
gate_card(T.g2)
groove(T.g2 + .5, T.lept - .1, 'lab', .85, 100)
place(sfx, siren(S('b2') + .3 - (T.g2 + .4), .9), T.g2 + .4)
for i in range(3):
    place(sfx, pop(.7, 450 + 60 * i, 1000), S('b2') - .2 + i * .22, pan=-.5 + .5 * i)
tB3 = S('b3') - .4; tB5 = S('b5') - .5; tB6 = S('b6') - .3
for k in range(int((tB3 + .4 - S('b2')) * 7)):
    place(sfx, crunch(.7), S('b2') + k / 7 + rng.uniform(0, .05), pan=rng.uniform(-.6, .6))
place(sfx, flow_noise(2.5, .9), tB3 + .3); place(sfx, pop(.8), tB3 + .25)
for k in range(int((tB5 - S('b4')) * 4)):
    place(sfx, crunch(.5 - .3 * k / max(1, int((tB5 - S('b4')) * 4))), S('b4') + k / 4, pan=-.3)
place(sfx, plink(nf('E6'), .7), S('b4') + .4); place(sfx, bell(nf('G6'), .4, 1.2), S('b4') + .45)
place(sfx, sad_slide(.9), CK('b5', 2) + .2); place(sfx, wrong(.6), CK('b5', 2) + .1)
place(sfx, pop(.9), tB6 + .2); chime_up(tB6 + .25, .7)
for i in range(7):
    place(sfx, plink(nf(['C6', 'E6', 'G6', 'B6'][i % 4]), .5), tB6 + .5 + i * .3, pan=-.4 + .15 * i)
# 瘦素
groove(T.lept, T.light - .2, 'shimmer', .85, 92)
place(sfx, whoosh(.6, True, .14), T.lept + .2); place(sfx, pop(.8), CK('b7', 0) + .1); place(sfx, bell(nf('E6'), .6, 1.4), CK('b7', 0) + .12)
tFew = S('b8') - .15
for k in range(int((tFew - T.lept) * 3)):
    place(sfx, plink(nf(['E6', 'G6', 'A6', 'C7'][k % 4]), .35), T.lept + .6 + k / 3 + rng.uniform(0, .1), pan=rng.uniform(-.3, .6))
tt_ = tvec(1.5); place(sfx, np.sin(2 * np.pi * np.cumsum(200 + 500 * tt_ / 1.5) / SR) * .06 * np.minimum(1, tt_ / .1) * np.clip((1.5 - tt_) / .1, 0, 1), CK('b7', 1) - .2)
place(sfx, pop(.8), CK('b7', 2)); chime_up(CK('b7', 2) + .05, .7)
tt_ = tvec(1.1); place(sfx, np.sin(2 * np.pi * np.cumsum(520 - 330 * tt_ / 1.1) / SR) * .06 * np.minimum(1, tt_ / .1) * np.clip((1.1 - tt_) / .1, 0, 1), tFew + .2)
place(sfx, beep(900, .12, 1.0), tFew + .65, pan=.4); place(sfx, beep(900, .12, 1.0), tFew + .85, pan=.4)
tBrain = S('b9') - .35; tInhib = S('b10') - .1; tRel = CK('b10', 1) - .05
place(sfx, sweep_up(.9, .12, 300, 2400), CK('b9', 1) - .3); place(sfx, pop(.8), CK('b9', 1) + .3)
for i in range(6):
    place(sfx, pop(.45, 500 + 70 * i, 1200), CK('b9', 1) + .15 + i * .09, pan=-.5 + .2 * i)
for i in range(12):
    place(sfx, tick(.3, 2100), tInhib - .1 + i * .06, pan=-.5 + .09 * i)
place(sfx, stamp_hit(.5, 120), tInhib + .6)
for i in range(7):
    place(sfx, zap(.9), tRel + i * .08, pan=-.6 + .2 * i)
place(sfx, siren(1.6, .8), tRel + .25); place(sfx, swept(.8, 300, 3000, .5, .15), tRel)
# 光控开关
groove(T.light, T.human - .2, 'lab', .8, 104)
tOn = CK('b12', 1) - .35; tOff = CK('b13', 1) - .1
place(sfx, pop(.8), S('b11') + .6); place(sfx, sweep_up(.5, .1), S('b11') + 1.7); place(sfx, pop(.8), S('b11') + 1.9)
place(sfx, pop(.7), S('b11') + 1.2)
place(sfx, switch_click(1.0), tOn); place(sfx, hum(tOff - tOn, 150, .9, 0.4), tOn)
for k in range(int((tOff - tOn) * 11)):
    place(sfx, zap(.6), tOn + .1 + k / 11 + rng.uniform(0, .03), pan=rng.uniform(.3, .8))
for k in range(int((tOff - tOn - .5) * 9)):
    place(sfx, crunch(.8), tOn + .4 + k / 9 + rng.uniform(0, .04), pan=-.5)
place(sfx, sweep_up(.8, .1, 400, 2000), tOn - .1)
place(sfx, switch_click(1.0), tOff); place(sfx, swept(.6, 1500, 150, .5, .1), tOff + .02)
tCh = CK('b12', 2) - .1
for i in range(2):
    place(sfx, marimba(nf(['E5', 'A5'][i]), .6), tCh + .35 + i * .25 + .4, pan=-.3 + .6 * i)
place(sfx, pop(.8), S('b13') + .1)
# 减重后的激素
groove(T.human, S('b16') - .1, 'tense', .85, 88)
for i in range(0, 50, 3):
    place(sfx, tick(.12, 1600), S('b14') + .25 + i * .008, pan=-.6 + i * .01)
place(sfx, pop(.8), CK('b14', 2) - .2); place(sfx, pop(.8), CK('b14', 2) - .3)
for r in range(3):
    place(sfx, pop(.7, 500, 1100), CK('b14', 3) + r * .32, pan=.2)
    place(sfx, plink(nf(['E6', 'G6', 'B6'][r]), .5), CK('b14', 3) + r * .32 + .15, pan=.3)
for r in range(3):
    place(sfx, pop(.6), S('b15') + .1 + r * .12, pan=.4)
place(sfx, stamp_hit(.7, 90), S('b15') + .5)
place(sfx, siren(1.0, .6), S('y6') - .1); place(sfx, door_thud(.5), S('y6') + .5); place(sfx, pop(.8, 400, 900), S('y6') - .02, pan=-.3)
tConc = S('b16') - .15
place(sfx, swept(.5, 300, 2500, .5, .1), S('b16') + .1)
place(sfx, swept(.5, 3500, 600, .5, .16), S('b16') + .5); place(sfx, stamp_hit(.7, 80), S('b16') + .55)
groove(S('b16') + .1, T.g3, 'warm', .6, 76)
place(sfx, pop(.8), CK('b16', 1) + .1); chime_up(CK('b16', 1) + .15, .8)

# —— 第三关：脂肪的记忆 ——
gate_card(T.g3)
tHum = S('c3') - .3; tGene = S('c4') - .3; tEpi = S('c5') - .3; tMouse = S('c6') - .3; tYo = S('c7') - .3; tCau = S('c8') - .2
groove(T.g3 + .5, T.twins - .2, 'mystic', .9, 70)
place(sfx, paper(.9), S('c1') + .3); place(sfx, stamp_hit(.55, 95), S('c1') + 1.12, pan=.3); place(sfx, plink(nf('E6'), .6), S('c1') + 1.14); place(sfx, pop(.8), CK('c2', 0) + .5); place(sfx, pop(.8), CK('c2', 1) + .1); place(sfx, bell(nf('B5'), .5, 1.2), CK('c2', 1) + .12)
place(sfx, pop(.8), CK('c3', 0)); place(sfx, whoosh(.5, True, .1), CK('c3', 1) + .1); place(sfx, pop(.8), CK('c3', 1) + .15); place(sfx, pop(.8), CK('c3', 2) + .25)
for i in range(44):
    place(sfx, tick(.16, 1200 + 25 * (i % 8)), S('c4') + .15 + i * .008, pan=-.6)
for i in range(44):
    place(sfx, tick(.16, 1100 + 30 * (i % 8)), CK('c4', 1) - .1 + i * .008, pan=0.0)
for i in range(44):
    place(sfx, tick(.16, 1000 + 30 * (i % 8)), CK('c4', 2) - .15 + i * .008, pan=.6)
place(sfx, pop(.8), CK('c4', 2) + .5); place(sfx, stamp_hit(.5, 100), CK('c4', 2) + .55)
place(sfx, pop(.8), S('c5') + .1)
for i in range(4):
    place(sfx, paper(.7), CK('c5', 1) - .1 + i * .12, pan=-.5 + .35 * i)
place(sfx, scrub(2.0, .9), CK('c5', 1) + .9, pan=0.0)
place(sfx, stamp_hit(.9, 85), CK('c5', 1) + 3.12); place(sfx, bell(nf('E5'), .5, 1.6), CK('c5', 1) + 3.15)
place(sfx, pop(.8), S('c6') + .1); place(sfx, pop(.8), CK('c6', 0) + .5)
tt_ = tvec(2.4); place(sfx, np.sin(2 * np.pi * np.cumsum(240 + 380 * (tt_ / 2.4) ** 1.3) / SR) * .06 * np.minimum(1, tt_ / .1) * np.clip((2.4 - tt_) / .2, 0, 1), CK('c6', 1) - .2)
place(sfx, pop(.8), CK('c6', 1) + 2.0); place(sfx, bell(nf('A5'), .5, 1.2), CK('c6', 1) + 2.0)
place(sfx, pop(.9), S('c7') + .2); place(sfx, whirr(3.1, .9), S('c7') + .1)
place(sfx, pop(.9, 400, 900), S('y7') - .02, pan=-.3); place(sfx, boing(.5, 380), S('y7') + .2)
place(sfx, pop(.9), S('c8') + .1); place(sfx, pop(.8), CK('c8', 0) + .1); place(sfx, pop(.8), CK('c8', 2) - .2)
sparkle(CK('c8', 2) - .1, base=nf('B6'), n=4, step=.07, v=.5)

# —— 彩蛋：双胞胎 ——
groove(T.twins + .1, T.how - .1, 'play', .85, 112)
place(sfx, whoosh(.5, True, .1), T.twins); place(sfx, pop(.8), S('d1') + .1)
for i in range(3):
    place(sfx, pop(.7, 450, 1000), S('d1') + .3 + i * .18, pan=-.5 + .5 * i)
for i in range(12):
    place(sfx, marimba(nf(['C5', 'D5', 'E5', 'G5', 'A5', 'C6'][i % 6]) * (2 if i >= 6 else 1), .5), CK('d2', 0) + .1 + i * .07, pan=-.6 + .1 * i)
place(sfx, pop(.8), CK('d2', 1) + .1); place(sfx, bell(nf('A5'), .5, 1.2), CK('d2', 1) + .12)
place(sfx, sweep_up(1.8, .1, 400, 1800), CK('d2', 2) + .2); place(sfx, pop(.8), CK('d2', 2) + .1)
for i in range(12):
    place(sfx, marimba(nf(['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6'][i]), .55), CK('d3', 1) - .3 + .2 + i * .1, pan=-.6 + .1 * i)
place(sfx, pop(.8), CK('d3', 1) + .2); place(sfx, pop(.8), CK('d3', 1) + 1.0); place(sfx, bell(nf('C7'), .5, 1.2), CK('d3', 2) + .1); place(sfx, pop(.8), CK('d3', 2) + .1)
place(sfx, pop(.8), S('d4') + .1); place(sfx, plink(nf('E6'), .7), S('d4') + .12)

# —— 怎么办 ——
groove(T.how + .1, T.fin - .2, 'hope', .85, 100)
place(sfx, whoosh(.5, True, .1), T.how)
place(sfx, pop(.8), S('e1') + .55); chime_up(S('e1') + .6, .7)
for i in range(3):
    place(sfx, pop(.8), CK('e2', 0) + .1 + i * .35); place(sfx, plink(nf(['E6', 'G6', 'B6'][i]), .6), CK('e2', 0) + .15 + i * .35)
place(sfx, sweep_up(.7, .1), CK('e2', 1) - .2); place(sfx, thump(.5), CK('e2', 1) + .5); place(sfx, tick(.8, 700), CK('e2', 1) + 1.0)
place(sfx, pop(.9), S('e3') + .1); place(sfx, pop(.8, 450, 1000), CK('e3', 1) + .05); place(sfx, pop(.9), CK('e3', 2) + .1); place(sfx, bell(nf('C6'), .6, 1.2), CK('e3', 2) + .12)
for i in range(3):
    place(sfx, pop(.6), S('e3') + 1.0 + i * .5, pan=-.3)
place(sfx, pop(.9), S('e4') + .1)
for k in range(10):
    place(sfx, tick(.5, 1700 - 80 * k), S('e4') + .1 + k * .15)
place(sfx, siren(1.2, .35), S('e4') - .1)
place(sfx, pop(.9), S('e5') - .1)
place(sfx, sweep_up(.8, .1, 400, 2200), CK('e5', 1) - .1); place(sfx, sweep_up(.8, .1, 400, 2200), CK('e5', 2) - .1)
place(sfx, plink(nf('E6'), .7), CK('e5', 1) + .8); place(sfx, plink(nf('A6'), .7), CK('e5', 2) + .8)
place(sfx, pop(.9), S('e6') - .05); place(sfx, bell(nf('A5'), .5, 2.0), S('e6') - .02)
place(sfx, sweep_up(.8, .1, 400, 2200), CK('e6', 1) - .1); place(sfx, sweep_up(.8, .1, 400, 2200), CK('e6', 2) - .1)
place(sfx, sad_slide(.5), CK('e6', 2) + .8)
place(sfx, pop(.9), S('e7') + .1)
for k in range(int(1.8 * 6)):
    place(sfx, tick(.3, 800 + 30 * (k % 3)), S('e7') + .3 + k / 6, pan=0.2)
place(sfx, bell(nf('E6'), .5, 1.2), S('e7') + 2.0)
for t_ in (CK('e8', 1) - .1, CK('e9', 0) + .3, CK('e9', 1) - .1):
    place(sfx, pop(.8), t_); place(sfx, plink(nf('G6'), .6), t_ + .05)
place(sfx, pop(.9), CK('e10', 1) - .1); chime_up(CK('e10', 1) - .05, .8)
place(sfx, pop(.9), CK('e11', 0) + .5); place(sfx, bell(nf('E6'), .6, 1.4), CK('e11', 0) + .52); place(sfx, bell(nf('C6'), .6, 1.6), CK('e11', 0) + .95)
place(sfx, pop(.8), CK('e11', 1) + .1); place(sfx, pop(.8), CK('e11', 2) + .1)

# —— 回到那十公斤 ——
groove(T.fin, T.endcard - .2, 'warm', .9, 76)
place(sfx, pop(.8), S('f1') + .1)
place(sfx, swept(3.0, 250, 3200, .6, .12, shape=lambda u: np.sin(np.pi * u) ** 1.2), S('f2') + .1)
tb_ = S('f2') + .2
while tb_ < S('f4') - .3:
    place(sfx, breath_out(1.6, .6), tb_, pan=0.2); tb_ += 2.1
for k in range(int((S('f4') - S('f2')) * 7)):
    place(sfx, bubble_pop(.3, 600 + 100 * (k % 6), 1500 + 120 * (k % 5)), S('f2') + .3 + k / 7 + rng.uniform(0, .06), pan=rng.uniform(.0, .8))
place(sfx, paper(.8), CK('f3', 1) + .05); place(sfx, pop(.8), CK('f3', 1) + .1)
for k in range(8):
    place(sfx, plink(nf(['C6', 'D6', 'E6', 'G6', 'A6', 'C7', 'D7', 'E7'][k]), .45), CK('f3', 1) + .2 + k * .22, pan=-.2 + .08 * k)
sparkle(CK('f3', 1) + 2.0, base=nf('G6'), n=6, step=.07, v=.7)
for i in range(4):
    place(sfx, pop(.8), S('f4') + .1 + i * .28, pan=-.4 + .27 * i); place(sfx, plink(nf(['C6', 'E6', 'G6', 'C7'][i]), .5), S('f4') + .12 + i * .28)
place(sfx, pop(.9), CK('f4', 1) + .2); chime_up(CK('f4', 1) + .25, .7)
place(sfx, pop(.9, 400, 900), S('y8') - .02, pan=-.3); place(sfx, whoosh(1.4, True, .08), S('y8') - .3)
for k, n in enumerate(['G6', 'E6', 'C6']):
    place(sfx, marimba(nf(n), .5), S('y8') + 1.4 + k * .15, pan=.2)
# 片尾
stinger(T.endcard + .05, chord=('F2', 'C3', 'F3', 'A3', 'C4', 'F4'), v=.7, soft=True)
sparkle(T.endcard + .15, base=nf('F6'), n=6, step=.06, v=.7)
for k, n in enumerate(['F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'F5']):
    place(music, marimba(nf(n), .5), T.endcard + .6 + k * .3, pan=-.2 + .07 * k)
place(music, pad([nf('F3'), nf('A3'), nf('C4'), nf('F4')], DUR - T.endcard, .6, att=.4, rel=2.0, bright=1.2), T.endcard + .2)


# ---------------- 配音 ----------------
def decode(path, chain=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', path]
    if chain:
        cmd += ['-af', chain]
    cmd += ['-f', 'f32le', '-ac', '1', '-ar', str(SR), '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32).astype(np.float64)


for l in TLD['lines']:
    x = decode(os.path.join(HERE, l['file']))
    x = hp(x, 75)
    act = np.abs(x) > .02
    rms = np.sqrt(np.mean(x[act] ** 2)) if act.any() else 1
    x = x * ({'N': .14, 'Y': .15}[l['spk']] / rms)
    place(voice, x, l['start'], 1.0, {'N': 0, 'Y': -.12}[l['spk']])


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
    return np.interp(np.arange(N), np.arange(len(g)) * hop, g)


def reverb_ir(length=1.8, seed=0, decay=.45):
    r = np.random.default_rng(seed)
    t = tvec(length)
    ir = r.standard_normal(len(t)) * np.exp(-t / decay)
    ir = lp(ir, 5000) * .9 + lp(ir, 1200) * .3
    ir[:int(.012 * SR)] = 0
    return ir / np.sqrt(np.sum(ir ** 2))


def pocket(bus, d_all, d_mid):
    """人声在说话时，整体让位一点，700–4500 Hz（人声最要紧的频段）让得更多。"""
    mid = bp(bus, 700, 4500)
    return (bus - mid) * d_all + mid * d_mid


dm, dm2 = duck_curve(voice, .60), duck_curve(voice, .82)
ds, ds2 = duck_curve(voice, .45), duck_curve(voice, .68)
mus, sfp = pocket(music, dm, dm2), pocket(sfx, ds, ds2)
irL, irR = reverb_ir(seed=1), reverb_ir(seed=2)
mix = np.zeros((2, N))
for bus, wet, gain in [(mus, .24, .58), (sfp, .12, .8)]:
    b = bus * gain
    m = b[0] + b[1]
    mix[0] += b[0] + fftconvolve(m, irL)[:N] * wet * .5
    mix[1] += b[1] + fftconvolve(m, irR)[:N] * wet * .5
vm = voice[0] + voice[1]
vr = fftconvolve(vm, reverb_ir(1.0, 3, .18))[:N] * .05
mix[0] += voice[0] + vr
mix[1] += voice[1] + vr
mix = hp(mix, 30)
tail = int(.8 * SR)
mix[:, -tail:] *= np.linspace(1, 0, tail) ** 1.5
peak = np.abs(mix).max()
mix = mix / peak * .97
mix = np.tanh(mix * 1.5) / np.tanh(1.5)
mix *= .9
out = sys.argv[1] if len(sys.argv) > 1 else 'audio.wav'
wavfile.write(out, SR, (mix.T * 32767).astype(np.int16))
print('wrote', out, f'{DUR:.2f}s', 'peak', float(np.abs(mix).max()))

if os.environ.get('STEMS'):
    rmsdb = lambda b, i: 20 * np.log10(np.sqrt(np.mean(b[:, i * SR:(i + 10) * SR] ** 2)) + 1e-9)
    print('music raw dB /10s:', ' '.join(f'{rmsdb(music, i):.0f}' for i in range(0, int(DUR), 10)))
    print('sfx   raw dB /10s:', ' '.join(f'{rmsdb(sfx, i):.0f}' for i in range(0, int(DUR), 10)))  # 调试：导出分轨，检查人声与背景的比例
    for name, b, k in [('voice', voice, 1), ('music', mus, .58), ('sfx', sfp, .8)]:
        wavfile.write(out.replace('.wav', f'_{name}.wav'), SR, (np.clip(b.T * k / peak * .97, -1, 1) * 32767).astype(np.int16))
