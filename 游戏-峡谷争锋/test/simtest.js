// 电脑打电脑，快速跑完整局，看对局时长、谁赢、击杀、塔、经济、有没有人卡住。
// 用法：node test/simtest.js [局数=6] [难度=1] [种子起点=1] [--verbose]
const fs = require('fs'), path = require('path'), vm = require('vm');
const src = ['data.js', 'sim.js', 'ai.js'].map(f => fs.readFileSync(path.join(__dirname, '../src', f), 'utf8')).join('\n');
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const N = +(args[0] || 6), DIFFI = +(args[1] || 1), SEED0 = +(args[2] || 1);
const verbose = process.argv.includes('--verbose');

function load() {
  const ctx = { console, Math, JSON, Map, Set, Array, Object, Number, String, Uint8Array, Uint32Array, Int32Array, Float32Array };
  vm.createContext(ctx);
  vm.runInContext(src + '\n;this.newWorld = newWorld; this.step = step; this.HEROES = HEROES; this.W_ = null;', ctx);
  return ctx;
}
const G = load();
const ids = G.HEROES.map(h => h.id);
const fmt = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const results = [];
for (let g = 0; g < N; g++) {
  const seed = SEED0 + g;
  // 每队 5 个：6 个英雄里随机去掉一个
  let s = seed * 7919;
  const pick = () => { s = (s * 16807) % 2147483647; return s; };
  const drop = [pick() % 6, pick() % 6];
  const blue = ids.filter((_, i) => i !== drop[0]), red = ids.filter((_, i) => i !== drop[1]);
  const W = G.newWorld({ blue, red, player: -1, diff: DIFFI, seed });
  const dt = 1 / 30;
  const log = [];
  const stuck = {};
  let lastPos = {};
  const t0 = Date.now();
  let towerLog = [];
  while (W.winner < 0 && W.t < 40 * 60) {
    G.step(W, dt);
    for (const e of W.ev) {
      if (e.t === 'tower') towerLog.push(`${fmt(W.t)} ${e.team ? '红' : '蓝'}${['上', '中', '下'][e.lane]}${e.tier + 1}塔`);
      if (e.t === 'kill' && verbose) log.push(`${fmt(W.t)} kill ${e.k}→${e.v}${e.multi > 1 ? ' x' + e.multi : ''}`);
      if (e.t === 'dragon') towerLog.push(`${fmt(W.t)} ${e.team ? '红' : '蓝'}拿${e.mt === 'lord' ? '大龙' : '小龙'}`);
    }
    W.ev.length = 0;
    // 卡住检测：每 10 秒看一次，活着、不在泉水、10 秒没动 30 以上
    if (Math.floor(W.t / 10) !== Math.floor((W.t - dt) / 10)) {
      for (const h of W._heroes) {
        const lp = lastPos[h.id];
        // 想走（有目的地且离目的地还远）却 10 秒没挪窝
        const g = h.cmd && h.cmd.goto;
        if (lp && !h.dead && !lp.dead && g && lp.g && Math.hypot(g[0] - lp.g[0], g[1] - lp.g[1]) < 50 && Math.hypot(h.x - lp.x, h.y - lp.y) < 30 && Math.hypot(g[0] - h.x, g[1] - h.y) > 80) {
          stuck[h.id] = (stuck[h.id] || 0) + 1;
          if (verbose) console.log(`   stuck ${h.hid}${h.team} at ${Math.round(h.x)},${Math.round(h.y)} -> ${Math.round(g[0])},${Math.round(g[1])} mode ${h.ai.mode} t=${fmt(W.t)}`);
        }
        lastPos[h.id] = { x: h.x, y: h.y, dead: h.dead, g: h.cmd && h.cmd.goto ? h.cmd.goto.slice() : null };
      }
    }
  }
  const ms = Date.now() - t0;
  const hs = W._heroes;
  const line = hs.map(h => `${h.team ? 'R' : 'B'}:${h.hid.slice(0, 4)} L${h.lvl} ${h.kills}/${h.deaths}/${h.assists} g${Math.round(h.goldTotal)} it${h.items.length} cs${h.cs}${stuck[h.id] ? ' STUCK' + stuck[h.id] : ''}`);
  results.push({ seed, winner: W.winner, t: W.t, kills: W.kills.slice(), towers: W.towersLost.slice() });
  console.log(`#${seed} ${W.winner === 0 ? '蓝胜' : W.winner === 1 ? '红胜' : '超时'} ${fmt(W.t)}  击杀 ${W.kills[0]}:${W.kills[1]}  掉塔 蓝${W.towersLost[0]} 红${W.towersLost[1]}  (${ms} ms)`);
  console.log('   ' + line.slice(0, 5).join(' | '));
  console.log('   ' + line.slice(5).join(' | '));
  if (verbose) console.log('   ' + towerLog.join(', '));
  if (verbose) console.log('   ' + log.slice(0, 40).join(', '));
}
const ts = results.map(r => r.t).sort((a, b) => a - b);
console.log(`\n${N} 局：蓝胜 ${results.filter(r => r.winner === 0).length}，红胜 ${results.filter(r => r.winner === 1).length}，超时 ${results.filter(r => r.winner < 0).length}；时长中位数 ${fmt(ts[ts.length >> 1])}，最短 ${fmt(ts[0])}，最长 ${fmt(ts[ts.length - 1])}；平均击杀 ${(results.reduce((s, r) => s + r.kills[0] + r.kills[1], 0) / N).toFixed(1)}`);
