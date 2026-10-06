"""从歌曲音频生成 timing.js：节拍网格、强拍相位、逐字时间轴、人声包络、每拍力度。
流程：
  1. Demucs（htdemucs，两轨）分出人声和伴奏；
  2. 在伴奏的 onset 包络上网格搜索恒定速度和相位（这首没有漂移）；
  3. 和弦变化最集中的那一拍定为强拍（IV–V–iii–vi，每小节换一个和弦）；
  4. 歌词交给 wav2vec2 中文模型做 CTC 强制对齐，得到每个字的起唱时刻；
  5. 每个字吸附到 ±90 ms 内最近的人声 onset 峰，挤在一起的字按十六分音符摊开。
歌词是对照三遍 Whisper（small / medium / large-v3）和原视频字幕定下来的，写在下面的 LYRICS 里。
依赖：numpy、librosa、torch、torchaudio、transformers、demucs
用法：python3 analyze.py   （读 audio/song.wav，写 timing.js）"""
import os, subprocess, sys
import numpy as np, librosa

SONG = 'audio/song.wav'
STEMS = 'audio/stems'
FPS = 30
LYRICS = '''你掐灭没吸的烟
大步流星地掠过我向前
我用力去抓你的衣角
以为我挽留你
结局就会改变
你不说一句就要离开
我在原地喊了又喊
你不回头
仿佛就当我不存在
我的故事里只有你
你却走得迫不及待
剩下来的情节全是无奈
竟是空白
我和你猜了又猜
想过再想决定分开
为什么我们的结局还是没有例外
你说我没有想法
不懂浪漫惹人厌烦
为什么曾经不说
却拖到了现在
我和你吵了又吵
闹过再闹还是分开
为什么我在你眼里是如此的不堪
我还是追了出去
不想在这傻傻等待
最后却看着车门在我面前
用力地关'''.split('\n')
SUB = {'挽': '晚', '掐': '恰'}      # 模型词表里没有的字，用同音字对齐

if not os.path.exists(f'{STEMS}/vocals.wav'):
    subprocess.run([sys.executable, '-m', 'demucs', '--two-stems=vocals', '-n', 'htdemucs', '-o', 'audio/sep', SONG], check=True)
    os.makedirs(STEMS, exist_ok=True)
    for s in ('vocals', 'no_vocals'):
        os.replace(f'audio/sep/htdemucs/song/{s}.wav', f'{STEMS}/{s}.wav')

sr = 22050
y, _ = librosa.load(SONG, sr=sr, mono=True)
acc, _ = librosa.load(f'{STEMS}/no_vocals.wav', sr=sr, mono=True)
voc, _ = librosa.load(f'{STEMS}/vocals.wav', sr=sr, mono=True)
DUR = len(y) / sr

# ---- 1. 节拍网格 ----
hop = 64
oenv = librosa.onset.onset_strength(y=acc, sr=sr, hop_length=hop)
otimes = np.arange(len(oenv)) * hop / sr
def score(P, O):
    tt = O + np.arange(np.ceil(-O / P), np.floor((DUR - O) / P)) * P
    return np.interp(tt, otimes, oenv).mean()
_, BPM, PH = max((score(60 / b, o), b, o) for b in np.arange(130, 138, .01) for o in np.arange(0, 60 / b, .002))
BEAT = 60 / BPM

# ---- 2. 强拍：和弦变化最集中的拍位 ----
C = librosa.feature.chroma_cqt(y=acc, sr=sr, hop_length=512)
ct = librosa.frames_to_time(np.arange(C.shape[1]), sr=sr, hop_length=512)
nb = int((DUR - PH) / BEAT)
cb = []
for k in range(nb):
    v = C[:, (ct >= PH + k * BEAT) & (ct < PH + (k + 1) * BEAT)].mean(1)
    cb.append(v / (np.linalg.norm(v) + 1e-9))
chg = np.array([0] + [1 - cb[k] @ cb[k - 1] for k in range(1, nb)])
down = int(np.argmax([chg[m::4].mean() for m in range(4)]))
BAR0 = PH + down * BEAT                     # 第 0 小节的强拍
print(f'BPM {BPM:.2f}  第 0 拍 {PH:.3f}s  强拍在第 {down} 拍 → 第 0 小节 {BAR0:.3f}s')

# ---- 3. CTC 强制对齐 ----
import torch, torchaudio
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
MID = 'jonatasgrosman/wav2vec2-large-xlsr-53-chinese-zh-cn'
proc = Wav2Vec2Processor.from_pretrained(MID)
model = Wav2Vec2ForCTC.from_pretrained(MID).eval()
w16, _ = librosa.load(f'{STEMS}/vocals.wav', sr=16000, mono=True)
with torch.inference_mode():
    lp = torch.log_softmax(model(proc(w16, sampling_rate=16000, return_tensors='pt').input_values).logits, -1)[0]
fd = len(w16) / 16000 / lp.shape[0]
vocab, blank = proc.tokenizer.get_vocab(), proc.tokenizer.pad_token_id
chars = [c for l in LYRICS for c in l]
tok = torch.tensor([[vocab[SUB.get(c, c)] for c in chars]])
ali = torchaudio.functional.forced_align(lp[None], tok, blank=blank)[0][0].numpy()
starts, prev = [], blank
for t, a in enumerate(ali):
    if a != blank and (a != prev or prev == blank):
        starts.append(t * fd)
    prev = a
assert len(starts) == len(chars)

# ---- 4. 吸附到人声 onset 峰 ----
vo = librosa.onset.onset_strength(y=voc, sr=sr, hop_length=128)
vo = vo / np.percentile(vo, 99.5)
vt = np.arange(len(vo)) * 128 / sr
pk = librosa.util.peak_pick(vo, pre_max=6, post_max=6, pre_avg=20, post_avg=20, delta=.05, wait=8)
pt, ps = vt[pk], vo[pk]
times, i = [], 0
for l in LYRICS:
    row = []
    for c in l:
        t = starts[i]; i += 1
        m = np.where((pt > t - .09) & (pt < t + .09))[0]
        if len(m):
            t = float(pt[m[np.argmax(ps[m] * np.exp(-np.abs(pt[m] - t) / .05))]]) - .012
        if row and t < row[-1] + .06:
            t = row[-1] + .06
        row.append(t)
    k = 0                                   # 挤在一起的字（间隔 < 75 ms）按最多一个十六分音符摊开
    while k < len(row) - 1:
        j = k
        while j < len(row) - 1 and row[j + 1] - row[j] < .075:
            j += 1
        if j > k:
            a = row[k]; b = row[j + 1] if j + 1 < len(row) else row[j] + .25
            step = min(BEAT / 4, (b - a) / (j - k + 1))
            for q in range(k, j + 1):
                row[q] = a + (q - k) * step
            k = j + 1
        else:
            k += 1
    times.append(row)

# ---- 5. 每句的结束：最后一个字之后人声第一次安静下来 ----
rv = librosa.feature.rms(y=voc, frame_length=1024, hop_length=256)[0]
rt = np.arange(len(rv)) * 256 / sr
thr = np.percentile(rv, 95) * .12
ends = []
for li, row in enumerate(times):
    nxt = times[li + 1][0] - .05 if li + 1 < len(times) else DUR
    j = np.searchsorted(rt, row[-1] + .15)
    while j < len(rv) - 3 and rt[j] < nxt and rv[j:j + 3].max() > thr:
        j += 1
    ends.append(min(rt[min(j, len(rt) - 1)], nxt))

# ---- 6. 包络（30fps）和每拍力度 ----
def env(sig, lo, hi, attack=1.0, release=.25):
    r = librosa.feature.rms(y=sig, frame_length=2048, hop_length=int(round(sr / FPS)), center=True)[0]
    v = np.clip((20 * np.log10(r + 1e-7) - lo) / (hi - lo), 0, 1)
    out, a = np.zeros_like(v), 0.0
    for k, x in enumerate(v):
        a += (x - a) * (attack if x > a else release)
        out[k] = a
    return out
ref = np.percentile(20 * np.log10(librosa.feature.rms(y=voc)[0] + 1e-7), 95)
VOC = env(voc, ref - 24, ref)
ae = librosa.onset.onset_strength(y=acc, sr=sr, hop_length=128)
nbt = int((DUR - PH) / BEAT) + 1
bs = np.array([ae[max(0, int((PH + k * BEAT) * sr / 128) - 2): int((PH + k * BEAT) * sr / 128) + 4].max(initial=0) for k in range(nbt)])
bs = np.clip(bs / np.percentile(bs, 97), 0, 1)

AL = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
enc = lambda v: ''.join(AL[int(round(x * 61))] for x in v)
lines = []
for l, row, e in zip(LYRICS, times, ends):
    lines.append(f"  {{ s: '{l}', t: [{', '.join(f'{t:.2f}' for t in row)}], end: {e:.2f} }},")
with open('timing.js', 'w', encoding='utf-8') as f:
    f.write(f"""'use strict';
/* timing.js —— 由 analyze.py 生成，别手改。时间都是歌曲时间（秒，相对于音频开头）。
   节拍网格：在伴奏 onset 包络上搜索恒定速度和相位，全曲没有漂移；强拍取和弦变化最集中的拍位。
   LYR：每个字开口的时刻（Demucs 人声 → wav2vec2 CTC 强制对齐 → 吸附到人声 onset），end 是这一句唱完。
   VOC：人声轨音量包络（30fps，0–1，编码成 0-9A-Za-z）。BEATS：伴奏轨每一拍的力度（0–1）。 */
const SONG_DUR = {DUR:.3f};
const BEAT = {BEAT:.6f};          // {BPM:.2f} BPM
const BEAT0 = {PH:.3f};           // 第 0 拍
const BAR0 = {BAR0:.3f};           // 第 0 小节的强拍（和弦 IV–V–iii–vi 每小节换一个）
const BAR = 4 * BEAT;
const bar = n => BAR0 + n * BAR;
const ENV_FPS = {FPS};
const LYR = [
{chr(10).join(lines)}
];
const VOC_S = '{enc(VOC)}';
const BEATS_S = '{enc(bs)}';
""")
print('timing.js 写好了：', len(LYRICS), '句，', len(chars), '个字')
for l, row, e in zip(LYRICS, times, ends):
    print(f'{row[0]:6.2f}–{e:6.2f}  {l}')
