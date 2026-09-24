import { byLevel, bySkill } from '../helpers';
import { statBlock, type HeroDef } from '../schema';

/**
 * 灼羽 · 焰翎法师（法师）
 * 设计要点（爆发型法师，与澜汐的控制型区分）：
 *   - 焰矢：直线火球，命中后小范围爆炸 —— 清线 + 消耗
 *   - 炎阵：落点火环，持续灼烧减速
 *   - 陨火：1 秒后砸下的大范围陨石，中心眩晕 —— 团战开团 / 收割
 *   - 被动余烬：技能命中敌方英雄时附加 3 秒灼烧（每秒法术伤害）
 */
export const ZHUOYU: HeroDef = {
  id: 'zhuoyu',
  name: '灼羽',
  title: '焰翎法师',
  role: 'mage',
  intro: '以火焰为羽的法师。技能伤害高、范围大，站在后排把敌人烧成灰烬。',
  difficulty: 2,
  palette: { primary: 0xa8321e, secondary: 0xffb040 },
  emblem: 'orb',
  radius: 0.55,
  base: statBlock({ maxHp: 2750, maxMp: 700, ad: 150, armor: 82, mr: 60, moveSpeed: 3.75, hpRegen: 9, mpRegen: 9, range: 5.5 }),
  growth: { maxHp: 185, maxMp: 55, ad: 8, armor: 14, mr: 8, attackSpeed: 0.015, hpRegen: 0.8, mpRegen: 0.7 },
  attack: { interval: 1.1, windupRatio: 0.28, projectile: { speed: 16, vfx: { color: 0xffb040, style: 'orb', size: 0.22 } } },
  passive: {
    name: '余烬',
    desc: '技能命中敌方英雄时附加 3 秒灼烧，每秒造成法术伤害（重复命中刷新持续时间）。',
    icon: { glyph: '烬', color: 0xffb040 },
    triggers: [{ on: 'skillHit', heroOnly: true, effects: [{ t: 'buff', buff: 'zhuoyu_burn', duration: 3, to: 'target' }] }],
  },
  buffs: [
    {
      id: 'zhuoyu_burn',
      name: '余烬',
      kind: 'debuff',
      aura: 0xff7030,
      interval: { every: 1, effects: [{ t: 'damage', dtype: 'magic', amount: { base: byLevel(25, 5), ap: 0.06 } }] },
    },
  ],
  skills: [
    {
      id: 'zhuoyu_bolt',
      name: '焰矢',
      desc: '射出火球，命中第一个敌人后爆炸，对 1.8 米内敌人造成法术伤害。',
      icon: { glyph: '矢', color: 0xff8a30 },
      maxLevel: 6,
      targeting: 'direction',
      range: 8.5,
      indicator: { k: 'line', width: 0.8 },
      windup: 0.2,
      recovery: 0.12,
      cooldown: bySkill(6, -0.3),
      cost: bySkill(55, 5),
      effects: [
        {
          t: 'projectile',
          speed: 18,
          range: 8.5,
          width: 0.45,
          vfx: { color: 0xff8a30, style: 'orb', size: 0.38 },
          onHit: [
            {
              t: 'area',
              shape: { k: 'circle', r: 1.8 },
              at: 'target',
              vfx: { color: 0xff8a30, style: 'burst' },
              onHit: [{ t: 'damage', dtype: 'magic', amount: { base: bySkill(210, 45), ap: 0.7 }, impact: 1 }],
            },
          ],
        },
      ],
      ai: { tags: ['poke', 'aoe', 'farm'] },
    },
    {
      id: 'zhuoyu_ring',
      name: '炎阵',
      desc: '在落点点燃 3 秒的火环，区域内敌人每 0.5 秒受到法术伤害并减速 30%。',
      icon: { glyph: '阵', color: 0xff5a20 },
      maxLevel: 6,
      targeting: 'point',
      range: 7,
      indicator: { k: 'circle', r: 2.5 },
      windup: 0.2,
      recovery: 0.15,
      cooldown: bySkill(11, -0.5),
      cost: bySkill(70, 5),
      effects: [
        {
          t: 'zone',
          shape: { k: 'circle', r: 2.5 },
          at: 'point',
          duration: 3,
          interval: 0.5,
          vfx: { color: 0xff5a20 },
          onTick: [
            { t: 'damage', dtype: 'magic', amount: { base: bySkill(50, 11), ap: 0.14 } },
            { t: 'cc', cc: 'slow', duration: 0.6, power: 0.3 },
          ],
        },
      ],
      ai: { tags: ['aoe', 'farm', 'cc'] },
    },
    {
      id: 'zhuoyu_meteor',
      name: '陨火',
      desc: '召唤陨石，1 秒后砸向落点：对 3.4 米内敌人造成大量法术伤害，中心 1.5 米内的敌人眩晕 1.2 秒。',
      icon: { glyph: '陨', color: 0xffd060 },
      ult: true,
      maxLevel: 3,
      targeting: 'point',
      range: 9,
      indicator: { k: 'circle', r: 3.4 },
      windup: 0.3,
      recovery: 0.3,
      cooldown: [45, 40, 35],
      cost: [110, 125, 140],
      effects: [
        {
          t: 'area',
          shape: { k: 'circle', r: 3.4 },
          at: 'point',
          delay: 1,
          vfx: { color: 0xffa040, style: 'slam' },
          onHit: [
            { t: 'damage', dtype: 'magic', amount: { base: [380, 540, 700], ap: 1.0 }, impact: 2 },
            { t: 'if', cond: { k: 'distFromOrigin', lt: 1.5 }, then: [{ t: 'cc', cc: 'stun', duration: 1.2 }], else: [{ t: 'cc', cc: 'slow', duration: 1.5, power: 0.4 }] },
          ],
        },
      ],
      ai: { tags: ['aoe', 'execute', 'cc'] },
    },
  ],
  skillOrder: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  build: ['sage_boots', 'judgment_staff', 'tide_scepter', 'eternal_shield'],
};
