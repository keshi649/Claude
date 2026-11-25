"""生成附录 A《面试题索引》，顺便给各章的面试题标题补上锚点。

面试题标题的格式：`### 5.3　题目`（三级标题，编号后面是一个全角空格）。
脚本会给没有锚点的题目补上 `{#q5-3}`，再生成 书稿/80-附录A-题目索引.md。
PDF 里每题后面带页码，EPUB 里是可以点的链接。
用法：python3 排版/题目索引.py
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOK = os.path.join(ROOT, "书稿")
Q = re.compile(r"^### (\d+)\.(\d+)　(.*?)(?:\s*\{#q\d+-\d+\})?\s*$")

order = [l.strip() for l in open(os.path.join(BOOK, "目录.txt"), encoding="utf-8")
         if l.strip() and not l.startswith("#")]
out = ["```{=latex}", "\\appendix", "```", "", "# 面试题索引", "",
       "第 4 到 10 章的全部面试题，按岗位排列。PDF 版每题后面是页码，电子书可以直接点题号跳过去。", ""]
total = 0
for name in order:
    path = os.path.join(BOOK, name)
    if not os.path.exists(path) or name.startswith("80-"):
        continue
    lines = open(path, encoding="utf-8").read().split("\n")
    chapter, items, changed = None, [], False
    for i, line in enumerate(lines):
        if line.startswith("# ") and chapter is None:
            chapter = re.sub(r"\s*\{[^}]*\}\s*$", "", line[2:])
        m = Q.match(line)
        if m:
            c, n, title = m.groups()
            new = f"### {c}.{n}　{title} {{#q{c}-{n}}}"
            if new != line:
                lines[i] = new
                changed = True
            items.append((c, n, title))
    if changed:
        open(path, "w", encoding="utf-8").write("\n".join(lines))
    if items:
        out += [f"## 第 {items[0][0]} 章　{chapter}", ""]
        for c, n, title in items:
            # 页码：放得下就靠右放在同一行，放不下就整行换到下一行靠右（TeXbook 第 14 章的写法）
            out.append(f"- [{c}.{n}](#q{c}-{n})　{title}`\\unskip\\nobreak\\hfil\\penalty50\\hskip2em\\hbox{{}}\\nobreak\\hfil 第~\\pageref{{q{c}-{n}}}~页{{\\parfillskip=0pt\\par}}`{{=latex}}")
        out.append("")
        total += len(items)
out.append(f"共 {total} 道题。")
open(os.path.join(BOOK, "80-附录A-题目索引.md"), "w", encoding="utf-8").write("\n".join(out) + "\n")
print(f"题目 {total} 道，写入 书稿/80-附录A-题目索引.md")
