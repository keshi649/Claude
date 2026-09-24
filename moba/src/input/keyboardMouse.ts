import type { InputState, SlotId } from './state';

const SKILL_KEYS: Record<string, SlotId> = { KeyQ: 0, KeyE: 1, KeyR: 2, KeyF: 3 };

export interface KeyboardHooks {
  onToggleDebug: () => void;
}

/**
 * 电脑操作：WASD 移动，鼠标瞄准，空格普攻，C 补刀，Z 推塔，
 * Q/E/R 技能、F 召唤师技能：按住显示指示器、松开释放（Esc / 右键取消），
 * Ctrl+Q/E/R 加点，B 回城，V 恢复，` 开关调试面板。
 */
export class KeyboardMouse {
  private readonly held = new Set<string>();
  private readonly off: (() => void)[] = [];

  constructor(
    private readonly state: InputState,
    private readonly hooks: KeyboardHooks,
  ) {
    const on = <K extends keyof WindowEventMap>(type: K, fn: (e: WindowEventMap[K]) => void): void => {
      window.addEventListener(type, fn as EventListener, { passive: false });
      this.off.push(() => window.removeEventListener(type, fn as EventListener));
    };
    on('keydown', (e) => this.keyDown(e));
    on('keyup', (e) => this.keyUp(e));
    on('mousemove', (e) => {
      this.state.mouseScreen = { x: e.clientX, y: e.clientY };
    });
    on('contextmenu', (e) => e.preventDefault());
    on('mousedown', (e) => {
      if (e.button === 2 && this.state.aiming?.source === 'mouse') this.state.aiming = null;
    });
    on('blur', () => this.releaseAll());
  }

  private isTyping(e: KeyboardEvent): boolean {
    const t = e.target as HTMLElement | null;
    return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) && (t as HTMLInputElement).type !== 'checkbox';
  }

  private keyDown(e: KeyboardEvent): void {
    if (this.isTyping(e)) return;
    const code = e.code;
    if (code === 'Backquote' || code === 'F1') {
      e.preventDefault();
      if (!e.repeat) this.hooks.onToggleDebug();
      return;
    }
    if (code === 'Space' || code === 'Tab') e.preventDefault();
    if (code === 'Escape') {
      this.state.aiming = null;
      return;
    }
    const slot = SKILL_KEYS[code];
    if (slot !== undefined) {
      e.preventDefault();
      if (e.repeat) return;
      if ((e.ctrlKey || e.metaKey) && slot !== 3) {
        this.state.actions.push({ k: 'levelSkill', slot });
        return;
      }
      this.state.aiming = { slot, source: 'mouse', drag: { x: 0, y: 0 }, dragged: true, cancel: false };
      return;
    }
    if (code === 'KeyB' && !e.repeat) {
      this.state.actions.push({ k: 'recall' });
      return;
    }
    if (code === 'KeyV' && !e.repeat) {
      this.state.actions.push({ k: 'restore' });
      return;
    }
    this.held.add(code);
    this.sync();
  }

  private keyUp(e: KeyboardEvent): void {
    const code = e.code;
    const slot = SKILL_KEYS[code];
    if (slot !== undefined) {
      const a = this.state.aiming;
      if (a && a.slot === slot && a.source === 'mouse') {
        const m = this.state.mouseWorld;
        this.state.actions.push({ k: 'castRelease', slot, aim: m ? { k: 'mouse', x: m.x, y: m.y } : { k: 'auto' } });
        this.state.aiming = null;
      }
      return;
    }
    this.held.delete(code);
    this.sync();
  }

  private sync(): void {
    const h = this.held;
    let x = 0;
    let y = 0;
    if (h.has('KeyA') || h.has('ArrowLeft')) x -= 1;
    if (h.has('KeyD') || h.has('ArrowRight')) x += 1;
    if (h.has('KeyW') || h.has('ArrowUp')) y -= 1;
    if (h.has('KeyS') || h.has('ArrowDown')) y += 1;
    const l = Math.hypot(x, y);
    this.state.keyMove = l > 0 ? { x: x / l, y: y / l } : null;
    this.state.refreshMove();
    this.state.attackHeld = h.has('Space') || this.touchAttack;
    this.state.farmHeld = h.has('KeyC') || this.touchFarm;
    this.state.towerHeld = h.has('KeyZ') || this.touchTower;
  }

  /** 触屏按钮的按住状态与键盘合并 */
  touchAttack = false;
  touchFarm = false;
  touchTower = false;
  setTouchAttack(attack: boolean, farm: boolean, tower: boolean): void {
    this.touchAttack = attack;
    this.touchFarm = farm;
    this.touchTower = tower;
    this.sync();
  }

  releaseAll(): void {
    this.held.clear();
    this.state.aiming = null;
    this.sync();
  }

  destroy(): void {
    for (const f of this.off) f();
  }
}
