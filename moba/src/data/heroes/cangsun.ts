import { bySkill } from '../helpers';
import { statBlock, type HeroDef } from '../schema';

/**
 * 苍隼 · 远空弩手（射手）
 * 设计要点（超远程消耗型射手，与青翎的走 A 型区分）：
 *   - 射程 6.8 米，被动鹰眼：攻击 5 米外的目标额外造成伤害 —— 站得越远越疼
 *   - 穿云弩：直线穿透弩箭，清线 + 消耗
 *   - 爆裂箭：落点延迟爆炸并把敌人向外炸开 —— 自保 / 打断冲锋
 *   - 贯日：蓄势 0.8 秒后射出横贯战场的长箭，对残血目标是远距离收割
 */
export const CANGSUN: HeroDef = {
  id: 'cangsun',
  name: '苍隼',
  title: '远空弩手',
  role: 'marksman',
  intro: '在高处俯瞰战场的弩手。射程极远，但身板脆弱，需要队友保护。',
  difficulty: 2,
  palette: { primary: 0x6a5a3a, secondary: 0x9fd0ff },
  emblem: 'crossbow',
  radius: 0.5,
  base: statBlock({ maxHp: 2600, maxMp: 440, ad: 185, armor: 76, mr: 50, moveSpeed: 3.75, hpRegen: 8, mpRegen: 6, range: 6.8 }),
  growth: { maxHp: 175, maxMp: 25, ad: 14, armor: 12, mr: 7, attackSpeed: 0.03, hpRegen: 0.7, mpRegen: 0.4 },
  attack: { interval: 0.95, windupRatio: 0.22, projectile: { speed: 28, vfx: { color: 0x9fd0ff, style: 'arrow', size: 0.22 } } },
  passive: {
    name: '鹰眼',
    desc: '普攻命中 5 米外的目标时额外造成 25% 物理攻击的伤害。',
    icon: { glyph: '鹰', color: 0x9fd0ff },
    triggers: [
      {
        on: 'attackHit',
        cond: { k: 'distFromOrigin', gt: 5 },
        effects: [{ t: 'damage', dtype: 'physical', amount: { base: [0], ad: 0.25 } }],
      },
    ],
  },
  skills: [
    {
      id: 'cangsun_pierce',
      name: '穿云弩',
      desc: '射出穿透弩箭，对直线上所有敌人造成物理伤害。',
      icon: { glyph: '穿', color: 0x9fd0ff },
      maxLevel: 6,
      targeting: 'direction',
      range: 10,
      indicator: { k: 'line', width: 0.8 },
      windup: 0.25,
      recovery: 0.1,
      cooldown: bySkill(7, -0.4),
      cost: bySkill(45, 4),
      effects: [
        {
          t: 'projectile',
          speed: 30,
          range: 10,
          width: 0.4,
          pierce: true,
          vfx: { color: 0xbfe4ff, style: 'arrow', size: 0.34 },
          onHit: [{ t: 'damage', dtype: 'physical', amount: { base: bySkill(140, 32), ad: 0.75 }, impact: 1 }],
        },
      ],
      ai: { tags: ['poke', 'farm', 'aoe'] },
    },
    {
      id: 'cangsun_burst',
      name: '爆裂箭',
      desc: '向落点射出爆裂箭，0.4 秒后爆炸：对 2.2 米内敌人造成物理伤害，并把他们向外炸开 2.5 米。',
      icon: { glyph: '爆', color: 0xffc070 },
      maxLevel: 6,
      targeting: 'point',
      range: 6,
      indicator: { k: 'circle', r: 2.2 },
      windup: 0.15,
      recovery: 0.15,
      cooldown: bySkill(12, -0.6),
      cost: bySkill(55, 4),
      effects: [
        {
          t: 'area',
          shape: { k: 'circle', r: 2.2 },
          at: 'point',
          delay: 0.4,
          vfx: { color: 0xffc070, style: 'burst' },
          onHit: [
            { t: 'damage', dtype: 'physical', amount: { base: bySkill(120, 28), ad: 0.6 }, impact: 1 },
            { t: 'cc', cc: 'knockback', duration: 0.25, power: 2.5 },
          ],
        },
      ],
      ai: { tags: ['cc', 'escape', 'aoe'] },
    },
    {
      id: 'cangsun_sunpierce',
      name: '贯日',
      desc: '蓄势后射出贯穿 20 米的长箭，对直线上的敌人造成大量物理伤害（额外造成目标已损生命 15% 的伤害）并减速 40%。',
      icon: { glyph: '贯', color: 0xfff0a0 },
      ult: true,
      maxLevel: 3,
      targeting: 'direction',
      range: 20,
      indicator: { k: 'line', width: 1.4 },
      windup: 0.8,
      recovery: 0.25,
      cooldown: [50, 44, 38],
      cost: [100, 110, 120],
      effects: [
        {
          t: 'area',
          shape: { k: 'rect', length: 20, width: 1.4 },
          at: 'caster',
          vfx: { color: 0xfff0a0, style: 'wave' },
          onHit: [
            { t: 'damage', dtype: 'physical', amount: { base: [300, 450, 600], ad: 1.1, targetMissingHp: 0.15 }, impact: 2 },
            { t: 'cc', cc: 'slow', duration: 1.5, power: 0.4 },
          ],
        },
      ],
      ai: { tags: ['poke', 'execute'] },
    },
  ],
  skillOrder: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  build: ['swift_boots', 'meteor_bow', 'piercing_bow', 'mountain_blade'],
};
