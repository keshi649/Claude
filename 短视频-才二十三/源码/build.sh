#!/bin/bash
# 一键重新生成《才二十三》MV：下载字体 → 并行渲染画面 → 混音 → 合成 MP4
# 依赖：node + playwright（自带 Chromium）、ffmpeg（含 libx264）、python3 + numpy + scipy
# 音频不进仓库：把歌曲转成 44.1kHz 立体声 WAV 放到 audio/song.wav（见 README）
set -e
cd "$(dirname "$0")"
mkdir -p fonts out
get() { [ -f "fonts/$1" ] || curl -sSL --fail -o "fonts/$1" "$2"; }
GF=https://cdn.jsdelivr.net/gh/google/fonts@main/ofl
get MaShanZheng-Regular.ttf $GF/mashanzheng/MaShanZheng-Regular.ttf
get ZCOOLKuaiLe-Regular.ttf $GF/zcoolkuaile/ZCOOLKuaiLe-Regular.ttf
get ZCOOLQingKeHuangYou-Regular.ttf $GF/zcoolqingkehuangyou/ZCOOLQingKeHuangYou-Regular.ttf
get Fredoka.ttf "$GF/fredoka/Fredoka%5Bwdth,wght%5D.ttf"
get NotoSansSC-Bold.otf https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/SC/NotoSansSC-Bold.otf
get NotoSerifSC-Black.otf https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Serif/SubsetOTF/SC/NotoSerifSC-Black.otf
[ -f audio/song.wav ] || { echo "缺少 audio/song.wav（44.1kHz 立体声的整首歌）"; exit 1; }
FPS=30
TOTAL=$(python3 -c "import re;s=open('main.js',encoding='utf-8').read();print(round((float(re.search(r'const PRE = ([\d.]+)',s).group(1))+float(re.search(r'const END_S = ([\d.]+)',s).group(1)))*$FPS))")
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
# 响度：两遍 loudnorm，用线性增益统一到 -14 LUFS（不压动态）
M=$(ffmpeg -hide_banner -i out/mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
LN=$(echo "$M" | python3 -c "import json,sys;d=json.load(sys.stdin);print('loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:offset=%s:linear=true'%(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset']))")
ffmpeg -y -loglevel error -i out/video_noaudio.mp4 -i out/mix.wav -c:v libx264 -preset slow -tune animation -crf 18 \
  -pix_fmt yuv420p -af "$LN" -ar 44100 -c:a aac -b:a 192k -movflags +faststart -shortest out/才二十三.mp4
echo "完成：$(pwd)/out/才二十三.mp4"
