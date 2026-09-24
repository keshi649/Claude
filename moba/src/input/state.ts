import type { Vec2 } from '../core/vec2';

/**
 * 抽象输入状态：键鼠和触屏都写入这里，再由 commandMapper 编译成逻辑命令。
 * 与具体设备无关，也不直接接触逻辑层。
 */
/** 技能槽：0/1/2 为英雄技能，3 为召唤师技能 */
export type SlotId = 0 | 1 | 2 | 3;

export interface AimingState {
  slot: SlotId;
  source: 'touch' | 'mouse';
  /** 触屏：拖动向量（归一化方向），长度 0~1 表示拖动幅度 */
  drag: Vec2;
  /** 拖动是否超过“点按”阈值 */
  dragged: boolean;
  /** 手指是否位于取消区 */
  cancel: boolean;
}

export type InputAction =
  | { k: 'castRelease'; slot: SlotId; aim: AimSnapshot }
  | { k: 'castStart'; slot: 0 | 1 | 2 }
  | { k: 'levelSkill'; slot: 0 | 1 | 2 }
  | { k: 'moveTo'; x: number; y: number }
  | { k: 'recall' }
  | { k: 'restore' };

/** 释放瞬间锁定的瞄准信息 */
export type AimSnapshot =
  | { k: 'auto' }
  | { k: 'drag'; dir: Vec2; mag: number }
  | { k: 'mouse'; x: number; y: number };

export class InputState {
  /** 移动方向（单位向量或 null） */
  moveDir: Vec2 | null = null;
  /** 键盘移动与摇杆移动分开记录，任一有效即可 */
  keyMove: Vec2 | null = null;
  stickMove: Vec2 | null = null;
  attackHeld = false;
  farmHeld = false;
  towerHeld = false;
  aiming: AimingState | null = null;
  /** 鼠标的世界坐标（电脑端瞄准） */
  mouseWorld: Vec2 | null = null;
  mouseScreen: Vec2 | null = null;
  /** 待处理的一次性动作 */
  actions: InputAction[] = [];

  refreshMove(): void {
    this.moveDir = this.stickMove ?? this.keyMove;
  }

  takeActions(): InputAction[] {
    const a = this.actions;
    this.actions = [];
    return a;
  }
}
