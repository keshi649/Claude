import { byLevel, bySkill } from '../helpers';
import { statBlock, type HeroDef } from '../schema';

/**
 * 夜鸦 · 影刃刺客（刺客）
 * 设计要点（标记 → 引爆）：
 *   - 影镖命中给目标打上暗印
 *   - 影步闪到目标身后；目标带暗印时引爆暗印造成高额伤害，并刷新影步冷却 —— 连续收割
 *   - 千影：短暂无法被选中，连斩周围敌人，对带暗印者伤害翻倍
 *   - 被动：普攻命中带暗印的目标时引爆，额外造成真实伤害
 */
export const YEYA: HeroDef = {
  id: 'yeya',
  name: '夜鸦',
  title: '影刃刺客',
  role: 'assassin',
  intro: '潜行于夜色中的刺客。先用飞镖标记，再闪身引爆收割。',
  difficulty: 3,
  palette: { primary: 0x3a2a4a, secondary: 0xb070ff },
  emblem: 'dagger',
  radius: 0.55,
  base: statBlock({ maxHp: 3000, maxMp: 420, ad: 185, armor: 95, mr: 50, moveSpeed: 3.95, hpRegen: 10, mpRegen: 6, range: 1.8 }),
  growth: { maxHp: 205, maxMp: 30, ad: 13, armor: 15, mr: 8, attackSpeed: 0.025, hpRegen: 0.9, mpRegen: 0.4 },
  attack: { interval: 0.9, windupRatio: 0.2 },
  passive: {
    name: '暗印',
    desc: '普攻命中带有暗印的敌人时引爆暗印，额外造成真实伤害。',
    icon: { glyph: '印', color: 0xb070ff },
    triggers: [
      {
        on: 'attackHit',
        effects: [
          {
            t: 'if',
            cond: { k: 'targetHasBuff', buff: 'yeya_mark', fromCaster: true },
            then: [
              { t: 'damage', dtype: 'true', amount: { base: byLevel(60, 14), bonusAd: 0.4 }, impact: 1 },
              { t: 'removeBuff', buff: 'yeya_mark' },
            ],
          },
        ],
      },
    ],
  },
  buffs: [
    { id: 'yeya_mark', name: '暗印', kind: 'mark', aura: 0xb070ff },
    { id: 'yeya_shadow', name: '千影', kind: 'buff', flags: { untargetable: true }, aura: 0xb070ff },
  ],
  skills: [
    {
      id: 'yeya_shuriken',
      name: '影镖',
      desc: '掷出飞镖，对第一个命中的敌人造成物理伤害、减速 25%，并打上暗印（5 秒）。',
      icon: { glyph: '镖', color: 0xb070ff },
      maxLevel: 6,
      targeting: 'direction',
      range: 8,
      indicator: { k: 'line', width: 0.7 },
      windup: 0.15,
      recovery: 0.1,
      cooldown: bySkill(7, -0.4),
      cost: bySkill(40, 3),
      effects: [
        {
          t: 'projectile',
          speed: 24,
          range: 8,
          width: 0.35,
          vfx: { color: 0xc090ff, style: 'blade', size: 0.28 },
          onHit: [
            { t: 'damage', dtype: 'physical', amount: { base: bySkill(120, 30), bonusAd: 0.8 }, impact: 1 },
            { t: 'buff', buff: 'yeya_mark', duration: 5, to: 'target' },
            { t: 'cc', cc: 'slow', duration: 1, power: 0.25 },
          ],
        },
      ],
      ai: { tags: ['poke'] },
    },
    {
      id: 'yeya_step',
      name: '影步',
      desc: '瞬移到目标敌人身后并造成伤害；目标带暗印时引爆暗印，造成高额伤害并刷新影步冷却。',
      icon: { glyph: '步', color: 0x8050d0 },
      maxLevel: 6,
      targeting: 'unit',
      unitFilter: 'enemy',
      range: 6,
      indicator: { k: 'unit' },
      windup: 0.05,
      recovery: 0.15,
      cooldown: bySkill(11, -0.6),
      cost: bySkill(50, 4),
      effects: [
        { t: 'blink', to: 'behindTarget' },
        {
          t: 'if',
          cond: { k: 'targetHasBuff', buff: 'yeya_mark', fromCaster: true },
          then: [
            { t: 'damage', dtype: 'physical', amount: { base: bySkill(170, 40), bonusAd: 1.1 }, impact: 2 },
            { t: 'removeBuff', buff: 'yeya_mark' },
            { t: 'refreshCooldown', slot: 1 },
          ],
          else: [{ t: 'damage', dtype: 'physical', amount: { base: bySkill(80, 20), bonusAd: 0.5 }, impact: 1 }],
        },
      ],
      ai: { tags: ['gapclose', 'execute'] },
    },
    {
      id: 'yeya_thousand',
      name: '千影',
      desc: '化作残影 1.2 秒，期间无法被选中，并反复斩击身边敌人；对带暗印的敌人伤害翻倍，同时为命中的敌人打上暗印。',
      icon: { glyph: '影', color: 0xd0a0ff },
      ult: true,
      maxLevel: 3,
      targeting: 'self',
      range: 0,
      indicator: { k: 'self', r: 3.5 },
      windup: 0,
      recovery: 0.1,
      cooldown: [40, 34, 28],
      cost: [90, 100, 110],
      effects: [
        { t: 'buff', buff: 'yeya_shadow', duration: 1.2, to: 'self' },
        {
          t: 'zone',
          shape: { k: 'circle', r: 3.5 },
          at: 'caster',
          follow: true,
          duration: 1.2,
          interval: 0.3,
          vfx: { color: 0xb070ff, style: 'spin' },
          onTick: [
            {
              t: 'if',
              cond: { k: 'targetHasBuff', buff: 'yeya_mark', fromCaster: true },
              then: [{ t: 'damage', dtype: 'physical', amount: { base: [130, 190, 250], bonusAd: 0.5 }, impact: 1 }],
              else: [{ t: 'damage', dtype: 'physical', amount: { base: [65, 95, 125], bonusAd: 0.25 }, impact: 1 }],
            },
            { t: 'buff', buff: 'yeya_mark', duration: 5, to: 'target' },
          ],
        },
      ],
      ai: { tags: ['execute', 'aoe', 'escape'] },
    },
  ],
  skillOrder: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  build: ['beast_claw', 'sage_boots', 'mountain_blade', 'piercing_bow', 'eternal_shield'],
};
