"""渲染前查音效会不会压字：列出盖住旁白某个字字头的短促音效（弹出、叮、呼、盖章、喇叭、卷帘门……）。
字头最怕被盖：《久坐》那支句首前 0.3 秒的弹出声、呼呼声拖到了"哈扎人"的"哈"上（h 是气声），逐句转写成了"怕扎人""卡扎人"。
每个字的时刻用配音的逐字时间（voice_cv3/n_编号.json）换算到成片上；字头算这个字开始前 0.03 秒到开始后 0.12 秒。
机器声、打呼、上滑音这类持续的低音（听得见的部分超过 0.7 秒）不算；声音只算比它自己的峰值低 20 dB 以内的部分。
要求这一集的 audio.py 有 CUES（place() 往 sfx 上放声音时记一笔），从《原始人为什么不怕久坐？》开始有。
用法：python3 工具/sfx_check.py 源码目录"""
import importlib.util
import json
import linecache
import os
import sys

src = os.path.abspath(sys.argv[1])
ap = os.path.join(src, 'audio.py')
spec = importlib.util.spec_from_file_location('episode_audio', ap)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
if not hasattr(m, 'CUES'):
    sys.exit('这一集的 audio.py 没有 CUES，照《原始人为什么不怕久坐？》的 place() 加上')
m.build()
tl = json.load(open(os.path.join(src, 'timeline.json'), encoding='utf-8'))
heads = []                                   # (起, 止, 哪句哪个字)
for l in tl['lines']:
    if l['kind'] != 'N':
        continue
    chars = json.load(open(os.path.join(src, 'voice_cv3', f"n_{l['id']}.json"), encoding='utf-8'))['chars']
    for c, a, b in chars:
        x = l['t0'] + a - l['a0']            # 这个字在成片里开始的时刻
        heads.append((x - .03, x + .12, f"{l['id']}「{c}」{x:.2f}s"))
bad = 0
for t, d, where in sorted(m.CUES):
    if d > .7:
        continue
    hit = [why for a, b, why in heads if t < b and t + d > a]
    if hit:
        bad += 1
        line_no = int(where.split('第 ')[1].split(' 行')[0])
        print(f'  {t:6.2f}~{t + d:.2f}s  压在 {"、".join(hit)}\n           {linecache.getline(ap, line_no).strip()}')
print('没有压在字头上的短促音效' if not bad else f'一共 {bad} 处：挪到停顿里（停顿不够就在 narration.py 里加长句前停顿），或者确认是很低沉的声音、不碍事')
