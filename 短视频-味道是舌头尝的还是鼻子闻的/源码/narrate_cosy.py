"""旁白配音：用 CosyVoice 3（Fun-CosyVoice3-0.5B-2512 的 RL 版，Apache-2.0）合成每句旁白，
再用 FunASR 把合成的声音转写回文字，检查有没有读错、漏读、多读（不对就换个随机种子重来），
最后用 FunASR 的时间戳模型（fa-zh）给每个字对上时间，字幕按真实的配音一段段出现。
比对按拼音（不带声调）来：它 / 他、补 / 捕这类同音字，转写模型分不出来，不算读错。

输出：voice_cv3/n_<编号>.wav（24 kHz）和 n_<编号>.json（念的文字、每个字的起止时间、转写结果）。
narration.py 读这些文件排时间轴；audio.py 把配音混进成片。

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

# 念的时候和字幕不一样的地方：数字读成汉字；容易念错的多音字用拼音标出来（拼音直接顶替那个字）：
# 两扇门的"扇" shàn、调色的"调" tiáo、嚼 jiáo、咽 yàn（咽下去）、鼻塞的"塞" sè
SAY = {
    'h5': '因为鼻子有两[sh][àn]门，你只知道其中一[sh][àn]。',
    's3': '舌头像一盒只有五种颜色的颜料；鼻子里有约四百种气味受体，[t][iáo]得出千百种味道。',
    's5': '你一[j][iáo]、一[y][àn]，香气就从嘴里往上，走后门钻进鼻子。',
    'n1': '所以感冒鼻[s][è]时，吃什么都没味：舌头好好的，是后门堵了。',
    'g2': '慢慢[j][iáo]，给香气留时间走后门；',
}
PINYIN = {'[zh][òng]': '种', '[zh][áo]': '着', '[j][ué]': '角', '[q][iào]': '翘', '[t][iáo]': '调', '[x][ìng]': '兴', '[k][òng]': '空', '[g][ū]': '估',
          '[sh][àn]': '扇', '[j][iáo]': '嚼', '[y][àn]': '咽', '[s][è]': '塞'}      # 拼音标注 → 原来的字（转写核对时换回去）


def lines():
    src = open(os.path.join(HERE, 'narration.py'), encoding='utf-8').read()
    a = src.index('SCENES = ['); b = src.index('\n]\n', a) + 2
    for _, _, items, _ in ast.literal_eval(src[a + 9:b]):
        for it in items:
            if it[0] == 'N':
                yield it[1], re.sub(r'[|^{}/]', '', it[3])


def cjk(s):
    """只留汉字；拼音标注先换回原来的字"""
    for k, v in PINYIN.items():
        s = s.replace(k, v)
    return ''.join(c for c in s if '一' <= c <= '鿿')


def syl(s):
    """念出来的音节（不带声调）"""
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
    for lid, spoken in lines():
        if only and lid not in only:
            continue
        say = SAY.get(lid, re.sub('["“”]', '', spoken))
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
