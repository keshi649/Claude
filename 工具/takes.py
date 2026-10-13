"""同一句多合成几版（不同随机种子），每版给出时长、按拼音的读错率、指定字的音高，挑一版用。
加了拼音标注重合成以后，有时声调对了、语速却慢了一截，就用它多来几版。
用法：cd 源码 && /home/user/tts/venv/bin/python ../../工具/takes.py . CosyVoice目录 模型目录 编号 要看音高的字 种子1 种子2 ...
结果在 源码/out/takes/n_编号.s种子.wav / .json；挑中的那版复制成 voice_cv3/n_编号.wav / .json，再跑 narration.py。"""
import json
import os
import re
import sys

src, cv_dir, model_dir, lid, ch = sys.argv[1:6]
seeds = [int(s) for s in sys.argv[6:]]
sys.path[:0] = [os.path.abspath(src), cv_dir, os.path.join(cv_dir, 'third_party/Matcha-TTS')]
import numpy as np
import pyworld as pw
import torch
import torchaudio
from cosyvoice.cli.cosyvoice import AutoModel as CV
from cosyvoice.utils.common import set_all_random_seed
from funasr import AutoModel as FA

import narrate_cosy as nc

torch.set_num_threads(os.cpu_count() or 4)
tts = CV(model_dir=model_dir)
asr = FA(model='paraformer-zh', disable_update=True, log_level='ERROR')
fa = FA(model='fa-zh', disable_update=True, log_level='ERROR')
prompt_wav = os.path.join(cv_dir, 'asset/zero_shot_prompt.wav')
spoken = dict(nc.lines())[lid]
say = nc.SAY.get(lid, re.sub('["“”]', '', spoken))   # 和 narrate_cosy.py 一样：引号不念
ref = nc.cjk(say)
out = os.path.join(src, 'out', 'takes')
os.makedirs(out, exist_ok=True)
for seed in seeds:
    set_all_random_seed(seed)
    gen = tts.inference_zero_shot(say, f'{nc.SYS}<|endofprompt|>{nc.PROMPT_TEXT}', prompt_wav, stream=False, speed=nc.SPEED)
    wav = torch.cat([j['tts_speech'] for j in gen], dim=1)
    path = os.path.join(out, f'n_{lid}.s{seed}.wav')
    torchaudio.save(path, wav, tts.sample_rate)
    hyp = nc.cjk(asr.generate(input=path)[0]['text'])
    e = nc.cer(nc.syl(ref), nc.syl(hyp))
    r = fa.generate(input=(path, ' '.join(ref)), data_type=('sound', 'text'))[0]
    chars = [[c, a / 1000, b / 1000] for c, (a, b) in zip(r['text'].split(), r['timestamp'])]
    f0, t = pw.harvest(wav[0].numpy().astype(np.float64), tts.sample_rate, frame_period=10)
    info = [(c, np.round(f0[(t >= a) & (t <= b + .02) & (f0 > 0)]).astype(int).tolist()) for c, a, b in chars if c in ch]
    json.dump(dict(id=lid, say=say, chars=chars, asr=hyp, cer=round(e, 3), seed=seed, speed=nc.SPEED),
              open(path[:-4] + '.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'种子 {seed}：{wav.shape[1] / tts.sample_rate:.2f}s，说话 {chars[0][1]:.2f}~{chars[-1][2]:.2f}s，'
          f'读错率（按拼音）{e:.2f}  {hyp}  {info}', flush=True)
