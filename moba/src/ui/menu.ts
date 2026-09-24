import { HERO_LIST, getHero } from '../data/heroes';
import { getItem } from '../data/items';
import { ROLE_NAMES } from '../data/schema';
import { SUMMONERS } from '../data/summoners';
import { HeroPreview } from '../render/heroPreview';
import { DIFFICULTY_NAMES, type Difficulty } from '../sim/ai/difficulty';
import { POSITION_NAMES, type Position } from '../sim/ai/roles';
import type { MatchSummary } from '../sim/summary';
import type { PlayerConfig } from '../sim/world';
import { canFullscreen, el, hex, toggleFullscreen } from './dom';
import { faceHtml, portrait } from './portrait';

/**
 * 局外界面：主菜单 → 选英雄（定位、技能说明、召唤师技能、难度）→ 加载 → 结算。
 * 都是覆盖整屏的 DOM，尺寸跟随 --ui 缩放，横屏手机和电脑共用一套布局。
 */

export interface MatchSetup {
  mode: 'match' | 'training';
  heroId: string;
  summoner: string;
  difficulty: Difficulty;
}

const SETUP_KEY = 'jinghe.setup';

/** 上次的选择（仅作本机便利，读写失败时用默认值） */
export function loadSetup(): MatchSetup {
  const def: MatchSetup = { mode: 'match', heroId: 'lifeng', summoner: 'blink', difficulty: 'normal' };
  try {
    const raw = JSON.parse(localStorage.getItem(SETUP_KEY) ?? 'null') as Partial<MatchSetup> | null;
    if (!raw) return def;
    return {
      mode: raw.mode === 'training' ? 'training' : 'match',
      heroId: HERO_LIST.some((h) => h.id === raw.heroId) ? raw.heroId! : def.heroId,
      summoner: raw.summoner && SUMMONERS[raw.summoner] ? raw.summoner : def.summoner,
      difficulty: raw.difficulty === 'easy' || raw.difficulty === 'hard' ? raw.difficulty : 'normal',
    };
  } catch {
    return def;
  }
}

function saveSetup(s: MatchSetup): void {
  try {
    localStorage.setItem(SETUP_KEY, JSON.stringify(s));
  } catch {
    // 隐私模式不可写，忽略
  }
}

const iconHtml = (glyph: string, color: number, cls = 'ico'): string =>
  `<b class="${cls}" style="background:radial-gradient(circle at 35% 30%, ${hex(color)}, #10141c 85%)">${glyph}</b>`;

const CRYSTAL_SVG = `<svg viewBox="0 0 100 160" class="crystal-art" aria-hidden="true">
  <defs>
    <linearGradient id="cg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bff4ff"/><stop offset=".5" stop-color="#49b8ff"/><stop offset="1" stop-color="#1b3f9a"/></linearGradient>
    <linearGradient id="cg2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd7a8"/><stop offset=".55" stop-color="#ff7a45"/><stop offset="1" stop-color="#8a1f18"/></linearGradient>
  </defs>
  <polygon points="50,4 86,62 50,156 14,62" fill="url(#cg1)"/>
  <polygon points="50,4 86,62 50,156" fill="url(#cg2)" opacity=".85"/>
  <polygon points="50,4 62,62 50,156 38,62" fill="#fff" opacity=".22"/>
  <polyline points="14,62 50,74 86,62" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.5"/>
</svg>`;

/** 操作说明（主菜单与局内共用的文字） */
export const HELP_HTML = `
  <h3>电脑</h3>
  <p>WASD 移动 · 鼠标瞄准 · 空格 普攻（自动优先英雄）· C 补刀 · Z 推塔</p>
  <p>Q / E / R 技能：按住显示指示器，松开释放；Esc 或右键取消 · Ctrl+Q/E/R 加点</p>
  <p>F 召唤师技能 · B 回城 · V 恢复 · P 商店 · 按住 Tab 战绩 · \` 调试面板</p>
  <h3>手机（横屏）</h3>
  <p>左下摇杆移动；右下普攻、补刀、推塔；按住技能拖动瞄准，松手释放，拖到“取消施法”取消；点按技能自动瞄准最近的敌方英雄</p>
  <p>左上小地图，右上设置里可以静音、全屏、退出对局；金币旁的推荐装备一键购买</p>`;

// ————————————————————————— 主菜单 —————————————————————————

export interface MainMenuHooks {
  onPlay: (mode: 'match' | 'training') => void;
  onToggleMute: () => boolean;
  isMuted: () => boolean;
  onClick: () => void;
}

export class MainMenu {
  readonly root: HTMLElement;

  constructor(parent: HTMLElement, hooks: MainMenuHooks) {
    const r = el('div', 'screen menu-main', parent);
    this.root = r;
    r.innerHTML = `
      <div class="rays"></div>
      <div class="brand">${CRYSTAL_SVG}<div><h1>晶核争锋</h1><p>原创 5V5 公平竞技</p></div></div>
      <div class="menu-buttons"></div>
      <div class="hero-strip"></div>
      <div class="menu-foot"></div>`;
    const btns = r.querySelector<HTMLElement>('.menu-buttons')!;
    const play = el('button', 'big-btn primary', btns);
    play.innerHTML = '<b>开始对战</b><small>5V5 人机 · 约 10~15 分钟</small>';
    play.addEventListener('click', () => {
      hooks.onClick();
      hooks.onPlay('match');
    });
    const train = el('button', 'big-btn', btns);
    train.innerHTML = '<b>训练场</b><small>木桩练技能 · 测伤害</small>';
    train.addEventListener('click', () => {
      hooks.onClick();
      hooks.onPlay('training');
    });
    const help = el('button', 'big-btn', btns);
    help.innerHTML = '<b>操作说明</b><small>电脑 / 手机</small>';
    const modal = el('div', 'modal', r);
    modal.innerHTML = `<div class="modal-box">${HELP_HTML}<button class="pill">知道了</button></div>`;
    help.addEventListener('click', () => {
      hooks.onClick();
      modal.classList.add('show');
    });
    modal.querySelector('button')!.addEventListener('click', () => modal.classList.remove('show'));

    const strip = r.querySelector<HTMLElement>('.hero-strip')!;
    for (const h of HERO_LIST) {
      const c = el('div', 'strip-hero', strip);
      c.innerHTML = `<img src="${portrait(h.id)}" alt=""><span>${h.name}</span>`;
    }

    const foot = r.querySelector<HTMLElement>('.menu-foot')!;
    const mute = el('button', 'pill', foot, hooks.isMuted() ? '🔇 音效：关' : '🔊 音效：开');
    mute.addEventListener('click', () => {
      const m = hooks.onToggleMute();
      mute.textContent = m ? '🔇 音效：关' : '🔊 音效：开';
    });
    if (canFullscreen()) {
      const fs = el('button', 'pill', foot, '⛶ 全屏');
      fs.addEventListener('click', () => void toggleFullscreen());
    }
    el('span', 'ver', foot, '所有角色、技能、装备与美术均为原创，程序绘制');
  }

  destroy(): void {
    this.root.remove();
  }
}

// ————————————————————————— 选英雄 —————————————————————————

export interface HeroSelectHooks {
  onStart: (s: MatchSetup) => void;
  onBack: () => void;
  onClick: () => void;
}

export class HeroSelect {
  readonly root: HTMLElement;
  private readonly preview = new HeroPreview();
  private setup: MatchSetup;
  private readonly cards = new Map<string, HTMLElement>();
  private readonly info: HTMLElement;
  private readonly nameplate: HTMLElement;
  private readonly sumBtns = new Map<string, HTMLElement>();
  private readonly sumDesc: HTMLElement;
  private readonly diffBtns = new Map<Difficulty, HTMLElement>();

  constructor(parent: HTMLElement, setup: MatchSetup, hooks: HeroSelectHooks) {
    this.setup = { ...setup };
    const r = el('div', 'screen menu-select', parent);
    this.root = r;
    const top = el('div', 'sel-top', r);
    const back = el('button', 'pill', top, '‹ 返回');
    back.addEventListener('click', () => {
      hooks.onClick();
      hooks.onBack();
    });
    el('h2', '', top, '选择英雄');
    el('span', 'mode-tag', top, setup.mode === 'match' ? '5V5 人机对战' : '训练场');

    // 左：英雄列表
    const grid = el('div', 'sel-grid', r);
    for (const h of HERO_LIST) {
      const c = el('button', 'hero-card', grid);
      c.innerHTML = `<img src="${portrait(h.id)}" alt=""><b>${h.name}</b><small>${ROLE_NAMES[h.role]}</small>`;
      c.addEventListener('click', () => {
        hooks.onClick();
        this.pickHero(h.id);
      });
      this.cards.set(h.id, c);
    }

    // 中：英雄展示
    const stage = el('div', 'sel-stage', r);
    const canvasBox = el('div', 'sel-canvas', stage);
    this.nameplate = el('div', 'nameplate', stage);
    void this.preview.init(canvasBox).then(() => this.preview.setHero(this.setup.heroId));

    // 右：技能说明
    this.info = el('div', 'sel-info', r);

    // 下：召唤师技能 + 难度 + 开始
    const bottom = el('div', 'sel-bottom', r);
    const sumBox = el('div', 'sum-box', bottom);
    el('span', 'lbl', sumBox, '召唤师技能');
    const sumRow = el('div', 'sum-row', sumBox);
    for (const s of Object.values(SUMMONERS)) {
      const b = el('button', 'sum-btn', sumRow);
      b.innerHTML = `${iconHtml(s.icon.glyph, s.icon.color)}<span>${s.name}</span>`;
      b.addEventListener('click', () => {
        hooks.onClick();
        this.setup.summoner = s.id;
        this.refresh();
      });
      this.sumBtns.set(s.id, b);
    }
    this.sumDesc = el('div', 'sum-desc', sumBox);
    if (setup.mode === 'match') {
      const dBox = el('div', 'diff-box', bottom);
      el('span', 'lbl', dBox, '敌方难度');
      const seg = el('div', 'seg', dBox);
      for (const d of ['easy', 'normal', 'hard'] as const) {
        const b = el('button', '', seg, DIFFICULTY_NAMES[d]);
        b.addEventListener('click', () => {
          hooks.onClick();
          this.setup.difficulty = d;
          this.refresh();
        });
        this.diffBtns.set(d, b);
      }
    }
    const go = el('button', 'go-btn', bottom, setup.mode === 'match' ? '开始对战' : '进入训练场');
    go.addEventListener('click', () => {
      hooks.onClick();
      saveSetup(this.setup);
      hooks.onStart({ ...this.setup });
    });
    this.pickHero(this.setup.heroId);
  }

  private pickHero(id: string): void {
    this.setup.heroId = id;
    this.preview.setHero(id);
    const h = getHero(id);
    const stars = '★'.repeat(h.difficulty) + '☆'.repeat(3 - h.difficulty);
    this.nameplate.innerHTML = `<b>${h.name}</b><span>${h.title}</span><small>${ROLE_NAMES[h.role]} · 操作难度 <i>${stars}</i></small>`;
    const skillRow = (glyph: string, color: number, name: string, tag: string, desc: string): string =>
      `<div class="skill-row">${iconHtml(glyph, color)}<div><b>${name}</b><em>${tag}</em><p>${desc}</p></div></div>`;
    const keys = ['技能 1', '技能 2', '大招'];
    this.info.innerHTML =
      `<p class="intro">${h.intro}</p>` +
      skillRow(h.passive.icon.glyph, h.passive.icon.color, h.passive.name, '被动', h.passive.desc) +
      h.skills
        .map((s, i) => {
          const cd = s.cooldown[0] ?? 0;
          const cost = s.cost[0] ?? 0;
          return skillRow(s.icon.glyph, s.icon.color, s.name, `${keys[i]} · 冷却 ${cd} 秒${cost ? ` · 法力 ${cost}` : ''}`, s.desc);
        })
        .join('');
    this.info.scrollTop = 0;
    this.refresh();
  }

  private refresh(): void {
    for (const [id, c] of this.cards) c.classList.toggle('on', id === this.setup.heroId);
    for (const [id, b] of this.sumBtns) b.classList.toggle('on', id === this.setup.summoner);
    for (const [d, b] of this.diffBtns) b.classList.toggle('on', d === this.setup.difficulty);
    const s = SUMMONERS[this.setup.summoner]!;
    this.sumDesc.textContent = `${s.name}：${s.desc}（冷却 ${s.cooldown} 秒）`;
  }

  destroy(): void {
    this.preview.destroy();
    this.root.remove();
  }
}

// ————————————————————————— 加载 —————————————————————————

/** 加载界面：双方 5 人的头像与名字（对标手游的对战加载页） */
export class LoadingScreen {
  readonly root: HTMLElement;

  constructor(parent: HTMLElement, players: readonly PlayerConfig[], selfPid: number, mode: 'match' | 'training', positions?: ReadonlyMap<number, Position>) {
    const r = el('div', 'screen menu-loading', parent);
    this.root = r;
    const row = (team: 0 | 1): string =>
      `<div class="load-row t${team}">${players
        .filter((p) => p.team === team)
        .map((p) => {
          const h = getHero(p.heroId);
          const pos = positions?.get(p.pid);
          const who = p.pid === selfPid ? '你' : 'AI';
          return `<div class="load-card${p.pid === selfPid ? ' me' : ''}"><img src="${portrait(p.heroId)}" alt=""><b>${h.name}</b><small>${pos ? `${POSITION_NAMES[pos]} · ${who}` : who}</small></div>`;
        })
        .join('')}</div>`;
    r.innerHTML =
      (mode === 'match' ? `${row(0)}<div class="vs">VS</div>${row(1)}` : `${row(0)}<div class="vs small">训练场</div>`) +
      `<div class="load-bar"><i></i></div><div class="load-tip">小提示：草丛能隐藏身形，在草丛里出手会暴露 1.2 秒</div>`;
  }

  destroy(): void {
    this.root.classList.add('out');
    window.setTimeout(() => this.root.remove(), 350);
  }
}

// ————————————————————————— 结算 —————————————————————————

export interface ResultHooks {
  onAgain: () => void;
  onHome: () => void;
  onClick: () => void;
}

export class ResultScreen {
  readonly root: HTMLElement;

  constructor(parent: HTMLElement, s: MatchSummary, selfPid: number, hooks: ResultHooks) {
    const me = s.players.find((p) => p.pid === selfPid);
    const win = me ? s.winner === me.team : s.winner === 0;
    const r = el('div', `screen menu-result ${win ? 'win' : 'lose'}`, parent);
    this.root = r;
    const t = Math.floor(s.duration);
    const mvp = s.players.find((p) => p.mvp === 'win');
    const maxDmg = Math.max(1, ...s.players.map((p) => p.damageDealt));
    const table = (team: 0 | 1): string => {
      const rows = s.players
        .filter((p) => p.team === team)
        .map((p) => {
          const h = getHero(p.heroId);
          const items = p.items.map((id) => {
            const it = getItem(id);
            return iconHtml(it.glyph, it.color, 'item');
          });
          const badge = p.mvp === 'win' ? '<i class="mvp">MVP</i>' : p.mvp === 'lose' ? '<i class="mvp lose">败方MVP</i>' : '';
          return `<tr class="${p.pid === selfPid ? 'me' : ''}">
            <td class="who"><div>${faceHtml(p.heroId, p.team)}<div><b>${h.name}</b><small>${p.pid === selfPid ? '你' : p.name} · Lv${p.level}</small></div></div></td>
            <td class="sc"><b>${p.score.toFixed(1)}</b>${badge}</td>
            <td class="kda">${p.kills}/${p.deaths}/${p.assists}<small>参团 ${Math.round(p.kp * 100)}%</small></td>
            <td class="dmg"><span>${p.damageDealt}</span><i style="width:${Math.round((p.damageDealt / maxDmg) * 100)}%"></i></td>
            <td>${p.damageTaken}</td>
            <td>${p.gold}</td>
            <td>${p.lastHits}</td>
            <td class="items"><div>${items.join('')}</div></td>
          </tr>`;
        })
        .join('');
      return `<table class="res-table t${team}">
        <thead><tr><th>${team === 0 ? '蓝方' : '红方'}${s.winner === team ? ' · 胜' : ''}</th><th>评分</th><th>K/D/A</th><th>输出</th><th>承伤</th><th>经济</th><th>补刀</th><th>装备</th></tr></thead>
        <tbody>${rows}</tbody></table>`;
    };
    const mvpCard = mvp
      ? `<div class="mvp-card"><img src="${portrait(mvp.heroId)}" alt=""><div><i class="mvp">MVP</i><b>${getHero(mvp.heroId).name}</b><small>${mvp.pid === selfPid ? '你' : mvp.name} · 评分 ${mvp.score.toFixed(1)} · ${mvp.kills}/${mvp.deaths}/${mvp.assists}</small></div></div>`
      : '';
    r.innerHTML = `
      <div class="res-head">
        <h1>${win ? '胜利' : '失败'}</h1>
        <div class="res-meta"><div><span class="b">${s.kills[0]}</span> : <span class="r">${s.kills[1]}</span></div><small>对局时长 ${Math.floor(t / 60)} 分 ${t % 60} 秒 · 推塔 ${s.towers[0]} : ${s.towers[1]}</small></div>
        ${mvpCard}
      </div>
      <div class="res-tables">${table(0)}${table(1)}</div>
      <div class="res-buttons"></div>`;
    const btns = r.querySelector<HTMLElement>('.res-buttons')!;
    const again = el('button', 'go-btn', btns, '再来一局');
    again.addEventListener('click', () => {
      hooks.onClick();
      hooks.onAgain();
    });
    const home = el('button', 'pill', btns, '返回主页');
    home.addEventListener('click', () => {
      hooks.onClick();
      hooks.onHome();
    });
  }

  destroy(): void {
    this.root.remove();
  }
}
