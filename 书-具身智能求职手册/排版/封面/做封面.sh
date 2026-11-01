#!/usr/bin/env bash
# 出封面：正封 PDF/JPG（电子书、预览）+ 印刷用全展开 PDF（按内文页数算书脊）
# 书脊宽度按 80 克胶版纸估算：页数 ÷ 2 × 0.1 mm + 0.5 mm（封面纸）。开印前请印厂按实际纸张确认。
set -euo pipefail
export LANG=C.UTF-8 LC_ALL=C.UTF-8
cd "$(dirname "$0")/../.."
mkdir -p 排版/build/封面 成品
pages=$(pdfinfo 成品/具身智能求职手册-内文.pdf | awk '/^Pages/{print $2}')
spine=$(python3 -c "print(round($pages/2*0.1+0.5,1))")
echo "\\def\\spinew{$spine}" > 排版/build/封面/书脊宽度.tex
for f in 封面-正面 封面-展开; do
  xelatex -interaction=nonstopmode -halt-on-error -output-directory=排版/build/封面 排版/封面/$f.tex > 排版/build/封面/$f.out 2>&1 \
    || { echo "失败：$f"; grep -A3 '^!' 排版/build/封面/$f.log | head; exit 1; }
done
cp 排版/build/封面/封面-展开.pdf 成品/封面-印刷展开.pdf
cp 排版/build/封面/封面-正面.pdf 成品/封面-正面.pdf
# 电子书封面：裁掉 3 mm 出血，宽 1600 像素
python3 - << 'PY'
import fitz
from PIL import Image
d=fitz.open('排版/build/封面/封面-正面.pdf'); pg=d[0]
mm=72/25.4; clip=fitz.Rect(3*mm,3*mm,173*mm,243*mm)
zoom=1600/(170*mm)
pix=pg.get_pixmap(matrix=fitz.Matrix(zoom,zoom), clip=clip)
img=Image.frombytes('RGB',(pix.width,pix.height),pix.samples)
img.save('成品/封面-电子书.jpg', quality=92)
img.resize((100,round(100*img.height/img.width))).save('排版/build/封面/缩略图-100px.png')
print('电子书封面', img.size)
PY
echo "内文 $pages 页，书脊 $spine mm；展开尺寸 $(pdfinfo 成品/封面-印刷展开.pdf | awk '/Page size/{printf "%.1f×%.1f mm", $3*25.4/72, $5*25.4/72}')"
