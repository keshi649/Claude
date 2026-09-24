import { Container, Graphics, TilingSprite, type Texture } from 'pixi.js';
import { Rng } from '../core/rng';
import type { Vec2 } from '../core/vec2';
import { LANE_HALF_WIDTH, RIVER_HALF_WIDTH, type BuiltMap, type CapsuleLine } from '../data/map';
import { PALETTE } from './palette';
import type { GameTextures } from './textures';

/**
 * 地图美术（程序生成）：
 *   ground：地面层（世界米坐标，随镜头纵向压缩）—— 草地、林地、河道、道路、基地石板、泉水
 *   props：直立道具（树、松、岩石、高草），与单位一起按纵深排序，产生遮挡关系
 */
export interface Prop {
  tex: Texture;
  x: number;
  y: number;
  /** 显示宽度（米） */
  size: number;
  /** 锚点纵向位置（0~1，贴地点） */
  anchorY: number;
  kind: 'tree' | 'rock' | 'grass';
  /** 遮挡判定半径（米） */
  r: number;
  flip: boolean;
}

export interface PaintedMap {
  ground: Container;
  props: Prop[];
  water: TilingSprite;
}

function tiling(tex: Texture, x: number, y: number, w: number, h: number, metersPerTile: number): TilingSprite {
  const k = metersPerTile / tex.width;
  const t = new TilingSprite({ texture: tex, width: w / k, height: h / k });
  t.scale.set(k);
  t.position.set(x, y);
  return t;
}

function strokePath(g: Graphics, pts: readonly Vec2[], width: number, color: number, alpha = 1): void {
  if (pts.length === 1) {
    g.circle(pts[0]!.x, pts[0]!.y, width / 2).fill({ color, alpha });
    return;
  }
  g.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i]!.x, pts[i]!.y);
  g.stroke({ width, color, alpha, cap: 'round', join: 'round' });
}

function pathLength(pts: readonly Vec2[]): number {
  let l = 0;
  for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i]!.x - pts[i - 1]!.x, pts[i]!.y - pts[i - 1]!.y);
  return l;
}

/** 沿折线按距离 d 取点及切线方向 */
function along(pts: readonly Vec2[], d: number): { p: Vec2; tx: number; ty: number } {
  if (pts.length === 1) return { p: { ...pts[0]! }, tx: 1, ty: 0 };
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    const l = Math.hypot(b.x - a.x, b.y - a.y);
    if (d <= l || i === pts.length - 1) {
      const t = l > 0 ? Math.min(1, d / l) : 0;
      return { p: { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }, tx: l > 0 ? (b.x - a.x) / l : 1, ty: l > 0 ? (b.y - a.y) / l : 0 };
    }
    d -= l;
  }
  return { p: { ...pts[0]! }, tx: 1, ty: 0 };
}

/** 在一段胶囊折线覆盖的区域内撒点（沿线方向 step 米，横向按宽度分排） */
function scatter(line: CapsuleLine, step: number, rowGap: number, rng: Rng, fn: (x: number, y: number) => void): void {
  const len = pathLength(line.pts);
  const rows = Math.max(1, Math.round(line.w / rowGap));
  const n = Math.max(1, Math.round(len / step) + 1);
  for (let i = 0; i < n; i++) {
    const d = n === 1 ? len / 2 : (i / (n - 1)) * len;
    const { p, tx, ty } = along(line.pts, d);
    for (let r = 0; r < rows; r++) {
      const off = rows === 1 ? 0 : (r / (rows - 1) - 0.5) * (line.w - rowGap * 0.6);
      const jx = rng.range(-0.45, 0.45);
      const jy = rng.range(-0.45, 0.45);
      fn(p.x - ty * off + jx, p.y + tx * off + jy);
    }
  }
}

export function paintMap(map: BuiltMap, tex: GameTextures): PaintedMap {
  const S = map.size;
  const rng = new Rng(20240901);
  const ground = new Container();

  // —— 背景与草地 ——
  const bg = new Graphics();
  bg.rect(-30, -30, S + 60, S + 60).fill(0x1b2a17);
  ground.addChild(bg);
  ground.addChild(tiling(tex.grass, -2, -2, S + 4, S + 4, 7));

  // 野区（更暗、更潮湿）
  const jungle = new Graphics();
  const tris: Vec2[][] = [
    [{ x: 14, y: 18 }, { x: 14, y: 102 }, { x: 56, y: 60 }],
    [{ x: 18, y: 106 }, { x: 102, y: 106 }, { x: 60, y: 64 }],
  ];
  for (const tri of tris) {
    for (const t of [tri, tri.map((q) => ({ x: q.y, y: q.x }))]) {
      jungle.poly(t.flatMap((q) => [q.x, q.y])).fill({ color: 0x0f2210, alpha: 0.32 });
    }
  }
  ground.addChild(jungle);

  // —— 林地底色（墙体下方），让森林看起来连成一片 ——
  const floorMask = new Graphics();
  for (const w of map.walls) strokePath(floorMask, w.pts, w.w + 1.4, 0xffffff);
  const floor = tiling(tex.forestFloor, -2, -2, S + 4, S + 4, 5);
  floor.mask = floorMask;
  ground.addChild(floorMask, floor);

  // —— 河道：沙岸 + 流动的水面 ——
  const banks = new Graphics();
  banks.moveTo(-6, -6).lineTo(S + 6, S + 6).stroke({ width: RIVER_HALF_WIDTH * 2 + 1.6, color: 0x8f7d55, cap: 'butt' });
  banks.moveTo(-6, -6).lineTo(S + 6, S + 6).stroke({ width: RIVER_HALF_WIDTH * 2 + 0.5, color: 0x5b6a4a, cap: 'butt' });
  ground.addChild(banks);
  const riverMask = new Graphics();
  riverMask.moveTo(-6, -6).lineTo(S + 6, S + 6).stroke({ width: RIVER_HALF_WIDTH * 2, color: 0xffffff, cap: 'butt' });
  const water = tiling(tex.water, -6, -6, S + 12, S + 12, 9);
  water.mask = riverMask;
  ground.addChild(riverMask, water);

  // —— 道路：深色路肩 + 石板路面 ——
  const laneEdge = new Graphics();
  for (const k of ['top', 'mid', 'bot'] as const) strokePath(laneEdge, map.lanes[0][k], LANE_HALF_WIDTH * 2 + 0.9, 0x5e4e33, 0.9);
  ground.addChild(laneEdge);
  const laneMask = new Graphics();
  for (const k of ['top', 'mid', 'bot'] as const) strokePath(laneMask, map.lanes[0][k], LANE_HALF_WIDTH * 2, 0xffffff);
  const lanes = tiling(tex.dirt, -2, -2, S + 4, S + 4, 6);
  lanes.mask = laneMask;
  ground.addChild(laneMask, lanes);
  // 路边碎石
  const pebbles = new Graphics();
  for (const k of ['top', 'mid', 'bot'] as const) {
    const pts = map.lanes[0][k];
    const len = pathLength(pts);
    for (let d = 0; d < len; d += 0.9) {
      const { p, tx, ty } = along(pts, d);
      for (const side of [-1, 1]) {
        if (!rng.chance(0.55)) continue;
        const off = side * (LANE_HALF_WIDTH + rng.range(-0.1, 0.35));
        pebbles.circle(p.x - ty * off, p.y + tx * off, rng.range(0.12, 0.3)).fill({ color: rng.chance(0.5) ? 0x7d7362 : 0x9a917f, alpha: 0.9 });
      }
    }
  }
  ground.addChild(pebbles);

  // —— 基地石板广场、泉水、Boss 巢穴 ——
  const plazaMask = new Graphics();
  for (const team of [0, 1] as const) {
    plazaMask.circle(map.crystal[team].x, map.crystal[team].y, 8.5).fill(0xffffff);
    plazaMask.circle(map.fountain[team].x, map.fountain[team].y, 7.5).fill(0xffffff);
  }
  for (const pit of [map.bossPits.turtle, map.bossPits.dragon]) plazaMask.circle(pit.x, pit.y, 5.5).fill(0xffffff);
  const plaza = tiling(tex.stone, -2, -2, S + 4, S + 4, 4);
  plaza.mask = plazaMask;
  ground.addChild(plazaMask, plaza);

  const deco = new Graphics();
  for (const team of [0, 1] as const) {
    const c = map.crystal[team];
    const f = map.fountain[team];
    const tc = PALETTE.team[team];
    deco.circle(c.x, c.y, 8.5).stroke({ width: 0.35, color: 0x3c4048 });
    deco.circle(c.x, c.y, 5.5).stroke({ width: 0.12, color: tc, alpha: 0.6 });
    deco.circle(c.x, c.y, 3.2).stroke({ width: 0.12, color: tc, alpha: 0.6 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      deco
        .moveTo(c.x + Math.cos(a) * 3.2, c.y + Math.sin(a) * 3.2)
        .lineTo(c.x + Math.cos(a) * 5.5, c.y + Math.sin(a) * 5.5)
        .stroke({ width: 0.1, color: tc, alpha: 0.5 });
    }
    // 泉水：圆形水池
    deco.circle(f.x, f.y, 7.5).stroke({ width: 0.35, color: 0x3c4048 });
    deco.circle(f.x, f.y, 4.6).fill(0x3c4450);
    deco.circle(f.x, f.y, 4.1).fill({ color: tc, alpha: 0.55 });
    deco.circle(f.x, f.y, 2.6).fill({ color: 0xffffff, alpha: 0.18 });
    deco.circle(f.x, f.y, 4.6).stroke({ width: 0.25, color: 0xd8dde6 });
  }
  for (const pit of [map.bossPits.turtle, map.bossPits.dragon]) {
    deco.circle(pit.x, pit.y, 5.5).stroke({ width: 0.3, color: 0x4a3a5c });
    deco.circle(pit.x, pit.y, 4).stroke({ width: 0.12, color: 0xb08ae0, alpha: 0.6 });
  }
  ground.addChild(deco);

  // —— 草丛底色 ——
  const bushBase = new Graphics();
  for (const b of map.bushes) strokePath(bushBase, b.pts, b.w + 0.3, 0x1d4a1f, 0.9);
  ground.addChild(bushBase);

  // ————————————————————— 直立道具 —————————————————————
  const props: Prop[] = [];
  const addTree = (x: number, y: number, scale = 1): void => {
    const roll = rng.next();
    if (roll < 0.66) {
      props.push({ tex: rng.pick(tex.trees), x, y, size: rng.range(2.7, 3.5) * scale, anchorY: 0.95, kind: 'tree', r: 1.4 * scale, flip: rng.chance(0.5) });
    } else if (roll < 0.9) {
      props.push({ tex: rng.pick(tex.pines), x, y, size: rng.range(2.0, 2.6) * scale, anchorY: 0.95, kind: 'tree', r: 1.1 * scale, flip: rng.chance(0.5) });
    } else {
      props.push({ tex: rng.pick(tex.rocks), x, y, size: rng.range(1.7, 2.4) * scale, anchorY: 0.85, kind: 'rock', r: 1.0, flip: rng.chance(0.5) });
    }
  };
  for (const w of map.walls) scatter(w, 1.55, 2.1, rng, (x, y) => addTree(x, y));
  // 地图外圈的密林
  for (let d = -6; d < S + 6; d += 2.1) {
    for (const band of [-1.2, -3.4, -5.8]) {
      const j = (): number => rng.range(-0.5, 0.5);
      addTree(d + j(), band + j(), 1.1);
      addTree(d + j(), S - band + j(), 1.1);
      addTree(band + j(), d + j(), 1.1);
      addTree(S - band + j(), d + j(), 1.1);
    }
  }
  // 草丛
  for (const b of map.bushes) {
    scatter(b, 0.75, 1.1, rng, (x, y) =>
      props.push({ tex: rng.pick(tex.grassClumps), x, y, size: rng.range(1.2, 1.5), anchorY: 0.97, kind: 'grass', r: 0.7, flip: rng.chance(0.5) }),
    );
  }
  return { ground, props, water };
}
