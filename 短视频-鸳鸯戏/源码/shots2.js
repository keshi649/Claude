'use strict';
/* shots2.js：16.2~31.2 秒。
   砚上三五笔（她研墨写信）→ 落墨鹧鸪啼（一滴墨晕开成水墨山水，两只鹧鸪在梅枝上叫，一只叼着信飞走）
   → breakdown：谁识曲中意（月下她弹琴）、断弦等你系（弦断了，断弦变成一根红线飘上天）
   → 红线一路飞过山河，飞进京城（鼓回来、越来越快）。 */

/* 宣纸：米色底、淡淡的纤维 */
function paperBg(g, x, y, w, h, col = '#F2EAD6') {
  g.rect(x, y, w, h, col);
  for (let i = 0; i < w * h / 60; i++) g.px(x + h2(i, 61) * w, y + h2(i, 62) * h, '#E6DCC4');
}

/* ---------- 9. 研墨、写字（16.19~18.07）："砚上"左手在砚台上磨墨，"三、五、笔"右手握着长毛笔，每个字一笔 ---------- */
function shotInk(c, lt, t) {
  const g = pbuf('main'), P = PAL.night;
  g.clear('#2A1626');
  // 后面：窗户（月光）
  g.rect(300, 0, 150, 110, '#3A2030'); g.rect(306, 6, 138, 98, '#2A3A78');
  stars(g, t, 9, 14, 306, 6, 138, 60, '#FFF6D8');
  for (let x = 306; x < 444; x += 12) g.rect(x, 6, 2, 98, '#5A2A20'); for (let y = 6; y < 104; y += 12) g.rect(306, y, 138, 2, '#5A2A20');
  // 她：坐在桌子后面，两只红袖搭在桌沿上
  const grind = t < 16.95;
  const k = 4, mx = 236 + (grind ? Math.round(Math.cos((t - 16.19) * 6) * 3) : 0), my = 182;
  mon(g, mx, my, { col: MON.niang, girl: true, sway: swayAt(t), eyes: blinkAt(t, 9) ? 'blink' : 'dn' }, k);
  // 桌面（从她身前一直铺到画面底下）
  g.rect(0, 150, PW, 120, '#6A3420');
  for (let i = 0; i < 9; i++) g.hl(0, PW, 158 + i * 13 + Math.round(Math.sin(i) * 2), '#5A2A18');
  g.rect(0, 150, PW, 3, '#8A4A2A');
  // 红袖搭在桌沿上（盖住身体最下面）
  g.rect(mx - 50, 146, 22, 10, MON.sleeve); g.rect(mx - 50, 153, 22, 3, '#F6D2D8');
  g.rect(mx + 28, 146, 22, 10, MON.sleeve); g.rect(mx + 28, 153, 22, 3, '#F6D2D8');
  // 砚台（左手下面）
  const ix = mx - 76;
  g.rect(ix, 158, 70, 34, '#2A2A30'); g.rect(ix + 3, 161, 64, 28, '#3A3A44'); g.rect(ix + 8, 165, 40, 20, '#121216'); g.rect(ix + 51, 165, 12, 20, '#0A0A0E');
  g.rect(ix + 8, 165, 40, 2, '#5A5A6A');
  // 纸
  paperBg(g, 236, 176, 210, 84);
  const strokes = [[17.02, [[310, 190], [310, 246]]], [17.58, [[282, 214], [338, 209]]], [17.98, [[356, 188], [392, 248]]]];
  for (const [ts, [[x0, y0], [x1, y1]]] of strokes) if (t >= ts) {
    const p = easeOut(seg(t, ts, ts + .2));
    const n = 14; for (let i = 0; i <= n * p; i++) { const f = i / n, w = 4.5 - 2.5 * Math.abs(f - .3); g.disc(lerp(x0, x1, f), lerp(y0, y1, f), w / 2 + .3, '#141010'); }
  }
  if (grind) {   // 墨条在砚台上画圈
    const p = (t - 16.19) * 6, gx = ix + 28 + Math.cos(p) * 10, gy = 172 + Math.sin(p) * 4;
    g.rect(gx - 4, gy - 22, 9, 24, '#141418'); g.rect(gx - 4, gy - 22, 9, 3, '#C8A04A'); g.disc(gx, gy + 2, 3, '#08080A');
  } else {   // 右手握着长毛笔，笔尖跟着笔画走
    let bx = 310, by = 186;
    const cur = strokes.filter(s => t >= s[0] - .25).pop();
    if (cur) { const [ts, [[x0, y0], [x1, y1]]] = cur, p = easeOut(seg(t, ts, ts + .2)); bx = lerp(x0, x1, p); by = lerp(y0, y1, p); }
    const hx = mx + 40, hy = 152;
    g.line(hx, hy, bx + 2, by - 4, '#7A4A22', 3); g.line(hx, hy, bx + 2, by - 4, '#A86A32', 1);
    g.rect(bx - 1, by - 5, 4, 6, '#141010');
  }
  candle(g, 24, 168, t, 2, 4);
  show(c, g);
  glow(c, 24, 138, 70, '#FFB050', .35);
  glow(c, 375, 55, 90, '#8FA8FF', .12);
  vignette(c, .45);
}

/* ---------- 10. 信（18.07~19.94）：纸上竖着写"盼君早归"，花瓣落在纸上，镜头慢慢往下移 ---------- */
function shotLetter(c, lt, t) {
  const g = pbuf('letter', 480, 400);
  paperBg(g, 0, 0, 480, 400);
  for (let x = 30; x < 480; x += 60) g.rect(x, 0, 1, 400, '#E0C8A0');   // 竖格（信笺的红线）
  const chars = ['盼', '君', '早', '归'];
  chars.forEach((ch, i) => {
    const p = textPBc(ch, { font: 'ms', size: 52, col: '#1A1212' });
    g.blit(p, 268, 40 + i * 78);
  });
  const sm = ['鸯', '字'];
  sm.forEach((ch, i) => g.blit(textPBc(ch, { font: 'ms', size: 30, col: '#2A2020' }), 150, 250 + i * 44));
  // 红色印章
  g.rect(110, 330, 34, 34, '#C0392B');
  g.blit(textPBc('鸳', { col: '#F8E6D8' }), 113, 333); g.blit(textPBc('鸯', { col: '#F8E6D8' }), 127, 347);
  petals(g, t, 33, 14, PAL.night, { cols: ['#F6B6CC', '#E8405A'] });
  // 纸上一片片落下来的花瓣，落定不动
  for (let i = 0; i < 6; i++) { const ts = 18.1 + i * .28; if (t > ts) { const x = 60 + h2(i, 4) * 360, y = 60 + h2(i, 5) * 300 + Math.min(0, (t - ts - .5) * 40); g.px(x, y, '#F6B6CC'); g.px(x + 1, y, '#F6B6CC'); g.px(x, y + 1, '#E89AB0'); } }
  const sy = lerp(0, 120, ease(lt / 1.875));
  show(c, g, 0, sy, 1);
  glow(c, 40, sy + 30, 120, '#FFB050', .12);
  vignette(c, .4);
}

/* 水墨山水（一张缓存的图层）：远山、近山、雾，全是灰阶 */
function inkLandscape() {
  return layer('inkland', PW, PH, g => {
    paperBg(g, 0, 0, PW, PH, '#EEE6D2');
    g.ring(370, 70, 30, '#B8B0A0', 2);
    ridge(g, 71, 150, 70, .012, '#C8C0B0', 0, PW, .7);
    ridge(g, 72, 175, 60, .018, '#A8A090', 0, PW, .85);
    mist(g, 150, 40, '#EEE6D2', .6);
    ridge(g, 73, 210, 50, .026, '#787068', 0, PW, .9);
    mist(g, 196, 30, '#EEE6D2', .5);
    ridge(g, 74, 250, 26, .04, '#4A4440');
  });
}
/* 鹧鸪（侧面朝右）：圆滚滚的身子，深褐灰色、胸口和身上一串白点，红腿 */
const PART = ['........kkk...', '.......kkwkk..', '......kkkkkkoo', '.kk..kkkkkkk..', 'kkkkkkksksksk.', '.kkkkkskskskk.', '..kkkkkkkkkk..', '....kkkkkkk...', '.....r...r....', '....rr..rr....'];
const PART_O = ['........kkk...', '.......kkwkk.o', '......kkkkkko.', '.kk..kkkkkkk.o', 'kkkkkkksksksk.', '.kkkkkskskskk.', '..kkkkkkkkkk..', '....kkkkkkk...', '.....r...r....', '....rr..rr....'];
const PART_PAL = { k: '#3E3430', w: '#F2EAD6', o: '#9A6A3A', s: '#E8E0CC', r: '#B84A3A' };
function partridge(g, x, y, open = false, flip = false, k = 3) {   // (x, y) 是爪子；flip 朝左
  const sp = artc(open ? 'partO' : 'part', open ? PART_O : PART, PART_PAL);
  g.blitK(sp, x - 7 * k, y - 10 * k, k, { flip });
}
let INK_SEGS = null;
function inkBranch(g) {   // 一枝水墨梅花，从右边伸进来
  if (!INK_SEGS) INK_SEGS = treeSegs(91, 500, 150, 190, Math.PI + .22, 3, 7);
  layer('inkbranch', PW, PH, p => {
    for (const [x0, y0, x1, y1, w] of INK_SEGS) { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0)); for (let i = 0; i <= n; i++) p.disc(lerp(x0, x1, i / n), lerp(y0, y1, i / n), w / 2, '#2A2420'); }
    const r = rng(92);
    for (const [x0, y0, x1, y1, w, d] of INK_SEGS) if (d <= 2) for (let k = 0; k < 2; k++) { const f = r(), x = lerp(x0, x1, f), y = lerp(y0, y1, f); p.disc(x, y - 2, 2, '#C8283A'); p.px(x, y - 2, '#F2C14E'); }
  });
  g.blit(_LAYERS.inkbranch, 0, 0);
}
/* 主枝在 x 处的上沿（鸟站的地方） */
function inkPerch(x) {
  if (!INK_SEGS) INK_SEGS = treeSegs(91, 500, 150, 190, Math.PI + .22, 3, 7);
  let best = null;
  for (const [x0, y0, x1, y1, w, d] of INK_SEGS) if (d === 3 && (x - x0) * (x - x1) <= 0) { const y = lerp(y0, y1, (x - x0) / (x1 - x0 || 1)) - w / 2; if (best === null || y < best) best = y; }
  return best === null ? 120 : best;
}

/* ---------- 11. 落墨（19.94~21.82）：笔尖一滴墨落下，晕开成水墨山水；"鹧、鸪"两只鸟落到枝头 ---------- */
function shotInkDrop(c, lt, t) {
  const g = pbuf('main');
  paperBg(g, 0, 0, PW, PH, '#EEE6D2');
  const hit = 20.35, x0 = 200, y0 = 150;
  if (t < hit) {   // 墨滴：从笔尖落下
    g.line(x0 + 2, -10, x0 + 8, 20, '#6A3A1A', 4); g.poly([[x0 - 3, 18], [x0 + 7, 18], [x0 + 2, 34]], '#141010');
    if (t >= 19.99) { const p = easeIn(seg(t, 19.99, hit)); g.disc(x0 + 2, lerp(36, y0, p), 3, '#141010'); }
  } else {
    // 晕开：带噪声边缘的圆，圆里露出水墨山水、梅枝、鸟
    const full = pbuf('inkfull');
    full.blit(inkLandscape(), 0, 0);
    inkBranch(full);
    if (t >= 20.77) partridge(full, 360, inkPerch(360) + 1 - Math.round(6 * (1 - easeOut(seg(t, 20.77, 21.0)))), false, false);
    if (t >= 21.27) partridge(full, 430, inkPerch(430) + 1 - Math.round(6 * (1 - easeOut(seg(t, 21.27, 21.5)))), false, true);
    const R = 14 + easeOut(seg(t, hit, hit + 1.1)) * 330;
    for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) {
      const a = Math.atan2(y - y0, x - x0), d = Math.hypot(x - x0, y - y0);
      const edge = R * (1 + .12 * Math.sin(a * 5 + 1) + .07 * Math.sin(a * 11 + 2));
      if (d < edge) g.d[y * PW + x] = full.d[y * PW + x];
      else if (d < edge + 3 && R < 300) g.d[y * PW + x] = C('#2A2420');
    }
    if (R < 60) g.disc(x0, y0, Math.max(2, 18 - R * .3), '#141010');
  }
  show(c, g);
  vignette(c, .25);
}

/* ---------- 12. 鹧鸪啼（21.82~23.69）：两只鹧鸪在梅枝上叫，一只叼起系着红绳的信，往远山飞 ---------- */
function shotPartridge(c, lt, t) {
  const g = pbuf('main');
  g.blit(inkLandscape(), 0, 0);
  inkBranch(g);
  const calling = Math.floor(t * 4) % 2 === 0;
  const ax = 360, bx = 430, ay = inkPerch(ax) + 1, by = inkPerch(bx) + 1;
  partridge(g, bx, by, calling, true);
  // 左边那只：先叫，再叼着信飞走
  const fly = seg(t, 22.5, 23.69);
  if (fly <= 0) partridge(g, ax, ay, !calling, false);
  else {
    const x = lerp(ax, 110, ease(fly)), y = lerp(ay, 50, ease(fly)) + Math.sin(t * 20) * 2;
    const wing = Math.floor(t * 10) % 2;
    partridge(g, x, y, false, true);
    g.rect(x - 8, y - 30 - wing * 10, 26, 6, '#4A3E36'); g.rect(x - 4, y - 26 - wing * 10, 18, 4, '#6A5A4E');   // 翅膀
    g.rect(x - 24, y - 20, 20, 12, '#F2EAD6'); g.rect(x - 24, y - 15, 20, 2, '#C0392B'); g.rect(x - 16, y - 20, 2, 12, '#C0392B');   // 信（红绳）
  }
  // 叫声：一圈圈墨线
  for (const [cx, cy, ph, on, dir] of [[bx - 24, by - 26, 0, true, -1], [ax + 24, ay - 26, .5, fly <= 0, 1]]) {
    if (!on) continue;
    const p = ((t * 2 + ph) % 1);
    for (let i = 0; i < 3; i++) { const r = 4 + p * 14 + i * 7; for (let a = -.6; a <= .6; a += .05) g.px(cx + dir * Math.cos(a) * r, cy + Math.sin(a) * r, p < .7 ? '#7A7060' : '#B8B0A0'); }
  }
  // 印章
  g.rect(28, 196, 30, 30, '#C0392B');
  g.blit(textPBc('鸳', { col: '#F8E6D8' }), 29, 197); g.blit(textPBc('鸯', { col: '#F8E6D8' }), 43, 211);
  show(c, g);
  vignette(c, .25);
}

/* 音符光点：从 (x, y) 往上飘，ts 是冒出来的时刻 */
function noteRise(g, x, y, t, ts, seed) {
  const p = t - ts; if (p < 0 || p > 2.4) return null;
  const xx = x + Math.sin(p * 2.5 + seed) * 8 + p * 10 * (h2(seed, 1) - .5), yy = y - p * 34;
  if (p < 2.1 || Math.floor(p * 12) % 2) g.blitK(NOTE, xx, yy, 2);
  return [xx + 4, yy + 4];
}

/* ---------- 13. 月下弹琴（23.69~25.57）：breakdown，她在梅树下弹琴，一个字冒一个发光的音符 ---------- */
function shotQin(c, lt, t) {
  const P = PAL.night, notes = [];
  const { g, tw, moon } = home(t, P, {
    moon: [400, 70, 30],
    inside: silInside(t, '#6A2E1E'),
    front: g => {
      const mx = 396, my = 252;
      mon(g, mx, my, { col: MON.niang, girl: true, sway: swayAt(t), eyes: 'closed' }, 2);
      g.rect(mx - 34, my - 9, 68, 4, '#4A2418'); qin(g, mx - 34, my - 13, 68, { vib: .6, t, vs: Math.floor(t * 3) % 4 });
      g.rect(mx - 30, my - 5, 3, 9, '#3A1A10'); g.rect(mx + 27, my - 5, 3, 9, '#3A1A10');
      [23.54, 24.06, 24.48, 24.99, 25.55].forEach((ts, i) => { const n = noteRise(g, mx - 20 + i * 10, my - 20, t, ts, i); if (n) notes.push(n); });
      petals(g, t, 17, 30, P);
    },
  });
  const z = 1.55 + .2 * ease(lt / 1.875), cx = 380, cy = 210 - lt * 6;
  show(c, g, cx - 240 / z, cy - 135 / z, z);
  homeGlows(c, P, tw, moon);
  for (const [x, y] of notes) glow(c, x, y, 10, '#FFE9A0', .5);
  vignette(c, .5);
}

/* ---------- 14. 琴弦特写（25.57~27.33）：她的红袖拨弦，弦在颤，光点往上飘；最后一根弦绷紧发红 ---------- */
function shotStrings(c, lt, t) {
  const g = pbuf('main');
  g.clear('#0E1030');
  skyFill(g, ['#0A0B24', '#12163E', '#1C2050'], 0, 0, PW, 120);
  stars(g, t, 55, 50, 0, 0, PW, 110, '#FFF6D8');
  // 琴身（斜着横过画面）
  const y0 = 150;
  g.poly([[-10, y0 + 30], [490, y0 - 20], [490, y0 + 40], [-10, y0 + 100]], '#3A1A10');
  g.poly([[-10, y0 + 36], [490, y0 - 14], [490, y0 + 32], [-10, y0 + 90]], '#5A2A18');
  for (let i = 0; i < 13; i++) { const x = 30 + i * 36; g.disc(x, y0 + 30 - x * .1 - 8, 1.5, '#F2E6C0'); }
  const tense = seg(t, 26.6, 27.33);
  for (let s = 0; s < 7; s++) {
    const off = s * 7, hot = s === 3;
    const amp = (hot ? 1 + 3 * tense : 1.2) * (.5 + .5 * Math.sin(t * 3 + s));
    for (let x = -10; x < 490; x++) {
      const base = y0 + 38 + off - (x + 10) * .1, v = Math.sin(t * 50 + s * 1.3 + x * .05) * amp * Math.sin(Math.PI * (x + 10) / 500);
      g.px(x, base + v, hot && tense > 0 ? mixC(C('#E8C27A'), C('#FF4040'), tense) : '#E8C27A');
    }
  }
  // 她的两只红袖在拨弦
  for (const [i, ph] of [[0, 0], [1, 1.7]]) {
    const x = Math.round(150 + i * 170 + Math.sin(t * 2.2 + ph) * 24), y = Math.round(y0 + 30 - x * .1 + 4 - Math.abs(Math.sin(t * 6 + ph)) * 8);
    g.rect(x - 16, -4, 32, y - 18, MON.sleeve); g.rect(x - 16, -4, 4, y - 18, '#FF5A6A'); g.rect(x + 12, -4, 4, y - 18, '#A81A30');
    g.rect(x - 16, y - 24, 32, 6, '#F6D2D8');
    g.rect(x - 11, y - 18, 22, 14, MON.niang); g.rect(x - 11, y - 6, 22, 2, '#C8708A');
    g.rect(x - 12, y - 18, 1, 14, '#1E1226'); g.rect(x + 11, y - 18, 1, 14, '#1E1226'); g.rect(x - 11, y - 4, 22, 1, '#1E1226');
  }
  // 往上飘的光点
  const pts = [];
  for (let i = 0; i < 14; i++) { const p = ((t - 25.57) * .5 + h2(i, 5)) % 1, x = 40 + h2(i, 6) * 400 + Math.sin(p * 6 + i) * 6, y = y0 + 20 - p * 150; g.px(x, y, '#FFE9A0'); g.px(x + 1, y, '#FFE9A0'); pts.push([x, y]); }
  show(c, g);
  for (const [x, y] of pts) glow(c, x, y, 6, '#FFE9A0', .35);
  if (tense > 0) glow(c, 240, y0 + 38 + 21 - 25, 120, '#FF4060', .25 * tense);
  vignette(c, .5);
}

/* ---------- 15. 断弦（27.33~29.32）："断"弦断了；"弦"断头卷起来发红光；"等你"她捧着那根红弦；"系"红弦飘上天 ---------- */
function shotSnap(c, lt, t) {
  const g = pbuf('main');
  g.clear('#0E1030');
  skyFill(g, ['#0A0B24', '#12163E', '#1C2050', '#2A2C66'], 0, 0, PW, PH);
  stars(g, t, 57, 60, 0, 0, PW, 160, '#FFF6D8');
  if (t < 27.95) {
    // 断开的瞬间：弦从中间断开，两头往回弹、卷起来
    const p = easeOut(seg(t, 27.33, 27.7)), y0 = 150;
    g.poly([[-10, y0 + 30], [490, y0 - 20], [490, y0 + 40], [-10, y0 + 100]], '#3A1A10');
    g.poly([[-10, y0 + 36], [490, y0 - 14], [490, y0 + 32], [-10, y0 + 90]], '#5A2A18');
    for (let s = 0; s < 7; s++) {
      const off = s * 7;
      if (s === 3) continue;
      for (let x = -10; x < 490; x++) g.px(x, y0 + 38 + off - (x + 10) * .1, '#E8C27A');
    }
    const by = x => y0 + 38 + 21 - (x + 10) * .1;
    const gap = 6 + p * 90;
    for (let x = -10; x < 240 - gap; x++) g.px(x, by(x) - Math.max(0, x - (240 - gap - 40)) * p * .5, '#FF5050');
    for (let x = 240 + gap; x < 490; x++) g.px(x, by(x) - Math.max(0, (240 + gap + 40) - x) * p * .5, '#FF5050');
    // 火花
    for (let i = 0; i < 16; i++) { const a = h2(i, 8) * 6.28, r = p * (20 + h2(i, 9) * 40); g.px(240 + Math.cos(a) * r, by(240) + Math.sin(a) * r * .6, i % 2 ? '#FFE9A0' : '#FF7A5A'); }
  } else {
    // 她（中景），捧着断了的红弦；红弦一头飘起来，往天上走
    const k = 4, mx = 240, my = 228;
    mon(g, mx, my, { col: MON.niang, girl: true, sway: swayAt(t), arms: t >= 28.78 ? 'up' : 'n', eyes: t >= 28.27 ? (t >= 29.0 ? 'up' : 'sad') : 'dn', tear: t >= 28.27 && t < 28.9 }, k);
    const [hx, hy] = monPt(mx, my, t >= 28.78 ? 23 : 22, t >= 28.78 ? -1 : 7, k);
    const rise = seg(t, 29.0, 29.32);
    const pts = [];
    for (let i = 0; i <= 30; i++) {
      const f = i / 30, x = hx + Math.sin(f * 7 + t * 4) * 10 * f + f * 30, y = hy - f * (60 + rise * 220);
      pts.push([x, y]);
    }
    ribbon(g, pts, '#FF3048', 2);
    g.rect(hx - 3, hy - 2, 6, 4, '#FF3048');
  }
  show(c, g);
  if (t < 27.95) glow(c, 240, 150 + 38 + 21 - 25, 140, '#FF5060', .5 * (1 - seg(t, 27.33, 27.9)));
  else glow(c, 260, 120 - seg(t, 29, 29.32) * 120, 90, '#FF3048', .3);
  vignette(c, .5);
}

/* ---------- 16. 红线飞去京城（29.32~31.19）：一路飞过远山、大河、云，越来越快；"哎呦"京城的城楼迎面过来 ---------- */
function shotThread(c, lt, t) {
  const g = pbuf('main'), P = PAL.night;
  const sp = lt * 120 + lt * lt * 140;   // 越来越快
  skyFill(g, P.sky);
  stars(g, t, 71, 80, 0, 0, PW, 140, P.star);
  moonDisc(g, 380, 56, 20, P);
  const L = (seed, y, amp, f, col, par) => { const x0 = sp * par; ridge(g, seed, y, amp, f, col, x0); };
  L(81, 190, 70, .01, P.mtn[0], .2);
  mist(g, 170, 26, P.mist, .35);
  L(82, 214, 40, .02, P.mtn[1], .45);
  // 大河
  g.rect(0, 228, PW, 42, P.water);
  for (let i = 0; i < 40; i++) { const x = ((h2(i, 3) * 600 - sp * 1.2) % 600 + 600) % 600 - 60; g.hl(x, x + 10 + h2(i, 4) * 20, 232 + h2(i, 5) * 36, P.waterL); }
  for (let j = 0; j < 30; j++) { const y = 230 + j; if (j % 3) g.hlD(372, 388, y, P.moon, .5); }
  // 京城的城楼："哎呦"（30.25）从右边迎面过来
  const cityX = 600 - Math.max(0, (t - 30.0)) * 520;
  if (cityX < 560) {
    g.rect(cityX - 40, 150, 400, 80, '#1A1A3A');
    for (let x = cityX - 40; x < cityX + 360; x += 10) g.rect(x, 144, 6, 6, '#1A1A3A');
    g.rect(cityX + 60, 110, 120, 40, '#22224A'); roof(g, cityX + 120, 92, 80, 18, P, { rw: 50, curl: 8 });
    g.rect(cityX + 100, 190, 40, 40, '#0A0A20'); g.ell(cityX + 120, 190, 20, 14, '#0A0A20');
    for (let i = 0; i < 4; i++) lantern(g, cityX + 70 + i * 34, 120, t, 1, true, i);
  }
  // 红线：头在画面中间偏右，后面拖着一条波浪
  const hx = lerp(120, 330, ease(seg(lt, 0, 1.4))) + Math.sin(t * 9) * 4, hy = 140 + Math.sin(t * 5) * 18;
  const pts = [];
  for (let i = 0; i <= 40; i++) { const f = i / 40; pts.push([hx - f * 360, hy + Math.sin(f * 9 - t * 10) * 10 * f + f * 20]); }
  ribbon(g, pts, '#FF3048', 3);
  g.disc(hx, hy, 3, '#FFB0B8');
  // 速度线
  const speed = seg(lt, .8, 1.875);
  for (let i = 0; i < Math.floor(40 * speed); i++) { const y = h2(i, 7) * PH, x = ((h2(i, 8) * 600 - lt * 1400) % 600 + 600) % 600 - 60; g.hl(x, x + 30 + h2(i, 9) * 40, y, '#E8E8FF'); }
  const shake = speed * 3;
  show(c, g, Math.sin(t * 60) * shake * .3, Math.cos(t * 47) * shake * .3, 1);
  glow(c, hx, hy, 40, '#FF3048', .6);
  glow(c, 380, 56, 50, P.moon, .2);
  vignette(c, .45);
}
