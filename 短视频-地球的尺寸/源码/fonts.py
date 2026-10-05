"""Cormorant Garamond 默认是旧式数字（高低错落），参考片里的年份是齐线数字。
Canvas 不能开 OpenType 特性，所以把 'lnum' 的替换直接写进字体的 cmap，另存一份。
用法：python3 fonts.py   （需要 fonttools）
"""
from fontTools.ttLib import TTFont

for src, dst in [('fonts/Cormorant.ttf', 'fonts/CormorantLining.ttf'),
                 ('fonts/Cormorant-Italic.ttf', 'fonts/CormorantLining-Italic.ttf')]:
    f = TTFont(src)
    gsub = f['GSUB'].table
    sub = {}
    for fr in gsub.FeatureList.FeatureRecord:
        if fr.FeatureTag != 'lnum':
            continue
        for li in fr.Feature.LookupListIndex:
            lk = gsub.LookupList.Lookup[li]
            for st in lk.SubTable:
                if lk.LookupType == 7:          # 扩展查找：取里面真正的单替换
                    st = st.ExtSubTable
                if hasattr(st, 'mapping'):
                    sub.update(st.mapping)
    for table in f['cmap'].tables:
        for cp, name in list(table.cmap.items()):
            if name in sub:
                table.cmap[cp] = sub[name]
    f.save(dst)
    print(dst, '替换了', len(sub), '个字形')
