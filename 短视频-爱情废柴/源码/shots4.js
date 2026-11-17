'use strict';
/* shots4.js —— 第二遍主歌（118.55~142.87 秒：每句换一种玩法，周目数一路涨）和第二遍副歌（142.87~191.52 秒） */
function weekTag(g, n) { tagp(g, 14, 58, '第 ' + n + ' 周目', '#3A2A10', '#FFE9A0'); }
/* 合照：两个人在圣诞树下。half = 'L' 只有左半张（撕口朝右） */
function photoPic(g, G, x, y, w, h, o = {}) {
  g.save(); g.beginPath(); g.rect(x, y, o.half === 'L' ? w / 2 : w, h); g.clip(); vgrad(g, x, y, w, h, ['#0B1438', '#222E66', '#3A3670']); const r = rng(5); for (let i = 0; i < 20; i++) R(g, x + r() * w, y + r() * h * .6, 1, 1, '#FFFFFF'); R(g, x, y + h - 14, w, 14, '#DCE6F5'); xtree(g, G, x + w * .5, y + h - 8, h * .8, 8); chibi(g, x + w * .3, y + h - 6, h * .46, HO({ eyes: 'happy', mouth: 'smile' })); chibi(g, x + w * .7, y + h - 6, h * .46, GO({ eyes: 'happy', mouth: 'smile' })); g.restore();
}
function polaroid(g, G, x, y, w, h, o = {}) { x = Math.round(x); y = Math.round(y); const fw = o.half ? Math.round(w / 2) : w; R(g, x - 5, y - 5, fw + (o.half ? 5 : 10), h + 26, '#FFFFFF'); R(g, x - 5, y + h + 19, fw + (o.half ? 5 : 10), 2, '#C9D6EE'); photoPic(g, G, x, y, w, h, o); if (o.half) for (let j = -5; j < h + 21; j += 4) { R(g, x + fw, j + y, 2 + ((j / 4) & 1) * 2, 4, '#FFFFFF'); } if (o.cap) ptext(g, o.cap, x + fw / 2, y + h + 5, '#5A4A60', { align: 'c' }); }

/* 118.55 踏着雪 不知不觉走了很远：这回是横版跳台 */
S(118.55, (g, G, t, u) => {
  up(g, G); const x = u * 150; scroll(g, G, t, x, 'dusk');
  const plat = (wx, y, n) => { const sx = Math.round(wx - x); for (let i = 0; i < n; i++) { R(g, sx + i * 16, y, 16, 10, i % 2 ? '#EEF0FF' : '#FFFFFF'); R(g, sx + i * 16, y + 7, 16, 3, '#A898D8'); R(g, sx + i * 16, y, 16, 2, '#FFFFFF'); R(g, sx + i * 16 + 3, y + 10, 2, 3 + (i % 3), '#D8D0F8'); } };
  [[260, 170, 4], [400, 140, 3], [520, 176, 5], [700, 150, 4], [860, 168, 3]].forEach(a => plat(...a));
  const jp = (u * 1.55) % 1, jh = jp < .72 ? Math.sin(jp / .72 * 3.1416) * 44 : 0, hx = 150, hy = 222 - jh;
  for (let i = 0; i < 30; i++) { const wx = 240 + i * 26, sx = wx - x, cy = 190 - Math.abs(Math.sin(i * .7)) * 50; if (sx > hx + 6 && sx < PW + 10) { icon(g, 'snow', sx - 6, cy - 6); soft(G, sx, cy, 6, '#C8F0FF', .6); } else if (sx > hx - 30 && sx <= hx + 6) floatText(g, '+10', sx, cy - 6, (hx + 6 - sx) / 150, { col: '#FFE066', life: .4, rise: 10 }); }
  [[380, 0], [640, 1], [900, 2]].forEach(([wx, k]) => { const sx = wx - x, sq = 1 + Math.sin(t * 9 + k) * .1; ell(g, sx, 222 - 7 * sq, 11, 7 * sq, '#3A8AC8'); ell(g, sx - 2, 222 - 8 * sq, 8, 5 * sq, '#5AB8F0'); R(g, sx - 5, 216, 2, 3, INK); R(g, sx + 2, 216, 2, 3, INK); });
  ell(g, hx, 222, 12 - jh * .1, 2.4, '#8878C0', .6); chibi(g, hx, hy, 40, HO({ step: jh ? 1 : stepOf(t, 0, 9), wind: 1, arms: jh ? 'up' : 'down', mouth: 'smile' })); for (let i = 0; i < 6; i++) R(g, hx - 30 - i * 14 - (t * 200 % 14), hy - 30 + i * 5, 10, 1, '#FFFFFF');
  dn(g, G); snow3(g, t, .8); hud(g, { hp: .1, hpn: 12 }); weekTag(g, 2 + fl(u * 3));
  panel(g, 150, 14, 216, 20, { bg: '#1A1040' }); ptext(g, '得分 ' + String(fl(u * 1234 + 320)).padStart(6, '0'), 158, 17, '#FFFFFF'); icon(g, 'snow', 250, 18); ptext(g, '×' + String(fl(x / 26)).padStart(2, '0'), 264, 17, '#C8F0FF'); ptext(g, String(fl(9000 + x)) + ' 米', 358, 17, '#FFE066', { align: 'r' });
}, { in: ['mosaic', .5] });
/* 121.95 绕着圈 我叛逆点起一根烟：在冰面上一圈圈滑，烟花棒拖出一个光圈 */
function rink() { return cache2('rink', PW, PH, (g, G) => { R(g, 0, 0, PW, PH, '#DCE6F5'); for (let y = 0; y < PH; y += 16) for (let x = 0; x < PW; x += 16) { if (((x + y) / 16) & 1) R(g, x, y, 16, 16, '#D0DCF1'); R(g, x + 3, y + 5, 2, 1, '#FFFFFF'); } ell(g, 240, 122, 206, 96, '#FFFFFF'); ell(g, 240, 122, 198, 90, '#9CC8F0'); ell(g, 240, 122, 190, 84, '#B4D8F8'); const r = rng(3); for (let i = 0; i < 40; i++) { const a = r() * 6.283, d = r() * .9; line(g, 240 + Math.cos(a) * d * 180, 122 + Math.sin(a) * d * 78, 240 + Math.cos(a) * d * 180 + 14, 122 + Math.sin(a) * d * 78 - 4, '#D8ECFF'); } ell(g, 180, 96, 60, 14, '#D0E8FF', .6);[[20, 40], [460, 34], [30, 210], [454, 206], [240, 12], [130, 18], [350, 20]].forEach(([x, y]) => pine(g, x, y + 20, 24));[[60, 100], [420, 110], [240, 226]].forEach(([x, y]) => lamp(g, G, x, y, 30, 0)); lights(g, G, 60, 72, 240, 20, 10, 7, 2); lights(g, G, 240, 20, 420, 82, 10, 7, 4); g.fillStyle = NIGHT; g.fillRect(0, 0, PW, PH); }); }
S(121.95, (g, G, t, u) => {
  put2(g, G, rink()); const a = u * 4.4, P = an => [240 + Math.cos(an) * 128, 122 + Math.sin(an) * 54], lit = t - 123.1;
  for (let k = 0; k < 150; k++) { const an = a - k * .042; if (an < 0) break; const [x, y] = P(an); R(g, x, y, 2, 1, '#FFFFFF'); if (lit > 0 && an > 1.15 * 4.4) { const hot = 1 - k / 150; R(g, x, y - 1, 2, 2, k % 3 ? '#FFE066' : '#FFFFFF'); if (k % 4 === 0) soft(G, x, y, 5, '#FFC850', .5 + hot * .5); } }
  const list = [[0, .5, 60, 30], [1, 2.6, 90, 40]].map(([i, ph, rx, ry]) => { const an = t * .5 + ph, x = 240 + Math.cos(an) * rx, y = 122 + Math.sin(an) * ry; return [y, () => couple(g, t, i + 5, x, y, 24, { still: 1 })]; });
  const [hx, hy] = P(a); list.push([hy, () => { const hp = person(g, hx, hy, 30, HO({ arms: lit > 0 ? 'upR' : 'down', wind: 1, mouth: lit > 0 ? 'smile' : 'flat', step: 1 })); if (lit > 0) { const f = fl(t * 30), tx = hp.hR[0], ty = hp.hR[1] - 10; R(g, tx, ty, 1, 10, '#8A8AA8'); for (let i = 0; i < 12; i++) { const an = hash(f, i) * 6.283, d = 2 + hash(f, i + 9) * 10; R(g, tx + Math.cos(an) * d, ty + Math.sin(an) * d, 1, 1, i % 2 ? '#FFFFFF' : '#FFE066'); } soft(G, tx, ty, 18, '#FFD060', 1); } }]); ysort(list);
  snow3(g, t); hud(g, { hp: .1, hpn: 12, face: { mouth: lit > 0 ? 'smile' : 'flat' } }); weekTag(g, 37 + fl(u * 30)); stepsPanel(g, 37 + fl(u * 1.4), '圈数', 78);
  if (lit > 0) itemGet(g, G, lit, 'spark', '烟花棒', { y: 16, label: '使用' });
}, { in: ['flashin', .2] });
/* 125.3 一整天 我旋律哼了一千遍：音游，连击数跳到 1000 */
S(125.3, (g, G, t, u) => {
  uiBG(g, t, '#140A2E', '#3A1A60'); const LX = 168, LW = 36, HIT = 196, cols = ['#FF6A8A', '#FFE066', '#5ADB7A', '#5AB8FF'];
  for (let i = 0; i < 24; i++) { const h = 10 + Math.abs(Math.sin(t * 7.75 + i * .9)) * 46; R(g, 8 + i * 6, 214 - h, 4, h, i % 2 ? '#5A2A8A' : '#7A3AA8'); R(g, 334 + i * 6, 214 - h, 4, h, i % 2 ? '#5A2A8A' : '#7A3AA8'); } for (let i = 0; i < 5; i++) { const a = ((t * .5 + i * .2) % 1); icon(g, 'note', 330 + i * 24, 190 - a * 80); }
  R(g, LX - 3, 0, LW * 4 + 6, 216, '#0A0618'); for (let k = 0; k < 4; k++) { R(g, LX + k * LW, 0, LW - 1, 216, k % 2 ? '#1A1038' : '#140C30'); R(g, LX + k * LW + 2, HIT, LW - 5, 8, dk(cols[k], .4)); } R(g, LX - 3, HIT - 2, LW * 4 + 6, 2, '#FFFFFF');
  const step = BEAT / 2, n0 = Math.floor((t - 1.2) / step); for (let n = n0; n < n0 + 12; n++) { const tn = n * step + .17, k = fl(hash(n, 4) * 4), y = HIT - (tn - t) * 170; if (y < -10) continue; if (y <= HIT) { R(g, LX + k * LW + 2, y, LW - 5, 8, cols[k]); R(g, LX + k * LW + 2, y, LW - 5, 2, lt(cols[k], .5)); soft(G, LX + k * LW + LW / 2, y + 4, 12, cols[k], .5); } else { const a = (t - tn) / .25; if (a < 1) { R(g, LX + k * LW - a * 6, HIT - a * 6, LW + a * 12, 1, '#FFFFFF'); R(g, LX + k * LW - a * 6, HIT + 8 + a * 6, LW + a * 12, 1, '#FFFFFF'); soft(G, LX + k * LW + LW / 2, HIT + 4, 20, cols[k], 1 - a); ptext(g, '完美', LX + k * LW + LW / 2, HIT - 20 - a * 10, '#FFE066', { align: 'c', ol: '#3A1A60' }); } } }
  const hp = chibi(g, 84, 196, 70, HO({ eyes: 'shut', mouth: blink(t, .27) ? 'o' : 'smile' })); R(g, 84 - 22, hp.head - 26, 44, 4, '#2A2438'); R(g, 84 - 25, hp.head - 8, 6, 14, '#E0423A'); R(g, 84 + 19, hp.head - 8, 6, 14, '#E0423A'); for (let i = 0; i < 4; i++) { const a = ((t * .9 + i * .25) % 1); note(g, G, 110 + a * 30 + i * 5, hp.mouth - a * 70, cols[i]); }
  const sung = LYR[23].chars.filter(c => c[0] !== ' ').filter(c => t >= c[1] - .05).length, combo = 989 + sung, full = sung >= 11;
  panel(g, 320, 20, 96, 66, { bg: full ? '#3A2A10' : '#101A44' }); ptext(g, '连击', 328, 24, '#9FE8FF'); ptext(g, String(combo), 408, 36, full ? '#FFE066' : '#FFFFFF', { align: 'r', s: 3, sh: '#060A24' }); if (full) { burst(g, G, 368, 52, t - LT(23, 10), 18, '#FFE066', 80); ptext(g, '全 连 ！', 368, 90, '#FFE066', { align: 'c', s: 2, ol: '#8A3A20' }); }
  hud(g, { hp: .1, hpn: 12, face: { eyes: 'shut', mouth: 'o' } }); weekTag(g, 365);
}, { in: ['blinds', .3] });
/* 128.7 千遍一律我不醉不归：一个人的 KTV，点歌单上全是同一首 */
S(128.7, (g, G, t, u) => {
  up(g, G); ktv(g, G, t); const L = LYR[24];
  ptext(g, '已点 1000 首', 162, 40, '#9FE8FF'); for (let i = 0; i < 3; i++) ptext(g, (i + 1) + '. 爱情废柴', 162, 54 + i * 13, i ? '#6A7CC8' : '#FFFFFF'); R(g, 250, 40, 70, 44, '#0A0E24'); chibi(g, 285, 96, 34, HO({ arms: 'mic', mouth: 'o' }));
  let px = 240 - tbits(L.text).w / 2; for (const [c, ct] of L.chars) { ptext(g, c, px, 106, t >= ct - .05 ? '#FFE066' : '#FFFFFF', { ol: '#0A0E24' }); px += tbits(c).w; } R(g, 162, 122, 156 * sg(t, L.t0, L.t1), 3, '#FF5A8A'); R(g, 162 + 156 * sg(t, L.t0, L.t1), 122, 156 * (1 - sg(t, L.t0, L.t1)), 3, '#3A4680');
  const hop = Math.round(Math.abs(Math.sin(t * 7.75)) * 4), hp = chibi(g, 240, 184 - hop, 54, HO({ arms: 'mic', eyes: 'shut', mouth: blink(t, .27) ? 'o' : 'smile', blush: 1, rim: '#FF9AD8' }));
  [[70, '空位'], [150, '空位'], [330, '空位'], [410, '空位']].forEach(([x, s]) => { for (let i = 0; i < 9; i++) if ((i + fl(t * 3)) % 2) R(g, x - 12 + i * 3, 150, 2, 1, '#C05A7A'); ptext(g, s, x, 154, '#C05A7A', { align: 'c' }); });
  for (let i = 0; i < 5; i++) { const a = ((t * .8 + i * .2) % 1); note(g, G, 262 + a * 40 + i * 6, hp.mouth - a * 60, BULBS[i]); }
  dn(g, G); hud(g, { hp: .1, hpn: 12, face: { eyes: 'shut', mouth: 'o' } }); weekTag(g, 999);
  if (u > 2.3) { const p = eob(sg(u, 2.3, 2.6)); panel(g, 312, 60 + (1 - p) * 20, 100, 44, { bg: '#3A2A10' }); ptext(g, '评分', 320, 64, '#FFE9A0'); ptext(g, '100', 404, 72, '#FFE066', { align: 'r', s: 2 }); ptext(g, '没人听见', 320, 88, '#C8D4FF'); }
}, { in: ['flashin', .2] });
/* 132.5 没有你的冬天：日历一页页翻，翻到哪页都是冬天 */
S(132.5, (g, G, t, u) => {
  up(g, G); scroll(g, G, t, 1200 + u * 16, 'night'); xtree(g, G, 420 - u * 16, 224, 60, 3); snowman(g, 120 - u * 16 + 80, 224);
  for (let i = 0; i < 16; i++) R(g, 60 + i * 13 - (u * 16 % 13), 226 + (i % 2) * 3, 4, 1, '#7F93C6'); person(g, 250, 224, 40, HO({ step: stepOf(t, 0, 3), eyes: 'dn', snow: 1 }));
  dn(g, G); snow3(g, t, 1.3); hud(g, { hp: .1, hpn: 12, face: { eyes: 'sad' } }); weekTag(g, 999);
  const pg = fl(u / .55), fl2 = (u / .55) % 1, M = ['12 月', '1 月', '2 月', '3 月', '4 月', '5 月', '6 月', '7 月', '8 月'], page = (x, y, k, a = 1) => { g.save(); g.globalAlpha = a; R(g, x, y, 84, 92, '#FFF7E6'); R(g, x, y, 84, 20, '#C8323C'); R(g, x + 14, y - 4, 4, 9, '#8A8AA8'); R(g, x + 66, y - 4, 4, 9, '#8A8AA8'); ptext(g, M[k % 9], x + 42, y + 4, '#FFFFFF', { align: 'c' }); ptext(g, '冬', x + 42, y + 30, '#3A5AA8', { align: 'c', s: 3 }); icon(g, 'snow', x + 8, y + 74); ptext(g, '-9 度', x + 76, y + 74, '#5A6AA0', { align: 'r' }); g.restore(); };
  page(316, 64, pg + 1); page(316 + fl2 * 40, 64 - ease(fl2) * 70, pg, 1 - fl2);
  panel(g, 12, 80, 128, 34); ['春', '夏', '秋', '冬'].forEach((s, i) => { ptext(g, s, 20 + i * 28, 90, i === 3 ? '#C8F0FF' : '#3A4680'); }); const jit = Math.round(Math.sin(t * 20) * 1.2); R(g, 20 + 3 * 28 + 2 + jit, 84, 7, 2, '#FFE066'); R(g, 20 + 3 * 28 + 4 + jit, 86, 3, 2, '#FFE066'); ptext(g, '卡住了', 132, 103, '#FF8AA0', { align: 'r' });
}, { in: ['dz', .5] });
/* 137.3 我会一直唱着唱着：四个地方，一格格亮起来 */
S(137.3, (g, G, t, u) => {
  uiBG(g, t, '#141A48', '#2A2F70'); const T4 = [LT(26, 0), LT(26, 2), LT(26, 4), LT(26, 6)];
  [['dusk', 300, 0], ['night', 900, 1], ['summer', 500, 2], ['night', 60, 3]].forEach(([pn, sx, k]) => {
    const px = 8 + (k % 2) * 236, py = 14 + fl(k / 2) * 104, on = t >= T4[k] - .05; g.save(); G.save(); g.beginPath(); g.rect(px, py, 228, 98); g.clip(); G.beginPath(); G.rect(px, py, 228, 98); G.clip(); g.translate(px - 120, py - 138); G.translate(px - 120, py - 138);
    scroll(g, G, t, sx + u * 6, pn);
    if (k === 0) { R(g, 100, 204, 300, 60, '#2A1A48'); R(g, 100, 204, 300, 3, '#FFFFFF'); R(g, 300, 160, 2, 44, '#2A1A48'); R(g, 292, 168, 18, 2, '#2A1A48'); R(g, 150, 180, 30, 24, '#3A2060'); R(g, 148, 176, 34, 5, '#FFFFFF'); }
    if (k === 1) { R(g, 290, 150, 3, 60, '#141A33'); disc(g, 291, 148, 9, '#5AB8FF'); ptext(g, '站', 286, 142, '#FFFFFF'); R(g, 150, 160, 110, 4, '#3A4A80'); R(g, 150, 159, 110, 1, '#FFFFFF'); R(g, 152, 164, 3, 46, '#27325F'); R(g, 255, 164, 3, 46, '#27325F'); R(g, 166, 196, 60, 4, '#8A5A38'); }
    if (k === 2) { for (let x = 100; x < 360; x++) { const y = 206 - Math.sin((x - 100) / 260 * 3.1416) * 22; R(g, x, y, 1, 4, '#8A6AA8'); if (x % 14 === 0) R(g, x, y - 12, 1, 12, '#5A4A90'); R(g, x, y - 13, 1, 1, '#C8B0F0'); } R(g, 100, 208, 260, 60, '#2A3A70'); }
    if (k === 3) { pine(g, 180, 212, 40); pine(g, 330, 210, 30); }
    const hx = 240, hy = k === 2 ? 186 : k === 0 ? 204 : 212; person(g, hx, hy, 36, HO({ arms: 'mic', eyes: on ? 'shut' : 'dn', mouth: on && blink(t + k * .1, .27) ? 'o' : 'flat', wind: 1 }));
    if (on) for (let i = 0; i < 4; i++) { const a = ((t * .9 + i * .25 + k * .13) % 1); note(g, G, hx + 14 + a * 36 + i * 4, hy - 30 - a * 50, BULBS[(i + k) % 5]); }
    g.restore(); G.restore(); snowAnim(g, t, 0, 1, {}); if (!on) { g.fillStyle = 'rgba(5,6,15,.62)'; g.fillRect(px, py, 228, 98); G.save(); G.globalAlpha = .7; G.fillStyle = '#000'; G.fillRect(px, py, 228, 98); G.restore(); } else if (t - T4[k] < .2) { g.fillStyle = `rgba(255,255,255,${.6 * (1 - (t - T4[k]) / .2)})`; g.fillRect(px, py, 228, 98); }
    R(g, px - 2, py - 2, 232, 2, '#FFFFFF'); R(g, px - 2, py + 98, 232, 2, '#FFFFFF'); R(g, px - 2, py, 2, 98, '#FFFFFF'); R(g, px + 228, py, 2, 98, '#FFFFFF'); tagp(g, px + 4, py + 4, ['屋顶', '车站', '桥上', '雪地'][k], '#101A44', '#C8D4FF');
  });
  snow3(g, t, .8);
}, { in: ['flashin', .2] });
/* 140.6 直到你出现：道具栏里那半张合照亮了 */
S(140.6, (g, G, t, u) => {
  uiBG(g, t); panel(g, 30, 22, 250, 176); panel(g, 38, 14, 46, 17, { bg: '#3A2A10' }); ptext(g, '道具', 46, 16, '#FFE9A0');
  const IT = [['mic', ''], ['scarf', ''], ['spark', '0'], ['mug', '9'], ['tear', '99'], ['half', '']]; IT.forEach(([n, c], i) => slot(g, 44 + (i % 6) * 38, 44, n, { hot: i === 5, n: c })); for (let i = 0; i < 12; i++) slot(g, 44 + (i % 6) * 38, 74 + fl(i / 6) * 30, null);
  const ci = Math.min(5, fl(u / .1)); R(g, 42 + ci * 38, 42, 24, 2, '#FFE066'); R(g, 42 + ci * 38, 64, 24, 2, '#FFE066'); R(g, 42 + ci * 38, 42, 2, 24, '#FFE066'); R(g, 64 + ci * 38, 42, 2, 24, '#FFE066'); soft(G, 244, 54, 16 + Math.sin(t * 6) * 3, '#FFD54A', .8);
  R(g, 40, 142, 230, 1, '#3A4A90'); ptext(g, '半张合照', 46, 148, '#FFE066'); typed(g, '另一半，在某个人那里。', 46, 164, '#FFFFFF', u - .6, 16);
  panel(g, 296, 22, 156, 176, { bg: '#1A1420' }); polaroid(g, G, 320, 44, 150, 110, { half: 'L' }); if (blink(t, .6)) ptext(g, '？', 414, 80, '#FFE066', { s: 3, ol: '#3A2A10' }); soft(G, 420, 100, 30, '#FFD54A', .4 + .3 * Math.sin(t * 5));
  if (u > 1.5) { ptext(g, '！', 386, 20, '#FF5A6A', { s: 2, ol: '#FFFFFF' }); }
}, { in: ['iris', .4], tag: '系统' });

/* ================= 第二遍副歌 ================= */
/* 142.87 为你封麦（轻）：卧室，对着录音机唱 */
S(142.87, (g, G, t, u) => {
  up(g, G); room(g, G, t); crystal(g, G, t, 236, 150);
  const hp = person(g, 330, 214, 50, HO({ sit: 1, arms: 'mic', eyes: 'shut', mouth: blink(t, .32) ? 'o' : 'flat' }), '#3A2A30');
  if (blink(t, .8)) { R(g, 89, 141, 4, 2, '#FF3A3A'); soft(G, 91, 142, 6, '#FF3030', 1); } const sp = t * 3; for (const cx of [84, 98]) { R(g, cx + Math.round(Math.cos(sp) * 2), 144 + Math.round(Math.sin(sp) * 2), 1, 1, '#FFFFFF'); }
  for (let i = 0; i < 5; i++) { const a = ((t * .35 + i * .2) % 1); note(g, G, lerp(hp.x - 14, 110, a), hp.mouth - 10 - Math.sin(a * 3.14) * 40, ['#FFE066', '#FFFFFF', '#FF9AD8'][i % 3]); }
  dn(g, G); hud(g, { hp: .1, hpn: 12, face: { eyes: 'shut', mouth: 'o' } }); party(g, t);
  tagp(g, 28, 96, '录音中　给你 第 1000 卷', '#3A2A10', '#FFE9A0'); fxTint(g, '#101A60', .12);
}, { in: ['black', .7] });
/* 146.0 只唱你爱：麦克风被封印，只能对一个人用 */
S(146.0, (g, G, t, u) => {
  uiBG(g, t, '#1A1020', '#3A2030'); soft(g, 150, 110, 150, '#FFB45A', .25); soft(G, 150, 120, 110, '#FF9A40', .3);
  chibi(g, 150, 262, 150, HO({ arms: 'mic', eyes: 'shut', mouth: blink(t, .32) ? 'o' : 'smile', rim: '#FFD9A0' }));
  g.translate(-40, 0); G.translate(-40, 0); panel(g, 286, 24, 166, 150); panel(g, 294, 16, 46, 17, { bg: '#3A2A10' }); ptext(g, '装备', 302, 18, '#FFE9A0'); slot(g, 298, 44, 'mic', { hot: 1 }); ptext(g, '麦克风', 326, 48, '#FFFFFF');
  ptext(g, '状态', 298, 76, '#9FE8FF'); ptext(g, '对象', 298, 94, '#9FE8FF'); ptext(g, '效果', 298, 112, '#9FE8FF');
  const s1 = t - LT(28, 4); if (s1 > 0) { ptext(g, '已封印', 334, 76, '#FF8AA0'); icon(g, 'lock', 376, 74); } if (t > LT(28, 5)) ptext(g, '只有「你」', 334, 94, '#FFFFFF'); if (t > LT(28, 7)) ptext(g, '只唱你爱听的', 334, 112, '#FFE066');
  if (s1 > 0 && s1 < 1.2) { const k = s1 < .12 ? 3 : 2; disc(g, 420, 148, 20, '#C8203A'); disc(g, 420, 148, 17, '#FFF7E6'); ptext(g, '封', 420 - 6 * k, 148 - 6 * k, '#C8203A', { s: k }); burst(g, G, 420, 148, s1, 10, '#FF8AA0', 40); if (s1 < .25) fxShake(g, t, 3 * (1 - s1 / .25)); } else if (s1 >= 1.2) { disc(g, 420, 148, 20, '#C8203A'); disc(g, 420, 148, 17, '#FFF7E6'); ptext(g, '封', 408, 136, '#C8203A', { s: 2 }); }
  g.translate(40, 0); G.translate(40, 0); for (let i = 0; i < 5; i++) { const a = ((t * .4 + i * .2) % 1); note(g, G, 190 + a * 50 + i * 4, 150 - a * 110, ['#FFE066', '#FFFFFF', '#FF9AD8'][i % 3]); } snowAnim(g, t, 30, 8, { c: '#6A4A50' });
}, { in: ['dz', .5], tag: '我' });
/* 149.1 Goodbye Don't Cry：信箱里她最后那封信 */
S(149.1, (g, G, t, u) => {
  uiBG(g, t); panel(g, 60, 16, 360, 190); panel(g, 68, 8, 60, 17, { bg: '#3A2A10' }); icon(g, 'mail', 72, 10); ptext(g, '信箱', 88, 10, '#FFE9A0'); ptext(g, '未读 1', 410, 22, '#FF8AA0', { align: 'r' });
  const p = eob(sg(u, .05, .4)), py = 40 + (1 - p) * 60; panel(g, 86, py, 220, 150, { bg: '#F4EAD8', bd: '#C9B8A0' }); ptext(g, '发件人　你', 96, py + 8, '#8A5A48'); R(g, 96, py + 24, 200, 1, '#C9B8A0');
  const cs = LYR[29].chars.filter(c => c[0] !== ' '), n = cs.filter(c => t >= c[1] - .05).length; ptext(g, 'Goodbye'.slice(0, Math.min(7, n)) + (n >= 7 ? '.' : ''), 100, py + 36, '#3A2030', { s: 2 }); if (n > 7) ptext(g, "Don't Cry".slice(0, n - 7 + (n > 10 ? 1 : 0) + (n > 11 ? 1 : 0)) + (n >= 15 ? '.' : ''), 100, py + 68, '#3A2030', { s: 2 });
  if (t > 151.6) { ptext(g, '—— 你', 290, py + 104, '#8A5A48', { align: 'r' }); ptext(g, '附件　手套（左）', 100, py + 126, '#8A5A48'); icon(g, 'mitt', 196, py + 124); }
  portrait(g, 330, 60, 70, HO({ eyes: 'sad', mouth: 'frown', tear: n > 7 ? .8 : 0 }), 110); ptext(g, '我', 365, 136, '#FFFFFF', { align: 'c' }); if (n > 9) emote(g, 365, 62, '...', t);
  snowAnim(g, t, 30, 8, { c: '#3A4A90' });
}, { in: ['diag', .5], tag: '来信' });
/* 152.4 哭个痛快：眼泪接了一罐 */
S(152.4, (g, G, t, u) => {
  up(g, G); room(g, G, t); crystal(g, G, t, 150, 150);
  const hp = person(g, 250, 224, 60, HO({ sit: 1, arms: 'up', eyes: 'shut', mouth: 'o', tear: 1.2 }), '#3A2A30'); tearJets(g, hp.x, hp.head + 5, t, 1.4, 22);
  const lv = sg(u, 0, 2.6); [[190, 0], [310, 1]].forEach(([jx]) => { R(g, jx - 9, 204, 18, 22, '#C8F0FF'); R(g, jx - 7, 206, 14, 18, '#101A44'); R(g, jx - 7, 224 - 18 * lv, 14, 18 * lv, '#5AB8FF'); R(g, jx - 7, 224 - 18 * lv, 14, 1, '#FFFFFF'); R(g, jx - 10, 201, 20, 3, '#8A8AA8'); });
  dn(g, G); hud(g, { hp: .1, hpn: 12, face: { eyes: 'shut', mouth: 'o' } }); party(g, t);
  itemGet(g, G, u - .2, 'tear', '眼泪 ×' + Math.round(1 + 98 * lv), { y: 60 }); if (u > 1.6) toast(g, '技能升级：哭个痛快 满级', sg(u, 1.6, 1.9), { icon: 'star', x: 250 });
}, { in: ['mosaic', .3] });
/* 155.6 曲终人散 你也走散：大地图上，大家各走各的，她坐船走了 */
S(155.6, (g, G, t, u) => {
  const P = [[130, 244], [320, 284], [330, 220], [470, 194], [610, 220], [660, 262], [800, 204], [860, 196]], q = sg(u, .2, 5.6) * (P.length - 1), k = Math.min(P.length - 2, fl(q)), f = q - k, gx = lerp(P[k][0], P[k + 1][0], f), gy = lerp(P[k][1], P[k + 1][1], f);
  const [cx, cy] = world(g, G, t, gx + 20, gy - 4);
  for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283 + .4, d = 16 + sg(u, 0, 5) * (110 + i * 12), x = 130 + Math.cos(a) * d - cx, y = 244 + Math.sin(a) * d * .6 - cy; for (let j = 0; j < d; j += 7) R(g, 130 + Math.cos(a) * j - cx, 244 + Math.sin(a) * j * .6 - cy, 2, 1, '#6A7CB0'); mini(g, x - 3, y, npc(i)); }
  for (let j = 0; j <= q * 14; j++) { const kk = Math.min(P.length - 2, fl(j / 14)), ff = j / 14 - kk; R(g, lerp(P[kk][0], P[kk + 1][0], ff) - cx, lerp(P[kk][1], P[kk + 1][1], ff) - cy + (j % 2), 2, 1, '#F08AB0'); }
  const boat = t > 160.2; if (boat) { const bx = gx - cx + 8, by = gy - cy + 4 + Math.round(Math.sin(t * 3)); R(g, bx - 16, by, 32, 8, '#8A5A38'); R(g, bx - 12, by + 8, 24, 3, '#6A4028'); R(g, bx, by - 22, 2, 22, '#5A3422'); for (let j = 0; j < 16; j++) R(g, bx + 2, by - 20 + j, 14 - j * .8, 1, '#FFFFFF'); for (let i = 0; i < 5; i++) R(g, bx - 22 - i * 8, by + 8 + (i % 2), 5, 1, '#D8ECFF'); }
  person(g, gx - cx, gy - cy + (boat ? 2 : 0), 24, GO({ back: 1, step: boat ? 0 : stepOf(t, 0, 6) })); snow3(g, t);
  hud(g, { hp: .1, hpn: 12, face: { eyes: 'sad' } }); party(g, t, { still: 1 });
  logPanel(g, [['乐队 解散了', .4], ['观众 回家了', 1.2], ['「你」去了北港', 3.4], ['「你」离开了地图', 5.2]].filter(a => u > a[1]).map(a => [a[0], a[0][0] === '「' ? '#FF8AB0' : '#C8D4FF']));
  panel(g, 372, 52, 80, 54); g.drawImage(worldMap().p, 0, 0, WM_W, WM_H, 376, 56, 72, 46); if (blink(t, .4)) R(g, 376 + 130 / WM_W * 72 - 1, 56 + 244 / WM_H * 46 - 1, 3, 3, '#FFE066'); R(g, 376 + gx / WM_W * 72 - 1, 56 + gy / WM_H * 46 - 1, 3, 3, '#FF8AB0');
}, { in: ['flashin', .35] });
/* 162.1 我承认我是 爱情里的废柴：第二形态，打什么都是会心一击 */
S(162.1, (g, G, t, u) => {
  battleBG(g, G, t, 1); const t1 = LT(31, 9), t2 = LT(31, 10);
  boss(g, 350, 196, 110, { eyes: 'happy', mouth: 'smile', rim: '#C8F0FF' });
  field(g, 90, 60, 250, 130, '#FFFFFF', (x, y) => { const tt = (300 - x) / 190; if (tt < 0 || tt > 1) return 0; const cy = 104 + tt * 44, hw = 3 + tt * 16, d = Math.abs(y - cy) / hw; return d < 1 ? .8 * (1 - d * d) : 0; }); field(G, 90, 60, 250, 130, '#5AB8FF', (x, y) => { const tt = (300 - x) / 190; if (tt < 0 || tt > 1) return 0; return Math.abs(y - (104 + tt * 44)) < 3 + tt * 16 ? .9 : 0; });
  ell(g, 104, 198, 20, 4, '#4A6AA8', .7); rotBlit(g, chibi(null, 0, 0, 50, HO({ eyes: 'shut', mouth: 'o', tear: 1.2, arms: 'mic', wind: 1, buf: 1 })), 100 + Math.round(Math.sin(t * 30)), 158, -.22);
  for (let i = 0; i < 4; i++) floatText(g, '-9999', 96 + (i % 2) * 30, 96 - (i % 2) * 14, (u - .3 - i * 1.4), { col: '#FF3A4A', s: 2, ol: '#FFFFFF', life: 1.2, rise: 20 }); if (blink(u, .5)) ptext(g, '会心一击！', 66, 80, '#FFE066', { ol: '#102A60' });
  menu(g, 150, 150, 86, ['唱歌', '耍赖', '哭个痛快', { s: '逃跑', off: 1 }], fl(u * 1.5) % 3, { t });
  [[t1, '废', 176], [t2, '柴', 244]].forEach(([tt, c, x]) => { const a = t - tt + .05; if (a < 0) return; const k = a < .12 ? 5 : 4; ptext(g, c, x - (k - 4) * 6, 58 - (a < .12 ? 8 : 0), '#FFE066', { s: k, ol: '#102A60', sh: '#8A5A10' }); ptext(G, c, x, 58, '#806010', { s: 4 }); burst(g, G, x + 24, 82, a, 12, '#FFFFFF', 50); if (a < .3) { fxShake(g, t, 5 * (1 - a / .3)); fxFlash(g, (1 - a / .2) * .45); } });
  battleUI(g, t, { hpn: 1, face: { eyes: 'shut', mouth: 'o' } }); tagp(g, 14, 58, '第二形态', '#102A4A', '#9FE8FF'); snow3(g, t, .6);
}, { in: ['swirl', .6], tag: '战斗' });
/* 168.6 你的离开 喊得太快：她的速度是 999，还没轮到他就逃走了 */
S(168.6, (g, G, t, u) => {
  battleBG(g, G, t, 1); const go = t - 171.9, bx = go > 0 ? 350 + ei(sg(go, 0, .5)) * 300 : 350;
  if (go > 0 && go < .8) { for (let k = 5; k > 0; k--) { g.save(); g.globalAlpha = .1 * k; chibi(g, bx - k * 30, 196, 110, GO({ back: 1 })); g.restore(); } for (let i = 0; i < 14; i++) R(g, 200 + hash(i, 1) * 280, 70 + i * 9, 40 + hash(i, 2) * 80, 1, '#FFFFFF'); }
  if (bx < 560) boss(g, bx, 196, 110, go > 0 ? { back: 1, step: stepOf(t, 0, 14) } : { eyes: 'n', mouth: 'flat', arms: blink(t, .5) ? 'upR' : 'down' });
  const hp = bhero(g, 110, 200, 46, { eyes: go > 0 ? 'wide' : 'n', mouth: go > 0 ? 'o' : 'flat', arms: go > .15 ? 'upR' : 'down' }); if (go > .5) floatText(g, 'MISS', 150, 150, go - .5, { col: '#C8D4FF', ol: '#102A60', life: 1 });
  panel(g, 196, 48, 216, 26); ptext(g, '行动顺序', 202, 52, '#9FE8FF'); ['你', '你', '你', '我'].forEach((s, i) => { const hot = go < 0 && i === Math.min(2, fl(u * 1.2)); panel(g, 262 + i * 34, 50, 28, 21, { bg: i < 3 ? (hot ? '#C8205A' : '#40102A') : '#101A44' }); ptext(g, s, 276 + i * 34, 54, i < 3 ? '#FF8AB0' : '#5A6AA0', { align: 'c' }); });
  ptext(g, '速度 999', 404, 78, '#FF8AB0', { align: 'r', ol: '#0A1238' }); ptext(g, '速度 1', 120, 140, '#9FE8FF', { align: 'c', ol: '#0A1238' });
  if (go < 0) banner(g, '你的笑容 使用了「离开」', sg(u, .1, .35), 92); else banner(g, '你的笑容 逃走了！', sg(go, .4, .65), 92, { bg: '#102A4A', col: '#C8F0FF' });
  menu(g, 150, 136, 86, [{ s: '挽留', off: 1 }, { s: '道歉', off: 1 }, { s: '说点什么', off: 1 }], -1, { t }); ptext(g, '来不及行动', 193, 180, '#FF8AA0', { align: 'c', ol: '#0A1238' });
  battleUI(g, t, { hpn: 1, face: { eyes: go > 0 ? 'wide' : 'n', mouth: 'o' } }); snow3(g, t, .6);
}, { tag: '战斗' });
/* 175.1 我的依赖 还在耍赖：战斗结束了，他一直点"再来一次" */
S(175.1, (g, G, t, u) => {
  battleBG(g, G, t, 1); const hp = bhero(g, 96, 204, 60, { arms: blink(t, .2) ? 'up' : 'down', eyes: 'shut', mouth: 'frown', tear: 1 });
  panel(g, 180, 40, 230, 128); ptext(g, '战 斗 结 束', 295, 46, '#FFE066', { align: 'c', s: 1 }); R(g, 190, 62, 210, 1, '#3A4A90');
  [['获得经验', '0'], ['获得金币', '0'], ['获得道具', '回忆 ×1'], ['掉落', '手套（右）']].forEach(([a, b], i) => { if (u > .3 + i * .35) { ptext(g, a, 192, 70 + i * 16, '#C8D4FF'); ptext(g, b, 398, 70 + i * 16, i > 1 ? '#FF8AB0' : '#FFFFFF', { align: 'r' }); } }); if (u > 1.6) icon(g, 'mitt', 300, 116);
  panel(g, 12, 58, 128, 20); icon(g, 'lock', 16, 60); ptext(g, '依赖　∞ 回合', 32, 61, blink(t, .4) ? '#E0B8FF' : '#B48AE8');
  const n = Math.max(0, fl((t - 178.3) * 4.6)); for (let i = 0; i < Math.min(n, 15); i++) { const x = 150 + (i % 8) * 22 + fl(i / 8) * 8, y = 30 + (i % 8) * 14 + fl(i / 8) * 40, born = t - 178.3 - i / 4.6, k = born < .1 ? 2 : 0; panel(g, x - k, y - k, 130 + k * 2, 44 + k * 2, { bg: i === n - 1 ? '#3A2A10' : '#1A2A6A' }); ptext(g, '再来一次？', x + 10, y + 6, '#FFFFFF'); ptext(g, '是', x + 30, y + 24, '#FFE066'); ptext(g, '否', x + 84, y + 24, '#5A6AA0'); cursor(g, x + 18, y + 27, t); }
  if (n > 0) { ptext(g, '耍赖 ×' + n, 76, 110, '#9FE8FF', { align: 'c', ol: '#0A1238' }); if ((t - 178.3) * 4.6 % 1 < .25) fxShake(g, t, 2); }
  hud(g, { hp: .01, hpn: 1, face: { eyes: 'shut', mouth: 'frown' } }); snow3(g, t, .6);
}, { in: ['blinds', .4], tag: '战斗' });
/* 181.5 眼泪打转 转不回来：命运轮盘 */
S(181.5, (g, G, t, u) => {
  uiBG(g, t, '#1A0A2E', '#40184A'); const cx = 300, cy = 116, r = 86, tStop = 186.3, SEC = ['复合', '重来', '道歉', '等等', '回去', '装傻', '转不回来', '忘掉'], col = ['#FF6A8A', '#FFD54A', '#5ADB7A', '#5AB8FF', '#B48AE8', '#FF9A5A', '#C8203A', '#7ADFD0'];
  const rem = Math.max(0, tStop - t), ang = -1.5708 - (6.5 / 8) * 6.283 - rem * rem * 1.1;
  put(g, cache('wheel', 200, 200, c => { for (let y = 0; y < 200; y++) for (let x = 0; x < 200; x++) { const dx = x - 99.5, dy = y - 99.5, d = Math.hypot(dx, dy); if (d > r) continue; const a = (Math.atan2(dy, dx) + 6.283) % 6.283, k = fl(a / (6.283 / 8)); R(c, x, y, 1, 1, d > r - 3 ? '#FFFFFF' : d < 10 ? '#FFFFFF' : ((a % (6.283 / 8)) < .03 ? '#FFFFFF' : (d > r - 12 ? dk(col[k], .2) : col[k]))); } }).getContext ? cache('wheelrot' + Math.round(ang * 20), 200, 200, c => { const src = _cv.wheel.getContext('2d'); rotBlit(c, src, 100, 100, ang); SEC.forEach((s, k) => { const a = ang + (k + .5) * 6.283 / 8, tx = 100 + Math.cos(a) * 56, ty = 100 + Math.sin(a) * 56; if (s.length > 2) { ptext(c, s.slice(0, 2), tx, ty - 12, k === 6 ? '#FFFFFF' : '#1A1420', { align: 'c' }); ptext(c, s.slice(2), tx, ty, k === 6 ? '#FFFFFF' : '#1A1420', { align: 'c' }); } else ptext(c, s, tx, ty - 6, k === 6 ? '#FFFFFF' : '#1A1420', { align: 'c' }); }); }) : _cv.wheel, cx - 100, cy - 100);
  for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, on = (i + fl(t * 8)) % 4 === 0; disc(g, cx + Math.cos(a) * (r + 7), cy + Math.sin(a) * (r + 7), 2.5, on ? '#FFE066' : '#5A3A20'); if (on) soft(G, cx + Math.cos(a) * (r + 7), cy + Math.sin(a) * (r + 7), 7, '#FFD54A', .9); }
  for (let j = 0; j < 12; j++) R(g, cx - 6 + fl(j / 2), cy - r - 16 + j, 13 - 2 * fl(j / 2), 1, '#FFFFFF'); R(g, cx - 8, cy - r - 18, 17, 3, '#E0423A');
  panel(g, 240, 6, 120, 18, { bg: '#3A2A10' }); ptext(g, '命 运 轮 盘', 300, 9, '#FFE9A0', { align: 'c' });
  const hx = 104; for (let i = 0; i < 6; i++) { const a = t * 3.2 + i * 1.047, s = Math.sin(a); if (s <= 0) { R(g, hx + Math.cos(a) * 44 - 2, 96 + s * 12, 4, 6, '#8FDCFF'); } } const hp = chibi(g, hx, 214, 84, HO({ eyes: rem > 0 ? 'sad' : 'shut', mouth: rem > 0 ? 'o' : 'frown', tear: 1 })); for (let i = 0; i < 6; i++) { const a = t * 3.2 + i * 1.047, s = Math.sin(a); if (s > 0) { R(g, hx + Math.cos(a) * 44 - 2, 96 + s * 12, 4, 6, '#8FDCFF'); R(g, hx + Math.cos(a) * 44 - 1, 97 + s * 12, 2, 2, '#FFFFFF'); } }
  if (rem <= 0) { const a = t - tStop; if (a < .4) { fxFlash(g, (1 - a / .4) * .5); fxShake(g, t, 3 * (1 - a / .4)); } banner(g, '结果　转不回来', sg(a, 0, .2), 200, { bg: '#C8203A' }); burst(g, G, cx, cy - r, a, 14, '#FFE066', 60); }
  snowAnim(g, t, 40, 8, { c: '#6A3A80' });
}, { in: ['dz', .4], tag: '我' });
/* 187.3 你的笑容灿烂：另一半照片回来了，拼成一张完整的 */
S(187.3, (g, G, t, u) => {
  uiBG(g, t, '#120E2A', '#2A2460'); const j = eo(sg(t, 187.4, 188.9)), done = j >= 1, d = (1 - j) * 150, px = 150, py = 36, w = 180, h = 130;
  for (let i = 0; i < 14; i++) { const a = t * .8 + i * .45; sparkle(g, done ? G : null, 240 + Math.cos(a) * (150 + (i % 3) * 20), 100 + Math.sin(a * 1.3) * 80, i % 2 ? '#FFFFFF' : '#FFE9A0', 1 + (i % 3)); }
  if (!done) { g.save(); g.beginPath(); g.rect(0, 0, 240 - d, PH); g.clip(); g.translate(-d, 0); polaroid(g, null, px, py, w, h, {}); g.restore(); g.save(); g.beginPath(); g.rect(240 + d, 0, PW, PH); g.clip(); g.translate(d, 0); polaroid(g, null, px, py, w, h, {}); g.restore(); for (let y = py - 5; y < py + h + 21; y += 4) { R(g, 240 - d, y, 2 + ((y >> 2) & 1) * 2, 4, '#FFFFFF'); R(g, 240 + d - 2 - ((y >> 2) & 1) * 2, y, 2 + ((y >> 2) & 1) * 2, 4, '#FFFFFF'); } }
  else { const a = t - 188.9; polaroid(g, G, px, py, w, h, { cap: '去年 · 圣诞' }); soft(G, 240, 100, 120, '#FFE9A0', .2); fxFlash(g, (1 - sg(a, 0, .4)) * .9); burst(g, G, 240, 100, a, 20, '#FFE066', 120); itemGet(g, G, a - .3, 'photo', '完整的合照', { y: 186 }); }
  snowAnim(g, t, 40, 8, { c: '#4A4A90' });
}, { in: ['flash', .4], tag: '我' });
