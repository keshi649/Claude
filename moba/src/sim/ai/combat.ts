import type { Rng } from '../../core/rng';
import { norm, type Vec2 } from '../../core/vec2';
import { getHero } from '../../data/heroes';
import type { AiTag, Effect, SkillDef, SkillStage } from '../../data/schema';
import { getSummoner } from '../../data/summoners';
import type { Aim } from '../commands';
import type { Unit } from '../entity';
import { currentStage } from '../hero';
import { isStructure } from '../status';
import { attackInterval } from '../stats';
import type { World } from '../world';
import type { DifficultyParams } from './difficulty';

/**
 * AI 战斗辅助：战力估算、目标选择、预判瞄准、技能使用规则（完全由技能的 AI 标签驱动）。
 */

/** 粗略战力：有效生命 × 输出能力 */
export function power(u: Unit): number {
  if (!u.alive) return 0;
  const s = u.stats;
  const shield = u.shields.reduce((a, b) => a + b.amount, 0);
  const ehp = (u.hp + shield) * (1 + (s.armor + s.mr) / 1200);
  const interval = u.kind === 'hero' ? attackInterval(getHero(u.defId).attack.interval, s.attackSpeed) : 1.2;
  const dps = (s.ad * (1 + s.crit * (s.critDmg - 1))) / interval + s.ap * 0.9 + (u.hero ? u.hero.level * 30 : 0);
  return Math.sqrt(ehp * dps);
}

/** 目标价值：残血、脆皮、输出位优先，距离近优先 */
export function targetScore(self: Unit, t: Unit): number {
  const d = Math.hypot(t.pos.x - self.pos.x, t.pos.y - self.pos.y);
  const hpPct = t.hp / t.stats.maxHp;
  let s = (1 - hpPct) * 3 - d * 0.15 - t.stats.armor / 400;
  if (t.hero) {
    const role = getHero(t.defId).role;
    if (role === 'marksman' || role === 'mage') s += 0.8;
    if (role === 'tank') s -= 0.6;
  }
  return s;
}

/** 估算技能从释放到命中的时间（用于预判） */
function hitTime(stage: SkillStage, dist: number): number {
  let t = stage.windup;
  const walk = (effects: readonly Effect[]): void => {
    for (const e of effects) {
      if (e.t === 'projectile') t += dist / e.speed;
      else if (e.t === 'area' && e.delay) t += e.delay;
      else if (e.t === 'dash') t += dist / e.speed;
    }
  };
  walk(stage.effects);
  return t;
}

/** 目标当前速度（由上一帧位移得出，只用可见信息） */
function velocityOf(w: World, t: Unit): Vec2 {
  return { x: (t.pos.x - t.prevPos.x) / w.dt, y: (t.pos.y - t.prevPos.y) / w.dt };
}

/** 计算对目标的瞄准：按难度决定是否预判、叠加瞄准误差 */
export function aimAt(w: World, self: Unit, stage: SkillStage, t: Unit, diff: DifficultyParams, rng: Rng): Aim {
  if (stage.targeting === 'unit') return { k: 'unit', id: t.id };
  if (stage.targeting === 'self') return { k: 'auto' };
  let p = { ...t.pos };
  if (diff.predict) {
    const v = velocityOf(w, t);
    const time = hitTime(stage, Math.hypot(t.pos.x - self.pos.x, t.pos.y - self.pos.y));
    p = { x: p.x + v.x * time, y: p.y + v.y * time };
  }
  p = { x: p.x + rng.gauss() * diff.aimError, y: p.y + rng.gauss() * diff.aimError };
  if (stage.targeting === 'point') return { k: 'point', x: p.x, y: p.y };
  const d = norm({ x: p.x - self.pos.x, y: p.y - self.pos.y });
  return { k: 'dir', x: d.x || 1, y: d.y };
}

/** 技能的有效作用距离（落点 / 方向技能取施法距离，自身技能取范围半径） */
export function skillReach(stage: SkillStage): number {
  if (stage.targeting === 'self') {
    const ind = stage.indicator;
    return ind.k === 'self' ? ind.r : 2;
  }
  return stage.range;
}

export interface SkillChoice {
  slot: 0 | 1 | 2;
  aim: Aim;
  charge: boolean;
}

export interface CombatCtx {
  w: World;
  self: Unit;
  target: Unit | null;
  enemies: Unit[];
  allies: Unit[];
  /** 当前意图：进攻 / 撤退 / 清线 / 打野 */
  intent: 'fight' | 'retreat' | 'farm' | 'jungle' | 'poke';
  diff: DifficultyParams;
  rng: Rng;
  /** 附近可被技能打到的敌方单位（小兵 / 野怪） */
  creeps: Unit[];
}

function has(tags: readonly AiTag[], ...t: AiTag[]): boolean {
  return t.some((x) => tags.includes(x));
}

/** 从三个技能里挑一个现在该放的（没有返回 null） */
export function chooseSkill(c: CombatCtx): SkillChoice | null {
  const { self, target, w } = c;
  const h = self.hero!;
  const hpPct = self.hp / self.stats.maxHp;
  const def = getHero(self.defId);
  // 大招优先判断，其次技能 1、2
  for (const slot of [2, 0, 1] as const) {
    const sk: SkillDef = def.skills[slot];
    if (h.skillLevels[slot] <= 0) continue;
    const { stage, idx } = currentStage(self, slot);
    const rc = h.recast[slot];
    if (!rc && h.cooldowns[slot] > 0) continue;
    const cost = rc ? 0 : (sk.cost[Math.min(h.skillLevels[slot] - 1, sk.cost.length - 1)] ?? 0);
    if (self.mp < cost) continue;
    const tags = sk.ai.tags;
    const reach = skillReach(stage);
    const charge = !!sk.charge && idx === -1;

    // 撤退：用位移技能拉开距离
    if (c.intent === 'retreat') {
      if (has(tags, 'escape') && stage.targeting === 'direction' && c.enemies.length) {
        const e = c.enemies[0]!;
        const away = norm({ x: self.pos.x - e.pos.x, y: self.pos.y - e.pos.y });
        return { slot, aim: { k: 'dir', x: away.x, y: away.y }, charge };
      }
      if (has(tags, 'shield', 'heal') && hpPct < 0.6) return { slot, aim: { k: 'auto' }, charge };
      continue;
    }

    // 治疗 / 护盾：自己或身边友军血量偏低且有敌人时
    if (has(tags, 'shield', 'heal') && c.enemies.length > 0) {
      const hurt = c.allies.filter((a) => a.hp / a.stats.maxHp < 0.65).sort((a, b) => a.hp / a.stats.maxHp - b.hp / b.stats.maxHp)[0];
      if (hurt && stage.targeting === 'unit' && (stage.unitFilter === 'any' || stage.unitFilter === 'ally')) {
        if (Math.hypot(hurt.pos.x - self.pos.x, hurt.pos.y - self.pos.y) <= stage.range) return { slot, aim: { k: 'unit', id: hurt.id }, charge };
      } else if (hurt && (stage.targeting === 'self' || stage.targeting === 'point')) {
        const aim: Aim = stage.targeting === 'point' ? { k: 'point', x: hurt.pos.x, y: hurt.pos.y } : { k: 'auto' };
        if (Math.hypot(hurt.pos.x - self.pos.x, hurt.pos.y - self.pos.y) <= Math.max(reach, 2)) return { slot, aim, charge };
      }
    }

    // 对英雄
    if (target && target.hero && (c.intent === 'fight' || c.intent === 'poke')) {
      const d = Math.hypot(target.pos.x - self.pos.x, target.pos.y - self.pos.y) - target.radius;
      const tHp = target.hp / target.stats.maxHp;
      const inReach = d <= reach + (stage.targeting === 'self' ? 0 : 0.3);
      if (!inReach) {
        // 突进技能用来接近
        if (c.intent === 'fight' && has(tags, 'gapclose', 'engage') && d <= reach + 2 && stage.targeting !== 'self') {
          return { slot, aim: aimAt(w, self, stage, target, c.diff, c.rng), charge };
        }
        continue;
      }
      if (c.intent === 'poke' && !has(tags, 'poke')) continue;
      if (has(tags, 'execute') && tHp > 0.45 && slot === 2 && c.enemies.length < 2) continue;
      // 群体技能：尽量等到能打到 2 人以上（残血目标例外）
      if (slot === 2 && has(tags, 'aoe') && !has(tags, 'engage', 'execute') && c.enemies.length < 2 && tHp > 0.4) continue;
      return { slot, aim: aimAt(w, self, stage, target, c.diff, c.rng), charge };
    }

    // 清线 / 打野：范围技能打小兵或野怪
    if ((c.intent === 'farm' || c.intent === 'jungle') && has(tags, 'farm', 'aoe', 'poke') && slot !== 2) {
      const mpOk = c.intent === 'jungle' ? self.mp / self.stats.maxMp > 0.25 : self.mp / self.stats.maxMp > 0.55;
      if (!mpOk) continue;
      const near = c.creeps.filter((m) => Math.hypot(m.pos.x - self.pos.x, m.pos.y - self.pos.y) <= reach + 0.5);
      if (near.length >= (c.intent === 'jungle' ? 1 : 3)) {
        const m = near.reduce((a, b) => (a.hp > b.hp ? a : b));
        if (stage.targeting === 'unit' && isStructure(m)) continue;
        if (stage.targeting === 'unit' && stage.unitFilter === 'any') continue;
        return { slot, aim: aimAt(w, self, stage, m, { ...c.diff, predict: false }, c.rng), charge };
      }
    }
  }
  return null;
}

/** 召唤师技能的使用：返回瞄准（null 表示现在不用） */
export function chooseSummoner(c: CombatCtx): Aim | null {
  const h = c.self.hero!;
  if (h.summoner.cd > 0) return null;
  const s = getSummoner(h.summoner.id);
  const self = c.self;
  const hpPct = self.hp / self.stats.maxHp;
  switch (s.id) {
    case 'blink': {
      if (c.intent === 'retreat' && hpPct < 0.25 && c.enemies.some((e) => Math.hypot(e.pos.x - self.pos.x, e.pos.y - self.pos.y) < 4)) {
        const e = c.enemies[0]!;
        const away = norm({ x: self.pos.x - e.pos.x, y: self.pos.y - e.pos.y });
        return { k: 'dir', x: away.x, y: away.y };
      }
      const t = c.target;
      if (c.intent === 'fight' && t && t.hero && t.hp / t.stats.maxHp < 0.2) {
        const d = Math.hypot(t.pos.x - self.pos.x, t.pos.y - self.pos.y);
        if (d > self.stats.range + 1 && d < self.stats.range + 4.5) {
          const dir = norm({ x: t.pos.x - self.pos.x, y: t.pos.y - self.pos.y });
          return { k: 'dir', x: dir.x, y: dir.y };
        }
      }
      return null;
    }
    case 'heal':
      return hpPct < 0.3 && c.enemies.length > 0 ? { k: 'auto' } : null;
    case 'sprint':
      return (c.intent === 'retreat' && c.enemies.length > 0) || (c.intent === 'fight' && c.target && Math.hypot(c.target.pos.x - self.pos.x, c.target.pos.y - self.pos.y) > 6)
        ? { k: 'auto' }
        : null;
    case 'smite': {
      // 猎击：大野怪 / Boss 血量低于猎击伤害时补掉
      const e0 = s.stage.effects[0];
      const dmg = e0 && e0.t === 'damage' ? (e0.amount.base[Math.min(h.level - 1, e0.amount.base.length - 1)] ?? 0) : 0;
      for (const m of c.creeps) {
        if (m.kind !== 'monster') continue;
        const big = m.stats.maxHp > 2000;
        const d = Math.hypot(m.pos.x - self.pos.x, m.pos.y - self.pos.y) - m.radius;
        if (big && d <= s.stage.range && m.hp <= dmg) return { k: 'unit', id: m.id };
      }
      return null;
    }
  }
  return null;
}
