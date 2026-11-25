"""把 voice_cv3/ 里合成好的播报裁掉首尾静音、统一响度（按 RMS 对齐，峰值不超过 -1 dBFS），压成单声道 24 kHz 的小 mp3，放进 mp3/，build.py 再嵌进网页。
用法：/home/user/tts/venv/bin/python pack.py
"""
import json
import os
import subprocess

import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'voice_cv3')
OUT = os.path.join(HERE, 'mp3')
TARGET_RMS_DB = -17.0
PEAK_DB = -1.0


def main():
    os.makedirs(OUT, exist_ok=True)
    rows = []
    for f in sorted(os.listdir(SRC)):
        if not (f.startswith('n_') and f.endswith('.wav')) or '.' in f[2:-4]:
            continue
        lid = f[2:-4]
        x, sr = sf.read(os.path.join(SRC, f))
        if x.ndim > 1:
            x = x.mean(axis=1)
        # 裁静音：20 ms 一格，比最响那格低 40 dB 的算静音，前后各留 40 ms
        hop = int(sr * 0.02)
        e = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2) + 1e-12) for i in range(0, len(x), hop)])
        db = 20 * np.log10(e)
        on = np.where(db > db.max() - 40)[0]
        a = max(0, on[0] * hop - int(sr * 0.04))
        b = min(len(x), (on[-1] + 1) * hop + int(sr * 0.08))
        y = x[a:b]
        # 淡入淡出 10 ms，免得咔哒一声
        n = int(sr * 0.01)
        y[:n] *= np.linspace(0, 1, n)
        y[-n:] *= np.linspace(1, 0, n)
        rms = 20 * np.log10(np.sqrt(np.mean(y ** 2)) + 1e-12)
        g = 10 ** ((TARGET_RMS_DB - rms) / 20)
        peak = np.max(np.abs(y)) * g
        if peak > 10 ** (PEAK_DB / 20):
            g *= 10 ** (PEAK_DB / 20) / peak
        y = y * g
        tmp = os.path.join(OUT, lid + '.wav')
        sf.write(tmp, y, sr)
        mp3 = os.path.join(OUT, lid + '.mp3')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-ac', '1', '-ar', '24000', '-c:a', 'libmp3lame', '-b:a', '40k', mp3], check=True)
        os.remove(tmp)
        rows.append((lid, len(y) / sr, os.path.getsize(mp3)))
    tot = sum(r[2] for r in rows)
    for lid, d, size in rows:
        print(f'{lid:10s} {d:.2f}s {size / 1024:.1f} KB')
    print(f'{len(rows)} 句，共 {tot / 1024:.0f} KB')
    json.dump({r[0]: round(r[1], 2) for r in rows}, open(os.path.join(OUT, 'durations.json'), 'w'), indent=1)


if __name__ == '__main__':
    main()
