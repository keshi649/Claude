"""歌词逐字对时间 → lyrics.js
两份来源：
1. 卡拉 OK：用户发来的抖音歌词视频里，唱到的字从白变绿。逐帧量出绿色走到哪个字（kara_chars.json，
   由 kara.py 从视频画面量出来）。对着人声的频谱看，它整体比真正开口早约 0.25 秒；每句开头一两个字是在歌词滚动时
   变绿的，被遮住了，量不到。
2. 强制对齐：Demucs 分出来的人声轨 + torchaudio 的 MMS_FA（汉字转成不带声调的拼音，按字母对齐），每句单独开窗。
   频谱上每个字的辅音、换音都落在对齐的时刻上，所以以它为准。
做法：卡拉 OK 整体往后挪 0.25 秒，用来给每句开对齐的窗口；对齐和挪过的卡拉 OK 差 0.2 秒以内取对齐；
差得多时也取对齐（频谱上看，对齐更准）；只有对齐把几个字挤到一起（相隔不到 0.1 秒）时，那几个字改用卡拉 OK。
依赖：torch、torchaudio、pypinyin、soundfile、librosa。用法：python3 align.py （写 lyrics.js 和 out/align.json）"""
import json, os
import numpy as np, soundfile as sf, torch, torchaudio, librosa
from pypinyin import lazy_pinyin, Style

KARA = json.load(open('kara_chars.json', encoding='utf-8'))
SR = 16000
wav, sr = sf.read('audio/stems/vocals.wav', dtype='float32')
if wav.ndim > 1: wav = wav.mean(1)
y22 = librosa.resample(wav, orig_sr=sr, target_sr=22050)
wav = torchaudio.functional.resample(torch.from_numpy(wav), sr, SR)
bundle = torchaudio.pipelines.MMS_FA
model = bundle.get_model(with_star=False).eval()
tokenizer, aligner = bundle.get_tokenizer(), bundle.get_aligner()
# 人声的音量（定每句最后一个字唱到哪）
HOP = 128
RMS = librosa.feature.rms(y=y22, frame_length=1024, hop_length=HOP)[0]; RDB = 20 * np.log10(RMS + 1e-7)
RREF = np.percentile(RDB, 95); OT = np.arange(len(RDB)) * HOP / 22050

def align(a, b, text):
    seg = wav[int(a * SR):int(b * SR)].unsqueeze(0)
    seg = seg / (seg.abs().max() + 1e-6) * .8
    with torch.inference_mode():
        em, _ = model(seg)
    py = lazy_pinyin(text, style=Style.NORMAL)
    assert len(py) == len(text), (text, py)
    spans = aligner(em[0], tokenizer(py))
    ratio = seg.size(1) / em.size(1) / SR
    return [(a + sp[0].start * ratio, a + sp[-1].end * ratio, float(np.mean([x.score for x in sp]))) for sp in spans]

# 卡拉 OK 能用的字：这一行滚到位以后才变绿的
def kara(L):
    return [kt + OFF if (kt is not None and kt > L['arrive'] + .02) else None for kt in L['starts']]

# 先粗对一遍，算出卡拉 OK 整体早了多少
OFF = 0.
diffs = []
for k, L in enumerate(KARA):
    ks = [x for x in kara(L)]
    first = next(x for x in ks if x is not None)
    a = max(first - 1.6, (KARA[k - 1]['end'] or KARA[k - 1]['starts'][-1]) if k else 0)
    b = (KARA[k + 1]['starts'][1] if k + 1 < len(KARA) else L['starts'][-1] + 4)
    al = align(a, b, L['text'])
    diffs += [t0 - kt for (t0, _, _), kt in zip(al, ks) if kt is not None]
OFF = float(np.median(diffs))
print(f'卡拉 OK 比对齐早 {OFF:.3f} 秒（中位数，{len(diffs)} 个字）')

lines = []
for k, L in enumerate(KARA):
    text = L['text']
    ks = kara(L)
    first = next(i for i, x in enumerate(ks) if x is not None)
    t_first = ks[first] - .45 * first          # 第一个量得到的字往前推，估这句从哪开始
    prev_last = lines[-1]['chars'][-1][1] + .15 if lines else 0
    a = max(prev_last, t_first - .7)
    if k + 1 < len(KARA):
        nk = kara(KARA[k + 1]); nf = next(i for i, x in enumerate(nk) if x is not None)
        b = nk[nf] - .45 * nf - .1
    else:
        b = ks[-1] + 2.5
    al = align(a, b, text)
    chars = []
    for i, (c, kt, (t0, t1, sc)) in enumerate(zip(text, ks, al)):
        t, src = t0, 'A' if kt is None or abs(t0 - kt) <= .2 else 'A!'
        chars.append([c, t, t1, src, kt, t0, sc])
    # 对齐在唱得快的地方会把几个字挤到一起（比前一个字晚不到 0.1 秒）：有卡拉 OK 的字改用卡拉 OK
    for _ in range(2):
        for i in range(1, len(chars)):
            if chars[i][1] < chars[i - 1][1] + .1:
                for j in (i, i - 1):
                    if chars[j][4] is not None and chars[j][3][0] != 'K':
                        chars[j][1] = chars[j][4]; chars[j][3] = 'K~'; break
    # 每个字至少比前一个字晚 0.06 秒
    for i in range(1, len(chars)):
        if chars[i][1] < chars[i - 1][1] + .06:
            chars[i][1] = chars[i - 1][1] + .06; chars[i][3] += '+'
    # 每个字的结束 = 下一个字的开始；最后一个字唱到人声音量掉下去为止（最多 3 秒）
    last = chars[-1][1]
    lim = min(b + .3, last + 3.0)
    m = (OT > last + .15) & (OT < lim)
    quiet = OT[m][RDB[m] < RREF - 28]
    end = float(quiet[0]) if len(quiet) else lim
    for i in range(len(chars)):
        chars[i][2] = chars[i + 1][1] if i + 1 < len(chars) else end
    lines.append({'text': text, 'chars': chars})

os.makedirs('out', exist_ok=True)
json.dump([{'text': l['text'], 'chars': [[c, round(t, 3), round(e, 3), s, None if kt is None else round(kt, 3), round(a0, 3), round(sc, 2)]
                                         for c, t, e, s, kt, a0, sc in l['chars']]} for l in lines], open('out/align.json', 'w'), ensure_ascii=False, indent=1)
for k, l in enumerate(lines):
    print(f"{k:2d} {l['chars'][0][1]:7.2f} → {l['chars'][-1][2]:7.2f}  {l['text']}   " +
          ' '.join(f"{c}{t:.2f}{s if s != 'A' else ''}" for c, t, e, s, kt, a0, sc in l['chars']))
out = [{'text': l['text'], 'chars': [[c, round(t, 3), round(e, 3)] for c, t, e, *_ in l['chars']]} for l in lines]
with open('lyrics.js', 'w', encoding='utf-8') as f:
    f.write("'use strict';\n/* lyrics.js —— 由 align.py 生成，别手改。歌曲时间（秒）。\n"
            "   每句：text 歌词，chars [字, 开口, 结束]。 */\n")
    f.write('const LYRICS = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('lines', len(out))
