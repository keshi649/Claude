import { getHero } from '../../data/heroes';
import type { LaneId } from '../../data/map';
import type { Role } from '../../data/schema';

/**
 * 分路：对抗路（上）、中路、发育路（下）、打野、游走。
 * 每个英雄定位对各位置有偏好分，5 人时枚举全部排列取总分最高的分配。
 */
export type Position = 'top' | 'mid' | 'bot' | 'jungle' | 'roam';

export const POSITION_NAMES: Record<Position, string> = {
  top: '对抗路',
  mid: '中路',
  bot: '发育路',
  jungle: '打野',
  roam: '游走',
};

export const PREF: Record<Role, Record<Position, number>> = {
  tank: { top: 6, mid: 1, bot: 1, jungle: 4, roam: 9 },
  fighter: { top: 10, mid: 3, bot: 2, jungle: 7, roam: 3 },
  assassin: { top: 3, mid: 6, bot: 1, jungle: 10, roam: 2 },
  mage: { top: 2, mid: 10, bot: 3, jungle: 1, roam: 4 },
  marksman: { top: 1, mid: 3, bot: 10, jungle: 1, roam: 1 },
  support: { top: 2, mid: 2, bot: 3, jungle: 1, roam: 10 },
};

export const ALL_POSITIONS: Position[] = ['top', 'mid', 'bot', 'jungle', 'roam'];
const ALL = ALL_POSITIONS;

function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr.slice()];
  const out: T[][] = [];
  arr.forEach((x, i) => {
    for (const p of permutations([...arr.slice(0, i), ...arr.slice(i + 1)])) out.push([x, ...p]);
  });
  return out;
}

/** 为一队英雄（按顺序）分配位置；人数不足 5 时优先填中、下、上、野 */
export function assignPositions(heroIds: readonly string[]): Position[] {
  const n = heroIds.length;
  let best: Position[] = [];
  let bestScore = -Infinity;
  const pool = n >= 5 ? ALL : (['mid', 'bot', 'top', 'jungle', 'roam'] as Position[]).slice(0, Math.max(n, 1));
  for (const perm of permutations(pool)) {
    const cand = perm.slice(0, n);
    const score = cand.reduce((s, p, i) => s + PREF[getHero(heroIds[i]!).role][p], 0);
    if (score > bestScore) {
      bestScore = score;
      best = cand;
    }
  }
  return best;
}

/** 位置对应的兵线（打野没有，游走跟随发育路） */
export function laneOf(p: Position): LaneId | null {
  return p === 'top' ? 'top' : p === 'mid' ? 'mid' : p === 'bot' || p === 'roam' ? 'bot' : null;
}
