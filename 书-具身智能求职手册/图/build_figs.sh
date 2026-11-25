#!/usr/bin/env bash
# 编译插图：src/xx.tex → xx.pdf（印刷）+ xx.png（EPUB，200 dpi）
# 用法：bash 图/build_figs.sh [名字...]   不给名字就全编
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p build
names=("$@")
if [ ${#names[@]} -eq 0 ]; then
  for f in src/*.tex; do b=$(basename "$f" .tex); [[ "$b" == _* ]] || names+=("$b"); done
fi
for n in "${names[@]}"; do
  xelatex -interaction=nonstopmode -halt-on-error -output-directory=build "src/$n.tex" > "build/$n.out" 2>&1 \
    || { echo "失败：$n"; grep -A3 '^!' "build/$n.log" | head -12; exit 1; }
  cp "build/$n.pdf" "$n.pdf"
  pdftoppm -r 200 -png -singlefile "$n.pdf" "$n"
  w=$(pdfinfo "$n.pdf" | awk '/Page size/{printf "%.0f×%.0f mm", $3*25.4/72, $5*25.4/72}')
  echo "$n  $w"
done
