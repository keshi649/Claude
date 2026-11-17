'use strict';
/* shots1.js —— 开场（0~14.76 秒：开机、标题、读档、前情提要、"你离开了队伍"）和第一段主歌（14.76~40.71 秒：圣诞镇） */
function beet(g, x, y) { ell(g, x + 11, y + 17, 9, 9, '#B8306A'); ell(g, x + 9, y + 15, 6, 6, '#E0508A'); R(g, x + 10, y + 25, 2, 4, '#B8306A'); R(g, x + 11, y + 28, 1, 3, '#8A1E4A'); R(g, x + 10, y + 3, 2, 8, '#3A9A5A'); ell(g, x + 6, y + 6, 4, 2.5, '#4AB86A'); ell(g, x + 16, y + 6, 4, 2.5, '#4AB86A'); ell(g, x + 11, y + 3, 2.5, 3, '#6AD080'); R(g, x + 6, y + 13, 2, 2, '#FFFFFF'); }
/* 片名：四个大字，i 个已经落下 */
function titleLogo(g, G, y, ages, o = {}) {
  const x0 = 138; '爱情废柴'.split('').forEach((c, i) => { const a = ages[i]; if (a < 0) return; const dy = Math.round((1 - eob(sg(a, 0, .26))) * -130), yy = y + dy + (i === 3 && a > .26 ? 3 : 0); ptext(g, c, x0 + i * 52, yy, i < 2 ? '#FFE066' : '#FF8A6A', { s: 4, ol: '#3A1A60', sh: i < 2 ? '#A0601A' : '#8A2A2A' }); if (G) ptext(G, c, x0 + i * 52, yy, i < 2 ? '#8A5A10' : '#8A2A20', { s: 4 }); });
  if (ages[3] > .26) { line(g, x0 + 3 * 52 + 30, y + 6, x0 + 3 * 52 + 22, y + 22, '#3A1A60'); line(g, x0 + 3 * 52 + 22, y + 22, x0 + 3 * 52 + 28, y + 34, '#3A1A60'); }
}
/* 0.00 开机：显像管亮起，"甜菜 GAMES" */
S(0, (g, G, t, u) => {
  R(g, 0, 0, PW, PH, '#070A1C'); for (let i = 0; i < 90; i++) { const a = hash(i, 1) * 6.283, d = ((hash(i, 2) + t * .5) % 1), x = 240 + Math.cos(a) * d * 300, y = 135 + Math.sin(a) * d * 180; R(g, x, y, d > .6 ? 2 : 1, 1, d > .5 ? '#8FA4D8' : '#3A4680'); }
  const pop = Math.round((1 - eob(sg(t, .1, .4))) * 20); beet(g, 168, 92 + pop); ptext(g, '甜菜', 200, 90 + pop, '#FF7AA8', { s: 3, sh: '#5A1030', ol: '#1A0A20' }); ptext(G, '甜菜', 200, 90 + pop, '#A03060', { s: 3 }); ptext(g, 'G A M E S', 203, 130 + pop, '#FFFFFF'); R(g, 200, 127 + pop, 72, 1, '#FF7AA8');
  const sx = 190 + sg(t, .45, 1.0) * 110; g.save(); g.beginPath(); g.rect(sx, 86, 7, 44); g.clip(); ptext(g, '甜菜', 200, 90 + pop, '#FFFFFF', { s: 3 }); g.restore();
  if (t > .36) { burst(g, G, 240, 108, t - .36, 16, '#FF9AC0', 90); fxFlash(g, (1 - sg(t, .36, .62)) * .45); }
  if (t > .7 && blink(t, .3)) ptext(g, '出 品', 240, 152, '#C8D4FF', { align: 'c' });
  fxScan(g, .16); fxCRT(g, .6 + .4 * sg(t, 0, .3));
}, { nolyr: 1, nomark: 1 });
/* 1.25 标题画面：四个字一个个砸下来 */
S(1.25, (g, G, t, u) => {
  up(g, G); scroll(g, G, t, 240 + u * 14, 'night'); person(g, 96, 214, 34, HO({ back: 1, sit: 1 })); R(g, 70, 208, 52, 4, '#8A5A38'); R(g, 70, 207, 52, 1, '#FFFFFF'); cat(g, 126, 214); snow3(g, t);
  const sa = u - .5; if (sa > 0 && sa < .7) { const x = 420 - sa * 260, y = 20 + sa * 70; for (let k = 0; k < 14; k++) R(g, x + k * 2.2, y - k * .6, 2, 1, k < 3 ? '#FFFFFF' : '#8FA4D8'); soft(G, x, y, 6, '#FFFFFF', 1); }
  dn(g, G); const T0 = [0, .3, .6, .88], ages = T0.map(a => u - a); titleLogo(g, G, 44, ages);
  if (u > 1.2) { ptext(g, '— 一个人的圣诞 RPG —', 240, 100, '#C8D4FF', { align: 'c', ol: '#0A0E24' }); heart(g, 356, 54, '#8A8AA8'); R(g, 358, 54, 1, 5, '#14214E'); }
  if (u > 1.25 && (blink(u, .34) || u > 2.3)) { panel(g, 196, 136, 88, 19, { bg: u > 2.3 ? '#8A6A10' : '#101A44' }); ptext(g, '按 开始 键', 240, 139, u > 2.3 ? '#FFFFFF' : '#FFE066', { align: 'c' }); }
  icon(g, 'note', 26, 196); ptext(g, '周杰伦《爱情废柴》', 40, 196, '#FFFFFF', { ol: '#0A0E24' });
  if (u > .88 + .2 && u < 1.5) fxShake(g, t, 3 * (1 - sg(u, 1.08, 1.5)));
}, { in: ['flash', .3], nolyr: 1 });
/* 3.84 读档：存档 1"两个人"读不出来 */
function saveSlot(g, y, k, o) {
  panel(g, 56 + (o.dx || 0), y, 368, 46, { bg: o.bg || '#101A44' }); const x = 56 + (o.dx || 0); ptext(g, '存档 ' + k, x + 8, y + 4, '#9FE8FF');
  if (o.empty) { ptext(g, '—— 空 ——', x + 184, y + 16, '#5A6AA0', { align: 'c' }); return; }
  o.faces.forEach((f, i) => portrait(g, x + 50 + i * 34, y + 8, 30, f)); const tx = x + 50 + o.faces.length * 34 + 8;
  ptext(g, o.name, tx, y + 6, '#FFFFFF'); ptext(g, o.lv, tx + 50, y + 6, '#FFE066'); ptext(g, '游戏时间 ' + o.time, tx, y + 24, '#C8D4FF');
  for (let i = 0; i < o.hearts; i++) heart(g, x + 308 + i * 9 - (o.hearts > 1 ? 0 : 0), y + 10, i < o.gray ? '#5A5A78' : '#FF5A7A'); if (o.place) ptext(g, o.place, x + 360, y + 26, '#9FE8FF', { align: 'r' });
}
S(3.84, (g, G, t, u) => {
  uiBG(g, t); snowAnim(g, t, 40, 5, { c: '#3A4A90' }); panel(g, 186, 12, 108, 21, { bg: '#3A2A10' }); ptext(g, '读 取 存 档', 240, 16, '#FFE9A0', { align: 'c' });
  const err = u > .89, dx = err && u < 1.3 ? Math.round((hash(fl(t * 30), 1) - .5) * 10) : 0;
  saveSlot(g, 42, 1, { dx, bg: err ? '#4A1024' : '#101A44', faces: [HO({ eyes: 'happy', mouth: 'smile' }), GO({ eyes: 'happy', mouth: 'smile' })], name: '两个人', lv: 'Lv.52', time: '730:00', hearts: 5, gray: err ? fl(sg(u, 1.0, 1.9) * 5.99) : 0, place: '圣诞镇' });
  saveSlot(g, 94, 2, { empty: 1 }); saveSlot(g, 146, 3, { bg: u > 2.76 && blink(u, .12) ? '#3A4AA0' : '#101A44', faces: [HO({ eyes: 'sad', mouth: 'flat' })], name: '一个人', lv: 'Lv.1', time: '000:00', hearts: 1, gray: 1, place: '圣诞镇' });
  const cy = u < 1.95 ? 42 : u < 2.1 ? 94 : 146; cursor(g, 40, cy + 19, t);
  if (err) { const p = eob(sg(u, .89, 1.1)); panel(g, 240 - 96 * p, 56, 192 * p, 19, { bg: '#C8203A' }); if (p > .9) ptext(g, '无法读取：队友不在线', 240, 59, '#FFFFFF', { align: 'c' }); if (u < 1.2) fxGlitch(g, t, 1 - sg(u, .89, 1.2)); }
  ptext(g, '上下 选择　　确定 读取', 240, 204, '#6A7CC8', { align: 'c' }); fxScan(g, .1);
}, { in: ['flash', .24], nolyr: 1 });
/* 7.32 前情提要：七段回忆各闪一下 */
S(7.32, (g, G, t, u) => {
  const D = .44, k = Math.min(6, fl(u / D)), lu = u - k * D; MEMS[k](g, G, t, [1.9, 1.2, 1.3, 1.7, 1.75, 2.15, 1.2][k] + lu * 1.6);
  fxFlash(g, 1 - sg(lu, 0, .12)); if (k % 2) fxGlitch(g, t, (1 - sg(lu, 0, .16)) * .7);
  panel(g, 176, 196, 128, 19, { bg: '#3A2A10' }); ptext(g, '前情提要', 208, 199, '#FFE9A0'); for (let i = 0; i < 2; i++) for (let j = 0; j < 5; j++) R(g, 266 + i * 8 + j, 201 + j, 1, 9 - 2 * j, '#FFE9A0');
  for (let i = 0; i < 7; i++) R(g, 194 + i * 14, 218, 10, 2, i <= k ? '#FFE066' : '#3A4680');
}, { in: ['glitch', .3], nolyr: 1 });
/* 10.4 "你"离开了队伍；职业：恋人 → 废柴；第 12 章 */
S(10.4, (g, G, t, u) => {
  const cam0 = 150 + u * 6, gx = 300 + u * 16; town(g, G, t, cam0); chibi(g, gx - cam0, 176, 26, GO({ back: 1, step: stepOf(t) })); for (let i = 0; i < 12; i++) if (240 + i * 9 < gx - 8) R(g, 240 + i * 9 - cam0, 177 + (i % 2) * 2, 3, 1, '#5A6FA8'); fxTint(g, '#04061A', .72); G.save(); G.globalAlpha = .7; G.fillStyle = '#000'; G.fillRect(0, 0, PW, PH); G.restore(); snowAnim(g, t, 70, 3, { c: '#5A6AB0', sp: 12 }); snowAnim(g, t, 30, 4, { sp: 18 });
  const gone = sg(u, 1.45, 1.75), cls = u > 1.85, chap = u > 2.9;
  if (!chap) {
    dialog(g, u - .1, '系统', '「你」离开了队伍。', null, { x: 130, y: 26, w: 220, ncol: '#9FE8FF', cps: 14 });
    panel(g, 110, 88, 260, 96); ptext(g, '队伍', 120, 92, '#9FE8FF');
    portrait(g, 126, 110, 46, HO({ eyes: cls ? 'sad' : 'n', mouth: 'flat' }), 70); ptext(g, '我', 178, 110, '#FFFFFF');
    const lv = cls ? Math.max(1, Math.round(52 - sg(u, 1.85, 2.7) * 51)) : 52; ptext(g, 'Lv.' + lv, 196, 110, '#FFE066');
    ptext(g, '职业', 178, 126, '#C8D4FF'); ptext(g, cls && u > 2.1 ? '废柴' : '恋人', 206, 126, cls && u > 2.1 ? '#FF8A6A' : '#FF8AB0'); if (cls && u > 2.1 && u < 2.5) { burst(g, G, 218, 132, u - 2.1, 8, '#FF8A6A', 20); }
    for (let i = 0; i < 5; i++) heart(g, 178 + i * 9, 144, i < 5 - fl(sg(u, 1.85, 2.7) * 4.99) ? '#FF5A7A' : '#3A4680'); bar(g, 178, 160, 60, cls ? 1 - sg(u, 1.85, 2.7) * .9 : 1, '#FF5A6A');
    g.save(); g.globalAlpha = 1 - gone * .85; portrait(g, 262, 110, 46, GO({ eyes: 'n', mouth: 'flat' }), 70); g.restore(); if (gone >= 1) { R(g, 262, 110, 46, 46, 'rgba(6,9,24,.6)'); ptext(g, '空', 285, 127, '#5A6AA0', { align: 'c' }); } ptext(g, gone >= 1 ? '——' : '你', 314, 110, gone >= 1 ? '#5A6AA0' : '#FFFFFF');
    if (u > 1.4 && u < 1.9) { fxShake(g, t, 2 * (1 - sg(u, 1.4, 1.9))); for (let i = 0; i < 16; i++) { const a = u - 1.45; R(g, 285 + (hash(i, 1) - .5) * 46 + a * 40 * (hash(i, 2) - .3), 133 + (hash(i, 3) - .5) * 46 - a * 50 * hash(i, 4), 2, 2, i % 2 ? '#B7A6F0' : '#FFFFFF'); } }
  } else {
    const p = eo(sg(u, 2.9, 3.3)); R(g, 0, 118 - 44 * p, PW, 88 * p, '#101A44'); R(g, 0, 118 - 44 * p, PW, 1, '#FFFFFF'); R(g, 0, 118 + 44 * p, PW, 1, '#FFFFFF');
    if (p > .7) { ptext(g, '第 12 章', 240, 86, '#9FE8FF', { align: 'c' }); typed(g, '圣 诞 节', 240 - 48, 102, '#FFFFFF', u - 3.2, 8, { s: 2, sh: '#060918' }); icon(g, 'snow', 160, 108); icon(g, 'snow', 308, 108); ptext(g, '—— 剩下单人的 ——', 240, 136, '#6A7CC8', { align: 'c' }); }
  }
}, { in: ['black', .3], nolyr: 1 });

/* ================= 第一段主歌：圣诞镇 ================= */
/* 镇上走来走去的人：三对情侣、一个推雪橇的小孩、一只猫 */
function townFolk(g, t, cam, list = []) {
  [[0, 150, 150, 9], [1, 420, 196, -7], [2, 560, 158, 6], [3, 250, 212, -5]].forEach(([i, x0, y, v]) => { const x = ((x0 + t * v) % 760 + 760) % 760 - 20; list.push([y, () => couple(g, t, i, x - cam, y, 26)]); });
  const kx = ((300 + t * 16) % 800) - 40; list.push([206, () => { mini(g, kx - cam, 206, { coat: '#F2C94C', hat: '#5AB8FF' }); R(g, kx - cam - 14, 203, 10, 2, '#8A4A2A'); R(g, kx - cam - 15, 205, 12, 1, '#C9D6EE'); }]);
  list.push([140, () => cat(g, 392 - cam + Math.round(Math.sin(t * .7) * 20), 140)]);
  ysort(list);
}
const hero1 = (g, x, fy, o) => { field(g, Math.round(x) - 16, Math.round(fy) - 6, 32, 12, '#FFE066', (px, py) => { const d = ((px - x) / 14) ** 2 + ((py - fy) / 4.5) ** 2; return d < 1 && d > .55 ? 1 : 0; }); return person(g, x, fy, 30, HO(o)); };
/* 14.76 圣诞节 剩下单人的剩单节 */
S(14.76, (g, G, t, u) => {
  const cam = 40 + ease(sg(u, 0, 3.6)) * 70; town(g, G, t, cam); const hx = 130 + u * 22;
  townFolk(g, t, cam, [[150, () => { hero1(g, hx - cam, 150, { step: stepOf(t), eyes: 'dn', snow: 1 }); if (u > 1.7) emote(g, hx - cam, 113, '...', u); }]]); snow3(g, t);
  hud(g, { face: { eyes: 'sad' } }); party(g, t); if (u > 1.4) toast(g, '成就解锁：剩单节', sg(u, 1.4, 1.7), { icon: 'star', x: 250 });
  if (u > 2.4) { panel(g, 12, 58, 100, 20); ptext(g, '情侣 8 · 单身 1', 18, 61, '#FF8AA0'); }
  if (u < 1.2) { g.save(); g.globalAlpha = 1 - sg(u, .7, 1.2); ptext(g, '圣诞镇', 240, 96, '#FFFFFF', { align: 'c', s: 2, ol: '#0A0E24' }); g.restore(); }
}, { in: ['diag', .5] });
/* 18.2 过条街 最好又给我下起雪：头顶多了一朵只下他的云 */
S(18.2, (g, G, t, u) => {
  const cam = 150; town(g, G, t, cam); const hy = lerp(112, 168, ease(sg(u, .1, 2.6))), hx = 296;
  const tx = 760 - u * 190, tram = () => { const x = Math.round(tx - cam); R(g, x, 96, 90, 30, '#C83040'); R(g, x, 96, 90, 3, '#FFFFFF'); R(g, x, 112, 90, 3, '#F4EAD8'); for (let i = 0; i < 5; i++) { R(g, x + 6 + i * 17, 101, 12, 10, WARM); R(G, x + 6 + i * 17, 101, 12, 10, '#A06820'); mini(g, x + 9 + i * 17, 112, { sil: '#6A3324' }); } R(g, x + 4, 126, 82, 3, '#2A2438'); disc(g, x + 16, 128, 4, '#1A1420'); disc(g, x + 72, 128, 4, '#1A1420'); R(g, x - 3, 104, 3, 6, '#FFF4C0'); soft(G, x - 4, 107, 12, '#FFE9A0', 1); for (let i = 0; i < 6; i++) R(g, x + 92 + i * 6, 124 - i, 4, 2, '#DCE6F5'); };
  townFolk(g, t, cam, [[122, tram], [hy, () => { const cx = hx - cam; hero1(g, cx, hy, { step: u < 2.6 ? stepOf(t) : 0, eyes: u > 1.3 ? 'up' : 'dn', snow: u > 1.5 }); if (u > 1.2) { const cy = hy - 58 + Math.round(Math.sin(t * 3) * 1.5); ell(g, cx, cy, 15, 6, '#8A96C0'); ell(g, cx - 8, cy + 2, 9, 5, '#A4B0D4'); ell(g, cx + 9, cy + 2, 10, 5, '#7A86B0'); ell(g, cx, cy - 3, 9, 5, '#C8D0E8'); for (let i = 0; i < 16; i++) { const yy = cy + 6 + ((hash(i, 3) * 40 + t * 46) % 40); R(g, cx - 13 + hash(i, 5) * 26, yy, i % 3 ? 1 : 2, i % 3 ? 2 : 1, '#FFFFFF'); } } }]]); snow3(g, t, u > 1.2 ? 1.5 : 1);
  hud(g, { face: { eyes: u > 1.3 ? 'up' : 'sad' } }); party(g, t);
  if (u > 1.2) toast(g, '天气：大雪（仅限你头顶）', sg(u, 1.2, 1.5), { icon: 'snow', x: 250, bg: '#102A4A', col: '#C8F0FF' });
});
/* 21.45 这么衰 这么刚好 这么狼狈：屋檐的雪、冰面、电车溅的雪水 */
S(21.45, (g, G, t, u) => {
  const cam = 150, a1 = u - .18, a2 = u - 1.22, a3 = u - 2.18; town(g, G, t, cam);
  let hx = 300, hy = 126, o = { eyes: 'dn', snow: 1 }, rot = 0;
  if (a2 > 0) { const p = sg(a2, 0, .8); hx = 300 + eo(p) * 60; hy = 126 + eo(p) * 34; rot = p < 1 ? p * 6.283 * 1.5 : 0; o = { eyes: p < 1 ? 'wide' : 'x', mouth: 'o', arms: 'up' }; }
  if (a3 > 0) { o = { eyes: 'shut', mouth: 'frown', snow: 1, tear: sg(a3, .3, 1) }; }
  const dr = () => { const cx = hx - cam; if (a2 > 0) { ell(g, 330 - cam + 20, 158, 40, 9, '#9CC8F0'); ell(g, 326 - cam + 20, 156, 22, 4, '#D8ECFF'); } ell(g, cx, hy, 10, 2.2, '#5C6FA8', .6); if (rot) rotBlit(g, chibi(null, 0, 0, 30, HO({ ...o, buf: 1 })), cx, hy - 20, rot); else chibi(g, cx, hy, 30, HO(o)); if (a1 > 0 && a2 < 0) { const p = sg(a1, 0, .25), h = Math.round(p * 30); ell(g, cx, hy - 6, 16, 9, '#FFFFFF'); R(g, cx - 12, hy - 8 - h, 24, h, '#F4F8FF'); ell(g, cx, hy - 8 - h, 12, 5, '#FFFFFF'); for (let i = 0; i < 8; i++) R(g, cx - 20 + hash(i, 1) * 40, hy - 40 + a1 * 60 * hash(i, 2), 2, 2, '#FFFFFF'); } if (a3 > 0 && a3 < .7) { for (let i = 0; i < 26; i++) { const p = a3 / .7, x = cx + 50 - p * (30 + hash(i, 1) * 60), y = hy - 10 - Math.sin(p * 3.14) * (10 + hash(i, 2) * 30); R(g, x, y, 2, 2, i % 2 ? '#9CC8F0' : '#DCE6F5'); } } };
  const sx = 520 - a3 * 300; townFolk(g, t, cam, [[hy, dr], [165, () => { if (a3 > -.4) { const x = sx - cam; mini(g, x, 160, { coat: '#6CC58A', hat: '#E0423A' }); mini(g, x + 9, 160, { coat: '#F08AB0', hair: '#7A4A2A' }); R(g, x - 6, 160, 26, 3, '#8A4A2A'); R(g, x - 8, 163, 30, 1, '#C9D6EE'); } }]]); snow3(g, t);
  [[a1, '-1'], [a2, '-1'], [a3, '-1']].forEach(([a, s], i) => floatText(g, s, hx - cam + 16, hy - 44, a, { col: '#FF5A6A', ol: '#FFFFFF', life: .9 }));
  hud(g, { hp: (12 - (a1 > 0) - (a2 > 0) - (a3 > 0)) / 120, hpn: 12 - (a1 > 0) - (a2 > 0) - (a3 > 0), face: { eyes: a3 > 0 ? 'shut' : a2 > 0 ? 'x' : 'sad', mouth: 'frown' } }); party(g, t);
  [['衰', a1, '#4A1020', '#FF8AA0'], ['刚好', a2, '#102A4A', '#9FE8FF'], ['狼狈', a3, '#3A2A10', '#FFE9A0']].forEach(([s, a, bg, c], i) => { if (a > 0) { const x = 14 + [0, 24, 60][i], y = 58 - Math.round((1 - eob(sg(a, 0, .2))) * 8); tagp(g, x, y, s, bg, c); } });
  [a1, a2, a3].forEach(a => { if (a > 0 && a < .3) { fxShake(g, t, 3 * (1 - a / .3)); fxFlash(g, (1 - a / .15) * .35); } });
});
/* 24.9 要不要拍成 MV 干脆：系统菜单里真有这一项 */
function recFrame(g, t, T) { [[18, 16, 1, 1], [462, 16, -1, 1], [18, 208, 1, -1], [462, 208, -1, -1]].forEach(([x, y, a, b]) => { R(g, x, y, 14 * a, 2, '#FFFFFF'); R(g, x, y, 2 * a, 14 * b, '#FFFFFF'); }); if (blink(t, .8)) disc(g, 162, 22, 3.5, '#FF3A3A'); ptext(g, 'REC', 170, 16, '#FFFFFF', { ol: '#0A0E24' }); const s = fl(T), f = fl((T % 1) * 30); ptext(g, '00:' + String(s).padStart(2, '0') + ':' + String(f).padStart(2, '0'), 200, 16, '#FFFFFF', { ol: '#0A0E24' }); }
function crew(g, G, t, p) { if (p <= 0) return; const pop = (x, y, a, fn) => { if (p * 3 - a <= 0) return; if (p * 3 - a < .5) burst(g, G, x, y - 14, (p * 3 - a) * .8, 8, '#FFFFFF', 18); fn(); };
  pop(110, 170, 0, () => { R(g, 104, 152, 2, 22, '#2A2438'); line(g, 105, 164, 96, 176, '#2A2438'); line(g, 105, 164, 114, 176, '#2A2438'); R(g, 96, 140, 22, 13, '#2A2438'); R(g, 118, 143, 6, 7, '#5A5A78'); disc(g, 100, 138, 4, '#3A3A52'); disc(g, 110, 137, 4, '#3A3A52'); person(g, 86, 176, 26, npc(7, { mouth: 'flat' })); });
  pop(370, 168, 1, () => { R(g, 356, 160, 22, 3, '#C8553D'); R(g, 358, 163, 2, 12, '#3A2A20'); R(g, 374, 163, 2, 12, '#3A2A20'); R(g, 356, 148, 2, 14, '#3A2A20'); R(g, 356, 148, 22, 6, '#C8553D'); chibi(g, 367, 166, 26, npc(3, { sit: 1, arms: 'upR', hat: '#1B1420', mouth: 'o' })); R(g, 378, 142, 10, 6, '#FFFFFF'); R(g, 386, 140, 4, 10, '#E0E0F0'); });
  pop(330, 196, 2, () => { const x = 322; person(g, x, 200, 26, npc(5, { arms: 'up', mouth: 'flat' })); line(g, x + 6, 178, 280, 142, '#8A8AA8'); ell(g, 276, 141, 7, 3, '#5A5A78'); });
  if (p > .8) { R(g, 150, 110, 2, 70, '#2A2438'); R(g, 142, 178, 18, 2, '#2A2438'); R(g, 140, 100, 22, 12, '#3A3A52'); R(g, 142, 102, 18, 8, '#FFF4C0'); soft(G, 151, 106, 26, '#FFE9A0', 1); field(g, 150, 108, 110, 70, '#FFE9B0', (x, y) => { const tt = (x - 150) / 100, cy = 110 + tt * 44, d = Math.abs(y - cy) / (4 + tt * 20); return tt < 0 || tt > 1 || d > 1 ? 0 : .28 * (1 - d); }); } }
S(24.9, (g, G, t, u) => {
  const cam = 120, hx = 240, hy = 168, on = u > 1.9; town(g, G, t, cam);
  townFolk(g, t, cam, [[hy, () => { hero1(g, hx, hy, { eyes: on ? 'n' : 'dn', mouth: on ? 'smile' : 'flat', arms: u > 2.2 ? 'upR' : 'down' }); }], [176, () => crew(g, G, t, sg(u, 1.9, 3))]]); snow3(g, t);
  hud(g, { hp: .075, hpn: 9, face: { eyes: on ? 'n' : 'sad' } });
  if (u < 2.2) { const cur = u < .45 ? 0 : u < .9 ? 1 : 2; menu(g, 300, 62, 96, ['道具', '状态', '拍成 MV', '存档', '放弃'], cur, { t }); if (u > 1.6 && blink(u, .12)) R(g, 304, 92, 88, 12, 'rgba(255,224,102,.4)'); }
  if (on) { fxBars(g, eo(sg(u, 1.9, 2.3)) * 12); recFrame(g, t, t); }
  const ca = u - 2.25; if (ca > 0 && ca < 1.2) { const y = 62 - Math.round((1 - eob(sg(ca, 0, .2))) * 20), cl2 = ca < .12 ? -.5 : 0; panel(g, 176, y + 14, 128, 54, { bg: '#1A1420' }); for (let i = 0; i < 8; i++) R(g, 178 + i * 16, y + 16, 8, 7, '#FFFFFF'); ptext(g, '爱情废柴 MV', 240, y + 28, '#FFFFFF', { align: 'c' }); ptext(g, '第 1 场 第 1 次', 240, y + 44, '#FFE066', { align: 'c' }); const b = mk(132, 12); R(b, 0, 0, 132, 10, '#1A1420'); for (let i = 0; i < 8; i++) R(b, 4 + i * 16, 2, 8, 6, '#FFFFFF'); rotBlit(g, b, 240 - (cl2 ? 6 : 0), y + 8 + (cl2 ? -14 : 0), cl2); if (ca > .12 && ca < .4) fxFlash(g, (1 - sg(ca, .12, .4)) * .7); }
});
/* 28.6 淡淡忧伤还是最美：选滤镜 */
S(28.6, (g, G, t, u) => {
  up(g, G); scroll(g, G, t, 420 + u * 5, 'night'); xtree(g, G, 96, 222, 84, 7); couple(g, t, 3, 420 - u * 9, 212, 24); R(g, 392, 186, 2, 36, '#0E1838'); line(g, 393, 206, 382, 222, '#0E1838'); line(g, 393, 206, 404, 222, '#0E1838'); R(g, 382, 172, 24, 15, '#0E1838'); R(g, 376, 176, 6, 7, '#1A2450'); lights(g, G, 0, 150, 300, 126, 16, 8, 6); lamp(g, G, 300, 216, 96, 1); R(g, 180, 200, 64, 5, '#8A5A38'); R(g, 180, 199, 64, 1, '#FFFFFF'); R(g, 184, 205, 3, 12, '#5A3422'); R(g, 238, 205, 3, 12, '#5A3422'); R(g, 180, 186, 64, 3, '#8A5A38'); R(g, 180, 185, 64, 1, '#FFFFFF');
  const hp = person(g, 276, 220, 64, HO({ eyes: u > 1.5 ? 'shut' : 'up', mouth: 'flat', snow: 1, wind: 1 })); snow3(g, t, .8);
  const f = u < .4 ? 0 : u < .8 ? 1 : 2; if (f === 1) fxTint(g, '#C89860', .5, 'color'); if (f === 2) fxBlue(g, sg(u, .8, 1.3));
  dn(g, G); fxBars(g, 12); recFrame(g, t, t);
  panel(g, 150, 34, 180, 22); ptext(g, '滤镜', 158, 38, '#9FE8FF'); ptext(g, ['原图', '怀旧', '淡淡忧伤'][f], 240, 38, f === 2 ? '#FFE066' : '#FFFFFF', { align: 'c' }); cursor(g, 312, 41, t); for (let i = 0; i < 3; i++) R(g, 228 + i * 9, 51, 6, 2, i === f ? '#FFE066' : '#3A4680');
  if (u > 1.4) { floatText(g, '美 +1', hp.x + 34, hp.top + 10, (u - 1.4) % 1.1, { col: '#C8F0FF', life: 1.1 }); floatText(g, '忧伤 +1', hp.x - 44, hp.top + 30, (u - 1.9) % 1.3, { col: '#9FB8FF', life: 1.3 }); }
}, { in: ['mosaic', .4] });
/* 32.4 剧情是你在写：剧本编辑器，编剧那一栏写着"你" */
S(32.4, (g, G, t, u) => {
  uiBG(g, t, '#0E1228', '#1C2450'); panel(g, 16, 14, 290, 200, { bg: '#0C1024' }); R(g, 18, 16, 286, 15, '#2A3A80'); ptext(g, '剧本编辑器', 24, 17, '#FFFFFF'); ptext(g, '爱情废柴.txt', 110, 17, '#9FE8FF');
  const L = [['# 第 12 章　圣诞节', '#FFE066'], ['场景：圣诞镇。夜。雪。', '#C8D4FF'], ['他一个人走过整条街。', '#FFFFFF'], ['（没有人在等他。）', '#8FA4D8'], ['他想挽留，但是——', '#FFFFFF'], ['选项全部锁定。', '#FF8AA0']]; let cx = 0, cy = 0;
  L.forEach(([s, c], i) => { const a = u - .2 - i * .68; ptext(g, String(i + 1).padStart(2, '0'), 24, 38 + i * 17, '#3A4A90'); if (a > 0) { const n = Math.min(s.length, fl(a * 20)); ptext(g, s.slice(0, n), 44, 38 + i * 17, c); if (n < s.length || i === L.length - 1) { cx = 44 + tbits(s.slice(0, n) || ' ').w * (n ? 1 : 0); cy = 38 + i * 17; } } });
  if (blink(t, .3)) R(g, cx + 1, cy + 1, 2, 11, '#FFFFFF');
  // 写字的是她的红手套
  const mx = cx + 10 + Math.round(Math.sin(t * 16) * 1), my = cy + 12 + Math.round(Math.cos(t * 16) * 1); ell(g, mx + 8, my + 9, 9, 8, '#B8202C'); ell(g, mx + 7, my + 8, 8, 7, '#D8323C'); ell(g, mx, my + 3, 4, 5, '#E04450'); R(g, mx + 12, my + 14, 12, 7, '#FFFFFF'); R(g, mx + 20, my + 18, 30, 10, '#B7A6F0'); R(g, mx - 3, my - 5, 2, 9, '#2A3466'); R(g, mx - 3, my - 7, 2, 2, '#E0B85A');
  panel(g, 316, 14, 148, 60, { bg: '#3A2A10' }); ptext(g, '编剧', 324, 18, '#FFE9A0'); portrait(g, 324, 34, 34, GO({ eyes: 'dn', mouth: 'flat' }), 52, '#5A3A20'); ptext(g, '你', 368, 36, '#FFFFFF', { s: 2 });
  panel(g, 316, 80, 148, 100); ptext(g, '预览', 324, 84, '#9FE8FF'); g.save(); g.beginPath(); g.rect(322, 100, 136, 74); g.clip(); g.drawImage(townMap().p, 250, 96, 136, 74, 322, 100, 136, 74); chibi(g, 390 + Math.round(Math.sin(t) * 10), 160, 22, HO({ step: stepOf(t), eyes: 'dn' })); snowAnim(g, t, 60, 6, {}); g.restore();
  panel(g, 316, 186, 148, 28); ptext(g, '主角能改剧本吗', 324, 190, '#C8D4FF'); ptext(g, '不能', 430, 190, '#FF8AA0');
}, { in: ['blinds', .4], tag: '剧本' });
/* 36.9 有点无解 我们之间：一条路都走不通，两个头像越离越远 */
S(36.9, (g, G, t, u) => {
  uiBG(g, t, '#120E2A', '#2A1C50'); const far = eo(sg(u, 2.2, 3.7)), lx = 70 - far * 44, rx = 364 + far * 44;
  panel(g, lx - 6, 60, 58, 76); portrait(g, lx, 66, 46, HO({ eyes: 'sad', mouth: 'flat' }), 70); ptext(g, '我', lx + 23, 116, '#FFFFFF', { align: 'c' });
  panel(g, rx - 6, 60, 58, 76); portrait(g, rx, 66, 46, GO({ eyes: 'n', mouth: 'flat' }), 70); ptext(g, '你', rx + 23, 116, '#FFFFFF', { align: 'c' });
  // 中间的迷宫：三条路依次试，都撞墙
  const x0 = lx + 56, x1 = rx - 10, W = x1 - x0, cols = 12, cw = W / cols; for (let j = 0; j < 5; j++) for (let i = 0; i <= cols; i++) R(g, x0 + i * cw, 66 + j * 16, 2, 2, '#3A4A90');
  const ROUTES = [[[0, 2], [3, 2], [3, 0], [7, 0]], [[0, 2], [2, 2], [2, 4], [6, 4], [6, 3], [9, 3]], [[0, 2], [5, 2], [5, 1], [8, 1], [8, 2], [10, 2]]];
  ROUTES.forEach((rt, k) => { const a = u - .2 - k * .62; if (a <= 0) return; const tot = rt.length - 1, p = Math.min(1, a / .5) * tot, col = ['#5AB8FF', '#FFE066', '#FF8AD8'][k]; for (let s = 0; s < tot; s++) { const q = cl(p - s); if (q <= 0) break; const [ax, ay] = rt[s], [bx, by] = rt[s + 1], px = x0 + lerp(ax, bx, q) * cw, py = 66 + lerp(ay, by, q) * 16, sx = x0 + ax * cw, sy = 66 + ay * 16; R(g, Math.min(sx, px), Math.min(sy, py), Math.abs(px - sx) + 2, Math.abs(py - sy) + 2, a > .5 ? dk(col, .5) : col); } if (a > .5) { const [ex, ey] = rt[tot], px = x0 + ex * cw, py = 66 + ey * 16; R(g, px + 4, py - 6, 3, 14, '#C8D4FF'); line(g, px - 3, py - 3, px + 3, py + 3, '#FF3A4A', 2); line(g, px + 3, py - 3, px - 3, py + 3, '#FF3A4A', 2); } });
  if (u > 1.7) { const p = eob(sg(u, 1.7, 1.95)); ptext(g, '无 解', 240, 150 + Math.round((1 - p) * 20), '#FF5A6A', { align: 'c', s: 2, ol: '#FFFFFF' }); if (u < 2.1) fxShake(g, t, 3 * (1 - sg(u, 1.7, 2.1))); }
  panel(g, 180, 22, 120, 21); ptext(g, '距离', 188, 26, '#9FE8FF'); ptext(g, String(Math.round(1 + far * 998)).padStart(3, '0') + ' 里', 292, 26, far > 0 ? '#FF8AA0' : '#FFFFFF', { align: 'r' });
  if (far > 0) for (let i = 0; i < 3; i++) { R(g, lx - 14 - i * 5, 96, 3, 1, '#6A7CC8'); R(g, rx + 60 + i * 5, 96, 3, 1, '#6A7CC8'); }
  R(g, 0, 190, PW, 80, '#221A48'); R(g, 0, 190, PW, 1, '#5A4A90'); for (let i = 0; i < 60; i++) R(g, (i * 53) % PW, 192 + (i * 17) % 24, 2, 1, '#3A2E70'); for (let i = 0; i < 24; i++) { const fx = lx + 40 + i * 13; if (fx < rx + 10) R(g, fx, 207 + (i % 2) * 3, 3, 1, '#6A5AA8'); }
  chibi(g, lx + 23, 210, 28, HO({ eyes: 'sad', mouth: 'flat' })); chibi(g, rx + 23, 210, 28, GO({ back: 1, step: far > 0 && far < 1 ? stepOf(t) : 0 }));
  snowAnim(g, t, 40, 8, { c: '#4A4A90' });
}, { in: ['dz', .4], tag: '剧本' });
