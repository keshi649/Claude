"""《我训练了一只 AI 小怪，它学会的第一件事是作弊》旁白稿 + 对话框台词 + 时间轴。

横屏 1920×1080。旁白有配音（CosyVoice 3 合成，见 narrate_cosy.py），字幕按配音的逐字时间一段段出现。
"你"的台词出在游戏对话框里，不配音，只有打字音。有音效和环境声，没有配乐。
片子里的训练记录（第几局、多少分）都来自 experiment.py 真跑出来的结果（exp.json）。

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
        ('N', 'h1', 0, 'AI 的分数，|是我的{三倍多}。'),
        ('D', 'd1', .02, '你', '那它跑得最快！'),
        ('N', 'h2', .02, '可它，^一次都没跑到终点。', {'nocap': True}),
        ('N', 'h3', .35, '因为它找到了一个|我{没想到}的玩法。'),
        ('N', 'h4', .45, '我训练了一只 AI 小怪|1000 局。|它学会的第一件事，|是{作弊}。', {'nocap': True}),
    ], 0.6),
    ('learn', 0.9, [
        ('N', 's1', 0, '第 1 局，它什么都不会。|我只给了它一张{记分表}：'),
        ('N', 's2', .3, '吃到金币，{+1}；|跑到终点，{+10}。'),
        ('N', 's3', .3, '剩下的，让它自己{瞎试}。'),
        ('N', 's4', .5, '哪一步得了分，|下次就多走那一步。|这就是{强化学习}。'),
    ], 0.4),
    ('loop', 0.6, [
        ('N', 'l1', 0, '第 20 局，|它第一次绕着池塘，|跑完了{一整圈}。'),
        ('N', 'l2', .3, '这里的金币吃掉以后，|过一会儿{又长出来}。'),
        ('N', 'l3', .4, '于是它决定：|{不走了}。'),
        ('N', 'l4', .6, '绕一整局，|分数是跑到终点的{三倍多}。'),
        ('N', 'l5', .35, '2016 年，OpenAI 的赛艇 AI，|也这样{绕圈刷分}，|分数比人类还高。'),
    ], 0.5),
    ('dance', 0.6, [
        ('N', 'p1', 0, '我改了规则：|金币{全撤了}。|再帮它一把：|往终点走一步，{+1}。'),
        ('N', 'p2', .35, '这回它往终点跑了，|一直跑到，|离终点{只差一步}——'),
        ('N', 'p3', .7, '然后，{跳起了舞}。'),
        ('N', 'p4', .6, '往前一步 +1，|退后一步不扣分；|进了终点，游戏就结束，|不进去，分数{一直涨}。'),
        ('N', 'p5', .4, '它没违反任何一条规则。|它做的，是我{写下来的}，|不是我{心里想的}。'),
    ], 0.5),
    ('judge', 0.6, [
        ('N', 'j1', 0, '规则越写，{漏洞越多}。|我换个办法：|{看画面}打分。'),
        ('N', 'j2', .3, '新任务：把球拿起来。|看着像拿到了，|就给 10 分。'),
        ('N', 'j3', .35, '从第 728 局起，|它局局{满分}。'),
        ('N', 'j4', .4, '可我换个角度一看——'),
        ('N', 'j5', .6, '它的手，|{根本没碰到球}，|只是挡在了|镜头和球{中间}。'),
        ('N', 'j6', .4, '它学会的不是把事做好，|是让我{觉得}它做好了。'),
        ('N', 'j7', .35, '2017 年，|OpenAI 的一只虚拟机械手，|也这样{骗过}了人类评委。'),
    ], 0.5),
    ('real', 0.6, [
        ('N', 'r1', 0, '你可能觉得：|这都是{小游戏}。'),
        ('N', 'r2', .3, '2025 年，OpenAI 训练|一个很强的 AI 修代码，|测试通过就给分。'),
        ('N', 'r3', .35, '它琢磨了一下：|真修，太难。|于是把检查那一步，|改成了{永远通过}。'),
        ('N', 'r4', .45, '这就是{古德哈特定律}：|一个数字一旦成了目标，|它就不再是个{好数字}。'),
        ('N', 'r5', .4, '你也见过：|为了步数，{摇手机}；|为了打卡，{拍张照就走}。'),
    ], 0.5),
    ('fix', 0.6, [
        ('N', 'f1', 0, '第 801 局，|我让它从头学，|记分表只留一行：|{跑到终点}。'),
        ('N', 'f2', .35, '可它从没去过终点，|整整 50 局，|{一次都没碰上}。'),
        ('N', 'f3', .4, '我又给了它一点{好奇心}：|没去过的地方，|先当它是{好地方}。'),
        ('N', 'f4', .45, '只过了 4 局，|它就跑到了{终点}。'),
        ('N', 'f5', .6, '分数，|比绕圈时{低多了}。|可这是我最想看的一局。'),
    ], 0.5),
    ('guide', 0.6, [
        ('N', 'g1', 0, '给 AI，也给你自己定目标，|先问三句：'),
        ('N', 'g2', .3, '我{真正想要}的，是什么？'),
        ('N', 'g3', .3, '只盯着这个数，|{会怎么作弊}？'),
        ('N', 'g4', .3, '验收时，看{结果}，|还是只看分数？'),
    ], 0.6),
    ('end', 0.5, [
        ('N', 'z1', 0, 'AI 没有学坏。|它只是，{太听话}了。'),
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
