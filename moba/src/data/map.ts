import type { Vec2 } from '../core/vec2';

/**
 * 地图配置（只写蓝方半张图，红方由对角线镜像自动生成）。
 *
 * 坐标：单位米，原点左上，y 轴向下。地图 120×120。
 * 蓝方基地在左下 (0,120) 角，红方在右上 (120,0) 角。
 * 对称方式：沿河道对角线 y=x 镜像，(x, y) → (y, x)。
 *   - 上路：蓝方段沿左边缘向上，红方段沿上边缘向右（镜像后仍是上路，保证每条路对双方公平）
 *   - 中路：x + y = 120 的对角线
 *   - 下路：蓝方段沿下边缘，红方段沿右边缘
 *   - 河道：y = x 对角线
 * 蓝方半图 = 满足 y > x 的区域。
 *
 * 墙体用“胶囊折线”描述：一串点 + 厚度。碰撞是圆对线段，贴墙滑动天然平滑。
 */
export const MAP_SIZE = 120;

export type LaneId = 'top' | 'mid' | 'bot';
export const LANES: readonly LaneId[] = ['top', 'mid', 'bot'];
export const LANE_NAMES: Record<LaneId, string> = { top: '对抗路', mid: '中路', bot: '发育路' };

export interface CapsuleLine {
  pts: Vec2[];
  /** 全宽（米） */
  w: number;
}

export type TowerTier = 'outer' | 'inner' | 'high';

export interface TowerSpot {
  lane: LaneId;
  tier: TowerTier;
  pos: Vec2;
}

export type CampKind = 'lizard' | 'wolves' | 'owls' | 'blueBuff' | 'redBuff';

export interface CampSpot {
  kind: CampKind;
  pos: Vec2;
}

/** 蓝方半图的原始配置 */
interface HalfMapDef {
  walls: CapsuleLine[];
  bushes: CapsuleLine[];
  /** 蓝方出兵路线的前半段（到地图中线为止），后半段由镜像生成 */
  laneHalf: Record<LaneId, Vec2[]>;
  towers: TowerSpot[];
  crystal: Vec2;
  fountain: Vec2;
  /** 英雄出生点（泉水附近） */
  spawn: Vec2;
  camps: CampSpot[];
}

const p = (x: number, y: number): Vec2 => ({ x, y });

/**
 * 沿中路对角线 x + y = 120 反射：(x, y) → (120 − y, 120 − x)。
 * 上半野区只写一份，下半野区由它反射生成（上路 ↔ 下路，河道和中路保持不变）。
 */
const reflectMid = (v: Vec2): Vec2 => ({ x: 120 - v.y, y: 120 - v.x });
const reflectLine = (l: CapsuleLine): CapsuleLine => ({ pts: l.pts.map(reflectMid), w: l.w });

/** 上半野区（蓝方侧）的森林：大块林地之间留出小路与营地空地 */
const JUNGLE_WALLS: CapsuleLine[] = [
  // 基地围墙（上路入口与中路入口之间）
  { pts: [p(15, 80), p(19, 86), p(20, 92)], w: 4.5 },
  // 贴上路的林带（留出通往蜥蜴营地与蓝增益的两个入口）
  { pts: [p(18, 22), p(18.5, 30)], w: 5 },
  { pts: [p(18.5, 41), p(18.5, 51)], w: 6 },
  { pts: [p(19.5, 63), p(20.5, 76)], w: 6 },
  // 蜥蜴营地与河道之间
  { pts: [p(29, 42), p(36, 47)], w: 6 },
  // 蓝增益与中路之间
  { pts: [p(33, 63), p(38, 67)], w: 5.5 },
  { pts: [p(25, 84), p(29, 80)], w: 4 },
  // 野区与河道、中路交汇处的小林
  { pts: [p(48, 57), p(51, 60)], w: 4 },
];

/** 上半野区草丛 */
const JUNGLE_BUSHES: CapsuleLine[] = [
  // 上路外塔前
  { pts: [p(14.5, 32), p(14.5, 38)], w: 2.4 },
  // 中路外塔侧
  { pts: [p(37, 73), p(40, 70)], w: 2.2 },
  // 河道
  { pts: [p(45, 49), p(48, 52)], w: 2.6 },
  // 蓝增益旁
  { pts: [p(22, 54), p(24, 58)], w: 2.4 },
];

/** 其它草丛（已在两侧对称写好） */
const LANE_BUSHES: CapsuleLine[] = [];

const BLUE_HALF: HalfMapDef = {
  walls: [...JUNGLE_WALLS, ...JUNGLE_WALLS.map(reflectLine)],
  bushes: [...LANE_BUSHES, ...JUNGLE_BUSHES, ...JUNGLE_BUSHES.map(reflectLine)],
  laneHalf: {
    top: [p(13, 100), p(8, 90), p(8, 16), p(10, 10), p(16, 8)],
    mid: [p(20, 100), p(60, 60)],
    bot: [p(21, 107), p(30, 112), p(104, 112), p(110, 110), p(112, 104)],
  },
  towers: [
    // 塔略偏离路线中心，让小兵能从旁边绕过
    { lane: 'top', tier: 'outer', pos: p(10.5, 40) },
    { lane: 'top', tier: 'inner', pos: p(10.5, 63) },
    { lane: 'top', tier: 'high', pos: p(10.5, 86) },
    { lane: 'mid', tier: 'outer', pos: p(42.3, 74.3) },
    { lane: 'mid', tier: 'inner', pos: p(33.3, 83.3) },
    { lane: 'mid', tier: 'high', pos: p(25.3, 91.3) },
    { lane: 'bot', tier: 'outer', pos: p(80, 109.5) },
    { lane: 'bot', tier: 'inner', pos: p(57, 109.5) },
    { lane: 'bot', tier: 'high', pos: p(34, 109.5) },
  ],
  crystal: p(16, 104),
  fountain: p(6.5, 113.5),
  spawn: p(9, 111),
  camps: [
    { kind: 'blueBuff', pos: p(28, 58) },
    { kind: 'lizard', pos: p(24, 36) },
    { kind: 'owls', pos: p(41, 56) },
    // 下半野区的营地位置由上半野区沿中路反射得到
    { kind: 'redBuff', pos: reflectMid(p(28, 58)) },
    { kind: 'wolves', pos: reflectMid(p(24, 36)) },
    { kind: 'owls', pos: reflectMid(p(41, 56)) },
  ],
};

/** 河道上的两个中立 Boss 巢穴（位于对角线上，天然对称） */
export const BOSS_PITS = {
  /** 上河道：玄甲巨龟（全队金币经验） */
  turtle: p(30, 30),
  /** 下河道：霆角龙王（召唤先锋） */
  dragon: p(90, 90),
} as const;

/** Boss 巢穴的围墙：各在巢穴两侧留出入口 */
const BOSS_WALLS: CapsuleLine[] = [
  // 巢穴靠地图角落一侧的弧形岩壁（自身关于 y=x 对称）
  { pts: [p(21, 30), p(23, 23), p(30, 21)], w: 3 },
  { pts: [p(90, 99), p(97, 97), p(99, 90)], w: 3 },
];

export const RIVER_HALF_WIDTH = 4.5;
export const LANE_HALF_WIDTH = 4.5;

// ————————————————————————— 构建完整地图 —————————————————————————

export const mirror = (v: Vec2): Vec2 => ({ x: v.y, y: v.x });
const mirrorLine = (l: CapsuleLine): CapsuleLine => ({ pts: l.pts.map(mirror), w: l.w });

export type TeamSide = 0 | 1;

export interface BuiltMap {
  size: number;
  walls: CapsuleLine[];
  bushes: CapsuleLine[];
  /** 各队各路完整行进路线（从己方基地到敌方基地） */
  lanes: Record<TeamSide, Record<LaneId, Vec2[]>>;
  towers: Record<TeamSide, TowerSpot[]>;
  crystal: Record<TeamSide, Vec2>;
  fountain: Record<TeamSide, Vec2>;
  spawn: Record<TeamSide, Vec2>;
  camps: Record<TeamSide, CampSpot[]>;
  bossPits: typeof BOSS_PITS;
}

function fullLane(half: Vec2[]): Vec2[] {
  const back = half.map(mirror).reverse();
  // 中路两半在中心点重合，去重
  const last = half[half.length - 1]!;
  const first = back[0]!;
  const dup = Math.abs(last.x - first.x) < 1e-6 && Math.abs(last.y - first.y) < 1e-6;
  return [...half, ...(dup ? back.slice(1) : back)];
}

export function buildMap(): BuiltMap {
  const h = BLUE_HALF;
  const blueLanes = {
    top: fullLane(h.laneHalf.top),
    mid: fullLane(h.laneHalf.mid),
    bot: fullLane(h.laneHalf.bot),
  };
  // 红方路线 = 蓝方同一路线的镜像（镜像后恰好是从红方基地出发）
  const redLanes = {
    top: blueLanes.top.map(mirror),
    mid: blueLanes.mid.map(mirror),
    bot: blueLanes.bot.map(mirror),
  };
  return {
    size: MAP_SIZE,
    walls: [...h.walls, ...h.walls.map(mirrorLine), ...BOSS_WALLS],
    bushes: [...h.bushes, ...h.bushes.map(mirrorLine)],
    lanes: { 0: blueLanes, 1: redLanes },
    towers: {
      0: h.towers,
      1: h.towers.map((t) => ({ ...t, pos: mirror(t.pos) })),
    },
    crystal: { 0: h.crystal, 1: mirror(h.crystal) },
    fountain: { 0: h.fountain, 1: mirror(h.fountain) },
    spawn: { 0: h.spawn, 1: mirror(h.spawn) },
    camps: {
      0: h.camps,
      1: h.camps.map((c) => ({ ...c, pos: mirror(c.pos) })),
    },
    bossPits: BOSS_PITS,
  };
}
