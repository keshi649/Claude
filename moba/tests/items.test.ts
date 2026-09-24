import { describe, expect, it } from 'vitest';
import { ITEM_LIST, getItem } from '../src/data/items';
import { MONSTERS } from '../src/data/monsters';
import { applyDamage } from '../src/sim/damage';
import type { Unit } from '../src/sim/entity';
import { firePassive } from '../src/sim/skills/effects';
import { recomputeStats } from '../src/sim/stats';
import { World, type PlayerConfig } from '../src/sim/world';

const players: PlayerConfig[] = [
  { pid: 1, team: 0, heroId: 'lifeng', name: '我', isAI: false },
  { pid: 2, team: 0, heroId: 'zhiying', name: '队友', isAI: true },
  { pid: 3, team: 1, heroId: 'yeya', name: '敌人', isAI: true },
];

function setup(): { w: World; me: Unit; mate: Unit; foe: Unit } {
  const w = new World({ seed: 2, mode: 'match', players });
  const me = w.heroOf(1)!;
  const mate = w.heroOf(2)!;
  const foe = w.heroOf(3)!;
  for (const [u, x, y] of [
    [me, 60, 60],
    [mate, 61, 61],
    [foe, 62, 60],
  ] as const) {
    u.pos = { x, y };
    u.prevPos = { x, y };
  }
  w.step([]);
  return { w, me, mate, foe };
}

function equip(u: Unit, ...ids: string[]): void {
  ids.forEach((id, i) => (u.hero!.items[i] = id));
  u.statsDirty = true;
  recomputeStats(u);
  u.hp = u.stats.maxHp;
}

describe('装备唯一被动（对标手游核心装备）', () => {
  it('每件成装都有被动说明；被动触发器都有效果', () => {
    const finals = ITEM_LIST.filter((i) => i.tier === 3);
    expect(finals.length).toBeGreaterThanOrEqual(9);
    for (const it of finals) {
      expect(it.passive, it.name).toBeTruthy();
      expect(it.passive!.desc.length).toBeGreaterThan(8);
      for (const tr of it.passive!.triggers) expect(tr.effects.length).toBeGreaterThan(0);
    }
  });

  it('断岳重剑：普攻命中半血以下的敌人追加已损生命伤害', () => {
    const { w, me, foe } = setup();
    equip(me, 'mountain_blade');
    foe.hp = foe.stats.maxHp * 0.8;
    const hp0 = foe.hp;
    firePassive(w, me, 'attackHit', foe);
    expect(foe.hp).toBe(hp0);
    foe.hp = foe.stats.maxHp * 0.3;
    const hp1 = foe.hp;
    firePassive(w, me, 'attackHit', foe);
    expect(foe.hp).toBeLessThan(hp1);
  });

  it('陨星战弓：普攻叠攻速，最多 5 层', () => {
    const { w, me, foe } = setup();
    equip(me, 'meteor_bow');
    for (let i = 0; i < 8; i++) firePassive(w, me, 'attackHit', foe);
    expect(me.buffs.find((b) => b.id === 'meteor_haste')?.stacks).toBe(5);
  });

  it('天罚法杖：技能命中英雄追加伤害，4 秒冷却内不再触发；同名装备不叠加', () => {
    const { w, me, foe } = setup();
    equip(me, 'judgment_staff', 'judgment_staff');
    const hp0 = foe.hp;
    expect(firePassive(w, me, 'skillHit', foe)).toBe(true);
    const once = hp0 - foe.hp;
    expect(once).toBeGreaterThan(0);
    expect(me.hero!.itemCd.judgment_staff).toBe(4);
    const hp1 = foe.hp;
    firePassive(w, me, 'skillHit', foe);
    expect(foe.hp).toBe(hp1);
    // 冷却结束后再次触发
    for (let i = 0; i < 30 * 4 + 2; i++) w.step([]);
    const hp2 = foe.hp;
    firePassive(w, me, 'skillHit', foe);
    expect(hp2 - foe.hp).toBeGreaterThan(0);
  });

  it('永固巨盾：受伤后生命低于 35% 获得护盾，冷却 60 秒', () => {
    const { w, me, foe } = setup();
    equip(me, 'eternal_shield');
    applyDamage(w, foe, me, me.stats.maxHp * 0.3, 'true');
    expect(me.shields.length).toBe(0);
    applyDamage(w, foe, me, me.stats.maxHp * 0.45, 'true');
    expect(me.shields.length).toBe(1);
    expect(me.hero!.itemCd.eternal_shield).toBe(60);
  });

  it('护命玉佩：致命伤害时免死并短暂无敌；冷却中再次致命则阵亡', () => {
    const { w, me, foe } = setup();
    equip(me, 'guard_jade');
    applyDamage(w, foe, me, me.stats.maxHp * 5, 'true');
    expect(me.alive).toBe(true);
    expect(me.hp).toBeGreaterThanOrEqual(1);
    expect(applyDamage(w, foe, me, 99999, 'true')).toBe(0);
    for (let i = 0; i < 40; i++) w.step([]);
    applyDamage(w, foe, me, me.stats.maxHp * 5, 'true');
    expect(me.alive).toBe(false);
  });

  it('萤引灯盏：每 10 秒为身边友军英雄提供护盾', () => {
    const { w, me, mate } = setup();
    equip(mate, 'lantern_charm');
    w.step([]);
    expect(me.shields.length).toBe(1);
    expect(mate.shields.length).toBe(1);
    for (let i = 0; i < 30 * 5; i++) w.step([]);
    expect(me.shields.length).toBe(0);
    for (let i = 0; i < 30 * 5 + 5; i++) w.step([]);
    expect(me.shields.length).toBe(1);
  });

  it('猎王之爪：击杀野怪回复生命', () => {
    const { w, me } = setup();
    equip(me, 'beast_claw');
    me.hp = me.stats.maxHp * 0.5;
    const m = w.spawnMonster(Object.values(MONSTERS)[0]!, { x: 60, y: 62 });
    const hp0 = me.hp;
    w.killUnit(m, me);
    expect(me.hp).toBeGreaterThan(hp0);
  });

  it('霜纹护手：普攻后在目标处炸开寒冰减速，冷却 2.5 秒', () => {
    const { w, me, foe } = setup();
    equip(me, 'frost_gauntlet');
    firePassive(w, me, 'attackHit', foe);
    expect(foe.status.slows.length).toBe(1);
    expect(me.hero!.itemCd.frost_gauntlet).toBe(2.5);
  });

  it('装备说明与名称都是原创中文', () => {
    for (const it of ITEM_LIST) expect(/[一-龥]/.test(it.name)).toBe(true);
    expect(getItem('guard_jade').passive?.name).toBe('护命');
  });
});
