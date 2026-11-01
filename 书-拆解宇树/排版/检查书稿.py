"""书稿自查：字数、小标题间距、段落长度、禁用词、标点、图片、数字清单。

用法：
  python3 排版/检查书稿.py                 # 查全部
  python3 排版/检查书稿.py 书稿/22-第05章.md  # 查一章
输出：终端摘要；数字清单写到 排版/build/数字清单.txt（给事实核对用）。
"""
import os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

BANNED = [
    "在当今", "的时代背景下", "随着.{0,12}的快速发展", "在.{0,10}的背景下",
    "值得注意的是", "需要指出的是", "不难发现", "众所周知", "毋庸置疑", "不可否认",
    "深入探讨", "深度剖析", "全方位", "多维度", "一站式",
    "赋能", "抓手", "底层逻辑", "颗粒度", "打通",
    "释放潜能", "游戏规则改变者", "颠覆性", "革命性",
    "让我们一起", "接下来，让我们", "让我们来", "总而言之", "综上所述", "总的来说",
    "扮演着.{0,6}角色", "具有重要意义", "起到了关键作用", "至关重要",
    "首先，", "其次，", "最后，", "不仅仅是", "不禁", "仿佛在诉说",
    "一言以蔽之", "说白了就是", "毫无疑问",
]
CJK = r"一-鿿"

def cjk_len(s):
    return len(re.findall(f"[{CJK}]", s))

def strip_md(s):
    s = re.sub(r"```.*?```", "", s, flags=re.S)
    s = re.sub(r"`[^`]*`", "", s)
    s = re.sub(r"!\[[^\]]*\]\([^)]*\)(\{[^}]*\})?", "", s)
    s = re.sub(r"\$[^$]*\$", "", s)
    return s

def check(path, numbers_out):
    raw = open(path, encoding="utf-8").read()
    name = os.path.basename(path)
    text = strip_md(raw)
    issues = []
    total = cjk_len(text)

    # 小标题间距
    parts = re.split(r"(?m)^#{1,3} .*$", text)
    gaps = [cjk_len(p) for p in parts[1:]] if len(parts) > 1 else [total]
    max_gap = max(gaps) if gaps else 0
    if max_gap > 1300:
        issues.append(f"两个小标题之间最长 {max_gap} 字（建议 ≤1000）")

    # 段落
    paras = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    body = [p for p in paras if not re.match(r"^(#|:::|\||-|\*|\d+\.|>|```)", p)]
    long_paras = []
    for p in body:
        n_sent = len(re.findall(r"[。！？]", p))
        if n_sent > 6 or cjk_len(p) > 320:
            long_paras.append((n_sent, cjk_len(p), p[:24].replace("\n", " ")))
    for n, c, head in long_paras:
        issues.append(f"长段落（{n} 句 / {c} 字）：{head}…")

    # 禁用词
    for pat in BANNED:
        for m in re.finditer(pat, text):
            line = text[:m.start()].count("\n") + 1
            issues.append(f"禁用表达「{m.group(0)}」约第 {line} 行")

    # 标点
    excl = text.count("！") + len(re.findall(r"(?<=[" + CJK + r"])!", text))
    if excl > 1:
        issues.append(f"感叹号 {excl} 个")
    for m in re.finditer(r"[" + CJK + r"][,;:?](?=\s|[" + CJK + r"])|[" + CJK + r"]\((?=[" + CJK + r"])", text):
        line = text[:m.start()].count("\n") + 1
        issues.append(f"半角标点夹在中文里「{m.group(0)}」第 {line} 行")
    if re.search(r"[“”].*?\"|\".*?[“”]", text):
        pass

    # 小框与图片
    boxes = {k: len(re.findall(r"(?m)^:::[ \t]*" + k + r"\b", raw)) for k in ["engineer", "takeaway", "career", "try"]}
    figs = re.findall(r"!\[[^\]]*\]\(([^)]+)\)", raw)
    for f in figs:
        if not os.path.exists(os.path.join(ROOT, f)):
            issues.append(f"图片不存在：{f}")
    opens = len(re.findall(r"(?m)^:::[ \t]*\w", raw)); closes = len(re.findall(r"(?m)^:::[ \t]*$", raw))
    if opens != closes:
        issues.append(f"小框开闭数量不一致：开 {opens} / 闭 {closes}")

    # 数字清单
    for i, line in enumerate(raw.splitlines(), 1):
        for m in re.finditer(r"\d[\d,.]*\s*(%|％|万|亿|元|美元|台|kg|g|N·m|N\.m|m/s|km/h|Hz|mAh|Wh|V|A|TOPS|cm|mm|m|年|月|日|个|项|人|度|°|倍|秒|小时|分钟|自由度)?", line):
            if m.group(0).strip() and re.search(r"\d{2,}|\d\s*(%|万|亿|元|台|kg|N·m|m/s|Hz|mAh|Wh|TOPS|年)", m.group(0)):
                numbers_out.append(f"{name}:{i}: {m.group(0).strip()}  ← {line.strip()[:60]}")

    return dict(name=name, total=total, sections=len(re.findall(r"(?m)^## ", raw)),
                max_gap=max_gap, boxes=boxes, figs=len(figs), issues=issues)

def main():
    paths = sys.argv[1:] or sorted(glob.glob(os.path.join(ROOT, "书稿", "*.md")))
    nums = []
    grand = 0
    for p in paths:
        r = check(p, nums)
        grand += r["total"]
        b = r["boxes"]
        print(f"{r['name']:<14} 汉字 {r['total']:>6}  小节 {r['sections']:>2}  最长无标题 {r['max_gap']:>5}  "
              f"框 工{b['engineer']} 句{b['takeaway']} 转{b['career']} 动{b['try']}  图 {r['figs']}  问题 {len(r['issues'])}")
        for x in r["issues"]:
            print("    -", x)
    print(f"合计汉字：{grand}")
    os.makedirs(os.path.join(ROOT, "排版", "build"), exist_ok=True)
    with open(os.path.join(ROOT, "排版", "build", "数字清单.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(nums))

if __name__ == "__main__":
    main()
