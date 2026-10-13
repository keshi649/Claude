"""《原始人为什么不用拔智齿？》字幕稿 + 时间轴。

本片没有配音、没有配乐，只有字幕和音效。字幕不再逐字对应讲解，而是直接解释画面和内容，
所以时间轴由字幕的阅读时长决定。
用法：python3 script.py      写出 timeline.js（给画面）和 timeline.json（给声音）

每一幕：(幕名, 开场留白秒数, [字幕…], 收尾留白秒数)
每条字幕：(编号, 字幕, 显示秒数或 None)
  - 字幕里的 {…} 是高亮；'|' 是手动换行
  - 显示秒数为 None 时按字数估算（大约每秒读 6 个字）；字幕为 '' 时只占时间、不显示（留给画面）
"""
import json
import os
import re

GAP = 0.3           # 两条字幕之间的空隙
SCENES = [
    ('hook', 0.0, [
        ('h1', '最右边这颗{智齿}，|横着卡在了下巴里', 3.6),
        ('h2', '如今，大约{每 4 个人}|就有 1 个这样的', None),
        ('h3', '可在工业化以前：|{不到 1/20}', None),
        ('h4', '原始人的下巴，|凭什么{放得下}？', None),
    ], 0.6),
    ('lot', 0.9, [
        ('l1', '把下巴想成一排{停车位}：|一颗牙，占一个', None),
        ('l2', '牙按顺序进场：|{6 岁}、{12 岁}各来一颗大磨牙', 4.4),
        ('l3', '{智齿}是第三颗大磨牙，|排最后：{18～25 岁}才到', 4.6),
        ('l4', '来得太晚，|后面的墙堵着——{车位已满}', None),
        ('l5', '挤不进去，就斜着卡在半路：|这叫{阻生}', 4.2),
        ('l6', '卡住的地方容易塞{食物}、闹{发炎}，|还会顶坏前面那颗牙', 4.8),
        ('l7', '毛病不在智齿，|在于{停车场修小了}', None),
    ], 0.5),
    ('past', 1.0, [
        ('p1', '原始人的下巴更{长}：|车位够，智齿能{正着长出来}', 4.4),
        ('p2', '阻生智齿从{不到 5%}涨到{约 25%}，|只用了两百年', 4.2),
        ('p4', '这么短，基因来不及变。|变的是{饭}', None),
        ('p5', '从生根茎、硬肉干，到面包、粥、奶茶：|越来越{不用嚼}', 5.2),
    ], 0.5),
    ('site', 0.9, [
        ('s2', '下巴小时候{边长边扩建}：|后墙一点点往后挪，给新磨牙{腾地方}', 5.0),
        ('s3', '工地看信号干活：|每嚼一口，就是一次{开工信号}', 4.6),
        ('s4', '原始人小孩天天啃硬的，|工地{开足马力}', None),
        ('s5', '现代小孩吃得软，信号少，|工地{没活干}', None),
        ('s6', '下巴少长了一截，|{智齿的车位}就没了', None),
    ], 0.5),
    ('rats', 0.8, [
        ('r1', '这在{大鼠}身上做过实验：', None),
        ('r2', '同一种饲料，一组啃{硬颗粒}，|一组吃{泡软的糊}', 4.6),
        ('r3', '60 天后，吃糊那组的下巴|{短了约 16%}', None),
        ('r4', '世界各地的头骨也这样：|狩猎采集者的下巴，比种地的{更长}', 5.0),
    ], 0.5),
    ('wear', 0.8, [
        ('w1', '还有一招：粗粮里带着沙，|会把牙{磨小}一点', None),
        ('w2', '前面的牙磨短了，整排{往前挪}，|后面就空出了车位', 4.8),
        ('w3', '如今的牙几乎不磨，|也就{不挪}了', None),
    ], 0.5),
    ('mismatch', 0.7, [
        ('m1', '这就是{进化错配}：', 2.4),
        ('m2', '牙还按 {32 颗}的老配置长，|很多人的下巴只修了 {28 个车位}', 5.0),
    ], 0.6),
    ('guide', 0.8, [
        ('g1', '那长了智齿怎么办？', None),
        ('g2', '先{拍片}，让牙医看：|长正了、不疼、刷得干净的，可以{先观察}', 5.4),
        ('g3', '反复{发炎}、顶坏邻牙的，|{该拔就拔}', None),
        ('g4', '给孩子多吃点要嚼的？{可能}有帮助，|但人身上的证据{还不多}', 5.2),
    ], 0.5),
    ('end', 0.6, [
        ('e0', '', 2.6),                                       # 智齿的对话气泡
        ('e1', '车位不够，|是因为我们{嚼得太少}', None),
    ], 0.4),
    ('card', 0.0, [], 5.0),
]

PUNCT = '，。、：；！？…—,.!?:;《》“”（）|～ '
HERE = os.path.dirname(os.path.abspath(__file__))


def auto_hold(text):
    n = len([c for c in re.sub(r'[{}]', '', text) if c not in PUNCT])
    return min(5.6, max(2.6, 0.85 + n / 6.2))


def build():
    t = 0.0
    scenes, lines = [], []
    for name, lead, items, tail in SCENES:
        s0 = t
        t += lead
        for i, (lid, text, hold) in enumerate(items):
            if i:
                t += GAP
            h = hold if hold is not None else auto_hold(text)
            lines.append(dict(id=lid, scene=name, t0=round(t, 3), t1=round(t + h, 3), text=text))
            t += h
        t += tail
        scenes.append(dict(name=name, t0=round(s0, 3), t1=round(t, 3)))
    data = dict(duration=round(t, 2), scenes=scenes, lines=lines)
    with open(os.path.join(HERE, 'timeline.json'), 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    with open(os.path.join(HERE, 'timeline.js'), 'w', encoding='utf-8') as f:
        f.write('// 由 script.py 生成：每幕、每条字幕的起止时间（秒）。请勿手改。\n')
        f.write('window.TIMELINE = ' + json.dumps(data, ensure_ascii=False) + ';\n')
    for s in scenes:
        print(f"{s['name']:>9} {s['t0']:7.2f} → {s['t1']:7.2f}")
    print('总时长', data['duration'])


if __name__ == '__main__':
    build()
