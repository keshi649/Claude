'use strict';
/* hud.js：叠在三维画面上的一层 2D 画布（按 CSS 像素排版，设备像素比最多 2）。
   布局照王者：左上小地图，下面是金币（商店）和推荐装备；右上比分、时间、暂停；左下摇杆；右下普攻大圆键，三个技能围着它，
   左边一排回城、恢复、闪现；瞄准时右上出现“取消施法”。单位头顶的血条、伤害数字、播报横幅、击杀记录、提示也都画在这一层。 */

const FONT = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC","Source Han Sans SC","WenQuanYi Zen Hei",sans-serif';
const C = { gold: '#F4C85A', gold2: '#FFE7A0', red: '#FF5A4E', blue: '#4AA8FF', green: '#6CF06C', dim: '#B8B4C8', ink: '#0B0A14', white: '#F6F4EE' };
const HUD = { cv: null, g: null, w: 1, h: 1, dpr: 1, L: null, ins: { l: 0, r: 0, t: 0, b: 0 }, floats: [], ann: [], feed: [], toasts: [], portraits: {},
  nb: null, lvlFlash: [0, 0, 0], keyboard: false, mini: null, press: {}, t: 0 };

function hudResize(w, h, dpr) {
  HUD.w = w; HUD.h = h; HUD.dpr = dpr;
  HUD.cv.width = Math.round(w * dpr); HUD.cv.height = Math.round(h * dpr);
  HUD.cv.style.width = w + 'px'; HUD.cv.style.height = h + 'px';
  HUD.L = hudLayout();
}
function hudLayout() {
  const W = HUD.w, H = HUD.h, I = HUD.ins;
  const u = Math.max(0.72, Math.min(H / 400, W / 860, 1.45));
  const L2 = { u };
  L2.mini = { x: I.l + 6 * u, y: 6 * u, s: Math.round(124 * u) };
  const ax = W - I.r - 82 * u, ay = H - 84 * u - I.b;
  L2.atk = { x: ax, y: ay, r: 47 * u };
  const sk = [[190, 108], [142, 112], [94, 112]];
  L2.s = sk.map(([a, d]) => ({ x: ax + Math.cos(a * Math.PI / 180) * d * u, y: ay - Math.sin(a * Math.PI / 180) * d * u, r: 31 * u }));
  L2.flash = { x: ax - 214 * u, y: H - 32 * u - I.b, r: 23 * u };
  L2.heal = { x: ax - 268 * u, y: H - 30 * u - I.b, r: 20 * u };
  L2.recall = { x: ax - 316 * u, y: H - 30 * u - I.b, r: 20 * u };
  L2.cancel = { x: W - I.r - 66 * u, y: 116 * u, r: 34 * u };
  L2.pause = { x: W - I.r - 22 * u, y: 22 * u, r: 17 * u };
  L2.score = { x: W - I.r - 50 * u, y: 8 * u, h: 28 * u };
  L2.shop = { x: I.l + 34 * u, y: L2.mini.y + L2.mini.s + 36 * u, r: 25 * u };
  L2.buy = { x: I.l + 34 * u, y: L2.shop.y + 70 * u, r: 27 * u };
  L2.joy = { x: I.l + 118 * u, y: H - 104 * u - I.b, r: 60 * u, knob: 26 * u };
  return L2;
}

/* ---------- 小地图底图（开局画一次） ---------- */
function buildMinimap(N) {
  const c = mkc(N, N), g = c.getContext('2d'), s = N / L;
  g.fillStyle = '#2F5A2A'; g.fillRect(0, 0, N, N);
  g.fillStyle = '#4C8A3A'; g.fillRect(BORDER * s, BORDER * s, (L - 2 * BORDER) * s, (L - 2 * BORDER) * s);
  g.strokeStyle = '#3C8AC8'; g.lineWidth = RIVER_W * 2 * s; g.beginPath(); g.moveTo(0, 0); g.lineTo(N, N); g.stroke();
  g.strokeStyle = '#C8B48A'; g.lineCap = 'round'; g.lineJoin = 'round';
  LANES.forEach((ln, i) => { g.lineWidth = (i === 1 ? 230 : 210) * s; g.beginPath(); ln.forEach((p, k) => (k ? g.lineTo(p[0] * s, p[1] * s) : g.moveTo(p[0] * s, p[1] * s))); g.stroke(); });
  g.fillStyle = '#26482A';
  for (const w of WALLS) {
    g.beginPath();
    if (w.c) { g.arc(w.c[0] * s, w.c[1] * s, w.c[2] * s, 0, 7); g.fill(); }
    else { g.strokeStyle = '#26482A'; g.lineWidth = w.k[4] * 2 * s; g.moveTo(w.k[0] * s, w.k[1] * s); g.lineTo(w.k[2] * s, w.k[3] * s); g.stroke(); }
  }
  g.fillStyle = 'rgba(40,110,70,0.9)';
  for (const b of BUSHES) {
    g.beginPath();
    if (b.c) { g.arc(b.c[0] * s, b.c[1] * s, b.c[2] * s, 0, 7); g.fill(); }
    else { g.strokeStyle = 'rgba(40,110,70,0.9)'; g.lineWidth = b.k[4] * 2 * s; g.moveTo(b.k[0] * s, b.k[1] * s); g.lineTo(b.k[2] * s, b.k[3] * s); g.stroke(); }
  }
  for (const team of [0, 1]) {
    const p = team ? mir(SPRING_VIS) : SPRING_VIS;
    g.fillStyle = team ? 'rgba(255,90,78,0.55)' : 'rgba(74,168,255,0.55)';
    g.beginPath(); g.arc(p[0] * s, p[1] * s, 420 * s, 0, 7); g.fill();
  }
  return c;
}

/* ---------- 画字的小工具 ---------- */
function txt(g, s, x, y, size, col, o) {
  o = o || {};
  g.font = `${o.w || 700} ${size}px ${FONT}`;
  g.textAlign = o.align || 'center'; g.textBaseline = o.base || 'middle';
  if (o.ol !== false) { g.lineJoin = 'round'; g.lineWidth = o.olw || Math.max(2, size * 0.18); g.strokeStyle = o.ol || 'rgba(8,6,16,0.9)'; g.strokeText(s, x, y); }
  g.fillStyle = col; g.fillText(s, x, y);
}
function circ(g, x, y, r, fill, stroke, lw) {
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 2; g.stroke(); }
}
function rrect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function portrait(g, hid, x, y, r, ring, dim) {
  const p = HUD.portraits[hid];
  g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.clip();
  const gr = g.createRadialGradient(x, y - r * 0.3, r * 0.1, x, y, r);
  gr.addColorStop(0, '#5A5A78'); gr.addColorStop(1, '#1A1828');
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  if (p) g.drawImage(p, x - r * 1.25, y - r * 1.2, r * 2.5, r * 2.5);
  if (dim) { g.fillStyle = 'rgba(10,10,20,0.6)'; g.fillRect(x - r, y - r, r * 2, r * 2); }
  g.restore();
  if (ring) circ(g, x, y, r, null, ring, Math.max(1.5, r * 0.16));
}

/* ---------- 播报、提示、飘字、击杀记录 ---------- */
function announce(text, col, o) {
  o = o || {};
  if (o.urgent) HUD.ann.length = 0;
  HUD.ann = HUD.ann.filter(a => a.t < a.dur * 0.5);
  HUD.ann.push({ text, col, sub: o.sub || '', k: o.k || null, v: o.v || null, t: 0, dur: o.dur || 2.4, voice: o.voice || null, said: false });
  if (HUD.ann.length > 3) HUD.ann.shift();
}
function toast(text, col) {
  if (HUD.toasts.length && HUD.toasts[HUD.toasts.length - 1].text === text) { HUD.toasts[HUD.toasts.length - 1].t = 0; return; }
  HUD.toasts.push({ text, col: col || C.white, t: 0 });
  if (HUD.toasts.length > 3) HUD.toasts.shift();
}
// 飘字：世界坐标（x, y）+ 高度 h；o：{ size, dur, col2, crit }
function floatText(x, y, h, text, col, o) {
  o = o || {};
  if (HUD.floats.length > 80) HUD.floats.shift();
  HUD.floats.push({ x, y, h, text, col, size: o.size || 15, dur: o.dur || 0.9, t: 0, dx: (Math.random() - 0.5) * 24, crit: !!o.crit });
}

/* ---------- 每帧 ---------- */
const _sp = [0, 0, 0];
function drawHUD(W, me, dt, mode) {
  const g = HUD.g, L2 = HUD.L, u = L2.u;
  HUD.t += dt;
  g.setTransform(HUD.dpr, 0, 0, HUD.dpr, 0, 0);
  g.clearRect(0, 0, HUD.w, HUD.h);
  if (!W) return;
  drawBars(g, W, me, u);
  drawFloats(g, dt);
  if (mode === 'demo') return;
  if (me && me.dead) {
    g.fillStyle = 'rgba(28,30,44,0.42)'; g.fillRect(0, 0, HUD.w, HUD.h);
    const left = Math.max(0, Math.ceil(me.respawnAt - W.t));
    const cy = HUD.h * 0.4;
    rrect(g, HUD.w / 2 - 70 * u, cy - 26 * u, 140 * u, 76 * u, 12 * u); g.fillStyle = 'rgba(8,10,24,0.72)'; g.fill();
    txt(g, '复活倒计时', HUD.w / 2, cy - 8 * u, 14 * u, C.dim, { w: 600 });
    txt(g, String(left), HUD.w / 2, cy + 22 * u, 34 * u, C.white, { w: 900 });
  }
  drawMinimap(g, W, me, L2.mini);
  drawTop(g, W, me, u, L2);
  drawShop(g, W, me, u, L2);
  drawControls(g, W, me, u, L2);
  drawAnn(g, W, dt, u);
  drawFeed(g, dt, u, L2);
  drawToasts(g, dt, u);
}
function drawBars(g, W, me, u) {
  for (const b of R3.bars) {
    if (b.dead) continue;
    worldToScreen(b.x, groundH(b.x, b.y) + unitTop(b), b.y, _sp);
    if (_sp[2] > 1 || _sp[0] < -80 || _sp[0] > HUD.w + 80 || _sp[1] < -40 || _sp[1] > HUD.h + 40) continue;
    const x = Math.round(_sp[0]), y = Math.round(_sp[1]);
    const k = b.hp / b.maxHp;
    if (b.kind === 'hero') {
      const isMe = me && b.id === me.id, ally = me ? b.team === me.team : b.team === 0;
      const w = 66 * u, h = 8 * u, x0 = x - w / 2 + 8 * u;
      const col = isMe ? '#52D452' : ally ? '#3D8BFF' : '#E8463C';
      g.fillStyle = 'rgba(10,8,18,0.85)'; g.fillRect(x0 - 1, y - 1, w + 2, h + 2);
      const sh = shieldOf(b), tot = Math.max(b.maxHp, b.hp + sh);
      g.fillStyle = col; g.fillRect(x0, y, w * b.hp / tot, h);
      if (sh > 0) { g.fillStyle = '#F4F4F4'; g.fillRect(x0 + w * b.hp / tot, y, w * sh / tot, h); }
      g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x0, y, w * b.hp / tot, h * 0.4);
      g.fillStyle = 'rgba(10,8,18,0.6)';                    // 每 250 血一道刻度
      const step = b.maxHp > 3000 ? 500 : 250;
      for (let v = step; v < tot; v += step) g.fillRect(x0 + w * v / tot, y + h * 0.45, 1, h * 0.55);
      // 等级
      const lx = x0 - 9 * u;
      g.fillStyle = 'rgba(10,8,18,0.9)'; g.fillRect(lx - 7.5 * u, y - 2 * u, 15 * u, h + 4 * u);
      txt(g, String(b.lvl), lx, y + h / 2 + 0.5, 10.5 * u, C.gold2, { ol: false });
      txt(g, HERO_BY_ID[b.hid].name + (isMe ? '' : ''), x + 4 * u, y - 9 * u, 10.5 * u, isMe ? '#C8FFC8' : ally ? '#CFE6FF' : '#FFD0C8', { w: 600 });
      if (isMe && b.recall) {
        const p = clamp01((W.t - b.recall) / RECALL_T);
        g.fillStyle = 'rgba(10,8,18,0.85)'; g.fillRect(x0 - 1, y + h + 3 * u, w + 2, 5 * u);
        g.fillStyle = '#7FB4FF'; g.fillRect(x0, y + h + 3 * u + 1, w * p, 5 * u - 2);
      }
    } else if (b.kind === 'minion') {
      const ally = me ? b.team === me.team : b.team === 0;
      const big = b.mt === 'siege' || b.mt === 'super' || b.mt === 'vanguard';
      const w = (big ? 44 : 32) * u, h = (big ? 5 : 4) * u;
      g.fillStyle = 'rgba(10,8,18,0.8)'; g.fillRect(x - w / 2 - 1, y - 1, w + 2, h + 2);
      g.fillStyle = ally ? '#3D8BFF' : '#E8463C'; g.fillRect(x - w / 2, y, w * k, h);
    } else if (b.kind === 'monster') {
      const big = b.mt === 'drake' || b.mt === 'lord', buff = b.mt === 'red' || b.mt === 'blue';
      const w = (big ? 110 : buff ? 64 : 46) * u, h = (big ? 9 : 6) * u;
      g.fillStyle = 'rgba(10,8,18,0.85)'; g.fillRect(x - w / 2 - 1, y - 1, w + 2, h + 2);
      g.fillStyle = big ? '#C86AFF' : '#F0A830'; g.fillRect(x - w / 2, y, w * k, h);
      if (big || buff) txt(g, MONSTER[b.mt].name, x, y - 9 * u, 11 * u, big ? '#E8C8FF' : '#FFE0A0', { w: 600 });
    } else {
      const ally = me ? b.team === me.team : b.team === 0;
      const w = (b.kind === 'crystal' ? 110 : 90) * u, h = 9 * u;
      g.fillStyle = 'rgba(10,8,18,0.85)'; g.fillRect(x - w / 2 - 1, y - 1, w + 2, h + 2);
      g.fillStyle = ally ? '#3D8BFF' : '#E8463C'; g.fillRect(x - w / 2, y, w * k, h);
      g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(x - w / 2, y, w * k, h * 0.4);
      if (b.inv) txt(g, '无敌', x, y - 9 * u, 10 * u, C.dim, { w: 600 });
    }
  }
}
function drawFloats(g, dt) {
  const u = HUD.L.u;
  for (let i = HUD.floats.length - 1; i >= 0; i--) {
    const f = HUD.floats[i];
    f.t += dt;
    if (f.t >= f.dur) { HUD.floats.splice(i, 1); continue; }
    worldToScreen(f.x, groundH(f.x, f.y) + f.h, f.y, _sp);
    if (_sp[2] > 1) continue;
    const k = f.t / f.dur;
    const pop = f.crit ? 1 + Math.max(0, 0.6 - k * 4) : 1 + Math.max(0, 0.25 - k * 2);
    const a = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
    g.globalAlpha = a;
    txt(g, f.text, _sp[0] + f.dx * k, _sp[1] - 34 * u * Math.sqrt(k), f.size * u * pop, f.col, { w: 800 });
    g.globalAlpha = 1;
  }
}
function drawMinimap(g, W, me, m) {
  if (!HUD.mini) return;
  g.save();
  rrect(g, m.x - 2, m.y - 2, m.s + 4, m.s + 4, 6); g.fillStyle = 'rgba(10,8,20,0.75)'; g.fill();
  g.globalAlpha = 0.92; g.drawImage(HUD.mini, m.x, m.y, m.s, m.s); g.globalAlpha = 1;
  const s = m.s / L, P = (x, y) => [m.x + x * s, m.y + y * s];
  const myTeam = me ? me.team : 0;
  // 镜头框
  const pts = [[0, 0], [HUD.w, 0], [HUD.w, HUD.h], [0, HUD.h]].map(([x, y]) => screenToGround(x, y));
  if (pts.every(Boolean)) {
    g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 1.2; g.beginPath();
    pts.forEach((p, i) => { const q = P(clamp(p[0], 0, L), clamp(p[1], 0, L)); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); });
    g.closePath(); g.stroke();
  }
  for (const u of W.units) {
    if (u.dead) continue;
    const [x, y] = P(u.x, u.y);
    if (u.kind === 'tower' || u.kind === 'crystal') {
      const r = u.kind === 'crystal' ? 4.5 : 3.2;
      g.fillStyle = u.team === myTeam ? '#5AB4FF' : '#FF5A4E'; g.strokeStyle = '#0B0A14'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r, y); g.lineTo(x, y + r); g.lineTo(x - r, y); g.closePath(); g.fill(); g.stroke();
    } else if (u.kind === 'minion') {
      g.fillStyle = u.team === myTeam ? '#8CC8FF' : '#FF8A80'; g.fillRect(x - 1.2, y - 1.2, 2.4, 2.4);
    } else if (u.kind === 'monster') {
      const big = u.mt === 'drake' || u.mt === 'lord';
      circ(g, x, y, big ? 4 : 2.4, big ? '#C86AFF' : '#F0C060');
    }
  }
  for (const h of W._heroes) {
    if (h.dead || !canSee(W, myTeam, h)) continue;
    const [x, y] = P(h.x, h.y), isMe = me && h.id === me.id;
    portrait(g, h.hid, x, y, isMe ? 8.5 : 7, isMe ? '#7CFF6A' : h.team === myTeam ? '#4AA8FF' : '#FF5A4E');
  }
  g.restore();
}
function fmtTime(t) { const s = Math.floor(t); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }
function drawTop(g, W, me, u, L2) {
  const sc = L2.score, w = 236 * u, x1 = sc.x - 18 * u, x0 = x1 - w, y = sc.y, h = sc.h;
  g.save();
  const gr = g.createLinearGradient(x0, 0, x1, 0);
  gr.addColorStop(0, 'rgba(10,12,30,0)'); gr.addColorStop(0.15, 'rgba(10,12,30,0.78)'); gr.addColorStop(1, 'rgba(10,12,30,0.78)');
  g.fillStyle = gr; g.fillRect(x0, y, w, h);
  const myTeam = me ? me.team : 0;
  const mine = W.kills[myTeam], theirs = W.kills[1 - myTeam];
  const cx = x0 + w * 0.56;
  txt(g, String(mine), cx - 24 * u, y + h / 2, 17 * u, '#7CC4FF');
  txt(g, 'vs', cx, y + h / 2, 11 * u, C.dim, { w: 600 });
  txt(g, String(theirs), cx + 24 * u, y + h / 2, 17 * u, '#FF8A80');
  txt(g, fmtTime(W.t), x1 - 6 * u, y + h / 2, 13 * u, C.white, { w: 600, align: 'right' });
  if (me) txt(g, `${me.kills}/${me.deaths}/${me.assists}`, x0 + w * 0.3, y + h / 2, 12 * u, C.gold2, { w: 600, align: 'right' });
  // 暂停（设置）键
  const p = L2.pause;
  circ(g, p.x, p.y, p.r, 'rgba(10,12,30,0.78)', 'rgba(244,200,90,0.8)', 1.5);
  g.fillStyle = C.gold2; g.fillRect(p.x - 5 * u, p.y - 6 * u, 3.4 * u, 12 * u); g.fillRect(p.x + 1.6 * u, p.y - 6 * u, 3.4 * u, 12 * u);
  g.restore();
}
function drawShop(g, W, me, u, L2) {
  if (!me) return;
  const s = L2.shop;
  const gr = g.createRadialGradient(s.x - s.r * 0.3, s.y - s.r * 0.3, 2, s.x, s.y, s.r);
  gr.addColorStop(0, '#4A3A18'); gr.addColorStop(1, '#1C140A');
  circ(g, s.x, s.y, s.r, gr, C.gold, 2);
  circ(g, s.x, s.y - 4 * u, 8 * u, '#F4C85A', '#8A5A12', 1.5);
  txt(g, '¥', s.x, s.y - 4 * u, 10 * u, '#8A5A12', { ol: false, w: 900 });
  txt(g, String(Math.floor(me.gold)), s.x, s.y + 13 * u, 11 * u, C.gold2, { w: 700 });
  // 推荐装备：买得起就亮
  HUD.nb = nextBuy(me);
  const nb = HUD.nb, b = L2.buy;
  if (nb && me.items.length <= 6) {
    const can = me.gold >= nb.price;
    const sz = b.r * 2;
    if (can) { g.save(); g.shadowColor = C.gold; g.shadowBlur = 10 + 6 * Math.sin(HUD.t * 5); }
    g.drawImage(itemIcon(nb.id, 64), b.x - b.r, b.y - b.r, sz, sz);
    if (can) g.restore();
    if (!can) { g.fillStyle = 'rgba(10,8,20,0.55)'; rrect(g, b.x - b.r, b.y - b.r, sz, sz, sz * 0.16); g.fill(); }
    txt(g, String(nb.price), b.x, b.y + b.r + 9 * u, 11 * u, can ? C.gold2 : C.dim, { w: 700 });
  }
}
function cdOverlay(g, x, y, r, frac, secs, u) {
  g.save();
  g.beginPath(); g.moveTo(x, y); g.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); g.closePath();
  g.fillStyle = 'rgba(8,8,16,0.66)'; g.fill();
  g.restore();
  txt(g, secs >= 10 ? String(Math.ceil(secs)) : (Math.ceil(secs * 10) / 10).toFixed(1), x, y, r * 0.62, C.white, { w: 800 });
}
function drawControls(g, W, me, u, L2) {
  if (!me) return;
  const dead = me.dead;
  // 摇杆
  const J = L2.joy, j = INP.joy;
  const bx = j ? j.bx : J.x, by = j ? j.by : J.y;
  circ(g, bx, by, J.r, 'rgba(20,24,40,0.28)', 'rgba(220,230,255,0.45)', 2);
  circ(g, bx, by, J.r * 0.62, null, 'rgba(220,230,255,0.16)', 1.5);
  const kx = j ? j.x : bx, ky = j ? j.y : by;
  const kg = g.createRadialGradient(kx - 6 * u, ky - 6 * u, 2, kx, ky, J.knob);
  kg.addColorStop(0, 'rgba(255,255,255,0.95)'); kg.addColorStop(1, 'rgba(160,190,230,0.75)');
  circ(g, kx, ky, J.knob, kg, 'rgba(255,255,255,0.8)', 1.5);
  // 普攻
  const A = L2.atk, pressed = INP.atk != null || INP.keyAtk;
  g.save(); g.globalAlpha = dead ? 0.45 : 1;
  const ar = A.r * (pressed ? 0.94 : 1);
  g.drawImage(skillIcon('atk', 128), A.x - ar, A.y - ar, ar * 2, ar * 2);
  circ(g, A.x, A.y, ar, null, pressed ? '#FFF2C0' : C.gold, 3);
  g.restore();
  // 三个技能
  const hd = HERO_BY_ID[me.hid];
  for (let s = 0; s < 3; s++) {
    const b = L2.s[s], st = me.sk[s], def = hd.skills[s];
    const aimNow = INP.aim && INP.aim.s === s;
    const r = b.r * (aimNow ? 1.08 : 1);
    g.save();
    g.globalAlpha = dead ? 0.45 : 1;
    g.drawImage(skillIcon(def.id, 96), b.x - r, b.y - r, r * 2, r * 2);
    if (!st.rank) { circ(g, b.x, b.y, r, 'rgba(10,10,20,0.68)'); txt(g, s === 2 ? '4级' : '2级', b.x, b.y, 11 * u, C.dim, { w: 700 }); }
    else if (st.cd > 0) cdOverlay(g, b.x, b.y, r, st.cd / cdOf(me, s), st.cd, u);
    circ(g, b.x, b.y, r, null, st.rank && st.cd <= 0 ? C.gold : 'rgba(150,140,120,0.8)', 2.2);
    // 技能等级：下面一排小点
    const n = def.cd.length;
    for (let i = 0; i < n; i++) {
      const a = Math.PI / 2 + (i - (n - 1) / 2) * 0.24;
      circ(g, b.x + Math.cos(a) * (r + 5 * u), b.y + Math.sin(a) * (r + 5 * u), 2.2 * u, i < st.rank ? '#FFD86A' : 'rgba(40,36,50,0.9)');
    }
    if (HUD.lvlFlash[s] > 0) { circ(g, b.x, b.y, r + 4 * u, null, `rgba(255,230,120,${HUD.lvlFlash[s]})`, 4); }
    g.restore();
  }
  for (let s = 0; s < 3; s++) HUD.lvlFlash[s] = Math.max(0, HUD.lvlFlash[s] - 1 / 60);
  // 回城、恢复、闪现
  const small = [['recall', L2.recall, me.recall ? 1 : 0, 0], ['heal', L2.heal, me.healCd, HEAL_CD], ['flash', L2.flash, me.flashCd, FLASH_CD]];
  for (const [id, b, cd, max] of small) {
    g.save(); g.globalAlpha = dead ? 0.45 : 1;
    g.drawImage(skillIcon(id, 64), b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
    if (id !== 'recall' && cd > 0) cdOverlay(g, b.x, b.y, b.r, cd / max, cd, u);
    circ(g, b.x, b.y, b.r, null, id === 'recall' && cd ? '#9CC8FF' : 'rgba(244,200,90,0.85)', 1.8);
    g.restore();
  }
  // 瞄准中：取消施法
  if (INP.aim) {
    const c = L2.cancel, on = INP.aim.cancel;
    circ(g, c.x, c.y, c.r * (on ? 1.12 : 1), on ? 'rgba(220,50,40,0.75)' : 'rgba(20,16,30,0.7)', on ? '#FFB0A8' : 'rgba(255,120,110,0.85)', 2.5);
    g.strokeStyle = '#FFFFFF'; g.lineWidth = 3 * u; g.lineCap = 'round';
    g.beginPath(); g.moveTo(c.x - 9 * u, c.y - 9 * u); g.lineTo(c.x + 9 * u, c.y + 9 * u); g.moveTo(c.x + 9 * u, c.y - 9 * u); g.lineTo(c.x - 9 * u, c.y + 9 * u); g.stroke();
    txt(g, '取消施法', c.x, c.y + c.r + 11 * u, 11 * u, '#FFD0C8', { w: 700 });
  }
  if (HUD.keyboard) txt(g, 'WASD 移动 · J/空格 普攻 · 1 2 3 技能 · F 闪现 · H 恢复 · B 回城 · P 暂停', HUD.w / 2, HUD.h - 10 * u, 10 * u, 'rgba(230,226,240,0.75)', { w: 500 });
}
function drawAnn(g, W, dt, u) {
  if (!HUD.ann.length) return;
  const a = HUD.ann[0];
  a.t += dt;
  if (!a.said && a.voice) { a.said = true; sayVoice(a.voice); }
  if (a.t >= a.dur) { HUD.ann.shift(); return; }
  const k = a.t / a.dur;
  const alpha = k < 0.08 ? k / 0.08 : k > 0.82 ? (1 - k) / 0.18 : 1;
  const slide = k < 0.08 ? (1 - k / 0.08) * 40 * u : 0;
  const cx = HUD.w / 2, cy = 74 * u, w = Math.min(HUD.w * 0.62, 420 * u), h = 40 * u;
  g.save(); g.globalAlpha = alpha;
  const gr = g.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  gr.addColorStop(0, 'rgba(10,8,24,0)'); gr.addColorStop(0.2, 'rgba(10,8,24,0.82)'); gr.addColorStop(0.8, 'rgba(10,8,24,0.82)'); gr.addColorStop(1, 'rgba(10,8,24,0)');
  g.fillStyle = gr; g.fillRect(cx - w / 2, cy - h / 2, w, h);
  g.fillStyle = a.col; g.globalAlpha = alpha * 0.85;
  g.fillRect(cx - w * 0.3, cy - h / 2, w * 0.6, 1.5); g.fillRect(cx - w * 0.3, cy + h / 2 - 1.5, w * 0.6, 1.5);
  g.globalAlpha = alpha;
  txt(g, a.text, cx + slide, cy, 21 * u, a.col, { w: 900, olw: 4 * u });
  if (a.k) portrait(g, a.k[0], cx - w * 0.36, cy, 17 * u, a.k[1] === 0 ? '#4AA8FF' : '#FF5A4E');
  if (a.v) portrait(g, a.v[0], cx + w * 0.36, cy, 17 * u, a.v[1] === 0 ? '#4AA8FF' : '#FF5A4E', true);
  if (a.sub) txt(g, a.sub, cx, cy + h / 2 + 12 * u, 12 * u, C.white, { w: 600 });
  g.restore();
}
function drawFeed(g, dt, u, L2) {
  let y = L2.score.y + L2.score.h + 10 * u;
  const x1 = L2.score.x - 18 * u;
  for (let i = 0; i < HUD.feed.length && i < 4; i++) {
    const f = HUD.feed[i];
    f.t += dt;
    if (f.t > 7) { HUD.feed.length = i; break; }
    const a = f.t > 6 ? 7 - f.t : 1;
    g.save(); g.globalAlpha = a;
    const w = 92 * u, h = 22 * u, x0 = x1 - w;
    g.fillStyle = 'rgba(10,10,24,0.6)'; g.fillRect(x0, y, w, h);
    if (f.k) portrait(g, f.k, x0 + 14 * u, y + h / 2, 9 * u, f.kt === 0 ? '#4AA8FF' : '#FF5A4E');
    txt(g, '⚔', x0 + w / 2, y + h / 2, 11 * u, C.gold2, { ol: false });
    portrait(g, f.v, x1 - 14 * u, y + h / 2, 9 * u, f.vt === 0 ? '#4AA8FF' : '#FF5A4E', true);
    g.restore();
    y += h + 4 * u;
  }
}
function drawToasts(g, dt, u) {
  let y = HUD.h * 0.62;
  for (let i = HUD.toasts.length - 1; i >= 0; i--) {
    const t = HUD.toasts[i];
    t.t += dt;
    if (t.t > 1.6) { HUD.toasts.splice(i, 1); continue; }
    g.save(); g.globalAlpha = t.t > 1.2 ? (1.6 - t.t) / 0.4 : 1;
    g.font = `700 ${13 * u}px ${FONT}`;
    const w = g.measureText(t.text).width + 26 * u;
    rrect(g, HUD.w / 2 - w / 2, y - 13 * u, w, 26 * u, 13 * u); g.fillStyle = 'rgba(10,8,22,0.75)'; g.fill();
    txt(g, t.text, HUD.w / 2, y, 13 * u, t.col, { ol: false });
    g.restore();
    y -= 30 * u;
  }
}

if (typeof module !== 'undefined') module.exports = {};
