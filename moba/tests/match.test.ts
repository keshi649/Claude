import { describe, expect, it } from 'vitest';
import { ECONOMY, respawnTime, xpToNext } from '../src/data/balance';
import { MINIONS } from '../src/data/minions';
import { World, type PlayerConfig } from '../src/sim/world';
import type { Unit } from '../src/sim/entity';
import { applyDamage } from '../src/sim/damage';
import { isInvulnerable } from '../src/sim/status';
import { grantXp } from '../src/sim/economy';

const PID = 1;

function match(seed = 3, players: PlayerConfig[] = [{ pid: PID, team: 0, heroId: 'lifeng', name: '玩家', isAI: false }]): World {
  return new World({ seed, mode: 'match', players });
}

const tower = (w: World, team: number, lane: string, idx: number): Unit =>
  w.list.find((u) => u.kind === 'tower' && u.team === team && u.lane?.id === lane && u.lane.idx === idx)!;

function place(u: Unit, x: number, y: number): void {
  u.pos = { x, y };
  u.prevPos = { x, y };
}

function run(w: World, ticks: number): void {
  for (let i = 0; i < ticks; i++) w.step([]);
}

describe('防御塔索敌', () => {
  it('范围内同时有小兵和英雄时，优先打小兵', () => {
    const w = match();
    const t = tower(w, 1, 'mid', 0);
    const hero = w.heroOf(PID)!;
    place(hero, t.pos.x - 5, t.pos.y + 1);
    const m = w.spawnMinion(MINIONS.melee, 0, { x: t.pos.x - 4, y: t.pos.y + 4 }, 'mid');
    w.step([]);
    expect(t.lockTarget).toBe(m.id);
  });

  it('敌方英雄在塔下攻击己方英雄时，塔立即转火该英雄', () => {
    const w = match(3, [
      { pid: 1, team: 0, heroId: 'lifeng', name: '蓝', isAI: false },
      { pid: 2, team: 1, heroId: 'lifeng', name: '红', isAI: false },
    ]);
    const t = tower(w, 1, 'mid', 0);
    const blue = w.heroOf(1)!;
    const red = w.heroOf(2)!;
    place(blue, t.pos.x - 4, t.pos.y + 3);
    place(red, t.pos.x - 2.5, t.pos.y + 2);
    const m = w.spawnMinion(MINIONS.melee, 0, { x: t.pos.x - 3, y: t.pos.y + 5 }, 'mid');
    w.step([]);
    expect(t.lockTarget).toBe(m.id);
    // 蓝方英雄攻击红方英雄
    applyDamage(w, blue, red, 100, 'physical');
    w.step([]);
    expect(t.lockTarget).toBe(blue.id);
  });

  it('连续命中同一英雄，伤害递增', () => {
    const w = match();
    const t = tower(w, 1, 'mid', 0);
    const hero = w.heroOf(PID)!;
    hero.baseStats.hpRegen = 0;
    hero.baseStats.maxHp = 1e6;
    hero.statsDirty = true;
    w.step([]);
    hero.hp = 1e6;
    place(hero, t.pos.x - 4, t.pos.y + 3);
    const hits: number[] = [];
    for (let i = 0; i < 150 && hits.length < 4; i++) {
      w.step([]);
      for (const e of w.drainEvents()) if (e.t === 'damage' && e.target === hero.id && e.src === t.id) hits.push(e.amount);
    }
    expect(hits.length).toBe(4);
    expect(hits[1]!).toBeGreaterThan(hits[0]! * 1.3);
    expect(hits[3]!).toBeGreaterThan(hits[2]!);
  });
});

describe('建筑保护规则', () => {
  it('前一座塔没倒时后面的塔无敌；水晶在高地塔倒下前无敌', () => {
    const w = match();
    w.step([]);
    const outer = tower(w, 1, 'top', 0);
    const inner = tower(w, 1, 'top', 1);
    const high = tower(w, 1, 'top', 2);
    const crystal = w.list.find((u) => u.kind === 'crystal' && u.team === 1)!;
    expect(isInvulnerable(outer)).toBe(false);
    expect(isInvulnerable(inner)).toBe(true);
    expect(isInvulnerable(crystal)).toBe(true);
    w.killUnit(outer, null);
    w.step([]);
    expect(isInvulnerable(inner)).toBe(false);
    expect(isInvulnerable(high)).toBe(true);
    w.killUnit(inner, null);
    w.step([]);
    expect(isInvulnerable(high)).toBe(false);
    w.killUnit(high, null);
    w.step([]);
    expect(isInvulnerable(crystal)).toBe(false);
  });

  it('摧毁敌方水晶即获胜，之后逻辑停止推进', () => {
    const w = match();
    const crystal = w.list.find((u) => u.kind === 'crystal' && u.team === 1)!;
    w.killUnit(crystal, w.heroOf(PID)!);
    expect(w.winner).toBe(0);
    expect(w.drainEvents().some((e) => e.t === 'gameOver' && e.winner === 0)).toBe(true);
    const tick = w.tick;
    w.step([]);
    expect(w.tick).toBe(tick);
  });
});

describe('经济与经验', () => {
  it('补刀：最后一击的英雄得到小兵金币，并计入补刀数', () => {
    const w = match();
    const hero = w.heroOf(PID)!;
    const m = w.spawnMinion(MINIONS.ranged, 1, { x: 40, y: 80 }, 'mid');
    const gold0 = hero.hero!.gold;
    w.killUnit(m, hero);
    expect(hero.hero!.gold - gold0).toBeCloseTo(MINIONS.ranged.gold, 5);
    expect(hero.hero!.lastHits).toBe(1);
  });

  it('小兵不是被英雄击杀时没有金币，但附近英雄仍分享经验', () => {
    const w = match();
    const hero = w.heroOf(PID)!;
    place(hero, 40, 82);
    const m = w.spawnMinion(MINIONS.melee, 1, { x: 40, y: 80 }, 'mid');
    const gold0 = hero.hero!.gold;
    const xp0 = hero.hero!.xp;
    w.killUnit(m, null);
    expect(hero.hero!.gold).toBe(gold0);
    expect(hero.hero!.xp - xp0).toBeCloseTo(MINIONS.melee.xp, 5);
  });

  it('超出经验范围的英雄拿不到经验；两人分享时各得总经验（含加成）的一半', () => {
    const w = match(3, [
      { pid: 1, team: 0, heroId: 'lifeng', name: 'A', isAI: false },
      { pid: 2, team: 0, heroId: 'lifeng', name: 'B', isAI: false },
    ]);
    const a = w.heroOf(1)!;
    const b = w.heroOf(2)!;
    place(a, 40, 82);
    place(b, 41, 81);
    const m = w.spawnMinion(MINIONS.melee, 1, { x: 40, y: 80 }, 'mid');
    w.killUnit(m, null);
    const each = (MINIONS.melee.xp * (1 + ECONOMY.xpShareBonus)) / 2;
    expect(a.hero!.xp).toBeCloseTo(each, 5);
    expect(b.hero!.xp).toBeCloseTo(each, 5);
    place(b, 90, 20);
    const m2 = w.spawnMinion(MINIONS.melee, 1, { x: 40, y: 80 }, 'mid');
    w.killUnit(m2, null);
    expect(b.hero!.xp).toBeCloseTo(each, 5);
  });

  it('经验足够时升级并获得技能点', () => {
    const w = match();
    const hero = w.heroOf(PID)!;
    const pts = hero.hero!.skillPoints;
    grantXp(w, hero, xpToNext(1) + xpToNext(2));
    expect(hero.hero!.level).toBe(3);
    expect(hero.hero!.skillPoints).toBe(pts + 2);
  });

  it('击杀英雄：赏金、助攻、连杀终结与复活计时', () => {
    const w = match(3, [
      { pid: 1, team: 0, heroId: 'lifeng', name: 'A', isAI: false },
      { pid: 2, team: 0, heroId: 'lifeng', name: 'B', isAI: false },
      { pid: 3, team: 1, heroId: 'lifeng', name: 'C', isAI: false },
    ]);
    const a = w.heroOf(1)!;
    const b = w.heroOf(2)!;
    const c = w.heroOf(3)!;
    for (const u of [a, b, c]) place(u, 60, 60);
    c.hero!.streak = 4; // 对方正在连杀
    applyDamage(w, b, c, 10, 'true');
    const ga = a.hero!.gold;
    const gb = b.hero!.gold;
    w.killUnit(c, a);
    const shutdownBonus = Math.min(ECONOMY.shutdownMax, ECONOMY.shutdownPerStreak * 2);
    expect(a.hero!.gold - ga).toBeCloseTo(ECONOMY.heroBounty + shutdownBonus, 5);
    expect(a.hero!.kills).toBe(1);
    expect(b.hero!.assists).toBe(1);
    expect(b.hero!.gold - gb).toBeGreaterThanOrEqual(ECONOMY.assistMinGold);
    expect(c.hero!.deaths).toBe(1);
    expect(c.hero!.streak).toBe(0);
    const kill = w.drainEvents().find((e) => e.t === 'kill');
    expect(kill && kill.t === 'kill' && kill.firstBlood && kill.shutdown).toBe(true);
    // 复活
    expect(c.hero!.respawnAt).toBeCloseTo(w.time + respawnTime(c.hero!.level), 5);
    run(w, Math.ceil(respawnTime(1) * 30) + 2);
    expect(c.alive).toBe(true);
    expect(c.hp).toBe(c.stats.maxHp);
  });

  it('随时间自然获得金币', () => {
    const w = match();
    const hero = w.heroOf(PID)!;
    const g0 = hero.hero!.gold;
    run(w, 300);
    expect(hero.hero!.gold - g0).toBeCloseTo(ECONOMY.passiveGold * 10, 0);
  });
});

describe('兵线', () => {
  it('按时刷兵：每路 5 个，第 3 波有炮车', () => {
    const w = match();
    const minions = (): Unit[] => w.list.filter((u) => u.kind === 'minion');
    run(w, Math.ceil(12 * 30) + 2);
    expect(minions().length).toBe(5 * 6);
    // 让小兵不打架：直接清空，推进到第 3 波
    for (const m of minions()) w.killUnit(m, null);
    run(w, 60 * 30 + 5);
    const sieges = minions().filter((m) => m.defId === MINIONS.siege.id);
    expect(sieges.length).toBe(6);
  });

  it('小兵会沿路线前进并与敌方小兵交战', () => {
    const w = match();
    run(w, 30 * 45);
    const minions = w.list.filter((u) => u.kind === 'minion');
    expect(minions.length).toBeGreaterThan(0);
    const blueMid = minions.filter((m) => m.team === 0 && m.lane?.id === 'mid');
    // 离开了出生点
    for (const m of blueMid) expect(m.pos.x).toBeGreaterThan(25);
    const hits = w.list.some((u) => u.kind === 'minion' && u.hp < u.stats.maxHp);
    expect(hits).toBe(true);
  });
});

describe('泉水', () => {
  it('敌方英雄闯入泉水会受到高额伤害', () => {
    const w = match();
    const hero = w.heroOf(PID)!;
    const f = w.map.fountain[1];
    place(hero, f.x, f.y);
    const hp0 = hero.hp;
    run(w, 31);
    expect(hp0 - hero.hp).toBeGreaterThan(1000);
  });
});
