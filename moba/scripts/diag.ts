/**
 * 单局时间线诊断：每 90 秒打印双方剩余塔数、人头、小兵数和每个 AI 的当前目标。
 *
 * 用法：npx tsx scripts/diag.ts 种子
 */
import { AIDirector, makeLineup } from '../src/sim/ai/director';
import { World } from '../src/sim/world';
import { GOAL_NAMES } from '../src/sim/ai/brain';
import { getHero } from '../src/data/heroes';
const seed = Number(process.argv[2] ?? 1);
const lineup = makeLineup({ seed, allyDifficulty: 'normal', enemyDifficulty: 'normal' });
const w = new World({ seed, mode: 'match', players: lineup.players });
const ai = new AIDirector(w, lineup.difficulties, lineup.positions);
for (let i = 0; i < 30 * 60 * 25 && w.winner === null; i++) {
  w.step(ai.think(w));
  w.drainEvents();
  if (w.tick % (30 * 90) === 0) {
    const towers = [0, 1].map((t) => w.list.filter((u) => u.kind === 'tower' && u.team === t && u.alive).length);
    const kills = [0, 1].map((t) => w.list.filter((u) => u.hero && u.team === t).reduce((s, u) => s + u.hero!.kills, 0));
    const goals = ai.brains.map((b) => { const u = w.get(b.unitId)!; return `${getHero(u.defId).name}${u.team}${b.position[0]}:${GOAL_NAMES[b.goal]}${u.alive ? '' : '(死)'}L${u.hero!.level}`; }).join(' ');
    const minions = [0, 1].map((t) => w.list.filter((u) => u.kind === 'minion' && u.team === t).length);
    console.log(`${(w.time / 60).toFixed(1)}分 塔${towers} 人头${kills} 兵${minions} | ${goals}`);
  }
}
console.log('winner', w.winner, (w.time / 60).toFixed(1));
