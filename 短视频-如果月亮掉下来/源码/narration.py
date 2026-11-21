"""《如果月亮掉下来》（"如果……会怎样"系列第 1 集）旁白稿 + 时间轴。

旁白有配音（CosyVoice 3 合成，见 narrate_cosy.py），字幕按配音的逐字时间一段段出现。
开头那句"它会越变越大？"是替观众说出的常见答案：屏幕上打出来，不配音（照以前对话框的做法）。
有音效和环境声，没有配乐。画面是电影感的三维着色器（js/），每个镜头跟着这里的时间走。

用法：python3 narration.py      读 voice_cv3/ 里的配音（先运行 narrate_cosy.py 合成），写出 timeline.js / timeline.json

每一幕：(幕名, 开场留白秒数, [条目…], 收尾留白秒数)
条目：
  ('N', 编号, 句前停顿, 旁白[, 选项])   旁白：'|' 把一句切成几段字幕，'/' 把一段字幕排成两行，{…} 是高亮，'^' 是时间标记点（画面用它对齐动作）
                                       选项 {'nocap': True}：这句不出字幕（画面上有大字代替）
  ('D', 编号, 句前停顿, 说话人, 台词)   屏幕上逐字打出的一句话（每秒 18 个字）+ 停留 0.45 秒，不配音
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
    # 开头：海上升起一个巨大的月亮，片名；屏幕上打出常见答案，旁白当场推翻
    ('hook', 0.12, [
        ('N', 'h1', 0, '如果月亮掉下来，'),
        ('D', 'd1', .12, '你', '它会越变越大？'),
        ('N', 'h2', .1, '不。你最先发现的，|^是海。', {'nocap': True}),      # ^："是海"开口的时刻，画面在这里切到浪
    ], 0.25),
    # 潮水：浪拍上来，海边的城市，潮汐力随距离的三次方变
    ('tide', 0.15, [
        ('N', 't1', 0, '月亮一靠近，|潮水就{越涨越高}。'),
        ('N', 't2', .3, '距离近一半，|它看上去只大一倍，|拉海水的力气|却是{8 倍}。'),
        ('N', 't3', .3, '海边的街道，|一天要被淹两回。'),
    ], 0.3),
    # 太空里俯看：月亮一圈圈往里绕
    ('orbit', 0.3, [
        ('N', 'o1', 0, '它一圈圈往里绕，|越来越近——'),
        ('N', 'o2', .3, '可它，|永远砸不到你头上。'),
    ], 0.25),
    # 洛希极限：月亮被扯长、裂开、碎掉
    ('break', 0.2, [
        ('N', 'r1', 0, '离地球大约 {1.8 万公里}，|不到现在的二十分之一，'),
        ('N', 'r2', .25, '地球拉它近的一面，|比拉远的一面狠得多，'),
        ('N', 'r3', .6, '月亮会被{活活扯碎}。'),
        ('N', 'r4', .7, '这条线叫{洛希极限}，|《流浪地球》里|差点撕碎地球的，|就是它。'),
    ], 0.3),
    # 碎块散开，地球有了光环（太空里看）
    ('ring', 0.25, [
        ('N', 'g1', 0, '碎块散开，|绕着地球铺成一圈——|地球有了{光环}。'),
    ], 0.8),
    # 地上看：光环横跨夜空，流星雨
    ('night', 0.2, [
        ('N', 'n1', 0, '那时你抬头，|会看到一道光环|横跨整个夜空，'),
        ('N', 'n2', .3, '碎块一点点落下来，|夜夜都是{流星雨}。'),
    ], 0.4),
    # 火星和火卫一：这事真的在发生
    ('mars', 0.3, [
        ('N', 'm1', 0, '这不全是想象：|火星的卫星{火卫一}，|正在一圈圈往里绕，'),
        ('N', 'm2', .3, '几千万年后，|它会碎成火星的光环。'),
    ], 0.4),
    # 反转：真实的月亮在离开
    ('twist', 0.3, [
        ('N', 'w1', 0, '那我们的月亮呢？|它正在{离开}。'),
        ('N', 'w2', .3, '每年远 {3.8 厘米}，|跟你指甲长得差不多快。'),
        ('N', 'w3', .3, '以后的月亮，|只会越来越远。'),
    ], 0.3),
    # 收藏卡 + 评论
    ('card', 0.25, [
        ('N', 'z1', 0, '今晚出门，|抬头看看它。'),
        ('N', 'z2', .35, '要月亮，还是要光环？|评论区站个队。'),
    ], 0.4),
    ('end', 0.0, [], 2.5),
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
