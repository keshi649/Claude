/**
 * 数据配置的类型定义（英雄、技能、效果、增益、单位）。
 * 引擎只解释这些声明式结构；新增英雄 = 在 data/heroes 下新增一个配置文件并注册。
 */

export type DamageType = 'physical' | 'magic' | 'true';
export type Role = 'tank' | 'fighter' | 'assassin' | 'mage' | 'marksman' | 'support';

export const ROLE_NAMES: Record<Role, string> = {
  tank: '坦克',
  fighter: '战士',
  assassin: '刺客',
  mage: '法师',
  marksman: '射手',
  support: '辅助',
};

// ————————————————————————— 属性 —————————————————————————

export interface StatBlock {
  /** 最大生命 */
  maxHp: number;
  /** 最大法力 */
  maxMp: number;
  /** 物理攻击 */
  ad: number;
  /** 法术强度 */
  ap: number;
  /** 物理防御 */
  armor: number;
  /** 法术防御 */
  mr: number;
  /** 攻速加成（0.3 = +30%） */
  attackSpeed: number;
  /** 移动速度（米/秒） */
  moveSpeed: number;
  /** 暴击率 0~1 */
  crit: number;
  /** 暴击伤害倍率（默认 2） */
  critDmg: number;
  /** 冷却缩减 0~1（有上限） */
  cdr: number;
  /** 物理吸血 0~1 */
  lifesteal: number;
  /** 固定物理穿透 */
  armorPen: number;
  /** 百分比物理穿透 0~1 */
  armorPenPct: number;
  /** 固定法术穿透 */
  mrPen: number;
  /** 百分比法术穿透 0~1 */
  mrPenPct: number;
  /** 每秒回血 */
  hpRegen: number;
  /** 每秒回蓝 */
  mpRegen: number;
  /** 普攻射程（米） */
  range: number;
  /** 对野怪的额外伤害比例（打野装） */
  monsterDmg: number;
}

export type StatKey = keyof StatBlock;
export type StatMods = Partial<StatBlock>;

export const STAT_KEYS: readonly StatKey[] = [
  'maxHp', 'maxMp', 'ad', 'ap', 'armor', 'mr', 'attackSpeed', 'moveSpeed', 'crit', 'critDmg',
  'cdr', 'lifesteal', 'armorPen', 'armorPenPct', 'mrPen', 'mrPenPct', 'hpRegen', 'mpRegen', 'range', 'monsterDmg',
];

export const STAT_NAMES: Record<StatKey, string> = {
  maxHp: '最大生命', maxMp: '最大法力', ad: '物理攻击', ap: '法术强度', armor: '物理防御',
  mr: '法术防御', attackSpeed: '攻击速度', moveSpeed: '移动速度', crit: '暴击率',
  critDmg: '暴击伤害', cdr: '冷却缩减', lifesteal: '物理吸血', armorPen: '物理穿透',
  armorPenPct: '物理穿透%', mrPen: '法术穿透', mrPenPct: '法术穿透%', hpRegen: '每秒回血',
  mpRegen: '每秒回蓝', range: '攻击距离', monsterDmg: '对野怪伤害',
};

/** 用部分字段生成完整属性块（未写的为 0，暴击伤害默认 2） */
export function statBlock(s: StatMods): StatBlock {
  const out = {} as StatBlock;
  for (const k of STAT_KEYS) out[k] = s[k] ?? 0;
  if (s.critDmg === undefined) out.critDmg = 2;
  return out;
}

// ————————————————————————— 形状与数值缩放 —————————————————————————

export type Shape =
  | { k: 'circle'; r: number }
  /** 扇形：angle 为全角（度），从原点沿朝向展开 */
  | { k: 'cone'; r: number; angle: number }
  /** 矩形：从原点沿朝向延伸 length，宽 width */
  | { k: 'rect'; length: number; width: number }
  | { k: 'ring'; r: number; inner: number };

/**
 * 数值缩放。base 按“等级档位”取值：技能里是技能等级，被动 / 增益里是英雄等级；
 * 数组不够长时取最后一个。其余字段为属性加成系数。
 */
export interface Scaling {
  base: readonly number[];
  /** 总物攻系数 */
  ad?: number;
  /** 额外物攻系数（装备 / 增益带来的部分） */
  bonusAd?: number;
  ap?: number;
  /** 施法者最大生命系数 */
  maxHp?: number;
  /** 施法者额外生命系数 */
  bonusHp?: number;
  /** 施法者最大法力系数 */
  maxMp?: number;
  /** 目标最大生命系数 */
  targetMaxHp?: number;
  /** 目标已损生命系数 */
  targetMissingHp?: number;
  /** 蓄力满时额外倍率（0.5 = 满蓄力伤害 ×1.5） */
  charge?: number;
  /** 整体倍率 */
  mult?: number;
}

/** 效果作用对象的阵营筛选 */
export type Affects = 'enemies' | 'allies' | 'alliesAndSelf' | 'all';

export type CcKind = 'stun' | 'airborne' | 'silence' | 'slow' | 'knockback';

export const CC_NAMES: Record<CcKind, string> = {
  stun: '眩晕',
  airborne: '击飞',
  silence: '沉默',
  slow: '减速',
  knockback: '击退',
};

export type Cond =
  | { k: 'targetHasBuff'; buff: string; fromCaster?: boolean }
  | { k: 'targetIsHero' }
  /** 目标到效果原点的距离区间 */
  | { k: 'distFromOrigin'; gt?: number; lt?: number }
  | { k: 'targetHpBelow'; pct: number }
  | { k: 'chargeAtLeast'; ratio: number }
  | { k: 'casterHasBuff'; buff: string }
  /** 当前目标是否为指向性技能锁定的主目标 */
  | { k: 'isPrimaryTarget' }
  /** 当前目标是否为施法者的友军（含自己） */
  | { k: 'targetIsAlly' }
  /** 当前目标的单位类型 */
  | { k: 'targetKind'; kinds: ('hero' | 'minion' | 'monster' | 'dummy')[] }
  /** 施法者身上某增益的层数 ≥ n */
  | { k: 'casterBuffStacks'; buff: string; gte: number }
  | { k: 'not'; c: Cond };

// ————————————————————————— 视觉描述（表现层解释） —————————————————————————

export type VfxStyle = 'slash' | 'slam' | 'burst' | 'wave' | 'glow' | 'spin';

export interface AreaVfx {
  color: number;
  style?: VfxStyle;
}

export interface ProjectileVfx {
  color: number;
  style?: 'orb' | 'arrow' | 'blade' | 'bolt';
  size?: number;
}

/** 打击力度：0 普通，1 中（顿帧），2 重（顿帧 + 震屏） */
export type Impact = 0 | 1 | 2;

// ————————————————————————— 效果 —————————————————————————

/** 施加效果的对象：self = 施法者，target = 当前命中目标（默认） */
export type EffectTo = 'self' | 'target';

export type Effect =
  | { t: 'damage'; dtype: DamageType; amount: Scaling; impact?: Impact }
  | { t: 'heal'; amount: Scaling; to?: EffectTo }
  /** 回复法力 */
  | { t: 'mana'; amount: Scaling; to?: EffectTo }
  | { t: 'shield'; amount: Scaling; duration: number; to?: EffectTo }
  /** 控制。slow 的 power 为减速比例（0.4 = 40%）；knockback 的 power 为击退距离（米）；
   *  wallStun：击退途中撞墙时额外眩晕的秒数 */
  | { t: 'cc'; cc: CcKind; duration: number; power?: number; wallStun?: number }
  /** 重置普攻冷却（位移后立刻接普攻） */
  | { t: 'resetAttack' }
  | { t: 'buff'; buff: string; duration?: number; to?: EffectTo; stacks?: number }
  | { t: 'removeBuff'; buff: string; to?: EffectTo }
  | {
      t: 'projectile';
      speed: number;
      range: number;
      /** 碰撞半径 */
      width: number;
      pierce?: boolean;
      affects?: Affects;
      onHit: Effect[];
      /** 飞到尽头 / 撞墙时触发（落点在弹道当前位置） */
      onEnd?: Effect[];
      /** 撞墙时停止并触发 */
      stopAtWall?: boolean;
      vfx: ProjectileVfx;
    }
  | {
      t: 'dash';
      /** direction：沿瞄准方向；toTarget：冲向目标单位；toPoint：冲到落点 */
      mode: 'direction' | 'toTarget' | 'toPoint';
      distance?: number;
      speed: number;
      /** 途经敌人时触发（每个敌人一次） */
      passHit?: Effect[];
      /** 撞到第一个敌方英雄时停下并触发 */
      stopOnHero?: Effect[];
      onEnd?: Effect[];
      /** 位移期间不可被选中 */
      untargetable?: boolean;
      /** 视觉拖尾颜色 */
      trail?: number;
    }
  | {
      t: 'area';
      shape: Shape;
      /** 原点：施法者 / 瞄准落点 / 当前目标 */
      at?: 'caster' | 'point' | 'target';
      /** 延迟生效（秒），延迟期间地面显示预警 */
      delay?: number;
      affects?: Affects;
      onHit: Effect[];
      /** 至少命中一个目标时额外对施法者触发 */
      onAnyHit?: Effect[];
      vfx?: AreaVfx;
    }
  | {
      t: 'zone';
      shape: Shape;
      at?: 'caster' | 'point';
      duration: number;
      interval: number;
      affects?: Affects;
      onTick: Effect[];
      /** 区域跟随施法者移动 */
      follow?: boolean;
      vfx?: AreaVfx;
    }
  | { t: 'blink'; to: 'point' | 'behindTarget'; maxDist?: number }
  | { t: 'refreshCooldown'; slot: 0 | 1 | 2 }
  | { t: 'if'; cond: Cond; then: Effect[]; else?: Effect[] };

// ————————————————————————— 技能 —————————————————————————

export type Targeting = 'direction' | 'unit' | 'point' | 'self';
export type UnitFilter = 'enemy' | 'ally' | 'any' | 'monster';

/** 瞄准指示器 */
export type IndicatorSpec =
  | { k: 'line'; width: number }
  | { k: 'cone'; angle: number }
  | { k: 'circle'; r: number }
  | { k: 'self'; r: number }
  | { k: 'unit' };

export interface IconSpec {
  /** 图标字（程序绘制，不用图片） */
  glyph: string;
  color: number;
}

export type AiTag = 'poke' | 'engage' | 'escape' | 'cc' | 'aoe' | 'execute' | 'shield' | 'heal' | 'farm' | 'gapclose';

/** 技能的一段（二段技能的每一段都是一个 SkillStage） */
export interface SkillStage {
  name: string;
  targeting: Targeting;
  /** 施法距离 / 方向技能的指示长度 */
  range: number;
  indicator: IndicatorSpec;
  /** 指向性技能的目标筛选：monster = 只能选小兵和野怪（打野技能） */
  unitFilter?: UnitFilter;
  /** 前摇（秒） */
  windup: number;
  /** 后摇（秒），可被移动取消 */
  recovery: number;
  effects: Effect[];
  icon?: IconSpec;
}

export interface SkillDef extends SkillStage {
  id: string;
  /** 技能说明（界面展示） */
  desc: string;
  icon: IconSpec;
  /** 是否为大招（技能 3） */
  ult?: boolean;
  /** 最高等级：普通技能 6，大招 3 */
  maxLevel: number;
  cooldown: readonly number[];
  cost: readonly number[];
  /** 二段施放：第一段释放后 window 秒内可再次施放 stages[0]…；窗口结束或放完最后一段才进入冷却 */
  recast?: { window: number; stages: SkillStage[] };
  /** 按住蓄力：min~max 秒，Cond / Scaling 中通过 charge 读取蓄力比例 */
  charge?: { min: number; max: number };
  ai: { tags: AiTag[] };
}

// ————————————————————————— 增益 / 被动 —————————————————————————

export interface BuffDef {
  id: string;
  name: string;
  kind: 'buff' | 'debuff' | 'mark';
  maxStacks?: number;
  /** 固定属性加成（按层数叠加） */
  stats?: StatMods;
  /** 百分比属性加成（按层数叠加） */
  statsPct?: StatMods;
  /** 拥有者普攻命中时触发（ctx.target = 被命中者） */
  onAttackHit?: Effect[];
  /** 普攻命中触发后移除自身 */
  consumeOnAttack?: boolean;
  /** 周期效果：ctx.caster = 施加者，ctx.target = 拥有者 */
  interval?: { every: number; effects: Effect[] };
  /** 状态标记 */
  flags?: { untargetable?: boolean; invulnerable?: boolean };
  /** 表现：拥有者身上的光环颜色 */
  aura?: number;
}

export type TriggerOn = 'skillHit' | 'attackHit' | 'damaged' | 'kill' | 'interval';

export interface PassiveTrigger {
  on: TriggerOn;
  /** 只对英雄生效 */
  heroOnly?: boolean;
  /** 同一次施法最多触发一次（技能命中多个目标时） */
  oncePerCast?: boolean;
  /** interval 触发器的周期（秒） */
  every?: number;
  effects: Effect[];
}

export interface PassiveDef {
  name: string;
  desc: string;
  icon: IconSpec;
  triggers: PassiveTrigger[];
}

// ————————————————————————— 英雄 / 单位 —————————————————————————

export interface AttackDef {
  /** 无攻速加成时的攻击间隔（秒） */
  interval: number;
  /** 前摇占攻击间隔的比例 */
  windupRatio: number;
  /** 远程普攻的弹道；无则为近战 */
  projectile?: { speed: number; vfx: ProjectileVfx };
}

export type Emblem = 'shield' | 'blade' | 'dagger' | 'star' | 'bow' | 'lantern';

export interface HeroDef {
  id: string;
  name: string;
  title: string;
  role: Role;
  /** 主色 / 辅色（程序绘制） */
  palette: { primary: number; secondary: number };
  emblem: Emblem;
  radius: number;
  base: StatBlock;
  /** 每级成长 */
  growth: StatMods;
  attack: AttackDef;
  passive: PassiveDef;
  skills: readonly [SkillDef, SkillDef, SkillDef];
  /** 英雄专属增益定义 */
  buffs?: BuffDef[];
  /** AI 加点顺序（技能槽 0/1/2，大招在满足等级时优先） */
  skillOrder: readonly (0 | 1 | 2)[];
  /** 推荐出装（成装 id 顺序），“推荐购买”按这个顺序逐件购买 */
  build: readonly string[];
  /** 英雄简介（选英雄界面） */
  intro: string;
  /** 操作难度 1~3 */
  difficulty: 1 | 2 | 3;
}

/** 小兵 / 野怪 / 建筑 / 木桩等非英雄单位的配置 */
export type UnitShape = 'square' | 'triangle' | 'hexagon' | 'bigsquare' | 'dummy' | 'tower' | 'crystal' | 'beast';

export interface UnitDef {
  id: string;
  name: string;
  radius: number;
  base: StatBlock;
  /** 每分钟属性成长比例（小兵随时间变强），如 { maxHp: 0.05 } = 每分钟 +5% */
  growthPerMin?: StatMods;
  attack?: AttackDef;
  /** 最后一击的金币 */
  gold: number;
  /** 击杀经验（附近敌方英雄分享） */
  xp: number;
  shape: UnitShape;
  /** 野怪 / Boss 的主色（程序绘制用） */
  color?: number;
}
