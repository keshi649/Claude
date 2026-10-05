'use strict';
/* art.js：共用的画法 —— 小油、脂肪细胞、肺、人像、砖块、数码管、气泡、箭头、图标 */

/* ================= 数码管 ================= */
const SEG7 = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
function seg7Digit(g, ch, x, y, h, on, off) {
  const w = h * .56, th = h * .13, gap = th * .22, hs = h / 2;
  const segs = {
    a: [x + gap, y, w - gap * 2, th], d: [x + gap, y + h - th, w - gap * 2, th], g: [x + gap, y + hs - th / 2, w - gap * 2, th],
    f: [x, y + gap, th, hs - gap * 2], b: [x + w - th, y + gap, th, hs - gap * 2], e: [x, y + hs + gap, th, hs - gap * 2], c: [x + w - th, y + hs + gap, th, hs - gap * 2],
  };
  const lit = SEG7[ch] || '';
  for (const k in segs) {
    const [sx, sy, sw, sh] = segs[k];
    rr(g, sx, sy, sw, sh, th * .45); g.fillStyle = lit.includes(k) ? on : off; g.fill();
  }
}
/* 数码管文字，如 "60.0"。h 为数字高度。返回总宽 */
function lcdText(g, str, x, y, h, on, off = 'rgba(80,255,170,.07)') {
  const w = h * .56, sp = h * .22; let cx = x;
  for (const ch of str) {
    if (ch === '.') { circ(g, cx + h * .06, y + h - h * .06, h * .07); g.fillStyle = on; g.fill(); cx += h * .22; }
    else if (ch === '-') { rr(g, cx + w * .1, y + h / 2 - h * .065, w * .8, h * .13, h * .06); g.fillStyle = on; g.fill(); cx += w + sp; }
    else if (ch === ' ') cx += w + sp;
    else { seg7Digit(g, ch, cx, y, h, on, off); cx += w + sp; }
  }
  return cx - x;
}
function lcdWidth(str, h) { let w = 0; for (const ch of str) w += ch === '.' ? h * .22 : h * .56 + h * .22; return w; }

/* ================= 脂肪砖（1 公斤一块）================= */
function brick(g, x, y, w, h, o = {}) {
  const dx = w * .2, dy = -h * .34;
  const gl = o.glow || 0;
  if (gl > 0) glow(g, x + w / 2, y + h / 2, w * 1.3, C.fat, gl * .55);
  // 侧面
  poly(g, [[x + w, y], [x + w + dx, y + dy], [x + w + dx, y + h + dy], [x + w, y + h]]); fs(g, C.fatD, '#9B6500', 2);
  // 顶面
  poly(g, [[x, y], [x + dx, y + dy], [x + w + dx, y + dy], [x + w, y]]); fs(g, C.fatL, '#C98A00', 2);
  // 正面
  rr(g, x, y, w, h, 6);
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#FFD65C'); gr.addColorStop(1, C.fat2); fs(g, gr, '#B87800', 2.5);
  // 高光与标签
  g.save(); g.globalAlpha *= .6; rr(g, x + 7, y + 6, w * .5, h * .16, 4); g.fillStyle = '#FFFFFF'; g.fill(); g.restore();
  if (!o.noLabel) text(g, o.label || '1 kg', x + w / 2, y + h * .56, h * .36, '#8A5200', 'black');
}
/* 10 块砖的金字塔 4-3-2-1。返回每块砖的位置，方便让它们逐块落下、逐块消散 */
function pileLayout(cx, baseY, bw, bh) {
  const out = []; const rows = [4, 3, 2, 1]; let k = 0;
  rows.forEach((n, r) => {
    for (let i = 0; i < n; i++) {
      const x = cx + (i - (n - 1) / 2) * (bw + 6) - bw / 2, y = baseY - (r + 1) * (bh + 5);
      out.push({ x, y, k: k++ });
    }
  });
  return out;
}
/* 砖块被拆成方块再飘散成气泡。u：0 完整 → 1 全部飘走；from/to：粒子的起终点 */
function dissolve(g, bx, by, bw, bh, idx, u, to, o = {}) {
  if (u <= 0 || u >= 1.2) return;
  const r = R(idx * 97 + 5), n = o.n || 26;
  for (let i = 0; i < n; i++) {
    const sx = bx + r() * bw, sy = by + r() * bh;
    const dly = r() * .35, uu = clamp((u - dly) / .65); if (uu <= 0) continue;
    const e = E.io(uu);
    const ex = to[0] + (r() - .5) * 90, ey = to[1] + (r() - .5) * 60;
    // 二次贝塞尔：先向上冒，再弯向终点
    const cx = sx + (r() - .5) * 120, cy = Math.min(sy, ey) - 140 - r() * 120;
    const px = (1 - e) * (1 - e) * sx + 2 * (1 - e) * e * cx + e * e * ex, py = (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * cy + e * e * ey;
    const sz = 5 + r() * 9, col = mix(C.fat, o.col || C.cyan, clamp(e * 1.3));
    g.save(); g.globalAlpha *= (1 - clamp((uu - .85) / .15)) * .95; g.fillStyle = col;
    if (e < .35) { g.translate(px, py); g.rotate(r() * 6 + e * 3); g.fillRect(-sz / 2, -sz / 2, sz, sz); }
    else { circ(g, px, py, sz * .75); g.fill(); g.globalAlpha *= .5; g.strokeStyle = '#FFFFFF'; g.lineWidth = 1.5; g.stroke(); }
    g.restore();
  }
}

/* ================= 图标 ================= */
function iconFlame(g, x, y, s = 1, t = 0) {
  g.save(); g.translate(x, y); g.scale(s, s * (1 + Math.sin(t * 9) * .03));
  g.beginPath(); g.moveTo(0, -78); g.bezierCurveTo(30, -42, 62, -18, 56, 26); g.bezierCurveTo(52, 64, 22, 78, 0, 78);
  g.bezierCurveTo(-24, 78, -56, 62, -56, 22); g.bezierCurveTo(-56, -6, -34, -20, -26, -48); g.bezierCurveTo(-14, -34, -6, -48, 0, -78); g.closePath();
  const gr = g.createLinearGradient(0, -78, 0, 78); gr.addColorStop(0, '#FFB347'); gr.addColorStop(1, '#F2454B'); fs(g, gr, null);
  g.beginPath(); g.moveTo(2, -10); g.bezierCurveTo(26, 12, 38, 28, 28, 52); g.bezierCurveTo(22, 66, 8, 70, 0, 70);
  g.bezierCurveTo(-18, 70, -30, 54, -26, 38); g.bezierCurveTo(-22, 20, -6, 14, 2, -10); g.closePath(); fs(g, '#FFE08A', null);
  g.restore();
}
function iconToilet(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  rr(g, -34, -80, 68, 52, 8); fs(g, '#E9EEF7', '#9AA9C4', 4);              // 水箱
  rr(g, 18, -70, 12, 8, 3); fs(g, '#9AA9C4', null);
  g.beginPath(); g.moveTo(-58, -20); g.lineTo(58, -20); g.bezierCurveTo(56, 22, 28, 40, 0, 40); g.bezierCurveTo(-28, 40, -56, 22, -58, -20); g.closePath(); fs(g, '#F6F9FF', '#9AA9C4', 4); // 马桶
  ell(g, 0, -20, 58, 12); fs(g, '#CFE0F7', '#9AA9C4', 3);
  rr(g, -20, 38, 40, 22, 6); fs(g, '#E9EEF7', '#9AA9C4', 4);
  g.restore();
}
function iconDumbbell(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  rr(g, -52, -7, 104, 14, 5); fs(g, '#AEBBD3', null);
  for (const sg of [-1, 1]) {
    rr(g, sg * 54 - 11, -36, 22, 72, 7); fs(g, '#5A7DB5', '#2E4673', 3);
    rr(g, sg * 72 - 8, -26, 16, 52, 6); fs(g, '#7BA1E0', '#2E4673', 3);
  }
  g.restore();
}
function iconDrop(g, x, y, s = 1, col = C.cyan) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.moveTo(0, -34); g.bezierCurveTo(22, -6, 26, 6, 26, 14); g.bezierCurveTo(26, 30, 14, 38, 0, 38); g.bezierCurveTo(-14, 38, -26, 30, -26, 14); g.bezierCurveTo(-26, 6, -22, -6, 0, -34); g.closePath();
  const gr = g.createLinearGradient(-20, -20, 20, 30); gr.addColorStop(0, mix(col, '#FFFFFF', .45)); gr.addColorStop(1, col); fs(g, gr, hexA('#FFFFFF', .5), 2);
  g.globalAlpha *= .6; g.beginPath(); g.ellipse(-9, 8, 4.5, 11, .3, 0, TAU); g.fillStyle = '#FFFFFF'; g.fill();
  g.restore();
}
function iconSweat(g, x, y, s = 1) { iconDrop(g, x - 26 * s, y + 10 * s, .62 * s, C.blue); iconDrop(g, x + 8 * s, y - 14 * s, .8 * s, C.cyan); iconDrop(g, x + 34 * s, y + 22 * s, .5 * s, '#FFE27A'); }

/* 小人图标（调查用）。col 填充色 */
function personIcon(g, x, y, s, col, a = 1) {
  g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha *= a;
  circ(g, 0, -9, 6); g.fillStyle = col; g.fill();
  g.beginPath(); g.moveTo(-8, 12); g.quadraticCurveTo(-9, -1, 0, -1); g.quadraticCurveTo(9, -1, 8, 12); g.closePath(); g.fill();
  g.restore();
}

/* ================= 选择题卡片 ================= */
function quizCard(g, x, y, w, h, letter, label, iconFn, p, o = {}) {
  if (p <= .001) return;
  const dim = o.dim ?? 1;
  g.save(); g.translate(x, y + (1 - E.out(clamp(p))) * 120); g.globalAlpha *= clamp(p * 2.2) * dim;
  rr(g, -w / 2 + 5, -h / 2 + 10, w, h, 24); g.fillStyle = 'rgba(0,0,0,.35)'; g.fill();
  rr(g, -w / 2, -h / 2, w, h, 24);
  const gr = g.createLinearGradient(0, -h / 2, 0, h / 2); gr.addColorStop(0, 'rgba(36,62,102,.96)'); gr.addColorStop(1, 'rgba(20,38,68,.96)');
  fs(g, gr, hexA(o.col || C.white, .35), 3);
  // 字母徽章
  circ(g, -w / 2 + 52, -h / 2 + 52, 30); fs(g, o.col || C.orange, null);
  text(g, letter, -w / 2 + 52, -h / 2 + 54, 38, '#0A1120', 'black');
  // 图标
  if (iconFn) { g.save(); g.translate(18, -22); iconFn(g); g.restore(); }
  text(g, label, 0, h / 2 - 50, 40, C.white, 'black');
  g.restore();
}

/* ================= 小油 ================= */
/* 一个脂肪分子：圆圆的身体 + 三条尾巴（三条脂肪酸链）。脸朝右。 */
function xiaoyou(g, o) {
  const { x, y, s = 1, t = 0, expr = 'norm', look = [0, 0], rot = 0, flip = false, sx = 1, sy = 1, alpha = 1, tailAmp = 1, glowA = .5, tailSp = 5 } = o;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale((flip ? -1 : 1) * s * sx, s * sy); if (alpha < 1) g.globalAlpha *= alpha;
  if (glowA > 0) glow(g, 0, 0, 170, C.fat, glowA * .4);
  // 三条尾巴
  const tails = [[-48, -44, -.62, 1.0], [-60, 2, 0, 1.18], [-48, 48, .62, 1.0]];
  tails.forEach(([tx, ty, an, len], i) => {
    const N = 14, L = 118 * len; g.save(); g.translate(tx, ty); g.rotate(an);
    g.beginPath();
    for (let k = 0; k <= N; k++) { const u = k / N, px = -u * L, py = Math.sin(u * 6.5 - t * tailSp + i * 2.1) * 10 * u * tailAmp; k ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = '#B87800'; g.lineWidth = 18; g.stroke();
    g.strokeStyle = C.fat; g.lineWidth = 12; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 3.5; g.translate(0, -2.5); g.stroke();
    g.restore();
  });
  // 身体
  ell(g, 0, 0, 66, 76);
  const gr = g.createRadialGradient(-22, -34, 6, 0, 0, 92); gr.addColorStop(0, '#FFF1B8'); gr.addColorStop(.45, C.fat); gr.addColorStop(1, '#E59A00');
  fs(g, gr, '#B87800', 5);
  g.save(); g.globalAlpha *= .7; ell(g, -28, -42, 13, 24, -.45); g.fillStyle = '#FFFFFF'; g.fill(); g.restore();
  // 脸
  const lx = clamp(look[0], -1, 1) * 4.5, ly = clamp(look[1], -1, 1) * 4;
  const eyes = [[12, -12], [46, -12]];
  const blink = (Math.sin(t * 1.3 + 2) > .985 || (t % 4.1) < .12) && expr !== 'sleep' && expr !== 'wow' && expr !== 'happy';
  eyes.forEach(([ex, ey], i) => {
    if (expr === 'sleep' || blink || expr === 'happy') {
      g.strokeStyle = '#4A2E00'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath();
      if (expr === 'happy') { g.arc(ex, ey + 4, 11, Math.PI * 1.1, Math.PI * 1.9); } else { g.moveTo(ex - 11, ey + 2); g.lineTo(ex + 11, ey + 2); }
      g.stroke(); return;
    }
    const er = expr === 'wow' ? 18 : 15;
    circ(g, ex, ey, er); fs(g, '#FFFFFF', '#4A2E00', 3);
    const pr = expr === 'wow' ? 5.5 : 8;
    circ(g, ex + lx, ey + ly, pr); g.fillStyle = '#2A1A00'; g.fill();
    circ(g, ex + lx - 2.5, ey + ly - 3, 2.6); g.fillStyle = '#FFFFFF'; g.fill();
  });
  // 眉毛
  g.strokeStyle = '#4A2E00'; g.lineWidth = 5; g.lineCap = 'round';
  if (expr === 'sad' || expr === 'sweat') { g.beginPath(); g.moveTo(0, -36); g.lineTo(22, -42); g.moveTo(40, -42); g.lineTo(60, -36); g.stroke(); }
  else if (expr === 'det') { g.beginPath(); g.moveTo(-2, -42); g.lineTo(24, -34); g.moveTo(38, -34); g.lineTo(62, -42); g.stroke(); }
  else if (expr === 'wow') { g.beginPath(); g.arc(12, -42, 12, Math.PI * 1.15, Math.PI * 1.85); g.moveTo(58, -42); g.arc(46, -42, 12, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
  // 腮红
  g.fillStyle = 'rgba(255,92,138,.5)'; ell(g, 0, 16, 9, 6); g.fill(); ell(g, 56, 16, 9, 6); g.fill();
  // 嘴
  g.strokeStyle = '#4A2E00'; g.lineWidth = 4.5; g.lineCap = 'round';
  if (expr === 'happy') { g.beginPath(); g.arc(30, 16, 15, .1, Math.PI - .1); g.closePath(); fs(g, '#7A2E00', '#4A2E00', 3.5); g.beginPath(); g.ellipse(30, 28, 8, 5, 0, 0, TAU); g.fillStyle = '#FF7A8C'; g.fill(); }
  else if (expr === 'wow') { ell(g, 30, 28, 9, 12); fs(g, '#7A2E00', '#4A2E00', 3.5); }
  else if (expr === 'sad' || expr === 'sweat') { g.beginPath(); g.arc(30, 36, 13, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
  else if (expr === 'det') { g.beginPath(); g.moveTo(18, 28); g.lineTo(42, 28); g.stroke(); }
  else if (expr === 'sleep') { ell(g, 30, 28, 5, 4); g.fillStyle = '#7A2E00'; g.fill(); }
  else { g.beginPath(); g.arc(30, 20, 11, .2, Math.PI - .2); g.stroke(); }
  if (expr === 'sweat') { iconDrop(g, 70, -50, .55, C.cyan); }
  g.restore();
}

/* ================= 脂肪细胞 ================= */
function fatCell(g, o) {
  const { x, y, r, t = 0, tint = '#FFD45A', nuc = true, alpha = 1, seed = 0, gray = 0 } = o;
  const w = 1 + Math.sin(t * 1.6 + seed * 3) * .012;
  g.save(); g.translate(x, y); if (alpha < 1) g.globalAlpha *= alpha;
  const rr_ = r * w;
  // 细胞膜 + 薄薄的细胞质
  circ(g, 0, 0, rr_);
  const gr = g.createRadialGradient(-rr_ * .3, -rr_ * .32, rr_ * .05, 0, 0, rr_);
  gr.addColorStop(0, mix('#FFF9DE', '#E6EAF2', gray)); gr.addColorStop(.7, mix('#FFE69A', '#B4BDCC', gray)); gr.addColorStop(1, mix(tint, '#8995AA', gray));
  fs(g, gr, mix('#E0A21C', '#566178', gray), Math.max(2.5, r * .05));
  // 中间的大脂滴
  circ(g, 0, 0, rr_ * .84);
  const lg = g.createRadialGradient(-rr_ * .25, -rr_ * .28, rr_ * .04, 0, 0, rr_ * .84);
  lg.addColorStop(0, mix('#FFFBE8', '#F0F2F7', gray)); lg.addColorStop(1, mix('#FFE98A', '#CBD2DE', gray));
  fs(g, lg, hexA(mix('#E0A21C', '#566178', gray), .55), Math.max(1.5, r * .02));
  // 高光
  g.save(); g.globalAlpha *= .8; g.beginPath(); g.ellipse(-rr_ * .38, -rr_ * .42, rr_ * .13, rr_ * .26, -.7, 0, TAU); g.fillStyle = '#FFFFFF'; g.fill(); g.restore();
  // 细胞核（被挤到边上的月牙）
  if (nuc) {
    const a = -.9 + seed * 1.3, nr = rr_ * .15;
    g.save(); g.translate(Math.cos(a) * rr_ * .9, Math.sin(a) * rr_ * .9); g.rotate(a + Math.PI / 2);
    ell(g, 0, 0, nr * 1.6, nr * .85); fs(g, mix('#8D74E6', '#6B778C', gray), mix('#4D3A99', '#4A5468', gray), Math.max(1.5, r * .02));
    g.restore();
  }
  g.restore();
}

/* ================= 肺与人像 ================= */
function lungs(g, cx, cy, s = 1, breath = 0, o = {}) {
  const k = 1 + breath * .06;
  g.save(); g.translate(cx, cy); g.scale(s * k, s * k);
  const col = o.col || '#FF8FA6', edge = o.edge || '#C8506A';
  // 气管 + 支气管
  g.strokeStyle = '#FFD5DD'; g.lineCap = 'round'; g.lineWidth = 12;
  g.beginPath(); g.moveTo(0, -150); g.lineTo(0, -60); g.stroke();
  g.lineWidth = 8; g.beginPath(); g.moveTo(0, -60); g.quadraticCurveTo(-8, -40, -44, -20); g.moveTo(0, -60); g.quadraticCurveTo(8, -40, 44, -20); g.stroke();
  g.lineWidth = 4;
  for (const sg of [-1, 1]) for (const [a, b, c, d] of [[34, -26, 54, 10], [40, -20, 62, 44], [30, -24, 32, 70]]) { g.beginPath(); g.moveTo(sg * a, b); g.lineTo(sg * c, d); g.stroke(); }
  // 左右肺叶
  for (const sg of [-1, 1]) {
    g.beginPath(); g.moveTo(sg * 10, -52);
    g.bezierCurveTo(sg * 20, -90, sg * 66, -70, sg * 92, -20); g.bezierCurveTo(sg * 112, 30, sg * 108, 92, sg * 78, 108);
    g.bezierCurveTo(sg * 44, 122, sg * 14, 96, sg * 10, 46); g.bezierCurveTo(sg * 8, 6, sg * 6, -24, sg * 10, -52); g.closePath();
    const gr = g.createLinearGradient(sg * 10, -80, sg * 100, 110); gr.addColorStop(0, mix(col, '#FFFFFF', .25)); gr.addColorStop(1, col);
    g.globalAlpha *= (o.a ?? .92); fs(g, gr, edge, 4); g.globalAlpha /= (o.a ?? .92);
  }
  g.restore();
}
/* 侧脸半身像（朝右）。原点在脖子根部中心。画出半透明的“玻璃人”轮廓，胸腔里是肺 */
function profile(g, x, y, s, t, o = {}) {
  const breath = o.breath ?? Math.sin(t * 2.4) * .5 + .5;
  g.save(); g.translate(x, y); g.scale(s, s);
  const outline = new Path2D();
  outline.moveTo(-250, 330); outline.lineTo(-250, 160); outline.bezierCurveTo(-246, 70, -190, 28, -112, 2); outline.bezierCurveTo(-80, -6, -52, 10, -34, 6);
  outline.bezierCurveTo(-60, -40, -120, -120, -112, -230); outline.bezierCurveTo(-104, -330, -30, -372, 52, -358);
  outline.bezierCurveTo(112, -348, 138, -300, 138, -262); outline.bezierCurveTo(140, -246, 154, -226, 168, -208);   // 额头、鼻梁
  outline.bezierCurveTo(178, -198, 170, -190, 150, -188); outline.bezierCurveTo(146, -180, 150, -172, 146, -164);      // 鼻尖、人中、嘴唇
  outline.bezierCurveTo(142, -154, 148, -148, 138, -138); outline.bezierCurveTo(132, -122, 122, -112, 96, -104);       // 下唇、下巴
  outline.bezierCurveTo(70, -98, 56, -90, 52, -70); outline.bezierCurveTo(52, -40, 70, -24, 118, -8);                   // 脖子前、锁骨
  outline.bezierCurveTo(190, 14, 214, 70, 220, 150); outline.lineTo(220, 330);
  const fill = new Path2D(outline); fill.closePath();
  const gr = g.createLinearGradient(0, -360, 0, 330); gr.addColorStop(0, 'rgba(120,180,255,.34)'); gr.addColorStop(.7, 'rgba(70,130,215,.26)'); gr.addColorStop(1, 'rgba(40,90,170,0)');
  g.fillStyle = gr; g.fill(fill);
  const sg = g.createLinearGradient(0, -360, 0, 330); sg.addColorStop(0, 'rgba(150,205,255,.9)'); sg.addColorStop(.75, 'rgba(150,205,255,.8)'); sg.addColorStop(1, 'rgba(150,205,255,0)');
  g.strokeStyle = sg; g.lineWidth = 5; g.lineJoin = 'round'; g.stroke(outline);
  // 眼睛与嘴
  circ(g, 96, -262, 8); g.fillStyle = 'rgba(200,230,255,.95)'; g.fill();
  g.strokeStyle = 'rgba(200,230,255,.9)'; g.lineWidth = 4; g.beginPath(); g.moveTo(146, -166); g.quadraticCurveTo(128, -160, 112, -168); g.stroke();
  if (o.lungs !== false) { lungs(g, 12, 168, 1.12, breath); }
  g.restore();
  return [x + 146 * s, y - 165 * s];   // 嘴的位置，用来放呼出的气泡
}

/* ================= 质量守恒的柱子 ================= */
/* 左：脂肪 10 + 氧气 29；右：二氧化碳 28 + 水 11。两边一样高 = 质量守恒 */
function massColumns(g, cx, baseY, ppk, p, t) {
  const bw = 150, gap = 360;
  const blocks = [
    { x: cx - gap / 2, parts: [[10, C.fat, '脂肪', '10 kg'], [29, '#8EC8FF', '氧气', '29 kg']] },
    { x: cx + gap / 2, parts: [[28, C.cyan, '二氧化碳', '28 kg'], [11, C.blue, '水', '11 kg']] },
  ];
  blocks.forEach((b, bi) => {
    let y = baseY;
    b.parts.forEach(([kg, col, name, lab], pi) => {
      const pp = E.out(clamp(p * 2.4 - bi * .9 - pi * .35)); if (pp <= 0) return;
      const h = kg * ppk * pp; y -= h;
      rr(g, b.x - bw / 2, y, bw, h, 8);
      const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, mix(col, '#FFFFFF', .25)); gr.addColorStop(1, col); fs(g, gr, hexA('#FFFFFF', .4), 2);
      if (pp > .8) {
        text(g, name, b.x, y + h / 2 - 16, 30, '#0A1830', 'black'); text(g, lab, b.x, y + h / 2 + 18, 34, '#0A1830', 'black');
      }
    });
  });
  const op = clamp(p * 3 - 1.4);
  if (op > 0) {
    g.save(); g.globalAlpha *= op;
    arrow(g, cx - 60, baseY - 19.5 * ppk, cx + 60, baseY - 19.5 * ppk, 26, hexA(C.white, .85), { head: 44 });
    g.restore();
  }
}

/* ================= 气泡、箭头、杂项 ================= */
/* 小油的对话气泡。(x,y) 为气泡中心，tail 为尾巴指向的点；p 为弹出进度 */
function speech(g, x, y, s, px, p, tail, o = {}) {
  if (p <= .001) return;
  g.save(); g.font = F(px, 'black');
  const lines = String(s).split('\n'), w = Math.max(...lines.map(l => g.measureText(l).width)) + px * 1.5, h = lines.length * px * 1.3 + px * .9;
  y = Math.max(y, 134 + h / 2);                       // 气泡不要钻到顶部的路线条底下
  g.translate(x, y); g.scale(p, p); g.lineJoin = 'round';
  const fill = o.fill || '#FFF6DC', line = o.line || '#E0A21C';
  if (tail) {
    const tx = (tail[0] - x) / p, ty = (tail[1] - y) / p, bx = clamp(tx * .4, -w / 2 + 50, w / 2 - 50), by = ty > 0 ? h / 2 - 3 : -h / 2 + 3;
    g.beginPath(); g.moveTo(bx - 30, by); g.quadraticCurveTo(bx - 8, by + Math.sign(ty) * 6, tx, ty); g.quadraticCurveTo(bx + 14, by, bx + 32, by); g.closePath(); fs(g, fill, line, 4);
  }
  rr(g, -w / 2, -h / 2, w, h, Math.min(h / 2, 40)); fs(g, fill, line, 4);
  if (tail) { const tx = (tail[0] - x) / p, ty = (tail[1] - y) / p, bx = clamp(tx * .4, -w / 2 + 50, w / 2 - 50), by = ty > 0 ? h / 2 - 3 : -h / 2 + 3; g.fillStyle = fill; g.fillRect(bx - 28, by - 5 + (ty > 0 ? -2 : 0), 58, 9); }
  text(g, s, 0, 2, px, '#4A2E00', 'black');
  g.restore();
}
function arrow(g, x1, y1, x2, y2, w, col, o = {}) {
  const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1), hl = o.head ?? w * 2.2;
  g.save(); g.translate(x1, y1); g.rotate(a);
  g.beginPath(); g.moveTo(0, -w / 2); g.lineTo(L - hl, -w / 2); g.lineTo(L - hl, -w * 1.1); g.lineTo(L, 0); g.lineTo(L - hl, w * 1.1); g.lineTo(L - hl, w / 2); g.lineTo(0, w / 2); g.closePath();
  fs(g, col, o.stroke || null, o.lw || 0); g.restore();
}
/* 呼吸的“二氧化碳”小泡泡 */
function bubble(g, x, y, r, col = C.cyan, a = 1, label) {
  if (a <= .001) return;
  g.save(); g.globalAlpha *= a; circ(g, x, y, r);
  const gr = g.createRadialGradient(x - r * .3, y - r * .35, r * .1, x, y, r); gr.addColorStop(0, hexA('#FFFFFF', .85)); gr.addColorStop(.35, hexA(col, .55)); gr.addColorStop(1, hexA(col, .25));
  fs(g, gr, hexA('#FFFFFF', .7), 1.8);
  if (label) text(g, label, x, y + 1, r * .78, '#07324A', 'black');
  g.restore();
}
/* 校对用的十字准星/放大镜，等需要时再加 */
function checkmark(g, x, y, s, col = C.green, p = 1) {
  if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineWidth = 10; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(-18, 2); g.lineTo(-5, 16); g.lineTo(20, -16); g.setLineDash([80]); g.lineDashOffset = 80 * (1 - clamp(p)); g.stroke(); g.restore();
}
function crossmark(g, x, y, s, col = C.red, p = 1) {
  if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineWidth = 11; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-16, -16); g.lineTo(16, 16); g.moveTo(16, -16); g.lineTo(-16, 16); g.setLineDash([80]); g.lineDashOffset = 80 * (1 - clamp(p)); g.stroke(); g.restore();
}

/* ================= 关卡门 ================= */
/* 站在地面 y 上的一扇拱门。open：0 关 → 1 全开；lit：被点亮的程度 */
function gateDoor(g, x, y, s, o = {}) {
  const { num = '?', open = 0, glowA = 0, lit = 0, t = 0, label } = o;
  const w = 210, h = 330, ah = h - 80;
  g.save(); g.translate(x, y); g.scale(s, s);
  ell(g, 0, 8, w * .66, 17); g.fillStyle = 'rgba(0,0,0,.38)'; g.fill();
  glow(g, 0, -h * .5, 300, C.fat, glowA * .45 + lit * .35);
  // 门框
  g.beginPath(); g.moveTo(-w / 2 - 18, 0); g.lineTo(-w / 2 - 18, -ah); g.arc(0, -ah, w / 2 + 18, Math.PI, 0); g.lineTo(w / 2 + 18, 0); g.closePath();
  const fg = g.createLinearGradient(0, -h, 0, 0); fg.addColorStop(0, '#5B6F99'); fg.addColorStop(1, '#2B3A5C'); fs(g, fg, '#8DA2CC', 4);
  // 门洞
  g.beginPath(); g.moveTo(-w / 2, 0); g.lineTo(-w / 2, -ah); g.arc(0, -ah, w / 2, Math.PI, 0); g.lineTo(w / 2, 0); g.closePath();
  const ig = g.createLinearGradient(0, -h, 0, 0); ig.addColorStop(0, mix('#0B152B', '#FFF1B8', open)); ig.addColorStop(1, mix('#050B18', '#FFC93C', open)); fs(g, ig, null);
  g.save(); g.clip();
  // 门板（铰链在左）
  const lw = w * (1 - open * .93);
  if (lw > 4) {
    const lg = g.createLinearGradient(-w / 2, 0, -w / 2 + lw, 0); lg.addColorStop(0, '#3E5E93'); lg.addColorStop(1, '#2A4573');
    g.fillStyle = lg; g.fillRect(-w / 2, -h, lw, h);
    g.strokeStyle = 'rgba(10,20,40,.55)'; g.lineWidth = 3;
    for (let i = 1; i < 4; i++) { const px = -w / 2 + lw * i / 4; g.beginPath(); g.moveTo(px, -h); g.lineTo(px, 0); g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(-w / 2, -h, lw * .22, h);
    // 铆钉
    g.fillStyle = '#9FB4DB'; for (const ry of [-70, -150, -230]) for (const rx of [.12, .88]) { circ(g, -w / 2 + lw * rx, ry, 4.5); g.fill(); }
    // 铭牌
    if (lw > 80) { const cx = -w / 2 + lw / 2, cy = -150; circ(g, cx, cy, 40); fs(g, '#FFD45A', '#B88400', 4); text(g, String(num), cx, cy + 2, 46, '#4A3000', 'black'); }
    // 门把
    circ(g, -w / 2 + lw - 20, -120, 8); g.fillStyle = '#FFD45A'; g.fill();
  }
  g.restore();
  if (label) text(g, label, 0, 52, 34, C.white, 'black');
  g.restore();
}

/* ================= 横向的路 ================= */
function roadStrip(g, t, x0, x1, y, hh = 130) {
  rr(g, x0, y - hh / 2, x1 - x0, hh, hh / 2); fs(g, 'rgba(110,165,255,.09)', 'rgba(150,200,255,.3)', 2.5);
  g.save(); g.strokeStyle = 'rgba(190,225,255,.35)'; g.lineWidth = 4; g.setLineDash([26, 22]); g.lineDashOffset = -t * 40;
  g.beginPath(); g.moveTo(x0 + 70, y); g.lineTo(x1 - 70, y); g.stroke(); g.restore();
}
