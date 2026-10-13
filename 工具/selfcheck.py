"""按 短视频方法论.md 的交付前自查，从 timeline.json 量出能自动量的几项。用法：python3 工具/selfcheck.py 源码目录"""
import json
import os
import re
import sys

d = json.load(open(os.path.join(sys.argv[1], 'timeline.json'), encoding='utf-8'))
L = d['lines']
N = [l for l in L if l['kind'] == 'N']
stamp = next((l for l in N if l['chunks'] == []), None)       # 第一句不出字幕的旁白 = 盖章推翻
last = max(l['t1'] for l in L)
# 字幕宽度按 68px 的得意黑估：汉字 68，ASCII 37，空格 17；rich() 超过 800 会压扁
w = lambda v: sum(37 if (c.isascii() and c != ' ') else (17 if c == ' ' else 68) for c in v)
lines = [re.sub(r'[{}]', '', x).rstrip('，。、；：') for l in N for _, s in l['chunks'] for x in s.split('/')]
print(f"推翻常识（盖章）出现在 {stamp['t0']:.2f} 秒（≤ 3.5）" if stamp else '没找到不出字幕的盖章句（nocap）')
print(f"旁白里说\"你\" {sum(l['text'].count('你') for l in N)} 次（≥ 3）")
print(f"总时长 {d['duration']:.2f} 秒（{int(d['duration']) // 60}:{int(d['duration']) % 60:02d}，≤ 2:30）")
print(f"旁白讲完到视频结束 {d['duration'] - last:.2f} 秒（≤ 3）")
print(f"旁白 {len(N)} 句，对话框 {len(L) - len(N)} 个")
print('最宽的几行字幕（一行 ≤ 12 个字、≤ 800px）：')
for v in sorted(lines, key=w, reverse=True)[:5]:
    print(f"  {len(v.replace(' ', '')):2d} 字 {w(v):4d}px  {v}")
