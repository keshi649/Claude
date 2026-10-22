'use strict';
/* shots3.js：副歌两遍（31.2~59.3 秒）和尾奏。
   副歌一：drop 金榜题名（他中了状元）→ 骑马游街 → 她甩着红袖跳舞，他回来了 → 三巡酒 → 月上枝头 → 屋顶依偎 → 孔明灯
   副歌二：他把那根断弦（红线）系在两人手上 → 春天开花、花轿 → 梨花像雪落满楼 → 拜天地 → 夫妻对拜 → 雪落满头、白首
   尾奏：雪夜的绣楼（和开头一样的地方），池塘里一对鸳鸯，片尾字幕。 */

/* 彩纸、烟花 */
function confetti(g, t, t0, seed, n, x0, y0, spread = 1) {
  const p = t - t0; if (p < 0 || p > 2.5) return;
  const cols = ['#FF3D5A', '#F2C14E', '#FFFFFF', '#5AD0A0', '#FF8A3A'];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (h2(i, seed) - .5) * 2.4 * spread, v = 60 + h2(i, seed + 1) * 90;
    const x = x0 + Math.cos(a) * v * p + Math.sin(p * 8 + i) * 2, y = y0 + Math.sin(a) * v * p + 70 * p * p;
    g.px(x, y, cols[i % cols.length]); if (Math.floor(p * 10 + i) % 2) g.px(x + 1, y, cols[i % cols.length]);
  }
}
function firework(g, t, t0, x, y, col, seed = 0, r = 30) {
  const p = t - t0; if (p < 0 || p > 1.6) return null;
  if (p < .3) { g.px(x, y + (1 - p / .3) * 60, '#FFE9A0'); g.px(x, y + (1 - p / .3) * 60 + 1, '#FF9A3A'); return null; }
  const q = (p - .3) / 1.3, rr = r * easeOut(q);
  for (let i = 0; i < 20; i++) { const a = i / 20 * 6.283 + seed, xx = x + Math.cos(a) * rr, yy = y + Math.sin(a) * rr + q * q * 14; if (q < .8 || i % 2) { g.px(xx, yy, col); if (q < .5) g.px(xx * .9 + x * .1, yy * .9 + y * .1, '#FFF6D8'); } }
  return [x, y, 1 - q];
}

/* 金榜上的名字：每列一个三个字的名字（像素字），第一列是他——"克劳德"（Claude） */
const SURN = '李王张刘陈杨赵黄周吴徐孙胡朱高林何郭马罗梁宋郑谢韩唐冯董萧程曹袁邓许傅沈曾彭吕苏卢蒋蔡丁魏薛叶余潘杜戴夏钟汪田任姜范方石姚谭廖邹熊陆孔白崔康毛邱秦江史顾侯邵孟龙万段雷钱汤尹黎易常武乔贺赖龚文';
const GIVEN = '子文明德远清华安云风玉书山之志成星辰鸿飞景然思源墨言知秋怀瑾辞舟川';
function listName(i) { return i === 0 ? '克劳德' : SURN[Math.floor(h2(i, 3) * SURN.length)] + GIVEN[Math.floor(h2(i, 4) * GIVEN.length)] + GIVEN[Math.floor(h2(i, 5) * GIVEN.length)]; }

/* ---------- 17. drop：金榜题名（31.19~33.07）：黄榜一下子展开，第一名"克劳德"就是他；他跳起来，乌纱帽、大红花一样样上身 ---------- */
function shotList(c, lt, t) {
  const g = pbuf('main');
  skyFill(g, ['#6AB8F0', '#8ACAF2', '#B8E0F6', '#FBE7B8']);
  const fw = [];
  [[31.19, 70, 40, '#FF5A6A'], [31.66, 410, 34, '#FFD84A'], [32.13, 110, 28, '#7AE0FF'], [32.6, 370, 46, '#FF8AD0']].forEach(([ts, x, y, col], i) => { const f = firework(g, t, ts, x, y, col, i); if (f) fw.push([...f, col]); });
  // 红墙、黄琉璃瓦
  g.rect(0, 52, PW, 190, '#A8242E'); g.rectD(0, 52, PW, 190, '#8A1A24', .25);
  roof(g, 240, 32, 300, 20, PAL.spring, { rw: 230, curl: 6, col: '#E0A82E', colL: '#FFD860', eave: '#FFE890', tile: '#B8801E', ridge: '#B8801E' });
  g.rect(0, 236, PW, 34, '#C8A880'); g.hl(0, PW, 236, '#E0C8A0');
  // 金榜：从上往下展开
  const un = easeOut(seg(t, 31.19, 31.45)), lx = 100, ly = 62, lw = 280, lh = 112;
  g.rect(lx - 6, ly - 6, lw + 12, 8, '#6A3A1A');
  const vh = Math.round(lh * un);
  if (vh > 0) {
    g.rect(lx, ly, lw, vh, '#F5D76E'); g.rect(lx + 3, ly + 3, lw - 6, Math.max(0, vh - 6), '#FBE7A0');
    if (vh > 30) g.blit(textPBc('金榜', { font: 'ms', size: 26, col: '#C0392B' }), lx + lw / 2 - 30, ly + 2);
    for (let i = 0; i < 12; i++) {   // 一列列名字（竖排，从右往左）
      const x = lx + lw - 26 - i * 21, nm = listName(i);
      for (let j = 0; j < 3; j++) { const y = ly + 40 + j * 13; if (y + 12 < ly + vh - 3) g.blit(textPBc(nm[j], { col: i === 0 ? '#C0392B' : '#3A2A1A' }), x - 2, y - 2); }
    }
    if (vh >= lh - 2) {   // 第一名画红圈
      const p = easeOutBack(seg(t, 31.45, 31.75));
      const cx = lx + lw - 20, cy = ly + 60, rx = 12 + 30 * (1 - p), ry = 26 + 30 * (1 - p);
      for (let a = 0; a < 6.283; a += .02) { g.px(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, '#E0243C'); g.px(cx + Math.cos(a) * (rx + 1), cy + Math.sin(a) * (ry + 1), '#E0243C'); }
    }
    g.rect(lx - 6, ly + vh - 2, lw + 12, 6, '#6A3A1A');
  }
  // 人群：两边各一堆，中间给他留出位置，每拍跳一下
  for (let r = 0; r < 2; r++) for (let i = 0; i < 12; i++) {
    const side = i < 6 ? -1 : 1, x = side < 0 ? 14 + (i % 6) * 26 + r * 12 : 466 - (i % 6) * 26 - r * 12, y = 226 + r * 18;
    const jump = h2(i, r) > .5 ? hop(t + .1 * r, 3) : hop(t + .23, 2);
    mon(g, x, y + jump, { col: CROWD_COLS[(i + r * 3) % CROWD_COLS.length], hat: ['straw', 'cap', 'bun', 'kid', null][(i + r) % 5], eyes: t > 31.3 ? 'happy' : 'up', arms: t > 31.3 && (i + r) % 2 ? 'up' : 'n' }, 1);
  }
  // 他：先找名字，看到了一跳；"你、莫、愁"乌纱帽、大红花、彩纸
  const mx = 240, my = 232, k = 3;
  const found = t >= 31.82;
  const jump = found ? -Math.round(Math.abs(Math.sin((t - 31.82) * 7)) * 10) : 0;
  const o = { col: MON.lang, scholar: t < 32.38, zhuang: t >= 32.38, eyes: !found ? 'up' : (t < 32.0 ? 'wide' : 'happy'), arms: found ? 'up' : 'n', sway: swayAt(t) };
  mon(g, mx, my + jump, o, k);
  if (t >= 32.38 && t < 32.7) { const p = seg(t, 32.38, 32.7); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; g.px(mx + Math.cos(a) * (20 + p * 30), my - 70 + jump + Math.sin(a) * (8 + p * 14), '#FFE9A0'); } }
  confetti(g, t, 32.94, 7, 80, mx, my - 50, 1.3);
  confetti(g, t, 31.25, 9, 60, 240, 110, 1.6);
  const z = 1 + .06 * pulse(t), sh = t < 31.6 ? (31.6 - t) * 10 : 0;
  show(c, g, (Math.sin(t * 70) * sh) / 4 + (480 - 480 / z) / 2, (Math.cos(t * 53) * sh) / 4 + (270 - 270 / z) / 2, z);
  for (const [x, y, a, col] of fw) glow(c, x, y, 40, col, .4 * a);
  if (found) glow(c, mx, my - 30 + jump, 50, '#FFE9A0', .4 * Math.exp(-(t - 31.82) * 1.5));
  vignette(c, .3);
}

/* 白马（侧面朝右）：(x, y) 是蹄子底下的中点；f 是步子的帧 */
function horse(g, x, y, f, o = {}) {
  const W_ = '#F4F2EC', S_ = '#C8C6D8', D_ = '#8A88A0', M = '#6A6880';
  const legs = [[-11, 0], [-7, 1], [7, 1], [11, 0]];
  legs.forEach(([lx, ph], i) => { const up = ((f + ph) % 2) * 3; g.rect(x + lx, y - 12, 3, 12 - up, i % 2 ? S_ : W_); g.rect(x + lx, y - up - 2, 3, 2, D_); });
  g.ell(x, y - 18, 17, 8, W_); g.ell(x + 2, y - 15, 13, 4, S_);
  g.poly([[x + 10, y - 22], [x + 17, y - 38], [x + 23, y - 36], [x + 18, y - 18]], W_);
  g.rect(x + 17, y - 42, 11, 8, W_); g.rect(x + 25, y - 38, 4, 5, S_); g.px(x + 22, y - 40, '#1A1A1A');
  g.rect(x + 18, y - 45, 3, 4, W_);
  for (let i = 0; i < 8; i++) g.rect(x + 11 + i, y - 24 - i * 2 - 2, 3, 3, M);   // 鬃毛
  g.poly([[x - 16, y - 22], [x - 22, y - 8 + Math.sin(f) * 2], [x - 18, y - 6]], M);   // 尾巴
  // 红色的马鞍布、笼头、额头上的红花
  g.rect(x - 8, y - 27, 16, 9, '#C8102E'); g.rect(x - 8, y - 19, 16, 2, '#F2C14E');
  g.line(x + 18, y - 38, x + 27, y - 36, '#C8102E'); g.disc(x + 21, y - 44, 2.5, '#E0243C'); g.px(x + 21, y - 44, '#FFD34E');
}

/* ---------- 18. 骑马游街（33.07~34.94）：他骑白马、戴乌纱帽和大红花，街两边的人跳着欢呼 ---------- */
function shotParade(c, lt, t) {
  const g = pbuf('main'), P = PAL.spring;
  skyFill(g, ['#7EC3EE', '#A6D6F2', '#D6ECF8']);
  const sx = lt * 70;
  // 街两边的铺子（往左滚）
  for (let i = -1; i < 6; i++) {
    const bx = ((i * 110 - sx) % 660 + 660) % 660 - 110, seed = Math.floor((i * 110 - sx) / 660) * 7 + i;
    g.rect(bx, 90, 100, 90, '#E8E0D0'); g.rect(bx, 150, 100, 30, '#7A3A2A');
    roof(g, bx + 50, 70, 62, 16, P, { rw: 34, curl: 6 });
    g.rect(bx + 10, 104, 30, 34, '#6A3A2A'); g.rect(bx + 60, 104, 30, 34, '#6A3A2A');
    for (let y = 106; y < 138; y += 6) { g.hl(bx + 10, bx + 40, y, '#9A6A4A'); g.hl(bx + 60, bx + 90, y, '#9A6A4A'); }
    const sign = ['酒', '茶', '书', '饼', '布', '药'][(i + 6) % 6];
    g.rect(bx + 44, 96, 12, 40, '#F2E2B0'); g.blit(textPBc(sign, { col: '#2A1A10' }), bx + 43, 110);
    lantern(g, bx + 4, 86, t, 1, true, i); lantern(g, bx + 96, 86, t, 1, true, i + 3);
  }
  // 两排灯笼串
  for (let x = -20; x < 500; x += 22) { const xx = ((x - sx * 1.2) % 520 + 520) % 520 - 20; g.disc(xx, 60 + Math.sin(xx * .03) * 4, 3, '#E8323A'); g.px(xx, 59 + Math.sin(xx * .03) * 4, '#FF8A5A'); }
  g.rect(0, 180, PW, 90, '#B8A080'); for (let i = 0; i < 14; i++) g.hl(((i * 40 - sx * 1.6) % 520 + 520) % 520 - 20, ((i * 40 - sx * 1.6) % 520 + 520) % 520 + 10, 200 + (i % 3) * 20, '#A08868');
  // 后排人群
  for (let i = 0; i < 16; i++) { const x = ((i * 34 - sx) % 544 + 544) % 544 - 20; mon(g, x, 196 + hop(t + i * .07, 2), { col: CROWD_COLS[i % CROWD_COLS.length], hat: ['straw', 'cap', 'bun', 'kid', null][i % 5], eyes: 'happy', arms: (i + Math.floor(t * 4)) % 2 ? 'up' : 'n' }, 1); }
  // 他和马（原地小跑，背景在动）：先画在小缓冲上，再放大两倍
  const hb = pbuf('horse', 90, 110); hb.clear(0);
  const f = Math.floor(t * 8), bob = f % 2;
  horse(hb, 44, 108 - bob, f);
  mon(hb, 43, 82 - bob, { col: MON.lang, zhuang: true, eyes: 'happy', arms: Math.floor(t * 4) % 2 ? 'upR' : 'upL', sway: swayAt(t) }, 1);
  hb.rect(36, 81 - bob, 16, 9, '#C8102E'); hb.rect(36, 89 - bob, 16, 2, '#F2C14E');
  g.blitK(hb, 240 - 88, 236 - 216, 2);
  // 前排人群（前景，只露出头和举起的手）
  for (let i = 0; i < 9; i++) { const x = ((i * 64 - sx * 1.8) % 576 + 576) % 576 - 30; if (Math.abs(x - 240) < 50) continue; mon(g, x, 296 + hop(t + i * .11, 3), { col: CROWD_COLS[(i + 4) % CROWD_COLS.length], hat: ['cap', 'bun', 'kid', 'straw'][i % 4], eyes: 'happy', arms: 'up' }, 2); }
  // 鞭炮的火花
  for (let i = 0; i < 3; i++) { const ts = 33.1 + i * .62; confetti(g, t, ts, 20 + i, 30, 80 + i * 160, 180, .8); }
  showPump(c, g, t, .03);
  vignette(c, .25);
}

/* ---------- 19. 红袖（34.94~36.82）：灯会夜，她听到消息，甩着两条红水袖跳舞；最后月洞门里出现他的身影 ---------- */
function shotSleeves(c, lt, t) {
  const g = pbuf('main'), P = PAL.fest;
  skyFill(g, P.sky);
  stars(g, t, 91, 60, 0, 0, PW, 120, P.star);
  const fw = [];
  [[35.0, 90, 50, '#FF5A6A'], [35.47, 380, 40, '#FFD84A'], [35.94, 150, 30, '#7AE0FF'], [36.4, 330, 56, '#FF8AD0']].forEach(([ts, x, y, col], i) => { const f = firework(g, t, ts, x, y, col, i, 26); if (f) fw.push([...f, col]); });
  // 院墙 + 右边的月洞门
  wallSeg(g, 0, PW, 120, 210, P, {});
  g.rect(0, 206, PW, 64, '#3A2A4A'); g.rectD(0, 206, PW, 64, '#4A3A5A', .3);
  const gx = 400, gy = 168;
  g.disc(gx, gy, 40, '#1A1430');
  g.rect(gx - 40, gy, 80, 42, '#1A1430');
  if (t >= 36.25) {   // 门里亮起来，他的剪影（乌纱帽的两只翅很好认）
    const a = seg(t, 36.25, 36.5);
    g.discD(gx, gy, 38, '#FFB050', a * .6);
    mon(g, gx, 208, { col: MON.lang, zhuang: true, ol: false }, 2, { sil: '#140A18', lv: a });
  }
  g.ring(gx, gy, 41, '#2A2238', 3);
  for (let i = 0; i < 6; i++) lantern(g, 30 + i * 70, 112, t, 1, true, i);
  // 她：两条长红袖跟着拍子甩
  const mx = 196, my = 222, k = 3;
  const ph = beatPos(t) * Math.PI / 2;
  mon(g, mx, my + hop(t, 2), { col: MON.niang, girl: true, sway: swayAt(t), eyes: t >= 36.3 ? 'wide' : 'happy', arms: 'up' }, k);
  const [lx, ly] = monPt(mx, my, 1, -1, k), [rx, ry] = monPt(mx, my, 23, -1, k);
  const wrap = seg(t, 35.81, 36.27), fly = seg(t, 36.27, 36.7);
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? lx : rx, y0 = s < 0 ? ly : ry, pts = [];
    for (let i = 0; i <= 40; i++) {
      const f = i / 40;
      // 绸子：先往外甩出去，再垂下来打个弯；跟着拍子起伏，"挽"的时候往回收，"红袖"往上飞
      const out = s * f * (110 - 50 * wrap), wv = Math.sin(ph * 2 + f * 6.5 + (s < 0 ? 0 : 1.6)) * 16 * f;
      const drop = f * f * 70 * (1 - fly) - fly * 80 * f;
      pts.push([x0 + out + s * Math.sin(f * 3 + ph) * 8 * wrap, y0 - 6 + drop + wv - f * 20]);
    }
    for (let i = 0; i + 1 < pts.length; i++) {
      const w = Math.max(1, Math.round(7 * (1 - i / pts.length * .8)));
      const [xa, ya] = pts[i], [xb, yb] = pts[i + 1], n = Math.ceil(Math.hypot(xb - xa, yb - ya));
      for (let q = 0; q <= n; q++) { const x = lerp(xa, xb, q / n), y = lerp(ya, yb, q / n); g.rect(Math.round(x - w / 2), Math.round(y - w / 2), w, w, MON.sleeve); g.px(x, y - w / 2, '#FF6A7A'); }
    }
  }
  petals(g, t, 93, 26, P, { cols: ['#FF8AB0', '#FFD84A'] });
  showPump(c, g, t, .025);
  for (const [x, y, a, col] of fw) glow(c, x, y, 36, col, .4 * a);
  for (let i = 0; i < 6; i++) glow(c, 30 + i * 70, 124, 12, '#FF5A30', .45);
  if (t >= 36.25) glow(c, gx, gy, 50, '#FFB050', .4 * seg(t, 36.25, 36.5));
  vignette(c, .4);
}

/* ---------- 20. 三巡酒（36.82~38.69）："三、巡、酒"碰三次杯，一次比一次脸红 ---------- */
function shotFeast(c, lt, t) {
  const g = pbuf('main'), P = PAL.fest;
  skyFill(g, P.sky);
  stars(g, t, 95, 60, 0, 0, PW, 130, P.star);
  moonDisc(g, 360, 64, 34, P);
  plumTree(g, 120, 300, 13, P, { scale: 1.2, lean: .5, depth: 4 });
  for (let i = 0; i < 4; i++) lantern(g, 40 + i * 130, 0, t, 2, true, i);
  // 桌子
  const k = 3, Lx = 170, Rx = 310, my = 226;
  const clinks = [37.62, 38.10, 38.57];
  const n = clinks.filter(x => t >= x).length;
  const near = clinks.find(x => t >= x - .22 && t < x + .2);
  const lift = near !== undefined ? 1 : 0;
  mon(g, Lx, my + hop(t, 1), { col: MON.lang, zhuang: true, eyes: n >= 3 && t > 38.75 ? 'closed' : 'happy', arms: lift ? 'upR' : 'n', blush: n >= 2, sway: swayAt(t) }, k);
  mon(g, Rx, my + hop(t, 1), { col: MON.niang, girl: true, eyes: n >= 2 ? 'happy' : 'n', arms: lift ? 'upL' : 'n', sway: swayAt(t, 1) }, k);
  g.rect(110, 200, 260, 8, '#8A3A2A'); g.rect(110, 208, 260, 70, '#5A2018'); g.rect(110, 200, 260, 2, '#B85A4A');
  g.rect(226, 186, 28, 14, '#E8E2D0'); g.rect(232, 180, 16, 6, '#E8E2D0'); g.rect(236, 176, 8, 4, '#C0392B');   // 酒壶
  // 两只杯子：碰杯时举到中间
  const cx = 240, cy = 150;
  const [lhx, lhy] = monPt(Lx, my, 23, -1, k), [rhx, rhy] = monPt(Rx, my, 1, -1, k);
  const meet = near !== undefined ? easeOut(seg(t, near - .22, near)) * (1 - seg(t, near + .05, near + .2)) : 0;
  cup(g, lerp(lhx + 4, cx - 6, meet), lerp(lhy - 8, cy, meet), 3);
  cup(g, lerp(rhx - 4, cx + 6, meet), lerp(rhy - 8, cy, meet), 3);
  if (lift === 0) { cup(g, 190, 188, 3); cup(g, 290, 188, 3); }
  // 碰杯的火花和"一、二、三"
  const sparks = [];
  clinks.forEach((ts, i) => {
    if (t >= ts && t < ts + .5) {
      const p = (t - ts) / .5;
      for (let j = 0; j < 10; j++) { const a = j / 10 * 6.283, r = 6 + p * 22; g.px(cx + Math.cos(a) * r, cy + Math.sin(a) * r, j % 2 ? '#FFE9A0' : '#FFFFFF'); }
      sparks.push([cx, cy, 1 - p]);
    }
    if (t >= ts) g.blitK(textPBc('一二三'[i], { col: '#FFE9A0', ol: '#4A1A2A' }), 196 + i * 30, 30 - Math.round(easeOutBack(seg(t, ts, ts + .25)) * 8), 2);
  });
  petals(g, t, 97, 20, P);
  showPump(c, g, t, .025);
  glow(c, 360, 64, 90, P.moon, .2);
  for (const [x, y, a] of sparks) glow(c, x, y, 30, '#FFE9A0', .6 * a);
  for (let i = 0; i < 4; i++) glow(c, 40 + i * 130, 18, 16, '#FF5A30', .45);
  vignette(c, .4);
}

/* ---------- 21. 月上枝头（38.69~40.57）：月亮从远处的屋脊后面升起来，"头"的时候正好停在梅枝上面；两人坐在左下的屋顶上看 ---------- */
function shotMoonrise(c, lt, t) {
  const g = pbuf('main'), P = PAL.fest;
  skyFill(g, ['#0E0A26', '#1C1240', '#2E1A56', '#4A2A6A', '#6A3A6E']);
  stars(g, t, 99, 90, 0, 0, PW, 200, P.star);
  const my_ = lerp(236, 92, easeOut(seg(t, 39.07, 40.46)));
  moonDisc(g, 270, my_, 36, P);
  // 远处一排屋脊（月亮从后面升起来）
  ridge(g, 141, 236, 12, .03, '#2A1A44');
  for (let i = 0; i < 5; i++) roof(g, 160 + i * 80, 214 + (i % 2) * 6, 36, 10, P, { rw: 18, curl: 4, col: '#1E1234', colL: '#3A2A5A', eave: '#4A3A6A', tile: '#140C26' });
  g.rect(0, 226, PW, 44, '#1A1030');
  // 梅枝：从右边横着伸进来，枝头正好在月亮最后停的地方下面
  layer('moonbranch', PW, PH, p => {
    const segs = treeSegs(57, 500, 150, 230, Math.PI + .12, 3, 7);
    for (const [x0, y0, x1, y1, w] of segs) { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0)); for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n), y = lerp(y0, y1, i / n); p.disc(x, y, w / 2, '#1E1428'); if (w > 2) p.px(x, y - w / 2, '#3A2A4A'); } }
    const r = rng(58);
    for (const [x0, y0, x1, y1, w, d] of segs) if (d <= 2) for (let k = 0; k < 3; k++) { const f = r(), x = lerp(x0, x1, f) + (r() - .5) * 4, y = lerp(y0, y1, f) + (r() - .5) * 4; p.disc(x, y, 1.6, '#F6B6CC'); p.px(x, y, '#FFE6EF'); }
  });
  g.blit(_LAYERS.moonbranch, 0, 0);
  // 左下：两人坐在近处的屋脊上，抬头看月亮
  roof(g, 70, 206, 110, 40, PAL.night, { rw: 80, curl: 10, col: '#1A1430', colL: '#3A3060', eave: '#4A4070', tile: '#120E24', ridge: '#120E24' });
  mon(g, 58, 206, { col: MON.lang, zhuang: true, eyes: 'up', ol: '#120A1C' }, 2);
  mon(g, 100, 206, { col: MON.niang, girl: true, eyes: 'up', sway: swayAt(t), ol: '#120A1C' }, 2);
  petals(g, t, 101, 30, P);
  show(c, g);
  glow(c, 270, my_, 110, P.moon, .3);
  vignette(c, .4);
}

/* ---------- 22. 屋顶上（40.57~42.44）：两人坐在屋脊上，"我"她靠到他肩上，"心"冒出一颗心 ---------- */
function shotRoof(c, lt, t) {
  const g = pbuf('main'), P = PAL.fest;
  skyFill(g, ['#0E0A26', '#1C1240', '#2E1A56', '#4A2A6A']);
  stars(g, t, 103, 100, 0, 0, PW, 200, P.star);
  moonDisc(g, 240, 120, 96, P);
  // 屋脊（前景）
  roof(g, 240, 196, 330, 70, PAL.night, { rw: 260, curl: 18, col: '#1A1430', colL: '#3A3060', eave: '#4A4070', tile: '#120E24', ridge: '#120E24' });
  const k = 3, lean = easeOut(seg(t, 41.25, 41.6));
  mon(g, 212, 196, { col: MON.lang, zhuang: true, eyes: t >= 41.3 ? 'closed' : 'r', blush: t >= 41.41, ol: '#120A1C' }, k);
  mon(g, 268 - lean * 8, 196 + lean * 2, { col: MON.niang, girl: true, eyes: t >= 41.25 ? 'closed' : 'l', sway: swayAt(t), ol: '#120A1C' }, k);
  const hs = [];
  if (t >= 41.41) { const p = easeOutBack(seg(t, 41.41, 41.7)); heart(g, 240, 112 - p * 20, 3); hs.push([240, 112 - p * 20]); }
  if (t >= 41.87) for (let i = 0; i < 5; i++) { const p = (t - 41.87 - i * .18); if (p > 0) { const x = 240 + Math.sin(p * 3 + i) * 30 + (i - 2) * 14, y = 100 - p * 26; heart(g, x, y, 1); } }
  show(c, g);
  glow(c, 240, 120, 180, P.moon, .22);
  for (const [x, y] of hs) glow(c, x, y, 26, '#FF5A8A', .45);
  vignette(c, .45);
}

/* ---------- 23. 孔明灯（42.44~44.32）：全景，满天孔明灯往上飘；池塘里两只鸳鸯挨在一起；两人小小地坐在屋顶 ---------- */
function shotLanterns(c, lt, t) {
  const P = PAL.fest, lans = [];
  const { g, tw, moon } = home(t, P, {
    moon: [440, 60, 24],
    behindTree: (g, tw) => {
      mon(g, 172, tw.top + 4, { col: MON.lang, zhuang: true, ol: false }, 1, { sil: '#120A20' });
      mon(g, 188, tw.top + 4, { col: MON.niang, girl: true, ol: false }, 1, { sil: '#120A20' });
    },
    front: g => {
      duck(g, 300, 282, t, true, false); duck(g, 318, 284, t, false, true, 1);
      for (let i = 0; i < 44; i++) {
        const p = ((t - 42.0) * (.06 + h2(i, 4) * .05) + h2(i, 5)) % 1, x = 30 + h2(i, 6) * 500 + Math.sin(t * .5 + i) * 6, y = 300 - p * 330;
        const s = .6 + (1 - p) * .8;
        g.rect(x - 2 * s, y - 3 * s, 4 * s, 5 * s, '#FF9A4A'); g.rect(x - 1 * s, y - 2 * s, 2 * s, 2 * s, '#FFE0A0');
        lans.push([x, y, s]);
      }
    },
  });
  const z = 1.18 - .16 * ease(lt / 1.875);
  show(c, g, 270 - 240 / z, 158 - 135 / z, z);
  homeGlows(c, P, tw, moon);
  for (const [x, y, s] of lans) glow(c, x, y, 6 * s + 4, '#FF9A40', .35);
  vignette(c, .4);
}

/* 两人面对面站在院子里的中景（副歌二的前两个镜头共用） */
function courtyard(g, t, P) {
  skyFill(g, P.sky);
  stars(g, t, 105, 70, 0, 0, PW, 120, P.star);
  moonDisc(g, 400, 50, 22, P);
  wallSeg(g, 0, PW, 128, 200, P, { win: [90] });
  plumTree(g, 380, 290, 37, P, { scale: 1.2, lean: -.2, depth: 5 });
  g.rect(0, 200, PW, 70, '#3A2A4A'); g.rectD(0, 200, PW, 70, '#4A3A5A', .3);
  for (let i = 0; i < 5; i++) lantern(g, 20 + i * 110, 116, t, 1, true, i);
}

/* ---------- 24. 掏出红线（44.32~46.19）："哎呦"他害羞地掏出那根断弦（红线），她一愣 ---------- */
function shotOffer(c, lt, t) {
  const g = pbuf('main'), P = PAL.fest;
  courtyard(g, t, P);
  const k = 3, Lx = 170, Rx = 310, my = 224;
  const out = t >= 45.22;
  mon(g, Lx, my, { col: MON.lang, zhuang: true, eyes: out ? 'r' : 'dn', blush: true, arms: out ? 'upR' : 'n' }, k);
  mon(g, Rx, my, { col: MON.niang, girl: true, sway: swayAt(t), eyes: t >= 45.53 ? (t >= 45.95 ? 'happy' : 'wide') : 'l', blush: true }, k);
  if (out) {   // 红线：从他手里垂下来，轻轻晃
    const [hx, hy] = monPt(Lx, my, 23, -1, k), p = easeOutBack(seg(t, 45.22, 45.5));
    const pts = []; for (let i = 0; i <= 16; i++) { const f = i / 16; pts.push([hx + 4 + f * 26 * p, hy - 4 + Math.sin(f * 3.14) * 14 + Math.sin(t * 4 + f * 6) * 2]); }
    ribbon(g, pts, '#FF3048', 2);
  }
  if (t >= 45.53 && t < 46.0) g.blit(textPBc('!', { col: '#FFE9A0', ol: '#2A1028' }), Rx - 4, 140);
  petals(g, t, 107, 22, P);
  showPump(c, g, t, .025);
  for (let i = 0; i < 5; i++) glow(c, 20 + i * 110, 128, 12, '#FF5A30', .45);
  if (out) glow(c, Lx + 50, 170, 30, '#FF3048', .3);
  vignette(c, .4);
}

/* ---------- 25. 系上（46.19~48.07）：红线绕住两人的手，"娘子"打成一个结，"你莫忧"结变成一颗心 ---------- */
function shotTie(c, lt, t) {
  const g = pbuf('main'), P = PAL.fest;
  g.clear('#1A1030');
  skyFill(g, ['#140A2A', '#22103C', '#341650', '#4A1E5C'], 0, 0, PW, PH);
  for (let i = 0; i < 30; i++) { const x = h2(i, 3) * PW, y = h2(i, 4) * PH; g.discD(x, y, 6 + h2(i, 5) * 10, '#5A2A6A', .3); }   // 散景光斑
  const k = 5, Lx = 150, Rx = 330, my = 262;
  const tied = t >= 46.73, hearted = t >= 47.37;
  mon(g, Lx, my, { col: MON.lang, zhuang: true, eyes: hearted ? 'happy' : 'r', blush: true }, k);
  mon(g, Rx, my, { col: MON.niang, girl: true, sway: swayAt(t), eyes: hearted ? 'happy' : 'l', blush: true }, k);
  const [ax, ay] = monPt(Lx, my, 24, 6, k), [bx, by] = monPt(Rx, my, 0, 6, k);
  // 红线：先松松地搭着，"娘"开始收紧，"子"打成结
  const tight = easeOut(seg(t, 46.4, 47.09));
  const mxp = (ax + bx) / 2, myp = (ay + by) / 2 + 30 * (1 - tight);
  const pts = []; for (let i = 0; i <= 30; i++) { const f = i / 30; pts.push([lerp(ax, bx, f), lerp(ay, by, f) + Math.sin(f * Math.PI) * (myp - (ay + by) / 2) + Math.sin(f * 9 + t * 3) * 2 * (1 - tight)]); }
  ribbon(g, pts, '#FF3048', 3);
  g.rect(ax - 4, ay - 4, 8, 8, '#FF3048'); g.rect(bx - 4, by - 4, 8, 8, '#FF3048');
  if (tied) {   // 蝴蝶结
    const cx = mxp, cy = (ay + by) / 2, p = easeOutBack(seg(t, 46.73, 47.0));
    g.poly([[cx, cy], [cx - 14 * p, cy - 8 * p], [cx - 14 * p, cy + 8 * p]], '#FF3048'); g.poly([[cx, cy], [cx + 14 * p, cy - 8 * p], [cx + 14 * p, cy + 8 * p]], '#FF3048');
    g.disc(cx, cy, 3, '#C81E3A');
  }
  const hs = [];
  if (hearted) { const p = easeOutBack(seg(t, 47.37, 47.7)), hy = (ay + by) / 2 - 20 - p * 50; heart(g, mxp, hy, 4); hs.push([mxp, hy]); }
  if (t >= 47.53) for (let i = 0; i < 8; i++) { const p = t - 47.53 - i * .08; if (p > 0) heart(g, mxp + Math.cos(i) * p * 90, (ay + by) / 2 - 60 - p * 40 + Math.sin(i * 2) * p * 50, 1); }
  showPump(c, g, t, .025);
  glow(c, mxp, (ay + by) / 2, 40, '#FF3048', .35);
  for (const [x, y] of hs) glow(c, x, y, 40, '#FF5A8A', .5);
  vignette(c, .4);
}

/* 花轿 */
function sedan(g, x, y, t) {
  g.rect(x - 14, y - 30, 28, 26, '#C8102E'); g.rect(x - 16, y - 34, 32, 5, '#F2C14E'); g.poly([[x - 12, y - 34], [x, y - 44], [x + 12, y - 34]], '#C8102E'); g.rect(x - 2, y - 47, 4, 4, '#F2C14E');
  g.rect(x - 8, y - 24, 16, 16, '#E8323A'); g.blit(textPBc('囍', { col: '#F2C14E' }), x - 7, y - 23);
  g.rect(x - 40, y - 14, 80, 3, '#6A3A1A');
}

/* ---------- 26. 春来（48.07~49.94）："待、到、春"三拍满树开花，花轿过桥 ---------- */
function shotSpring(c, lt, t) {
  const P = PAL.spring;
  const stage = t >= 49.83 ? 3 : t >= 49.39 ? 2 : t >= 48.91 ? 1 : 0;
  const bloom = ['#6A4A38', '#F7C3D3', '#F7B3C9', '#F59AB8'][stage];
  const { g, tw } = home(t, P, {
    moon: null, bloom: stage ? bloom : P.trunk, bloomL: stage >= 2 ? '#FFFFFF' : P.trunk, lanterns: true,
    sky: g => { g.disc(90, 50, 16, '#FFF8E0'); g.discD(90, 50, 24, '#FFFFFF', .3); },
    front: g => {
      // 石拱桥（侧面）：拱起的桥面、半圆的桥洞、两边栏杆
      const deck = x => 262 - Math.max(0, 1 - Math.pow((x - 300) / 96, 2)) * 26;
      for (let x = 204; x <= 396; x++) {
        const top = deck(x), d = Math.abs(x - 300), hole = d < 34 ? 290 - Math.sqrt(34 * 34 - d * d) : 999;
        for (let y = Math.round(top); y < 296; y++) if (y < hole) g.px(x, y, (y - top) < 3 ? '#C8C6BC' : ((x + Math.floor(y / 5)) % 9 === 0 || y % 5 === 0) ? '#8E8C84' : '#A9A79E');
        if (x % 12 === 0) g.rect(x, top - 7, 2, 7, '#8E8C84');
        g.px(x, top - 7, '#C8C6BC');
      }
      for (let y = 256; y < 300; y++) for (let x = 266; x <= 334; x++) { const d = Math.abs(x - 300); if (y >= 290 - Math.sqrt(Math.max(0, 34 * 34 - d * d)) && y > 262 && (x + y) % 7 === 0) g.px(x, y, '#8CCBE4'); }
      // 迎亲队伍：吹唢呐的、抬花轿的
      const px = lerp(170, 330, lt / 1.875);
      const yAt = x => 262 - Math.max(0, 1 - Math.pow((x - 300) / 96, 2)) * 26;
      for (const [dx, who] of [[-60, 0], [-36, 1], [0, 2], [26, 3]]) {
        const x = px + dx, y = yAt(x) + hop(t + dx * .01, 1);
        if (who === 2) { mon(g, x - 16, y, { col: CROWD_COLS[3], hat: 'cap', eyes: 'happy', legs: Math.floor(t * 6) % 2 + 1 }, 1); mon(g, x + 16, y, { col: CROWD_COLS[5], hat: 'cap', eyes: 'happy', legs: Math.floor(t * 6) % 2 + 1 }, 1); sedan(g, x, y - 6, t); }
        else { mon(g, x, y, { col: CROWD_COLS[who * 2], hat: 'cap', eyes: 'happy', arms: 'upR', legs: Math.floor(t * 6) % 2 + 1 }, 1); g.line(x + 12, y - 16, x + 18, y - 20, '#F2C14E', 2); }
      }
      petals(g, t, 111, 20 + stage * 40, P, { cols: ['#F7B3C9', '#FFFFFF'], speed: 1.4 });
      // 开花的一瞬间，花瓣炸开
      [48.91, 49.39, 49.83].forEach((ts, i) => confetti(g, t, ts, 113 + i, 40, [478, 300, 120][i], 150, 1.8));
    },
  });
  const z = 1.35; show(c, g, 330 - 240 / z, 214 - 135 / z, z);
  vignette(c, .25);
}

/* ---------- 27. 梨花似雪（49.94~51.82）：绣楼挂上红绸和囍字灯笼，白花瓣像雪一样飘，"满楼"屋顶都白了 ---------- */
function shotPetalSnow(c, lt, t) {
  const g = pbuf('pet', 560, 315), P = PAL.spring;
  skyFill(g, ['#F2B8A0', '#F7CDB0', '#FBE2C4', '#FFF2DC']);
  g.disc(430, 90, 22, '#FFF6E0');
  ridge(g, 121, 230, 50, .012, '#D8A8A8');
  mist(g, 200, 30, '#FBE2C4', .4);
  g.rect(0, 250, 560, 65, '#D8C8B0');
  const tw = tower(g, 280, 290, t, P, { w: 92, h1: 44, h2: 40 });
  // 红绸、囍
  for (let i = 0; i < 2; i++) { const y = [tw.roofY + 52, tw.roofY + 104][i]; for (let x = 200; x < 360; x += 2) g.px(x, y + Math.sin((x - 200) / 160 * Math.PI) * 10, '#E0243C'); }
  g.rect(268, tw.win.y + 4, 24, 24, '#E0243C'); g.blit(textPBc('囍', { col: '#F2C14E' }), 273, tw.win.y + 9);
  // 屋顶慢慢积满白花瓣（"满楼"）
  const pile = seg(t, 50.77, 51.72);
  if (pile > 0) {
    for (let x = 0; x < 560; x++) for (let y = 0; y < 300; y++) {
      const v = g.get(x, y);
      if (v === C(P.roof) || v === C(P.tile) || v === C(P.roofL)) { if (h2(x * 3 + y * 7, 5) < pile * .85) g.px(x, y, h2(x, y) < .5 ? '#FFFFFF' : '#F6E6EE'); }
    }
  }
  for (let i = 0; i < 160; i++) {   // 漫天白花瓣
    const p = ((t - 49.0) * (.25 + h2(i, 2) * .3) + h2(i, 1)) % 1, x = (h2(i, 3) * 640 - p * 120 + Math.sin(t * 2 + i) * 8), y = p * 330 - 10;
    g.px(x, y, i % 4 ? '#FFFFFF' : '#FFD8E4'); if (i % 3 === 0) g.px(x + 1, y, '#FFFFFF');
  }
  const z = 1.45 + .05 * ease(lt / 1.875);
  show(c, g, 280 - 240 / z + lt * 3, 196 - 135 / z, z);
  vignette(c, .2);
}

/* 喜堂：红墙、金色的囍、龙凤烛、两边的客人 */
function weddingHall(g, t) {
  g.clear('#6A0A18');
  for (let x = 0; x < PW; x += 16) g.rect(x, 0, 2, 200, '#5A0814');
  g.rect(0, 190, PW, 80, '#3A0A10'); g.rectD(0, 190, PW, 80, '#5A1018', .3);
  g.rect(150, 26, 180, 130, '#8A1020'); g.rect(156, 32, 168, 118, '#B0182A');
  g.blit(textPBc('囍', { font: 'ms', size: 96, col: '#F2C14E', ol: '#7A4A0A' }), 186, 30);
  for (const x of [110, 370]) { g.rect(x - 6, 118, 12, 50, '#E0243C'); g.rect(x - 6, 118, 4, 50, '#FF5A6A'); g.rect(x - 10, 166, 20, 6, '#F2C14E'); const fh = 6 + Math.round(Math.sin(t * 13 + x) * 1.5); g.rect(x - 2, 118 - fh, 4, fh, '#FFE08A'); g.rect(x - 1, 117 - fh, 2, 3, '#FFF6D0'); g.px(x, 117, '#FF8A3A'); }
  for (let i = 0; i < 4; i++) lantern(g, 40 + i * 133, 0, t, 2, true, i);
  // 两边的客人
  for (let i = 0; i < 5; i++) { mon(g, 20 + i * 22, 236 + hop(t + i * .1, 2), { col: CROWD_COLS[i], hat: ['cap', 'bun', 'kid', 'cap', 'bun'][i], eyes: 'happy', arms: (i + Math.floor(t * 4)) % 2 ? 'up' : 'n' }, 1); mon(g, 372 + i * 22, 236 + hop(t + i * .13, 2), { col: CROWD_COLS[i + 5], hat: ['bun', 'cap', 'straw', 'kid', 'cap'][i], eyes: 'happy', arms: (i + Math.floor(t * 4)) % 2 ? 'n' : 'up' }, 1); }
}
function bowDip(t, ts, d = .45) { const p = (t - ts) / d; return p < 0 || p > 1 ? 0 : Math.sin(p * Math.PI); }

/* ---------- 28. 一拜天地（51.82~53.69）："不、负"两拜 ---------- */
function shotBow1(c, lt, t) {
  const g = pbuf('main');
  weddingHall(g, t);
  const k = 3, dip = Math.max(bowDip(t, 52.66), bowDip(t, 53.12));
  for (const [x, o] of [[196, { col: MON.lang, zhuang: true }], [284, { col: MON.niang, bride: true }]]) {
    const r = monPB(Object.assign({ eyes: dip > .3 ? 'closed' : 'happy', blush: true }, o), k);
    g.blit(r.pb, x - r.ax, 232 - r.ay + Math.round(dip * 10));
  }
  confetti(g, t, 52.66, 131, 40, 240, 120, 1.6);
  confetti(g, t, 53.12, 133, 40, 240, 120, 1.6);
  showPump(c, g, t, .025);
  for (const x of [110, 370]) glow(c, x, 106, 30, '#FFB050', .5);
  for (let i = 0; i < 4; i++) glow(c, 40 + i * 133, 22, 18, '#FF5A30', .45);
  vignette(c, .35);
}

/* ---------- 29. 夫妻对拜（53.69~55.57）：转过来对拜，"负"脑门碰到一起，"地久"笑出来 ---------- */
function shotBow2(c, lt, t) {
  const g = pbuf('main');
  weddingHall(g, t);
  const k = 4, dip = bowDip(t, 54.03, .6), bump = t >= 54.53;
  const lean = Math.min(1, dip * 1.6);
  const Lx = 186 + lean * 18, Rx = 294 - lean * 18;
  mon(g, Lx, 236 + Math.round(dip * 8), { col: MON.lang, zhuang: true, eyes: bump ? 'happy' : 'r', blush: true }, k);
  mon(g, Rx, 236 + Math.round(dip * 8), { col: MON.niang, bride: true, eyes: bump ? 'happy' : 'l', blush: true }, k);
  if (t >= 54.33 && t < 54.9) {   // 碰头：小星星
    const p = seg(t, 54.33, 54.9);
    for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283 + p * 3, x = 240 + Math.cos(a) * 16, y = 150 + Math.sin(a) * 6; g.rect(x - 1, y - 1, 3, 3, '#FFE9A0'); }
  }
  if (t >= 55.03) confetti(g, t, 55.03, 141, 60, 240, 130, 1.8);
  if (t >= 55.48) { const p = easeOutBack(seg(t, 55.48, 55.75)); heart(g, 240, 100 - p * 30, 3); }
  showPump(c, g, t, .025);
  for (const x of [110, 370]) glow(c, x, 106, 30, '#FFB050', .5);
  vignette(c, .35);
}

/* ---------- 30. 白首（55.57~57.44）：雪夜，两人坐在梅树下的长凳上；"白"雪落满头，变成白发；"首"相视一笑 ---------- */
function shotOld(c, lt, t) {
  const P = PAL.snow;
  const { g, tw, moon } = home(t, P, {
    moon: [420, 60, 22],
    front: g => {
      duck(g, 200, 282, t, true, false); duck(g, 216, 284, t, false, true, 1);
      g.rect(360, 248, 70, 4, '#5A3A2A'); g.rect(364, 252, 4, 8, '#4A2A1A'); g.rect(422, 252, 4, 8, '#4A2A1A');
      const old = t >= 56.88, k = 2;
      const swap = seg(t, 56.88, 57.3);
      const eyesL = t >= 57.35 ? 'closed' : t >= 56.22 ? 'r' : 'n', eyesR = t >= 57.35 ? 'closed' : t >= 56.42 ? 'l' : 'n';
      const young = [{ col: MON.lang, scholar: true, eyes: eyesL, snow: t >= 56.6 }, { col: MON.niang, girl: true, eyes: eyesR, snow: t >= 56.6, sway: swayAt(t) }];
      const aged = [{ col: MON.lang, old: true, eyes: eyesL, blush: true, snow: true }, { col: MON.niang, girl: true, old: true, eyes: eyesR, snow: true }];
      [380, 410].forEach((x, i) => {
        if (swap < 1) mon(g, x, 252, young[i], k);
        if (old) mon(g, x, 252, aged[i], k, { lv: swap });
      });
      snowfall(g, t, 151, 160, { w: HOME_W, h: HOME_H });
    },
  });
  const z = 1.9 - .15 * ease(lt / 1.875);
  show(c, g, Math.min(300, HOME_W - PW / z), Math.min(150, HOME_H - PH / z), z);
  homeGlows(c, P, tw, moon);
  vignette(c, .45);
}

/* ---------- 31. 尾奏（57.44~61.16）：雪夜的绣楼（和开头同一个地方），两只鸳鸯，两个白头的小怪站在池边；片尾字幕 ---------- */
function shotEnd(c, lt, t) {
  const P = PAL.snow;
  const { g, tw, moon } = home(t, P, {
    inside: (g, w) => { mon(g, w.x + w.w * .35, w.y + w.h + 3, { girl: true, ol: false }, 1, { sil: '#6A2E1E' }); mon(g, w.x + w.w * .62, w.y + w.h + 3, { scholar: true, old: true, ol: false }, 1, { sil: '#6A2E1E' }); },
    front: g => {
      duck(g, 300 + Math.sin(t * .5) * 4, 282, t, true, false); duck(g, 318 + Math.sin(t * .5) * 4, 284, t, false, true, 1);
      snowfall(g, t, 161, 220, { w: HOME_W, h: HOME_H });
    },
  });
  const z = 1.22 - .2 * ease(lt / 3.6);
  show(c, g, 250 - 240 / z, 160 - 135 / z, z);
  homeGlows(c, P, tw, moon);
  vignette(c, .45);
}
