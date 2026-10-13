"""《原始人为什么不近视？》配音稿 + 语音合成 + 时间轴。

用法：python3 voice.py            合成缺失的配音（缓存在 voice/），并写出 timeline.js / timeline.json
      python3 voice.py --force    全部重新合成

每句：(编号, 角色, 句前停顿秒数, 文本, 字幕或说话人)
  - 角色 N 是旁白，用语音合成；文本里的 '|' 把一句切成几段字幕，按词边界对时
    字幕里的 {…} 是高亮关键词；字幕为 None 时，直接用文本去掉句末标点；字幕为 '-' 时不出字幕
    文本里的 '^' 是一个时间标记点（画面用它对齐动作），不会被念出来
    读 zhǎng 的“长”在念的文本里写成“涨”，免得被念成 cháng；字幕里照样写“长”
  - 角色 D 是游戏对话框（不配音，只有打字音效）。第五项是说话人，
    占用的时间按字数估算：逐字打出 + 停留阅读
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
    'N': dict(voice='zh-CN-YunxiNeural', rate='+10%', pitch='+0Hz'),
}
TYPE_CPS = 14.0     # 对话框每秒打出的字数
DIALOG_HOLD = 0.75  # 打完之后停留的秒数

LINES = [
    # —— 钩子 ——
    ('h1', 'N', 0.15, '原始人为什么不近视？', '原始人为什么{不近视}？'),
    ('d1', 'D', 0.25, '因为他们没手机呗！', '你'),
    ('h2', 'N', 0.1, '只说对了^一半。', '-'),   # 画面上有盖章「只对一半」，不再出字幕
    ('h3', 'N', 0.45, '六十年前的北极，|还没有手机，', '六十年前的北极|还{没有手机}'),
    ('h4', 'N', 0.1, '可因纽特人的近视率，|一代人就从不到^百分之三，|涨到了^一半以上。',
     '可{因纽特人}的近视率|一代人就从{不到 3%}|涨到了{一半以上}'),
    ('h5', 'N', 0.45, '真正的线索，|就在你头顶上——', '真正的线索|就在你{头顶上}'),
    ('h6', 'N', 0.3, '天花板。', '{天花板}'),
    # —— 眼球工地 ——
    ('e1', 'N', 0.9, '先说个冷知识：|你的眼球，是边涨边对焦的。', '先说个冷知识|你的眼球，是{边长边对焦}的'),
    ('e2', 'N', 0.3, '刚出生时，眼球太短，|焦点落在^视网膜后面。', '刚出生时，眼球{太短}|焦点落在{视网膜后面}'),
    ('e3', 'N', 0.3, '于是，一支施工队开工了：|把眼球一点点拉长，|直到焦点正好落在^视网膜上。',
     '于是，一支{施工队}开工了|把眼球一点点{拉长}|直到焦点正好落在{视网膜上}'),
    ('e4', 'N', 0.35, '还没涨够的这一截，|医生管它叫：^远视储备。', '还没长够的这一截|医生管它叫：{远视储备}'),
    ('e5', 'N', 0.2, '储备用完，就该停工。', '储备用完，就该{停工}'),
    ('d2', 'D', 0.3, '那我们……咋知道啥时候停？', '施工队'),
    ('e6', 'N', 0.25, '答案，写在一本很老很老的施工手册里。', '答案，写在一本{很老很老}的施工手册里'),
    # —— 草原：手册是在这里写的 ——
    ('s1', 'N', 1.15, '几十万年来，|人类的孩子都在户外长大。', '{几十万年}来|人类的孩子都在{户外}长大'),
    ('s2', 'N', 0.2, '晴天的阳光，|有^好几万勒克斯。', '晴天的阳光|有{好几万}勒克斯'),
    ('s3', 'N', 0.3, '强光一照，|视网膜就释放^多巴胺——', '强光一照|视网膜就释放{多巴胺}'),
    ('s4', 'N', 0.1, '它就像工头^吹哨：|慢点涨！', '它就像{工头吹哨}|{慢点长！}'),
    ('s5', 'N', 0.3, '手册上就一条：|光够亮，就^停工。', '手册上就一条|{光够亮，就停工}'),
    # —— 小鸡实验 ——
    ('c1', 'N', 0.7, '科学家给小鸡戴上模糊眼罩：|强光下的那组，|近视涨得^慢得多；',
     '科学家给小鸡戴上{模糊眼罩}|{强光}下的那组|近视长得{慢得多}'),
    ('c2', 'N', 0.25, '可一旦用药^阻断多巴胺，|强光就^不灵了。', '可一旦用药{阻断多巴胺}|强光就{不灵了}'),
    # —— 教室：版本不兼容 ——
    ('k1', 'N', 1.15, '可这本手册，|没料到今天：', '可这本手册|{没料到}今天'),
    ('k2', 'N', 0.15, '孩子们一天大半时间，|都待在屋里。', '孩子们一天大半时间|都待在{屋里}'),
    ('k3', 'N', 0.25, '天花板挡住的，|是太阳。', '天花板挡住的|是{太阳}'),
    ('k4', 'N', 0.4, '你觉得教室挺亮？|那是眼睛^自动调了亮度。', '你觉得教室挺亮？|那是眼睛{自动调了亮度}'),
    ('k5', 'N', 0.3, '按真实的亮度，|教室跟^太阳落山时差不多。', '按{真实}的亮度|教室跟{太阳落山}时差不多'),
    ('d3', 'D', 0.45, '哨子……咋不响了？', '施工队'),
    ('k6', 'N', 0.2, '哨子不响，|施工队就一直干。', '哨子不响|施工队就{一直干}'),
    ('k7', 'N', 0.2, '眼球拉得太长，|焦点跑到了^视网膜前面——', '眼球拉得{太长}|焦点跑到了视网膜{前面}'),
    ('k8', 'N', 0.1, '远处，就^糊了。', '远处，就{糊}了'),
    ('d4', 'D', 0.3, '黑板上……写的啥？', '你'),
    ('k9', 'N', 0.35, '再加上从早到晚盯着书本和屏幕，|风险又多一层。', '再加上从早到晚盯着{书本和屏幕}|风险又多一层'),
    ('k10', 'N', 0.5, '这就是^进化错配：|手册没写错，|是世界变了。', '这就是{进化错配}|手册没写错|是{世界变了}'),
    # —— 广州实验 ——
    ('g1', 'N', 0.85, '那多出去晒晒，|真的管用吗？', '那多出去晒晒|真的{管用}吗？'),
    ('g2', 'N', 0.25, '广州做过实验：|十二所小学，|一半每天多上一节^四十分钟的户外课。',
     '{广州}做过实验|12 所小学|一半每天多上一节 {40 分钟}户外课'),
    ('g3', 'N', 0.35, '三年后，新近视的比例：|照常上课的，^百分之三十九点五；|多晒太阳的，^百分之三十点四。',
     '三年后，新近视的比例|照常上课的 {39.5%}|多晒太阳的 {30.4%}'),
    ('g4', 'N', 0.3, '每天，只多了四十分钟。', '每天，只多了{40 分钟}'),
    # —— 攻略 ——
    ('a1', 'N', 0.85, '所以攻略很简单：|白天在户外，待够^两小时。', '所以攻略很简单|白天在户外，待够{两小时}'),
    ('a2', 'N', 0.25, '不用非得运动，|阴天、^树荫下也算——|都比教室^亮得多。',
     '不用非得运动|{阴天、树荫下}也算|都比教室{亮得多}'),
    ('a3', 'N', 0.35, '最要紧的是小时候：|眼轴一旦涨过头，|就^缩不回去了。', '最要紧的是{小时候}|眼轴一旦{长过头}|就{缩不回去}了'),
    # —— 结尾 ——
    ('d5', 'D', 0.6, '检测到光照不足：300 LUX', '系统'),
    ('z1', 'N', 1.05, '你的眼睛，没有坏。', '你的眼睛，{没有坏}'),
    ('z2', 'N', 0.2, '它只是还照着几十万年前的手册干活，', '它只是还照着{几十万年前}的手册干活'),
    ('z3', 'N', 0.2, '在等一声，|只有^太阳吹得响的哨子。', '在等一声|只有{太阳}吹得响的{哨子}'),
]
TAIL = 6.2   # 最后一句之后留给片尾卡的时间

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


def dialog_time(text):
    n = len(text)
    return n / TYPE_CPS, n / TYPE_CPS + DIALOG_HOLD


def build(force=False):
    os.makedirs(VDIR, exist_ok=True)
    todo = []
    for lid, spk, _, text, _ in LINES:
        if spk == 'D':
            continue
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
        if spk == 'D':
            typed, total = dialog_time(text)
            start = t + gap
            tl.append(dict(id=lid, spk='D', who=sub, start=round(start, 3), v0=round(start, 3),
                           typed=round(start + typed, 3), v1=round(start + total, 3), end=round(start + total, 3),
                           chunks=[], marks=[], text=text))
            t = start + total
            continue
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
        subs = (['-'] * len(segs) if sub == '-' else sub.split('|') if sub else [re.sub('[%s]+$' % PUNCT, '', s) for s in segs])
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
