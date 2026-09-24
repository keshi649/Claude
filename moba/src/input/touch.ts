import type { InputState } from './state';

/**
 * 触屏控件的指针逻辑（DOM 元素由界面层创建）。
 * 使用 Pointer Events + setPointerCapture，天然支持多指：
 * 左手摇杆、右手技能 / 普攻可以同时操作。
 */

/** 浮动摇杆：在区域内任意位置按下即以该点为中心 */
export function bindJoystick(zone: HTMLElement, base: HTMLElement, knob: HTMLElement, state: InputState): () => void {
  const R = 60;
  let pid = -1;
  let cx = 0;
  let cy = 0;
  const restX = (): number => zone.clientWidth * 0.32;
  const restY = (): number => zone.clientHeight * 0.62;

  const place = (x: number, y: number, kx: number, ky: number): void => {
    base.style.transform = `translate(${x - R}px, ${y - R}px)`;
    knob.style.transform = `translate(${x + kx - 28}px, ${y + ky - 28}px)`;
  };
  const rest = (): void => {
    place(restX(), restY(), 0, 0);
    zone.classList.remove('active');
  };
  rest();

  const down = (e: PointerEvent): void => {
    if (pid !== -1) return;
    e.preventDefault();
    pid = e.pointerId;
    zone.setPointerCapture(pid);
    const r = zone.getBoundingClientRect();
    cx = e.clientX - r.left;
    cy = e.clientY - r.top;
    zone.classList.add('active');
    place(cx, cy, 0, 0);
  };
  const move = (e: PointerEvent): void => {
    if (e.pointerId !== pid) return;
    e.preventDefault();
    const r = zone.getBoundingClientRect();
    let dx = e.clientX - r.left - cx;
    let dy = e.clientY - r.top - cy;
    const d = Math.hypot(dx, dy);
    if (d > R) {
      dx = (dx / d) * R;
      dy = (dy / d) * R;
    }
    place(cx, cy, dx, dy);
    // 死区 12%
    state.stickMove = d > R * 0.12 ? { x: dx / Math.hypot(dx, dy), y: dy / Math.hypot(dx, dy) } : null;
    state.refreshMove();
  };
  const up = (e: PointerEvent): void => {
    if (e.pointerId !== pid) return;
    pid = -1;
    state.stickMove = null;
    state.refreshMove();
    rest();
  };
  zone.addEventListener('pointerdown', down);
  zone.addEventListener('pointermove', move);
  zone.addEventListener('pointerup', up);
  zone.addEventListener('pointercancel', up);
  const onResize = (): void => {
    if (pid === -1) rest();
  };
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}

/** 按住型按钮（普攻 / 补刀） */
export function bindHoldButton(btn: HTMLElement, onChange: (held: boolean) => void): void {
  let pid = -1;
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (pid !== -1) return;
    pid = e.pointerId;
    btn.setPointerCapture(pid);
    btn.classList.add('pressed');
    onChange(true);
  });
  const up = (e: PointerEvent): void => {
    if (e.pointerId !== pid) return;
    pid = -1;
    btn.classList.remove('pressed');
    onChange(false);
  };
  btn.addEventListener('pointerup', up);
  btn.addEventListener('pointercancel', up);
}

/**
 * 技能按钮：按下出现指示器，拖动瞄准，松手释放；拖到取消区松手则取消；
 * 点按不拖动 = 自动朝最近的敌方英雄释放。
 */
export function bindSkillButton(btn: HTMLElement, slot: 0 | 1 | 2, state: InputState, cancelZone: HTMLElement): void {
  const DRAG_MAX = 90;
  const TAP = 14;
  let pid = -1;
  let ox = 0;
  let oy = 0;

  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (pid !== -1) return;
    pid = e.pointerId;
    btn.setPointerCapture(pid);
    const r = btn.getBoundingClientRect();
    ox = r.left + r.width / 2;
    oy = r.top + r.height / 2;
    state.aiming = { slot, source: 'touch', drag: { x: 0, y: 0 }, dragged: false, cancel: false };
    btn.classList.add('pressed');
    document.body.classList.add('aiming');
  });
  btn.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pid || !state.aiming || state.aiming.slot !== slot) return;
    e.preventDefault();
    const dx = e.clientX - ox;
    const dy = e.clientY - oy;
    const d = Math.hypot(dx, dy);
    const a = state.aiming;
    if (d > TAP) a.dragged = true;
    const mag = Math.min(1, d / DRAG_MAX);
    a.drag = d > 0 ? { x: (dx / d) * mag, y: (dy / d) * mag } : { x: 0, y: 0 };
    const cr = cancelZone.getBoundingClientRect();
    a.cancel = e.clientX >= cr.left && e.clientX <= cr.right && e.clientY >= cr.top && e.clientY <= cr.bottom;
    cancelZone.classList.toggle('hot', a.cancel);
  });
  const up = (e: PointerEvent): void => {
    if (e.pointerId !== pid) return;
    pid = -1;
    btn.classList.remove('pressed');
    document.body.classList.remove('aiming');
    cancelZone.classList.remove('hot');
    const a = state.aiming;
    state.aiming = null;
    if (!a || a.slot !== slot || a.cancel || e.type === 'pointercancel') return;
    const mag = Math.hypot(a.drag.x, a.drag.y);
    state.actions.push({
      k: 'castRelease',
      slot,
      aim: a.dragged && mag > 0 ? { k: 'drag', dir: { x: a.drag.x / mag, y: a.drag.y / mag }, mag } : { k: 'auto' },
    });
  };
  btn.addEventListener('pointerup', up);
  btn.addEventListener('pointercancel', up);
}
