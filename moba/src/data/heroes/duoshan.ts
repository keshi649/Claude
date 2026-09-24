import { byLevel, bySkill } from '../helpers';
import { statBlock, type HeroDef } from '../schema';

/**
 * 铎山 · 磐岩守卫（坦克）
 * 设计要点：
 *   - 崩岩冲：冲锋撞到第一个敌方英雄时停下并击飞 —— 位移接控制的开团技
 *   - 磐石壁垒：护盾 + 身周持续伤害区域，站场越久越赚
 *   - 山崩：按住蓄力，蓄得越久伤害越高；落点中心眩晕、外圈击飞（需要预判走位）
 *   - 被动岩心：技能命中英雄叠层，满 3 层获得护盾
 */
export const DUOSHAN: HeroDef = {
  id: 'duoshan',
  name: '铎山',
  title: '磐岩守卫',
  role: 'tank',
  intro: '身披岩甲的守山人。擅长冲锋开团，用护盾和控制保护队友。',
  difficulty: 1,
  palette: { primary: 0x6a7a8a, secondary: 0x5ac0e8 },
  emblem: 'shield',
  radius: 0.7,
  base: statBlock({ maxHp: 3900, maxMp: 450, ad: 160, armor: 150, mr: 80, moveSpeed: 3.7, hpRegen: 16, mpRegen: 6, range: 2.0 }),
  growth: { maxHp: 290, maxMp: 30, ad: 9, armor: 22, mr: 11, attackSpeed: 0.015, hpRegen: 1.4, mpRegen: 0.4 },
  attack: { interval: 1.1, windupRatio: 0.22 },
  passive: {
    name: '岩心',
    desc: '技能命中敌方英雄时获得 1 层岩心（最多 3 层）；满 3 层时消耗全部层数，获得一个护盾。',
    icon: { glyph: '岩', color: 0x5ac0e8 },
    triggers: [
      {
        on: 'skillHit',
        heroOnly: true,
        oncePerCast: true,
        effects: [
          { t: 'buff', buff: 'duoshan_core', duration: 8, to: 'self' },
          {
            t: 'if',
            cond: { k: 'casterBuffStacks', buff: 'duoshan_core', gte: 3 },
            then: [
              { t: 'removeBuff', buff: 'duoshan_core', to: 'self' },
              { t: 'shield', to: 'self', amount: { base: byLevel(200, 45), maxHp: 0.06 }, duration: 3 },
            ],
          },
        ],
      },
    ],
  },
  buffs: [{ id: 'duoshan_core', name: '岩心', kind: 'buff', maxStacks: 3, aura: 0x5ac0e8 }],
  skills: [
    {
      id: 'duoshan_charge',
      name: '崩岩冲',
      desc: '向前冲锋，对途经敌人造成伤害；撞到第一个敌方英雄时停下并将其击飞 0.8 秒。',
      icon: { glyph: '冲', color: 0x5ac0e8 },
      maxLevel: 6,
      targeting: 'direction',
      range: 6,
      indicator: { k: 'line', width: 1.6 },
      windup: 0.1,
      recovery: 0.15,
      cooldown: bySkill(11, -0.6),
      cost: bySkill(50, 5),
      effects: [
        {
          t: 'dash',
          mode: 'direction',
          distance: 6,
          speed: 16,
          trail: 0x5ac0e8,
          passHit: [{ t: 'damage', dtype: 'physical', amount: { base: bySkill(130, 30), maxHp: 0.03 }, impact: 1 }],
          stopOnHero: [{ t: 'cc', cc: 'airborne', duration: 0.8 }],
        },
      ],
      ai: { tags: ['engage', 'cc', 'gapclose'] },
    },
    {
      id: 'duoshan_bulwark',
      name: '磐石壁垒',
      desc: '获得护盾，持续 4 秒；期间每 0.5 秒对身边敌人造成法术伤害。',
      icon: { glyph: '垒', color: 0x88a0b8 },
      maxLevel: 6,
      targeting: 'self',
      range: 0,
      indicator: { k: 'self', r: 2.6 },
      windup: 0,
      recovery: 0.1,
      cooldown: bySkill(13, -0.6),
      cost: bySkill(60, 5),
      effects: [
        { t: 'shield', to: 'self', amount: { base: bySkill(250, 70), maxHp: 0.07 }, duration: 4 },
        {
          t: 'zone',
          shape: { k: 'circle', r: 2.6 },
          at: 'caster',
          follow: true,
          duration: 4,
          interval: 0.5,
          vfx: { color: 0x5ac0e8 },
          onTick: [{ t: 'damage', dtype: 'magic', amount: { base: bySkill(35, 8), maxHp: 0.008 }, impact: 0 }],
        },
      ],
      ai: { tags: ['shield', 'aoe'] },
    },
    {
      id: 'duoshan_quake',
      name: '山崩',
      desc: '按住蓄力（最长 1.2 秒）后砸向落点：造成物理伤害（满蓄力 +60%），中心的敌人眩晕 1.2 秒，外圈击飞 0.8 秒。',
      icon: { glyph: '崩', color: 0xe0a040 },
      ult: true,
      maxLevel: 3,
      targeting: 'point',
      range: 6,
      indicator: { k: 'circle', r: 3 },
      windup: 0.25,
      recovery: 0.3,
      charge: { min: 0, max: 1.2 },
      cooldown: [45, 40, 35],
      cost: [100, 110, 120],
      effects: [
        {
          t: 'area',
          shape: { k: 'circle', r: 3 },
          at: 'point',
          vfx: { color: 0xe0a040, style: 'slam' },
          onHit: [
            { t: 'damage', dtype: 'physical', amount: { base: [260, 380, 500], maxHp: 0.05, charge: 0.6 }, impact: 2 },
            {
              t: 'if',
              cond: { k: 'distFromOrigin', lt: 1.4 },
              then: [{ t: 'cc', cc: 'stun', duration: 1.2 }],
              else: [{ t: 'cc', cc: 'airborne', duration: 0.8 }],
            },
          ],
        },
      ],
      ai: { tags: ['engage', 'cc', 'aoe'] },
    },
  ],
  skillOrder: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  build: ['guard_boots', 'frost_gauntlet', 'eternal_shield', 'tide_scepter', 'oath_cloak'],
};
