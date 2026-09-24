import { describe, expect, it } from 'vitest';
import { summarize } from '../src/sim/summary';
import { World, type PlayerConfig } from '../src/sim/world';
import { applyDamage } from '../src/sim/damage';
import { runEffects, makeCtx } from '../src/sim/skills/effects';

const players: PlayerConfig[] = [
  { pid: 1, team: 0, heroId: 'lifeng', name: '玩家', isAI: false },
  { pid: 2, team: 0, heroId: 'zhiying', name: '蓝方 AI', isAI: true },
  { pid: 3, team: 1, heroId: 'yeya', name: '红方 AI', isAI: true },
  { pid: 4, team: 1, heroId: 'duoshan', name: '红方 AI', isAI: true },
];

function world(): World {
  return new World({ seed: 1, mode: 'match', players });
}

describe('结算与 MVP', () => {
  it('胜方表现最好的是 MVP，败方表现最好的是败方 MVP', () => {
    const w = world();
    const h = (pid: number) => w.heroOf(pid)!.hero!;
    Object.assign(h(1), { kills: 8, deaths: 1, assists: 3, damageDealt: 30000, goldEarned: 9000 });
    Object.assign(h(2), { kills: 0, deaths: 3, assists: 9, damageDealt: 6000, goldEarned: 5000, support: 8000 });
    Object.assign(h(3), { kills: 2, deaths: 5, assists: 1, damageDealt: 12000, goldEarned: 6000 });
    Object.assign(h(4), { kills: 2, deaths: 3, assists: 2, damageDealt: 9000, damageTaken: 40000, goldEarned: 6500 });
    w.winner = 0;
    const s = summarize(w);
    expect(s.winner).toBe(0);
    expect(s.kills).toEqual([8, 4]);
    const byPid = new Map(s.players.map((p) => [p.pid, p]));
    expect(byPid.get(1)!.mvp).toBe('win');
    expect(byPid.get(2)!.mvp).toBeNull();
    expect(s.players.filter((p) => p.mvp === 'lose')).toHaveLength(1);
    // 参团率 = (击杀 + 助攻) / 全队击杀
    expect(byPid.get(1)!.kp).toBeCloseTo(11 / 8);
    expect(byPid.get(2)!.kp).toBeCloseTo(9 / 8);
    for (const p of s.players) {
      expect(p.score).toBeGreaterThanOrEqual(1);
      expect(p.score).toBeLessThanOrEqual(16);
    }
  });

  it('没有分出胜负时不评 MVP', () => {
    const s = summarize(world());
    expect(s.players.every((p) => p.mvp === null)).toBe(true);
  });

  it('统计推塔伤害与给队友的治疗护盾', () => {
    const w = world();
    const me = w.heroOf(1)!;
    const mate = w.heroOf(2)!;
    const tower = w.list.find((u) => u.kind === 'tower' && u.team === 1 && u.lane?.id === 'mid' && u.lane.idx === 0)!;
    applyDamage(w, me, tower, 500, 'true');
    expect(me.hero!.towerDamage).toBeGreaterThan(0);
    mate.hp = mate.stats.maxHp - 300;
    runEffects(w, [{ t: 'heal', amount: { base: [200] }, to: 'target' }], makeCtx(me, { targetId: mate.id, rank: 1 }));
    runEffects(w, [{ t: 'shield', amount: { base: [150] }, duration: 3, to: 'target' }], makeCtx(me, { targetId: mate.id, rank: 1 }));
    // 给自己的治疗不算
    me.hp = me.stats.maxHp - 300;
    runEffects(w, [{ t: 'heal', amount: { base: [200] }, to: 'self' }], makeCtx(me, { rank: 1 }));
    expect(me.hero!.support).toBeCloseTo(350);
  });
});
