import { INVENTORY_SIZE, SELL_RATIO, getItem, totalCost } from '../data/items';
import { getHero } from '../data/heroes';
import type { Unit } from './entity';
import type { World } from './world';

/**
 * 商店：随时可以购买（对标手游，不需要回泉水）。
 *   - 购买合成件时，背包里已有的部件会被消耗并抵扣价格
 *   - 出售返还总价的 60%
 *   - 推荐购买：按英雄推荐出装，找出“下一件买得起的”物品（成装买不起时降级到它的部件）
 */

export interface PurchasePlan {
  price: number;
  /** 会被消耗的背包格子 */
  consume: number[];
}

/** 计算购买某装备的实际价格与消耗的部件（inv 为背包，reserved 为已被预留的格子） */
export function purchasePlan(inv: readonly (string | null)[], itemId: string, reserved: Set<number> = new Set()): PurchasePlan {
  const it = getItem(itemId);
  let price = it.cost;
  const consume: number[] = [];
  for (const c of it.components) {
    const slot = inv.findIndex((x, i) => x === c && !reserved.has(i));
    if (slot >= 0) {
      reserved.add(slot);
      consume.push(slot);
    } else {
      const sub = purchasePlan(inv, c, reserved);
      price += sub.price;
      consume.push(...sub.consume);
    }
  }
  return { price, consume };
}

export function checkBuy(u: Unit, itemId: string): { ok: boolean; price: number; reason?: string } {
  const h = u.hero!;
  const plan = purchasePlan(h.items, itemId);
  const used = h.items.filter((x) => x !== null).length;
  if (used - plan.consume.length + 1 > INVENTORY_SIZE) return { ok: false, price: plan.price, reason: '装备栏已满' };
  if (h.gold + 1e-6 < plan.price) return { ok: false, price: plan.price, reason: '金币不足' };
  return { ok: true, price: plan.price };
}

export function buyItem(w: World, u: Unit, itemId: string): boolean {
  const h = u.hero;
  if (!h) return false;
  const c = checkBuy(u, itemId);
  if (!c.ok) {
    w.emit({ t: 'castFail', unit: u.id, reason: c.reason ?? '无法购买' });
    return false;
  }
  const plan = purchasePlan(h.items, itemId);
  for (const s of plan.consume) h.items[s] = null;
  const slot = h.items.findIndex((x) => x === null);
  h.items[slot] = itemId;
  h.gold -= plan.price;
  u.statsDirty = true;
  w.emit({ t: 'shop', unit: u.id, item: itemId, sold: false });
  return true;
}

export function sellItem(w: World, u: Unit, slot: number): boolean {
  const h = u.hero;
  const id = h?.items[slot];
  if (!h || !id) return false;
  h.items[slot] = null;
  h.gold += Math.floor(totalCost(id) * SELL_RATIO);
  u.statsDirty = true;
  w.emit({ t: 'shop', unit: u.id, item: id, sold: true });
  return true;
}

/** 背包里是否已经有这件装备（或以它为部件合成出的更高级装备） */
function owns(items: readonly (string | null)[], id: string): boolean {
  const has = (x: string): boolean => x === id || getItem(x).components.some((c) => has(c));
  return items.some((x) => x !== null && has(x));
}

/** 推荐购买的下一件：null 表示推荐出装已买齐或什么都买不起 */
export function nextRecommended(u: Unit): string | null {
  const h = u.hero!;
  const pick = (id: string): string | null => {
    if (checkBuy(u, id).ok) return id;
    for (const c of getItem(id).components) {
      if (owns(h.items, c)) continue;
      const r = pick(c);
      if (r) return r;
    }
    return null;
  };
  for (const id of getHero(u.defId).build) {
    if (owns(h.items, id)) continue;
    return pick(id);
  }
  return null;
}
