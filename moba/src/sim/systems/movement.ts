import { norm, type Vec2 } from '../../core/vec2';
import type { Unit } from '../entity';
import { isEnemy } from '../entity';
import { isHeroLike } from '../query';
import { runEffects } from '../skills/effects';
import { canAct, isStructure, isTargetable } from '../status';
import { currentMoveSpeed } from '../stats';
import type { World } from '../world';
import { laneDirection } from './minions';

/**
 * 移动系统。优先级：
 *   强制位移（冲刺 / 击退）> 受控 > 施法前摇 / 普攻前摇（站定）
 *   > 普攻追击 / 站定攻击 > 摇杆方向移动 > 寻路移动 > 巡逻
 * 所有移动都经过墙体碰撞（贴墙滑动）。
 */

const near: Unit[] = [];

export function updateMovement(w: World): void {
  for (const u of w.list) {
    if (!u.alive) continue;
    if (u.forced) {
      stepForced(w, u);
      continue;
    }
    if (u.static || !canAct(u)) continue;
    if (u.cast && u.cast.phase === 'windup') continue;
    if (u.attack.windup > 0) continue;

    let speed = currentMoveSpeed(u);
    if (u.cast && u.cast.phase === 'charging') speed *= 0.5;

    let dir: Vec2 | null = null;
    if (u.attack.orderTime > 0 && u.attack.orderTarget) {
      // 普攻指令期间：追击或原地攻击
      const t = w.get(u.chaseTarget);
      if (!t) continue;
      dir = seek(w, u, t.pos, 0.2);
    } else if (u.moveDir) {
      dir = u.moveDir;
      u.navGoal = null;
      u.navPath = [];
      // 移动取消技能后摇
      if (u.cast && u.cast.phase === 'recovery') u.cast = null;
    } else if (u.navGoal) {
      dir = followPath(w, u);
    } else if (u.kind === 'minion' && u.lane) {
      const ld = laneDirection(w, u);
      if (ld) dir = seek(w, u, { x: u.pos.x + ld.x * 3, y: u.pos.y + ld.y * 3 }, 0) ?? ld;
    } else if (u.patrol && u.patrol.length > 0) {
      const target = u.patrol[u.patrolIdx % u.patrol.length]!;
      if (Math.hypot(target.x - u.pos.x, target.y - u.pos.y) < 0.3) u.patrolIdx++;
      else dir = seek(w, u, target, 0);
    }
    if (!dir) continue;
    if (u.cast && u.cast.phase === 'recovery' && !u.moveDir) u.cast = null;
    w.walls.move(u.pos, u.radius, dir.x * speed * w.dt, dir.y * speed * w.dt);
    u.facing = Math.atan2(dir.y, dir.x);
  }
}

/** 朝目标移动：直线可达走直线，否则走 A* 路径 */
function seek(w: World, u: Unit, target: Vec2, arrive: number): Vec2 | null {
  const dx = target.x - u.pos.x;
  const dy = target.y - u.pos.y;
  if (Math.hypot(dx, dy) <= arrive) return null;
  if (w.walls.sweep(u.pos, target, u.radius * 0.9) >= 1) {
    u.navPath = [];
    return norm({ x: dx, y: dy });
  }
  if (!u.navGoal || Math.hypot(u.navGoal.x - target.x, u.navGoal.y - target.y) > 1 || u.navPath.length === 0) {
    if (w.time >= u.navRepathAt) {
      u.navGoal = { ...target };
      u.navPath = w.astar.findPath(u.pos, target) ?? [];
      u.navRepathAt = w.time + 0.4;
    }
  }
  const dir = followPath(w, u);
  return dir ?? norm({ x: dx, y: dy });
}

/** 沿寻路路径前进，返回当前方向；到达终点时清空目标 */
function followPath(w: World, u: Unit): Vec2 | null {
  if (!u.navGoal) return null;
  if (u.navPath.length === 0) {
    if (w.time < u.navRepathAt) return null;
    const path = w.astar.findPath(u.pos, u.navGoal);
    u.navRepathAt = w.time + 0.4;
    if (!path) {
      u.navGoal = null;
      return null;
    }
    u.navPath = path;
  }
  while (u.navPath.length > 0) {
    const p = u.navPath[0]!;
    const d = Math.hypot(p.x - u.pos.x, p.y - u.pos.y);
    const last = u.navPath.length === 1;
    if (d < (last ? 0.15 : 0.5)) u.navPath.shift();
    else return norm({ x: p.x - u.pos.x, y: p.y - u.pos.y });
  }
  u.navGoal = null;
  return null;
}

/** 推进强制位移（冲刺 / 击退），处理途经命中、撞英雄停下与结束效果 */
function stepForced(w: World, u: Unit): void {
  const f = u.forced!;
  if (f.targetId) {
    const t = w.get(f.targetId);
    if (t && t.alive) {
      const dx = t.pos.x - u.pos.x;
      const dy = t.pos.y - u.pos.y;
      const d = Math.hypot(dx, dy);
      if (d > 1e-6) {
        f.dirX = dx / d;
        f.dirY = dy / d;
      }
      f.remaining = Math.max(0, d - f.stopDist);
    }
  }
  const step = Math.min(f.speed * w.dt, f.remaining);
  const bx = u.pos.x;
  const by = u.pos.y;
  w.walls.move(u.pos, u.radius, f.dirX * step, f.dirY * step);
  const moved = Math.hypot(u.pos.x - bx, u.pos.y - by);
  f.remaining -= step;
  if (f.kind === 'dash') u.facing = Math.atan2(f.dirY, f.dirX);

  let stop = false;
  if (f.kind === 'dash' && f.ctx && (f.passHit || f.stopOnHero)) {
    w.spatial.query(u.pos.x, u.pos.y, u.radius + 0.5, near);
    for (const e of near) {
      if (e === u || !isEnemy(u, e) || !isTargetable(e) || isStructure(e)) continue;
      if (f.hitIds.includes(e.id)) continue;
      f.hitIds.push(e.id);
      const ctx = { ...f.ctx, origin: { ...u.pos }, targetId: e.id };
      if (f.passHit) runEffects(w, f.passHit, ctx);
      if (f.stopOnHero && isHeroLike(e)) {
        runEffects(w, f.stopOnHero, ctx);
        stop = true;
        break;
      }
    }
  }
  // 顶墙走不动了也结束
  if (step > 0 && moved < step * 0.25) stop = true;
  if (stop || f.remaining <= 1e-4 || !u.alive) {
    u.forced = null;
    if (f.onEnd && f.ctx && u.alive) runEffects(w, f.onEnd, { ...f.ctx, origin: { ...u.pos } });
  }
}

/**
 * 单位之间的软碰撞：重叠时互相推开。
 * 静态单位（建筑）和木桩不被推动；冲刺中、被击飞的单位不参与。
 */
export function separateUnits(w: World): void {
  for (const u of w.list) {
    if (!u.alive || u.static || u.kind === 'dummy' || u.forced || u.status.airborne > 0) continue;
    w.spatial.query(u.pos.x, u.pos.y, u.radius, near);
    for (const v of near) {
      if (v === u || v.forced || v.status.airborne > 0) continue;
      const dx = u.pos.x - v.pos.x;
      const dy = u.pos.y - v.pos.y;
      const d = Math.hypot(dx, dy);
      const overlap = u.radius + v.radius - d;
      if (overlap <= 0) continue;
      const nx = d > 1e-6 ? dx / d : 1;
      const ny = d > 1e-6 ? dy / d : 0;
      const heavy = v.static || v.kind === 'dummy';
      // 与重物碰撞完全推开；与普通单位各推一半（每帧只推一部分，显得柔和）
      const share = heavy ? 1 : 0.5 * 0.6;
      u.pos.x += nx * overlap * share;
      u.pos.y += ny * overlap * share;
      // 正面顶住建筑 / 木桩时沿切线绕开，不会卡死
      if (heavy && u.moveDir && u.moveDir.x * nx + u.moveDir.y * ny < -0.85) {
        let tx = -ny;
        let ty = nx;
        if (tx * u.moveDir.x + ty * u.moveDir.y < 0) {
          tx = -tx;
          ty = -ty;
        }
        const push = Math.min(overlap, 0.12) + 0.04;
        u.pos.x += tx * push;
        u.pos.y += ty * push;
      }
    }
    w.walls.resolve(u.pos, u.radius);
  }
}
