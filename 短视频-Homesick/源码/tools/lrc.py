# 按顺序把歌词和视频里的段对上，得出每行的换行时刻（上一行停稳段的结束 = 开始滚动）
import sys
sys.path.insert(0, sys.argv[1])
from lyrics import SONG
import json
segs = [l.rstrip('\n').split('\t') for l in open(sys.argv[2])]
segs = [(int(k), float(a), float(z)) for k, a, z, n in segs]
lines = [(sec, ko, zs, zm) for sec, L in SONG for (ko, zs, zm) in L]
print('lyric lines', len(lines))
# 视频段：2..117，相邻同文字的段合并；人工对照：哪些段是同一行的续段
cont = {5, 7, 12, 15, 24, 32, 35, 39, 42, 51, 55, 58, 67, 73, 107, 109, 114, 116, 117}
vs = []
for k, a, z in segs:
    if k < 2: continue
    if k in cont: vs[-1][2] = z; continue
    vs.append([k, a, z])
print('video lines', len(vs))
out = []
for i, ((sec, ko, zs, zm), (k, a, z)) in enumerate(zip(lines, vs)):
    prev_end = vs[i-1][2] if i else 4.6
    out.append(dict(i=i, sec=sec, ko=ko, zh_src=zs, zh=zm or zs, seg=k, lrc=round(prev_end + 0.05, 2), stable=(a, z)))
for o in out: print(o['i'], o['sec'], o['seg'], o['lrc'], o['ko'])
json.dump(out, open(sys.argv[3], 'w'), ensure_ascii=False, indent=1)
