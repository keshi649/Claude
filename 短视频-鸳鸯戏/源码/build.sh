#!/bin/bash
# 一键重新生成 MV《鸳鸯戏》（横屏 1920×1080，30fps，61 秒）：
#   下载字体（校验 sha256）→ 4 路并行渲染画面 → 原曲降到 -16 LUFS → 编码 MP4 → 超过 30 MB 按段落切成几段
# 依赖：node + playwright（自带 Chromium）、ffmpeg（含 libx264）、python3 + numpy + scipy
# 歌曲音频不进仓库：把用户发来的视频里的音轨转成 44.1kHz 立体声 WAV 放到 audio/song.wav（见 README）
# timing.js、lyrics.js 已经生成好了；换了音源才需要重跑 analyze.py、align.py（要 demucs、torchaudio，见 README）
set -e
cd "$(dirname "$0")"
mkdir -p fonts out
# 字体都是 SIL OFL：缝合像素字体 Fusion Pixel 12px（fontsource 的 npm 包 5.3.0）、马善政楷书（google/fonts 的固定提交）
fetch() {  # 目标文件 地址 sha256
  [ -f "$1" ] && echo "$3  $1" | sha256sum -c --quiet 2>/dev/null && return
  curl -sSL --fail -o "$1" "$2"
  echo "$3  $1" | sha256sum -c --quiet
}
fetch_npm() {  # 包名@版本 包内路径 目标文件 sha256
  [ -f "$3" ] && echo "$4  $3" | sha256sum -c --quiet 2>/dev/null && return
  local url; url=$(curl -sS "https://registry.npmjs.org/${1%@*}/${1##*@}" | python3 -c "import json,sys;print(json.load(sys.stdin)['dist']['tarball'])")
  curl -sSL "$url" | tar xzO "package/$2" > "$3"
  echo "$4  $3" | sha256sum -c --quiet
}
fetch_npm @fontsource/fusion-pixel-12px-proportional-sc@5.3.0 files/fusion-pixel-12px-proportional-sc-latin-400-normal.woff2 \
  fonts/FusionPixel12.woff2 043eae5e616b0d1e75dc746d3d687b4413f9f1c70c1a09bc4ebb705ef1cc8e32
fetch fonts/MaShanZheng-Regular.ttf https://cdn.jsdelivr.net/gh/google/fonts@66928797f271fed5ee428544e7229685e2d90127/ofl/mashanzheng/MaShanZheng-Regular.ttf \
  6d2546bb189c732a8ca29af9e22457b152387d158aa459e4ac2ce1e51788b7fb
[ -f audio/song.wav ] || { echo "缺少 audio/song.wav（44.1kHz 立体声，61.16 秒，见 README）"; exit 1; }
NAME=鸳鸯戏
FPS=30
TOTAL=$(python3 -c "
import re
t=open('timing.js',encoding='utf-8').read()
print(round(float(re.search(r'SONG_DUR = ([\d.]+)',t).group(1))*$FPS))")
N=${WORKERS:-4}; CH=$((TOTAL/N))
pids=()
for i in $(seq 0 $((N-1))); do
  a=$((i*CH)); b=$(( i==N-1 ? TOTAL : (i+1)*CH ))
  node render.cjs video $a $b out/part$i.mp4 $FPS > out/log$i.txt 2>&1 &
  pids+=($!)
done
python3 mix.py audio/song.wav out/mix.wav
for p in "${pids[@]}"; do wait $p; done
: > out/list.txt; for i in $(seq 0 $((N-1))); do echo "file 'part$i.mp4'" >> out/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/list.txt -c copy out/video_noaudio.mp4
# 段落开头放关键帧，要切分时切在这里：砚上三五笔、breakdown、副歌一（drop）、副歌二
CUTS=16.193,23.693,31.193,44.318
ffmpeg -y -loglevel error -i out/video_noaudio.mp4 -i out/mix.wav -c:v libx264 -preset slow -tune animation -crf ${CRF:-20} \
  -force_key_frames "$CUTS" -pix_fmt yuv420p -c:a aac -b:a 192k -aac_pns 0 -movflags +faststart -shortest out/$NAME.mp4
# 28.6 MiB ≈ 30.0 MB（十进制），按哪种算法每段都不超过 30 MB
python3 ../../工具/split_mp4.py out/$NAME.mp4 out/$NAME 28.6 "$CUTS"
echo "完成：$(pwd)/out/$NAME.mp4（$(du -h out/$NAME.mp4 | cut -f1)）"
