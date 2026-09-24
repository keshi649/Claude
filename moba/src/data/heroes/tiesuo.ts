import { byLevel, bySkill } from '../helpers';
import { statBlock, type HeroDef } from '../schema';

/**
 * 铁索 · 缚魂守望（辅助）
 * 设计要点（钩子型开团辅助，与芷萤的治疗型区分）：
 *   - 缚魂钩：直线飞钩，钩中第一个敌人把他拉到身前并短暂眩晕 —— 高风险高回报的开团技
 *   - 震地锤：身边范围伤害 + 减速，钩到人之后接上
 *   - 锁魂阵：把周围敌人拉向自己，并展开跟随自身的锁链阵：阵内敌人持续减速
 *   - 被动守望：技能命中敌方英雄时获得护盾，越开团越肉
 */
export const TIESUO: HeroDef = {
  id: 'tiesuo',
  name: '铁索',
  title: '缚魂守望',
  role: 'support',
  intro: '手持锁链飞钩的守望者。钩中关键目标，把他拖进己方阵中。',
  difficulty: 3,
  palette: { primary: 0x4a5a3a, secondary: 0xc8e070 },
  emblem: 'hook',
  radius: 0.65,
  base: statBlock({ maxHp: 3700, maxMp: 500, ad: 160, armor: 135, mr: 80, moveSpeed: 3.75, hpRegen: 14, mpRegen: 7, range: 2.0 }),
  growth: { maxHp: 260, maxMp: 35, ad: 9, armor: 20, mr: 10, attackSpeed: 0.015, hpRegen: 1.2, mpRegen: 0.5 },
  attack: { interval: 1.1, windupRatio: 0.22 },
  passive: {
    name: '守望',
    desc: '技能命中敌方英雄时获得 95 +（7% 最大生命）的护盾，持续 3 秒（每次施法最多触发一次）。',
    icon: { glyph: '守', color: 0xc8e070 },
    triggers: [
      {
        on: 'skillHit',
        heroOnly: true,
        oncePerCast: true,
        effects: [{ t: 'shield', amount: { base: byLevel(95, 12), maxHp: 0.07 }, duration: 3, to: 'self' }],
      },
    ],
  },
  skills: [
    {
      id: 'tiesuo_hook',
      name: '缚魂钩',
      desc: '掷出飞钩，钩中第一个敌人时造成物理伤害，把他拉到身前并眩晕（拉回后约 0.5 秒）；撞墙则落空。',
      icon: { glyph: '钩', color: 0xc8e070 },
      maxLevel: 6,
      targeting: 'direction',
      range: 9,
      indicator: { k: 'line', width: 0.8 },
      windup: 0.25,
      recovery: 0.25,
      cooldown: bySkill(11, -0.5),
      cost: bySkill(60, 4),
      effects: [
        {
          t: 'projectile',
          speed: 20,
          range: 9,
          width: 0.4,
          stopAtWall: true,
          vfx: { color: 0xc8e070, style: 'blade', size: 0.3 },
          onHit: [
            { t: 'damage', dtype: 'physical', amount: { base: bySkill(150, 35), ad: 0.5 }, impact: 2 },
            { t: 'cc', cc: 'pull', duration: 0.35, power: 9 },
            { t: 'cc', cc: 'stun', duration: 0.85 },
          ],
        },
      ],
      ai: { tags: ['engage', 'cc'] },
    },
    {
      id: 'tiesuo_quake',
      name: '震地锤',
      desc: '重锤砸地，对 3 米内敌人造成物理伤害并减速 40%，持续 1.5 秒。',
      icon: { glyph: '锤', color: 0x9ab050 },
      maxLevel: 6,
      targeting: 'self',
      range: 0,
      indicator: { k: 'self', r: 3 },
      windup: 0.2,
      recovery: 0.15,
      cooldown: bySkill(8, -0.4),
      cost: bySkill(45, 3),
      effects: [
        {
          t: 'area',
          shape: { k: 'circle', r: 3 },
          at: 'caster',
          vfx: { color: 0xc8e070, style: 'slam' },
          onHit: [
            { t: 'damage', dtype: 'physical', amount: { base: bySkill(150, 35), maxHp: 0.04 }, impact: 1 },
            { t: 'cc', cc: 'slow', duration: 1.5, power: 0.4 },
          ],
        },
      ],
      ai: { tags: ['aoe', 'cc', 'farm'] },
    },
    {
      id: 'tiesuo_chains',
      name: '锁魂阵',
      desc: '甩出锁链把 4.5 米内的敌人拉向自己，然后展开跟随自身 3 秒的锁魂阵：阵内敌人每 0.5 秒受到伤害并减速 35%。',
      icon: { glyph: '锁', color: 0xe8ff90 },
      ult: true,
      maxLevel: 3,
      targeting: 'self',
      range: 0,
      indicator: { k: 'self', r: 4.5 },
      windup: 0.25,
      recovery: 0.2,
      cooldown: [48, 42, 36],
      cost: [100, 110, 120],
      effects: [
        {
          t: 'area',
          shape: { k: 'circle', r: 4.5 },
          at: 'caster',
          vfx: { color: 0xe8ff90, style: 'wave' },
          onHit: [
            { t: 'damage', dtype: 'magic', amount: { base: [180, 260, 340], maxHp: 0.04 }, impact: 2 },
            { t: 'cc', cc: 'pull', duration: 0.3, power: 2.5 },
          ],
        },
        {
          t: 'zone',
          shape: { k: 'circle', r: 3.2 },
          at: 'caster',
          follow: true,
          duration: 3,
          interval: 0.5,
          vfx: { color: 0xc8e070 },
          onTick: [
            { t: 'damage', dtype: 'magic', amount: { base: [30, 45, 60], maxHp: 0.008 } },
            { t: 'cc', cc: 'slow', duration: 0.6, power: 0.35 },
          ],
        },
      ],
      ai: { tags: ['engage', 'aoe', 'cc'] },
    },
  ],
  skillOrder: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  build: ['guard_boots', 'frost_gauntlet', 'lantern_charm', 'eternal_shield'],
};
