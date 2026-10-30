"""核对嵌进网页的 mp3（裁过静音、调过响度、压缩过）：FunASR 再转写一遍，按拼音和屏幕上的字比，看有没有被裁掉字头字尾。
用法：/home/user/tts/venv/bin/python check_mp3.py
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from make_voice import LINES, cer, cjk, syl  # noqa: E402


def main():
    from funasr import AutoModel as FA
    asr = FA(model='paraformer-zh', disable_update=True, log_level='ERROR')
    bad = 0
    for lid, shown, say in LINES:
        p = os.path.join(HERE, 'mp3', lid + '.mp3')
        hyp = cjk(asr.generate(input=p)[0]['text'])
        e = cer(syl(cjk(shown)), syl(hyp))
        bad += e > 0
        print(f'{lid:10s} {shown:12s} 转写：{hyp:12s} 读错率（按拼音）{e:.2f}', flush=True)
    print('有出入的：', bad, '句')


if __name__ == '__main__':
    main()
