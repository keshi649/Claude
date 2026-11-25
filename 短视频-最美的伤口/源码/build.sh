#!/bin/bash
# 一键重新生成 MV《最美的伤口》（横屏 1920×1080，30fps）：
#   下载字体 → 4 路并行渲染画面 → 原曲响度调到 −16 LUFS → 合成 MP4 → 超过 30 MB 就按大小切段
# 歌曲音频不进仓库（仓库是公开的）：先把用户发来的抖音视频放到 audio/song.mp4（只用它的音轨）。
# 歌词的逐字时间已经算好在 timing.js 里；要重新算，见 analyze.py、align.py（要 Demucs 和 torchaudio）。
# 没有配音、没有音效，只有原曲。
# 依赖：node + playwright（自带 Chromium）、ffmpeg（含 libx264）、python3
set -e
cd "$(dirname "$0")"
mkdir -p fonts out
# 字体：缝合像素字体 Fusion Pixel 12px（SIL OFL，fontsource 的 npm 包）
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
TOTAL=$(python3 -c "import json;print(round(json.load(open('timing.json'))['duration']*$FPS))")
N=${WORKERS:-4}; CH=$((TOTAL/N))
pids=()
for i in $(seq 0 $((N-1))); do
  a=$((i*CH)); b=$(( i==N-1 ? TOTAL : (i+1)*CH ))
  node render.cjs video $a $b out/part$i.mp4 $FPS > out/log$i.txt 2>&1 &
  pids+=($!)
done
python3 mix.py audio/song.mp4 out/audio.wav
for p in "${pids[@]}"; do wait $p; done
: > out/list.txt; for i in $(seq 0 $((N-1))); do echo "file 'part$i.mp4'" >> out/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/list.txt -c copy out/video_noaudio.mp4
NAME=最美的伤口
# 副歌第一拍（21.70 秒）和"不能牵着你的手"（31.80 秒）放关键帧：要切段时优先切在这两处
KEYS=$(python3 -c "import json;T=json.load(open('timing.json'));print(','.join('%.3f'%(T['bar1']+(k-1)*T['bar']) for k in (9,13)))")
ffmpeg -y -loglevel error -i out/video_noaudio.mp4 -i out/audio.wav -c:v libx264 -preset slow -tune animation -crf ${CRF:-20} \
  -force_key_frames "$KEYS" -pix_fmt yuv420p -c:a aac -b:a 192k -aac_pns 0 -movflags +faststart -shortest out/$NAME.mp4
# 超过 30 MB 就切段，每段 ≤ 28.6 MiB（= 30.0 MB；split_mp4.py 按 MiB 算）
python3 ../../工具/split_mp4.py out/$NAME.mp4 out/$NAME 28.6 "$KEYS"
echo "完成：$(pwd)/out/$NAME.mp4（$(du -h out/$NAME.mp4 | cut -f1)）"
