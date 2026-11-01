'use strict';
/* shots4.js —— 主歌二：那时候的爱情（海边单车、大头贴、黄伞下踩水）→ 暴雨里吵架、伞飞走、照片撕开 → 两地的深夜（他也留着另一半）；
   如果当时：倒带 → 回头抱住 → 碎掉，还是一个人；他：便利店、窗上的倒影、一个人走回家。 */

/* ---------------- M-1 海边单车：夕阳、海面的光、灯塔、帆船、海鸥，栏杆往后飞 ---------------- */
function seaside(g, t, o = {}) {
  const sp = o.speed ?? 1, off = t * 60 * sp;
  vgrad(g, 0, 0, W, 150, [[0, '#3A2A7A'], [.35, '#A04A8A'], [.65, '#FF7A5A'], [.85, '#FFB86A'], [1, '#FFE0A0']], .5);
  sglow(g, 330, 120, 180, '#FFB060', .35);
  disc(g, 330, 122, 22, '#FFE8B0'); disc(g, 330, 122, 18, '#FFF4D0');
  for (let i = 0; i < 6; i++) blit(g, cloudSpr(80 + i, 150, 30, ['#7A3A7A', '#C85A7A', '#FF9A7A', '#FFD0A0']), mod(i * 110 - off * .05, W + 170) - 160, 20 + (i % 3) * 22);
  birds(g, t, { n: 4, x: 520, y: 50, sp: -18, dir: -1, col: '#4A2A4A', seed: 7 });
  sea(g, 140, 215, t, { pal: ['#2A2A6A', '#5A3A8A', '#C86A8A'], sunX: 330, sunW: 30, hl: '#FFE6A0' });
  // 远处的海岬和灯塔（光柱扫过来扫过去）
  for (let x = 0; x < 140; x++) { const h = 10 + Math.sin(x / 140 * PI) * 16; R(g, x - mod(off * .08, 600) + 460, 140 - h, 1, h, '#3A2A5A'); }
  const lx = 520 - mod(off * .08, 600); R(g, lx, 106, 6, 22, '#F0E8E8'); R(g, lx, 112, 6, 3, '#D84A4A'); R(g, lx - 1, 103, 8, 3, '#3A3A4A');
  const ba = Math.sin(t * 1.6); g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .18; poly(g, [[lx + 3, 104], [lx + 3 + ba * 200, 90], [lx + 3 + ba * 200, 118]], '#FFF6C0'); g.restore(); glow(g, lx + 3, 104, 8, '#FFF6C0', .8, 3);
  for (let i = 0; i < 3; i++) { const bx = mod(i * 170 - off * .12 + t * 4, W + 60) - 30, by = 150 + i * 6; poly(g, [[bx, by], [bx + 14, by], [bx + 12, by + 3], [bx + 2, by + 3]], '#2A1A3A'); poly(g, [[bx + 6, by - 1], [bx + 6, by - 14], [bx + 13, by - 2]], '#F4E8E0'); }
  // 海堤路：栏杆、路灯往后飞
  R(g, 0, 214, W, 56, '#3A2A48'); R(g, 0, 214, W, 2, '#8A5A6A');
  for (let x = -mod(off, 40); x < W; x += 40) { R(g, x, 196, 3, 18, '#E8D8D0'); }
  R(g, 0, 196, W, 2, '#F0E0D8'); R(g, 0, 204, W, 1, '#C8B0B0');
  for (let x = -mod(off * 1.4, 160); x < W; x += 160) { R(g, x, 120, 3, 94, '#2A1A30'); R(g, x - 6, 118, 12, 3, '#2A1A30'); glow(g, x - 1, 122, 10, '#FFE0A0', .6, 3); }
  for (let x = -mod(off * 2.2, 37); x < W; x += 37) { R(g, x, 240, 2, 2, '#FFD8E0'); R(g, x + 12, 252, 2, 2, '#FFF0A0'); }   // 路边的小野花（最快）
}
function shBikeSea(g, t, u, s) {
  seaside(g, t);
  // 单车：他骑，她侧坐在后座，裙子和头上的花被风吹
  const bx = 200, by = 236 + (fl(t * 8) % 2);
  ring(g, bx + 8, by - 8, 8, '#2A2030'); ring(g, bx + 40, by - 8, 8, '#2A2030'); ring(g, bx + 8, by - 8, 7, '#4A3A50'); ring(g, bx + 40, by - 8, 7, '#4A3A50');
  for (let k = 0; k < 4; k++) { const a = t * 12 + k * PI / 2; line(g, bx + 8, by - 8, bx + 8 + Math.cos(a) * 7, by - 8 + Math.sin(a) * 7, '#8A7A90'); line(g, bx + 40, by - 8, bx + 40 + Math.cos(a) * 7, by - 8 + Math.sin(a) * 7, '#8A7A90'); }
  line(g, bx + 8, by - 8, bx + 20, by - 22, '#3A7AC8'); line(g, bx + 20, by - 22, bx + 38, by - 22, '#3A7AC8'); line(g, bx + 20, by - 22, bx + 24, by - 8, '#3A7AC8'); line(g, bx + 24, by - 8, bx + 40, by - 8, '#3A7AC8'); line(g, bx + 38, by - 22, bx + 40, by - 8, '#3A7AC8');
  R(g, bx + 2, by - 24, 14, 3, '#5A4A3A');
  monAt(g, bx + 36, by - 22, 4, { col: CL.him, cowlick: true, eyes: 'happy', legs: fl(t * 6) % 2 ? 1 : 2, rim: ['#FFB070', 'r'], ol: '#2A1A30' });
  monAt(g, bx + 6, by - 24, 4, { col: CL.her, skirt: true, clip: 'fresh', eyes: 'happy', legs: 'tuck', arms: 'reachR', blush: .5, rim: ['#FFB070', 'r'], ol: '#2A1A30' });
  for (let k = 0; k < 3; k++) { const x = bx - 6 - k * 8 - mod(t * 30, 8), y = by - 34 + Math.sin(t * 6 + k) * 2; R(g, x, y, 3, 1, rgba('#FFFFFF', .5 - k * .15)); }   // 风
  for (let k = 0; k < 4; k++) { const v = mod(t * .8 + k * .25, 1); petal(g, bx + 4 - v * 160, by - 50 + Math.sin(v * 9 + k) * 10 + v * 20, t * 4 + k, { big: true }); }
  if (u > 1.5) { const v = u - 1.5; for (let k = 0; k < 3; k++) { const x = bx + 20 + k * 14, y = by - 60 - v * 24 - k * 6; tiny(g, '♥', x + Math.sin(v * 4 + k) * 3, y, '#FF8AA8'); } }
}

/* ---------------- M-2 大头贴一格一格贴上来：一人一只耳机、娃娃机、掰开的冰棍、栀子树下的合照（后来被撕开的那张） ---------------- */
function boothFrame(g, i, t, w, h) {
  if (i === 0) {                                                  // 海堤上一人一只耳机，音符飘
    vgrad(g, 0, 0, w, h, [[0, '#FF9A7A'], [1, '#FFD8A0']], 1);
    R(g, 0, h - 30, w, 30, '#5A3A5A'); monAt(g, w / 2 - 18, h - 30, 3, { col: CL.her, skirt: true, clip: 'fresh', eyes: 'happy', legs: 'tuck', blush: .5 }); monAt(g, w / 2 + 18, h - 30, 3, { col: CL.him, cowlick: true, eyes: 'happy', legs: 'tuck' });
    for (let k = 0; k <= 20; k++) { const u2 = k / 20; P(g, w / 2 - 12 + u2 * 24, h - 66 + Math.sin(u2 * PI) * 10 + (u2 > .4 && u2 < .6 ? -3 : 0), '#FFFFFF'); }
    for (let k = 0; k < 4; k++) { const v = mod(t * .7 + k * .25, 1); tiny(g, '♥', w / 2 - 20 + k * 12, h - 70 - v * 40, rgba('#FFFFFF', 1 - v)); }
  } else if (i === 1) {                                           // 娃娃机
    R(g, 0, 0, w, h, '#2A1A4A'); R(g, 14, 10, w - 28, h - 34, '#FF4FA0'); R(g, 18, 14, w - 36, h - 50, '#9FE0FF');
    for (let k = 0; k < 7; k++) disc(g, 26 + k * 9, h - 46 - (k % 2) * 5, 4, ['#FFE14F', '#FF7FB0', '#7FE8FF', '#FFFFFF'][k % 4]);
    const cx = 30 + (Math.sin(t * 2) * .5 + .5) * (w - 60); line(g, cx, 14, cx, 30 + Math.abs(Math.sin(t * 2)) * 8, '#5A5A6A'); R(g, cx - 4, 30 + Math.abs(Math.sin(t * 2)) * 8, 9, 3, '#C8C8D8');
    monAt(g, w / 2 - 14, h - 4, 2, { col: CL.her, skirt: true, eyes: 'up', clip: 'fresh' }); monAt(g, w / 2 + 14, h - 4, 2, { col: CL.him, cowlick: true, eyes: 'up', arms: 'up' });
    glow(g, w / 2, h / 2, w * .5, '#FF4FA0', .2, 4);
  } else if (i === 2) {                                           // 便利店门口，冰棍掰两半
    R(g, 0, 0, w, h, '#2A3A6A'); R(g, 6, 6, w - 12, h - 40, '#E8FFFF'); for (let k = 0; k < 5; k++) R(g, 10 + k * 16, 12, 12, h - 54, ['#FFB070', '#7FE8FF', '#FF9AB8', '#B8F0A0', '#FFE14F'][k]);
    R(g, 0, h - 34, w, 34, '#4A4A5A');
    monAt(g, w / 2 - 18, h - 6, 3, { col: CL.her, skirt: true, clip: 'fresh', eyes: 'happy', legs: 'tuck', arms: 'reachR' }); monAt(g, w / 2 + 18, h - 6, 3, { col: CL.him, cowlick: true, eyes: 'happy', legs: 'tuck', arms: 'reachL' });
    R(g, w / 2 - 6, h - 40, 4, 10, '#9FE0FF'); R(g, w / 2 + 2, h - 40, 4, 10, '#9FE0FF'); R(g, w / 2 - 5, h - 30, 1, 5, '#E8D0A0'); R(g, w / 2 + 3, h - 30, 1, 5, '#E8D0A0');
  } else {                                                        // 栀子树下的合照
    photoSceneBoth(g, t, w, h);
  }
}
function photoSceneBoth(q, t, w, h) {
  vgrad(q, 0, 0, w, h, [[0, '#7EC8F0'], [1, '#CFEAF8']], 1);
  R(q, 0, h - 30, w, 30, '#6AB06A'); grass(q, 0, w, h - 30, t, { h: 4 });
  tree(q, w * .45, h - 28, { s: .8, flowers: 6, seed: 4 }, t);
  monAt(q, w * .3, h - 12, 3, { col: CL.her, skirt: true, clip: 'fresh', eyes: 'happy', blush: .6 });
  monAt(q, w * .72, h - 12, 3, { col: CL.him, cowlick: true, eyes: 'happy', blush: .4 });
  heart(q, w / 2 - 3, h - 46, '#FF7A9A');
}
function shMontage(g, t, u, s) {
  R(g, 0, 0, W, H, '#F4D8C8');
  for (let i = 0; i < 40; i++) { const x = hash(i, 1) * W, y = hash(i, 2) * H; tiny(g, ['♥', '+', '.'][i % 3], x, y, ['#FFB0C0', '#FFFFFF', '#E8A8C8'][i % 3]); }
  for (let y = 0; y < H; y += 12) for (let x = (y / 12 % 2) * 6; x < W; x += 12) P(g, x, y, '#ECCCBC');
  const step = (s.e - s.t) / 4;
  for (let i = 0; i < 4; i++) {
    const t0 = i * step, v = seg(u, t0, t0 + .22); if (v <= 0) continue;
    const pw = 104, ph = 136, x = 18 + i * 114, y = 30 + (i % 2) * 14 - ri((1 - E.back(v)) * 30);
    R(g, x + 4, y + 4, pw, ph, 'rgba(60,30,30,.3)'); R(g, x, y, pw, ph, '#FFFFFF');
    const q = layer('booth' + i, pw - 10, ph - 30); boothFrame(q, i, t, pw - 10, ph - 30); g.drawImage(LAYER['booth' + i], x + 5, y + 5);
    tiny(g, "'09 7 " + (17 + i * 3), x + 8, y + ph - 20, '#FF8A2A');
    if (v < 1) { g.save(); g.globalAlpha = 1 - v; R(g, x, y, pw, ph, '#FFFFFF'); g.restore(); }
    R(g, x + pw / 2 - 10, y - 6, 20, 10, rgba('#FFF0A0', .7));                       // 胶带
  }
}

/* ---------------- 雨中小路（一起撑黄伞 / 暴雨吵架 / 跑开） ---------------- */
function rainPath(g, t, o = {}) {
  const st = o.storm || 0, cam = o.cam || 0;
  vgrad(g, 0, 0, W, 170, [[0, mix('#7AB8E0', '#2A2E3E', st)], [.7, mix('#B8D8EC', '#3A3E50', st)], [1, mix('#D8E8F0', '#4A4E5E', st)]], .6);
  if (o.rainbow) { const a = o.rainbow; for (let k = 0; k < 6; k++) { g.save(); g.globalAlpha = .28 * a; ring(g, 300, 210, 150 - k * 3, ['#FF5A5A', '#FFA040', '#FFE04A', '#5AD86A', '#4A9AF0', '#9A5AE0'][k]); ring(g, 300, 210, 149 - k * 3, ['#FF5A5A', '#FFA040', '#FFE04A', '#5AD86A', '#4A9AF0', '#9A5AE0'][k]); g.restore(); } }
  for (let i = 0; i < 6; i++) blit(g, cloudSpr(140 + i, 170, 44, st > .3 ? ['#1A1C28', '#2A2C3A', '#3A3E50', '#4E5266'] : ['#9AB0C8', '#C8D8E8', '#E8F0F8', '#FFFFFF']), mod(i * 100 - t * (4 + st * 40), W + 180) - 170, 6 + (i % 3) * 18);
  if (o.flash) { g.save(); g.globalAlpha = o.flash; R(g, 0, 0, W, H, '#E8ECFF'); g.restore(); }
  // 远处的教学楼一角、围墙
  g.save(); g.globalAlpha = .9; school(g, -100 - cam * .3, 160, t, { night: st * .3 }); g.restore();
  R(g, 0, 150, W, 14, mix('#C8B8A8', '#4A4A58', st)); for (let x = -mod(cam * .6, 30); x < W; x += 30) R(g, x, 150, 2, 14, mix('#A89888', '#3A3A48', st));
  // 绣球花丛（夏天的雨）
  for (let i = 0; i < 12; i++) {
    const x = mod(i * 47 - cam * .8, W + 60) - 30, y = 176 + (i % 2) * 6;
    blit(g, leafClump(14, [mix('#1E5A3A', '#18282A', st), mix('#2E7A48', '#20382E', st), mix('#4AA05A', '#2A4A38', st), mix('#7AC86A', '#38583E', st)], 200 + i, 0), x - 16, y - 16);
    for (let k = 0; k < 6; k++) disc(g, x - 8 + (k % 3) * 8, y - 10 + fl(k / 3) * 8, 4, mix(['#8A9AF0', '#B88AE8', '#7AB8F0'][(i + k) % 3], '#4A4A6A', st * .6));
  }
  // 路面：湿的，水洼倒影
  vgrad(g, 0, 190, W, 80, [[0, mix('#8A8A9A', '#3A3A48', st)], [1, mix('#6A6A7A', '#24242E', st)]], 1);
  for (let x = -mod(cam, 24); x < W; x += 24) R(g, x, 190, 1, 80, mix('#7A7A8A', '#2E2E3A', st));
  reflect(g, 190, 60, t, { k: .35, amp: 1.5, tint: st > .5 ? '#202030' : '#8AA8C8', tk: .3 });
  [[80, 230], [260, 246], [400, 226]].forEach(([px, py], i) => { const x = mod(px - cam, W + 60) - 30; ell2(g, x, py, 24, 4, rgba('#FFFFFF', .3)); const ru = mod(t * 1.5 + i * .3, 1); ell2(g, x + 4, py, ru * 12, ru * 2.4, rgba('#FFFFFF', .6 * (1 - ru))); });
  // 小蜗牛
  if (!st) { const sx = 150 - cam * .8 + t * 1.2; R(g, sx, 182, 5, 2, '#C8B8A0'); ring(g, sx + 2, 179, 2, '#A0704A'); }
}
function rainFX(g, t, st) {
  rain(g, t, { n: 120 + st * 160, sp: 360 + st * 300, len: 6 + st * 8, sl: .1 + st * .5, col: `rgba(200,215,240,${.35 + st * .2})`, seed: 61 });
  splashes(g, t, { n: 30 + st * 40, y0: 192, y1: 262, col: 'rgba(230,240,255,.7)' });
}
/* M-3 黄伞下一起走，她跳进水洼溅起水花；太阳雨，天边一道彩虹 */
function shUmbrellaWalk(g, t, u, s) {
  const cam = u * 24;
  rainPath(g, t, { cam, rainbow: seg(u, 1.5, 3.5) });
  const x = 220, wk = walk(t, 3.5, 4), jump = u > 2.6 && u < 3.3 ? Math.sin(seg(u, 2.6, 3.3) * PI) * 12 : 0;
  monAt(g, x - 22, 238 + wk.bob - ri(jump), 4, { col: CL.her, skirt: true, clip: 'fresh', eyes: 'happy', legs: jump ? 'tuck' : wk.legs, blush: .4, ol: '#2A2A3A' });
  monAt(g, x + 22, 238 + walk(t + .1, 3.5, 4).bob, 4, { col: CL.him, cowlick: true, arms: 'holdR', eyes: u > 2.8 ? 'happy' : 'l', legs: walk(t + .1, 3.5).legs, ol: '#2A2A3A' });
  umbrella(g, x + 4, 166, 40, { col: '#F2C94C', stick: 36 });
  if (u > 3.25 && u < 4.2) { const v = seg(u, 3.25, 4.2); for (let k = 0; k < 14; k++) { const a = PI + k / 13 * PI, r = v * 30; R(g, x - 22 + Math.cos(a) * r, 240 + Math.sin(a) * r * .6 + v * v * 20, 2, 2, rgba('#E8F4FF', 1 - v)); } }
  rainFX(g, t, 0);
  if (u > 3.4) for (let k = 0; k < 3; k++) { const v = mod(u - 3.4 + k * .3, 1.2); tiny(g, '♥', x - 30 + k * 26, 160 - v * 30, rgba('#FF8AA8', 1 - v / 1.2)); }
}
/* M-4 天一下子黑了：暴雨、风、闪电；两个人面对面吵，头上冒出乱线 */
function shStormGather(g, t, u, s) {
  const st = E.io(seg(u, 0, 1.2)), fl1 = u > 1.6 && u < 1.75 ? 1 : u > 2.6 && u < 2.7 ? .7 : 0;
  rainPath(g, t, { storm: st, flash: fl1 * .8 });
  if (fl1) { const lx = 340; let x = lx, y = 0; g.fillStyle = '#FFFFFF'; for (let k = 0; k < 16; k++) { const nx = x + (hash(k, fl(u * 3)) - .5) * 30, ny = y + 10; line(g, x, y, nx, ny, '#FFFFFF'); x = nx; y = ny; } }
  monAt(g, 200, 238, 5, { col: CL.her, skirt: true, clip: 'fresh', eyes: u > .9 ? 'sad' : 'r', ol: '#1A1A24', rim: fl1 ? ['#FFFFFF', 'b'] : undefined });
  monAt(g, 290, 238, 5, { col: CL.him, cowlick: true, eyes: u > .9 ? 'sad' : 'l', arms: 'holdR', ol: '#1A1A24' });
  umbrella(g, 320, 160, 30, { col: mix('#F2C94C', '#7A6A3A', st * .5), stick: 26 });
  if (u > 1.0) for (let k = 0; k < 2; k++) {                      // 吵架的乱线
    const cx = k ? 300 : 196, cy = 168 - k * 4;
    for (let j = 0; j < 14; j++) { const a = j * 2.3 + t * 9, r = 5 + (j % 4); P(g, cx + Math.cos(a) * r, cy + Math.sin(a * 1.3) * r * .6, k ? '#FFFFFF' : '#FFE0E0'); }
    tiny(g, ['#!', '?!'][k], cx - 3, cy - 14 + ri(Math.sin(t * 8 + k) * 1), '#FFFFFF');
  }
  for (let i = 0; i < 12; i++) { const v = mod(t * .9 + i * .083, 1); const x = W - v * 520, y = 60 + hash(i, 3) * 140 + Math.sin(v * 8 + i) * 10; bigLeaf(g, x, y, 6, v * 9 + i, ['#1E3A2A', '#2E4A36', '#3A5A42', '#4A6A4E']); }   // 被风吹走的叶子
  rainFX(g, t, st);
}
/* M-5 仰拍：乌云、闪电、雨冲着镜头，黄伞翻着飞过天；底下她转身走开，他伸手 */
function shUmbrellaFly(g, t, u, s) {
  vgrad(g, 0, 0, W, H, [[0, '#14161E'], [.6, '#2A2C3A'], [1, '#3A3E50']], 1);
  for (let i = 0; i < 8; i++) blit(g, cloudSpr(140 + i, 200, 50, ['#0E1018', '#1A1C28', '#2A2C3A', '#3A3E50']), mod(i * 90 - t * 60, W + 220) - 200, -10 + (i % 4) * 26);
  const fl1 = (u > .5 && u < .62) || (u > 1.9 && u < 2.0) ? 1 : 0;
  if (fl1) { g.save(); g.globalAlpha = .6; R(g, 0, 0, W, H, '#DDE4FF'); g.restore(); let x = 120 + fl(u) * 160, y = 0; for (let k = 0; k < 18; k++) { const nx = x + (hash(k, fl(u * 2)) - .5) * 34, ny = y + 12; line(g, x, y, nx, ny, '#FFFFFF'); line(g, x + 1, y, nx + 1, ny, '#C8D4FF'); x = nx; y = ny; } }
  const v = seg(u, 0, 3.2), ux = lerp(60, 560, v), uy = lerp(230, -60, v) + Math.sin(v * 7) * 20, rot = Math.sin(v * 9);
  g.save(); g.translate(ri(ux), ri(uy)); if (rot < 0) g.scale(1, -1); umbrella(g, 0, -20, 46, { col: '#F2C94C', stick: 34 }); g.restore();
  for (let i = 0; i < 18; i++) { const vv = mod(t * .7 + i / 18, 1); bigLeaf(g, W - vv * 560, 40 + hash(i, 3) * 180 + Math.sin(vv * 8 + i) * 12, 7, vv * 9 + i, ['#1E3A2A', '#2E4A36', '#3A5A42', '#4A6A4E']); }
  // 底下：两个人的剪影
  R(g, 0, 240, W, 30, '#0E1016');
  monAt(g, lerp(150, 80, seg(u, .4, 3)), 244, 4, { col: '#1A1C26', skirt: true, clip: 'fresh', eyes: 'back', legs: walk(t, 3).legs, rim: fl1 ? ['#FFFFFF', 'b'] : ['#5A6080', 'l'] });
  monAt(g, 340, 244, 4, { col: '#1A1C26', cowlick: true, eyes: 'l', arms: u > 1.0 ? 'reachL' : 'n', rim: fl1 ? ['#FFFFFF', 'b'] : ['#5A6080', 'r'] });
  rain(g, t, { n: 220, sp: 700, len: 16, sl: .55, col: 'rgba(200,215,240,.45)', seed: 61 });
}
/* M-5b 照片被撕开（近景，雨点打在照片上） */
function shPhotoTear(g, t, u, s) {
  R(g, 0, 0, W, H, '#2A2C38'); rain(g, t, { n: 160, sp: 600, len: 12, sl: .4, col: 'rgba(200,215,240,.4)', seed: 71 });
  const v = E.out(seg(u, .1, .8)), pw = 200, ph = 150, px = 140, py = 50;
  const q = layer('tearP', pw - 16, ph - 40); photoSceneBoth(q, 0, pw - 16, ph - 40);
  [[0, -1], [1, 1]].forEach(([half, dir]) => {
    const dx = dir * v * 60, rot = dir * v * 10, hw = pw / 2;
    g.save(); g.translate(ri(px + half * hw + dx), ri(py + v * 14 * (half ? 1 : 0.4) + rot));
    R(g, 0, 0, hw, ph, '#F4F0E8'); g.drawImage(LAYER.tearP, half ? 0 : 8, 8, hw - 8, ph - 40, half ? 0 : 8, 8, hw - 8, ph - 40);
    for (let yy = 0; yy < ph; yy++) { const e = half ? 0 : hw - 1, j = ri(Math.sin(yy * 1.3) * 2 + Math.sin(yy * .37) * 2); R(g, e + (half ? j : -j), yy, 2, 1, '#FFFFFF'); }
    g.restore();
  });
  for (let i = 0; i < 12; i++) { const x = px + hash(i, 5) * pw, y = py + hash(i, 6) * ph; R(g, x, y, 2, 2, rgba('#C8E0FF', .7)); }
  R(g, px - 30, py + 60, 30, 20, CL.her); R(g, px + pw, py + 70, 30, 20, CL.him);
}
/* M-6 她跑开，他站在雨里，黄伞翻在水洼里 */
function shRunAway(g, t, u, s) {
  const cam = u * 40;
  rainPath(g, t, { storm: 1, cam });
  const hx = 300 - cam;
  if (hx > -40) { monAt(g, hx, 238, 4, { col: CL.him, cowlick: true, eyes: 'dn', ol: '#1A1A24' }); R(g, hx - 18, 222, 10, 8, '#F4F0E8'); }   // 他手里留着撕下的那一半
  const ux = 360 - cam; g.save(); g.translate(ri(ux), 250); g.scale(1, -1); umbrella(g, 0, 0, 22, { col: '#9A8A4A', stick: 14 }); g.restore();
  const wk = walk(t, 7, 4);
  monAt(g, 150 + u * 6, 238 + wk.bob, 4, { col: CL.her, skirt: true, clip: 'fresh', eyes: 'l', legs: wk.legs, tear: .8, ol: '#1A1A24' });
  for (let k = 0; k < 3; k++) { const x = 170 + u * 6 + k * 10, y = 236 - k; R(g, x, y, 2, 1, rgba('#E8F4FF', .6)); }
  rainFX(g, t, 1);
}

/* ---------------- 他的房间（另一座城市）：吉他、星星海报、门边一把黄伞、鱼缸 ---------------- */
function himRoom(g, t, o = {}) {
  R(g, 0, 0, W, H, '#1E2A40');
  for (let y = 0; y < 196; y += 16) R(g, 0, y, W, 1, '#22304A');
  const wx = 60, wy = 30, ww = 180, wh = 110, q = layer('win2', ww, wh);
  vgrad(q, 0, 0, ww, wh, [[0, '#0A0C24'], [1, '#2A2050']], 1);
  stars(q, t, { seed: 13, n: 20, w: ww, h: 40, a: .6 }); moon(q, 140, 26, 9, { ga: .6 });
  const CP = cityParts(); drawCity(q, CP.far, -200, -110, t);
  rain(q, t, { n: 40, sp: 300, len: 5, sl: .15, col: 'rgba(190,205,255,.4)', w: ww, h: wh, seed: 72 });
  g.drawImage(LAYER.win2, wx, wy);
  R(g, wx - 5, wy - 5, ww + 10, 5, '#3A4A5A'); R(g, wx - 5, wy + wh, ww + 10, 7, '#4A5A6A'); R(g, wx - 5, wy, 5, wh, '#3A4A5A'); R(g, wx + ww, wy, 5, wh, '#3A4A5A'); R(g, wx + ww / 2 - 2, wy, 4, wh, '#3A4A5A');
  // 墙上：星星海报、吉他
  R(g, 290, 30, 60, 80, '#14183A'); stars(g, t, { seed: 33, n: 30, x: 292, y: 32, w: 56, h: 60, big: .1 }); txt(g, '流星雨', 320, 94, '#FFE27A', { align: 'c' });
  ell(g, 400, 140, 14, 20, '#C8803A'); ell(g, 400, 112, 10, 12, '#C8803A'); disc(g, 400, 132, 4, '#3A2A1A'); R(g, 398, 50, 4, 60, '#5A3A1A'); R(g, 396, 44, 8, 8, '#3A2A1A');
  // 床、地板、门边的黄伞、鱼缸
  R(g, 0, 196, W, 74, '#2A2430'); R(g, 250, 160, 170, 40, '#4A5A7A'); R(g, 250, 156, 170, 6, '#E8E8F0'); R(g, 252, 150, 30, 10, '#F4F4F8');
  R(g, 440, 120, 4, 80, '#F2C94C'); poly(g, [[436, 124], [448, 124], [446, 170], [438, 170]], '#E2B83C');
  R(g, 110, 150, 40, 30, rgba('#9FD8FF', .4)); ring2(g, 110, 150, 40, 30, rgba('#FFFFFF', .5)); const fx = 120 + Math.sin(t) * 10; R(g, fx, 162, 5, 3, '#FF7A3A'); P(g, fx + (Math.cos(t) > 0 ? 5 : -1), 163, '#FF7A3A');
  R(g, 100, 180, 60, 16, '#5A4A3A');
  glow(g, 130, 165, 30, '#9FD8FF', .2, 4);
}
/* N-1 两地的深夜：左边她的房间，右边他的房间，中间一道窗框隔开，两边窗外是同一个月亮 */
function shSplitNight(g, t, u, s) {
  const L = layer('splitL'); roomBase(L, t); monAt(L, 236, 196, 5, { col: CL.her, clip: 'dry', eyes: 'dn', legs: 'tuck', ol: '#1A1428', rim: ['#FFC870', 'r'] });
  const Rr = layer('splitR'); himRoom(Rr, t); monAt(Rr, 330, 160, 5, { col: CL.him, cowlick: true, eyes: 'up', legs: 'tuck', ol: '#101828', rim: ['#9FD8FF', 'l'] });
  const k = E.out(seg(u, 0, .6)), half = ri(240 * k);
  g.drawImage(LAYER.splitL, 120, 0, 240, H, 0, 0, 240, H);
  g.drawImage(LAYER.splitR, 120, 0, 240, H, 240, 0, 240, H);
  R(g, 236, 0, 8, H, '#0A0A14'); R(g, 239, 0, 2, H, rgba('#FFFFFF', .25));
  moon(g, 240, 22, 10, { ga: .7 });
}
/* N-2 他手里那一半照片（只有他） */
function shHisHalf(g, t, u, s) {
  himRoom(g, t); g.save(); g.globalAlpha = .55; R(g, 0, 0, W, H, '#0A0E1E'); g.restore();
  const px = 150, py = 40, pw = 180, ph = 170;
  R(g, px + 5, py + 5, pw, ph, 'rgba(0,0,0,.4)'); R(g, px, py, pw, ph, '#F4F0E8');
  const q = layer('hisP', pw - 10, ph - 40); vgrad(q, 0, 0, pw - 10, ph - 40, [[0, '#7EC8F0'], [1, '#CFEAF8']], 1);
  R(q, 0, ph - 70, pw, 30, '#6AB06A'); grass(q, 0, pw, ph - 70, t, { h: 4 }); blit(q, leafClump(20, LEAF, 9, 8), 100, 2); blit(q, leafClump(16, LEAF, 10, 6), 130, 20); R(q, 132, 44, 5, 50, '#5A3A2A');
  monAt(q, 70, ph - 52, 6, { col: CL.him, cowlick: true, eyes: 'happy', blush: .4 }); heart(q, 10, 40, '#FF7A9A', 2);
  g.drawImage(LAYER.hisP, px + 5, py + 10);
  for (let yy = py; yy < py + ph; yy++) { const e = px + ri(Math.sin(yy * .9) * 3 + Math.sin(yy * .23) * 4); R(g, px - 8, yy, e - px + 8, 1, '#0E1424'); P(g, e, yy, '#FFFFFF'); }
  tiny(g, "'09 7 17", px + pw - 50, py + ph - 22, '#FF8A2A');
  for (let i = 0; i < 16; i++) { const per = 2 + hash(i, 3) * 2, v = mod(t + hash(i, 4) * per, per) / per; g.save(); g.globalAlpha = .18; R(g, px + hash(i, 5) * pw, py + v * ph, 2, 8, '#0A1020'); g.restore(); }   // 窗上雨水的影子
  R(g, px + pw - 10, py + 100, 40, 24, CL.him); R(g, px + pw - 10, py + 100, 40, 3, lt(CL.him, .3));
  glow(g, px + pw / 2, py + ph / 2, 120, '#9FC8FF', .1, 6);
}
/* N-3 拉远：一座大城市，两扇亮着的窗隔得很远；中间一列车开过去；云散开，露出月亮 */
function shTwoWindows(g, t, u, s) {
  vgrad(g, 0, 0, W, H, NIGHT_SKY, .55);
  stars(g, t, { seed: 4, n: 80, h: 130, a: .6 });
  moon(g, 240, 50, 12, { ga: .8 });
  for (let i = 0; i < 4; i++) blit(g, cloudSpr(60 + i, 170, 40, ['#26184A', '#36225E', '#56327A', '#7E4892']), mod(i * 140 + (i % 2 ? 1 : -1) * u * 40, W + 180) - 170, 30 + (i % 2) * 24, { a: 1 - seg(u, 1, 4) * .6 });
  const CP = cityParts();
  drawCity(g, CP.far, -20, 0, t); drawCity(g, CP.mid, -40, -40, t);
  railTrack(g, 200, t); lightRail(g, W + 40 - mod(t, 6) * 140, 200, t, { cars: 5 });
  [[70, 150], [410, 140]].forEach(([x, y], k) => { R(g, x - 14, y, 28, 110, '#120E24'); R(g, x - 4, y + 16, 8, 8, '#FFD27A'); glow(g, x, y + 20, 22, '#FFD27A', .5 + .2 * Math.sin(t * 2 + k), 5); });
  for (let k = 0; k <= 40; k++) { const v = k / 40, x = lerp(70, 410, v), y = 150 - Math.sin(v * PI) * 60 + Math.sin(t * 2 + k) * 1; if (k % 2 === 0) { g.globalAlpha = .25 * seg(u, 1.5, 3); P(g, x, y, '#FFE6A0'); g.globalAlpha = 1; } }
  rain(g, t, { n: 50, sp: 320, len: 5, sl: .15, col: 'rgba(170,190,255,.3)', seed: 81 });
}

/* ---------------- 如果当时：倒带 / 回头 / 碎掉 ---------------- */
function shRewind(g, t, u, s) {
  const rt = 109.0 - u * 2.4;                                   // 倒着放：从撕照片退回到伞还在手里
  if (rt > 105.85) shPhotoTearBack(g, t, rt); else shUmbrellaFly(g, rt, rt - 105.85, { t: 105.85, e: 109.05 });
  // 倒带的界面：◀◀、时间码、跟踪线
  for (let i = 0; i < 4; i++) { const y = mod(fl(u * 400 + i * 77), H); R(g, 0, y, W, 2, rgba('#FFFFFF', .25)); }
  glitchLines(g, .6, fl(u * 30));
  if (fl(u * 3) % 2 === 0) txt(g, '◀◀', 30, 20, '#FFFFFF', { ol: '#000000' });
  tiny(g, 'REW  ' + fl(rt / 60) + ':' + String(fl(rt % 60)).padStart(2, '0'), 64, 24, '#FFFFFF');
}
function shPhotoTearBack(g, t, rt) { shPhotoTear(g, rt, Math.max(0, rt - 109.05 + .9), {}); }
function shAltTurnBack(g, t, u, s) {
  const clear = E.io(seg(u, 1.2, 3.6));
  rainPath(g, t, { storm: 1 - clear, rainbow: seg(u, 2.4, 4) });
  if (clear > .2) rays(g, 360, 0, t, { n: 7, ang: -.25, len: 300, col: '#FFF6D0', a: .14 * clear, spread: 200 });
  const run = E.io(seg(u, 0, 1.2)), x = lerp(150, 262, run);
  monAt(g, x, 238, 5, { col: CL.her, skirt: true, clip: 'fresh', eyes: run > .9 ? 'happy' : 'r', legs: run < 1 ? walk(t, 7).legs : 0, arms: run > .9 ? 'hug' : 'n', blush: .5, ol: '#1A1A24' });
  monAt(g, 316, 238, 5, { col: CL.him, cowlick: true, eyes: run > .9 ? 'happy' : 'l', arms: run > .9 ? 'hug' : 'holdR', blush: .5, ol: '#1A1A24' });
  umbrella(g, 300, 160, 36, { col: '#F2C94C', stick: 28 });
  if (u > 1.2) for (let k = 0; k < 4; k++) { const v = mod(u * .8 + k * .25, 1); heart(g, 280 + Math.sin(v * 6 + k) * 20, 170 - v * 60, '#FF8AA8'); }
  rainFX(g, t, Math.max(0, .6 - clear));
}
function shShatterAlone(g, t, u, s) {
  const crack = seg(u, .2, 1.4), fall = seg(u, 1.5, 3.4);
  // 底下：现在，楼顶，一个人，手里拿着那一半照片
  rooftopScene(g, t, { sky: 0 });
  monAt(g, 280, 212, 4, { col: CL.her, clip: 'dry', eyes: 'dn', ol: '#140E24', rim: ['#FF7AB0', 'l'] });
  R(g, 262, 188, 10, 8, '#F4F0E8');
  if (fall >= 1) return;
  // 上面：那个"如果"的画面，裂开、碎掉
  const A = layer('alt'); shAltTurnBack(A, s.t - .01, 4.3, { t: 131.48 });
  const q = layer('altCrack'); q.drawImage(LAYER.alt, 0, 0);
  for (let k = 0; k < 9; k++) {                                  // 裂纹从中间往外长
    let x = 260, y = 170; const ang = k / 9 * TAU + .3, len = crack * 260;
    for (let d = 0; d < len; d += 6) { const nx = x + Math.cos(ang + (hash(k, d) - .5) * .8) * 6, ny = y + Math.sin(ang + (hash(k, d + 1) - .5) * .8) * 6; line(q, x, y, nx, ny, '#FFFFFF'); x = nx; y = ny; }
  }
  if (fall <= 0) { g.drawImage(LAYER.altCrack, 0, 0); return; }
  TRANS.shatter(g, LAYER.altCrack, layerCanvasOf(g), fall);
}
function layerCanvasOf(g) { const c = layer('under'); c.drawImage(g.canvas, 0, 0); return LAYER.under; }

/* ---------------- 他：便利店 ---------------- */
function storeInterior(g, t, o = {}) {
  vgrad(g, 0, 0, W, H, [[0, '#E8F4F4'], [1, '#C8D8DC']], 1);
  R(g, 0, 0, W, 10, '#F8FFFF'); for (let x = 30; x < W; x += 90) { R(g, x, 10, 40, 3, '#FFFFFF'); glow(g, x + 20, 12, 40, '#FFFFFF', .2, 4); }
  // 货架：一排排彩色的小商品
  for (let sh = 0; sh < 3; sh++) {
    const x0 = 20 + sh * 120, y0 = 60;
    R(g, x0, y0, 100, 130, '#8A9AA8'); for (let r = 0; r < 5; r++) { const y = y0 + 6 + r * 25; R(g, x0 + 3, y + 20, 94, 3, '#C8D4DC'); for (let k = 0; k < 11; k++) { const c = ['#FF6A5A', '#FFC84A', '#5AC8FF', '#7AE87A', '#FF8AC8', '#FFFFFF', '#B88AFF'][fl(hash(k + r * 11, sh) * 7)]; const h = 10 + fl(hash(k, r + sh * 5) * 8); R(g, x0 + 5 + k * 8, y + 20 - h, 7, h, c); R(g, x0 + 5 + k * 8, y + 20 - h, 7, 1, lt(c, .4)); } }
  }
  // 冰柜（右边，发蓝光）
  R(g, 380, 50, 100, 150, '#3A4A5A'); for (let k = 0; k < 3; k++) { R(g, 384 + k * 32, 54, 28, 142, '#9FE8FF'); for (let r = 0; r < 6; r++) for (let j = 0; j < 3; j++) R(g, 388 + k * 32 + j * 8, 60 + r * 22, 6, 14, ['#FF7A5A', '#5AC8FF', '#FFE04A', '#7AE87A'][(r + j + k) % 4]); R(g, 384 + k * 32, 54, 2, 142, rgba('#FFFFFF', .6)); }
  glow(g, 430, 120, 80, '#9FE8FF', .2, 6);
  R(g, 0, 200, W, 70, '#D8E0E4'); for (let x = 0; x < W; x += 30) R(g, x, 200, 1, 70, '#C8D0D4'); for (let y = 210; y < H; y += 20) R(g, 0, y, W, 1, '#C8D0D4');
}
function shStore(g, t, u, s) {
  storeInterior(g, t);
  // 他：开冰柜拿出一根冰棍（和当年掰开的那种一样）
  const open = seg(u, .4, 1.0), take = seg(u, 1.4, 2.2);
  monAt(g, 330, 232, 7, { col: CL.him, cowlick: true, eyes: u > 2.2 ? 'dn' : 'r', arms: take > 0 && take < 1 ? 'reachR' : (take >= 1 ? 'holdR' : 'n'), ol: '#2A3A4A' });
  if (take >= 1) { R(g, 388, 168, 7, 18, '#9FE0FF'); R(g, 390, 186, 2, 8, '#E8D0A0'); R(g, 388, 168, 7, 2, '#E8FFFF'); }
  g.save(); g.globalAlpha = .5 * open; R(g, 384, 54, 28, 142, '#FFFFFF'); g.restore();
  // 店员在打瞌睡、门口的猫、门外的雨
  R(g, 20, 190, 80, 10, '#B8C4CC'); monAt(g, 60, 190, 3, { col: '#B07F9E', eyes: 'shut', legs: 'tuck' }); tiny(g, 'Z', 76, 160 - ri(mod(t, 2) * 3), '#5A6A8A');
  cat(g, 140, 240, 'sit', t, { col: '#F2B060', col2: '#C88040' });
  tiny(g, '24H', 8, 2, '#3A9A5A');
}
/* B-2 街对面看过去：雨夜里亮着的便利店，他坐在窗边吃冰棍，先笑了一下，又不笑了 */
function shStoreReflect(g, t, u, s) {
  vgrad(g, 0, 0, W, H, [[0, '#0A0C20'], [1, '#1A1A34']], 1);
  for (let i = 0; i < 5; i++) { const x = i * 100 - 20; R(g, x, 20, 90, 200, '#14142A'); for (let k = 0; k < 4; k++) for (let r = 0; r < 7; r++) if (hash(i * 9 + k, r) < .3) R(g, x + 8 + k * 20, 30 + r * 22, 8, 10, WARM[(k + r) % 4]); }
  // 店面
  const sx = 110, sy = 60, sw = 260, sh = 150;
  R(g, sx - 6, sy - 26, sw + 12, 26, '#1E2A3A'); R(g, sx - 6, sy - 26, sw + 12, 3, '#3FF0FF'); const on = neonOn(t, 7); txt(g, '便利店', sx + sw / 2, sy - 20, on ? '#BFFAFF' : '#2A7A8A', { align: 'c' }); if (on) glow(g, sx + sw / 2, sy - 14, 40, '#3FF0FF', .4, 4);
  tiny(g, '24H', sx + 4, sy - 18, '#5CFF9D');
  const q = layer('storeIn'); storeInterior(q, t);
  monAt(q, 240, 214, 9, { col: CL.him, cowlick: true, eyes: u < 1.5 ? 'happy' : 'dn', legs: 'tuck', blush: u < 1.5 ? .3 : 0, arms: 'holdR', ol: '#2A3A4A' });
  R(q, 300, 118, 9, 22, '#9FE0FF'); R(q, 304, 140, 2, 10, '#E8D0A0'); R(q, 300, 118, 9, 2, '#E8FFFF');
  g.drawImage(LAYER.storeIn, 120, 50, sw, sh, sx, sy, sw, sh);
  R(g, sx, sy + sh - 30, sw, 6, '#A8B8C0');                               // 窗边的长桌
  for (let k = 1; k < 4; k++) R(g, sx + k * sw / 4, sy, 2, sh, '#3A4A5A'); ring2(g, sx, sy, sw, sh, '#3A4A5A');
  R(g, sx + 14, sy + 14, 30, 20, '#FF6A5A'); txt(g, '冰棍', sx + 17, sy + 18, '#FFFFFF'); R(g, sx + sw - 46, sy + 14, 32, 20, '#FFE04A'); tiny(g, 'SALE', sx + sw - 42, sy + 21, '#3A2A10');
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .14; poly(g, [[sx, sy + sh], [sx + sw, sy + sh], [sx + sw + 60, H], [sx - 60, H]], '#E8FFFF'); g.restore();
  glow(g, sx + sw / 2, sy + sh / 2, 160, '#DFF8FF', .12, 6);
  // 旁边：售货机、单车、屋檐下的猫
  R(g, 392, 120, 34, 90, '#E8ECF4'); R(g, 396, 126, 26, 36, '#9FE0FF'); for (let k = 0; k < 6; k++) R(g, 399 + (k % 3) * 8, 130 + fl(k / 3) * 14, 5, 8, ['#FF6A5A', '#5AC8FF', '#FFE04A'][k % 3]); glow(g, 409, 150, 40, '#BFF0FF', .3, 5);
  bike(g, 60, 214, '#C83A5A'); cat(g, 360, 200, 'loaf', t, { col: '#F2B060', col2: '#C88040' });
  R(g, 0, 210, W, 60, '#14141E'); reflect(g, 210, 60, t, { k: .5, amp: 2, tint: '#102030', tk: .3 });
  rain(g, t, { n: 160, sp: 380, len: 7, sl: .15, col: 'rgba(190,205,255,.4)', seed: 91 }); splashes(g, t, { n: 30, y0: 210, y1: 268 });
}
/* 一个人走回家：住宅区小路，一扇扇亮着的窗（有一家人在吃饭），自动售货机发光，野猫跟着，一对情侣撑一把伞走过，他抬头看那颗星 */
function shWalkHome(g, t, u, s) {
  vgrad(g, 0, 0, W, 200, [[0, '#0A0C24'], [.7, '#1E1E48'], [1, '#2E2458']], .6);
  stars(g, t, { seed: 21, n: 110, h: 150, a: .85 }); moon(g, 400, 40, 11);
  const sp2 = mod(t, 4), blinkA = sp2 < .2 || (sp2 > .4 && sp2 < .6) ? 1 : .45; R(g, 120, 30, 1, 1, '#FFFFFF'); glow(g, 120, 30, 8, '#BFE4FF', .6 * blinkA, 3); if (blinkA > .9) { R(g, 118, 30, 5, 1, '#FFFFFF'); R(g, 120, 28, 1, 5, '#FFFFFF'); }
  const cam = u * 16;
  for (let i = 0; i < 7; i++) {                                   // 住宅：矮楼、空调、晾的衣服、亮窗（有一扇里一家人在吃饭）
    const x = i * 90 - mod(cam * .6, 90), h = 70 + hash(i, 3) * 40;
    R(g, x, 200 - h, 86, h, '#1A1834'); R(g, x, 200 - h, 86, 2, '#2A2850'); for (let k = 0; k < 6; k++) R(g, x - 2 + k, 200 - h - 6 + k, 90 - 2 * k, 1, '#221E40');
    for (let k = 0; k < 3; k++) for (let r = 0; r < 3; r++) {
      const wx = x + 8 + k * 26, wy = 200 - h + 12 + r * 22, lit = hash(i * 12 + k, r) < .5;
      R(g, wx, wy, 16, 12, lit ? WARM[(k + r) % 4] : '#24224A');
      if (lit && (i + k + r) % 5 === 0) { R(g, wx + 3, wy + 5, 3, 7, '#3A2A2A'); R(g, wx + 9, wy + 4, 3, 8, '#3A2A2A'); R(g, wx + 2, wy + 9, 12, 1, '#6A4A3A'); }
      if (lit) glow(g, wx + 8, wy + 6, 12, '#FFC870', .2, 3);
      if (hash(i, k + r * 3) < .2) { R(g, wx + 16, wy + 6, 6, 5, '#7A8098'); }
    }
  }
  for (let k = 0; k < 3; k++) { const y0 = 56 + k * 5; for (let x = 0; x < W; x++) P(g, x, y0 + Math.sin((x + cam) / 160 * PI) * 8, '#05060F'); }
  R(g, 0, 200, W, 70, '#24223A'); R(g, 0, 200, W, 2, '#3A3858'); for (let x = -mod(cam, 30); x < W; x += 30) R(g, x, 214, 14, 2, '#3A3858');
  for (let i = 0; i < 3; i++) { const lx = mod(i * 180 + 60 - cam, W + 180) - 60; R(g, lx, 120, 3, 80, '#2A2840'); R(g, lx - 8, 118, 16, 3, '#2A2840'); glow(g, lx + 1, 122, 22, '#FFE0A0', .5, 5); g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .1; poly(g, [[lx - 2, 122], [lx + 4, 122], [lx + 34, 236], [lx - 30, 236]], '#FFE0A0'); g.restore(); }
  const vx = 300 - cam; R(g, vx, 142, 30, 58, '#E8ECF4'); R(g, vx + 3, 148, 24, 28, '#9FE0FF'); for (let k = 0; k < 6; k++) R(g, vx + 5 + (k % 3) * 8, 152 + fl(k / 3) * 12, 5, 8, ['#FF6A5A', '#5AC8FF', '#FFE04A'][k % 3]); glow(g, vx + 15, 162, 44, '#BFF0FF', .3, 5);
  const cx = W + 40 - u * 60; monAt(g, cx, 236, 3, { col: '#B07F9E', skirt: true, eyes: 'happy', legs: walk(t).legs }); monAt(g, cx + 22, 236, 3, { col: '#7FA88E', eyes: 'happy', legs: walk(t + .1).legs }); umbrella(g, cx + 11, 190, 22, { col: '#E870B8', stick: 20 });
  const wk = walk(t, 2.5, 5);
  monAt(g, 190, 240 + wk.bob, 5, { col: CL.him, cowlick: true, eyes: u > 3.6 ? 'up' : 'dn', legs: wk.legs, ol: '#0A0A1A', rim: ['#9FD8FF', 'r'] });
  cat(g, 140 - Math.sin(t) * 2, 230, 'walk', t, { col: '#3A3A44', col2: '#2A2A34', ol: '#101018' });
  fireflies(g, t, { n: 6, y: 160, h: 60, col: '#E8F0FF', a: .5 });
}
