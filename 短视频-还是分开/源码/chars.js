'use strict';
/* chars.js：Clawd（我）、鼠标指针（你）、几只手、车、大眼睛，以及一些小道具。 */

/* ---------------- Clawd ----------------
   照着模型图的格子画（一格 = u 像素）：身体 8×6；手臂 2×2 贴在身体两侧的第 2–3 行；
   四条腿 1×2，在身体的第 0/2/5/7 列；眼睛 1×1，在第 1/6 列、第 1 行。
   (x, y) 是脚底中心。o：
     eyes  normal | blink | happy | sad | wide | shout | flat | closed | dot | look | heart | x
     look  [dx, dy] 眼珠偏移（格）
     armL / armR  抬手 0–1（1 = 举过头顶一点）；reachR / reachL 手臂往外伸几格
     walk  走路相位（每 1 走一步）；run 跑步（腿抬得更高）
     sq 压扁（+）/拉长（−）；rot 旋转；lean 往一边歪；lift 离地高度
     col 颜色；alpha；dissolve 0–1 像素一格格消失；ghost 0–1 只剩虚线轮廓
     tears 流泪（时间）；sweat 冒汗；blush 脸红；shadow 影子 */
const CLAWD_OUTLINE = [[-4, -8], [4, -8], [4, -6], [6, -6], [6, -4], [4, -4], [4, 0], [3, 0], [3, -2], [2, -2], [2, 0], [1, 0], [1, -2],
  [-1, -2], [-1, 0], [-2, 0], [-2, -2], [-3, -2], [-3, 0], [-4, 0], [-4, -4], [-6, -4], [-6, -6], [-4, -6]];
function clawd(g, x, y, u, o = {}) {
  const t = o.t ?? 0;
  const al = o.alpha ?? 1;
  if (al <= .002) return;
  g.save();
  g.globalAlpha *= al;
  g.translate(x, y);
  if (o.shadow !== false && !o.ghost) {
    g.fillStyle = o.shadowCol || 'rgba(0,0,0,.2)';
    const lf = clamp(1 - (o.lift || 0) / (8 * u));
    ell(g, 0, 0, 5.2 * u * (1 + (o.sq || 0) * .4) * (.6 + .4 * lf), .8 * u * (.6 + .4 * lf)); g.fill();
  }
  g.translate(0, -(o.lift || 0));
  if (o.rot) g.rotate(o.rot);
  const sq = o.sq || 0;
  g.scale((o.flip ? -1 : 1) * (1 + sq * .45) * (o.sc || 1), (1 - sq) * (o.sc || 1));
  if (o.lean) g.transform(1, 0, -o.lean, 1, 0, 0);
  const col = o.col || C.clawd;
  const ghost = o.ghost || 0, dis = o.dissolve || 0;
  const P = (cx, cy, w, h, c) => { g.fillStyle = c; g.fillRect(cx * u, cy * u, w * u + .6, h * u + .6); };
  // 身体（可以一格格消失）
  const bodyA = 1 - ghost;
  if (bodyA > .002) {
    g.save(); g.globalAlpha *= bodyA;
    const parts = [];
    // 腿
    const legs = [-4, -2, 1, 3];
    legs.forEach((lx, i) => {
      let lift = 0;
      if (o.walk !== undefined) lift = Math.max(0, Math.sin(o.walk * TAU + (i % 2) * Math.PI)) * (o.run ? 1.1 : .6);
      if (o.legsUp) lift = 1.2;
      parts.push([lx, -2, 1, 2 - lift]);
    });
    parts.push([-4, -8, 8, 6]);
    // 手臂
    // 手臂：横着的一截 2×2；armL/armR 抬起时从外端竖起一截小臂（摊手、举手），droop 时往下垂
    const aL = o.armL || 0, aR = o.armR || 0, rL = o.reachL || 0, rR = o.reachR || 0;
    parts.push([-6 - rL, -6, 2 + rL, 2]);
    parts.push([4, -6, 2 + rR, 2]);
    if (aL > .01) parts.push([-6 - rL, -6 - 3 * aL, 1, 3 * aL]);
    if (aR > .01) parts.push([5 + rR, -6 - 3 * aR, 1, 3 * aR]);
    if (o.droop) { parts.push([-6, -4, 1, 2 * o.droop]); parts.push([5, -4, 1, 2 * o.droop]); }
    if (dis > 0) {
      for (const [px_, py_, pw, ph] of parts) {
        for (let cy = 0; cy < ph * 2 - .01; cy++) for (let cx = 0; cx < pw * 2 - .01; cx++) {
          const gx = Math.round((px_ + cx / 2) * 2), gy = Math.round((py_ + cy / 2) * 2);
          if (hash(gx + 40, gy + 40, o.seed || 1) < dis) continue;
          P(px_ + cx / 2, py_ + cy / 2, .5, .5, col);
        }
      }
    } else for (const [a, b, c, d] of parts) P(a, b, c, d, col);
    if (o.blush) { g.globalAlpha *= o.blush; P(-3.8, -5.4, 1.4, .5, '#F29AA0'); P(2.4, -5.4, 1.4, .5, '#F29AA0'); g.globalAlpha /= o.blush; }
    eyes(g, u, o, P);
    g.restore();
  }
  if (ghost > 0) {
    g.save(); g.globalAlpha *= ghost;
    g.beginPath(); CLAWD_OUTLINE.forEach(([a, b], i) => i ? g.lineTo(a * u, b * u) : g.moveTo(a * u, b * u)); g.closePath();
    g.setLineDash([u * .55, u * .45]); g.lineDashOffset = -t * u * 2;
    g.strokeStyle = o.ghostCol || col; g.lineWidth = Math.max(2, u * .22); g.stroke();
    g.setLineDash([]);
    g.restore();
  }
  if (o.sweat) { const k = (t * 1.6) % 1; g.save(); g.globalAlpha *= o.sweat * (1 - k * .6); drop(g, 5.2 * u, (-8.6 + k * 1.4) * u, u * .55, '#7FC4FF'); g.restore(); }
  if (o.tears) {
    for (const [ex, ph] of [[-2.5, 0], [2.5, .37]]) for (let k = 0; k < 2; k++) {
      const v = ((o.tears * 1.3 + ph + k * .5) % 1);
      g.save(); g.globalAlpha *= (1 - v) * .95;
      drop(g, ex * u + (ex < 0 ? -.2 : .2) * u * v, (-5.8 + v * 4.2) * u, u * .32, '#8FD3FF');
      g.restore();
    }
  }
  g.restore();
}
function drop(g, x, y, r, col) { g.beginPath(); g.moveTo(x, y - r * 1.8); g.quadraticCurveTo(x + r * 1.1, y - r * .2, x, y + r); g.quadraticCurveTo(x - r * 1.1, y - r * .2, x, y - r * 1.8); g.fillStyle = col; g.fill(); }
function eyes(g, u, o, P) {
  const k = o.eyes || 'normal', t = o.t ?? 0, [lx, ly] = o.look || [0, 0];
  const ec = o.eyeCol || C.eye;
  let kind = k;
  if ((k === 'normal' || k === 'look') && o.blinkOK !== false) { const ph = (t + (o.ph || 0)) % 3.1; if (ph < .1) kind = 'blink'; }
  const L = [-3 + lx, -7 + ly], Rr = [2 + lx, -7 + ly];
  switch (kind) {
    case 'normal': case 'look': P(L[0], L[1], 1, 1, ec); P(Rr[0], Rr[1], 1, 1, ec); break;
    case 'blink': P(L[0] - .1, L[1] + .62, 1.2, .3, ec); P(Rr[0] - .1, Rr[1] + .62, 1.2, .3, ec); break;
    case 'dot': P(L[0] + .25, L[1] + .3, .5, .5, ec); P(Rr[0] + .25, Rr[1] + .3, .5, .5, ec); break;
    case 'wide': P(L[0] - .25, L[1] - .3, 1.5, 1.5, ec); P(Rr[0] - .25, Rr[1] - .3, 1.5, 1.5, ec); P(L[0] + .1, L[1] - .05, .45, .45, '#fff'); P(Rr[0] + .1, Rr[1] - .05, .45, .45, '#fff'); break;
    case 'happy': for (const [ex, ey] of [L, Rr]) { P(ex - .2, ey + .7, .45, .45, ec); P(ex + .28, ey + .25, .45, .45, ec); P(ex + .76, ey + .7, .45, .45, ec); } break;
    case 'closed': for (const [ex, ey] of [L, Rr]) { P(ex - .2, ey + .35, .45, .45, ec); P(ex + .28, ey + .8, .45, .45, ec); P(ex + .76, ey + .35, .45, .45, ec); } break;
    case 'sad': P(L[0] - .2, L[1] + .55, .7, .38, ec); P(L[0] + .35, L[1] + .3, .7, .38, ec); P(Rr[0] - .15, Rr[1] + .3, .7, .38, ec); P(Rr[0] + .4, Rr[1] + .55, .7, .38, ec); break;
    case 'flat': P(L[0] - .25, L[1] + .55, 1.5, .32, ec); P(Rr[0] - .25, Rr[1] + .55, 1.5, .32, ec); break;
    case 'shout': P(L[0] - .25, L[1] - .15, .45, .45, ec); P(L[0] + .3, L[1] + .28, .45, .45, ec); P(L[0] - .25, L[1] + .71, .45, .45, ec);
      P(Rr[0] + .8, Rr[1] - .15, .45, .45, ec); P(Rr[0] + .25, Rr[1] + .28, .45, .45, ec); P(Rr[0] + .8, Rr[1] + .71, .45, .45, ec); break;
    case 'x': for (const [ex, ey] of [L, Rr]) { P(ex - .2, ey - .2, .45, .45, ec); P(ex + .75, ey - .2, .45, .45, ec); P(ex + .28, ey + .28, .45, .45, ec); P(ex - .2, ey + .76, .45, .45, ec); P(ex + .75, ey + .76, .45, .45, ec); } break;
    case 'heart': for (const [ex, ey] of [L, Rr]) { const hc = '#FF4F86'; P(ex - .3, ey, .5, .5, hc); P(ex + .5, ey, .5, .5, hc); P(ex - .3, ey + .4, 1.3, .5, hc); P(ex, ey + .85, .7, .4, hc); } break;
  }
}

/* ---------------- 鼠标指针（你） ----------------
   经典箭头，尖端在 (x, y)，sz 是一格的像素（整只大约 11×19 格）。
   o.press 按下时压扁；o.alpha；o.ghost 只画虚线；o.col 填充色 */
const ARROW = [[0, 0], [0, 15.6], [3.7, 12.2], [6.5, 18.7], [9.1, 17.6], [6.4, 11.3], [11.2, 11.3]];
const ARROW_TAIL = [7.8, 18.2];     // 箭头尾巴的末端（"衣角"）
function cursor(g, x, y, sz, o = {}) {
  const al = o.alpha ?? 1;
  if (al <= .002) return;
  g.save(); g.globalAlpha *= al; g.translate(x, y);
  if (o.rot) g.rotate(o.rot);
  const pr = o.press || 0;
  g.scale(sz * (1 + pr * .08), sz * (1 - pr * .12));
  if (o.shadow !== false) { g.save(); g.translate(1.1, 1.4); poly(g, ARROW); g.fillStyle = 'rgba(0,0,0,.28)'; g.fill(); g.restore(); }
  poly(g, ARROW);
  g.lineJoin = 'round';
  if (o.ghost) { g.setLineDash([1.2, .9]); g.strokeStyle = o.line || '#111'; g.lineWidth = .7; g.stroke(); g.setLineDash([]); }
  else { g.fillStyle = o.col || '#FFFFFF'; g.fill(); g.strokeStyle = o.line || '#0D0D0F'; g.lineWidth = .95; g.stroke(); }
  g.restore();
}

/* ---------------- 手（猜拳、拖动） ----------------
   卡通手：白底黑边，(x, y) 是手掌中心，sz 一格像素。kind：point | fist | palm | scissors | grab
   手指朝上；o.rot 旋转；o.flip 左右翻 */
function hand(g, x, y, sz, kind, o = {}) {
  const al = o.alpha ?? 1; if (al <= .002) return;
  g.save(); g.globalAlpha *= al; g.translate(x, y); if (o.rot) g.rotate(o.rot); g.scale((o.flip ? -1 : 1) * sz, sz);
  const shapes = [];
  const fing = (cx, len, w = 2.1, ang = 0) => shapes.push(['f', cx, len, w, ang]);
  shapes.push(['p']);
  if (kind === 'palm') { fing(-3.4, 8.4, 2.1, -.14); fing(-1.1, 9.6, 2.1, -.04); fing(1.2, 9.2, 2.1, .05); fing(3.4, 7.4, 2, .16); shapes.push(['t', 1]); }
  else if (kind === 'scissors') { fing(-2.2, 9.6, 2.2, -.26); fing(.6, 9.6, 2.2, .14); fing(2.8, 2.6, 2.1); fing(4.4, 2.2, 1.9); shapes.push(['t', 0]); }
  else if (kind === 'point') { fing(-2.6, 9.8, 2.3); fing(-.3, 2.6, 2.1); fing(1.9, 2.4, 2.1); fing(3.9, 2.1, 1.9); shapes.push(['t', 0]); }
  else if (kind === 'grab') { fing(-3.3, 3.6, 2.1); fing(-1.1, 4.2, 2.1); fing(1.1, 4, 2.1); fing(3.2, 3.2, 1.9); shapes.push(['t', .4]); }
  else { fing(-3.3, 2.6, 2.2); fing(-1.1, 3, 2.2); fing(1.1, 2.9, 2.2); fing(3.3, 2.4, 2); shapes.push(['t', 0]); }   // fist
  const draw = (pad) => {
    for (const sh of shapes) {
      g.save();
      if (sh[0] === 'p') { rr(g, -5 - pad, -1 - pad, 10 + 2 * pad, 8.6 + 2 * pad, 3 + pad); g.fill(); }
      else if (sh[0] === 'f') { const [, cx, len, w, ang] = sh; g.translate(cx, 1); g.rotate(ang); rr(g, -w / 2 - pad, -len - pad, w + 2 * pad, len + 2 + 2 * pad, w / 2 + pad); g.fill(); }
      else { const out = sh[1]; g.translate(-5, 3.6); g.rotate(-.9 - out * .6); rr(g, -1.2 - pad, -4.6 - pad, 2.4 + 2 * pad, 5.2 + 2 * pad, 1.2 + pad); g.fill(); }
      g.restore();
    }
  };
  g.fillStyle = 'rgba(0,0,0,.25)'; g.save(); g.translate(.6, .8); draw(.55); g.restore();
  g.fillStyle = '#0D0D0F'; draw(.55);
  g.fillStyle = o.col || '#FFFFFF'; draw(0);
  // 指缝
  g.strokeStyle = '#0D0D0F'; g.lineWidth = .35; g.lineCap = 'round';
  if (kind === 'fist' || kind === 'grab') for (const cx of [-2.2, 0, 2.2]) { g.beginPath(); g.moveTo(cx, -1.6); g.lineTo(cx, 1); g.stroke(); }
  g.restore();
}

/* ---------------- 车（侧面，车头朝右） ----------------
   (x, y) 是车底中心（地面），sc 缩放。o.door 后门打开角度 0–1；o.inside(g) 画车里的东西；o.wheel 车轮转角 */
function car(g, x, y, sc, o = {}) {
  g.save(); g.translate(x, y); g.scale(sc, sc);
  const body = o.col || '#2B3A67', dark = '#1B2645';
  // 车轮
  for (const wx of [-230, 235]) {
    circ(g, wx, -48, 52); g.fillStyle = '#141416'; g.fill();
    circ(g, wx, -48, 24); g.fillStyle = '#9AA2AE'; g.fill();
    g.save(); g.translate(wx, -48); g.rotate(o.wheel || 0); g.fillStyle = '#5E6672';
    for (let k = 0; k < 5; k++) { g.rotate(TAU / 5); g.fillRect(-3, 6, 6, 14); }
    g.restore();
  }
  // 车身
  g.beginPath();
  g.moveTo(-360, -70); g.lineTo(-360, -160); g.quadraticCurveTo(-355, -190, -320, -195);
  g.lineTo(-250, -200); g.lineTo(-170, -300); g.quadraticCurveTo(-155, -318, -125, -318);
  g.lineTo(130, -318); g.quadraticCurveTo(160, -318, 180, -298); g.lineTo(265, -205);
  g.lineTo(345, -192); g.quadraticCurveTo(372, -186, 372, -158); g.lineTo(372, -70);
  g.quadraticCurveTo(372, -52, 352, -52); g.lineTo(-340, -52); g.quadraticCurveTo(-360, -52, -360, -70);
  g.closePath(); g.fillStyle = body; g.fill();
  // 轮拱
  for (const wx of [-230, 235]) { g.save(); g.beginPath(); g.arc(wx, -48, 62, Math.PI, 0); g.lineTo(wx + 62, -40); g.lineTo(wx - 62, -40); g.closePath(); g.fillStyle = '#0B0E18'; g.fill(); g.restore(); circ(g, wx, -48, 52); g.fillStyle = '#141416'; g.fill(); circ(g, wx, -48, 24); g.fillStyle = '#9AA2AE'; g.fill(); }
  // 车窗
  const glass = o.glass || '#9CC3E6';
  poly(g, [[-232, -205], [-160, -294], [-20, -294], [-20, -205]]); g.fillStyle = glass; g.fill();
  poly(g, [[0, -205], [0, -294], [125, -294], [146, -290], [220, -205]]); g.fillStyle = glass; g.fill();
  g.fillStyle = dark; g.fillRect(-20, -298, 20, 96);
  // 车灯
  rr(g, 350, -175, 22, 30, 6); g.fillStyle = '#FFE08A'; g.fill();
  rr(g, -362, -168, 16, 34, 5); g.fillStyle = o.tail || '#E5484D'; g.fill();
  // 前门缝和把手
  g.strokeStyle = dark; g.lineWidth = 4;
  g.beginPath(); g.moveTo(0, -298); g.lineTo(0, -60); g.moveTo(230, -205); g.lineTo(230, -60); g.stroke();
  rr(g, 150, -180, 46, 10, 5); g.fillStyle = dark; g.fill();
  // 后门：铰链在右边（x = -20），向镜头这边打开
  const dw = 215, dTop = -300, dBot = -60, hx = -20;
  const th = (o.door || 0) * 1.25;          // 打开角度（弧度）
  if (th > .01) {
    // 门洞：黑漆漆的车厢，指针坐在里面
    poly(g, [[hx - dw, dTop + 95], [hx - dw + 70, dTop + 6], [hx, dTop + 6], [hx, dBot], [hx - dw, dBot]]);
    g.fillStyle = '#0A0D16'; g.fill();
    if (o.inside) { g.save(); g.clip(); o.inside(g); g.restore(); }
    const pw = dw * Math.cos(th), grow = 1 + .3 * Math.sin(th);
    const fx = hx - pw, cy = (dTop + dBot) / 2, hh = (dBot - dTop) / 2;
    poly(g, [[hx, dTop + 6], [hx, dBot], [fx, cy + hh * grow], [fx, cy - hh * grow + 40 * grow]]);
    g.fillStyle = shadeCol(body, -.12 - .12 * Math.sin(th)); g.fill();
    g.strokeStyle = dark; g.lineWidth = 4; g.stroke();
    // 门上的车窗
    const wy0 = dTop + 12, wy1 = dTop + 92;
    poly(g, [[hx - 6, wy0 + 4], [hx - 6, wy1], [lerp(hx - 6, fx + 10, .92), lerp(wy1, cy - hh * grow + 92 * grow, 1)], [lerp(hx - 6, fx + 10, .7), wy0 + 4 - 2 * grow]]);
    g.fillStyle = shadeCol(glass, -.2); g.fill();
  } else {
    g.strokeStyle = dark; g.lineWidth = 4; g.beginPath(); g.moveTo(hx - dw, -205); g.lineTo(hx - dw, -60); g.stroke();
    rr(g, -150, -180, 46, 10, 5); g.fillStyle = dark; g.fill();
  }
  g.restore();
}
function shadeCol(hex, k) {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, gg = (n >> 8) & 255, b = n & 255;
  const f = v => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k);
  return `rgb(${f(r)},${f(gg)},${f(b)})`;
}

/* ---------------- Claude 的小星芒（像 Claude Code 转圈时的那颗 ✻） ---------------- */
function spark(g, x, y, r, rot = 0, col = C.clawd, n = 8) {
  g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const L = r * (i % 2 ? .78 : 1);
    g.beginPath(); g.moveTo(0, -r * .1); g.quadraticCurveTo(r * .2, -L * .55, 0, -L); g.quadraticCurveTo(-r * .2, -L * .55, 0, -r * .1); g.fill();
    g.rotate(TAU / n);
  }
  circ(g, 0, 0, r * .16); g.fill();
  g.restore();
}
/* 对勾 / 叉 / 实心圆点（不依赖字体里的符号） */
function check(g, x, y, s, col, lw = s * .22) { g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x - s * .45, y); g.lineTo(x - s * .12, y + s * .35); g.lineTo(x + s * .5, y - s * .4); g.stroke(); g.restore(); }
function cross(g, x, y, s, col, lw = s * .22) { g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - s * .4, y - s * .4); g.lineTo(x + s * .4, y + s * .4); g.moveTo(x + s * .4, y - s * .4); g.lineTo(x - s * .4, y + s * .4); g.stroke(); g.restore(); }
function dot(g, x, y, r, col) { circ(g, x, y, r); g.fillStyle = col; g.fill(); }

/* ---------------- 窗口（终端 / 编辑器） ---------------- */
function windowFrame(g, x, y, w, h, title, o = {}) {
  g.save();
  if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  if (o.shadow !== false) { g.fillStyle = 'rgba(0,0,0,.35)'; rr(g, x + 10, y + 16, w, h, 18); g.fill(); }
  rr(g, x, y, w, h, 18); g.fillStyle = o.bg || '#1A1C22'; g.fill();
  g.save(); rr(g, x, y, w, h, 18); g.clip();
  g.fillStyle = o.bar || '#25282F'; g.fillRect(x, y, w, 58);
  g.restore();
  rr(g, x, y, w, h, 18); g.strokeStyle = o.line || 'rgba(255,255,255,.12)'; g.lineWidth = 2; g.stroke();
  [['#FF5F57', 0], ['#FEBC2E', 1], ['#28C840', 2]].forEach(([c, i]) => dot(g, x + 32 + i * 30, y + 29, 9, c));
  if (title) mono(g, title, x + w / 2, y + 30, 24, o.titleCol || 'rgba(235,235,235,.6)', { align: 'center', k: 'monoR' });
  g.restore();
}

/* ---------------- 对话气泡 ---------------- */
function bubble(g, x, y, w, h, o = {}) {
  g.save();
  if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  const r = o.r ?? 26, tx = o.tail ?? (x + w * .2), dir = o.dir ?? 1;
  g.beginPath(); g.roundRect(x, y, w, h, r);
  if (o.tail !== false) { g.moveTo(tx - 18, y + h - 1); g.lineTo(tx + 6 * dir, y + h + 34); g.lineTo(tx + 26, y + h - 1); }
  g.fillStyle = o.fill || '#FFFFFF'; g.fill();
  if (o.line) { g.strokeStyle = o.line; g.lineWidth = o.lw || 4; g.stroke(); }
  g.restore();
}
/* 锯齿爆炸气泡（吵架用） */
function burst(g, x, y, r, n, seed, fill, line) {
  g.beginPath();
  for (let i = 0; i <= n * 2; i++) {
    const a = i / (n * 2) * TAU, rr_ = r * (i % 2 ? .72 + hash(i, seed) * .12 : 1 + hash(i, seed, 3) * .1);
    const px = x + Math.cos(a) * rr_ * 1.25, py = y + Math.sin(a) * rr_;
    i ? g.lineTo(px, py) : g.moveTo(px, py);
  }
  g.closePath(); g.fillStyle = fill; g.fill(); if (line) { g.strokeStyle = line; g.lineWidth = 6; g.lineJoin = 'round'; g.stroke(); }
}

/* ---------------- 印章标签 ---------------- */
function stamp(g, s, t0, str, x, y, px, o = {}) {
  if (s < t0) return;
  const u = clamp((s - t0) / .2), sc = 1 + .7 * Math.pow(1 - u, 3), al = clamp((s - t0) / .04) * (o.alpha ?? 1);
  if (o.out && s > o.out) return;
  const k = o.k || 'black', w = tw(g, str, px, k) + px * .9, h = px * 1.45;
  g.save(); g.globalAlpha *= al; g.translate(x, y); g.rotate(o.rot ?? -.06); g.scale(sc, sc);
  rr(g, -w / 2, -h / 2, w, h, o.r ?? 14);
  if (o.fill) { g.fillStyle = o.fill; g.fill(); }
  g.strokeStyle = o.col || C.red; g.lineWidth = o.lw || px * .09; g.stroke();
  g.font = F(px, k); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = o.textCol || o.col || C.red;
  g.fillText(str, 0, px * .06);
  g.restore();
}

/* ---------------- 键帽 ---------------- */
function keycap(g, x, y, str, px, press = 0, o = {}) {
  const w = Math.max(px * 1.6, tw(g, str, px, 'mono') + px * 1.1), h = px * 1.7, d = px * .22 * (1 - press);
  g.save(); if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  rr(g, x - w / 2, y - h / 2 + px * .22, w, h, px * .3); g.fillStyle = o.side || '#9C988F'; g.fill();
  rr(g, x - w / 2, y - h / 2 + px * .22 - d, w, h, px * .3); g.fillStyle = o.top || '#F4F1EA'; g.fill();
  g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.stroke();
  mono(g, str, x, y + px * .22 - d, px, o.col || '#2A2A2A', { align: 'center', k: 'mono' });
  g.restore();
}
