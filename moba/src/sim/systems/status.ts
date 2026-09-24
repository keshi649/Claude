import { BALANCE } from '../../data/balance';
import { getBuff } from '../../data/units';
import { getHero } from '../../data/heroes';
import { heal } from '../damage';
import { getItem } from '../../data/items';
import { evalCond, makeCtx, runEffects, uniqueItems } from '../skills/effects';
import { recomputeStats } from '../stats';
import { canAct } from '../status';
import type { World } from '../world';

/**
 * 每帧的状态推进：控制计时、护盾、增益（含周期效果）、回血回蓝、属性重算、木桩行为。
 */
export function updateStatus(w: World): void {
  const dt = w.dt;
  for (const u of w.list) {
    if (!u.alive) continue;
    const st = u.status;
    if (st.stun > 0) st.stun = Math.max(0, st.stun - dt);
    if (st.airborne > 0) st.airborne = Math.max(0, st.airborne - dt);
    if (st.silence > 0) st.silence = Math.max(0, st.silence - dt);
    if (st.slows.length) {
      for (const s of st.slows) s.remaining -= dt;
      st.slows = st.slows.filter((s) => s.remaining > 0);
    }
    if (u.shields.length) {
      for (const s of u.shields) s.remaining -= dt;
      u.shields = u.shields.filter((s) => s.remaining > 0 && s.amount > 0);
    }

    if (u.buffs.length) {
      let changed = false;
      for (const b of u.buffs) {
        const def = getBuff(b.id);
        if (def.interval) {
          b.acc += dt;
          while (b.acc >= def.interval.every) {
            b.acc -= def.interval.every;
            const src = w.get(b.sourceId) ?? u;
            runEffects(w, def.interval.effects, makeCtx(src, { targetId: u.id, rank: b.rank }));
          }
        }
        b.remaining -= dt;
        if (b.remaining <= 0 && (def.stats || def.statsPct)) changed = true;
      }
      u.buffs = u.buffs.filter((b) => b.remaining > 0);
      if (changed) u.statsDirty = true;
    }

    // 装备被动：冷却推进；周期被动（按冷却计时）
    if (u.hero) {
      const h = u.hero;
      for (const k in h.itemCd) if (h.itemCd[k]! > 0) h.itemCd[k] = Math.max(0, h.itemCd[k]! - dt);
      for (const id of uniqueItems(h.items)) {
        const p = getItem(id).passive;
        if (!p || (h.itemCd[id] ?? 0) > 0) continue;
        for (const tr of p.triggers) {
          if (tr.on !== 'interval' || !tr.every) continue;
          const ctx = makeCtx(u, { rank: h.level });
          h.itemCd[id] = tr.every;
          if (tr.cond && !evalCond(w, tr.cond, ctx)) continue;
          runEffects(w, tr.effects, ctx);
        }
      }
    }

    // 周期被动（例如“每秒为身边友军回复”）
    if (u.hero) {
      const def = getHero(u.defId);
      for (const tr of def.passive.triggers) {
        if (tr.on !== 'interval' || !tr.every) continue;
        u.hero.passiveTimer += dt;
        if (u.hero.passiveTimer >= tr.every) {
          u.hero.passiveTimer -= tr.every;
          runEffects(w, tr.effects, makeCtx(u, { rank: u.hero.level }));
        }
      }
    }

    if (u.statsDirty) recomputeStats(u);

    // 回复
    if (u.stats.hpRegen > 0 && u.hp < u.stats.maxHp) u.hp = Math.min(u.stats.maxHp, u.hp + u.stats.hpRegen * dt);
    if (u.stats.mpRegen > 0 && u.mp < u.stats.maxMp) u.mp = Math.min(u.stats.maxMp, u.mp + u.stats.mpRegen * dt);
  }
}

/** 训练木桩：一段时间没挨打就回满血；被击退后自己走回原位 */
export function updateDummies(w: World): void {
  for (const u of w.list) {
    if (u.kind !== 'dummy' || !u.alive) continue;
    if (u.hp < u.stats.maxHp && w.time - u.lastDamagedAt > BALANCE.dummyResetDelay) {
      heal(w, u, u.stats.maxHp - u.hp);
    }
    if (!u.patrol && !u.forced && canAct(u)) {
      const dx = u.home.x - u.pos.x;
      const dy = u.home.y - u.pos.y;
      const d = Math.hypot(dx, dy);
      if (d > 0.2) {
        const step = Math.min(d, u.stats.moveSpeed * w.dt);
        w.walls.move(u.pos, u.radius, (dx / d) * step, (dy / d) * step);
      }
    }
  }
}
