"""只重渲了几段画面时，把它们换进 build.sh 渲出来的 out/part0~N.mp4，按帧精确拼接，配上音频一次编码成成片。
（-c copy 只能在关键帧上切；这里解码后按帧号 trim 再 concat，反正最后那次编码本来就要做。）
先重渲要换的帧：node render.cjs video 起始帧 结束帧 out/re_起始帧.mp4 30
用法：python3 工具/splice_parts.py 源码目录 输出.mp4 音频.wav 关键帧时刻(逗号分隔,可空) [re_起始帧.mp4 …]
  替换片段的文件名里要带起始帧（re_2190.mp4 从第 2190 帧开始），帧数按文件自己数。
编码参数和 build.sh 的最后一步一样：libx264 -preset slow -tune animation -crf 20，AAC 192k，-aac_pns 0。"""
import os
import re
import subprocess
import sys

src, out, audio, cuts = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
reps = sys.argv[5:]


def nframes(f):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_frames', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', f],
                       capture_output=True, text=True)
    return int(r.stdout.strip())


parts = []
i = 0
while os.path.exists(os.path.join(src, 'out', f'part{i}.mp4')):
    parts.append(os.path.join(src, 'out', f'part{i}.mp4'))
    i += 1
base, f0 = [], 0                                   # (文件, 在整片里的起始帧, 帧数)
for p in parts:
    n = nframes(p)
    base.append((p, f0, n))
    f0 += n
TOTAL = f0
rep = []
for r in reps:
    a = int(re.search(r'(\d+)\.mp4$', r).group(1))
    rep.append((r if os.path.isabs(r) else os.path.join(src, r), a, nframes(r if os.path.isabs(r) else os.path.join(src, r))))
rep.sort(key=lambda x: x[1])
print(f'整片 {TOTAL} 帧；替换：' + '，'.join(f'{a}–{a + n}' for _, a, n in rep))

# 从头到尾排出每一段：在替换片段里的用替换片段，其余用原来的 part
pieces = []                                        # (文件, 文件里的起始帧, 文件里的结束帧)
t = 0
for f, a, n in rep + [(None, TOTAL, 0)]:
    while t < a:                                   # 原来的 part 补上 [t, a)
        for p, pa, pn in base:
            if pa <= t < pa + pn:
                e = min(a, pa + pn)
                pieces.append((p, t - pa, e - pa))
                t = e
                break
    if f:
        pieces.append((f, 0, n))
        t = a + n
assert sum(e - s for _, s, e in pieces) == TOTAL, '拼起来的帧数和原来不一样'
files = []
for f, _, _ in pieces:
    if f not in files:
        files.append(f)
args = ['ffmpeg', '-y', '-loglevel', 'error']
for f in files:
    args += ['-i', f]
args += ['-i', audio]
fc = ''.join(f'[{files.index(f)}:v]trim=start_frame={s}:end_frame={e},setpts=PTS-STARTPTS[v{k}];' for k, (f, s, e) in enumerate(pieces))
fc += ''.join(f'[v{k}]' for k in range(len(pieces))) + f'concat=n={len(pieces)}:v=1:a=0[outv]'
args += ['-filter_complex', fc, '-map', '[outv]', '-map', f'{len(files)}:a',
         '-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation', '-crf', os.environ.get('CRF', '20')]
if cuts:
    args += ['-force_key_frames', cuts]
args += ['-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-aac_pns', '0', '-movflags', '+faststart', '-shortest', out]
print(f'{len(pieces)} 段拼接，编码中……')
subprocess.run(args, check=True)
print(out, nframes(out), '帧')
