"""交付前把 README.md / 脚本.md 里的占位符 ⟨…⟩ 换成真实的数（先渲染完、把成片复制到集目录）。
写文档时时间先空着，写成占位符：
  ⟨编号⟩       这句开始的时刻，m:ss（开头表格里的 ⟨d1⟩ ⟨h2⟩ … ⟨h5⟩ 写成秒，如 2.9s）
  ⟨幕名⟩       这一幕的起止，m:ss–m:ss；⟨card⟩ 只给开始时刻；⟨endc⟩ 是结尾到片尾卡
  ⟨DUR⟩ 约几分几秒   ⟨SEC⟩ 总秒数   ⟨MB⟩ 成片大小   ⟨stamp⟩ 盖章（h2）的秒数，两位小数
  ⟨NLINES⟩ 旁白句数   ⟨CUTS⟩ 前 20 秒切镜头的时刻（ffmpeg 测）   ⟨ASR⟩ 第二个参数（查读错的说明）
用法：python3 工具/fill_docs.py 集目录 [查读错的说明]"""
import glob
import json
import os
import re
import subprocess
import sys

d = sys.argv[1]
tl = json.load(open(os.path.join(d, '源码', 'timeline.json'), encoding='utf-8'))
LN = {l['id']: l for l in tl['lines']}
SC = {s['name']: s for s in tl['scenes']}
mmss = lambda x: f'{int(x) // 60}:{int(x) % 60:02d}'
vals = {
    'DUR': f"{int(tl['duration']) // 60} 分 {int(tl['duration']) % 60} 秒",
    'SEC': f"{tl['duration']:.0f}",
    'NLINES': str(sum(1 for l in tl['lines'] if l['kind'] == 'N')),
}
if 'h2' in LN:
    vals['stamp'] = f"{LN['h2']['t0']:.2f}"
mp4 = sorted(glob.glob(os.path.join(d, '*.mp4')))
if mp4:
    vals['MB'] = f"{os.path.getsize(mp4[0]) / 1048576:.1f}"
    r = subprocess.run(['ffmpeg', '-hide_banner', '-t', '20', '-i', mp4[0], '-vf', "select='gt(scene,0.25)',showinfo", '-f', 'null', '-'],
                       capture_output=True, text=True)
    vals['CUTS'] = '、'.join(f'{float(x):.1f}' for x in re.findall(r'pts_time:([0-9.]+)', r.stderr))
if len(sys.argv) > 2:
    vals['ASR'] = sys.argv[2]
for k in ('d1', 'h2', 'h3', 'h4', 'h5'):        # 开头表格用秒
    if k in LN:
        vals[k] = f"{LN[k]['t0']:.1f}s"
if 'end' in SC and 'card' in SC:
    vals['endc'] = f"{mmss(SC['end']['t0'])}–{mmss(SC['card']['t1'])}"
for k, l in LN.items():
    vals.setdefault(k, mmss(l['t0']))
for name, s in SC.items():
    vals.setdefault(name, mmss(s['t0']) if name == 'card' else f"{mmss(s['t0'])}–{mmss(s['t1'])}")
for f in ('脚本.md', 'README.md'):
    p = os.path.join(d, f)
    if not os.path.exists(p):
        continue
    s = re.sub(r'⟨([^⟩]+)⟩', lambda m: vals.get(m.group(1), m.group(0)), open(p, encoding='utf-8').read())
    open(p, 'w', encoding='utf-8').write(s)
    print(f, '剩下没填的：', re.findall(r'⟨[^⟩]+⟩', s) or '无')
