import { describe, expect, it } from 'vitest';
import { World } from '../src/sim/world';
import type { Unit } from '../src/sim/entity';
import { applyDamage } from '../src/sim/damage';
import { visibleTo } from '../src/sim/vision';
import { pickAttackTarget } from '../src/sim/query';
import { TURTLE_REWARD } from '../src/data/monsters';

function match(players = [{ pid: 1, team: 0 as 0 | 1, heroId: 'lifeng', name: 'A', isAI: false }]): World {
  return new World({ seed: 4, mode: 'match', players });
}

function run(w: World, n: number): void {
  for (let i = 0; i < n; i++) w.step([]);
}

function place(u: Unit, x: number, y: number): void {
  u.pos = { x, y };
  u.prevPos = { x, y };
}

describe('野区', () => {
  it('野怪营地在 20 秒刷新，Boss 在 2 分钟 / 4 分钟出现', () => {
    const w = match();
    run(w, 30 * 21);
    const monsters = w.list.filter((u) => u.kind === 'monster');
    // 每方：蜥蜴 3 + 狼 3 + 两个石羽鸮营地各 3 + 两个增益各 1 = 14
    expect(monsters.length).toBe(28);
    expect(monsters.some((m) => m.defId === 'turtle')).toBe(false);
    run(w, 30 * 100);
    expect(w.list.some((m) => m.defId === 'turtle')).toBe(true);
  });

  it('野怪被攻击后整营反击，拉远后回营并回满血', () => {
    const w = match();
    run(w, 30 * 21);
    const hero = w.heroOf(1)!;
    const king = w.list.find((u) => u.defId === 'lizard_king' && Math.hypot(u.pos.x - 24, u.pos.y - 36) < 3)!;
    place(hero, king.pos.x - 2, king.pos.y);
    applyDamage(w, hero, king, 300, 'physical');
    run(w, 30);
    const camp = w.list.filter((u) => u.kind === 'monster' && Math.hypot(u.pos.x - 24, u.pos.y - 36) < 6);
    expect(camp.every((m) => m.lockTarget === hero.id)).toBe(true);
    expect(hero.hp).toBeLessThan(hero.stats.maxHp);
    // 英雄跑远 → 野怪脱战回营
    place(hero, 60, 110);
    run(w, 30 * 8);
    expect(king.resetting).toBe(false);
    expect(king.hp).toBe(king.stats.maxHp);
    expect(Math.hypot(king.pos.x - king.home.x, king.pos.y - king.home.y)).toBeLessThan(1);
  });

  it('击杀增益野怪获得对应增益；野怪死亡后定时重生', () => {
    const w = match();
    run(w, 30 * 21);
    const hero = w.heroOf(1)!;
    const deer = w.list.find((u) => u.defId === 'blue_deer' && Math.hypot(u.pos.x - 28, u.pos.y - 58) < 3)!;
    place(hero, deer.pos.x - 2, deer.pos.y);
    w.killUnit(deer, hero);
    expect(hero.buffs.some((b) => b.id === 'clear_stream')).toBe(true);
    run(w, 30 * 91);
    expect(w.list.some((u) => u.defId === 'blue_deer' && Math.hypot(u.pos.x - 28, u.pos.y - 58) < 3 && u.alive)).toBe(true);
  });

  it('击杀玄甲巨龟：全队获得金币与经验；击杀霆角龙王：每条路召唤一个先锋', () => {
    const w = match([
      { pid: 1, team: 0, heroId: 'lifeng', name: 'A', isAI: false },
      { pid: 2, team: 0, heroId: 'qingling', name: 'B', isAI: false },
    ]);
    run(w, 30 * 241);
    const a = w.heroOf(1)!;
    const b = w.heroOf(2)!;
    const turtle = w.list.find((u) => u.defId === 'turtle')!;
    const gb = b.hero!.gold;
    w.killUnit(turtle, a);
    expect(b.hero!.gold - gb).toBeGreaterThanOrEqual(TURTLE_REWARD.gold);
    const dragon = w.list.find((u) => u.defId === 'dragon')!;
    w.killUnit(dragon, a);
    const vg = w.list.filter((u) => u.defId === 'vanguard' && u.team === 0);
    expect(vg).toHaveLength(3);
    expect(new Set(vg.map((v) => v.lane!.id)).size).toBe(3);
  });
});

describe('视野与草丛', () => {
  function duel(): { w: World; blue: Unit; red: Unit } {
    const w = match([
      { pid: 1, team: 0, heroId: 'lifeng', name: 'A', isAI: false },
      { pid: 2, team: 1, heroId: 'lifeng', name: 'B', isAI: false },
    ]);
    return { w, blue: w.heroOf(1)!, red: w.heroOf(2)! };
  }
  // 上路外塔前的蓝方草丛（14.5, 32~38）
  const BUSH = { x: 14.5, y: 35 };

  it('视野外的敌方英雄不可见', () => {
    const { w, blue, red } = duel();
    place(blue, 50, 90);
    place(red, 60, 95);
    run(w, 4);
    expect(visibleTo(red, 0)).toBe(false);
    place(red, 55, 92);
    run(w, 4);
    expect(visibleTo(red, 0)).toBe(true);
  });

  it('草丛里的敌人隐身；进入同一片草丛可以看见；在草丛里攻击会短暂暴露', () => {
    const { w, blue, red } = duel();
    place(red, BUSH.x, BUSH.y);
    place(blue, BUSH.x, BUSH.y + 6);
    run(w, 4);
    expect(red.bush).toBeGreaterThan(0);
    expect(visibleTo(red, 0)).toBe(false);
    // 看不见就不能被普攻选中
    expect(pickAttackTarget(w, blue, 'auto')?.id).not.toBe(red.id);
    // 蓝方也进入同一片草丛
    place(blue, BUSH.x, BUSH.y + 2);
    run(w, 4);
    expect(visibleTo(red, 0)).toBe(true);
    // 蓝方离开草丛；红方在草丛里攻击 → 暴露
    place(blue, BUSH.x - 2, BUSH.y + 5);
    run(w, 4);
    expect(visibleTo(red, 0)).toBe(false);
    applyDamage(w, red, blue, 10, 'physical');
    run(w, 4);
    expect(visibleTo(red, 0)).toBe(true);
    run(w, 60);
    expect(visibleTo(red, 0)).toBe(false);
  });
});

describe('野区对标重做：Boss 进化与河道之灵', () => {
  it('10 分钟后玄甲巨龟以进化形态（苍岩古龟）重生，击杀后全队获得古龟庇佑', () => {
    const w = match([
      { pid: 1, team: 0, heroId: 'lifeng', name: 'A', isAI: false },
      { pid: 2, team: 0, heroId: 'lanxi', name: 'B', isAI: true },
    ]);
    const camp = w.camps.find((c) => c.kind === 'turtle')!;
    w.tick = 30 * 601;
    camp.spawnAt = 1;
    w.step([]);
    const boss = w.get(camp.ids[0]!)!;
    expect(boss.defId).toBe('ancient_turtle');
    const a = w.heroOf(1)!;
    const b = w.heroOf(2)!;
    const g0 = b.hero!.gold;
    w.killUnit(boss, a);
    expect(a.buffs.some((x) => x.id === 'ancient_blessing')).toBe(true);
    expect(b.buffs.some((x) => x.id === 'ancient_blessing')).toBe(true);
    expect(b.hero!.gold - g0).toBeGreaterThanOrEqual(200);
  });

  it('10 分钟前仍是普通形态', () => {
    const w = match();
    run(w, 30 * 121);
    expect(w.list.some((u) => u.defId === 'turtle' && u.alive)).toBe(true);
    expect(w.list.some((u) => u.defId === 'ancient_turtle')).toBe(false);
  });

  it('河道之灵 90 秒出现在河道对角线上，不反击；击杀者获得金币与加速', () => {
    const w = match();
    run(w, 30 * 91);
    const sprites = w.list.filter((u) => u.defId === 'river_sprite' && u.alive);
    expect(sprites).toHaveLength(2);
    for (const s of sprites) {
      expect(Math.abs(s.pos.x - s.pos.y)).toBeLessThan(0.5);
      expect(w.nav.walkableAt(s.pos)).toBe(true);
    }
    const hero = w.heroOf(1)!;
    const s = sprites[0]!;
    place(hero, s.pos.x - 1.5, s.pos.y);
    const hp0 = hero.hp;
    applyDamage(w, hero, s, 100, 'true');
    run(w, 60);
    expect(hero.hp).toBeGreaterThanOrEqual(hp0);
    const g0 = hero.hero!.gold;
    w.killUnit(s, hero);
    expect(hero.hero!.gold - g0).toBeGreaterThanOrEqual(90);
    expect(hero.buffs.some((b) => b.id === 'river_haste')).toBe(true);
  });
});
