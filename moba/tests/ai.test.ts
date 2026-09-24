import { describe, expect, it } from 'vitest';
import { Rng } from '../src/core/rng';
import { getHero } from '../src/data/heroes';
import { AIDirector, makeLineup } from '../src/sim/ai/director';
import { aimAt } from '../src/sim/ai/combat';
import { DIFFICULTY } from '../src/sim/ai/difficulty';
import { TeamKnowledge } from '../src/sim/ai/perception';
import { assignPositions } from '../src/sim/ai/roles';
import type { Command } from '../src/sim/commands';
import type { Unit } from '../src/sim/entity';
import { visibleTo } from '../src/sim/vision';
import { World } from '../src/sim/world';

function place(u: Unit, x: number, y: number): void {
  u.pos = { x, y };
  u.prevPos = { x, y };
}

function aiMatch(seed: number, playerHero?: string): { w: World; ai: AIDirector } {
  const lineup = makeLineup({ seed, playerHero, allyDifficulty: 'normal', enemyDifficulty: 'normal' });
  const w = new World({ seed, mode: 'match', players: lineup.players });
  return { w, ai: new AIDirector(w, lineup.difficulties, lineup.positions) };
}

/** 引用了某个单位的命令（普攻目标 / 指向技能） */
function mentions(c: Command, id: number): boolean {
  if (c.t === 'attackUnit') return c.id === id;
  if ((c.t === 'cast' || c.t === 'summoner') && c.aim.k === 'unit') return c.aim.id === id;
  return false;
}

describe('阵容与分路', () => {
  it('每队 5 个不重复英雄，五个位置各一人，打野带猎击', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const l = makeLineup({ seed, allyDifficulty: 'normal', enemyDifficulty: 'hard' });
      expect(l.players).toHaveLength(10);
      for (const team of [0, 1]) {
        const ps = l.players.filter((p) => p.team === team);
        expect(new Set(ps.map((p) => p.heroId)).size).toBe(5);
        expect(new Set(ps.map((p) => l.positions.get(p.pid))).size).toBe(5);
        for (const p of ps) if (l.positions.get(p.pid) === 'jungle') expect(p.summoner).toBe('smite');
        for (const p of ps) expect(l.difficulties[p.pid]).toBe(team === 0 ? 'normal' : 'hard');
      }
    }
  });

  it('玩家占蓝方第一个位置，不是 AI，用自己选的召唤师技能', () => {
    const l = makeLineup({ seed: 5, playerHero: 'lanxi', playerSummoner: 'heal', allyDifficulty: 'normal', enemyDifficulty: 'normal' });
    const me = l.players[0]!;
    expect(me).toMatchObject({ team: 0, heroId: 'lanxi', isAI: false, summoner: 'heal' });
    expect(l.players.filter((p) => !p.isAI)).toHaveLength(1);
  });

  it('人机阵容合理：每队打野、中路、发育路、游走都由擅长该位置的英雄担任', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const l = makeLineup({ seed, playerHero: seed % 2 ? 'qingling' : undefined, allyDifficulty: 'normal', enemyDifficulty: 'normal' });
      for (const team of [0, 1]) {
        const byPos = new Map(l.players.filter((p) => p.team === team).map((p) => [l.positions.get(p.pid)!, getHero(p.heroId).role]));
        expect(['assassin', 'fighter', 'tank']).toContain(byPos.get('jungle'));
        expect(byPos.get('mid')).toBe('mage');
        expect(byPos.get('bot')).toBe('marksman');
        expect(['support', 'tank']).toContain(byPos.get('roam'));
      }
      if (seed % 2) expect(l.positions.get(1)).toBe('bot');
    }
  });

  it('按定位分路：射手走发育路、法师走中路、辅助游走', () => {
    const pos = assignPositions(['qingling', 'lanxi', 'zhiying', 'lifeng', 'yeya']);
    expect(pos).toEqual(['bot', 'mid', 'roam', 'top', 'jungle']);
  });

  it('AI 不会替玩家下命令', () => {
    const { w, ai } = aiMatch(3, 'lifeng');
    const player = w.players.find((p) => !p.isAI)!;
    for (let i = 0; i < 30 * 40; i++) {
      const cmds = ai.think(w);
      expect(cmds.every((c) => !('pid' in c) || c.pid !== player.pid)).toBe(true);
      w.step(cmds);
      w.drainEvents();
    }
  });
});

describe('AI 只用本队视野', () => {
  it('草丛里的敌方英雄：认知层看不到，AI 也不会对它下命令', () => {
    const { w, ai } = aiMatch(7);
    w.step([]);
    // 找一片远离所有建筑的草丛
    const bush = w.map.bushes.find((b) => {
      const p = b.pts[0]!;
      return !w.list.some((t) => (t.kind === 'tower' || t.kind === 'crystal') && Math.hypot(t.pos.x - p.x, t.pos.y - p.y) < 16);
    })!;
    const c = bush.pts[0]!;
    const blue = w.list.find((u) => u.hero && u.team === 0)!;
    const red = w.list.find((u) => u.hero && u.team === 1)!;
    // 其他英雄都放回泉水，免得干扰
    for (const u of w.list) if (u.hero && u !== blue && u !== red) place(u, u.team === 0 ? 9 : 111, u.team === 0 ? 111 : 9);
    place(red, c.x, c.y);
    // 蓝方英雄站在草丛外 4~6 米处
    let spot = { x: c.x, y: c.y };
    for (let a = 0; a < 16; a++) {
      const r = 5;
      const p = { x: c.x + Math.cos((a / 16) * Math.PI * 2) * r, y: c.y + Math.sin((a / 16) * Math.PI * 2) * r };
      if (w.bushes.at(p.x, p.y) === 0 && w.nav.walkableAt(p)) {
        spot = p;
        break;
      }
    }
    place(blue, spot.x, spot.y);
    // 先让视野刷新一次
    for (let i = 0; i < 4; i++) {
      place(red, c.x, c.y);
      w.step([]);
    }
    const k = new TeamKnowledge(0);
    for (let i = 0; i < 90; i++) {
      // 双方英雄都固定在原地（红方不出手，蓝方不能走进草丛）
      place(red, c.x, c.y);
      place(blue, spot.x, spot.y);
      const cmds = ai.think(w).filter((cmd) => !('pid' in cmd) || w.heroOf(cmd.pid)?.team === 0);
      k.update(w);
      expect(visibleTo(red, 0)).toBe(false);
      expect(k.visibleEnemyHeroes(w).includes(red)).toBe(false);
      expect(cmds.some((cmd) => mentions(cmd, red.id))).toBe(false);
      w.step(cmds);
      w.drainEvents();
    }
    expect(k.lastSeen.has(red.id)).toBe(false);
  });

  it('看得见时会记录位置；离开视野后只保留最后一次看到的位置', () => {
    const { w } = aiMatch(2);
    const blue = w.list.find((u) => u.hero && u.team === 0)!;
    const red = w.list.find((u) => u.hero && u.team === 1)!;
    place(blue, 60, 60);
    place(red, 64, 60);
    for (let i = 0; i < 4; i++) w.step([]);
    const k = new TeamKnowledge(0);
    k.update(w);
    expect(k.lastSeen.get(red.id)?.pos).toEqual({ x: 64, y: 60 });
    // 移到视野外
    place(red, 100, 100);
    for (let i = 0; i < 4; i++) w.step([]);
    k.update(w);
    expect(k.lastSeen.get(red.id)?.pos).toEqual({ x: 64, y: 60 });
    expect(k.missingNear(w, { x: 60, y: 60 }, 10)).toBe(1);
  });
});

describe('预判瞄准', () => {
  it('按目标速度和弹道飞行时间预判落点', () => {
    const { w } = aiMatch(4);
    const self = w.list.find((u) => u.hero && u.team === 0)!;
    const t = w.list.find((u) => u.hero && u.team === 1)!;
    place(self, 50, 50);
    // 目标以 4 米/秒沿 +y 移动
    t.prevPos = { x: 56, y: 50 };
    t.pos = { x: 56, y: 50 + 4 * w.dt };
    const stage = getHero('yeya').skills[0];
    const diff = { ...DIFFICULTY.hard, aimError: 0 };
    const aim = aimAt(w, self, stage, t, diff, new Rng(1));
    expect(aim.k).toBe('dir');
    const d = Math.hypot(t.pos.x - self.pos.x, t.pos.y - self.pos.y);
    const time = stage.windup + d / 24;
    const px = t.pos.x;
    const py = t.pos.y + 4 * time;
    const len = Math.hypot(px - 50, py - 50);
    if (aim.k === 'dir') {
      expect(aim.x).toBeCloseTo((px - 50) / len, 5);
      expect(aim.y).toBeCloseTo((py - 50) / len, 5);
    }
    // 不预判的难度直接瞄当前位置
    const flat = aimAt(w, self, stage, t, { ...DIFFICULTY.easy, aimError: 0 }, new Rng(1));
    if (flat.k === 'dir') expect(flat.y).toBeCloseTo((t.pos.y - 50) / Math.hypot(6, t.pos.y - 50), 5);
  });

  it('瞄准误差随难度变化', () => {
    const { w } = aiMatch(4);
    const self = w.list.find((u) => u.hero && u.team === 0)!;
    const t = w.list.find((u) => u.hero && u.team === 1)!;
    place(self, 50, 50);
    place(t, 56, 50);
    const stage = getHero('lanxi').skills[0];
    const spread = (d: typeof DIFFICULTY.easy): number => {
      const rng = new Rng(9);
      let s = 0;
      for (let i = 0; i < 200; i++) {
        const a = aimAt(w, self, stage, t, d, rng);
        if (a.k === 'point') s += Math.hypot(a.x - 56, a.y - 50);
      }
      return s / 200;
    };
    expect(spread(DIFFICULTY.easy)).toBeGreaterThan(spread(DIFFICULTY.hard) * 3);
  });
});

describe('队伍计划', () => {
  it('Boss 刚被击杀、营地记录还没清理时，队伍计划不会出错', () => {
    const { w, ai } = aiMatch(5);
    const camp = w.camps.find((c) => c.kind === 'turtle')!;
    camp.spawnAt = 0;
    w.step([]);
    const boss = w.get(camp.ids[0]!)!;
    const blue = w.list.find((u) => u.hero && u.team === 0)!;
    // 敌方死 2 人：满足去打 Boss 的条件
    for (const e of w.list.filter((u) => u.hero && u.team === 1).slice(0, 2)) w.killUnit(e, blue);
    w.killUnit(boss, blue);
    while (w.tick % 30 !== 0) w.step([]);
    // 模拟“Boss 在这一帧死亡并被移除、营地记录下一帧才清理”的状态
    expect(w.get(boss.id)).toBeUndefined();
    camp.ids = [boss.id];
    expect(() => ai.think(w)).not.toThrow();
    expect(ai.plans[0].objective).not.toBe(boss.id);
  });

  it('人数领先时趁机推塔，敌方多人进攻己方塔时回防', () => {
    const { w, ai } = aiMatch(6);
    for (let i = 0; i < 30 * 200; i++) {
      w.step(ai.think(w));
      w.drainEvents();
    }
    const red = w.list.filter((u) => u.hero && u.team === 1 && u.alive);
    expect(red.length).toBeGreaterThanOrEqual(2);
    // 两个红方英雄出现在蓝方中路外塔下 → 回防
    const t = w.list.find((u) => u.kind === 'tower' && u.team === 0 && u.lane?.id === 'mid' && u.lane.idx === 0)!;
    const raiders = red.slice(0, 2);
    for (let i = 0; i < 31; i++) {
      raiders.forEach((u, j) => place(u, t.pos.x + 3 + j, t.pos.y - 3));
      w.step(ai.think(w));
    }
    expect(ai.plans[0].defendAt).toBe(t.id);
    // 红方只剩 1 人 → 蓝方趁复活时间推塔
    for (const e of w.list.filter((u) => u.hero && u.team === 1 && u.alive).slice(1)) w.killUnit(e, null);
    for (const e of w.list.filter((u) => u.hero && u.team === 1 && u.alive)) place(e, 111, 9);
    while (w.tick % 30 !== 0) w.step([]);
    ai.think(w);
    expect(w.list.filter((u) => u.hero && u.team === 0 && u.alive).length).toBeGreaterThanOrEqual(3);
    expect(ai.plans[0].push).toBe(true);
    expect(ai.plans[0].groupLane).not.toBeNull();
    expect(ai.plans[0].defendAt).toBe(0);
  });
});

describe('完整 AI 对局', () => {
  it('同一种子两次对打结果完全一致（确定性）', () => {
    const run = (): string => {
      const { w, ai } = aiMatch(11);
      for (let i = 0; i < 30 * 90; i++) {
        w.step(ai.think(w));
        w.drainEvents();
      }
      return w.snapshot();
    };
    expect(run()).toBe(run());
  });

  it('10 个 AI 对打能在 25 分钟内分出胜负，并且会补刀、打野、击杀、推塔', { timeout: 120_000 }, () => {
    const { w, ai } = aiMatch(1);
    let heroKills = 0;
    let towers = 0;
    let monsters = 0;
    const isMonster = new Set<number>();
    while (w.winner === null && w.time < 25 * 60) {
      for (const u of w.list) if (u.kind === 'monster') isMonster.add(u.id);
      w.step(ai.think(w));
      for (const e of w.drainEvents()) {
        if (e.t === 'kill') heroKills++;
        if (e.t === 'death') {
          const v = w.get(e.unit);
          if (v?.kind === 'tower') towers++;
          if (isMonster.has(e.unit) && w.get(e.killer)?.hero) monsters++;
        }
      }
    }
    expect(w.winner).not.toBeNull();
    expect(w.time / 60).toBeGreaterThan(6);
    expect(heroKills).toBeGreaterThan(3);
    expect(towers).toBeGreaterThanOrEqual(3);
    expect(monsters).toBeGreaterThan(5);
    const cs = w.list.filter((u) => u.hero).reduce((s, u) => s + u.hero!.lastHits, 0);
    expect(cs).toBeGreaterThan(100);
    // 每个 AI 都买了装备、升了级（游走位经验少一些）
    for (const p of w.players) {
      const u = w.get(p.unitId)!;
      expect(u.hero!.items.length).toBeGreaterThan(0);
      expect(u.hero!.level).toBeGreaterThanOrEqual(ai.brainOf(u.id)?.position === 'roam' ? 4 : 6);
    }
  });
});

describe('信号系统（对标手游）', () => {
  function setup(): { w: World; ai: AIDirector; me: Unit; mates: Unit[] } {
    const { w, ai } = aiMatch(12, 'lifeng');
    for (let i = 0; i < 30 * 30; i++) {
      w.step(ai.think(w));
      w.drainEvents();
    }
    const me = w.heroOf(1)!;
    const mates = w.list.filter((u) => u.hero && u.team === 0 && u !== me);
    return { w, ai, me, mates };
  }

  it('玩家发“集合”：附近的 AI 队友响应并赶往信号点', () => {
    const { w, ai, me, mates } = setup();
    const spot = { x: 40, y: 80 };
    place(me, spot.x, spot.y);
    mates.forEach((m, i) => place(m, 50 + i * 3, 75));
    const d0 = mates.map((m) => Math.hypot(m.pos.x - spot.x, m.pos.y - spot.y));
    w.step([{ t: 'signal', pid: 1, kind: 'gather', x: spot.x, y: spot.y }]);
    for (let i = 0; i < 30 * 4; i++) {
      place(me, spot.x, spot.y);
      w.step(ai.think(w));
    }
    const rallied = mates.filter((m) => ai.brainOf(m.id)!.goal === 'rally').length;
    expect(rallied).toBeGreaterThanOrEqual(3);
    const closer = mates.filter((m, i) => Math.hypot(m.pos.x - spot.x, m.pos.y - spot.y) < d0[i]! - 4).length;
    expect(closer).toBeGreaterThanOrEqual(3);
  });

  it('玩家发“撤退”：身边的 AI 队友撤退', () => {
    const { w, ai, me, mates } = setup();
    place(me, 60, 60);
    mates.forEach((m, i) => place(m, 58 + i, 62));
    w.step([{ t: 'signal', pid: 1, kind: 'retreat', x: 60, y: 60 }]);
    for (let i = 0; i < 30; i++) w.step(ai.think(w));
    expect(mates.filter((m) => ai.brainOf(m.id)!.goal === 'retreat').length).toBeGreaterThanOrEqual(3);
  });

  it('玩家对敌方英雄出手：附近的 AI 队友过来支援', () => {
    const { w, ai, me, mates } = setup();
    const foe = w.list.find((u) => u.hero && u.team === 1)!;
    place(me, 60, 60);
    place(foe, 62, 58);
    mates.forEach((m, i) => place(m, 50 + i * 2, 72));
    for (let i = 0; i < 30 * 2; i++) {
      place(foe, 62, 58);
      foe.hp = foe.stats.maxHp;
      w.step([...ai.think(w), { t: 'attackUnit', pid: 1, id: foe.id }]);
    }
    expect(ai.plans[0].rally?.kind).toBe('attack');
    expect(mates.filter((m) => ['rally', 'fight'].includes(ai.brainOf(m.id)!.goal)).length).toBeGreaterThanOrEqual(2);
  });

  it('同一个人 2 秒内只能发一次信号；信号只属于本队', () => {
    const { w } = aiMatch(3, 'lifeng');
    w.step([{ t: 'signal', pid: 1, kind: 'attack', x: 1, y: 1 }]);
    w.step([{ t: 'signal', pid: 1, kind: 'gather', x: 1, y: 1 }]);
    expect(w.signals.filter((s) => s.from === w.heroOf(1)!.id)).toHaveLength(1);
    expect(w.signals[0]!.team).toBe(0);
  });

  it('AI 队友会用信号告诉玩家队伍计划（例如回防）', () => {
    const { w, ai } = setup();
    const t = w.list.find((u) => u.kind === 'tower' && u.team === 0 && u.lane?.id === 'mid' && u.lane.idx === 0)!;
    const raiders = w.list.filter((u) => u.hero && u.team === 1 && u.alive).slice(0, 2);
    let said = false;
    for (let i = 0; i < 40 && !said; i++) {
      raiders.forEach((u, j) => place(u, t.pos.x + 3 + j, t.pos.y - 3));
      w.step(ai.think(w));
      said = w.drainEvents().some((e) => e.t === 'signal' && e.team === 0 && e.topic === 'defend');
    }
    expect(said).toBe(true);
  });
});
