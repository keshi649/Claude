import type { IconSpec, SkillStage } from './schema';

/**
 * 召唤师技能（选英雄时选择）。效果与英雄技能共用同一套效果树。
 */
export interface SummonerDef {
  id: string;
  name: string;
  desc: string;
  icon: IconSpec;
  cooldown: number;
  stage: SkillStage;
}

export const SUMMONERS: Record<string, SummonerDef> = {
  smite: {
    id: 'smite',
    name: '猎击',
    desc: '对附近一个小兵或野怪造成高额真实伤害（随英雄等级提升），打野必备。',
    icon: { glyph: '猎', color: 0xffa040 },
    cooldown: 45,
    stage: {
      name: '猎击',
      targeting: 'unit',
      unitFilter: 'monster',
      range: 5,
      indicator: { k: 'unit' },
      windup: 0,
      recovery: 0,
      effects: [
        { t: 'damage', dtype: 'true', amount: { base: [800, 860, 920, 980, 1040, 1100, 1160, 1220, 1280, 1340, 1400, 1460, 1520, 1580, 1640] }, impact: 2 },
        {
          t: 'area',
          shape: { k: 'circle', r: 1.2 },
          at: 'target',
          vfx: { color: 0xffa040, style: 'slam' },
          onHit: [],
        },
      ],
    },
  },
  heal: {
    id: 'heal',
    name: '愈合',
    desc: '为自己和身边友军英雄回复生命（10% 最大生命 + 随等级提升的固定值）。',
    icon: { glyph: '愈', color: 0x6dff7a },
    cooldown: 110,
    stage: {
      name: '愈合',
      targeting: 'self',
      range: 0,
      indicator: { k: 'self', r: 5 },
      windup: 0,
      recovery: 0,
      effects: [
        {
          t: 'area',
          shape: { k: 'circle', r: 5 },
          at: 'caster',
          affects: 'alliesAndSelf',
          vfx: { color: 0x6dff7a, style: 'glow' },
          onHit: [
            {
              t: 'if',
              cond: { k: 'targetKind', kinds: ['hero'] },
              then: [{ t: 'heal', to: 'target', amount: { base: [150, 170, 190, 210, 230, 250, 270, 290, 310, 330, 350, 370, 390, 410, 430], maxHp: 0.1 } }],
            },
          ],
        },
      ],
    },
  },
  sprint: {
    id: 'sprint',
    name: '疾驰',
    desc: '3 秒内移动速度提高 50%。',
    icon: { glyph: '驰', color: 0xffe25a },
    cooldown: 90,
    stage: {
      name: '疾驰',
      targeting: 'self',
      range: 0,
      indicator: { k: 'self', r: 1 },
      windup: 0,
      recovery: 0,
      effects: [{ t: 'buff', buff: 'sprint', duration: 3, to: 'self' }],
    },
  },
  blink: {
    id: 'blink',
    name: '瞬影',
    desc: '向指定方向瞬移一小段距离，可以越过薄墙。',
    icon: { glyph: '闪', color: 0x7fd4ff },
    cooldown: 100,
    stage: {
      name: '瞬影',
      targeting: 'direction',
      range: 4.5,
      indicator: { k: 'line', width: 0.9 },
      windup: 0,
      recovery: 0,
      effects: [{ t: 'blink', to: 'point', maxDist: 4.5 }],
    },
  },
};

export function getSummoner(id: string): SummonerDef {
  const s = SUMMONERS[id];
  if (!s) throw new Error(`未知召唤师技能：${id}`);
  return s;
}

/** 回城与恢复的固定参数 */
export const RECALL = { channel: 6 } as const;
export const RESTORE = {
  cooldown: 40,
  duration: 5,
  /** 持续期间共回复最大生命 / 法力的比例 */
  hpPct: 0.3,
  mpPct: 0.3,
} as const;
