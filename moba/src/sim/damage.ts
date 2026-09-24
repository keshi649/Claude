import { BALANCE } from '../data/balance';
import type { DamageType, Impact, StatBlock } from '../data/schema';
import type { Unit } from './entity';
import { isInvulnerable } from './status';
import type { World } from './world';

/** 有效防御 = 防御 × (1 − 百分比穿透) − 固定穿透，最低为 0 */
export function effectiveDefense(defense: number, flatPen: number, pctPen: number): number {
  return Math.max(0, defense * (1 - pctPen) - flatPen);
}

/** 防御收益递减：实际伤害 = 原伤害 × K ÷ (K + 有效防御) */
export function mitigate(raw: number, defense: number, k: number = BALANCE.defenseK): number {
  return (raw * k) / (k + Math.max(0, defense));
}

/** 计算经过防御与穿透后的伤害（不含护盾） */
export function computeDamage(
  raw: number,
  dtype: DamageType,
  attacker: StatBlock | null,
  target: StatBlock,
): number {
  if (dtype === 'true' || raw <= 0) return Math.max(0, raw);
  if (dtype === 'physical') {
    const def = effectiveDefense(target.armor, attacker?.armorPen ?? 0, attacker?.armorPenPct ?? 0);
    return mitigate(raw, def);
  }
  const def = effectiveDefense(target.mr, attacker?.mrPen ?? 0, attacker?.mrPenPct ?? 0);
  return mitigate(raw, def);
}

export interface DamageOpts {
  crit?: boolean;
  isAttack?: boolean;
  isSkill?: boolean;
  impact?: Impact;
}

/**
 * 对目标造成伤害：防御减免 → 护盾吸收 → 扣血 → 吸血 → 事件 / 死亡。
 * 返回最终造成的伤害（含被护盾吸收的部分）。
 */
export function applyDamage(
  w: World,
  src: Unit | null,
  target: Unit,
  raw: number,
  dtype: DamageType,
  opts: DamageOpts = {},
): number {
  if (!target.alive || isInvulnerable(target)) return 0;
  // 打野装：对野怪额外伤害
  if (src && target.kind === 'monster' && src.stats.monsterDmg > 0) raw *= 1 + src.stats.monsterDmg;
  let dmg = computeDamage(raw, dtype, src?.stats ?? null, target.stats);
  if (dmg <= 0) return 0;
  const total = dmg;

  // 护盾按施加顺序吸收
  for (const s of target.shields) {
    if (dmg <= 0) break;
    const absorbed = Math.min(s.amount, dmg);
    s.amount -= absorbed;
    dmg -= absorbed;
  }
  target.shields = target.shields.filter((s) => s.amount > 0.01);

  target.hp -= dmg;
  target.lastDamagedAt = w.time;
  if (src) target.lastAttacker = src.id;
  // 在草丛里造成伤害会暴露自己
  if (src) src.revealUntil = w.time + 1.2;
  // 英雄之间的伤害：记录助攻归属与转火信息，统计输出 / 承伤
  if (src?.hero) {
    src.hero.damageDealt += target.hero ? total : 0;
    if (target.kind === 'tower' || target.kind === 'crystal') src.hero.towerDamage += total;
    if (target.team !== src.team) {
      const ra = target.recentAttackers.find((a) => a.id === src.id);
      if (ra) ra.t = w.time;
      else target.recentAttackers.push({ id: src.id, t: w.time });
      if (target.hero) w.aggro.push({ attacker: src.id, victim: target.id, t: w.time });
    }
  }
  if (target.hero) target.hero.damageTaken += total;
  // 受伤打断回城与恢复
  if (target.hero) {
    if (target.hero.recall > 0) {
      target.hero.recall = 0;
      w.emit({ t: 'recall', unit: target.id, state: 'cancel', duration: 0 });
    }
    if (target.buffs.length) target.buffs = target.buffs.filter((b) => b.id !== 'restore');
  }
  if (target.innate.immortal && target.hp < 1) target.hp = 1;

  w.emit({
    t: 'damage',
    src: src?.id ?? 0,
    target: target.id,
    amount: total,
    dtype,
    crit: !!opts.crit,
    impact: opts.impact ?? 0,
    isAttack: !!opts.isAttack,
    x: target.pos.x,
    y: target.pos.y,
  });

  // 物理吸血
  if (src && src.alive && dtype === 'physical' && src.stats.lifesteal > 0) {
    heal(w, src, total * src.stats.lifesteal);
  }

  if (target.hp <= 0) w.killUnit(target, src);
  return total;
}

/** 治疗（不超过最大生命）。返回实际治疗量 */
export function heal(w: World, target: Unit, amount: number): number {
  if (!target.alive || amount <= 0) return 0;
  const before = target.hp;
  target.hp = Math.min(target.stats.maxHp, target.hp + amount);
  const healed = target.hp - before;
  if (healed >= 1) w.emit({ t: 'heal', target: target.id, amount: healed, x: target.pos.x, y: target.pos.y });
  return healed;
}

export function addShield(w: World, target: Unit, amount: number, duration: number, sourceId: number): void {
  if (!target.alive || amount <= 0) return;
  target.shields.push({ amount, remaining: duration, sourceId });
  w.emit({ t: 'shield', target: target.id, amount });
}

export function totalShield(u: Unit): number {
  let s = 0;
  for (const sh of u.shields) s += sh.amount;
  return s;
}
