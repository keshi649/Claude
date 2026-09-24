import { norm, type Vec2 } from '../core/vec2';
import type { SkillStage } from '../data/schema';
import type { Aim } from '../sim/commands';
import type { Unit } from '../sim/entity';
import { pickAutoAimTarget, pickUnitNearPoint } from '../sim/query';
import type { World } from '../sim/world';
import type { AimSnapshot } from './state';

/**
 * 把设备瞄准信息换算成逻辑层的 Aim，同时给出指示器要画的方向 / 落点 / 预选目标。
 * 指示器与实际释放共用这一套计算，保证“看到的就是放出去的”。
 */
export interface AimPreview {
  aim: Aim;
  dir: Vec2;
  point: Vec2;
  target: Unit | null;
}

export function previewAim(w: World, hero: Unit, stage: SkillStage, snap: AimSnapshot): AimPreview {
  const pos = hero.pos;
  const facing = { x: Math.cos(hero.facing), y: Math.sin(hero.facing) };
  const range = stage.range;

  // 点按：自动朝最近的敌方英雄
  if (snap.k === 'auto') {
    const filter = stage.unitFilter ?? 'enemy';
    const t = stage.targeting === 'self' ? null : pickAutoAimTarget(w, hero, range, filter);
    const dir = t ? norm({ x: t.pos.x - pos.x, y: t.pos.y - pos.y }) : facing;
    let point = t ? { ...t.pos } : { x: pos.x + facing.x * Math.min(range, 3), y: pos.y + facing.y * Math.min(range, 3) };
    if (stage.targeting === 'direction') point = { x: pos.x + dir.x * range, y: pos.y + dir.y * range };
    return { aim: { k: 'auto' }, dir, point: clampRange(pos, point, range), target: stage.targeting === 'unit' ? t : null };
  }

  let dir: Vec2;
  let point: Vec2;
  if (snap.k === 'drag') {
    dir = snap.dir.x === 0 && snap.dir.y === 0 ? facing : snap.dir;
    point = { x: pos.x + dir.x * range * snap.mag, y: pos.y + dir.y * range * snap.mag };
  } else {
    const d = norm({ x: snap.x - pos.x, y: snap.y - pos.y });
    dir = d.x === 0 && d.y === 0 ? facing : d;
    point = clampRange(pos, { x: snap.x, y: snap.y }, range);
  }

  switch (stage.targeting) {
    case 'self':
      return { aim: { k: 'auto' }, dir: facing, point: { ...pos }, target: null };
    case 'direction':
      return { aim: { k: 'dir', x: dir.x, y: dir.y }, dir, point: { x: pos.x + dir.x * range, y: pos.y + dir.y * range }, target: null };
    case 'point':
      return { aim: { k: 'point', x: point.x, y: point.y }, dir, point, target: null };
    case 'unit': {
      const probe = snap.k === 'drag' ? { x: pos.x + dir.x * range * Math.max(0.3, snap.mag), y: pos.y + dir.y * range * Math.max(0.3, snap.mag) } : point;
      const t = pickUnitNearPoint(w, hero, probe, range, stage.unitFilter ?? 'enemy');
      return { aim: t ? { k: 'unit', id: t.id } : { k: 'point', x: probe.x, y: probe.y }, dir, point: probe, target: t };
    }
  }
}

function clampRange(pos: Vec2, p: Vec2, range: number): Vec2 {
  const dx = p.x - pos.x;
  const dy = p.y - pos.y;
  const d = Math.hypot(dx, dy);
  if (d <= range || d === 0) return { x: p.x, y: p.y };
  return { x: pos.x + (dx / d) * range, y: pos.y + (dy / d) * range };
}
