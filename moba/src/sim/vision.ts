import type { BuiltMap } from '../data/map';
import { getUnitDef } from '../data/units';
import type { Team, Unit } from './entity';
import type { World } from './world';

/**
 * 视野与草丛（逻辑层）：
 *   - 己方单位与建筑提供视野；敌方 / 中立单位只有在视野内才对本队可见
 *   - 草丛里的单位对敌方隐身，除非敌方也有单位在同一片草丛，或它刚在草丛里攻击过（暴露 1.2 秒）
 *   - 建筑始终可见；墙体不遮挡视野（设计决策）
 *   - 结果写入 unit.visibleMask（第 0 位蓝方，第 1 位红方）。AI 与普攻 / 技能选目标都只用可见信息
 */

export const SIGHT = { hero: 9, minion: 6, summon: 7, tower: 9, crystal: 10, fountain: 12 } as const;

/** 草丛栅格：0.5 米一格，存草丛编号（从 1 开始），0 表示不是草丛 */
export class BushGrid {
  readonly cell = 0.5;
  readonly n: number;
  readonly ids: Uint16Array;

  constructor(map: BuiltMap) {
    this.n = Math.ceil(map.size / this.cell);
    this.ids = new Uint16Array(this.n * this.n);
    map.bushes.forEach((b, i) => {
      const r = b.w / 2;
      for (let s = 0; s + 1 < b.pts.length || (s === 0 && b.pts.length === 1); s++) {
        const a = b.pts[s]!;
        const c = b.pts[Math.min(s + 1, b.pts.length - 1)]!;
        const x0 = Math.max(0, Math.floor((Math.min(a.x, c.x) - r) / this.cell));
        const x1 = Math.min(this.n - 1, Math.ceil((Math.max(a.x, c.x) + r) / this.cell));
        const y0 = Math.max(0, Math.floor((Math.min(a.y, c.y) - r) / this.cell));
        const y1 = Math.min(this.n - 1, Math.ceil((Math.max(a.y, c.y) + r) / this.cell));
        for (let y = y0; y <= y1; y++) {
          for (let x = x0; x <= x1; x++) {
            const px = (x + 0.5) * this.cell;
            const py = (y + 0.5) * this.cell;
            const abx = c.x - a.x;
            const aby = c.y - a.y;
            const l2 = abx * abx + aby * aby || 1;
            const t = Math.max(0, Math.min(1, ((px - a.x) * abx + (py - a.y) * aby) / l2));
            if (Math.hypot(a.x + abx * t - px, a.y + aby * t - py) <= r) this.ids[y * this.n + x] = i + 1;
          }
        }
        if (b.pts.length === 1) break;
      }
    });
  }

  at(x: number, y: number): number {
    const cx = Math.floor(x / this.cell);
    const cy = Math.floor(y / this.cell);
    if (cx < 0 || cy < 0 || cx >= this.n || cy >= this.n) return 0;
    return this.ids[cy * this.n + cx]!;
  }
}

export function sightOf(u: Unit): number {
  switch (u.kind) {
    case 'hero':
      return SIGHT.hero;
    case 'minion':
      return SIGHT.minion;
    case 'summon':
      return getUnitDef(u.defId).sight ?? SIGHT.summon;
    case 'tower':
      return SIGHT.tower;
    case 'crystal':
      return SIGHT.crystal;
    default:
      return 0;
  }
}

/** 单位是否对某队可见（中立阵营视为全知，用于野怪反击） */
export function visibleTo(u: Unit, team: Team): boolean {
  if (team === 2 || u.team === team) return true;
  return ((u.visibleMask >> team) & 1) === 1;
}

export function updateVision(w: World): void {
  const all = w.list;
  for (const u of all) u.bush = u.alive ? w.bushes.at(u.pos.x, u.pos.y) : 0;
  if (w.config.mode !== 'match') {
    for (const u of all) u.visibleMask = 3;
    return;
  }
  // 各队视野源
  const sources: [Unit[], Unit[]] = [[], []];
  for (const u of all) if (u.alive && (u.team === 0 || u.team === 1) && sightOf(u) > 0) sources[u.team].push(u);

  for (const x of all) {
    if (!x.alive) continue;
    if (x.kind === 'tower' || x.kind === 'crystal') {
      x.visibleMask = 3;
      continue;
    }
    let mask = x.team === 0 ? 1 : x.team === 1 ? 2 : 0;
    const hidden = x.bush > 0 && w.time > x.revealUntil;
    for (const team of [0, 1] as const) {
      if (x.team === team) continue;
      const f = w.map.fountain[team];
      let seen = Math.hypot(x.pos.x - f.x, x.pos.y - f.y) <= SIGHT.fountain;
      if (!seen) {
        for (const s of sources[team]) {
          const r = sightOf(s);
          const dx = s.pos.x - x.pos.x;
          const dy = s.pos.y - x.pos.y;
          if (dx * dx + dy * dy <= r * r) {
            seen = true;
            break;
          }
        }
      }
      // 草丛：只有同一片草丛里的敌方单位才能看见
      if (seen && hidden) seen = sources[team].some((s) => s.bush === x.bush && s.kind !== 'tower');
      if (seen) mask |= 1 << team;
    }
    x.visibleMask = mask;
  }
}
