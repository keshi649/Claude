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

const BLUE_HALF: HalfMapDef = {
  walls: [
    // —— 基地围墙：上路入口与中路入口之间、中路入口与下路入口之间 ——
    { pts: [p(15, 80), p(19, 86), p(20, 91)], w: 4 },
    { pts: [p(39, 102), p(33, 100), p(30, 98)], w: 4 },

    // —— 上半野区（上路与中路之间，蓝方侧）——
    // 贴上路的山脊（两段，中间留入口）
    { pts: [p(18, 23), p(18, 44)], w: 3 },
    { pts: [p(18, 54), p(18, 72)], w: 3 },
    // 贴河道的山脊
    { pts: [p(25, 33), p(38, 46)], w: 3 },
    // 贴中路的山脊
    { pts: [p(25, 83), p(41, 67)], w: 3 },
    // 蓝增益营地的环形岩壁
    { pts: [p(24, 50), p(30, 48), p(35, 52)], w: 3 },
    { pts: [p(33, 60), p(33, 66)], w: 2.5 },
    // 野区中央的小岩块
    { pts: [p(44, 56), p(47, 59)], w: 3 },

    // —— 下半野区（中路与下路之间，蓝方侧）——
    // 贴下路的山脊（两段）
    { pts: [p(46, 102), p(64, 102)], w: 3 },
    { pts: [p(74, 102), p(96, 102)], w: 3 },
    // 贴河道的山脊
    { pts: [p(84, 94), p(72, 82)], w: 3 },
    // 贴中路的山脊
    { pts: [p(46, 87), p(62, 71)], w: 3 },
    // 红增益营地的环形岩壁
    { pts: [p(52, 96), p(50, 90), p(54, 86)], w: 3 },
    { pts: [p(62, 88), p(68, 88)], w: 2.5 },
    // 野区中央的小岩块
    { pts: [p(64, 80), p(67, 77)], w: 3 },
  ],
  bushes: [
    // 上路外塔前草丛
    { pts: [p(14.5, 30), p(14.5, 36)], w: 2.4 },
    // 中路两侧草丛
    { pts: [p(40, 72), p(43, 69)], w: 2.4 },
    // 下路外塔前草丛
    { pts: [p(84, 105.5), p(90, 105.5)], w: 2.4 },
    // 河道草丛（靠蓝方侧）
    { pts: [p(45, 49), p(48, 52)], w: 2.6 },
    { pts: [p(71, 75), p(74, 78)], w: 2.6 },
    // 野区草丛
    { pts: [p(26, 66), p(29, 70)], w: 2.4 },
    { pts: [p(66, 96), p(70, 96)], w: 2.4 },
  ],
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
    { kind: 'blueBuff', pos: p(28, 57) },
    { kind: 'lizard', pos: p(23, 37) },
    { kind: 'owls', pos: p(38, 58) },
    { kind: 'redBuff', pos: p(58, 93) },
    { kind: 'wolves', pos: p(84, 98) },
    { kind: 'owls', pos: p(56, 80) },
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
