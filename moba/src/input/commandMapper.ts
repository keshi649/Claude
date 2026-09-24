import type { Command } from '../sim/commands';
import type { Unit } from '../sim/entity';
import { currentStage } from '../sim/hero';
import type { World } from '../sim/world';
import { previewAim, type AimPreview } from './aim';
import type { AimSnapshot, InputState } from './state';

/**
 * 输入状态 → 逻辑命令。移动只在方向变化时发送（便于将来联机节省带宽），
 * 普攻按住期间每帧发送（逻辑层据此保持攻击指令）。
 */
export class CommandMapper {
  private lastMoveKey = '';

  constructor(private readonly pid: number) {}

  build(state: InputState, w: World, hero: Unit | undefined): Command[] {
    const out: Command[] = [];
    const pid = this.pid;
    const d = state.moveDir;
    // 方向量化到 1/64，避免微小抖动频繁发命令
    const key = d ? `${Math.round(d.x * 64)},${Math.round(d.y * 64)}` : 'none';
    if (key !== this.lastMoveKey) {
      this.lastMoveKey = key;
      out.push({ t: 'move', pid, dir: d ? { x: d.x, y: d.y } : null });
    }
    if (state.attackHeld) out.push({ t: 'attack', pid, mode: 'auto' });
    else if (state.farmHeld) out.push({ t: 'attack', pid, mode: 'farm' });

    for (const a of state.takeActions()) {
      switch (a.k) {
        case 'levelSkill':
          out.push({ t: 'levelSkill', pid, slot: a.slot });
          break;
        case 'moveTo':
          out.push({ t: 'moveTo', pid, x: a.x, y: a.y });
          break;
        case 'castStart':
          out.push({ t: 'cast', pid, slot: a.slot, aim: { k: 'auto' }, phase: 'start' });
          break;
        case 'castRelease': {
          if (!hero) break;
          const p = this.preview(w, hero, a.slot, a.aim);
          out.push({ t: 'cast', pid, slot: a.slot, aim: p.aim });
          break;
        }
      }
    }
    return out;
  }

  preview(w: World, hero: Unit, slot: 0 | 1 | 2, snap: AimSnapshot): AimPreview {
    return previewAim(w, hero, currentStage(hero, slot).stage, snap);
  }
}

/** 把当前瞄准状态转成快照（指示器实时预览用） */
export function liveSnapshot(state: InputState): AimSnapshot | null {
  const a = state.aiming;
  if (!a) return null;
  if (a.source === 'mouse') {
    const m = state.mouseWorld;
    return m ? { k: 'mouse', x: m.x, y: m.y } : { k: 'auto' };
  }
  const mag = Math.hypot(a.drag.x, a.drag.y);
  return a.dragged && mag > 0 ? { k: 'drag', dir: { x: a.drag.x / mag, y: a.drag.y / mag }, mag } : { k: 'auto' };
}
