import type { Vec2 } from '../../core/vec2';
import type { EntityId, Team, Unit } from '../entity';
import { visibleTo } from '../vision';
import type { World } from '../world';

/**
 * 一队的“认知”：AI 只能通过这里获取敌方信息。
 *   - 只返回本队当前可见的敌方单位
 *   - 记住每个敌方英雄最后一次被看见的位置与时间（消失的敌人可能在附近埋伏）
 */
export interface Sighting {
  id: EntityId;
  pos: Vec2;
  t: number;
  hpPct: number;
}

export class TeamKnowledge {
  readonly lastSeen = new Map<EntityId, Sighting>();

  constructor(readonly team: Team) {}

  update(w: World): void {
    for (const u of w.list) {
      if (u.kind !== 'hero' || u.team === this.team) continue;
      if (u.alive && visibleTo(u, this.team)) {
        this.lastSeen.set(u.id, { id: u.id, pos: { ...u.pos }, t: w.time, hpPct: u.hp / u.stats.maxHp });
      }
    }
  }

  /** 可见的敌方单位（可按种类过滤） */
  visibleEnemies(w: World, kinds?: readonly string[]): Unit[] {
    return w.list.filter((u) => u.alive && u.team !== this.team && u.team !== 2 && visibleTo(u, this.team) && (!kinds || kinds.includes(u.kind)));
  }

  visibleEnemyHeroes(w: World): Unit[] {
    return this.visibleEnemies(w, ['hero']);
  }

  /** 最近 maxAge 秒内在 pos 附近 r 米出现过、当前看不见的敌方英雄数（用于判断危险） */
  missingNear(w: World, pos: Vec2, r: number, maxAge = 8): number {
    let n = 0;
    for (const s of this.lastSeen.values()) {
      const u = w.get(s.id);
      if (!u || !u.alive || visibleTo(u, this.team)) continue;
      if (w.time - s.t <= maxAge && Math.hypot(s.pos.x - pos.x, s.pos.y - pos.y) <= r) n++;
    }
    return n;
  }
}
