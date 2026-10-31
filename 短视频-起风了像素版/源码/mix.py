"""mix.py —— MV 只放原曲：不加画外音、不加音效，只把响度线性调到 −16 LUFS（不用 loudnorm：原曲动态大时它会变成压缩）。
用法：python3 mix.py audio/song.wav out/mix.wav"""
import re
import subprocess
import sys

src, dst = sys.argv[1], sys.argv[2]


def measure(path, gain_db=0.0):
    r = subprocess.run(['ffmpeg', '-nostats', '-i', path, '-af', f'volume={gain_db}dB,ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    s = r[r.rfind('Summary'):]
    return float(re.search(r'I:\s+(-?[\d.]+) LUFS', s).group(1)), float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', s).group(1))


L0, P0 = measure(src)
gain = -16.0 - L0
L1, P1 = measure(src, gain)
if P1 > -1.0:                                   # 真峰值太高就再往下压一点（这首歌不会发生）
    gain -= P1 + 1.0
    L1, P1 = measure(src, gain)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af', f'volume={gain:.3f}dB', '-c:a', 'pcm_s24le', dst], check=True)
print(f'mix: 原曲 {L0:.1f} LUFS、真峰值 {P0:.1f} dBTP → 加 {gain:.2f} dB → {L1:.1f} LUFS、真峰值 {P1:.1f} dBTP')
