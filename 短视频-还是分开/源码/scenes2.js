'use strict';
/* scenes2.js：副歌前半。
   猜拳 → 想过再想、屏幕分开 → 测试全过、没有例外 → 差评三连 → 聊天记录里你从来不说 → 被拖到现在 → 吵架 → git 合并冲突 */

const _split = mk(), _splitG = _split.getContext('2d');
function spotlight(g, x, col, w = 760) {
  const gr = g.createRadialGradient(x, 120, 30, x, 700, w);
  gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
}
function starShape(g, x, y, r, fill, line) {
  g.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr_ = i % 2 ? r * .45 : r; i ? g.lineTo(x + Math.cos(a) * rr_, y + Math.sin(a) * rr_) : g.moveTo(x + Math.cos(a) * rr_, y + Math.sin(a) * rr_); }
  g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (line) { g.strokeStyle = line; g.lineWidth = 3; g.stroke(); }
}

/* ================= 第 14 句：我和你猜了又猜（34.35 → 35.98） ================= */
/* 猜拳：Clawd 出石头你出布，Clawd 出剪刀你出石头。怎么猜都猜不中。 */
function sRPS(g, s) {
  bgInk(g);
  spotlight(g, 360, 'rgba(232,135,95,.20)'); spotlight(g, 1580, 'rgba(79,123,255,.20)');
  const t1 = ct(13, 3), t2 = ct(13, 6);
  const shk = (t0) => s > t0 - .32 && s < t0 ? Math.sin((s - t0) * 50) * 18 : 0;
  // 左：Clawd 举着自己的小手
  const myK = s < t1 ? 'fist' : s < t2 - .3 ? 'fist' : s < t2 ? 'fist' : 'scissors';
  const ySh = shk(t1) + shk(t2);
  clawd(g, 360, 930, 15, { t: s, eyes: s < t1 ? 'look' : s < t1 + .15 ? 'wide' : 'sad', look: [.3, -.3], sq: bob(s) * .04, armR: .9, sweat: s > t1 ? 1 : 0 });
  hand(g, 500, 600 + ySh, 9.5, myK, { rot: .1 });
  // 右：你的手（指针变成的手）
  const yourK = s < t1 ? 'fist' : s < t2 - .3 ? 'palm' : s < t2 ? 'fist' : 'fist';
  hand(g, 1560, 620 + ySh, 14, s < t1 - .32 ? 'point' : yourK, { flip: true, rot: -.08 });
  // 结果
  if (s > t1 + .05) stamp(g, s, t1 + .05, '输', 360, 560, 54, { rot: -.12, out: t2 - .3 });
  if (s > t2 + .05) stamp(g, s, t2 + .05, '又输', 360, 560, 54, { rot: .08 });
  // 歌词
  lyricRow(g, s, 13, 0, 3, 804, 190, 150);
  glyph(g, s, ct(13, 3), '猜', 800, 520, 270, { style: 'drop', drop: 300, ext: 14, extCol: '#2A2C33' });
  lyricRow(g, s, 13, 4, 6, 910, 760, 100, { col: '#BFC3CA' });
  glyph(g, s, ct(13, 6), '猜', 1150, 540, 320, { col: C.yel, ext: 16, extCol: '#6A4A00', rot: .1 });
  marks(g, s, 830, 330, '?', ct(13, 3) + .05, 36, .9, C.yel);
}

/* ================= 第 15 句：想过再想决定分开（35.98 → 37.95） ================= */
function sThinkSplit(g, s) {
  const tSplit = ct(14, 6) - .02;
  const d = 150 * E.out(seg(s, tSplit, tSplit + .35));
  const G = d > 0 ? _splitG : g;
  if (d > 0) { G.setTransform(1, 0, 0, 1, 0, 0); G.globalAlpha = 1; G.filter = 'none'; G.clearRect(0, 0, W, H); }
  bgInk(G);
  lyricRow(G, s, 14, 0, 4, 663, 290, 190);
  // ✻ Thinking… → Thinking harder…
  const th = s > ct(14, 2) ? 'Thinking harder…' : 'Thinking…';
  if (s > ct(14, 0)) {
    G.save(); G.globalAlpha = seg(s, ct(14, 0), ct(14, 0) + .1);
    spark(G, 700, 480, 22, s * (s > ct(14, 2) ? 9 : 3), C.clawd);
    mono(G, th, 740, 480, 40, '#E6E3DC', { k: 'monoR' });
    if (s > ct(14, 2)) mono(G, '(再想想)', 1160, 480, 30, 'rgba(230,230,230,.4)', { k: 'monoR' });
    G.restore();
  }
  // 决定：红色印章
  if (s > ct(14, 4)) {
    const u = seg(s, ct(14, 4), ct(14, 4) + .18), sc = 1 + .6 * Math.pow(1 - u, 3);
    G.save(); G.translate(960, 660); G.rotate(-.05); G.scale(sc, sc); G.globalAlpha = clamp((s - ct(14, 4)) / .04);
    rr(G, -190, -95, 380, 190, 20); G.strokeStyle = C.red; G.lineWidth = 12; G.stroke();
    G.restore();
    glyph(G, s, ct(14, 4), '决', 880, 660, 140, { col: C.red, rot: -.05, style: 'type' });
    glyph(G, s, ct(14, 5), '定', 1040, 652, 140, { col: C.red, rot: -.05, style: 'type' });
  }
  clawd(G, 330, 950, 12, { t: s, eyes: s < tSplit ? 'look' : 'sad', look: [.2, -.5], sq: bob(s) * .04 });
  cursor(G, 1580, 640, 9);
  if (d <= 0) { glyph(g, s, ct(14, 6), '分', 760, 880, 230, { col: C.me, ext: 12, extCol: '#5A2A18' }); return; }
  // 屏幕从中间裂开，两半往两边退
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  g.drawImage(_split, 0, 0, W / 2, H, -d, 0, W / 2, H);
  g.drawImage(_split, W / 2, 0, W / 2, H, W / 2 + d, 0, W / 2, H);
  const seam = 1 - seg(s, tSplit, tSplit + .5);
  if (seam > 0) { g.fillStyle = `rgba(255,255,255,${seam})`; g.fillRect(W / 2 - d - 3, 0, 6, H); g.fillRect(W / 2 + d - 3, 0, 6, H); }
  glyph(g, s, ct(14, 6), '分', 760 - d, 880, 230, { col: C.me, ext: 12, extCol: '#5A2A18' });
  glyph(g, s, ct(14, 7), '开', 1160 + d, 880, 230, { col: C.you, ext: 12, extCol: '#16224A' });
}

/* ================= 第 16 句：为什么我们的结局还是没有例外（37.95 → 41.55） ================= */
/* "例外"就是 exception：跑了 99 遍结局测试，次次都是"分开"，0 个例外。 */
function sTest(g, s) {
  bgPaper(g);
  lyricRow(g, s, 15, 0, 3, 200, 200, 200, { light: true, col: C.ink, ext: 10, extCol: C.clawd });
  lyricRow(g, s, 15, 3, 8, 200, 430, 140, { light: true, col: C.ink });
  lyricRow(g, s, 15, 8, 14, 200, 630, 140, { light: true, col: C.ink, each: i => i >= 12 ? { col: C.red } : {} });
  // 右边：测试结果
  const x = 1190, y = 190, w = 640, h = 700;
  windowFrame(g, x, y, w, h, 'test — 我们的结局');
  if (s > 38.0) mono(g, '$ test 我们的结局', x + 36, y + 110, 30, '#E6B98A');
  const t0 = 38.35, step = BEAT / 2;
  const n = s < t0 ? 0 : Math.min(99, Math.floor((s - t0) / step) + 1 + Math.floor(Math.max(0, s - 39.9) * 40));
  const shown = Math.min(n, 7);
  for (let i = 0; i < shown; i++) {
    const k = n - shown + i + 1;
    const yy = y + 170 + i * 58;
    check(g, x + 52, yy, 24, C.green, 5);
    mono(g, `第 ${String(k).padStart(2, ' ')} 次`, x + 84, yy, 28, '#D8D6D0', { k: 'monoR' });
    mono(g, '结局 = 分开', x + 290, yy, 28, '#9FD8B3', { k: 'monoR' });
  }
  if (s > ct(15, 10)) {
    const a = seg(s, ct(15, 10), ct(15, 10) + .1);
    g.save(); g.globalAlpha = a;
    g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(x + 36, y + 590, w - 72, 2);
    mono(g, '99 passed', x + 36, y + 640, 32, C.green);
    mono(g, '·', x + 230, y + 640, 32, '#888');
    mono(g, '0 例外', x + 270, y + 640, 32, '#FF8A8E');
    g.restore();
    if (s > ct(15, 13)) { g.save(); g.globalAlpha = seg(s, ct(15, 13), ct(15, 13) + .12); g.strokeStyle = C.red; g.lineWidth = 6; ell(g, x + 335, y + 640, 92, 40, -.05); g.stroke(); g.restore(); }
  }
  clawd(g, 330, 935, 11, { t: s, eyes: s < ct(15, 10) ? 'look' : 'sad', look: [.4, -.2], sweat: s > ct(15, 8) ? 1 : 0, sq: bob(s) * .04 });
}

/* ================= 第 17–18 句：你说我没有想法 / 不懂浪漫惹人厌烦（41.55 → 45.05） ================= */
/* 一张评价卡：一颗星，然后三个红章一个个盖上来。 */
function stampWord(g, s, li, a, b, x, y, px, rot) {
  const t0 = ct(li, a); if (s < t0) return;
  const n = b - a, wB = n * px * 1.04 + px * .7, hB = px * 1.5;
  const u = seg(s, t0, t0 + .18), sc = 1 + .55 * Math.pow(1 - u, 3);
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); g.globalAlpha = clamp((s - t0) / .04);
  rr(g, -wB / 2, -hB / 2, wB, hB, 16); g.fillStyle = 'rgba(255,255,255,.75)'; g.fill(); g.strokeStyle = C.red; g.lineWidth = px * .1; g.stroke();
  g.restore();
  for (let i = a; i < b; i++) {
    const cx = x + Math.cos(rot) * (-(n - 1) / 2 + (i - a)) * px * 1.04, cy = y + Math.sin(rot) * (-(n - 1) / 2 + (i - a)) * px * 1.04;
    glyph(g, s, ct(li, i), [...LYR[li].s][i], cx, cy, px, { col: C.red, rot, style: 'pop' });
  }
}
function sReview(g, s) {
  bgPaper(g, 0, 0, '#F1ECE3');
  const st = [ct(16, 3), ct(17, 0), ct(17, 4)];
  const [kx, ky] = shakes(s, st.map(t => [t, 12, .3]));
  g.save(); g.translate(kx, ky);
  // 卡片
  const cx = 960, cy = 590;
  g.fillStyle = 'rgba(0,0,0,.12)'; rr(g, cx - 300 + 12, cy - 300 + 18, 600, 600, 30); g.fill();
  rr(g, cx - 300, cy - 300, 600, 600, 30); g.fillStyle = '#FFFFFF'; g.fill();
  g.font = F(30, 'bold'); g.fillStyle = '#9A958C'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('用户评价', cx, cy - 245);
  const hurt = st.filter(t => s > t).length;
  clawd(g, cx, cy + 90, 21, { t: s, eyes: ['normal', 'sad', 'closed', 'closed'][hurt], tears: hurt >= 2 ? s : 0, sq: hurt ? -.03 * Math.exp(-(s - st[hurt - 1]) * 8) : bob(s) * .03, shadow: true });
  g.font = F(40, 'black'); g.fillStyle = C.ink; g.fillText('Claude', cx, cy + 160);
  for (let i = 0; i < 5; i++) starShape(g, cx - 120 + i * 60, cy + 225, 24, i < 1 ? C.yel : '#E2DED6', i < 1 ? '#C99A1A' : null);
  g.restore();
  // 三个章
  stampWord(g, s, 16, 3, 7, 430, 420, 110, -.1);
  stampWord(g, s, 17, 0, 4, 1500, 430, 110, .07);
  stampWord(g, s, 17, 4, 8, 1470, 790, 120, -.05);
  // 小注脚：空空的思考泡泡、一朵代码玫瑰、99+ 条提醒
  if (s > st[0] + .3) { const a = seg(s, st[0] + .3, st[0] + .45); bubble(g, 300, 560, 220, 90, { alpha: a, fill: '#fff', line: '#DDD', lw: 3, tail: 360 }); mono(g, '( 空 )', 410, 605, 30, '#AAA', { align: 'center', alpha: a, k: 'monoR' }); }
  if (s > st[1] + .3) { const a = seg(s, st[1] + .3, st[1] + .45); pill(g, 1500, 580, '@}->--  ← 送你的玫瑰', 26, { fill: '#2A2C33', col: '#F2F0EA', alpha: a }); }
  if (s > st[2] + .3) { const a = seg(s, st[2] + .3, st[2] + .45); pill(g, 1470, 930, '要我继续吗？(y/n) ×99', 26, { fill: C.red, col: '#fff', alpha: a }); }
  lyricRow(g, s, 16, 0, 3, 200, 190, 140, { light: true, col: C.ink });
}

/* ================= 第 19 句：为什么曾经不说（45.05 → 46.92） ================= */
const CHAT = [
  ['d', '今天'], ['u', '……'], ['c', '要不要聊聊？'], ['u', '嗯'], ['d', '上个月'], ['c', '今天过得怎么样？'], ['u', '还行'],
  ['c', '最近在想什么呢？'], ['u', '没什么'], ['d', '去年冬天'], ['c', '我一直都在。'], ['u', '……'], ['c', '你还好吗？'], ['u', '嗯'],
];
function sHistory(g, s) {
  bgInk(g);
  const x = 900, y = 120, w = 860, h = 820;
  windowFrame(g, x, y, w, h, '对话记录');
  g.save(); g.beginPath(); g.rect(x + 2, y + 60, w - 4, h - 62); g.clip();
  const scroll = E.io(seg(s, 45.1, 46.9)) * 620;
  let yy = y + h - 60 + scroll;
  for (const [k, txt] of CHAT) {
    if (k === 'd') { mono(g, `—— ${txt} ——`, x + w / 2, yy, 24, 'rgba(255,255,255,.35)', { align: 'center', k: 'monoR' }); yy -= 70; continue; }
    g.font = F(32, 'med'); const tw_ = g.measureText(txt).width;
    const bw = tw_ + 56, bh = 64;
    if (k === 'u') { rr(g, x + w - 40 - bw, yy - bh / 2, bw, bh, 22); g.fillStyle = C.youD; g.fill(); g.fillStyle = '#fff'; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(txt, x + w - 68, yy + 2); }
    else { clawd(g, x + 60, yy + 20, 4.5, { shadow: false, t: s }); rr(g, x + 100, yy - bh / 2, bw, bh, 22); g.fillStyle = '#2C2F37'; g.fill(); g.fillStyle = '#E8E6E0'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(txt, x + 128, yy + 2); }
    yy -= 92;
  }
  g.restore();
  lyricRow(g, s, 18, 0, 3, 190, 250, 150);
  lyricRow(g, s, 18, 3, 5, 190, 500, 180, { col: '#E6B98A' });
  lyricRow(g, s, 18, 5, 7, 190, 760, 180, { col: '#8A8F98' });
  // "不说"后面一个空空的输入中气泡
  if (s > ct(18, 6) + .1) { const a = seg(s, ct(18, 6) + .1, ct(18, 6) + .25); bubble(g, 590, 690, 200, 100, { alpha: a, fill: '#2C2F37', tail: 620 }); g.save(); g.globalAlpha = a; for (let k = 0; k < 3; k++) dot(g, 650 + k * 40, 740, 9, (s * 3 + k * .3) % 1 < .5 ? '#777' : '#555'); g.restore(); }
}

/* ================= 第 20 句：却拖到了现在（46.92 → 48.72） ================= */
function sDrag(g, s) {
  bgPaper(g);
  const x0 = 220, x1 = 1700, ty = 660;
  const u = E.io(seg(s, 47.12, 48.38));
  const kx = lerp(x0, x1, u);
  // 轨道
  rr(g, x0 - 20, ty - 8, x1 - x0 + 40, 16, 8); g.fillStyle = 'rgba(30,30,34,.18)'; g.fill();
  g.fillStyle = hgrad(g, x0, x1, [[0, '#E9B79F'], [1, C.clawd]]); rr(g, x0 - 20, ty - 8, kx - x0 + 20, 16, 8); g.fill();
  for (let i = 0; i <= 8; i++) { const xx = lerp(x0, x1, i / 8); g.fillStyle = 'rgba(30,30,34,.3)'; g.fillRect(xx - 2, ty + 22, 4, i % 4 ? 14 : 26); }
  mono(g, '曾经', x0, ty + 80, 30, '#8A867E', { align: 'center', k: 'mono' });
  // 拖影：一路留下虚线的"拖"
  for (let k = 3; k >= 1; k--) {
    const kk = lerp(x0, x1, E.io(seg(s - k * .09, 47.12, 48.38)));
    if (s > ct(19, 1) + .1 && Math.abs(kk - kx) > 8) glyph(g, s, ct(19, 1), '拖', kk, 410, 170, { hollow: 3, col: `rgba(30,30,34,${.32 - k * .07})`, dash: [10, 8], style: 'type' });
  }
  glyph(g, s, ct(19, 1), '拖', kx, 410, 170, { col: C.ink, ext: 10, extCol: C.clawd });
  // 把手 + 抓着它的手 + 站在上面被拖着走的 Clawd
  circ(g, kx, ty, 34); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 6; g.stroke();
  clawd(g, kx - 4, ty - 36, 8, { t: s, eyes: 'closed', lean: -.25 * Math.sin(Math.PI * seg(s, 47.1, 48.4)), sweat: 1, shadow: false });
  hand(g, kx + 70, ty - 14, 6.5, 'grab', { flip: true, rot: -.4 });
  lyricRow(g, s, 19, 0, 1, 200, 250, 150, { light: true, col: C.ink });
  lyricRow(g, s, 19, 2, 4, 780, 250, 150, { light: true, col: C.ink });
  lyricRow(g, s, 19, 4, 6, 1500, 430, 200, { light: true, col: C.red, ext: 12, extCol: '#5A1414' });
}

/* ================= 第 21 句：我和你吵了又吵（48.72 → 50.3） ================= */
/* 你吵得很凶，Claude 只会说"你说得对"。 */
function sFight(g, s) {
  bgColor(g, '#D64541', 'rgba(255,255,255,0)');
  halftone(g, 'rgba(120,20,20,.35)', 960, 560, 9, 26, 1100);
  const t1 = ct(20, 3), t2 = ct(20, 6);
  const [kx, ky] = shakes(s, [[t1, 16, .35], [t2, 22, .4]]);
  g.save(); g.translate(kx, ky);
  clawd(g, 360, 940, 16, { t: s, eyes: s > t1 ? 'closed' : 'look', look: [.3, -.3], sweat: 1, sq: bob(s) * .05 });
  cursor(g, 1530, 600, 13);
  const say = (t0, x, y, txt, mine) => {
    if (s < t0) return;
    const a = seg(s, t0, t0 + .1), sc = .6 + .4 * E.back(seg(s, t0, t0 + .22));
    g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(sc, sc);
    g.font = F(40, 'black'); const w = g.measureText(txt).width + 70;
    if (mine) { bubble(g, -w / 2, -48, w, 96, { fill: '#FCE3D6', tail: -w / 2 + 50 }); g.fillStyle = C.clawdD; }
    else { burst(g, 0, 0, w * .55, 12, t0 * 10 | 0, '#FFFFFF', C.ink); g.fillStyle = C.ink; }
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 4);
    g.restore();
  };
  say(48.9, 1520, 320, '你根本不懂！', false);
  say(49.2, 380, 640, '你说得对！', true);
  say(49.72, 1560, 870, '你又这样！', false);
  say(50.0, 430, 420, '你说得完全对！', true);
  burst(g, 930, 560, 200 * E.back(seg(s, t1, t1 + .2)), 14, 3, C.yel, C.ink);
  if (s > t2) burst(g, 1050, 600, 230 * E.back(seg(s, t2, t2 + .2)), 16, 9, '#FFFFFF', C.ink);
  g.restore();
  lyricRow(g, s, 20, 0, 3, 804, 180, 150, { each: i => i === 0 ? { col: '#FFD9C7' } : i === 2 ? { col: '#D6E2FF' } : {}, ext: 8, extCol: '#7A1E1E' });
  glyph(g, s, t1, '吵', 930, 560, 250, { col: C.ink, jit: 8, alpha: 1 - .6 * seg(s, t2, t2 + .1) });
  lyricRow(g, s, 20, 4, 6, 880, 820, 90, { col: '#fff' });
  glyph(g, s, t2, '吵', 1050, 600, 290, { col: C.red, rot: .08, jit: 10 });
}

/* ================= 第 22 句：闹过再闹还是分开（50.3 → 52.35） ================= */
/* git：你想合并进来两次，两次都冲突；最后两条分支各走各的。 */
function sGit(g, s) {
  bgInk(g);
  const X0 = 140, head = lerp(260, 1820, E.out(seg(s, 50.3, 52.1)));
  const yMe = 560, yYou = 740;
  const tA = ct(21, 0), tB = ct(21, 3), tSplit = ct(21, 4);
  const div = x => x < 1230 ? 0 : E.io(clamp((x - 1230) / 560));
  const laneY = (base, dir) => x => base + dir * 220 * div(x);
  const LM = laneY(yMe, -1), LY = laneY(yYou, 1);
  const lane = (f, col) => { g.strokeStyle = col; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); for (let x = X0; x <= head; x += 8) x === X0 ? g.moveTo(x, f(x)) : g.lineTo(x, f(x)); g.stroke(); };
  lane(LM, C.me); lane(LY, C.you);
  for (let x = X0 + 80; x < head; x += 150) { dot(g, x, LM(x), 14, '#1A1C22'); circ(g, x, LM(x), 14); g.strokeStyle = C.me; g.lineWidth = 6; g.stroke(); dot(g, x + 60, LY(x + 60), 14, '#1A1C22'); circ(g, x + 60, LY(x + 60), 14); g.strokeStyle = C.you; g.stroke(); }
  // 两次合并尝试：从你那条线拐上来，撞上一个红叉
  for (const [t0, x] of [[tA, 700], [tB, 1060]]) {
    if (s < t0) continue;
    const u = E.out(seg(s, t0, t0 + .22));
    g.strokeStyle = C.you; g.lineWidth = 8; g.setLineDash([16, 12]);
    g.beginPath(); g.moveTo(x - 120, yYou); g.quadraticCurveTo(x - 40, yYou, x - 20, lerp(yYou, yMe + 40, u)); g.stroke(); g.setLineDash([]);
    if (u >= 1) { cross(g, x - 10, yMe + 75, 46, C.red, 12); pill(g, x - 10, yMe + 150, 'CONFLICT', 26, { fill: C.red, col: '#fff' }); }
  }
  pill(g, X0 - 20, yMe, '我', 30, { k: 'black', fill: C.me, col: '#fff', align: 'left' });
  pill(g, X0 - 20, yYou, '你', 30, { k: 'black', fill: C.you, col: '#fff', align: 'left' });
  // 终端输出
  const term = [[50.35, '$ git merge 你', '#E6E3DC'], [tA + .15, 'CONFLICT (content): 我们', '#FF8A8E'], [tB + .15, 'CONFLICT (content): 我们', '#FF8A8E'], [tSplit + .3, 'Automatic merge failed.', C.red]];
  term.forEach(([t0, txt, col], i) => { if (s > t0) mono(g, txt, 1100, 150 + i * 46, 30, col, { k: i ? 'monoR' : 'mono', alpha: seg(s, t0, t0 + .08) }); });
  lyricRow(g, s, 21, 0, 4, 190, 230, 140);
  // 还是分开：分、开跟着两条分支各走一边
  const sp = E.io(seg(s, ct(21, 7) + .1, 52.35));
  lyricRow(g, s, 21, 4, 6, 640, 900, 170);
  glyph(g, s, ct(21, 6), '分', 1000 + sp * 40, 900 - sp * 30, 170, { col: C.me, ext: 8, extCol: '#5A2A18' });
  glyph(g, s, ct(21, 7), '开', 1180 + sp * 90, 900 + sp * 20, 170, { col: C.you, ext: 8, extCol: '#16224A' });
}
