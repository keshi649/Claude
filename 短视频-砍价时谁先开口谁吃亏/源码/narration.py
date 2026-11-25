"""《砍价时，谁先开口谁吃亏？》旁白稿 + 对话框台词 + 时间轴。

旁白有配音（CosyVoice 3 合成，见 narrate_cosy.py），字幕按配音的逐字时间一段段出现。
角色台词出在游戏对话框里，不配音，只有打字音。有音效和环境声，没有配乐。

用法：python3 narration.py      读 voice_cv3/ 里的配音（先运行 narrate_cosy.py 合成），写出 timeline.js / timeline.json

每一幕：(幕名, 开场留白秒数, [条目…], 收尾留白秒数)
条目：
  ('N', 编号, 句前停顿, 旁白[, 选项])   旁白：'|' 把一句切成几段字幕，'/' 把一段字幕排成两行，{…} 是高亮，'^' 是时间标记点（画面用它对齐动作）
                                       选项 {'nocap': True}：这句不出字幕（画面上有盖章之类代替）
  ('D', 编号, 句前停顿, 说话人, 台词)   游戏对话框：逐字打出（每秒 18 个字）+ 停留 0.45 秒
字幕里的数字写成阿拉伯数字，念的时候写成汉字（narrate_cosy.py 的 SAY）。
"""
import json
import os
import re
import subprocess
from difflib import SequenceMatcher

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
VDIR = os.path.join(HERE, 'voice_cv3')
TYPE_CPS = 18.0      # 对话框每秒打出的字数
DIALOG_HOLD = 0.45   # 打完之后停留的秒数（有配音，旁白比字幕版慢，对话框就打得快一点、停得短一点）

SCENES = [
    ('hook', 0.0, [      # 开场不留白：盖章要在 3.5 秒以内
        ('N', 'h1', 0, '砍价时，|谁先开口谁吃亏？'),
        ('D', 'd1', .02, '你', '对，让他先报！'),
        ('N', 'h2', .02, '错，先开口的人占便宜！', {'nocap': True}),
        ('N', 'h3', .5, '科学家让人两两谈买卖：|不管是买家|还是卖家，|{谁先报价}，|成交价就偏向谁。'),
        ('N', 'h4', .45, '第一个数，|就像扔下去的{锚}：|后面怎么砍，|都绕着它转。'),
        ('N', 'h5', .45, '还有个细节：|这个数，|{别报整的}。'),
    ], 0.5),
    ('ebay', 0.6, [
        ('N', 'n1', 0, '国外的 eBay 网站|查了 1050 万件|能砍价的商品：|标价是整百的，|最后卖得便宜了|{5% 到 8%}，|不过卖得更快。'),
        ('N', 'n2', .45, '因为整数像在说：|“我急着卖，|多少都行”；|带零头的数，|像算过的：|“这个价有讲究”。'),
        ('D', 'd2', .1, '你', '那我挂 5000 的吉他……'),
        ('N', 'n3', .3, '换个零头，|比如 4870，|对方会觉得你做过功课，|{还价}就不敢砍太狠。'),
    ], 0.6),
    ('counter', 0.6, [
        ('N', 'c1', 0, '要是对方先开口呢？|别顺着他的数砍，|先想想|{你心里的价}，|再报你自己的。'),
    ], 0.5),
    ('guide', 0.6, [
        ('N', 'g1', 0, '砍价、卖二手、谈工资：'),
        ('N', 'g2', .45, '{做过功课}，|你就先开口；'),
        ('N', 'g3', .45, '报个{带零头的数}；'),
        ('N', 'g4', .45, '对方先开口，|先想{自己的目标价}。'),
    ], 1.2),     # 第三行出齐以后，整张卡要停 ≥ 3 秒
    ('end', 0.6, [
        ('D', 'd3', 0, '你', '那我先开口：这把吉他 4870！'),
        ('N', 'z1', .3, '评论区说说：|你砍价|都是谁先开口？'),
    ], 0.4),
    ('card', 0.0, [], 2.5),
]





STRIP = '，。、；：'     # 字幕段末尾去掉的标点（问号、感叹号、破折号保留）


def spoken(text):
    return re.sub(r'[|^{}/]', '', text)


def speech_span(file):
    """语音文件里真正发声的起止（秒）：超过峰值 1% 的第一个和最后一个采样"""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', file, '-ac', '1', '-ar', '24000', '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    x = np.abs(np.frombuffer(raw, np.float32))
    on = np.flatnonzero(x > x.max() * .01)
    return on[0] / 24000, on[-1] / 24000


def char_times(s, words, end):
    """s 每个字符开始发声的时间（相对语音文件开头）；标点、数字等没对上的字符取后面最近的时间"""
    t = [None] * (len(s) + 1)
    pos = 0
    for off, d, w in words:
        k = s.find(w, pos)
        if k < 0:
            continue
        for j in range(len(w)):
            t[k + j] = off + d * j / max(1, len(w))
        pos = k + len(w)
    t[len(s)] = end
    for i in range(len(s) - 1, -1, -1):
        if t[i] is None:
            t[i] = t[i + 1]
    return t


def cv3_words(s, chars):
    """配音的逐字时间 → 原文每个汉字的时间（[起点, 时长, 字]），对不上的字由 char_times 取后一个字的时间"""
    idx = [i for i, c in enumerate(s) if '一' <= c <= '鿿']
    sm = SequenceMatcher(a=[s[i] for i in idx], b=[c for c, _, _ in chars], autojunk=False)
    words = []
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            c, t0, t1 = chars[b + k]
            words.append([t0, t1 - t0, s[idx[a + k]]])
    return words


def build():
    t, scenes, lines = 0.0, [], []
    for name, lead, items, tail in SCENES:
        s0 = t
        t += lead
        for it in items:
            kind, lid, gap = it[0], it[1], it[2]
            t += gap
            if kind == 'N':
                raw = it[3]
                s = spoken(raw)
                vf = os.path.join(VDIR, 'n_' + lid)
                with open(vf + '.json', encoding='utf-8') as f:
                    chars = json.load(f)['chars']
                words = cv3_words(s, chars)
                v0, v1 = speech_span(vf + '.wav')
                v0, v1 = min(v0, chars[0][1]), max(v1, chars[-1][2])
                ct = char_times(s, words, v1)
                chunks, marks, k = [], [], 0
                for part in raw.split('|'):
                    k0 = k
                    for ch in part:
                        if ch == '^':
                            marks.append(round(t + ct[k] - v0, 3))
                        elif ch not in '{}/':
                            k += 1
                    chunks.append([round(t + ct[k0] - v0, 3), part.replace('^', '').rstrip(STRIP)])
                opt = it[4] if len(it) > 4 else {}
                lines.append(dict(id=lid, kind='N', scene=name, t0=round(t, 3), t1=round(t + v1 - v0, 3),
                                  text=re.sub(r'([\u4e00-\u9fff])(\d)', r'\1 \2', re.sub(r'[{}|^/]', '', raw)), chunks=[] if opt.get('nocap') else chunks, marks=marks,
                                  audio=os.path.relpath(vf + '.wav', HERE), a0=round(v0, 3)))
                t += v1 - v0
            else:
                n = len(it[4])
                lines.append(dict(id=lid, kind='D', scene=name, who=it[3], text=it[4], t0=round(t, 3),
                                  typed=round(t + n / TYPE_CPS, 3), t1=round(t + n / TYPE_CPS + DIALOG_HOLD, 3)))
                t += n / TYPE_CPS + DIALOG_HOLD
        t += tail
        scenes.append(dict(name=name, t0=round(s0, 3), t1=round(t, 3)))
    data = dict(duration=round(t, 2), scenes=scenes, lines=lines)
    with open(os.path.join(HERE, 'timeline.json'), 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    with open(os.path.join(HERE, 'timeline.js'), 'w', encoding='utf-8') as f:
        f.write('// 由 narration.py 生成：每幕、每句旁白与对话框的起止时间（秒）和字幕分段。请勿手改。\n')
        f.write('window.TIMELINE = ' + json.dumps(data, ensure_ascii=False) + ';\n')
    for s in scenes:
        print(f"{s['name']:>9} {s['t0']:7.2f} → {s['t1']:7.2f}")
    print('总时长', data['duration'])


if __name__ == '__main__':
    build()
