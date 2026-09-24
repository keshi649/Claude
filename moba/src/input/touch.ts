import type { InputState, SlotId } from './state';

/**
 * 触屏控件的指针逻辑（DOM 元素由界面层创建）。
 * 使用 Pointer Events + setPointerCapture，天然支持多指：
 * 左手摇杆、右手技能 / 普攻可以同时操作。
 */

/** 浮动摇杆：在区域内任意位置按下即以该点为中心 */
export function bindJoystick(zone: HTMLElement, base: HTMLElement, knob: HTMLElement, state: InputState): () => void {
  let pid = -1;
  let cx = 0;
  let cy = 0;
  // 摇杆半径随界面缩放（--ui 变量由界面层设置）
  const scale = (): number => Number(getComputedStyle(document.documentElement).getPropertyValue('--ui')) || 1;
  const radius = (): number => 66 * scale();
  let R = radius();
  const restX = (): number => 150 * scale();
  const restY = (): number => zone.clientHeight - 140 * scale();

  const place = (x: number, y: number, kx: number, ky: number): void => {
    R = radius();
    const kr = 30 * scale();
    base.style.width = base.style.height = `${R * 2}px`;
    base.style.setProperty('--half', `${R}px`);
    knob.style.width = knob.style.height = `${kr * 2}px`;
    base.style.transform = `translate(${x - R}px, ${y - R}px)`;
    knob.style.transform = `translate(${x + kx - kr}px, ${y + ky - kr}px)`;
    // 箭头指示方向
    if (kx !== 0 || ky !== 0) base.style.setProperty('--dir', `${Math.atan2(ky, kx) + Math.PI / 2}rad`);
    base.classList.toggle('dir', kx !== 0 || ky !== 0);
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
 * 技能按钮（轮盘施法）：按下时以按钮为圆心出现轮盘，拖动摇杆点瞄准，松手释放；
 * 拖到取消区松手则取消；点按不拖动 = 自动朝最近的敌方英雄释放。
 */
export function bindSkillButton(
  btn: HTMLElement,
  slot: SlotId,
  state: InputState,
  cancelZone: HTMLElement,
  wheel: { ring: HTMLElement; knob: HTMLElement },
): void {
  const TAP = 12;
  let pid = -1;
  let ox = 0;
  let oy = 0;
  let R = 90;

  const showWheel = (dx: number, dy: number): void => {
    wheel.ring.style.display = 'block';
    wheel.knob.style.display = 'block';
    wheel.ring.style.transform = `translate(${ox - R}px, ${oy - R}px)`;
    wheel.ring.style.width = wheel.ring.style.height = `${R * 2}px`;
    wheel.knob.style.transform = `translate(${ox + dx - 26}px, ${oy + dy - 26}px)`;
  };
  const hideWheel = (): void => {
    wheel.ring.style.display = 'none';
    wheel.knob.style.display = 'none';
  };

  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (pid !== -1) return;
    pid = e.pointerId;
    btn.setPointerCapture(pid);
    const r = btn.getBoundingClientRect();
    ox = r.left + r.width / 2;
    oy = r.top + r.height / 2;
    // 轮盘半径约为按钮直径的 1.4 倍
    R = Math.max(70, r.width * 1.4);
    state.aiming = { slot, source: 'touch', drag: { x: 0, y: 0 }, dragged: false, cancel: false };
    state.actions.push({ k: 'aimStart', slot });
    btn.classList.add('pressed');
    document.body.classList.add('aiming');
    showWheel(0, 0);
  });
  btn.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pid || !state.aiming || state.aiming.slot !== slot) return;
    e.preventDefault();
    let dx = e.clientX - ox;
    let dy = e.clientY - oy;
    const d = Math.hypot(dx, dy);
    const a = state.aiming;
    if (d > TAP) a.dragged = true;
    const mag = Math.min(1, d / R);
    a.drag = d > 0 ? { x: (dx / d) * mag, y: (dy / d) * mag } : { x: 0, y: 0 };
    const cr = cancelZone.getBoundingClientRect();
    a.cancel = e.clientX >= cr.left && e.clientX <= cr.right && e.clientY >= cr.top && e.clientY <= cr.bottom;
    cancelZone.classList.toggle('hot', a.cancel);
    if (d > R) {
      dx = (dx / d) * R;
      dy = (dy / d) * R;
    }
    showWheel(dx, dy);
    wheel.ring.classList.toggle('cancel', a.cancel);
  });
  const up = (e: PointerEvent): void => {
    if (e.pointerId !== pid) return;
    pid = -1;
    btn.classList.remove('pressed');
    document.body.classList.remove('aiming');
    cancelZone.classList.remove('hot');
    wheel.ring.classList.remove('cancel');
    hideWheel();
    const a = state.aiming;
    state.aiming = null;
    if (!a || a.slot !== slot || a.cancel || e.type === 'pointercancel') {
      state.actions.push({ k: 'aimCancel' });
      return;
    }
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

/** 点击型按钮（回城 / 恢复） */
export function bindTapButton(btn: HTMLElement, fn: () => void): void {
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    btn.classList.add('pressed');
    fn();
  });
  const up = (): void => btn.classList.remove('pressed');
  btn.addEventListener('pointerup', up);
  btn.addEventListener('pointercancel', up);
  btn.addEventListener('pointerleave', up);
}
