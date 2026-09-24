import { norm, type Vec2 } from '../../core/vec2';
import { WAVES } from '../../data/balance';
import { LANES, type LaneId } from '../../data/map';
import { MINIONS } from '../../data/minions';
import type { Team, Unit } from '../entity';
import { isEnemy } from '../entity';
import { edgeDist } from '../query';
import { canAct, isInvulnerable, isStructure, isTargetable } from '../status';
import type { World } from '../world';
import { visibleTo } from '../vision';

/**
 * 兵线：
 *   - 第一波在 WAVES.firstWaveAt 秒，之后每 30 秒一波：3 近战 + 2 远程，每 3 波加 1 个炮车
 *   - 敌方某路高地塔被推掉后，己方这一路每波额外出 1 个超级兵
 *   - 小兵沿路线前进，就近攻击：小兵 > 英雄 > 建筑；
 *     敌方英雄攻击己方英雄时，附近小兵转火该英雄
 */

const AGGRO_RANGE = 7;
const LEASH = 10;
const near: Unit[] = [];

/** 敌方这一路的高地塔是否已被推掉（决定是否出超级兵） */
function enemyHighDown(w: World, team: Team, lane: LaneId): boolean {
  return w.list.some((u) => u.kind === 'tower' && u.team !== team && u.lane?.id === lane && u.lane.idx === 2 && !u.alive);
}

/** 沿折线从起点走 d 米处的位置 */
function pointAlong(path: readonly Vec2[], d: number): Vec2 {
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    const l = Math.hypot(b.x - a.x, b.y - a.y);
    if (d <= l) return { x: a.x + ((b.x - a.x) * d) / l, y: a.y + ((b.y - a.y) * d) / l };
    d -= l;
  }
  return { ...path[path.length - 1]! };
}

export function updateWaves(w: World): void {
  if (w.config.mode !== 'match' || w.winner !== null) return;
  if (w.time < w.nextWaveAt) return;
  for (const team of [0, 1] as const) for (const lane of LANES) spawnWave(w, team, lane, w.waveIndex);
  w.waveIndex++;
  w.nextWaveAt += WAVES.interval;
}

function spawnWave(w: World, team: Team, lane: LaneId, idx: number): void {
  const kinds: (keyof typeof MINIONS)[] = ['melee', 'melee', 'melee', 'ranged', 'ranged'];
  if ((idx + 1) % WAVES.siegeEvery === 0) kinds.push('siege');
  if (enemyHighDown(w, team, lane)) kinds.unshift('super');
  const path = w.map.lanes[team as 0 | 1][lane];
  const n = kinds.length;
  kinds.forEach((k, i) => {
    // 队首走在最前面，依次向后排开
    const pos = pointAlong(path, 2 + (n - 1 - i) * WAVES.spacing);
    w.spawnMinion(MINIONS[k], team, pos, lane);
  });
}

/** 最近 2 秒内攻击过己方英雄、且在 range 内的敌方英雄 */
export function findAggressor(w: World, u: Unit, range: number, window = 2): Unit | null {
  let best: Unit | null = null;
  let bestD = Infinity;
  for (const a of w.aggro) {
    if (w.time - a.t > window) continue;
    const atk = w.get(a.attacker);
    const vic = w.get(a.victim);
    if (!atk || !vic || !atk.alive || !isTargetable(atk)) continue;
    if (vic.team !== u.team || atk.team === u.team) continue;
    const d = Math.hypot(atk.pos.x - u.pos.x, atk.pos.y - u.pos.y);
    const dv = Math.hypot(vic.pos.x - u.pos.x, vic.pos.y - u.pos.y);
    if (d <= range && dv <= range + 3 && d < bestD) {
      bestD = d;
      best = atk;
    }
  }
  return best;
}

/** 小兵索敌：小兵 > 英雄 > 建筑，同级取最近 */
function acquire(w: World, u: Unit): Unit | null {
  w.spatial.query(u.pos.x, u.pos.y, AGGRO_RANGE + 1, near);
  let best: Unit | null = null;
  let bestKey = Infinity;
  for (const t of near) {
    if (t.team === 2 || !isEnemy(u, t) || !isTargetable(t) || !visibleTo(t, u.team)) continue;
    if (isStructure(t) && isInvulnerable(t)) continue;
    const tier = t.kind === 'minion' || t.kind === 'summon' ? 0 : t.kind === 'hero' ? 1 : isStructure(t) ? 2 : 3;
    if (tier === 3) continue;
    const key = tier * 1000 + edgeDist(u, t);
    if (key < bestKey) {
      bestKey = key;
      best = t;
    }
  }
  return best;
}

export function updateMinions(w: World): void {
  for (const u of w.list) {
    if ((u.kind !== 'minion' && u.kind !== 'summon') || !u.lane || !u.alive || !canAct(u)) continue;
    let t = w.get(u.lockTarget);
    if (t && (!t.alive || !isTargetable(t) || edgeDist(u, t) > LEASH || (isStructure(t) && isInvulnerable(t)))) t = undefined;
    // 每 5 帧重新评估一次（按 id 错开，分摊开销）
    if ((w.tick + u.id) % 5 === 0 || !t) {
      const agg = findAggressor(w, u, AGGRO_RANGE);
      if (agg) t = agg;
      else if (!t || t.kind !== 'minion') t = acquire(w, u) ?? t;
    }
    if (t) {
      u.lockTarget = t.id;
      u.attack.orderTarget = t.id;
      u.attack.orderTime = 0.4;
      u.attack.orderMode = 'auto';
    } else {
      u.lockTarget = 0;
    }
  }
}

/** 小兵沿路线前进的方向（移动系统调用）；追击后回到路线时自动对齐到最近的前方路点 */
export function laneDirection(w: World, u: Unit): Vec2 | null {
  const lane = u.lane;
  if (!lane) return null;
  const path = w.map.lanes[u.team as 0 | 1][lane.id];
  if ((w.tick + u.id) % 30 === 0) lane.idx = Math.max(lane.idx, closestAhead(path, u.pos));
  while (lane.idx < path.length - 1 && Math.hypot(path[lane.idx]!.x - u.pos.x, path[lane.idx]!.y - u.pos.y) < 1.6) lane.idx++;
  const target = path[lane.idx]!;
  const d = Math.hypot(target.x - u.pos.x, target.y - u.pos.y);
  if (lane.idx === path.length - 1 && d < 1.5) return null;
  return norm({ x: target.x - u.pos.x, y: target.y - u.pos.y });
}

/** 距离最近的线段终点序号 */
function closestAhead(path: readonly Vec2[], p: Vec2): number {
  let best = 1;
  let bestD = Infinity;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const l2 = abx * abx + aby * aby || 1;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / l2));
    const d = Math.hypot(a.x + abx * t - p.x, a.y + aby * t - p.y);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}
