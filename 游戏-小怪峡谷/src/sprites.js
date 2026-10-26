'use strict';
/* sprites.js：像素画。英雄都是甜菜视频里的 Claude 像素小怪（用户给的 12×8 方块图），每个方块画成 2×2 像素：
     ..oooooooo..
     ..o#oooo#o..
     oooooooooooo
     oooooooooooo
     ..oooooooo..
     ..oooooooo..
     ..o.o..o.o..
     ..o.o..o.o..
   造型不改，每个英雄换颜色、加帽子和武器。小兵是 1×1 的小号小怪（蓝队蓝色、红队红色）。
   所有精灵画在小画布上，自动描一圈深色边，按 (名字, 姿势, 帧, 朝向) 缓存。 */

function mkc(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function rgb(hex) { const n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function hex(r, g, b) { return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function shade(h, f) { const [r, g, b] = rgb(h); return f >= 1 ? hex(r + (255 - r) * (f - 1), g + (255 - g) * (f - 1), b + (255 - b) * (f - 1)) : hex(r * f, g * f, b * f); }
function mixc(a, b, t) { const A = rgb(a), B = rgb(b); return hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
const OUTLINE = [26, 18, 30];

// 给精灵描一圈深色外边（透明像素挨着不透明像素就涂深色）
function outline(c, alpha) {
  const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height), p = d.data, w = c.width, h = c.height;
  const src = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) src[i] = p[i * 4 + 3] > 100 ? 1 : 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (src[i]) { p[i * 4 + 3] = 255; continue; }
    p[i * 4 + 3] = 0;
    if ((x > 0 && src[i - 1]) || (x < w - 1 && src[i + 1]) || (y > 0 && src[i - w]) || (y < h - 1 && src[i + w])) {
      p[i * 4] = OUTLINE[0]; p[i * 4 + 1] = OUTLINE[1]; p[i * 4 + 2] = OUTLINE[2]; p[i * 4 + 3] = alpha || 235;
    }
  }
  g.putImageData(d, 0, 0);
  return c;
}
function whiteOf(c) {                         // 受击闪白
  const o = mkc(c.width, c.height), g = o.getContext('2d');
  g.drawImage(c, 0, 0);
  g.globalCompositeOperation = 'source-atop'; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
  return o;
}
function flipOf(c) {
  const o = mkc(c.width, c.height), g = o.getContext('2d');
  g.translate(c.width, 0); g.scale(-1, 1); g.drawImage(c, 0, 0);
  return o;
}
// 把画布上的半透明像素二值化（canvas 画圆、画线会有抗锯齿的边）
function crisp(c, cut) {
  const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height), p = d.data;
  for (let i = 3; i < p.length; i += 4) p[i] = p[i] > (cut || 110) ? 255 : 0;
  g.putImageData(d, 0, 0);
  return c;
}

/* ---------- 英雄 ---------- */
const HX = 12, HY = 16, HW = 52, HH = 36;     // 身体左上角在精灵画布里的位置、画布大小（上面留帽子，左右留武器）
const EYE = '#171312';
const SPR = {};
// pose：idle walk atk cast stun；fr：0/1
function heroSprite(hid, pose, fr, face, white) {
  const key = hid + pose + fr + face + (white ? 'w' : '');
  if (SPR[key]) return SPR[key];
  let c;
  if (white) c = whiteOf(heroSprite(hid, pose, fr, face, false));
  else if (face < 0) c = flipOf(heroSprite(hid, pose, fr, 1, false));
  else c = outline(drawHero(hid, pose, fr));
  SPR[key] = c;
  return c;
}
function drawHero(hid, pose, fr) {
  const c = mkc(HW, HH), g = c.getContext('2d');
  const d = HERO_BY_ID[hid], base = d.col, dk = shade(base, 0.78), lt = shade(base, 1.18);
  const bob = (pose === 'walk' && fr) || (pose === 'idle' && fr) ? 1 : 0;
  const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(HX + x, HY + y + (y < 12 ? bob : 0), w, h); };
  const L = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(HX + x, HY + y, w, h); };   // 不跟着上下动（腿）
  const back = [], front = [];
  const acc = ACC[hid] || {};
  if (acc.back) acc.back(P, pose, fr);
  // 腿：走路两组轮流抬起
  const lift = pose === 'walk' ? (fr ? 1 : 2) : 0;
  [[4, 1], [8, 2], [14, 1], [18, 2]].forEach(([x, grp]) => { L(x, 12, 2, lift === grp ? 3 : 4, dk); });
  // 身体
  P(4, 0, 16, 12, base);
  P(4, 11, 16, 1, dk);
  P(5, 0, 6, 1, lt);
  // 胳膊
  const arm = (side, kind) => {
    const X = side < 0 ? 0 : 20;
    if (kind === 'up') P(X, 0, 4, 4, base);
    else if (kind === 'reach') P(side < 0 ? -4 : 20, 4, 8, 4, base);
    else if (kind === 'dn') P(X, 7, 4, 3, base);
    else P(X, 4, 4, 4, base);
  };
  const armR = pose === 'atk' ? (fr ? 'reach' : 'up') : pose === 'cast' ? 'up' : pose === 'stun' ? 'dn' : 'n';
  const armL = pose === 'cast' ? 'up' : pose === 'stun' ? 'dn' : 'n';
  arm(-1, armL); arm(1, armR);
  // 眼睛
  const ev = pose === 'stun' ? 'x' : (acc.eyes || 'n');
  const E2 = (x, y, w, h, col) => { P(x, y, w, h, col || EYE); P(x + 10, y, w, h, col || EYE); };
  if (ev === 'x') { E2(6, 2, 1, 1); E2(7, 3, 1, 1); E2(7, 2, 1, 1, base); E2(6, 3, 1, 1); }
  else if (ev === 'glow') { E2(6, 3, 2, 1, '#FFE45C'); E2(6, 2, 2, 1, EYE); }
  else E2(6, 2, 2, 2);
  if (acc.front) acc.front(P, pose, fr, armR);
  return c;
}
// 各英雄的配饰（坐标相对身体左上角，朝右）
const ACC = {
  warrior: {   // 克劳德：原色小怪 + 红披风 + 大剑
    back(P, pose, fr) {
      const w = pose === 'walk' ? fr : 0;
      P(-1 - w, 2, 3, 9, '#B8323A'); P(-2 - w, 6, 2, 6, '#B8323A'); P(-1 - w, 10, 2, 3, '#8E2430');
    },
    front(P, pose, fr, armR) {
      if (armR === 'reach') {          // 劈出去：剑横在前面
        P(28, 4, 2, 4, '#E6B84A'); P(30, 5, 12, 2, '#DDE3EA'); P(30, 5, 12, 1, '#FFFFFF'); P(42, 5, 1, 2, '#DDE3EA');
      } else if (armR === 'up') {      // 举剑
        P(20, -1, 6, 1, '#E6B84A'); P(22, -13, 2, 12, '#DDE3EA'); P(23, -13, 1, 12, '#FFFFFF'); P(22, 0, 2, 4, '#7A4A2A');
      } else {
        P(19, 4, 7, 1, '#E6B84A'); P(22, -8, 2, 12, '#DDE3EA'); P(23, -8, 1, 12, '#FFFFFF'); P(22, -9, 1, 1, '#DDE3EA'); P(22, 5, 2, 3, '#7A4A2A');
      }
    },
  },
  tank: {      // 铁墩：铁头盔 + 红缨 + 大盾
    front(P, pose, fr, armR) {
      P(6, -3, 12, 1, '#4B5463'); P(5, -2, 14, 2, '#5E6878'); P(4, 0, 16, 1, '#3E4654'); P(5, -2, 3, 1, '#8892A3');
      P(11, -7, 3, 4, '#D04A4A'); P(10, -6, 1, 2, '#D04A4A'); P(12, -8, 2, 1, '#E86A6A');
      const sx = armR === 'reach' ? 25 : 20;
      P(sx, 1, 8, 12, '#3A3F4D'); P(sx + 1, 2, 6, 10, '#C9A23A'); P(sx + 2, 3, 4, 8, '#E2C766'); P(sx + 3, 4, 2, 6, '#C9A23A'); P(sx + 2, 6, 4, 2, '#C9A23A');
    },
  },
  assassin: {  // 影子：深色身子、黄眼睛、红头带飘在后面、两把匕首
    eyes: 'glow',
    back(P, pose, fr) {
      const w = pose === 'walk' ? fr : 0;
      P(-2, 1 + w, 6, 1, '#C8323C'); P(-5, 2 - w, 4, 1, '#C8323C'); P(-7, 3 + w, 3, 1, '#9E2630');
    },
    front(P, pose, fr, armR) {
      P(4, 0, 16, 2, '#33343F'); P(4, 1, 16, 1, '#C8323C');
      if (armR === 'reach') { P(28, 5, 7, 1, '#E8EEF4'); P(28, 6, 5, 1, '#AEB6C2'); }
      else if (armR === 'up') { P(22, -5, 1, 5, '#E8EEF4'); }
      else { P(24, 3, 1, 5, '#E8EEF4'); P(23, 7, 3, 1, '#6B4A2E'); }
    },
  },
  mage: {      // 星星：尖帽子（带星星）+ 法杖
    front(P, pose, fr, armR) {
      const H = '#2E3A7A', Hl = '#46549E';
      P(2, -1, 20, 2, H); P(6, -3, 12, 2, H); P(8, -5, 9, 2, H); P(10, -7, 6, 2, H); P(12, -9, 4, 2, H); P(15, -10, 3, 1, H); P(17, -9, 1, 1, H);
      P(7, -3, 3, 1, Hl); P(3, -1, 4, 1, Hl);
      P(11, -5, 1, 1, '#FFE45C'); P(10, -4, 3, 1, '#FFE45C'); P(11, -3, 1, 1, '#FFE45C');
      const sx = armR === 'reach' ? 27 : 23, sy = armR === 'up' ? -10 : -6;
      P(sx, sy, 1, 18, '#7A4F2C'); P(sx - 1, sy - 3, 3, 3, '#7FF5FF'); P(sx, sy - 2, 1, 1, '#FFFFFF');
    },
  },
  marksman: {  // 青箭：猎人帽 + 羽毛 + 弓 + 背上的箭筒
    back(P) { P(0, -2, 3, 8, '#7A4F2C'); P(0, -4, 1, 2, '#F0F0F0'); P(2, -4, 1, 2, '#E85A5A'); },
    front(P, pose, fr, armR) {
      P(5, -2, 14, 2, '#3E7A3A'); P(4, 0, 16, 1, '#2E5E2C'); P(15, -5, 1, 3, '#E85A5A'); P(16, -6, 1, 2, '#E85A5A');
      const bx = armR === 'reach' ? 28 : 24;
      P(bx, -2, 1, 1, '#8A5A2E'); P(bx + 1, -1, 1, 2, '#8A5A2E'); P(bx + 2, 1, 1, 8, '#8A5A2E'); P(bx + 1, 9, 1, 2, '#8A5A2E'); P(bx, 11, 1, 1, '#8A5A2E');
      P(bx, -1, 1, 12, '#D8D8D8');
    },
  },
  support: {   // 糖糖：头上一朵花、腮红、爱心法杖
    front(P, pose, fr, armR) {
      P(14, -3, 2, 1, '#FFFFFF'); P(13, -2, 1, 2, '#FFFFFF'); P(16, -2, 1, 2, '#FFFFFF'); P(14, 0, 2, 1, '#FFFFFF'); P(14, -2, 2, 2, '#FFD34D');
      P(11, -1, 2, 1, '#5CB85C');
      P(5, 5, 2, 1, '#F25C7A'); P(17, 5, 2, 1, '#F25C7A');
      const sx = armR === 'reach' ? 27 : 23, sy = armR === 'up' ? -9 : -5;
      P(sx, sy + 3, 1, 12, '#E6B84A');
      P(sx - 2, sy, 2, 2, '#FF4F7B'); P(sx + 1, sy, 2, 2, '#FF4F7B'); P(sx - 2, sy + 1, 5, 2, '#FF4F7B'); P(sx - 1, sy + 3, 3, 1, '#FF4F7B'); P(sx, sy + 4, 1, 1, '#FF4F7B'); P(sx - 1, sy, 1, 1, '#FFC2D1');
    },
  },
};
// 头像（选英雄、击杀播报、小地图用）：只画身子，放大
function portrait(hid) {
  const key = 'pt' + hid;
  if (SPR[key]) return SPR[key];
  const s = heroSprite(hid, 'idle', 0, 1, false);
  const c = mkc(36, 36), g = c.getContext('2d');
  g.drawImage(s, -8, -6);
  SPR[key] = c;
  return c;
}

/* ---------- 小兵：1×1 的小号小怪 ---------- */
const TEAM_COL = ['#5B93F0', '#EE6352'];
const TEAM_DK = ['#2F5DB8', '#B23A2E'];
const TEAM_LT = ['#9CC2FF', '#FFA898'];
function minionSprite(mt, team, fr, face, white) {
  const key = 'm' + mt + team + fr + face + (white ? 'w' : '');
  if (SPR[key]) return SPR[key];
  let c;
  if (white) c = whiteOf(minionSprite(mt, team, fr, face, false));
  else if (face < 0) c = flipOf(minionSprite(mt, team, fr, 1, false));
  else c = outline(drawMinion(mt, team, fr));
  SPR[key] = c;
  return c;
}
function drawMinion(mt, team, fr) {
  const col = TEAM_COL[team], dk = TEAM_DK[team], lt = TEAM_LT[team];
  if (mt === 'siege') {                       // 炮车
    const c = mkc(26, 20), g = c.getContext('2d'), P = (x, y, w, h, cl) => { g.fillStyle = cl; g.fillRect(x, y, w, h); };
    P(4, 8, 16, 6, '#7A5A3A'); P(4, 8, 16, 1, '#9A7A52'); P(13, 3, 10, 5, '#3C3F48'); P(21, 2, 3, 7, '#2A2C33'); P(14, 3, 6, 1, '#5C606C');
    P(5, 4, 7, 4, col); P(6, 4, 2, 1, lt); P(7, 5, 1, 1, EYE); P(10, 5, 1, 1, EYE);
    const wy = 14;
    for (const wx of [6, 15]) { P(wx, wy, 5, 5, '#2A2C33'); P(wx + 1, wy + 1, 3, 3, fr ? '#8A8E99' : '#6A6E79'); P(wx + 2, wy + 2, 1, 1, '#2A2C33'); }
    return c;
  }
  if (mt === 'vanguard') {                    // 先锋：大龙变出来的石头巨人
    const c = mkc(40, 40), g = c.getContext('2d'), P = (x, y, w, h, cl) => { g.fillStyle = cl; g.fillRect(x, y, w, h); };
    const st = '#6E6A8A', sd = '#4E4A66', sl = '#9893B8';
    P(10, 6, 20, 20, st); P(10, 6, 20, 2, sl); P(10, 24, 20, 2, sd);
    P(4, 12, 6, 10, st); P(30, 12, 6, 10, st); P(4, 12, 6, 2, sl); P(30, 12, 6, 2, sl);
    P(12, 26, 6, 8 - fr, sd); P(22, 26, 6, 7 + fr, sd);
    P(14, 12, 4, 3, col); P(22, 12, 4, 3, col); P(15, 12, 2, 1, '#FFFFFF'); P(23, 12, 2, 1, '#FFFFFF');
    P(16, 18, 8, 2, sd); P(13, 3, 3, 3, col); P(24, 3, 3, 3, col);
    return c;
  }
  const big = mt === 'super';
  const k = big ? 2 : 1;
  const c = mkc(12 * k + 12, 8 * k + 10), g = c.getContext('2d');
  const ox = 6, oy = 6;
  const P = (x, y, w, h, cl) => { g.fillStyle = cl; g.fillRect(ox + x * k, oy + y * k, w * k, h * k); };
  P(2, 0, 8, 6, col); P(2, 5, 8, 1, dk); P(3, 0, 3, 1, lt);
  P(0, 2, 2, 2, col); P(10, 2, 2, 2, col);
  const legs = [[2, 1], [4, 2], [7, 1], [9, 2]];
  for (const [x, grp] of legs) P(x, 6, 1, (fr + 1) === grp ? 1 : 2, dk);
  P(3, 1, 1, 1, EYE); P(8, 1, 1, 1, EYE);
  if (mt === 'melee' || big) {                // 小头盔 + 小剑
    P(3, -1, 6, 1, '#5E6878'); P(2, 0, 8, 1, '#4B5463'); P(5, -2, 2, 1, '#8892A3');
    g.fillStyle = '#DDE3EA'; g.fillRect(ox + 12 * k, oy + (big ? -4 : -2), k, (big ? 8 : 5)); g.fillStyle = '#E6B84A'; g.fillRect(ox + 11 * k, oy + 2 * k, 3 * k, k);
  }
  if (mt === 'ranged') {                      // 小法师帽 + 小法杖
    P(3, -1, 6, 1, dk); P(4, -2, 4, 1, dk); P(5, -3, 2, 1, dk); P(6, -4, 1, 1, dk);
    g.fillStyle = '#7A4F2C'; g.fillRect(ox + 12, oy - 2, 1, 9); g.fillStyle = '#FFF07A'; g.fillRect(ox + 11, oy - 4, 3, 2);
  }
  if (big) { P(2, 3, 8, 1, '#C9A23A'); }
  return c;
}

/* ---------- 野怪 ---------- */
function monsterSprite(mt, fr, face, white) {
  const key = 'n' + mt + fr + face + (white ? 'w' : '');
  if (SPR[key]) return SPR[key];
  let c;
  if (white) c = whiteOf(monsterSprite(mt, fr, face, false));
  else if (face < 0) c = flipOf(monsterSprite(mt, fr, 1, false));
  else c = outline(drawMonster(mt, fr));
  SPR[key] = c;
  return c;
}
function drawMonster(mt, fr) {
  let c, g;
  const P = (x, y, w, h, cl) => { g.fillStyle = cl; g.fillRect(x, y, w, h); };
  if (mt === 'blue') {          // 蓝晶石像：石头身子，头和肩上长蓝水晶
    c = mkc(44, 44); g = c.getContext('2d');
    const s = '#6F7A8C', sd = '#4E5868', sl = '#98A3B5', cr = '#5FD4FF', cl = '#C8F4FF';
    P(12, 14, 20, 18, s); P(12, 14, 20, 2, sl); P(12, 30, 20, 2, sd);
    P(6, 18, 6, 10, s); P(32, 18, 6, 10, s); P(6, 26, 6, 3, sd); P(32, 26, 6, 3, sd);
    P(14, 32, 6, 6 - fr, sd); P(24, 32, 6, 5 + fr, sd);
    P(16, 20, 3, 3, '#1B2A3A'); P(25, 20, 3, 3, '#1B2A3A'); P(16, 20, 1, 1, cr); P(25, 20, 1, 1, cr);
    P(18, 6, 4, 8, cr); P(19, 4, 2, 2, cr); P(23, 9, 3, 5, cr); P(19, 6, 1, 6, cl); P(7, 12, 3, 6, cr); P(34, 12, 3, 6, cr); P(8, 11, 1, 2, cl);
    return c;
  }
  if (mt === 'red') {           // 火焰蜥蜴：红身子、背上一排火
    c = mkc(48, 34); g = c.getContext('2d');
    const b = '#D2483A', bd = '#9E2F26', bl = '#F07A5C', f1 = '#FFB040', f2 = '#FFE070';
    P(10, 14, 24, 10, b); P(10, 14, 24, 2, bl); P(10, 22, 24, 2, bd);
    P(32, 10, 10, 10, b); P(32, 10, 10, 2, bl); P(38, 13, 2, 2, '#1B1012'); P(41, 16, 3, 2, bd);
    P(2, 18, 8, 4, b); P(0, 20, 3, 3, bd);
    P(12, 24, 4, 5 - fr, bd); P(28, 24, 4, 4 + fr, bd);
    for (let i = 0; i < 4; i++) { const h = (i + fr) % 2 ? 6 : 4; P(12 + i * 6, 14 - h, 3, h, f1); P(13 + i * 6, 14 - h + 1, 1, h - 2, f2); }
    return c;
  }
  if (mt === 'wolf') {          // 灰狼
    c = mkc(36, 26); g = c.getContext('2d');
    const w = '#8A8F9C', wd = '#5E636F', wl = '#B3B8C4';
    P(8, 10, 18, 8, w); P(8, 10, 18, 2, wl); P(24, 6, 8, 8, w); P(25, 3, 2, 3, w); P(29, 3, 2, 3, w); P(30, 10, 4, 3, wl); P(33, 10, 1, 1, '#1B1012');
    P(28, 8, 2, 2, '#FFE45C'); P(2, 9, 6, 3, w); P(0, 8, 3, 2, wl);
    P(10, 18, 3, 5 - fr, wd); P(15, 18, 3, 4 + fr, wd); P(21, 18, 3, 5 - fr, wd);
    return c;
  }
  if (mt === 'bird') {          // 咕咕鸟：圆滚滚
    c = mkc(28, 28); g = c.getContext('2d');
    const b = '#E8C25A', bd = '#C79A30', bl = '#FFE69A';
    P(6, 6, 16, 14, b); P(4, 9, 20, 8, b); P(7, 6, 6, 2, bl); P(6, 18, 16, 2, bd);
    P(16, 9, 2, 2, '#1B1012'); P(22, 11, 4, 2, '#F08A30'); P(4, 11 - fr * 2, 5, 5, bd); P(9, 20, 2, 4, '#F08A30'); P(16, 20, 2, 4, '#F08A30');
    P(12, 3, 2, 3, bd); P(14, 2, 2, 3, bd);
    return c;
  }
  if (mt === 'golem') {         // 石头怪
    c = mkc(34, 32); g = c.getContext('2d');
    const s = '#8C8478', sd = '#625B51', sl = '#B3AA9C';
    P(7, 8, 20, 16, s); P(9, 6, 16, 2, s); P(7, 8, 20, 2, sl); P(7, 22, 20, 2, sd);
    P(2, 13, 5, 8, s); P(27, 13, 5, 8, s);
    P(10, 24, 5, 5 - fr, sd); P(19, 24, 5, 4 + fr, sd);
    P(12, 13, 3, 2, '#1B1012'); P(20, 13, 3, 2, '#1B1012'); P(14, 18, 6, 1, sd); P(11, 10, 2, 1, '#6FBF5A'); P(21, 9, 3, 1, '#6FBF5A');
    return c;
  }
  if (mt === 'drake') {         // 小龙：绿色、小翅膀
    c = mkc(64, 48); g = c.getContext('2d');
    const b = '#4FAF6A', bd = '#2F7A45', bl = '#86D69A', wing = '#3A8A55', belly = '#E8E0A0';
    const wy = fr ? 2 : 0;
    P(18, 6 + wy, 14, 10, wing); P(14, 2 + wy, 8, 6, wing); P(20, 8 + wy, 10, 2, bl);
    P(14, 18, 30, 16, b); P(14, 18, 30, 2, bl); P(18, 28, 22, 4, belly); P(14, 32, 30, 2, bd);
    P(42, 12, 14, 12, b); P(42, 12, 14, 2, bl); P(50, 15, 3, 3, '#1B1012'); P(51, 15, 1, 1, '#FFE45C'); P(54, 20, 6, 3, b); P(57, 21, 2, 1, '#1B1012');
    P(44, 8, 2, 4, belly); P(50, 8, 2, 4, belly);
    P(4, 24, 10, 6, b); P(0, 26, 5, 3, bd); P(2, 22, 3, 3, bl);
    P(18, 34, 6, 6 - fr, bd); P(34, 34, 6, 5 + fr, bd);
    return c;
  }
  if (mt === 'lord') {          // 大龙：紫色、大翅膀、角
    c = mkc(88, 70); g = c.getContext('2d');
    const b = '#7A4FB8', bd = '#4E2E80', bl = '#A985E0', wing = '#5A3A92', belly = '#E8C8F0', horn = '#F0E6C8';
    const wy = fr ? 3 : 0;
    P(22, 4 + wy, 26, 18, wing); P(16, 0 + wy, 14, 8, wing); P(26, 14 + wy, 20, 3, bl); P(30, 8 + wy, 2, 12, bd); P(40, 8 + wy, 2, 12, bd);
    P(18, 26, 44, 24, b); P(18, 26, 44, 3, bl); P(24, 40, 32, 6, belly); P(18, 47, 44, 3, bd);
    P(58, 16, 20, 18, b); P(58, 16, 20, 3, bl); P(68, 20, 4, 4, '#1B1012'); P(69, 20, 2, 2, '#FF5A5A'); P(74, 28, 10, 4, b); P(80, 30, 3, 1, '#1B1012');
    P(60, 8, 3, 8, horn); P(70, 6, 3, 10, horn); P(61, 6, 2, 2, horn);
    P(4, 34, 14, 8, b); P(0, 36, 6, 4, bd); P(2, 30, 4, 4, bl);
    P(24, 50, 8, 8 - fr, bd); P(48, 50, 8, 7 + fr, bd);
    return c;
  }
  return mkc(8, 8);
}

/* ---------- 建筑 ---------- */
function towerSprite(team, tier, hpPct, glow) {
  const key = 't' + team + tier + (hpPct < 0.5 ? 'c' : '') + glow;
  if (SPR[key]) return SPR[key];
  const w = tier === 2 ? 30 : 26, h = tier === 2 ? 60 : 54;
  const c = mkc(w + 4, h + 4), g = c.getContext('2d'), P = (x, y, ww, hh, cl) => { g.fillStyle = cl; g.fillRect(x + 2, y + 2, ww, hh); };
  const st = '#B8B2A6', sd = '#8A8478', sl = '#D8D2C6', col = TEAM_COL[team], lt = TEAM_LT[team], dk = TEAM_DK[team];
  // 底座
  P(1, h - 10, w - 2, 10, sd); P(0, h - 12, w, 3, st); P(0, h - 12, w, 1, sl);
  // 塔身（一块块石头）
  P(5, 18, w - 10, h - 30, st);
  for (let y = 20; y < h - 12; y += 6) { P(5, y, w - 10, 1, sd); P(5 + ((y / 6) % 2) * 6 + 3, y + 1, 1, 5, sd); }
  P(5, 18, 2, h - 30, sl);
  // 顶上的平台和旗子
  P(2, 14, w - 4, 5, sd); P(2, 14, w - 4, 1, sl);
  for (let x = 2; x < w - 3; x += 5) P(x, 11, 3, 3, st);
  P(7, 22, w - 14, 9, col); P(7, 22, w - 14, 1, lt); P(9, 31, 2, 3, col); P(w - 11, 31, 2, 3, col); P(w / 2 - 1 | 0, 24, 2, 5, lt);
  // 水晶球
  const gx = (w / 2 | 0) - 4;
  P(gx, 1, 8, 9, dk); P(gx + 1, 0, 6, 11, col); P(gx + 2, 1, 2, 3, glow ? '#FFFFFF' : lt);
  if (hpPct < 0.5) { P(8, 36, 1, 6, '#5A554C'); P(9, 41, 3, 1, '#5A554C'); P(w - 10, 26 + 18, 1, 5, '#5A554C'); }
  outline(c, 200);
  SPR[key] = c;
  return c;
}
function rubbleSprite(team) {
  const key = 'rb' + team;
  if (SPR[key]) return SPR[key];
  const c = mkc(34, 16), g = c.getContext('2d'), P = (x, y, w, h, cl) => { g.fillStyle = cl; g.fillRect(x, y, w, h); };
  P(2, 8, 30, 6, '#8A8478'); P(4, 5, 8, 4, '#B8B2A6'); P(14, 3, 6, 6, '#A39D91'); P(22, 6, 8, 3, '#B8B2A6'); P(10, 10, 4, 2, TEAM_DK[team]); P(24, 9, 3, 2, TEAM_DK[team]);
  outline(c, 180);
  SPR[key] = c;
  return c;
}
function crystalSprite(team, fr) {
  const key = 'c' + team + fr;
  if (SPR[key]) return SPR[key];
  const c = mkc(44, 66), g = c.getContext('2d'), P = (x, y, w, h, cl) => { g.fillStyle = cl; g.fillRect(x, y, w, h); };
  const col = TEAM_COL[team], lt = TEAM_LT[team], dk = TEAM_DK[team];
  // 底座
  P(4, 52, 36, 10, '#8A8478'); P(2, 50, 40, 4, '#B8B2A6'); P(2, 50, 40, 1, '#D8D2C6'); P(8, 56, 28, 2, '#6E695F');
  // 悬浮的大水晶（菱形）
  const oy = fr ? 1 : 0;
  for (let i = 0; i < 18; i++) { const half = Math.round(i * 0.75) + 1; P(22 - half, 4 + i + oy, half * 2, 1, i < 3 ? lt : col); }
  for (let i = 0; i < 20; i++) { const half = Math.round((19 - i) * 0.7) + 1; P(22 - half, 22 + i + oy, half * 2, 1, i > 15 ? dk : col); }
  P(21, 6 + oy, 2, 34, lt); P(14, 18 + oy, 4, 2, lt); P(24, 24 + oy, 6, 1, dk); P(17, 30 + oy, 2, 6, shade(col, 1.25));
  P(18, 8 + oy, 1, 1, '#FFFFFF'); P(17, 9 + oy, 1, 2, '#FFFFFF');
  outline(c, 200);
  SPR[key] = c;
  return c;
}

/* ---------- 像素数字（伤害数字、等级） ---------- */
// 伤害数字、飘字的小图会越攒越多：超过 900 张就清掉重画
let SPR_N = 0;
function sprCap() { if (++SPR_N > 900) { for (const k in SPR) if (k[0] === 'd' || k[0] === 'x') delete SPR[k]; SPR_N = 0; } }
const DIGITS = {
  '0': ['111', '101', '101', '101', '111'], '1': ['010', '110', '010', '010', '111'], '2': ['111', '001', '111', '100', '111'],
  '3': ['111', '001', '111', '001', '111'], '4': ['101', '101', '111', '001', '001'], '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'], '7': ['111', '001', '010', '010', '010'], '8': ['111', '101', '111', '101', '111'],
  '9': ['111', '101', '111', '001', '111'], '+': ['000', '010', '111', '010', '000'], '-': ['000', '000', '111', '000', '000'],
  '!': ['1', '1', '1', '0', '1'], ':': ['0', '1', '0', '1', '0'], '/': ['001', '001', '010', '100', '100'], ' ': ['00', '00', '00', '00', '00'],
};
// 一串像素数字画成小图（带 1 像素描边），缓存
function digitsImg(str, col, scale) {
  const key = 'd' + str + col + scale;
  if (SPR[key]) return SPR[key];
  sprCap();
  let w = 0;
  for (const ch of str) w += (DIGITS[ch] || DIGITS[' '])[0].length + 1;
  const c = mkc(w + 2, 7), g = c.getContext('2d');
  let x = 1;
  g.fillStyle = col;
  for (const ch of str) {
    const d = DIGITS[ch] || DIGITS[' '];
    for (let r = 0; r < 5; r++) for (let q = 0; q < d[r].length; q++) if (d[r][q] === '1') g.fillRect(x + q, 1 + r, 1, 1);
    x += d[0].length + 1;
  }
  outline(c, 255);
  let out = c;
  if (scale > 1) { out = mkc(c.width * scale, c.height * scale); const og = out.getContext('2d'); og.imageSmoothingEnabled = false; og.drawImage(c, 0, 0, out.width, out.height); }
  SPR[key] = out;
  return out;
}

/* ---------- 像素字（12px 缝合像素字体，按 alpha 二值化） ---------- */
const FONT = '"XGPixel", "PingFang SC", "Microsoft YaHei", sans-serif';
function textImg(str, col, opt) {
  opt = opt || {};
  const size = 12, key = 'x' + str + col + (opt.ol || '') + (opt.scale || 1) + (opt.shadow ? 's' : '');
  if (SPR[key]) return SPR[key];
  sprCap();
  const m = mkc(4, 4).getContext('2d');
  m.font = size + 'px ' + FONT;
  const w = Math.ceil(m.measureText(str).width) + 4;
  const c = mkc(w, size + 6), g = c.getContext('2d');
  g.font = size + 'px ' + FONT; g.textBaseline = 'top'; g.fillStyle = col;
  g.fillText(str, 2, 2);
  crisp(c, 100);
  if (opt.ol) {          // 描边
    const d = g.getImageData(0, 0, c.width, c.height), p = d.data, W = c.width, H = c.height, src = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) src[i] = p[i * 4 + 3] ? 1 : 0;
    const oc = rgb(opt.ol);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x; if (src[i]) continue;
      let n = false;
      for (let dy = -1; dy <= 1 && !n; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H && src[yy * W + xx]) { n = true; break; } }
      if (n || (opt.shadow && y > 0 && src[(y - 1) * W + x])) { p[i * 4] = oc[0]; p[i * 4 + 1] = oc[1]; p[i * 4 + 2] = oc[2]; p[i * 4 + 3] = 255; }
    }
    g.putImageData(d, 0, 0);
  }
  let out = c;
  if (opt.scale > 1) { out = mkc(c.width * opt.scale, c.height * opt.scale); const og = out.getContext('2d'); og.imageSmoothingEnabled = false; og.drawImage(c, 0, 0, out.width, out.height); }
  SPR[key] = out;
  return out;
}

/* ---------- 图标（技能、装备、按钮）：16×16 小画布上用简单图形画，再二值化、描边 ---------- */
function icon(name) {
  const key = 'i' + name;
  if (SPR[key]) return SPR[key];
  const c = mkc(18, 18), g = c.getContext('2d');
  g.translate(1, 1);
  const P = (x, y, w, h, cl) => { g.fillStyle = cl; g.fillRect(x, y, w, h); };
  const circ = (x, y, r, cl) => { g.fillStyle = cl; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
  const line = (pts, cl, w) => { g.strokeStyle = cl; g.lineWidth = w || 1; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); };
  const sword = (cl) => { line([[3, 13], [12, 4]], cl || '#DDE3EA', 2); P(11, 2, 3, 3, '#DDE3EA'); line([[2, 10], [6, 14]], '#E6B84A', 2); P(1, 13, 3, 3, '#7A4A2A'); };
  switch (name) {
    case 't1': line([[2, 8], [12, 8]], '#FFD34D', 3); line([[9, 4], [14, 8], [9, 12]], '#FFD34D', 2); P(1, 4, 4, 1, '#FFFFFF'); P(0, 11, 5, 1, '#FFFFFF'); break;
    case 't2': P(3, 2, 10, 9, '#C9A23A'); P(4, 11, 8, 2, '#C9A23A'); P(6, 13, 4, 2, '#C9A23A'); P(5, 3, 6, 8, '#E2C766'); P(7, 4, 2, 7, '#C9A23A'); P(5, 6, 6, 2, '#C9A23A'); break;
    case 't3': P(0, 12, 16, 3, '#8A6A4A'); line([[8, 12], [6, 8], [9, 5], [7, 1]], '#FFD34D', 2); line([[3, 12], [2, 9]], '#FFD34D', 1); line([[13, 12], [14, 8]], '#FFD34D', 1); break;
    case 'w1': g.strokeStyle = '#DDE3EA'; g.lineWidth = 2; g.beginPath(); g.arc(8, 8, 6, 0.3, 5.2); g.stroke(); P(12, 1, 3, 3, '#FFFFFF'); P(7, 7, 2, 2, '#FFD34D'); break;
    case 'w2': g.strokeStyle = '#FFD34D'; g.lineWidth = 2; g.beginPath(); g.arc(8, 14, 7, Math.PI * 1.05, Math.PI * 1.9); g.stroke(); line([[12, 7], [15, 9], [12, 11]], '#FFD34D', 2); P(0, 14, 16, 2, '#8A6A4A'); break;
    case 'w3': sword('#FFE9A0'); P(10, 1, 5, 1, '#FFFFFF'); P(14, 1, 1, 5, '#FFFFFF'); break;
    case 'a1': line([[1, 14], [14, 1]], '#E8EEF4', 2); line([[1, 9], [8, 2]], '#8A8FA0', 1); line([[6, 15], [15, 6]], '#8A8FA0', 1); break;
    case 'a2': circ(8, 8, 7, '#56586E'); P(4, 7, 3, 2, '#FFE45C'); P(10, 7, 3, 2, '#FFE45C'); P(2, 12, 12, 2, '#33343F'); break;
    case 'a3': line([[2, 2], [14, 14]], '#E8EEF4', 2); line([[14, 2], [2, 14]], '#E8EEF4', 2); circ(8, 8, 2, '#C8323C'); break;
    case 'm1': circ(9, 7, 5, '#FF8A2A'); circ(9, 7, 3, '#FFE070'); line([[1, 15], [6, 10]], '#FF5A2A', 2); line([[1, 11], [4, 9]], '#FF8A2A', 1); break;
    case 'm2': line([[8, 0], [8, 16]], '#9CE8FF', 2); line([[1, 4], [15, 12]], '#9CE8FF', 2); line([[1, 12], [15, 4]], '#9CE8FF', 2); circ(8, 8, 2, '#FFFFFF'); break;
    case 'm3': circ(11, 11, 4, '#FF8A2A'); circ(11, 11, 2, '#FFE070'); line([[1, 1], [8, 8]], '#FF5A2A', 2); circ(4, 12, 2, '#FF8A2A'); line([[0, 7], [2, 10]], '#FF5A2A', 1); break;
    case 's1': for (const a of [-0.5, 0, 0.5]) { const dx = Math.cos(a - 0.78), dy = Math.sin(a - 0.78); line([[3, 13], [3 + dx * 12, 13 + dy * 12]], '#DDE3EA', 1); P(3 + dx * 12 - 1, 13 + dy * 12 - 1, 2, 2, '#FFFFFF'); } P(2, 12, 3, 3, '#8A5A2E'); break;
    case 's2': P(3, 4, 6, 8, '#8A5A2E'); P(3, 10, 10, 3, '#8A5A2E'); P(4, 5, 4, 3, '#B07A44'); line([[10, 3], [15, 3]], '#FFFFFF', 1); line([[11, 6], [15, 6]], '#FFFFFF', 1); break;
    case 's3': line([[1, 15], [13, 3]], '#FFE9A0', 3); line([[9, 2], [14, 2], [14, 7]], '#FFFFFF', 2); P(0, 13, 4, 1, '#E85A5A'); P(2, 15, 1, 1, '#E85A5A'); break;
    case 'h1': circ(5, 6, 3, '#FF4F7B'); circ(11, 6, 3, '#FF4F7B'); g.fillStyle = '#FF4F7B'; g.beginPath(); g.moveTo(2, 7); g.lineTo(8, 14); g.lineTo(14, 7); g.fill(); P(7, 4, 2, 6, '#FFFFFF'); P(5, 6, 6, 2, '#FFFFFF'); break;
    case 'h2': g.strokeStyle = '#5CB85C'; g.lineWidth = 2; g.beginPath(); g.moveTo(1, 14); g.bezierCurveTo(6, 2, 10, 16, 15, 2); g.stroke(); P(4, 6, 2, 2, '#8EE08E'); P(11, 9, 2, 2, '#8EE08E'); break;
    case 'h3': g.strokeStyle = '#FFE070'; g.lineWidth = 2; g.beginPath(); g.arc(8, 13, 7, Math.PI, 0); g.stroke(); circ(8, 10, 2, '#FFFFFF'); P(1, 14, 14, 1, '#FFE070'); break;
    case 'flash': g.fillStyle = '#FFE45C'; g.beginPath(); g.moveTo(10, 0); g.lineTo(3, 9); g.lineTo(8, 9); g.lineTo(5, 16); g.lineTo(13, 6); g.lineTo(8, 6); g.fill(); break;
    case 'heal': P(6, 2, 4, 12, '#6BE36B'); P(2, 6, 12, 4, '#6BE36B'); P(7, 3, 2, 10, '#B8FFB8'); break;
    case 'recall': circ(8, 8, 7, '#3B6FD8'); circ(8, 8, 5, '#7FB0FF'); circ(8, 8, 3, '#DDEBFF'); P(7, 0, 2, 4, '#FFFFFF'); break;
    case 'atk': sword(); break;
    case 'bow': line([[4, 1], [10, 4], [12, 8], [10, 12], [4, 15]], '#8A5A2E', 2); line([[4, 1], [4, 15]], '#DDDDDD', 1); line([[1, 8], [14, 8]], '#DDE3EA', 1); break;
    case 'staff': line([[3, 15], [11, 5]], '#7A4F2C', 2); circ(12, 4, 3, '#7FF5FF'); P(11, 3, 1, 1, '#FFFFFF'); break;
    case 'shield': P(3, 2, 10, 9, '#C9A23A'); P(5, 11, 6, 3, '#C9A23A'); P(5, 3, 6, 8, '#E2C766'); break;
    case 'dagger': line([[3, 13], [12, 4]], '#E8EEF4', 2); line([[2, 10], [6, 14]], '#C8323C', 2); break;
    case 'wand': circ(6, 5, 3, '#FF4F7B'); circ(10, 5, 3, '#FF4F7B'); g.fillStyle = '#FF4F7B'; g.beginPath(); g.moveTo(3, 6); g.lineTo(8, 11); g.lineTo(13, 6); g.fill(); line([[8, 10], [8, 16]], '#E6B84A', 2); break;
    case 'shop': P(2, 5, 12, 9, '#C98A3A'); P(2, 5, 12, 2, '#E6B84A'); P(5, 2, 6, 4, '#7A4A2A'); circ(8, 10, 2, '#FFE45C'); break;
    case 'pause': P(4, 3, 3, 10, '#FFFFFF'); P(9, 3, 3, 10, '#FFFFFF'); break;
    case 'auto': circ(8, 8, 6, '#3BA55D'); P(5, 5, 6, 6, '#FFFFFF'); P(6, 6, 4, 4, '#3BA55D'); break;
    case 'gold': circ(8, 8, 6, '#E6B84A'); circ(8, 8, 4, '#FFE070'); P(7, 5, 2, 6, '#C99A30'); break;
    case 'rally': P(4, 1, 2, 15, '#C8C0D8'); P(6, 1, 9, 6, '#4DA6FF'); P(6, 7, 6, 2, '#4DA6FF'); P(7, 2, 3, 2, '#9CC8FF'); break;
    default: itemIcon(g, name, P, circ, line);
  }
  crisp(c, 100);
  outline(c, 255);
  SPR[key] = c;
  return c;
}
function itemIcon(g, id, P, circ, line) {
  const I = ITEMS[id];
  if (!I) { P(2, 2, 12, 12, '#888'); return; }
  const tier = I.from ? 1 : 0;
  const glow = tier ? '#FFE070' : '#DDE3EA';
  switch (id) {
    case 'sword': line([[3, 13], [12, 4]], '#C8CDD4', 2); line([[2, 10], [6, 14]], '#8A6A4A', 2); break;
    case 'dagger': line([[4, 12], [11, 5]], '#C8CDD4', 2); line([[3, 10], [6, 13]], '#5A5A5A', 2); break;
    case 'glove': P(4, 5, 8, 8, '#C0703A'); P(4, 3, 2, 3, '#C0703A'); P(7, 2, 2, 3, '#C0703A'); P(10, 3, 2, 3, '#C0703A'); P(4, 12, 8, 2, '#8A4A22'); break;
    case 'book': P(3, 2, 10, 12, '#5A4AB0'); P(4, 3, 8, 10, '#7A6AD0'); P(3, 2, 2, 12, '#3A2E80'); circ(9, 8, 2, '#FFE070'); break;
    case 'ruby': g.fillStyle = '#E0303C'; g.beginPath(); g.moveTo(8, 1); g.lineTo(14, 7); g.lineTo(8, 15); g.lineTo(2, 7); g.fill(); P(6, 4, 2, 3, '#FF9AA0'); break;
    case 'vest': P(3, 3, 10, 11, '#8A8F9C'); P(6, 3, 4, 3, '#4A4F5C'); P(4, 6, 8, 1, '#B3B8C4'); P(4, 10, 8, 1, '#B3B8C4'); break;
    case 'cape': P(4, 2, 8, 3, '#4A7AC8'); P(3, 5, 10, 9, '#3A5EA8'); P(5, 5, 2, 9, '#6A9AE8'); break;
    case 'shoe': P(4, 4, 5, 8, '#9A7A52'); P(4, 10, 9, 4, '#9A7A52'); P(5, 5, 3, 2, '#C8A47A'); break;
    case 'bootA': case 'bootM': case 'bootD': {
      const col = id === 'bootA' ? '#E8A030' : id === 'bootM' ? '#8D6BD8' : '#7A8495';
      P(4, 2, 6, 10, col); P(4, 10, 10, 4, col); P(5, 3, 3, 3, '#FFFFFF'); P(3, 2, 8, 2, shade(col, 0.7));
      if (id === 'bootA') { line([[12, 2], [15, 2]], '#FFF', 1); line([[12, 5], [15, 5]], '#FFF', 1); }
      if (id === 'bootM') P(11, 2, 3, 3, '#7FF5FF');
      break;
    }
    case 'fang': g.fillStyle = '#F4F0E0'; g.beginPath(); g.moveTo(3, 2); g.lineTo(13, 2); g.lineTo(8, 15); g.fill(); P(5, 2, 6, 3, '#C83040'); P(7, 6, 2, 4, '#E05060'); break;
    case 'storm': line([[2, 14], [13, 3]], '#DDE3EA', 3); P(12, 1, 3, 3, '#FFFFFF'); line([[1, 10], [6, 15]], '#E6B84A', 2); line([[10, 9], [14, 11], [11, 12], [15, 15]], '#7FDBFF', 1); break;
    case 'bow': line([[4, 1], [10, 4], [12, 8], [10, 12], [4, 15]], '#8A5A2E', 2); line([[4, 1], [4, 15]], '#DDD', 1); line([[1, 8], [14, 8]], '#FFE070', 1); P(12, 7, 3, 3, '#FFE070'); break;
    case 'spear': line([[2, 14], [12, 4]], '#8A5A2E', 2); g.fillStyle = '#DDE3EA'; g.beginPath(); g.moveTo(15, 1); g.lineTo(9, 3); g.lineTo(13, 7); g.fill(); break;
    case 'axe': line([[3, 14], [11, 3]], '#8A5A2E', 2); g.fillStyle = '#C83040'; g.beginPath(); g.moveTo(8, 1); g.lineTo(15, 3); g.lineTo(13, 10); g.lineTo(9, 6); g.fill(); break;
    case 'staff': line([[3, 15], [11, 5]], '#7A4F2C', 2); circ(12, 4, 3, '#B98AFF'); P(11, 3, 1, 1, '#FFFFFF'); P(13, 0, 1, 2, '#FFE070'); break;
    case 'orb': circ(8, 8, 6, '#7FDBFF'); circ(8, 8, 4, '#C8F4FF'); P(5, 5, 2, 2, '#FFFFFF'); line([[2, 2], [4, 4]], '#FFFFFF', 1); break;
    case 'wand': line([[2, 14], [11, 5]], '#3A2E50', 2); circ(12, 4, 3, '#5A2E90'); circ(12, 4, 1, '#E070FF'); break;
    case 'glass': P(4, 1, 8, 2, '#C9A23A'); P(4, 13, 8, 2, '#C9A23A'); g.fillStyle = '#9CE8FF'; g.beginPath(); g.moveTo(5, 3); g.lineTo(11, 3); g.lineTo(8, 8); g.lineTo(11, 13); g.lineTo(5, 13); g.lineTo(8, 8); g.fill(); P(7, 10, 2, 3, '#FFE070'); break;
    case 'belt': P(1, 6, 14, 5, '#8A5A2E'); P(6, 5, 5, 7, '#E6B84A'); P(7, 7, 3, 3, '#8A5A2E'); break;
    case 'thorn': P(3, 3, 10, 11, '#6A6F7C'); for (const [x, y] of [[2, 4], [13, 4], [2, 9], [13, 9], [6, 1], [9, 1]]) P(x, y, 1, 2, '#DDE3EA'); P(6, 6, 4, 4, '#C83040'); break;
    case 'cloak': P(4, 2, 8, 3, '#C9A23A'); P(3, 5, 10, 9, '#2E6E8E'); P(5, 5, 2, 9, '#4E9EBE'); circ(8, 4, 1, '#FFE070'); break;
    case 'totem': P(5, 2, 6, 12, '#7A5A3A'); P(4, 4, 8, 3, '#5CB85C'); P(6, 8, 4, 2, '#FFE070'); P(5, 13, 6, 2, '#5A4228'); break;
    default: P(2, 2, 12, 12, glow);
  }
}
if (typeof module !== 'undefined') module.exports = {};
