#!/bin/bash
# 量成片：时长、大小、前 20 秒切镜头的时刻、响度和真峰值。用法：bash 工具/measure.sh 成片.mp4
F="$1"
echo "时长 $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$F") 秒，大小 $(python3 -c 'import os,sys;print(round(os.path.getsize(sys.argv[1])/1048576,1))' "$F") MB（超过 30 MB 要切）"
echo "前 20 秒切镜头（scene>0.25，要 ≥ 3 次；颜色相近的两个镜头测不出来，要对照分镜数）："
ffmpeg -hide_banner -t 20 -i "$F" -vf "select='gt(scene,0.25)',showinfo" -f null - 2>&1 | grep -o "pts_time:[0-9.]*" | sed 's/pts_time:/  /'
echo "响度（约 −16 LUFS）、真峰值（< −0.5 dBTP）："
ffmpeg -nostats -i "$F" -af ebur128=peak=true -f null - 2>&1 | grep -A 14 "Summary" | grep -E "I:|Peak:" | sed 's/^ */  /'
