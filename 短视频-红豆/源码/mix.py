"""声音：只有原曲，不加配音、不加音效（用户说"不要加其他的东西，只是做 MV"）。
原曲 −15.8 LUFS、真峰值 −1.2 dBTP：量出响度，算出到 −16 LUFS 的增益，用 volume 线性调（不压缩、不限幅；
这首只要降 0.17 dB，真峰值约 −1.4 dBTP）。loudnorm 在原曲动态范围（LRA 13.9）比目标大时会退成动态压缩，所以不用它来调。
开头 5 毫秒、结尾 0.25 秒各做一点淡入淡出，免得咔哒声。时间不剪不挪：歌词的逐字时间就是按原曲的时间量的。
用法：python3 mix.py audio/song.mp4 out/audio.wav"""
import json, subprocess, sys

src, out = sys.argv[1], sys.argv[2]
I = -16.0
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', src, '-vn', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=20:print_format=json', '-f', 'null', '-'],
                   capture_output=True, text=True)
m = json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1])
gain = I - float(m['input_i'])
tp = float(m['input_tp']) + gain
assert tp <= -1.0, f'调完真峰值 {tp:.2f} dBTP，太高，要另加限幅'
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout)
af = f"volume={gain:.3f}dB,afade=t=in:d=0.005,afade=t=out:st={dur - .25:.3f}:d=0.25"
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-vn', '-af', af, '-ar', '44100', '-ac', '2', '-c:a', 'pcm_s16le', out], check=True)
print(f"原曲 {m['input_i']} LUFS / 真峰值 {m['input_tp']} dBTP → 增益 {gain:+.2f} dB（线性）→ 约 {I} LUFS / {tp:.2f} dBTP：{out}")
