import re,glob,os
def stems(path):
    txt=open(path,encoding='utf-8').read()
    parts=re.split(r'^\[(\d+)\]\s*\([^)]*\)\s*$', txt, flags=re.M)
    out={}
    for i in range(1,len(parts),2): out[int(parts[i])]=parts[i+1].strip()
    return out
def secs(path):
    txt=open(path,encoding='utf-8').read()
    parts=re.split(r'^\[(\d+)\]\s*$', txt, flags=re.M)
    out={}
    for i in range(1,len(parts),2): out[int(parts[i])]=parts[i+1].strip()
    return out
for f in sorted(glob.glob('deepsrc/set*.md')):
    pad=re.search(r'(\d+)',f).group(1)
    st=stems(f'dump/set{pad}.txt'); sc=secs(f)
    nums=sorted(sc)
    miss=[n for n in nums if n not in st]
    out=[]
    for n in nums:
        out.append(f'[{n}]\n@题目\n{st[n]}\n\n{sc[n]}\n')
    open(f'deep/set{pad}.md','w',encoding='utf-8').write('\n'.join(out))
    exp=len(st)
    print(f, len(nums),'/',exp, 'missing-stem:',miss, '未写:',[i for i in range(1,exp+1) if i not in sc][:12])
