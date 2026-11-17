'use strict';
/* 方向 3：立体纸雕绘本。每一层是一片剪出来的纸，层和层之间有投影；歌词是贴在页边的一张纸条。 */
const VW = 1920, VH = 1080;
function vmk() { const c = document.createElement('canvas'); c.width = VW; c.height = VH; return c.getContext('2d'); }
/* 一层纸：画到离屏，再带投影贴上去 */
function player(main, draw, o = {}) {
  const c = vmk(); draw(c);
  main.save(); main.shadowColor = `rgba(12,6,30,${o.a ?? .5})`; main.shadowBlur = o.blur ?? 26; main.shadowOffsetX = o.dx ?? 10; main.shadowOffsetY = o.dy ?? 16; if (o.f) main.filter = o.f; main.drawImage(c.canvas, 0, 0); main.restore();
}
let _tex = null;
function paperTex(main, a = .16) {
  if (!_tex) { _tex = document.createElement('canvas'); _tex.width = 480; _tex.height = 270; const t = _tex.getContext('2d'), d = t.createImageData(480, 270), r = rng(99); for (let i = 0; i < d.data.length; i += 4) { const v = 110 + r() * 145; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } t.putImageData(d, 0, 0); }
  main.save(); main.globalCompositeOperation = 'overlay'; main.globalAlpha = a; main.imageSmoothingEnabled = true; main.drawImage(_tex, 0, 0, VW, VH); main.globalAlpha = a * .7; main.drawImage(_tex, -300, -200, VW * 2.3, VH * 2.3); main.restore();
}
function glowAt(main, x, y, r, col, a = .8) { main.save(); main.globalCompositeOperation = 'screen'; const g = main.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); main.globalAlpha = a; main.fillStyle = g; main.fillRect(x - r, y - r, 2 * r, 2 * r); main.restore(); }
function hillPath(c, x0, x1, base, top, amp, seed, bottom) { const r = rng(seed), p1 = r() * 6, p2 = r() * 6; c.beginPath(); c.moveTo(x0, bottom); for (let x = x0; x <= x1; x += 8) c.lineTo(x, top + amp * Math.sin(x / 210 + p1) + amp * .45 * Math.sin(x / 83 + p2)); c.lineTo(x1, bottom); c.closePath(); }
function ppine(c, x, base, h, col = '#2E6E5A') { c.fillStyle = '#6A4630'; c.fillRect(x - h * .04, base - h * .16, h * .08, h * .16); for (let i = 0; i < 3; i++) { const y0 = base - h * .12 - i * h * .26, w = h * (.36 - i * .08); c.fillStyle = i % 2 ? col : '#3A8068'; c.beginPath(); c.moveTo(x - w, y0); c.lineTo(x, y0 - h * .38); c.lineTo(x + w, y0); c.closePath(); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(x - w * .5, y0 - h * .19); c.lineTo(x, y0 - h * .38); c.lineTo(x + w * .5, y0 - h * .19); c.quadraticCurveTo(x + w * .2, y0 - h * .14, x, y0 - h * .2); c.quadraticCurveTo(x - w * .25, y0 - h * .13, x - w * .5, y0 - h * .19); c.fill(); } }
function phouse(c, x, base, w, h, col, roof, o = {}) {
  c.fillStyle = col; c.fillRect(x, base - h, w, h); const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(0,0,30,.16)'); c.fillStyle = g; c.fillRect(x, base - h, w, h);
  const rh = o.rh || h * .34; c.fillStyle = roof; c.beginPath(); c.moveTo(x - w * .08, base - h); c.lineTo(x + w * (o.peak ?? .5), base - h - rh); c.lineTo(x + w * 1.08, base - h); c.closePath(); c.fill();
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(x - w * .1, base - h + 4); c.lineTo(x + w * (o.peak ?? .5), base - h - rh - 8); c.lineTo(x + w * 1.1, base - h + 4); c.lineTo(x + w * .96, base - h - rh * .1); c.quadraticCurveTo(x + w * .8, base - h - rh * .2, x + w * (o.peak ?? .5), base - h - rh * .72); c.quadraticCurveTo(x + w * .2, base - h - rh * .2, x + w * .04, base - h - rh * .1); c.closePath(); c.fill();
  if (o.chim) { c.fillStyle = roof; c.fillRect(x + w * .7, base - h - rh * .9, w * .1, rh * .6); c.fillStyle = '#FFFFFF'; c.fillRect(x + w * .68, base - h - rh * .96, w * .14, rh * .12); }
  const wins = o.wins || []; wins.forEach(([wx, wy, ww, wh, lit]) => { c.fillStyle = lit === 0 ? '#2A3466' : '#FFD98A'; c.beginPath(); c.roundRect(x + wx * w, base - h + wy * h, ww * w, wh * h, [ww * w * .5, ww * w * .5, 2, 2]); c.fill(); c.strokeStyle = 'rgba(60,30,40,.55)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + (wx + ww / 2) * w, base - h + wy * h); c.lineTo(x + (wx + ww / 2) * w, base - h + (wy + wh) * h); c.moveTo(x + wx * w, base - h + (wy + wh * .55) * h); c.lineTo(x + (wx + ww) * w, base - h + (wy + wh * .55) * h); c.stroke(); });
  if (o.door) { c.fillStyle = o.door; c.beginPath(); c.roundRect(x + w * .4, base - h * .36, w * .2, h * .36, [w * .1, w * .1, 0, 0]); c.fill(); c.fillStyle = '#2E7D4F'; c.beginPath(); c.arc(x + w * .5, base - h * .24, w * .05, 0, 7); c.fill(); c.fillStyle = '#E0423A'; c.beginPath(); c.arc(x + w * .5, base - h * .2, w * .018, 0, 7); c.fill(); }
  if (o.sign) { c.fillStyle = '#FFF6E4'; c.beginPath(); c.roundRect(x + w * .14, base - h * .56, w * .72, h * .15, 6); c.fill(); c.fillStyle = '#5A2A30'; c.font = `${Math.round(h * .12)}px "Ma Shan Zheng"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(o.sign, x + w * .5, base - h * .48); }
}
function pflake(c, x, y, r, col = '#FFFFFF') { c.save(); c.translate(x, y); c.strokeStyle = col; c.lineWidth = Math.max(2, r * .16); c.lineCap = 'round'; for (let i = 0; i < 6; i++) { c.rotate(Math.PI / 3); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -r); c.moveTo(0, -r * .55); c.lineTo(r * .28, -r * .82); c.moveTo(0, -r * .55); c.lineTo(-r * .28, -r * .82); c.stroke(); } c.restore(); }
function pstar(c, x, y, r, col = '#FFE9A0') { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); }
function hang(main, items, o = {}) { player(main, c => { items.forEach(([x, y, r, kind]) => { c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, -10); c.lineTo(x, y - r); c.stroke(); if (kind === 's') pstar(c, x, y, r); else pflake(c, x, y, r); }); }, o); }
function strip(main, text, y = 962, o = {}) {
  main.font = `60px "Ma Shan Zheng"`; const w = main.measureText(text).width + 110, x = (VW - w) / 2;
  player(main, c => { c.translate(VW / 2, y + 44); c.rotate(-.012); c.translate(-VW / 2, -y - 44); c.fillStyle = '#FFF7E6'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w - 18, y + 44); c.lineTo(x + w, y + 88); c.lineTo(x, y + 88); c.lineTo(x + 18, y + 44); c.closePath(); c.fill(); c.strokeStyle = 'rgba(160,60,60,.5)'; c.lineWidth = 2; c.setLineDash([10, 8]); c.strokeRect(x + 30, y + 9, w - 60, 70); c.setLineDash([]); c.fillStyle = '#3A2030'; c.font = `60px "Ma Shan Zheng"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, VW / 2, y + 47); }, { blur: 14, dx: 5, dy: 8, a: .5 });
}
function vmark(main, col = '#FFF7E6') { main.save(); main.font = '46px "Ma Shan Zheng"'; main.textAlign = 'right'; main.fillStyle = 'rgba(0,0,0,.35)'; main.fillText('甜菜', 1876, 74); main.fillStyle = col; main.fillText('甜菜', 1874, 72); main.restore(); }
function vfinish(main, vig = .55) { paperTex(main); const v = main.createRadialGradient(VW / 2, VH / 2, VH * .5, VW / 2, VH / 2, VH * 1.08); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(8,4,18,${vig})`); main.fillStyle = v; main.fillRect(0, 0, VW, VH); }

/* 3a：一本摊开的立体书，小镇从书页上立起来 */
FRAMES['3a'] = async (main) => {
  // 桌面
  const tg = main.createLinearGradient(0, 0, 0, VH); tg.addColorStop(0, '#3A2218'); tg.addColorStop(1, '#22130E'); main.fillStyle = tg; main.fillRect(0, 0, VW, VH);
  const r = rng(3); main.strokeStyle = 'rgba(0,0,0,.18)'; main.lineWidth = 2; for (let i = 0; i < 60; i++) { const y = r() * VH, x = r() * VW; main.beginPath(); main.moveTo(x, y); main.bezierCurveTo(x + 200, y + r() * 10 - 5, x + 400, y + r() * 10 - 5, x + 600 + r() * 300, y + r() * 8); main.stroke(); }
  for (let i = 0; i < 9; i++) glowAt(main, 80 + r() * 1760, 20 + r() * 60, 60 + r() * 50, ['#FFB45A', '#FF7A5A', '#FFE29A', '#8AD8FF'][i % 4], .5);
  // 书的封皮、书页
  player(main, c => { c.fillStyle = '#7A1E2A'; c.beginPath(); c.roundRect(236, 62, 1448, 590, 10); c.fill(); c.beginPath(); c.moveTo(236, 646); c.lineTo(1684, 646); c.lineTo(1862, 1040); c.lineTo(58, 1040); c.closePath(); c.fill(); c.fillStyle = '#F2E6CC'; for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#F2E6CC' : '#D8C8A8'; c.beginPath(); c.moveTo(96 - i * 2, 1010 + i * 4); c.lineTo(1824 + i * 2, 1010 + i * 4); c.lineTo(1826 + i * 2, 1014 + i * 4); c.lineTo(94 - i * 2, 1014 + i * 4); c.fill(); } }, { blur: 50, dx: 20, dy: 34, a: .7 });
  // 竖着的那一页：夜空
  main.save(); main.beginPath(); main.rect(262, 86, 1396, 556); main.clip();
  const sg = main.createLinearGradient(0, 86, 0, 642); sg.addColorStop(0, '#121A46'); sg.addColorStop(.6, '#2A2F70'); sg.addColorStop(1, '#5A4688'); main.fillStyle = sg; main.fillRect(262, 86, 1396, 556);
  for (let i = 0; i < 16; i++) { const x = 262 + r() * 1396, y = 86 + r() * 400, rr = 80 + r() * 160, g = main.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, i % 2 ? 'rgba(120,110,200,.22)' : 'rgba(20,20,70,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); main.fillStyle = g; main.fillRect(x - rr, y - rr, 2 * rr, 2 * rr); }
  for (let i = 0; i < 70; i++) { main.fillStyle = `rgba(255,255,255,${.4 + r() * .6})`; main.beginPath(); main.arc(262 + r() * 1396, 86 + r() * 420, 1 + r() * 2.4, 0, 7); main.fill(); }
  main.restore();
  player(main, c => { c.fillStyle = '#FFF2C8'; c.beginPath(); c.arc(1400, 220, 74, 0, 7); c.fill(); c.fillStyle = 'rgba(220,190,120,.5)'; [[1380, 200, 14], [1424, 240, 10], [1390, 250, 7]].forEach(([x, y, q]) => { c.beginPath(); c.arc(x, y, q, 0, 7); c.fill(); }); }, { blur: 16, dx: 6, dy: 9 });
  glowAt(main, 1400, 220, 240, 'rgba(255,230,160,.5)', .8);
  player(main, c => { [[420, 170, 20], [620, 240, 14], [880, 150, 18], [1120, 260, 13], [1560, 380, 15], [330, 330, 12]].forEach(([x, y, q]) => pstar(c, x, y, q)); }, { blur: 8, dx: 3, dy: 5 });
  // 平放的那一页：雪地
  main.save(); main.beginPath(); main.moveTo(262, 642); main.lineTo(1658, 642); main.lineTo(1818, 1008); main.lineTo(102, 1008); main.closePath(); main.clip();
  const gg = main.createLinearGradient(0, 642, 0, 1008); gg.addColorStop(0, '#C4CCE8'); gg.addColorStop(1, '#F6F4EE'); main.fillStyle = gg; main.fillRect(0, 642, VW, 400);
  main.strokeStyle = 'rgba(120,130,180,.25)'; main.lineWidth = 2; for (let i = 0; i < 9; i++) { main.beginPath(); main.ellipse(960, 700 + i * 44, 300 + i * 90, 16 + i * 6, 0, 0, 7); main.stroke(); }
  main.restore(); main.fillStyle = 'rgba(30,20,60,.35)'; main.fillRect(262, 638, 1396, 5); main.fillStyle = 'rgba(255,255,255,.5)'; main.fillRect(262, 643, 1396, 2);
  // 一层层立起来的纸
  player(main, c => { c.fillStyle = '#6474B4'; hillPath(c, 262, 1658, 642, 520, 26, 5, 642); c.fill(); c.fillStyle = '#8A98D0'; hillPath(c, 262, 1658, 642, 566, 18, 8, 642); c.fill();[330, 470, 1250, 1540, 1610, 760].forEach((x, i) => ppine(c, x, 640, 70 + (i % 3) * 16, '#3A5A8A')); }, { blur: 14, dx: 6, dy: 8 });
  player(main, c => { [[300, 110, 130, '#C89A8A', '#6A3A4A'], [430, 96, 106, '#9AB8C8', '#3A4A6A'], [548, 120, 150, '#D8B890', '#7A4A3A'], [1220, 116, 140, '#B8A0C8', '#4A3A6A'], [1352, 96, 112, '#C89A8A', '#6A3A4A'], [1466, 124, 156, '#A8C0A8', '#3A5A4A']].forEach(([x, w, h, col, rf], i) => phouse(c, x, 664, w, h, col, rf, { wins: [[.2, .3, .22, .3, i % 3 ? 1 : 0], [.6, .3, .22, .3, 1]], chim: i % 2 })); c.fillStyle = '#B0A8D0'; c.fillRect(900, 430, 70, 234); c.fillStyle = '#4A3A6A'; c.beginPath(); c.moveTo(888, 430); c.lineTo(935, 330); c.lineTo(982, 430); c.fill(); c.fillStyle = '#FFF2C8'; c.beginPath(); c.arc(935, 480, 22, 0, 7); c.fill(); c.strokeStyle = '#3A2030'; c.lineWidth = 3; c.beginPath(); c.moveTo(935, 480); c.lineTo(935, 464); c.moveTo(935, 480); c.lineTo(946, 484); c.stroke(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(900, 404); c.lineTo(935, 326); c.lineTo(970, 404); c.quadraticCurveTo(935, 380, 900, 404); c.fill(); }, { blur: 18, dx: 8, dy: 10 });
  player(main, c => {
    phouse(c, 290, 760, 230, 250, '#D0705A', '#7A2E3A', { wins: [[.14, .16, .2, .2, 1], [.66, .16, .2, .2, 1]], door: '#5A2A30', sign: '面包房', chim: 1 });
    phouse(c, 546, 752, 200, 290, '#5A8EA0', '#2E3E5A', { wins: [[.14, .14, .2, .18, 1], [.66, .14, .2, .18, 0], [.14, .66, .2, .2, 1], [.66, .66, .2, .2, 1]], door: '#C8553D', sign: '玩具屋', peak: .4 });
    phouse(c, 1180, 752, 210, 270, '#E0B068', '#7A4A2A', { wins: [[.14, .16, .2, .2, 1], [.66, .16, .2, .2, 1], [.12, .68, .22, .22, 1], [.66, .68, .22, .22, 1]], door: '#2E5A4A', sign: '咖啡', chim: 1, peak: .6 });
    phouse(c, 1416, 760, 220, 240, '#B85A70', '#5A2A3A', { wins: [[.14, .16, .2, .2, 0], [.66, .16, .2, .2, 1]], door: '#F0D8C0', sign: '花店' });
  }, { blur: 26, dx: 12, dy: 16 });
  [[340, 560], [436, 560], [590, 510], [708, 660], [1224, 540], [1340, 540], [1220, 690], [1336, 690], [1576, 568], [590, 660]].forEach(([x, y]) => glowAt(main, x, y, 60, 'rgba(255,200,110,.75)', .7));
  // 圣诞树
  player(main, c => { c.fillStyle = '#6A4630'; c.fillRect(942, 760, 36, 50); for (let i = 0; i < 4; i++) { const y0 = 778 - i * 74, w = 150 - i * 30; c.fillStyle = i % 2 ? '#2E7D5A' : '#3A9068'; c.beginPath(); c.moveTo(960 - w, y0); c.lineTo(960, y0 - 130); c.lineTo(960 + w, y0); c.closePath(); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(960 - w * .46, y0 - 70); c.lineTo(960, y0 - 130); c.lineTo(960 + w * .46, y0 - 70); c.quadraticCurveTo(960 + w * .2, y0 - 56, 960, y0 - 74); c.quadraticCurveTo(960 - w * .2, y0 - 54, 960 - w * .46, y0 - 70); c.fill(); } const rr = rng(6); for (let i = 0; i < 26; i++) { const t = rr(), y = 770 - t * 300, w = (1 - t) * 120 + 10; c.fillStyle = ['#E0423A', '#FFD54A', '#5AB8FF', '#FF8AD8', '#FFFFFF'][i % 5]; c.beginPath(); c.arc(960 + (rr() * 2 - 1) * w, y, 8, 0, 7); c.fill(); } pstar(c, 960, 420, 34, '#FFD54A');[[870, '#E0423A'], [1010, '#5AB8FF'], [924, '#FFD54A']].forEach(([x, col], i) => { c.fillStyle = col; c.fillRect(x, 772 + i * 6, 44, 38 - i * 6); c.fillStyle = '#FFFFFF'; c.fillRect(x + 18, 772 + i * 6, 8, 38 - i * 6); }); }, { blur: 26, dx: 12, dy: 16 });
  glowAt(main, 960, 420, 120, 'rgba(255,220,120,.9)', .9);
  // 路灯、一对路人
  player(main, c => { [533, 1403].forEach(x => { c.fillStyle = '#1E2448'; c.fillRect(x - 5, 620, 10, 220); c.fillRect(x - 16, 832, 32, 10); c.fillStyle = '#FFE9A8'; c.beginPath(); c.roundRect(x - 18, 580, 36, 44, 8); c.fill(); c.fillStyle = '#1E2448'; c.fillRect(x - 24, 572, 48, 10); c.fillStyle = '#FFFFFF'; c.fillRect(x - 22, 564, 44, 9); }); vguy(c, 1130, 856, 150, { hair: '#7A4A2A', coat: '#F08AB0', scarf: '#FFFFFF', girl: 1, hat: '#FFFFFF', pom: '#FF5A7A', eyes: 'happy', mouth: 'smile', paper: 1 }); vguy(c, 1040, 856, 156, { hair: '#1B1420', coat: '#5AA0E8', scarf: '#FFD54A', eyes: 'happy', mouth: 'smile', paper: 1 }); c.fillStyle = '#FF5A7A'; c.beginPath(); c.moveTo(1086, 690); c.bezierCurveTo(1062, 664, 1076, 648, 1086, 664); c.bezierCurveTo(1096, 648, 1110, 664, 1086, 690); c.fill(); }, { blur: 22, dx: 10, dy: 14 });
  [533, 1403].forEach(x => glowAt(main, x, 600, 150, 'rgba(255,205,120,.85)', .85));
  // 主角：一个纸人，脚下有一片折起来的纸托
  player(main, c => { c.fillStyle = '#FFF7E6'; c.beginPath(); c.moveTo(700, 904); c.lineTo(860, 904); c.lineTo(884, 934); c.lineTo(676, 934); c.closePath(); c.fill(); c.strokeStyle = 'rgba(160,60,60,.5)'; c.setLineDash([8, 6]); c.lineWidth = 2; c.beginPath(); c.moveTo(700, 906); c.lineTo(860, 906); c.stroke(); c.setLineDash([]); vguy(c, 780, 906, 210, { ...HERO, eyes: 'up', mouth: 'flat', paper: 1 }); c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(770, 672, 40, 12, -.06, Math.PI, 0); c.fill(); }, { blur: 30, dx: 14, dy: 18 });
  // 最前面的雪堆、松树、栅栏
  player(main, c => { c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(80, 1012); c.lineTo(80, 930); c.bezierCurveTo(300, 860, 480, 960, 700, 990); c.lineTo(1240, 990); c.bezierCurveTo(1440, 960, 1640, 860, 1840, 930); c.lineTo(1840, 1012); c.closePath(); c.fill(); ppine(c, 190, 950, 250); ppine(c, 330, 972, 170); ppine(c, 1740, 950, 260); ppine(c, 1600, 974, 160); c.fillStyle = '#B88A5A'; for (let x = 380; x < 620; x += 34) { c.beginPath(); c.moveTo(x, 990); c.lineTo(x, 928); c.lineTo(x + 10, 916); c.lineTo(x + 20, 928); c.lineTo(x + 20, 990); c.fill(); } c.fillRect(372, 946, 250, 10); c.fillStyle = '#FFFFFF'; for (let x = 380; x < 620; x += 34) { c.beginPath(); c.moveTo(x, 930); c.lineTo(x + 10, 914); c.lineTo(x + 20, 930); c.fill(); } }, { blur: 30, dx: 12, dy: -6, a: .35 });
  hang(main, [[330, 150, 26], [520, 330, 20], [760, 210, 24], [1060, 120, 20], [1180, 360, 26], [1520, 190, 22], [1640, 420, 18], [240, 460, 18], [1000, 290, 14, 's']], { blur: 14, dx: 8, dy: 12, a: .4 });
  hang(main, [[130, 300, 70], [1800, 240, 84], [1010, 60, 56]], { blur: 30, dx: 10, dy: 20, a: .3, f: 'blur(7px)' });
  // 一支笔（伏笔："剧情是你在写"）
  player(main, c => { c.translate(1640, 1010); c.rotate(-.5); c.fillStyle = '#2A3466'; c.beginPath(); c.roundRect(-10, -10, 250, 22, 10); c.fill(); c.fillStyle = '#E0B85A'; c.fillRect(-14, -10, 8, 22); c.fillRect(150, -10, 6, 22); c.fillStyle = '#F2E6CC'; c.beginPath(); c.moveTo(-14, -9); c.lineTo(-58, 1); c.lineTo(-14, 11); c.fill(); c.fillStyle = '#2A1820'; c.beginPath(); c.moveTo(-44, -2); c.lineTo(-60, 1); c.lineTo(-44, 4); c.fill(); }, { blur: 16, dx: 8, dy: 12 });
  strip(main, '圣诞节  剩下单人的剩单节', 956); vmark(main); vfinish(main);
};

/* 3b：主歌第二段，一层层纸山，脚印绕了一个圈 */
FRAMES['3b'] = async (main) => {
  const sg = main.createLinearGradient(0, 0, 0, VH); sg.addColorStop(0, '#0E1640'); sg.addColorStop(.55, '#2A2F70'); sg.addColorStop(1, '#6A4E90'); main.fillStyle = sg; main.fillRect(0, 0, VW, VH);
  const r = rng(13); for (let i = 0; i < 20; i++) { const x = r() * VW, y = r() * 600, rr = 120 + r() * 220, g = main.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, i % 2 ? 'rgba(120,110,210,.2)' : 'rgba(14,16,60,.3)'); g.addColorStop(1, 'rgba(0,0,0,0)'); main.fillStyle = g; main.fillRect(x - rr, y - rr, 2 * rr, 2 * rr); }
  for (let i = 0; i < 120; i++) { main.fillStyle = `rgba(255,255,255,${.3 + r() * .7})`; main.beginPath(); main.arc(r() * VW, r() * 620, 1 + r() * 2.6, 0, 7); main.fill(); }
  // 月亮：一圈一圈的纸
  [[430, '#2E3A80'], [340, '#4250A0'], [258, '#6474C4']].forEach(([q, col]) => player(main, c => { c.fillStyle = col; c.beginPath(); c.arc(1380, 360, q, 0, 7); c.fill(); }, { blur: 30, dx: 10, dy: 14, a: .45 }));
  player(main, c => { c.fillStyle = '#FFF2C8'; c.beginPath(); c.arc(1380, 360, 180, 0, 7); c.fill(); c.fillStyle = 'rgba(220,190,120,.5)';[[1320, 300, 34], [1440, 400, 26], [1350, 440, 16], [1460, 290, 12]].forEach(([x, y, q]) => { c.beginPath(); c.arc(x, y, q, 0, 7); c.fill(); }); }, { blur: 30, dx: 12, dy: 16 });
  glowAt(main, 1380, 360, 520, 'rgba(255,225,150,.5)', .8);
  // 纸山，由远到近
  player(main, c => { c.fillStyle = '#3A468C'; hillPath(c, -20, 1940, 0, 600, 46, 21, VH); c.fill();[160, 420, 700, 1080, 1700, 1860].forEach((x, i) => ppine(c, x, 640 - (i % 2) * 20, 90 + (i % 3) * 20, '#2A3A70')); }, { blur: 24, dx: 10, dy: -8, a: .4 });
  player(main, c => { c.fillStyle = '#5A68B0'; hillPath(c, -20, 1940, 0, 690, 40, 33, VH); c.fill(); phouse(c, 1520, 700, 120, 110, '#C89A8A', '#6A3A4A', { wins: [[.2, .34, .24, .34, 1], [.6, .34, .24, .34, 1]], chim: 1 }); c.fillStyle = 'rgba(255,255,255,.7)';[[1612, 540, 16], [1632, 500, 22], [1664, 456, 30]].forEach(([x, y, q]) => { c.beginPath(); c.arc(x, y, q, 0, 7); c.fill(); });[300, 560, 1300, 1760].forEach((x, i) => ppine(c, x, 724 - (i % 2) * 16, 130 + (i % 2) * 30, '#33508A')); }, { blur: 26, dx: 10, dy: -10, a: .45 });
  glowAt(main, 1580, 655, 90, 'rgba(255,200,110,.8)', .8);
  player(main, c => { c.fillStyle = '#8E9CD8'; hillPath(c, -20, 1940, 0, 780, 34, 44, VH); c.fill();[90, 880, 1160, 1840].forEach((x, i) => ppine(c, x, 800 - (i % 2) * 10, 190 + (i % 2) * 40)); }, { blur: 28, dx: 10, dy: -12, a: .45 });
  // 这一层上有一圈脚印：走了很远，其实在绕圈
  player(main, c => {
    c.fillStyle = '#C6CEF0'; hillPath(c, -20, 1940, 0, 850, 26, 55, VH); c.fill();
    c.fillStyle = 'rgba(70,80,150,.75)'; for (let i = 0; i < 64; i++) { const a = -2.2 + i * .092, x = 1010 + Math.cos(a) * 520, y = 930 + Math.sin(a) * 62; if (y > 990 || x < 700) continue; c.save(); c.translate(x, y + (i % 2 ? 7 : -7)); c.rotate(a + Math.PI / 2); c.beginPath(); c.ellipse(0, 0, 9, 5, 0, 0, 7); c.fill(); c.restore(); }
    ppine(c, 1700, 900, 250); ppine(c, 300, 890, 220);
  }, { blur: 30, dx: 10, dy: -14, a: .45 });
  // 主角
  player(main, c => { vguy(c, 640, 946, 250, { ...HERO, eyes: 'shut', mouth: 'flat', wind: 1, step: 1, paper: 1 }); }, { blur: 34, dx: 16, dy: 20 });
  // 最前面的雪、拉条
  player(main, c => { c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(-20, VH); c.lineTo(-20, 960); c.bezierCurveTo(300, 900, 520, 1010, 900, 1030); c.bezierCurveTo(1300, 1050, 1600, 940, 1940, 980); c.lineTo(1940, VH); c.closePath(); c.fill(); ppine(c, 80, 1000, 300); ppine(c, 1860, 1010, 330); }, { blur: 34, dx: 10, dy: -16, a: .4 });
  player(main, c => { c.fillStyle = '#FFF7E6'; c.beginPath(); c.roundRect(-30, 560, 150, 70, 12); c.fill(); c.fillStyle = '#C8553D'; c.font = '40px "Ma Shan Zheng"'; c.textBaseline = 'middle'; c.fillText('拉 →', 24, 597); }, { blur: 14, dx: 6, dy: 8 });
  hang(main, [[220, 180, 28], [470, 320, 22], [760, 150, 26], [980, 400, 20], [1120, 200, 16, 's'], [1700, 160, 24], [1820, 420, 20], [620, 470, 14, 's'], [300, 520, 16]], { blur: 14, dx: 8, dy: 12, a: .4 });
  hang(main, [[150, 760, 90], [1760, 660, 100], [1000, 80, 60]], { blur: 30, dx: 10, dy: 20, a: .3, f: 'blur(8px)' });
  strip(main, '踏着雪  不知不觉走了很远', 950); vmark(main); vfinish(main, .5);
};
