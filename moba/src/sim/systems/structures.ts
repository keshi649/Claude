import { BASE_HASTE, FOUNTAIN } from '../../data/balance';
import { applyDamage } from '../damage';
import type { Unit } from '../entity';
import { isEnemy } from '../entity';
import { edgeDist } from '../query';
import { addBuff, isStructure, isTargetable } from '../status';
import type { World } from '../world';
import { visibleTo } from '../vision';
import { findAggressor } from './minions';

/**
 * 建筑：
 *   - 保护规则：同一路前一座塔没被推掉时，后面的塔无敌；己方至少一座高地塔被推掉后，水晶才能被攻击
 *   - 防御塔索敌：敌方英雄在塔下攻击己方英雄 → 立即转火；否则保持当前目标；
 *     没有目标时优先范围内的小兵，其次英雄
 *   - 泉水：己方单位快速回血回蓝，对闯入的敌方英雄造成高额真实伤害；基地附近的己方英雄获得泉水加速
 */

const near: Unit[] = [];

export function updateProtection(w: World): void {
  for (const u of w.list) {
    if (!u.alive) continue;
    if (u.kind === 'tower' && u.lane) {
      const lane = u.lane;
      u.innate.invulnerable =
        lane.idx > 0 &&
        w.list.some((t) => t.kind === 'tower' && t.team === u.team && t.lane?.id === lane.id && t.lane.idx === lane.idx - 1 && t.alive);
    } else if (u.kind === 'crystal') {
      u.innate.invulnerable = !w.list.some((t) => t.kind === 'tower' && t.team === u.team && t.lane?.idx === 2 && !t.alive);
    }
  }
}

function inRange(s: Unit, t: Unit): boolean {
  return edgeDist(s, t) <= s.stats.range;
}

export function updateTowers(w: World): void {
  for (const s of w.list) {
    if (!isStructure(s) || !s.alive) continue;
    let t = w.get(s.lockTarget);
    if (t && (!t.alive || !isTargetable(t) || !inRange(s, t) || t.team === s.team)) t = undefined;

    // 保护英雄：塔下有敌方英雄攻击己方英雄，立即转火
    const agg = findAggressor(w, s, s.stats.range, 1.2);
    if (agg && inRange(s, agg)) t = agg;

    if (!t) {
      w.spatial.query(s.pos.x, s.pos.y, s.stats.range + 1, near);
      let best: Unit | null = null;
      let bestKey = Infinity;
      for (const c of near) {
        if (c.team === 2 || !isEnemy(s, c) || !isTargetable(c) || isStructure(c) || !inRange(s, c) || !visibleTo(c, s.team)) continue;
        const tier = c.kind === 'hero' ? 1 : 0;
        const key = tier * 1000 + edgeDist(s, c);
        if (key < bestKey) {
          bestKey = key;
          best = c;
        }
      }
      t = best ?? undefined;
    }
    if (t) {
      if (t.id !== s.lockTarget) {
        s.rampTarget = 0;
        s.rampStacks = 0;
      }
      s.lockTarget = t.id;
      s.attack.orderTarget = t.id;
      s.attack.orderTime = 0.4;
      s.attack.orderMode = 'auto';
    } else {
      s.lockTarget = 0;
      s.attack.orderTime = 0;
    }
  }
}

export function updateFountains(w: World): void {
  const damageTick = w.tick % 15 === 0;
  for (const team of [0, 1] as const) {
    const f = w.map.fountain[team];
    // 泉水加速：每 0.5 秒刷新一次基地附近己方英雄的加速增益
    if (w.tick % 15 === 0) {
      for (const u of w.list) {
        if (!u.hero || !u.alive || u.team !== team) continue;
        if (Math.hypot(u.pos.x - f.x, u.pos.y - f.y) <= BASE_HASTE.radius) addBuff(w, u, 'base_haste', u.id, BASE_HASTE.duration);
      }
    }
    w.spatial.query(f.x, f.y, FOUNTAIN.radius, near);
    for (const u of near) {
      if (!u.alive || isStructure(u)) continue;
      if (u.team === team) {
        u.hp = Math.min(u.stats.maxHp, u.hp + u.stats.maxHp * FOUNTAIN.healPct * w.dt);
        u.mp = Math.min(u.stats.maxMp, u.mp + u.stats.maxMp * FOUNTAIN.healPct * w.dt);
      } else if (u.kind === 'hero' && damageTick) {
        applyDamage(w, null, u, FOUNTAIN.damagePerSec * 0.5, 'true', { impact: 1 });
      }
    }
  }
}
