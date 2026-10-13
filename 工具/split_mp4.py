"""把一个 MP4 切成几段，每段不超过 LIMIT MB（默认 30）。
优先切在给定的时刻上（比如段落的开头，编码时用 -force_key_frames 在这些时刻放了关键帧），用 segment 封装器切，不重新编码、不重复也不漏帧。
用法：python3 工具/split_mp4.py 成片.mp4 输出前缀 [LIMIT_MB] [切点1,切点2,...]
输出：前缀_1.mp4、前缀_2.mp4 …，打印每段的起止时刻和大小。"""
import json, math, os, subprocess, sys

src, prefix = sys.argv[1], sys.argv[2]
limit = float(sys.argv[3]) if len(sys.argv) > 3 else 30.0
cands = [float(x) for x in sys.argv[4].split(',')] if len(sys.argv) > 4 and sys.argv[4] else []
LIM = int(limit * 1024 * 1024)

def probe(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration,size', '-of', 'json', path], capture_output=True, text=True, check=True)
    f = json.loads(r.stdout)['format']; return float(f['duration']), int(f['size'])
def keyframes(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-skip_frame', 'nokey', '-show_entries', 'frame=pts_time', '-of', 'csv=p=0', path], capture_output=True, text=True, check=True)
    return sorted(float(x.split(',')[0]) for x in r.stdout.split() if x.strip(', '))

dur, size = probe(src)
if size <= LIM:
    print(f'{src} 只有 {size / 1048576:.1f} MB，不用切'); sys.exit(0)
keys = keyframes(src)
snap = lambda t: min(keys, key=lambda k: abs(k - t))
pool = sorted(set(snap(c) for c in cands)) if cands else keys

def cut(points):
    """用 segment 封装器一次切开：切在每个切点上的关键帧，不重复也不漏帧（-c copy，不重新编码）"""
    inner = points[1:-1]
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-c', 'copy', '-map', '0', '-f', 'segment',
                    '-segment_times', ','.join(f'{t - .01:.3f}' for t in inner), '-reset_timestamps', '1',
                    '-segment_format_options', 'movflags=+faststart', '-segment_start_number', '1', f'{prefix}_%d.mp4'], check=True)
    return [(f'{prefix}_{i + 1}.mp4', points[i], points[i + 1], os.path.getsize(f'{prefix}_{i + 1}.mp4')) for i in range(len(points) - 1)]

n = math.ceil(size / (LIM * .92))
while True:
    pts = [0.0]
    for k in range(1, n):
        ideal = dur * k / n
        near = [p for p in pool if pts[-1] + 5 < p < dur - 5]
        pts.append(min(near, key=lambda p: abs(p - ideal)) if near else snap(ideal))
    pts.append(dur)
    pts = sorted(set(pts))
    outs = cut(pts)
    if all(sz <= LIM for *_, sz in outs): break
    for o, *_ in outs: os.remove(o)
    n += 1
    if n > 40: sys.exit('切不开')
# 核对：每段的帧数加起来要等于整片的帧数（切点没有重叠、没有漏）
def nframes(p):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_packets', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', p], capture_output=True, text=True, check=True)
    return int(r.stdout.strip().strip(','))
total = nframes(src); parts = [nframes(o) for o, *_ in outs]
for (o, a, b, sz), nf in zip(outs, parts): print(f'{o}  {a:7.2f} → {b:7.2f} 秒  {nf} 帧  {sz / 1048576:.1f} MB')
print(f'各段帧数之和 {sum(parts)}，整片 {total} 帧' + ('' if sum(parts) == total else '  ← 对不上！'))
