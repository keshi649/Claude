import { Graphics } from 'pixi.js';
import type { SkillStage } from '../data/schema';
import type { AimPreview } from '../input/aim';

/**
 * 技能瞄准指示器（世界层，单位下方）。拖到取消区时整体变红。
 */
export class Indicator {
  readonly g = new Graphics();

  clear(): void {
    this.g.clear();
  }

  draw(hx: number, hy: number, stage: SkillStage, p: AimPreview, cancel: boolean, now: number): void {
    const g = this.g;
    g.clear();
    const main = cancel ? 0xff4040 : 0x9fd8ff;
    const fillA = cancel ? 0.12 : 0.18;
    const ind = stage.indicator;
    const rot = Math.atan2(p.dir.y, p.dir.x);

    // 施法范围圈
    if (stage.range > 0 && ind.k !== 'self') {
      g.circle(hx, hy, stage.range).fill({ color: main, alpha: 0.05 });
      g.circle(hx, hy, stage.range).stroke({ width: 0.08, color: main, alpha: 0.55 });
    }

    switch (ind.k) {
      case 'line': {
        const L = stage.range;
        const hw = ind.width / 2;
        const c = Math.cos(rot);
        const s = Math.sin(rot);
        const pts = [
          [0, -hw],
          [L, -hw],
          [L + hw * 0.8, 0],
          [L, hw],
          [0, hw],
        ].flatMap(([x, y]) => [hx + x! * c - y! * s, hy + x! * s + y! * c]);
        g.poly(pts).fill({ color: main, alpha: fillA });
        g.poly(pts).stroke({ width: 0.08, color: main, alpha: 0.9 });
        break;
      }
      case 'cone': {
        const half = (ind.angle * Math.PI) / 360;
        g.moveTo(hx, hy).arc(hx, hy, stage.range, rot - half, rot + half).lineTo(hx, hy);
        g.fill({ color: main, alpha: fillA });
        g.moveTo(hx, hy).arc(hx, hy, stage.range, rot - half, rot + half).lineTo(hx, hy);
        g.stroke({ width: 0.08, color: main, alpha: 0.9 });
        break;
      }
      case 'circle': {
        const pulse = 1 + 0.03 * Math.sin(now / 90);
        g.circle(p.point.x, p.point.y, ind.r * pulse).fill({ color: main, alpha: fillA });
        g.circle(p.point.x, p.point.y, ind.r).stroke({ width: 0.08, color: main, alpha: 0.9 });
        g.moveTo(hx, hy).lineTo(p.point.x, p.point.y).stroke({ width: 0.05, color: main, alpha: 0.4 });
        break;
      }
      case 'self':
        g.circle(hx, hy, ind.r).fill({ color: main, alpha: fillA });
        g.circle(hx, hy, ind.r).stroke({ width: 0.08, color: main, alpha: 0.9 });
        break;
      case 'unit': {
        const t = p.target;
        if (t) {
          const tc = cancel ? 0xff4040 : 0xff6a4a;
          g.moveTo(hx, hy).lineTo(t.pos.x, t.pos.y).stroke({ width: 0.1, color: tc, alpha: 0.8 });
          g.circle(t.pos.x, t.pos.y, t.radius + 0.35).stroke({ width: 0.14, color: tc, alpha: 0.95 });
          const a = now / 300;
          for (let i = 0; i < 4; i++) {
            const aa = a + (i * Math.PI) / 2;
            const r0 = t.radius + 0.5;
            g.moveTo(t.pos.x + Math.cos(aa) * r0, t.pos.y + Math.sin(aa) * r0)
              .lineTo(t.pos.x + Math.cos(aa) * (r0 + 0.35), t.pos.y + Math.sin(aa) * (r0 + 0.35))
              .stroke({ width: 0.12, color: tc });
          }
        } else {
          g.circle(p.point.x, p.point.y, 0.5).stroke({ width: 0.08, color: main, alpha: 0.6 });
        }
        break;
      }
    }
  }
}
