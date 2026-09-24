import type { PassiveTrigger, StatMods } from './schema';

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
  /** 唯一被动：同名装备只生效一件；有冷却时触发后进入冷却 */
  passive?: ItemPassive;
}

export interface ItemPassive {
  name: string;
  desc: string;
  cooldown?: number;
  triggers: PassiveTrigger[];
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

  // —— 成装（带唯一被动，对标手游的核心装备） ——
  I({
    id: 'mountain_blade', name: '断岳重剑', category: 'physical', tier: 3, cost: 700, components: ['gale_sword', 'blood_sickle'],
    stats: { ad: 110, lifesteal: 0.1, cdr: 0.1 }, glyph: '岳', color: 0xff8040,
    passive: {
      name: '裂魂',
      desc: '普攻命中生命低于 50% 的敌人时，额外造成其已损生命 8% 的物理伤害。',
      triggers: [{ on: 'attackHit', cond: { k: 'targetHpBelow', pct: 0.5 }, effects: [{ t: 'damage', dtype: 'physical', amount: { base: [0], targetMissingHp: 0.08 } }] }],
    },
  }),
  I({
    id: 'meteor_bow', name: '陨星战弓', category: 'physical', tier: 3, cost: 700, components: ['swift_string', 'gale_sword'],
    stats: { ad: 80, attackSpeed: 0.35, crit: 0.25 }, glyph: '陨', color: 0xffd040,
    passive: {
      name: '流星',
      desc: '普攻命中后攻击速度 +6%，持续 3 秒，最多叠加 5 层。',
      triggers: [{ on: 'attackHit', effects: [{ t: 'buff', buff: 'meteor_haste', duration: 3, to: 'self' }] }],
    },
  }),
  I({
    id: 'piercing_bow', name: '破阵长弓', category: 'physical', tier: 3, cost: 700, components: ['swift_string'],
    stats: { ad: 40, attackSpeed: 0.2, armorPenPct: 0.3 }, glyph: '破', color: 0xe06040,
    passive: {
      name: '破阵',
      desc: '普攻命中英雄时额外造成其最大生命 2% 的物理伤害，专克高血量前排。',
      triggers: [{ on: 'attackHit', heroOnly: true, effects: [{ t: 'damage', dtype: 'physical', amount: { base: [0], targetMaxHp: 0.02 } }] }],
    },
  }),
  I({
    id: 'judgment_staff', name: '天罚法杖', category: 'magic', tier: 3, cost: 700, components: ['star_tome', 'mithril_orb'],
    stats: { ap: 180, mrPenPct: 0.2, cdr: 0.1 }, glyph: '罚', color: 0xc080ff,
    passive: {
      name: '天罚',
      desc: '技能命中英雄时，在其身边降下天雷，对 1.8 米内敌人造成 120 +（30% 法术强度）法术伤害，冷却 4 秒。',
      cooldown: 4,
      triggers: [
        {
          on: 'skillHit', heroOnly: true,
          effects: [{ t: 'area', shape: { k: 'circle', r: 1.8 }, at: 'target', vfx: { color: 0xc080ff, style: 'burst' }, onHit: [{ t: 'damage', dtype: 'magic', amount: { base: [120], ap: 0.3 }, impact: 1 }] }],
        },
      ],
    },
  }),
  I({
    id: 'tide_scepter', name: '潮音权杖', category: 'magic', tier: 3, cost: 800, components: ['star_tome', 'life_gem'],
    stats: { ap: 120, maxHp: 600, mpRegen: 4, cdr: 0.1 }, glyph: '潮', color: 0x60c0ff,
    passive: {
      name: '寒潮',
      desc: '技能命中英雄时使其减速 25%，持续 1.2 秒。',
      triggers: [{ on: 'skillHit', heroOnly: true, effects: [{ t: 'cc', cc: 'slow', duration: 1.2, power: 0.25 }] }],
    },
  }),
  I({
    id: 'eternal_shield', name: '永固巨盾', category: 'defense', tier: 3, cost: 600, components: ['rock_plate', 'oath_cloak'],
    stats: { armor: 110, mr: 70, maxHp: 1000 }, glyph: '盾', color: 0x80a0c0,
    passive: {
      name: '坚壁',
      desc: '受到伤害后若生命低于 35%，立即获得 300 +（12% 最大生命）的护盾，持续 4 秒，冷却 60 秒。',
      cooldown: 60,
      triggers: [
        {
          on: 'damaged', cond: { k: 'casterHpBelow', pct: 0.35 },
          effects: [
            { t: 'shield', amount: { base: [300], maxHp: 0.12 }, duration: 4, to: 'self' },
            { t: 'area', shape: { k: 'circle', r: 1.4 }, vfx: { color: 0x80c8ff, style: 'glow' }, onHit: [] },
          ],
        },
      ],
    },
  }),
  I({
    id: 'beast_claw', name: '猎王之爪', category: 'jungle', tier: 3, cost: 550, components: ['hunter_knife', 'bronze_blade'],
    stats: { ad: 45, maxHp: 300, cdr: 0.1, monsterDmg: 0.35 }, glyph: '爪', color: 0x40d070, desc: '对野怪额外造成 35% 伤害',
    passive: {
      name: '猎王',
      desc: '击杀野怪时回复 8% 最大生命与 10% 最大法力，打野更持久。',
      triggers: [
        {
          on: 'kill', cond: { k: 'targetKind', kinds: ['monster'] },
          effects: [
            { t: 'heal', amount: { base: [0], maxHp: 0.08 }, to: 'self' },
            { t: 'mana', amount: { base: [0], maxMp: 0.1 }, to: 'self' },
          ],
        },
      ],
    },
  }),
  I({
    id: 'guard_jade', name: '护命玉佩', category: 'physical', tier: 3, cost: 500, components: ['gale_sword', 'leather_armor'],
    stats: { ad: 60, armor: 30, armorPen: 40 }, glyph: '佩', color: 0xf0d070,
    passive: {
      name: '护命',
      desc: '受到致命伤害时免于死亡，并在 1 秒内免疫一切伤害，冷却 90 秒。',
      cooldown: 90,
      triggers: [{ on: 'lethal', effects: [{ t: 'buff', buff: 'jade_guard', duration: 1, to: 'self' }] }],
    },
  }),
  I({
    id: 'frost_gauntlet', name: '霜纹护手', category: 'defense', tier: 3, cost: 500, components: ['rock_plate', 'blue_pendant'],
    stats: { maxHp: 600, armor: 50, maxMp: 300, cdr: 0.1 }, glyph: '霜', color: 0x9fe8ff,
    passive: {
      name: '霜纹',
      desc: '普攻命中后在目标处炸开寒冰：对 2.5 米内敌人造成 150 +（3% 最大生命）法术伤害并减速 30% 持续 1 秒，冷却 2.5 秒。',
      cooldown: 2.5,
      triggers: [
        {
          on: 'attackHit',
          effects: [
            {
              t: 'area', shape: { k: 'circle', r: 2.5 }, at: 'target', vfx: { color: 0x9fe8ff, style: 'slam' },
              onHit: [
                { t: 'damage', dtype: 'magic', amount: { base: [150], maxHp: 0.03 } },
                { t: 'cc', cc: 'slow', duration: 1, power: 0.3 },
              ],
            },
          ],
        },
      ],
    },
  }),
  I({
    id: 'lantern_charm', name: '萤引灯盏', category: 'magic', tier: 3, cost: 500, components: ['star_tome', 'life_gem'],
    stats: { ap: 60, maxHp: 500, mpRegen: 3, cdr: 0.1 }, glyph: '灯', color: 0xffe28a,
    passive: {
      name: '引路',
      desc: '每 10 秒为自己和 6 米内的友军英雄提供 100 +（4% 最大生命）的护盾，持续 3 秒。游走 / 辅助核心装备。',
      triggers: [
        {
          on: 'interval', every: 10,
          effects: [
            {
              t: 'area', shape: { k: 'circle', r: 6 }, affects: 'alliesAndSelf', vfx: { color: 0xffe28a, style: 'glow' },
              onHit: [{ t: 'if', cond: { k: 'targetKind', kinds: ['hero'] }, then: [{ t: 'shield', amount: { base: [100], maxHp: 0.04 }, duration: 3, to: 'target' }] }],
            },
          ],
        },
      ],
    },
  }),
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
