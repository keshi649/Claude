'use strict';
/* props.js：本集的道具和小角色——花粉、病毒、细菌、尘螨、花生、陪练微生物、警报灯、检查站、
   牛、马、狗、谷仓、机械化农场、拖拉机、宝宝、小鼠……全部程序画的像素图。坐标都是世界像素。 */

/* 小脸：(x,y) 为两眼中点。kind：'n' 'happy' 'sweat' 'scared' 'angry' 'calm' */
function tinyFace(g, x, y, kind = 'n', o = {}) {
  const e = o.eye || '#1B1730', d = o.d ?? 2, big = o.big;
  x = ri(x); y = ri(y);
  if (kind === 'happy' || kind === 'calm') {
    for (const s of [-1, 1]) { pdot(g, x + s * d - 1, y, e); pdot(g, x + s * d, y - 1, e); pdot(g, x + s * d + 1, y, e); }
  } else if (kind === 'angry') {
    for (const s of [-1, 1]) { prect(g, x + s * d, y, 1, big ? 2 : 1, e); pdot(g, x + s * d - s, y - 2, e); pdot(g, x + s * d, y - 1, e); }
  } else {
    for (const s of [-1, 1]) prect(g, x + s * d, y - (big ? 1 : 0), 1, big ? 2 : 1, e);
  }
  // 嘴
  if (kind === 'happy') { pdot(g, x - 1, y + 2, e); pdot(g, x, y + 3, e); pdot(g, x + 1, y + 2, e); }
  else if (kind === 'scared') { prect(g, x - 1, y + 2, 2, 2, e); }
  else if (kind === 'angry') { prect(g, x - 1, y + 3, 3, 1, e); }
  else if (kind === 'sweat') { prect(g, x - 1, y + 3, 2, 1, e); }
  else if (kind === 'calm') { prect(g, x - 1, y + 3, 3, 1, e); }
  else { pdot(g, x, y + 2, e); }
  if (kind === 'sweat' || kind === 'scared') { pdot(g, x + d + 3, y - 2, '#7FC8FF'); prect(g, x + d + 2, y - 1, 3, 2, '#7FC8FF'); }
  if (o.blush) { pdot(g, x - d - 2, y + 1, '#F2A0A0'); pdot(g, x + d + 2, y + 1, '#F2A0A0'); }
}

/* 花粉：黄色带刺的小球，(x,y) 为中心 */
function drawPollen(g, x, y, t, o = {}) {
  const r = o.r || 6, body = '#FFD84A', sh = '#E8B92E', sp = '#F2C230';
  x = ri(x); y = ri(y);
  const n = r >= 6 ? 12 : 8, a0 = (o.spin || 0) * t;
  for (let i = 0; i < n; i++) {
    const a = a0 + i * TAU / n;
    pdot(g, x + Math.round(Math.cos(a) * (r + 1.5)), y + Math.round(Math.sin(a) * (r + 1.5)), sp);
    if (r >= 6) pdot(g, x + Math.round(Math.cos(a) * (r + .6)), y + Math.round(Math.sin(a) * (r + .6)), sp);
  }
  pdisc(g, x, y, r, sh); pdisc(g, x - 1, y - 1, r - 1, body);
  for (let i = 0; i < 5; i++) pdot(g, x - r + 2 + Math.floor(hash(i, 3) * (2 * r - 3)), y - r + 2 + Math.floor(hash(i, 7) * (2 * r - 3)), sh);
  pdot(g, x - Math.floor(r / 2), y - Math.floor(r / 2) - 1, '#FFF3B0');
  if (o.face !== 'none' && r >= 4) tinyFace(g, x, y - 1, o.face || 'n', { d: r >= 6 ? 2 : 1, blush: r >= 6 });
}

/* 病毒：绿色、带小肉球的刺；凶 */
function drawVirus(g, x, y, t, o = {}) {
  const r = o.r || 6, body = '#6BCB5A', dk = '#3E8E41', knob = '#E85D75';
  x = ri(x); y = ri(y);
  for (let i = 0; i < 8; i++) {
    const a = i * TAU / 8 + .2, cx = x + Math.round(Math.cos(a) * (r + 2)), cy = y + Math.round(Math.sin(a) * (r + 2));
    pline(g, x + Math.round(Math.cos(a) * r), y + Math.round(Math.sin(a) * r), cx, cy, dk);
    prect(g, cx - 1, cy - 1, 2, 2, knob);
  }
  pdisc(g, x, y, r, dk); pdisc(g, x - 1, y - 1, r - 1, body);
  tinyFace(g, x, y, 'angry', { d: 2, big: true });
}

/* 细菌：紫色胶囊 + 摆动的鞭毛；凶 */
function drawBacterium(g, x, y, t, o = {}) {
  x = ri(x); y = ri(y);
  for (let k = 0; k < 3; k++) for (let i = 0; i < 6; i++) pdot(g, x - 8 - i, y - 2 + k * 2 + Math.round(Math.sin(t * 10 + i * .9 + k) * 1), '#7E4BB0');
  pell(g, x, y, 7, 3, '#7E4BB0'); pell(g, x - 1, y - 1, 6, 2, '#A86ADB');
  pdot(g, x - 3, y + 1, '#7E4BB0'); pdot(g, x + 4, y - 1, '#7E4BB0');
  tinyFace(g, x + 2, y - 1, 'angry', { d: 2 });
}

/* 尘螨：米色椭圆 + 八条腿（放大了画） */
function drawMite(g, x, y, t, o = {}) {
  x = ri(x); y = ri(y);
  const st = Math.floor(t * 8) % 2;
  for (let i = 0; i < 4; i++) {
    const lx = x - 4 + i * 3, up = (i + st) % 2;
    pline(g, lx, y + 2, lx - 1, y + 5 - up, '#B79E73');
    pline(g, lx, y - 2, lx - 1, y - 5 + up, '#B79E73');
  }
  pell(g, x, y, 6, 4, '#C9AE7E'); pell(g, x - 1, y - 1, 5, 3, '#E9D6B0');
  tinyFace(g, x + 2, y - 1, o.face || 'n', { d: 1 });
}

/* 花生：两节的壳；face 可选 */
function drawPeanut(g, x, y, o = {}) {
  x = ri(x); y = ri(y);
  const c = '#D8A866', dk = '#B9874A', hi = '#EBC68E';
  pdisc(g, x, y - 3, 3, c); pdisc(g, x, y + 3, 3, c); prect(g, x - 2, y - 1, 5, 2, c);
  pdot(g, x - 1, y - 4, hi); pdot(g, x - 2, y + 2, hi);
  for (const [a, b] of [[1, -3], [-1, -1], [1, 2], [-1, 4], [2, 4]]) pdot(g, x + a, y + b, dk);
  if (o.face) tinyFace(g, x, y - 3, o.face, { d: 1 });
}

/* 陪练微生物：五种友善的小家伙 */
const MIC_COL = [['#55B7B5', '#3E8F8D'], ['#F2A0C0', '#C9728F'], ['#A6D96A', '#6FA83C'], ['#B8A2E8', '#8A73C4'], ['#FFB27A', '#D9844A']];
function drawMicrobe(g, x, y, kind, t, o = {}) {
  x = ri(x); y = ri(y);
  const [c, dk] = MIC_COL[kind % 5], bob = Math.floor(t * 4 + kind) % 2;
  y -= bob;
  if (kind % 5 === 0) { pdisc(g, x, y, 3, dk); pdisc(g, x, y, 2, c); }
  else if (kind % 5 === 1) { pell(g, x, y, 4, 2, dk); pell(g, x, y, 3, 2, c); }
  else if (kind % 5 === 2) { prect(g, x - 3, y - 1, 7, 3, dk); prect(g, x - 1, y - 3, 3, 7, dk); prect(g, x - 2, y - 1, 5, 3, c); prect(g, x - 1, y - 2, 3, 5, c); }
  else if (kind % 5 === 3) { prect(g, x - 3, y - 2, 6, 4, dk); prect(g, x - 2, y - 1, 4, 2, c); pdot(g, x - 4 - Math.floor(t * 6) % 2, y, dk); }
  else { pdisc(g, x, y, 3, dk); pdisc(g, x, y, 2, c); pdot(g, x - 1, y + 1, dk); pdot(g, x + 2, y - 1, dk); }
  pdot(g, x - 1, y - 1, '#1B1730'); pdot(g, x + 1, y - 1, '#1B1730');
}

/* 警报灯：(x,y) 为底座中心；on 时闪 */
function drawSiren(g, x, y, t, on) {
  x = ri(x); y = ri(y);
  prect(g, x - 5, y - 2, 10, 3, '#3B3F4E'); prect(g, x - 4, y - 2, 8, 1, '#596070');
  const lit = on && Math.floor(t * 6) % 2 === 0;
  pell(g, x, y - 5, 4, 3, lit ? '#FF4B3E' : '#A8322A'); prect(g, x - 4, y - 5, 9, 3, lit ? '#FF4B3E' : '#A8322A');
  pdot(g, x - 2, y - 7, lit ? '#FFFFFF' : '#D86A60'); pdot(g, x - 2, y - 6, lit ? '#FFD0C8' : '#C0504A');
}

/* 检查站的横杆：(x,y) 为转轴；ang = 0 放下，-π/2 抬起 */
function drawBarrier(g, x, y, len, ang) {
  for (let i = 0; i <= len; i++) {
    const px = x + Math.round(Math.cos(ang) * i), py = y + Math.round(Math.sin(ang) * i);
    const col = Math.floor(i / 4) % 2 ? '#F4F4F4' : '#E5322D';
    prect(g, px, py - 1, 1, 2, col);
  }
  prect(g, x - 2, y - 2, 4, 14, '#596070'); prect(g, x - 3, y + 10, 6, 3, '#3B3F4E');
}

/* 岗亭：(x,y) 左下角 */
function drawBooth(g, x, y) {
  prect(g, x, y - 26, 20, 26, '#4F6FB5'); prect(g, x + 1, y - 25, 18, 1, '#6D8BD1');
  prect(g, x - 2, y - 30, 24, 4, '#2C3E78'); prect(g, x - 1, y - 31, 22, 1, '#3F56A0');
  prect(g, x + 3, y - 21, 14, 9, '#BFE6FF'); prect(g, x + 4, y - 20, 4, 2, '#FFFFFF');
  prect(g, x + 3, y - 21, 14, 1, '#2C3E78'); prect(g, x + 9, y - 21, 1, 9, '#2C3E78');
  prect(g, x + 2, y - 10, 16, 2, '#2C3E78');
}

/* 纸巾：(x,y) 为左上 */
function drawTissue(g, x, y, t = 0) {
  prect(g, x, y, 5, 6, '#FFFFFF'); prect(g, x + 1, y - 1, 3, 1, '#FFFFFF'); pdot(g, x + 4, y + 5, '#D8E2EC'); pdot(g, x, y + 2, '#D8E2EC');
}

/* 牛：(x,y) 为身体左上，朝右 */
function drawCow(g, x, y, t, o = {}) {
  x = ri(x); y = ri(y);
  const w = '#F7F4EE', k = '#2A2630', p = '#F2A0A0', chew = Math.floor(t * 3) % 2;
  // 腿
  for (const lx of [1, 5, 11, 15]) prect(g, x + lx, y + 8, 2, 5, w), prect(g, x + lx, y + 12, 2, 1, k);
  prect(g, x, y, 18, 9, w);
  prect(g, x + 3, y + 1, 5, 4, k); prect(g, x + 10, y + 4, 4, 3, k); prect(g, x + 14, y, 3, 2, k);
  prect(g, x + 6, y + 9, 4, 1, p);                       // 乳房
  pline(g, x - 1, y + 1, x - 3, y + 7, k); pdot(g, x - 3, y + 8, k);   // 尾巴
  // 头
  prect(g, x + 16, y - 4, 8, 8, w); prect(g, x + 18, y - 4, 3, 2, k);
  prect(g, x + 20, y + 1 + chew, 5, 3, p); pdot(g, x + 22, y + 2 + chew, '#C97080');
  pdot(g, x + 20, y - 1, k); pdot(g, x + 17, y - 5, '#E8DCC0'); pdot(g, x + 23, y - 5, '#E8DCC0');
  prect(g, x + 15, y - 3, 2, 2, w);
}

/* 马：朝右 */
function drawHorse(g, x, y, t, o = {}) {
  x = ri(x); y = ri(y);
  const b = '#9A5B34', dk = '#6B3C21', m = '#3A2418';
  const st = Math.floor(t * 4) % 2;
  for (const [lx, ph] of [[1, 0], [5, 1], [12, 0], [16, 1]]) prect(g, x + lx, y + 8, 2, 6 - ((st + ph) % 2), b), prect(g, x + lx, y + 13 - ((st + ph) % 2), 2, 1, m);
  prect(g, x, y, 19, 9, b); prect(g, x, y + 7, 19, 2, dk);
  pline(g, x - 1, y + 1, x - 3, y + 8, m); pline(g, x - 2, y + 1, x - 4, y + 7, m);
  prect(g, x + 15, y - 5, 5, 8, b); prect(g, x + 18, y - 7, 6, 5, b); prect(g, x + 22, y - 5, 3, 3, dk);
  pdot(g, x + 20, y - 6, m); prect(g, x + 14, y - 6, 3, 7, m); pdot(g, x + 18, y - 8, b);
}

/* 狗：朝右，摇尾巴 */
function drawDog(g, x, y, t) {
  x = ri(x); y = ri(y);
  const b = '#D9A066', w = '#F7F0E2', k = '#2A2630', wag = Math.floor(t * 8) % 2;
  for (const lx of [1, 4, 9, 12]) prect(g, x + lx, y + 5, 2, 4, b);
  prect(g, x, y, 14, 6, b); prect(g, x + 4, y + 3, 7, 3, w);
  pline(g, x - 1, y, x - 3, y - 2 - wag, b);
  prect(g, x + 11, y - 4, 7, 6, b); prect(g, x + 15, y - 1, 4, 3, w); pdot(g, x + 18, y - 1, k); pdot(g, x + 15, y - 3, k);
  prect(g, x + 11, y - 5, 2, 4, '#9A6A3E');
}

/* 谷仓：(x,y) 左下角，40×34 */
function drawBarn(g, x, y) {
  const r = '#B23A2E', dk = '#8C2A22', w = '#F4F4F4', roof = '#5E2A22';
  prect(g, x, y - 24, 40, 24, r);
  for (let i = 3; i < 40; i += 4) prect(g, x + i, y - 24, 1, 24, dk);
  // 屋顶（复斜）
  for (let j = 0; j < 12; j++) { const inset = j < 6 ? j : 6 + (j - 6) * 2; prect(g, x - 2 + inset, y - 25 - j, 44 - inset * 2, 1, roof); }
  prect(g, x + 14, y - 34, 12, 2, '#7A3A2E');
  // 门：白边 + X
  prect(g, x + 12, y - 16, 16, 16, dk); prect(g, x + 12, y - 16, 16, 1, w); prect(g, x + 12, y - 16, 1, 16, w); prect(g, x + 27, y - 16, 1, 16, w);
  pline(g, x + 13, y - 15, x + 26, y - 1, w); pline(g, x + 26, y - 15, x + 13, y - 1, w);
  // 草料窗
  prect(g, x + 16, y - 30, 8, 5, '#3A1A14'); prect(g, x + 16, y - 27, 8, 2, '#E8C26A'); prect(g, x + 15, y - 31, 10, 1, w);
}

/* 机械化大农场：灰色大棚 + 两个筒仓，(x,y) 左下角，宽 48 */
function drawBigFarm(g, x, y) {
  prect(g, x, y - 20, 34, 20, '#AEB7C2'); for (let i = 2; i < 34; i += 3) prect(g, x + i, y - 20, 1, 20, '#98A2AE');
  for (let j = 0; j < 6; j++) prect(g, x - 1 + j, y - 21 - j, 36 - j * 2, 1, '#7E8794');
  prect(g, x + 4, y - 13, 10, 13, '#5E6773'); prect(g, x + 20, y - 15, 9, 5, '#CFE2F0');
  for (const sx of [36, 43]) { prect(g, x + sx, y - 34, 6, 34, '#D3DAE2'); prect(g, x + sx, y - 34, 1, 34, '#B8C1CB'); pell(g, x + sx + 3, y - 34, 3, 2, '#9AA6B2'); for (let j = 4; j < 34; j += 6) prect(g, x + sx, y - j, 6, 1, '#B8C1CB'); }
  prect(g, x + 26, y - 32, 2, 12, '#7E8794'); prect(g, x + 26, y - 32, 12, 2, '#7E8794');
}

/* 拖拉机：朝右，(x,y) 左下角 */
function drawTractor(g, x, y, t) {
  const sh = Math.floor(t * 10) % 2;
  prect(g, x + 2, y - 10 - sh, 16, 6, '#3E9E4F'); prect(g, x + 10, y - 17 - sh, 7, 7, '#3E9E4F'); prect(g, x + 11, y - 16 - sh, 5, 4, '#BFE6FF');
  prect(g, x + 4, y - 14 - sh, 2, 4, '#2A2630');
  pdisc(g, x + 5, y - 4, 4, '#2A2630'); pdisc(g, x + 5, y - 4, 2, '#F2C230');
  pdisc(g, x + 16, y - 3, 3, '#2A2630'); pdot(g, x + 16, y - 3, '#F2C230');
  if (Math.floor(t * 3) % 2) { pdot(g, x + 4, y - 17, '#C9D3DE'); pdot(g, x + 3, y - 19, '#E3E8EE'); }
}

/* 干草堆：(x,y) 底边中心 */
function drawHay(g, x, y, w = 14, h = 8) {
  for (let j = 0; j < h; j++) { const hw = Math.round(w / 2 * Math.sqrt(1 - Math.pow(j / h, 2))); prect(g, x - hw, y - j, hw * 2, 1, j % 3 === 0 ? '#D9AE4F' : '#E8C26A'); }
  for (let i = 0; i < w; i += 3) pdot(g, x - w / 2 + i + 1, y - 2 - (i % 4), '#C9973C');
}

/* 小宝宝：用户原图的 12×8 方块，原样一格一个像素 */
function drawBaby(g, x, y, o = {}) {
  const rows = ['..oooooooo..', '..o#oooo#o..', 'oooooooooooo', 'oooooooooooo', '..oooooooo..', '..oooooooo..', '..o.o..o.o..', '..o.o..o.o..'];
  const col = o.col || TONES.base, eye = '#171312';
  x = ri(x); y = ri(y);
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '.') { g.fillStyle = r[i] === '#' ? (o.eyes === 'shut' ? col : eye) : col; g.fillRect(x + i, y + j, 1, 1); } });
  if (o.eyes === 'shut' || o.eyes === 'happy') { prect(g, x + 3, y + 1, 1, 1, eye); prect(g, x + 8, y + 1, 1, 1, eye); }
  if (o.bib) { prect(g, x + 4, y + 4, 4, 2, o.bib); }
  if (o.nose) pdot(g, x + 5, y + 2, '#F0605A');
  if (o.cap) { prect(g, x + 3, y - 2, 6, 2, '#2C3E78'); pdot(g, x + 5, y - 2, C.gold); prect(g, x + 2, y - 1, 8, 1, '#141B38'); }
}

/* 高脚椅：(x,y) 为座面左端 */
function drawHighChair(g, x, y) {
  prect(g, x - 1, y, 16, 2, '#C98B4A'); prect(g, x - 2, y - 3, 18, 2, '#E8C08A');
  for (const lx of [0, 13]) pline(g, x + lx, y + 2, x + lx + (lx ? 2 : -2), y + 16, '#A86C35');
  prect(g, x - 4, y + 15, 22, 1, '#A86C35');
}

/* 花生酱罐 */
function drawJar(g, x, y) {
  prect(g, x, y - 8, 7, 8, '#C98B4A'); prect(g, x - 1, y - 10, 9, 2, '#E5322D'); prect(g, x + 1, y - 6, 5, 3, '#FFF6E0'); pdot(g, x + 3, y - 5, '#C98B4A');
}

/* 钱袋 */
function drawMoneyBag(g, x, y) {
  pdisc(g, x, y, 4, '#C9A04A'); prect(g, x - 1, y - 6, 3, 2, '#C9A04A'); prect(g, x - 2, y - 5, 5, 1, '#8E6A2A'); pdot(g, x, y, '#FFE27A'); pdot(g, x, y - 1, '#FFE27A'); pdot(g, x, y + 1, '#FFE27A');
}

/* 空白病历夹 */
function drawClipboard(g, x, y) {
  prect(g, x, y, 14, 18, '#9A6A3E'); prect(g, x + 1, y + 2, 12, 15, '#FFFDF6'); prect(g, x + 4, y - 1, 6, 3, '#9AA1AD');
  for (let j = 0; j < 4; j++) prect(g, x + 3, y + 5 + j * 3, j === 0 ? 6 : 8, 1, '#E0D6C4');
}

/* 小鼠（沿用上一集的大鼠，画小一号） */
const MOUSE = [
  () => spr('mouse0', ['......gg..', '.gggggggk.', 'gggggggggp', '.gGGGGGgg.', '..p.p.p.p.'], Object.assign({}, PAL, { g: '#C3C9D3', G: '#A3A9B4', p: '#F2A0A0', k: '#1B1730' })),
  () => spr('mouse1', ['......gg..', '.gggggggk.', 'ggggggggg.', '.gGGGGGggp', '.p.p.p.p..'], Object.assign({}, PAL, { g: '#C3C9D3', G: '#A3A9B4', p: '#F2A0A0', k: '#1B1730' })),
];
const MOUSE_TAIL = (g, x, y, t) => { for (let i = 0; i < 6; i++) pdot(g, x - i, y + Math.round(Math.sin(t * 6 + i * .8)), '#F2A0A0'); };

/* 灰尘罐：(x,y) 左下 */
function drawDustJar(g, x, y, dust) {
  prect(g, x, y - 12, 10, 12, 'rgba(220,240,255,.55)'); prect(g, x, y - 12, 1, 12, '#FFFFFF'); prect(g, x + 9, y - 12, 1, 12, '#B8C9D8');
  prect(g, x - 1, y - 14, 12, 2, '#7E8794'); prect(g, x + 1, y - 5, 8, 5, dust);
  for (let i = 0; i < 6; i++) pdot(g, x + 1 + Math.floor(hash(i, 9) * 8), y - 6 - Math.floor(hash(i, 4) * 3), dust);
}

/* 医生：白大褂 + 额镜 */
function drawDoctor(g, x, y, t, o = {}) {
  drawClawd(g, x, y, { eyes: o.eyes || blinkEyes(t, 4), arms: o.arms || 'n' });
  prect(g, x + 4, y + 6, 16, 6, '#F4F4F4'); prect(g, x + 11, y + 6, 2, 4, '#C9D3DE'); prect(g, x + 15, y + 8, 3, 2, '#C9D3DE');
  if ((o.arms || 'n') === 'n') { prect(g, x, y + 4, 4, 4, '#F4F4F4'); prect(g, x + 20, y + 4, 4, 4, '#F4F4F4'); }
  prect(g, x + 3, y - 1, 18, 1, '#7E8494'); pdisc(g, x + 12, y - 4, 3, '#C9D3DE'); pdisc(g, x + 12, y - 4, 2, '#FFFFFF'); pdot(g, x + 12, y - 4, '#9AA1AD');
}

/* 过敏的小怪：红鼻子、鼻涕、手里一张纸巾；sneeze 0..1：0 平常，.5 憋气，1 打喷嚏 */
function drawSneezy(g, x, y, t, o = {}) {
  const s = o.sneeze || 0;
  const lean = s > .3 && s < .85 ? -1 : s >= .85 ? 1 : 0;
  const eyes = s > .3 && s < .85 ? 'squint' : s >= .85 ? 'shut' : (o.eyes || blinkEyes(t, o.seed || 1));
  drawClawd(g, x + lean, y + (s >= .85 ? 1 : 0), Object.assign({}, o.clawd || {}, { eyes, nose: true, drip: s >= .85 ? 0 : 1 + Math.floor(t * 1.5) % 2, arms: o.arms || 'upR' }));
  if (!o.noTissue) drawTissue(g, x + 23, y - 4 + (s >= .85 ? -2 : 0));
}

/* 保安：藏青帽；badge = 'calm' 时胸前别一枚绿色"淡定"徽章 */
function drawGuard(g, x, y, t, o = {}) {
  drawClawd(g, x, y, { hat: 'cap', eyes: o.eyes || blinkEyes(t, o.seed || 0), arms: o.arms || 'n', legs: o.legs || 0, col: o.col });
  if (o.badge === 'calm') { prect(g, x + 15, y + 6, 3, 3, '#5BE37D'); pdot(g, x + 16, y + 7, '#FFFFFF'); }
  if (o.whistle) { prect(g, x + 13, y + 5, 3, 2, '#C9D3DE'); pdot(g, x + 16, y + 5, '#9AA1AD'); }
}

/* 禁止标志（全分辨率）：红圈 + 斜杠 */
function noSign(g, x, y, r) {
  g.save(); g.strokeStyle = '#E5322D'; g.lineWidth = r * .22;
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke();
  g.beginPath(); g.moveTo(x - r * .7, y - r * .7); g.lineTo(x + r * .7, y + r * .7); g.stroke(); g.restore();
}
