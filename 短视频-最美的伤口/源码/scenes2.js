'use strict';
/* scenes2.js：副歌（回忆，暖色）和结尾
   S9  回忆：牵着手走在热闹的夜市街上（侧面，横着走）     第 9 小节
   S10 回忆：同一条长街，灯全亮着、满街的人，两个人朝镜头走来（和 S6 那条空街对照）  第 10 小节
   S11 灯笼飘起来，两个人也飘起来，云里游出一条鲸鱼接住他们   第 11 小节
   S12 鲸鱼驮着两个人游过大月亮，远处是浮空的城堡（"遨游"）    第 12 小节
   S13 世界尽头的浮岛：走着走着，你化成粉色的光点散了，手里空了  第 13 小节
   S14 我一个人走到世界的边上                                第 14 小节
   S15 特写：心裂开，光点飞回来，把裂缝填成金色               第 15 小节
   S16 日出，金色裂缝的心在发光；天上的光点连成你的样子；片尾  第 16 小节 ~ 结束 */

const MEMT = '#FFF0E6';           // 回忆里给角色乘的颜色（几乎不变，略暖）
const CROWD = ['#6E9BD6', '#68BC8A', '#A88BD8', '#DDB04F', '#55B7B5', '#A3A9B4', '#E0956A'];
const NEON = ['#FF5FA2', '#4FF0FF', '#FFE45E', '#7CFF8F', '#B98CFF'];
const walkLeg = (t, ph = 0) => [1, 0, 2, 0][Math.floor(t * 6 + ph) % 4];

/* 霓虹招牌：深色底板 + 亮色的字，字也画进光层 */
function neonSign(b, gl, x, y, text, col, t, i) {
  const tw = textW12(text) + 4, on = (Math.floor(t * 9 + i * 3.7) % 23 === 0) ? .35 : 1;   // 偶尔闪一下
  prect(b, x - 2, y - 2, tw + 2, 15, '#1A0E26');
  pline(b, x - 2, y - 2, x + tw - 1, y - 2, rgba(col, .7)); pline(b, x - 2, y + 12, x + tw - 1, y + 12, rgba(col, .7));
  ptext(b, text, x, y - 1, 1, on > .5 ? '#FFFFFF' : shade(col, .6));
  if (gl) { gl.save(); gl.globalAlpha = on; ptext(gl, text, x, y - 1, 1, col); prect(gl, x - 2, y - 2, tw + 2, 15, rgba(col, .18)); gl.restore(); }
}
/* 一串彩灯：两点之间垂下来的弧线，灯泡轮流亮 */
function stringLights(b, gl, x0, y0, x1, y1, sag, t, seed) {
  const n = Math.max(2, ri(Math.abs(x1 - x0) / 7));
  let px = null;
  for (let i = 0; i <= 40; i++) { const u = i / 40, x = lerp(x0, x1, u), y = lerp(y0, y1, u) + Math.sin(u * Math.PI) * sag; if (px) pline(b, px[0], px[1], x, y, '#3A2A48'); px = [x, y]; }
  for (let i = 1; i < n; i++) {
    const u = i / n, x = lerp(x0, x1, u), y = lerp(y0, y1, u) + Math.sin(u * Math.PI) * sag + 1;
    const c = NEON[(i + seed) % NEON.length], on = (Math.floor(t * 3) + i) % 3 !== 0 ? 1 : .45;
    pdot(b, x, y, on > .5 ? shade(c, 1.3) : shade(c, .6)); if (gl) pdot(gl, x, y, rgba(c, on));
  }
}
/* 路人小怪：颜色按编号轮换，dir 朝向（只影响眼睛），有的拿气球 */
function passer(b, x, y, i, t, dir, tint = null) {
  const col = CROWD[i % CROWD.length];
  if (i % 5 === 2) { pline(b, x + (dir > 0 ? 22 : 2), y - 1, x + (dir > 0 ? 24 : 0), y - 12, '#C8C0D8'); pdisc(b, x + (dir > 0 ? 24 : 0), y - 15, 3, NEON[i % NEON.length]); }
  drawMon(b, x, y, { col, eyes: dir > 0 ? 'r' : 'l', legs: walkLeg(t, i), blush: i % 3 === 0 ? 1 : 0 }, 1, tint);
}
function tinyHeart(b, x, y, col = '#FF6F91') { prect(b, x, y, 2, 1, col); prect(b, x + 3, y, 2, 1, col); prect(b, x, y + 1, 5, 1, col); prect(b, x + 1, y + 2, 3, 1, col); pdot(b, x + 2, y + 3, col); }

/* ================= S9：回忆，夜市街（侧面） ================= */
function S9(g, t) {
  const t0 = bar(9), lt = t - t0;
  const w = 320, h = 180, P = 6, gy = 120;
  const cf = 6 + lt * 3, cm = 10 + lt * 16;
  // 远景：紫红的夜空 + 远处的楼（窗户多、亮）
  const bf = pbuf('s9f', w + 30, h);
  psky(bf, w + 30, 90, [[0, '#1A0B33'], [.6, '#3E1656'], [1, '#7A2E66']]);
  for (let i = 0; i < 40; i++) pdot(bf, hash(i, 91) * (w + 30), hash(i, 92) * 50, hash(i, 93) > .5 ? '#FFF6D8' : '#C8B8F0');
  pspr(bf, skyline(w + 30, 80, 95, '#2A1440', 60, .22), 0, 0);
  // 中景：一排店面、招牌、彩灯、灯笼、人行道和后排路人
  const bm = pbuf('s9m', w + 80, h), gm = glowBuf('s9m', w + 80, h);
  prect(bm, 0, 36, w + 80, gy - 36, '#2A1840');
  const shops = [['甜品', '#FF5FA2'], ['电影院', '#4FF0FF'], ['奶茶', '#FFE45E'], ['花店', '#FF8FD0'], ['KTV', '#7CFF8F'], ['烧烤', '#FFB45E'], ['书店', '#B98CFF']];
  for (let i = 0; i < 8; i++) {
    const x = i * 52 - 8, sh = shops[i % shops.length];
    prect(bm, x, 42, 50, gy - 42, i % 2 ? '#2F1C48' : '#341F50');
    prect(bm, x + 4, 80, 42, gy - 80, '#4A2E5E');
    prect(bm, x + 6, 84, 38, gy - 86, '#FFD08A'); prect(bm, x + 6, 84, 38, 4, '#FFE0A8');
    for (let k = 0; k < 3; k++) prect(bm, x + 10 + k * 12, 94 + (k % 2) * 4, 6, gy - 96 - (k % 2) * 4, '#C9805A');   // 橱窗里的东西
    prect(gm, x + 6, 84, 38, gy - 86, 'rgba(255,190,110,.35)');
    for (let k = 0; k < 3; k++) prect(bm, x + 8 + k * 14, 48, 8, 10, (i + k) % 3 ? '#FFC870' : '#3A2450');   // 楼上的窗
    neonSign(bm, gm, x + 8, 64, sh[0], sh[1], t, i);
    for (let k = 0; k < 50; k += 6) prect(bm, x + k, 76, 3, 4, k % 12 ? sh[1] : '#FFF2E0');                      // 遮阳篷
  }
  for (let i = 0; i < 9; i++) stringLights(bm, gm, i * 52 - 34, 38, i * 52 + 18, 38, 7, t, i);
  for (let i = 0; i < 9; i++) { const x = i * 52 - 8 + 22, y = 46 + Math.sin(t * 2 + i) * .6; pspr(bm, lantern(), x, y); pdisc(gm, x + 2, y + 3, 4, 'rgba(255,90,70,.6)'); }
  prect(bm, 0, gy, w + 80, h - gy, '#3A2448'); prect(bm, 0, gy, w + 80, 2, '#6A3E6A');
  for (let i = 0; i < 8; i++) for (let y = gy + 3; y < h; y += 3) {                    // 湿地上橱窗的倒影：一截一截的竖条
    const u = (y - gy) / (h - gy), wd = 18 + ri(Math.sin(y * 1.7 + i) * 3);
    prect(bm, i * 52 + 25 - wd / 2, y, wd, 2, rgba(i % 2 ? '#FF8FB4' : '#FFD08A', .2 * (1 - u)));
  }
  for (let i = 0; i < 9; i++) {
    const dir = i % 2 ? 1 : -1, sp = 8 + (i % 3) * 4, x = ((i * 47 + dir * sp * lt) % (w + 80) + (w + 80)) % (w + 80);
    const sx = x - cm;                                                                      // 在屏幕上的位置
    if (sx > 84 && sx < 216) continue;                                                      // 主角身后不画（不然像戴了帽子）
    passer(bm, x, gy - 14, i, t, dir, '#D8C0E0');
  }
  // 主角层：两个人在前面（离镜头近，2 倍大），牵着手往右走
  const bc = pbuf('s9c', w, h), gc = glowBuf('s9c', w, h);
  const k = 2, mx = 108, my = 140 - 32;
  pell(bc, mx + 48, 141, 54, 3, 'rgba(20,0,30,.4)');
  drawMon(bc, mx, my, { eyes: 'r', legs: walkLeg(t), blush: 1 }, k, MEMT);
  drawMon(bc, mx + 48, my, { col: MON.you, flower: 1, eyes: t > ch(5, 3) + .1 ? 'happy' : 'l', legs: walkLeg(t, 2), blush: 1 }, k, MEMT);
  const hu = t - ch(5, 3);                                   // "牵着"：两只手碰到一起，冒出一颗心
  if (hu > 0 && hu < 1.6) { const y = my - 6 - hu * 12; bc.save(); bc.globalAlpha = clamp(1.6 - hu); tinyHeart(bc, mx + 46, y); bc.restore(); pdisc(gc, mx + 48, y + 1, 3, 'rgba(255,110,150,.6)'); }
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  blit(g, 's9f', P, cf); blit(g, 's9m', P, cm); glowBlit(g, 's9m', P, cm, 0, .9, 2.5);
  blit(g, 's9c', P); glowBlit(g, 's9c', P, 0, 0, .8, 2);
}

/* ================= S10：回忆，同一条长街，灯全亮着，两个人朝镜头走来 ================= */
function S10(g, t) {
  const t0 = bar(10), lt = t - t0;
  const w = 320, h = 180, vx = 160, vy = 62, gy = 150, b = pbuf('s10', w, h), gl = glowBuf('s10', w, h);
  psky(b, w, vy + 10, [[0, '#1A0B33'], [.7, '#4A1A5E'], [1, '#8A3A6A']]);
  pspr(b, skyline(w, vy + 8, 101, '#2A1440', 34, .25), 0, 0);
  for (let y = vy; y < h; y++) {
    const u = (y - vy) / (gy - vy);
    prect(b, 0, y, w, 1, mix('#4A2A5A', '#2E1A3E', clamp(u)));
    const half = u * 90, sd = u * 150;
    prect(b, vx - sd, y, sd - half, 1, mix('#5A3468', '#3E2450', clamp(u)));
    prect(b, vx + half, y, sd - half, 1, mix('#5A3468', '#3E2450', clamp(u)));
  }
  // 镜头往后退：每样东西的深度随时间变大（两个人朝镜头走，大小不变）
  const zoff = lt * .55, items = [];
  for (let i = 0; i < 9; i++) for (const s of [-1, 1]) items.push({ z: 1.15 + i * .75 + zoff, s, i });
  items.sort((a, c) => c.z - a.z);
  for (const it of items) {
    const f = 1 / it.z, base = vy + (gy - vy) * f;
    const x = vx + it.s * 150 * f, bh = 150 * f, ww = 70 * f, x0 = it.s < 0 ? x - ww : x;
    prect(b, x0, base - bh, ww, bh, it.i % 2 ? '#2F1C48' : '#3A2254');
    prect(b, x0 + ww * .1, base - bh * .32, ww * .8, bh * .3, '#FFC880'); prect(gl, x0 + ww * .1, base - bh * .32, ww * .8, bh * .3, 'rgba(255,190,110,.3)');
    for (let k = 0; k < 3; k++) prect(b, x0 + ww * (.18 + k * .26), base - bh * .55, ww * .14, bh * .1, (it.i + k) % 2 ? '#FFC870' : '#2A1840');
    const c = NEON[(it.i + (it.s > 0 ? 2 : 0)) % NEON.length];
    prect(b, x0 + ww * .15, base - bh * .78, ww * .7, Math.max(1, bh * .1), c); prect(gl, x0 + ww * .15, base - bh * .78, ww * .7, Math.max(1, bh * .1), rgba(c, .8));
    const lx = vx + it.s * 96 * f, lh = 90 * f;
    prect(b, lx, base - lh, Math.max(1, ri(2 * f)), lh, '#4A3060');
    pdisc(b, lx, base - lh, Math.max(1, 2.4 * f), '#FFF2C8'); pdisc(gl, lx, base - lh, Math.max(2, 5 * f), 'rgba(255,220,150,.85)');
  }
  for (let i = 0; i < 7; i++) {                                // 头顶的彩灯：一排一排横过街
    const f = 1 / (1.3 + i * 1.1 + zoff), y = vy + (gy - vy) * f - 110 * f;
    if (y > -20) stringLights(b, gl, vx - 130 * f, y, vx + 130 * f, y, 14 * f, t, i);
  }
  for (let i = 0; i < 16; i++) {                               // 远处的人群：缩小的小怪
    const z = 1.6 + (i * .53 + zoff * (i % 2 ? .4 : 1.6)) % 7, f = 1 / z, x = vx + (hash(i, 7) - .5) * 160 * f, y = vy + (gy - vy) * f;
    const o = { col: CROWD[i % CROWD.length], legs: walkLeg(t, i) };
    b.save(); b.imageSmoothingEnabled = false; b.drawImage(tinted(monster(o), '#E8C8E0', JSON.stringify(o)), ri(x - (MOX + 12) * f), ri(y - (MOY + 16) * f), ri(MCW * f), ri(MCH * f)); b.restore();
  }
  // 两个人：朝镜头走（正面），手拉手，一颠一颠
  const k = 2, leg = walkLeg(t), bob = leg ? 0 : 1, mx = vx - 48, my = gy - 8 - 32 + bob;
  pell(b, vx, gy - 6, 52, 3, 'rgba(20,0,30,.35)');
  drawMon(b, mx, my, { eyes: 'happy', legs: leg, blush: 1 }, k, MEMT);
  drawMon(b, mx + 48, my, { col: MON.you, flower: 1, eyes: 'happy', legs: leg === 1 ? 2 : leg === 2 ? 1 : 0, blush: 1 }, k, MEMT);
  for (let i = 0; i < 24; i++) { const x = hash(i, 51) * w + Math.sin(t + i) * 8, y = (hash(i, 52) * h + t * 14 * (1 + hash(i, 53))) % h; pdot(b, x, y, NEON[i % NEON.length]); if (i % 3 === 0) pdot(gl, x, y, NEON[i % NEON.length]); }
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  blit(g, 's10', 6); glowBlit(g, 's10', 6, 0, 0, .9, 2.5);
}

/* ---------- 童话的天空（S11、S12 共用） ---------- */
function fairySky(b, w, h, t, seed) {
  psky(b, w, h, [[0, '#120A35'], [.45, '#2E1F6A'], [.8, '#6A3A8E'], [1, '#B05E9A']]);
  for (let i = 0; i < 90; i++) {
    const x = hash(i, seed) * w, y = hash(i, seed, 2) * h * .85, tw = .5 + .5 * Math.sin(t * (2 + hash(i, seed, 3) * 3) + i);
    pdot(b, x, y, tw > .6 ? '#FFF6D8' : '#9C8CD8');
    if (i % 11 === 0 && tw > .8) { pdot(b, x - 1, y, '#C8B8F0'); pdot(b, x + 1, y, '#C8B8F0'); pdot(b, x, y - 1, '#C8B8F0'); pdot(b, x, y + 1, '#C8B8F0'); }
  }
}
function cloud(b, x, y, s, col, hi) {
  const r = R(ri(x * 3 + y * 7));
  for (let i = 0; i < 6; i++) pell(b, x + (i - 2.5) * 9 * s, y - Math.sin(i / 5 * Math.PI) * 6 * s, (8 + r() * 5) * s, (5 + r() * 3) * s, col);
  pell(b, x, y + 2 * s, 30 * s, 4 * s, col);
  if (hi) for (let i = 0; i < 5; i++) pell(b, x + (i - 2) * 9 * s, y - Math.sin((i + .5) / 5 * Math.PI) * 6 * s - 3 * s, 5 * s, 2 * s, hi);
}
/* 浮空的小岛 + 城堡剪影 */
function castleIsland(b, gl, x, y, s, col, rock) {
  for (let i = -30; i <= 30; i++) { const d = ri((30 - Math.abs(i)) * .9 * s + 2); prect(b, x + i * s, y, Math.ceil(s), d, rock); }
  prect(b, x - 31 * s, y - 2, 62 * s, 3, '#5E9A7A');
  for (const [dx, th, tw2] of [[-14, 22, 5], [-5, 34, 6], [6, 28, 5], [15, 18, 4]]) {
    const tx = x + dx * s, top = y - th * s;
    prect(b, tx - tw2 * s / 2, top, tw2 * s, th * s, col);
    for (let k = 0; k < tw2 * s; k++) { const hh = ri((tw2 * s / 2 - Math.abs(k - tw2 * s / 2)) * 1.6); prect(b, tx - tw2 * s / 2 + k, top - hh, 1, hh, shade(col, .8)); }
    pdot(b, tx, top + 4 * s, '#FFE27A'); if (gl) pdot(gl, tx, top + 4 * s, '#FFD27A');
  }
  prect(b, x - 18 * s, y - 10 * s, 36 * s, 10 * s, col);
}

/* ================= S11：灯笼飘起来，人也飘起来，鲸鱼游上来接住 ================= */
function S11(g, t) {
  const t0 = bar(11), lt = t - t0, T = BARLEN;
  const w = 320, H2 = 420, P = 6, b = pbuf('s11', w, H2), gl = glowBuf('s11', w, H2);
  fairySky(b, w, 270, t, 111);
  const sky2 = pbuf('s11sky2', w, 150); psky(sky2, w, 150, [[0, '#B05E9A'], [.5, '#8A3A6E'], [1, '#4A1A4E']]);
  b.drawImage(BUF.s11sky2, 0, 270);
  cloud(b, 50, 250, 1.1, '#9A7AC8', '#C8B0E8'); cloud(b, 270, 236, 1.3, '#9A7AC8', '#C8B0E8'); cloud(b, 160, 274, 1, '#8A6AB8', '#B8A0E0');
  cloud(b, 40, 110, .9, '#6A54A8', '#9A86D0'); cloud(b, 250, 80, 1.1, '#6A54A8', '#9A86D0');
  // 街：屋顶和招牌
  pspr(b, skyline(w, 380, 112, '#2A1440', 70, .3), 0, 0);
  prect(b, 0, 380, w, 40, '#2A1840');
  for (let i = 0; i < 7; i++) { const x = i * 48; prect(b, x, 352, 44, 30, i % 2 ? '#3A2254' : '#2F1C48'); neonSign(b, gl, x + 8, 360, ['甜品', '花店', '奶茶', '书店', 'KTV'][i % 5], NEON[i % NEON.length], t, i); }
  // 灯笼：从街上往上飘
  for (let i = 0; i < 22; i++) {
    const st = .05 + hash(i, 4) * .9, u = Math.max(0, lt - st), x = hash(i, 5) * w + Math.sin(lt * 1.5 + i) * 4, y = 350 - u * (50 + hash(i, 6) * 60) - u * u * 16;
    if (y < -10) continue;
    pspr(b, lantern(), x, y); pdisc(gl, x + 2, y + 3, 4, 'rgba(255,120,80,.65)');
  }
  // 两个人：牵着手，脚离开地面往上飘
  const rise = E.io(clamp(lt / (T * .8)));
  const mx = 136, my = lerp(338, 150, rise) + Math.sin(lt * 3) * 1.5;
  // 鲸鱼：从下面斜着游上来，"世界"那里接住两个人
  const wu = E.out(seg(t, t0 + .7, ch(6, 7) + .25));
  const wx = lerp(-150, 82, wu), wy = lerp(330, 152, wu) + Math.sin(t * 2) * 2;
  if (wu > 0) { pspr(b, whale(Math.floor(t * 2.4) % 2), wx, wy); pell(gl, wx + 80, wy + 30, 50, 12, 'rgba(120,170,255,.15)'); }
  const land = seg(t, ch(6, 7) + .1, ch(6, 8));
  const fy = land > 0 ? lerp(my, wy + 1, E.out(land)) : my, fx = land > 0 ? lerp(mx, wx + 54, E.out(land)) : mx;
  const happy = t > ch(6, 4) ? 'happy' : 'up';
  drawMon(b, fx, fy, { eyes: happy, blush: 1, armL: land > .9 ? 'n' : 'up' }, 1, MEMT);
  drawMon(b, fx + 24, fy, { col: MON.you, flower: 1, eyes: happy, blush: 1, armR: land > .9 ? 'n' : 'up' }, 1, MEMT);
  for (let i = 0; i < 10; i++) { const a = t * 2 + i * .63, x = fx + 24 + Math.cos(a) * 30, y = fy + 8 + Math.sin(a) * 12; pdot(b, x, y, '#FFF2B0'); pdot(gl, x, y, '#FFE27A'); }
  // 镜头：跟着往上摇
  const camY = lerp(H2 - 180, 70, E.io(clamp(lt / (T * .9))));
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  blit(g, 's11', P, 0, camY); glowBlit(g, 's11', P, 0, camY, .9, 2.5);
}

/* ================= S12：鲸鱼驮着两个人游过大月亮（"遨游"） ================= */
function S12(g, t) {
  const t0 = bar(12), lt = t - t0;
  const w = 480, h = 270, P = 4;
  const bf = pbuf('s12f', w + 20, h), gf = glowBuf('s12f', w + 20, h);
  fairySky(bf, w + 20, h, t, 121);
  const mcx = 318, mcy = 112, mr = 76;
  pdisc(bf, mcx, mcy, mr + 6, 'rgba(255,240,200,.12)');
  pdisc(bf, mcx, mcy, mr, '#FFF2C8');
  for (const [dx, dy, r] of [[-20, -18, 12], [24, 10, 16], [-6, 30, 9], [30, -30, 7], [-36, 14, 6]]) { pdisc(bf, mcx + dx, mcy + dy, r, '#EEDCA8'); pdither(bf, mcx + dx - r, mcy + dy - r, r * 2, r, '#F8E8BC', .5); }
  pdisc(gf, mcx, mcy, mr, 'rgba(255,236,190,.55)');
  for (const [s, x0, y0] of [[t0 + .3, 120, 20], [t0 + 1.5, 160, 8]]) {        // 流星
    const u = (t - s) / .5; if (u < 0 || u > 1) continue;
    const x = x0 + u * 90, y = y0 + u * 40;
    for (let k = 0; k < 14; k++) pdot(bf, x - k * 2, y - k, rgba('#FFFFFF', (1 - k / 14) * (1 - u)));
    pdot(gf, x, y, '#FFFFFF');
  }
  const bm = pbuf('s12m', w + 60, h), gm = glowBuf('s12m', w + 60, h);
  castleIsland(bm, gm, 80, 150, 1.2, '#C890D8', '#5A3E78');
  castleIsland(bm, gm, 500, 196, .8, '#B07AC8', '#4E3470');
  cloud(bm, 200, 240, 1.6, '#7A62B8', '#A890D8'); cloud(bm, 440, 252, 1.4, '#7A62B8', '#A890D8'); cloud(bm, 30, 236, 1.2, '#7A62B8', '#A890D8');
  const bc = pbuf('s12c', w, h), gc = glowBuf('s12c', w, h);
  const wx = 60 + lt * 34, wy = 118 + Math.sin(t * 1.6) * 3;
  for (let i = 0; i < 40; i++) {                                   // 尾巴后面的星屑
    const age = (i / 40) * 1.6, x = wx + 4 - age * 40 + Math.sin(i) * 3, y = wy + 24 + Math.sin(age * 4 + i) * 6 + age * 4;
    const c = ['#FFF2B0', '#FFB8E0', '#B8F0FF'][i % 3];
    pdot(bc, x, y, rgba(c, 1 - age / 1.6)); if (i % 2 === 0) pdot(gc, x, y, c);
  }
  pspr(bc, whale(Math.floor(t * 2.4) % 2), wx, wy);
  const sx = wx + 54, sy = wy + 1;
  drawMon(bc, sx, sy, { eyes: 'happy', blush: 1, armL: Math.floor(t * 1.6) % 2 ? 'up' : 'n' }, 1, MEMT);
  drawMon(bc, sx + 24, sy, { col: MON.you, flower: 1, eyes: 'happy', blush: 1, armR: Math.floor(t * 1.6 + 1) % 2 ? 'up' : 'n' }, 1, MEMT);
  for (let i = 0; i < 9; i++) {                                    // 远处飘着的灯笼（避开月亮）
    const x = (hash(i, 31) * w + lt * 6) % w, y = 30 + hash(i, 32) * 200 - lt * (6 + i);
    if (Math.hypot(x - mcx, y - mcy) < mr + 10) continue;
    pspr(bc, lantern(), x, y); pdisc(gc, x + 2, y + 3, 4, 'rgba(255,120,80,.6)');
  }
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  blit(g, 's12f', P, 6 + lt * 2); glowBlit(g, 's12f', P, 6 + lt * 2, 0, .9, 3);
  blit(g, 's12m', P, 20 + lt * 9); glowBlit(g, 's12m', P, 20 + lt * 9, 0, .8, 2);
  blit(g, 's12c', P); glowBlit(g, 's12c', P, 0, 0, .9, 2);
}

/* ---------- 浮岛：草地 + 一层层的岩石，底下垂着尖尖的石头和藤蔓；u 0..1 冷 → 暖 ---------- */
function islandRock(b, gy, edge, cols, seed) {
  const [grass, grass2, rock, rock2, rockDk] = cols;
  for (let x = 0; x <= edge; x++) {
    const taper = edge - x < 46 ? (46 - (edge - x)) * .62 : 0;
    const d = Math.max(4, 30 + 7 * Math.sin(x * .045 + seed) + 4 * Math.sin(x * .13 + seed * 2) - taper);
    const sp = (x * .37 + seed * 5) % 17, spike = sp < 8.5 ? sp : 17 - sp;                  // 垂下来的尖石头（锯齿）
    const tip = d + Math.max(0, spike - 3) * 1.4 * (hash(Math.floor((x * .37 + seed * 5) / 17), seed) > .35 ? 1 : .3);
    for (let y = 3; y < tip; y++) {
      const band = Math.floor((y + Math.floor(x / 11) * 2) / 6) % 3;
      prect(b, x, gy + y, 1, 1, y > tip - 2 ? rockDk : band === 0 ? rock : band === 1 ? rock2 : mix(rock, rock2, .5));
    }
  }
  prect(b, 0, gy, edge + 1, 3, grass); for (let x = 0; x <= edge; x += 2) prect(b, x, gy - 1 - (x % 6 === 0 ? 1 : 0), 1, 1, grass2);
  for (let i = 0; i < 9; i++) { const x = (i * 37 + seed * 11) % (edge - 6) + 3, L = 4 + (i * 7) % 9; prect(b, x, gy + 3, 1, L, grass); pdot(b, x, gy + 3 + L, grass2); }   // 藤蔓
  for (let i = 0; i < 18; i++) { const x = (i * 29 + 7) % edge; pdot(b, x, gy - 1, ['#FFFFFF', '#FFE27A', '#FF9CC0'][i % 3]); }   // 小花
}
const islandCols = u => [mix('#3E5A5E', '#5E9A64', u), mix('#56767A', '#86C07E', u), mix('#2E3448', '#6A4A62', u), mix('#262C40', '#5A3E56', u), mix('#1A1E2E', '#3E2A40', u)];
/* 世界尽头（S13、S14）：天、星星、远处的月亮、浮岛、崖边泻下去的瀑布；cold 0..1 颜色变冷 */
function edgeWorld(b, gl, w, h, gy, edge, t, cold, seed) {
  psky(b, w, h, [[0, mix('#120A35', '#05081A', cold)], [.6, mix('#3A2470', '#0E1638', cold)], [1, mix('#8A4A90', '#24305A', cold)]]);
  for (let i = 0; i < 110; i++) { const x = hash(i, seed) * w, y = hash(i, seed, 2) * h, tw = .5 + .5 * Math.sin(t * 2.3 + i * 1.7); pdot(b, x, y, tw > .55 ? '#F2F0FF' : '#7C7CB8'); }
  pdisc(b, w * .22, h * .22, w / 24, mix('#FFF2C8', '#C8D0E8', cold)); pdisc(gl, w * .22, h * .22, w / 28, rgba('#FFF0D0', .4));
  islandRock(b, gy, edge, islandCols(1 - cold), seed % 7);
  for (let x = edge - 3; x <= edge + 1; x++) for (let y = gy + 2; y < h; y++) {      // 瀑布
    if ((y - t * 90 + x * 13) % 9 < 5) pdot(b, x + 1, y, rgba(mix('#BFE8FF', '#9CB8D8', cold), (1 - (y - gy) / (h - gy)) * .9));
  }
  for (let i = 0; i < 12; i++) { const y = gy + 20 + ((i * 17 + t * 30) % (h - gy)); pdisc(b, edge + 1 + Math.sin(i + t) * 3, y, 2 + i % 3, rgba('#DDF0FF', .12)); }
}
/* 化成光点：每个像素按顺序脱离（离"我"远的那边先走），往右上飘，一闪一闪地淡掉；返回还连着的像素数 */
function dissolveMon(b, gl, o, x, y, k, t, ta, tb, seed) {
  const px = monPixels(o), r = R(seed);
  let left = 0;
  for (const p of px) {
    const order = clamp((1 - p.x / 24) * .55 + r() * .45), sp = r(), wob = r() * 6;     // 右边（离我远）先走，牵着的那只手最后
    const rel = lerp(ta, tb, order), u = t - rel, X = x + p.x * k, Y = y + p.y * k;
    if (u < 0) { prect(b, X, Y, k, k, p.col); left++; continue; }
    const dx = u * (8 + sp * 22) + Math.sin(u * 2.5 + wob) * 4, dy = -u * (10 + sp * 20) - u * u * 3;
    const a = clamp(1.3 - u * .45) * (.6 + .4 * Math.sin(t * 9 + wob * 3));
    if (a <= 0) continue;
    pdot(b, X + dx, Y + dy, rgba(u < .15 ? '#FFE0EE' : '#FF9CC8', a)); if (gl) pdot(gl, X + dx, Y + dy, rgba('#FF8FC0', a));
  }
  return left;
}

/* ================= S13：浮岛上，你化成光点 ================= */
function S13(g, t) {
  const t0 = bar(13), lt = t - t0;
  const w = 320, h = 180, gy = 112, edge = 262, b = pbuf('s13', w, h), gl = glowBuf('s13', w, h);
  const cold = seg(t, ch(7, 0), ch(7, 6) + .4);
  edgeWorld(b, gl, w, h, gy, edge, t, cold, 131);
  const wa = 1 - seg(t, t0 + .4, t0 + 1.8);                                              // 鲸鱼往远处游走了，淡掉
  if (wa > 0) { b.save(); b.globalAlpha = wa; b.imageSmoothingEnabled = false; b.drawImage(whale(Math.floor(t * 2) % 2), ri(196 + lt * 22), ri(30 - lt * 8), 66, 29); b.restore(); }
  // 两个人往崖边走；"牵着你的手"开始，你一点点化掉
  const walking = t < ch(7, 6) + .3;
  const mx = 120 + Math.min(lt, ch(7, 6) + .3 - t0) * 10, my = gy - 16;
  const leg = walking ? walkLeg(t) : 0, leg2 = walking ? walkLeg(t, 2) : 0;
  const ta = ch(7, 2) - .05, tb = ch(7, 6) + .5;
  const left = dissolveMon(b, gl, { col: MON.you, flower: 1, eyes: 'l', legs: leg2 }, mx + 24, my, 1, t, ta, tb, 77);
  const gone = left < 6;
  const eyes = t < ta + .2 ? 'happy' : t < ta + .9 ? 'r' : gone ? 'sad' : 'wide';
  drawMon(b, mx, my, { eyes, legs: leg, armR: gone ? 'reach' : 'n' }, 1, mix(MEMT, NIGHT, cold));
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  blit(g, 's13', 6); glowBlit(g, 's13', 6, 0, 0, .9, 2.5);
}

/* ================= S14：我一个人走到世界的边上 ================= */
function S14(g, t) {
  const t0 = bar(14), lt = t - t0;
  const w = 480, h = 270, gy = 168, edge = 352, b = pbuf('s14', w, h), gl = glowBuf('s14', w, h);
  edgeWorld(b, gl, w, h, gy, edge, t, 1, 141);
  for (let i = 0; i < 60; i++) {                                     // 粉色光点：飘过崖边，往天上去
    const u = lt + hash(i, 9) * 1.4, x = 150 + u * 70 + Math.sin(u * 2 + i) * 12 + hash(i, 10) * 60, y = gy - 20 - u * 34 - hash(i, 11) * 40 + Math.sin(u * 3 + i) * 4;
    const a = clamp(1.2 - u / 3.5) * (.7 + .3 * Math.sin(t * 8 + i)), sz = i % 4 === 0 ? 2 : 1;
    if (a > 0 && y > 0) { prect(b, x, y, sz, sz, rgba('#FFB0D4', Math.min(1, a))); prect(gl, x - 1, y - 1, sz + 2, sz + 2, rgba('#FF8FC0', Math.min(1, a))); }
  }
  const stopT = ch(7, 11) + .1, walking = t < stopT;              // 走到崖边，"尽头"停下
  const mx = lerp(250, edge - 30, E.out(seg(t, t0, stopT))), my = gy - 16;
  pell(b, mx + 12, gy + 1, 11, 1, 'rgba(0,0,0,.35)');
  drawMon(b, mx, my, { eyes: walking ? 'r' : 'up', legs: walking ? walkLeg(t) : 0 }, 1, NIGHT);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  blit(g, 's14', 4); glowBlit(g, 's14', 4, 0, 0, .9, 2.5);
}

/* ---------- 日出的天（S15、S16） ---------- */
function dawnSky(b, w, h, u, hz) {
  psky(b, w, hz, [[0, mix('#0E1638', '#3A2C6A', u)], [.5, mix('#24305A', '#9A4E8A', u)], [.85, mix('#3A3A6A', '#F08A6A', u)], [1, mix('#4A4470', '#FFC27A', u)]]);
}

/* ================= S15：特写，心裂开，光点飞回来变成金色 ================= */
function S15(g, t) {
  const t0 = bar(15);
  const w = 160, h = 90, b = pbuf('s15', w, h), gl = glowBuf('s15', w, h);
  const dawn = seg(t, t0, bar(16) + .5) * .7;
  dawnSky(b, w, h, dawn, 76);
  for (let i = 0; i < 30; i++) pdot(b, hash(i, 151) * w, hash(i, 152) * 50, rgba('#F2F0FF', 1 - dawn));
  prect(b, 0, 72, w, 18, mix('#3E5A5E', '#5E7A5A', dawn)); prect(b, 0, 72, w, 1, mix('#56767A', '#8AB07A', dawn));
  const k = 2, mx = 56, my = 34;
  drawMon(b, mx, my, { eyes: t > ch(8, 4) + .3 ? 'happy' : t > ch(8, 2) ? 'sad' : 'dn', tear: t > ch(8, 4) + .3 ? 0 : 1 }, k, mix(NIGHT, '#FFE8DA', dawn));
  // 心：抱在身前（两只手在两边）；"一生"时裂开；"最美的"时光点飞回来，金色从上往下流进裂缝
  const appear = E.back(clamp((t - (t0 - .05)) / .3));
  const crack = seg(t, ch(8, 2) - .05, ch(8, 3) + .1), gold = seg(t, ch(8, 4) + .05, ch(8, 7) - .1);
  const beat = Math.floor((t - TM.bar1) / BEAT) % 2;
  const hx0 = mx + 24 - 15, hy0 = my + 11;
  if (appear > 0) {
    const sz = appear * 2, hx = mx + 24 - 15 * sz / 2, hy = my + 11 + (2 - sz) * 6 - (beat ? 1 : 0);
    const shakeX = (crack > 0 && crack < 1 && Math.floor(t * 24) % 2) ? 1 : 0;
    b.save(); b.imageSmoothingEnabled = false; b.drawImage(heart(crack, gold, beat), ri(hx + shakeX), ri(hy), ri(15 * sz), ri(13 * sz)); b.restore();
    if (gold > 0) for (const [cx, cy] of CRACK.slice(0, ri(CRACK.length * gold))) pdisc(gl, hx + cx * sz + 1, hy + cy * sz + 1, 2, 'rgba(255,200,80,.9)');
    pdisc(gl, hx + 15, hy + 12, 10, rgba('#FF5A6A', .25));
  }
  const fa = ch(8, 4) - .5, fb = ch(8, 7);                         // 粉色光点从右上飞回来，钻进裂缝
  if (t > fa && t < fb + .3) for (let i = 0; i < 36; i++) {
    const st = fa + hash(i, 5) * (fb - fa - .3), u = clamp((t - st) / .55);
    if (u <= 0 || u >= 1) continue;
    const [cx, cy] = CRACK[i % CRACK.length], ex = hx0 + cx * 2 + 1, ey = hy0 + cy * 2 + 1;
    const sx2 = w + 10 + hash(i, 6) * 30, sy2 = -10 + hash(i, 7) * 50;
    const x = lerp(sx2, ex, E.io(u)) + Math.sin(u * 6 + i) * 6 * (1 - u), y = lerp(sy2, ey, E.io(u));
    pdot(b, x, y, u > .8 ? '#FFE27A' : '#FF9CC8'); pdot(gl, x, y, u > .8 ? '#FFD27A' : '#FF8FC0');
  }
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  blit(g, 's15', 12); glowBlit(g, 's15', 12, 0, 0, .9, 3);
}

/* ================= S16：日出，金色的伤口在发光；天上的星星连成你 ================= */
const CONST_BODY = [[4, 0], [20, 0], [20, 4], [24, 4], [24, 8], [20, 8], [20, 12], [4, 12], [4, 8], [0, 8], [0, 4], [4, 4], [4, 0]];   // 小怪的轮廓
const CONST_LEGS = [[5, 12, 5, 16], [9, 12, 9, 16], [15, 12, 15, 16], [19, 12, 19, 16]];
function S16(g, t) {
  const t0 = bar(16), lt = t - t0;
  const w = 320, h = 180, gy = 126, edge = 196, b = pbuf('s16', w, h), gl = glowBuf('s16', w, h);
  const u = .7 + .3 * seg(t, t0, t0 + 2);
  dawnSky(b, w, h, u, gy + 26);
  // 太阳从云海后面升起来，光芒慢慢转
  const sx = 262, sy = lerp(158, 132, E.out(seg(t, t0 - .4, t0 + 2.4)));
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * TAU + t * .15, L = 50 + (i % 2) * 28;
    for (let k = 10; k < L; k += 2) pdot(b, sx + Math.cos(a) * k, sy + Math.sin(a) * k, rgba('#FFE2A0', .5 * (1 - k / L)));
  }
  pdisc(b, sx, sy, 15, '#FFE7A8'); pdisc(b, sx, sy, 11, '#FFF6D8'); pdisc(gl, sx, sy, 18, 'rgba(255,220,150,.9)');
  prect(b, 0, gy + 22, w, h - gy - 22, mix('#C07A8A', '#F0A07A', .5));
  for (let i = 0; i < 9; i++) cloud(b, (i * 46 + lt * 3) % (w + 50) - 25, gy + 20 + (i % 3) * 6, .9, mix('#B86A8A', '#F0A07A', i / 9), '#FFD0A0');
  // 星座：粉色的你（天还没全亮，星星还看得见），右上角
  const ca = seg(t, t0 + .2, t0 + 1.4) * (1 - seg(t, 41.8, 42.6));
  if (ca > 0) {
    const ox = 208, oy = 18, s = 2.4, P2 = (x, y) => [ox + x * s, oy + y * s];
    const n = CONST_BODY.length - 1;
    for (let i = 0; i < n; i++) {                                  // 连线一笔一笔描出来
      const show = clamp(ca * (n + 4) - i); if (show <= 0) continue;
      const [x0, y0] = CONST_BODY[i], [x1, y1] = CONST_BODY[i + 1], [a0, b0] = P2(x0, y0), [a1, b1] = P2(lerp(x0, x1, show), lerp(y0, y1, show));
      pline(b, a0, b0, a1, b1, rgba('#FFB8DA', .5 * ca));
    }
    CONST_LEGS.forEach(([x0, y0, x1, y1], i) => { if (ca * (n + 4) > n + i * .5) { const [a0, b0] = P2(x0, y0), [a1, b1] = P2(x1, y1); pline(b, a0, b0, a1, b1, rgba('#FFB8DA', .5 * ca)); pdot(b, a1, b1, rgba('#FFE6F2', ca)); pdot(gl, a1, b1, rgba('#FF9CC8', ca)); } });
    for (const [x, y] of CONST_BODY.slice(0, -1)) { const tw = .6 + .4 * Math.sin(t * 4 + x + y), [X, Y] = P2(x, y); pdot(b, X, Y, rgba('#FFE6F2', ca * tw)); pdot(gl, X, Y, rgba('#FF9CC8', ca)); }
    for (const [x, y] of [[7, 3], [17, 3]]) { const [X, Y] = P2(x, y); prect(b, X, Y, 2, 2, rgba('#FFFFFF', ca)); prect(gl, X - 1, Y - 1, 4, 4, rgba('#FFC8E0', ca)); }   // 两只眼睛
    for (const [x, y] of [[16, -2], [18, -2], [17, -3], [17, -1]]) { const [X, Y] = P2(x, y); pdot(b, X, Y, rgba('#FFFFFF', ca * .9)); }                          // 小白花
  }
  // 浮岛（左边），我站在崖边，抱着金色裂缝的心
  islandRock(b, gy, edge, islandCols(u), 3);
  const mx = edge - 34, my = gy - 16;
  pell(b, mx + 12, gy + 1, 12, 1, 'rgba(60,20,30,.35)');
  drawMon(b, mx, my, { eyes: 'happy', blush: 1 }, 1, '#FFE6D2');
  const beat = Math.floor((t - TM.bar1) / BEAT) % 2;
  pspr(b, heart(1, 1, beat), mx + 5, my + 5 - beat, 1);
  pdisc(gl, mx + 12, my + 11, 6, 'rgba(255,200,90,.9)');
  for (let i = 0; i < 3; i++) { const q = ((t - t0) * .6 + i / 3) % 1; pring(b, mx + 12, my + 11, 6 + q * 34, 4 + q * 22, rgba('#FFD27A', .5 * (1 - q))); }   // 金色的光一圈圈荡开
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  blit(g, 's16', 6); glowBlit(g, 's16', 6, 0, 0, 1, 2.5);
}
