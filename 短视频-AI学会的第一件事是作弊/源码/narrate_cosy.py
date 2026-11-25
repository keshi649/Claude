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
# 一只的"只" zhī、长出来的"长" zhǎng、只差一步的"差" chà、一行的"行" háng、好奇心的"好" hào。
# OpenAI 连着写会念成"open-eye"（转写成"open night"），中间空一格念成 Open A I
SAY = {
    'h1': 'AI的分数，是我的三倍多。',
    'h4': '我训练了一[zh][ī]AI小怪，一千局。它学会的第一件事，是作弊。',
    's1': '第一局，它什么都不会。我只给了它一张记分表：',
    's2': '吃到金币，加一分；跑到终点，加十分。',
    'l1': '第二十局，它第一次绕着池塘，跑完了一整圈。',
    'l2': '这里的金币吃掉以后，过一会儿又[zh][ǎng]出来。',
    'l5': '二零一六年，Open AI 的赛艇AI，也这样绕圈刷分，分数比人类还高。',
    'p1': '我改了规则：金币全撤了。再帮它一把：往终点走一步，加一分。',
    'p2': '这回它往终点跑了，一直跑到，离终点只[ch][à]一步——',
    'p4': '往前一步加一分，退后一步不扣分；进了终点，游戏就结束，不进去，分数一直涨。',
    'j2': '新任务：把球拿起来。看着像拿到了，就给十分。',
    'j3': '从第七百二十八局起，它局局满分。',
    'j7': '二零一七年，Open AI 的一[zh][ī]虚拟机械手，也这样骗过了人类评委。',
    'r2': '二零二五年，Open AI 训练一个很强的AI修代码，测试通过就给分。',
    'f1': '第八百零一局，我让它从头学，记分表只留一[h][áng]：跑到终点。',
    'f2': '可它从没去过终点，整整五十局，一次都没碰上。',
    'f3': '我又给了它一点[h][ào]奇心：没去过的地方，先当它是好地方。',
    'f4': '只过了四局，它就跑到了终点。',
    'g1': '给AI，也给你自己定目标，先问三句：',
    'z1': 'AI没有学坏。它只是，太听话了。',
}
PINYIN = {'[zh][òng]': '种', '[zh][áo]': '着', '[j][ué]': '角', '[q][iào]': '翘', '[t][iáo]': '调', '[x][ìng]': '兴', '[k][òng]': '空', '[g][ū]': '估',
          '[sh][àn]': '扇', '[j][iáo]': '嚼', '[y][àn]': '咽', '[s][è]': '塞',
          '[zh][ī]': '只', '[zh][ǎng]': '长', '[ch][à]': '差', '[h][áng]': '行', '[h][ào]': '好'}      # 拼音标注 → 原来的字（转写核对时换回去）


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
