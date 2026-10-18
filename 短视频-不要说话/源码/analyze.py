"""歌曲分析：节拍网格、强拍、每小节的人声 / 伴奏响度。
先跑 Demucs 分出人声（见 README），再运行：/home/user/mvenv/bin/python analyze.py
结果打印出来，用来排镜头；最后写进 timing.js 的是 BPM、第 0 小节的时刻和每小节的力度。"""
import json, sys
import numpy as np, librosa

SR, HOP = 22050, 256
song, _ = librosa.load('audio/song.wav', sr=SR, mono=True)
voc, _ = librosa.load('out/demucs/htdemucs/song/vocals.wav', sr=SR, mono=True)
acc, _ = librosa.load('out/demucs/htdemucs/song/no_vocals.wav', sr=SR, mono=True)
fps = SR / HOP

env = librosa.onset.onset_strength(y=acc, sr=SR, hop_length=HOP)
env = env / (env.max() + 1e-9)
t_env = np.arange(len(env)) / fps

tempo0, beats0 = librosa.beat.beat_track(onset_envelope=env, sr=SR, hop_length=HOP)
print('librosa tempo', tempo0)

def score(bpm, phase, lo=None, hi=None):
    p = 60 / bpm
    ts = np.arange(phase, t_env[-1], p)
    if lo is not None: ts = ts[(ts >= lo) & (ts < hi)]
    idx = np.round(ts * fps).astype(int)
    idx = idx[idx < len(env)]
    # take max in a +-1 frame window
    v = np.maximum(np.maximum(env[idx], env[np.clip(idx - 1, 0, None)]), env[np.clip(idx + 1, None, len(env) - 1)])
    return v.mean()

t0 = float(np.atleast_1d(tempo0)[0])
best = (0, 0, 0)
for bpm in np.arange(t0 * 0.97, t0 * 1.03, 0.01):
    p = 60 / bpm
    for ph in np.arange(0, p, 0.004):
        s = score(bpm, ph, 18, 255)
        if s > best[0]: best = (s, bpm, ph)
print('grid best: bpm %.3f phase %.3f score %.3f' % (best[1], best[2], best[0]))
bpm, ph = best[1], best[2]
P = 60 / bpm
# drift check: best phase offset per 30 s window
for lo in range(15, 280, 30):
    bo = max(((score(bpm, ph + d, lo, lo + 30), d) for d in np.arange(-0.06, 0.061, 0.004)))
    print(f'  window {lo:3d}-{lo+30:3d}s best offset {bo[1]*1000:+.0f} ms')

# downbeat: low-frequency onset energy on each beat, folded mod 4
S = np.abs(librosa.stft(acc, n_fft=2048, hop_length=HOP))
freqs = librosa.fft_frequencies(sr=SR, n_fft=2048)
low = S[freqs < 150].sum(axis=0)
lowd = np.maximum(0, np.diff(low, prepend=low[0]))
beat_t = np.arange(ph, t_env[-1], P)
acc4 = np.zeros(4); cnt = np.zeros(4)
for i, bt in enumerate(beat_t):
    if bt < 18 or bt > 255: continue
    k = int(round(bt * fps))
    acc4[i % 4] += lowd[max(0, k - 2):k + 3].max(); cnt[i % 4] += 1
print('low-onset by beat mod 4:', np.round(acc4 / cnt, 1))
db = int(np.argmax(acc4 / cnt))
bar0 = ph + db * P
while bar0 - 4 * P > -1e-9: bar0 -= 4 * P
print('bar length %.4f s, bar 0 at %.3f s' % (4 * P, bar0))

# per-bar loudness
def rms_db(y, a, b):
    s = y[int(a * SR):int(b * SR)]
    return 20 * np.log10(np.sqrt((s ** 2).mean()) + 1e-9) if len(s) else -99
bars = []
n = 0
while bar0 + n * 4 * P < len(song) / SR:
    a = bar0 + n * 4 * P; b = a + 4 * P
    bars.append((n, a, rms_db(voc, a, b), rms_db(acc, a, b)))
    n += 1
for (n, a, v, c) in bars:
    m, s = divmod(a, 60)
    print(f'bar {n:3d} {a:7.2f}s ({int(m)}:{s:05.2f})  voc {v:6.1f}  acc {c:6.1f}  ' + '#' * max(0, int((v + 50) / 2)))
json.dump({'bpm': float(bpm), 'beat0': float(ph), 'bar0': float(bar0), 'barLen': float(4 * P),
           'bars': [{'n': n, 't': float(a), 'voc': float(v), 'acc': float(c)} for (n, a, v, c) in bars]},
          open('out/analysis.json', 'w'), indent=1)
