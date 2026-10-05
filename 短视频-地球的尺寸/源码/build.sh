#!/bin/bash
# 一键重新生成《地球的尺寸》：下载字体 → 生成时间轴 → 并行渲染画面 → 合成配乐 → 合成 MP4
# 依赖：node + playwright（自带 Chromium）、ffmpeg（含 libx264）、python3 + numpy + scipy + fonttools
set -e
cd "$(dirname "$0")"
mkdir -p fonts out
for w in Bold Black Medium; do
  f="fonts/NotoSerifSC-$w.otf"
  [ -f "$f" ] || curl -sSL -o "$f" "https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Serif/SubsetOTF/SC/NotoSerifSC-$w.otf"
done
GF="https://cdn.jsdelivr.net/gh/google/fonts@main/ofl"
[ -f fonts/Cinzel.ttf ] || curl -sSL -o fonts/Cinzel.ttf "$GF/cinzel/Cinzel%5Bwght%5D.ttf"
[ -f fonts/Cormorant.ttf ] || curl -sSL -o fonts/Cormorant.ttf "$GF/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf"
[ -f fonts/Cormorant-Italic.ttf ] || curl -sSL -o fonts/Cormorant-Italic.ttf "$GF/cormorantgaramond/CormorantGaramond-Italic%5Bwght%5D.ttf"
[ -f fonts/CormorantLining.ttf ] || python3 fonts.py          # 把旧式数字换成齐线数字
python3 script.py                                               # 字幕稿 → timeline.js / timeline.json
FPS=30
TOTAL=$(python3 -c "import json;print(int(json.load(open('timeline.json'))['duration']*$FPS))")
N=${WORKERS:-4}; CH=$((TOTAL/N))
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
ffmpeg -y -loglevel error -i out/video_noaudio.mp4 -i out/audio.wav -c:v libx264 -preset slow -tune film -crf 20 \
  -pix_fmt yuv420p -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 44100 -c:a aac -b:a 192k -movflags +faststart -shortest out/地球的尺寸.mp4
echo "完成：$(pwd)/out/地球的尺寸.mp4"
