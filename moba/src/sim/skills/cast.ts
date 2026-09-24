import { norm, type Vec2 } from '../../core/vec2';
import { BALANCE } from '../../data/balance';
import type { SkillStage } from '../../data/schema';
import type { Aim } from '../commands';
import type { Unit } from '../entity';
import { currentStage, skillDef } from '../hero';
import { passesFilter, pickAutoAimTarget, pickUnitNearPoint } from '../query';
import { canCast, isTargetable } from '../status';
import { effectiveCooldown } from '../stats';
import type { World } from '../world';
import { makeCtx, runEffects } from './effects';

/**
 * 施法状态机：
 *   [蓄力] → 前摇 → 生效（执行效果树）→ 后摇（可被移动 / 普攻取消）
 * 输入缓冲：前摇、蓄力或主动位移期间按下的技能会排队，结束后立刻释放。
 */

export interface ResolvedAim {
  dir: Vec2;
  point: Vec2;
  targetId: number;
}

const facingDir = (u: Unit): Vec2 => ({ x: Math.cos(u.facing), y: Math.sin(u.facing) });

/** 把输入的瞄准信息解析成方向 / 落点 / 目标；指向性技能找不到目标返回 null */
export function resolveAim(w: World, u: Unit, stage: SkillStage, aim: Aim): ResolvedAim | null {
  const pos = u.pos;
  const range = stage.range;
  const toward = (p: Vec2): Vec2 => {
    const d = norm({ x: p.x - pos.x, y: p.y - pos.y });
    return d.x === 0 && d.y === 0 ? facingDir(u) : d;
  };
  switch (stage.targeting) {
    case 'self':
      return { dir: facingDir(u), point: { ...pos }, targetId: 0 };
    case 'direction': {
      let dir: Vec2;
      if (aim.k === 'dir') dir = norm({ x: aim.x, y: aim.y });
      else if (aim.k === 'point') dir = toward(aim);
      else if (aim.k === 'unit') {
        const t = w.get(aim.id);
        dir = t ? toward(t.pos) : facingDir(u);
      } else {
        const t = pickAutoAimTarget(w, u, range);
        dir = t ? toward(t.pos) : facingDir(u);
      }
      if (dir.x === 0 && dir.y === 0) dir = facingDir(u);
      return { dir, point: { x: pos.x + dir.x * range, y: pos.y + dir.y * range }, targetId: 0 };
    }
    case 'point': {
      let point: Vec2;
      if (aim.k === 'point') point = { x: aim.x, y: aim.y };
      else if (aim.k === 'dir') {
        const d = norm({ x: aim.x, y: aim.y });
        point = { x: pos.x + d.x * range, y: pos.y + d.y * range };
      } else if (aim.k === 'unit') {
        const t = w.get(aim.id);
        point = t ? { ...t.pos } : { ...pos };
      } else {
        const t = pickAutoAimTarget(w, u, range);
        const f = facingDir(u);
        point = t ? { ...t.pos } : { x: pos.x + f.x * Math.min(range, 3), y: pos.y + f.y * Math.min(range, 3) };
      }
      // 落点限制在施法距离内
      const dx = point.x - pos.x;
      const dy = point.y - pos.y;
      const d = Math.hypot(dx, dy);
      if (d > range && d > 0) point = { x: pos.x + (dx / d) * range, y: pos.y + (dy / d) * range };
      return { dir: toward(point), point, targetId: 0 };
    }
    case 'unit': {
      const filter = stage.unitFilter ?? 'enemy';
      let t: Unit | null = null;
      if (aim.k === 'unit') {
        const c = w.get(aim.id);
        if (c && passesFilter(u, c, filter) && Math.hypot(c.pos.x - pos.x, c.pos.y - pos.y) - c.radius <= range + 0.5) t = c;
      } else if (aim.k === 'point') {
        t = pickUnitNearPoint(w, u, aim, range, filter);
      } else if (aim.k === 'dir') {
        const p = { x: pos.x + aim.x * range, y: pos.y + aim.y * range };
        t = pickUnitNearPoint(w, u, p, range, filter);
      } else {
        t = pickAutoAimTarget(w, u, range, filter);
      }
      if (!t) return null;
      if (Math.hypot(t.pos.x - pos.x, t.pos.y - pos.y) - t.radius > range + BALANCE.autoAimBonus) return null;
      return { dir: toward(t.pos), point: { ...t.pos }, targetId: t.id };
    }
  }
}

function fail(w: World, u: Unit, reason: string): false {
  w.emit({ t: 'castFail', unit: u.id, reason });
  return false;
}

export function startCooldown(w: World, u: Unit, slot: 0 | 1 | 2): void {
  const h = u.hero!;
  const def = skillDef(u, slot);
  const lvl = Math.max(1, h.skillLevels[slot]);
  const base = def.cooldown[Math.min(lvl - 1, def.cooldown.length - 1)] ?? 0;
  const cd = w.debug.noCooldown ? 0 : effectiveCooldown(base, u.stats.cdr);
  h.cooldowns[slot] = cd;
  h.cooldownTotals[slot] = cd;
}

/** 施法是否被占用（需要排队） */
function busy(u: Unit): boolean {
  return (u.cast !== null && u.cast.phase !== 'recovery') || (u.forced !== null && u.forced.kind === 'dash');
}

/** 预计还要忙多久（秒），决定排队施法的有效期 */
function busyRemaining(u: Unit): number {
  let t = 0;
  if (u.cast?.phase === 'windup') t = Math.max(t, u.cast.timer);
  // 蓄力中按下其它技能：等蓄力技能松手
  if (u.cast?.phase === 'charging') t = Math.max(t, 3);
  if (u.forced?.kind === 'dash') t = Math.max(t, u.forced.remaining / Math.max(1, u.forced.speed));
  return t;
}

/**
 * 处理施法命令。返回是否成功开始施法（排队也算 false）。
 */
export function commandCast(w: World, u: Unit, slot: 0 | 1 | 2, aim: Aim, phase?: 'start' | 'release'): boolean {
  const h = u.hero;
  if (!h || !u.alive) return false;
  const def = skillDef(u, slot);

  // 蓄力技能松手
  if (phase === 'release') {
    if (u.cast && u.cast.slot === slot && u.cast.phase === 'charging') {
      releaseCharge(w, u, aim);
      return true;
    }
    if (u.queuedCast && u.queuedCast.slot === slot) u.queuedCast = { ...u.queuedCast, aim, phase: 'release' };
    return false;
  }

  if (h.skillLevels[slot] <= 0) return fail(w, u, '技能未学习');
  const rc = h.recast[slot];
  if (!rc && h.cooldowns[slot] > 0) return fail(w, u, '技能冷却中');
  const lvl = h.skillLevels[slot];
  const cost = rc ? 0 : (def.cost[Math.min(lvl - 1, def.cost.length - 1)] ?? 0);
  if (u.mp < cost) return fail(w, u, '法力不足');

  if (busy(u)) {
    u.queuedCast = { slot, aim, phase, until: w.time + busyRemaining(u) + BALANCE.inputBuffer };
    return false;
  }
  if (!canCast(u)) return fail(w, u, u.status.silence > 0 ? '被沉默' : '无法施法');

  const { stage, idx } = currentStage(u, slot);
  const resolved = resolveAim(w, u, stage, aim);
  if (!resolved) return fail(w, u, '没有目标');

  // —— 提交施法 ——
  u.mp -= cost;
  u.attack.windup = 0;
  u.queuedCast = null;
  u.facing = Math.atan2(resolved.dir.y, resolved.dir.x);
  const castId = w.newCastId();

  if (def.recast) {
    if (!rc) h.recast[slot] = { next: 0, remaining: def.recast.window };
    else {
      rc.next++;
      if (rc.next >= def.recast.stages.length) {
        h.recast[slot] = null;
        startCooldown(w, u, slot);
      } else rc.remaining = def.recast.window;
    }
  } else if (!def.charge) {
    startCooldown(w, u, slot);
  }

  const charging = !!def.charge && idx === -1;
  u.cast = {
    slot,
    stage: idx,
    phase: charging ? 'charging' : 'windup',
    timer: charging ? 0 : stage.windup,
    castId,
    dir: resolved.dir,
    point: resolved.point,
    targetId: resolved.targetId,
    charge: 0,
  };
  w.emit({
    t: 'castStart',
    unit: u.id,
    slot,
    skillId: def.id,
    name: stage.name,
    windup: charging ? def.charge!.max : stage.windup,
    dirX: resolved.dir.x,
    dirY: resolved.dir.y,
    x: resolved.point.x,
    y: resolved.point.y,
    targetId: resolved.targetId,
    indicator: stage.indicator,
    color: (stage.icon ?? def.icon).color,
  });
  if (!charging && stage.windup <= 0) finishWindup(w, u);
  return true;
}

/** 取消蓄力：返还法力，不进入冷却 */
export function cancelCharge(w: World, u: Unit): void {
  const c = u.cast;
  if (!c || c.phase !== 'charging') return;
  const def = skillDef(u, c.slot);
  const lvl = u.hero!.skillLevels[c.slot];
  u.mp = Math.min(u.stats.maxMp, u.mp + (def.cost[Math.min(lvl - 1, def.cost.length - 1)] ?? 0));
  u.cast = null;
  w.emit({ t: 'castFail', unit: u.id, reason: '已取消' });
}

function releaseCharge(w: World, u: Unit, aim: Aim): void {
  const c = u.cast!;
  const def = skillDef(u, c.slot);
  const ch = def.charge!;
  c.charge = Math.max(0, Math.min(1, (c.timer - ch.min) / Math.max(0.001, ch.max - ch.min)));
  if (aim.k !== 'auto') {
    const r = resolveAim(w, u, def, aim);
    if (r) {
      c.dir = r.dir;
      c.point = r.point;
      c.targetId = r.targetId || c.targetId;
      u.facing = Math.atan2(r.dir.y, r.dir.x);
    }
  }
  c.phase = 'windup';
  c.timer = def.windup;
  startCooldown(w, u, c.slot);
  if (def.windup <= 0) finishWindup(w, u);
}

function finishWindup(w: World, u: Unit): void {
  const c = u.cast!;
  const def = skillDef(u, c.slot);
  const stage = c.stage >= 0 && def.recast ? def.recast.stages[c.stage]! : def;
  // 指向性技能：前摇结束时目标已失效则取消
  if (stage.targeting === 'unit') {
    const t = w.get(c.targetId);
    if (!t || !isTargetable(t)) {
      u.cast = null;
      return;
    }
    c.dir = norm({ x: t.pos.x - u.pos.x, y: t.pos.y - u.pos.y });
    c.point = { ...t.pos };
  }
  const ctx = makeCtx(u, {
    rank: u.hero!.skillLevels[c.slot],
    slot: c.slot,
    castId: c.castId,
    isSkill: true,
    dir: { ...c.dir },
    point: { ...c.point },
    targetId: c.targetId,
    primaryId: c.targetId,
    charge: c.charge,
  });
  c.phase = 'recovery';
  c.timer = stage.recovery;
  runEffects(w, stage.effects, ctx);
}

/** 每帧：冷却、二段窗口、施法阶段推进、排队施法 */
export function updateCasts(w: World): void {
  const dt = w.dt;
  for (const u of w.list) {
    const h = u.hero;
    if (!h || !u.alive) continue;
    for (let s = 0 as 0 | 1 | 2; s < 3; s = (s + 1) as 0 | 1 | 2) {
      if (h.cooldowns[s] > 0) h.cooldowns[s] = Math.max(0, h.cooldowns[s] - dt);
      const rc = h.recast[s];
      if (rc) {
        // 施法进行中不计时，避免二段窗口在前摇里流失
        if (!(u.cast && u.cast.slot === s && u.cast.phase !== 'recovery')) rc.remaining -= dt;
        if (rc.remaining <= 0) {
          h.recast[s] = null;
          startCooldown(w, u, s);
        }
      }
    }

    const c = u.cast;
    if (c) {
      if (c.phase === 'charging') {
        c.timer += dt;
        const def = skillDef(u, c.slot);
        if (c.timer >= def.charge!.max) releaseCharge(w, u, { k: 'auto' });
      } else if (c.phase === 'windup') {
        c.timer -= dt;
        if (c.timer <= 0) finishWindup(w, u);
      } else {
        c.timer -= dt;
        if (c.timer <= 0) u.cast = null;
      }
    }

    const q = u.queuedCast;
    if (q) {
      if (w.time > q.until) u.queuedCast = null;
      else if (!busy(u)) {
        u.queuedCast = null;
        commandCast(w, u, q.slot, q.aim, q.phase === 'release' ? 'start' : q.phase);
        if (q.phase === 'release') commandCast(w, u, q.slot, q.aim, 'release');
      }
    }
  }
}
