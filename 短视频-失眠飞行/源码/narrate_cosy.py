"""画外音配音：这支 MV 里只有两句话要配——开头的大字"凌晨三点，你也还没睡吗？"（放在前奏里、人声开口之前），
和结尾的问话"你失眠的时候，在想谁？"（歌唱完以后）。用 CosyVoice 3（Fun-CosyVoice3-0.5B-2512 的 RL 版，Apache-2.0）合成女声，
再用 FunASR 转写回来按拼音核对（不对就换随机种子重来），最后用 FunASR 的时间戳模型给每个字对上时间。
输出：voice_cv3/n_<编号>.wav（24 kHz）和 n_<编号>.json（念的文字、每个字的起止时间、转写结果）；mix.py 把它们混进成片。
环境见 ../../工具/setup_tts.sh。
用法：/home/user/tts/venv/bin/python narrate_cosy.py /home/user/tts/CosyVoice /home/user/tts/models/CV3-RL [编号 ...]"""
import json
import os
import sys
import time
from difflib import SequenceMatcher

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'voice_cv3')
SPEED = 0.95         # 比平时的旁白慢一点、轻一点：深夜说悄悄话的感觉
TRIES = 3
SYS = 'You are a helpful assistant.'
PROMPT_TEXT = '希望你以后能够做的比我还好呦。'   # CosyVoice 仓库自带的提示音（asset/zero_shot_prompt.wav）
LINES = {
    'h1': '凌晨三点，你也还没睡吗？',
    'e1': '你失眠的时候，在想谁？',
}


def cjk(s): return ''.join(c for c in s if '一' <= c <= '鿿')


def syl(s):
    from pypinyin import lazy_pinyin
    return lazy_pinyin(s)


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
    for lid, say in LINES.items():
        if only and lid not in only:
            continue
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
            e = cer(syl(ref), syl(hyp))
            print(f'{lid} 第{k + 1}次 {wav.shape[1] / tts.sample_rate:.2f}s（算了 {time.time() - t0:.0f}s）读错率（按拼音）{e:.2f}  {hyp}', flush=True)
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
