"""在帧上画出抖音界面大致会挡住的区域（红）：顶栏 y<200、右侧按钮列 x>930 且 y 760~1640、底部文案区 y>1560。
用法：python3 工具/safe_overlay.py a.png b.png ...   （每张输出 *_ov.png）"""
import sys
from PIL import Image, ImageDraw

for f in sys.argv[1:]:
    im = Image.open(f).convert('RGBA')
    ov = Image.new('RGBA', im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    for box in [(0, 0, 1080, 200), (930, 760, 1080, 1640), (0, 1560, 1080, 1920)]:
        d.rectangle(box, fill=(255, 0, 0, 70), outline=(255, 0, 0, 200), width=4)
    Image.alpha_composite(im, ov).convert('RGB').save(f.replace('.png', '_ov.png'))
