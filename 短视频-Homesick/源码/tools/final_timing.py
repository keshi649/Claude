# 定稿逐字时间：副歌四遍取中位数校正；个别行用第二次对齐或手修；字和字至少隔 0.07 秒；换算成成片时间（歌曲时间 − 3.42）
import json, sys, numpy as np, copy
a1 = json.load(open(sys.argv[1])); a2 = json.load(open(sys.argv[2])); lrc = json.load(open(sys.argv[3]))
OFF = 3.42; B0 = 4.66; BAR = 4 * 60 / 129.995
res = copy.deepcopy(a1)
# 副歌：A 段 4 遍、B 段 4 遍，各 5 行
A = [(0, 0), (24, 32), (48, 64), (87, 112)]; Bs = [(5, 8), (29, 40), (53, 72), (92, 120)]
for reps in (A, Bs):
    for k in range(5):
        rel = np.array([[u['s'] - (B0 + b * BAR) for u in a1[i0 + k]['units']] for i0, b in reps])
        med = np.median(rel, axis=0)
        for r, (i0, b) in enumerate(reps):
            for j, u in enumerate(res[i0 + k]['units']):
                if abs(rel[r, j] - med[j]) > 0.08:
                    u['s'] = round(B0 + b * BAR + med[j], 3); u['fix'] = 'median'
# 个别行
res[37]['units'] = copy.deepcopy(a2[37]['units'])
for u, s in zip(res[74]['units'], [182.56, 182.64, 183.01, 183.43]): u['s'] = s; u['fix'] = 'hand'
# 最小间隔：挤在一起的字往两边的大空隙里摊开
for L in res:
    s = [u['s'] for u in L['units']]
    for _ in range(20):
        ok = True
        for j in range(1, len(s)):
            if s[j] - s[j-1] < 0.07:
                ok = False
                left = s[j-1] - s[j-2] if j >= 2 else 1
                right = s[j+1] - s[j] if j + 1 < len(s) else 1
                if right >= left: s[j] = s[j-1] + 0.07
                else: s[j-1] = s[j] - 0.07
        if ok: break
    for u, v in zip(L['units'], s): u['s'] = round(v, 3)
out = [dict(i=-1, ko='미안해', zh='对不起', units=[dict(u='미', s=0.06), dict(u='안', s=0.24), dict(u='해', s=0.40)], end=0.66, sec='intro')]
for L, R in zip(res, lrc):
    us = [dict(u=u['u'], s=round(u['s'] - OFF, 3)) for u in L['units']]
    out.append(dict(i=L['i'], sec=R['sec'], ko=R['ko'], zh=R['zh'], zh_src=R['zh_src'], units=us, last_end=round(L['units'][-1]['e'] - OFF, 3)))
json.dump(out, open(sys.argv[4], 'w'), ensure_ascii=False, indent=1)
for o in out[:4] + out[36:40] + out[74:77]:
    print(o['i'], o['ko'], ' '.join(f"{u['u']}{u['s']:.2f}" for u in o['units']))
print('lines', len(out))
