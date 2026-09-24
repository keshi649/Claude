import { ColorMatrixFilter, Container, Graphics, Text, type Texture } from 'pixi.js';
import { getHero } from '../data/heroes';
import { getUnitDef } from '../data/units';
import { totalShield } from '../sim/damage';
import type { Unit } from '../sim/entity';
import { TILT } from './camera';
import { crystalModel, dummyModel, heroModel, minionModel, monsterModel, towerModel, type AnimState, type Model } from './models';
import { PALETTE, teamColor } from './palette';

/** 受击闪白用的共享滤镜（提亮） */
let flashFilter: ColorMatrixFilter | null = null;
function getFlashFilter(): ColorMatrixFilter {
  if (!flashFilter) {
    flashFilter = new ColorMatrixFilter();
    flashFilter.brightness(2.4, false);
  }
  return flashFilter;
}

/**
 * 一个单位的完整表现：
 *   root（物体层，按纵深排序）
 *     ├─ 地面部分（按斜视角压扁）：阴影、阵营光圈、自己的朝向箭头、减速圈
 *     └─ lift（击飞抬升）→ 模型 + 头顶状态特效
 *   overlay（屏幕层）：血条、等级、名字
 */
export class UnitView {
  readonly root = new Container();
  private readonly groundPart = new Container();
  private readonly groundFx = new Graphics();
  private readonly lift = new Container();
  private readonly statusFx = new Graphics();
  readonly model: Model;
  readonly overlay = new Container();
  private readonly bar = new Graphics();
  private statusDrawn = true;
  private groundDrawn = true;
  private readonly levelText: Text | null = null;
  private readonly nameText: Text | null = null;
  private barKey = '';
  flashUntil = 0;
  freezeUntil = 0;
  frozenX = 0;
  frozenY = 0;
  rx = 0;
  ry = 0;
  private lastX = 0;
  private lastY = 0;
  private speed = 0;
  attackStart = 0;
  attackDur = 0;
  castStart = 0;
  castDur = 0;
  private flashing = false;

  constructor(
    readonly unit: Unit,
    private readonly isSelf: boolean,
    private readonly viewerTeam: number,
    glowTex: Texture,
  ) {
    const u = unit;
    const r = u.radius;
    // 地面部分
    this.groundPart.scale.y = TILT;
    const shadow = new Graphics();
    const sr = u.kind === 'tower' ? 1.7 : u.kind === 'crystal' ? 2.6 : r * 1.1;
    // 中立单位的血条是黄色
    shadow.ellipse(0.15, 0.1, sr, sr * 0.9).fill({ color: 0x000000, alpha: 0.32 });
    this.groundPart.addChild(shadow);
    if (u.kind === 'hero') {
      const ring = new Graphics();
      const tc = this.isSelf ? 0x6dff7a : teamColor(u.team);
      ring.circle(0, 0, r + 0.12).stroke({ width: 0.09, color: tc, alpha: 0.95 });
      ring.circle(0, 0, r + 0.12).fill({ color: tc, alpha: 0.12 });
      this.groundPart.addChild(ring);
    }
    this.groundPart.addChild(this.groundFx);
    this.root.addChild(this.groundPart, this.lift);

    switch (u.kind) {
      case 'hero':
        this.model = heroModel(getHero(u.defId), glowTex);
        break;
      case 'tower':
        this.model = towerModel(u.team, glowTex);
        break;
      case 'crystal':
        this.model = crystalModel(u.team, glowTex);
        break;
      case 'dummy':
        this.model = dummyModel();
        break;
      case 'monster':
      case 'summon':
        this.model = monsterModel(getUnitDef(u.defId), u.team, glowTex);
        break;
      default:
        this.model = minionModel(getUnitDef(u.defId), u.team, glowTex);
    }
    this.lift.addChild(this.model.root, this.statusFx);

    if (u.kind === 'hero') {
      const t = new Text({ text: '1', style: { fontFamily: 'sans-serif', fontSize: 12, fontWeight: 'bold', fill: 0xffffff } });
      t.anchor.set(0.5);
      this.levelText = t;
      const n = new Text({
        text: getHero(u.defId).name,
        style: { fontFamily: 'sans-serif', fontSize: 12, fontWeight: 'bold', fill: 0xffffff, stroke: { color: 0x000000, width: 3 } },
      });
      n.anchor.set(0.5, 1);
      this.nameText = n;
    }
    this.overlay.addChild(this.bar);
    if (this.levelText) this.overlay.addChild(this.levelText);
    if (this.nameText) this.overlay.addChild(this.nameText);
  }

  hit(now: number): void {
    this.flashUntil = now + 90;
    const m = this.model as Model & { wobble?: (k: number) => void };
    m.wobble?.(4);
  }

  /** 每帧更新（x, y 为插值后的世界坐标） */
  update(x: number, y: number, facing: number, now: number, dt: number, zoom: number, aura: number | null): void {
    const u = this.unit;
    if (now < this.freezeUntil) {
      x = this.frozenX;
      y = this.frozenY;
    }
    this.rx = x;
    this.ry = y;
    this.root.position.set(x * zoom, y * zoom * TILT);
    this.root.scale.set(zoom);
    this.root.zIndex = y;

    // 估算移动速度（驱动跑步动画）
    if (dt > 0) {
      const v = Math.hypot(x - this.lastX, y - this.lastY) / dt;
      this.speed = this.speed * 0.7 + Math.min(v, 12) * 0.3;
    }
    this.lastX = x;
    this.lastY = y;

    const st = u.status;
    let h = 0;
    let spin = 0;
    if (st.airborne > 0 && st.airborneTotal > 0) {
      const t = 1 - st.airborne / st.airborneTotal;
      h = Math.sin(Math.PI * t) * 1.4;
      spin = Math.sin(Math.PI * t) * 0.5;
    }
    this.lift.position.set(now < this.freezeUntil ? Math.sin(now * 0.3) * 0.05 : 0, -h);
    this.lift.rotation = spin;

    const anim: AnimState = {
      facing,
      speed: this.speed,
      attackT: this.attackDur > 0 && now - this.attackStart < this.attackDur ? (now - this.attackStart) / this.attackDur : null,
      castT: this.castDur > 0 && now - this.castStart < this.castDur ? (now - this.castStart) / this.castDur : null,
      dashing: !!u.forced && u.forced.kind === 'dash',
      stunned: st.stun > 0,
      now,
      dt,
    };
    this.model.update(anim);

    // 受击闪白（短暂挂上提亮滤镜）
    const flash = now < this.flashUntil;
    if (flash !== this.flashing) {
      this.flashing = flash;
      this.lift.filters = flash ? [getFlashFilter()] : [];
    }

    // 头顶状态
    // 头顶 / 脚下特效只在有内容（或上一帧有内容需要擦掉）时重画，大量小兵时省掉每帧的几何重建
    const fx = this.statusFx;
    const needStatus = st.stun > 0 || st.airborne > 0 || st.silence > 0;
    if (needStatus || this.statusDrawn) fx.clear();
    this.statusDrawn = needStatus;
    const top = -this.model.height - 0.25;
    if (st.stun > 0 || st.airborne > 0) {
      for (let i = 0; i < 3; i++) {
        const a = now / 180 + (i * Math.PI * 2) / 3;
        fx.star(Math.cos(a) * 0.45, top + Math.sin(a) * 0.12, 5, 0.14, 0.06).fill(0xffe25a);
      }
    }
    if (st.silence > 0) {
      fx.roundRect(-0.32, top - 0.45, 0.64, 0.3, 0.1).fill({ color: 0x5a3a8a, alpha: 0.95 });
      for (let i = 0; i < 3; i++) fx.circle(-0.16 + i * 0.16, top - 0.3, 0.045).fill(0xffffff);
    }

    // 地面特效：减速圈、护盾圈、增益光环、回城法阵
    const g = this.groundFx;
    const recalling = !!u.hero && u.hero.recall > 0;
    const needGround = st.slows.length > 0 || u.shields.length > 0 || aura !== null || (this.isSelf && u.kind === 'hero') || recalling;
    if (!needGround && !this.groundDrawn) return;
    this.groundDrawn = needGround;
    g.clear();
    const r = u.radius;
    if (st.slows.length > 0) g.circle(0, 0, r + 0.3).stroke({ width: 0.07, color: 0x7fd4ff, alpha: 0.8 });
    if (u.shields.length > 0) g.circle(0, 0, r + 0.42).stroke({ width: 0.1, color: PALETTE.shield, alpha: 0.9 });
    if (aura !== null) g.circle(0, 0, r + 0.55).stroke({ width: 0.1, color: aura, alpha: 0.5 + 0.3 * Math.sin(now / 150) });
    if (this.isSelf && u.kind === 'hero') {
      // 自己脚下的朝向箭头
      const a = facing;
      const d = r + 0.45;
      const px = Math.cos(a);
      const py = Math.sin(a);
      g.poly([px * (d + 0.35), py * (d + 0.35), px * d - py * 0.22, py * d + px * 0.22, px * d + py * 0.22, py * d - px * 0.22]).fill({
        color: 0x6dff7a,
        alpha: 0.9,
      });
    }
    if (u.hero && u.hero.recall > 0) {
      const tc = teamColor(u.team);
      const t = now / 400;
      g.circle(0, 0, 1.3).stroke({ width: 0.08, color: tc, alpha: 0.9 });
      for (let i = 0; i < 6; i++) {
        const a = t + (i * Math.PI) / 3;
        g.circle(Math.cos(a) * 1.3, Math.sin(a) * 1.3, 0.12).fill(tc);
      }
      g.circle(0, 0, 1.3).fill({ color: tc, alpha: 0.12 });
    }
  }

  /** 屏幕层血条：sx, sy 为头顶的屏幕坐标 */
  updateOverlay(sx: number, sy: number): void {
    const u = this.unit;
    const hero = u.kind === 'hero';
    const structure = u.kind === 'tower' || u.kind === 'crystal';
    this.overlay.position.set(sx, sy - (hero ? 14 : 8));
    const shield = totalShield(u);
    const recall = u.hero?.recall ?? 0;
    const prot = structure && u.innate.invulnerable;
    const key = `${Math.ceil(u.hp)}|${Math.ceil(u.stats.maxHp)}|${Math.ceil(shield)}|${Math.floor(u.mp)}|${u.hero?.level ?? 0}|${recall.toFixed(1)}|${prot}`;
    if (key === this.barKey) return;
    this.barKey = key;

    const big = u.radius >= 1.5;
    const w = hero ? 78 : structure || big ? 90 : u.kind === 'monster' ? 52 : 44;
    const hpH = hero ? 9 : structure ? 8 : 5;
    const g = this.bar;
    g.clear();
    const lvW = hero ? 18 : 0;
    const x0 = -w / 2 + lvW / 2;
    const bw = w - lvW;
    const total = Math.max(u.stats.maxHp, u.hp + shield);
    const color = this.isSelf ? PALETTE.hpSelf : u.team === 2 ? 0xe8c64a : u.team === this.viewerTeam ? PALETTE.hpAlly : PALETTE.hpEnemy;
    const fullH = hpH + (hero ? 4 : 0);
    g.roundRect(x0 - 1.5, -1.5, bw + 3, fullH + 3, 2).fill({ color: 0x0c0f14, alpha: 0.9 });
    g.rect(x0, 0, (bw * Math.max(0, u.hp)) / total, hpH).fill(color);
    g.rect(x0, 0, (bw * Math.max(0, u.hp)) / total, hpH * 0.35).fill({ color: 0xffffff, alpha: 0.18 });
    if (shield > 0) g.rect(x0 + (bw * u.hp) / total, 0, (bw * shield) / total, hpH).fill(PALETTE.shield);
    if (prot) {
      // 受保护的建筑：血条变暗并显示盾牌标记
      g.rect(x0, 0, bw, hpH).fill({ color: 0x000000, alpha: 0.45 });
      g.poly([-8, -14, 8, -14, 8, -7, 0, -1, -8, -7]).fill(0xd8e0ea);
      g.poly([-5, -11, 5, -11, 5, -7, 0, -3.5, -5, -7]).fill(0x4a6a8a);
    }
    if (hero) {
      // 每 1000 生命一大格，每 200 一小格
      const step = 200;
      for (let v = step; v < u.stats.maxHp; v += step) {
        const tx = x0 + (bw * v) / total;
        const big = v % 1000 === 0;
        g.rect(tx, 0, big ? 1.2 : 0.8, big ? hpH : hpH * 0.5).fill({ color: 0x000000, alpha: big ? 0.7 : 0.4 });
      }
      g.rect(x0, hpH + 1, (bw * u.mp) / Math.max(1, u.stats.maxMp), 3).fill(PALETTE.mp);
      // 等级框
      g.roundRect(-w / 2 - lvW / 2 - 2, -2, lvW, fullH + 4, 3).fill(0x10161f);
      g.roundRect(-w / 2 - lvW / 2 - 2, -2, lvW, fullH + 4, 3).stroke({ width: 1.2, color: this.isSelf ? PALETTE.hpSelf : teamColor(u.team) });
      if (this.levelText) {
        this.levelText.text = String(u.hero?.level ?? 1);
        this.levelText.position.set(-w / 2 - 2, fullH / 2);
      }
      if (this.nameText) this.nameText.position.set(lvW / 2, -3);
      if (recall > 0) {
        g.roundRect(x0, fullH + 5, bw, 4, 2).fill({ color: 0x000000, alpha: 0.6 });
        g.roundRect(x0, fullH + 5, bw * (1 - recall / 6), 4, 2).fill(0x7fd4ff);
      }
    }
  }

  private ruins: Graphics | null = null;

  /** 建筑被摧毁：模型换成废墟 */
  showRuins(): void {
    if (this.ruins) return;
    this.model.root.visible = false;
    this.statusFx.visible = false;
    const g = new Graphics();
    const big = this.unit.kind === 'crystal' ? 1.6 : 1;
    g.ellipse(0, 0, 1.6 * big, 0.7 * big).fill(0x3a3e45);
    for (let i = 0; i < 9; i++) {
      const a = i * 2.4;
      const r = (0.5 + (i % 3) * 0.35) * big;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r * 0.45 - 0.15;
      g.poly([x - 0.35, y, x + 0.3, y - 0.05, x + 0.18, y - 0.45 - (i % 2) * 0.3, x - 0.22, y - 0.35]).fill(i % 2 ? 0x6a6f78 : 0x565b63);
    }
    g.rect(-0.3 * big, -1.1 * big, 0.35, 1.1 * big).fill(0x7c828d);
    this.lift.addChild(g);
    this.ruins = g;
  }

  destroy(): void {
    this.root.destroy({ children: true });
    this.overlay.destroy({ children: true });
  }
}
