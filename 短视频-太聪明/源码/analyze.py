"""从歌曲音频生成 timing.js：节拍网格、每个字的起唱时刻、人声/伴奏包络。
依赖：numpy、librosa、soundfile、torch、torchaudio、transformers、demucs
用法：python3 analyze.py   （读 audio/song.wav，写 timing.js）

1. Demucs（htdemucs，两轨）把人声和伴奏分开。
2. 节拍：在 onset 包络上网格搜索恒定速度和相位（全曲没有漂移）。
3. 歌词时间轴：歌词和每句的大致起点来自音乐播放器的滚动歌词；
   每个字的起唱时刻用 wav2vec2 中文模型在人声轨上做 CTC 强制对齐。
4. 人声、伴奏的音量包络（30fps），画面里一些东西跟着人声的强弱动。"""
import os, subprocess, sys, json
import numpy as np, librosa, soundfile as sf

SONG = 'audio/song.wav'
STEMS = 'audio/stems'
FPS = 30

# 歌词（播放器滚动歌词里的大致起点，只用来划分对齐的块）
LINES = [
    (7.2, '总以为谜一般难懂的我'),
    (13.7, '在你了解了以后其实也没什么'),
    (20.9, '我总是忽冷又忽热隐藏我的感受'),
    (28.1, '只是怕爱你的心被你看透'),
    (39.7, '猜的没错想得太多不会有结果'),
    (46.4, '被你看穿了以后我更无处可躲'),
    (53.6, '我开始后悔不应该太聪明的卖弄'),
    (60.7, '只是怕亲手将我的真心葬送'),
    (72.0, '我猜着你的心'),
    (75.8, '要再一次确定'),
    (79.5, '遥远的距离都是因为太过聪明'),
    (86.7, '要猜着你的心'),
    (90.6, '要再一次确定'),
    (94.0, '混乱的思绪都是因为太想靠近你'),
    (101.9, '猜的没错想得太多不会有结果'),
    (108.2, '被你看穿了以后我更无处可躲'),
    (115.4, '我开始后悔不应该太聪明的卖弄'),
    (122.6, '只是怕亲手将我的真心葬送'),
    (166.6, '我猜着你的心'),
    (170.3, '要再一次确定'),
    (174.0, '遥远的距离都是因为太过聪明'),
    (181.2, '要猜着你的心'),
    (184.7, '要再一次确定'),
    (188.6, '混乱的思绪都是因为太想靠近你'),
    (196.4, '猜的没错想得太多不会有结果'),
    (202.9, '被你看穿了以后我更无处可躲'),
    (210.0, '我开始后悔不应该太聪明的卖弄'),
    (217.1, '只是怕亲手将我的真心葬送'),
    (224.5, '只是怕亲手将我的真心葬送'),
    (232.1, '我开始后悔不应该太聪明的卖弄'),
    (238.8, '只是怕亲手将我的真心葬送'),
]
# 对齐的块：中间有器乐间隔的地方断开（首句序号、末句序号、起止秒）
BLOCKS = [(0, 3, 5.5, 37.5), (4, 7, 38.0, 70.5), (8, 17, 70.5, 130.0), (18, 30, 164.5, 247.0)]

# ---- 1. 人声分离 ----
if not os.path.exists(f'{STEMS}/vocals.wav'):
    subprocess.run([sys.executable, '-m', 'demucs', '--two-stems=vocals', '-n', 'htdemucs', '-o', 'audio/sep', SONG], check=True)
    os.makedirs(STEMS, exist_ok=True)
    for s in ('vocals', 'no_vocals'):
        os.replace(f'audio/sep/htdemucs/song/{s}.wav', f'{STEMS}/{s}.wav')

y, sr = librosa.load(SONG, sr=22050, mono=True)
DUR = len(y) / sr

# ---- 2. 节拍网格 ----
hop = 128
oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
otimes = np.arange(len(oenv)) * hop / sr
def score(P, O):
    tt = O + np.arange(np.ceil(-O / P), np.floor((DUR - O) / P)) * P
    return np.interp(tt, otimes, oenv).mean()
_, b0, o0 = max((score(60 / b, o), b, o) for b in np.arange(60, 72, .05) for o in np.arange(0, 60 / b, .01))
_, BPM, BEAT0 = max((score(60 / b, o), b, o) for b in np.arange(b0 - .3, b0 + .3, .005) for o in np.arange(0, 60 / b, .002))
BEAT = 60 / BPM
print(f'BPM {BPM:.2f}  BEAT0 {BEAT0:.3f}')

# ---- 3. 逐字对齐 ----
import torch, torchaudio
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
torch.set_num_threads(os.cpu_count() or 4)
M = 'jonatasgrosman/wav2vec2-large-xlsr-53-chinese-zh-cn'
proc = Wav2Vec2Processor.from_pretrained(M)
model = Wav2Vec2ForCTC.from_pretrained(M).eval()
vocab = proc.tokenizer.get_vocab()
blank = proc.tokenizer.pad_token_id
v, vsr = sf.read(f'{STEMS}/vocals.wav')
v = v.mean(1).astype(np.float32)
v16 = torchaudio.functional.resample(torch.from_numpy(v), vsr, 16000).numpy()
chars = []
for (l0, l1, a, b) in BLOCKS:
    seg = v16[int(a * 16000):int(b * 16000)]
    with torch.inference_mode():
        lp = torch.log_softmax(model(proc(seg, sampling_rate=16000, return_tensors='pt').input_values).logits[0], -1)
    fdur = (b - a) / lp.shape[0]
    want = [(li, c) for li in range(l0, l1 + 1) for c in LINES[li][1]]
    ids = torch.tensor([[vocab[c] for _, c in want]], dtype=torch.int32)
    ali, _ = torchaudio.functional.forced_align(lp[None], ids, blank=blank)
    starts, prev = [], blank
    for f, tok in enumerate(ali[0].tolist()):
        if tok != blank and (tok != prev or prev == blank):
            starts.append(f)
        prev = tok
    assert len(starts) == len(want)
    for (li, c), f in zip(want, starts):
        chars.append((li, c, a + f * fdur))
    print('block', l0, l1, 'ok')

# ---- 4. 包络 ----
def env_db(path):
    s, _ = librosa.load(path, sr=22050, mono=True)
    r = librosa.feature.rms(y=s, frame_length=2048, hop_length=int(round(22050 / FPS)), center=True)[0]
    return 20 * np.log10(r + 1e-7)
def smooth(d, lo, hi, attack=1.0, release=.25):
    x = np.clip((d - lo) / (hi - lo), 0, 1)
    out = np.zeros_like(x); acc = 0
    for i, u in enumerate(x):                       # 快起慢落
        acc = acc + (u - acc) * (attack if u > acc else release)
        out[i] = acc
    return out
dv = env_db(f'{STEMS}/vocals.wav'); ref = np.percentile(dv, 95)
VOC = smooth(dv, ref - 24, ref)
ACC = smooth(env_db(f'{STEMS}/no_vocals.wav'), -40, -10, release=.12)

# 每句结束：最后一个字之后，人声低于参考 −20 dB 的时刻（最长 3 秒，且不晚于下一句）
lines = []
for li, (_, text) in enumerate(LINES):
    ts = [round(t - .05, 3) for (l, _, t) in chars if l == li]   # 字比开口早 0.05 秒出现
    nxt = next((t for (l, _, t) in chars if l == li + 1), DUR)
    i0 = int(ts[-1] * FPS) + 6
    e = ts[-1] + 3.0
    for i in range(i0, min(len(dv), int((ts[-1] + 3.0) * FPS))):
        if dv[i] < ref - 20:
            e = i / FPS; break
    e = min(e, nxt - .05)
    lines.append({'text': text, 's': ts[0], 'e': round(e, 3), 't': ts})

# 小节：强拍在第 0 拍还是第 2 拍，看哪种让各句起点离强拍更近（句子都在强拍后不久开口）
BAR = 4 * BEAT
cands = []
for m in (0, 1, 2, 3):
    d0 = BEAT0 + m * BEAT
    off = np.array([((l['s'] - d0) % BAR) for l in lines])
    cands.append((np.median(off), m))
_, m = min(cands)
DOWN0 = (BEAT0 + m * BEAT) % BAR
print('downbeat phase', m, 'bar0', DOWN0)

AL = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
enc = lambda x: ''.join(AL[int(round(u * 61))] for u in x)
with open('timing.js', 'w', encoding='utf-8') as f:
    f.write(f"""'use strict';
/* timing.js —— 由 analyze.py 生成，别手改。
   节拍：在 onset 包络上搜索恒定速度和相位，全曲没有漂移。
   LYR：每句的起止（秒，歌曲时间）和每个字出现的时刻（wav2vec2 强制对齐，提前 0.05 秒）。
   VOC / ACC：人声轨、伴奏轨的音量包络（30fps，0–1，编码成 0-9A-Za-z）。 */
const SONG_DUR = {DUR:.3f};
const BEAT = {BEAT:.6f};          // {BPM:.2f} BPM（四分音符）
const BEAT0 = {BEAT0:.3f};
const BAR = 4 * BEAT;
const DOWN0 = {DOWN0:.3f};          // 第 0 小节强拍
const bar = n => DOWN0 + n * BAR;
const ENV_FPS = {FPS};
const LYR = {json.dumps(lines, ensure_ascii=False)};
const VOC_S = '{enc(VOC)}';
const ACC_S = '{enc(ACC)}';
""")
print('lines', len(lines), 'chars', len(chars))
