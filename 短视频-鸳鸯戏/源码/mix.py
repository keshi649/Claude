"""《鸳鸯戏》MV 的声音：就是原曲，不加配音、不加音效。
- 原曲是 DJ 版，压得很响（-7.5 LUFS，真峰值 +1.1 dBTP）。整体降到约 -16 LUFS（和仓库里别的片子一样），
  4 倍过采样找真峰值，超过 -1.5 dBTP 才限幅（这首降完以后峰值很低，一般用不上）。
- 最后 0.15 秒淡出，免得结尾咔一声。
用法：python3 mix.py audio/song.wav out/mix.wav"""
import re, subprocess, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly

TARGET_LUFS = -16.0
CEIL_DB = -1.5
src, dst = sys.argv[1], sys.argv[2]

def lufs(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True)
    s = r.stderr[r.stderr.rfind('Summary:'):]
    return float(re.search(r'I:\s+(-?[\d.]+) LUFS', s).group(1)), float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', s).group(1))

sr, x = wavfile.read(src)
x = x.astype(np.float64) / (32768.0 if x.dtype == np.int16 else 1.0)
if x.ndim == 1: x = np.stack([x, x], 1)
I0, tp0 = lufs(src)
gain = 10 ** ((TARGET_LUFS - I0) / 20)
y = x * gain
fo = int(.15 * sr); y[-fo:] *= np.linspace(1, 0, fo)[:, None]
# 真峰值（4 倍过采样）
up = np.max(np.abs(resample_poly(y, 4, 1, axis=0)))
ceil = 10 ** (CEIL_DB / 20)
if up > ceil:
    y *= ceil / up
    print(f'限幅：真峰值 {20 * np.log10(up):.2f} dBTP → {CEIL_DB} dBTP')
wavfile.write(dst, sr, (np.clip(y, -1, 1) * 32767).astype(np.int16))
I1, tp1 = lufs(dst)
print(f'原曲 {I0:.1f} LUFS / {tp0:.1f} dBTP → {I1:.1f} LUFS / {tp1:.1f} dBTP（增益 {20 * np.log10(gain):.1f} dB）')
