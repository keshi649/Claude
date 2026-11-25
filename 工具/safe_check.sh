#!/bin/bash
# 安全区：从成片抽几帧，叠上平台界面会挡住的区域（红），拼成一张图看。
# 用法：bash 工具/safe_check.sh 成片.mp4 输出目录 时间1 时间2 ...
#       挑开头标题、盖章、对话框、最长的字幕、各种标签和数字出现的时刻
set -e
H=$(cd "$(dirname "$0")" && pwd); F="$1"; O="$2"; shift 2
mkdir -p "$O"; rm -f "$O"/f_*.png
ovs=()
for t in "$@"; do ffmpeg -v error -y -ss "$t" -i "$F" -frames:v 1 "$O/f_$t.png"; ovs+=("$O/f_${t}_ov.png"); done
python3 "$H/safe_overlay.py" "$O"/f_*[0-9].png
W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$F")
if [ "$W" -gt 1500 ]; then python3 "$H/sheet.py" "$O/safe.jpg" 3 .33 "${ovs[@]}"; else python3 "$H/sheet.py" "$O/safe.jpg" 8 .25 "${ovs[@]}"; fi
