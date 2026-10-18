"""核对软转场（揉开、擦掉、叠化）确实换了镜头。measure.sh 用的场景检测（scene > 0.25）只认硬切，
前后两个镜头又都暗的时候，软转场一次也测不出来。

    python3 工具/cut_check.py 成片.mp4 时刻1 时刻2 …     （时刻是分镜里转场的中点，成片时间，秒）

每个时刻比较转场前后各 w 秒的两帧（默认 0.6 秒，要比转场长一半以上），再拿转场前、后各自同样间隔的两帧
当"镜头内"的基准（取小的那个：有一边的镜头本身动得厉害，比如人走过、镜头在摇）：
前后差明显大于镜头内（≥ 3 倍且 ≥ 8），就算换了镜头。两边都在大动的，去看帧。
"""
import subprocess
import sys

import numpy as np

W, H = 480, 270


def grab(mp4, t):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{max(0.0, t):.3f}', '-i', mp4, '-frames:v', '1',
                        '-vf', f'scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.uint8).reshape(H, W).astype(float)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--w=')]
    w = next((float(a[4:]) for a in sys.argv[1:] if a.startswith('--w=')), 0.6)
    if len(args) < 2:
        sys.exit(__doc__)
    mp4, times = args[0], [float(x) for x in args[1:]]
    n = 0
    for t in times:
        a, b = grab(mp4, t - w), grab(mp4, t + w)
        d = np.abs(b - a).mean()
        d0 = min(np.abs(a - grab(mp4, t - 3 * w)).mean(), np.abs(grab(mp4, t + 3 * w) - b).mean())
        ok = d >= 8 and d >= 3 * d0
        n += ok
        print(f'{t:7.2f} 秒：前后差 {d:5.1f}，镜头内 {d0:4.1f} → {"换了镜头" if ok else "看不出换了镜头，去看帧"}')
    print(f'{n}/{len(times)} 处确认换了镜头')


if __name__ == '__main__':
    main()
