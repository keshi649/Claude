"""歌词逐字对时间 → lyrics.js
做法：Demucs 分出来的人声轨 + MMS 强制对齐（torchaudio 的 MMS_FA；汉字转成不带声调的拼音，按字母对齐）。
- 主歌 A、主歌 B、桥段：整段对齐（块的边界放在人声的空隙里）。主歌各唱了两遍，两遍分别对齐，
  按小节平移到一起后取平均（两遍差 0.12 秒以上的字取得分高的那遍），再放回两处。
- 副歌唱了三遍、节奏一样：每一句按"这句的强拍前 1.45 秒到两小节后"开窗单独对齐，三遍取中位数。
- 间奏里的"我想和你"：在第 26、30、58、62、66 小节强拍前，节奏和副歌开头的"我想和你"一样，直接套用。
歌词行和时间的锚点来自抖音原视频画面上的歌词（LRC，比实际开口早约 0.5 秒）。
依赖：torch、torchaudio、pypinyin、soundfile（见 README）。人声轨先由 analyze.py 分离到 audio/stems/vocals.wav。
用法：python3 align.py      （写 lyrics.js 和 out/align.json）"""
import json
import numpy as np, soundfile as sf, torch, torchaudio
from pypinyin import lazy_pinyin, Style

BPM, BEAT0 = 94.995, 0.178          # 和 analyze.py 算出来的一致
BAR = 4 * 60 / BPM
bar = lambda n: BEAT0 + n * BAR

A = ['想要和你低空飞行', '和你到处收集氧气', '假如迷雾你看不清', '不如坠入我的心里',
     '想带你从吵闹到安宁', '想带你从多云到转晴', '想要为你整理衬衣', '为你到处收集诗句']
B = ['又过了每晚给你热牛奶的时间', '床头还写着我们没看完的影片', '离开后的时间里你是否还失眠',
     '从不熬夜的我也明显黑了眼圈', '你送的玩偶依然陪在身边', '记忆逐渐浮现从开始到终点 又重演']
CH = ['我想和你 一起闯进森林潜入海底', '我想和你 一起看日出到日落天气',
      '我想和你穿过格林威治和时间飞行', '我想见你 穿过教堂和人海拥抱你']
BR = ['再路过那家咖啡店', '熟悉又陌生的地点', '驻足希望你的身影会出现',
      '还没说出口的抱歉', '曾和你约定的诺言', '抬头闭眼让泪流进心里面']
POST = '我想和你'

SR = 16000
wav, sr = sf.read('audio/stems/vocals.wav', dtype='float32')
if wav.ndim > 1: wav = wav.mean(1)
wav = torchaudio.functional.resample(torch.from_numpy(wav), sr, SR)
bundle = torchaudio.pipelines.MMS_FA
model = bundle.get_model(with_star=False).eval()
tokenizer, aligner = bundle.get_tokenizer(), bundle.get_aligner()

def chars_of(line): return [c for c in line if c.strip()]

def align(a, b, lines):
    """把 lines（若干句）对齐到 [a, b] 秒的人声上，返回每句每个字的 (开始, 结束, 得分)"""
    seg = wav[int(a * SR):int(b * SR)].unsqueeze(0)
    seg = seg / (seg.abs().max() + 1e-6) * .8
    with torch.inference_mode():
        em, _ = model(seg)
    words, owner = [], []
    for li, s in enumerate(lines):
        cs = chars_of(s)
        py = lazy_pinyin(''.join(cs), style=Style.NORMAL)
        assert len(py) == len(cs), (s, py)
        words += py; owner += [li] * len(cs)
    spans = aligner(em[0], tokenizer(words))
    ratio = seg.size(1) / em.size(1) / SR
    out = [[] for _ in lines]
    for li, sp in zip(owner, spans):
        out[li].append((a + sp[0].start * ratio, a + sp[-1].end * ratio, float(np.mean([x.score for x in sp]))))
    return out

def merge_twice(r1, r2, shift):
    """同一段唱了两遍（第二遍晚 shift 秒）：逐字合并，返回第一遍的时间"""
    res = []
    for l1, l2 in zip(r1, r2):
        line = []
        for (a0, a1, sa), (b0, b1, sb) in zip(l1, l2):
            b0 -= shift; b1 -= shift
            if abs(a0 - b0) <= .12: line.append(((a0 + b0) / 2, (a1 + b1) / 2))
            else: line.append((a0, a1) if sa >= sb else (b0, b1))
        res.append(line)
    return res

SHIFT2 = 32 * BAR                    # 第二遍主歌比第一遍晚 32 小节
# 主歌 A：第 2~10 小节、第 34~42 小节
A1 = align(3.0, 25.2, A); A2 = align(85.0, 105.8, A)
VA = merge_twice(A1, A2, SHIFT2)
# 主歌 B：第 10~18 小节、第 42~50 小节（后面紧接副歌，块的结尾放在副歌开口之前）
B1 = align(25.2, 44.6, B); B2 = align(105.8, 125.4, B)
VB = merge_twice(B1, B2, SHIFT2)
# 桥段：前三句、后三句分开对齐
BRr = align(166.9, 177.4, BR[:3]) + align(177.4, 186.0, BR[3:])

# 副歌：每句两小节，开头的"我想和你"是强拍前的弱起
CH_BARS = {'C1': 18, 'C2': 50, 'C3': 74}
rel = []
for k, s in enumerate(CH):
    per = []
    for inst, b0 in CH_BARS.items():
        bb = bar(b0 + 2 * k)
        r = align(bb - 1.45, bb + 2 * BAR - .25, [s])[0]
        per.append([(x0 - bb, x1 - bb) for x0, x1, _ in r])
    per = np.array(per)                                   # (3 遍, 字, 2)
    med = np.median(per, axis=0)
    # 最后一个字是长音，开头常被对到拖音的后半截：不能晚于前一个字 0.5 秒以上
    if med[-1, 0] - med[-2, 0] > .5: med[-1, 0] = med[-2, 0] + .34
    rel.append(med)

lines = []
def add(text, who, starts_ends, part):
    cs = chars_of(text)
    assert len(cs) == len(starts_ends)
    lines.append({'text': text, 'who': who, 'part': part,
                  'chars': [[c, round(float(t0), 3), round(float(t1), 3)] for c, (t0, t1) in zip(cs, starts_ends)]})

for rep, sh in ((1, 0.0), (2, SHIFT2)):
    for s, r in zip(A, VA): add(s, 'F', [(x0 + sh, x1 + sh) for x0, x1 in r], f'A{rep}')
    for s, r in zip(B, VB): add(s, 'M', [(x0 + sh, x1 + sh) for x0, x1 in r], f'B{rep}')
    inst = f'C{rep}'
    for k, s in enumerate(CH):
        bb = bar(CH_BARS[inst] + 2 * k)
        add(s, 'F', [(x0 + bb, x1 + bb) for x0, x1 in rel[k]], inst)
    post_bars = [26, 30] if rep == 1 else [58, 62, 66]
    for pb in post_bars:
        bb = bar(pb)
        add(POST, 'F', [(x0 + bb, x1 + bb) for x0, x1 in rel[0][:4]], f'P{rep}')
for s, r in zip(BR, BRr): add(s, 'M', [(x0, x1) for x0, x1, _ in r], 'BR')
for k, s in enumerate(CH):
    bb = bar(CH_BARS['C3'] + 2 * k)
    add(s, 'M', [(x0 + bb, x1 + bb) for x0, x1 in rel[k]], 'C3')

lines.sort(key=lambda l: l['chars'][0][1])
for l in lines:
    print(f"{l['part']:3s} {l['who']} {l['chars'][0][1]:7.2f} → {l['chars'][-1][2]:7.2f}  {l['text']}")
json.dump(lines, open('out/align.json', 'w'), ensure_ascii=False, indent=1)
with open('lyrics.js', 'w', encoding='utf-8') as f:
    f.write("'use strict';\n/* lyrics.js —— 由 align.py 生成，别手改。歌曲时间（秒）。\n"
            "   每句：text 歌词，who 谁唱（F 女声 / M 男声），part 段落，chars [字, 开口, 结束]。 */\n")
    f.write('const LYRICS = ' + json.dumps(lines, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('lines', len(lines))
