import { Container, Graphics, Text } from 'pixi.js';
import { getHero } from '../data/heroes';
import type { Emblem } from '../data/schema';
import type { Unit } from '../sim/entity';
import { totalShield } from '../sim/damage';
import { PALETTE, teamColor } from './palette';

/**
 * 单位外观（程序绘制）：
 *   - 英雄：阵营色外圈 + 英雄主色圆盘 + 职业纹样 + 朝向楔形
 *   - 木桩：木色圆桩 + 靶心；建筑：石座 + 阵营色晶体
 * 头顶血条放在屏幕空间图层，不随镜头缩放变形。
 */
export class UnitView {
  /** 世界层（米为单位） */
  readonly root = new Container();
  private readonly shadow = new Graphics();
  private readonly lift = new Container();
  private readonly body = new Container();
  private readonly flash = new Graphics();
  private readonly aura = new Graphics();
  private readonly statusFx = new Graphics();
  /** 屏幕层：血条、等级 */
  readonly overlay = new Container();
  private readonly bar = new Graphics();
  private readonly levelText: Text | null = null;
  private barKey = '';
  flashUntil = 0;
  /** 顿帧：冻结到此时刻（performance.now 毫秒） */
  freezeUntil = 0;
  frozenX = 0;
  frozenY = 0;
  /** 渲染位置（插值后） */
  rx = 0;
  ry = 0;
  seen = true;

  constructor(
    readonly unit: Unit,
    private readonly isSelf: boolean,
    private readonly viewerTeam: number,
  ) {
    const u = unit;
    const r = u.radius;
    this.shadow.ellipse(0.1, 0.25, r * 1.05, r * 0.7).fill({ color: 0x000000, alpha: 0.35 });
    this.root.addChild(this.shadow, this.aura, this.lift);
    this.lift.addChild(this.body, this.flash, this.statusFx);

    const g = new Graphics();
    switch (u.kind) {
      case 'hero':
        drawHero(g, u, this.isSelf);
        break;
      case 'dummy':
        drawDummy(g, r, u.patrol !== null);
        break;
      case 'tower':
        drawTower(g, r, u.team);
        break;
      case 'crystal':
        drawCrystal(g, r, u.team);
        break;
      default:
        g.circle(0, 0, r).fill(teamColor(u.team));
    }
    this.body.addChild(g);
    this.flash.circle(0, 0, r * 1.05).fill(0xffffff);
    this.flash.alpha = 0;

    if (u.kind === 'hero') {
      const t = new Text({
        text: '1',
        style: { fontFamily: 'sans-serif', fontSize: 11, fontWeight: 'bold', fill: 0xffffff },
      });
      t.anchor.set(0.5);
      this.levelText = t;
    }
    this.overlay.addChild(this.bar);
    if (this.levelText) this.overlay.addChild(this.levelText);
  }

  /** 更新世界层表现 */
  update(x: number, y: number, facing: number, now: number): void {
    const u = this.unit;
    if (now < this.freezeUntil) {
      x = this.frozenX;
      y = this.frozenY;
    }
    this.rx = x;
    this.ry = y;
    this.root.position.set(x, y);
    // 建筑、木桩不旋转
    if (u.kind === 'hero') this.body.rotation = facing;

    // 击飞：抛物线抬升 + 放大，影子留在地面
    const st = u.status;
    let h = 0;
    if (st.airborne > 0 && st.airborneTotal > 0) {
      const t = 1 - st.airborne / st.airborneTotal;
      h = Math.sin(Math.PI * t) * 1.2;
    }
    this.lift.position.set(0, -h);
    this.lift.scale.set(1 + h * 0.15);
    this.shadow.scale.set(1 - h * 0.25);

    // 受击闪白 + 顿帧抖动
    const fl = Math.max(0, (this.flashUntil - now) / 110);
    this.flash.alpha = fl * 0.85;
    if (now < this.freezeUntil) this.lift.position.x = Math.sin(now * 0.25) * 0.06;

    // 状态特效
    this.statusFx.clear();
    const r = u.radius;
    if (st.stun > 0 || st.airborne > 0) {
      for (let i = 0; i < 3; i++) {
        const a = now / 200 + (i * Math.PI * 2) / 3;
        this.statusFx.star(Math.cos(a) * r * 0.8, -r - 0.35 + Math.sin(a) * 0.15, 5, 0.16, 0.07).fill(0xffe25a);
      }
    }
    if (st.silence > 0) {
      this.statusFx.roundRect(-0.35, -r - 0.75, 0.7, 0.32, 0.1).fill({ color: 0x5a3a8a, alpha: 0.9 });
      for (let i = 0; i < 3; i++) this.statusFx.circle(-0.18 + i * 0.18, -r - 0.59, 0.05).fill(0xffffff);
    }
    if (st.slows.length > 0) this.statusFx.circle(0, 0, r + 0.12).stroke({ width: 0.08, color: 0x7fd4ff, alpha: 0.8 });

    // 增益光环（取第一个带光环的增益）
    this.aura.clear();
    if (u.shields.length > 0) this.aura.circle(0, 0, r + 0.22).stroke({ width: 0.1, color: PALETTE.shield, alpha: 0.85 });
  }

  setAura(color: number | null, now: number): void {
    if (color === null) return;
    const pulse = 0.5 + 0.3 * Math.sin(now / 150);
    this.aura.circle(0, 0, this.unit.radius + 0.3).stroke({ width: 0.12, color, alpha: pulse });
  }

  /** 更新屏幕层血条（只在数值变化时重画） */
  updateOverlay(sx: number, sy: number, zoom: number): void {
    const u = this.unit;
    const hero = u.kind === 'hero';
    const structure = u.kind === 'tower' || u.kind === 'crystal';
    const w = hero ? 64 : structure ? 76 : 48;
    const top = sy - (u.radius + (hero ? 0.9 : 0.55)) * zoom - (hero ? 14 : 6);
    this.overlay.position.set(sx, top);

    const shield = totalShield(u);
    const key = `${Math.ceil(u.hp)}|${Math.ceil(u.stats.maxHp)}|${Math.ceil(shield)}|${Math.floor(u.mp)}|${u.hero?.level ?? 0}`;
    if (key === this.barKey) return;
    this.barKey = key;
    const g = this.bar;
    g.clear();
    const x0 = -w / 2 + (hero ? 8 : 0);
    const bw = w - (hero ? 8 : 0);
    const hpH = hero ? 7 : 5;
    const total = Math.max(u.stats.maxHp, u.hp + shield);
    const color = this.isSelf ? PALETTE.hpSelf : u.team === this.viewerTeam ? PALETTE.hpAlly : PALETTE.hpEnemy;
    g.rect(x0 - 1, -1, bw + 2, hpH + 2 + (hero ? 4 : 0)).fill({ color: PALETTE.hpBack, alpha: 0.85 });
    g.rect(x0, 0, (bw * Math.max(0, u.hp)) / total, hpH).fill(color);
    if (shield > 0) g.rect(x0 + (bw * u.hp) / total, 0, (bw * shield) / total, hpH).fill(PALETTE.shield);
    // 每 1000 生命一格刻度
    const ticks = Math.floor(u.stats.maxHp / 1000);
    for (let i = 1; hero && i <= ticks && ticks < 40; i++) {
      const tx = x0 + (bw * i * 1000) / total;
      g.rect(tx, 0, 1, hpH * (i % 5 === 0 ? 1 : 0.55)).fill({ color: 0x000000, alpha: 0.5 });
    }
    if (hero) {
      g.rect(x0, hpH + 1, (bw * u.mp) / Math.max(1, u.stats.maxMp), 2).fill(PALETTE.mp);
      g.circle(x0 - 7, hpH / 2 + 1, 8).fill({ color: 0x101820, alpha: 0.95 });
      g.circle(x0 - 7, hpH / 2 + 1, 8).stroke({ width: 1.5, color: teamColor(u.team) });
      if (this.levelText) {
        this.levelText.text = String(u.hero?.level ?? 1);
        this.levelText.position.set(x0 - 7, hpH / 2 + 1);
      }
    }
  }

  destroy(): void {
    this.root.destroy({ children: true });
    this.overlay.destroy({ children: true });
  }
}

// ————————————————————————— 绘制函数 —————————————————————————

function drawHero(g: Graphics, u: Unit, isSelf: boolean): void {
  const def = getHero(u.defId);
  const r = u.radius;
  const tc = teamColor(u.team);
  // 阵营外圈（自己额外加一道亮边）
  if (isSelf) g.circle(0, 0, r + 0.14).fill({ color: 0xffffff, alpha: 0.9 });
  g.circle(0, 0, r + 0.08).fill(tc);
  g.circle(0, 0, r - 0.04).fill(def.palette.primary);
  g.circle(0, 0, r * 0.62).fill({ color: def.palette.secondary, alpha: 0.35 });
  // 朝向楔形（指向 +x，随容器旋转）
  g.poly([r + 0.42, 0, r - 0.08, -0.3, r - 0.08, 0.3]).fill(tc);
  g.poly([r + 0.42, 0, r - 0.08, -0.3, r - 0.08, 0.3]).stroke({ width: 0.05, color: 0x000000, alpha: 0.5 });
  drawEmblem(g, def.emblem, r * 0.55, def.palette.secondary);
}

export function drawEmblem(g: Graphics, e: Emblem, s: number, color: number): void {
  switch (e) {
    case 'blade':
      g.poly([s, 0, -s * 0.4, -s * 0.22, -s * 0.4, s * 0.22]).fill(color);
      g.rect(-s * 0.75, -s * 0.45, s * 0.14, s * 0.9).fill(color);
      break;
    case 'shield':
      g.poly([-s * 0.6, -s * 0.7, s * 0.6, -s * 0.7, s * 0.6, 0, 0, s * 0.8, -s * 0.6, 0]).fill(color);
      break;
    case 'dagger':
      g.poly([s, 0, 0, -s * 0.18, -s * 0.5, 0, 0, s * 0.18]).fill(color);
      g.poly([s * 0.2, -s * 0.8, s * 0.35, -s * 0.2, 0, -s * 0.35]).fill(color);
      break;
    case 'star':
      g.star(0, 0, 5, s * 0.8, s * 0.35).fill(color);
      break;
    case 'bow':
      g.arc(0, 0, s * 0.75, -Math.PI / 2, Math.PI / 2).stroke({ width: s * 0.18, color });
      g.moveTo(-s * 0.4, 0).lineTo(s, 0).stroke({ width: s * 0.1, color });
      break;
    case 'lantern':
      g.circle(0, 0, s * 0.5).fill(color);
      g.circle(0, 0, s * 0.8).stroke({ width: s * 0.1, color, alpha: 0.7 });
      break;
  }
}

function drawDummy(g: Graphics, r: number, moving: boolean): void {
  g.circle(0, 0, r).fill(0x8a5a32);
  g.circle(0, 0, r).stroke({ width: 0.08, color: 0x4a2e18 });
  g.circle(0, 0, r * 0.66).stroke({ width: 0.1, color: 0xd9d0c0 });
  g.circle(0, 0, r * 0.32).fill(0xd84a3a);
  g.moveTo(-r, 0).lineTo(r, 0).stroke({ width: 0.06, color: 0x4a2e18 });
  g.moveTo(0, -r).lineTo(0, r).stroke({ width: 0.06, color: 0x4a2e18 });
  if (moving) g.circle(0, 0, r + 0.1).stroke({ width: 0.08, color: 0xffe25a, alpha: 0.8 });
}

function drawTower(g: Graphics, r: number, team: number): void {
  const tc = teamColor(team);
  const oct: number[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 8;
    oct.push(Math.cos(a) * r, Math.sin(a) * r);
  }
  g.poly(oct).fill(0x5a606a);
  g.poly(oct).stroke({ width: 0.12, color: 0x2a2e34 });
  g.circle(0, 0, r * 0.62).fill(0x3a3f47);
  g.poly([0, -r * 0.9, r * 0.38, 0, 0, r * 0.35, -r * 0.38, 0]).fill(tc);
  g.poly([0, -r * 0.9, r * 0.38, 0, 0, r * 0.35, -r * 0.38, 0]).stroke({ width: 0.06, color: 0xffffff, alpha: 0.6 });
}

function drawCrystal(g: Graphics, r: number, team: number): void {
  const tc = teamColor(team);
  g.circle(0, 0, r).fill({ color: PALETTE.teamDark[team as 0 | 1], alpha: 0.9 });
  g.circle(0, 0, r).stroke({ width: 0.15, color: tc });
  g.poly([0, -r * 1.3, r * 0.55, -r * 0.1, 0, r * 0.6, -r * 0.55, -r * 0.1]).fill(tc);
  g.poly([0, -r * 1.3, r * 0.18, -r * 0.1, 0, r * 0.6]).fill({ color: 0xffffff, alpha: 0.35 });
}
