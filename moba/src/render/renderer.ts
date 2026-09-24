import { Application, Container } from 'pixi.js';
import { lerpAngle } from '../core/vec2';
import { getHero } from '../data/heroes';
import { CC_NAMES, type SkillStage } from '../data/schema';
import { getBuff } from '../data/units';
import type { AimPreview } from '../input/aim';
import type { Unit } from '../sim/entity';
import type { SimEvent } from '../sim/events';
import type { World } from '../sim/world';
import { Camera } from './camera';
import { DebugDraw, type DebugDrawOptions } from './debugDraw';
import { EffectsLayer } from './effects';
import { Indicator } from './indicators';
import { paintMap } from './mapPainter';
import { PALETTE } from './palette';
import { UnitView } from './unitView';

export interface AimRender {
  stage: SkillStage;
  preview: AimPreview;
  cancel: boolean;
}

/**
 * 渲染层总控：只读取逻辑状态与事件，不回写逻辑。
 * 位置按 alpha 在上一帧与当前帧之间插值；顿帧 / 闪白 / 震屏都只在这里实现。
 */
export class GameRenderer {
  readonly app = new Application();
  camera!: Camera;
  private worldLayer = new Container();
  private unitLayer = new Container();
  private overlayLayer = new Container();
  private effects = new EffectsLayer();
  private indicator = new Indicator();
  private debugDraw = new DebugDraw();
  private views = new Map<number, UnitView>();
  private lastNow = 0;
  private dashTrailAt = new Map<number, number>();
  debugOptions: DebugDrawOptions = { colliders: false, paths: false };

  constructor(
    private readonly world: World,
    private readonly selfId: number,
  ) {}

  async init(parent: HTMLElement): Promise<void> {
    await this.app.init({
      resizeTo: parent,
      antialias: true,
      background: 0x0b120b,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      powerPreference: 'high-performance',
    });
    parent.appendChild(this.app.canvas);
    this.camera = new Camera(this.world.map.size);

    const map = paintMap(this.world.map);
    this.worldLayer.addChild(
      map.ground,
      map.bushes,
      this.effects.ground,
      this.indicator.g,
      map.walls,
      this.unitLayer,
      this.effects.top,
      this.debugDraw.g,
    );
    this.app.stage.addChild(this.worldLayer, this.overlayLayer, this.effects.screen);

    const self = this.world.get(this.selfId);
    for (const u of this.world.list) this.ensureView(u);
    this.resize();
    if (self) this.camera.snap(self.pos);
    this.lastNow = performance.now();
  }

  resize(): void {
    this.camera.resize(this.app.screen.width, this.app.screen.height);
  }

  private ensureView(u: Unit): UnitView {
    let v = this.views.get(u.id);
    if (!v) {
      const self = this.world.get(this.selfId);
      v = new UnitView(u, u.id === this.selfId, self?.team ?? 0);
      this.views.set(u.id, v);
      // 建筑在下、英雄在上
      if (u.kind === 'tower' || u.kind === 'crystal') this.unitLayer.addChildAt(v.root, 0);
      else this.unitLayer.addChild(v.root);
      this.overlayLayer.addChild(v.overlay);
      v.rx = u.pos.x;
      v.ry = u.pos.y;
    }
    return v;
  }

  /** 处理逻辑事件 → 打击感反馈 */
  handleEvents(events: readonly SimEvent[]): void {
    const now = performance.now();
    const w = this.world;
    for (const e of events) {
      switch (e.t) {
        case 'damage': {
          const tv = this.views.get(e.target);
          const involvesSelf = e.src === this.selfId || e.target === this.selfId;
          if (tv) {
            tv.flashUntil = now + 110;
            if (e.impact >= 1 || e.crit) this.freeze(tv, now + (e.impact >= 2 ? 90 : 55));
          }
          const sv = this.views.get(e.src);
          if (sv && e.impact >= 1 && e.src === this.selfId) this.freeze(sv, now + (e.impact >= 2 ? 70 : 40));
          if (involvesSelf && (e.impact >= 2 || (e.crit && e.src === this.selfId))) this.camera.shake(e.impact >= 2 ? 0.16 : 0.08);
          const color =
            e.target === this.selfId
              ? PALETTE.dmgTaken
              : e.crit
                ? PALETTE.dmgCrit
                : e.dtype === 'magic'
                  ? PALETTE.dmgMagic
                  : e.dtype === 'true'
                    ? PALETTE.dmgTrue
                    : PALETTE.dmgPhysical;
          const size = e.crit ? 26 : involvesSelf ? (e.impact >= 1 ? 21 : 18) : 14;
          this.effects.floatText(e.x, e.y, `${Math.round(e.amount)}${e.crit ? '!' : ''}`, color, size, now);
          this.effects.hit(e.x, e.y, e.crit ? PALETTE.dmgCrit : 0xffe0b0, e.impact >= 1 || e.crit, now);
          break;
        }
        case 'heal':
          if (e.amount >= 5) this.effects.floatText(e.x, e.y, `+${Math.round(e.amount)}`, PALETTE.heal, 16, now);
          break;
        case 'attackStart': {
          const u = w.get(e.unit);
          if (u && u.kind === 'hero' && !getHero(u.defId).attack.projectile) {
            const def = getHero(u.defId);
            this.effects.swing(u.pos.x, u.pos.y, u.facing, u.stats.range + u.radius, def.palette.secondary, now);
          }
          break;
        }
        case 'area':
          if (e.warn > 0) this.effects.warn(e.x, e.y, e.dirX, e.dirY, e.shape, e.vfx?.color ?? 0xffffff, e.warn, now);
          else this.effects.area(e.x, e.y, e.dirX, e.dirY, e.shape, e.vfx, now);
          break;
        case 'dash':
          this.dashTrailAt.set(e.unit, 0);
          break;
        case 'blink':
          this.effects.blink(e.fromX, e.fromY, e.toX, e.toY, now);
          {
            const v = this.views.get(e.unit);
            if (v) {
              v.rx = e.toX;
              v.ry = e.toY;
            }
          }
          break;
        case 'cc': {
          const u = w.get(e.target);
          if (u && e.cc !== 'slow') this.effects.floatText(u.pos.x, u.pos.y - 0.6, CC_NAMES[e.cc], 0xffe25a, 15, now);
          break;
        }
        case 'levelUp': {
          const u = w.get(e.unit);
          if (u) {
            this.effects.floatText(u.pos.x, u.pos.y - 0.8, '升级！', 0xffd23c, 20, now);
            this.effects.burst(u.pos.x, u.pos.y, 0xffd23c, 16, 4, now);
          }
          break;
        }
        default:
          break;
      }
    }
  }

  private freeze(v: UnitView, until: number): void {
    if (performance.now() >= v.freezeUntil) {
      v.frozenX = v.rx;
      v.frozenY = v.ry;
    }
    v.freezeUntil = Math.max(v.freezeUntil, until);
  }

  render(alpha: number, aim: AimRender | null): void {
    const now = performance.now();
    const dtSec = Math.min(0.1, (now - this.lastNow) / 1000);
    this.lastNow = now;
    const w = this.world;
    const cam = this.camera;

    // 插值后的玩家位置作为镜头目标
    const self = w.get(this.selfId);
    if (self) {
      const sx = self.prevPos.x + (self.pos.x - self.prevPos.x) * alpha;
      const sy = self.prevPos.y + (self.pos.y - self.prevPos.y) * alpha;
      cam.follow({ x: sx, y: sy }, dtSec);
    }
    this.worldLayer.scale.set(cam.zoom);
    this.worldLayer.position.set(
      cam.screenW / 2 - (cam.x + cam.offsetX) * cam.zoom,
      cam.screenH / 2 - (cam.y + cam.offsetY) * cam.zoom,
    );

    // 可见范围（外扩 3 米）用于裁剪
    const hw = cam.screenW / cam.zoom / 2 + 3;
    const hh = cam.screenH / cam.zoom / 2 + 3;
    const view = { x0: cam.x - hw, y0: cam.y - hh, x1: cam.x + hw, y1: cam.y + hh };

    for (const u of w.list) {
      const v = this.ensureView(u);
      const x = u.prevPos.x + (u.pos.x - u.prevPos.x) * alpha;
      const y = u.prevPos.y + (u.pos.y - u.prevPos.y) * alpha;
      const visible = u.alive && x > view.x0 && x < view.x1 && y > view.y0 && y < view.y1;
      v.root.visible = visible;
      // 无敌的建筑（M1 训练场）不显示血条，避免误以为可以攻击
      v.overlay.visible = visible && !u.innate.invulnerable;
      if (!visible) continue;
      v.update(x, y, lerpAngle(u.prevFacing, u.facing, alpha), now);
      for (const b of u.buffs) {
        const aura = getBuff(b.id).aura;
        if (aura !== undefined) {
          v.setAura(aura, now);
          break;
        }
      }
      const s = cam.worldToScreen(v.rx, v.ry);
      v.updateOverlay(s.x, s.y, cam.zoom);

      // 冲刺残影
      if (u.forced && u.forced.kind === 'dash') {
        const last = this.dashTrailAt.get(u.id) ?? 0;
        if (now - last > 30) {
          this.dashTrailAt.set(u.id, now);
          const color = u.kind === 'hero' ? getHero(u.defId).palette.primary : 0xffffff;
          this.effects.afterimage(v.rx, v.ry, u.radius, color, now);
        }
      }
    }

    this.effects.syncProjectiles(w.projectiles, alpha);
    this.effects.syncZones(w.zones, now);
    this.effects.update(now, dtSec, (x, y) => cam.worldToScreen(x, y));

    if (aim && self) {
      const v = this.views.get(self.id)!;
      this.indicator.draw(v.rx, v.ry, aim.stage, aim.preview, aim.cancel, now);
    } else this.indicator.clear();

    if (this.debugOptions.colliders || this.debugOptions.paths) this.debugDraw.draw(w, this.debugOptions, view);
    else this.debugDraw.g.clear();
  }

  destroy(): void {
    for (const v of this.views.values()) v.destroy();
    this.views.clear();
    this.app.destroy(true, { children: true });
  }
}
