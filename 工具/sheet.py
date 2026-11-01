"""把若干张帧拼成一张预览图：python3 工具/sheet.py 输出.jpg 每行几张 缩放 a.png b.png ...
竖屏帧按 1080×1920、横屏帧按 1920×1080 缩放（看第一张图的宽高自动判断）。"""
import sys
from PIL import Image, ImageDraw
out, cols, sc = sys.argv[1], int(sys.argv[2]), float(sys.argv[3])
files = sys.argv[4:]
fw, fh = Image.open(files[0]).size
w, h = (int(1920 * sc), int(1080 * sc)) if fw > fh else (int(1080 * sc), int(1920 * sc))
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w + (cols - 1) * 6, rows * (h + 22)), (40, 40, 40))
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((w, h), Image.LANCZOS)
    x, y = (i % cols) * (w + 6), (i // cols) * (h + 22)
    sheet.paste(im, (x, y + 22))
    ImageDraw.Draw(sheet).text((x + 4, y + 4), f.split('/')[-1], fill=(255, 255, 0))
sheet.save(out, quality=88)
print(out, sheet.size)
