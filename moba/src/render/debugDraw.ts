import { Graphics } from 'pixi.js';
import type { World } from '../sim/world';

export interface DebugDrawOptions {
  colliders: boolean;
  paths: boolean;
}

/**
 * 调试绘制：墙体碰撞胶囊、单位碰撞圆、寻路路径与镜头附近的导航网格阻挡格。
 */
export class DebugDraw {
  readonly g = new Graphics();

  draw(w: World, opt: DebugDrawOptions, view: { x0: number; y0: number; x1: number; y1: number }): void {
    const g = this.g;
    g.clear();
    if (opt.colliders) {
      for (const s of w.walls.segs) {
        if (Math.max(s.ax, s.bx) + s.r < view.x0 || Math.min(s.ax, s.bx) - s.r > view.x1) continue;
        if (Math.max(s.ay, s.by) + s.r < view.y0 || Math.min(s.ay, s.by) - s.r > view.y1) continue;
        g.moveTo(s.ax, s.ay).lineTo(s.bx, s.by).stroke({ width: s.r * 2, color: 0xff00ff, alpha: 0.18, cap: 'round' });
        g.moveTo(s.ax, s.ay).lineTo(s.bx, s.by).stroke({ width: 0.05, color: 0xff00ff, alpha: 0.9 });
      }
      for (const u of w.list) {
        if (!u.alive) continue;
        g.circle(u.pos.x, u.pos.y, u.radius).stroke({ width: 0.05, color: 0x00ff88, alpha: 0.9 });
        g.moveTo(u.pos.x, u.pos.y)
          .lineTo(u.pos.x + Math.cos(u.facing) * u.radius, u.pos.y + Math.sin(u.facing) * u.radius)
          .stroke({ width: 0.05, color: 0x00ff88 });
        if (u.kind === 'hero') {
          g.circle(u.pos.x, u.pos.y, u.stats.range + u.radius).stroke({ width: 0.04, color: 0xffff00, alpha: 0.5 });
        }
      }
    }
    if (opt.paths) {
      // 导航网格阻挡格（只画镜头范围内）
      const nav = w.nav;
      const c = nav.cell;
      const cx0 = Math.max(0, Math.floor(view.x0 / c));
      const cx1 = Math.min(nav.w - 1, Math.ceil(view.x1 / c));
      const cy0 = Math.max(0, Math.floor(view.y0 / c));
      const cy1 = Math.min(nav.h - 1, Math.ceil(view.y1 / c));
      for (let y = cy0; y <= cy1; y++) {
        for (let x = cx0; x <= cx1; x++) {
          if (nav.blocked(x, y)) g.rect(x * c, y * c, c, c).fill({ color: 0xff3030, alpha: 0.16 });
        }
      }
      for (const u of w.list) {
        if (!u.alive || (!u.navGoal && u.navPath.length === 0)) continue;
        let px = u.pos.x;
        let py = u.pos.y;
        for (const p of u.navPath) {
          g.moveTo(px, py).lineTo(p.x, p.y).stroke({ width: 0.12, color: 0x00e5ff, alpha: 0.95 });
          g.circle(p.x, p.y, 0.18).fill(0x00e5ff);
          px = p.x;
          py = p.y;
        }
        if (u.navGoal) g.circle(u.navGoal.x, u.navGoal.y, 0.4).stroke({ width: 0.1, color: 0x00e5ff });
      }
    }
  }
}
