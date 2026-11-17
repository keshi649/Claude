#!/usr/bin/env python3
"""把 kara.py 量到的 60 段擦色对到歌词上，算出每个字开唱的时刻，写 timing.js / timing.json。
用法：python3 kara.py audio/song.mp4 out/kara_raw.json && python3 kara2.py"""
import json
fps = 30
d = json.load(open('out/kara_raw.json'))
segs = []
for k, rows in d['rows'].items():
    cur = None
    for i, (x0, x1, c) in enumerate(rows + [[-1, -1, 0]]):
        if c > 0:
            if cur is None: cur = {'row': k, 'fr': []}
            cur['fr'].append((i, x0, x1))
        elif cur is not None:
            if len(cur['fr']) >= 4: segs.append(cur)
            cur = None
segs.sort(key=lambda s: s['fr'][0][0])
V1 = ['圣诞节', '剩下单人的剩单节', '过条街', '最好又给我下起雪', '这么衰', '这么刚好 这么狼狈', '要不要拍成 MV 干脆', '淡淡忧伤还是最美', '剧情是你在写', '有点无解 我们之间']
V2 = ['踏着雪', '不知不觉走了很远', '绕着圈', '我叛逆点起一根烟', '一整天', '我旋律哼了一千遍', '千遍一律我不醉不归', '没有你的冬天', '我会一直唱着唱着', '直到你出现']
CH = ['为你封麦 只唱你爱', "Goodbye Don't Cry", '哭个痛快', '曲终人散 你也走散', '我承认我是', '爱情里的废柴', '你的离开 喊得太快', '我的依赖 还在耍赖', '眼泪打转 转不回来', '你的笑容灿烂']
PH = V1 + V2 + CH + V2 + CH + CH
assert len(PH) == len(segs) == 60, (len(PH), len(segs))
# 一行歌词由哪几段拼成（按用户给的 LRC 分行）
G1 = [[0, 1], [2, 3], [4, 5], [6], [7], [8, 9]]
G2 = [[0, 1], [2, 3], [4, 5], [6], [7], [8], [9]]
GC = [[0], [1, 2], [3], [4, 5], [6], [7], [8], [9]]
GROUPS = [[i for i in g] for g in G1] + [[10 + i for i in g] for g in G2] + [[20 + i for i in g] for g in GC] + [[30 + i for i in g] for g in G2] + [[40 + i for i in g] for g in GC] + [[50 + i for i in g] for g in GC]
SEC = ['v1'] * 6 + ['v2'] * 7 + ['c1'] * 8 + ['v3'] * 7 + ['c2'] * 8 + ['c3'] * 8
def unit(ch): return .3 if ch == ' ' else (.55 if ord(ch) < 128 else 1)
def chars_of(si):
    s, text = segs[si], PH[si]
    x0 = min(f[1] for f in s['fr']); x1 = max(f[2] for f in s['fr'])
    tot = sum(unit(c) for c in text); acc = 0; out = []
    fr = s['fr']
    for c in text:
        xk = x0 + (x1 - x0) * acc / tot + min(8, (x1 - x0) * unit(c) / tot * .3); acc += unit(c)
        if c == ' ': continue
        t = next((f[0] for f in fr if f[2] >= xk), fr[-1][0]) / fps
        out.append([c, round(t, 3)])
    out[0][1] = round(fr[0][0] / fps, 3)
    tfull = next(f[0] for f in fr if f[2] >= x1 - 3) / fps
    return out, round(tfull, 3)
lines = []
for gi, g in enumerate(GROUPS):
    chars = []; tfull = 0; text = ''
    for j, si in enumerate(g):
        cs, tf = chars_of(si); tfull = tf
        if j: chars.append([' ', cs[0][1]]); text += ' '
        # 段内的空格放回去（显示用）
        k = 0
        for c in PH[si]:
            if c == ' ': chars.append([' ', cs[k][1] if k < len(cs) else tf])
            else: chars.append(cs[k]); k += 1
        text += PH[si]
    lines.append({'i': gi, 'sec': SEC[gi], 'text': text, 't0': chars[0][1], 't1': tfull, 'chars': chars})
for a, b in zip(lines, lines[1:]): assert a['t0'] < b['t0']
json.dump(lines, open('timing.json', 'w'), ensure_ascii=False, indent=0)
open('timing.js', 'w').write('/* 歌词逐字时间：kara.py + kara2.py 从原 MV 的卡拉 OK 字幕量出来的，别手改 */\nconst LYR = ' + json.dumps(lines, ensure_ascii=False) + ';\n')
for l in lines: print('%2d %s %7.2f %7.2f  %s  |' % (l['i'], l['sec'], l['t0'], l['t1'], l['text']), ' '.join('%.2f' % c[1] for c in l['chars'] if c[0] != ' '))
