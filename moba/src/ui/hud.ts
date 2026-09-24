import { getHero } from '../data/heroes';
import { getSummoner, RESTORE } from '../data/summoners';
import { getBuff } from '../data/units';
import { settings } from '../game/settings';
import { applyUiScale, canFullscreen, el, hex, toggleFullscreen } from './dom';
import { faceHtml } from './portrait';
import { bindHoldButton, bindJoystick, bindSkillButton, bindTapButton } from '../input/touch';
import type { InputState, SlotId } from '../input/state';
import type { Unit } from '../sim/entity';
import { canLevelSkill, currentStage, skillDef } from '../sim/hero';
import type { World } from '../sim/world';
import { Minimap } from './minimap';


/** 按钮上的矢量图标（内联 SVG，程序绘制） */
const ICONS = {
  attack:
    '<svg viewBox="0 0 64 64"><path d="M50 6 L58 6 L58 14 L28 44 L20 36 Z" fill="#f2f4f8"/><path d="M52 8 L56 8 L56 12 L28 40 L24 36 Z" fill="#b8c4d0"/><path d="M14 34 L30 50 L26 54 L10 38 Z" fill="#e0b050"/><path d="M18 46 L8 56 L12 60 L22 50 Z" fill="#7a5230"/></svg>',
  farm:
    '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="18" fill="#e8c048" stroke="#8a6a18" stroke-width="4"/><text x="32" y="41" text-anchor="middle" font-size="24" font-weight="900" fill="#6a4a08">刀</text></svg>',
  tower:
    '<svg viewBox="0 0 64 64"><path d="M20 58 L44 58 L40 22 L24 22 Z" fill="#c8ccd4"/><path d="M18 22 L46 22 L46 14 L40 14 L40 18 L35 18 L35 14 L29 14 L29 18 L24 18 L24 14 L18 14 Z" fill="#e8ecf2"/><path d="M32 2 L38 10 L32 16 L26 10 Z" fill="#5cc4ff"/></svg>',
  recall:
    '<svg viewBox="0 0 64 64"><path d="M32 8 L56 30 L48 30 L48 56 L16 56 L16 30 L8 30 Z" fill="#9fd8ff"/><rect x="27" y="38" width="10" height="18" fill="#2a3a50"/></svg>',
  restore:
    '<svg viewBox="0 0 64 64"><path d="M32 56 C10 40 6 28 12 18 C18 8 30 10 32 20 C34 10 46 8 52 18 C58 28 54 40 32 56 Z" fill="#6dff7a"/><path d="M29 22 h6 v8 h8 v6 h-8 v8 h-6 v-8 h-8 v-6 h8 Z" fill="#fff"/></svg>',
};

interface SkillUi {
  root: HTMLElement;
  ring: HTMLElement;
  glyph: HTMLElement;
  cd: HTMLElement;
  cdText: HTMLElement;
  pips: HTMLElement[];
  plus: HTMLElement | null;
}

export interface HudHooks {
  onAttack: (attack: boolean, farm: boolean, tower: boolean) => void;
  onShop: () => void;
  onScoreboard: () => void;
  onQuickBuy: () => void;
  onToggleDebug: () => void;
  onToggleMute: () => boolean;
  isMuted: () => boolean;
  onQuit: () => void;
  onSignal: (kind: 'attack' | 'retreat' | 'gather') => void;
  onSettings: () => void;
}

/**
 * 局内界面（DOM），布局对标主流 MOBA 手游：
 *   左上：小地图　　右上：比分 / KDA / 时间 / 设置
 *   左下：摇杆　　　右下：普攻大按钮，三个技能环绕，补刀 / 推塔小按钮，回城 / 恢复 / 召唤师技能一排
 * 技能按下出现轮盘，拖动瞄准，拖到“取消施法”松手取消。只在数值变化时写 DOM。
 */
export class Hud {
  readonly root: HTMLElement;
  readonly minimap: Minimap;
  private skills: SkillUi[] = [];
  private summonerUi: SkillUi;
  private restoreUi: SkillUi;
  private recallBtn: HTMLElement;
  private clock: HTMLElement;
  private fps: HTMLElement;
  private kda: HTMLElement;
  private score: HTMLElement;
  private toastEl: HTMLElement;
  private toastTimer = 0;
  private cache = new Map<string, string>();
  readonly cancelZone: HTMLElement;
  private held = { attack: false, farm: false, tower: false };
  private goldEl!: HTMLElement;
  private quickBuy!: HTMLElement;
  private goldText!: HTMLElement;
  private feed!: HTMLElement;
  private deathEl!: HTMLElement;
  private deathText!: HTMLElement;
  private deathWho!: HTMLElement;
  private buffBar!: HTMLElement;
  private chatEl!: HTMLElement;
  /** 销毁时要解除的全局监听 */
  private offs: (() => void)[] = [];

  constructor(parent: HTMLElement, w: World, hero: Unit, state: InputState, hooks: HudHooks) {
    const def = getHero(hero.defId);
    const root = el('div', '', parent);
    root.id = 'hud';
    this.root = root;
    applyUiScale();
    window.addEventListener('resize', applyUiScale);
    this.offs.push(() => window.removeEventListener('resize', applyUiScale));

    // 左上：小地图
    this.minimap = new Minimap(root, w.map);

    // 右上：战况条 + 设置
    const bar = el('div', 'scorebar', root);
    this.score = el('span', 'score', bar);
    this.score.innerHTML = '<span class="b">0</span> : <span class="r">0</span>';
    this.kda = el('span', 'kda', bar, '0/0/0');
    this.clock = el('span', 'clock', bar, '00:00');
    this.fps = el('span', 'fps', bar, '');
    const gear = el('button', '', bar, '⚙');
    const settings = el('div', 'settings', root);
    gear.addEventListener('click', () => settings.classList.toggle('show'));
    const muteBtn = el('button', '', settings, hooks.isMuted() ? '🔇 音效：关' : '🔊 音效：开');
    muteBtn.addEventListener('click', () => {
      const m = hooks.onToggleMute();
      muteBtn.textContent = m ? '🔇 音效：关' : '🔊 音效：开';
    });
    if (canFullscreen()) {
      const fs = el('button', '', settings, '⛶ 全屏');
      fs.addEventListener('click', () => void toggleFullscreen());
    }
    const more = el('button', '', settings, '⚙ 设置（语音 / 画质 / 镜头）');
    more.addEventListener('click', () => {
      settings.classList.remove('show');
      hooks.onSettings();
    });
    const dbg = el('button', '', settings, '🛠 调试面板（`）');
    dbg.addEventListener('click', () => hooks.onToggleDebug());
    const quit = el('button', '', settings, '🏳 退出对局');
    quit.addEventListener('click', () => {
      if (confirm('确定退出对局，返回主页？')) hooks.onQuit();
    });
    const help = el('div', 'help-text', settings);
    help.innerHTML =
      '手机：左下摇杆移动；按住技能拖动瞄准，松手释放，拖到“取消施法”取消；点按技能自动瞄准最近的敌方英雄。<br>' +
      '电脑：WASD 移动，空格普攻，C 补刀，Z 推塔，Q/E/R 技能，F 召唤师技能，B 回城，V 恢复，Ctrl+Q/E/R 加点。';

    // 左下：摇杆
    const joy = el('div', 'joy-zone', root);
    const base = el('div', 'joy-base', joy);
    const knob = el('div', 'joy-knob', joy);
    this.offs.push(bindJoystick(joy, base, knob, state));

    // 技能轮盘元素
    const wheel = { ring: el('div', 'wheel-ring', root), knob: el('div', 'wheel-knob', root) };
    this.cancelZone = el('div', 'cancel-zone', root, '取消\n施法');
    this.cancelZone.style.whiteSpace = 'pre';

    // 右下：操作区
    const actions = el('div', 'actions', root);
    const atk = el('button', 'abtn atk', actions);
    atk.innerHTML = ICONS.attack;
    el('span', 'key', atk, '空格');
    const farm = el('button', 'abtn small farm', actions);
    farm.innerHTML = ICONS.farm;
    el('span', 'key', farm, 'C');
    const tower = el('button', 'abtn small tower', actions);
    tower.innerHTML = ICONS.tower;
    el('span', 'key', tower, 'Z');
    const emit = (): void => hooks.onAttack(this.held.attack, this.held.farm, this.held.tower);
    bindHoldButton(atk, (h) => ((this.held.attack = h), emit()));
    bindHoldButton(farm, (h) => ((this.held.farm = h), emit()));
    bindHoldButton(tower, (h) => ((this.held.tower = h), emit()));

    const keys = ['Q', 'E', 'R'];
    for (const slot of [0, 1, 2] as const) {
      const sd = def.skills[slot];
      const ui = this.makeSkillButton(actions, `abtn skill s${slot}`, sd.icon.glyph, keys[slot]!, sd.maxLevel);
      const plus = el('div', 'plus', ui.root, '+');
      plus.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        state.actions.push({ k: 'levelSkill', slot });
      });
      ui.plus = plus;
      bindSkillButton(ui.root, slot as SlotId, state, this.cancelZone, wheel);
      this.skills.push(ui);
    }

    const sum = getSummoner(hero.hero!.summoner.id);
    this.summonerUi = this.makeSkillButton(actions, 'abtn util summoner', sum.icon.glyph, 'F', 0);
    this.summonerUi.ring.style.background = `radial-gradient(circle at 40% 35%, ${hex(sum.icon.color)}, #10202e 80%)`;
    bindSkillButton(this.summonerUi.root, 3, state, this.cancelZone, wheel);

    this.restoreUi = this.makeSkillButton(actions, 'abtn util restore', '', 'V', 0);
    this.restoreUi.glyph.innerHTML = ICONS.restore;
    bindTapButton(this.restoreUi.root, () => state.actions.push({ k: 'restore' }));

    this.recallBtn = el('button', 'abtn util recall', actions);
    this.recallBtn.innerHTML = ICONS.recall;
    el('span', 'key', this.recallBtn, 'B');
    bindTapButton(this.recallBtn, () => state.actions.push({ k: 'recall' }));

    // 左侧中部：金币（商店在 M3 接入）
    this.goldEl = el('button', 'gold-badge', root);
    this.goldEl.innerHTML = '<i></i><span>0</span><em>商店</em>';
    this.goldText = this.goldEl.querySelector('span')!;
    this.goldEl.addEventListener('click', () => hooks.onShop());
    // 推荐购买：金币足够时出现，一键买下推荐出装的下一件
    this.quickBuy = el('button', 'quick-buy', root);
    this.quickBuy.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      hooks.onQuickBuy();
    });
    bar.addEventListener('click', (e) => {
      if (e.target === gear) return;
      hooks.onScoreboard();
    });
    // 小地图右侧：信号按钮（进攻 / 撤退 / 集合）
    const sig = el('div', 'signals', root);
    for (const [kind, label, cls] of [
      ['attack', '进攻', 'atk'],
      ['retreat', '撤退', 'ret'],
      ['gather', '集合', 'gat'],
    ] as const) {
      const b = el('button', `sig ${cls}`, sig, label);
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        hooks.onSignal(kind);
      });
    }
    // 左侧：队伍聊天 / 信号记录
    this.chatEl = el('div', 'chat', root);
    // 右上：身上的增益 / 减益（图标 + 剩余秒数），以及草丛隐身提示
    this.buffBar = el('div', 'buffbar', root);
    // 击杀信息
    this.feed = el('div', 'killfeed', root);
    // 死亡遮罩
    this.deathEl = el('div', 'death', root);
    const deathBox = el('div', 'death-box', this.deathEl);
    this.deathWho = el('div', 'death-who', deathBox);
    this.deathText = el('div', 'death-text', deathBox);
    el('div', 'death-tip', deathBox, '阵亡期间也可以打开商店购买装备');

    this.toastEl = el('div', 'toast', root);
    const h = el('div', 'help', root);
    h.innerHTML = 'WASD 移动 · 空格 普攻 · C 补刀 · Z 推塔<br>Q/E/R 技能 · F 召唤师技能（按住瞄准，松开释放，Esc 取消）<br>B 回城 · V 恢复 · Ctrl+Q/E/R 加点 · ` 调试';
    el('div', 'rotate-hint', root, '请把手机横过来游玩 ↻');
  }

  private makeSkillButton(parent: HTMLElement, cls: string, glyph: string, key: string, maxLevel: number): SkillUi {
    const b = el('button', cls, parent);
    const ring = el('div', 'ring', b);
    const g = el('span', 'glyph', b, glyph);
    const cd = el('div', 'cd', b);
    const cdText = el('div', 'cdtext', b);
    const pips: HTMLElement[] = [];
    if (maxLevel > 0) {
      const pipsEl = el('div', 'pips', b);
      for (let i = 0; i < maxLevel; i++) pips.push(el('i', '', pipsEl));
    }
    el('span', 'key', b, key);
    return { root: b, ring, glyph: g, cd, cdText, pips, plus: null };
  }

  toast(msg: string): void {
    this.toastEl.textContent = msg;
    this.toastEl.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.toastEl.classList.remove('show'), 900);
  }

  /** 击杀信息：击杀者头像 → 被击杀者头像 */
  pushKill(w: World, killerId: number, victimId: number, selfTeam: number): void {
    const k = w.get(killerId);
    const v = w.get(victimId);
    if (!v) return;
    const row = el('div', `kf ${v.team === selfTeam ? 'bad' : 'good'}`, this.feed);
    const face = (u: typeof k): string => {
      if (!u) return '<b class="face" style="background:#555">塔</b>';
      if (u.kind !== 'hero') return `<b class="face" style="background:#555">${u.kind === 'tower' || u.kind === 'crystal' ? '塔' : '兵'}</b>`;
      return faceHtml(u.defId, u.team);
    };
    row.innerHTML = `${face(k)}<em>⚔</em>${face(v)}`;
    setTimeout(() => row.remove(), 5000);
    while (this.feed.children.length > 4) this.feed.firstElementChild?.remove();
  }

  /** 队伍聊天：最多 4 条，6 秒后淡出 */
  chat(who: string, text: string, color: string): void {
    const row = el('div', 'chat-row', this.chatEl);
    row.innerHTML = `<b style="color:${color}">${who}</b>：${text}`;
    window.setTimeout(() => row.classList.add('out'), 6000);
    window.setTimeout(() => row.remove(), 6600);
    while (this.chatEl.children.length > 4) this.chatEl.firstElementChild?.remove();
  }

  /** 增益栏：只在内容变化时重建 */
  private updateBuffs(w: World, hero: Unit): void {
    const items: { glyph: string; color: number; left: number; bad: boolean; name: string }[] = [];
    const hidden = hero.alive && hero.bush > 0;
    for (const b of hero.buffs) {
      const d = getBuff(b.id);
      if (d.kind === 'mark' || b.remaining > 900) continue;
      items.push({ glyph: d.name[0]!, color: d.aura ?? 0x8899aa, left: b.remaining, bad: d.kind === 'debuff', name: d.name + (b.stacks > 1 ? `×${b.stacks}` : '') });
    }
    const revealed = hidden && w.time <= hero.revealUntil;
    const key = `${hidden ? (revealed ? 'r' : 'h') : ''}|` + items.map((i) => `${i.name}:${Math.ceil(i.left)}`).join(',');
    this.set('buffs', key, () => {
      const chip = hidden ? `<span class="bush-chip${revealed ? ' revealed' : ''}">${revealed ? '草丛中 · 已暴露' : '草丛中 · 敌人看不见你'}</span>` : '';
      this.buffBar.innerHTML =
        chip +
        items
          .slice(0, 8)
          .map(
            (i) =>
              `<span class="bf${i.bad ? ' bad' : ''}" title="${i.name}"><b style="background:radial-gradient(circle at 35% 30%, ${hex(i.color)}, #10141c 85%)">${i.glyph}</b><small>${Math.ceil(i.left)}</small></span>`,
          )
          .join('');
    });
  }

  /** 阵亡信息：被谁击败、谁参与了助攻 */
  setDeathInfo(w: World, killerId: number, assists: readonly number[]): void {
    const k = w.get(killerId);
    const kFace = k?.hero ? faceHtml(k.defId, k.team, 'face big') : `<b class="face big neutral">${k?.kind === 'tower' || k?.kind === 'crystal' ? '塔' : k?.kind === 'monster' ? '怪' : '兵'}</b>`;
    const kName = k?.hero ? getHero(k.defId).name : k?.kind === 'tower' || k?.kind === 'crystal' ? '防御塔' : k?.kind === 'monster' ? '野怪' : '小兵';
    const as = assists
      .map((id) => w.get(id))
      .filter((u): u is Unit => !!u?.hero)
      .map((u) => faceHtml(u.defId, u.team))
      .join('');
    this.deathWho.innerHTML = `${kFace}<div><small>你被</small><b>${kName}</b><small>击败了</small>${as ? `<div class="assists"><small>助攻</small>${as}</div>` : ''}</div>`;
  }

  /** 对局结束：全屏“胜利 / 失败”，点击或数秒后进入结算 */
  showEnd(win: boolean, onContinue: () => void): void {
    const o = el('div', `result ${win ? 'win' : 'lose'}`, this.root);
    el('div', 'title', o, win ? '胜利' : '失败');
    el('div', 'lines', o, win ? '敌方水晶已被摧毁' : '我方水晶已被摧毁');
    el('div', 'hint', o, '点击继续');
    let done = false;
    const go = (): void => {
      if (done) return;
      done = true;
      onContinue();
    };
    o.addEventListener('pointerdown', go);
    window.setTimeout(go, 4500);
  }

  private set(key: string, value: string, apply: () => void): void {
    if (this.cache.get(key) === value) return;
    this.cache.set(key, value);
    apply();
  }

  private setCooldown(key: string, ui: SkillUi, cd: number, total: number): void {
    const ratio = cd > 0 ? Math.min(1, cd / Math.max(0.01, total)) : 0;
    this.set(`cd${key}`, ratio > 0 ? ratio.toFixed(3) : '0', () => {
      ui.cd.style.background = ratio > 0 ? `conic-gradient(rgba(0,0,0,.74) ${ratio * 360}deg, rgba(0,0,0,.2) 0)` : 'none';
    });
    const txt = ratio > 0 ? (cd >= 1 ? String(Math.ceil(cd)) : cd.toFixed(1)) : '';
    this.set(`ct${key}`, txt, () => (ui.cdText.textContent = txt));
  }

  private dpsEl: HTMLElement | null = null;
  /** 训练场伤害统计 */
  setDps(text: string, onReset: () => void): void {
    if (!this.dpsEl) {
      this.dpsEl = el('div', 'dps', this.root);
      this.dpsEl.innerHTML = '<span></span><button>重置</button>';
      this.dpsEl.querySelector('button')!.addEventListener('click', onReset);
    }
    this.set('dps', text, () => (this.dpsEl!.querySelector('span')!.textContent = text));
  }

  /** 推荐购买按钮：传入下一件推荐装备（null 表示隐藏） */
  setQuickBuy(item: { id: string; name: string; glyph: string; color: number; price: number } | null): void {
    const key = item ? `${item.id}|${item.price}` : '';
    this.set('qb', key, () => {
      this.quickBuy.classList.toggle('show', !!item);
      if (item) {
        this.quickBuy.innerHTML = `<b style="background:radial-gradient(circle at 35% 30%, ${hex(item.color)}, #151a22 85%)">${item.glyph}</b><span>${item.name}</span><small>${item.price}</small>`;
      }
    });
  }

  update(w: World, hero: Unit, fps: number): void {
    const t = Math.floor(w.time);
    const clock = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
    this.set('clock', clock, () => (this.clock.textContent = clock));
    const f = settings.showFps ? String(Math.round(fps)) : '';
    this.set('fps', f, () => (this.fps.textContent = f ? `${f}FPS` : ''));
    const h = hero.hero!;
    const kda = `${h.kills}/${h.deaths}/${h.assists}`;
    this.set('kda', kda, () => (this.kda.textContent = kda));
    let bk = 0;
    let rk = 0;
    for (const u of w.list) if (u.hero) (u.team === 0 ? (bk += u.hero.kills) : (rk += u.hero.kills));
    this.set('score', `${bk}:${rk}`, () => (this.score.innerHTML = `<span class="b">${bk}</span> : <span class="r">${rk}</span>`));

    for (const slot of [0, 1, 2] as const) {
      const ui = this.skills[slot]!;
      const def = skillDef(hero, slot);
      const { stage, idx } = currentStage(hero, slot);
      const lvl = h.skillLevels[slot];
      const rc = h.recast[slot];
      const cost = def.cost[Math.max(0, Math.min(lvl - 1, def.cost.length - 1))] ?? 0;
      const icon = stage.icon ?? def.icon;
      this.set(`g${slot}`, icon.glyph + icon.color, () => {
        ui.glyph.textContent = icon.glyph;
        ui.ring.style.background = `radial-gradient(circle at 40% 30%, ${hex(icon.color)}, #1a1410 88%)`;
      });
      if (rc) {
        this.setCooldown(String(slot), ui, 0, 1);
        const txt = rc.remaining.toFixed(1);
        this.set(`ct${slot}`, txt, () => (ui.cdText.textContent = txt));
      } else this.setCooldown(String(slot), ui, h.cooldowns[slot], h.cooldownTotals[slot]);
      const noMana = lvl > 0 && !rc && hero.mp < cost;
      this.set(`nm${slot}`, String(noMana), () => ui.root.classList.toggle('nomana', noMana));
      this.set(`lk${slot}`, String(lvl === 0), () => ui.root.classList.toggle('locked', lvl === 0));
      this.set(`rc${slot}`, String(idx >= 0), () => ui.root.classList.toggle('recast', idx >= 0));
      this.set(`pp${slot}`, String(lvl), () => ui.pips.forEach((p, i) => p.classList.toggle('on', i < lvl)));
      const can = canLevelSkill(hero, slot);
      this.set(`pl${slot}`, String(can), () => ui.plus?.classList.toggle('show', can));
    }
    const sum = getSummoner(h.summoner.id);
    this.setCooldown('sum', this.summonerUi, h.summoner.cd, sum.cooldown);
    this.setCooldown('res', this.restoreUi, h.restoreCd, RESTORE.cooldown);
    const gold = String(Math.floor(h.gold));
    this.set('gold', gold, () => (this.goldText.textContent = gold));
    // 对局结束后不再显示阵亡界面（镜头要去看水晶爆炸）
    const dead = !hero.alive && h.respawnAt > 0 && w.winner === null;
    this.set('dead', String(dead), () => {
      this.deathEl.classList.toggle('show', dead);
      document.getElementById('game')?.classList.toggle('dead', dead);
    });
    if (dead) {
      const left = String(Math.max(0, Math.ceil(h.respawnAt - w.time)));
      this.set('respawn', left, () => (this.deathText.textContent = `${left} 秒后复活`));
    }
    this.updateBuffs(w, hero);
    const recalling = h.recall > 0;
    this.set('recall', String(recalling), () => this.recallBtn.classList.toggle('active', recalling));
  }

  destroy(): void {
    for (const f of this.offs) f();
    this.root.remove();
  }
}
