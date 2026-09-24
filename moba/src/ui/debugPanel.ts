import type { DebugOp } from '../sim/commands';

export interface DebugState {
  colliders: boolean;
  paths: boolean;
  /** 点地图 → 用 A* 寻路移动过去 */
  clickPath: boolean;
  fast: boolean;
  noCooldown: boolean;
}

/**
 * 调试面板（` 键或右上角“调”按钮开关）：
 * 显示碰撞体 / 寻路路径、点击寻路测试、时间 ×4、无冷却、刷新冷却、升级、回满状态，以及性能统计。
 */
export class DebugPanel {
  readonly el: HTMLElement;
  readonly state: DebugState = { colliders: false, paths: false, clickPath: false, fast: false, noCooldown: false };
  private stats: HTMLElement;
  visible = false;

  constructor(
    parent: HTMLElement,
    private readonly onChange: (s: DebugState) => void,
    private readonly onOp: (op: DebugOp, value?: number) => void,
  ) {
    const el = document.createElement('div');
    el.className = 'debug-panel';
    el.innerHTML = '<h3>调试面板</h3>';
    const toggle = (key: keyof DebugState, label: string): void => {
      const l = document.createElement('label');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.addEventListener('change', () => {
        this.state[key] = cb.checked;
        if (key === 'noCooldown') this.onOp('noCooldown', cb.checked ? 1 : 0);
        this.onChange(this.state);
        cb.blur();
      });
      l.append(cb, label);
      el.appendChild(l);
    };
    toggle('colliders', '显示碰撞体');
    toggle('paths', '显示寻路路径 / 导航网格');
    toggle('clickPath', '点击地图寻路（A* 测试）');
    toggle('fast', '时间 ×4');
    toggle('noCooldown', '无冷却');
    const row = document.createElement('div');
    row.className = 'row';
    const btn = (label: string, op: DebugOp): void => {
      const b = document.createElement('button');
      b.textContent = label;
      b.addEventListener('click', () => {
        this.onOp(op);
        b.blur();
      });
      row.appendChild(b);
    };
    btn('刷新冷却', 'refreshCd');
    btn('升一级', 'levelUp');
    btn('升满级', 'maxLevel');
    btn('回满状态', 'heal');
    el.appendChild(row);
    this.stats = document.createElement('pre');
    el.appendChild(this.stats);
    parent.appendChild(el);
    this.el = el;
  }

  toggle(): void {
    this.visible = !this.visible;
    this.el.classList.toggle('show', this.visible);
  }

  setStats(text: string): void {
    if (this.visible) this.stats.textContent = text;
  }
}
