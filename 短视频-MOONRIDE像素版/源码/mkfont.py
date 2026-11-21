# 把缝合像素字体 Fusion Pixel 12px（SIL OFL，npm 包 @fontsource/fusion-pixel-12px-proportional-sc@5.3.0，
# woff2 的 sha256 043eae5e616b0d1e75dc746d3d687b4413f9f1c70c1a09bc4ebb705ef1cc8e32）里用到的字取成点阵，写进 glyphs.json。
# 用法：python mkfont.py 字体.woff2 glyphs.json   （要 fonttools、brotli、pillow）
import sys, json, io
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

CHARS = ''.join(chr(c) for c in range(32, 127)) + '甜菜出品歌曲像素画面照原版逐镜重绘用代码生成帧：·《》—…♥'

src, out = sys.argv[1], sys.argv[2]
f = TTFont(src); f.flavor = None
buf = io.BytesIO(); f.save(buf); buf.seek(0)
font = ImageFont.truetype(buf, 12)
cmap = f.getBestCmap()
G = {}
for ch in CHARS:
    if ord(ch) not in cmap and ch != ' ':
        print('缺字', ch); continue
    adv = int(round(font.getlength(ch)))
    im = Image.new('L', (24, 16), 0)
    ImageDraw.Draw(im).text((2, 0), ch, font=font, fill=255)
    rows = []
    for y in range(16):
        rows.append(''.join('1' if im.getpixel((x, y)) > 110 else '0' for x in range(24)))
    G[ch] = {'adv': adv, 'rows': rows}
# 统一裁掉左边的 2 列空白（画的时候 x 从 2 开始）
for ch in G:
    G[ch]['rows'] = [r[2:] for r in G[ch]['rows']]
json.dump(G, open(out, 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(G), 'glyphs')
