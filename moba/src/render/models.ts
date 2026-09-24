import { Container, Graphics, Sprite, type Texture } from 'pixi.js';
import type { Emblem, HeroDef, UnitDef } from '../data/schema';
import { PALETTE } from './palette';

/**
 * 程序绘制的立体模型（直立坐标系，单位米，原点在脚底，y 向上为负）。
 * 模型只由若干部件组成，动画通过部件的旋转 / 位移实现，每帧不重画几何体。
 */
export interface AnimState {
  facing: number;
  /** 当前移动速度（米/秒） */
  speed: number;
  /** 普攻动画进度 0~1，null 表示没有在出手 */
  attackT: number | null;
  /** 施法动画进度 0~1 */
  castT: number | null;
  dashing: boolean;
  stunned: boolean;
  now: number;
  dt: number;
}

export interface Model {
  root: Container;
  /** 头顶高度（米），用于放置血条 */
  height: number;
  update(s: AnimState): void;
}

const SKIN = 0xf2c9a0;

function darker(c: number, k: number): number {
  const r = ((c >> 16) & 255) * k;
  const g = ((c >> 8) & 255) * k;
  const b = (c & 255) * k;
  return ((Math.min(255, r) << 16) | (Math.min(255, g) << 8) | Math.min(255, b)) >>> 0;
}

// ————————————————————————— 人形角色 —————————————————————————

interface HumanoidSpec {
  scale: number;
  primary: number;
  secondary: number;
  hair: number;
  weapon: Emblem | 'sword_shield' | 'staff' | 'hammer';
  cape: boolean;
  helmet: boolean;
  bulky: number;
  glowTex?: Texture;
}

function drawWeapon(g: Graphics, kind: HumanoidSpec['weapon'], sec: number): void {
  switch (kind) {
    case 'blade':
      // 长刀：刀身沿手臂方向延伸
      g.rect(-0.05, 0.38, 0.1, 0.12).fill(0x3a2a1a);
      g.rect(-0.16, 0.48, 0.32, 0.06).fill(sec);
      g.poly([-0.07, 0.54, 0.07, 0.54, 0.09, 1.35, 0, 1.52, -0.05, 1.35]).fill(0xe8eef5);
      g.poly([0.0, 0.56, 0.07, 0.56, 0.09, 1.35, 0, 1.52]).fill(0xb8c4d0);
      break;
    case 'dagger':
      g.rect(-0.04, 0.4, 0.08, 0.1).fill(0x2a1a1a);
      g.poly([-0.06, 0.5, 0.06, 0.5, 0.0, 0.95]).fill(0xd8e0ea);
      g.rect(-0.1, 0.48, 0.2, 0.04).fill(sec);
      break;
    case 'shield':
    case 'hammer':
      // 战锤
      g.rect(-0.04, 0.2, 0.08, 0.9).fill(0x5a3a22);
      g.roundRect(-0.2, 1.0, 0.4, 0.26, 0.05).fill(0x9aa4b0);
      g.roundRect(-0.2, 1.0, 0.4, 0.08, 0.03).fill(sec);
      break;
    case 'star':
    case 'staff':
      g.rect(-0.035, -0.3, 0.07, 1.5).fill(0x6a4a2a);
      g.circle(0, -0.42, 0.16).fill(sec);
      g.circle(0, -0.42, 0.09).fill(0xffffff);
      break;
    case 'bow':
      g.arc(0.1, 0.45, 0.55, -Math.PI / 2 - 0.2, Math.PI / 2 + 0.2).stroke({ width: 0.07, color: 0x7a5230 });
      g.moveTo(0.02, -0.08).lineTo(0.02, 0.98).stroke({ width: 0.02, color: 0xeeeeee });
      break;
    case 'lantern':
      g.rect(-0.03, -0.2, 0.06, 1.3).fill(0x6a4a2a);
      g.moveTo(0, -0.2).lineTo(0.25, -0.35).stroke({ width: 0.04, color: 0x6a4a2a });
      g.roundRect(0.16, -0.35, 0.2, 0.28, 0.05).fill(0xffe28a);
      g.roundRect(0.16, -0.35, 0.2, 0.28, 0.05).stroke({ width: 0.03, color: sec });
      break;
    case 'sword_shield':
      g.rect(-0.03, 0.38, 0.06, 0.08).fill(0x3a2a1a);
      g.poly([-0.05, 0.46, 0.05, 0.46, 0.04, 0.95, 0, 1.05, -0.04, 0.95]).fill(0xdfe6ee);
      break;
  }
}

function buildHumanoid(spec: HumanoidSpec): Model {
  const s = spec.scale;
  const root = new Container();
  const rig = new Container();
  rig.scale.set(s);
  root.addChild(rig);
  const P = spec.primary;
  const S2 = spec.secondary;
  const bw = 0.3 * spec.bulky;

  // 后腿、前腿（髋关节为轴）
  const mkLeg = (x: number): Container => {
    const c = new Container();
    c.position.set(x, -0.55);
    const g = new Graphics();
    g.roundRect(-0.1, 0, 0.2, 0.42, 0.06).fill(darker(P, 0.55));
    g.roundRect(-0.12, 0.38, 0.26, 0.17, 0.06).fill(0x3a2c24);
    c.addChild(g);
    return c;
  };
  const legB = mkLeg(-0.1);
  const legF = mkLeg(0.12);

  // 后臂（盾牌 / 副手）
  const armB = new Container();
  armB.position.set(-0.22 * spec.bulky, -1.15);
  const armBG = new Graphics();
  armBG.roundRect(-0.07, 0, 0.14, 0.45, 0.06).fill(darker(P, 0.7));
  armBG.circle(0, 0.47, 0.08).fill(SKIN);
  if (spec.weapon === 'shield' || spec.weapon === 'sword_shield') {
    const big = spec.weapon === 'shield';
    const w = big ? 0.42 : 0.3;
    armBG.roundRect(-w, 0.15, w * 2, big ? 0.8 : 0.55, 0.12).fill(darker(S2, 0.9));
    armBG.roundRect(-w + 0.06, 0.21, w * 2 - 0.12, (big ? 0.8 : 0.55) - 0.12, 0.1).fill(P);
    armBG.circle(0, 0.15 + (big ? 0.4 : 0.27), 0.08).fill(S2);
  }
  if (spec.weapon === 'dagger') {
    const d = new Graphics();
    drawWeapon(d, 'dagger', S2);
    armBG.addChild(d);
  }
  armB.addChild(armBG);

  // 披风
  const cape = new Graphics();
  if (spec.cape) cape.poly([-bw - 0.05, -1.2, bw + 0.05, -1.2, bw + 0.2, -0.35, -bw - 0.25, -0.3]).fill(darker(S2, 0.65));

  // 躯干
  const torso = new Container();
  const tg = new Graphics();
  tg.roundRect(-bw, -1.28, bw * 2, 0.8, 0.14).fill(P);
  tg.roundRect(-bw, -0.62, bw * 2, 0.12, 0.04).fill(S2);
  tg.poly([-bw * 0.6, -1.28, bw * 0.6, -1.28, 0, -0.95]).fill(darker(P, 1.25));
  if (spec.bulky > 1.1) {
    tg.circle(-bw, -1.18, 0.17).fill(S2);
    tg.circle(bw, -1.18, 0.17).fill(S2);
  }
  torso.addChild(tg);

  // 头部
  const head = new Container();
  head.position.set(0, -1.58);
  const hg = new Graphics();
  hg.circle(0, 0, 0.33).fill(SKIN);
  if (spec.helmet) {
    hg.arc(0, 0, 0.36, Math.PI, 0).fill(S2);
    hg.rect(-0.36, -0.04, 0.72, 0.1).fill(darker(S2, 0.8));
    hg.poly([-0.05, -0.36, 0.05, -0.36, 0.12, -0.6, -0.12, -0.6]).fill(P);
  } else {
    hg.arc(0, -0.02, 0.35, Math.PI * 0.95, Math.PI * 2.05).fill(spec.hair);
    hg.poly([-0.35, -0.02, -0.4, 0.22, -0.2, 0.05]).fill(spec.hair);
  }
  head.addChild(hg);
  const face = new Graphics();
  face.ellipse(0.15, 0.02, 0.045, 0.07).fill(0x1a1a22);
  face.ellipse(0.02, 0.02, 0.04, 0.065).fill(0x1a1a22);
  face.circle(0.16, 0.0, 0.015).fill(0xffffff);
  head.addChild(face);
  const backHair = new Graphics();
  backHair.circle(0, 0, 0.345).fill(spec.helmet ? S2 : spec.hair);
  backHair.visible = false;
  head.addChild(backHair);

  // 前臂 + 主武器（肩关节为轴）
  const armF = new Container();
  armF.position.set(0.24 * spec.bulky, -1.15);
  const armFG = new Graphics();
  armFG.roundRect(-0.07, 0, 0.14, 0.45, 0.06).fill(darker(P, 0.9));
  armFG.circle(0, 0.47, 0.085).fill(SKIN);
  const weapon = new Graphics();
  // 坦克的盾拿在后手，前手拿战锤
  drawWeapon(weapon, spec.weapon === 'shield' ? 'hammer' : spec.weapon, S2);
  armF.addChild(weapon, armFG);

  // 法杖顶端的光
  let orbGlow: Sprite | null = null;
  if (spec.glowTex && (spec.weapon === 'star' || spec.weapon === 'staff' || spec.weapon === 'lantern')) {
    orbGlow = new Sprite(spec.glowTex);
    orbGlow.anchor.set(0.5);
    orbGlow.width = orbGlow.height = 0.7;
    orbGlow.tint = S2;
    orbGlow.blendMode = 'add';
    orbGlow.position.set(spec.weapon === 'lantern' ? 0.26 : 0, spec.weapon === 'lantern' ? -0.21 : -0.42);
    armF.addChild(orbGlow);
  }

  rig.addChild(cape, armB, legB, legF, torso, head, armF);

  let runPhase = 0;
  const restF = spec.weapon === 'bow' ? -1.3 : spec.weapon === 'star' || spec.weapon === 'staff' || spec.weapon === 'lantern' ? -0.35 : -0.5;

  return {
    root,
    height: 2.05 * s,
    update(a: AnimState): void {
      const cos = Math.cos(a.facing);
      const sin = Math.sin(a.facing);
      rig.scale.x = (cos >= 0 ? 1 : -1) * s;
      // 背对镜头（朝屏幕上方）时隐藏五官
      const back = sin < -0.55;
      face.visible = !back;
      backHair.visible = back;

      const moving = a.speed > 0.4;
      if (moving) runPhase += a.dt * (4 + a.speed * 2.2);
      const sw = moving ? Math.sin(runPhase) : 0;
      legF.rotation = sw * 0.6;
      legB.rotation = -sw * 0.6;
      const bob = moving ? -Math.abs(Math.cos(runPhase)) * 0.07 : Math.sin(a.now / 450) * 0.015;
      torso.y = bob;
      head.y = -1.58 + bob;
      cape.y = bob;
      cape.skew.x = moving ? -0.18 - Math.abs(sw) * 0.1 : Math.sin(a.now / 600) * 0.04;
      armB.rotation = moving ? sw * 0.5 : 0.1;
      armB.y = -1.15 + bob;
      armF.y = -1.15 + bob;

      let armRot = moving ? restF - sw * 0.35 : restF + Math.sin(a.now / 500) * 0.05;
      if (a.attackT !== null) {
        const t = a.attackT;
        if (spec.weapon === 'bow' || spec.weapon === 'star' || spec.weapon === 'staff' || spec.weapon === 'lantern') {
          // 远程：抬手指向前方，出手时后坐
          armRot = t < 0.6 ? -1.55 : -1.55 + Math.sin(((t - 0.6) / 0.4) * Math.PI) * 0.35;
        } else if (t < 0.55) {
          armRot = restF + (-2.6 - restF) * easeOut(t / 0.55);
        } else if (t < 0.78) {
          armRot = -2.6 + (1.35 + 2.6) * easeOut((t - 0.55) / 0.23);
        } else {
          armRot = 1.35 + (restF - 1.35) * ((t - 0.78) / 0.22);
        }
      }
      if (a.castT !== null) {
        const t = a.castT;
        armRot = -2.9 + Math.sin(t * Math.PI) * 0.3;
        armB.rotation = -2.4;
      }
      if (a.dashing) {
        armRot = 1.1;
        armB.rotation = 1.0;
      }
      armF.rotation = armRot;
      rig.rotation = a.dashing ? 0.28 * Math.sign(cos || 1) : 0;
      head.rotation = a.stunned ? Math.sin(a.now / 90) * 0.18 : 0;
      if (orbGlow) orbGlow.alpha = 0.6 + Math.sin(a.now / 200) * 0.25 + (a.castT !== null ? 0.4 : 0);
    },
  };
}

const easeOut = (t: number): number => 1 - (1 - t) * (1 - t);

const HAIR: Record<string, number> = {
  tank: 0x5a4030,
  fighter: 0x2a1a14,
  assassin: 0x1a1a2a,
  mage: 0xe8e0f0,
  marksman: 0xd8a040,
  support: 0x7a4a8a,
};

export function heroModel(def: HeroDef, glowTex: Texture): Model {
  return buildHumanoid({
    scale: 1,
    primary: def.palette.primary,
    secondary: def.palette.secondary,
    hair: HAIR[def.role] ?? 0x2a1a14,
    weapon: def.emblem,
    cape: def.role === 'fighter' || def.role === 'tank' || def.role === 'mage',
    helmet: def.role === 'tank',
    bulky: def.role === 'tank' ? 1.35 : def.role === 'fighter' ? 1.12 : 1,
    glowTex,
  });
}

// ————————————————————————— 小兵 —————————————————————————

export function minionModel(def: UnitDef, team: number, glowTex: Texture): Model {
  const tc = PALETTE.team[team as 0 | 1] ?? 0xcccccc;
  const dark = PALETTE.teamDark[team as 0 | 1] ?? 0x666666;
  switch (def.shape) {
    case 'triangle':
      return buildHumanoid({ scale: 0.62, primary: dark, secondary: tc, hair: 0x333333, weapon: 'staff', cape: true, helmet: false, bulky: 0.95, glowTex });
    case 'bigsquare':
      return buildHumanoid({ scale: 0.95, primary: dark, secondary: tc, hair: 0x333333, weapon: 'hammer', cape: false, helmet: true, bulky: 1.45, glowTex });
    case 'hexagon':
      return siegeModel(tc, dark);
    default:
      return buildHumanoid({ scale: 0.64, primary: dark, secondary: tc, hair: 0x333333, weapon: 'sword_shield', cape: false, helmet: true, bulky: 1.05, glowTex });
  }
}

function siegeModel(tc: number, dark: number): Model {
  const root = new Container();
  const rig = new Container();
  root.addChild(rig);
  const g = new Graphics();
  // 车身
  g.roundRect(-0.7, -0.75, 1.4, 0.45, 0.08).fill(0x6a4a2a);
  g.roundRect(-0.7, -0.75, 1.4, 0.12, 0.05).fill(dark);
  // 炮管
  g.roundRect(-0.2, -1.05, 1.15, 0.3, 0.12).fill(0x444a52);
  g.circle(0.95, -0.9, 0.17).fill(0x2a2e34);
  // 旗帜
  g.rect(-0.62, -1.6, 0.05, 0.9).fill(0x3a2a1a);
  g.poly([-0.57, -1.6, -0.1, -1.45, -0.57, -1.3]).fill(tc);
  const wheels = new Graphics();
  for (const x of [-0.45, 0.45]) {
    wheels.circle(x, -0.28, 0.28).fill(0x3a2a1a);
    wheels.circle(x, -0.28, 0.18).stroke({ width: 0.05, color: 0x8a6a4a });
  }
  rig.addChild(wheels, g);
  let roll = 0;
  return {
    root,
    height: 1.6,
    update(a: AnimState): void {
      rig.scale.x = Math.cos(a.facing) >= 0 ? 1 : -1;
      roll += a.speed * a.dt * 2;
      wheels.y = Math.sin(roll * 3) * 0.02;
      rig.rotation = a.attackT !== null && a.attackT > 0.6 ? -0.08 * rig.scale.x : 0;
    },
  };
}

// ————————————————————————— 建筑与木桩 —————————————————————————

export function towerModel(team: number, glowTex: Texture): Model & { orb: Container } {
  const tc = PALETTE.team[team as 0 | 1] ?? 0xffffff;
  const root = new Container();
  const g = new Graphics();
  // 底座
  g.ellipse(0, 0, 1.6, 0.75).fill(0x4a4e56);
  g.ellipse(0, -0.12, 1.45, 0.65).fill(0x6a6f78);
  // 塔身（收窄的石柱）
  g.poly([-0.95, -0.2, 0.95, -0.2, 0.62, -3.1, -0.62, -3.1]).fill(0x7c828d);
  g.poly([0.2, -0.2, 0.95, -0.2, 0.62, -3.1, 0.12, -3.1]).fill(0x5d626c);
  for (let i = 1; i < 6; i++) {
    const y = -0.2 - i * 0.5;
    const hw = 0.95 - (0.33 * i * 0.5) / 2.9;
    g.moveTo(-hw, y).lineTo(hw, y).stroke({ width: 0.04, color: 0x3e424a, alpha: 0.7 });
  }
  g.rect(-0.8, -1.4, 1.6, 0.18).fill(tc);
  // 顶部火盆
  g.poly([-0.95, -3.05, 0.95, -3.05, 0.7, -3.45, -0.7, -3.45]).fill(0x4a4e56);
  g.rect(-0.95, -3.12, 1.9, 0.1).fill(tc);
  root.addChild(g);
  // 悬浮的能量晶球
  const orb = new Container();
  orb.position.set(0, -4.05);
  const glow = new Sprite(glowTex);
  glow.anchor.set(0.5);
  glow.width = glow.height = 2.2;
  glow.tint = tc;
  glow.blendMode = 'add';
  const og = new Graphics();
  og.poly([0, -0.55, 0.36, 0, 0, 0.45, -0.36, 0]).fill(tc);
  og.poly([0, -0.55, 0.12, 0, 0, 0.45]).fill({ color: 0xffffff, alpha: 0.45 });
  orb.addChild(glow, og);
  root.addChild(orb);
  return {
    root,
    orb,
    height: 4.8,
    update(a: AnimState): void {
      orb.y = -4.05 + Math.sin(a.now / 500) * 0.12;
      glow.alpha = 0.55 + Math.sin(a.now / 300) * 0.15 + (a.attackT !== null ? 0.3 : 0);
    },
  };
}

export function crystalModel(team: number, glowTex: Texture): Model {
  const tc = PALETTE.team[team as 0 | 1] ?? 0xffffff;
  const root = new Container();
  const g = new Graphics();
  g.ellipse(0, 0, 2.6, 1.2).fill(0x3e424a);
  g.ellipse(0, -0.2, 2.3, 1.02).fill(0x6a6f78);
  g.ellipse(0, -0.2, 1.6, 0.7).fill(darker(tc, 0.45));
  for (const x of [-1.7, 1.7]) {
    g.rect(x - 0.2, -2.4, 0.4, 2.3).fill(0x7c828d);
    g.rect(x - 0.28, -2.55, 0.56, 0.2).fill(tc);
  }
  root.addChild(g);
  const core = new Container();
  core.position.set(0, -3.1);
  const glow = new Sprite(glowTex);
  glow.anchor.set(0.5);
  glow.width = glow.height = 5;
  glow.tint = tc;
  glow.blendMode = 'add';
  const cg = new Graphics();
  cg.poly([0, -1.5, 0.85, -0.2, 0, 1.2, -0.85, -0.2]).fill(tc);
  cg.poly([0, -1.5, 0.3, -0.2, 0, 1.2]).fill({ color: 0xffffff, alpha: 0.5 });
  cg.poly([0, -1.5, -0.85, -0.2, -0.3, -0.2]).fill({ color: 0x000000, alpha: 0.15 });
  const ring = new Graphics();
  ring.ellipse(0, 0.2, 1.5, 0.45).stroke({ width: 0.08, color: 0xffffff, alpha: 0.7 });
  core.addChild(glow, cg, ring);
  root.addChild(core);
  return {
    root,
    height: 5.2,
    update(a: AnimState): void {
      core.y = -3.1 + Math.sin(a.now / 600) * 0.18;
      cg.scale.x = 0.85 + Math.abs(Math.sin(a.now / 1400)) * 0.15;
      ring.rotation = Math.sin(a.now / 900) * 0.15;
      glow.alpha = 0.6 + Math.sin(a.now / 400) * 0.15;
    },
  };
}

export function dummyModel(): Model & { wobble: (k: number) => void } {
  const root = new Container();
  const rig = new Container();
  root.addChild(rig);
  const g = new Graphics();
  g.ellipse(0, 0, 0.55, 0.22).fill(0x5a3e24);
  g.rect(-0.07, -1.9, 0.14, 1.9).fill(0x7a5230);
  g.rect(-0.65, -1.45, 1.3, 0.12).fill(0x7a5230);
  g.ellipse(0, -1.2, 0.42, 0.55).fill(0xd8c48a);
  g.ellipse(0, -1.2, 0.42, 0.55).stroke({ width: 0.04, color: 0x9a8450 });
  g.circle(0, -1.2, 0.3).fill(0xf2f2f2);
  g.circle(0, -1.2, 0.2).fill(0xd84a3a);
  g.circle(0, -1.2, 0.09).fill(0xf2f2f2);
  g.circle(0, -1.95, 0.24).fill(0xd8c48a);
  g.rect(-0.3, -2.02, 0.6, 0.06).fill(0xd84a3a);
  rig.addChild(g);
  let w = 0;
  let wv = 0;
  return {
    root,
    height: 2.3,
    wobble(k: number): void {
      wv += k;
    },
    update(a: AnimState): void {
      // 被打时摇晃（阻尼弹簧）
      wv += -w * 60 * a.dt;
      wv *= Math.exp(-a.dt * 5);
      w += wv * a.dt;
      rig.rotation = w;
    },
  };
}
