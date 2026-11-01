#!/usr/bin/env bash
# 出书：把 书稿/*.md 拼起来，排成 PDF（内文）和 EPUB。
# 用法：bash 排版/build.sh [pdf|epub|all]   （在 书-拆解宇树/ 下运行，或任意目录用绝对路径运行）
set -euo pipefail
export LANG=C.UTF-8 LC_ALL=C.UTF-8
cd "$(dirname "$0")/.."
what="${1:-all}"
mkdir -p 成品 排版/build

mapfile -t files < <(grep -v '^#' "${MANIFEST:-书稿/目录.txt}" | grep -v '^$' | sed 's#^#书稿/#')
for f in "${files[@]}"; do [ -f "$f" ] || { echo "缺文件：$f"; exit 1; }; done

if [[ "$what" == pdf || "$what" == all ]]; then
  pandoc "${files[@]}" -f markdown+raw_tex-smart -t latex \
    --template=排版/模板.tex --lua-filter=排版/书稿.lua \
    --top-level-division=chapter --highlight-style=monochrome --columns=10 \
    -o 排版/build/拆解宇树.tex
  for i in 1 2 3; do
    xelatex -interaction=nonstopmode -halt-on-error -output-directory=排版/build 排版/build/拆解宇树.tex > 排版/build/xelatex.log 2>&1 || {
      echo "XeLaTeX 出错，看 排版/build/拆解宇树.log："; grep -n -A3 '^!' 排版/build/拆解宇树.log | head -30; exit 1; }
  done
  cp 排版/build/拆解宇树.pdf 成品/拆解宇树-内文.pdf
  echo "PDF：成品/拆解宇树-内文.pdf，$(pdfinfo 成品/拆解宇树-内文.pdf | awk '/^Pages/{print $2}') 页"
  grep -c "Overfull \\\\hbox" 排版/build/拆解宇树.log | sed 's/^/Overfull hbox 个数：/' || true
fi

if [[ "$what" == epub || "$what" == all ]]; then
  # 电子书的版权页单独一个文件（纸书的在 排版/前置页.tex，两边要一起改）。
  # 封面图换成 ASCII 文件名：有的阅读器和电子书平台不认中文文件名。
  cover=()
  [ -f 成品/封面-电子书.jpg ] && cp 成品/封面-电子书.jpg 排版/build/cover.jpg && cover=(--epub-cover-image=排版/build/cover.jpg)
  pandoc 排版/版权页-电子书.md "${files[@]}" -f markdown-raw_tex-smart -t epub3 \
    --lua-filter=排版/书稿.lua --lua-filter=排版/公式.lua --css=排版/epub.css --toc --toc-depth=1 --split-level=1 \
    --metadata-file=排版/epub-meta.yaml "${cover[@]}" \
    -o 成品/拆解宇树.epub
  echo "EPUB：成品/拆解宇树.epub，$(du -h 成品/拆解宇树.epub | cut -f1)"
fi
