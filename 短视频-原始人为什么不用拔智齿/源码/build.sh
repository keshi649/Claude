#!/bin/bash
# 一键重新生成《原始人为什么不用拔智齿？》：下载字体 → 字幕时间轴 → 并行渲染画面 → 合成音效 → 合成 MP4 → 角色配音版
# 成片没有配音、没有配乐：字幕解释画面，声音只有音效和环境声（audio.py 里已定好响度，这里不再标准化）
# 角色配音版只给对白气泡里的 7 句台词配音，字幕不配音
# 依赖：node + playwright（自带 Chromium）、ffmpeg（含 libx264）、python3 + numpy + scipy + edge-tts（合成台词要联网）
set -e
cd "$(dirname "$0")"
mkdir -p fonts out
# 字体都是 SIL OFL：缝合像素字体 Fusion Pixel 12px（fontsource 的 npm 包）、得意黑 Smiley Sans（npm 包 @fontpkg/smiley-sans）
fetch_npm() {  # 包名 包内路径 目标文件 sha256
  [ -f "$3" ] && echo "$4  $3" | sha256sum -c --quiet && return
  local url; url=$(curl -sS "https://registry.npmjs.org/$1" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['versions'][d['dist-tags']['latest']]['dist']['tarball'])")
  local tmp; tmp=$(mktemp -d); curl -sSL "$url" | tar xz -C "$tmp"; cp "$tmp/package/$2" "$3"; rm -rf "$tmp"
  echo "$4  $3" | sha256sum -c --quiet
}
fetch_npm @fontsource/fusion-pixel-12px-proportional-sc files/fusion-pixel-12px-proportional-sc-latin-400-normal.woff2 \
  fonts/FusionPixel12.woff2 043eae5e616b0d1e75dc746d3d687b4413f9f1c70c1a09bc4ebb705ef1cc8e32
fetch_npm @fontpkg/smiley-sans SmileySans-Oblique.ttf \
  fonts/SmileySans-Oblique.ttf b447d7e781f08bc95c4c9f23ba71ed2b8ebb639aa7184485c71c4ca5afcd25c4
python3 script.py                     # 字幕稿 → timeline.js / timeline.json
python3 subs.py out                   # 时间轴 → out/字幕.srt、字幕文案.txt、配音台词.txt
FPS=30
TOTAL=$(python3 -c "import json;print(int(json.load(open('timeline.json'))['duration']*$FPS))")
N=${WORKERS:-4}; CH=$((TOTAL/N))
pids=()
for i in $(seq 0 $((N-1))); do
  a=$((i*CH)); b=$(( i==N-1 ? TOTAL : (i+1)*CH ))
  node render.cjs video $a $b out/part$i.mp4 $FPS > out/log$i.txt 2>&1 &
  pids+=($!)
done
python3 audio.py out/audio.wav
for p in "${pids[@]}"; do wait $p; done
: > out/list.txt; for i in $(seq 0 $((N-1))); do echo "file 'part$i.mp4'" >> out/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/list.txt -c copy out/video_noaudio.mp4
NAME=原始人为什么不用拔智齿
# -aac_pns 0：关掉 AAC 的噪声替代。它会把倒带声这类噪声换成随机噪声，解码后的峰值可能冒过 0 dBFS
ffmpeg -y -loglevel error -i out/video_noaudio.mp4 -i out/audio.wav -c:v libx264 -preset slow -tune animation -crf ${CRF:-20} \
  -pix_fmt yuv420p -c:a aac -b:a 160k -aac_pns 0 -movflags +faststart -shortest out/$NAME.mp4
echo "完成：$(pwd)/out/$NAME.mp4（$(du -h out/$NAME.mp4 | cut -f1)）"
# 角色配音版：画面直接沿用上面的成片，只换声音
python3 voice.py                      # 台词 → voice/*.mp3
python3 audio.py out/audio_voice.wav --voice
ffmpeg -y -loglevel error -i out/$NAME.mp4 -i out/audio_voice.wav -map 0:v -map 1:a -c:v copy \
  -c:a aac -b:a 160k -aac_pns 0 -movflags +faststart -shortest out/${NAME}_角色配音.mp4
echo "完成：$(pwd)/out/${NAME}_角色配音.mp4（$(du -h out/${NAME}_角色配音.mp4 | cut -f1)）"
