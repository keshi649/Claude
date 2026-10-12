"""下载融合像素字体（Fusion Pixel Font 12px 比例宽度，SIL OFL 1.1）的简体中文 WOFF2 分片，合成一个 TTF。
Canvas 画字前不好按 unicode-range 逐片加载，所以合成一个完整文件。
用法：python3 fonts.py    （需要 fonttools、brotli）
"""
import io, os, tarfile, urllib.request
from fontTools.ttLib import TTFont
from fontTools.merge import Merger

URL = 'https://registry.npmjs.org/@vp-tw/cjk-web-fonts-fusion-pixel-font/-/cjk-web-fonts-fusion-pixel-font-0.0.1.tgz'
PREFIX = 'package/dist/12px/proportional/zh_hans/'
os.makedirs('fonts/tmp', exist_ok=True)
tmp = []
with tarfile.open(fileobj=io.BytesIO(urllib.request.urlopen(URL).read())) as tar:
    for m in sorted(tar.getmembers(), key=lambda m: m.name):
        if m.name.startswith(PREFIX) and m.name.endswith('.woff2'):
            f = TTFont(io.BytesIO(tar.extractfile(m).read())); f.flavor = None
            p = f'fonts/tmp/{len(tmp)}.ttf'; f.save(p); tmp.append(p)
Merger().merge(tmp).save('fonts/FusionPixel12.ttf')
for p in tmp:
    os.remove(p)
os.rmdir('fonts/tmp')
print('fonts/FusionPixel12.ttf ←', len(tmp), '个分片')
