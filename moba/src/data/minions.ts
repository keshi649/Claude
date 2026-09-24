import { statBlock, type UnitDef } from './schema';

/**
 * 小兵配置。属性随对局时间成长（growthPerMin 为每分钟增长比例）。
 */
export const MINIONS: Record<'melee' | 'ranged' | 'siege' | 'super', UnitDef> = {
  melee: {
    id: 'minion_melee',
    name: '近战兵',
    radius: 0.45,
    shape: 'square',
    base: statBlock({ maxHp: 1000, ad: 58, armor: 20, mr: 10, moveSpeed: 3.3, range: 1.2 }),
    growthPerMin: { maxHp: 0.05, ad: 0.04 },
    attack: { interval: 1.2, windupRatio: 0.35 },
    gold: 40,
    xp: 60,
  },
  ranged: {
    id: 'minion_ranged',
    name: '远程兵',
    radius: 0.42,
    shape: 'triangle',
    base: statBlock({ maxHp: 650, ad: 78, armor: 10, mr: 10, moveSpeed: 3.3, range: 5 }),
    growthPerMin: { maxHp: 0.05, ad: 0.04 },
    attack: { interval: 1.5, windupRatio: 0.35, projectile: { speed: 16, vfx: { color: 0xffffff, style: 'orb', size: 0.14 } } },
    gold: 35,
    xp: 55,
  },
  siege: {
    id: 'minion_siege',
    name: '炮车',
    radius: 0.6,
    shape: 'hexagon',
    base: statBlock({ maxHp: 1700, ad: 120, armor: 40, mr: 40, moveSpeed: 3.1, range: 7 }),
    growthPerMin: { maxHp: 0.05, ad: 0.05 },
    attack: { interval: 2.0, windupRatio: 0.35, projectile: { speed: 14, vfx: { color: 0xffb04c, style: 'orb', size: 0.22 } } },
    gold: 70,
    xp: 90,
  },
  super: {
    id: 'minion_super',
    name: '超级兵',
    radius: 0.6,
    shape: 'bigsquare',
    base: statBlock({ maxHp: 2600, ad: 160, armor: 80, mr: 60, moveSpeed: 3.3, range: 1.5 }),
    growthPerMin: { maxHp: 0.05, ad: 0.04 },
    attack: { interval: 1.0, windupRatio: 0.3 },
    gold: 60,
    xp: 90,
  },
};
