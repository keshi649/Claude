'use strict';
/* props.js：本片的场景和道具——公园赛道（草地、土路、河和桥、小池塘和环路、起点牌、终点拱门）、金币、
   回放训练记录（exp.js 里真实训练出来的轨迹）、训练台界面（顶栏、记分表、原理卡、出处条）、
   以及直接在屏幕上按整数倍画小怪的工具。全部程序画的像素图。 */

/* ================= 小怪：直接按整数倍画到屏幕上 ================= */
/* (cx, by)：身体中线、脚底（屏幕坐标）；k：一个世界像素占几个屏幕像素 */
function crabAt(g, cx, by, k, o = {}, flip = false) {
  const c = clawd(o), x = Math.round(cx - 12 * k), y = Math.round(by - 16 * k);
  g.save(); g.imageSmoothingEnabled = false;
  if (!flip) g.drawImage(c, x - CL_OX * k, y - CL_OY * k, CL_W * k, CL_H * k);
  else { g.translate(x + 24 * k, y - CL_OY * k); g.scale(-1, 1); g.drawImage(c, -CL_OX * k, 0, CL_W * k, CL_H * k); }
  g.restore();
}
/* AI 小怪：头顶小天线，灯一闪一闪 */
const aiO = (t, o = {}) => Object.assign({ hat: 'antenna', light: Math.floor(t * 2.2) % 2 ? '#7CF0A0' : '#3FBF6A', eyes: blinkEyes(t, 3) }, o);
/* "你"：红领巾、会眨眼（对话框头像用） */
const youO = (t, o = {}) => Object.assign({ scarf: true, eyes: blinkEyes(t, 1) }, o);
/* 脚下的影子（屏幕坐标） */
function shadowAt(g, cx, by, k, w = 20) { g.save(); g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(Math.round(cx - w / 2 * k), by, Math.round(w * k), k); g.fillRect(Math.round(cx - (w / 2 - 2) * k), by + k, Math.round((w - 4) * k), k); g.restore(); }

/* ================= 小工具 ================= */
function clipRect(g, x, y, w, h, fn) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); }
function mixHex(a, b, u) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = s => [(s >> 16) & 255, (s >> 8) & 255, s & 255];
  const [r1, g1, b1] = ch(pa), [r2, g2, b2] = ch(pb);
  const f = (x, y) => Math.round(x + (y - x) * clamp(u)).toString(16).padStart(2, '0');
  return '#' + f(r1, r2) + f(g1, g2) + f(b1, b2);
}
/* 字符画按 k 倍画到屏幕上，(x, y) 是中心 */
function pix(g, rows, pal, x, y, k, o = {}) {
  const h = rows.length, w = Math.max(...rows.map(r => r.length));
  const x0 = Math.round(x - w * k / 2), y0 = Math.round(y - h * k / 2);
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = pal[r[i]]; if (c) { g.fillStyle = c; g.fillRect(x0 + (o.flip ? w - 1 - i : i) * k, y0 + j * k, k, k); } } });
}
function checkMark(g, x, y, k = 6, col = C.green) { g.fillStyle = col; [[0, 2], [1, 3], [2, 4], [3, 3], [4, 2], [5, 1], [6, 0]].forEach(([i, j]) => g.fillRect(x + i * k, y + j * k, k, k)); }
function crossMark(g, x, y, k = 6, col = C.red) { g.fillStyle = col; for (let i = 0; i < 6; i++) { g.fillRect(x + i * k, y + i * k, k, k); g.fillRect(x + (5 - i) * k, y + i * k, k, k); } }
/* 虚线箭头（屏幕坐标，k 像素一格）；u 0..1 画出多少 */
function pixArrow(g, x0, y0, x1, y1, k, col, u = 1) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), n = Math.floor(L * u / k);
  g.fillStyle = col;
  for (let i = 0; i < n; i++) if (i % 3 !== 2) g.fillRect(Math.round(x0 + dx * i * k / L - k / 2), Math.round(y0 + dy * i * k / L - k / 2), k, k);
  if (u >= 1) { const a = Math.atan2(dy, dx); for (const s of [-1, 1]) for (let i = 1; i <= 3; i++) g.fillRect(Math.round(x1 - Math.cos(a + s * .6) * i * k - k / 2), Math.round(y1 - Math.sin(a + s * .6) * i * k - k / 2), k, k); }
}
/* 飘起来的字："+1" 之类（屏幕坐标，从 (x,y) 往上飘、淡出） */
function floatText(g, t, t0, x, y, s, o = {}) {
  const d = o.d || .9; if (t < t0 || t > t0 + d) return;
  const u = (t - t0) / d, px = o.px || 36;
  withAlpha(g, clamp((1 - u) * 2.5), () => ptext(g, s, x, y - E.out(u) * (o.rise || 60), px, o.col || C.gold, { align: 'center', ol: o.ol || C.ink, olw: px / 9 }));
}
/* 背景：深色训练台（细网格 + 中间亮一点） */
function bgConsole(g, t, o = {}) {
  g.fillStyle = o.c1 || '#0D1220'; g.fillRect(0, 0, W, H);
  g.fillStyle = o.c2 || 'rgba(110,170,255,.05)';
  for (let x = 0; x < W; x += 48) g.fillRect(x, 0, 2, H);
  for (let y = 0; y < H; y += 48) g.fillRect(0, y, W, 2);
  const gr = g.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1100);
  gr.addColorStop(0, 'rgba(60,90,160,.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
}

/* ================= 训练记录（experiment.py 真跑出来的） ================= */
const X = window.EXP;
const TILE = 32;                                   // 一格 32 个世界像素
const MAPW = X.W * TILE, MAPH = X.H * TILE;        // 640 × 320
const CELL = X.cells.map(([x, y]) => [x, y]);
const CIDX = {}; CELL.forEach(([x, y], i) => { CIDX[x + ',' + y] = i; });
const RINGC = X.ring.map(([x, y]) => CIDX[x + ',' + y]);
const FIN = CIDX[X.finish[0] + ',' + X.finish[1]];
const MS = X.milestones;
const tileAt = (x, y) => (y >= 0 && y < X.H && x >= 0 && x < X.W) ? X.map[y][x] : 'T';
const walk = ch => '.SoF='.includes(ch);

/* 一局回放：按规则重算每一步的金币、分数（和 experiment.py 的 Race 一样） */
function simRace(path, rule) {
  const alive = {}, steps = [];
  let score = 0;
  RINGC.forEach(c => { alive[c] = rule === 'coin' ? -99 : null; });     // 值 = 被吃掉的那一步；-99 = 一直在；null = 撤了
  const isAlive = (c, t) => alive[c] !== null && (alive[c] === -99 || t - alive[c] > X.respawn);
  for (let i = 0; i < path.length; i++) {
    const ev = [];
    if (i > 0) {
      const c = path[i], old = path[i - 1];
      if (c in alive && c !== old && isAlive(c, i)) { alive[c] = i; score += 1; ev.push('coin'); }
      if (rule === 'shaping' && X.dist[c] < X.dist[old]) { score += 1; ev.push('closer'); }
      if (c === FIN) { score += 10; ev.push('finish'); }
    }
    const coins = RINGC.map(c => isAlive(c, i));
    steps.push({ score, ev, coins });
  }
  return steps;
}
const REPLAY = {};
function replayOf(name, rule) {
  if (!REPLAY[name]) { const r = X.replays[name]; REPLAY[name] = { path: r.path, steps: simRace(r.path, rule) }; }
  return REPLAY[name];
}
/* 回放到时刻 t：u = 走了几步（小数）；返回小怪在世界里的位置、朝向、这一步的状态 */
function replayAt(rp, t, t0, sps, o = {}) {
  const n = rp.path.length - 1;
  let u = Math.max(0, (t - t0) * sps);
  if (o.loopFrom !== undefined && u > n) u = o.loopFrom + (u - o.loopFrom) % (n - o.loopFrom);
  u = Math.min(u, n);
  const i = Math.floor(u), f = u - i, a = rp.path[i], b = rp.path[Math.min(n, i + 1)];
  const [ax, ay] = CELL[a], [bx, by] = CELL[b];
  const e = E.io(clamp(f * 1.25));
  const x = lerp(ax, bx, e), y = lerp(ay, by, e);
  const hop = a !== b ? Math.sin(Math.PI * clamp(f * 1.25)) : 0;
  return { x, y, hop, i, f, cell: a, next: b, st: rp.steps[i], moving: a !== b, dir: bx - ax, done: u >= n };
}
/* 回放里每一步的发生时刻（给音效、飘字用） */
const stepTime = (t0, sps, i) => t0 + i / sps;

/* ================= 公园地图（世界像素，640×320） ================= */
const GR = { g0: '#77C35B', g1: '#68B24F', g2: '#8BD36C', g3: '#5CA247', d0: '#E3C08A', d1: '#CFA46A', d2: '#F1D6A4', d3: '#BD8F57',
  w0: '#4E9EE8', w1: '#3B82CC', w2: '#8CCBFF', wood: '#B57B45', wood2: '#8A5A2E', wood3: '#D69A5C', leaf0: '#2E7539', leaf1: '#3F9446', leaf2: '#5CB75A', leaf3: '#86D46E', trunk: '#7A5232' };
function parkBase() {
  return cached('parkBase', MAPW, MAPH, g => {
    const rnd = R(77);
    // 草地：底色 + 斑点
    for (let y = 0; y < MAPH; y++) for (let x = 0; x < MAPW; x++) {
      const h = hash(x, y, 5);
      g.fillStyle = h < .06 ? GR.g1 : h < .1 ? GR.g2 : h < .102 ? GR.g3 : GR.g0; g.fillRect(x, y, 1, 1);
    }
    // 草丛小簇
    for (let i = 0; i < 260; i++) {
      const x = Math.floor(rnd() * MAPW), y = Math.floor(rnd() * MAPH);
      if (walk(tileAt(Math.floor(x / TILE), Math.floor(y / TILE)))) continue;
      prect(g, x, y, 1, 2, GR.g3); prect(g, x + 2, y - 1, 1, 3, GR.g3); prect(g, x + 1, y + 1, 1, 1, GR.g1);
    }
    // 土路：每格画满，跟草地交界处描一圈深色边
    for (let ty = 0; ty < X.H; ty++) for (let tx = 0; tx < X.W; tx++) {
      const ch = tileAt(tx, ty); if (!'.SoF'.includes(ch)) continue;
      const x0 = tx * TILE, y0 = ty * TILE;
      prect(g, x0, y0, TILE, TILE, GR.d0);
      for (let k = 0; k < 18; k++) { const px = x0 + Math.floor(hash(tx, ty, k) * TILE), py = y0 + Math.floor(hash(ty, tx, k + 9) * TILE); pdot(g, px, py, k % 3 ? GR.d2 : GR.d1); }
      const nb = (dx, dy) => '.SoF='.includes(tileAt(tx + dx, ty + dy));
      if (!nb(0, -1)) { prect(g, x0, y0, TILE, 2, GR.d3); }
      if (!nb(0, 1)) { prect(g, x0, y0 + TILE - 2, TILE, 2, GR.d3); }
      if (!nb(-1, 0)) { prect(g, x0, y0, 2, TILE, GR.d3); }
      if (!nb(1, 0)) { prect(g, x0 + TILE - 2, y0, 2, TILE, GR.d3); }
    }
    // 河
    for (let ty = 0; ty < X.H; ty++) for (let tx = 0; tx < X.W; tx++) {
      const ch = tileAt(tx, ty); if (ch !== '~' && ch !== '=') continue;
      const x0 = tx * TILE, y0 = ty * TILE;
      prect(g, x0 + 3, y0, TILE - 6, TILE, GR.w0);
      prect(g, x0 + 3, y0, 2, TILE, GR.w1); prect(g, x0 + TILE - 5, y0, 2, TILE, GR.w1);
      prect(g, x0 + 1, y0, 2, TILE, '#5E8A3E'); prect(g, x0 + TILE - 3, y0, 2, TILE, '#5E8A3E');
    }
    // 桥（路横着过河）
    for (let ty = 0; ty < X.H; ty++) for (let tx = 0; tx < X.W; tx++) {
      if (tileAt(tx, ty) !== '=') continue;
      const x0 = tx * TILE - 4, y0 = ty * TILE + 2, w = TILE + 8, h = TILE - 4;
      prect(g, x0, y0 + 2, w, h - 4, GR.wood);
      for (let i = 0; i < w; i += 5) prect(g, x0 + i, y0 + 2, 1, h - 4, GR.wood2);
      prect(g, x0, y0, w, 3, GR.wood2); prect(g, x0, y0 + h - 3, w, 3, GR.wood2);
      prect(g, x0, y0, w, 1, GR.wood3); prect(g, x0, y0 + h - 3, w, 1, GR.wood3);
      for (const px of [x0, x0 + w - 3]) { prect(g, px, y0 - 2, 3, 5, GR.wood2); prect(g, px, y0 + h - 4, 3, 5, GR.wood2); }
    }
    // 池塘（环路中间那一格）：水 + 荷叶
    for (let ty = 0; ty < X.H; ty++) for (let tx = 0; tx < X.W; tx++) {
      if (tileAt(tx, ty) !== 'p') continue;
      const cx = tx * TILE + 16, cy = ty * TILE + 16;
      pell(g, cx, cy, 15, 14, '#5E8A3E'); pell(g, cx, cy, 13, 12, GR.w1); pell(g, cx, cy - 1, 12, 10, GR.w0);
      pell(g, cx + 5, cy + 4, 4, 3, '#3F9446'); pdot(g, cx + 5, cy + 2, GR.w0); pell(g, cx - 6, cy - 4, 3, 2, '#5CB75A');
    }
    // 花
    for (let i = 0; i < 90; i++) {
      const x = 2 + Math.floor(rnd() * (MAPW - 4)), y = 2 + Math.floor(rnd() * (MAPH - 4));
      const ch = tileAt(Math.floor(x / TILE), Math.floor(y / TILE)); if (ch !== ' ') continue;
      const col = ['#FFFFFF', '#FFE066', '#FF9BC0', '#B9A6FF'][i % 4];
      pdot(g, x, y - 1, col); pdot(g, x - 1, y, col); pdot(g, x + 1, y, col); pdot(g, x, y + 1, col); pdot(g, x, y, '#FFD34E');
    }
    // 树（边上一圈，加上草地里零星几棵）
    const trees = [];
    for (let ty = 0; ty < X.H; ty++) for (let tx = 0; tx < X.W; tx++) if (tileAt(tx, ty) === 'T') trees.push([tx * TILE + 16 + (hash(tx, ty, 1) - .5) * 8, ty * TILE + 22 + (hash(tx, ty, 2) - .5) * 6, .9 + hash(tx, ty, 3) * .25]);
    [[8, 2], [3, 1], [7, 7], [14, 1], [15, 5], [12, 8], [19, 5], [8, 8], [5, 3], [16, 8], [11, 2], [14, 3]].forEach(([tx, ty]) => {
      if (tileAt(tx, ty) === ' ') trees.push([tx * TILE + 16, ty * TILE + 22, 1]);
    });
    trees.sort((a, b) => a[1] - b[1]).forEach(([x, y, s]) => drawTree(g, x, y, s));
    // 起点牌（起点左边的草地上）
    const [sx, sy] = X.start;
    drawSign(g, sx * TILE - 10, sy * TILE + 20);
  });
}
function drawTree(g, x, y, s = 1) {
  pell(g, x, y + 7, 10 * s, 3, 'rgba(30,60,30,.35)');
  prect(g, x - 2, y - 2, 4, 9, GR.trunk); prect(g, x - 2, y - 2, 1, 9, '#5E3D24');
  const r = Math.round(11 * s);
  pdisc(g, x, y - 10, r, GR.leaf0); pdisc(g, x - 4, y - 12, r - 3, GR.leaf1); pdisc(g, x + 3, y - 11, r - 4, GR.leaf1);
  pdisc(g, x - 4, y - 15, r - 6, GR.leaf2); pdisc(g, x - 6, y - 17, 2, GR.leaf3);
}
function drawSign(g, x, y) {
  prect(g, x - 1, y - 8, 2, 12, GR.trunk);
  prect(g, x - 11, y - 18, 22, 11, '#F4EAD2'); prect(g, x - 11, y - 18, 22, 1, '#FFFFFF'); prect(g, x - 11, y - 8, 22, 1, '#B5A27A');
  // "起点" 两个小色块当字（像素太小写不了字，屏幕上另外标）
  prect(g, x - 8, y - 15, 7, 5, '#5BA85A'); prect(g, x + 1, y - 15, 7, 5, '#E5322D');
}
/* 每帧在地图上画会动的东西：水波、金币、终点拱门的旗、池塘里的青蛙 */
function parkDynamic(b, t, o = {}) {
  b.drawImage(parkBase(), 0, 0);
  // 水波（往下流）
  for (let ty = 0; ty < X.H; ty++) for (let tx = 0; tx < X.W; tx++) {
    const ch = tileAt(tx, ty); if (ch !== '~') continue;
    for (let k = 0; k < 3; k++) {
      const yy = ty * TILE + ((hash(tx, ty, k) * TILE + t * 14) % TILE), xx = tx * TILE + 7 + Math.floor(hash(ty, k, tx) * 16);
      prect(b, xx, yy, 4, 1, GR.w2);
    }
  }
  // 池塘里一闪一闪
  const ph = (t * 1.3) % 1;
  if (ph < .5) pdot(b, 3 * TILE + 10, 5 * TILE + 12, '#FFFFFF');
  // 青蛙：蹲在荷叶上看小怪转圈
  if (o.frog !== false) drawFrog(b, 3 * TILE + 21, 5 * TILE + 18, t);
  // 终点拱门
  drawFinish(b, t, o.finishGlow || 0);
  // 金币
  if (o.coins) RINGC.forEach((c, k) => {
    const vis = o.coins[k];
    if (vis <= 0) return;
    const [cx, cy] = CELL[c];
    drawCoin(b, cx * TILE + 16, cy * TILE + 15 + Math.round(Math.sin(t * 4 + k) * 1.2), t + k * .3, vis);
  });
}
function drawFrog(b, x, y, t) {
  const blink = (t % 2.7) < .12;
  prect(b, x - 3, y - 2, 7, 4, '#4FAE3E'); prect(b, x - 3, y - 4, 2, 2, '#4FAE3E'); prect(b, x + 2, y - 4, 2, 2, '#4FAE3E');
  pdot(b, x - 3, y - 4, blink ? '#4FAE3E' : '#1B1730'); pdot(b, x + 3, y - 4, blink ? '#4FAE3E' : '#1B1730');
  prect(b, x - 2, y, 5, 1, '#C6EFA8');
}
function drawCoin(b, x, y, t, vis = 1) {
  const sq = [1, .8, .45, .15, .45, .8][Math.floor(t * 8) % 6], s = lerp(.2, 1, clamp(vis));
  const rx = Math.max(1, 6 * sq * s), ry = Math.max(1, 6 * s);
  pell(b, x, y + Math.round(ry) + 2, Math.max(1, rx), 1, 'rgba(30,50,20,.35)');
  pell(b, x, y, rx, ry, '#B97A12');
  if (rx > 2) pell(b, x, y, rx - 1, ry - 1, '#F2B829');
  if (rx > 3) { pell(b, x, y, rx - 2.5, ry - 2.5, '#FFD34E'); prect(b, x - 1, y - Math.round(ry) + 3, 2, Math.max(1, Math.round(ry * 2) - 6), '#E8A920'); }
  if (rx > 2) { pdot(b, x - Math.round(rx * .5), y - Math.round(ry * .5), '#FFF6C8'); pdot(b, x - Math.round(rx * .5) + 1, y - Math.round(ry * .5), '#FFF6C8'); }
}
/* 终点：横在路上的拱门 + 格子旗 */
function drawFinish(b, t, glow = 0) {
  const [fx, fy] = X.finish, x0 = fx * TILE, y0 = fy * TILE;
  // 地上的格子线
  for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) prect(b, x0 + i * 4, y0 + 2 + j * 4, 4, 4, (i + j) % 2 ? '#1B1730' : '#FFFFFF');
  // 两根柱子
  prect(b, x0 - 3, y0 - 20, 3, 30, '#E8E8F0'); prect(b, x0 + TILE, y0 - 20, 3, 30, '#E8E8F0');
  prect(b, x0 - 3, y0 - 20, 1, 30, '#FFFFFF'); prect(b, x0 + TILE + 2, y0 - 20, 1, 30, '#B8B8C8');
  // 横幅
  const by = y0 - 24;
  prect(b, x0 - 5, by, TILE + 10, 9, glow > 0 ? mixHex('#E5322D', '#FFD34E', glow) : '#E5322D');
  prect(b, x0 - 5, by, TILE + 10, 1, '#FF7A6E'); prect(b, x0 - 5, by + 8, TILE + 10, 1, '#A81E1A');
  for (let i = 0; i < 6; i++) prect(b, x0 - 1 + i * 6, by + 3, 3, 3, '#FFFFFF');
  // 旗杆 + 飘动的格子旗（右边草地上）
  const px = x0 + TILE + 8, py = y0 - 2;
  prect(b, px, py - 30, 2, 34, '#C9CED8'); pdot(b, px, py - 31, '#FFD34E');
  for (let i = 0; i < 12; i++) for (let j = 0; j < 8; j++) {
    const yy = py - 29 + j + Math.round(Math.sin(t * 6 - i * .55) * 1.5 * (i / 12));
    prect(b, px + 2 + i, yy, 1, 1, ((Math.floor(i / 3) + Math.floor(j / 3)) % 2) ? '#1B1730' : '#FFFFFF');
  }
}
/* 在世界缓冲里画 AI 小怪：(wx, wy) 是格子坐标（可带小数） */
function drawAgent(b, t, wx, wy, o = {}) {
  const hop = Math.round((o.hop || 0) * 5);
  const x = Math.round(wx * TILE + 16), foot = Math.round(wy * TILE + 26) - hop;
  pell(b, x, Math.round(wy * TILE + 27), 10 - hop, 2, 'rgba(20,40,20,.35)');
  const legs = o.moving ? walkLegs(t, 10) : 0;
  drawClawd(b, x - 12, foot - 16, aiO(t, Object.assign({ legs }, o.look || {})), o.flip);
}
/* 把世界缓冲贴到屏幕上的一块区域（相机 camX/camY 是世界坐标，P 是放大倍数，可以是小数） */
function blitPanel(g, name, P, camX, camY, x, y, w, h) {
  const b = BUF[name];
  clipRect(g, x, y, w, h, () => {
    g.imageSmoothingEnabled = false;
    g.drawImage(b, 0, 0, b.width, b.height, Math.round(x - camX * P), Math.round(y - camY * P), Math.round(b.width * P), Math.round(b.height * P));
  });
}
/* 世界坐标 → 屏幕坐标 */
const toScr = (cam, wx, wy) => [cam.x + (wx - cam.cx) * cam.P, cam.y + (wy - cam.cy) * cam.P];
/* 常用的几个机位：整张图、环路特写、终点特写 */
const CAM_FULL = { P: 3, cx: 0, cy: 0, x: 0, y: 100 };
function camLerp(a, b, u) { return { P: lerp(a.P, b.P, u), cx: lerp(a.cx, b.cx, u), cy: lerp(a.cy, b.cy, u), x: a.x, y: lerp(a.y, b.y, u), h: lerp(a.h || 960, b.h || 960, u) }; }
function camOn(wx, wy, P, full = false) { return full ? { P, cx: wx - 960 / P, cy: wy - 540 / P, x: 0, y: 0, h: 1080 } : { P, cx: wx - 960 / P, cy: wy - 480 / P, x: 0, y: 100 }; }
/* 画整块赛道（在世界缓冲里画完再贴到屏幕）。draw(b) 在缓冲里加东西；over(g, cam) 在屏幕上加字 */
function parkView(g, t, cam, o = {}, draw = null) {
  const b = pbuf('park', MAPW, MAPH);
  parkDynamic(b, t, o);
  if (draw) draw(b);
  if (o.fog) drawFog(b, t, o.fog, o.fogQ || 0);
  const h = cam.h || (H - cam.y);
  g.fillStyle = '#2E5A2A'; g.fillRect(cam.x, cam.y, W, h);
  blitPanel(g, 'park', cam.P, cam.cx, cam.cy, cam.x, cam.y, W, h);
}
/* 迷雾：没去过的格子盖一层黑（visited：去过的格子编号）；q：没去过的地方冒"？"（好奇心） */
function drawFog(b, t, visited, q) {
  const seen = new Set(visited);
  const near = new Set();
  CELL.forEach((c, i) => { if (!seen.has(i)) return; const [x, y] = c; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) near.add((x + dx) + ',' + (y + dy)); });
  for (let ty = 0; ty < X.H; ty++) for (let tx = 0; tx < X.W; tx++) {
    const k = tx + ',' + ty;
    const idx = CIDX[k];
    const lit = idx !== undefined ? seen.has(idx) : near.has(k);
    if (lit) continue;
    const dim = near.has(k) ? .62 : .82;
    b.fillStyle = `rgba(8,10,22,${dim})`; b.fillRect(tx * TILE, ty * TILE, TILE, TILE);
    if (q > 0 && idx !== undefined) {
      const ph = hash(tx, ty, 4) * 6, a = clamp(q) * (.55 + .45 * Math.sin(t * 4 + ph));
      withAlpha(b, a, () => { b.fillStyle = '#FFE066'; [[1, 0], [2, 0], [3, 1], [2, 2], [2, 4]].forEach(([i, j]) => b.fillRect(tx * TILE + 13 + i * 2, ty * TILE + 9 + j * 2, 2, 2)); });
    }
  }
}

/* ================= 训练台界面 ================= */
/* 顶栏：第几局、规则版本、本局分数、到终点了没 */
function topBar(g, t, st) {
  g.save();
  g.fillStyle = '#0B0F1C'; g.fillRect(0, 0, W, 100);
  g.fillStyle = 'rgba(120,180,255,.18)'; g.fillRect(0, 98, W, 2);
  // 窗口按钮 + 标题
  [['#FF5F57', 34], ['#FEBC2E', 58], ['#28C840', 82]].forEach(([c, x]) => { g.fillStyle = c; g.fillRect(x - 7, 26, 14, 14); });
  ptext(g, 'train.py — 小怪训练场', 106, 40, 24, '#7E89A8');
  // 第几局
  ptext(g, '第', 34, 86, 24, '#9AA6C8');
  ptext(g, String(st.ep).padStart(4, '0'), 66, 88, 48, C.white);
  ptext(g, '/ 1000 局', 66 + pw(g, '0000', 48) + 10, 86, 24, '#9AA6C8');
  // 规则版本
  if (st.rule) ptag(g, 470, 70, st.rule, 24, { align: 'left', fill: st.ruleCol || '#55B7B5', col: '#0B0F1C' });
  // 分数
  const sx = 860;
  ptext(g, st.scoreLabel || '本局分数', sx, 62, 24, '#9AA6C8');
  const sc = st.score === undefined ? '--' : String(Math.round(st.score));
  ptext(g, sc, sx + 116, 74, 60, C.gold, { sh: 1 });
  if (st.scoreFlash) { g.fillStyle = `rgba(255,211,78,${st.scoreFlash * .35})`; g.fillRect(sx + 108, 18, pw(g, sc, 60) + 18, 70); }
  // 到终点
  const fx = 1180, lw = pw(g, st.doneLabel || '到终点', 24) + 22;
  ptext(g, st.doneLabel || '到终点', fx, 62, 24, '#9AA6C8');
  if (st.done === true) checkMark(g, fx + lw, 40, 5, C.green);
  else if (st.done === false) crossMark(g, fx + lw + 2, 38, 5, C.red);
  if (st.doneCount !== undefined) ptext(g, `累计 ${st.doneCount} 次`, fx + lw + 56, 62, 24, st.doneCount ? C.green : '#FF8A80');
  g.restore();
}
/* 记分表：一张夹着的纸。lines：[{s, strike(0..1), add(0..1), col}] */
function ruleCard(g, t, x, y, title, lines, o = {}) {
  const w = o.w || 420, h = o.h || (120 + lines.length * 58);
  g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(o.rot ?? -.02);
  if (o.scale) g.scale(o.scale, o.scale);
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(10, 12, w, h);
  g.fillStyle = '#F6EEDB'; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(80,120,190,.18)'; for (let yy = 92; yy < h - 10; yy += 58) g.fillRect(16, yy + 38, w - 32, 2);
  g.fillStyle = '#E8604C'; g.fillRect(40, 0, 3, h);
  // 夹子
  g.fillStyle = '#5A6378'; g.fillRect(w / 2 - 50, -16, 100, 30); g.fillStyle = '#8A93A8'; g.fillRect(w / 2 - 50, -16, 100, 6);
  rich(g, title, 60, 58, 40, { align: 'left', col: '#2B2547', stroke: 0, maxW: w - 80 });
  lines.forEach((l, i) => {
    const a = l.add === undefined ? 1 : clamp(l.add);
    if (a <= 0) return;
    withAlpha(g, a, () => {
      const yy = 122 + i * 58;
      const tw = rich(g, l.s, 64, yy, 38, { align: 'left', col: l.col || '#2B2547', hl: '#D9443B', stroke: 0, maxW: w - 90 });
      if (l.strike) { g.fillStyle = '#D9443B'; g.fillRect(58, yy - 2, (tw + 12) * clamp(l.strike), 5); }
    });
  });
  g.restore();
}
/* 原理卡：badge "原理 n" + 标题，下面 draw(g, x, y, w, h) 画示意 */
function principleCard(g, t, t0, t1, n, title, draw, o = {}) {
  const a = win(t, t0, t1, .12, .3); if (!a) return;
  const p = E.out(clamp((t - t0) / .35));
  const w = o.w || 1180, h = o.h || 560, x = (W - w) / 2, y = o.y ?? 150;
  g.save(); g.globalAlpha *= a;
  g.fillStyle = 'rgba(5,8,18,.55)'; g.fillRect(0, 0, W, H);
  g.translate(0, (1 - p) * 40);
  g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(x + 14, y + 16, w, h);
  g.fillStyle = '#141A2C'; g.fillRect(x, y, w, h);
  g.fillStyle = '#2C3654'; g.fillRect(x, y, w, 4); g.fillRect(x, y + h - 4, w, 4); g.fillRect(x, y, 4, h); g.fillRect(x + w - 4, y, 4, h);
  ptag(g, x + 40, y + 52, `原理 ${n}`, 30, { align: 'left', fill: '#E8735A', col: '#1B1730' });
  rich(g, title, x + 190, y + 52, 46, { align: 'left', stroke: 0, col: C.white, hl: C.gold, maxW: w - 230 });
  g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(x + 36, y + 96, w - 72, 2);
  draw(g, x, y + 100, w, h - 100);
  g.restore();
}
/* 出处条：左下角一行小字 */
function sourceTag(g, t, t0, t1, s, o = {}) {
  const a = win(t, t0, t1, .2, .3); if (!a) return;
  g.save(); g.globalAlpha *= a;
  const px = 26, w = pw(g, s, px) + 70, x = o.x ?? 40, y = o.y ?? 836;
  g.fillStyle = 'rgba(10,14,28,.82)'; g.fillRect(x, y, w, 50);
  g.fillStyle = '#55B7B5'; g.fillRect(x, y, 6, 50);
  ptext(g, s, x + 30, y + 35, px, '#C9D3E8');
  g.restore();
}
/* 大号的计分牌："AI 33 : 10 我" */
function scoreboard(g, t, cx, cy, a, b, o = {}) {
  g.save(); g.translate(cx, cy); if (o.scale) g.scale(o.scale, o.scale);
  const w = 760, h = 150;
  g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(-w / 2 + 12, -h / 2 + 12, w, h);
  g.fillStyle = '#10162A'; g.fillRect(-w / 2, -h / 2, w, h);
  g.fillStyle = '#E8735A'; g.fillRect(-w / 2, -h / 2, w, 6);
  g.fillStyle = '#2C3654'; g.fillRect(-w / 2, h / 2 - 4, w, 4);
  ptext(g, 'AI 小怪', -w / 2 + 40, -18, 30, '#9AA6C8');
  ptext(g, '我（老实跑完）', w / 2 - 40, -18, 30, '#9AA6C8', { align: 'right' });
  ptext(g, String(a), -150, 52, 96, C.gold, { align: 'center', sh: 1 });
  ptext(g, ':', 0, 46, 72, '#5C678A', { align: 'center' });
  ptext(g, String(b), 150, 52, 96, C.white, { align: 'center', sh: 1 });
  if (o.crown) pix(g, ['#.#.#', '#####', '#####'], { '#': C.gold }, -150, -62, 8);
  g.restore();
}
