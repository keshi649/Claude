'use strict';
/* main.js：镜头编排、甩镜头转场、HUD、颗粒与暗角、逐帧入口 */

const SHOTS = [
  // [开始, 结束, 画面, HUD 明暗, 拍灯颜色]
  [0, T.taipei, sceneIntro, 'dark', C.yel],
  [T.taipei, T.whip1, sceneTaipei, 'dark', '#FFD36B'],
  [T.whip1, T.shanghai, (g, t) => whip(g, t, sceneTaipei, sceneShanghai, T.whip1, T.shanghai), 'dark', '#FF5FA2'],
  [T.shanghai, T.zoomOut, sceneShanghai, 'dark', '#FF5FA2'],
  [T.zoomOut, T.mirror, sceneSplit, 'dark', C.yel],
  [T.mirror, T.berlin, sceneMirror, 'light', C.blue],
  [T.berlin, T.whip2, sceneBerlin, 'dark', C.cyan],
  [T.whip2, T.mongol, (g, t) => whip(g, t, sceneBerlin, sceneMongolia, T.whip2, T.mongol), 'dark', '#FFB36B'],
  [T.mongol, DURATION + 1, sceneMongolia, 'dark', '#FFB36B'],
];

const bufA = mk(), bufB = mk(), gA = bufA.getContext('2d'), gB = bufB.getContext('2d');
function renderTo(gx, fn, t) {
  gx.setTransform(1, 0, 0, 1, 0, 0); gx.globalAlpha = 1; gx.globalCompositeOperation = 'source-over'; gx.filter = 'none';
  gx.clearRect(0, 0, W, H); gx.save(); fn(gx, t); gx.restore();
}
/* 甩镜头：A 往左甩出去，B 从右边甩进来，中间带运动模糊 */
function whip(g, t, fa, fb, t0, t1) {
  const u = seg(t, t0, t1), e = E.io(u);
  renderTo(gA, fa, t); renderTo(gB, fb, t);
  const speed = Math.sin(u * Math.PI);          // 中段最快
  const n = 7, spread = speed * 260;
  for (let k = 0; k < n; k++) {
    const d = (k / (n - 1) - .5) * spread;
    g.globalAlpha = 1 / (k + 1);
    g.drawImage(bufA, -e * W + d, 0);
    g.drawImage(bufB, W - e * W + d, 0);
  }
  g.globalAlpha = 1;
}

function frame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const shot = SHOTS.find(([a, b]) => t >= a && t < b) || SHOTS[SHOTS.length - 1];
  ctx.save(); shot[2](ctx, t); ctx.restore();
  ctx.save();
  ctx.globalAlpha = 1; ctx.drawImage(vignCv, 0, 0);
  hud(ctx, t, shot[3], shot[4]);
  const r = R(Math.floor(t * 30) + 1);
  ctx.globalAlpha = .05; ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(grainCv, -r() * 60, -r() * 60, W + 120, H + 120);
  ctx.restore();
}
window.frame = frame;
window.DURATION = DURATION;
window.READY = false;
Promise.all(['NotoBlack', 'NotoBold', 'NotoMed', 'JBM', 'JBMR', 'JBMX', 'Pacifico'].map(f => document.fonts.load(`60px "${f}"`, f === 'Pacifico' ? 'Mojito' : '测试Ab'))).then(() => {
  buildLand(); rainGlyph();
  ['烟', '火'].forEach(c => glyphPoints(c, 270, 9));
  window.READY = true;
});
