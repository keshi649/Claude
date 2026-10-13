'use strict';
/* props.js：本集的道具和角色——嘴里的大磨牙（表面一层牙釉质"砖墙"）、蛀牙菌、口水修理工、糖块、酸滴、钙砖、口水浪，
   奶茶、清水、草原上的蜂巢和野果、办公桌、零食、洗手间，以及"你"、原始人。全部程序画的像素图。 */

/* 小脸：(x,y) 为两眼中点 */
function tinyFace(g, x, y, kind = 'n', o = {}) {
  const e = o.eye || '#1B1730', d = o.d ?? 2;
  x = ri(x); y = ri(y);
  if (kind === 'happy') { for (const s of [-1, 1]) { pdot(g, x + s * d - 1, y, e); pdot(g, x + s * d, y - 1, e); pdot(g, x + s * d + 1, y, e); } }
  else if (kind === 'sleep') { for (const s of [-1, 1]) prect(g, x + s * d - 1, y, 3, 1, e); }
  else for (const s of [-1, 1]) prect(g, x + s * d, y - 1, 1, 2, e);
  if (kind === 'happy') { pdot(g, x - 1, y + 2, e); pdot(g, x, y + 3, e); pdot(g, x + 1, y + 2, e); }
  else if (kind === 'shock') prect(g, x - 1, y + 2, 2, 2, e);
  else if (kind !== 'sleep') pdot(g, x, y + 2, e);
}

/* 颜色插值 */
function mixHex(a, b, u) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = s => [(s >> 16) & 255, (s >> 8) & 255, s & 255];
  const [r1, g1, b1] = ch(pa), [r2, g2, b2] = ch(pb);
  const f = (x, y) => Math.round(x + (y - x) * clamp(u)).toString(16).padStart(2, '0');
  return '#' + f(r1, r2) + f(g1, g2) + f(b1, b2);
}

/* ================= 野外 ================= */
function drawHills(g, w, hy, col, seed = 0, amp = 5) {
  for (let x = 0; x < w; x++) { const h = amp + Math.sin(x * .07 + seed) * amp * .6 + Math.sin(x * .19 + seed * 2) * amp * .3; prect(g, x, hy - h, 1, h, col); }
}
function drawGround(g, w, h, hy, c1, c2, seed = 3) {
  pbands(g, 0, w, [[hy, c1], [hy + 30, c2], [h, c2]], 3);
  const r = R(seed);
  for (let i = 0; i < w * 1.1; i++) { const x = r() * w, y = hy + 2 + r() * (h - hy); pdot(g, x, y, r() < .5 ? shadeOf(c2, .8) : shadeOf(c1, 1.15)); }
}
/* 白天的草原（缓冲 108×192）：蓝天、云、太阳、远山、草地、金合欢 */
function dayField(b, t, hy) {
  pbands(b, 0, 108, [[0, '#4FA9E8'], [Math.round(hy * .35), '#6CBDF2'], [Math.round(hy * .7), '#8FD0F7'], [hy - 4, '#B5E2FA'], [hy, '#B5E2FA']], 3);
  for (let i = 0; i < 2; i++) drawCloud(b, ((i * 61 + t * 2) % 140) - 20, 20 + i * 18, .6 + i * .2);
  drawSun(b, 86, 18, 7, t);
  drawHills(b, 108, hy, '#A9CFC0', 2, 5);
  drawGround(b, 108, 192, hy, '#9BCB6A', '#7DB257', 7);
}
/* 挂着蜂巢的树：(x,y) 树根中心；k 蜂巢还剩多少（0..1）；蜜蜂绕着飞 */
function drawHiveTree(g, x, y, t, k = 1) {
  drawRoundTree(g, x, y, 1.15);
  prect(g, x + 4, y - 24, 9, 1, '#6B4A2E');                       // 伸出来的树枝
  if (k > .02) {
    const hx = x + 11, hy = y - 17, ry = Math.max(1, Math.round(5 * k));
    pell(g, hx, hy, 4, ry, '#D9A441'); prect(g, hx, hy - ry - 1, 1, 2, '#6B4A2E');
    for (let j = -ry + 1; j < ry; j += 2) prect(g, hx - 3, hy + j, 7, 1, '#B07A2A');
    prect(g, hx - 1, hy + Math.round(ry * .5), 2, 1, '#3A2418');   // 巢门
    if (k > .9) pdot(g, hx + 2, hy + ry + 1, '#FFC93C');             // 滴下来的蜜
  }
  for (let i = 0; i < 4; i++) {                                     // 蜜蜂
    const a = t * (3 + i * .7) + i * 1.7, bx = x + 11 + Math.round(Math.cos(a) * (7 + i)), by = y - 17 + Math.round(Math.sin(a * 1.3) * (5 + i % 2 * 2));
    pdot(g, bx, by, '#FFD84A'); pdot(g, bx + 1, by, '#1B1730'); if (Math.floor(t * 12 + i) % 2) pdot(g, bx, by - 1, '#FFFFFF');
  }
}
/* 野果丛：(x,y) 底边中心；ripe 0..1 熟了多少（不熟是绿的） */
function drawBerryBush(g, x, y, ripe = 1) {
  pell(g, x, y - 5, 10, 5, '#3E7D3A'); pell(g, x - 3, y - 7, 6, 4, '#5A9E45'); pell(g, x + 4, y - 6, 5, 3, '#5A9E45');
  const col = mixHex('#7DBB57', '#E5322D', ripe);
  [[-6, -4], [-2, -8], [3, -5], [6, -8], [-4, -9], [8, -4], [0, -3]].forEach(([dx, dy]) => { pdot(g, x + dx, y + dy, col); pdot(g, x + dx + 1, y + dy, shadeOf(col, .8)); });
}

/* ================= 嘴里：大磨牙（缓冲 180×320，每个世界像素放大 6 倍） ================= */
const MP = 6, MW = 180, MH = 320;
const TOOTH6 = { x0: 24, x1: 140, top: 136, neck: 210 };
/* 牙冠顶面在第 x 列的高度（两个牙尖、两侧圆肩）；不在牙上返回 NaN */
function toothTop(x) {
  const { x0, x1, top } = TOOTH6, u = (x + .5 - x0) / (x1 - x0);
  if (u < 0 || u > 1) return NaN;
  let y = top + 6 - Math.round(6 * (.5 - .5 * Math.cos(u * 4 * Math.PI)));
  const e = Math.abs(u - .5) - .4;
  if (e > 0) y += Math.round(30 * (1 - Math.sqrt(Math.max(0, 1 - (e / .1) ** 2))));
  return y;
}
/* 牙冠左右两边往牙颈收窄 */
function toothInset(y) { return Math.max(0, Math.round((y - (TOOTH6.top + 44)) * .28)); }
/* 牙釉质砖：两排，每块 8×4，第二排错开半块。返回 [{r, j, xa, xb}] */
const BRICKS = (() => {
  const out = [];
  for (let r = 0; r < 2; r++) for (let x = TOOTH6.x0 - r * 4, j = 0; x < TOOTH6.x1; x += 8, j++) out.push({ r, j, i: out.length, xa: Math.max(TOOTH6.x0, x), xb: Math.min(TOOTH6.x1, x + 8) });
  return out;
})();
/* 牙本体（不含砖）：缓存成一张图 */
function toothBody() {
  return cached('toothBody', MW, MH, g => {
    const { x0, x1, neck } = TOOTH6;
    for (let x = x0; x < x1; x++) {
      const yt = toothTop(x);
      for (let y = yt; y < neck + 40; y++) {
        const ins = toothInset(y);
        if (x < x0 + ins || x >= x1 - ins) continue;
        const edge = x === x0 + ins || x === x1 - ins - 1;
        g.fillStyle = edge ? '#7E6A55' : (x > x1 - ins - 7 ? '#E6D3AE' : '#F3E6C6');
        g.fillRect(x, y, 1, 1);
      }
    }
    // 牙尖之间的沟
    for (let k = 0; k < 6; k++) { const x = Math.round((x0 + x1) / 2) + (k % 2) - 1; g.fillStyle = '#D9C49A'; g.fillRect(x, toothTop(x) + 8 + k, 1, 1); }
  });
}
/* 画整颗牙：health(i) → 第 i 块砖的状态（1 完好、0 溶掉）；cavity 0..1 蛀洞的大小；glow 补牙时的亮光 */
function drawMolar(g, health, o = {}) {
  g.drawImage(toothBody(), 0, 0);
  for (const b of BRICKS) {
    const h = clamp(health(b.i)), new_ = o.fresh ? o.fresh(b.i) : 0;
    for (let x = b.xa; x < b.xb; x++) {
      const yt = toothTop(x) + b.r * 4;
      if (h <= .25) {                                       // 溶掉了：露出发黄的里层，边上一圈坑
        prect(g, x, yt, 1, 4, b.r === 0 ? '#C8A86E' : '#D9BE86');
        if (x === b.xa || x === b.xb - 1) prect(g, x, yt, 1, 4, '#A88552');
        continue;
      }
      const col = h >= .97 ? (new_ > 0 ? mixHex('#FBF7EE', '#CFF4FF', new_) : '#FBF7EE') : mixHex('#E9D7A0', '#FBF7EE', (h - .25) / .72);
      prect(g, x, yt, 1, 4, col);
      if (x === b.xa) prect(g, x, yt, 1, 4, '#D8CDB8');      // 砖缝
      prect(g, x, yt + 3, 1, 1, h >= .97 ? '#E2D9C8' : shadeOf(col, .9));
      if (b.r === 0) pdot(g, x, yt, h >= .97 ? '#FFFFFF' : shadeOf(col, 1.1));
      if (h < .97 && (x + yt) % 3 === 0) pdot(g, x, yt + 1, '#CDB57A');   // 被酸泡软的斑点
    }
  }
  // 牙冠轮廓线
  for (let x = TOOTH6.x0; x < TOOTH6.x1; x++) pdot(g, x, toothTop(x) - 1, '#7E6A55');
  if (o.cavity > 0) {                                        // 蛀洞：在两个牙尖之间往里烂
    const cx = 86, cy = toothTop(86) + 6, r = Math.round(2 + 9 * o.cavity);
    pell(g, cx, cy + r * .4, r + 1, r * .8 + 1, '#8C6440');
    pell(g, cx, cy + r * .4, r, r * .8, '#3B1E28');
    pell(g, cx - 1, cy + r * .3, Math.max(1, r - 3), Math.max(1, r * .5), '#24121A');
  }
  if (o.glow > 0) { g.save(); g.globalAlpha = o.glow * .5; for (let x = TOOTH6.x0; x < TOOTH6.x1; x++) prect(g, x, toothTop(x) - 2, 1, 2, '#CFF4FF'); g.restore(); }
}
/* 嘴里的背景：上面是深色的口腔，下面是牙龈；旁边两颗模糊的邻牙 */
function mouthBG(g, t, o = {}) {
  pbands(g, 0, MW, [[0, o.top || '#2A0E18'], [90, '#3A1420'], [170, '#4E1A2A'], [MH, '#4E1A2A']], 4);
  // 邻牙（暗一些）
  for (const [x0, x1] of [[-40, 14], [150, 204]]) {
    for (let x = Math.max(0, x0); x < Math.min(MW, x1); x++) {
      const u = (x - x0) / (x1 - x0), y = 150 + Math.round(10 * Math.pow(Math.abs(u - .5) * 2, 3));
      prect(g, x, y, 1, 70, '#8E7A6A'); pdot(g, x, y, '#A8968A');
    }
  }
  // 牙龈：波浪形的上沿
  for (let x = 0; x < MW; x++) {
    const y = 204 + Math.round(3 * Math.sin(x * .09) + 2 * Math.sin(x * .23 + 1));
    prect(g, x, y, 1, MH - y, '#D9637A'); prect(g, x, y, 1, 2, '#F08AA0');
    if ((x * 7) % 13 === 0) pdot(g, x, y + 8 + (x % 5), '#C4546B');
  }
}

/* 小东西：糖块、酸滴、钙砖 */
const SUGAR = () => spr('sugar', ['wwww', 'wWww', 'wwwS', 'wSSS'], { w: '#FFFFFF', W: '#F2F7FF', S: '#C9D6E6' });
const ACID = () => spr('acid', ['.a.', 'aAa', 'aaa', '.a.'], { a: '#B8EC3C', A: '#F2FF9A' });
const CABRICK = () => spr('cabrick', ['kkkkkkkkkk', 'kwwwwwwwwk', 'kwWwwwwwwk', 'kwwwwwwwwk', 'kkkkkkkkkk'], { k: '#5E7FA8', w: '#FFFFFF', W: '#DDF6FF' });

/* 口水浪：从右往左扫过牙面；u 0..1 */
function drawSaliva(g, u, t) {
  if (u <= 0 || u >= 1) return;
  const xf = Math.round(lerp(MW + 20, -30, u));              // 浪头
  g.save(); g.globalAlpha = .55 * Math.sin(Math.PI * u);
  for (let x = Math.max(0, xf); x < MW; x++) {
    const yt = isNaN(toothTop(x)) ? 150 : toothTop(x);
    const d = Math.round(5 + 3 * Math.sin(x * .3 + t * 9));
    prect(g, x, yt - d, 1, d + 6, '#8FD3FF');
  }
  g.restore();
  for (let i = 0; i < 8; i++) { const x = xf + 4 + i * 9, yt = toothTop(x); if (!isNaN(yt)) pdot(g, x, yt - 6 - (i % 3) * 2 - Math.round(Math.sin(t * 7 + i) * 1.5), '#FFFFFF'); }
}

/* ================= 角色 ================= */
/* "你"：戴红领巾（第一集的主角） */
function drawYou(g, x, y, t, o = {}, flip = false) {
  drawClawd(g, x, y, Object.assign({ scarf: true, eyes: blinkEyes(t, 1) }, o), flip);
}
/* 原始人 */
function drawCaveman(g, x, y, t, o = {}) {
  drawClawd(g, x, y, Object.assign({ hat: 'bone', eyes: blinkEyes(t, 4) }, o));
}
/* 蛀牙菌：绿色、带斑点、坏笑 */
function drawBug(g, x, y, t, o = {}, flip = false) {
  drawClawd(g, x, y, Object.assign({ col: '#8FD14F', eyes: 'angry', spots: true }, o), flip);
}
/* 口水修理工：浅蓝色、戴黄色安全帽 */
function drawWorker(g, x, y, t, o = {}, flip = false) {
  drawClawd(g, x, y, Object.assign({ col: '#7FD3F0', hat: 'hard', eyes: blinkEyes(t, o.seed || 3) }, o), flip);
}

/* ================= 奶茶、清水 ================= */
/* 奶茶杯：(x,y) 杯身左上；w×h 杯身大小；fill 0..1 还剩多少；sip 正在吸（吸管里有奶茶） */
function drawTea(g, x, y, w, h, fill, t, o = {}) {
  x = ri(x); y = ri(y);
  const ink = '#3A2A3A', tea = o.tea || '#D9A777', teaD = shadeOf(tea, .85), glass = 'rgba(235,245,255,.35)';
  // 吸管
  const sx = x + Math.round(w * .62);
  prect(g, sx - 1, y - Math.round(h * .38), 3, Math.round(h * .38) + 2, o.straw || '#F28CB0');
  prect(g, sx - 1, y - Math.round(h * .38), 1, Math.round(h * .38), shadeOf(o.straw || '#F28CB0', 1.2));
  if (o.sip) prect(g, sx, y - Math.round(h * .38) + 1, 1, Math.round(h * .38), tea);
  // 杯身：上宽下窄
  for (let j = 0; j < h; j++) {
    const ins = Math.round(j * .12 * w / h * 1.4), xa = x + ins, xb = x + w - ins;
    prect(g, xa, y + j, 1, 1, ink); prect(g, xb - 1, y + j, 1, 1, ink);
    const lvl = h - Math.round((h - 3) * clamp(fill));
    if (j >= lvl) { prect(g, xa + 1, y + j, xb - xa - 2, 1, j === lvl ? shadeOf(tea, 1.12) : tea); prect(g, xb - 3, y + j, 1, 1, teaD); }
    else { g.fillStyle = glass; g.fillRect(xa + 1, y + j, xb - xa - 2, 1); }
  }
  // 珍珠
  const pr = R(5);
  for (let i = 0; i < Math.round(w * 1.2); i++) { const px = x + 2 + Math.floor(pr() * (w - 4)), py = y + h - 2 - Math.floor(pr() * Math.min(5, h * .25)); pdot(g, px, py, '#3A2418'); }
  prect(g, x + Math.round(h * .12 * w / h * 1.4), y + h - 1, w - 2 * Math.round(h * .12 * w / h * 1.4), 1, ink);
  // 封口膜 + 小爱心
  prect(g, x - 1, y - 1, w + 2, 2, '#F2F2F2'); prect(g, x - 1, y - 2, w + 2, 1, ink);
  if (w >= 12) { const hx = x + Math.round(w * .3), hy = y + Math.round(h * .35); pdot(g, hx, hy, '#F28CB0'); pdot(g, hx + 2, hy, '#F28CB0'); prect(g, hx, hy + 1, 3, 1, '#F28CB0'); pdot(g, hx + 1, hy + 2, '#F28CB0'); }
  // 高光
  prect(g, x + 2, y + 2, 1, Math.round(h * .5), 'rgba(255,255,255,.7)');
}
/* 清水杯：(x,y) 杯身左上 */
function drawWater(g, x, y, w, h, fill) {
  x = ri(x); y = ri(y);
  prect(g, x, y, 1, h, '#9FB8CC'); prect(g, x + w - 1, y, 1, h, '#9FB8CC'); prect(g, x, y + h - 1, w, 1, '#9FB8CC');
  const lvl = h - Math.round((h - 2) * clamp(fill));
  g.save(); g.globalAlpha = .45; prect(g, x + 1, y, w - 2, h - 1, '#E8F6FF'); g.restore();
  if (fill > .02) { prect(g, x + 1, y + lvl, w - 2, h - 1 - lvl, '#8FD3FF'); prect(g, x + 1, y + lvl, w - 2, 1, '#CFF0FF'); }
  prect(g, x + 2, y + 1, 1, h - 3, 'rgba(255,255,255,.8)');
}

/* ================= 零食 ================= */
const FPAL = Object.assign({}, PAL, {
  m: '#C0563E', M: '#8E3A2A', h: '#F2C230', H: '#C99A1A', e: '#FFFDF6', E: '#E8DCC0', u: '#FFD84A', z: '#E5322D',
  x: '#C98B4A', X: '#5E3B22', i: '#F2A0C0', j: '#5EC8FF', J: '#2F7FC1',
});
const FOOD = {
  honey: () => spr('honey', ['.hhhh.', 'hHhhHh', 'hhHhhh', 'hHhhHh', '.hhhh.'], FPAL),
  bun: () => spr('bun', ['..eeee..', '.eeEeee.', 'eeeeeeEe', 'eEeeeeee', 'xxxxxxxx'], Object.assign({}, FPAL, { e: '#FFF4DF', E: '#E8D2B0' })),
  cookie: () => spr('cookie', ['.xxxx.', 'xxXxxx', 'xXxxXx', 'xxxXxx', '.xxxx.'], FPAL),
  tea: () => spr('tea', ['....kk..', '....k...', '.wwwkwww.', '.wcccccw.', '.wcccccw.', '.wcccccw.', '.wkckckw.', '..wwwww..'], Object.assign({}, PAL, { c: '#D9A777' })),
  cola: () => spr('cola', ['..zz..', '..ww..', '.zzzz.', '.zwwz.', '.zzzz.', '.zzzz.', '.zzzz.'], FPAL),
  skewer: () => spr('skewer', ['......kk', '....mmk.', '...mmM..', '..mmM...', '.mMm....', 'nm......', 'n.......'], Object.assign({}, FPAL, { k: '#C98B4A', n: '#C98B4A' })),
  candy: () => spr('candy', ['i.iii.i', 'iiwiiii', 'i.iii.i'], FPAL),
  berry: () => spr('berry', ['...ll...', '..l..l..', '.zz.zz..', 'zwzzwzz.', '.zzzzz..', '..zzz...'], Object.assign({}, FPAL, { w: '#FF9C94' })),
};

/* ================= 办公桌、洗手间 ================= */
/* 办公桌（缓冲 108×192）：窗外的城市、显示器、键盘 */
function office(b, t) {
  pbands(b, 0, 108, [[0, '#F2E6D8'], [120, '#EADCCB'], [124, '#B98E62'], [192, '#9C7450']], 2);
  // 窗
  prect(b, 6, 18, 40, 34, '#6B5A4A'); pbands(b, 8, 36, [[20, '#8FD0F7'], [50, '#CFEFFF']], 2);
  for (let i = 0; i < 6; i++) { const bx = 8 + i * 6, bh = 8 + Math.round(hash(i, 3) * 14); prect(b, bx, 50 - bh, 5, bh, '#9BB0C8'); for (let wy = 52 - bh; wy < 48; wy += 3) pdot(b, bx + 2, wy, '#E8F1F8'); }
  prect(b, 26, 18, 1, 34, '#6B5A4A'); prect(b, 6, 34, 40, 1, '#6B5A4A');
  // 墙上的钟
  pdisc(b, 82, 30, 7, '#3A2A3A'); pdisc(b, 82, 30, 6, '#FFFFFF');
  const hh = (t * .5) % TAU; pline(b, 82, 30, 82 + Math.round(Math.sin(hh) * 4), 30 - Math.round(Math.cos(hh) * 4), '#3A2A3A'); pline(b, 82, 30, 82, 26, '#3A2A3A');
  // 桌子
  prect(b, 0, 118, 108, 6, '#C99A6A'); prect(b, 0, 118, 108, 1, '#E0B888'); prect(b, 0, 124, 108, 3, '#8C6440');
  // 显示器
  prect(b, 54, 82, 40, 28, '#2B2547'); prect(b, 56, 84, 36, 22, '#5EC8FF');
  for (let i = 0; i < 4; i++) prect(b, 59, 87 + i * 4, 12 + Math.round(hash(i, Math.floor(t * 2)) * 16), 2, '#E8F6FF');
  prect(b, 72, 110, 4, 6, '#2B2547'); prect(b, 66, 116, 16, 2, '#2B2547');
  prect(b, 56, 113, 0, 0, '#000');
}
/* 洗手间（缓冲 108×192）：瓷砖墙、镜子、洗手池 */
function bathroom(b, t) {
  drawTiles(b, 0, 0, 108, 132, '#DCEFF5', '#C4E2EC');
  prect(b, 0, 132, 108, 60, '#9FB8CC'); for (let x = 0; x < 108; x += 12) prect(b, x, 132, 1, 60, '#8CA6BA');
  prect(b, 30, 24, 48, 40, '#9AA1AD'); prect(b, 32, 26, 44, 36, '#CFEFFF'); prect(b, 36, 30, 6, 1, '#FFFFFF'); prect(b, 38, 33, 10, 1, '#FFFFFF');
  prect(b, 20, 104, 68, 8, '#F2F2F2'); prect(b, 20, 111, 68, 2, '#C9D3DE'); prect(b, 50, 98, 4, 6, '#9AA1AD'); prect(b, 50, 98, 9, 2, '#9AA1AD');
  prect(b, 40, 113, 28, 19, '#E3E8EE');
}
function drawTiles(g, x, y, w, h, c1 = '#DCEFF5', c2 = '#C4E2EC') {
  prect(g, x, y, w, h, c1);
  for (let i = x; i < x + w; i += 6) prect(g, i, y, 1, h, c2);
  for (let j = y; j < y + h; j += 6) prect(g, x, j, w, 1, c2);
}
/* 牙刷：(x,y) 刷头左上；ang 弧度 */
function drawBrush(g, x, y, ang = 0) {
  g.save(); g.translate(ri(x), ri(y)); g.rotate(ang);
  prect(g, 0, 0, 18, 2, '#5EC8FF'); prect(g, 0, 0, 18, 1, '#9FE0FF');
  prect(g, 14, -3, 5, 3, '#FFFFFF'); for (let i = 0; i < 5; i++) pdot(g, 14 + i, -4, '#E8F6FF');
  prect(g, 15, -6, 3, 2, '#FFFFFF'); prect(g, 15, -6, 1, 1, '#9FE0FF');    // 牙膏
  g.restore();
}
