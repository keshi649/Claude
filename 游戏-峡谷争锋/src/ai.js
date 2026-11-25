'use strict';
/* ai.js：电脑英雄怎么打。每帧对每个电脑英雄调用 aiUpdate(W, h, dt)；它隔一会儿（看难度）想一次，只往 h.cmd 里写指令，由 sim.js 去做。
   想的顺序：买装备 → 回城中 / 泉水里回血 → 该不该跑 → 低血回城 → 打不打架 → 防守 → 打龙 → 抱团推进 → 自己的路（对抗路、中路、发育路、打野、游走）。 */

/* ---------- 兵线几何（每个队从自己基地往对面量） ---------- */
const LG = [0, 1].map(team => LANES.map(ln => {
  const pts = team ? ln.map(mir) : ln.slice();
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, cum, len: cum[cum.length - 1] };
}));
function laneProj(g, x, y) {
  let bs = 0, bd = 1e9;
  for (let i = 1; i < g.pts.length; i++) {
    const a = g.pts[i - 1], b = g.pts[i], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
    let t = ((x - a[0]) * dx + (y - a[1]) * dy) / l2; t = t < 0 ? 0 : t > 1 ? 1 : t;
    const d = Math.hypot(x - a[0] - dx * t, y - a[1] - dy * t);
    if (d < bd) { bd = d; bs = g.cum[i - 1] + t * Math.sqrt(l2); }
  }
  return { s: bs, d: bd };
}
function lanePos(g, s) {
  s = clamp(s, 0, g.len);
  for (let i = 1; i < g.pts.length; i++) if (s <= g.cum[i] || i === g.pts.length - 1) {
    const a = g.pts[i - 1], b = g.pts[i], seg = g.cum[i] - g.cum[i - 1], t = seg ? Math.min(1, (s - g.cum[i - 1]) / seg) : 0;
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }
  return g.pts[g.pts.length - 1].slice();
}

/* ---------- 局面缓存（每 0.25 秒算一次） ---------- */
function aiCache(W) {
  if (W._ac && W.t - W._ac.t < 0.25) return W._ac;
  const C = { t: W.t, front: [[0, 0, 0], [0, 0, 0]], structs: [], towerS: [[[], [], []], [[], [], []]] };
  for (const u of W.units) if ((u.kind === 'tower' || u.kind === 'crystal') && !u.dead) C.structs.push(u);
  // 每条路上双方建筑在兵线上的位置（按各自的方向量）
  for (const team of [0, 1]) for (let ln = 0; ln < 3; ln++) {
    const g = LG[team][ln], list = [];
    for (const s of C.structs) {
      if (s.kind === 'tower' && s.lane !== ln) continue;
      const p = laneProj(g, s.x, s.y);
      if (s.kind === 'crystal' || p.d < 300) list.push({ u: s, s: p.s });
    }
    C.towerS[team][ln] = list;
  }
  // 兵线前沿
  const best = [[-1, -1, -1], [-1, -1, -1]], foe = [[1e9, 1e9, 1e9], [1e9, 1e9, 1e9]];
  for (const u of W.units) {
    if (u.kind !== 'minion' || u.dead) continue;
    const s0 = laneProj(LG[u.team][u.lane], u.x, u.y).s;
    if (s0 > best[u.team][u.lane]) best[u.team][u.lane] = s0;
    const s1 = LG[u.team][u.lane].len - s0;               // 换成对面的方向
    if (s1 < foe[1 - u.team][u.lane]) foe[1 - u.team][u.lane] = s1;
  }
  for (const team of [0, 1]) for (let ln = 0; ln < 3; ln++) {
    let f = best[team][ln];
    if (f < 0) {
      const own = ownTowerS(C, team, ln);
      f = foe[team][ln] < 1e9 ? Math.max(own - 200, foe[team][ln] - 60) : own + 450;
    }
    C.front[team][ln] = f;
  }
  W._ac = C;
  return C;
}
// 我方这条路最外面那座塔在哪（兵线位置）
function ownTowerS(C, team, ln) {
  let s = 300;
  for (const t of C.towerS[team][ln]) if (t.u.team === team && t.s > s) s = t.s;
  return s;
}
// 敌方这条路最外面那座塔
function enemyTowerAhead(C, team, ln) {
  let best = null;
  for (const t of C.towerS[team][ln]) if (t.u.team !== team && (!best || t.s < best.s)) best = t;
  return best;
}
function enemyCover(C, team, x, y, margin) {
  for (const u of C.structs) if (u.team !== team && Math.hypot(u.x - x, u.y - y) < u.range + margin) return u;
  return null;
}
function towerBusy(W, tw, team) {           // 塔下有至少两个我方小兵在扛
  let n = 0;
  near(W, tw.x, tw.y, tw.range - 20, u => { if (u.kind === 'minion' && u.team === team) n++; });
  return n >= 2;
}
function power(h) {
  return (h.hp + shieldOf(h)) * (1 + (h.arm + h.mr) / 500) * (h.ad * asOf(h) + h.ap * 0.5 + h.lvl * 22 + 50);
}
function ownSpring(team) { return team ? mir(SPRING) : SPRING; }
function safePoint(W, h) {
  const C = aiCache(W), sp = ownSpring(h.team), dh = Math.hypot(h.x - sp[0], h.y - sp[1]);
  let best = null, bd = 1e9;
  for (const s of C.structs) {
    if (s.team !== h.team || s.kind !== 'tower') continue;
    const ds = Math.hypot(s.x - sp[0], s.y - sp[1]);
    if (ds > dh - 250) continue;                          // 只往基地方向跑
    const d = dist(h, s);
    if (d < bd) { bd = d; best = s; }
  }
  if (!best) return sp;
  // 站到塔后面一点
  const dx = sp[0] - best.x, dy = sp[1] - best.y, d = Math.hypot(dx, dy) || 1;
  return nearestWalk(best.x + dx / d * 160, best.y + dy / d * 160);
}
function lead(W, h, t, spd, delay, D) {    // 预判：按对方现在的速度往前推
  const d = dist(h, t), tt = d / spd + delay;
  const k = D.aim <= 45 ? 0.9 : 0.4;
  return [t.x + (t.vx || 0) * tt * k + (rnd(W) - 0.5) * D.aim * 2, t.y + (t.vy || 0) * tt * k + (rnd(W) - 0.5) * D.aim * 2];
}
function foeHeroes(W, h, r) {
  const out = [];
  for (const e of W._heroes) if (e.team !== h.team && !e.dead && canSee(W, h.team, e) && !untarg(e) && dist(h, e) < r) out.push(e);
  out.sort((a, b) => dist(h, a) - dist(h, b));
  return out;
}
function allyHeroes(W, h, r) {
  const out = [];
  for (const e of W._heroes) if (e.team === h.team && !e.dead && dist(h, e) < r) out.push(e);
  return out;
}
function minionCluster(W, h, r, need) {     // 射程内敌方小兵最密的地方
  const ms = [];
  near(W, h.x, h.y, r, u => { if (u.team !== h.team && (u.kind === 'minion' || u.kind === 'monster') && !u.dead) ms.push(u); });
  if (ms.length < need) return null;
  let best = null, bn = 0;
  for (const m of ms) { let n = 0; for (const o of ms) if (dist(m, o) < 150) n++; if (n > bn) { bn = n; best = m; } }
  return bn >= need ? [best.x, best.y] : null;
}

/* ---------- 技能怎么用 ---------- */
const SKAI = {
  engage(W, h, s, def, D, m, foes, tgt) {
    if (m !== 'fight' || !tgt) return null;
    const d = dist(h, tgt);
    if (d > def.range + 30 || d < 50) return null;
    const p = lead(W, h, tgt, 1300, 0, D); return { s, x: p[0], y: p[1] };
  },
  defend(W, h, s, def, D, m, foes) {
    if (foes.some(f => dist(h, f) < def.range + 40) && (m === 'fight' || m === 'flee' || W.t - h.lastHurt < 1)) return { s };
    if ((m === 'lane' || m === 'jungle') && minionCluster(W, h, def.range, 3) && rnd(W) < 0.3) return { s };
    return null;
  },
  ult_aoe(W, h, s, def, D, m, foes, tgt) {
    if (m !== 'fight' && m !== 'flee') return null;
    let best = null, bn = 0;
    const delay = def.id === 'm3' ? 0.9 : 0.55;
    for (const f of foes) {
      if (dist(h, f) > def.range + def.rad * 0.5) continue;
      const p = lead(W, h, f, 1e5, delay, D);
      let n = 0;
      for (const g of foes) if (Math.hypot(g.x - p[0], g.y - p[1]) < def.rad * 0.85) n++;
      if (n > bn) { bn = n; best = p; }
    }
    if (!best) return null;
    if (bn >= 2 || (tgt && tgt.hp / tgt.maxHp < 0.65) || (m === 'flee' && def.id === 't3')) return { s, x: best[0], y: best[1] };
    return null;
  },
  spin(W, h, s, def, D, m, foes) {
    if (m === 'fight' && foes.some(f => dist(h, f) < def.range + 20)) return { s };
    if ((m === 'lane' || m === 'jungle' || m === 'push') && minionCluster(W, h, def.range + 20, 3)) return { s };
    return null;
  },
  gap(W, h, s, def, D, m, foes, tgt) {
    if (m === 'fight' && tgt) {
      const d = dist(h, tgt);
      if (d > 170 && d < def.range + 60) { const p = lead(W, h, tgt, 1e5, 0.45, D); return { s, x: p[0], y: p[1] }; }
    }
    if (m === 'flee' && foes.some(f => dist(h, f) < 450)) { const sp = safePoint(W, h), [dx, dy] = dirTo(h, sp[0], sp[1]); return { s, x: h.x + dx * def.range, y: h.y + dy * def.range }; }
    return null;
  },
  execute(W, h, s, def, D, m, foes, tgt) {
    if (m !== 'fight' || !tgt) return null;
    if (dist(h, tgt) > def.range + 10) return null;
    const raw = sdmg(def, h.sk[s].rank - 1, h) + def.miss * (tgt.maxHp - tgt.hp);
    const est = raw * 200 / (200 + tgt.arm);
    if (est >= (tgt.hp + shieldOf(tgt)) * 0.85 || tgt.hp / tgt.maxHp < 0.3) return { s, x: tgt.x, y: tgt.y };
    return null;
  },
  dash(W, h, s, def, D, m, foes, tgt) {
    if (m === 'fight' && tgt) {
      const d = dist(h, tgt);
      if (d < def.range + 40 && d > 70) { const p = lead(W, h, tgt, 1500, 0, D), [dx, dy] = dirTo(h, p[0], p[1]); return { s, x: h.x + dx * def.range, y: h.y + dy * def.range }; }
    }
    if (m === 'flee' && foes.some(f => dist(h, f) < 500)) { const sp = safePoint(W, h), [dx, dy] = dirTo(h, sp[0], sp[1]); return { s, x: h.x + dx * def.range, y: h.y + dy * def.range }; }
    return null;
  },
  stealth(W, h, s, def, D, m, foes, tgt) {
    if (m === 'fight' && tgt) { const d = dist(h, tgt); if (d > 230 && d < 800) return { s }; }
    if (m === 'flee' && foes.some(f => dist(h, f) < 600)) return { s };
    return null;
  },
  ult_unit(W, h, s, def, D, m, foes, tgt) {
    if (m !== 'fight' || !tgt || dist(h, tgt) > def.range) return null;
    if (tgt.hp / tgt.maxHp < 0.75) return { s, id: tgt.id };
    return null;
  },
  poke(W, h, s, def, D, m, foes, tgt) {
    const spd = def.id === 'm1' ? 950 : 1300;
    let t = tgt && dist(h, tgt) < def.range - 30 ? tgt : foes.find(f => dist(h, f) < def.range - 40);
    if (t && (m === 'fight' || m === 'lane' || m === 'push' || m === 'flee')) {
      if (m === 'lane' && enemyCover(aiCache(W), h.team, h.x, h.y, 0)) return null;
      const p = lead(W, h, t, spd, 0, D); return { s, x: p[0], y: p[1] };
    }
    if (m === 'lane' || m === 'push' || m === 'jungle') {
      const c = minionCluster(W, h, def.range * 0.75, m === 'jungle' ? 1 : 3);
      if (c && rnd(W) < (m === 'jungle' ? 0.6 : 0.3)) return { s, x: c[0], y: c[1] };
    }
    return null;
  },
  cc_point(W, h, s, def, D, m, foes, tgt) {
    const t = tgt && dist(h, tgt) < def.range ? tgt : foes.find(f => dist(h, f) < def.range);
    if (t && (m === 'fight' || m === 'flee' || (m === 'lane' && rnd(W) < 0.5))) { const p = lead(W, h, t, 1e5, def.delay, D); return { s, x: p[0], y: p[1] }; }
    if ((m === 'push' || m === 'jungle') && rnd(W) < 0.2) { const c = minionCluster(W, h, def.range * 0.8, m === 'jungle' ? 1 : 4); if (c) return { s, x: c[0], y: c[1] }; }
    return null;
  },
  kite(W, h, s, def, D, m, foes, tgt) {
    if (m === 'fight' && tgt) {
      const d = dist(h, tgt);
      if (d < 220 && tgt.range < 300) { const [dx, dy] = dirTo(tgt, h.x, h.y); return { s, x: h.x + dx * def.range, y: h.y + dy * def.range }; }
      if (d > h.range + 20 && d < h.range + def.range && tgt.hp / tgt.maxHp < 0.35) return { s, x: tgt.x, y: tgt.y };
      if (d < h.range && rnd(W) < 0.25) { const sp = safePoint(W, h); return { s, x: sp[0], y: sp[1] }; }
    }
    if (m === 'flee' && foes.some(f => dist(h, f) < 450)) { const sp = safePoint(W, h); return { s, x: sp[0], y: sp[1] }; }
    return null;
  },
  ult_snipe(W, h, s, def, D, m, foes, tgt) {
    const dmg = sdmg(def, h.sk[s].rank - 1, h);
    let best = null;
    for (const e of foeHeroes(W, h, 2600)) {
      const est = dmg * 200 / (200 + e.arm);
      const cc = fxOn(e, 'stun') || fxOn(e, 'root');
      if (est >= e.hp * 0.95 || (cc && m === 'fight') || (m === 'fight' && e === tgt && e.hp / e.maxHp < 0.5)) { best = e; break; }
    }
    if (!best) return null;
    const p = lead(W, h, best, 1700, 0, D);
    return { s, x: p[0], y: p[1] };
  },
  heal(W, h, s, def, D, m) {
    if (h.hp / h.maxHp < 0.7) return { s };
    if (allyHeroes(W, h, def.range).some(a => a.hp / a.maxHp < 0.6)) return { s };
    return null;
  },
  cc_dir(W, h, s, def, D, m, foes, tgt) {
    const t = tgt && dist(h, tgt) < def.range - 30 ? tgt : foes.find(f => dist(h, f) < def.range - 40);
    if (t && (m === 'fight' || m === 'flee' || (m === 'lane' && rnd(W) < 0.4))) { const p = lead(W, h, t, 1100, 0, D); return { s, x: p[0], y: p[1] }; }
    return null;
  },
  ult_shield(W, h, s, def, D, m, foes) {
    if (m !== 'fight' && m !== 'flee') return null;
    const al = allyHeroes(W, h, def.range);
    if ((al.length >= 2 && al.some(a => a.hp / a.maxHp < 0.6)) || h.hp / h.maxHp < 0.4) return { s };
    return null;
  },
};
function useSkills(W, h, D, m, foes, tgt) {
  const c = h.cmd;
  if (c.cast) return;
  for (let s = 2; s >= 0; s--) {
    const st = h.sk[s];
    if (!st.rank || st.cd > 0) continue;
    if (rnd(W) > D.skill) continue;
    const def = sdef(h, s);
    const cast = SKAI[def.ai](W, h, s, def, D, m, foes, tgt);
    if (cast) { c.cast = cast; return; }
  }
}

/* ---------- 团队计划（每秒一次） ---------- */
function teamPlan(W, team) {
  W._plan = W._plan || [null, null];
  let p = W._plan[team];
  if (p && W.t - p.t < 1) return p;
  const C = aiCache(W);
  p = { t: W.t, defend: 0, defendPrio: 0, dragon: 0, dragonType: '', group: false, lane: 1 };
  for (const s of C.structs) {
    if (s.team !== team || s.inv) continue;
    let eh = 0, em = 0;
    near(W, s.x, s.y, 950, u => {
      if (u.team !== 1 - team || u.dead) return;
      if (u.kind === 'hero' && canSee(W, team, u)) eh++;
      else if (u.kind === 'minion' && dist(u, s) < s.range + 120) em++;
    });
    const prio = s.kind === 'crystal' ? 4 : s.tier + 1;
    if ((eh >= 1 && (em >= 1 || eh >= 2 || prio >= 3)) || (em >= 5 && prio >= 2)) {
      if (prio > p.defendPrio) { p.defend = s.id; p.defendPrio = prio; }
    }
  }
  const alive = [0, 1].map(tm => W._heroes.filter(h => h.team === tm && !h.dead));
  const lost = W.towersLost[0] + W.towersLost[1];
  if (W.t > 540 || lost >= 4 || (W.t > 240 && alive[team].length - alive[1 - team].length >= 2)) {
    p.group = true;
    // 推哪条：对面最外面那座塔离我们最近、最好打的那条
    let bestLn = 1, bs = 1e9;
    for (let ln = 0; ln < 3; ln++) {
      const et = enemyTowerAhead(C, team, ln);
      const sc = et ? et.s - (et.u.tier || 0) * 150 - (et.u.hp / et.u.maxHp) * 300 : 0;
      if (sc < bs) { bs = sc; bestLn = ln; }
    }
    p.lane = (W._plan.prevLane && W._plan.prevLane[team] != null && rnd(W) < 0.8) ? W._plan.prevLane[team] : bestLn;
    W._plan.prevLane = W._plan.prevLane || [null, null];
    W._plan.prevLane[team] = p.lane;
    // 当前推的这条对面没塔了（只剩水晶）也继续推
  }
  for (const c of W.camps) {
    if (c.side >= 0 || !c.uid) continue;
    const m = byId(W, c.uid); if (!m || m.dead) continue;
    const mine = alive[team], theirs = alive[1 - team];
    const hpOk = mine.reduce((s, h) => s + h.hp / h.maxHp, 0) / Math.max(1, mine.length) > 0.6;
    const lvl = mine.reduce((s, h) => s + h.lvl, 0) / Math.max(1, mine.length);
    if (c.type === 'drake' && lvl >= 4 && mine.length >= theirs.length && hpOk) { p.dragon = m.id; p.dragonType = 'drake'; }
    if (c.type === 'lord' && lvl >= 9 && mine.length >= 4 && mine.length - theirs.length >= 1 && hpOk) { p.dragon = m.id; p.dragonType = 'lord'; }
  }
  W._plan[team] = p;
  return p;
}

/* ---------- 每个英雄 ---------- */
function aiUpdate(W, h, dt) {
  if (h.dead) return;
  const ai = h.ai, c = h.cmd || (h.cmd = {});
  c.mv = null; c.atkAuto = false;
  // 躲地上的技能（冰环、流星）
  if (ai.dodge > W.t || ai.unstuckUntil > W.t) return;
  ai.next -= dt;
  const D = DIFF[h.team === 0 ? Math.max(1, W.diff) : W.diff];
  if (D.aim <= 45 && !h.dash && !h.leap) {
    for (const z of W.zones) {
      if (z.team === h.team) continue;
      const left = z.delay - (W.t - z.t0), d = Math.hypot(h.x - z.x, h.y - z.y);
      if (d < z.r + h.r && left < 0.6 && left > 0.1 && W.t - z.t0 > D.react && rnd(W) < 0.5) {
        const a = Math.atan2(h.y - z.y, h.x - z.x);
        c.goto = nearestWalk(z.x + Math.cos(a) * (z.r + 60), z.y + Math.sin(a) * (z.r + 60));
        c.atk = 0; ai.dodge = W.t + left; return;
      }
    }
  }
  if (ai.next > 0) return;
  ai.next = D.react * (0.75 + 0.5 * rnd(W));
  think(W, h, D);
  // 卡住了（想走却 5 秒没挪窝）：换条路
  if (!ai.stuckT || W.t - ai.stuckT > 5) {
    if (ai.sx != null && Math.hypot(h.x - ai.sx, h.y - ai.sy) < 30 && (c.goto || c.atk) && !h.recall) {
      h.path = null; c.atk = 0; c.goto = nearestWalk(h.x + (rnd(W) - 0.5) * 300, h.y + (rnd(W) - 0.5) * 300);
      ai.unstuck = (ai.unstuck || 0) + 1; ai.unstuckUntil = W.t + 1;
    }
    ai.sx = h.x; ai.sy = h.y; ai.stuckT = W.t;
  }
}
function think(W, h, D) {
  const c = h.cmd, ai = h.ai;
  const hp = h.hp / h.maxHp;
  const nb = nextBuy(h);
  if (nb && h.gold >= nb.price) buy(W, h, nb);
  const foes = foeHeroes(W, h, 1400);
  const nd = foes.length ? dist(h, foes[0]) : 1e9;
  const sp = ownSpring(h.team), dSp = Math.hypot(h.x - sp[0], h.y - sp[1]);
  ai.mode = 'idle';
  if (h.recall) {
    if (nd < 750) { h.recall = 0; } else { ai.mode = 'recall'; return; }
  }
  if (dSp < SPRING_R && hp < 0.92 && nd > 800) { c.goto = null; c.atk = 0; ai.mode = 'spring'; return; }
  if (hp < 0.4 && h.healCd <= 0 && (nd < 900 || W.t - h.lastHurt < 2)) c.heal = true;
  // 打得过吗
  const allies = allyHeroes(W, h, 1100);
  let mine = 0, theirs = 0;
  for (const a of allies) mine += power(a);
  for (const f of foes) if (dist(h, f) < 1150) theirs += power(f);
  const C = aiCache(W);
  const eCover = enemyCover(C, h.team, h.x, h.y, 60);
  if (eCover && !towerBusy(W, eCover, h.team)) theirs += 2.2e5 * (1 + W.t / 600);
  for (const s of C.structs) if (s.team === h.team && dist(h, s) < s.range) { mine += 2.2e5 * (1 + W.t / 600); break; }
  const ratio = theirs ? mine / theirs : 99;
  // 跑
  const lastTarget = byId(W, ai.tgt);
  const finishing = lastTarget && !lastTarget.dead && lastTarget.kind === 'hero' && lastTarget.hp / lastTarget.maxHp < 0.15 && dist(h, lastTarget) < h.range + 120;
  const flee = !finishing && (hp < 0.22 || (hp < 0.38 && nd < 650 && ratio < 1.4) || (ratio < 0.55 * D.brave && nd < 750) || (eCover && !towerBusy(W, eCover, h.team) && eCover.tgt === h.id && hp < 0.75));
  if (flee) { ai.mode = 'flee'; retreat(W, h, D, foes); return; }
  // 低血、附近没人：回城
  if (hp < 0.36 && nd > 1300 && W.t - h.lastHurt > 2.5 && dSp > 2000) { c.goto = null; c.atk = 0; c.recall = true; ai.mode = 'recall'; return; }
  const plan = teamPlan(W, h.team);
  // 打架
  const plan0 = W._plan && W._plan[h.team];
  const tgt = pickTarget(W, h, D, foes, ratio, !!(plan0 && plan0.group));
  if (tgt) {
    ai.tgt = tgt.id; ai.fightT = W.t; ai.mode = 'fight';
    c.atk = tgt.id; c.goto = null;
    useSkills(W, h, D, 'fight', foes, tgt);
    return;
  }
  ai.tgt = 0;
  // 防守
  if (plan.defend) {
    const s = byId(W, plan.defend);
    if (s && !s.dead && (dist(h, s) < 3000 || plan.defendPrio >= 3)) { ai.mode = 'defend'; defendAt(W, h, D, s, foes); return; }
  }
  // 打龙
  if (plan.dragon) {
    const m = byId(W, plan.dragon);
    const join = m && !m.dead && (plan.dragonType === 'lord' ? dist(h, m) < 4500 : (h.lane >= 2 && dist(h, m) < 2600) || dist(h, m) < 1500);
    if (join && hp > 0.45) {
      c.atk = m.id; c.goto = null; ai.mode = 'dragon';
      useSkills(W, h, D, 'jungle', foes, null);
      return;
    }
  }
  if (plan.group && h.lane !== 3 || plan.group && W.t > 720) { ai.mode = 'group'; pushLane(W, h, D, plan.lane, foes, true); return; }
  if (h.lane === 3) { ai.mode = 'jungle'; jungle(W, h, D, foes); }
  else if (h.lane === 4) { ai.mode = 'roam'; roam(W, h, D, foes); }
  else { ai.mode = 'lane'; pushLane(W, h, D, h.lane, foes, false); }
}
function pickTarget(W, h, D, foes, ratio, grouped) {
  if (!foes.length) return null;
  const C = aiCache(W);
  // 抱团的时候看到对面就压上去（不然两边各守各的塔，谁也不动）
  const engR = grouped && ratio >= 1 / D.brave ? 1150 : h.range > 300 ? h.range + 230 : 480;
  const hp = h.hp / h.maxHp;
  let best = null, bs = 1e9;
  for (const f of foes) {
    const d = dist(h, f);
    if (d > engR) continue;
    const fhp = f.hp / f.maxHp;
    const tw = enemyCover(C, h.team, f.x, f.y, 30);
    if (tw && !(fhp < 0.22 && hp > 0.6) && !(towerBusy(W, tw, h.team) && fhp < 0.4 && hp > 0.7)) continue;   // 不越塔
    const sc = fhp * 1.4 + d / 900 + (f.hid === 'tank' ? 0.4 : 0);
    if (sc < bs) { bs = sc; best = f; }
  }
  if (!best) return null;
  const fhp = best.hp / best.maxHp;
  const keep = h.ai.tgt === best.id && W.t - (h.ai.fightT || -9) < 2 && ratio > 0.8;
  const need = 1.1 / D.brave;
  if (ratio >= need || keep || (fhp < 0.3 && hp > 0.45 && ratio > 0.6) || (W.t - h.lastHeroHurt < 1.2 && ratio > 0.85 && dist(h, best) < h.range + 80)) return best;
  return null;
}
function retreat(W, h, D, foes) {
  const c = h.cmd, sp = safePoint(W, h), hp = h.hp / h.maxHp;
  c.atk = 0; c.goto = sp;
  const close = foes.length && dist(h, foes[0]) < 330;
  if (close && hp < 0.18 && h.flashCd <= 0 && rnd(W) < D.skill) c.flash = [sp[0], sp[1]];
  useSkills(W, h, D, 'flee', foes, foes[0] || null);
  if (!foes.length || dist(h, foes[0]) > 1200) {
    if (W.t - h.lastHurt > 2.5 && hp < 0.6 && Math.hypot(h.x - ownSpring(h.team)[0], h.y - ownSpring(h.team)[1]) > 1800) { c.goto = null; c.recall = true; }
  }
}
function defendAt(W, h, D, s, foes) {
  const c = h.cmd;
  // 先打塔下的敌方小兵，敌方英雄靠近由打架逻辑处理
  let best = null, bd = 1e9;
  near(W, s.x, s.y, s.range + 200, u => {
    if (u.team !== 1 - h.team || u.dead || !attackable(W, h.team, u)) return;
    const d = dist(h, u) + (u.kind === 'minion' ? 0 : 400);
    if (d < bd) { bd = d; best = u; }
  });
  if (best) { c.atk = best.id; c.goto = null; useSkills(W, h, D, 'push', foes, null); }
  else { c.atk = 0; c.goto = nearestWalk(s.x + (rnd(W) - 0.5) * 200, s.y + (rnd(W) - 0.5) * 200); }
}
// 推线 / 守线
function pushLane(W, h, D, ln, foes, group) {
  const c = h.cmd, C = aiCache(W), g = LG[h.team][ln];
  const front = C.front[h.team][ln];
  const ranged = h.range > 300;
  let s = front - (ranged ? 330 : 170) - (h.lane === 4 ? 110 : 0) - (group ? 60 * (h.slot % 3) : 0);
  s = Math.max(s, ownTowerS(C, h.team, ln) - 250);       // 新一波兵刚出门时别跟着退回基地
  const et = enemyTowerAhead(C, h.team, ln);
  const busy = et && towerBusy(W, et.u, h.team);
  if (et && !busy) s = Math.min(s, et.s - et.u.range - 70);
  s = Math.max(s, 200);
  const p0 = lanePos(g, s);
  const off = ((h.slot * 37) % 5 - 2) * 28;
  const p1 = lanePos(g, s + 40);
  const nx = -(p1[1] - p0[1]), ny = p1[0] - p0[0], nl = Math.hypot(nx, ny) || 1;
  const pos = nearestWalk(p0[0] + nx / nl * off, p0[1] + ny / nl * off);
  // 找目标
  let tgt = null;
  const myHit = h.ad * 0.9;
  let low = null, lowHp = 1e9, anyM = null, anyHp = 1e9;
  near(W, h.x, h.y, h.range + 220, u => {
    if (u.kind !== 'minion' || u.team === h.team || u.dead) return;
    if (edge(h, u) > h.range + 160) return;
    const cov = enemyCover(C, h.team, u.x, u.y, 20);
    if (cov && !towerBusy(W, cov, h.team)) return;
    if (u.hp < lowHp) { lowHp = u.hp; low = u; }
    if (u.hp < anyHp) { anyHp = u.hp; anyM = u; }
  });
  if (low && low.hp <= myHit * 1.08 && rnd(W) < D.lastHit + 0.15) tgt = low;
  else if (anyM && (group || h.lane !== 4)) tgt = anyM;
  if (!tgt && et && !et.u.inv && dist(h, et.u) < et.u.range + 450) {
    const allies = allyHeroes(W, et.u, 800).length;
    const enemiesNear = foes.some(f => dist(f, et.u) < 1000);
    if (busy || (group && allies >= 2 && !enemiesNear && h.hp / h.maxHp > 0.5)) tgt = et.u;
  }
  // 骚扰对面英雄
  if (!tgt && foes.length) {
    const f = foes[0];
    if (edge(h, f) < h.range + 20 && !enemyCover(C, h.team, h.x, h.y, 40) && h.hp / h.maxHp > f.hp / f.maxHp - 0.1 && rnd(W) < (ranged ? 0.55 : 0.3) * D.brave) tgt = f;
  }
  c.atk = tgt ? tgt.id : 0;
  c.goto = tgt ? null : pos;
  useSkills(W, h, D, group ? 'push' : 'lane', foes, tgt && tgt.kind === 'hero' ? tgt : null);
}
// 打野
function jungle(W, h, D, foes) {
  const c = h.cmd, ai = h.ai;
  // 抓人：哪条路上对面英雄残血、离我不远、我方有人在
  if (h.lvl >= 3 && h.hp / h.maxHp > 0.55) {
    let best = null, bd = 1e9;
    for (const e of W._heroes) {
      if (e.team === h.team || e.dead || !canSee(W, h.team, e)) continue;
      const d = dist(h, e);
      if (d > 2000 || e.hp / e.maxHp > 0.6) continue;
      if (enemyCover(aiCache(W), h.team, e.x, e.y, 0)) continue;
      if (!allyHeroes(W, e, 900).length) continue;
      if (d < bd) { bd = d; best = e; }
    }
    if (best) { c.atk = 0; c.goto = [best.x, best.y]; ai.gankT = W.t; return; }
  }
  // 刷野
  let best = null, bs = 1e9;
  for (const cp of W.camps) {
    if (cp.side < 0 || !cp.uid) continue;
    const m = byId(W, cp.uid); if (!m || m.dead) continue;
    if (cp.side !== h.team && W.t < 240) continue;
    let sc = Math.hypot(cp.x - h.x, cp.y - h.y);
    if (cp.side !== h.team) sc += 900;
    if ((cp.type === 'red' && !fxOn(h, 'red')) || (cp.type === 'blue' && !fxOn(h, 'blue'))) sc -= 600;
    // 有敌方英雄在旁边的营地不去
    if (foes.some(f => Math.hypot(f.x - cp.x, f.y - cp.y) < 700)) sc += 2000;
    if (sc < bs) { bs = sc; best = m; }
  }
  if (best && bs < 3500) {
    c.atk = dist(h, best) < 900 ? best.id : 0;
    c.goto = c.atk ? null : [best.x, best.y];
    if (c.atk) useSkills(W, h, D, 'jungle', foes, null);
    return;
  }
  // 野都没刷：去等最近要刷的，或者帮最近的路
  let soon = null, st = 1e9;
  for (const cp of W.camps) if (cp.side === h.team && !cp.uid && cp.respawnAt - W.t < st) { st = cp.respawnAt - W.t; soon = cp; }
  if (soon && st < 12) { c.atk = 0; c.goto = nearestWalk(soon.x + 80, soon.y + 80); return; }
  let bestLn = 1, bd = 1e9;
  for (let ln = 0; ln < 3; ln++) { const p = lanePos(LG[h.team][ln], aiCache(W).front[h.team][ln]); const d = Math.hypot(p[0] - h.x, p[1] - h.y); if (d < bd) { bd = d; bestLn = ln; } }
  pushLane(W, h, D, bestLn, foes, false);
}
// 游走（辅助）：跟着发育路的射手，没了就跟中路
function roam(W, h, D, foes) {
  const c = h.cmd;
  let buddy = null;
  for (const pref of [2, 1, 0, 3]) {
    const b = W._heroes.find(a => a.team === h.team && a !== h && a.lane === pref && !a.dead && !a.recall && Math.hypot(a.x - ownSpring(h.team)[0], a.y - ownSpring(h.team)[1]) > 1400);
    if (b) { buddy = b; break; }
  }
  if (!buddy) { pushLane(W, h, D, 2, foes, false); return; }
  const sp = ownSpring(h.team), dx = sp[0] - buddy.x, dy = sp[1] - buddy.y, d = Math.hypot(dx, dy) || 1;
  const pos = nearestWalk(buddy.x + dx / d * 120 + (h.slot % 2 ? 50 : -50), buddy.y + dy / d * 120);
  // 对面英雄靠近射手：骚扰
  let tgt = null;
  if (foes.length && edge(h, foes[0]) < h.range + 10 && !enemyCover(aiCache(W), h.team, foes[0].x, foes[0].y, 0) && rnd(W) < 0.5 * D.brave) tgt = foes[0];
  c.atk = tgt ? tgt.id : 0;
  c.goto = tgt ? null : pos;
  useSkills(W, h, D, 'lane', foes, tgt);
}

if (typeof module !== 'undefined') module.exports = {};
