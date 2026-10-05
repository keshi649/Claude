'use strict';
/* main.js：场景编排、转场、全局叠加层（字幕、路线条、颗粒）与逐帧入口 */

const SCENES = [
  // [开始, 结束, 场景函数, 进场转场]。章节卡盖在转场上面，所以进关卡的场景用 'cut'
  [0, T.map + .3, sceneOpen],
];
if (typeof sceneMap === 'function') SCENES.push([T.map, T.g1 + .5, sceneMap, 'fade']);
if (typeof sceneCold === 'function') SCENES.push([T.g1 + .4, T.cells + .5, sceneCold, 'cut']);
if (typeof sceneCells === 'function') SCENES.push([T.cells, T.flow + .5, sceneCells, 'fade']);
if (typeof sceneFlow === 'function') SCENES.push([T.flow, T.g2 + .5, sceneFlow, 'fade']);
if (typeof sceneMice === 'function') SCENES.push([T.g2 + .4, T.lept + .5, sceneMice, 'cut']);
if (typeof sceneLeptin === 'function') SCENES.push([T.lept, T.light + .5, sceneLeptin, 'fade']);
if (typeof sceneLight === 'function') SCENES.push([T.light, T.human + .5, sceneLight, 'fade']);
if (typeof sceneHuman === 'function') SCENES.push([T.human, T.g3 + .5, sceneHuman, 'fade']);
if (typeof sceneMemory === 'function') SCENES.push([T.g3 + .4, T.twins + .5, sceneMemory, 'cut']);
if (typeof sceneTwins === 'function') SCENES.push([T.twins, T.how + .5, sceneTwins, 'fade']);
if (typeof sceneHow === 'function') SCENES.push([T.how, T.fin + .5, sceneHow, 'fade']);
if (typeof sceneFinal === 'function') SCENES.push([T.fin, DURATION + 1, sceneFinal, 'fade']);

function composite(g, src, tr, u) {
  g.save();
  if (tr === 'iris') {
    const r = E.in(u) * 1300;
    g.beginPath(); g.arc(W / 2, H / 2, r, 0, TAU); g.clip(); g.drawImage(src, 0, 0); g.restore();
    if (u < 1) { g.save(); g.strokeStyle = C.fat; g.lineWidth = 10; g.beginPath(); g.arc(W / 2, H / 2, r, 0, TAU); g.stroke(); g.restore(); }
    return;
  }
  if (tr === 'slide') { const x = (1 - E.io(u)) * W; g.drawImage(src, x, 0); g.fillStyle = C.fat; g.fillRect(x - 10, 0, 10, H); }
  else if (tr === 'door') { // 两扇门向两侧拉开
    const k = E.io(u), half = W / 2;
    g.save(); g.beginPath(); g.rect(half - half * k, 0, W * k, H); g.clip(); g.drawImage(src, 0, 0); g.restore();
    if (u < 1) { g.fillStyle = hexA(C.fat, .9); g.fillRect(half - half * k - 6, 0, 6, H); g.fillRect(half + half * k, 0, 6, H); }
  }
  else if (tr === 'cut') { if (u >= .5) g.drawImage(src, 0, 0); }
  else { g.globalAlpha = E.sine(u); g.drawImage(src, 0, 0); }
  g.restore();
}

/* ---------- 叠加层：路线条、章节卡 ---------- */
const GATES = [
  { t0: () => T.g1, n: '第一关', name: '冷战的日期戳', tag: '房子，拆不掉', short: '房子' },
  { t0: () => T.g2, n: '第二关', name: '会说话的脂肪', tag: '一个警报', short: '警报' },
  { t0: () => T.g3, n: '第三关', name: '脂肪的记忆', tag: '最新的发现', short: '记忆' },
];
/* 小油沿路线前进的进度：0 起点，1/2/3 三道关卡，4 出口 */
function routeProgress(t) {
  const k = [[T.g1 + .4, 0], [T.g1 + 1.9, 1], [T.g2 + .4, 1], [T.g2 + 1.9, 2], [T.g3 + .4, 2], [T.g3 + 1.9, 3], [T.how, 3], [T.fin + 1.5, 4]];
  if (t <= k[0][0]) return 0;
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return lerp(k[i - 1][1], k[i][1], E.io(seg(t, k[i - 1][0], k[i][0])));
  return 4;
}
function routeBar(g, t) {
  const a0 = T.xy + .9, a1 = T.endcard;
  const a = win(t, a0, a1, .6, .5); if (a <= 0) return;
  const x0 = 430, x1 = 1490, y = 56, xs = [x0, x0 + (x1 - x0) * .25, x0 + (x1 - x0) * .5, x0 + (x1 - x0) * .75, x1];
  const pr = routeProgress(t), px = (() => { const i = Math.min(3, Math.floor(pr)); return lerp(xs[i], xs[i + 1], pr - i); })();
  g.save(); g.globalAlpha *= a; g.translate(0, (1 - E.out(seg(t, a0, a0 + .6))) * -90);
  rr(g, x0 - 120, y - 40, x1 - x0 + 240, 98, 49); fs(g, 'rgba(6,14,28,.72)', hexA(C.white, .16), 2);
  g.lineCap = 'round'; g.strokeStyle = 'rgba(160,190,235,.28)'; g.lineWidth = 7; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
  g.strokeStyle = C.fat; g.lineWidth = 7; g.beginPath(); g.moveTo(x0, y); g.lineTo(px, y); g.stroke();
  // 起点、出口
  fatCell(g, { x: x0, y, r: 21, t, nuc: false }); 
  g.save(); g.translate(x1, y); lungs(g, 0, 8, .2, Math.sin(t * 2) * .5 + .5); g.restore();
  // 三个关卡
  GATES.forEach((gt, i) => {
    const nx = xs[i + 1], on = pr >= i + 1 - .02, cur = Math.abs(pr - (i + 1)) < .6 && pr >= i + .7 && pr < i + 1.9;
    circ(g, nx, y, 24); fs(g, on ? C.fat : '#1B2C4C', on ? '#FFE9A0' : '#6F88B5', 3.5);
    text(g, String(i + 1), nx, y + 2, 28, on ? '#4A3000' : '#9FB4DA', 'black');
    text(g, gt.short, nx, y + 42, 22, cur ? C.fat : '#8CA3C9', 'black');
  });
  // 小油
  xiaoyou(g, { x: px, y: y - 2 - Math.abs(Math.sin(t * 6)) * 5, s: .26, t, expr: 'happy', glowA: 0, tailAmp: .6 });
  g.restore();
}
function chapterCard(g, t, k) {
  const gt = GATES[k], t0 = gt.t0(), u = t - t0; if (u < -.05 || u > 2.05) return;
  const close = E.out(seg(u, 0, .35)), open = E.io(seg(u, 1.35, 2.0)), cov = close * (1 - open);
  if (cov <= .001) return;
  g.save();
  const half = W / 2, lw = half * cov;
  for (const sg of [-1, 1]) {
    g.save(); const x = sg < 0 ? 0 : W - lw;
    g.beginPath(); g.rect(x, 0, lw, H); g.clip();
    const px = sg < 0 ? lw - half : half;               // 面板随开合水平移动
    g.translate(sg < 0 ? lw - half : W - lw, 0);
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0E2142'); gr.addColorStop(1, '#07101F'); g.fillStyle = gr; g.fillRect(0, 0, half, H);
    g.strokeStyle = 'rgba(120,160,230,.12)'; g.lineWidth = 3;
    for (let i = 1; i < 6; i++) { const lx = half * i / 6; g.beginPath(); g.moveTo(lx, 0); g.lineTo(lx, H); g.stroke(); }
    g.fillStyle = hexA(C.fat, .9 * (1 - clamp((cov - .96) / .04))); g.fillRect(sg < 0 ? half - 8 : 0, 0, 8, H);
    g.restore();
  }
  // 文字（只在合拢时显示）
  const ta = clamp((cov - .6) / .4) * (1 - E.in(seg(u, 1.3, 1.7)));
  if (ta > 0) {
    g.save(); g.globalAlpha *= ta; glow(g, W / 2, 480, 520, C.fat, .22);
    const p1 = pop(t, t0 + .25, .45), p2 = pop(t, t0 + .5, .45), p3 = clamp(seg(t, t0 + .75, t0 + 1.05));
    circ(g, W / 2, 340, 78 * p1); fs(g, C.fat, '#FFE9A0', 6); text(g, String(k + 1), W / 2, 346, 100 * p1, '#4A3000', 'fun');
    g.save(); g.translate(W / 2, 520); g.scale(p2, p2); rich(g, gt.n, 0, 0, 74, { font: 'fun', col: C.fat, stroke: 0 }); g.restore();
    g.save(); g.translate(W / 2, 640); g.scale(p2, p2); rich(g, gt.name, 0, 0, 120, { font: 'black', stroke: 0 }); g.restore();
    g.globalAlpha *= p3; text(g, gt.tag, W / 2, 770, 50, C.mute, 'bold');
    g.restore();
  }
  g.restore();
}
function overlays(g, t) {
  routeBar(g, t);
  if (typeof endCard === 'function') endCard(g, t);
  for (let k = 0; k < 3; k++) chapterCard(g, t, k);
}

function frame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const act = SCENES.filter(([a, b]) => t >= a && t < b);
  act.forEach(([a, b, fn, tr], idx) => {
    if (idx === 0) { ctx.save(); fn(ctx, t); ctx.restore(); return; }
    const prevEnd = act[idx - 1][1], u = clamp((t - a) / Math.max(.001, prevEnd - a));
    sceneG.setTransform(1, 0, 0, 1, 0, 0); sceneG.globalAlpha = 1; sceneG.filter = 'none'; sceneG.globalCompositeOperation = 'source-over'; sceneG.clearRect(0, 0, W, H);
    sceneG.save(); fn(sceneG, t); sceneG.restore();
    composite(ctx, sceneCv, tr, u);
  });
  ctx.save();
  if (typeof overlays === 'function') overlays(ctx, t);
  subShade(ctx, .42);
  drawSubs(ctx, t);
  if (t > DURATION - .6) { ctx.fillStyle = `rgba(0,0,0,${seg(t, DURATION - .6, DURATION)})`; ctx.fillRect(0, 0, W, H); }
  if (t < .5) { ctx.fillStyle = `rgba(0,0,0,${1 - seg(t, 0, .5)})`; ctx.fillRect(0, 0, W, H); }
  const r = R(Math.floor(t * 30) + 1);
  ctx.globalAlpha = .03; ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(GRAINS, -r() * 60, -r() * 60, W + 120, H + 120);
  ctx.restore();
}
window.frame = frame;
window.DURATION = DURATION;
window.READY = false;
Promise.all(['NotoBlack', 'NotoBold', 'Smiley'].map(f => document.fonts.load(`60px ${f}`, '测试'))).then(() => { window.READY = true; });
