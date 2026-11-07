"""按内容长度重写 Markdown 表格的分隔线（pandoc 按短横数的比例分配列宽）。

每列的权重 = 0.5×平均长度 + 0.5×最大长度（汉字算 2，西文算 1），再按比例分成总共约 60 个短横，
每列至少 6 个。只改分隔线，不动内容。

用法：python3 排版/表格列宽.py 书稿/12-第02章.md [更多文件...]
"""
import re, sys, unicodedata

def width(s):
    s = re.sub(r"`[^`]*`|\*\*|\*", "", s)
    return sum(2 if unicodedata.east_asian_width(c) in "WF" else 1 for c in s.strip())

def fix_table(lines):
    rows = [[c for c in l.strip().strip("|").split("|")] for l in lines]
    sep_i = next(i for i, l in enumerate(lines) if re.match(r"^\|?[\s:\-|]+\|?$", l.strip()))
    body = [r for i, r in enumerate(rows) if i != sep_i]
    n = len(rows[sep_i])
    w = []
    for j in range(n):
        vals = [width(r[j]) if j < len(r) else 0 for r in body]
        w.append(0.5 * sum(vals) / max(1, len(vals)) + 0.5 * max(vals))
    total = sum(w) or 1
    dashes = [max(6, round(60 * x / total)) for x in w]
    old = rows[sep_i]
    cells = []
    for j, d in enumerate(dashes):
        o = old[j].strip() if j < len(old) else ""
        left, right = o.startswith(":"), o.endswith(":")
        cells.append((":" if left else "") + "-" * d + (":" if right else ""))
    lines[sep_i] = "|" + "|".join(cells) + "|"
    return lines

def process(md):
    out, buf, in_code = [], [], False
    for line in md.split("\n"):
        if line.startswith("```"):
            in_code = not in_code
        if not in_code and line.strip().startswith("|"):
            buf.append(line); continue
        if buf:
            out.extend(fix_table(buf) if len(buf) >= 2 else buf); buf = []
        out.append(line)
    if buf:
        out.extend(fix_table(buf) if len(buf) >= 2 else buf)
    return "\n".join(out)

for p in sys.argv[1:]:
    s = open(p, encoding="utf-8").read()
    t = process(s)
    if t != s:
        open(p, "w", encoding="utf-8").write(t)
        print("已改：", p)
