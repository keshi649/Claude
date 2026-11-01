"""从用户发来的抖音歌词视频里量出每句歌词滚到位的时刻、每个字被"擦亮"的时刻 → kara_chars.json（给 align.py 开窗口用）。
那条视频 1080×1440、30fps：歌词一行一行往上滚，正在唱的那行停在 y 690~775；唱到哪儿，哪儿从浅灰（约 225）变成纯白（255），
是一列一列往右擦过去的。
做法：
1. 逐帧取 y 640~830 每一行纯白像素的个数（定这一行是不是停稳了），和 y 690~775 每一列"纯白 / 有字"的像素数。
2. 停稳的帧（纯白像素的上下沿在高亮行的位置）按左右边界归成一行一行；抖动拆开的同一行合并。前 2 行是片头字幕（作曲、制作人）。
3. 每一列：纯白像素占有字像素 6 成以上算"唱过"；从左往右数，唱过的列占 75% 以上的最右一列就是擦到的位置。
   字宽固定 50.4 像素（带空格的两行按总宽度把空格宽算出来），擦过第 i 个字的 20% 的那一帧就是它开唱的时刻。
   滚到位那一帧就已经亮了的字量不到。
这个擦亮是按句子匀速插出来的，不是逐字的：和强制对齐比，中位数早 0.06 秒，但前后差到 0.5 秒的不少，所以只用来定窗口。
文字是人看截图读出来的（LY）。视频里第一遍副歌写"不在"，后面写"不再"，统一成"不再"。
用法：python3 kara.py audio/song.mp4   （写 kara_chars.json）"""
import json, subprocess, sys
import numpy as np

LY = """后来|我总算学会了如何去爱|可惜你早已远去|消失在人海|后来|终于在眼泪中明白|有些人一旦错过就不再|栀子花 白花瓣|落在我蓝色百褶裙上|爱你 你轻声说|我低下头闻见一阵芬芳|那个永恒的夜晚|十七岁仲夏|你吻我的那个夜晚|让我往后的时光|每当有感叹|总想起当天的星光|那时候的爱情|为什么就能那样简单|而又是为什么人年少时|一定要让深爱的人受伤|在这相似的深夜里|你是否一样|也在静静追悔感伤|如果当时我们能不那么倔强|现在也不那么遗憾|你都如何回忆我|带着笑或是很沉默|这些年来有没有人能让你不寂寞|后来|我总算学会了如何去爱|可惜你早已远去|消失在人海|后来|终于在眼泪中明白|有些人一旦错过就不再|你都如何回忆我|带着笑或是很沉默|这些年来有没有人能让你不寂寞|后来|我总算学会了如何去爱|可惜你早已远去|消失在人海|后来|终于在眼泪中明白|有些人一旦错过就不再|后来|我总算学会了如何去爱|可惜你早已远去|消失在人海|后来|终于在眼泪中明白|有些人一旦错过就不再|永远不会再重来|有一个男孩爱着那个女孩""".split('|')
CREDITS = 2
FPS = 30
ADV = 50.4


def measure(src):
    W, Y0, H = 1080, 640, 190
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-an', '-vf', f'crop={W}:{H}:0:{Y0},format=gray', '-f', 'rawvideo', '-'], stdout=subprocess.PIPE)
    rows, nw, nt = [], [], []
    while True:
        b = p.stdout.read(W * H)
        if len(b) < W * H: break
        a = np.frombuffer(b, np.uint8).reshape(H, W)
        rows.append((a >= 248).sum(axis=1))
        band = a[50:136]
        nw.append((band >= 246).sum(axis=0)); nt.append((band >= 185).sum(axis=0))
    return np.array(rows), np.array(nw), np.array(nt)


def group(rows, nt):
    st = []
    for i in range(len(rows)):
        ys = np.nonzero(rows[i] > 0)[0]; xs = np.nonzero(nt[i] >= 3)[0]
        st.append((ys.min() if len(ys) else -1, ys.max() if len(ys) else -1, xs.min() if len(xs) else -1, xs.max() if len(xs) else -1))
    lines = []
    for i, (top, bot, L, R) in enumerate(st):
        if not (62 <= top <= 71 and 108 <= bot <= 116 and L >= 0): continue
        if lines and i - lines[-1]['b'] <= 3 and abs(L - lines[-1]['L']) <= 8 and abs(R - lines[-1]['R']) <= 8:
            lines[-1]['b'] = i; continue
        lines.append(dict(a=i, b=i, L=int(L), R=int(R)))
    return [l for l in lines if l['b'] - l['a'] >= 3]


def wipe(nw, nt, i, L, R):
    T = nt[i] >= 3; S = T & (nw[i] > .6 * np.maximum(nt[i], 1))
    best, ct, cs = -1, 0, 0
    for x in range(L, R + 1):
        if T[x]:
            ct += 1; cs += S[x]
            if S[x] and cs >= .75 * ct: best = x
    return best


if __name__ == '__main__':
    rows, nw, nt = measure(sys.argv[1])
    G = group(rows, nt)[CREDITS:]
    assert len(G) == len(LY), (len(G), len(LY))
    res = []
    for k, (l, txt) in enumerate(zip(G, LY)):
        chars = txt.replace(' ', ''); n = len(chars); nsp = txt.count(' ')
        sp = (l['R'] - l['L'] + 4 - n * ADV) / nsp if nsp else 0
        xs, x = [], l['L'] - 2
        for c in txt:
            if c == ' ': x += sp; continue
            xs.append(x); x += ADV
        W_ = [(i, wipe(nw, nt, i, l['L'], l['R'])) for i in range(l['a'], l['b'] + 1)]
        starts = []
        for x0 in xs:
            s = next((i for i, w in W_ if w >= x0 + .2 * ADV), None)
            if s is not None and s == W_[0][0]: s = None          # 滚到位时已经亮了
            starts.append(s / FPS if s is not None else None)
        res.append(dict(k=k, text=chars, arrive=l['a'] / FPS, leave=l['b'] / FPS, starts=starts))
        print(f"{k:2d} {l['a'] / FPS:7.2f} {txt}")
    json.dump(res, open('kara_chars.json', 'w', encoding='utf-8'), ensure_ascii=False)
