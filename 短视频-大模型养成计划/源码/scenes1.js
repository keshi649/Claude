/* 第一组画面：开场（林黛玉倒拔垂杨柳）、片头、出生、第一课预训练。 */

// ================= 通用小工具 =================
/* 在高清层画精灵（最近邻放大）；x 是中心，y 是底边 */
function hiSprite(img, x, y, sc = 4, o = {}) {
  const ax = o.ax === undefined ? 0.5 : o.ax, ay = o.ay === undefined ? 1 : o.ay;
  g.save();
  g.imageSmoothingEnabled = false;
  if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  const w = img.width * sc, h = img.height * sc;
  g.translate(Math.round(x - w * ax), Math.round(y - h * ay));
  if (o.rot) { g.translate(w * ax, h * ay); g.rotate(o.rot); g.translate(-w * ax, -h * ay); }
  if (o.flip) { g.translate(w, 0); g.scale(-1, 1); }
  g.drawImage(img, 0, 0, w, h);
  g.restore();
}
/* 像素风说话气泡（高清层）。tail: 'down' | 'left' | 'right' | null */
function bubble(s, x, y, o = {}) {
  const size = o.size || 40;
  const a = o.alpha === undefined ? 1 : o.alpha;
  if (a <= 0.01) return;
  const k = o.scale === undefined ? 1 : o.scale;
  g.save();
  g.globalAlpha *= a;
  g.translate(x, y); g.scale(k, k);
  g.font = FONTS.pix(size);
  const w = Math.ceil((g.measureText(s).width + size * 1.1) / 4) * 4, h = Math.ceil(size * 1.7 / 4) * 4;
  const bx = -w / 2, by = -h;
  g.fillStyle = PAL.ink; g.fillRect(bx - 4, by - 4, w + 8, h + 8);
  g.fillStyle = o.bg || PAL.white; g.fillRect(bx, by, w, h);
  g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(bx, by + h - 8, w, 8);
  if (o.tail !== null) {
    g.fillStyle = PAL.ink; g.fillRect(-12, -4, 24, 12); g.fillRect(-8, 8, 16, 8); g.fillRect(-4, 16, 8, 4);
    g.fillStyle = o.bg || PAL.white; g.fillRect(-8, -4, 16, 8); g.fillRect(-4, 4, 8, 8);
  }
  g.fillStyle = o.color || PAL.ink; g.textAlign = 'center';
  g.fillText(s, 0, by + h / 2 + size * 0.36);
  g.restore();
}
function floorDark(c1 = '#1a1430', c2 = '#0e0b1c') { vgrad(0, 345, LW, LH - 345, c1, c2); }
function sparkle(x, y, t, t0, col = PAL.yellow, n = 8, r = 30) {   // 高清层：一圈星星炸开
  const u = seg(t, t0, t0 + 0.7);
  if (u <= 0 || u >= 1) return;
  g.save(); g.fillStyle = col; g.globalAlpha = 1 - u;
  for (let i = 0; i < n; i++) {
    const an = i / n * Math.PI * 2 + 0.3, d = r + u * r * 3;
    const sx = x + Math.cos(an) * d, sy = y + Math.sin(an) * d, s = Math.round((1 - u) * 4 + 1) * 4;
    g.fillRect(sx - s / 2, sy - 2, s, 4); g.fillRect(sx - 2, sy - s / 2, 4, s);
  }
  g.restore();
}
function bigMark(kind, x, y, t, t0, dur = 1.4) {   // 大号 ✓ / ✗
  const a = vis(t, t0, t0 + dur, 0.12);
  if (a <= 0) return;
  const k = E.back(seg(t, t0, t0 + 0.25));
  g.save(); g.translate(x, y); g.scale(k, k); g.globalAlpha *= a;
  const c = kind === 'x' ? PAL.red : PAL.green;
  const blocks = kind === 'x'
    ? [[-3, -3], [-2, -2], [-1, -1], [0, 0], [1, 1], [2, 2], [3, 3], [3, -3], [2, -2], [1, -1], [-1, 1], [-2, 2], [-3, 3]]
    : [[-3, 0], [-2, 1], [-1, 2], [0, 1], [1, 0], [2, -1], [3, -2], [4, -3]];
  const b = 24;
  g.fillStyle = PAL.ink; blocks.forEach(([i, j]) => g.fillRect(i * b - b / 2 - 6, j * b - b / 2 - 6, b + 12, b + 12));
  g.fillStyle = c; blocks.forEach(([i, j]) => g.fillRect(i * b - b / 2, j * b - b / 2, b, b));
  g.restore();
}
function shakeAt(t, t0, amp = 3, d = 0.4) {
  const u = t - t0;
  if (u < 0 || u > d) return [0, 0];
  const k = amp * (1 - u / d);
  return [Math.round(Math.sin(u * 80) * k), Math.round(Math.cos(u * 67) * k)];
}

// ================= 手机聊天界面（开场、修好之后、结尾共用） =================
const PH = { x: 36, y: 84, w: 198, h: 262 };   // 低清坐标
function phoneLo(t, o = {}) {
  const { x, y, w, h } = PH;
  rrect(x - 2, y - 2, w + 4, h + 4, 10, PAL.ink);
  rrect(x, y, w, h, 9, '#2b2740');
  rrect(x + 1, y + 1, w - 2, 3, 2, '#4a4566');
  R(x + 6, y + 14, w - 12, h - 22, o.screen || '#efeaf7');
  R(x + w / 2 - 14, y + 5, 28, 4, PAL.ink);          // 听筒
  R(x + w - 6, y + 40, 2, 20, '#4a4566');           // 侧键
}
/* 聊天内容（高清层）。msgs: [{side:'U'|'M', text, t0, t1}] */
function phoneHi(t, msgs, o = {}) {
  const sx = (PH.x + 6) * S, sy = (PH.y + 14) * S, sw = (PH.w - 12) * S, sh = (PH.h - 22) * S;
  g.save();
  g.beginPath(); g.rect(sx, sy, sw, sh); g.clip();
  // 顶栏
  g.fillStyle = '#ffffff'; g.fillRect(sx, sy, sw, 92);
  g.fillStyle = '#d9d3ea'; g.fillRect(sx, sy + 92, sw, 4);
  g.drawImage(portraitOf('xiaomo', o.face || 'normal', 'smile'), sx + 24, sy + 14, 64, 64);
  text(o.title || 'AI 助手', sx + 104, sy + 58, { size: 36, color: PAL.ink });
  if (o.status) text(o.status, sx + sw - 24, sy + 58, { size: 24, color: '#8a84b8', align: 'right' });
  // 消息
  let y = sy + 132;
  const maxW = sw - 160;
  for (const m of msgs) {
    if (t < m.t0) break;
    const shown = m.t1 ? typed(m.text, t, m.t0, m.t1 + 0.1) : m.text;
    const rows = wrapRich(rich(m.full ? m.text : shown), 'pix', 48, maxW);
    const fullRows = wrapRich(rich(m.text), 'pix', 48, maxW);
    const lh = 64;
    let bw = 0; g.font = FONTS.pix(48);
    (m.t1 ? fullRows : rows).forEach(r => { bw = Math.max(bw, g.measureText(r.map(c => c.ch).join('')).width); });
    if (!m.t1) bw = Math.max(...rows.map(r => g.measureText(r.map(c => c.ch).join('')).width));
    bw = Math.ceil((bw + 48) / 4) * 4;
    const bh = rows.length * lh + 28;
    const isU = m.side === 'U';
    const k = E.back(seg(t, m.t0, m.t0 + 0.25));
    const bx = isU ? sx + sw - 24 - bw : sx + 96;
    g.save();
    g.translate(isU ? bx + bw : bx, y); g.scale(k, k); g.translate(-(isU ? bx + bw : bx), -y);
    if (!isU) g.drawImage(portraitOf('xiaomo', m.face || 'normal', 'smile'), sx + 20, y, 60, 60);
    g.fillStyle = PAL.ink; g.fillRect(bx - 4, y - 4, bw + 8, bh + 8);
    g.fillStyle = isU ? '#9be870' : '#ffffff'; g.fillRect(bx, y, bw, bh);
    rows.forEach((r, i) => drawRichLine(r, bx + 24, y + 60 + i * lh, { f: 'pix', size: 48, color: PAL.ink, hi: PAL.red2 }));
    if (m.chip) tag(m.chip, bx, y + bh + 16, { size: 24, bg: '#5a7bd6' });
    g.restore();
    y += bh + (m.chip ? 76 : 36);
  }
  // 「对方正在输入」
  if (o.typing && t >= o.typing[0] && t < o.typing[1]) {
    const n = 1 + Math.floor(t * 4) % 3;
    text('对方正在输入' + '.'.repeat(n), sx + sw / 2, y + 20, { size: 24, color: '#8a84b8', align: 'center' });
  }
  // 输入栏
  const iy = sy + sh - 96;
  g.fillStyle = '#f7f5fb'; g.fillRect(sx, iy, sw, 96);
  g.fillStyle = '#d9d3ea'; g.fillRect(sx, iy, sw, 4);
  g.fillStyle = PAL.ink; g.fillRect(sx + 20, iy + 20, sw - 160, 56);
  g.fillStyle = '#ffffff'; g.fillRect(sx + 24, iy + 24, sw - 168, 48);
  if (o.input) {
    const s = typed(o.input.text, t, o.input.t0, o.input.t1);
    if (t < o.input.send) text(s.slice(-11) + (Math.floor(t * 3) % 2 ? '|' : ''), sx + 36, iy + 62, { size: 36, color: PAL.ink });
  }
  g.fillStyle = PAL.ink; g.fillRect(sx + sw - 128, iy + 20, 108, 56);
  g.fillStyle = (o.input && t > o.input.send - 0.15 && t < o.input.send + 0.1) ? PAL.green2 : PAL.green; g.fillRect(sx + sw - 124, iy + 24, 100, 48);
  text('发送', sx + sw - 74, iy + 60, { size: 24, color: PAL.white, align: 'center' });
  g.restore();
}
function roomBg(t) {    // 夜里的房间：窗外有月亮
  vgrad(0, 0, LW, 345, '#241c44', '#140f26');
  R(150, 18, 104, 60, PAL.ink); R(152, 20, 100, 56, '#2e3a78');
  stars(t, 3, 14, 22, 70, '#cfd8ff');
  circ(230, 34, 7, '#fff3b0'); circ(233, 32, 6, '#2e3a78');
  R(201, 20, 2, 56, PAL.ink); R(152, 47, 100, 2, PAL.ink);
  R(0, 330, LW, 15, PAL.wood0); R(0, 330, LW, 2, PAL.wood);
  floorDark();
}

// ================= 开场：林黛玉倒拔垂杨柳 =================
const HOOK_ANSWER = '这是《红楼梦》中的经典情节！林黛玉虽然体弱多病，却在一次赏花时一怒之下，将垂杨柳连根拔起，展现了她外柔内刚的性格……';
SCENES.hook = {
  lo(t, lt) {
    roomBg(t);
    const rise = E.out(seg(t, 0, 0.6));
    p.save(); p.translate(0, Math.round((1 - rise) * 120));
    const [sx, sy] = shakeAt(t, CUE.stamp_h4, 3);
    p.translate(sx, sy);
    phoneLo(t);
    p.restore();
    // 想象泡泡：林黛玉在拔树（AI 编出来的画面）
    const ia = vis(t, T('h3') + 2.4, TE('h4') + 0.1, 0.25);
    if (ia > 0) {
      const cx = 70, cy = 58, k = E.back(seg(t, T('h3') + 2.4, T('h3') + 2.8));
      p.save(); p.globalAlpha = ia; p.translate(cx, cy); p.scale(k, k); p.translate(-cx, -cy);
      [[18, 98, 3], [28, 90, 5]].forEach(([x, y, r]) => circ(x, y, r + 1, PAL.ink));
      [[18, 98, 3], [28, 90, 5]].forEach(([x, y, r]) => circ(x, y, r, '#fdf6ff'));
      ell(cx, cy, 62, 34, PAL.ink); ell(cx, cy, 61, 33, '#fdf6ff');
      p.save(); p.beginPath(); p.ellipse(cx, cy, 58, 30, 0, 0, Math.PI * 2); p.clip();
      R(8, 72, 124, 20, '#c9e8b8');
      const pull = Math.sin(t * 9) * 0.5 + 0.5;
      const lift = Math.round(seg(t, T('h4'), T('h4') + 2.2) * 9);
      put(PROP.tree(0), 95, 86 - lift, {});
      actor('daiyu', t, 54 + Math.round(pull), 86, { expr: 'x', mouth: 'open', still: true });
      p.restore();
      p.restore();
    }
    // 结尾：手机屏幕故障 → 变成一颗蛋
    if (t > T('h6')) {
      const u = seg(t, T('h6'), T('h6') + 0.5);
      if (Math.floor(t * 20) % 3 === 0 && u < 1) for (let i = 0; i < 8; i++) R(42, 98 + hash(i + Math.floor(t * 20)) * 230, 186, 2 + hash(i) * 6, i % 2 ? PAL.teal : PAL.pink);
    }
  },
  hi(t, lt) {
    const rise = (1 - E.out(seg(t, 0, 0.6))) * 480;
    g.save(); g.translate(0, rise);
    const [sx, sy] = shakeAt(t, CUE.stamp_h4, 3); g.translate(sx * S, sy * S);
    if (t < T('h6') + 0.4) {
      phoneHi(t, [
        { side: 'U', text: '林黛玉倒拔垂杨柳，是怎么回事？', t0: CUE.send_h2 },
        { side: 'M', text: HOOK_ANSWER, t0: CUE.recv_h3, t1: TE('h3') + 0.3 },
      ], { typing: [CUE.send_h2 + 0.5, CUE.recv_h3], input: { text: '林黛玉倒拔垂杨柳，是怎么回事？', t0: 0.7, t1: 3.0, send: CUE.send_h2 }, status: '在线' });
      stamp('一本正经\n胡说八道', 560, 1010, t, CUE.stamp_h4, { size: 92, rot: -10 });
    } else {
      // 蛋出现在屏幕中央
      const u = seg(t, T('h6') + 0.4, T('h6') + 0.8);
      g.fillStyle = '#efeaf7'; g.fillRect((PH.x + 6) * S, (PH.y + 14) * S, (PH.w - 12) * S, (PH.h - 22) * S);
      const wob = Math.sin(t * 14) * 0.08 * seg(t, T('h7'), T('h7') + 0.3);
      hiSprite(PROP.egg(0), 540, 920, 8 * E.back(u), { rot: wob });
      text('？', 700, 640, { f: 'blk', size: 120, color: PAL.night3, alpha: u * vis(t, T('h6') + 0.6, T('h7'), 0.2) });
    }
    g.restore();
    // 左上角：年份标签
    const ya = vis(t, 0.3, T('h3') + 2.2, 0.3);
    if (ya > 0) { tag('早几年 · 某 AI 对话框', 48, 104, { size: 36, bg: PAL.night3, alpha: ya }); }
  },
  cam(t, lt) {   // 最后一句推进手机屏幕
    const u = E.in(seg(t, T('h7') + 0.6, SCN.hook.t1));
    return { z: 1 + u * 5, x: 135, y: lerp(240, 236, u) };
  },
};

// ================= 片头：大模型养成计划 =================
function skyline(t, y0, seed, col, lit) {
  let x = 0, i = 0;
  while (x < LW) {
    const w = 14 + Math.floor(hash(seed + i) * 22), h = 20 + Math.floor(hash(seed + i * 3.1) * 60);
    R(x, y0 - h, w, h, col);
    if (lit) for (let yy = y0 - h + 4; yy < y0 - 4; yy += 6) for (let xx = x + 3; xx < x + w - 3; xx += 5) {
      if (hash(xx * 13 + yy * 7 + seed) > 0.62) R(xx, yy, 2, 3, hash(xx + yy) > 0.5 ? '#ffd36b' : '#7fd0ff');
    }
    x += w + 1; i++;
  }
}
SCENES.title = {
  lo(t, lt) {
    vgrad(0, 0, LW, 300, '#0f0c24', '#3a2a6e');
    stars(t, 11, 60, 4, 200);
    circ(220, 60, 16, '#fff3b0'); circ(214, 56, 3, '#f2d35c'); circ(225, 66, 2, '#f2d35c');
    skyline(t, 300, 5, '#231a48', false);
    skyline(t, 320, 9, '#17112f', true);
    R(0, 320, LW, 25, '#120d26'); floorDark('#120d26', '#08060f');
    // 底座 + 蛋（发光呼吸）
    const glow = 0.5 + 0.5 * Math.sin(t * 4);
    ell(135, 306, 28, 6, '#2b2453'); ell(135, 304, 24, 4, '#3d3166');
    for (let r = 44; r > 10; r -= 8) { p.save(); p.beginPath(); p.arc(135, 272, r, 0, Math.PI * 2); p.clip(); dither(135 - r, 272 - r, r * 2, r * 2, PAL.teal, (0.05 + glow * 0.05) * (50 - r) / 20); p.restore(); }
    put(PROP.egg(0), 135, 302 - Math.round(Math.sin(t * 3) * 2), { scale: 2 });
  },
  hi(t, lt) {
    const u = E.back(seg(lt, 0.15, 0.6));
    g.save(); g.translate(W / 2, 560); g.scale(u, u);
    text('LLM RAISING SIMULATOR', 0, -170, { size: 36, align: 'center', color: PAL.teal });
    text('大模型', 0, -40, { f: 'blk', size: 120, align: 'center', color: '#fff', stroke: PAL.ink, sw: 18, shadow: 12, shadowColor: PAL.pink2 });
    text('养成计划', 0, 130, { f: 'blk', size: 170, align: 'center', color: PAL.yellow, stroke: PAL.ink, sw: 22, shadow: 14, shadowColor: PAL.orange2 });
    g.restore();
    text('AI 为什么会一本正经地胡说八道？', W / 2, 820, { size: 48, align: 'center', color: PAL.cream, alpha: seg(lt, 0.5, 0.8), shadow: 4 });
    const blink = t < CUE.start ? Math.floor(t * 2) % 2 : Math.floor(t * 12) % 2;
    if (blink) text('▶ PRESS START', W / 2, 1400, { size: 60, align: 'center', color: PAL.white, shadow: 6 });
    // 片头开始时的白闪
    const fl = 1 - seg(lt, 0, 0.45);
    if (fl > 0) { g.fillStyle = `rgba(255,255,255,${fl})`; g.fillRect(0, 0, W, H); }
  },
};

// ================= 出生：上千亿个随机数 =================
function labBg(t) {
  vgrad(0, 0, LW, 300, '#1e2450', '#141833');
  for (let y = 40; y < 300; y += 36) R(0, y, LW, 1, '#262c5c');
  // 两侧机柜
  [[6, 70], [218, 70]].forEach(([x, y], k) => {
    R(x, y, 46, 230, '#0e1026'); R(x + 2, y + 2, 42, 226, '#1b1f40');
    for (let j = 0; j < 14; j++) {
      R(x + 5, y + 8 + j * 16, 36, 11, '#262b52');
      for (let i = 0; i < 5; i++) {
        const on = hash(i + j * 9 + k * 50 + Math.floor(t * 6 + hash(i * 3 + j) * 10)) > 0.45;
        P(x + 8 + i * 3, y + 12 + j * 16, on ? (i % 2 ? PAL.dgreen : PAL.teal) : '#11142c');
      }
      R(x + 28, y + 11 + j * 16, 10, 2, '#11142c');
    }
  });
  // 地面
  for (let i = 0; i < 12; i++) R(i * 24, 300, 23, 45, i % 2 ? '#232848' : '#2a2f55');
  R(0, 300, LW, 2, '#3a4078');
  floorDark('#151833', '#0a0b18');
}
function capsule(t, front) {
  const cx = 135;
  if (!front) {
    ell(cx, 300, 56, 9, '#0e1026'); ell(cx, 297, 52, 8, '#3a4078'); ell(cx, 295, 48, 6, '#4a5296');
    // 管线
    R(52, 250, 30, 4, '#3a4078'); R(188, 250, 30, 4, '#3a4078');
    R(52, 250, 4, 50, '#3a4078'); R(214, 250, 4, 50, '#3a4078');
    ell(cx, 220, 46, 76, 'rgba(127,208,255,0.10)');
  } else {
    p.save(); p.globalAlpha = 0.35;
    for (let i = 0; i < 3; i++) R(cx - 34 + i * 4, 160 + i * 2, 2, 90 - i * 10, '#ffffff');
    p.restore();
    ell(cx, 146, 30, 8, '#3a4078'); R(cx - 30, 142, 60, 4, '#4a5296');
    P(cx - 20, 144, Math.floor(t * 3) % 2 ? PAL.red : PAL.dgreen); P(cx + 20, 144, PAL.teal);
  }
}
SCENES.birth = {
  lo(t, lt) {
    labBg(t);
    capsule(t, false);
    const h = CUE.hatch;
    if (t < h + 1.2) {
      const k = t < h + 0.3 ? 0 : t < h + 0.8 ? 1 : 2;
      const wob = t > h ? Math.round(Math.sin(t * 30) * (k + 1) * 0.6) : 0;
      put(PROP.egg(k), 135 + wob, 294, { scale: 2 });
    } else {
      // 蛋壳飞开
      const u = seg(t, h + 1.2, h + 2.0);
      if (u < 1) {
        put(PROP.shell(), 135 - u * 70, 270 - Math.sin(u * Math.PI) * 40 + u * 20, { alpha: 1 - u });
        put(PROP.shell(), 135 + u * 70, 270 - Math.sin(u * Math.PI) * 30 + u * 20, { alpha: 1 - u, flip: true });
      }
      const expr = t < T('b4') + 1.2 ? 'spiral' : 'normal';
      const mouth = t < T('b4') + 1.2 ? 'wave' : 'smile';
      const s = E.back(seg(t, h + 1.2, h + 1.6));
      if (s > 0.05) actor('xiaomo', t, 135, 296, { expr, mouth, scale: 2 * s, still: s < 1 });
    }
    capsule(t, true);
    // 猫踩键盘
    if (t > T('b4') - 0.6) {
      const ky = Math.round(lerp(400, 0, E.out(seg(t, T('b4') - 0.6, T('b4') - 0.2))));
      put(PROP.keyboard(), 135, 340 + ky, { scale: 2 });
      const cx = lerp(-40, 320, seg(t, T('b4') - 0.3, SCN.birth.t1 - 0.1));
      put(PROP.cat(Math.floor(t * 8) % 2), cx, 322 + ky, { scale: 2 });
    }
  },
  hi(t, lt) {
    const h = CUE.hatch;
    // 破壳闪光
    const fl = vis(t, h + 1.1, h + 1.3, 0.1);
    if (fl > 0) { g.fillStyle = `rgba(255,255,255,${fl * 0.9})`; g.fillRect(0, 0, W, H); }
    // 漂浮的随机数
    const na = vis(t, T('b1') + 0.2, T('b2') + 0.2, 0.3);
    if (na > 0) {
      for (let i = 0; i < 26; i++) {
        const an = hash(i) * Math.PI * 2, r = 260 + hash(i * 3) * 160;
        const x = 540 + Math.cos(an) * r, y = 820 + Math.sin(an) * r * 0.8 - (t * 30 + hash(i) * 100) % 60;
        const v = (hash(i * 7 + Math.floor(t * 8)) * 6 - 3).toFixed(2);
        text(v, x, y, { size: 36, color: i % 3 ? PAL.teal : PAL.pink, alpha: na * (0.5 + 0.5 * hash(i + 1)), align: 'center' });
      }
      panel(160, 260, 760, 140, { alpha: na });
      text('参数：1,000 亿个', 540, 326, { size: 48, color: PAL.cream, align: 'center', alpha: na });
      text('状态：全是随机数', 540, 380, { size: 36, color: PAL.pink, align: 'center', alpha: na });
    }
    if (t >= T('b2') - 0.2 && t < T('b3')) dialog('b2', t);
    if (t >= T('b3') - 0.2 && t < T('b4') - 0.3) {
      dialog('b3', t, { expr: 'spiral', full: true });
      // 乱码抖动
      if (Math.floor(t * 15) % 4 === 0) { g.fillStyle = 'rgba(255,122,168,0.25)'; g.fillRect(48, 1110 + hash(Math.floor(t * 15)) * 180, W - 96, 12); }
    }
    // 猫的输出 vs 小模的输出
    if (t > T('b4') - 0.3) {
      const a = seg(t, T('b4') - 0.3, T('b4'));
      const cx = lerp(-40, 320, seg(t, T('b4') - 0.3, SCN.birth.t1 - 0.1));
      const n = Math.floor(clamp((cx - 70) / 9, 0, 14));
      const catOut = 'jjjjkkk;;;;]]]]]]'.slice(0, n);
      g.save(); g.globalAlpha *= a;
      panel(64, 1060, 952, 200, { bg: '#2b2453' });
      text('小模：', 104, 1140, { size: 48, color: PAL.teal });
      text('鿏㗊锟斤拷烫烫烫屯屯屯', 264, 1140, { size: 48, color: PAL.cream });
      text('橘猫：', 104, 1216, { size: 48, color: PAL.orange });
      text(catOut + (Math.floor(t * 4) % 2 ? '_' : ''), 264, 1216, { size: 48, color: PAL.cream });
      g.restore();
      text('≈', 960, 1190, { f: 'blk', size: 120, color: PAL.yellow, align: 'center', alpha: seg(t, T('b4') + 0.4, T('b4') + 0.6), stroke: PAL.ink, sw: 12 });
    }
  },
};

// ================= 第一课：预训练 =================
function libraryBg(t, seed = 1) {
  vgrad(0, 0, LW, 300, '#3a2118', '#24130c');
  for (let c = 0; c < 3; c++) {
    const x0 = 8 + c * 88;
    R(x0, 46, 80, 254, '#2a170f'); R(x0 + 2, 48, 76, 250, '#4a2a1a');
    for (let r = 0; r < 7; r++) {
      const y = 52 + r * 35;
      let x = x0 + 4, i = 0;
      while (x < x0 + 74) {
        const w = 4 + Math.floor(hash(seed + c * 100 + r * 17 + i) * 5);
        const hh = 22 + Math.floor(hash(seed + c * 40 + r * 9 + i * 3) * 8);
        const cols = ['#ef4655', '#4f7cff', '#ffb53b', '#3fe0c8', '#ff7aa8', '#5fe36a', '#a46bff', '#f6e8c8'];
        const col = cols[Math.floor(hash(seed + c + r * 5 + i * 11) * cols.length)];
        if (x + w > x0 + 75) break;
        R(x, y + 30 - hh, w, hh, col); R(x, y + 30 - hh, 1, hh, 'rgba(0,0,0,0.25)');
        x += w + 1; i++;
      }
      R(x0 + 2, y + 30, 76, 4, '#2a170f');
    }
  }
  for (let i = 0; i < 9; i++) R(i * 32, 300, 31, 45, i % 2 ? PAL.wood2 : PAL.wood3);
  R(0, 300, LW, 2, PAL.wood0);
  floorDark('#24130c', '#0e0805');
}
function gpuWall(t) {
  vgrad(0, 0, LW, 300, '#0d1022', '#05060f');
  for (let j = 0; j < 9; j++) for (let i = 0; i < 7; i++) {
    const x = 6 + i * 38, y = 52 + j * 27;
    put(PROP.gpu(Math.floor(t * 12 + i + j) % 3), x + 17, y + 16);
    if (t > CUE.fire && hash(i * 7 + j * 3) > 0.62) put(PROP.fire(Math.floor(t * 10 + i) % 2), x + 30, y + 4);
  }
  for (let i = 0; i < 12; i++) R(i * 24, 300, 23, 45, i % 2 ? '#14182e' : '#1b2040');
  floorDark('#0d1022', '#05060f');
}
/* 飞进脑袋的书和资料 */
const FEED = [
  { s: '百科', c: '#4f7cff' }, { s: '小说', c: '#ff7aa8' }, { s: '论文', c: '#f6e8c8' },
  { s: '代码', c: '#5fe36a' }, { s: '贴吧', c: '#ffb53b' }, { s: '评论区', c: '#a46bff' },
];
function feedTime(i) { return T('p9') + 0.15 + i * (TE('p9') - T('p9') - 0.3) / 5.2; }
SCENES.pretrain = {
  lo(t, lt) {
    const gpu = t >= T('p11') + 0.1 && t < T('p12') - 0.1;
    if (gpu) gpuWall(t); else libraryBg(t);
    const quiz = t >= T('p3') - 0.3 && t < T('p8') - 0.1;
    const xm = quiz ? 70 : 135;
    let expr = 'normal', mouth = 'smile';
    if (t > CUE.wrong && t < T('p6')) { expr = 'x'; mouth = 'wave'; }
    if (t > CUE.right && t < T('p8')) { expr = 'happy'; mouth = 'open'; }
    if (t >= T('p8') && t < T('p12')) { expr = 'happy'; mouth = 'smile'; }
    if (t >= T('p12')) { expr = 'star'; mouth = 'open'; }
    const [sx] = shakeAt(t, CUE.wrong, 3);
    if (!gpu) actor('xiaomo', t, xm + sx, 330, { expr, mouth, scale: 2, spk: 'M' });
    else actor('xiaomo', t, 135, 330, { expr: 'sweat', mouth: 'flat', scale: 2 });
    // 喂书
    if (t >= T('p8') && t < T('p11') + 0.1) {
      for (let k = 0; k < 40; k++) {
        const t0 = T('p8') + 0.3 + k * 0.28;
        const u = seg(t, t0, t0 + 0.9);
        if (u <= 0 || u >= 1) continue;
        const side = k % 2 ? -1 : 1;
        const x0 = 135 + side * (150 + hash(k) * 20), y0 = 40 + hash(k * 3) * 200;
        const x = lerp(x0, 135, E.in(u)), y = lerp(y0, 240, E.in(u)) - Math.sin(u * Math.PI) * 30;
        const cols = ['#ef4655', '#4f7cff', '#ffb53b', '#3fe0c8', '#ff7aa8', '#5fe36a', '#a46bff'];
        put(PROP.book(cols[k % cols.length], 0), x, y, { ay: 0.5 });
      }
    }
    // 调参数的旋钮
    if (t >= T('p5') - 0.1 && t < T('p6')) {
      const a = seg(t, T('p5') - 0.1, T('p5') + 0.2);
      p.save(); p.globalAlpha = a;
      R(138, 186, 120, 96, PAL.ink); R(140, 188, 116, 92, '#2b2453');
      for (let j = 0; j < 3; j++) for (let i = 0; i < 5; i++) {
        const cx = 154 + i * 22, cy = 206 + j * 26;
        circ(cx, cy, 8, PAL.ink); circ(cx, cy, 7, '#4a4566');
        const an = hash(i + j * 5) * 6 + t * (3 + hash(i * j + 1) * 6) * (hash(i + j) > 0.5 ? 1 : -1);
        line(cx, cy, cx + Math.cos(an) * 6, cy + Math.sin(an) * 6, PAL.yellow);
      }
      p.restore();
    }
  },
  hi(t, lt) {
    lessonCard(t, T('p1') - 0.2, TE('p1') + 0.1, '预训练', 'LESSON 01 · 第一课');
    // 规则卡
    const ra = vis(t, T('p2') - 0.1, T('p3') - 0.15, 0.15);
    if (ra > 0) {
      const k = E.back(seg(t, T('p2') - 0.1, T('p2') + 0.2));
      g.save(); g.translate(540, 520); g.scale(k, k);
      panel(-400, -130, 800, 260, { alpha: ra, bg: '#3a2a6e', border: PAL.yellow });
      text('规则只有一条', 0, -50, { size: 48, color: PAL.yellow, align: 'center', alpha: ra });
      text('猜下一个字', 0, 70, { f: 'blk', size: 110, color: '#fff', align: 'center', alpha: ra, stroke: PAL.ink, sw: 12 });
      g.restore();
    }
    // 填空题
    const qa = vis(t, T('p3') - 0.2, T('p8') - 0.2, 0.2);
    if (qa > 0) {
      g.save(); g.globalAlpha *= qa;
      panel(80, 300, 920, 300, { bg: '#2a1a40', border: PAL.cream });
      text('QUIZ · 猜下一个字', 540, 372, { size: 36, color: PAL.teal, align: 'center' });
      const chars = ['床', '前', '明', '月'];
      chars.forEach((c, i) => {
        const x = 170 + i * 165;
        g.fillStyle = PAL.ink; g.fillRect(x - 4, 412, 148, 148);
        g.fillStyle = PAL.cream; g.fillRect(x, 416, 140, 140);
        text(c, x + 70, 516, { f: 'blk', size: 96, color: PAL.ink, align: 'center' });
      });
      const bx = 170 + 4 * 165;
      const ans = t >= T('p6') ? '光' : t >= T('p4') + 0.6 ? '饼' : '';
      const wrong = t >= CUE.wrong && t < T('p6');
      const right = t >= CUE.right;
      g.fillStyle = PAL.ink; g.fillRect(bx - 4, 412, 148, 148);
      g.fillStyle = wrong ? '#ffd6da' : right ? '#d6ffd9' : (Math.floor(t * 3) % 2 ? '#fff6c8' : PAL.cream); g.fillRect(bx, 416, 140, 140);
      if (ans) text(ans, bx + 70, 516, { f: 'blk', size: 96, color: wrong ? PAL.red : PAL.green2, align: 'center' });
      else text('?', bx + 70, 516, { f: 'blk', size: 96, color: PAL.gray, align: 'center' });
      g.restore();
      // 月饼 / 月亮
      if (t >= T('p4') + 0.5 && t < T('p6')) hiSprite(PROP.mooncake(), 880, 760, 8 * E.back(seg(t, T('p4') + 0.5, T('p4') + 0.8)));
      if (t >= T('p6') + 0.6) {
        hiSprite(PROP.moon(), 820, 840, 8 * E.back(seg(t, T('p6') + 0.6, T('p6') + 0.9)), { alpha: qa });
        sparkle(820, 740, t, CUE.right, PAL.yellow, 10, 60);
      }
      bigMark('x', 880, 640, t, CUE.wrong, 1.2);
      bigMark('v', 880, 640, t, CUE.right, 1.2);
      // LOSS
      if (t >= CUE.wrong && t < T('p6')) {
        const la = seg(t, CUE.wrong, CUE.wrong + 0.2);
        tag('LOSS ↑ 挨罚', 600, 640, { bg: PAL.red, size: 48, alpha: la });
        tag('参数调整中…', 600, 1150, { bg: PAL.night3, size: 36, alpha: seg(t, T('p5'), T('p5') + 0.2) });
      }
      if (t >= CUE.right && t < T('p8')) {
        tag('奖励 +1', 600, 1150, { bg: PAL.green2, size: 48, alpha: seg(t, CUE.right, CUE.right + 0.2) });
        // 金币雨
        for (let i = 0; i < 14; i++) {
          const t0 = T('p7') + i * 0.08, u = seg(t, t0, t0 + 0.9);
          if (u <= 0 || u >= 1) continue;
          hiSprite(PROP.coin(), 300 + hash(i) * 500, 620 + E.in(u) * 600, 6, { alpha: 1 - u * 0.5 });
        }
      }
    }
    // 资料标签：随台词一个个飞进来
    if (t >= T('p9') - 0.1 && t < T('p10') + 0.5) {
      FEED.forEach((f, i) => {
        const t0 = feedTime(i);
        const a = vis(t, t0, T('p10') + 0.2, 0.15);
        if (a <= 0) return;
        const x = i % 2 ? 790 : 290, y = 380 + Math.floor(i / 2) * 150;
        tag(f.s, x, y, { bg: f.c, color: f.c === '#f6e8c8' ? PAL.ink : PAL.white, size: 60, align: 'center', alpha: a });
      });
    }
    // 读了多少：计数器
    const ca = vis(t, T('p10') - 0.1, T('p11') + 0.1, 0.2);
    if (ca > 0) {
      g.save(); g.globalAlpha *= ca;
      panel(80, 300, 920, 420, { bg: '#1e1838', border: PAL.yellow });
      text('已 读 TOKEN', 540, 380, { size: 48, color: PAL.yellow, align: 'center' });
      const n = 14.8e12 * E.out(seg(t, T('p10'), T('p10') + 2.2));
      text(Math.round(n).toLocaleString('en-US'), 540, 500, { f: 'blk', size: 96, color: '#fff', align: 'center', stroke: PAL.ink, sw: 10 });
      text('一个人不吃不睡读完：', 300, 610, { size: 36, color: PAL.cream, align: 'center', alpha: seg(t, T('p10') + 1.6, T('p10') + 1.9) });
      text('好几万年', 760, 620, { f: 'blk', size: 72, color: PAL.pink, align: 'center', alpha: seg(t, T('p10') + 1.9, T('p10') + 2.1), stroke: PAL.ink, sw: 8 });
      g.restore();
    }
    // 显卡
    const ga = vis(t, T('p11') + 0.1, T('p12') - 0.2, 0.15);
    if (ga > 0) {
      tag('显卡 × 成千上万', 540, 260, { size: 60, bg: PAL.red, align: 'center', alpha: ga });
      tag('训练中 ' + '▮'.repeat(1 + Math.floor(seg(t, T('p11'), TE('p11')) * 9)), 540, 1150, { size: 48, bg: PAL.night3, align: 'center', alpha: ga });
    }
    statPanel(t, [['知识', lerp(2, 95, E.inOut(seg(t, T('p8'), TE('p11')))), PAL.sky]], {
      alpha: vis(t, T('p8'), T('p12'), 0.2), y: 220, pops: [[0, '+知识', T('p9') + 0.5, PAL.sky], [0, '+知识', T('p10') + 0.5, PAL.sky]],
    });
    // 网络梗
    if (t >= T('p12')) {
      const memes = [['遥遥领先', 260, 420], ['绝绝子', 800, 500], ['yyds', 300, 640], ['芭比Q了', 820, 700], ['破防了', 240, 860], ['退！退！退！', 790, 900], ['栓Q', 520, 330]];
      memes.forEach(([s, x, y], i) => {
        const t0 = T('p12') + 0.1 + i * 0.22;
        bubble(s, x, y, { size: 44, scale: E.back(seg(t, t0, t0 + 0.2)), alpha: seg(t, t0, t0 + 0.05), bg: ['#fff', '#ffe066', '#bfe8ff', '#ffd6e5'][i % 4] });
      });
      if (t >= T('p13') - 0.1) bubble('家人们谁懂啊！', 540, 1060, { size: 72, scale: E.back(seg(t, T('p13') - 0.1, T('p13') + 0.15)), bg: PAL.yellow });
    }
  },
};
