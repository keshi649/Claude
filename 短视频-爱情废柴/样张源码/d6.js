'use strict';
/* 方向 6：一根火柴（"废柴"就是一根烧废了的火柴）。
   他是一根火柴人：红色的火柴头就是他的脑袋（头顶尖尖的一点是呆毛），身子是木棍，脖子上一条小红围巾。
   她是一根蜡烛：淡紫色的蜡身（她的大衣），白色的蜡顶（她的毛线帽），火苗是粉橙色的（帽子上的绒球），两只小红手套。
   每划一次，火光里就看见一段过去（像卖火柴的小女孩）。冷的蓝色夜里，只有火是暖的。 */
NEED += '安全火柴爱情废柴牌圣诞特制每盒约四十支甜菜火柴厂出品原唱周杰伦我叛逆点起一根烟承认是里的剩余支第根';
const MW = 1920, MH = 1080;
function cv2(w = MW, h = MH) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c.getContext('2d'); }
function glow(g, x, y, r, col, a = 1) { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.globalAlpha = a; g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); g.restore(); }
function rgba(c, a) { const A = h2(c); return `rgba(${A[0]},${A[1]},${A[2]},${a})`; }
function grain(g, a = .05, seed = 3) { const t = cv2(480, 270), d = t.createImageData(480, 270), r = rng(seed); for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() - .5) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } t.putImageData(d, 0, 0); g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = a; g.imageSmoothingEnabled = false; g.drawImage(t.canvas, 0, 0, MW, MH); g.restore(); }
function vignette(g, a = .6, col = '3,4,14') { const v = g.createRadialGradient(MW / 2, MH / 2, MH * .35, MW / 2, MH / 2, MH * 1.05); v.addColorStop(0, `rgba(${col},0)`); v.addColorStop(1, `rgba(${col},${a})`); g.fillStyle = v; g.fillRect(0, 0, MW, MH); }
function flakes(g, seed, n, o = {}) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = r() * MW, y = r() * (o.h || MH), s = (o.s0 || 1.2) + r() * (o.s1 || 3); g.globalAlpha = .35 + r() * .55; g.fillStyle = o.col || '#EAF0FF'; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); } g.globalAlpha = 1; }
function bigFlakes(g, seed, n) { const r = rng(seed); g.save(); for (let i = 0; i < n; i++) { const x = r() * MW, y = r() * MH, s = 10 + r() * 22; g.filter = `blur(${4 + r() * 6}px)`; g.globalAlpha = .25 + r() * .3; g.fillStyle = '#EAF0FF'; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); } g.restore(); }

/* ---------- 火苗 ---------- */
function flame(g, x, y, h, o = {}) {
  const w = h * .42, sway = o.sway || 0;
  const tear = (s, c, a) => { g.save(); g.globalAlpha = a; g.fillStyle = c; g.beginPath(); g.moveTo(x + sway * s, y - h * s); g.bezierCurveTo(x + w * s * .9, y - h * s * .45, x + w * s, y - h * s * .05, x, y + h * s * .12); g.bezierCurveTo(x - w * s, y - h * s * .05, x - w * s * .8, y - h * s * .45, x + sway * s, y - h * s); g.fill(); g.restore(); };
  glow(g, x, y - h * .4, h * (o.big || 3.2), o.glowCol || 'rgba(255,150,60,.55)');
  g.save(); g.filter = `blur(${h * .06}px)`; tear(1.12, o.c0 || '#FF6A1A', .55); g.restore();
  tear(1, o.c1 || '#FF8A2A', .95); tear(.78, o.c2 || '#FFB84A', 1); tear(.55, o.c3 || '#FFE9A0', 1); tear(.28, '#FFFFFF', .9);
  g.save(); g.globalAlpha = .55; g.fillStyle = '#4A7AFF'; g.beginPath(); g.ellipse(x, y + h * .02, w * .32, h * .1, 0, 0, 7); g.fill(); g.restore();
}
/* ---------- 木棍 ---------- */
function stick(g, x0, y0, x1, y1, w, col = '#E9C99C') {
  const L = Math.hypot(x1 - x0, y1 - y0), an = Math.atan2(y1 - y0, x1 - x0);
  g.save(); g.translate(x0, y0); g.rotate(an);
  const gr = g.createLinearGradient(0, -w / 2, 0, w / 2); gr.addColorStop(0, lt(col, .25)); gr.addColorStop(.45, col); gr.addColorStop(1, dk(col, .35));
  g.fillStyle = gr; g.beginPath(); g.roundRect(0, -w / 2, L, w, w * .25); g.fill();
  g.strokeStyle = rgba(dk(col, .3), .35); g.lineWidth = 1; const r = rng(Math.round(L + w)); for (let i = 0; i < 4; i++) { const yy = (r() - .5) * w * .7; g.beginPath(); g.moveTo(r() * L * .2, yy); g.lineTo(L * (.6 + r() * .4), yy + (r() - .5) * 2); g.stroke(); }
  g.restore();
}
/* ---------- 他：火柴人 ---------- */
function matchMan(g, x, fy, H, o = {}) {
  const hr = H * .14, st = o.state || 'fresh', lean = o.lean || 0, sitD = o.sit ? H * .24 : 0;
  const hip = fy - H * .32 + sitD, neck = hip - H * .3, hcy = neck - hr * 1.05, bw = H * .075, wood = o.wood || '#E9C99C';
  g.save(); g.translate(x, fy); g.rotate(lean); g.translate(-x, -fy);
  // 影子
  g.save(); g.fillStyle = 'rgba(10,14,40,.35)'; g.filter = `blur(${H * .02}px)`; g.beginPath(); g.ellipse(x + H * .05, fy, H * .22, H * .03, 0, 0, 7); g.fill(); g.restore();
  // 腿
  const sit = o.sit;
  if (sit) { [-1, 1].forEach(sd => { stick(g, x + sd * bw * .4, hip, x + sd * H * .16, hip - H * .05, H * .045, wood); stick(g, x + sd * H * .16, hip - H * .05, x + sd * H * .24, fy + H * .01, H * .045, wood); }); }
  else { stick(g, x - bw * .5, hip, x - H * .09, fy - H * .02, H * .045, wood); stick(g, x + bw * .5, hip, x + H * .09, fy - H * .02, H * .045, wood); }
  [[sit ? x - H * .25 : x - H * .1, fy + (sit ? H * .02 : 0)], [sit ? x + H * .25 : x + H * .1, fy + (sit ? H * .02 : 0)]].forEach(([fx, fyy]) => { g.fillStyle = dk(wood, .35); g.beginPath(); g.ellipse(fx, fyy - H * .012, H * .04, H * .022, 0, 0, 7); g.fill(); });
  // 身子
  const bg = g.createLinearGradient(x - bw / 2, 0, x + bw / 2, 0); bg.addColorStop(0, lt(wood, .3)); bg.addColorStop(.4, wood); bg.addColorStop(1, dk(wood, .35)); g.fillStyle = bg; g.beginPath(); g.roundRect(x - bw / 2, neck - hr * .2, bw, hip - neck + hr * .3, bw * .2); g.fill();
  g.strokeStyle = rgba(dk(wood, .35), .4); g.lineWidth = 1; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x - bw * .25 + i * bw * .22, neck + 4); g.lineTo(x - bw * .2 + i * bw * .22, hip - 4); g.stroke(); }
  // 胳膊
  const sh = [x, neck + H * .06], arm = o.arms || 'down', aw = H * .04;
  const A = { down: [[-.16, .2, -.2, .36], [.16, .2, .2, .36]], up: [[-.18, -.06, -.24, -.24], [.18, -.06, .24, -.24]], strike: [[-.16, .2, -.2, .36], [.2, -.02, .1, -.2]], hug: [[-.15, .14, .02, .22], [.15, .14, -.02, .22]], knees: [[-.15, .12, -.13, .25], [.15, .12, .13, .25]], wave: [[-.16, .2, -.2, .36], [.2, -.02, .3, -.18]], reach: [[-.16, .2, -.2, .36], [.22, .06, .4, .02]] }[arm];
  A.forEach(([ex, ey, hx, hy]) => { const E = [x + ex * H, sh[1] + ey * H], Hd = [x + hx * H, sh[1] + hy * H]; stick(g, sh[0], sh[1], E[0], E[1], aw, wood); stick(g, E[0], E[1], Hd[0], Hd[1], aw, wood); g.fillStyle = o.mitt || lt(wood, .1); g.beginPath(); g.arc(Hd[0], Hd[1], aw * .9, 0, 7); g.fill(); });
  // 围巾
  if (o.scarf !== false) { const sw = bw * 2.4, sy = neck + H * .015; g.fillStyle = '#B8202C'; g.beginPath(); g.roundRect(x - sw / 2, sy - H * .02, sw, H * .05, H * .02); g.fill(); g.fillStyle = '#D8323C'; g.beginPath(); g.roundRect(x - sw / 2, sy - H * .025, sw, H * .04, H * .02); g.fill(); for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x - sw / 2 + 4 + i * sw / 6, sy - H * .02, 2, H * .03); } g.save(); g.translate(x + sw * .25, sy + H * .01); g.rotate(o.wind ? -1.2 : .15); g.fillStyle = '#C42A36'; g.beginPath(); g.roundRect(0, 0, H * .045, H * (o.wind ? .2 : .13), H * .01); g.fill(); g.restore(); }
  // 头
  const head = () => { g.beginPath(); g.moveTo(x, hcy - hr * 1.38); g.bezierCurveTo(x + hr * .25, hcy - hr * 1.2, x + hr * 1.02, hcy - hr * .95, x + hr * 1.02, hcy); g.bezierCurveTo(x + hr * 1.02, hcy + hr * .9, x + hr * .55, hcy + hr * 1.18, x, hcy + hr * 1.18); g.bezierCurveTo(x - hr * .55, hcy + hr * 1.18, x - hr * 1.02, hcy + hr * .9, x - hr * 1.02, hcy); g.bezierCurveTo(x - hr * 1.02, hcy - hr * .95, x - hr * .3, hcy - hr * 1.1, x, hcy - hr * 1.38); g.closePath(); };
  const HC = st === 'burnt' ? ['#2A2222', '#151010', '#0A0606'] : st === 'lit' ? ['#E8542A', '#C0301E', '#7A1A14'] : ['#D2363A', '#A8202A', '#5E1218'];
  g.save(); head(); const hg = g.createRadialGradient(x - hr * .4, hcy - hr * .5, hr * .1, x, hcy, hr * 1.35); hg.addColorStop(0, HC[0]); hg.addColorStop(.6, HC[1]); hg.addColorStop(1, HC[2]); g.fillStyle = hg; g.fill(); g.clip();
  const rr = rng(Math.round(x + H)); for (let i = 0; i < hr * 6; i++) { g.fillStyle = rr() < .5 ? 'rgba(0,0,0,.25)' : 'rgba(255,200,180,.18)'; g.fillRect(x - hr + rr() * hr * 2, hcy - hr * 1.3 + rr() * hr * 2.5, 1.6, 1.6); }
  if (st === 'burnt') { g.shadowColor = '#FF5A10'; g.shadowBlur = 12; [[-.55, -.8, .07], [-.2, -1.05, .05], [.3, -.95, .08], [.65, -.6, .05], [.05, -.75, .04], [-.75, -.35, .04]].forEach(([dx, dy, rr2]) => { g.fillStyle = '#FF8A3A'; g.beginPath(); g.arc(x + dx * hr, hcy + dy * hr, rr2 * hr, 0, 7); g.fill(); }); g.shadowBlur = 0; g.fillStyle = 'rgba(180,170,170,.35)'; for (let i = 0; i < 30; i++) g.fillRect(x - hr + rr() * hr * 2, hcy - hr + rr() * hr * 1.2, 3, 2); }
  else { g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(x - hr * .38, hcy - hr * .55, hr * .32, hr * .18, -.5, 0, 7); g.fill(); }
  g.restore();
  // 脸
  const ey = hcy + hr * .1, ex = hr * .42, em = o.eyes || 'n';
  [-1, 1].forEach(sd => { const X = x + sd * ex; g.fillStyle = st === 'burnt' ? '#FFD9B0' : '#1A0A0C';
    if (em === 'shut' || em === 'sad2') { g.strokeStyle = g.fillStyle; g.lineWidth = hr * .09; g.lineCap = 'round'; g.beginPath(); g.arc(X, ey - hr * .06, hr * .14, .2 * Math.PI, .8 * Math.PI); g.stroke(); }
    else if (em === 'happy') { g.strokeStyle = g.fillStyle; g.lineWidth = hr * .09; g.lineCap = 'round'; g.beginPath(); g.arc(X, ey + hr * .1, hr * .14, 1.15 * Math.PI, 1.85 * Math.PI); g.stroke(); }
    else { g.beginPath(); g.ellipse(X, ey + (em === 'up' ? -hr * .1 : 0), hr * .13, hr * .19, 0, 0, 7); g.fill(); if (st !== 'burnt') { g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(X - hr * .04, ey - hr * .08 + (em === 'up' ? -hr * .1 : 0), hr * .05, 0, 7); g.fill(); } }
    if (em === 'sad' || em === 'sad2') { g.strokeStyle = st === 'burnt' ? '#FFD9B0' : '#1A0A0C'; g.lineWidth = hr * .06; g.beginPath(); g.moveTo(X - sd * hr * .2, ey - hr * .38); g.lineTo(X + sd * hr * .12, ey - hr * .3); g.stroke(); }
    if (st !== 'burnt') { g.fillStyle = 'rgba(255,150,160,.55)'; g.beginPath(); g.ellipse(x + sd * hr * .66, ey + hr * .3, hr * .16, hr * .09, 0, 0, 7); g.fill(); }
    if (o.tear) { g.fillStyle = '#9FE0FF'; g.beginPath(); g.moveTo(X + sd * hr * .1, ey + hr * .15); g.quadraticCurveTo(X + sd * hr * .25, ey + hr * .45, X + sd * hr * .1, ey + hr * .55); g.quadraticCurveTo(X - sd * hr * .02, ey + hr * .4, X + sd * hr * .1, ey + hr * .15); g.fill(); }
  });
  const m = o.mouth || 'flat', my = ey + hr * .42; g.strokeStyle = st === 'burnt' ? '#FFD9B0' : '#1A0A0C'; g.lineWidth = hr * .07; g.lineCap = 'round'; g.beginPath();
  if (m === 'smile') g.arc(x, my - hr * .1, hr * .14, .2 * Math.PI, .8 * Math.PI); else if (m === 'o') g.ellipse(x, my, hr * .07, hr * .1, 0, 0, 7); else if (m === 'frown') g.arc(x, my + hr * .12, hr * .12, 1.2 * Math.PI, 1.8 * Math.PI); else { g.moveTo(x - hr * .08, my); g.lineTo(x + hr * .08, my); }
  g.stroke();
  if (st === 'lit') flame(g, x + (o.sway || 0) * .2, hcy - hr * .9, H * .42, { sway: o.sway || 0 });
  if (st === 'burnt' && o.smoke !== false) smoke(g, x, hcy - hr * 1.3, H * .9, 1);
  g.restore();
  return { hcy, hr, neck, hand: [x + A[1][2] * H, sh[1] + A[1][3] * H] };
}
function smoke(g, x, y, h, seed = 1) { const r = rng(seed); g.save(); g.lineCap = 'round'; for (let k = 0; k < 3; k++) { g.strokeStyle = `rgba(190,200,220,${.18 - k * .04})`; g.lineWidth = 3 + k * 4; g.filter = `blur(${1 + k * 2}px)`; g.beginPath(); g.moveTo(x, y); for (let i = 1; i <= 12; i++) { const t = i / 12; g.lineTo(x + Math.sin(t * 7 + k + r() * .3) * 16 * t + k * 4, y - t * h); } g.stroke(); } g.restore(); }
/* ---------- 她：蜡烛 ---------- */
function candleGirl(g, x, by, H, o = {}) {
  const W = H * .46, top = by - H, body = o.body || '#B7A6F0';
  g.save(); g.fillStyle = 'rgba(10,14,40,.35)'; g.filter = `blur(${H * .03}px)`; g.beginPath(); g.ellipse(x + W * .1, by, W * .8, H * .06, 0, 0, 7); g.fill(); g.restore();
  // 小碟子
  g.fillStyle = '#B88A3A'; g.beginPath(); g.ellipse(x, by, W * .85, H * .06, 0, 0, 7); g.fill(); g.fillStyle = '#E8C070'; g.beginPath(); g.ellipse(x, by - H * .015, W * .8, H * .045, 0, 0, 7); g.fill();
  // 蜡身
  const gr = g.createLinearGradient(x - W / 2, 0, x + W / 2, 0); gr.addColorStop(0, lt(body, .3)); gr.addColorStop(.35, lt(body, .12)); gr.addColorStop(1, dk(body, .32));
  g.fillStyle = gr; g.beginPath(); g.moveTo(x - W / 2, top + H * .12); g.lineTo(x - W / 2, by - H * .03); g.quadraticCurveTo(x, by + H * .03, x + W / 2, by - H * .03); g.lineTo(x + W / 2, top + H * .12); g.closePath(); g.fill();
  // 白色蜡顶（帽子）和流下来的蜡
  g.fillStyle = '#F6F3EE'; g.beginPath(); g.moveTo(x - W / 2 - 2, top + H * .16); const r = rng(Math.round(H));
  for (let i = 0; i <= 10; i++) { const t = i / 10, xx = x - W / 2 - 2 + t * (W + 4), drip = [0, 1, 0, 0, 2, 0, 0, 1, 0, 3, 0][i]; g.lineTo(xx, top + H * (.16 + drip * .06 + r() * .015)); }
  g.lineTo(x + W / 2 + 2, top + H * .03); g.quadraticCurveTo(x, top - H * .04, x - W / 2 - 2, top + H * .03); g.closePath(); g.fill();
  g.fillStyle = 'rgba(200,190,230,.6)'; g.beginPath(); g.ellipse(x, top + H * .03, W * .44, H * .035, 0, 0, 7); g.fill();
  for (let i = 0; i < 4; i++) { g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - W * .4 + i * W * .27, top + H * .05); g.lineTo(x - W * .38 + i * W * .27, top + H * .13); g.stroke(); }
  // 脸
  const ey = top + H * .36;
  [-1, 1].forEach(sd => { const X = x + sd * W * .2; g.fillStyle = '#231620';
    if (o.eyes === 'happy') { g.strokeStyle = '#231620'; g.lineWidth = H * .018; g.lineCap = 'round'; g.beginPath(); g.arc(X, ey + H * .015, H * .03, 1.15 * Math.PI, 1.85 * Math.PI); g.stroke(); }
    else if (o.eyes === 'shut') { g.strokeStyle = '#231620'; g.lineWidth = H * .016; g.lineCap = 'round'; g.beginPath(); g.arc(X, ey - H * .01, H * .03, .2 * Math.PI, .8 * Math.PI); g.stroke(); }
    else { g.beginPath(); g.ellipse(X, ey, H * .026, H * .038, 0, 0, 7); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(X - H * .008, ey - H * .014, H * .01, 0, 7); g.fill(); g.strokeStyle = '#231620'; g.lineWidth = H * .01; g.beginPath(); g.moveTo(X + sd * H * .02, ey - H * .03); g.lineTo(X + sd * H * .04, ey - H * .045); g.stroke(); }
    g.fillStyle = 'rgba(255,140,160,.55)'; g.beginPath(); g.ellipse(x + sd * W * .3, ey + H * .055, H * .035, H * .018, 0, 0, 7); g.fill(); });
  g.strokeStyle = '#7A2A34'; g.lineWidth = H * .014; g.lineCap = 'round'; g.beginPath(); g.arc(x, ey + H * .05, H * .025, .2 * Math.PI, .8 * Math.PI); g.stroke();
  // 小红手套
  [-1, 1].forEach(sd => { g.fillStyle = '#C42A36'; g.beginPath(); g.ellipse(x + sd * (W / 2 + H * .02), top + H * .62, H * .045, H * .055, sd * .4, 0, 7); g.fill(); g.fillStyle = '#E04450'; g.beginPath(); g.ellipse(x + sd * (W / 2 + H * .015), top + H * .6, H * .025, H * .03, sd * .4, 0, 7); g.fill(); g.fillStyle = '#FFFFFF'; g.fillRect(x + sd * (W / 2 + H * .02) - H * .04, top + H * .66, H * .08, H * .02); });
  // 灯芯和火苗
  g.strokeStyle = '#2A1A14'; g.lineWidth = H * .016; g.beginPath(); g.moveTo(x, top + H * .01); g.quadraticCurveTo(x + H * .01, top - H * .03, x + H * .004, top - H * .06); g.stroke();
  if (o.lit !== false) flame(g, x, top - H * .05, H * (o.fh || .3), { c0: '#FF6A8A', c1: '#FF8AA0', c2: '#FFB090', c3: '#FFE8D0', glowCol: 'rgba(255,140,150,.5)', big: o.big || 3.4 });
}
/* ---------- 火柴盒 ---------- */
const BOX = { W: 640, H: 150, D: 400, kx: .55, ky: .38 };
function bp(X0, Y0, x, y, z) { return [X0 + x + z * BOX.kx, Y0 - y - z * BOX.ky]; }
function poly(g, pts, fill) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = fill; g.fill(); }
function labelArt() {
  const L = cv2(1280, 800), g = L, W = 1280, H = 800;
  g.fillStyle = '#F2E2C2'; g.fillRect(0, 0, W, H);
  const r = rng(11); for (let i = 0; i < 9000; i++) { g.fillStyle = r() < .5 ? 'rgba(120,80,30,.06)' : 'rgba(255,255,255,.12)'; g.fillRect(r() * W, r() * H, 2 + r() * 3, 1 + r() * 2); }
  [[200, 600, 180], [1100, 200, 140]].forEach(([x, y, rad]) => { const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, 'rgba(150,100,40,.12)'); gr.addColorStop(1, 'rgba(150,100,40,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, 2 * rad, 2 * rad); });
  const RED = '#B82A2A', BLUE = '#1E3A6E';
  g.strokeStyle = RED; g.lineWidth = 22; g.strokeRect(30, 30, W - 60, H - 60); g.strokeStyle = BLUE; g.lineWidth = 5; g.strokeRect(58, 58, W - 116, H - 116); g.strokeRect(70, 70, W - 140, H - 140);
  for (let i = 0; i < 26; i++) { const x = 90 + i * 43.5; g.fillStyle = i % 2 ? RED : BLUE; g.beginPath(); g.moveTo(x, 84); g.lineTo(x + 10, 96); g.lineTo(x, 108); g.lineTo(x - 10, 96); g.fill(); g.beginPath(); g.moveTo(x, H - 84); g.lineTo(x + 10, H - 96); g.lineTo(x, H - 108); g.lineTo(x - 10, H - 96); g.fill(); }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = BLUE; g.font = '700 46px "Noto Serif SC"'; g.fillText('安　全　火　柴', W / 2, 160);
  g.font = '900 210px "Noto Serif SC"'; g.fillStyle = BLUE; g.fillText('爱情废柴', W / 2 + 8, 352); g.fillStyle = RED; g.fillText('爱情废柴', W / 2, 344);
  g.fillStyle = BLUE; g.font = '700 40px "Noto Serif SC"'; g.fillText('— 牌 —', W / 2, 482);
  // 小插图：一根火柴和一根蜡烛，中间一颗星
  g.save(); g.translate(W / 2, 600); g.fillStyle = BLUE;
  g.fillRect(-140, -40, 16, 120); g.beginPath(); g.ellipse(-132, -58, 26, 30, 0, 0, 7); g.fillStyle = RED; g.fill();
  g.fillStyle = BLUE; g.fillRect(100, -20, 64, 100); g.fillStyle = RED; g.beginPath(); g.moveTo(132, -78); g.quadraticCurveTo(152, -40, 132, -26); g.quadraticCurveTo(112, -40, 132, -78); g.fill();
  g.fillStyle = RED; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 14 : 34; g.lineTo(Math.cos(a) * rr, -50 + Math.sin(a) * rr); } g.fill();
  g.strokeStyle = RED; g.lineWidth = 6; g.beginPath(); g.moveTo(-90, 40); g.bezierCurveTo(-40, 0, 40, 0, 80, 40); g.stroke();
  g.restore();
  g.fillStyle = BLUE; g.font = '700 34px "Noto Serif SC"'; g.textAlign = 'left'; g.fillText('圣诞特制', 110, 640); g.fillText('每盒约四十支', 110, 690); g.textAlign = 'right'; g.fillText('原唱 周杰伦', W - 110, 640); g.fillText('甜菜火柴厂出品', W - 110, 690);
  return L.canvas;
}
/* 火柴盒：X0,Y0 是盒子左前下角在屏幕上的位置；pull 抽屉拉出来多长 */
function matchbox(g, X0, Y0, o = {}) {
  const { W, H, D } = BOX, pull = o.pull || 0, P = (x, y, z) => bp(X0, Y0, x, y, z);
  g.save(); g.fillStyle = 'rgba(8,12,34,.45)'; g.filter = 'blur(16px)'; poly(g, [P(-20, 0, -20), P(W + pull + 20, 0, -20), P(W + pull + 40, 0, D + 30), P(0, 0, D + 30)], 'rgba(8,12,34,.45)'); g.restore();
  // 抽屉（拉出来的那一截）
  if (pull > 0) {
    const t = 10; poly(g, [P(W, 0, 6), P(W + pull, 0, 6), P(W + pull, 0, D - 6), P(W, 0, D - 6)], '#D9C29A');
    poly(g, [P(W, t, D - 6), P(W + pull, t, D - 6), P(W + pull, H - 14, D - 6), P(W, H - 14, D - 6)], '#BFA678');
    poly(g, [P(W + pull, 0, 6), P(W + pull, 0, D - 6), P(W + pull, H - 14, D - 6), P(W + pull, H - 14, 6)], '#E8D3AC');
    if (o.inside) o.inside(P, pull);
    poly(g, [P(W, 0, 6), P(W + pull, 0, 6), P(W + pull, H - 14, 6), P(W, H - 14, 6)], '#E4CFA6');
    g.strokeStyle = 'rgba(120,90,50,.4)'; g.lineWidth = 2; [[P(W, H - 14, 6), P(W + pull, H - 14, 6)], [P(W + pull, H - 14, 6), P(W + pull, H - 14, D - 6)]].forEach(([a, b]) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); });
  }
  // 外壳：前面（擦火皮）、右端、顶面（贴标）
  poly(g, [P(0, 0, 0), P(W, 0, 0), P(W, H, 0), P(0, H, 0)], '#7A2E26');
  const sp = cv2(W, H); sp.fillStyle = '#5A3A2A'; sp.fillRect(0, 0, W, H); const r = rng(4); for (let i = 0; i < 9000; i++) { sp.fillStyle = r() < .5 ? 'rgba(0,0,0,.35)' : 'rgba(255,200,150,.18)'; sp.fillRect(r() * W, r() * H, 2, 2); } for (let i = 0; i < 9; i++) { sp.strokeStyle = 'rgba(30,20,15,.6)'; sp.lineWidth = 3; sp.beginPath(); sp.moveTo(r() * W, r() * H); sp.lineTo(r() * W, r() * H); sp.stroke(); }
  if (o.strikes) for (let i = 0; i < o.strikes; i++) { sp.strokeStyle = 'rgba(20,10,8,.55)'; sp.lineWidth = 5; const x = 40 + r() * (W - 80); sp.beginPath(); sp.moveTo(x, 20); sp.lineTo(x + 30 + r() * 20, H - 20); sp.stroke(); }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); const f0 = P(0, H, 0); g.translate(f0[0], f0[1]); g.drawImage(sp.canvas, 8, 10, W - 16, H - 20); g.restore();
  poly(g, [P(W, 0, 0), P(W, 0, D), P(W, H, D), P(W, H, 0)], '#8E3A2E');
  const L = o.label || labelArt(), t0 = P(0, H, D); g.save(); g.transform(W / L.width, 0, -D * BOX.kx / L.height, D * BOX.ky / L.height, t0[0], t0[1]); g.drawImage(L, 0, 0); g.restore();
  g.save(); g.globalCompositeOperation = 'multiply'; const sh = g.createLinearGradient(...P(0, H, D), ...P(W, H, 0)); sh.addColorStop(0, 'rgba(160,170,210,1)'); sh.addColorStop(1, 'rgba(255,240,225,1)'); poly(g, [P(0, H, 0), P(W, H, 0), P(W, H, D), P(0, H, D)], sh); g.restore();
  g.strokeStyle = 'rgba(40,20,15,.6)'; g.lineWidth = 2; [[P(0, H, 0), P(W, H, 0)], [P(W, H, 0), P(W, H, D)], [P(W, 0, 0), P(W, H, 0)]].forEach(([a, b]) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); });
  return P;
}
/* 抽屉里一排火柴头（睡觉的）；k 是他的位置 */
function drawerMatches(g, P, pull, o = {}) {
  const n = 9, { D, H } = BOX;
  for (let i = n - 1; i >= 0; i--) {
    const z = 30 + i * (D - 60) / (n - 1), isHim = i === o.him, up = isHim ? 70 : 0;
    const p0 = P(BOX.W - 40, 24, z), p1 = P(BOX.W + pull - 40, 24 + up, z);
    if (isHim) continue;
    stick(g, p0[0], p0[1], p1[0], p1[1], 18);
    const hx = p1[0] + 14, hy = p1[1] - 2; g.save(); const gr = g.createRadialGradient(hx - 6, hy - 6, 2, hx, hy, 26); gr.addColorStop(0, '#D2363A'); gr.addColorStop(1, '#6A141A'); g.fillStyle = gr; g.beginPath(); g.ellipse(hx, hy, 26, 20, 0, 0, 7); g.fill(); g.strokeStyle = '#1A0A0C'; g.lineWidth = 2.4; g.lineCap = 'round'; [-8, 8].forEach(d => { g.beginPath(); g.arc(hx + d, hy - 2, 4, .2 * Math.PI, .8 * Math.PI); g.stroke(); }); g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(hx - 9, hy - 9, 7, 4, -.4, 0, 7); g.fill(); g.restore();
    if (i % 3 === 1) { g.fillStyle = 'rgba(220,230,255,.8)'; g.font = '700 22px "Noto Serif SC"'; g.fillText('z', hx + 24, hy - 26); g.font = '700 16px "Noto Serif SC"'; g.fillText('z', hx + 36, hy - 40); }
  }
}
/* ---------- 窗户：外面冷，里面暖 ---------- */
function warmWindow(g, x, y, w, h, o = {}) {
  const inner = cv2(); const c = inner;
  const bgr = c.createLinearGradient(0, y, 0, y + h); bgr.addColorStop(0, '#5A2E1C'); bgr.addColorStop(1, '#2A140E'); c.fillStyle = bgr; c.fillRect(x, y, w, h);
  glow(c, x + w * .25, y + h * .75, h * .7, 'rgba(255,140,60,.8)');
  c.fillStyle = '#1E4A30'; c.beginPath(); c.moveTo(x + w * .72, y + h * .1); c.lineTo(x + w * .92, y + h * .85); c.lineTo(x + w * .52, y + h * .85); c.fill();
  const r = rng(5); for (let i = 0; i < 40; i++) { const t = r(), yy = y + h * (.15 + t * .7), ww = w * .2 * t; glow(c, x + w * .72 + (r() - .5) * 2 * ww, yy, 18 + r() * 14, ['rgba(255,90,90,.9)', 'rgba(255,210,90,.9)', 'rgba(110,220,130,.9)', 'rgba(110,180,255,.9)'][i % 4]); }
  glow(c, x + w * .72, y + h * .1, 60, 'rgba(255,230,140,.9)');
  if (o.inside) o.inside(c);
  g.save(); g.filter = `blur(${o.blur ?? 10}px)`; g.drawImage(inner.canvas, 0, 0); g.restore();
  // 玻璃边上的霜
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); const fr = g.createRadialGradient(x + w / 2, y + h / 2, Math.min(w, h) * .3, x + w / 2, y + h / 2, Math.max(w, h) * .62); fr.addColorStop(0, 'rgba(230,240,255,0)'); fr.addColorStop(1, 'rgba(230,240,255,.55)'); g.fillStyle = fr; g.fillRect(x, y, w, h);
  g.strokeStyle = 'rgba(240,248,255,.35)'; g.lineWidth = 1.2; for (let i = 0; i < 60; i++) { let px = r() < .5 ? x + r() * w : (r() < .5 ? x : x + w), py = r() < .5 ? y + r() * h : (r() < .5 ? y : y + h), a = Math.atan2(y + h / 2 - py, x + w / 2 - px) + (r() - .5); g.beginPath(); g.moveTo(px, py); for (let k = 0; k < 6; k++) { px += Math.cos(a) * 14; py += Math.sin(a) * 14; g.lineTo(px, py); g.moveTo(px, py); g.lineTo(px + Math.cos(a + .8) * 8, py + Math.sin(a + .8) * 8); g.moveTo(px, py); a += (r() - .5) * .5; } g.stroke(); }
  g.restore();
}
function windowFrame(g, x, y, w, h, t = 34) { const col = '#3A2418'; g.fillStyle = col; g.fillRect(x - t, y - t, w + 2 * t, t); g.fillRect(x - t, y + h, w + 2 * t, t); g.fillRect(x - t, y, t, h); g.fillRect(x + w, y, t, h); g.fillRect(x + w / 2 - t / 3, y, t * .66, h); g.fillRect(x, y + h * .48, w, t * .6); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x - t, y - t, w + 2 * t, 4); }
function snowBank(g, y, o = {}) { const gr = g.createLinearGradient(0, y - 40, 0, MH); gr.addColorStop(0, o.top || '#C9D6F0'); gr.addColorStop(.25, o.mid || '#9AAAD6'); gr.addColorStop(1, o.bot || '#4A5A94'); g.fillStyle = gr; g.beginPath(); g.moveTo(0, MH); g.lineTo(0, y); for (let x = 0; x <= MW; x += 40) g.lineTo(x, y + Math.sin(x / 170) * 14 + Math.sin(x / 61) * 5); g.lineTo(MW, MH); g.fill(); const r = rng(9); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(255,255,255,${.2 + r() * .5})`; g.fillRect(r() * MW, y + 10 + r() * (MH - y), 2, 2); } }
function lyricText(g, s, y = 990, o = {}) { g.save(); g.font = `${o.size || 68}px "ZCOOL XiaoWei"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = o.glowCol || 'rgba(255,170,80,.9)'; g.shadowBlur = 26; g.fillStyle = o.col || '#FFF1D8'; g.fillText(s, MW / 2, y); g.shadowBlur = 8; g.fillText(s, MW / 2, y); g.restore(); }
function wmark6(g) { g.save(); g.font = '40px "ZCOOL XiaoWei"'; g.textAlign = 'right'; g.fillStyle = 'rgba(0,0,0,.35)'; g.fillText('甜菜', 1878, 74); g.fillStyle = '#FFF4E0'; g.fillText('甜菜', 1876, 72); g.restore(); }

/* ============ 6a：开头（俯拍）。雪地上一盒火柴，盒面的老式火花就是片名；抽屉拉开，一排火柴都睡着，只有他醒着 ============ */
function lyingMatch(g, x, y, L, o = {}) { // 横躺的火柴，头朝右；o.awake 他
  stick(g, x, y, x + L, y, 26, '#E9C99C');
  const hx = x + L + 18, hy = y, hr = o.awake ? 34 : 30;
  g.save(); g.fillStyle = 'rgba(30,20,40,.35)'; g.filter = 'blur(5px)'; g.beginPath(); g.ellipse(hx + 6, hy + 8, hr * 1.25, hr * .95, 0, 0, 7); g.fill(); g.restore();
  g.save(); g.translate(hx, hy); g.rotate(Math.PI / 2);
  g.beginPath(); g.moveTo(0, -hr * 1.38); g.bezierCurveTo(hr * .25, -hr * 1.2, hr, -hr * .95, hr, 0); g.bezierCurveTo(hr, hr * .9, hr * .55, hr * 1.1, 0, hr * 1.1); g.bezierCurveTo(-hr * .55, hr * 1.1, -hr, hr * .9, -hr, 0); g.bezierCurveTo(-hr, -hr * .95, -hr * .3, -hr * 1.1, 0, -hr * 1.38); g.closePath();
  const hg = g.createRadialGradient(-hr * .4, -hr * .4, 2, 0, 0, hr * 1.3); hg.addColorStop(0, '#D8383C'); hg.addColorStop(.6, '#A8202A'); hg.addColorStop(1, '#5E1218'); g.fillStyle = hg; g.fill();
  g.restore();
  // 脸朝上（朝镜头）
  g.strokeStyle = '#1A0A0C'; g.fillStyle = '#1A0A0C'; g.lineWidth = 3.2; g.lineCap = 'round';
  if (o.awake) { [-1, 1].forEach(sd => { g.beginPath(); g.ellipse(hx + 2, hy + sd * 12, 5, 7, Math.PI / 2, 0, 7); g.fill(); g.fillStyle = '#FFF'; g.beginPath(); g.arc(hx, hy + sd * 12 - 2, 2, 0, 7); g.fill(); g.fillStyle = '#1A0A0C'; }); g.beginPath(); g.ellipse(hx + 16, hy, 3, 4, 0, 0, 7); g.stroke(); }
  else { [-1, 1].forEach(sd => { g.beginPath(); g.arc(hx, hy + sd * 11, 5, -.3 * Math.PI, .3 * Math.PI); g.stroke(); }); }
  [-1, 1].forEach(sd => { g.fillStyle = 'rgba(255,150,160,.5)'; g.beginPath(); g.ellipse(hx + 9, hy + sd * 21, 5, 4, 0, 0, 7); g.fill(); });
  g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(hx - 14, hy - 12, 8, 5, .4, 0, 7); g.fill();
  if (o.awake) { g.fillStyle = '#B8202C'; g.fillRect(x + L - 12, y - 22, 20, 44); g.fillStyle = '#D8323C'; g.fillRect(x + L - 10, y - 20, 16, 40); g.save(); g.translate(x + L - 4, y + 18); g.rotate(.5); g.fillStyle = '#C42A36'; g.fillRect(0, 0, 14, 46); g.restore(); }
}
FRAMES['6a'] = async (main) => {
  // 雪地
  const bg = main.createLinearGradient(0, 0, MW, MH); bg.addColorStop(0, '#C8D2EC'); bg.addColorStop(1, '#8E9CC8'); main.fillStyle = bg; main.fillRect(0, 0, MW, MH);
  const r = rng(2); for (let i = 0; i < 2600; i++) { main.fillStyle = r() < .6 ? `rgba(255,255,255,${.3 + r() * .6})` : 'rgba(80,90,150,.18)'; const s = 1 + r() * 2.5; main.fillRect(r() * MW, r() * MH, s, s); }
  main.save(); main.filter = 'blur(30px)'; for (let i = 0; i < 12; i++) { main.fillStyle = i % 2 ? 'rgba(255,255,255,.35)' : 'rgba(90,100,170,.2)'; main.beginPath(); main.ellipse(r() * MW, r() * MH, 200 + r() * 200, 80 + r() * 80, r(), 0, 7); main.fill(); } main.restore();
  // 窗户的暖光落在雪上（十字窗棂的影子）
  main.save(); main.globalCompositeOperation = 'soft-light'; main.filter = 'blur(22px)'; main.translate(1060, 470); main.rotate(-.12); main.fillStyle = 'rgba(255,150,60,1)'; [[-560, -380], [10, -380], [-560, 30], [10, 30]].forEach(([x, y]) => main.fillRect(x, y, 540, 380)); main.restore();
  main.save(); main.globalCompositeOperation = 'screen'; main.filter = 'blur(40px)'; main.translate(1060, 470); main.rotate(-.12); main.fillStyle = 'rgba(255,170,90,.32)'; [[-560, -380], [10, -380], [-560, 30], [10, 30]].forEach(([x, y]) => main.fillRect(x, y, 540, 380)); main.restore();
  // 小小的脚印，从盒子边上走出画面（以后他会走掉）
  for (let i = 0; i < 9; i++) { const x = 1420 + i * 58, y = 860 + i * 22 + (i % 2) * 18; main.fillStyle = 'rgba(70,80,140,.45)'; main.beginPath(); main.ellipse(x, y, 7, 4, .3, 0, 7); main.fill(); }
  // 火柴盒（俯拍）：外壳 + 拉出来的抽屉
  main.save(); main.translate(780, 520); main.rotate(-.07);
  const SW = 980, SHh = 600, PULL = 470;
  main.save(); main.fillStyle = 'rgba(40,40,90,.45)'; main.filter = 'blur(26px)'; main.fillRect(-SW / 2 + 30, -SHh / 2 + 40, SW + PULL, SHh); main.restore();
  // 抽屉
  const DX = SW / 2 - 80, DW = PULL + 80;
  main.fillStyle = '#C9AE82'; main.fillRect(DX, -SHh / 2 + 22, DW, SHh - 44); main.fillStyle = '#E2CDA4'; main.fillRect(DX + 12, -SHh / 2 + 34, DW - 24, SHh - 68);
  for (let i = 0; i < 40; i++) { main.strokeStyle = 'rgba(150,120,80,.25)'; main.lineWidth = 1; main.beginPath(); main.moveTo(DX + 12, -SHh / 2 + 40 + i * 13); main.lineTo(DX + DW - 12, -SHh / 2 + 42 + i * 13); main.stroke(); }
  const N = 8; for (let i = 0; i < N; i++) { const y = -SHh / 2 + 82 + i * (SHh - 160) / (N - 1); lyingMatch(main, DX - 360, y, 680, { awake: i === 3 }); }
  main.fillStyle = 'rgba(220,230,255,.9)'; main.font = '700 34px "Noto Serif SC"'; [[0, 1], [2, 0], [5, 1], [7, 0]].forEach(([i, k]) => { const y = -SHh / 2 + 82 + i * (SHh - 160) / (N - 1); main.fillText('z', DX + DW - 70 + k * 14, y - 22); main.font = '700 24px "Noto Serif SC"'; main.fillText('z', DX + DW - 46 + k * 14, y - 40); main.font = '700 34px "Noto Serif SC"'; });
  main.fillStyle = '#B89A6A'; main.fillRect(DX + DW - 14, -SHh / 2 + 22, 14, SHh - 44);
  // 外壳（盖住抽屉的一半）
  main.fillStyle = '#5A3A2A'; main.fillRect(-SW / 2, SHh / 2 - 6, SW, 30); const sp = rng(4); for (let i = 0; i < 1600; i++) { main.fillStyle = sp() < .5 ? 'rgba(0,0,0,.35)' : 'rgba(255,200,150,.2)'; main.fillRect(-SW / 2 + sp() * SW, SHh / 2 - 6 + sp() * 30, 2, 2); }
  main.drawImage(labelArt(), -SW / 2, -SHh / 2, SW, SHh);
  main.strokeStyle = 'rgba(60,30,20,.5)'; main.lineWidth = 3; main.strokeRect(-SW / 2, -SHh / 2, SW, SHh);
  // 盒子上落的雪
  for (let i = 0; i < 60; i++) { const x = -SW / 2 + sp() * SW, y = -SHh / 2 + sp() * 40 * (sp() < .5 ? 1 : 0) + (sp() < .3 ? SHh - 30 : 0); main.fillStyle = 'rgba(255,255,255,.85)'; main.beginPath(); main.arc(x, y, 2 + sp() * 4, 0, 7); main.fill(); }
  main.restore();
  // 松枝、红球、一张写了字的小纸条（"别走"）—— 后面才知道是谁写的
  main.save(); main.translate(1760, 70); main.rotate(.35); main.strokeStyle = '#3A2414'; main.lineWidth = 10; main.beginPath(); main.moveTo(-260, 0); main.lineTo(240, 0); main.stroke(); for (let i = -24; i < 24; i++) { const x = i * 10; [-1, 1].forEach(sd => { main.strokeStyle = i % 2 ? '#1E5A3E' : '#2A7050'; main.lineWidth = 5; main.beginPath(); main.moveTo(x, 0); main.lineTo(x + 24, sd * (60 - Math.abs(i) * 1.6)); main.stroke(); }); } main.restore();
  const bb = main.createRadialGradient(1700, 900, 8, 1720, 920, 70); bb.addColorStop(0, '#FF9A9A'); bb.addColorStop(.5, '#D02030'); bb.addColorStop(1, '#6A0A12'); main.save(); main.fillStyle = 'rgba(40,40,90,.4)'; main.filter = 'blur(10px)'; main.beginPath(); main.arc(1740, 950, 66, 0, 7); main.fill(); main.restore(); main.fillStyle = bb; main.beginPath(); main.arc(1720, 920, 64, 0, 7); main.fill(); main.fillStyle = '#D8C070'; main.fillRect(1706, 846, 28, 16);
  // 落下来的雪（离镜头近的虚）
  flakes(main, 3, 160, { col: '#FFFFFF' }); bigFlakes(main, 8, 12);
  vignette(main, .5, '20,24,60'); grain(main, .05);
  main.save(); main.font = '34px "ZCOOL XiaoWei"'; main.fillStyle = '#FFFFFF'; main.shadowColor = 'rgba(30,30,80,.6)'; main.shadowBlur = 8; main.fillText('周杰伦《爱情废柴》', 70, 1030); main.restore();
  main.save(); main.font = '40px "ZCOOL XiaoWei"'; main.textAlign = 'right'; main.fillStyle = '#FFFFFF'; main.shadowColor = 'rgba(30,30,80,.6)'; main.shadowBlur = 8; main.fillText('甜菜', 1876, 72); main.restore();
};

/* ============ 6b：主歌"我叛逆点起一根烟"。他在火柴盒上一划，脑袋烧起来；火光照亮的那一圈玻璃上，看见去年的圣诞 ============ */
FRAMES['6b'] = async (main) => {
  const scene = cv2();
  const bg = scene.createLinearGradient(0, 0, 0, MH); bg.addColorStop(0, '#1A1E3A'); bg.addColorStop(1, '#2A2E50'); scene.fillStyle = bg; scene.fillRect(0, 0, MW, MH);
  // 去年的圣诞（画在窗玻璃里，等一下只有火光照到的地方才看得见）
  warmWindow(scene, 120, 0, 1500, 720, { blur: 3, inside: c => {
    c.fillStyle = '#6A3A22'; c.fillRect(380, 470, 900, 30); c.fillStyle = '#4A2A18'; c.fillRect(420, 500, 30, 220); c.fillRect(1210, 500, 30, 220);
    c.fillStyle = '#F4EAD8'; c.beginPath(); c.ellipse(830, 468, 120, 22, 0, 0, 7); c.fill(); c.fillStyle = '#E8B0B8'; c.fillRect(760, 380, 140, 86); c.fillStyle = '#FFF6EA'; c.fillRect(760, 380, 140, 18); for (let i = 0; i < 4; i++) { c.fillStyle = '#FFFFFF'; c.fillRect(780 + i * 32, 352, 8, 30); flame(c, 784 + i * 32, 352, 30); } c.fillStyle = '#C42A36'; c.beginPath(); c.arc(830, 420, 12, 0, 7); c.fill();
    matchMan(c, 600, 470, 260, { eyes: 'happy', mouth: 'smile', arms: 'wave' }); candleGirl(c, 1060, 470, 210, { eyes: 'happy' });
    c.fillStyle = 'rgba(255,90,110,.9)'; c.font = '60px serif'; c.fillText('♥', 800, 300);
  } });
  windowFrame(scene, 120, 0, 1500, 720);
  scene.fillStyle = '#2E1C14'; scene.fillRect(0, 720, MW, 46); scene.fillStyle = '#4A2E20'; scene.fillRect(0, 714, MW, 10);
  snowBank(scene, 760, { top: '#DCE4F6', mid: '#A9B6DA', bot: '#4A5A94' });
  matchbox(scene, 1180, 940, { pull: 0, strikes: 5 });
  // 冷色版和暖色版
  const cold = cv2(); cold.drawImage(scene.canvas, 0, 0); cold.globalCompositeOperation = 'multiply'; cold.fillStyle = '#3A4A88'; cold.fillRect(0, 0, MW, MH); cold.globalCompositeOperation = 'source-over';
  const warm = cv2(); warm.drawImage(scene.canvas, 0, 0); warm.globalCompositeOperation = 'multiply'; warm.fillStyle = '#FFC890'; warm.fillRect(0, 0, MW, MH); warm.globalCompositeOperation = 'source-over';
  const FX = 930, FY = 640;
  const m = cv2(); const mg = m.createRadialGradient(FX, FY - 100, 60, FX, FY - 100, 640); mg.addColorStop(0, 'rgba(0,0,0,1)'); mg.addColorStop(.6, 'rgba(0,0,0,.9)'); mg.addColorStop(1, 'rgba(0,0,0,0)'); m.fillStyle = mg; m.fillRect(0, 0, MW, MH);
  warm.globalCompositeOperation = 'destination-in'; warm.drawImage(m.canvas, 0, 0);
  main.drawImage(cold.canvas, 0, 0); main.drawImage(warm.canvas, 0, 0);
  // 他：刚在擦火皮上划了一下，头烧起来了
  const me = matchMan(main, FX, 960, 420, { state: 'lit', eyes: 'wide', mouth: 'o', arms: 'strike', lean: -.08, sway: -18 });
  // 划过的火星
  const r = rng(3); main.save(); main.globalCompositeOperation = 'lighter'; for (let i = 0; i < 70; i++) { const a = -2.4 + r() * 2.2, d = 60 + r() * 330, x = FX + 60 + Math.cos(a) * d, y = FY - 180 + Math.sin(a) * d * .8; main.strokeStyle = `rgba(255,${180 + r() * 60},90,${.5 + r() * .5})`; main.lineWidth = 2 + r() * 2; main.beginPath(); main.moveTo(x, y); main.lineTo(x - Math.cos(a) * 18, y - Math.sin(a) * 18); main.stroke(); } main.restore();
  smoke(main, FX - 10, 420, 360, 4);
  glow(main, FX, 520, 520, 'rgba(255,150,60,.35)');
  flakes(main, 5, 220); bigFlakes(main, 9, 8);
  vignette(main, .6); grain(main, .06);
  lyricText(main, '我叛逆点起一根烟', 1010);
  wmark6(main);
};

/* ============ 6c：副歌"我承认我是爱情里的废柴"。雪地上插满烧过的火柴，围成一颗心；他烧黑了，坐在中间；窗里她还亮着 ============ */
FRAMES['6c'] = async (main) => {
  const bg = main.createLinearGradient(0, 0, 0, MH); bg.addColorStop(0, '#0A0E26'); bg.addColorStop(1, '#1A2048'); main.fillStyle = bg; main.fillRect(0, 0, MW, MH);
  // 远处的窗：她在里面，亮着
  warmWindow(main, 1240, 70, 520, 420, { blur: 2.5, inside: c => { c.fillStyle = '#5A3220'; c.fillRect(1260, 410, 480, 26); candleGirl(c, 1500, 412, 250, { eyes: 'happy', big: 4 }); } });
  windowFrame(main, 1240, 70, 520, 420, 22);
  glow(main, 1500, 300, 420, 'rgba(255,150,120,.25)');
  // 星星
  const rs = rng(4); for (let i = 0; i < 120; i++) { main.fillStyle = `rgba(220,230,255,${.2 + rs() * .6})`; main.fillRect(rs() * 1200, rs() * 560, 2, 2); }
  snowBank(main, 600, { top: '#AEBBE0', mid: '#7A88BC', bot: '#2E3A70' });
  // 插在雪里的火柴，围成一颗心
  const HX = 820, HY = 760, pts = [];
  for (let i = 0; i < 34; i++) { const t = i / 34 * Math.PI * 2, x = 16 * Math.pow(Math.sin(t), 3), y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)); pts.push([HX + x * 24, HY + y * 13]); }
  pts.sort((a, b) => a[1] - b[1]).forEach(([x, y], i) => { const r = rng(i + 3), lean = (r() - .5) * .3, h = 120 + r() * 30, top = [x + Math.sin(lean) * h, y - Math.cos(lean) * h];
    stick(main, x, y, top[0], top[1], 11, '#5A3A2A'); stick(main, x + (top[0] - x) * .25, y + (top[1] - y) * .25, x, y, 11, '#E9C99C');
    main.save(); main.translate(top[0], top[1]); main.rotate(lean + (r() - .5) * .8); const hg = main.createRadialGradient(-3, -4, 1, 0, 0, 16); hg.addColorStop(0, '#3A3030'); hg.addColorStop(1, '#0A0606'); main.fillStyle = hg; main.beginPath(); main.ellipse(0, 0, 11, 15, 0, 0, 7); main.fill(); if (r() < .35) { main.fillStyle = '#FF6A1A'; main.shadowColor = '#FF5010'; main.shadowBlur = 12; main.fillRect(-3, -2, 5, 3); main.shadowBlur = 0; } main.restore();
    main.fillStyle = 'rgba(240,244,255,.9)'; main.beginPath(); main.ellipse(x, y + 2, 12, 5, 0, 0, 7); main.fill();
    if (i % 5 === 0) smoke(main, top[0], top[1] - 10, 120, i);
  });
  // 空火柴盒，侧翻在雪里
  main.save(); main.translate(240, 860); main.rotate(-.12); main.scale(.5, .5); matchbox(main, 0, 0, { pull: 160, strikes: 40, inside: () => {} }); main.restore();
  main.save(); main.font = '700 30px "Noto Serif SC"'; main.fillStyle = 'rgba(255,240,220,.85)'; main.fillText('剩余 0 支', 300, 990); main.restore();
  // 他：烧黑了，坐在心中间
  matchMan(main, HX, 850, 380, { state: 'burnt', eyes: 'sad2', mouth: 'frown', arms: 'knees', sit: 1 });
  glow(main, HX, 620, 260, 'rgba(255,110,40,.12)');
  flakes(main, 7, 240); bigFlakes(main, 12, 7);
  vignette(main, .65); grain(main, .06);
  main.save(); main.font = '64px "ZCOOL XiaoWei"'; main.textAlign = 'center'; main.textBaseline = 'middle'; main.shadowColor = 'rgba(255,170,80,.7)'; main.shadowBlur = 20; main.fillStyle = '#FFF1D8'; main.fillText('我承认我是 爱情里的', MW / 2 - 70, 1010); main.restore();
  main.save(); main.font = '900 92px "Noto Serif SC"'; main.textAlign = 'left'; main.textBaseline = 'middle'; const tx = MW / 2 - 70 + 330; main.fillStyle = '#1E3A6E'; main.fillText('废柴', tx + 5, 1015); main.fillStyle = '#D23A32'; main.fillText('废柴', tx, 1010); main.restore();
  wmark6(main);
};
