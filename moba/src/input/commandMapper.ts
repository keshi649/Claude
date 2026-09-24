import type { Command } from '../sim/commands';
import type { Unit } from '../sim/entity';
import { currentStage, skillDef } from '../sim/hero';
import type { World } from '../sim/world';
import { previewAim, type AimPreview } from './aim';
import type { AimSnapshot, InputState, SlotId } from './state';
import { getSummoner } from '../data/summoners';
import type { SkillStage } from '../data/schema';

/** 某个槽位当前要释放的技能段（槽 3 为召唤师技能） */
export function stageOf(hero: Unit, slot: SlotId): SkillStage {
  if (slot === 3) return getSummoner(hero.hero!.summoner.id).stage;
  return currentStage(hero, slot).stage;
}

/**
 * 输入状态 → 逻辑命令。移动只在方向变化时发送（便于将来联机节省带宽），
 * 普攻按住期间每帧发送（逻辑层据此保持攻击指令）。
 */
/** 该技能此刻按下是否会进入蓄力（有蓄力配置、已学习、不在二段窗口） */
export function isChargeCast(hero: Unit, slot: 0 | 1 | 2): boolean {
  const def = skillDef(hero, slot);
  return !!def.charge && hero.hero!.skillLevels[slot] > 0 && currentStage(hero, slot).idx === -1;
}

export class CommandMapper {
  private lastMoveKey = '';
  /** 正在蓄力的技能槽（-1 表示没有） */
  private charging = -1;

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
    else if (state.towerHeld) out.push({ t: 'attack', pid, mode: 'tower' });

    for (const a of state.takeActions()) {
      switch (a.k) {
        case 'levelSkill':
          out.push({ t: 'levelSkill', pid, slot: a.slot });
          break;
        case 'moveTo':
          out.push({ t: 'moveTo', pid, x: a.x, y: a.y });
          break;
        case 'recall':
          out.push({ t: 'recall', pid });
          break;
        case 'restore':
          out.push({ t: 'restore', pid });
          break;
        case 'castStart':
          out.push({ t: 'cast', pid, slot: a.slot, aim: { k: 'auto' }, phase: 'start' });
          break;
        case 'aimStart':
          // 蓄力技能：按下即开始蓄力
          if (hero && a.slot !== 3 && isChargeCast(hero, a.slot)) {
            this.charging = a.slot;
            out.push({ t: 'cast', pid, slot: a.slot, aim: { k: 'auto' }, phase: 'start' });
          }
          break;
        case 'aimCancel':
          if (this.charging >= 0) {
            this.charging = -1;
            out.push({ t: 'cancelCast', pid });
          }
          break;
        case 'castRelease': {
          if (!hero) break;
          const p = this.preview(w, hero, a.slot, a.aim);
          if (a.slot === 3) out.push({ t: 'summoner', pid, aim: p.aim });
          else if (this.charging === a.slot) {
            this.charging = -1;
            out.push({ t: 'cast', pid, slot: a.slot, aim: p.aim, phase: 'release' });
          } else out.push({ t: 'cast', pid, slot: a.slot, aim: p.aim });
          break;
        }
      }
    }
    return out;
  }

  preview(w: World, hero: Unit, slot: SlotId, snap: AimSnapshot): AimPreview {
    return previewAim(w, hero, stageOf(hero, slot), snap);
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
