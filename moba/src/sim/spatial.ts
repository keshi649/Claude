import type { Unit } from './entity';

/**
 * 均匀空间网格：每帧重建，用于碰撞、索敌、范围技能查询。
 * 150+ 单位时查询只需遍历附近几个格子。
 */
export class SpatialHash {
  private readonly n: number;
  private readonly cells: Unit[][];
  /** 最大单位半径，查询时自动外扩 */
  private maxRadius = 0;

  constructor(
    readonly size: number,
    readonly cellSize = 4,
  ) {
    this.n = Math.ceil(size / cellSize);
    this.cells = Array.from({ length: this.n * this.n }, () => []);
  }

  private ci(v: number): number {
    const i = Math.floor(v / this.cellSize);
    return i < 0 ? 0 : i >= this.n ? this.n - 1 : i;
  }

  rebuild(units: Iterable<Unit>): void {
    for (const c of this.cells) c.length = 0;
    this.maxRadius = 0;
    for (const u of units) {
      if (!u.alive) continue;
      this.cells[this.ci(u.pos.y) * this.n + this.ci(u.pos.x)]!.push(u);
      if (u.radius > this.maxRadius) this.maxRadius = u.radius;
    }
  }

  /**
   * 查询与圆 (x,y,r) 相交的存活单位（精确判定：圆心距 < r + 单位半径）。
   * 结果写入 out 并返回（调用方可复用数组）。
   */
  query(x: number, y: number, r: number, out: Unit[] = []): Unit[] {
    out.length = 0;
    const R = r + this.maxRadius;
    const x0 = this.ci(x - R);
    const x1 = this.ci(x + R);
    const y0 = this.ci(y - R);
    const y1 = this.ci(y + R);
    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) {
        for (const u of this.cells[cy * this.n + cx]!) {
          const dx = u.pos.x - x;
          const dy = u.pos.y - y;
          const rr = r + u.radius;
          if (dx * dx + dy * dy <= rr * rr) out.push(u);
        }
      }
    }
    return out;
  }
}
