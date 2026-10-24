# 工具

做视频用的检查和辅助脚本，每集都能用。什么时候用、怎么看结果，见根目录的 `做视频经验.md`。

| 脚本 | 干什么 | 用法 |
|---|---|---|
| `setup_tts.sh` | 新容器里搭配音环境（CosyVoice 3 + FunASR，CPU），约 20~30 分钟、12 GB | `bash 工具/setup_tts.sh > /tmp/setup_tts.log 2>&1` |
| `fake_tl.py` | 配音没合成完时，先估一个时间轴预览画面 | `python3 工具/fake_tl.py 源码` |
| `precheck.py` | 渲染前查 JS 语法、时间轴编号（`S` `CH` `SS`…）、`audio.py` 里没定义的函数、对话框有没有画 | `python3 工具/precheck.py 源码` |
| `sfx_check.py` | 渲染前查短促音效有没有压在旁白某个字的字头上（按配音的逐字时间算），列出 `audio.py` 的行 | `python3 工具/sfx_check.py 源码` |
| `selfcheck.py` | 盖章时刻、"你"的次数、总时长、讲完到结束、最宽的字幕 | `python3 工具/selfcheck.py 源码` |
| `measure.sh` | 成片的时长、大小、前 20 秒切镜头、响度、真峰值 | `bash 工具/measure.sh 成片.mp4` |
| `cut_diff.py` | 柔和转场（淡入、虚化、甩镜头）measure.sh 数不到：按分镜给出换镜头的时刻，比转场前后两帧的差和同一镜头里的差 | `python3 工具/cut_diff.py 成片.mp4 3.51,6.71,…` |
| `review.sh` | 每秒 1 帧拼成图，通看一遍 | `bash 工具/review.sh 成片.mp4 输出目录` |
| `safe_check.sh` | 抽几帧叠上平台遮挡区，看关键的字有没有被挡 | `bash 工具/safe_check.sh 成片.mp4 输出目录 时刻…` |
| `edge_check.py` | 查画面四边有没有露出黑边（像素缓冲没盖满画面），每秒抽两帧，按时刻打印哪一边；底下那条常被歌词挡住，单帧预览看不出来 | `python3 工具/edge_check.py 成片.mp4` |
| `sheet.py` | 把几张帧拼成一张图 | `python3 工具/sheet.py 输出.jpg 每行几张 缩放 帧…` |
| `safe_overlay.py` | 给帧叠上遮挡区（`safe_check.sh` 会调用） | `python3 工具/safe_overlay.py 帧…` |
| `asr_full.py` | 整条转写成片 | `/home/user/tts/venv/bin/python 工具/asr_full.py 成片.mp4` |
| `line_asr.py` | 按时间轴逐句转写成片，按拼音和原稿比 | `/home/user/tts/venv/bin/python 工具/line_asr.py 源码 成片.mp4` |
| `seg_asr.py` | 转写成片里的几小段 | `/home/user/tts/venv/bin/python 工具/seg_asr.py 成片.mp4 起:止 …` |
| `stems.py` | 把声音拆成纯人声、人声 + 环境声、人声 + 音效三轨，分别转写，查单句转写错是哪一层的问题 | `python3 工具/stems.py 源码 输出目录` |
| `tone_check.py` | 看配音里某几个字的音高曲线（声调），`--vot` 看送气，`--all` 连整句一起看 | `/home/user/tts/venv/bin/python 工具/tone_check.py 源码 编号 [字] [--vot] [--all]` |
| `takes.py` | 同一句换几个种子各合成一版，挑声调和语速都对的 | 见文件开头 |
| `split_mp4.py` | 成片超过 30 MB 时切成几段：优先切在段落开头（编码时用 `-force_key_frames` 放好关键帧），按每个包的字节数估每段多大，从最少的段数试起、切点组合里挑最大一段最小的；segment 封装器 `-c copy` 切，核对每段不超限、帧数加起来等于整片。上限按 MiB 算，给 28.6 时十进制也 ≤ 30 MB | `python3 工具/split_mp4.py 成片.mp4 输出前缀 28.6 切点1,切点2,…` |
| `splice_parts.py` | 只重渲了几段画面时（`node render.cjs video 起始帧 结束帧 out/re_起始帧.mp4 30`），把它们按帧换进 build.sh 渲出来的 `out/part*.mp4`，配上音频一次编码成成片，不用整片重渲 | `python3 工具/splice_parts.py 源码 输出.mp4 out/mix.wav 关键帧时刻 out/re_2190.mp4 …` |
| `fill_docs.py` | 把 README / 脚本里的 `⟨…⟩` 占位符换成真实时间、大小、切镜头时刻 | `python3 工具/fill_docs.py 集目录 "查读错的说明"` |

带 `/home/user/tts/venv/bin/python` 的几个要用配音环境的 Python（里面有 FunASR、pyworld）。
