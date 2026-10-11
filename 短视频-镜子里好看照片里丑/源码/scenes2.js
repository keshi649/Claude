'use strict';
/* scenes2.js：脸不对称 → 你看了半辈子的是镜像版，别人看的是原版（曝光效应）
   → 实验：自己挑镜像版，朋友挑原版 → 两个帮凶：定格、离太近。 */

/* ================= 脸不对称；镜像版和原版 ================= */
function body(g, t) {
  if (t < S('s2') - .12) { faceStudy(g, t); return; }
  versions(g, t);
}
/* 一张大脸，中间一条对称线；依次圈出发旋、痣、嘴角 */
function faceStudy(g, t) {
  bgGrid(g, t, '#17303A', 'rgba(140,230,220,.09)');
  const cx = 480, cy = 720, k = 12;
  drawFace(g, cx, cy, k, { expr: t > CH('s1', 3) - .1 && t < CH('s1', 4) ? 'smile' : (Math.floor(t * 1.5) % 5 === 4 ? 'blink' : 'smile') });
  // 对称线
  const pl = clamp((t - S('s1') - .1) / .6);
  g.fillStyle = 'rgba(255,255,255,.75)';
  for (let y = cy - 300; y < cy - 300 + 600 * pl; y += 30) g.fillRect(cx - 3, y, 6, 16);
  const marks = [
    [CH('s1', 1) - .25, FEAT.part, '发旋在这边', C.gold, -1],
    [CH('s1', 2) - .25, FEAT.mole, '痣在这边', '#FF6F8E', 1],
    [CH('s1', 3) - .25, FEAT.mouth, '这边嘴角高', '#9FE3C4', -1],
  ];
  marks.forEach(([t0, [fx, fy], s, col, side]) => {
    if (t < t0 - .05) return;
    const u = clamp((t - t0 + .05) / .4), [x, y] = facePt(cx, cy, k, fx, fy, false);
    markCircle(g, x, y, 30, col, u);
    const lx = side < 0 ? 150 : 810, ly = y + (side < 0 ? -10 : 40);
    if (u > .6) { pixArrow(g, lx + (side < 0 ? 80 : -80), ly - 16, x + side * -36, y, 6, col, 1); ptag(g, lx, ly - 30, s, 30, { fill: col }); }
  });
  if (t > CH('s1', 4) - .25) popText(g, t, CH('s1', 4) - .2, 99, '左 ≠ 右', 480, 1150, 96, C.white);
}
/* 左：你每天在镜子里看到的（镜像版）；右：别人每天看到的（原版）；下面一条"顺眼度" */
function versions(g, t) {
  g.fillStyle = '#20263E'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#2A3150'; g.fillRect(0, 0, 480, H);
  const k = 6;
  // 左半：镜子
  drawMirror(g, 270, 700, 150, 190, t, { k, dy: 30, faceOpt: { expr: 'happy' } });
  popTag(g, t, S('s2') + .05, 270, 430, '你每天看到的', 32, { fill: '#9FE3C4' });
  if (t > CH('s2', 1) - .3) popText(g, t, CH('s2', 1) - .25, 99, '镜像版', 270, 960, 56, '#9FE3C4');
  // 右半：别人眼里
  const pr = E.out(clamp((t - CH('s2', 2) + .3) / .35));
  if (pr > 0) withAlpha(g, pr, () => {
    g.fillStyle = '#FFFDF6'; g.fillRect(560, 520, 260, 330); g.fillStyle = '#B9D7EA'; g.fillRect(574, 534, 232, 260);
    clipRect(g, 574, 534, 232, 260, () => drawFace(g, 690, 690, 5, { expr: 'smile' }));
    for (let i = -1; i <= 1; i++) iconEye(g, 690 + i * 70, 470);
  });
  if (t > CH('s2', 2) - .3) popTag(g, t, CH('s2', 2) - .25, 690, 400, '别人每天看到的', 32, { fill: '#D7D3E0' });
  if (t > CH('s2', 3) - .3) popText(g, t, CH('s2', 3) - .25, 99, '原版', 690, 960, 56, '#D7D3E0');
  // 次数：一个个"正"字往上加
  const tally = (x, y, n) => { for (let i = 0; i < n; i++) { const c = Math.floor(i / 5), j = i % 5, bx = x + (c % 5) * 60, by = y + Math.floor(c / 5) * 54; g.fillStyle = C.white; if (j < 4) g.fillRect(bx + j * 10, by, 4, 40); else g.fillRect(bx - 4, by + 18, 48, 4); } };
  if (t > S('s2')) tally(130, 1030, Math.min(100, Math.floor((t - S('s2')) * 14)));
  if (t > CH('s2', 2)) tally(560, 1030, Math.min(100, Math.floor((t - CH('s2', 2)) * 14)));
  // 曝光效应：看得越熟，越顺眼（顺眼度条）
  if (t > S('s3') - .1) {
    const u = E.out(clamp((t - CH('s3', 1)) / 1.2));
    withAlpha(g, clamp((t - S('s3') + .1) / .3), () => {
      pbox(g, 90, 240, 780, 120, { k: 6 });
      ptext(g, '顺眼度', 130, 316, 36, C.white);
      g.fillStyle = '#3B3363'; g.fillRect(290, 286, 540, 36);
      g.fillStyle = C.green; g.fillRect(290, 286, Math.round(540 * (.25 + .7 * u) / 6) * 6, 36);
    });
  }
  if (t > CH('s3', 2) - .35) popTag(g, t, CH('s3', 2) - .3, 480, 232, '曝光效应', 40, { fill: C.amber });
  dialogBox(g, t, 'd2', PORTRAIT.youSad);
}

/* ================= 实验：原版和镜像版，挑哪张？ ================= */
function study(g, t) {
  if (t < S('s5') - .12) { photoShoot(g, t); return; }
  vote(g, t);
}
/* 拍照 → 每人洗出两张：原版、镜像版 */
function photoShoot(g, t) {
  bgStudio(g, t);
  chibiAt(g, t, 'psY', 480, 1170, 9, { expr: 'smile', still: true });
  const cam = CAMERA();
  g.save(); g.imageSmoothingEnabled = false; g.drawImage(cam, 380, 260, cam.width * 11, cam.height * 11); g.restore();
  flash(g, 590, 330, clamp((t - S('s4') + .3) / .5));
  const pp = E.out(clamp((t - CH('s4', 1) + .3) / .5));
  if (pp > 0) {
    drawPrint(g, lerp(480, 270, pp), 780, 300, 400, { rot: -.06 * pp, label: t > CH('s4', 2) - .1 ? '原版' : '', faceOpt: { expr: 'smile' } });
    drawPrint(g, lerp(480, 690, pp), 780, 300, 400, { rot: .06 * pp, label: t > CH('s4', 3) - .1 ? '镜像版' : '', faceOpt: { expr: 'smile', flip: true } });
  }
  source(g, 'Mita 等 1977；Amestoy 等 2010（38 名成年人）', 880, 1240, { col: '#3A3848' });
}
/* 投票：挑自己的照片 → 七成挑镜像版；挑好朋友的照片 → 七成多挑原版 */
function vote(g, t) {
  bgGrid(g, t, '#22203A', 'rgba(255,255,255,.04)');
  const row = (y, t0, title, who, left, right, win, lv) => {
    const p = E.out(clamp((t - t0 + .25) / .35)); if (p <= 0) return;
    g.save(); g.globalAlpha *= p; g.translate((1 - p) * -50, 0);
    pbox(g, 70, y, 840, 420, { k: 6 });
    ptext(g, title, 110, y + 64, 40, C.white);
    // 两张小照片
    drawPrint(g, 230, y + 230, 200, 250, { k: 3, faceOpt: { who, expr: 'smile', flip: false }, label: left });
    drawPrint(g, 470, y + 230, 200, 250, { k: 3, faceOpt: { who, expr: 'smile', flip: true }, label: right, hot: win === 'R' && t > t0 + .9 ? C.gold : null });
    if (win === 'L' && t > t0 + .9) { g.strokeStyle = C.gold; g.lineWidth = 10; g.strokeRect(118, y + 92, 224, 276); }
    // 票数条
    const u = E.out(clamp((t - t0 - .4) / .8)), pct = Math.round(lv * u);
    g.fillStyle = '#3B3363'; g.fillRect(620, y + 140, 60, 220);
    g.fillStyle = C.gold; const hh = Math.round(220 * lv / 100 * u); g.fillRect(620, y + 360 - hh, 60, hh);
    ptext(g, pct + '%', 650, y + 128, 40, C.gold, { align: 'center' });
    ptext(g, '挑' + (win === 'L' ? '原版' : '镜像版'), 790, y + 260, 32, C.white, { align: 'center' });
    g.restore();
  };
  row(240, S('s5'), '挑自己的照片', 'you', '原版', '镜像版', 'R', 71);
  row(700, CH('s5', 2), '挑好朋友的照片', 'friendA', '原版', '镜像版', 'L', 76);
  source(g, 'Amestoy 等，Frontiers in Psychology 2010；最早见 Mita 等 1977', 880, 1150);
  dialogBox(g, t, 'd3', PORTRAIT.friend, { pfill: '#5A3A30' });
  if (t > S('s6') - .1) {
    const p = pop(t, CH('s6', 1) - .2, .35);
    if (p > 0) {
      g.fillStyle = `rgba(16,12,30,${.75 * Math.min(1, p)})`; g.fillRect(0, 0, W, H);
      g.save(); g.translate(480, 700); g.scale(p, p);
      ptext(g, '不是丑', 0, -40, 120, C.white, { align: 'center', ol: C.ink, olw: 9, sh: 1 });
      if (t > CH('s6', 2) - .2) ptext(g, '是不熟', 0, 140, 144, C.amber, { align: 'center', ol: C.ink, olw: 10, sh: 1 });
      g.restore();
    }
  }
}

/* ================= 两个帮凶：定格、离太近 ================= */
function helpers(g, t) {
  if (t < S('k2') - .12) { bosses(g, t); return; }
  if (t < S('k3') - .12) { frozen(g, t); return; }
  selfie(g, t);
}
function bossCard(g, t, t0, x, y, title, name, icon) {
  const p = pop(t, t0, .4); if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(p, p); g.rotate(Math.sin(t * 3 + x) * .03);
  pbox(g, -170, -200, 340, 400, { k: 6, fill: 'rgba(60,20,40,.95)' });
  g.fillStyle = '#D9443B'; g.fillRect(-158, -188, 316, 64);
  ptext(g, title, 0, -140, 36, C.white, { align: 'center' });
  icon(g, 0, 10);
  ptext(g, name, 0, 160, 48, C.gold, { align: 'center', sh: 1 });
  g.restore();
}
function bosses(g, t) {
  g.fillStyle = '#1A1020'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(217,68,59,${.06 + .04 * Math.sin(t * 3 + i)})`; g.fillRect(0, i * 320, W, 160); }
  popText(g, t, S('k1') + .05, 99, '两个帮凶', 480, 360, 120, C.red);
  bossCard(g, t, S('k1') + .4, 270, 760, '帮凶 ①', '定格', (g2, x, y) => iconPause(g2, x, y, 10));
  bossCard(g, t, S('k1') + .7, 690, 760, '帮凶 ②', '离太近', (g2, x, y) => { g2.fillStyle = '#22202A'; g2.fillRect(x - 40, y - 70, 80, 140); g2.fillStyle = '#5EC8FF'; g2.fillRect(x - 30, y - 56, 60, 108); });
}
/* 定格：一段视频里截出来的一帧，正好眨眼、张嘴 */
function frozen(g, t) {
  g.fillStyle = '#121218'; g.fillRect(0, 0, W, H);
  popTag(g, t, S('k2') + .05, 480, 260, '帮凶 ①：定格', 40, { fill: '#FF8A7A' });
  // 胶片：一格格往左走，到"只抓一瞬间"时停住
  const exprs = ['smile', 'happy', 'smile', 'blink', 'frozen', 'smile', 'happy', 'smile', 'flat', 'smile'];
  const tStop = CH('k2', 2) - .3, run = Math.min(t, tStop) - S('k2'), off = (run * 260) % (exprs.length * 240);
  const y = 560, fw = 220, gap = 20;
  g.fillStyle = '#26242C'; g.fillRect(0, y - 40, W, 320);
  for (let i = 0; i < 40; i++) { const hx = ((i * 54 - off * 1) % (W + 60) + W + 60) % (W + 60) - 30; g.fillStyle = '#121218'; g.fillRect(hx, y - 28, 24, 16); g.fillRect(hx, y + 252, 24, 16); }
  for (let i = -1; i < 6; i++) {
    const idx = ((Math.floor(off / (fw + gap)) + i) % exprs.length + exprs.length) % exprs.length;
    const x = i * (fw + gap) - (off % (fw + gap)) + 40;
    g.fillStyle = '#B9D7EA'; g.fillRect(x, y, fw, 240);
    clipRect(g, x, y, fw, 240, () => drawFace(g, x + fw / 2, y + 140, 4, { expr: exprs[idx] }));
  }
  // 停住：截图那一帧放大
  if (t > tStop) {
    const p = pop(t, tStop + .1, .35);
    g.save(); g.translate(300, 1060); g.scale(p, p);
    g.fillStyle = '#FFFDF6'; g.fillRect(-170, -190, 340, 380); g.fillStyle = '#B9D7EA'; g.fillRect(-152, -172, 304, 290);
    clipRect(g, -152, -172, 304, 290, () => drawFace(g, 0, 0, 5, { expr: 'frozen' }));
    ptext(g, '截图', 0, 168, 40, C.ink, { align: 'center' });
    g.restore();
  }
  // 看视频 vs 看截图
  if (t > CH('k2', 3) - .35) {
    const p = pop(t, CH('k2', 3) - .3, .35);
    g.save(); g.translate(690, 1060); g.scale(p, p);
    pbox(g, -170, -190, 340, 380, { k: 6 });
    ptext(g, '看视频', 0, -110, 40, C.white, { align: 'center' });
    ptext(g, '比看截图', 0, -40, 36, '#CFC6E8', { align: 'center' });
    ptext(g, '更好看', 0, 60, 64, C.gold, { align: 'center', sh: 1 });
    for (let i = 0; i < 3; i++) { g.fillStyle = C.green; g.fillRect(-60 + i * 48, 110 - i * 16, 32, 40 + i * 16); }
    g.restore();
  }
  if (t > CH('k2', 3)) source(g, 'Post 等，Frontiers in Psychology 2012', 880, 1250, { col: '#8C88A0' });
}
/* 离太近：30 厘米自拍，鼻子显宽三成；一米半，几乎不变形 */
function selfie(g, t) {
  bgTiles(g, '#E8EEF8', '#D8E2F0', 72);
  popTag(g, t, S('k3') + .05, 480, 260, '帮凶 ②：离太近', 40, { fill: '#FF8A7A' });
  const near = t > CH('k3', 1) - .3, far = t > CH('k3', 3) - .3;
  // 左：30 厘米
  if (near) {
    const p = pop(t, CH('k3', 1) - .3, .35), w = clamp((t - CH('k3', 2) + .2) / .8) * .42;
    g.save(); g.translate(270, 760); g.scale(p, p);
    drawPhone(g, 0, 0, 340, 480, t, { k: 8, faceOpt: { expr: 'smile', warp: w } });
    if (w > .2) markCircle(g, 0, 96, 46, '#FF6F8E', clamp((w - .2) / .2));
    g.restore();
    withAlpha(g, clamp(p), () => {
      ptext(g, '30 厘米', 270, 1080, 48, C.ink, { align: 'center' });
      g.fillStyle = '#3B3363'; g.fillRect(170, 1110, 200, 10);
    });
    if (t > CH('k3', 2)) {
      const q = pop(t, CH('k3', 2) + .3, .35);
      g.save(); g.translate(270, 450); g.scale(q, q); ptag(g, 0, 0, '鼻子显宽约 30%', 32, { fill: '#FF6F8E' }); g.restore();
    }
  }
  // 右：一米半
  if (far) {
    const p = pop(t, CH('k3', 3) - .3, .35);
    g.save(); g.translate(690, 760); g.scale(p, p);
    drawPhone(g, 0, 0, 340, 480, t, { k: 4, faceOpt: { expr: 'smile' } });
    g.restore();
    withAlpha(g, clamp(p), () => {
      ptext(g, '1.5 米', 690, 1080, 48, C.ink, { align: 'center' });
      g.fillStyle = '#3B3363'; g.fillRect(540, 1110, 300, 10);
    });
    if (t > CH('k3', 4) - .3) { const q = pop(t, CH('k3', 4) - .25, .35); g.save(); g.translate(690, 450); g.scale(q, q); ptag(g, 0, 0, '几乎不变形', 32, { fill: '#9FE3C4' }); g.restore(); }
  }
  if (near) source(g, 'Ward 等，JAMA Facial Plastic Surgery 2018', 880, 1180, { col: '#6B6488' });
}
