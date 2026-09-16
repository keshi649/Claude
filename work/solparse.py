import re, json, sys, glob, os
def parse(path):
    txt=open(path,encoding='utf-8').read()
    parts=re.split(r'^\[(\d+)\]\s*$', txt, flags=re.M)
    out={}
    for i in range(1,len(parts),2):
        out[int(parts[i])]=parts[i+1].strip()
    return out
if __name__=="__main__":
    for f in sorted(glob.glob("sol/set*.md")):
        d=parse(f); print(f, len(d), "缺号:", [k for k in range(1,max(d)+1) if k not in d])
