import { expect, it } from 'vitest';
import { World } from '../src/sim/world';
import type { Command } from '../src/sim/commands';
import type { Unit } from '../src/sim/entity';

/**
 * 验收：一个人（没有敌方英雄）跟着己方兵线推中路，能推掉敌方水晶获胜。
 * 用一个极简脚本代替真人操作：兵线到塔下才上去打塔，血少了回城。
 */
it('单人沿中路推塔，能摧毁敌方水晶获胜', () => {
  const w = new World({ seed: 5, mode: 'match', players: [{ pid: 1, team: 0, heroId: 'lifeng', name: '玩家', isAI: false }] });
  const hero = w.heroOf(1)!;
  const order = (u: Unit): number => (u.kind === 'crystal' ? 3 : u.lane!.idx);
  let retreat = false;
  let lastCmd = '';
  for (let i = 0; i < 30 * 60 * 15 && w.winner === null; i++) {
    const cmds: Command[] = [];
    const h = hero.hero!;
    while (h.skillPoints > 0 && cmds.length < 3) cmds.push({ t: 'levelSkill', pid: 1, slot: (h.level >= 4 ? 2 : i % 2) as 0 | 1 | 2 });
    // 像真人一样用“推荐购买”买装备
    if (i % 30 === 0) cmds.push({ t: 'buyRecommended', pid: 1 });
    if (hero.alive) {
      const targets = w.list
        .filter((u) => u.team === 1 && u.alive && (u.kind === 'crystal' || (u.kind === 'tower' && u.lane?.id === 'mid')))
        .sort((a, b) => order(a) - order(b));
      const t = targets[0]!;
      if (hero.hp < hero.stats.maxHp * 0.3) retreat = true;
      if (hero.hp >= hero.stats.maxHp * 0.95) retreat = false;
      const dist = Math.hypot(hero.pos.x - t.pos.x, hero.pos.y - t.pos.y);
      const tanks = w.list.filter((m) => m.kind === 'minion' && m.team === 0 && m.alive && Math.hypot(m.pos.x - t.pos.x, m.pos.y - t.pos.y) < t.stats.range + 1);
      let key: string;
      if (retreat) {
        key = 'home';
        if (lastCmd !== key) cmds.push({ t: 'moveTo', pid: 1, x: w.map.spawn[0].x, y: w.map.spawn[0].y });
      } else if (tanks.length >= 2 || (t.kind === 'crystal' && tanks.length >= 1)) {
        key = 'push' + t.id;
        if (dist > 3) cmds.push({ t: 'moveTo', pid: 1, x: t.pos.x - 2, y: t.pos.y + 2 });
        else cmds.push({ t: 'attack', pid: 1, mode: 'tower' });
      } else {
        key = 'wait' + t.id;
        const k = (t.stats.range + 4) / Math.SQRT2;
        if (lastCmd !== key) cmds.push({ t: 'moveTo', pid: 1, x: t.pos.x - k, y: t.pos.y + k });
        // 只打敌方小兵（不去招惹野怪），有兵时放技能清线
        const enemyMinion = w.list.some((m) => m.kind === 'minion' && m.team === 1 && m.alive && Math.hypot(m.pos.x - hero.pos.x, m.pos.y - hero.pos.y) < 5);
        if (enemyMinion) {
          cmds.push({ t: 'attack', pid: 1, mode: 'auto' });
          if (i % 30 === 0) cmds.push({ t: 'cast', pid: 1, slot: 1, aim: { k: 'auto' } });
          if (i % 45 === 0) cmds.push({ t: 'cast', pid: 1, slot: 0, aim: { k: 'auto' } });
        }
      }
      lastCmd = key;
    }
    w.step(cmds);
  }
  const mins = w.time / 60;
  console.log(`胜者 ${w.winner}，用时 ${mins.toFixed(1)} 分钟，等级 ${hero.hero!.level}，死亡 ${hero.hero!.deaths}，补刀 ${hero.hero!.lastHits}`);
  expect(w.winner).toBe(0);
  expect(mins).toBeLessThan(15);
}, 120_000);
