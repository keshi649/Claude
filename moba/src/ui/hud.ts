import { getHero } from '../data/heroes';
import { bindHoldButton, bindJoystick, bindSkillButton } from '../input/touch';
import type { InputState } from '../input/state';
import type { Unit } from '../sim/entity';
import { canLevelSkill, currentStage, skillDef } from '../sim/hero';
import type { World } from '../sim/world';

const hex = (c: number): string => `#${c.toString(16).padStart(6, '0')}`;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, parent?: HTMLElement, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  parent?.appendChild(e);
  return e;
}

interface SkillUi {
  root: HTMLElement;
  ring: HTMLElement;
  glyph: HTMLElement;
  cd: HTMLElement;
  cdText: HTMLElement;
  pips: HTMLElement[];
  plus: HTMLElement;
  key: string;
}

export interface HudHooks {
  onAttack: (attack: boolean, farm: boolean) => void;
  onToggleDebug: () => void;
}

/**
 * 局内界面（DOM）：自身状态、对局时间、技能按钮（冷却转圈 + 剩余秒数、法力不足置灰、加点）、
 * 普攻 / 补刀键、摇杆、取消区、全屏按钮、提示条。
 * 只在数值变化时写 DOM，避免每帧大量重排。
 */
export class Hud {
  readonly root: HTMLElement;
  private skills: SkillUi[] = [];
  private clock: HTMLElement;
  private fps: HTMLElement;
  private hpFill: HTMLElement;
  private hpText: HTMLElement;
  private mpFill: HTMLElement;
  private mpText: HTMLElement;
  private lv: HTMLElement;
  private toastEl: HTMLElement;
  private toastTimer = 0;
  private cache = new Map<string, string>();
  readonly cancelZone: HTMLElement;
  readonly debugBtn: HTMLButtonElement;
  private attackHeld = false;
  private farmHeld = false;

  constructor(parent: HTMLElement, hero: Unit, state: InputState, hooks: HudHooks) {
    const def = getHero(hero.defId);
    const root = el('div', '', parent);
    root.id = 'hud';
    this.root = root;

    // 顶栏
    const top = el('div', 'topbar', root);
    this.clock = el('span', 'clock', top, '00:00');
    this.fps = el('span', 'fps', top, '');

    const corner = el('div', 'corner-buttons', root);
    this.debugBtn = el('button', 'icon-btn', corner, '调');
    this.debugBtn.title = '调试面板（`）';
    this.debugBtn.addEventListener('click', () => hooks.onToggleDebug());
    const canFull = !!document.documentElement.requestFullscreen;
    if (canFull) {
      const fs = el('button', 'icon-btn', corner, '⛶');
      fs.title = '全屏';
      fs.addEventListener('click', () => void toggleFullscreen());
    }

    // 自身状态
    const sp = el('div', 'self-panel', root);
    const portrait = el('div', 'portrait', sp, def.name[0]);
    portrait.style.background = hex(def.palette.primary);
    this.lv = el('div', 'lv', portrait, '1');
    const bars = el('div', 'bars', sp);
    el('div', 'name', bars, `${def.name} · ${def.title}`);
    const hp = el('div', 'bar hp', bars);
    this.hpFill = el('div', 'fill', hp);
    this.hpText = el('span', '', hp);
    const mp = el('div', 'bar mp', bars);
    this.mpFill = el('div', 'fill', mp);
    this.mpText = el('span', '', mp);

    // 摇杆
    const joy = el('div', 'joy-zone', root);
    const base = el('div', 'joy-base', joy);
    const knob = el('div', 'joy-knob', joy);
    bindJoystick(joy, base, knob, state);

    // 操作区
    const actions = el('div', 'actions', root);
    const atk = el('button', 'abtn atk', actions, '攻击');
    el('span', 'key', atk, '空格');
    const farm = el('button', 'abtn farm', actions, '补刀');
    el('span', 'key', farm, 'C');
    bindHoldButton(atk, (h) => {
      this.attackHeld = h;
      hooks.onAttack(this.attackHeld, this.farmHeld);
    });
    bindHoldButton(farm, (h) => {
      this.farmHeld = h;
      hooks.onAttack(this.attackHeld, this.farmHeld);
    });

    this.cancelZone = el('div', 'cancel-zone', root, '取消');
    const keys = ['Q', 'E', 'R'];
    for (const slot of [0, 1, 2] as const) {
      const sd = def.skills[slot];
      const b = el('button', `abtn skill s${slot}`, actions);
      const ring = el('div', 'ring', b);
      const glyph = el('span', 'glyph', b, sd.icon.glyph);
      const cd = el('div', 'cd', b);
      const cdText = el('div', 'cdtext', b);
      const pipsEl = el('div', 'pips', b);
      const pips: HTMLElement[] = [];
      for (let i = 0; i < sd.maxLevel; i++) pips.push(el('i', '', pipsEl));
      el('span', 'key', b, keys[slot]);
      const plus = el('div', 'plus', b, '+');
      plus.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        state.actions.push({ k: 'levelSkill', slot });
      });
      bindSkillButton(b, slot, state, this.cancelZone);
      this.skills.push({ root: b, ring, glyph, cd, cdText, pips, plus, key: keys[slot]! });
    }

    this.toastEl = el('div', 'toast', root);
    const help = el('div', 'help', root);
    help.innerHTML =
      'WASD 移动 · 空格 普攻 · C 补刀<br>Q/E/R 按住瞄准、松开释放（Esc/右键取消）<br>Ctrl+Q/E/R 加点 · ` 调试面板';
    el('div', 'rotate-hint', root, '请把手机横过来游玩 ↻');
  }

  toast(msg: string): void {
    this.toastEl.textContent = msg;
    this.toastEl.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.toastEl.classList.remove('show'), 900);
  }

  private set(key: string, value: string, apply: () => void): void {
    if (this.cache.get(key) === value) return;
    this.cache.set(key, value);
    apply();
  }

  update(w: World, hero: Unit, fps: number): void {
    const t = Math.floor(w.time);
    const clock = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
    this.set('clock', clock, () => (this.clock.textContent = clock));
    const f = String(Math.round(fps));
    this.set('fps', f, () => (this.fps.textContent = `${f} FPS`));

    const h = hero.hero!;
    const hpPct = `${((hero.hp / hero.stats.maxHp) * 100).toFixed(1)}%`;
    this.set('hp', hpPct, () => (this.hpFill.style.width = hpPct));
    const hpT = `${Math.ceil(hero.hp)} / ${Math.round(hero.stats.maxHp)}`;
    this.set('hpT', hpT, () => (this.hpText.textContent = hpT));
    const mpPct = `${((hero.mp / Math.max(1, hero.stats.maxMp)) * 100).toFixed(1)}%`;
    this.set('mp', mpPct, () => (this.mpFill.style.width = mpPct));
    const mpT = `${Math.floor(hero.mp)} / ${Math.round(hero.stats.maxMp)}`;
    this.set('mpT', mpT, () => (this.mpText.textContent = mpT));
    this.set('lv', String(h.level), () => (this.lv.textContent = String(h.level)));

    for (const slot of [0, 1, 2] as const) {
      const ui = this.skills[slot]!;
      const def = skillDef(hero, slot);
      const { stage, idx } = currentStage(hero, slot);
      const lvl = h.skillLevels[slot];
      const rc = h.recast[slot];
      const cd = h.cooldowns[slot];
      const total = Math.max(0.01, h.cooldownTotals[slot]);
      const cost = def.cost[Math.max(0, Math.min(lvl - 1, def.cost.length - 1))] ?? 0;
      const icon = stage.icon ?? def.icon;

      this.set(`g${slot}`, icon.glyph + icon.color, () => {
        ui.glyph.textContent = icon.glyph;
        ui.ring.style.background = `radial-gradient(circle at 40% 35%, ${hex(icon.color)}, #1a1a1a 85%)`;
      });
      // 冷却转圈：用 conic-gradient 画出剩余比例
      const ratio = cd > 0 && !rc ? cd / total : 0;
      const cdKey = ratio > 0 ? ratio.toFixed(3) : '0';
      this.set(`cd${slot}`, cdKey, () => {
        ui.cd.style.background = ratio > 0 ? `conic-gradient(rgba(0,0,0,.72) ${ratio * 360}deg, rgba(0,0,0,.15) 0)` : 'none';
      });
      const cdTxt = ratio > 0 ? (cd >= 1 ? String(Math.ceil(cd)) : cd.toFixed(1)) : rc ? rc.remaining.toFixed(1) : '';
      this.set(`ct${slot}`, cdTxt, () => (ui.cdText.textContent = cdTxt));
      const noMana = lvl > 0 && !rc && hero.mp < cost;
      this.set(`nm${slot}`, String(noMana), () => ui.root.classList.toggle('nomana', noMana));
      this.set(`lk${slot}`, String(lvl === 0), () => ui.root.classList.toggle('locked', lvl === 0));
      this.set(`rc${slot}`, String(idx >= 0), () => ui.root.classList.toggle('recast', idx >= 0));
      this.set(`pp${slot}`, String(lvl), () => ui.pips.forEach((p, i) => p.classList.toggle('on', i < lvl)));
      const can = canLevelSkill(hero, slot);
      this.set(`pl${slot}`, String(can), () => ui.plus.classList.toggle('show', can));
    }
  }

  destroy(): void {
    this.root.remove();
  }
}

async function toggleFullscreen(): Promise<void> {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    const o = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
    await o.lock?.('landscape').catch(() => undefined);
  } catch {
    // 浏览器不支持时静默忽略
  }
}
