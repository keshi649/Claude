import re,glob
BAD=['\\\\left','\\\\right','\\\\quad','\\\\qquad','\\\;','\\\\,','\\\\:','\\\\!',
     '\\\\bigg','\\\\Bigg','\\\\big','\\\\Big','\\\\vspace','\\\\hspace','arraystretch',r'\bdA\b']
tot=0
for f in sorted(glob.glob('deepsrc/set*.md')):
    txt=open(f,encoding='utf-8').read()
    for pat in BAD:
        for m in re.finditer(pat,txt):
            ln=txt[:m.start()].count('\n')+1
            print(f'{f}:{ln}: {m.group(0)}'); tot+=1
print('violations',tot)
