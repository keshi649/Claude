"""歌词逐字对齐：Demucs 分出的人声 + torchaudio 的 MMS 强制对齐（汉字转成不带声调的拼音，按字母对齐）。
歌词行和大概的时刻是从用户发来的抖音视频画面里读出来的（滚动歌词高亮的时刻）。
做法：
  1. 按段落整段对齐（段落之间人声是静的，窗口边上不会切到别的句子）；
  2. 每句再以第 1 步的结果为中心、前后各放宽 0.8 秒单独对齐一次；两次相差 ≤ 0.15 秒的字取平均，否则取得分高的；
  3. 同一段副歌唱了四遍、主歌 B 唱了两遍：把各遍里同一句的字按句首对齐后比较，某个字和其他几遍的中位数差太多（> 0.35 秒），就用中位数换掉；
  4. 最后一个字是长音，开头常被对到拖音后半截：比前一个字的结尾晚 0.4 秒以上就拉回来。
输出 lyrics.js（给画面）和 out/align_report.txt（给人看）。
运行：/home/user/mvenv/bin/python align.py"""
import json
import numpy as np
import torch, torchaudio
from pypinyin import lazy_pinyin, Style

LINES = [  # (段落, 抖音歌词高亮的时刻, 歌词)
    ('A1', 19.9, '深色的海面布满白色的月光'),
    ('A1', 26.2, '我出神望着海 心不知飞哪去'),
    ('A1', 32.7, '听到她在告诉你'),
    ('A1', 36.4, '说她真的喜欢你'),
    ('A1', 40.6, '我不知该 躲哪里'),
    ('B1', 48.5, '爱一个人是不是应该有默契'),
    ('B1', 55.8, '我以为你懂得每当我看着你'),
    ('B1', 61.5, '我藏起来的秘密'),
    ('B1', 65.0, '在每一天清晨里'),
    ('B1', 68.9, '暖成咖啡 安静的拿给你'),
    ('C1', 75.4, '愿意 用一支黑色的铅笔'),
    ('C1', 80.4, '画一出沉默舞台剧'),
    ('C1', 84.5, '灯光再亮 也抱住你'),
    ('C1', 89.6, '愿意 在角落唱沙哑的歌'),
    ('C1', 94.5, '再大声也都是给你'),
    ('C1', 98.7, '请用心听 不要说话'),
    ('B2', 112.9, '爱一个人是不是应该有默契'),
    ('B2', 119.9, '我以为你懂得每当我看着你'),
    ('B2', 126.0, '我藏起来的秘密'),
    ('B2', 129.8, '在每一天清晨里'),
    ('B2', 133.7, '暖成咖啡 安静的拿给你'),
    ('C2', 139.8, '愿意 用一支黑色的铅笔'),
    ('C2', 144.5, '画一出沉默舞台剧'),
    ('C2', 148.9, '灯光再亮 也抱住你'),
    ('C2', 154.3, '愿意 在角落唱沙哑的歌'),
    ('C2', 159.4, '再大声也都是给你'),
    ('C2', 163.0, '请用心听 不要说话'),
    ('C3', 196.8, '愿意 用一支黑色的铅笔'),
    ('C3', 201.2, '画一出沉默舞台剧'),
    ('C3', 205.7, '灯光再亮 也抱住你'),
    ('C3', 210.9, '愿意 在角落唱沙哑的歌'),
    ('C3', 215.6, '再大声也都是给你'),
    ('C3', 220.1, '请原谅我 不会说话'),
    ('C4', 225.2, '愿意 用一支黑色的铅笔'),
    ('C4', 230.2, '画一出沉默舞台剧'),
    ('C4', 234.1, '灯光再亮 也抱住你'),
    ('C4', 239.4, '愿意 在角落唱沙哑的歌'),
    ('C4', 243.9, '再大声也都是给你'),
    ('C4', 248.1, '爱是用心吗 不要说话'),
]
# 段落的窗口（歌曲时间，人声是静的地方）
SECTION_WIN = {'A1': (17.5, 46.8), 'B1': (46.8, 75.6), 'C1': (74.6, 108.0), 'B2': (110.5, 139.9),
               'C2': (139.0, 171.0), 'C3': (195.0, 225.4), 'C4': (224.4, 256.0)}
# 段落的切分点也在句子中间时（B1→C1、B2→C2、C3→C4 是连着唱的），窗口互相重叠，靠第 2 步单句对齐修正

SR = 16000
wav, sr = torchaudio.load('out/demucs/htdemucs/song/vocals.wav')
wav = torchaudio.functional.resample(wav.mean(0), sr, SR)
bundle = torchaudio.pipelines.MMS_FA
model = bundle.get_model(with_star=False)
model.eval()
tokenizer = bundle.get_tokenizer()
aligner = bundle.get_aligner()


def chars_of(text):
    return [c for c in text if c.strip()]


def syl(c):
    p = lazy_pinyin(c, style=Style.NORMAL)[0].replace('ü', 'v')
    return p


def align(a, b, words):
    seg = wav[int(a * SR):int(b * SR)]
    with torch.inference_mode():
        em, _ = model(seg.unsqueeze(0))
    em = torch.log_softmax(em, dim=-1)
    spans = aligner(em[0], tokenizer(words))
    ratio = seg.size(0) / em.size(1) / SR
    out = []
    for sp in spans:
        s = a + sp[0].start * ratio
        e = a + sp[-1].end * ratio
        sc = float(np.mean([x.score for x in sp]))
        out.append([s, e, sc])
    return out


# 1. 整段对齐
res = {}
for sec, (a, b) in SECTION_WIN.items():
    idx = [i for i, l in enumerate(LINES) if l[0] == sec]
    words, owner = [], []
    for i in idx:
        for c in chars_of(LINES[i][2]):
            words.append(syl(c)); owner.append(i)
    al = align(a, b, words)
    for i in idx:
        res[i] = {'sec': al_ for al_ in [[al[k] for k in range(len(words)) if owner[k] == i]]}

# 2. 单句再对齐三次（前后各放宽 0.5、0.8、1.1 秒），和整段对齐的结果一起，每个字取中位数
for i, (sec, lrc, text) in enumerate(LINES):
    cs = chars_of(text)
    s0, e0 = res[i]['sec'][0][0], res[i]['sec'][-1][1]
    runs = [res[i]['sec']]
    for pad in (0.5, 0.8, 1.1):
        runs.append(align(max(0, s0 - pad), e0 + pad, [syl(c) for c in cs]))
    fin = []
    for k in range(len(cs)):
        st = np.median([r[k][0] for r in runs]); en = np.median([r[k][1] for r in runs])
        fin.append([float(st), float(en), float(np.median([r[k][2] for r in runs]))])
    res[i]['fin'] = fin
    res[i]['spread'] = max(np.ptp([r[k][0] for r in runs]) for k in range(len(cs)))

# 3. 各遍之间核对（相同歌词的句子）：按中位数节奏型估每一遍的句首（对个别字错不敏感），离中位数 > 0.35 秒的字换掉
groups = {}
for i, (sec, lrc, text) in enumerate(LINES):
    key = text.replace('请原谅我 不会说话', '请用心听 不要说话')  # 字数一样的才放一组
    groups.setdefault(key, []).append(i)
fixed = []
for key, ids in groups.items():
    if len(ids) < 3: continue
    T = np.array([[c[0] for c in res[i]['fin']] for i in ids])
    rel = T - T[:, :1]
    med = np.median(rel, axis=0)
    for j, i in enumerate(ids):
        base = float(np.median(T[j] - med))
        for k in range(len(med)):
            if abs(T[j][k] - (base + med[k])) > 0.35:
                d = res[i]['fin'][k][1] - res[i]['fin'][k][0]
                res[i]['fin'][k][0] = base + med[k]
                res[i]['fin'][k][1] = res[i]['fin'][k][0] + min(max(d, 0.15), 1.2)
                fixed.append((i, k))

# 4. 修正：句内、句间都要单调；最后一个字的起点
prev_end = 0
for i in range(len(LINES)):
    f = res[i]['fin']
    if f[0][0] < prev_end + 0.05:
        sh = prev_end + 0.05 - f[0][0]
        for x in f: x[0] += sh; x[1] += sh
    for k in range(1, len(f)):
        if f[k][0] < f[k - 1][0] + 0.06: f[k][0] = f[k - 1][0] + 0.06
    if len(f) > 1 and f[-1][0] - f[-2][1] > 0.4:
        f[-1][0] = f[-2][1] + 0.05
    for k in range(len(f) - 1):
        f[k][1] = min(f[k][1], f[k + 1][0])
    f[-1][1] = max(f[-1][1], f[-1][0] + 0.2)
    prev_end = f[-1][0]

with open('out/align_report.txt', 'w') as rep:
    for i, (sec, lrc, text) in enumerate(LINES):
        cs = chars_of(text); f = res[i]['fin']
        rep.write(f'{i:2d} {sec} lrc {lrc:6.1f} → {f[0][0]:7.2f}–{f[-1][1]:7.2f}  spread {res[i]["spread"]:.2f}  {text}\n')
        rep.write('     ' + '  '.join(f'{c}{x[0]:.2f}' + ('*' if (i, k) in fixed else '') + ('?' if x[2] < -2.5 else '') for k, (c, x) in enumerate(zip(cs, f))) + '\n')

lines_js = []
for i, (sec, lrc, text) in enumerate(LINES):
    cs = chars_of(text); f = res[i]['fin']
    lines_js.append({'sec': sec, 'text': text,
                     'ch': [[c, round(x[0], 3), round(x[1], 3)] for c, x in zip(cs, f)]})
with open('lyrics.js', 'w') as fo:
    fo.write('// 歌词逐字时间（歌曲时间，秒）。由 align.py 生成：text 是显示用的整句（带空格），ch 是 [字, 开始, 结束]\n')
    fo.write('const LYRICS = ' + json.dumps(lines_js, ensure_ascii=False, indent=0).replace('\n', '') + ';\n')
print(open('out/align_report.txt').read())
