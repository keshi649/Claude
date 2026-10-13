"""配音还没合成完时，先估一个时间轴预览画面：已经合成好的句子用真实时间，没合成的按每秒 4.5 个字估。
会覆盖 源码/timeline.js 和 timeline.json；配音全部合成完以后，记得再跑一遍 python3 narration.py。
用法：python3 工具/fake_tl.py 源码目录"""
import importlib.util
import io
import json
import os
import sys

d = os.path.abspath(sys.argv[1])
spec = importlib.util.spec_from_file_location('nar', os.path.join(d, 'narration.py'))
nar = importlib.util.module_from_spec(spec)
spec.loader.exec_module(nar)
real_span, real_open = nar.speech_span, open
fake = {}


def fake_chars(s):
    t, out = .05, []
    for c in s:
        if '一' <= c <= '鿿':
            out.append([c, round(t, 3), round(t + .2, 3)])
            t += .222
        elif c in '，、；：。！？…':
            t += .18
    return out, t + .05


for _, _, items, _ in nar.SCENES:
    for it in items:
        if it[0] == 'N':
            vf = os.path.join(nar.VDIR, 'n_' + it[1])
            if not os.path.exists(vf + '.json'):
                fake[vf] = fake_chars(nar.spoken(it[3]))


def fake_open(p, *a, **k):
    if p.endswith('.json') and p[:-5] in fake:
        return io.StringIO(json.dumps({'chars': fake[p[:-5]][0]}))
    return real_open(p, *a, **k)


def fake_span(f):
    return (.05, fake[f[:-4]][1]) if f[:-4] in fake else real_span(f)


nar.open, nar.speech_span = fake_open, fake_span
nar.build()
print('估的句子：', len(fake), '（其余用的是真实配音）')
