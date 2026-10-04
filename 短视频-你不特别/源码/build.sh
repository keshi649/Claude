#!/bin/bash
# 一键重新生成《你不特别》：下载字体 → 并行渲染画面 → 合成配乐 → 合成 MP4
# 依赖：node + playwright（自带 Chromium）、ffmpeg（含 libx264）、python3 + numpy + scipy
set -e
cd "$(dirname "$0")"
mkdir -p fonts out
for w in Regular Medium; do
  f="fonts/LXGWWenKai-$w.ttf"
  [ -f "$f" ] || curl -sSL -o "$f" "https://github.com/lxgw/LxgwWenKai/releases/download/v1.510/LXGWWenKai-$w.ttf"
done
FPS=30; TOTAL=$((160*FPS)); N=${WORKERS:-4}; CH=$((TOTAL/N))
pids=()
for i in $(seq 0 $((N-1))); do
  a=$((i*CH)); b=$(( i==N-1 ? TOTAL : (i+1)*CH ))
  node render.cjs video $a $b out/part$i.mp4 $FPS > out/log$i.txt 2>&1 &
  pids+=($!)
done
python3 audio.py out/audio.wav
for p in "${pids[@]}"; do wait $p; done
: > out/list.txt; for i in $(seq 0 $((N-1))); do echo "file 'part$i.mp4'" >> out/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/list.txt -c copy out/video_noaudio.mp4
ffmpeg -y -loglevel error -i out/video_noaudio.mp4 -i out/audio.wav -c:v libx264 -preset slow -tune animation -crf 21 \
  -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -shortest out/你不特别.mp4
echo "完成：$(pwd)/out/你不特别.mp4"
