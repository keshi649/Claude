// world2.js — 剧场里面：舞台（中景）、灯光室（里面）、追光灯、剖面图（舞台、观众席、灯光室一张画里）。
// 都用屏幕坐标；o.mode：'day' 排练（工作灯，亮）、'show' 演出（暗，只有追光）、'dawn' 清晨（只有守夜灯）、'night' 散场后

// ---------------- 追光灯 ----------------
// (x, y) 灯身中心，s 大小，ang 灯头朝向（度，0 朝右，180 朝左）；o.on 亮度
function followSpot(g, x, y, s, ang, o = {}) {
  withSeed(o.seed ?? 7100, () => {
    // 三脚架
    const legs = [[x - s * 0.9, y + s * 2.2], [x + s * 0.2, y + s * 2.3], [x + s * 1.0, y + s * 2.15]];
    for (const L of legs) sk(g, [[x, y + s * 0.55], L], { w: 2.2, a: 0.85 });
    sk(g, [[x, y + s * 0.3], [x, y + s * 1.3]], { w: 3, a: 0.9 });
    g.save(); g.translate(x, y); g.rotate(R(ang));
    // 灯筒
    const body = [[-s * 1.2, -s * 0.38], [s * 0.9, -s * 0.46], [s * 0.9, s * 0.46], [-s * 1.2, s * 0.38]];
    part(g, body, { tone: 0.72, ang: 90, w: 2.4, per: 2 });
    for (let i = 1; i < 4; i++) sk(g, [[-s * 1.2 + i * s * 0.42, -s * 0.4], [-s * 1.2 + i * s * 0.42, s * 0.4]], { w: 1.2, a: 0.5, passes: 1 });
    // 前面的镜头
    const lens = [[s * 0.9, -s * 0.55], [s * 1.15, -s * 0.5], [s * 1.15, s * 0.5], [s * 0.9, s * 0.55]];
    part(g, lens, { tone: 0.3, w: 2.2, per: 2 });
    if (o.on) { const lp = new Path2D(); lp.ellipse(s * 1.15, 0, s * 0.08, s * 0.44, 0, 0, 6.283); erase(g, lp, o.on); }
    // 把手
    sk(g, [[-s * 1.2, s * 0.1], [-s * 1.7, s * 0.25]], { w: 3, a: 0.9 });
    sk(g, [[-s * 0.2, -s * 0.42], [-s * 0.2, -s * 0.8], [s * 0.3, -s * 0.8], [s * 0.3, -s * 0.45]], { w: 2, a: 0.85 });
    g.restore();
  });
  if (o.on) { const a = R(ang); glow(g, x + Math.cos(a) * s * 1.2, y + Math.sin(a) * s * 1.2, s * 1.4, C.amberHot, 0.5 * o.on); }
}
// 追光：从灯打到台上，一束暖光、柔边、光里有灰尘；落地一圈光斑
function spotBeam(g, x0, y0, x1, y1, r1, t, o = {}) {
  const on = o.on ?? 1;
  if (on <= 0.01) return;
  beam(g, x0, y0, x1, y1, o.w0 ?? 30, r1 * 2, C.amber, 0.42 * on, { layers: 6, endA: 0.7 });
  beam(g, x0, y0, x1, y1, (o.w0 ?? 30) * 0.5, r1 * 1.2, C.amberHot, 0.22 * on, { layers: 3, endA: 0.5 });
  dust(g, x0, y0, x1, y1, o.w0 ?? 30, r1 * 2, o.dustN ?? 60, t, C.amberHot, 0.5 * on, o.seed ?? 7);
  // 地上的光斑
  g.save(); g.translate(x1, y1 + (o.floorDy ?? 0)); g.scale(1, o.squash ?? 0.22);
  glow(g, 0, 0, r1 * 1.5, C.amberHot, 0.55 * on); glow(g, 0, 0, r1 * 2.4, C.amber, 0.35 * on);
  g.restore();
}
// 把整个画面压暗，只留几处亮的地方（holes: [x, y, rx, ry]）：用排线画的黑
function darkness(g, v, holes = [], o = {}) {
  const T_ = BUF_T.getContext('2d');
  T_.setTransform(1, 0, 0, 1, 0, 0); T_.globalCompositeOperation = 'source-over'; T_.clearRect(0, 0, W, H);
  T_.save(); T_.setTransform(g.getTransform());
  const full = new Path2D(); full.rect(-4000, -4000, 8000, 8000);
  shade(T_, full, v, o.ang ?? 28, { scale: 1 });
  T_.restore();
  T_.globalCompositeOperation = 'destination-out';
  T_.setTransform(g.getTransform());
  for (const h of holes) {
    T_.save(); T_.translate(h[0], h[1]); T_.scale(1, h[3] / h[2]);
    const gr = T_.createRadialGradient(0, 0, 0, 0, 0, h[2]);
    gr.addColorStop(0, `rgba(0,0,0,${h[4] ?? 1})`); gr.addColorStop(0.55, `rgba(0,0,0,${(h[4] ?? 1) * 0.8})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    T_.fillStyle = gr; T_.fillRect(-h[2], -h[2], h[2] * 2, h[2] * 2); T_.restore();
  }
  T_.setTransform(1, 0, 0, 1, 0, 0); T_.globalCompositeOperation = 'source-over';
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = o.a ?? 1; g.drawImage(BUF_T, 0, 0); g.restore();
}

// ---------------- 幕布 ----------------
// 竖着挂的幕：x0~x1，y0~y1，褶子 n 道；open 0~1 往一边收起来（side: -1 收到左边，1 收到右边）
function curtain(g, x0, x1, y0, y1, n, t, o = {}) {
  const tone = o.tone ?? 0.62;
  withSeed(o.seed ?? 7200, () => {
    const w = (x1 - x0) / n;
    for (let i = 0; i < n; i++) {
      const xa = x0 + i * w, xb = xa + w, sw = Math.sin(t * 0.8 + i) * w * 0.04 * (o.sway ?? 1);
      const pts = [[xa + sw * 0.3, y0], [xb + sw * 0.3, y0], [xb + sw, y1], [xa + sw, y1]];
      const pp = pathOf(pts); paperFill(g, pp);
      // 每道褶子：中间亮、两边暗
      g.save(); g.clip(pp);
      const gr = g.createLinearGradient(xa, 0, xb, 0);
      gr.addColorStop(0, rgba(GRAPH, 0.62 * tone + 0.1)); gr.addColorStop(0.45, rgba(GRAPH, 0.12 * tone)); gr.addColorStop(1, rgba(GRAPH, 0.75 * tone + 0.1));
      g.fillStyle = gr; g.fillRect(xa - 20, y0, w + 40, y1 - y0);
      hatchLayer(g, pp, tone * 0.7, 86, { scale: 1 });
      g.restore();
      sk(g, [[xa + sw * 0.3, y0], [xa + sw, y1]], { w: 1.6, a: 0.75 });
    }
    // 下摆
    const hem = []; for (let i = 0; i <= n * 2; i++) hem.push([x0 + i * w / 2 + Math.sin(t * 0.8 + i) * 2, y1 + (i % 2 ? 6 : -2)]);
    sk(g, hem, { w: 2, a: 0.8 });
    if (o.warm) glow(g, (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) * 0.8, C.amber, 0.18 * o.warm, 'multiply');
  });
}
// 顶上的檐幕：一排波浪形的布边，带穗子
function valance(g, x0, x1, y1, t, o = {}) {
  withSeed(o.seed ?? 7300, () => {
    const pts = [[x0 - 20, -60], [x1 + 20, -60]];
    const n = o.n ?? 9, w = (x1 - x0) / n;
    for (let i = n; i >= 0; i--) { pts.push([x0 + i * w, y1 - 22]); if (i > 0) pts.push([x0 + (i - 0.5) * w, y1 + 10]); }
    const pp = pathOf(pts); paperFill(g, pp); shade(g, pp, o.tone ?? 0.68, 86, { scale: 1 });
    const edge = []; for (let i = 0; i <= n; i++) { edge.push([x0 + i * w, y1 - 22]); if (i < n) edge.push([x0 + (i + 0.5) * w, y1 + 10]); }
    sk(g, spline(edge, 6), { w: 2.4, a: 0.85 });
    for (let i = 0; i < n; i++) { const tx = x0 + (i + 0.5) * w; sk(g, [[tx, y1 + 10], [tx, y1 + 34]], { w: 1.4, a: 0.7 }); erase(g, circlePath(tx, y1 + 38, 5), 0.7); skEllipse(g, tx, y1 + 38, 5, 5, { w: 1, a: 0.6, passes: 1 }); }
  });
}

// ---------------- 舞台（中景，正面看过去） ----------------
// floorY：台面和天幕交界的线；frontY：台口的边
function stageSet(g, t, o = {}) {
  const mode = o.mode ?? 'day';
  const floorY = o.floorY ?? 640, frontY = o.frontY ?? 990;
  const dark = mode === 'show' ? 1 : mode === 'dawn' ? 0.72 : mode === 'night' ? 0.8 : 0;
  // 天幕：一块画着海和月亮的布景
  const bd = rectPath(150, -60, 1620, floorY + 62);
  paperFill(g, bd); shade(g, bd, 0.05 + dark * 0.42, 20, { scale: 1 });
  withSeed(7400, () => {
    // 画在布上的海和月亮（像舞台布景那样平平的）
    const by = floorY - 170;
    const seaP = rectPath(150, by, 1620, floorY - by); shade(g, seaP, 0.28 + dark * 0.35, 0, { scale: 1.3 });
    for (let i = 0; i < 9; i++) sk(g, spline([[150, by + 12 + i * 17], [600, by + 6 + i * 17], [1100, by + 16 + i * 17], [1770, by + 8 + i * 17]], 5), { w: 1.3, a: 0.4, passes: 1 });
    erase(g, circlePath(o.moonX ?? 1300, 200, 70), 0.85); skEllipse(g, o.moonX ?? 1300, 200, 70, 70, { w: 2, a: 0.7 });
    // 布的褶皱
    for (let i = 0; i < 8; i++) sk(g, [[190 + i * 205, -40], [205 + i * 205, floorY]], { w: 1, a: 0.16, passes: 1 });
    sk(g, [[150, floorY], [1770, floorY]], { w: 2.2, a: 0.85 });
  });
  // 台面：木地板，透视的线往中间收
  const fl = new Path2D(); fl.moveTo(-100, floorY); fl.lineTo(2020, floorY); fl.lineTo(2020, frontY); fl.lineTo(-100, frontY); fl.closePath();
  paperFill(g, fl); shade(g, fl, 0.1 + dark * 0.6, 4, { scale: 1 });
  withSeed(7401, () => {
    for (let i = -14; i <= 14; i++) { const xb = 960 + i * 140; sk(g, [[960 + i * 52, floorY], [xb, frontY]], { w: 1, a: 0.32, passes: 1 }); }
    for (let k = 1; k < 5; k++) { const y = lerp(floorY, frontY, k * k / 25); sk(g, [[-100, y], [2020, y]], { w: 0.9, a: 0.22, passes: 1 }); }
  });
  // 台口的边、台唇、地排灯
  const lip = rectPath(-100, frontY, 2120, 140); paperFill(g, lip); shade(g, lip, 0.8, 80, { scale: 1 });
  withSeed(7402, () => {
    sk(g, [[-100, frontY], [2020, frontY]], { w: 3, a: 0.92 });
    if (o.footlights !== false) for (let i = 0; i < 9; i++) {
      const x = 180 + i * 195, y = frontY - 4;
      const fp = new Path2D(); fp.ellipse(x, y, 34, 14, 0, Math.PI, 0); fp.closePath();
      paperFill(g, fp); shade(g, fp, 0.7, 0); sk(g, spline([[x - 34, y], [x, y - 15], [x + 34, y]], 5), { w: 1.8, a: 0.85 });
      if (o.foot) glow(g, x, y - 8, 60, C.amberHot, 0.35 * o.foot);
    }
  });
  if (o.mark) { // 地上贴的胶带"X"
    const [mx, my] = o.mark;
    sk(g, [[mx - 22, my - 9], [mx + 22, my + 9]], { w: 5, a: 0.75, passes: 1 }); sk(g, [[mx - 22, my + 9], [mx + 22, my - 9]], { w: 5, a: 0.75, passes: 1 });
  }
  // 两边的侧幕、顶上的檐幕
  curtain(g, -100, 230, -60, frontY, 4, t, { tone: 0.5 + dark * 0.35, seed: 7210 });
  curtain(g, 1690, 2020, -60, frontY, 4, t, { tone: 0.5 + dark * 0.35, seed: 7220 });
  valance(g, -100, 2020, 120, t, { n: 10, tone: 0.5 + dark * 0.35 });
  if (mode === 'day') { glow(g, 960, 100, 1100, C.amberHot, 0.2); glow(g, 960, 700, 700, [255, 248, 236], 0.18); }
  if (o.ghost) ghostLight(g, o.ghost[0], o.ghost[1], 1.0, t);
}
// 守夜灯：舞台上过夜留着的一盏灯泡
function ghostLight(g, x, y, s, t) {
  withSeed(7500, () => {
    sk(g, [[x, y], [x, y - 230 * s]], { w: 3, a: 0.9 });
    const base = [[x - 40 * s, y], [x - 30 * s, y - 14 * s], [x + 30 * s, y - 14 * s], [x + 40 * s, y]]; part(g, base, { tone: 0.75, w: 2 });
    const cage = []; for (let i = 0; i <= 12; i++) { const a = i / 12 * 6.283; cage.push([x + Math.cos(a) * 18 * s, y - 250 * s + Math.sin(a) * 22 * s]); }
    erase(g, circlePath(x, y - 250 * s, 15 * s), 1);
    sk(g, cage, { w: 1.4, a: 0.7 });
    sk(g, [[x, y - 272 * s], [x, y - 228 * s]], { w: 1.2, a: 0.6 });
  });
  glow(g, x, y - 250 * s, 70 * s, C.amberHot, 0.6);
  glow(g, x, y - 250 * s, 320 * s, C.amber, 0.25);
}

// ---------------- 灯光室（里面） ----------------
// 左边是对着舞台的窗，前面是调光台，右边是追光灯
function boothInside(g, t, o = {}) {
  const mode = o.mode ?? 'show';
  // 墙
  const wall = rectPath(-100, -100, 2120, 1300); paperFill(g, wall); shade(g, wall, mode === 'day' ? 0.32 : 0.7, 30, { scale: 1 });
  // 窗：里面是远处的舞台
  const wx0 = o.winX0 ?? 90, wx1 = o.winX1 ?? 1020, wy0 = 150, wy1 = 640;
  const win = rectPath(wx0, wy0, wx1 - wx0, wy1 - wy0);
  paperFill(g, win);
  g.save(); g.clip(win);
  if (o.view) o.view(g, wx0, wy0, wx1, wy1);
  // 玻璃上的反光：几道斜的擦痕
  for (let i = 0; i < 4; i++) { const x = wx0 + 120 + i * 230; eraseStroke(g, [[x, wy1], [x + 160, wy0]], 18 - i * 3, 0.16); }
  g.restore();
  withSeed(7600, () => {
    skRect(g, wx0, wy0, wx1 - wx0, wy1 - wy0, { w: 3, a: 0.92 });
    sk(g, [[(wx0 + wx1) / 2, wy0], [(wx0 + wx1) / 2, wy1]], { w: 2.4, a: 0.85 });
    const sill = rectPath(wx0 - 20, wy1, wx1 - wx0 + 40, 18); paperFill(g, sill); shade(g, sill, 0.5, 0); skRect(g, wx0 - 20, wy1, wx1 - wx0 + 40, 18, { w: 1.8, a: 0.8 });
  });
  // 调光台（前景，下面）
  const cy0 = o.consoleY ?? 760;
  const desk = new Path2D(); desk.moveTo(-100, cy0 + 40); desk.lineTo(2020, cy0 + 40); desk.lineTo(2020, 1200); desk.lineTo(-100, 1200); desk.closePath();
  paperFill(g, desk); shade(g, desk, 0.6, 0, { scale: 1 });
  const top = new Path2D(); top.moveTo(40, cy0 - 70); top.lineTo(1880, cy0 - 70); top.lineTo(2020, cy0 + 40); top.lineTo(-100, cy0 + 40); top.closePath();
  paperFill(g, top); shade(g, top, mode === 'day' ? 0.2 : 0.42, 0, { scale: 1 });
  withSeed(7601, () => {
    sk(g, [[40, cy0 - 70], [1880, cy0 - 70]], { w: 2.2, a: 0.85 }); sk(g, [[-100, cy0 + 40], [2020, cy0 + 40]], { w: 2.6, a: 0.9 });
    // 推子：一排槽，每个上面一个小钮
    for (let i = 0; i < 14; i++) {
      const x = 150 + i * 62, v = o.faders ? o.faders(i) : 0.3 + 0.4 * hash(i, 5);
      sk(g, [[x, cy0 - 50], [x - 4, cy0 + 20]], { w: 2.4, a: 0.7, passes: 1 });
      const ky = lerp(cy0 + 16, cy0 - 46, v);
      const kn = rectPath(x - 2 - 12, ky - 6, 24, 12); paperFill(g, kn); shade(g, kn, 0.3, 0); skRect(g, x - 14, ky - 6, 24, 12, { w: 1.4, a: 0.85, over: 1 });
    }
    // 几排小灯和旋钮
    for (let i = 0; i < 10; i++) { const x = 1100 + i * 58; skEllipse(g, x, cy0 - 30, 12, 7, { w: 1.4, a: 0.75, passes: 1 }); const lit = (Math.floor(t * 2) + i) % 4 === 0; erase(g, circlePath(x, cy0 + 4, 5), 0.9); if (lit && mode !== 'day') glow(g, x, cy0 + 4, 18, C.amberHot, 0.6); }
  });
  if (o.lamp !== false) deskLamp(g, o.lampX ?? 1700, cy0 - 70, 1, t, { on: o.lampOn ?? (mode === 'day' ? 0 : 1) });
}
function deskLamp(g, x, y, s, t, o = {}) {
  withSeed(7700 + x, () => {
    const base = [[x - 50 * s, y], [x - 40 * s, y - 14 * s], [x + 40 * s, y - 14 * s], [x + 50 * s, y]]; part(g, base, { tone: 0.7, w: 2 });
    sk(g, [[x, y - 12 * s], [x - 40 * s, y - 120 * s], [x - 10 * s, y - 190 * s]], { w: 3, a: 0.9 });
    const hd = [[x - 40 * s, y - 210 * s], [x + 10 * s, y - 200 * s], [x + 40 * s, y - 150 * s], [x - 20 * s, y - 140 * s]]; part(g, hd, { tone: 0.75, w: 2.2, per: 3 });
  });
  if (o.on) { glow(g, x + 10 * s, y - 150 * s, 90 * s, C.amberHot, 0.5 * o.on); glow(g, x, y - 60 * s, 300 * s, C.amber, 0.3 * o.on); }
}

// ---------------- 剖面图：左边舞台、中间观众席、右后方高处的灯光室 ----------------
// 返回几个关键位置，给人物和追光用
const SECT = { stageY: 700, stageX1: 640, boothX0: 1430, boothX1: 1790, boothY0: 250, boothY1: 520, winX: 1440, spotX: 1520, spotY: 380, floorY: 930 };
function theaterSection(g, t, o = {}) {
  const S = SECT, mode = o.mode ?? 'show';
  const dk = mode === 'show' ? 0.86 : mode === 'night' ? 0.8 : mode === 'dawn' ? 0.62 : 0.3;
  // 剧场里的空间（墙、天花板）
  const room = rectPath(-100, -100, 2120, 1300); paperFill(g, room); shade(g, room, dk, 28, { scale: 1 });
  withSeed(7800, () => {
    // 天花板上的吊杆和灯
    for (let i = 0; i < 4; i++) { const x0 = 80 + i * 360; sk(g, [[x0, 90 + i * 8], [x0 + 260, 90 + i * 8]], { w: 2.2, a: 0.75 }); for (let k = 0; k < 4; k++) { const lx = x0 + 30 + k * 60; sk(g, [[lx, 90 + i * 8], [lx, 112 + i * 8]], { w: 1.4, a: 0.7 }); const lp = [[lx - 12, 112 + i * 8], [lx + 12, 112 + i * 8], [lx + 9, 140 + i * 8], [lx - 9, 140 + i * 8]]; part(g, lp, { tone: 0.75, w: 1.4, per: 2 }); } }
    // 舞台：台面、台口的大幕（侧面看是一条）、侧幕
    const st = rectPath(-100, S.stageY, S.stageX1 + 100, H - S.stageY + 100); paperFill(g, st); shade(g, st, Math.min(0.95, dk + 0.2), 80, { scale: 1 });
    const sfl = rectPath(-100, S.stageY - 6, S.stageX1 + 100, 12); paperFill(g, sfl); shade(g, sfl, 0.35, 0);
    sk(g, [[-100, S.stageY - 6], [S.stageX1, S.stageY - 6]], { w: 2.6, a: 0.92 }); sk(g, [[S.stageX1, S.stageY - 6], [S.stageX1, H + 20]], { w: 2.6, a: 0.92 });
    for (let x = 0; x < S.stageX1; x += 60) sk(g, [[x, S.stageY + 12], [x, S.stageY + 40]], { w: 0.9, a: 0.3, passes: 1 });
    // 台口上方的墙和大幕
    const pros = rectPath(S.stageX1 - 40, -100, 60, 330); paperFill(g, pros); shade(g, pros, 0.85, 80);
    curtain(g, S.stageX1 - 40, S.stageX1 + 10, -100, 300, 1, t, { tone: 0.8 });
    // 观众席：一排排往后升高的座位
    for (let r = 0; r < 8; r++) {
      const x = S.stageX1 + 90 + r * 98, y = S.floorY - r * 34;
      const step = rectPath(x - 50, y, 100, H - y + 50); paperFill(g, step); shade(g, step, Math.min(0.95, dk + 0.06), 20, { scale: 1 });
      sk(g, [[x - 50, y], [x + 50, y]], { w: 1.8, a: 0.8 }); sk(g, [[x - 50, y], [x - 50, y + 34]], { w: 1.8, a: 0.8 });
      // 椅子（侧面）
      const seat = [[x - 26, y], [x - 26, y - 34], [x + 10, y - 34], [x + 14, y - 30], [x + 14, y - 80], [x + 26, y - 82], [x + 28, y - 34], [x + 28, y]];
      part(g, seat, { tone: 0.75, w: 1.8, per: 2 });
      if (o.audience) { // 观众的后脑勺和肩膀
        const hx = x + 2, hy = y - 96;
        const sh_ = [[hx - 26, y - 34], [hx - 22, hy + 20], [hx + 18, hy + 22], [hx + 24, y - 34]]; part(g, sh_, { tone: 0.88, w: 1.6 });
        skEllipse(g, hx, hy, 15, 17, { w: 1.6, a: 0.8 }); const hp = circlePath(hx, hy, 15); paperFill(g, hp); shade(g, hp, 0.9, 40); skEllipse(g, hx, hy, 15, 17, { w: 1.6, a: 0.8 });
      }
    }
    // 后墙和灯光室
    const bw = rectPath(S.boothX0 - 30, -100, 520, S.boothY0 + 100); paperFill(g, bw); shade(g, bw, Math.min(0.95, dk + 0.05), 80, { scale: 1 });
    const booth = rectPath(S.boothX0, S.boothY0, S.boothX1 - S.boothX0, S.boothY1 - S.boothY0);
    paperFill(g, booth); shade(g, booth, mode === 'day' ? 0.12 : 0.4, 30, { scale: 1 });
    const under = rectPath(S.boothX0 - 30, S.boothY1, 520, H - S.boothY1 + 100); paperFill(g, under); shade(g, under, Math.min(0.95, dk + 0.08), 80, { scale: 1 });
    skRect(g, S.boothX0, S.boothY0, S.boothX1 - S.boothX0, S.boothY1 - S.boothY0, { w: 2.8, a: 0.92 });
    // 灯光室朝舞台的窗（左边那面墙上）
    sk(g, [[S.boothX0, S.boothY0 + 40], [S.boothX0, S.boothY0 + 170]], { w: 1.4, a: 0.5 });
    // 室内的调光台
    const cd = rectPath(S.boothX0 + 140, S.boothY1 - 70, 200, 70); paperFill(g, cd); shade(g, cd, 0.5, 0); skRect(g, S.boothX0 + 140, S.boothY1 - 70, 200, 70, { w: 1.8, a: 0.85 });
  });
  if (o.boothLamp ?? (mode !== 'day')) glow(g, S.boothX0 + 280, S.boothY1 - 90, 120, C.amber, 0.45);
}
