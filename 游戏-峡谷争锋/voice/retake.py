"""短播报（"四杀""五杀"这种两个字的）重录：每句合成几版（两种语气 × 几个种子），
转写核对 + 看最后一个字的音高走向（"杀"是一声，要平或者往下落，往上扬听着像问句"五啥？"），挑最好的一版换掉 voice_cv3/ 里的。
用法：/home/user/tts/venv/bin/python retake.py CosyVoice目录 模型目录 编号 [编号 ...]
"""
import json
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from make_voice import LINES, OUT, PROMPT_TEXT, SYS, cer, cjk, syl  # noqa: E402

STYLES = [
    'You are a helpful assistant. 请用坚定有力、斩钉截铁的语气大声说。<|endofprompt|>',
    'You are a helpful assistant. 请用非常激动、充满气势的语气大声说。<|endofprompt|>',
]
SEEDS = 4
# 几个字的短句容易被念成别的音："五杀！"三次被听成"五少""五上"，换几种写法试（拼音直接顶替那个字）
ALT = {'penta': ['五[sh][ā]！', '五杀。', '五[sh][ā]！五[sh][ā]！'], 'quadra': ['四[sh][ā]！', '四杀！']}


def last_slope(wav_path, chars):
    import pyworld as pw
    import soundfile as sf
    x, sr = sf.read(wav_path)
    x = x.astype(np.float64)
    f0, t = pw.harvest(x, sr, frame_period=10)
    c, a, b = chars[-1]
    a2 = a + (b - a) * 0.3
    sel = (t >= a2) & (t <= b) & (f0 > 120)
    v = f0[sel]
    if len(v) < 4:
        return None, None
    k = np.polyfit(np.arange(len(v)) * 0.01, v, 1)[0]
    return float(k), float(np.median(v))


def main():
    cv_dir, model_dir = sys.argv[1], sys.argv[2]
    ids = sys.argv[3:]
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
    for lid in ids:
        _, shown, say0 = next(l for l in LINES if l[0] == lid)
        cands = []
        for say in ALT.get(lid, [say0]):
          ref = cjk(say)
          for si, style in enumerate(STYLES):
            for k in range(SEEDS if lid not in ALT else 3):
                seed = 7000 + si * 101 + k * 7919 + sum(map(ord, lid))
                set_all_random_seed(seed)
                gen = tts.inference_instruct2(say, style, prompt_wav, stream=False, speed=1.0)
                wav = torch.cat([j['tts_speech'] for j in gen], dim=1)
                path = os.path.join(OUT, f'n_{lid}.take{len(cands)}.wav')
                torchaudio.save(path, wav, tts.sample_rate)
                hyp = cjk(asr.generate(input=path)[0]['text'])
                e = cer(syl(ref), syl(hyp))
                r = fa.generate(input=(path, ' '.join(ref)), data_type=('sound', 'text'))[0]
                chars = [[c, a / 1000, b / 1000] for c, (a, b) in zip(r['text'].split(), r['timestamp'])]
                slope, med = last_slope(path, chars)
                print(f'{lid} 语气{si} 种子{k} {wav.shape[1] / tts.sample_rate:.2f}s 读错率{e:.2f} {hyp} 最后一个字音高斜率 {slope if slope is None else round(slope)} Hz/s 中位 {med if med is None else round(med)}', flush=True)
                cands.append(dict(path=path, e=e, slope=slope, med=med, chars=chars, hyp=hyp, seed=seed, style=si, say=say))
        ok = [c for c in cands if c['e'] == 0 and c['slope'] is not None]
        # 平或者往下落（斜率 ≤ 0）里挑最平稳的；都往上扬就挑扬得最少的
        # 念两遍的写法（屏幕上只写一遍）最后才用
        ok.sort(key=lambda c: (c['say'].count('！') > 1, c['slope'] > 150, abs(c['slope']) if c['slope'] <= 150 else c['slope']))
        if not ok:
            print(lid, '没有合格的版本，保留原来的')
        else:
            best = ok[0]
            final = os.path.join(OUT, f'n_{lid}.wav')
            os.replace(best['path'], final)
            with open(os.path.join(OUT, f'n_{lid}.json'), 'w', encoding='utf-8') as f:
                json.dump(dict(id=lid, shown=shown, say=best['say'], mode='instruct-retake', style=best['style'], chars=best['chars'], asr=best['hyp'], cer=0, seed=best['seed'],
                               last_slope=round(best['slope']), last_median=round(best['med'])), f, ensure_ascii=False, indent=1)
            print(lid, '选了', best['seed'], '语气', best['style'], '斜率', round(best['slope']))
        for c in cands:
            if os.path.exists(c['path']):
                os.remove(c['path'])


if __name__ == '__main__':
    main()
