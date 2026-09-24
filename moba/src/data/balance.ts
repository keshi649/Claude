/**
 * 全局平衡常数。所有“规则性”数值集中在这里，方便调平衡。
 */
export const BALANCE = {
  /** 逻辑帧率 */
  tickRate: 30,

  // —— 伤害 ——
  /** 防御收益递减公式常数：实际伤害 = 原伤害 × K ÷ (K + 有效防御) */
  defenseK: 600,
  /** 冷却缩减上限 */
  cdrCap: 0.4,
  /** 每秒最多攻击次数 */
  maxAttacksPerSec: 2.5,
  /** 移速下限（米/秒），再强的减速也不低于此值 */
  minMoveSpeed: 1.2,

  // —— 等级 ——
  maxLevel: 15,
  /** 大招可加点的英雄等级 */
  ultLevels: [4, 8, 12] as readonly number[],
  normalSkillMax: 6,
  ultSkillMax: 3,

  // —— 普攻 ——
  /** 自动索敌时，在射程外额外搜索的距离（米） */
  acquireBonus: 3,
  /** 按住普攻键时，攻击指令的保持时间（秒） */
  attackOrderHold: 0.25,
  /** 追击目标时的最大追击距离（超出射程多少米后放弃） */
  chaseLimit: 5,

  // —— 技能 ——
  /** 点按技能自动瞄准时的额外搜索距离 */
  autoAimBonus: 1.5,
  /** 输入缓冲：前摇 / 位移期间按下的技能会排队，结束后这么久之内仍会释放（秒） */
  inputBuffer: 0.4,

  // —— 训练木桩 ——
  dummyResetDelay: 4,
} as const;

export const DT = 1 / BALANCE.tickRate;
