import { BALANCE } from '../data/balance';
import { STAT_KEYS, type StatBlock, type StatMods } from '../data/schema';
import { getBuff } from '../data/units';
import type { Unit } from './entity';

/** 某等级下的基础属性 = 1 级属性 + 成长 × (等级 − 1) */
export function statsAtLevel(base: StatBlock, growth: StatMods, level: number): StatBlock {
  const out = { ...base };
  for (const k of STAT_KEYS) {
    const g = growth[k];
    if (g) out[k] = base[k] + g * (level - 1);
  }
  return out;
}

/**
 * 汇总最终属性：(基础 + 固定加成) × (1 + 百分比加成)。
 * 固定加成来自装备与增益，百分比加成来自增益（按层数叠加）。
 * 最大生命 / 法力变化时，当前值按差值同步增减。
 */
export function recomputeStats(u: Unit, extraFlat: readonly StatMods[] = []): void {
  const flat: StatMods = {};
  const pct: StatMods = {};
  for (const m of extraFlat) addMods(flat, m, 1);
  for (const b of u.buffs) {
    const def = getBuff(b.id);
    if (def.stats) addMods(flat, def.stats, b.stacks);
    if (def.statsPct) addMods(pct, def.statsPct, b.stacks);
  }
  const prevMaxHp = u.stats.maxHp;
  const prevMaxMp = u.stats.maxMp;
  const s = {} as StatBlock;
  for (const k of STAT_KEYS) {
    s[k] = (u.baseStats[k] + (flat[k] ?? 0)) * (1 + (pct[k] ?? 0));
  }
  u.stats = s;
  u.bonusAd = s.ad - u.baseStats.ad;
  if (u.alive) {
    if (s.maxHp > prevMaxHp) u.hp += s.maxHp - prevMaxHp;
    if (s.maxMp > prevMaxMp) u.mp += s.maxMp - prevMaxMp;
  }
  u.hp = Math.min(u.hp, s.maxHp);
  u.mp = Math.min(u.mp, s.maxMp);
  u.statsDirty = false;
}

function addMods(into: StatMods, m: StatMods, times: number): void {
  for (const k of STAT_KEYS) {
    const v = m[k];
    if (v) into[k] = (into[k] ?? 0) + v * times;
  }
}

/** 攻击间隔（秒）：基础间隔 ÷ (1 + 攻速加成)，受每秒最多攻击次数限制 */
export function attackInterval(baseInterval: number, attackSpeed: number): number {
  return Math.max(baseInterval / (1 + attackSpeed), 1 / BALANCE.maxAttacksPerSec);
}

/** 实际冷却 = 基础冷却 × (1 − 冷却缩减)，冷却缩减有上限 */
export function effectiveCooldown(base: number, cdr: number): number {
  return base * (1 - Math.min(Math.max(cdr, 0), BALANCE.cdrCap));
}

/** 当前移速：受最强的减速影响，有下限 */
export function currentMoveSpeed(u: Unit): number {
  let slow = 0;
  for (const s of u.status.slows) if (s.power > slow) slow = s.power;
  return Math.max(u.stats.moveSpeed * (1 - slow), Math.min(u.stats.moveSpeed, BALANCE.minMoveSpeed));
}
