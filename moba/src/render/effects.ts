import { Container, Graphics, Text } from 'pixi.js';
import type { AreaVfx, Shape } from '../data/schema';
import type { Projectile, Zone } from '../sim/entity';

/**
 * 表现层特效：区域闪光 / 预警、位移残影、粒子、弹道、持续区域、伤害飘字。
 * 全部是程序绘制，对象池复用避免频繁分配。
 */

interface Fx {
  g: Graphics;
  born: number;
  life: number;
  update: (g: Graphics, t: number) => void;
}

interface Particle {
  g: Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  life: number;
  size: number;
}

interface Floater {
  t: Text;
  x: number;
  y: number;
  born: number;
  life: number;
  vx: number;
}

/** 在 Graphics 上画出形状（原点在 0,0，朝向 +x） */
export function drawShape(g: Graphics, shape: Shape, scale = 1): Graphics {
  switch (shape.k) {
    case 'circle':
      return g.circle(0, 0, shape.r * scale);
    case 'ring':
      return g.circle(0, 0, shape.r * scale);
    case 'cone': {
      const half = (shape.angle * Math.PI) / 360;
      g.moveTo(0, 0);
      g.arc(0, 0, shape.r * scale, -half, half);
      g.lineTo(0, 0);
      return g;
    }
    case 'rect':
      return g.rect(0, -shape.width / 2, shape.length * scale, shape.width);
  }
}

export class EffectsLayer {
  /** 地面层（在单位下方）：预警、区域 */
  readonly ground = new Container();
  /** 上层（在单位上方）：闪光、粒子、弹道 */
  readonly top = new Container();
  /** 屏幕层：飘字 */
  readonly screen = new Container();

  private fx: Fx[] = [];
  private particles: Particle[] = [];
  private particlePool: Graphics[] = [];
  private floaters: Floater[] = [];
  private textPool: Text[] = [];
  private projViews = new Map<number, Graphics>();
  private zoneViews = new Map<number, Graphics>();

  /** 区域技能生效闪光 */
  area(x: number, y: number, dirX: number, dirY: number, shape: Shape, vfx: AreaVfx | null, now: number): void {
    const color = vfx?.color ?? 0xffffff;
    const style = vfx?.style ?? 'burst';
    const rot = Math.atan2(dirY, dirX);
    const g = new Graphics();
    g.position.set(x, y);
    g.rotation = rot;
    this.top.addChild(g);
    const life = style === 'spin' ? 320 : 260;
    this.fx.push({
      g,
      born: now,
      life,
      update: (gr, t) => {
        gr.clear();
        const a = 1 - t;
        if (style === 'spin') {
          gr.rotation = rot + t * Math.PI * 2.5;
          drawShape(gr, shape, 0.6 + 0.4 * t).fill({ color, alpha: 0.25 * a });
          for (let i = 0; i < 3; i++) {
            const s = (i * Math.PI * 2) / 3;
            const r = shapeR(shape);
            gr.arc(0, 0, r * (0.7 + 0.3 * t), s, s + 1.2).stroke({ width: 0.25, color, alpha: 0.9 * a });
          }
        } else if (style === 'slash') {
          drawShape(gr, shape, 0.85 + 0.15 * t).fill({ color, alpha: 0.35 * a });
          if (shape.k === 'cone') {
            const half = (shape.angle * Math.PI) / 360;
            for (let i = 0; i < 3; i++) {
              const rr = shape.r * (0.55 + i * 0.2);
              gr.arc(0, 0, rr, -half + t * 0.3, half * (0.2 + t * 0.8)).stroke({ width: 0.18, color: 0xffffff, alpha: 0.8 * a });
            }
          }
        } else if (style === 'slam') {
          const r = shapeR(shape);
          gr.circle(0, 0, r * (0.3 + 0.9 * t)).stroke({ width: 0.35 * a + 0.05, color, alpha: a });
          drawShape(gr, shape).fill({ color, alpha: 0.28 * a });
        } else {
          drawShape(gr, shape, 0.7 + 0.3 * t).fill({ color, alpha: 0.35 * a });
        }
      },
    });
    const count = style === 'slam' ? 22 : 12;
    this.burst(x, y, color, count, style === 'slam' ? 7 : 4.5, now);
  }

  /** 延迟区域的地面预警（填充随时间推进） */
  warn(x: number, y: number, dirX: number, dirY: number, shape: Shape, color: number, seconds: number, now: number): void {
    const g = new Graphics();
    g.position.set(x, y);
    g.rotation = Math.atan2(dirY, dirX);
    this.ground.addChild(g);
    this.fx.push({
      g,
      born: now,
      life: seconds * 1000,
      update: (gr, t) => {
        gr.clear();
        drawShape(gr, shape).fill({ color, alpha: 0.12 });
        drawShape(gr, shape).stroke({ width: 0.1, color, alpha: 0.8 });
        drawShape(gr, shape, t).fill({ color, alpha: 0.25 });
      },
    });
  }

  /** 位移残影 */
  afterimage(x: number, y: number, r: number, color: number, now: number): void {
    const g = new Graphics();
    g.position.set(x, y);
    this.ground.addChild(g);
    this.fx.push({
      g,
      born: now,
      life: 260,
      update: (gr, t) => {
        gr.clear();
        gr.circle(0, 0, r * (1 - t * 0.4)).fill({ color, alpha: 0.45 * (1 - t) });
      },
    });
  }

  /** 瞬移：起点与终点的光圈 */
  blink(fromX: number, fromY: number, toX: number, toY: number, now: number): void {
    for (const [x, y] of [
      [fromX, fromY],
      [toX, toY],
    ] as const) {
      const g = new Graphics();
      g.position.set(x, y);
      this.top.addChild(g);
      this.fx.push({
        g,
        born: now,
        life: 300,
        update: (gr, t) => {
          gr.clear();
          gr.circle(0, 0, 0.4 + t * 1.2).stroke({ width: 0.15, color: 0xbfe8ff, alpha: 1 - t });
        },
      });
      this.burst(x, y, 0xbfe8ff, 8, 3, now);
    }
  }

  /** 普攻挥砍弧线（近战） */
  swing(x: number, y: number, facing: number, range: number, color: number, now: number): void {
    const g = new Graphics();
    g.position.set(x, y);
    g.rotation = facing;
    this.top.addChild(g);
    this.fx.push({
      g,
      born: now,
      life: 160,
      update: (gr, t) => {
        gr.clear();
        gr.arc(0, 0, range * 0.85, -0.9 + t * 0.6, 0.2 + t * 0.9).stroke({ width: 0.22, color, alpha: 1 - t });
      },
    });
  }

  /** 命中火花 */
  hit(x: number, y: number, color: number, strong: boolean, now: number): void {
    this.burst(x, y, color, strong ? 10 : 5, strong ? 6 : 4, now);
  }

  burst(x: number, y: number, color: number, count: number, speed: number, now: number): void {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.4 + Math.random() * 0.6);
      const g = this.particlePool.pop() ?? new Graphics();
      const size = 0.08 + Math.random() * 0.12;
      g.clear();
      g.circle(0, 0, 1).fill(color);
      g.scale.set(size);
      g.alpha = 1;
      g.position.set(x, y);
      this.top.addChild(g);
      this.particles.push({ g, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, born: now, life: 250 + Math.random() * 250, size });
    }
  }

  /** 伤害 / 治疗飘字（屏幕坐标由调用方每帧换算，这里存世界坐标） */
  floatText(x: number, y: number, text: string, color: number, size: number, now: number): void {
    const t = this.textPool.pop() ?? new Text({ text: '', style: { fontFamily: 'sans-serif', fontWeight: 'bold', fill: 0xffffff, stroke: { color: 0x000000, width: 3 } } });
    t.text = text;
    t.style.fontSize = size;
    t.style.fill = color;
    t.anchor.set(0.5);
    t.alpha = 1;
    this.screen.addChild(t);
    this.floaters.push({ t, x: x + (Math.random() - 0.5) * 0.6, y, born: now, life: 800, vx: (Math.random() - 0.5) * 0.8 });
  }

  /** 每帧更新；toScreen 用于把飘字的世界坐标换算到屏幕 */
  update(now: number, dtSec: number, toScreen: (x: number, y: number) => { x: number; y: number }): void {
    this.fx = this.fx.filter((f) => {
      const t = (now - f.born) / f.life;
      if (t >= 1) {
        f.g.destroy();
        return false;
      }
      f.update(f.g, Math.max(0, t));
      return true;
    });
    this.particles = this.particles.filter((p) => {
      const t = (now - p.born) / p.life;
      if (t >= 1) {
        p.g.removeFromParent();
        this.particlePool.push(p.g);
        return false;
      }
      p.x += p.vx * dtSec;
      p.y += p.vy * dtSec;
      p.vx *= 0.9;
      p.vy *= 0.9;
      p.g.position.set(p.x, p.y);
      p.g.alpha = 1 - t;
      return true;
    });
    this.floaters = this.floaters.filter((f) => {
      const t = (now - f.born) / f.life;
      if (t >= 1) {
        f.t.removeFromParent();
        this.textPool.push(f.t);
        return false;
      }
      const s = toScreen(f.x + f.vx * t, f.y);
      // 先弹起再缓慢上飘
      const rise = t < 0.15 ? t / 0.15 * 26 : 26 + (t - 0.15) * 30;
      f.t.position.set(s.x, s.y - 30 - rise);
      f.t.scale.set(t < 0.1 ? 1.4 - t * 4 : 1);
      f.t.alpha = t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;
      return true;
    });
  }

  /** 同步弹道视图 */
  syncProjectiles(list: readonly Projectile[], alpha: number): void {
    const alive = new Set<number>();
    for (const p of list) {
      alive.add(p.id);
      let g = this.projViews.get(p.id);
      if (!g) {
        g = new Graphics();
        const c = p.vfx.color;
        const s = p.vfx.size ?? (p.isAttack ? 0.22 : p.width);
        switch (p.vfx.style ?? 'orb') {
          case 'arrow':
            g.poly([s * 2.2, 0, -s * 1.5, -s * 0.5, -s * 1.5, s * 0.5]).fill(c);
            g.moveTo(-s * 3, 0).lineTo(-s * 1.2, 0).stroke({ width: s * 0.35, color: c, alpha: 0.6 });
            break;
          case 'blade':
            g.poly([s * 1.6, 0, 0, -s, -s * 0.8, 0, 0, s]).fill(c);
            break;
          case 'bolt':
            g.rect(-s * 2, -s * 0.3, s * 4, s * 0.6).fill(c);
            break;
          default:
            g.circle(0, 0, s * 1.5).fill({ color: c, alpha: 0.3 });
            g.circle(0, 0, s).fill(c);
            g.circle(0, 0, s * 0.5).fill(0xffffff);
        }
        this.projViews.set(p.id, g);
        this.top.addChild(g);
      }
      g.position.set(p.prevPos.x + (p.pos.x - p.prevPos.x) * alpha, p.prevPos.y + (p.pos.y - p.prevPos.y) * alpha);
      g.rotation = Math.atan2(p.dirY, p.dirX);
    }
    for (const [id, g] of this.projViews) {
      if (!alive.has(id)) {
        g.destroy();
        this.projViews.delete(id);
      }
    }
  }

  /** 同步持续区域视图 */
  syncZones(list: readonly Zone[], now: number): void {
    const alive = new Set<number>();
    for (const z of list) {
      alive.add(z.id);
      let g = this.zoneViews.get(z.id);
      if (!g) {
        g = new Graphics();
        this.zoneViews.set(z.id, g);
        this.ground.addChild(g);
      }
      const color = z.vfx?.color ?? 0xffffff;
      const pulse = 0.18 + 0.06 * Math.sin(now / 120);
      g.clear();
      drawShape(g, z.shape).fill({ color, alpha: pulse });
      drawShape(g, z.shape).stroke({ width: 0.12, color, alpha: 0.75 });
      g.position.set(z.pos.x, z.pos.y);
      g.rotation = Math.atan2(z.dir.y, z.dir.x);
    }
    for (const [id, g] of this.zoneViews) {
      if (!alive.has(id)) {
        g.destroy();
        this.zoneViews.delete(id);
      }
    }
  }
}

function shapeR(shape: Shape): number {
  return shape.k === 'rect' ? shape.length : shape.r;
}
