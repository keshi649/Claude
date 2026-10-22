"""从歌曲音频生成 timing.js：速度、小节线、人声的音量包络。不含歌词（歌词时间见 align.py）。
依赖：numpy、librosa；人声分离用 demucs（htdemucs，两轨）。用法：python3 analyze.py （读 audio/song.wav，写 timing.js）
- 速度：在 onset 包络上网格搜恒定速度和相位（这首是 DJ 版，四四拍的底鼓每拍一下，128 BPM）。
- 强拍：底鼓每拍都有，按拍号 mod 4 统计分不出来；看鼓停的地方：加花（底鼓空一拍）落在小节最后一拍，
  breakdown（23.7 秒起底鼓停）和 drop（31.2 秒底鼓全回来）都从强拍开始。所以第 0 小节在第 2 拍（1.193 秒），前两拍是弱起。"""
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
hop = 64
oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
ot = np.arange(len(oenv)) * hop / sr
def score(P, O):
    tt = O + np.arange(np.ceil(-O / P), np.floor((DUR - O) / P)) * P
    return np.interp(tt, ot, oenv).mean()
_, b0, o0 = max((score(60 / b, o), b, o) for b in np.arange(100, 160, .1) for o in np.arange(0, 60 / b, .01))
_, BPM, PH = max((score(60 / b, o), b, o) for b in np.arange(b0 - .1, b0 + .1, .005) for o in np.arange(max(0, o0 - .03), o0 + .03, .001))
BEAT = 60 / BPM
# 每拍的底鼓强度（伴奏轨 150 Hz 以下的 onset）：找鼓停的拍子
a, _ = librosa.load(f'{STEMS}/no_vocals.wav', sr=sr, mono=True)
S = np.abs(librosa.stft(a, n_fft=2048, hop_length=256)); f = librosa.fft_frequencies(sr=sr, n_fft=2048)
low = S[f < 150].sum(0); flux = np.maximum(0, np.diff(low, prepend=low[0]))
nb = int((DUR - PH) / BEAT) + 1
kick = np.array([flux[max(0, int((PH + k * BEAT) * sr / 256) - 2):int((PH + k * BEAT) * sr / 256) + 3].max(initial=0) for k in range(nb)])
kick /= np.percentile(kick, 95)
gaps = [k for k in range(2, nb - 2) if kick[k] < .3]
print(f'BPM {BPM:.3f}  第 0 拍 {PH:.3f}  底鼓空的拍：{gaps}')
DOWN = 2                       # 第 2 拍是第 0 小节的强拍（见上面的说明）
BAR0 = PH + DOWN * BEAT
# 人声音量包络（30fps，0~1），画面上可以跟着人声动
v, _ = librosa.load(f'{STEMS}/vocals.wav', sr=22050, mono=True)
r = librosa.feature.rms(y=v, frame_length=2048, hop_length=int(round(22050 / FPS)), center=True)[0]
venv = np.clip((20 * np.log10(r + 1e-7) + 40) / 30, 0, 1)
with open('timing.js', 'w', encoding='utf-8') as fo:
    fo.write('// 由 analyze.py 生成：速度、小节线（歌曲时间，秒）、人声音量包络（30fps）\n')
    fo.write(f'const BPM = {BPM:.3f}, BEAT = 60 / BPM, BAR = 4 * BEAT, BAR0 = {BAR0:.3f}, SONG_DUR = {DUR:.3f};\n')
    fo.write('function barT(n) { return BAR0 + n * BAR; }\n')
    fo.write('const VOC = [' + ','.join(f'{x:.2f}' for x in venv) + '];\n')
print(f'写好 timing.js：第 0 小节 {BAR0:.3f} 秒，共 {(DUR - BAR0) / (4 * BEAT):.1f} 小节')
