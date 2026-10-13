'use strict';
/* props.js：本集的道具和角色——夜空、月亮、篝火、温度计、睡眠开关、床、空调、暖气、窗外的城市、淋浴间、
   散热的热浪、睡眠手环、数羊、部落的小屋，以及"你"、原始人、部落的人。全部程序画的像素图。 */

/* 小脸：(x,y) 为两眼中点 */
function tinyFace(g, x, y, kind = 'n', o = {}) {
  const e = o.eye || '#1B1730', d = o.d ?? 2;
  x = ri(x); y = ri(y);
  if (kind === 'happy') { for (const s of [-1, 1]) { pdot(g, x + s * d - 1, y, e); pdot(g, x + s * d, y - 1, e); pdot(g, x + s * d + 1, y, e); } }
  else if (kind === 'sleep') { for (const s of [-1, 1]) prect(g, x + s * d - 1, y, 3, 1, e); }
  else for (const s of [-1, 1]) prect(g, x + s * d, y - 1, 1, 2, e);
  if (kind === 'happy') { pdot(g, x - 1, y + 2, e); pdot(g, x, y + 3, e); pdot(g, x + 1, y + 2, e); }
  else if (kind === 'shock') prect(g, x - 1, y + 2, 2, 2, e);
  else if (kind === 'angry') { pdot(g, x - d - 1, y - 2, e); pdot(g, x + d + 1, y - 2, e); prect(g, x - 1, y + 2, 3, 1, e); }
  else if (kind !== 'sleep') pdot(g, x, y + 2, e);
}

/* 颜色插值 */
function mixHex(a, b, u) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = s => [(s >> 16) & 255, (s >> 8) & 255, s & 255];
  const [r1, g1, b1] = ch(pa), [r2, g2, b2] = ch(pb);
  const f = (x, y) => Math.round(x + (y - x) * clamp(u)).toString(16).padStart(2, '0');
  return '#' + f(r1, r2) + f(g1, g2) + f(b1, b2);
}

/* ================= 夜晚的野外 ================= */
/* 天色：phase 0 傍晚 → 1 入夜 → 2 深夜 → 3 黎明。返回从上到下四个颜色 */
const SKY_KEYS = [
  ['#3B2A5E', '#7A3F6E', '#E07A5A', '#F2A65A'],
  ['#1B1F4A', '#2C2F66', '#46407A', '#5E4C84'],
  ['#0E1230', '#151A42', '#1E2350', '#2A2C5E'],
  ['#3A3F78', '#6B6AA8', '#C98FA8', '#F2C2A0'],
];
function skyAt(phase) {
  const i = Math.min(2, Math.floor(clamp(phase, 0, 3))), u = clamp(phase, 0, 3) - i;
  return SKY_KEYS[i].map((c, k) => mixHex(c, SKY_KEYS[Math.min(3, i + 1)][k], u));
}
function drawNightSky(g, w, hy, phase, t, o = {}) {
  const c = skyAt(phase);
  pbands(g, 0, w, [[0, c[0]], [Math.round(hy * .35), c[1]], [Math.round(hy * .7), c[2]], [hy - 6, c[3]], [hy, c[3]]], 3);
  const starA = clamp(1 - Math.abs(phase - 1.6) / 1.4) * (o.stars ?? 1);
  if (starA > .05) {
    for (let i = 0; i < (o.n || 46); i++) {
      const x = Math.floor(hash(i, 7) * w), y = Math.floor(hash(i, 8) * hy * .8);
      const tw = (Math.sin(t * (1.5 + hash(i, 9) * 3) + i) + 1) / 2;
      if (hash(i, 10) < starA * (.55 + tw * .45)) pdot(g, x, y, tw > .7 ? '#FFFFFF' : '#FFF3C4');
    }
  }
}
function drawMoon(g, x, y, r, bg) {
  pdisc(g, x, y, r, '#FFF3C4'); pdisc(g, x - 1, y - 1, r - 1, '#FFF8DA');
  pdisc(g, x + Math.round(r * .5), y - Math.round(r * .3), Math.round(r * .82), bg);
}
function drawHills(g, w, hy, col, seed = 0, amp = 5) {
  for (let x = 0; x < w; x++) { const h = amp + Math.sin(x * .07 + seed) * amp * .6 + Math.sin(x * .19 + seed * 2) * amp * .3; prect(g, x, hy - h, 1, h, col); }
}
function drawGround(g, w, h, hy, c1, c2, seed = 3) {
  pbands(g, 0, w, [[hy, c1], [hy + 30, c2], [h, c2]], 3);
  const r = R(seed);
  for (let i = 0; i < w * 1.1; i++) { const x = r() * w, y = hy + 2 + r() * (h - hy); pdot(g, x, y, r() < .5 ? shadeOf(c2, .8) : shadeOf(c1, 1.15)); }
}
/* 篝火：(x,y) 为柴堆中心底部；k 为火势 0..1 */
function drawFire(g, x, y, t, k = 1) {
  prect(g, x - 6, y - 2, 12, 2, '#6B4630'); pline(g, x - 6, y - 4, x + 5, y - 1, '#8C6440'); pline(g, x + 6, y - 4, x - 5, y - 1, '#7A5238');
  if (k <= .05) { for (let i = 0; i < 4; i++) if ((Math.floor(t * 4) + i) % 3) pdot(g, x - 3 + i * 2, y - 3, '#FF8A3D'); return; }
  for (let i = 0; i < 5; i++) {
    const h = Math.round((3 + Math.floor((Math.sin(t * 13 + i * 1.9) + 1) * 2.5)) * k);
    prect(g, x - 4 + i * 2, y - 2 - h, 2, h, i % 2 ? '#FF8A3D' : '#FFD84A');
  }
  if (Math.floor(t * 6) % 2) pdot(g, x + Math.round(Math.sin(t * 3) * 3), y - 9 - Math.floor((t * 8) % 5), '#FFD84A');
}
/* 火光：在缓冲上叠一圈暖色 */
function fireGlow(g, x, y, r, a) {
  g.save(); g.globalAlpha = a; const gr = g.createRadialGradient(x, y, 1, x, y, r);
  gr.addColorStop(0, 'rgba(255,170,80,.55)'); gr.addColorStop(1, 'rgba(255,140,60,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
}
/* 手机屏幕的冷光 */
function phoneGlow(g, x, y, r, a = 1) {
  g.save(); g.globalAlpha = a; const gr = g.createRadialGradient(x, y, 1, x, y, r);
  gr.addColorStop(0, 'rgba(170,215,255,.6)'); gr.addColorStop(1, 'rgba(170,215,255,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
}
/* 草棚（部落的小屋）：(x,y) 底边中心 */
function drawHut(g, x, y, s = 1, col = '#3A2E40') {
  const w = Math.round(14 * s), h = Math.round(10 * s);
  for (let j = 0; j < h; j++) { const hw = Math.round(w * Math.sqrt(1 - Math.pow(j / h, 2)) / 2) + 1; prect(g, x - hw, y - j, hw * 2, 1, col); }
  prect(g, x - 2, y - Math.round(4 * s), 4, Math.round(4 * s), shadeOf(col, .6));
}
/* 飘起来的 Z */
function drawZzz(g, x, y, t, col = '#FFFFFF', n = 3) {
  const k = Math.floor(t * 2.2) % (n + 1);
  for (let i = 0; i < Math.min(n, k + 1); i++) {
    const s = 2 + i, xx = x + i * 4, yy = y - i * 5;
    prect(g, xx, yy, s + 1, 1, col); for (let j = 1; j < s; j++) pdot(g, xx + s - j, yy + j, col); prect(g, xx, yy + s, s + 1, 1, col);
  }
}
/* 风：几道往左飘的白线 */
function drawBreeze(g, w, y0, h, t, a = 1) {
  g.save(); g.globalAlpha *= a;
  for (let i = 0; i < 6; i++) {
    const y = y0 + Math.floor(hash(i, 3) * h), len = 8 + Math.floor(hash(i, 4) * 10);
    const x = w - ((t * (26 + hash(i, 5) * 20) + hash(i, 6) * w) % (w + len * 2));
    prect(g, x, y, len, 1, 'rgba(220,235,255,.7)'); prect(g, x + len - 3, y - 1, 3, 1, 'rgba(220,235,255,.5)');
  }
  g.restore();
}

/* ================= 温度与开关 ================= */
/* 温度计：(x,y) 为玻璃管顶端中心；h 管长；level 0..1 水银高度；line 0..1 "关机线"位置（可选） */
function drawThermo(g, x, y, h, level, o = {}) {
  x = ri(x); y = ri(y);
  const ink = '#1B1730', glass = o.glass || '#E8F4FF', merc = o.merc || '#FF5A4F';
  prect(g, x - 3, y - 1, 7, h + 2, ink); prect(g, x - 2, y, 5, h, glass);
  pdisc(g, x, y + h + 4, 5, ink); pdisc(g, x, y + h + 4, 4, merc); pdot(g, x - 2, y + h + 2, '#FFB0A8');
  const mh = Math.round(h * clamp(level));
  prect(g, x - 1, y + h - mh, 3, mh + 1, merc);
  for (let k = 0; k <= h; k += 4) prect(g, x + 4, y + k, k % 8 ? 1 : 2, 1, ink);
  if (o.line !== undefined) {
    const ly = y + h - Math.round(h * o.line);
    for (let i = -7; i <= 8; i += 2) pdot(g, x + i, ly, o.lineCol || '#5EC8FF');
  }
}
/* 睡眠开关：(x,y) 左上，30×40；s：0 = 醒，1 = 睡；脸长在面板上 */
function drawSwitch(g, x, y, t, s, o = {}) {
  x = ri(x); y = ri(y);
  const ink = '#1B1730', body = o.body || '#3B3363', rim = '#6B6488';
  prect(g, x, y + 1, 30, 38, ink); prect(g, x + 1, y, 28, 40, ink);
  prect(g, x + 1, y + 1, 28, 38, rim); prect(g, x + 2, y + 2, 26, 36, body);
  // 刻度槽
  prect(g, x + 13, y + 14, 4, 20, '#1E1A3A');
  pdot(g, x + 8, y + 15, '#FFD34E'); pdot(g, x + 8, y + 33, '#5EC8FF');
  // 拉杆：从槽中心出发，角度随 s 变化
  const a = lerp(-1.05, 1.05, clamp(s)), cx = x + 15, cy = y + 24, L = 11;
  const hx = cx + Math.round(Math.sin(a) * 0), hy = cy + Math.round(Math.sin(a) * L);
  prect(g, cx - 1, Math.min(cy, hy), 3, Math.abs(hy - cy) + 1, '#C9D3DE');
  pdisc(g, hx, hy, 3, o.knob || '#FF5A4F'); pdot(g, hx - 1, hy - 1, '#FFB0A8');
  // 脸
  tinyFace(g, x + 15, y + 7, s > .5 ? 'sleep' : (o.face || 'n'), { d: 4, eye: '#FFFFFF' });
}
/* 散热的热浪：从小怪（左上 x,y）的两只手和四条腿往外冒；k 强度 0..1 */
function drawVents(g, x, y, t, k = 1, o = {}) {
  if (k <= .02) return;
  const cols = ['#FF8A3D', '#FFB547', '#FF5A4F'];
  const pts = [[-3, 5, -1, 0], [26, 5, 1, 0], [5, 17, 0, 1], [9, 17, 0, 1], [15, 17, 0, 1], [19, 17, 0, 1]];
  pts.forEach(([px, py, dx, dy], i) => {
    for (let j = 0; j < 3; j++) {
      const ph = (t * 1.8 + j / 3 + i * .17) % 1, d = Math.round(ph * 9 * (o.len || 1));
      if (hash(i, j, Math.floor(t * 6)) > k) continue;
      const wob = Math.round(Math.sin(t * 9 + j * 2 + i) * 1.2);
      const xx = x + px + dx * d + (dy ? wob : 0), yy = y + py + dy * d + (dx ? wob : 0);
      g.save(); g.globalAlpha *= (1 - ph) * k; prect(g, xx, yy, dx ? 2 : 1, dy ? 2 : 1, cols[(i + j) % 3]); g.restore();
    }
  });
}
/* 睡眠手环：戴在小怪的手臂上，(x,y) 为左上 */
function drawWristband(g, x, y, t) { prect(g, x, y, 4, 2, '#22202A'); pdot(g, x + 1 + (Math.floor(t * 2) % 2), y, '#5BE37D'); }

/* ================= 卧室 ================= */
/* 床：(x,y) 床垫左上；w 宽；人画在床上之后再调用 blanket() 盖被子 */
function drawBed(g, x, y, w, o = {}) {
  const wood = o.wood || '#8C6440', dk = shadeOf(wood, .7);
  prect(g, x - 2, y - 12, 3, 18, wood); prect(g, x - 2, y - 12, 3, 1, shadeOf(wood, 1.2));
  prect(g, x, y, w, 4, '#F4F4F4'); prect(g, x, y + 3, w, 1, '#C9D3DE');
  prect(g, x - 2, y + 4, w + 4, 2, dk); prect(g, x - 1, y + 6, 2, 3, dk); prect(g, x + w - 1, y + 6, 2, 3, dk);
  prect(g, x + 1, y - 5, 9, 5, '#FFFFFF'); prect(g, x + 1, y - 1, 9, 1, '#DCE4EE');
}
function blanket(g, x, y, w, col = '#6E9BD6', h = 7) {
  prect(g, x + 4, y - h, w - 4, h + 3, col); prect(g, x + 4, y - h, w - 4, 1, shadeOf(col, 1.25));
  for (let i = 8; i < w - 2; i += 6) prect(g, x + i, y - h + 2, 1, h - 1, shadeOf(col, .85));
  prect(g, x + 4, y + 2, w - 4, 1, shadeOf(col, .7));
}
/* 空调：(x,y) 左上，30×9；on：出风 */
function drawAC(g, x, y, t, o = {}) {
  prect(g, x, y, 30, 9, '#F2F2F2'); prect(g, x, y + 7, 30, 2, '#C9D3DE'); prect(g, x, y, 30, 1, '#FFFFFF');
  for (let i = 2; i < 22; i += 3) prect(g, x + i, y + 4, 2, 1, '#DCE4EE');
  prect(g, x + 22, y + 2, 6, 4, '#1E2A3A'); pdot(g, x + 23, y + 3, '#5BE37D');
  if (o.on) for (let i = 0; i < 4; i++) { const ph = (t * 1.2 + i * .25) % 1; g.save(); g.globalAlpha *= 1 - ph; prect(g, x + 3 + i * 6, y + 10 + Math.round(ph * 8), 4, 1, '#BFE6FF'); g.restore(); }
}
/* 暖气片：(x,y) 左下；n 片；glow：在发热 */
function drawRadiator(g, x, y, n, t, glow = 0) {
  const c = mixHex('#C9D3DE', '#FFB08A', glow);
  for (let i = 0; i < n; i++) { prect(g, x + i * 3, y - 12, 2, 12, c); prect(g, x + i * 3, y - 12, 1, 12, shadeOf(c, 1.15)); }
  prect(g, x - 1, y - 10, n * 3 + 1, 1, shadeOf(c, .8)); prect(g, x - 1, y - 3, n * 3 + 1, 1, shadeOf(c, .8));
  if (glow > .1) for (let i = 0; i < 3; i++) { const ph = (t * .8 + i / 3) % 1; g.save(); g.globalAlpha *= (1 - ph) * glow; prect(g, x + 2 + i * 4 + Math.round(Math.sin(t * 5 + i) * 1), y - 14 - Math.round(ph * 8), 1, 2, '#FF8A3D'); g.restore(); }
}
/* 窗外的夜城：(x,y) 左上 */
function drawWindowCity(g, x, y, w, h, t) {
  prect(g, x - 2, y - 2, w + 4, h + 4, '#5E6B8A'); prect(g, x, y, w, h, '#1B1F4A');
  for (let i = 0; i < 6; i++) pdot(g, x + Math.floor(hash(i, 21) * w), y + Math.floor(hash(i, 22) * h * .4), '#FFF3C4');
  let bx = x;
  for (let i = 0; bx < x + w; i++) {
    const bw = 4 + Math.floor(hash(i, 23) * 5), bh = Math.round(h * (.35 + hash(i, 24) * .45));
    prect(g, bx, y + h - bh, Math.min(bw, x + w - bx), bh, '#2A2C5E');
    for (let wy = y + h - bh + 2; wy < y + h - 1; wy += 3) for (let wx = bx + 1; wx < Math.min(bx + bw - 1, x + w - 1); wx += 2)
      if (hash(wx, wy, Math.floor(t * .3)) < .45) pdot(g, wx, wy, '#FFD84A');
    bx += bw + 1;
  }
  prect(g, x + Math.floor(w / 2), y, 1, h, '#5E6B8A'); prect(g, x, y + Math.floor(h / 2), w, 1, '#5E6B8A');
}
/* 数羊 */
const SHEEP = () => spr('sheep', [
  '..wwwwww....',
  '.wwwWwwww...',
  'wwWwwwwWwwkk',
  'wwwwwwwwwkkk',
  '.wwwWwwwwwk.',
  '..wwwwwww...',
  '..k.k..k.k..',
  '..k.k..k.k..',
], { w: '#FFFFFF', W: '#DCE4EE', k: '#2B2547' });
function drawFence(g, x, y) { prect(g, x, y - 8, 1, 8, '#C98B4A'); prect(g, x + 8, y - 8, 1, 8, '#C98B4A'); prect(g, x - 1, y - 6, 11, 1, '#E8C08A'); prect(g, x - 1, y - 3, 11, 1, '#E8C08A'); }

/* ================= 淋浴间 ================= */
function drawTiles(g, x, y, w, h, c1 = '#DCEFF5', c2 = '#C4E2EC') {
  prect(g, x, y, w, h, c1);
  for (let i = x; i < x + w; i += 6) prect(g, i, y, 1, h, c2);
  for (let j = y; j < y + h; j += 6) prect(g, x, j, w, 1, c2);
}
/* 花洒：(x,y) 喷头中心；on 出水；steam 0..1 */
function drawShower(g, x, y, t, on, steam = 0, w = 24) {
  prect(g, x + 6, y - 22, 2, 20, '#9AA1AD'); prect(g, x - 1, y - 22, 9, 2, '#9AA1AD');
  prect(g, x - 5, y - 2, 11, 3, '#C9D3DE'); prect(g, x - 4, y + 1, 9, 1, '#9AA1AD');
  if (on) for (let i = 0; i < 14; i++) {
    const ph = (t * 2.4 + hash(i, 31)) % 1, xx = x - 4 + Math.floor(hash(i, 32) * 9) + Math.round((hash(i, 33) - .5) * ph * 8);
    prect(g, xx, y + 3 + Math.round(ph * 40), 1, 2, '#9FD3FF');
  }
  if (steam > .02) for (let i = 0; i < 7; i++) {
    const ph = (t * .35 + i / 7) % 1, cx = x - w / 2 + hash(i, 34) * w, cy = y + 40 - ph * 46;
    g.save(); g.globalAlpha *= steam * Math.sin(ph * Math.PI) * .75; pell(g, cx, cy, 4 + i % 3, 2 + i % 2, '#FFFFFF'); g.restore();
  }
}

/* ================= 角色 ================= */
/* "你"：戴红领巾（第一集的主角）；night：戴睡帽 */
function drawYou(g, x, y, t, o = {}, flip = false) {
  drawClawd(g, x, y, Object.assign({ scarf: true, eyes: blinkEyes(t, 1) }, o.night ? { hat: 'night' } : {}, o), flip);
}
/* 原始人 */
function drawCaveman(g, x, y, t, o = {}) {
  drawClawd(g, x, y, Object.assign({ hat: 'bone', eyes: blinkEyes(t, 4) }, o));
}
/* 部落的人：头带；elder：白眉毛的老人 */
function drawTribe(g, x, y, t, o = {}) {
  drawClawd(g, x, y, Object.assign({ hat: 'band', eyes: blinkEyes(t, o.seed || 2), brows: !!o.elder }, o));
  if (o.band) drawWristband(g, x - 1, y + 5, t);
}
