'use strict';
/* sim.js：对局逻辑（不碰 DOM），浏览器和 node 测试共用。
   W（world）里只放能 JSON 化的数据：单位之间用 id 互相引用；下划线开头的字段是缓存（relink() 重建）。
   一帧：step(W, dt) —— 刷兵、野怪、建筑、小兵、英雄（玩家的指令 / 电脑的指令都在 h.cmd 里）、弹道、地面效果。
   给画面和声音的消息放在 W.ev 里，由外面取走清空。 */

/* ---------- 随机数（种子存在 W.seed 里，存档后接着算） ---------- */
function rnd(W) {
  let a = (W.seed = (W.seed + 0x6D2B79F5) | 0);
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const edge = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) - a.r - b.r;   // 两个单位边缘之间的距离

/* ---------- 碰撞格 ---------- */
const GRID = { blocked: null, wall: null, bush: null };
function shapeCells(s, pad, fn) {           // 形状（外扩 pad）盖住的格子
  const bb = s.c ? [s.c[0] - s.c[2], s.c[1] - s.c[2], s.c[0] + s.c[2], s.c[1] + s.c[2]]
    : [Math.min(s.k[0], s.k[2]) - s.k[4], Math.min(s.k[1], s.k[3]) - s.k[4], Math.max(s.k[0], s.k[2]) + s.k[4], Math.max(s.k[1], s.k[3]) + s.k[4]];
  const i0 = clamp(Math.floor((bb[0] - pad) / CELL), 0, GN - 1), i1 = clamp(Math.floor((bb[2] + pad) / CELL), 0, GN - 1);
  const j0 = clamp(Math.floor((bb[1] - pad) / CELL), 0, GN - 1), j1 = clamp(Math.floor((bb[3] + pad) / CELL), 0, GN - 1);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const d = shapeDist(s, (i + 0.5) * CELL, (j + 0.5) * CELL);
    if (d < pad) fn(j * GN + i, d);
  }
}
function initGrid() {
  if (GRID.wall) return;
  const b = new Uint8Array(GN * GN), bu = new Uint8Array(GN * GN);
  const lim = BORDER + INFL;
  for (let j = 0; j < GN; j++) for (let i = 0; i < GN; i++) {
    const x = (i + 0.5) * CELL, y = (j + 0.5) * CELL;
    if (x < lim || y < lim || x > L - lim || y > L - lim) b[j * GN + i] = 1;
  }
  for (const s of WALLS) shapeCells(s, INFL, k => { b[k] = 1; });
  BUSHES.forEach((s, n) => shapeCells(s, 0, k => { if (!bu[k]) bu[k] = n + 1; }));
  for (let k = 0; k < GN * GN; k++) if (b[k]) bu[k] = 0;
  GRID.wall = b; GRID.blocked = b.slice(); GRID.bush = bu;
}
function markStructs(W) {                   // 活着的塔、水晶占住格子
  GRID.blocked.set(GRID.wall);
  for (const u of W.units) if ((u.kind === 'tower' || u.kind === 'crystal') && !u.dead) blockStruct(u, true);
}
function blockStruct(u, on) {
  shapeCells({ c: [u.x, u.y, u.r - 6] }, INFL, k => { GRID.blocked[k] = on ? 1 : GRID.wall[k]; });
}
function walk(x, y) {
  if (!(x >= 0 && y >= 0 && x < L && y < L)) return false;
  return !GRID.blocked[((y / CELL) | 0) * GN + ((x / CELL) | 0)];
}
function bushOf(x, y) {
  if (!(x >= 0 && y >= 0 && x < L && y < L)) return 0;
  return GRID.bush[((y / CELL) | 0) * GN + ((x / CELL) | 0)];
}
function los(x0, y0, x1, y1) {
  const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / 12);
  for (let s = 1; s <= n; s++) { const t = s / n; if (!walk(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)) return false; }
  return true;
}
function nearestWalk(x, y) {               // 最近的能走的点（被挤进墙里、闪现进墙时用）
  if (walk(x, y)) return [x, y];
  const ci = clamp((x / CELL) | 0, 0, GN - 1), cj = clamp((y / CELL) | 0, 0, GN - 1);
  for (let rad = 1; rad < 40; rad++) {
    let best = null, bd = 1e9;
    for (let j = cj - rad; j <= cj + rad; j++) for (let i = ci - rad; i <= ci + rad; i++) {
      if (Math.max(Math.abs(i - ci), Math.abs(j - cj)) !== rad) continue;
      if (i < 0 || j < 0 || i >= GN || j >= GN || GRID.blocked[j * GN + i]) continue;
      const px = (i + 0.5) * CELL, py = (j + 0.5) * CELL, d = (px - x) ** 2 + (py - y) ** 2;
      if (d < bd) { bd = d; best = [px, py]; }
    }
    if (best) return best;
  }
  return [x, y];
}

/* ---------- A* 寻路（8 方向，不切墙角），结果拉直 ---------- */
const AS = { g: null, from: null, stamp: null, closed: null, cur: 0, hf: null, hi: null };
function findPath(sx, sy, tx, ty) {
  const N = GN * GN;
  if (!AS.g) { AS.g = new Float32Array(N); AS.from = new Int32Array(N); AS.stamp = new Uint32Array(N); AS.closed = new Uint32Array(N); AS.hf = new Float32Array(N * 2); AS.hi = new Int32Array(N * 2); }
  const s = nearestWalk(sx, sy), t = nearestWalk(tx, ty);
  const si = (s[0] / CELL) | 0, sj = (s[1] / CELL) | 0, ti = (t[0] / CELL) | 0, tj = (t[1] / CELL) | 0;
  const start = sj * GN + si, goal = tj * GN + ti;
  const st = ++AS.cur, g = AS.g, from = AS.from, stamp = AS.stamp, closed = AS.closed, hf = AS.hf, hi = AS.hi;
  let hn = 0;
  const h = k => { const dx = Math.abs((k % GN) - ti), dy = Math.abs(((k / GN) | 0) - tj); return (dx + dy) + (1.4142 - 2) * Math.min(dx, dy); };
  const push = (k, f) => { let i = hn++; while (i > 0) { const p = (i - 1) >> 1; if (hf[p] <= f) break; hf[i] = hf[p]; hi[i] = hi[p]; i = p; } hf[i] = f; hi[i] = k; };
  const pop = () => {
    const top = hi[0], lf = hf[--hn], lk = hi[hn]; let i = 0;
    for (;;) { let c = 2 * i + 1; if (c >= hn) break; if (c + 1 < hn && hf[c + 1] < hf[c]) c++; if (hf[c] >= lf) break; hf[i] = hf[c]; hi[i] = hi[c]; i = c; }
    hf[i] = lf; hi[i] = lk; return top;
  };
  stamp[start] = st; g[start] = 0; from[start] = -1; push(start, h(start));
  let found = false, iter = 0;
  const B = GRID.blocked;
  while (hn > 0 && iter++ < 30000) {
    const k = pop();
    if (closed[k] === st) continue;
    closed[k] = st;
    if (k === goal) { found = true; break; }
    const ki = k % GN, kj = (k / GN) | 0;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      if (!di && !dj) continue;
      const ni = ki + di, nj = kj + dj;
      if (ni < 0 || nj < 0 || ni >= GN || nj >= GN) continue;
      const n = nj * GN + ni;
      if (B[n] || closed[n] === st) continue;
      if (di && dj && (B[kj * GN + ni] || B[nj * GN + ki])) continue;
      const ng = g[k] + (di && dj ? 1.4142 : 1);
      if (stamp[n] !== st || ng < g[n]) { stamp[n] = st; g[n] = ng; from[n] = k; push(n, ng + h(n)); }
    }
  }
  if (!found) return null;
  const cells = [];
  for (let k = goal; k !== -1; k = from[k]) cells.push(k);
  cells.reverse();
  const pts = cells.map(k => [((k % GN) + 0.5) * CELL, (((k / GN) | 0) + 0.5) * CELL]);
  pts[pts.length - 1] = t;
  // 拉直：从当前点往后找最远的看得见的点
  const out = [];
  let cx = sx, cy = sy, i = 0;
  while (i < pts.length) {
    let j = pts.length - 1;
    while (j > i && !los(cx, cy, pts[j][0], pts[j][1])) j--;
    out.push(pts[j]); cx = pts[j][0]; cy = pts[j][1]; i = j + 1;
  }
  return out;
}

/* ---------- 空间分桶（找附近的单位） ---------- */
const BK = 250, BN = Math.ceil(L / BK);
function rebuildBk(W) {
  if (!W._bk) W._bk = Array.from({ length: BN * BN }, () => []);
  for (const b of W._bk) b.length = 0;
  for (const u of W.units) {
    if (u.dead) continue;
    const i = clamp((u.x / BK) | 0, 0, BN - 1), j = clamp((u.y / BK) | 0, 0, BN - 1);
    W._bk[j * BN + i].push(u);
  }
}
function near(W, x, y, r, fn) {           // 对中心在 r（加上单位半径）以内的活单位调用 fn(u, 距离)
  const i0 = clamp(((x - r - 90) / BK) | 0, 0, BN - 1), i1 = clamp(((x + r + 90) / BK) | 0, 0, BN - 1);
  const j0 = clamp(((y - r - 90) / BK) | 0, 0, BN - 1), j1 = clamp(((y + r + 90) / BK) | 0, 0, BN - 1);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    for (const u of W._bk[j * BN + i]) {
      if (u.dead) continue;
      const d = Math.hypot(u.x - x, u.y - y);
      if (d <= r + u.r) fn(u, d);
    }
  }
}
const byId = (W, id) => (id ? W._byId.get(id) : undefined);

/* ---------- 效果（眩晕、减速、护盾……都是 u.fx 里的一项） ---------- */
function addFx(u, k, t, v, src, tag) {
  if (tag) for (let i = 0; i < u.fx.length; i++) if (u.fx[i].tag === tag) { u.fx.splice(i, 1); break; }
  const f = { k, t, v: v || 0, s: src || 0 };
  if (tag) f.tag = tag;
  u.fx.push(f);
  return f;
}
function fxOn(u, k) { for (const f of u.fx) if (f.k === k) return f; return null; }
function fxSum(u, k) { let s = 0; for (const f of u.fx) if (f.k === k) s += f.v; return s; }
function fxMax(u, k) { let s = 0; for (const f of u.fx) if (f.k === k && f.v > s) s = f.v; return s; }
function clearFx(u, k) { for (let i = u.fx.length - 1; i >= 0; i--) if (u.fx[i].k === k) u.fx.splice(i, 1); }
const stunned = u => !!fxOn(u, 'stun');
const rooted = u => !!(fxOn(u, 'stun') || fxOn(u, 'root'));
const untarg = u => !!fxOn(u, 'untarg') || !!u.leap;
function shieldOf(u) { return fxSum(u, 'shield'); }

/* ---------- 新对局 ---------- */
// opt：{ blue: [5 个英雄 id], red: [...], player: 玩家在蓝队的第几个（-1 = 全是电脑）, diff: 0~2, seed }
function newWorld(opt) {
  initGrid();
  const W = {
    t: 0, seed: opt.seed || 12345, nextId: 1, units: [], projs: [], zones: [], ev: [],
    wave: 0, nextWave: WAVE_FIRST, kills: [0, 0], towersLost: [0, 0], winner: -1, endT: 0,
    firstBlood: false, diff: opt.diff == null ? 1 : opt.diff, playerId: 0,
    camps: [], superLane: [[0, 0, 0], [0, 0, 0]], said: {}, lordBuff: [0, 0], vanguard: [0, 0],
  };
  W._byId = new Map();
  // 建筑
  for (const team of [0, 1]) {
    const f = team ? mir : (p => p);
    for (let ln = 0; ln < 3; ln++) for (let tier = 0; tier < 3; tier++) {
      const p = f(TOWERS[ln][tier]), T = TOWER[tier];
      addUnit(W, { kind: 'tower', team, x: p[0], y: p[1], r: T.r, tier, lane: ln, hp: T.hp, maxHp: T.hp, ad: T.ad, arm: T.arm, mr: T.mr,
        range: T.range, asBase: T.as, inv: tier > 0, ramp: 0, rampId: 0, proj: 'tower' });
    }
    const c = f(CRYSTAL);
    addUnit(W, { kind: 'crystal', team, x: c[0], y: c[1], r: CRYSTAL_ST.r, hp: CRYSTAL_ST.hp, maxHp: CRYSTAL_ST.hp, ad: CRYSTAL_ST.ad,
      arm: CRYSTAL_ST.arm, mr: CRYSTAL_ST.mr, range: CRYSTAL_ST.range, asBase: CRYSTAL_ST.as, inv: true, ramp: 0, rampId: 0, proj: 'crystal', springCd: 0 });
  }
  // 野怪营地
  for (const side of [0, 1]) for (const c of CAMPS_BLUE) {
    const p = side ? mir(c.p) : c.p;
    W.camps.push({ type: c.type, x: p[0], y: p[1], side, respawnAt: MONSTER[c.type].first, uid: 0 });
  }
  for (const d of DRAGONS) W.camps.push({ type: d.type, x: d.p[0], y: d.p[1], side: -1, respawnAt: MONSTER[d.type].first, uid: 0 });
  // 英雄
  for (const team of [0, 1]) {
    const list = team ? opt.red : opt.blue;
    list.forEach((hid, k) => {
      const h = makeHero(W, hid, team, k);
      if (team === 0 && k === opt.player) { h.isPlayer = true; W.playerId = h.id; }
    });
  }
  // 电脑的分路：按英雄定位，重复的往空着的路上排
  for (const team of [0, 1]) assignLanes(W, team);
  markStructs(W);
  W._heroes = W.units.filter(u => u.kind === 'hero');
  rebuildBk(W);
  return W;
}
function relink(W) {                       // 读档后重建缓存
  W._byId = new Map();
  for (const u of W.units) W._byId.set(u.id, u);
  W._bk = null; W._ac = null; W._plan = null; markStructs(W); rebuildBk(W);
  W._heroes = W.units.filter(u => u.kind === 'hero');
}
function addUnit(W, o) {
  o.id = W.nextId++; o.fx = o.fx || []; o.dead = false; o.atkCd = 0; o.face = o.team === 1 ? -1 : 1; o.atkT = -9; o.hurtT = -9;
  W.units.push(o); W._byId.set(o.id, o);
  return o;
}
function spawnPoint(team, k) {
  const a = (20 + 12.5 * k) * Math.PI / 180;
  const p = [SPRING[0] + 200 * Math.cos(a), SPRING[1] - 200 * Math.sin(a)];
  return team ? mir(p) : p;
}
function makeHero(W, hid, team, k) {
  const d = HERO_BY_ID[hid], p = spawnPoint(team, k);
  const h = addUnit(W, {
    kind: 'hero', hid, team, slot: k, x: p[0], y: p[1], r: 26, lvl: 1, xp: 0, gold: START_GOLD, items: [],
    sk: [{ rank: 0, cd: 0 }, { rank: 0, cd: 0 }, { rank: 0, cd: 0 }],
    flashCd: 0, healCd: 0, recall: 0, kills: 0, deaths: 0, assists: 0, streak: 0, multi: 0, multiT: -99,
    dmgH: 0, dmgT: 0, goldTotal: START_GOLD, cs: 0, hitBy: {}, respawnAt: 0, revealT: -9, aggroT: -9, aggroV: 0,
    lastHurt: -9, lastHeroHurt: -9, atkN: 0, lock: 0, cmd: {}, path: null, pathGoal: null, pathT: -9, isPlayer: false,
    lane: d.lane, ai: { next: 0 }, proj: d.proj, hp: 1, maxHp: 1, z: 0, vx: 0, vy: 0,
  });
  applySkillRanks(h);
  heroStats(h, true);
  return h;
}
function assignLanes(W, team) {
  const hs = W.units.filter(u => u.kind === 'hero' && u.team === team);
  const used = new Set();
  for (const h of hs) { if (!used.has(h.lane)) used.add(h.lane); else h.lane = -1; }
  for (const h of hs) if (h.lane < 0) {
    for (const ln of [4, 3, 0, 2, 1]) if (!used.has(ln)) { h.lane = ln; used.add(ln); break; }
    if (h.lane < 0) h.lane = 4;
  }
}
function applySkillRanks(h) {
  const r = [0, 0, 0];
  for (let i = 0; i < h.lvl; i++) r[SKILL_ORDER[i]]++;
  for (let s = 0; s < 3; s++) h.sk[s].rank = r[s];
}
function heroStats(h, fill) {
  const d = HERO_BY_ID[h.hid], n = h.lvl - 1;
  const s = { hp: d.hp + d.hpG * n, ad: d.ad + d.adG * n, ap: 0, arm: d.arm + d.armG * n, mr: d.mr + d.mrG * n, as: d.asG * n,
    crit: 0, critd: 0, ls: 0, ms: d.ms, cdr: 0, apen: 0, mpen: 0, regen: d.regen + 0.7 * n, thorn: 0, frost: 0 };
  for (const it of h.items) { const I = ITEMS[it]; for (const k in s) if (typeof I[k] === 'number') s[k] += I[k]; }
  const old = h.maxHp;
  h.maxHp = s.hp; h.ad = s.ad; h.ap = s.ap; h.arm = s.arm; h.mr = s.mr; h.asPct = s.as; h.asBase = d.as;
  h.crit = Math.min(s.crit, 100); h.critd = s.critd; h.ls = s.ls; h.ms = s.ms; h.cdr = Math.min(s.cdr, 40); h.apen = s.apen; h.mpen = s.mpen;
  h.regen = s.regen; h.thorn = s.thorn; h.frost = s.frost; h.range = d.range;
  if (fill) h.hp = h.maxHp;
  else if (h.maxHp > old) h.hp += h.maxHp - old;
  h.hp = Math.min(h.hp, h.maxHp);
}

/* ---------- 属性 ---------- */
function asOf(u) {
  if (u.kind !== 'hero') return u.asBase;
  return Math.min(2.5, u.asBase * (1 + u.asPct / 100 + fxSum(u, 'asb')));
}
function msOf(W, u) {
  let ms = u.ms * (1 + fxSum(u, 'ms')) * (1 - Math.min(0.7, fxMax(u, 'slow')));
  if (u.kind === 'hero') {
    const sp = u.team ? mir(SPRING) : SPRING;
    if (Math.hypot(u.x - sp[0], u.y - sp[1]) < 1300) ms *= 1.35;   // 基地里跑得快
  }
  return ms;
}
function cdOf(h, s) {
  const d = HERO_BY_ID[h.hid].skills[s], r = h.sk[s].rank;
  const cdr = Math.min(0.45, h.cdr / 100 + (fxOn(h, 'blue') ? 0.2 : 0));
  return d.cd[Math.min(r, d.cd.length) - 1] * (1 - cdr);
}
function skv(arr, rank) { return arr[Math.min(rank, arr.length - 1)]; }

/* ---------- 伤害、治疗、死亡 ---------- */
// type：'p' 物理、'm' 法术、't' 真实；o：{atk: 普攻, crit, skill, force}
function hurt(W, src, dst, amt, type, o) {
  if (!dst || dst.dead || amt <= 0 || W.winner >= 0) return 0;
  if (untarg(dst) && !(o && o.force)) return 0;
  if (dst.inv || dst.reset) return 0;
  let a = amt;
  if (type === 'p') { let arm = dst.arm; if (src && src.apen) arm *= 1 - src.apen / 100; a *= 200 / (200 + Math.max(0, arm)); }
  else if (type === 'm') { let mr = dst.mr; if (src && src.mpen) mr *= 1 - src.mpen / 100; a *= 200 / (200 + Math.max(0, mr)); }
  if (dst.kind === 'hero' && dst.hid === 'tank') a *= dst.hp < dst.maxHp * 0.4 ? 0.75 : 0.9;
  if (src && src.kind === 'hero' && src.hid === 'assassin' && dst.kind === 'hero' && dst.hp < dst.maxHp * 0.4) a *= 1.2;
  if (dst.kind === 'tower' || dst.kind === 'crystal') {
    if (src && src.vsTower) a *= src.vsTower;
    if (src && src.kind === 'hero' && !minionNear(W, src.team, dst.x, dst.y, 900)) a *= 0.65;   // 没带兵时少掉血（防偷塔）
  }
  if (dst.kind === 'monster' && src && src.kind === 'hero') a *= src.lane === 3 ? 1.45 : 1.15;   // 打野打野怪多 45%
  if (src && src.kind === 'monster' && dst.kind === 'hero' && dst.lane === 3) a *= 0.65;
  let absorbed = 0;
  for (const f of dst.fx) if (f.k === 'shield' && a > 0 && f.v > 0) { const m = Math.min(f.v, a); f.v -= m; a -= m; absorbed += m; }
  dst.hp -= a;
  dst.hurtT = W.t;
  // 受击闪白：持续伤害不闪，两次闪之间至少隔 0.25 秒
  if (type !== 't' && W.t - (dst.flashT || -9) > 0.25) dst.flashT = W.t;
  const total = a + absorbed;
  if (src && src.kind === 'hero') {
    if (dst.kind === 'hero') { src.dmgH += total; dst.hitBy[src.id] = W.t; src.aggroT = W.t; src.aggroV = dst.id; dst.lastHeroHurt = W.t; }
    if (o && o.atk && src.ls) healUnit(W, src, total * src.ls / 100, true);
    if (src.hid === 'warrior') healUnit(W, src, total * 0.1, true);
    if (src.hid === 'mage' && o && o.skill && dst.kind === 'hero') addFx(src, 'ms', 2, 0.2, src.id, 'starms');
    src.revealT = W.t;
  }
  if (dst.kind === 'hero') {
    dst.lastHurt = W.t; dst.dmgT += a;
    if (dst.recall) { dst.recall = 0; W.ev.push({ t: 'recallX', id: dst.id }); }
    if (dst.thorn && src && o && o.atk && type === 'p' && src.kind !== 'tower' && src.kind !== 'crystal' && !src.dead)
      hurt(W, dst, src, total * dst.thorn / 100, 'm');
  }
  if (dst.kind === 'monster' && src && !dst.aggro) dst.aggro = src.id;
  if (dst.kind === 'monster' && src && src.kind === 'hero') dst.lastHeroHit = src.id;
  W.ev.push({ t: 'dmg', id: dst.id, x: dst.x, y: dst.y, v: total, ty: type, crit: !!(o && o.crit), src: src ? src.id : 0 });
  if (dst.hp <= 0) die(W, dst, src);
  return total;
}
function healUnit(W, u, v, quiet) {
  if (u.dead || v <= 0) return;
  const got = Math.min(v, u.maxHp - u.hp);
  u.hp += got;
  if (!quiet && got >= 15) W.ev.push({ t: 'heal', id: u.id, x: u.x, y: u.y, v: got });
}
function minionNear(W, team, x, y, r) {
  let f = false;
  near(W, x, y, r, u => { if (u.kind === 'minion' && u.team === team) f = true; });
  return f;
}
function killerHero(W, src) {
  if (!src) return null;
  if (src.kind === 'hero') return src;
  return null;
}
function die(W, u, src) {
  u.dead = true; u.hp = 0; u.dieT = W.t;
  const kh = killerHero(W, src);
  if (u.kind === 'hero') heroDied(W, u, kh, src);
  else if (u.kind === 'minion') minionDied(W, u, kh);
  else if (u.kind === 'monster') monsterDied(W, u, kh);
  else if (u.kind === 'tower') towerDied(W, u, kh);
  else if (u.kind === 'crystal') { W.winner = 1 - u.team; W.endT = W.t; W.ev.push({ t: 'end', winner: W.winner, x: u.x, y: u.y }); }
  u.fx.length = 0; u.dash = null; u.leap = null; u.chan = null;
  if (u.kind === 'tower') blockStruct(u, false);
  W.ev.push({ t: 'die', id: u.id, kind: u.kind, x: u.x, y: u.y, team: u.team, mt: u.mt, hid: u.hid, killer: kh ? kh.id : 0 });
  if (u.kind === 'minion') W._dirty = true;
}
function addGold(W, h, g, show) {
  h.gold += g; h.goldTotal += g;
  if (show) W.ev.push({ t: 'gold', id: h.id, v: Math.round(g), x: h.x, y: h.y });
}
function addXp(W, h, v) {
  if (h.lvl >= MAX_LVL) return;
  h.xp += v;
  let up = false;
  while (h.lvl < MAX_LVL && h.xp >= XP_NEED(h.lvl)) { h.xp -= XP_NEED(h.lvl); h.lvl++; up = true; }
  if (h.lvl >= MAX_LVL) h.xp = 0;
  if (up) { applySkillRanks(h); heroStats(h, false); h.hp = Math.min(h.maxHp, h.hp + h.maxHp * 0.05); W.ev.push({ t: 'lvl', id: h.id, lvl: h.lvl }); }
}
const heroesOf = (W, team) => W._heroes ? W._heroes.filter(h => h.team === team) : W.units.filter(u => u.kind === 'hero' && u.team === team);
function heroDied(W, v, k, src) {
  v.deaths++;
  v.respawnAt = W.t + RESPAWN(v.lvl, W.t);
  v.recall = 0; v.path = null;
  // 没有英雄补刀（塔、兵、野怪打死的）：最近 10 秒打过他的敌方英雄算击杀
  const recent = Object.keys(v.hitBy).map(Number).filter(id => W.t - v.hitBy[id] < 10)
    .map(id => byId(W, id)).filter(h => h && h.team !== v.team);
  if (!k && recent.length) { recent.sort((a, b) => v.hitBy[b.id] - v.hitBy[a.id]); k = recent[0]; }
  const assists = recent.filter(h => h !== k);
  const prevStreak = v.streak, shut = prevStreak >= 3;
  v.streak = 0; v.multi = 0; v.hitBy = {};
  const e = { t: 'kill', v: v.id, k: k ? k.id : 0, as: assists.map(h => h.id), by: src ? src.kind : '', first: false, multi: 0, streak: 0, shut, ace: false };
  if (k) {
    k.kills++; k.streak++;
    k.multi = W.t - k.multiT < 12 ? k.multi + 1 : 1; k.multiT = W.t;
    addGold(W, k, 200 + (shut ? 100 + 40 * Math.min(5, prevStreak - 3) : 0), true);
    addXp(W, k, 70 + 22 * v.lvl);
    for (const a of assists) { a.assists++; addGold(W, a, 80, true); addXp(W, a, 35 + 11 * v.lvl); }
    e.multi = k.multi; e.streak = k.streak;
    // buff 被抢走
    for (const b of ['red', 'blue']) { const f = fxOn(v, b); if (f) addFx(k, b, Math.max(f.t, 30), 0, 0, b); }
  }
  W.kills[1 - v.team]++;
  if (!W.firstBlood) { W.firstBlood = true; e.first = true; }
  if (heroesOf(W, v.team).every(h => h.dead)) e.ace = true;
  W.ev.push(e);
}
function minionDied(W, m, k) {
  const D = MINION[m.mt];
  const foes = [];
  near(W, m.x, m.y, 1000, u => { if (u.kind === 'hero' && u.team !== m.team) foes.push(u); });
  if (k && k.team !== m.team) {
    addGold(W, k, D.gold, k.isPlayer); k.cs++;
    for (const f of foes) if (f !== k) addGold(W, f, D.gold * 0.2, false);
  } else for (const f of foes) addGold(W, f, D.gold * 0.35, false);
  const n = foes.length;
  for (const f of foes) addXp(W, f, D.xp * (n > 1 ? 0.75 : 1));
}
function towerDied(W, t, k) {
  const team = 1 - t.team;
  for (const h of heroesOf(W, team)) addGold(W, h, 120, h.isPlayer);
  if (k) addGold(W, k, 100, true);
  W.towersLost[t.team]++;
  // 下一座塔可以打了
  for (const u of W.units) {
    if (u.team !== t.team || u.dead) continue;
    if (u.kind === 'tower' && u.lane === t.lane && u.tier === t.tier + 1) u.inv = false;
    if (u.kind === 'crystal' && t.tier === 2) u.inv = false;
  }
  if (t.tier === 2) W.superLane[team][t.lane] = 1;
  W.ev.push({ t: 'tower', team: t.team, lane: t.lane, tier: t.tier, k: k ? k.id : 0, x: t.x, y: t.y });
}
function monsterDied(W, m, k) {
  const D = MONSTER[m.mt], camp = W.camps[m.camp];
  camp.respawnAt = W.t + D.respawn; camp.uid = 0;
  W._dirty = true;
  if (!k) return;
  if (D.gold) addGold(W, k, D.gold, true);
  if (D.xp) addXp(W, k, D.xp);
  k.cs++;
  if (D.buff) addFx(k, D.buff, 70, 0, 0, D.buff);
  if (D.teamGold) {
    for (const h of heroesOf(W, k.team)) { addGold(W, h, D.teamGold, true); addXp(W, h, D.teamXp); }
  }
  if (m.mt === 'lord') spawnVanguard(W, k.team);
  W.ev.push({ t: D.teamGold ? 'dragon' : 'camp', mt: m.mt, team: k.team, k: k.id, x: m.x, y: m.y });
}

/* ---------- 兵 ---------- */
function laneOf(team, ln) { return team ? LANES[ln].map(mir) : LANES[ln]; }
function spawnMinion(W, team, ln, mt, back) {
  const path = laneOf(team, ln), D = MINION[mt];
  const mins = Math.max(0, Math.floor((W.t - 120) / 60));
  const sc = 1 + 0.04 * mins + 0.05 * Math.max(0, mins - 10);
  const dx = path[1][0] - path[0][0], dy = path[1][1] - path[0][1], dl = Math.hypot(dx, dy);
  const x = path[0][0] - dx / dl * back, y = path[0][1] - dy / dl * back;
  const p = nearestWalk(x, y);
  return addUnit(W, { kind: 'minion', mt, team, lane: ln, wp: 1, x: p[0], y: p[1], r: D.r, hp: D.hp * sc, maxHp: D.hp * sc,
    ad: D.ad * (1 + (sc - 1) * 0.7), arm: D.arm, mr: D.mr, range: D.range, asBase: D.as, ms: D.ms, proj: D.proj, vsTower: D.vsTower || 0,
    tgt: 0, think: 0 });
}
function spawnWave(W) {
  W.wave++;
  const siege = W.wave >= 2 && (W.t > 720 || W.wave % (W.t > 480 ? 2 : 3) === 0);
  for (const team of [0, 1]) for (let ln = 0; ln < 3; ln++) {
    const sup = W.superLane[team][ln];
    const list = sup ? ['super', 'super', 'melee', 'ranged', 'ranged'] : ['melee', 'melee', 'melee', 'ranged', 'ranged'];
    if (siege) list.push('siege');
    list.forEach((mt, i) => spawnMinion(W, team, ln, mt, i * 45));
  }
  W.ev.push({ t: 'wave', n: W.wave });
}
function spawnVanguard(W, team) {
  for (let ln = 0; ln < 3; ln++) spawnMinion(W, team, ln, 'vanguard', 0);
  W.ev.push({ t: 'vanguard', team });
}

/* ---------- 弹道和地面效果 ---------- */
function spawnProj(W, o) {
  o.id = W.nextId++;
  if (o.kind === 'line') { const d = Math.hypot(o.dx, o.dy) || 1; o.dx /= d; o.dy /= d; o.left = o.range; o.hit = []; o.trav = 0; }
  W.projs.push(o);
  return o;
}
function spawnZone(W, o) {
  o.id = W.nextId++; o.t0 = W.t; o.done = false; o.ticks = 0;
  W.zones.push(o);
  return o;
}
// 找区域里的敌方单位（只算看得见、能被选中的）
function foesIn(W, team, x, y, r, heroesOnly) {
  const out = [];
  near(W, x, y, r, u => {
    if (u.team === team || u.dead || untarg(u)) return;
    if (u.kind === 'tower' || u.kind === 'crystal') return;
    if (heroesOnly && u.kind !== 'hero') return;
    out.push(u);
  });
  return out;
}
function alliesIn(W, team, x, y, r) {
  const out = [];
  near(W, x, y, r, u => { if (u.team === team && u.kind === 'hero' && !u.dead) out.push(u); });
  return out;
}

/* ---------- 普攻 ---------- */
function attackDamage(W, u, t) {
  let d = u.ad, crit = false, sp = 0;
  if (u.kind === 'hero') {
    if (u.crit && rnd(W) * 100 < u.crit) { d *= 1.75 + u.critd / 100; crit = true; }
    if (u.hid === 'marksman') { u.atkN++; if (u.atkN % 4 === 0) { d *= 1.6; crit = true; sp = 1; } }
    const emp = fxOn(u, 'emp');
    if (emp) { d += emp.v; clearFx(u, 'emp'); crit = true; }
  }
  if (u.kind === 'tower' || u.kind === 'crystal') {
    if (t.kind === 'hero') {
      if (u.rampId === t.id) u.ramp = Math.min(u.ramp + 1, 5); else { u.ramp = 0; u.rampId = t.id; }
      d *= 1 + 0.35 * u.ramp;
    } else { u.ramp = 0; u.rampId = 0; d *= t.kind === 'minion' && t.mt !== 'melee' && t.mt !== 'ranged' ? 0.7 : 0.9; }
  }
  if (u.kind === 'minion' && t.kind === 'hero') d *= 0.7;
  if (u.kind === 'monster' && t.kind === 'minion') d *= 1.5;
  return [d, crit, sp];
}
function doAttack(W, u, t) {
  u.atkCd = 1 / asOf(u);
  u.atkT = W.t; u.atkTgt = t.id;
  if (Math.abs(t.x - u.x) > 4) u.face = t.x > u.x ? 1 : -1;
  if (u.kind === 'hero') {
    u.lock = u.proj ? 0.12 : 0.16; u.revealT = W.t;
    if (fxOn(u, 'invis')) clearFx(u, 'invis');
    if (u.recall) { u.recall = 0; W.ev.push({ t: 'recallX', id: u.id }); }
  }
  const [d, crit, sp] = attackDamage(W, u, t);
  if (u.proj) {
    const sy = u.kind === 'tower' ? -90 : u.kind === 'crystal' ? -110 : -16;
    spawnProj(W, { kind: 'home', x: u.x, y: u.y + sy, tid: t.id, spd: u.kind === 'tower' || u.kind === 'crystal' ? 1300 : 1150,
      team: u.team, src: u.id, dmg: d, crit, sp, on: 'atk', vis: u.proj });
  } else onAttackHit(W, u, t, d, crit, sp);
  W.ev.push({ t: 'atk', id: u.id, tid: t.id, x: u.x, y: u.y, kind: u.kind, proj: u.proj || '' });
}
function onAttackHit(W, u, t, d, crit, sp) {
  if (!t || t.dead) return;
  if (u.kind === 'monster' && (u.mt === 'drake' || u.mt === 'lord')) {   // 龙的攻击溅射
    for (const f of foesIn(W, u.team, t.x, t.y, 170)) hurt(W, u, f, d * (f === t ? 1 : 0.6), 'p', { atk: true });
    return;
  }
  hurt(W, u, t, d, 'p', { atk: true, crit });
  if (u.kind === 'hero' && !t.dead) {
    if (fxOn(u, 'red') && t.kind !== 'tower' && t.kind !== 'crystal') { addFx(t, 'slow', 1, 0.25, u.id, 'redslow'); addFx(t, 'dot', 3, 12 + 3 * u.lvl, u.id, 'redburn'); }
    if (sp) addFx(t, 'slow', 1, 0.3, u.id, 'mkslow');
  }
}

/* ---------- 技能 ---------- */
const MOVE_SKILL = { t1: 1, t3: 1, w2: 1, a1: 1, a3: 1, s2: 1 };
function sdef(h, s) { return HERO_BY_ID[h.hid].skills[s]; }
function castSkill(W, h, s, tx, ty, tid) {
  const def = sdef(h, s), st = h.sk[s];
  if (h.dead || !st.rank || st.cd > 0 || stunned(h) || h.dash || h.leap || h.chan) return false;
  if (MOVE_SKILL[def.id] && fxOn(h, 'root')) return false;
  let t = null;
  if (def.aim === 'unit') {
    t = tid ? byId(W, tid) : null;
    if (!t || t.dead || !canSee(W, h.team, t) || untarg(t) || t.team === h.team || dist(h, t) > def.range + 80) {
      t = null;
      let bd = def.range + 80;
      for (const e of foesIn(W, h.team, h.x, h.y, def.range + 80, true)) { if (!canSee(W, h.team, e)) continue; const d = dist(h, e); if (d < bd) { bd = d; t = e; } }
    }
    if (!t) return false;
    tx = t.x; ty = t.y;
  }
  if (tx == null || (tx === h.x && ty === h.y)) { tx = h.x + h.face * 100; ty = h.y; }
  if (def.aim === 'point') {
    const d = Math.hypot(tx - h.x, ty - h.y);
    if (d > def.range) { tx = h.x + (tx - h.x) / d * def.range; ty = h.y + (ty - h.y) / d * def.range; }
  }
  if (Math.abs(tx - h.x) > 4) h.face = tx > h.x ? 1 : -1;
  st.cd = cdOf(h, s);
  h.revealT = W.t; h.castT = W.t; h.castS = s;
  if (h.recall) { h.recall = 0; W.ev.push({ t: 'recallX', id: h.id }); }
  if (def.id !== 'a2' && fxOn(h, 'invis')) clearFx(h, 'invis');
  SK[def.id](W, h, st.rank - 1, tx, ty, t, def);
  W.ev.push({ t: 'cast', id: h.id, s, sid: def.id, x: tx, y: ty, hx: h.x, hy: h.y });
  return true;
}
function dirTo(h, tx, ty) { const dx = tx - h.x, dy = ty - h.y, d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; }
function sdmg(def, rank, h) {                // 技能伤害 = 基础 + 加成
  let v = skv(def.dmg, rank);
  if (def.adR) v += def.adR * (def.id === 'w3' || def.id === 's3' ? Math.max(0, h.ad - HERO_BY_ID[h.hid].ad - HERO_BY_ID[h.hid].adG * (h.lvl - 1)) + 0.5 * h.ad : h.ad);
  if (def.apR) v += def.apR * h.ap;
  if (def.hpR) v += def.hpR * h.maxHp;
  return v;
}
function frostOn(W, h, t) { if (h.frost && t.kind === 'hero') addFx(t, 'slow', 1, 0.2, h.id, 'frost'); }
const SK = {
  // 铁墩
  t1(W, h, r, tx, ty, _, def) {
    const [dx, dy] = dirTo(h, tx, ty);
    h.dash = { tx: h.x + dx * def.range, ty: h.y + dy * def.range, spd: 1300, hit: [], on: 't1', rk: r, rad: 55, stopHero: 1 };
  },
  t2(W, h, r, tx, ty, _, def) {
    addFx(h, 'shield', 3, skv(def.sh, r) + def.hpR * h.maxHp, h.id, 'ironwall');
    for (const e of foesIn(W, h.team, h.x, h.y, def.range)) {
      hurt(W, h, e, skv(def.dmg, r) + 0.03 * h.maxHp, 'm', { skill: 1 });
      addFx(e, 'slow', 1.5, 0.3, h.id, 't2slow');
    }
    W.ev.push({ t: 'fx', k: 'ring', x: h.x, y: h.y, r: def.range, col: 'steel' });
  },
  t3(W, h, r, tx, ty, _, def) {
    h.leap = { sx: h.x, sy: h.y, tx, ty, t: 0, dur: 0.55, on: 't3', rk: r, hgt: 140 };
  },
  // 克劳德
  w1(W, h, r, tx, ty, _, def) {
    addFx(h, 'spin', def.dur, r, h.id, 'spin');
    addFx(h, 'ms', def.dur, 0.2, h.id, 'spinms');
    h.spinNext = 0;
  },
  w2(W, h, r, tx, ty, _, def) {
    h.leap = { sx: h.x, sy: h.y, tx, ty, t: 0, dur: 0.42, on: 'w2', rk: r, hgt: 110 };
  },
  w3(W, h, r, tx, ty, _, def) {
    const [dx, dy] = dirTo(h, tx, ty);
    let killed = false;
    for (const e of foesIn(W, h.team, h.x + dx * def.range / 2, h.y + dy * def.range / 2, def.range / 2 + 60)) {
      const ex = e.x - h.x, ey = e.y - h.y, along = ex * dx + ey * dy, side = Math.abs(ex * dy - ey * dx);
      if (along < -40 || along > def.range + e.r || side > 90 + e.r) continue;
      let v = sdmg(def, r, h);
      if (e.kind === 'hero') v += def.miss * (e.maxHp - e.hp);
      hurt(W, h, e, v, 'p', { skill: 1 });
      if (e.dead && e.kind === 'hero') killed = true;
    }
    if (killed) h.sk[2].cd *= 0.3;
    W.ev.push({ t: 'fx', k: 'slash', x: h.x, y: h.y, dx, dy, r: def.range, col: 'gold' });
  },
  // 影子
  a1(W, h, r, tx, ty, _, def) {
    const [dx, dy] = dirTo(h, tx, ty);
    h.dash = { tx: h.x + dx * def.range, ty: h.y + dy * def.range, spd: 1500, hit: [], on: 'a1', rk: r, rad: 60, stopHero: 0 };
  },
  a2(W, h, r, tx, ty, _, def) {
    addFx(h, 'invis', def.dur, 0, h.id, 'invis');
    addFx(h, 'ms', def.dur, 0.35, h.id, 'invisms');
    addFx(h, 'emp', 4, sdmg(def, r, h), h.id, 'emp');
    W.ev.push({ t: 'fx', k: 'smoke', x: h.x, y: h.y });
  },
  a3(W, h, r, tx, ty, t, def) {
    h.chan = { k: 'a3', tid: t.id, t: 0, n: 0, rk: r };
    addFx(h, 'untarg', 1.1, 0, h.id, 'a3untarg');
    const ang = Math.atan2(h.y - t.y, h.x - t.x);
    const p = nearestWalk(t.x + Math.cos(ang) * 60, t.y + Math.sin(ang) * 60);
    W.ev.push({ t: 'fx', k: 'blink', x: h.x, y: h.y, x2: p[0], y2: p[1] });
    h.x = p[0]; h.y = p[1];
  },
  // 星星
  m1(W, h, r, tx, ty, _, def) {
    const [dx, dy] = dirTo(h, tx, ty);
    spawnProj(W, { kind: 'line', x: h.x + dx * 30, y: h.y - 14 + dy * 30, dx, dy, spd: 950, range: def.range, r: 34, team: h.team, src: h.id, on: 'm1', rk: r, vis: 'fireball' });
  },
  m2(W, h, r, tx, ty, _, def) {
    spawnZone(W, { x: tx, y: ty, r: def.rad, team: h.team, src: h.id, on: 'm2', rk: r, delay: def.delay, vis: 'frost' });
  },
  m3(W, h, r, tx, ty, _, def) {
    for (let i = 0; i < def.n; i++) {
      const a = rnd(W) * Math.PI * 2, d = Math.sqrt(rnd(W)) * def.rad * (i === 0 ? 0.2 : 0.9);
      spawnZone(W, { x: tx + Math.cos(a) * d, y: ty + Math.sin(a) * d, r: 120, team: h.team, src: h.id, on: 'm3', rk: r,
        delay: 0.5 + i * (def.dur / def.n), vis: 'meteor' });
    }
    W.ev.push({ t: 'fx', k: 'meteorArea', x: tx, y: ty, r: def.rad, dur: def.dur + 0.6 });
  },
  // 青箭
  s1(W, h, r, tx, ty, _, def) {
    const base = Math.atan2(ty - h.y, tx - h.x), group = W.nextId;
    for (let i = 0; i < def.n; i++) {
      const a = base + (i - (def.n - 1) / 2) * 0.16;
      spawnProj(W, { kind: 'line', x: h.x, y: h.y - 14, dx: Math.cos(a), dy: Math.sin(a), spd: 1300, range: def.range, r: 26, team: h.team, src: h.id,
        on: 's1', rk: r, vis: 'arrow', group });
    }
  },
  s2(W, h, r, tx, ty, _, def) {
    const [dx, dy] = dirTo(h, tx, ty);
    h.dash = { tx: h.x + dx * def.range, ty: h.y + dy * def.range, spd: 1400, hit: [], on: 's2', rk: r, rad: 0, stopHero: 0 };
    addFx(h, 'asb', 4, skv(def.as, r) / 100, h.id, 's2as');
  },
  s3(W, h, r, tx, ty, _, def) {
    const [dx, dy] = dirTo(h, tx, ty);
    spawnProj(W, { kind: 'line', x: h.x, y: h.y - 14, dx, dy, spd: 1700, range: def.range, r: 46, team: h.team, src: h.id, on: 's3', rk: r, vis: 'bigarrow', pierce: 1 });
  },
  // 糖糖
  h1(W, h, r, tx, ty, _, def) {
    const v = sdmg(def, r, h);
    healUnit(W, h, v);
    let best = null, bp = 2;
    for (const a of alliesIn(W, h.team, h.x, h.y, def.range)) { if (a === h) continue; const p = a.hp / a.maxHp; if (p < bp) { bp = p; best = a; } }
    if (best) { healUnit(W, best, v); W.ev.push({ t: 'fx', k: 'healbeam', x: h.x, y: h.y, x2: best.x, y2: best.y, id2: best.id }); }
    W.ev.push({ t: 'fx', k: 'heal', x: h.x, y: h.y, id: h.id });
  },
  h2(W, h, r, tx, ty, _, def) {
    const [dx, dy] = dirTo(h, tx, ty);
    spawnProj(W, { kind: 'line', x: h.x, y: h.y - 14, dx, dy, spd: 1100, range: def.range, r: 32, team: h.team, src: h.id, on: 'h2', rk: r, vis: 'vine' });
  },
  h3(W, h, r, tx, ty, _, def) {
    const v = sdmg(def, r, h);
    for (const a of alliesIn(W, h.team, h.x, h.y, def.range)) {
      addFx(a, 'shield', 3.5, v, h.id, 'sanct');
      addFx(a, 'ms', 2, 0.25, h.id, 'sanctms');
    }
    W.ev.push({ t: 'fx', k: 'dome', x: h.x, y: h.y, r: def.range, id0: h.id });
  },
};
// 冲刺撞到人
const DASH_HIT = {
  t1(W, h, e, d) {
    const def = sdef(h, 0);
    hurt(W, h, e, sdmg(def, d.rk, h), 'p', { skill: 1 });
    if (e.kind === 'hero') { addFx(e, 'stun', def.stun, 0, h.id, 'stun'); d.stop = 1; W.ev.push({ t: 'fx', k: 'bonk', x: e.x, y: e.y }); }
  },
  a1(W, h, e, d) {
    const def = sdef(h, 0);
    hurt(W, h, e, sdmg(def, d.rk, h), 'p', { skill: 1 });
    if (e.kind === 'hero' && e.dead) d.reset = 1;
  },
};
const DASH_END = {
  a1(W, h, d) { if (d.reset) h.sk[0].cd = 0; },
};
// 跳完落地
const LEAP_END = {
  t3(W, h, lp) {
    const def = sdef(h, 2);
    for (const e of foesIn(W, h.team, h.x, h.y, def.rad)) {
      hurt(W, h, e, sdmg(def, lp.rk, h), 'm', { skill: 1 });
      if (!e.dead) addFx(e, 'stun', def.stun, 0, h.id, 'stun');
    }
    W.ev.push({ t: 'fx', k: 'quake', x: h.x, y: h.y, r: def.rad });
  },
  w2(W, h, lp) {
    const def = sdef(h, 1);
    for (const e of foesIn(W, h.team, h.x, h.y, def.rad)) {
      hurt(W, h, e, sdmg(def, lp.rk, h), 'p', { skill: 1 });
      if (!e.dead) addFx(e, 'slow', 1.5, def.slow, h.id, 'w2slow');
    }
    W.ev.push({ t: 'fx', k: 'land', x: h.x, y: h.y, r: def.rad });
  },
};
// 弹道打中
const HIT = {
  atk(W, p, e) { const u = byId(W, p.src); if (u && !u.dead) onAttackHit(W, u, e, p.dmg, p.crit, p.sp); else hurt(W, null, e, p.dmg, 'p', { atk: true }); },
  m1(W, p, e) { explodeM1(W, p); p.dead = true; },
  s1(W, p, e) {
    const h = byId(W, p.src); if (!h) return;
    // 同一轮散射，一个人只吃一支
    const key = p.group + ':' + e.id;
    W._s1 = W._s1 || {};
    if (W._s1[key]) return;
    W._s1[key] = W.t;
    hurt(W, h, e, sdmg(sdef(h, 0), p.rk, h), 'p', { skill: 1 });
    frostOn(W, h, e);
    p.dead = true;
  },
  s3(W, p, e) {
    const h = byId(W, p.src); if (!h) return;
    const def = sdef(h, 2);
    if (e.kind === 'hero') {
      hurt(W, h, e, sdmg(def, p.rk, h), 'p', { skill: 1 });
      if (!e.dead) addFx(e, 'stun', def.stun[0] + (def.stun[1] - def.stun[0]) * Math.min(1, p.trav / 2500), 0, h.id, 'stun');
      W.ev.push({ t: 'fx', k: 'bonk', x: e.x, y: e.y });
      p.dead = true;
    } else hurt(W, h, e, sdmg(def, p.rk, h) * 0.5, 'p', { skill: 1 });
  },
  h2(W, p, e) {
    const h = byId(W, p.src); if (!h) return;
    const def = sdef(h, 1);
    hurt(W, h, e, sdmg(def, p.rk, h), 'm', { skill: 1 });
    if (!e.dead) addFx(e, 'root', def.root, 0, h.id, 'root');
    frostOn(W, h, e);
    p.dead = true;
  },
};
function explodeM1(W, p) {
  const h = byId(W, p.src);
  if (h) {
    const def = sdef(h, 0);
    for (const e of foesIn(W, p.team, p.x, p.y, def.rad)) { hurt(W, h, e, sdmg(def, p.rk, h), 'm', { skill: 1 }); frostOn(W, h, e); }
  }
  W.ev.push({ t: 'fx', k: 'boom', x: p.x, y: p.y, r: 140 });
}
const LINE_END = { m1: explodeM1 };
const ZONE = {
  m2(W, z) {
    const h = byId(W, z.src); if (!h) return;
    const def = sdef(h, 1);
    for (const e of foesIn(W, z.team, z.x, z.y, z.r)) {
      hurt(W, h, e, sdmg(def, z.rk, h), 'm', { skill: 1 });
      if (!e.dead) addFx(e, 'root', def.root, 0, h.id, 'root');
    }
    W.ev.push({ t: 'fx', k: 'ice', x: z.x, y: z.y, r: z.r });
  },
  m3(W, z) {
    const h = byId(W, z.src); if (!h) return;
    const def = sdef(h, 2);
    for (const e of foesIn(W, z.team, z.x, z.y, z.r)) { hurt(W, h, e, sdmg(def, z.rk, h), 'm', { skill: 1 }); frostOn(W, h, e); }
    W.ev.push({ t: 'fx', k: 'meteorHit', x: z.x, y: z.y, r: z.r });
  },
};

/* ---------- 召唤师技能、回城 ---------- */
function doFlash(W, h, tx, ty) {
  if (h.flashCd > 0 || h.dead || stunned(h) || h.leap || h.chan) return false;
  const [dx, dy] = (tx === h.x && ty === h.y) ? [h.face, 0] : dirTo(h, tx, ty);
  let d = FLASH_DIST, nx = h.x + dx * d, ny = h.y + dy * d;
  while (!walk(nx, ny) && d > 40) { d -= 20; nx = h.x + dx * d; ny = h.y + dy * d; }
  const p = walk(nx, ny) ? [nx, ny] : nearestWalk(nx, ny);
  W.ev.push({ t: 'fx', k: 'flash', x: h.x, y: h.y, x2: p[0], y2: p[1] });
  h.x = p[0]; h.y = p[1]; h.dash = null; h.path = null;
  h.flashCd = FLASH_CD;
  if (Math.abs(dx) > 0.1) h.face = dx > 0 ? 1 : -1;
  if (h.recall) { h.recall = 0; W.ev.push({ t: 'recallX', id: h.id }); }
  return true;
}
function doHealSpell(W, h) {
  if (h.healCd > 0 || h.dead) return false;
  addFx(h, 'hot', HEAL_DUR, h.maxHp * HEAL_PCT / HEAL_DUR, h.id, 'healspell');
  addFx(h, 'ms', 2, 0.15, h.id, 'healms');
  h.healCd = HEAL_CD;
  W.ev.push({ t: 'fx', k: 'heal', x: h.x, y: h.y, id: h.id });
  return true;
}
function startRecall(W, h) {
  if (h.dead || h.recall || stunned(h)) return;
  h.recall = W.t;
  W.ev.push({ t: 'recall', id: h.id });
}

/* ---------- 看得见吗（草丛、隐身） ---------- */
function canSee(W, team, u) {
  if (u.team === team || u.kind !== 'hero') return true;
  return !u.hidden || !u.hidden[team];
}
function updateVis(W) {
  for (const h of W._heroes) {
    h.bush = bushOf(h.x, h.y);
    if (!h.hidden) h.hidden = [false, false];
    h.hidden[0] = h.hidden[1] = false;
    if (h.dead) continue;
    const inv = fxOn(h, 'invis');
    if (!inv && (!h.bush || W.t - h.revealT < 1.2)) continue;
    const ft = 1 - h.team;
    let seen = false;
    near(W, h.x, h.y, inv ? 110 : 190, u => { if (u.team === ft && u.kind !== 'tower' && u.kind !== 'crystal') seen = true; });
    if (!seen && !inv) for (const e of W._heroes) if (e.team === ft && !e.dead && bushOf(e.x, e.y) === h.bush) seen = true;
    h.hidden[ft] = !seen;
  }
}

/* ---------- 走路 ---------- */
function moveBy(W, u, dx, dy) {           // 撞墙就沿墙滑
  const nx = u.x + dx, ny = u.y + dy;
  if (walk(nx, ny)) { u.x = nx; u.y = ny; return true; }
  if (Math.abs(dx) > 0.01 && walk(nx, u.y)) { u.x = nx; return true; }
  if (Math.abs(dy) > 0.01 && walk(u.x, ny)) { u.y = ny; return true; }
  const m = Math.hypot(dx, dy);
  for (const s of [1, -1]) {             // 两边斜着试一下
    const ax = (dx - s * dy) * 0.7071, ay = (dy + s * dx) * 0.7071;
    if (walk(u.x + ax * 0.7, u.y + ay * 0.7) && m > 0) { u.x += ax * 0.7; u.y += ay * 0.7; return true; }
  }
  return false;
}
function stepToward(W, u, tx, ty, dt) {
  const dx = tx - u.x, dy = ty - u.y, d = Math.hypot(dx, dy);
  if (d < 1) return true;
  const s = Math.min(d, msOf(W, u) * dt);
  if (Math.abs(dx) > 3) u.face = dx > 0 ? 1 : -1;
  u.moving = true;
  moveBy(W, u, dx / d * s, dy / d * s);
  return d <= s + 0.5;
}
function goTo(W, h, tx, ty, dt) {          // 英雄走到某处：看得见就直走，看不见就寻路
  if (rooted(h)) return;
  if (Math.hypot(tx - h.x, ty - h.y) < 8) return;
  if (los(h.x, h.y, tx, ty)) { h.path = null; stepToward(W, h, tx, ty, dt); return; }
  const g = h.pathGoal;
  if (!h.path || !g || Math.hypot(g[0] - tx, g[1] - ty) > 120 || W.t - h.pathT > 3) {
    h.path = findPath(h.x, h.y, tx, ty); h.pathGoal = [tx, ty]; h.pathT = W.t;
    if (!h.path) { stepToward(W, h, tx, ty, dt); return; }
  }
  while (h.path.length > 1 && Math.hypot(h.path[0][0] - h.x, h.path[0][1] - h.y) < 24) h.path.shift();
  // 能直接看到后面的点就跳过
  if (h.path.length > 1 && los(h.x, h.y, h.path[1][0], h.path[1][1])) h.path.shift();
  const p = h.path[0];
  if (stepToward(W, h, p[0], p[1], dt) && h.path.length > 1) h.path.shift();
}

/* ---------- 目标 ---------- */
function attackable(W, team, u) {
  return u && !u.dead && u.team !== team && !untarg(u) && !u.inv && !u.reset && canSee(W, team, u);
}
// 玩家按住普攻：在范围（+extra）里挑目标。英雄优先挑血最少的，再是小兵 / 野怪（血最少的，方便补刀），最后是塔
function autoTarget(W, h, extra) {
  let bestH = null, bh = 1e9, bestM = null, bm = 1e9, bestS = null, bs = 1e9;
  near(W, h.x, h.y, h.range + extra + 90, u => {
    if (!attackable(W, h.team, u)) return;
    const e = edge(h, u);
    if (e > h.range + extra) return;
    if (u.kind === 'hero') { const v = u.hp + e * 2; if (v < bh) { bh = v; bestH = u; } }
    else if (u.kind === 'minion' || u.kind === 'monster') { const v = u.hp + e * 1.5; if (v < bm) { bm = v; bestM = u; } }
    else { if (e < bs) { bs = e; bestS = u; } }
  });
  return bestH || bestM || bestS;
}

/* ---------- 英雄每帧 ---------- */
function respawn(W, h) {
  const p = spawnPoint(h.team, h.slot);
  h.dead = false; h.hp = h.maxHp; h.x = p[0]; h.y = p[1]; h.fx.length = 0; h.path = null; h.recall = 0;
  h.cmd = {}; h.dash = null; h.leap = null; h.chan = null;
  W.ev.push({ t: 'respawn', id: h.id });
}
function heroStep(W, h, dt) {
  if (h.dead) { if (W.t >= h.respawnAt && W.winner < 0) respawn(W, h); return; }
  h.moving = false;
  for (const s of h.sk) if (s.cd > 0) s.cd = Math.max(0, s.cd - dt);
  if (h.flashCd > 0) h.flashCd = Math.max(0, h.flashCd - dt);
  if (h.healCd > 0) h.healCd = Math.max(0, h.healCd - dt);
  if (h.atkCd > 0) h.atkCd -= dt;
  if (h.lock > 0) h.lock -= dt;
  // 回血
  let reg = h.regen;
  if (fxOn(h, 'blue')) reg += h.maxHp * 0.006;
  const sp = h.team ? mir(SPRING) : SPRING;
  const inSpring = Math.hypot(h.x - sp[0], h.y - sp[1]) < SPRING_R;
  if (inSpring) reg += h.maxHp * 0.15;
  else if (W.t - h.lastHurt > 6) reg *= 2;
  if (h.hp < h.maxHp) h.hp = Math.min(h.maxHp, h.hp + reg * dt);
  if (inSpring && W.t % 1 < dt) W.ev.push({ t: 'fx', k: 'springHeal', x: h.x, y: h.y, id: h.id });
  // 糖糖的光环
  if (h.hid === 'support') for (const a of alliesIn(W, h.team, h.x, h.y, 600)) if (a.hp < a.maxHp) a.hp = Math.min(a.maxHp, a.hp + a.maxHp * 0.006 * dt);
  // 旋风斩
  const spin = fxOn(h, 'spin');
  if (spin) {
    h.spinNext = (h.spinNext || 0) - dt;
    if (h.spinNext <= 0) {
      h.spinNext = 0.25;
      const def = sdef(h, 0);
      for (const e of foesIn(W, h.team, h.x, h.y, def.range)) { hurt(W, h, e, skv(def.dmg, spin.v) + def.adR * h.ad, 'p', { skill: 1 }); }
    }
  }
  if (stunned(h)) { if (h.recall) { h.recall = 0; W.ev.push({ t: 'recallX', id: h.id }); } h.dash = null; h.chan = null; return; }
  if (h.dash) { stepDash(W, h, dt); return; }
  if (h.leap) { stepLeap(W, h, dt); return; }
  if (h.chan) { stepChan(W, h, dt); return; }
  const c = h.cmd || (h.cmd = {});
  if (c.cast) { const cs = c.cast; c.cast = null; castSkill(W, h, cs.s, cs.x, cs.y, cs.id); if (h.dash || h.leap || h.chan) return; }
  if (c.flash) { const f = c.flash; c.flash = null; doFlash(W, h, f[0], f[1]); }
  if (c.heal) { c.heal = false; doHealSpell(W, h); }
  if (c.recall) { c.recall = false; if (!c.mv) startRecall(W, h); }
  if (h.recall) {
    if (c.mv || c.atkAuto || c.atk || (c.goto && Math.hypot(c.goto[0] - h.x, c.goto[1] - h.y) > 30)) { h.recall = 0; W.ev.push({ t: 'recallX', id: h.id }); }
    else {
      if (W.t - h.recall >= RECALL_T) {
        const p = spawnPoint(h.team, h.slot);
        W.ev.push({ t: 'fx', k: 'recallDone', x: h.x, y: h.y, x2: p[0], y2: p[1], id: h.id });
        h.x = p[0]; h.y = p[1]; h.recall = 0; h.path = null; c.goto = null;
      }
      return;
    }
  }
  const canAtk = !spin;
  // 普攻目标
  let tgt = null;
  if (c.atkAuto && canAtk) tgt = autoTarget(W, h, c.mv ? 30 : 320);
  else if (c.atk && canAtk) { tgt = byId(W, c.atk); if (!attackable(W, h.team, tgt)) { tgt = null; c.atk = 0; } }
  if (tgt) {
    const e = edge(h, tgt);
    if (e <= h.range) {
      if (h.atkCd <= 0) doAttack(W, h, tgt);
      else if (c.mv && h.lock <= 0 && !rooted(h)) moveDir(W, h, c.mv, dt);
      return;
    }
    if (!c.mv) {
      if (rooted(h)) return;
      goTo(W, h, tgt.x, tgt.y, dt);
      return;
    }
  }
  if (h.lock > 0 || rooted(h)) return;
  if (c.mv) moveDir(W, h, c.mv, dt);
  else if (c.goto) {
    goTo(W, h, c.goto[0], c.goto[1], dt);
    if (Math.hypot(c.goto[0] - h.x, c.goto[1] - h.y) < 10) c.goto = null;
  }
}
function moveDir(W, h, mv, dt) {
  const s = msOf(W, h) * dt;
  if (Math.abs(mv[0]) > 0.05) h.face = mv[0] > 0 ? 1 : -1;
  h.moving = true;
  moveBy(W, h, mv[0] * s, mv[1] * s);
}
function stepDash(W, h, dt) {
  const d = h.dash;
  let left = d.spd * dt;
  while (left > 0 && h.dash) {
    const dx = d.tx - h.x, dy = d.ty - h.y, dd = Math.hypot(dx, dy);
    if (dd < 2) { endDash(W, h); break; }
    const s = Math.min(left, 12, dd);
    left -= s;
    const nx = h.x + dx / dd * s, ny = h.y + dy / dd * s;
    if (!walk(nx, ny)) { endDash(W, h); break; }
    h.x = nx; h.y = ny;
    if (Math.abs(dx) > 3) h.face = dx > 0 ? 1 : -1;
    if (d.rad && DASH_HIT[d.on]) {
      for (const e of foesIn(W, h.team, h.x, h.y, d.rad)) {
        if (d.hit.includes(e.id)) continue;
        d.hit.push(e.id);
        DASH_HIT[d.on](W, h, e, d);
        if (d.stop) break;
      }
      if (d.stop) { endDash(W, h); break; }
    }
  }
  h.moving = true;
}
function endDash(W, h) {
  const d = h.dash; h.dash = null;
  if (d && DASH_END[d.on]) DASH_END[d.on](W, h, d);
}
function stepLeap(W, h, dt) {
  const lp = h.leap;
  lp.t += dt;
  const k = Math.min(1, lp.t / lp.dur);
  h.x = lp.sx + (lp.tx - lp.sx) * k; h.y = lp.sy + (lp.ty - lp.sy) * k;
  h.z = Math.sin(k * Math.PI) * lp.hgt;
  if (k >= 1) {
    h.leap = null; h.z = 0;
    const p = nearestWalk(h.x, h.y); h.x = p[0]; h.y = p[1];
    if (LEAP_END[lp.on]) LEAP_END[lp.on](W, h, lp);
  }
}
function stepChan(W, h, dt) {
  const c = h.chan;
  c.t += dt;
  if (c.k === 'a3') {
    const t = byId(W, c.tid), def = sdef(h, 2);
    if (c.t >= 0.12 + c.n * 0.2 && c.n < def.hits) {
      c.n++;
      if (t && !t.dead) {
        const ang = rnd(W) * Math.PI * 2;
        const p = nearestWalk(t.x + Math.cos(ang) * 55, t.y + Math.sin(ang) * 55);
        h.x = p[0]; h.y = p[1]; h.face = t.x > h.x ? 1 : -1;
        hurt(W, h, t, sdmg(def, c.rk, h), 'p', { skill: 1 });
        W.ev.push({ t: 'fx', k: 'cut', x: t.x, y: t.y, n: c.n });
      }
    }
    if (c.n >= def.hits || !t || t.dead) { h.chan = null; clearFx(h, 'untarg'); }
  }
}

/* ---------- 建筑、小兵、野怪每帧 ---------- */
function structStep(W, u, dt) {
  if (u.atkCd > 0) u.atkCd -= dt;
  u.think = (u.think || 0) - dt;
  let t = byId(W, u.tgt);
  const inRange = x => x && attackable(W, u.team, x) && x.kind !== 'tower' && x.kind !== 'crystal' && x.kind !== 'monster' && dist(u, x) <= u.range + x.r;
  if (u.think <= 0) {
    u.think = 0.15;
    // 打了我方英雄的敌方英雄，塔先打他
    let help = null;
    near(W, u.x, u.y, u.range, e => {
      if (e.kind === 'hero' && e.team !== u.team && W.t - e.aggroT < 1.2 && inRange(e)) {
        const v = byId(W, e.aggroV);
        if (v && v.team === u.team && dist(v, u) < u.range + 250) help = e;
      }
    });
    if (help) t = help;
    else if (!inRange(t)) {
      t = null; let bd = 1e9, bh = null, bhd = 1e9;
      near(W, u.x, u.y, u.range, e => {
        if (!inRange(e)) return;
        const d = dist(u, e);
        if (e.kind === 'hero') { if (d < bhd) { bhd = d; bh = e; } }
        else if (d < bd) { bd = d; t = e; }
      });
      if (!t) t = bh;
    }
    u.tgt = t ? t.id : 0;
  }
  if (t && inRange(t) && u.atkCd <= 0) doAttack(W, u, t);
  // 泉水：敌人进来就被打
  if (u.kind === 'crystal' && (u.springCd -= dt) <= 0) {
    u.springCd = 0.5;
    const sp = u.team ? mir(SPRING) : SPRING;
    near(W, sp[0], sp[1], SPRING_R + 120, e => {
      if (e.team !== u.team && e.team < 2 && e.kind !== 'tower' && e.kind !== 'crystal') {
        W.ev.push({ t: 'fx', k: 'springShot', x: sp[0], y: sp[1], x2: e.x, y2: e.y });
        hurt(W, null, e, 800, 't', { force: 1 });
      }
    });
  }
}
function minionStep(W, m, dt) {
  if (m.atkCd > 0) m.atkCd -= dt;
  m.think -= dt;
  m.moving = false;
  let t = byId(W, m.tgt);
  const ok = x => x && attackable(W, m.team, x);
  if (stunned(m)) return;
  if (m.think <= 0) {
    m.think = 0.25 + rnd(W) * 0.1;
    if (!ok(t) || dist(m, t) > 650 || (t.kind === 'hero' && dist(m, t) > 450)) t = null;
    // 打了我方英雄的敌方英雄
    let help = null;
    near(W, m.x, m.y, 450, e => {
      if (e.kind === 'hero' && e.team !== m.team && W.t - e.aggroT < 1.5 && ok(e)) { const v = byId(W, e.aggroV); if (v && v.team === m.team && dist(v, m) < 600) help = e; }
    });
    if (help && (!t || t.kind !== 'hero')) t = help;
    if (!t || t.kind !== 'minion') {
      let bm = null, bmd = 1e9, bs = null, bsd = 1e9, bh = null, bhd = 1e9;
      near(W, m.x, m.y, 520, e => {
        if (!ok(e)) return;
        const d = dist(m, e);
        if (e.kind === 'minion') { if (d < bmd) { bmd = d; bm = e; } }
        else if (e.kind === 'tower' || e.kind === 'crystal') { if (d < bsd) { bsd = d; bs = e; } }
        else if (e.kind === 'hero') { if (d < bhd && d < 420) { bhd = d; bh = e; } }
      });
      if (bm) t = bm; else if (!t) t = bs || bh;
    }
    m.tgt = t ? t.id : 0;
  }
  if (t && ok(t)) {
    if (edge(m, t) <= m.range) {
      if (m.atkCd <= 0) doAttack(W, m, t);
      return;
    }
    if (!rooted(m)) stepToward(W, m, t.x, t.y, dt);
    return;
  }
  if (rooted(m)) return;
  const path = laneOf(m.team, m.lane);
  if (m.wp >= path.length) m.wp = path.length - 1;
  const p = path[m.wp];
  if (stepToward(W, m, p[0], p[1], dt) || Math.hypot(p[0] - m.x, p[1] - m.y) < 60) { if (m.wp < path.length - 1) m.wp++; }
}
function monsterStep(W, m, dt) {
  if (m.atkCd > 0) m.atkCd -= dt;
  m.moving = false;
  const camp = W.camps[m.camp];
  const home = Math.hypot(m.x - camp.x, m.y - camp.y);
  if (m.reset) {                           // 拉太远了：直接走回家（不管墙）、回满血，这期间打不动
    const s = Math.min(home, 420 * dt);
    if (home > 1) { m.x += (camp.x - m.x) / home * s; m.y += (camp.y - m.y) / home * s; m.face = camp.x > m.x ? 1 : -1; m.moving = true; }
    m.hp = Math.min(m.maxHp, m.hp + m.maxHp * 0.5 * dt);
    if (home < 15) { m.reset = false; m.hp = m.maxHp; m.aggro = 0; m.fx.length = 0; }
    return;
  }
  if (stunned(m)) return;
  let t = byId(W, m.aggro);
  if (t && (t.dead || !canSee(W, m.team, t) || untarg(t) || dist(t, camp) > m.leash + 200)) {
    // 换一个最近打过我的英雄
    t = null;
    near(W, m.x, m.y, 500, e => { if (!t && e.kind === 'hero' && !e.dead && canSee(W, 2, e) && W.t - e.revealT < 4 && dist(e, camp) < m.leash) t = e; });
    m.aggro = t ? t.id : 0;
  }
  if (!t) { if (home > 15) { m.reset = true; } return; }
  if (home > m.leash) { m.reset = true; m.aggro = 0; return; }
  if (edge(m, t) <= m.range) { if (m.atkCd <= 0) doAttack(W, m, t); }
  else if (!rooted(m)) stepToward(W, m, t.x, t.y, dt);
}
function spawnCamps(W) {
  for (let i = 0; i < W.camps.length; i++) {
    const c = W.camps[i];
    if (c.uid || W.t < c.respawnAt) continue;
    const D = MONSTER[c.type];
    const sc = 1 + 0.05 * Math.floor(W.t / 60);
    const m = addUnit(W, { kind: 'monster', mt: c.type, team: 2, camp: i, x: c.x, y: c.y, r: D.r, hp: D.hp * sc, maxHp: D.hp * sc,
      ad: D.ad * sc, arm: D.arm, mr: D.mr, range: D.range, asBase: D.as, ms: 260, leash: c.side < 0 ? 700 : 560, aggro: 0, reset: false });
    m.face = c.x < L / 2 ? 1 : -1;
    c.uid = m.id;
    if (c.side < 0) W.ev.push({ t: 'dragonSpawn', mt: c.type });
  }
}

/* ---------- 一帧 ---------- */
function step(W, dt) {
  if (!W._heroes) W._heroes = W.units.filter(u => u.kind === 'hero');
  if (W.winner >= 0) { W.t += dt; return; }
  W.t += dt;
  // 播报的时间点
  if (!W.said.welcome) { W.said.welcome = 1; W.ev.push({ t: 'say', k: 'welcome' }); }
  if (!W.said.five && W.t >= WAVE_FIRST - 5) { W.said.five = 1; W.ev.push({ t: 'say', k: 'five' }); }
  if (W.t >= W.nextWave) { W.nextWave += WAVE_EVERY; spawnWave(W); if (W.wave === 1) W.ev.push({ t: 'say', k: 'go' }); }
  // 经济
  if (W.t > WAVE_FIRST) for (const h of W._heroes) {
    const g = PASSIVE_GOLD * dt * (h.team === 1 ? DIFF[W.diff].goldMul : 1);
    h.gold += g; h.goldTotal += g;
  }
  spawnCamps(W);
  rebuildBk(W);
  updateVis(W);
  // 效果计时
  for (const u of W.units) {
    if (u.dead || !u.fx.length) continue;
    for (let i = u.fx.length - 1; i >= 0; i--) {
      const f = u.fx[i];
      if (f.k === 'dot') {
        f.acc = (f.acc || 0) + dt;
        if (f.acc >= 0.5) { f.acc -= 0.5; const src = byId(W, f.s); hurt(W, src && !src.dead ? src : null, u, f.v * 0.5, 't'); if (u.dead) break; }
      }
      else if (f.k === 'hot') { if (u.hp < u.maxHp) u.hp = Math.min(u.maxHp, u.hp + f.v * dt); }
      f.t -= dt;
      if (f.t <= 0 || (f.k === 'shield' && f.v <= 0)) u.fx.splice(i, 1);
    }
  }
  // 单位
  for (const u of W.units) {
    if (u.kind === 'hero') {
      const ox = u.x, oy = u.y;
      if (!u.isPlayer || W.auto) aiUpdate(W, u, dt);
      heroStep(W, u, dt);
      u.vx = u.vx * 0.7 + (u.x - ox) / dt * 0.3; u.vy = u.vy * 0.7 + (u.y - oy) / dt * 0.3;
      if (Math.abs(u.x - ox) > 200 || Math.abs(u.y - oy) > 200) { u.vx = 0; u.vy = 0; }
      continue;
    }
    if (u.dead) continue;
    if (u.kind === 'minion') minionStep(W, u, dt);
    else if (u.kind === 'tower' || u.kind === 'crystal') structStep(W, u, dt);
    else if (u.kind === 'monster') monsterStep(W, u, dt);
  }
  separate(W);
  // 弹道
  for (const p of W.projs) {
    if (p.dead) continue;
    if (p.kind === 'home') {
      const t = byId(W, p.tid);
      if (!t || t.dead) { p.dead = true; continue; }
      const dx = t.x - p.x, dy = (t.y - 14) - p.y, d = Math.hypot(dx, dy), s = p.spd * dt;
      if (d <= s + t.r * 0.5) { p.dead = true; if (!untarg(t)) HIT[p.on](W, p, t); }
      else { p.x += dx / d * s; p.y += dy / d * s; p.ang = Math.atan2(dy, dx); }
    } else {
      const s = Math.min(p.left, p.spd * dt);
      const n = Math.max(1, Math.ceil(s / 20));
      for (let k = 0; k < n && !p.dead; k++) {
        p.x += p.dx * s / n; p.y += p.dy * s / n; p.trav += s / n;
        near(W, p.x, p.y + 14, p.r, e => {
          if (p.dead || e.team === p.team || untarg(e) || e.kind === 'tower' || e.kind === 'crystal' || p.hit.includes(e.id)) return;
          if (e.kind === 'hero' && !canSee(W, p.team, e) && fxOn(e, 'invis')) return;
          p.hit.push(e.id);
          HIT[p.on](W, p, e);
        });
      }
      p.left -= s;
      if (p.left <= 0 && !p.dead) { p.dead = true; if (LINE_END[p.on]) LINE_END[p.on](W, p); }
    }
  }
  if (W.projs.some(p => p.dead)) W.projs = W.projs.filter(p => !p.dead);
  // 地面效果
  for (const z of W.zones) {
    if (z.done) continue;
    if (W.t - z.t0 >= z.delay) { z.done = true; ZONE[z.on](W, z); }
  }
  if (W.zones.some(z => z.done)) W.zones = W.zones.filter(z => !z.done);
  // 清理
  if (W._dirty) {
    W._dirty = false;
    W.units = W.units.filter(u => {
      if (u.dead && (u.kind === 'minion' || u.kind === 'monster')) { W._byId.delete(u.id); return false; }
      return true;
    });
  }
  if (W._s1 && W.t % 2 < dt) for (const k in W._s1) if (W.t - W._s1[k] > 3) delete W._s1[k];
}
// 小兵、英雄互相轻轻推开，别叠成一团
function separate(W) {
  for (const u of W.units) {
    if (u.dead || (u.kind !== 'minion' && u.kind !== 'hero' && u.kind !== 'monster')) continue;
    if (u.leap || u.dash) continue;
    let px = 0, py = 0;
    near(W, u.x, u.y, u.r + 10, o => {
      if (o === u || o.dead) return;
      const dx = u.x - o.x, dy = u.y - o.y, d = Math.hypot(dx, dy) || 0.01, min = u.r + o.r;
      if (d >= min) return;
      let w;
      if (o.kind === 'tower' || o.kind === 'crystal') w = 1;
      else if (u.kind === 'hero' && o.kind === 'minion') w = 0.08;
      else if (u.kind === 'minion' && o.kind === 'hero') w = 0.3;
      else w = 0.25;
      const push = (min - d) * w;
      px += dx / d * push; py += dy / d * push;
    });
    if (px || py) moveBy(W, u, clamp(px, -8, 8), clamp(py, -8, 8));
  }
}

/* ---------- 买装备 ---------- */
// 下一件该买什么：建议里第一件还没有的大件；钱不够就先买它缺的小件
function nextBuy(h) {
  const build = HERO_BY_ID[h.hid].build;
  const have = h.items.slice();
  for (const id of build) {
    if (have.includes(id)) { have.splice(have.indexOf(id), 1); continue; }
    const I = ITEMS[id], comps = (I.from || []).slice(), owned = [];
    const inv = have.slice();
    for (const c of comps) { const i = inv.indexOf(c); if (i >= 0) { owned.push(c); inv.splice(i, 1); } }
    const price = I.cost - owned.reduce((s, c) => s + ITEMS[c].cost, 0);
    const slotsAfter = h.items.length - owned.length + 1;
    if (h.gold >= price && slotsAfter <= 6) return { id, price, use: owned };
    // 先买一个缺的小件
    const missing = comps.slice();
    for (const c of owned) missing.splice(missing.indexOf(c), 1);
    if (missing.length && h.items.length < 6) {
      const c = missing.sort((a, b) => ITEMS[a].cost - ITEMS[b].cost)[0];
      return { id: c, price: ITEMS[c].cost, use: [], part: id };
    }
    return { id, price, use: owned };
  }
  return null;
}
function buy(W, h, nb) {
  if (!nb || h.gold < nb.price) return false;
  for (const c of nb.use) h.items.splice(h.items.indexOf(c), 1);
  if (h.items.length >= 6) return false;
  h.items.push(nb.id);
  h.gold -= nb.price;
  heroStats(h, false);
  W.ev.push({ t: 'buy', id: h.id, item: nb.id });
  return true;
}

if (typeof module !== 'undefined') module.exports = {};
