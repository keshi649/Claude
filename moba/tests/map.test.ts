import { describe, expect, it } from 'vitest';
import { buildMap } from '../src/data/map';
import { WallField } from '../src/sim/nav/walls';
import { NavGrid } from '../src/sim/nav/grid';
import { AStar } from '../src/sim/nav/astar';

describe('地图', () => {
  const m = buildMap();
  const wf = new WallField(m.walls, m.size);
  const a = new AStar(new NavGrid(wf));

  it('野怪营地不在墙里，且都能从泉水走到', () => {
    for (const t of [0, 1] as const) {
      for (const c of m.camps[t]) {
        expect(wf.isBlocked(c.pos.x, c.pos.y, 1.2)).toBe(false);
        expect(a.findPath(m.spawn[t], c.pos)).not.toBeNull();
      }
    }
  });

  it('防御塔与兵线路点不在墙里', () => {
    for (const t of [0, 1] as const) {
      for (const tw of m.towers[t]) expect(wf.isBlocked(tw.pos.x, tw.pos.y, 1.5)).toBe(false);
      for (const k of ['top', 'mid', 'bot'] as const) for (const q of m.lanes[t][k]) expect(wf.isBlocked(q.x, q.y, 1.0)).toBe(false);
    }
  });

  it('双方地图关于河道对称', () => {
    for (let i = 0; i < m.towers[0].length; i++) {
      const b = m.towers[0][i]!.pos;
      const r = m.towers[1][i]!.pos;
      expect(r.x).toBeCloseTo(b.y, 6);
      expect(r.y).toBeCloseTo(b.x, 6);
    }
  });
});
