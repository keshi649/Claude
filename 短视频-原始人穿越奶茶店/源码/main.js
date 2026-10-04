'use strict';
/* main.js：场景编排、转场、标题、字幕与逐帧入口 */

const SCENES = [
  // [开始, 结束, 场景函数, 进场转场]
  [0, T.zoom + .42, hookSip],
  [T.zoom + .3, T.same + .2, hookAlarm, 'fade'],
  [T.same, T.wild + .3, hookSame, 'iris'],
  [T.wild, T.shop + .02, wild, 'fade'],
  [T.shop - .02, T.cup + .25, shop, 'cut'],
  [T.cup, T.past + .3, cupBuild, 'iris'],
];
if (typeof past === 'function') SCENES.push(
  [T.past, T.rule + .3, past, 'slide'],
  [T.rule, T.combo + .3, rule, 'iris'],
  [T.combo, T.egg + .3, combo, 'slide'],
);
if (typeof eggScene === 'function') SCENES.push(
  [T.egg, T.you + .3, eggScene, 'iris'],
  [T.you, T.fix + .3, you, 'slide'],
  [T.fix, T.end + .3, fix, 'iris'],
  [T.end, T.order + .25, notice, 'fade'],
  [T.order, T.card + .3, order, 'cut'],
  [T.card, DURATION + 1, endCard, 'iris'],
);

function composite(g, src, tr, u) {
  g.save();
  if (tr === 'iris') {
    const r = E.in(u) * 1250;
    g.beginPath(); g.arc(540, 900, r, 0, TAU); g.clip(); g.drawImage(src, 0, 0); g.restore();
    if (u < 1) { g.save(); g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.arc(540, 900, r, 0, TAU); g.stroke(); g.restore(); }
    return;
  }
  if (tr === 'slide') { const x = (1 - E.io(u)) * W; g.drawImage(src, x, 0); g.fillStyle = INK; g.fillRect(x - 12, 0, 12, H); }
  else if (tr === 'cut') { if (u >= .5) g.drawImage(src, 0, 0); }
  else { g.globalAlpha = E.sine(u); g.drawImage(src, 0, 0); }
  g.restore();
}

/* ---------- 开头大标题与章节条 ---------- */
function drawHookTitle(g, t) {
  const a = win(t, 0, T.wild + .05, 0, .3); if (!a) return;
  g.save(); g.globalAlpha = a;
  const k = 1 + .025 * Math.sin(t * 5);
  tag(g, 540, 138, '进化错配 · 2 分钟看懂', 34, { fill: YEL, shadow: false, lw: 5 });
  g.translate(540, 255); g.scale(k, k);
  rich(g, '原始人穿越进{奶茶店}', 0, 0, 112, { font: 'fun', col: '#FFFFFF', hl: '#FFB3C9', stroke: 22, maxW: 1010 });
  g.restore();
}
const CHAPTERS = [[T.wild, '穿越'], [T.past, '远古的甜'], [T.rule, '大脑的铁律'], [T.combo, '奶茶是颗假蛋'], [T.you, '原始人就是你'], [T.fix, '怎么办'], [T.end, '收到通知']];
function drawHeader(g, t) {
  const a = win(t, T.wild + .15, T.card, .35, .3); if (!a) return;
  let ci = 0; CHAPTERS.forEach(([s], i) => { if (t >= s) ci = i; });
  const [cs, name] = CHAPTERS[ci];
  g.save(); g.globalAlpha = a;
  const t1 = '原始人穿越奶茶店', t2 = `${'①②③④⑤⑥⑦'[ci]} ${name}`;
  g.font = F(44, 'fun'); const w1 = g.measureText(t1).width; g.font = F(42, 'black'); const w2 = g.measureText(t2).width;
  const w = w1 + w2 + 90, x0 = 540 - w / 2;
  rr(g, x0, 112, w, 76, 38); g.fillStyle = 'rgba(30,22,40,.72)'; g.fill();
  g.fillStyle = '#FFFFFF'; g.font = F(44, 'fun'); g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(t1, x0 + 34, 152);
  const p = pop(t, cs + .1, .35), cx = x0 + 34 + w1 + 22 + w2 / 2;
  g.save(); g.translate(cx, 151); g.scale(p, p); g.fillStyle = YEL; g.font = F(42, 'black'); g.textAlign = 'center'; g.fillText(t2, 0, 0); g.restore();
  g.restore();
}
/* 倒带：回到一万年前 */
function rewind(g, t) {
  const a = win(t, T.wild - .2, T.wild + .5, .08, .25); if (!a) return;
  g.save(); g.globalAlpha = a;
  g.fillStyle = 'rgba(40,20,60,.35)'; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(0,0,0,.2)'; for (let y = 0; y < H; y += 7) g.fillRect(0, y, W, 2);
  const k = Math.floor(t * 30); for (let i = 0; i < 6; i++) { const y = hash(i, k) * H; g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(0, y, W, 6 + hash(i, k + 1) * 22); }
  g.translate(540, 900);
  g.fillStyle = '#FFFFFF'; g.strokeStyle = '#1D1822'; g.lineWidth = 10; g.lineJoin = 'round';
  for (const dx of [-330, -270]) { poly(g, [[dx + 60, -44], [dx, 0], [dx + 60, 44]]); g.stroke(); g.fill(); }
  rich(g, '倒回一万年前', 70, 0, 100, { font: 'fun', stroke: 20 });
  g.restore();
}
function flash(g, t, t0, d = .25) { if (t < t0 || t > t0 + d) return; g.fillStyle = `rgba(255,255,255,${1 - (t - t0) / d})`; g.fillRect(0, 0, W, H); }

function frame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
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
  flash(ctx, t, T.bolt, .3);
  flash(ctx, t, T.shop - .1, .35);
  rewind(ctx, t);
  drawHookTitle(ctx, t);
  drawHeader(ctx, t);
  drawSubs(ctx, t);
  if (t > DURATION - .5) { ctx.fillStyle = `rgba(0,0,0,${seg(t, DURATION - .5, DURATION)})`; ctx.fillRect(0, 0, W, H); }
  const r = R(Math.floor(t * 30) + 1);
  ctx.globalAlpha = .035; ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(grainCv, -r() * 60, -r() * 60, W + 120, H + 120);
  ctx.restore();
}
window.frame = frame;
window.DURATION = DURATION;
window.READY = false;
Promise.all(['NotoBlack', 'NotoBold', 'Smiley'].map(f => document.fonts.load(`60px ${f}`, '测试'))).then(() => { window.READY = true; });
