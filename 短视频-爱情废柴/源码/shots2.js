'use strict';
/* shots2.js —— 第二段主歌（40.71~65.03 秒，乐队进来）：大地图、绕圈、烟花棒、哼一千遍、酒馆、没有你的冬天、上台 */
function stepsPanel(g, n, lab = '步数', y = 58) { panel(g, 12, y, 92, 20); ptext(g, lab, 18, y + 3, '#9FE8FF'); ptext(g, String(Math.round(n)).padStart(5, '0'), 98, y + 3, '#FFE066', { align: 'r' }); }
function trail(g, a, cx, cy, n = 40, da = .05) { for (let k = 1; k < n; k++) { const [x, y] = loopPt(a - k * da); R(g, x - cx - 1 + (k % 2) * 2, y - cy + (k % 2), 2, 1, '#6A7CB0'); } }
/* 40.71 踏着雪：大地图 */
S(40.71, (g, G, t, u) => {
  const a = 2.6 + u * .22, [hx, hy] = loopPt(a), [cx, cy] = world(g, G, t, hx + 30, hy - 10); trail(g, a, cx, cy);
  person(g, hx - cx, hy - cy, 24, HO({ step: stepOf(t, 0, 6), wind: 1 })); snow3(g, t);
  hud(g, { hp: .075, hpn: 9 }); party(g, t); stepsPanel(g, 120 + u * 2400); toast(g, '大地图', sg(u, 0, .3), { x: 250, icon: 'key', bg: '#102A4A', col: '#C8F0FF' });
  panel(g, 372, 52, 80, 54); g.drawImage(worldMap().p, 0, 0, WM_W, WM_H, 376, 56, 72, 46); if (blink(t, .3)) R(g, 376 + hx / WM_W * 72 - 1, 56 + hy / WM_H * 46 - 1, 3, 3, '#FF5A6A');
}, { in: ['flashin', .35] });
/* 42.4 不知不觉走了很远：横着走，路牌一块块过去 */
function signpost(g, x, s) { R(g, x, 196, 3, 26, '#6A4028'); const w = tbits(s).w + 10; R(g, x - w / 2 + 1, 180, w, 17, '#8A5A38'); R(g, x - w / 2 + 1, 180, w, 2, '#FFFFFF'); R(g, x - w / 2 + 1, 195, w, 2, '#5A3422'); ptext(g, s, x + 2, 182, '#FFF4E0', { align: 'c' }); }
S(42.4, (g, G, t, u) => {
  up(g, G); const x = 100 + u * 90; scroll(g, G, t, x, 'night');
  [[360, '离家 10 里'], [520, '离家 100 里'], [690, '离家 999 里']].forEach(([sx, s]) => signpost(g, Math.round(sx - x + 100), s));
  for (let i = 0; i < 20; i++) { const fx = 196 - i * 12 - ((x) % 12); R(g, fx, 224 + (i % 2) * 3, 4, 1, '#7F93C6'); }
  person(g, 210, 224, 44, HO({ step: stepOf(t, 0, 6), wind: 1, eyes: 'dn' })); snow3(g, t, 1.2);
  for (let k = 0; k < 4; k++) { const px = ((k * 230 - x * 2.2) % 920 + 920) % 920 - 120; for (let j = 0; j < 44; j++) R(g, px - fl(j * .4), 222 + j, 1 + 2 * fl(j * .4), 1, j % 6 < 2 ? '#3A4A80' : '#0E1838'); R(g, px - 2, 266, 5, 20, '#0E1838'); }
  dn(g, G); hud(g, { hp: .075, hpn: 9 }); party(g, t); stepsPanel(g, 5200 + u * 2823);
});
/* 44.1 绕着圈：拉远一看，一直在绕着湖走 */
S(44.1, (g, G, t, u) => {
  const a = 3.2 + u * 5.4, [hx, hy] = loopPt(a), [cx, cy] = world(g, G, t, LAKE[0], LAKE[1]); trail(g, a, cx, cy, 126, .05);
  person(g, hx - cx, hy - cy, 22, HO({ step: stepOf(t, 0, 10), wind: 1 })); for (let k = 1; k < 4; k++) { const [x, y] = loopPt(a - k * .09); g.save(); g.globalAlpha = .35 - k * .08; chibi(g, x - cx, y - cy, 22, HO({ wind: 1 })); g.restore(); } snow3(g, t);
  hud(g, { hp: .075, hpn: 9 }); party(g, t); stepsPanel(g, 37 + fl(u * 1.4), '圈数');
  banner(g, '你一直在原地绕圈', sg(u, .25, .5), 196, { bg: '#102A4A', col: '#C8F0FF' });
  for (let i = 0; i < 2; i++) for (let j = 0; j < 5; j++) R(g, 396 + i * 8 + j, 60 + j, 1, 9 - 2 * j, '#FFE9A0');
}, { in: ['mosaic', .3] });
/* 45.3 我叛逆点起一根烟：点的是一根烟花棒 */
S(45.3, (g, G, t, u) => {
  up(g, G); scroll(g, G, t, 900 + u * 4, 'night'); xtree(g, G, 420, 226, 96, 9); snowman(g, 90, 226);
  const lit = u > .55, hp = person(g, 220, 232, 92, HO({ arms: 'upR', eyes: lit ? 'n' : 'dn', mouth: lit ? 'smile' : 'flat', snow: 1, rim: lit ? '#FFE0A0' : undefined }));
  const tx = hp.hR[0] + 3, ty = hp.hR[1] - 34; line(g, hp.hR[0] + 2, hp.hR[1] - 2, tx, ty, '#8A8AA8', 2);
  if (lit) { const f = fl(t * 30); for (let i = 0; i < 22; i++) { const a = hash(f, i) * 6.283, d = 4 + hash(f, i + 40) * 26, x = tx + Math.cos(a) * d, y = ty + Math.sin(a) * d; line(g, tx + Math.cos(a) * d * .5, ty + Math.sin(a) * d * .5, x, y, i % 3 ? '#FFE066' : '#FFFFFF'); if (i % 4 === 0) sparkle(g, null, Math.round(x), Math.round(y), '#FFFFFF', 1); } disc(g, tx, ty, 3, '#FFFFFF'); soft(G, tx, ty, 46, '#FFC850', 1); soft(G, tx, ty, 14, '#FFFFFF', 1); for (let i = 0; i < 6; i++) { const a = ((t * .6 + i * .17) % 1); disc(g, tx + 6 + a * 30 + Math.sin(a * 9 + i) * 4, ty - 8 - a * 70, 2 + a * 7, '#8A96C0', .3 * (1 - a)); } }
  else if (u > .3) { fxFlash(g, 0); R(g, tx - 6, ty + 2, 5, 3, '#E0A040'); R(g, tx - 2, ty, 3, 3, '#FFE066'); }
  dn(g, G); snow3(g, t); hud(g, { hp: .075, hpn: 9, face: { mouth: 'smile' } }); party(g, t);
  itemGet(g, G, u - .1, 'spark', '烟花棒', { y: 60, label: '使用' });
  if (u > .9) { const y = 100 - Math.round((1 - eob(sg(u, .9, 1.1))) * 8); tagp(g, 300, y, '叛逆', '#4A1020', '#FF8AA0'); floatText(g, '帅气 +1', 330, y + 30, u - 1.0, { col: '#FFE066', life: 1.1 }); floatText(g, '取暖 +0', 330, y + 44, u - 1.3, { col: '#9FE8FF', life: 1 }); }
  [['scarf', 0], ['half', 1]].forEach(([n, i]) => slot(g, 366 + i * 22, 188, n, { hot: i === 1 })); if (blink(t, .7)) ptext(g, '?', 402, 176, '#FFE066', { ol: '#3A2A10' });
}, { in: ['flashin', .2] });
/* 47.45 一整天 我旋律哼了一千遍：天亮了又黑了，计数一直在跳 */
S(47.45, (g, G, t, u) => {
  const seq = [['night', 0], ['autumn', .65], ['spring', 1.3], ['dusk', 2.0], ['night', 2.7]]; let A = 'night', B = 'night', p = 0; for (let i = 0; i < seq.length - 1; i++) if (u >= seq[i][1]) { A = seq[i][0]; B = seq[i + 1][0]; p = sg(u, seq[i + 1][1] - .35, seq[i + 1][1]); }
  up(g, G); put(g, skyBuf(A).p); put(G, skyBuf(A).g); R(g, 0, PH, PW, 16, PALS.night.gr[3]); if (p > 0) { g.save(); g.globalAlpha = p; g.drawImage(skyBuf(B).p, 0, 0); g.restore(); }
  const x = 500 + u * 10;[[1, .08], [2, .28], [3, 1]].forEach(([L, sp]) => { const b = stripBuf('night', L), ox = -(((x * sp) % 960) + 960) % 960; put2(g, G, b, ox, 0); put2(g, G, b, ox + 960, 0); });
  const day = (A === 'spring' ? 1 - p : 0) + (B === 'spring' ? p : 0) + .5 * ((A === 'autumn' ? 1 - p : 0) + (B === 'autumn' ? p : 0)); if (day > 0) fxTint(g, '#FFF0C8', .3 * day, 'soft-light');
  lamp(g, G, 320, 218, 70, day < .4); R(g, 196, 204, 88, 5, '#8A5A38'); R(g, 196, 203, 88, 1, '#FFFFFF'); R(g, 200, 209, 3, 12, '#5A3422'); R(g, 278, 209, 3, 12, '#5A3422'); R(g, 196, 188, 88, 3, '#8A5A38'); R(g, 196, 187, 88, 1, '#FFFFFF');
  for (let i = 0; i < 7; i++) { const px = ((i * 170 + t * (150 + i * 30) * (i % 2 ? 1 : -1)) % 700 + 700) % 700 - 100; g.save(); g.globalAlpha = .55; chibi(g, px, 232 + (i % 3) * 5, 34, npc(i, { step: stepOf(t, i, 12) })); g.restore(); }
  const hp = person(g, 240, 210, 50, HO({ sit: 1, eyes: 'shut', mouth: blink(t, .27) ? 'o' : 'smile' }));
  const n = 1 + Math.round(999 * ease(sg(t, 48.3, 50.3)));
  for (let i = 0; i < 16; i++) { const a = ((t * .9 + i * .21) % 1.6) / 1.6; if (i > 2 + n / 80) continue; note(g, G, hp.x + 10 + Math.sin(a * 7 + i) * 26 + i * 3 - 20, hp.mouth - a * 120, ['#FFE066', '#FFFFFF', '#FF9AD8', '#9FE8FF'][i % 4]); }
  dn(g, G); hud(g, { hp: .075, hpn: 9 }); party(g, t);
  panel(g, 170, 14, 140, 40, { bg: n >= 1000 ? '#3A2A10' : '#101A44' }); ptext(g, '哼歌', 178, 18, '#9FE8FF'); ptext(g, '×' + String(n).padStart(4, '0'), 300, 14, n >= 1000 ? '#FFE066' : '#FFFFFF', { align: 'r', s: 2, sh: '#060A24' }); bar(g, 178, 44, 124, n / 1000, '#FFD54A');
  panel(g, 372, 52, 80, 34); disc(g, 390, 69, 11, '#FFFFFF'); disc(g, 390, 69, 9.5, '#FFF2C8'); const ha = u * 7.6 - 1.57; line(g, 390, 69, 390 + Math.cos(ha) * 8, 69 + Math.sin(ha) * 8, INK); line(g, 390, 69, 390 + Math.cos(ha / 12) * 5, 69 + Math.sin(ha / 12) * 5, INK, 2); ptext(g, day > .4 ? '白天' : '夜里', 408, 62, '#FFFFFF');
  if (n >= 1000) { toast(g, '成就解锁：千遍一律', sg(t, 50.3, 50.55), { icon: 'star', x: 240, y: 60 }); burst(g, G, 240, 34, t - 50.3, 16, '#FFE066', 80); }
  snow3(g, t, .7);
}, { in: ['flashin', .2] });
/* 50.8 千遍一律我不醉不归：酒馆 */
function mug(g, x, y) { R(g, x, y - 9, 8, 9, '#D8B878'); R(g, x + 8, y - 7, 2, 5, '#D8B878'); R(g, x, y - 10, 8, 3, '#FFFFFF'); R(g, x + 1, y - 6, 1, 5, '#F0D8A0'); }
S(50.8, (g, G, t, u) => {
  up(g, G); tavern(g, G, t); const dr = sg(u, .3, 2.6), n = 1 + fl(dr * 8);
  chibi(g, 190 + Math.round(Math.sin(t * 1.2) * 16), 176, 46, npc(9, { eyes: 'happy', arms: 'upR' })); g.drawImage(tavernBuf().p, 8, 146, 252, 62, 8, 146, 252, 62);
  for (let i = 0; i < n; i++) mug(g, 150 + (i % 4) * 11 + fl(i / 4) * 5, 146 - fl(i / 4) * 9);
  person(g, 410, 240, 44, npc(4, { eyes: 'happy', arms: 'upR' }), '#4A2818'); person(g, 452, 240, 44, npc(5, { eyes: 'happy', arms: 'up' }), '#4A2818'); mug(g, 425, 204); mug(g, 432, 204); if (blink(t, 1.1)) emote(g, 431, 176, 'heart', t);
  person(g, 40, 244, 40, npc(7, { eyes: 'shut', mouth: 'flat' }), '#4A2818'); if (blink(t, 1.4)) emote(g, 40, 196, 'zzz', t);
  const hp = person(g, 110, 206, 52, HO({ sit: 1, eyes: dr > .8 ? 'x' : dr > .3 ? 'happy' : 'sad', mouth: dr > .3 ? 'o' : 'flat', blush: 1, arms: blink(t, .8) ? 'upR' : 'down' }), '#3A2014'); if (blink(t, .8)) mug(g, hp.hR[0] - 2, hp.hR[1] - 2);
  floatText(g, '嗝', hp.x + 20, hp.top + 16, (u - .8) % 1.2, { col: '#FFE9A0', life: .9 });
  dn(g, G); hud(g, { hp: .075, hpn: 9, face: { eyes: dr > .3 ? 'happy' : 'sad', mouth: 'o' } }); tagp(g, 14, 58, '醉 Lv.' + (1 + fl(dr * 2.99)), '#4A1020', '#FF8AA0');
  if (u > 1.5) { const p = sg(u, 1.5, 1.7); if (popPanel(g, 290, 36, 120, 50, p)) { ptext(g, '要回家吗？', 300, 40, '#FFFFFF'); ptext(g, '是', 322, 56, '#5A6AA0'); ptext(g, '否', 322, 69, '#FFE066'); cursor(g, 304, 72, t); if (blink(u, .2)) R(g, 318, 68, 60, 12, 'rgba(255,224,102,.3)'); ptext(g, '×' + (1 + fl((u - 1.7) * 6)), 400, 69, '#FF8AA0', { align: 'r' }); } }
  if (dr > .3) fxShift(g, Math.sin(t * 2.6) * 3 * dr, Math.sin(t * 1.9) * 1.5 * dr);
}, { in: ['iris', .4] });
/* 54.7 没有你的冬天：长椅上空着一半 */
S(54.7, (g, G, t, u) => {
  up(g, G); scroll(g, G, t, 330 + u * 5, 'night');
  g.fillStyle = '#5AE0B0'; for (let x = 0; x < PW; x += 1) { const y0 = 46 + Math.sin(x / 60 + t * .4) * 14 + Math.sin(x / 23 + t * .7) * 5, h = 16 + Math.sin(x / 40 - t * .5) * 8; for (let y = 0; y < h; y++) if (bay(x, Math.round(y0 + y)) < .26 * (1 - y / h)) g.fillRect(x, Math.round(y0 + y), 1, 1); } soft(G, 200, 56, 90, '#30C090', .25);
  lamp(g, G, 170, 220, 84, 1); snowman(g, 352, 226); R(g, 344, 210, 14, 4, '#D8323C'); xtree(g, G, 430, 228, 70, 5);
  R(g, 196, 208, 100, 5, '#8A5A38'); R(g, 196, 207, 100, 1, '#FFFFFF'); R(g, 200, 213, 3, 12, '#5A3422'); R(g, 290, 213, 3, 12, '#5A3422'); R(g, 196, 190, 100, 3, '#8A5A38'); R(g, 196, 189, 100, 1, '#FFFFFF');
  for (let i = 0; i < 14; i++) R(g, 20 + i * 13, 232 + (i % 2) * 3 - i * .4, 4, 1, '#7F93C6');
  person(g, 222, 214, 50, HO({ sit: 1, eyes: 'dn', mouth: 'flat', snow: 1 }));
  const gh = 1 - sg(t, 57.3, 58.5); if (gh > 0) { g.save(); g.globalAlpha = (.3 + .1 * Math.sin(t * 5)) * gh; chibi(g, 270, 214, 50, GO({ sit: 1, eyes: 'happy', mouth: 'smile' })); g.restore(); for (let i = 0; i < 26; i++) { const a = i / 26 * 6.283; if ((i + fl(t * 4)) % 2) R(g, 270 + Math.cos(a) * 17, 186 + Math.sin(a) * 30, 2, 1, '#B7A6F0'); } } if (gh < 1) for (let i = 0; i < 30; i++) { const a = (1 - gh) * 1.4; R(g, 270 + (hash(i, 1) - .5) * 34 + a * 60 * (hash(i, 2) - .2), 186 + (hash(i, 3) - .5) * 60 - a * 80 * hash(i, 4), 2, 2, i % 2 ? '#FFFFFF' : '#B7A6F0'); }
  dn(g, G); snow3(g, t, .8); hud(g, { hp: .075, hpn: 9, face: { eyes: 'sad' } }); party(g, t);
  panel(g, 12, 58, 128, 34); icon(g, 'snow', 18, 62); ptext(g, '季节　冬', 34, 61, '#C8F0FF'); ptext(g, '第 365 天', 34, 75, '#FFFFFF');
  if (u > 2.8) tagp(g, 250, 150, '队友位：空', '#101A44', '#6A7CC8');
}, { in: ['dz', .6] });
/* 59.5 我会一直唱着唱着：拿起麦克风 */
function stageHero(g, t, x, o) { return person(g, x, 200, 46, HO(o), '#5A3422'); }
function stageBits(g, t) { snowman(g, 372, 226); cat(g, 334, 232); snow3(g, t); }
S(59.5, (g, G, t, u) => {
  stage(g, G, t, { lit: 0 }); stageBits(g, t); const hx = lerp(176, 236, ease(sg(u, 0, 1.1))), got = u > 1.1;
  if (!got) { R(g, 250, 168, 1, 32, '#C9D6EE'); R(g, 245, 199, 11, 1, '#C9D6EE'); R(g, 248, 162, 5, 6, '#2A2438'); R(g, 249, 162, 3, 2, '#8A8AA8'); }
  stageHero(g, t, hx, got ? { arms: 'mic', eyes: 'happy', mouth: blink(t, .3) ? 'o' : 'smile' } : { step: stepOf(t) });
  hud(g, { hp: .075, hpn: 9, face: { mouth: 'smile' } }); party(g, t);
  itemGet(g, G, u - 1.1, 'mic', '麦克风', { y: 56 }); if (got && u < 1.5) fxFlash(g, (1 - sg(u, 1.1, 1.5)) * .5);
  if (u > 2.0) toast(g, '新任务：一直唱', sg(u, 2.0, 2.3), { icon: 'note', x: 250 });
}, { in: ['blinds', .4] });
/* 62.7 直到你出现 */
S(62.7, (g, G, t, u) => {
  const lit = sg(u, .2, .6); stage(g, G, t, { lit }); stageBits(g, t);
  const hp = stageHero(g, t, 236, { arms: 'mic', eyes: 'shut', mouth: blink(t, .27) ? 'o' : 'smile', rim: lit > .5 ? '#FFF0C0' : undefined });
  for (let i = 0; i < 6; i++) { const a = ((t * .8 + i * .3) % 1.5) / 1.5; note(g, G, hp.x + 16 + Math.sin(a * 6 + i) * 16 + i * 6, hp.mouth - a * 90, ['#FFE066', '#FFFFFF', '#FF9AD8'][i % 3]); }
  hud(g, { hp: .075, hpn: 9, face: { eyes: 'shut', mouth: 'o' } }); party(g, t);
  panel(g, 12, 58, 128, 46, { bg: '#3A2A10' }); ptext(g, '任务　一直唱', 20, 62, '#FFE9A0'); typed(g, '目标　直到「你」出现', 20, 76, '#FFFFFF', u - .3, 16); if (u > 1.5) ptext(g, '0 / 1', 132, 90, '#FF8AA0', { align: 'r' });
  if (u > 1.6) { emote(g, hp.x, hp.top + 12, '!', t); if (blink(u, .2)) fxTint(g, '#FF3A4A', .14); ptext(g, '！', 240, 60, '#FF5A6A', { align: 'c', s: 3, ol: '#FFFFFF' }); }
});
