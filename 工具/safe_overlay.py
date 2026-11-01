"""在帧上画出平台界面大致会挡住的区域（红），每张输出 *_ov.png。
竖屏（1080×1920，抖音）：顶栏 y<200、右侧按钮列 x>930 且 y 760~1640、底部文案区 y>1560。
横屏（1920×1080，看图的宽高自动判断）：
  - 四周 5% 的边（x<96、x>1824、y<54、y>1026）：电视 / 播放器的"字幕安全框"之外，B 站暂停时的进度条也在最下面；
  - 右侧 x>1650 且 y>256：抖音竖着刷到横屏视频时，右边那一列点赞、评论按钮会压到画面上（按 1080 宽的手机屏估）。
用法：python3 工具/safe_overlay.py a.png b.png ..."""
import sys
from PIL import Image, ImageDraw

for f in sys.argv[1:]:
    im = Image.open(f).convert('RGBA')
    ov = Image.new('RGBA', im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    if im.width > im.height:
        boxes = [(0, 0, 1920, 54), (0, 1026, 1920, 1080), (0, 0, 96, 1080), (1824, 0, 1920, 1080), (1650, 256, 1920, 1080)]
    else:
        boxes = [(0, 0, 1080, 200), (930, 760, 1080, 1640), (0, 1560, 1080, 1920)]
    for box in boxes:
        d.rectangle(box, fill=(255, 0, 0, 70), outline=(255, 0, 0, 200), width=4)
    Image.alpha_composite(im, ov).convert('RGB').save(f.replace('.png', '_ov.png'))
