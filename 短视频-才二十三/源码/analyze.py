"""从歌曲音频生成 timing.js：节拍网格、段落、人声/伴奏包络、每拍力度。
不做任何听写，只用音量和节拍信息。
依赖：numpy、librosa；人声分离用 demucs（htdemucs，两轨）。
用法：python3 analyze.py   （读 audio/song.wav，写 timing.js）"""
import os, subprocess, sys
import numpy as np, librosa

SONG = 'audio/song.wav'
STEMS = 'audio/stems'
FPS = 30

if not os.path.exists(f'{STEMS}/vocals.wav'):
    subprocess.run([sys.executable, '-m', 'demucs', '--two-stems=vocals', '-n', 'htdemucs', '-o', 'audio/sep', SONG], check=True)
    os.makedirs(STEMS, exist_ok=True)
    for s in ('vocals', 'no_vocals'):
        os.replace(f'audio/sep/htdemucs/song/{s}.wav', f'{STEMS}/{s}.wav')

y, sr = librosa.load(SONG, sr=22050, mono=True)
DUR = len(y) / sr

# ---- 节拍网格：在 onset 包络上网格搜索恒定速度和相位 ----
hop = 128
oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
otimes = np.arange(len(oenv)) * hop / sr
def score(P, O):
    tt = O + np.arange(np.ceil(-O / P), np.floor((DUR - O) / P)) * P
    return np.interp(tt, otimes, oenv).mean()
best = max((score(60 / b, o), b, o) for b in np.arange(160, 170, .01) for o in np.arange(0, 60 / b, .005))
_, BPM, BEAT0 = best
BEAT = 60 / BPM
print(f'BPM {BPM:.2f}  BEAT0 {BEAT0:.3f}')

# ---- 包络（30fps）----
def env(path, lo, hi, attack=1.0, release=.25):
    s, _ = librosa.load(path, sr=22050, mono=True)
    r = librosa.feature.rms(y=s, frame_length=2048, hop_length=sr // FPS // 1)[0] if False else None
    hopf = int(round(22050 / FPS))
    r = librosa.feature.rms(y=s, frame_length=2048, hop_length=hopf, center=True)[0]
    d = 20 * np.log10(r + 1e-7)
    v = np.clip((d - lo) / (hi - lo), 0, 1)
    out = np.zeros_like(v); acc = 0
    for i, x in enumerate(v):                       # 快起慢落
        acc = acc + (x - acc) * (attack if x > acc else release)
        out[i] = acc
    return out
dv = 20 * np.log10(librosa.feature.rms(y=librosa.load(f'{STEMS}/vocals.wav', sr=22050)[0])[0] + 1e-7)
ref = np.percentile(dv, 95)
VOC = env(f'{STEMS}/vocals.wav', ref - 24, ref)
ACC = env(f'{STEMS}/no_vocals.wav', -40, -8, release=.12)

# ---- 每拍力度：伴奏轨在每个拍点的 onset 强度 ----
a, _ = librosa.load(f'{STEMS}/no_vocals.wav', sr=22050, mono=True)
ae = librosa.onset.onset_strength(y=a, sr=sr, hop_length=hop)
nb = int((DUR - BEAT0) / BEAT) + 1
bs = np.array([ae[max(0, int((BEAT0 + k * BEAT) * sr / hop) - 2): int((BEAT0 + k * BEAT) * sr / hop) + 4].max(initial=0) for k in range(nb)])
bs = np.clip(bs / np.percentile(bs, 97), 0, 1)

AL = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
enc = lambda v: ''.join(AL[int(round(x * 61))] for x in v)
with open('timing.js', 'w', encoding='utf-8') as f:
    f.write(f"""'use strict';
/* timing.js —— 由 analyze.py 生成，别手改。
   节拍网格：在 onset 包络上搜索恒定速度和相位；全曲没有漂移。
   VOC / ACC：Demucs 分出来的人声轨、伴奏轨的音量包络（30fps，0–1，编码成 0-9A-Za-z）。
   BEATS：伴奏轨每一拍的力度（0–1）。不含任何歌词。 */
const SONG_DUR = {DUR:.3f};
const BEAT = {BEAT:.6f};          // {BPM:.2f} BPM
const BEAT0 = {BEAT0:.3f};          // 第 0 拍（第 0 小节强拍）
const BAR = 4 * BEAT;
const bar = n => BEAT0 + n * BAR;  // 第 n 小节的强拍（从 0 数，歌曲时间）
const ENV_FPS = {FPS};
const VOC_S = '{enc(VOC)}';
const ACC_S = '{enc(ACC)}';
const BEATS_S = '{enc(bs)}';
""")
print('frames', len(VOC), 'beats', nb)
