"""声音：原曲（剪掉开头 1 秒的静音）+ 两句画外音 + numpy 合成的音效和环境声。
没有另加配乐（歌就是音乐）。音效和环境声在歌手唱的时候让开（压低约 8 dB），画外音念的时候前奏压低约 3 dB；
短促的音效不压在画外音的字头上（按 voice_cv3/n_*.json 的逐字时间躲开）。
成片 −16 LUFS，4 倍过采样找真峰值，限幅到 −1.0 dBTP。

运行：python3 mix.py out/audio.wav（先跑 node render.cjs sfx out/sfx.json 导出画面里的动作时刻）
需要：numpy、scipy、soundfile、pyloudnorm；原曲在 audio/song.wav，Demucs 分出的人声在 out/demucs/htdemucs/song/vocals.wav"""
import json
import re
import sys

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly

SR = 44100
TJS = open('timing.js', encoding='utf-8').read()
OFFSET = float(re.search(r'const OFFSET = ([\d.]+)', TJS).group(1))
SONG_END = float(re.search(r'const SONG_END = ([\d.]+)', TJS).group(1))
VO_T = {k: float(v) for k, v in re.findall(r'(h1|e1): ([\d.]+)', re.search(r'const VO = \{([^}]*)\}', TJS).group(1))}
DUR = SONG_END - OFFSET
N = int(DUR * SR)
rng = np.random.default_rng(7)


def T(ts):            # 歌曲时间 → 成片里的采样位置
    return int(round((ts - OFFSET) * SR))


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo / (SR / 2), hi / (SR / 2)], 'band', output='sos'), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f / (SR / 2), 'low', output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f / (SR / 2), 'high', output='sos'), x)


def noise(sec, seed=None):
    r = np.random.default_rng(seed) if seed is not None else rng
    return r.standard_normal(int(sec * SR))


def env_ad(n, a, d):  # 起音 a 秒、按指数衰减 d 秒
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / max(d, 1e-4))
    return e


def fade(x, fi=0.02, fo=0.05):
    n = len(x); a = min(n, int(fi * SR)); b = min(n, int(fo * SR))
    x = x.copy()
    if a: x[:a] *= np.linspace(0, 1, a)
    if b: x[-b:] *= np.linspace(1, 0, b)
    return x


def norm(x, peak=1.0):
    m = np.abs(x).max() + 1e-12
    return x / m * peak


# ---------------- 音效 ----------------
def s_pencil(dur=1.0, gain=1.0, long=0, **k):
    # 铅笔在纸上：2~6 kHz 的沙沙声，一下一下（每秒 4~7 笔），带一点纸的颗粒
    n = int(dur * SR); t = np.arange(n) / SR
    x = bp(noise(dur), 1800, 6500)
    rate = 5.5 if not long else 1.2
    strokes = 0.35 + 0.65 * np.clip(np.sin(2 * np.pi * rate * t + 2 * np.sin(2 * np.pi * 0.7 * t)), 0, 1) ** 0.7
    grain = 1 + 0.6 * bp(noise(dur), 20, 200) / 3
    return fade(norm(x * strokes * grain) * 0.5 * gain, 0.04, 0.12)


def s_eraser(dur=1.0, **k):
    n = int(dur * SR); t = np.arange(n) / SR
    x = bp(noise(dur), 400, 2500)
    rub = 0.3 + 0.7 * np.abs(np.sin(2 * np.pi * 7 * t))
    return fade(norm(x * rub) * 0.5, 0.05, 0.15)


def s_rubbing(dur=2.4, **k):     # 铅笔侧过来涂：宽一点、软一点、长长的来回
    n = int(dur * SR); t = np.arange(n) / SR
    x = bp(noise(dur), 900, 4500)
    rub = 0.35 + 0.65 * np.abs(np.sin(2 * np.pi * 2.6 * t)) ** 0.6
    return fade(norm(x * rub) * 0.5, 0.2, 0.4)


def s_shimmer(dur=1.8, **k):     # 月光、星星：几个高音的正弦，随机失谐，慢慢起、慢慢落
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.zeros(n)
    r = np.random.default_rng(31)
    for f in [2093, 2637, 3136, 3951, 4699]:
        st = r.uniform(0, dur * 0.5); e = np.clip((t - st) / 0.25, 0, 1) * np.exp(-np.maximum(0, t - st) / 0.9)
        x += np.sin(2 * np.pi * f * (1 + r.uniform(-0.003, 0.003)) * t) * e
    return fade(norm(x) * 0.25, 0.2, 0.3)


def s_sparkleDraw(dur=2.0, **k):
    return s_shimmer(dur) * 0.8 + s_pencil(dur, 0.5)


def s_door(**k):                 # 木门：低沉的一下 + 一点吱呀
    d = 0.9; n = int(d * SR); t = np.arange(n) / SR
    thump = lp(noise(d), 300) * env_ad(n, 0.005, 0.08) * 3
    creak = np.sin(2 * np.pi * (380 + 60 * np.sin(2 * np.pi * 3 * t)) * t) * np.clip((t - 0.05) / 0.1, 0, 1) * np.exp(-t / 0.35) * 0.3
    return fade(norm(thump + creak) * 0.5, 0.002, 0.2)


def s_doorCreak(**k):
    d = 1.2; n = int(d * SR); t = np.arange(n) / SR
    f = 300 + 200 * t + 30 * np.sin(2 * np.pi * 9 * t)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 14 * t)))
    return fade(norm(bp(x + 0.3 * noise(d), 200, 2500)) * 0.3, 0.1, 0.3)


def s_bubble(**k):               # 对话泡泡冒出来：轻轻一"啵"
    d = 0.25; n = int(d * SR); t = np.arange(n) / SR
    f = 500 + 900 * (1 - np.exp(-t / 0.03))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(n, 0.004, 0.06)
    return norm(x) * 0.35


def s_heartOut(**k):
    d = 1.4; n = int(d * SR); t = np.arange(n) / SR
    whoosh = bp(noise(d), 300, 2000) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2 * 0.4
    chime = sum(np.sin(2 * np.pi * f * t) * np.exp(-t / 0.7) for f in [1318, 1975]) * np.clip(t / 0.05, 0, 1) * 0.3
    return fade(norm(whoosh + chime) * 0.35, 0.05, 0.2)


def s_paperFall(**k):            # 纸心皱起来掉下去：几下纸的窸窣
    d = 1.2; x = np.zeros(int(d * SR))
    r = np.random.default_rng(5)
    for i in range(7):
        st = int(r.uniform(0, d - 0.12) * SR); L = int(0.08 * SR)
        x[st:st + L] += bp(noise(0.08), 1500, 7000)[:L] * env_ad(L, 0.005, 0.025)
    return norm(x) * 0.35


def s_gasp(soft=0, **k):         # 一惊：短短的一下往上滑的音（不用人声）
    d = 0.35; n = int(d * SR); t = np.arange(n) / SR
    f = 600 + 900 * t / d
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 2
    return norm(x) * (0.15 if soft else 0.22)


def s_pencilDrop(**k):           # 铅笔掉在木板上：两下清脆的"嗒"，再滚一下
    d = 1.2; x = np.zeros(int(d * SR)); t = np.arange(len(x)) / SR
    for st, a in [(0.0, 1), (0.13, 0.6), (0.21, 0.35)]:
        i = int(st * SR); L = int(0.06 * SR)
        click = (np.sin(2 * np.pi * 2400 * np.arange(L) / SR) + 0.6 * np.sin(2 * np.pi * 3700 * np.arange(L) / SR)) * env_ad(L, 0.001, 0.012)
        x[i:i + L] += click * a
    roll = bp(noise(d), 800, 3000) * np.clip((t - 0.25) / 0.05, 0, 1) * np.exp(-np.maximum(0, t - 0.25) / 0.3) * 0.15 * (1 + np.sin(2 * np.pi * 18 * t))
    return norm(x + roll) * 0.4


def s_jolt(**k):
    d = 0.4; n = int(d * SR); t = np.arange(n) / SR
    return norm(bp(noise(d), 300, 3000) * np.sin(np.pi * t / d) ** 2) * 0.25


def s_flip(**k):                 # 翻一页纸
    d = 0.22; n = int(d * SR); t = np.arange(n) / SR
    x = bp(noise(d), 1200, 8000) * np.sin(np.pi * t / d) ** 1.5 * (1 + 0.5 * np.sin(2 * np.pi * 40 * t))
    return norm(x) * 0.3


def s_pageFlips(dur=2.6, n=7, soft=0, **k):
    x = np.zeros(int(dur * SR) + SR)
    for i in range(int(n)):
        st = int(dur * i / max(1, n) * SR); f = s_flip()
        x[st:st + len(f)] += f * (0.6 if soft else 1.0)
    return x


def s_pageFlipsBack(dur=3.9, n=14, soft=0, **k):   # 越翻越快
    x = np.zeros(int(dur * SR) + SR)
    for i in range(int(n)):
        u = (i / n) ** 0.65
        st = int(dur * u * SR); f = s_flip()
        x[st:st + len(f)] += f * (0.5 if soft else 0.85)
    return x


def s_bookShut(soft=0, **k):
    d = 0.5; n = int(d * SR)
    x = lp(noise(d), 400) * env_ad(n, 0.003, 0.05) * 2 + bp(noise(d), 800, 4000) * env_ad(n, 0.002, 0.02) * 0.4
    return norm(x) * (0.3 if soft else 0.45)


def s_slide(**k):
    d = 0.5; n = int(d * SR); t = np.arange(n) / SR
    return norm(bp(noise(d), 800, 5000) * np.sin(np.pi * t / d)) * 0.25


def s_pour(dur=2.6, **k):        # 细细的水流冲进滤杯：带点咕嘟
    n = int(dur * SR); t = np.arange(n) / SR
    stream = bp(noise(dur), 2000, 7000) * 0.4
    gl = np.zeros(n); r = np.random.default_rng(9)
    for i in range(int(dur * 14)):
        st = int(r.uniform(0, dur - 0.05) * SR); L = int(0.03 * SR); f = r.uniform(500, 1400)
        gl[st:st + L] += np.sin(2 * np.pi * f * np.arange(L) / SR * (1 + np.arange(L) / L * 0.5)) * env_ad(L, 0.002, 0.008)
    return fade(norm(stream + gl * 0.3) * 0.3, 0.2, 0.4)


def step_one(wood=1, wet=0):
    d = 0.18; n = int(d * SR)
    x = lp(noise(d), 600 if wood else 400) * env_ad(n, 0.003, 0.035) * 2
    if wet: x += bp(noise(d), 2000, 7000) * env_ad(n, 0.005, 0.05) * 0.6
    return x


def s_steps(dur=1.2, soft=0, wood=1, rate=2.4, wet=0, **k):
    x = np.zeros(int(dur * SR) + SR)
    for i in range(int(dur * rate)):
        st = int(i / rate * SR); s = step_one(wood, wet)
        x[st:st + len(s)] += s * (0.7 + 0.3 * (i % 2))
    return norm(x) * (0.22 if soft else 0.3)


def s_runSteps(dur=1.4, wet=0, **k):
    return s_steps(dur, rate=4.2, wet=wet) * 1.1


def s_cupDown(**k):              # 纸杯放在木地板上
    d = 0.25; n = int(d * SR)
    return norm(lp(noise(d), 900) * env_ad(n, 0.002, 0.02) + bp(noise(d), 1500, 5000) * env_ad(n, 0.001, 0.01) * 0.3) * 0.3


def s_cupUp(**k):
    return s_cupDown() * 0.6


def s_popup(**k):                # 纸舞台立起来：一声纸板的"啪"，后面一阵风
    d = 0.9; n = int(d * SR); t = np.arange(n) / SR
    snap = (lp(noise(d), 1200) * env_ad(n, 0.002, 0.03)) * 2
    swoosh = bp(noise(d), 300, 2500) * np.sin(np.pi * np.clip(t / 0.6, 0, 1)) ** 2 * 0.5
    return norm(snap + swoosh) * 0.4


def s_curtain(dur=1.0, **k):     # 幕布拉动：布料的唰唰
    n = int(dur * SR); t = np.arange(n) / SR
    x = bp(noise(dur), 300, 3000) * (0.5 + 0.5 * np.sin(np.pi * t / dur)) * (1 + 0.4 * np.sin(2 * np.pi * 11 * t))
    return fade(norm(x) * 0.3, 0.1, 0.3)


def s_fader(dur=0.8, **k):
    n = int(dur * SR); t = np.arange(n) / SR
    return fade(norm(bp(noise(dur), 1500, 6000) * (0.6 + 0.4 * np.sin(2 * np.pi * 30 * t))) * 0.15, 0.05, 0.1)


def s_spotOn(**k):               # 追光亮起来：咔哒一下，接着一层慢慢升起来的嗡
    d = 1.6; n = int(d * SR); t = np.arange(n) / SR
    clunk = lp(noise(d), 1500) * env_ad(n, 0.001, 0.02) * 2
    hum = (np.sin(2 * np.pi * 100 * t) + 0.5 * np.sin(2 * np.pi * 200 * t) + 0.2 * np.sin(2 * np.pi * 300 * t)) * np.clip(t / 0.4, 0, 1) * np.exp(-t / 1.2) * 0.25
    return norm(clunk + hum) * 0.35


def s_warmSwell(dur=2.2, **k):   # 暖光的一层：很轻的正弦（不是旋律，只是一团暖暖的空气）
    n = int(dur * SR); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * t + i) / (i + 1) for i, f in enumerate([220, 330, 440, 660]))
    return fade(norm(x * np.sin(np.pi * t / dur) ** 2) * 0.12, 0.3, 0.5)


def s_notesFly(dur=3.0, **k):    # 音符飞走：一阵轻风，里面几个小小的叮
    n = int(dur * SR); t = np.arange(n) / SR
    wind = bp(noise(dur), 400, 3000) * np.sin(np.pi * t / dur) ** 2 * 0.3
    tinks = np.zeros(n); r = np.random.default_rng(13)
    for i in range(8):
        st = int(r.uniform(0.1, dur - 0.4) * SR); L = int(0.4 * SR); f = r.choice([1568, 1760, 2093, 2349, 2637])
        tinks[st:st + L] += np.sin(2 * np.pi * f * np.arange(L) / SR) * env_ad(L, 0.01, 0.15) * 0.4
    return fade(norm(wind + tinks) * 0.3, 0.2, 0.4)


def s_heartbeat(dur=1.8, **k):
    x = np.zeros(int(dur * SR) + SR)
    for st in [0.0, 0.22, 0.9, 1.12]:
        if st > dur: break
        i = int(st * SR); L = int(0.15 * SR); tt = np.arange(L) / SR
        x[i:i + L] += np.sin(2 * np.pi * 55 * tt) * env_ad(L, 0.005, 0.05) * (1 if st in (0.0, 0.9) else 0.6)
    return norm(x) * 0.45


def s_applause(dur=3.2, **k):    # 掌声：很多下短促的拍手，前面多后面少
    n = int(dur * SR); x = np.zeros(n + SR); r = np.random.default_rng(17)
    for i in range(int(dur * 70)):
        st = r.uniform(0, dur) ** 1.3 / dur ** 0.3
        j = int(st * SR); L = int(0.03 * SR)
        x[j:j + L] += bp(noise(0.03), 900, 6000)[:L] * env_ad(L, 0.001, 0.008) * r.uniform(0.3, 1)
    t = np.arange(len(x)) / SR
    return fade(norm(x * np.exp(-t / dur * 0.8)) * 0.35, 0.05, 0.6)


def s_cupsDay(n=11, step=0.42, first=0.25, **k):   # 一天一个杯子：很轻的"嗒"
    x = np.zeros(int((first + step * n + 0.5) * SR))
    for i in range(int(n)):
        st = int((first + i * step) * SR); c = s_cupDown()
        x[st:st + len(c)] += c * 0.7
    return x


def s_calendar(dur=3.3, n=7, **k):
    return s_pageFlips(dur, n, soft=1)


def s_lampClick(**k):
    d = 0.08; n = int(d * SR)
    return norm(bp(noise(d), 1500, 6000) * env_ad(n, 0.0005, 0.006)) * 0.3


def s_paperTap(**k):
    d = 0.1; n = int(d * SR)
    return norm(bp(noise(d), 600, 3000) * env_ad(n, 0.001, 0.015)) * 0.25


def s_wings(dur=3.0, **k):       # 纸鸟扇翅膀：一下下纸的扑扑声
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n + SR)
    for i in range(int(dur * 9)):
        st = int(i / 9 * SR) + int(rng.uniform(0, 0.03) * SR); L = int(0.07 * SR)
        x[st:st + L] += bp(noise(0.07), 700, 4000)[:L] * env_ad(L, 0.004, 0.025) * (0.5 + 0.5 * np.sin(np.pi * i / (dur * 9)))
    return norm(x) * 0.25


def s_pick(**k):
    return s_paperTap() * 1.2


def s_pin(**k):                  # 图钉按进木头
    d = 0.12; n = int(d * SR)
    return norm(bp(noise(d), 1000, 5000) * env_ad(n, 0.001, 0.02) + np.sin(2 * np.pi * 1800 * np.arange(n) / SR) * env_ad(n, 0.001, 0.01)) * 0.25


def s_paperRustle(**k):
    return s_paperFall() * 0.8


def s_hum(dur=4.4, **k):         # 她哼歌（不用人声）：用铅笔在纸上很轻地画音符的沙沙声
    return s_pencil(dur, 0.35)


SFX_FN = {k[2:]: v for k, v in globals().items() if k.startswith('s_')}
SFX_FN['curtainOpen'] = s_curtain
SFX_FN['curtainClose'] = s_curtain
GAIN = {  # 各类音效相对的大小（dB）
    'pencil': -7, 'eraser': -5, 'rubbing': -3, 'shimmer': -9, 'sparkleDraw': -6, 'door': -6, 'doorCreak': -8, 'bubble': -6, 'heartOut': -6,
    'paperFall': -6, 'gasp': -10, 'pencilDrop': -3, 'jolt': -10, 'flip': -6, 'pageFlips': -6, 'pageFlipsBack': -5, 'bookShut': -5, 'slide': -8, 'pour': -6,
    'steps': -6, 'runSteps': -6, 'cupDown': -4, 'cupUp': -6, 'popup': -4, 'curtainOpen': -6, 'curtainClose': -6, 'fader': -8, 'spotOn': -5,
    'warmSwell': -10, 'notesFly': -8, 'heartbeat': -6, 'applause': -6, 'cupsDay': -6, 'calendar': -8, 'lampClick': -6, 'paperTap': -8, 'wings': -8,
    'pick': -6, 'pin': -6, 'paperRustle': -6, 'hum': -10,
}
BEDS_FROM_EVENTS = {'wavesSoft', 'roomTone', 'rain', 'roomNight', 'showMurmur'}


# ---------------- 环境声 ----------------
def amb_sea(dur, seed=1):        # 夜里的海：低频的浪，一阵阵涌上来、退下去
    n = int(dur * SR); t = np.arange(n) / SR
    x = lp(noise(dur, seed), 900) * 0.6 + bp(noise(dur, seed + 1), 600, 3000) * 0.15
    swell = 0.45 + 0.55 * (0.5 + 0.5 * np.sin(2 * np.pi * t / 6.5 + np.sin(2 * np.pi * t / 17)))
    return x * swell


def amb_room(dur, seed=2):       # 剧场里白天的空气：很低的嗡和一点点空调声
    n = int(dur * SR); t = np.arange(n) / SR
    return lp(noise(dur, seed), 300) * 0.5 + np.sin(2 * np.pi * 60 * t) * 0.02


def amb_rain(dur, seed=3):
    n = int(dur * SR)
    x = bp(noise(dur, seed), 1500, 9000) * 0.5 + lp(noise(dur, seed + 1), 500) * 0.3
    drops = np.zeros(n); r = np.random.default_rng(seed)
    for i in range(int(dur * 30)):
        st = int(r.uniform(0, dur - 0.02) * SR); L = int(0.015 * SR)
        drops[st:st + L] += bp(noise(0.015), 2000, 8000)[:L] * env_ad(L, 0.0005, 0.004) * r.uniform(0.3, 1)
    return x + drops * 0.8


def amb_dawn(dur, seed=4):       # 清晨：远处的浪，几声海鸥
    n = int(dur * SR); t = np.arange(n) / SR
    x = amb_sea(dur, seed) * 0.6
    r = np.random.default_rng(seed)
    for i in range(int(dur / 3)):
        st = r.uniform(0, dur - 0.6); i0 = int(st * SR); L = int(0.45 * SR); tt = np.arange(L) / SR
        f = 1400 + 500 * np.sin(np.pi * tt / 0.45) - 300 * tt
        x[i0:i0 + L] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / 0.45) ** 2 * 0.12
    return x


def amb_theaterNight(dur, seed=5):   # 空剧场的夜：很空的一点回响和低嗡
    n = int(dur * SR); t = np.arange(n) / SR
    return lp(noise(dur, seed), 220) * 0.6 + np.sin(2 * np.pi * 50 * t) * 0.015


def amb_bulbs(dur, seed=6):      # 化妆镜的灯泡：细细的电流声
    n = int(dur * SR); t = np.arange(n) / SR
    return lp(noise(dur, seed), 300) * 0.4 + (np.sin(2 * np.pi * 120 * t) + 0.3 * np.sin(2 * np.pi * 240 * t)) * 0.03


BEDS = [  # (开始, 结束, 函数, 音量 dB)  歌曲时间
    (1.0, 47.5, amb_sea, -13), (47.4, 64.4, amb_room, -12), (64.4, 75.0, amb_dawn, -10), (75.0, 106.5, amb_theaterNight, -14),
    (106.5, 112.1, amb_dawn, -10), (112.1, 119.3, amb_rain, -9), (119.3, 132.2, amb_theaterNight, -14), (132.2, 139.4, amb_dawn, -10),
    (139.4, 167.4, amb_sea, -13), (167.4, 172.8, amb_theaterNight, -14), (172.8, 180.0, amb_sea, -10), (180.0, 183.5, amb_dawn, -10),
    (183.5, 196.7, amb_bulbs, -12), (196.7, 248.3, amb_theaterNight, -14), (248.3, 263.8, amb_sea, -10), (263.8, SONG_END, amb_room, -14),
]


def lufs(x):
    m = pyln.Meter(SR)
    return m.integrated_loudness(x if x.ndim == 2 else np.stack([x, x], 1))


def place(buf, x, ts, gain_db=0.0, pan=0.0):
    i = T(ts)
    if x.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        x = np.stack([x * l * 1.414, x * r * 1.414], 1)
    a, b = max(0, i), min(N, i + len(x))
    if b <= a: return
    buf[a:b] += x[a - i:b - i] * 10 ** (gain_db / 20)


def voice_times():
    out = []
    for k in ('h1', 'e1'):
        j = json.load(open(f'voice_cv3/n_{k}.json', encoding='utf-8'))
        out += [VO_T[k] + c[1] for c in j['chars']]
    return np.array(out)


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else 'out/audio.wav'
    # 原曲
    song, sr = sf.read('audio/song.wav', dtype='float64')
    assert sr == SR
    song = song[int(OFFSET * SR):int(OFFSET * SR) + N]
    if len(song) < N: song = np.pad(song, ((0, N - len(song)), (0, 0)))
    song = song * 10 ** (-6.0 / 20)
    # 结尾 1.5 秒淡出
    fo = int(1.5 * SR); song[-fo:] *= np.linspace(1, 0, fo)[:, None]
    # 人声包络（唱的时候音效让开）
    voc, _ = sf.read('out/demucs/htdemucs/song/vocals.wav', dtype='float64')
    voc = voc[int(OFFSET * SR):int(OFFSET * SR) + N].mean(1)
    if len(voc) < N: voc = np.pad(voc, (0, N - len(voc)))
    hop = 1024
    rms = np.sqrt(np.convolve(voc ** 2, np.ones(hop) / hop, 'same')[::hop])
    act = np.clip((20 * np.log10(rms + 1e-9) + 42) / 12, 0, 1)        # −42 dB 以下算没唱，−30 dB 以上算在唱
    act = np.convolve(act, np.ones(15) / 15, 'same')
    DUCK = 0.4                                                          # 约 −8 dB
    duck = 1 - (1 - DUCK) * np.interp(np.arange(N), np.arange(len(act)) * hop, act)
    # 环境声
    fx = np.zeros((N, 2))
    for (a, b, fn, g) in BEDS:
        x = fn(b - a + 0.1)
        x = fade(x, 0.6, 0.6)
        place(fx, np.stack([x, np.roll(x, 400)], 1), a, g - 12)
    # 音效
    try:
        evs = json.load(open('out/sfx.json'))
    except FileNotFoundError:
        evs = []
    vt = voice_times()
    for e in evs:
        name = e['name']
        if name in BEDS_FROM_EVENTS or name not in SFX_FN: continue
        kw = {k: v for k, v in e.items() if k not in ('t', 'name')}
        x = SFX_FN[name](**kw)
        ts = e['t']
        # 短促的音效别压在画外音的字头上：落在某个字开头前后 0.12 秒内的，挪到这个字之前 0.15 秒
        if len(x) < 0.6 * SR:
            near = vt[np.abs(vt - ts) < 0.12]
            if len(near): ts = near.min() - 0.15
        # 和画外音重叠的音效再小 6 dB
        ov = any(VO_T[k] - 0.3 < ts + len(x) / SR and ts < VO_T[k] + 4.5 for k in VO_T)
        place(fx, x, ts, GAIN.get(name, -6) - (6 if ov else 0), pan=float(np.clip((sum(map(ord, name)) % 7 - 3) / 10, -0.3, 0.3)))
    # 画外音：每句 −16.5 LUFS，去掉 80 Hz 以下，一点点混响；念的时候前奏压低 3 dB
    vo = np.zeros((N, 2))
    song_gain = np.ones(N)
    for k in ('h1', 'e1'):
        v, vs = sf.read(f'voice_cv3/n_{k}.wav', dtype='float64')
        if v.ndim > 1: v = v.mean(1)
        v = resample_poly(v, SR, vs)
        v = hp(v, 80)
        ir_n = int(0.9 * SR); ir = noise(0.9, 21) * np.exp(-np.arange(ir_n) / SR / 0.22) * 0.03; ir[0] = 1
        v = np.convolve(v, ir)[:len(v) + int(0.5 * SR)]
        l = lufs(v); v *= 10 ** ((-16.5 - l) / 20)
        place(vo, v, VO_T[k])
        a, b = T(VO_T[k]) - int(0.3 * SR), T(VO_T[k]) + len(v)
        ramp = np.ones(N); a, b = max(0, a), min(N, b)
        dip = 10 ** (-3 / 20)
        song_gain[a:b] = np.minimum(song_gain[a:b], dip)
    song_gain = np.convolve(song_gain, np.ones(int(0.25 * SR)) / int(0.25 * SR), 'same')
    # 音效 + 环境声：先压在人声下面（唱的时候 −8 dB），再按每 0.5 秒一块"封顶"：
    # 不许比这一块的歌响（歌 −7 dB 以下）；画外音念的时候，还要在画外音 −13 dB 以下
    fx *= duck[:, None]
    fx *= 10 ** (-1 / 20)
    blk = int(0.5 * SR); nb = N // blk + 1
    def bl(x, i):
        seg = x[i * blk:(i + 1) * blk]
        return 20 * np.log10(np.sqrt((hp(seg.mean(1) if seg.ndim == 2 else seg, 150) ** 2).mean() + 1e-12)) if len(seg) > 100 else -120
    gains = np.ones(nb)
    for i in range(nb):
        Ls, Lv, Lf = bl(song * song_gain[:, None], i), bl(vo, i), bl(fx, i)
        allow = Ls - 7
        if Lv > -60: allow = min(Ls - 4, Lv - 13)
        if Lf > allow: gains[i] = 10 ** ((allow - Lf) / 20)
    # 平滑：往前看一块（提前压下去），释放慢一点
    gains = np.minimum(gains, np.roll(gains, -1))
    gcur = np.interp(np.arange(N), np.arange(nb) * blk + blk / 2, gains)
    gcur = np.convolve(gcur, np.ones(int(0.12 * SR)) / int(0.12 * SR), 'same')
    fx *= np.minimum(1, gcur)[:, None]
    mix = song * song_gain[:, None] + vo + fx
    import os
    if os.environ.get('STEMS'):
        for nm, x in (('song', song * song_gain[:, None]), ('vo', vo), ('fx', fx)): sf.write(f'out/stem_{nm}.wav', x.astype(np.float32), SR, subtype='FLOAT')
    # 成片响度和真峰值
    l = lufs(mix)
    mix *= 10 ** ((-16.0 - l) / 20)
    up = resample_poly(mix, 4, 1, axis=0)
    peak = np.abs(up).max()
    ceil = 10 ** (-1.0 / 20)
    if peak > ceil:
        # 简单的前瞻限幅：按 4 倍过采样的峰值算每 5 ms 的增益，平滑后乘回去
        env = np.abs(up).max(1)
        blk = int(0.005 * SR * 4)
        nb = len(env) // blk + 1
        pk = np.array([env[i * blk:(i + 1) * blk].max() if i * blk < len(env) else 0 for i in range(nb)])
        gr = np.minimum(1, ceil / np.maximum(pk, 1e-9))
        gr = np.minimum.reduce([gr, np.roll(gr, 1), np.roll(gr, -1)])
        g = np.interp(np.arange(len(mix)), np.arange(nb) * blk / 4, gr)
        g = np.convolve(g, np.ones(64) / 64, 'same')
        g = np.minimum(g, np.interp(np.arange(len(mix)), np.arange(nb) * blk / 4, gr) * 1.0 + 0.0)
        mix *= g[:, None]
    up = resample_poly(mix, 4, 1, axis=0)
    # 画外音的时间轴（成片时间），给 工具/selfcheck.py 和 工具/line_asr.py 用
    tl = {'lines': [], 'duration': DUR}
    for k in ('h1', 'e1'):
        j = json.load(open(f'voice_cv3/n_{k}.json', encoding='utf-8'))
        t0 = VO_T[k] - OFFSET + j['chars'][0][1]; t1 = VO_T[k] - OFFSET + j['chars'][-1][2]
        tl['lines'].append({'id': k, 'kind': 'N', 't0': round(t0, 2), 't1': round(t1, 2), 'text': j['say'], 'chunks': [[round(t0, 2), j['say']]]})
    json.dump(tl, open('timeline.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'成片 {lufs(mix):.2f} LUFS，真峰值 {20 * np.log10(np.abs(up).max()):.2f} dBTP，时长 {len(mix) / SR:.2f} 秒，音效 {len(evs)} 个')
    sf.write(out, mix.astype(np.float32), SR, subtype='FLOAT')


if __name__ == '__main__':
    main()
