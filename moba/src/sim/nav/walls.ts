import type { Vec2 } from '../../core/vec2';
import type { CapsuleLine } from '../../data/map';

/** 单个胶囊墙段：线段 ab + 半径 r */
export interface WallSeg {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  r: number;
}

/** 地图边界留白（米）：单位不能走到地图最外圈 */
export const BORDER_MARGIN = 1;

/**
 * 墙体场：负责圆形单位与墙的碰撞、推出、射线检测。
 * 用 4m 的桶网格加速查询。
 */
export class WallField {
  readonly segs: WallSeg[] = [];
  private readonly bucketSize = 4;
  private readonly buckets: number[][];
  private readonly nb: number;
  /** 查询时的“访问标记”，避免同一线段被多个桶重复处理 */
  private readonly stamp: Uint32Array;
  private stampGen = 1;

  constructor(
    lines: readonly CapsuleLine[],
    readonly size: number,
  ) {
    for (const l of lines) {
      const r = l.w / 2;
      if (l.pts.length === 1) {
        const a = l.pts[0]!;
        this.segs.push({ ax: a.x, ay: a.y, bx: a.x, by: a.y, r });
      }
      for (let i = 0; i + 1 < l.pts.length; i++) {
        const a = l.pts[i]!;
        const b = l.pts[i + 1]!;
        this.segs.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, r });
      }
    }
    this.nb = Math.ceil(size / this.bucketSize);
    this.buckets = Array.from({ length: this.nb * this.nb }, () => []);
    // 桶里登记时额外扩张 2m，覆盖单位半径和移动步长
    const pad = 2;
    this.segs.forEach((s, idx) => {
      const x0 = this.bi(Math.min(s.ax, s.bx) - s.r - pad);
      const x1 = this.bi(Math.max(s.ax, s.bx) + s.r + pad);
      const y0 = this.bi(Math.min(s.ay, s.by) - s.r - pad);
      const y1 = this.bi(Math.max(s.ay, s.by) + s.r + pad);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.buckets[y * this.nb + x]!.push(idx);
    });
    this.stamp = new Uint32Array(this.segs.length);
  }

  private bi(v: number): number {
    const i = Math.floor(v / this.bucketSize);
    return i < 0 ? 0 : i >= this.nb ? this.nb - 1 : i;
  }

  /** 遍历可能与 (x,y) 半径 rad 范围相交的线段 */
  private forNear(x: number, y: number, rad: number, fn: (s: WallSeg) => void): void {
    const gen = ++this.stampGen;
    const x0 = this.bi(x - rad);
    const x1 = this.bi(x + rad);
    const y0 = this.bi(y - rad);
    const y1 = this.bi(y + rad);
    for (let by = y0; by <= y1; by++) {
      for (let bx = x0; bx <= x1; bx++) {
        for (const idx of this.buckets[by * this.nb + bx]!) {
          if (this.stamp[idx] === gen) continue;
          this.stamp[idx] = gen;
          fn(this.segs[idx]!);
        }
      }
    }
  }

  /** 点 (x,y) 在半径 r 的圆下是否与墙相交（含地图边界） */
  isBlocked(x: number, y: number, r: number): boolean {
    const lo = BORDER_MARGIN + r;
    const hi = this.size - BORDER_MARGIN - r;
    if (x < lo || y < lo || x > hi || y > hi) return true;
    let hit = false;
    this.forNear(x, y, r, (s) => {
      if (!hit && segDist2(x, y, s) < (s.r + r) * (s.r + r)) hit = true;
    });
    return hit;
  }

  /**
   * 把半径 r 的圆推出所有墙体（原地修改 pos）。
   * 多轮迭代以处理两堵墙夹角处的情况。返回是否发生了碰撞。
   */
  resolve(pos: Vec2, r: number): boolean {
    let collided = false;
    for (let iter = 0; iter < 3; iter++) {
      let moved = false;
      this.forNear(pos.x, pos.y, r, (s) => {
        const R = s.r + r;
        const c = closest(pos.x, pos.y, s);
        const dx = pos.x - c.x;
        const dy = pos.y - c.y;
        const d2 = dx * dx + dy * dy;
        if (d2 >= R * R) return;
        const d = Math.sqrt(d2);
        if (d > 1e-6) {
          pos.x = c.x + (dx / d) * R;
          pos.y = c.y + (dy / d) * R;
        } else {
          // 圆心正好落在线段上：沿线段法线推出
          let nx = -(s.by - s.ay);
          let ny = s.bx - s.ax;
          const nl = Math.hypot(nx, ny) || 1;
          nx /= nl;
          ny /= nl;
          pos.x = c.x + nx * R;
          pos.y = c.y + ny * R;
        }
        moved = true;
      });
      const lo = BORDER_MARGIN + r;
      const hi = this.size - BORDER_MARGIN - r;
      if (pos.x < lo) (pos.x = lo), (moved = true);
      if (pos.y < lo) (pos.y = lo), (moved = true);
      if (pos.x > hi) (pos.x = hi), (moved = true);
      if (pos.y > hi) (pos.y = hi), (moved = true);
      if (!moved) break;
      collided = true;
    }
    return collided;
  }

  /**
   * 带碰撞的移动：按小步长推进，每步推出墙体。
   * 撞墙时法向分量被消掉、切向分量保留 → 贴墙滑动，不会卡住。
   * 原地修改 pos，返回是否撞到了墙。
   */
  move(pos: Vec2, r: number, dx: number, dy: number): boolean {
    const distance = Math.hypot(dx, dy);
    if (distance < 1e-9) return false;
    const steps = Math.max(1, Math.ceil(distance / 0.2));
    const sx = dx / steps;
    const sy = dy / steps;
    let hit = false;
    for (let i = 0; i < steps; i++) {
      pos.x += sx;
      pos.y += sy;
      if (this.resolve(pos, r)) hit = true;
    }
    return hit;
  }

  /**
   * 射线检测：从 a 到 b，半径 r 的圆第一次碰到墙时的比例 t∈[0,1]；无碰撞返回 1。
   * 用于弹道撞墙、闪现落点、视线判断。
   */
  sweep(a: Vec2, b: Vec2, r: number): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 1e-9) return this.isBlocked(a.x, a.y, r) ? 0 : 1;
    const step = 0.2;
    const n = Math.ceil(distance / step);
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      if (this.isBlocked(a.x + dx * t, a.y + dy * t, r)) return (i - 1) / n;
    }
    return 1;
  }
}

function closest(px: number, py: number, s: WallSeg): { x: number; y: number } {
  const abx = s.bx - s.ax;
  const aby = s.by - s.ay;
  const l2 = abx * abx + aby * aby;
  if (l2 < 1e-12) return { x: s.ax, y: s.ay };
  let t = ((px - s.ax) * abx + (py - s.ay) * aby) / l2;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return { x: s.ax + abx * t, y: s.ay + aby * t };
}

function segDist2(px: number, py: number, s: WallSeg): number {
  const c = closest(px, py, s);
  const dx = px - c.x;
  const dy = py - c.y;
  return dx * dx + dy * dy;
}
