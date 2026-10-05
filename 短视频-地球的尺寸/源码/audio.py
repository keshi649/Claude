"""《地球的尺寸》配乐与音效 —— 全部用 numpy 合成，时间轴读 timeline.json，与画面对齐。
参考片没有配音，只有配乐，所以这里的音乐是主角：每一章换一种织体，但都在同一个调性家族里。
用法：python3 audio.py out.wav
"""
import json
import os
import sys

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, 'timeline.json'), encoding='utf-8'))
LINE = {l['id']: l for l in TL['lines']}
SCN = {s['name']: s for s in TL['scenes']}
T = lambda i: LINE[i]['t0']
TE = lambda i: LINE[i]['t1']
S0 = lambda n: SCN[n]['t0']
S1 = lambda n: SCN[n]['t1']

SR = 44100
DUR = TL['duration']
N = int(SR * DUR)
rng = np.random.default_rng(7)

music = np.zeros((2, N))   # 音乐总线（混响多）
sfx = np.zeros((2, N))     # 音效总线（混响少）
dry = np.zeros((2, N))     # 干声


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
    length = min(dur + 1.8, 6.5)
    t = tvec(length)
    out = np.zeros_like(t)
    tau0 = float(np.clip(2.2 * (261.6 / f) ** 0.5, 0.7, 5.0))
    for k in range(1, 10):
        fk = k * f * np.sqrt(1 + 0.00035 * k * k)
        if fk > 14000:
            break
        a = (1 / k ** 1.2) * (0.35 + 0.45 * vel) ** (k - 1)
        out += a * np.sin(2 * np.pi * fk * t + rng.uniform(0, 6.28)) * np.exp(-t / (tau0 / (1 + 0.5 * (k - 1))))
    out *= 0.55 * np.exp(-t / 0.35) + 0.45
    out *= np.minimum(1, t / 0.003) * np.clip((dur + 0.8 + 0.4 - t) / 0.4, 0, 1)
    return out * vel * 0.22


def pluck(f, vel=0.5, length=1.4, bright=1.0):
    t = tvec(length)
    out = np.zeros_like(t)
    for k in range(1, 10):
        if k * f > 12000:
            break
        out += (1 / k ** (1.6 / bright)) * np.sin(2 * np.pi * k * f * t) * np.exp(-t * (2.0 + 2.0 * k / bright))
    out *= np.minimum(1, t / 0.002)
    return out * vel * 0.16


def harp(f, vel=0.5):
    return pluck(f, vel, length=2.4, bright=1.5)


def qin(f, vel=0.5):
    """古琴似的拨弦：起音略低、滑到正音，衰减长，泛音少。"""
    t = tvec(3.0)
    fr = f * (1 - 0.025 * np.exp(-t / 0.05))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    out = np.zeros_like(t)
    for k, a in [(1, 1), (2, .45), (3, .22), (4, .12), (5, .06)]:
        out += a * np.sin(k * ph) * np.exp(-t * (0.9 + 0.7 * k))
    out += 0.3 * bp(noise(3.0), 800, 4000) * np.exp(-t / 0.006)
    return out * np.minimum(1, t / 0.003) * vel * 0.2


def harpsi(f, vel=0.5):
    t = tvec(1.1)
    out = np.zeros_like(t)
    for k in range(1, 14):
        if k * f > 13000:
            break
        out += (1 / k ** 0.9) * np.sin(2 * np.pi * k * f * t + k) * np.exp(-t * (3.5 + 0.9 * k))
    out += 0.2 * hp(noise(1.1), 3000) * np.exp(-t / 0.004)
    return out * np.minimum(1, t / 0.001) * vel * 0.09


def musicbox(f, vel=0.5):
    t = tvec(2.2)
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
        for det in (-7, 0, 7):
            fd = f * 2 ** (det / 1200)
            hmax = int(min(10, 6000 / fd))
            ph = 2 * np.pi * fd * t + rng.uniform(0, 6.28)
            if vib:
                ph = ph + (vib * fd / 5.2) * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 1.0)
            for h in range(1, hmax + 1):
                out += (1 / h) * np.exp(-h * 0.28 / bright) * np.sin(h * ph)
    env = np.minimum(1, t / att) * np.clip((dur - t) / rel, 0, 1)
    out *= env * (1 + 0.08 * np.sin(2 * np.pi * 0.21 * t))
    return out * vel * 0.03 / max(1, len(freqs)) ** 0.5


def sub(f, dur, vel=0.5, att=0.05, rel=0.6):
    t = tvec(dur)
    out = np.sin(2 * np.pi * f * t) + 0.2 * np.sin(4 * np.pi * f * t)
    out *= np.minimum(1, t / att) * np.clip((dur - t) / rel, 0, 1)
    return out * vel * 0.2


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


def whoosh(dur=0.8, up=True, v=1.0):
    return swept(dur, 300 if up else 2500, 2500 if up else 300, 0.6, 0.16 * v)


def riser(dur, v=1.0):
    return swept(dur, 200, 6000, 0.5, 0.2 * v, shape=lambda u: u ** 2.2 * np.clip((1 - u) / 0.03, 0, 1))


def thump(v=1.0):
    t = tvec(0.6)
    out = np.sin(2 * np.pi * (55 + 70 * np.exp(-t / 0.03)) * t) * np.exp(-t / 0.15)
    out += 0.5 * lp(noise(0.6), 900) * np.exp(-t / 0.02)
    return out * v * 0.4


def boom(v=1.0, length=3.0):
    t = tvec(length)
    fr = 30 + 46 * np.exp(-t / 0.3)
    out = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.9)
    out += 0.6 * lp(noise(length), 260, 3) * np.exp(-t / 0.25)
    return out * v * 0.5


def crash(v=1.0, length=4.0):
    t = tvec(length)
    out = hp(noise(length), 3500) * (np.exp(-t / 1.2) * 0.7 + np.exp(-t / 0.08) * 0.5)
    return out * v * 0.06


def tom(v=1.0, f=72):
    t = tvec(0.7)
    out = np.sin(2 * np.pi * np.cumsum(f + 40 * np.exp(-t / 0.04)) / SR) * np.exp(-t / 0.22)
    out += 0.25 * lp(noise(0.7), 1500) * np.exp(-t / 0.015)
    return out * v * 0.3


def shaker(v=1.0):
    t = tvec(0.09)
    return bp(noise(0.09), 5000, 11000) * np.sin(np.pi * t / 0.09) ** 2 * v * 0.05


def wood(v=1.0, f=900):
    t = tvec(0.25)
    out = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.03) + 0.6 * np.sin(2 * np.pi * f * 2.3 * t) * np.exp(-t / 0.015)
    out += 0.7 * bp(noise(0.25), 600, 3000) * np.exp(-t / 0.008)
    return out * v * 0.18


def thock(v=1.0):
    """木棍插进土里。"""
    t = tvec(0.5)
    out = np.sin(2 * np.pi * (140 + 120 * np.exp(-t / 0.02)) * t) * np.exp(-t / 0.08)
    out += 0.7 * lp(noise(0.5), 1400) * np.exp(-t / 0.03)
    out += 0.25 * bp(noise(0.5), 2000, 6000) * np.exp(-t / 0.12) * (rng.random(len(t)) > 0.7)
    return out * v * 0.4


def tick(hi=True, v=1.0):
    t = tvec(0.05)
    f = 2600 if hi else 2000
    out = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.006) + 0.6 * hp(noise(0.05), 2000) * np.exp(-t / 0.002)
    return out * v * 0.05


def clock(v=1.0, hi=True):
    t = tvec(0.12)
    f = 1500 if hi else 1150
    out = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.012) + 0.5 * bp(noise(0.12), 1500, 5000) * np.exp(-t / 0.004)
    return out * v * 0.06


def plink(f=2093, v=1.0):
    t = tvec(0.7)
    out = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t) + 0.3 * np.sin(2 * np.pi * f * 2.7 * t)) * np.exp(-t / 0.14)
    return out * v * 0.08


def ding(f=1568, v=1.0):
    t = tvec(1.8)
    out = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t) * np.exp(-t / 0.3)
           + 0.25 * np.sin(2 * np.pi * f * 3.0 * t) * np.exp(-t / 0.15)) * np.exp(-t / 0.6)
    return out * np.minimum(1, t / 0.002) * v * 0.08


def metal(v=1.0):
    """铂金尺被拿起时的那一声长鸣。"""
    t = tvec(5.0)
    out = np.zeros_like(t)
    for r, a, tau in [(1, 1, 3.5), (2.32, .6, 2.6), (4.25, .4, 1.6), (6.63, .25, 1.0), (9.38, .15, .6)]:
        out += a * np.sin(2 * np.pi * 523 * r * t + r) * np.exp(-t / tau)
    out *= np.minimum(1, t / 0.004)
    return out * v * 0.06


def paper(v=1.0, dur=0.45):
    t = tvec(dur)
    env = np.abs(np.sin(2 * np.pi * 9 * t)) ** 3 * np.sin(np.pi * t / dur)
    return bp(noise(dur), 1500, 8000) * env * v * 0.12


def pen(dur=0.8, v=1.0):
    t = tvec(dur)
    env = (0.5 + 0.5 * np.sin(2 * np.pi * 11 * t)) * np.sin(np.pi * t / dur) ** 0.5
    return bp(noise(dur), 2500, 7000) * env * v * 0.07


def wind(dur, v=1.0):
    t = tvec(dur)
    x = lp(noise(dur), 900, 2)
    mod = 0.6 + 0.4 * np.sin(2 * np.pi * 0.13 * t + 1) * np.sin(2 * np.pi * 0.07 * t)
    return x * mod * np.minimum(1, t / 1.5) * np.clip((dur - t) / 1.5, 0, 1) * v * 0.25


def shimmer(t0, base=2093, n=6, step=0.07, v=0.8, bus=None):
    ratios = [1, 1.26, 1.5, 2, 2.52, 3, 4]
    for k in range(n):
        place(bus if bus is not None else sfx, plink(base * ratios[k % len(ratios)], v * (1 - k * 0.08)), t0 + k * step, 1.0, pan=-0.5 + 0.18 * k)


def stamp_sfx(t0, v=1.0):
    place(dry, thump(1.3 * v), t0)
    place(sfx, boom(0.55 * v, 2.0), t0)
    place(sfx, paper(0.6 * v, 0.2), t0)


# ---------------- 编曲 ----------------
CH = {
    'Dm': (['D2'], ['D3', 'A3', 'F4'], ['D4', 'F4', 'A4', 'D5', 'A4', 'F4']),
    'Bb': (['Bb1'], ['Bb2', 'F3', 'D4'], ['Bb3', 'D4', 'F4', 'Bb4', 'F4', 'D4']),
    'F': (['F2'], ['F2', 'C3', 'A3', 'C4'], ['F3', 'A3', 'C4', 'F4', 'C4', 'A3']),
    'C': (['C2'], ['C3', 'G3', 'E4'], ['C4', 'E4', 'G4', 'C5', 'G4', 'E4']),
    'Gm': (['G1'], ['G2', 'D3', 'Bb3'], ['G3', 'Bb3', 'D4', 'G4', 'D4', 'Bb3']),
    'A': (['A1'], ['A2', 'E3', 'C#4'], ['A3', 'C#4', 'E4', 'A4', 'E4', 'C#4']),
    'Am': (['A1'], ['A2', 'E3', 'C4'], ['A3', 'C4', 'E4', 'A4', 'E4', 'C4']),
    'G': (['G1'], ['G2', 'D3', 'B3'], ['G3', 'B3', 'D4', 'G4', 'D4', 'B3']),
    'Cm': (['C2'], ['C3', 'G3', 'Eb4'], ['C4', 'Eb4', 'G4', 'C5', 'G4', 'Eb4']),
    'Ab': (['Ab1'], ['Ab2', 'Eb3', 'C4'], ['Ab3', 'C4', 'Eb4', 'Ab4', 'Eb4', 'C4']),
    'Eb': (['Eb2'], ['Eb3', 'Bb3', 'G4'], ['Eb4', 'G4', 'Bb4', 'Eb5', 'Bb4', 'G4']),
    'G7': (['G1'], ['G2', 'D3', 'B3', 'F4'], ['G3', 'B3', 'D4', 'F4', 'D4', 'B3']),
    'D': (['D2'], ['D3', 'A3', 'F#4'], ['D4', 'F#4', 'A4', 'D5', 'A4', 'F#4']),
    'C/E': (['E2'], ['E3', 'G3', 'C4'], ['E4', 'G4', 'C5', 'E5', 'C5', 'G4']),
}
INST = {'harp': harp, 'harpsi': harpsi, 'pluck': lambda f, v: pluck(f, v, 1.6, 1.1), 'musicbox': lambda f, v: musicbox(f * 2, v * 1.1),
        'piano': lambda f, v: piano(f, 0.6, v)}


def section(t0, t1, prog, cd, pad_v=0.32, arp=None, arp_v=0.3, step=0.33, bass_v=0.22, bright=1.0, vib=0.0, pattern=None,
            fade_in=0.0, fade_out=0.0):
    """在 [t0, t1) 里按和弦进行铺底：长音垫子 + 低音 + （可选）琶音。"""
    b = 0
    tb = t0
    while tb < t1 - 0.05:
        name = prog[b % len(prog)]
        bass, padn, ar = CH[name]
        d = min(cd, t1 - tb)
        u_in = 1 if fade_in <= 0 else min(1, (tb - t0 + 0.01) / fade_in)
        u_out = 1 if fade_out <= 0 else min(1, (t1 - tb) / fade_out)
        g = max(0.15, min(u_in, u_out))
        place(music, pad([nf(x) for x in padn], d + 1.2, pad_v * g, att=0.7, rel=1.2, bright=bright, vib=vib), tb - 0.1)
        if bass_v:
            place(music, sub(nf(bass[0]), d + 0.2, bass_v * g), tb)
        if arp:
            seq = pattern or [0, 1, 2, 3, 4, 5]
            k = 0
            tt = tb
            while tt < tb + d - 0.05:
                note = ar[seq[k % len(seq)]]
                if note:
                    place(music, INST[arp](nf(note), arp_v * g * (1.0 if k % len(seq) == 0 else 0.8)), tt, pan=-0.35 + 0.7 * ((k * 3) % 5) / 4)
                k += 1
                tt += step
        b += 1
        tb += cd


def melody(seq, inst='piano', vel=0.3, pan=0.1):
    for t0, name, d in seq:
        if name is None:
            continue
        if inst == 'piano':
            place(music, piano(nf(name), d, vel), t0, pan=pan)
        elif inst == 'musicbox':
            place(music, musicbox(nf(name), vel), t0, pan=pan)
        elif inst == 'bell':
            place(music, bell(nf(name), vel, 3.0), t0, pan=pan)
        elif inst == 'qin':
            place(music, qin(nf(name), vel), t0, pan=pan)


def phrase(t0, notes, step, inst='piano', vel=0.3, pan=0.1):
    melody([(t0 + i * step, n, step * 1.6) for i, n in enumerate(notes)], inst, vel, pan)


def ease_inout(u):
    return 4 * u ** 3 if u < 0.5 else 1 - (-2 * u + 2) ** 3 / 2


def count_times(a, b, n):
    """画面上 floor(lerp(0, n, easeInOut(seg(t,a,b)))) 每次 +1 的时刻。"""
    out, last = [], 0
    for tt in np.linspace(a, b, 2000):
        k = int(np.floor(n * ease_inout((tt - a) / (b - a))))
        if k > last:
            out += [tt] * (k - last)
            last = k
    return out


# ======================================================================
# 开场：钟摆似的嘀嗒、稀疏钢琴、子午圈描出来时的亮音
# ======================================================================
t4 = T('o4')
place(music, pad([nf('D2'), nf('A2'), nf('D3')], t4 + 1.0, 0.5, att=3.0, rel=2.0, bright=0.6), 0.2)
for i, tt in enumerate(np.arange(0.6, t4 - 0.2, 0.75)):
    place(sfx, clock(0.55 + 0.15 * (i % 2 == 0), hi=i % 2 == 0), tt, pan=0.25 if i % 2 else -0.25)
phrase(1.3, ['A4', None, 'D5', None, 'E5', 'F5', None, None, 'E5', None, 'D5', None, 'A4', None, 'C5', None, 'D5', None, None, None,
             'F5', None, 'E5', None, 'D5'], 0.62, 'piano', 0.26)
# 子午圈一路描过去
for k, tt in enumerate(np.linspace(T('o1') + 0.3, T('o1') + 3.3, 12)):
    place(sfx, musicbox(nf(['D5', 'E5', 'F5', 'A5', 'C6', 'D6'][k % 6]) * (1 if k < 6 else 2), 0.35), tt, pan=-0.4 + k * 0.07)
for k in range(3):
    place(sfx, tick(True, 1.2), T('o2') + 0.7 + k * 0.06)
place(music, bell(nf('D3'), 0.45, 4.0), T('o3') + 0.2)
place(music, sub(nf('D2'), 2.5, 0.3), T('o3') + 0.2)
# 木棍落地
place(sfx, whoosh(0.6, False, 0.5), t4 + 0.3)
place(dry, thock(1.0), t4 + 0.9)
place(music, pad([nf('Bb2'), nf('F3'), nf('D4')], S1('open') - t4 + 0.8, 0.42, att=2.0, rel=1.0, bright=0.8), t4 + 0.6)
place(music, sub(nf('Bb1'), S1('open') - t4, 0.22, att=1.5), t4 + 0.8)
for k, tt in enumerate(np.arange(t4 + 1.6, S1('open') - 0.3, 0.9)):
    place(music, harp(nf(['F4', 'Bb4', 'D5', 'C5'][k % 4]), 0.3), tt, pan=0.2)
for i in range(5):
    place(sfx, plink(nf('A6') * [1, 1.12, 1.26, 1.5, 1.68][i], 0.5), T('o6') + 0.8 + i * 0.15, pan=-0.4 + i * 0.2)
place(sfx, riser(4.0, 1.0), S1('open') - 4.0)

# ======================================================================
# 片名：一声低沉的落地，F 大调和弦铺开
# ======================================================================
tt0 = S0('title')
place(dry, boom(1.0, 3.5), tt0)
place(sfx, crash(1.0), tt0)
place(music, pad([nf('F2'), nf('C3'), nf('A3'), nf('C4'), nf('G4')], 6.8, 0.75, att=0.08, rel=2.2, bright=1.2), tt0)
place(music, sub(nf('F1'), 5.0, 0.4, att=0.02, rel=2.5), tt0)
for k, n in enumerate(['F5', 'A5', 'C6', 'G5', 'A5']):
    place(music, bell(nf(n), 0.35, 3.5), tt0 + 0.4 + k * 0.13, pan=-0.4 + 0.2 * k)
melody([(tt0 + 2.6, 'C5', 1.5), (tt0 + 3.4, 'A4', 1.5), (tt0 + 4.2, 'G4', 1.2), (tt0 + 4.9, 'F4', 2.5)], 'piano', 0.3)

# ======================================================================
# 第一章：竖琴琶音，Dm – Bb – F – C
# ======================================================================
a, b = S0('era1'), S1('era1')
section(a + 0.2, b + 0.4, ['Dm', 'Bb', 'F', 'C'], 3.9, pad_v=0.3, arp='harp', arp_v=0.28, step=0.325, fade_in=4, fade_out=2)
for tt in np.arange(a + 0.2, b - 0.5, 1.95):
    place(dry, tom(0.35, 66), tt)
place(sfx, ding(2093, 0.9), T('e1') + 1.5)
shimmer(T('e1') + 1.6, 2637, 4, 0.08, 0.5)
place(sfx, whoosh(0.5, False, 0.4), T('e2') + 1.2)
place(sfx, whoosh(0.9, True, 0.6), T('e3') - 0.1)
for k in range(50):
    if k % 5 == 0:
        place(sfx, tick(k % 10 == 0, 0.6), T('e3') + 1.0 + k * 0.025)
place(music, bell(nf('A5'), 0.4), T('e4') + 1.4, pan=-0.3)
place(music, bell(nf('A5'), 0.4), T('e4') + 1.65, pan=0.3)
place(dry, thump(0.6), T('e5') + 0.1)
for k, tt in enumerate(count_times(T('e5') + 1.0, T('e5') + 3.4, 50)):
    place(sfx, tick(k % 5 == 4, 0.9), tt, pan=-0.3 + 0.6 * (k % 2))
place(music, piano(nf('D3'), 2.0, 0.45), T('e6') + 0.1)
place(music, piano(nf('A3'), 2.0, 0.4), T('e6') + 0.12)
place(music, piano(nf('F4'), 2.0, 0.4), T('e6') + 0.14)
place(music, piano(nf('E5'), 2.0, 0.35), T('e6') + 0.16)
place(sfx, whoosh(0.7, True, 0.4), T('e7') + 0.3)
place(sfx, ding(1318, 0.8), T('e8') + 0.2)

# ======================================================================
# 第二章：五声音阶的拨弦（古琴似），低音持续
# ======================================================================
a, b = S0('era2'), S1('era2')
pen_scale = ['D4', 'F4', 'G4', 'A4', 'C5', 'D5', 'F5', 'G5', 'A5']
place(music, pad([nf('D2'), nf('A2')], b - a + 1.0, 0.45, att=2.5, rel=2.0, bright=0.5), a)
section(a + 0.3, T('t7') + 0.12, ['Dm', 'Dm', 'Gm', 'Dm'], 4.4, pad_v=0.2, bass_v=0.0, bright=0.7, fade_in=4)
idx = [0, 2, 3, 4, None, 3, 2, 0, None, None, 1, 2, 3, None, 5, 4, 3, None, None, None]
tt = a + 1.2
k = 0
while tt < T('t7') - 0.2:
    i = idx[k % len(idx)]
    if i is not None:
        place(music, qin(nf(pen_scale[i]), 0.42), tt, pan=-0.2 + 0.1 * (i % 4))
    k += 1
    tt += 0.58
for i in range(4):
    place(sfx, wood(0.9, 820 + i * 60), T('t3') + 0.5 + i * 0.35 + 0.45, pan=-0.6 + 0.4 * i)
for i in range(4):
    place(sfx, whoosh(0.45, False, 0.25), T('t4') + 0.3 + i * 0.3, pan=-0.6 + 0.4 * i)
place(sfx, whoosh(0.8, True, 0.4), T('t5') + 0.1)
place(sfx, whoosh(0.5, True, 0.3), T('t6') + 0.6)
place(sfx, whoosh(0.7, True, 0.35), T('t6') + 1.2)
place(sfx, riser(1.2, 0.5), T('t7') + 0.34 - 1.2)
stamp_sfx(T('t7') + 0.34)
# 盖章之后，音乐换一口气：北极星
section(T('t8') - 0.2, b + 0.4, ['Dm', 'C', 'Bb', 'F'], 2.6, pad_v=0.28, arp='musicbox', arp_v=0.18, step=0.43, bass_v=0.15, bright=0.9,
        pattern=[3, 2, 1, 0], fade_in=2.0, fade_out=2.0)
shimmer(T('t8') + 0.2, 2637, 5, 0.09, 0.45)
for i, tt in enumerate([T('t8') + 0.6, T('t8') + 1.2, T('t8') + 1.9]):
    place(sfx, plink(nf(['A5', 'C6', 'D6'][i]), 0.6), tt)
place(music, bell(nf('D5'), 0.4), T('t9') + 0.2)

# ======================================================================
# 第三章：大键琴似的十六分音符，Am – F – C – G
# ======================================================================
a, b = S0('era3'), S1('era3')
section(a + 0.2, b + 0.4, ['Am', 'F', 'C', 'G'], 2.6, pad_v=0.24, arp='harpsi', arp_v=0.5, step=0.1625,
        pattern=[0, 2, 1, 2, 3, 2, 1, 2], bass_v=0.24, fade_in=3, fade_out=2)
steps = int((T('s2') + 0.2 - (T('s1') - 0.6)) / 0.32)
for k in range(steps):
    tt = T('s1') - 0.6 + (k + 1) * 0.32
    if tt > T('s2') + 0.2:
        break
    place(sfx, wood(0.45, 1400), tt, pan=-0.4 + 0.8 * k / max(1, steps))
place(sfx, whoosh(1.0, True, 0.35), T('s2') + 0.6)
place(sfx, plink(nf('E6'), 0.6), T('s3') + 0.3, pan=-0.4)
place(sfx, plink(nf('E6'), 0.6), T('s3') + 0.45, pan=0.4)
place(sfx, ding(1760, 0.9), T('s3') + 2.0)
for k, tt in enumerate(count_times(T('s4') + 0.3, T('s4') + 3.6, 33)):
    place(sfx, plink(nf('A5') * 2 ** (([0, 3, 5, 7, 10][k % 5] + k // 5) / 12), 0.32), tt, pan=-0.5 + (k % 7) / 6)
place(sfx, paper(0.8), T('s5') + 0.2)
place(music, sub(nf('E2'), 1.6, 0.3), T('s6') + 0.6)
place(sfx, wood(0.8, 520), T('s7') + 0.8)
place(sfx, ding(2637, 0.6), T('s7') + 1.7)
for k in range(12):
    place(sfx, tick(k % 4 == 0, 0.7), T('s8') + 0.2 + k * 0.11)
place(music, bell(nf('C6'), 0.3), T('s8') + 1.6)

# ======================================================================
# 第四章：远征 —— 定音鼓脉冲 + 弦乐垫子，Dm – Bb – Gm – A
# ======================================================================
a, b = S0('era4'), S1('era4')
q1 = T('p11')
section(a + 0.2, q1, ['Dm', 'Bb', 'Gm', 'A'], 3.2, pad_v=0.36, arp='pluck', arp_v=0.22, step=0.4, bass_v=0.28, vib=0.004,
        fade_in=3)
for tt in np.arange(a + 0.2, q1 - 0.3, 0.4):
    k = int(round((tt - a - 0.2) / 0.4))
    if tt > T('p5'):
        place(dry, tom(0.45 if k % 4 == 0 else 0.25, 62), tt)
        place(dry, shaker(0.8), tt + 0.2)
    elif k % 4 == 0:
        place(dry, tom(0.35, 62), tt)
place(sfx, whoosh(1.0, True, 0.5), T('p2') + 0.9)
place(sfx, ding(1046, 0.6), T('p3') + 0.2)
place(sfx, ding(1396, 0.6), T('p4') + 0.6)
place(dry, thump(0.5), T('p4') + 0.2)
place(sfx, whoosh(2.0, True, 0.5), T('p6') + 0.1, pan=-0.4)
place(sfx, whoosh(2.0, False, 0.5), T('p6') + 0.3, pan=0.4)
place(music, bell(nf('A5'), 0.4), T('p7') + 0.4, pan=-0.3)
place(music, bell(nf('D4'), 0.45), T('p7') + 0.6, pan=0.3)
place(sfx, whoosh(0.5, True, 0.3), T('p8') + 0.2)
place(sfx, whoosh(1.6, True, 0.3), T('p8') + 0.8)
for i in range(3):
    place(sfx, plink(nf(['D6', 'F#6', 'A6'][i]), 0.6), T('p9') + 0.4 + i * 0.35)
# 牛顿赢了：转到 D 大调
stamp_sfx(T('p10') + 0.72, 0.7)
place(dry, thump(0.8), T('p10') + 1.02)
place(music, pad([nf('D3'), nf('A3'), nf('F#4'), nf('A4')], 3.2, 0.6, att=0.05, rel=1.5), T('p10') + 0.7)
place(sfx, crash(0.6), T('p10') + 0.72)
# 伏尔泰：风声 + 八音盒
place(sfx, wind(b - q1 + 1.5, 0.9), q1 - 0.3)
place(music, pad([nf('D3'), nf('A3'), nf('E4')], b - q1 + 1.5, 0.35, att=1.5, rel=1.5, bright=0.7), q1 - 0.2)
phrase(q1 + 0.6, ['A5', 'F5', 'E5', 'D5', None, 'C5', 'D5', 'E5', 'A4', None, None, 'D5', 'E5', 'F5', 'E5', None, 'D5'], 0.5, 'musicbox', 0.35)

# ======================================================================
# 第五章：大革命 —— C 小调的钢琴固定音型 + 定音鼓
# ======================================================================
a, b = S0('era5'), S1('era5')
m7 = T('m7')
section(a + 0.2, m7, ['Cm', 'Ab', 'Eb', 'G7'], 2.8, pad_v=0.32, arp='piano', arp_v=0.2, step=0.35, pattern=[0, 2, 1, 2, 3, 2, 1, 2],
        bass_v=0.3, fade_in=2.5)
for tt in np.arange(a + 0.2, m7 - 0.3, 0.7):
    place(dry, tom(0.38, 58), tt)
for i in range(9):
    place(sfx, wood(0.6, 700 + 90 * (i % 5)), a + 0.4 + i * 0.12 + 0.2, pan=-0.6 + 0.15 * i)
place(sfx, whoosh(0.8, False, 0.5), T('m2') - 0.1)
shimmer(T('m2') + 0.6, 2093, 6, 0.08, 0.5)
place(music, bell(nf('Eb5'), 0.4), T('m2') + 1.4)
place(sfx, riser(1.4, 0.4), T('m3') + 0.1)
place(sfx, ding(2349, 0.8), T('m3') + 1.8)
for k in range(9):
    place(sfx, plink(nf(['C6', 'Eb6', 'G6'][k % 3]), 0.35), T('m4') + 0.8 + k * 0.45, pan=-0.4 if k % 2 else 0.4)
for k in range(9):
    place(sfx, plink(nf(['G5', 'C6', 'Eb6'][k % 3]), 0.35), T('m5') + 0.2 + k * 0.45, pan=-0.4 if k % 2 else 0.4)
place(dry, thump(0.6), T('m5') + 0.6)
place(dry, thump(0.6), T('m5') + 1.4)
place(music, bell(nf('C5'), 0.5), TE('m5') - 0.6)
place(music, bell(nf('G5'), 0.4), TE('m5') - 0.5)
place(sfx, metal(1.0), T('m6') + 0.3)
place(sfx, swept(1.4, 3000, 9000, 0.4, 0.06), T('m6') + 1.0)
# 梅尚的秘密：音乐抽空，只剩低音和一个不协和的钢琴
place(music, pad([nf('C2'), nf('G2')], b - m7 + 1.0, 0.45, att=0.6, rel=1.5, bright=0.5), m7 - 0.2)
place(music, piano(nf('C4'), 2.5, 0.3), m7 + 0.3)
place(music, piano(nf('Db4'), 2.5, 0.25), m7 + 0.32)
place(music, piano(nf('G4'), 2.5, 0.22), m7 + 1.6)
place(music, piano(nf('Ab4'), 2.5, 0.2), m7 + 1.62)
place(sfx, pen(0.9, 1.0), m7 + 1.2)
place(sfx, ding(3136, 0.7), T('m8') + 1.0)
place(music, piano(nf('C5'), 2.0, 0.25), T('m8') + 1.2)
place(music, piano(nf('B4'), 2.0, 0.25), T('m8') + 2.0)

# ======================================================================
# 结尾：F 大调，温暖地落下来
# ======================================================================
a, b = S0('end'), S1('credits')
z4 = T('z4')
place(sfx, swept(1.6, 800, 9000, 0.4, 0.12, shape=lambda u: np.sin(np.pi * u) ** 1.2), T('z1') + 0.1)
shimmer(T('z1') + 1.5, 3136, 5, 0.06, 0.4)
section(a + 0.1, z4 + 1.0, ['F', 'C/E', 'Dm', 'Bb'], 3.6, pad_v=0.36, arp='harp', arp_v=0.24, step=0.45, bass_v=0.26, fade_in=3)
melody([(T('z2') + 0.3, 'A4', 1.0), (T('z2') + 1.2, 'C5', 1.0), (T('z2') + 2.1, 'F5', 1.6), (T('z2') + 3.6, 'E5', 1.0),
        (T('z3') + 0.3, 'D5', 1.0), (T('z3') + 1.2, 'C5', 1.0), (T('z3') + 2.1, 'A4', 1.6), (T('z3') + 3.6, 'Bb4', 1.0)], 'piano', 0.3)
for k, tt in enumerate(np.linspace(T('z2') + 0.2, T('z2') + 2.3, 12)):
    place(sfx, musicbox(nf(['F5', 'G5', 'A5', 'C6', 'D6', 'F6'][k % 6]) * (1 if k < 6 else 2), 0.3), tt, pan=-0.4 + k * 0.07)
place(music, bell(nf('F3'), 0.4, 4.0), T('z3') + 0.2)
place(sfx, riser(2.2, 0.6), z4 - 0.1)
fin = z4 + 2.2
place(dry, boom(0.6, 3.0), fin)
place(sfx, crash(0.7, 5.0), fin)
place(music, pad([nf('F2'), nf('C3'), nf('A3'), nf('C4'), nf('G4'), nf('A4')], b - fin, 0.7, att=0.1, rel=4.0, bright=1.1), fin)
place(music, sub(nf('F1'), b - fin - 1.0, 0.35, att=0.05, rel=3.0), fin)
for k, n in enumerate(['F5', 'A5', 'C6', 'G5', 'A5', 'F6']):
    place(music, bell(nf(n), 0.3, 4.0), fin + 0.1 + k * 0.16, pan=-0.5 + 0.2 * k)
melody([(fin + 1.6, 'C5', 1.5), (fin + 2.5, 'A4', 1.5), (fin + 3.4, 'G4', 1.2), (fin + 4.2, 'F4', 4.0)], 'piano', 0.28)
melody([(S0('credits') + 0.6, 'C6', 3.0), (S0('credits') + 1.4, 'A5', 3.0)], 'bell', 0.25)


# ---------------- 混响与混音 ----------------
def reverb_ir(length=3.2, seed=0, decay=0.9):
    r = np.random.default_rng(seed)
    t = tvec(length)
    ir = r.standard_normal(len(t)) * np.exp(-t / decay)
    ir = lp(ir, 5000) * 0.9 + lp(ir, 1500) * 0.3
    ir[:int(0.02 * SR)] = 0
    return ir / np.sqrt(np.sum(ir ** 2))


irL, irR = reverb_ir(seed=1), reverb_ir(seed=2)


def with_reverb(bus, wet):
    m = bus[0] + bus[1]
    return np.stack([bus[0] + fftconvolve(m, irL)[:N] * wet * 0.5, bus[1] + fftconvolve(m, irR)[:N] * wet * 0.5])


mix = with_reverb(music, 0.5) + with_reverb(sfx, 0.25) + dry
mix = hp(mix, 30)
DRIVE = 1.6
mix = mix / np.abs(mix).max()
mix = np.tanh(mix * DRIVE) / np.tanh(DRIVE) * 0.9
fi = int(0.5 * SR)
mix[:, :fi] *= np.linspace(0, 1, fi)
tail = int(2.0 * SR)
mix[:, -tail:] *= np.linspace(1, 0, tail) ** 1.5
out = sys.argv[1] if len(sys.argv) > 1 else 'audio.wav'
wavfile.write(out, SR, (mix.T * 32767).astype(np.int16))
print('wrote', out, round(DUR, 2), 's')
