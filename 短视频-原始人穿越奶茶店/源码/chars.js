'use strict';
/* chars.js：角色 —— 原始人、现代人（你）、店员、原始大脑 */

const SKIN = { cave: '#E2A877', office: '#F4D3B5', clerk: '#F7D9C2', hoodie: '#F1CDAA' };
const SLEEVE = { office: '#F4F6FB', clerk: '#FFFFFF', hoodie: '#3E9E97' };
const PANTS = { office: '#3B3F4E', clerk: '#3B3F4E', hoodie: '#4D6A9C' };
const HAIR = '#4A2C1A';

/* ---------- 五官（可复用于大脑） ---------- */
function eyePair(g, o, cx, cy, gap, k, lw) {
  const e = o.eyes || 'dot', look = o.look || [0, 0], t = o.t || 0;
  const blink = (o.blink === undefined ? ((t + (o.ph || 0) * 1.7) % 3.7 < .12) : o.blink) && (e === 'dot' || e === 'wide');
  for (const side of [-1, 1]) {
    const x = cx + side * gap, y = cy;
    g.save(); g.translate(x, y); g.scale(k, k);
    g.fillStyle = INK; g.strokeStyle = INK; g.lineWidth = lw / k * .8; g.lineCap = 'round';
    if (blink) { g.beginPath(); g.moveTo(-9, 0); g.lineTo(9, 0); g.stroke(); g.restore(); continue; }
    switch (e) {
      case 'dot':
        ell(g, look[0], look[1], 8, 10); g.fill();
        g.fillStyle = '#FFF'; circ(g, look[0] + 2.5, look[1] - 3.5, 2.6); g.fill(); break;
      case 'cross': // 斗鸡眼盯着吸管
        ell(g, -side * 7, 7, 8, 10); g.fill(); g.fillStyle = '#FFF'; circ(g, -side * 7 + 2.5, 3.5, 2.6); g.fill(); break;
      case 'wide':
        circ(g, 0, 0, 17); fs(g, '#FFF', INK, lw / k * .75);
        g.fillStyle = INK; circ(g, look[0] * 1.2, look[1] * 1.2, 7.5); g.fill();
        g.fillStyle = '#FFF'; circ(g, look[0] * 1.2 + 2.5, look[1] * 1.2 - 3, 2.4); g.fill(); break;
      case 'tiny':
        circ(g, 0, 0, 17); fs(g, '#FFF', INK, lw / k * .75); g.fillStyle = INK; circ(g, 0, 0, 3.5); g.fill(); break;
      case 'star':
        g.save(); g.rotate(Math.sin(t * 9 + side) * .25); g.scale(1 + .12 * Math.sin(t * 14), 1 + .12 * Math.sin(t * 14));
        star(g, 0, 0, 25, 10.5); fs(g, YEL, INK, lw / k * .7);
        g.fillStyle = '#FFF'; circ(g, -5, -6, 4); g.fill(); g.restore(); break;
      case 'spiral':
        g.save(); g.rotate(t * 12 * side); g.beginPath();
        for (let a = 0; a < TAU * 2.6; a += .2) { const r = 2 + a * 1.15; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        g.lineWidth = lw / k * .6; g.stroke(); g.restore(); break;
      case 'squint': // > <
        g.beginPath(); g.moveTo(-side * 11, -9); g.lineTo(side * 9, 0); g.lineTo(-side * 11, 9); g.stroke(); break;
      case 'happy':
        g.beginPath(); g.arc(0, 5, 11, 1.12 * Math.PI, 1.88 * Math.PI); g.stroke(); break;
      case 'closed':
        g.beginPath(); g.arc(0, -4, 11, .15 * Math.PI, .85 * Math.PI); g.stroke(); break;
      case 'heart':
        heart(g, 0, 6, 20 + 3 * Math.sin(t * 12)); fs(g, HOT, INK, lw / k * .6); break;
      case 'x':
        g.beginPath(); g.moveTo(-9, -9); g.lineTo(9, 9); g.moveTo(9, -9); g.lineTo(-9, 9); g.stroke(); break;
      case 'tear':
        g.beginPath(); g.arc(0, 5, 11, 1.12 * Math.PI, 1.88 * Math.PI); g.stroke();
        g.fillStyle = 'rgba(120,200,255,.9)'; const d = (t * 1.6 + (side + 1) * .3) % 1;
        ell(g, side * 6, 14 + d * 40, 4, 6); g.fill(); break;
    }
    g.restore();
  }
}
function mouthAt(g, o, cx, cy, k, lw) {
  const m = o.mouth || 'smile', t = o.t || 0;
  g.save(); g.translate(cx, cy); g.scale(k, k); g.lineWidth = lw / k; g.strokeStyle = INK; g.lineCap = 'round'; g.lineJoin = 'round';
  const DARK = '#5B2131';
  switch (m) {
    case 'smile': g.beginPath(); g.moveTo(-18, -4); g.quadraticCurveTo(0, 14, 18, -4); g.stroke(); break;
    case 'grin':
      g.beginPath(); g.moveTo(-28, -8); g.quadraticCurveTo(0, 40, 28, -8); g.closePath(); fs(g, DARK, INK, lw / k);
      g.save(); g.clip(); g.fillStyle = '#FFF'; g.fillRect(-30, -10, 60, 9); g.fillStyle = '#F47E8E'; ell(g, 0, 16, 14, 8); g.fill(); g.restore();
      g.beginPath(); g.moveTo(-28, -8); g.quadraticCurveTo(0, 40, 28, -8); g.closePath(); g.stroke(); break;
    case 'open': case 'shout': {
      const r = m === 'shout' ? 1.35 : 1, wob = m === 'shout' ? Math.sin(t * 40) * 2 : 0;
      ell(g, 0, 4, 17 * r + wob, 21 * r - wob); fs(g, DARK, INK, lw / k);
      g.save(); ell(g, 0, 4, 17 * r, 21 * r); g.clip(); g.fillStyle = '#F47E8E'; ell(g, 0, 4 + 18 * r, 14 * r, 10 * r); g.fill(); g.restore(); break;
    }
    case 'o': ell(g, 0, 2, 8, 10); fs(g, DARK, INK, lw / k * .8); break;
    case 'sip': ell(g, 0, 0, 9, 7); fs(g, DARK, INK, lw / k * .8); break;
    case 'sour':
      ell(g, 0, 2, 7, 5); fs(g, DARK, INK, lw / k * .8);
      g.lineWidth = lw / k * .6; for (const a of [-2.6, -1.9, -1.2, -.5, .5, 1.2, 1.9, 2.6]) { g.beginPath(); g.moveTo(Math.cos(a) * 11, 2 + Math.sin(a) * 9); g.lineTo(Math.cos(a) * 17, 2 + Math.sin(a) * 14); g.stroke(); } break;
    case 'flat': g.beginPath(); g.moveTo(-12, 2); g.lineTo(12, 2); g.stroke(); break;
    case 'frown': g.beginPath(); g.moveTo(-16, 8); g.quadraticCurveTo(0, -6, 16, 8); g.stroke(); break;
    case 'wavy': g.beginPath(); g.moveTo(-18, 2); for (let i = 1; i <= 6; i++) g.lineTo(-18 + i * 6, i % 2 ? -4 : 4); g.stroke(); break;
    case 'drool':
      g.beginPath(); g.moveTo(-18, -4); g.quadraticCurveTo(0, 14, 18, -4); g.stroke();
      g.fillStyle = 'rgba(140,210,255,.95)'; const d = (t * .9) % 1; ell(g, 14, 10 + d * 16, 5, 7 + d * 6); fs(g, 'rgba(140,210,255,.95)', INK, lw / k * .4); break;
    case 'smug': g.beginPath(); g.moveTo(-16, 2); g.quadraticCurveTo(6, 10, 20, -6); g.stroke(); break;
  }
  g.restore();
}

/* ---------- 人 ---------- */
function arm(g, sx, sy, hx, hy, side, lw, col, skin, bend = 1) {
  const mx = (sx + hx) / 2 + side * 24 * bend, my = (sy + hy) / 2 + 12 * bend;
  g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(mx, my, hx, hy);
  g.strokeStyle = INK; g.lineWidth = 19 + lw * 1.7; g.stroke();
  g.strokeStyle = col; g.lineWidth = 19; g.stroke();
  circ(g, hx, hy, 14); fs(g, skin, INK, lw * .9);
}
function legsOf(g, o, lw, skin) {
  const mode = o.legs || 'stand'; if (mode === 'none') return;
  const t = o.t || 0, col = PANTS[o.outfit] || skin;
  let L = [];
  if (mode === 'stand') L = [[-30, 0, -34, 102], [30, 0, 34, 102]];
  else if (mode === 'walk') { const p = o.walkPh || 0, a = Math.sin(p) * 28; L = [[-24, 0, -24 + a, 102 - Math.max(0, Math.cos(p)) * 12], [24, 0, 24 - a, 102 - Math.max(0, -Math.cos(p)) * 12]]; }
  else if (mode === 'jump') L = [[-30, 0, -58, 64], [30, 0, 58, 64]];
  else if (mode === 'dangle') { const sw = Math.sin(t * 7 + (o.ph || 0)) * 16; L = [[-30, 0, -40 + sw, 96], [30, 0, 40 - sw, 96]]; }
  else if (mode === 'climb') L = [[-30, 0, -62, 54], [30, 0, 36, 100]];
  else if (mode === 'sit') L = [[-30, 0, -70, 30], [30, 0, 70, 30]];
  else if (mode === 'wide') L = [[-30, 0, -60, 100], [30, 0, 60, 100]];
  for (const [x0, y0, x1, y1] of L) {
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1);
    g.strokeStyle = INK; g.lineWidth = 19 + lw * 1.7; g.stroke();
    g.strokeStyle = col; g.lineWidth = 19; g.stroke();
    const fx = x1 + (x1 < 0 ? -10 : 10);
    if (o.outfit === 'cave') { ell(g, fx, y1 + 4, 23, 12); fs(g, skin, INK, lw * .8); }
    else { g.fillStyle = INK; ell(g, fx, y1 + 4, 23, 12); g.fill(); }
  }
}
function caveBodyPath(g, top) {
  g.beginPath(); g.moveTo(-75, 0); g.lineTo(-75, top + 75); g.arc(0, top + 75, 75, Math.PI, TAU); g.lineTo(75, 8);
  const n = 7; for (let i = 0; i <= n; i++) { const x = 75 - 150 * i / n; g.lineTo(x + 75 / n * (i < n ? 1 : 0) * 0, i % 2 ? 30 : 10); }
  g.lineTo(-75, 0); g.closePath();
}
function bodyOutfit(g, o, top, lw, skin) {
  const c = o.outfit;
  g.strokeStyle = INK; g.lineWidth = lw;
  if (c === 'cave') {
    caveBodyPath(g, top); g.fillStyle = skin; g.fill();
    g.save(); caveBodyPath(g, top); g.clip();
    g.beginPath(); g.moveTo(-90, top - 10); g.lineTo(-20, top - 10); g.lineTo(95, top + 92); g.lineTo(95, 60); g.lineTo(-90, 60); g.closePath(); g.clip();
    leopard(g, -90, top - 10, 190, 80 - top, '#E9A846', .55);
    g.restore();
    g.save(); caveBodyPath(g, top); g.clip(); g.beginPath(); g.moveTo(-20, top - 10); g.lineTo(95, top + 92); g.lineWidth = lw; g.stroke(); g.restore();
    caveBodyPath(g, top); g.stroke();
    // 一圈毛边
    g.strokeStyle = 'rgba(80,40,10,.35)'; g.lineWidth = 3;
    for (let i = 0; i < 6; i++) { const x = -60 + i * 24; g.beginPath(); g.moveTo(x, 4); g.lineTo(x + 6, 16); g.stroke(); }
  } else if (c === 'office') {
    rr(g, -75, top, 150, -top + 6, [75, 75, 42, 42]); fs(g, '#F4F6FB', INK, lw);
    g.fillStyle = '#FFFFFF'; poly(g, [[-30, top + 6], [0, top + 40], [-6, top + 52], [-40, top + 26]]); fs(g, '#FFF', INK, lw * .7);
    poly(g, [[30, top + 6], [0, top + 40], [6, top + 52], [40, top + 26]]); fs(g, '#FFF', INK, lw * .7);
    g.strokeStyle = '#3B6FD8'; g.lineWidth = 7; g.beginPath(); g.moveTo(-26, top + 16); g.lineTo(0, top + 98); g.lineTo(26, top + 16); g.stroke();
    rr(g, -20, top + 96, 40, 52, 6); fs(g, '#FFFFFF', INK, lw * .6); g.fillStyle = '#3B6FD8'; g.fillRect(-14, top + 104, 28, 10);
    g.fillStyle = 'rgba(42,35,48,.35)'; g.fillRect(-12, top + 122, 24, 4); g.fillRect(-12, top + 130, 18, 4);
  } else if (c === 'hoodie') {
    rr(g, -75, top, 150, -top + 6, [75, 75, 42, 42]); fs(g, '#3E9E97', INK, lw);
    rr(g, -48, -66, 96, 50, 14); fs(g, '#348A84', INK, lw * .7);
    g.strokeStyle = '#FFFFFF'; g.lineWidth = 5; g.beginPath(); g.moveTo(-16, top + 18); g.lineTo(-20, top + 70); g.moveTo(16, top + 18); g.lineTo(20, top + 70); g.stroke();
  } else if (c === 'clerk') {
    rr(g, -75, top, 150, -top + 6, [75, 75, 42, 42]); fs(g, '#FFFFFF', INK, lw);
    rr(g, -52, top + 40, 104, -top - 30, [14, 14, 30, 30]); fs(g, '#FF8FAB', INK, lw * .8);
    g.strokeStyle = '#FF8FAB'; g.lineWidth = 9; g.beginPath(); g.moveTo(-44, top + 44); g.lineTo(-30, top + 6); g.moveTo(44, top + 44); g.lineTo(30, top + 6); g.stroke();
    circ(g, 0, top + 92, 22); fs(g, '#FFF6E6', INK, lw * .6); text(g, '茶', 0, top + 94, 26, '#E2456E', 'black');
  }
}
function hairBack(g, o, hr, lw) {
  const c = o.outfit, up = o.hairUp || 0, t = o.t || 0;
  if (c === 'cave') {
    g.beginPath(); const n = 22;
    for (let i = 0; i <= n * 2; i++) {
      const a = Math.PI * (.6 + 1.8 * i / (n * 2)), tip = i % 2 === 1;
      const topness = Math.max(0, -Math.sin(a));
      let r = tip ? hr + 26 + 10 * hash(i, 3) + up * (40 + 50 * topness) : hr + 6;
      let aa = a + (tip ? up * .25 * Math.cos(a) * -1 * topness * 0 : 0);
      if (up > 0 && tip) r += Math.sin(t * 40 + i) * 4 * up;
      g.lineTo(Math.cos(aa) * r, Math.sin(aa) * r);
    }
    g.closePath(); fs(g, HAIR, INK, lw);
  } else if (c === 'hoodie') {
    circ(g, 0, 18, hr + 22); fs(g, '#3E9E97', INK, lw);
  } else if (c === 'clerk') {
    g.fillStyle = '#2E2430'; ell(g, -hr - 4, 18, 22, 40, .3); fs(g, '#2E2430', INK, lw);
  }
}
function hairFront(g, o, hr, lw) {
  const c = o.outfit;
  g.strokeStyle = INK; g.lineWidth = lw;
  if (c === 'cave') {
    g.beginPath(); g.arc(0, 0, hr + 2, Math.PI * 1.08, Math.PI * 1.92);
    const n = 7; for (let i = 0; i <= n; i++) { const x = hr * .9 - (hr * 1.8) * i / n; g.lineTo(x, i % 2 ? -hr * .42 : -hr * .62); }
    g.closePath(); fs(g, HAIR, INK, lw);
  } else if (c === 'office' || c === 'hoodie') {
    g.beginPath(); g.arc(0, 0, hr + 3, Math.PI * 1.02, Math.PI * 1.98);
    g.quadraticCurveTo(hr * .5, -hr * .55, 0, -hr * .45); g.quadraticCurveTo(-hr * .6, -hr * .6, -hr - 3, -4); g.closePath();
    fs(g, '#1F1A22', INK, lw);
  } else if (c === 'clerk') {
    g.beginPath(); g.arc(0, -4, hr + 3, Math.PI * 1.05, Math.PI * 1.95); g.closePath(); fs(g, '#2E2430', INK, lw);
    g.beginPath(); g.arc(0, -22, hr + 5, Math.PI * 1.05, Math.PI * 1.95); g.closePath(); fs(g, '#FF8FAB', INK, lw);
    rr(g, -10, -46, hr + 44, 15, 8); fs(g, '#FF8FAB', INK, lw);
    circ(g, 0, -hr - 14, 8); fs(g, '#FF8FAB', INK, lw * .8);
  }
}
function faceOf(g, o, lw, skin, hr) {
  const c = o.outfit;
  if (o.xray >= .999) return;
  g.save(); g.globalAlpha *= 1 - (o.xray || 0);
  if (c === 'cave') {
    // 络腮胡茬
    g.fillStyle = 'rgba(74,44,26,.45)';
    for (let i = 0; i < 26; i++) { const a = Math.PI * (.15 + .7 * hash(i, 9)), r = hr * (.62 + .3 * hash(i, 4)); circ(g, Math.cos(a) * r, Math.sin(a) * r + 6, 2.3); g.fill(); }
  }
  eyePair(g, o, 0, -2, 25, 1, lw);
  // 眉毛
  const b = o.brow || 'normal';
  g.strokeStyle = c === 'cave' ? HAIR : '#1F1A22'; g.lineWidth = c === 'cave' ? 11 : 6; g.lineCap = 'round';
  g.beginPath();
  if (c === 'cave') { // 一字眉
    const dy = b === 'up' ? -12 : 0;
    if (b === 'angry') { g.moveTo(-42, -34); g.lineTo(0, -22); g.lineTo(42, -34); }
    else if (b === 'sad') { g.moveTo(-42, -24); g.lineTo(0, -36); g.lineTo(42, -24); }
    else { g.moveTo(-42, -28 + dy); g.quadraticCurveTo(0, -38 + dy, 42, -28 + dy); }
  } else {
    const dy = b === 'up' ? -10 : 0;
    if (b === 'angry') { g.moveTo(-38, -32); g.lineTo(-14, -24); g.moveTo(38, -32); g.lineTo(14, -24); }
    else if (b === 'sad') { g.moveTo(-38, -24); g.lineTo(-14, -32); g.moveTo(38, -24); g.lineTo(14, -32); }
    else { g.moveTo(-36, -30 + dy); g.quadraticCurveTo(-25, -36 + dy, -14, -30 + dy); g.moveTo(36, -30 + dy); g.quadraticCurveTo(25, -36 + dy, 14, -30 + dy); }
  }
  g.stroke();
  // 鼻子
  if (c === 'cave') { ell(g, 0, 14, 14, 11); fs(g, '#C98756', INK, lw * .7); }
  else { g.strokeStyle = INK; g.lineWidth = lw * .6; g.beginPath(); g.moveTo(-2, 8); g.quadraticCurveTo(6, 16, 0, 18); g.stroke(); }
  mouthAt(g, o, 0, 36, 1, lw);
  if (o.blush) { g.fillStyle = `rgba(255,110,130,${.5 * o.blush})`; ell(g, -44, 20, 13, 8); g.fill(); ell(g, 44, 20, 13, 8); g.fill(); }
  if (o.swell) { // 被蜇的包
    for (const [x, y, r] of [[-34, -30, 12], [36, 6, 14], [12, -44, 10], [-40, 26, 11], [28, -20, 9], [-6, 50, 9]]) {
      circ(g, x, y, r * o.swell); fs(g, '#F27A6E', INK, lw * .5); g.fillStyle = 'rgba(255,255,255,.5)'; circ(g, x - r * .3 * o.swell, y - r * .35 * o.swell, r * .25 * o.swell); g.fill();
    }
  }
  if (o.sweat) { g.fillStyle = 'rgba(140,210,255,.95)'; g.beginPath(); g.moveTo(58, -46); g.quadraticCurveTo(70, -26, 60, -20); g.quadraticCurveTo(48, -26, 58, -46); fs(g, 'rgba(140,210,255,.95)', INK, lw * .5); }
  g.restore();
}
function xrayHead(g, o, hr, lw) {
  const a = o.xray, t = o.t || 0;
  g.save(); circ(g, 0, 0, hr - lw * .5); g.clip();
  g.fillStyle = `rgba(20,30,66,${.94 * a})`; g.fillRect(-hr, -hr, hr * 2, hr * 2);
  if (o.brainO && o.brainO.cave) withAlpha(g, a, () => { // 脑袋里是个山洞
    g.fillStyle = '#4A3428'; g.fillRect(-hr, -hr, hr * 2, hr * 2);
    g.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i < 6; i++) { ell(g, -50 + hash(i, 3) * 100, -50 + hash(i, 4) * 100, 18, 12, i); g.fill(); }
    campfire(g, 40, 52, t, .16);
  });
  g.strokeStyle = `rgba(110,210,255,${.18 * a})`; g.lineWidth = 1.5;
  for (let k = -hr; k < hr; k += 16) { g.beginPath(); g.moveTo(-hr, k); g.lineTo(hr, k); g.moveTo(k, -hr); g.lineTo(k, hr); g.stroke(); }
  withAlpha(g, a, () => brain(g, Object.assign({ x: 0, y: 68, s: .4, t, eyes: 'wide', mouth: 'o', legs: 'none' }, o.brainO || {})));
  g.restore();
  g.strokeStyle = `rgba(120,225,255,${a})`; g.lineWidth = lw * .8; circ(g, 0, 0, hr - lw * .3); g.stroke();
}
/* o: x,y(髋部),s,t,outfit,eyes,mouth,brow,look,arms{l,r},legs,walkPh,headDX,headDY,headRot,hairUp,blush,swell,sweat,xray,brainO,front(g),hands(g,L,R),headTop(g),top(g) */
function person(g, o) {
  const s = o.s || 1, t = o.t || 0, lw = o.lw || 6, skin = SKIN[o.outfit] || '#F1CDAA';
  g.save(); g.translate(o.x, o.y); if (o.rot) g.rotate(o.rot); g.scale(s, s * (o.sy || 1));
  g.lineJoin = 'round'; g.lineCap = 'round';
  const br = Math.sin(t * 2.4 + (o.ph || 0)) * 2.5;
  const top = -180 + br * .4;
  const hx = o.headDX || 0, hy = -246 + br + (o.headDY || 0), hr = 64;
  legsOf(g, o, lw, skin);
  if (o.behind) o.behind(g);
  bodyOutfit(g, o, top, lw, skin);
  if (o.front) o.front(g);
  const sh = top + 44, A = o.arms || {}, L = A.l || [-34, -58], Rr = A.r || [34, -58];
  const col = SLEEVE[o.outfit] || skin;
  arm(g, -58, sh, L[0], L[1], -1, lw, col, skin, A.bl ?? 1);
  arm(g, 58, sh, Rr[0], Rr[1], 1, lw, col, skin, A.br ?? 1);
  if (o.hands) o.hands(g, L, Rr);
  g.save(); g.translate(hx, hy); g.rotate(o.headRot || 0); if (o.headS) g.scale(o.headS, o.headS);
  hairBack(g, o, hr, lw);
  circ(g, 0, 0, hr); fs(g, skin, INK, lw);
  if (o.outfit === 'office' || o.outfit === 'hoodie' || o.outfit === 'clerk') { for (const sx of [-1, 1]) { ell(g, sx * (hr - 2), 6, 11, 15); fs(g, skin, INK, lw * .8); } circ(g, 0, 0, hr - lw * .5); g.fillStyle = skin; g.fill(); }
  faceOf(g, o, lw, skin, hr);
  if (!(o.xray >= .999)) withAlpha(g, 1 - (o.xray || 0) * .0, () => hairFront(g, o, hr, lw));
  if (o.xray) xrayHead(g, o, hr, lw);
  if (o.headTop) o.headTop(g);
  g.restore();
  if (o.top) o.top(g);
  g.restore();
}

/* ---------- 原始大脑 ---------- */
const BC = -175; // 大脑中心（相对脚底）
const LOBES = (() => {
  const out = [];
  for (let i = 0; i < 11; i++) { const a = Math.PI * (.92 + 1.16 * i / 10); out.push([Math.cos(a) * 82, Math.sin(a) * 50 - 6, 46 + 6 * Math.sin(i * 2.3)]); }
  out.push([-70, 28, 44], [-20, 40, 44], [30, 38, 44], [76, 24, 42], [0, 0, 70], [-50, 0, 56], [50, 0, 56]);
  return out;
})();
const FOLDS = [
  [-96, -40, -74, -66, -46, -50], [-40, -78, -18, -56, -2, -76], [18, -74, 44, -58, 60, -78], [70, -52, 92, -34, 100, -10],
  [-104, 0, -86, 20, -96, 36], [96, 8, 82, 28, 100, 40], [-30, 56, -6, 46, 14, 60], [40, 56, 58, 42, 76, 52],
];
function brain(g, o) {
  const s = o.s || 1, t = o.t || 0, lw = o.lw || 6;
  g.save(); g.translate(o.x, o.y); if (o.rot) g.rotate(o.rot); g.scale(s * (o.sx || 1), s);
  g.lineJoin = 'round'; g.lineCap = 'round';
  const bob = o.still ? 0 : Math.sin(t * 3.2 + (o.ph || 0)) * 3;
  // 腿
  if (o.legs !== 'none') {
    const L = o.legs === 'sit' ? [[-36, -70, -70, -40], [36, -70, 70, -40]] : o.legs === 'run' ? [[-36, -70, -36 + Math.sin(t * 18) * 26, -4], [36, -70, 36 - Math.sin(t * 18) * 26, -4]] : [[-36, -70, -42, -4], [36, -70, 42, -4]];
    for (const [x0, y0, x1, y1] of L) {
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.strokeStyle = INK; g.lineWidth = lw * 2.2; g.stroke();
      ell(g, x1 + (x1 < 0 ? -10 : 10), y1 + 2, 20, 11); fs(g, '#F7A1B5', INK, lw * .8);
    }
  }
  g.translate(0, BC + bob);
  // 警报灯光束（在身后）
  if (o.siren > 0) {
    const a = o.siren, rot = t * 9;
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const [k, col] of [[0, '255,40,40'], [Math.PI, '40,120,255']]) {
      const ang = rot + k; const gr = g.createRadialGradient(0, -92, 10, 0, -92, 900);
      gr.addColorStop(0, `rgba(${col},${.55 * a})`); gr.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = gr; g.beginPath(); g.moveTo(0, -92); g.arc(0, -92, 900, ang - .32, ang + .32); g.closePath(); g.fill();
    }
    g.restore();
  }
  // 身体（脑子）
  g.fillStyle = INK; for (const [x, y, r] of LOBES) { circ(g, x, y, r + lw); g.fill(); }
  g.fillStyle = o.col || '#F7A1B5'; for (const [x, y, r] of LOBES) { circ(g, x, y, r); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.35)'; ell(g, -52, -52, 26, 12, -.4); g.fill();
  g.strokeStyle = '#D96C8C'; g.lineWidth = lw * .85;
  for (const [a, b, c, d, e, f] of FOLDS) { g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo(c, d, e, f); g.stroke(); }
  g.beginPath(); g.moveTo(0, -86); g.quadraticCurveTo(8, -70, 0, -54); g.stroke();
  // 豹纹头带 + 骨头
  if (o.band !== false) {
    g.save(); g.beginPath(); g.ellipse(0, 6, 128, 84, 0, Math.PI * 1.1, Math.PI * 1.9); g.lineWidth = 30; g.strokeStyle = INK; g.stroke();
    g.lineWidth = 22; g.strokeStyle = '#E9A846'; g.stroke();
    g.fillStyle = '#6B3F1E'; for (let i = 0; i < 9; i++) { const a = Math.PI * (1.14 + .72 * i / 8); circ(g, Math.cos(a) * 128, 6 + Math.sin(a) * 84, 4.5); g.fill(); }
    g.restore();
    g.save(); g.translate(-62, -78); g.rotate(-.7);
    rr(g, -6, -30, 12, 60, 6); fs(g, '#FFF8EA', INK, lw * .7);
    for (const [x, y] of [[-8, -30], [8, -30], [-8, 30], [8, 30]]) { circ(g, x, y, 9); fs(g, '#FFF8EA', INK, lw * .7); }
    g.fillStyle = '#FFF8EA'; g.fillRect(-5, -30, 10, 60);
    g.restore();
    g.save(); g.translate(112, -40); for (const r of [-.5, .4]) { g.save(); g.rotate(r); rr(g, 0, -8, 40, 16, 8); fs(g, '#E9A846', INK, lw * .7); g.restore(); } g.restore();
  }
  // 警报灯
  if (o.siren !== undefined && o.siren > 0) {
    rr(g, -26, -112, 52, 14, 4); fs(g, '#555', INK, lw * .8);
    g.beginPath(); g.arc(0, -112, 24, Math.PI, TAU); g.closePath();
    const on = Math.sin(t * 18) > 0; fs(g, on ? '#FF3B3B' : '#C42A2A', INK, lw * .8);
    g.fillStyle = 'rgba(255,255,255,.6)'; ell(g, -8, -124, 6, 8, -.4); g.fill();
  }
  // 脸
  eyePair(g, o, 0, -6, 36, 1.15, lw);
  mouthAt(g, o, 0, 38, 1.1, lw);
  if (o.blush) { g.fillStyle = `rgba(255,90,120,${.45 * o.blush})`; ell(g, -66, 22, 15, 8); g.fill(); ell(g, 66, 22, 15, 8); g.fill(); }
  if (o.sweat) { g.beginPath(); g.moveTo(96, -60); g.quadraticCurveTo(110, -36, 98, -28); g.quadraticCurveTo(84, -36, 96, -60); fs(g, 'rgba(140,210,255,.95)', INK, lw * .5); }
  // 手臂
  const A = o.arms || {}, L = A.l || [-150, 40], Rr = A.r || [150, 40];
  for (const [sx, [hx, hy]] of [[-100, L], [100, Rr]]) {
    g.beginPath(); g.moveTo(sx, 20); g.quadraticCurveTo((sx + hx) / 2, (20 + hy) / 2 + 20, hx, hy); g.strokeStyle = INK; g.lineWidth = lw * 2.2; g.stroke();
  }
  if (o.hands) o.hands(g, L, Rr);
  for (const [hx, hy] of [L, Rr]) { circ(g, hx, hy, 14); fs(g, '#F7A1B5', INK, lw * .8); }
  if (o.handsTop) o.handsTop(g, L, Rr);
  g.restore();
}
