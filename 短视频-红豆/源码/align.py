"""歌词逐字对时间 → lyrics.js
歌词和每句大致的开始时间从用户发来的视频画面里读出来（播放器的歌词面板，高亮那一行换行的时刻，LRC 下面）。
Demucs 分出来的人声轨 + torchaudio 的 MMS_FA（汉字转成不带声调的拼音，按字母对齐），每句按"LRC 前 0.8 秒 ~ 下一句 LRC 后 0.2 秒"开窗单独对齐。
依赖：torch、torchaudio、pypinyin、soundfile、librosa。用法：python3 align.py （写 lyrics.js 和 out/align.json）"""
import json, os
import numpy as np, soundfile as sf, torch, torchaudio, librosa
from pypinyin import lazy_pinyin, Style

# 播放器歌词面板上高亮那一行换行的时刻（视频时间 = 歌曲时间），和歌词
LRC = [
    (16.4, '还没好好的感受'), (20.1, '雪花绽放的气候'), (24.3, '我们一起颤抖'), (27.5, '会更明白 什么是温柔'),
    (32.7, '还没跟你牵着手'), (36.4, '走过荒芜的沙丘'), (40.1, '可能从此以后 学会珍惜'), (44.9, '天长和地久'),
    (48.1, '有时候 有时候'), (52.3, '我会相信一切有尽头'), (55.9, '相聚离开 都有时候'), (59.7, '没有什么会永垂不朽'),
    (63.9, '可是我 有时候'), (67.6, '宁愿选择留恋不放手'), (71.8, '等到风景都看透'), (75.5, '也许你会陪我看细水长流'),
    (83.4, '还没为你把红豆'), (87.6, '熬成缠绵的伤口'), (91.3, '然后一起分享'), (94.5, '会更明白 相思的哀愁'),
    (99.2, '还没好好的感受'), (102.9, '醒着亲吻的温柔'), (107.2, '可能在我左右'), (109.8, '你才追求 孤独的自由'),
    (115.1, '有时候 有时候'), (118.7, '我会相信一切有尽头'), (122.4, '相聚离开 都有时候'), (126.6, '没有什么会永垂不朽'),
    (130.3, '可是我 有时候'), (134.5, '宁愿选择留恋不放手'), (138.1, '等到风景都看透'), (142.4, '也许你会陪我看细水长流'),
    (176.7, '有时候 有时候'), (180.4, '我会相信一切有尽头'), (184.6, '相聚离开 都有时候'), (188.3, '没有什么会永垂不朽'),
    (192.0, '可是我 有时候'), (195.7, '宁愿选择留恋不放手'), (199.4, '等到风景都看透'), (203.6, '也许你会陪我看细水长流'),
]
ENDS = {15: 81.0, 31: 151.0, 39: 211.5}   # 段落最后一句：拖长音唱到哪为止的上限（之后是间奏 / 尾奏）
# 按 LRC 开窗时，第 4 句把"手"对到了下一句的"走"上，第 5、6 句跟着错了一个字。按人声音高和清辅音（q、sh、z、k 的噪声段）
# 量出句和句之间的换气点，这三句改用这几个窗口
WIN = {4: (31.5, 35.78), 5: (35.78, 39.72), 6: (39.72, 44.6)}
# 下面几个字按人声音高和清辅音的噪声段手量（第 39 句"细水"后面停了 2 秒才唱"长流"，对齐是对的；第 15、31 句的"长"对到了前一个字的尾巴上）
FIX = {(15, 9): 79.66, (15, 10): 80.00, (31, 9): 146.36, (31, 10): 146.74, (39, 9): 209.28, (39, 10): 209.82,
       (13, 3): 68.27,      # "选择留"三个字被挤在 0.26 秒里，"择"按 z 的噪声段放
       (30, 0): 137.92}     # "等"前面有一口气声，对齐落在了气声上；按浊音开始的地方放
# 核对：out/spec_*.png 每句的人声频谱上画出每个字的时刻（spec_check.py），看是否落在辅音噪声和换音的断口上

SR = 16000
wav, sr = sf.read('audio/stems/vocals.wav', dtype='float32')
if wav.ndim > 1: wav = wav.mean(1)
y22 = librosa.resample(wav, orig_sr=sr, target_sr=22050)
wav = torchaudio.functional.resample(torch.from_numpy(wav), sr, SR)
bundle = torchaudio.pipelines.MMS_FA
model = bundle.get_model(with_star=False).eval()
tokenizer, aligner = bundle.get_tokenizer(), bundle.get_aligner()
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

lines = []
for k, (t, txt) in enumerate(LRC):
    text = txt.replace(' ', '')
    prev_end = lines[-1]['chars'][-1][1] + .25 if lines else 0
    a = max(prev_end, t - .8)
    b = LRC[k + 1][0] + .2 if k + 1 < len(LRC) and k not in ENDS else ENDS.get(k, t + 8)
    if k in WIN: a, b = WIN[k]
    al = align(a, b, text)
    chars = [[c, t0, t1, sc] for c, (t0, t1, sc) in zip(text, al)]
    for i in range(len(chars)):
        if (k, i) in FIX: chars[i][1] = FIX[(k, i)]; chars[i][3] = 1.
    for i in range(1, len(chars)):
        if chars[i][1] < chars[i - 1][1] + .06: chars[i][1] = chars[i - 1][1] + .06
    last = chars[-1][1]
    lim = min(b, last + 4.0)
    m = (OT > last + .15) & (OT < lim)
    quiet = OT[m][RDB[m] < RREF - 26]
    end = float(quiet[0]) if len(quiet) else lim
    for i in range(len(chars)):
        chars[i][2] = chars[i + 1][1] if i + 1 < len(chars) else end
    lines.append({'text': txt, 'lrc': t, 'win': [a, b], 'chars': chars})

os.makedirs('out', exist_ok=True)
json.dump(lines, open('out/align.json', 'w'), ensure_ascii=False, indent=1)
for k, l in enumerate(lines):
    sc = np.mean([c[3] for c in l['chars']])
    print(f"{k:2d} LRC {l['lrc']:6.1f}  {l['chars'][0][1]:7.2f} → {l['chars'][-1][2]:7.2f}  得分 {sc:.2f}  {l['text']}   " +
          ' '.join(f"{c}{t:.2f}" + ('?' if s < .3 else '') for c, t, e, s in l['chars']))
out = [{'text': l['text'], 'chars': [[c, round(t, 3), round(e, 3)] for c, t, e, s in l['chars']]} for l in lines]
with open('lyrics.js', 'w', encoding='utf-8') as f:
    f.write("'use strict';\n/* lyrics.js —— 由 align.py 生成，别手改。歌曲时间（秒）。\n"
            "   每句：text 歌词（空格是句中的停顿），chars [字, 开口, 结束]。 */\n")
    f.write('const LYRICS = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('lines', len(out))
