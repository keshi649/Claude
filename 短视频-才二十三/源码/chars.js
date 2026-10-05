'use strict';
/* chars.js：角色。主角是一根红白条纹的生日蜡烛"小烛"，头上的火苗就是它的心情；
   朋友：纸杯蛋糕"小糕"、茶杯"小杯"、甜甜圈"小圈"；还有地铁里灰扑扑的通勤人。全部原创。 */

/* 火苗：底部在 (x, y)，size 是整体大小，t 用来抖动 */
function flame(g, x, y, size, t, glow = .5, seed = 0) {
  if (size <= .02) return;
  const h = 64 * size * (1 + .08 * noise1(t * 7, seed)), w = 30 * size;
  const tip = noise1(t * 5.3, seed + 3) * 9 * size;
  if (glow > 0) {
    g.save(); g.globalCompositeOperation = 'lighter';
    g.fillStyle = rgrad(g, x, y - h * .45, 0, h * 2.2, [[0, `rgba(255,190,90,${.38 * glow})`], [.4, `rgba(255,150,60,${.14 * glow})`], [1, 'rgba(255,120,40,0)']]);
    g.fillRect(x - h * 2.3, y - h * 2.8, h * 4.6, h * 4.6);
    g.restore();
  }
  const drop = (sc, col) => {
    g.beginPath();
    g.moveTo(x + tip * sc, y - h * sc);
    g.bezierCurveTo(x + w * .9 * sc, y - h * .45 * sc, x + w * sc, y - h * .02, x, y + h * .12 * sc);
    g.bezierCurveTo(x - w * sc, y - h * .02, x - w * .9 * sc, y - h * .45 * sc, x + tip * sc, y - h * sc);
    g.fillStyle = col; g.fill();
  };
  drop(1, '#FF9A3C'); drop(.72, '#FFC94A'); drop(.38, '#FFF6D8');
}

/* 细胳膊细腿：从 (x, y) 出发，角度 a（0 = 竖直向下，正值向右转），长度 len，带肘/膝弯曲 bend */
function limb(g, x, y, a, len, bend = 0, lw = 5, end = 'hand', endCol = INK) {
  const a1 = a, a2 = a + bend;
  const mx = x + Math.sin(a1) * len * .5, my = y + Math.cos(a1) * len * .5;
  const ex = mx + Math.sin(a2) * len * .5, ey = my + Math.cos(a2) * len * .5;
  g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(mx, my, ex, ey);
  g.strokeStyle = INK; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke();
  if (end === 'hand') { circ(g, ex, ey, lw * 1.25); fs(g, endCol); }
  else if (end === 'shoe') { ell(g, ex + 6 * Math.sign(Math.sin(a) || 1) * 0 + 5, ey + 1, 13, 7); fs(g, endCol, INK, 2.5); }
  return [ex, ey];
}

/* 脸：在 (0, 0) 画，r 是尺寸单位 */
function face(g, o, t) {
  const kind = o.face || 'smile';
  const blinkT = o.blink ?? (hash(Math.floor((t + (o.seed || 0)) / 2.7), 9) < .55 ? ((t + (o.seed || 0)) % 2.7) : 9);
  const blinking = blinkT < .12;
  const lx = o.look || 0, ly = o.lookY || 0;
  const ex = 17, ey = 0;
  g.lineCap = 'round';
  // 眼睛
  const eye = (sx) => {
    const x = sx * ex + lx, y = ey + ly;
    if (kind === 'happy' || kind === 'grin') { g.beginPath(); g.arc(x, y + 4, 8, Math.PI * 1.1, Math.PI * 1.9); g.strokeStyle = INK; g.lineWidth = 4.5; g.stroke(); return; }
    if (kind === 'sleep' || kind === 'wish' || (blinking && kind !== 'surprise')) {
      g.beginPath();
      if (kind === 'wish') g.arc(x, y - 2, 7, Math.PI * .15, Math.PI * .85); else { g.moveTo(x - 7, y); g.lineTo(x + 7, y); }
      g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); return;
    }
    const big = kind === 'surprise' ? 1.35 : 1;
    ell(g, x, y, 6.5 * big, 9 * big); fs(g, INK);
    circ(g, x + 2, y - 3.5, 2.4 * big); fs(g, '#fff');
    if (kind === 'sad' || kind === 'worry' || kind === 'tired') {
      g.beginPath(); g.moveTo(x - sx * 10, y - 18 + (kind === 'tired' ? 4 : 0)); g.lineTo(x + sx * 4, y - 13 - (kind === 'sad' ? 4 : 0));
      g.strokeStyle = INK; g.lineWidth = 3.5; g.stroke();
    }
    if (kind === 'tired') { g.beginPath(); g.arc(x, y + 9, 7, .2, Math.PI - .2); g.strokeStyle = 'rgba(80,60,90,.45)'; g.lineWidth = 2.5; g.stroke(); }
  };
  eye(-1); eye(1);
  // 腮红
  if (o.blush !== 0) { g.fillStyle = `rgba(240,110,120,${.55 * (o.blush ?? 1)})`; ell(g, -29 + lx * .5, 16, 9, 5.5); g.fill(); ell(g, 29 + lx * .5, 16, 9, 5.5); g.fill(); }
  // 嘴
  const m = o.mouth || 0, mx = lx * .6, my = 18 + ly;
  if (m > .06) {
    const mh = 4 + m * 13, mw = 8 + m * 4;
    ell(g, mx, my + mh * .3, mw, mh); fs(g, '#7A1F2B', INK, 3);
    g.save(); ell(g, mx, my + mh * .3, mw, mh); g.clip(); ell(g, mx, my + mh * 1.05, mw * .8, mh * .55); fs(g, '#F07A86'); g.restore();
  } else if (kind === 'surprise') { ell(g, mx, my + 4, 6, 8); fs(g, '#7A1F2B', INK, 3); }
  else if (kind === 'sad') { g.beginPath(); g.arc(mx, my + 10, 9, Math.PI * 1.15, Math.PI * 1.85); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); }
  else if (kind === 'worry' || kind === 'tired') {
    g.beginPath(); g.moveTo(mx - 10, my + 3); g.quadraticCurveTo(mx - 5, my - 2, mx, my + 3); g.quadraticCurveTo(mx + 5, my + 8, mx + 10, my + 3);
    g.strokeStyle = INK; g.lineWidth = 3.5; g.stroke();
  } else if (kind === 'grin' || kind === 'happy') {
    g.beginPath(); g.moveTo(mx - 12, my - 1); g.quadraticCurveTo(mx, my + 20, mx + 12, my - 1); g.closePath(); fs(g, '#7A1F2B', INK, 3);
  } else if (kind === 'sleep') { ell(g, mx, my + 3, 4, 3); fs(g, '#7A1F2B'); }
  else { g.beginPath(); g.arc(mx, my - 2, 8, Math.PI * .15, Math.PI * .85); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); }
}

/* 走路：phase 是步伐相位（每 1.0 一个完整周期） */
function legs(g, o, y0, hipX, legLen, shoeCol) {
  const w = o.walk;
  let aL = .06, aR = -.06, lift = 0;
  if (w != null) {
    const p = w * TAU;
    aL = Math.sin(p) * .5; aR = -Math.sin(p) * .5; lift = Math.abs(Math.cos(p)) * 4;
  }
  if (o.legs) [aL, aR] = o.legs;
  if (o.sit) { // 坐着：腿向前伸
    limb(g, -hipX, y0, -1.45 + (o.kick ? Math.sin(o.kick) * .25 : 0), legLen * .9, .2, 5.5, 'shoe', shoeCol);
    limb(g, hipX, y0, -1.35 + (o.kick ? Math.cos(o.kick) * .25 : 0), legLen * .9, .2, 5.5, 'shoe', shoeCol);
    return;
  }
  limb(g, -hipX, y0, aL, legLen, 0, 5.5, 'shoe', shoeCol);
  limb(g, hipX, y0, aR, legLen, 0, 5.5, 'shoe', shoeCol);
  return lift;
}

/* 主角：小烛。脚底在 (x, y)。
   o: s 缩放, face, mouth, flame（0 灭 / 1 正常 / >1 旺）, glow, armL/armR（弧度，0 下垂，正值抬起）, bendL/bendR,
      walk（步伐相位）, sit, tilt, squash, look, flip, stripes, melt（顶部融化程度 0-1）, hat, scarf, prop(g) 手上道具回调 */
function candle(g, x, y, t, o = {}) {
  const s = o.s ?? 1;
  g.save();
  g.translate(x, y);
  g.scale(s * (o.flip ? -1 : 1), s);
  if (o.tilt) g.rotate(o.tilt);
  const sq = o.squash ?? 0;               // 正值压扁
  const hb = 138 * (1 - sq) * (1 - (o.short || 0)), bw = 88 * (1 + sq * .5);
  const legLen = o.sit ? 34 : 38;
  const by = o.sit ? -10 : -legLen;       // 身体底边
  const top = by - hb;
  // 影子
  if (o.shadow !== false) { g.fillStyle = 'rgba(40,20,30,.16)'; ell(g, 0, 2, 48, 9); g.fill(); }
  // 腿
  legs(g, o, by - 4, 17, legLen, o.shoe || C.red);
  // 胳膊（在身体后面的一侧先画）
  const arm = (side) => {
    const a = side < 0 ? (o.armL ?? .25) : (o.armR ?? .25);
    const bend = side < 0 ? (o.bendL ?? .25) : (o.bendR ?? .25);
    return limb(g, side * (bw / 2 - 4), top + hb * .52, side * a, 58, -side * bend, 5);
  };
  // 身体
  rr(g, -bw / 2, top, bw, hb, [26, 26, 20, 20]);
  fs(g, '#FFF6E6');
  g.save();
  rr(g, -bw / 2, top, bw, hb, [26, 26, 20, 20]); g.clip();
  if (o.stripes !== false) {
    g.fillStyle = o.stripeCol || C.red;
    for (let i = -6; i < 8; i++) {
      const yy = top + i * 38;
      g.beginPath(); g.moveTo(-bw, yy); g.lineTo(bw, yy - 46); g.lineTo(bw, yy - 30); g.lineTo(-bw, yy + 16); g.closePath(); g.fill();
    }
  }
  // 右侧阴影 + 左侧高光
  g.fillStyle = 'rgba(120,40,40,.13)'; g.fillRect(bw / 2 - 18, top, 18, hb);
  g.fillStyle = 'rgba(255,255,255,.45)'; rr(g, -bw / 2 + 9, top + 22, 9, hb - 44, 5); g.fill();
  // 脸部区域的蜡（让脸干净）
  ell(g, 0, top + 58, 40, 36); fs(g, '#FFF6E6');
  g.restore();
  // 顶部蜡滴
  g.fillStyle = '#FFFBF2';
  g.beginPath(); g.moveTo(-bw / 2 + 4, top + 14);
  const melt = o.melt || 0;
  const drips = [[-30, 18 + melt * 30], [-12, 30 + melt * 50], [8, 14 + melt * 20], [26, 34 + melt * 60]];
  g.quadraticCurveTo(-bw / 2, top - 4, -bw / 2 + 22, top - 4);
  g.lineTo(bw / 2 - 22, top - 4); g.quadraticCurveTo(bw / 2, top - 4, bw / 2 - 4, top + 14);
  for (let i = drips.length - 1; i >= 0; i--) { const [dx, dl] = drips[i]; g.lineTo(dx + 7, top + 10); g.quadraticCurveTo(dx + 7, top + dl, dx, top + dl + 2); g.quadraticCurveTo(dx - 7, top + dl, dx - 7, top + 10); }
  g.closePath(); g.fill();
  g.strokeStyle = 'rgba(51,38,42,.35)'; g.lineWidth = 2; g.stroke();
  rr(g, -bw / 2, top, bw, hb, [26, 26, 20, 20]); g.strokeStyle = INK; g.lineWidth = 4.5; g.stroke();
  // 胳膊
  const hL = arm(-1), hR = arm(1);
  if (o.prop) o.prop(g, hL, hR, top);
  // 脸
  g.save(); g.translate(0, top + 50); face(g, o, t); g.restore();
  // 汗滴
  if (o.sweat) { g.save(); g.globalAlpha *= o.sweat; g.fillStyle = '#8FD3F0'; g.beginPath(); const sx = 46, sy = top + 22 + (t * 40 % 30); g.moveTo(sx, sy - 12); g.quadraticCurveTo(sx + 9, sy, sx, sy + 6); g.quadraticCurveTo(sx - 9, sy, sx, sy - 12); g.fill(); g.restore(); }
  // 引线和火苗
  line(g, 0, top - 4, 0 + (o.wickBend || 0), top - 20, INK, 4);
  if (o.hat === 'party') {
    g.save(); g.translate(-22, top + 2); g.rotate(-.35);
    poly(g, [[-22, 0], [22, 0], [0, -62]]); fs(g, C.teal, INK, 3.5);
    g.save(); poly(g, [[-22, 0], [22, 0], [0, -62]]); g.clip(); for (let i = 0; i < 4; i++) { g.fillStyle = C.yel; g.fillRect(-30, -14 - i * 16, 60, 6); } g.restore();
    circ(g, 0, -64, 8); fs(g, C.pink, INK, 3);
    g.restore();
  }
  if (o.scarf) {
    const sw = Math.sin(t * 9) * 6;
    g.fillStyle = C.mustard; rr(g, -bw / 2 - 2, top + hb * .42, bw + 4, 16, 6); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
    poly(g, [[bw / 2 - 6, top + hb * .45], [bw / 2 + 50, top + hb * .38 + sw], [bw / 2 + 60, top + hb * .5 + sw], [bw / 2 - 4, top + hb * .55]]); fs(g, C.mustard, INK, 3);
  }
  const fl = o.flame ?? 1;
  if (fl > 0) flame(g, (o.wickBend || 0), top - 18, fl, t + (o.seed || 0), o.glow ?? .5, o.seed || 0);
  g.restore();
}

/* 朋友们：kind = 'cake' | 'cup' | 'donut'，脚底在 (x, y) */
function friend(g, kind, x, y, t, o = {}) {
  const s = o.s ?? 1;
  g.save(); g.translate(x, y); g.scale(s * (o.flip ? -1 : 1), s);
  if (o.tilt) g.rotate(o.tilt);
  if (o.shadow !== false) { g.fillStyle = 'rgba(40,20,30,.16)'; ell(g, 0, 2, 46, 9); g.fill(); }
  legs(g, o, -36, 15, 36, o.shoe || C.navy);
  let faceY, armY, bw;
  if (kind === 'cake') {
    // 纸托
    poly(g, [[-44, -36], [44, -36], [52, -104], [-52, -104]]); fs(g, C.pink, INK, 4);
    g.save(); poly(g, [[-44, -36], [44, -36], [52, -104], [-52, -104]]); g.clip();
    for (let i = -5; i <= 5; i++) { g.fillStyle = 'rgba(232,115,122,.55)'; g.fillRect(i * 14 - 3, -110, 6, 80); }
    g.restore();
    // 奶油
    g.beginPath(); g.moveTo(-58, -100);
    g.bezierCurveTo(-70, -140, -36, -150, -30, -150); g.bezierCurveTo(-36, -186, 30, -190, 26, -152);
    g.bezierCurveTo(50, -160, 72, -130, 58, -100); g.closePath(); fs(g, '#FFF3F0', INK, 4);
    g.beginPath(); g.moveTo(-40, -128); g.quadraticCurveTo(0, -112, 42, -128); g.strokeStyle = 'rgba(232,115,122,.5)'; g.lineWidth = 4; g.stroke();
    circ(g, 6, -196, 13); fs(g, C.red, INK, 3.5);
    g.beginPath(); g.moveTo(6, -208); g.quadraticCurveTo(12, -224, 24, -228); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
    [[-30, -120, C.yel], [20, -140, C.teal], [-6, -160, C.rose], [36, -118, C.mustard]].forEach(([a, b, c]) => { rr(g, a, b, 10, 4, 2); fs(g, c); });
    faceY = -72; armY = -84; bw = 92;
  } else if (kind === 'cup') {
    // 杯碟
    ell(g, 0, -38, 60, 10); fs(g, C.cream, INK, 4);
    // 把手
    g.beginPath(); g.arc(48, -94, 22, -Math.PI * .55, Math.PI * .55); g.strokeStyle = INK; g.lineWidth = 15; g.stroke(); g.strokeStyle = C.tealL; g.lineWidth = 8; g.stroke();
    g.beginPath(); g.moveTo(-50, -140); g.lineTo(50, -140); g.bezierCurveTo(50, -80, 34, -44, 0, -44); g.bezierCurveTo(-34, -44, -50, -80, -50, -140); g.closePath();
    fs(g, C.tealL, INK, 4);
    g.save(); g.clip(); g.fillStyle = C.teal; g.fillRect(-60, -126, 120, 10); heart(g, 0, -64, 14, C.rose); g.restore();
    ell(g, 0, -140, 50, 9); fs(g, '#B5774A', INK, 4);
    for (let i = 0; i < 2; i++) {
      const ph = t * 1.2 + i * .5, a = (ph % 1);
      g.save(); g.globalAlpha = Math.sin(a * Math.PI) * .7;
      g.beginPath(); const sx = -14 + i * 26; g.moveTo(sx, -154 - a * 40);
      g.bezierCurveTo(sx + 12, -170 - a * 40, sx - 12, -186 - a * 40, sx, -200 - a * 40); g.strokeStyle = C.white; g.lineWidth = 5; g.lineCap = 'round'; g.stroke(); g.restore();
    }
    faceY = -100; armY = -96; bw = 96;
  } else {
    // 甜甜圈（竖着站）
    circ(g, 0, -100, 64); fs(g, '#E8B074', INK, 4);
    g.save(); circ(g, 0, -100, 64); g.clip();
    g.beginPath(); g.moveTo(-70, -100);
    for (let i = 0; i <= 14; i++) { const xx = -70 + i * 10; g.lineTo(xx, -112 + (i % 2 ? 12 : 0) + Math.sin(i) * 5); }
    g.lineTo(70, -180); g.lineTo(-70, -180); g.closePath(); g.fillStyle = '#F48FB1'; g.fill();
    const r = R(3); for (let i = 0; i < 16; i++) { const a = r() * TAU, d = 30 + r() * 30; const px = Math.cos(a) * d, py = -100 + Math.sin(a) * d; if (py < -104) { g.save(); g.translate(px, py); g.rotate(r() * 3); rr(g, -6, -2, 12, 4, 2); fs(g, [C.yel, C.teal, C.white, C.navy][i % 4]); g.restore(); } }
    g.restore();
    circ(g, 0, -100, 64); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
    circ(g, 0, -100, 15); fs(g, o.hole || C.cream, INK, 4);
    faceY = -138; armY = -96; bw = 128;
  }
  limb(g, -bw / 2 + 4, armY, -(o.armL ?? .3), 50, .25, 5);
  limb(g, bw / 2 - 4, armY, o.armR ?? .3, 50, -.25, 5);
  g.save(); g.translate(0, faceY); g.scale(.85, .85); face(g, { ...o, blush: o.blush ?? 1 }, t); g.restore();
  if (o.hat === 'party') {
    g.save(); g.translate(16, kind === 'cake' ? -206 : kind === 'cup' ? -150 : -160); g.rotate(.3);
    poly(g, [[-20, 0], [20, 0], [0, -56]]); fs(g, C.mustard, INK, 3.5);
    circ(g, 0, -58, 7); fs(g, C.rose, INK, 3); g.restore();
  }
  g.restore();
}

/* 通勤人：灰色圆角方块，脚底在 (x, y) */
function commuter(g, x, y, t, o = {}) {
  const s = o.s ?? 1, hgt = o.h || 170, w = o.w || 86;
  g.save(); g.translate(x, y); g.scale(s, s); if (o.tilt) g.rotate(o.tilt);
  legs(g, o, -34, 16, 34, '#4A4752');
  rr(g, -w / 2, -34 - hgt, w, hgt, 30); fs(g, o.col || C.grey, INK, 4);
  g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(w / 2 - 16, -34 - hgt + 20, 12, hgt - 40);
  if (o.tie) { poly(g, [[0, -34 - hgt * .55], [8, -34 - hgt * .4], [0, -34 - hgt * .2], [-8, -34 - hgt * .4]]); fs(g, o.tie, INK, 2.5); }
  limb(g, -w / 2 + 4, -34 - hgt * .5, -(o.armL ?? .15), 54, .1, 5);
  limb(g, w / 2 - 4, -34 - hgt * .5, o.armR ?? .15, 54, -.1, 5);
  g.save(); g.translate(0, -34 - hgt + 50); face(g, { face: o.face || 'tired', blush: o.blush ?? 0, seed: o.seed || 0, look: o.look || 0 }, t); g.restore();
  if (o.phone) { g.save(); g.translate(18, -34 - hgt * .62); rr(g, -10, -16, 20, 32, 4); fs(g, INK); g.fillStyle = '#9FD8FF'; g.fillRect(-7, -12, 14, 22); g.restore(); }
  g.restore();
}
