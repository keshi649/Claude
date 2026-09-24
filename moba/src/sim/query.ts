import { BALANCE } from '../data/balance';
import type { Affects, Shape } from '../data/schema';
import type { Vec2 } from '../core/vec2';
import { isEnemy, type Team, type Unit } from './entity';
import { isInvulnerable, isStructure, isTargetable } from './status';
import type { AttackMode } from './commands';
import type { World } from './world';

/**
 * 查询与索敌：形状命中判定、普攻目标选择、技能自动瞄准。
 */

/** 英雄或训练木桩（木桩用来模拟英雄，参与“优先英雄”的判定） */
export const isHeroLike = (u: Unit): boolean => u.kind === 'hero' || u.kind === 'dummy';

/** 圆心距减去目标半径（普攻射程按到目标边缘计算） */
export function edgeDist(a: Unit, b: Unit): number {
  return Math.hypot(a.pos.x - b.pos.x, a.pos.y - b.pos.y) - b.radius;
}

/** 单位（圆）是否与形状相交 */
export function inShape(shape: Shape, ox: number, oy: number, dx: number, dy: number, u: Unit): boolean {
  const px = u.pos.x - ox;
  const py = u.pos.y - oy;
  const d = Math.hypot(px, py);
  const ur = u.radius;
  switch (shape.k) {
    case 'circle':
      return d <= shape.r + ur;
    case 'ring':
      return d <= shape.r + ur && d >= shape.inner - ur;
    case 'cone': {
      if (d > shape.r + ur) return false;
      if (d <= ur) return true;
      const cos = (px * dx + py * dy) / d;
      const ang = Math.acos(Math.max(-1, Math.min(1, cos)));
      // 单位半径带来的角度宽容
      const slack = Math.asin(Math.min(1, ur / d));
      return ang <= (shape.angle * Math.PI) / 360 + slack;
    }
    case 'rect': {
      const along = px * dx + py * dy;
      const perp = Math.abs(-px * dy + py * dx);
      return along >= -ur && along <= shape.length + ur && perp <= shape.width / 2 + ur;
    }
  }
}

/** 形状的外接半径（用于空间查询） */
export function shapeReach(shape: Shape): number {
  switch (shape.k) {
    case 'circle':
    case 'ring':
    case 'cone':
      return shape.r;
    case 'rect':
      return Math.hypot(shape.length, shape.width / 2);
  }
}

/** 阵营筛选 */
export function affectsOk(affects: Affects, team: Team, casterId: number, u: Unit): boolean {
  switch (affects) {
    case 'enemies':
      return u.team !== team;
    case 'allies':
      return u.team === team && u.id !== casterId;
    case 'alliesAndSelf':
      return u.team === team;
    case 'all':
      return true;
  }
}

const tmp: Unit[] = [];

/** 形状内满足阵营筛选、可被选中的单位（建筑不受技能影响） */
export function unitsInShape(
  w: World,
  shape: Shape,
  origin: Vec2,
  dir: Vec2,
  team: Team,
  casterId: number,
  affects: Affects,
): Unit[] {
  const out: Unit[] = [];
  w.spatial.query(origin.x, origin.y, shapeReach(shape), tmp);
  for (const u of tmp) {
    if (!isTargetable(u) || isStructure(u)) continue;
    if (!affectsOk(affects, team, casterId, u)) continue;
    if (inShape(shape, origin.x, origin.y, dir.x, dir.y, u)) out.push(u);
  }
  return out;
}

/** 普攻目标分级：0 英雄 / 木桩，1 小兵 / 野怪 / 召唤物，2 建筑 */
function attackTier(u: Unit): number {
  if (isHeroLike(u)) return 0;
  if (isStructure(u)) return 2;
  return 1;
}

export function validAttackTarget(attacker: Unit, t: Unit | undefined, mode: AttackMode): t is Unit {
  if (!t || !isTargetable(t) || !isEnemy(attacker, t)) return false;
  // 无敌的建筑（前一座塔还在）不作为普攻目标
  if (isStructure(t) && isInvulnerable(t)) return false;
  if (mode === 'farm') return t.kind === 'minion' || t.kind === 'monster';
  if (mode === 'tower') return isStructure(t);
  return true;
}

/**
 * 选择普攻目标。
 *   auto：在“射程 + 索敌距离”内，英雄优先，其次小兵野怪，最后建筑；同级取最近
 *   farm：只选小兵和野怪，优先射程内血量最低的（补刀）
 */
export function pickAttackTarget(w: World, u: Unit, mode: AttackMode): Unit | null {
  const search = u.stats.range + BALANCE.acquireBonus;
  w.spatial.query(u.pos.x, u.pos.y, search, tmp);
  let best: Unit | null = null;
  let bestKey = Infinity;
  for (const t of tmp) {
    if (!validAttackTarget(u, t, mode)) continue;
    const d = edgeDist(u, t);
    let key: number;
    if (mode === 'farm') {
      const inRange = d <= u.stats.range ? 0 : 1;
      key = inRange * 1e7 + t.hp;
    } else {
      key = attackTier(t) * 1e4 + d;
    }
    if (key < bestKey) {
      bestKey = key;
      best = t;
    }
  }
  return best;
}

/**
 * 技能自动瞄准：射程（+ 少量余量）内最近的敌方英雄；
 * 没有英雄时取最近的非建筑敌方单位；都没有返回 null。
 */
export function pickAutoAimTarget(
  w: World,
  u: Unit,
  range: number,
  filter: 'enemy' | 'ally' | 'any' = 'enemy',
): Unit | null {
  const search = range + BALANCE.autoAimBonus;
  w.spatial.query(u.pos.x, u.pos.y, search, tmp);
  let best: Unit | null = null;
  let bestKey = Infinity;
  for (const t of tmp) {
    if (t === u || !isTargetable(t) || isStructure(t)) continue;
    if (filter === 'enemy' && !isEnemy(u, t)) continue;
    if (filter === 'ally' && isEnemy(u, t)) continue;
    const d = Math.hypot(t.pos.x - u.pos.x, t.pos.y - u.pos.y);
    const key = (isHeroLike(t) ? 0 : 1e4) + d;
    if (key < bestKey) {
      bestKey = key;
      best = t;
    }
  }
  return best;
}

/** 在施法距离内，选离某点最近的合法目标（电脑端鼠标指向） */
export function pickUnitNearPoint(
  w: World,
  u: Unit,
  point: Vec2,
  range: number,
  filter: 'enemy' | 'ally' | 'any',
): Unit | null {
  w.spatial.query(u.pos.x, u.pos.y, range + BALANCE.autoAimBonus, tmp);
  let best: Unit | null = null;
  let bestD = Infinity;
  for (const t of tmp) {
    if (t === u || !isTargetable(t) || isStructure(t)) continue;
    if (filter === 'enemy' && !isEnemy(u, t)) continue;
    if (filter === 'ally' && isEnemy(u, t)) continue;
    const d = Math.hypot(t.pos.x - point.x, t.pos.y - point.y) - t.radius;
    if (d < bestD) {
      bestD = d;
      best = t;
    }
  }
  return best;
}
