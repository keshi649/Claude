'use strict';
/* scenes2.js：远古的甜、大脑的铁律、糖油组合 */

function check(g, x, y, s, col = '#2FB36B') { g.save(); g.translate(x, y); g.scale(s, s); g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(-26, 0); g.lineTo(-8, 20); g.lineTo(28, -22); g.strokeStyle = INK; g.lineWidth = 20; g.stroke(); g.strokeStyle = col; g.lineWidth = 11; g.stroke(); g.restore(); }
function cross(g, x, y, s, col = '#E8453C') { g.save(); g.translate(x, y); g.scale(s, s); g.lineCap = 'round'; g.beginPath(); g.moveTo(-20, -20); g.lineTo(20, 20); g.moveTo(20, -20); g.lineTo(-20, 20); g.strokeStyle = INK; g.lineWidth = 20; g.stroke(); g.strokeStyle = col; g.lineWidth = 11; g.stroke(); g.restore(); }
function paperBg(g, col = '#FFF3DD') {
  g.fillStyle = col; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(200,150,90,.08)'; for (let i = 0; i < 40; i++) { circ(g, hash(i, 21) * W, hash(i, 22) * H, 20 + hash(i, 23) * 70); g.fill(); }
}
function card(g, x, y, w, h, o = {}) {
  g.fillStyle = 'rgba(0,0,0,.14)'; rr(g, x - w / 2 + 8, y - h / 2 + 12, w, h, o.r || 30); g.fill();
  rr(g, x - w / 2, y - h / 2, w, h, o.r || 30); fs(g, o.fill || '#FFFFFF', INK, o.lw || 7);
}

/* ---------- 小动物 ---------- */
function sparrow(g, x, y, s, t, flip = false) {
  g.save(); g.translate(x, y); g.scale(s * (flip ? -1 : 1), s); g.lineJoin = 'round';
  poly(g, [[-40, 0], [-80, -14], [-76, 14]]); fs(g, '#7A4B2A', INK, 4);
  ell(g, 0, 0, 46, 34); fs(g, '#A0673A', INK, 5);
  ell(g, 6, 12, 30, 18); fs(g, '#F1D9B5', null);
  const fl = Math.sin(t * 40); g.save(); g.translate(-6, -8); g.rotate(-.6 + fl * .7); ell(g, -10, -20, 20, 34, .3); fs(g, '#7A4B2A', INK, 4); g.restore();
  circ(g, 36, -20, 24); fs(g, '#A0673A', INK, 5);
  poly(g, [[56, -24], [78, -16], [56, -10]]); fs(g, '#F2A33A', INK, 4);
  circ(g, 42, -26, 4.5); fs(g, INK, null);
  g.restore();
}
function monkey(g, x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.scale(s * (o.flip ? -1 : 1), s); g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.moveTo(-40, 10); g.bezierCurveTo(-120, 10, -120, -90, -70, -80); g.stroke(); g.strokeStyle = '#8A5A34'; g.lineWidth = 9; g.stroke();
  const sw = Math.sin(t * 16) * 20;
  for (const [a, b, c, d] of [[-24, 20, -44 + sw, 70], [24, 20, 44 - sw, 70], [-30, -30, -80, -60 - sw], [30, -30, 80, -60 + sw]]) { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.strokeStyle = INK; g.lineWidth = 20; g.stroke(); g.strokeStyle = '#8A5A34'; g.lineWidth = 12; g.stroke(); }
  ell(g, 0, 0, 44, 52); fs(g, '#8A5A34', INK, 5); ell(g, 0, 10, 26, 32); fs(g, '#D9B48A', null);
  for (const sx of [-1, 1]) { circ(g, sx * 50, -84, 16); fs(g, '#D9B48A', INK, 4); }
  circ(g, 0, -80, 48); fs(g, '#8A5A34', INK, 5);
  g.beginPath(); g.moveTo(0, -60); g.bezierCurveTo(-46, -50, -46, -110, -12, -104); g.quadraticCurveTo(0, -96, 12, -104); g.bezierCurveTo(46, -110, 46, -50, 0, -60); g.closePath(); fs(g, '#F2CFAE', null);
  g.fillStyle = INK; circ(g, -14, -88, 5); g.fill(); circ(g, 14, -88, 5); g.fill();
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(-14, -70); g.quadraticCurveTo(0, -58, 14, -70); g.stroke();
  if (o.berry) berry(g, 80, -60 + sw, 12);
  g.restore();
}

/* ---------- 远古的甜 ---------- */
function pedestal(g, x, y, t, spot) {
  if (spot > 0) withAlpha(g, spot, () => {
    const gr = g.createLinearGradient(0, 200, 0, y); gr.addColorStop(0, 'rgba(255,248,210,.0)'); gr.addColorStop(1, 'rgba(255,248,210,.55)');
    g.fillStyle = gr; poly(g, [[x - 50, 180], [x + 50, 180], [x + 250, y + 30], [x - 250, y + 30]]); g.fill();
  });
  rr(g, x - 95, y + 20, 190, 330, 6); fs(g, '#F3EEE6', INK, 6);
  g.strokeStyle = 'rgba(42,35,48,.15)'; g.lineWidth = 5; for (let k = -60; k <= 60; k += 30) { g.beginPath(); g.moveTo(x + k, y + 40); g.lineTo(x + k, y + 330); g.stroke(); }
  rr(g, x - 130, y - 10, 260, 40, 8); fs(g, '#FFFFFF', INK, 6);
  rr(g, x - 140, y + 340, 280, 40, 8); fs(g, '#FFFFFF', INK, 6);
  ell(g, x, y - 26, 100, 34); fs(g, '#B3243C', INK, 6);
  g.fillStyle = 'rgba(255,255,255,.2)'; ell(g, x - 30, y - 36, 40, 10); g.fill();
  berry(g, x, y - 58, 15, '#C9374D');
  if (spot > .2) withAlpha(g, spot, () => { for (let i = 0; i < 4; i++) { const a = t * 2 + i * TAU / 4; star(g, x + Math.cos(a) * 60, y - 80 + Math.sin(a) * 26, 12, 5); fs(g, '#FFFFFF', null); } });
  g.beginPath(); g.arc(x, y - 30, 150, Math.PI, TAU); g.lineTo(x + 150, y - 10); g.lineTo(x - 150, y - 10); g.closePath();
  g.fillStyle = 'rgba(200,235,255,.22)'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 6; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 10; g.beginPath(); g.arc(x, y - 30, 120, Math.PI * 1.15, Math.PI * 1.35); g.stroke();
}
function past(g, t) {
  const tB = S('p10') - .1, tC = CK('p10', 1) - .05, tD = S('p11') - .05, tE = S('p12') - .1, tF = S('p13') - .15;
  if (t < tB) { // 博物馆里的一颗野果
    wildBack(g, t, { sun: .5 });
    g.fillStyle = 'rgba(30,20,40,.35)'; g.fillRect(0, 0, W, H);
    const on = t >= CK('p9', 1) - .1;
    pedestal(g, 660, 960, t, on ? .5 + .5 * E.out(seg(t, CK('p9', 1) - .1, CK('p9', 1) + .3)) : .25);
    for (const sx of [430, 890]) { rr(g, sx - 8, 1100, 16, 220, 8); fs(g, '#D4A93C', INK, 5); circ(g, sx, 1096, 16); fs(g, '#D4A93C', INK, 5); }
    g.strokeStyle = '#B3243C'; g.lineWidth = 14; g.beginPath(); g.moveTo(430, 1110); g.quadraticCurveTo(660, 1190, 890, 1110); g.stroke();
    person(g, { x: 230, y: 1210, s: 1.0, t, outfit: 'cave', eyes: on ? 'star' : 'wide', mouth: on ? 'o' : 'smile', blush: on ? 1 : 0, look: [6, -2], arms: { l: [20, -110], r: [36, -104] } });
    const p = pop(t, CK('p9', 1), .35);
    if (p) { g.save(); g.translate(660, 640); g.rotate(-.06); g.scale(p, p); tag(g, 0, 0, '奢侈品', 80, { fill: '#F7D774', font: 'fun' }); g.restore(); }
    tag(g, 860, 880, '野果 ×1', 40, { fill: '#FFFFFF', rot: .1, sc: pop(t, T.past + .4, .3) });
    return;
  }
  if (t < tD) { // 个头对比 → 一年只熟几周
    paperBg(g);
    const isCal = t >= tC;
    if (!isCal) {
      const p1 = pop(t, tB + .05, .35), p2 = pop(t, tB + .35, .35);
      card(g, 290, 900, 420, 640, { fill: '#F4F8EC' }); card(g, 790, 900, 420, 640, { fill: '#FFF0EE' });
      if (p1) { g.save(); g.translate(290, 860); g.scale(p1, p1); apple(g, 0, 0, .42, '#9BBF4A'); g.restore(); }
      if (p2) { g.save(); g.translate(790, 860); g.scale(p2, p2); apple(g, 0, 0, 1.55, '#E4473F'); g.restore(); }
      text(g, '野果', 290, 680, 60, INK, 'black'); text(g, '今天的水果', 790, 680, 56, INK, 'black');
      text(g, '（人工选育了几千年）', 790, 1150, 32, '#8D8496', 'bold');
      const p3 = pop(t, tB + .9, .3); if (p3) tag(g, 290, 1110, '又小又酸', 48, { sc: p3, fill: '#C6F06A', rot: -.06 });
      text(g, 'VS', 540, 900, 70, HOT, 'fun');
      return;
    }
    // 一年 52 周
    text(g, '一年 52 周，果子熟了的只有：', 540, 600, 50, INK, 'black');
    const x0 = 90, bw = 900 / 52;
    for (let i = 0; i < 52; i++) {
      const a = tC + i * .012, p = clamp((t - a) / .15); if (p <= 0) continue;
      const lit = i >= 32 && i < 36, x = x0 + i * bw;
      const glow = lit ? E.out(seg(t, tC + .4, tC + .7)) : 0;
      const h = lit ? 180 + 60 * glow : 180;
      rr(g, x + 2, 1000 - h * p, bw - 4, h * p, 4); fs(g, lit && glow > 0 ? mix('#D8D2C8', '#FF6F43', glow) : '#D8D2C8', null);
    }
    g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(x0 - 10, 1000); g.lineTo(x0 + 910, 1000); g.stroke();
    ['1月', '4月', '7月', '10月'].forEach((m, k) => text(g, m, x0 + k * 13 * bw + 20, 1040, 34, '#8D8496', 'bold'));
    const p4 = pop(t, tC + .5, .35);
    if (p4) { g.save(); g.translate(x0 + 34 * bw, 700); g.scale(p4, p4); berries(g, 0, 20, .9); tag(g, 0, -100, '几周', 52, { fill: '#FFB38A' }); g.restore(); }
    const p5 = pop(t, tC + .8, .35); if (p5) tag(g, 330, 1150, '其余时间：没有', 46, { sc: p5, fill: '#EDE7DD' });
    return;
  }
  if (t < tE) { // 跟鸟和猴子抢
    wildBack(g, t, { sun: .6 });
    const u = t - S('p11');
    const left = 6 - (u > .45 ? 1 : 0) - (u > .95 ? 1 : 0);
    bush(g, 760, 1300, 1.25, t, { berries: left, shake: (u > .35 && u < .6) || (u > .85 && u < 1.1) ? 1 : 0 });
    const mad = u > .55;
    person(g, { x: 400, y: 1205, s: 1.0, t, outfit: 'cave', eyes: mad ? 'squint' : 'wide', mouth: mad ? 'shout' : 'o', brow: mad ? 'angry' : 'up', arms: { l: [-40, -60], r: mad ? [80, -280 + Math.sin(t * 25) * 20] : [170, -80] } });
    // 鸟
    if (u > -.1 && u < 1.2) {
      let bx, by, has = u > .45;
      if (u < .45) { const k = E.in(clamp((u + .1) / .55)); bx = lerp(1200, 760, k); by = lerp(250, 1120, k); }
      else { const k = E.out(clamp((u - .45) / .7)); bx = lerp(760, -100, k); by = lerp(1120, 300, k); }
      sparrow(g, bx, by, 1.0, t, u >= .45);
      if (has) berry(g, bx + (u >= .45 ? -70 : 70), by - 10, 10);
    }
    // 猴子
    if (u > .4 && u < 1.6) {
      let mx, my, has = u > .95;
      if (u < .95) { const k = clamp((u - .4) / .55); mx = lerp(-80, 720, k); my = lerp(800, 1150, k) - Math.sin(Math.PI * k) * 300; }
      else { const k = E.in(clamp((u - .95) / .6)); mx = lerp(720, 1250, k); my = 1180 - Math.abs(Math.sin(k * 12)) * 40; }
      monkey(g, mx, my, .95, t, { berry: has, flip: false });
    }
    if (mad) { const p = pop(t, S('p11') + .6, .25); g.save(); g.translate(230, 760); g.rotate(-.12); g.scale(p, p); rich(g, '#@%！', 0, 0, 90, { font: 'fun', col: '#FF8A65', stroke: 16 }); g.restore(); }
    return;
  }
  if (t < tF) { // 爬树掏蜂蜜
    wildBack(g, t, { sun: .5, trees: false });
    bigTree(g, 640, 1330, 860, t);
    const hx = 860, hy = 610;
    const glow = win(t, S('p12'), CK('p12', 1) + .2, .2, .3);
    if (glow) withAlpha(g, glow, () => { const gr = g.createRadialGradient(hx, hy, 20, hx, hy, 260); gr.addColorStop(0, 'rgba(255,214,90,.75)'); gr.addColorStop(1, 'rgba(255,214,90,0)'); g.fillStyle = gr; circ(g, hx, hy, 260); g.fill(); });
    hive(g, hx, hy, 1.1);
    const c1 = CK('p12', 1), c2 = CK('p12', 2);
    const climb = E.io(seg(t, c1, c2 + .2));
    const px = lerp(470, 560, seg(t, c1 - .2, c1 + .2)), py = lerp(1250, 830, climb);
    const stung = t >= c2, sw = E.out(seg(t, c2, c2 + .7)), proud = t >= c2 + .55;
    const climbing = t >= c1 - .1 && t < c2 + .3;
    person(g, {
      x: px, y: py, s: 1.0, t, outfit: 'cave', legs: climbing ? 'climb' : 'stand',
      eyes: proud ? 'tear' : (stung ? 'squint' : 'wide'), mouth: proud ? 'grin' : (stung ? 'shout' : 'o'), look: [5, -8], swell: sw,
      arms: proud ? { l: [-40, -100], r: [110, -310] } : climbing ? { l: [40, -250 + Math.sin(t * 12) * 30], r: [90, -220 - Math.sin(t * 12) * 30] } : { l: [-40, -60], r: [40, -60] },
      hands: (gg, L, Rr) => { if (proud) honeycomb(gg, Rr[0], Rr[1] - 60, .9, t); },
    });
    const nb = stung ? 14 : 5;
    for (let i = 0; i < nb; i++) {
      const a = t * (3 + hash(i, 5) * 3) + i * TAU / nb;
      const cx = stung ? px : hx, cy = stung ? py - 250 : hy, rad = stung ? 120 + hash(i, 6) * 60 : 120 + hash(i, 7) * 60;
      bee(g, cx + Math.cos(a) * rad, cy + Math.sin(a * 1.3) * rad * .6, .9, t, i);
    }
    if (t >= S('p12') && t < c1 + .2) tag(g, 860, 420, '蜂蜜：远古最甜', 46, { sc: pop(t, S('p12') + .1, .3), fill: YEL, rot: .05 });
    return;
  }
  // 哈扎人给食物排名
  paperBg(g, '#FFF1D6');
  const pt = pop(t, tF + .05, .35);
  if (pt) { g.save(); g.translate(540, 470); g.scale(pt, pt); text(g, '坦桑尼亚 · 哈扎人', 0, 0, 70, INK, 'black'); text(g, '今天仍以狩猎采集为生', 0, 76, 38, '#8D6B4A', 'bold'); g.restore(); }
  const foods = [['蜂蜜', honeyJar, 1], ['肉', meat, .85], ['浆果', berries, 1.1], ['猴面包果', baobab, 1], ['块茎', tuber, 1]];
  const ranked = E.io(seg(t, S('p14') - .05, S('p14') + .5));
  foods.forEach(([name, fn, k], i) => {
    const a = CK('p13', 1) + i * .12, p = pop(t, a, .3); if (!p) return;
    const shuffle = t < S('p14') - .05 ? Math.sin((t - a) * 9 + i * 2) * 14 * clamp(1 - (t - a) / 1.5) : 0;
    let x = 130 + i * 205, y = 860 + shuffle, s = 1;
    if (i === 0) { x = lerp(x, 540, ranked); y = lerp(y, 790, ranked); s = lerp(1, 1.7, ranked); }
    else { x = lerp(x, 175 + (i - 1) * 243, ranked); y = lerp(y, 1150, ranked); s = lerp(1, .75, ranked); }
    g.save(); g.translate(x, y); g.scale(p * s, p * s);
    circ(g, 0, 0, 88); fs(g, '#FFFFFF', INK, 6);
    fn(g, 0, i === 0 ? 30 : 6, .8 * k);
    text(g, name, 0, 130, 40, INK, 'black');
    g.restore();
  });
  if (ranked > .5) {
    const p = pop(t, S('p14') + .35, .35);
    g.save(); g.translate(540, 600); g.scale(p, p);
    poly(g, [[-80, 40], [-90, -40], [-40, 0], [0, -60], [40, 0], [90, -40], [80, 40]]); fs(g, '#FFD43B', INK, 6);
    g.restore();
    tag(g, 780, 700, '第 1 名', 56, { sc: p, fill: HOT, col: '#FFFFFF', rot: .1 });
    confetti(g, t, S('p14') + .35, 540, 760, 50, 7);
  }
  text(g, '数据：Berbesque & Marlowe，2009', 540, 1290, 30, '#8D8496', 'bold');
}

/* ---------- 大脑的铁律 ---------- */
function caveBg(g, t) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#3A2A22'); gr.addColorStop(1, '#5A4030');
  g.fillStyle = gr; g.fillRect(-300, -300, W + 600, H + 600);
  g.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 26; i++) { ell(g, hash(i, 31) * W, hash(i, 32) * H, 60 + hash(i, 33) * 120, 40 + hash(i, 34) * 80, hash(i, 35) * 3); g.fill(); }
  g.fillStyle = '#4A3428'; g.fillRect(-300, 1330, W + 600, 900); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-300, 1330); g.lineTo(W + 300, 1330); g.stroke();
  for (const tx of [110, 970]) {
    const f = .85 + .15 * Math.sin(t * 17 + tx) * Math.sin(t * 7);
    const gl = g.createRadialGradient(tx, 380, 10, tx, 380, 330 * f); gl.addColorStop(0, 'rgba(255,180,80,.55)'); gl.addColorStop(1, 'rgba(255,180,80,0)');
    g.fillStyle = gl; circ(g, tx, 380, 330 * f); g.fill();
    rr(g, tx - 12, 400, 24, 140, 6); fs(g, '#7A4B2A', INK, 5);
    g.beginPath(); g.moveTo(tx - 24, 404); g.quadraticCurveTo(tx - 30, 350 - 20 * f, tx, 310 - 26 * f); g.quadraticCurveTo(tx + 30, 350 - 20 * f, tx + 24, 404); g.closePath(); fs(g, '#FF9F2E', INK, 4);
    g.beginPath(); g.moveTo(tx - 12, 404); g.quadraticCurveTo(tx - 14, 372, tx, 350 - 14 * f); g.quadraticCurveTo(tx + 14, 372, tx + 12, 404); g.closePath(); fs(g, '#FFE38A', null);
  }
}
function campfire(g, x, y, t, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const gl = g.createRadialGradient(0, -40, 10, 0, -40, 380); gl.addColorStop(0, 'rgba(255,170,70,.55)'); gl.addColorStop(1, 'rgba(255,170,70,0)'); g.fillStyle = gl; circ(g, 0, -40, 380); g.fill();
  for (const r of [-.4, .4]) { g.save(); g.rotate(r); rr(g, -70, -12, 140, 24, 12); fs(g, '#7A4B2A', INK, 5); g.restore(); }
  const f = Math.sin(t * 14) * 8;
  g.beginPath(); g.moveTo(-50, -10); g.quadraticCurveTo(-60, -80, -10 + f, -150); g.quadraticCurveTo(0, -100, 20, -120 - f); g.quadraticCurveTo(60, -70, 50, -10); g.closePath(); fs(g, '#FF8A2E', INK, 5);
  g.beginPath(); g.moveTo(-26, -12); g.quadraticCurveTo(-30, -60, 0, -90 - f); g.quadraticCurveTo(30, -60, 26, -12); g.closePath(); fs(g, '#FFE38A', null);
  g.restore();
}
function rule(g, t) {
  const tB = S('p17') - .15, tC = S('p18') - .1, tD = S('p19') - .15;
  if (t < tB) { // 刻石板
    caveBg(g, t);
    tablet(g, 640, 830, 600, 740);
    const titleA = EN('p15') - .55;
    carve(g, '铁 律', 640, 590, 130, seg(t, titleA, titleA + .4), 'fun');
    const L = [['① 见到甜的', CK('p16', 0)], ['② 马上吃光', CK('p16', 1)], ['③ 存成脂肪', CK('p16', 2)]];
    let cur = null;
    L.forEach(([s, a], i) => {
      const p = seg(t, a, a + .55); carve(g, s, 640, 790 + i * 130, 72, p, 'black');
      if (p > 0 && p < 1) { g.font = F(72, 'black'); const w = g.measureText(s).width; cur = [640 - w / 2 + w * p, 790 + i * 130]; }
    });
    if (t >= titleA && t < titleA + .4) { g.font = F(130, 'fun'); const w = g.measureText('铁 律').width; cur = [640 - w / 2 + w * seg(t, titleA, titleA + .4), 590]; }
    const bx = 170, by = 1330, bs = .95;
    const loc = (wx, wy) => [(wx - bx) / bs, (wy - by) / bs - BC];
    const hit = cur ? Math.abs(Math.sin(t * 28)) : 0;
    const R0 = cur ? loc(cur[0] - 10, cur[1] + 30) : [150, 40], L0 = cur ? loc(cur[0] - 60 - hit * 30, cur[1] - 30 - hit * 40) : [-150, 40];
    brain(g, {
      x: bx, y: by, s: bs, t, eyes: cur ? 'squint' : 'dot', mouth: cur ? 'flat' : 'smile', siren: 0,
      arms: { l: L0, r: R0 },
      hands: (gg, Lh, Rh) => {
        gg.save(); gg.translate(Rh[0], Rh[1]); gg.rotate(-.7); rr(gg, -8, -70, 16, 80, 4); fs(gg, '#AEB4BC', INK, 5); gg.restore();
        gg.save(); gg.translate(Lh[0], Lh[1]); gg.rotate(.5 - hit * .6); rr(gg, -7, -10, 14, 90, 6); fs(gg, '#A8743F', INK, 5); rr(gg, -34, -40, 68, 36, 10); fs(gg, '#8C8A84', INK, 5); gg.restore();
      },
    });
    if (cur) for (let i = 0; i < 6; i++) { const u = ((t * 3 + i / 6) % 1); withAlpha(g, 1 - u, () => { circ(g, cur[0] + Math.cos(i * 1.7) * u * 90, cur[1] - 20 + Math.sin(i * 2.3) * u * 60 + u * u * 80, 6); fs(g, '#CFCBC2', INK, 2); }); }
    return;
  }
  if (t < tC) { // 冬天
    g.fillStyle = '#1E2747'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#E9F1FA'; g.beginPath(); g.moveTo(0, 1240); for (let x = 0; x <= W; x += 60) g.lineTo(x, 1240 - Math.sin(x * .01) * 26); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
    g.fillStyle = '#4A3A3A'; g.beginPath(); g.moveTo(-50, 1250); g.quadraticCurveTo(-60, 500, 380, 520); g.quadraticCurveTo(760, 540, 700, 1250); g.closePath(); g.fill();
    g.fillStyle = '#120E14'; g.beginPath(); g.moveTo(80, 1250); g.quadraticCurveTo(90, 700, 380, 700); g.quadraticCurveTo(620, 710, 600, 1250); g.closePath(); g.fill();
    campfire(g, 560, 1280, t, 1);
    person(g, { x: 330, y: 1230, s: 1.0, t, outfit: 'cave', legs: 'sit', eyes: t > CK('p17', 1) ? 'wide' : 'closed', mouth: t > CK('p17', 1) ? 'wavy' : 'smile', arms: { l: [-10, -40], r: [20, -30] }, front: gg => { ell(gg, 0, -60, 90, 70); fs(gg, '#E9A846', INK, 6); gg.save(); ell(gg, 0, -60, 90, 70); gg.clip(); leopard(gg, -90, -130, 180, 140, '#E9A846', .55); gg.restore(); ell(gg, 0, -60, 90, 70); gg.strokeStyle = INK; gg.lineWidth = 6; gg.stroke(); } });
    const pt = pop(t, tB + .3, .3); if (pt) tag(g, 270, 1000, '肚子里：秋天存的脂肪', 36, { sc: pt, fill: '#FFF3DD', rot: -.05 });
    const q = t > CK('p17', 1) - .05;
    bubble(g, 780, 690, q ? '下一顿……\n在哪儿？' : '下一顿？', 58, pop(t, tB + .2, .3), [560, 880]);
    snow(g, t, 1, q ? 160 : 80);
    return;
  }
  if (t < tD) { // 无数个冬天
    const k = Math.floor((t - tC) / .32);
    const cold = k % 2 === 0;
    g.fillStyle = cold ? '#CFE3F5' : '#BFE3A8'; g.fillRect(0, 0, W, H);
    g.fillStyle = cold ? '#FFFFFF' : '#8CC66A'; g.fillRect(0, 1200, W, H);
    if (cold) snow(g, t, .9, 70);
    const n = Math.min(9, Math.floor((t - tC) / .26) + 1);
    for (let i = 0; i < n; i++) withAlpha(g, .85, () => person(g, { x: 95 + i * 111, y: 1150, s: .42, t: t + i, outfit: 'cave', eyes: 'closed', mouth: 'smile', ph: i, legs: 'walk', walkPh: t * 8 + i }));
    const nums = ['1', '10', '100', '1,000', '10,000', '100,000', '数不清'];
    const ni = Math.min(nums.length - 1, Math.floor(seg(t, tC + .2, EN('p18') - .2) * (nums.length - 1) + .001));
    card(g, 540, 640, 760, 300, { fill: '#FFFFFF' });
    text(g, '祖先熬过的冬天', 540, 560, 50, '#6B6375', 'black');
    const sp = 1 + .12 * Math.exp(-((t - tC - .2) % .5) * 10);
    g.save(); g.translate(540, 680); g.scale(sp, sp); rich(g, `{${nums[ni]}}`, 0, 0, ni === nums.length - 1 ? 120 : 130, { col: INK, hl: '#3B6FD8', stroke: 0 }); g.restore();
    return;
  }
  // 只有油门，没有刹车
  g.fillStyle = '#2B2633'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#5A4030'; g.fillRect(0, 1000, W, H); for (let x = 0; x < W; x += 120) { g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 6; g.beginPath(); g.moveTo(x, 1000); g.lineTo(x, H); g.stroke(); }
  g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(0, 1000); g.lineTo(W, 1000); g.stroke();
  const stomp = EN('p19') - .75, pressed = E.out(seg(t, stomp, stomp + .12));
  const brakeFocus = E.io(seg(t, S('p20') - .1, S('p20') + .4));
  if (t >= stomp && t < S('p20')) speedLines(g, 540, 800, t, clamp(1 - (t - stomp) / 1.5), 'rgba(255,255,255,.5)');
  // 油门
  g.save(); g.translate(760, 1120); g.rotate(-.35 + pressed * .25);
  rr(g, -90, -170, 180, 260, 26); fs(g, mix('#5CCB7A', '#3A7E50', brakeFocus), INK, 8);
  g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 8; for (let k = -120; k < 70; k += 36) { g.beginPath(); g.moveTo(-60, k); g.lineTo(60, k); g.stroke(); }
  g.restore();
  rr(g, 735, 1180, 50, 160, 10); fs(g, '#555', INK, 6);
  tag(g, 790, 820, '油门：别错过！', 52, { sc: pop(t, S('p19') + .2, .3), fill: mix(YEL, '#BBB39A', brakeFocus), rot: .04 });
  // 刹车位
  g.save(); g.setLineDash([22, 16]); rr(g, 220, 960, 180, 260, 26); g.strokeStyle = `rgba(255,255,255,${.35 + .45 * brakeFocus})`; g.lineWidth = 7; g.stroke(); g.restore();
  g.strokeStyle = `rgba(255,255,255,${.25 + .5 * brakeFocus})`; g.lineWidth = 3;
  for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + i * Math.PI / 10; g.beginPath(); g.moveTo(230, 970); g.lineTo(230 + Math.cos(a + Math.PI / 2) * 150, 970 + Math.sin(a + Math.PI / 2) * 150); g.stroke(); }
  for (let r = 40; r < 150; r += 36) { g.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 10; g.lineTo(230 + Math.cos(a) * r, 970 + Math.sin(a) * r); } g.stroke(); }
  if (brakeFocus > 0) {
    tag(g, 310, 820, '刹车：够了', 52, { sc: pop(t, S('p20') + .1, .3), fill: '#FFFFFF', rot: -.05 });
    stamp(g, 310, 1090, '未安装', seg(t, EN('p20') - .45, EN('p20') + .55), { px: 60, rot: -.15 });
  }
  // 大脑坐在石凳上
  g.save(); g.translate(0, Math.sin(t * 40) * 3 * (t >= stomp && t < S('p20') ? 1 : 0));
  rr(g, 380, 700, 320, 60, 16); fs(g, '#8C8A84', INK, 7);
  const footX = lerp(700, 740, pressed), footY = lerp(1000, 1040, pressed);
  g.strokeStyle = INK; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(560, 700); g.quadraticCurveTo(700, 800, footX, footY); g.stroke();
  ell(g, footX + 10, footY, 30, 16); fs(g, '#F7A1B5', INK, 5);
  brain(g, { x: 540, y: 720, s: .9, t, legs: 'none', eyes: brakeFocus > .5 ? 'dot' : 'star', mouth: brakeFocus > .5 ? 'wavy' : 'grin', look: [-6, 4], arms: brakeFocus > .5 ? { l: [-170, -120], r: [170, -120] } : { l: [-150, 60], r: [150, 60] } });
  g.restore();
  if (t >= stomp && t < S('p20')) { const p = pop(t, stomp, .25); g.save(); g.translate(860, 560); g.rotate(.12); g.scale(p, p); rich(g, '轰——', 0, 0, 100, { font: 'fun', col: '#FFB347', stroke: 16 }); g.restore(); }
}

/* ---------- 糖油组合 ---------- */
function foodCard(g, x, y, s, icon, name, sugar, fat, p, glow = 0, note = '') {
  if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(p * s, p * s);
  if (glow > 0) { g.save(); g.globalAlpha = glow; g.shadowColor = 'rgba(255,90,140,.9)'; g.shadowBlur = 50; rr(g, -150, -290, 300, 580, 30); g.fillStyle = '#FFFFFF'; g.fill(); g.restore(); }
  card(g, 0, 0, 300, 580, { fill: glow > 0 ? '#FFF0F5' : '#FFFFFF' });
  icon(g);
  text(g, name, 0, -20, 58, INK, 'black');
  g.strokeStyle = 'rgba(42,35,48,.15)'; g.lineWidth = 4; g.beginPath(); g.moveTo(-110, 30); g.lineTo(110, 30); g.stroke();
  text(g, '糖', -60, 100, 56, INK, 'black'); (sugar ? check : cross)(g, 60, 100, 1.2);
  text(g, '油', -60, 200, 56, INK, 'black'); (fat ? check : cross)(g, 60, 200, 1.2);
  if (note) text(g, note, 0, 255, 26, '#8D8496', 'bold');
  g.restore();
}
function combo(g, t) {
  const tB = S('p22') - .1, tC = S('p23') - .1, tD = S('p25') - .1;
  if (t < tB) {
    shopBack(g, t, {});
    person(g, { x: 770, y: 1180, s: .95, t, outfit: 'clerk', legs: 'none', ph: 2, eyes: 'happy', mouth: 'smile', blush: .8 });
    shopCounter(g, t, {});
    const sc = 1.05, cupL = [140, 20];
    person(g, {
      x: 360, y: 1250, s: sc, t, outfit: 'cave', eyes: 'heart', mouth: 'sip', blush: 1, headRot: .08,
      arms: { l: [cupL[0] - 70, cupL[1] - 50], r: [cupL[0] - 40, cupL[1] - 150] },
      front: gg => teaCup(gg, { x: cupL[0], y: cupL[1], s: .62, t, fill: .7, pearls: 20, foam: .8, lid: 1, straw: 0 }),
      top: gg => strawTube(gg, cupL[0] + 28, cupL[1] - 212, 14, -212, 1, t, .7),
    });
    for (let i = 0; i < 3; i++) { const u = ((t * .9 + i / 3) % 1); withAlpha(g, 1 - u, () => { heart(g, 470 + i * 40, 900 - u * 220, 22); fs(g, HOT, INK, 4); }); }
    return;
  }
  if (t < tC) {
    burst(g, 540, 1000, t * .2, '#FFE3EA', '#FFD3DF', 22);
    teaCup(g, { x: 540, y: 1290, s: 1.35, t, fill: .75, pearls: 30, foam: 1, lid: 1, straw: 1 });
    const orb = (a, fn) => { const x = 540 + Math.cos(a) * 360, y = 1010 + Math.sin(a) * 140; fn(x, y, Math.sin(a) > 0); };
    const p = pop(t, tB + .1, .35);
    if (p) withAlpha(g, clamp(p), () => {
      orb(t * 2.2, (x, y) => { sugarCube(g, x, y, 1.1, t); tag(g, x, y - 90, '糖', 44, { fill: '#FFFFFF', shadow: false }); });
      orb(t * 2.2 + Math.PI, (x, y) => { g.save(); g.translate(x, y); g.beginPath(); g.moveTo(0, -60); g.quadraticCurveTo(46, 0, 40, 20); g.arc(0, 20, 40, 0, Math.PI); g.quadraticCurveTo(-46, 0, 0, -60); g.closePath(); fs(g, '#FFF4DF', INK, 6); g.restore(); tag(g, x, y - 100, '油（奶）', 40, { fill: '#FFFFFF', shadow: false }); });
    });
    const p2 = pop(t, CK('p22', 1) + .3, .35);
    if (p2) { g.save(); g.translate(540, 560); g.rotate(-.04); g.scale(p2, p2); tag(g, 0, 0, '大自然：没见过这款', 62, { fill: YEL, font: 'black' }); g.restore(); }
    return;
  }
  if (t < tD) {
    paperBg(g, '#FFF6EE');
    const p1 = pop(t, S('p23'), .35), p2 = pop(t, CK('p23', 1), .35), p3 = pop(t, S('p24'), .4);
    const glow = t >= CK('p24', 1) - .1 ? .6 + .4 * Math.sin(t * 8) : 0;
    const dim = t >= CK('p24', 1) - .1 ? .45 : 1;
    withAlpha(g, dim, () => {
      foodCard(g, 190, 880, 1, gg => apple(gg, 0, -170, .85), '水果', true, false, p1);
      foodCard(g, 540, 880, 1, gg => walnut(gg, 0, -170, .9), '坚果', false, true, p2);
    });
    foodCard(g, 890, 880, glow > 0 ? 1.06 : 1, gg => miniCup(gg, 0, -120, 1.1, TEA, true), '奶茶', true, true, p3, glow, '（奶 · 奶盖 · 植脂末）');
    if (glow > 0) { const p = pop(t, CK('p24', 1), .3); g.save(); g.translate(890, 520); g.rotate(.08); g.scale(p, p); tag(g, 0, 0, '双料！', 56, { fill: HOT, col: '#FFFFFF' }); g.restore(); }
    return;
  }
  // 耶鲁：糖 + 油 的奖赏，超过两样相加（示意）
  paperBg(g, '#F6F7FB');
  card(g, 540, 870, 940, 940, { fill: '#FFFFFF' });
  text(g, '耶鲁大学 · 2018 · 206 名成年人', 540, 470, 40, '#6B6375', 'bold');
  text(g, '大脑奖赏区的反应', 540, 545, 60, INK, 'black');
  tag(g, 900, 470, '示意', 28, { fill: '#F1EEF6', shadow: false, lw: 3 });
  const base = 1240, unit = 520;
  g.strokeStyle = 'rgba(42,35,48,.35)'; g.lineWidth = 4; g.beginPath(); g.moveTo(150, base); g.lineTo(930, base); g.stroke();
  const bars = [['糖', 300, .4, CK('p25', 1), '#9DB0D3'], ['油', 540, .37, CK('p25', 1) + .35, '#9DB0D3'], ['糖＋油', 780, 1.0, S('p26') + .35, HOT]];
  const sumY = base - (.4 + .37) * unit;
  if (t >= S('p26') - .05) {
    withAlpha(g, seg(t, S('p26') - .05, S('p26') + .25), () => {
      g.save(); g.setLineDash([18, 12]); g.strokeStyle = '#6B6375'; g.lineWidth = 5; g.beginPath(); g.moveTo(170, sumY); g.lineTo(910, sumY); g.stroke(); g.restore();
      text(g, '两样相加', 250, sumY - 34, 34, '#6B6375', 'black');
    });
  }
  for (const [name, x, v, a, col] of bars) {
    const u = E.out(seg(t, a, a + .6)), h = v * unit * u;
    if (u > 0) { rr(g, x - 75, base - h, 150, h, [12, 12, 0, 0]); fs(g, col, INK, 5); }
    text(g, name, x, base + 46, 44, INK, 'black');
  }
  const over = t >= CK('p26', 1) - .1;
  if (over) {
    const p = pop(t, CK('p26', 1) - .1, .35);
    g.save(); g.strokeStyle = HOT; g.lineWidth = 8; g.lineCap = 'round';
    g.beginPath(); g.moveTo(880, sumY); g.lineTo(880, base - unit); g.stroke();
    g.beginPath(); g.moveTo(866, base - unit + 18); g.lineTo(880, base - unit); g.lineTo(894, base - unit + 18); g.stroke(); g.restore();
    tag(g, 720, base - unit - 70, '超出！', 54, { sc: p, fill: YEL, rot: -.06 });
    for (let i = 0; i < 5; i++) { const a = t * 3 + i * TAU / 5; star(g, 780 + Math.cos(a) * 110, base - unit + 10 + Math.sin(a) * 40, 16, 7); fs(g, YEL, INK, 3); }
  }
}
