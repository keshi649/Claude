import { statBlock, type UnitDef } from './schema';
import type { TowerTier } from './map';

/** 建筑配置（防御塔、水晶） */
export const TOWERS: Record<TowerTier, UnitDef> = {
  outer: {
    id: 'tower_outer',
    name: '外塔',
    radius: 1.3,
    shape: 'tower',
    base: statBlock({ maxHp: 5500, ad: 450, armor: 110, mr: 110, range: 8 }),
    attack: { interval: 1.0, windupRatio: 0.25, projectile: { speed: 20, vfx: { color: 0xffffff, style: 'bolt', size: 0.2 } } },
    gold: 150,
    xp: 150,
  },
  inner: {
    id: 'tower_inner',
    name: '内塔',
    radius: 1.3,
    shape: 'tower',
    base: statBlock({ maxHp: 6500, ad: 500, armor: 130, mr: 130, range: 8 }),
    attack: { interval: 1.0, windupRatio: 0.25, projectile: { speed: 20, vfx: { color: 0xffffff, style: 'bolt', size: 0.2 } } },
    gold: 150,
    xp: 180,
  },
  high: {
    id: 'tower_high',
    name: '高地塔',
    radius: 1.4,
    shape: 'tower',
    base: statBlock({ maxHp: 7500, ad: 560, armor: 150, mr: 150, range: 8 }),
    attack: { interval: 1.0, windupRatio: 0.25, projectile: { speed: 20, vfx: { color: 0xffffff, style: 'bolt', size: 0.22 } } },
    gold: 150,
    xp: 200,
  },
};

export const CRYSTAL: UnitDef = {
  id: 'crystal',
  name: '水晶',
  radius: 2.2,
  shape: 'crystal',
  base: statBlock({ maxHp: 9000, ad: 650, armor: 160, mr: 160, range: 8.5, hpRegen: 0 }),
  attack: { interval: 1.0, windupRatio: 0.25, projectile: { speed: 20, vfx: { color: 0xffffff, style: 'orb', size: 0.3 } } },
  gold: 0,
  xp: 0,
};

/** 防御塔连续命中同一英雄的伤害递增：每次 +40%，最多 3 层 */
export const TOWER_RAMP = { perHit: 0.4, maxStacks: 3 } as const;
