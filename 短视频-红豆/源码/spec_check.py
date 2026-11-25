"""把每句歌词的人声频谱画出来，竖线是 align.py 对出来的每个字的开口时刻：out/spec_*.png。用法：python3 spec_check.py"""
import json, numpy as np, librosa, sys
from PIL import Image, ImageDraw, ImageFont
A = json.load(open('out/align.json'))
y, sr = librosa.load('audio/stems/vocals.wav', sr=16000, mono=True)
PX = 260; H = 150
font = ImageFont.truetype('fonts/NotoSerifSC-Bold.otf', 22); small = ImageFont.truetype('fonts/NotoSerifSC-Bold.otf', 13)
rows = []
for k, l in enumerate(A):
    a = l['chars'][0][1] - .5; b = l['chars'][-1][2] + .2
    seg = y[int(a*sr):int(b*sr)]
    S = librosa.feature.melspectrogram(y=seg, sr=sr, n_fft=1024, hop_length=160, n_mels=96, fmax=7000)
    D = librosa.power_to_db(S, ref=np.max); D = np.clip((D + 70) / 70, 0, 1)
    img = Image.fromarray((255 * D[::-1]).astype(np.uint8)).resize((int((b - a) * PX), H))
    im = Image.new('RGB', (img.width, H + 30), (20, 20, 20)); im.paste(img.convert('RGB'), (0, 30))
    d = ImageDraw.Draw(im)
    for c, t, e, s in l['chars']:
        x = (t - a) * PX
        d.line([(x, 30), (x, H + 30)], fill=(255, 60, 60), width=2)
        d.text((x + 2, 2), c, fill=(255, 230, 120), font=font)
    d.text((im.width - 140, 6), f'#{k} {a:.1f}s', fill=(150, 200, 255), font=small)
    rows.append(im)
for p in range(0, len(rows), 6):
    sub = rows[p:p+6]; Wd = max(r.width for r in sub)
    sheet = Image.new('RGB', (Wd, sum(r.height + 6 for r in sub)), (0, 0, 0)); yy = 0
    for r in sub: sheet.paste(r, (0, yy)); yy += r.height + 6
    sheet.save(f'out/spec_{p//6}.png'); print(f'out/spec_{p//6}.png', sheet.size)
