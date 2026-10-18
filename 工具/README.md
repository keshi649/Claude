# 工具

做视频用的检查和辅助脚本，每集都能用。什么时候用、怎么看结果，见根目录的 `做视频经验.md`。

| 脚本 | 干什么 | 用法 |
|---|---|---|
| `setup_tts.sh` | 新容器里搭配音环境（CosyVoice 3 + FunASR，CPU），约 20~30 分钟、12 GB | `bash 工具/setup_tts.sh > /tmp/setup_tts.log 2>&1` |
| `fake_tl.py` | 配音没合成完时，先估一个时间轴预览画面 | `python3 工具/fake_tl.py 源码` |
| `precheck.py` | 渲染前查 JS 语法、时间轴编号（`S` `CH` `SS`…）、`audio.py` 里没定义的函数 | `python3 工具/precheck.py 源码` |
| `selfcheck.py` | 盖章时刻、"你"的次数、总时长、讲完到结束、最宽的字幕 | `python3 工具/selfcheck.py 源码` |
| `measure.sh` | 成片的时长、大小、前 20 秒切镜头、响度、真峰值 | `bash 工具/measure.sh 成片.mp4` |
| `review.sh` | 每秒 1 帧拼成图，通看一遍 | `bash 工具/review.sh 成片.mp4 输出目录` |
| `edge_check.py` | 查画面边上有没有露底（镜头推、摇出了画好的布景，边上一条白纸或黑底） | `python3 工具/edge_check.py 输出目录/f`（review.sh 抽的帧） |
| `cut_check.py` | 核对软转场（揉开、擦掉、叠化）确实换了镜头：`measure.sh` 的场景检测只认硬切 | `python3 工具/cut_check.py 成片.mp4 时刻…` |
| `safe_check.sh` | 抽几帧叠上平台遮挡区，看关键的字有没有被挡 | `bash 工具/safe_check.sh 成片.mp4 输出目录 时刻…` |
| `sheet.py` | 把几张帧拼成一张图 | `python3 工具/sheet.py 输出.jpg 每行几张 缩放 帧…` |
| `safe_overlay.py` | 给帧叠上遮挡区（`safe_check.sh` 会调用） | `python3 工具/safe_overlay.py 帧…` |
| `asr_full.py` | 整条转写成片 | `/home/user/tts/venv/bin/python 工具/asr_full.py 成片.mp4` |
| `line_asr.py` | 按时间轴逐句转写成片，按拼音和原稿比 | `/home/user/tts/venv/bin/python 工具/line_asr.py 源码 成片.mp4` |
| `seg_asr.py` | 转写成片里的几小段 | `/home/user/tts/venv/bin/python 工具/seg_asr.py 成片.mp4 起:止 …` |
| `tone_check.py` | 看配音里某几个字的音高曲线（声调），`--vot` 看送气，`--all` 连整句一起看 | `/home/user/tts/venv/bin/python 工具/tone_check.py 源码 编号 [字] [--vot] [--all]` |
| `takes.py` | 同一句换几个种子各合成一版，挑声调和语速都对的 | 见文件开头 |
| `split_mp4.py` | 成片超过 30 MB 时切成几段：切在段落开头（编码时用 `-force_key_frames` 放好关键帧），按每个包的实际大小挑切点（段数尽量少、最大的一段尽量小），segment 封装器 `-c copy` 切，核对每段 ≤ 30 MB、帧数加起来等于整片 | `python3 工具/split_mp4.py 成片.mp4 输出前缀 30 切点1,切点2,…` |
| `fill_docs.py` | 把 README / 脚本里的 `⟨…⟩` 占位符换成真实时间、大小、切镜头时刻 | `python3 工具/fill_docs.py 集目录 "查读错的说明"` |

带 `/home/user/tts/venv/bin/python` 的几个要用配音环境的 Python（里面有 FunASR、pyworld）。
