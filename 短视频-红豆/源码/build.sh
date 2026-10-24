#!/bin/bash
# 一键重新生成 MV《红豆》（横屏 1920×1080，30fps）：
#   下载字体（校验 sha256）→ 4 路并行渲染画面 → 原曲响度调到 −16 LUFS → 合成 MP4 → 超过 30 MB 按段落切成几段
# 歌曲音频不进仓库（仓库是公开的）：先把用户发来的视频放到 audio/song.mp4（只用它的音轨）。
# 歌词的逐字时间已经算好在 lyrics.js、节拍在 timing.js；要重新算，见 analyze.py、align.py（要 Demucs 和 torchaudio）。
# 只有原曲：不加配音、不加音效、不另加片头片尾（用户说"不要加其他的东西，只是做 MV"）。
# 依赖：node + playwright（自带 Chromium）、ffmpeg（含 libx264）、python3
set -e
cd "$(dirname "$0")"
mkdir -p fonts out
# 字体都是 SIL OFL：思源宋体 Medium / Bold（noto-cjk 的固定版本）、马善政毛笔、龙藏体（google/fonts 的固定提交）
GF=https://cdn.jsdelivr.net/gh/google/fonts@66928797f271fed5ee428544e7229685e2d90127/ofl
fetch() {  # 目标文件 地址 sha256
  [ -f "$1" ] && echo "$3  $1" | sha256sum -c --quiet 2>/dev/null && return
  curl -sSL --fail -o "$1" "$2"
  echo "$3  $1" | sha256sum -c --quiet
}
fetch fonts/NotoSerifSC-Medium.otf https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@Serif2.003/Serif/SubsetOTF/SC/NotoSerifSC-Medium.otf e4e9beb5aaeb951e101aa8f122e2a6801ea9e48ac9f9b6bdfeef2436b55bc8ee
fetch fonts/NotoSerifSC-Bold.otf https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@Serif2.003/Serif/SubsetOTF/SC/NotoSerifSC-Bold.otf 24693d48bdb9152f0a06b02af625638a1097abd6de4010ebba027f6e82710527
fetch fonts/MaShanZheng-Regular.ttf $GF/mashanzheng/MaShanZheng-Regular.ttf 6d2546bb189c732a8ca29af9e22457b152387d158aa459e4ac2ce1e51788b7fb
fetch fonts/LongCang-Regular.ttf $GF/longcang/LongCang-Regular.ttf e5bf2c3f24ef2327c6f136d8f73e2f9dfdf44896fdbeb35a9515f44777bb91bc
[ -f audio/song.mp4 ] || { echo "缺 audio/song.mp4（用户发来的歌曲视频，音轨 3:52.64）"; exit 1; }
NAME=红豆
FPS=30
TOTAL=$(python3 -c "import re;t=open('timing.js',encoding='utf-8').read();print(round(float(re.search(r'const SONG_DUR = ([\d.]+)',t).group(1))*$FPS))")
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
# 段落开头放关键帧，切分时切在这里：副歌一、主歌二、副歌二、间奏、副歌三、尾奏
CUTS=47.46,82.86,114.26,150.00,176.38,210.50
ffmpeg -y -loglevel error -i out/video_noaudio.mp4 -i out/audio.wav -c:v libx264 -preset slow -tune animation -crf ${CRF:-20} \
  -force_key_frames "$CUTS" -pix_fmt yuv420p -c:a aac -b:a 192k -aac_pns 0 -movflags +faststart -shortest out/$NAME.mp4
# 超过 30 MB 就切段，每段 ≤ 28.6 MiB（= 30.0 MB 十进制）
python3 ../../工具/split_mp4.py out/$NAME.mp4 out/$NAME 28.6 "$CUTS"
echo "完成：$(pwd)/out/$NAME.mp4（$(du -h out/$NAME.mp4 | cut -f1)）"
