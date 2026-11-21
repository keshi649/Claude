"""《如果太阳变成黑洞》（"如果……会怎样"系列第 2 集）旁白稿 + 时间轴。

旁白有配音（CosyVoice 3 合成，见 narrate_cosy.py），字幕按配音的逐字时间一段段出现。
开头的常见答案"地球会被吸进去吗？"由旁白问出来，"不会。"当场推翻（这句不出字幕，画面上打大字）。
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
    # 开头：太阳缩成黑洞（背后的星光被弯成一圈），片名；旁白问出常见答案，当场推翻；倒计时出现
    ('hook', 0.12, [
        ('N', 'h1', 0, '太阳变成黑洞，|地球会被吸进去吗？'),
        ('N', 'h2', .15, '不会。|地球照样绕着它转。', {'nocap': True}),     # 画面打大字"不会。"
        ('N', 'h3', .2, '可你只剩|{8 分 20 秒}的阳光。'),
    ], 0.2),
    # 白天的海边：太阳照样亮着（倒计时快进）
    ('light', 0.1, [
        ('N', 'l1', 0, '这时你抬头，|太阳还好好地亮着——'),
    ], 0.15),
    # 上帝视角：最后一束光往外跑，后面跟着黑暗，水星、金星先后变黑，下一个是地球
    ('front', 0.2, [
        ('N', 'f1', 0, '它最后发出的光，|还在路上，'),
        ('N', 'f2', .2, '黑暗就跟在后面：|水星黑了，|金星黑了，'),
        ('N', 'f3', .25, '下一个，|就是地球。'),
    ], 0.1),
    # 最后三秒：海边，倒计时 3、2、1（只有滴答声）
    ('zero', 0.0, [], 2.7),
    # 天黑：白天一下子全黑；月亮多亮了一两秒（它反射的光还在路上），然后也灭了；星星出来
    ('dark', 0.55, [
        ('N', 'k1', 0, '天，|一下子全黑了。'),
        ('N', 'k2', .25, '连月亮也^{灭了}——|月光，|本来就是太阳光。'),
        ('N', 'k3', .3, '原来白天，|也有满天的星星。'),
    ], 0.3),
    # 变冷：海面结冰，温度计往下掉
    ('cold', 0.25, [
        ('N', 'c1', 0, '一个星期，|气温跌到{零下 18 度}；'),
        ('N', 'c2', .4, '一年后，|{零下 73 度}。'),        # 句前停顿长一点：冰裂的声音放在这里
    ], 0.3),
    # 深海热泉：冰壳下面，生命还在
    ('vent', 0.25, [
        ('N', 'v1', 0, '冰壳下面，|深海热泉边的生命|还活着——'),
        ('N', 'v2', .2, '它们本来|就不靠阳光。'),
    ], 0.35),
    # 反转：真实的太阳太轻，变不成黑洞
    ('twist', 0.25, [
        ('N', 'w1', 0, '好在，|真实的太阳太轻了，|变不成黑洞。'),
    ], 0.35),
    # 日出 + 收藏卡 + 评论
    ('card', 0.25, [
        ('N', 'z1', 0, '如果只剩 {8 分 20 秒}的阳光，|你想去哪儿？|评论区告诉我。'),
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
