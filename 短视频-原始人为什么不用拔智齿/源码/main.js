'use strict';
/* main.js：场景编排、转场、HUD、字幕与逐帧入口 */

const SCENE_FN = {
  hook: typeof hook === 'function' ? hook : null,
  lot: typeof lot === 'function' ? lot : null,
  past: typeof past === 'function' ? past : null,
  site: typeof siteScene === 'function' ? siteScene : null,
  rats: typeof rats === 'function' ? rats : null,
  wear: typeof wearScene === 'function' ? wearScene : null,
  mismatch: typeof mismatch === 'function' ? mismatch : null,
  guide: typeof guide === 'function' ? guide : null,
  end: typeof endScene === 'function' ? endScene : null,
  card: typeof endCard === 'function' ? endCard : null,
};
const TRANS = { hook: null, lot: 'iris', past: 'cut', site: 'slide', rats: 'slide', wear: 'iris', mismatch: 'glitch', guide: 'slide', end: 'iris', card: 'iris' };
const SCENES = [];
TL.scenes.forEach((s, i) => {
  const fn = SCENE_FN[s.name]; if (!fn) return;
  const next = TL.scenes[i + 1];
  SCENES.push([i ? s.t0 - .25 : 0, next ? s.t1 + .3 : DURATION + 1, fn, TRANS[s.name]]);
});

function composite(g, src, tr, u) {
  g.save();
  if (tr === 'iris') {
    const r = E.in(u) * 1250, k = 24;
    g.beginPath();
    for (let y = -r; y < r; y += k) { const hw = Math.sqrt(Math.max(0, r * r - y * y)); const hx = Math.ceil(hw / k) * k; g.rect(540 - hx, 900 + y, hx * 2, k); }
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

/* ---------- 叠加层：HUD、录像带、水印 ---------- */
function overlays(g, t) {
  if (typeof hudLater === 'function') hudLater(g, t);
  vcr(g, t, SS('past') - .2, SS('past') + .8, 'rew', '倒带', '几万年前');
  if (t < SS('card')) withAlpha(g, .55, () => ptext(g, '甜菜', W - 36, 50, 24, C.white, { align: 'right', ol: 'rgba(0,0,0,.45)' }));
}
function hudLater(g, t) {
  if (t > SS('lot') + .2 && t < SE('lot')) {
    const age = lotAge(t), R = modernR(age), n = R_NEED.filter(r => R >= r).length;
    hud(g, [{ icon: (g, x, y) => iconHat(g, x, y), text: '下巴停车场 · 现代' }, { right: true, text: `车位 ${n}/8`, col: n < 8 ? (t > S('l4') ? C.red : C.white) : C.green, flash: win(t, S('l4') + .8, S('l4') + 1.4, .05, .3) }], { alpha: win(t, SS('lot') + .2, SE('lot'), .3, .2) });
  }
  if (typeof hudLater2 === 'function') hudLater2(g, t);
  if (typeof hudLater3 === 'function') hudLater3(g, t);
}

/* 暗角 */
const vignCv = (() => {
  const c = mk(), g = c.getContext('2d');
  const gr = g.createRadialGradient(540, 900, 500, 540, 900, 1250);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.4)');
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
  overlays(ctx, t);
  subPlate(ctx, t);
  drawSubs(ctx, t);
  if (t > DURATION - .6) { ctx.fillStyle = `rgba(0,0,0,${seg(t, DURATION - .6, DURATION)})`; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}
window.frame = frame;
window.DURATION = DURATION;
window.READY = false;
Promise.all(['Pix', 'Smiley'].map(f => document.fonts.load(`48px ${f}`, '测试智齿'))).then(() => { window.READY = true; });
