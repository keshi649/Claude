'use strict';
/* props.js：本片的场景和道具——白天 / 傍晚的街道（侧面看，车往左开）、两车道、斑马线、带倒计时的红绿灯、
   侧面的小汽车（窗里坐着开车的小怪）、保温杯；夜里的恐怖片街道；问答节目的舞台；幸运转盘；俯视的一条路和 8 个路口；
   车里往前看的挡风玻璃和后视镜；软木板上的照片。全部程序画的像素图。 */

/* ================= 小怪：直接按整数倍画到屏幕上 ================= */
/* (cx, by)：身体中线、脚底（屏幕坐标）；k：一个世界像素占几个屏幕像素 */
function crabAt(g, cx, by, k, o = {}, flip = false) {
  const c = clawd(o), x = Math.round(cx - 12 * k), y = Math.round(by - 16 * k);
  g.save(); g.imageSmoothingEnabled = false;
  if (!flip) g.drawImage(c, x - CL_OX * k, y - CL_OY * k, CL_W * k, CL_H * k);
  else { g.translate(x + 24 * k, y - CL_OY * k); g.scale(-1, 1); g.drawImage(c, -CL_OX * k, 0, CL_W * k, CL_H * k); }
  g.restore();
}
/* "你"：红领巾、会眨眼 */
const youO = (t, o = {}) => Object.assign({ scarf: true, eyes: blinkEyes(t, 1) }, o);
/* "他"：被你超过的那位（蓝色、戴鸭舌帽，手里总有个保温杯） */
const himO = (t, o = {}) => Object.assign({ col: TONES.blue, hat: 'flat', eyes: blinkEyes(t, 3) }, o);
/* 其他人：换颜色、换帽子 */
const PEOPLE = [
  { col: TONES.green }, { col: TONES.purple, glasses: true }, { col: TONES.yellow, hat: 'straw' }, { col: TONES.pink },
  { col: TONES.teal, hat: 'band' }, { col: TONES.gray, glasses: true }, { col: '#8FB8E8', hat: 'cap' }, { col: TONES.green, hat: 'visor' },
];
const person = (i, o = {}) => Object.assign({}, PEOPLE[((i % PEOPLE.length) + PEOPLE.length) % PEOPLE.length], o);
function shadowAt(g, cx, by, k, w = 20) { g.save(); g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(Math.round(cx - w / 2 * k), by, Math.round(w * k), k); g.fillRect(Math.round(cx - (w / 2 - 2) * k), by + k, Math.round((w - 4) * k), k); g.restore(); }

/* ================= 画面元素 ================= */
function clipRect(g, x, y, w, h, fn) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); }
function mixHex(a, b, u) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = s => [(s >> 16) & 255, (s >> 8) & 255, s & 255];
  const [r1, g1, b1] = ch(pa), [r2, g2, b2] = ch(pb);
  const f = (x, y) => Math.round(x + (y - x) * clamp(u)).toString(16).padStart(2, '0');
  return '#' + f(r1, r2) + f(g1, g2) + f(b1, b2);
}
/* 像素实心椭圆（屏幕坐标，k 像素一格） */
function pixOval(g, cx, cy, rx, ry, k, col) {
  g.fillStyle = col;
  for (let j = -Math.ceil(ry / k); j <= Math.ceil(ry / k); j++) {
    const y = (j + .5) * k / ry; if (Math.abs(y) > 1) continue;
    const hw = Math.round(rx * Math.sqrt(1 - y * y) / k) * k;
    g.fillRect(Math.round(cx - hw), Math.round(cy + j * k), hw * 2, k);
  }
}
function pixArrow(g, x0, y0, x1, y1, k, col, u = 1) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), n = Math.floor(L * u / k);
  g.fillStyle = col;
  for (let i = 0; i < n; i++) if (i % 3 !== 2) g.fillRect(Math.round(x0 + dx * i * k / L - k / 2), Math.round(y0 + dy * i * k / L - k / 2), k, k);
  if (u >= 1) { const a = Math.atan2(dy, dx); for (const s of [-1, 1]) for (let i = 1; i <= 3; i++) g.fillRect(Math.round(x1 - Math.cos(a + s * .6) * i * k - k / 2), Math.round(y1 - Math.sin(a + s * .6) * i * k - k / 2), k, k); }
}
function checkMark(g, x, y, k = 6, col = C.green) { g.fillStyle = col; [[0, 2], [1, 3], [2, 4], [3, 3], [4, 2], [5, 1], [6, 0]].forEach(([i, j]) => g.fillRect(x + i * k, y + j * k, k, k)); }
/* 字符画按 k 倍画到屏幕上，(x, y) 是中心 */
function pix(g, rows, pal, x, y, k, o = {}) {
  const h = rows.length, w = Math.max(...rows.map(r => r.length));
  const x0 = Math.round(x - w * k / 2), y0 = Math.round(y - h * k / 2);
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = pal[r[i]]; if (c) { g.fillStyle = c; g.fillRect(x0 + (o.flip ? w - 1 - i : i) * k, y0 + j * k, k, k); } } });
}
/* 想法气泡（云朵形）：(x,y) 中心，尾巴的小圆点朝 (tx,ty) */
function thoughtBubble(g, x, y, w, h, s, tx, ty, o = {}) {
  const px = o.px || 36;
  g.save();
  const bub = (cx, cy, rx, ry) => { pixOval(g, cx, cy, rx + 6, ry + 6, 6, C.ink); pixOval(g, cx, cy, rx, ry, 6, o.fill || '#FFFFFF'); };
  for (let i = 1; i <= 2; i++) { const u = i / 3; bub(lerp(tx, x, u * .7), lerp(ty, y + h / 2, u * .7), 6 + i * 6, 6 + i * 5); }
  bub(x, y, w / 2, h / 2);
  prich(g, s, x, y + px * .38, px, C.ink, o.hl || '#C0392B', { align: 'center' });
  g.restore();
}
/* 打中时的星形爆点：(x, y) 中心，r 半径；像素格 k */
function burst(g, x, y, r, k, o = {}) {
  if (r <= 2) return;
  const n = o.n || 9, rot = o.rot || 0, pts = [];
  for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr = i % 2 ? r * .52 : r; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
  const inside = (px, py, s) => {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i][0] * s, yi = pts[i][1] * s, xj = pts[j][0] * s, yj = pts[j][1] * s;
      if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) c = !c;
    }
    return c;
  };
  const m = Math.ceil(r * 1.2 / k) + 1;
  for (const [s, col] of [[1.16, C.ink], [1, o.col2 || '#FF8A3D'], [.68, o.col || '#FFE27A'], [.3, '#FFFFFF']]) {
    g.fillStyle = col;
    for (let j = -m; j <= m; j++) for (let i = -m; i <= m; i++) if (inside((i + .5) * k, (j + .5) * k, s)) g.fillRect(Math.round(x + i * k), Math.round(y + j * k), k, k);
  }
  if (o.text) rich(g, o.text, x, y + 2, Math.round(r * .62), { col: o.textCol || '#D9443B', strokeCol: '#FFFFFF', stroke: Math.max(4, r * .1), shadow: false });
}
/* 星星 */
function pixStar(g, x, y, k, col = C.gold, col2 = '#FFF2A8') {
  const rows = ['....#....', '...###...', '#########', '.#######.', '..#####..', '.###.###.', '.##...##.'];
  rows.forEach((r, j) => { for (let i = 0; i < 9; i++) if (r[i] === '#') { g.fillStyle = (j < 3 && i < 5) ? col2 : col; g.fillRect(Math.round(x + (i - 4.5) * k), Math.round(y + (j - 3.5) * k), k, k); } });
}

/* 深色网格（会慢慢往下走） */
function bgGrid(g, t, c1 = '#1C2238', c2 = 'rgba(120,200,255,.08)') {
  g.fillStyle = c1; g.fillRect(0, 0, W, H);
  g.fillStyle = c2; for (let x = 0; x < W; x += 48) g.fillRect(x, 0, 2, H); for (let y = (t * 12) % 48; y < H; y += 48) g.fillRect(0, y, W, 2);
}

/* ================= 保温杯 ================= */
const THERMOS = () => spr('thermos', ['.R.', 'RRR', 'sws', 'sws', 'swS', 'swS', 'SSS'], { R: '#B23A3A', s: '#C9D3DE', w: '#F4F7FA', S: '#8FA3B8' });
/* 小怪举着保温杯：手在身体右侧（arms: 'upR'），杯子贴着举起的手 */
function thermosAt(b, x, y) { pspr(b, THERMOS(), x, y); }

/* ================= 数字：3×5 的像素数码管（世界像素） ================= */
const DIG = {
  0: ['###', '#.#', '#.#', '#.#', '###'], 1: ['.#.', '##.', '.#.', '.#.', '###'], 2: ['###', '..#', '###', '#..', '###'],
  3: ['###', '..#', '.##', '..#', '###'], 4: ['#.#', '#.#', '###', '..#', '..#'], 5: ['###', '#..', '###', '..#', '###'],
  6: ['###', '#..', '###', '#.#', '###'], 7: ['###', '..#', '.#.', '.#.', '.#.'], 8: ['###', '#.#', '###', '#.#', '###'],
  9: ['###', '#.#', '###', '..#', '###'],
};
function digits(b, s, x, y, col) {
  [...String(s)].forEach((ch, i) => { const d = DIG[ch]; if (!d) return; d.forEach((r, j) => { for (let k = 0; k < 3; k++) if (r[k] === '#') pdot(b, x + i * 4 + k, y + j, col); }); });
}

/* ================= 红绿灯（悬臂式，正对着看）================= */
/* (x, y)：灯箱左上角（世界像素）；state 'red' | 'yellow' | 'green'；num 倒计时（null 不显示）；poleX 立杆的位置 */
function signal(b, x, y, state, num, o = {}) {
  const poleX = o.poleX ?? x - 6, base = o.base ?? 104;
  // 立杆和横臂
  prect(b, poleX, y - 4, 2, base - y + 4, '#5E6573'); prect(b, poleX, y - 4, 1, base - y + 4, '#7D8594');
  prect(b, poleX, y - 5, x - poleX + 6, 2, '#5E6573'); prect(b, poleX, y - 5, x - poleX + 6, 1, '#7D8594');
  prect(b, x + 4, y - 3, 2, 3, '#5E6573');
  // 灯箱
  prect(b, x - 1, y - 1, 12, 33, '#15171D'); prect(b, x, y, 10, 31, '#2B2F38'); prect(b, x, y, 1, 31, '#3C424F');
  const lamps = [['red', '#FF3B30', '#5A1E1E'], ['yellow', '#FFC93C', '#5A4A1E'], ['green', '#3CE07A', '#1E4A2E']];
  lamps.forEach(([s, on, off], i) => {
    const cx = x + 5, cy = y + 4 + i * 8, lit = state === s;
    pdisc(b, cx, cy, 3, '#111318');
    pdisc(b, cx, cy, 2, lit ? on : off);
    if (lit) { pdot(b, cx - 1, cy - 1, '#FFFFFF'); }
  });
  // 倒计时
  prect(b, x - 1, y + 23, 12, 9, '#15171D'); prect(b, x, y + 24, 10, 7, '#0B0C10');
  if (num !== null && num !== undefined) {
    const col = state === 'green' ? '#3CE07A' : state === 'yellow' ? '#FFC93C' : '#FF3B30';
    const s = String(Math.max(0, Math.min(99, Math.round(num)))).padStart(2, '0');
    digits(b, s, x + 2, y + 25, col);
  }
}
/* 亮着的灯在屏幕上加一圈光晕（贴到屏幕以后再画）：(sx, sy) 屏幕上灯的中心 */
function lampGlow(g, sx, sy, col, r = 70, a = .35) {
  g.save(); g.globalCompositeOperation = 'lighter';
  const gr = g.createRadialGradient(sx, sy, 4, sx, sy, r);
  gr.addColorStop(0, col.replace('A', a)); gr.addColorStop(1, col.replace('A', 0));
  g.fillStyle = gr; g.fillRect(sx - r, sy - r, r * 2, r * 2); g.restore();
}

/* ================= 侧面的小汽车（车头朝左） =================
   (x, by)：车头最左边、车轮着地的 y（世界像素）。长 40、高 22。
   o：col 车身色；drv 司机（clawd 的选项，null 没人）；cup 举保温杯；brake 刹车灯；spin 车轮转了多少；bob 车身上下；
      roof 车顶装饰（'taxi'）；win 车窗颜色 */
const CAR_L = 40;
function carSide(b, x, by, o = {}) {
  x = Math.round(x); by = Math.round(by);
  const col = o.col || '#E0483A', dk = shadeOf(col, .72), hi = shadeOf(col, 1.28), bob = o.bob || 0;
  const y0 = by - 22 + bob;          // 车顶
  // 地上的影子
  prect(b, x + 2, by, CAR_L - 4, 1, 'rgba(0,0,0,.28)'); prect(b, x + 5, by + 1, CAR_L - 10, 1, 'rgba(0,0,0,.14)');
  // 车厢里（暗）+ 司机
  const winTop = y0 + 2, winBot = y0 + 12;
  const glass = (fn) => {
    b.save(); b.beginPath();
    // 挡风玻璃斜着：上边从 x+12 开始，下边从 x+8 开始；后窗上边到 x+31，下边到 x+34
    b.moveTo(x + 12, winTop); b.lineTo(x + 31, winTop); b.lineTo(x + 34, winBot); b.lineTo(x + 8, winBot); b.closePath(); b.clip(); fn(); b.restore();
  };
  glass(() => {
    prect(b, x + 6, winTop, 30, 10, '#27304A');
    prect(b, x + 26, winTop + 3, 7, 6, '#323C5C');                    // 后座靠背
    if (o.drv) drawClawd(b, x + 9, winTop + (o.drvDy || 0), o.drv);   // 身体左边在 x+13，顶在车顶下面
    if (o.cup) thermosAt(b, x + 30, winTop + 1 + (o.cupDy || 0));
    // 玻璃反光
    b.fillStyle = 'rgba(190,225,255,.22)'; b.fillRect(x + 6, winTop, 30, 10);
    b.fillStyle = 'rgba(255,255,255,.28)';
    for (let i = 0; i < 4; i++) b.fillRect(x + 15 + i, winTop + 6 - i, 1, 1), b.fillRect(x + 17 + i, winTop + 7 - i, 1, 1);
  });
  // 车顶、立柱
  prect(b, x + 12, y0, 20, 2, col); prect(b, x + 13, y0, 18, 1, hi);
  pline(b, x + 12, y0 + 1, x + 8, winBot, col); pline(b, x + 11, y0 + 1, x + 7, winBot, col);       // A 柱
  pline(b, x + 31, y0 + 1, x + 34, winBot, col); pline(b, x + 32, y0 + 1, x + 35, winBot, col);     // 后柱
  prect(b, x + 27, winTop, 1, 10, col);                                                              // 后窗中间的柱
  if (o.roof === 'taxi') { prect(b, x + 18, y0 - 3, 8, 3, '#FFD84A'); prect(b, x + 19, y0 - 2, 6, 1, '#C99A1A'); }
  if (o.roof === 'rack') { prect(b, x + 14, y0 - 2, 16, 1, '#3B3F4A'); prect(b, x + 15, y0 - 1, 1, 1, '#3B3F4A'); prect(b, x + 28, y0 - 1, 1, 1, '#3B3F4A'); }
  // 引擎盖、车身
  prect(b, x + 2, winBot - 1, 7, 2, col); prect(b, x + 1, winBot, 2, 1, col);
  prect(b, x + 1, winBot + 1, CAR_L - 2, 7, col); prect(b, x, winBot + 2, CAR_L, 5, col);
  prect(b, x + 2, winBot, CAR_L - 4, 1, hi);                                    // 腰线高光
  prect(b, x, winBot + 6, CAR_L, 2, dk);                                         // 裙边
  prect(b, x + 21, winBot + 1, 1, 6, dk); prect(b, x + 24, winBot + 2, 2, 1, dk); // 车门缝、把手
  prect(b, x + 7, winBot - 2, 2, 2, dk);                                          // 后视镜
  // 保险杠、灯
  prect(b, x - 1, winBot + 5, 3, 2, '#9AA1AD'); prect(b, x + CAR_L - 2, winBot + 5, 3, 2, '#9AA1AD');
  prect(b, x, winBot + 2, 2, 2, '#FFF6C8'); pdot(b, x, winBot + 4, '#FFB547');
  prect(b, x + CAR_L - 2, winBot + 1, 2, 3, o.brake ? '#FF3B30' : '#B0261E');
  if (o.brake) { pdot(b, x + CAR_L, winBot + 2, 'rgba(255,80,60,.6)'); pdot(b, x + CAR_L + 1, winBot + 2, 'rgba(255,80,60,.3)'); }
  // 车轮（轮拱 + 轮胎 + 会转的轮毂）
  for (const wx of [x + 9, x + 31]) {
    pdisc(b, wx, by - 4, 4, '#1A1C22');
    pdisc(b, wx, by - 4, 3, '#2A2D35');
    pdisc(b, wx, by - 4, 1, '#B8BEC8');
    const a = (o.spin || 0) * 2.2;
    pdot(b, wx + Math.round(Math.cos(a) * 2), by - 4 + Math.round(Math.sin(a) * 2), '#8C93A0');
    pdot(b, wx - Math.round(Math.cos(a) * 2), by - 4 - Math.round(Math.sin(a) * 2), '#8C93A0');
  }
  // 尾气（怠速时一小团一小团往后飘）
  if (o.puff !== undefined) {
    for (let i = 0; i < 3; i++) {
      const u = ((o.puff * .8 + i / 3) % 1);
      const px = x + CAR_L + 1 + u * 7, py = by - 3 - u * 3;
      b.fillStyle = `rgba(220,225,232,${(.55 * (1 - u)).toFixed(2)})`; b.fillRect(Math.round(px), Math.round(py), u > .5 ? 2 : 1, u > .5 ? 2 : 1);
    }
  }
}
/* 车里的司机：身体在车窗里，顶到车顶下面 */
const CAR_COL = { you: '#E0483A', him: '#6FC7A4', taxi: '#F2C230', white: '#E8ECF2', gray: '#9AA6B8', van: '#F2F2EE', blue: '#5F86D6' };

/* ================= 街道（侧面看，缓冲 108×192 宽，P=10） =================
   y：天 0~100，远处的人行道 100~104，马路 104~128（远车道 104~116、近车道 116~128），近处的路沿和人行道 128~138，下面是花坛。
   camX：镜头左边在世界里的 x（可带小数）；各层按视差挪。o.sky：'day' | 'dusk'；o.stopX：停止线的世界 x */
const LANE_FAR = 114, LANE_NEAR = 127;     // 两条车道上车轮着地的 y
function streetBG(b, t, camX, o = {}) {
  const sky = o.sky || 'day', dusk = sky === 'dusk';
  const stops = dusk ? [[0, '#3E3C80'], [26, '#6F5A9C'], [52, '#D9809A'], [76, '#F6A878'], [96, '#FBD49A'], [104, '#FBD49A']]
    : [[0, '#4FB0F2'], [34, '#73C4F8'], [66, '#A6DBFB'], [92, '#D2EEFD'], [104, '#D2EEFD']];
  pbands(b, 0, 108, stops, 3);
  // 太阳 / 夕阳
  if (dusk) { pdisc(b, 80 - camX * .02, 78, 9, '#FFD27A'); pdisc(b, 80 - camX * .02, 78, 7, '#FFE6A8'); }
  else { pdisc(b, 90 - camX * .02, 14, 6, '#FFF2B0'); pdisc(b, 90 - camX * .02, 14, 4, '#FFFDE8'); }
  // 云：慢慢往右飘
  for (let i = 0; i < 5; i++) {
    const cx = ((i * 37 + t * (1.2 + i * .3) - camX * .05) % 170 + 170) % 170 - 30, cy = 10 + i * 9 + (i % 2) * 4;
    drawCloud(b, cx, cy, .55 + (i % 3) * .15, dusk ? '#FBE3D2' : '#FFFFFF', dusk ? '#E8B4B4' : '#DDEBFA');
  }
  // 飞鸟
  for (let i = 0; i < 3; i++) {
    const bx = ((t * 9 + i * 41) % 150) - 20, byy = 22 + i * 7 + Math.sin(t * 2 + i) * 2, f = Math.floor(t * 6 + i) % 2;
    pdot(b, bx, byy, '#3B3F4A'); pdot(b, bx - 1, byy - f, '#3B3F4A'); pdot(b, bx + 1, byy - f, '#3B3F4A');
  }
  // 远处的楼（淡、视差 0.15）
  const far = dusk ? '#8E7FB0' : '#A9C5DC', farW = dusk ? '#C9A9C9' : '#D5E5F2';
  for (let i = -2; i < 14; i++) {
    const wx = i * 12 - ((camX * .15) % 12), hh = 30 + Math.round(hash(i - Math.floor(camX * .15 / 12), 3) * 26);
    prect(b, Math.round(wx), 100 - hh, 11, hh, far);
    for (let yy = 100 - hh + 3; yy < 98; yy += 4) for (let xx = 2; xx < 10; xx += 3) if (hash(i - Math.floor(camX * .15 / 12), yy, xx) > .55) pdot(b, Math.round(wx) + xx, yy, farW);
  }
  // 近处的楼（视差 0.5）：各种颜色、窗户、店招、屋顶的水箱和空调
  const BLD = dusk ? ['#C98A7A', '#B07AA0', '#D6A06A', '#8E8AB8', '#C9707A', '#9EA0C0'] : ['#F0D9B5', '#F4B9A0', '#A9D6C2', '#C9B8E8', '#F2D27A', '#B8D4F0'];
  const sx = camX * .5, i0 = Math.floor(sx / 22) - 1;
  for (let i = i0; i < i0 + 8; i++) {
    const bx = Math.round(i * 22 - sx), bw = 18 + Math.round(hash(i, 7) * 3), hh = 40 + Math.round(hash(i, 8) * 30);
    const c = BLD[((i % BLD.length) + BLD.length) % BLD.length], top = 100 - hh;
    prect(b, bx, top, bw, hh, c); prect(b, bx, top, bw, 1, shadeOf(c, 1.15)); prect(b, bx + bw - 2, top, 2, hh, shadeOf(c, .85));
    // 窗户：亮着的、开着窗帘的
    for (let yy = top + 4; yy < 90; yy += 6) for (let xx = 2; xx < bw - 4; xx += 5) {
      const lit = hash(i, yy, xx) > (dusk ? .45 : .8);
      prect(b, bx + xx, yy, 3, 3, lit ? (dusk ? '#FFD98A' : '#FFF4C8') : (dusk ? '#4A4870' : '#6C8FB8'));
      if (!lit && hash(i, yy, xx + 1) > .7) prect(b, bx + xx, yy, 1, 3, dusk ? '#7A6A9A' : '#E8EEF6');
      if (hash(i, yy, xx + 2) > .9) pdot(b, bx + xx + 1, yy + 2, '#7CC46A');                       // 阳台上的盆栽
    }
    // 屋顶的东西
    if (hash(i, 9) > .5) { prect(b, bx + 3, top - 4, 5, 4, '#9AA1AD'); prect(b, bx + 4, top - 5, 3, 1, '#9AA1AD'); }
    else { prect(b, bx + bw - 7, top - 2, 4, 2, '#C3C8D3'); pline(b, bx + 4, top - 1, bx + 4, top - 7, '#5E6573'); }
    // 一楼的店：雨棚（条纹）+ 橱窗
    const aw = ['#E5483B', '#3E9E6A', '#3E6EC8', '#E89A2A'][((i % 4) + 4) % 4];
    for (let xx = 0; xx < bw; xx++) prect(b, bx + xx, 91, 1, 2, xx % 4 < 2 ? aw : '#FFFFFF');
    prect(b, bx + 1, 93, bw - 2, 7, dusk ? '#FFE0A0' : '#E9F4FA'); prect(b, bx + 1, 93, bw - 2, 1, 'rgba(0,0,0,.15)');
    prect(b, bx + Math.round(bw / 2) - 1, 94, 3, 6, shadeOf(c, .7));
  }
  // 远处的人行道 + 行道树 + 路灯（视差 1）
  prect(b, 0, 100, 108, 4, dusk ? '#C9B8A8' : '#D9D0C1'); prect(b, 0, 103, 108, 1, '#A89F90');
  for (let i = Math.floor(camX / 30) - 1; i < Math.floor(camX / 30) + 5; i++) {
    const tx = Math.round(i * 30 + 12 - camX);
    if (o.noTreeNear !== undefined && Math.abs(i * 30 + 12 - o.noTreeNear) < 12) continue;
    const sw = Math.round(Math.sin(t * 1.3 + i) * .6);
    prect(b, tx, 92, 2, 10, '#6B4A2E');
    pdisc(b, tx + 1 + sw, 86, 6, dusk ? '#4E7A4A' : '#3E8E41'); pdisc(b, tx - 2 + sw, 85, 4, dusk ? '#6A9A5A' : '#5DB65A'); pdisc(b, tx + 3 + sw, 83, 3, dusk ? '#86B070' : '#7FD06E');
    const lx = Math.round(i * 30 + 27 - camX);
    prect(b, lx, 74, 1, 28, '#5E6573'); prect(b, lx - 3, 74, 4, 1, '#5E6573'); prect(b, lx - 4, 75, 3, 1, dusk ? '#FFE6A8' : '#E8ECF2');
  }
  // 马路
  prect(b, 0, 104, 108, 24, '#4B4F5C');
  for (let k = 0; k < 90; k++) { const gx = ((Math.floor(hash(k, 1) * 300) - Math.floor(camX)) % 108 + 108) % 108; pdot(b, gx, 105 + Math.floor(hash(k, 2) * 22), k % 2 ? '#555A68' : '#42464F'); }
  prect(b, 0, 105, 108, 1, '#E8E8E0');                                                            // 远处的边线
  for (let xx = -8; xx < 116; xx += 8) { const dx = Math.round(xx - (camX % 8)); prect(b, dx, 116, 4, 1, '#E8E8E0'); }  // 车道分隔虚线
  // 停止线、斑马线（在 stopX 左边）
  if (o.stopX !== undefined) {
    const sxw = Math.round(o.stopX - camX);
    prect(b, sxw, 106, 1, 22, '#F2F2EA');
    for (let yy = 107; yy < 127; yy += 3) prect(b, sxw - 15, yy, 12, 2, '#E8E8E0');
  }
  // 近处的路沿、人行道、花坛
  prect(b, 0, 128, 108, 2, '#B9B2A5'); prect(b, 0, 130, 108, 1, '#8F887C');
  prect(b, 0, 131, 108, 13, dusk ? '#CDBBA8' : '#DCD3C4');
  for (let xx = -6; xx < 114; xx += 6) prect(b, Math.round(xx - (camX % 6)), 131, 1, 13, 'rgba(0,0,0,.08)');
  prect(b, 0, 137, 108, 1, 'rgba(0,0,0,.06)');
  // 人行道上的东西（每 64 个世界像素一组：长椅、消防栓、垃圾桶、路牌）
  for (let i = Math.floor(camX / 64) - 1; i < Math.floor(camX / 64) + 3; i++) {
    const ox = Math.round(i * 64 - camX);
    // 长椅
    prect(b, ox + 6, 136, 14, 1, '#8A5A35'); prect(b, ox + 6, 139, 14, 2, '#A8703F'); prect(b, ox + 7, 141, 1, 2, '#3B3F4A'); prect(b, ox + 18, 141, 1, 2, '#3B3F4A');
    // 消防栓
    prect(b, ox + 30, 137, 3, 6, '#D9443B'); prect(b, ox + 29, 138, 5, 1, '#A8322A'); prect(b, ox + 30, 136, 3, 1, '#F2F2F2');
    // 垃圾桶（绿、灰两个）
    prect(b, ox + 44, 137, 4, 6, '#3E9E6A'); prect(b, ox + 44, 136, 4, 1, '#2E7A4F'); prect(b, ox + 49, 137, 4, 6, '#7D8594'); prect(b, ox + 49, 136, 4, 1, '#5E6573');
    // 路牌
    prect(b, ox + 58, 128, 1, 15, '#5E6573'); prect(b, ox + 55, 128, 7, 4, '#3E6EC8'); prect(b, ox + 56, 129, 5, 1, '#FFFFFF');
  }
  // 一只猫，沿着人行道慢慢走
  {
    const cx = ((t * 3 - camX) % 150 + 150) % 150 - 20, f = Math.floor(t * 4) % 2;
    prect(b, cx, 140, 6, 2, '#3A3448'); prect(b, cx + 5, 138, 3, 3, '#3A3448'); pdot(b, cx + 5, 137, '#3A3448'); pdot(b, cx + 7, 137, '#3A3448');
    pdot(b, cx + 6, 139, '#FFE14A'); prect(b, cx - 1, 138 - f, 1, 3, '#3A3448');
    pdot(b, cx + 1, 142, '#3A3448'); pdot(b, cx + 4, 142 - f, '#3A3448');
  }
  // 矮树篱
  prect(b, 0, 145, 108, 5, dusk ? '#3E6A3A' : '#3E8E41');
  for (let xx = -4; xx < 112; xx += 4) { const hx = Math.round(xx - (camX % 4)); pdisc(b, hx, 145, 2, dusk ? '#4E7A4A' : '#4FA34C'); pdot(b, hx - 1, 144, dusk ? '#6A9A5A' : '#7FD06E'); }
  prect(b, 0, 150, 108, 42, dusk ? '#5E8A4A' : '#74B356');
  for (let k = 0; k < 60; k++) {
    const fx = ((Math.floor(hash(k, 5) * 400) - Math.floor(camX)) % 108 + 108) % 108, fy = 152 + Math.floor(hash(k, 6) * 38);
    pdot(b, fx, fy, ['#FFE27A', '#FF8FB0', '#FFFFFF', '#5E9E45', '#C9B8E8'][k % 5]);
    if (k % 5 === 3) pdot(b, fx + 1, fy + 1, '#4E8A3A');
  }
  // 蝴蝶
  for (let i = 0; i < 3; i++) {
    const bx = ((i * 47 + t * 5 - camX * .3) % 130 + 130) % 130 - 10, byy = 156 + i * 9 + Math.round(Math.sin(t * 3 + i * 2) * 3), f = Math.floor(t * 8 + i) % 2;
    pdot(b, bx, byy, '#3A3448'); pdot(b, bx - 1, byy - f, ['#FFB547', '#FF8FB0', '#9FD3FF'][i]); pdot(b, bx + 1, byy - f, ['#FFB547', '#FF8FB0', '#9FD3FF'][i]);
  }
}
function drawCloud(g, x, y, s = 1, col = '#FFFFFF', sh = '#DDEBFA') {
  pell(g, x, y + 2 * s, 14 * s, 3 * s, sh);
  pell(g, x, y, 14 * s, 3 * s, col); pdisc(g, x - 5 * s, y - 2 * s, 5 * s, col); pdisc(g, x + 4 * s, y - 3 * s, 6 * s, col);
}
/* 过马路的行人（斑马线上，从近往远走）：(x) 斑马线中间的世界 x，u 0..1 走到哪 */
function walker(b, x, u, t, i) {
  const fy = Math.round(lerp(131, 102, u));
  drawClawd(b, x - 12, fy - 16, person(i, { legs: walkLegs(t + i, 5), eyes: 'up' }));
}

/* ================= 夜里的恐怖片街道（缓冲 108×192） ================= */
function horrorBG(b, t, camX, flash = 0) {
  pbands(b, 0, 108, [[0, '#0E0820'], [40, '#1E1238'], [80, '#34204E'], [104, '#3E2858']], 3);
  // 月亮和飘过去的云
  pdisc(b, 74, 30, 11, '#F4EBC8'); pdisc(b, 71, 27, 3, '#E2D6A8'); pdisc(b, 78, 34, 2, '#E2D6A8');
  for (let i = 0; i < 3; i++) { const cx = ((i * 50 + t * 4) % 160) - 30; pell(b, cx, 26 + i * 8, 16, 2, 'rgba(60,40,90,.85)'); }
  // 枯树、楼的剪影（视差）
  for (let i = -1; i < 9; i++) {
    const bx = Math.round(i * 16 - ((camX * .4) % 16)), hh = 26 + Math.round(hash(i - Math.floor(camX * .4 / 16), 4) * 30);
    prect(b, bx, 100 - hh, 14, hh, '#160E26');
    for (let yy = 104 - hh; yy < 96; yy += 5) if (hash(i - Math.floor(camX * .4 / 16), yy) > .82) prect(b, bx + 4, yy, 2, 2, '#C9A94A');
  }
  for (let i = -1; i < 6; i++) {
    const tx = Math.round(i * 26 + 8 - ((camX * .8) % 26));
    pline(b, tx, 104, tx, 76, '#0A0614'); pline(b, tx + 1, 104, tx + 1, 78, '#0A0614');
    pline(b, tx, 86, tx - 6, 78, '#0A0614'); pline(b, tx + 1, 82, tx + 7, 74, '#0A0614'); pline(b, tx - 3, 81, tx - 6, 74, '#0A0614');
  }
  // 马路（夜里）
  prect(b, 0, 100, 108, 4, '#2A2236'); prect(b, 0, 104, 108, 24, '#1E1A28');
  for (let xx = -8; xx < 116; xx += 8) prect(b, Math.round(xx - (camX % 8)), 116, 4, 1, '#5A5468');
  prect(b, 0, 128, 108, 64, '#120E1A');
  // 一闪一闪的路灯
  for (let i = -1; i < 4; i++) {
    const lx = Math.round(i * 40 + 20 - (camX % 40));
    prect(b, lx, 70, 1, 34, '#3A3448'); prect(b, lx - 3, 70, 4, 1, '#3A3448');
    const on = hash(Math.floor(t * 7), i) > .25;
    if (on) { prect(b, lx - 4, 71, 3, 1, '#FFE6A0'); b.fillStyle = 'rgba(255,230,160,.10)'; b.beginPath(); b.moveTo(lx - 4, 72); b.lineTo(lx - 14, 104); b.lineTo(lx + 6, 104); b.closePath(); b.fill(); }
  }
  // 地上的雾
  for (let i = 0; i < 6; i++) { const fx = ((i * 31 - t * 6) % 140 + 140) % 140 - 20; pell(b, fx, 110 + (i % 3) * 6, 18, 2, 'rgba(160,140,200,.10)'); }
  if (flash > 0) { b.fillStyle = `rgba(230,225,255,${(flash * .85).toFixed(2)})`; b.fillRect(0, 0, 108, 192); }
}
/* 剪影：把精灵涂成一种颜色（缓存） */
const SIL = {};
function silhouette(o, col) {
  const key = JSON.stringify(o) + col;
  if (SIL[key]) return SIL[key];
  const src = clawd(o), c = mk(src.width, src.height), g = c.getContext('2d');
  g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height);
  SIL[key] = c; return c;
}

/* ================= 幸运转盘（屏幕坐标，6 像素一格） =================
   相位 φ（秒）：0~60 红灯，60~120 绿灯；红灯最后 10 秒（50~60）是"逃得掉"的那一小截。指针在正上方。
   rot：转盘转过的角度（弧度，顺时针为正）。o.hi：'caught' 让"追得上"那一块闪；o.cut：那一小截往外推的距离 */
function wheelDial(g, cx, cy, R, rot, o = {}) {
  const k = 6, n = Math.ceil(R / k) + 1, blinkOn = o.hi && Math.floor((o.t || 0) * 5) % 2 === 0;
  for (let j = -n; j <= n; j++) for (let i = -n; i <= n; i++) {
    const px = (i + .5) * k, py = (j + .5) * k, r = Math.hypot(px, py);
    if (r > R) continue;
    // 屏幕角度（从正上方顺时针）→ 转盘上的相位
    let a = Math.atan2(px, -py) - rot; a = ((a % TAU) + TAU) % TAU;
    const ph = a / TAU * 120;
    let col;
    if (r > R - k * 1.5) col = C.ink;
    else if (r > R - k * 3) col = Math.floor((a / TAU) * 48) % 2 ? '#FFE27A' : '#FFFFFF';    // 外圈一圈灯
    else if (ph < 50) col = (o.hi === 'caught' && blinkOn) ? '#FF7A6E' : ((i + j) % 2 ? '#E5483B' : '#E04236');
    else if (ph < 60) col = '#FF9A3C';
    else col = (i + j) % 2 ? '#3CC46A' : '#38BA64';
    // 分界线
    const edge = Math.min(Math.abs(ph - 0), Math.abs(ph - 60), Math.abs(ph - 120), Math.abs(ph - 50)) / 120 * TAU * r;
    if (r <= R - k * 3 && edge < k * .8) col = C.ink;
    g.fillStyle = col; g.fillRect(Math.round(cx + i * k), Math.round(cy + j * k), k, k);
  }
  // 中心的轴
  pixOval(g, cx, cy, 36, 36, 6, C.ink); pixOval(g, cx, cy, 26, 26, 6, '#FFD34E'); pixOval(g, cx - 6, cy - 6, 8, 8, 6, '#FFF2A8');
}
/* 转盘上相位 ph（秒）、离圆心 rr 的点在屏幕上的位置 */
function wheelPt(cx, cy, rr, rot, ph) { const a = ph / 120 * TAU + rot; return [cx + Math.sin(a) * rr, cy - Math.cos(a) * rr]; }
/* 指针（朝下的三角），(x, y) 尖端 */
function wheelPointer(g, x, y, k = 6) {
  const rows = ['#########', '.#######.', '..#####..', '...###...', '....#....'];
  pix(g, rows, { '#': C.ink }, x, y - 16, k + 2);
  pix(g, ['#######', '.#####.', '..###..', '...#...'], { '#': '#FFFFFF' }, x, y - 20, k);
}

/* ================= 俯视的车（屏幕坐标，k 一格，车头朝上） ================= */
function topCar(g, x, y, col, k = 6, o = {}) {
  const dk = shadeOf(col, .7), hi = shadeOf(col, 1.3);
  const rows = ['.kccccck.', 'kcHHHHHck', 'kcwwwwwck', 'kcwwwwwck', 'kcccccccc', 'kcrrrrrck', 'kcrrrrrck', 'kcccccccc', 'kcwwwwwck', 'kcHHHHHck', '.kdddddk.'];
  const pal = { k: C.ink, c: col, H: hi, w: '#9FD3FF', r: o.roof || dk, d: dk };
  pix(g, rows, pal, x, y, k);
  // 车灯
  g.fillStyle = '#FFF6C8'; g.fillRect(Math.round(x - 3.5 * k), Math.round(y - 5.5 * k), k, k); g.fillRect(Math.round(x + 2.5 * k), Math.round(y - 5.5 * k), k, k);
  if (o.brake) { g.fillStyle = '#FF3B30'; g.fillRect(Math.round(x - 3.5 * k), Math.round(y + 4.5 * k), k, k); g.fillRect(Math.round(x + 2.5 * k), Math.round(y + 4.5 * k), k, k); }
}

/* ================= 软木板上的照片 ================= */
function polaroid(g, x, y, w, h, rot, draw, o = {}) {
  g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(rot);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-w / 2 + 8, -h / 2 + 8, w, h);
  g.fillStyle = '#FBF8F0'; g.fillRect(-w / 2, -h / 2, w, h);
  g.save(); g.beginPath(); g.rect(-w / 2 + 12, -h / 2 + 12, w - 24, h - 60); g.clip(); draw(g, -w / 2 + 12, -h / 2 + 12, w - 24, h - 60); g.restore();
  if (o.label) ptext(g, o.label, 0, h / 2 - 18, 24, o.lc || C.ink, { align: 'center' });
  // 图钉
  pixOval(g, 0, -h / 2 + 4, 10, 10, 4, o.pin || '#E5483B'); g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(-4, -h / 2, 4, 4);
  g.restore();
}
