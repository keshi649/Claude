"""《原始人为什么不怕久坐？》旁白稿（进化错配系列） + 对话框台词 + 时间轴。

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
        ('N', 'h1', 0, '原始人为什么不怕{久坐}？'),
        ('D', 'd1', .02, '你', '天天打猎，哪坐得住！'),
        ('N', 'h2', .02, '也歇 10 个小时！', {'nocap': True}),
        ('N', 'h3', .5, '科学家给哈扎人|腿上绑了传感器：|他们一天不走动|将近 {10 小时}，|跟你坐着的差不多。'),
        ('N', 'h4', .5, '可他们很少“坐出病”：|血脂、血糖|都很{健康}。'),
        ('N', 'h5', .3, '秘密，|就在你{屁股底下}。'),
    ], 0.5),
    ('rest', 0.6, [
        ('N', 's1', 0, '哈扎人没有椅子：|歇着的时候，|不少时间是{蹲着、跪着}。'),
        ('N', 's2', .3, '蹲着时，|腿上的肌肉|还在{上班}；'),
        ('N', 's3', .5, '可你往椅子上一靠，|腿上的肌肉|几乎全{下班}了。'),
        ('D', 'd2', .1, '你', '原来我一坐下，腿就下班了？'),
    ], 0.4),
    ('jam', 0.6, [
        ('N', 'n1', 0, '腿上的肌肉，|是你身体里的{用糖大户}；'),
        ('N', 'n2', .7, '它一下班，|饭后的糖|就在血里{堵车}。'),
        ('N', 'n3', .55, '实验里，|每坐 20 分钟，|起来慢走 2 分钟，|饭后血糖|少涨了{约四分之一}。'),
    ], 0.5),
    ('mismatch', 0.6, [
        ('N', 'm1', 0, '椅子、沙发、汽车座椅，|让你的腿|{一下班就是一整天}。'),
        ('N', 'm2', .55, '而哈扎人除了歇着，|每天还要快走、干活|{一个多小时}。'),
        ('N', 'm3', .55, '一项 100 万人的研究：|每天动够 1 小时，|久坐多出来的风险，|基本就{抵消}了。'),
    ], 0.5),
    ('guide', 0.6, [
        ('N', 'g1', 0, '别让腿下班的三个小办法：'),
        ('N', 'g2', .45, '每坐 20 分钟，|起来{走 2 分钟}；'),
        ('N', 'g3', .45, '坐着的时候，|{脚跟抬一抬}，|小腿就在上班；'),
        ('N', 'g4', .45, '每天快走、爬楼，|攒够 {1 小时}。'),
    ], 0.6),
    ('end', 0.6, [
        ('D', 'd3', 0, '你', '原来不是坐太久，是瘫太久！'),
        ('N', 'z1', .3, '原始人也爱歇着；|只是他们的腿，|从来不会{下班一整天}。'),
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
