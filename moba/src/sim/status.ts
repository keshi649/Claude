import { norm, type Vec2 } from '../core/vec2';
import type { CcKind } from '../data/schema';
import { getBuff } from '../data/units';
import type { EntityId, Unit } from './entity';
import type { World } from './world';

/**
 * 状态与控制：眩晕 / 击飞 / 沉默 / 减速 / 击退，以及增益的增删。
 * 规则：
 *   - 硬控（眩晕、击飞）叠加时取剩余时间更长的，不累加
 *   - 减速同时存在多个时只取最强的
 *   - 硬控和击退会打断施法前摇、普攻前摇和主动位移
 *   - 建筑免疫一切控制；无敌单位免疫控制
 */

export const isStructure = (u: Unit): boolean => u.kind === 'tower' || u.kind === 'crystal';

/** 能否行动（移动 / 普攻 / 施法的前提） */
export function canAct(u: Unit): boolean {
  return u.alive && u.status.stun <= 0 && u.status.airborne <= 0 && !(u.forced && u.forced.kind === 'knockback');
}

export function canCast(u: Unit): boolean {
  return canAct(u) && u.status.silence <= 0;
}

export function isUntargetable(u: Unit): boolean {
  if (u.innate.untargetable || (u.forced !== null && u.forced.untargetable)) return true;
  for (const b of u.buffs) if (getBuff(b.id).flags?.untargetable) return true;
  return false;
}

export function isInvulnerable(u: Unit): boolean {
  if (u.innate.invulnerable) return true;
  for (const b of u.buffs) if (getBuff(b.id).flags?.invulnerable) return true;
  return false;
}

/** 可被选为目标（存活且可选中） */
export function isTargetable(u: Unit): boolean {
  return u.alive && !isUntargetable(u);
}

/** 打断：取消施法、普攻前摇与主动位移 */
export function interrupt(u: Unit): void {
  if (u.cast) u.cast = null;
  if (u.hero) u.hero.recall = 0;
  u.queuedCast = null;
  u.attack.windup = 0;
  if (u.forced && u.forced.kind === 'dash') u.forced = null;
}

export function applyCc(
  w: World,
  src: Unit | null,
  target: Unit,
  cc: CcKind,
  duration: number,
  power: number,
  origin: Vec2,
  wallStun = 0,
): void {
  if (!target.alive || isStructure(target) || isInvulnerable(target)) return;
  const st = target.status;
  switch (cc) {
    case 'stun':
      st.stun = Math.max(st.stun, duration);
      interrupt(target);
      break;
    case 'airborne':
      if (duration > st.airborne) {
        st.airborne = duration;
        st.airborneTotal = duration;
      }
      interrupt(target);
      break;
    case 'silence':
      st.silence = Math.max(st.silence, duration);
      if (target.cast && target.cast.phase !== 'recovery') target.cast = null;
      target.queuedCast = null;
      break;
    case 'slow':
      st.slows.push({ power: Math.min(Math.max(power, 0), 0.9), remaining: duration });
      break;
    case 'knockback': {
      let d = norm({ x: target.pos.x - origin.x, y: target.pos.y - origin.y });
      if (d.x === 0 && d.y === 0) {
        const f = src ? src.facing : target.facing + Math.PI;
        d = { x: Math.cos(f), y: Math.sin(f) };
      }
      interrupt(target);
      target.forced = {
        kind: 'knockback',
        dirX: d.x,
        dirY: d.y,
        speed: power / Math.max(duration, 0.05),
        remaining: power,
        targetId: 0,
        stopDist: 0,
        hitIds: [],
        untargetable: false,
        wallStun,
        sourceId: src?.id ?? 0,
      };
      break;
    }
  }
  w.emit({ t: 'cc', target: target.id, cc, duration });
}

// ————————————————————————— 增益 —————————————————————————

export function hasBuff(u: Unit, id: string, sourceId?: EntityId): boolean {
  return u.buffs.some((b) => b.id === id && (sourceId === undefined || b.sourceId === sourceId));
}

/**
 * 施加增益。标记类（mark）按施加者区分；其它同 id 增益刷新时长并叠层。
 */
export function addBuff(
  w: World,
  target: Unit,
  id: string,
  sourceId: EntityId,
  duration: number,
  stacks = 1,
  rank = 1,
): void {
  if (!target.alive) return;
  const def = getBuff(id);
  const existing = target.buffs.find((b) => b.id === id && (def.kind !== 'mark' || b.sourceId === sourceId));
  if (existing) {
    existing.remaining = Math.max(existing.remaining, duration);
    existing.stacks = Math.min(def.maxStacks ?? 1, existing.stacks + stacks);
    existing.rank = rank;
    existing.sourceId = sourceId;
  } else {
    target.buffs.push({
      id,
      sourceId,
      stacks: Math.min(def.maxStacks ?? 1, stacks),
      remaining: duration,
      acc: 0,
      rank,
    });
  }
  if (def.stats || def.statsPct) target.statsDirty = true;
  w.emit({ t: 'buffAdd', unit: target.id, buff: id });
}

export function removeBuff(target: Unit, id: string, sourceId?: EntityId): void {
  const before = target.buffs.length;
  target.buffs = target.buffs.filter((b) => !(b.id === id && (sourceId === undefined || b.sourceId === sourceId)));
  if (target.buffs.length !== before) {
    const def = getBuff(id);
    if (def.stats || def.statsPct) target.statsDirty = true;
  }
}
