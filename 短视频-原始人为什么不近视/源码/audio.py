"""《原始人为什么不近视？》声音：配音 + 8-bit 配乐 + 游戏音效，全部按 timeline.json 对齐。
配乐与音效用 numpy 合成（方波、三角波、噪声，仿红白机音色）；配音来自 voice.py 生成的 voice/*.mp3。
用法：python3 audio.py out.wav               配音 + 配乐 + 音效
      python3 audio.py out.wav --no-voice    去掉配音的版本：只有配乐和音效，音乐也不再为旁白压低
"""
import json
import os
import subprocess
import sys

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, resample_poly, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__))
TLD = json.load(open(os.path.join(HERE, 'timeline.json'), encoding='utf-8'))
LN = {l['id']: l for l in TLD['lines']}
SR = 44100
DUR = TLD['duration']
N = int(SR * DUR)
rng = np.random.default_rng(7)


def S(i): return LN[i]['v0']
def EN(i): return LN[i]['v1']
def CK(i, k): return LN[i]['chunks'][k][0]
def MK(i, k=0): return LN[i]['marks'][k]
def TY(i): return LN[i]['typed']


# ---------------- 关键时刻（与 scenes1.js 的 T 一致） ----------------
class T:
    d1 = S('d1'); half = MK('h2')
    arctic = S('h3') - .42; noPhone = CK('h3', 1); pct3 = MK('h4', 0); pct50 = MK('h4', 1)
    ceil = S('h5') - .38; ceilWord = S('h6'); dive = EN('h6') + .12
    site = S('e1') - .55; behind = MK('e2'); crew = S('e3'); grow0 = CK('e3', 1); onRet = MK('e3')
    replay = S('e4') - .1; reserve = MK('e4'); useUp = S('e5'); stopSign = S('e5') + .9; d2 = S('d2'); manual = S('e6')
    rew = EN('e6') + .12; sav = S('s1') - .5; lux = MK('s2'); dopa = MK('s3'); siteS = S('s3') - .25; whistle = MK('s4'); rule = S('s5') - .2; ruleStamp = MK('s5')
    lab = S('c1') - .55; goggles = S('c1') + .35; slow = MK('c1'); block = MK('c2', 0); fail = MK('c2', 1)
    ff = EN('c2') + .15; today = S('k1') - .4; indoor = S('k2') - .15; roof = S('k3') - .2; autoexp = S('k4') - .15; autoOn = MK('k4'); dusk = MK('k5'); realDark = S('k5')
    siteK = S('d3') - .3; keep = S('k6'); front = MK('k7'); board = S('k8') - .2; blur = MK('k8'); d4 = S('d4'); near = S('k9'); glasses = EN('k9') - 1.25; mismatch = S('k10') - .2; mmWord = MK('k10')
    gz = S('g1') - .5; gzExp = S('g2'); forty = MK('g2'); years3 = S('g3'); r395 = MK('g3', 0); r304 = MK('g3', 1); only40 = S('g4')
    guide = S('a1') - .5; twoH = MK('a1'); shade = MK('a2', 0); brighter = MK('a2', 1); kid = S('a3'); noUndo = MK('a3')
    fin = S('d5') - .45; click = TY('d5') + .5; door = TY('d5') + .85; out = EN('d5') + .2; z1 = S('z1'); sunWord = MK('z3'); blow = EN('z3') + .15; card = EN('z3') + 1.75


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


def tvec(d): return np.arange(int(max(d, 1e-3) * SR)) / SR
def lp(x, fc, o=2): return sosfilt(butter(o, fc, 'low', fs=SR, output='sos'), x)
def hp(x, fc, o=2): return sosfilt(butter(o, fc, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def noise(d): return rng.standard_normal(int(max(d, 1e-3) * SR))
def mf(m): return 440.0 * 2 ** ((m - 69) / 12)


# ---------------- 红白机音色 ----------------
OS = 4  # 过采样倍数：先高采样率生成方波，再滤波降采样，避免混叠刺耳


def pulse_wave(freqs, duty):
    """freqs：每个采样点的频率（Hz，原采样率长度）。返回带限的脉冲波。"""
    f = np.repeat(freqs, OS)
    ph = np.cumsum(f / (SR * OS)) % 1.0
    x = np.where(ph < duty, 1.0, -1.0)
    x -= (2 * duty - 1)  # 去直流
    return resample_poly(x, 1, OS)[:len(freqs)]


def adsr(n, a=.005, d=.08, s=.6, r=.05, gate=None):
    t = np.arange(n) / SR
    gate = gate if gate is not None else n / SR
    env = np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    rel = np.clip(1 - (t - gate) / max(r, 1e-4), 0, 1)
    return env * np.where(t > gate, rel, 1)


def square(m, d, duty=.25, vel=.5, vib=0.0, a=.004, dec=.1, sus=.55, rel=.04, slide=0.0):
    n = int((d + rel) * SR)
    t = np.arange(n) / SR
    f = mf(m) * (2 ** (slide * np.clip(t / max(d, 1e-3), 0, 1) / 12))
    if vib:
        f = f * (1 + vib * np.sin(2 * np.pi * 5.5 * t) * np.clip((t - .12) / .2, 0, 1))
    return pulse_wave(f, duty) * adsr(n, a, dec, sus, rel, d) * vel * .18


def tri(m, d, vel=.6, rel=.02):
    """4-bit 量化三角波（红白机的低音声部）"""
    n = int((d + rel) * SR)
    t = np.arange(n) / SR
    ph = (mf(m) * t) % 1
    x = 1 - 4 * np.abs(ph - .5)
    x = np.round(x * 7.5) / 7.5
    env = np.clip((d + rel - t) / rel, 0, 1) * np.minimum(1, t / .003)
    return lp(x, 6000) * env * vel * .32


def kick(vel=.8):
    t = tvec(.22)
    f = 150 * np.exp(-t / .03) + 45
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .09)
    return (x + .2 * lp(noise(.22), 900) * np.exp(-t / .01)) * vel * .55


def snare(vel=.6):
    t = tvec(.18)
    x = bp(noise(.18), 1200, 7000) * np.exp(-t / .045) + .5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t / .03)
    return x * vel * .32


def hat(vel=.4, d=.05):
    t = tvec(d)
    return hp(noise(d), 7000) * np.exp(-t / (d / 3)) * vel * .18


def clank(vel=.5, f=820):
    """锤子敲在金属上"""
    t = tvec(.25)
    x = (np.sin(2 * np.pi * f * t) + .6 * np.sin(2 * np.pi * f * 2.76 * t) + .4 * np.sin(2 * np.pi * f * 5.4 * t)) * np.exp(-t / .06)
    x += .5 * bp(noise(.25), 2000, 8000) * np.exp(-t / .012)
    return x * vel * .2


# ---------------- 配乐：简单的"音轨编排器" ----------------
CH = {'': [0, 4, 7], 'm': [0, 3, 7], '7': [0, 4, 7, 10], 'm7': [0, 3, 7, 10], 'M7': [0, 4, 7, 11], 'sus': [0, 5, 7]}


def chord(name):
    """'C', 'Am', 'G7', 'F#m' → (根音 MIDI, 和弦音程)"""
    root = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}[name[0]]
    q = name[1:]
    if q.startswith('#'):
        root += 1; q = q[1:]
    elif q.startswith('b'):
        root -= 1; q = q[1:]
    return 48 + root, CH[q]


def cue(t0, t1, bpm, prog, lead=None, drums='basic', arp=True, bass='eighth', vol=1.0, fade_in=.25, fade_out=.35,
        lead_duty=.25, arp_duty=.125, layers=None, swing=0.0, lead_oct=0):
    """在 [t0, t1) 里按 bpm 循环和弦进行 prog（每个和弦一小节 4 拍）。
    lead：[(拍, 相对和弦根音的 MIDI 偏移 或 绝对 MIDI（>=60）, 拍长)]，按 len(prog) 小节循环。"""
    beat = 60 / bpm
    bar = beat * 4
    out = np.zeros((2, N))

    def put(sig, t, g=1., pan=0.):
        place(out, sig, t, g, pan)

    nb = int(np.ceil((t1 - t0) / bar)) + 1
    for b in range(nb):
        tb = t0 + b * bar
        if tb >= t1:
            break
        root, iv = chord(prog[b % len(prog)])
        on = (lambda k: True) if layers is None else (lambda k: layers(k, tb))
        # 低音
        if bass and on('bass'):
            if bass == 'eighth':
                for k in range(8):
                    t = tb + k * beat / 2 + (swing * beat / 2 if k % 2 else 0)
                    if t < t1:
                        put(tri(root - 12 + (12 if k in (3, 7) else 0) + (7 if k == 6 else 0), beat * .42, .7), t)
            elif bass == 'half':
                for k in range(2):
                    t = tb + k * beat * 2
                    if t < t1:
                        put(tri(root - 12 + (7 if k else 0), beat * 1.8, .65), t)
            elif bass == 'pulse':
                for k in range(16):
                    t = tb + k * beat / 4
                    if t < t1:
                        put(tri(root - 12, beat * .2, .55 if k % 4 == 0 else .35), t)
        # 琶音
        if arp and on('arp'):
            notes = [root + 12 + i for i in iv] + [root + 24]
            for k in range(16):
                t = tb + k * beat / 4 + (swing * beat / 4 if k % 2 else 0)
                if t < t1:
                    put(square(notes[k % len(notes)], beat * .18, arp_duty, .32, dec=.04, sus=.3), t, 1, -.35)
        # 主旋律
        if lead and on('lead'):
            loop = len(prog)
            for (bt, m, ln) in lead:
                lb = bt // 4
                if lb % loop != b % loop:
                    continue
                t = tb + (bt % 4) * beat
                if t >= t1:
                    continue
                mm = (m if m >= 60 else root + 24 + m) + lead_oct
                put(square(mm, ln * beat * .9, lead_duty, .55, vib=.004, dec=.15, sus=.6), t, 1, .25)
        # 鼓
        if drums and on('drums'):
            for k in range(16):
                t = tb + k * beat / 4
                if t >= t1:
                    continue
                if drums in ('basic', 'four'):
                    if (drums == 'four' and k % 4 == 0) or (drums == 'basic' and k in (0, 6, 8)):
                        put(kick(.8), t)
                    if k in (4, 12):
                        put(snare(.6), t)
                    if k % 2 == 0:
                        put(hat(.35 if k % 4 else .5), t, 1, .3)
                elif drums == 'soft':
                    if k in (0, 8):
                        put(kick(.55), t)
                    if k in (4, 12):
                        put(hat(.5, .09), t, 1, .2)
                    if k % 2 == 1:
                        put(hat(.18), t, 1, -.2)
                elif drums == 'work':
                    if k in (0, 8):
                        put(kick(.7), t)
                    if k in (4, 12):
                        put(clank(.55, 760 + 60 * (k == 12)), t, 1, .2)
                    if k % 2 == 0:
                        put(hat(.3), t, 1, -.3)
                elif drums == 'tick':
                    if k % 4 == 0:
                        put(hat(.5, .03), t, 1, .4)
                    if k == 0:
                        put(kick(.5), t)
    # 淡入淡出
    i0, i1 = int(t0 * SR), min(N, int(t1 * SR) + int(.6 * SR))
    env = np.ones(i1 - i0)
    tt = np.arange(i1 - i0) / SR
    env *= np.clip(tt / max(fade_in, 1e-3), 0, 1)
    env *= np.clip((t1 - t0 - tt) / max(fade_out, 1e-3) + 1, 0, 1) * (tt < t1 - t0 + fade_out)
    music[:, i0:i1] += out[:, i0:i1] * env * vol


# ---------------- 音效 ----------------
def blip(m, d=.05, duty=.5, vel=.5):
    return square(m, d, duty, vel, a=.001, dec=.03, sus=.4, rel=.02)


def pop_snd(m=84, vel=.5):
    t = tvec(.12)
    f = mf(m) * (1 + 1.5 * np.exp(-t / .02))
    return pulse_wave(f, .5) * np.exp(-t / .04) * vel * .2


def coin(vel=.5):
    return np.concatenate([blip(83, .06, .5, vel), blip(88, .18, .5, vel)])


def jingle(notes, step=.08, duty=.5, vel=.5, last=.35):
    out = []
    for i, m in enumerate(notes):
        out.append(square(m, last if i == len(notes) - 1 else step, duty, vel, a=.002, dec=.08, sus=.5, rel=.03)[:int((last if i == len(notes) - 1 else step) * SR)])
    return np.concatenate(out)


def stamp_snd():
    t = tvec(.3)
    return (np.sin(2 * np.pi * 70 * t) * np.exp(-t / .06) * .8 + lp(noise(.3), 1500) * np.exp(-t / .03) * .6) * .25


def whoosh(d=.5, up=True, vel=.5):
    t = tvec(d)
    u = t / d
    fc = (300 + 4000 * u) if up else (4300 - 4000 * u)
    x = noise(d)
    y = np.zeros_like(x)
    # 分段扫频带通
    seg = int(.02 * SR)
    for i in range(0, len(x), seg):
        c = fc[min(i, len(fc) - 1)]
        y[i:i + seg] = bp(x[max(0, i - 2000):i + seg], c * .7, min(c * 1.4, SR / 2 - 100))[-len(y[i:i + seg]):]
    return y * np.sin(np.pi * u) * vel * .4


def whistle(d=.9, vel=.6):
    """哨子：约 2.8kHz，带 30Hz 的颤音和一点气声"""
    t = tvec(d)
    trill = 1 + .035 * np.sign(np.sin(2 * np.pi * 28 * t))
    f = 2800 * trill * (1 + .02 * np.clip(t / .05, 0, 1))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + .25 * bp(noise(d), 2400, 3400)
    env = np.minimum(1, t / .02) * np.clip((d - t) / .08, 0, 1)
    return x * env * vel * .25


def tape(d=.9, down=True):
    """录像带倒带/快进：高音扫频 + 嘶嘶声"""
    t = tvec(d)
    f = (1800 - 1300 * t / d) if down else (600 + 1500 * t / d)
    x = pulse_wave(f, .5) * .5 + .4 * hp(noise(d), 3000)
    x *= (.6 + .4 * np.sign(np.sin(2 * np.pi * 14 * t)))
    return x * np.minimum(1, t / .03) * np.clip((d - t) / .1, 0, 1) * .16


def buzz(d=.35, m=40):
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


def chirp(vel=.4):
    """小鸡叫"""
    t = tvec(.09)
    f = 2400 + 1600 * np.sin(np.pi * t / .09)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / .09) * vel * .2


def bell_ring(d=1.6):
    """上课铃（电铃）"""
    t = tvec(d)
    x = (np.sin(2 * np.pi * 1850 * t) + .5 * np.sin(2 * np.pi * 2650 * t)) * (.6 + .4 * np.sign(np.sin(2 * np.pi * 22 * t)))
    return x * np.minimum(1, t / .01) * np.clip((d - t) / .1, 0, 1) * .12


def tick(vel=.4):
    t = tvec(.03)
    return hp(noise(.03), 3000) * np.exp(-t / .006) * vel * .4


def snore(d=1.2):
    t = tvec(d)
    x = lp(noise(d), 400) * (np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2)
    return x * .25


def click_snd():
    t = tvec(.04)
    return (hp(noise(.04), 2000) * np.exp(-t / .004) + np.sin(2 * np.pi * 1500 * t) * np.exp(-t / .008)) * .35


def glitch(d=.4):
    out = np.zeros(int(d * SR))
    k = 0
    while k < len(out):
        L = int(rng.integers(300, 2500))
        m = 36 + int(rng.integers(0, 40))
        s = square(m, L / SR, [.125, .25, .5][int(rng.integers(0, 3))], .5, a=.0005, dec=.01, sus=1, rel=.001)[:L]
        out[k:k + len(s)] += s[:len(out) - k]
        k += L
    return out * .8


def type_beeps(lid, m, step=None):
    """对话框逐字打出的"哔哔"声"""
    l = LN[lid]
    n = len(l['text'])
    for i, ch in enumerate(l['text']):
        if ch in '，。…！？：、 ':
            continue
        t = l['v0'] + .08 + (l['typed'] - l['v0'] - .08) * i / max(1, n)
        if i % 2 == 0:
            place(sfx, blip(m + (i * 7 % 5) - 2, .035, .5, .45), t, .7)
    place(sfx, pop_snd(76, .4), l['v0'], .6)


# ================= 配乐编排 =================
def build_music():
    # 开头：好奇、俏皮（C 大调 132）
    lead_a = [(0, 72, .5), (.5, 76, .5), (1, 79, .5), (1.5, 76, .5), (2, 81, 1), (3, 79, .5), (3.5, 76, .5),
              (4, 77, .5), (4.5, 81, .5), (5, 79, .5), (5.5, 77, .5), (6, 76, 1.5),
              (8, 77, .5), (8.5, 81, .5), (9, 84, .5), (9.5, 81, .5), (10, 79, 1), (11, 77, 1),
              (12, 76, .5), (12.5, 74, .5), (13, 79, 1.5), (15, 74, .5)]
    cue(0, T.half - .05, 132, ['C', 'Am', 'F', 'G'], lead=lead_a, drums='basic', vol=.9, fade_in=.01)
    # 只对一半：滑音"哇哇"
    for i, m in enumerate([67, 66, 65]):
        place(music, square(m, .2, .5, .6, vib=.01), T.half + i * .22, .9)
    place(music, square(64, .55, .5, .6, vib=.02, slide=-1), T.half + .66, .9)
    # 北极回放：轻一点，不要鼓
    lead_b = [(0, 76, 1), (1, 79, 1), (2, 84, 2), (4, 81, 1), (5, 79, 1), (6, 76, 2),
              (8, 77, 1), (9, 81, 1), (10, 84, 2), (12, 83, 1.5), (13.5, 79, .5), (14, 79, 2)]
    cue(T.arctic, T.ceil - .1, 132, ['C', 'Am', 'F', 'G'], lead=lead_b, drums='soft', vol=.75, lead_duty=.125)
    # 天花板：鼓滚 + 上行低音
    t0, t1 = T.ceil - .05, T.ceilWord
    k = 0
    while t0 + k * .07 < t1:
        t = t0 + k * .07
        u = (t - t0) / (t1 - t0)
        place(music, snare(.25 + .55 * u), t, 1)
        k += 1
    for i in range(8):
        place(music, tri(40 + i, (t1 - t0) / 8 * .95, .8), t0 + i * (t1 - t0) / 8)
    # 眼球工地：F 大调 120，"施工"律动
    lead_c = [(0, 77, .5), (.5, 81, .5), (1, 84, .5), (2, 81, .5), (2.5, 77, .5), (3, 72, 1),
              (4, 74, .5), (4.5, 77, .5), (5, 82, .5), (6, 81, .5), (6.5, 77, .5), (7, 74, 1),
              (8, 72, .5), (8.5, 76, .5), (9, 79, .5), (10, 84, 1), (11, 82, .5), (11.5, 79, .5),
              (12, 77, 1.5), (13.5, 76, .5), (14, 77, 2)]
    def site_layers(k, tb):
        if k == 'lead':
            return not (T.d2 - .3 < tb < EN('d2'))
        if k == 'drums':
            return tb > T.crew - .5
        return True
    cue(T.site + .1, T.rew - .1, 120, ['F', 'Bb', 'C', 'F'], lead=lead_c, drums='work', vol=.8, layers=site_layers, lead_duty=.5)
    # 草原：G 大调 140，明亮
    lead_d = [(0, 79, .5), (.5, 81, .5), (1, 83, 1), (2, 86, 1), (3, 83, 1),
              (4, 88, .5), (4.5, 86, .5), (5, 83, 1), (6, 81, 2),
              (8, 84, .5), (8.5, 83, .5), (9, 79, 1), (10, 76, 1), (11, 79, 1),
              (12, 81, .5), (12.5, 83, .5), (13, 81, 1), (14, 79, 2)]
    cue(T.sav, T.whistle - .05, 140, ['G', 'Em', 'C', 'D'], lead=lead_d, drums='basic', vol=.85, fade_in=.15)
    cue(T.whistle + .9, T.lab, 140, ['C', 'G', 'Am', 'F'], lead=None, drums='soft', vol=.6, arp=True)
    # 小鸡实验：E 小调 112，"实验室"
    lead_f = [(0, 76, .25), (.5, 79, .25), (1, 83, .25), (1.5, 79, .25), (2, 88, .5), (3, 86, .5),
              (4, 84, .25), (4.5, 79, .25), (5, 76, .25), (5.5, 79, .25), (6, 84, 1),
              (8, 81, .25), (8.5, 84, .25), (9, 88, .25), (9.5, 84, .25), (10, 81, 1),
              (12, 83, .25), (12.5, 87, .25), (13, 90, .5), (14, 87, 1)]
    cue(T.lab + .1, T.ff, 112, ['Em', 'C', 'Am', 'B7'], lead=lead_f, drums='soft', vol=.75, bass='pulse')
    # 教室：A 小调 96，低保真
    def class_layers(k, tb):
        if k in ('drums', 'lead') and tb > T.realDark - .2:
            return False
        return True
    lead_g = [(0, 76, 1), (1, 79, .5), (1.5, 76, .5), (2, 74, 2), (4, 77, 1), (5, 81, .5), (5.5, 77, .5), (6, 76, 2),
              (8, 74, 1), (9, 77, .5), (9.5, 74, .5), (10, 71, 2), (12, 72, 1), (13, 76, 1), (14, 79, 2)]
    cue(T.today + .9, T.siteK, 96, ['Am7', 'Dm7', 'G7', 'CM7'], lead=lead_g, drums='soft', vol=.7, swing=.18, lead_duty=.125)
    # 夜班：D 小调 100，紧张
    cue(T.siteK, T.board + .3, 100, ['Dm', 'Dm', 'Bb', 'A'], lead=None, drums='tick', vol=.75, bass='pulse', arp=True, arp_duty=.25)
    # 黑板 → 进化错配
    cue(T.board, T.glasses - .1, 100, ['Dm', 'Bb', 'Gm', 'A'], lead=None, drums='tick', vol=.6, bass='half')
    cue(T.mismatch + .6, T.gz + .2, 100, ['Dm', 'Bb', 'C', 'A'], lead=None, drums=None, vol=.5, bass='half')
    # 广州实验：C 大调 120，充满希望
    lead_j = [(0, 72, 1), (1, 76, 1), (2, 79, 1.5), (3.5, 81, .5), (4, 79, 2), (6, 74, 2),
              (8, 76, 1), (9, 79, 1), (10, 84, 1.5), (11.5, 83, .5), (12, 81, 2), (14, 79, 2)]
    def gz_layers(k, tb):
        if k == 'lead':
            return tb > T.gzExp
        if k == 'drums':
            return tb > CK('g2', 2) - .3
        return True
    cue(T.gz + .1, T.guide, 120, ['C', 'G', 'Am', 'F'], lead=lead_j, drums='basic', vol=.75, layers=gz_layers)
    # 攻略：D 大调 128，阳光
    lead_k = [(0, 74, .5), (.5, 78, .5), (1, 81, 1), (2, 86, 1), (3, 85, .5), (3.5, 83, .5),
              (4, 81, 1), (5, 85, 1), (6, 88, 2), (8, 86, .5), (8.5, 83, .5), (9, 79, 1), (10, 83, 1), (11, 86, 1),
              (12, 85, .5), (12.5, 83, .5), (13, 81, 1), (14, 78, 1), (15, 81, 1)]
    cue(T.guide, T.fin - .05, 128, ['D', 'A', 'Bm', 'G'], lead=lead_k, drums='basic', vol=.8)
    # 结尾：出门之后，温暖、慢慢变亮
    lead_l = [(0, 76, 2), (2, 79, 2), (4, 81, 3), (7, 79, 1), (8, 77, 2), (10, 76, 2), (12, 74, 3), (15, 79, 1)]
    cue(T.door + .1, T.blow - .1, 92, ['C', 'Am', 'F', 'G'], lead=lead_l, drums='soft', vol=.75, lead_duty=.125, fade_in=1.2)
    # 吹哨之后：欢快收尾
    lead_m = [(0, 84, .5), (.5, 86, .5), (1, 88, 1), (2, 91, 1), (3, 88, 1), (4, 89, .5), (4.5, 88, .5), (5, 86, .5), (5.5, 84, .5), (6, 84, 2)]
    cue(T.blow + .6, DUR, 132, ['C', 'F', 'G', 'C'], lead=lead_m, drums='basic', vol=.85, fade_out=.8)
    # 片尾的终止和弦
    for m in (60, 64, 67, 72):
        place(music, square(m, 1.6, .25, .45, dec=.6, sus=.5, rel=.6), DUR - 2.3, .8)


# ================= 音效编排 =================
def build_sfx():
    # —— 开头 ——
    place(sfx, jingle([72, 76, 79, 84], .06, .5, .5, .25), 0.02, .7)
    type_beeps('d1', 84)
    place(sfx, stamp_snd(), T.half, 1.0)
    # 回放
    place(sfx, click_snd(), T.arctic - .05, 1.0)
    place(sfx, glitch(.3), T.arctic - .02, .5)
    place(sfx, pop_snd(80), T.noPhone, .8)
    place(sfx, buzz(.18, 52), T.noPhone + .15, .35)
    place(sfx, pop_snd(76), T.pct3, .8)
    for i in range(3):
        place(sfx, pop_snd(86 + i * 2, .5), T.pct50 + [0, 2, 3][i] * .07, .8)
    place(sfx, jingle([64, 63, 62], .09, .25, .5, .25), T.pct50 + .3, .6)
    # 天花板
    place(sfx, stamp_snd(), T.ceilWord, 1.0)
    place(sfx, hp(noise(1.2), 4000) * np.exp(-tvec(1.2) / .35) * .08, T.ceilWord, 1)
    # 钻进眼睛
    place(sfx, whoosh(.7, True, .8), T.dive - .3, 1)
    place(sfx, jingle([60, 67, 72, 79], .05, .25, .4, .2), T.site + .1, .6)
    # —— 眼球工地 ——
    place(sfx, sparkle(.5, 88, .3), T.behind - .1, .7)
    place(sfx, jingle([67, 72, 76], .08, .5, .5, .2), T.crew, .8)                 # 开工
    t = T.grow0
    while t < T.onRet:
        place(sfx, clank(.35, 900 + 120 * ((int(t * 3)) % 2)), t, .8, .3)
        t += 1 / 3
    place(sfx, coin(.5), T.onRet, .9)                                            # 对焦成功
    place(sfx, tape(.5, True), T.replay, .7)                                      # 回放
    place(sfx, pop_snd(72), T.reserve - .05, .9)
    t = T.useUp
    while t < T.useUp + 1.1:
        place(sfx, clank(.3, 950), t, .7, .3)
        t += .2
    place(sfx, jingle([76, 72], .1, .5, .5, .2), T.stopSign, .8)                 # 停工
    type_beeps('d2', 72)
    place(sfx, whoosh(.45, False, .5), T.manual, .8)
    place(sfx, thud(.9), T.manual + .45, 1)
    # —— 倒带 ——
    place(sfx, tape(.95, True), T.rew - .05, 1)
    # —— 草原 ——
    for i in range(10):
        place(sfx, blip(72 + i * 2, .03, .25, .4), T.lux - .5 + i * .05, .7)      # 读数往上跳
    place(sfx, coin(.45), T.lux + .05, .8)
    place(sfx, whoosh(.4, True, .4), T.siteS - .1, .7)
    place(sfx, sparkle(1.4, 86, .35), T.dopa - .05, .8)
    place(sfx, whistle(1.0, .7), T.whistle - .02, 1.0)
    place(sfx, pop_snd(80), T.whistle + .25, .7)
    for i in range(3):
        place(sfx, pop_snd(76 + i * 3), T.rule + .5 + i * .45, .8)
    place(sfx, stamp_snd(), T.ruleStamp, 1.0)
    # —— 小鸡实验 ——
    for k in range(10):
        place(sfx, chirp(.5), T.lab + .5 + k * .73 + rng.random() * .3, .8, -.4 if k % 2 else .4)
    place(sfx, pop_snd(84), T.goggles, .8); place(sfx, pop_snd(86), T.goggles + .08, .8)
    place(sfx, sparkle(.4, 84, .3), T.slow, .6)
    place(sfx, whoosh(.35, True, .4), T.block - .6, .6)
    place(sfx, hp(noise(.15), 3000) * np.exp(-tvec(.15) / .05) * .08, T.block, .8)
    place(sfx, buzz(.25, 45), T.fail - .05, .5)
    place(sfx, stamp_snd(), T.fail, 1.0)
    # —— 快进 → 今天 ——
    place(sfx, tape(.75, False), T.ff - .05, 1)
    place(sfx, bell_ring(1.4), T.today + .7, .9)
    for i in range(int((T.roof - T.indoor) / .09)):
        place(sfx, tick(.45), T.indoor + .2 + i * .09, .7)
    place(sfx, sparkle(.6, 91, .3), T.roof + .1, .6)
    place(sfx, stamp_snd(), T.roof + .2, .6)
    # 自动调亮
    t = tvec(T.autoOn - T.autoexp - .5)
    place(sfx, square(60, len(t) / SR, .25, .35, slide=24, dec=1, sus=1), T.autoexp + .5, .5)
    place(sfx, coin(.4), T.autoOn, .7)
    place(sfx, square(72, .6, .5, .5, slide=-30, dec=1, sus=1), T.realDark, .5)          # 关掉：降调
    for i, d in enumerate([-.2, 0, .35]):
        place(sfx, pop_snd(80 + i * 3), T.dusk + d, .7)
    # —— 夜班 ——
    place(sfx, whoosh(.45, False, .4), T.siteK - .1, .6)
    place(sfx, snore(1.3), T.siteK + .2, .6)
    place(sfx, snore(1.3), T.siteK + 2.0, .5)
    type_beeps('d3', 72)
    t = T.keep + .2
    while t < T.front:
        place(sfx, clank(.3, 880 + 100 * ((int(t * 3)) % 2)), t, .7, .3)
        t += 1 / 3
    place(sfx, buzz(.2, 64), T.front, .5); place(sfx, buzz(.2, 64), T.front + .25, .5)
    # 黑板糊了
    place(sfx, square(76, .7, .5, .45, slide=-7, vib=.03, dec=1, sus=1), T.blur - .3, .45)
    type_beeps('d4', 84)
    for i, d in enumerate([0, .35, .7, 1.0]):
        place(sfx, thud(.5), T.near + .3 + d + .35, .7)
    place(sfx, jingle([60, 55], .1, .25, .5, .25), CK('k9', 1), .7)
    # 获得道具（反讽的小号）
    place(sfx, jingle([67, 72, 76, 79, 84], .07, .5, .55, .5), T.glasses, .9)
    place(sfx, buzz(.4, 41), T.mismatch + .05, .7)
    place(sfx, glitch(.35), T.mismatch + .05, .4)
    place(sfx, stamp_snd(), T.mmWord, 1.0)
    # —— 广州 ——
    place(sfx, pop_snd(76), S('g2') - .05, .8)
    for i in range(12):
        place(sfx, pop_snd(72 + (i % 6) * 2, .35), CK('g2', 1) + i * .05, .5)
    place(sfx, whoosh(.5, True, .4), CK('g2', 2) - .1, .6)
    place(sfx, coin(.5), T.forty, .9)
    for i in range(8):
        place(sfx, pop_snd(84, .3), T.years3 + .2 + i * (T.r395 - T.years3 - .5) / 8, .5, -.4)
    for i in range(6):
        place(sfx, pop_snd(88, .3), T.years3 + .2 + i * (T.r304 - T.years3 - .5) / 6, .5, .4)
    place(sfx, jingle([60, 64, 67], .06, .5, .45, .2), T.r395, .7)
    place(sfx, jingle([67, 72, 76], .06, .5, .45, .2), T.r304, .7)
    place(sfx, sparkle(.6, 84, .35), T.only40, .8)
    # —— 攻略 ——
    for k, t in enumerate([CK('a1', 1), CK('a2', 1), CK('a3', 0)]):
        place(sfx, coin(.4), t, .7)
    place(sfx, whoosh(.5, False, .3), S('a2') + .9, .5)
    place(sfx, buzz(.25, 50), T.noUndo, .55)
    # —— 结尾 ——
    place(sfx, buzz(.18, 60), S('d5'), .5); place(sfx, buzz(.18, 60), S('d5') + .22, .5)
    type_beeps('d5', 80)
    place(sfx, click_snd(), T.click, 1.2)
    place(sfx, whoosh(.6, True, .7), T.click + .2, .8)
    for i in range(16):
        place(sfx, blip(60 + i * 2, .05, .25, .35), T.door + .2 + i * (S('z2') - T.door - .3) / 16, .55)
    place(sfx, coin(.4), S('z2'), .6)
    place(sfx, sparkle(1.0, 84, .3), T.sunWord, .6)
    place(sfx, whistle(1.1, .75), T.blow - .02, 1.0)
    place(sfx, jingle([72, 76, 79, 84, 88], .06, .5, .55, .4), T.blow + .4, .8)
    for i in range(12):
        place(sfx, pop_snd(86 + (i % 4) * 3, .25), T.blow + .3 + i * .08, .5, (i % 3 - 1) * .5)


# ================= 配音 =================
def build_voice():
    for l in TLD['lines']:
        if l['spk'] == 'D':
            continue
        p = os.path.join(HERE, l['file'])
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'],
                             capture_output=True, check=True).stdout
        x = np.frombuffer(raw, dtype=np.int16).astype(np.float64) / 32768
        x = hp(x, 70)
        place(voice, x, l['start'], 1.0)


def duck_env():
    """旁白说话时把音乐压低约 9 dB，带平滑"""
    g = np.ones(N)
    for l in TLD['lines']:
        if l['spk'] == 'D':
            continue
        i0, i1 = int((l['v0'] - .12) * SR), int((l['v1'] + .2) * SR)
        g[max(0, i0):min(N, i1)] = .3
    k = int(.12 * SR)
    ker = np.ones(k) / k
    return np.convolve(g, ker, mode='same')


def main(out, with_voice=True):
    build_music()
    build_sfx()
    if with_voice:
        build_voice()
    d = duck_env() if with_voice else 1.0   # 没有旁白就不用给它让位
    mix = music * d * .55 + sfx * .8 + voice * 1.0
    # 轻微的总线压缩 + 限幅
    peak = np.max(np.abs(mix))
    if peak > .98:
        mix = mix / peak * .98
    wavfile.write(out, SR, (mix.T * 32767).astype(np.int16))
    print('写出', out, f'{DUR:.2f}s')


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    main(args[0] if args else 'out/audio.wav', with_voice='--no-voice' not in sys.argv)
