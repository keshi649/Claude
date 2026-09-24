import { statBlock, type BuffDef, type DummyDef } from './schema';
import { HERO_LIST } from './heroes';

/** 训练木桩 */
export const DUMMIES: Record<string, DummyDef> = {
  dummy: {
    id: 'dummy',
    name: '训练木桩',
    radius: 0.7,
    base: statBlock({ maxHp: 8000, armor: 100, mr: 100, moveSpeed: 2.2 }),
  },
};

/** 通用增益（与英雄无关的） */
const COMMON_BUFFS: BuffDef[] = [];

/** 全局增益注册表：通用增益 + 各英雄专属增益 */
export const BUFFS: Record<string, BuffDef> = {};
for (const b of COMMON_BUFFS) BUFFS[b.id] = b;
for (const h of HERO_LIST) for (const b of h.buffs ?? []) BUFFS[b.id] = b;

export function getBuff(id: string): BuffDef {
  const b = BUFFS[id];
  if (!b) throw new Error(`未知增益：${id}`);
  return b;
}
