import { Application, Container, Graphics, Sprite, Text, Texture, type TilingSprite } from 'pixi.js';
import { SIGHT, sightOf, visibleTo } from '../sim/vision';
import type { Team } from '../sim/entity';
import { lerpAngle } from '../core/vec2';
import { getHero } from '../data/heroes';
import { getItem } from '../data/items';
import { CC_NAMES, type SkillStage } from '../data/schema';
import { getBuff } from '../data/units';
import type { AimPreview } from '../input/aim';
import type { Unit } from '../sim/entity';
import type { SimEvent } from '../sim/events';
import { isStructure } from '../sim/status';
import type { World } from '../sim/world';
import { Camera, TILT } from './camera';
import { DebugDraw, type DebugDrawOptions } from './debugDraw';
import { EffectsLayer } from './effects';
import { Indicator } from './indicators';
import { paintMap, type Prop } from './mapPainter';
import { PALETTE, teamColor } from './palette';
import { createTextures, type GameTextures } from './textures';
import { UnitView } from './unitView';

/** 小兵 / 野怪死亡动画时长、英雄倒地动画时长（毫秒） */
const DEATH_MS = 650;
const HERO_DEATH_MS = 1100;

export interface AimRender {
  stage: SkillStage;
  preview: AimPreview;
  cancel: boolean;
}

interface PropSprite {
  s: Sprite;
  p: Prop;
}

/**
 * 渲染总控（2.5D 斜视角）：
 *   groundRoot  地面层：按 (zoom, zoom × TILT) 缩放，内容用世界米坐标绘制
 *   objectRoot  物体层：只平移；树、单位、建筑按纵深（世界 y）排序，前面的挡住后面的
 *   air         空中层：粒子、弹道、光柱
 *   overlay     屏幕层：血条、塔的攻击连线、飘字
 * 只读取逻辑状态与事件；顿帧 / 闪白 / 震屏都只在表现层实现。
 */
export class GameRenderer {
  readonly app = new Application();
  camera!: Camera;
  private tex!: GameTextures;
  private groundRoot = new Container();
  private objectRoot = new Container();
  private overlayLayer = new Container();
  /** 战争迷雾：低分辨率画布（每格 0.5 米），作为贴图铺在地面层之上 */
  private fogRoot = new Container();
  private fogCanvas: HTMLCanvasElement | null = null;
  private fogTex: Texture | null = null;
  private fogAt = 0;
  private lines = new Graphics();
  private rings = new Graphics();
  private effects!: EffectsLayer;
  private indicator = new Indicator();
  private debugDraw = new DebugDraw();
  private views = new Map<number, UnitView>();
  private props: PropSprite[] = [];
  private water: TilingSprite | null = null;
  private lastNow = 0;
  private lastZoom = 0;
  private dashTrailAt = new Map<number, number>();
  debugOptions: DebugDrawOptions = { colliders: false, paths: false };
  /** 调试：显示 AI 当前决策（返回某单位的决策文字） */
  aiInfo: ((id: number) => string | null) | null = null;
  /** 镜头焦点覆盖（结束时对准被摧毁的水晶），null 表示跟随自己的英雄 */
  focus: { x: number; y: number } | null = null;
  /** 自己正被敌方防御塔锁定（界面据此显示红色警示） */
  selfLocked = false;
  private protectHintAt = new Map<number, number>();
  private aiLabels = new Map<number, Text>();

  constructor(
    private readonly world: World,
    private readonly selfId: number,
  ) {}

  async init(parent: HTMLElement): Promise<void> {
    await this.app.init({
      resizeTo: parent,
      antialias: true,
      background: 0x16230f,
      // 手机上限 1.5 倍分辨率，节省 GPU 填充率；电脑上限 2 倍
      resolution: Math.min(window.devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches ? 1.5 : 2),
      autoDensity: true,
      powerPreference: 'high-performance',
    });
    parent.appendChild(this.app.canvas);
    this.camera = new Camera(this.world.map.size);
    this.tex = createTextures();
    this.effects = new EffectsLayer(this.tex);

    const map = paintMap(this.world.map, this.tex);
    this.water = map.water;
    this.groundRoot.addChild(map.ground, this.rings, this.effects.ground, this.indicator.g, this.debugDraw.g);
    this.objectRoot.sortableChildren = true;
    this.effects.air.sortableChildren = true;
    for (const p of map.props) {
      const s = new Sprite(p.tex);
      s.anchor.set(0.5, p.anchorY);
      s.zIndex = p.y;
      this.objectRoot.addChild(s);
      this.props.push({ s, p });
    }
    if (this.world.config.mode === 'match') {
      const S = this.world.map.size;
      this.fogCanvas = document.createElement('canvas');
      this.fogCanvas.width = this.fogCanvas.height = S * 2;
      this.fogTex = Texture.from(this.fogCanvas);
      const fs = new Sprite(this.fogTex);
      fs.scale.set(0.5);
      this.fogRoot.addChild(fs);
    }
    this.app.stage.addChild(this.groundRoot, this.objectRoot, this.effects.air, this.fogRoot, this.overlayLayer, this.lines, this.effects.screen);

    for (const u of this.world.list) this.ensureView(u);
    this.resize();
    const self = this.world.get(this.selfId);
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
      v = new UnitView(u, u.id === this.selfId, self?.team ?? 0, this.tex.glow);
      this.views.set(u.id, v);
      this.objectRoot.addChild(v.root);
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
            tv.hit(now);
            if (e.impact >= 1 || e.crit) this.freeze(tv, now + (e.impact >= 2 ? 95 : 60));
          }
          const sv = this.views.get(e.src);
          if (sv && (e.impact >= 1 || e.crit) && e.src === this.selfId) this.freeze(sv, now + (e.impact >= 2 ? 75 : 45));
          if (involvesSelf && (e.impact >= 2 || (e.crit && e.src === this.selfId))) this.camera.shake(e.impact >= 2 ? 0.2 : 0.09);
          // 近战普攻命中时画刀光
          const src = w.get(e.src);
          if (e.isAttack && src && src.kind === 'hero' && !getHero(src.defId).attack.projectile) {
            this.effects.swing(src.pos.x, src.pos.y, src.facing, src.stats.range + src.radius, getHero(src.defId).palette.secondary, now);
          }
          if (e.protectedHit && e.src === this.selfId) {
            const last = this.protectHintAt.get(e.target) ?? 0;
            if (now - last > 1600) {
              this.protectHintAt.set(e.target, now);
              this.effects.floatText(e.x, e.y - 1.2, '无兵减伤', 0x9fd8ff, 16, now);
            }
            if (tv) this.effects.shieldFlash(tv.rx, tv.ry, now);
          }
          if (e.target === this.selfId && src && (src.kind === 'tower' || src.kind === 'crystal')) this.camera.shake(0.14);
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
          const size = e.crit ? 30 : involvesSelf ? (e.impact >= 1 ? 24 : 20) : 15;
          this.effects.floatText(e.x, e.y, `${Math.round(e.amount)}`, color, size, now, e.crit || e.impact >= 2);
          this.effects.hit(e.x, e.y, e.crit ? PALETTE.dmgCrit : e.dtype === 'magic' ? PALETTE.dmgMagic : 0xffd9a0, e.impact >= 1 || e.crit, now);
          break;
        }
        case 'heal':
          if (e.amount >= 8) this.effects.floatText(e.x, e.y, `+${Math.round(e.amount)}`, PALETTE.heal, 17, now);
          break;
        case 'attackStart': {
          const v = this.views.get(e.unit);
          if (v) {
            v.attackStart = now;
            v.attackDur = e.windup * 1000 + 220;
          }
          break;
        }
        case 'castStart': {
          const v = this.views.get(e.unit);
          if (v) {
            v.castStart = now;
            v.castDur = Math.max(260, e.windup * 1000 + 180);
          }
          break;
        }
        case 'area':
          // 没有配置视觉效果的区域（例如被动的周期治疗）不绘制
          if (!e.vfx) break;
          if (e.warn > 0) this.effects.warn(e.x, e.y, e.dirX, e.dirY, e.shape, e.vfx?.color ?? 0xffffff, e.warn, now);
          else this.effects.area(e.x, e.y, e.dirX, e.dirY, e.shape, e.vfx, now);
          break;
        case 'dash':
          this.dashTrailAt.set(e.unit, 0);
          break;
        case 'blink': {
          this.effects.blink(e.fromX, e.fromY, e.toX, e.toY, now);
          const v = this.views.get(e.unit);
          if (v) {
            v.rx = e.toX;
            v.ry = e.toY;
            v.freezeUntil = 0;
          }
          break;
        }
        case 'cc': {
          const u = w.get(e.target);
          if (u && e.cc !== 'slow') this.effects.floatText(u.pos.x, u.pos.y - 0.4, CC_NAMES[e.cc], 0xffe25a, 16, now);
          break;
        }
        case 'levelUp': {
          const u = w.get(e.unit);
          if (u) {
            this.effects.levelUp(u.pos.x, u.pos.y, now);
            if (u.id === this.selfId) this.effects.floatText(u.pos.x, u.pos.y - 0.6, '升级！', 0xffd23c, 22, now, true);
          }
          break;
        }
        case 'recall': {
          const u = w.get(e.unit);
          if (u && e.state === 'done') this.effects.pillar(u.pos.x, u.pos.y, teamColor(u.team), 2, 700, now);
          break;
        }
        case 'death': {
          const u = w.get(e.unit);
          if (u) this.effects.burst(u.pos.x, u.pos.y, teamColor(u.team), u.kind === 'minion' ? 8 : 20, 5, now, 1);
          break;
        }
        case 'structureDown': {
          const u = w.get(e.unit);
          if (u) {
            this.effects.explosion(u.pos.x, u.pos.y, teamColor(u.team), u.kind === 'crystal' ? 1.8 : 1, now);
            const self = w.get(this.selfId);
            const d = self ? Math.hypot(self.pos.x - u.pos.x, self.pos.y - u.pos.y) : 0;
            if (d < 26 || u.kind === 'crystal') this.camera.shake(u.kind === 'crystal' ? 0.5 : 0.32, true);
          }
          break;
        }
        case 'itemProc': {
          // 有冷却的装备被动（天罚、坚壁、护命、霜纹……）触发时在头顶显示被动名
          const it = getItem(e.item);
          const u = w.get(e.unit);
          if (!u || !it.passive?.cooldown || it.passive.cooldown < 2) break;
          const mine = e.unit === this.selfId;
          if (!mine && Math.hypot(u.pos.x - (w.get(this.selfId)?.pos.x ?? 0), u.pos.y - (w.get(this.selfId)?.pos.y ?? 0)) > 14) break;
          const big = e.item === 'guard_jade';
          this.effects.floatText(u.pos.x, u.pos.y - 1.4, it.passive.name, it.color, big ? 26 : mine ? 18 : 14, now, big);
          if (big) {
            this.effects.pillar(u.pos.x, u.pos.y, 0xffe28a, 1.8, 700, now);
            this.effects.burst(u.pos.x, u.pos.y, 0xffe28a, 16, 3, now, 1.2);
          }
          break;
        }
        case 'respawn': {
          // 泉水复活：光柱 + 扩散光圈
          const u = w.get(e.unit);
          if (u) {
            this.effects.pillar(u.pos.x, u.pos.y, teamColor(u.team), 2.2, 900, now);
            this.effects.levelUp(u.pos.x, u.pos.y, now);
          }
          break;
        }
        case 'gold':
          if (e.unit === this.selfId && e.amount >= 5) this.effects.floatText(e.x + 0.6, e.y - 0.4, `+${e.amount}`, 0xffd23c, 18, now);
          break;
        default:
          break;
      }
    }
  }

  get fogCanvasForMinimap(): HTMLCanvasElement | null {
    return this.fogCanvas;
  }

  private get selfTeam(): Team {
    return this.world.get(this.selfId)?.team ?? 0;
  }

  /** 迷雾：整张图压暗，再按本队视野源挖出透明圆（边缘柔和） */
  private paintFog(): void {
    const c = this.fogCanvas!.getContext('2d')!;
    const S = this.world.map.size;
    const k = 2;
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, S * k, S * k);
    c.fillStyle = 'rgba(5, 10, 20, 0.55)';
    c.fillRect(0, 0, S * k, S * k);
    c.globalCompositeOperation = 'destination-out';
    const hole = (x: number, y: number, r: number): void => {
      const g = c.createRadialGradient(x * k, y * k, r * k * 0.75, x * k, y * k, r * k);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(x * k, y * k, r * k, 0, Math.PI * 2);
      c.fill();
    };
    const team = this.selfTeam;
    if (team === 0 || team === 1) hole(this.world.map.fountain[team].x, this.world.map.fountain[team].y, SIGHT.fountain);
    for (const u of this.world.list) {
      if (!u.alive || u.team !== team) continue;
      const r = sightOf(u);
      if (r > 0) hole(u.pos.x, u.pos.y, r);
    }
    this.fogTex!.source.update();
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
    const z = cam.zoom;

    // 自己的英雄：沿当前速度外推，消除一个逻辑帧的输入延迟；其它单位在两帧之间插值
    const self = w.get(this.selfId);
    const posOf = (u: Unit): { x: number; y: number } => {
      if (u.id === this.selfId && u.alive && (u.moveDir || u.forced)) {
        return { x: u.pos.x + (u.pos.x - u.prevPos.x) * alpha, y: u.pos.y + (u.pos.y - u.prevPos.y) * alpha };
      }
      return { x: u.prevPos.x + (u.pos.x - u.prevPos.x) * alpha, y: u.prevPos.y + (u.pos.y - u.prevPos.y) * alpha };
    };
    if (this.focus) cam.follow(this.focus, dtSec, 3.2);
    else if (self) cam.follow(posOf(self), dtSec);

    const ox = cam.originX();
    const oy = cam.originY();
    this.groundRoot.scale.set(z, z * TILT);
    this.groundRoot.position.set(ox, oy);
    this.fogRoot.scale.set(z, z * TILT);
    this.fogRoot.position.set(ox, oy);
    if (this.fogCanvas && now - this.fogAt > 90) {
      this.fogAt = now;
      this.paintFog();
    }
    this.objectRoot.position.set(ox, oy);
    this.effects.air.position.set(ox, oy);
    this.effects.zoom = z;
    if (this.water) {
      this.water.tilePosition.x += dtSec * 14;
      this.water.tilePosition.y += dtSec * 14;
    }

    const view = cam.viewRect(4);
    // 道具：缩放变化时重新摆放；每帧做可见性裁剪与遮挡半透明
    const zoomChanged = z !== this.lastZoom;
    this.lastZoom = z;
    let hx = -999;
    let hy = -999;
    if (self && self.alive) {
      const sp = posOf(self);
      hx = sp.x;
      hy = sp.y;
    }
    for (const { s, p } of this.props) {
      if (zoomChanged) {
        s.position.set(p.x * z, p.y * z * TILT);
        const k = (p.size * z) / p.tex.width;
        s.scale.set(p.flip ? -k : k, k);
      }
      const vis = p.x > view.x0 - 2 && p.x < view.x1 + 2 && p.y > view.y0 && p.y < view.y1 + 6;
      s.visible = vis;
      if (!vis) continue;
      // 挡在自己英雄前面的树 / 草变半透明
      const occl = p.kind !== 'rock' && p.y > hy - 0.3 && p.y < hy + (p.kind === 'grass' ? 1.2 : 3.4) && Math.abs(p.x - hx) < p.r + 0.5;
      const target = occl ? (p.kind === 'grass' ? 0.55 : 0.4) : 1;
      s.alpha += (target - s.alpha) * Math.min(1, dtSec * 10);
    }

    // 单位：已被移除的单位（小兵 / 野怪）播放完死亡动画再销毁
    for (const [id, v] of this.views) {
      if (w.units.has(id)) continue;
      if (!v.deathAt) {
        if (!v.root.visible) {
          v.destroy();
          this.views.delete(id);
          continue;
        }
        v.deathAt = now;
      }
      const t = (now - v.deathAt) / DEATH_MS;
      if (t >= 1) {
        v.destroy();
        this.views.delete(id);
      } else v.dieAnim(t);
    }
    for (const u of w.list) {
      const v = this.ensureView(u);
      const { x, y } = posOf(u);
      const onScreen = x > view.x0 && x < view.x1 && y > view.y0 && y < view.y1 + 4;
      const ruin = !u.alive && isStructure(u);
      // 英雄死亡不会被移除：发现“刚死”就开始播放倒地动画
      if (u.kind === 'hero') {
        if (v.wasAlive && !u.alive) v.deathAt = now;
        if (u.alive && v.deathAt) v.revive();
        v.wasAlive = u.alive;
      }
      const dying = !u.alive && !ruin && v.deathAt > 0 && now - v.deathAt < HERO_DEATH_MS;
      const visible = (u.alive || ruin || dying) && onScreen && visibleTo(u, this.selfTeam);
      v.root.visible = visible;
      if (dying) {
        if (visible) v.dieAnim((now - v.deathAt) / HERO_DEATH_MS);
        continue;
      }
      // 自己人藏在草丛里时半透明
      v.root.alpha = u.bush > 0 && u.team === this.selfTeam ? 0.55 : 1;
      v.overlay.visible = visible && u.alive && !u.innate.untargetable;
      if (ruin) v.showRuins();
      if (!visible) continue;
      let aura: number | null = null;
      for (const b of u.buffs) {
        const a = getBuff(b.id).aura;
        if (a !== undefined) {
          aura = a;
          break;
        }
      }
      v.update(x, y, lerpAngle(u.prevFacing, u.facing, alpha), now, dtSec, z, aura);
      const lift = u.status.airborne > 0 && u.status.airborneTotal > 0 ? Math.sin(Math.PI * (1 - u.status.airborne / u.status.airborneTotal)) * 1.4 : 0;
      const s = cam.worldToScreen(v.rx, v.ry, v.model.height + lift + 0.15);
      v.updateOverlay(s.x, s.y);

      if (u.forced && u.forced.kind === 'dash') {
        const last = this.dashTrailAt.get(u.id) ?? 0;
        if (now - last > 28) {
          this.dashTrailAt.set(u.id, now);
          const color = u.kind === 'hero' ? getHero(u.defId).palette.secondary : 0xffffff;
          this.effects.afterimage(v.rx, v.ry, u.radius, color, now);
        }
      }
    }

    this.drawTowerHints(self ?? null);
    this.drawAiLabels();
    this.effects.syncProjectiles(w.projectiles, alpha);
    this.effects.syncZones(w.zones, now);
    this.effects.update(now, dtSec, (x, y, h) => cam.worldToScreen(x, y, h));

    if (aim && self) {
      const v = this.views.get(self.id)!;
      this.indicator.draw(v.rx, v.ry, aim.stage, aim.preview, aim.cancel, now);
    } else this.indicator.clear();

    if (this.debugOptions.colliders || this.debugOptions.paths || this.debugOptions.vision) this.debugDraw.draw(w, this.debugOptions, view);
    else this.debugDraw.g.clear();
  }

  private drawAiLabels(): void {
    for (const [id, t] of this.aiLabels) {
      const v = this.views.get(id);
      const text = this.aiInfo?.(id) ?? null;
      if (!v || !text || !v.root.visible) {
        t.visible = false;
        continue;
      }
    }
    if (!this.aiInfo) return;
    for (const u of this.world.list) {
      if (!u.hero) continue;
      const text = this.aiInfo(u.id);
      if (!text) continue;
      const v = this.views.get(u.id);
      if (!v || !v.root.visible) continue;
      let t = this.aiLabels.get(u.id);
      if (!t) {
        t = new Text({ text: '', style: { fontFamily: 'sans-serif', fontSize: 11, fill: 0xfff0a0, stroke: { color: 0x000000, width: 3 } } });
        t.anchor.set(0.5, 1);
        this.aiLabels.set(u.id, t);
        this.overlayLayer.addChild(t);
      }
      t.visible = true;
      if (t.text !== text) t.text = text;
      const s = this.camera.worldToScreen(v.rx, v.ry, v.model.height + 0.6);
      t.position.set(s.x, s.y - 26);
    }
  }

  /** 防御塔：自己靠近时显示攻击范围圈；塔与当前攻击目标之间画连线 */
  private drawTowerHints(self: Unit | null): void {
    const w = this.world;
    const cam = this.camera;
    this.rings.clear();
    this.lines.clear();
    let locked = false;
    for (const u of w.list) {
      if (!isStructure(u) || !u.alive || u.innate.untargetable) continue;
      const range = u.stats.range + 0.6;
      if (self && self.alive && u.team !== self.team) {
        const d = Math.hypot(self.pos.x - u.pos.x, self.pos.y - u.pos.y);
        if (d < range + 5) {
          const inside = d < range;
          this.rings.circle(u.pos.x, u.pos.y, range).stroke({ width: 0.12, color: inside ? 0xff3a2a : 0xffa04a, alpha: inside ? 0.9 : 0.5 });
          if (inside) this.rings.circle(u.pos.x, u.pos.y, range).fill({ color: 0xff3a2a, alpha: 0.06 });
        }
      }
      const tid = u.attack.swingTarget || u.attack.orderTarget;
      const t = tid ? w.get(tid) : undefined;
      if (t && t.alive && (u.attack.windup > 0 || u.attack.orderTime > 0) && Math.hypot(t.pos.x - u.pos.x, t.pos.y - u.pos.y) <= range + t.radius) {
        const v = this.views.get(u.id);
        const tv = this.views.get(t.id);
        if (!v || !tv) continue;
        const a = cam.worldToScreen(u.pos.x, u.pos.y, u.kind === 'tower' ? 4.1 : 3.1);
        const b = cam.worldToScreen(tv.rx, tv.ry, 1.0);
        const danger = self && t.id === self.id;
        const col = danger ? 0xff3a2a : teamColor(u.team);
        this.lines.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({ width: danger ? 4 : 2.5, color: col, alpha: 0.85 });
        this.lines.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({ width: 1, color: 0xffffff, alpha: 0.7 });
        if (danger) {
          locked = true;
          // 头顶红色感叹号：被塔锁定
          const hv = this.views.get(t.id)!;
          const p = cam.worldToScreen(hv.rx, hv.ry, hv.model.height + 0.5);
          const pulse = 1 + Math.sin(performance.now() / 90) * 0.12;
          const r = 13 * pulse;
          this.lines.poly([p.x, p.y - 44 - r, p.x + r, p.y - 44 + r * 0.75, p.x - r, p.y - 44 + r * 0.75]).fill(0xff2a1a);
          this.lines.poly([p.x, p.y - 44 - r, p.x + r, p.y - 44 + r * 0.75, p.x - r, p.y - 44 + r * 0.75]).stroke({ width: 2, color: 0xffffff });
          this.lines.rect(p.x - 1.8, p.y - 44 - r * 0.45, 3.6, r * 0.75).fill(0xffffff);
          this.lines.circle(p.x, p.y - 44 + r * 0.48, 2).fill(0xffffff);
        }
      }
    }
    this.selfLocked = locked;
  }

  destroy(): void {
    for (const v of this.views.values()) v.destroy();
    this.views.clear();
    this.app.destroy(true, { children: true });
  }
}
