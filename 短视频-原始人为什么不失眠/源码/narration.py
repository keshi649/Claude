"""《原始人为什么不失眠？》旁白稿 + 对话框台词 + 时间轴。

本片的字幕就是旁白，但旁白不配音：画面里只显示旁白字幕，声音只有音效和环境声，没有配乐。
为了让字幕按"说话"的节奏走（自己配旁白也对得上），每句旁白先用语音合成试读一遍，
只拿它的逐词时间来排字幕，合成的声音不进成片。角色台词出在游戏对话框里，不配音，只有打字音（和第一集一样）。

用法：python3 narration.py            合成缺失或改过的试读（缓存在 voice/），写出 timeline.js / timeline.json
      python3 narration.py --force    全部重新合成
      python3 narration.py --voice cv3   旁白配音版：时间轴按 narrate_cosy.py 合成的配音（voice_cv3/）来排

每一幕：(幕名, 开场留白秒数, [条目…], 收尾留白秒数)
条目：
  ('N', 编号, 句前停顿, 旁白[, 选项])   旁白：'|' 把一句切成几段字幕，'/' 把一段字幕排成两行，{…} 是高亮，'^' 是时间标记点（画面用它对齐动作）
                                       选项 {'nocap': True}：这句不出字幕（画面上有盖章之类代替）
  ('D', 编号, 句前停顿, 说话人, 台词)   游戏对话框：逐字打出（每秒 14 个字）+ 停留 0.75 秒
"""
import asyncio
import json
import os
import re
import ssl
import subprocess
import sys
from difflib import SequenceMatcher

import numpy as np
import edge_tts
import edge_tts.communicate as _comm

# 云端环境的出站 HTTPS 走代理，需要信任代理的 CA；本地运行时文件不存在就用默认
_CA = '/root/.ccr/ca-bundle.crt'
if os.path.exists(_CA):
    _comm._SSL_CTX = ssl.create_default_context(cafile=_CA)

HERE = os.path.dirname(os.path.abspath(__file__))
VDIR = os.path.join(HERE, 'voice')
NARRATOR = dict(voice='zh-CN-YunxiNeural', rate='+10%', pitch='+0Hz')      # 只用来给字幕计时，不进成片（语速和第一集旁白一样）
TYPE_CPS = 14.0      # 对话框每秒打出的字数
DIALOG_HOLD = 0.75   # 打完之后停留的秒数
GAP = 0.3

SCENES = [
    ('hook', 0.2, [
        ('N', 'h1', 0, '原始人为什么{不失眠}？'),
        ('D', 'd1', .15, '你', '天一黑就睡，一睡十个钟头呗！'),
        ('N', 'h2', .05, '全错。', {'nocap': True}),
        ('N', 'h3', .35, '科学家给非洲和南美的|三个部落戴上手环：|他们天黑 {3 个多小时}才睡，|一晚只睡 {6 个多小时}。'),
        ('N', 'h4', .3, '可他们几乎不失眠：|常失眠的只有 {2% 左右}，|有两个部落的话里，|连"失眠"这个词都{没有}。'),
        ('D', 'd2', .2, '部落老人', '失眠？那是什么？'),
        ('N', 'h5', .3, '他们的秘密，|藏在这根——'),
        ('N', 'h6', .25, '{温度计}里。'),
    ], 0.5),
    ('body', 0.8, [
        ('N', 's1', 0, '这事跟你有关：|在中国，|大约{每 7 个人}|就有 1 个失眠，|年轻人更多。'),
        ('N', 's2', .35, '因为你身上有个{睡眠开关}，|它认一个信号：|体温{往下掉}。'),
        ('D', 'd3', .25, '睡眠开关', '体温没降下来，不许关机！'),
        ('N', 's3', .35, '体温要降，|就得散热；|散热口在哪儿？|{手和脚}。'),
        ('N', 's4', .3, '手脚的血管一张开，|热量散出去，|体温一降，|人就{困}了。'),
    ], 0.5),
    ('ancient', 0.9, [
        ('N', 'a1', 0, '几十万年来，|大自然每晚都替你|按这个开关：|太阳一落，|气温就一路{往下掉}。'),
        ('N', 'a2', .3, '人跟着降温睡着，|在一天里{最冷}的时候醒来。'),
        ('D', 'd4', .25, '原始人', '冷醒了！干活去！'),
    ], 0.5),
    ('modern', 0.9, [
        ('N', 'm1', 0, '可如今，|墙厚了，|有暖气，|有空调，|卧室一整夜，|都是{一个温度}。'),
        ('N', 'm2', .3, '你躺下了，|开关却{等不到}那个信号。'),
        ('D', 'd5', .25, '你', '数到第三百只羊了……'),
        ('N', 'm3', .3, '研究者认为，|这可能是|城里人更容易失眠的|一个原因。'),
    ], 0.5),
    ('lab', 0.8, [
        ('N', 'l1', 0, '那怎么帮身体降温？|答案有点反直觉：|洗个{热水澡}。'),
        ('N', 'l2', .35, '研究者汇总了十几项研究：|睡前 1 到 2 小时，|洗个 40 度出头的热水澡，|平均能早 {10 分钟}睡着。'),
        ('N', 'l3', .3, '热水怎么会降温？|洗完以后，|手脚的血管全打开，|热量从散热口^{哗哗往外跑}，|体温反而^掉得更快。'),
    ], 0.5),
    ('mismatch', 0.6, [
        ('N', 'x1', 0, '这就是{进化错配}：|你的开关，|还在等大自然的降温，|可你的卧室，|一整夜都{不降温}。'),
    ], 0.5),
    ('guide', 0.6, [
        ('N', 'g1', 0, '所以攻略很简单：|帮身体{降温}。'),
        ('N', 'g2', .3, '睡前 1 到 2 小时，|洗个热水澡，|{十分钟}就够；'),
        ('N', 'g3', .25, '卧室凉一点，|被子别太厚；'),
        ('N', 'g4', .3, '要是长期睡不好，|就去看医生。'),
    ], 0.6),
    ('end', 0.7, [
        ('D', 'd6', 0, '你', '原来不是我心事太重……'),
        ('N', 'z1', .3, '你的身体，|没有坏。'),
        ('N', 'z2', .3, '它只是还在等|几十万年前那一阵，|每天夜里都会来的{凉风}。'),
    ], 0.5),
    ('card', 0.0, [], 2.5),
]
STRIP = '，。、；：'     # 字幕段末尾去掉的标点（问号、感叹号、破折号保留）


def spoken(text):
    return re.sub(r'[|^{}/]', '', text)


async def synth(path, text, v):
    com = edge_tts.Communicate(text, v['voice'], rate=v['rate'], pitch=v['pitch'], boundary='WordBoundary')
    ws = []
    with open(path + '.mp3', 'wb') as f:
        async for ch in com.stream():
            if ch['type'] == 'audio':
                f.write(ch['data'])
            elif ch['type'] == 'WordBoundary':
                ws.append([ch['offset'] / 1e7, ch['duration'] / 1e7, ch['text']])
    with open(path + '.json', 'w', encoding='utf-8') as f:
        json.dump({'text': text, 'voice': v, 'words': ws}, f, ensure_ascii=False)


def fresh(path, text, v):
    try:
        with open(path + '.json', encoding='utf-8') as f:
            m = json.load(f)
    except FileNotFoundError:
        return False
    return m['text'] == text and m['voice'] == v and os.path.exists(path + '.mp3')


def speech_span(file):
    """语音文件里真正发声的起止（秒）：超过峰值 1% 的第一个和最后一个采样"""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', file, '-ac', '1', '-ar', '24000', '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    x = np.abs(np.frombuffer(raw, np.float32))
    on = np.flatnonzero(x > x.max() * .01)
    return on[0] / 24000, on[-1] / 24000


def char_times(s, words, end):
    """s 每个字符开始发声的时间（相对语音文件开头）；标点等没对上词边界的字符取后面最近的时间"""
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
    """配音的逐字时间 → 原文每个汉字的时间（[起点, 时长, 字]），数字之类对不上的字由 char_times 取后一个字的时间"""
    idx = [i for i, c in enumerate(s) if '\u4e00' <= c <= '\u9fff']
    sm = SequenceMatcher(a=[s[i] for i in idx], b=[c for c, _, _ in chars], autojunk=False)
    words = []
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            c, t0, t1 = chars[b + k]
            words.append([t0, t1 - t0, s[idx[a + k]]])
    return words


def build(force=False, voice=None):
    os.makedirs(VDIR, exist_ok=True)
    jobs = [(os.path.join(VDIR, 'n_' + it[1]), spoken(it[3])) for _, _, items, _ in SCENES for it in items if it[0] == 'N']

    async def run():
        for path, text in jobs:
            if force or not fresh(path, text, NARRATOR):
                for attempt in range(4):
                    try:
                        await synth(path, text, NARRATOR)
                        print('试读', os.path.basename(path), text)
                        break
                    except Exception as e:      # 网络抖动时重试
                        print('  重试', attempt + 1, e)
                        await asyncio.sleep(2 ** attempt)
                else:
                    raise RuntimeError('合成失败：' + path)
    if not voice:
        asyncio.run(run())

    # 配音版：旁白念得比字幕版慢一点，对话框打字快一点、停得短一点，开头的盖章才能赶在 3.5 秒内
    cps, hold = (18.0, .45) if voice else (TYPE_CPS, DIALOG_HOLD)
    t, scenes, lines = 0.0, [], []
    for si, (name, lead, items, tail) in enumerate(SCENES):
        s0 = t
        t += .05 if voice and si == 0 else lead
        for it in items:
            kind, lid, gap = it[0], it[1], it[2]
            t += min(gap, .1) if voice and kind == 'D' else gap
            if kind == 'N':
                path = os.path.join(VDIR, 'n_' + lid)
                if not voice:
                    with open(path + '.json', encoding='utf-8') as f:
                        words = json.load(f)['words']
                raw = it[3]
                s = spoken(raw)
                extra = {}
                if voice:      # 旁白配音版：用真实配音的逐字时间
                    vf = os.path.join(HERE, 'voice_cv3', 'n_' + lid)
                    with open(vf + '.json', encoding='utf-8') as f:
                        chars = json.load(f)['chars']
                    words = cv3_words(s, chars)
                    v0, v1 = speech_span(vf + '.wav')
                    v0, v1 = min(v0, chars[0][1]), max(v1, chars[-1][2])
                    extra = dict(audio=os.path.relpath(vf + '.wav', HERE), a0=round(v0, 3))
                else:
                    v0, v1 = speech_span(path + '.mp3')
                    v0 = min(v0, words[0][0]) if words else v0
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
                                  text=re.sub(r'[{}|^/]', '', raw), chunks=[] if opt.get('nocap') else chunks, marks=marks, **extra))
                t += v1 - v0
            else:
                n = len(it[4])
                lines.append(dict(id=lid, kind='D', scene=name, who=it[3], text=it[4], t0=round(t, 3),
                                  typed=round(t + n / cps, 3), t1=round(t + n / cps + hold, 3)))
                t += n / cps + hold
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
    build(force='--force' in sys.argv, voice=sys.argv[sys.argv.index('--voice') + 1] if '--voice' in sys.argv else None)
