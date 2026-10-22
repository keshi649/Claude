"""《误闯天家》MV：从歌曲算出节拍和逐字时间，写出 timing.json（给声音、自查）和 timing.js（给画面）。

用法：/home/user/mvenv/bin/python analyze.py 歌曲（.mov/.m4a/.wav） [--spec 频谱核对图.png]
环境：python3 -m venv /home/user/mvenv，装 torch/torchaudio 2.7.1（CPU）、demucs、librosa、pypinyin、soundfile、pillow。

做法：
  1. Demucs（htdemucs，人声 / 伴奏两轨，不做随机平移）分出人声。
  2. 节拍：伴奏轨 150 Hz 以下的起音（底鼓），先按 0.4645 秒一拍的网格挑出落在拍上的，再最小二乘拟合相位和周期（约 129.2 BPM）。
  3. 逐字：torchaudio 的 MMS_FA，汉字转成不带声调的拼音，每句在人声的空隙之间开窗单独对齐。
     画了人声频谱（--spec）逐字核对过：红线都落在换字处的辅音噪声、谐波断口上。
"""
import json, os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
# 每句：文字、竖排时怎么分列、对齐窗口（秒，在人声的换气空隙里）
LINES = [
    ('误闯天家', ['误闯天家'], 0.95, 3.82),
    ('劝余放下手中砂', ['劝余放下', '手中砂'], 3.78, 7.12),
    ('张口欲唱声却哑', ['张口欲唱', '声却哑'], 7.45, 10.95),
    ('粉面披衣叫个假', ['粉面披衣', '叫个假'], 11.15, 14.62),
    ('怜余来安座下', ['怜余来', '安座下'], 14.85, 18.30),
    ('不敢沾染佛前茶', ['不敢沾染', '佛前茶'], 18.50, 22.05),
    ('只作凡人赴雪月风花', ['只作凡人赴', '雪月风花'], 22.25, 29.74),
]


def separate(song, outdir):
    """歌曲（.mov / .m4a / .wav 都行）先用 ffmpeg 转成 44.1 kHz 的 wav，再用 Demucs 分成人声、伴奏两轨"""
    import subprocess
    os.makedirs(outdir, exist_ok=True)
    wav = os.path.join(outdir, 'song.wav')
    if not os.path.exists(wav):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', song, '-vn', '-ac', '2', '-ar', '44100', '-c:a', 'pcm_s16le', wav], check=True)
    voc = os.path.join(outdir, 'htdemucs', 'song', 'vocals.wav')
    if not os.path.exists(voc):
        # --shifts 0：不做随机平移，每次分出来都一样（默认的随机平移会让逐字时间每次差一二十毫秒）
        subprocess.run([sys.executable, '-m', 'demucs', '-n', 'htdemucs', '--two-stems=vocals', '--shifts', '0', '-o', outdir, wav], check=True)
    return wav, voc, voc.replace('vocals.wav', 'no_vocals.wav')


def beat_grid(acc):
    import librosa
    y, sr = librosa.load(acc, sr=22050, mono=True)
    hop = 256; fr = hop / sr
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
    freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
    low = S[freqs < 150].sum(axis=0)
    lowd = np.maximum(0, np.diff(np.log1p(low), prepend=0))
    pk = librosa.util.peak_pick(lowd, pre_max=5, post_max=5, pre_avg=10, post_avg=10, delta=0.3, wait=10)
    kt = pk * fr
    per0, ph0 = 0.4644, 0.163
    k = np.round((kt - ph0) / per0)
    m = np.abs(kt - (ph0 + k * per0)) < 0.06
    A = np.vstack([np.ones(m.sum()), k[m]]).T
    ph, per = np.linalg.lstsq(A, kt[m], rcond=None)[0]
    return float(ph), float(per)


def align(voc):
    import torch, torchaudio
    from pypinyin import lazy_pinyin
    bundle = torchaudio.pipelines.MMS_FA
    model = bundle.get_model(with_star=False)
    dic = bundle.get_dict(star=None)
    wav, sr = torchaudio.load(voc)
    wav = torchaudio.functional.resample(wav.mean(0, keepdim=True), sr, bundle.sample_rate)
    SR = bundle.sample_rate
    out = []
    for text, cols, a, b in LINES:
        seg = wav[:, int(a * SR):int(b * SR)]
        with torch.inference_mode():
            em, _ = model(seg)
        em = torch.log_softmax(em, dim=-1)
        py = [p.replace('ü', 'u').replace('v', 'u') for p in lazy_pinyin(text)]
        toks = [dic[c] for p in py for c in p]
        ali, sc = torchaudio.functional.forced_align(em, torch.tensor([toks], dtype=torch.int32), blank=0)
        spans = torchaudio.functional.merge_tokens(ali[0], sc[0].exp())
        ratio = seg.shape[1] / em.shape[1] / SR
        chars, k = [], 0
        for ch, p in zip(text, py):
            sp = spans[k:k + len(p)]; k += len(p)
            chars.append({'c': ch, 't': round(a + sp[0].start * ratio, 3), 'score': round(float(np.mean([s.score for s in sp])), 2)})
        out.append({'text': text, 'cols': cols, 'chars': chars})
    return out


def vocal_ends(voc, lines):
    """每句唱完的时刻：下一句开口前，人声能量最后一次高于 -14 dB（相对全曲最响，再低就算到混响尾巴了）的地方。"""
    import soundfile as sf
    y, sr = sf.read(voc)
    y = y.mean(1) if y.ndim > 1 else y
    hop = int(sr * .01)
    rms = np.sqrt(np.convolve(y ** 2, np.ones(hop * 3) / (hop * 3), 'same')[::hop])
    db = 20 * np.log10(rms / rms.max() + 1e-9)
    for i, L in enumerate(lines):
        a = L['chars'][-1]['t']
        b = lines[i + 1]['chars'][0]['t'] - .06 if i + 1 < len(lines) else len(y) / sr   # 下一句的字头之前
        idx = np.arange(int(a / .01), min(int(b / .01), len(db)))
        loud = idx[db[idx] > -14]
        L['end'] = round(float(loud[-1] * .01 if len(loud) else b), 3)


def spec_png(voc, lines, ph, per, path):
    import librosa
    from PIL import Image, ImageDraw, ImageFont
    y, sr = librosa.load(voc, sr=22050, mono=True)
    hop = 110
    S = librosa.amplitude_to_db(np.abs(librosa.stft(y, n_fft=1024, hop_length=hop)), ref=np.max)[:300]
    pxs = 200
    font = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 18)
    rows = []
    for r0 in range(0, 30, 6):
        blk = S[:, int(r0 * sr / hop):int((r0 + 6) * sr / hop)]
        im = Image.fromarray(((np.clip(blk, -70, 0) + 70) / 70 * 255).astype(np.uint8)[::-1]).resize((6 * pxs, 300)).convert('RGB')
        cv = Image.new('RGB', (6 * pxs, 340)); cv.paste(im, (0, 40)); d = ImageDraw.Draw(cv)
        for k in range(80):
            t = ph + k * per
            if r0 <= t < r0 + 6:
                x = (t - r0) * pxs; d.line([(x, 40), (x, 340)], fill=(0, 120, 255)); d.text((x + 2, 22), str(k), fill=(0, 160, 255), font=font)
        for L in lines:
            for c in L['chars']:
                if r0 <= c['t'] < r0 + 6:
                    x = (c['t'] - r0) * pxs; d.line([(x, 40), (x, 340)], fill=(255, 60, 60), width=2); d.text((x + 3, 2), c['c'], fill=(255, 255, 0), font=font)
        rows.append(cv)
    out = Image.new('RGB', (6 * pxs, 340 * len(rows)))
    for i, r in enumerate(rows): out.paste(r, (0, i * 340))
    out.save(path)


if __name__ == '__main__':
    song = sys.argv[1]
    work = os.path.join(HERE, 'out', 'analyze')
    wav, voc, acc = separate(song, work)
    ph, per = beat_grid(acc)
    lines = align(voc)
    vocal_ends(voc, lines)
    import soundfile as sf
    info = sf.info(wav)
    timing = {'duration': round(info.frames / info.samplerate, 3), 'beat': {'phase': round(ph, 4), 'period': round(per, 5)}, 'lines': lines}
    json.dump(timing, open(os.path.join(HERE, 'timing.json'), 'w'), ensure_ascii=False, indent=1)
    open(os.path.join(HERE, 'timing.js'), 'w').write('window.TIMING = ' + json.dumps(timing, ensure_ascii=False) + ';\n')
    print('beat %.4f + k*%.5f  (%.2f BPM)' % (ph, per, 60 / per))
    for L in lines:
        print(L['text'], ' '.join('%s%.2f' % (c['c'], c['t']) for c in L['chars']), ' end %.2f' % L['end'])
    if '--spec' in sys.argv:
        spec_png(voc, lines, ph, per, sys.argv[sys.argv.index('--spec') + 1])
