import { byLevel, bySkill } from '../helpers';
import { statBlock, type HeroDef } from '../schema';

/**
 * 雷牙 · 迅雷刺客（刺客）
 * 设计要点（突进收割型，与夜鸦的标记引爆型区分）：
 *   - 雷闪：向前闪电冲刺，途经敌人受到伤害 —— 进场 / 逃生都靠它
 *   - 裂空爪：前方扇形爪击，减速
 *   - 天雷降：锁定敌人从天而降，重击并击飞主目标
 *   - 被动猎杀：击杀敌方英雄时立即刷新雷闪并回复生命 —— 连续收割
 */
export const LEIYA: HeroDef = {
  id: 'leiya',
  name: '雷牙',
  title: '迅雷刺客',
  role: 'assassin',
  intro: '踏雷而行的猎手。冲刺切入后排，拿下人头后立刻刷新位移，继续追杀。',
  difficulty: 3,
  palette: { primary: 0x283a6a, secondary: 0x8fe4ff },
  emblem: 'claw',
  radius: 0.55,
  base: statBlock({ maxHp: 3050, maxMp: 440, ad: 180, armor: 95, mr: 52, moveSpeed: 3.95, hpRegen: 10, mpRegen: 6, range: 1.8 }),
  growth: { maxHp: 210, maxMp: 30, ad: 13, armor: 15, mr: 8, attackSpeed: 0.025, hpRegen: 0.9, mpRegen: 0.4 },
  attack: { interval: 0.85, windupRatio: 0.2 },
  passive: {
    name: '猎杀',
    desc: '击杀敌方英雄时立即刷新雷闪的冷却，并回复 15% 已损生命。',
    icon: { glyph: '猎', color: 0x8fe4ff },
    triggers: [
      {
        on: 'kill',
        heroOnly: true,
        effects: [
          { t: 'refreshCooldown', slot: 0 },
          { t: 'heal', amount: { base: byLevel(80, 15), maxHp: 0.08 }, to: 'self' },
        ],
      },
    ],
  },
  skills: [
    {
      id: 'leiya_flash',
      name: '雷闪',
      desc: '化作闪电向前冲刺 5 米，对途经的敌人造成物理伤害。',
      icon: { glyph: '闪', color: 0x8fe4ff },
      maxLevel: 6,
      targeting: 'direction',
      range: 5,
      indicator: { k: 'line', width: 1.2 },
      windup: 0.05,
      recovery: 0.1,
      cooldown: bySkill(9, -0.5),
      cost: bySkill(45, 4),
      effects: [
        {
          t: 'dash',
          mode: 'direction',
          distance: 5,
          speed: 22,
          trail: 0x8fe4ff,
          passHit: [{ t: 'damage', dtype: 'physical', amount: { base: bySkill(130, 30), bonusAd: 0.8 }, impact: 1 }],
        },
      ],
      ai: { tags: ['gapclose', 'escape', 'farm'] },
    },
    {
      id: 'leiya_rend',
      name: '裂空爪',
      desc: '向前方扇形爪击，造成物理伤害并减速 30%，持续 1.5 秒。',
      icon: { glyph: '爪', color: 0x60b0ff },
      maxLevel: 6,
      targeting: 'direction',
      range: 3.4,
      indicator: { k: 'cone', angle: 100 },
      windup: 0.15,
      recovery: 0.15,
      cooldown: bySkill(7, -0.3),
      cost: bySkill(40, 3),
      effects: [
        {
          t: 'area',
          shape: { k: 'cone', r: 3.4, angle: 100 },
          at: 'caster',
          vfx: { color: 0x8fe4ff, style: 'slash' },
          onHit: [
            { t: 'damage', dtype: 'physical', amount: { base: bySkill(150, 35), bonusAd: 0.9 }, impact: 1 },
            { t: 'cc', cc: 'slow', duration: 1.5, power: 0.3 },
          ],
        },
      ],
      ai: { tags: ['aoe', 'farm', 'poke'] },
    },
    {
      id: 'leiya_thunder',
      name: '天雷降',
      desc: '锁定一名敌人，化作雷霆从天而降：对其造成大量物理伤害并击飞 0.8 秒，对周围 2.5 米内的其他敌人造成一半伤害。',
      icon: { glyph: '雷', color: 0xd0f4ff },
      ult: true,
      maxLevel: 3,
      targeting: 'unit',
      unitFilter: 'enemy',
      range: 7,
      indicator: { k: 'unit' },
      windup: 0.1,
      recovery: 0.2,
      cooldown: [42, 36, 30],
      cost: [90, 100, 110],
      effects: [
        {
          t: 'dash',
          mode: 'toTarget',
          speed: 26,
          untargetable: true,
          trail: 0xd0f4ff,
          onEnd: [
            {
              t: 'area',
              shape: { k: 'circle', r: 2.5 },
              at: 'caster',
              vfx: { color: 0xd0f4ff, style: 'slam' },
              onHit: [
                {
                  t: 'if',
                  cond: { k: 'isPrimaryTarget' },
                  then: [
                    { t: 'damage', dtype: 'physical', amount: { base: [300, 450, 600], bonusAd: 1.3 }, impact: 2 },
                    { t: 'cc', cc: 'airborne', duration: 0.8 },
                  ],
                  else: [{ t: 'damage', dtype: 'physical', amount: { base: [150, 225, 300], bonusAd: 0.65 }, impact: 1 }],
                },
              ],
            },
          ],
        },
      ],
      ai: { tags: ['engage', 'execute', 'gapclose'] },
    },
  ],
  skillOrder: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  build: ['beast_claw', 'swift_boots', 'mountain_blade', 'guard_jade', 'piercing_bow'],
};
