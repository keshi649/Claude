'use strict';
/* scenes1.js：主歌（现在，雨夜，冷色）
   S1 雨夜路灯下，你拖着行李箱要走（片名）      0 ~ 第 2 小节
   S2 我伸出手想挽留                            第 2 小节
   S3 木偶戏台：线从上面垂下来，拴住我          第 3 小节
   S4 特写：气泡里的"别走"碎掉、掉下去          第 4 小节
   S5 线断了，我转过身                          第 5 小节
   S6 空荡荡的长街，路灯从远到近一盏盏灭掉      第 6 小节
   S7 特写：眼泪                                第 7 小节
   S8 泪滴进水洼，水里的倒影：我擦眼泪，身边多了一个你；镜头扎进水洼  第 8 小节 */

const NIGHT = '#B4BCE6';          // 雨夜里给角色乘的颜色（偏蓝）
const LAMP = '#FFC468';         // 路灯的光（暖黄）

/* ---------- 共用：夜空、远处楼群、路灯、水洼 ---------- */
function nightSky(b, w, hz) { psky(b, w, hz, [[0, '#050816'], [.55, '#0D1431'], [1, '#1D2953']]); }
/* 远处楼群剪影（缓存）：亮着的窗户少、暖黄 */
function skyline(w, hz, seed, col, top, lit = .06) {
  return cached(`skyline|${w}|${hz}|${seed}|${col}|${top}`, w, hz, g => {
    const r = R(seed); let x = -2;
    while (x < w) {
      const bw = 10 + ri(r() * 22), bh = ri(top * (.35 + r() * .65));
      prect(g, x, hz - bh, bw, bh, col);
      if (r() < .3) prect(g, x + ri(bw / 2) - 1, hz - bh - 4 - ri(r() * 5), 2, 6, col);   // 天线
      for (let yy = hz - bh + 3; yy < hz - 2; yy += 4) for (let xx = x + 2; xx < x + bw - 2; xx += 3)
        if (r() < lit) prect(g, xx, yy, 1, 2, r() < .7 ? '#E7B867' : '#9FB6E8');
      x += bw + ri(r() * 3);
    }
  });
}
/* 侧面的路灯：(x, 地面 y)，高 hgt；on 0..1；灯泡和光圈也画进光层 gl */
function streetLamp(b, gl, x, gy, hgt, on) {
  const pole = '#2B3354', top = gy - hgt;
  prect(b, x, top, 2, hgt, pole); prect(b, x - 1, gy - 3, 4, 3, pole);
  prect(b, x, top, 8, 1, pole); prect(b, x + 7, top + 1, 1, 1, pole);
  prect(b, x + 5, top + 1, 6, 2, '#3A4468');
  const bx = x + 8, by = top + 3;
  prect(b, x + 6, top + 3, 4, 1, mix('#55607F', '#FFF4D0', on));
  if (on > 0) {
    pcone(b, bx, by + 1, gy, 4, hgt * .8, LAMP, .26 * on, .08 * on);
    pell(b, bx, gy + 2, hgt * .42, 3, rgba(LAMP, .14 * on));
    if (gl) { prect(gl, x + 5, top + 2, 6, 3, rgba('#FFE7A8', on)); pell(gl, bx, gy + 2, hgt * .3, 2, rgba('#FFC870', .3 * on)); }
  }
}
/* 地上的水洼：深色椭圆，里面一道灯的倒影 */
function puddle(b, cx, cy, rx, ry, glowX, on) {
  pell(b, cx, cy, rx, ry, '#16203F');
  pring(b, cx, cy, rx, ry, '#24305A');
  if (glowX != null && Math.abs(glowX - cx) < rx) for (let y = -ry + 1; y < ry; y++) prect(b, glowX - 1, cy + y, 3, 1, rgba(LAMP, on * .45 * (1 - Math.abs(y) / ry)));
}
/* 闪烁着亮起来 / 熄灭 */
function flickOn(t, t0) { if (t < t0) return 0; const u = t - t0; if (u > .25) return 1; return [1, 0, 1, 0, .6, 1][Math.floor(u / .042)] ?? 1; }
function flickOff(t, t0) { if (t < t0) return 1; const u = t - t0; if (u > .2) return 0; return [.3, 1, 0, .8, 0][Math.floor(u / .04)] ?? 0; }

/* ================= S1：雨夜路灯（0 ~ bar2） ================= */
function S1(g, t) {
  const w = 340, h = 180, gy = 140, b = pbuf('s1', w, h), gl = glowBuf('s1', w, h);
  const camX = 16 * E.sine(seg(t, 1.2, 4.1));                // 你开始走以后，镜头跟着慢慢往右摇
  nightSky(b, w, gy);
  pspr(b, skyline(w, gy - 14, 11, '#121A36', 56, .05), 0, 0);
  pspr(b, skyline(w, gy - 4, 12, '#18213F', 40, .08), 0, 0);
  // 近处的一排店面：关着卷帘门
  prect(b, 0, gy - 44, w, 44, '#1A2140');
  for (let x = 4; x < w; x += 54) {
    prect(b, x, gy - 36, 44, 36, '#222A4C');
    for (let y = gy - 32; y < gy; y += 3) prect(b, x + 3, y, 38, 1, '#2B3459');
    prect(b, x - 2, gy - 41, 48, 5, '#283158');
  }
  // 远处一块招牌还亮着（暖粉）
  prect(b, 276, gy - 64, 22, 11, '#2A1E3A'); ptext(b, '24h', 278, gy - 65, 1, '#FF8FB4');
  prect(gl, 276, gy - 62, 22, 8, 'rgba(255,120,170,.5)');
  // 地面：人行道 + 马路
  prect(b, 0, gy, w, h - gy, '#151B33'); prect(b, 0, gy, w, 2, '#2A335A'); prect(b, 0, gy + 15, w, 1, '#20284A');
  for (let x = 8; x < w; x += 32) prect(b, x, gy + 28, 15, 1, '#2A3358');
  // 灯：开头就亮着一点，0.30 秒（第一声）闪一下全亮
  const on = t < .30 ? .6 : Math.max(.4, flickOn(t, .30));
  const lx = 98;
  puddle(b, 108, gy + 9, 20, 3, lx + 8, on);
  puddle(b, 214, gy + 21, 28, 4, null, on);
  puddle(b, 44, gy + 30, 18, 3, null, on);
  streetLamp(b, gl, lx, gy, 82, on);
  // 角色：我（左）、你（右，拖着行李箱）
  const meX = 84, yY = gy - 16;
  const youX = 112 + (t > 1.62 ? (t - 1.62) * 20 : 0);
  const leg = t > 1.62 ? [1, 0, 2, 0][Math.floor(t * 6) % 4] : 0;
  const meEyes = t < 1.45 ? 'r' : t < 2.6 ? 'r' : 'sad';
  const meArmR = (t > 2.72 && t < 3.05) ? 'up' : 'n';          // "的时候"：手抬了一下，又放下了
  drawMon(b, meX + (t > 2.72 ? 1 : 0), yY, { eyes: meEyes, armR: meArmR }, 1, NIGHT);
  pspr(b, tinted(suitcase(), NIGHT, 'sc'), youX + 26, gy - 9);
  drawMon(b, youX, yY, { col: MON.you, flower: 1, eyes: t < 1.45 ? 'dn' : 'r', legs: leg }, 1, NIGHT);
  rain(b, t, w, h, { n: 120, v: 210, len: 6, slant: .22, ground: gy + 3, groundDepth: 38, seed: 3 });
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  blit(g, 's1', 6, camX); glowBlit(g, 's1', 6, camX, 0, .9, 2);
  // 片名：第一帧就在；灯闪的时候跟着闪；3.3 秒开始淡出
  const ta = (.82 + .18 * on) * (1 - seg(t, 3.3, 3.85));
  if (ta > 0) {
    ptext(g, '最美的伤口', 960, 150, 9, '#FFF6E6', { align: 'center', alpha: ta, ol: '#0A0F24', shadow: '#0A0F24' });
    ptext(g, '小睿', 960, 288, 3, '#C9D3F2', { align: 'center', alpha: ta * .9, ol: '#0A0F24' });
  }
}

/* ================= S2：我伸出手（bar2 ~ bar3） ================= */
function S2(g, t) {
  const t0 = bar(2), lt = t - t0;
  const w = 240, h = 135, gy = 108, b = pbuf('s2', w, h), gl = glowBuf('s2', w, h);
  nightSky(b, w, gy);
  pspr(b, skyline(w, gy - 10, 21, '#141C3A', 46, .1), 0, 0);
  // 远处的灯斑（虚的）
  for (let i = 0; i < 9; i++) { const x = (i * 37 + 13) % w, y = 36 + (i * 17) % 40, c = i % 2 ? '#E7B867' : '#8FA8E8'; pdisc(b, x, y, 3 + (i % 3), rgba(c, .16)); pdisc(gl, x, y, 2, rgba(c, .4)); }
  prect(b, 0, gy, w, h - gy, '#141A31'); prect(b, 0, gy, w, 2, '#29325A');
  puddle(b, 70, gy + 10, 34, 4, 24, 1);
  // 左上角路灯照下来
  prect(b, 14, 0, 3, gy, '#262E4E');
  pcone(b, 20, 0, gy, 30, 120, LAMP, .16, .05);
  pdisc(gl, 20, 4, 10, 'rgba(255,215,140,.6)');
  // 你：在后面（更远、更小、更暗），往右走出画面
  const yx = 150 + lt * 30, leg = [1, 0, 2, 0][Math.floor(t * 6) % 4];
  pspr(b, tinted(suitcase(), '#8A90B8', 'sc'), yx + 26, gy - 16);
  drawMon(b, yx, gy - 23, { col: MON.you, flower: 1, eyes: 'r', legs: leg }, 1, '#8A90B8');
  // 我：k=2，抬手 → 往前一步 → 伸出手（"挽"）→ 手发抖
  let armR = 'n', eyes = 'r', step2 = 0;
  if (t > ch(0, 7)) armR = 'up';
  if (t > ch(0, 9)) step2 = 3;
  if (t > ch(0, 10) - .05) { armR = 'reach'; eyes = 'wide'; }
  if (t > ch(0, 11) + .5) eyes = 'sad';
  const jit = (t > ch(0, 11) && Math.floor(t * 15) % 2) ? 1 : 0;
  drawMon(b, 36 + step2, gy - 32 - jit, { eyes, armR, legs: step2 && t < ch(0, 9) + .2 ? 2 : 0 }, 2, NIGHT);
  rain(b, t, w, h, { n: 70, v: 170, len: 5, slant: .22, ground: gy + 2, groundDepth: 20, seed: 5, col: 'rgba(160,185,240,.5)' });
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  blit(g, 's2', 8); glowBlit(g, 's2', 8, 0, 0, .8, 2);
}

/* ================= S3：木偶戏台（bar3 ~ bar4） ================= */
function curtains(b, w, h, top, sideW) {
  const fold = ['#7A1428', '#9C1F36', '#B92B44', '#9C1F36', '#6A1022', '#5A0D1D'];
  for (let x = 0; x < sideW; x++) { const c = fold[Math.floor(x / 3) % fold.length]; prect(b, x, 0, 1, h, c); prect(b, w - 1 - x, 0, 1, h, c); }
  for (let x = 0; x < sideW; x++) { const d = (x % 6 < 3) ? 1 : 0; prect(b, x, h - 3 - d, 1, 3 + d, '#4A0A18'); prect(b, w - 1 - x, h - 3 - d, 1, 3 + d, '#4A0A18'); }
  prect(b, 0, 0, w, top, '#8E1A30');
  for (let x = 0; x < w; x += 16) { pell(b, x + 8, top, 9, 4, '#8E1A30'); pell(b, x + 8, top - 1, 7, 2, '#A62440'); }
  for (let x = 0; x < w; x += 2) prect(b, x, top + 3 + (x % 4 === 0 ? 1 : 0), 1, 3, '#E8B04A');
  prect(b, 0, 2, w, 1, '#C43A52');
}
/* 提线：从控制杆垂下来，拴在头和两只手上；grow 0..1 线往下长 */
function puppetStrings(b, barX, barY, tilt, mx, my, k, o, grow = 1, col = '#EDE6D8') {
  for (const [dx, which] of [[-28, 'L'], [0, 'head'], [28, 'R']]) {
    const sx = barX + dx * Math.cos(tilt), sy = barY + dx * Math.sin(tilt) + 2;
    const [ax, ay] = monAnchor(o, which), ex = mx + ax * k, ey = my + ay * k;
    pline(b, sx, sy, lerp(sx, ex, grow), lerp(sy, ey, grow), col);
  }
}
function controlBar(b, x, y, tilt) {
  const wood = '#8A5A32', hi = '#B07A48', dk = '#5E3A1E';
  for (let i = -32; i <= 32; i++) { const xx = x + i * Math.cos(tilt), yy = y + i * Math.sin(tilt); prect(b, xx, yy, 1, 3, wood); prect(b, xx, yy, 1, 1, hi); }
  prect(b, x - 1, y - 22, 3, 26, wood); prect(b, x - 1, y - 22, 1, 26, hi); prect(b, x - 3, y - 2, 7, 6, dk);
}
function S3(g, t) {
  const t0 = bar(3), lt = t - t0;
  const w = 320, h = 180, fy = 146, b = pbuf('s3', w, h), gl = glowBuf('s3', w, h);
  prect(b, 0, 0, w, h, '#07050C');
  prect(b, 0, fy, w, h - fy, '#4E321F');
  for (let y = fy + 4; y < h; y += 7) prect(b, 0, y, w, 1, '#3A2416');
  for (let x = 13; x < w; x += 29) prect(b, x, fy, 1, h - fy, '#3A2416');
  prect(b, 0, fy, w, 2, '#8A5A36');
  // 聚光灯
  const sx = 160;
  pcone(b, sx, 0, fy, 22, 120, '#FFF1C4', .10, .20);
  pell(b, sx, fy + 6, 64, 8, 'rgba(255,240,196,.22)');
  pell(gl, sx, fy + 6, 50, 6, 'rgba(255,230,170,.35)');
  for (let i = 0; i < 26; i++) { const x = sx - 40 + hash(i, 3) * 80 + Math.sin(t * .7 + i) * 6, y = (hash(i, 4) * fy + t * (3 + hash(i, 5) * 4)) % fy; pdot(b, x, y, 'rgba(255,240,200,.55)'); }
  // 控制杆落下来（带回弹），之后跟着字左右歪
  const drop = E.back(clamp(lt / .28));
  let tilt = 0;
  for (const [bt, a] of [[ch(1, 3), -.28], [ch(1, 5), .28], [ch(1, 6), -.18], [ch(1, 6) + .32, .12]]) if (t > bt) tilt = lerp(tilt, a, clamp((t - bt) / .08));
  const barX = sx, barY = lerp(-30, 26, drop);
  const k = 3, lift = t > ch(1, 2) ? 6 : t > ch(1, 1) ? 2 : 0;
  const mx = sx - 36 + ri(tilt * 10), my = fy - 48 - lift + (t > ch(1, 6) + .1 ? 2 : 0);
  let armL = 'n', armR = 'reach';
  if (t > ch(1, 1)) { armL = 'hi'; armR = 'hi'; }
  if (t > ch(1, 3)) { armL = 'hi'; armR = 'dn'; }
  if (t > ch(1, 5)) { armL = 'dn'; armR = 'hi'; }
  if (t > ch(1, 6)) { armL = 'up'; armR = 'up'; }
  const o = { eyes: t > ch(1, 6) ? 'sad' : t > ch(1, 1) ? 'wide' : 'n', armL, armR };
  pell(b, mx + 36, fy + 3, 22 - lift, 2, 'rgba(0,0,0,.45)');
  drawMon(b, mx, my, o, k, '#FFE9C8');
  puppetStrings(b, barX, barY, tilt, mx, my, k, o, clamp((lt - .12) / .3));
  controlBar(b, barX, barY, tilt);
  curtains(b, w, h, 18, 54);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  blit(g, 's3', 6); glowBlit(g, 's3', 6, 0, 0, .7, 3);
}

/* ================= S4：特写，说不出口（bar4 ~ bar5） ================= */
const BIEZOU = {};
/* "别走"两个字的像素（相对文字左上角） */
function biezouPixels() {
  if (BIEZOU.p) return BIEZOU.p;
  const G = glyphs('别走', '#22264A'), d = G.c.getContext('2d').getImageData(0, 0, G.w, G.h).data, p = [];
  for (let y = 0; y < G.h; y++) for (let x = 0; x < G.w; x++) if (d[(y * G.w + x) * 4 + 3] > 128) p.push([x - 2, y - 2]);
  BIEZOU.p = p; BIEZOU.w = G.tw; return p;
}
function S4(g, t) {
  const t0 = bar(4);
  const w = 160, h = 90, b = pbuf('s4', w, h), gl = glowBuf('s4', w, h);
  for (let x = 0; x < w; x++) prect(b, x, 0, 1, h, ['#2A0710', '#34091A', '#3E0C1F', '#34091A'][Math.floor(x / 4) % 4]);
  pdisc(b, 52, 50, 46, 'rgba(255,220,170,.10)'); pdisc(b, 52, 50, 30, 'rgba(255,220,170,.08)');
  const k = 2, mx = 28, my = 36 + (t > bar(5) - .9 ? 2 : 0);
  const yank = t > ch(2, 3) && t < ch(2, 3) + .15;
  let eyes = 'wide'; if (t > ch(2, 4)) eyes = 'sad'; if (t > bar(5) - .9) eyes = 'dn';
  const o = { eyes, armL: yank ? 'hi' : 'up', armR: yank ? 'hi' : 'up' };
  const yy = my - (yank ? 2 : 0);
  drawMon(b, mx, yy, o, k, '#FFE2D0');
  for (const which of ['L', 'head', 'R']) { const [ax, ay] = monAnchor(o, which); pline(b, mx + ax * k, yy + ay * k, mx + ax * k + (which === 'L' ? -4 : which === 'R' ? 4 : 0), -1, 'rgba(237,230,216,.85)'); }
  // 气泡：一出来就是"别走"；"说"那一下线一扯；"不"开始碎，字的像素往下掉；气泡缩没
  const bx = 86, by = 12, bw = 50, bh = 28;                  // 气泡右边在 x<1650 以内（横屏右侧按钮区之外）
  const popU = E.back(clamp((t - (t0 + .03)) / .2)), crumble = t - ch(2, 4), shrink = clamp((t - ch(2, 6)) / .35);
  if (popU > 0 && shrink < 1) {
    const s = popU * (1 - shrink), cw = Math.max(2, ri(bw * s)), chh = Math.max(2, ri(bh * s));
    const cx = bx + bw / 2 + (yank ? 1 : 0), cy = by + bh / 2;
    prect(b, cx - cw / 2, cy - chh / 2, cw, chh, '#F4F1EA');
    prect(b, cx - cw / 2 + 1, cy - chh / 2 - 1, cw - 2, 1, '#F4F1EA'); prect(b, cx - cw / 2 + 1, cy + chh / 2, cw - 2, 1, '#F4F1EA');
    if (s > .5) for (let i = 0; i < 6; i++) prect(b, cx - cw / 2 - i - 1, cy + chh / 2 - 4 + i, 3, 1, '#F4F1EA');
    for (let x = cx - cw / 2 + 1; x < cx + cw / 2 - 1; x++) { pdot(b, x, cy - chh / 2 - 2, '#22264A'); pdot(b, x, cy + chh / 2 + 1, '#22264A'); }
    for (let y = cy - chh / 2; y < cy + chh / 2; y++) { pdot(b, cx - cw / 2 - 1, y, '#22264A'); pdot(b, cx + cw / 2, y, '#22264A'); }
  }
  const px = biezouPixels(), tx = bx + bw / 2 - BIEZOU.w / 2 + (yank ? 1 : 0), ty = by + 7;
  if (popU > .6) {
    const r = R(41);
    for (const [x, y] of px) {
      const delay = r() * .5 + (x / BIEZOU.w) * .25, jx = r() - .5;
      let X = tx + x, Y = ty + y, col = '#22264A';
      if (crumble > delay) { const u = crumble - delay; Y += 90 * u * u + u * 6; X += jx * u * 14; col = u > .25 ? '#6E6A80' : col; }
      else if (crumble > 0 && Math.floor(t * 20) % 3 === 0 && jx > .35) X += 1;   // 快碎之前在抖
      if (Y < h) pdot(b, X, Y, col);
    }
  }
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  blit(g, 's4', 12); glowBlit(g, 's4', 12, 0, 0, .5, 3);
}

/* ---------- 透视的长街（S5、S6 共用）：消失点 (vx, vy)，地面基准线 gy；lampOn：每对灯的亮度（从近到远） ---------- */
function perspStreet(b, gl, w, h, vx, vy, gy, lampOn, o = {}) {
  const road = o.road || 150, side = o.side || 210;
  nightSky(b, w, vy + 10);
  pspr(b, skyline(w, vy + 6, o.seed || 31, '#121A38', o.skyH || 40, .05), 0, 0);
  for (let y = vy; y < h; y++) {
    const u = (y - vy) / (gy - vy);
    prect(b, 0, y, w, 1, mix('#1D2850', '#121830', clamp(u * 1.2)));
    const half = u * road, sd = u * side;
    prect(b, vx - sd, y, sd - half, 1, mix('#24305C', '#1A2244', clamp(u)));
    prect(b, vx + half, y, sd - half, 1, mix('#24305C', '#1A2244', clamp(u)));
    pdot(b, vx - half, y, '#3A4778'); pdot(b, vx + half, y, '#3A4778');
    if (u > .04 && Math.floor(Math.log(u) * 9) % 2 === 0) pdot(b, vx, y, '#3B4570');   // 中线（越远越密）
  }
  for (const s of [-1, 1]) for (let i = 0; i < 9; i++) {
    const f = 1 / (1 + i * .8), x0 = vx + s * side * f, bh = 120 * f, ww = 60 * f;
    prect(b, s < 0 ? x0 - ww : x0, vy + (gy - vy) * f - bh, ww, bh, mix('#141B38', '#0F1530', i / 9));
  }
  for (let i = lampOn.length - 1; i >= 0; i--) {
    const f = 1 / (1 + i * .9), on = lampOn[i];
    for (const s of [-1, 1]) {
      const x = vx + s * (road + 10) * f, base = vy + (gy - vy) * f, hgt = 120 * f;
      prect(b, x, base - hgt, Math.max(1, ri(3 * f)), hgt, '#2A3256');
      const hx = x - s * 6 * f;
      prect(b, Math.min(x, hx), base - hgt, Math.abs(hx - x) + 1, 1, '#2A3256');
      pdisc(b, hx, base - hgt + 2, Math.max(1, 2 * f * 1.6), mix('#3A4468', '#FFF2C8', on));
      if (on > 0) {
        const pool = 40 * f;
        pcone(b, hx, base - hgt + 3, base, 2, pool * 1.2, LAMP, .13 * on * Math.min(1, f * 2.2), .04 * on);
        pell(b, hx, base + 1, pool * .8, Math.max(1, pool * .14), rgba(LAMP, .14 * on));
        pdisc(gl, hx, base - hgt + 2, Math.max(2, 6 * f), rgba('#FFE2A0', .9 * on));
      }
    }
  }
  for (let r = 40; r > 0; r -= 8) pell(b, vx, vy + 4, r * 1.8, r * .5, 'rgba(60,75,130,.08)');   // 消失点那儿的雾
}

/* ================= S5：线断了，转身（bar5 ~ bar6） ================= */
function S5(g, t) {
  const t0 = bar(5), lt = t - t0;
  const w = 240, h = 135, vx = 120, vy = 50, gy = 112, b = pbuf('s5', w, h), gl = glowBuf('s5', w, h);
  perspStreet(b, gl, w, h, vx, vy, gy, [1, 1, 1, 1, 1, 1], { road: 70, side: 110, skyH: 26, seed: 33 });
  const k = 2, mx = 96, base = 104, my = base - 32 + (lt < .12 ? -4 + lt * 30 : 0);
  const tu = clamp((t - ch(3, 3)) / .38);                    // 转身："转"开始，0.38 秒转过去
  const oF = { eyes: lt < .3 ? 'wide' : 'n', armL: lt < .15 ? 'hi' : 'n', armR: lt < .15 ? 'hi' : 'n' }, oB = { back: 1 };
  pell(b, mx + 24, base + 1, 20, 2, 'rgba(0,0,0,.35)');
  if (tu <= 0) drawMon(b, mx, my, oF, k, NIGHT);
  else if (tu >= 1) drawMon(b, mx, my, oB, k, NIGHT);
  else drawMonTurn(b, mx, my, oF, oB, tu, k, NIGHT);
  // 断掉的线：上半截往上弹回去，下半截掉下来
  if (lt < .5) {
    const u = lt / .5;
    for (const ax of [2, 24, 46]) {
      const x = mx + ax, cut = lerp(my - 6, -2, E.out(u));
      pline(b, x, -2, x + Math.sin(u * 20 + ax) * 2 * (1 - u), cut, u < .1 ? '#FFFFFF' : 'rgba(237,230,216,.8)');
      if (u < .6) pline(b, x, my - 4 + u * 20, x + 1, my - 1 + u * 26, 'rgba(237,230,216,.6)');
    }
  }
  rain(b, t, w, h, { n: 80, v: 170, len: 5, slant: .18, ground: h, seed: 7, col: 'rgba(160,185,240,.5)' });
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const sh = lt < .3 ? Math.sin(lt * 90) * (1 - lt / .3) * 1.2 : 0;     // 线断那一下镜头一抖
  blit(g, 's5', 8, sh, 0); glowBlit(g, 's5', 8, sh, 0, .8, 2);
}

/* ================= S6：空荡荡的长街，路灯一盏盏灭（bar6 ~ bar7） ================= */
function S6(g, t) {
  const t0 = bar(6), lt = t - t0;
  const w = 480, h = 270, vx = 240, vy = 100, gy = 224, b = pbuf('s6', w, h), gl = glowBuf('s6', w, h);
  // "已远走"之后，远处的灯先灭（每 0.17 秒灭一对），最近的那盏一直亮着
  const n = 7, lamps = [];
  for (let i = 0; i < n; i++) lamps.push(i === 0 ? .9 + .1 * Math.sin(t * 13) : flickOff(t, ch(3, 10) + .1 + (n - 1 - i) * .17));
  perspStreet(b, gl, w, h, vx, vy, gy, lamps, { road: 150, side: 230, skyH: 46, seed: 34 });
  // 你：消失点那儿一个小小的粉点，越走越远，淡进雾里
  const fade = 1 - seg(t, ch(3, 10), ch(3, 11) + .2);
  if (fade > 0) {
    const u = clamp(lt / 1.4), y = lerp(vy + 9, vy + 4, u), s = u < .6 ? 2 : 1;
    prect(b, vx - 1 + ri(Math.sin(t * 3)), y, s, s + 1, rgba(MON.you, fade * .9));
  }
  // 我：背影，站在路中间（脚在歌词上面）
  const mx = 228, my = 194;
  pell(b, mx + 12, my + 16, 12, 1, 'rgba(0,0,0,.35)');
  drawMon(b, mx, my, { back: 1 }, 1, NIGHT);
  rain(b, t, w, h, { n: 150, v: 300, len: 6, slant: .18, ground: h, seed: 9, col: 'rgba(150,175,235,.5)' });
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  blit(g, 's6', 4); glowBlit(g, 's6', 4, 0, 0, .9, 2);
}

/* ================= S7：特写，眼泪（bar7 ~ bar8） ================= */
/* 背景虚掉的灯斑 */
function bokeh(b, gl, w, h, seed, t, cols) {
  for (let i = 0; i < 14; i++) {
    const x = hash(i, seed) * w + Math.sin(t * .3 + i) * 2, y = hash(i, seed, 2) * h * .8, r = 3 + hash(i, seed, 3) * 7, c = cols[i % cols.length];
    pdisc(b, x, y, r, rgba(c, .16)); pdisc(b, x, y, r * .6, rgba(c, .12));
    if (gl) pdisc(gl, x, y, r * .5, rgba(c, .35));
  }
}
/* 一颗眼泪顺着脸往下流，再掉下去：从 (x, y) 出发，t0 开始 */
function tearRun(b, x, y, t, t0, faceH, k) {
  const u = t - t0; if (u < 0) return;
  const runT = .7, yy = u < runT ? y + (u / runT) * faceH : y + faceH + 240 * (u - runT) * (u - runT) + (u - runT) * 20;
  for (let j = y; j < Math.min(yy, y + faceH); j++) pdot(b, x, j, 'rgba(168,224,255,.45)');   // 流过的地方留一道湿痕
  prect(b, x, yy, k > 1 ? 2 : 1, k > 1 ? 2 : 1, '#A8E0FF'); pdot(b, x, yy - 1, 'rgba(220,245,255,.8)');
}
function S7(g, t) {
  const w = 160, h = 90, b = pbuf('s7', w, h), gl = glowBuf('s7', w, h);
  psky(b, w, h, [[0, '#070B1E'], [1, '#141D40']]);
  bokeh(b, gl, w, h, 7, t, ['#E7B867', '#8FA8E8', '#E78FB4']);
  prect(b, 0, 70, w, 20, '#10162C');
  const k = 2, shiver = t > ch(4, 4) ? (Math.floor(t * 12) % 2) : 0;
  const mx = 56 + shiver, my = 36;
  let tear = 0; if (t > ch(4, 0)) tear = 1; if (t > ch(4, 2)) tear = 2;
  drawMon(b, mx, my, { eyes: t > ch(4, 0) ? 'sad' : 'dn', tear }, k, NIGHT);
  // 忍不住：眼泪流下来（左右眼轮流）
  [ch(4, 4), ch(4, 4) + .35, ch(4, 5) + .2, ch(4, 6), ch(4, 6) + .3, ch(4, 6) + .55].forEach((s, i) => tearRun(b, mx + (i % 2 ? 17 : 7) * k, my + 5 * k, t, s, 7 * k, k));
  rain(b, t, w, h, { n: 40, v: 120, len: 4, slant: .15, seed: 11, col: 'rgba(160,185,240,.45)' });
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  blit(g, 's7', 12); glowBlit(g, 's7', 12, 0, 0, .6, 3);
}

/* ================= S8：泪滴进水洼 → 倒影 → 扎进去（bar8 ~ bar9） ================= */
function S8(g, t) {
  const t0 = bar(8), lt = t - t0, t1 = bar(9);
  const w = 160, h = 180, b = pbuf('s8', w, h), gl = glowBuf('s8', w, h);
  psky(b, w, 64, [[0, '#070B1E'], [1, '#141D40']]);
  bokeh(b, gl, w, 64, 7, t, ['#E7B867', '#8FA8E8', '#E78FB4']);
  prect(b, 0, 58, w, h - 58, '#111830');
  for (let y = 66; y < h; y += 9) prect(b, 0, y, w, 1, '#151D3A');
  const k = 2, mx = 56, my = 26;
  drawMon(b, mx, my, { eyes: 'sad', tear: 2 }, k, NIGHT);
  // 水洼：倒影一行对一行（不压扁），上下颠倒
  const pcx = 80, pcy = 133, prx = 74, pry = 36, RH = pry * 2;
  pell(b, pcx, pcy, prx, pry, '#0C1228');
  const warm = seg(t, t1 - 1.15, t1 - .25);                   // 倒影慢慢变暖：回忆
  const rf = pbuf('s8r', w, RH);
  psky(rf, w, RH, [[0, mix('#0A1026', '#E07A6A', warm)], [1, mix('#1A2550', '#5A2A6A', warm)]]);
  for (let i = 0; i < 9; i++) { const c = ['#E7B867', '#8FA8E8', '#E78FB4'][i % 3]; pdisc(rf, (i * 23 + 9) % w, 18 + (i * 13) % 30, 3 + i % 3, rgba(c, .14)); }
  if (warm > 0) for (let i = 0; i < 12; i++) pdisc(rf, (i * 23 + 9) % w, 10 + (i * 13) % 40, 2 + i % 3, rgba(['#FF8FB4', '#FFD27A', '#7FE8FF'][i % 3], .55 * warm));
  // 倒影里的我在擦眼泪（"湿衣袖"），袖子湿了一块；身边慢慢多出一个你
  const wipe = t > ch(4, 9) - .05 && t < ch(4, 11) + .9;
  const ro = { eyes: 'sad', armR: wipe ? 'wipe' : 'n', wetR: t > ch(4, 10) ? 1 : 0, tear: wipe ? 0 : 2 };
  const feet = RH - 4, ry0 = feet - 32;                         // 倒影里脚贴着水洼上沿
  drawMon(rf, 56, ry0, ro, k, mix(NIGHT, '#FFE0D0', warm));
  const yu = seg(t, t1 - 1.0, t1 - .35);
  if (yu > 0) {
    rf.save(); rf.globalAlpha = yu; pspr(rf, monster({ col: MON.you, flower: 1, eyes: 'happy', blush: 1 }), 104 - MOX * k, ry0 - MOY * k, k); rf.restore();
    if (yu > .7) { rf.save(); rf.globalAlpha = (yu - .7) / .3; drawMon(rf, 56, ry0, Object.assign({}, ro, { armR: 'n', eyes: 'happy', tear: 0, wetR: 0, blush: 1 }), k, '#FFE8DA'); rf.restore(); }
  }
  const rip = lt < .27 ? 0 : Math.max(0, 1.6 - (lt - .27) * 1.1) + .4 + seg(t, t1 - .45, t1) * 3;
  for (let j = -pry + 1; j < pry; j++) {
    const half = Math.floor(prx * Math.sqrt(1 - (j * j) / (pry * pry)));
    const sy = RH - 1 - (j + pry);
    const off = ri(Math.sin(j * .55 + t * 7) * rip);
    b.drawImage(BUF.s8r, pcx - half - off, sy, half * 2, 1, pcx - half, pcy + j, half * 2, 1);
  }
  pell(b, pcx, pcy, prx - 1, pry - 1, 'rgba(10,16,40,.22)');
  pring(b, pcx, pcy, prx, pry, '#2A3A6A');
  if (warm > 0) pell(gl, pcx, pcy, prx * .8, pry * .7, rgba('#FFB080', .35 * warm));
  // 泪滴：从左眼掉下来，"落"砸进水洼
  const dropT = ch(4, 8) - .25, hitT = ch(4, 8) + .04;
  if (t > dropT && t < hitT) {
    const u = (t - dropT) / (hitT - dropT), y = lerp(my + 10, pcy - 8, u * u);
    prect(b, mx + 7 * k, y, 2, 3, '#A8E0FF'); pdot(b, mx + 7 * k, y - 1, '#DDF4FF');
  }
  for (const [s, a] of [[hitT, 1], [hitT + .25, .7], [ch(4, 10), .5], [ch(4, 11) + .1, .5]]) {
    const u = t - s; if (u < 0 || u > 1.2) continue;
    pring(b, mx + 14, pcy - 8, 3 + u * 40, 1 + u * 14, rgba('#9FC8FF', a * (1 - u / 1.2)));
  }
  if (t > hitT && t < hitT + .2) { const u = (t - hitT) / .2; for (let i = -2; i <= 2; i++) pdot(b, mx + 14 + i * 3, pcy - 9 - ri(Math.sin(u * Math.PI) * 6 * (1 - Math.abs(i) * .3)), '#C8E6FF'); }
  rain(b, t, w, h, { n: 50, v: 150, len: 4, slant: .12, seed: 12, col: 'rgba(160,185,240,.4)' });
  // 镜头：先对着脸，跟着泪滴往下摇到水洼；最后 0.42 秒推进水里
  const camY = lerp(0, 90, E.io(seg(t, dropT, hitT + .2)));
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const dive = seg(t, t1 - .42, t1);
  if (dive > 0) { const s = 1 + E.in(dive) * 5, cx = pcx * 12, cy = (pcy - camY) * 12; g.save(); g.translate(cx, cy); g.scale(s, s); g.translate(-cx, -cy); }
  blit(g, 's8', 12, 0, camY); glowBlit(g, 's8', 12, 0, camY, .6, 3);
  if (dive > 0) g.restore();
  const wash = seg(t, t1 - .2, t1);                          // 最后 0.2 秒越来越白，接上副歌第一拍的闪白
  if (wash > 0) { g.fillStyle = `rgba(255,248,236,${(.85 * wash * wash).toFixed(3)})`; g.fillRect(0, 0, W, H); }
}
