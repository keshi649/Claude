"""节拍和强拍：在伴奏轨的 onset 包络上网格搜速度和相位，再按拍号 mod 4 看哪一拍是强拍。
结果（写死在 align.py 里）：94.99 BPM，第 0 拍 0.222 秒；第 1、3 拍（mod 1、3）上军鼓 / 拍手的高频起音最强，
所以 mod 0、2 是 1、3 拍；两处镲片（11.59、21.70 秒）都落在 mod 2 上，人声每句也从 mod 2 开口 → mod 2 是强拍。
第 1 小节的强拍 = 0.222 + 2 拍 = 1.485 秒（人声"你"从这里开口；前面 1.2 秒是 2 拍前奏）。
依赖：librosa、numpy。用法：python3 analyze.py （读 audio/song.wav 和 Demucs 分出来的 audio/stems/no_vocals.wav）"""
import numpy as np, librosa

acc, sr = librosa.load('audio/stems/no_vocals.wav', sr=22050, mono=True)
hop = 128; fps = sr / hop
oenv = librosa.onset.onset_strength(y=acc, sr=sr, hop_length=hop)
ot = librosa.times_like(oenv, sr=sr, hop_length=hop)
# 先粗看自相关：0.627 秒一拍（约 95 BPM）最高，比 142.5、71 BPM 都高得多
best = None
for bpm in np.arange(94.0, 96.0, 0.01):
    per = 60 / bpm
    for ph in np.arange(0, per, .002):
        idx = np.clip(np.round(np.arange(ph, ot[-1], per) * fps).astype(int), 0, len(oenv) - 1)
        s = oenv[idx].mean()
        if best is None or s > best[0]: best = (s, bpm, ph)
s, bpm, ph = best
print('速度 %.2f BPM，第 0 拍 %.3f 秒' % (bpm, ph))
beats = np.arange(ph, ot[-1], 60 / bpm)
S = np.abs(librosa.stft(acc, n_fft=2048, hop_length=hop)); fr = librosa.fft_frequencies(sr=sr, n_fft=2048)
def band(lo, hi):
    e = np.log1p(S[(fr >= lo) & (fr < hi)]).sum(0); return np.maximum(0, np.diff(e, prepend=e[0]))
low, high = band(20, 120), band(4000, 11000)
at = lambda e, t: e[max(0, int(round(t * fps)) - 2):int(round(t * fps)) + 3].max()
for k in range(4):
    print('mod %d：低频起音 %.2f，高频起音 %.2f' % (k, np.mean([at(low, t) for t in beats[k::4]]), np.mean([at(high, t) for t in beats[k::4]])))
