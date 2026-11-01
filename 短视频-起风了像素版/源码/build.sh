#!/bin/bash
# 一键重新生成像素版 MV《起风了》（横屏，画在 480×270 上、放大 4 倍成 1920×1080，30fps）：
#   下载字体（校验 sha256）→ 4 路并行渲染（无损 FFV1）→ 原曲调到 −16 LUFS → 放大编码 MP4
# 依赖：node + playwright（自带 Chromium）、ffmpeg（含 libx264、ffv1）、python3
# 歌曲音频不进仓库：把整首歌转成 44.1kHz 立体声 WAV 放到 audio/song.wav（见 README）
set -e
cd "$(dirname "$0")"
mkdir -p fonts out
# 缝合像素字体（Fusion Pixel，SIL OFL）：npm 上 @fontsource 的固定版本，文件名带 latin，里面是全的中文字形
FP=https://cdn.jsdelivr.net/npm/@fontsource
fetch() {  # 目标文件 地址 sha256
  [ -f "$1" ] && echo "$3  $1" | sha256sum -c --quiet 2>/dev/null && return
  curl -sSL --fail -o "$1" "$2"
  echo "$3  $1" | sha256sum -c --quiet
}
fetch fonts/fusion-pixel-12px-proportional-sc.woff2 $FP/fusion-pixel-12px-proportional-sc@5.3.0/files/fusion-pixel-12px-proportional-sc-latin-400-normal.woff2 043eae5e616b0d1e75dc746d3d687b4413f9f1c70c1a09bc4ebb705ef1cc8e32
fetch fonts/fusion-pixel-8px-proportional-sc.woff2 $FP/fusion-pixel-8px-proportional-sc@5.3.0/files/fusion-pixel-8px-proportional-sc-latin-400-normal.woff2 ad87f52c51ff9cd89be78b32485e9e774843e7b806d0f38ab7f4b11c3ab26d6e
[ -f audio/song.wav ] || { echo "缺少 audio/song.wav（44.1kHz 立体声的整首歌，5:21.8）"; exit 1; }
NAME=起风了像素版
FPS=30
TOTAL=$(python3 -c "
import re; t=open('timing.js',encoding='utf-8').read()
print(round(float(re.search(r'const SONG_DUR = ([\d.]+)',t).group(1))*$FPS)+1)")
N=${WORKERS:-4}; CH=$(( (TOTAL + N - 1) / N ))
pids=()
for i in $(seq 0 $((N-1))); do
  a=$((i*CH)); b=$(( (i+1)*CH < TOTAL ? (i+1)*CH : TOTAL ))
  node render.cjs video $a $b out/part$i.mkv > out/log$i.txt 2>&1 &
  pids+=($!)
done
python3 mix.py audio/song.wav out/mix.wav
for p in "${pids[@]}"; do wait $p || { echo "渲染出错，看 out/log*.txt"; exit 1; }; done
: > out/list.txt; for i in $(seq 0 $((N-1))); do echo "file 'part$i.mkv'" >> out/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/list.txt -c copy out/video.mkv
# 最近邻放大 4 倍（像素不糊）；BT.709；-aac_pns 0 关掉 AAC 的噪声替代
ffmpeg -y -loglevel error -i out/video.mkv -i out/mix.wav \
  -vf "scale=1920:1080:flags=neighbor:out_color_matrix=bt709:out_range=tv,format=yuv420p" \
  -c:v libx264 -preset slow -tune animation -crf ${CRF:-18} -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 192k -aac_pns 0 -movflags +faststart -shortest out/$NAME.mp4
echo "完成：$(pwd)/out/$NAME.mp4（$(du -h out/$NAME.mp4 | cut -f1)）"
