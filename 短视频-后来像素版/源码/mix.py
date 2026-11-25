"""把原曲的响度调到 −16 LUFS（只乘一个固定增益，不压缩），输出 wav。
用法：python3 mix.py 输入 输出.wav"""
import json, re, subprocess, sys
src, dst = sys.argv[1], sys.argv[2]
r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', src, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True)
I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr)[-1]); TP = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r.stderr)[-1])
gain = -16.0 - I
print(f'原曲 {I:.1f} LUFS，真峰值 {TP:+.1f} dBTP → 增益 {gain:+.1f} dB → 峰值 {TP + gain:+.1f} dBTP')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-vn', '-af', f'volume={gain:.2f}dB', '-ar', '44100', '-ac', '2', dst], check=True)
