import type { Vec2 } from '../core/vec2';
import type { Affects, Effect, ProjectileVfx, Shape, AreaVfx, StatBlock } from '../data/schema';
import type { Aim, AttackMode } from './commands';
import type { LaneId } from '../data/map';

/**
 * 逻辑层实体定义。全部是可序列化的纯数据（不引用配置对象，只存 id），
 * 便于快照、回放和将来的联机同步。
 */
export type EntityId = number;
/** 0 蓝方，1 红方，2 中立 */
export type Team = 0 | 1 | 2;
export const NEUTRAL: Team = 2;

export type UnitKind = 'hero' | 'minion' | 'monster' | 'tower' | 'crystal' | 'summon' | 'dummy';

/** 效果上下文：技能 / 被动 / 增益执行效果时携带的信息 */
export interface EffectCtx {
  casterId: EntityId;
  team: Team;
  /** 数值档位：技能等级，或被动 / 增益的英雄等级 */
  rank: number;
  /** 技能槽，-1 表示非技能来源 */
  slot: number;
  /** 本次施法的唯一编号（被动“每次施法触发一次”用） */
  castId: number;
  /** 是否算作技能伤害（触发“技能命中”类被动） */
  isSkill: boolean;
  /** 效果原点（区域 / 弹道起点） */
  origin: Vec2;
  /** 瞄准方向（单位向量） */
  dir: Vec2;
  /** 瞄准落点 */
  point: Vec2;
  /** 当前命中目标（0 表示无） */
  targetId: EntityId;
  /** 指向性技能锁定的主目标 */
  primaryId: EntityId;
  /** 蓄力比例 0~1 */
  charge: number;
}

export interface BuffInstance {
  id: string;
  sourceId: EntityId;
  stacks: number;
  /** 剩余秒数，Infinity 表示永久 */
  remaining: number;
  /** 周期效果累积时间 */
  acc: number;
  rank: number;
}

export interface Shield {
  amount: number;
  remaining: number;
  sourceId: EntityId;
}

export interface SlowEntry {
  power: number;
  remaining: number;
}

export interface StatusState {
  stun: number;
  airborne: number;
  /** 本次击飞总时长（渲染抛物线用） */
  airborneTotal: number;
  silence: number;
  slows: SlowEntry[];
}

/** 强制位移：主动冲刺或被击退 */
export interface ForcedMove {
  kind: 'dash' | 'knockback';
  dirX: number;
  dirY: number;
  speed: number;
  /** 剩余距离 */
  remaining: number;
  /** toTarget 冲刺：每帧重新朝向目标 */
  targetId: EntityId;
  /** 冲刺到目标时的停止距离 */
  stopDist: number;
  passHit?: Effect[];
  stopOnHero?: Effect[];
  onEnd?: Effect[];
  ctx?: EffectCtx;
  hitIds: EntityId[];
  untargetable: boolean;
  /** 击退撞墙时的眩晕时长与来源 */
  wallStun?: number;
  sourceId?: EntityId;
}

export interface AttackState {
  /** 距离下次可攻击的剩余秒数 */
  cd: number;
  /** 前摇剩余秒数（>0 表示正在出手） */
  windup: number;
  /** 本次出手的目标 */
  swingTarget: EntityId;
  /** 攻击指令锁定的目标 */
  orderTarget: EntityId;
  /** 攻击指令剩余保持时间 */
  orderTime: number;
  orderMode: AttackMode;
}

export interface CastState {
  slot: 0 | 1 | 2;
  /** -1 表示技能本体，>=0 表示二段施放的第几段 */
  stage: number;
  phase: 'charging' | 'windup' | 'recovery';
  /** 当前阶段剩余时间（蓄力阶段为已蓄时间） */
  timer: number;
  castId: number;
  dir: Vec2;
  point: Vec2;
  targetId: EntityId;
  charge: number;
}

export interface RecastState {
  /** 下一次施放的段号 */
  next: number;
  /** 窗口剩余秒数 */
  remaining: number;
}

export interface HeroState {
  pid: number;
  level: number;
  xp: number;
  skillLevels: [number, number, number];
  skillPoints: number;
  /** 各技能剩余冷却（秒） */
  cooldowns: [number, number, number];
  /** 各技能冷却总时长（界面转圈用） */
  cooldownTotals: [number, number, number];
  recast: [RecastState | null, RecastState | null, RecastState | null];
  /** 被动“每次施法触发一次”的记录：触发器序号 → castId */
  passiveStamp: number[];
  gold: number;
  kills: number;
  deaths: number;
  assists: number;
  lastHits: number;
  /** 连续击杀数（死亡清零） */
  streak: number;
  /** 复活时刻（秒），存活时为 0 */
  respawnAt: number;
  /** 造成的英雄伤害 / 承受伤害 / 治疗（结算与 MVP 用） */
  damageDealt: number;
  damageTaken: number;
  /** 对建筑造成的伤害（推塔贡献） */
  towerDamage: number;
  /** 给队友的治疗量 + 护盾量（辅助贡献） */
  support: number;
  /** 回城引导剩余秒数，0 表示没有在回城 */
  recall: number;
  /** 召唤师技能 */
  summoner: { id: string; cd: number };
  /** 装备栏（6 格，存装备 id） */
  items: (string | null)[];
  /** 本局获得的总金币 */
  goldEarned: number;
  /** 恢复按钮冷却 */
  restoreCd: number;
  /** 最近一次击杀时刻与多杀计数（双杀、三杀……） */
  lastKillAt: number;
  multiKill: number;
  /** 周期被动的计时 */
  passiveTimer: number;
}

export interface Unit {
  id: EntityId;
  kind: UnitKind;
  team: Team;
  /** 配置 id（英雄 / 木桩 / 小兵…） */
  defId: string;
  name: string;
  pos: Vec2;
  /** 上一逻辑帧的位置（渲染插值） */
  prevPos: Vec2;
  facing: number;
  prevFacing: number;
  radius: number;
  /** 不可移动的静态单位（建筑、木桩） */
  static: boolean;
  alive: boolean;
  hp: number;
  mp: number;
  /** 当前等级下的基础属性（不含装备 / 增益） */
  baseStats: StatBlock;
  /** 最终属性 */
  stats: StatBlock;
  /** 额外物攻 = 最终物攻 - 基础物攻 */
  bonusAd: number;
  statsDirty: boolean;
  status: StatusState;
  buffs: BuffInstance[];
  shields: Shield[];
  forced: ForcedMove | null;
  attack: AttackState;
  cast: CastState | null;
  /** 摇杆 / 键盘移动方向（单位向量），null 表示没有移动输入 */
  moveDir: Vec2 | null;
  /** 寻路移动的目标与路径 */
  navGoal: Vec2 | null;
  navPath: Vec2[];
  /** 下次允许重新寻路的时间（秒） */
  navRepathAt: number;
  /** 普攻追击目标（由普攻系统每帧设置，移动系统消费） */
  chaseTarget: EntityId;
  hero: HeroState | null;
  /** 天生状态：不可选中 / 无敌 / 不死（木桩） */
  innate: { untargetable: boolean; invulnerable: boolean; immortal: boolean };
  /** 最近一次受到伤害的时间（秒） */
  lastDamagedAt: number;
  /** 出生点（木桩复位等） */
  home: Vec2;
  /** 巡逻点（移动木桩用） */
  patrol: Vec2[] | null;
  patrolIdx: number;
  /** 排队中的施法（输入缓冲） */
  queuedCast: { slot: 0 | 1 | 2; aim: Aim; phase?: 'start' | 'release'; until: number } | null;
  /** 小兵沿路线前进：路线 id 与当前路点序号 */
  lane: { id: LaneId; idx: number } | null;
  /** 防御塔连击：当前目标与层数 */
  rampTarget: EntityId;
  rampStacks: number;
  /** 最近伤害过自己的敌方英雄（助攻判定） */
  recentAttackers: { id: EntityId; t: number }[];
  /** 小兵 / 塔锁定目标（转火用） */
  lockTarget: EntityId;
  /** 生成时刻（秒） */
  bornAt: number;
  /** 最近一次伤害自己的单位 */
  lastAttacker: EntityId;
  /** 野怪：正在脱战回营 */
  resetting: boolean;
  /** 野怪 / Boss 技能计时与前摇 */
  skillTimer: number;
  skillWindup: number;
  /** 视野：对哪些队伍可见（第 0 位蓝方，第 1 位红方） */
  visibleMask: number;
  /** 在草丛里攻击 / 施法后暴露到此刻 */
  revealUntil: number;
  /** 所在草丛编号（0 表示不在草丛里） */
  bush: number;
}

export interface Projectile {
  id: EntityId;
  ownerId: EntityId;
  team: Team;
  pos: Vec2;
  prevPos: Vec2;
  dirX: number;
  dirY: number;
  speed: number;
  remaining: number;
  width: number;
  pierce: boolean;
  affects: Affects;
  hitIds: EntityId[];
  onHit: Effect[];
  onEnd: Effect[] | null;
  stopAtWall: boolean;
  vfx: ProjectileVfx;
  ctx: EffectCtx;
  /** 普攻弹道：追踪目标，命中结算普攻伤害 */
  homingTarget: EntityId;
  isAttack: boolean;
  /** 普攻弹道命中时是否暴击（出手时决定） */
  crit: boolean;
  dead: boolean;
}

export interface Zone {
  id: EntityId;
  ownerId: EntityId;
  team: Team;
  pos: Vec2;
  dir: Vec2;
  shape: Shape;
  remaining: number;
  duration: number;
  interval: number;
  acc: number;
  affects: Affects;
  onTick: Effect[];
  follow: boolean;
  vfx: AreaVfx | null;
  ctx: EffectCtx;
}

/** 延迟生效的区域效果（地面预警） */
export interface PendingArea {
  id: EntityId;
  remaining: number;
  total: number;
  pos: Vec2;
  dir: Vec2;
  shape: Shape;
  affects: Affects;
  onHit: Effect[];
  onAnyHit: Effect[] | null;
  vfx: AreaVfx | null;
  ctx: EffectCtx;
  team: Team;
}

export function isEnemy(a: { team: Team }, b: { team: Team }): boolean {
  return a.team !== b.team;
}
