import { statBlock, type StatBlock } from './schema';
import type { TowerTier } from './map';

/** 建筑配置（防御塔、水晶） */
export interface StructureDef {
  id: string;
  name: string;
  radius: number;
  base: StatBlock;
}

export const TOWERS: Record<TowerTier, StructureDef> = {
  outer: { id: 'tower_outer', name: '外塔', radius: 1.3, base: statBlock({ maxHp: 7000, ad: 380, armor: 200, mr: 200, range: 8 }) },
  inner: { id: 'tower_inner', name: '内塔', radius: 1.3, base: statBlock({ maxHp: 8000, ad: 420, armor: 220, mr: 220, range: 8 }) },
  high: { id: 'tower_high', name: '高地塔', radius: 1.4, base: statBlock({ maxHp: 9000, ad: 460, armor: 240, mr: 240, range: 8 }) },
};

export const CRYSTAL: StructureDef = {
  id: 'crystal',
  name: '水晶',
  radius: 2.2,
  base: statBlock({ maxHp: 12000, ad: 500, armor: 250, mr: 250, range: 8.5 }),
};
