"""从歌曲音频生成 timing.js：节拍网格、人声 / 伴奏的音量包络、每拍力度。歌词的逐字时间见 align.py。
依赖：numpy、librosa；人声分离用 demucs（htdemucs，两轨）。
用法：python3 analyze.py   （读 audio/song.wav，写 timing.js）"""
import os, subprocess, sys
import numpy as np, librosa

SONG = 'audio/song.wav'
STEMS = 'audio/stems'
FPS = 30

if not os.path.exists(f'{STEMS}/vocals.wav'):
    if not os.path.exists('audio/sep/htdemucs/song/vocals.wav'):
        subprocess.run([sys.executable, '-m', 'demucs', '--two-stems=vocals', '-n', 'htdemucs', '-o', 'audio/sep', SONG], check=True)
    os.makedirs(STEMS, exist_ok=True)
    for s in ('vocals', 'no_vocals'):
        os.replace(f'audio/sep/htdemucs/song/{s}.wav', f'{STEMS}/{s}.wav')

y, sr = librosa.load(SONG, sr=22050, mono=True)
DUR = len(y) / sr
LEAD = float(np.argmax(np.abs(y) > 1e-4) / sr)        # 开头的数字静音

# ---- 节拍网格：在 onset 包络上网格搜索恒定速度和相位 ----
hop = 64
oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
otimes = np.arange(len(oenv)) * hop / sr
def score(P, O, t0=0, t1=None):
    t1 = DUR if t1 is None else t1
    tt = O + np.arange(np.ceil((t0 - O) / P), np.floor((t1 - O) / P)) * P
    return np.interp(tt, otimes, oenv).mean()
LO, HI = float(os.environ.get('BPM_LO', 56)), float(os.environ.get('BPM_HI', 140))
cands = sorted(((score(60 / b, o), b, o) for b in np.arange(LO, HI, .05) for o in np.arange(0, 60 / b, .01)), reverse=True)
print('粗搜前几名：', [(round(b, 2), round(o, 2), round(s, 3)) for s, b, o in cands[:8]])
_, b0, o0 = cands[0]
_, BPM, BEAT0 = max((score(60 / b, o), b, o) for b in np.arange(b0 - .06, b0 + .06, .002) for o in np.arange(max(0, o0 - .03), o0 + .03, .001))
BEAT = 60 / BPM
for t0 in range(0, int(DUR) - 30, 30):
    best = max(np.arange(BEAT0 - .1, BEAT0 + .1, .002), key=lambda o: score(BEAT, o, t0, t0 + 30))
    print(f'  {t0:3d}~{t0 + 30:3d} 秒 相位偏差 {(best - BEAT0) * 1000:+.0f} 毫秒')
# 强拍：伴奏轨低频（<180 Hz）的 onset 按拍号 mod 4 统计
a, _ = librosa.load(f'{STEMS}/no_vocals.wav', sr=sr, mono=True)
S = np.abs(librosa.stft(a, n_fft=2048, hop_length=256)); f = librosa.fft_frequencies(sr=sr, n_fft=2048)
def band_flux(lo, hi):
    b = S[(f >= lo) & (f < hi)].sum(0); return np.maximum(0, np.diff(b, prepend=b[0]))
low, high = band_flux(20, 180), band_flux(2000, 8000)
nb = int((DUR - BEAT0) / BEAT) + 1
acc, acch = np.zeros(4), np.zeros(4)
for k in range(nb):
    i = int((BEAT0 + k * BEAT) * sr / 256)
    acc[k % 4] += low[max(0, i - 2):i + 3].max(initial=0); acch[k % 4] += high[max(0, i - 2):i + 3].max(initial=0)
print('低频 onset 按 mod 4：', np.round(acc / acc.max(), 2), ' 高频：', np.round(acch / acch.max(), 2))
down = int(os.environ.get('DOWN', np.argmax(acc)))
BEAT0 += down * BEAT
while BEAT0 - 4 * BEAT > 0: BEAT0 -= 4 * BEAT
print(f'BPM {BPM:.3f}  拍长 {BEAT:.4f}  小节 {4 * BEAT:.3f}  第 0 小节强拍 {BEAT0:.3f}  开头静音 {LEAD:.3f}')

def env(path, lo, hi, attack=1.0, release=.25):
    s, _ = librosa.load(path, sr=22050, mono=True)
    r = librosa.feature.rms(y=s, frame_length=2048, hop_length=int(round(22050 / FPS)), center=True)[0]
    v = np.clip((20 * np.log10(r + 1e-7) - lo) / (hi - lo), 0, 1)
    out = np.zeros_like(v); x0 = 0
    for i, x in enumerate(v):
        x0 = x0 + (x - x0) * (attack if x > x0 else release); out[i] = x0
    return out
dv = 20 * np.log10(librosa.feature.rms(y=librosa.load(f'{STEMS}/vocals.wav', sr=22050)[0])[0] + 1e-7)
ref = np.percentile(dv, 95)
VOC = env(f'{STEMS}/vocals.wav', ref - 24, ref)
da = 20 * np.log10(librosa.feature.rms(y=a)[0] + 1e-7); aref = np.percentile(da, 97)
ACC = env(f'{STEMS}/no_vocals.wav', aref - 30, aref, release=.12)

ae = librosa.onset.onset_strength(y=a, sr=sr, hop_length=128)
nb = int((DUR - BEAT0) / BEAT) + 1
bs = np.array([ae[max(0, int((BEAT0 + k * BEAT) * sr / 128) - 2): int((BEAT0 + k * BEAT) * sr / 128) + 4].max(initial=0) for k in range(nb)])
bs = np.clip(bs / np.percentile(bs, 97), 0, 1)

AL = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
enc = lambda v: ''.join(AL[int(round(x * 61))] for x in v)
with open('timing.js', 'w', encoding='utf-8') as fo:
    fo.write(f"""'use strict';
/* timing.js —— 由 analyze.py 生成，别手改。时间都是歌曲时间（秒）。
   节拍网格：在 onset 包络上搜索恒定速度和相位；强拍按伴奏轨低频的 onset 定。
   VOC / ACC：Demucs 分出来的人声轨、伴奏轨的音量包络（30fps，0–1，编码成 0-9A-Za-z）。
   BEATS：伴奏轨每一拍的力度（0–1）。 */
const SONG_DUR = {DUR:.3f};
const SONG_LEAD = {LEAD:.3f};     // 开头的数字静音
const BEAT = {BEAT:.6f};          // {BPM:.3f} BPM
const BEAT0 = {BEAT0:.3f};          // 第 0 小节的强拍
const BAR = 4 * BEAT;
const bar = n => BEAT0 + n * BAR;  // 第 n 小节的强拍（从 0 数）
const ENV_FPS = {FPS};
const VOC_S = '{enc(VOC)}';
const ACC_S = '{enc(ACC)}';
const BEATS_S = '{enc(bs)}';
""")
print('frames', len(VOC), 'beats', nb)
