'use strict';
/* shots2.js：后半段的镜头（怜余来安座下 → 不敢沾染佛前茶 → 只作凡人赴雪月风花）。 */

/* ---------- 9. 怜余来：两位仙人围过来，心一颗颗冒出来；"余"字一拍摸一下头，"来"字招招手，一朵云垫子飘过来 ---------- */
function shotPity(g, t) {
  const w = 108, h = 192, b = pbuf('pity', w, h);
  const tA = CT(4, 0), tB = CT(4, 1), tC = CT(4, 2);
  const fy = 140;
  pbands(b, 0, w, [[0, '#2A1650'], [30, '#4A2470'], [60, '#8A3A7A'], [92, '#D8708A'], [118, '#F4B08A'], [h, '#F4B08A']]);
  stars(b, w, 50, t, 31, 30);
  hall(b, 54, 98, .6); cloudSea(b, w, 94, 30, t, { r: 5, seed: 41, drift: 1, pal: CLOUD_PINK });
  xiangyun(b, 24 + t, 58, .9); xiangyun(b, 88 - t, 36, .7, PAL.cloud, true);
  cloudSea(b, w, fy - 6, h - fy + 6, t, { r: 7, seed: 42, drift: -1.5, pal: CLOUD_PINK });
  const L = 28, M = 54, Rr = 80;
  [[L, '#F6A5C0', 1], [Rr, '#8FE3D0', -1]].forEach(([cx, col, side]) => {
    ribbon(b, cx + side * -12, fy - 12, t, { len: 20, col, dir: -side, ph: cx });
    halo(b, cx, fy - 16, t);
  });
  let lArms = 'n', rArms = 'n';
  if (t >= tB) rArms = 'upL';
  if (t >= tC) lArms = 'beckon';
  clawdAt(b, L, fy, { col: TONES.gold, eyes: 'closed', arms: lArms, blush: true });
  clawdAt(b, Rr, fy, { col: TONES.gold2, eyes: 'closed', arms: rArms, blush: true }, true);
  // 小怪（还穿着戏服）：先低着头，被摸着头眯眼，"来"字笑了
  const o = { powder: true, robe: true, crown: true, eyes: t < tB ? 'dn' : 'happy', blush: t >= tC };
  if (t >= tB && t < tC) o.eyes = kick(t, .2) > .3 ? 'shut' : 'dn';
  clawdAt(b, M, fy, o);
  if (t >= tB) {                                                         // 摸头：右边仙人伸过来一只金色的手，一拍按一下
    const pat = kick(t, .22) > .3 ? 2 : 0;
    pline(b, Rr - 12, fy - 12, M + 8, fy - 24 + pat, TONES.gold2); pline(b, Rr - 12, fy - 11, M + 8, fy - 23 + pat, TONES.gold2);
    prect(b, M + 1, fy - 25 + pat, 8, 3, TONES.gold2); prect(b, M + 1, fy - 25 + pat, 8, 1, '#FFF0A8');
  }
  for (let i = 0; i < 6; i++) {                                          // 心
    const t0 = tA + i * .22, age = t - t0; if (age < 0 || age > 1.6) continue;
    const x = (i % 2 ? Rr : L) + Math.sin(age * 4 + i) * 3, y = fy - 26 - age * 22;
    heart(b, x, y, 1, i % 3 ? '#FF6F91' : '#FF9AB0');
  }
  if (t >= tC) { const u = E.out(seg(t, tC, tC + .7)); cloudCushion(b, lerp(-20, M, u), fy + 14 + Math.round(Math.sin(t * 4))); }   // 云垫子飘进来
  blitAt(g, 'pity', 11, 56, 100);
}

/* ---------- 10. 安座下：一排仙人在蒲团上入定，小怪挤进去盘腿坐下，"下"字闭眼合掌——隔一拍偷偷睁一只眼 ---------- */
function shotSit(g, t) {
  const w = 135, h = 240, b = pbuf('sit', w, h);
  const tB = CT(4, 4), tC = CT(4, 5);
  const fy = 172;
  pbands(b, 0, w, [[0, '#3A1220'], [40, '#5A1E2A'], [130, '#6E2632'], [h, '#6E2632']]);
  prect(b, 22, 60, 28, 46, '#8A5A22'); prect(b, 24, 62, 24, 42, '#FFD884');   // 左边一扇格子窗
  for (let i = 0; i < 5; i++) { prect(b, 24, 62 + i * 8 + 4, 24, 1, '#8A5A22'); prect(b, 24 + i * 5 + 2, 62, 1, 42, '#8A5A22'); }
  pbeam(b, 36, 106, 24, 70, fy, 60, '#FFE9B0', .14);
  for (const x of [8, 118]) { prect(b, x, 0, 9, fy, PAL.verm.m); prect(b, x + 7, 0, 2, fy, PAL.verm.d); prect(b, x - 1, fy - 6, 11, 6, PAL.gold.d); }
  prect(b, 0, 0, w, 10, '#3A1E1A'); for (let x = 3; x < w; x += 7) prect(b, x, 4, 3, 2, PAL.gold.m);
  // 供桌、香炉和烟
  prect(b, 52, 138, 32, 4, '#4A1A14'); prect(b, 52, 138, 32, 1, PAL.gold.d); prect(b, 54, 142, 3, 12, '#3A1210'); prect(b, 79, 142, 3, 12, '#3A1210');
  pell(b, 68, 132, 8, 5, '#8A6420'); prect(b, 60, 125, 17, 3, '#C99A3A'); pdot(b, 64, 124, '#C99A3A'); pdot(b, 72, 124, '#C99A3A');
  for (let i = 0; i < 60; i++) { const u = i / 60, x = 68 + Math.sin(t * 2 + u * 9) * (2 + u * 7), y = 122 - u * 66; palpha(b, .75 - u * .5, () => prect(b, x, y, 2 + Math.floor(u * 2), 2, u < .6 ? '#E8DCEC' : '#B8A8C4')); }
  prect(b, 0, fy, w, h - fy, '#4A2418'); for (let x = 0; x < w; x += 15) prect(b, x, fy, 1, h - fy, '#3A1A10'); prect(b, 0, fy, w, 1, '#6A3A24');
  const foot = 190;
  for (const [cx, col] of [[40, TONES.gold], [96, TONES.gold2]]) {        // 两边入定的仙人
    cushion(b, cx, foot + 6); halo(b, cx, foot - 18, t, 1);
    clawdAt(b, cx, foot, { col, eyes: 'closed', pose: 'lotus', arms: 'pray' });
  }
  // 小怪：安——站在中间的蒲团前左看右看；座——坐下去，蒲团一扁；下——闭眼合掌，隔一拍偷偷睁眼
  cushion(b, 68, foot + 6, 1, '#C9485A');
  const o = { powder: true, robe: true, crown: true };
  let cy = foot;
  if (t < tB) o.eyes = Math.floor(beatOf(t)) % 2 ? 'l' : 'r';
  else {
    o.pose = 'lotus'; o.arms = 'n'; o.eyes = 'n';
    if (t < tB + .1) cy += 1;
    if (t >= tC) { o.arms = 'pray'; o.eyes = Math.floor(beatOf(t) - beatOf(tC) + .5) % 2 ? 'r' : 'closed'; }
  }
  clawdAt(b, 68, cy, o);
  blitAt(g, 'sit', 10, 68, 146);
}

/* 佛爷：放大 4 倍的金色小怪，盘腿合掌，身后一圈圈光环和光芒，额头一点白毫 */
function buddha(b, cx, foot, t, s = 4) {
  const hy = foot - 48;
  pglow(b, cx, hy, 78, '#FFE9B0', .35);
  rays(b, cx, hy, 50, 110, 24, t * .2, '#FFF0B0', .3);
  for (let k = 0; k < 4; k++) pring(b, cx, hy, 50 + k * 7, 50 + k * 7, k % 2 ? '#FFE58A' : '#F2C14E', 2);
  pdisc(b, cx, hy, 47, '#FFE9B0'); pdisc(b, cx, hy, 43, '#FFF4CC');
  for (let i = -3; i <= 3; i++) { const x = cx + i * 13; pell(b, x, foot + 6, 8, 7, i % 2 ? '#F6A5C0' : '#FFD0E0'); pell(b, x, foot + 3, 5, 4, '#FFFFFF'); }   // 莲台
  pell(b, cx, foot + 12, 46, 4, '#D47A98');
  clawdAt(b, cx, foot, { col: TONES.gold, eyes: 'closed', pose: 'lotus', arms: 'pray' }, false, s);
  pdisc(b, cx, foot - 64 + 8 + 3, 1, '#E8453C');
}
/* 青瓷茶碗：(cx, by) 碗底中点，s 大小 */
function teaCup(b, cx, by, s = 1, t = 0, o = {}) {
  const cel = '#9FD6C8', cd = '#6FB0A2', cl = '#D6F2EA';
  pell(b, cx, by - 4 * s, 9 * s, 5 * s, cd);
  pell(b, cx, by - 5 * s, 9 * s, 5 * s, cel);
  prect(b, cx - 9 * s, by - 9 * s, 18 * s + 1, 4 * s, cel);
  pell(b, cx, by - 9 * s, 9 * s, 2 * s, cl);
  pell(b, cx, by - 9 * s, 8 * s, Math.max(1, 1.5 * s), '#E8B84A');                // 金色的茶汤
  if (o.moon) pdisc(b, cx + 3 * s, by - 9 * s, Math.max(0, s - 1), '#FFF8E0');     // 茶汤里映着一个小月亮
  prect(b, cx - 3 * s, by - 1, 6 * s + 1, 1, cd);
  prect(b, cx - 7 * s, by - 7 * s, 1, 4 * s, cl);
  for (let i = 0; i < 3; i++) for (let k = 0; k < 18 * s; k++) {                   // 热气：金色的细烟
    const u = k / (18 * s), x = cx + (i - 1) * 3 * s + Math.sin(t * 3 + u * 6 + i * 2) * 2 * s, y = by - 11 * s - k;
    if ((k + Math.floor(t * 10)) % 3) pdot(b, x, y, u < .5 ? '#FFF0B0' : '#F2D9A8');
  }
}
function teapot(b, cx, by, tilt) {
  const cel = '#9FD6C8', cd = '#6FB0A2';
  b.save(); b.translate(cx, by - 6); b.rotate(tilt); b.translate(-cx, -(by - 6));
  pell(b, cx, by - 6, 8, 6, cel); pell(b, cx - 1, by - 7, 5, 3, '#C8EDE3'); prect(b, cx - 4, by - 13, 8, 2, cd); prect(b, cx - 1, by - 15, 2, 2, cd);
  pline(b, cx + 7, by - 6, cx + 12, by - 10, cd); pline(b, cx + 7, by - 5, cx + 12, by - 9, cel);
  pring(b, cx - 9, by - 7, 3, 3, cd);
  b.restore();
}

/* ---------- 11. 不敢沾染：大佛爷入定，茶壶自己一抖一抖地斟茶（"佛前茶抖腕"），"染"字茶碗滑到小怪面前，小怪直冒汗、一拍退一步 ---------- */
function shotBuddha(g, t) {
  const w = 180, h = 320, b = pbuf('buddha', w, h);
  const tB = CT(5, 1), tC = CT(5, 2), tD = CT(5, 3);
  pbands(b, 0, w, [[0, '#2A1236'], [60, '#4A1E4A'], [130, '#8A3A5A'], [190, '#D07A5A'], [236, '#F2B880'], [h, '#F2B880']]);
  stars(b, w, 50, t, 51, 40);
  buddha(b, 112, 160, t, 4);
  const ty = 204;                                                        // 茶桌、茶壶、茶碗
  prect(b, 30, ty, 142, 6, '#4A2A1E'); prect(b, 30, ty, 142, 1, '#C99A3A'); prect(b, 36, ty + 6, 4, 18, '#3A1E14'); prect(b, 162, ty + 6, 4, 18, '#3A1E14');
  const pour = t >= tC && t < tD + .1;
  const tilt = pour ? (Math.floor(beatOf(t) * 2) % 2 ? .55 : .35) : 0;
  teapot(b, 126, ty, tilt);
  if (pour) for (let y = ty - 9; y < ty - 3; y++) pdot(b, 139 + (y - ty + 9) * .5, y, '#E8B84A');
  const cupX = t < tD ? 142 : lerp(142, 74, E.io(seg(t, tD, tD + .3)));
  teaCup(b, cupX, ty, 1, t);
  const back = t >= tD ? Math.min(4, Math.floor((t - tD) / BEAT * 2)) : 0;
  clawdAt(b, 46 - back, 236, { powder: true, robe: true, crown: true, eyes: t < tB ? 'up' : 'wide', sweat: t >= tB, mouth: 'wobble' });
  blitAt(g, 'buddha', 7, 100, 160);
}

/* ---------- 12. 佛前茶：茶碗和小怪的特写。两只手一上一下地抖（"抖腕"），"茶"字伸手把碗推回去 ---------- */
function shotTea(g, t) {
  const w = 68, h = 120, b = pbuf('tea', w, h);
  const tB = CT(5, 5), tC = CT(5, 6);
  pbands(b, 0, w, [[0, '#3A1A36'], [30, '#6A2A44'], [64, '#B85A54'], [92, '#F2B880'], [h, '#F2B880']]);
  rays(b, 34, -10, 10, 120, 12, t * .1, '#FFE9B0', .18);
  prect(b, 0, 98, w, 22, '#4A2A1E'); prect(b, 0, 98, w, 1, '#C99A3A'); prect(b, 0, 99, w, 1, '#6A4030');
  const cupX = t < tC + .05 ? 20 : lerp(20, 10, E.out(seg(t, tC + .05, tC + .3)));
  teaCup(b, cupX, 99, 1, t, { moon: true });
  const o = { powder: true, robe: true, crown: true, eyes: 'wide', sweat: true, mouth: 'wobble' };
  let flip = false;
  if (t >= tB) o.arms = Math.floor(beatOf(t) * 2) % 2 ? 'flipA' : 'flipB';
  if (t >= tC) { o.arms = 'poke'; flip = true; o.eyes = 'squint'; }
  clawdAt(b, 46, 98, o, flip);
  sparkle(b, cupX + 9, 86, seg(t, tC + .05, tC + .4), '#FFFFFF');
  blit(g, 'tea', 16);
}

/* 云台：脚下一大片软云，右边是云的边缘（再往外就是天的外面） */
function cloudLedge(b, x1, top, h, t) {
  const P = CLOUD_PINK;
  for (let x = 0; x <= x1; x++) {
    const edge = x > x1 - 10 ? Math.pow(x - (x1 - 10), 2) * .35 : 0;
    const y = Math.round(top + Math.sin(x * .35 + t) * 1.2 + edge);
    prect(b, x, y, 1, h, P.base); pdot(b, x, y, P.hi);
    if (x % 4 === 0) pdot(b, x, y + 3, P.sh);
  }
  for (let x = 4; x < x1; x += 9) puff(b, x, top + 1, 4, P);
  for (let y = top + 4; y < top + h; y += 8) puff(b, x1 - 2 + Math.sin(y) * 1.5, y, 5, P);
}
/* ---------- 13. 只作凡人：在云边上朝佛爷一拜，"作"字行头全飞了，变回原来的样子，"凡"转身，"人"往云边跑 ---------- */
function shotLeave(g, t) {
  const w = 108, h = 192, b = pbuf('leave', w, h);
  const tB = CT(6, 1), tC = CT(6, 2), tD = CT(6, 3);
  pbands(b, 0, w, [[0, '#0E0A26'], [50, '#1A1240'], [110, '#22184A'], [150, '#1C2850'], [h, '#14203E']]);
  stars(b, w, 150, t, 61, 80);
  pglow(b, 92, 150, 26, '#FFC861', .25);                                  // 云外面：远远的人间，月亮和灯火
  moon(b, 90, 112, 9, t);
  for (let i = 0; i < 14; i++) pdot(b, 76 + hash(i, 2) * 30, 156 + hash(i, 3) * 14, i % 3 ? '#FFC861' : '#FFE8A8');
  for (let x = 70; x < 104; x += 7) puff(b, x, 60, 5, CLOUD_PINK);       // 右上角的云岛和宫殿
  hall(b, 86, 57, .55);
  cloudLedge(b, 78, 140, 52, t);
  const o = {};
  let cx = 34, flip = false;
  if (t < tB) { Object.assign(o, { powder: true, robe: true, crown: true, pose: 'bow', arms: 'pray', eyes: 'closed' }); flip = true; }
  else if (t < tC) { o.eyes = 'happy'; o.arms = 'up'; }
  else if (t < tD) { o.eyes = 'r'; o.mouth = 'smile'; }
  else { o.eyes = 'happy'; o.mouth = 'smile'; o.legs = walkLegs(t, 10); cx = lerp(34, 72, E.in(seg(t, tD, tD + .45))); }
  clawdAt(b, cx, 142, o, flip);
  if (t >= tB) {                                                         // 行头往天上飞走：戏服、金冠打着转
    const u = t - tB;
    const rx = 34 - u * 28, ry = 130 - u * 66 + 56 * u * u;
    b.save(); b.translate(rx, ry); b.rotate(u * 6);
    prect(b, -8, -4, 16, 8, '#C8323A'); prect(b, -8, 3, 16, 1, '#8E1F2A'); prect(b, -8, -4, 16, 1, '#F2C14E');
    b.restore();
    const kx = 38 + u * 22, ky = 124 - u * 76 + 66 * u * u;
    prect(b, kx - 5, ky, 10, 2, '#F2C14E'); prect(b, kx - 1, ky - 2, 2, 2, '#FF6F91');
    if (u < .4) for (let i = 0; i < 6; i++) puff(b, 34 + Math.cos(i) * u * 30, 130 + Math.sin(i) * u * 20, Math.round(4 * (1 - u / .4)) + 1);
  }
  blitAt(g, 'leave', 12, 54, 104);
}

/* ---------- 14. 赴：从云边纵身一跳，身后一轮大月亮 ---------- */
function shotLeap(g, t) {
  const w = 135, h = 240, b = pbuf('leap', w, h);
  const tA = CT(6, 4), tB = CT(6, 5);
  skyNight(b, w, h, t, { seed: 71 });
  moon(b, 84, 128, 44, t);
  prect(b, 0, 114, 30, 40, CLOUD_PINK.base);                             // 左边的云边
  for (let i = 0; i < 4; i++) puff(b, 4 + i * 8, 114 - (i % 2), 6, CLOUD_PINK);
  for (let y = 120; y < 156; y += 8) puff(b, 30, y, 5, CLOUD_PINK);
  const u = seg(t, tA, tB);
  const cx = lerp(26, 84, u), foot = 114 - 16 * Math.sin(u * Math.PI * .8) + 60 * u * u;
  for (let i = 0; i < 7; i++) { const sx = cx - 12 - i * 6, sy = foot - 8 - i * 4 + (i % 3) * 3; pline(b, sx, sy, sx - 6, sy - 3, '#C9D6F0'); }
  clawdAt(b, cx, foot, { arms: 'up', eyes: 'happy', mouth: 'smile', legs: 1 });
  blitAt(g, 'leap', 10, 66, 118);
}

/* ---------- 15. 雪、月：往人间落，雪花一起飘下来，"月"字一轮满月升起来 ---------- */
function shotFall(g, t) {
  const w = 135, h = 240, b = pbuf('fall', w, h);
  const tA = CT(6, 5), tB = CT(6, 6);
  skyNight(b, w, h, t, { seed: 81 });
  const mu = E.out(seg(t, tB, tB + .55));                                // "月"：满月从下面升上来
  if (t >= tB - .1) moon(b, 94, lerp(220, 96, mu), 24, t);
  for (let i = 0; i < 7; i++) {                                          // 往下掉：薄云一缕缕往上飞过去
    const y = h + 20 - ((t - tA) * 240 + i * 60) % (h + 80);
    const x = (i * 53) % w;
    palpha(b, .35, () => { pell(b, x, y, 16 + (i % 3) * 4, 5, '#AEBBD8'); pdisc(b, x - 6, y - 3, 5, '#C8D4EA'); pdisc(b, x + 5, y - 4, 6, '#C8D4EA'); });
  }
  for (let i = 0; i < 16; i++) {                                         // 速度线
    const x = 20 + hash(i, 4) * 95, y = h - ((t - tA) * 420 + hash(i, 5) * h) % h;
    prect(b, x, y, 1, 10, 'rgba(200,214,240,.55)');
  }
  snowfall(b, w, h, t, { n: 100, spd: -26, wind: 6, seed: 82, big: .25 });
  const wob = Math.round(Math.sin(t * 9) * 2);
  clawdAt(b, 64 + wob, 150, { arms: 'up', eyes: t < tB ? 'happy' : 'up', mouth: t < tB ? 'smile' : 'o', legs: Math.floor(t * 8) % 2 + 1 }, Math.floor(beatOf(t)) % 2 === 1);
  blitAt(g, 'fall', 12, 66, 130);
}

/* ---------- 16. 风、花：一阵风把雪和花瓣吹斜，小怪"噗"地落进雪里；"花"字一拍开一簇梅花；坐在雪里看月亮 ---------- */
function shotSnow(g, t) {
  const w = 135, h = 240, b = pbuf('snow', w, h);
  const tA = CT(6, 7), tB = CT(6, 8);
  skyNight(b, w, h, t, { seed: 91 });
  moon(b, 96, 80, 24, t);
  town(b, w, 162, t, { seed: 5 });
  snowHill(b, w, 170, 70, t, { amp: 3 });
  prect(b, 12, 134, 7, 106, '#3A2630'); prect(b, 13, 134, 2, 106, '#5A3A44');   // 梅树：花一拍开一簇（树干在画面左边外面一点）
  const bloom = t < tB ? 0 : clamp((Math.floor((t - tB) / BEAT) + 1) / 5);
  plumBranch(b, 18, 140, 78, 1, t, bloom, 3, .22);                        // 枝子压低一点，花开在歌词下面
  plumBranch(b, 16, 152, 46, 1, t, bloom, 8, .1);
  const wind = t < tA ? 4 : lerp(70, 6, seg(t, tA + .3, tA + 1.6));     // 风：一阵横着的风线，雪被吹斜，慢慢停下来
  if (t >= tA && t < tA + 1.4) for (let i = 0; i < 10; i++) {
    const y = 30 + hash(i, 7) * 150, x = ((t - tA) * 260 + hash(i, 8) * 200) % (w + 80) - 40;
    pline(b, x, y, x + 18 + hash(i, 9) * 16, y, i % 2 ? '#E2EAF7' : '#B8C8E4');
  }
  snowfall(b, w, h, t, { n: 110, spd: 16, wind, seed: 92, big: .2 });
  if (t >= tB) for (let i = 0; i < 16; i++) {                            // 花瓣跟着风飘
    const age = t - tB - i * .12; if (age < 0) continue;
    const x = 30 + hash(i, 11) * 70 + age * (12 + wind * .3), y = 120 + hash(i, 12) * 30 + age * 14 + Math.sin(age * 5 + i) * 3;
    if (x < w && y < h) { pdot(b, x, y, '#FF9AB0'); pdot(b, x + 1, y, '#F04E6A'); }
  }
  // 小怪：从天上落下来，"噗"地坐进雪里，抬头看月亮，"花"字笑了
  const land = tA + .42;
  const u = E.in(seg(t, tA, land));
  const foot = t < land ? lerp(-10, 188, u) : 188;
  const o = t < land ? { arms: 'up', eyes: 'happy', legs: 1 } : { pose: 'sit', eyes: t < tB ? 'up' : 'happy', mouth: t < tB ? 'o' : 'smile', blush: t >= tB };
  clawdAt(b, 72, foot, o);
  const pu = seg(t, land, land + .5);
  if (pu > 0 && pu < 1) for (let i = 0; i < 8; i++) { const a = Math.PI + i / 7 * Math.PI; puff(b, 72 + Math.cos(a) * pu * 20, 186 + Math.sin(a) * pu * 8, Math.round(4 * (1 - pu)) + 1, { hi: '#FFFFFF', base: PAL.snow.l, sh: PAL.snow.d }); }
  blitAt(g, 'snow', 10, 70, 144);
}
