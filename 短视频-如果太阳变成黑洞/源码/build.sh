#!/bin/bash
# 一键生成《如果太阳变成黑洞》：装字体 → 取地球贴图 → 按配音排时间轴 → 旁白文案 → 4 路并行逐帧渲染 → 音效混音 → 合成 MP4 → 封面
# 旁白配音要先用 narrate_cosy.py 合成到 voice_cv3/（仓库里已经有）。没有配乐，有音效和环境声。
# 依赖：node + playwright（自带 Chromium）、ffmpeg（含 libx264）、python3 + numpy + scipy
set -e
cd "$(dirname "$0")"
mkdir -p out assets
# 字体（SIL OFL）：思源宋体 Noto Serif SC、Cormorant Garamond，npm 包，package-lock.json 里有校验和
[ -d node_modules/@fontsource/noto-serif-sc ] || npm ci --no-audit --no-fund
# 地球贴图：three-globe 2.45.6 包里的 NASA 图（Blue Marble、夜光、海洋、云，公有领域），按 sha256 校验
need=0
while read -r sum f; do [ -f "assets/$f" ] && echo "$sum  assets/$f" | sha256sum -c --quiet 2>/dev/null || need=1; done <<'SUMS'
228deba2e4b600146bdcb6cfa359b8ead6aacc2b1c13550a29cd82824cfa1c01 earth-day.jpg
355ab23dd1323315b393d7b91dd2d7ee223a1cbaaba2b48dc72ba90d371ced24 earth-night.jpg
3a8132db56aac4e64e7fcbf2928ee970c075ac6a96b38798d0bb8be82836a4d3 earth-water.png
35c46d8b29651a99e482401f33ed752bf4625837435fb3a89bb0032f72b88a3a clouds.png
SUMS
if [ "$need" = 1 ]; then
  mkdir -p out/globe && (cd out/globe && npm pack three-globe@2.45.6 --silent && tar xzf three-globe-2.45.6.tgz)
  cp out/globe/package/example/img/earth-blue-marble.jpg assets/earth-day.jpg
  cp out/globe/package/example/img/earth-night.jpg assets/earth-night.jpg
  cp out/globe/package/example/img/earth-water.png assets/earth-water.png
  cp out/globe/package/example/clouds/clouds.png assets/clouds.png
fi
python3 narration.py                  # 旁白稿 + 配音的逐字时间 → timeline.js / timeline.json
python3 export.py out                 # 旁白文案 → out/旁白文案.txt
FPS=30
TOTAL=$(python3 -c "import json;print(int(round(json.load(open('timeline.json'))['duration']*$FPS)))")
N=${WORKERS:-4}; CH=$((TOTAL/N))
pids=()
for i in $(seq 0 $((N-1))); do
  a=$((i*CH)); b=$(( i==N-1 ? TOTAL : (i+1)*CH ))
  node render.js video $a $b out/part$i.mp4 --fps $FPS > out/log$i.txt 2>&1 &
  pids+=($!)
done
python3 audio.py out/audio.wav
for p in "${pids[@]}"; do wait $p; done
: > out/list.txt; for i in $(seq 0 $((N-1))); do echo "file 'part$i.mp4'" >> out/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/list.txt -c copy out/video_noaudio.mp4
NAME=如果太阳变成黑洞
# 两遍编码，平均约 4.5 Mbps（细颗粒很吃码率，CRF 会大很多）；-aac_pns 0：关掉 AAC 的噪声替代，免得浪声、风声解码后冒到 0 dBFS
V=(-c:v libx264 -preset slow -b:v 4500k -maxrate 9000k -bufsize 12000k -profile:v high -pix_fmt yuv420p)
ffmpeg -y -loglevel error -i out/video_noaudio.mp4 "${V[@]}" -pass 1 -passlogfile out/x264 -an -f mp4 /dev/null
ffmpeg -y -loglevel error -i out/video_noaudio.mp4 -i out/audio.wav -map 0:v -map 1:a "${V[@]}" -pass 2 -passlogfile out/x264 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 160k -aac_pns 0 -movflags +faststart -shortest out/$NAME.mp4
node render.js cover 2.6 out/封面.jpg
echo "完成：$(pwd)/out/$NAME.mp4（$(du -h out/$NAME.mp4 | cut -f1)）"
