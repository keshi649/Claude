"""《超过的车，为什么总在红灯追上你？》片中的百分比是这样算出来的（numpy，固定种子，几秒跑完）。

模型照 Boland 2026（Royal Society Open Science，DOI 10.1098/rsos.260310）摘要里的设定：
  两辆车、固定周期的红绿灯；一个周期 C 秒，其中红灯占 r；快车（你）比慢车（他）早 t 秒到路口。
  到路口时红绿灯在周期的哪一秒是随机的；赶上红灯就停下等，变绿立刻走；两车匀速。
  你还在等红灯时他到了 → 两车一起走，领先清零（"又碰面了"）。
  单个路口被追上的可能 = max(r − t/C, 0)：r = 0.5、C = 120、t = 10 → 0.5 − 10/120 = 41.7%。
多个路口：每个路口的红绿灯互不相关（不是绿波带），领先会变（他被拦下时你一下甩开他），
  被追上过一次以后两车一起走。gain 是每段路你额外多领先的秒数（片中用 0：超车以后两车一样快）。

用法：python3 sim.py
"""
import numpy as np

C, r, N = 120.0, .5, 400000
R = r * C


def wait(ph):
    """在周期的第 ph 秒到路口要等多久（0~R 是红灯）"""
    return np.where(ph < R, R - ph, 0.0)


def run(t0=10.0, gain=0.0, n=8, seed=2026):
    rng = np.random.default_rng(seed)
    lead = np.full(N, t0)
    caught = np.zeros(N, bool)
    cum = []
    for _ in range(n):
        a = rng.uniform(0, C, N)                    # 你到路口时在周期的哪一秒
        wa, wb = wait(a), wait((a + lead) % C)       # 你要等多久、他要等多久
        c = (wa > 0) & (lead < wa)                   # 你还在等，他就到了
        lead = np.where(c, 0.0, lead + wb - wa) + gain
        caught |= c
        cum.append(caught.mean())
    return np.array(cum), lead


if __name__ == '__main__':
    print('单个路口的公式：r − t/C =', round(r - 10 / C, 4))
    cum, lead = run()
    print('至少被追上一次（第 1~8 个路口，%）：', ' '.join(f'{x * 100:.1f}' for x in cum))
    print(f'8 个路口以后：平均领先 {lead.mean():.1f} 秒，领先为 0 的占 {np.mean(lead == 0) * 100:.1f}%')
    for g in (2, 3):
        c2, _ = run(gain=g)
        print(f'如果每段路再多领先 {g} 秒：3 个路口 {c2[2] * 100:.0f}%，8 个路口 {c2[7] * 100:.0f}%')
