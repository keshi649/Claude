import { byLevel, bySkill } from '../helpers';
import { statBlock, type HeroDef } from '../schema';

/**
 * 芷萤 · 提灯引路人（辅助）
 * 设计要点（敌我双用）：
 *   - 萤光链：对友军是护盾 + 加速，对敌人是伤害 + 减速
 *   - 光落：落点区域同时治疗友军、伤害敌人
 *   - 守护灯域：区域内友军获得双抗，敌人进入时被沉默一次
 *   - 被动萤火：每秒为身边友军英雄回复生命
 */
export const ZHIYING: HeroDef = {
  id: 'zhiying',
  name: '芷萤',
  title: '提灯引路人',
  role: 'support',
  intro: '提着萤灯的引路人。技能对敌我都有效，保护队友、拖慢敌人。',
  difficulty: 1,
  palette: { primary: 0x8a5ab0, secondary: 0xffe28a },
  emblem: 'lantern',
  radius: 0.55,
  base: statBlock({ maxHp: 3100, maxMp: 680, ad: 140, armor: 100, mr: 70, moveSpeed: 3.8, hpRegen: 12, mpRegen: 9, range: 5 }),
  growth: { maxHp: 220, maxMp: 45, ad: 8, armor: 16, mr: 9, attackSpeed: 0.015, hpRegen: 1, mpRegen: 0.6 },
  attack: { interval: 1.1, windupRatio: 0.28, projectile: { speed: 15, vfx: { color: 0xffe28a, style: 'orb', size: 0.2 } } },
  passive: {
    name: '萤火',
    desc: '每秒为 6 米内的友军英雄（含自己）回复少量生命。',
    icon: { glyph: '萤', color: 0xffe28a },
    triggers: [
      {
        on: 'interval',
        every: 1,
        effects: [
          {
            t: 'area',
            shape: { k: 'circle', r: 6 },
            at: 'caster',
            affects: 'alliesAndSelf',
            onHit: [{ t: 'if', cond: { k: 'targetKind', kinds: ['hero'] }, then: [{ t: 'heal', to: 'target', amount: { base: byLevel(8, 3), ap: 0.02 } }] }],
          },
        ],
      },
    ],
  },
  buffs: [
    { id: 'zhiying_haste', name: '萤光', kind: 'buff', aura: 0xffe28a, statsPct: { moveSpeed: 0.25 } },
    { id: 'zhiying_ward', name: '灯域庇护', kind: 'buff', aura: 0xffe28a, stats: { armor: 90, mr: 90 } },
    { id: 'zhiying_silenced', name: '灯域', kind: 'debuff' },
  ],
  skills: [
    {
      id: 'zhiying_chain',
      name: '萤光链',
      desc: '连接一个目标：友军获得护盾并加速 25%（2 秒）；敌人受到法术伤害并减速 40%。',
      icon: { glyph: '链', color: 0xffe28a },
      maxLevel: 6,
      targeting: 'unit',
      unitFilter: 'any',
      range: 7,
      indicator: { k: 'unit' },
      windup: 0.15,
      recovery: 0.15,
      cooldown: bySkill(9, -0.5),
      cost: bySkill(55, 5),
      effects: [
        {
          t: 'if',
          cond: { k: 'targetIsAlly' },
          then: [
            { t: 'shield', to: 'target', amount: { base: bySkill(140, 40), ap: 0.5 }, duration: 2.5 },
            { t: 'buff', buff: 'zhiying_haste', duration: 2, to: 'target' },
          ],
          else: [
            { t: 'damage', dtype: 'magic', amount: { base: bySkill(150, 35), ap: 0.6 }, impact: 1 },
            { t: 'cc', cc: 'slow', duration: 1.5, power: 0.4 },
          ],
        },
      ],
      ai: { tags: ['shield', 'poke', 'cc'] },
    },
    {
      id: 'zhiying_light',
      name: '光落',
      desc: '0.4 秒后在落点降下光芒：治疗范围内友军（含自己），对敌人造成法术伤害。',
      icon: { glyph: '光', color: 0xfff0b0 },
      maxLevel: 6,
      targeting: 'point',
      range: 7,
      indicator: { k: 'circle', r: 2.6 },
      windup: 0.15,
      recovery: 0.15,
      cooldown: bySkill(10, -0.5),
      cost: bySkill(70, 5),
      effects: [
        {
          t: 'area',
          shape: { k: 'circle', r: 2.6 },
          at: 'point',
          delay: 0.4,
          affects: 'all',
          vfx: { color: 0xfff0b0, style: 'burst' },
          onHit: [
            {
              t: 'if',
              cond: { k: 'targetIsAlly' },
              then: [{ t: 'if', cond: { k: 'targetKind', kinds: ['hero'] }, then: [{ t: 'heal', to: 'target', amount: { base: bySkill(110, 30), ap: 0.45 } }] }],
              else: [{ t: 'damage', dtype: 'magic', amount: { base: bySkill(130, 30), ap: 0.5 }, impact: 1 }],
            },
          ],
        },
      ],
      ai: { tags: ['heal', 'aoe', 'poke'] },
    },
    {
      id: 'zhiying_ward',
      name: '守护灯域',
      desc: '在身边展开持续 4 秒的灯域：区域内友军获得 90 点双抗；敌人第一次进入时沉默 1.2 秒。',
      icon: { glyph: '灯', color: 0xffd060 },
      ult: true,
      maxLevel: 3,
      targeting: 'self',
      range: 0,
      indicator: { k: 'self', r: 4.5 },
      windup: 0.2,
      recovery: 0.2,
      cooldown: [48, 42, 36],
      cost: [100, 110, 120],
      effects: [
        {
          t: 'zone',
          shape: { k: 'circle', r: 4.5 },
          at: 'caster',
          duration: 4,
          interval: 0.25,
          affects: 'all',
          vfx: { color: 0xffd060 },
          onTick: [
            {
              t: 'if',
              cond: { k: 'targetIsAlly' },
              then: [{ t: 'buff', buff: 'zhiying_ward', duration: 0.4, to: 'target' }],
              else: [
                {
                  t: 'if',
                  cond: { k: 'not', c: { k: 'targetHasBuff', buff: 'zhiying_silenced' } },
                  then: [
                    { t: 'cc', cc: 'silence', duration: 1.2 },
                    { t: 'buff', buff: 'zhiying_silenced', duration: 5, to: 'target' },
                  ],
                },
              ],
            },
          ],
        },
      ],
      ai: { tags: ['shield', 'cc', 'aoe'] },
    },
  ],
  skillOrder: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  build: ['guard_boots', 'tide_scepter', 'eternal_shield', 'star_tome'],
};
