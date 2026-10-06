# 歌词 MV《还是分开》Claude 版

> 你掐灭的不是烟，是 Claude 还没想完的那颗 ✻。

一支 72 秒的横屏歌词 MV，配张叶蕾《还是分开》的一段（从"你掐灭没吸的烟"唱到"用力地关"）。画风学的是参考片（一支 Clawd 歌词 MV，原水印是「知洲」）：逐字踩点的大字、按字面拍的画面梗、四角固定的 HUD。场景全部重新编过，开头、中间、结尾都是照这首歌的词来的。

"我"是 Clawd，照着发来的模型图画；"你"是一只鼠标指针，也就是屏幕那头的用户。烟头是 Claude 转圈的那颗 ✻，你按了 Esc；Clawd 把 `结局.md` 里的"还是分开"改成"不分开"，你一句话不说，`Ctrl+Z`，然后 `/exit`；`CLAUDE.md` 里记的全是你；结局测试跑了 99 遍，全是"分开"，0 个例外；git 合并两次，两次冲突；你眼里的它只有 144P。最后车门在它面前关上，会话结束。路灯下，Clawd 说："……那我再等一下下。"

画面右下角的水印是 **"甜菜"**。

| 文件 | 说明 |
|---|---|
| `还是分开.mp4` | 成片：1920×1080，30fps，H.264 + AAC，72 秒，约 18 MB，响度 −14 LUFS。**不在仓库里**：成片带着原曲音频，仓库是公开的；按下面的步骤重新生成 |
| `封面.jpg` | 封面（取自"还是分开"git 分支那一段） |
| `脚本.md` | 从参考片学了什么、没照抄什么，歌曲结构，逐段分镜，声音说明 |
| `源码/` | 生成视频用的全部代码 |

## 怎么做出来的

- **歌词时间轴**：`源码/analyze.py`。先用 Demucs 分出人声；歌词对照三遍 Whisper（small / medium / large-v3）和原视频字幕定下来；再交给 wav2vec2 中文模型做 CTC 强制对齐，得到每个字开口的时刻，最后吸附到最近的人声 onset 上。节拍是 134.0 BPM、没有漂移；和弦 IV–V–iii–vi 每小节换一次，强拍就定在换和弦的那一拍。结果写在 `源码/timing.js`，画面读这一份，混音读 `core.js` 里的片头片尾时长。
- **画面**：
  - `core.js`：时间工具、缓动、配色（"我"暖橘、"你"冷蓝）、逐字字效（砸下、弹出、掉落、烟雾、挤出、空心、马赛克）、点阵底纹、HUD 和水印"甜菜"（旁边一颗随拍点头的像素甜菜）。
  - `chars.js`：Clawd（照模型图的格子画，带各种眼睛、举手、伸长胳膊、走路、消散成虚线）、鼠标指针、几只卡通手（猜拳、拖动）、车、窗口、气泡、印章、键帽。
  - `scenes1.js`：主歌。点烟、掐灭、流星、抓衣角、改结局和 /exit、原地喊、不回头、不存在、CLAUDE.md、迫不及待、胶片、空白。
  - `scenes2.js`：副歌前半。猜拳、屏幕分开、测试没有例外、差评三连、聊天记录、拖到现在、吵架、git 合并冲突。
  - `scenes3.js`：副歌后半和尾声。眼睛里的 144P、追出去、车门、关门、路灯下。
  - `main.js`：镜头表、转场（往上摇、甩镜头、撕纸）、震屏、闪白、副歌重拍推镜。

  `frame(T)` 只依赖时间。`render.cjs` 用 Playwright 逐帧截图，交给 ffmpeg 编码。
- **声音**：原曲片段原样使用。`源码/mix.py` 用 numpy 合成片头的打火机和烟头噼啪声，尾声的车声、虫鸣、打字声和气泡声，最后两遍 loudnorm 统一响度。
- **字体**：思源黑体 Noto Sans SC、JetBrains Mono（均为 SIL OFL）。构建时自动下载，不放进仓库。

## 重新生成

歌曲音频不放进仓库。`timing.js` 里的时间是按发来的那段 65.2 秒的片段对的（第 0 秒就开口唱"你"）。把这段的音轨转成 `源码/audio/song.wav`：

```bash
cd 源码
mkdir -p audio && ffmpeg -i 你的音频.m4a -vn -ac 2 -ar 44100 audio/song.wav
pip install numpy scipy
NODE_PATH=$(npm root -g) ./build.sh      # 输出到 源码/out/还是分开.mp4
```

4 核机器上大约 5 分钟。`timing.js` 已经在仓库里，只有换了音源（比如开头多了几秒）才需要重跑分析，这一步要 librosa、torch、transformers 和 demucs：

```bash
pip install librosa torch torchaudio transformers demucs
python3 analyze.py
```

预览某几个时间点的单帧（成片时间，等于歌曲时间加 2 秒）；`cover` 出不带 HUD 的封面：

```bash
NODE_PATH=$(npm root -g) node render.cjs preview 2.2,37.4,65.8 out/preview
NODE_PATH=$(npm root -g) node render.cjs cover 54.25 ../封面.jpg
```

成片要是超过 30 MB 不方便发，可以按关键帧切成几段（每段都能单独播放）：

```bash
ffmpeg -i out/还是分开.mp4 -c copy -f segment -segment_time 24 -reset_timestamps 1 out/还是分开_%d.mp4
```
