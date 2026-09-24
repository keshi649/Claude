import { Container, Graphics, Sprite, Text, type Texture } from 'pixi.js';
import type { AreaVfx, Shape } from '../data/schema';
import type { Projectile, Zone } from '../sim/entity';
import { TILT } from './camera';

/**
 * 表现层特效（2.5D）：
 *   ground：地面层（米坐标、随镜头压扁）—— 技能范围闪光、预警、持续区域、刀光
 *   air：空中层（与物体层同样的平移）—— 粒子、弹道、光柱，按世界坐标 + 高度摆放
 *   screen：屏幕层 —— 伤害飘字
 */

interface GroundFx {
  g: Graphics;
  born: number;
  life: number;
  update: (g: Graphics, t: number) => void;
}

interface AirItem {
  obj: Container;
  x: number;
  y: number;
  h: number;
  vx: number;
  vy: number;
  vh: number;
  gravity: number;
  born: number;
  life: number;
  size: number;
  /** 水平面上的物体（刀光）按斜视角压扁 */
  flat: boolean;
  fade: boolean;
  grow: number;
  update?: (obj: Container, t: number) => void;
}

interface Floater {
  t: Text;
  x: number;
  y: number;
  born: number;
  life: number;
  vx: number;
  big: boolean;
}

/** 在 Graphics 上画出形状（原点 0,0，朝向 +x） */
export function drawShape(g: Graphics, shape: Shape, scale = 1): Graphics {
  switch (shape.k) {
    case 'circle':
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

const shapeR = (s: Shape): number => (s.k === 'rect' ? s.length : s.r);

export class EffectsLayer {
  readonly ground = new Container();
  readonly air = new Container();
  readonly screen = new Container();
  private groundFx: GroundFx[] = [];
  private airItems: AirItem[] = [];
  private spritePool: Sprite[] = [];
  private floaters: Floater[] = [];
  private textPool: Text[] = [];
  private projViews = new Map<number, Container>();
  private zoneViews = new Map<number, Graphics>();
  zoom = 40;

  constructor(private readonly tex: { glow: Texture; dot: Texture }) {}

  private addGround(x: number, y: number, rot: number, life: number, now: number, update: (g: Graphics, t: number) => void, below = false): void {
    const g = new Graphics();
    g.position.set(x, y);
    g.rotation = rot;
    if (below) this.ground.addChildAt(g, 0);
    else this.ground.addChild(g);
    this.groundFx.push({ g, born: now, life, update });
  }

  private sprite(color: number, add = true): Sprite {
    const s = this.spritePool.pop() ?? new Sprite(this.tex.dot);
    s.texture = this.tex.dot;
    s.anchor.set(0.5);
    s.tint = color;
    s.alpha = 1;
    s.blendMode = add ? 'add' : 'normal';
    s.rotation = 0;
    s.scale.set(1);
    return s;
  }

  private addAir(item: Omit<AirItem, 'born'>, now: number): void {
    this.air.addChild(item.obj);
    this.airItems.push({ ...item, born: now });
  }

  // ————————————————————————— 技能 / 命中 —————————————————————————

  /** 区域技能生效 */
  area(x: number, y: number, dirX: number, dirY: number, shape: Shape, vfx: AreaVfx | null, now: number): void {
    const color = vfx?.color ?? 0xffffff;
    const style = vfx?.style ?? 'burst';
    const rot = Math.atan2(dirY, dirX);
    const R = shapeR(shape);
    if (style === 'slash') {
      // 扇形刀光：亮色月牙 + 白色刃线扫过
      this.addGround(x, y, rot, 300, now, (g, t) => {
        g.clear();
        const a = 1 - t;
        drawShape(g, shape, 0.9 + 0.1 * t).fill({ color, alpha: 0.28 * a });
        if (shape.k === 'cone') {
          const half = (shape.angle * Math.PI) / 360;
          const sweep = Math.min(1, t * 3);
          const a0 = -half;
          const a1 = -half + sweep * half * 2;
          for (let i = 0; i < 4; i++) {
            const rr = shape.r * (0.45 + i * 0.17);
            g.arc(0, 0, rr, a0, a1).stroke({ width: 0.25 - i * 0.03, color: i === 3 ? 0xffffff : color, alpha: a });
          }
        }
      });
      for (let i = 0; i < 14; i++) {
        const aa = rot + (Math.random() - 0.5) * ((shape.k === 'cone' ? shape.angle : 90) * Math.PI) / 180;
        const d = R * (0.5 + Math.random() * 0.5);
        this.spark(x + Math.cos(aa) * d, y + Math.sin(aa) * d, 0.9, color, now, 3);
      }
    } else if (style === 'slam') {
      this.addGround(x, y, 0, 420, now, (g, t) => {
        g.clear();
        const a = 1 - t;
        g.circle(0, 0, R * (0.2 + t)).stroke({ width: 0.5 * a + 0.05, color, alpha: a });
        g.circle(0, 0, R * (0.1 + t * 0.7)).stroke({ width: 0.2 * a, color: 0xffffff, alpha: a * 0.8 });
        drawShape(g, shape).fill({ color, alpha: 0.3 * a });
        // 地裂
        for (let i = 0; i < 8; i++) {
          const aa = (i / 8) * Math.PI * 2 + 0.3;
          g.moveTo(Math.cos(aa) * 0.4, Math.sin(aa) * 0.4)
            .lineTo(Math.cos(aa + 0.15) * R * 0.6, Math.sin(aa + 0.15) * R * 0.6)
            .lineTo(Math.cos(aa - 0.05) * R * 0.95, Math.sin(aa - 0.05) * R * 0.95)
            .stroke({ width: 0.09, color: 0x2a1a10, alpha: a * 0.8 });
        }
      });
      this.burst(x, y, color, 26, 7, now, 0.4);
      this.dust(x, y, R, now);
      this.pillar(x, y, color, 1.2, 250, now);
    } else if (style === 'spin') {
      this.addGround(x, y, rot, 360, now, (g, t) => {
        g.clear();
        const a = 1 - t;
        g.rotation = rot + t * Math.PI * 3;
        drawShape(g, shape, 0.7 + 0.3 * t).fill({ color, alpha: 0.22 * a });
        for (let i = 0; i < 3; i++) {
          const s = (i * Math.PI * 2) / 3;
          g.arc(0, 0, R * (0.75 + 0.25 * t), s, s + 1.4).stroke({ width: 0.3, color: i === 0 ? 0xffffff : color, alpha: a });
          g.arc(0, 0, R * (0.5 + 0.2 * t), s + 0.5, s + 1.5).stroke({ width: 0.15, color, alpha: a * 0.8 });
        }
      });
      this.burst(x, y, color, 16, 5.5, now, 0.8);
    } else {
      this.addGround(x, y, rot, 300, now, (g, t) => {
        g.clear();
        drawShape(g, shape, 0.7 + 0.3 * t).fill({ color, alpha: 0.35 * (1 - t) });
        drawShape(g, shape, 0.7 + 0.3 * t).stroke({ width: 0.1, color: 0xffffff, alpha: 0.6 * (1 - t) });
      });
      this.burst(x, y, color, 14, 4.5, now, 0.6);
    }
  }

  /** 延迟区域的地面预警（外框 + 填充随时间推进） */
  warn(x: number, y: number, dirX: number, dirY: number, shape: Shape, color: number, seconds: number, now: number): void {
    this.addGround(x, y, Math.atan2(dirY, dirX), seconds * 1000, now, (g, t) => {
      g.clear();
      drawShape(g, shape).fill({ color, alpha: 0.12 });
      drawShape(g, shape).stroke({ width: 0.1, color, alpha: 0.85 });
      drawShape(g, shape, t).fill({ color, alpha: 0.28 });
    }, true);
  }

  /** 普攻刀光（近战）：水平面上的弧形拖尾 */
  swing(x: number, y: number, facing: number, range: number, color: number, now: number): void {
    const g = new Graphics();
    this.addAir(
      {
        obj: g,
        x,
        y,
        h: 1.0,
        vx: 0,
        vy: 0,
        vh: 0,
        gravity: 0,
        life: 180,
        size: 1,
        flat: true,
        fade: false,
        grow: 0,
        update: (o, t) => {
          const gg = o as Graphics;
          gg.clear();
          const a = 1 - t;
          const s0 = facing - 1.1 + t * 0.4;
          const s1 = facing - 0.2 + t * 1.3;
          gg.arc(0, 0, range * 0.9, s0, s1).stroke({ width: 0.34 * a + 0.05, color, alpha: a * 0.9 });
          gg.arc(0, 0, range * 0.9, s0 + 0.2, s1).stroke({ width: 0.12, color: 0xffffff, alpha: a });
        },
      },
      now,
    );
  }

  /** 命中火花 */
  hit(x: number, y: number, color: number, strong: boolean, now: number): void {
    this.burst(x, y, color, strong ? 12 : 6, strong ? 6 : 4, now, 1.0);
    this.spark(x, y, 1.0, 0xffffff, now, strong ? 5 : 3.2);
  }

  /** 一个亮点（瞬间放大后消失） */
  spark(x: number, y: number, h: number, color: number, now: number, size = 3): void {
    const s = this.sprite(color);
    this.addAir({ obj: s, x, y, h, vx: 0, vy: 0, vh: 0, gravity: 0, life: 160, size: size * 0.12, flat: false, fade: true, grow: 1.5 }, now);
  }

  /** 粒子迸发 */
  burst(x: number, y: number, color: number, count: number, speed: number, now: number, h = 0.8): void {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = speed * (0.35 + Math.random() * 0.65);
      const s = this.sprite(color);
      this.addAir(
        {
          obj: s,
          x,
          y,
          h,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          vh: 1.5 + Math.random() * 3,
          gravity: 9,
          life: 300 + Math.random() * 300,
          size: 0.1 + Math.random() * 0.14,
          flat: false,
          fade: true,
          grow: -0.4,
        },
        now,
      );
    }
  }

  /** 尘土（非发光） */
  dust(x: number, y: number, r: number, now: number): void {
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = this.sprite(0x9a8a70, false);
      s.alpha = 0.6;
      this.addAir(
        {
          obj: s,
          x: x + Math.cos(a) * r * 0.6,
          y: y + Math.sin(a) * r * 0.6,
          h: 0.2,
          vx: Math.cos(a) * 2,
          vy: Math.sin(a) * 2,
          vh: 0.8,
          gravity: 0,
          life: 600,
          size: 0.35 + Math.random() * 0.3,
          flat: false,
          fade: true,
          grow: 1.2,
        },
        now,
      );
    }
  }

  /** 光柱（升级、回城完成、重击） */
  pillar(x: number, y: number, color: number, width: number, life: number, now: number): void {
    const s = new Sprite(this.tex.glow);
    s.anchor.set(0.5, 1);
    s.tint = color;
    s.blendMode = 'add';
    this.addAir(
      {
        obj: s,
        x,
        y,
        h: 0,
        vx: 0,
        vy: 0,
        vh: 0,
        gravity: 0,
        life,
        size: 1,
        flat: false,
        fade: true,
        grow: 0,
        update: (o, t) => {
          const sp = o as Sprite;
          sp.width = width * (1 - t * 0.5);
          sp.height = 4 * (0.6 + t * 0.6);
        },
      },
      now,
    );
  }

  /** 冲刺残影 */
  afterimage(x: number, y: number, r: number, color: number, now: number): void {
    const s = this.sprite(color);
    s.texture = this.tex.glow;
    this.addAir({ obj: s, x, y, h: 0.9, vx: 0, vy: 0, vh: 0, gravity: 0, life: 260, size: r * 2.2, flat: false, fade: true, grow: -0.3 }, now);
  }

  /** 瞬移：起点与终点的光圈 */
  blink(fromX: number, fromY: number, toX: number, toY: number, now: number): void {
    for (const [x, y] of [
      [fromX, fromY],
      [toX, toY],
    ] as const) {
      this.addGround(x, y, 0, 320, now, (g, t) => {
        g.clear();
        g.circle(0, 0, 0.4 + t * 1.4).stroke({ width: 0.15, color: 0xbfe8ff, alpha: 1 - t });
      });
      this.burst(x, y, 0xbfe8ff, 10, 3, now, 0.9);
      this.pillar(x, y, 0xbfe8ff, 1.3, 260, now);
    }
  }

  levelUp(x: number, y: number, now: number): void {
    this.addGround(x, y, 0, 700, now, (g, t) => {
      g.clear();
      g.circle(0, 0, 0.8 + t * 1.6).stroke({ width: 0.14, color: 0xffd23c, alpha: 1 - t });
    });
    this.pillar(x, y, 0xffd23c, 1.6, 650, now);
    this.burst(x, y, 0xffd23c, 18, 3, now, 1.2);
  }

  /** 信号标记（地面）：三圈扩散的圆环 + 进攻交叉剑 / 撤退箭头 / 集合旗帜 */
  signal(x: number, y: number, kind: 'attack' | 'retreat' | 'gather', color: number, now: number): void {
    this.addGround(x, y, 0, 3000, now, (g, t) => {
      g.clear();
      for (let i = 0; i < 3; i++) {
        const k = (t * 3 + i / 3) % 1;
        g.circle(0, 0, 0.6 + k * 2.6).stroke({ width: 0.12, color, alpha: (1 - k) * (1 - t * 0.6) });
      }
      const a = 1 - Math.max(0, t - 0.7) / 0.3;
      if (kind === 'attack') {
        g.moveTo(-0.6, -0.6).lineTo(0.6, 0.6).stroke({ width: 0.2, color, alpha: a });
        g.moveTo(0.6, -0.6).lineTo(-0.6, 0.6).stroke({ width: 0.2, color, alpha: a });
      } else if (kind === 'retreat') {
        g.poly([-0.7, 0, 0, -0.6, 0, -0.25, 0.7, -0.25, 0.7, 0.25, 0, 0.25, 0, 0.6]).fill({ color, alpha: a });
      } else {
        g.rect(-0.05, -0.8, 0.1, 1.2).fill({ color: 0xffffff, alpha: a });
        g.poly([0.05, -0.8, 0.75, -0.55, 0.05, -0.3]).fill({ color, alpha: a });
      }
    });
  }

  /** 建筑的无兵保护护盾：被英雄打时闪一下半透明的蓝色护罩 */
  shieldFlash(x: number, y: number, now: number): void {
    this.addGround(x, y, 0, 380, now, (g, t) => {
      g.clear();
      g.circle(0, 0, 2.1 + t * 0.4).fill({ color: 0x7fd4ff, alpha: 0.22 * (1 - t) });
      g.circle(0, 0, 2.1 + t * 0.4).stroke({ width: 0.14, color: 0xbfe8ff, alpha: 0.8 * (1 - t) });
    });
  }

  /**
   * 建筑爆炸（推塔 / 水晶被毁）：闪光、地面冲击波、碎石飞溅、火星、升腾的烟尘。
   * scale：塔 1，水晶约 1.8
   */
  explosion(x: number, y: number, color: number, scale: number, now: number): void {
    // 中心闪光：快速放大后消散
    const flash = new Sprite(this.tex.glow);
    flash.anchor.set(0.5);
    flash.tint = 0xfff2d0;
    flash.blendMode = 'add';
    this.addAir({ obj: flash, x, y, h: 2.2 * scale, vx: 0, vy: 0, vh: 0, gravity: 0, life: 520, size: 3 * scale, flat: false, fade: true, grow: 2.2 }, now);
    const flash2 = this.sprite(color);
    flash2.texture = this.tex.glow;
    this.addAir({ obj: flash2, x, y, h: 1.5 * scale, vx: 0, vy: 0, vh: 0, gravity: 0, life: 900, size: 5 * scale, flat: false, fade: true, grow: 1.4 }, now);
    // 地面冲击波（两圈）+ 焦痕
    for (const [delay, col] of [
      [0, 0xffe0a0],
      [0.18, color],
    ] as const) {
      this.addGround(x, y, 0, 900, now, (g, t) => {
        g.clear();
        const k = Math.max(0, (t - delay) / (1 - delay));
        if (k <= 0) return;
        const r = (1 + k * 7) * scale;
        g.circle(0, 0, r).stroke({ width: 0.5 * scale * (1 - k) + 0.05, color: col, alpha: (1 - k) * 0.9 });
      });
    }
    this.addGround(x, y, 0, 4000, now, (g, t) => {
      g.clear();
      g.circle(0, 0, 3.2 * scale).fill({ color: 0x14100c, alpha: 0.55 * (1 - t) });
    }, true);
    // 碎石：带重力、边飞边转
    for (let i = 0; i < 18; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (3 + Math.random() * 5) * scale;
      const chunk = new Graphics();
      const sz = (0.12 + Math.random() * 0.22) * scale;
      chunk.poly([-sz, -sz * 0.6, sz * 0.8, -sz, sz, sz * 0.5, -sz * 0.4, sz]).fill(i % 3 === 0 ? color : i % 2 ? 0x6a6f78 : 0x4a4e56);
      const spin = (Math.random() - 0.5) * 16;
      this.addAir(
        {
          obj: chunk,
          x,
          y,
          h: (1 + Math.random() * 2.5) * scale,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          vh: 4 + Math.random() * 6,
          gravity: 18,
          life: 900 + Math.random() * 500,
          size: 1,
          flat: false,
          fade: false,
          grow: 0,
          update: (o, t) => {
            o.rotation = spin * t;
            o.alpha = t > 0.75 ? (1 - t) / 0.25 : 1;
          },
        },
        now,
      );
    }
    // 火星
    this.burst(x, y, 0xffa040, Math.round(26 * scale), 9 * scale, now, 1.6 * scale);
    this.burst(x, y, color, Math.round(14 * scale), 6 * scale, now, 2.4 * scale);
    // 烟尘：非发光、缓慢上升变大
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = this.sprite(i % 2 ? 0x3a3530 : 0x5a5248, false);
      s.texture = this.tex.glow;
      this.addAir(
        {
          obj: s,
          x: x + Math.cos(a) * 1.2 * scale,
          y: y + Math.sin(a) * 1.2 * scale,
          h: (0.5 + Math.random() * 2) * scale,
          vx: Math.cos(a) * 1.5,
          vy: Math.sin(a) * 1.5,
          vh: 1.2 + Math.random() * 1.2,
          gravity: 0,
          life: 1600 + Math.random() * 900,
          size: (1.6 + Math.random() * 1.4) * scale,
          flat: false,
          fade: true,
          grow: 1.5,
        },
        now,
      );
    }
    this.pillar(x, y, color, 3.4 * scale, 1100, now);
  }

  /** 伤害 / 治疗飘字（世界坐标，屏幕层显示） */
  floatText(x: number, y: number, text: string, color: number, size: number, now: number, big = false): void {
    const t =
      this.textPool.pop() ??
      new Text({ text: '', style: { fontFamily: 'Impact, "Arial Black", sans-serif', fontWeight: 'bold', fill: 0xffffff, stroke: { color: 0x1a0a00, width: 4 } } });
    t.text = text;
    t.style.fontSize = size;
    t.style.fill = color;
    t.anchor.set(0.5);
    t.alpha = 1;
    this.screen.addChild(t);
    this.floaters.push({ t, x: x + (Math.random() - 0.5) * 0.7, y, born: now, life: big ? 950 : 750, vx: (Math.random() - 0.5) * 0.8, big });
  }

  // ————————————————————————— 每帧 —————————————————————————

  update(now: number, dtSec: number, toScreen: (x: number, y: number, h: number) => { x: number; y: number }): void {
    this.groundFx = this.groundFx.filter((f) => {
      const t = (now - f.born) / f.life;
      if (t >= 1) {
        f.g.destroy();
        return false;
      }
      f.update(f.g, Math.max(0, t));
      return true;
    });
    const z = this.zoom;
    this.airItems = this.airItems.filter((p) => {
      const t = (now - p.born) / p.life;
      if (t >= 1) {
        p.obj.removeFromParent();
        if (p.obj instanceof Sprite && p.obj.texture === this.tex.dot) this.spritePool.push(p.obj);
        else if (p.obj instanceof Sprite && !p.update) this.spritePool.push(p.obj);
        else p.obj.destroy();
        return false;
      }
      p.x += p.vx * dtSec;
      p.y += p.vy * dtSec;
      p.vh -= p.gravity * dtSec;
      p.h = Math.max(0, p.h + p.vh * dtSec);
      p.vx *= Math.exp(-dtSec * 3);
      p.vy *= Math.exp(-dtSec * 3);
      p.obj.position.set(p.x * z, (p.y * TILT - p.h) * z);
      p.obj.zIndex = p.y;
      if (p.update) {
        p.obj.scale.set(z, p.flat ? z * TILT : z);
        p.update(p.obj, t);
        if (p.fade) p.obj.alpha = 1 - t;
      } else {
        const s = p.size * (1 + p.grow * t) * z;
        const sp = p.obj as Sprite;
        sp.width = s;
        sp.height = s;
        if (p.fade) sp.alpha = (1 - t) * (sp.blendMode === 'add' ? 1 : 0.6);
      }
      return true;
    });
    this.floaters = this.floaters.filter((f) => {
      const t = (now - f.born) / f.life;
      if (t >= 1) {
        f.t.removeFromParent();
        this.textPool.push(f.t);
        return false;
      }
      const s = toScreen(f.x + f.vx * t, f.y, 2.2);
      const rise = t < 0.15 ? (t / 0.15) * 24 : 24 + (t - 0.15) * 34;
      f.t.position.set(s.x, s.y - rise);
      const pop = f.big ? 1.8 : 1.35;
      f.t.scale.set(t < 0.12 ? pop - (t / 0.12) * (pop - 1) : 1);
      f.t.alpha = t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;
      return true;
    });
  }

  /** 同步弹道视图（空中层） */
  syncProjectiles(list: readonly Projectile[], alpha: number): void {
    const z = this.zoom;
    const alive = new Set<number>();
    for (const p of list) {
      alive.add(p.id);
      let c = this.projViews.get(p.id);
      if (!c) {
        c = new Container();
        const col = p.vfx.color;
        const s = p.vfx.size ?? (p.isAttack ? 0.2 : p.width);
        const glow = new Sprite(this.tex.glow);
        glow.anchor.set(0.5);
        glow.width = glow.height = s * 6;
        glow.tint = col;
        glow.blendMode = 'add';
        const g = new Graphics();
        switch (p.vfx.style ?? 'orb') {
          case 'arrow':
            g.poly([s * 2.4, 0, -s * 1.4, -s * 0.5, -s * 1.4, s * 0.5]).fill(col);
            g.moveTo(-s * 4, 0).lineTo(-s * 1.2, 0).stroke({ width: s * 0.4, color: col, alpha: 0.6 });
            break;
          case 'blade':
            g.poly([s * 1.8, 0, 0, -s, -s * 0.9, 0, 0, s]).fill(col);
            g.poly([s * 1.8, 0, 0, -s * 0.4, -s * 0.4, 0]).fill({ color: 0xffffff, alpha: 0.6 });
            break;
          case 'bolt':
            g.roundRect(-s * 2.5, -s * 0.35, s * 5, s * 0.7, s * 0.3).fill(col);
            g.roundRect(-s * 1.5, -s * 0.15, s * 3.5, s * 0.3, s * 0.15).fill(0xffffff);
            break;
          default:
            g.circle(0, 0, s).fill(col);
            g.circle(-s * 0.25, -s * 0.25, s * 0.45).fill({ color: 0xffffff, alpha: 0.8 });
        }
        c.addChild(glow, g);
        this.projViews.set(p.id, c);
        this.air.addChild(c);
      }
      const x = p.prevPos.x + (p.pos.x - p.prevPos.x) * alpha;
      const y = p.prevPos.y + (p.pos.y - p.prevPos.y) * alpha;
      const h = p.isAttack ? 1.1 : 0.9;
      c.position.set(x * z, (y * TILT - h) * z);
      c.scale.set(z);
      c.zIndex = y;
      c.rotation = Math.atan2(p.dirY * TILT, p.dirX);
    }
    for (const [id, c] of this.projViews) {
      if (!alive.has(id)) {
        c.destroy({ children: true });
        this.projViews.delete(id);
      }
    }
  }

  /** 同步持续区域（地面层） */
  syncZones(list: readonly Zone[], now: number): void {
    const alive = new Set<number>();
    for (const zn of list) {
      alive.add(zn.id);
      let g = this.zoneViews.get(zn.id);
      if (!g) {
        g = new Graphics();
        this.zoneViews.set(zn.id, g);
        this.ground.addChildAt(g, 0);
      }
      const color = zn.vfx?.color ?? 0xffffff;
      const pulse = 0.18 + 0.07 * Math.sin(now / 120);
      g.clear();
      drawShape(g, zn.shape).fill({ color, alpha: pulse });
      drawShape(g, zn.shape).stroke({ width: 0.14, color, alpha: 0.85 });
      drawShape(g, zn.shape, 0.6 + 0.4 * ((now / 700) % 1)).stroke({ width: 0.06, color: 0xffffff, alpha: 0.4 });
      g.position.set(zn.pos.x, zn.pos.y);
      g.rotation = Math.atan2(zn.dir.y, zn.dir.x);
    }
    for (const [id, g] of this.zoneViews) {
      if (!alive.has(id)) {
        g.destroy();
        this.zoneViews.delete(id);
      }
    }
  }
}
