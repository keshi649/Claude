'use strict';
/* shots3.js —— 第一遍副歌（65.03~118.55 秒）：Boss「你的笑容」 */
function battleUI(g, t, o = {}) {
  panel(g, 196, 14, 216, 30, { bg: '#40102A' }); ptext(g, 'BOSS', 202, 17, '#FF6A8A'); ptext(g, o.name || '你的笑容', 234, 17, '#FFFFFF'); ptext(g, 'Lv.99', 404, 17, '#FFE066', { align: 'r' }); bar(g, 203, 34, 202, o.bhp ?? 1, '#FF5A8A');
  hud(g, { hp: (o.hpn ?? 9) / 120, hpn: o.hpn ?? 9, face: o.face });
  [['mic', 0], ['scarf', 1], ['half', 2]].forEach(([n, i]) => slot(g, 346 + i * 22, 198, n, { hot: i === 2 })); if (blink(t, .7)) ptext(g, '?', 404, 188, '#FFE066', { ol: '#3A2A10' });
}
const boss = (g, x, fy, H, o) => person(g, x, fy, H, GO(o), '#8878C0');
const bhero = (g, x, fy, H, o) => person(g, x, fy, H, HO(o), '#8878C0');
function tearJets(g, x, y, t, s = 1, n = 14) { for (let sd = -1; sd <= 1; sd += 2) for (let i = 0; i < n; i++) { const a = ((t * 1.6 + i / n) % 1), px = x + sd * (5 * s + a * 44 * s), py = y - Math.sin(a * 3.14) * 30 * s + a * 26 * s; R(g, px, py, 2, 2, i % 3 ? '#8FDCFF' : '#FFFFFF'); } }
function gameOver(g, t, age, o = {}) { if (age < 0) return; const p = sg(age, 0, .25), y = (o.y ?? 60) - Math.round((1 - eob(p)) * 70); panel(g, 140, y, 200, 74, { bg: '#2A0A18' }); ptext(g, 'GAME OVER', 240, y + 6, '#FF5A6A', { align: 'c', s: 2, sh: '#3A0A14' }); ptext(g, '要继续吗？', 240, y + 36, '#FFFFFF', { align: 'c' }); const hot = blink(age, .16); if (hot) R(g, 186, y + 53, 30, 13, 'rgba(255,224,102,.35)'); ptext(g, '是', 196, y + 54, '#FFE066'); ptext(g, '否', 270, y + 54, '#5A6AA0'); cursor(g, 184, y + 57, t); if (o.n) ptext(g, '×' + o.n, 330, y + 54, '#FF8AA0', { align: 'r' }); }

/* 65.03 Boss 出现 */
S(65.03, (g, G, t, u) => {
  battleBG(g, G, t, 0); const p = sg(u, .1, .6), by = 196 - Math.round((1 - eob(p)) * 220);
  boss(g, 350, by, 110, { eyes: 'happy', mouth: 'smile', rim: '#FFF4C0' }); const hp = bhero(g, 110, 200, 46, { eyes: 'wide', mouth: 'o', arms: 'mic' }); if (u > .5) emote(g, 110, hp.top + 6, '!', t);
  if (u > .55 && u < .9) { fxShake(g, t, 4 * (1 - sg(u, .55, .9))); fxFlash(g, (1 - sg(u, .55, .8)) * .7); }
  const q = eo(sg(u, .7, 1.0)); if (q > 0) { for (let i = 0; i < 3; i++) R(g, 0, 96 + i * 14, PW, 12, ['#40102A', '#6A1A3A', '#40102A'][i]); R(g, 0, 94, PW, 2, '#FFE066'); R(g, 0, 138, PW, 2, '#FFE066'); ptext(g, 'BOSS', 40 + (1 - q) * -200, 104, '#FF6A8A', { s: 2, sh: '#1A0610' }); ptext(g, '你 的 笑 容', 240 + (1 - q) * 400, 99, '#FFFFFF', { align: 'c', s: 3, sh: '#1A0610' }); ptext(g, 'Lv.99', 440 + (1 - q) * 200, 112, '#FFE066', { align: 'r' }); }
  hud(g, { hp: .075, hpn: 9, face: { eyes: 'wide', mouth: 'o' } }); snow3(g, t, .6);
}, { in: ['swirl', .8], tag: '战斗' });
/* 67.0 为你封麦 只唱你爱：技能「封麦」，没有效果 */
S(67.0, (g, G, t, u) => {
  battleBG(g, G, t, 0); const cast = t > 68.1;
  boss(g, 350, 196, 110, { eyes: 'happy', mouth: 'smile', rim: '#FFF4C0' });
  const hp = bhero(g, 110, 200, 46, { arms: 'mic', eyes: cast ? 'shut' : 'n', mouth: cast && blink(t, .26) ? 'o' : 'flat' });
  if (!cast) { menu(g, 150, 58, 62, ['攻击', '技能', '道具', { s: '逃跑', off: 1 }], 1, { t }); if (u > .25) { menu(g, 206, 68, 86, ['封麦', '耍赖', '哭个痛快'], 0, { t, bg: '#1A2A6A' }); panel(g, 150, 126, 180, 20, { bg: '#3A2A10' }); ptext(g, '封麦：只对一个人唱', 158, 129, '#FFE9A0'); } }
  else { tagp(g, 84, hp.top - 18, '封麦', '#3A2A10', '#FFE066'); for (let i = 0; i < 16; i++) { const a = (t - 68.2 - i * .17) / .9; if (a < 0) continue; if (a < 1) note(g, G, lerp(hp.x + 14, 318, a), lerp(hp.mouth, 126, a) - Math.sin(a * 3.14) * 34, ['#FFE066', '#FFFFFF', '#FF9AD8', '#9FE8FF'][i % 4]); else floatText(g, ['MISS', '0', 'MISS', '♥'][i % 4], 318 + (i % 3) * 14 - 14, 120 - (i % 2) * 14, (a - 1) * .9, { col: i % 4 === 3 ? '#FF8AB0' : '#C8D4FF', ol: '#3A1A60', life: .7 }); } if (t > 69.9) banner(g, '没有效果……', sg(t, 69.9, 70.15), 60, { bg: '#102A4A', col: '#C8F0FF' }); }
  battleUI(g, t, { face: { eyes: cast ? 'shut' : 'n', mouth: cast ? 'o' : 'flat' } }); snow3(g, t, .6);
}, { tag: '战斗' });
/* 71.2 Goodbye Don't Cry：她挥挥手，一个个字母砸过来 */
S(71.2, (g, G, t, u) => {
  battleBG(g, G, t, 0); const L = LYR[14], wave = blink(t, .36);
  const bp = boss(g, 350, 196, 110, { eyes: 'happy', mouth: 'smile', arms: wave ? 'upR' : 'down', rim: '#FFF4C0' });
  let hits = 0; 'Goodbye'.split('').forEach((c, i) => { const a = (t - LT(14, i)) / .42; if (a >= 1) hits++; });
  const hx = 110 - hits * 3, hp = bhero(g, hx, 200, 46, { arms: 'mic', eyes: hits ? 'sad' : 'n', mouth: hits ? 'frown' : 'flat', tear: hits > 3 ? 1 : 0 });
  'Goodbye'.split('').forEach((c, i) => { const a = (t - LT(14, i)) / .42; if (a < 0) return; if (a < 1) { const x = lerp(300, hx + 8, a), y = lerp(112, 172, a) - Math.sin(a * 3.14) * 22; ptext(g, c, x, y, '#FF8AB0', { s: 2, ol: '#40102A' }); soft(G, x + 8, y + 10, 12, '#FF5A8A', .7); } else floatText(g, '-1', hx + 20 + (i % 3) * 8, hp.top + 4 - (i % 2) * 10, (a - 1) * .42, { col: '#FF3A4A', ol: '#FFFFFF', life: .6 }); });
  const lastHit = t - LT(14, Math.max(0, hits - 1)) - .42; if (hits && lastHit < .15) fxShake(g, t, 2);
  const dc = L.chars.filter(c => c[0] !== ' ').slice(7, 15), nd = dc.filter(c => t >= c[1] - .05).length; if (nd > 0) { panel(g, hx - 56, hp.top - 40, 116, 24, { bg: '#102A4A' }); ptext(g, '提示', hx - 50, hp.top - 36, '#9FE8FF'); ptext(g, "Don't Cry".slice(0, nd + (nd > 3 ? 1 : 0) + (nd > 4 ? 1 : 0)), hx - 22, hp.top - 36, '#FFFFFF'); }
  banner(g, '你的笑容 使用了「Goodbye」', sg(u, 0, .25), 50);
  battleUI(g, t, { hpn: 9 - hits, face: { eyes: hits ? 'sad' : 'n', mouth: 'frown' } }); snow3(g, t, .6);
}, { tag: '战斗' });
/* 74.5 哭个痛快：眼泪喷成两道喷泉，水漫上来 */
S(74.5, (g, G, t, u) => {
  battleBG(g, G, t, 0); const lv = sg(u, .3, 3.1) * 26;
  const bp = boss(g, 350, 196, 110, { eyes: u > 1 ? 'n' : 'happy', mouth: u > 1 ? 'o' : 'smile', arms: u > 1.1 ? 'upR' : 'down', rim: '#FFF4C0' });
  if (u > 1.1) { const ux = bp.hR[0], uy = bp.hR[1]; R(g, ux, uy - 40, 2, 44, '#3A2A20'); for (let j = 0; j < 14; j++) R(g, ux - 6 - j * 4, uy - 54 + j, 14 + j * 8, 1, j % 2 ? '#C83040' : '#E0423A'); R(g, ux - 62, uy - 40, 126, 1, '#8A1E2A'); }
  const hp = bhero(g, 124, 200, 56, { arms: 'up', eyes: 'shut', mouth: 'o', tear: 1.2 }); tearJets(g, hp.x, hp.head + 4, t, 1.3, 20);
  g.fillStyle = 'rgba(90,184,255,.42)'; g.fillRect(0, 218 - lv, PW, PH); for (let x = 0; x < PW; x += 2) R(g, x, 218 - lv + Math.round(Math.sin(x / 14 + t * 4) * 1.5), 2, 1, '#D8F0FF');
  for (let i = 0; i < 6; i++) floatText(g, '+1', hp.x - 30 + i * 12, hp.top + 6, (u - .5 - i * .4), { col: '#7AF0A0', ol: '#0A3A20', life: .8 });
  banner(g, '废柴 使用了「哭个痛快」', sg(u, .1, .35), 50, { bg: '#102A4A', col: '#C8F0FF' });
  battleUI(g, t, { hpn: 2 + Math.min(6, fl(Math.max(0, u - .5) / .4)), face: { eyes: 'shut', mouth: 'o' } }); snow3(g, t, .6);
}, { tag: '战斗' });
/* 77.75 曲终人散 你也走散 */
function logPanel(g, lines, y = 58) { if (!lines.length) return; panel(g, 12, y, 128, lines.length * 13 + 9); lines.forEach(([s, c], i) => ptext(g, s, 18, y + 4 + i * 13, c || '#C8D4FF')); }
S(77.75, (g, G, t, u) => {
  stage(g, G, t, { lit: 1 - sg(u, .5, 2.8) }); snowman(g, 372, 226); crowd(g, G, t, 14, sg(u, .2, 3.4));
  person(g, 236, 200, 46, HO({ eyes: u > 3.3 ? 'r' : 'sad', mouth: 'flat' }), '#5A3422'); R(g, 250, 168, 1, 32, '#C9D6EE'); R(g, 245, 199, 11, 1, '#C9D6EE'); R(g, 248, 162, 5, 6, '#2A2438');
  const ga = t - 81.0; if (ga > 0) { const gx = 330 + ga * 46; person(g, gx, 226, 34, GO({ back: 1, step: stepOf(t, 0, 5) })); R(g, gx + 14, 214, 12, 11, '#8A3A4A'); R(g, gx + 19, 209, 3, 5, '#3A2A30'); for (let i = 0; i < 14; i++) if (330 + i * 10 < gx - 10) R(g, 330 + i * 10, 228 + (i % 2) * 2, 3, 1, '#7F93C6'); }
  snow3(g, t, 1.2);
  const lg = [['路人甲 离开了', .5], ['路人乙 离开了', 1.1], ['鼓手 离开了', 1.7], ['猫 离开了', 2.3], ['「你」走散了', 3.5]].filter(a => u > a[1]).map(a => [a[0], a[0][0] === '「' ? '#FF8AB0' : '#C8D4FF']); hud(g, { hp: .066, hpn: 8, face: { eyes: 'sad' } }); logPanel(g, lg);
  panel(g, 372, 52, 80, 54); R(g, 376, 56, 72, 46, '#0A0E24'); R(g, 392, 80, 3, 3, '#FFE066'); if (ga > 0) { const mx = 398 + ga * 17; if (mx < 446) R(g, mx, 82, 3, 3, '#FF8AB0'); else if (blink(t, .4)) ptext(g, '超出范围', 412, 60, '#FF8AA0', { align: 'c' }); } for (let i = 0; i < 6; i++) R(g, 380 + i * 11, 96, 6, 2, '#3A4680');
  party(g, t, { still: 1 });
}, { in: ['blinds', .5] });
/* 84.3 我承认我是 爱情里的废柴：职业栏盖章 */
S(84.3, (g, G, t, u) => {
  uiBG(g, t, '#100A28', '#2A1850'); field(g, 30, 0, 200, 214, '#FFE9B0', (x, y) => { const tt = y / 214, d = Math.abs(x - 124) / (10 + tt * 70); return d > 1 ? 0 : .2 * (1 - d); }); soft(G, 124, 60, 70, '#FFE0A0', .35); ell(g, 124, 214, 60, 7, '#3A2A70');
  const t1 = LT(16, 9), t2 = LT(16, 10), st = t > t1; chibi(g, 124, 214, 110, HO({ eyes: st ? 'shut' : 'sad', mouth: st ? 'frown' : 'flat', tear: st ? 1 : 0 }));
  g.translate(-40, 0); G.translate(-40, 0); panel(g, 244, 16, 208, 196); panel(g, 252, 8, 76, 17, { bg: '#3A2A10' }); ptext(g, '角色情报', 260, 10, '#FFE9A0');
  ptext(g, '姓名', 256, 32, '#9FE8FF'); ptext(g, '我', 296, 32, '#FFFFFF'); ptext(g, '职业', 256, 50, '#9FE8FF');
  const ja = LYR[16].chars.filter(c => c[0] !== ' ').slice(5, 9).filter(c => t >= c[1] - .05).length; ptext(g, ja ? '爱情里的'.slice(0, ja) : (t > LT(16, 0) ? '……' : '？？？'), 296, 50, '#FFFFFF');
  [[t1, '废', 300], [t2, '柴', 352]].forEach(([tt, c, x]) => { const a = t - tt + .05; if (a < 0) return; const k = a < .12 ? 5 : 4, yy = 66 - (a < .12 ? 8 : 0); ptext(g, c, x - (k - 4) * 6, yy, '#FF5A4A', { s: k, ol: '#FFFFFF', sh: '#8A1E2A' }); ptext(G, c, x, 66, '#A03020', { s: 4 }); burst(g, G, x + 24, 90, a, 12, '#FFE066', 50); });
  const ST = [['魅力', 1, '#FF8AB0'], ['勇气', 0, '#5AB8FF'], ['嘴硬', 99, '#FFD54A'], ['依赖', 99, '#B48AE8'], ['运气', -5, '#6CC58A']]; ST.forEach(([s, v, c], i) => { const y = 124 + i * 16, p = eo(sg(u, .3 + i * .22, .9 + i * .22)); ptext(g, s, 256, y, '#C8D4FF'); bar(g, 290, y + 4, 110, Math.max(0, v) / 99 * p, c); ptext(g, String(Math.round(v * p)), 444, y, v < 0 ? '#FF6A6A' : '#FFFFFF', { align: 'r' }); });
  g.translate(40, 0); G.translate(40, 0); for (const tt of [t1, t2]) { const a = t - tt + .05; if (a > 0 && a < .3) { fxShake(g, t, 5 * (1 - a / .3)); fxFlash(g, (1 - a / .2) * .5); } }
  if (t > t2 + .5) toast(g, '称号获得：爱情里的废柴', sg(t, t2 + .5, t2 + .8), { icon: 'hbroken', x: 124, y: 16 });
  snowAnim(g, t, 40, 8, { c: '#5A4AA0' });
}, { in: ['flash', .3], tag: '系统' });
/* 90.8 你的离开 喊得太快：回忆被八倍速放过去 */
S(90.8, (g, G, t, u) => {
  up(g, G); room(g, G, t); const go = t - 94.0, gx = go > 0 ? 190 + ei(sg(go, 0, .55)) * 420 : 190;
  R(g, 452, 96, 30, 118, '#3A2014'); R(g, 456, 100, 30, 114, go > .3 ? '#0E1840' : '#5A3422'); if (go > .3) snowAnim(g, t, 10, 4, {});
  person(g, 290, 214, 50, HO({ eyes: go > 0 ? 'wide' : 'dn', mouth: go > 0 ? 'o' : 'flat', arms: go > .2 ? 'upR' : 'down' }), '#3A2A30');
  if (go > 0 && go < .7) for (let k = 4; k > 0; k--) { g.save(); g.globalAlpha = .12 * k; chibi(g, gx - k * 26, 214, 50, GO({ hat: null, step: 1 })); g.restore(); }
  if (gx < 500) { person(g, gx, 214, 50, GO({ hat: go > 0 ? '#FFFFFF' : null, eyes: 'sad', mouth: 'flat', step: go > 0 ? stepOf(t, 0, 14) : 0 }), '#3A2A30'); R(g, gx + 20, 196, 18, 16, '#8A3A4A'); R(g, gx + 20, 196, 18, 2, '#B05A6A'); R(g, gx + 27, 189, 4, 7, '#3A2A30'); }
  dn(g, G); fxMemory(g); fxBars(g, 12);
  dialog(g, u - .15, '你', '我们……分开吧。', GO({ hat: null, eyes: 'sad' }), { y: 22, cps: 200 });
  if (u > .5 && go < 0) { menu(g, 306, 72, 100, [{ s: '挽留', off: u > 2.2 }, { s: '道歉', off: u > 2.2 }, { s: '……', off: u > 2.2 }], u > 2.2 ? -1 : fl(u * 5) % 3, { t }); const tl = 1 - sg(u, .6, 2.2); ptext(g, '限时', 306, 122, '#FF8AA0'); bar(g, 334, 126, 70, tl, tl < .3 ? '#FF5A6A' : '#FFD54A'); if (u > 2.2) ptext(g, '超时！', 356, 86, '#FF3A4A', { align: 'c', s: 2, ol: '#FFFFFF' }); }
  if (go > .5 && go < 1.0) { fxShake(g, t, 4 * (1 - sg(go, .5, 1))); ptext(g, '砰', 430, 60, '#FFFFFF', { s: 3, ol: '#3A2014' }); } if (go > .9) emote(g, 290, 136, '...', go);
  tagp(g, 12, 14, '回忆', '#3A2A10', '#FFE9A0'); for (let i = 0; i < 2; i++) for (let j = 0; j < 5; j++) R(g, 52 + i * 8 + j, 17 + j, 1, 9 - 2 * j, '#FFE9A0'); ptext(g, '×8', 72, 15, '#FFE9A0', { ol: '#3A2A10' });
}, { in: ['glitch', .4], tag: '回忆' });
/* 97.3 我的依赖 还在耍赖：拽着围巾不放，Game Over 了还一直点"继续" */
S(97.3, (g, G, t, u) => {
  battleBG(g, G, t, 0); const bx = 330 + u * 9, sa = t - 100.5;
  const bp = boss(g, bx, 196, 110, { eyes: 'n', mouth: 'flat', step: stepOf(t, 0, 3), back: 0 });
  const hx = bx - 150, hy = 196; ell(g, hx, hy + 2, 30, 3, '#8878C0', .6); rotBlit(g, chibi(null, 0, 0, 50, HO({ eyes: 'shut', mouth: 'frown', arms: 'up', buf: 1 })), hx, hy - 12, 1.45);
  line(g, hx + 30, hy - 14, bx - 20, 150, '#D8323C', 3); line(g, hx + 30, hy - 13, bx - 20, 151, '#F06A74', 1);
  for (let i = 0; i < 6; i++) { const a = ((t * 1.5 + i * .17) % 1); disc(g, hx - 30 - a * 40, hy - a * 14, 2 + a * 5, '#EEF0FF', .5 * (1 - a)); } for (let i = 0; i < 12; i++) R(g, hx - 40 - i * 11, hy + 1 + (i % 2), 6, 1, '#A898D8');
  banner(g, sa > -.4 ? '废柴 使用了「耍赖」' : '你的笑容 想离开战斗', sa > -.4 ? sg(sa, -.4, -.15) : sg(u, 0, .25), 50, sa > -.4 ? { bg: '#102A4A', col: '#C8F0FF' } : {});
  battleUI(g, t, { hpn: 8, face: { eyes: 'shut', mouth: 'frown' } });
  panel(g, 12, 58, 128, 36); icon(g, 'lock', 16, 60); ptext(g, '依赖　∞ 回合', 32, 61, '#B48AE8'); icon(g, 'scarf', 16, 76); ptext(g, '耍赖　×' + (1 + fl(u * 2.2)), 32, 77, '#9FE8FF');
  if (sa > 0) { gameOver(g, t, sa, { y: 64, n: 1 + fl(sa * 9) }); if (sa < .3) fxShake(g, t, 3 * (1 - sa / .3)); }
  snow3(g, t, .6);
}, { in: ['glitch', .4], tag: '战斗' });
/* 103.8 眼泪打转 转不回来：眼泪绕着脑袋转；想倒回去的钟转不回来 */
function bigClock(g, G, x, y, r, ang, o = {}) { disc(g, x, y, r + 3, '#C9A04A'); disc(g, x, y, r, '#FFF7E0'); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; R(g, x + Math.cos(a) * (r - 4) - 1, y + Math.sin(a) * (r - 4) - 1, i % 3 ? 1 : 3, i % 3 ? 1 : 3, '#5A3A20'); } line(g, x, y, x + Math.cos(ang) * (r - 8), y + Math.sin(ang) * (r - 8), '#3A2A30', 2); line(g, x, y, x + Math.cos(ang / 12) * (r - 16), y + Math.sin(ang / 12) * (r - 16), '#3A2A30', 3); disc(g, x, y, 2.5, o.c || '#E0423A'); if (G) soft(G, x, y, r + 14, '#FFE0A0', .35); }
S(103.8, (g, G, t, u) => {
  uiBG(g, t, '#0A0A24', '#241C50'); field(g, 60, 0, 240, 226, '#C8D4FF', (x, y) => { const d = Math.hypot(x - 176, y - 120) / 130; return d > 1 ? 0 : .16 * (1 - d); });
  const cx = 176, cy = 112, drop = (i, front) => { const a = t * 3.2 + i * .785, s = Math.sin(a); if ((s > 0) !== front) return; const x = cx + Math.cos(a) * 78, y = cy + s * 20 - 6; R(g, x - 2, y - 4, 4, 3, '#8FDCFF'); R(g, x - 3, y - 1, 6, 5, '#8FDCFF'); R(g, x - 2, y + 4, 4, 1, '#8FDCFF'); R(g, x - 1, y, 2, 2, '#FFFFFF'); };
  for (let i = 0; i < 8; i++) drop(i, false); chibi(g, cx, 248, 150, HO({ eyes: 'sad', mouth: 'frown', tear: .6 + .3 * Math.sin(t * 5) })); for (let i = 0; i < 8; i++) drop(i, true);
  const back = t < 107.0, fail = t > 108.5, ang = back ? -1.57 - (t - 103.8) * 9 : -1.57 - 3.2 * 9 + eob(sg(t, 107.0, 107.5)) * 3.2 * 9 + (fail ? 0 : Math.sin(t * 30) * .06);
  panel(g, 316, 22, 136, 150, { bg: fail ? '#3A0A18' : '#101A44' }); ptext(g, back ? '回到过去……' : fail ? '读取失败' : '转不回来', 384, 28, fail ? '#FF6A6A' : '#FFFFFF', { align: 'c' }); bigClock(g, G, 384, 98, 40, ang);
  if (back) { for (let i = 0; i < 2; i++) for (let j = 0; j < 5; j++) R(g, 372 + i * 8 + 4 - j, 150 + j, 1, 9 - 2 * j, '#9FE8FF'); ptext(g, '存档 1', 396, 148, '#9FE8FF'); } else { line(g, 370, 148, 398, 166, '#FF3A4A', 3); line(g, 398, 148, 370, 166, '#FF3A4A', 3); }
  if (!back && t < 107.5) fxShake(g, t, 3 * (1 - sg(t, 107.0, 107.5)));
  snowAnim(g, t, 40, 8, { c: '#5A4AA0' });
}, { in: ['dz', .4], tag: '我' });
/* 109.4 你的笑容灿烂：必杀 */
S(109.4, (g, G, t, u) => {
  battleBG(g, G, t, 2, 300, 110); chibi(g, 300, 324, 250, GO({ eyes: 'happy', mouth: 'smile' }));
  for (let i = 0; i < 22; i++) { const tw = Math.sin(t * 5 + i * 1.7); if (tw > 0) sparkle(g, G, 40 + hash(i, 1) * 400, 10 + hash(i, 2) * 190, i % 2 ? '#FFFFFF' : '#FFE9A0', 1 + fl(tw * 4)); }
  ell(g, 70, 204, 16, 3, '#C89A60', .6); chibi(g, 70, 204, 44, HO({ back: 1, arms: 'up' }));
  LYR[20].chars.forEach(c => { const a = t - c[1]; if (a > -.02 && a < .25) fxFlash(g, (1 - a / .25) * .45); });
  banner(g, '必杀　笑 容 灿 烂', sg(u, .05, .3), 22, { bg: '#C8782A', col: '#FFFFFF', s: 2 });
}, { in: ['flash', .3], tag: '战斗' });
/* 112.4 会心一击 -9999 */
S(112.4, (g, G, t, u) => {
  battleBG(g, G, t, 2); boss(g, 350, 196, 110, { eyes: 'happy', mouth: 'smile', rim: '#FFFFFF' });
  field(g, 90, 60, 250, 130, '#FFFFFF', (x, y) => { const tt = (300 - x) / 190; if (tt < 0 || tt > 1) return 0; const cy = 104 + tt * 44, hw = 3 + tt * 18, d = Math.abs(y - cy) / hw; return d < 1 ? (d > .8 ? 1 : .85 * (1 - d * d * .5)) : 0; }); field(G, 90, 60, 250, 130, '#FF9A40', (x, y) => { const tt = (300 - x) / 190; if (tt < 0 || tt > 1) return 0; return Math.abs(y - (104 + tt * 44)) < 3 + tt * 18 ? .9 : 0; });
  const p = sg(u, 0, 1.6), hx = 110 - p * 70, hy = 160 - Math.sin(p * 2.6) * 60; rotBlit(g, chibi(null, 0, 0, 50, HO({ eyes: 'x', mouth: 'o', arms: 'up', wind: 1, buf: 1 })), hx, hy, -u * 7);
  for (let i = 0; i < 3; i++) floatText(g, '-9999', 150 + i * 30, 120 - i * 18, u - i * .25, { col: '#FF3A4A', s: 2, ol: '#FFFFFF', life: 1.2, rise: 24 });
  if (u < 1.4) ptext(g, '会心一击！', 150, 64, '#FFE066', { ol: '#8A3A20', s: blink(u, .12) ? 2 : 1 });
  battleUI(g, t, { hpn: 0, face: { eyes: 'x', mouth: 'o' } }); fxShake(g, t, 5 * (1 - sg(u, 0, .7)));
}, { in: ['flashin', .25], tag: '战斗' });
/* 114.6 GAME OVER → 第 2 周目 */
S(114.0, (g, G, t, u) => {
  up(g, G); scroll(g, G, t, 640, 'night'); const hx = 240, hy = 222; ell(g, hx, hy + 2, 30, 3, '#5C6FA8', .6); rotBlit(g, chibi(null, 0, 0, 50, HO({ eyes: 'x', mouth: 'flat', buf: 1 })), hx, hy - 12, 1.57); const pile = sg(u, 0, 3) * 10; ell(g, hx, hy - 4 - pile / 2, 34, 4 + pile, '#FFFFFF'); ell(g, hx - 10, hy - 2, 22, 3 + pile * .5, '#EEF3FB');
  dn(g, G); snow3(g, t, 1.6); fxTint(g, '#2A0A18', .35 * sg(u, 0, .5));
  const ng = t - 117.2; if (ng < 0) gameOver(g, t, u - .2, { y: 44 }); else { fxGlitch(g, t, 1 - sg(ng, 0, .5)); const q = eob(sg(ng, 0, .3)); R(g, 0, 118 - 30 * q, PW, 60 * q, '#101A44'); R(g, 0, 118 - 30 * q, PW, 1, '#FFFFFF'); R(g, 0, 118 + 30 * q, PW, 1, '#FFFFFF'); if (q > .8) { ptext(g, '第 2 周目', 240, 98, '#FFE066', { align: 'c', s: 3, sh: '#060918' }); for (let i = 0; i < 2; i++) for (let j = 0; j < 7; j++) R(g, 120 + i * 12 + 6 - j, 108 + j, 1, 13 - 2 * j, '#9FE8FF'); } }
}, { in: ['black', .4], tag: '系统' });
