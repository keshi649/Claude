import { BALANCE } from '../../data/balance';
import { getHero } from '../../data/heroes';
import { getBuff, getUnitDef } from '../../data/units';
import { TOWER_RAMP } from '../../data/structures';
import type { AttackDef } from '../../data/schema';
import { applyDamage } from '../damage';
import type { Unit } from '../entity';
import type { AttackMode } from '../commands';
import { edgeDist, pickAttackTarget, validAttackTarget } from '../query';
import { firePassive, makeCtx, runEffects } from '../skills/effects';
import { attackInterval } from '../stats';
import { canAct, isStructure, isTargetable, removeBuff } from '../status';
import type { World } from '../world';

/**
 * 普攻系统。
 *   - 攻击命令：锁定 / 重新选择目标，并保持一小段时间（按住普攻键会持续发送）
 *   - 目标在射程内：站定出手（前摇结束才结算），否则追击
 *   - 攻击指令优先于摇杆移动；出手前摇期间不能移动
 */

export function attackDefOf(u: Unit): AttackDef | null {
  if (u.kind === 'hero') return getHero(u.defId).attack;
  return getUnitDef(u.defId).attack ?? null;
}

export function commandAttack(w: World, u: Unit, mode: AttackMode): void {
  if (!u.alive || !attackDefOf(u)) return;
  const a = u.attack;
  let t = w.get(a.orderTarget);
  const keep =
    a.orderMode === mode &&
    validAttackTarget(u, t, mode) &&
    edgeDist(u, t!) <= u.stats.range + BALANCE.acquireBonus;
  if (!keep) t = pickAttackTarget(w, u, mode) ?? undefined;
  if (!t) return;
  a.orderTarget = t.id;
  a.orderMode = mode;
  a.orderTime = BALANCE.attackOrderHold;
  // 普攻可以取消技能后摇
  if (u.cast && u.cast.phase === 'recovery') u.cast = null;
}

export function updateAttacks(w: World): void {
  const dt = w.dt;
  for (const u of w.list) {
    if (!u.alive) continue;
    const def = attackDefOf(u);
    if (!def) continue;
    const a = u.attack;
    u.chaseTarget = 0;
    if (a.cd > 0) a.cd -= dt;

    // 正在出手
    if (a.windup > 0) {
      const t = w.get(a.swingTarget);
      if (!t || !isTargetable(t) || !canAct(u) || edgeDist(u, t) > u.stats.range + 1.5) {
        a.windup = 0;
        continue;
      }
      u.facing = Math.atan2(t.pos.y - u.pos.y, t.pos.x - u.pos.x);
      a.windup -= dt;
      if (a.windup <= 0) fireAttack(w, u, t, def);
      continue;
    }

    if (a.orderTime <= 0) continue;
    a.orderTime -= dt;
    const t = w.get(a.orderTarget);
    if (!validAttackTarget(u, t, a.orderMode)) {
      a.orderTime = 0;
      continue;
    }
    const d = edgeDist(u, t);
    if (d <= u.stats.range) {
      u.facing = Math.atan2(t.pos.y - u.pos.y, t.pos.x - u.pos.x);
      const casting = u.cast !== null && u.cast.phase !== 'recovery';
      if (a.cd <= 0 && canAct(u) && !casting && !u.forced) {
        const interval = attackInterval(def.interval, u.stats.attackSpeed);
        a.cd = interval;
        a.windup = interval * def.windupRatio;
        a.swingTarget = t.id;
        if (u.cast) u.cast = null;
        w.emit({ t: 'attackStart', unit: u.id, target: t.id, windup: a.windup });
      }
    } else if (d <= u.stats.range + BALANCE.acquireBonus + BALANCE.chaseLimit) {
      u.chaseTarget = t.id;
    } else {
      a.orderTime = 0;
    }
  }
}

function fireAttack(w: World, u: Unit, t: Unit, def: AttackDef): void {
  const crit = w.rng.next() < u.stats.crit;
  if (def.projectile) {
    const dx = t.pos.x - u.pos.x;
    const dy = t.pos.y - u.pos.y;
    const d = Math.hypot(dx, dy) || 1;
    const o = { x: u.pos.x + (dx / d) * u.radius, y: u.pos.y + (dy / d) * u.radius };
    w.projectiles.push({
      id: w.nextId(),
      ownerId: u.id,
      team: u.team,
      pos: { ...o },
      prevPos: { ...o },
      dirX: dx / d,
      dirY: dy / d,
      speed: def.projectile.speed,
      remaining: 999,
      width: 0.2,
      pierce: false,
      affects: 'enemies',
      hitIds: [],
      onHit: [],
      onEnd: null,
      stopAtWall: false,
      vfx: def.projectile.vfx,
      ctx: makeCtx(u),
      homingTarget: t.id,
      isAttack: true,
      crit,
      dead: false,
    });
    return;
  }
  applyAttackHit(w, u, t, crit);
}

/** 普攻命中结算：伤害 → 增益的“普攻命中”效果 → 被动 */
export function applyAttackHit(w: World, u: Unit, t: Unit, crit: boolean): void {
  if (!t.alive) return;
  let raw = u.stats.ad * (crit ? u.stats.critDmg : 1);
  // 防御塔连续命中同一英雄，伤害递增
  if (isStructure(u)) {
    if (t.hero && u.rampTarget === t.id) u.rampStacks = Math.min(TOWER_RAMP.maxStacks, u.rampStacks + 1);
    else u.rampStacks = 0;
    u.rampTarget = t.hero ? t.id : 0;
    raw *= 1 + TOWER_RAMP.perHit * u.rampStacks;
  }
  applyDamage(w, u, t, raw, 'physical', { crit, isAttack: true, impact: crit ? 1 : 0 });
  if (!u.alive) return;
  for (const b of [...u.buffs]) {
    const bd = getBuff(b.id);
    if (!bd.onAttackHit) continue;
    runEffects(w, bd.onAttackHit, makeCtx(u, { targetId: t.id, rank: b.rank }));
    if (bd.consumeOnAttack) removeBuff(u, b.id);
  }
  firePassive(w, u, 'attackHit', t);
}
