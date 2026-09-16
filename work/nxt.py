import re,sys
s=sys.argv[1]; a=int(sys.argv[2]); b=int(sys.argv[3])
def load(p):
    t=open(p,encoding='utf-8').read()
    parts=re.split(r'^\[(\d+)\]',t,flags=re.M)
    return {int(parts[i]):parts[i+1].strip() for i in range(1,len(parts),2)}
P=load('dump/set%s.txt'%s)
try: S=load('sol/set%s.md'%s)
except Exception: S={}
for n in range(a,b+1):
    print('='*20+'[%d]'%n)
    print(P.get(n,'MISSING'))
    if n in S: print('---简答---'); print(S[n])
