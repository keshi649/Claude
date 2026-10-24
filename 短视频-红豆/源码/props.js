'use strict';
/* props.js —— 道具：玻璃罐（红豆 + 卷起来的纸条）、纸条（手写字）、杯子、桌椅、窗、窗帘、路灯、雪人、篝火、
   沙漏（里面流的是红豆）、锅和灶、碗和勺、行李箱、风筝、长椅、相框、唱片机、纸船、开花的雪花。
   大小都按 sc（倍数）给，坐标是底部中心（除非另说） */

/* 开花的雪花：b 0..1 花开了多少；六瓣，中间一点淡粉 */
function bloomFlake(g, x, y, r, rot, b, a = 1, col = '#FFFFFF') {
  if (a <= .01) return;
  withAlpha(g, a, () => {
    g.save(); g.translate(x, y); g.rotate(rot);
    if (b < .15) { g.fillStyle = col; circ(g, 0, 0, r * .45); g.fill(); }
    else {
      const pr = r * (.35 + .65 * b);
      g.fillStyle = col;
      for (let i = 0; i < 6; i++) { g.save(); g.rotate(i * TAU / 6); ell(g, 0, -pr * .55, pr * .28, pr * .55); g.fill(); g.restore(); }
      g.fillStyle = mixc(col, '#FFC9D2', b); circ(g, 0, 0, pr * .22); g.fill();
    }
    g.restore();
  });
}
/* 一片会开花的雪：n 片，在 box 里落；bloomAt(y 比例) 落到哪儿开花 */
function bloomSnow(g, s, seed, n, box, o = {}) {
  const ps = floaters(s, seed, n, box, { vy: -(o.vy ?? 70), amp: o.amp ?? 30, wob: .6, vx: o.vx ?? 10 });
  for (const p of ps) {
    const r = (o.r ?? 7) * (.5 + p.sz * 1.1);
    const yy = (p.y - box[1]) / (box[3] - box[1]);
    const b = o.bloom != null ? o.bloom : sstep(.25 + hash(p.i, seed) * .3, .7, yy) * (o.bloomK ?? 1);
    bloomFlake(g, p.x, p.y, r, p.ph + s * .3, b, (o.a ?? .9) * (.5 + p.sz * .5), o.col);
  }
}

/* 玻璃罐：x, y 底部中心；sc 倍数（sc=1 时罐子高 200）；fill 红豆装了多少（0..1）；slips 纸条卷几根；o.lid 盖子 */
function jar(g, x, y, sc, o = {}) {
  const w = 130 * sc, h = 200 * sc, fill = o.fill ?? .35, slips = o.slips ?? 3;
  g.save(); g.translate(x, y);
  // 后壁
  g.fillStyle = rgba('#DDEBF0', .14); rr(g, -w / 2, -h, w, h, 18 * sc); g.fill();
  // 红豆
  const fh = h * .92 * fill;
  if (fh > 1) {
    g.save(); rr(g, -w / 2 + 5 * sc, -h + 6 * sc, w - 10 * sc, h - 10 * sc, 14 * sc); g.clip();
    g.fillStyle = RED_D; g.fillRect(-w / 2, -fh - 4 * sc, w, fh + 4 * sc);
    const rs = R(o.seed || 7), nb = Math.floor(30 + w * fh / (90 * sc * sc) * .9);
    for (let i = 0; i < nb; i++) {
      const bx = (rs() - .5) * (w - 12 * sc), by = -rs() * fh;
      bean(g, bx, by, 8.5 * sc, rs() * 6, { light: '#EE4458' });
    }
    // 豆子顶上一层
    for (let i = 0; i < 16; i++) bean(g, (rs() - .5) * (w - 16 * sc), -fh + (rs() - .5) * 6 * sc, 8.5 * sc, rs() * 6);
    g.restore();
  }
  // 纸条卷：插在豆子里，系着红线
  const rs2 = R(o.seed2 || 3);
  for (let i = 0; i < slips; i++) {
    const sx = (rs2() - .5) * (w - 40 * sc), ang = (rs2() - .5) * .7, sl = (70 + rs2() * 40) * sc;
    const by = -Math.max(fh, 20 * sc) + 10 * sc;
    g.save(); g.translate(sx, by); g.rotate(ang);
    g.fillStyle = '#F4EBDA'; rr(g, -8 * sc, -sl, 16 * sc, sl, 7 * sc); g.fill();
    g.fillStyle = '#E1D3B9'; g.fillRect(-8 * sc, -sl + 6 * sc, 3 * sc, sl - 12 * sc);
    g.fillStyle = RED; g.fillRect(-8.5 * sc, -sl * .55, 17 * sc, 3.5 * sc);
    g.restore();
  }
  // 前壁：玻璃高光
  g.strokeStyle = rgba('#FFFFFF', .55); g.lineWidth = 3.5 * sc; rr(g, -w / 2, -h, w, h, 18 * sc); g.stroke();
  g.fillStyle = rgba('#FFFFFF', .28); rr(g, -w / 2 + 12 * sc, -h + 20 * sc, 12 * sc, h - 50 * sc, 6 * sc); g.fill();
  g.fillStyle = rgba('#FFFFFF', .14); rr(g, w / 2 - 22 * sc, -h + 30 * sc, 7 * sc, h * .4, 4 * sc); g.fill();
  // 瓶口、盖子
  g.fillStyle = rgba('#E8F2F4', .5); rr(g, -w * .42, -h - 14 * sc, w * .84, 18 * sc, 6 * sc); g.fill();
  if (o.lid !== false) { g.fillStyle = '#B98B62'; rr(g, -w * .4, -h - 34 * sc, w * .8, 24 * sc, 8 * sc); g.fill(); g.fillStyle = '#A0734D'; g.fillRect(-w * .4, -h - 18 * sc, w * .8, 4 * sc); }
  // 系在瓶颈上的红线 + 小牌子
  g.strokeStyle = RED; g.lineWidth = 3 * sc; g.beginPath(); g.moveTo(-w * .43, -h - 4 * sc); g.lineTo(w * .43, -h - 4 * sc); g.stroke();
  if (o.tag !== false) {
    g.beginPath(); g.moveTo(w * .3, -h - 4 * sc); g.quadraticCurveTo(w * .42, -h + 20 * sc, w * .38, -h + 34 * sc); g.stroke();
    g.save(); g.translate(w * .38, -h + 50 * sc); g.rotate(.12); g.fillStyle = '#F6EEDF'; rr(g, -22 * sc, -16 * sc, 44 * sc, 32 * sc, 4 * sc); g.fill();
    text(g, '还没', 0, 1 * sc, 17 * sc, { k: 'hand', col: '#6B3A30' }); g.restore();
  }
  g.restore();
}

/* 纸条（摊开）：中心 x, y，宽 w；text 手写字，reveal 0..1 写到第几个字（按字数逐个出现）；o.rot */
function slip(g, x, y, w, txt, reveal = 1, o = {}) {
  const h = w * .32;
  g.save(); g.translate(x, y); g.rotate(o.rot || 0);
  g.fillStyle = 'rgba(40,20,10,.18)'; rr(g, -w / 2 + 6, -h / 2 + 8, w, h, 6); g.fill();
  g.fillStyle = '#F7EFDF'; rr(g, -w / 2, -h / 2, w, h, 6); g.fill();
  g.globalAlpha *= .5; g.drawImage(TEX.paper, -w / 2, -h / 2, w, h); g.globalAlpha /= .5;
  g.strokeStyle = rgba('#C9B79A', .7); g.lineWidth = 1.5; g.beginPath(); g.moveTo(-w * .42, h * .28); g.lineTo(w * .42, h * .28); g.stroke();
  // 左上角一颗小红豆印章
  bean(g, -w / 2 + h * .32, -h / 2 + h * .3, h * .1, -.5);
  const chars = [...txt], n = chars.length, px = Math.min(h * .52, w * .82 / n);
  const shown = reveal * n;
  g.font = F(px, 'hand'); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#4A2A24';
  const x0 = -(n - 1) * px * .5 + h * .08;
  for (let i = 0; i < n; i++) {
    const a = clamp(shown - i);
    if (a <= 0) break;
    g.globalAlpha = a; g.fillText(chars[i], x0 + i * px, 0 + Math.sin(i * 1.7) * px * .04);
  }
  g.globalAlpha = 1;
  if (o.check) {   // 打钩
    const c = clamp(o.check);
    g.strokeStyle = RED; g.lineWidth = h * .07; g.lineCap = 'round'; g.beginPath();
    const p0 = [w * .36, -h * .02], p1 = [w * .41, h * .14], p2 = [w * .52, -h * .22];
    g.moveTo(p0[0], p0[1]); if (c < .4) g.lineTo(lerp(p0[0], p1[0], c / .4), lerp(p0[1], p1[1], c / .4)); else { g.lineTo(p1[0], p1[1]); g.lineTo(lerp(p1[0], p2[0], (c - .4) / .6), lerp(p1[1], p2[1], (c - .4) / .6)); }
    g.stroke();
  }
  g.restore();
}
/* 卷起来的纸条（小卷，系红线） */
function slipRoll(g, x, y, l, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = '#F4EBDA'; rr(g, -l / 2, -l * .11, l, l * .22, l * .1); g.fill();
  g.fillStyle = '#E1D3B9'; g.fillRect(-l / 2 + l * .08, -l * .11, l * .05, l * .22);
  g.fillStyle = RED; g.fillRect(-l * .04, -l * .12, l * .08, l * .24);
  g.restore();
}

/* 马克杯：底部中心，sc；steam 冒热气 */
function mug(g, x, y, sc, col = '#E9E1D3', s = 0, steam = 1) {
  g.save(); g.translate(x, y);
  g.fillStyle = shade(col, .85); g.lineWidth = 7 * sc; g.strokeStyle = shade(col, .85);
  g.beginPath(); g.arc(30 * sc, -30 * sc, 14 * sc, -1.3, 1.3); g.stroke();
  g.fillStyle = col; rr(g, -28 * sc, -62 * sc, 56 * sc, 62 * sc, 8 * sc); g.fill();
  g.fillStyle = shade(col, .78); ell(g, 0, -62 * sc, 28 * sc, 7 * sc); g.fill();
  g.fillStyle = RED; circ(g, -6 * sc, -32 * sc, 5 * sc); g.fill();
  g.restore();
  if (steam > 0) steamWisps(g, x, y - 66 * sc, 40 * sc, s, steam);
}
function steamWisps(g, x, y, h, s, a = 1, n = 3) {
  g.save(); g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const ph = s * 1.2 + i * 2.1, k = (ph % 1);
    g.strokeStyle = `rgba(255,255,255,${.35 * a * Math.sin(Math.PI * ((s * .6 + i / n) % 1))})`; g.lineWidth = h * .1;
    g.beginPath();
    for (let j = 0; j <= 10; j++) { const u = j / 10, yy = y - u * h * 1.6, xx = x + (i - 1) * h * .25 + Math.sin(u * 5 + s * 2 + i) * h * .15 * u; j ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
    g.stroke(); void k;
  }
  g.restore();
}

/* 窗户：x, y 左上角，w, h；outside(g) 画窗外（会被裁在窗框里）；o.frame 窗框颜色，o.open 窗帘拉开多少 */
function windowFrame(g, x, y, w, h, outside, o = {}) {
  const fr = o.frame || '#E9E1D3', t = o.t ?? 14;
  g.save(); rr(g, x, y, w, h, 4); g.clip(); outside(g, x, y, w, h); g.restore();
  // 玻璃的反光
  g.fillStyle = 'rgba(255,255,255,.05)'; poly(g, [[x + w * .1, y + h], [x + w * .35, y], [x + w * .5, y], [x + w * .25, y + h]]); g.fill();
  if (o.frost) { g.fillStyle = rgrad(g, x + w / 2, y + h / 2, Math.min(w, h) * .3, Math.max(w, h) * .75, [[0, 'rgba(255,255,255,0)'], [1, `rgba(235,245,255,${o.frost})`]]); g.fillRect(x, y, w, h); }
  g.fillStyle = fr;
  g.fillRect(x - t, y - t, w + 2 * t, t); g.fillRect(x - t, y + h, w + 2 * t, t * 1.6); g.fillRect(x - t, y, t, h); g.fillRect(x + w, y, t, h);
  g.fillRect(x + w / 2 - t * .4, y, t * .8, h); g.fillRect(x, y + h * .45 - t * .4, w, t * .8);
  g.fillStyle = shade(fr, .85); g.fillRect(x - t * 1.6, y + h + t * 1.6 - 2, w + t * 3.2, t * .9);   // 窗台
}
function curtain(g, x, y, w, h, col, side = 1, s = 0, wind = 0) {
  g.save(); g.fillStyle = col;
  g.beginPath(); g.moveTo(x, y);
  const n = 5;
  for (let i = 0; i <= n; i++) { const u = i / n; g.lineTo(x + side * w * u, y + Math.sin(u * 7) * 3); }
  const bw = w * (1 + wind * .3 * Math.sin(s * 1.3));
  g.quadraticCurveTo(x + side * bw * .8, y + h * .6, x + side * (bw * .7 + Math.sin(s * 1.1) * wind * 20), y + h);
  g.lineTo(x, y + h); g.closePath(); g.fill();
  g.strokeStyle = rgba('#000000', .08); g.lineWidth = 3; g.beginPath();
  for (let i = 1; i < 4; i++) { g.moveTo(x + side * w * i / 4.5, y + 4); g.quadraticCurveTo(x + side * w * i / 4, y + h * .6, x + side * w * i / 4.2 * .9, y + h); }
  g.stroke(); g.restore();
}
/* 路灯：x, y 底部；on 亮度 */
function streetLamp(g, x, y, sc, on = 1, col = '#FFD79A') {
  g.save(); g.translate(x, y);
  g.fillStyle = '#2E3344'; g.fillRect(-5 * sc, -330 * sc, 10 * sc, 330 * sc); rr(g, -14 * sc, -18 * sc, 28 * sc, 18 * sc, 4 * sc); g.fill();
  g.beginPath(); g.moveTo(0, -330 * sc); g.quadraticCurveTo(10 * sc, -360 * sc, 40 * sc, -356 * sc); g.lineWidth = 7 * sc; g.strokeStyle = '#2E3344'; g.stroke();
  g.fillStyle = '#2E3344'; poly(g, [[22 * sc, -360 * sc], [58 * sc, -360 * sc], [64 * sc, -340 * sc], [16 * sc, -340 * sc]]); g.fill();
  g.fillStyle = mixc('#5A5040', col, on); ell(g, 40 * sc, -338 * sc, 20 * sc, 6 * sc); g.fill();
  g.restore();
  if (on > 0) {
    // 光锥
    g.save(); g.globalCompositeOperation = 'screen';
    const lx = x + 40 * sc, ly = y - 338 * sc;
    g.fillStyle = lgrad(g, lx, ly, lx, y, [[0, rgba(col, .38 * on)], [1, rgba(col, .03 * on)]]);
    poly(g, [[lx - 16 * sc, ly], [lx + 16 * sc, ly], [lx + 150 * sc, y], [lx - 150 * sc, y]]); g.fill();
    g.restore();
    glow(g, x + 40 * sc, y - 336 * sc, 120 * sc, col, .7 * on);
    g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = rgrad(g, x + 40 * sc, y, 0, 190 * sc, [[0, rgba(col, .35 * on)], [1, rgba(col, 0)]]);
    g.save(); g.translate(x + 40 * sc, y); g.scale(1, .25); g.beginPath(); g.arc(0, 0, 190 * sc, 0, TAU); g.restore(); g.fill(); g.restore();
  }
}
/* 雪人：两颗红豆当眼睛；melt 0..1 化了多少；eyesDrop 眼睛掉下来 */
function snowman(g, x, y, sc, melt = 0, s = 0, o = {}) {
  const m = clamp(melt);
  g.save(); g.translate(x, y);
  const r1 = 62 * sc * (1 - m * .35), r2 = 44 * sc * (1 - m * .5), sq = 1 - m * .45;
  g.fillStyle = rgba('#B8D0E8', .5); ell(g, 0, 0, r1 * 1.3 + m * 70 * sc, 10 * sc + m * 6 * sc); g.fill();   // 地上的水 / 影子
  g.fillStyle = '#F3F6FA'; ell(g, 0, -r1 * sq, r1 * (1 + m * .25), r1 * sq); g.fill();
  const hy = -r1 * sq * 2 - r2 * sq * .85;
  if (m < .95) { ell(g, m * 10 * sc, hy, r2 * (1 + m * .2), r2 * sq); g.fill(); }
  g.fillStyle = rgba('#AFC3DA', .5); ell(g, 10 * sc, -r1 * sq * .6, r1 * .7, r1 * sq * .4); g.fill();
  // 红围巾（小块）
  if (m < .9) { g.fillStyle = RED; rr(g, -r2 * .9, hy + r2 * sq * .65, r2 * 1.8, 12 * sc, 5 * sc); g.fill(); g.fillRect(r2 * .3, hy + r2 * sq * .7, 12 * sc, 34 * sc * (1 - m)); }
  // 眼睛：红豆
  const drop = clamp(o.eyesDrop ?? (m > .6 ? (m - .6) / .4 : 0));
  for (const ex of [-14, 14]) {
    const ey0 = hy - 6 * sc, ey1 = 0;
    const yy = lerp(ey0, ey1 - 4 * sc, E.in2(drop)), xx = ex * sc * (1 + drop * .8) + m * 10 * sc;
    bean(g, xx, yy, 7 * sc, .3 + drop * 2 * Math.sign(ex));
  }
  // 树枝胳膊
  if (m < .7) { g.strokeStyle = '#5A4434'; g.lineWidth = 4 * sc; g.lineCap = 'round'; g.beginPath(); g.moveTo(-r1 * .8, -r1 * 1.3 * sq); g.lineTo(-r1 * 1.6, -r1 * 1.9 * sq); g.moveTo(r1 * .8, -r1 * 1.3 * sq); g.lineTo(r1 * 1.55, -r1 * 1.75 * sq + Math.sin(s * 2) * 3); g.stroke(); }
  g.restore();
}
/* 篝火：x, y 底部 */
function campfire(g, x, y, sc, s) {
  g.save(); g.translate(x, y);
  g.fillStyle = '#4A3428'; for (const a of [-.4, .4, 0]) { g.save(); g.rotate(a); rr(g, -50 * sc, -8 * sc, 100 * sc, 14 * sc, 6 * sc); g.fill(); g.restore(); }
  for (let i = 0; i < 3; i++) {
    const fl = 1 + Math.sin(s * 9 + i * 2) * .12 + Math.sin(s * 13.7 + i) * .08, w = (34 - i * 9) * sc, h = (90 - i * 22) * sc * fl;
    g.fillStyle = ['#F2683C', '#FFB04A', '#FFE7A0'][i];
    g.beginPath(); g.moveTo(-w, -4 * sc); g.quadraticCurveTo(-w * 1.1, -h * .5, Math.sin(s * 6 + i) * 8 * sc, -h); g.quadraticCurveTo(w * 1.1, -h * .5, w, -4 * sc); g.closePath(); g.fill();
  }
  g.restore();
  glow(g, x, y - 40 * sc, 380 * sc, '#FF9A50', .55 + Math.sin(s * 7) * .05);
  // 火星
  for (const p of floaters(s, 33, 12, [x - 60 * sc, y - 260 * sc, x + 60 * sc, y - 40 * sc], { vy: 70, amp: 18, wob: 2 })) {
    g.fillStyle = `rgba(255,200,120,${.8 * p.tw})`; circ(g, p.x, p.y, 2 * sc); g.fill();
  }
}
/* 沙漏：中心 x, y；sc（sc=1 高 300）；u 0..1 流了多少；里面是红豆 */
function hourglass(g, x, y, sc, u, s) {
  const h = 300 * sc, w = 150 * sc;
  g.save(); g.translate(x, y);
  // 木架
  g.fillStyle = '#7A5638'; rr(g, -w * .7, -h / 2 - 18 * sc, w * 1.4, 22 * sc, 6 * sc); g.fill(); rr(g, -w * .7, h / 2 - 4 * sc, w * 1.4, 22 * sc, 6 * sc); g.fill();
  g.fillRect(-w * .62, -h / 2, 10 * sc, h); g.fillRect(w * .62 - 10 * sc, -h / 2, 10 * sc, h);
  // 玻璃形状
  const glass = () => { g.beginPath(); g.moveTo(-w / 2, -h / 2 + 4 * sc); g.bezierCurveTo(-w / 2, -h * .1, -w * .06, -h * .06, -w * .05, 0); g.bezierCurveTo(-w * .06, h * .06, -w / 2, h * .1, -w / 2, h / 2 - 4 * sc); g.lineTo(w / 2, h / 2 - 4 * sc); g.bezierCurveTo(w / 2, h * .1, w * .06, h * .06, w * .05, 0); g.bezierCurveTo(w * .06, -h * .06, w / 2, -h * .1, w / 2, -h / 2 + 4 * sc); g.closePath(); };
  g.fillStyle = rgba('#DDEBF0', .16); glass(); g.fill();
  g.save(); glass(); g.clip();
  const rs = R(5);
  // 上半：剩下的豆子（从下往上装）
  const topH = (h / 2 - 20 * sc) * (1 - u);
  for (let i = 0; i < 70; i++) { const bx = (rs() - .5) * w, by = -rs() * topH - 8 * sc; if (Math.abs(bx) < w * .5 * (.2 + Math.abs(by) / (h * .5))) bean(g, bx, by, 6.5 * sc, rs() * 6); }
  // 下半：堆起来的
  const botH = (h / 2 - 20 * sc) * u;
  for (let i = 0; i < 90; i++) { const bx = (rs() - .5) * w, by = h / 2 - 8 * sc - rs() * botH * (1 - Math.abs(bx) / w * .9); bean(g, bx, by, 6.5 * sc, rs() * 6); }
  // 中间往下掉的一串
  if (u > 0 && u < 1) for (let i = 0; i < 6; i++) { const k = ((s * 2.2 + i / 6) % 1); bean(g, Math.sin(i * 3) * 2 * sc, lerp(0, h / 2 - botH - 10 * sc, k), 6 * sc, s * 3 + i); }
  g.restore();
  g.strokeStyle = rgba('#FFFFFF', .6); g.lineWidth = 3 * sc; glass(); g.stroke();
  g.fillStyle = rgba('#FFFFFF', .3); rr(g, -w * .4, -h * .42, 8 * sc, h * .25, 4 * sc); g.fill(); rr(g, -w * .4, h * .18, 8 * sc, h * .22, 4 * sc); g.fill();
  g.restore();
}
/* 行李箱：底部中心 */
function suitcase(g, x, y, sc, col = '#C47F5A') {
  g.save(); g.translate(x, y);
  g.fillStyle = col; rr(g, -45 * sc, -110 * sc, 90 * sc, 104 * sc, 10 * sc); g.fill();
  g.fillStyle = shade(col, .82); g.fillRect(-45 * sc, -64 * sc, 90 * sc, 6 * sc);
  g.strokeStyle = '#3A3030'; g.lineWidth = 5 * sc; g.beginPath(); g.moveTo(-14 * sc, -110 * sc); g.lineTo(-14 * sc, -150 * sc); g.lineTo(14 * sc, -150 * sc); g.lineTo(14 * sc, -110 * sc); g.stroke();
  g.fillStyle = '#2A2525'; circ(g, -30 * sc, -2 * sc, 7 * sc); g.fill(); circ(g, 30 * sc, -2 * sc, 7 * sc); g.fill();
  g.fillStyle = RED; g.fillRect(20 * sc, -100 * sc, 8 * sc, 20 * sc);
  g.restore();
}
/* 风筝：中心 x, y；红色尾巴（tail 的点由调用者算） */
function kite(g, x, y, sc, rot, s, wind = 1) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = '#F4EBDA'; poly(g, [[0, -60 * sc], [42 * sc, 0], [0, 80 * sc], [-42 * sc, 0]]); g.fill();
  g.fillStyle = RED; poly(g, [[0, -60 * sc], [42 * sc, 0], [0, 0]]); g.fill(); poly(g, [[0, 80 * sc], [-42 * sc, 0], [0, 0]]); g.fill();
  g.strokeStyle = '#7A5638'; g.lineWidth = 2.5 * sc; g.beginPath(); g.moveTo(0, -60 * sc); g.lineTo(0, 80 * sc); g.moveTo(-42 * sc, 0); g.lineTo(42 * sc, 0); g.stroke();
  // 尾巴
  g.strokeStyle = RED; g.lineWidth = 3 * sc; g.beginPath(); g.moveTo(0, 80 * sc);
  for (let i = 1; i <= 12; i++) { const k = i / 12; g.lineTo(Math.sin(s * 5 + k * 6) * 16 * sc * k - wind * k * 30 * sc, 80 * sc + k * 220 * sc); }
  g.stroke();
  for (let i = 1; i <= 4; i++) { const k = i / 4.4, px = Math.sin(s * 5 + k * 6) * 16 * sc * k - wind * k * 30 * sc, py = 80 * sc + k * 220 * sc; g.fillStyle = RED; g.save(); g.translate(px, py); g.rotate(Math.sin(s * 4 + i)); poly(g, [[-12 * sc, -6 * sc], [12 * sc, 6 * sc], [12 * sc, -6 * sc], [-12 * sc, 6 * sc]]); g.fill(); g.restore(); }
  g.restore();
}
/* 长椅：底部中心，宽 w */
function bench(g, x, y, w, sc = 1, col = '#8A6446') {
  g.save(); g.translate(x, y);
  g.fillStyle = '#3B3634'; g.fillRect(-w / 2 + 20 * sc, -62 * sc, 10 * sc, 62 * sc); g.fillRect(w / 2 - 30 * sc, -62 * sc, 10 * sc, 62 * sc);
  g.fillRect(-w / 2 + 20 * sc, -150 * sc, 8 * sc, 90 * sc); g.fillRect(w / 2 - 28 * sc, -150 * sc, 8 * sc, 90 * sc);
  g.fillStyle = col; rr(g, -w / 2, -70 * sc, w, 14 * sc, 4 * sc); g.fill(); rr(g, -w / 2 + 6 * sc, -54 * sc, w - 12 * sc, 8 * sc, 3 * sc); g.fill();
  for (let i = 0; i < 3; i++) { rr(g, -w / 2 + 4 * sc, -150 * sc + i * 26 * sc, w - 8 * sc, 14 * sc, 4 * sc); g.fill(); }
  g.restore();
}
/* 纸船：中心 x, y */
function paperBoat(g, x, y, sc, rot = 0, withBean = true) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = '#F4EBDA'; poly(g, [[-60 * sc, -10 * sc], [60 * sc, -10 * sc], [40 * sc, 16 * sc], [-40 * sc, 16 * sc]]); g.fill();
  g.fillStyle = '#E3D5BC'; poly(g, [[-30 * sc, -10 * sc], [0, -58 * sc], [30 * sc, -10 * sc]]); g.fill();
  g.fillStyle = '#EFE4D0'; poly(g, [[0, -58 * sc], [30 * sc, -10 * sc], [8 * sc, -10 * sc]]); g.fill();
  if (withBean) bean(g, -36 * sc, -18 * sc, 8 * sc, .4);
  g.restore();
}
/* 相框：中心 x, y，内框 w×h；img 是画好的画布 */
function photoFrame(g, x, y, w, h, img, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot || 0);
  g.fillStyle = 'rgba(30,15,10,.3)'; g.fillRect(-w / 2 - 10, -h / 2 - 4, w + 32, h + 32);
  g.fillStyle = o.col || '#6B4A34'; g.fillRect(-w / 2 - 18, -h / 2 - 18, w + 36, h + 36);
  g.fillStyle = '#F4EEE2'; g.fillRect(-w / 2 - 8, -h / 2 - 8, w + 16, h + 16);
  if (img) { g.filter = o.filter || 'sepia(.25) saturate(.9)'; g.drawImage(img, -w / 2, -h / 2, w, h); g.filter = 'none'; }
  g.restore();
}
