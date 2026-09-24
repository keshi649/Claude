/**
 * 可设种子的伪随机数生成器（mulberry32）。
 * 逻辑层所有随机都必须走这里，禁止 Math.random，保证同种子 + 同命令流 = 同结果。
 * 状态只有一个 32 位整数，方便快照 / 联机同步。
 */
export class Rng {
  private s: number;

  constructor(seed: number) {
    this.s = seed >>> 0;
  }

  /** [0, 1) 均匀分布 */
  next(): number {
    let t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** [lo, hi) 均匀分布 */
  range(lo: number, hi: number): number {
    return lo + (hi - lo) * this.next();
  }

  /** [0, n) 整数 */
  int(n: number): number {
    return Math.floor(this.next() * n);
  }

  /** 以概率 p 返回 true */
  chance(p: number): boolean {
    return this.next() < p;
  }

  pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error('Rng.pick: 空数组');
    return arr[this.int(arr.length)]!;
  }

  /** 近似正态分布（均值 0，标准差 1），用于 AI 瞄准误差等 */
  gauss(): number {
    let u = 0;
    for (let i = 0; i < 6; i++) u += this.next();
    // 6 个均匀分布之和的方差为 0.5，除以 √0.5 归一到标准差 1
    return (u - 3) / Math.SQRT1_2;
  }

  get state(): number {
    return this.s;
  }

  set state(v: number) {
    this.s = v >>> 0;
  }
}
