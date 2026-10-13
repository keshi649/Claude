"""把成片整条转写一遍（带断句和标点），和旁白文案对照着看。整条转写容易出长音频的误差，听错的地方再用 line_asr.py / seg_asr.py 切开转写。
用法：/home/user/tts/venv/bin/python 工具/asr_full.py 成片.mp4（或 .wav）"""
import os
import subprocess
import sys
import tempfile

from funasr import AutoModel

with tempfile.TemporaryDirectory() as td:
    wav = os.path.join(td, 'a.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', sys.argv[1], '-ac', '1', '-ar', '16000', wav], check=True)
    m = AutoModel(model='paraformer-zh', vad_model='fsmn-vad', punc_model='ct-punc', disable_update=True, log_level='ERROR')
    print(m.generate(input=wav, batch_size_s=60)[0]['text'])
