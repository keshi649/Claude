"""旁白配音版：用 CosyVoice 3（Fun-CosyVoice3-0.5B-2512 的 RL 版，Apache-2.0）合成每句旁白，
再用 FunASR 把合成的声音转写回文字，检查有没有读错、漏读、多读（不对就换个随机种子重来），
最后用 FunASR 的时间戳模型（fa-zh）给每个字对上时间，字幕按真实的配音一段段出现。

输出：voice_cv3/n_<编号>.wav（24 kHz）和 n_<编号>.json（念的文字、每个字的起止时间、转写结果）。
narration.py --voice cv3 读这些文件排时间轴；audio.py --voice 把配音混进成片。

环境（CPU 就能跑，比较慢：每秒语音大约要算 4 秒）：
  git clone --recursive https://github.com/FunAudioLLM/CosyVoice.git
  uv venv -p python3.11 venv，装 CosyVoice 的依赖（torch 2.3.1 CPU 版）和 funasr
  模型：huggingface 上的 FunAudioLLM/Fun-CosyVoice3-0.5B-2512，把 llm.rl.pt 当 llm.pt 用
用法：venv/bin/python narrate_cosy.py CosyVoice目录 模型目录 [编号 ...]
"""
import ast
import json
import os
import re
import sys
import time
from difflib import SequenceMatcher

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'voice_cv3')
SPEED = 1.1          # 比模型默认稍快，接近短视频的语速（每秒 5 个字上下）
TRIES = 3
SYS = 'You are a helpful assistant.'
PROMPT_TEXT = '希望你以后能够做的比我还好呦。'   # CosyVoice 仓库自带的提示音（asset/zero_shot_prompt.wav）

# 念的时候和字幕不一样的地方：数字读成汉字；"睡着"标成 zháo，免得读成 zhe
SAY = {
    'h2': '全错！',
    'h3': '科学家给非洲和南美的三个部落戴上手环：他们天黑三个多小时才睡，一晚只睡六个多小时。',
    'h4': '可他们几乎不失眠：常失眠的只有百分之二左右，有两个部落的话里，连失眠这个词都没有。',
    'h5': '他们的秘密，藏在这根……',
    's1': '这事跟你有关：在中国，大约每七个人就有一个失眠，年轻人更多。',
    'a2': '人跟着降温睡[zh][áo]，在一天里最冷的时候醒来。',
    'l2': '研究者汇总了十几项研究：睡前一到两个小时，洗个四十度出头的热水澡，平均能早十分钟睡[zh][áo]。',
    'g2': '睡前一到两个小时，洗个热水澡，十分钟就够；',
}


def lines():
    src = open(os.path.join(HERE, 'narration.py'), encoding='utf-8').read()
    a = src.index('SCENES = ['); b = src.index('\n]\n', a) + 2
    for _, _, items, _ in ast.literal_eval(src[a + 9:b]):
        for it in items:
            if it[0] == 'N':
                yield it[1], re.sub(r'[|^{}/]', '', it[3])


def cjk(s):
    """只留汉字；拼音标注 [zh][áo] 还原成"着"之前先去掉"""
    s = re.sub(r'(\[[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]+\])+', '着', s)
    return ''.join(c for c in s if '一' <= c <= '鿿')


def cer(ref, hyp):
    sm = SequenceMatcher(a=ref, b=hyp, autojunk=False)
    same = sum(bl.size for bl in sm.get_matching_blocks())
    return 1 - same / max(1, len(ref)) + max(0, len(hyp) - same) / max(1, len(ref))


def main():
    cv_dir, model_dir = sys.argv[1], sys.argv[2]
    only = set(sys.argv[3:])
    sys.path[:0] = [cv_dir, os.path.join(cv_dir, 'third_party/Matcha-TTS')]
    import torch
    import torchaudio
    from cosyvoice.cli.cosyvoice import AutoModel as CV
    from cosyvoice.utils.common import set_all_random_seed
    from funasr import AutoModel as FA
    torch.set_num_threads(os.cpu_count() or 4)
    tts = CV(model_dir=model_dir)
    asr = FA(model='paraformer-zh', disable_update=True, log_level='ERROR')
    fa = FA(model='fa-zh', disable_update=True, log_level='ERROR')
    prompt_wav = os.path.join(cv_dir, 'asset/zero_shot_prompt.wav')
    os.makedirs(OUT, exist_ok=True)
    for lid, spoken in lines():
        if only and lid not in only:
            continue
        say = SAY.get(lid, spoken.replace('"', ''))
        ref = cjk(say)
        best = None
        for k in range(TRIES):
            seed = 1000 + k * 7919 + sum(map(ord, lid))
            set_all_random_seed(seed)
            t0 = time.time()
            gen = tts.inference_zero_shot(say, f'{SYS}<|endofprompt|>{PROMPT_TEXT}', prompt_wav, stream=False, speed=SPEED)
            wav = torch.cat([j['tts_speech'] for j in gen], dim=1)
            path = os.path.join(OUT, f'n_{lid}.try{k}.wav')
            torchaudio.save(path, wav, tts.sample_rate)
            hyp = cjk(asr.generate(input=path)[0]['text'])
            e = cer(ref, hyp)
            print(f'{lid} 第{k + 1}次 {wav.shape[1] / tts.sample_rate:.2f}s（算了 {time.time() - t0:.0f}s）错字率 {e:.2f}  {hyp}', flush=True)
            if best is None or e < best[0]:
                best = (e, k, path, hyp, seed)
            if e == 0:
                break
        e, k, path, hyp, seed = best
        final = os.path.join(OUT, f'n_{lid}.wav')
        os.replace(path, final)
        for j in range(TRIES):
            p = os.path.join(OUT, f'n_{lid}.try{j}.wav')
            if os.path.exists(p):
                os.remove(p)
        r = fa.generate(input=(final, ' '.join(ref)), data_type=('sound', 'text'))[0]
        chars = [[c, a / 1000, b / 1000] for c, (a, b) in zip(r['text'].split(), r['timestamp'])]
        with open(os.path.join(OUT, f'n_{lid}.json'), 'w', encoding='utf-8') as f:
            json.dump(dict(id=lid, say=say, chars=chars, asr=hyp, cer=round(e, 3), seed=seed, speed=SPEED), f, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
