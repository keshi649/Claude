import { Container, Graphics } from 'pixi.js';
import { Rng } from '../core/rng';
import type { Vec2 } from '../core/vec2';
import { LANE_HALF_WIDTH, RIVER_HALF_WIDTH, type BuiltMap } from '../data/map';
import { PALETTE } from './palette';

/**
 * 静态地图绘制（世界坐标，单位米）。只在开局构建一次，之后不再重绘。
 * 分两层：地面层（草地、道路、河道、草丛底色）与墙体层（带阴影和顶面高光的岩壁）。
 */
export function paintMap(map: BuiltMap): { ground: Container; walls: Container; bushes: Container } {
  const S = map.size;
  const rng = new Rng(20240901);
  const ground = new Container();

  // —— 草地 ——
  const g = new Graphics();
  g.rect(-6, -6, S + 12, S + 12).fill(0x121a12);
  g.rect(0, 0, S, S).fill(PALETTE.grass);
  // 野区（三角区域）颜色更深
  const jungleTris: Vec2[][] = [
    [{ x: 14, y: 18 }, { x: 14, y: 102 }, { x: 56, y: 60 }],
    [{ x: 18, y: 106 }, { x: 102, y: 106 }, { x: 60, y: 64 }],
  ];
  for (const tri of jungleTris) {
    for (const t of [tri, tri.map((p) => ({ x: p.y, y: p.x }))]) {
      g.poly(t.flatMap((p) => [p.x, p.y])).fill({ color: PALETTE.jungle, alpha: 0.85 });
    }
  }
  // 草地斑点
  for (let i = 0; i < 1400; i++) {
    const x = rng.range(0, S);
    const y = rng.range(0, S);
    g.circle(x, y, rng.range(0.15, 0.6)).fill({ color: rng.chance(0.5) ? PALETTE.grassDark : 0x3a5a34, alpha: 0.5 });
  }
  ground.addChild(g);

  // —— 河道 ——
  const river = new Graphics();
  river.moveTo(-4, -4).lineTo(S + 4, S + 4).stroke({ width: RIVER_HALF_WIDTH * 2 + 1, color: 0x1f4f6a, cap: 'butt' });
  river.moveTo(-4, -4).lineTo(S + 4, S + 4).stroke({ width: RIVER_HALF_WIDTH * 2, color: PALETTE.river, cap: 'butt' });
  for (let i = 0; i < 90; i++) {
    const t = rng.range(0, S);
    const off = rng.range(-RIVER_HALF_WIDTH + 1, RIVER_HALF_WIDTH - 1);
    const x = t + off / Math.SQRT2;
    const y = t - off / Math.SQRT2;
    const l = rng.range(0.6, 1.8);
    river.moveTo(x, y).lineTo(x + l, y + l).stroke({ width: 0.12, color: PALETTE.riverLight, alpha: 0.6 });
  }
  ground.addChild(river);

  // —— 道路（两队路线相同，只画蓝方的即可） ——
  const lanes = new Graphics();
  for (const k of ['top', 'mid', 'bot'] as const) {
    const pts = map.lanes[0][k];
    strokePath(lanes, pts, LANE_HALF_WIDTH * 2 + 0.8, PALETTE.laneEdge, 1);
    strokePath(lanes, pts, LANE_HALF_WIDTH * 2, PALETTE.lane, 1);
  }
  for (let i = 0; i < 600; i++) {
    const k = rng.pick(['top', 'mid', 'bot'] as const);
    const pts = map.lanes[0][k];
    const seg = rng.int(pts.length - 1);
    const a = pts[seg]!;
    const b = pts[seg + 1]!;
    const t = rng.next();
    const px = a.x + (b.x - a.x) * t + rng.range(-3.5, 3.5);
    const py = a.y + (b.y - a.y) * t + rng.range(-3.5, 3.5);
    lanes.circle(px, py, rng.range(0.1, 0.35)).fill({ color: rng.chance(0.5) ? 0x7a6b48 : 0x9c8c63, alpha: 0.7 });
  }
  ground.addChild(lanes);

  // —— 基地广场与泉水 ——
  const base = new Graphics();
  for (const team of [0, 1] as const) {
    const f = map.fountain[team];
    const c = map.crystal[team];
    base.circle(c.x, c.y, 9).fill({ color: PALETTE.plaza, alpha: 0.55 });
    base.circle(f.x, f.y, 7).fill({ color: PALETTE.plaza, alpha: 0.7 });
    base.circle(f.x, f.y, 4.2).fill({ color: PALETTE.teamDark[team], alpha: 0.9 });
    base.circle(f.x, f.y, 4.2).stroke({ width: 0.3, color: PALETTE.team[team] });
    base.circle(f.x, f.y, 2.2).fill({ color: PALETTE.team[team], alpha: 0.5 });
    // 广场地砖纹路
    for (let r = 3; r <= 9; r += 2) base.circle(c.x, c.y, r).stroke({ width: 0.06, color: 0x8a92a0, alpha: 0.35 });
  }
  // Boss 巢穴
  for (const p of [map.bossPits.turtle, map.bossPits.dragon]) {
    base.circle(p.x, p.y, 5).fill({ color: 0x3a2f4a, alpha: 0.55 });
    base.circle(p.x, p.y, 5).stroke({ width: 0.2, color: 0x9a7ad0, alpha: 0.6 });
  }
  ground.addChild(base);

  // —— 草丛 ——
  const bushes = new Container();
  const bg = new Graphics();
  for (const b of map.bushes) {
    strokePath(bg, b.pts, b.w, PALETTE.bushDark, 0.9);
    strokePath(bg, b.pts, b.w - 0.4, PALETTE.bush, 0.95);
    // 叶簇
    const len = pathLength(b.pts);
    const n = Math.ceil(len * 3 + 4);
    for (let i = 0; i < n; i++) {
      const p = pointAlong(b.pts, rng.next() * len);
      const x = p.x + rng.range(-b.w / 2.4, b.w / 2.4);
      const y = p.y + rng.range(-b.w / 2.4, b.w / 2.4);
      bg.circle(x, y, rng.range(0.25, 0.5)).fill({ color: rng.chance(0.5) ? 0x3f9a44 : 0x2a6a2e, alpha: 0.9 });
    }
  }
  bushes.addChild(bg);

  // —— 墙体 ——
  const walls = new Container();
  const shadow = new Graphics();
  const body = new Graphics();
  const top = new Graphics();
  for (const w of map.walls) {
    strokePath(shadow, offset(w.pts, 0.35, 0.55), w.w + 0.3, PALETTE.wallShadow, 0.5);
    strokePath(body, w.pts, w.w + 0.3, PALETTE.wallEdge, 1);
    strokePath(body, w.pts, w.w - 0.1, PALETTE.wall, 1);
    strokePath(top, offset(w.pts, -0.12, -0.22), Math.max(0.4, w.w * 0.55), PALETTE.wallTop, 1);
    // 碎石
    const len = pathLength(w.pts);
    for (let i = 0; i < len * 1.2 + 2; i++) {
      const p = pointAlong(w.pts, rng.next() * len);
      const moss = rng.chance(0.35);
      top.circle(p.x + rng.range(-w.w / 4, w.w / 4), p.y + rng.range(-w.w / 4, w.w / 4), rng.range(0.12, 0.35)).fill({
        color: moss ? 0x3f5a2e : 0x767c68,
        alpha: 0.75,
      });
    }
  }
  walls.addChild(shadow, body, top);
  return { ground, walls, bushes };
}

function strokePath(g: Graphics, pts: readonly Vec2[], width: number, color: number, alpha: number): void {
  if (pts.length === 1) {
    g.circle(pts[0]!.x, pts[0]!.y, width / 2).fill({ color, alpha });
    return;
  }
  g.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i]!.x, pts[i]!.y);
  g.stroke({ width, color, alpha, cap: 'round', join: 'round' });
}

const offset = (pts: readonly Vec2[], dx: number, dy: number): Vec2[] => pts.map((p) => ({ x: p.x + dx, y: p.y + dy }));

function pathLength(pts: readonly Vec2[]): number {
  let l = 0;
  for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i]!.x - pts[i - 1]!.x, pts[i]!.y - pts[i - 1]!.y);
  return l;
}

function pointAlong(pts: readonly Vec2[], d: number): Vec2 {
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    const l = Math.hypot(b.x - a.x, b.y - a.y);
    if (d <= l || i === pts.length - 1) {
      const t = l > 0 ? Math.min(1, d / l) : 0;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    d -= l;
  }
  return { ...pts[0]! };
}

