#!/bin/bash
# 一键重新生成《误闯天家》像素小怪 MV（竖屏 1080×1920）：下载字体（校验 sha256）→ 4 路并行渲染画面 → 原曲调到 -16 LUFS → 编码 MP4 → 超过 30 MB 就切段
# 本片：只有歌，没有画外音、没有配乐以外的音效（用户要的是"就是做一个 mv"）；歌词按逐字时间（timing.json，由 analyze.py 算出）一个字一个字落下来
# 用法：SONG=歌曲.mov ./build.sh      （歌曲不进仓库：仓库是公开的。用户发来的是带歌词画面的 .mov，这里只取声音）
# 依赖：node + playwright（自带 Chromium）、ffmpeg（含 libx264）、python3
set -e
cd "$(dirname "$0")"
mkdir -p fonts out
SONG=${SONG:-song.mov}
[ -f "$SONG" ] || { echo "找不到歌曲：$SONG（用 SONG=路径 ./build.sh 指定）"; exit 1; }
# 字体都是 SIL OFL：马善政毛笔楷书（Google Fonts 仓库，固定到一个提交）
GF=https://cdn.jsdelivr.net/gh/google/fonts@66928797f271fed5ee428544e7229685e2d90127/ofl
fetch() {  # 目标文件 地址 sha256
  [ -f "$1" ] && echo "$3  $1" | sha256sum -c --quiet 2>/dev/null && return
  curl -sSL -o "$1" "$2"
  echo "$3  $1" | sha256sum -c --quiet
}
fetch fonts/MaShanZheng-Regular.ttf $GF/mashanzheng/MaShanZheng-Regular.ttf 6d2546bb189c732a8ca29af9e22457b152387d158aa459e4ac2ce1e51788b7fb
NAME=误闯天家
FPS=30
TOTAL=$(python3 -c "import json,math;print(math.ceil(json.load(open('timing.json'))['duration']*$FPS))")
N=${WORKERS:-4}; CH=$((TOTAL/N))
pids=()
for i in $(seq 0 $((N-1))); do
  a=$((i*CH)); b=$(( i==N-1 ? TOTAL : (i+1)*CH ))
  node render.cjs video $a $b out/part$i.mp4 $FPS > out/log$i.txt 2>&1 &
  pids+=($!)
done
# 声音：原曲很响（约 -7 LUFS，真峰值 +1 dBTP），整体降到 -16 LUFS；开头 10 毫秒淡入防爆音，最后 0.8 秒淡出（原曲在拖长音的"花"字上被截断）
ffmpeg -y -loglevel error -i "$SONG" -vn -ac 2 -ar 48000 -c:a pcm_s16le out/song.wav
I=$(ffmpeg -hide_banner -i out/song.wav -af ebur128 -f null - 2>&1 | grep -E '^\s+I:' | tail -1 | awk '{print $2}')
DUR=$(python3 -c "import json;print(json.load(open('timing.json'))['duration'])")
GAIN=$(python3 -c "print(round(-16-($I),2))")
ffmpeg -y -loglevel error -i out/song.wav -af "volume=${GAIN}dB,afade=t=in:d=0.01,afade=t=out:st=$(python3 -c "print($DUR-0.8)"):d=0.8" -c:a pcm_s16le out/audio.wav
echo "原曲 $I LUFS，增益 $GAIN dB"
for p in "${pids[@]}"; do wait $p; done
: > out/list.txt; for i in $(seq 0 $((N-1))); do echo "file 'part$i.mp4'" >> out/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/list.txt -c copy out/video_noaudio.mp4
# -aac_pns 0：关掉 AAC 的噪声替代
ffmpeg -y -loglevel error -i out/video_noaudio.mp4 -i out/audio.wav -c:v libx264 -preset slow -tune animation -crf ${CRF:-20} \
  -pix_fmt yuv420p -c:a aac -b:a 192k -aac_pns 0 -movflags +faststart -shortest out/$NAME.mp4
# 28.6 MiB ≈ 30.0 MB（十进制）：超过就切，每段都不超过 30 MB
python3 ../../工具/split_mp4.py out/$NAME.mp4 out/$NAME 28.6
NODE_PATH=${NODE_PATH:-$(npm root -g)} node render.cjs cover 1 out/封面.jpg > /dev/null
echo "完成：$(pwd)/out/$NAME.mp4（$(du -h out/$NAME.mp4 | cut -f1)）"
