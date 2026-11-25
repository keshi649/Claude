"""查 PDF 里的汉字用的是不是简体中文字形。

Noto CJK 的 TTC 里，日、韩、简、繁、港几个面共用一套字形，只是 cmap 不同，
所以 pdffonts 里名字都叫 "...CJKjp"。要验证，就看 PDF 里每个汉字的字形编号
和 TTC 里哪一面的 cmap 对得上。只要有一个字只对得上日文面（比如"骨、直、角、述"），
就说明 FontIndex 设错了。

用法：python3 排版/查字形.py 成品/具身智能求职手册-内文.pdf
"""
import sys
from collections import Counter, defaultdict

import pymupdf
from fontTools.ttLib import TTCollection

DIR = "/usr/share/fonts/opentype/noto/"
FACES = ["日", "韩", "简", "繁", "港", "等宽日", "等宽韩", "等宽简", "等宽繁", "等宽港"]


def ttc_for(fontname):
    """PDF 里的字体名（去掉子集前缀）→ TTC 文件名。"""
    name = fontname.split("+")[-1]
    family = "NotoSerifCJK" if name.startswith("NotoSerif") else "NotoSansCJK"
    weight = name.split("-")[1] if "-" in name else "Regular"
    return f"{DIR}{family}-{weight}.ttc"


def is_cjk(ch):
    return 0x4E00 <= ord(ch) <= 0x9FFF


def main(pdf):
    seen = defaultdict(Counter)  # TTC 文件 → {(字, 字形编号): 次数}
    for page in pymupdf.open(pdf):
        for span in page.get_texttrace():
            font = span["font"]
            if "CJK" not in font:
                continue
            for ch, gid, *_ in span["chars"]:
                if gid >= 0 and is_cjk(chr(ch)):
                    seen[ttc_for(font)][(chr(ch), gid)] += 1

    bad = 0
    for path, chars in sorted(seen.items()):
        fonts = TTCollection(path).fonts
        index = {g: i for i, g in enumerate(fonts[0].getGlyphOrder())}
        need = {ord(ch) for ch, _ in chars}
        gid_of = [{u: index[g] for u, g in f.getBestCmap().items() if u in need} for f in fonts]
        faces = Counter()
        only_other = []
        for (ch, gid), n in chars.items():
            hits = [i for i, m in enumerate(gid_of) if m.get(ord(ch)) == gid]
            if 2 in hits or 7 in hits:
                faces["简" if 2 in hits else "等宽简"] += n
            else:
                only_other.append((ch, [FACES[i] for i in hits]))
        bad += len(only_other)
        print(f"{path.rsplit('/', 1)[-1]}：{len(chars)} 种字形，"
              f"对得上简体面的 {sum(faces.values())} 处" +
              (f"；对不上的 {len(only_other)} 个：{only_other[:10]}" if only_other else ""))
    print("结论：" + ("全部是简体中文字形" if bad == 0 else f"有 {bad} 个字形不是简体，查 FontIndex"))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
