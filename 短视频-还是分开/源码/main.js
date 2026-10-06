'use strict';
/* main.js：镜头表、转场、整屏震动、副歌重拍推镜、HUD、暗角和颗粒、逐帧入口 frame(T)。 */

const SHOTS = [
  // [开始, 结束（歌曲时间）, 画面, HUD 明暗, 拍灯颜色]
  [-PRE, 3.40, sCig, 'dark', C.clawd],
  [3.40, 6.95, sMeteor, 'dark', '#8FB0FF'],
  [6.95, 10.15, sGrab, 'light', C.red],
  [10.15, 15.55, sEdit, 'dark', C.green],
  [15.55, 17.40, sShout, 'light', C.red],
  [17.40, 18.30, sNoLook, 'dark', C.you],
  [18.30, 20.85, sGhost, 'light', C.clawd],
  [20.85, 22.70, sMemory, 'dark', C.you],
  [22.70, 24.45, sRush, 'dark', C.yel],
  [24.45, 30.40, sFilm, 'dark', '#BFC3CA'],
  [30.40, 34.35, sBlank, 'light', '#B5B2AA'],
  [34.35, 35.98, sRPS, 'dark', C.yel],
  [35.98, 37.95, sThinkSplit, 'dark', C.clawd],
  [37.95, 41.55, sTest, 'light', C.green],
  [41.55, 45.05, sReview, 'light', C.red],
  [45.05, 46.92, sHistory, 'dark', C.you],
  [46.92, 48.72, sDrag, 'light', C.clawd],
  [48.72, 50.30, sFight, 'dark', C.yel],
  [50.30, 52.35, sGit, 'dark', C.red],
  [52.35, 55.88, sEye, 'dark', C.you],
  [55.88, 59.48, sChase, 'light', C.clawd],
  [59.48, 62.65, sCarDoor, 'dark', C.yel],
  [62.65, 65.20, sSlam, 'dark', C.red],
  [65.20, END_S + 1, sEnd, 'dark', '#666'],
];
const shotAt = s => SHOTS.find(([a, b]) => s >= a && s < b) || SHOTS[SHOTS.length - 1];
const shotIdx = fn => SHOTS.findIndex(x => x[2] === fn);

/* 整屏震动：[时刻, 幅度, 时长] */
const SHAKES = [[T_OUT, 16, .4], [ct(2, 4), 10, .3], [ct(6, 4), 14, .35], [ct(6, 7), 18, .4], [ct(14, 4), 12, .3], [ct(14, 6), 10, .3],
  [ct(15, 0), 8, .25], [ct(11, 8), 10, .3], [ct(10, 4), 6, .2], [ct(13, 3), 10, .3], [ct(21, 6), 10, .3]];
/* 切换处闪一下：[时刻, 颜色, 时长] */
const FLASH = [[6.95, '#FFFFFF', .12], [34.35, '#FFFFFF', .16], [37.95, '#FFFFFF', .1], [41.55, '#FFFFFF', .1], [45.05, '#FFFFFF', .08], [48.72, '#FFE27A', .12], [50.30, '#FFFFFF', .1], [52.35, '#FFFFFF', .12], [59.48, '#FFFFFF', .12]];

const bufA = mk(), bufB = mk(), gA = bufA.getContext('2d'), gB = bufB.getContext('2d');
function renderTo(gx, fn, s) {
  gx.setTransform(1, 0, 0, 1, 0, 0); gx.globalAlpha = 1; gx.globalCompositeOperation = 'source-over'; gx.filter = 'none';
  gx.clearRect(0, 0, W, H); gx.save(); fn(gx, s); gx.restore();
}
/* 转场 */
const TRANS = [
  // 往上摇：烟往天上飘，镜头跟上去就是星空
  { a: 3.22, b: 3.52, from: sCig, to: sMeteor, draw(g, s, u) { const e = E.io(u); renderTo(gA, this.from, s); renderTo(gB, this.to, s); g.drawImage(bufA, 0, e * H); g.drawImage(bufB, 0, -H + e * H); } },
  // 甩镜头
  { a: 22.6, b: 22.78, from: sMemory, to: sRush, draw: whip },
  { a: 55.78, b: 55.96, from: sEye, to: sChase, draw: whip },
  // 空白的纸从中间撕开，后面就是副歌
  { a: 33.43, b: 34.35, from: sBlank, to: sRPS, draw(g, s, u) {
    renderTo(gA, this.from, s); renderTo(gB, this.to, s);
    const crack = seg(s, 33.43, 33.75), open = E.in(seg(s, 33.8, 34.35));
    g.drawImage(bufB, 0, 0);
    const d = open * (W / 2 + 40);
    tornHalf(g, bufA, -d, true, crack); tornHalf(g, bufA, d, false, crack);
  } },
];
function whip(g, s, u) {
  const e = E.io(u);
  renderTo(gA, this.from, s); renderTo(gB, this.to, s);
  const sp = Math.sin(u * Math.PI), n = 7;
  for (let k = 0; k < n; k++) {
    const d = (k / (n - 1) - .5) * sp * 280;
    g.globalAlpha = 1 / (k + 1);
    g.drawImage(bufA, -e * W + d, 0); g.drawImage(bufB, W - e * W + d, 0);
  }
  g.globalAlpha = 1;
}
/* 撕开的半张纸：锯齿形的裂口 */
function crackX(y) { return W / 2 + (hash(Math.floor(y / 36), 77) - .5) * 70 + Math.sin(y / 90) * 18; }
function tornHalf(g, img, dx, left, crack) {
  g.save(); g.translate(dx, 0);
  g.beginPath();
  if (left) { g.moveTo(0, 0); for (let y = 0; y <= H; y += 36) g.lineTo(crackX(y), y); g.lineTo(0, H); }
  else { g.moveTo(W, 0); for (let y = 0; y <= H; y += 36) g.lineTo(crackX(y), y); g.lineTo(W, H); }
  g.closePath(); g.save(); g.clip(); g.drawImage(img, 0, 0); g.restore();
  // 裂口的阴影和白边
  if (crack > 0) {
    g.beginPath(); for (let y = 0; y <= H * crack; y += 36) y ? g.lineTo(crackX(y), y) : g.moveTo(crackX(y), y);
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 5; g.stroke();
  }
  g.restore();
}

function frame(T) {
  const s = T - PRE;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const shot = shotAt(s);
  const tr = TRANS.find(x => s >= x.a && s < x.b);
  const [sx, sy] = shakes(s, SHAKES);
  // 副歌：每小节强拍镜头轻轻推一下
  const chorus = s > 34.35 && s < 62.65 ? 1 : 0;
  const push = 1 + .014 * chorus * barPulse(s, 6);
  ctx.save();
  ctx.translate(W / 2 + sx, H / 2 + sy); ctx.scale(push, push); ctx.translate(-W / 2, -H / 2);
  if (tr) tr.draw.call(tr, ctx, s, seg(s, tr.a, tr.b));
  else shot[2](ctx, s);
  ctx.restore();
  // 闪白
  for (const [t0, col, d] of FLASH) { const v = (s - t0) / d; if (v >= 0 && v < 1) { ctx.globalAlpha = (1 - v) * .75; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; } }
  ctx.save();
  ctx.drawImage(vignCv, 0, 0);
  ctx.globalAlpha = .045; ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(grainCv, 0, 0, W, H);
  ctx.restore();
  if (!window.NOHUD) hud(ctx, s, shot[3], shot[4]);
}
window.frame = frame;
window.DURATION = DURATION;
window.READY = false;
Promise.all(['NotoBlack', 'NotoBold', 'NotoMed', 'JBM', 'JBMR', 'JBMX'].map(f => document.fonts.load(`60px "${f}"`, '测试Ab'))).then(() => {
  // 先把所有歌词字在每种字重下量一遍，避免第一次出现时字体还没准备好
  const all = LYR.map(l => l.s).join('') + '还是分开张叶蕾甜菜会话已结束想继续这段对话那我再等一下下';
  for (const k of ['black', 'bold', 'med', 'mono', 'monoR']) { ctx.font = F(40, k); ctx.measureText(all); }
  window.READY = true;
});
