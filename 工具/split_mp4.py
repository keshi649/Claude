"""把一个 MP4 切成几段，每段不超过 LIMIT MB（默认 30）。
优先切在给定的时刻上（比如段落的开头，编码时用 -force_key_frames 在这些时刻放了关键帧），用 segment 封装器切，不重新编码、不重复也不漏帧。
切点按实际大小挑（读每个包的大小，算出每个候选切点之前有多少字节）：段数尽量少，段数一样时让最大的一段尽量小。
（以前按时长均分去找最近的切点，码率前后不均时会多切：《不要说话》109 MB 切成了 6 段，其实 5 段就够。）
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

# 每个包的时刻和大小（音视频都算）→ 任意时刻之前累计多少字节
r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'packet=pts_time,size', '-of', 'csv=p=0', src], capture_output=True, text=True, check=True)
pk = sorted((float(a), int(b)) for a, b in (l.split(',')[:2] for l in r.stdout.split()) if a not in ('', 'N/A'))
def before(t):
    return sum(sz for pt, sz in pk if pt < t - .005)
cands_t = [0.0] + [p for p in pool if 5 < p < dur - 5] + [dur]
cum = [before(t) for t in cands_t[:-1]] + [sum(sz for _, sz in pk)]
over = (size - cum[-1]) / max(1, len(cands_t))           # 封装的额外开销，按段摊

def plan(n, cap):
    """在候选切点里挑 n-1 个，让最大的一段最小；返回 (最大段估计, 切点) 或 None"""
    m = len(cands_t)
    INF = float('inf')
    best = [[INF] * m for _ in range(n + 1)]; prev = [[-1] * m for _ in range(n + 1)]
    best[0][0] = 0
    for k in range(1, n + 1):
        for j in range(1, m):
            for i in range(j):
                if best[k - 1][i] == INF or cands_t[j] - cands_t[i] < 5:
                    continue
                v = max(best[k - 1][i], cum[j] - cum[i] + over)
                if v < best[k][j]:
                    best[k][j], prev[k][j] = v, i
    if best[n][m - 1] > cap:
        return None
    pts, j = [], m - 1
    for k in range(n, 0, -1):
        pts.append(cands_t[j]); j = prev[k][j]
    return best[n][m - 1], [0.0] + pts[::-1]

margin = .97
n = math.ceil(size / LIM)
while True:
    if n > 40: sys.exit('切不开')
    pl = plan(n, LIM * margin)
    if pl is None:                       # n 段装不下：多切一段
        n += 1; continue
    outs = cut(pl[1])
    if all(sz <= LIM for *_, sz in outs): break
    for o, *_ in outs: os.remove(o)
    if margin > .9:
        margin -= .02                    # 估计偏小了：收紧一点再试
    else:
        n += 1; margin = .97
# 核对：每段的帧数加起来要等于整片的帧数（切点没有重叠、没有漏）
def nframes(p):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_packets', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', p], capture_output=True, text=True, check=True)
    return int(r.stdout.strip().strip(','))
total = nframes(src); parts = [nframes(o) for o, *_ in outs]
for (o, a, b, sz), nf in zip(outs, parts): print(f'{o}  {a:7.2f} → {b:7.2f} 秒  {nf} 帧  {sz / 1048576:.1f} MB')
print(f'各段帧数之和 {sum(parts)}，整片 {total} 帧' + ('' if sum(parts) == total else '  ← 对不上！'))
