import { norm, type Vec2 } from '../../core/vec2';
import type { Affects, AreaVfx, Cond, Effect, Scaling, Shape, TriggerOn } from '../../data/schema';
import { getHero } from '../../data/heroes';
import { addShield, applyDamage, heal } from '../damage';
import type { EffectCtx, Unit } from '../entity';
import { isHeroLike, unitsInShape } from '../query';
import { addBuff, applyCc, hasBuff, removeBuff } from '../status';
import type { World } from '../world';

/**
 * 效果解释器：把配置里的声明式效果树翻译成逻辑操作。
 * 所有英雄的技能、被动、增益都通过这里生效，引擎里没有任何英雄专属代码。
 */

/** 生成默认效果上下文 */
export function makeCtx(caster: Unit, over: Partial<EffectCtx> = {}): EffectCtx {
  const dir = { x: Math.cos(caster.facing), y: Math.sin(caster.facing) };
  return {
    casterId: caster.id,
    team: caster.team,
    rank: 1,
    slot: -1,
    castId: 0,
    isSkill: false,
    origin: { x: caster.pos.x, y: caster.pos.y },
    dir,
    point: { x: caster.pos.x, y: caster.pos.y },
    targetId: 0,
    primaryId: 0,
    charge: 0,
    ...over,
  };
}

/** 计算数值：档位基础值 + 各项属性加成，最后乘蓄力与整体倍率 */
export function evalScaling(s: Scaling, ctx: EffectCtx, caster: Unit | undefined, target: Unit | undefined): number {
  const idx = Math.max(0, Math.min(ctx.rank - 1, s.base.length - 1));
  let v = s.base[idx] ?? 0;
  if (caster) {
    if (s.ad) v += s.ad * caster.stats.ad;
    if (s.bonusAd) v += s.bonusAd * caster.bonusAd;
    if (s.ap) v += s.ap * caster.stats.ap;
    if (s.maxHp) v += s.maxHp * caster.stats.maxHp;
    if (s.bonusHp) v += s.bonusHp * Math.max(0, caster.stats.maxHp - caster.baseStats.maxHp);
    if (s.maxMp) v += s.maxMp * caster.stats.maxMp;
  }
  if (target) {
    if (s.targetMaxHp) v += s.targetMaxHp * target.stats.maxHp;
    if (s.targetMissingHp) v += s.targetMissingHp * Math.max(0, target.stats.maxHp - target.hp);
  }
  if (s.charge) v *= 1 + s.charge * ctx.charge;
  if (s.mult) v *= s.mult;
  return v;
}

export function evalCond(w: World, c: Cond, ctx: EffectCtx): boolean {
  const target = w.get(ctx.targetId);
  switch (c.k) {
    case 'targetHasBuff':
      return !!target && hasBuff(target, c.buff, c.fromCaster ? ctx.casterId : undefined);
    case 'targetIsHero':
      return !!target && isHeroLike(target);
    case 'distFromOrigin': {
      if (!target) return false;
      const d = Math.hypot(target.pos.x - ctx.origin.x, target.pos.y - ctx.origin.y);
      return (c.gt === undefined || d > c.gt) && (c.lt === undefined || d < c.lt);
    }
    case 'targetHpBelow':
      return !!target && target.hp / target.stats.maxHp < c.pct;
    case 'chargeAtLeast':
      return ctx.charge >= c.ratio;
    case 'casterHasBuff': {
      const caster = w.get(ctx.casterId);
      return !!caster && hasBuff(caster, c.buff);
    }
    case 'isPrimaryTarget':
      return ctx.primaryId !== 0 && ctx.targetId === ctx.primaryId;
    case 'not':
      return !evalCond(w, c.c, ctx);
  }
}

export function runEffects(w: World, effects: readonly Effect[], ctx: EffectCtx): void {
  for (const e of effects) runEffect(w, e, ctx);
}

function pickTo(w: World, to: 'self' | 'target' | undefined, ctx: EffectCtx): Unit | undefined {
  if (to === 'self') return w.get(ctx.casterId);
  if (to === 'target') return w.get(ctx.targetId);
  return w.get(ctx.targetId) ?? w.get(ctx.casterId);
}

function runEffect(w: World, e: Effect, ctx: EffectCtx): void {
  const caster = w.get(ctx.casterId);
  switch (e.t) {
    case 'damage': {
      const target = w.get(ctx.targetId);
      if (!target || !target.alive) return;
      const raw = evalScaling(e.amount, ctx, caster, target);
      const dealt = applyDamage(w, caster ?? null, target, raw, e.dtype, {
        impact: e.impact ?? (ctx.isSkill ? 1 : 0),
        isSkill: ctx.isSkill,
      });
      if (ctx.isSkill && caster && caster.alive && dealt > 0) firePassive(w, caster, 'skillHit', target, ctx);
      return;
    }
    case 'heal': {
      const t = pickTo(w, e.to, ctx);
      if (t) heal(w, t, evalScaling(e.amount, ctx, caster, t));
      return;
    }
    case 'mana': {
      const t = pickTo(w, e.to, ctx);
      if (t && t.alive) t.mp = Math.min(t.stats.maxMp, t.mp + evalScaling(e.amount, ctx, caster, t));
      return;
    }
    case 'shield': {
      const t = pickTo(w, e.to, ctx);
      if (t) addShield(w, t, evalScaling(e.amount, ctx, caster, t), e.duration, ctx.casterId);
      return;
    }
    case 'cc': {
      const target = w.get(ctx.targetId);
      if (target) applyCc(w, caster ?? null, target, e.cc, e.duration, e.power ?? 0, ctx.origin);
      return;
    }
    case 'buff': {
      const t = pickTo(w, e.to, ctx);
      if (t) addBuff(w, t, e.buff, ctx.casterId, e.duration ?? Infinity, e.stacks ?? 1, caster?.hero?.level ?? ctx.rank);
      return;
    }
    case 'removeBuff': {
      const t = pickTo(w, e.to, ctx);
      if (t) removeBuff(t, e.buff);
      return;
    }
    case 'projectile': {
      if (!caster) return;
      const o = { x: caster.pos.x + ctx.dir.x * caster.radius, y: caster.pos.y + ctx.dir.y * caster.radius };
      w.projectiles.push({
        id: w.nextId(),
        ownerId: caster.id,
        team: caster.team,
        pos: { ...o },
        prevPos: { ...o },
        dirX: ctx.dir.x,
        dirY: ctx.dir.y,
        speed: e.speed,
        remaining: e.range,
        width: e.width,
        pierce: !!e.pierce,
        affects: e.affects ?? 'enemies',
        hitIds: [],
        onHit: e.onHit,
        onEnd: e.onEnd ?? null,
        stopAtWall: !!e.stopAtWall,
        vfx: e.vfx,
        ctx: { ...ctx, targetId: 0, origin: { ...o } },
        homingTarget: 0,
        isAttack: false,
        crit: false,
        dead: false,
      });
      return;
    }
    case 'dash':
      startDash(w, e, ctx, caster);
      return;
    case 'area': {
      const origin = areaOrigin(w, e.at ?? 'caster', ctx, caster);
      if (!origin) return;
      if (e.delay && e.delay > 0) {
        w.pending.push({
          id: w.nextId(),
          remaining: e.delay,
          total: e.delay,
          pos: origin,
          dir: { ...ctx.dir },
          shape: e.shape,
          affects: e.affects ?? 'enemies',
          onHit: e.onHit,
          onAnyHit: e.onAnyHit ?? null,
          vfx: e.vfx ?? null,
          ctx: { ...ctx },
          team: ctx.team,
        });
        w.emit({
          t: 'area',
          team: ctx.team,
          owner: ctx.casterId,
          x: origin.x,
          y: origin.y,
          dirX: ctx.dir.x,
          dirY: ctx.dir.y,
          shape: e.shape,
          vfx: e.vfx ?? null,
          warn: e.delay,
        });
        return;
      }
      resolveArea(w, e.shape, origin, ctx.dir, e.affects ?? 'enemies', e.onHit, e.onAnyHit ?? null, e.vfx ?? null, ctx);
      return;
    }
    case 'zone': {
      const pos = e.at === 'point' ? { ...ctx.point } : caster ? { ...caster.pos } : { ...ctx.origin };
      w.zones.push({
        id: w.nextId(),
        ownerId: ctx.casterId,
        team: ctx.team,
        pos,
        dir: { ...ctx.dir },
        shape: e.shape,
        remaining: e.duration,
        duration: e.duration,
        interval: e.interval,
        acc: e.interval, // 放下时立即生效一次
        affects: e.affects ?? 'enemies',
        onTick: e.onTick,
        follow: !!e.follow,
        vfx: e.vfx ?? null,
        ctx: { ...ctx },
      });
      return;
    }
    case 'blink':
      if (caster) doBlink(w, caster, e.to, e.maxDist, ctx);
      return;
    case 'refreshCooldown':
      if (caster?.hero) caster.hero.cooldowns[e.slot] = 0;
      return;
    case 'if':
      if (evalCond(w, e.cond, ctx)) runEffects(w, e.then, ctx);
      else if (e.else) runEffects(w, e.else, ctx);
      return;
  }
}

function areaOrigin(
  w: World,
  at: 'caster' | 'point' | 'target',
  ctx: EffectCtx,
  caster: Unit | undefined,
): Vec2 | null {
  if (at === 'point') return { ...ctx.point };
  if (at === 'target') {
    const t = w.get(ctx.targetId) ?? w.get(ctx.primaryId);
    return t ? { ...t.pos } : null;
  }
  return caster ? { ...caster.pos } : { ...ctx.origin };
}

/** 结算一次区域效果：通知表现层，并对形状内每个目标执行 onHit */
export function resolveArea(
  w: World,
  shape: Shape,
  origin: Vec2,
  dir: Vec2,
  affects: Affects,
  onHit: readonly Effect[],
  onAnyHit: readonly Effect[] | null,
  vfx: AreaVfx | null,
  ctx: EffectCtx,
): void {
  w.emit({
    t: 'area',
    team: ctx.team,
    owner: ctx.casterId,
    x: origin.x,
    y: origin.y,
    dirX: dir.x,
    dirY: dir.y,
    shape,
    vfx,
    warn: 0,
  });
  const hits = unitsInShape(w, shape, origin, dir, ctx.team, ctx.casterId, affects);
  for (const u of hits) runEffects(w, onHit, { ...ctx, origin, targetId: u.id });
  if (hits.length > 0 && onAnyHit) runEffects(w, onAnyHit, { ...ctx, origin, targetId: 0 });
}

function startDash(w: World, e: Extract<Effect, { t: 'dash' }>, ctx: EffectCtx, caster: Unit | undefined): void {
  if (!caster || !caster.alive) return;
  let dir = ctx.dir;
  let distance = e.distance ?? 0;
  let targetId = 0;
  let stopDist = 0;
  if (e.mode === 'toPoint') {
    const dx = ctx.point.x - caster.pos.x;
    const dy = ctx.point.y - caster.pos.y;
    dir = norm({ x: dx, y: dy });
    distance = Math.min(Math.hypot(dx, dy), e.distance ?? Infinity);
  } else if (e.mode === 'toTarget') {
    const t = w.get(ctx.primaryId || ctx.targetId);
    if (!t) return;
    targetId = t.id;
    stopDist = t.radius + caster.radius + 0.1;
    const dx = t.pos.x - caster.pos.x;
    const dy = t.pos.y - caster.pos.y;
    dir = norm({ x: dx, y: dy });
    distance = Math.max(0, Math.hypot(dx, dy) - stopDist);
  }
  if (dir.x === 0 && dir.y === 0) dir = { x: Math.cos(caster.facing), y: Math.sin(caster.facing) };
  caster.attack.windup = 0;
  caster.facing = Math.atan2(dir.y, dir.x);
  caster.forced = {
    kind: 'dash',
    dirX: dir.x,
    dirY: dir.y,
    speed: e.speed,
    remaining: distance,
    targetId,
    stopDist,
    passHit: e.passHit,
    stopOnHero: e.stopOnHero,
    onEnd: e.onEnd,
    ctx: { ...ctx },
    hitIds: [],
    untargetable: !!e.untargetable,
  };
  w.emit({ t: 'dash', unit: caster.id, trail: e.trail ?? 0xffffff });
}

/** 闪烁：目标点在墙里时，沿连线往回找最近的合法落点（可以越过薄墙） */
function doBlink(w: World, caster: Unit, to: 'point' | 'behindTarget', maxDist: number | undefined, ctx: EffectCtx): void {
  const from = { ...caster.pos };
  let land: Vec2 | null = null;
  if (to === 'point') {
    let dx = ctx.point.x - from.x;
    let dy = ctx.point.y - from.y;
    const d = Math.hypot(dx, dy);
    const md = maxDist ?? d;
    if (d > md && d > 0) {
      dx = (dx / d) * md;
      dy = (dy / d) * md;
    }
    const steps = Math.ceil(Math.hypot(dx, dy) / 0.25);
    for (let i = steps; i >= 0; i--) {
      const t = steps === 0 ? 0 : i / steps;
      const x = from.x + dx * t;
      const y = from.y + dy * t;
      if (!w.walls.isBlocked(x, y, caster.radius)) {
        land = { x, y };
        break;
      }
    }
  } else {
    const t = w.get(ctx.primaryId || ctx.targetId);
    if (!t) return;
    const d = norm({ x: t.pos.x - from.x, y: t.pos.y - from.y });
    const off = t.radius + caster.radius + 0.2;
    // 优先落在目标身后，被墙挡住就绕目标找一圈
    for (let k = 0; k < 8 && !land; k++) {
      const a = Math.atan2(d.y, d.x) + (k % 2 === 0 ? 1 : -1) * Math.ceil(k / 2) * (Math.PI / 4);
      const x = t.pos.x + Math.cos(a) * off;
      const y = t.pos.y + Math.sin(a) * off;
      if (!w.walls.isBlocked(x, y, caster.radius)) land = { x, y };
    }
    if (land) caster.facing = Math.atan2(t.pos.y - land.y, t.pos.x - land.x);
  }
  if (!land) return;
  caster.pos.x = land.x;
  caster.pos.y = land.y;
  // 瞬移不做插值
  caster.prevPos.x = land.x;
  caster.prevPos.y = land.y;
  caster.navPath = [];
  w.emit({ t: 'blink', unit: caster.id, fromX: from.x, fromY: from.y, toX: land.x, toY: land.y });
}

/**
 * 触发英雄被动。oncePerCast 的触发器在同一次施法（castId）内只触发一次。
 */
export function firePassive(w: World, unit: Unit, on: TriggerOn, target: Unit | null, srcCtx?: EffectCtx): void {
  if (!unit.hero) return;
  const def = getHero(unit.defId);
  def.passive.triggers.forEach((tr, i) => {
    if (tr.on !== on) return;
    if (tr.heroOnly && (!target || !isHeroLike(target))) return;
    if (tr.oncePerCast && srcCtx) {
      if (unit.hero!.passiveStamp[i] === srcCtx.castId) return;
      unit.hero!.passiveStamp[i] = srcCtx.castId;
    }
    runEffects(
      w,
      tr.effects,
      makeCtx(unit, { targetId: target?.id ?? 0, rank: unit.hero!.level, slot: -1, isSkill: false }),
    );
  });
}
