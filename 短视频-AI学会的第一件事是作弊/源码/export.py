"""从 timeline.json 导出旁白文案：按段落排好的全部旁白，左边是这句开始的时间（只有旁白，不含对话框里的台词）。
用法：python3 export.py [输出目录]      默认输出到 out/；先运行 narration.py 生成 timeline.json
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
TITLE = '我训练了一只 AI 小怪，它学会的第一件事是作弊'
PARTS = {'hook': '开头', 'learn': '一、第 1 局：强化学习', 'loop': '二、池塘边的小环路', 'dance': '三、在终点门口跳舞',
         'judge': '四、看画面打分', 'real': '五、现实里的 AI', 'fix': '六、从头学，加一点好奇心', 'guide': '七、定目标之前，先问三句',
         'end': '八、结尾'}


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
