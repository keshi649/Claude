'use strict';
/* scenes.js —— 各个场景的底图（画一次存起来）和每帧都在动的东西（雪、人、火、灯） */
const NIGHT = 'rgba(20,26,84,.34)';
/* 会动的雪：每片的位置只由编号和时间决定 */
function snowAnim(g, t, n, seed, o = {}) {
  const sp = o.sp || 22, c = o.c || '#FFFFFF', H = o.h || PH, wind = o.wind || 6, sz = o.sz || 1;
  for (let i = 0; i < n; i++) {
    const a = hash(i, seed), b = hash(i, seed + 7), v = sp * (.6 + b * .8), y = ((a * H * 3 + t * v) % (H + 8)) - 4, x = (((b * 977 + t * wind * (.5 + a)) % (PW + 8)) + PW + 8) % (PW + 8) - 4 + Math.sin(t * 1.3 + i) * 2;
    if (sz === 1) R(g, x, y, 1, 1, c); else if (sz === 2) { R(g, x, y, 2, 1, c); R(g, x, y + 1, 1, 1, c); } else { R(g, x - 1, y, 3, 1, c); R(g, x, y - 1, 1, 3, c); }
  }
}
function snow3(g, t, k = 1) { snowAnim(g, t, 90 * k, 1, { c: '#8FA4D8', sp: 14 }); snowAnim(g, t, 60 * k, 2, { sp: 24 }); snowAnim(g, t, 18 * k, 3, { sp: 34, sz: 2 }); snowAnim(g, t, 5 * k, 4, { sp: 44, sz: 3, wind: 12 }); }
/* 路人的长相：按编号轮着配，挨着的不撞色 */
const NPCS = [
  { hair: '#7A4A2A', coat: '#F08AB0', scarf: '#FFFFFF', girl: 1, hat: '#FFFFFF', pom: '#FF5A7A' }, { hair: '#1B1420', coat: '#5AA0E8', scarf: '#FFD54A' },
  { hair: '#C8742E', coat: '#6CC58A', scarf: '#FFFFFF', girl: 1 }, { hair: '#3A2A20', coat: '#7A6AD8', scarf: '#E0423A' },
  { hair: '#1B1420', coat: '#F2C94C', scarf: '#5AB8FF', girl: 1, hat: '#E0423A', pom: '#FFFFFF' }, { hair: '#8A5A2A', coat: '#E07A5A', scarf: '#FFFFFF' },
  { hair: '#5A3A6A', coat: '#7ADFD0', scarf: '#FF8AD8', girl: 1 }, { hair: '#2A2438', coat: '#C8553D', scarf: '#FFFFFF', hat: '#27325F' },
  { hair: '#B8B0C8', coat: '#8A6AA8', scarf: '#FFE066', girl: 1 }, { hair: '#4A3020', coat: '#4E8A6A', scarf: '#F7F1E8' },
];
const npc = (i, o = {}) => ({ ...NPCS[((i % NPCS.length) + NPCS.length) % NPCS.length], mouth: 'smile', ...o });
const stepOf = (t, ph = 0, sp = 4) => (fl(t * sp + ph) % 2) + 1;
/* 按 y 排序再画，后面的人不会盖住前面的 */
function ysort(list) { list.sort((a, b) => a[0] - b[0]).forEach(a => a[1]()); }
function person(g, x, fy, H, o, sh = '#5C6FA8') { ell(g, x, fy, H * .34, 2.2, sh, .6); return chibi(g, x, fy, H, o); }
/* 一对路人：手拉手走，头上隔一会儿冒一颗心 */
function couple(g, t, i, x, fy, H = 26, o = {}) { const st = o.still ? 0 : stepOf(t, i); person(g, x - H * .42, fy, H, npc(i * 2, { eyes: 'happy', step: st })); person(g, x + H * .42, fy, H, npc(i * 2 + 1, { eyes: 'happy', step: st ? 3 - st : 0 })); if (!o.noheart && ((t * .6 + i * .37) % 1) < .6) emote(g, x, fy - H * 1.25, 'heart', t + i); }

/* ---------- 小镇全图（俯视，720×270）：上面一排铺子，下面是广场 ---------- */
const TOWN_W = 720, TGY = 106;
function townMap() {
  return cache2('town', TOWN_W, PH, (g, G) => {
    R(g, 0, 0, TOWN_W, PH, '#DCE6F5'); for (let y = 96; y < PH; y += 16) for (let x = 0; x < TOWN_W; x += 16) { if (((x + y) / 16) & 1) R(g, x, y, 16, 16, '#D0DCF1'); R(g, x + 3, y + 5, 2, 1, '#FFFFFF'); R(g, x + 10, y + 12, 2, 1, '#B8C8E8'); }
    const cob = (x, y, w, h) => { R(g, x, y, w, h, '#8E9CC0'); for (let j = 0; j < h; j += 4) for (let i = (j / 4 & 1) * 4 - 4; i < w; i += 8) R(g, x + Math.max(0, i), y + j, Math.min(7, w - Math.max(0, i)), 3, (i + j) % 3 ? '#A4B1D2' : '#B4C0DC'); R(g, x, y, w, 1, '#FFFFFF'); };
    cob(0, 108, TOWN_W, 22); cob(346, 130, 28, 140);
    const inP = (x, y) => ((x - 360) / 62) ** 2 + ((y - 164) / 32) ** 2;
    field(g, 290, 126, 140, 76, '#8E9CC0', (x, y) => inP(x, y) < 1 ? 1 : 0); field(g, 290, 126, 140, 76, '#B4C0DC', (x, y) => inP(x, y) < 1 && ((x + fl(y / 4) * 4) % 8 < 6) && (y % 4 < 3) ? 1 : 0); field(g, 286, 122, 148, 84, '#FFFFFF', (x, y) => { const d = inP(x, y); return d >= 1 && d < 1.1 ? 1 : 0; });
    const SH = [[2, 84, 78, { wall: '#B5654A', roof: '#5A2E3A', sign: '面包房', awn: ['#E0423A', '#FFF4E0'], win: WIN.bread, lit: [1, 1], sil: [0, 1], chimX: .6 }], [96, 78, 86, { wall: '#4E7A8C', roof: '#2E3E5A', sign: '玩具屋', signCol: '#9FE8FF', win: WIN.globes, lit: [1, 0], doorL: 1, door: '#C8553D', curt: '#3A8A6A' }], [184, 80, 74, { wall: '#7A5A8C', roof: '#3A2A4E', sign: '唱片行', signCol: '#FF9AD8', awn: ['#5A3A8A', '#F0D8FF'], win: WIN.records, lit: [0, 1], chim: false, door: '#3A2A4E', curt: '#E0A040' }], [276, 82, 84, { wall: '#C89858', roof: '#6A3A2A', sign: '咖啡', awn: ['#2E7D4F', '#FFF4E0'], win: WIN.cafe, lit: [1, 1], sil: [1, 0], doorL: 1, door: '#2E5A4A', winCol: '#FFC870', panes: 1 }], [370, 92, 76, { wall: '#A84A5A', roof: '#4A2A3A', sign: '花店', signCol: '#B8FFB0', win: WIN.flowers, lit: [1, 0], chimX: .3, curt: '#F0D8C0' }], [474, 88, 88, { wall: '#8A5A38', roof: '#3A2218', sign: '酒馆', signCol: '#FFB45A', win: WIN.cafe, lit: [1, 1], sil: [1, 1], winCol: '#FFB860', panes: 2, door: '#5A2A1A' }], [574, 70, 72, { wall: '#5A6A9A', roof: '#2A2F5A', sign: '书店', signCol: '#FFFFFF', awn: ['#27325F', '#DCE6F5'], win: WIN.records, lit: [0, 1], doorL: 1, chim: false }], [652, 80, 92, { wall: '#6C8A5A', roof: '#2E4A3A', sign: '旅馆', signCol: '#FFE29A', win: WIN.bread, lit: [1, 1, 0], nw: 3, sil: [1, 0, 0], chimX: .7 }]];
    SH.forEach(([x, w, h, o], i) => { shop(g, G, x, w, h, TGY, { ...o, seed: i * 3 + 2 }); field(g, x, TGY, w, 16, '#FFD9A0', (px, py) => .42 * (1 - (py - TGY) / 16) * Math.min(1, (px - x) / 8, (x + w - px) / 8)); });
    [[14, 156], [34, 176], [10, 200], [56, 150], [150, 204], [96, 196], [232, 150], [250, 210], [206, 190], [478, 206], [508, 150], [590, 204], [640, 150], [700, 170], [682, 204], [712, 214], [450, 212]].forEach(([x, y]) => pine(g, x, y, 22 + (x % 3) * 3));
    const fence = (x0, x1, y) => { for (let x = x0; x < x1; x += 6) { R(g, x, y, 2, 9, '#8A5A38'); R(g, x, y - 1, 2, 1, '#FFFFFF'); } R(g, x0, y + 3, x1 - x0, 2, '#6A4028'); };
    fence(66, 200, 222); fence(520, 660, 222);
    ell(g, 590, 172, 32, 13, '#FFFFFF'); ell(g, 590, 172, 29, 11, '#9CC8F0'); ell(g, 584, 169, 14, 4, '#C8E4FF'); line(g, 576, 176, 604, 168, '#FFFFFF');
    [[110, 164], [176, 176], [486, 176]].forEach(([x, y]) => { R(g, x, y, 26, 3, '#8A5A38'); R(g, x, y - 1, 26, 1, '#FFFFFF'); R(g, x + 2, y + 3, 2, 5, '#5A3422'); R(g, x + 22, y + 3, 2, 5, '#5A3422'); R(g, x, y - 8, 26, 2, '#8A5A38'); R(g, x, y - 9, 26, 1, '#FFFFFF'); });
    [[92, 134], [264, 134], [460, 134], [640, 134], [296, 204], [424, 204]].forEach(([x, y]) => lamp(g, G, x, y, 30, 0)); lights(g, G, 296, 176, 424, 176, 10, 6, 3);
    snowman(g, 292, 150); xtree(g, G, 360, 168, 56, 4);
    g.fillStyle = NIGHT; g.fillRect(0, 0, TOWN_W, PH);
  });
}
/* 镜头在小镇上的位置 cam（0~240），顺带画雪 */
function town(g, G, t, cam = 120) { put2(g, G, townMap(), -Math.round(cam), 0); }

/* ---------- 大地图（俯视，960×540，8 像素一格） ---------- */
const WM_W = 960, WM_H = 540;
function vnoise(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, h = (a, b) => hash(a * 57 + b * 131, s), sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy); return lerp(lerp(h(xi, yi), h(xi + 1, yi), sx), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), sx), sy); }
/* 主角在大地图上走的那一圈：绕着湖 */
const LAKE = [470, 280], loopPt = a => [LAKE[0] + Math.cos(a) * 150, LAKE[1] + Math.sin(a) * 86];
function worldMap() {
  return cache2('wm', WM_W, WM_H, (g, G) => {
    const T = 8, el = (x, y) => vnoise(x / 9, y / 9, 3) * .6 + vnoise(x / 4, y / 4, 5) * .4, fo = (x, y) => vnoise(x / 6, y / 6, 9);
    for (let ty = 0; ty < WM_H / T; ty++) for (let tx = 0; tx < WM_W / T; tx++) {
      const x = tx * T, y = ty * T, e = el(tx, ty), dl = ((x + 4 - LAKE[0]) / 110) ** 2 + ((y + 4 - LAKE[1]) / 56) ** 2, edge = Math.min(tx, ty, WM_W / T - 1 - tx, WM_H / T - 1 - ty);
      if (dl < 1 || e < .3 || edge < 2) { R(g, x, y, T, T, (tx + ty) & 1 ? '#8FB8E8' : '#9CC4F0'); if (hash(tx, ty) < .12) R(g, x + 1, y + 3, 5, 1, '#D8ECFF'); continue; }
      R(g, x, y, T, T, (tx + ty) & 1 ? '#E4ECF8' : '#EEF3FB'); if (hash(tx, ty + 9) < .2) R(g, x + 2, y + 5, 2, 1, '#B8C8E8');
      if (dl < 1.25 || e < .34) R(g, x, y, T, T, '#C8DCF4');
    }
    // 路：绕湖一圈，再接到三个镇子
    const dot = (x, y) => { R(g, x - 2, y - 1, 5, 3, '#C8B090'); R(g, x - 1, y - 1, 3, 1, '#E0CCA8'); };
    for (let a = 0; a < 6.283; a += .035) { const [x, y] = loopPt(a); dot(x, y); }
    const road = (x0, y0, x1, y1) => { const n = Math.hypot(x1 - x0, y1 - y0) / 5; for (let i = 0; i <= n; i++) dot(lerp(x0, x1, i / n) + Math.sin(i * .4) * 5, lerp(y0, y1, i / n)); };
    road(320, 280, 150, 250); road(620, 280, 800, 200); road(470, 366, 520, 470);
    // 山、树林
    const mt = (x, y, s) => { for (let j = 0; j < s; j++) { R(g, x - j, y - s + j, 2 * j + 1, 1, j < s * .4 ? '#FFFFFF' : (j % 3 ? '#7A86B0' : '#6A769E')); R(g, x + fl(j * .3), y - s + j, j - fl(j * .3) + 1, 1, j < s * .4 ? '#D5E2F8' : '#5A668E'); } };
    for (let ty = 2; ty < WM_H / T - 2; ty++) for (let tx = 2; tx < WM_W / T - 2; tx++) {
      const x = tx * T + 4, y = ty * T + 7, e = el(tx, ty), dl = ((x - LAKE[0]) / 110) ** 2 + ((y - LAKE[1]) / 56) ** 2, dr = Math.abs(Math.hypot((x - LAKE[0]) / 150, (y - LAKE[1]) / 86) - 1);
      if (dl < 1.3 || e < .36 || dr < .12) continue;
      if (e > .66 && (tx + ty) % 2 === 0) mt(x + fl(hash(tx, ty) * 4), y + 2, 9 + fl(hash(tx, ty + 3) * 6));
      else if (fo(tx, ty) > .56 && hash(tx + 1, ty) < .8) { const h = 7 + fl(hash(tx, ty + 5) * 3); for (let j = 0; j < h; j++) R(g, x - fl(j / 2.2), y - h + j, 1 + 2 * fl(j / 2.2), 1, j < 2 ? '#FFFFFF' : (j % 2 ? '#2E7A58' : '#256A4C')); R(g, x, y, 1, 2, '#5A3422'); }
    }
    // 三个镇子
    const tw = (x, y, n, name) => { for (let i = 0; i < n; i++) { const hx = x + (i % 3) * 11 - 12 + (fl(i / 3) % 2) * 5, hy = y + fl(i / 3) * 9 - 6; R(g, hx, hy, 9, 7, ['#B5654A', '#4E7A8C', '#C89858', '#A84A5A'][i % 4]); for (let j = 0; j < 4; j++) R(g, hx - 1 + j, hy - 4 + j, 11 - 2 * j, 1, j < 2 ? '#FFFFFF' : '#5A3A4A'); R(g, hx + 3, hy + 3, 2, 3, WARM); R(G, hx + 3, hy + 3, 2, 3, '#C08030'); } soft(G, x, y, 22, '#FFB850', .5); panel(g, x - 20, y + 16, tbits(name).w + 10, 15, { bg: '#3A2A10' }); ptext(g, name, x - 15, y + 17, '#FFE9A0'); };
    tw(130, 244, 7, '圣诞镇'); tw(812, 190, 5, '北港'); tw(524, 486, 6, '南村');
    // 湖心的小岛和一棵树
    ell(g, LAKE[0], LAKE[1], 16, 8, '#EEF3FB'); pine(g, LAKE[0], LAKE[1] + 3, 20);
    g.fillStyle = 'rgba(30,40,110,.26)'; g.fillRect(0, 0, WM_W, WM_H);
  });
}
function world(g, G, t, cx, cy) { const x = cl(Math.round(cx - 240), 0, WM_W - PW), y = cl(Math.round(cy - 135), 0, WM_H - PH); put2(g, G, worldMap(), -x, -y); for (let i = 0; i < 5; i++) { const sx = ((hash(i, 3) * 1400 + t * (6 + i * 2)) % 1400) - 200 - x * .6, sy = hash(i, 8) * 500 - y * .6; ell(g, sx, sy, 70 + i * 12, 20 + i * 4, '#1A2460', .22); } return [x, y]; }

/* ---------- 横版：几层视差的雪原 / 四季 ---------- */
const PALS = {
  night: { sky: ['#060A22', '#0B1438', '#14214E', '#222E66', '#3A3670'], far: '#1A2452', farTop: '#5A6EAC', mid: '#22306A', midTop: '#7A8EC8', pine: '#16304A', gr: ['#8FA4D4', '#B4C4E8', '#D6E1F5', '#E9F0FB'], star: 1, moon: '#FFF2C8', snowcap: 1 },
  dusk: { sky: ['#1A1040', '#3A1A60', '#6A2A78', '#B04A7A', '#F08A80'], far: '#3A2060', farTop: '#C8A0E0', mid: '#4A2A70', midTop: '#E0B8F0', pine: '#2A1A48', gr: ['#B8A8E8', '#D8D0F8', '#EEF0FF', '#FFFFFF'], star: 1, snowcap: 1 },
  spring: { sky: ['#6AB8F0', '#8ACCF8', '#B0E0FF', '#D8F0FF', '#F0FAFF'], far: '#7AC0A8', farTop: '#A8E0C0', mid: '#5AB078', midTop: '#8AD890', pine: '#3A8A5A', gr: ['#6AC070', '#7ED080', '#96E090', '#B0EEA0'], sun: '#FFF4B0', cloud: 1, flower: '#FF9AC0' },
  summer: { sky: ['#1A1848', '#2A2468', '#4A3080', '#7A3A88', '#C85A80'], far: '#201C50', farTop: '#5A4A90', mid: '#182848', midTop: '#3A6A78', pine: '#102A30', gr: ['#2A5A50', '#3A7060', '#4A8870', '#5A9A80'], star: 1, moon: '#FFE8B0' },
  autumn: { sky: ['#F0A050', '#F8B860', '#FFD080', '#FFE4A8', '#FFF4D0'], far: '#B86A4A', farTop: '#E09A60', mid: '#A8502E', midTop: '#E08840', pine: '#7A3A20', gr: ['#C88A48', '#D8A058', '#E8B870', '#F0CC88'], sun: '#FFFFFF', leaf: '#E0602A' },
};
function skyBuf(pn) { const P = PALS[pn]; return cache2('sky' + pn, PW, PH, (g, G) => { vgrad(g, 0, 0, PW, 200, P.sky); R(g, 0, 200, PW, 70, P.sky[4]); const r = rng(7); if (P.star) for (let i = 0; i < 90; i++) { const x = fl(r() * PW), y = fl(r() * 120), b = r(); R(g, x, y, 1, 1, b > .8 ? '#FFFFFF' : '#8FA4D8'); if (b > .93) { R(g, x - 1, y, 3, 1, '#FFFFFF'); R(g, x, y - 1, 1, 3, '#FFFFFF'); soft(G, x, y, 4, '#FFFFFF', .7); } } if (P.moon) { disc(g, 392, 46, 17, P.moon); disc(g, 386, 40, 4, dk(P.moon, .12)); disc(g, 398, 52, 3, dk(P.moon, .12)); soft(G, 392, 46, 42, '#FFE8A0', .7); } if (P.sun) { disc(g, 392, 50, 20, P.sun); soft(G, 392, 50, 60, '#FFE080', .8); } if (P.cloud) [[60, 40, 34], [200, 26, 26], [300, 60, 40], [440, 90, 30]].forEach(([x, y, w]) => { ell(g, x, y, w, w * .3, '#FFFFFF'); ell(g, x - w * .4, y + 3, w * .5, w * .22, '#FFFFFF'); ell(g, x + w * .45, y + 4, w * .55, w * .2, '#F0F8FF'); }); }); }
function stripBuf(pn, layer) {
  const P = PALS[pn], W = 960;
  return cache2('st' + pn + layer, W, PH, (g, G) => {
    const r = rng(layer * 31 + pn.length), per = k => 2 * Math.PI * k / W;
    if (layer === 1) { for (let x = 0; x < W; x++) { const h = 46 + 22 * Math.sin(x * per(3) + 1) + 14 * Math.abs(Math.sin(x * per(7))) + 6 * Math.sin(x * per(17)); R(g, x, 178 - h, 1, h + 30, P.far); R(g, x, 178 - h, 1, P.snowcap ? 5 + 3 * Math.sin(x * per(23)) : 2, P.farTop); } }
    if (layer === 2) { for (let x = 0; x < W; x++) { const h = 26 + 12 * Math.sin(x * per(4) + 2) + 6 * Math.sin(x * per(11)); R(g, x, 198 - h, 1, h + 10, P.mid); R(g, x, 198 - h, 1, 3, P.midTop); } for (let i = 0; i < 44; i++) { const x = fl(r() * W), h = 26 + 12 * Math.sin(x * per(4) + 2) + 6 * Math.sin(x * per(11)), by = 198 - h + 3, th = 14 + fl(r() * 14); for (let j = 0; j < th; j++) R(g, x - fl(j / 2.4), by - th + j, 1 + 2 * fl(j / 2.4), 1, P.snowcap && j % 5 === 0 ? P.midTop : P.pine); R(g, x, by, 1, 2, dk(P.pine, .3)); } [[150, 1], [620, 0]].forEach(([x, k]) => { const h = 26 + 12 * Math.sin(x * per(4) + 2) + 6 * Math.sin(x * per(11)), y = 198 - h; R(g, x, y - 12, 16, 13, dk(P.mid, .1)); for (let j = 0; j < 7; j++) R(g, x - 2 + j, y - 19 + j, 20 - 2 * j, 1, P.snowcap ? '#DCE8FA' : P.midTop); R(g, x + 3, y - 7, 3, 4, WARM); R(g, x + 10, y - 7, 3, 4, WARM); soft(G, x + 8, y - 5, 9, '#FFB850', .7); }); }
    if (layer === 3) { vgrad(g, 0, 196, W, 74, P.gr); for (let i = 0; i < 520; i++) { const x = fl(r() * W), y = 198 + fl(r() * 70); R(g, x, y, 2 + fl(r() * 3), 1, r() < .5 ? lt(P.gr[3], .3) : dk(P.gr[0], .08)); } for (let x = 0; x < W; x++) R(g, x, 195 - Math.round(1.5 * Math.sin(x * per(19)) + 1), 1, 3, lt(P.gr[2], .25)); if (P.flower) for (let i = 0; i < 80; i++) { const x = fl(r() * W), y = 200 + fl(r() * 60); R(g, x, y, 2, 2, [P.flower, '#FFFFFF', '#FFE066'][i % 3]); R(g, x, y + 2, 1, 2, '#3A8A4A'); } if (P.leaf) for (let i = 0; i < 90; i++) R(g, fl(r() * W), 198 + fl(r() * 66), 3, 2, [P.leaf, '#F0B030', '#C8402A'][i % 3]); }
  });
}
/* x：镜头往右走了多少像素；o.far 只画远景（自己另画地面时用） */
function scroll(g, G, t, x, pn, o = {}) { put2(g, G, skyBuf(pn)); R(g, 0, PH, PW, 16, PALS[pn].gr[3]); [[1, .08], [2, .28], [3, 1]].forEach(([L, sp]) => { if (o.far && L === 3) return; const b = stripBuf(pn, L), ox = -(((x * sp) % 960) + 960) % 960; put2(g, G, b, ox, o.dy || 0); put2(g, G, b, ox + 960, o.dy || 0); }); }
/* 一棵树（四季）：横版里的近景 */
function tree(g, x, base, h, pn) { const P = PALS[pn], c = pn === 'spring' ? '#FFB0CC' : pn === 'autumn' ? '#E87830' : pn === 'summer' ? '#2A7A5A' : '#DCE8FA'; R(g, x - 2, base - h * .5, 4, h * .5, '#5A3422'); disc(g, x, base - h * .7, h * .32, dk(c, .16)); disc(g, x - h * .16, base - h * .6, h * .24, c); disc(g, x + h * .18, base - h * .66, h * .22, c); disc(g, x, base - h * .86, h * .2, lt(c, .2)); }

/* ---------- 酒馆（侧面，室内） ---------- */
function tavernBuf() {
  return cache2('tav', PW, PH, (g, G) => {
    vgrad(g, 0, 0, PW, 200, ['#2A160E', '#3A2014', '#4A2A1A', '#5A3420']); for (let x = 0; x < PW; x += 22) R(g, x, 0, 1, 200, '#24120A'); R(g, 0, 60, PW, 5, '#24120A'); R(g, 0, 58, PW, 2, '#6A4028');
    vgrad(g, 0, 200, PW, 70, ['#6A4028', '#7A4A30', '#8A5638']); for (let y = 200; y < PH; y += 9) R(g, 0, y, PW, 1, '#4A2818'); for (let i = 0; i < 40; i++) R(g, (i * 97) % PW, 200 + (i * 31) % 70, 1, 9, '#4A2818');
    // 酒柜
    R(g, 24, 70, 216, 78, '#24120A'); for (let s = 0; s < 3; s++) { R(g, 24, 92 + s * 24, 216, 3, '#8A5638'); for (let i = 0; i < 17; i++) { const x = 30 + i * 12.4, c = ['#2E7D4F', '#C8553D', '#E0A040', '#5AA0E8', '#8A6AA8', '#F4EAD8'][(i * 5 + s * 3) % 6], h = 9 + ((i * 7 + s) % 3) * 3; if ((i + s) % 5 === 4) { R(g, x, 92 + s * 24 - 8, 7, 8, '#D8B878'); R(g, x + 7, 92 + s * 24 - 6, 2, 4, '#D8B878'); R(g, x, 92 + s * 24 - 8, 7, 2, '#FFFFFF'); } else { R(g, x + 1, 92 + s * 24 - h, 5, h, c); R(g, x + 2, 92 + s * 24 - h - 3, 3, 3, c); R(g, x + 1, 92 + s * 24 - h, 1, h, lt(c, .4)); } } }
    R(g, 20, 66, 224, 5, '#8A5638'); lights(g, G, 22, 72, 242, 72, 5, 6, 2, '#24120A');
    // 吧台
    R(g, 12, 150, 244, 50, '#7A4A30'); R(g, 8, 146, 252, 6, '#B87A4E'); R(g, 8, 146, 252, 1, '#E0A870'); for (let x = 20; x < 250; x += 26) { R(g, x, 156, 20, 40, '#6A3E26'); R(g, x + 1, 157, 18, 1, '#8A5638'); } R(g, 12, 198, 244, 2, '#3A2014');
    [[60], [120], [180], [232]].forEach(([x]) => { R(g, x - 8, 178, 16, 4, '#C8553D'); R(g, x - 8, 178, 16, 1, '#E87868'); R(g, x - 1, 182, 2, 22, '#2A1810'); R(g, x - 6, 203, 12, 2, '#2A1810'); });
    // 壁炉
    R(g, 300, 96, 92, 104, '#6A5A5A'); for (let j = 0; j < 13; j++) for (let i = 0; i < 6; i++) R(g, 300 + i * 16 + (j % 2) * 8 - 4, 96 + j * 8, 15, 7, (i + j) % 3 ? '#7A6A6A' : '#8A7A78'); R(g, 294, 90, 104, 8, '#8A5638'); R(g, 294, 90, 104, 1, '#E0A870'); R(g, 318, 140, 56, 60, '#140A08'); R(g, 322, 192, 48, 5, '#5A3422'); R(g, 330, 188, 34, 4, '#7A4A30');
    [[306, 78, '#E0423A'], [330, 80, '#2E7D4F'], [356, 78, '#FFFFFF'], [380, 80, '#E0423A']].forEach(([x, y, c]) => { R(g, x, y, 8, 12, c); R(g, x, y, 8, 3, '#FFFFFF'); R(g, x + 5, y + 10, 5, 3, c); });
    // 窗
    R(g, 412, 84, 56, 60, '#24120A'); vgrad(g, 416, 88, 48, 52, ['#0A1238', '#16286A', '#2E3E8A']); R(g, 439, 88, 2, 52, '#24120A'); R(g, 416, 113, 48, 2, '#24120A'); R(g, 408, 144, 64, 4, '#8A5638'); R(g, 408, 143, 64, 1, '#FFFFFF');[[420, 128], [448, 132]].forEach(([x, y]) => { R(g, x, y, 8, 8, '#141C48'); R(g, x - 1, y - 2, 10, 2, '#DCE8FA'); R(g, x + 3, y + 3, 2, 3, WARM); });
    // 吊灯
    [70, 170, 270, 400].forEach(x => { R(g, x, 0, 1, 34, '#24120A'); R(g, x - 6, 34, 13, 9, '#E0A040'); R(g, x - 4, 36, 9, 6, '#FFF2C0'); R(g, x - 7, 33, 15, 2, '#5A3420'); soft(G, x, 40, 30, '#FFA840', .9); soft(G, x, 40, 9, '#FFFFFF', .9); field(g, x - 44, 44, 88, 150, '#FFD9A0', (px, py) => { const tt = (py - 44) / 150, d = Math.abs(px - x) / (6 + tt * 38); return d > 1 ? 0 : .14 * (1 - d) * (1 - tt * .5); }); });
    // 桌子、酒桶、靶
    R(g, 396, 196, 64, 5, '#B87A4E'); R(g, 396, 196, 64, 1, '#E0A870'); R(g, 424, 201, 8, 30, '#6A3E26'); R(g, 412, 230, 32, 3, '#4A2818');
    [[280, 222], [14, 226]].forEach(([x, y]) => { R(g, x, y, 26, 30, '#8A5638'); R(g, x, y + 5, 26, 2, '#3A2014'); R(g, x, y + 22, 26, 2, '#3A2014'); R(g, x + 1, y, 24, 2, '#B87A4E'); });
    disc(g, 276, 104, 12, '#F4EAD8'); disc(g, 276, 104, 9, '#C8553D'); disc(g, 276, 104, 6, '#F4EAD8'); disc(g, 276, 104, 3, '#2E7D4F'); disc(g, 276, 104, 1, '#E0423A');
    panel(g, 108, 14, 48, 17, { bg: '#3A2A10' }); ptext(g, '酒 馆', 117, 16, '#FFB45A'); ptext(G, '酒 馆', 117, 16, '#8A5020');
  });
}
function flame(g, G, t, x, y, s = 1) { for (let i = 0; i < 7; i++) { const ph = t * 5 + i * 1.7, h = (8 + 6 * Math.abs(Math.sin(ph))) * s, xx = x + (i - 3) * 5 * s; R(g, xx - 2 * s, y - h, 4 * s, h, '#E0602A'); R(g, xx - s, y - h * .7, 2 * s, h * .7, '#FFB040'); R(g, xx, y - h * .4, 1, h * .4, '#FFF4B0'); } if (G) { soft(G, x, y - 10, 34 * s, '#FF8030', .9 + .1 * Math.sin(t * 9)); soft(G, x, y - 8, 12 * s, '#FFE0A0', 1); } }
function tavern(g, G, t) { put2(g, G, tavernBuf()); R(g, 0, PH, PW, 16, '#8A5638'); flame(g, G, t, 346, 190); snowAnim(g, t, 14, 5, { h: 52, c: '#FFFFFF' }); }

/* ---------- 卧室（侧面，室内）：存档点在这里 ---------- */
function roomBuf() {
  return cache2('room', PW, PH, (g, G) => {
    vgrad(g, 0, 0, PW, 196, ['#1E2A4A', '#24345A', '#2A3E68']); for (let x = 0; x < PW; x += 16) field(g, x, 0, 7, 196, '#1A2440', () => .5); R(g, 0, 150, PW, 46, '#3A2A3E'); R(g, 0, 150, PW, 2, '#5A4A60'); for (let x = 0; x < PW; x += 30) R(g, x, 152, 1, 44, '#2A1E2E');
    vgrad(g, 0, 196, PW, 74, ['#6A4A3A', '#7A5642', '#8A624A']); for (let y = 196; y < PH; y += 10) R(g, 0, y, PW, 1, '#4A3226');
    // 窗
    R(g, 150, 34, 104, 100, '#3A2014'); vgrad(g, 156, 40, 92, 88, ['#0A1238', '#16286A', '#2E3E8A']); for (let x = 156; x < 248; x++) { const h = 10 + 6 * Math.sin(x / 11); R(g, x, 122 - h, 1, h + 6, '#1A2456'); R(g, x, 122 - h, 1, 2, '#8FA4D8'); } [[166, 108], [190, 112], [216, 106], [232, 114]].forEach(([x, y]) => { R(g, x, y, 9, 10, '#141C48'); R(g, x - 1, y - 2, 11, 2, '#DCE8FA'); R(g, x + 3, y + 3, 3, 4, WARM); soft(G, x + 4, y + 5, 4, '#FFB850', .8); });
    R(g, 200, 40, 4, 88, '#3A2014'); R(g, 156, 82, 92, 4, '#3A2014'); R(g, 146, 134, 112, 5, '#5A3420'); R(g, 146, 133, 112, 1, '#FFFFFF'); for (let j = 0; j < 104; j++) { R(g, 136, 30 + j, 12 + fl(3 * Math.sin(j / 8)), 1, j % 2 ? '#6A2430' : '#7A2A38'); R(g, 256 - fl(3 * Math.sin(j / 8)), 30 + j, 12 + fl(3 * Math.sin(j / 8)), 1, j % 2 ? '#6A2430' : '#7A2A38'); } R(g, 130, 26, 144, 5, '#2A1810');
    lights(g, G, 10, 20, 130, 26, 12, 7, 1, '#141C30'); lights(g, G, 274, 26, 470, 18, 14, 7, 3, '#141C30');
    // 书桌、台灯、录音机、相框
    R(g, 20, 150, 104, 6, '#8A5638'); R(g, 20, 150, 104, 1, '#B87A4E'); R(g, 24, 156, 5, 46, '#6A3E26'); R(g, 114, 156, 5, 46, '#6A3E26'); R(g, 70, 156, 48, 22, '#7A4A30'); R(g, 90, 166, 8, 2, '#E0B85A');
    R(g, 36, 148, 12, 2, '#2A2438'); R(g, 41, 128, 2, 20, '#2A2438'); line(g, 42, 128, 52, 120, '#2A2438', 2); R(g, 48, 114, 16, 8, '#E0423A'); R(g, 50, 122, 12, 2, '#FFF2C0'); soft(G, 56, 126, 30, '#FFC060', .9); field(g, 30, 124, 60, 28, '#FFD9A0', (px, py) => { const tt = (py - 124) / 26, d = Math.abs(px - 56) / (6 + tt * 24); return d > 1 ? 0 : .3 * (1 - d); });
    R(g, 76, 138, 30, 12, '#3A3A52'); R(g, 76, 138, 30, 1, '#6A6A88'); disc(g, 84, 144, 3, '#1A1A28'); disc(g, 98, 144, 3, '#1A1A28'); R(g, 88, 141, 6, 2, '#E0423A');
    R(g, 106, 126, 16, 22, '#C9A04A'); R(g, 108, 128, 12, 18, '#6A70B0'); R(g, 110, 136, 3, 6, '#E3A23C'); R(g, 110, 133, 3, 3, '#F9DABF'); for (let j = 0; j < 18; j += 2) R(g, 115, 128 + j, 5, 1, '#3A3F70');
    // 海报、吉他、书架
    R(g, 30, 44, 44, 58, '#F4EAD8'); R(g, 32, 46, 40, 34, '#C8553D'); disc(g, 52, 62, 10, '#FFE066'); R(g, 36, 84, 32, 3, '#3A2A30'); R(g, 36, 90, 22, 3, '#3A2A30'); R(g, 50, 42, 4, 4, '#E0423A');
    R(g, 92, 40, 3, 56, '#6A4028'); ell(g, 93, 104, 10, 13, '#C8742E'); ell(g, 93, 96, 7, 8, '#C8742E'); disc(g, 93, 104, 3, '#2A1810'); R(g, 90, 36, 7, 6, '#3A2014');
    R(g, 284, 60, 70, 4, '#8A5638'); R(g, 284, 96, 70, 4, '#8A5638'); for (let i = 0; i < 11; i++) { const c = ['#C8553D', '#2E7D4F', '#5AA0E8', '#E0A040', '#8A6AA8', '#F4EAD8'][i % 6]; R(g, 288 + i * 6, 44 + (i % 3), 5, 16 - (i % 3), c); R(g, 288 + i * 6, 46 + (i % 3), 5, 2, lt(c, .4)); } for (let i = 0; i < 6; i++) { R(g, 288 + i * 11, 84, 10, 12, '#2A2438'); R(g, 289 + i * 11, 86, 8, 4, ['#E0423A', '#FFE066', '#5AB8FF'][i % 3]); }
    // 床
    R(g, 300, 156, 170, 40, '#5A3422'); R(g, 296, 132, 10, 66, '#6A3E26'); R(g, 462, 120, 12, 78, '#6A3E26'); R(g, 306, 150, 156, 14, '#F4EAD8'); R(g, 306, 160, 156, 30, '#4E6AA8'); for (let x = 306; x < 462; x += 12) for (let y = 162; y < 190; y += 12) R(g, x + ((y / 12) & 1) * 6, y, 5, 5, '#6A86C8'); R(g, 306, 160, 156, 3, '#8AA6E0'); ell(g, 440, 150, 18, 7, '#FFFFFF'); ell(g, 440, 152, 18, 5, '#DCE6F5');
    // 地毯、暖炉
    ell(g, 220, 232, 96, 20, '#8A3A4A'); ell(g, 220, 232, 86, 16, '#A84A5A'); ell(g, 220, 232, 60, 10, '#C8687A');
    R(g, 262, 164, 26, 34, '#C8C8D8'); for (let i = 0; i < 5; i++) R(g, 265 + i * 5, 168, 2, 26, '#8A8AA8'); R(g, 262, 164, 26, 2, '#FFFFFF'); soft(G, 275, 180, 18, '#FF7040', .5);
  });
}
/* 存档水晶：上下浮动、发光 */
function crystal(g, G, t, x, y) { y = Math.round(y + Math.sin(t * 2.2) * 3); for (let j = 0; j < 9; j++) { R(g, x - j, y - 18 + j * 2, 2 * j + 1, 2, j < 4 ? '#C8F0FF' : '#7AD0FF'); R(g, x - 8 + j, y + j * 2, 17 - 2 * j, 2, j < 4 ? '#5AB8FF' : '#2A6AD8'); } R(g, x - 2, y - 10, 2, 8, '#FFFFFF'); ell(g, x, y + 26, 9, 2.4, '#1A1420', .5); if (G) { soft(G, x, y, 34, '#5AB8FF', .8 + .2 * Math.sin(t * 3)); soft(G, x, y, 10, '#FFFFFF', 1); } for (let i = 0; i < 5; i++) { const a = t * 1.5 + i * 1.257; R(g, x + Math.cos(a) * 16, y + Math.sin(a) * 7 - 2, 1, 1, '#FFFFFF'); } }
function room(g, G, t) { put2(g, G, roomBuf()); R(g, 0, PH, PW, 16, '#8A624A'); snowAnim(g, t, 16, 9, { h: 80, c: '#FFFFFF', sp: 12 }); R(g, 200, 40, 4, 88, '#3A2014'); R(g, 156, 82, 92, 4, '#3A2014'); }

/* ---------- 战斗背景：三个形态三种颜色 ---------- */
const BPAL = [{ sky: ['#1A1040', '#3A1A60', '#6A2A78', '#B04A7A', '#F08A80'], ray: '#FFE9A0', mt: '#3A2060', mtTop: '#C8A0E0', fl: ['#B8A8E8', '#D8D0F8', '#EEF0FF'], grid: '#A898D8', glow: '#FFB870' }, { sky: ['#04061A', '#0A1238', '#102A60', '#1A4A88', '#3A80B0'], ray: '#9FE8FF', mt: '#0A1A40', mtTop: '#5AA0D8', fl: ['#6A8AC8', '#9AB4E0', '#D0E0F8'], grid: '#4A6AA8', glow: '#5AB8FF' }, { sky: ['#F08A50', '#F8A860', '#FFC878', '#FFE4A0', '#FFF8D8'], ray: '#FFFFFF', mt: '#C86A48', mtTop: '#FFD8A0', fl: ['#F0C890', '#F8E0B8', '#FFF8E8'], grid: '#E0A870', glow: '#FFE080' }];
function battleBG(g, G, t, ph = 0, bx = 340, by = 96) {
  const P = BPAL[ph]; put2(g, G, cache2('bbg' + ph + bx, PW, PH, (c, C) => {
    vgrad(c, 0, 0, PW, 150, P.sky); field(c, 0, 0, PW, 150, P.ray, (x, y) => { const a = Math.atan2(y - by, x - bx), d = Math.hypot(x - bx, y - by); return (fl((a + Math.PI) / (Math.PI / 14)) & 1) ? Math.max(0, .5 - d / 520) : 0; });
    soft(c, bx, by, 120, lt(P.ray, .3), .5); soft(C, bx, by, 90, P.glow, .35);
    for (let x = 0; x < PW; x++) { const h = 16 + 10 * Math.sin(x / 31) + 5 * Math.sin(x / 11 + 2); R(c, x, 150 - h, 1, h, P.mt); R(c, x, 150 - h, 1, 2, P.mtTop); }
    for (let i = 0; i < 22; i++) { const x = (i < 11 ? 4 + i * 13 : 336 + (i - 11) * 13) + (i % 3) * 3, th = 12 + (i * 7) % 12; for (let j = 0; j < th; j++) R(c, x - fl(j / 2.2), 151 - th + j, 1 + 2 * fl(j / 2.2), 1, j % 5 === 0 ? P.mtTop : dk(P.mt, .3)); }
    vgrad(c, 0, 150, PW, 120, [P.fl[0], P.fl[1], P.fl[2], P.fl[2]]); for (let i = -14; i <= 14; i++) line(c, 240 + i * 14, 150, 240 + i * 70, 270, P.grid); for (let j = 0; j < 8; j++) R(c, 0, 150 + fl(j * j * 1.9 + j * 2), PW, 1, P.grid);
    [[40, 176, 26], [200, 164, 18], [300, 222, 34], [440, 180, 24], [150, 236, 30], [420, 240, 28]].forEach(([x, y, w]) => { ell(c, x, y, w, w * .22, P.fl[0], .5); ell(c, x - 2, y - 2, w * .8, w * .16, '#FFFFFF'); });
  }));
  for (let i = 0; i < 10; i++) { const tw = Math.sin(t * 3 + i * 2.1); if (tw > .2) sparkle(g, G, bx + (hash(i, 1) - .5) * 220, by + (hash(i, 2) - .5) * 150, i % 2 ? '#FFFFFF' : P.ray, 1 + fl(tw * 2.5)); }
}

/* ---------- 夜里的广场舞台（侧面） ---------- */
const SGY = 206;
function stageBuf() {
  return cache2('stage', PW, PH, (g, G) => {
    put(g, skyBuf('night').p); put(G, skyBuf('night').g); hills(g, 150, '#18224E', '#4A5E9C', 3);
    const r = rng(4); for (let i = 0; i < 16; i++) { const x = -10 + i * 32 + fl(r() * 8), h = 26 + fl(r() * 30), w = 26 + fl(r() * 10), c = ['#1A2248', '#202A56', '#161C40'][i % 3]; R(g, x, SGY - h, w, h, c); for (let j = 0; j < 9; j++) R(g, x - 2 + j, SGY - h - 9 + j, w + 4 - 2 * j, 1, j < 3 ? '#C9D6EE' : dk(c, .2)); for (let k = 0; k < 3; k++) if (r() < .75) { const wx = x + 4 + k * 8, wy = SGY - h + 6 + fl(r() * 8); R(g, wx, wy, 4, 6, WARM); R(G, wx, wy, 4, 6, '#B07020'); } }
    shop(g, G, -30, 84, 92, SGY, { wall: '#B5654A', roof: '#5A2E3A', sign: '面包房', awn: ['#E0423A', '#FFF4E0'], win: WIN.bread, seed: 2, lit: [1, 1], sil: [0, 1] });
    shop(g, G, 424, 84, 96, SGY, { wall: '#4E7A8C', roof: '#2E3E5A', sign: '玩具屋', signCol: '#9FE8FF', win: WIN.globes, seed: 5, lit: [1, 0], doorL: 1, door: '#C8553D', curt: '#3A8A6A' });
    ground(g, SGY, [[0, 44, 22, .5], [436, 44, 22, .5], [150, 180, 44, .5]]);
    xtree(g, G, 96, 218, 74, 6); lamp(g, G, 62, 222, 50, 0); lamp(g, G, 418, 222, 50, 0);
    const sx = 150, sw = 180, sy = 200;
    R(g, sx, sy, sw, 9, '#8A5A38'); R(g, sx, sy, sw, 2, '#C08A58'); for (let i = 0; i < sw; i += 12) R(g, sx + i, sy + 2, 1, 7, '#5A3422'); R(g, sx + 4, sy + 9, sw - 8, 5, '#3A2218'); R(g, sx - 2, sy - 1, sw + 4, 1, '#FFFFFF');
    R(g, sx + 4, 104, 3, 96, '#1B2140'); R(g, sx + sw - 7, 104, 3, 96, '#1B2140'); R(g, sx + 2, 102, sw - 4, 4, '#1B2140'); R(g, sx + 2, 100, sw - 4, 2, '#FFFFFF'); for (let i = sx + 8; i < sx + sw - 8; i += 8) { line(g, i, 106, i + 4, 110, '#2C3660'); line(g, i + 4, 110, i + 8, 106, '#2C3660'); }
    lights(g, G, sx + 5, 112, sx + sw - 6, 112, 9, 6, 2); lights(g, G, 62, 172, sx + 5, 106, 10, 7, 5); lights(g, G, sx + sw - 6, 106, 418, 172, 10, 7, 3);
    [[sx + 8], [sx + sw - 28]].forEach(([ax]) => { R(g, ax, sy - 26, 20, 26, '#1B1420'); R(g, ax, sy - 26, 20, 1, '#4A3A50'); disc(g, ax + 10, sy - 17, 5, '#4A3A50'); disc(g, ax + 10, sy - 17, 2, '#0E0A12'); disc(g, ax + 10, sy - 6, 3, '#4A3A50'); });
    R(g, sx + 44, 86, sw - 88, 14, '#3A2A10'); R(g, sx + 44, 86, sw - 88, 1, '#FFE9A0'); ptext(g, '圣诞夜 演唱会', sx + sw / 2, 87, '#FFE9A0', { align: 'c' }); ptext(G, '圣诞夜 演唱会', sx + sw / 2, 87, '#8A6020', { align: 'c' });
  });
}
/* 射灯：两束，颜色和摆动随时间变；lit 0~1 */
function spots(g, G, t, lit = 1, cols = ['#FFE9B0', '#FFB0D8']) { if (lit <= 0) return; [[196, 110, 0], [284, 110, 1]].forEach(([lx, ly, k]) => { const tx = 240 + Math.sin(t * 1.4 + k * 3) * 26, c = cols[k % cols.length]; R(g, lx - 4, ly - 3, 8, 7, '#0E1228'); R(g, lx - 3, ly + 3, 6, 2, '#FFF4C0'); soft(G, lx, ly + 4, 14, c, lit); g.fillStyle = c; for (let y = ly + 6; y < 202; y += 1) { const tt = (y - ly) / 92, cx = lx + (tx - lx) * tt, hw = 3 + tt * 22; for (let x = Math.round(cx - hw); x < cx + hw; x++) if (bay(x, y) < .3 * lit * (1 - Math.abs(x - cx) / hw * .7)) g.fillRect(x, y, 1, 1); } }); }
function stage(g, G, t, o = {}) { put2(g, G, stageBuf()); spots(g, G, t, o.lit ?? 1, o.cols); }
/* 台下的人：背对镜头，举着荧光棒；n 个，leave 0~1 走掉多少 */
function crowd(g, G, t, n = 14, leave = 0, o = {}) { for (let i = 0; i < n; i++) { const gone = sg(leave, i / n * .8, i / n * .8 + .2); if (gone >= 1) continue; const side = i % 2 ? 1 : -1, x = 60 + (i * 53) % 360 + side * gone * 300, fy = 250 + (i % 3) * 8 + (o.dy || 0), H = 30, hop = gone > 0 ? 0 : Math.round(Math.abs(Math.sin(t * 7.75 + i)) * 2 * (o.hop ?? 1)); chibi(g, x, fy - hop, H, npc(i, { back: gone > 0 ? 0 : 1, step: gone > 0 ? stepOf(t, i, 6) : 0, arms: gone > 0 ? 'down' : (i % 3 ? 'upR' : 'up'), mouth: 'flat' })); if (gone <= 0 && i % 3) { const c = BULBS[i % 5], hx = x + 10 * H / 28, hy = fy - hop - 21 * H / 28; R(g, hx, hy - 8, 2, 9, c); if (G) soft(G, hx + 1, hy - 5, 6, c, .9); } } }

/* ---------- KTV 包间 ---------- */
function ktvBuf() {
  return cache2('ktv', PW, PH, (g, G) => {
    vgrad(g, 0, 0, PW, 196, ['#1A0E30', '#24123E', '#30184C', '#3A1E58']); for (let x = 0; x < PW; x += 24) for (let y = 0; y < 196; y += 24) { R(g, x + 11, y + 11, 2, 2, '#4A2A70'); }
    vgrad(g, 0, 196, PW, 74, ['#2A1438', '#34184A', '#3E1E58']); for (let x = 0; x < PW; x += 30) for (let y = 196; y < PH; y += 20) R(g, x + ((y / 20) & 1) * 15, y, 14, 9, '#4A2468');
    R(g, 150, 30, 180, 108, '#0A0614'); R(g, 154, 34, 172, 100, '#101A44'); R(g, 228, 138, 24, 10, '#0A0614'); R(g, 196, 148, 88, 4, '#0A0614'); soft(G, 240, 84, 100, '#3A5AC8', .5);
    [[40, 60, '#FF5AA8', '唱'], [392, 56, '#5AE0FF', '歌']].forEach(([x, y, c, s]) => { R(g, x - 3, y - 3, 30, 30, '#1A0E30'); for (let i = 0; i < 24; i += 2) { R(g, x - 3 + i + 3, y - 3, 1, 1, c); R(g, x - 3 + i + 3, y + 26, 1, 1, c); } ptext(g, s, x, y, c, { s: 2 }); ptext(G, s, x, y, c, { s: 2 }); });
    [[110, 60], [354, 60]].forEach(([x, y]) => { R(g, x, y, 26, 44, '#0A0614'); disc(g, x + 13, y + 14, 8, '#3A2A4A'); disc(g, x + 13, y + 14, 3, '#0A0614'); disc(g, x + 13, y + 33, 5, '#3A2A4A'); });
    // 沙发、茶几
    R(g, 20, 176, 440, 30, '#7A2A48'); R(g, 20, 168, 440, 10, '#9A3A5A'); R(g, 20, 168, 440, 2, '#C05A7A'); for (let x = 30; x < 460; x += 44) R(g, x, 180, 1, 24, '#5A1E36'); R(g, 14, 172, 12, 40, '#9A3A5A'); R(g, 454, 172, 12, 40, '#9A3A5A');
    R(g, 150, 218, 180, 8, '#2A2438'); R(g, 150, 218, 180, 1, '#6A6A88'); R(g, 160, 226, 6, 22, '#1A1420'); R(g, 314, 226, 6, 22, '#1A1420');
    [[170, '#E0A040'], [186, '#E0A040'], [206, '#5AB8FF'], [280, '#E0423A'], [300, '#E0A040']].forEach(([x, c]) => { R(g, x, 206, 7, 12, c); R(g, x, 206, 7, 3, '#FFFFFF'); }); ell(g, 240, 214, 16, 4, '#F4EAD8'); for (let i = 0; i < 7; i++) R(g, 228 + i * 4, 210, 3, 3, ['#E0423A', '#FFE066', '#5ADB7A'][i % 3]);
  });
}
function ktv(g, G, t) { put2(g, G, ktvBuf()); R(g, 0, PH, PW, 16, '#3E1E58'); const bx = 240, by = 10; R(g, bx, 0, 1, by, '#8A8AA8'); disc(g, bx, by + 8, 9, '#C8C8E0'); for (let i = 0; i < 12; i++) { const a = t * 1.2 + i * .52, x = bx + Math.cos(a) * 7, y = by + 8 + Math.sin(a * 2) * 6; R(g, x, y, 2, 2, i % 2 ? '#FFFFFF' : '#8A8AC8'); } soft(G, bx, by + 8, 14, '#FFFFFF', .7); for (let i = 0; i < 26; i++) { const a = t * .7 + i * 1.9, x = 240 + Math.cos(a) * (130 + (i % 5) * 26), y = 100 + Math.sin(a * 1.3 + i) * 90, c = BULBS[i % 5]; if (y < 4 || (x > 150 && x < 330 && y > 30 && y < 138)) continue; R(g, x, y, 4, 3, c); soft(G, x + 2, y + 1, 7, c, .8); } }

/* ---------- 纯界面的底：深蓝渐变 + 斜着流动的格子 ---------- */
function uiBG(g, t, c0 = '#0A1030', c1 = '#1A2460') { put(g, cache('uibg' + c0 + c1, PW, PH, c => vgrad(c, 0, 0, PW, PH, [c0, mix(c0, c1, .5), c1]))); g.fillStyle = lt(c1, .08); const o = (t * 8) % 32; for (let y = -32; y < PH + 32; y += 32) for (let x = -32; x < PW + 32; x += 32) { g.fillRect(Math.round(x + o), Math.round(y + o), 2, 2); g.fillRect(Math.round(x + o + 16), Math.round(y + o + 16), 1, 1); } }
