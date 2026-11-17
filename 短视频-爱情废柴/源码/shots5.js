'use strict';
/* shots5.js —— 间奏（191.52~214.22 秒：存档 1 的七段回忆）、第三遍副歌（214.22~261 秒：演唱会、升级、存档）、片尾（到 279.27 秒） */
for (let k = 0; k < 7; k++) S(BAR(118 + 2 * k), (g, G, t, u) => {
  MEMS[k](g, G, t, u * .92 + .1);
  panel(g, 176, 196, 128, 19, { bg: '#3A2A10' }); ptext(g, '读取 存档 1', 240, 199, '#FFE9A0', { align: 'c' }); for (let i = 0; i < 7; i++) R(g, 194 + i * 14, 218, 10, 2, i <= k ? '#FFE066' : '#3A4680');
}, { in: [k === 0 ? 'flash' : ['mosaic', 'flash', 'blinds', 'flash', 'dz', 'glitch'][k - 1], k === 0 ? .5 : .36], nolyr: 1 });

/* ---------- 演唱会 ---------- */
function band(g, G, t) {
  // 鼓手和鼓
  const dx = 296, dy = 196, hit = Math.abs(Math.sin(t * 7.75)); chibi(g, dx, dy - 6, 40, npc(7, { arms: hit > .5 ? 'up' : 'down', eyes: 'happy' })); disc(g, dx, dy - 10, 10, '#C8323C'); disc(g, dx, dy - 10, 7, '#FFF7E6'); R(g, dx - 20, dy - 20, 12, 3, '#E0B85A'); R(g, dx - 15, dy - 17, 1, 17, '#8A8AA8'); R(g, dx + 10, dy - 24, 12, 3, '#E0B85A'); R(g, dx + 15, dy - 21, 1, 21, '#8A8AA8'); R(g, dx - 14, dy - 8, 8, 6, '#5AA0E8'); R(g, dx + 8, dy - 8, 8, 6, '#5AA0E8');
  // 弹键盘的猫
  const kx = 182; R(g, kx - 16, dy - 14, 32, 4, '#2A2438'); for (let i = 0; i < 10; i++) R(g, kx - 15 + i * 3, dy - 13, 2, 2, i % 3 ? '#FFFFFF' : '#1A1420'); R(g, kx - 12, dy - 10, 2, 10, '#5A5A78'); R(g, kx + 10, dy - 10, 2, 10, '#5A5A78'); cat(g, kx - 4, dy - 14 - Math.round(hit * 2), '#F2C94C');
}
function beams(g, G, t, k = 1) { const C = ['#FF6A8A', '#5AE0FF', '#FFE066', '#B48AE8', '#5ADB7A', '#FF9A5A']; for (let i = 0; i < 6; i++) { const lx = 164 + i * 30, a = Math.sin(t * 1.9 + i * 1.3) * .7, c = C[(i + fl(t * 1.23)) % 6]; g.fillStyle = c; for (let d = 6; d < 190; d += 1) { const x = lx + Math.sin(a) * d * (i % 2 ? 1 : -1) * 1.2, y = 104 - d * .55, hw = 1 + d * .05; for (let xx = Math.round(x - hw); xx <= x + hw; xx++) if (y > 0 && bay(xx, Math.round(y)) < .2 * k) g.fillRect(xx, Math.round(y), 1, 1); } soft(G, lx, 104, 8, c, .9 * k); } }
function confetti(g, t, n = 60) { for (let i = 0; i < n; i++) { const y = ((hash(i, 1) * 300 + t * (30 + hash(i, 2) * 40)) % 290) - 10, x = (hash(i, 3) * 480 + Math.sin(t * 3 + i) * 10); R(g, x, y, 2, (i + fl(t * 8)) % 2 ? 1 : 3, BULBS[i % 5]); } }
/* 214.22 为你封麦 只唱你爱：最后一遍，是一场演唱会 */
S(214.22, (g, G, t, u) => {
  stage(g, G, t, { lit: 1, cols: ['#FFE9B0', '#FF9AD8', '#9FE8FF'] }); beams(g, G, t); band(g, G, t);
  const hop = Math.round(Math.abs(Math.sin(t * 7.75)) * 3), hp = person(g, 240, 200 - hop, 46, HO({ arms: 'mic', eyes: 'shut', mouth: blink(t, .27) ? 'o' : 'smile', rim: '#FFF0C0' }), '#5A3422');
  for (let i = 0; i < 8; i++) { const a = ((t * .7 + i * .13) % 1); note(g, G, hp.x + 16 + a * 80 * (i % 2 ? 1 : -1.3) + (i % 2 ? 0 : -30), hp.mouth - a * 90, BULBS[i % 5]); }
  [[217.3, 100, 50, '#FF6A8A'], [217.9, 380, 44, '#5AE0FF'], [218.4, 240, 30, '#FFE066'], [218.9, 60, 70, '#B8FFB0'], [219.4, 420, 76, '#FF9AD8'], [219.9, 150, 36, '#FFFFFF']].forEach(([tt, x, y, c]) => firework(g, G, x, y, t - tt, c, 20, 38));
  crowd(g, G, t, 16, 0, { hop: 1.5 }); confetti(g, t, 40); snow3(g, t, .6);
  hud(g, { hp: .1, hpn: 12, face: { eyes: 'shut', mouth: 'o' } }); weekTag(g, 1000);
  banner(g, '圣诞夜演唱会　开始！', Math.min(sg(u, 0, .25), 1 - sg(u, 2.2, 2.5)), 60, { bg: '#C8782A', s: 1 });
}, { in: ['flash', .5], tag: '演唱会' });
/* 220.5 Goodbye Don't Cry：台下跟着唱 */
S(220.5, (g, G, t, u) => {
  R(g, 0, 0, PW, PH, '#0A0E28'); for (let i = 0; i < 26; i++) { const c = BULBS[i % 5], x = (hash(i, 1) * 520 + t * (6 + i % 4)) % 520 - 20, y = 20 + hash(i, 2) * 120, r = 8 + hash(i, 3) * 16; disc(g, x, y, r, c, .22); soft(G, x, y, r, c, .5); } beams(g, G, t + 9, .6);
  const cs = LYR[37].chars.filter(c => c[0] !== ' '), n = cs.filter(c => t >= c[1] - .05).length, W = ['Goodbye', "Don't", 'Cry'], on = [n > 0, n > 7, n > 11];
  for (let i = 0; i < 9; i++) { const x = 30 + i * 53, hop = Math.round(Math.abs(Math.sin(t * 7.75 + i * .8)) * 6), fy = 214 - hop + (i % 2) * 8, hp = chibi(g, x, fy, 54, npc(i, { eyes: 'happy', mouth: blink(t + i * .07, .27) ? 'o' : 'smile', arms: i % 3 === 0 ? 'up' : 'upR' })), c = BULBS[i % 5]; R(g, hp.hR[0], hp.hR[1] - 12, 2, 13, c); soft(G, hp.hR[0] + 1, hp.hR[1] - 6, 8, c, .9); }
  [[70, 40, 0], [220, 22, 1], [370, 44, 2], [140, 70, 2], [300, 74, 0]].forEach(([x, y, k], i) => { if (!on[k]) return; const a = t - (k === 0 ? cs[0][1] : k === 1 ? cs[7][1] : cs[12][1]) - i * .05, w = tbits(W[k]).w * 2 + 16, yy = y - Math.round((1 - eob(sg(a, 0, .2))) * -10); bubble(g, x - w / 2, yy, w, 30); ptext(g, W[k], x, yy + 3, ['#E0423A', '#3A6AD8', '#2E9060'][k], { align: 'c', s: 2 }); });
  confetti(g, t, 70);
}, { in: ['blinds', .3], tag: '大家' });
/* 223.9 哭个痛快：边唱边哭，这次是笑着的 */
S(223.9, (g, G, t, u) => {
  R(g, 0, 0, PW, PH, '#120A30'); for (let i = 0; i < 20; i++) { const c = BULBS[i % 5], x = hash(i, 1) * 480, y = hash(i, 2) * 200, r = 10 + hash(i, 3) * 20; disc(g, x, y, r, c, .18); soft(G, x, y, r, c, .4); } beams(g, G, t + 3, .8); soft(g, 240, 100, 150, '#FFE9B0', .22);
  const hp = chibi(g, 240, 258, 170, HO({ arms: 'mic', eyes: 'happy', mouth: blink(t, .27) ? 'o' : 'smile', rim: '#FFF0C0' })); tearJets(g, 240, hp.head + 14, t, 3.2, 36);
  for (let i = 0; i < 10; i++) { const x = 20 + i * 50, hop = Math.round(Math.abs(Math.sin(t * 7.75 + i)) * 8), c = BULBS[i % 5]; R(g, x - 4, 232 - hop, 8, 40, npc(i).coat); R(g, x - 5, 226 - hop, 10, 7, '#F9DABF'); R(g, x - 1, 208 - hop, 2, 18, c); soft(G, x, 214 - hop, 9, c, .9); }
  confetti(g, t, 80); for (let i = 0; i < 4; i++) floatText(g, ['痛快 +1', '心 +1', '痛快 +1', '勇气 +1'][i], 100 + (i % 2) * 280, 110 - (i % 2) * 30, u - .2 - i * .6, { col: ['#FFE066', '#FF8AA0', '#FFE066', '#9FE8FF'][i], life: 1.2 });
}, { in: ['flashin', .25], tag: '我' });
/* 227.0 曲终人散 你也走散：散场了，人群里有一顶白帽子回头看了一眼 */
S(227.0, (g, G, t, u) => {
  stage(g, G, t, { lit: 1 - sg(u, .6, 3) }); snowman(g, 372, 226); const ga = t - 230.1;
  person(g, 236, 200, 46, HO({ back: ga < 2.4, eyes: 'r', mouth: 'flat' }), '#5A3422'); if (ga > 2.4) emote(g, 236, 142, '?', t);
  crowd(g, G, t, 16, sg(u, .2, 4.2));
  if (ga > 0) { const turn = ga > 1.7, gx = turn ? 404 + (ga - 1.7) * 44 : 404; person(g, gx, 228, 40, GO({ back: turn, eyes: 'n', mouth: turn ? 'flat' : 'smile', step: turn ? stepOf(t, 0, 5) : 0 })); if (!turn && ga > .4) { for (let i = 0; i < 5; i++) R(g, 372 - i * 9, 204 - i * 1.5, 5, 1, '#FFE9A0'); } }
  snow3(g, t, 1.2); hud(g, { hp: .1, hpn: 12 }); weekTag(g, 1000);
  logPanel(g, [['演唱会 结束了', .5], ['观众 回家了', 1.4], ['？？？ 回头看了一眼', 3.6]].filter(a => u > a[1]).map(a => [a[0], a[0][0] === '？' ? '#FF8AB0' : '#C8D4FF']), 80); party(g, t, { still: 1 });
}, { in: ['dz', .5] });
/* 233.5 我承认我是 爱情里的废柴：承认了，就升级了 */
S(233.5, (g, G, t, u) => {
  uiBG(g, t, '#181030', '#3A2A66'); field(g, 30, 0, 200, 214, '#FFE9B0', (x, y) => { const tt = y / 214, d = Math.abs(x - 124) / (10 + tt * 70); return d > 1 ? 0 : .22 * (1 - d); }); soft(G, 124, 60, 70, '#FFE0A0', .35); ell(g, 124, 214, 60, 7, '#4A3A80');
  const tl = LT(39, 5), up2 = t > tl, hop = up2 ? Math.round(Math.abs(Math.sin((t - tl) * 8)) * 8 * (1 - sg(t, tl, tl + 1.2))) : 0; chibi(g, 124, 214 - hop, 110, HO({ eyes: up2 ? 'happy' : 'shut', mouth: up2 ? 'smile' : 'flat', tear: 1, arms: up2 ? 'up' : 'down' }));
  g.translate(-40, 0); G.translate(-40, 0); panel(g, 244, 16, 208, 196); panel(g, 252, 8, 76, 17, { bg: '#3A2A10' }); ptext(g, '角色情报', 260, 10, '#FFE9A0');
  ptext(g, '承认', 256, 32, '#9FE8FF'); if (t > LT(39, 2)) { ptext(g, '成功', 296, 32, '#7AF0A0'); R(g, 326, 38, 3, 3, '#7AF0A0'); R(g, 329, 35, 3, 6, '#7AF0A0'); R(g, 332, 32, 3, 6, '#7AF0A0'); }
  ptext(g, '经验', 256, 50, '#9FE8FF'); bar(g, 296, 54, 120, sg(t, LT(39, 0), tl), '#FFD54A'); ptext(g, up2 ? 'Lv.2' : 'Lv.1', 444, 50, '#FFE066', { align: 'r' });
  if (up2) { const a = t - tl, b = Math.round((1 - eob(sg(a, 0, .3))) * -30); ptext(g, '升 级 ！', 348, 70 + b, '#FFE066', { align: 'c', s: 3, ol: '#8A3A20' }); ptext(G, '升 级 ！', 348, 70 + b, '#A06020', { align: 'c', s: 3 }); burst(g, G, 348, 90, a, 20, '#FFFFFF', 100); if (a < .3) fxFlash(g, (1 - a / .3) * .5); }
  [['勇气', '0', '0 → 1', 0], ['嘴硬', '99', '99 → 98', .3], ['依赖', '99', '99', .6], ['魅力', '1', '1', .9]].forEach(([s, v0, v, d], i) => { const nw = t > tl + .5 + d; ptext(g, s, 256, 108 + i * 16, '#C8D4FF'); ptext(g, nw ? v : v0, 444, 108 + i * 16, nw && v !== v0 ? '#7AF0A0' : '#FFFFFF', { align: 'r' }); if (nw && v !== v0) burst(g, G, 420, 114 + i * 16, t - tl - .5 - d, 6, '#7AF0A0', 20); });
  const tt = LT(39, 9); if (t > tt) { panel(g, 252, 176, 192, 28, { bg: '#3A2A10' }); ptext(g, '称号', 260, 183, '#FFE9A0'); ptext(g, '爱情里的废柴', 292, 183, '#FFFFFF'); if (t > LT(39, 10)) { tagp(g, 396, 182, '已装备', '#2A5A3A', '#7AF0A0'); burst(g, G, 420, 190, t - LT(39, 10), 10, '#FFE066', 40); } }
  g.translate(40, 0); G.translate(40, 0); for (let i = 0; i < 14; i++) { const a = t * .9 + i * .45; sparkle(g, null, 124 + Math.cos(a) * 80, 110 + Math.sin(a * 1.4) * 90, i % 2 ? '#FFFFFF' : '#FFE9A0', 1 + (i % 2)); } snowAnim(g, t, 40, 8, { c: '#5A4AA0' });
}, { in: ['flash', .3], tag: '我' });
/* 240.0 你的离开 喊得太快：这回用正常速度把那段对话看完 */
S(240.0, (g, G, t, u) => {
  uiBG(g, t); panel(g, 16, 16, 256, 190); panel(g, 24, 8, 76, 17, { bg: '#3A2A10' }); ptext(g, '对话记录', 32, 10, '#FFE9A0'); ptext(g, '×1 正常速度', 262, 22, '#9FE8FF', { align: 'r' });
  const LN = [['你', '我们……分开吧。', .2, GO({ hat: null, eyes: 'sad' }), 0], ['你', '（她等了三秒。）', 1.6, GO({ hat: null, eyes: 'n' }), 1], ['我', '……', 3.0, HO({ eyes: 'dn' }), 0], ['你', '其实只要你开口。', 4.2, GO({ hat: null, eyes: 'sad', mouth: 'frown' }), 1]];
  LN.forEach(([who, s, a0, face, hot], i) => { const a = u - a0; if (a < 0) return; const y = 34 + i * 42; if (hot) R(g, 24, y - 2, 240, 38, 'rgba(255,224,102,.12)'); portrait(g, 30, y + 2, 30, face); ptext(g, who, 68, y + 2, who === '你' ? '#FF8AB0' : '#9FE8FF'); typed(g, s, 68, y + 17, hot ? '#FFE066' : '#FFFFFF', a, 9); });
  // 右边：那天晚上，按正常速度再放一遍
  panel(g, 282, 16, 170, 190, { bg: '#1A1420' }); ptext(g, '回放', 290, 20, '#FFE9A0'); if (blink(t, .8)) disc(g, 330, 26, 3, '#FF3A3A');
  [g, G].forEach(c => { c.save(); c.beginPath(); c.rect(288, 36, 158, 124); c.clip(); c.translate(288 - 150, 36 - 96); }); room(g, G, t);
  const wait = u > 1.6 && u < 4.6, leave = sg(u, 4.9, 6.2), gx = 200 + ei(leave) * 140;
  person(g, gx, 214, 46, GO({ hat: leave > 0 ? '#FFFFFF' : null, eyes: wait ? 'n' : 'sad', mouth: 'flat', back: leave > .1, step: leave > 0 ? stepOf(t, 0, 4) : 0 }), '#3A2A30'); person(g, 262, 214, 46, HO({ eyes: leave > 0 ? 'wide' : 'dn', mouth: leave > 0 ? 'o' : 'flat' }), '#3A2A30');
  if (wait) { const n = Math.min(3, 1 + fl((u - 1.6) / 1)); emote(g, 200, 158, '...', u); ptext(g, String(n), 200, 116, '#FFE066', { align: 'c', s: 2, ol: '#3A2A10' }); } if (u > 3.0 && u < 4.6) emote(g, 262, 158, 'sweat', t);
  [g, G].forEach(c => c.restore()); fxTint(g, '#C89860', .0);
  R(g, 288, 170, 158, 3, '#3A4680'); R(g, 288, 170, 158 * sg(u, 0, 6.3), 3, '#FFE066'); ptext(g, '00:0' + Math.min(6, fl(u)), 444, 180, '#FFFFFF', { align: 'r' });
  if (u > 4.6) tagp(g, 288, 178, '只差一句话', '#4A1020', '#FF8AA0'); else ptext(g, '那天晚上', 290, 180, '#C8D4FF');
  snowAnim(g, t, 30, 8, { c: '#3A4A90' });
}, { in: ['diag', .5], tag: '回看' });
/* 246.4 我的依赖 还在耍赖：围巾丢不掉 */
S(246.4, (g, G, t, u) => {
  uiBG(g, t); panel(g, 30, 22, 250, 176); panel(g, 38, 14, 46, 17, { bg: '#3A2A10' }); ptext(g, '道具', 46, 16, '#FFE9A0');
  const IT = [['mic', ''], [null, ''], ['mug', '9'], ['tear', '99'], ['photo', ''], ['mitt', '']]; IT.forEach(([n, c], i) => slot(g, 44 + (i % 6) * 38, 44, n, { n: c })); for (let i = 0; i < 12; i++) slot(g, 44 + (i % 6) * 38, 74 + fl(i / 6) * 30, null);
  R(g, 372, 110, 44, 56, '#5A6AA0'); R(g, 368, 104, 52, 7, '#8A9AC8'); R(g, 388, 99, 12, 5, '#8A9AC8'); for (let i = 0; i < 3; i++) R(g, 381 + i * 12, 118, 3, 40, '#3A4680'); ptext(g, '丢弃', 394, 172, '#C8D4FF', { align: 'c' });
  const tries = [[.4, 1.9], [3.1, 4.5]]; let sx = 82, sy = 44, msg = -1; tries.forEach(([a, b], k) => { if (u >= a && u < b) { const p = sg(u, a, b - .45), q = sg(u, b - .45, b); if (q <= 0) { sx = lerp(82, 384, ease(p)); sy = lerp(44, 86, ease(p)) - Math.sin(p * 3.14) * 30; } else { sx = lerp(384, 82, eo(q)); sy = lerp(86, 44, eo(q)) - Math.sin(q * 3.14) * 50; msg = k; } } });
  slot(g, sx, sy, 'scarf', { hot: 1 }); if (sx !== 82) { cursor(g, sx - 8, sy + 8, t); } tries.forEach(([a, b], k) => { const m = u - (b - .45); if (m > 0 && m < 1.1) { if (m < .2) fxShake(g, t, 3 * (1 - m / .2)); panel(g, 300, 40, 150, 22, { bg: '#C8203A' }); ptext(g, k ? '重要物品，丢不掉' : '无法丢弃', 375, 44, '#FFFFFF', { align: 'c' }); } });
  R(g, 40, 142, 230, 1, '#3A4A90'); ptext(g, '红围巾', 46, 148, '#FFE066'); ptext(g, '她挑的。无法丢弃。', 46, 164, '#FFFFFF');
  const fin = u > 5.0; panel(g, 300, 68, 150, 22, { bg: fin ? '#2A5A3A' : '#101A44' }); icon(g, 'lock', 304, 71); ptext(g, fin ? '依赖　99 回合' : '依赖　∞ 回合', 320, 72, fin ? '#7AF0A0' : '#B48AE8'); if (fin) burst(g, G, 375, 78, u - 5.0, 12, '#7AF0A0', 50);
  portrait(g, 300, 176, 30, HO({ eyes: msg >= 0 ? 'x' : fin ? 'happy' : 'n', mouth: fin ? 'smile' : 'flat' })); ptext(g, fin ? '算了，留着吧。' : '……', 338, 184, '#FFFFFF');
}, { in: ['blinds', .4], tag: '我' });
/* 252.9 眼泪打转 转不回来：钟往前走，圣诞节过完了 */
S(252.9, (g, G, t, u) => {
  up(g, G); scroll(g, G, t, 2000 + u * 3, 'night');
  const r = rng(11); for (let i = 0; i < 14; i++) { const x = -10 + i * 36, h = 30 + fl(r() * 30), c = ['#1A2248', '#202A56', '#161C40'][i % 3]; if (x > 180 && x < 290) continue; R(g, x, 204 - h, 30, h, c); for (let j = 0; j < 9; j++) R(g, x - 2 + j, 204 - h - 9 + j, 34 - 2 * j, 1, j < 3 ? '#C9D6EE' : dk(c, .2)); for (let k = 0; k < 3; k++) if (r() < .7) { R(g, x + 4 + k * 8, 204 - h + 8, 4, 6, WARM); R(G, x + 4 + k * 8, 204 - h + 8, 4, 6, '#B07020'); } }
  R(g, 204, 60, 72, 150, '#27325F'); R(g, 264, 60, 12, 150, '#1A2248'); for (let j = 0; j < 36; j++) R(g, 240 - fl(j * 1.1) - 1, 24 + j, 2 + 2 * fl(j * 1.1), 1, j < 10 ? '#DCE8FA' : '#3A2A52'); R(g, 239, 10, 2, 14, '#C9D6EE'); R(g, 235, 14, 10, 2, '#C9D6EE'); R(g, 226, 150, 28, 60, '#141C40'); R(g, 230, 156, 20, 54, WARM); R(G, 230, 156, 20, 54, '#8A5A20');
  const tm = LT(42, 4), fwd = sg(t, 253.0, tm + .9), ang = -1.5708 - .52 + ease(fwd) * (.52 + 6.283 * 3), ring = t - (tm + .9); bigClock(g, G, 240, 104, 30, ring > 0 ? -1.5708 : ang, { c: '#E0423A' });
  if (ring > 0) { for (let k = 0; k < 3; k++) { const a = ring - k * .5; if (a > 0 && a < .8) { ptext(g, '当', 150 + k * 16, 80 - k * 14 - a * 10, '#FFE9A0', { s: 2, ol: '#3A2A10' }); disc(g, 240, 104, 34 + a * 40, '#FFE9A0', .12 * (1 - a / .8)); } } if (ring < .3) fxShake(g, t, 2); }
  const hp = person(g, 120, 222, 46, HO({ eyes: ring > 0 ? 'up' : 'sad', mouth: 'flat', tear: ring > 0 ? 0 : 1 })); for (let i = 0; i < 10; i++) { const a = ((t * .35 + i * .1) % 1), x = hp.x + Math.sin(a * 6 + i) * 30 + i * 4 - 20, y = hp.head - a * 150; if (a < .35) { R(g, x, y, 3, 4, '#8FDCFF'); R(g, x + 1, y + 1, 1, 1, '#FFFFFF'); } else icon(g, 'snow', x - 5, y - 5); }
  dn(g, G); snow3(g, t); hud(g, { hp: .1, hpn: 12, lv: 2, face: { eyes: ring > 0 ? 'up' : 'sad' } });
  panel(g, 300, 52, 108, 40); ptext(g, '十二月', 308, 56, '#9FE8FF'); ptext(g, ring > .6 ? '26 日' : '25 日', 400, 62, ring > .6 ? '#FFE066' : '#FFFFFF', { align: 'r', s: 2 }); if (ring > .6 && ring < 1) fxFlash(g, (1 - sg(ring, .6, 1)) * .4);
  if (ring > 1.0) toast(g, '圣诞节　过完了', sg(ring, 1.0, 1.3), { icon: 'clock', x: 240, y: 18, bg: '#102A4A', col: '#C8F0FF' });
}, { in: ['mosaic', .4], tag: '我' });
/* 258.6 你的笑容灿烂：看一眼合照，存档 */
S(258.6, (g, G, t, u) => {
  up(g, G); room(g, G, t); crystal(g, G, t, 236, 150); person(g, 190, 216, 50, HO({ eyes: u > 3.6 ? 'happy' : 'r', mouth: 'smile' }), '#3A2A30');
  dn(g, G); hud(g, { hp: .1, hpn: 12, lv: 2, face: { eyes: 'happy', mouth: 'smile' } });
  const p = eob(sg(u, .05, .4)); if (p > 0) { g.save(); g.translate(0, Math.round((1 - p) * 40)); polaroid(g, G, 286, 30, 120, 100, { cap: '你的笑容' }); R(g, 286, 30, 120, 100, '#3A3670'); vgrad(g, 286, 30, 120, 100, ['#0B1438', '#222E66', '#5A4688']); g.save(); g.beginPath(); g.rect(286, 30, 120, 100); g.clip(); chibi(g, 346, 196, 130, GO({ eyes: 'happy', mouth: 'smile' })); g.restore(); g.restore(); for (let i = 0; i < 8; i++) { const a = t * 1.2 + i * .8; sparkle(g, G, 346 + Math.cos(a) * 76, 84 + Math.sin(a) * 66, i % 2 ? '#FFFFFF' : '#FFE9A0', 1 + (i % 3)); } LYR[43].chars.forEach(c => { const a = t - c[1]; if (a > -.02 && a < .25) fxFlash(g, (1 - a / .25) * .22); }); }
  const sa = u - 2.9; if (sa > 0) { if (popPanel(g, 70, 64, 190, 86, sg(sa, 0, .2))) { g.translate(-50, 0); G.translate(-50, 0); const saved = sa > 1.9; ptext(g, saved ? '已保存。' : sa > .8 ? '保存中……' : '要保存吗？', 215, 70, saved ? '#7AF0A0' : '#FFFFFF', { align: 'c' }); if (sa <= .8) { ptext(g, '是', 176, 86, '#FFE066'); ptext(g, '否', 240, 86, '#5A6AA0'); cursor(g, 164, 89, t); } else bar(g, 150, 90, 130, sg(sa, .8, 1.9), '#5AB8FF'); R(g, 128, 104, 174, 1, '#3A4A90'); portrait(g, 130, 110, 30, HO({ eyes: 'happy', mouth: 'smile' })); ptext(g, '存档 3　一个人', 168, 110, '#FFFFFF'); ptext(g, 'Lv.2　爱情里的废柴', 168, 126, '#FFE066'); if (saved) { burst(g, G, 215, 76, sa - 1.9, 14, '#7AF0A0', 60); heart(g, 290, 112); } } }
}, { in: ['dz', .5], tag: '我' });
/* 265.0 片尾字幕 */
S(265.0, (g, G, t, u) => {
  up(g, G); scroll(g, G, t, 240 + u * 10, 'night'); person(g, 96, 214, 34, HO({ back: 1, sit: 1 })); R(g, 70, 208, 52, 4, '#8A5A38'); R(g, 70, 207, 52, 1, '#FFFFFF'); cat(g, 126, 214); xtree(g, G, 410, 222, 70, 4); dn(g, G); snow3(g, t);
  titleLogo(g, G, 24, [9, 9, 9, .2]);
  const C = [['歌曲', '周杰伦《爱情废柴》', .4], ['词 曲 演唱', '周杰伦', 1.3], ['画面', 'Claude 用代码生成', 2.2], ['', '本片为 AI 生成内容', 3.1]]; C.forEach(([a, b, d], i) => { const p = sg(u, d, d + .4); if (p <= 0) return; g.save(); g.globalAlpha = p; const y = 92 + i * 20; if (a) ptext(g, a, 232, y, '#9FE8FF', { align: 'r', ol: '#0A0E24' }); ptext(g, b, a ? 244 : 240, y, '#FFFFFF', { align: a ? 'l' : 'c', ol: '#0A0E24' }); g.restore(); });
  if (u > 4.2) { const p = eob(sg(u, 4.2, 4.6)); beet(g, 186, 174 + (1 - p) * 20); ptext(g, '甜菜 出品', 214, 178 + (1 - p) * 20, '#FF7AA8', { s: 2, ol: '#1A0A20' }); ptext(G, '甜菜 出品', 214, 178, '#803050', { s: 2 }); }
}, { in: ['black', .8], nolyr: 1 });
/* 271.5 片尾彩蛋：有人请求加入队伍 */
S(271.5, (g, G, t, u) => {
  town(g, G, t, 150); fxTint(g, '#04061A', .74); G.save(); G.globalAlpha = .72; G.fillStyle = '#000'; G.fillRect(0, 0, PW, PH); G.restore(); snowAnim(g, t, 70, 3, { c: '#5A6AB0', sp: 12 }); snowAnim(g, t, 30, 4, { sp: 18 });
  panel(g, 130, 30, 220, 60); ptext(g, '队伍', 140, 34, '#9FE8FF'); portrait(g, 146, 50, 34, HO({ eyes: u > 1.4 ? 'wide' : 'n', mouth: u > 1.4 ? 'o' : 'smile' }), 52); ptext(g, '我　Lv.2', 188, 52, '#FFFFFF'); ptext(g, '爱情里的废柴', 188, 68, '#FFE066');
  const ask = u > 1.1; R(g, 300, 50, 34, 34, ask ? '#2A3A80' : '#0A0E24'); if (ask) { const b = chibi(null, 0, 0, 52, GO({ eyes: 'none', mouth: 'none', blush: 0, skin: '#101A44', hair: '#101A44', coat: '#101A44', scarf: '#101A44', brim: '#FFFFFF', pom: '#FF6A8A', ol: '#101A44', buf: 1 })).canvas; g.drawImage(b, Math.round(b.width / 2 - 17), Math.round(b.height - 2 - 22.4 * 52 / 28 - 17 - 2.8), 34, 34, 300, 50, 34, 34); if (blink(t, .5)) ptext(g, '？', 311, 60, '#FFE066'); } else if (blink(t, 1)) ptext(g, '空', 317, 61, '#5A6AA0', { align: 'c' });
  R(g, 299, 49, 36, 1, '#FFFFFF'); R(g, 299, 84, 36, 1, '#FFFFFF'); R(g, 299, 49, 1, 36, '#FFFFFF'); R(g, 334, 49, 1, 36, '#FFFFFF');
  if (ask) { if (u < 1.5) { fxFlash(g, (1 - sg(u, 1.1, 1.5)) * .5); } dialog(g, u - 1.2, '系统', '？？？ 请求加入队伍。', null, { x: 110, y: 104, w: 260, ncol: '#9FE8FF', cps: 12 }); if (u > 3.0) { panel(g, 190, 152, 100, 26); ptext(g, '是', 216, 158, blink(t, .5) ? '#FFE066' : '#FFFFFF'); ptext(g, '否', 258, 158, '#5A6AA0'); cursor(g, 202, 161, t); } }
  beet(g, 190, 186); ptext(g, '甜菜 出品', 218, 192, '#FF7AA8', { ol: '#1A0A20' }); ptext(g, '画面由 Claude 用代码生成 · AI 生成内容', 240, 222, '#8FA4D8', { align: 'c' });
  fxFlash(g, sg(t, 278.4, 279.2), '#05060F');
}, { in: ['black', .8], nolyr: 1, nomark: 1 });
