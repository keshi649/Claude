"""《原始人为什么不用拔智齿？》角色配音：只给对白气泡里的 7 句台词配音，字幕不配音。

台词和出现时间来自 subs.py 的 DIALOGUE（和 scenes*.js 里的 speech() 一一对应），每个角色一种声音。
合成好的语音缓存在 voice/，由 audio.py --voice 混进声音里。
用法：python3 voice.py            合成缺失或改过的台词
      python3 voice.py --force    全部重新合成
"""
import asyncio
import json
import os
import ssl
import sys

import edge_tts
import edge_tts.communicate as _comm

from subs import DIALOGUE

# 云端环境的出站 HTTPS 走代理，需要信任代理的 CA；本地运行时文件不存在就用默认
_CA = '/root/.ccr/ca-bundle.crt'
if os.path.exists(_CA):
    _comm._SSL_CTX = ssl.create_default_context(cafile=_CA)

HERE = os.path.dirname(os.path.abspath(__file__))
VDIR = os.path.join(HERE, 'voice')
VOICES = {
    '智齿': dict(voice='zh-CN-YunxiaNeural', rate='+0%', pitch='+0Hz'),      # 小男孩的声音，委屈巴巴
    '施工队': dict(voice='zh-CN-YunjianNeural', rate='-8%', pitch='-3Hz'),   # 闲得发慌的工人
    '病人': dict(voice='zh-CN-XiaoxiaoNeural', rate='-15%', pitch='+0Hz'),   # 捂着肿脸，说得慢
    '原始人': dict(voice='zh-CN-YunxiNeural', rate='-5%', pitch='-6Hz'),     # 递肉干，憨憨的
}
# 念的时候换字，免得读错音（字幕和气泡里照样写原字）：“长错”的“长”读 zhǎng
SAY = {'长错': '涨错'}
# 台词编号就是它跟着的那条字幕
LINES = [(k, who, text) for k, dt, who, text in DIALOGUE]


def spoken(text):
    for a, b in SAY.items():
        text = text.replace(a, b)
    return text


async def synth(lid, who, text):
    v = VOICES[who]
    await edge_tts.Communicate(spoken(text), v['voice'], rate=v['rate'], pitch=v['pitch']).save(
        os.path.join(VDIR, lid + '.mp3'))
    with open(os.path.join(VDIR, lid + '.json'), 'w', encoding='utf-8') as f:
        json.dump({'who': who, 'text': text, 'voice': v}, f, ensure_ascii=False)


def stale(lid, who, text):
    try:
        with open(os.path.join(VDIR, lid + '.json'), encoding='utf-8') as f:
            meta = json.load(f)
    except FileNotFoundError:
        return True
    return meta != {'who': who, 'text': text, 'voice': VOICES[who]} or not os.path.exists(os.path.join(VDIR, lid + '.mp3'))


async def main(force):
    os.makedirs(VDIR, exist_ok=True)
    for lid, who, text in LINES:
        if force or stale(lid, who, text):
            await synth(lid, who, text)
            print(f'合成 {lid}  {who}：{text}')
    print(f'{len(LINES)} 句台词 → {VDIR}')


if __name__ == '__main__':
    asyncio.run(main('--force' in sys.argv))
