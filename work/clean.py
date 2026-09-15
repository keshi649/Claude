import json, re

ps = json.load(open("raw.json"))

# ---------- manual fixes (index -> (pattern, replacement)) ----------
FIX = {
 33: [("$f''(x)$ 的图形如图 2-1 所示", "$f''(x)$ 的图形如图所示（图略）")],
 271:[("$L_1,L_2,L_3$ 如图 9-1 所示", "$L_1,L_2,L_3$ 如图所示（图略）")],
 6:  [("（此小问根号形式在照片中不够清晰，可能是 $n$ 次根号，请对照原书）", "")],
 15: [("（说明：照片中 A 与 D 两项辨认结果相同，其中一项必有细节看不清，请对照原书）", "")],
 23: [("（该指数在照片中较模糊，请对照原书）", "")],
 30: [("（本题四个选项在照片中被相邻页面遮挡，仅部分可辨：其中一项为「设 $f(x)$ 在 $x=x_{0}$ 处取得极大值，则存在 $x_{0}$ 的邻域 $(x_{0}-\\sigma,x_{0}+\\sigma)$，使得 $f(x)$ 在 $(x_{0}-\\sigma,x_{0})$ 内单调递增，在 $(x_{0},x_{0}+\\sigma)$ 内单调递减」，其余选项**原书此处看不清**）",
       "其中一项为：设 $f(x)$ 在 $x=x_{0}$ 处取得极大值，则存在 $x_{0}$ 的邻域 $(x_{0}-\\sigma,x_{0}+\\sigma)$，使得 $f(x)$ 在 $(x_{0}-\\sigma,x_{0})$ 内单调递增，在 $(x_{0},x_{0}+\\sigma)$ 内单调递减．（其余选项待核对）")],
 32: [("（所求量在照片中被遮挡，**原书此处看不清**）", "（所求量待核对）")],
 54: [("C. ______（**原书此处看不清**，与 B 项辨认结果重复，请对照原书）", "C. ______（待核对）")],
 56: [("（A、B、C、D 四个选项**原书此处被裁掉**）", "（选项待核对）")],
 301:[("（原书此处被页边裁去）", "（此处待核对）")],
}

SKIP = set()
FLAG = {                   # 索引末尾需核对
 33:"原始摘录中无图 2-1，题干已保留，判断拐点个数需对照原书图形",
 271:"原始摘录中无图 9-1，题干已保留，$L_1,L_2,L_3$ 的具体弧段需对照原书图形",
 6:"（Ⅳ）根号形式（是否为 n 次根号）需核对",
 15:"选项 A 与 D 转写结果相同，需核对其一",
 23:"（Ⅱ）中指数 $\\frac{1}{n}\\ln\\cos x_n$ 需核对",
 30:"仅一个选项可辨，其余选项缺失",
 32:"所求量（结论部分）缺失",
 54:"选项 C 缺失",
 56:"四个选项缺失",
 301:"$Q(x,y)$ 表达式缺失",
 462:"条件事件中的不等号（$>$ 或 $\\geqslant$）不明，以 $\\square$ 占位",
 249:"原书标记性质存疑（题号上为叉形笔迹）",
 250:"原书标记性质存疑（题号上为叉形笔迹）",
}

LEAD = re.compile(r'^（[^）]*(?:原题|原书|标记|收录|题号|问标了问号|填空题|选择题|解答题)[^）]*）\s*')
MARK = re.compile(r'^\*\*(?:\(?\d+\)?|存疑\s*[AB])\.?\*\*\s*')

# ---------- 分类 ----------
def classify(p):
    f, h2 = p["file"], p["h2"]
    m = {"ch1":("高数","极限连续"),"ch2":("高数","一元微分"),"ch3":("高数","一元积分"),
         "ch4":("高数","空间解析几何"),"ch5":("高数","多元微分"),"ch6":("高数","重积分"),
         "ch7":("高数","微分方程"),"ch8":("高数","无穷级数"),"ch9":("高数","曲线曲面积分")}
    if f in m: return m[f]
    if f == "lin":
        for k,v in [("十一","矩阵"),("十二","向量组"),("十三","线性方程组"),("十四","相似矩阵")]:
            if k in h2: return ("线代", v)
    if f == "mix":
        for k,v in [("十五","二次型"),("十六","随机事件"),("十七","一维随机变量"),
                    ("十八","多维随机变量"),("十九","数字特征"),("二十章","大数定律")]:
            if k in h2: return ("线代" if v=="二次型" else "概率", v)
    if f == "stat":
        if "103" in h2: return ("概率","数字特征")
        if "二十一" in h2: return ("概率","数理统计")
        if "二十二" in h2: return ("概率","参数估计")
        if "二十三" in h2: return ("概率","假设检验")
    raise SystemExit("unclassified "+str(p)[:120])

# ---------- markdown -> blocks ----------
def md_table(lines):
    rows=[]
    for ln in lines:
        ln=ln.strip()
        if not ln.startswith("|"): continue
        cells=[c.strip() for c in ln.strip("|").split("|")]
        if all(re.fullmatch(r':?-{2,}:?', c) for c in cells): continue
        rows.append(cells)
    return rows

def segs(text):
    """split a text run into inline segments"""
    out=[]; i=0
    for m in re.finditer(r'\$\$(.+?)\$\$|\$(.+?)\$', text, re.S):
        if m.start()>i: out.append({"t":"s","v":text[i:m.start()]})
        tex = m.group(1) if m.group(1) is not None else m.group(2)
        out.append({"t":"m","v":tex.strip(),"d":1 if m.group(1) is not None else 0})
        i=m.end()
    if i<len(text): out.append({"t":"s","v":text[i:]})
    return out


SPECIAL = re.compile(r'(（?[①-⑩ⅠⅡⅢⅣⅤ]）?)')
def split_special(tex):
    parts=[]
    for piece in SPECIAL.split(tex):
        if not piece.strip(): continue
        if SPECIAL.fullmatch(piece): parts.append({"t":"s","v":piece})
        else:
            p=re.sub(r'^\\s*\\\\qquad\\s*','',piece).strip()
            if p: parts.append({"t":"m","v":p,"d":0})
    return parts


def split_options(para):
    if not re.match(r'^[A-D][.．]', para.strip()): return [para]
    out=[]; cur=''; inm=False; i=0
    while i < len(para):
        ch=para[i]
        if ch=='$': inm = not inm
        if (not inm) and ch in ' \u3000' and re.match(r'[\u3000 ]+[B-D][.．]', para[i:]):
            m=re.match(r'[\u3000 ]+', para[i:]); i+=m.end(); out.append(cur.strip()); cur=''
            continue
        cur+=ch; i+=1
    if cur.strip(): out.append(cur.strip())
    return out

def to_blocks(text):
    blocks=[]
    paras = re.split(r'\n\s*\n', text)
    for para in paras:
        para = para.strip('\n')
        if not para.strip(): continue
        if re.match(r'^\s*\|', para):
            blocks.append({"k":"table","rows":md_table(para.split("\n"))}); continue
        if re.match(r'^\s*>', para):      # 提取者批注，剔除
            continue
        para = re.sub(r'\n', ' ', para)
        dm = re.fullmatch(r'\s*\$\$(.+?)\$\$\s*', para, re.S)
        if dm:
            tex=dm.group(1).strip()
            if SPECIAL.search(tex):
                blocks.append({"k":"row","parts":split_special(tex)})
            else:
                blocks.append({"k":"disp","tex":tex})
            continue
        for sub in split_options(para):
            blocks.append({"k":"p","segs":segs(sub)})
    return blocks

out=[]
for i,p in enumerate(ps):
    if i in SKIP: continue
    t = p["raw"]
    for a,b in FIX.get(i,[]): 
        if a not in t: raise SystemExit("fix miss %d"%i)
        t = t.replace(a,b)
    t = MARK.sub('', t.lstrip())
    t = LEAD.sub('', t)
    t = re.sub(r'\*\*(.+?)\*\*', r'\1', t)
    t = t.strip()
    board, topic = classify(p)
    out.append({"src":i,"board":board,"topic":topic,"blocks":to_blocks(t),
                "flag":FLAG.get(i), "text":t})

json.dump(out, open("problems.json","w"), ensure_ascii=False)
from collections import Counter
c=Counter((o["board"],o["topic"]) for o in out)
for k,v in sorted(c.items()): print(k,v)
print("TOTAL", len(out))
print(Counter(o["board"] for o in out))
