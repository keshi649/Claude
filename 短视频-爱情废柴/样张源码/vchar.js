'use strict';
/* vchar.js —— 同一对人物的矢量画法（纸雕、漫画两个方向用）。比例和像素版一样：H/28 为一个单位。
   o.paper：每一块都是一片纸，带投影；o.ink：漫画的墨线粗细。
   eyes 'n' 'shut' 'happy' 'wide' 'up' 'dn' 'sad'；mouth 'flat' 'o' 'smile' 'frown' 'shout'；arms 'down' 'up' 'upR' 'mic'；
   wind 围巾飘；step 走路；tear 眼泪；girl / hat / pom / mitt 同像素版 */
function vguy(c, cx, fy, H, o = {}) {
  const u = H / 28, ink = o.ink || 0, IC = o.inkCol || '#1A1420';
  const skin = o.skin || '#F9DABF', hair = o.hair || '#3B2A38', coat = o.coat || '#E3A23C', pants = o.pants || '#2E3A5E', boots = o.boots || '#4A2A1E', scarf = o.scarf || '#D8323C', mitt = o.mitt || skin;
  const part = (draw, fill, opt = {}) => {
    c.save(); if (o.paper && !opt.flat) { c.shadowColor = 'rgba(20,8,30,.38)'; c.shadowBlur = u * 1.1; c.shadowOffsetX = u * .45; c.shadowOffsetY = u * .55; }
    c.beginPath(); draw(); c.fillStyle = fill; c.fill(opt.rule || 'nonzero'); c.restore();
    if (ink && !opt.noink) { c.beginPath(); draw(); c.lineWidth = opt.ink || ink; c.strokeStyle = IC; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
  };
  const limb = (x0, y0, x1, y1, w, col, hx) => {
    if (ink) { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.lineWidth = w + ink * 2; c.strokeStyle = IC; c.lineCap = 'round'; c.stroke(); }
    c.save(); if (o.paper) { c.shadowColor = 'rgba(20,8,30,.38)'; c.shadowBlur = u * 1.1; c.shadowOffsetX = u * .45; c.shadowOffsetY = u * .55; }
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.lineWidth = w; c.strokeStyle = col; c.lineCap = 'round'; c.stroke(); c.restore();
    if (hx) part(() => c.arc(x1, y1, w * .56, 0, 7), hx);
  };
  const ty = fy - 15.4 * u, hcy = ty - 7.4 * u, a = o.arms || 'down';
  // 女生的后发
  if (o.girl) part(() => c.roundRect(cx - 9.8 * u, hcy - 3 * u, 19.6 * u, 14.5 * u, [6 * u, 6 * u, 3.5 * u, 3.5 * u]), hair);
  // 腿、靴子
  const s1 = o.step === 1 ? u : 0, s2 = o.step === 2 ? u : 0;
  part(() => { c.roundRect(cx - 5 * u, fy - 6.4 * u, 4 * u, 5 * u - s1, .5 * u); c.roundRect(cx + u, fy - 6.4 * u, 4 * u, 5 * u - s2, .5 * u); }, pants);
  part(() => { c.roundRect(cx - 5.8 * u, fy - 2.4 * u - s1, 5.2 * u, 2.4 * u, [1.2 * u, .8 * u, .3 * u, .3 * u]); c.roundRect(cx + .6 * u, fy - 2.4 * u - s2, 5.2 * u, 2.4 * u, [.8 * u, 1.2 * u, .3 * u, .3 * u]); }, boots);
  // 左胳膊（在大衣后面）
  const LH = a === 'up' ? [cx - 11 * u, ty - 6 * u] : [cx - 8.6 * u, ty + 8.4 * u];
  limb(cx - 6 * u, ty + 2 * u, LH[0], LH[1], 3.3 * u, coat, mitt);
  let RH = (a === 'up' || a === 'upR') ? [cx + 11 * u, ty - 6 * u] : [cx + 8.6 * u, ty + 8.4 * u];
  if (a !== 'mic') limb(cx + 6 * u, ty + 2 * u, RH[0], RH[1], 3.3 * u, coat, mitt);
  // 大衣
  part(() => { c.moveTo(cx - 5.6 * u, ty); c.lineTo(cx + 5.6 * u, ty); c.quadraticCurveTo(cx + 7 * u, ty + .4 * u, cx + 7.9 * u, ty + 9.6 * u); c.quadraticCurveTo(cx + 8 * u, ty + 10.6 * u, cx + 7 * u, ty + 10.6 * u); c.lineTo(cx - 7 * u, ty + 10.6 * u); c.quadraticCurveTo(cx - 8 * u, ty + 10.6 * u, cx - 7.9 * u, ty + 9.6 * u); c.quadraticCurveTo(cx - 7 * u, ty + .4 * u, cx - 5.6 * u, ty); c.closePath(); }, coat);
  c.save(); c.strokeStyle = ink ? IC : 'rgba(60,30,10,.45)'; c.lineWidth = ink ? ink * .7 : u * .35; c.lineCap = 'round';
  c.beginPath(); c.moveTo(cx, ty + 2.6 * u); c.lineTo(cx, ty + 10.4 * u); c.moveTo(cx - 5.6 * u, ty + 6.6 * u); c.lineTo(cx - 2.6 * u, ty + 6.6 * u); c.moveTo(cx + 2.6 * u, ty + 6.6 * u); c.lineTo(cx + 5.6 * u, ty + 6.6 * u); c.stroke();
  c.fillStyle = ink ? IC : 'rgba(60,30,10,.6)';[4.6, 7.4].forEach(k => { c.beginPath(); c.arc(cx + 1.3 * u, ty + k * u, .5 * u, 0, 7); c.fill(); }); c.restore();
  // 围巾
  if (o.wind) part(() => { c.moveTo(cx + 5 * u, ty - 1.6 * u); c.bezierCurveTo(cx + 9 * u, ty - 4 * u, cx + 12 * u, ty + 1 * u, cx + 17 * u, ty - 3.4 * u); c.lineTo(cx + 17.6 * u, ty - .2 * u); c.bezierCurveTo(cx + 13 * u, ty + 4 * u, cx + 10 * u, ty - .6 * u, cx + 5 * u, ty + 1.6 * u); c.closePath(); }, scarf);
  else part(() => c.roundRect(cx + 1.8 * u, ty - .2 * u, 3.4 * u, 7.4 * u, [0, 0, .8 * u, .8 * u]), scarf);
  part(() => c.roundRect(cx - 7.3 * u, ty - 2.4 * u, 14.6 * u, 3.8 * u, 1.9 * u), scarf);
  // 头
  part(() => c.ellipse(cx, hcy, 8.5 * u, 7.9 * u, 0, 0, 7), skin);
  // 头发
  const fr = [[8.9, 2.2], [8.2, -1.2], [6.2, -3.4], [5, -1], [3.2, -3.6], [1.6, -1.4], [-.4, -3.8], [-2.4, -1.2], [-4.4, -3.6], [-6, -1.4], [-7.6, -3.2], [-8.4, -1], [-8.9, 2.2]];
  part(() => { c.moveTo(cx + fr[0][0] * u, hcy + fr[0][1] * u); fr.slice(1).forEach(([x, y], i) => { const p = fr[i]; c.quadraticCurveTo(cx + (p[0] + x) / 2 * u + (i % 2 ? .5 : -.3) * u, hcy + (i % 2 ? Math.max(p[1], y) + .7 : Math.min(p[1], y) - .1) * u, cx + x * u, hcy + y * u); }); c.bezierCurveTo(cx - 10.6 * u, hcy - 6 * u, cx - 6.6 * u, hcy - 9.6 * u, cx, hcy - 9.4 * u); c.bezierCurveTo(cx + 6.6 * u, hcy - 9.6 * u, cx + 10.6 * u, hcy - 6 * u, cx + 8.9 * u, hcy + 2.2 * u); c.closePath(); }, hair);
  c.save(); c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = u * .9; c.lineCap = 'round'; c.beginPath(); c.ellipse(cx, hcy - .6 * u, 7 * u, 7 * u, 0, Math.PI * 1.12, Math.PI * 1.4); c.stroke(); c.restore();
  if (o.ahoge && !o.hat) part(() => { c.moveTo(cx - .2 * u, hcy - 9 * u); c.quadraticCurveTo(cx + .4 * u, hcy - 13 * u, cx + 3.4 * u, hcy - 12.4 * u); c.quadraticCurveTo(cx + 1.6 * u, hcy - 11.6 * u, cx + 1.8 * u, hcy - 9 * u); c.closePath(); }, hair);
  if (o.hat) {
    part(() => { c.moveTo(cx - 9.6 * u, hcy - 4 * u); c.bezierCurveTo(cx - 9.6 * u, hcy - 13 * u, cx + 9.6 * u, hcy - 13 * u, cx + 9.6 * u, hcy - 4 * u); c.closePath(); }, o.hat);
    c.save(); c.strokeStyle = 'rgba(40,40,90,.16)'; c.lineWidth = u * .5; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(cx + i * 2.6 * u, hcy - 4.6 * u); c.quadraticCurveTo(cx + i * 2.2 * u, hcy - 8 * u, cx + i * 1.2 * u, hcy - 10.4 * u); c.stroke(); } c.restore();
    part(() => c.roundRect(cx - 10.2 * u, hcy - 6 * u, 20.4 * u, 3.4 * u, 1.7 * u), o.brim || o.hat);
    part(() => c.arc(cx, hcy - 11.6 * u, 2.5 * u, 0, 7), o.pom || o.hat);
  }
  // 脸
  const em = o.eyes || 'n', ey0 = hcy + 1.5 * u + (em === 'up' ? -.7 * u : em === 'dn' ? .7 * u : 0), EC = '#231620';
  [-1, 1].forEach(sd => {
    const ex = cx + sd * 3.9 * u; c.save(); c.lineCap = 'round'; c.strokeStyle = EC; c.fillStyle = EC; c.lineWidth = Math.max(ink * .8, u * .55);
    if (em === 'shut') { c.beginPath(); c.arc(ex, ey0 - .6 * u, 1.5 * u, .15 * Math.PI, .85 * Math.PI); c.stroke(); }
    else if (em === 'happy') { c.beginPath(); c.arc(ex, ey0 + 1 * u, 1.5 * u, 1.15 * Math.PI, 1.85 * Math.PI); c.stroke(); }
    else {
      if (em === 'wide') { c.beginPath(); c.ellipse(ex, ey0, 2.1 * u, 2.5 * u, 0, 0, 7); c.fillStyle = '#FFFFFF'; c.fill(); if (ink) { c.lineWidth = ink * .7; c.stroke(); } c.fillStyle = EC; c.beginPath(); c.ellipse(ex, ey0, .9 * u, 1.2 * u, 0, 0, 7); c.fill(); }
      else { c.beginPath(); c.ellipse(ex, ey0, 1.2 * u, 1.75 * u, 0, 0, 7); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(ex - .35 * u, ey0 - .7 * u, .5 * u, 0, 7); c.fill(); c.beginPath(); c.arc(ex + .4 * u, ey0 + .8 * u, .24 * u, 0, 7); c.fill(); if (o.girl) { c.beginPath(); c.arc(ex, ey0, 2 * u, 1.2 * Math.PI, 1.8 * Math.PI); c.lineWidth = u * .4; c.stroke(); } }
    }
    if (em === 'sad') { c.strokeStyle = hair; c.lineWidth = u * .6; c.beginPath(); c.moveTo(ex - sd * 1.8 * u, ey0 - 3.6 * u); c.lineTo(ex + sd * 1.4 * u, ey0 - 2.7 * u); c.stroke(); }
    c.restore();
    if (o.tear) { c.save(); c.fillStyle = '#8FDCFF'; c.strokeStyle = IC; c.lineWidth = ink * .6; c.beginPath(); c.moveTo(ex + sd * .6 * u, ey0 + 1.6 * u); c.quadraticCurveTo(ex + sd * 2.4 * u, ey0 + 4.6 * u, ex + sd * .8 * u, ey0 + 5.4 * u * o.tear); c.quadraticCurveTo(ex - sd * .8 * u, ey0 + 4.4 * u, ex + sd * .6 * u, ey0 + 1.6 * u); c.fill(); if (ink) c.stroke(); c.restore(); }
    if (o.blush !== 0) { c.save(); c.globalAlpha = .7; c.fillStyle = '#F58C8C'; c.beginPath(); c.ellipse(cx + sd * 5.7 * u, hcy + 4 * u, 1.7 * u, 1 * u, 0, 0, 7); c.fill(); c.restore(); }
  });
  const mm = o.mouth || 'flat', my = hcy + 5 * u; c.save(); c.strokeStyle = '#7A2A34'; c.lineWidth = Math.max(ink * .7, u * .5); c.lineCap = 'round';
  if (mm === 'flat') { c.beginPath(); c.moveTo(cx - u, my); c.lineTo(cx + u, my); c.stroke(); }
  if (mm === 'smile') { c.beginPath(); c.arc(cx, my - .8 * u, 1.5 * u, .15 * Math.PI, .85 * Math.PI); c.stroke(); }
  if (mm === 'frown') { c.beginPath(); c.arc(cx, my + 1.2 * u, 1.4 * u, 1.2 * Math.PI, 1.8 * Math.PI); c.stroke(); }
  if (mm === 'o') { c.fillStyle = '#7A2A34'; c.beginPath(); c.ellipse(cx, my, 1.1 * u, 1.4 * u, 0, 0, 7); c.fill(); c.fillStyle = '#F0808A'; c.beginPath(); c.ellipse(cx, my + .7 * u, .7 * u, .5 * u, 0, 0, 7); c.fill(); }
  if (mm === 'shout') { c.fillStyle = '#7A2A34'; c.beginPath(); c.moveTo(cx - 3 * u, my - 1.4 * u); c.quadraticCurveTo(cx, my - 2.2 * u, cx + 3 * u, my - 1.4 * u); c.quadraticCurveTo(cx + 2.6 * u, my + 2.6 * u, cx, my + 2.6 * u); c.quadraticCurveTo(cx - 2.6 * u, my + 2.6 * u, cx - 3 * u, my - 1.4 * u); c.fill(); if (ink) { c.strokeStyle = IC; c.lineWidth = ink * .8; c.stroke(); } c.fillStyle = '#FFFFFF'; c.beginPath(); c.roundRect(cx - 2.2 * u, my - 1.5 * u, 4.4 * u, .9 * u, .3 * u); c.fill(); c.fillStyle = '#F0808A'; c.beginPath(); c.ellipse(cx, my + 1.7 * u, 1.5 * u, .8 * u, 0, 0, 7); c.fill(); }
  c.restore();
  // 拿麦的右手
  if (a === 'mic') { limb(cx + 6 * u, ty + 2 * u, cx + 7.4 * u, ty + 6.4 * u, 3.3 * u, coat); limb(cx + 7.4 * u, ty + 6.4 * u, cx + 3.2 * u, ty + 3.4 * u, 3.3 * u, coat); part(() => c.roundRect(cx + 2.2 * u, ty - .8 * u, 1.5 * u, 4.6 * u, .5 * u), '#2A2438'); part(() => c.arc(cx + 2.95 * u, ty - 1.5 * u, 1.6 * u, 0, 7), '#9A9AB8'); part(() => c.arc(cx + 3.1 * u, ty + 3.2 * u, 1.9 * u, 0, 7), mitt); RH = [cx + 3.1 * u, ty + 3.2 * u]; }
  return { hcy, ty, RH, LH, u };
}
