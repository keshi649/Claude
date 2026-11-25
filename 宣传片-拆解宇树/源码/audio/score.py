"""《拆解宇树》宣传片：原创配乐 + 音效，按画面时间线逐点对齐。
120 BPM（一拍 0.5 秒），D 小调。输出 build/audio.wav（48 kHz 立体声）。
用法：python3 audio/score.py [输出路径]
"""
import os
import subprocess
import sys
import tempfile

import numpy as np
import mido
import soundfile as sf

sys.path.insert(0, os.path.dirname(__file__))
from synth import *  # noqa

DUR = 76.5
FLASHES = [0.32, 0.9, 1.37, 1.8, 2.41, 2.77]  # 和 js/shots/act0.js 里的观众席闪光同一张表
N = n_(DUR + 4)
BEAT = 0.5
SF2 = '/usr/share/sounds/sf2/FluidR3_GM.sf2'


def bus():
    return np.zeros((N, 2))


def times(t0, t1, step, off=0.0):
    return [round(t0 + off + i * step, 4) for i in range(int(round((t1 - t0) / step))) if t0 + off + i * step < t1 - 1e-6]


# =============================== 鼓 ===============================
def kick(punch=1.0, dur=0.38, tight=1.0):
    t = t_(dur)
    f = 54 + 120 * np.exp(-t / (0.03 * tight))
    body = sine(f, dur) * np.exp(-t / (0.12 * tight))
    knock = sine(150 * (1 + 0.5 * np.exp(-t / 0.01)), dur) * np.exp(-t / 0.03) * 0.45
    cl = bp(noise(0.015), 1500, 8000) * np.linspace(1, 0, n_(0.015))
    x = body + knock
    x[:len(cl)] += cl * 0.55 * punch
    return sat(x * 1.1, 1.7) * 0.95


def sub_boom(dur=2.8, f0=70, f1=27, tau=1.1):
    t = t_(dur)
    f1 = max(f1, 38)
    f = f1 + (f0 - f1) * np.exp(-t / 0.22)
    body = sine(f, dur) * np.exp(-t / (tau * 0.7))
    # 手机喇叭听得见的那部分：低通噪声的“砰”和二次谐波
    thump = lp(noise(dur), 500) * np.exp(-t / 0.08) * 0.5 + sine(f * 2, dur) * np.exp(-t / 0.25) * 0.35
    return (body * 0.8 + thump) * 0.85


def snare(dur=0.32, tone=190):
    t = t_(dur)
    body = sine(tone * (1 + 0.35 * np.exp(-t / 0.02)), dur) * np.exp(-t / 0.07)
    nz = bp(noise(dur), 1500, 10000) * np.exp(-t / 0.12)
    return sat(body * 0.55 + nz * 0.95, 1.4) * 0.7


def clap(dur=0.4):
    out = np.zeros(n_(dur))
    for k, d in enumerate([0, 0.010, 0.021, 0.033]):
        L = 0.3
        seg = bp(noise(L), 1000, 7000) * np.exp(-t_(L) / (0.010 if k < 3 else 0.10))
        i = n_(d)
        m = min(len(seg), len(out) - i)
        out[i:i + m] += seg[:m]
    return out * 0.55


def hat(open_=False, dur=None):
    dur = dur or (0.38 if open_ else 0.07)
    x = hp(noise(dur), 7500, order=3) * np.exp(-t_(dur) / (0.13 if open_ else 0.016))
    return x * 0.32


def tom(f=110, dur=0.5):
    t = t_(dur)
    return sine(f * (1 + 0.55 * np.exp(-t / 0.045)), dur) * np.exp(-t / 0.2) * 0.85


def crash(dur=2.6, bright=1.0):
    t = t_(dur)
    x = hp(noise(dur), 3000) * np.exp(-t / 0.75)
    for r in [3.13, 4.71, 6.27, 7.93, 9.4]:
        x += sine(410 * r, dur) * np.exp(-t / 0.55) * 0.04
    return x * 0.28 * bright


def rim():
    t = t_(0.08)
    return (bp(noise(0.08), 1800, 6000) * np.exp(-t / 0.008) + sine(820, 0.08) * np.exp(-t / 0.012) * 0.6) * 0.5


# =============================== 合成器 ===============================
CH = {
    'Dm': (38, [50, 53, 57, 62]), 'Bb': (34, [46, 50, 53, 58]), 'F': (41, [48, 53, 57, 60]), 'C': (36, [48, 52, 55, 60]),
    'Gm': (43, [50, 55, 58, 62]), 'A': (45, [49, 52, 57, 61]), 'Bbmaj7': (34, [50, 53, 57, 58]), 'F/A': (45, [48, 53, 57, 60]),
    'Gm7': (43, [50, 53, 55, 58]), 'Dm9': (38, [50, 52, 53, 57]),
}
CHORDS = [(8, 'Dm'), (10, 'Dm'), (12, 'Bb'), (14, 'F'), (16, 'C'), (18, 'Dm'), (20, 'Bb'), (22, 'F'), (24, 'C'), (26, 'Dm'),
          (28, 'Bb'), (30, 'F'), (31.5, 'C'), (34, 'Dm'), (36, 'Bb'), (38, 'F'), (40, 'C'), (42, 'Dm'),
          (44, 'Gm'), (46, 'Dm'), (48, 'A'), (48.5, None), (50, 'Dm'), (52, 'Bb'), (54, 'F'), (55.5, None),
          (56, 'Bb'), (58, 'C'), (60, 'A'), (62, 'Dm'), (62.5, 'Bb'), (63, 'F'), (63.5, 'C'), (64, 'Dm'), (64.5, 'Bb'), (65, 'C'), (66, 'A'),
          (66.5, 'Bbmaj7'), (68.5, 'F/A'), (70.5, 'Gm7'), (72.5, 'Dm9'), (78, None)]


def chord_at(t):
    c = None
    for s, n in CHORDS:
        if t + 1e-6 >= s:
            c = n
    return c


def supersaw(m, dur, voices=7, det=0.16, stereo=True):
    out = np.zeros((n_(dur), 2))
    for v in range(voices):
        k = (v - (voices - 1) / 2) / ((voices - 1) / 2)
        x = saw(midi_hz(m + det * k), dur, phase0=rng.random())
        pan = k * 0.8 if stereo else 0
        out += to_stereo(x, pan) / voices
    return out


def pad_chord(notes, dur, cutoff=1800, att=0.35, rel=0.8, voices=5):
    st = np.zeros((n_(dur + rel), 2))
    for m in notes:
        st[:n_(dur + rel)] += supersaw(m, dur + rel, voices=voices, det=0.12)
    env = adsr(dur + rel, a=att, d=0.6, s=0.85, r=rel)
    st *= env[:, None]
    for c in range(2):
        st[:, c] = lp(st[:, c], cutoff)
    return st * 0.22


def bass_note(m, dur, cut=(220, 1500), drive=1.6):
    t = t_(dur)
    x = saw(midi_hz(m), dur) * 0.75 + square(midi_hz(m), dur, 0.5) * 0.15 + sine(midi_hz(m), dur) * 0.35
    env = adsr(dur, a=0.004, d=0.12, s=0.7, r=0.04)
    fe = np.exp(-t / 0.09)
    y = env_lp(x, fe, cut[0], cut[1], q=1.1)
    return hp(sat(y * env, drive), 45) * 0.55


def pluck(m, dur=0.22, bright=3200, wave='saw'):
    t = t_(dur)
    x = saw(midi_hz(m), dur) if wave == 'saw' else square(midi_hz(m), dur, 0.3)
    fe = np.exp(-t / 0.06)
    y = env_lp(x, fe, 300, bright, q=1.3)
    return y * np.exp(-t / 0.16) * 0.3


def lead_note(m, dur, vib=0.12, bright=3600, wave='saw', glide_from=None):
    t = t_(dur)
    f = midi_hz(m) * (1 + vib / 100 * 2 * np.sin(2 * np.pi * 5.6 * t) * np.clip((t - 0.12) / 0.2, 0, 1))
    if glide_from is not None:
        f0 = midi_hz(glide_from)
        f = f0 + (f - f0) * np.clip(t / 0.05, 0, 1) if np.isscalar(f0) else f
    x = saw(f, dur) * 0.6 + square(f, dur, 0.42) * 0.4 if wave == 'saw' else square(f, dur, 0.25)
    y = lp(x, bright)
    return y * adsr(dur, a=0.01, d=0.25, s=0.75, r=min(0.12, dur * 0.4)) * 0.28


def braam(dur=1.8, root=26, bright=1400):
    st = np.zeros((n_(dur), 2))
    for m, g in [(root, 1.0), (root + 12, 0.8), (root + 19, 0.5), (root + 24, 0.35)]:
        st += supersaw(m, dur, voices=5, det=0.25) * g
    t = t_(dur)
    env = np.minimum(1, t / 0.04) * np.exp(-t / 0.9)
    for c in range(2):
        st[:, c] = sweep_lp(st[:, c] * env, 180, bright, q=1.4)
    st = sat(st * 1.6, 2.2) * 0.45
    st += to_stereo(sub_boom(dur, 60, 40, 0.8)) * 0.25
    return st


def riser(dur=2.0, f0=300, f1=9000, tone=True):
    t = t_(dur)
    amp = (t / dur) ** 2.2
    x = sweep_lp(noise(dur), f0, f1, q=2.0) * amp
    if tone:
        x += sine(180 * 2 ** (3.5 * t / dur), dur) * amp * 0.25
    return widen(to_stereo(x), 0.5) * 0.5


def rev_cymbal(dur=1.2):
    c = crash(dur + 0.4)[:n_(dur)][::-1].copy()
    return c * 2.2


def whoosh(dur=0.5, lo=500, hi=4500, pan_from=-0.6, pan_to=0.6, gain=1.0):
    t = t_(dur)
    bell = np.sin(np.pi * t / dur) ** 2
    # 一个连续变化的低通（带状态，不分块重启）+ 固定高通，截止频率跟着包络走
    y = env_lp(noise(dur), np.sin(np.pi * t / dur), lo, hi, q=1.6)
    y = hp(y, lo * 0.5) * bell
    pan = np.linspace(pan_from, pan_to, len(y))
    st = np.stack([y * np.cos((pan + 1) * np.pi / 4), y * np.sin((pan + 1) * np.pi / 4)], axis=1) * 1.4
    return st * 0.55 * gain


def metal_clank(f=420, dur=0.9, bright=1.0):
    t = t_(dur)
    x = np.zeros(len(t))
    for r, a, d in [(1.0, 1.0, 0.25), (2.76, 0.7, 0.16), (5.40, 0.5, 0.1), (8.93, 0.35, 0.06), (13.3, 0.2, 0.04)]:
        x += sine(f * r, dur, phase0=rng.random()) * a * np.exp(-t / d)
    x += hp(noise(dur), 2500) * np.exp(-t / 0.012) * 0.6 * bright
    x += sine(90, dur) * np.exp(-t / 0.08) * 0.8
    return x * 0.35


def servo(dur=0.8, f0=320, f1=900, gain=1.0):
    t = t_(dur)
    f = f0 + (f1 - f0) * (t / dur)
    x = saw(f, dur) * 0.5 + sine(f * 2, dur) * 0.3
    x = bp(x, 300, 3000) * np.sin(np.pi * t / dur) ** 0.5
    return x * 0.16 * gain


def blip(f=1400, dur=0.08):
    t = t_(dur)
    return sine(f, dur) * np.exp(-t / 0.025) * 0.35


def beep2(f=1200, gap=0.07):
    x = np.zeros(n_(0.2))
    for i, ff in enumerate([f, f * 1.5]):
        s = sine(ff, 0.06) * np.hanning(n_(0.06))
        x[n_(i * gap):n_(i * gap) + len(s)] += s
    return x * 0.3


def stamp_snd(big=False):
    t = t_(0.5)
    x = sine(85 * (1 + 0.5 * np.exp(-t / 0.02)), 0.5) * np.exp(-t / 0.08) * (1.2 if big else 0.9)
    x += bp(noise(0.5), 500, 4000) * np.exp(-t / 0.03) * 0.8
    return sat(x, 1.5) * 0.6


def ching():
    t = t_(1.2)
    x = np.zeros(len(t))
    for r, a in [(1, 1), (2.4, 0.6), (3.9, 0.4), (5.6, 0.25)]:
        x += sine(1850 * r, 1.2, phase0=rng.random()) * a * np.exp(-t / (0.35 / r ** 0.3))
    return x * 0.12


def splash():
    t = t_(0.9)
    x = sum(bp(noise(0.9), 400 + 300 * k, 3000 + 800 * k) * np.exp(-np.maximum(t - 0.05 * k, 0) / 0.1) * (t >= 0.05 * k) for k in range(5))
    return x * 0.5


def ping(f=1760, dur=1.4):
    t = t_(dur)
    return (sine(f, dur) * 0.6 + sine(f * 2.01, dur) * 0.2) * np.exp(-t / 0.35) * 0.28


def glitch(dur=0.2, seed=0):
    g = np.random.default_rng(seed)
    x = np.zeros(n_(dur))
    blk = n_(0.012)
    src = square(g.uniform(200, 1600), dur) * 0.5 + noise(dur) * 0.3
    for i in range(0, len(x), blk):
        if g.random() < 0.65:
            j = g.integers(0, max(1, len(src) - blk))
            x[i:i + blk] = src[j:j + blk][:len(x[i:i + blk])] * g.uniform(0.3, 1.0)
    x = np.round(x * 6) / 6
    return hp(x, 300) * 0.4


def tape_stop(src_dur=0.5):
    """一段下行音高的“磁带停转”"""
    t = t_(src_dur)
    f = 140 * (1 - t / src_dur) ** 1.5 + 20
    x = saw(f, src_dur) * 0.5 + sine(f / 2, src_dur) * 0.6
    return lp(x, 900) * (1 - t / src_dur) ** 0.5 * 0.6


def heartbeat():
    x = np.zeros(n_(0.6))
    for d, a in [(0, 1.0), (0.2, 0.7)]:
        k = kick(0.3, 0.35, tight=1.4)
        i = n_(d)
        x[i:i + len(k)] += k * a
    return lp(x, 400) * 0.9


def paper_flutter(dur, rate=40):
    t = t_(dur)
    gate = (np.sin(2 * np.pi * rate * t) > 0.6).astype(float)
    return bp(noise(dur), 1500, 7000) * gate * 0.12


def crackle(dur=0.5, seed=1):
    g = np.random.default_rng(seed)
    x = np.zeros(n_(dur))
    for _ in range(int(dur * 120)):
        i = g.integers(0, len(x) - 200)
        x[i:i + 60] += hp(noise(0.0013), 2000)[:60] * g.uniform(0.2, 1)
    return x * 0.4


def shimmer(dur=1.5, base=2400):
    t = t_(dur)
    x = np.zeros(len(t))
    for k in range(6):
        x += sine(base * (1 + 0.5 * k) * (1 + 0.003 * np.sin(2 * np.pi * (3 + k) * t)), dur) * np.exp(-t / (0.5 + 0.1 * k))
    return x * 0.05 * np.minimum(1, t / 0.05)


def thud(f=60):
    t = t_(0.6)
    return sat(sine(f * (1 + 0.8 * np.exp(-t / 0.03)), 0.6) * np.exp(-t / 0.15) + lp(noise(0.6), 800) * np.exp(-t / 0.04) * 0.6, 1.4) * 0.8


# =============================== 编曲 ===============================
def build_music():
    D = bus()        # 鼓
    BS = bus()       # 贝斯
    SY = bus()       # 合成器（琶音、铺底、主旋律）
    kicks = []       # 用来做侧链压缩

    def K(t, g=1.0, punch=1.0):
        place(D, kick(punch), t, 0.9 * g)
        kicks.append((t, g))

    # ---- 开场 0–8：心跳、慢动作、三个问题 ----
    for t in [0.0, 1.0, 2.0]:
        place(D, heartbeat(), t + 0.02, 0.85)
    for t in times(3.0, 6.0, 0.25):
        place(D, rim() * (0.5 if (t * 4) % 2 else 0.8), t, 0.35, pan=0.3 if (t * 4) % 2 else -0.3)
    for t in [3.0, 4.0, 5.0]:
        K(t, 0.8)
    # 6.25 炸开、8.0 片名：放在音效里
    # ---- 片名 8–10：鼓的过门 ----
    for i, t in enumerate(times(9.0, 10.0, 0.125)):
        place(D, snare() * (0.25 + 0.75 * i / 8), t, 0.55)
    for i, t in enumerate([9.5, 9.625, 9.75, 9.875]):
        place(D, tom(140 - i * 18), t, 0.7, pan=-0.4 + i * 0.25)
    place(D, crash(), 10.0, 1.0)

    # ---- 通用的四四拍律动 ----
    def groove(t0, t1, kick_g=1.0, hats=True, claps=True, open_hat=True, ghost=True):
        for t in times(t0, t1, 0.5):
            K(t, kick_g)
        if claps:
            for t in times(t0, t1, 1.0, off=0.5):
                place(D, clap(), t, 0.75)
                place(D, snare(), t, 0.25)
        if hats:
            for t in times(t0, t1, 0.25):
                off = abs(((t - t0) / 0.5) % 1 - 0.5) < 0.01
                if off and open_hat:
                    place(D, hat(True), t, 0.45, pan=0.25)
                else:
                    place(D, hat(), t, 0.4 if ghost else 0.0, pan=-0.2)

    groove(10.0, 16.0)
    place(D, crash(), 16.0, 0.8)
    groove(16.75, 28.0, hats=True)
    # 第三部：扫帚（稀疏）→ 摔成一片（杂乱）→ 学会了（满律动）
    for t in times(28.0, 31.5, 1.0):
        K(t, 0.75)
    for t in times(28.75, 31.5, 1.0, off=0.5):
        place(D, clap(), t, 0.45)
    for t in times(28.75, 31.5, 0.25):
        place(D, hat(), t, 0.3, pan=0.2)
    for t in times(28.75, 31.5, 0.5, off=0.25):
        place(D, rim(), t, 0.2, pan=-0.35)
    g = np.random.default_rng(9)
    for _ in range(26):
        t = 31.5 + g.random() * 2.45
        place(D, tom(g.uniform(70, 220)), t, g.uniform(0.25, 0.6), pan=g.uniform(-0.8, 0.8))
    place(D, crash(), 34.0, 1.0)
    groove(34.0, 39.5)
    # 后空翻：军鼓从八分到十六分，42.25 落地
    for t in times(39.5, 40.75, 0.5):
        K(t, 1.0)
    for t in times(40.75, 41.75, 0.25):
        place(D, snare(), t, 0.45)
    for i, t in enumerate(times(41.75, 42.25, 0.0625)):
        place(D, snare() * (0.4 + 0.6 * i / 8), t, 0.5)
    place(D, crash(), 42.25, 1.0)
    for t in [42.25, 43.0, 43.25]:
        K(t, 1.0)
    place(D, clap(), 42.75, 0.7); place(D, clap(), 43.75, 0.7)
    # 第四部：半拍感
    for t in times(44.0, 48.5, 2.0):
        K(t, 0.9); K(t + 1.25, 0.6)
    for t in times(44.0, 48.5, 0.25):
        place(D, rim(), t, 0.15 if (t * 4) % 2 else 0.28, pan=0.4 if (t * 4) % 2 else -0.4)
    for t in times(45.0, 48.5, 2.0):
        place(D, clap(), t, 0.6)
    # 第五部
    place(D, crash(), 50.0, 0.8)
    groove(50.75, 55.5)
    # 第六部：上扬，60–62 军鼓滚奏
    place(D, crash(), 56.0, 0.8)
    groove(56.75, 60.0)
    for t in times(60.0, 61.0, 0.25):
        place(D, snare(), t, 0.45); K(t, 0.55)
    for i, t in enumerate(times(61.0, 61.5, 0.125)):
        place(D, snare(), t, 0.5)
    for i, t in enumerate(times(61.5, 62.0, 0.0625)):
        place(D, snare() * (0.5 + 0.5 * i / 8), t, 0.55)
    # 高潮 62–65
    place(D, crash(3.5), 62.0, 1.1)
    for t in times(62.0, 65.0, 0.5):
        K(t, 1.15, punch=1.3)
    for t in times(62.0, 65.0, 0.5, off=0.25):
        place(D, hat(True), t, 0.45)
    for t in times(62.0, 65.0, 1.0, off=0.5):
        place(D, clap(), t, 0.85); place(D, snare(), t, 0.4)
    # 零件归位：十六分的金属声在音效里
    # 结尾：慢慢的心跳
    for t in times(68.5, 74.5, 2.0):
        K(t, 0.5)

    # ---- 贝斯（八分音符，根音 + 八度） ----
    def bassline(t0, t1, pattern=(0, 0, 12, 0, 0, 12, 0, 7), cut=(220, 1500), g=1.0):
        for i, t in enumerate(times(t0, t1, 0.25)):
            c = chord_at(t)
            if not c:
                continue
            root = CH[c][0]
            m = root + pattern[i % len(pattern)]
            place(BS, bass_note(m, 0.23, cut), t, 0.9 * g)

    bassline(10.0, 16.0, pattern=(0, 0, 0, 0, 12, 0, 0, 0), g=0.85)
    bassline(28.75, 31.5, pattern=(0, 0, 0, 0, 0, 0, 0, 0), cut=(160, 700), g=0.7)
    bassline(16.75, 28.0)
    bassline(34.0, 42.25)
    bassline(42.25, 44.0, pattern=(0, -12, 0, 0), g=0.8)
    bassline(44.0, 48.5, pattern=(0, 0, 0, 0, 0, 0, 0, 0), cut=(150, 600), g=0.9)
    bassline(50.0, 55.5)
    bassline(56.0, 62.0, pattern=(0, 12, 0, 12, 0, 12, 7, 12))
    bassline(62.0, 65.0, pattern=(0, 12, 0, 12), cut=(300, 2400), g=1.1)
    # 结尾：长音
    for s, c in [(66.5, 'Bbmaj7'), (68.5, 'F/A'), (70.5, 'Gm7'), (72.5, 'Dm9')]:
        place(BS, bass_note(CH[c][0], 2.0 if c != 'Dm9' else 3.8, (120, 500), 1.2), s, 0.7)

    # ---- 琶音（十六分） ----
    def arp(t0, t1, bright=3200, g=1.0, octave=12, wave='saw'):
        for i, t in enumerate(times(t0, t1, 0.125)):
            c = chord_at(t)
            if not c:
                continue
            notes = CH[c][1]
            seq = notes + [n + 12 for n in notes[:2]]
            ud = seq + seq[-2:0:-1]
            m = ud[i % len(ud)] + octave
            place(SY, pluck(m, 0.2, bright, wave), t, 0.55 * g, pan=-0.45 if i % 2 else 0.45)

    arp(12.0, 16.0, 2400, 0.7)
    arp(16.75, 28.0, 3200)
    arp(34.0, 39.5, 3600)
    arp(44.0, 48.5, 1500, 0.8, octave=24, wave='sq')
    arp(50.0, 55.5, 3000)
    arp(56.0, 62.0, 3600, 1.0)
    arp(62.0, 65.0, 5000, 1.0)

    # ---- 铺底（和弦长音） ----
    def pads(t0, t1, cutoff=1800, g=1.0):
        segs = [(s, c) for s, c in CHORDS if c]
        for i, (s, c) in enumerate(segs):
            e = next((s2 for s2, _ in CHORDS if s2 > s), 78)
            a, b = max(s, t0), min(e, t1)
            if b - a < 0.2:
                continue
            place(SY, pad_chord(CH[c][1], b - a, cutoff), a, 0.8 * g)

    pads(8.0, 10.0, 1200, 0.9)
    pads(10.0, 28.0, 1600, 0.8)
    pads(28.0, 31.5, 1100, 0.7)
    pads(34.0, 44.0, 2000, 0.8)
    pads(44.0, 48.5, 900, 0.9)
    pads(50.0, 55.5, 1800, 0.7)
    pads(56.0, 62.0, 2600, 0.9)
    pads(62.0, 66.0, 4200, 1.0)
    pads(66.5, 76.5, 1600, 1.1)

    # ---- 主旋律（钩子） ----
    HOOK = [(0, 74, 1), (1, 77, 1), (2, 81, 1.5), (3.5, 79, 0.5), (4, 77, 1), (5, 74, 1), (6, 77, 0.5), (6.5, 79, 0.5), (7, 77, 1),
            (8, 72, 1), (9, 77, 1), (10, 81, 1), (11, 84, 1), (12, 79, 2), (14, 76, 1), (15, 72, 1)]

    def hook(t0, t1, g=1.0, octave=0):
        for beat, m, d in HOOK:
            t = t0 + beat * BEAT
            if t >= t1:
                break
            place(SY, lead_note(m + octave, d * BEAT * 0.95), t, 0.55 * g, pan=0.1)

    hook(20.0, 28.0, 0.8)
    hook(56.0, 62.0, 0.9)
    hook(62.0, 65.0, 1.0, 12)
    # 秧歌：五声音阶的唢呐味小句（36–39.5）
    YG = [(0, 81), (0.25, 84), (0.5, 86), (1.0, 84), (1.25, 81), (1.5, 79), (2.0, 81), (2.5, 77), (2.75, 79), (3.0, 81),
          (4.0, 86), (4.25, 88), (4.5, 86), (5.0, 84), (5.5, 81), (6.0, 79), (6.25, 81), (6.5, 77)]
    for b, m in YG:
        place(SY, lead_note(m, 0.24, vib=0.4, bright=4500, wave='sq'), 36.0 + b * 0.5, 0.42, pan=-0.15)
        place(SY, lead_note(m + 0.5, 0.03, vib=0, bright=5000, wave='sq'), 36.0 + b * 0.5 - 0.03, 0.2)
    # 高潮的超锯齿和弦
    for s, c in [(62.0, 'Dm'), (62.5, 'Bb'), (63.0, 'F'), (63.5, 'C'), (64.0, 'Dm'), (64.5, 'Bb')]:
        for m in CH[c][1]:
            st = supersaw(m + 12, 0.48, voices=7, det=0.2) * adsr(0.48, 0.005, 0.2, 0.6, 0.08)[:, None]
            place(SY, st, s, 0.11)

    return D, BS, SY, kicks


# =============================== 管弦（FluidSynth） ===============================
def build_orch():
    mid = mido.MidiFile(ticks_per_beat=480)
    tpb = 480

    def track(prog, ch, events, vol=100, name=''):
        tr = mido.MidiTrack()
        mid.tracks.append(tr)
        tr.append(mido.MetaMessage('set_tempo', tempo=500000, time=0))
        tr.append(mido.Message('program_change', program=prog, channel=ch, time=0))
        tr.append(mido.Message('control_change', control=7, value=vol, channel=ch, time=0))
        evs = []
        for t, m, d, v in events:
            evs.append((t, 'on', m, v))
            evs.append((t + d, 'off', m, 0))
        evs.sort(key=lambda e: (e[0], e[1] == 'on'))
        now = 0
        for t, kind, m, v in evs:
            tick = int(round(t / BEAT * tpb))
            dt = max(0, tick - now)
            now = tick if tick > now else now
            tr.append(mido.Message('note_on' if kind == 'on' else 'note_off', note=int(m), velocity=int(v), channel=ch, time=dt))

    strings, choir, timp, piano, horns = [], [], [], [], []
    for s, c in CHORDS:
        if not c:
            continue
        e = next((s2 for s2, _ in CHORDS if s2 > s), 78)
        if 16 <= s < 28:
            for m in CH[c][1]:
                strings.append((s, m, e - s, 52))
        if 34 <= s < 44:
            for m in CH[c][1]:
                strings.append((s, m, e - s, 64))
        if 56 <= s < 62:
            for m in CH[c][1]:
                strings.append((s, m, e - s, 70 + int((s - 56) * 6)))
        if 62 <= s < 66.5:
            for m in CH[c][1]:
                strings.append((s, m + 12, e - s, 100))
                choir.append((s, m, e - s, 100))
        if s >= 66.5:
            for m in CH[c][1]:
                strings.append((s, m, e - s, 78))
                choir.append((s, m + 12, e - s, 70))
            horns.append((s, CH[c][0] + 12, e - s, 70))
    for t, v in [(8.0, 120), (23.5, 90), (42.25, 110), (48.75, 115), (55.5, 110), (62.0, 127), (66.0, 120), (72.5, 115)]:
        timp.append((t, 38, 1.5, v))
        timp.append((t, 45, 1.5, v - 10))
    for i, t in enumerate(times(60.5, 62.0, 0.0625)):
        timp.append((t, 38, 0.06, 50 + int(i * 3)))
    # 钢琴：开场几个高音、结尾的分解和弦
    for t, m in [(0.0, 86), (0.75, 81), (1.5, 89), (2.25, 86)]:
        piano.append((t, m, 1.2, 52))
    for s, c in [(66.5, 'Bbmaj7'), (68.5, 'F/A'), (70.5, 'Gm7'), (72.5, 'Dm9')]:
        notes = CH[c][1]
        for i, t in enumerate(times(s, s + (2.0 if c != 'Dm9' else 3.0), 0.25)):
            piano.append((t, notes[i % len(notes)] + 12 + (12 if i % 8 >= 4 else 0), 0.6, 48 + (i % 4) * 4))
    track(49, 0, strings, 105)
    track(52, 1, choir, 92)
    track(47, 2, timp, 115)
    track(0, 3, piano, 92)
    track(60, 4, horns, 85)
    with tempfile.TemporaryDirectory() as d:
        mp = os.path.join(d, 'o.mid')
        wp = os.path.join(d, 'o.wav')
        mid.save(mp)
        subprocess.run(['fluidsynth', '-ni', '-R', '0', '-C', '0', '-g', '0.8', '-r', str(SR), '-F', wp, SF2, mp], check=True, capture_output=True)
        x, sr = sf.read(wp)
    assert sr == SR
    out = bus()
    m = min(len(out), len(x))
    out[:m] = x[:m]
    return out


# =============================== 音效 ===============================
def build_sfx():
    S = bus()
    P = lambda x, t, g=1.0, pan=0.0: place(S, x, t, g, pan)
    # 开场
    P(whoosh(3.0, 120, 900, -0.3, 0.3), 0.0, 1.2)
    P(ping(2349, 2.5), 0.05, 0.6)
    g = np.random.default_rng(3)
    for t in FLASHES:
        P(hp(noise(0.03), 4000) * np.exp(-t_(0.03) / 0.004) * 0.4, t, 0.8, pan=g.uniform(-0.7, 0.7))
    P(blip(1800), 0.25, 0.5); P(stamp_snd(True), 1.0, 0.9)
    P(tape_stop(0.6), 3.0, 1.0); P(glitch(0.15, 1), 3.0, 0.8)
    P(braam(1.4, 26, 1100), 3.0, 0.85); P(braam(1.2, 29, 1300), 4.0, 0.8); P(braam(1.4, 24, 1500), 5.0, 0.9)
    P(glitch(0.12, 2), 4.0, 0.7); P(glitch(0.12, 3), 5.0, 0.7)
    for i, t in enumerate([3.15, 3.37, 3.59]):
        P(beep2(1500 + 200 * i), t, 0.7, pan=-0.4 + 0.4 * i)
    P(riser(0.3, 500, 6000), 5.95, 0.9)
    P(servo(0.3, 400, 2400, 1.5), 5.95, 1.0)
    P(sub_boom(3.0, 80, 28, 1.2), 6.25, 1.3); P(crash(3.0), 6.25, 1.0)
    for k in range(10):
        P(metal_clank(g.uniform(300, 1400), 0.7), 6.3 + g.random() * 0.8, 0.35, pan=g.uniform(-0.9, 0.9))
    for i, t in enumerate([6.45, 6.57, 6.69]):
        P(blip(1200 + 300 * i), t, 0.7)
    P(rev_cymbal(1.0), 6.75, 1.1)
    P(whoosh(0.45, 4000, 300, 0.6, -0.6), 7.3, 1.0)
    # 片名
    P(sub_boom(3.5, 90, 26, 1.6), 8.0, 1.6); P(braam(2.2, 26, 1800), 8.0, 1.1); P(crash(3.5), 8.0, 1.2)
    P(shimmer(2.0, 2600), 8.05, 1.0)
    for i in range(14):
        P(blip(2400 + (i % 3) * 300, 0.03), 8.5 + i * 0.035, 0.35)
    # 转场的刷声：斜块、甩镜头、故障、推近
    for t in [10.0, 16.0, 28.0, 44.0, 50.0, 56.0]:
        P(whoosh(0.5, 600, 6000, -0.8, 0.8, 1.2), t - 0.25)
        P(stamp_snd(True), t + 0.06, 0.9)
        P(sub_boom(1.2, 70, 35, 0.4), t + 0.06, 0.8)
    for t in [10.75, 16.75, 28.75, 44.75, 50.75, 56.75]:
        P(whoosh(0.3, 1500, 7000, 0.7, -0.7), t - 0.15, 1.0)
    P(glitch(0.2, 4), 13.4, 0.8); P(glitch(0.22, 5), 46.88, 0.8); P(glitch(0.15, 6), 25.4, 0.6)
    # 第一部
    P(sweep_lp(noise(1.9), 900, 5000, 3.0) * 0.06, 10.95, 1.0, pan=0.0)
    for t in [11.25, 11.75, 12.25, 12.75]:
        P(stamp_snd(), t, 0.55); P(blip(1600, 0.05), t, 0.4)
    P(beep2(1000), 13.6, 0.5)
    for i, t in enumerate([14.0, 14.25, 14.5, 14.75, 15.0]):
        P(stamp_snd(True), t, 0.85, pan=[-0.5, 0.5, -0.4, 0.4, 0][i])
    # 第二部
    P(servo(2.3, 220, 380, 1.0), 17.6, 0.8)
    for i, t in enumerate([17.05, 17.23, 17.41]):
        P(blip(1100 + 220 * i), t, 0.6)
    P(beep2(1300), 18.75, 0.6)
    P(whoosh(0.42, 300, 8000, 0, 0, 1.4), 19.79)
    for i, t in enumerate([20.0, 20.5, 21.0, 21.5, 22.0, 22.5]):
        P(metal_clank(380 + 70 * i, 0.9), t, 0.85, pan=-0.3 + 0.12 * i)
        P(blip(1500 + 100 * i, 0.05), t + 0.05, 0.4)
    P(whoosh(0.5, 3000, 400, 0.4, -0.4), 23.0, 1.0)
    P(metal_clank(180, 1.2, 1.4) * 1.3, 23.5, 1.0); P(sub_boom(1.5, 70, 35, 0.5), 23.5, 0.9)
    for i in range(18):
        P(blip(2600, 0.02), 23.5 + i * 0.04, 0.3)
    P(sweep_lp(noise(0.9), 300, 1500, 2.0) * np.sin(np.pi * t_(0.9) / 0.9) * 0.15, 23.7, 1.0)
    for i in range(14):
        P(blip(2900, 0.02), 24.35 + i * 0.043, 0.28)
    P(servo(1.1, 600, 640, 0.8), 25.5, 1.0)
    P(braam(1.2, 31, 2200), 26.0, 0.7); P(stamp_snd(True), 26.0, 0.8)
    P(whoosh(0.4, 400, 3000, -0.3, 0.3), 26.5, 0.9)
    P(servo(0.9, 160, 260, 1.4), 26.95, 1.0)
    P(metal_clank(140, 0.9, 0.5), 27.85, 0.8)
    # 第三部
    for t in [29.1, 29.55, 29.95, 30.3]:
        P(servo(0.18, 600, 450, 0.6), t, 0.8)
    P(whoosh(0.35, 800, 3000, -0.5, 0.5), 29.5, 0.7)
    P(shimmer(1.0, 1800), 30.5, 1.0)
    for t in [30.5, 31.25]:
        P(thud(70), t, 0.6)
    P(crackle(0.6, 2), 31.2, 0.9)
    for _ in range(40):
        t = 31.55 + g.random() * 2.4
        P(metal_clank(g.uniform(500, 1800), 0.35, 0.6), t, 0.18, pan=g.uniform(-0.9, 0.9))
    for t in [32.0, 32.6, 33.2, 33.6]:
        P(beep2(600), t, 0.4, pan=g.uniform(-0.6, 0.6))
    P(rev_cymbal(0.8), 33.2, 0.8)
    P(shimmer(1.6, 2200), 34.0, 1.4); P(whoosh(0.6, 300, 6000, -0.8, 0.8, 1.2), 33.8)
    P(stamp_snd(True), 35.0, 0.8); P(ching(), 35.05, 1.2)
    P(whoosh(0.4, 500, 5000, 0, 0, 1.0), 35.8)
    for i in range(24):
        P(blip(1800 + (i * 137) % 900, 0.025), 36.4 + i * 0.12, 0.18, pan=0.5 * np.sin(i))
    # 后空翻
    P(servo(0.6, 300, 200, 1.0), 39.6, 0.8)
    P(whoosh(0.5, 400, 4000, 0, 0, 1.2), 40.05)
    P(stamp_snd(), 40.75, 0.5); P(stamp_snd(), 41.75, 0.5)
    P(whoosh(0.9, 300, 2500, -0.7, 0.7, 1.3), 40.85)
    P(sub_boom(2.4, 85, 28, 0.9), 42.25, 1.4); P(thud(55), 42.25, 1.2)
    P(bp(noise(1.2), 200, 2500) * np.exp(-t_(1.2) / 0.3) * 0.4, 42.27, 1.0)
    # 第四部：雷达
    for t in [44.75, 45.375, 46.0, 46.625]:
        P(ping(1568, 1.6), t, 0.8, pan=g.uniform(-0.3, 0.3))
    P(sweep_lp(noise(2.2), 2000, 8000, 3) * 0.05, 44.8, 1.0)
    P(servo(0.55, 300, 520, 1.0), 47.0, 1.0)
    P(metal_clank(900, 0.3, 0.5), 47.55, 0.5)
    P(servo(0.35, 420, 600, 1.0), 47.7, 1.0)
    for t in times(48.0, 48.5, 0.05):
        P(metal_clank(1600, 0.08, 0.3), t, 0.15)
    P(splash(), 48.08, 1.0)
    P(tape_stop(0.5), 48.5, 1.0); P(glitch(0.15, 7), 48.5, 0.7)
    P(braam(1.6, 26, 1600), 48.75, 1.0); P(sub_boom(2.0, 75, 30, 0.8), 48.75, 1.0)
    P(riser(1.0, 300, 7000), 49.0, 0.8)
    # 第五部
    P(sweep_lp(noise(1.5), 400, 3000, 2) * 0.05, 50.8, 1.0)
    for t in [51.3, 51.85, 52.5]:
        P(blip(900, 0.09), t, 0.6, pan=-0.3)
    for t in [51.5, 52.05, 52.7]:
        P(ching(), t, 1.0, pan=0.3)
    P(stamp_snd(), 53.0, 0.6)
    P(whoosh(0.3, 700, 4000, 0, 0, 1.0), 53.85)
    P(stamp_snd(True), 54.0, 0.9)
    for i in range(6):
        P(whoosh(0.18, 1500, 6000, -0.8 if i % 2 else 0.8, 0, 0.8), 54.25 + i * 0.125 - 0.06)
    P(blip(700, 0.08), 55.25, 0.6)
    P(thud(48), 55.5, 1.4); P(tape_stop(0.4), 55.5, 0.9)
    # 第六部
    for i in range(6):
        P(whoosh(0.3, 900, 5000, -0.8 if i % 2 == 0 else 0.8, 0, 0.8), 57.25 + i * 0.25 - 0.15)
        P(blip(1200 + 100 * i, 0.06), 57.75 + i * 0.25, 0.5)
    P(whoosh(0.4, 500, 5000, 0, 0, 1.0), 58.8)
    P(paper_flutter(2.15, 32), 59.35, 1.0)
    P(ching(), 60.22, 0.8); P(ching(), 60.62, 0.8)
    P(stamp_snd(True), 61.5, 1.0)
    P(riser(2.0, 300, 10000), 60.0, 1.1)
    # 高潮
    P(sub_boom(3.0, 95, 26, 1.0), 62.0, 1.5); P(braam(1.8, 26, 2400), 62.0, 1.0)
    for t in [62.5, 63.0, 63.5, 64.0, 64.5]:
        P(stamp_snd(True), t, 0.6); P(sub_boom(0.8, 80, 40, 0.25), t, 0.5)
    for t in times(62.25, 65.0, 0.5):
        P(glitch(0.06, int(t * 10)), t, 0.4)
    P(whoosh(0.36, 300, 8000, 0, 0, 1.3), 64.82)
    for i, t in enumerate([65.125, 65.25, 65.375, 65.5, 65.625, 65.75]):
        P(metal_clank(300 + 90 * i, 0.6, 1.2), t, 0.9, pan=-0.5 + 0.2 * i)
    P(sub_boom(3.0, 90, 26, 1.3), 66.0, 1.5); P(braam(1.6, 26, 2000), 66.0, 1.0); P(crash(3.0), 66.0, 1.0)
    P(rev_cymbal(0.5), 66.0, 0.9)
    P(crackle(0.6, 3), 66.25, 0.8)
    # 书
    P(shimmer(3.0, 2000), 66.5, 1.4)
    P(whoosh(0.9, 1500, 9000, -0.6, 0.6, 0.8), 67.6)
    P(whoosh(0.9, 1500, 9000, -0.6, 0.6, 0.7), 71.7)
    for i in range(16):
        P(blip(2200 + (i % 4) * 200, 0.025), 68.5 + i * 0.03, 0.25)
    P(blip(1100, 0.1), 69.1, 0.6); P(blip(1320, 0.1), 69.8, 0.5); P(blip(1480, 0.1), 70.4, 0.5)
    P(sub_boom(3.5, 70, 26, 1.6), 72.5, 1.2); P(ping(2349, 3.0), 72.5, 0.9); P(crash(4.0, 0.7), 72.5, 0.8)
    return S


# =============================== 混音、母带 ===============================
def sidechain(kicks, depth_db=7.0, release=0.17):
    g = np.ones(N)
    d = 1 - 10 ** (-depth_db / 20)
    for t, a in kicks:
        i = int(t * SR)
        L = n_(release * 2.5)
        tt = np.arange(L) / SR
        env = 1 - d * min(1, a) * np.exp(-tt / release) * np.minimum(1, tt / 0.004 + 0.6)
        j = min(N, i + L)
        g[i:j] = np.minimum(g[i:j], env[:j - i])
    return g


def shelf(x, fc, gain_db, kind='low', s_=0.8):
    """RBJ 搁架均衡"""
    A = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * fc / SR
    al = np.sin(w0) / 2 * np.sqrt((A + 1 / A) * (1 / s_ - 1) + 2)
    c = np.cos(w0)
    sq = 2 * np.sqrt(A) * al
    if kind == 'low':
        b = [A * ((A + 1) - (A - 1) * c + sq), 2 * A * ((A - 1) - (A + 1) * c), A * ((A + 1) - (A - 1) * c - sq)]
        a = [(A + 1) + (A - 1) * c + sq, -2 * ((A - 1) + (A + 1) * c), (A + 1) + (A - 1) * c - sq]
    else:
        b = [A * ((A + 1) + (A - 1) * c + sq), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - sq)]
        a = [(A + 1) - (A - 1) * c + sq, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - sq]
    from scipy.signal import lfilter
    return lfilter(np.array(b) / a[0], np.array(a) / a[0], x)


def lufs(st):
    import pyloudnorm as pyln
    return pyln.Meter(SR).integrated_loudness(st)


def main(out_path):
    D, BS, SY, kicks = build_music()
    O = build_orch()
    S = build_sfx()
    sc = sidechain(kicks)[:, None]
    SYr = reverb(SY * sc, 1.8, 0.28, 0.4)[:N]
    BSs = BS * sc
    Dr = reverb(D, 0.9, 0.12, 0.5)[:N]
    Or = reverb(O, 2.6, 0.35, 0.35)[:N]
    Sr = reverb(S, 1.6, 0.18, 0.4)[:N]
    mix = Dr * 0.9 + BSs * 0.7 + SYr * 1.05 + Or * 0.7 + Sr * 1.0
    # 高通、轻微压缩感的饱和
    for c in range(2):
        y = hp(mix[:, c], 38, order=3)
        y = shelf(y, 90, -4.0, 'low')
        y = peak(y, 300, -2.0, 0.8)
        y = peak(y, 2800, 1.5, 0.9)
        mix[:, c] = shelf(y, 6000, 2.5, 'high')
    mix = sat(mix * 0.9, 1.1)
    end = n_(DUR)
    mix = mix[:end]
    # 最后 1.2 秒淡出（和画面黑场一起）
    fo = n_(1.2)
    mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
    # 响度：先归一到 -14 LUFS，再限幅到 -1.2 dBFS，再量一次
    L0 = lufs(mix)
    mix *= 10 ** ((-14.0 - L0) / 20)
    mix = limiter(mix, -1.3)
    L1 = lufs(mix)
    mix *= 10 ** ((-14.0 - L1) / 20)
    mix = limiter(mix, -1.3)
    print(f'响度 {lufs(mix):.2f} LUFS，峰值 {20 * np.log10(np.max(np.abs(mix))):.2f} dBFS')
    os.makedirs(os.path.dirname(out_path) or '.', exist_ok=True)
    sf.write(out_path, mix.astype(np.float32), SR, subtype='PCM_24')
    # 分轨也存一份，方便检查
    stems = os.path.join(os.path.dirname(out_path), 'stems')
    os.makedirs(stems, exist_ok=True)
    for name, x in [('drums', Dr), ('bass', BSs), ('synth', SYr), ('orch', Or), ('sfx', Sr)]:
        sf.write(os.path.join(stems, name + '.wav'), (x[:end] * 0.5).astype(np.float32), SR, subtype='PCM_16')
    print('写出', out_path)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', 'build', 'audio.wav'))
