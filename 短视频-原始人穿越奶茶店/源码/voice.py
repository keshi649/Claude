"""《原始人穿越奶茶店》配音稿 + 语音合成 + 时间轴。

用法：python3 voice.py            合成缺失的配音（缓存在 voice/），并写出 timeline.js / timeline.json
      python3 voice.py --force    全部重新合成

每句：(编号, 角色, 句前停顿秒数, 念的文本, 字幕)
  - 文本里的 '|' 把一句切成几段字幕，字幕段与文本段一一对应，按词边界对时
  - 字幕里的 {…} 是高亮关键词；字幕为 None 时，直接用文本去掉句末标点
  - 文本里的 '^' 是一个时间标记点（画面用它对齐动作），不会被念出来
角色：N 旁白，K 店员，C 原始人
"""
import asyncio
import json
import os
import re
import ssl
import subprocess
import sys

import edge_tts
import edge_tts.communicate as _comm

# 云端环境的出站 HTTPS 走代理，需要信任代理的 CA；本地运行时文件不存在就用默认
_CA = '/root/.ccr/ca-bundle.crt'
if os.path.exists(_CA):
    _comm._SSL_CTX = ssl.create_default_context(cafile=_CA)

VOICES = {
    'N': dict(voice='zh-CN-YunxiNeural', rate='+12%', pitch='+0Hz'),
    'K': dict(voice='zh-CN-XiaoyiNeural', rate='+8%', pitch='+6Hz'),
    'C': dict(voice='zh-CN-YunjianNeural', rate='-8%', pitch='-10Hz'),
}

LINES = [
    # —— 钩子 ——
    ('h1', 'N', 0.12, '原始人喝下^第一口全糖奶茶——', '原始人喝下第一口{全糖奶茶}'),
    ('h2', 'N', 0.02, '大脑当场拉响一级警报！', '大脑当场拉响{一级警报}！'),
    ('h3', 'N', 0.25, '而你的大脑，|跟他是同一款。', '而你的大脑|跟他是{同一款}'),
    # —— 穿越 ——
    ('p1', 'N', 0.75, '一万年前，|他正在野外找吃的。', None),
    ('p2', 'N', 0.15, '翻了一上午，|只找到三颗酸果子。', '翻了一上午|只找到{三颗酸果子}'),
    ('p3', 'N', 0.35, '突然，天上劈下一道闪电——', None),
    ('k1', 'K', 1.7, '欢迎光临！喝点什么？', None),
    ('p4', 'N', 0.3, '他看不懂菜单，|但他闻得出来：', None),
    ('p5', 'N', 0.1, '这里每一样东西，|都是甜的。', '这里{每一样东西}|都是{甜的}'),
    ('c1', 'C', 0.35, '全……全都要！', None),
    ('p6', 'N', 0.35, '全糖，|加珍珠，|加奶盖。', None),
    ('p7', 'N', 0.6, '有消委会测过：|最甜的一杯珍珠奶茶，|有六十多克糖，', '有消委会测过|最甜的一杯珍珠奶茶|有{60.9克}糖'),
    ('p8', 'N', 0.1, '差不多十三块方糖。', '差不多{13块方糖}'),
    # —— 远古的糖 ——
    ('p9', 'N', 0.85, '可在他的世界里，|甜，是奢侈品。', '可在他的世界里|甜，是{奢侈品}'),
    ('p10', 'N', 0.25, '野果又小又酸，|一年只熟那么几周，', '野果又小又酸|一年只熟{那么几周}'),
    ('p11', 'N', 0.1, '还得跟鸟和猴子抢。', None),
    ('p12', 'N', 0.35, '最甜的是蜂蜜，|得爬上大树，|被蜇一脸。', '最甜的是{蜂蜜}|得爬上大树|被蜇一脸'),
    ('p13', 'N', 0.35, '直到今天，|坦桑尼亚的哈扎人给食物排名，', '直到今天|坦桑尼亚的{哈扎人}给食物排名'),
    ('p14', 'N', 0.1, '第一名，还是蜂蜜。', '第一名，还是{蜂蜜}'),
    # —— 铁律 ——
    ('p15', 'N', 0.7, '所以大脑刻下了一条铁律：', '所以大脑刻下了一条{铁律}'),
    ('p16', 'N', 0.25, '见到甜的，|马上吃光，|存成脂肪。', '见到甜的|马上吃光|{存成脂肪}'),
    ('p17', 'N', 0.25, '因为下一顿，|不知道在哪儿。', None),
    ('p18', 'N', 0.25, '这条铁律，|帮祖先熬过了无数个冬天。', '这条铁律|帮祖先熬过了{无数个冬天}'),
    ('p19', 'N', 0.35, '但它只教会大脑：别错过。', '但它只教会大脑：{别错过}'),
    ('p20', 'N', 0.15, '却从没教过它：够了。', '却从没教过它：{够了}'),
    # —— 奶茶 = 假蛋 ——
    ('p21', 'N', 0.8, '现在，回到奶茶店。', None),
    ('p22', 'N', 0.15, '奶茶给大脑的，|是大自然从没给过的组合：', '奶茶给大脑的|是大自然{从没给过}的组合'),
    ('p23', 'N', 0.2, '水果有糖没油，|坚果有油没糖，', None),
    ('p24', 'N', 0.15, '而奶茶，|糖和油一起上。', '而奶茶|{糖和油一起上}'),
    ('p25', 'N', 0.45, '耶鲁的实验发现：|糖油一混合，', '耶鲁的实验发现|糖油一混合'),
    ('p26', 'N', 0.1, '大脑奖赏区的反应，|比两样单独相加还强。', '大脑奖赏区的反应|比两样{单独相加还强}'),
    ('p27', 'N', 0.8, '动物学家丁伯根发现，', '动物学家{丁伯根}发现'),
    ('p28', 'N', 0.1, '蛎鹬会撇下自己的蛋，|去孵一个大得离谱的假蛋。', '{蛎鹬}会撇下自己的蛋|去孵一个{大得离谱的假蛋}'),
    ('p29', 'N', 0.35, '对大脑来说，|奶茶就是那颗假蛋。', '对大脑来说|奶茶就是{那颗假蛋}'),
    # —— 换成你 ——
    ('p30', 'N', 0.85, '最后，把原始人换成你。', '最后，把原始人{换成你}'),
    ('p31', 'N', 0.3, '身体坐在写字楼里，|大脑还住在山洞里。', '身体坐在写字楼里|大脑还{住在山洞里}'),
    ('p32', 'N', 0.35, '你戒不掉奶茶，|不是意志力差，', '你戒不掉奶茶|{不是意志力差}'),
    ('p33', 'N', 0.1, '是一个原始大脑，|在认真执行它的铁律。', '是一个原始大脑|在认真执行它的{铁律}'),
    # —— 怎么办 ——
    ('p34', 'N', 0.75, '跟原始脑讲道理，没用。', None),
    ('c2', 'C', 0.15, '嗷？', None),
    ('p35', 'N', 0.35, '能改的，是环境。', '能改的，是{环境}'),
    ('p36', 'N', 0.2, '比如，|把三分糖设成默认。', '比如|把{三分糖}设成默认'),
    ('p37', 'N', 0.45, '再给舌头一点时间：', None),
    ('p38', 'N', 0.1, '有实验让人减糖三个月，|再尝同一份布丁，|明显更甜了。', '有实验让人{减糖三个月}|再尝同一份布丁|{明显更甜了}'),
    # —— 结尾 ——
    ('p39', 'N', 0.85, '你的大脑，|还没收到通知：', None),
    ('p40', 'N', 0.2, '糖，已经不稀缺了。', '糖，{已经不稀缺了}'),
    ('p41', 'N', 0.45, '现在，由你来通知它。', '现在，由{你}来通知它'),
    ('c3', 'C', 0.5, '三……三分糖！', None),
    ('k2', 'K', 0.12, '好嘞！', None),
]
TAIL = 3.4   # 最后一句之后留给片尾卡的时间

HERE = os.path.dirname(os.path.abspath(__file__))
VDIR = os.path.join(HERE, 'voice')
PUNCT = '，。、：；！？…—,.!?:;'


def spoken(text):
    return text.replace('|', '').replace('^', '')


async def synth(lid, spk, text):
    v = VOICES[spk]
    com = edge_tts.Communicate(spoken(text), v['voice'], rate=v['rate'], pitch=v['pitch'], boundary='WordBoundary')
    words = []
    with open(os.path.join(VDIR, lid + '.mp3'), 'wb') as f:
        async for ch in com.stream():
            if ch['type'] == 'audio':
                f.write(ch['data'])
            elif ch['type'] == 'WordBoundary':
                words.append([ch['offset'] / 1e7, ch['duration'] / 1e7, ch['text']])
    with open(os.path.join(VDIR, lid + '.json'), 'w', encoding='utf-8') as f:
        json.dump({'text': text, 'voice': v, 'words': words}, f, ensure_ascii=False)


def duration(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
                         capture_output=True, text=True, check=True).stdout
    return float(out)


def char_times(text, words, dur):
    """返回 spoken(text) 每个字符开始发声的时间（相对本句开头）。"""
    s = spoken(text)
    t = [None] * (len(s) + 1)
    pos = 0
    for off, d, w in words:
        k = s.find(w, pos)
        if k < 0:
            continue
        for j in range(len(w)):
            t[k + j] = off + d * j / max(1, len(w))
        pos = k + len(w)
    t[len(s)] = dur
    # 标点等没有对上的字符：取后面最近一个有时间的字符
    for i in range(len(s) - 1, -1, -1):
        if t[i] is None:
            t[i] = t[i + 1]
    return t


def build(force=False):
    os.makedirs(VDIR, exist_ok=True)
    todo = []
    for lid, spk, _, text, _ in LINES:
        meta = os.path.join(VDIR, lid + '.json')
        ok = os.path.exists(meta) and os.path.exists(os.path.join(VDIR, lid + '.mp3'))
        if ok:
            with open(meta, encoding='utf-8') as f:
                m = json.load(f)
            ok = m['text'] == text and m['voice'] == VOICES[spk]
        if force or not ok:
            todo.append((lid, spk, text))

    async def run():
        for lid, spk, text in todo:
            print('合成', lid, spoken(text))
            for attempt in range(4):
                try:
                    await synth(lid, spk, text)
                    break
                except Exception as e:  # 网络抖动时重试
                    print('  重试', attempt + 1, e)
                    await asyncio.sleep(2 ** attempt)
            else:
                raise RuntimeError('合成失败：' + lid)
    asyncio.run(run())

    tl, t = [], 0.0
    for lid, spk, gap, text, sub in LINES:
        with open(os.path.join(VDIR, lid + '.json'), encoding='utf-8') as f:
            m = json.load(f)
        dur = duration(os.path.join(VDIR, lid + '.mp3'))
        words = m['words']
        # 语音文件前后有静音：用词边界估计真正发声的起止
        v0 = words[0][0] if words else 0.0
        v1 = (words[-1][0] + words[-1][1]) if words else dur
        start = t + gap - v0           # 让真正发声的时刻落在 t + gap
        ct = char_times(text, words, v1)
        # 字幕分段
        segs = text.replace('^', '').split('|')
        subs = (sub.split('|') if sub else [re.sub('[%s]+$' % PUNCT, '', s) for s in segs])
        assert len(subs) == len(segs), lid
        chunks, k = [], 0
        for s, label in zip(segs, subs):
            chunks.append([round(start + ct[k], 3), label])
            k += len(s)
        marks = []
        raw = text.replace('|', '')
        k = 0
        for ch in raw:
            if ch == '^':
                marks.append(round(start + ct[k], 3))
            else:
                k += 1
        tl.append(dict(id=lid, spk=spk, file=f'voice/{lid}.mp3', start=round(start, 3),
                       v0=round(start + v0, 3), v1=round(start + v1, 3), end=round(start + dur, 3),
                       chunks=chunks, marks=marks, text=spoken(text)))
        t = start + v1
    total = round(t + TAIL, 2)
    data = {'duration': total, 'lines': tl}
    with open(os.path.join(HERE, 'timeline.json'), 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    with open(os.path.join(HERE, 'timeline.js'), 'w', encoding='utf-8') as f:
        f.write('// 由 voice.py 生成：每句配音的起止时间（秒）与字幕分段。请勿手改。\n')
        f.write('window.TIMELINE = ' + json.dumps(data, ensure_ascii=False) + ';\n')
    for x in tl:
        print(f"{x['id']:>4} {x['v0']:7.2f} → {x['v1']:7.2f}  {x['text']}")
    print('总时长', total)


if __name__ == '__main__':
    build(force='--force' in sys.argv)
