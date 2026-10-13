"""成片逐句转写：按 timeline.json 把每句旁白从成片音轨里切出来单独转写，按拼音（不带声调）和原稿比。
读错率不是 0 的句子，看"不一样"那一栏：同音字（它 / 他、得 / 的、糗 / 球）不算错；真不一样就是被音效盖住了或者念错了。
用法：/home/user/tts/venv/bin/python 工具/line_asr.py 源码目录 成片.mp4（或 .wav）"""
import json
import os
import subprocess
import sys
import tempfile
from difflib import SequenceMatcher

import soundfile as sf
from funasr import AutoModel
from pypinyin import lazy_pinyin

src, media = sys.argv[1], sys.argv[2]
tl = json.load(open(os.path.join(src, 'timeline.json'), encoding='utf-8'))
cjk = lambda s: ''.join(c for c in s if '一' <= c <= '鿿')
m = AutoModel(model='paraformer-zh', disable_update=True, log_level='ERROR')
bad = 0
with tempfile.TemporaryDirectory() as td:
    wav, seg = os.path.join(td, 'a.wav'), os.path.join(td, 'seg.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', media, '-ac', '1', '-ar', '16000', wav], check=True)
    x, sr = sf.read(wav)
    for l in tl['lines']:
        if l['kind'] != 'N':
            continue
        a, b = max(0, l['t0'] - .12), l['t1'] + .15
        sf.write(seg, x[int(a * sr):int(b * sr)], sr)
        hyp, ref = cjk(m.generate(input=seg)[0]['text']), cjk(l['text'])
        A, B = lazy_pinyin(ref), lazy_pinyin(hyp)
        sm = SequenceMatcher(a=A, b=B, autojunk=False)
        same = sum(bl.size for bl in sm.get_matching_blocks())
        e = 1 - same / len(A) + max(0, len(B) - same) / len(A)
        diff = [(ref[i1:i2], hyp[j1:j2]) for tag, i1, i2, j1, j2 in sm.get_opcodes() if tag != 'equal']
        bad += e > 0
        print(f"{l['id']:>3} {a:6.2f}  读错率（按拼音）{e:.2f}  {hyp}" + (f"   ← 不一样：{diff}" if diff else ''))
print('有出入的句子：', bad)
