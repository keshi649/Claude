"""从 timeline.json 导出旁白文案：按段落排好的全部旁白，左边是这句开始的时间（只有旁白，不含角色台词）。
用法：python3 export.py [输出目录]      默认输出到 out/；先运行 narration.py 生成 timeline.json
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
TITLE = '原始人为什么不过敏？'
PARTS = {'hook': '开头', 'guard': '一、保安队', 'history': '二、一百五十年前的怪事', 'train': '三、陪练',
         'amish': '四、两群农民', 'peanut': '五、花生', 'mismatch': '六、进化错配', 'guide': '七、怎么办', 'end': '八、结尾'}


def clock(x):
    return f'{int(x) // 60}:{int(x) % 60:02d}'


def export(out_dir):
    with open(os.path.join(HERE, 'timeline.json'), encoding='utf-8') as f:
        tl = json.load(f)
    out, part = [f'《{TITLE}》旁白文案'], None
    for l in tl['lines']:
        if l['kind'] != 'N':
            continue
        if PARTS[l['scene']] != part:
            part = PARTS[l['scene']]
            out += ['', f'【{part}】']
        out.append(f"{clock(l['t0'])}  {l['text']}")
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, '旁白文案.txt'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(out) + '\n')
    print(f"{sum(1 for l in tl['lines'] if l['kind'] == 'N')} 句旁白 → {out_dir}/旁白文案.txt")


if __name__ == '__main__':
    export(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out'))
