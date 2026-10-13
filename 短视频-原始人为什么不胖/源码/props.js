'use strict';
/* props.js：本集的道具和角色——食物（原样的 / 超加工的）、薯片袋和配料表、饱腹警报（铃铛）、跑步机、体重秤、
   超市货架、传送带、实验餐盘、财务部 / 采购部的小怪、哈扎猎人、上班族、猴面包树、篝火……全部程序画的像素图。 */

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

/* ================= 食物 ================= */
const FPAL = Object.assign({}, PAL, {
  m: '#C0563E', M: '#8E3A2A', h: '#F2C230', H: '#C99A1A', e: '#FFFDF6', E: '#E8DCC0', u: '#FFD84A', z: '#E5322D',
  q: '#7FBF5A', Q: '#4E8E3A', x: '#9A6A3E', X: '#6B4630', i: '#F2A0C0', j: '#5EC8FF', J: '#2F7FC1', s2: '#C9D3DE',
});
const FOOD = {
  // 原样的食物
  root: () => spr('root', ['....l.l..', '...lll...', '..nnnnn..', '.nnNnnnn.', '.nnnnnNn.', '..nnnnn..', '...nNn...', '....n....'], PAL),
  meat: () => spr('meat', ['......ee', '.....eEe', '..mmmM..', '.mmmmmm.', 'mmmMmmm.', 'mmmmmmm.', '.mmmmM..', '..mmm...'], FPAL),
  berry: () => spr('berry', ['...ll...', '..l..l..', '.vv.vv..', 'vVvvVvv.', '.vvvvv..', '..vVv...'], Object.assign({}, FPAL, { v: '#7A3FA8', V: '#B07FD8' })),
  honey: () => spr('honey', ['.hhhh.', 'hHhhHh', 'hhHhhh', 'hHhhHh', '.hhhh.'], FPAL),
  egg: () => spr('egg', ['..ee..', '.eeee.', 'eeeeEe', 'eeeeEe', '.eEEe.'], FPAL),
  rice: () => spr('rice', ['.eeeeee.', 'eeeEeeee', 'jjjjjjjj', '.jJjjJj.', '..jjjj..'], FPAL),
  greens: () => spr('greens', ['.q..q..', 'qQq.qQq', '.qQqQq.', '..qQq..', '...q...', '...q...'], FPAL),
  beans: () => spr('beans', ['.eeeee.', 'eEeeeEe', 'eeeEeee', '.eeeee.'], Object.assign({}, FPAL, { e: '#F2E3C8', E: '#D8C29C' })),
  apple: () => spr('apple', ['...x..', '..xl..', '.zzzz.', 'zzzzzz', 'zzzzwz', 'zzzzzz', '.zzzz.'], Object.assign({}, FPAL, { w: '#FF9C94' })),
  fish: () => spr('fish', ['..ss....', '.ssss..s', 'skssss.s', '.ssssss.', '..ss....'], Object.assign({}, FPAL, { s: '#9FC4D9' })),
  // 超加工食品
  cake: () => spr('cake', ['...r....', '..pppp..', '.pppppp.', 'wwwwwwww', 'yyyyyyyy', 'wwwwwwww', 'yyyyyyyy'], Object.assign({}, PAL, { p: '#F7B7C8' })),
  tea: () => spr('tea', ['....kk..', '....k...', '.wwwkwww.', '.wcccccw.', '.wcccccw.', '.wcccccw.', '.wkckckw.', '..wwwww..'], Object.assign({}, PAL, { c: '#D9A777' })),
  noodles: () => spr('noodles', ['.y.y.y.y.', 'yyyyyyyyy', 'kRRRRRRRk', 'kRRRRRRRk', '.kRRRRRk.', '..kkkkk..'], PAL),
  chips: () => spr('chips', ['zuzuzuz', 'zzzzzzz', 'zuuuuuz', 'zuyyyuz', 'zuuuuuz', 'zzzzzzz', 'zuzuzuz'], Object.assign({}, FPAL, { y: '#FFF3B0' })),
  cola: () => spr('cola', ['..zz..', '..ww..', '.zzzz.', '.zwwz.', '.zzzz.', '.zzzz.', '.zzzz.'], FPAL),
  cookie: () => spr('cookie', ['.xxxx.', 'xxXxxx', 'xXxxXx', 'xxxXxx', '.xxxx.'], Object.assign({}, FPAL, { x: '#C98B4A', X: '#5E3B22' })),
  sausage: () => spr('sausage', ['.mmmmmm.', 'mmMmmMmm', '.mmmmmm.'], Object.assign({}, FPAL, { m: '#E07A6A', M: '#B95A4A' })),
  candy: () => spr('candy', ['i.iii.i', 'iiwiiii', 'i.iii.i'], FPAL),
  fries: () => spr('fries', ['.y.y.y.', 'yyy.yyy', 'zzzzzzz', 'zzwzwzz', '.zzzzz.'], Object.assign({}, FPAL, { y: '#FFD84A' })),
};
const WHOLE = ['rice', 'greens', 'egg', 'meat', 'beans', 'apple'];
const UPF = ['cake', 'chips', 'tea', 'noodles', 'cookie', 'cola', 'sausage', 'fries', 'candy'];

/* 薯片袋：(x,y) 左上，24×30；back = true 时是背面（配料表那面） */
function drawSnackBag(g, x, y, o = {}) {
  x = ri(x); y = ri(y);
  const c1 = o.back ? '#F4E9D8' : '#E5322D', c2 = o.back ? '#D9CBB2' : '#B8231F';
  for (let i = 0; i < 24; i += 2) { pdot(g, x + i, y, c1); pdot(g, x + i + 1, y + 1, c1); }
  prect(g, x, y + 1, 24, 28, c1); prect(g, x, y + 27, 24, 2, c2);
  for (let i = 0; i < 24; i += 2) { pdot(g, x + i + 1, y + 29, c1); }
  prect(g, x + 22, y + 1, 2, 28, c2);
  if (!o.back) {
    pdisc(g, x + 12, y + 16, 7, '#FFD84A'); pdisc(g, x + 11, y + 15, 5, '#FFE89A');
    for (const [a, b] of [[8, 12], [14, 18], [10, 19], [15, 12]]) pdot(g, x + a, y + b, '#E8B92E');
    prect(g, x + 3, y + 4, 18, 4, '#FFFFFF'); prect(g, x + 4, y + 5, 16, 2, '#E5322D');
  } else {
    prect(g, x + 2, y + 3, 19, 22, '#FFFDF6');
    for (let j = 0; j < 10; j++) prect(g, x + 3, y + 5 + j * 2, j % 3 === 2 ? 12 : 17, 1, '#9A8E7A');
  }
}

/* 饱腹警报：一个带脸的铃铛，(x,y) 为铃口中心；ring：在响；sleep：打瞌睡 */
function drawBell(g, x, y, t, o = {}) {
  x = ri(x); y = ri(y);
  const sw = o.ring ? Math.round(Math.sin(t * 30) * 2) : 0;
  prect(g, x - 1, y - 16, 3, 3, '#8C6440');
  pell(g, x + sw, y - 6, 7, 9, '#C99A1A'); pell(g, x - 1 + sw, y - 7, 6, 8, '#F2C230'); prect(g, x - 8 + sw, y + 1, 17, 3, '#C99A1A');
  pdot(g, x - 3 + sw, y - 11, '#FFF3B0'); pdot(g, x - 4 + sw, y - 9, '#FFF3B0');
  pdisc(g, x + sw * 2, y + 5, 2, '#8C6440');
  tinyFace(g, x + sw, y - 6, o.sleep ? 'sleep' : o.ring ? 'shock' : 'n', { d: 2 });
  if (o.ring) for (const s of [-1, 1]) { pline(g, x + s * 11, y - 10, x + s * 14, y - 13, '#FFFFFF'); pline(g, x + s * 12, y - 5, x + s * 16, y - 5, '#FFFFFF'); }
  if (o.sleep) { const k = Math.floor(t * 2) % 3; for (let i = 0; i <= k; i++) { prect(g, x + 9 + i * 4, y - 16 - i * 4, 3, 1, '#FFFFFF'); pdot(g, x + 10 + i * 4, y - 15 - i * 4, '#FFFFFF'); prect(g, x + 9 + i * 4, y - 14 - i * 4, 3, 1, '#FFFFFF'); } }
}

/* 跑步机：(x,y) 左下，宽 34 */
function drawTreadmill(g, x, y, t) {
  prect(g, x, y - 3, 34, 3, '#3B3F4E'); prect(g, x + 1, y - 4, 32, 1, '#596070');
  for (let i = 0; i < 32; i += 4) pdot(g, x + 1 + ((i + Math.floor(t * 20)) % 32), y - 2, '#7E8794');
  prect(g, x + 28, y - 22, 3, 19, '#596070'); prect(g, x + 24, y - 24, 10, 4, '#3B3F4E'); prect(g, x + 25, y - 23, 8, 2, '#5BE37D');
}

/* 体重秤：(x,y) 左上，宽 26 */
function drawScale(g, x, y) {
  prect(g, x, y, 26, 5, '#E3E8EE'); prect(g, x, y + 4, 26, 1, '#9AA6B2'); prect(g, x + 8, y + 1, 10, 3, '#2B2547'); prect(g, x + 9, y + 2, 8, 1, '#5BE37D');
}

/* 办公桌 + 电脑（上班族） */
function drawDesk(g, x, y) {
  prect(g, x, y - 12, 34, 3, '#A86C35'); prect(g, x + 2, y - 9, 2, 9, '#7A4E3A'); prect(g, x + 30, y - 9, 2, 9, '#7A4E3A');
  prect(g, x + 14, y - 24, 16, 11, '#2B2547'); prect(g, x + 15, y - 23, 14, 8, '#5EC8FF'); prect(g, x + 21, y - 13, 2, 1, '#2B2547');
  for (let i = 0; i < 3; i++) prect(g, x + 16, y - 21 + i * 2, 8 + (i % 2) * 3, 1, '#BFE6FF');
}

/* 猴面包树：(x,y) 树根中心 */
function drawBaobab(g, x, y, s = 1) {
  const w = Math.round(10 * s), h = Math.round(26 * s);
  prect(g, x - w / 2, y - h, w, h, '#9C7A5A'); prect(g, x - w / 2, y - h, 2, h, '#B8977A');
  for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .45, L = 10 * s; pline(g, x, y - h, x + Math.cos(a) * L, y - h + Math.sin(a) * L * .7, '#8C6A4A'); pdisc(g, x + Math.cos(a) * L, y - h + Math.sin(a) * L * .7 - 1, Math.round(3 * s), '#6FA84E'); }
}

/* 超市货架：(x,y) 左下，宽 w，摆满超加工食品 */
function drawShelf(g, x, y, w, rows = 3) {
  prect(g, x, y - rows * 16 - 2, w, rows * 16 + 2, '#C9D3DE');
  for (let r = 0; r < rows; r++) {
    const by = y - r * 16;
    prect(g, x, by - 2, w, 2, '#8FA3B8');
    for (let i = 0; i < Math.floor((w - 4) / 10); i++) pspr(g, FOOD[UPF[(i + r * 3) % UPF.length]](), x + 3 + i * 10, by - 12);
  }
}

/* 传送带：(x,y) 左上，宽 w */
function drawConveyor(g, x, y, w, t) {
  prect(g, x, y, w, 4, '#3B3F4E'); for (let i = 0; i < w; i += 6) prect(g, x + ((i + Math.floor(t * 30)) % w), y + 1, 2, 2, '#7E8794');
  for (let i = 0; i < w; i += 16) { pdisc(g, x + i + 3, y + 6, 2, '#596070'); }
}

/* 餐盘：(x,y) 左上，宽 34；kind 'upf' | 'whole' */
function drawTray(g, x, y, kind) {
  prect(g, x, y, 34, 18, kind === 'upf' ? '#E8C08A' : '#BFE3C8'); prect(g, x, y + 17, 34, 1, '#9A8E7A');
  const items = kind === 'upf' ? ['fries', 'sausage', 'cake', 'cola'] : ['rice', 'greens', 'egg', 'apple'];
  items.forEach((k, i) => pspr(g, FOOD[k](), x + 3 + (i % 2) * 15, y + 2 + Math.floor(i / 2) * 8));
}

/* 篝火 */
function drawFire(g, x, y, t) {
  prect(g, x - 6, y - 2, 12, 2, '#6B4630'); pline(g, x - 6, y - 4, x + 5, y - 1, '#8C6440');
  for (let i = 0; i < 5; i++) { const h = 3 + Math.floor((Math.sin(t * 13 + i * 1.9) + 1) * 2.5); prect(g, x - 4 + i * 2, y - 2 - h, 2, h, i % 2 ? '#FF8A3D' : '#FFD84A'); }
}

/* ================= 角色 ================= */
/* 财务部：眼镜 + 绿色遮光帽檐，手边一本账 */
function drawAccountant(g, x, y, t, o = {}) {
  drawClawd(g, x, y, { hat: 'visor', glasses: true, eyes: o.eyes || blinkEyes(t, 3), arms: o.arms || 'n' });
  prect(g, x + 22, y + 2, 7, 9, '#3F5E8C'); prect(g, x + 23, y + 3, 5, 7, '#FFFDF6'); for (let i = 0; i < 3; i++) prect(g, x + 24, y + 4 + i * 2, 3, 1, '#9AA1AD');
}
/* 采购部：橙色围裙 + 菜篮子 */
function drawBuyer(g, x, y, t, o = {}) {
  drawClawd(g, x, y, { eyes: o.eyes || blinkEyes(t, 5), arms: o.arms || 'upR', legs: o.legs || 0 });
  prect(g, x + 6, y + 6, 12, 6, '#FF8A3D'); prect(g, x + 6, y + 6, 12, 1, '#D9662A');
  prect(g, x + 22, y - 2, 10, 7, '#C98B4A'); prect(g, x + 23, y - 1, 8, 5, '#E8C08A'); pline(g, x + 22, y - 2, x + 27, y - 7, '#8C6440'); pline(g, x + 31, y - 2, x + 27, y - 7, '#8C6440');
  (o.basket || []).forEach((k, i) => pspr(g, FOOD[k](), x + 22 + (i % 2) * 4, y - 6 - Math.floor(i / 2) * 3));
}
/* 哈扎猎人：背着弓，挎着采集的袋子（不戴什么"原始人"的骨头，他们是今天的人） */
function drawHadza(g, x, y, t, o = {}) {
  pline(g, x + 2, y - 6, x - 2, y + 10, '#7A4E3A'); pline(g, x + 2, y - 6, x + 1, y + 10, '#C9B48E');
  drawClawd(g, x, y, { hat: 'band', eyes: o.eyes || blinkEyes(t, 2), arms: o.arms || 'n', legs: o.legs || 0 });
  prect(g, x + 15, y + 6, 7, 6, '#B08A5A'); prect(g, x + 15, y + 6, 7, 1, '#8C6A4A');
}
/* 上班族：领带 */
function drawWorker(g, x, y, t, o = {}) {
  drawClawd(g, x, y, { eyes: o.eyes || blinkEyes(t, 7), arms: o.arms || 'n', glasses: o.glasses });
  prect(g, x + 11, y + 5, 2, 6, '#2F4E8C'); prect(g, x + 10, y + 5, 4, 1, '#F4F4F4');
}
/* "你"：戴红领巾（第一集的主角） */
function drawYou(g, x, y, t, o = {}) {
  drawClawd(g, x, y, Object.assign({ scarf: true, eyes: blinkEyes(t, 1) }, o));
}
