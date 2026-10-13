"""《味道是舌头尝的，还是鼻子闻的？》旁白稿 + 对话框台词 + 时间轴。

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
        ('N', 'h1', 0, '草莓味，|是舌头{尝}出来的？'),
        ('D', 'd1', .02, '你', '当然是舌头！'),
        ('N', 'h2', .02, '是鼻子！', {'nocap': True}),
        ('N', 'h3', .35, '不信你捏住鼻子，|吃一颗草莓糖：|只尝得出{甜}，|尝不出{草莓味}。'),
        ('N', 'h4', .3, '一松手，|草莓味才{冒}出来。'),
        ('N', 'h5', .3, '因为鼻子有{两扇门}，|你只知道其中一扇。'),
    ], 0.5),
    ('body', 0.6, [
        ('N', 's1', 0, '舌头其实只尝得出|{五种}味道：|酸、甜、苦、咸、鲜。'),
        ('N', 's2', .3, '草莓味、咖啡味、|巧克力味……|舌头{一个都不认识}，|全靠鼻子。'),
        ('N', 's3', .3, '舌头像一盒|只有{五种颜色}的颜料；|鼻子里有约 {400 种}|气味受体，|调得出千百种味道。'),
    ], 0.4),
    ('nose', 0.6, [
        ('N', 's4', 0, '鼻子的前门，|是你吸气闻香的{鼻孔}；|后门藏在|{嗓子眼}上面。'),
        ('N', 's5', .3, '你一嚼、一咽，|香气就从嘴里往上，|{走后门}钻进鼻子。'),
        ('N', 's6', .3, '可大脑把这股香气，|{记在了舌头头上}，|你就以为是尝出来的。'),
        ('D', 'd2', .1, '你', '原来鼻子干活，舌头领功！'),
        ('N', 'n1', .35, '所以感冒鼻塞时，|吃什么都{没味}：|舌头好好的，|是后门{堵}了。'),
    ], 0.5),
    ('trick', 0.6, [
        ('N', 'n2', 0, '反过来，|香气还能{骗}过舌头。'),
        ('N', 'n3', .3, '实验里，|同样的糖水，|闻着{草莓香}，喝着更甜；|同样淡的盐水，|闻着{酱油香}，喝着更咸。'),
        ('N', 'n4', .35, '所以想少放糖、少放盐，|可以{多放点香}。'),
    ], 0.5),
    ('guide', 0.6, [
        ('N', 'g1', 0, '吃得更香的三个小办法：'),
        ('N', 'g2', .25, '{慢慢嚼}，|给香气留时间走后门；'),
        ('N', 'g3', .25, '少糖少盐，|用{香料}来补；'),
        ('N', 'g4', .3, '感冒吃不出味，|{别猛加盐}，|舌头没坏。'),
    ], 0.6),
    ('end', 0.6, [
        ('D', 'd3', 0, '你', '原来我一直在用鼻子吃饭！'),
        ('N', 'z1', .3, '舌头只管酸甜苦咸鲜，|剩下的千百种味道，|是鼻子{替你尝的}。'),
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
