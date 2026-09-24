import { byLevel } from './helpers';
import type { CampKind } from './map';
import { statBlock, type BuffDef, type UnitDef } from './schema';

/**
 * 野区：野怪、增益野怪、两个中立 Boss（全部原创）。
 * 野怪属于中立阵营：被打会反击，离营地太远或脱战后回营并回满血，死亡后定时重生。
 */
const M = (d: UnitDef): UnitDef => d;

export const MONSTERS: Record<string, UnitDef> = {
  lizard_king: M({ id: 'lizard_king', name: '苔甲蜥王', radius: 0.8, shape: 'beast', color: 0x6a8a3a, leash: 8,
    base: statBlock({ maxHp: 2600, ad: 85, armor: 60, mr: 40, moveSpeed: 3.2, range: 1.6 }), growthPerMin: { maxHp: 0.06, ad: 0.05 },
    attack: { interval: 1.4, windupRatio: 0.3 }, gold: 70, xp: 90 }),
  lizard: M({ id: 'lizard', name: '苔甲幼蜥', radius: 0.5, shape: 'beast', color: 0x8aa050, leash: 8,
    base: statBlock({ maxHp: 850, ad: 40, armor: 30, mr: 20, moveSpeed: 3.2, range: 1.3 }), growthPerMin: { maxHp: 0.06, ad: 0.05 },
    attack: { interval: 1.3, windupRatio: 0.3 }, gold: 25, xp: 30 }),
  wolf_alpha: M({ id: 'wolf_alpha', name: '灰鬃狼王', radius: 0.75, shape: 'beast', color: 0x7a7a88, leash: 8,
    base: statBlock({ maxHp: 2300, ad: 100, armor: 50, mr: 40, moveSpeed: 3.6, range: 1.6 }), growthPerMin: { maxHp: 0.06, ad: 0.05 },
    attack: { interval: 1.2, windupRatio: 0.3 }, gold: 65, xp: 85 }),
  wolf: M({ id: 'wolf', name: '灰鬃狼', radius: 0.5, shape: 'beast', color: 0x9a9aa8, leash: 8,
    base: statBlock({ maxHp: 900, ad: 45, armor: 25, mr: 20, moveSpeed: 3.6, range: 1.3 }), growthPerMin: { maxHp: 0.06, ad: 0.05 },
    attack: { interval: 1.1, windupRatio: 0.3 }, gold: 25, xp: 30 }),
  owl: M({ id: 'owl', name: '石羽鸮', radius: 0.5, shape: 'beast', color: 0xa08868, leash: 8,
    base: statBlock({ maxHp: 1000, ad: 50, armor: 30, mr: 30, moveSpeed: 3.2, range: 4 }), growthPerMin: { maxHp: 0.06, ad: 0.05 },
    attack: { interval: 1.5, windupRatio: 0.3, projectile: { speed: 14, vfx: { color: 0xd0b890, style: 'orb', size: 0.16 } } }, gold: 35, xp: 40 }),
  blue_deer: M({ id: 'blue_deer', name: '澄蓝灵鹿', radius: 1.0, shape: 'beast', color: 0x4a90e0, leash: 9,
    base: statBlock({ maxHp: 4600, ad: 110, armor: 70, mr: 70, moveSpeed: 3.4, range: 1.8 }), growthPerMin: { maxHp: 0.06, ad: 0.05 },
    attack: { interval: 1.3, windupRatio: 0.3 }, gold: 100, xp: 140, buffOnKill: { id: 'clear_stream', duration: 70 } }),
  red_golem: M({ id: 'red_golem', name: '焰心巨像', radius: 1.1, shape: 'beast', color: 0xd05a30, leash: 9,
    base: statBlock({ maxHp: 5000, ad: 130, armor: 80, mr: 60, moveSpeed: 3.2, range: 1.9 }), growthPerMin: { maxHp: 0.06, ad: 0.05 },
    attack: { interval: 1.4, windupRatio: 0.3 }, gold: 100, xp: 140, buffOnKill: { id: 'blazing_soul', duration: 70 } }),

  // —— 中立 Boss ——
  turtle: M({ id: 'turtle', name: '玄甲巨龟', radius: 2.0, shape: 'beast', color: 0x4a6a5a, leash: 7,
    base: statBlock({ maxHp: 11000, ad: 230, armor: 150, mr: 120, moveSpeed: 2.6, range: 2.8 }), growthPerMin: { maxHp: 0.05, ad: 0.04 },
    attack: { interval: 1.5, windupRatio: 0.35 }, gold: 150, xp: 250, reward: 'teamGoldXp',
    skill: { name: '震甲', every: 7, windup: 0.6, effects: [
      { t: 'area', shape: { k: 'circle', r: 4.5 }, at: 'caster', vfx: { color: 0x6ad0a0, style: 'slam' },
        onHit: [{ t: 'damage', dtype: 'magic', amount: { base: [260], targetMaxHp: 0.04 }, impact: 2 }, { t: 'cc', cc: 'slow', duration: 1.5, power: 0.4 }] },
    ] } }),
  dragon: M({ id: 'dragon', name: '霆角龙王', radius: 2.3, shape: 'beast', color: 0x5a4aa0, leash: 7,
    base: statBlock({ maxHp: 15000, ad: 300, armor: 170, mr: 150, moveSpeed: 2.6, range: 3.2 }), growthPerMin: { maxHp: 0.05, ad: 0.04 },
    attack: { interval: 1.5, windupRatio: 0.35 }, gold: 200, xp: 300, reward: 'vanguard',
    skill: { name: '雷息', every: 6, windup: 0.7, effects: [
      { t: 'area', shape: { k: 'cone', r: 7, angle: 80 }, at: 'caster', vfx: { color: 0xa0a0ff, style: 'slash' },
        onHit: [{ t: 'damage', dtype: 'magic', amount: { base: [320], targetMaxHp: 0.05 }, impact: 2 }, { t: 'cc', cc: 'knockback', duration: 0.25, power: 2 }] },
    ] } }),

  // —— 进化 Boss（对标手游 10 分钟后的强化版暴君 / 主宰）——
  ancient_turtle: M({ id: 'ancient_turtle', name: '苍岩古龟', radius: 2.2, shape: 'beast', color: 0x5a4a38, leash: 7,
    base: statBlock({ maxHp: 17000, ad: 320, armor: 190, mr: 160, moveSpeed: 2.6, range: 3 }), growthPerMin: { maxHp: 0.04, ad: 0.03 },
    attack: { interval: 1.4, windupRatio: 0.35 }, gold: 200, xp: 300, reward: 'teamGoldXp', teamReward: { gold: 200, xp: 350 },
    teamBuffOnKill: { id: 'ancient_blessing', duration: 90 },
    skill: { name: '岩崩', every: 6, windup: 0.6, effects: [
      { t: 'area', shape: { k: 'circle', r: 5 }, at: 'caster', vfx: { color: 0xffa040, style: 'slam' },
        onHit: [{ t: 'damage', dtype: 'magic', amount: { base: [380], targetMaxHp: 0.05 }, impact: 2 }, { t: 'cc', cc: 'stun', duration: 0.6 }] },
    ] } }),
  storm_dragon: M({ id: 'storm_dragon', name: '暴雷龙王', radius: 2.5, shape: 'beast', color: 0x2a3a7a, leash: 7,
    base: statBlock({ maxHp: 21000, ad: 390, armor: 200, mr: 180, moveSpeed: 2.6, range: 3.4 }), growthPerMin: { maxHp: 0.04, ad: 0.03 },
    attack: { interval: 1.4, windupRatio: 0.35 }, gold: 250, xp: 350, reward: 'vanguard',
    teamBuffOnKill: { id: 'storm_blessing', duration: 90 },
    skill: { name: '暴雷', every: 5, windup: 0.7, effects: [
      { t: 'area', shape: { k: 'cone', r: 8, angle: 90 }, at: 'caster', vfx: { color: 0x60f0ff, style: 'slash' },
        onHit: [{ t: 'damage', dtype: 'magic', amount: { base: [440], targetMaxHp: 0.06 }, impact: 2 }, { t: 'cc', cc: 'knockback', duration: 0.25, power: 2.5 }] },
    ] } }),

  // —— 河道之灵：不反击，击杀者获得金币与短暂加速 ——
  river_sprite: M({ id: 'river_sprite', name: '河道之灵', radius: 0.6, shape: 'beast', color: 0x60c8ff, leash: 5,
    base: statBlock({ maxHp: 1400, ad: 0, armor: 40, mr: 40, moveSpeed: 3, range: 1 }), growthPerMin: { maxHp: 0.06 },
    gold: 90, xp: 60, buffOnKill: { id: 'river_haste', duration: 10 } }),

  // —— 霆角先锋：击杀霆角龙王后为己方每条路召唤一个，沿路线推进，对建筑伤害很高 ——
  vanguard: M({ id: 'vanguard', name: '霆角先锋', radius: 0.9, shape: 'beast', color: 0x8a7ae0, sight: 7, structureDmg: 2.5,
    base: statBlock({ maxHp: 4500, ad: 220, armor: 120, mr: 120, moveSpeed: 3.4, range: 2.2 }), growthPerMin: { maxHp: 0.05, ad: 0.04 },
    attack: { interval: 1.2, windupRatio: 0.3 }, gold: 100, xp: 100 }),
};

export interface CampDef {
  members: { def: string; dx: number; dy: number }[];
  firstSpawn: number;
  respawn: number;
}

export const CAMPS: Record<CampKind, CampDef> = {
  lizard: { members: [{ def: 'lizard_king', dx: 0, dy: 0 }, { def: 'lizard', dx: -1.6, dy: 1 }, { def: 'lizard', dx: 1.6, dy: 1 }], firstSpawn: 20, respawn: 70 },
  wolves: { members: [{ def: 'wolf_alpha', dx: 0, dy: 0 }, { def: 'wolf', dx: -1.5, dy: -1 }, { def: 'wolf', dx: 1.5, dy: -1 }], firstSpawn: 20, respawn: 70 },
  owls: { members: [{ def: 'owl', dx: 0, dy: -1 }, { def: 'owl', dx: -1.3, dy: 0.8 }, { def: 'owl', dx: 1.3, dy: 0.8 }], firstSpawn: 20, respawn: 70 },
  blueBuff: { members: [{ def: 'blue_deer', dx: 0, dy: 0 }], firstSpawn: 20, respawn: 90 },
  redBuff: { members: [{ def: 'red_golem', dx: 0, dy: 0 }], firstSpawn: 20, respawn: 90 },
};

/** Boss：首次刷新、重生间隔；到 evolveAt 秒后重生的是进化版（evolved） */
export const BOSSES = {
  turtle: { def: 'turtle', evolved: 'ancient_turtle', evolveAt: 600, firstSpawn: 120, respawn: 180 },
  dragon: { def: 'dragon', evolved: 'storm_dragon', evolveAt: 720, firstSpawn: 240, respawn: 200 },
} as const;

/** 河道之灵：首次刷新与重生间隔 */
export const RIVER_SPRITE_CAMP = { def: 'river_sprite', firstSpawn: 90, respawn: 120 } as const;

/** 玄甲巨龟：击杀方全队每人获得的金币与经验 */
export const TURTLE_REWARD = { gold: 150, xp: 250 } as const;

/** 野区增益 */
export const JUNGLE_BUFFS: BuffDef[] = [
  { id: 'clear_stream', name: '清流', kind: 'buff', aura: 0x4a90e0, stats: { mpRegen: 12, cdr: 0.1 } },
  {
    id: 'blazing_soul',
    name: '燃魂',
    kind: 'buff',
    aura: 0xff6a30,
    onAttackHit: [
      { t: 'cc', cc: 'slow', duration: 1, power: 0.25 },
      { t: 'buff', buff: 'burn', duration: 3, to: 'target' },
    ],
  },
  // 进化 Boss 的全队增益、河道之灵的加速
  { id: 'ancient_blessing', name: '古龟庇佑', kind: 'buff', aura: 0xffa040, statsPct: { ad: 0.1, ap: 0.1 }, stats: { armor: 20, mr: 20 } },
  {
    id: 'storm_blessing',
    name: '雷霆之力',
    kind: 'buff',
    aura: 0x60f0ff,
    stats: { hpRegen: 25, mpRegen: 8 },
    statsPct: { moveSpeed: 0.08 },
    onAttackHit: [{ t: 'damage', dtype: 'magic', amount: { base: byLevel(30, 6) }, impact: 0 }],
  },
  { id: 'river_haste', name: '河灵之速', kind: 'buff', aura: 0x60c8ff, statsPct: { moveSpeed: 0.25 } },
  { id: 'burn', name: '灼烧', kind: 'debuff', aura: 0xff6a30, interval: { every: 1, effects: [{ t: 'damage', dtype: 'true', amount: { base: byLevel(18, 4) }, impact: 0 }] } },
];
