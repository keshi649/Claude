/**
 * 无界面模拟：10 个 AI 快速对打多局，输出胜率、平均时长、各英雄 KDA，用来调数值。
 *
 * 用法：npm run sim -- --games 20 --blue normal --red normal --seed 1 --max 25
 */
import { getHero } from '../src/data/heroes';
import { AIDirector, makeLineup } from '../src/sim/ai/director';
import type { Difficulty } from '../src/sim/ai/difficulty';
import { World } from '../src/sim/world';

function arg(name: string, def: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1]! : def;
}

const games = Number(arg('games', '10'));
const blue = arg('blue', 'normal') as Difficulty;
const red = arg('red', 'normal') as Difficulty;
const seed0 = Number(arg('seed', '1'));
const maxMin = Number(arg('max', '25'));
const verbose = process.argv.includes('--verbose');

interface HeroStat {
  games: number;
  wins: number;
  k: number;
  d: number;
  a: number;
  cs: number;
  gold: number;
}
const heroStats = new Map<string, HeroStat>();
const results: { winner: number | null; minutes: number }[] = [];
const t0 = Date.now();

export interface GameResult {
  winner: number | null;
  minutes: number;
  world: World;
}

export function playOne(seed: number, blueD: Difficulty, redD: Difficulty, maxMinutes: number): GameResult {
  const lineup = makeLineup({ seed, allyDifficulty: blueD, enemyDifficulty: redD });
  const w = new World({ seed, mode: 'match', players: lineup.players });
  const ai = new AIDirector(w, lineup.difficulties, lineup.positions);
  const maxTicks = maxMinutes * 60 * 30;
  while (w.winner === null && w.tick < maxTicks) {
    w.step(ai.think(w));
    w.drainEvents(); // 无界面运行时没人消费事件，及时清掉
  }
  return { winner: w.winner, minutes: w.time / 60, world: w };
}

for (let g = 0; g < games; g++) {
  const seed = seed0 + g;
  const r = playOne(seed, blue, red, maxMin);
  results.push({ winner: r.winner, minutes: r.minutes });
  for (const u of r.world.list) {
    if (!u.hero) continue;
    const s = heroStats.get(u.defId) ?? { games: 0, wins: 0, k: 0, d: 0, a: 0, cs: 0, gold: 0 };
    s.games++;
    if (r.winner === u.team) s.wins++;
    s.k += u.hero.kills;
    s.d += u.hero.deaths;
    s.a += u.hero.assists;
    s.cs += u.hero.lastHits;
    s.gold += u.hero.goldEarned;
    heroStats.set(u.defId, s);
  }
  if (verbose) {
    const k = [0, 1].map((t) => r.world.list.filter((u) => u.hero && u.team === t).reduce((s, u) => s + u.hero!.kills, 0));
    const towers = [0, 1].map((t) => r.world.list.filter((u) => u.kind === 'tower' && u.team === t && !u.alive).length);
    console.log(`第 ${g + 1} 局 种子 ${seed}：${r.winner === null ? '超时' : r.winner === 0 ? '蓝方胜' : '红方胜'}  ${r.minutes.toFixed(1)} 分钟  人头 ${k[0]}:${k[1]}  被推塔 ${towers[0]}:${towers[1]}`);
  }
}

const finished = results.filter((r) => r.winner !== null);
const blueWins = results.filter((r) => r.winner === 0).length;
const avg = finished.reduce((s, r) => s + r.minutes, 0) / Math.max(1, finished.length);
console.log(`\n共 ${games} 局（蓝方 ${blue} vs 红方 ${red}），耗时 ${((Date.now() - t0) / 1000).toFixed(1)} 秒`);
console.log(`蓝方胜率 ${((blueWins / games) * 100).toFixed(1)}%  红方胜率 ${(((finished.length - blueWins) / games) * 100).toFixed(1)}%  超时 ${games - finished.length} 局`);
console.log(`平均时长 ${avg.toFixed(1)} 分钟（最短 ${Math.min(...finished.map((r) => r.minutes)).toFixed(1)}，最长 ${Math.max(...finished.map((r) => r.minutes)).toFixed(1)}）`);
console.log('\n英雄        出场  胜率    场均 K/D/A        场均补刀  场均经济');
for (const [id, s] of [...heroStats.entries()].sort((a, b) => b[1].wins / b[1].games - a[1].wins / a[1].games)) {
  const n = s.games;
  const name = getHero(id).name.padEnd(4, '　');
  console.log(
    `${name}  ${String(n).padStart(4)}  ${((s.wins / n) * 100).toFixed(0).padStart(3)}%   ${(s.k / n).toFixed(1).padStart(4)}/${(s.d / n).toFixed(1).padStart(4)}/${(s.a / n).toFixed(1).padStart(4)}    ${(s.cs / n).toFixed(0).padStart(4)}     ${(s.gold / n).toFixed(0).padStart(5)}`,
  );
}
