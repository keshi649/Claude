"""把书稿里的半角双引号 "..." 换成中文引号 “...”（代码块、行内代码、链接地址不动）。

用法：python3 排版/规范标点.py 书稿/11-第01章.md [更多文件...]
"""
import re, sys

def fix_text(seg):
    out, open_ = [], True
    for ch in seg:
        if ch == '"':
            out.append('“' if open_ else '”'); open_ = not open_
        else:
            out.append(ch)
    return ''.join(out)

def fix(md):
    # 按代码块切开
    parts = re.split(r'(```.*?```)', md, flags=re.S)
    res = []
    for i, part in enumerate(parts):
        if i % 2 == 1:
            res.append(part); continue
        # 段落逐个处理，保证引号在段内配对
        paras = re.split(r'(\n\s*\n)', part)
        for j, p in enumerate(paras):
            if j % 2 == 1: res.append(p); continue
            # 保护行内代码、链接/图片地址、属性块
            keep = []
            def stash(m):
                keep.append(m.group(0)); return f'\x00{len(keep)-1}\x00'
            q = re.sub(r'`[^`]*`|\]\([^)]*\)|\{[^}]*\}', stash, p)
            q = fix_text(q)
            q = re.sub(r'\x00(\d+)\x00', lambda m: keep[int(m.group(1))], q)
            res.append(q)
    return ''.join(res)

for path in sys.argv[1:]:
    s = open(path, encoding='utf-8').read()
    t = fix(s)
    if t != s:
        open(path, 'w', encoding='utf-8').write(t)
        print('已改：', path, s.count('"'), '个半角引号')
