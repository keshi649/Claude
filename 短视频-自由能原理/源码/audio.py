"""《大脑只做一件事》配乐与音效 —— 全部用 numpy 合成，时间轴与 film.js 对齐。
用法：python3 audio.py out.wav
"""
import sys
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt
from scipy.io import wavfile

SR = 44100
DUR = 186.0
N = int(SR * DUR)
rng = np.random.default_rng(11)

music = np.zeros((2, N))   # 音乐总线（较多混响）
sfx = np.zeros((2, N))     # 音效总线（少量混响）
dry = np.zeros((2, N))     # 干声
hook = np.zeros((2, N))    # 开场弹球：定格时整条总线（连同混响）一刀切断
rep = np.zeros((2, N))     # 结尾回扣的弹球，同上

# ---- 与 film.js 一致的时间常数 ----
T0, P, CT = 0.30, 0.45, 0.06
uf = (1 + np.sqrt(1 - 150 / 520)) / 2
TF = T0 + 3 * P + CT + (P - CT) * uf          # 定格时刻 ≈ 2.07 s
HOOK_UNFREEZE = 2.55
REPLAY0 = 159.6
REPLAY_UNFREEZE = 162.25


def nf(name):
    base = {'C': -9, 'D': -7, 'E': -5, 'F': -4, 'G': -2, 'A': 0, 'B': 2}[name[0]]
    rest = name[1:]
    if rest[0] == '#':
        base += 1; rest = rest[1:]
    elif rest[0] == 'b':
        base -= 1; rest = rest[1:]
    return 440.0 * 2 ** ((base + (int(rest) - 4) * 12) / 12)


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


def tvec(dur):
    return np.arange(int(dur * SR)) / SR


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, 'low', fs=SR, output='sos'), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)


def noise(dur):
    return rng.standard_normal(int(dur * SR))


# ---------------- 乐器 ----------------
def piano(f, dur, vel=0.5):
    length = min(dur + 1.5, 6.0)
    t = tvec(length)
    out = np.zeros_like(t)
    tau0 = float(np.clip(2.0 * (261.6 / f) ** 0.5, 0.7, 5.0))
    for k in range(1, 10):
        fk = k * f * np.sqrt(1 + 0.00035 * k * k)
        if fk > 14000:
            break
        a = (1 / k ** 1.2) * (0.35 + 0.45 * vel) ** (k - 1)
        out += a * np.sin(2 * np.pi * fk * t + rng.uniform(0, 6.28)) * np.exp(-t / (tau0 / (1 + 0.5 * (k - 1))))
    out *= 0.55 * np.exp(-t / 0.35) + 0.45
    out *= np.minimum(1, t / 0.003) * np.clip((dur + 0.6 + 0.35 - t) / 0.35, 0, 1)
    return out * vel * 0.22


def pluck(f, vel=0.5, length=1.4, bright=1.0):
    t = tvec(length)
    out = np.zeros_like(t)
    for k in range(1, 9):
        if k * f > 12000:
            break
        out += (1 / k ** (1.6 / bright)) * np.sin(2 * np.pi * k * f * t) * np.exp(-t * (2.5 + 2.2 * k / bright))
    out *= np.minimum(1, t / 0.002)
    return out * vel * 0.16


def marimba(f, vel=0.8):
    t = tvec(1.2)
    out = (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.45)
           + 0.35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t / 0.08)
           + 0.12 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t / 0.025))
    out += 0.25 * bp(noise(1.2), 1500, 5000) * np.exp(-t / 0.004)
    out *= np.minimum(1, t / 0.001)
    return out * vel * 0.3


def musicbox(f, vel=0.5):
    t = tvec(2.0)
    out = (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.9)
           + 0.35 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t / 0.35)
           + 0.12 * np.sin(2 * np.pi * f * 4.07 * t) * np.exp(-t / 0.12))
    out *= np.minimum(1, t / 0.0015)
    return out * vel * 0.12


def bell(f, vel=0.5, length=3.5):
    t = tvec(length)
    out = np.zeros_like(t)
    for r, a, tau in [(1, 1, 2.6), (2.76, .45, 1.2), (5.40, .25, .6), (8.93, .12, .3), (.5, .3, 2.0)]:
        out += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / tau)
    out *= np.minimum(1, t / 0.002)
    return out * vel * 0.12


def pad(freqs, dur, vel=0.5, att=1.2, rel=1.6, bright=1.0, vib=0.0):
    t = tvec(dur)
    out = np.zeros_like(t)
    for f in freqs:
        for det in (-8, 0, 8):
            fd = f * 2 ** (det / 1200)
            hmax = int(min(10, 6000 / fd))
            ph = 2 * np.pi * fd * t + rng.uniform(0, 6.28)
            if vib:
                ph = ph + (vib * fd / 5.5) * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 1.0)
            for h in range(1, hmax + 1):
                out += (1 / h) * np.exp(-h * 0.25 / bright) * np.sin(h * ph)
    env = np.minimum(1, t / att) * np.clip((dur - t) / rel, 0, 1)
    out *= env * (1 + 0.08 * np.sin(2 * np.pi * 0.21 * t))
    return out * vel * 0.03 / max(1, len(freqs)) ** 0.5


def sub(f, dur, vel=0.5, att=0.02, rel=0.3):
    t = tvec(dur)
    out = np.sin(2 * np.pi * f * t) + 0.2 * np.sin(4 * np.pi * f * t)
    out *= np.minimum(1, t / att) * np.clip((dur - t) / rel, 0, 1)
    return out * vel * 0.22


def kick(v=1.0):
    t = tvec(0.45)
    fr = 48 + 110 * np.exp(-t / 0.035)
    out = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.16)
    out += 0.3 * lp(noise(0.45), 2500) * np.exp(-t / 0.006)
    return out * v * 0.42


def hat(v=1.0, dur=0.035):
    t = tvec(0.12)
    return hp(noise(0.12), 7000) * np.exp(-t / dur) * v * 0.07


# ---------------- 音效 ----------------
def swept(dur, f0, f1, bw=0.55, gain=1.0, shape=None):
    n = int(dur * SR)
    x = rng.standard_normal(n + 2048)
    out = np.zeros(n + 2048)
    win = np.hanning(2048)
    freqs = np.fft.rfftfreq(2048, 1 / SR)
    for s in range(0, n, 512):
        u = s / n
        fc = f0 * (f1 / f0) ** u
        X = np.fft.rfft(x[s:s + 2048] * win)
        g = np.exp(-0.5 * (np.log(np.maximum(freqs, 1) / fc) / bw) ** 2)
        out[s:s + 2048] += np.fft.irfft(X * g) * win
    out = out[:n]
    u = np.arange(n) / n
    env = np.sin(np.pi * u) ** 1.5 if shape is None else shape(u)
    out = out * env
    return out / (np.abs(out).max() + 1e-9) * gain


def thump(v=1.0):
    t = tvec(0.5)
    out = np.sin(2 * np.pi * (60 + 60 * np.exp(-t / 0.03)) * t) * np.exp(-t / 0.12)
    out += 0.5 * lp(noise(0.5), 900) * np.exp(-t / 0.02)
    return out * v * 0.35


def boom(v=1.0, length=2.2):
    t = tvec(length)
    fr = 32 + 50 * np.exp(-t / 0.25)
    out = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.7)
    out += 0.6 * lp(noise(length), 300, 3) * np.exp(-t / 0.18)
    out += 0.25 * bp(noise(length), 1500, 7000) * np.exp(-t / 0.03)
    return out * v * 0.5


def crash(v=1.0, length=3.0):
    t = tvec(length)
    out = hp(noise(length), 3500) * (np.exp(-t / 0.9) * 0.7 + np.exp(-t / 0.08) * 0.6)
    return out * v * 0.08


def glitch(dur=0.3, v=1.0, seed=0):
    r = np.random.default_rng(seed)
    n = int(dur * SR)
    out = np.zeros(n)
    k = 0
    while k < n:
        L = int(r.uniform(0.008, 0.04) * SR)
        kind = r.integers(0, 3)
        tt = np.arange(L) / SR
        if kind == 0:
            f = r.choice([110, 220, 440, 880, 1760])
            blk = np.sign(np.sin(2 * np.pi * f * tt))
        elif kind == 1:
            blk = r.standard_normal(L)
        else:
            blk = np.zeros(L)
        step = int(r.choice([1, 4, 8, 16]))
        blk = np.repeat(blk[::step], step)[:L]
        out[k:k + L] = blk[:max(0, min(L, n - k))]
        k += L
    out *= np.clip((dur - np.arange(n) / SR) / 0.01, 0, 1)
    return out * v * 0.12


def buzz(dur=0.22, f=110, v=1.0):
    t = tvec(dur)
    out = np.sign(np.sin(2 * np.pi * f * t)) * 0.6 + np.sign(np.sin(2 * np.pi * f * 1.5 * t)) * 0.4
    out = lp(out, 2200) * np.minimum(1, t / 0.005) * np.clip((dur - t) / 0.02, 0, 1)
    return out * v * 0.12


def ding(f=1568, v=1.0):
    t = tvec(1.6)
    out = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t) * np.exp(-t / 0.3)
           + 0.25 * np.sin(2 * np.pi * f * 3.0 * t) * np.exp(-t / 0.15)) * np.exp(-t / 0.55)
    return out * np.minimum(1, t / 0.002) * v * 0.09


def pop(v=1.0, f0=420, f1=980):
    t = tvec(0.14)
    fr = f0 + (f1 - f0) * np.minimum(1, t / 0.05)
    out = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.045) * np.minimum(1, t / 0.003)
    return out * v * 0.10


def plink(f=2093, v=1.0):
    t = tvec(0.6)
    out = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t) + 0.3 * np.sin(2 * np.pi * f * 2.7 * t)) * np.exp(-t / 0.12)
    return out * v * 0.10


def click(v=1.0):
    t = tvec(0.06)
    out = np.sin(2 * np.pi * 1700 * t) * np.exp(-t / 0.01) + 0.8 * hp(noise(0.06), 3000) * np.exp(-t / 0.0015)
    return out * v * 0.12


def tick(hi=True, v=1.0):
    t = tvec(0.05)
    f = 2600 if hi else 2100
    out = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.006) + 0.6 * hp(noise(0.05), 2000) * np.exp(-t / 0.002)
    return out * v * 0.05


def beep(f=1000, dur=0.12, v=1.0):
    t = tvec(dur)
    return np.sin(2 * np.pi * f * t) * np.minimum(1, t / 0.004) * np.clip((dur - t) / 0.02, 0, 1) * v * 0.06


def heartbeat(v=1.0):
    out = np.zeros(int(0.6 * SR))
    for dt, a in [(0, 1.0), (0.17, 0.7)]:
        t = tvec(0.3)
        h = np.sin(2 * np.pi * (45 + 30 * np.exp(-t / 0.02)) * t) * np.exp(-t / 0.07) * a
        i = int(dt * SR)
        out[i:i + len(h)] += h
    return lp(out, 200) * v * 0.55


def splash(v=1.0):
    t = tvec(0.9)
    out = bp(noise(0.9), 600, 6000) * (np.exp(-t / 0.12) * np.minimum(1, t / 0.01))
    for k in range(14):
        d = rng.uniform(0.05, 0.6)
        f = rng.uniform(900, 2600)
        tt = tvec(0.08)
        drop = np.sin(2 * np.pi * (f + 1500 * tt / 0.08) * tt) * np.exp(-tt / 0.02)
        i = int(d * SR)
        out[i:i + len(drop)] += drop * 0.4 * rng.uniform(0.4, 1)
    return out * v * 0.18


def slap(v=1.0):
    t = tvec(0.12)
    out = bp(noise(0.12), 300, 3000) * np.exp(-t / 0.025) + 0.5 * np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.03)
    return out * v * 0.2


def bubble(f=600, v=1.0):
    t = tvec(0.09)
    out = np.sin(2 * np.pi * np.cumsum(f * (1 + 1.6 * t / 0.09)) / SR) * np.sin(np.pi * t / 0.09)
    return out * v * 0.05


def womp(f0, dur=0.55, v=1.0):
    t = tvec(dur + 0.1)
    fr = f0 * (1 - 0.06 * t / dur)
    ph = 2 * np.pi * np.cumsum(fr * (1 + 0.012 * np.sin(2 * np.pi * 6 * t))) / SR
    out = sum((1 / k) * np.sin(k * ph) for k in range(1, 9))
    wah = 0.5 + 0.5 * np.sin(np.pi * np.clip(t / dur, 0, 1))
    out = lp(out * wah, 1800) * np.minimum(1, t / 0.03) * np.clip((dur + 0.05 - t) / 0.08, 0, 1)
    return out * v * 0.09


def clunk(v=1.0):
    t = tvec(2.0)
    out = np.zeros_like(t)
    for f, a, tau in [(180, 1, .5), (433, .6, .35), (812, .4, .25), (1290, .3, .18), (2210, .2, .1)]:
        out += a * np.sin(2 * np.pi * f * t) * np.exp(-t / tau)
    out += 0.8 * lp(noise(2.0), 1200) * np.exp(-t / 0.03)
    return out * np.minimum(1, t / 0.001) * v * 0.22


def creak(dur=0.8, v=1.0):
    t = tvec(dur)
    f = 260 + 180 * np.sin(np.pi * t / dur) + 30 * np.sin(2 * np.pi * 23 * t)
    pulses = (np.sin(2 * np.pi * np.cumsum(f) / SR) > 0.85).astype(float)
    out = bp(pulses, 400, 3000) * np.sin(np.pi * t / dur)
    return out * v * 0.3


def scratch(v=1.0):
    t = tvec(0.5)
    rate = np.sin(2 * np.pi * 3.2 * t) * 1.0
    pos = np.cumsum(rate) / SR * 3000
    src = bp(noise(0.6), 300, 4000)
    out = np.interp(np.clip(pos + 1000, 0, len(src) - 1), np.arange(len(src)), src) * np.abs(rate) ** 0.5
    return out * np.clip((0.5 - t) / 0.08, 0, 1) * v * 0.35


def growl(v=1.0):
    t = tvec(0.9)
    f = 70 + 25 * np.sin(2 * np.pi * 5 * t) + 15 * np.sin(2 * np.pi * 13 * t)
    out = lp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), 400) * np.sin(np.pi * t / 0.9) ** 0.7
    return out * v * 0.12


def hiss(dur=1.2, v=1.0):
    t = tvec(dur)
    return bp(noise(dur), 4000, 10000) * np.minimum(1, t / 0.15) * np.clip((dur - t) / 0.3, 0, 1) * v * 0.12


def cricket(dur=0.4, v=1.0):
    t = tvec(dur)
    gate = (np.sin(2 * np.pi * 30 * t) > 0.2).astype(float)
    return np.sin(2 * np.pi * 4300 * t) * gate * np.sin(np.pi * t / dur) * v * 0.02


def footstep(v=1.0):
    t = tvec(0.15)
    return (lp(noise(0.15), 700) * np.exp(-t / 0.025) + 0.4 * np.sin(2 * np.pi * 90 * t) * np.exp(-t / 0.03)) * v * 0.25


def snore(dur=1.4, v=1.0):
    t = tvec(dur)
    out = lp(noise(dur), 500) * (0.6 + 0.4 * np.sin(2 * np.pi * 28 * t)) * np.sin(np.pi * t / dur) ** 2
    return out * v * 0.25


def sparkle(t0, base=2093, n=5, step=0.06, v=0.8, bus=None):
    ratios = [1, 1.26, 1.5, 2, 2.52, 3]
    for k in range(n):
        place(bus if bus is not None else sfx, plink(base * ratios[k % len(ratios)], v * (1 - k * 0.1)), t0 + k * step, 1.0, pan=-0.4 + 0.2 * k)


# ---------------- 编曲工具 ----------------
CH = {
    'Am': (['A1', 'A2'], ['A2', 'E3', 'C4', 'E4'], ['A3', 'C4', 'E4', 'A4', 'E4', 'C4', 'B3', 'C4']),
    'F': (['F1', 'F2'], ['F2', 'C3', 'A3', 'E4'], ['F3', 'A3', 'C4', 'E4', 'C4', 'A3', 'G3', 'A3']),
    'C': (['C2', 'C3'], ['C3', 'G3', 'E4', 'D4'], ['C4', 'E4', 'G4', 'D5', 'G4', 'E4', 'D4', 'E4']),
    'G': (['G1', 'G2'], ['G2', 'D3', 'B3', 'D4'], ['G3', 'B3', 'D4', 'A4', 'D4', 'B3', 'A3', 'B3']),
    'Dm': (['D2', 'D3'], ['D3', 'A3', 'F4', 'E4'], ['D4', 'F4', 'A4', 'E5', 'A4', 'F4', 'E4', 'F4']),
    'Em': (['E1', 'E2'], ['E2', 'B2', 'G3', 'D4'], ['E3', 'G3', 'B3', 'D4', 'B3', 'G3', 'F#3', 'G3']),
}
BAR = 2.5          # 96 bpm，4/4
E8 = BAR / 8


def bed(t0, chords, arp=0.0, kick_v=0.0, hat_v=0.0, pad_v=0.35, sub_v=0.35, stop=None, bright=1.0, arp_inst='pluck'):
    for b, name in enumerate(chords):
        tb = t0 + b * BAR
        if stop is not None and tb >= stop:
            break
        bass, padn, ar = CH[name]
        d = BAR if stop is None else min(BAR, stop - tb)
        place(music, pad([nf(x) for x in padn], d + 0.9, pad_v, att=0.5, rel=0.9, bright=bright), tb - 0.05)
        if sub_v:
            place(music, sub(nf(bass[0]), d, sub_v, att=0.05, rel=0.4), tb)
        for k in range(8):
            tt = tb + k * E8
            if stop is not None and tt >= stop - 0.05:
                break
            if arp:
                if arp_inst == 'pluck':
                    place(music, pluck(nf(ar[k]), arp * (1.0 if k == 0 else 0.75)), tt, pan=-0.3 + 0.6 * (k % 2))
                else:
                    place(music, musicbox(nf(ar[k]) * 2, arp * 1.2), tt, pan=-0.3 + 0.6 * (k % 2))
            if kick_v and k in (0, 4):
                place(dry, kick(kick_v), tt)
            if hat_v and k % 2 == 1:
                place(dry, hat(hat_v), tt, pan=0.3)


def mel(seq, vel=0.3, pan=0.15, inst='piano'):
    for t0, name, d in seq:
        if inst == 'piano':
            place(music, piano(nf(name), d, vel), t0, pan=pan)
        else:
            place(music, bell(nf(name), vel, 2.5), t0, pan=pan)


# ======================================================================
# 0 – 2.07  开场：越来越紧的节奏，第五下突然没了
# ======================================================================
def bounce_sequence(bus, base, level=1.0):
    impacts = [base + T0 + k * P for k in range(4)]
    end = base + TF
    tt = tvec(TF + 0.3)
    drone = np.zeros_like(tt)
    for f, a in [(55, 1), (110, .45), (82.4, .35)]:
        drone += a * sum((1 / h) * np.sin(2 * np.pi * f * h * tt) for h in range(1, 7))
    drone = lp(drone, 380) * (0.6 + 0.4 * tt / TF)
    duck = np.ones_like(tt)
    for ti in impacts:
        d = tt - (ti - base)
        duck -= 0.45 * np.where(d >= 0, np.exp(-np.maximum(d, 0) / 0.12), 0)
    place(bus, drone * duck * 0.05 * level, base)
    place(bus, swept(TF + 0.05, 250, 7000, bw=0.5, gain=0.07 * level, shape=lambda u: u ** 2.2), base)
    place(bus, swept(T0 + 0.02, 4000, 900, bw=0.5, gain=0.16 * level, shape=lambda u: np.minimum(1, u * 12) * (0.6 + 0.4 * u)), base)
    place(bus, hat(1.0 * level, 0.05), base + 0.0, pan=0.25)
    k = -1
    while True:
        th = base + T0 + k * P / 2
        if th >= end - 0.01:
            break
        place(bus, hat(0.9 * level, 0.02 if k % 2 else 0.05), th, pan=0.25)
        k += 1
    for i, (ti, nm) in enumerate(zip(impacts, ['G4', 'C5', 'E5', 'G5'])):
        place(bus, marimba(nf(nm), 0.9 * level), ti, pan=-0.1 + 0.07 * i)
        place(bus, marimba(nf(nm) * 2, 0.25 * level), ti, pan=0.2)
        place(bus, kick(0.75 * level), ti)
    place(bus, sub(nf('A1'), TF - T0, 0.3 * level, att=0.3, rel=0.01), base + T0)


bounce_sequence(hook, 0.0, 1.0)

# 2.55「视频没卡。」
place(sfx, boom(1.0), HOOK_UNFREEZE)
place(sfx, thump(0.9), HOOK_UNFREEZE)
place(music, piano(nf('A0'), 3.0, 0.6), HOOK_UNFREEZE)
place(music, piano(nf('E1'), 3.0, 0.45), HOOK_UNFREEZE)
# 3.25「猜错了」
for k, tt in enumerate([3.25, 3.34, 3.47]):
    place(sfx, glitch(0.07, 0.9, seed=k), tt, pan=-0.3 + 0.3 * k)
place(sfx, buzz(0.12, 98, 0.6), 3.55)
# 4.3 预测与误差标注出现
place(sfx, swept(0.9, 1200, 5000, bw=0.4, gain=0.05), 4.25, pan=-0.3)
place(sfx, beep(nf('E5'), 0.14, 0.8), 4.75, pan=0.3)
place(sfx, beep(nf('Bb4'), 0.22, 0.8), 4.92, pan=0.3)
# 6.0 – 9.3：心跳 + 暗色铺底
place(music, pad([nf(x) for x in ['A2', 'E3', 'C4']], 4.0, 0.45, att=1.6, rel=1.0, bright=0.8), 5.6)
for tt in [6.1, 6.95, 7.8, 8.6]:
    place(dry, heartbeat(0.9), tt)
place(sfx, swept(0.8, 300, 6000, bw=0.6, gain=0.12, shape=lambda u: u ** 3), 8.55)
# 9.35「意外」
place(sfx, boom(1.0), 9.35)
place(sfx, glitch(0.35, 1.2, seed=9), 9.35)
place(sfx, crash(0.8), 9.35)
for nm in ['C6', 'C#6', 'G6']:
    place(sfx, bell(nf(nm), 0.5, 3.0), 9.36, pan=0.2)
for tt in [10.90, 12.60]:
    place(sfx, glitch(0.15, 0.6, seed=int(tt * 10)), tt)
# 10.5 – 14.2：脉动低音，推向标题
for k in range(int((14.15 - 10.5) / (E8 / 2))):
    tt = 10.5 + k * E8 / 2
    v = 0.3 + 0.7 * (tt - 10.5) / 3.65
    place(music, sub(nf('A1'), E8 / 2 * 0.9, 0.45 * v, att=0.005, rel=0.04), tt)
place(music, pad([nf('A2'), nf('E3')], 3.8, 0.35, att=1.5, rel=0.3, bright=0.7), 10.4)
place(sfx, swept(1.8, 400, 9000, bw=0.55, gain=0.14, shape=lambda u: u ** 2.5), 12.4)

# ======================================================================
# 14.2 标题
# ======================================================================
place(sfx, boom(1.0, 3.0), 14.2)
place(sfx, crash(1.0), 14.2)
place(music, pad([nf(x) for x in ['F2', 'C3', 'A3', 'E4', 'G4']], 4.2, 0.65, att=0.05, rel=1.8, bright=1.3), 14.2)
for nm in ['F2', 'C3', 'A3', 'E4']:
    place(music, piano(nf(nm), 3.0, 0.4), 14.2)
sparkle(14.6, base=nf('A6'), n=6, step=0.08, v=0.5)
place(music, bell(nf('E6'), 0.4), 15.0, pan=0.3)

# ======================================================================
# 18.0 – 29.4 黑盒子
# ======================================================================
bed(18.0, ['Am', 'F', 'Am', 'F', 'G'], arp=0.0, pad_v=0.35, sub_v=0.25, stop=29.6, bright=0.7)
for k in range(9):
    place(music, pluck(nf(['A3', 'E4', 'C4', 'E4', 'A3', 'F4', 'C4', 'A3', 'B3'][k]), 0.35), 21.2 + k * 0.94, pan=0.2)
# 21.2：光与声被挡在外面
place(sfx, swept(2.5, 2500, 6000, bw=0.3, gain=0.03), 21.2, pan=-0.6)
for k in range(3):
    place(sfx, beep(nf('A5'), 0.3, 0.25), 21.4 + k * 0.9, pan=0.7)
# 24.2：电信号进来
r2 = np.random.default_rng(5)
penta = ['A5', 'C6', 'D6', 'E6', 'G6', 'A6']
tt = 24.2
while tt < 29.3:
    place(sfx, beep(nf(penta[r2.integers(0, 6)]), 0.035, 0.55), tt, pan=r2.uniform(-0.7, 0.7))
    tt += r2.uniform(0.07, 0.22)
# 27.2：猜
place(sfx, swept(1.2, 600, 5000, bw=0.45, gain=0.09), 27.15, pan=0.1)
sparkle(27.7, base=nf('E6'), n=4, step=0.07, v=0.4)

# ======================================================================
# 29.6 – 41.2 预测 / 误差 示意图
# ======================================================================
place(sfx, swept(0.9, 3000, 400, bw=0.5, gain=0.07), 29.4)
bed(29.6, ['Am', 'F', 'C', 'G', 'Am'], arp=0.38, kick_v=0.35, pad_v=0.3, sub_v=0.3, stop=41.2)
# 35.8 对上了
place(sfx, ding(nf('C6'), 1.0), 35.8, pan=0.1)
place(sfx, ding(nf('G6'), 0.6), 35.88, pan=0.2)
# 38.6 对不上
place(sfx, buzz(0.16, 110, 1.0), 38.6)
place(sfx, buzz(0.16, 110, 1.0), 38.82)
place(sfx, thump(0.6), 38.6)
for k in range(6):
    place(sfx, beep(nf('A4') * 2 ** (k / 4), 0.05, 0.5), 38.75 + k * 0.11, pan=0.0)

# ======================================================================
# 41.2 – 59.0 乱序汉字
# ======================================================================
bed(41.6, ['C', 'G', 'Am', 'F', 'C', 'G'], arp=0.3, pad_v=0.28, sub_v=0.25, stop=56.6, arp_inst='box')
place(sfx, pop(0.8, 500, 1200), 42.3)
place(sfx, beep(nf('E4'), 0.18, 0.7), 49.0)
place(sfx, beep(nf('C4'), 0.25, 0.7), 49.2)
place(sfx, swept(1.1, 800, 4000, bw=0.45, gain=0.08), 50.2)
for k in range(5):
    place(sfx, tick(k % 2 == 0, 1.5), 50.3 + k * 0.2, pan=-0.4 + 0.2 * k)
place(sfx, ding(nf('E6'), 0.8), 51.3)
# 56.6 「所谓看见，其实是大脑在猜」
place(sfx, thump(0.6), 56.6)
place(music, pad([nf(x) for x in ['F2', 'C3', 'A3', 'E4']], 3.0, 0.5, att=0.05, rel=1.2, bright=1.2), 56.6)
for nm in ['F2', 'A3', 'C4', 'E4']:
    place(music, piano(nf(nm), 2.2, 0.38), 56.6)
place(music, bell(nf('C6'), 0.35), 57.0, pan=0.3)

# ======================================================================
# 59.0 – 71.4 鱼
# ======================================================================
place(music, pad([nf(x) for x in ['D2', 'A2', 'F3']], 3.0, 0.45, att=0.3, rel=0.6, vib=0.006), 59.05)
place(music, musicbox(nf('A5'), 0.6), 59.5)
place(music, musicbox(nf('E6'), 0.6), 59.95)
place(sfx, swept(0.6, 2500, 400, bw=0.5, gain=0.05), 61.6)
# 62.0 水里：轻快
for b, name in enumerate(['C', 'F', 'C']):
    tb = 62.0 + b * 1.2
    bass, padn, ar = CH[name]
    place(music, pad([nf(x) for x in padn], 1.5, 0.28, att=0.2, rel=0.4), tb)
    for k in range(4):
        place(music, musicbox(nf(ar[k * 2]) * 2, 0.5), tb + k * 0.3, pan=0.2)
for k in range(22):
    place(sfx, bubble(rng.uniform(400, 900), 1.0), 62.0 + k * 0.16 + rng.uniform(0, 0.08), pan=rng.uniform(-0.6, 0.2))
for t0 in [62.6, 63.4, 64.2]:
    place(sfx, plink(nf('E6'), 0.4), t0, pan=-0.3)
# 65.6 跃出水面 / 66.4 落地
place(sfx, splash(1.0), 65.6, pan=-0.2)
place(sfx, swept(0.8, 500, 2500, bw=0.5, gain=0.06), 65.6, pan=0.2)
place(sfx, slap(1.2), 66.4, pan=0.3)
place(sfx, thump(0.4), 66.4)
for k in range(5):
    place(sfx, slap(0.8), 66.4 + k * 0.5 + 0.3, pan=0.35)
for t0 in [66.6, 67.0, 67.4, 67.8]:
    place(sfx, beep(1320, 0.08, 0.9), t0, pan=0.4)
    place(sfx, beep(1760, 0.08, 0.6), t0 + 0.09, pan=0.4)
dim = ['B3', 'D4', 'F4', 'Ab4']
for k in range(16):
    place(music, piano(nf(dim[k % 4]), 0.1, 0.32), 66.5 + k * 0.13, pan=-0.2)
# 68.8「然后就没有然后了」
for k, (nm, d) in enumerate([('G3', 0.45), ('F#3', 0.45), ('F3', 0.45), ('E3', 1.0)]):
    place(sfx, womp(nf(nm), d, 1.0), 68.9 + k * 0.5)

# ======================================================================
# 71.3 – 85.0 稳态 / 熵 / 细胞
# ======================================================================
bed(71.3, ['C', 'G', 'Am'], arp=0.22, pad_v=0.28, sub_v=0.25, stop=78.8)
for k in range(10):
    place(sfx, beep(1000, 0.09, 0.9), 71.6 + k * 0.8, pan=0.3)
for i in range(4):
    place(sfx, pop(0.5, 600 + 80 * i, 1100 + 80 * i), 71.4 + i * 0.15, pan=-0.3 + 0.2 * i)
for kt in [75.3, 75.9, 76.5, 77.1]:
    place(sfx, beep(880, 0.07, 1.0), kt + 0.1, pan=0.4)
    place(sfx, beep(880, 0.07, 1.0), kt + 0.22, pan=0.4)
    place(sfx, tick(True, 1.6), kt + 0.75, pan=-0.2)
# 79.5 散掉
place(music, pad([nf('A2'), nf('E3')], 3.3, 0.35, att=0.3, rel=1.5, bright=0.6), 78.8)
place(sfx, swept(2.4, 1500, 200, bw=0.7, gain=0.11), 79.4)
for k in range(60):
    tt = 79.5 + (k / 60) ** 0.7 * 2.3
    place(sfx, tick(k % 2 == 0, rng.uniform(0.3, 0.9)), tt, pan=rng.uniform(-0.9, 0.9))
# 81.9 细胞
place(music, pad([nf(x) for x in ['F2', 'C3', 'A3', 'E4']], 3.6, 0.55, att=0.9, rel=1.4, bright=1.1), 81.8)
for k, nm in enumerate(['C5', 'E5', 'A5', 'C6', 'E6']):
    place(music, musicbox(nf(nm), 0.45), 82.0 + k * 0.18, pan=0.25)
place(sfx, swept(1.6, 300, 1600, bw=0.6, gain=0.06), 81.9)

# ======================================================================
# 85.0 – 107.6 自由能：盖子
# ======================================================================
place(music, pad([nf(x) for x in ['A1', 'E2', 'A2', 'E3']], 8.8, 0.75, att=1.0, rel=0.6, bright=0.75), 85.0)
for k in range(10):
    place(music, pluck(nf(['E4', 'A3'][k % 2]), 0.42, bright=0.8), 85.4 + k * 0.82, pan=0.3)
place(sfx, swept(4.0, 300, 900, bw=0.6, gain=0.04, shape=lambda u: np.sin(np.pi * u)), 85.3)
place(sfx, click(1.5), 88.3)
place(sfx, clunk(0.35), 88.32)
place(sfx, swept(2.3, 300, 8000, bw=0.55, gain=0.13, shape=lambda u: u ** 2.5), 91.3)
place(sfx, boom(0.9), 93.6)
place(sfx, clunk(1.0), 93.6)
bed(93.6, ['Am', 'F', 'C', 'G', 'Am', 'F'], arp=0.32, kick_v=0.32, hat_v=0.6, pad_v=0.3, sub_v=0.3, stop=107.6)
place(sfx, swept(0.8, 800, 3000, bw=0.5, gain=0.07), 95.6)
place(sfx, swept(0.9, 900, 250, bw=0.5, gain=0.09), 98.8)
place(sfx, click(1.2), 99.7)
place(sfx, swept(1.4, 500, 120, bw=0.5, gain=0.12), 99.9)
place(music, sub(nf('E1'), 1.4, 0.4, att=0.2, rel=0.3), 99.9)
place(sfx, thump(0.8), 101.3)
place(sfx, bell(nf('A5'), 0.4), 104.45, pan=0.3)
place(sfx, bell(nf('E6'), 0.3), 104.6, pan=0.4)

# ======================================================================
# 107.6 – 120.2 两条路 / 绳子与蛇
# ======================================================================
place(sfx, thump(0.8), 107.7)
place(music, pad([nf(x) for x in ['G2', 'D3', 'A3', 'C4']], 3.0, 0.45, att=0.05, rel=0.6), 107.7)
place(sfx, pop(0.9, 500, 1000), 108.3, pan=-0.4)
place(sfx, pop(0.9, 650, 1300), 108.8, pan=0.4)
# 夜晚
place(music, pad([nf(x) for x in ['E2', 'B2', 'G3']], 3.5, 0.35, att=0.6, rel=0.5, bright=0.6), 110.3)
r3 = np.random.default_rng(8)
for k in range(18):
    place(dry, cricket(0.35, 1.0), 110.5 + k * 0.52 + r3.uniform(0, 0.1), pan=r3.choice([-0.7, 0.7]))
place(sfx, hiss(1.4, 1.0), 111.0, pan=0.4)
place(music, pad([nf(x) for x in ['E3', 'F3', 'B3']], 2.7, 0.4, att=0.3, rel=0.4, vib=0.02), 111.0)
for k, tt in enumerate([111.1, 111.7, 112.25, 112.75, 113.2]):
    place(dry, heartbeat(1.0), tt)
place(sfx, click(1.6), 113.6)
place(sfx, swept(0.8, 600, 6000, bw=0.5, gain=0.08), 113.6)
place(sfx, buzz(0.14, 104, 0.8), 114.15)
place(sfx, buzz(0.14, 104, 0.8), 114.35)
# 115.3 哦，是绳子
for nm in ['C3', 'G3', 'E4', 'G4']:
    place(music, piano(nf(nm), 2.0, 0.32), 115.3)
place(sfx, ding(nf('G6'), 0.8), 115.65, pan=-0.2)
bed(116.7, ['C', 'G'], arp=0.25, pad_v=0.25, sub_v=0.2, stop=120.2)

# ======================================================================
# 120.2 – 133.6 手和杯子
# ======================================================================
bed(120.4, ['F', 'C', 'G', 'Am', 'F'], arp=0.32, kick_v=0.3, pad_v=0.28, sub_v=0.28, stop=133.65)
place(sfx, swept(0.8, 1500, 5000, bw=0.4, gain=0.05), 123.7, pan=0.2)
sparkle(123.9, base=nf('A6'), n=3, step=0.07, v=0.35)
place(sfx, swept(1.6, 300, 900, bw=0.6, gain=0.05), 126.9, pan=-0.1)
place(sfx, ding(nf('C6'), 0.7), 128.6)
place(sfx, ding(nf('G6'), 0.6), 128.68)
place(sfx, plink(nf('E7'), 0.5), 128.62, pan=0.3)
place(sfx, swept(0.8, 400, 1500, bw=0.5, gain=0.04), 128.9)
place(sfx, bell(nf('C6'), 0.35), 130.15, pan=0.3)

# ======================================================================
# 133.6 – 157.6 黑屋子难题
# ======================================================================
place(sfx, scratch(1.0), 133.62)
place(sfx, thump(0.5), 133.7)
place(music, pad([nf(x) for x in ['A1', 'E2', 'A2']], 14.9, 0.6, att=1.5, rel=0.6, bright=0.65), 135.3)
for k in range(15):
    place(dry, tick(k % 2 == 0, 1.2), 135.5 + k, pan=-0.5)
place(sfx, snore(1.4, 0.8), 136.0, pan=-0.3)
place(sfx, snore(1.4, 0.7), 137.9, pan=-0.3)
place(music, piano(nf('A1'), 2.5, 0.5), 139.4)
place(music, piano(nf('Eb2'), 2.5, 0.35), 139.4)
place(sfx, swept(0.7, 3000, 300, bw=0.5, gain=0.08), 141.8)
for k in range(10):
    place(dry, tick(k % 2 == 0, 0.8), 141.85 + k * 0.05, pan=-0.5)
for tt in [142.6, 144.6]:
    place(sfx, growl(1.0), tt, pan=-0.2)
for t0 in [142.4, 143.0, 143.6, 144.2]:
    place(sfx, beep(392, 0.1, 0.9), t0, pan=-0.2)
    place(sfx, beep(370, 0.14, 0.9), t0 + 0.11, pan=-0.2)
place(music, pad([nf(x) for x in ['E3', 'F3', 'Bb3']], 4.3, 0.35, att=3.5, rel=0.5, vib=0.01), 142.0)
place(sfx, swept(4.0, 200, 1200, bw=0.6, gain=0.06, shape=lambda u: u ** 2), 142.0)
place(music, pad([nf(x) for x in ['D3', 'E3', 'A3']], 4.3, 0.55, att=1.0, rel=0.5), 146.0)
place(sfx, swept(1.5, 3000, 8000, bw=0.3, gain=0.03), 146.4)
for k, nm in enumerate(['A4', 'D5']):
    place(music, musicbox(nf(nm), 0.4), 147.0 + k * 0.6)
# 150 开门
place(sfx, creak(0.9, 1.0), 149.95, pan=0.3)
place(sfx, swept(1.6, 300, 9000, bw=0.6, gain=0.12, shape=lambda u: np.exp(-u * 2.5) * np.minimum(1, u * 20)), 150.3)
place(sfx, crash(0.5), 150.4)
place(music, pad([nf(x) for x in ['C3', 'G3', 'E4', 'D5']], 2.6, 0.55, att=0.3, rel=1.2, bright=1.3), 150.3)
bed(150.3, ['C', 'G', 'Am', 'F'], arp=0.32, kick_v=0.28, hat_v=0.5, pad_v=0.3, sub_v=0.28, stop=158.0, bright=1.2)
for k in range(8):
    place(sfx, footstep(0.9), 151.25 + k * 0.33, pan=-0.2 + 0.06 * k)
sparkle(155.6, base=nf('C7'), n=6, step=0.07, v=0.6)
place(sfx, bell(nf('G6'), 0.4), 155.65, pan=0.3)
place(music, pad([nf(x) for x in ['F2', 'C3', 'A3', 'E4']], 2.0, 0.5, att=0.2, rel=1.4), 157.5)

# ======================================================================
# 159.6 结尾回扣：同样的弹球，同样的位置停下
# ======================================================================
bounce_sequence(rep, REPLAY0, 0.8)
# 162.3 之后：温暖的回归
place(music, pad([nf(x) for x in ['C3', 'G3', 'E4', 'D5']], 6.4, 0.65, att=1.0, rel=1.5, bright=1.0), 162.3)
place(music, piano(nf('C3'), 3.0, 0.3), 162.4, pan=-0.2)
place(sfx, ding(nf('C6'), 0.7), 165.15)
place(sfx, ding(nf('E6'), 0.5), 165.22)
place(sfx, ding(nf('G6'), 0.45), 165.3)

# ======================================================================
# 168.4 – 186 从细胞到你 / 循环 / 片尾
# ======================================================================
bed(168.4, ['F', 'G', 'Am', 'F'], arp=0.3, kick_v=0.0, pad_v=0.32, sub_v=0.25, stop=178.1)
for k, nm in enumerate(['C5', 'E5', 'G5', 'C6']):
    place(sfx, pluck(nf(nm), 0.7, bright=1.4), 168.6 + k * 0.6, pan=-0.5 + 0.33 * k)
for k in range(6):
    place(dry, kick(0.22), 171.5 + k * 1.111)
for t0, nm in [(174.6, 'C5'), (175.5, 'E5'), (176.4, 'G5')]:
    place(sfx, bell(nf(nm), 0.5, 2.5), t0, pan=0.1)
for k in range(5):
    place(music, musicbox(nf(['C6', 'E6', 'G6', 'C7', 'G6'][k]), 0.4), 177.0 + k * 0.22, pan=0.3)
# 178.1 片尾
place(sfx, crash(0.35), 178.1)
place(music, pad([nf(x) for x in ['C2', 'G2', 'E3', 'B3', 'D4', 'G4']], 7.9, 0.6, att=0.6, rel=4.0, bright=1.1), 178.05)
for k, nm in enumerate(['C2', 'G2', 'E3', 'B3', 'D4', 'G4', 'E5']):
    place(music, piano(nf(nm), 4.5, 0.32 if k else 0.45), 178.1 + k * 0.09, pan=-0.2 + 0.07 * k)
for k, nm in enumerate(['G6', 'E6', 'D6', 'B5', 'G5']):
    place(music, musicbox(nf(nm), 0.35), 179.3 + k * 0.45, pan=0.3)
place(music, bell(nf('C6'), 0.3, 4.0), 181.5, pan=-0.2)


# ---------------- 混响与混音 ----------------
def reverb_ir(length=2.8, seed=0, decay=0.75):
    r = np.random.default_rng(seed)
    t = tvec(length)
    ir = r.standard_normal(len(t)) * np.exp(-t / decay)
    ir = lp(ir, 5000) * 0.9 + lp(ir, 1500) * 0.3
    ir[:int(0.018 * SR)] = 0
    return ir / np.sqrt(np.sum(ir ** 2))


irL, irR = reverb_ir(seed=1), reverb_ir(seed=2)
sL, sR = reverb_ir(1.2, 3, 0.25), reverb_ir(1.2, 4, 0.25)


def with_reverb(bus, wet, a, b):
    m = bus[0] + bus[1]
    return np.stack([bus[0] + fftconvolve(m, a)[:N] * wet * 0.5, bus[1] + fftconvolve(m, b)[:N] * wet * 0.5])


mix = with_reverb(music, 0.42, irL, irR) + with_reverb(sfx, 0.2, irL, irR) + dry


def cut_after(bus_wet, t_end):
    i = int(round(t_end * SR))
    bus_wet[:, i:] = 0
    r = int(0.0015 * SR)
    bus_wet[:, i - r:i] *= np.linspace(1, 0, r)
    return bus_wet


hk = cut_after(with_reverb(hook, 0.15, sL, sR), TF)
rp = cut_after(with_reverb(rep, 0.15, sL, sR), REPLAY0 + TF)
rp[:, :int(REPLAY0 * SR) - 10] = 0
mix += hk + rp

# 两次定格：绝对静音
DRIVE = 2.6
tt = np.arange(N) / SR
gate = np.ones(N)
for a, b in [(TF, HOOK_UNFREEZE), (REPLAY0 + TF, REPLAY_UNFREEZE)]:
    gate *= np.clip(np.maximum((a - tt) / 0.0015, (tt - b) / 0.003), 0, 1)
mix = hp(mix, 28)
peak = np.abs(mix).max()
mix = mix / peak
mix = np.tanh(mix * DRIVE) / np.tanh(DRIVE) * 0.89
mix *= gate
mix[:, :int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
tail = int(1.4 * SR)
mix[:, -tail:] *= np.linspace(1, 0, tail) ** 1.5
out = sys.argv[1] if len(sys.argv) > 1 else 'audio.wav'
wavfile.write(out, SR, (mix.T * 32767).astype(np.int16))
print('wrote', out, 'peak', round(float(np.abs(mix).max()), 3), 'TF', round(TF, 4))
