"""歌词逐字对时间 → lyrics.js
来源：
1. 用户发来的歌词视频（.mov）里每一行出现、消失的时刻（DISP，按 10fps 抽帧量文字边缘量出来的），用来给每句开对齐的窗口。
2. 强制对齐：Demucs 分出来的人声轨 + torchaudio 的 MMS_FA（汉字转成不带声调的拼音，按字母对齐），每句单独开窗。
依赖：torch、torchaudio、pypinyin、soundfile、librosa。用法：python3 align.py （写 lyrics.js 和 out/align.json）"""
import json, os, sys
import numpy as np, soundfile as sf, torch, torchaudio, librosa
from pypinyin import lazy_pinyin, Style

# (文字, 歌词视频里这一行出现的时刻, 消失的时刻)；文字里的空格是排版用的断句（画面上分成两半），对齐时去掉
LINES = [
    ('烛灯下的 旧情意谁理', 0.8, 2.3),
    ('西窗外的 良人泣不易', 2.5, 4.1),
    ('举杯谁和 明月提起她 在远方等你', 4.3, 7.8),
    ('等你再 落下几笔', 8.1, 9.8),
    ('等你再 弹奏几曲', 10.1, 11.7),
    ('等你再 回到故里', 11.9, 13.6),
    ('等你金榜 把名题', 13.9, 15.5),
    ('砚上三五笔 落墨鹧鸪啼', 15.9, 22.3),
    ('谁识曲中意 断弦等你系', 23.3, 29.5),
    ('哎呦小情郎 你莫愁', 30.3, 33.1),
    ('此生只为 你挽红袖', 33.7, 36.8),
    ('三巡酒过 月上枝头', 37.3, 40.6),
    ('我心悠悠', 40.9, 44.3),
    ('哎呦小娘子 你莫忧', 44.9, 48.1),
    ('待到春来 又雪满楼', 48.7, 51.9),
    ('不负天长 不负地久', 52.5, 55.5),
    ('你我白首', 55.9, 57.6),
]
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
OT = np.arange(len(RDB)) * HOP / 22050

# 多音字按歌里的念法给拼音（pypinyin 默认可能念错）
FIX = {'和': 'he', '系': 'xi', '为': 'wei', '长': 'chang', '乐': 'yue'}
def pinyin(text):
    py = lazy_pinyin(text, style=Style.NORMAL)
    return [FIX.get(c, p) for c, p in zip(text, py)]

def align(a, b, text):
    seg = wav[int(a * SR):int(b * SR)].unsqueeze(0)
    seg = seg / (seg.abs().max() + 1e-6) * .8
    with torch.inference_mode():
        em, _ = model(seg)
    py = pinyin(text)
    assert len(py) == len(text), (text, py)
    spans = aligner(em[0], tokenizer(py))
    ratio = seg.size(1) / em.size(1) / SR
    return [(a + sp[0].start * ratio, a + sp[-1].end * ratio, float(np.mean([x.score for x in sp]))) for sp in spans]

# 频谱上核对过、对齐挤错了的字（第几句, 第几个字）→ 开唱时刻。依据：同一节奏的句子（第 4、5 句"等你再……"）相差正好一小节，
# 频谱上那个字的换音也在这里。
FIX_T = {(5, 2): 12.85,   # "等你再回到故里"的"再"：对齐挤到了"你"后面 0.1 秒；照前两句的节奏，在"回"前 0.24 秒
         (6, 0): 14.07,   # "等你金榜把名题"的"等"：对齐挤到了"你"前面 0.08 秒；频谱上这个音从 14.07 开始
         (6, 1): 14.30,   # "你"：14.42 有一个换气的凹口，"你"在它前面，"金"在它后面
         (6, 2): 14.49}

out = []
for k, (text, d0, d1) in enumerate(LINES):
    plain = text.replace(' ', '')
    prev_end = out[-1]['raw_end'] + .05 if out else 0
    a = max(prev_end, d0 - .6)
    b = LINES[k + 1][1] + .3 if k + 1 < len(LINES) else 59.6
    res = align(a, b, plain)
    # 第二遍：窗口收到这句实际唱的范围前后各留一点，再对一次（窗口里别的句子的残音少一些）
    a2 = max(prev_end, res[0][0] - .35); b2 = min(b, res[-1][1] + .6)
    res2 = align(a2, b2, plain)
    if np.mean([r[2] for r in res2]) >= np.mean([r[2] for r in res]) - .02: res = res2
    starts = [r[0] for r in res]
    for (lk, i), v in FIX_T.items():
        if lk == k: starts[i] = v
    # 挤在一起的字（比前一个字晚不到 0.1 秒）：挪到前后两个字的正中间
    for i in range(1, len(starts) - 1):
        if starts[i] - starts[i - 1] < .1: starts[i] = (starts[i - 1] + starts[i + 1]) / 2
    out.append({'text': text, 'starts': starts, 'raw_end': res[-1][1], 'score': [r[2] for r in res]})

# 每个字唱到哪：到下一个字开始为止；一句的最后一个字唱到人声音量掉下去（比这个字的最大音量低 15 dB），但不晚于下一句开始前 0.1 秒
for k, L in enumerate(out):
    nxt_line = out[k + 1]['starts'][0] if k + 1 < len(out) else 61.0
    ends = []
    for i, t0 in enumerate(L['starts']):
        if i + 1 < len(L['starts']): ends.append(L['starts'][i + 1]); continue
        m = (OT >= t0) & (OT < nxt_line - .1)
        ref = RDB[m & (OT < t0 + .4)].max()
        q = np.where(m & (OT > t0 + .3) & (RDB < ref - 15))[0]
        ends.append(float(OT[q[0]]) if len(q) else nxt_line - .1)
    L['ends'] = ends
    print(f"{k:2d} {L['starts'][0]:6.2f}~{ends[-1]:6.2f}  " + ' '.join(f'{c}{t:.2f}' for c, t in zip(L['text'].replace(' ', ''), L['starts'])))

os.makedirs('out', exist_ok=True)
json.dump(out, open('out/align.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
with open('lyrics.js', 'w', encoding='utf-8') as f:
    f.write('// 由 align.py 生成：每句歌词（空格是画面上分成两半的地方）和每个字开唱、唱完的歌曲时间（秒）\n')
    f.write('const LYRICS = [\n')
    for L in out:
        cs = ', '.join(f'[{t0:.2f}, {t1:.2f}]' for t0, t1 in zip(L['starts'], L['ends']))
        f.write(f"  {{ text: '{L['text']}', t: [{cs}] }},\n")
    f.write('];\n')
print('写好 lyrics.js')
