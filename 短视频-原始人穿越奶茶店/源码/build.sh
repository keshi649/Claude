#!/bin/bash
# 一键重新生成《原始人穿越奶茶店》：下载字体 → 合成配音 → 并行渲染画面 → 合成声音 → 合成 MP4
# 依赖：node + playwright（自带 Chromium）、ffmpeg（含 libx264）、python3 + numpy + scipy + edge-tts
set -e
cd "$(dirname "$0")"
mkdir -p fonts out
[ -f fonts/SmileySans-Oblique.ttf ] || { curl -sSL -o fonts/smiley.zip "https://github.com/atelier-anchor/smiley-sans/releases/download/v2.0.1/smiley-sans-v2.0.1.zip" && unzip -o -q fonts/smiley.zip SmileySans-Oblique.ttf -d fonts && rm fonts/smiley.zip; }
for w in Black Bold; do
  f="fonts/NotoSansSC-$w.otf"
  [ -f "$f" ] || curl -sSL -o "$f" "https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/SC/NotoSansSC-$w.otf"
done
python3 voice.py                      # 只合成缺失或改动过的句子；顺带更新 timeline.js / timeline.json
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
ffmpeg -y -loglevel error -i out/video_noaudio.mp4 -i out/audio.wav -c:v libx264 -preset slow -tune animation -crf 20 \
  -pix_fmt yuv420p -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 44100 -c:a aac -b:a 192k -movflags +faststart -shortest out/原始人穿越奶茶店.mp4
echo "完成：$(pwd)/out/原始人穿越奶茶店.mp4"
