'use strict';
/* scenes3.js：天台派对、"才 23%"的进度条、通往星星的台阶、许愿、尾奏回顾、片尾。 */

/* 烟花：t0 在 (x, y) 炸开 */
function firework(g, s, t0, x, y, r, col, seed, n = 28) {
  const u = (s - t0) / 1.5;
  if (u < -.25 || u > 1) return;
  if (u < 0) { const k = (u + .25) / .25; line(g, x, H - 200 - (H - 200 - y) * k + 30, x, H - 200 - (H - 200 - y) * k, `rgba(255,240,200,${k})`, 4); return; }
  const rr_ = r * E.out5(Math.min(1, u * 1.6)), fall = u * u * 90;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const a = i * TAU / n + seed, d = rr_ * (.85 + .15 * hash(i, seed * 100));
    const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d + fall;
    const al = (1 - u) * (u > .7 ? (.5 + .5 * Math.sin(s * 40 + i)) : 1);
    line(g, x + Math.cos(a) * d * .7, y + Math.sin(a) * d * .7 + fall * .8, px, py, col.replace('A', String(al * .7)), 5);
    circ(g, px, py, 5); g.fillStyle = col.replace('A', String(al)); g.fill();
  }
  g.restore();
}
const FW_COLS = ['rgba(255,120,130,A)', 'rgba(255,214,92,A)', 'rgba(124,230,210,A)', 'rgba(190,150,255,A)', 'rgba(255,170,90,A)'];

/* ================= 14 天台派对 ================= */
function mic(g, x, y, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  rr(g, -7, 0, 14, 50, 5); fs(g, '#3A3F4A', INK, 3);
  circ(g, 0, -6, 16); fs(g, '#C9CED6', INK, 3);
  g.restore();
}
function boombox(g, x, y, s) {
  rr(g, x - 130, y - 110, 260, 110, 14); fs(g, C.red, INK, 5);
  line(g, x - 80, y - 110, x - 60, y - 150, INK, 6); line(g, x + 80, y - 110, x + 60, y - 150, INK, 6); line(g, x - 60, y - 150, x + 60, y - 150, INK, 6);
  const p = pulse(s, 9);
  [-70, 70].forEach(dx => { circ(g, x + dx, y - 55, 36 + p * 6); fs(g, '#3A3F4A', INK, 4); circ(g, x + dx, y - 55, 14 + p * 4); fs(g, C.grey); });
  rr(g, x - 26, y - 90, 52, 22, 4); fs(g, C.cream, INK, 3);
}
function stringLights(g, s, y0, sag, n) {
  g.beginPath(); g.moveTo(-20, y0); g.quadraticCurveTo(W / 2, y0 + sag * 2, W + 20, y0); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
  for (let i = 0; i < n; i++) {
    const u = (i + .5) / n, x = lerp(-20, W + 20, u), y = (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * (y0 + sag * 2) + u * u * y0;
    const on = (i + Math.floor(beatIdx(s))) % 3 !== 0;
    const col = [C.yel, C.rose, C.tealL, C.mustard][i % 4];
    if (on) { g.fillStyle = rgrad(g, x, y + 16, 2, 40, [[0, 'rgba(255,230,160,.6)'], [1, 'rgba(255,230,160,0)']]); g.fillRect(x - 40, y - 24, 80, 80); }
    ell(g, x, y + 16, 10, 14); fs(g, on ? col : '#6B6680', INK, 2.5);
  }
}
const S_PARTY = {
  draw(g, s) {
    const t0 = bar(87);
    rooftop(g, s, { party: 1, moonHat: true });
    // 烟花：每小节一朵，后半段每两拍一朵，最后一小节一起炸
    for (let b = 87; b < 100; b++) {
      const per = b >= 95 ? 2 : 4;
      for (let k = 0; k < 4; k += per) {
        const tt = bar(b) + k * BEAT, i = b * 4 + k;
        firework(g, s, tt, 260 + hash(i, 1) * 1400, 140 + hash(i, 2) * 260, 120 + hash(i, 3) * 90, FW_COLS[i % 5], i);
      }
    }
    if (s > bar(99)) for (let i = 0; i < 6; i++) firework(g, s, bar(99) + i * .06, 200 + i * 300, 160 + (i % 2) * 120, 200, FW_COLS[i % 5], 300 + i, 36);
    stringLights(g, s, 60, 60, 18);
    // 水塔上的猫也在跳
    g.save(); g.translate(300, 330 - bob(s) * 12); g.fillStyle = '#16142A';
    ell(g, 0, -30, 34, 30); g.fill(); circ(g, 0, -74, 24); g.fill();
    poly(g, [[-20, -88], [-16, -112], [-4, -94]]); g.fill(); poly(g, [[4, -94], [16, -112], [20, -88]]); g.fill();
    line(g, -30, -40, -56, -80 - bob(s) * 20, '#16142A', 8); line(g, 30, -40, 56, -80 - bob(s + BEAT) * 20, '#16142A', 8);
    circ(g, -8, -76, 4); fs(g, '#FFE27A'); circ(g, 8, -76, 4); fs(g, '#FFE27A');
    g.restore();
    // 一排跳舞的朋友（各自错开半拍）
    const crew = [['donut', 470], ['cup', 680], ['commuter', 1240, '#F2A7B5'], ['cake', 1450], ['commuter', 1660, '#9FC8F0']];
    crew.forEach(([k, x, col], i) => {
      const off = (i % 2) * BEAT, b = bob(s + off), y = 880 - b * 18;
      const arms = { armL: 2.4 - b * .8, armR: .6 + b * 1.6 };
      if (k === 'commuter') commuter(g, x, y, s, { s: .95, h: 250, col, face: 'happy', blush: 1, tilt: Math.sin(beatIdx(s + off) * Math.PI / 2) * .08, seed: i, ...arms });
      else friend(g, k, x, y, s, { s: 1, face: 'happy', hat: 'party', tilt: Math.sin(beatIdx(s + off) * Math.PI / 2) * .08, seed: i, mouth: sing(s) * .5, ...arms });
    });
    boombox(g, 1820, 900, s);
    // 主角拿着话筒唱
    const b = bob(s);
    candle(g, 960, 930 - b * 16, s, {
      s: 1.45, face: 'happy', mouth: sing(s), flame: 1.3 + pulse(s, 6, 4) * .4, glow: 1.2, hat: 'party', scarf: true,
      armL: .9, bendL: 2.0, armR: 2.5 - b * .3, tilt: Math.sin(beatIdx(s) * Math.PI / 2) * .05,
      prop: (g, hl) => mic(g, hl[0] + 6, hl[1] - 26, .5),
    });
  },
};

/* ================= 15 人生进度条：才 23% ================= */
const PB = { x0: 300, len: 9000, y: 720, h: 96 };   // 世界坐标里的进度条
const pbX = p => PB.x0 + PB.len * p / 100;
const MILES = [
  [30, '去看海', 'boat'], [40, '养一只狗', 'dog'], [50, '开一家小店', 'shop'], [60, '学会弹琴', 'piano'],
  [70, '环游世界', 'globe'], [80, '种一院子花', 'flower'], [90, '还在唱歌', 'note'], [100, '？', 'q'],
];
function mileIcon(g, kind, x, y, s) {
  g.save(); g.translate(x, y);
  if (kind === 'boat') { poly(g, [[-50, 10], [50, 10], [34, 34], [-34, 34]]); fs(g, C.red, INK, 3); poly(g, [[0, -60], [0, 6], [44, 6]]); fs(g, C.white, INK, 3); }
  if (kind === 'dog') { ell(g, 0, 0, 44, 28); fs(g, '#E8B074', INK, 3); circ(g, 40, -24, 22); fs(g, '#E8B074', INK, 3); ell(g, 52, -40, 8, 14, .4); fs(g, C.brown, INK, 2); circ(g, 46, -26, 3.5); fs(g, INK); for (const dx of [-28, -10, 14, 30]) line(g, dx, 22, dx, 40, INK, 6); g.beginPath(); g.moveTo(-42, -6); g.quadraticCurveTo(-60, -30 + Math.sin(s * 14) * 10, -66, -20); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); }
  if (kind === 'shop') { rr(g, -54, -30, 108, 64, 4); fs(g, C.cream, INK, 3); for (let i = 0; i < 5; i++) { rr(g, -60 + i * 24, -50, 24, 22, 2); fs(g, i % 2 ? C.white : C.teal, INK, 2); } rr(g, -14, 0, 28, 34, 3); fs(g, C.brown, INK, 2); }
  if (kind === 'piano') { rr(g, -60, -20, 120, 44, 6); fs(g, INK); for (let i = 0; i < 8; i++) { rr(g, -56 + i * 14, -16, 12, 36, 2); fs(g, C.white); } for (const i of [0, 1, 3, 4, 5]) { rr(g, -46 + i * 14, -16, 8, 22, 1); fs(g, INK); } }
  if (kind === 'globe') { circ(g, 0, -6, 44); fs(g, '#6EC6E8', INK, 3); g.save(); circ(g, 0, -6, 44); g.clip(); g.fillStyle = C.grass; ell(g, -14 + (s * 20 % 60) - 30, -16, 22, 14); g.fill(); ell(g, 20 + (s * 20 % 60) - 30, 10, 16, 20); g.fill(); g.restore(); line(g, 0, 38, 0, 50, INK, 5); line(g, -24, 50, 24, 50, INK, 6); }
  if (kind === 'flower') { for (let i = 0; i < 3; i++) { const fx = -36 + i * 36; line(g, fx, 30, fx, -10, C.grassD, 5); for (let k = 0; k < 5; k++) { const a = k * TAU / 5 + s; circ(g, fx + Math.cos(a) * 12, -18 + Math.sin(a) * 12, 9); fs(g, [C.pink, C.yel, C.rose][i]); } circ(g, fx, -18, 6); fs(g, C.mustard); } }
  if (kind === 'note') { noteGlyph(g, -16, 20, 40, C.red, -.1); noteGlyph(g, 30, 4, 30, C.teal, .1); }
  if (kind === 'q') { text(g, '?', 0, -6, 110, { k: 'cute', col: C.red, stroke: INK, lw: 10 }); }
  g.restore();
}
function progressWorld(g, s, camX, camY, t0) {
  const dusk = clamp(camY / 1400);
  g.fillStyle = vgrad(g, 0, H, [[0, mixc('#8FD0EA', '#1B2149', dusk)], [.7, mixc('#E3F5F7', '#5B4C8A', dusk)], [1, mixc('#FFF2D2', '#C9739A', dusk)]]); g.fillRect(0, 0, W, H);
  if (dusk > .05) withAlpha(g, dusk, () => starfield(g, s, 140, 61, H));
  g.save(); g.translate(-camX * .15, camY * .3);
  for (let i = 0; i < 6; i++) cloud(g, 200 + i * 520, 160 + (i % 3) * 70, .9, mixc('#FFFFFF', '#8E86B8', dusk));
  g.restore();
  g.save(); g.translate(0, camY);
  // 远景山
  g.save(); g.translate(-camX * .3, 0);
  hills(g, 0, 900, 90, .0016, 0, mixc('#B9A6D9', '#3A3466', dusk), 5);
  g.restore();
  g.save(); g.translate(-camX * .6, 0);
  g.fillStyle = mixc('#9CCB8E', '#2F3A55', dusk); g.fillRect(-200, 960, 9000, 300);
  for (let i = 0; i < 40; i++) tree(g, i * 300 + 80, 990, 1, mixc(i % 2 ? C.grass : C.grassD, '#2A4A44', dusk));
  g.restore();
  // 进度条
  g.save(); g.translate(-camX, 0);
  const x0 = PB.x0, x1 = pbX(100), y = PB.y, h = PB.h;
  // 支柱
  for (let x = x0 + 200; x < x1; x += 700) { rr(g, x - 16, y + h, 32, 400, 4); fs(g, '#CFC6D8', INK, 4); }
  rr(g, x0 - 10, y - 10, x1 - x0 + 20, h + 20, 58); fs(g, '#3A3550', INK, 6);
  rr(g, x0, y, x1 - x0, h, 48); fs(g, '#F4F1EC');
  g.save(); rr(g, x0, y, pbX(23) - x0, h, [48, 0, 0, 48]); g.clip();
  g.fillStyle = C.red; g.fillRect(x0, y, pbX(23) - x0, h);
  g.fillStyle = 'rgba(255,255,255,.25)'; for (let k = 0; k < 40; k++) { const sx = x0 + k * 60 - (s * 80 % 60); poly(g, [[sx, y], [sx + 26, y], [sx - 14, y + h], [sx - 40, y + h]]); g.fill(); }
  g.restore();
  for (let p = 10; p < 100; p += 10) { const x = pbX(p); line(g, x, y + 8, x, y + 24, 'rgba(51,38,42,.35)', 4); line(g, x, y + h - 24, x, y + h - 8, 'rgba(51,38,42,.35)', 4); }
  // 里程碑
  MILES.forEach(([p, label, icon]) => {
    const x = pbX(p);
    line(g, x, y - 10, x, y - 130, INK, 6);
    rr(g, x - 110, y - 330, 220, 200, 18); fs(g, C.cream, INK, 5);
    mileIcon(g, icon, x, y - 245, s);
    text(g, p + '%', x, y - 160, 30, { k: 'en', col: C.red });
    text(g, label, x, y - 380, 40, { k: 'cute', col: INK, stroke: C.white, lw: 8 });
  });
  text(g, '0%', x0 + 60, y + h / 2, 34, { k: 'en', col: C.cream });
  g.restore();
  g.restore();
}
const S_PROGRESS = {
  draw(g, s) {
    const t0 = bar(100), go = bar(102), t1 = bar(112);
    const camX = pbX(23) - 760 + (pbX(92) - pbX(23)) * E.io(seg(s, go, t1 - .2));
    progressWorld(g, s, camX, 0, t0);
    // 小烛：先站在 23% 的位置，往后看，然后往前跑
    const runU = seg(s, go, t1 - .2), walking = s > go;
    const wx = walking ? camX + 760 + 260 * Math.sin(runU * Math.PI) : pbX(23);
    const cx = wx - camX, cy = PB.y - 6 - (walking ? Math.abs(Math.sin(s * 7)) * 10 : 0);
    // 朋友们跟在后面
    if (walking) {
      friend(g, 'cup', cx - 220, cy, s, { s: .8, walk: s * 3.4, face: 'happy', armL: 1.6, armR: 1.6, seed: 1 });
      friend(g, 'cake', cx - 400, cy, s, { s: .8, walk: s * 3.4 + .3, face: 'happy', armL: 2.4, armR: .5, seed: 2 });
      donutRoll(g, cx - 560, cy + 6, 58, s * 8, s);
    }
    candle(g, cx, cy, s, {
      s: 1.25, walk: walking ? s * 3.4 : null, face: s < bar(101) ? 'surprise' : 'happy', mouth: sing(s) * .8, flame: 1.15, wickBend: walking ? -12 : 0, scarf: true,
      look: s < go ? 10 : 6, armL: walking ? 1.2 + Math.sin(s * 21) * .5 : .3, armR: walking ? 1.2 - Math.sin(s * 21) * .5 : (s > bar(101) ? 2.6 : .3),
    });
    // 标语
    if (s > bar(101) && s < go + 1) {
      const a = win(s, bar(101), go + 1, .1, .5);
      withAlpha(g, a, () => {
        popText(g, s, bar(101), '才', 560, 300, 200, { k: 'brush', col: C.red, ext: 12, extCol: C.redD });
        popText(g, s, bar(101) + 2 * BEAT, '23%', 900, 300, 220, { k: 'en', col: C.red, ext: 12, extCol: C.redD });
      });
      text(g, '23%', cx, PB.y - 340, 46, { k: 'en', col: C.red, stroke: C.white, lw: 10, alpha: a });
    }
  },
};

/* ================= 16 通往星星的台阶 ================= */
const S_STAIRS = {
  draw(g, s) {
    const t0 = bar(112), top = bar(124);
    // 台阶：从 100% 的尽头开始，绕着往天上走
    const n = 24, stepH = 88, baseY = PB.y;
    const sx = i => 960 + 420 * Math.cos(i * .45) - i * 6, sy = i => baseY - (i + 1) * stepH;
    const mx = sx(n - 1) + 80, my = sy(n - 1) - 170;
    // 小烛一级级往上爬（每两拍一级）
    const k = clamp((s - t0) / BEAT * .5 - .5, 0, n - 1);
    const i0 = Math.floor(k), f = k - i0, i1 = Math.min(n - 1, i0 + 1);
    let cx = lerp(sx(i0), sx(i1), E.io(f)), cy = lerp(sy(i0), sy(i1), E.io(f)) - Math.sin(f * Math.PI) * 40;
    const onMoon = s > top - .6;
    if (onMoon) { const v = E.io(seg(s, top - .6, top + .4)); cx = lerp(cx, mx - 60, v); cy = lerp(cy, my + 60, v) - Math.sin(v * Math.PI) * 80; }
    if (s < t0 + BEAT) { cx = lerp(1360, sx(0), E.io(seg(s, t0 - .4, t0 + BEAT))); }
    // 镜头跟着小烛往上
    const camY = Math.max(0, 600 - cy);
    progressWorld(g, s, pbX(100) - 1500, camY, t0);
    g.save(); g.translate(0, camY);
    const lit = Math.floor((s - t0) / BEAT * .5);
    for (let i = 0; i < n; i++) {
      const x = sx(i) - 70, y = sy(i);
      if (y + camY > H + 60 || y + camY < -100) continue;
      const on = i <= lit;
      const col = on ? [C.red, C.mustard, C.teal, C.pink, C.tealL, C.rose][i % 6] : '#E9E4EE';
      if (on) { g.fillStyle = rgrad(g, x + 70, y + 20, 10, 140, [[0, 'rgba(255,230,160,.45)'], [1, 'rgba(255,230,160,0)']]); g.fillRect(x - 80, y - 120, 300, 280); }
      rr(g, x, y, 140, 36, 12); fs(g, col, INK, 4);
      if (on && i === lit) withAlpha(g, 1 - bphase(s, 2), () => { rr(g, x - 8, y - 8, 156, 52, 16); g.strokeStyle = '#FFF3C8'; g.lineWidth = 4; g.stroke(); });
    }
    // 月牙
    g.save(); g.translate(mx, my);
    g.fillStyle = rgrad(g, 0, 0, 60, 320, [[0, 'rgba(255,240,190,.4)'], [1, 'rgba(255,240,190,0)']]); g.fillRect(-320, -320, 640, 640);
    g.beginPath(); g.arc(0, 0, 170, Math.PI * .15, Math.PI * 1.85); g.arc(70, -30, 140, Math.PI * 1.72, Math.PI * .3, true); g.closePath(); fs(g, '#FFE9A8', INK, 5);
    g.restore();
    // 朋友们跟着爬，最后坐在月亮旁边
    if (s < top + .4) {
      const j1 = Math.max(0, i0 - 2), j2 = Math.max(0, i0 - 4);
      friend(g, 'cup', sx(j1), sy(j1), s, { s: .7, walk: s * 2, face: 'happy', armL: 2, armR: .6, seed: 1 });
      friend(g, 'cake', sx(j2), sy(j2), s, { s: .7, walk: s * 2 + .3, face: 'happy', armL: .6, armR: 2, seed: 2 });
    } else {
      friend(g, 'cup', mx - 250, my + 190, s, { s: .7, face: 'happy', armL: 2, armR: .5, seed: 1, shadow: false });
      friend(g, 'cake', mx + 230, my + 130, s, { s: .7, face: 'happy', armL: .5, armR: 2, seed: 2, shadow: false });
    }
    candle(g, cx, cy, s, {
      s: 1.05, sit: onMoon && s > top + .3, kick: s * 1.5, walk: onMoon || s < t0 + BEAT ? (s < t0 + BEAT ? s * 3 : null) : k * 2, face: 'happy', mouth: sing(s) * .8, flame: 1.1, glow: .4 + clamp(camY / 1500),
      armL: onMoon ? .4 : 1.6, armR: onMoon ? .4 : 1.6, look: onMoon ? 8 : 6, lookY: onMoon ? -8 : 0, scarf: true, shadow: !onMoon,
    });
    g.restore();
    // 流星（到月亮上之后）
    for (let i = 0; i < 3; i++) { const st = top + .5 + i * 1.2, v = (s - st) / 1; if (v < 0 || v > 1) continue; const x = lerp(1500 - i * 300, 900 - i * 300, v), y = lerp(80 + i * 60, 300 + i * 60, v); withAlpha(g, Math.sin(v * Math.PI), () => { line(g, x, y, x + 200, y - 70, 'rgba(255,240,200,.6)', 4); sparkle(g, x, y, 16, '#FFF3C8'); }); }
  },
};

/* ================= 17 许愿，以及那 6 秒的安静 ================= */
function gingham(g, x, y, w, h, c1, c2, sz = 60) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = C.white; g.fillRect(x, y, w, h);
  g.fillStyle = c1; g.globalAlpha = .5;
  for (let i = 0; i * sz < w + sz; i += 2) g.fillRect(x + i * sz, y, sz, h);
  for (let j = 0; j * sz < h + sz; j += 2) g.fillRect(x, y + j * sz, w, sz);
  g.globalAlpha = 1; g.restore();
}
const S_WISH = {
  draw(g, s) {
    const t0 = bar(126), hop = bar(127), wish = bar(129), blow = bar(136) + 2 * BEAT, quiet = bar(138), boom = bar(140);
    // 镜头：最后几秒慢慢推向火苗
    const z = 1 + 1.6 * E.io(seg(s, blow, boom));
    const fx = 960, fy = 470;
    g.save();
    g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-lerp(W / 2, fx, (z - 1) / 1.6), -lerp(H / 2, fy, (z - 1) / 1.6));
    // 房间
    g.fillStyle = '#3B2B3A'; g.fillRect(-200, -200, W + 400, H + 400);
    // 窗
    rr(g, 1300, 120, 420, 340, 10); fs(g, '#5A4258', INK, 5);
    g.save(); rr(g, 1316, 136, 388, 308, 6); g.clip(); g.fillStyle = vgrad(g, 136, 444, [[0, '#1B2149'], [1, '#3B3F7A']]); g.fillRect(1316, 136, 388, 308); starfield(g, s, 30, 77, 460); circ(g, 1600, 230, 48); fs(g, '#FFE9A8'); g.restore();
    line(g, 1510, 136, 1510, 444, '#5A4258', 10); line(g, 1316, 290, 1704, 290, '#5A4258', 10);
    // 墙上挂着纸拉花
    g.beginPath(); g.moveTo(80, 120); for (let i = 0; i <= 10; i++) g.quadraticCurveTo(80 + i * 110 - 55, 200, 80 + i * 110, 120); g.strokeStyle = '#6B4E6A'; g.lineWidth = 3; g.stroke();
    for (let i = 0; i < 10; i++) { poly(g, [[110 + i * 110, 150], [150 + i * 110, 150], [130 + i * 110, 200]]); fs(g, [C.rose, C.mustard, C.tealL][i % 3]); }
    // 桌子
    gingham(g, 0, 700, W, 380, C.red, C.red, 70);
    line(g, 0, 700, W, 700, INK, 5);
    // 朋友们围着桌子
    const lean = E.io(seg(s, blow - .6, blow + .3)) * (1 - E.io(seg(s, boom - .3, boom)));
    const puff = lean > .5;
    [['cup', 470, -1], ['cake', 1460, 1], ['donut', 230, -1], ['commuter', 1700, 1]].forEach(([k, x, side], i) => {
      const o = { s: 1.1, face: puff ? 'surprise' : s > wish ? 'happy' : 'smile', mouth: s < blow ? sing(s) * .4 : 0, hat: 'party', tilt: -side * lean * .25, armL: puff ? .3 : 1.3 + bob(s) * .2, armR: puff ? .3 : 1.3 + bob(s) * .2, seed: i, blush: puff ? 1.6 : 1, shadow: false };
      if (k === 'commuter') commuter(g, x + side * lean * -60, 760, s, { ...o, h: 260, col: '#F5D58A', blush: 1 });
      else friend(g, k, x + side * lean * -60, 760, s, o);
      if (puff) for (let w = 0; w < 3; w++) { const ph = (s * 3 + w * .33) % 1, x0 = x - side * (120 + ph * 160); withAlpha(g, Math.sin(ph * Math.PI), () => line(g, x0, 520 + w * 30, x0 - side * 70, 520 + w * 30, 'rgba(255,255,255,.7)', 5)); }
    });
    // 小蛋糕
    const ck = { x: 960, y: 760 };
    ell(g, ck.x, ck.y + 8, 260, 28); fs(g, C.cream, INK, 4);
    rr(g, ck.x - 200, ck.y - 150, 400, 160, [24, 24, 12, 12]); fs(g, '#F6C7A8', INK, 5);
    g.beginPath(); g.moveTo(ck.x - 206, ck.y - 130);
    for (let i = 0; i <= 6; i++) { const x = ck.x - 200 + i * 400 / 6; g.lineTo(x - 20, ck.y - 140); g.quadraticCurveTo(x, ck.y - 140 + 30 + (i % 2) * 20, x + 20, ck.y - 140); }
    g.lineTo(ck.x + 206, ck.y - 150); g.lineTo(ck.x + 180, ck.y - 168); g.lineTo(ck.x - 180, ck.y - 168); g.closePath(); fs(g, '#FFE3EA', INK, 5);
    text(g, '23', ck.x, ck.y - 50, 70, { k: 'en', col: C.redD });
    // 小烛跳上蛋糕
    const hu = E.io(clamp((s - hop) / .6));
    const cx = lerp(1180, ck.x, hu), cy = lerp(760, ck.y - 160, hu) - Math.sin(hu * Math.PI) * 160;
    const blowU = E.io(seg(s, blow, quiet)) * (1 - E.out(seg(s, boom - .15, boom)));
    const flameSz = s < blow ? 1 : lerp(1, .32, blowU) + noise1(s * 11) * .06 * blowU;
    const wishing = s > wish && s < blow + .4;
    candle(g, cx, cy, s, {
      s: 1.1, face: wishing ? 'wish' : s > blow ? 'worry' : 'happy', mouth: s > hop + .6 && s < wish ? sing(s) * .6 : 0, flame: flameSz, glow: 1.6, wickBend: s > blow ? Math.sin(s * 13) * 10 * blowU : 0,
      armL: wishing ? 1.25 : .4, armR: wishing ? 1.25 : .4, bendL: wishing ? 1.4 : .25, bendR: wishing ? 1.4 : .25, shadow: false,
    });
    // 许愿时飘起来的小星星
    if (wishing) for (let i = 0; i < 10; i++) { const ph = ((s - wish) * .35 + i / 10) % 1; withAlpha(g, Math.sin(ph * Math.PI), () => sparkle(g, cx + Math.sin(i * 2.3 + s) * 120, cy - 260 - ph * 340, 10 + (i % 3) * 5, '#FFE9A8')); }
    g.restore();
    // 只有火苗亮着：越到后面越暗
    const dark = .55 + .4 * E.io(seg(s, blow, quiet));
    const flamePos = [lerp(W / 2, fx, 0) + (cx - fx) * z + (fx - W / 2) * 0, 0];
    const lx = W / 2 + (cx - lerp(W / 2, fx, (z - 1) / 1.6)) * z, ly = H / 2 + (cy - 1.1 * 176 - 40 - lerp(H / 2, fy, (z - 1) / 1.6)) * z;
    const rad = (220 + flameSz * 380) * z;
    g.fillStyle = rgrad(g, lx, ly, rad * .15, rad * 1.6, [[0, 'rgba(255,190,110,0)'], [.5, `rgba(20,10,20,${dark * .55})`], [1, `rgba(12,6,14,${dark})`]]);
    g.fillRect(0, 0, W, H);
    caption(g, s, wish + .2, bar(133), '00:00', '许个愿吧');
  },
};

/* ================= 18 尾奏：拍立得回顾 ================= */
const SNAP = {};
function snap(key, sceneObj, s) {
  if (!SNAP[key]) {
    const c = mk(), cg = c.getContext('2d');
    cg.save(); sceneObj.draw(cg, s); cg.restore();
    const sm = mk(640, 360); sm.getContext('2d').drawImage(c, 0, 0, 640, 360);
    SNAP[key] = sm;
  }
  return SNAP[key];
}
function polaroid(g, img, x, y, rot, sc, label) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc);
  g.fillStyle = 'rgba(40,20,20,.28)'; g.fillRect(-250 + 12, -170 + 16, 500, 400);
  g.fillStyle = C.white; g.fillRect(-250, -170, 500, 400);
  g.drawImage(img, -230, -150, 460, 259);
  g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2; g.strokeRect(-230, -150, 460, 259);
  text(g, label, 0, 168, 44, { k: 'brush', col: INK });
  // 胶带
  g.save(); g.translate(0, -172); g.rotate(-.05); g.fillStyle = 'rgba(242,177,52,.7)'; g.fillRect(-60, -18, 120, 36); g.restore();
  g.restore();
}
const SHOTS = [
  ['boom', () => S_BOOM, 78.3, '又亮了', 420, 300, -.12],
  ['bike', () => S_BIKE, 86, '出发', 1000, 260, .08],
  ['train', () => S_TRAIN, 95, '随便哪站', 1540, 330, -.06],
  ['planes', () => S_PLANES, 106.8, '交差', 330, 700, .07],
  ['spring', () => S_SEASONS, 111, '春天', 860, 690, -.05],
  ['party', () => S_PARTY, 141.3, '天台', 1420, 720, .1],
  ['progress', () => S_PROGRESS, 147.5, '才 23%', 690, 470, -.03],
  ['stairs', () => S_STAIRS, 181, '星星', 1200, 480, .05],
];
const S_OUTRO = {
  draw(g, s) {
    const t0 = bar(140);
    // 先是火苗炸开
    gingham(g, 0, 0, W, H, '#D7263D', '#D7263D', 90);
    dots(g, .05);
    // 拍立得一张张掉下来（从第 142 小节起每小节一张）
    SHOTS.forEach(([key, sc, ss, label, x, y, rot], i) => {
      const tt = bar(142) + i * BAR;
      if (s < tt - .4) return;
      const u = clamp((s - tt + .4) / .4), land = E.out(u);
      const img = snap(key, sc(), ss);
      const [sx, sy] = shake(s, tt, 6, .25);
      polaroid(g, img, x + sx, lerp(-400, y, land) + sy, rot + (1 - land) * .6, lerp(1.25, .9, land), label);
    });
    // 开头两小节：大字 + 小烛跳出来
    const intro = 1 - E.io(seg(s, bar(141) + 2 * BEAT, bar(142) - .1));
    if (intro > 0) {
      g.save(); g.globalAlpha = intro;
      sunburst(g, W / 2, 560, 28, C.cream, C.pinkL, s * .2);
      dots(g, .05);
      const b = bob(s);
      text(g, '才二十三', W / 2, 250, 230, { k: 'brush', col: C.red, ext: 14, extCol: C.redD, sc: 1 + .03 * pulse(s, 6) });
      candle(g, 960, 980 - b * 26, s, { s: 1.5, face: 'grin', flame: 1.6, glow: .5, armL: 2.6 - b * .3, armR: 2.6 - b * .3, hat: 'party', scarf: true });
      friend(g, 'cup', 620, 980 - bob(s + BEAT) * 20, s, { s: 1.1, face: 'happy', hat: 'party', armL: 2.4, armR: 2.4 });
      friend(g, 'cake', 1300, 980 - bob(s + BEAT) * 20, s, { s: 1.1, face: 'happy', hat: 'party', armL: 2.4, armR: 2.4 });
      g.restore();
    }
    confetti(g, s, t0, 960, 500, 180, 41, 1.4);
    // 最后两小节：标语
    if (s > bar(150)) {
      const a = clamp((s - bar(150)) / .4);
      g.fillStyle = `rgba(246,238,223,${a * .85})`; rr(g, 460, 400, 1000, 280, 30); g.fill();
      popText(g, s, bar(150), '才二十三', W / 2, 500, 150, { k: 'brush', col: C.red, ext: 8, extCol: C.redD });
      popText(g, s, bar(150) + 4 * BEAT, '慢 慢 来', W / 2, 620, 64, { k: 'cute', col: INK });
    }
  },
};

/* ================= 19 片尾：回到唱片机 ================= */
const S_END = {
  draw(g, s) {
    const t0 = bar(152);
    const stopU = seg(s, t0, END_S - 1.5);
    const spin = (s - t0) * .55 * TAU * (1 - stopU * .5) * (1 - stopU) + 300;
    const arm = 1 - E.io(seg(s, END_S - 3.2, END_S - 2.2));
    turntable(g, s, { spin, arm });
    const b = bob(s) * (1 - stopU);
    candle(g, 1420, 990 - b * 10, s, { s: 1.35, face: s > END_S - 3 ? 'happy' : 'smile', flame: 1, armR: 2.5 + Math.sin(s * 8) * .3, armL: .3, look: -4 });
    const xs = 1730;
    [...'才二十三'].forEach((ch, i) => text(g, ch, xs, 190 + i * 160, 150, { k: 'brush', col: C.redD, alpha: clamp((s - t0 - i * .15) / .3) }));
    [...'方大同'].forEach((ch, i) => text(g, ch, xs - 140, 230 + i * 62, 48, { k: 'serif', col: INK, alpha: clamp((s - t0 - .6) / .3) }));
    seal(g, xs - 140, 470, 62, '廿三', -.06);
    text(g, 'MV · 知洲', 150, 1030, 30, { k: 'sans', col: INK, align: 'left', alpha: clamp((s - t0 - 1) / .4) });
  },
};
