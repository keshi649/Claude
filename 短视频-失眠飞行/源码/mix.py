"""《失眠飞行》MV 的声音：原曲 + 少量音效和环境声（没有另加配乐）。
- 原曲：剪掉开头 1.30 秒的数字静音，原样放在第 0 秒；结尾补 0.25 秒淡出，免得最后"咔"一下。
- 音效全用 numpy 合成，按画面的时刻放（时间写的是歌曲时间 s，和 scenes*.js 里一致；放的时候减去 TRIM）。
  有人声的地方音效再压低（按 Demucs 分出来的人声轨的音量），短促的音效尽量放在两句之间的空隙里。
- 歌唱完以后是尾声：屋里的底噪、钟、手机打字、发送、震动、收到消息的"叮"。
- 画外音两句（voice_cv3/，CosyVoice 3 合成）：开头"凌晨三点，你也还没睡吗？"、结尾"你失眠的时候，在想谁？"，加一点混响；
  念的时候前奏压低约 3 dB、音效让开。顺手写出 timeline.json（两句画外音在成片里的时刻），给 工具/line_asr.py 核对用。
- 成片约 -16 LUFS，4 倍过采样找峰值，限幅到 -1.0 dBTP。
用法：python3 mix.py audio/song.wav out/mix.wav"""
import sys
import numpy as np
from scipy.io import wavfile
from scipy.ndimage import minimum_filter1d, uniform_filter1d
from scipy.signal import butter, resample_poly, sosfilt

SR = 44100
TRIM = 1.30                     # 和 main.js 一致
SONG_DUR = 206.890
EPI, CARD = 3.4, 2.5
S_END = SONG_DUR + EPI + CARD
DUR = S_END - TRIM
N = int(DUR * SR)
TARGET_LUFS = -16.0
CEIL_DB = -1.0
rng = np.random.default_rng(347)
BPM, BEAT0 = 94.995, 0.178
BAR = 4 * 60 / BPM
def bar(n): return BEAT0 + n * BAR

src, dst = sys.argv[1], sys.argv[2]
sr, song = wavfile.read(src)
assert sr == SR
song = song.astype(np.float64) / (32768.0 if song.dtype == np.int16 else 1.0)
if song.ndim == 1: song = np.stack([song, song], 1)
song = song.T                                           # (2, n)
song = song[:, int(TRIM * SR):]
fo = int(.25 * SR); song[:, -fo:] *= np.linspace(1, 0, fo)

# 人声的音量（给音效让位用）
try:
    _, voc = wavfile.read('audio/stems/vocals.wav')
    voc = voc.astype(np.float64) / (32768.0 if voc.dtype == np.int16 else 1.0)
    voc = np.abs(voc).mean(1) if voc.ndim > 1 else np.abs(voc)
    venv = uniform_filter1d(voc[int(TRIM * SR):], int(.15 * SR))
    venv = venv / (np.percentile(venv, 95) + 1e-9)
except FileNotFoundError:
    venv = np.zeros(song.shape[1])

sfx = np.zeros((2, N))
amb = np.zeros((2, N))

def tv(d): return np.arange(int(max(d, 1e-3) * SR)) / SR
def lp(x, fc, o=2): return sosfilt(butter(o, fc, 'low', fs=SR, output='sos'), x)
def hp(x, fc, o=2): return sosfilt(butter(o, fc, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def noise(d): return rng.standard_normal(int(max(d, 1e-3) * SR))
def mf(m): return 440.0 * 2 ** ((m - 69) / 12)
def env(n, a=.005, d=.3):
    t = np.arange(n) / SR
    e = np.exp(-t / max(d, 1e-4))
    na = max(1, int(a * SR)); e[:na] *= np.linspace(0, 1, na)
    return e
def db(x): return 10 ** (x / 20)

def place(bus, sig, s, gain_db=0.0, pan=0.0):
    """sig 放在歌曲时间 s（自动换成视频时间）；pan -1 左 … 1 右"""
    i = int(round((s - TRIM) * SR))
    if i >= N or i + len(sig) <= 0: return
    s0 = max(0, -i); i = max(0, i); j = min(N, i + len(sig) - s0)
    seg = sig[s0:s0 + j - i] * db(gain_db)
    bus[0, i:j] += seg * np.cos((pan + 1) * np.pi / 4) * 1.414
    bus[1, i:j] += seg * np.sin((pan + 1) * np.pi / 4) * 1.414

# ---------------- 音色 ----------------
def whoosh(d=.8, up=True, lo=300, hi=3000):
    n = int(d * SR); t = np.arange(n) / SR
    x = noise(d)
    f = np.linspace(lo, hi, n) if up else np.linspace(hi, lo, n)
    out = np.zeros(n); blk = 2048
    for k in range(0, n, blk):
        fc = f[min(n - 1, k + blk // 2)]
        out[k:k + blk] = bp(x[k:k + blk + 0], max(60, fc * .6), min(SR / 2 - 100, fc * 1.6))[:len(out[k:k + blk])]
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
    return out * e * .9
def bell(m, d=2.5, bright=1.0):
    t = tv(d); f = mf(m)
    x = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / (d * dd)) for r, a, dd in [(1, 1, .5), (2.0, .5 * bright, .25), (2.76, .35 * bright, .18), (5.4, .2 * bright, .08)])
    x[:int(.003 * SR)] *= np.linspace(0, 1, int(.003 * SR))
    return x * .5
def chime(notes, gap=.09, d=1.6):
    out = np.zeros(int((len(notes) * gap + d) * SR))
    for i, m in enumerate(notes):
        b = bell(m, d, .6); k = int(i * gap * SR); out[k:k + len(b)] += b
    return out
def sparkle(d=1.0, base=96, n=12):
    out = np.zeros(int((d + .6) * SR))
    for i in range(n):
        m = base + rng.choice([0, 3, 5, 7, 10, 12]) ; b = bell(m, .5, .3) * (.4 + .6 * rng.random())
        k = int(rng.random() * d * SR); out[k:k + len(b)] += b
    return out * .6
def tick(f=2600):
    t = tv(.04); return (np.sin(2 * np.pi * f * t) * np.exp(-t / .006) + hp(noise(.04), 3000) * np.exp(-t / .003) * .5) * .6
def ding():
    t = tv(1.4); return (np.sin(2 * np.pi * 2093 * t) + .4 * np.sin(2 * np.pi * 4186 * t) * np.exp(-t / .2)) * np.exp(-t / .45) * .5
def bloop(f0=900):
    t = tv(.18); f = f0 * (1 + 1.2 * np.exp(-t / .03)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .05) * .5
def splash(d=1.2):
    t = tv(d); x = lp(noise(d), 2500) * np.exp(-t / .25) + bp(noise(d), 800, 4000) * np.exp(-t / .08) * .5
    for _ in range(14):
        b = bloop(500 + rng.random() * 900) * .4; k = int(rng.random() * d * .7 * SR); x[k:k + len(b)] += b
    return x * .6
def rewind(d=1.0):
    t = tv(d); f = 400 + 2400 * (t / d) ** 2
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * .25 + bp(noise(d), 1500, 6000) * .5
    return x * np.sin(np.pi * np.clip(t / d, 0, 1)) * (1 + .5 * np.sin(2 * np.pi * 30 * t))
def birds(d=3.0, n=7):
    out = np.zeros(int(d * SR))
    for _ in range(n):
        k = int(rng.random() * (d - .4) * SR)
        for j in range(rng.integers(2, 5)):
            t = tv(.07); f0 = 3200 + rng.random() * 1800
            c = np.sin(2 * np.pi * np.cumsum(f0 * (1 + .25 * np.sin(np.pi * t / .07))) / SR) * np.sin(np.pi * t / .07) ** 2
            kk = k + int(j * .09 * SR); out[kk:kk + len(c)] += c * .35
    return out
def rain_bed(d):
    x = noise(d); x = lp(hp(x, 300), 6000) * .5 + lp(noise(d), 900) * .5
    drops = np.zeros(len(x)); idx = rng.integers(0, len(x) - 400, int(d * 60))
    for i in idx: drops[i:i + 300] += np.exp(-np.arange(300) / 40) * rng.uniform(-1, 1)
    return x * .5 + hp(drops, 1500) * .3
def room(d): return lp(noise(d), 500) * .3 + lp(hp(noise(d), 2000), 5000) * .05
def wind(d, lo=200, hi=900):
    x = bp(noise(d), lo, hi); t = tv(d)
    return x * (.6 + .4 * np.sin(2 * np.pi * .4 * t + rng.random() * 6))
def whale(d=2.5):
    t = tv(d); f = 160 - 50 * t / d + 6 * np.sin(2 * np.pi * 5 * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2 * .6
def wings(d=1.0):
    t = tv(d); return bp(noise(d), 400, 2500) * (.5 + .5 * np.sin(2 * np.pi * 9 * t)) ** 3 * np.exp(-t / .6)
def square(f, d, duty=.5):
    t = tv(d); ph = (f * t) % 1
    return (np.where(ph < duty, 1.0, -1.0)) * np.exp(-t / (d * .6)) * .3
def pew(f0=600, f1=2400, d=.18):
    t = tv(d); f = np.geomspace(f0, f1, len(t)); ph = np.cumsum(f) / SR % 1
    return np.where(ph < .5, 1.0, -1.0) * np.exp(-t / .08) * .25
def coin():
    return np.concatenate([square(mf(95), .06), square(mf(100), .2)])
def pixel_boom(d=1.0):
    t = tv(d); x = noise(d); x = np.repeat(x[::8], 8)[:len(t)]
    return lp(x, 3000) * np.exp(-t / .25) * .6
def buzz(d=.5):
    t = tv(d); return np.sign(np.sin(2 * np.pi * 150 * t)) * .3 * lp(np.ones(len(t)), 40) * (np.sin(2 * np.pi * 14 * t) > -.3)
def tap():
    t = tv(.03); return hp(noise(.03), 2500) * np.exp(-t / .004) * .5
def swoosh(): return whoosh(.35, True, 800, 6000) * .6

# ---------------- 摆放（歌曲时间） ----------------
# 开头：屋里的底噪、钟、玩偶的眼睛亮起来、窗户被风推开、床浮起来、冲出窗外
place(amb, room(4.4) * np.linspace(1, 0, int(4.4 * SR)) ** .5, TRIM, -30)
# 画外音（视频 0.15~2.5 秒）念的时候不放短促的音效：钟的嘀嗒放在字和字的空隙里（0.02、1.22 秒）和念完以后；
# 玩偶眼睛亮起来（1.25 秒）只垫一层没有起音的微光声，"叮"等念完（2.55 秒）再响
for t_ in (.02, 1.22, 2.6, 3.6): place(sfx, tick(), TRIM + t_, -26, .3)
glim = bp(noise(1.4), 3000, 9000) * np.sin(np.pi * np.linspace(0, 1, int(1.4 * SR))) ** 2
place(sfx, glim, TRIM + 1.15, -30, -.2)
place(sfx, chime([74, 78, 81, 86], .1, 1.8), TRIM + 2.55, -22, .2)
place(sfx, whoosh(1.2, True, 200, 1800), TRIM + 2.45, -14, .5)
place(amb, wind(2.2, 300, 1400) * np.sin(np.pi * np.linspace(0, 1, int(2.2 * SR))), TRIM + 2.4, -20, .4)
place(sfx, sparkle(1.0, 88, 10), TRIM + 2.9, -22, 0)
place(sfx, whoosh(1.0, True, 300, 4000), bar(2) - .55, -12, .3)
# 主歌 A：风、泡泡、雾、往下掉
place(amb, wind(2.6, 200, 800), bar(2), -26, -.3)
for t0 in (8.1, 8.7, 9.3): place(sfx, bloop(1200), bar(3) + t0 - 7.76 + .43, -24, .2)
place(sfx, sparkle(.4, 100, 6), bar(3) + 1.33, -24, .3)
place(sfx, whoosh(1.6, False, 200, 1200), bar(4) - .2, -22, 0)
place(sfx, whoosh(2.4, True, 150, 1500), bar(5), -22, 0)
place(sfx, chime([86, 90, 93], .06, 1.2), bar(6) - .05, -24, 0)
place(sfx, whoosh(.6, True, 400, 3000), bar(7) - .3, -24, 0)
place(sfx, sparkle(1.2, 93, 10), bar(7) + .6, -24, 0)
# 主歌 B：叮（落在两句之间）、倒带
place(sfx, ding(), 27.86, -18, .3)
place(sfx, rewind(1.1), 43.1, -22, 0)
# 副歌一：入水、鲸鱼、钟、抱住时的钟声
place(sfx, splash(1.2), 47.95, -20, 0)
place(sfx, whale(2.4), 48.6, -26, -.3)
for k_ in range(10): place(sfx, tick(2200 + 80 * k_), 58.2 + k_ * .21, -26, (k_ % 2) * .6 - .3)
place(sfx, bell(74, 3.0), 64.28, -20, 0)
# 间奏一：流星、天亮的鸟叫
for j in range(4): place(sfx, sparkle(.6, 100, 6), bar(26 + j) + .1, -26, -.5 + j * .3)
place(amb, birds(3.2, 8), 80.9, -24, .3)
place(sfx, tick(), 84.6, -24, 0)
# 主歌 A 第二遍：吹蒲公英、时间停下、雨、月虹
place(sfx, whoosh(.9, False, 600, 3000), 89.65, -26, .2)
place(sfx, whoosh(.7, False, 300, 2000), 97.0, -20, 0)
place(amb, rain_bed(1.6) * np.linspace(1, 0, int(1.6 * SR)), bar(39), -28, 0)
place(sfx, chime([81, 86, 90, 93], .08, 1.6), 100.0, -26, 0)
# 主歌 B 第二遍：玩偶活过来、跳、窗户推开
place(sfx, sparkle(.8, 96, 10), bar(46) + .5, -22, .3)
for t0 in (bar(46) + 1.65, bar(46) + 2.15): place(sfx, bloop(500), t0, -22, .4)
place(sfx, whoosh(1.0, True, 200, 2000), bar(46) + 3.8, -18, .5)
place(sfx, rewind(1.0), 124.6, -22, 0)
# 间奏二：像素小怪（8 位游戏的声音，和甜菜之前的像素小怪视频一个味道）
place(sfx, pew(500, 2000, .25), bar(58) + .2, -24, -.6)
place(sfx, pew(600, 2600, .25), bar(58) + .6, -24, .6)
place(sfx, pixel_boom(1.0), bar(60), -20, 0)
place(sfx, coin(), bar(60) + .05, -22, 0)
for i in range(20):
    place(sfx, square(mf(84 + (i % 5) * 2), .05, .25), bar(62) + i * .33, -30, (-.5 if i % 2 else .5))
place(sfx, sparkle(1.4, 96, 14), bar(62) + 6.5, -24, 0)
place(amb, birds(2.5, 6), 164.3, -28, -.3)
# 桥段：一直下雨，第 73 小节雨停在半空（声音一下子断掉），水珠往上飘的时候一阵倒放的闪光声
rain_len = bar(73) - bar(66) + .2
r = rain_bed(rain_len); fi = int(1.0 * SR); r[:fi] *= np.linspace(0, 1, fi); r[-int(.03 * SR):] *= np.linspace(1, 0, int(.03 * SR))
place(amb, r, bar(66) - .2, -22, 0)
place(sfx, sparkle(1.8, 91, 16)[::-1], 185.2, -22, 0)
# 最后一遍副歌
place(sfx, whoosh(.8, True, 300, 3000), bar(74) - .4, -18, 0)
place(sfx, whale(2.6), 189.8, -24, .3)
for k_ in range(12): place(sfx, tick(2000 + 60 * k_), 199.6 + k_ * .1 * (1 + k_ * .05), -26, 0)
place(sfx, bell(79, 2.4), 200.95, -22, 0)
place(sfx, bell(74, 4.0), 205.45, -16, -.2)
place(sfx, bell(81, 4.0), 205.6, -20, .2)
place(sfx, wings(1.2), 205.5, -20, .3)
# 尾声：屋里的底噪、钟、打字、发送、震动、收到消息
send, read = SONG_DUR + 1.1, SONG_DUR + 1.9
place(amb, room(EPI + CARD), SONG_DUR - .1, -32, 0)
# 钟：结尾那句画外音（歌曲 209.29 秒起，约 2.4 秒）念的时候停
for k_ in range(int(EPI + CARD)):
    t_ = SONG_DUR + .3 + k_
    if not (209.1 < t_ < 211.9): place(sfx, tick(), t_, -28, .2)
for k_ in range(6): place(sfx, tap(), SONG_DUR + .4 + k_ * .1, -24, -.4 + (k_ % 2) * .8)
place(sfx, swoosh(), send, -22, -.4)
place(sfx, swoosh(), send + .02, -22, .4)
place(sfx, buzz(.45), read - .05, -22, -.5)
place(sfx, buzz(.45), read, -22, .5)
place(sfx, chime([86, 91], .12, 1.2), read + .1, -20, 0)
# 片尾卡不再加"叮"：结尾那句画外音就是收尾

# ---------------- 画外音（CosyVoice 3 女声）：开头一句、结尾一句 ----------------
# 开头那句放在前奏里，人声第一次开口（歌曲 4.52 秒）之前念完；结尾那句在歌唱完、两条"睡了吗？"落下以后
import json, os
VOICE = [('h1', TRIM + .15), ('e1', SONG_DUR + 1.9 + .5)]
voice = np.zeros((2, N)); tl = []
def reverb(x, dur=.9, wet=.16):
    n = int(dur * SR); ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR / (dur / 5)); ir = lp(ir, 5000); ir /= np.sqrt(np.sum(ir ** 2))
    y = np.convolve(x, ir)[:len(x) + n]; out = np.zeros(len(y)); out[:len(x)] += x; return out + y * wet
for lid, at in VOICE:
    f = f'voice_cv3/n_{lid}.wav'
    if not os.path.exists(f): continue
    vsr, v = wavfile.read(f); v = v.astype(np.float64) / (32768.0 if v.dtype == np.int16 else 1.0)
    if v.ndim > 1: v = v.mean(1)
    v = resample_poly(v, SR, vsr); v = hp(v, 80, 2)
    v *= db(-19.0) / (np.sqrt(np.mean(v[np.abs(v) > 1e-3] ** 2)) + 1e-9)     # 说话部分的有效值放到约 -19 dBFS
    v = reverb(v)
    place(voice, v, at, 0.0, 0)
    meta = json.load(open(f'voice_cv3/n_{lid}.json', encoding='utf-8'))
    tl.append({'id': lid, 'kind': 'N', 't0': round(at - TRIM, 3), 't1': round(at - TRIM + len(v) / SR - .8, 3), 'text': meta['say']})
json.dump({'lines': tl, 'duration': DUR}, open('timeline.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
# 画外音念的时候，前奏让一让（约 -3 dB）
vg = uniform_filter1d((np.abs(voice).max(0) > 1e-3).astype(float), int(.3 * SR))
song_gain = 1 - .3 * np.clip(vg * 2, 0, 1)

# ---------------- 混音 ----------------
# 有人声的时候音效和环境声让一让（最多压低约 8 dB）
v = np.zeros(N); v[:min(N, len(venv))] = venv[:N]
duck = 1 - .6 * np.clip(np.maximum(v, vg if 'vg' in dir() else 0), 0, 1)
duck = uniform_filter1d(minimum_filter1d(duck, int(.1 * SR)), int(.08 * SR))
bed = (sfx + amb) * duck
out = np.zeros((2, N)); out[:, :song.shape[1]] += song[:, :N]
out *= song_gain
out += bed + voice

# 响度：用 ffmpeg 的 ebur128 测（ITU-R BS.1770），加增益、限幅，再测一遍微调
import subprocess, re, os
def measure(x):
    tmp = 'out/_measure.wav'
    wavfile.write(tmp, SR, (np.clip(x, -1, 1).T * 32767).astype(np.int16))
    r = subprocess.run(['ffmpeg', '-nostats', '-i', tmp, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    os.remove(tmp)
    summ = r[r.rfind('Summary'):]
    return float(re.search(r'I:\s+(-?[\d.]+) LUFS', summ).group(1)), float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', summ).group(1))
def limit(x, ceil_db=CEIL_DB, hold=.012):
    ceil = db(ceil_db)
    up = np.max(np.abs(resample_poly(x, 4, 1, axis=1)), axis=0)
    e = np.max(up[:x.shape[1] * 4].reshape(-1, 4), axis=1)
    g = np.minimum(1.0, ceil / np.maximum(e, 1e-9))
    k = int(hold * SR)
    g = uniform_filter1d(minimum_filter1d(g, size=2 * k + 1), size=k + 1)
    return x * g, -20 * np.log10(g.min()), np.mean(g < .999) * 100
L0, _ = measure(out)
gain = TARGET_LUFS - L0
for _ in range(2):
    y, gr, pct = limit(out * db(gain))
    L1, tp = measure(y)
    gain += TARGET_LUFS - L1
y, gr, pct = limit(out * db(gain))
L1, tp = measure(y)
print(f'mix: {DUR:.2f}s  原混音 {L0:.1f} LUFS → 加 {gain:+.1f} dB → {L1:.1f} LUFS，真峰值 {tp:.1f} dBTP；限幅最多 {gr:.1f} dB，{pct:.1f}% 的采样被压')
wavfile.write(dst, SR, (np.clip(y, -1, 1).T * 32767).astype(np.int16))
