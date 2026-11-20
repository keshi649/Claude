'use strict';
/* 方向 8：黏土定格动画。人物、字、房子都是橡皮泥捏的（有指纹、有压痕、反一点蜡光），雪是棉花和面粉，
   树是瓶刷树，背景是一块深蓝色的毛毡，星星和云是用线吊着的——镜头里故意留着线和胶带，像真的定格动画片场。 */
NEED += '过条街最好又给我下起雪我承认我是爱情里的废柴周杰伦《》甜菜面包玩具';
const CW = 1920, CH = 1080;
function ccv(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c.getContext('2d'); }
/* 一块黏土：fn(c) 在 c 上把形状填满（任何颜色）；box [x,y,w,h] 大概范围；col 黏土颜色。
   做法：形状当蒙版 → 底色 → 内斜面（左上亮、右下暗）→ 体积渐变 → 指纹、颗粒 → 蜡光 → 带投影贴回去 */
function clay(g, box, fn, col, o = {}) {
  const pad = 40, [bx, by, bw, bh] = box, W = bw + pad * 2, H = bh + pad * 2, d = o.bevel ?? Math.max(3, Math.min(bw, bh) * .08);
  const m = ccv(W, H); m.translate(pad - bx, pad - by); fn(m); m.setTransform(1, 0, 0, 1, 0, 0);
  const s = ccv(W, H); s.drawImage(m.canvas, 0, 0); s.globalCompositeOperation = 'source-in'; s.fillStyle = col; s.fillRect(0, 0, W, H); s.globalCompositeOperation = 'source-atop';
  // 内斜面：把"形状外面"往右下挪一点涂亮（左上边亮），往左上挪一点涂暗（右下边暗）
  const inv = ccv(W, H); inv.fillStyle = '#000'; inv.fillRect(0, 0, W, H); inv.globalCompositeOperation = 'destination-out'; inv.drawImage(m.canvas, 0, 0);
  const tint = (c, k) => { const t = ccv(W, H); t.drawImage(inv.canvas, 0, 0); t.globalCompositeOperation = 'source-in'; t.fillStyle = c; t.fillRect(0, 0, W, H); return t.canvas; };
  s.save(); s.filter = `blur(${d * .9}px)`; s.globalAlpha = o.hiA ?? .55; s.drawImage(tint(lt(col, .55)), d * .9, d * .9); s.globalAlpha = o.shA ?? .7; s.drawImage(tint(dk(col, .5)), -d, -d); s.restore();
  s.save(); s.filter = `blur(${d * .35}px)`; s.globalAlpha = .45; s.drawImage(tint(dk(col, .55)), -d * .3, -d * .3); s.restore();
  const vg = s.createRadialGradient(pad + bw * .32, pad + bh * .28, Math.min(bw, bh) * .05, pad + bw * .5, pad + bh * .55, Math.max(bw, bh) * .75); vg.addColorStop(0, 'rgba(255,250,240,.22)'); vg.addColorStop(.6, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(20,10,30,.3)'); s.fillStyle = vg; s.fillRect(0, 0, W, H);
  // 指纹、压痕、颗粒
  const r = rng(o.seed ?? Math.round(bx * 7 + by * 13 + bw));
  if (o.prints !== false) { s.lineWidth = Math.max(.8, Math.min(bw, bh) * .006); for (let k = 0; k < (o.prints ?? 2); k++) { const cx = pad + r() * bw, cy = pad + r() * bh, R0 = (o.printR ? o.printR * (.7 + r() * .6) : Math.min(bw, bh) * (.12 + r() * .14)), a0 = r() * 6.28; for (let i = 0; i < 9; i++) { s.strokeStyle = i % 2 ? `rgba(255,255,255,${.07 * (o.printA ?? 1)})` : `rgba(0,0,0,${.08 * (o.printA ?? 1)})`; s.beginPath(); s.ellipse(cx, cy, R0 * (.2 + i * .1), R0 * (.14 + i * .075), a0, r() * 2, r() * 2 + 4); s.stroke(); } } }
  for (let i = 0; i < bw * bh / 260; i++) { s.fillStyle = r() < .5 ? 'rgba(0,0,0,.07)' : 'rgba(255,255,255,.08)'; s.fillRect(pad + r() * bw, pad + r() * bh, 1.6, 1.6); }
  if (o.marks) o.marks(s, pad - bx, pad - by, r);
  // 蜡光
  if (o.spec !== false) { s.save(); s.filter = `blur(${Math.min(bw, bh) * .05}px)`; s.fillStyle = 'rgba(255,255,255,.32)'; s.beginPath(); s.ellipse(pad + bw * (o.sx ?? .3), pad + bh * (o.sy ?? .22), bw * .14, bh * .07, -.5, 0, 7); s.fill(); s.restore(); }
  // 投影、贴回去
  if (o.shadow !== false) { g.save(); g.filter = `blur(${o.sb ?? 10}px)`; g.globalAlpha = o.sa ?? .5; const sh = ccv(W, H); sh.drawImage(m.canvas, 0, 0); sh.globalCompositeOperation = 'source-in'; sh.fillStyle = '#0A0618'; sh.fillRect(0, 0, W, H); g.drawImage(sh.canvas, bx - pad + (o.sdx ?? 8), by - pad + (o.sdy ?? 12)); g.restore(); }
  g.drawImage(s.canvas, bx - pad, by - pad);
}
/* 小工具：画路径 */
const P = {
  rr: (x, y, w, h, r) => c => { c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); },
  el: (x, y, rx, ry, a = 0) => c => { c.beginPath(); c.ellipse(x, y, rx, ry, a, 0, 7); c.fill(); },
  cap: (x0, y0, x1, y1, w) => c => { c.lineCap = 'round'; c.lineWidth = w; c.strokeStyle = '#000'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); },
  poly: pts => c => { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fill(); },
};
function groove(s, ox, oy, pts, w = 3, a = .5) { s.save(); s.translate(ox, oy); s.lineCap = 'round'; s.lineJoin = 'round'; s.strokeStyle = `rgba(0,0,0,${a})`; s.lineWidth = w; s.beginPath(); pts.forEach((p, i) => i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])); s.stroke(); s.strokeStyle = `rgba(255,255,255,${a * .5})`; s.lineWidth = w * .6; s.translate(w * .5, w * .5); s.beginPath(); pts.forEach((p, i) => i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])); s.stroke(); s.restore(); }
/* 黑色小珠子眼睛 */
function bead(g, x, y, rx, ry, o = {}) { g.save(); g.fillStyle = 'rgba(0,0,0,.35)'; g.filter = 'blur(2px)'; g.beginPath(); g.ellipse(x + 2, y + 3, rx, ry, 0, 0, 7); g.fill(); g.restore(); const gr = g.createRadialGradient(x - rx * .3, y - ry * .3, 1, x, y, Math.max(rx, ry)); gr.addColorStop(0, '#3A3040'); gr.addColorStop(1, '#0A0610'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.ellipse(x - rx * .3, y - ry * .35, rx * .32, ry * .26, -.3, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(x + rx * .35, y + ry * .35, rx * .13, 0, 7); g.fill(); }

/* ---------- 黏土小人 ----------
   x, fy 脚底；H 身高。o：girl、eyes 'n'|'shut'|'happy'|'sad'、mouth 'smile'|'o'|'flat'|'frown'、arms 'down'|'up'|'wave'、tear、step、melt（0~1 塌下去）、squash */
function clayKid(g, x, fy, H, o = {}) {
  const u = H / 30, girl = o.girl, melt = o.melt || 0;
  const SKIN = '#F4CDB2', HAIR = girl ? '#7A4A36' : '#3A2630', COAT = girl ? '#B7A6F0' : '#E39A34', PANTS = girl ? '#5A4A7A' : '#2E3A5E', SCARF = girl ? '#F4F0EA' : '#D8323C', SHOE = '#4A2A1E';
  const sq = 1 - melt * .55, wide = 1 + melt * .6, base = fy, bodyTop = fy - 16 * u * sq, hcx = x, hcy = bodyTop - 7 * u * sq + melt * 2 * u, hr = 7.6 * u;
  // 地上的影子
  g.save(); g.fillStyle = 'rgba(10,8,30,.45)'; g.filter = `blur(${u * 1.2}px)`; g.beginPath(); g.ellipse(x + u, fy + u * .4, 9 * u * wide, 2.2 * u, 0, 0, 7); g.fill(); g.restore();
  // 腿、鞋
  if (melt < .5) { const st = o.step || 0; [[-1, st === 1 ? -u : 0], [1, st === 2 ? -u : 0]].forEach(([sd, lift]) => { clay(g, [x + sd * 2.6 * u - 2 * u, fy - 7 * u, 4 * u, 6.5 * u], P.rr(x + sd * 2.6 * u - 2 * u, fy - 7 * u + lift, 4 * u, 6 * u, 1.6 * u), PANTS, { shadow: false, prints: 0 }); clay(g, [x + sd * 2.8 * u - 3 * u, fy - 2.8 * u, 6 * u, 3 * u], P.el(x + sd * 2.9 * u, fy - 1.4 * u + lift, 3 * u, 1.6 * u), SHOE, { sb: 4, sa: .4, prints: 0 }); }); }
  // 身子（大衣）
  const bw0 = 11 * u * wide, bw1 = 14 * u * wide, bt = bodyTop, bb = fy - (melt < .5 ? 5 * u : 0);
  clay(g, [x - bw1 / 2, bt, bw1, bb - bt], c => { c.beginPath(); c.moveTo(x - bw0 / 2, bt + 1.5 * u); c.quadraticCurveTo(x, bt - u, x + bw0 / 2, bt + 1.5 * u); c.lineTo(x + bw1 / 2, bb - u); c.quadraticCurveTo(x, bb + u, x - bw1 / 2, bb - u); c.closePath(); c.fill(); }, COAT, { prints: 2, marks: (s, ox, oy) => { groove(s, ox, oy, [[x, bt + 3 * u], [x, bb - u]], u * .45, .35); [bt + 5 * u, bt + 8.5 * u].forEach(yy => { if (yy < bb - u) { s.save(); s.translate(ox, oy); s.fillStyle = dk(COAT, .25); s.beginPath(); s.arc(x + 1.4 * u, yy, u * .7, 0, 7); s.fill(); s.fillStyle = lt(COAT, .3); s.beginPath(); s.arc(x + 1.2 * u, yy - .2 * u, u * .35, 0, 7); s.fill(); s.restore(); } }); } });
  // 胳膊、手
  const arm = o.arms || 'down', handC = girl ? '#C42A36' : SKIN;
  const A = arm === 'up' ? [[-1, -4, -9], [1, 4, -9]] : arm === 'wave' ? [[-1, -8.5, 6], [1, 9, -5]] : [[-1, -8, 6.5], [1, 8, 6.5]];
  A.forEach(([sd, ex, ey]) => { const sx = x + sd * bw0 / 2, sy = bt + 3 * u, hx = x + ex * u * wide, hy = bt + 3 * u + ey * u * sq; clay(g, [Math.min(sx, hx) - 2.4 * u, Math.min(sy, hy) - 2.4 * u, Math.abs(hx - sx) + 4.8 * u, Math.abs(hy - sy) + 4.8 * u], P.cap(sx, sy, hx, hy, 3.6 * u), COAT, { sb: 6, sa: .35, prints: 0 }); clay(g, [hx - 2 * u, hy - 2 * u, 4 * u, 4 * u], P.el(hx, hy, 1.9 * u, 1.9 * u), handC, { sb: 5, sa: .35, prints: 0 }); });
  // 围巾
  clay(g, [x - 7.6 * u * wide, bt - 1.8 * u, 15.2 * u * wide, 4.2 * u], P.rr(x - 7.6 * u * wide, bt - 1.8 * u, 15.2 * u * wide, 4.2 * u, 2 * u), SCARF, { prints: 1, marks: (s, ox, oy) => { for (let i = -5; i <= 5; i++) groove(s, ox, oy, [[x + i * 1.3 * u * wide, bt - 1.2 * u], [x + i * 1.3 * u * wide + .5 * u, bt + 1.8 * u]], u * .25, .22); } });
  if (melt < .5) clay(g, [x + 1.5 * u, bt + 1 * u, 3.6 * u, (o.wind ? 5 : 8) * u], P.rr(x + 1.5 * u, bt + 1 * u, 3.4 * u, 7.5 * u, 1.2 * u), SCARF, { sb: 6, sa: .4, prints: 0, marks: (s, ox, oy) => { for (let i = 0; i < 4; i++) groove(s, ox, oy, [[x + 2.2 * u + i * .8 * u, bt + 7.4 * u], [x + 2.2 * u + i * .8 * u, bt + 8.8 * u]], u * .25, .3); } });
  // 头发（后面那块，女孩的短发）
  if (girl) clay(g, [hcx - hr * 1.18, hcy - hr * .3, hr * 2.36, hr * 1.55], P.rr(hcx - hr * 1.12, hcy - hr * .3, hr * 2.24, hr * 1.5, hr * .6), HAIR, { prints: 0, sb: 6 });
  // 头
  clay(g, [hcx - hr, hcy - hr * .95, hr * 2, hr * 1.9], P.el(hcx, hcy, hr, hr * .94), SKIN, { prints: 2, sx: .28, sy: .3, bevel: hr * .18 });
  // 刘海、头顶
  if (!girl) {
    clay(g, [hcx - hr * 1.08, hcy - hr * 1.12, hr * 2.16, hr * 1.05], c => { c.beginPath(); c.moveTo(hcx - hr * 1.04, hcy + hr * .05); c.bezierCurveTo(hcx - hr * 1.15, hcy - hr * 1.2, hcx + hr * 1.15, hcy - hr * 1.2, hcx + hr * 1.04, hcy + hr * .05); for (let i = 5; i >= 0; i--) { const xx = hcx - hr * 1.04 + i * hr * .416; c.quadraticCurveTo(xx + hr * .2, hcy - hr * (i % 2 ? .15 : .42), xx, hcy - hr * .3 + (i === 0 || i === 5 ? hr * .3 : 0)); } c.closePath(); c.fill(); }, HAIR, { prints: 0, marks: (s, ox, oy) => { for (let i = 0; i < 7; i++) groove(s, ox, oy, [[hcx - hr * .8 + i * hr * .27, hcy - hr * .85], [hcx - hr * .7 + i * hr * .27, hcy - hr * .4]], u * .3, .3); } });
    clay(g, [hcx - hr * .2, hcy - hr * 1.62, hr * .9, hr * .72], c => { c.lineCap = 'round'; c.lineWidth = hr * .2; c.strokeStyle = '#000'; c.beginPath(); c.moveTo(hcx, hcy - hr * .95); c.bezierCurveTo(hcx - hr * .1, hcy - hr * 1.6, hcx + hr * .7, hcy - hr * 1.65, hcx + hr * .55, hcy - hr * 1.25); c.stroke(); }, HAIR, { prints: 0, sb: 4, sa: .3 });
  } else {
    // 毛线帽：帽身 + 翻边 + 绒球
    clay(g, [hcx - hr * 1.15, hcy - hr * 1.45, hr * 2.3, hr * 1.15], c => { c.beginPath(); c.moveTo(hcx - hr * 1.1, hcy - hr * .3); c.bezierCurveTo(hcx - hr * 1.15, hcy - hr * 1.6, hcx + hr * 1.15, hcy - hr * 1.6, hcx + hr * 1.1, hcy - hr * .3); c.closePath(); c.fill(); }, '#F6F3EE', { prints: 0, marks: (s, ox, oy) => { for (let i = -4; i <= 4; i++) groove(s, ox, oy, [[hcx + i * hr * .24, hcy - hr * .4], [hcx + i * hr * .2, hcy - hr * 1.15]], u * .35, .18); } });
    clay(g, [hcx - hr * 1.2, hcy - hr * .58, hr * 2.4, hr * .5], P.rr(hcx - hr * 1.2, hcy - hr * .58, hr * 2.4, hr * .48, hr * .24), '#EDE8E2', { prints: 0, marks: (s, ox, oy) => { for (let i = -9; i <= 9; i++) groove(s, ox, oy, [[hcx + i * hr * .12, hcy - hr * .52], [hcx + i * hr * .12, hcy - hr * .16]], u * .22, .2); } });
    pom(g, hcx, hcy - hr * 1.48, hr * .38);
  }
  if (o.back) { clay(g, [hcx - hr * 1.12, hcy - hr * .5, hr * 2.24, hr * 1.5], P.el(hcx, hcy + hr * .12, hr * 1.06, hr * .86), HAIR, { prints: 0, sb: 4, marks: (s2, ox, oy) => { for (let i = -3; i <= 3; i++) groove(s2, ox, oy, [[hcx + i * hr * .25, hcy - hr * .3], [hcx + i * hr * .3, hcy + hr * .8]], u * .35, .22); } }); if (girl) { clay(g, [hcx - hr * 1.2, hcy - hr * .58, hr * 2.4, hr * .5], P.rr(hcx - hr * 1.2, hcy - hr * .58, hr * 2.4, hr * .48, hr * .24), '#EDE8E2', { prints: 0 }); pom(g, hcx, hcy - hr * 1.48, hr * .38); } return { hcx, hcy, hr, u }; }
  // 脸
  const em = o.eyes || 'n', ey = hcy + hr * .12, ex = hr * .4;
  [-1, 1].forEach(sd => { const X = hcx + sd * ex;
    if (em === 'shut' || em === 'sad') { g.save(); g.strokeStyle = '#1A0E14'; g.lineCap = 'round'; g.lineWidth = u * .75; g.beginPath(); g.arc(X, ey - u * .4, hr * .15, .15 * Math.PI, .85 * Math.PI); g.stroke(); g.restore(); if (em === 'sad') { g.save(); g.strokeStyle = HAIR; g.lineCap = 'round'; g.lineWidth = u * .7; g.beginPath(); g.moveTo(X - sd * hr * .2, ey - hr * .4); g.lineTo(X + sd * hr * .1, ey - hr * .3); g.stroke(); g.restore(); } }
    else if (em === 'happy') { g.save(); g.strokeStyle = '#1A0E14'; g.lineCap = 'round'; g.lineWidth = u * .75; g.beginPath(); g.arc(X, ey + u * .5, hr * .15, 1.15 * Math.PI, 1.85 * Math.PI); g.stroke(); g.restore(); }
    else bead(g, X, ey, hr * .13, hr * .17);
    clay(g, [hcx + sd * hr * .68 - hr * .2, ey + hr * .2, hr * .4, hr * .24], P.el(hcx + sd * hr * .68, ey + hr * .32, hr * .19, hr * .11), '#F59AA0', { shadow: false, prints: 0, spec: false, bevel: 2 });
  });
  g.save(); g.strokeStyle = '#7A2A34'; g.fillStyle = '#7A2A34'; g.lineCap = 'round'; g.lineWidth = u * .6; const my = ey + hr * .48, mm = o.mouth || 'smile'; g.beginPath(); if (mm === 'smile') { g.arc(hcx, my - hr * .1, hr * .14, .2 * Math.PI, .8 * Math.PI); g.stroke(); } else if (mm === 'o') { g.ellipse(hcx, my, hr * .09, hr * .12, 0, 0, 7); g.fill(); } else if (mm === 'frown') { g.arc(hcx, my + hr * .12, hr * .13, 1.2 * Math.PI, 1.8 * Math.PI); g.stroke(); } else { g.moveTo(hcx - hr * .08, my); g.lineTo(hcx + hr * .08, my); g.stroke(); } g.restore();
  if (o.tear) [-1, 1].forEach(sd => { const X = hcx + sd * ex + sd * hr * .05, Y = ey + hr * .12; g.save(); g.fillStyle = 'rgba(150,215,255,.9)'; g.beginPath(); g.moveTo(X, Y); g.quadraticCurveTo(X + sd * hr * .12, Y + hr * .4 * o.tear, X, Y + hr * .55 * o.tear); g.quadraticCurveTo(X - sd * hr * .1, Y + hr * .4 * o.tear, X, Y); g.fill(); g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.ellipse(X - sd * hr * .02, Y + hr * .3 * o.tear, hr * .03, hr * .06, 0, 0, 7); g.fill(); g.restore(); });
  return { hcx, hcy, hr, u };
}
/* 绒球 */
function pom(g, x, y, r) { g.save(); g.fillStyle = 'rgba(10,8,30,.35)'; g.filter = `blur(${r * .3}px)`; g.beginPath(); g.arc(x + r * .2, y + r * .3, r, 0, 7); g.fill(); g.restore(); const rr = rng(Math.round(x + y)); for (let i = 0; i < r * 30; i++) { const a = rr() * 6.283, d = Math.sqrt(rr()) * r, sh = .5 + .5 * Math.cos(a + 2.4) * d / r; g.fillStyle = `rgba(${Math.round(232 + 23 * sh)},${Math.round(150 + 60 * sh)},${Math.round(170 + 50 * sh)},.9)`; g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * .1 + rr() * r * .06, 0, 7); g.fill(); } }
/* 毛毡背景 */
function felt(g, w, h, col) { g.fillStyle = col; g.fillRect(0, 0, w, h); const r = rng(5); g.lineWidth = 1; for (let i = 0; i < w * h / 70; i++) { const x = r() * w, y = r() * h, a = r() * 6.283, l = 3 + r() * 6; g.strokeStyle = r() < .5 ? `rgba(255,255,255,${.03 + r() * .05})` : `rgba(0,0,0,${.05 + r() * .06})`; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } }
/* 瓶刷树 */
function bottleTree(g, x, base, h, col = '#2E7A52', snow = .6) { const r = rng(Math.round(x * 3 + h)); g.save(); g.fillStyle = 'rgba(10,8,30,.4)'; g.filter = 'blur(8px)'; g.beginPath(); g.ellipse(x + 8, base, h * .28, h * .05, 0, 0, 7); g.fill(); g.restore(); g.fillStyle = '#8A6A44'; g.fillRect(x - h * .03, base - h * .12, h * .06, h * .12); g.fillStyle = '#C8A070'; g.fillRect(x - h * .07, base - h * .02, h * .14, h * .04); g.lineCap = 'round'; for (let i = 0; i < h * 11; i++) { const t = Math.pow(r(), .85), y = base - h * .1 - t * h * .88, wmax = h * .33 * (1 - t) + h * .02, a = r() * Math.PI, len = wmax * (.4 + r() * .6), xe = x + Math.cos(a) * len * (r() < .5 ? 1 : -1), ye = y + (r() - .45) * h * .04, shade = (xe - x) / (wmax + 1); g.strokeStyle = r() < snow * (1 - t * .3) * .45 ? `rgba(245,248,255,${.6 + r() * .4})` : mix(col, shade > 0 ? '#0E2A1C' : '#5AAA7A', Math.abs(shade) * .5 + r() * .15); g.lineWidth = .9 + r() * .9; g.beginPath(); g.moveTo(x, y); g.lineTo(xe, ye); g.stroke(); } }
/* 棉花雪地：一层起伏的白黏土 */
function cottonGround(g, y0, o = {}) { clay(g, [-60, y0 - 50, CW + 120, CH - y0 + 110], c => { c.beginPath(); c.moveTo(-60, CH + 60); c.lineTo(-60, y0); for (let x = -60; x <= CW + 60; x += 30) c.lineTo(x, y0 + Math.sin(x / 190 + (o.ph || 0)) * 16 + Math.sin(x / 63) * 6); c.lineTo(CW + 60, CH + 60); c.closePath(); c.fill(); }, o.col || '#EEF1F8', { prints: 5, printR: 26, printA: .6, bevel: 14, spec: false, shadow: false, marks: (s, ox, oy, r) => { for (let i = 0; i < 160; i++) { s.save(); s.translate(ox, oy); s.fillStyle = 'rgba(160,170,210,.18)'; s.beginPath(); s.ellipse(r() * CW, y0 + 20 + r() * (CH - y0), 8 + r() * 24, 3 + r() * 6, 0, 0, 7); s.fill(); s.restore(); } } }); }
/* 吊着的东西：线 + 顶上一小块胶带 */
function hangThread(g, x, y0, y1) { g.save(); g.strokeStyle = 'rgba(235,235,245,.5)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); g.fillStyle = 'rgba(240,230,190,.7)'; g.fillRect(x - 14, y0 - 6, 28, 12); g.restore(); }
function feltStar(g, x, y, r, col = '#F4C64A') { g.save(); g.fillStyle = 'rgba(0,0,0,.35)'; g.filter = 'blur(4px)'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; g.lineTo(x + 4 + Math.cos(a) * rr, y + 6 + Math.sin(a) * rr); } g.fill(); g.restore(); g.fillStyle = col; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); g.strokeStyle = 'rgba(120,70,20,.6)'; g.setLineDash([4, 4]); g.lineWidth = 1.5; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = (i % 2 ? r * .45 : r) * .8; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.stroke(); g.setLineDash([]); }
/* 黏土房子 */
function clayHouse(g, x, base, w, h, col, roof, o = {}) {
  clay(g, [x, base - h, w, h], P.rr(x, base - h, w, h, 8), col, { prints: 1, marks: (s, ox, oy) => { s.save(); s.translate(ox, oy); (o.wins || [[.2, .25], [.6, .25]]).forEach(([wx, wy]) => { const X = x + wx * w, Y = base - h + wy * h, ww = w * .22, wh = h * .26; s.fillStyle = '#3A2414'; s.beginPath(); s.roundRect(X - 3, Y - 3, ww + 6, wh + 6, 5); s.fill(); const gr = s.createRadialGradient(X + ww / 2, Y + wh / 2, 2, X + ww / 2, Y + wh / 2, ww); gr.addColorStop(0, '#FFF4C0'); gr.addColorStop(1, '#FFB04A'); s.fillStyle = gr; s.beginPath(); s.roundRect(X, Y, ww, wh, 4); s.fill(); s.fillStyle = '#3A2414'; s.fillRect(X + ww / 2 - 2, Y, 4, wh); s.fillRect(X, Y + wh / 2 - 2, ww, 4); }); if (o.door) { s.fillStyle = dk(col, .45); s.beginPath(); s.roundRect(x + w * .38, base - h * .38, w * .24, h * .38, [w * .12, w * .12, 0, 0]); s.fill(); } s.restore(); } });
  clay(g, [x - w * .1, base - h - h * .5, w * 1.2, h * .56], P.poly([[x - w * .1, base - h + 4], [x + w * .5, base - h - h * .48], [x + w * 1.1, base - h + 4]]), roof, { prints: 1 });
  clay(g, [x - w * .12, base - h - h * .52, w * 1.24, h * .3], c => { c.beginPath(); c.moveTo(x - w * .12, base - h + 4); c.lineTo(x + w * .5, base - h - h * .5); c.lineTo(x + w * 1.12, base - h + 4); c.quadraticCurveTo(x + w * .9, base - h - h * .05, x + w * .5, base - h - h * .3); c.quadraticCurveTo(x + w * .1, base - h - h * .05, x - w * .12, base - h + 4); c.fill(); }, '#F6F6FA', { prints: 0, sb: 5 });
  if (o.glowG) { o.glowG.push([x + w * .5, base - h * .55, w * .9]); }
}
/* 黏土字：圆体，白边，"捏"出来的 */
function clayText(g, s, x, y, size, col, o = {}) {
  const font = `${size}px "ZCOOL KuaiLe"`; const t = ccv(10, 10); t.font = font; const w = t.measureText(s).width;
  const shape = c => { c.font = font; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = size * (o.fat ?? .03); c.strokeStyle = '#000'; c.strokeText(s, x, y); c.fillText(s, x, y); };
  if (o.rim !== false) { g.save(); g.translate(0, 0); g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.strokeStyle = o.rimCol || 'rgba(40,24,40,.85)'; g.lineWidth = size * (o.rimW ?? .09); g.strokeText(s, x + size * .02, y + size * .03); g.restore(); }
  clay(g, [x - w / 2 - 10, y - size * .62, w + 20, size * 1.25], shape, col, { prints: o.prints ?? 1, printR: size * .18, printA: .7, bevel: size * (o.bev ?? .03), sb: o.sb ?? 8, sa: o.sa ?? .55, sdx: 5, sdy: 7, hiA: .7, shA: .75 });
}
function bokehLights(g, n, seed, area, cols = BULBS) { const r = rng(seed); g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < n; i++) { const x = area[0] + r() * area[2], y = area[1] + r() * area[3], rad = 14 + r() * 34, c = cols[i % cols.length], A = h2(c); const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(${A},.45)`); gr.addColorStop(.75, `rgba(${A},.3)`); gr.addColorStop(1, `rgba(${A},0)`); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill(); } g.restore(); }
function lightString(g, x0, y0, x1, y1, sag, n) { g.save(); g.strokeStyle = '#1A3A2A'; g.lineWidth = 3; g.beginPath(); for (let i = 0; i <= 40; i++) { const t = i / 40, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + sag * 4 * t * (1 - t); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); for (let i = 1; i < n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + sag * 4 * t * (1 - t) + 8, c = BULBS[i % 5]; g.fillStyle = c; g.beginPath(); g.ellipse(x, y, 6, 9, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(x - 2, y - 3, 2, 3, 0, 0, 7); g.fill(); g.save(); g.globalCompositeOperation = 'lighter'; const A = h2(c), gr = g.createRadialGradient(x, y, 0, x, y, 40); gr.addColorStop(0, `rgba(${A},.55)`); gr.addColorStop(1, `rgba(${A},0)`); g.fillStyle = gr; g.fillRect(x - 40, y - 40, 80, 80); g.restore(); } g.restore(); }
function warmGlow(g, x, y, r, a = .5, c = '255,170,80') { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${c},${a})`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); g.restore(); }
function finish8(g, o = {}) { const v = g.createRadialGradient(CW / 2, CH / 2, CH * .4, CW / 2, CH / 2, CH * 1.05); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(6,4,20,${o.vig ?? .55})`); g.fillStyle = v; g.fillRect(0, 0, CW, CH); }
function blurLayer(main, fn, b) { const c = ccv(CW, CH); fn(c); main.save(); main.filter = `blur(${b}px)`; main.drawImage(c.canvas, 0, 0); main.restore(); }
function mark8(g) { clayText(g, '甜菜', 1826, 62, 50, '#F4F0EA', { sb: 4, sa: .5 }); }
function flourSnow(g, seed, n, o = {}) { const r = rng(seed); g.save(); for (let i = 0; i < n; i++) { const x = r() * CW, y = r() * (o.h || CH), s = 2 + r() * (o.s || 5); g.fillStyle = `rgba(250,250,255,${.5 + r() * .5})`; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); g.fillStyle = 'rgba(120,130,170,.3)'; g.beginPath(); g.arc(x + s * .3, y + s * .3, s * .6, 0, 7); g.fill(); } g.restore(); }

/* ============ 8a：开头。毛毡夜空下，"爱情废柴"四个黏土大字立在棉花雪地上，他坐在"柴"字上晃腿 ============ */
FRAMES['8a'] = async (main) => {
  felt(main, CW, CH, '#1E2652');
  const sg2 = main.createLinearGradient(0, 0, 0, CH); sg2.addColorStop(0, 'rgba(10,12,40,.5)'); sg2.addColorStop(1, 'rgba(60,50,110,.2)'); main.fillStyle = sg2; main.fillRect(0, 0, CW, CH);
  // 吊着的毛毡星星、黏土月亮
  [[260, 150, 34], [520, 90, 22], [1420, 120, 28], [1700, 210, 20], [880, 60, 18], [1150, 170, 16]].forEach(([x, y, r]) => { hangThread(main, x, 0, y - r); feltStar(main, x, y, r); });
  hangThread(main, 1640, 0, 330); clay(main, [1560, 330, 160, 160], P.el(1640, 410, 78, 78), '#F6EDC8', { prints: 3, marks: (s, ox, oy) => { s.save(); s.translate(ox, oy); [[1610, 390, 14], [1668, 436, 10], [1650, 380, 7]].forEach(([x, y, r]) => { s.fillStyle = 'rgba(150,120,60,.25)'; s.beginPath(); s.arc(x, y, r, 0, 7); s.fill(); }); s.restore(); } });
  warmGlow(main, 1640, 410, 260, .25, '255,240,180');
  // 远处：几座黏土房子、瓶刷树（虚化）
  blurLayer(main, c => { cottonGround(c, 560, { col: '#C8D0E8', ph: 2 }); [[120, 560, 140, 110, '#B5654A', '#6A2E3A'], [300, 562, 110, 130, '#4E7A8C', '#2E3E5A'], [1460, 560, 130, 120, '#C89858', '#6A3A2A'], [1620, 562, 120, 100, '#A84A5A', '#4A2A3A']].forEach(a => clayHouse(c, ...a)); [470, 1360, 1800, 60].forEach((x, i) => bottleTree(c, x, 566, 130 + i * 20)); lightString(c, 100, 470, 1800, 450, 60, 34); }, 5);
  bokehLights(main, 26, 4, [0, 380, CW, 220]);
  cottonGround(main, 760);
  // 大字
  const LET = [['爱', '#F4EEE2', 0], ['情', '#F4EEE2', 0], ['废', '#E8503A', 0], ['柴', '#E8503A', 1]];
  LET.forEach(([ch, col, crack], i) => { const x = 470 + i * 330, y = 600 + (i === 3 ? 18 : 0); clayText(main, ch, x, y, 300, col, { fat: .05, bev: .028, prints: 3, sb: 18, sa: .55, rimW: .06 }); });
  // "柴"缺了一角，掉在地上的一小块
  clay(main, [1420, 740, 70, 50], P.poly([[1424, 760], [1478, 744], [1486, 784], [1430, 788]]), '#E8503A', { prints: 0, sb: 6 });
  // 他坐在"柴"字顶上
  clayKid(main, 1440, 500, 230, { eyes: 'n', mouth: 'flat', arms: 'down', step: 1 });
  // 左边"爱"字上落着一只小红手套（伏笔）
  clay(main, [420, 410, 70, 70], P.el(452, 446, 26, 30, .3), '#C42A36', { prints: 0, sb: 6, marks: (s, ox, oy) => { s.save(); s.translate(ox, oy); s.fillStyle = '#F6F3EE'; s.fillRect(428, 466, 50, 12); s.restore(); } });
  // 前景：虚掉的瓶刷树和面粉雪
  blurLayer(main, c => { bottleTree(c, 120, 1120, 520, '#2A6A48', .8); bottleTree(c, 1860, 1150, 460, '#245E40', .8); }, 9);
  flourSnow(main, 3, 120, { s: 4 });
  finish8(main);
  clayText(main, '周杰伦《爱情废柴》', 330, 1010, 56, '#F6E8C8', { sb: 6 });
  mark8(main);
};

/* ============ 8b：主歌"过条街 最好又给我下起雪"。一朵棉花云用线吊在他头顶，只往他身上下雪；背后的情侣举着插在铁丝上的小红心 ============ */
FRAMES['8b'] = async (main) => {
  felt(main, CW, CH, '#2A2A5E');
  [[200, 110, 24], [640, 80, 18], [1260, 70, 22], [1680, 120, 26]].forEach(([x, y, r]) => { hangThread(main, x, 0, y - r); feltStar(main, x, y, r); });
  // 背景：一条街的黏土房子（虚）
  blurLayer(main, c => { cottonGround(c, 600, { col: '#CDD3EA' }); [[40, 600, 200, 240, '#B5654A', '#6A2E3A', { wins: [[.15, .2], [.6, .2], [.15, .6], [.6, .6]], door: 1 }], [270, 600, 180, 300, '#4E7A8C', '#2E3E5A', { wins: [[.2, .15], [.58, .15], [.2, .45], [.58, .45]], door: 1 }], [480, 600, 210, 220, '#C89858', '#6A3A2A', { wins: [[.15, .25], [.62, .25]], door: 1 }], [1180, 600, 200, 260, '#A84A5A', '#4A2A3A', { wins: [[.15, .2], [.6, .2], [.15, .55], [.6, .55]], door: 1 }], [1410, 600, 180, 230, '#7A5A8C', '#3A2A4E', { wins: [[.2, .22], [.58, .22]], door: 1 }], [1620, 600, 240, 290, '#4E7A8C', '#2E3E5A', { wins: [[.15, .2], [.6, .2], [.15, .55], [.6, .55]], door: 1 }]].forEach(([x, b, w, h, col, roof, o]) => clayHouse(c, x, b, w, h, col, roof, o)); bottleTree(c, 930, 610, 260); lightString(c, 0, 420, 900, 440, 70, 20); lightString(c, 1000, 430, 1920, 410, 70, 20); }, 4);
  bokehLights(main, 22, 7, [0, 320, CW, 260]);
  [[160, 470], [380, 420], [600, 500], [1290, 450], [1500, 470], [1760, 440]].forEach(([x, y]) => warmGlow(main, x, y, 120, .25));
  cottonGround(main, 740, { ph: 1 });
  // 背后的两对情侣（中景，有一点虚）
  blurLayer(main, c => { [[1300, 760, 0], [1560, 770, 1]].forEach(([x, fy, k]) => { clayKid(c, x - 46, fy, 190, { girl: 1, eyes: 'happy', mouth: 'smile' }); clayKid(c, x + 46, fy, 200, { eyes: 'happy', mouth: 'smile' }); c.save(); c.strokeStyle = '#8A8AA0'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, fy - 150); c.lineTo(x + 6, fy - 250); c.stroke(); c.restore(); clay(c, [x - 30, fy - 300, 66, 60], c2 => { const X = x + 6, Y = fy - 270; c2.beginPath(); c2.moveTo(X, Y + 26); c2.bezierCurveTo(X - 40, Y - 4, X - 20, Y - 30, X, Y - 12); c2.bezierCurveTo(X + 20, Y - 30, X + 40, Y - 4, X, Y + 26); c2.fill(); }, '#E8404A', { prints: 0, sb: 4 }); }); }, 2.2);
  // 他
  const k = clayKid(main, 700, 900, 360, { eyes: 'up', mouth: 'flat', step: 1 });
  // 头顶的棉花云：一根线吊着，线上一块胶带
  const cx = 720, cy = 330; hangThread(main, cx, 0, cy - 60);
  main.save(); for (let i = 0; i < 46; i++) { const r = rng(i * 7 + 1), a = r() * 6.283, d = Math.sqrt(r()), x = cx + Math.cos(a) * 130 * d, y = cy + Math.sin(a) * 52 * d, rad = 30 + r() * 26; const gr = main.createRadialGradient(x - rad * .3, y - rad * .4, 2, x, y, rad); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(.7, '#E8ECF6'); gr.addColorStop(1, 'rgba(180,190,220,.0)'); main.fillStyle = gr; main.beginPath(); main.arc(x, y, rad, 0, 7); main.fill(); } main.restore();
  main.save(); main.lineWidth = .8; for (let i = 0; i < 260; i++) { const r = rng(i + 99), a = r() * 6.283, d = 100 + r() * 70; main.strokeStyle = 'rgba(255,255,255,.35)'; main.beginPath(); main.moveTo(cx + Math.cos(a) * d * .9, cy + Math.sin(a) * d * .35); main.lineTo(cx + Math.cos(a) * d * 1.05, cy + Math.sin(a) * d * .42); main.stroke(); } main.restore();
  // 只下在他身上的雪（粗面粉 + 小棉球），头上肩上已经积了一点
  const r = rng(12); for (let i = 0; i < 70; i++) { const x = cx - 110 + r() * 220, y = cy + 40 + r() * 520, s = 3 + r() * 7; main.fillStyle = `rgba(255,255,255,${.7 + r() * .3})`; main.beginPath(); main.arc(x, y, s, 0, 7); main.fill(); main.fillStyle = 'rgba(150,160,200,.35)'; main.beginPath(); main.arc(x + s * .3, y + s * .35, s * .55, 0, 7); main.fill(); }
  clay(main, [k.hcx - k.hr * .9, k.hcy - k.hr * 1.25, k.hr * 1.8, k.hr * .45], c => { [[-.45, -.92, .4, .17], [.05, -1.02, .45, .17], [.5, -.86, .35, .15]].forEach(([dx, dy, rx, ry]) => { c.beginPath(); c.ellipse(k.hcx + dx * k.hr, k.hcy + dy * k.hr, rx * k.hr, ry * k.hr, dx * .4, 0, 7); c.fill(); }); }, '#FBFBFF', { prints: 0, sb: 3 });
  [[-1, -5], [1, 5]].forEach(([sd, dx]) => clay(main, [k.hcx + dx * k.u - 3 * k.u, k.hcy + 6.2 * k.u, 6 * k.u, 2.2 * k.u], P.el(k.hcx + dx * k.u, k.hcy + 7.2 * k.u, 2.8 * k.u, 1 * k.u), '#FBFBFF', { prints: 0, sb: 3 }));
  // 前景虚化的雪球、瓶刷树
  blurLayer(main, c => { bottleTree(c, 1780, 1180, 560, '#2A6A48', .8); clay(c, [60, 930, 220, 180], P.el(170, 1020, 110, 90), '#F2F4FA', { prints: 2 }); }, 10);
  flourSnow(main, 8, 60, { s: 3 });
  finish8(main);
  clayText(main, '过条街 最好又给我下起雪', CW / 2, 1000, 80, '#F6F0E6');
  mark8(main);
};

/* ============ 8c：副歌"我承认我是爱情里的废柴"。他整个人塌成一摊黏土，只剩脸和围巾；她拎着箱子走远，雪上一串小脚印 ============ */
FRAMES['8c'] = async (main) => {
  felt(main, CW, CH, '#161A3E');
  const bg2 = main.createLinearGradient(0, 0, 0, CH); bg2.addColorStop(0, 'rgba(0,0,0,.25)'); bg2.addColorStop(1, 'rgba(40,30,80,.15)'); main.fillStyle = bg2; main.fillRect(0, 0, CW, CH);
  hangThread(main, 1500, 0, 160); clay(main, [1430, 160, 140, 140], P.el(1500, 230, 68, 68), '#F6EDC8', { prints: 4 }); warmGlow(main, 1500, 230, 240, .22, '255,240,180');
  [[300, 120, 24], [700, 80, 16], [1100, 140, 20], [1780, 90, 18]].forEach(([x, y, r]) => { hangThread(main, x, 0, y - r); feltStar(main, x, y, r, '#E8D070'); });
  blurLayer(main, c => { cottonGround(c, 560, { col: '#B8C0DE', ph: 4 }); bottleTree(c, 200, 570, 220); bottleTree(c, 1700, 575, 260); clayHouse(c, 1240, 566, 150, 120, '#A84A5A', '#4A2A3A'); lightString(c, 0, 470, 1920, 480, 50, 30); }, 6);
  bokehLights(main, 18, 9, [0, 380, CW, 200], ['#FF8AD8', '#FFD54A', '#5AB8FF']);
  cottonGround(main, 720, { ph: 3 });
  // 她：拎着小箱子，走远了（小一点、在右边）
  const r = rng(2); for (let i = 0; i < 12; i++) { const x = 900 + i * 62, y = 870 - i * 12 + (i % 2) * 14; clay(main, [x - 12, y - 6, 24, 12], P.el(x, y, 10, 5), '#C6CCE4', { prints: 0, shadow: false, spec: false, bevel: 2 }); }
  clayKid(main, 1640, 760, 200, { girl: 1, back: 1, step: 2 });
  clay(main, [1680, 680, 70, 70], P.rr(1684, 690, 60, 52, 8), '#8A3A4A', { prints: 0, sb: 5, marks: (s, ox, oy) => { s.save(); s.translate(ox, oy); s.fillStyle = '#3A2030'; s.fillRect(1700, 676, 28, 6); s.fillRect(1700, 676, 6, 16); s.fillRect(1722, 676, 6, 16); s.restore(); } });
  // 他：塌成一摊
  const HX = 720, HY = 850;
  clay(main, [HX - 260, HY - 70, 520, 140], c => { c.beginPath(); c.moveTo(HX - 250, HY + 40); c.bezierCurveTo(HX - 260, HY - 30, HX - 140, HY - 60, HX - 40, HY - 50); c.bezierCurveTo(HX + 80, HY - 70, HX + 240, HY - 40, HX + 255, HY + 30); c.bezierCurveTo(HX + 200, HY + 70, HX - 200, HY + 70, HX - 250, HY + 40); c.fill(); }, '#E39A34', { prints: 5, bevel: 16 });
  clay(main, [HX - 240, HY - 20, 110, 60], P.el(HX - 190, HY + 10, 50, 26, .2), '#2E3A5E', { prints: 0, sb: 5 });
  clay(main, [HX + 150, HY - 10, 110, 60], P.el(HX + 200, HY + 18, 50, 24, -.2), '#2E3A5E', { prints: 0, sb: 5 });
  clay(main, [HX - 120, HY - 100, 240, 70], P.rr(HX - 120, HY - 96, 240, 60, 28), '#D8323C', { prints: 1, marks: (s, ox, oy) => { for (let i = -8; i <= 8; i++) groove(s, ox, oy, [[HX + i * 14, HY - 90], [HX + i * 14 + 4, HY - 42]], 2.5, .22); } });
  clay(main, [HX + 60, HY - 60, 140, 60], P.rr(HX + 70, HY - 52, 130, 40, 16), '#D8323C', { prints: 0, sb: 5 });
  // 头：压扁了一点，搁在那一摊上
  main.save(); main.translate(HX, HY - 160); main.scale(1.12, .9); main.translate(-HX, -(HY - 160));
  clay(main, [HX - 110, HY - 270, 220, 210], P.el(HX, HY - 165, 108, 100), '#F4CDB2', { prints: 3, bevel: 18 });
  clay(main, [HX - 118, HY - 285, 236, 120], c => { c.beginPath(); c.moveTo(HX - 112, HY - 160); c.bezierCurveTo(HX - 125, HY - 300, HX + 125, HY - 300, HX + 112, HY - 160); for (let i = 5; i >= 0; i--) { const xx = HX - 112 + i * 44.8; c.quadraticCurveTo(xx + 22, HY - 160 - (i % 2 ? 18 : 46), xx, HY - 190 + (i === 0 || i === 5 ? 30 : 0)); } c.closePath(); c.fill(); }, '#3A2630', { prints: 0 });
  main.restore();
  [-1, 1].forEach(sd => { const X = HX + sd * 46, Y = HY - 160; main.save(); main.strokeStyle = '#1A0E14'; main.lineCap = 'round'; main.lineWidth = 9; main.beginPath(); main.arc(X, Y - 6, 18, .15 * Math.PI, .85 * Math.PI); main.stroke(); main.strokeStyle = '#3A2630'; main.lineWidth = 7; main.beginPath(); main.moveTo(X - sd * 24, Y - 46); main.lineTo(X + sd * 10, Y - 36); main.stroke(); main.restore(); clay(main, [HX + sd * 74 - 22, Y + 18, 44, 26], P.el(HX + sd * 74, Y + 30, 20, 11), '#F59AA0', { shadow: false, prints: 0, spec: false, bevel: 2 });
    main.save(); main.fillStyle = 'rgba(150,215,255,.92)'; main.beginPath(); main.moveTo(X + sd * 6, Y + 6); main.quadraticCurveTo(X + sd * 30, Y + 60, X + sd * 8, Y + 92); main.quadraticCurveTo(X - sd * 16, Y + 60, X + sd * 6, Y + 6); main.fill(); main.fillStyle = 'rgba(255,255,255,.85)'; main.beginPath(); main.ellipse(X + sd * 2, Y + 50, 4, 10, 0, 0, 7); main.fill(); main.restore(); });
  main.save(); main.strokeStyle = '#7A2A34'; main.lineCap = 'round'; main.lineWidth = 8; main.beginPath(); main.arc(HX, HY - 82, 16, 1.2 * Math.PI, 1.8 * Math.PI); main.stroke(); main.restore();
  // 一个大拇指按下去留下的指纹（制作的人按的）
  main.save(); main.translate(HX + 120, HY - 20); main.rotate(-.4); for (let i = 0; i < 12; i++) { main.strokeStyle = i % 2 ? 'rgba(255,240,220,.18)' : 'rgba(80,40,10,.22)'; main.lineWidth = 2; main.beginPath(); main.ellipse(0, 0, 8 + i * 4, 5 + i * 3, 0, 0, 7); main.stroke(); } main.restore();
  blurLayer(main, c => { bottleTree(c, 140, 1160, 520, '#2A6A48', .8); clay(c, [1690, 940, 260, 200], P.el(1820, 1040, 130, 100), '#F2F4FA', { prints: 2 }); }, 10);
  flourSnow(main, 13, 110, { s: 4 });
  finish8(main, { vig: .62 });
  clayText(main, '我承认我是 爱情里的', CW / 2 - 120, 1004, 78, '#F6F0E6');
  clayText(main, '废柴', CW / 2 + 360, 996, 110, '#E8503A', { fat: .05 });
  mark8(main);
};
