/* 角色与道具的像素精灵。全部用代码画出来（没有外部图片），每种表情/姿势画一次后缓存。
   Q 版小人共用一个模板 drawChibi：头大身小，发型、发色、眼睛、衣服、配饰各自不同。 */
const CW = 44, CH = 58, OY = 6;   // Q 版小人画布尺寸；OY 为头顶留给天线、帽子的空间

const SKIN = '#ffe3d3', SKIN2 = '#f5c4ae', MOUTH = '#7a2a3a';
const CHAR = {
  xiaomo: { hair: '#efeaff', hair2: '#b8aee6', eye: '#22b8a6', outfit: '#2fb5a8', outfit2: '#1f8a80', style: 'bob', acc: 'antenna', name: '小模' },
  you: { hair: '#5b3a29', hair2: '#3e271b', eye: '#4a3020', outfit: '#ffb53b', outfit2: '#e07b22', style: 'short', acc: 'none', name: '你' },
  deepseek: { hair: '#4d6bfe', hair2: '#3450c8', eye: '#3a5ae0', outfit: '#eaf0ff', outfit2: '#bccbf0', style: 'bob', acc: 'whale', name: 'DeepSeek' },
  gpt: { hair: '#2a2d34', hair2: '#15171c', eye: '#10a37f', outfit: '#f4f4f4', outfit2: '#cfcfcf', style: 'long', acc: 'knot', name: 'ChatGPT' },
  claude: { hair: '#d97757', hair2: '#b05a3d', eye: '#8a4426', outfit: '#f1e5d1', outfit2: '#d8c6a8', style: 'bob', acc: 'spark', name: 'Claude' },
  gemini: { hair: '#4f7cff', hair2: '#a46bff', eye: '#4f7cff', outfit: '#ffffff', outfit2: '#d6dcf5', style: 'split', acc: 'gemstar', name: 'Gemini' },
  doubao: { hair: '#6b4a3a', hair2: '#4b3226', eye: '#4a2f22', outfit: '#ff8a5b', outfit2: '#e0663a', style: 'short', acc: 'bun', name: '豆包' },
  kimi: { hair: '#1d2440', hair2: '#0f1428', eye: '#e0a82e', outfit: '#2c335c', outfit2: '#1d2242', style: 'long', acc: 'moon', name: 'Kimi' },
  qwen: { hair: '#7b5cff', hair2: '#5a3fd6', eye: '#6a4ae0', outfit: '#efeaff', outfit2: '#cfc4f5', style: 'twin', acc: 'qpin', name: '通义千问' },
  grok: { hair: '#d9d9d9', hair2: '#9a9a9a', eye: '#222222', outfit: '#1c1c1c', outfit2: '#0c0c0c', style: 'spiky', acc: 'shades', name: 'Grok' },
  daiyu: { hair: '#1b1b24', hair2: '#0d0d14', eye: '#3a2a3a', outfit: '#bfe0cf', outfit2: '#8fbfa6', style: 'buns', acc: 'hairpin', name: '林黛玉', skin: '#fff0e6' },
  lu: { hair: null, hair2: null, eye: '#2a1a10', outfit: '#8a5a2b', outfit2: '#6a4220', style: 'bald', acc: 'beads', name: '鲁智深', skin: '#e9b48e' },
  rater1: { hair: '#3b2a20', hair2: '#24170f', eye: '#2a2a2a', outfit: '#4f7cff', outfit2: '#2f4fc0', style: 'short', acc: 'headset' },
  rater2: { hair: '#c0503a', hair2: '#8a3426', eye: '#2a2a2a', outfit: '#5fe36a', outfit2: '#2e9e4f', style: 'long', acc: 'headset' },
  rater3: { hair: '#222233', hair2: '#111122', eye: '#2a2a2a', outfit: '#ff7aa8', outfit2: '#d9487a', style: 'twin', acc: 'headset' },
};

function drawChibi(o, expr = 'normal', mouth = 'smile') {
  const skin = o.skin || SKIN, oy = OY;
  p.save(); p.translate(0, oy);
  // —— 后发 ——
  if (o.style === 'long') { rrect(7, 12, 30, 32, 6, o.hair2); }
  if (o.style === 'twin') { ell(5, 26, 5, 11, o.hair2); ell(39, 26, 5, 11, o.hair2); R(4, 18, 4, 3, PAL.pink); R(36, 18, 4, 3, PAL.pink); }
  if (o.style === 'split') { ell(6, 24, 5, 9, o.hair); ell(38, 24, 5, 9, o.hair2); }
  if (o.style === 'buns') { circ(9, 4, 5, o.hair); circ(35, 4, 5, o.hair); R(7, 2, 4, 1, o.hair2); R(33, 2, 4, 1, o.hair2); }
  if (o.acc === 'whale') {     // 鲸鱼兜帽：先画帽身，尾巴在右后方
    ell(22, 15, 17, 14, '#4d6bfe');
    poly([[34, 18], [43, 8], [42, 16], [44, 22]], '#3450c8');
  }
  // —— 腿与鞋 ——
  R(16, 43, 5, 6, '#2a2340'); R(23, 43, 5, 6, '#2a2340');
  R(15, 48, 7, 3, '#3a3050'); R(22, 48, 7, 3, '#3a3050');
  // —— 身体 ——
  rrect(12, 31, 20, 14, 3, o.outfit);
  R(12, 41, 20, 4, o.outfit2);
  R(9, 33, 4, 9, o.outfit); R(31, 33, 4, 9, o.outfit);
  circ(11, 42, 2, skin); circ(33, 42, 2, skin);
  if (o.acc === 'antenna') { R(20, 34, 4, 3, PAL.white); P(21, 35, '#1f8a80'); P(22, 35, '#1f8a80'); }   // 卫衣胸口的小图标
  if (o.acc === 'knot') { R(21, 31, 2, 8, '#1a1a1a'); }
  if (o.acc === 'beads') { for (let i = 0; i < 7; i++) circ(14 + i * 2.6, 32 + Math.sin(i / 6 * Math.PI) * 4, 1, '#5a2a10'); }
  if (o.acc === 'spark') { R(16, 31, 12, 2, o.outfit2); }
  // —— 头 ——
  ell(22, 19, 13, 12, skin);
  R(10, 22, 2, 4, skin); R(32, 22, 2, 4, skin);
  // —— 前发 ——
  const H = o.hair, H2 = o.hair2;
  if (o.style === 'bald') {
    ell(22, 14, 12, 7, skin); P(17, 10, '#fff2e6'); P(18, 10, '#fff2e6'); R(16, 9, 4, 1, '#fff2e6');
    // 络腮胡
    ell(22, 29, 10, 4, '#3a2a20'); R(13, 24, 3, 5, '#3a2a20'); R(28, 24, 3, 5, '#3a2a20');
  } else if (o.style === 'split') {
    ell(22, 12, 15, 9, H); p.save(); p.beginPath(); p.rect(22, -10, 30, 40); p.clip(); ell(22, 12, 15, 9, H2); p.restore();
    for (let i = 0; i < 6; i++) { const x0 = 8 + i * 5; poly([[x0, 13], [x0 + 6, 13], [x0 + 3, 19 + (i % 2) * 2]], x0 < 22 ? H : H2); }
    R(7, 13, 4, 14, H); R(33, 13, 4, 14, H2);
  } else {
    if (o.style === 'spiky') {
      for (let i = 0; i < 6; i++) { const x0 = 6 + i * 5.5; poly([[x0, 14], [x0 + 7, 14], [x0 + 3 + (i - 2.5), 0 + (i % 2) * 3]], H); }
    }
    ell(22, 11, 15, 8, H);
    R(14, 5, 6, 1, 'rgba(255,255,255,0.45)');
    for (let i = 0; i < 6; i++) { const x0 = 8 + i * 5; poly([[x0, 12], [x0 + 6, 12], [x0 + 3, 19 + (i % 2) * 2]], H); }
    [14, 20, 25, 30].forEach((x, i) => R(x, 14 + (i % 2), 1, 4, H2));
    const lock = o.style === 'short' || o.style === 'spiky' ? 9 : 15;
    R(7, 13, 4, lock, H); R(33, 13, 4, lock, H);
    R(7, 13 + lock - 2, 4, 2, H2); R(33, 13 + lock - 2, 4, 2, H2);
  }
  // —— 眼睛 ——
  const ex = [14, 26], ey = 20;
  ex.forEach((x, k) => {
    if (expr === 'happy' || expr === 'blink-happy') {
      P(x, ey + 3, PAL.ink); P(x + 1, ey + 2, PAL.ink); P(x + 2, ey + 1, PAL.ink); P(x + 3, ey + 2, PAL.ink); P(x + 4, ey + 3, PAL.ink);
    } else if (expr === 'blink') {
      R(x, ey + 3, 5, 1, PAL.ink);
    } else if (expr === 'spiral') {
      R(x, ey, 5, 6, PAL.white); R(x, ey, 5, 1, PAL.ink); R(x, ey + 5, 5, 1, PAL.ink); R(x, ey, 1, 6, PAL.ink); R(x + 4, ey, 1, 6, PAL.ink);
      R(x + 2, ey + 2, 2, 1, PAL.ink); P(x + 2, ey + 3, PAL.ink);
    } else if (expr === 'star') {
      R(x, ey, 5, 6, PAL.ink); R(x + 2, ey + 1, 1, 4, PAL.yellow); R(x + 1, ey + 2, 3, 2, PAL.yellow); P(x + 2, ey + 2, '#fff');
    } else if (expr === 'x') {
      [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [4, 0], [3, 1], [1, 3], [0, 4]].forEach(([a, b]) => P(x + a, ey + 1 + b, PAL.ink));
    } else if (expr === 'shock') {
      R(x, ey, 5, 6, PAL.white); R(x, ey, 5, 1, PAL.ink); R(x, ey + 5, 5, 1, PAL.ink); R(x, ey, 1, 6, PAL.ink); R(x + 4, ey, 1, 6, PAL.ink); P(x + 2, ey + 3, PAL.ink);
    } else if (expr === 'smug') {
      R(x, ey + 2, 5, 1, PAL.ink); R(x + 1, ey + 3, 3, 2, o.eye); R(x, ey + 3, 1, 2, PAL.ink); R(x + 4, ey + 3, 1, 2, PAL.ink);
    } else {     // normal / sad / sweat
      R(x, ey, 5, 6, PAL.ink);
      R(x + 1, ey + 1, 3, 4, o.eye);
      R(x + 1, ey + 4, 3, 1, shade(o.eye));
      P(x + 1, ey + 1, '#fff'); P(x + 2, ey + 2, 'rgba(255,255,255,0.7)');
      if (expr === 'sad') { P(k ? x + 4 : x, ey - 2, PAL.ink); P(k ? x + 3 : x + 1, ey - 2, PAL.ink); }
    }
  });
  if (o.acc === 'shades') { R(12, 20, 9, 5, '#111'); R(24, 20, 9, 5, '#111'); R(21, 21, 3, 1, '#111'); R(13, 21, 3, 1, '#666'); R(25, 21, 3, 1, '#666'); }
  // —— 腮红、嘴 ——
  if (o.style !== 'bald') { R(11, 27, 3, 1, '#ff9aa8'); R(30, 27, 3, 1, '#ff9aa8'); }
  const mx = 21, my = 28;
  if (mouth === 'talk') { R(mx - 1, my - 1, 4, 3, MOUTH); R(mx, my + 1, 2, 1, PAL.pink); }
  else if (mouth === 'open') { R(mx - 1, my - 1, 4, 4, MOUTH); R(mx, my + 1, 2, 2, PAL.pink); }
  else if (mouth === 'flat') { R(mx - 1, my, 4, 1, MOUTH); }
  else if (mouth === 'wave') { P(mx - 2, my + 1, MOUTH); P(mx - 1, my, MOUTH); P(mx, my + 1, MOUTH); P(mx + 1, my, MOUTH); P(mx + 2, my + 1, MOUTH); }
  else if (mouth === 'grin') { R(mx - 2, my - 1, 6, 2, MOUTH); R(mx - 1, my - 1, 4, 1, '#fff'); }
  else { P(mx - 1, my, MOUTH); R(mx, my + 1, 2, 1, MOUTH); P(mx + 2, my, MOUTH); }
  if (expr === 'sweat') { R(35, 12, 2, 3, '#7fd0ff'); P(35, 15, '#7fd0ff'); P(36, 15, '#bfe8ff'); }
  // —— 头饰 ——
  if (o.acc === 'antenna') {
    line(22, 3, 22, -4, '#8a84b8'); circ(22, -5, 2, PAL.teal); P(21, -6, '#fff');
  }
  if (o.acc === 'whale') {
    // 兜帽前沿 + 眼睛 + 喷水
    p.save(); p.beginPath(); p.rect(0, -10, 44, 17); p.clip(); ell(22, 15, 17, 14, '#4d6bfe'); p.restore();
    R(6, 5, 32, 2, '#3450c8');
    R(10, 1, 2, 2, PAL.white); P(11, 1, PAL.ink);
    R(19, -6, 2, 4, '#9fd8ff'); P(17, -7, '#9fd8ff'); P(22, -7, '#9fd8ff'); P(16, -8, '#bfe8ff'); P(23, -8, '#bfe8ff');
  }
  if (o.acc === 'knot') { circ(33, 8, 3, PAL.white); circ(33, 8, 1, '#10a37f'); }
  if (o.acc === 'spark') {
    const c = '#d97757';
    R(31, 4, 1, 9, '#fff3e6'); R(27, 8, 9, 1, '#fff3e6'); P(28, 5, '#fff3e6'); P(34, 5, '#fff3e6'); P(28, 11, '#fff3e6'); P(34, 11, '#fff3e6');
    P(31, 8, c);
  }
  if (o.acc === 'gemstar') { R(32, 3, 1, 7, PAL.white); R(29, 6, 7, 1, PAL.white); P(32, 6, PAL.yellow); }
  if (o.acc === 'bun') {      // 包子帽
    ell(22, 4, 12, 7, '#fff8ec'); ell(22, 6, 12, 4, '#f3e3c8');
    line(22, -3, 18, 3, '#e2cfa4'); line(22, -3, 26, 3, '#e2cfa4'); line(22, -3, 22, 3, '#e2cfa4');
    circ(22, -3, 1, '#e2cfa4');
  }
  if (o.acc === 'moon') { ell(32, 6, 4, 4, PAL.yellow); ell(34, 5, 3, 3, o.hair); }
  if (o.acc === 'qpin') { circ(32, 6, 3, PAL.white); circ(32, 6, 1, '#7b5cff'); P(34, 8, '#7b5cff'); }
  if (o.acc === 'hairpin') { R(30, 1, 7, 1, PAL.yellow); circ(36, 1, 1, PAL.red); line(34, 2, 35, 6, PAL.yellow); }
  if (o.acc === 'headset') { R(6, 14, 3, 8, '#333'); R(35, 14, 3, 8, '#333'); R(8, 4, 28, 2, '#333'); line(9, 22, 15, 27, '#333'); R(14, 27, 3, 2, PAL.red); }
  p.restore();
}
function shade(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) * 0.6, gg = ((n >> 8) & 255) * 0.6, b = (n & 255) * 0.6;
  return `rgb(${r | 0},${gg | 0},${b | 0})`;
}
function chibi(name, expr = 'normal', mouth = 'smile') {
  return sprite(`chibi|${name}|${expr}|${mouth}`, CW, CH, () => drawChibi(CHAR[name], expr, mouth));
}
/* 按时间自动眨眼、说话时动嘴 */
function face(name, t, expr = 'normal', spk = null, mouth = 'smile') {
  let e = expr, m = mouth;
  if (spk && talking(spk, t)) m = 'talk';
  const ph = (t + hash(name.length) * 3) % 3.7;
  if (ph < 0.12 && (e === 'normal' || e === 'sweat' || e === 'sad')) e = 'blink';
  return chibi(name, e, m);
}
/* 画一个 Q 版小人：x 是脚底中心，自带轻微上下浮动 */
function actor(name, t, x, y, o = {}) {
  const img = face(name, t, o.expr || 'normal', o.spk || null, o.mouth || 'smile');
  const bob = o.still ? 0 : Math.round(Math.sin(t * (o.bobSpeed || 3) + (o.phase || 0)) * 0.9);
  put(img, x, y + bob, { flip: o.flip, scale: o.scale || 1, alpha: o.alpha });
}

// —— 对话框头像（裁出头部，放大到 144×144） ——
const PORT = {};
function portraitOf(name, expr, mouth) {
  const k = `${name}|${expr}|${mouth}`;
  if (PORT[k]) return PORT[k];
  const src = chibi(name, expr, mouth);
  const c = document.createElement('canvas'); c.width = 36; c.height = 36;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  x.drawImage(src, -4, -2);
  PORT[k] = c; return c;
}
function xiaomoPortrait(mode) {
  if (mode === 'talk') return portraitOf('xiaomo', 'normal', 'talk');
  if (mode === 'spiral') return portraitOf('xiaomo', 'spiral', 'wave');
  if (mode === 'star') return portraitOf('xiaomo', 'star', 'open');
  if (mode === 'happy') return portraitOf('xiaomo', 'happy', 'open');
  return portraitOf('xiaomo', 'normal', 'smile');
}
function youPortrait(talk) { return portraitOf('you', 'normal', talk ? 'talk' : 'smile'); }

// ---------------- 道具 ----------------
const PROP = {
  cat: f => sprite('cat' + f, 26, 16, () => {     // 橘猫侧面，两帧走路
    const o = '#f2a24a', d = '#c46f22', w = '#fff3e0';
    ell(12, 8, 9, 4, o); R(5, 7, 15, 2, d); R(8, 5, 2, 2, d); R(13, 5, 2, 2, d);
    circ(21, 5, 4, o); poly([[18, 2], [19, -2], [21, 2]], o); poly([[22, 2], [24, -2], [25, 3]], o);
    P(22, 4, PAL.ink); P(24, 6, PAL.pink); R(22, 7, 3, 1, w);
    line(3, 7, 0, 2 + f, o); line(2, 7, -1, 2 + f, o);
    const l = f ? [[6, 11], [9, 12], [15, 11], [18, 12]] : [[7, 12], [9, 11], [16, 12], [18, 11]];
    l.forEach(([x, y]) => R(x, y, 2, 3, o));
  }),
  catTeacher: () => sprite('catT', 30, 34, () => {
    const o = '#f2a24a', d = '#c46f22', w = '#fff3e0';
    ell(15, 24, 10, 9, o); ell(15, 27, 6, 6, w);
    ell(15, 11, 10, 8, o); poly([[6, 7], [7, -1], [12, 5]], o); poly([[18, 5], [23, -1], [24, 7]], o);
    P(8, 3, PAL.pink); P(22, 3, PAL.pink); R(12, 4, 6, 1, d); R(13, 6, 4, 1, d);
    R(7, 9, 7, 5, PAL.ink); R(16, 9, 7, 5, PAL.ink); R(8, 10, 5, 3, '#cfefff'); R(17, 10, 5, 3, '#cfefff'); R(14, 10, 2, 1, PAL.ink);
    P(10, 11, PAL.ink); P(19, 11, PAL.ink);
    P(15, 15, PAL.pink); P(14, 16, PAL.ink); P(16, 16, PAL.ink);
    line(2, 14, 6, 15, w); line(24, 15, 28, 14, w);
    R(9, 32, 4, 2, o); R(17, 32, 4, 2, o);
    line(25, 22, 29, 8, '#8a5a2b'); P(29, 7, PAL.red);
  }),
  alpaca: (m) => sprite('alpaca' + m, 30, 42, () => {     // Llama：开源羊驼
    const w = '#f7f1e6', s = '#e2d6c0';
    ell(14, 32, 11, 8, w); ell(14, 30, 10, 5, '#fffaf0');
    R(6, 37, 3, 5, s); R(11, 38, 3, 4, s); R(17, 38, 3, 4, s); R(22, 37, 3, 5, s);
    rrect(16, 12, 8, 22, 3, w);
    ell(20, 10, 7, 6, w); ell(20, 6, 6, 4, '#fffaf0');
    poly([[15, 5], [14, -1], [17, 3]], s); poly([[24, 4], [26, -1], [26, 5]], s);
    ell(23, 13, 4, 3, '#f0e2cc'); P(24, 13, PAL.ink); P(22, 13, PAL.ink);
    R(17, 9, 2, 2, PAL.ink); R(22, 9, 2, 2, PAL.ink); P(17, 9, '#fff'); P(22, 9, '#fff');
    R(14, 8, 12, 1, PAL.ink); // 眼镜框
    if (m === 'talk') R(22, 15, 3, 1, MOUTH);
    // 围巾（开源的蓝）
    R(15, 18, 10, 3, '#4f7cff'); R(22, 21, 3, 5, '#4f7cff');
  }),
  egg: (k) => sprite('egg' + k, 20, 24, () => {
    ell(10, 13, 9, 11, '#f6f1ff'); ell(7, 9, 2, 3, '#ffffff');
    dither(1, 14, 18, 10, '#d9d0f2', 0.5);
    [[4, 8], [13, 15], [8, 19]].forEach(([x, y]) => R(x, y, 3, 2, PAL.teal));
    if (k >= 1) { line(3, 12, 7, 9, PAL.ink); line(7, 9, 10, 13, PAL.ink); line(10, 13, 13, 9, PAL.ink); }
    if (k >= 2) { line(13, 9, 17, 12, PAL.ink); line(6, 16, 9, 18, PAL.ink); }
  }),
  shell: () => sprite('shell', 22, 12, () => {
    poly([[1, 0], [4, 4], [7, 0], [11, 4], [15, 0], [18, 4], [21, 0], [20, 7], [11, 11], [2, 7]], '#f6f1ff');
    dither(2, 4, 18, 6, '#d9d0f2', 0.5);
  }),
  keyboard: () => sprite('kb', 64, 14, () => {
    rrect(0, 2, 64, 12, 2, '#3a3554'); R(1, 2, 62, 2, '#5a5480');
    for (let r = 0; r < 3; r++) for (let i = 0; i < 14; i++) R(3 + i * 4.3 + (r % 2) * 1.5, 5 + r * 3, 3, 2, '#d8d3ee');
    R(18, 13, 26, 1, '#24203a');
  }),
  mooncake: () => sprite('mooncake', 18, 16, () => {
    ell(9, 9, 8, 6, '#c9822f'); ell(9, 7, 8, 5, '#e9a54a');
    ell(9, 7, 5, 3, '#f2bf6a'); R(7, 6, 5, 1, '#c9822f'); R(9, 5, 1, 4, '#c9822f');
    for (let i = 0; i < 8; i++) P(1 + i * 2.2, 11 + (i % 2), '#a8661f');
  }),
  moon: () => sprite('moon', 24, 24, () => {
    circ(12, 12, 11, '#fff3b0'); circ(12, 12, 9, '#ffe680');
    circ(8, 9, 2, '#f2d35c'); circ(15, 15, 3, '#f2d35c'); circ(16, 7, 1, '#f2d35c');
  }),
  strawberry: () => sprite('strawb', 18, 20, () => {
    poly([[1, 6], [17, 6], [14, 15], [9, 19], [4, 15]], PAL.red); R(3, 6, 12, 3, '#ff6b74');
    [[5, 9], [9, 10], [12, 9], [6, 13], [10, 14], [8, 16]].forEach(([x, y]) => P(x, y, '#ffe680'));
    poly([[3, 6], [6, 2], [9, 5], [12, 2], [15, 6]], PAL.green2); R(8, 0, 2, 3, PAL.green2);
  }),
  thumb: (up) => sprite('thumb' + up, 14, 14, () => {
    if (up) { R(2, 6, 4, 7, '#4f7cff'); rrect(6, 5, 7, 8, 2, '#ffd9b8'); R(7, 1, 3, 6, '#ffd9b8'); R(6, 7, 6, 1, '#e8b894'); R(6, 9, 6, 1, '#e8b894'); }
    else { R(2, 1, 4, 7, PAL.gray2); rrect(6, 1, 7, 8, 2, '#ffd9b8'); R(7, 7, 3, 6, '#ffd9b8'); R(6, 4, 6, 1, '#e8b894'); }
  }),
  heart: () => sprite('heart', 9, 8, () => { circ(2, 2, 2, PAL.pink); circ(6, 2, 2, PAL.pink); poly([[0, 3], [9, 3], [4.5, 8]], PAL.pink); P(2, 1, '#fff'); }, null),
  coin: () => sprite('coin', 10, 10, () => { circ(5, 5, 4, PAL.orange); circ(5, 5, 3, PAL.yellow); R(4, 3, 2, 4, PAL.orange); }),
  magnifier: () => sprite('mag', 18, 18, () => {
    circ(7, 7, 6, '#8a84b8'); circ(7, 7, 4, '#bfe8ff'); R(4, 4, 2, 2, '#fff');
    line(11, 11, 16, 16, PAL.wood2); line(12, 11, 17, 16, PAL.wood2); line(11, 12, 16, 17, PAL.wood);
  }),
  tree: (inv) => sprite('tree' + inv, 40, 56, () => {    // 垂杨柳；inv 时连根拔起倒过来
    p.save();
    if (inv) { p.translate(0, 56); p.scale(1, -1); }
    R(18, 26, 5, 24, '#6b4423'); R(19, 26, 2, 24, '#8a5a2b');
    ell(20, 18, 17, 14, '#3f9e4f'); ell(20, 15, 14, 10, '#5fbf5a');
    for (let i = 0; i < 9; i++) { const x = 5 + i * 3.6; R(x, 20, 1, 12 + (i % 3) * 5, '#3f9e4f'); }
    if (inv) { line(20, 50, 12, 55, '#6b4423'); line(20, 50, 28, 55, '#6b4423'); line(21, 50, 20, 56, '#6b4423'); line(17, 52, 14, 56, '#8a5a2b'); }
    else R(10, 49, 22, 3, '#4a3a2a');
    p.restore();
  }),
  gpu: (f) => sprite('gpu' + f, 34, 14, () => {
    R(0, 2, 34, 12, '#2d2a3e'); R(0, 2, 34, 2, '#4a4566');
    [7, 19].forEach(cx => {
      circ(cx + 2, 8, 5, '#16131f');
      const a = f * 0.7;
      for (let k = 0; k < 4; k++) { const an = a + k * Math.PI / 2; line(cx + 2, 8, cx + 2 + Math.cos(an) * 4, 8 + Math.sin(an) * 4, '#8a84b8'); }
      circ(cx + 2, 8, 1, PAL.gray);
    });
    R(28, 5, 4, 6, PAL.dgreen); R(29, 6, 2, 1, '#bfffd8');
  }),
  book: (c, k) => sprite('book' + c + k, 12, 14, () => {
    R(0, 0, 11, 14, c); R(0, 0, 2, 14, shade(c)); R(10, 1, 2, 12, '#fffaf0');
    R(3, 3, 6, 1, 'rgba(255,255,255,0.6)'); R(3, 5, 4, 1, 'rgba(255,255,255,0.4)');
  }),
  bulb: (on) => sprite('bulb' + on, 10, 12, () => {
    circ(5, 4, 4, on ? PAL.yellow : PAL.gray); R(3, 8, 4, 3, PAL.gray2); if (on) P(3, 2, '#fff');
  }),
  fire: f => sprite('fire' + f, 10, 14, () => {
    poly([[1, 13], [9, 13], [9, 7], [7, 4 + f], [6, 7], [5, 0 + f], [3, 6], [2, 3 + f], [1, 8]], PAL.orange2);
    poly([[3, 13], [7, 13], [7, 9], [5, 5 + f], [3, 9]], PAL.yellow);
  }, null),
};
