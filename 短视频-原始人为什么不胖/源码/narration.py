"""《原始人为什么不胖？》旁白稿 + 对话框台词 + 时间轴。

本片的字幕就是旁白，但旁白不配音：画面里只显示旁白字幕，声音只有音效和环境声，没有配乐。
为了让字幕按"说话"的节奏走（自己配旁白也对得上），每句旁白先用语音合成试读一遍，
只拿它的逐词时间来排字幕，合成的声音不进成片。角色台词出在游戏对话框里，不配音，只有打字音（和第一集一样）。

用法：python3 narration.py            合成缺失或改过的试读（缓存在 voice/），写出 timeline.js / timeline.json
      python3 narration.py --force    全部重新合成

每一幕：(幕名, 开场留白秒数, [条目…], 收尾留白秒数)
条目：
  ('N', 编号, 句前停顿, 旁白[, 选项])   旁白：'|' 把一句切成几段字幕，{…} 是高亮，'^' 是时间标记点（画面用它对齐动作）
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
        ('N', 'h1', 0, '原始人为什么{不胖}？'),
        ('D', 'd1', .25, '你', '因为人家天天打猎、跑来跑去呗！'),
        ('N', 'h2', .1, '只说对了一小半。', {'nocap': True}),
        ('N', 'h3', .35, '非洲坦桑尼亚的哈扎人，|今天还靠打猎采集过日子：|男人一天要走 {11 公里}。'),
        ('N', 'h4', .25, '可科学家一测：|他们一天烧掉的热量，|跟欧美{城里人}差不多。'),
        ('N', 'h5', .4, '那他们靠什么不胖？|线索就在你手里——'),
        ('N', 'h6', .3, '{配料表}。'),
    ], 0.5),
    ('budget', 0.8, [
        ('N', 'b1', 0, '这事跟你有关：|中国成年人，|已经{一半以上}超重或肥胖。'),
        ('N', 'b2', .35, '先说个冷知识：|你身上有个{财务部}，|管每天花多少能量。'),
        ('N', 'b3', .3, '你运动多了，|它会在别处^{悄悄省回来}：|一天的总开销，|涨不了多少。'),
        ('D', 'd2', .25, '财务部', '加班可以，预算不加。'),
        ('N', 'b4', .3, '所以光靠运动减肥，|效果没你想的那么大。'),
    ], 0.5),
    ('ancient', 0.9, [
        ('N', 'a1', 0, '真正的差别，在{采购部}。|几十万年来，|吃饱常常要靠运气：|见到吃的，{先吃再说}。'),
        ('D', 'd3', .25, '采购部', '见到吃的？全买！'),
        ('N', 'a2', .3, '好在野外的食物，|自带{刹车}：|要使劲嚼，带着渣，|^甜的不油，^油的不甜。'),
        ('N', 'a3', .25, '吃到一半，|{饱腹警报}就响了。'),
    ], 0.5),
    ('modern', 0.8, [
        ('N', 'm1', 0, '可如今，|很多食物是工厂{设计}出来的：|又软又香，又甜又油，|几口就下肚。'),
        ('N', 'm2', .3, '大脑最爱这种组合，|可在野外，|它{很少见}。'),
        ('N', 'm3', .3, '吃得太快，|饱腹警报还没响，|热量已经{超了}。'),
        ('D', 'd4', .25, '饱腹警报', '……刚才是不是吃了什么？'),
        ('N', 'm4', .3, '配料表一长串的这类食物，|有个名字：|{超加工食品}。'),
    ], 0.5),
    ('lab', 0.8, [
        ('N', 'l1', 0, '科学家做过一个实验：|20 个人住进实验室，|两周吃超加工，|两周吃{看得出原样}的饭菜，|想吃多少吃多少。'),
        ('N', 'l2', .3, '吃超加工的那两周，|每人每天不知不觉多吃了 {500 大卡}，|体重涨了将近 {1 公斤}；'),
        ('N', 'l3', .25, '吃原样饭菜的两周，|体重反而{掉了}将近 1 公斤。'),
    ], 0.5),
    ('mismatch', 0.7, [
        ('N', 'x1', 0, '这就是{进化错配}：|采购部还照着饥荒年代的规矩办事，|可超市 24 小时开门，|外卖 30 分钟就到。'),
    ], 0.5),
    ('guide', 0.8, [
        ('N', 'g1', 0, '所以攻略很简单：|多吃{看得出原样}的食物。'),
        ('N', 'g2', .3, '米饭、蔬菜、鸡蛋、肉、豆子、水果，|多吃；|配料表一长串、|你家厨房里没有的，|{少买}。'),
        ('N', 'g3', .25, '含糖饮料，|换成{白水}或茶。'),
        ('N', 'g4', .3, '运动照样要做：|它管的是心脏、血糖和心情；|减肥，{主要靠吃}。'),
    ], 0.5),
    ('end', 0.7, [
        ('D', 'd5', 0, '你', '原来不是我太馋……'),
        ('N', 'z1', .3, '你没那么馋，|也没那么懒。'),
        ('N', 'z2', .3, '你的身体，|只是还在为几十万年前的{饥荒}，|做准备。'),
    ], 0.6),
    ('card', 0.0, [], 5.0),
]
STRIP = '，。、；：'     # 字幕段末尾去掉的标点（问号、感叹号、破折号保留）


def spoken(text):
    return re.sub(r'[|^{}]', '', text)


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
                    chunks.append([round(t + ct[k0] - v0, 3), part.replace('^', '').rstrip(STRIP)])
                opt = it[4] if len(it) > 4 else {}
                lines.append(dict(id=lid, kind='N', scene=name, t0=round(t, 3), t1=round(t + v1 - v0, 3),
                                  text=re.sub(r'[{}|^]', '', raw), chunks=[] if opt.get('nocap') else chunks, marks=marks))
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
    build(force='--force' in sys.argv)
