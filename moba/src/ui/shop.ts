import { getHero } from '../data/heroes';
import { INVENTORY_SIZE, ITEM_CATEGORY_NAMES, ITEM_LIST, SELL_RATIO, getItem, totalCost, type ItemCategory, type ItemDef } from '../data/items';
import { STAT_NAMES, type StatKey } from '../data/schema';
import type { Unit } from '../sim/entity';
import { checkBuy, nextRecommended } from '../sim/shop';

const hex = (c: number): string => `#${c.toString(16).padStart(6, '0')}`;
const PCT_STATS: StatKey[] = ['attackSpeed', 'crit', 'critDmg', 'cdr', 'lifesteal', 'armorPenPct', 'mrPenPct', 'monsterDmg'];

export function statLine(k: StatKey, v: number): string {
  if (PCT_STATS.includes(k)) return `+${Math.round(v * 100)}% ${STAT_NAMES[k]}`;
  if (k === 'moveSpeed') return `+${Math.round(v * 100)} ${STAT_NAMES[k]}`;
  return `+${Math.round(v)} ${STAT_NAMES[k]}`;
}

export function itemIcon(it: ItemDef, size = 44): string {
  return `<b class="item-icon" style="width:${size}px;height:${size}px;font-size:${size * 0.5}px;background:radial-gradient(circle at 35% 30%, ${hex(it.color)}, #151a22 85%);border-color:${it.tier === 3 ? '#ffd23c' : it.tier === 2 ? '#9fb8d8' : '#6a7686'}">${it.glyph}</b>`;
}

type Tab = 'rec' | ItemCategory;

/**
 * 商店界面：分类页签、装备网格（显示扣除已有部件后的实际价格）、详情（属性、合成路线）、
 * 购买 / 出售、装备栏。随时可以打开和购买。
 */
export class ShopPanel {
  readonly el: HTMLElement;
  private grid: HTMLElement;
  private detail: HTMLElement;
  private inv: HTMLElement;
  private goldEl: HTMLElement;
  private tab: Tab = 'rec';
  private selected: string | null = null;
  private selectedSlot = -1;
  visible = false;
  private lastKey = '';

  constructor(
    parent: HTMLElement,
    private readonly onBuy: (id: string) => void,
    private readonly onSell: (slot: number) => void,
  ) {
    const el = document.createElement('div');
    el.className = 'shop';
    el.innerHTML = `
      <div class="shop-head"><span class="shop-title">商店</span><span class="shop-gold"></span><button class="shop-close">✕</button></div>
      <div class="shop-body">
        <div class="shop-tabs"></div>
        <div class="shop-grid"></div>
        <div class="shop-detail"></div>
      </div>
      <div class="shop-inv"></div>`;
    parent.appendChild(el);
    this.el = el;
    this.grid = el.querySelector('.shop-grid')!;
    this.detail = el.querySelector('.shop-detail')!;
    this.inv = el.querySelector('.shop-inv')!;
    this.goldEl = el.querySelector('.shop-gold')!;
    el.querySelector('.shop-close')!.addEventListener('click', () => this.toggle(false));
    const tabs = el.querySelector('.shop-tabs')!;
    const names: [Tab, string][] = [['rec', '推荐'], ...(Object.entries(ITEM_CATEGORY_NAMES) as [ItemCategory, string][])];
    for (const [t, n] of names) {
      const b = document.createElement('button');
      b.textContent = n;
      b.dataset.tab = t;
      b.addEventListener('click', () => {
        this.tab = t;
      });
      tabs.appendChild(b);
    }
    // 阻止商店里的触摸穿透到游戏（摇杆 / 技能）
    el.addEventListener('pointerdown', (e) => e.stopPropagation());
  }

  toggle(show = !this.visible): void {
    this.visible = show;
    this.el.classList.toggle('show', show);
    this.lastKey = '';
  }

  private itemsForTab(hero: Unit): ItemDef[] {
    if (this.tab === 'rec') {
      const out: ItemDef[] = [];
      const add = (id: string): void => {
        const it = getItem(id);
        for (const c of it.components) add(c);
        if (!out.includes(it)) out.push(it);
      };
      for (const id of getHero(hero.defId).build) add(id);
      return out;
    }
    return ITEM_LIST.filter((i) => i.category === this.tab).sort((a, b) => a.tier - b.tier || totalCost(a.id) - totalCost(b.id));
  }

  /** 结构变化（页签 / 选中 / 装备栏）时重建 DOM；金币变化只原地刷新价格与可购买状态，避免点击时元素被替换 */
  private cells: { id: string; el: HTMLElement; price: HTMLElement }[] = [];
  private buyBtn: HTMLButtonElement | null = null;
  private lastDyn = '';

  update(hero: Unit): void {
    if (!this.visible) return;
    const h = hero.hero!;
    const key = `${this.tab}|${this.selected}|${this.selectedSlot}|${h.items.join(',')}`;
    if (key !== this.lastKey) {
      this.lastKey = key;
      this.lastDyn = '';
      this.rebuild(hero);
    }
    const gold = Math.floor(h.gold);
    const rec = nextRecommended(hero);
    const dyn = `${gold}|${rec}`;
    if (dyn === this.lastDyn) return;
    this.lastDyn = dyn;
    this.goldEl.innerHTML = `<i class="coin"></i>${gold}`;
    for (const c of this.cells) {
      const chk = checkBuy(hero, c.id);
      c.el.classList.toggle('poor', !chk.ok);
      c.el.classList.toggle('rec', rec === c.id);
      c.price.textContent = String(chk.price);
    }
    if (this.buyBtn && this.selected) {
      const chk = checkBuy(hero, this.selected);
      this.buyBtn.disabled = !chk.ok;
      this.buyBtn.textContent = chk.ok ? `购买（${chk.price}）` : (chk.reason ?? '无法购买');
    }
  }

  private rebuild(hero: Unit): void {
    const h = hero.hero!;
    this.el.querySelectorAll<HTMLElement>('.shop-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === this.tab));

    // 网格
    this.grid.innerHTML = '';
    this.cells = [];
    for (const it of this.itemsForTab(hero)) {
      const cell = document.createElement('div');
      cell.className = `shop-item${this.selected === it.id ? ' sel' : ''}`;
      cell.innerHTML = `${itemIcon(it)}<span class="n">${it.name}</span><span class="p"></span>`;
      cell.addEventListener('click', () => {
        this.selected = it.id;
        this.selectedSlot = -1;
      });
      cell.addEventListener('dblclick', () => this.onBuy(it.id));
      this.grid.appendChild(cell);
      this.cells.push({ id: it.id, el: cell, price: cell.querySelector('.p')! });
    }

    // 详情
    this.detail.innerHTML = '';
    this.buyBtn = null;
    if (this.selectedSlot >= 0 && h.items[this.selectedSlot]) {
      const it = getItem(h.items[this.selectedSlot]!);
      this.detail.innerHTML = this.describe(it);
      const b = document.createElement('button');
      b.className = 'sell';
      b.textContent = `出售（+${Math.floor(totalCost(it.id) * SELL_RATIO)}）`;
      const slot = this.selectedSlot;
      b.addEventListener('click', () => {
        this.onSell(slot);
        this.selectedSlot = -1;
      });
      this.detail.appendChild(b);
    } else if (this.selected) {
      const it = getItem(this.selected);
      this.detail.innerHTML = this.describe(it);
      const b = document.createElement('button');
      b.className = 'buy';
      const id = it.id;
      b.addEventListener('click', () => this.onBuy(id));
      this.detail.appendChild(b);
      this.buyBtn = b;
    } else {
      this.detail.innerHTML = '<div class="hint">点选装备查看详情；双击直接购买。<br>合成装备时，已拥有的部件会自动抵扣价格。</div>';
    }

    // 装备栏
    this.inv.innerHTML = '';
    for (let i = 0; i < INVENTORY_SIZE; i++) {
      const id = h.items[i];
      const s = document.createElement('div');
      s.className = `inv-slot${this.selectedSlot === i ? ' sel' : ''}`;
      s.innerHTML = id ? itemIcon(getItem(id), 40) : '';
      s.addEventListener('click', () => {
        if (!h.items[i]) return;
        this.selectedSlot = i;
        this.selected = null;
      });
      this.inv.appendChild(s);
    }
  }

  private describe(it: ItemDef): string {
    const stats = (Object.entries(it.stats) as [StatKey, number][]).map(([k, v]) => `<div>${statLine(k, v)}</div>`).join('');
    const tree = it.components.length ? `<div class="tree">合成：${it.components.map((c) => getItem(c).name).join(' + ')} + ${it.cost}</div>` : '';
    return `<div class="dh">${itemIcon(it, 52)}<div><div class="dn">${it.name}</div><div class="dp">总价 ${totalCost(it.id)}</div></div></div>
      <div class="ds">${stats}</div>${it.desc ? `<div class="dd">${it.desc}</div>` : ''}${tree}`;
  }
}
