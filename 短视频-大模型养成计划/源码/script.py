"""《大模型养成计划》台词稿 + 时间轴。

本片有配音：旁白、「你」、「小模」三个声音，全部用离线 TTS（Kokoro v1.1-zh，经 sherpa-onnx）生成。
时间轴由配音的实际长度决定：先合成每一句，量出时长，再排出每一幕、每一句的起止时间。

用法：python3 script.py      合成配音到 out/voice/，写出 timeline.js（给画面）和 timeline.json（给声音）

每一幕：(幕名, 开场留白秒数, [台词…], 收尾留白秒数)
每句台词：(编号, 说话人, 字幕, 配音文本或 None, 句后停顿秒数)
  - 说话人 N 旁白（字幕在底部），U 你、M 小模（台词显示在画面里的对话框，不进底部字幕）
  - 字幕里的 {…} 是高亮
  - 配音文本为 None 时直接读字幕（去掉花括号）；为 '' 时不配音，第五项改成显示秒数
"""
import hashlib
import json
import os
import re
import sys

import numpy as np

SPEAKERS = {          # sid, TTS 语速, 升调（半音）
    'N': (3, 1.12, 0.0),
    'U': (58, 1.10, 0.0),
    'M': (20, 0.95, 3.0),
}
GAP = 0.22            # 默认句后停顿

SCENES = [
    ('hook', 0.6, [
        ('h1', 'N', '早几年，你要是问 AI 这么一句：', None, 0.2),
        ('h2', 'U', '林黛玉倒拔垂杨柳，是怎么回事？', None, 0.4),
        ('h3', 'M', '这是《红楼梦》中的经典情节！林黛玉虽然体弱多病，却在一次……', '这是红楼梦里的经典情节！林黛玉虽然体弱多病，却在一次', 0.2),
        ('h4', 'N', '它真能一本正经地，给你编出{一整段}。', None, 0.35),
        ('h5', 'N', '它在骗你吗？不是。', None, 0.25),
        ('h6', 'N', '它只是，被{养}成了这样。', None, 0.3),
        ('h7', 'N', '今天，我们就亲手{养一只 AI}。', '今天，我们就亲手养一只AI。', 0.1),
    ], 0.2),
    ('title', 0.0, [], 3.6),
    ('birth', 0.9, [
        ('b1', 'N', '刚出生的模型，脑子里是上千亿个{随机数}。', None, 0.3),
        ('b2', 'U', '你好呀！', None, 0.3),
        ('b3', 'M', '鿏㗊锟斤拷烫烫烫屯屯屯', '', 2.4),
        ('b4', 'N', '跟{猫踩键盘}，差不多。', None, 0.2),
    ], 1.2),
    ('pretrain', 0.7, [
        ('p1', 'N', '第一课叫{预训练}。规则只有一条：', None, 0.15),
        ('p2', 'N', '{猜下一个字}。', None, 0.45),
        ('p3', 'N', '床前明月——', None, 0.35),
        ('p4', 'M', '床前明月饼？', None, 0.6),
        ('p5', 'N', '猜错了，就{挨罚}，把参数调一调。', None, 0.4),
        ('p6', 'M', '床前明月光！', None, 0.45),
        ('p7', 'N', '猜对了，就{奖励}。', None, 0.4),
        ('p8', 'N', '然后，把整个{互联网}喂给它。', None, 0.2),
        ('p9', 'N', '百科、小说、论文、代码，还有{贴吧}和{评论区}。', None, 0.25),
        ('p10', 'N', '十几万亿个 token，一个人不吃不睡，得读上{好几万年}。', '十几万亿个token，一个人不吃不睡，得读上好几万年。', 0.25),
        ('p11', 'N', '成千上万张{显卡}，没日没夜，跑上几十天。', None, 0.3),
        ('p12', 'N', '顺便，它还学会了——', None, 0.15),
        ('p13', 'M', '家人们谁懂啊！', None, 0.5),
    ], 0.3),
    ('base', 0.6, [
        ('q1', 'N', '读完之后，它成了一个{基座模型}。', None, 0.3),
        ('q2', 'U', '今天天气怎么样？', None, 0.3),
        ('q3', 'M', '明天天气怎么样？后天天气怎么样？大后天……', None, 0.3),
        ('q4', 'N', '它不是在答题，是在{接龙}。', None, 0.2),
    ], 0.5),
    ('token', 0.9, [
        ('k1', 'N', '插一句：它看到的其实不是字，是 {token}。', '插一句：它看到的其实不是字，是token。', 0.2),
        ('k2', 'N', '一个词，会被切成{好几块}。', None, 0.4),
        ('k3', 'U', 'strawberry 里有几个 r？', 'strawberry里有几个r？', 0.25),
        ('k4', 'M', '有两个！', None, 0.4),
        ('k5', 'N', '不少模型，都{栽过}这道题。', None, 0.4),
        ('k6', 'U', '9.11 和 9.9，哪个大？', '九点一一和九点九，哪个大？', 0.25),
        ('k7', 'M', '9.11 更大！', '九点一一更大！', 0.4),
        ('k8', 'N', '毕竟在版本号和日期里，9.11 确实排在 9.9 {后面}。', '毕竟在版本号和日期里，九点一一确实排在九点九后面。', 0.2),
    ], 0.5),
    ('sft', 0.8, [
        ('s1', 'N', '第二课叫{微调}，相当于上岗培训。', None, 0.2),
        ('s2', 'N', '给它看成千上万份{标准问答}，告诉它：', None, 0.15),
        ('s3', 'N', '别接龙了，你现在是个{助手}。', None, 0.3),
        ('s4', 'N', '它学得很快，还学会了一句{经典台词}：', None, 0.2),
        ('s5', 'M', '作为一个 AI 语言模型……', '作为一个AI语言模型', 0.6),
    ], 0.3),
    ('rlhf', 0.8, [
        ('r1', 'N', '第三课，让{人类打分}。', None, 0.2),
        ('r2', 'N', '同一个问题答两遍，人挑{更好}的那个。', None, 0.3),
        ('r3', 'N', '可是人类，都爱听{好话}。', None, 0.3),
        ('r4', 'U', '我觉得，一加一等于三。', None, 0.25),
        ('r5', 'M', '您说得太对了！这是我听过最有创意的数学！', None, 0.4),
        ('r6', 'N', '这毛病，叫{谄媚}。', None, 0.2),
        ('r7', 'N', '2025 年，真有一次模型更新，因为太会{拍马屁}，被紧急撤回。', '二零二五年，真有一次模型更新，因为太会拍马屁，被紧急撤回。', 0.2),
    ], 0.5),
    ('halluc', 0.8, [
        ('x1', 'N', '现在回到林黛玉。打开它的{脑子}看看。', None, 0.3),
        ('x2', 'N', '它见过{林黛玉}，也见过{倒拔垂杨柳}。', None, 0.25),
        ('x3', 'N', '它的本能，是把话{接下去}，接得越像真的越好。', None, 0.25),
        ('x4', 'N', '可它脑子里，没有一个{查证}按钮。', None, 0.3),
        ('x5', 'N', '训练时还像考试：{蒙一个}可能得分，{交白卷}一定零分。', None, 0.3),
        ('x6', 'N', '一本正经地胡说八道，就这么来了。它叫{幻觉}。', None, 0.2),
    ], 0.5),
    ('fix', 0.7, [
        ('f1', 'N', '后来，人们给它配上{搜索}，让它先查再答，', None, 0.1),
        ('f2', 'N', '还专门教它说：{我不确定}。', None, 0.35),
        ('f3', 'U', '林黛玉倒拔垂杨柳，是怎么回事？', None, 0.3),
        ('f4', 'M', '倒拔垂杨柳的是鲁智深，出自《水浒传》。林黛玉拔不动。', '倒拔垂杨柳的是鲁智深，出自水浒传。林黛玉拔不动。', 0.3),
        ('f5', 'N', '林黛玉，终于{不拔树}了。', None, 0.2),
    ], 0.6),
    ('grads', 0.8, [
        ('g1', 'N', '你用的每一个 AI，都是这么{长大}的。', '你用的每一个AI，都是这么长大的。', 0.6),
        ('g2', 'N', '读差不多的书，上差不多的{三堂课}。', None, 0.6),
        ('g3', 'N', '只是老师不同，养出的{脾气}也不同。', None, 0.2),
    ], 2.6),
    ('end', 0.6, [
        ('e1', 'N', '所以下次 AI 胡说八道，先别急着{生气}。', '所以下次AI胡说八道，先别急着生气。', 0.25),
        ('e2', 'N', '它只是读了太多书，又太想把话{接下去}了。', None, 0.8),
        ('e3', 'N', '以上内容由 AI 生成，仅供参考。', '以上内容由AI生成，仅供参考。', 0.2),
    ], 2.6),
]

# 音效与画面共用的提示点：(名字, 锚定的台词或幕, 相对偏移秒, 音效类型)
#   锚点写 'h2' 表示该句开始，'h2>' 表示该句结束，'@title' 表示幕开始
CUES = [
    ('send_h2', 'h2', 0.0, 'send'),
    ('recv_h3', 'h3', 0.0, 'recv'),
    ('stamp_h4', 'h4>', -0.2, 'stamp'),
    ('start', '@title', 2.0, 'start'),
    ('hatch', '@birth', 0.3, 'hatch'),
    ('send_b2', 'b2', 0.0, 'send'),
    ('garble', 'b3', 0.0, 'garble'),
    ('cat', 'b4', -0.2, 'meow'),
    ('quiz', 'p3', 0.0, 'quiz'),
    ('wrong', 'p4>', 0.05, 'wrong'),
    ('right', 'p6>', 0.05, 'right'),
    ('books', 'p8', 0.4, 'whoosh'),
    ('counter', 'p10', 0.0, 'counter'),
    ('fire', 'p11', 0.6, 'fire'),
    ('meme', 'p13', 0.0, 'pop'),
    ('send_q2', 'q2', 0.0, 'send'),
    ('recv_q3', 'q3', 0.0, 'recv'),
    ('quest', '@token', 0.2, 'quest'),
    ('chop', 'k2', 0.4, 'chop'),
    ('wrong_k4', 'k4>', 0.05, 'wrong'),
    ('wrong_k7', 'k7>', 0.05, 'wrong'),
    ('bell', '@sft', 0.3, 'bell'),
    ('levelup_s3', 's3>', 0.0, 'levelup'),
    ('ding_s5', 's5', 0.0, 'ding'),
    ('show', '@rlhf', 0.3, 'show'),
    ('vote', 'r2', 1.2, 'coin'),
    ('clap', 'r5>', -0.3, 'clap'),
    ('alarm', 'r7', 1.2, 'alarm'),
    ('debug', '@halluc', 0.1, 'glitch'),
    ('stamp_x6', 'x6', 2.2, 'stamp'),
    ('search', 'f1', 0.8, 'ding'),
    ('send_f3', 'f3', 0.0, 'send'),
    ('recv_f4', 'f4', 0.0, 'recv'),
    ('levelup_f5', 'f5', 0.1, 'levelup'),
    ('fanfare', '@grads', 0.2, 'fanfare'),
    ('stamp_e3', 'e3', 0.5, 'stamp'),
]

ROOT = os.path.dirname(os.path.abspath(__file__))
VOICE_DIR = os.path.join(ROOT, 'out', 'voice')
_tts = None


def plain(s):
    return re.sub(r'[{}]', '', s)


def tts():
    global _tts
    if _tts is None:
        import sherpa_onnx
        d = os.environ.get('KOKORO', os.path.join(ROOT, 'kokoro'))
        cfg = sherpa_onnx.OfflineTtsConfig(
            model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
                model=f'{d}/model.onnx', voices=f'{d}/voices.bin', tokens=f'{d}/tokens.txt',
                data_dir=f'{d}/espeak-ng-data', dict_dir=f'{d}/dict',
                lexicon=f'{d}/lexicon-us-en.txt,{d}/lexicon-zh.txt'), num_threads=4),
            rule_fsts=f'{d}/date-zh.fst,{d}/phone-zh.fst,{d}/number-zh.fst', max_num_sentences=1)
        _tts = sherpa_onnx.OfflineTts(cfg)
    return _tts


def trim(a, sr, thr=0.012):
    """去掉首尾静音，各留 30ms。"""
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0:
        return a
    pad = int(sr * 0.03)
    return a[max(0, idx[0] - pad): idx[-1] + pad]


def pitch_up(a, semis):
    """升调：直接重采样，音调变高、语速同比变快（所以「小模」的 TTS 语速设得慢一些）。"""
    if semis == 0:
        return a
    from scipy.signal import resample_poly
    r = 2 ** (semis / 12)
    return resample_poly(a, 1000, int(round(1000 * r)))


def voice(spk, text):
    """合成一句并缓存；返回 (文件名, 秒数)。"""
    sid, speed, semis = SPEAKERS[spk]
    key = hashlib.md5(f'{spk}|{sid}|{speed}|{semis}|{text}'.encode()).hexdigest()[:12]
    fn = f'{key}.wav'
    path = os.path.join(VOICE_DIR, fn)
    import soundfile as sf
    if not os.path.exists(path):
        a = tts().generate(text, sid=sid, speed=speed)
        x = np.array(a.samples, dtype=np.float32)
        x = trim(x, a.sample_rate)
        x = pitch_up(x, semis).astype(np.float32)
        sf.write(path, x, a.sample_rate)
    info = sf.info(path)
    return fn, info.frames / info.samplerate


def build():
    os.makedirs(VOICE_DIR, exist_ok=True)
    t = 0.0
    scenes, lines = [], []
    for name, lead, items, tail in SCENES:
        t0 = t
        t += lead
        for lid, spk, sub, vt, pause in items:
            if vt == '':
                dur, fn = pause, None
                pause = GAP
            else:
                fn, dur = voice(spk, vt if vt is not None else plain(sub))
            lines.append({'id': lid, 'spk': spk, 'text': sub, 'scene': name,
                          't0': round(t, 3), 't1': round(t + dur, 3), 'voice': fn})
            t += dur + (pause if pause is not None else GAP)
        t += tail
        scenes.append({'name': name, 't0': round(t0, 3), 't1': round(t, 3)})
        print(f'{name:9s} {t0:7.2f} → {t:7.2f}  ({t - t0:5.2f}s)')
    L = {l['id']: l for l in lines}
    S = {s['name']: s for s in scenes}
    cues = []
    for cname, anchor, off, kind in CUES:
        if anchor.startswith('@'):
            base = S[anchor[1:]]['t0']
        elif anchor.endswith('>'):
            base = L[anchor[:-1]]['t1']
        else:
            base = L[anchor]['t0']
        cues.append({'name': cname, 't': round(base + off, 3), 'kind': kind})
    tl = {'duration': round(t, 3), 'scenes': scenes, 'lines': lines, 'cues': cues}
    with open(os.path.join(ROOT, 'timeline.json'), 'w') as f:
        json.dump(tl, f, ensure_ascii=False, indent=1)
    with open(os.path.join(ROOT, 'timeline.js'), 'w') as f:
        f.write('window.TIMELINE = ' + json.dumps(tl, ensure_ascii=False) + ';\n')
    print(f'总时长 {t:.2f}s，{len(lines)} 句')


if __name__ == '__main__':
    build()
