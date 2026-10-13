'use strict';
/* props.js：本片新画的道具——牙齿（侧面，正常色和 X 光色）、下巴工地、X 光片、大鼠、食物、医生行头。 */

/* ================= 牙齿 =================
   侧面看：上面是牙冠，下面是牙根。sprite 的 (0, crownH) 一行就是牙龈线。 */
const TOOTH = {
  //        宽  冠高 根长 根数
  inc: [9, 13, 18, 1],
  can: [10, 15, 22, 1],
  pre: [12, 11, 16, 1],
  mol: [17, 10, 14, 2],
  mol2: [16, 10, 14, 2],
  wis: [15, 10, 12, 2],
};
const TOOTH_PAL = {
  real: { line: '#7E725E', enamel: '#FBF7EE', shade: '#E2D8C4', hi: '#FFFFFF', root: '#EADCC0', rootSh: '#CDBB98', pulp: null },
  xray: { line: '#8FB0D6', enamel: '#EAF4FF', shade: '#C7DBF2', hi: '#FFFFFF', root: '#B4CBE6', rootSh: '#97B3D6', pulp: '#5E7FA8' },
  worn: { line: '#7E725E', enamel: '#F3ECDD', shade: '#D9CDB4', hi: '#FFFFFF', root: '#EADCC0', rootSh: '#CDBB98', pulp: null },
};
const TOOTH_CACHE = {};
/* type：牙的种类；pal：配色；wear：0..1 磨耗（牙冠变矮、尖变平、两侧被磨窄）；face：画上眼睛（智齿角色） */
function tooth(type, pal = 'real', wear = 0, face = null) {
  const key = `${type}|${pal}|${wear.toFixed(2)}|${face}`;
  if (TOOTH_CACHE[key]) return TOOTH_CACHE[key];
  const [w0, ch0, rl, nr] = TOOTH[type], P = TOOTH_PAL[pal];
  const side = Math.round(wear * 2);                        // 两侧各磨掉的像素
  const w = w0 - side * 2, ch = Math.max(5, Math.round(ch0 * (1 - wear * .45)));
  const c = mk(w0, ch0 + rl + 2), g = c.getContext('2d');
  const R = (x, y, ww, hh, col) => { g.fillStyle = col; g.fillRect(side + x, y + (ch0 - ch), ww, hh); };
  // 牙根
  const rootTop = ch;
  if (nr === 1) {
    for (let j = 0; j < rl; j++) { const inset = Math.round(j * (w / 2 - 1.5) / rl); R(inset, rootTop + j, w - inset * 2, 1, P.line); R(inset + 1, rootTop + j, Math.max(1, w - inset * 2 - 2), 1, j > rl * .5 ? P.rootSh : P.root); }
  } else {
    const rw = Math.floor(w / 2) - 1;
    for (let j = 0; j < rl; j++) {
      const inset = Math.round(j * (rw / 2 - 1) / rl), lean = Math.round(j * .12);
      R(inset - lean, rootTop + j, rw - inset, 1, P.line); R(inset - lean + 1, rootTop + j, Math.max(1, rw - inset - 2), 1, P.root);
      R(w - rw + lean, rootTop + j, rw - inset, 1, P.line); R(w - rw + lean + 1, rootTop + j, Math.max(1, rw - inset - 2), 1, P.rootSh);
    }
    R(rw - 1, rootTop, w - rw * 2 + 2, 2, P.line);
  }
  // 牙冠
  for (let j = 0; j < ch; j++) {
    let inset = 0;
    if (type === 'can') inset = Math.max(0, Math.round((5 - j) * .9));     // 犬齿：尖
    else if (j === 0) inset = 1;
    R(inset, j, w - inset * 2, 1, P.line);
    if (j > 0) { R(inset + 1, j, Math.max(1, w - inset * 2 - 2), 1, P.enamel); R(w - inset - 3, j, 2, 1, P.shade); }
  }
  // 磨牙的牙尖
  if ((type === 'mol' || type === 'mol2' || type === 'wis' || type === 'pre') && wear < .5) {
    const n = type === 'pre' ? 2 : 3;
    for (let i = 0; i < n; i++) { const cx = Math.round((i + .5) * w / n); R(cx - 1, -1, 3, 1, P.line); R(cx, 0, 1, 1, P.enamel); }
  }
  R(2, 2, 1, Math.max(1, ch - 5), P.hi);
  if (P.pulp) { R(Math.round(w / 2) - 2, Math.round(ch * .45), 4, Math.round(ch * .55), P.pulp); R(Math.round(w / 2) - 1, ch, 2, Math.round(rl * .7), P.pulp); }
  if (face) {   // 智齿的脸
    const ey = Math.round(ch * .35);
    if (face === 'sad') { R(3, ey + 1, 2, 1, C.eye); R(w - 5, ey + 1, 2, 1, C.eye); R(Math.round(w / 2) - 1, ey + 4, 3, 1, C.eye); }
    else if (face === 'happy') { R(3, ey + 1, 1, 1, C.eye); R(4, ey, 1, 1, C.eye); R(5, ey + 1, 1, 1, C.eye); R(w - 6, ey + 1, 1, 1, C.eye); R(w - 5, ey, 1, 1, C.eye); R(w - 4, ey + 1, 1, 1, C.eye); }
    else { R(3, ey, 2, 2, C.eye); R(w - 5, ey, 2, 2, C.eye); }
    R(2, ey + 3, 1, 1, '#F2A0A0'); R(w - 3, ey + 3, 1, 1, '#F2A0A0');
  }
  TOOTH_CACHE[key] = c;
  return c;
}
/* 一侧下颌 8 颗牙：中切牙、侧切牙、犬齿、两颗前磨牙、三颗磨牙（最后一颗是智齿） */
const ROW = ['inc', 'inc', 'can', 'pre', 'pre', 'mol', 'mol2', 'wis'];
function rowX(x0, shrink = []) {   // 每颗牙的左边缘；shrink[i] 为磨耗后少掉的宽度
  const xs = []; let x = x0;
  ROW.forEach((k, i) => { xs.push(x); x += TOOTH[k][0] - (shrink[i] || 0) + 1; });
  return xs;
}

/* ================= 下巴工地（侧面） =================
   左边是下巴尖，右边是升支（"后墙"）。R：后墙前缘的位置（世界像素）。 */
const JAW = { x0: 12, top: 150, bot: 192, gum: 147 };
function drawJaw(g, R, o = {}) {
  const { x0, top, bot } = JAW, pal = o.xray ? { bone: '#5F7FA6', boneSh: '#4B6890', boneHi: '#7E9DC2', gum: null, edge: '#8FB0D6' }
    : { bone: '#EFE4CC', boneSh: '#D9C9A6', boneHi: '#FBF4E3', gum: '#E58E98', edge: '#A8916A' };
  // 下颌体：下缘微微下弯，下巴尖圆一点
  for (let x = x0; x < R + 24; x++) {
    const u = (x - x0) / (R + 24 - x0), y1 = bot - Math.round(Math.sin(u * Math.PI) * 3) + (x < x0 + 6 ? Math.round((x0 + 6 - x) * .8) : 0);
    const y0 = top + (x < x0 + 4 ? (x0 + 4 - x) * 2 : 0);
    prect(g, x, y0, 1, y1 - y0, pal.bone);
    prect(g, x, y1 - 6, 1, 6, pal.boneSh);
    prect(g, x, y1, 1, 1, pal.edge);
  }
  // 升支（后墙）：从下颌体往上长，顶上是髁突
  const rt = 98;
  for (let y = rt; y < bot - 2; y++) {
    const lean = Math.round((bot - y) * .12);
    prect(g, R + lean, y, 22, 1, pal.bone);
    prect(g, R + lean + 17, y, 5, 1, pal.boneSh);
    prect(g, R + lean, y, 1, 1, pal.edge); prect(g, R + lean + 21, y, 1, 1, pal.edge);
  }
  const lt = Math.round((bot - rt) * .12);
  pell(g, R + lt + 15, rt - 2, 7, 5, pal.bone); pell(g, R + lt + 15, rt - 3, 6, 4, pal.boneHi);
  prect(g, R + lt, rt - 8, 6, 9, pal.bone); prect(g, R + lt, rt - 9, 4, 1, pal.edge);     // 冠突
  // 下颌管
  for (let x = x0 + 30; x < R + 10; x += 3) pdot(g, x, bot - 14 + Math.round(Math.sin(x * .05) * 2), pal.boneSh);
  // 牙龈
  if (pal.gum) { prect(g, x0 + 2, JAW.gum, R - x0 - 2, 4, pal.gum); prect(g, x0 + 2, JAW.gum, R - x0 - 2, 1, '#F2B3BA'); }
}
/* 在下巴上画一排牙；opt.wis：智齿的状态 {mode:'up'|'stuck'|'bud'|'none', p:0..1 萌出进度, face}；opt.wear 0..1；opt.shift 每颗牙往前挪的像素 */
function drawTeeth(g, opt = {}) {
  const pal = opt.pal || 'real', wear = opt.wear || 0, upto = opt.upto ?? 7;
  const shrink = ROW.map(k => Math.round(wear * 2) * 2);
  const xs = rowX(JAW.x0 + 6, wear ? shrink : []);
  ROW.forEach((k, i) => {
    if (i > upto) return;
    if (k === 'wis') return;
    const sp = tooth(k, pal, wear);
    let rise = 1;
    if (opt.rise && opt.rise[i] !== undefined) rise = opt.rise[i];
    const ch0 = TOOTH[k][1], hidden = Math.round((1 - rise) * (ch0 + 6));
    pspr(g, sp, xs[i] - (opt.shift ? opt.shift[i] || 0 : 0), JAW.gum - ch0 + hidden + 1);
  });
  // 智齿
  const wz = opt.wis || { mode: 'up', p: 1 };
  if (wz.mode === 'none') return;
  const sp = tooth('wis', pal, wear, wz.face || null), ch0 = TOOTH.wis[1];
  const x = xs[7] - (opt.shift ? opt.shift[7] || 0 : 0);
  if (wz.mode === 'up' || wz.mode === 'bud') {
    const p = wz.mode === 'bud' ? 0 : clamp(wz.p ?? 1);
    pspr(g, sp, x + (wz.dx || 0), JAW.gum - ch0 + 1 + Math.round((1 - p) * 26));
  } else if (wz.mode === 'stuck') {
    // 斜着卡住：牙冠朝前下方倾斜，顶在第二磨牙的后面
    const ang = wz.ang ?? .78, cx = (wz.x ?? x) + 8, cy = JAW.gum + 12 + (wz.dy || 0);
    g.save(); g.translate(cx, cy); g.rotate(-ang); g.drawImage(sp, -8, -ch0 - 2); g.restore();
  }
}

/* ================= 全景 X 光片（开头） =================
   世界 260×150：上下两排牙，中间留一道缝；下排右边的智齿横着卡住。返回卡住那颗智齿的位置。 */
const PANO_W = 260, PANO_H = 150;
function drawPanoramic(g, t, o = {}) {
  const w = PANO_W, h = PANO_H, mid = w / 2, upY = 66, lowY = 80;   // 上排牙冠的下沿、下排牙冠的上沿
  g.fillStyle = '#081120'; g.fillRect(0, 0, w, h);
  const bend = x => { const u = (x - mid) / mid; return Math.round(u * u * 12); };   // 越靠后越往上翘（微笑弧）
  // 骨头：上颌、下颌、升支
  for (let x = 4; x < w - 4; x++) {
    const b = bend(x);
    prect(g, x, upY - 34 - b, 1, 30, '#1C3150');
    prect(g, x, lowY + 4 - b, 1, 36 + Math.round(b * .5), '#22395C');
    prect(g, x, lowY + 30 - b, 1, 10 + Math.round(b * .5), '#2B4870');
    prect(g, x, lowY + 40 - Math.round(b * .5), 1, 2, '#3D5E88');
  }
  for (const sx of [6, w - 30]) for (let y = 22; y < lowY + 40; y++) prect(g, sx + Math.round((lowY + 40 - y) * (sx < mid ? .1 : -.1)), y, 24, 1, '#284468');
  let stuck = null;
  for (const dir of [-1, 1]) {
    let x = mid + dir * 1;
    ROW.forEach((k, i) => {
      const [tw, ch] = TOOTH[k], sp = tooth(k, 'xray');
      const xx = dir > 0 ? x : x - tw, b = bend(xx + tw / 2);
      // 下排：牙冠朝上
      if (o.stuck && dir > 0 && k === 'wis') {
        const cx = xx + 4, cy = lowY + 16 - b;
        g.save(); g.translate(cx, cy); g.rotate(-1.15); g.drawImage(sp, -tw / 2, -ch - 2); g.restore();
        stuck = [cx, cy];
      } else pspr(g, sp, xx, lowY - b + (k === 'wis' ? 1 : 0) - 1, false);
      // 上排：牙冠朝下（上下翻转）
      g.save(); g.translate(xx, upY - b); g.scale(1, -1); g.drawImage(sp, 0, -1); g.restore();
      x += dir * (tw + 1);
    });
  }
  return stuck;
}

/* ================= 其他道具 ================= */
const RAT = [
  () => spr('rat0', [
    '.........gg.....',
    '..gggggggggg....',
    '.gggggggggggkg..',
    'gggggggggggggpp.',
    'gggggggggggggg..',
    '.gGGGGGGGGGgg...',
    '..p..p...p..p...',
  ], Object.assign({}, PAL, { g: '#A7AEBB', G: '#8A92A1', p: '#F2A0A0', k: '#1B1730' })),
  () => spr('rat1', [
    '.........gg.....',
    '..gggggggggg....',
    '.gggggggggggkg..',
    'gggggggggggggp..',
    'ggggggggggggggp.',
    '.gGGGGGGGGGgg...',
    '...p..p...p..p..',
  ], Object.assign({}, PAL, { g: '#A7AEBB', G: '#8A92A1', p: '#F2A0A0', k: '#1B1730' })),
];
const RAT_TAIL = (g, x, y, t) => { for (let i = 0; i < 9; i++) pdot(g, x - i, y + Math.round(Math.sin(t * 6 + i * .7) * 1.2), '#F2A0A0'); };
const FOOD = {
  jerky: () => spr('jerky', ['..nnnnnn....', '.nNnnnNnnn..', 'nnnnNnnnnnn.', '.nnnnnnNnnnn', '...nnnnnnnn.'], PAL),
  root: () => spr('root', ['....l.l..', '...lll...', '..nnnnn..', '.nnNnnnn.', '.nnnnnNn.', '..nnnnn..', '...nNn...', '....n....'], PAL),
  nut: () => spr('nut', ['..ttt..', '.tTttT.', 'tTtTtTt', 'tttTttt', '.tTtTt.', '..ttt..'], PAL),
  bread: () => spr('bread', ['..TTTTTT..', '.TttttttT.', 'TttttttttT', 'TccccccccT', 'TccccccccT', '.TTTTTTTT.'], PAL),
  porridge: () => spr('porridge', ['..w..w...', '...w..w..', 'cccccccc.', 'kWWWWWWWk', 'kWWWWWWWk', '.kbbbbbk.', '..kkkkk..'], Object.assign({}, PAL, { W: '#FFFDF6', c: '#FFF6E0' })),
  noodles: () => spr('noodles', ['.y.y.y.y.', 'yyyyyyyyy', 'kRRRRRRRk', 'kRRRRRRRk', '.kRRRRRk.', '..kkkkk..'], PAL),
  cake: () => spr('cake', ['...r....', '..pppp..', '.pppppp.', 'wwwwwwww', 'yyyyyyyy', 'wwwwwwww', 'yyyyyyyy'], Object.assign({}, PAL, { p: '#F7B7C8' })),
  tea: () => spr('tea', ['....kk..', '....k...', '.wwwkwww.', '.wcccccw.', '.wcccccw.', '.wcccccw.', '.wkckckw.', '..wwwww..'], Object.assign({}, PAL, { c: '#D9A777' })),
  pellet: () => spr('pellet', ['.nn.', 'nNnn', 'nnnN', '.nn.'], PAL),
};
const BOLT = () => spr('bolt', ['..yy', '.yy.', 'yyyy', '.yy.', 'yy..'], PAL);
/* 小怪的新行头：白大褂 + 额镜（牙医）；肿脸 + 冰袋 */
function drawDentist(g, x, y, t, o = {}) {
  drawClawd(g, x, y, { eyes: o.eyes || blinkEyes(t, 4), arms: o.arms || 'n' });
  prect(g, x + 4, y + 6, 16, 6, '#F4F4F4'); prect(g, x + 11, y + 6, 2, 4, '#C9D3DE'); prect(g, x + 15, y + 8, 3, 2, '#C9D3DE');
  if ((o.arms || 'n') === 'n') { prect(g, x, y + 4, 4, 4, '#F4F4F4'); prect(g, x + 20, y + 4, 4, 4, '#F4F4F4'); }
  prect(g, x + 3, y - 1, 18, 1, '#7E8494'); pdisc(g, x + 12, y - 4, 3, '#C9D3DE'); pdisc(g, x + 12, y - 4, 2, '#FFFFFF'); pdot(g, x + 12, y - 4, '#9AA1AD');
}
function drawSwollen(g, x, y, t, o = {}) {
  drawClawd(g, x, y, Object.assign({ eyes: 'squint' }, o));
  prect(g, x + 20, y + 5, 3, 6, o.col || TONES.base); prect(g, x + 19, y + 6, 3, 3, '#F08A8A');
  prect(g, x + 22, y + 1, 6, 6, '#7FB2D9'); prect(g, x + 23, y + 2, 4, 4, '#BFE6FF'); prect(g, x + 23, y + 2, 1, 1, '#FFFFFF');
  if (Math.floor(t * 2) % 2) pdot(g, x + 7, y + 5, '#5EC8FF');
}
