#!/bin/bash
# 一键生成 MV《爱情废柴》复古 RPG 版（横屏 1920×1080，30fps，和原曲一样长）：
#   4 路并行在 480×270 上逐帧画（上半张画面、下半张光晕，无损）→ ffmpeg 里最近邻放大 4 倍、光晕模糊后叠回去 → 配上原曲（线性降到 −16 LUFS）
# 歌曲不进仓库（仓库是公开的）：先把用户发来的原 MV 放到 audio/song.mp4（只用它的音轨；歌词的逐字时间也是从它的卡拉 OK 字幕量的，见 kara.py）。
# 依赖：node + playwright（自带 Chromium）、ffmpeg（含 libx264）、python3
set -e
cd "$(dirname "$0")"
NAME=爱情废柴
[ -f audio/song.mp4 ] || { echo "缺 audio/song.mp4（用户发来的歌曲视频）"; exit 1; }
# 字体：缝合像素字体 Fusion Pixel 12px（SIL OFL）。样张那边有一份，拷过来用。
mkdir -p fonts; [ -f fonts/FusionPixel12.woff2 ] || cp ../样张源码/fonts/FusionPixel12.woff2 fonts/
mkdir -p out
FPS=30; DUR=279.27
TOTAL=$(python3 -c "print(round($DUR*$FPS))")
N=${WORKERS:-4}; CH=$(( (TOTAL + N - 1) / N ))
pids=()
for i in $(seq 0 $((N-1))); do
  a=$((i*CH)); b=$(( (i+1)*CH )); [ $b -gt $TOTAL ] && b=$TOTAL
  node render.cjs video $a $b out/part$i.mkv $FPS > out/log$i.txt 2>&1 &
  pids+=($!)
done
for p in "${pids[@]}"; do wait $p; done
grep -h "PAGE ERROR" out/log*.txt && { echo "渲染有报错"; exit 1; }
: > out/list.txt; for i in $(seq 0 $((N-1))); do echo "file 'part$i.mkv'" >> out/list.txt; done
# 原曲 −13.8 LUFS、真峰值 −2.2 dBTP：线性降 2.2 dB 到 −16 LUFS（不用 loudnorm，免得动到动态）
GAIN=${GAIN:--2.2}
ffmpeg -y -loglevel error -f concat -safe 0 -i out/list.txt -i audio/song.mp4 -filter_complex "[0:v]$(node render.cjs filter),format=yuv420p[v];[1:a]volume=${GAIN}dB[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset slow -tune animation -crf ${CRF:-18} -r $FPS -c:a aac -b:a 192k -aac_pns 0 -movflags +faststart -t $DUR out/$NAME.mp4
ls -la out/$NAME.mp4
