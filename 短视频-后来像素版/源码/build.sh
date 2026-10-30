#!/bin/bash
# 一键重新生成 MV《后来》像素版（横屏 1920×1080，30fps）：
#   4 路并行在 480×270 上逐帧画（无损 FFV1）→ 拼起来 → 最近邻放大 4 倍、编码 → 配上原曲（响度调到 −16 LUFS）→ 超过 30 MB 按段切开
# 歌曲音频不进仓库（仓库是公开的）：先把用户发来的抖音视频放到 audio/song.mp4（只用它的音轨）。
# 字体：缝合像素字体 Fusion Pixel 12px（SIL OFL，fontsource 的 npm 包），没有就自动下载。
# 依赖：node + playwright（自带 Chromium）、ffmpeg（含 libx264）、python3
set -e
cd "$(dirname "$0")"
mkdir -p fonts out
fetch_npm() {  # 包名 包内路径 目标文件 sha256
  [ -f "$3" ] && echo "$4  $3" | sha256sum -c --quiet && return
  local url; url=$(curl -sS "https://registry.npmjs.org/$1" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['versions'][d['dist-tags']['latest']]['dist']['tarball'])")
  local tmp; tmp=$(mktemp -d); curl -sSL "$url" | tar xz -C "$tmp"; cp "$tmp/package/$2" "$3"; rm -rf "$tmp"
  echo "$4  $3" | sha256sum -c --quiet
}
fetch_npm @fontsource/fusion-pixel-12px-proportional-sc files/fusion-pixel-12px-proportional-sc-latin-400-normal.woff2 \
  fonts/FusionPixel12.woff2 043eae5e616b0d1e75dc746d3d687b4413f9f1c70c1a09bc4ebb705ef1cc8e32
[ -f audio/song.mp4 ] || { echo "缺 audio/song.mp4（用户发来的歌曲视频）"; exit 1; }
FPS=30
TOTAL=$(python3 -c "print(round(315.4667*$FPS))")
N=${WORKERS:-4}; CH=$(( (TOTAL + N - 1) / N ))
pids=()
for i in $(seq 0 $((N-1))); do
  a=$((i*CH)); b=$(( (i+1)*CH > TOTAL ? TOTAL : (i+1)*CH ))
  node render.cjs video $a $b out/part$i.mkv > out/log$i.txt 2>&1 &
  pids+=($!)
done
python3 mix.py audio/song.mp4 out/audio.wav
for p in "${pids[@]}"; do wait $p; done
: > out/list.txt; for i in $(seq 0 $((N-1))); do echo "file 'part$i.mkv'" >> out/list.txt; done
NAME=后来像素版
# 段落开头放关键帧（要切段时切在这些地方）：主歌、现在、乐队进来、如果当时、他、副歌二、间奏、她、副歌三、天亮、尾声
KEYS=38.560,77.300,89.830,128.270,141.090,153.220,179.540,204.890,217.360,242.900,269.250,282.070
ffmpeg -y -loglevel error -f concat -safe 0 -i out/list.txt -i out/audio.wav -map 0:v -map 1:a \
  -vf "scale=1920:1080:flags=neighbor" -c:v libx264 -preset slow -tune animation -crf ${CRF:-20} -pix_fmt yuv420p \
  -force_key_frames "$KEYS" -c:a aac -b:a 192k -movflags +faststart -shortest out/$NAME.mp4
python3 ../../工具/split_mp4.py out/$NAME.mp4 out/$NAME 28.6 "$KEYS"
echo "完成：$(pwd)/out/$NAME.mp4（$(du -h out/$NAME.mp4 | cut -f1)）"
