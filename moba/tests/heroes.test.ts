import { describe, expect, it } from 'vitest';
import { HERO_LIST } from '../src/data/heroes';
import { World } from '../src/sim/world';
import type { Command } from '../src/sim/commands';
import type { Unit } from '../src/sim/entity';
import { MINIONS } from '../src/data/minions';

const PID = 1;

function training(heroId: string, summoner = 'blink'): World {
  return new World({ seed: 9, mode: 'training', startLevel: 6, players: [{ pid: PID, team: 0, heroId, name: 'p', isAI: false, summoner }] });
}

function soloDummy(w: World, dist: number): { hero: Unit; dummy: Unit } {
  const [dm, ...others] = w.list.filter((u) => u.kind === 'dummy');
  for (const o of others) {
    w.units.delete(o.id);
    w.list = w.list.filter((u) => u !== o);
  }
  const hero = w.heroOf(PID)!;
  hero.pos = { x: dm!.pos.x - dist, y: dm!.pos.y };
  hero.prevPos = { ...hero.pos };
  hero.facing = 0;
  return { hero, dummy: dm! };
}

function run(w: World, n: number, f: (i: number) => Command[] = () => []): void {
  for (let i = 0; i < n; i++) w.step(f(i));
}

describe('所有英雄的技能都能正常释放并生效', () => {
  for (const def of HERO_LIST) {
    for (const slot of [0, 1, 2] as const) {
      it(`${def.name} · ${def.skills[slot].name}`, () => {
        const w = training(def.id);
        const sk = def.skills[slot];
        const dist = sk.targeting === 'self' ? 1.8 : Math.min(3, sk.range * 0.5);
        const { hero, dummy } = soloDummy(w, dist);
        hero.baseStats.mpRegen = 999;
        hero.statsDirty = true;
        w.step([]);
        const cmds = (i: number): Command[] => {
          if (i === 0) return [{ t: 'cast', pid: PID, slot, aim: { k: 'auto' }, phase: sk.charge ? 'start' : undefined }];
          if (sk.charge && i === 20) return [{ t: 'cast', pid: PID, slot, aim: { k: 'auto' }, phase: 'release' }];
          return [];
        };
        let damaged = false;
        let effect = false;
        for (let i = 0; i < 150; i++) {
          w.step(cmds(i));
          for (const e of w.drainEvents()) {
            if (e.t === 'damage' && e.target === dummy.id) damaged = true;
            if ((e.t === 'buffAdd' || e.t === 'dash' || e.t === 'blink') && e.unit === hero.id) effect = true;
            if (e.t === 'shield' && e.target === hero.id) effect = true;
          }
        }
        // 冷却已开始 → 施法成功
        expect(hero.hero!.cooldowns[slot] > 0 || hero.hero!.recast[slot] !== null).toBe(true);
        expect(damaged || effect).toBe(true);
      });
    }
  }
});

describe('技能机制', () => {
  it('蓄力：满蓄力的山崩比不蓄力伤害更高', () => {
    const dmg = (hold: number): number => {
      const w = training('duoshan');
      const { dummy } = soloDummy(w, 3);
      w.step([]);
      run(w, 60, (i) =>
        i === 0 ? [{ t: 'cast', pid: PID, slot: 2, aim: { k: 'auto' }, phase: 'start' }] : i === hold ? [{ t: 'cast', pid: PID, slot: 2, aim: { k: 'auto' }, phase: 'release' }] : [],
      );
      return dummy.stats.maxHp - dummy.hp;
    };
    expect(dmg(40)).toBeGreaterThan(dmg(1) * 1.3);
  });

  it('取消蓄力会返还法力且不进入冷却', () => {
    const w = training('lanxi');
    const hero = w.heroOf(PID)!;
    hero.baseStats.mpRegen = 0;
    hero.statsDirty = true;
    w.step([]);
    const mp0 = hero.mp;
    w.step([{ t: 'cast', pid: PID, slot: 2, aim: { k: 'auto' }, phase: 'start' }]);
    expect(hero.mp).toBeLessThan(mp0);
    run(w, 5);
    w.step([{ t: 'cancelCast', pid: PID }]);
    expect(hero.mp).toBeCloseTo(mp0, 0);
    expect(hero.hero!.cooldowns[2]).toBe(0);
    expect(hero.cast).toBeNull();
  });

  it('标记与引爆：夜鸦影镖命中后，影步引爆暗印并刷新冷却', () => {
    const w = training('yeya');
    const { hero, dummy } = soloDummy(w, 4);
    w.step([{ t: 'cast', pid: PID, slot: 0, aim: { k: 'auto' } }]);
    run(w, 20);
    expect(dummy.buffs.some((b) => b.id === 'yeya_mark')).toBe(true);
    w.step([{ t: 'cast', pid: PID, slot: 1, aim: { k: 'auto' } }]);
    run(w, 10);
    expect(dummy.buffs.some((b) => b.id === 'yeya_mark')).toBe(false);
    expect(hero.hero!.cooldowns[1]).toBe(0);
  });

  it('撞墙眩晕：青翎缚羽箭把贴墙的目标钉住', () => {
    const w = training('qingling');
    const hero = w.heroOf(PID)!;
    const dummy = w.list.find((u) => u.kind === 'dummy')!;
    for (const o of w.list.filter((u) => u.kind === 'dummy' && u !== dummy)) {
      w.units.delete(o.id);
      w.list = w.list.filter((u) => u !== o);
    }
    // 木桩放在上路贴墙林带左侧，英雄在更左边向右射
    dummy.pos = { x: 13.8, y: 46 };
    dummy.home = { ...dummy.pos };
    hero.pos = { x: 8, y: 46 };
    hero.prevPos = { ...hero.pos };
    w.step([{ t: 'cast', pid: PID, slot: 1, aim: { k: 'dir', x: 1, y: 0 } }]);
    let stunned = false;
    for (let i = 0; i < 40; i++) {
      w.step([]);
      for (const e of w.drainEvents()) if (e.t === 'cc' && e.target === dummy.id && e.cc === 'stun') stunned = true;
    }
    expect(stunned).toBe(true);
  });

  it('周期被动：芷萤每秒为身边受伤的友军英雄回血', () => {
    const w = training('zhiying');
    const hero = w.heroOf(PID)!;
    hero.baseStats.hpRegen = 0;
    hero.statsDirty = true;
    w.step([]);
    hero.hp = hero.stats.maxHp * 0.5;
    const hp0 = hero.hp;
    run(w, 65);
    expect(hero.hp).toBeGreaterThan(hp0 + 10);
  });

  it('召唤师技能猎击：只能对小兵 / 野怪使用，造成高额真实伤害', () => {
    const w = new World({ seed: 1, mode: 'match', players: [{ pid: PID, team: 0, heroId: 'yeya', name: 'p', isAI: false, summoner: 'smite' }] });
    const hero = w.heroOf(PID)!;
    hero.pos = { x: 40, y: 80 };
    const m = w.spawnMinion(MINIONS.siege, 1, { x: 42, y: 80 }, 'mid');
    w.step([{ t: 'summoner', pid: PID, aim: { k: 'auto' } }]);
    expect(m.stats.maxHp - m.hp).toBeGreaterThanOrEqual(800);
    expect(hero.hero!.summoner.cd).toBeGreaterThan(0);
  });

  it('召唤师技能瞬影：向指定方向瞬移', () => {
    const w = training('lifeng');
    const hero = w.heroOf(PID)!;
    const x0 = hero.pos.x;
    w.step([{ t: 'summoner', pid: PID, aim: { k: 'dir', x: 1, y: 0 } }]);
    expect(hero.pos.x - x0).toBeGreaterThan(3);
  });
});

describe('新英雄的核心机制', () => {
  it('铁索 · 缚魂钩：把命中的敌人拉到身前并眩晕', () => {
    const w = training('tiesuo');
    const { hero, dummy } = soloDummy(w, 7);
    w.step([]);
    const d0 = Math.hypot(dummy.pos.x - hero.pos.x, dummy.pos.y - hero.pos.y);
    run(w, 30, (i) => (i === 0 ? [{ t: 'cast', pid: PID, slot: 0, aim: { k: 'dir', x: 1, y: 0 } }] : []));
    const d1 = Math.hypot(dummy.pos.x - hero.pos.x, dummy.pos.y - hero.pos.y);
    expect(d0).toBeGreaterThan(6);
    expect(d1).toBeLessThan(2.2);
  });

  it('灼羽 · 余烬：技能命中英雄（木桩视为英雄）后持续灼烧', () => {
    const w = training('zhuoyu');
    const { dummy } = soloDummy(w, 4);
    w.step([]);
    run(w, 40, (i) => (i === 0 ? [{ t: 'cast', pid: PID, slot: 0, aim: { k: 'dir', x: 1, y: 0 } }] : []));
    expect(dummy.buffs.some((b) => b.id === 'zhuoyu_burn')).toBe(true);
    const hp = dummy.hp;
    run(w, 35);
    expect(dummy.hp).toBeLessThan(hp);
  });

  it('雷牙 · 猎杀：击杀英雄刷新雷闪冷却', () => {
    const w = new World({
      seed: 3,
      mode: 'match',
      players: [
        { pid: 1, team: 0, heroId: 'leiya', name: 'a', isAI: false },
        { pid: 2, team: 1, heroId: 'qingling', name: 'b', isAI: true },
      ],
    });
    const me = w.heroOf(1)!;
    const foe = w.heroOf(2)!;
    me.hero!.cooldowns[0] = 8;
    w.killUnit(foe, me);
    expect(me.hero!.cooldowns[0]).toBe(0);
  });

  it('苍隼 · 鹰眼：远距离普攻伤害更高', () => {
    const hitAt = (dist: number): number => {
      const w = training('cangsun');
      const { hero, dummy } = soloDummy(w, dist);
      w.step([]);
      let dmg = 0;
      for (let i = 0; i < 60 && dmg === 0; i++) {
        w.step([{ t: 'attack', pid: PID, mode: 'auto' }]);
        for (const e of w.drainEvents()) if (e.t === 'damage' && e.target === dummy.id && e.src === hero.id) dmg += e.amount;
      }
      return dmg;
    };
    expect(hitAt(6.3)).toBeGreaterThan(hitAt(3) * 1.15);
  });
});
