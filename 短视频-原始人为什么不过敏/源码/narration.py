"""《原始人为什么不过敏？》旁白稿 + 角色台词 + 时间轴。

本片的字幕就是旁白，但旁白不配音：画面里只显示旁白字幕，声音只有音效、环境声和几句角色台词。
为了让字幕按"说话"的节奏走（以后自己配旁白也对得上），每句旁白先用语音合成试读一遍，
只拿它的逐词时间来排字幕，合成的旁白声音不会混进成片。角色台词（对话气泡）才真的配音。

用法：python3 narration.py            合成缺失或改过的语音（缓存在 voice/），写出 timeline.js / timeline.json
      python3 narration.py --force    全部重新合成

每一幕：(幕名, 开场留白秒数, [条目…], 收尾留白秒数)
条目：
  ('N', 编号, 句前停顿, 旁白)    旁白：'|' 把一句切成几段字幕，{…} 是高亮，'^' 是时间标记点（画面用它对齐动作）
  ('C', 编号, 句前停顿, 角色, 台词)  角色台词：对话气泡 + 配音
"""
import asyncio
import json
import os
import re
import ssl
import subprocess
import sys

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
VOICES = {
    '保安': dict(voice='zh-CN-YunjianNeural', rate='+0%', pitch='-2Hz'),
    '花粉': dict(voice='zh-CN-XiaoyiNeural', rate='+0%', pitch='+6Hz'),
    '农民': dict(voice='zh-CN-YunxiNeural', rate='+0%', pitch='-4Hz'),
    '新兵': dict(voice='zh-CN-YunxiaNeural', rate='+10%', pitch='+0Hz'),
    '宝宝': dict(voice='zh-CN-YunxiaNeural', rate='+0%', pitch='+10Hz'),
    '医生': dict(voice='zh-CN-XiaoxiaoNeural', rate='+0%', pitch='+0Hz'),
}
GAP = 0.3

SCENES = [
    ('hook', 0.3, [
        ('N', 'h1', 0, '原始人为什么{不过敏}？'),
        ('N', 'h2', .35, '两百年前，|{花粉症}还是罕见病；'),
        ('N', 'h3', .25, '如今，中国大城市里，|大约{每 6 个成年人}|就有 1 个过敏性鼻炎。'),
        ('N', 'h4', .3, '原始人天天在草丛里打滚，|凭什么{不怕花粉}？'),
    ], 0.5),
    ('guard', 0.9, [
        ('N', 'g1', 0, '你身上有一支{保安队}：|免疫系统。'),
        ('N', 'g2', GAP, '病毒、细菌闯进来，|该打就^打。'),
        ('N', 'g3', GAP, '可花粉、尘螨、花生，|其实都是{路过的良民}。'),
        ('C', 'c1', .3, '保安', '站住！什么人？'),
        ('C', 'c2', .15, '花粉', '我……我就路过……'),
        ('N', 'g4', .3, '过敏，就是保安{认错了人}：|把良民当坏人，|拉响了^警报——'),
        ('N', 'g5', .25, '喷嚏、鼻涕、眼睛痒，|全是{警报}闹的。'),
    ], 0.5),
    ('history', 1.3, [
        ('N', 'y1', 0, '原始人没留下病历。|但一百五十年前，|英国医生发现一件{怪事}：'),
        ('N', 'y2', GAP, '花粉症偏爱{读书人}、{有钱人}；'),
        ('N', 'y3', .2, '天天跟花粉打交道的{农民}，|反而{很少得}。'),
        ('C', 'c3', .25, '农民', '花粉？天天见！'),
        ('N', 'y4', .3, '要是花粉是元凶，|最该生病的，|应该是农民才对。'),
    ], 0.5),
    ('train', 0.9, [
        ('N', 't1', 0, '答案藏在保安的{训练}里。'),
        ('N', 't2', GAP, '保安队小时候，|要靠各种微生物{陪练}：|^泥土里的、^动物身上的、|^哥哥姐姐带回家的。'),
        ('N', 't3', GAP, '见得多了，|才分得清好坏，|也学会了{不大惊小怪}。'),
        ('N', 't4', .35, '可现代孩子住楼房、|家里干干净净，|{陪练少了}——'),
        ('C', 'c4', .25, '新兵', '黄色的！肯定是坏人！'),
        ('N', 't5', .25, '保安没见过世面，|就{看谁都像坏人}。'),
    ], 0.5),
    ('amish', 0.9, [
        ('N', 'a1', 0, '这不只是猜想：|美国有两群农民，|祖先、习惯都很像。'),
        ('N', 'a2', GAP, '区别在于：|{阿米什}孩子从小泡在{牛棚}里，|{哈特派}用的是机械化大农场。'),
        ('N', 'a3', GAP, '结果，哈特派孩子的哮喘，|是阿米什的{四倍}。'),
        ('N', 'a4', GAP, '把两家的灰尘给小鼠闻：|只有阿米什家的灰尘，|{护住了}小鼠。'),
    ], 0.5),
    ('peanut', 0.9, [
        ('N', 'p1', 0, '吃的也一样。|以前的建议是：|过敏风险高的宝宝，|花生{晚点吃}。'),
        ('N', 'p2', GAP, '可花生过敏，|反而{越来越多}。'),
        ('N', 'p3', .35, '2015 年的一项试验：|600 多个高风险宝宝，|一半从小吃花生，|一半{一口不碰}。'),
        ('C', 'c5', .25, '宝宝', '还要！'),
        ('N', 'p4', .3, '到 5 岁，|不碰的那组 {17%} 过敏，|吃的那组只有 {3%}。'),
        ('N', 'p5', GAP, '{躲着}，|反而没练成。'),
    ], 0.5),
    ('mismatch', 0.8, [
        ('N', 'm1', 0, '这就是{进化错配}：'),
        ('N', 'm2', GAP, '保安队的训练计划，|是照着满地泥土、|满屋动物的世界写的；'),
        ('N', 'm3', .25, '世界变干净了，|{陪练却没了}。'),
    ], 0.5),
    ('guide', 0.9, [
        ('N', 'd1', 0, '那怎么办？|先说清楚：|不是让你{不讲卫生}，|手照样要洗。'),
        ('N', 'd2', GAP, '给宝宝加辅食，|鸡蛋、花生{不用刻意推迟}；|花生要给酱或泥，别给整粒。'),
        ('N', 'd3', .25, '湿疹严重、已经过敏的宝宝，|{先问医生}。'),
        ('N', 'd4', GAP, '已经过敏了？|找医生查清过敏原；|有的人还能做{脱敏治疗}，|给保安{补课}。'),
        ('C', 'c6', .25, '医生', '来，补课！'),
    ], 0.5),
    ('end', 0.7, [
        ('C', 'c7', 0, '保安', '路过的？请便～'),
        ('C', 'c8', .1, '花粉', '谢谢～'),
        ('N', 'e1', .35, '原始人的保安，|不是更能打，|是{见过世面}。'),
    ], 0.6),
    ('card', 0.0, [], 5.0),
]
STRIP = '，。、；：'     # 字幕段末尾去掉的标点（问号、感叹号、破折号保留）


def spoken(text):
    return re.sub(r'[|^{}]', '', text)


def tts_key(text, v):
    return {'text': text, 'voice': v}


async def synth(path, text, v, words=False):
    com = edge_tts.Communicate(text, v['voice'], rate=v['rate'], pitch=v['pitch'],
                               **({'boundary': 'WordBoundary'} if words else {}))
    ws = []
    with open(path + '.mp3', 'wb') as f:
        async for ch in com.stream():
            if ch['type'] == 'audio':
                f.write(ch['data'])
            elif ch['type'] == 'WordBoundary':
                ws.append([ch['offset'] / 1e7, ch['duration'] / 1e7, ch['text']])
    with open(path + '.json', 'w', encoding='utf-8') as f:
        json.dump(dict(tts_key(text, v), words=ws), f, ensure_ascii=False)


def fresh(path, text, v):
    try:
        with open(path + '.json', encoding='utf-8') as f:
            m = json.load(f)
    except FileNotFoundError:
        return False
    return {k: m[k] for k in ('text', 'voice')} == tts_key(text, v) and os.path.exists(path + '.mp3')


def speech_span(path):
    """语音文件里真正发声的起止（秒）：超过峰值 1% 的第一个和最后一个采样"""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path + '.mp3', '-ac', '1', '-ar', '24000', '-f', 'f32le', '-'],
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


def build(force=False):
    os.makedirs(VDIR, exist_ok=True)
    jobs = []
    for _, _, items, _ in SCENES:
        for it in items:
            if it[0] == 'N':
                jobs.append((os.path.join(VDIR, 'n_' + it[1]), spoken(it[3]), NARRATOR, True))
            else:
                jobs.append((os.path.join(VDIR, 'c_' + it[1]), it[4], VOICES[it[3]], False))

    async def run():
        for path, text, v, words in jobs:
            if force or not fresh(path, text, v):
                for attempt in range(4):
                    try:
                        await synth(path, text, v, words)
                        print('合成', os.path.basename(path), text)
                        break
                    except Exception as e:      # 网络抖动时重试
                        print('  重试', attempt + 1, e)
                        await asyncio.sleep(2 ** attempt)
                else:
                    raise RuntimeError('合成失败：' + path)
    asyncio.run(run())

    t, scenes, lines = 0.0, [], []
    for name, lead, items, tail in SCENES:
        s0 = t
        t += lead
        for it in items:
            kind, lid, gap = it[0], it[1], it[2]
            t += gap
            if kind == 'N':
                path = os.path.join(VDIR, 'n_' + lid)
                with open(path + '.json', encoding='utf-8') as f:
                    words = json.load(f)['words']
                v0, v1 = speech_span(path)
                v0 = min(v0, words[0][0]) if words else v0
                raw = it[3]
                plain = re.sub(r'[|^]', '', raw)                     # 带 {高亮}
                s = spoken(raw)
                ct = char_times(s, words, v1)
                chunks, marks, k = [], [], 0
                for part in raw.split('|'):
                    k0 = k
                    for ch in part:
                        if ch == '^':
                            marks.append(round(t + ct[k] - v0, 3))
                        elif ch not in '{}':
                            k += 1
                    cap = part.replace('^', '').rstrip(STRIP)
                    chunks.append([round(t + ct[k0] - v0, 3), cap])
                lines.append(dict(id=lid, kind='N', scene=name, t0=round(t, 3), t1=round(t + v1 - v0, 3),
                                  text=re.sub(r'[{}]', '', plain), chunks=chunks, marks=marks))
                t += v1 - v0
            else:
                path = os.path.join(VDIR, 'c_' + lid)
                v0, v1 = speech_span(path)
                t += .15                                   # 气泡先弹出来，再开口
                lines.append(dict(id=lid, kind='C', scene=name, who=it[3], text=it[4], t0=round(t, 3),
                                  t1=round(t + v1 - v0, 3), file=f'voice/c_{lid}.mp3', trim=round(v0, 4)))
                t += v1 - v0 + .1
        t += tail
        scenes.append(dict(name=name, t0=round(s0, 3), t1=round(t, 3)))
    data = dict(duration=round(t, 2), scenes=scenes, lines=lines)
    with open(os.path.join(HERE, 'timeline.json'), 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    with open(os.path.join(HERE, 'timeline.js'), 'w', encoding='utf-8') as f:
        f.write('// 由 narration.py 生成：每幕、每句旁白与台词的起止时间（秒）和字幕分段。请勿手改。\n')
        f.write('window.TIMELINE = ' + json.dumps(data, ensure_ascii=False) + ';\n')
    for s in scenes:
        print(f"{s['name']:>9} {s['t0']:7.2f} → {s['t1']:7.2f}")
    print('总时长', data['duration'])


if __name__ == '__main__':
    build(force='--force' in sys.argv)
