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

/** 经济、经验、复活、兵线、泉水 */
export const ECONOMY = {
  /** 每秒自然增长的金币 */
  passiveGold: 3.5,
  /** 击杀英雄基础赏金 */
  heroBounty: 200,
  /** 终结连杀：被击杀者每多 1 次连杀（≥3 起算）额外赏金，有上限 */
  shutdownPerStreak: 70,
  shutdownMax: 350,
  /** 助攻判定窗口（秒）与助攻者分得的赏金比例（按人数平分） */
  assistWindow: 10,
  assistShare: 0.5,
  assistMinGold: 40,
  /** 推塔：全队每人金币 + 最后一击额外金币 */
  towerTeamGold: 100,
  towerLastHitGold: 150,
  /** 经验分享半径（米）；多人分享时总经验额外增加的比例（每多一人） */
  xpRadius: 12,
  xpShareBonus: 0.15,
  /** 击杀英雄的经验：基础 + 被击杀者等级 × 系数 */
  heroKillXpBase: 120,
  heroKillXpPerLevel: 30,
  /** 多杀判定窗口（秒） */
  multiKillWindow: 10,
  /** 小兵死亡时，经验范围内没有补到刀的己方英雄分得的金币比例（对标手游的共享经济，辅助也有收入） */
  minionShare: 0.35,
} as const;

/** 建筑保护：附近没有进攻方小兵时，建筑受到英雄的伤害降低（防止无兵越塔偷塔） */
export const STRUCTURE_PROTECT = {
  noMinionReduction: 0.5,
} as const;

/** 泉水加速：己方英雄在基地附近移速大幅提高，离开后还能持续一小会儿（回城 / 复活后快速回到战场） */
export const BASE_HASTE = {
  radius: 20,
  duration: 2.5,
} as const;

/** 升到下一级所需经验 */
export const xpToNext = (level: number): number => 160 + 90 * (level - 1);

/** 复活时间（秒）随等级增长 */
export const respawnTime = (level: number): number => 5 + 2.4 * (level - 1);

export const WAVES = {
  firstWaveAt: 12,
  interval: 30,
  /** 每几波出一次炮车：前 10 分钟 3 波一次，10 分钟后 2 波一次，18 分钟后每波都有 */
  siegeEvery: 3,
  siegeEveryMid: 2,
  siegeMidAt: 600,
  siegeEveryLate: 1,
  siegeLateAt: 1080,
  /** 同一波小兵之间的出生间隔（米，沿路线排开） */
  spacing: 1.3,
} as const;

export const FOUNTAIN = {
  radius: 7.5,
  /** 己方单位每秒回复最大生命 / 法力的比例 */
  healPct: 0.15,
  /** 对闯入的敌方英雄每秒造成的真实伤害 */
  damagePerSec: 1500,
} as const;

export const DT = 1 / BALANCE.tickRate;
