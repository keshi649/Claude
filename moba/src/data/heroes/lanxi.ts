import { byLevel, bySkill } from '../helpers';
import { statBlock, type HeroDef } from '../schema';

/**
 * 澜汐 · 潮声法师（法师）
 * 设计要点：
 *   - 潮涌：落点延迟 0.6 秒后爆发，中心眩晕 —— 需要预判
 *   - 涟漪之环：持续减速区域，配合潮涌让敌人走不出中心
 *   - 月潮：按住蓄力的长条光束，蓄得越久伤害越高
 *   - 被动潮印：技能命中叠层，满 4 层时下一次技能命中额外造成法术伤害
 */
export const LANXI: HeroDef = {
  id: 'lanxi',
  name: '澜汐',
  title: '潮声法师',
  role: 'mage',
  intro: '驾驭潮汐的法师。远距离预判落点，用减速与眩晕控制战场。',
  difficulty: 2,
  palette: { primary: 0x2a5aa8, secondary: 0x7fe0ff },
  emblem: 'star',
  radius: 0.55,
  base: statBlock({ maxHp: 2900, maxMp: 720, ad: 150, armor: 90, mr: 60, moveSpeed: 3.75, hpRegen: 9, mpRegen: 9, range: 5.5 }),
  growth: { maxHp: 190, maxMp: 55, ad: 8, armor: 14, mr: 8, attackSpeed: 0.015, hpRegen: 0.8, mpRegen: 0.7 },
  attack: { interval: 1.1, windupRatio: 0.28, projectile: { speed: 16, vfx: { color: 0x7fe0ff, style: 'orb', size: 0.22 } } },
  passive: {
    name: '潮印',
    desc: '技能命中敌人时叠 1 层潮印（最多 4 层）；满 4 层时，下一次技能命中额外造成法术伤害并清空层数。',
    icon: { glyph: '潮', color: 0x7fe0ff },
    triggers: [
      {
        on: 'skillHit',
        oncePerCast: true,
        effects: [
          {
            t: 'if',
            cond: { k: 'casterBuffStacks', buff: 'lanxi_tide', gte: 4 },
            then: [
              { t: 'damage', dtype: 'magic', amount: { base: byLevel(90, 22), ap: 0.35 }, impact: 1 },
              { t: 'removeBuff', buff: 'lanxi_tide', to: 'self' },
            ],
            else: [{ t: 'buff', buff: 'lanxi_tide', duration: 8, to: 'self' }],
          },
        ],
      },
    ],
  },
  buffs: [{ id: 'lanxi_tide', name: '潮印', kind: 'buff', maxStacks: 4, aura: 0x7fe0ff }],
  skills: [
    {
      id: 'lanxi_surge',
      name: '潮涌',
      desc: '在落点召唤潮水，0.6 秒后爆发：造成法术伤害，中心的敌人眩晕 1 秒，其余减速 30%。',
      icon: { glyph: '涌', color: 0x5ac8ff },
      maxLevel: 6,
      targeting: 'point',
      range: 7.5,
      indicator: { k: 'circle', r: 2.3 },
      windup: 0.2,
      recovery: 0.15,
      cooldown: bySkill(7, -0.4),
      cost: bySkill(60, 5),
      effects: [
        {
          t: 'area',
          shape: { k: 'circle', r: 2.3 },
          at: 'point',
          delay: 0.6,
          vfx: { color: 0x5ac8ff, style: 'burst' },
          onHit: [
            { t: 'damage', dtype: 'magic', amount: { base: bySkill(215, 48), ap: 0.7 }, impact: 1 },
            {
              t: 'if',
              cond: { k: 'distFromOrigin', lt: 1.1 },
              then: [{ t: 'cc', cc: 'stun', duration: 1 }],
              else: [{ t: 'cc', cc: 'slow', duration: 1.5, power: 0.3 }],
            },
          ],
        },
      ],
      ai: { tags: ['poke', 'cc', 'aoe', 'farm'] },
    },
    {
      id: 'lanxi_ripple',
      name: '涟漪之环',
      desc: '在落点留下持续 3.5 秒的水环，区域内敌人每 0.5 秒受到法术伤害并减速 40%。',
      icon: { glyph: '环', color: 0x40a0e0 },
      maxLevel: 6,
      targeting: 'point',
      range: 7.5,
      indicator: { k: 'circle', r: 2.8 },
      windup: 0.2,
      recovery: 0.15,
      cooldown: bySkill(12, -0.6),
      cost: bySkill(70, 5),
      effects: [
        {
          t: 'zone',
          shape: { k: 'circle', r: 2.8 },
          at: 'point',
          duration: 3.5,
          interval: 0.5,
          vfx: { color: 0x40a0e0 },
          onTick: [
            { t: 'damage', dtype: 'magic', amount: { base: bySkill(45, 10), ap: 0.13 }, impact: 0 },
            { t: 'cc', cc: 'slow', duration: 0.6, power: 0.4 },
          ],
        },
      ],
      ai: { tags: ['aoe', 'farm'] },
    },
    {
      id: 'lanxi_moontide',
      name: '月潮',
      desc: '按住蓄力（最长 1.5 秒），松开后向前方释放长 11 米的潮光，造成法术伤害（满蓄力 +80%）。',
      icon: { glyph: '月', color: 0xc0f0ff },
      ult: true,
      maxLevel: 3,
      targeting: 'direction',
      range: 11,
      indicator: { k: 'line', width: 1.8 },
      windup: 0.15,
      recovery: 0.3,
      charge: { min: 0, max: 1.5 },
      cooldown: [40, 35, 30],
      cost: [100, 115, 130],
      effects: [
        {
          t: 'area',
          shape: { k: 'rect', length: 11, width: 1.8 },
          at: 'caster',
          vfx: { color: 0xa0f0ff, style: 'wave' },
          onHit: [{ t: 'damage', dtype: 'magic', amount: { base: [320, 470, 620], ap: 0.9, charge: 0.8 }, impact: 2 }],
        },
      ],
      ai: { tags: ['poke', 'execute', 'aoe'] },
    },
  ],
  skillOrder: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  build: ['sage_boots', 'judgment_staff', 'tide_scepter', 'eternal_shield'],
};
