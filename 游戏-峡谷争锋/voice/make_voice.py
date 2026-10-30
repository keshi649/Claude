"""游戏里的播报语音（"第一滴血""双杀"……）：CosyVoice 3（Fun-CosyVoice3-0.5B-2512 的 RL 版）女声合成，
用 instruct2 让她念得激动一点；合成后用 FunASR 转写回文字、按拼音（不带声调）和原文比，读错就换种子重来（最多 3 次），
三次都不行再退回普通零样本合成。每个字的起止时间用 fa-zh 对出来（tone_check.py 看声调要用）。

输出：voice_cv3/n_<编号>.wav（24 kHz）和 n_<编号>.json；pack.py 再裁掉首尾静音、统一响度、压成小 mp3 放进网页。
用法：/home/user/tts/venv/bin/python make_voice.py /home/user/tts/CosyVoice /home/user/tts/models/CV3-RL [编号 ...]
"""
import json
import os
import sys
import time
from difflib import SequenceMatcher

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'voice_cv3')
SPEED = 1.0
TRIES = 3
SYS = 'You are a helpful assistant.'
STYLE = 'You are a helpful assistant. 请用非常激动、充满气势的语气大声说。<|endofprompt|>'
PROMPT_TEXT = '希望你以后能够做的比我还好呦。'

# (编号, 屏幕上的字, 念的写法)。念的写法里多音字用拼音顶替："血" xuè
LINES = [
    ('welcome', '欢迎来到峡谷争锋', '欢迎来到峡谷争锋！'),
    ('five', '敌军还有五秒到达战场', '敌军还有五秒到达战场！'),
    ('go', '全军出击', '全军出击！'),
    ('first', '第一滴血', '第一滴[x][uè]！'),
    ('double', '双杀', '双杀！'),
    ('triple', '三杀', '三杀！'),
    ('quadra', '四杀', '四杀！'),
    ('penta', '五杀', '五杀！'),
    ('spree3', '大杀特杀', '大杀特杀！'),
    ('spree4', '主宰比赛', '主宰比赛！'),
    ('spree5', '杀人如麻', '杀人如麻！'),
    ('spree6', '无人能挡', '无人能挡！'),
    ('spree7', '横扫千军', '横扫千军！'),
    ('legend', '超神了', '超神了！'),
    ('shut', '终结', '终结！'),
    ('ace', '团灭', '团灭！'),
    ('youkill', '你击败了一个敌人', '你击败了一个敌人！'),
    ('youdie', '你被击败了', '你被击败了。'),
    ('towerKill', '摧毁一座敌方防御塔', '摧毁一座敌方防御塔！'),
    ('towerLost', '我方防御塔被摧毁了', '我方防御塔被摧毁了！'),
    ('crystal', '我方水晶正在遭受攻击', '我方水晶正在遭受攻击！'),
    ('win', '胜利', '胜利！'),
    ('lose', '失败', '失败。'),
    ('lordB', '我方击败了大龙', '我方击败了大龙！'),
    ('lordR', '敌方击败了大龙', '敌方击败了大龙！'),
    ('drakeB', '我方击败了小龙', '我方击败了小龙！'),
    ('drakeR', '敌方击败了小龙', '敌方击败了小龙！'),
    ('lordUp', '大龙出现了', '大龙出现了！'),
    ('drakeUp', '小龙出现了', '小龙出现了！'),
]
PINYIN = {'[x][uè]': '血', '[h][ái]': '还', '[sh][ā]': '杀'}


def cjk(s):
    for k, v in PINYIN.items():
        s = s.replace(k, v)
    return ''.join(c for c in s if '一' <= c <= '鿿')


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
    for lid, shown, say in LINES:
        if only and lid not in only:
            continue
        ref = cjk(say)
        best = None
        plan = [('instruct', k) for k in range(TRIES)] + [('zero', k) for k in range(2)]
        for mode, k in plan:
            seed = 2000 + k * 7919 + sum(map(ord, lid)) + (0 if mode == 'instruct' else 555)
            set_all_random_seed(seed)
            t0 = time.time()
            if mode == 'instruct':
                gen = tts.inference_instruct2(say, STYLE, prompt_wav, stream=False, speed=SPEED)
            else:
                gen = tts.inference_zero_shot(say, f'{SYS}<|endofprompt|>{PROMPT_TEXT}', prompt_wav, stream=False, speed=1.05)
            wav = torch.cat([j['tts_speech'] for j in gen], dim=1)
            path = os.path.join(OUT, f'n_{lid}.{mode}{k}.wav')
            torchaudio.save(path, wav, tts.sample_rate)
            hyp = cjk(asr.generate(input=path)[0]['text'])
            e = cer(syl(ref), syl(hyp))
            print(f'{lid} {mode}{k} {wav.shape[1] / tts.sample_rate:.2f}s（算了 {time.time() - t0:.0f}s）读错率（按拼音）{e:.2f}  {hyp}', flush=True)
            if best is None or e < best[0]:
                best = (e, mode, k, path, hyp, seed)
            if e == 0:
                break
        e, mode, k, path, hyp, seed = best
        final = os.path.join(OUT, f'n_{lid}.wav')
        os.replace(path, final)
        for f in os.listdir(OUT):
            if f.startswith(f'n_{lid}.') and f.endswith('.wav') and f != f'n_{lid}.wav':
                os.remove(os.path.join(OUT, f))
        r = fa.generate(input=(final, ' '.join(ref)), data_type=('sound', 'text'))[0]
        chars = [[c, a / 1000, b / 1000] for c, (a, b) in zip(r['text'].split(), r['timestamp'])]
        with open(os.path.join(OUT, f'n_{lid}.json'), 'w', encoding='utf-8') as f:
            json.dump(dict(id=lid, shown=shown, say=say, mode=mode, chars=chars, asr=hyp, cer=round(e, 3), seed=seed), f, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
