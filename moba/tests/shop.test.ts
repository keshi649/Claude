import { describe, expect, it } from 'vitest';
import { ITEM_LIST, SELL_RATIO, START_GOLD, getItem, totalCost } from '../src/data/items';
import { HERO_LIST } from '../src/data/heroes';
import { World } from '../src/sim/world';
import { buyItem, nextRecommended, purchasePlan, sellItem } from '../src/sim/shop';

function match(heroId = 'lifeng'): World {
  return new World({ seed: 1, mode: 'match', players: [{ pid: 1, team: 0, heroId, name: 'p', isAI: false }] });
}

describe('装备与商店', () => {
  it('装备数量约 20 件，合成路线引用的部件都存在，推荐出装都能买到', () => {
    expect(ITEM_LIST.length).toBeGreaterThanOrEqual(20);
    for (const it of ITEM_LIST) for (const c of it.components) expect(getItem(c)).toBeTruthy();
    for (const h of HERO_LIST) for (const id of h.build) expect(getItem(id).tier).toBeGreaterThanOrEqual(2);
  });

  it('总价 = 合成费 + 部件总价', () => {
    expect(totalCost('gale_sword')).toBe(400 + 250 * 2);
    expect(totalCost('mountain_blade')).toBe(700 + totalCost('gale_sword') + totalCost('blood_sickle'));
  });

  it('已有部件会抵扣合成价格', () => {
    expect(purchasePlan([null, null, null, null, null, null], 'gale_sword').price).toBe(900);
    const plan = purchasePlan(['bronze_blade', null, null, null, null, null], 'gale_sword');
    expect(plan.price).toBe(650);
    expect(plan.consume).toEqual([0]);
  });

  it('购买扣金币并增加属性；出售返还 60%', () => {
    const w = match();
    const u = w.heroOf(1)!;
    expect(u.hero!.gold).toBe(START_GOLD);
    const ad0 = u.stats.ad;
    expect(buyItem(w, u, 'bronze_blade')).toBe(true);
    w.step([]);
    expect(u.hero!.gold).toBeCloseTo(START_GOLD - 250 + 3.5 / 30, 3);
    expect(u.stats.ad).toBeCloseTo(ad0 + 20, 5);
    const g = u.hero!.gold;
    sellItem(w, u, 0);
    expect(u.hero!.gold - g).toBeCloseTo(250 * SELL_RATIO, 5);
  });

  it('合成时消耗部件、只占一格；金币不足或装备栏满时购买失败', () => {
    const w = match();
    const u = w.heroOf(1)!;
    u.hero!.gold = 5000;
    buyItem(w, u, 'bronze_blade');
    buyItem(w, u, 'bronze_blade');
    expect(u.hero!.items.filter(Boolean)).toHaveLength(2);
    buyItem(w, u, 'gale_sword');
    expect(u.hero!.items.filter(Boolean)).toEqual(['gale_sword']);
    u.hero!.gold = 10;
    expect(buyItem(w, u, 'life_gem')).toBe(false);
    u.hero!.gold = 99999;
    for (let i = 0; i < 5; i++) buyItem(w, u, 'life_gem');
    expect(buyItem(w, u, 'leather_armor')).toBe(false);
  });

  it('推荐购买：沿推荐出装逐件购买，买不起成装时先买部件', () => {
    const w = match('lifeng');
    const u = w.heroOf(1)!;
    u.hero!.gold = 300;
    const first = nextRecommended(u);
    expect(first).toBe('bronze_blade');
    u.hero!.gold = 99999;
    const bought: string[] = [];
    for (let i = 0; i < 20; i++) {
      const id = nextRecommended(u);
      if (!id) break;
      buyItem(w, u, id);
      bought.push(id);
    }
    // 推荐出装全部买齐
    for (const id of HERO_LIST.find((h) => h.id === 'lifeng')!.build) expect(u.hero!.items).toContain(id);
  });
});
