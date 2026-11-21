#!/usr/bin/env bash
# 《MOONRIDE》像素版：一键出片 → out/MOONRIDE像素版.mp4
# 原曲不进仓库：先把原版 MV 的音轨导出来放在这里，ffmpeg -i 原版MV.mp4 -vn -ac 2 -ar 44100 歌曲.wav
set -euo pipefail
cd "$(dirname "$0")"
SONG=${SONG:-歌曲.wav}
NAME=MOONRIDE像素版
FPS=30
mkdir -p out
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SONG")
N=$(python3 -c "import math;print(math.ceil($DUR*$FPS))")
node render.js check
echo "渲染 $N 帧（$DUR 秒）"
for i in 0 1 2 3; do
  a=$((N * i / 4)); b=$((N * (i + 1) / 4))
  ( node render.js video $a $b 2> out/log$i.txt | ffmpeg -y -loglevel error -f rawvideo -pix_fmt rgb24 -s 480x270 -r $FPS -i - \
      -vf scale=1920:1080:flags=neighbor -c:v libx264 -preset slow -tune animation -crf ${CRF:-18} -pix_fmt yuv420p \
      -x264-params keyint=60 out/part$i.mp4 ) &
done
wait
: > out/list.txt; for i in 0 1 2 3; do echo "file 'part$i.mp4'" >> out/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/list.txt -c copy out/video.mp4
python3 mix.py "$SONG" out/audio.wav
ffmpeg -y -loglevel error -i out/video.mp4 -i out/audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -aac_pns 0 -movflags +faststart -shortest out/$NAME.mp4
ls -la out/$NAME.mp4
