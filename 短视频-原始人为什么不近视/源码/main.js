'use strict';
/* main.js：场景编排、转场、HUD、字幕与逐帧入口 */

const SCENES = [
  // [开始, 结束, 场景函数, 进场转场]
  [0, T.arctic + .3, hookSavanna],
  [T.arctic, T.ceil + .25, hookArctic, 'glitch'],
  [T.ceil, T.site + .02, hookCeiling, 'cut'],
  [T.site, T.rew + .55, eyeSite, 'iris'],
];
if (typeof savannaScene === 'function') SCENES.push(
  [T.rew + .45, T.siteS + .2, savannaScene, 'cut'],
  [T.siteS, T.rule + .2, savannaSite, 'iris'],
  [T.rule, T.lab + .3, ruleScene, 'slide'],
  [T.lab, T.ff + .6, labScene, 'slide'],
  [T.ff + .5, T.siteK + .25, classScene, 'cut'],
  [T.siteK, T.board + .25, nightSite, 'iris'],
  [T.board, T.gz + .3, boardScene, 'iris'],
);
if (typeof gzScene === 'function') SCENES.push(
  [T.gz, T.guide + .3, gzScene, 'slide'],
  [T.guide, T.fin + .3, guideScene, 'slide'],
  [T.fin, T.card + .3, finale, 'cut'],
  [T.card, DURATION + 1, endCard, 'iris'],
);

function composite(g, src, tr, u) {
  g.save();
  if (tr === 'iris') {
    const r = E.in(u) * 1250;
    g.beginPath();
    // 像素化的圆：用小方块近似
    const k = 24, rr = Math.max(1, r);
    for (let y = -rr; y < rr; y += k) { const hw = Math.sqrt(Math.max(0, rr * rr - y * y)); const hx = Math.ceil(hw / k) * k; g.rect(540 - hx, 900 + y, hx * 2, k); }
    g.clip(); g.drawImage(src, 0, 0); g.restore();
    return;
  }
  if (tr === 'slide') { const x = Math.round((1 - E.io(u)) * W / 12) * 12; g.drawImage(src, x, 0); g.fillStyle = C.ink; g.fillRect(x - 12, 0, 12, H); }
  else if (tr === 'cut') { if (u >= .5) g.drawImage(src, 0, 0); }
  else if (tr === 'glitch') {
    if (u >= .5) g.drawImage(src, 0, 0);
    const k = Math.floor(u * 12);
    for (let i = 0; i < 8; i++) { const y = hash(i, k) * H, h = 20 + hash(i, k, 1) * 90, dx = (hash(i, k, 2) - .5) * 160; g.drawImage(u >= .5 ? src : cv, 0, y, W, h, dx, y, W, h); }
  }
  else { g.globalAlpha = E.sine(u); g.drawImage(src, 0, 0); }
  g.restore();
}

/* ---------- HUD：不同段落显示不同的读数 ---------- */
function hudFor(g, t) {
  // 眼球工地（第一次）
  if (t > T.site + .3 && t < T.rew + .2) {
    const L = siteL(t), d = reserveOf(L);
    hud(g, [
      { icon: (g, x, y) => iconHat(g, x, y), text: '眼球工地' },
      { right: true, text: `眼轴 ${L.toFixed(1)}mm`, col: C.white },
      { right: true, text: `远视储备 ${d >= 0 ? '+' : ''}${d.toFixed(2)}D`, col: t > T.reserve - .1 ? C.gold : '#CFC6E8', flash: win(t, T.reserve - .1, T.reserve + .5, .05, .3) },
    ], { alpha: win(t, T.site + .3, T.rew + .2, .3, .2) });
  }
  if (typeof hudLater2 === 'function') hudLater2(g, t);
  if (typeof hudLater3 === 'function') hudLater3(g, t);
}

/* 开头的录像带回放标记 */
function overlays(g, t) {
  vcr(g, t, T.arctic + .15, T.ceil - .05, 'play', t < T.arctic + 1.2 ? '回放' : '', '北极 · 1960s');
  if (typeof overlays2 === 'function') overlays2(g, t);
  if (typeof overlays3 === 'function') overlays3(g, t);
}

/* 字幕底下压一层暗色，保证在亮场景里也看得清 */
function subShade(g, t) {
  const on = SUBS.some(([a, b]) => t >= a - .1 && t < b + .1);
  if (!on) return;
  const gr = g.createLinearGradient(0, SUB_Y - 150, 0, SUB_Y + 150);
  gr.addColorStop(0, 'rgba(10,8,24,0)'); gr.addColorStop(.5, 'rgba(10,8,24,.38)'); gr.addColorStop(1, 'rgba(10,8,24,0)');
  g.fillStyle = gr; g.fillRect(0, SUB_Y - 150, W, 300);
}

/* 暗角 */
const vignCv = (() => {
  const c = mk(), g = c.getContext('2d');
  const gr = g.createRadialGradient(540, 900, 500, 540, 900, 1250);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.42)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  return c;
})();

function frame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
  ctx.imageSmoothingEnabled = true;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const act = SCENES.filter(([a, b]) => t >= a && t < b);
  act.forEach(([a, b, fn, tr], idx) => {
    if (idx === 0) { ctx.save(); fn(ctx, t); ctx.restore(); return; }
    const prevEnd = act[idx - 1][1], u = clamp((t - a) / Math.max(.001, prevEnd - a));
    sceneG.setTransform(1, 0, 0, 1, 0, 0); sceneG.globalAlpha = 1; sceneG.filter = 'none'; sceneG.clearRect(0, 0, W, H);
    sceneG.save(); fn(sceneG, t); sceneG.restore();
    composite(ctx, sceneCv, tr, u);
  });
  ctx.save();
  ctx.drawImage(vignCv, 0, 0);
  hudFor(ctx, t);
  overlays(ctx, t);
  subShade(ctx, t);
  drawSubs(ctx, t);
  if (t > DURATION - .6) { ctx.fillStyle = `rgba(0,0,0,${seg(t, DURATION - .6, DURATION)})`; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}
window.frame = frame;
window.DURATION = DURATION;
window.READY = false;
Promise.all(['Pix', 'Smiley'].map(f => document.fonts.load(`48px ${f}`, '测试眼球'))).then(() => { window.READY = true; });
