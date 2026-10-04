'use strict';
/* props.js：道具与背景 —— 奶茶杯、奶茶店、野外、蜂巢、石板、蛎鹬、手机…… */

function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mix(a, b, u) { const A = hex2rgb(a), B = hex2rgb(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], u))).join(',')})`; }

/* ---------- 奶茶杯 ---------- */
const CUP_H = 330;
function cupPath(g) { g.beginPath(); g.moveTo(-82, -4); g.quadraticCurveTo(-82, 0, -76, 0); g.lineTo(76, 0); g.quadraticCurveTo(82, 0, 82, -4); g.lineTo(112, -CUP_H); g.lineTo(-112, -CUP_H); g.closePath(); }
const PEARLS = (() => { const out = [], r = R(31); for (let i = 0; i < 40; i++) { const row = Math.floor(i / 6), col = i % 6; out.push([-62 + col * 25 + (row % 2) * 11 + (r() - .5) * 6, -15 - row * 21 + (r() - .5) * 5, 11.5 + r() * 2]); } return out; })();
/* o: x,y(杯底),s,t,fill(0..1),pearls(数量),pearlDrop(0..1 下落进度),foam(0..1),lid(0..1),straw(0..1),label,labelCol,tea,shake */
function teaCup(g, o) {
  const s = o.s || 1, t = o.t || 0, lw = o.lw || 6, h = CUP_H;
  g.save(); g.translate(o.x, o.y); if (o.rot) g.rotate(o.rot); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round';
  const fill = o.fill ?? .8, foam = o.foam ?? 0, np = o.pearls ?? 0, tea = o.tea || TEA;
  cupPath(g); g.fillStyle = 'rgba(255,255,255,.45)'; g.fill();
  g.save(); cupPath(g); g.clip();
  const ly = -h * fill * (1 - .16 * foam);
  if (fill > 0) {
    const gr = g.createLinearGradient(0, ly, 0, 0); gr.addColorStop(0, mix(tea, '#FFFFFF', .18)); gr.addColorStop(1, mix(tea, '#000000', .12));
    g.fillStyle = gr; g.beginPath(); g.moveTo(-130, 4);
    for (let x = -130; x <= 130; x += 10) g.lineTo(x, ly + Math.sin(x * .05 + t * 6) * 4 * (o.slosh || 1));
    g.lineTo(130, 4); g.closePath(); g.fill();
  }
  // 珍珠
  for (let i = 0; i < Math.min(np, PEARLS.length); i++) {
    const [px, py, pr] = PEARLS[i];
    let yy = py;
    if (o.pearlDrop !== undefined) { const d = clamp(o.pearlDrop * 1.6 - i / PEARLS.length * .6); yy = lerp(-h - 60 - i * 9, py, E.bounce(d)); }
    circ(g, px, yy, pr); fs(g, '#3B2117', '#20110B', 2.5);
    g.fillStyle = 'rgba(255,255,255,.35)'; circ(g, px - pr * .35, yy - pr * .35, pr * .3); g.fill();
  }
  // 奶盖
  if (foam > 0) {
    const fy = ly, fh = 62 * foam;
    g.fillStyle = '#FFF4DF'; g.beginPath(); g.moveTo(-130, fy + 8);
    for (let x = -130; x <= 130; x += 12) g.lineTo(x, fy + 8 + Math.sin(x * .09 + 1) * 6);
    g.lineTo(130, fy - fh); g.lineTo(-130, fy - fh); g.closePath(); g.fill();
    g.fillStyle = 'rgba(230,200,150,.35)'; for (let i = 0; i < 7; i++) { circ(g, -90 + i * 30, fy - fh * .4 + Math.sin(i * 2) * 8, 6); g.fill(); }
  }
  g.restore();
  // 杯内的吸管
  if (o.straw > 0) {
    g.save(); cupPath(g); g.clip(); g.globalAlpha = .55; g.strokeStyle = o.strawCol || '#FF7FA0'; g.lineWidth = 26;
    g.beginPath(); g.moveTo(18, -12); g.lineTo(46, -h); g.stroke(); g.restore();
  }
  cupPath(g); g.strokeStyle = INK; g.lineWidth = lw; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 10; g.beginPath(); g.moveTo(-82, -40); g.lineTo(-98, -h + 40); g.stroke();
  // 杯盖
  if (o.lid > 0) {
    const lh = 70 * E.out(clamp(o.lid));
    g.beginPath(); g.ellipse(0, -h - 6, 116, lh, 0, Math.PI, TAU); g.closePath(); fs(g, 'rgba(255,255,255,.6)', INK, lw);
    rr(g, -124, -h - 14, 248, 18, 9); fs(g, '#FFFFFF', INK, lw);
  }
  // 杯外的吸管
  if (o.straw > 0) {
    const L = 230 * E.out(clamp(o.straw)), a = Math.atan2(-(h), 28), x0 = 46, y0 = -h - 10;
    const x1 = x0 + Math.cos(-1.35) * L * .35, y1 = y0 - L;
    g.save(); g.beginPath(); g.moveTo(x0, y0 + 10); g.lineTo(x1, y1);
    g.strokeStyle = INK; g.lineWidth = 26 + lw * 2; g.stroke(); g.strokeStyle = o.strawCol || '#FF7FA0'; g.lineWidth = 26; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 6; g.beginPath(); g.moveTo(x0 - 6, y0); g.lineTo(x1 - 6, y1 + 10); g.stroke();
    g.restore();
  }
  if (o.label) {
    g.save(); g.translate(0, -h * .5); g.rotate(-.04);
    tag(g, 0, 0, o.label, o.labelPx || 44, { fill: o.labelCol || '#FFFFFF', r: 14, shadow: false, lw: 5 });
    g.restore();
  }
  g.restore();
}
/* 透明吸管：液体从 (x0,y0) 吸到 (x1,y1)，prog 为液体前沿位置 */
function strawTube(g, x0, y0, x1, y1, prog, t, k = 1) {
  g.save(); g.lineCap = 'round';
  g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.strokeStyle = INK; g.lineWidth = 40 * k; g.stroke();
  g.strokeStyle = '#FFE1EA'; g.lineWidth = 28 * k; g.stroke();
  if (prog > 0) {
    const px = lerp(x0, x1, prog), py = lerp(y0, y1, prog);
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(px, py); g.strokeStyle = TEA; g.lineWidth = 24 * k; g.stroke();
    for (let j = 0; j < 5; j++) {
      const u = prog - .08 - j * .2 + ((t * 2.2) % .2); if (u < 0 || u > prog) continue;
      circ(g, lerp(x0, x1, u), lerp(y0, y1, u), 10 * k); fs(g, '#3B2117', null);
    }
  }
  g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 5 * k; g.beginPath(); g.moveTo(x0 - 8 * k, y0 - 3 * k); g.lineTo(x1 - 8 * k, y1 - 3 * k); g.stroke();
  g.restore();
}

/* ---------- 奶茶店 ---------- */
const MENU = [['珍珠奶茶', '#C98A55'], ['芋泥波波', '#B79BD6'], ['芝士奶盖', '#F2C063'], ['杨枝甘露', '#FFB347']];
function miniCup(g, x, y, s, col, foam) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.moveTo(-26, 0); g.lineTo(-34, -80); g.lineTo(34, -80); g.lineTo(26, 0); g.closePath(); fs(g, col, INK, 5);
  if (foam) { g.fillStyle = '#FFF4DF'; g.fillRect(-32, -80, 64, 18); g.beginPath(); g.moveTo(-26, 0); g.lineTo(-34, -80); g.lineTo(34, -80); g.lineTo(26, 0); g.closePath(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); }
  for (let i = 0; i < 5; i++) { circ(g, -16 + i * 8, -10 - (i % 2) * 8, 5); g.fillStyle = '#3B2117'; g.fill(); }
  g.beginPath(); g.ellipse(0, -82, 36, 14, 0, Math.PI, TAU); g.closePath(); fs(g, 'rgba(255,255,255,.8)', INK, 5);
  g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.moveTo(8, -92); g.lineTo(18, -128); g.stroke(); g.strokeStyle = '#FF7FA0'; g.lineWidth = 7; g.stroke();
  g.restore();
}
function menuBoard(g, x, y, t, o = {}) {
  const w = 820, h = 430;
  g.save(); g.translate(x, y);
  rr(g, -w / 2 + 8, -h / 2 + 12, w, h, 26); g.fillStyle = 'rgba(120,40,70,.18)'; g.fill();
  rr(g, -w / 2, -h / 2, w, h, 26); fs(g, '#FFF8EE', INK, 7);
  rr(g, -w / 2, -h / 2, w, 86, [26, 26, 0, 0]); fs(g, HOT, INK, 7);
  text(g, '今 日 菜 单', 0, -h / 2 + 45, 50, '#FFFFFF', 'fun');
  MENU.forEach(([name, col], i) => {
    const cx = -w / 2 + 205 + (i % 2) * 410, cy = -h / 2 + 175 + Math.floor(i / 2) * 140;
    const glow = (o.glow && o.glow[i]) || 0;
    if (glow > 0) { g.save(); g.globalAlpha = glow; g.fillStyle = 'rgba(255,214,59,.55)'; rr(g, cx - 190, cy - 64, 380, 128, 22); g.fill(); g.restore(); }
    miniCup(g, cx - 120, cy + 50, .82 + .08 * glow * Math.sin(t * 12 + i), col, i === 2);
    if (o.scribble) { g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); for (let k = 0; k <= 16; k++) g.lineTo(cx - 50 + k * 13, cy - 8 + Math.sin(k * 1.7 + i) * 10); g.stroke(); }
    else text(g, name, cx + 45, cy - 14, 46, INK, 'black');
    if (!o.scribble) text(g, ['¥15', '¥18', '¥19', '¥20'][i], cx + 45, cy + 36, 34, '#C2557A', 'bold');
    if (glow > .3) withAlpha(g, clamp((glow - .3) / .3), () => tag(g, cx + 150, cy - 50, '甜', 34, { fill: YEL, rot: .2 + .1 * Math.sin(t * 8 + i), shadow: false }));
  });
  g.restore();
}
function neon(g, x, y, s, t) {
  g.save(); g.translate(x, y); g.font = F(96, 'fun'); g.textAlign = 'center'; g.textBaseline = 'middle';
  const flick = .85 + .15 * Math.sin(t * 23) * Math.sin(t * 7);
  g.shadowColor = `rgba(255,80,140,${flick})`; g.shadowBlur = 40; g.lineWidth = 10; g.strokeStyle = `rgba(255,120,170,${flick})`; g.strokeText(s, 0, 0);
  g.shadowBlur = 12; g.fillStyle = '#FFF0F5'; g.fillText(s, 0, 0); g.restore();
}
function shopBack(g, t, o = {}) {
  const gr = g.createLinearGradient(0, 0, 0, 1300); gr.addColorStop(0, '#FFE0E8'); gr.addColorStop(1, '#FFC9D6');
  g.fillStyle = gr; g.fillRect(-400, -400, W + 800, H + 800);
  g.fillStyle = 'rgba(255,255,255,.35)'; for (let x = -400; x < W + 400; x += 90) g.fillRect(x, -400, 36, 1700);
  if (o.menu !== false) menuBoard(g, 540, 570, t, o);
  // 搁架
  g.fillStyle = '#F2D2A8'; rr(g, 60, 860, 960, 22, 8); fs(g, '#F2D2A8', INK, 5);
  for (let i = 0; i < 8; i++) { const x = 120 + i * 120; g.save(); g.translate(x, 860); g.beginPath(); g.moveTo(-22, 0); g.lineTo(-28, -64); g.lineTo(28, -64); g.lineTo(22, 0); g.closePath(); fs(g, 'rgba(255,255,255,.7)', INK, 4); g.restore(); }
  // 地板
  g.fillStyle = '#F7E9DA'; g.fillRect(-400, 1290, W + 800, 1000);
  g.fillStyle = '#EBD3BD'; for (let i = -6; i < 20; i++) for (let j = 0; j < 10; j++) if ((i + j) % 2 === 0) { g.beginPath(); const y0 = 1290 + j * 70, k = (y0 - 1290) / 600 + 1; g.rect(540 + (i - 7) * 90 * k, y0, 90 * k, 70); g.fill(); }
}
function fructoseMachine(g, x, y, t, o = {}) {
  g.save(); g.translate(x, y);
  rr(g, -80, -190, 160, 190, 16); fs(g, '#E8EEF4', INK, 6);
  rr(g, -58, -168, 116, 54, 8); fs(g, '#1E2B3A', INK, 4);
  g.font = F(30, 'black'); g.fillStyle = '#5CFF9D'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.disp || '果糖', 0, -140);
  rr(g, -20, -20, 40, 44, 6); fs(g, '#9AA6B4', INK, 5);
  for (let i = 0; i < 3; i++) { circ(g, -40 + i * 40, -82, 12); fs(g, ['#FF6F91', '#FFD43B', '#9EDDC8'][i], INK, 4); }
  g.restore();
}
function shopCounter(g, t, o = {}) {
  const y = o.y || 1070;
  rr(g, -40, y, W + 80, 40, 10); fs(g, '#F6E2C2', INK, 7);
  g.fillStyle = '#9EDDC8'; g.fillRect(-40, y + 40, W + 80, 400); g.strokeStyle = INK; g.lineWidth = 7; g.strokeRect(-40, y + 40, W + 80, 400);
  g.strokeStyle = 'rgba(42,35,48,.18)'; g.lineWidth = 6; for (let x = 40; x < W; x += 80) { g.beginPath(); g.moveTo(x, y + 60); g.lineTo(x, y + 300); g.stroke(); }
  if (o.machine !== false) fructoseMachine(g, 170, y, t, o);
  // 收银台
  if (o.register !== false) {
    g.save(); g.translate(920, y);
    rr(g, -70, -100, 140, 100, 12); fs(g, '#FFFFFF', INK, 6); rr(g, -50, -150, 100, 60, 8); fs(g, '#1E2B3A', INK, 5);
    g.fillStyle = '#5CFF9D'; g.font = F(26, 'black'); g.textAlign = 'center'; g.fillText('扫码', 0, -118); g.restore();
  }
}

/* ---------- 野外 ---------- */
function acacia(g, x, y, s, col) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col.trunk; g.lineWidth = 16; g.lineCap = 'round';
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -120); g.moveTo(0, -90); g.lineTo(-50, -150); g.moveTo(0, -110); g.lineTo(46, -160); g.stroke();
  g.fillStyle = col.leaf; ell(g, 0, -170, 150, 36); g.fill(); ell(g, -60, -158, 70, 24); g.fill(); ell(g, 70, -165, 70, 24); g.fill();
  g.restore();
}
function cloud(g, x, y, s, col, line) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const P = [[-90, 10, 50], [-40, -20, 66], [30, -26, 60], [90, 6, 48], [0, 18, 56]];
  if (line) { g.fillStyle = INK; for (const [a, b, r] of P) { circ(g, a, b, r + 5); g.fill(); } }
  g.fillStyle = col; for (const [a, b, r] of P) { circ(g, a, b, r); g.fill(); }
  g.restore();
}
function wildBack(g, t, o = {}) {
  const st = o.storm || 0, gy = o.ground || 1180;
  const gr = g.createLinearGradient(0, 0, 0, gy);
  gr.addColorStop(0, mix('#8FD0E6', '#2E2A48', st)); gr.addColorStop(1, mix('#FCE8C0', '#5F587A', st));
  g.fillStyle = gr; g.fillRect(-400, -400, W + 800, gy + 400);
  if (st < .99) {
    const u = o.sun ?? .62, sx = lerp(120, 960, u), sy = 760 - Math.sin(Math.PI * u) * 480;
    withAlpha(g, 1 - st, () => {
      const sg = g.createRadialGradient(sx, sy, 40, sx, sy, 260); sg.addColorStop(0, 'rgba(255,240,180,.9)'); sg.addColorStop(1, 'rgba(255,240,180,0)');
      g.fillStyle = sg; circ(g, sx, sy, 260); g.fill(); circ(g, sx, sy, 78); fs(g, '#FFE38A', null);
      cloud(g, 240 + Math.sin(t * .2) * 20, 330, .9, 'rgba(255,255,255,.9)'); cloud(g, 860 - Math.sin(t * .15) * 20, 470, .7, 'rgba(255,255,255,.85)');
    });
  }
  g.fillStyle = mix('#E9B97C', '#4A4466', st); g.beginPath(); g.moveTo(-400, gy - 120);
  for (let x = -400; x <= W + 400; x += 60) g.lineTo(x, gy - 170 - Math.sin(x * .006 + 1) * 90 - Math.sin(x * .017) * 30);
  g.lineTo(W + 400, gy); g.lineTo(-400, gy); g.closePath(); g.fill();
  g.fillStyle = mix('#D99F5C', '#3E3858', st); g.beginPath(); g.moveTo(-400, gy - 40);
  for (let x = -400; x <= W + 400; x += 60) g.lineTo(x, gy - 70 - Math.sin(x * .009 + 3) * 40);
  g.lineTo(W + 400, gy); g.lineTo(-400, gy); g.closePath(); g.fill();
  const tc = { trunk: mix('#6B4A2E', '#2A2438', st), leaf: mix('#8BA65A', '#343048', st) };
  if (o.trees !== false) { acacia(g, 150, gy - 40, .9, tc); acacia(g, 930, gy - 60, .7, tc); }
  const gg = g.createLinearGradient(0, gy, 0, H); gg.addColorStop(0, mix('#E4B866', '#4C4566', st)); gg.addColorStop(1, mix('#CF9B4E', '#38324E', st));
  g.fillStyle = gg; g.fillRect(-400, gy, W + 800, H - gy + 400);
  g.strokeStyle = mix('#B78740', '#2C2840', st); g.lineWidth = 5; g.lineCap = 'round';
  for (let i = 0; i < 26; i++) { const x = hash(i, 1) * W, y = gy + 40 + hash(i, 2) * 600; g.beginPath(); g.moveTo(x - 12, y); g.lineTo(x - 18, y - 22); g.moveTo(x, y); g.lineTo(x, y - 28); g.moveTo(x + 12, y); g.lineTo(x + 18, y - 22); g.stroke(); }
  if (st > 0) {
    withAlpha(g, st, () => { for (let i = 0; i < 4; i++) cloud(g, 120 + i * 300 + Math.sin(t * .8 + i) * 30, 260 + (i % 2) * 90, 1.4, '#47405F', false); });
  }
}
const BUSH = [[-90, 0, 64], [-30, -40, 74], [50, -30, 70], [100, 10, 56], [0, 20, 66], [-60, 30, 50], [60, 34, 50]];
function bush(g, x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const sh = o.shake ? Math.sin(t * 40) * 6 * o.shake : 0; g.translate(sh, 0); g.rotate(sh * .003);
  g.fillStyle = INK; for (const [a, b, r] of BUSH) { circ(g, a, b - 60, r + 6); g.fill(); }
  g.fillStyle = o.col || '#6FA14E'; for (const [a, b, r] of BUSH) { circ(g, a, b - 60, r); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.18)'; for (const [a, b, r] of BUSH.slice(0, 3)) { circ(g, a - r * .3, b - 60 - r * .35, r * .35); g.fill(); }
  const nb = o.berries ?? 0;
  for (let i = 0; i < nb; i++) { const bx = -80 + hash(i, 7) * 160, by = -100 + hash(i, 8) * 110; circ(g, bx, by, 10); fs(g, '#D9354C', INK, 3); }
  g.restore();
}
function berry(g, x, y, r, col = '#C9374D') { circ(g, x, y, r); fs(g, col, INK, Math.max(2, r * .25)); g.fillStyle = 'rgba(255,255,255,.5)'; circ(g, x - r * .3, y - r * .3, r * .28); g.fill(); g.strokeStyle = '#3F6B2A'; g.lineWidth = Math.max(2, r * .2); g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r * .3, y - r * 1.5); g.stroke(); }
function bee(g, x, y, s, t, ph = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const fl = Math.sin(t * 60 + ph) > 0 ? 1 : .55;
  g.fillStyle = 'rgba(255,255,255,.85)'; ell(g, -6, -16, 12, 18 * fl, -.4); fs(g, 'rgba(255,255,255,.85)', INK, 2.5); ell(g, 8, -16, 12, 18 * fl, .4); fs(g, 'rgba(255,255,255,.85)', INK, 2.5);
  ell(g, 0, 0, 22, 15); fs(g, '#FFD43B', INK, 3.5);
  g.save(); ell(g, 0, 0, 22, 15); g.clip(); g.fillStyle = INK; g.fillRect(-6, -20, 7, 40); g.fillRect(8, -20, 6, 40); g.restore();
  ell(g, 0, 0, 22, 15); g.strokeStyle = INK; g.lineWidth = 3.5; g.stroke();
  g.fillStyle = INK; circ(g, -14, -3, 3); g.fill();
  g.restore();
}
function honeycomb(g, x, y, s, t) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const hx = (cx, cy, r) => { g.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + Math.PI / 6; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); };
  for (const [a, b] of [[0, 0], [-34, -20], [34, -20], [-34, 20], [34, 20], [0, -40], [0, 40]]) { hx(a, b, 22); fs(g, '#F5B731', INK, 4); g.fillStyle = 'rgba(255,255,255,.35)'; circ(g, a - 6, b - 6, 5); g.fill(); }
  g.fillStyle = '#F5B731'; const d = (t * .8) % 1; ell(g, 20, 62 + d * 30, 7, 10 + d * 6); fs(g, '#F5B731', INK, 3);
  g.restore();
}
function hive(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(0, -80); g.lineTo(0, -60); g.stroke();
  ell(g, 0, 0, 62, 80); fs(g, '#E9B95A', INK, 6);
  g.save(); ell(g, 0, 0, 62, 80); g.clip(); g.strokeStyle = 'rgba(120,70,20,.5)'; g.lineWidth = 6; for (let k = -60; k < 80; k += 26) { g.beginPath(); g.ellipse(0, k, 66, 12, 0, 0, Math.PI); g.stroke(); } g.restore();
  ell(g, 0, 30, 14, 12); fs(g, '#3B2117', null);
  g.restore();
}
function bigTree(g, x, y, h, t) {
  g.save(); g.translate(x, y);
  g.beginPath(); g.moveTo(-60, 0); g.quadraticCurveTo(-40, -h * .5, -46, -h); g.lineTo(46, -h); g.quadraticCurveTo(40, -h * .5, 60, 0); g.closePath(); fs(g, '#8A5A34', INK, 7);
  g.strokeStyle = 'rgba(60,30,10,.35)'; g.lineWidth = 5; for (let i = 0; i < 9; i++) { const yy = -40 - i * h / 10; g.beginPath(); g.moveTo(-30 + (i % 3) * 14, yy); g.quadraticCurveTo(-10 + (i % 3) * 14, yy - 30, -20 + (i % 3) * 14, yy - 60); g.stroke(); }
  g.strokeStyle = INK; g.lineWidth = 30; g.beginPath(); g.moveTo(20, -h + 120); g.lineTo(240, -h + 60); g.stroke(); g.strokeStyle = '#8A5A34'; g.lineWidth = 20; g.stroke();
  const P = [[-200, -h - 40, 120], [-60, -h - 110, 140], [110, -h - 90, 130], [250, -h - 10, 100], [-120, -h + 40, 100], [60, -h + 10, 110]];
  g.fillStyle = INK; for (const [a, b, r] of P) { circ(g, a, b, r + 7); g.fill(); }
  g.fillStyle = '#6FA14E'; for (const [a, b, r] of P) { circ(g, a, b, r); g.fill(); }
  g.restore();
}

/* ---------- 方糖 ---------- */
function sugarCube(g, x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.lineJoin = 'round';
  poly(g, [[0, -30], [36, -12], [0, 6], [-36, -12]]); fs(g, '#FFFFFF', INK, 4);
  poly(g, [[-36, -12], [0, 6], [0, 46], [-36, 28]]); fs(g, '#E9EEF6', INK, 4);
  poly(g, [[36, -12], [0, 6], [0, 46], [36, 28]]); fs(g, '#D3DCEA', INK, 4);
  g.fillStyle = 'rgba(160,170,190,.6)'; for (let i = 0; i < 6; i++) { circ(g, -26 + hash(i, 5) * 22, 2 + hash(i, 6) * 28, 2); g.fill(); circ(g, 8 + hash(i, 7) * 22, 2 + hash(i, 8) * 28, 2); g.fill(); }
  g.restore();
}

/* ---------- 石板 ---------- */
function tablet(g, x, y, w, h, o = {}) {
  g.save(); g.translate(x, y);
  g.fillStyle = 'rgba(0,0,0,.25)'; rr(g, -w / 2 + 12, -h / 2 + 16, w, h, [w * .45, w * .45, 30, 30]); g.fill();
  rr(g, -w / 2, -h / 2, w, h, [w * .45, w * .45, 30, 30]); fs(g, '#A6A39B', INK, 8);
  g.strokeStyle = 'rgba(60,55,50,.35)'; g.lineWidth = 4;
  for (const [a, b, c, d] of [[-w * .4, -h * .1, -w * .3, h * .05], [w * .35, h * .3, w * .42, h * .42], [-w * .3, h * .38, -w * .18, h * .45]]) { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); }
  g.restore();
}
/* 石板上刻字：p 0..1 为刻出的比例 */
function carve(g, s, x, y, px, p, k = 'fun') {
  if (p <= 0) return;
  g.save(); g.font = F(px, k); const w = g.measureText(s).width;
  g.beginPath(); g.rect(x - w / 2 - 10, y - px, (w + 20) * clamp(p), px * 2); g.clip();
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = 'rgba(255,255,255,.45)'; g.fillText(s, x + 3, y + 4);
  g.fillStyle = '#3E3A35'; g.fillText(s, x, y);
  g.restore();
}

/* ---------- 蛎鹬与蛋 ---------- */
function egg(g, x, y, rx, ry, rot = 0, big = false) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.beginPath(); g.moveTo(0, -ry); g.bezierCurveTo(rx * 1.05, -ry, rx, ry * .9, 0, ry); g.bezierCurveTo(-rx, ry * .9, -rx * 1.05, -ry, 0, -ry); g.closePath();
  fs(g, '#E8D9AE', INK, big ? 8 : 5);
  g.save(); g.clip(); g.fillStyle = '#4A3A2A';
  for (let i = 0; i < 26; i++) { const a = hash(i, 11) * TAU, r = Math.sqrt(hash(i, 12)); ell(g, Math.cos(a) * rx * r * .9, Math.sin(a) * ry * r * .9, rx * (.03 + .05 * hash(i, 13)), ry * (.025 + .04 * hash(i, 14)), a); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.4)'; ell(g, -rx * .35, -ry * .4, rx * .2, ry * .14, -.5); g.fill();
  g.restore(); g.restore();
}
/* 蛎鹬：黑背白腹、橙红长喙、粉腿。o: x,y(脚底),s,t,legs(0..1 腿长),flip,eyes */
function oyster(g, o) {
  const s = o.s || 1, t = o.t || 0;
  g.save(); g.translate(o.x, o.y); g.scale(s * (o.flip ? -1 : 1), s); if (o.rot) g.rotate(o.rot); g.lineJoin = 'round'; g.lineCap = 'round';
  const lg = o.legs ?? 1, by = -30 - 70 * lg;
  if (lg > 0) { g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.moveTo(-14, by + 20); g.lineTo(-20, -2); g.moveTo(16, by + 20); g.lineTo(18, -2); g.stroke(); g.strokeStyle = '#F2A0A0'; g.lineWidth = 8; g.stroke(); }
  // 尾巴
  poly(g, [[-110, by - 20], [-160, by - 4], [-110, by + 12]]); fs(g, '#1E1B22', INK, 5);
  // 身体
  ell(g, 0, by, 112, 62, -.08); fs(g, '#FFFFFF', INK, 6);
  g.save(); ell(g, 0, by, 112, 62, -.08); g.clip(); g.fillStyle = '#1E1B22'; g.beginPath(); g.moveTo(-130, by - 70); g.lineTo(130, by - 70); g.lineTo(130, by - 4); g.quadraticCurveTo(0, by + 20, -130, by + 10); g.closePath(); g.fill(); g.restore();
  ell(g, 0, by, 112, 62, -.08); g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
  g.strokeStyle = '#FFFFFF'; g.lineWidth = 8; g.beginPath(); g.moveTo(-70, by - 14); g.quadraticCurveTo(0, by + 4, 60, by - 18); g.stroke();
  // 头
  const hx = 96, hy = by - 64 + Math.sin(t * 3) * 3;
  g.strokeStyle = INK; g.lineWidth = 30; g.beginPath(); g.moveTo(60, by - 20); g.lineTo(hx, hy); g.stroke(); g.strokeStyle = '#1E1B22'; g.lineWidth = 22; g.stroke();
  // 喙
  g.strokeStyle = INK; g.lineWidth = 18; g.beginPath(); g.moveTo(hx + 20, hy + 6); g.lineTo(hx + 132, hy + 26); g.stroke(); g.strokeStyle = '#F06A2A'; g.lineWidth = 11; g.stroke();
  circ(g, hx, hy, 40); fs(g, '#1E1B22', INK, 6);
  const e = o.eyes || 'dot';
  if (e === 'heart') { heart(g, hx + 12, hy, 15 + 2 * Math.sin(t * 12)); fs(g, HOT, '#FFFFFF', 3); }
  else if (e === 'happy') { g.strokeStyle = '#FFFFFF'; g.lineWidth = 5; g.beginPath(); g.arc(hx + 12, hy + 4, 10, 1.12 * Math.PI, 1.88 * Math.PI); g.stroke(); }
  else { circ(g, hx + 12, hy - 2, 12); fs(g, '#E8392F', null); circ(g, hx + 12, hy - 2, 6); fs(g, '#FFE38A', null); circ(g, hx + 13, hy - 2, 3.5); fs(g, '#1E1B22', null); }
  g.restore();
}

/* ---------- 手机 ---------- */
function phone(g, x, y, s, fn, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  rr(g, -190, -380, 380, 760, 56); fs(g, '#1E1B22', INK, 8);
  rr(g, -170, -356, 340, 712, 40); g.fillStyle = '#FFFFFF'; g.fill();
  g.save(); rr(g, -170, -356, 340, 712, 40); g.clip(); fn(g); g.restore();
  rr(g, -50, -350, 100, 22, 11); g.fillStyle = '#1E1B22'; g.fill();
  g.restore();
}

/* ---------- 布丁与仪表 ---------- */
function pudding(g, x, y, s, t) {
  g.save(); g.translate(x, y); g.scale(s, s);
  ell(g, 0, 10, 190, 40); fs(g, '#FFFFFF', INK, 6);
  const wob = Math.sin(t * 5) * 4;
  g.beginPath(); g.moveTo(-120, 0); g.lineTo(-90 - wob, -170); g.quadraticCurveTo(0, -190, 90 + wob, -170); g.lineTo(120, 0); g.quadraticCurveTo(0, 22, -120, 0); g.closePath(); fs(g, '#FFE08A', INK, 6);
  g.beginPath(); g.moveTo(-90 - wob, -170); g.quadraticCurveTo(0, -190, 90 + wob, -170); g.lineTo(96 + wob, -140); g.quadraticCurveTo(60, -120, 40, -146); g.quadraticCurveTo(10, -116, -20, -146); g.quadraticCurveTo(-60, -118, -96 - wob, -140); g.closePath(); fs(g, '#B5651D', INK, 5);
  g.fillStyle = 'rgba(255,255,255,.5)'; ell(g, -50, -90, 14, 40, .1); g.fill();
  g.restore();
}
function gauge(g, x, y, r, v, label, o = {}) {
  g.save(); g.translate(x, y);
  g.beginPath(); g.arc(0, 0, r, Math.PI, TAU); g.closePath(); fs(g, '#FFFFFF', INK, 6);
  const n = 5; for (let i = 0; i < n; i++) { g.beginPath(); g.arc(0, 0, r - 18, Math.PI + i / n * Math.PI, Math.PI + (i + 1) / n * Math.PI); g.strokeStyle = mix('#FFE6A8', '#FF6F91', i / (n - 1)); g.lineWidth = 22; g.stroke(); }
  const a = Math.PI + clamp(v) * Math.PI;
  g.strokeStyle = INK; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * (r - 30), Math.sin(a) * (r - 30)); g.stroke();
  circ(g, 0, 0, 14); fs(g, INK, null);
  text(g, '甜', r - 34, -18, 30, '#C2557A', 'black'); text(g, '淡', -r + 34, -18, 30, '#9A8F80', 'black');
  if (label) text(g, label, 0, 48, o.px || 40, INK, 'black');
  g.restore();
}

/* ---------- 食物图标 ---------- */
function honeyJar(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  rr(g, -58, -90, 116, 120, 30); fs(g, '#F5B731', INK, 6);
  rr(g, -46, -118, 92, 32, 8); fs(g, '#C98A55', INK, 6);
  g.fillStyle = 'rgba(255,255,255,.4)'; rr(g, -40, -70, 16, 70, 8); g.fill();
  g.beginPath(); g.moveTo(-58, -78); g.quadraticCurveTo(-30, -60, -20, -78); g.quadraticCurveTo(0, -52, 14, -78); g.quadraticCurveTo(36, -60, 58, -78); g.strokeStyle = '#D4901A'; g.lineWidth = 6; g.stroke();
  g.restore();
}
function meat(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-.5);
  rr(g, 20, -12, 90, 24, 12); fs(g, '#FFF8EA', INK, 6); circ(g, 112, -16, 14); fs(g, '#FFF8EA', INK, 6); circ(g, 112, 16, 14); fs(g, '#FFF8EA', INK, 6);
  ell(g, -20, 0, 70, 56); fs(g, '#C0563E', INK, 6); g.fillStyle = 'rgba(255,255,255,.3)'; ell(g, -36, -20, 20, 12, -.4); g.fill();
  g.restore();
}
function berries(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); for (const [a, b] of [[-26, 10], [24, 12], [0, -18], [-6, 30], [30, -14]]) berry(g, a, b, 24); g.restore(); }
function baobab(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(0, -60); g.lineTo(0, -90); g.stroke();
  ell(g, 0, 0, 52, 66); fs(g, '#9AA36A', INK, 6); g.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 12; i++) { circ(g, -30 + hash(i, 3) * 60, -40 + hash(i, 4) * 80, 3); g.fill(); }
  g.restore();
}
function tuber(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(.3);
  g.beginPath(); g.moveTo(-80, 0); g.quadraticCurveTo(-40, -50, 30, -36); g.quadraticCurveTo(90, -20, 84, 10); g.quadraticCurveTo(40, 50, -20, 30); g.quadraticCurveTo(-70, 20, -80, 0); g.closePath(); fs(g, '#9B5A6E', INK, 6);
  g.strokeStyle = 'rgba(40,20,20,.4)'; g.lineWidth = 4; for (const [a, b] of [[-30, -10], [10, 6], [40, -10]]) { g.beginPath(); g.moveTo(a, b); g.lineTo(a + 14, b + 4); g.stroke(); }
  g.restore();
}
function apple(g, x, y, s, col = '#E4473F') {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.moveTo(0, -48); g.bezierCurveTo(40, -78, 92, -40, 72, 20); g.bezierCurveTo(56, 70, 20, 70, 0, 58); g.bezierCurveTo(-20, 70, -56, 70, -72, 20); g.bezierCurveTo(-92, -40, -40, -78, 0, -48); g.closePath(); fs(g, col, INK, 6);
  g.strokeStyle = '#6B4A2E'; g.lineWidth = 8; g.beginPath(); g.moveTo(0, -48); g.lineTo(6, -82); g.stroke();
  ell(g, 30, -76, 24, 12, -.4); fs(g, '#6FA14E', INK, 5);
  g.fillStyle = 'rgba(255,255,255,.4)'; ell(g, -36, -16, 12, 22, .3); g.fill();
  g.restore();
}
function walnut(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  ell(g, 0, 0, 62, 70); fs(g, '#C9945A', INK, 6);
  g.strokeStyle = 'rgba(80,45,20,.6)'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, -70); g.quadraticCurveTo(-10, 0, 0, 70); g.stroke();
  for (const [a, b, c, d] of [[-40, -30, -20, -10], [-44, 20, -18, 30], [20, -36, 42, -20], [18, 14, 44, 30]]) { g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo((a + c) / 2, b - 14, c, d); g.stroke(); }
  g.restore();
}

/* ---------- 特效 ---------- */
function burst(g, cx, cy, t, c1, c2, n = 18, rot = 0) {
  g.save(); g.translate(cx, cy); g.rotate(rot + t * .4);
  g.fillStyle = c1; g.fillRect(-2000, -2000, 4000, 4000);
  g.fillStyle = c2; for (let i = 0; i < n; i++) { const a = i / n * TAU; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 2400, a, a + TAU / n / 2); g.closePath(); g.fill(); }
  g.restore();
}
function speedLines(g, cx, cy, t, a = 1, col = 'rgba(255,255,255,.8)') {
  g.save(); g.globalAlpha *= a; g.strokeStyle = col; g.lineCap = 'round';
  const k = Math.floor(t * 20);
  for (let i = 0; i < 46; i++) { const ang = hash(i, k) * TAU, r0 = 380 + hash(i, k + 1) * 300; g.lineWidth = 4 + hash(i, 5) * 8; g.beginPath(); g.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0); g.lineTo(cx + Math.cos(ang) * 1500, cy + Math.sin(ang) * 1500); g.stroke(); }
  g.restore();
}
function bolt(g, x0, y0, x1, y1, seed, a = 1) {
  const r = R(seed), n = 9, pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(x0, x1, u) + (i && i < n ? (r() - .5) * 140 : 0), lerp(y0, y1, u)]); }
  g.save(); g.globalAlpha *= a; g.lineJoin = 'miter'; g.lineCap = 'round';
  for (const [w, c] of [[60, 'rgba(255,240,150,.25)'], [30, 'rgba(255,240,150,.6)'], [16, '#FFF6C8'], [7, '#FFFFFF']]) {
    g.strokeStyle = c; g.lineWidth = w; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
  }
  g.restore();
}
function portal(g, x, y, r, t, a = 1) {
  if (r <= 1) return;
  g.save(); g.translate(x, y); g.globalAlpha *= a;
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, r * 1.4); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.3, 'rgba(170,110,255,.95)'); gr.addColorStop(.75, 'rgba(60,200,255,.7)'); gr.addColorStop(1, 'rgba(60,200,255,0)');
  g.fillStyle = gr; ell(g, 0, 0, r * 1.4, r * 1.4); g.fill();
  g.lineCap = 'round';
  for (let k = 0; k < 7; k++) {
    g.strokeStyle = k % 2 ? 'rgba(255,255,255,.85)' : 'rgba(120,60,220,.8)'; g.lineWidth = 6 + k;
    g.beginPath(); for (let a2 = 0; a2 < 4.2; a2 += .12) { const rr2 = r * (.15 + a2 / 4.2 * .9); const ang = a2 * 1.6 + t * 7 + k * TAU / 7; g.lineTo(Math.cos(ang) * rr2, Math.sin(ang) * rr2); } g.stroke();
  }
  g.restore();
}
function confetti(g, t, t0, cx, cy, n = 40, seed = 1) {
  if (t < t0 || t > t0 + 2.4) return;
  const u = t - t0;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (hash(i, seed) - .5) * 2.4, v = 600 + hash(i, seed + 1) * 900;
    const x = cx + Math.cos(a) * v * u, y = cy + Math.sin(a) * v * u + 900 * u * u;
    g.save(); g.translate(x, y); g.rotate(u * 8 + i); g.globalAlpha *= clamp(2.4 - u);
    g.fillStyle = [HOT, YEL, MINT, '#7FB2FF', '#FF9F43'][i % 5]; g.fillRect(-9, -5, 18, 10); g.restore();
  }
}
function snow(g, t, a = 1, n = 90) {
  g.save(); g.globalAlpha *= a; g.fillStyle = '#FFFFFF';
  for (let i = 0; i < n; i++) { const x = (hash(i, 1) * W + Math.sin(t * .8 + i) * 30) % W, y = (hash(i, 2) * H + t * (80 + hash(i, 3) * 80)) % H; circ(g, x, y, 3 + hash(i, 4) * 5); g.fill(); }
  g.restore();
}
/* 卡通触电：骷髅剪影 */
function skeleton(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s); g.lineCap = 'round';
  g.fillStyle = '#1B1630'; rr(g, -80, -190, 160, 200, [80, 80, 40, 40]); g.fill(); circ(g, 0, -246, 96); g.fill();
  g.strokeStyle = '#FFFFFF'; g.fillStyle = '#FFFFFF'; g.lineWidth = 12;
  circ(g, 0, -250, 54); g.fill(); g.fillStyle = '#1B1630'; circ(g, -20, -256, 14); g.fill(); circ(g, 20, -256, 14); g.fill(); rr(g, -16, -220, 32, 10, 3); g.fill();
  g.beginPath(); g.moveTo(0, -190); g.lineTo(0, -10); g.stroke();
  g.lineWidth = 8; for (let i = 0; i < 4; i++) { const yy = -160 + i * 28; g.beginPath(); g.moveTo(-50, yy + 10); g.quadraticCurveTo(0, yy - 10, 50, yy + 10); g.stroke(); }
  g.lineWidth = 10; g.beginPath(); g.moveTo(-50, -150); g.lineTo(-120, -260); g.moveTo(50, -150); g.lineTo(120, -260); g.moveTo(-26, 0); g.lineTo(-40, 100); g.moveTo(26, 0); g.lineTo(40, 100); g.stroke();
  g.restore();
}
/* 一次性的烟雾“噗” */
function puff(g, x, y, t, t0, s = 1) {
  if (t < t0 || t > t0 + .9) return;
  const u = (t - t0) / .9;
  g.save(); g.globalAlpha *= 1 - u;
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, d = 60 + u * 170; circ(g, x + Math.cos(a) * d * s, y + Math.sin(a) * d * s * .7, (70 - u * 30) * s); fs(g, '#FFFFFF', 'rgba(42,35,48,.35)', 4); }
  g.restore();
}
