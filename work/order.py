import json, random
from collections import defaultdict

ps = json.load(open("problems.json"))
random.seed(7)
bytopic = defaultdict(list)
for i,p in enumerate(ps): bytopic[p["topic"]].append(i)
for t in bytopic: random.shuffle(bytopic[t])

items=[]
for t,v in bytopic.items():
    n=len(v)
    off=random.random()
    for r,i in enumerate(v):
        items.append(((r+off)/n + random.uniform(-0.004,0.004), i))
items.sort()
order=[i for _,i in items]
T=lambda i: ps[i]["topic"]; B=lambda i: ps[i]["board"]

def ok_topic(o):
    return [k for k in range(1,len(o)) if T(o[k])==T(o[k-1])]

for _ in range(60):
    bad=ok_topic(order)
    if not bad: break
    for k in bad:
        for d in list(range(2,14))+list(range(-13,-1)):
            j=k+d
            if not (0<=j<len(order)): continue
            a,b=order[k],order[j]
            if T(b)==T(order[k-1]) or (k+1<len(order) and T(b)==T(order[k+1])): continue
            if T(a)==T(order[j-1]) if j>0 else False: continue
            if j+1<len(order) and T(a)==T(order[j+1]): continue
            if j>0 and T(a)==T(order[j-1]): continue
            order[k],order[j]=b,a
            break

def runs(o):
    out=[];s=0
    for k in range(1,len(o)+1):
        if k==len(o) or B(o[k])!=B(o[s]):
            if k-s>=4: out.append((s,k))
            s=k
    return out

for _ in range(80):
    rr=runs(order)
    if not rr: break
    for s,e in rr:
        k=s+2
        for d in list(range(2,25))+list(range(-24,-1)):
            j=k+d
            if not (0<=j<len(order)): continue
            a,b=order[k],order[j]
            if B(b)==B(a): continue
            if T(b) in (T(order[k-1]), T(order[k+1]) if k+1<len(order) else None): continue
            if (j>0 and T(a)==T(order[j-1])) or (j+1<len(order) and T(a)==T(order[j+1])): continue
            if (j>0 and B(a)==B(order[j-1]) and j>1 and B(a)==B(order[j-2])): continue
            order[k],order[j]=b,a
            break

assert len(set(order))==len(ps)
seq=[T(i) for i in order]; bseq=[B(i) for i in order]
print("adjacent same topic:", sum(1 for a,b in zip(seq,seq[1:]) if a==b))
mx=run=1
for a,b in zip(bseq,bseq[1:]):
    run=run+1 if a==b else 1; mx=max(mx,run)
print("max same-board run:",mx)
for t,v in sorted(bytopic.items()):
    pos=[k for k,i in enumerate(order) if T(i)==t]
    g=[b-a for a,b in zip(pos,pos[1:])] or [0]
    print(f"{t:8s} n={len(pos):3d} first={pos[0]:3d} last={pos[-1]:3d} gap {min(g)}~{max(g)}")
print("".join({'高数':'H','线代':'L','概率':'P'}[b] for b in bseq[:80]))
json.dump(order, open("order.json","w"))
