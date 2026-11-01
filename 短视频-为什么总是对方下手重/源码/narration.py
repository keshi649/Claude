"""《为什么总是对方下手重？》旁白稿 + 对话框台词 + 时间轴。

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
    ('hook', 0.3, [
        ('N', 'h1', 0, '为什么总是|{对方下手重}？'),
        ('D', 'd1', .02, '你', '他就是下手重啊！'),
        ('N', 'h2', .02, '你还手更重！', {'nocap': True}),
        ('N', 'h3', .5, '科学家让两个人|轮流按对方的手指，|要求“{按得一样重}”。'),
        ('N', 'h4', .5, '结果平均每一轮，|都比上一轮|重了{近四成}，|越按越狠。'),
        ('N', 'h5', .45, '可两个人都以为：|我是{照着按的}！'),
        ('D', 'd2', .1, '你', '那怎么会越按越重？'),
        ('N', 'h6', .3, '答案，|跟你{挠自己不痒}，|是同一个。'),
    ], 0.5),
    ('tickle', 0.6, [
        ('N', 't1', 0, '你挠自己时，|大脑会提前算好|这一下{摸到哪里}，|然后给它{静音}。'),
        ('N', 't2', .3, '别人挠你，|大脑没法提前算，|就{音量全开}。'),
        ('N', 't3', .45, '实验里，|你左手摇一个把手，|机器人照着这个动作|挠你的右手心：|{不怎么痒}。'),
        ('N', 't4', .3, '可科学家偷偷|让机器人{慢了 0.2 秒}：'),
        ('N', 't5', .3, '大多数人根本没察觉，|却觉得{痒多了}，|跟别人挠的差不多。'),
        ('D', 'd3', .1, '你', '我的大脑这么好骗？'),
    ], 0.4),
    ('back', 0.6, [
        ('N', 'b1', 0, '打闹也一样：|你按出去的力，|大脑给它静音了|{差不多一半}。'),
        ('N', 'b2', .45, '你觉得按得一样重，|其实{重了一截}；|对方也这样，|就{越打越重}。'),
        ('D', 'd4', .1, '你', '所以每次都是他先下狠手！'),
        ('N', 'b3', .3, '他，|{也是这么想你的}。'),
    ], 0.5),
    ('guide', 0.6, [
        ('N', 'g1', 0, '大脑静音键的使用说明：'),
        ('N', 'g2', .45, '怕痒，|就把手{搭在对方手上}，|让大脑以为|是你自己在动；'),
        ('N', 'g3', .45, '打闹还手，|只用你觉得的{一半力}；'),
        ('N', 'g4', .45, '觉得对方下手重，|先想想：|{你可能也一样}。'),
    ], 0.6),
    ('end', 0.6, [
        ('D', 'd5', 0, '你', '我的“轻轻一下”不轻啊！'),
        ('N', 'z1', .3, '小时候跟同桌打闹，|都说{对方下手重}：|其实，|你俩可能{都没撒谎}。'),
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
