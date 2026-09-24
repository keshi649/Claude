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
