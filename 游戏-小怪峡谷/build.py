"""把 src/ 里的脚本、像素字体（只留用到的字）、播报语音拼成一个能直接打开的网页：小怪峡谷.html。
字体：缝合像素字体 Fusion Pixel 12px（SIL OFL 1.1，保留字体名 'Fusion Pixel'）。取子集算修改，按 OFL 要改名，
所以嵌进去的子集叫 XGPixel，版权和许可证信息留在字体的 name 表里。字体文件构建时从 npm 下载并校验 sha256，不进仓库。
用法：python3 build.py   （需要 pip install fonttools brotli）
"""
import base64
import hashlib
import io
import json
import os
import re
import subprocess
import sys
import tarfile
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
ORDER = ['data.js', 'sim.js', 'ai.js', 'sprites.js', 'mapgfx.js', 'render.js', 'hud.js', 'input.js', 'audio.js', 'main.js']
FONT = os.path.join(HERE, 'fonts', 'FusionPixel12.woff2')
FONT_URL = 'https://registry.npmjs.org/@fontsource/fusion-pixel-12px-proportional-sc/-/fusion-pixel-12px-proportional-sc-5.3.0.tgz'
FONT_IN_TGZ = 'package/files/fusion-pixel-12px-proportional-sc-latin-400-normal.woff2'
FONT_SHA = '043eae5e616b0d1e75dc746d3d687b4413f9f1c70c1a09bc4ebb705ef1cc8e32'
OUT = os.path.join(HERE, '小怪峡谷.html')


def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()


def fetch_font():
    if os.path.exists(FONT) and sha(FONT) == FONT_SHA:
        return
    os.makedirs(os.path.dirname(FONT), exist_ok=True)
    print('下载字体', FONT_URL)
    data = urllib.request.urlopen(FONT_URL).read()
    with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as t:
        f = t.extractfile(FONT_IN_TGZ).read()
    open(FONT, 'wb').write(f)
    if sha(FONT) != FONT_SHA:
        sys.exit('字体的 sha256 对不上')


def subset_font(text):
    from fontTools import subset
    from fontTools.ttLib import TTFont
    font = TTFont(FONT)
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['*']
    opts.name_IDs = ['*']
    opts.name_legacy = True
    opts.name_languages = ['*']
    sub = subset.Subsetter(opts)
    sub.populate(text=text)
    sub.subset(font)
    # 改名：子集不能再叫 Fusion Pixel
    for rec in font['name'].names:
        if rec.nameID in (1, 3, 4, 6, 16, 17, 21, 22):
            s = rec.toUnicode()
            s = re.sub(r'Fusion[ ]?Pixel', 'XGPixel', s, flags=re.I)
            s = re.sub(r'缝合像素', '小怪像素', s)
            rec.string = s
    buf = io.BytesIO()
    font.flavor = 'woff2'
    font.save(buf)
    return buf.getvalue()


def main():
    fetch_font()
    js = []
    for f in ORDER:
        s = open(os.path.join(SRC, f), encoding='utf-8').read()
        s = re.sub(r"\nif \(typeof module !== 'undefined'\) module\.exports = \{\};\n?", '\n', s)
        js.append(f'/* ===== {f} ===== */\n' + s)
    # 播报语音
    vdir = os.path.join(HERE, 'voice', 'mp3')
    voice = {}
    if os.path.isdir(vdir):
        for f in sorted(os.listdir(vdir)):
            if f.endswith('.mp3'):
                voice[f[:-4]] = base64.b64encode(open(os.path.join(vdir, f), 'rb').read()).decode()
    js.insert(0, 'const VOICE = ' + json.dumps(voice) + ';')
    script = '\n'.join(js)
    shell = open(os.path.join(SRC, 'shell.html'), encoding='utf-8').read()
    # 字体子集：源码和页面里出现过的所有字 + 可打印 ASCII
    chars = set(chr(c) for c in range(0x20, 0x7f))
    for s in (script, shell):
        chars.update(ch for ch in s if ord(ch) > 0x7f)
    chars.update('０１２３４５６７８９，。！？：；、“”…·—《》（）')
    text = ''.join(sorted(chars))
    woff2 = subset_font(text)
    page = shell.replace('__FONT__', base64.b64encode(woff2).decode()).replace('__SCRIPT__', script)
    open(OUT, 'w', encoding='utf-8').write(page)
    kb = os.path.getsize(OUT) / 1024
    print(f'{OUT}：{kb:.0f} KB（字体子集 {len(woff2) / 1024:.0f} KB，{len(text)} 个字；语音 {len(voice)} 句）')
    for f in ORDER:
        r = subprocess.run(['node', '--check', os.path.join(SRC, f)], capture_output=True, text=True)
        if r.returncode:
            sys.exit(r.stderr)


if __name__ == '__main__':
    main()
