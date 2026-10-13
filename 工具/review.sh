#!/bin/bash
# 从成片每秒抽一帧，拼成若干张预览图，通看一遍（横屏、竖屏都行）。用法：bash 工具/review.sh 成片.mp4 输出目录 [每张几帧，默认 24]
set -e
H=$(cd "$(dirname "$0")" && pwd); V="$1"; O="$2"; N="${3:-24}"
mkdir -p "$O/f"; rm -f "$O"/f/*.png "$O"/sheet_*.jpg "$O"/grp_*
W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$V")
if [ "$W" -gt 1500 ]; then SC=480:270; COLS=6; K=.25; else SC=270:480; COLS=8; K=.25; fi   # 横屏 / 竖屏
ffmpeg -v error -i "$V" -vf "fps=1,scale=$SC" "$O/f/%03d.png"
ls "$O"/f/*.png | split -l "$N" - "$O/grp_"
for g in "$O"/grp_*; do python3 "$H/sheet.py" "$O/sheet_$(basename "$g").jpg" $COLS $K $(cat "$g") > /dev/null; done
rm -f "$O"/grp_*
ls "$O"/sheet_*.jpg
