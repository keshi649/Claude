"""从用户发来的抖音歌词视频里量出每个字开唱的时刻 → kara_chars.json（给 align.py 用）。
那条视频（720×1280）下半截是滚动的歌词，正在唱的那行在第二行（y 927~951），唱到哪个字，哪个字从白变绿（卡拉 OK）。
做法：
1. 逐帧取 y 870~1020 这一条，把文字按行分块（白色、绿色的像素），记下每块的上下、左右、绿色最右到哪。
2. 先找"稳住"的帧（高亮那一行在原位、没在滚动），按文字的样子（列占用）把连着的帧归成一行；
   同样长短的两行之间靠"绿色倒回去了"来分开。前 15 行是片头的作词作曲等字幕，跳过。
3. 每一行的窗口从它滚到位那一帧开始，到下一行滚到位为止；绿色第一次进入第 i 个字的格子（字宽约 27.6 像素）的那一帧，
   就是第 i 个字开唱的时刻。滚动时刚变绿的头一两个字量不准（arrive 那一帧就已经绿了），align.py 里不用它们。
4. 最后一句"以爱之名你还愿意吗"时，歌词只剩两行，高亮行往下挪到了 y 946 左右，单独量。
文字是人看截图读出来的（LINES），和网上的歌词一致（"措不及防"照视频里的写法）。
用法：python3 kara.py 抖音视频.m4a   （写 kara_chars.json）"""
import json, subprocess, sys
import numpy as np

LINES = """这一路上走走停停 顺着少年漂流的痕迹 迈出车站的前一刻 竟有些犹豫 不禁笑这近乡情怯 仍无可避免 而长野的天 依旧那么暖 风吹起了从前
从前初识这世间 万般流连 看着天边似在眼前 也甘愿赴汤蹈火去走它一遍 如今走过这世间 万般流连 翻过岁月不同侧脸 措不及防闯入你的笑颜
我曾难自拔于世界之大 也沉溺于其中梦话 不得真假不做挣扎 不惧笑话 我曾将青春翻涌成她 也曾指尖弹出盛夏 心之所动且就随缘去吧 逆着光行走任风吹雨打
短短的路走走停停 也有了几分的距离 不知抚摸的是故事 还是段心情 也许期待的不过是 与时间为敌 再次看到你 微凉晨光里 笑得很甜蜜
从前初识这世间 万般流连 看着天边似在眼前 也甘愿赴汤蹈火去走它一遍 如今走过这世间 万般流连 翻过岁月不同侧脸 措不及防闯入你的笑颜
我曾难自拔于世界之大 也沉溺于其中梦话 不得真假不做挣扎 不惧笑话 我曾将青春翻涌成她 也曾指尖弹出盛夏 心之所动且就随缘去吧
晚风吹起你鬓间的白发 抚平回忆留下的疤 你的眼中明暗交杂 一笑生花 暮色遮住你蹒跚的步伐 走进床头藏起的画 画中的你低着头说话
我仍感叹于世界之大 也沉醉于儿时情话 不剩真假不做挣扎 无谓笑话 我终将青春还给了她 连同指尖弹出的盛夏 心之所动就随风去了 以爱之名你还愿意吗""".split()
CREDITS = 15        # 片头字幕的行数
FPS = 30

def masks(a):
    g = (a[:, :, 1] > 140) & (a[:, :, 1] - a[:, :, 0] > 35) & (a[:, :, 1] - a[:, :, 2] > 60)   # 绿：唱过的
    w = a.min(axis=2) > 165                                                                      # 白：没唱的
    return g, w

def measure(src):
    """逐帧：① 高亮行这一条（y 914~962）的统计；② y 870~1020 里按行分的块"""
    W_, Y0, H_ = 720, 870, 150
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-an', '-vf', f'crop={W_}:{H_}:0:{Y0}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    stats, blocks = [], []
    while True:
        b = p.stdout.read(W_ * H_ * 3)
        if len(b) < W_ * H_ * 3: break
        a = np.frombuffer(b, np.uint8).reshape(H_, W_, 3).astype(np.int16)
        g, w = masks(a); t = g | w
        # ① 高亮那一条
        tb, gb = t[44:92], g[44:92]
        n = int(tb.sum()); rows = tb.sum(axis=1); ys = np.nonzero(rows > 0)[0]
        cy = float((rows * np.arange(48)).sum() / max(n, 1))
        col = tb.any(axis=0); xs = np.nonzero(col)[0]; xg = np.nonzero(gb.any(axis=0))[0]
        stats.append(dict(n=n, cy=cy, top=int(ys.min()) if len(ys) else -1, bot=int(ys.max()) if len(ys) else -1,
                          L=int(xs.min()) if len(xs) else -1, R=int(xs.max()) if len(xs) else -1, gR=int(xg.max()) if len(xg) else -1,
                          occ=np.packbits(col.reshape(-1, 4).any(axis=1))))
        # ② 分块
        rows = t.sum(axis=1) > 0; fb = []; y = 0
        while y < H_:
            if rows[y]:
                y1 = y
                while y1 + 1 < H_ and (rows[y1 + 1] or (y1 + 3 < H_ and rows[y1 + 2:y1 + 4].any())): y1 += 1
                sub, sg = t[y:y1 + 1], g[y:y1 + 1]
                xs = np.nonzero(sub.any(axis=0))[0]; xg = np.nonzero(sg.any(axis=0))[0]
                if sub.sum() > 40: fb.append((y + Y0, y1 + Y0, int(xs.min()), int(xs.max()), int(xg.max()) if len(xg) else -1))
                y = y1 + 1
            else: y += 1
        blocks.append(fb)
    return stats, blocks

def group_lines(stats):
    """稳住的帧按文字的样子归成一行一行（和第一遍手工核对时用的规则一样）"""
    steady = [i for i, f in enumerate(stats) if f['n'] > 150 and ((abs(f['cy'] - 25) < 2.6 and f['top'] >= 8 and f['bot'] <= 41) or (abs(f['cy'] - 41) < 1.6 and f['top'] >= 33))]
    lines = []
    for i in steady:
        f = stats[i]; b = np.unpackbits(f['occ']).astype(bool)
        if lines:
            l = lines[-1]
            jac = (b & l['b']).sum() / max((b | l['b']).sum(), 1)
            same = abs(f['L'] - l['L']) <= 4 and abs(f['R'] - l['R']) <= 4
            back = l['gR'] > 0 and f['gR'] >= 0 and f['gR'] < l['gR'] - 25
            newly = l['gR'] > 0 and f['gR'] < 0 and i - l['b_'] > 6
            if jac > .8 and same and not back and not newly and i - l['b_'] < 45:
                l['b_'] = i; l['n'] += 1; l['b'] = b; l['gR'] = max(l['gR'], f['gR']) if f['gR'] >= 0 else l['gR']; l['hist'].append(f['gR']); continue
        lines.append(dict(a=i, b_=i, n=1, L=f['L'], R=f['R'], b=b, gR=f['gR'], hist=[f['gR']]))
    # 合并：很短的碎片并进前一行；同长短、绿色没倒回去的相邻片段是同一行
    groups = []
    for l in lines:
        if l['n'] < 5 and groups: groups[-1]['b'] = l['b_']; continue
        h = [x for x in l['hist'] if x >= 0]
        if groups:
            gg = groups[-1]
            if abs(l['L'] - gg['L']) <= 5 and abs(l['R'] - gg['R']) <= 7 and h and h[0] >= gg['gR_end'] - 12 and l['a'] - gg['b'] < 30:
                gg['b'] = l['b_']; gg['gR_end'] = max(gg['gR_end'], max(h)); continue
        groups.append(dict(a=l['a'], b=l['b_'], L=l['L'], R=l['R'], gR_end=max(h) if h else -1))
    return groups

def char_times(groups, blocks):
    G = groups[CREDITS:]
    assert len(G) == len(LINES), (len(G), len(LINES))
    inrow = [any(922 <= y0 <= 932 and 946 <= y1 <= 957 for y0, y1, *_ in fb) for fb in blocks]
    res = []
    for k, (g, txt) in enumerate(zip(G, LINES)):
        N = len(txt); L, R = g['L'], g['R']; last = k == len(G) - 1
        if last: L, R = 242, 486                         # 最后一句：高亮行挪到了下面
        adv = (R - L + 3) / N
        f = g['a'] + 5
        while inrow[f] and not last: f -= 1
        a = f + 1 if not last else g['a'] - 20
        b = G[k + 1]['a'] if k + 1 < len(G) else min(len(blocks), a + 300)
        rowy = (940, 952) if last else (922, 932)
        series = [(i, bl[4]) for i in range(a, b) for bl in blocks[i][:] if rowy[0] <= bl[0] <= rowy[1] and abs(bl[2] - L) <= 4 and abs(bl[3] - R) <= (6 if last else 8)]
        if last: a = series[0][0]
        starts = [next((i for i, gr in series if gr >= L + c * adv + 1.5), None) for c in range(N)]
        endf = next((i for i, gr in series if gr >= R - 1), None)
        res.append(dict(k=k, text=txt, L=L, R=R, adv=round(adv, 2), arrive=a / FPS,
                        starts=[s / FPS if s is not None else None for s in starts], end=endf / FPS if endf else None))
    return res

if __name__ == '__main__':
    stats, blocks = measure(sys.argv[1])
    groups = group_lines(stats)
    res = char_times(groups, blocks)
    json.dump(res, open('kara_chars.json', 'w', encoding='utf-8'), ensure_ascii=False)
    for r in res: print(f"{r['k']:2d} {r['arrive']:7.2f} {r['text']}")
    print('lines', len(res))
