"""查画面边上有没有"露底"：镜头推、摇出了画好的布景，边上露出一条空白的纸（或没清掉的黑底）。

先用 review.sh 每秒抽一帧，再对这些帧跑：
    python3 工具/edge_check.py 输出目录/f
看每帧四条边（各占宽/高的 2.5%）：
- 一条边是"白纸"（很亮、很平，标准差 < 6），画面中间却比它暗（画着东西）——镜头摇出了布景；
- 一条边是纯黑（很平），中间不黑——画布没清干净。
连着几秒的合成一段。只看"平"不够：缩小以后的幕布、海面、暗角也很平，会报出一大堆。
开头大字、片尾卡这种整张纸留白的，中间比边还亮，不会报。
"""
import glob
import os
import sys

import numpy as np
from PIL import Image


def edges(path):
    a = np.asarray(Image.open(path).convert('L'), dtype=float)
    h, w = a.shape
    bw, bh, cw, ch = max(4, w // 40), max(4, h // 40), w // 16, h // 9   # 边条宽度；去掉角上（水印、暗角）
    mid = a[h // 4:3 * h // 4, w // 4:3 * w // 4].mean()
    strips = {'左': a[ch:-ch, :bw], '右': a[ch:-ch, -bw:], '上': a[:bh, cw:-cw], '下': a[-bh:, cw:-cw]}
    hits = []
    for name, s in strips.items():
        m, sd = s.mean(), s.std()
        if (m > 175 and sd < 6 and m - mid > 10) or (m < 30 and sd < 4 and mid - m > 30):
            hits.append((name, m, sd))
    return mid, hits


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    frames = sorted(glob.glob(os.path.join(sys.argv[1], '*.png')))
    runs = []   # [起秒, 止秒, 哪几条边, 示例]
    for f in frames:
        sec = int(os.path.splitext(os.path.basename(f))[0]) - 1   # review.sh 的第 1 帧是第 0 秒
        mid, hits = edges(f)
        if not hits:
            continue
        sides = ''.join(h[0] for h in hits)
        desc = '，'.join(f'{n}边 {m:.0f}±{sd:.0f}' for n, m, sd in hits) + f'（中间 {mid:.0f}）'
        if runs and runs[-1][1] == sec - 1 and runs[-1][2] == sides:
            runs[-1][1] = sec
        else:
            runs.append([sec, sec, sides, desc])
    if not runs:
        print(f'{len(frames)} 帧，没有发现露底的边')
        return
    for a, b, sides, desc in runs:
        span = f'{a // 60}:{a % 60:02d}' + (f'–{b // 60}:{b % 60:02d}' if b > a else '')
        print(f'{span:>11}  {desc}')
    print(f'共 {len(runs)} 段：对照分镜看一眼，镜头本来就停在纸上的（比如画到一半的画）排除，其余的要改')


if __name__ == '__main__':
    main()
