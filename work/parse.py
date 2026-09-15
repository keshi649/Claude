import re, os, json

UP = "/root/.claude/uploads/e6ee927a-bff5-56ec-ad96-0e04eaf8d349"
FILES = [
 ("5c26c7a9-2027________880____-___-________-___.md", "ch1"),
 ("df44c364-2027________880____-___-___________-___.md", "ch2"),
 ("e38eec1c-2027________880____-___-___________-___.md", "ch3"),
 ("cbe53b1a-2027________880____-___-______-___.md", "ch4"),
 ("c0b79060-2027________880____-___-___________-___.md", "ch5"),
 ("ba73d00f-2027________880____-___-_______-___.md", "ch6"),
 ("b2c1fc48-2027________880____-___-________-___.md", "ch7"),
 ("95a53f0d-2027________880____-___-____-___.md", "ch8"),
 ("f8a94b83-2027________880____-___-_________-___.md", "ch9"),
 ("0cea66af-2027________880____-_______-________________-___.md", "lin"),
 ("a25c5bd2-2027________880____-_______-____________-___.md", "mix"),
 ("46db10ed-____.md", "stat"),
]

START = re.compile(r'^\*\*(?:\(?\d+\)?|存疑\s*[AB])\.?\*\*')
SKIP_HEAD = ("需要你自己复核", "核对备注", "本次提取中不确定", "附：标记性质存疑")

def parse(path, tag):
    lines = open(os.path.join(UP, path), encoding='utf-8').read().split('\n')
    probs = []
    cur = None
    h2 = h3 = ""
    skipping = False
    for ln in lines:
        s = ln.strip()
        if s.startswith('## ') or s.startswith('# '):
            if cur: probs.append(cur); cur=None
            h2 = s.lstrip('#').strip(); h3 = ""
            skipping = any(k in h2 for k in SKIP_HEAD)
            continue
        if s.startswith('### '):
            if cur: probs.append(cur); cur=None
            h3 = s.lstrip('#').strip()
            continue
        if s.startswith('---'):
            if cur: probs.append(cur); cur=None
            continue
        if skipping and cur is None and '存疑' not in s:
            continue
        if START.match(s):
            if cur: probs.append(cur)
            cur = {"file": tag, "h2": h2, "h3": h3, "raw": [ln]}
        elif cur is not None:
            cur["raw"].append(ln)
    if cur: probs.append(cur)
    for p in probs:
        while p["raw"] and not p["raw"][-1].strip(): p["raw"].pop()
        p["raw"] = "\n".join(p["raw"])
    return probs

allp=[]
for f,t in FILES:
    ps = parse(f,t)
    print(t, len(ps))
    allp += ps
print("TOTAL", len(allp))
json.dump(allp, open("raw.json","w"), ensure_ascii=False, indent=1)
