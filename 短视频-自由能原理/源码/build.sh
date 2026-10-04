#!/bin/bash
# 一键重新生成《大脑只做一件事》：下载字体 → 并行渲染画面 → 合成配乐 → 合成 MP4
# 依赖：node + playwright（自带 Chromium）、ffmpeg（含 libx264）、python3 + numpy + scipy、unzip
set -e
cd "$(dirname "$0")"
mkdir -p fonts out
if [ ! -f fonts/SourceHanSansSC-Medium.otf ] || [ ! -f fonts/SourceHanSansSC-Heavy.otf ]; then
  curl -sSL -o out/shs.zip https://github.com/adobe-fonts/source-han-sans/releases/download/2.004R/SourceHanSansSC.zip
  unzip -o -j -q out/shs.zip OTF/SimplifiedChinese/SourceHanSansSC-Medium.otf OTF/SimplifiedChinese/SourceHanSansSC-Heavy.otf -d fonts
fi
if [ ! -f fonts/SmileySans-Oblique.ttf ]; then
  curl -sSL -o out/smiley.zip https://github.com/atelier-anchor/smiley-sans/releases/download/v2.0.1/smiley-sans-v2.0.1.zip
  unzip -o -j -q out/smiley.zip SmileySans-Oblique.ttf -d fonts
fi
FPS=30; TOTAL=$((186*FPS)); N=${WORKERS:-4}; CH=$((TOTAL/N))
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
  -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -shortest out/大脑只做一件事.mp4
echo "完成：$(pwd)/out/大脑只做一件事.mp4"
