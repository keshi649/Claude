import type { Vec2 } from '../../core/vec2';
import type { WallField } from './walls';

/**
 * 导航网格：0.5m 一格，按“净空半径”膨胀墙体后标记不可走。
 * A* 在这张网格上搜索，得到的路径天然与墙保持距离。
 * 另有动态障碍层（防御塔、水晶），建筑被摧毁后可移除。
 */
export class NavGrid {
  readonly w: number;
  readonly h: number;
  /** 静态墙体阻挡 */
  readonly wall: Uint8Array;
  /** 动态障碍计数（多个障碍重叠时计数） */
  readonly dyn: Uint16Array;

  constructor(
    walls: WallField | null,
    readonly cell = 0.5,
    readonly clearance = 0.6,
    size = walls?.size ?? 0,
    wallLayer?: Uint8Array,
  ) {
    this.w = Math.ceil(size / cell);
    this.h = this.w;
    this.dyn = new Uint16Array(this.w * this.h);
    if (wallLayer) {
      this.wall = wallLayer.slice();
      return;
    }
    this.wall = new Uint8Array(this.w * this.h);
    if (!walls) return;
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const cx = (x + 0.5) * cell;
        const cy = (y + 0.5) * cell;
        if (walls.isBlocked(cx, cy, clearance)) this.wall[y * this.w + x] = 1;
      }
    }
  }

  /** 复制一份（共享静态墙体栅格的计算结果，动态障碍层独立） */
  clone(): NavGrid {
    return new NavGrid(null, this.cell, this.clearance, this.w * this.cell, this.wall);
  }

  inBounds(cx: number, cy: number): boolean {
    return cx >= 0 && cy >= 0 && cx < this.w && cy < this.h;
  }

  blocked(cx: number, cy: number): boolean {
    if (!this.inBounds(cx, cy)) return true;
    const i = cy * this.w + cx;
    return this.wall[i] !== 0 || this.dyn[i] !== 0;
  }

  toCell(p: Vec2): { cx: number; cy: number } {
    return { cx: Math.floor(p.x / this.cell), cy: Math.floor(p.y / this.cell) };
  }

  cellCenter(cx: number, cy: number): Vec2 {
    return { x: (cx + 0.5) * this.cell, y: (cy + 0.5) * this.cell };
  }

  walkableAt(p: Vec2): boolean {
    const { cx, cy } = this.toCell(p);
    return !this.blocked(cx, cy);
  }

  /** 登记 / 移除圆形动态障碍（半径会加上净空） */
  setCircleObstacle(center: Vec2, radius: number, add: boolean): void {
    const R = radius + this.clearance;
    const x0 = Math.max(0, Math.floor((center.x - R) / this.cell));
    const x1 = Math.min(this.w - 1, Math.floor((center.x + R) / this.cell));
    const y0 = Math.max(0, Math.floor((center.y - R) / this.cell));
    const y1 = Math.min(this.h - 1, Math.floor((center.y + R) / this.cell));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const c = this.cellCenter(x, y);
        if (Math.hypot(c.x - center.x, c.y - center.y) <= R) {
          const i = y * this.w + x;
          this.dyn[i] = add ? this.dyn[i]! + 1 : Math.max(0, this.dyn[i]! - 1);
        }
      }
    }
  }

  /** 找离 (cx,cy) 最近的可走格（螺旋扩散），找不到返回 null */
  nearestWalkable(cx: number, cy: number, maxRadius = 40): { cx: number; cy: number } | null {
    if (!this.blocked(cx, cy)) return { cx, cy };
    for (let r = 1; r <= maxRadius; r++) {
      let best: { cx: number; cy: number } | null = null;
      let bestD = Infinity;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const x = cx + dx;
          const y = cy + dy;
          if (this.blocked(x, y)) continue;
          const d = dx * dx + dy * dy;
          if (d < bestD) {
            bestD = d;
            best = { cx: x, cy: y };
          }
        }
      }
      if (best) return best;
    }
    return null;
  }

  /** 网格上两点之间是否直线可通（按半格步长采样） */
  lineWalkable(a: Vec2, b: Vec2): boolean {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const d = Math.hypot(dx, dy);
    const n = Math.max(1, Math.ceil(d / (this.cell * 0.5)));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const cx = Math.floor((a.x + dx * t) / this.cell);
      const cy = Math.floor((a.y + dy * t) / this.cell);
      if (this.blocked(cx, cy)) return false;
    }
    return true;
  }
}
