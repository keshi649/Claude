# 原曲的响度：先量（EBU R128），再用一个固定增益线性调到 -16 LUFS，最后核对真峰值。
# 不用 loudnorm：它在动态范围大的时候会退成动态压缩，改变原曲的声音。
# 用法：python3 mix.py 原曲.wav 输出.wav
import re, subprocess, sys
src, out = sys.argv[1], sys.argv[2]
TARGET = -16.0
def measure(p):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', p, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1]); tp = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r)[-1])
    return I, tp
I, tp = measure(src)
gain = TARGET - I
print(f'原曲 {I:.1f} LUFS，真峰值 {tp:+.1f} dBTP → 增益 {gain:+.2f} dB')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af', f'volume={gain:.3f}dB', '-ar', '48000', '-c:a', 'pcm_s24le', out], check=True)
I2, tp2 = measure(out)
print(f'调好以后 {I2:.1f} LUFS，真峰值 {tp2:+.1f} dBTP')
if tp2 > -1.0: sys.exit('真峰值太高')
