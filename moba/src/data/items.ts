import type { StatMods } from './schema';

/**
 * 装备（全部原创名称）。结构：基础件 → 合成件 → 成装。
 * cost 为“合成费”（本件自身的价格，不含部件）；总价 = cost + 各部件总价。
 */
export type ItemCategory = 'physical' | 'magic' | 'defense' | 'boots' | 'jungle';

export const ITEM_CATEGORY_NAMES: Record<ItemCategory, string> = {
  physical: '攻击',
  magic: '法术',
  defense: '防御',
  boots: '鞋子',
  jungle: '打野',
};

export interface ItemDef {
  id: string;
  name: string;
  category: ItemCategory;
  tier: 1 | 2 | 3;
  cost: number;
  components: string[];
  stats: StatMods;
  /** 图标字与颜色（程序绘制） */
  glyph: string;
  color: number;
  desc?: string;
}

const I = (d: ItemDef): ItemDef => d;

const LIST: ItemDef[] = [
  // —— 基础件 ——
  I({ id: 'bronze_blade', name: '青铜短刃', category: 'physical', tier: 1, cost: 250, components: [], stats: { ad: 20 }, glyph: '刃', color: 0xd09050 }),
  I({ id: 'wind_ring', name: '疾风指环', category: 'physical', tier: 1, cost: 300, components: [], stats: { attackSpeed: 0.12 }, glyph: '环', color: 0x9fd8ff }),
  I({ id: 'mithril_orb', name: '秘银法珠', category: 'magic', tier: 1, cost: 300, components: [], stats: { ap: 40 }, glyph: '珠', color: 0xb080ff }),
  I({ id: 'blue_pendant', name: '蓝晶坠', category: 'magic', tier: 1, cost: 250, components: [], stats: { maxMp: 300, mpRegen: 2 }, glyph: '坠', color: 0x5aa0ff }),
  I({ id: 'leather_armor', name: '皮革护甲', category: 'defense', tier: 1, cost: 220, components: [], stats: { armor: 45 }, glyph: '甲', color: 0xa08060 }),
  I({ id: 'rune_cloak', name: '灵纹斗篷', category: 'defense', tier: 1, cost: 220, components: [], stats: { mr: 45 }, glyph: '篷', color: 0x60a0a0 }),
  I({ id: 'life_gem', name: '生命宝石', category: 'defense', tier: 1, cost: 300, components: [], stats: { maxHp: 400 }, glyph: '石', color: 0xe05050 }),
  I({ id: 'walker_boots', name: '行者之靴', category: 'boots', tier: 1, cost: 250, components: [], stats: { moveSpeed: 0.3 }, glyph: '靴', color: 0xc0a070 }),
  I({ id: 'hunter_knife', name: '猎人短刀', category: 'jungle', tier: 1, cost: 250, components: [], stats: { ad: 10, monsterDmg: 0.2 }, glyph: '猎', color: 0x70c060, desc: '对野怪额外造成 20% 伤害' }),

  // —— 合成件 ——
  I({ id: 'gale_sword', name: '裂风长刀', category: 'physical', tier: 2, cost: 400, components: ['bronze_blade', 'bronze_blade'], stats: { ad: 45, cdr: 0.05 }, glyph: '刀', color: 0xe0a060 }),
  I({ id: 'blood_sickle', name: '饮血镰刀', category: 'physical', tier: 2, cost: 400, components: ['bronze_blade'], stats: { ad: 25, lifesteal: 0.1 }, glyph: '镰', color: 0xd04040 }),
  I({ id: 'swift_string', name: '迅捷弓弦', category: 'physical', tier: 2, cost: 250, components: ['wind_ring', 'bronze_blade'], stats: { ad: 15, attackSpeed: 0.2, crit: 0.1 }, glyph: '弦', color: 0x9fe0a0 }),
  I({ id: 'star_tome', name: '星辉法典', category: 'magic', tier: 2, cost: 300, components: ['mithril_orb', 'blue_pendant'], stats: { ap: 70, maxMp: 300, cdr: 0.05 }, glyph: '典', color: 0x9070ff }),
  I({ id: 'rock_plate', name: '重岩胸铠', category: 'defense', tier: 2, cost: 300, components: ['leather_armor', 'life_gem'], stats: { armor: 60, maxHp: 400 }, glyph: '铠', color: 0x9a8a70 }),
  I({ id: 'oath_cloak', name: '守誓斗篷', category: 'defense', tier: 2, cost: 300, components: ['rune_cloak', 'life_gem'], stats: { mr: 60, maxHp: 400 }, glyph: '誓', color: 0x50b0b0 }),

  // —— 鞋子 ——
  I({ id: 'swift_boots', name: '疾行战靴', category: 'boots', tier: 2, cost: 450, components: ['walker_boots'], stats: { moveSpeed: 0.45, attackSpeed: 0.15 }, glyph: '疾', color: 0xe0c060 }),
  I({ id: 'sage_boots', name: '智者之靴', category: 'boots', tier: 2, cost: 450, components: ['walker_boots'], stats: { moveSpeed: 0.45, cdr: 0.1 }, glyph: '智', color: 0x80a0ff }),
  I({ id: 'guard_boots', name: '铁卫之靴', category: 'boots', tier: 2, cost: 450, components: ['walker_boots'], stats: { moveSpeed: 0.45, armor: 40, mr: 20 }, glyph: '卫', color: 0xa0a0a0 }),

  // —— 成装 ——
  I({ id: 'mountain_blade', name: '断岳重剑', category: 'physical', tier: 3, cost: 700, components: ['gale_sword', 'blood_sickle'], stats: { ad: 110, lifesteal: 0.1, cdr: 0.1 }, glyph: '岳', color: 0xff8040 }),
  I({ id: 'meteor_bow', name: '陨星战弓', category: 'physical', tier: 3, cost: 700, components: ['swift_string', 'gale_sword'], stats: { ad: 80, attackSpeed: 0.35, crit: 0.25 }, glyph: '陨', color: 0xffd040 }),
  I({ id: 'piercing_bow', name: '破阵长弓', category: 'physical', tier: 3, cost: 700, components: ['swift_string'], stats: { ad: 40, attackSpeed: 0.2, armorPenPct: 0.3 }, glyph: '破', color: 0xe06040 }),
  I({ id: 'judgment_staff', name: '天罚法杖', category: 'magic', tier: 3, cost: 700, components: ['star_tome', 'mithril_orb'], stats: { ap: 180, mrPenPct: 0.2, cdr: 0.1 }, glyph: '罚', color: 0xc080ff }),
  I({ id: 'tide_scepter', name: '潮音权杖', category: 'magic', tier: 3, cost: 800, components: ['star_tome', 'life_gem'], stats: { ap: 120, maxHp: 600, mpRegen: 4, cdr: 0.1 }, glyph: '潮', color: 0x60c0ff }),
  I({ id: 'eternal_shield', name: '永固巨盾', category: 'defense', tier: 3, cost: 600, components: ['rock_plate', 'oath_cloak'], stats: { armor: 110, mr: 70, maxHp: 1000 }, glyph: '盾', color: 0x80a0c0 }),
  I({ id: 'beast_claw', name: '猎王之爪', category: 'jungle', tier: 3, cost: 550, components: ['hunter_knife', 'bronze_blade'], stats: { ad: 45, maxHp: 300, cdr: 0.1, monsterDmg: 0.35 }, glyph: '爪', color: 0x40d070, desc: '对野怪额外造成 35% 伤害' }),
];

export const ITEMS: Record<string, ItemDef> = Object.fromEntries(LIST.map((i) => [i.id, i]));
export const ITEM_LIST: readonly ItemDef[] = LIST;

export function getItem(id: string): ItemDef {
  const it = ITEMS[id];
  if (!it) throw new Error(`未知装备：${id}`);
  return it;
}

/** 装备总价 = 合成费 + 各部件总价 */
export function totalCost(id: string): number {
  const it = getItem(id);
  return it.cost + it.components.reduce((s, c) => s + totalCost(c), 0);
}

/** 出售返还比例 */
export const SELL_RATIO = 0.6;
/** 开局金币 */
export const START_GOLD = 300;
/** 装备栏格数 */
export const INVENTORY_SIZE = 6;
