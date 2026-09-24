import { Application, Container, Graphics, Sprite, type Texture } from 'pixi.js';
import { getHero } from '../data/heroes';
import { heroModel, type Model } from './models';
import { createGlowTexture } from './textures';

/**
 * 选英雄界面的英雄展示：独立的小 Pixi 画布，站在发光底座上待机，
 * 每隔几秒演示一次普攻 / 施法动作，脚下有上升的光点。
 */
export class HeroPreview {
  private readonly app = new Application();
  private readonly stageRoot = new Container();
  private readonly pedestal = new Graphics();
  private readonly holder = new Container();
  private readonly sparks: { s: Sprite; life: number; vx: number; vy: number }[] = [];
  private glow!: Texture;
  private model: Model | null = null;
  private color = 0xffffff;
  private t0 = 0;
  private ready = false;
  private destroyed = false;

  async init(parent: HTMLElement): Promise<void> {
    await this.app.init({
      resizeTo: parent,
      antialias: true,
      backgroundAlpha: 0,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    });
    if (this.destroyed) {
      this.app.destroy(true, { children: true });
      return;
    }
    parent.appendChild(this.app.canvas);
    this.glow = createGlowTexture();
    this.stageRoot.addChild(this.pedestal, this.holder);
    this.app.stage.addChild(this.stageRoot);
    this.app.ticker.add((tk) => this.tick(tk.deltaMS / 1000));
    this.ready = true;
  }

  setHero(id: string): void {
    if (!this.ready) return;
    const def = getHero(id);
    this.model?.root.destroy({ children: true });
    this.model = heroModel(def, this.glow);
    this.holder.addChild(this.model.root);
    this.color = def.palette.secondary;
    this.t0 = performance.now();
    // 换英雄时来一次施法动作
    this.demoCast = 0;
  }

  private demoCast = -1;

  private tick(dt: number): void {
    const m = this.model;
    if (!m) return;
    const W = this.app.screen.width;
    const H = this.app.screen.height;
    const now = performance.now();
    // 模型约占画布高度的 58%
    const scale = (H * 0.58) / m.height;
    const cx = W / 2;
    const cy = H * 0.84;
    this.holder.position.set(cx, cy);
    this.holder.scale.set(scale);

    // 发光底座：外圈缓慢旋转的虚线
    const p = this.pedestal;
    p.clear();
    const rx = scale * 1.1;
    const ry = rx * 0.32;
    p.ellipse(cx, cy, rx * 1.25, ry * 1.25).fill({ color: this.color, alpha: 0.12 });
    p.ellipse(cx, cy, rx, ry).fill({ color: 0x000000, alpha: 0.35 });
    p.ellipse(cx, cy, rx, ry).stroke({ width: 2, color: this.color, alpha: 0.9 });
    const rot = now / 2400;
    for (let i = 0; i < 16; i++) {
      const a0 = rot + (i / 16) * Math.PI * 2;
      const a1 = a0 + 0.22;
      p.moveTo(cx + Math.cos(a0) * rx * 1.18, cy + Math.sin(a0) * ry * 1.18)
        .lineTo(cx + Math.cos(a1) * rx * 1.18, cy + Math.sin(a1) * ry * 1.18)
        .stroke({ width: 2, color: this.color, alpha: 0.6 });
    }

    // 上升光点
    if (Math.random() < dt * 14) {
      const s = new Sprite(this.glow);
      s.anchor.set(0.5);
      s.tint = this.color;
      s.blendMode = 'add';
      const a = Math.random() * Math.PI * 2;
      s.position.set(cx + Math.cos(a) * rx * 0.9, cy + Math.sin(a) * ry * 0.9);
      s.scale.set(0.05 + Math.random() * 0.06);
      this.stageRoot.addChild(s);
      this.sparks.push({ s, life: 1.4 + Math.random(), vx: (Math.random() - 0.5) * 10, vy: -40 - Math.random() * 50 });
    }
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const k = this.sparks[i]!;
      k.life -= dt;
      k.s.x += k.vx * dt;
      k.s.y += k.vy * dt;
      k.s.alpha = Math.min(1, k.life);
      if (k.life <= 0) {
        k.s.destroy();
        this.sparks.splice(i, 1);
      }
    }

    // 演示动作：进入后先施法，之后每 3.4 秒轮流普攻 / 施法
    const t = (now - this.t0) / 1000;
    const cycle = t % 3.4;
    const n = Math.floor(t / 3.4);
    let attackT: number | null = null;
    let castT: number | null = null;
    if (this.demoCast === 0 && t < 0.8) castT = t / 0.8;
    else if (cycle > 2.6) {
      const k = (cycle - 2.6) / 0.8;
      if (n % 2 === 0) attackT = k;
      else castT = k;
    }
    m.update({ facing: 0.35, speed: 0, attackT, castT, dashing: false, stunned: false, now, dt });
  }

  destroy(): void {
    this.destroyed = true;
    if (!this.ready) return;
    this.ready = false;
    this.app.destroy(true, { children: true });
  }
}
