import { byLevel, bySkill } from '../helpers';
import { statBlock, type HeroDef } from '../schema';

/**
 * 厉锋 · 裂风战士（战士）
 * 设计要点：
 *   - 回旋斩为二段技能：先突进斩穿人群，再原地回旋减速，两段都能触发被动
 *   - 破军的扇形边缘是“甜点”，打中边缘伤害更高并减速 → 需要控制距离
 *   - 断岳锁定跃击，击飞 + 沉默主目标，同时击退周围敌人，适合切入孤立目标
 *   - 被动“连斩”：技能命中后下一次普攻强化并回血 → 技能与普攻穿插打出伤害
 */
export const LIFENG: HeroDef = {
  id: 'lifeng',
  name: '厉锋',
  title: '裂风战士',
  role: 'fighter',
  intro: '以风为刃的剑客。技能与普攻穿插输出，突进后越战越勇。',
  difficulty: 2,
  palette: { primary: 0xd9573b, secondary: 0xffc46b },
  emblem: 'blade',
  radius: 0.6,
  base: statBlock({
    maxHp: 3400,
    maxMp: 500,
    ad: 175,
    armor: 110,
    mr: 60,
    moveSpeed: 3.8,
    hpRegen: 12,
    mpRegen: 6,
    range: 2.0,
  }),
  growth: {
    maxHp: 230,
    maxMp: 40,
    ad: 11,
    armor: 17,
    mr: 9,
    attackSpeed: 0.02,
    hpRegen: 1,
    mpRegen: 0.5,
  },
  attack: { interval: 1.0, windupRatio: 0.2 },
  passive: {
    name: '连斩',
    desc: '技能命中敌人后 4 秒内，下一次普攻额外造成物理伤害并回复生命。',
    icon: { glyph: '连', color: 0xffc46b },
    triggers: [
      {
        on: 'skillHit',
        oncePerCast: true,
        effects: [{ t: 'buff', buff: 'lifeng_combo', duration: 4, to: 'self' }],
      },
    ],
  },
  buffs: [
    {
      id: 'lifeng_combo',
      name: '连斩',
      kind: 'buff',
      consumeOnAttack: true,
      aura: 0xffc46b,
      onAttackHit: [
        { t: 'damage', dtype: 'physical', amount: { base: byLevel(60, 10), bonusAd: 0.5 }, impact: 1 },
        { t: 'heal', to: 'self', amount: { base: byLevel(40, 8), bonusAd: 0.2 } },
      ],
    },
  ],
  skills: [
    {
      id: 'lifeng_spin',
      name: '回旋斩',
      desc: '向前突进斩击途经的敌人；3.5 秒内可再次施放，原地回旋斩击周围敌人并减速。',
      icon: { glyph: '旋', color: 0xff8a4c },
      maxLevel: 6,
      targeting: 'direction',
      range: 5,
      indicator: { k: 'line', width: 1.6 },
      windup: 0.05,
      recovery: 0.1,
      cooldown: bySkill(9, -0.4),
      cost: bySkill(40, 4),
      effects: [
        {
          t: 'dash',
          mode: 'direction',
          distance: 5,
          speed: 20,
          trail: 0xff8a4c,
          passHit: [
            { t: 'damage', dtype: 'physical', amount: { base: bySkill(120, 30), bonusAd: 0.7 }, impact: 1 },
          ],
        },
      ],
      recast: {
        window: 3.5,
        stages: [
          {
            name: '回旋斩·二段',
            targeting: 'self',
            range: 0,
            indicator: { k: 'self', r: 3 },
            windup: 0.12,
            recovery: 0.2,
            icon: { glyph: '回', color: 0xffb04c },
            effects: [
              {
                t: 'area',
                shape: { k: 'circle', r: 3 },
                at: 'caster',
                vfx: { color: 0xff9a4c, style: 'spin' },
                onHit: [
                  { t: 'damage', dtype: 'physical', amount: { base: bySkill(100, 25), bonusAd: 0.6 }, impact: 1 },
                  { t: 'cc', cc: 'slow', duration: 1, power: 0.3 },
                ],
              },
            ],
          },
        ],
      },
      ai: { tags: ['gapclose', 'aoe', 'escape'] },
    },
    {
      id: 'lifeng_sweep',
      name: '破军',
      desc: '向前方扇形横扫。被扇形外缘命中的敌人受到 150% 伤害并减速 50%。',
      icon: { glyph: '破', color: 0xff5a3c },
      maxLevel: 6,
      targeting: 'direction',
      range: 4.5,
      indicator: { k: 'cone', angle: 100 },
      windup: 0.28,
      recovery: 0.2,
      cooldown: bySkill(7, -0.3),
      cost: bySkill(50, 5),
      effects: [
        {
          t: 'area',
          shape: { k: 'cone', r: 4.5, angle: 100 },
          at: 'caster',
          vfx: { color: 0xff5a3c, style: 'slash' },
          onHit: [
            {
              t: 'if',
              cond: { k: 'distFromOrigin', gt: 3 },
              then: [
                {
                  t: 'damage',
                  dtype: 'physical',
                  amount: { base: bySkill(160, 40), ad: 0.9, mult: 1.5 },
                  impact: 2,
                },
                { t: 'cc', cc: 'slow', duration: 1.5, power: 0.5 },
              ],
              else: [{ t: 'damage', dtype: 'physical', amount: { base: bySkill(160, 40), ad: 0.9 }, impact: 1 }],
            },
          ],
        },
      ],
      ai: { tags: ['poke', 'aoe', 'cc'] },
    },
    {
      id: 'lifeng_leap',
      name: '断岳',
      desc: '跃向指定敌人，落地击飞并沉默目标 1.5 秒，同时击退周围其他敌人。跃击途中不可被选中。',
      icon: { glyph: '岳', color: 0xffd23c },
      ult: true,
      maxLevel: 3,
      targeting: 'unit',
      unitFilter: 'enemy',
      range: 6.5,
      indicator: { k: 'unit' },
      windup: 0.1,
      recovery: 0.25,
      cooldown: [40, 35, 30],
      cost: [100, 110, 120],
      effects: [
        {
          t: 'dash',
          mode: 'toTarget',
          speed: 22,
          untargetable: true,
          trail: 0xffd23c,
          onEnd: [
            {
              t: 'area',
              shape: { k: 'circle', r: 3.2 },
              at: 'caster',
              vfx: { color: 0xffd23c, style: 'slam' },
              onHit: [
                {
                  t: 'if',
                  cond: { k: 'isPrimaryTarget' },
                  then: [
                    { t: 'damage', dtype: 'physical', amount: { base: [300, 450, 600], bonusAd: 1.1 }, impact: 2 },
                    { t: 'cc', cc: 'airborne', duration: 0.6 },
                    { t: 'cc', cc: 'silence', duration: 1.5 },
                  ],
                  else: [
                    { t: 'damage', dtype: 'physical', amount: { base: [150, 225, 300], bonusAd: 0.5 }, impact: 1 },
                    { t: 'cc', cc: 'knockback', duration: 0.3, power: 3 },
                  ],
                },
              ],
            },
          ],
        },
      ],
      ai: { tags: ['engage', 'cc', 'gapclose'] },
    },
  ],
  skillOrder: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  build: ['mountain_blade', 'guard_boots', 'eternal_shield', 'meteor_bow'],
};
