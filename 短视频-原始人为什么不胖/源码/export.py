"""从 timeline.json 导出旁白文案：按段落排好的全部旁白，左边是这句开始的时间（只有旁白，不含对话框里的台词）。
用法：python3 export.py [输出目录]      默认输出到 out/；先运行 narration.py 生成 timeline.json
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
TITLE = '原始人为什么不胖？'
PARTS = {'hook': '开头', 'budget': '一、身体的财务部', 'ancient': '二、采购部的老规矩', 'modern': '三、配料表',
         'lab': '四、实验', 'mismatch': '五、进化错配', 'guide': '六、怎么吃', 'end': '七、结尾'}


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
