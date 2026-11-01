#!/bin/bash
# 一键重新生成 MV《后来》（竖屏 1080×1920，30fps）：
#   下载字体 → 4 路并行渲染画面 → 原曲响度调到 −16 LUFS → 合成 MP4 → 超过 30 MB 就按大小切段
# 歌曲音频不进仓库（仓库是公开的）：先把用户发来的抖音视频放到 audio/song.mp4（只用它的音轨）。
# 歌词的逐字时间已经算好在 timing.js 里；要重新算，见 kara.py、align.py（要 Demucs 和 torchaudio）。
# 没有配音、没有音效，只有原曲。
# 依赖：node + playwright（自带 Chromium）、ffmpeg（含 libx264）、python3
set -e
cd "$(dirname "$0")"
mkdir -p fonts out
# 字体（都是 SIL OFL，Google Fonts 的仓库）：思源宋体（歌词、片尾）、志莽行书（片名）、龙藏体（照片背面的字）、马善政楷书（备用）
fetch() {  # 地址 目标文件 sha256
  [ -f "$2" ] && echo "$3  $2" | sha256sum -c --quiet && return
  curl -sSfL -o "$2" "$1"; echo "$3  $2" | sha256sum -c --quiet
}
GF=https://raw.githubusercontent.com/google/fonts/main/ofl
fetch "$GF/notoserifsc/NotoSerifSC%5Bwght%5D.ttf" fonts/NotoSerifSC.ttf 050080d9255a86808f2945bffac582b31ef32bc36411ce29563b4961670c66f9
fetch "$GF/zhimangxing/ZhiMangXing-Regular.ttf" fonts/ZhiMangXing.ttf 644e0cae9b40f0b10ab729a01bd32032e3973bac22be3dccae01bf6ae7fde969
fetch "$GF/longcang/LongCang-Regular.ttf" fonts/LongCang.ttf e5bf2c3f24ef2327c6f136d8f73e2f9dfdf44896fdbeb35a9515f44777bb91bc
fetch "$GF/mashanzheng/MaShanZheng-Regular.ttf" fonts/MaShanZheng.ttf 6d2546bb189c732a8ca29af9e22457b152387d158aa459e4ac2ce1e51788b7fb
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
NAME=后来
# 每段的开头放关键帧，要切段时优先切在这些地方：主歌、乐队进来、站台、第二遍副歌、间奏、第三段、最后一遍副歌、尾奏
KEYS=38.560,89.830,128.270,153.050,179.540,204.700,242.750,282.070
ffmpeg -y -loglevel error -i out/video_noaudio.mp4 -i out/audio.wav -c:v libx264 -preset slow -tune animation -crf ${CRF:-21} \
  -force_key_frames "$KEYS" -pix_fmt yuv420p -c:a aac -b:a 192k -aac_pns 0 -movflags +faststart -shortest out/$NAME.mp4
# 超过 30 MB 就切段，每段 ≤ 28.6 MiB（= 30.0 MB；split_mp4.py 按 MiB 算）
python3 ../../工具/split_mp4.py out/$NAME.mp4 out/$NAME 28.6 "$KEYS"
echo "完成：$(pwd)/out/$NAME.mp4（$(du -h out/$NAME.mp4 | cut -f1)）"
