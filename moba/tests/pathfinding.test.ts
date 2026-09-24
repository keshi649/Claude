import { describe, expect, it } from 'vitest';
import { WallField } from '../src/sim/nav/walls';
import { NavGrid } from '../src/sim/nav/grid';
import { AStar } from '../src/sim/nav/astar';
import { buildMap } from '../src/data/map';
import type { Vec2 } from '../src/core/vec2';

const p = (x: number, y: number): Vec2 => ({ x, y });

function pathLength(start: Vec2, path: Vec2[]): number {
  let len = 0;
  let prev = start;
  for (const q of path) {
    len += Math.hypot(q.x - prev.x, q.y - prev.y);
    prev = q;
  }
  return len;
}

describe('A* 寻路', () => {
  // 20×20 小地图，中间一堵竖墙，上下各留通道
  const walls = new WallField([{ pts: [p(10, 5), p(10, 15)], w: 2 }], 20);
  const grid = new NavGrid(walls);
  const astar = new AStar(grid);

  it('能绕开墙体找到路径', () => {
    const start = p(5, 10);
    const goal = p(15, 10);
    const path = astar.findPath(start, goal);
    expect(path).not.toBeNull();
    const last = path![path!.length - 1]!;
    expect(last.x).toBeCloseTo(15, 5);
    expect(last.y).toBeCloseTo(10, 5);
    // 必须绕行，路径长于直线距离
    expect(pathLength(start, path!)).toBeGreaterThan(10.5);
    // 每一段都在网格上直线可走
    let prev = start;
    for (const q of path!) {
      expect(grid.lineWalkable(prev, q)).toBe(true);
      prev = q;
    }
  });

  it('平滑后拐点很少（不是逐格路径）', () => {
    const path = astar.findPath(p(5, 10), p(15, 10))!;
    expect(path.length).toBeLessThanOrEqual(4);
  });

  it('直线可达时直接返回终点', () => {
    const path = astar.findPath(p(3, 3), p(17, 3))!;
    expect(path).toHaveLength(1);
    expect(astar.lastExpanded).toBe(0);
  });

  it('终点被完全围住时返回 null', () => {
    // 闭合方框围住 (15,15)
    const box = new WallField(
      [{ pts: [p(12, 12), p(18, 12), p(18, 18), p(12, 18), p(12, 12)], w: 1 }],
      24,
    );
    const g = new NavGrid(box);
    const a = new AStar(g);
    expect(a.findPath(p(3, 3), p(15, 15))).toBeNull();
  });

  it('终点落在墙里时吸附到最近可走点', () => {
    const path = astar.findPath(p(5, 10), p(10, 10));
    expect(path).not.toBeNull();
    const last = path![path!.length - 1]!;
    expect(grid.walkableAt(last)).toBe(true);
    expect(Math.hypot(last.x - 10, last.y - 10)).toBeLessThan(3);
  });

  it('正式地图：蓝方泉水到红方泉水可达，路程约 150m', () => {
    const map = buildMap();
    const wf = new WallField(map.walls, map.size);
    const g = new NavGrid(wf);
    const a = new AStar(g);
    const path = a.findPath(map.spawn[0], map.spawn[1]);
    expect(path).not.toBeNull();
    const len = pathLength(map.spawn[0], path!);
    expect(len).toBeGreaterThan(130);
    expect(len).toBeLessThan(175);
  });
});

describe('墙体碰撞与贴墙滑动', () => {
  // 竖墙 x=10，厚 2（占据 x∈[9,11]）
  const walls = new WallField([{ pts: [p(10, 0), p(10, 40)], w: 2 }], 40);

  it('斜着撞墙时沿墙滑动，不穿墙也不卡住', () => {
    const pos = p(8, 10);
    const r = 0.5;
    // 朝右下 45° 走 4m
    const hit = walls.move(pos, r, 4 / Math.SQRT2, 4 / Math.SQRT2);
    expect(hit).toBe(true);
    expect(pos.x).toBeLessThanOrEqual(9 - r + 1e-6);
    // 切向分量保留：y 方向前进约 2.83m
    expect(pos.y).toBeGreaterThan(12.5);
  });

  it('正面撞墙时停在墙边', () => {
    const pos = p(8, 10);
    walls.move(pos, 0.5, 5, 0);
    expect(pos.x).toBeCloseTo(8.5, 3);
    expect(pos.y).toBeCloseTo(10, 3);
  });

  it('高速位移不会穿墙', () => {
    const pos = p(5, 20);
    walls.move(pos, 0.5, 30, 0);
    expect(pos.x).toBeLessThan(9);
  });

  it('夹角处被推出到合法位置', () => {
    // 两堵墙构成 L 形夹角
    const l = new WallField(
      [
        { pts: [p(10, 0), p(10, 20)], w: 2 },
        { pts: [p(0, 10), p(10, 10)], w: 2 },
      ],
      30,
    );
    const pos = p(7, 7);
    l.move(pos, 0.5, 5, 5);
    expect(l.isBlocked(pos.x, pos.y, 0.5 - 1e-3)).toBe(false);
    expect(pos.x).toBeLessThanOrEqual(8.5 + 1e-6);
    expect(pos.y).toBeLessThanOrEqual(8.5 + 1e-6);
  });

  it('射线检测返回首次碰撞比例', () => {
    const t = walls.sweep(p(2, 5), p(20, 5), 0);
    // 起点 x=2，在 x≈9 处碰墙（行进约 7m，总长 18m）
    expect(2 + t * 18).toBeGreaterThan(8.5);
    expect(2 + t * 18).toBeLessThan(9.1);
  });
});
