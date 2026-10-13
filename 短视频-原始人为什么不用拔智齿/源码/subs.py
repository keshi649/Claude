"""从 timeline.json 导出字幕文件和配音台词。

  字幕.srt        带时间码的字幕，和成片里烧进画面的字幕一字不差、两行分法也一样。可以导入剪映等剪辑软件，
                  或者上传成平台的字幕。成片里已经有字幕，所以文件名故意和视频不同，免得播放器自动叠加一份
  字幕文案.txt    按段落排好的全部字幕，左边是出现时间；画面上的标题、对白气泡和片尾字用〔 〕标出来，穿插在中间
  配音台词.txt    只有角色说的话（对白气泡），按出现顺序一行一句，方便配音

用法：python3 subs.py [输出目录]      默认输出到 out/；先运行 script.py 生成 timeline.json
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
TITLE = '原始人为什么不用拔智齿？'
# 段落标题，和 脚本.md 的分段一致
PARTS = {'hook': '开头', 'lot': '一、下巴停车场', 'past': '二、两百年', 'site': '三、咀嚼信号',
         'rats': '四、证据', 'wear': '五、磨出来的车位', 'mismatch': '六、进化错配 + 攻略',
         'guide': '六、进化错配 + 攻略', 'end': '七、结尾', 'card': '七、结尾'}
# 画面上的字（不是字幕）：(跟着哪条字幕或哪一幕, 相对它开始的秒数, 谁说的/是什么, 内容)
# 对白气泡和 scenes*.js 里的 speech() 一一对应，改了那边记得同步这里
ON_SCREEN = [
    ('h1', 0.0, '标题', TITLE),
    ('l5', 0.5, '智齿', '让一让……我也有车位票！'),
    ('p1', 2.3, '智齿', '有位置！'),
    ('s5', 1.1, '施工队', '今天又没活？'),
    ('w2', 2.6, '智齿', '空出来了！'),
    ('g1', 0.2, '病人', '疼……要不要拔？'),
    ('e0', 0.2, '智齿', '我没长错……只是来晚了。'),
    ('e1', 1.2, '原始人', '嚼嚼？'),
    ('card', 0.0, '片尾', TITLE + ' 他们的下巴，是嚼大的。 甜菜 出品'),
]
# 角色说的话（对白气泡）：配音版只给这些配音
DIALOGUE = [x for x in ON_SCREEN if x[2] not in ('标题', '片尾')]


def plain(text):
    return text.replace('{', '').replace('}', '')


def srt_time(x):
    ms = round(x * 1000)
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'


def clock(x):
    return f'{int(x) // 60}:{int(x) % 60:02d}'


def export(out_dir):
    with open(os.path.join(HERE, 'timeline.json'), encoding='utf-8') as f:
        tl = json.load(f)
    subs = [l for l in tl['lines'] if l['text']]
    start = {l['id']: l['t0'] for l in tl['lines']}
    start.update({s['name']: s['t0'] for s in tl['scenes']})

    def part_at(t):
        return PARTS[next(s['name'] for s in tl['scenes'] if s['t0'] <= t < s['t1'])]

    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, '字幕.srt'), 'w', encoding='utf-8') as f:
        for i, l in enumerate(subs, 1):
            f.write(f"{i}\n{srt_time(l['t0'])} --> {srt_time(l['t1'])}\n{plain(l['text']).replace('|', chr(10))}\n\n")

    # 字幕和画面上的字按出现时间排在一起；同一时刻画面上的字排在前面
    rows = [(l['t0'], 1, plain(l['text']).replace('|', '')) for l in subs]
    rows += [(start[k] + dt, 0, f'〔{who}〕{text}') for k, dt, who, text in ON_SCREEN]
    rows.sort()
    out = [f'《{TITLE}》字幕文案', '',
           f'共 {len(subs)} 条字幕，时长 {clock(round(tl["duration"]))}。左边是出现的时间；'
           '〔 〕里是画面上的标题、对白气泡和片尾字，不是字幕。']
    part = None
    for t, _, text in rows:
        if part_at(t) != part:
            part = part_at(t)
            out += ['', f'【{part}】']
        out.append(f'{clock(t)}  {text}')
    with open(os.path.join(out_dir, '字幕文案.txt'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(out) + '\n')
    said = sorted((start[k] + dt, text) for k, dt, who, text in DIALOGUE)
    with open(os.path.join(out_dir, '配音台词.txt'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(text for _, text in said) + '\n')
    print(f'{len(subs)} 条字幕、{len(said)} 句台词 → {out_dir}/字幕.srt、字幕文案.txt、配音台词.txt')


if __name__ == '__main__':
    export(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out'))
