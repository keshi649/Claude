#!/bin/bash
# 一键重新生成 MV《失眠飞行》（横屏 1920×1080，30fps）：
#   下载字体（校验 sha256）→ 4 路并行渲染画面 → 合成音效、混入原曲 → 编码 MP4 → 超过 30 MB 按段落切成几段
# 依赖：node + playwright（自带 Chromium）、ffmpeg（含 libx264）、python3 + numpy + scipy
# 歌曲音频不进仓库：把整首歌转成 44.1kHz 立体声 WAV 放到 audio/song.wav（见 README）
# timing.js、lyrics.js 已经生成好了；换了音源才需要重跑 analyze.py、align.py（要 demucs、torchaudio，见 README）
set -e
cd "$(dirname "$0")"
mkdir -p fonts out
# 字体都是 SIL OFL：霞鹜文楷（GitHub release v1.510）、思源宋体 / 思源黑体（noto-cjk 的固定版本）、龙藏体、志莽行书（google/fonts 的固定提交）
GF=https://cdn.jsdelivr.net/gh/google/fonts@66928797f271fed5ee428544e7229685e2d90127/ofl
fetch() {  # 目标文件 地址 sha256
  [ -f "$1" ] && echo "$3  $1" | sha256sum -c --quiet 2>/dev/null && return
  curl -sSL --fail -o "$1" "$2"
  echo "$3  $1" | sha256sum -c --quiet
}
fetch fonts/LXGWWenKai-Medium.ttf https://github.com/lxgw/LxgwWenKai/releases/download/v1.510/LXGWWenKai-Medium.ttf 9744b2c25b5f096dd981d8c1271a53b16323e1217d244114ed7bcaa26eaca541
fetch fonts/LXGWWenKai-Regular.ttf https://github.com/lxgw/LxgwWenKai/releases/download/v1.510/LXGWWenKai-Regular.ttf ea47ec17d0f3d0ed1e6d9c51d6146402d4d1e2f0ff397a90765aaaa0ddd382fb
fetch fonts/NotoSerifSC-Bold.otf https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@Serif2.003/Serif/SubsetOTF/SC/NotoSerifSC-Bold.otf 24693d48bdb9152f0a06b02af625638a1097abd6de4010ebba027f6e82710527
fetch fonts/NotoSerifSC-Black.otf https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@Serif2.003/Serif/SubsetOTF/SC/NotoSerifSC-Black.otf 91dde57622845beeb663f300813999febdb7fcd5e451bde199d7c954a9740cb4
fetch fonts/NotoSansSC-Medium.otf https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@Sans2.004/Sans/SubsetOTF/SC/NotoSansSC-Medium.otf 7633f5a016d4dd95e685a69633d818aabc4644c4b08e26bd35b1b30c45ed5dda
fetch fonts/LongCang-Regular.ttf $GF/longcang/LongCang-Regular.ttf e5bf2c3f24ef2327c6f136d8f73e2f9dfdf44896fdbeb35a9515f44777bb91bc
fetch fonts/ZhiMangXing-Regular.ttf $GF/zhimangxing/ZhiMangXing-Regular.ttf 644e0cae9b40f0b10ab729a01bd32032e3973bac22be3dccae01bf6ae7fde969
[ -f audio/song.wav ] || { echo "缺少 audio/song.wav（44.1kHz 立体声的整首歌，3:26.9，开头有 1.4 秒静音）"; exit 1; }
NAME=失眠飞行
FPS=30
# 视频总长：main.js 里 DURATION = SONG_DUR + EPI + CARD - TRIM
TOTAL=$(python3 -c "
import re
t=open('timing.js',encoding='utf-8').read(); m=open('main.js',encoding='utf-8').read()
g=lambda s,k: float(re.search(r'const '+k+r' = ([\d.]+)',s).group(1))
print(round((g(t,'SONG_DUR')+g(m,'EPI')+g(m,'CARD')-g(m,'TRIM'))*$FPS))")
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
# 段落开头（第 10、18、26、34、42、50、58、66、74 小节，视频时间）放关键帧，切分时切在这里
CUTS=$(python3 -c "print(','.join(f'{0.178+n*4*60/94.995-1.30:.3f}' for n in (10,18,26,34,42,50,58,66,74)))")
# -aac_pns 0：关掉 AAC 的噪声替代，免得雨声这类噪声解码后冒出来
ffmpeg -y -loglevel error -i out/video_noaudio.mp4 -i out/mix.wav -c:v libx264 -preset slow -tune animation -crf ${CRF:-20} \
  -force_key_frames "$CUTS" -pix_fmt yuv420p -c:a aac -b:a 192k -aac_pns 0 -movflags +faststart -shortest out/$NAME.mp4
python3 ../../工具/split_mp4.py out/$NAME.mp4 out/$NAME 30 "$CUTS"
echo "完成：$(pwd)/out/$NAME.mp4（$(du -h out/$NAME.mp4 | cut -f1)）"
