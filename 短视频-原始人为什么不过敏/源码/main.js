'use strict';
/* main.js：场景编排、转场、HUD、字幕与逐帧入口 */

const fnOr = name => (typeof window[name] === 'function' ? window[name] : null);
const SCENE_FN = {
  hook: fnOr('hook'), guard: fnOr('guard'), history: fnOr('historyScene'), train: fnOr('train'), amish: fnOr('amish'),
  peanut: fnOr('peanut'), mismatch: fnOr('mismatch'), guide: fnOr('guide'), end: fnOr('endScene'), card: fnOr('endCard'),
};
const TRANS = { hook: null, guard: 'iris', history: 'cut', train: 'slide', amish: 'slide', peanut: 'iris', mismatch: 'glitch', guide: 'slide', end: 'iris', card: 'iris' };
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

/* 盾牌小图标 */
function iconShield(g, x, y, col = '#9FD3FF') {
  const k = 4; g.fillStyle = col;
  g.fillRect(x - 4 * k, y - 4 * k, 8 * k, 4 * k); g.fillRect(x - 3 * k, y, 6 * k, 2 * k); g.fillRect(x - 2 * k, y + 2 * k, 4 * k, k); g.fillRect(x - k, y + 3 * k, 2 * k, k);
  g.fillStyle = '#2C3E78'; g.fillRect(x - k, y - 3 * k, 2 * k, 4 * k); g.fillRect(x - 2 * k, y - 2 * k, 4 * k, 2 * k);
}

/* ---------- 叠加层：HUD、录像带、水印 ---------- */
function overlays(g, t) {
  if (t > SS('guard') + .3 && t < S('g5') - .12) {
    const alarm = t >= MK('g4');
    hud(g, [{ icon: (g, x, y) => iconShield(g, x, y), text: '鼻腔检查站 · 保安队' },
      { right: true, text: alarm ? '状态：警报！' : '状态：正常', col: alarm ? (Math.floor(t * 4) % 2 ? C.red : C.white) : C.green }],
      { alpha: win(t, SS('guard') + .3, S('g5') - .12, .3, 0) });
  }
  if (typeof hudLater2 === 'function') hudLater2(g, t);
  if (typeof hudLater3 === 'function') hudLater3(g, t);
  vcr(g, t, CH('y1', 1) - .45, CH('y1', 1) + .6, 'rew', '倒带', '1873 · 英国');
  if (t < SS('card')) withAlpha(g, .55, () => ptext(g, '甜菜', W - 36, 50, 24, C.white, { align: 'right', ol: 'rgba(0,0,0,.45)' }));
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
Promise.all(['Pix', 'Smiley'].map(f => document.fonts.load(`48px ${f}`, '测试过敏花粉'))).then(() => { window.READY = true; });
