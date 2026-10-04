"""《你不特别》配乐与音效 —— 全部用 numpy 合成，时间轴与 film.js 对齐。
用法：python3 audio.py out.wav
"""
import sys
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt
from scipy.io import wavfile

SR = 44100
DUR = 160.0
N = int(SR * DUR)
rng = np.random.default_rng(7)

music = np.zeros((2, N))   # 进混响的音乐总线
sfx = np.zeros((2, N))     # 音效总线（少量混响）
dry = np.zeros((2, N))     # 完全干声（滴答、点击）


def nf(name):
    """音名 -> 频率，如 'A4' 'C#5' 'Bb2'"""
    base = {'C': -9, 'D': -7, 'E': -5, 'F': -4, 'G': -2, 'A': 0, 'B': 2}[name[0]]
    rest = name[1:]
    if rest[0] == '#':
        base += 1; rest = rest[1:]
    elif rest[0] == 'b':
        base -= 1; rest = rest[1:]
    octave = int(rest)
    return 440.0 * 2 ** ((base + (octave - 4) * 12) / 12)


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


# ---------------- 乐器 ----------------
def piano(f, dur, vel=0.5, stacc=False):
    length = min(dur + 1.5, 7.0) if not stacc else 0.6
    t = tvec(length)
    out = np.zeros_like(t)
    tau0 = float(np.clip(2.0 * (261.6 / f) ** 0.5, 0.7, 5.0))
    for k in range(1, 12):
        fk = k * f * np.sqrt(1 + 0.00035 * k * k)
        if fk > 15000:
            break
        a = (1 / k ** 1.2) * (0.35 + 0.45 * vel) ** (k - 1)
        out += a * np.sin(2 * np.pi * fk * t + rng.uniform(0, 6.28)) * np.exp(-t / (tau0 / (1 + 0.5 * (k - 1))))
    out *= 0.55 * np.exp(-t / 0.35) + 0.45
    out += 0.08 * hp(rng.standard_normal(len(t)), 1500) * np.exp(-t / 0.006)
    out *= np.minimum(1, t / 0.003)
    rel = 0.12 if stacc else 0.35
    end = (0.16 if stacc else dur + 0.6)
    out *= np.clip((end + rel - t) / rel, 0, 1)
    return out * vel * 0.22


def musicbox(f, vel=0.5):
    t = tvec(2.2)
    out = (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.9)
           + 0.35 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t / 0.35)
           + 0.12 * np.sin(2 * np.pi * f * 4.07 * t) * np.exp(-t / 0.12)
           + 0.5 * np.sin(2 * np.pi * f * 1.003 * t) * np.exp(-t / 0.8))
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
            hmax = int(min(14, 7000 / fd))
            ph = 2 * np.pi * fd * t
            if vib:
                ph = ph + (vib * fd / 5.5) * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 1.0)
            for h in range(1, hmax + 1):
                out += (1 / h) * np.exp(-h * 0.22 / bright) * np.sin(h * ph + rng.uniform(0, 6.28))
    env = np.minimum(1, t / att) * np.clip((dur - t) / rel, 0, 1)
    out *= env * (1 + 0.08 * np.sin(2 * np.pi * 0.23 * t))
    return out * vel * 0.03 / max(1, len(freqs)) ** 0.5


def whistle(f, dur, vel=0.5, glide_from=None):
    t = tvec(dur + 0.15)
    fr = np.full_like(t, f)
    if glide_from:
        fr = f + (glide_from - f) * np.exp(-t / 0.04)
    fr = fr * (1 + 0.012 * np.sin(2 * np.pi * 5.8 * t) * np.minimum(1, t / 0.2))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    out = np.sin(ph) + 0.05 * np.sin(2 * ph)
    out += 0.03 * bp(rng.standard_normal(len(t)), f * 0.8, f * 1.3)
    env = np.minimum(1, t / 0.04) * np.clip((dur + 0.1 - t) / 0.1, 0, 1)
    return out * env * vel * 0.10


# ---------------- 音效 ----------------
def tick(hi=True):
    t = tvec(0.05)
    f = 2600 if hi else 2100
    out = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.006) + 0.6 * hp(rng.standard_normal(len(t)), 2000) * np.exp(-t / 0.002)
    return out * 0.05


def plink(f=2093, v=1.0):
    t = tvec(0.6)
    out = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t) + 0.3 * np.sin(2 * np.pi * f * 2.7 * t)) * np.exp(-t / 0.12)
    return out * v * 0.10


def click():
    t = tvec(0.06)
    out = np.sin(2 * np.pi * 1700 * t) * np.exp(-t / 0.01) + 0.8 * hp(rng.standard_normal(len(t)), 3000) * np.exp(-t / 0.0015)
    return out * 0.12


def pop(v=1.0, f0=420, f1=980):
    t = tvec(0.14)
    fr = f0 + (f1 - f0) * np.minimum(1, t / 0.05)
    out = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.045) * np.minimum(1, t / 0.003)
    return out * v * 0.10


def flick():
    t = tvec(0.09)
    out = bp(rng.standard_normal(len(t)), 1800, 7000) * np.exp(-t / 0.02) * np.minimum(1, t / 0.004)
    return out * 0.08


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
    out += 0.5 * lp(rng.standard_normal(len(t)), 900) * np.exp(-t / 0.02)
    out += 0.25 * bp(rng.standard_normal(len(t)), 2000, 6000) * np.exp(-t / 0.008)
    return out * v * 0.35


def rumble(dur, v=1.0):
    t = tvec(dur)
    x = lp(rng.standard_normal(len(t)), 160, 3)
    bumps = 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * (2 + 6 * t / dur) * t))
    env = np.minimum(1, t / 0.2) * np.clip((dur - t) / 0.5, 0, 1)
    return x * bumps * env * v * 0.9


def projector(dur):
    out = np.zeros(int(dur * SR))
    k = 0
    while True:
        t0 = k / 17.0
        if t0 >= dur - 0.05:
            break
        c = hp(rng.standard_normal(int(0.012 * SR)), 1200) * np.exp(-np.arange(int(0.012 * SR)) / SR / 0.003)
        i = int(t0 * SR)
        out[i:i + len(c)] += c * (0.6 + 0.4 * rng.random())
        k += 1
    t = np.arange(len(out)) / SR
    out *= np.minimum(1, t / 0.8) * np.clip((dur - t) / 0.8, 0, 1)
    return out * 0.018


def fall_whistle(dur=0.55):
    t = tvec(dur)
    fr = 1600 * (0.45 ** (t / dur))
    out = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.minimum(1, t / 0.05) * np.clip((dur - t) / 0.08, 0, 1)
    return out * 0.05


def sparkle(t0, base=2093, n=5, step=0.06, v=0.8, bus=None):
    ratios = [1, 1.26, 1.5, 2, 2.52, 3]
    for k in range(n):
        place(bus if bus is not None else sfx, plink(base * ratios[k % len(ratios)], v * (1 - k * 0.1)), t0 + k * step, 1.0, pan=-0.4 + 0.2 * k)


# ---------------- 编曲 ----------------
def chord_arp(t0, notes, step, n, vel=0.3, inst='piano', bus=None, ring=None):
    bus = music if bus is None else bus
    for k in range(n):
        f = nf(notes[k % len(notes)])
        if inst == 'piano':
            place(bus, piano(f, ring if ring else step * 2, vel), t0 + k * step, pan=-0.25)
        else:
            place(bus, musicbox(f, vel), t0 + k * step, pan=0.25 if k % 2 else -0.1)


def mel(seq, vel=0.32, pan=0.15):
    for t0, name, d in seq:
        place(music, piano(nf(name), d, vel), t0, pan=pan)


# 0–2.7：中性的安静开场
place(music, pad([nf('C3'), nf('G3'), nf('E4')], 3.2, 0.35, att=0.6, rel=0.8), 0.2)
place(music, piano(nf('E5'), 2.0, 0.25), 0.7, pan=0.2)

# 眼镜落下 + 滤镜开启
place(sfx, fall_whistle(), 1.65, pan=0.1)
for tt, v in [(2.09, 1.0), (2.38, 0.55), (2.53, 0.3)]:
    place(sfx, plink(2093, v), tt, pan=0.05)
place(dry, click(), 2.75)
place(sfx, swept(0.9, 900, 120, bw=0.5, gain=0.10), 2.7)

# 2.7–17.4：A 小调的“自怜”钢琴
A_CH = [('A2', ['A2', 'E3', 'C4', 'E3']), ('F2', ['F2', 'C3', 'A3', 'C3']), ('D2', ['D2', 'A2', 'F3', 'A2']), ('E2', ['E2', 'B2', 'G#3', 'B2'])]
for ci, (root, pat) in enumerate(A_CH):
    t0 = 3.0 + ci * 3.6
    for k, nm in enumerate(pat):
        place(music, piano(nf(nm), 1.8, 0.42 if k == 0 else 0.28), t0 + k * 0.9, pan=-0.2)
mel([(3.0, 'E5', 1.8), (4.8, 'D5', 0.9), (5.7, 'C5', 0.9), (6.6, 'C5', 1.8), (8.4, 'A4', 0.9), (9.3, 'C5', 0.9),
     (10.2, 'D5', 0.9), (11.1, 'C5', 0.9), (12.0, 'A4', 1.8), (13.8, 'B4', 1.8), (15.6, 'G#4', 0.9), (16.5, 'E4', 1.2)], vel=0.3)
for tt in (9.4, 10.6, 11.8, 13.0):
    place(sfx, pop(0.8), tt, pan=0.2)

# 17.4–20.9：夸张的悲情弦乐 + 磁带停转
drama = np.zeros((2, N))
st = pad([nf(x) for x in ['A2', 'E3', 'A3', 'C4', 'E4', 'A4']], 3.6, 1.0, att=2.6, rel=0.05, bright=1.8, vib=0.006)
place(drama, st, 17.45)
roll = lp(rng.standard_normal(int(3.0 * SR)), 140, 3) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 11 * tvec(3.0)))) * np.linspace(0.05, 1, int(3.0 * SR)) ** 2
place(drama, roll * 0.8, 17.5)
place(drama, swept(3.0, 2000, 9000, bw=0.6, gain=0.06, shape=lambda u: u ** 3), 17.45)
place(drama, piano(nf('A1'), 2, 0.7), 17.5)
place(sfx, thump(0.5), 17.5)
i0, i1 = int(20.35 * SR), int(20.95 * SR)
rate = np.ones(N)
k = np.arange(i1 - i0)
rate[i0:i1] = np.maximum(0, 1 - k / len(k)) ** 1.4
rate[i1:] = 0
pos = np.cumsum(rate) - 1
for ch in range(2):
    warped = np.interp(np.clip(pos, 0, N - 1), np.arange(N), drama[ch])
    warped[i1:] = 0
    music[ch] += warped * 1.4

# 21.0–36.2：拉远镜头 —— 空灵的八音盒
place(sfx, swept(3.4, 180, 2600, bw=0.5, gain=0.16, shape=lambda u: np.sin(np.pi * u) ** 2), 21.0, pan=-0.2)
B_CH = [('C', ['C3', 'G3', 'E4'], ['C5', 'G5', 'E6', 'G5', 'C6', 'G5', 'E6', 'G5']),
        ('G/B', ['B2', 'G3', 'D4'], ['B4', 'G5', 'D6', 'G5', 'B5', 'G5', 'D6', 'G5']),
        ('Am', ['A2', 'E3', 'C4'], ['A4', 'E5', 'C6', 'E5', 'A5', 'E5', 'C6', 'E5']),
        ('F', ['F2', 'C3', 'A3'], ['F4', 'C5', 'A5', 'C5', 'F5', 'C5', 'A5', 'C5'])]
for k in range(6):
    t0 = 21.6 + k * 2.4
    name, padn, arp = B_CH[k % 4]
    place(music, pad([nf(x) for x in padn], 3.4, 0.55, att=1.0, rel=1.2), t0 - 0.2)
    if t0 >= 23.9:
        chord_arp(t0, arp, 0.3, 8, vel=0.28 + 0.03 * min(k, 3), inst='box')
    place(music, piano(nf(padn[0]), 2.4, 0.3), t0, pan=-0.3)
for (_, _, _, tt, _) in [(0, 0, 0, 22.0, 0), (0, 0, 0, 22.4, 0), (0, 0, 0, 22.9, 0), (0, 0, 0, 23.3, 0), (0, 0, 0, 24.0, 0),
                         (0, 0, 0, 24.5, 0), (0, 0, 0, 25.0, 0), (0, 0, 0, 25.4, 0), (0, 0, 0, 25.9, 0), (0, 0, 0, 26.3, 0)]:
    place(sfx, pop(0.55, 500 + 300 * rng.random(), 1100 + 300 * rng.random()), tt, pan=rng.uniform(-0.6, 0.6))
place(music, pad([nf('C2'), nf('G2'), nf('C3')], 5.2, 0.7, att=2.0, rel=2.0), 31.0)

# 36.2–47.2：时间胶片
place(dry, projector(11.4), 36.0)
D_CH = [(['A2', 'E3', 'C4'], ['A4', 'E5', 'C6', 'E5', 'A5', 'E5', 'C6', 'E5']),
        (['F2', 'C3', 'A3'], ['F4', 'C5', 'A5', 'C5', 'F5', 'C5', 'A5', 'C5']),
        (['C3', 'G3', 'E4'], ['C5', 'G5', 'E6', 'G5', 'C6', 'G5', 'E6', 'G5']),
        (['G2', 'D3', 'B3'], ['G4', 'D5', 'B5', 'D5', 'G5', 'D5', 'B5', 'D5']),
        (['F2', 'C3', 'A3'], ['F4', 'C5', 'A5', 'C5', 'F5', 'C5', 'A5', 'C5'])]
for k, (padn, arp) in enumerate(D_CH):
    t0 = 36.2 + k * 2.2
    place(music, pad([nf(x) for x in padn], 2.9, 0.5, att=0.4, rel=0.9), t0 - 0.05)
    chord_arp(t0, arp, 0.275, 8, vel=0.3, inst='box')
    place(music, piano(nf(padn[0]), 2.0, 0.45), t0, pan=-0.3)
    place(sfx, flick(), t0 - 0.05)

# 47.2–53.8：经典款陈列架
place(music, pad([nf('F2'), nf('C3'), nf('A3')], 2.9, 0.45, att=0.3, rel=0.5), 47.1)
for k, nm in enumerate(['F2', 'A2', 'C3', 'A2', 'F2', 'C3']):
    place(music, piano(nf(nm), 0.2, 0.42, stacc=True), 47.3 + k * 0.42, pan=-0.2)
place(sfx, thump(1.0), 49.9)
for k, nm in enumerate(['C5', 'E5', 'G5', 'C6']):
    place(music, piano(nf(nm), 1.4 - k * 0.2, 0.45), 49.98 + k * 0.08, pan=0.2)
place(music, pad([nf('C3'), nf('E3'), nf('G3')], 1.8, 0.4, att=0.05, rel=0.6), 49.95)
place(music, piano(nf('G2'), 1.1, 0.5), 51.6); place(music, piano(nf('F4'), 1.1, 0.3), 51.6, pan=0.2); place(music, piano(nf('B3'), 1.1, 0.3), 51.6)
place(music, piano(nf('C3'), 1.8, 0.5), 52.75)
for nm in ['C4', 'E4', 'G4', 'C5']:
    place(music, piano(nf(nm), 1.6, 0.3), 52.75, pan=0.1)

# 53.8–62.4：得意的拨弦
sneak = ['D3', None, 'A3', None, 'F3', None, 'A3', None, 'C#3', None, 'A3', None, 'E3', 'F3', 'E3', None]
for k in range(26):
    nm = sneak[k % 16]
    if nm:
        place(music, piano(nf(nm), 0.15, 0.4, stacc=True), 54.3 + k * 0.3, pan=-0.15)
for k in range(4):
    place(music, piano(nf(['D5', 'F5', 'A5', 'G#5'][k]), 0.15, 0.25, stacc=True), 56.7 + k * 1.2, pan=0.3)
sparkle(59.42, base=2637, n=5, step=0.05, v=0.9)
place(sfx, bell(nf('E7'), 0.5, 1.5), 59.45)

# 62.4–72.8：全楼都“看穿了”
place(sfx, swept(0.9, 300, 4500, bw=0.45, gain=0.16, shape=lambda u: np.sin(np.pi * u) ** 1.2), 62.3)
MB = [(0, 0), (2, 0), (4, 0), (1, 1), (3, 1), (0, 2), (2, 2), (4, 2), (1, 3), (3, 3), (0, 4), (2, 4), (4, 4)]
for n in range(13):
    place(sfx, pop(0.6, 450 + 40 * n, 1000 + 60 * n), 63.0 + ((n * 7) % 13) * 0.09, pan=-0.6 + 1.2 * (MB[n][0] / 4))
for k in range(3):
    t0 = 65.0 + k * 2.4
    name, padn, arp = B_CH[k]
    place(music, pad([nf(x) for x in padn], 3.2, 0.4, att=0.8, rel=1.0), t0 - 0.1)
    chord_arp(t0, arp, 0.3, 8, vel=0.22, inst='box')
place(music, pad([nf('F2'), nf('C3'), nf('A3')], 1.6, 0.35, att=0.5, rel=0.8), 72.2)

# 72.6–79.4：落回房间，“那还有什么意义”
place(sfx, swept(0.6, 4000, 300, bw=0.45, gain=0.14), 72.6)
place(music, piano(nf('A2'), 3.0, 0.45), 73.4, pan=-0.2)
place(music, piano(nf('E3'), 2.0, 0.3), 74.6, pan=-0.1)
place(music, piano(nf('C4'), 2.5, 0.28), 75.7, pan=0.1)
place(music, piano(nf('B3'), 2.5, 0.26), 77.0, pan=0.1)
place(music, pad([nf('A2'), nf('E3'), nf('C4')], 5.4, 0.4, att=1.5, rel=1.5), 73.3)
place(sfx, swept(0.7, 1500, 5000, bw=0.7, gain=0.07), 78.7)

# 79.4–132.4：F 大调，暖色钢琴（72 bpm）
BAR = 60 / 72 * 4
E8 = BAR / 8
F_CH = [('F', ['F2', 'C3', 'F3', 'A3', 'C4', 'A3', 'F3', 'C3'], ['F3', 'A3', 'C4']),
        ('C/E', ['E2', 'C3', 'G3', 'C4', 'E4', 'C4', 'G3', 'C3'], ['E3', 'G3', 'C4']),
        ('Dm', ['D2', 'A2', 'D3', 'F3', 'A3', 'F3', 'D3', 'A2'], ['D3', 'F3', 'A3']),
        ('Bb', ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'D3', 'Bb2', 'F2'], ['Bb2', 'D3', 'F3'])]
B = 60 / 72
MEL1 = [(0, 'A4', 2), (2, 'C5', 1), (3, 'F5', 1), (4, 'E5', 3), (7, 'D5', 1), (8, 'C5', 2), (10, 'A4', 1), (11, 'D5', 1), (12, 'C5', 4)]
MEL2 = [(0, 'F5', 2), (2, 'E5', 1), (3, 'D5', 1), (4, 'C5', 3), (7, 'G4', 1), (8, 'A4', 2), (10, 'C5', 1), (11, 'D5', 1), (12, 'F4', 4)]
T0 = 79.4
for b in range(16):
    t0 = T0 + b * BAR
    name, arp, padn = F_CH[b % 4]
    fade = 1.0
    for k, nm in enumerate(arp):
        tt = t0 + k * E8
        if tt > 132.3:
            break
        place(music, piano(nf(nm), E8 * 3, (0.36 if k == 0 else 0.2) * fade), tt, pan=-0.25)
    if t0 >= 85.0 and t0 < 131:
        place(music, pad([nf(x) for x in padn], BAR + 1.0, 0.32, att=1.2, rel=1.2, bright=0.8), t0 - 0.2)
for cyc in range(4):
    mel_ = MEL1 if cyc % 2 == 0 else MEL2
    if cyc == 3:
        continue  # 第四轮让给西西弗斯的口哨
    for beat, nm, d in mel_:
        tt = T0 + cyc * 4 * BAR + beat * B
        place(music, piano(nf(nm), d * B, 0.3), tt, pan=0.2)
for tt in (85.6, 96.8, 107.6, 118.6):
    place(sfx, bell(nf('C6'), 0.45), tt, pan=0.3)
for tt in (95.0, 106.0, 117.0, 128.8):
    place(sfx, thump(0.75), tt)
place(sfx, pop(0.8, 700, 1500), 100.6)
for k in range(9):
    place(sfx, plink(nf(['C7', 'E7', 'G7', 'A7', 'G7', 'E7', 'C7', 'D7', 'E7'][k]), 0.35), 100.7 + k * 0.17 + 0.03 * rng.random(), pan=0.2 + 0.07 * k)
# 西西弗斯
place(sfx, thump(0.4), 122.55)
place(sfx, rumble(1.9, 0.5), 122.6, pan=-0.3)
for k, nm in enumerate(['C6', 'A5', 'F5', 'D5', 'C5', 'A4', 'F4', 'D4', 'C4']):
    place(music, piano(nf(nm), 0.3, 0.3), 122.65 + k * 0.07, pan=0.3 - 0.07 * k)
WH = [(127.6, 'A5', .35, None), (128.0, 'F5', .35, None), (128.4, 'G5', .35, None), (128.8, 'A5', .7, None),
      (129.6, 'C6', .35, 'A5'), (130.0, 'Bb5', .35, None), (130.4, 'A5', .35, None), (130.8, 'F5', 1.0, None)]
for tt, nm, d, gl in WH:
    place(sfx, whistle(nf(nm), d, 0.75, nf(gl) if gl else None), tt, pan=-0.15)

# 132.4–135.7：回到滤镜里的房间
place(music, piano(nf('F2'), 3.0, 0.35), 132.6, pan=-0.2)
place(music, pad([nf('F2'), nf('C3')], 3.4, 0.35, att=1.0, rel=0.4, bright=0.6), 132.4)
place(sfx, swept(1.3, 300, 1400, bw=0.5, gain=0.05, shape=lambda u: u ** 2), 134.4)
# 135.7：摘下眼镜
place(dry, click(), 135.7)
place(sfx, swept(1.6, 800, 9000, bw=0.6, gain=0.12, shape=lambda u: np.exp(-u * 3) * np.minimum(1, u * 30)), 135.7)
sparkle(135.75, base=nf('F6'), n=6, step=0.07, v=0.7)
for nm in ['F2', 'C3', 'F3', 'A3', 'G4', 'C5']:
    place(music, piano(nf(nm), 2.6, 0.32), 135.72, pan=0.0)
place(music, pad([nf('F3'), nf('A3'), nf('C4'), nf('G4')], 3.0, 0.45, att=0.3, rel=1.5, bright=1.3), 135.7)

# 135.7–160：明亮的结尾
G_CH = [(136.0, 2.5, ['F2', 'C3', 'F3', 'A3', 'C4', 'A3', 'F3', 'C3'], ['F3', 'A3', 'C4']),
        (138.5, 2.5, ['E2', 'C3', 'G3', 'C4', 'E4', 'C4', 'G3', 'C3'], ['E3', 'G3', 'C4']),
        (141.0, 2.5, ['D2', 'A2', 'D3', 'F3', 'A3', 'F3', 'D3', 'A2'], ['D3', 'F3', 'A3']),
        (143.5, 2.5, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'D3', 'Bb2', 'F2'], ['Bb2', 'D3', 'F3']),
        (146.0, 2.2, ['A1', 'F2', 'C3', 'F3', 'A3', 'F3', 'C3', 'F2'], ['A2', 'C3', 'F3']),
        (148.2, 2.2, ['E2', 'C3', 'G3', 'C4', 'E4', 'C4', 'G3', 'C3'], ['E3', 'G3', 'C4']),
        (150.4, 1.6, ['D2', 'A2', 'D3', 'F3', 'A3', 'F3'], ['D3', 'F3', 'A3']),
        (152.0, 1.6, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'D3'], ['Bb2', 'D3', 'F3']),
        (153.6, 1.4, ['C2', 'G2', 'C3', 'F3', 'G3', 'E3'], ['C3', 'G3', 'F4']),
        (155.0, 5.0, ['F1', 'C2', 'F2', 'A2', 'C3', 'F3', 'A3', 'C4'], ['F2', 'C3', 'A3'])]
for t0, d, arp, padn in G_CH:
    step = d / len(arp) if d < 4 else 0.32
    for k, nm in enumerate(arp):
        place(music, piano(nf(nm), max(step * 3, 1.2) if t0 < 155 else 4.5 - k * 0.3, 0.38 if k == 0 else 0.22), t0 + k * step, pan=-0.25)
    place(music, pad([nf(x) for x in padn], d + 1.2 if t0 < 155 else 5.0, 0.5 if t0 >= 146 else 0.35,
                     att=0.8, rel=1.2 if t0 < 155 else 3.5, bright=1.1), t0 - 0.1)
    if 146 <= t0 < 155:
        place(music, pad([nf(x) * 2 for x in padn], d + 1.0, 0.25, att=0.6, rel=1.0, bright=1.4, vib=0.004), t0 - 0.1)
mel([(136.0, 'C5', 1.2), (137.25, 'A4', 1.2), (138.5, 'G4', 1.2), (139.75, 'C5', 1.2), (141.0, 'D5', 1.2), (142.25, 'F5', 1.2),
     (143.5, 'F5', 0.6), (144.1, 'E5', 0.6), (144.75, 'D5', 1.2), (146.0, 'C5', 2.2), (148.2, 'E5', 1.1), (149.3, 'G5', 1.1),
     (150.4, 'A5', 1.6), (152.0, 'Bb5', 0.8), (152.8, 'A5', 0.8), (153.6, 'G5', 1.4), (155.0, 'F5', 4.0)], vel=0.34)
for k, nm in enumerate(['F6', 'A6', 'C7', 'F7', 'C7', 'A6']):
    place(music, musicbox(nf(nm), 0.4), 155.2 + k * 0.22, pan=0.3)
for k, nm in enumerate(['C7', 'A6', 'F6']):
    place(music, musicbox(nf(nm), 0.3), 157.0 + k * 0.3, pan=0.3)
# 标签翻面
for i, tt in enumerate([137.6, 139.4, 141.2, 143.0]):
    place(sfx, pop(0.45), tt, pan=0.2)
    place(sfx, flick(), tt + 0.75)
    if i == 2:
        place(music, piano(nf('E4'), 0.25, 0.35, stacc=True), tt + 1.0, pan=0.2)
        place(music, piano(nf('C4'), 0.4, 0.35, stacc=True), tt + 1.2, pan=0.2)
    else:
        place(sfx, plink(nf(['A6', 'C7', '', 'F7'][i]) if i != 2 else 2000, 0.5), tt + 0.95, pan=0.25)
for k, nm in enumerate(['C6', 'F6', 'A6']):
    place(sfx, plink(nf(nm), 0.35), 138.35 + k * 0.12, pan=-0.3)
place(sfx, bell(nf('A6'), 0.35, 2.0), 143.75, pan=-0.5)
place(sfx, swept(4.0, 2500, 250, bw=0.6, gain=0.07, shape=lambda u: np.sin(np.pi * u) ** 2), 147.2)

# 时钟滴答
for sec in range(0, 160):
    on = (sec < 21) or (54 <= sec < 62) or (73 <= sec < 79) or (133 <= sec < 147)
    if on:
        g = 1.0 if sec < 135 else 0.55
        place(dry, tick(sec % 2 == 0), sec, g, pan=0.55)
# 房间底噪
room = lp(rng.standard_normal(N), 400, 2) * 0.004
for a, b in [(0, 21), (53.8, 62.4), (73.2, 79.4), (132.2, 147.5)]:
    tt = np.arange(N) / SR
    env = np.clip((tt - a) / 0.3, 0, 1) * np.clip((b - tt) / 0.3, 0, 1)
    dry[0] += room * env
    dry[1] += np.roll(room, 997) * env


# ---------------- 混响与混音 ----------------
def reverb_ir(length=2.8, seed=0):
    r = np.random.default_rng(seed)
    t = tvec(length)
    ir = r.standard_normal(len(t)) * np.exp(-t / 0.75)
    ir = lp(ir, 5000) * 0.9 + lp(ir, 1500) * 0.3
    ir[:int(0.018 * SR)] = 0
    return ir / np.sqrt(np.sum(ir ** 2))


irL, irR = reverb_ir(seed=1), reverb_ir(seed=2)
mix = np.zeros((2, N))
for bus, wet in [(music, 0.42), (sfx, 0.22)]:
    m = bus[0] + bus[1]
    revL = fftconvolve(m, irL)[:N] * wet * 0.5
    revR = fftconvolve(m, irR)[:N] * wet * 0.5
    mix[0] += bus[0] + revL
    mix[1] += bus[1] + revR
mix += dry
mix[:, :int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR))
tail = int(1.6 * SR)
mix[:, -tail:] *= np.linspace(1, 0, tail) ** 1.5
mix = hp(mix, 30)
peak = np.abs(mix).max()
mix = mix / peak * 0.95
mix = np.tanh(mix * 1.35) / np.tanh(1.35)
mix *= 0.68
out = sys.argv[1] if len(sys.argv) > 1 else 'audio.wav'
wavfile.write(out, SR, (mix.T * 32767).astype(np.int16))
print('wrote', out, 'peak', np.abs(mix).max())
