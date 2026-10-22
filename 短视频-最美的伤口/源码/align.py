"""歌词逐字对时间 → timing.js / timing.json
人声轨：Demucs（htdemucs，--two-stems=vocals）分出来的 audio/stems/vocals.wav。
对齐：torchaudio 的 MMS_FA，汉字转成不带声调的拼音按字母对齐；每句按小节线开窗单独对齐（每句正好 2 小节，第 2、3 句各 1 小节）。
核对：对着人声频谱看过，每个字的线都落在换音、辅音的起点上；"牵着你的手"在第 6、8 句各唱一遍，相对小节线的时刻相差 ≤ 0.02 秒。
抖音原视频的字幕"童话世界熬油"是错字，按意思写成"遨游"（拼音一样，不影响对齐）。
依赖：torch、torchaudio、pypinyin、soundfile、librosa。用法：python3 align.py"""
import json
import numpy as np, soundfile as sf, torch, torchaudio, librosa
from pypinyin import lazy_pinyin, Style

BPM, PH = 94.99, 0.2220                 # analyze.py 量出来的
BEAT = 60 / BPM; BAR = 4 * BEAT; BAR1 = PH + 2 * BEAT
DUR = 42.887                            # 歌曲片段总长（音轨 42.887 秒；视频轨 42.93 秒，成片按音轨截）
bar = lambda k: BAR1 + (k - 1) * BAR
LINES = [  # (歌词, 第几小节开始, 几小节, 在第几个字前空一格)
    ('你要走的时候我明明想挽留', 1, 2, None),
    ('却像个提线木偶', 3, 1, None),
    ('怎么也说不出口', 4, 1, None),
    ('等到我转过头发现你已远走', 5, 2, 6),
    ('眼泪终于忍不住滴落湿衣袖', 7, 2, None),
    ('我曾经牵着你的手走在繁华街头', 9, 2, 8),
    ('就像在那童话世界遨游', 11, 2, None),
    ('不能牵着你的手走到世界尽头', 13, 2, 7),
    ('是我一生最美的伤口', 15, 2.4, None),
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
    return py, [(a + sp[0].start * ratio, a + sp[-1].end * ratio, float(np.mean([x.score for x in sp]))) for sp in spans]

lines = []
for text, k, n, gap in LINES:
    a, b = bar(k) - .3, min(bar(k + n) - .05, DUR)
    py, sp = align(a, b, text)
    # 最后一个字唱到哪：从它开头往后，人声音量掉到峰值 −30 dB 以下（至少唱 0.25 秒）
    t0 = sp[-1][0]; i = np.searchsorted(OT, t0)
    while i < len(RDB) - 1 and (RDB[i] > RREF - 30 or OT[i] < t0 + .25): i += 1
    chars = [{'c': c, 'py': p, 't0': round(s, 3), 't1': round(e, 3), 'score': round(q, 2)} for c, p, (s, e, q) in zip(text, py, sp)]
    lines.append({'text': text, 'bar': k, 'bars': n, 'gap': gap, 'start': chars[0]['t0'], 'end': round(min(OT[i], b), 3), 'chars': chars})
    print('%-15s 第%2d小节 %.2f 秒  ' % (text, k, bar(k)) + ' '.join('%s%.2f' % (c['c'], c['t0']) for c in chars))
T = {'bpm': BPM, 'beat': BEAT, 'bar': BAR, 'bar1': BAR1, 'duration': DUR, 'lines': lines}
json.dump(T, open('timing.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open('timing.js', 'w', encoding='utf-8').write('window.TIMING = ' + json.dumps(T, ensure_ascii=False) + ';\n')
print('写好 timing.js / timing.json')
