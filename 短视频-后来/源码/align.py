"""歌词逐字对时间、节拍 → timing.js / timing.json（歌曲时间 = 成片时间，秒）。
1. 节拍：伴奏轨（Demucs 的 no_vocals）的 onset 包络上网格搜速度和相位：149.81 BPM 的八分音符格，即 74.905 BPM，
   一小节 3.204 秒。按八分音符位置 mod 8 统计中高频起音，0、4 位最强 → 第 0 位是每小节第 1 拍，第 0 小节从 0.113 秒开始。
2. 逐字：人声轨（Demucs 的 vocals）+ torchaudio 的 MMS_FA（汉字转成不带声调的拼音，按字母对齐），每句单独开窗：
   从上一句在歌词视频里滚走前 0.4 秒，到这一句滚走后 0.6 秒（最多到最后一个擦亮的字后 3 秒）。
   9 处"后来"的开口都和人声响度起来的时刻对过（差 ≤ 0.05 秒）。卡拉 OK 的擦亮是按句子匀速插的，不用来定字。
3. 副歌唱了四遍：同一句歌词，每个字相对这句第一个字的时刻取几遍的中位数；对齐得分低于 0.5、又和中位数差 0.3 秒以上的字
   （第三遍"可惜你早已远去"的"去"，得分 0.22，晚了 0.8 秒）换成中位数——前提是卡拉 OK 的擦亮也离中位数更近
   （第一遍"有些人 一旦"唱得慢，"一"比中位数晚 0.47 秒，擦亮也是晚的，不换）。
4. 每个字至少比前一个字晚 0.06 秒；每个字的结束 = 下一个字的开始；每句最后一个字唱到人声音量掉下去为止（最多 3 秒）。
依赖：torch、torchaudio、pypinyin、soundfile、librosa。用法：python3 align.py（读 kara_chars.json、audio/stems/*.wav）"""
import json
import numpy as np, soundfile as sf, torch, torchaudio, librosa
from pypinyin import lazy_pinyin, Style

BPM8, T0 = 149.81, 0.1126
BEAT = 2 * 60 / BPM8
BAR = 4 * BEAT


def beat_grid():
    y, sr = librosa.load('audio/stems/no_vocals.wav', sr=22050, mono=True)
    o = librosa.onset.onset_strength(y=y, sr=sr, hop_length=256)
    t = np.arange(len(o)) * 256 / sr
    best = max(((abs((o * np.exp(2j * np.pi * t / (60 / b))).sum()), b) for b in np.arange(140, 160, .005)))
    print(f'八分音符 {best[1]:.3f} BPM（写死的值 {BPM8}）')


KARA = json.load(open('kara_chars.json', encoding='utf-8'))
SR = 16000
wav, sr = sf.read('audio/stems/vocals.wav', dtype='float32')
if wav.ndim > 1: wav = wav.mean(1)
y22 = librosa.resample(wav, orig_sr=sr, target_sr=22050)
wav = torchaudio.functional.resample(torch.from_numpy(wav), sr, SR)
bundle = torchaudio.pipelines.MMS_FA
model = bundle.get_model(with_star=False).eval()
tokenizer, aligner = bundle.get_tokenizer(), bundle.get_aligner()
HOP = 128
RDB = 20 * np.log10(librosa.feature.rms(y=y22, frame_length=1024, hop_length=HOP)[0] + 1e-7)
RREF = np.percentile(RDB, 95); OT = np.arange(len(RDB)) * HOP / 22050


def align(a, b, text):
    seg = wav[int(a * SR):int(b * SR)].unsqueeze(0)
    seg = seg / (seg.abs().max() + 1e-6) * .8
    with torch.inference_mode():
        em, _ = model(seg)
    py = lazy_pinyin(text, style=Style.NORMAL)
    assert len(py) == len(text), (text, py)
    spans = aligner(em[0], tokenizer(py))
    r = seg.size(1) / em.size(1) / SR
    return [(a + sp[0].start * r, a + sp[-1].end * r, float(np.mean([x.score for x in sp]))) for sp in spans]


if __name__ == '__main__':
    beat_grid()
    raw = []
    for k, L in enumerate(KARA):
        a = KARA[k - 1]['leave'] - .4 if k else L['arrive'] - 1.5
        ks = [s for s in L['starts'] if s]
        b = min(L['leave'] + .6, (ks[-1] if ks else L['arrive']) + 3.)
        raw.append((a, b, align(a, b, L['text'])))
    rel = {}
    for L, (a, b, al) in zip(KARA, raw):
        rel.setdefault(L['text'], []).append([x[0] - al[0][0] for x in al])
    lines = []
    for k, (L, (a, b, al)) in enumerate(zip(KARA, raw)):
        t = [x[0] for x in al]
        if len(rel[L['text']]) >= 3:
            med = np.median(np.array(rel[L['text']]), axis=0)
            for i in range(1, len(t)):
                kt, m = L['starts'][i], t[0] + med[i]
                kara_ok = abs(kt - m) < abs(kt - t[i]) if kt else al[i][2] < .3
                if al[i][2] < .5 and abs(t[i] - m) > .3 and kara_ok:
                    print(f'  第 {k} 句"{L["text"][i]}"：{t[i]:.2f} → {t[0] + med[i]:.2f}（得分 {al[i][2]:.2f}）')
                    t[i] = t[0] + med[i]
        for i in range(1, len(t)):
            t[i] = max(t[i], t[i - 1] + .06)
        last = t[-1]
        lim = min(b + .3, last + 3.)
        m = (OT > last + .15) & (OT < lim)
        quiet = OT[m][RDB[m] < RREF - 28]
        end = float(quiet[0]) if len(quiet) else lim
        chars = [[c, round(float(t[i]), 3), round(float(t[i + 1]) if i + 1 < len(t) else end, 3)] for i, c in enumerate(L['text'])]
        lines.append(dict(text=L['text'], chars=chars))
        print(f"{k:2d} {chars[0][1]:7.2f} → {end:7.2f}  {L['text']}  " + ' '.join(f'{c}{t0:.2f}' for c, t0, _ in chars))
    dur = sf.info('audio/song.wav').duration
    T = dict(duration=round(dur, 4), beat=round(BEAT, 5), bar=round(BAR, 5), bar0=T0,
             lines=[dict(text=l['text'], chars=l['chars']) for l in lines])
    json.dump(T, open('timing.json', 'w', encoding='utf-8'), ensure_ascii=False)
    with open('timing.js', 'w', encoding='utf-8') as f:
        f.write("'use strict';\n/* timing.js —— 由 align.py 生成，别手改。duration 歌长；beat、bar 一拍、一小节（秒）；bar0 第 0 小节第 1 拍；\n"
                "   lines 每句歌词：text，chars [字, 开口, 结束]。 */\n")
        f.write('window.TIMING = ' + json.dumps(T, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print('lines', len(lines), 'duration', dur)
