# 画几段人声的频谱，竖线标出两次对齐的字的时刻（上：第一次，下：第二次）
import json, sys, numpy as np, soundfile as sf, librosa, matplotlib
matplotlib.use('Agg'); import matplotlib.pyplot as plt
from matplotlib import font_manager
v, sr = sf.read(sys.argv[1]); v = v.mean(1)
a1 = json.load(open(sys.argv[2])); a2 = json.load(open(sys.argv[3]))
fp = font_manager.FontProperties(fname=sys.argv[4])
wins = [tuple(map(float, w.split(':'))) for w in sys.argv[6:]]
fig, axs = plt.subplots(len(wins), 1, figsize=(16, 3.2*len(wins)))
for ax, (a, b) in zip(np.atleast_1d(axs), wins):
    seg = v[int(a*sr):int(b*sr)]
    S = librosa.amplitude_to_db(np.abs(librosa.stft(seg, n_fft=1024, hop_length=128)), ref=np.max)
    ax.imshow(S[:200], origin='lower', aspect='auto', extent=[a, b, 0, 200*sr/1024], cmap='magma', vmin=-70)
    rms = librosa.feature.rms(y=seg, hop_length=128)[0]
    tt = a + np.arange(len(rms))*128/sr
    ax.plot(tt, 200*sr/1024*(0.5+0.5*rms/rms.max()), 'w', lw=.8)
    for A, col, y0 in [(a1, 'cyan', .62), (a2, 'lime', .1)]:
        for L in A:
            for u in L['units']:
                if a <= u['s'] <= b:
                    ax.axvline(u['s'], color=col, lw=.8, ymin=y0, ymax=y0+.28)
                    ax.text(u['s'], 200*sr/1024*(y0+.3), u['u'][:6], color=col, fontproperties=fp, fontsize=9)
    ax.set_xlim(a, b)
plt.tight_layout(); plt.savefig(sys.argv[5], dpi=70)
