import { bySkill } from '../helpers';
import { statBlock, type HeroDef } from '../schema';

/**
 * 青翎 · 逐风射手（射手）
 * 设计要点：
 *   - 被动三连：每第 3 次普攻额外射出一支穿透箭
 *   - 疾风步：短位移并重置普攻，下一次普攻强化 —— 走 A 拉扯
 *   - 缚羽箭：把目标击退，撞墙则眩晕 —— 利用地形
 *   - 苍穹箭雨：大范围持续减速区域
 */
export const QINGLING: HeroDef = {
  id: 'qingling',
  name: '青翎',
  title: '逐风射手',
  role: 'marksman',
  intro: '林间长大的弓手。靠持续普攻输出，擅长利用墙体把敌人钉住。',
  difficulty: 2,
  palette: { primary: 0x2f8a4a, secondary: 0xe0f070 },
  emblem: 'bow',
  radius: 0.5,
  base: statBlock({ maxHp: 2700, maxMp: 450, ad: 190, armor: 80, mr: 50, moveSpeed: 3.8, hpRegen: 8, mpRegen: 6, range: 6 }),
  growth: { maxHp: 180, maxMp: 25, ad: 14, armor: 13, mr: 7, attackSpeed: 0.035, hpRegen: 0.7, mpRegen: 0.4 },
  attack: { interval: 0.85, windupRatio: 0.2, projectile: { speed: 24, vfx: { color: 0xe0f070, style: 'arrow', size: 0.2 } } },
  passive: {
    name: '三连',
    desc: '每第 3 次普攻额外射出一支穿透箭，对沿途所有敌人造成物理伤害。',
    icon: { glyph: '翎', color: 0xe0f070 },
    triggers: [
      {
        on: 'attackHit',
        effects: [
          { t: 'buff', buff: 'qingling_count', duration: 4, to: 'self' },
          {
            t: 'if',
            cond: { k: 'casterBuffStacks', buff: 'qingling_count', gte: 3 },
            then: [
              { t: 'removeBuff', buff: 'qingling_count', to: 'self' },
              {
                t: 'projectile',
                speed: 28,
                range: 9,
                width: 0.45,
                pierce: true,
                vfx: { color: 0xf0ff90, style: 'arrow', size: 0.3 },
                onHit: [{ t: 'damage', dtype: 'physical', amount: { base: [40], ad: 0.6 }, impact: 1 }],
              },
            ],
          },
        ],
      },
    ],
  },
  buffs: [
    { id: 'qingling_count', name: '三连', kind: 'buff', maxStacks: 3 },
    {
      id: 'qingling_empower',
      name: '疾风',
      kind: 'buff',
      aura: 0xe0f070,
      consumeOnAttack: true,
      statsPct: { moveSpeed: 0.2 },
      onAttackHit: [
        { t: 'damage', dtype: 'physical', amount: { base: [60, 90, 120, 150, 180, 210], ad: 0.4 }, impact: 1 },
        { t: 'cc', cc: 'slow', duration: 1, power: 0.3 },
      ],
    },
  ],
  skills: [
    {
      id: 'qingling_dash',
      name: '疾风步',
      desc: '向指定方向翻滚 3.5 米并立即重置普攻；3 秒内下一次普攻额外造成伤害并减速。',
      icon: { glyph: '疾', color: 0xa0e060 },
      maxLevel: 6,
      targeting: 'direction',
      range: 3.5,
      indicator: { k: 'line', width: 1 },
      windup: 0,
      recovery: 0.05,
      cooldown: bySkill(8, -0.5),
      cost: bySkill(35, 3),
      effects: [
        { t: 'dash', mode: 'direction', distance: 3.5, speed: 18, trail: 0xe0f070 },
        { t: 'resetAttack' },
        { t: 'buff', buff: 'qingling_empower', duration: 3, to: 'self' },
      ],
      ai: { tags: ['escape'] },
    },
    {
      id: 'qingling_pin',
      name: '缚羽箭',
      desc: '射出重箭，对第一个命中的敌人造成物理伤害并击退 2.5 米；若被击退到墙上，眩晕 1.2 秒。',
      icon: { glyph: '缚', color: 0x60c080 },
      maxLevel: 6,
      targeting: 'direction',
      range: 8,
      indicator: { k: 'line', width: 0.8 },
      windup: 0.2,
      recovery: 0.15,
      cooldown: bySkill(11, -0.5),
      cost: bySkill(50, 4),
      effects: [
        {
          t: 'projectile',
          speed: 22,
          range: 8,
          width: 0.4,
          vfx: { color: 0x90e0a0, style: 'arrow', size: 0.32 },
          onHit: [
            { t: 'damage', dtype: 'physical', amount: { base: bySkill(140, 35), bonusAd: 0.8 }, impact: 1 },
            { t: 'cc', cc: 'knockback', duration: 0.25, power: 2.5, wallStun: 1.2 },
          ],
        },
      ],
      ai: { tags: ['poke', 'cc'] },
    },
    {
      id: 'qingling_rain',
      name: '苍穹箭雨',
      desc: '向落点降下持续 3 秒的箭雨，区域内敌人每 0.4 秒受到物理伤害并减速 35%。',
      icon: { glyph: '雨', color: 0xf0ff90 },
      ult: true,
      maxLevel: 3,
      targeting: 'point',
      range: 9,
      indicator: { k: 'circle', r: 3.5 },
      windup: 0.25,
      recovery: 0.2,
      cooldown: [42, 36, 30],
      cost: [100, 110, 120],
      effects: [
        {
          t: 'zone',
          shape: { k: 'circle', r: 3.5 },
          at: 'point',
          duration: 3,
          interval: 0.4,
          vfx: { color: 0xf0ff90 },
          onTick: [
            { t: 'damage', dtype: 'physical', amount: { base: [60, 90, 120], bonusAd: 0.3 }, impact: 0 },
            { t: 'cc', cc: 'slow', duration: 0.5, power: 0.35 },
          ],
        },
      ],
      ai: { tags: ['aoe', 'poke'] },
    },
  ],
  skillOrder: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  build: ['swift_boots', 'meteor_bow', 'piercing_bow', 'guard_jade', 'mountain_blade'],
};
