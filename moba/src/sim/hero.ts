import { BALANCE } from '../data/balance';
import { getHero } from '../data/heroes';
import type { SkillDef, SkillStage } from '../data/schema';
import type { Unit } from './entity';
import { statsAtLevel } from './stats';
import type { World } from './world';

/**
 * 英雄成长：升级、技能加点规则。
 *   - 1~15 级，每级 1 个技能点
 *   - 普通技能等级 ≤ ⌈英雄等级 / 2⌉，最高 6 级
 *   - 大招只能在 4 / 8 / 12 级各加 1 点，最高 3 级
 */

export function skillDef(u: Unit, slot: 0 | 1 | 2): SkillDef {
  return getHero(u.defId).skills[slot];
}

/** 当前应施放的技能段（二段技能窗口期内返回下一段） */
export function currentStage(u: Unit, slot: 0 | 1 | 2): { stage: SkillStage; idx: number } {
  const def = skillDef(u, slot);
  const rc = u.hero?.recast[slot];
  if (rc && def.recast) {
    const st = def.recast.stages[rc.next];
    if (st) return { stage: st, idx: rc.next };
  }
  return { stage: def, idx: -1 };
}

/** 某英雄等级下，该技能允许的最高等级 */
export function skillLevelCap(u: Unit, slot: 0 | 1 | 2): number {
  const def = skillDef(u, slot);
  const level = u.hero!.level;
  if (def.ult) return Math.min(def.maxLevel, BALANCE.ultLevels.filter((l) => l <= level).length);
  return Math.min(def.maxLevel, Math.ceil(level / 2));
}

export function canLevelSkill(u: Unit, slot: 0 | 1 | 2): boolean {
  const h = u.hero;
  if (!h || h.skillPoints <= 0) return false;
  return h.skillLevels[slot] < skillLevelCap(u, slot);
}

export function levelSkill(w: World, u: Unit, slot: 0 | 1 | 2): boolean {
  if (!canLevelSkill(u, slot)) return false;
  const h = u.hero!;
  h.skillPoints--;
  h.skillLevels[slot]++;
  w.emit({ t: 'skillUp', unit: u.id, slot, level: h.skillLevels[slot] });
  return true;
}

export function levelUp(w: World, u: Unit): boolean {
  const h = u.hero;
  if (!h || h.level >= BALANCE.maxLevel) return false;
  h.level++;
  h.skillPoints++;
  const def = getHero(u.defId);
  u.baseStats = statsAtLevel(def.base, def.growth, h.level);
  u.statsDirty = true;
  w.emit({ t: 'levelUp', unit: u.id, level: h.level });
  return true;
}

/** 按配置的加点顺序自动加点（AI 与初始化用；大招优先） */
export function autoLevelSkills(w: World, u: Unit): void {
  const h = u.hero;
  if (!h) return;
  const order = getHero(u.defId).skillOrder;
  let guard = 20;
  while (h.skillPoints > 0 && guard-- > 0) {
    if (levelSkill(w, u, 2)) continue;
    let done = false;
    for (const s of order) {
      if (levelSkill(w, u, s)) {
        done = true;
        break;
      }
    }
    if (!done) {
      for (const s of [0, 1] as const) if (!done && levelSkill(w, u, s)) done = true;
    }
    if (!done) break;
  }
}
