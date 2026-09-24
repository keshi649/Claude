import type { EntityId } from './entity';

/**
 * 命令：逻辑层唯一的写入口。玩家输入和 AI 决策都编译成命令，
 * 在逻辑帧开始时统一执行。命令是可序列化的纯数据 —— 这是给联机留的口子：
 * 客户端只需上传命令，服务器用同一套 World.step 推进。
 */
export type Aim =
  | { k: 'auto' }
  | { k: 'dir'; x: number; y: number }
  | { k: 'point'; x: number; y: number }
  | { k: 'unit'; id: EntityId };

export type AttackMode = 'auto' | 'farm' | 'tower';

export type DebugOp = 'refreshCd' | 'levelUp' | 'maxLevel' | 'addGold' | 'noCooldown' | 'heal' | 'dummyArmor' | 'stress';

export type Command =
  /** 方向移动（摇杆 / WASD），dir 为 null 表示松开 */
  | { t: 'move'; pid: number; dir: { x: number; y: number } | null }
  /** 寻路移动到某点（AI、调试寻路） */
  | { t: 'moveTo'; pid: number; x: number; y: number }
  | { t: 'stop'; pid: number }
  /** 普攻：auto 默认优先英雄；farm 只打小兵和野怪（补刀键）；tower 只打建筑（推塔键） */
  | { t: 'attack'; pid: number; mode: AttackMode }
  /** 攻击指定单位（AI 用） */
  | { t: 'attackUnit'; pid: number; id: EntityId }
  /** 施法。蓄力技能用 phase 区分按下 / 松开 */
  | { t: 'cast'; pid: number; slot: 0 | 1 | 2; aim: Aim; phase?: 'start' | 'release' }
  | { t: 'levelSkill'; pid: number; slot: 0 | 1 | 2 }
  /** 取消蓄力中的技能（返还法力） */
  | { t: 'cancelCast'; pid: number }
  /** 回城（原地引导，移动 / 受伤 / 施法打断） */
  | { t: 'recall'; pid: number }
  /** 恢复（持续回血回蓝，受伤中断） */
  | { t: 'restore'; pid: number }
  /** 召唤师技能 */
  | { t: 'summoner'; pid: number; aim: Aim }
  | { t: 'buy'; pid: number; item: string }
  | { t: 'sell'; pid: number; slot: number }
  /** 一键购买推荐出装的下一件 */
  | { t: 'buyRecommended'; pid: number }
  | { t: 'debug'; pid: number; op: DebugOp; value?: number };
