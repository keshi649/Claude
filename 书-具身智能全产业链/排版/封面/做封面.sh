#!/usr/bin/env bash
# 出封面：正封 PDF/JPG（电子书、预览）+ 印刷用全展开 PDF（按内文页数算书脊）
# 书脊宽度按 80 克胶版纸估算：页数 ÷ 2 × 0.1 mm + 0.5 mm（封面纸）。开印前请印厂按实际纸张确认。
set -euo pipefail
export LANG=C.UTF-8 LC_ALL=C.UTF-8
cd "$(dirname "$0")/../.."
mkdir -p 排版/build/封面 成品
pages=$(pdfinfo 成品/具身智能全产业链-内文.pdf | awk '/^Pages/{print $2}')
spine=$(python3 -c "print(round($pages/2*0.1+0.5,1))")
echo "\\def\\spinew{$spine}" > 排版/build/封面/书脊宽度.tex
for f in 封面-正面 封面-展开; do
  xelatex -interaction=nonstopmode -halt-on-error -output-directory=排版/build/封面 排版/封面/$f.tex > 排版/build/封面/$f.out 2>&1 \
    || { echo "失败：$f"; grep -A3 '^!' 排版/build/封面/$f.log | head; exit 1; }
done
cp 排版/build/封面/封面-展开.pdf 成品/封面-印刷展开.pdf
cp 排版/build/封面/封面-正面.pdf 成品/封面-正面.pdf
# 电子书封面：先按 600 dpi 栅格化，再裁掉 3 mm 出血、缩到宽 1600 像素（不依赖 PyMuPDF）
pdftoppm -r 600 -png -singlefile 排版/build/封面/封面-正面.pdf 排版/build/封面/正面-600dpi
python3 - << 'PY'
from PIL import Image
im = Image.open('排版/build/封面/正面-600dpi.png').convert('RGB')
px_per_mm = im.width / 176.0
b = round(3 * px_per_mm)
im = im.crop((b, b, im.width - b, im.height - b))
w = 1600
im = im.resize((w, round(w * im.height / im.width)), Image.LANCZOS)
im.save('成品/封面-电子书.jpg', quality=92)
im.resize((100, round(100 * im.height / im.width)), Image.LANCZOS).save('排版/build/封面/缩略图-100px.png')
im.convert('L').resize((100, round(100 * im.height / im.width)), Image.LANCZOS).save('排版/build/封面/缩略图-100px-灰度.png')
print('电子书封面', im.size)
PY
echo "内文 $pages 页，书脊 $spine mm；展开尺寸 $(pdfinfo 成品/封面-印刷展开.pdf | awk '/Page size/{printf "%.1f×%.1f mm", $3*25.4/72, $5*25.4/72}')"
