# 剪掉首尾空白：留开头那句"미안해"（0.86~1.52 秒），接 4.05 秒以后的正曲，结尾 272.45 秒前淡出
import numpy as np, soundfile as sf, sys
y, sr = sf.read(sys.argv[1])
A0, A1, B0, B1 = 0.86, 1.52, 4.05, 272.45
XF, FIN, FOUT = 0.03, 0.03, 0.35
a = y[int(A0*sr):int(A1*sr)].copy(); b = y[int(B0*sr):int(B1*sr)].copy()
n = int(FIN*sr); a[:n] *= np.linspace(0, 1, n)[:, None]
x = int(XF*sr)
ramp = np.linspace(0, 1, x)[:, None]
mid = a[-x:] * (1 - ramp) + b[:x] * ramp
out = np.concatenate([a[:-x], mid, b[x:]])
k = int(FOUT*sr); out[-k:] *= np.linspace(1, 0, k)[:, None] ** 2
sf.write(sys.argv[2], out, sr, subtype='PCM_16')
print('dur', len(out)/sr, 'offset (song→video) for t>=B0:', round(B0 - (A1 - A0 - XF), 4), 'whisper offset', A0)
