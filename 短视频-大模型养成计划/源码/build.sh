#!/bin/bash
# 一键重新生成《大模型养成计划》：下载字体与 TTS 模型 → 合成配音、排时间轴 → 并行渲染画面 → 合成声音 → 合成 MP4
# 依赖：node + playwright（自带 Chromium）、ffmpeg（含 libx264）、
#       python3 + numpy + scipy + soundfile + sherpa-onnx + fonttools + brotli + huggingface_hub
set -e
cd "$(dirname "$0")"
mkdir -p fonts out/voice
NOTO="https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/SC"
[ -f fonts/NotoSansSC-Black.otf ] || curl -sSL -o fonts/NotoSansSC-Black.otf "$NOTO/NotoSansSC-Black.otf"
[ -f fonts/NotoSansSC-Bold.otf ] || curl -sSL -o fonts/NotoSansSC-Bold.otf "$NOTO/NotoSansSC-Bold.otf"
[ -f fonts/FusionPixel12.ttf ] || python3 fonts.py              # 融合像素字体：下载 WOFF2 分片并合成一个 TTF
[ -d kokoro ] || python3 -c "from huggingface_hub import snapshot_download as d; d('csukuangfj/kokoro-multi-lang-v1_1', local_dir='kokoro')"
python3 script.py                                               # 台词 → 配音 + timeline.js / timeline.json
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
ffmpeg -y -loglevel error -i out/video_noaudio.mp4 -i out/audio.wav -c:v libx264 -preset slow -crf 22 \
  -pix_fmt yuv420p -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 44100 -c:a aac -b:a 192k -movflags +faststart -shortest out/大模型养成计划.mp4
echo "完成：$(pwd)/out/大模型养成计划.mp4"
