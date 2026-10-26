'use strict';
/* render.js：世界画进一块低分辨率缓冲（1 像素 = 2.5 单位），界面也画在同一块缓冲上，最后整数倍放大到屏幕。
   缓冲高度大约 225 像素，按设备像素挑放大倍数 k，保证每个像素一样大。 */

const R = {
  cv: null, ctx: null, buf: null, g: null, bw: 0, bh: 0, k: 1, ox: 0, oy: 0,
  vx: 0, vy: 0, camX: 0, camY: 0, shake: 0, mapTex: null, mini: null,
  parts: [], floats: [], fxs: [], t: 0, peek: null, flashRed: 0,
};
const C = {           // 界面配色
  ink: '#1A121E', panel: 'rgba(16,14,26,0.72)', gold: '#F2C14E', gold2: '#FFE59A', white: '#F4F1EA', dim: '#9A96A8',
  blue: '#4DA6FF', blue2: '#2E6FD0', red: '#FF5A5A', red2: '#C83A3A', green: '#5BE05B', green2: '#2E9E3A', violet: '#B98AFF',
};

/* ---------- 画布尺寸 ---------- */
function resizeRender(cssW, cssH, dpr) {
  const dw = Math.round(cssW * dpr), dh = Math.round(cssH * dpr);
  R.cv.width = dw; R.cv.height = dh;
  R.cv.style.width = cssW + 'px'; R.cv.style.height = cssH + 'px';
  R.k = Math.max(1, Math.round(dh / (R.targetH || 228)));
  R.bw = Math.ceil(dw / R.k); R.bh = Math.ceil(dh / R.k);
  R.ox = Math.floor((dw - R.bw * R.k) / 2); R.oy = Math.floor((dh - R.bh * R.k) / 2);
  R.buf.width = R.bw; R.buf.height = R.bh;
  R.g = R.buf.getContext('2d'); R.g.imageSmoothingEnabled = false;
  R.ctx = R.cv.getContext('2d'); R.ctx.imageSmoothingEnabled = false;
  R.dpr = dpr; R.cssW = cssW; R.cssH = cssH;
}
// 屏幕（CSS 像素）→ 缓冲像素
function cssToBuf(x, y) { return [(x * R.dpr - R.ox) / R.k, (y * R.dpr - R.oy) / R.k]; }
const bx = x => Math.round((x - R.vx) / PXU);
const by = y => Math.round((y - R.vy) / PXU);
function bufToWorld(px, py) { return [R.vx + px * PXU, R.vy + py * PXU]; }

/* ---------- 缓存的小图：圆、环、影子 ---------- */
const SH = {};
function ellipseImg(rx, ry, col, alpha, ring) {
  const key = 'e' + rx + ',' + ry + col + alpha + (ring || 0);
  if (SH[key]) return SH[key];
  const c = mkc(rx * 2 + 1, ry * 2 + 1), g = c.getContext('2d');
  g.fillStyle = col; g.globalAlpha = alpha;
  for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) {
    const d = (x * x) / (rx * rx + 0.01) + (y * y) / (ry * ry + 0.01);
    if (d > 1.0) continue;
    if (ring) { const inner = (x * x) / Math.max(0.5, (rx - ring) ** 2) + (y * y) / Math.max(0.5, (ry - ring) ** 2); if (inner < 1) continue; }
    g.fillRect(x + rx, y + ry, 1, 1);
  }
  SH[key] = c;
  return c;
}
function circleRing(r, col, alpha, dash) {     // 地上的大圆圈（塔的射程、技能范围），虚线
  const key = 'r' + r + col + alpha + dash;
  if (SH[key]) return SH[key];
  const c = mkc(r * 2 + 3, r * 2 + 3), g = c.getContext('2d');
  g.fillStyle = col; g.globalAlpha = alpha;
  const n = Math.max(24, Math.round(r * 6.3));
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2;
    if (dash && Math.floor(i / dash) % 2) continue;
    g.fillRect(Math.round(r + 1 + Math.cos(a) * r), Math.round(r + 1 + Math.sin(a) * r * 0.82), 1, 1);
  }
  SH[key] = c;
  return c;
}
function drawAt(img, x, y) { R.g.drawImage(img, Math.round(x - img.width / 2), Math.round(y - img.height / 2)); }

/* ---------- 粒子、飘字、特效 ---------- */
function burst(x, y, n, cols, o) {
  o = o || {};
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = (o.spd || 160) * (0.4 + Math.random() * 0.8);
    R.parts.push({ x, y, z: o.z || 10, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.7, vz: (o.up || 120) * (0.5 + Math.random()), life: 0, max: (o.life || 0.6) * (0.6 + Math.random() * 0.7),
      col: cols[i % cols.length], sz: o.sz || (Math.random() < 0.3 ? 2 : 1), grav: o.grav == null ? 500 : o.grav });
  }
}
function floatText(x, y, img, o) {
  R.floats.push({ x, y, img, t: 0, dur: (o && o.dur) || 0.9, vy: (o && o.vy) || 50, big: o && o.big });
}
function addFxv(o) { o.t = 0; R.fxs.push(o); }

/* ---------- 画一帧世界 ---------- */
function renderWorld(W, me, dt) {
  const g = R.g;
  R.t += dt;
  // 镜头
  const tx = R.peek ? R.peek[0] : me.x, ty = R.peek ? R.peek[1] : me.y;
  if (R.peek) { R.camX = tx; R.camY = ty; }
  else { R.camX += (tx - R.camX) * Math.min(1, dt * 10); R.camY += (ty - R.camY) * Math.min(1, dt * 10); }
  const viewW = R.bw * PXU, viewH = R.bh * PXU;
  let cx = clamp(R.camX, viewW / 2, L - viewW / 2), cy = clamp(R.camY, viewH / 2, L - viewH / 2);
  R.vx = Math.round((cx - viewW / 2) / PXU) * PXU; R.vy = Math.round((cy - viewH / 2) / PXU) * PXU;
  if (R.shake > 0) { R.vx += Math.round((Math.random() - 0.5) * R.shake) * PXU; R.vy += Math.round((Math.random() - 0.5) * R.shake) * PXU; R.shake = Math.max(0, R.shake - dt * 30); }
  // 地图
  g.fillStyle = '#16301A'; g.fillRect(0, 0, R.bw, R.bh);
  const sx = Math.round(R.vx / PXU), sy = Math.round(R.vy / PXU);
  const cx0 = Math.max(0, sx), cy0 = Math.max(0, sy), cx1 = Math.min(MS, sx + R.bw), cy1 = Math.min(MS, sy + R.bh);
  if (cx1 > cx0 && cy1 > cy0) g.drawImage(R.mapTex, cx0, cy0, cx1 - cx0, cy1 - cy0, cx0 - sx, cy0 - sy, cx1 - cx0, cy1 - cy0);
  drawWater(g, sx, sy);
  // 地上的东西：塔的射程、技能指示、延时技能
  drawGround(W, me);
  // 单位（按脚底 y 排序）
  const list = [];
  for (const u of W.units) {
    if (u.dead && u.kind !== 'tower') continue;
    const px = bx(u.x), py = by(u.y);
    if (px < -60 || py < -80 || px > R.bw + 60 || py > R.bh + 60) continue;
    if (u.kind === 'hero' && u.team !== 0 && u.hidden && u.hidden[0]) continue;
    list.push(u);
  }
  list.sort((a, b) => a.y - b.y);
  for (const u of list) drawShadow(u);
  for (const u of list) drawUnit(W, u, me);
  // 弹道
  for (const p of W.projs) drawProj(W, p);
  // 一次性特效、粒子
  drawFxs(W, dt);
  drawParticles(dt);
  // 血条
  for (const u of list) drawBars(W, u, me);
  drawFloats(dt);
}
function drawWater(g, sx, sy) {               // 河面上一闪一闪的亮点
  const ph = Math.floor(R.t * 4);
  for (let i = 0; i < 60; i++) {
    const h = hash2(i, ph, 77);
    const px = Math.floor(hash2(i, ph, 78) * R.bw), py = Math.floor(hash2(i, ph, 79) * R.bh);
    const wx = sx + px, wy = sy + py;
    if (Math.abs(wx - wy) * 0.7071 > 255 / PXU - 4) continue;
    g.fillStyle = h < 0.5 ? '#D8F4FF' : '#9CDCF6';
    g.fillRect(px, py, h < 0.25 ? 2 : 1, 1);
  }
}
function drawGround(W, me) {
  const g = R.g;
  // 靠近敌方塔：画出射程（被塔盯上时变红实线）
  for (const u of W.units) {
    if ((u.kind !== 'tower' && u.kind !== 'crystal') || u.dead || u.team === 0 || me.dead) continue;
    const d = dist(u, me);
    if (d > u.range + 260) continue;
    const r = Math.round(u.range / PXU), on = u.tgt === me.id;
    drawAt(circleRing(r, on ? '#FF3030' : '#FF8A8A', on ? 0.95 : 0.6, on ? 0 : 3), bx(u.x), by(u.y) - 2);
  }
  // 队伍光圈（自己是绿的）
  for (const h of W._heroes) {
    if (h.dead || (h.team !== 0 && h.hidden && h.hidden[0])) continue;
    const col = h.id === me.id ? '#6BFF6B' : h.team === 0 ? '#4DA6FF' : '#FF5A5A';
    drawAt(ellipseImg(12, 5, col, 0.85, 1), bx(h.x), by(h.y) + 1);
  }
  // 延时的技能（冰环：一圈 + 慢慢涨满；流星：只画越来越大的影子和天上掉下来的火球）
  for (const z of W.zones) {
    const k = clamp((W.t - z.t0) / z.delay, 0, 1), r = Math.round(z.r / PXU);
    const col = z.vis === 'frost' ? '#9CE8FF' : '#FF9A40';
    if (z.vis !== 'meteor') drawAt(circleRing(r, col, 0.9, 0), bx(z.x), by(z.y));
    if (z.vis === 'meteor' && W.t - z.t0 < 0) continue;
    const rr = z.vis === 'meteor' ? Math.max(1, Math.round(r * 0.5 * (0.3 + 0.7 * k))) : Math.max(1, Math.round(r * k));
    drawAt(ellipseImg(rr, Math.max(1, Math.round(rr * 0.82)), z.vis === 'meteor' ? '#3A1A0A' : col, z.vis === 'meteor' ? 0.35 : 0.28), bx(z.x), by(z.y));
    if (z.vis === 'meteor') {                 // 天上掉下来的流星
      const h = (1 - k) * 160;
      const mx = bx(z.x) + Math.round(h * 0.5 / PXU * 2), my = by(z.y) - Math.round(h / PXU * 2.2);
      g.fillStyle = '#FF5A2A'; g.fillRect(mx - 3, my - 3, 6, 6); g.fillStyle = '#FFE070'; g.fillRect(mx - 2, my - 2, 4, 4); g.fillStyle = '#FFFFFF'; g.fillRect(mx - 1, my - 1, 2, 2);
      g.fillStyle = 'rgba(255,140,40,0.6)'; g.fillRect(mx + 2, my - 6, 2, 3); g.fillRect(mx + 4, my - 9, 2, 3);
    }
  }
  // 自己正在瞄准的技能
  if (typeof INP !== 'undefined' && INP.aim && !me.dead) drawAim(W, me, INP.aim);
  // 回城的光圈
  for (const h of W._heroes) {
    if (!h.recall || h.dead) continue;
    const k = clamp((W.t - h.recall) / RECALL_T, 0, 1);
    drawAt(circleRing(18, '#7FB4FF', 0.9, 2), bx(h.x), by(h.y));
    const n = Math.floor(R.t * 20);
    for (let i = 0; i < 4; i++) { const a = (n + i * 8) / 32 * Math.PI * 2; g.fillStyle = '#C8E0FF'; g.fillRect(bx(h.x) + Math.round(Math.cos(a) * 16), by(h.y) - Math.round(k * 20) + Math.round(Math.sin(a) * 6), 1, 2); }
  }
}
function drawAim(W, me, aim) {
  const g = R.g;
  if (aim.kind === 'flash') {
    const d = FLASH_DIST / PXU, x0 = bx(me.x), y0 = by(me.y);
    dashLine(g, x0, y0, x0 + aim.dx * d, y0 + aim.dy * d, '#FFE45C');
    drawAt(ellipseImg(6, 5, '#FFE45C', 0.6, 1), x0 + aim.dx * d, y0 + aim.dy * d);
    return;
  }
  const def = sdef(me, aim.s);
  const x0 = bx(me.x), y0 = by(me.y), cancel = aim.cancel;
  const col = cancel ? '#FF5A5A' : '#FFFFFF';
  if (def.aim === 'dir') {
    const len = Math.min(def.range, 1300) / PXU;
    const ex = x0 + aim.dx * len, ey = y0 + aim.dy * len;
    const w = def.id === 's1' ? 0 : def.id === 'w3' ? 4 : 3;
    if (def.id === 's1') {
      const a0 = Math.atan2(aim.dy, aim.dx);
      for (const da of [-0.32, 0.32]) dashLine(g, x0, y0, x0 + Math.cos(a0 + da) * len, y0 + Math.sin(a0 + da) * len, col);
      dashLine(g, x0, y0, ex, ey, col);
    } else {
      const nx = -aim.dy, ny = aim.dx;
      dashLine(g, x0 + nx * w, y0 + ny * w, ex + nx * w, ey + ny * w, col);
      dashLine(g, x0 - nx * w, y0 - ny * w, ex - nx * w, ey - ny * w, col);
      g.fillStyle = col; g.fillRect(Math.round(ex) - 1, Math.round(ey) - 1, 3, 3);
    }
  } else if (def.aim === 'point') {
    const range = Math.round(def.range / PXU);
    drawAt(circleRing(range, '#FFFFFF', 0.45, 2), x0, y0);
    const px = x0 + aim.dx * aim.mag * def.range / PXU, py = y0 + aim.dy * aim.mag * def.range / PXU;
    const r = Math.round((def.rad || 120) / PXU);
    drawAt(circleRing(r, col, 0.95, 0), px, py);
    drawAt(ellipseImg(r, Math.round(r * 0.82), col, 0.22), px, py);
  } else {
    const r = Math.round((def.range || 200) / PXU);
    drawAt(circleRing(r, col, 0.8, 0), x0, y0);
  }
}
function dashLine(g, x0, y0, x1, y1, col) {
  const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d);
  g.fillStyle = col;
  for (let i = 0; i <= n; i++) { if (Math.floor(i / 3) % 2) continue; const t = i / n; g.fillRect(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), 1, 1); }
}
function drawShadow(u) {
  const px = bx(u.x), py = by(u.y);
  if (u.kind === 'tower') { if (!u.dead) drawAt(ellipseImg(13, 5, '#000', 0.3), px, py + 1); return; }
  if (u.kind === 'crystal') { drawAt(ellipseImg(18, 6, '#000', 0.3), px, py + 2); return; }
  const r = Math.max(4, Math.round(u.r / PXU * 0.9));
  drawAt(ellipseImg(r, Math.max(2, Math.round(r * 0.38)), '#000', 0.3), px, py + 1);
}
function heroPose(W, h) {
  if (stunned(h)) return ['stun', 0];
  if (W.t - h.atkT < 0.24) return ['atk', W.t - h.atkT < 0.1 ? 0 : 1];
  if (W.t - (h.castT || -9) < 0.3 || h.chan || fxOn(h, 'spin')) return ['cast', 0];
  if (h.moving || h.dash || h.leap) return ['walk', Math.floor(R.t * 7) % 2];
  return ['idle', Math.floor(R.t * 1.6) % 2];
}
function drawUnit(W, u, me) {
  const g = R.g, px = bx(u.x), py = by(u.y);
  const white = W.t - (u.flashT || -9) < 0.06;
  if (u.kind === 'hero') {
    const [pose, fr] = heroPose(W, u);
    const img = heroSprite(u.hid, pose, fr, u.face, white);
    const z = Math.round((u.z || 0) / PXU);
    let alpha = 1;
    if (fxOn(u, 'invis') || (u.chan && u.hid === 'assassin')) alpha = 0.45;
    else if (u.bush && u.team === 0) alpha = 0.7;
    if (fxOn(u, 'spin')) {                    // 旋风斩：脚下一圈刀光
      const a0 = R.t * 18;
      for (let i = 0; i < 10; i++) { const a = a0 + i * 0.6; g.fillStyle = i % 2 ? '#FFFFFF' : '#DDE3EA'; g.fillRect(px + Math.round(Math.cos(a) * 30), py - 6 + Math.round(Math.sin(a) * 12), 2, 1); }
    }
    g.globalAlpha = alpha;
    g.drawImage(img, px - (HX + 12), py - (HY + 16) - z);
    g.globalAlpha = 1;
    // 护盾：一圈亮边
    if (shieldOf(u) > 1) drawAt(ellipseImg(16, 14, '#BFE6FF', 0.35 + 0.15 * Math.sin(R.t * 8), 1), px, py - 9 - z);
    if (fxOn(u, 'root')) { g.fillStyle = '#5CB85C'; for (let i = 0; i < 5; i++) g.fillRect(px - 10 + i * 5, py - 3 + (i % 2), 2, 4); }
    if (fxOn(u, 'slow') && !fxOn(u, 'root')) { g.fillStyle = '#9CE8FF'; const f = Math.floor(R.t * 6) % 3; g.fillRect(px - 8 + f * 6, py, 1, 1); g.fillRect(px + 6 - f * 4, py - 1, 1, 1); }
    if (fxOn(u, 'red')) { g.fillStyle = Math.floor(R.t * 8) % 2 ? '#FF7A3A' : '#FFB040'; g.fillRect(px - 13, py - 20 - z, 1, 2); g.fillRect(px + 12, py - 22 - z, 1, 2); }
    if (fxOn(u, 'blue')) { g.fillStyle = Math.floor(R.t * 6) % 2 ? '#5FD4FF' : '#C8F4FF'; g.fillRect(px - 12, py - 24 - z, 1, 1); g.fillRect(px + 11, py - 18 - z, 1, 1); }
    return;
  }
  if (u.kind === 'minion') {
    const fr = u.moving ? Math.floor(R.t * 6 + u.id) % 2 : 0;
    const img = minionSprite(u.mt, u.team, fr, u.face, white);
    g.drawImage(img, px - (img.width >> 1), py - img.height + 3);
    return;
  }
  if (u.kind === 'monster') {
    const fr = (u.moving || W.t - u.atkT < 0.3) ? Math.floor(R.t * 5) % 2 : Math.floor(R.t * 1.5) % 2;
    const img = monsterSprite(u.mt, fr, u.face, white);
    g.globalAlpha = u.reset ? 0.6 : 1;
    g.drawImage(img, px - (img.width >> 1), py - img.height + 4);
    g.globalAlpha = 1;
    return;
  }
  if (u.kind === 'tower') {
    if (u.dead) { const img = rubbleSprite(u.team); g.drawImage(img, px - (img.width >> 1), py - img.height + 4); return; }
    const img = towerSprite(u.team, u.tier, u.hp / u.maxHp, Math.floor(R.t * 2) % 2);
    g.drawImage(img, px - (img.width >> 1), py - img.height + 6);
    if (white) { g.globalAlpha = 0.5; g.drawImage(whiteOf(img), px - (img.width >> 1), py - img.height + 6); g.globalAlpha = 1; }
    return;
  }
  if (u.kind === 'crystal') {
    const img = crystalSprite(u.team, Math.floor(R.t * 1.5) % 2);
    g.drawImage(img, px - (img.width >> 1), py - img.height + 8);
    if (Math.floor(R.t * 3) % 4 === 0) { g.fillStyle = '#FFFFFF'; g.fillRect(px - 6 + Math.floor(R.t * 7) % 12, py - 48, 1, 1); }
  }
}
function barColor(u, me) {
  if (u.kind === 'hero') return u.id === me.id ? [C.green, C.green2] : u.team === 0 ? [C.blue, C.blue2] : [C.red, C.red2];
  if (u.team === 2) return ['#F2A03A', '#B06A1A'];
  return u.team === 0 ? [C.blue, C.blue2] : [C.red, C.red2];
}
function drawBars(W, u, me) {
  if (u.dead) return;
  const g = R.g, px = bx(u.x), py = by(u.y);
  const [c1, c2] = barColor(u, me);
  const p = clamp(u.hp / u.maxHp, 0, 1);
  if (u.kind === 'hero') {
    const z = Math.round((u.z || 0) / PXU);
    const w = 28, x0 = px - 12, y0 = py - 34 - z;
    const sh = shieldOf(u);
    g.fillStyle = C.ink; g.fillRect(x0 - 1, y0 - 1, w + 2, 5);
    g.fillStyle = '#3A3240'; g.fillRect(x0, y0, w, 3);
    g.fillStyle = c1; g.fillRect(x0, y0, Math.round(w * p), 3);
    g.fillStyle = c2; g.fillRect(x0, y0 + 2, Math.round(w * p), 1);
    if (sh > 1) { const sw = Math.min(w, Math.round(w * sh / u.maxHp)); g.fillStyle = '#F4F4F4'; g.fillRect(Math.min(x0 + w - sw, x0 + Math.round(w * p)), y0, sw, 2); }
    for (let k = 500; k < u.maxHp; k += 500) { const tx = x0 + Math.round(w * k / u.maxHp); if (tx < x0 + w * p) { g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(tx, y0, 1, 2); } }
    // 等级
    const lv = digitsImg(String(u.lvl), C.white, 1);
    g.fillStyle = u.team === 0 ? (u.id === me.id ? '#2E7A2E' : '#244E8A') : '#8A2A2A';
    g.fillRect(x0 - 9, y0 - 2, 8, 7); g.fillStyle = C.ink; g.fillRect(x0 - 9, y0 - 2, 8, 1);
    g.drawImage(lv, x0 - 5 - (lv.width >> 1), y0 - 2);
    // 状态：眩晕的星星
    if (stunned(u)) { for (let i = 0; i < 3; i++) { const a = R.t * 7 + i * 2.1; g.fillStyle = '#FFE45C'; g.fillRect(px + Math.round(Math.cos(a) * 8), y0 - 5 + Math.round(Math.sin(a) * 2), 2, 2); } }
    // 回城进度
    if (u.recall) { const k = clamp((W.t - u.recall) / RECALL_T, 0, 1); g.fillStyle = C.ink; g.fillRect(x0 - 1, y0 + 6, w + 2, 3); g.fillStyle = '#7FB4FF'; g.fillRect(x0, y0 + 7, Math.round(w * k), 1); }
    return;
  }
  if (u.kind === 'minion') {
    if (p >= 0.999 && u.team === 0) return;
    const big = u.mt === 'super' || u.mt === 'vanguard';
    const w = big ? 20 : 12, x0 = px - (w >> 1), y0 = py - (u.mt === 'vanguard' ? 40 : big ? 26 : 16);
    g.fillStyle = C.ink; g.fillRect(x0 - 1, y0 - 1, w + 2, 3);
    g.fillStyle = c1; g.fillRect(x0, y0, Math.max(1, Math.round(w * p)), 1);
    return;
  }
  if (u.kind === 'monster') {
    if (p >= 0.999 && !u.aggro) return;
    const big = u.mt === 'drake' || u.mt === 'lord';
    const w = big ? 36 : 20, x0 = px - (w >> 1), y0 = py - (u.mt === 'lord' ? 70 : u.mt === 'drake' ? 50 : 36);
    g.fillStyle = C.ink; g.fillRect(x0 - 1, y0 - 1, w + 2, 4);
    g.fillStyle = c1; g.fillRect(x0, y0, Math.round(w * p), 2);
    return;
  }
  if (u.kind === 'tower' || u.kind === 'crystal') {
    const w = u.kind === 'crystal' ? 36 : 26, x0 = px - (w >> 1), y0 = py - (u.kind === 'crystal' ? 66 : u.tier === 2 ? 66 : 60);
    g.fillStyle = C.ink; g.fillRect(x0 - 1, y0 - 1, w + 2, 5);
    g.fillStyle = '#3A3240'; g.fillRect(x0, y0, w, 3);
    g.fillStyle = c1; g.fillRect(x0, y0, Math.round(w * p), 3);
    if (u.inv) { g.fillStyle = 'rgba(255,255,255,0.35)'; for (let x = 0; x < w; x += 3) g.fillRect(x0 + x, y0, 1, 3); }
  }
}
function drawProj(W, p) {
  const g = R.g, x = bx(p.x), y = by(p.y);
  const team = p.team;
  switch (p.vis) {
    case 'arrow': case 'bolt': {
      const a = p.kind === 'line' ? Math.atan2(p.dy, p.dx) : (p.ang || 0), dx = Math.cos(a), dy = Math.sin(a);
      g.fillStyle = p.vis === 'bolt' ? (team ? '#FFB0A0' : '#B0D0FF') : '#E8D8B0';
      for (let i = 0; i < (p.vis === 'bolt' ? 3 : 6); i++) g.fillRect(Math.round(x - dx * i), Math.round(y - dy * i), 1, 1);
      g.fillStyle = '#FFFFFF'; g.fillRect(Math.round(x + dx), Math.round(y + dy), 1, 1);
      break;
    }
    case 'orb': g.fillStyle = '#B98AFF'; g.fillRect(x - 2, y - 2, 4, 4); g.fillStyle = '#F0E0FF'; g.fillRect(x - 1, y - 1, 2, 2); break;
    case 'heart': g.fillStyle = '#FF4F7B'; g.fillRect(x - 2, y - 1, 2, 2); g.fillRect(x + 1, y - 1, 2, 2); g.fillRect(x - 1, y, 3, 2); g.fillRect(x, y + 2, 1, 1); break;
    case 'shell': g.fillStyle = '#2A2C33'; g.fillRect(x - 2, y - 2, 4, 4); g.fillStyle = '#8A8E99'; g.fillRect(x - 1, y - 1, 1, 1); break;
    case 'tower': case 'crystal': {
      const col = TEAM_COL[team], lt = TEAM_LT[team];
      g.fillStyle = col; g.fillRect(x - 3, y - 3, 6, 6); g.fillStyle = lt; g.fillRect(x - 2, y - 2, 4, 4); g.fillStyle = '#FFFFFF'; g.fillRect(x - 1, y - 1, 2, 2);
      if (Math.random() < 0.6) R.parts.push({ x: p.x, y: p.y + 30, z: 30, vx: 0, vy: 0, vz: 0, life: 0, max: 0.25, col: lt, sz: 2, grav: 0 });
      break;
    }
    case 'fireball': {
      g.fillStyle = '#FF5A2A'; g.fillRect(x - 4, y - 4, 8, 8); g.fillStyle = '#FFB040'; g.fillRect(x - 3, y - 3, 6, 6); g.fillStyle = '#FFF0A0'; g.fillRect(x - 1, y - 2, 3, 3);
      R.parts.push({ x: p.x + (Math.random() - 0.5) * 12, y: p.y + 35, z: 35, vx: -p.dx * 40, vy: -p.dy * 40, vz: 20, life: 0, max: 0.35, col: Math.random() < 0.5 ? '#FF8A2A' : '#FFD050', sz: 2, grav: 0 });
      break;
    }
    case 'vine': {
      const a = Math.atan2(p.dy, p.dx);
      for (let i = 0; i < 10; i++) { const t = i * 1.4; g.fillStyle = i % 3 ? '#5CB85C' : '#8EE08E'; g.fillRect(Math.round(x - Math.cos(a) * t + Math.sin(R.t * 20 + i) * 1.2), Math.round(y - Math.sin(a) * t), 2, 2); }
      break;
    }
    case 'bigarrow': {
      const dx = p.dx, dy = p.dy;
      for (let i = 0; i < 16; i++) { g.fillStyle = i < 3 ? '#FFFFFF' : i < 12 ? '#FFE9A0' : '#E85A5A'; g.fillRect(Math.round(x - dx * i) - (i < 12 ? 1 : 0), Math.round(y - dy * i) - (i < 12 ? 1 : 0), i < 12 ? 3 : 2, i < 12 ? 3 : 2); }
      R.parts.push({ x: p.x, y: p.y + 35, z: 35, vx: 0, vy: 0, vz: 0, life: 0, max: 0.5, col: '#FFE9A0', sz: 2, grav: 0 });
      break;
    }
    default: g.fillStyle = '#FFFFFF'; g.fillRect(x - 1, y - 1, 2, 2);
  }
}
function drawParticles(dt) {
  const g = R.g;
  let n = 0;
  for (const p of R.parts) {
    p.life += dt;
    if (p.life >= p.max) continue;
    p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vz -= p.grav * dt;
    if (p.z < 0) { p.z = 0; p.vz *= -0.3; p.vx *= 0.6; p.vy *= 0.6; }
    const a = 1 - p.life / p.max;
    g.globalAlpha = a > 0.5 ? 1 : a * 2;
    g.fillStyle = p.col;
    g.fillRect(bx(p.x), by(p.y) - Math.round(p.z / PXU), p.sz, p.sz);
    R.parts[n++] = p;
  }
  R.parts.length = n;
  g.globalAlpha = 1;
  if (R.parts.length > 900) R.parts.splice(0, R.parts.length - 900);
}
function drawFloats(dt) {
  const g = R.g;
  let n = 0;
  for (const f of R.floats) {
    f.t += dt;
    if (f.t >= f.dur) continue;
    const k = f.t / f.dur;
    const up = f.big ? (k < 0.15 ? k / 0.15 * 10 : 10 + (k - 0.15) * 14) : k * f.vy * f.dur / PXU;
    g.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
    g.drawImage(f.img, bx(f.x) - (f.img.width >> 1), by(f.y) - 40 - Math.round(up));
    g.globalAlpha = 1;
    R.floats[n++] = f;
  }
  R.floats.length = n;
}
function drawFxs(W, dt) {
  const g = R.g;
  let n = 0;
  for (const f of R.fxs) {
    f.t += dt;
    if (f.t >= (f.dur || 0.5)) continue;
    const k = f.t / (f.dur || 0.5);
    const x = bx(f.x), y = by(f.y);
    switch (f.k) {
      case 'meteorArea': {                    // 流星雨的范围：一圈淡淡的虚线，下完就没
        g.globalAlpha = Math.min(1, (1 - k) * 3) * 0.7;
        drawAt(circleRing(Math.round(f.r / PXU), '#FF9A40', 1, 3), x, y);
        g.globalAlpha = 1;
        break;
      }
      case 'ring': case 'quake': case 'land': case 'ice': case 'dome': case 'boom': case 'meteorHit': {
        const col = f.col || (f.k === 'ice' ? '#9CE8FF' : f.k === 'dome' ? '#FFE070' : f.k === 'boom' || f.k === 'meteorHit' ? '#FF9A40' : '#F4E6C8');
        const r = Math.max(2, Math.round(f.r / PXU * (0.5 + 0.5 * Math.sqrt(k))));
        g.globalAlpha = (1 - k) * 0.85;
        drawAt(circleRing(r, col, 1, 0), x, y);
        g.globalAlpha = 1;
        break;
      }
      case 'slash': {
        const len = f.r / PXU, a0 = Math.atan2(f.dy, f.dx);
        g.globalAlpha = 1 - k;
        for (let i = -6; i <= 6; i++) {
          const a = a0 + i * 0.09 + (k - 0.5) * 0.6;
          const rr = len * (0.6 + 0.4 * (1 - Math.abs(i) / 6));
          g.fillStyle = Math.abs(i) < 2 ? '#FFFFFF' : f.col === 'gold' ? '#FFE070' : '#DDE3EA';
          g.fillRect(x + Math.round(Math.cos(a) * rr), y - 8 + Math.round(Math.sin(a) * rr * 0.8), 2, 2);
        }
        g.globalAlpha = 1;
        break;
      }
      case 'beam': {
        g.globalAlpha = 1 - k;
        dashLine(g, x, y - 10, bx(f.x2), by(f.y2) - 10, f.col || '#8EF08E');
        g.globalAlpha = 1;
        break;
      }
      case 'text': {
        g.globalAlpha = k > 0.75 ? (1 - k) / 0.25 : 1;
        g.drawImage(f.img, x - (f.img.width >> 1), y - 48 - Math.round(k * 10));
        g.globalAlpha = 1;
        break;
      }
    }
    R.fxs[n++] = f;
  }
  R.fxs.length = n;
}
if (typeof module !== 'undefined') module.exports = {};
