"""转写成片里的几小段（比如整条转写里听错的地方）。单句也错，才是真被音效盖住了。
用法：/home/user/tts/venv/bin/python 工具/seg_asr.py 成片.mp4 起:止 [起:止 ...]（单位秒）"""
import os
import subprocess
import sys
import tempfile

import soundfile as sf
from funasr import AutoModel

m = AutoModel(model='paraformer-zh', disable_update=True, log_level='ERROR')
with tempfile.TemporaryDirectory() as td:
    wav, seg = os.path.join(td, 'a.wav'), os.path.join(td, 'seg.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', sys.argv[1], '-ac', '1', '-ar', '16000', wav], check=True)
    x, sr = sf.read(wav)
    for r in sys.argv[2:]:
        a, b = map(float, r.split(':'))
        sf.write(seg, x[int(a * sr):int(b * sr)], sr)
        print(r, m.generate(input=seg)[0]['text'].replace(' ', ''))
