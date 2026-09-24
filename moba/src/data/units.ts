import { statBlock, type BuffDef, type UnitDef } from './schema';
import { HERO_LIST } from './heroes';
import { MINIONS } from './minions';
import { CRYSTAL, TOWERS } from './structures';
import { JUNGLE_BUFFS, MONSTERS } from './monsters';

/** 训练木桩 */
export const DUMMY: UnitDef = {
  id: 'dummy',
  name: '训练木桩',
  radius: 0.7,
  shape: 'dummy',
  base: statBlock({ maxHp: 8000, armor: 100, mr: 100, moveSpeed: 2.2 }),
  gold: 0,
  xp: 0,
};

/** 非英雄单位注册表 */
export const UNIT_DEFS: Record<string, UnitDef> = {};
for (const d of [DUMMY, CRYSTAL, ...Object.values(TOWERS), ...Object.values(MINIONS), ...Object.values(MONSTERS)]) UNIT_DEFS[d.id] = d;

export function registerUnitDefs(defs: readonly UnitDef[]): void {
  for (const d of defs) UNIT_DEFS[d.id] = d;
}

export function getUnitDef(id: string): UnitDef {
  const d = UNIT_DEFS[id];
  if (!d) throw new Error(`未知单位：${id}`);
  return d;
}

/** 通用增益（与英雄无关的） */
const COMMON_BUFFS: BuffDef[] = [
  { id: 'sprint', name: '疾驰', kind: 'buff', aura: 0xffe25a, statsPct: { moveSpeed: 0.5 } },
  { id: 'base_haste', name: '泉水加速', kind: 'buff', aura: 0x7fd4ff, statsPct: { moveSpeed: 0.6 } },
  // 装备被动
  { id: 'meteor_haste', name: '流星', kind: 'buff', maxStacks: 5, stats: { attackSpeed: 0.06 } },
  { id: 'jade_guard', name: '护命', kind: 'buff', aura: 0xf0d070, flags: { invulnerable: true } },
  {
    id: 'restore',
    name: '恢复',
    kind: 'buff',
    aura: 0x6dff7a,
    // 5 秒内每 0.5 秒回复 3% 最大生命与法力，受到伤害即中断
    interval: {
      every: 0.5,
      effects: [
        { t: 'heal', to: 'self', amount: { base: [0], maxHp: 0.03 } },
        { t: 'mana', to: 'self', amount: { base: [0], maxMp: 0.03 } },
      ],
    },
  },
];

/** 全局增益注册表：通用增益 + 各英雄专属增益 */
export const BUFFS: Record<string, BuffDef> = {};
for (const b of [...COMMON_BUFFS, ...JUNGLE_BUFFS]) BUFFS[b.id] = b;
for (const h of HERO_LIST) for (const b of h.buffs ?? []) BUFFS[b.id] = b;

export function getBuff(id: string): BuffDef {
  const b = BUFFS[id];
  if (!b) throw new Error(`未知增益：${id}`);
  return b;
}
