#!/usr/bin/env bash
# 出成片：配乐 → 四路并行逐帧渲染 1080×1920 → 拼接 → 合成 → 量响度
# 用法：bash 源码/build.sh            （在 宣传片-拆解宇树/ 下或任意目录）
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p build/full ../成片
python3 audio/score.py build/audio.wav
segs=("0 19" "19 38.5" "38.5 57.5" "57.5 76.5")
i=0
for s in "${segs[@]}"; do
  set -- $s
  node render.js --scale 1 --from "$1" --to "$2" --crf 10 --preset fast --out build/full/seg$i.mp4 > build/full/seg$i.log 2>&1 &
  i=$((i+1))
done
wait
: > build/full/list.txt
for j in 0 1 2 3; do echo "file 'seg$j.mp4'" >> build/full/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i build/full/list.txt -c copy build/full/video.mp4
# 两遍编码，平均 4.8 Mbps：成片约 48 MB（CRF 19 是 89 MB，SSIM 只高 0.01，主要差在颗粒）
V=(-c:v libx264 -preset slow -b:v 4800k -maxrate 9000k -bufsize 12000k -profile:v high -pix_fmt yuv420p)
ffmpeg -y -loglevel error -i build/full/video.mp4 "${V[@]}" -pass 1 -passlogfile build/x264 -an -f mp4 /dev/null
ffmpeg -y -loglevel error -i build/full/video.mp4 -i build/audio.wav -map 0:v -map 1:a "${V[@]}" -pass 2 -passlogfile build/x264 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -movflags +faststart \
  -c:a aac -b:a 256k -ar 48000 -shortest ../成片/拆解宇树-宣传片.mp4
ffprobe -v error -show_entries format=duration,size,bit_rate -of default=nw=1 ../成片/拆解宇树-宣传片.mp4
ffmpeg -hide_banner -i ../成片/拆解宇树-宣传片.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
