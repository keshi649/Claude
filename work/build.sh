#!/bin/bash
CHR=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
rm -f /home/user/Claude/pdf/*.pdf
for f in html/练习*.html; do b=$(basename "$f" .html)
  $CHR --headless --disable-gpu --no-sandbox --no-pdf-header-footer \
       --print-to-pdf="/home/user/Claude/pdf/$b.pdf" --virtual-time-budget=20000 \
       "file://$PWD/$f" >/dev/null 2>&1
done
python3 - <<'PY'
import re,glob,os,json
pages=[]
for f in sorted(glob.glob("/home/user/Claude/pdf/*.pdf")):
    d=open(f,'rb').read(); n=len(re.findall(rb'/Type\s*/Page[^s]',d))
    pages.append(n); print(os.path.basename(f), n, "pages", len(d)//1024,"KB")
print("pages:",pages,"total",sum(pages))
json.dump(pages, open("pages.json","w"))
PY
