#!/bin/bash
# 《不要说话》MV 一键生成：字体 → 音效时刻 → 混音 → 4 路并行逐帧渲染 → 拼接、编码 → 超过 30 MB 切段。
# 需要：node + Playwright（Chromium）、ffmpeg、python3（numpy scipy soundfile pyloudnorm）；
# 原曲放在 audio/song.wav，Demucs 分出的人声在 out/demucs/htdemucs/song/vocals.wav（见 README）。
# 用法：cd 源码 && NODE_PATH=$(npm root -g) ./build.sh
set -e
cd "$(dirname "$0")"
NAME=不要说话
mkdir -p out fonts

# 1. 字体（都是 SIL OFL）：从 npm 下载，校验 sha256
fetch_npm() {   # 包的 tarball 地址、sha256、包里的子目录、放到 fonts/ 下的目录名
  mkdir -p out/fontdl && curl -sSL -o out/fontdl/pkg.tgz "$1"
  echo "$2  out/fontdl/pkg.tgz" | sha256sum -c - > /dev/null
  tar xzf out/fontdl/pkg.tgz -C out/fontdl && rm -rf "fonts/$4" && cp -r "out/fontdl/package/$3" "fonts/$4"
  rm -rf out/fontdl
}
[ -f fonts/xiaolai/result.css ] || fetch_npm https://registry.npmjs.org/@chinese-fonts/xiaolai/-/xiaolai-3.0.0.tgz \
  7e631bbd7c4cd06321cc104511792f65efd4b231478256199ee79c5fcdc6f8a0 dist/Xiaolai xiaolai
if [ ! -f fonts/longcang/index.css ]; then
  fetch_npm https://registry.npmjs.org/@fontsource/long-cang/-/long-cang-5.3.0.tgz \
    f37d7fc6e0ed15718e03fe9edd5f8b0117d6d011d23c15bf2d35b7b00f9c4e26 files longcang/files
  curl -sSL https://registry.npmjs.org/@fontsource/long-cang/-/long-cang-5.3.0.tgz | tar xzO package/index.css > fonts/longcang/index.css
fi

# 2. 画面里的动作时刻 → 音效；混音
node render.cjs sfx out/sfx.json
python3 mix.py out/audio.wav

# 3. 4 路并行渲染（中间文件用高质量的 CRF 12，最后统一编码一次）
FRAMES=$(node -e "const s=require('fs').readFileSync('timing.js','utf8');const o=+s.match(/OFFSET = ([\d.]+)/)[1],e=+s.match(/SONG_END = ([\d.]+)/)[1];console.log(Math.round((e-o)*30))")
Q=$(( (FRAMES + 3) / 4 ))
for i in 0 1 2 3; do
  A=$(( i * Q )); B=$(( (i + 1) * Q )); [ $B -gt $FRAMES ] && B=$FRAMES
  node render.cjs video $A $B out/part$i.mp4 30 > out/log$i.txt 2>&1 &
done
wait
for i in 0 1 2 3; do grep -q "done in" out/log$i.txt || { echo "第 $i 路没渲染完，看 out/log$i.txt"; exit 1; }; done

# 4. 拼接、编码、合音频。段落开头放关键帧（切段时优先切在这些地方）：成片时间 = 歌曲时间 − 1
: > out/list.txt; for i in 0 1 2 3; do echo "file 'part$i.mp4'" >> out/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/list.txt -c copy out/video_noaudio.mp4
KEYS=17.75,46.41,73.85,101.89,111.1,138.4,166.4,195.65,224.35,252.29
ffmpeg -y -loglevel error -i out/video_noaudio.mp4 -i out/audio.wav -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf ${CRF:-24} -pix_fmt yuv420p -force_key_frames "$KEYS" \
  -c:a aac -b:a 192k -aac_pns 0 -movflags +faststart -shortest "out/$NAME.mp4"
ls -la "out/$NAME.mp4"

# 5. 超过 30 MB 就切成几段（每段 ≤ 30 MB，优先切在段落开头）
python3 ../../工具/split_mp4.py "out/$NAME.mp4" "out/$NAME" 30 "$KEYS"
