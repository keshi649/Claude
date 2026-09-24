import { getHero } from '../data/heroes';
import { getItem } from '../data/items';
import { ROLE_NAMES } from '../data/schema';
import type { World } from '../sim/world';
import { itemIcon } from './shop';

const hex = (c: number): string => `#${c.toString(16).padStart(6, '0')}`;

/** 战绩面板（电脑按住 Tab，手机点右上角比分）：双方英雄的等级、KDA、补刀、金币、装备 */
export class Scoreboard {
  readonly el: HTMLElement;
  visible = false;
  private lastKey = '';

  constructor(parent: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'scoreboard';
    this.el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.toggle(false);
    });
    parent.appendChild(this.el);
  }

  toggle(show = !this.visible): void {
    this.visible = show;
    this.el.classList.toggle('show', show);
    this.lastKey = '';
  }

  update(w: World, selfId: number): void {
    if (!this.visible) return;
    const heroes = w.list.filter((u) => u.hero);
    const key = heroes.map((u) => `${u.id}:${u.hero!.level}:${u.hero!.kills}/${u.hero!.deaths}/${u.hero!.assists}:${u.hero!.lastHits}:${Math.floor(u.hero!.goldEarned / 50)}:${u.hero!.items.join(',')}:${u.alive}`).join('|');
    if (key === this.lastKey) return;
    this.lastKey = key;
    const side = (team: 0 | 1): string => {
      const rows = heroes
        .filter((u) => u.team === team)
        .map((u) => {
          const d = getHero(u.defId);
          const h = u.hero!;
          const items = h.items.map((id) => (id ? itemIcon(getItem(id), 26) : '<b class="item-icon empty" style="width:26px;height:26px"></b>')).join('');
          const dead = !u.alive && h.respawnAt > 0 ? `<span class="dead">${Math.ceil(h.respawnAt - w.time)}s</span>` : '';
          return `<tr class="${u.id === selfId ? 'me' : ''}">
            <td><b class="sb-face" style="background:${hex(d.palette.primary)}">${d.name[0]}</b>${dead}</td>
            <td class="nm">${d.name}<small>${ROLE_NAMES[d.role]} · Lv${h.level}</small></td>
            <td>${h.kills}/${h.deaths}/${h.assists}</td><td>${h.lastHits}</td><td>${Math.floor(h.goldEarned)}</td><td class="its">${items}</td></tr>`;
        })
        .join('');
      const kills = heroes.filter((u) => u.team === team).reduce((s, u) => s + u.hero!.kills, 0);
      return `<div class="sb-side t${team}"><div class="sb-title">${team === 0 ? '蓝方' : '红方'} <b>${kills}</b></div>
        <table><tr><th></th><th>英雄</th><th>KDA</th><th>补刀</th><th>经济</th><th>装备</th></tr>${rows}</table></div>`;
    };
    this.el.innerHTML = `<div class="sb-box">${side(0)}${side(1)}<div class="sb-hint">点击任意处关闭</div></div>`;
  }
}
