/**
 * AI 难度：通过反应时间、瞄准误差、是否预判、决策噪声、躲技能概率、出装与补刀质量区分。
 */
export type Difficulty = 'easy' | 'normal' | 'hard';

export const DIFFICULTY_NAMES: Record<Difficulty, string> = { easy: '简单', normal: '普通', hard: '困难' };

export interface DifficultyParams {
  /** 决策间隔（逻辑帧）：多久重新评估一次目标 */
  decisionTicks: number;
  /** 微操反应间隔（逻辑帧）：放技能、换目标、躲技能的反应速度 */
  reactionTicks: number;
  /** 瞄准误差（米，高斯标准差） */
  aimError: number;
  /** 是否按目标移动速度预判落点 */
  predict: boolean;
  /** 决策噪声：效用分数上叠加的随机扰动幅度 */
  noise: number;
  /** 发现被技能瞄准时尝试躲避的概率 */
  dodge: number;
  /** 补刀判断的保守程度（越大越早出手，也越容易漏刀） */
  lastHitSlack: number;
  /** 开团所需的局部战力优势比 */
  engageRatio: number;
  /** 是否会拉扯走位（远程） */
  kite: boolean;
}

export const DIFFICULTY: Record<Difficulty, DifficultyParams> = {
  easy: { decisionTicks: 24, reactionTicks: 18, aimError: 1.6, predict: false, noise: 0.35, dodge: 0, lastHitSlack: 1.6, engageRatio: 1.5, kite: false },
  normal: { decisionTicks: 15, reactionTicks: 9, aimError: 0.7, predict: true, noise: 0.15, dodge: 0.35, lastHitSlack: 1.15, engageRatio: 1.2, kite: true },
  hard: { decisionTicks: 9, reactionTicks: 4, aimError: 0.25, predict: true, noise: 0.05, dodge: 0.8, lastHitSlack: 1.02, engageRatio: 1.05, kite: true },
};
