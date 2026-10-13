"""《原始人为什么不蛀牙？》旁白稿 + 对话框台词 + 时间轴。

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
    ('hook', 0.05, [
        ('N', 'h1', 0, '原始人为什么{不蛀牙}？'),
        ('D', 'd1', .1, '你', '因为他们没糖吃呗！'),
        ('N', 'h2', .05, '只对一半！', {'nocap': True}),
        ('N', 'h3', .35, '考古学家统计过：|原始人的牙，|每 100 颗里，|蛀的{不到 2 颗}；'),
        ('N', 'h4', .25, '种地以后，|涨到了 {10 颗上下}。'),
        ('N', 'h5', .3, '另一半答案，|藏在你手里|这杯奶茶的{喝法}里。'),
    ], 0.5),
    ('body', 0.8, [
        ('N', 's1', 0, '你的牙，|每天都在被{拆}，|也每天都在被{补}。'),
        ('N', 's2', .3, '拆牙的，|是嘴里的{细菌}：|你一吃甜的，|它们也开饭，|吃完吐出{酸}，|把牙溶掉一点点。'),
        ('D', 'd2', .1, '蛀牙菌', '有糖！开饭啦！'),
        ('N', 's3', .3, '补牙的，|是你的{口水}：|它先把酸冲淡，|再把{钙}一点点补回去。'),
        ('D', 'd3', .1, '口水修理工', '酸退了，我才能开工！'),
        ('N', 's4', .3, '可每吃一回甜的，|酸要闹上{半小时左右}，|口水才补得上。'),
        ('N', 's5', .3, '{蛀牙}，|就是拆得比补得{快}。'),
    ], 0.5),
    ('ancient', 0.9, [
        ('N', 'a1', 0, '原始人很少碰上甜的：|野果要等季节，|蜂蜜要爬树去掏；|碰上了，|就{一次吃完}。'),
        ('D', 'd4', .1, '原始人', '一口气吃完，舒坦！'),
        ('N', 'a2', .3, '一天里大部分时间，|嘴里没有糖，|口水有{大把时间}补牙。'),
    ], 0.5),
    ('modern', 0.9, [
        ('N', 'm1', 0, '你呢？|早饭、零食、奶茶、|饮料、夜宵，|一天能来{好几回}。'),
        ('N', 'm2', .35, '考考你：|同一杯奶茶，|糖一样多，|20 分钟喝完，|和一下午小口抿，|哪个更伤牙？'),
        ('D', 'd5', .1, '你', '慢慢喝……不是更好吗？'),
        ('N', 'm3', .3, '答案是{慢慢抿}。|20 分钟喝完，|牙泡在酸里|{1 个钟头}左右；|抿一下午，|就泡了{一下午}。'),
        ('D', 'd6', .1, '口水修理工', '一直有酸，根本没法开工！'),
    ], 0.5),
    ('mismatch', 0.6, [
        ('N', 'x1', 0, '这就是{进化错配}：|你的口水，|还按原始人的节奏补牙，|可你的嘴里，|隔一会儿就来一回{甜的}。'),
    ], 0.5),
    ('guide', 0.6, [
        ('N', 'g1', 0, '所以护牙最要紧的，|不只是少吃糖，|更是{少吃几回}：'),
        ('N', 'g2', .3, '甜的{集中吃}，|跟着饭一起吃完，|别一下午抿；'),
        ('N', 'g3', .25, '吃完，|喝几口{清水}；'),
        ('N', 'g4', .25, '早晚用{含氟牙膏}刷牙；'),
        ('N', 'g5', .3, '牙疼、有洞，|就去看牙医。'),
    ], 0.6),
    ('end', 0.7, [
        ('D', 'd7', 0, '你', '一口气喝完，再来口清水！'),
        ('N', 'z1', .3, '伤你牙的，|不只是那杯奶茶，|还有{那一下午}。'),
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
