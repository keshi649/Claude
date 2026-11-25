"""成片逐句转写有句子错了，分不清是配音本身、环境声还是音效的问题时用：把这一集的声音拆成三轨导出，
再用 工具/seg_asr.py 分别转写同一段，看是加了哪一层才错的。
  voice.wav      只有人声（和成片里一样：去低频、压缩、按句调响度）
  voice_amb.wav  人声 + 环境声（说话时同样压低）
  voice_sfx.wav  人声 + 音效
例：《久坐》s1"哈扎人"在成片里转写成"怕扎人"：纯人声是对的，人声 + 环境声就错了，是草原的风声、鸟叫和篝火声盖住了句首很轻的"哈"；
    m2 纯人声就转写成"卡扎人"，是句首单独一个很弱的 h，跟环境声、音效无关。
用法：python3 工具/stems.py 源码目录 输出目录
     /home/user/tts/venv/bin/python 工具/seg_asr.py 输出目录/voice.wav 19.0:24.5"""
import importlib.util
import os
import sys

import numpy as np
from scipy.io import wavfile

src, out = os.path.abspath(sys.argv[1]), sys.argv[2]
os.makedirs(out, exist_ok=True)
spec = importlib.util.spec_from_file_location('episode_audio', os.path.join(src, 'audio.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
m.build()
voice, env = m.voice_track()
g = 10 ** ((m.BED_LUFS - m.lufs(m.sfx + m.amb)) / 20) * (1 - m.DUCK * env)      # 和成片里一样的音量、一样的避让


def write(name, x):
    x = x / max(1e-9, np.max(np.abs(x))) * .9
    wavfile.write(os.path.join(out, name), m.SR, (x.T * 32767).astype(np.int16))
    print(os.path.join(out, name))


write('voice.wav', voice)
write('voice_amb.wav', voice + m.amb * g)
write('voice_sfx.wav', voice + m.sfx * g)
