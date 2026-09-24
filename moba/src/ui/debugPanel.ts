import type { DebugOp } from '../sim/commands';
import { HERO_LIST } from '../data/heroes';
import { ROLE_NAMES } from '../data/schema';

export interface DebugState {
  colliders: boolean;
  paths: boolean;
  /** 点地图 → 用 A* 寻路移动过去 */
  clickPath: boolean;
  fast: boolean;
  noCooldown: boolean;
  vision: boolean;
  aiDecisions: boolean;
}

/**
 * 调试面板（` 键或右上角“调”按钮开关）：
 * 显示碰撞体 / 寻路路径、点击寻路测试、时间 ×4、无冷却、刷新冷却、升级、回满状态，以及性能统计。
 */
export class DebugPanel {
  readonly el: HTMLElement;
  readonly state: DebugState = { colliders: false, paths: false, clickPath: false, fast: false, noCooldown: false, vision: false, aiDecisions: false };
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
    toggle('vision', '显示视野范围');
    toggle('aiDecisions', '显示 AI 当前决策');
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
    const gold = document.createElement('button');
    gold.textContent = '金币 +2000';
    gold.addEventListener('click', () => this.onOp('addGold', 2000));
    row.appendChild(gold);
    el.appendChild(row);

    // 木桩防御（训练场）
    const row2 = document.createElement('div');
    row2.className = 'row';
    row2.append('木桩双抗：');
    for (const v of [0, 100, 300, 600]) {
      const b = document.createElement('button');
      b.textContent = String(v);
      b.addEventListener('click', () => this.onOp('dummyArmor', v));
      row2.appendChild(b);
    }
    el.appendChild(row2);

    // 切换英雄 / 模式（重新载入页面）
    const row3 = document.createElement('div');
    row3.className = 'row';
    const sel = document.createElement('select');
    for (const h of HERO_LIST) {
      const o = document.createElement('option');
      o.value = h.id;
      o.textContent = `${h.name}（${ROLE_NAMES[h.role]}）`;
      sel.appendChild(o);
    }
    const params = new URLSearchParams(location.search);
    sel.value = params.get('hero') ?? 'lifeng';
    const go = (mode: string): void => {
      params.set('hero', sel.value);
      params.set('mode', mode);
      location.search = params.toString();
    };
    const t = document.createElement('button');
    t.textContent = '训练场';
    t.addEventListener('click', () => go('training'));
    const m = document.createElement('button');
    m.textContent = '单人对局';
    m.addEventListener('click', () => go('match'));
    row3.append(sel, t, m);
    el.appendChild(row3);
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
