"""声音：只有原曲，不加配音、不加音效（用户说"就是做一个 MV"）。
原曲片段 −16.9 LUFS、真峰值 −4.6 dBFS：用 ffmpeg loudnorm 两遍法按线性增益调到 −16 LUFS（真峰值上限 −1.5 dBTP，这首用不到限幅），
开头 5 毫秒、结尾 0.25 秒各做一点淡入淡出，免得咔哒声。时间不剪不挪：歌词的逐字时间就是按原曲的时间量的。
用法：python3 mix.py audio/song.mp4 out/audio.wav"""
import json, subprocess, sys

src, out = sys.argv[1], sys.argv[2]
I, TP, LRA = -16.0, -1.5, 11
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', src, '-vn', '-af', f'loudnorm=I={I}:TP={TP}:LRA={LRA}:print_format=json', '-f', 'null', '-'],
                   capture_output=True, text=True)
m = json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1])
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout)
af = (f"loudnorm=I={I}:TP={TP}:LRA={LRA}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,"
      f"afade=t=in:d=0.005,afade=t=out:st={dur - .25:.3f}:d=0.25")
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-vn', '-af', af, '-ar', '44100', '-ac', '2', '-c:a', 'pcm_s16le', out], check=True)
print(f"原曲 {m['input_i']} LUFS / 真峰值 {m['input_tp']} dBTP → 目标 {I} LUFS（线性增益）：{out}")
