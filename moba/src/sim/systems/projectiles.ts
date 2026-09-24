import type { Unit } from '../entity';
import { affectsOk, unitsInShape } from '../query';
import { resolveArea, runEffects } from '../skills/effects';
import { isStructure, isTargetable } from '../status';
import type { World } from '../world';
import { applyAttackHit } from './attack';

/**
 * 弹道、持续区域、延迟区域的推进。
 */

const near: Unit[] = [];

export function updateProjectiles(w: World): void {
  for (const p of w.ordered(w.projectiles)) {
    if (p.dead) continue;
    p.prevPos.x = p.pos.x;
    p.prevPos.y = p.pos.y;

    // 普攻弹道：追踪目标
    if (p.isAttack) {
      const t = w.get(p.homingTarget);
      if (!t || !t.alive) {
        p.dead = true;
        continue;
      }
      const dx = t.pos.x - p.pos.x;
      const dy = t.pos.y - p.pos.y;
      const d = Math.hypot(dx, dy);
      const step = p.speed * w.dt;
      if (d <= step + t.radius * 0.5) {
        const owner = w.get(p.ownerId);
        if (owner && owner.alive) applyAttackHit(w, owner, t, p.crit);
        p.dead = true;
        continue;
      }
      p.dirX = dx / d;
      p.dirY = dy / d;
      p.pos.x += p.dirX * step;
      p.pos.y += p.dirY * step;
      continue;
    }

    // 技能弹道：直线飞行，分小步检测命中，避免高速穿过目标
    const total = Math.min(p.speed * w.dt, p.remaining);
    const steps = Math.max(1, Math.ceil(total / 0.4));
    const step = total / steps;
    for (let i = 0; i < steps && !p.dead; i++) {
      p.pos.x += p.dirX * step;
      p.pos.y += p.dirY * step;
      p.remaining -= step;
      if (p.stopAtWall && w.walls.isBlocked(p.pos.x, p.pos.y, 0.05)) {
        endProjectile(w, p);
        break;
      }
      w.spatial.query(p.pos.x, p.pos.y, p.width, near);
      for (const u of near) {
        if (p.dead) break;
        if (!isTargetable(u) || isStructure(u) || p.hitIds.includes(u.id)) continue;
        if (!affectsOk(p.affects, p.team, p.ownerId, u)) continue;
        p.hitIds.push(u.id);
        runEffects(w, p.onHit, { ...p.ctx, origin: { ...p.pos }, targetId: u.id });
        if (!p.pierce) p.dead = true;
      }
      if (!p.dead && p.remaining <= 1e-4) endProjectile(w, p);
    }
  }
  w.projectiles = w.projectiles.filter((p) => !p.dead);
}

function endProjectile(w: World, p: World['projectiles'][number]): void {
  p.dead = true;
  if (p.onEnd) {
    runEffects(w, p.onEnd, {
      ...p.ctx,
      origin: { ...p.pos },
      point: { ...p.pos },
      targetId: 0,
    });
  }
}

export function updateZones(w: World): void {
  for (const z of w.zones) {
    if (z.follow) {
      const owner = w.get(z.ownerId);
      if (owner && owner.alive) {
        z.pos.x = owner.pos.x;
        z.pos.y = owner.pos.y;
      }
    }
    z.acc += w.dt;
    while (z.acc >= z.interval && z.remaining > 0) {
      z.acc -= z.interval;
      const hits = unitsInShape(w, z.shape, z.pos, z.dir, z.team, z.ownerId, z.affects);
      for (const u of hits) runEffects(w, z.onTick, { ...z.ctx, origin: { ...z.pos }, targetId: u.id });
    }
    z.remaining -= w.dt;
  }
  w.zones = w.zones.filter((z) => z.remaining > 0);

  for (const a of w.pending) {
    a.remaining -= w.dt;
    if (a.remaining <= 0) {
      resolveArea(w, a.shape, a.pos, a.dir, a.affects, a.onHit, a.onAnyHit, a.vfx, a.ctx);
    }
  }
  w.pending = w.pending.filter((a) => a.remaining > 0);
}

