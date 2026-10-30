#!/bin/bash
# 一键重新生成 MV《红豆》像素版（横屏 1920×1080，30fps）：
#   下载字体（校验 sha256）→ 4 路并行渲染画面 → 原曲响度调到 −16 LUFS → 合成 MP4 → 超过 30 MB 按段落切成几段
# 歌曲音频不进仓库（仓库是公开的）：先把用户发来的视频放到 audio/song.mp4（只用它的音轨）。
# 歌词的逐字时间已经算好在 lyrics.js、节拍在 timing.js；要重新算，见 analyze.py、align.py（要 Demucs 和 torchaudio）。
# 只有原曲：不加配音、不加音效、不另加片头片尾（用户说"不要加其他的东西，只是做 MV"）。
# 依赖：node + playwright（自带 Chromium）、ffmpeg（含 libx264）、python3
set -e
cd "$(dirname "$0")"
mkdir -p fonts out
# 字体：缝合像素字体 Fusion Pixel 12px（比例宽度、简体，SIL OFL 1.1），取自 npm 上 @fontsource 的固定版本 5.3.0，校验 sha256
FONT=fonts/FusionPixel12.woff2
FONT_SHA=043eae5e616b0d1e75dc746d3d687b4413f9f1c70c1a09bc4ebb705ef1cc8e32
if ! { [ -f $FONT ] && echo "$FONT_SHA  $FONT" | sha256sum -c --quiet 2>/dev/null; }; then
  tmp=$(mktemp -d)
  curl -sSL --fail -o $tmp/f.tgz https://registry.npmjs.org/@fontsource/fusion-pixel-12px-proportional-sc/-/fusion-pixel-12px-proportional-sc-5.3.0.tgz
  tar -xzf $tmp/f.tgz -C $tmp package/files/fusion-pixel-12px-proportional-sc-latin-400-normal.woff2
  cp $tmp/package/files/fusion-pixel-12px-proportional-sc-latin-400-normal.woff2 $FONT; rm -rf $tmp
  echo "$FONT_SHA  $FONT" | sha256sum -c --quiet
fi
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
