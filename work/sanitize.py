import re,glob
REPL=[(r'\qquad',' '),(r'\quad',' '),(r'\,',' '),(r'\;',' '),(r'\:',' '),(r'\!',' '),
      (r'\bigg',''),(r'\Bigg',''),(r'\big',''),(r'\Big',''),(r'\left',''),(r'\right','')]
n=0
for f in sorted(glob.glob('deepsrc/set*.md')):
    t=open(f,encoding='utf-8').read(); o=t
    for a,b in REPL: t=t.replace(a,b)
    if t!=o: open(f,'w',encoding='utf-8').write(t); n+=1
print('sanitized',n)
