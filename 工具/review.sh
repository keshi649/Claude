#!/bin/bash
# 从成片每秒抽一帧，拼成若干张预览图，通看一遍。用法：bash 工具/review.sh 成片.mp4 输出目录 [每张几帧，默认 24]
set -e
H=$(cd "$(dirname "$0")" && pwd); V="$1"; O="$2"; N="${3:-24}"
mkdir -p "$O/f"; rm -f "$O"/f/*.png "$O"/sheet_*.jpg "$O"/grp_*
ffmpeg -v error -i "$V" -vf "fps=1,scale=270:480" "$O/f/%03d.png"
ls "$O"/f/*.png | split -l "$N" - "$O/grp_"
for g in "$O"/grp_*; do python3 "$H/sheet.py" "$O/sheet_$(basename "$g").jpg" 8 .25 $(cat "$g") > /dev/null; done
rm -f "$O"/grp_*
ls "$O"/sheet_*.jpg
