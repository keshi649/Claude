'use strict';
/* shots6.js —— 副歌三：冲出门，雨里一路跑到站台，车门刚好关上，车开走；时间停住，雨变成花瓣，记忆列车开上天；
   副歌四：天亮，回到母校，新的一对坐在那张长椅上，她把干栀子花发夹留在树下，笑着哭，扔出纸飞机；
   尾声：纸飞机飞过海、飞进星空；"有一个男孩爱着那个女孩"（他的那一边）；拼好的照片；她继续往前走；片尾星空。 */

/* ---------------- K-1 冲出楼门 ---------------- */
function shBurstOut(g, t, u, s) {
  cityNight(g, t, 440, { noCars: false });
  // 楼门：一道亮光从门里打出来
  const dx = 120; R(g, dx, 120, 50, 60, '#FFE6B0'); R(g, dx - 4, 116, 58, 4, '#3A3048'); glow(g, dx + 25, 150, 60, '#FFD890', .4, 6);
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .2; poly(g, [[dx, 180], [dx + 50, 180], [dx + 120, 270], [dx - 40, 270]], '#FFE6A8'); g.restore();
  const run = seg(u, .15, 2.6), x = lerp(dx + 25, 420, E.in2(run)), wk = walk(t, 8, 5);
  monAt(g, x, 214 + wk.bob, 5, { col: CL.her, clip: 'dry', eyes: 'r', legs: wk.legs, arms: 'holdR', ol: '#0E0A1E', rim: ['#FFE0A0', 'l'] });
  paperPlaneSpr(g, x + 26, 170, 1);
  for (let k = 0; k < 6; k++) R(g, x - 30 - k * 14, 190 + k * 4, 10 + k * 2, 1, rgba('#FFFFFF', .4 - k * .05));   // 速度线
  if (u > .2) for (let k = 0; k < 10; k++) { const v = seg(u, .2 + k * .05, .7 + k * .05); R(g, dx + 25 + (k - 5) * 6 * v, 200 - v * 20 + v * v * 30, 2, 2, rgba('#E8F4FF', 1 - v)); }   // 踩起来的水
  rain(g, t, { n: 160, sp: 420, len: 8, sl: .22, col: 'rgba(190,205,255,.4)', seed: 3 });
  rain(g, t, { n: 50, sp: 600, len: 14, sl: .26, col: 'rgba(230,238,255,.5)', seed: 4 });
}
function paperPlaneSpr(g, x, y, k = 1) { x = ri(x); y = ri(y); poly(g, [[x - 8 * k, y + 2 * k], [x + 9 * k, y - 2 * k], [x - 2 * k, y + 4 * k]], '#FFFFFF'); poly(g, [[x - 2 * k, y + 4 * k], [x + 9 * k, y - 2 * k], [x - 1 * k, y + 7 * k]], '#D8D4E0'); }
/* ---------------- K-2 雨里一路跑（横着卷动的街） ---------------- */
function shRunStreet(g, t, u, s) {
  const camX = u * 160;
  const q = layer('runCity');
  cityNight(q, t, 452, { camX: mod(camX, 120), noCars: true });
  g.drawImage(LAYER.runCity, 0, 0);
  // 前景的东西往后飞：路灯杆、路人、水洼
  for (let i = 0; i < 5; i++) { const x = mod(i * 130 - camX * 1.3, W + 120) - 60; R(g, x, 60, 4, 180, '#0A0814'); R(g, x - 8, 58, 20, 4, '#0A0814'); glow(g, x + 2, 64, 16, '#FFE0A0', .5, 4); }
  for (let i = 0; i < 6; i++) { const x = mod(i * 97 - camX * 1.1, W + 80) - 40; monAt(g, x, 236, 3, { col: CROWD[i], legs: walk(t + i).legs, eyes: 'l', ol: '#0E0A1E' }); umbrella(g, x, 190, 18, { col: UMB[(i + 3) % UMB.length], stick: 16 }); }
  const wk = walk(t, 9, 5), bob = wk.bob;
  monAt(g, 200, 238 + bob, 5, { col: CL.her, clip: 'dry', eyes: 'r', legs: wk.legs, arms: 'holdR', ol: '#0E0A1E', rim: ['#FF4FA0', 'l'], tear: .4 });
  paperPlaneSpr(g, 228, 196 + bob, 1);
  const step = fl(t * 9); if (step % 2 === 0) for (let k = 0; k < 8; k++) { const v = mod(t * 9, 1); R(g, 190 + (k - 4) * 5 * v, 238 - v * 14 + (k % 3), 2, 2, rgba('#E8F4FF', .9 - v)); }
  rain(g, t, { n: 170, sp: 420, len: 9, sl: .45, col: 'rgba(190,205,255,.42)', seed: 13 });
  rain(g, t, { n: 50, sp: 640, len: 16, sl: .5, col: 'rgba(230,238,255,.5)', seed: 14 });
  for (let k = 0; k < 6; k++) R(g, 140 - k * 18, 200 + k * 5, 14, 1, rgba('#FFFFFF', .35 - k * .05));
}
/* ---------------- 站台 ---------------- */
function platform(g, t, o = {}) {
  vgrad(g, 0, 0, W, H, [[0, '#0A0A20'], [1, '#1E1A3A']], 1);
  const CP = cityParts(); drawCity(g, CP.mid, -60, -120, t);
  // 顶棚：钢架、日光灯
  R(g, 0, 0, W, 26, '#1A1A2A'); for (let x = 0; x < W; x += 40) { line(g, x, 0, x + 20, 26, '#2E2E44'); line(g, x + 40, 0, x + 20, 26, '#2E2E44'); }
  for (let x = 40; x < W; x += 120) { R(g, x, 26, 50, 3, '#E8F4FF'); glow(g, x + 25, 28, 40, '#C8E4FF', .25, 5); }
  // 吊着的站牌和时钟
  R(g, 120, 30, 110, 22, '#1A3A6A'); R(g, 120, 30, 110, 2, '#4A6AA8'); txt(g, '开往 仲夏 →', 128, 35, '#FFFFFF');
  R(g, 300, 30, 50, 22, '#101018'); tiny(g, '23:17', 307, 38, '#FF6A3A'); glow(g, 325, 41, 16, '#FF6A3A', .3, 3);
  // 柱子
  for (let x = 30; x < W; x += 150) { R(g, x, 26, 10, 170, '#3A3A54'); R(g, x, 26, 2, 170, '#5A5A78'); }
  // 轨道
  R(g, 0, 176, W, 20, '#14121E'); R(g, 0, 182, W, 2, '#5A5A6A'); R(g, 0, 190, W, 2, '#5A5A6A');
  // 站台面 + 黄色盲道
  R(g, 0, 196, W, 74, '#3A3848'); R(g, 0, 196, W, 3, '#6A6880'); R(g, 0, 202, W, 6, '#E8C040'); for (let x = 0; x < W; x += 4) P(g, x + 1, 204, '#C8A030');
  reflect(g, 208, 40, t, { k: .25, amp: .5, tint: '#20203A', tk: .3 });
}
/* 一列车（侧面）：x 车头位置，doors 0 开 ~ 1 关 */
function trainSide(g, x, y, t, o = {}) {
  const cars = o.cars || 4, cw = 180;
  for (let k = 0; k < cars; k++) {
    const cx = ri(x - (k + 1) * (cw + 4)); if (cx > W || cx + cw < 0) continue;
    R(g, cx, y, cw, 90, '#8E94AC'); R(g, cx, y, cw, 4, '#B8BED4'); R(g, cx, y + 70, cw, 20, '#5A6078'); R(g, cx, y + 64, cw, 4, '#3A9AE8');
    for (let w = 0; w < 3; w++) { const wx = cx + 12 + w * 58; R(g, wx, y + 14, 40, 30, '#E8C890'); R(g, wx, y + 14, 40, 2, '#FFE6B0'); for (let p = 0; p < 2; p++) if (hash(k * 3 + w, p) < .5) monAt(g, wx + 10 + p * 18, y + 44, 2, { col: CROWD[(k + w + p) % CROWD.length], eyes: 'l' }); }
    if (o.doors != null && k === 0) {                               // 车门：两扇往中间合
      const dw = 24 * (1 - o.doors); R(g, cx + cw - 50, y + 10, 40, 58, '#FFE6B0'); R(g, cx + cw - 50, y + 10, 20 - dw * .8, 58, '#B8BCC8'); R(g, cx + cw - 30 + dw * .8, y + 10, 20 - dw * .8, 58, '#B8BCC8');
      if (o.him) { monAt(g, cx + cw - 30, y + 66, 3, { col: CL.him, cowlick: true, eyes: 'back' }); }
    }
    glow(g, cx + cw / 2, y + 30, 90, '#FFE0A0', .14, 5);
  }
}
/* K-3 跑到站台，车门正好关上 */
function shPlatformDoors(g, t, u, s) {
  platform(g, t);
  const doors = seg(u, .9, 1.9);
  trainSide(g, 470, 92, t, { doors, him: doors < .6 });
  const run = E.out(seg(u, 0, 1.6)), x = lerp(-30, 280, run), wk = walk(t, run < 1 ? 9 : 0, 5);
  monAt(g, x, 236 + (run < 1 ? wk.bob : 0), 5, { col: CL.her, clip: 'dry', eyes: 'r', legs: run < 1 ? wk.legs : 0, arms: u > 1.6 ? 'reachR' : 'holdR', ol: '#0E0A1E', rim: ['#C8E4FF', 'l'] });
  if (u > 1.6) paperPlaneSpr(g, x + 36, 200, 1); else paperPlaneSpr(g, x + 26, 196, 1);
  if (u > 1.9 && fl(u * 4) % 2) { tiny(g, '♪', 360, 70, '#FFFFFF'); tiny(g, '♪', 372, 64, '#FFFFFF'); }
}
/* K-4 车开走，翻牌的发车表，人潮走过 */
function shTrainLeaves(g, t, u, s) {
  platform(g, t);
  const v = E.in2(seg(u, 0, 2.6)), x = 470 + v * 900;
  trainSide(g, x, 92, t, { doors: 1 });
  if (v > .2) for (let k = 0; k < 6; k++) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .25 * v; R(g, 0, 100 + k * 12, W, 1, ['#FFE6B0', '#3A9AE8', '#FFFFFF'][k % 3]); g.restore(); }
  // 翻牌发车表
  R(g, 380, 56, 90, 36, '#14141C'); const flip = fl(u * 12);
  ['仲夏', '已发车'].forEach((w, k) => { R(g, 384, 60 + k * 16, 82, 13, '#22222E'); R(g, 384, 66 + k * 16, 82, 1, '#0A0A10'); txt(g, u > 1 || k === 0 ? w : '???'.slice(0, 1 + flip % 3), 388, 60 + k * 16, k ? '#FF7A3A' : '#FFFFFF'); });
  monAt(g, 260, 236, 5, { col: CL.her, clip: 'dry', eyes: 'r', ol: '#0E0A1E', rim: ['#C8E4FF', 'l'] });
  paperPlaneSpr(g, 286, 196, 1);
  for (let i = 0; i < 6; i++) { const xx = W + 40 - mod(t * 70 + i * 90, W + 120); monAt(g, xx, 262, 6, { col: '#24223A', legs: walk(t + i).legs, eyes: 'back' }); }
}
/* K-5 眼睛的大特写：眼里映着开走的车灯，一滴眼泪 */
function shTearEye(g, t, u, s) {
  vgrad(g, 0, 0, W, H, [[0, '#120E2A'], [1, '#2A1A3A']], 1);
  bokeh(g, t, { n: 14, seed: 91, rmin: 12, rmax: 30, a: .2, cols: ['#FFE6B0', '#3A9AE8', '#FF7AB0'] });
  const S = 34, cx = 300, fy = 8 * S + 30;                       // 一格 34 像素：画面里只剩右眼附近
  monFX(g, cx, fy, S, { col: CL.her, eyes: 'n', ol: '#0A0818', rim: ['#FF7AB0', 'r'] }, { t, light: ['#2A1A4A', .18] });
  const ex = ri(cx - 6 * S) + 8 * S, ey = ri(fy - 8 * S) + S;      // 右眼左上角
  for (let k = 0; k < 4; k++) { const v = mod(u * .6 + k * .25, 1); R(g, ex + 6 + v * (S - 14), ey + S - 12 + (k % 2) * 3, 4, 2, '#FFE6B0'); }
  const tear = seg(u, .3, 1.8), tx = ex + S / 2, ty = ey + S + 4 + tear * 120;
  if (tear > 0) { R(g, tx - 3, ey + S, 6, ty - ey - S, rgba('#BFE8FF', .55)); disc(g, tx, ty, 6, '#CFF2FF'); R(g, tx - 3, ty - 3, 3, 3, '#FFFFFF'); glow(g, tx, ty, 14, '#BFE8FF', .5, 3); }
}
/* K-6 时间停住：雨珠悬在半空，一颗颗变成发光的花瓣往上飘 */
function shTimeFreeze(g, t, u, s) {
  platform(g, t0f(s));
  g.save(); g.globalAlpha = .35 * seg(u, 0, 1); R(g, 0, 0, W, H, '#1A1040'); g.restore();
  monAt(g, 260, 236, 5, { col: CL.her, clip: 'dry', eyes: u > 1 ? 'up' : 'r', ol: '#0E0A1E', rim: ['#E8D8FF', 'l'] });
  paperPlaneSpr(g, 286, 196, 1);
  const turn = seg(u, .8, 3.0);
  for (let i = 0; i < 160; i++) {
    const x = hash(i, 3) * W, y0 = hash(i, 4) * 230, k = clamp(turn * 1.6 - hash(i, 5) * .6);
    const y = y0 - k * k * 80 - k * u * 6;
    if (k <= 0) { R(g, x, y, 1, 3, rgba('#C8D8FF', .6)); continue; }
    petal(g, x + Math.sin(u * 2 + i) * 4 * k, y, u * 3 + i, { big: hash(i, 6) > .6 });
    if (i % 4 === 0) glow(g, x, y, 4, '#FFF6D8', .4 * k, 2);
  }
}
const t0f = s => s.t;                                              // 时间停住：背景停在这个镜头开始的那一刻
/* K-7 光做的列车开进站，窗里都是回忆；它升上天，变成星星 */
function shGhostTrain(g, t, u, s) {
  platform(g, s.t);
  g.save(); g.globalAlpha = .45; R(g, 0, 0, W, H, '#140A30'); g.restore();
  petals(g, t, { n: 30, sp: -12, wind: 4, seed: 5, big: true });
  const arrive = E.out(seg(u, 0, 1.6)), leave = E.in2(seg(u, 3.2, 5.8));
  for (let k = 0; k < 5; k++) {
    const cx = lerp(-600, 60, arrive) + k * 112 + leave * 500, cy = 100 - leave * (k + 1) * 50 - leave * leave * 200;
    if (cx > W + 10 || cx + 108 < -10) continue;
    g.save(); g.globalAlpha = .85 * (1 - seg(u, 5.2, 6)); R(g, cx, cy, 108, 70, rgba('#BFDFFF', .22)); ring2(g, cx, cy, 108, 70, '#E8F4FF');
    g.imageSmoothingEnabled = true; g.drawImage(memSnap(k + 3), cx + 6, cy + 8, 96, 44); g.restore();
    glow(g, cx + 54, cy + 35, 70, '#BFDFFF', .2 * (1 - seg(u, 5.2, 6)), 5);
    for (let i = 0; i < 10; i++) { const v = mod(t * .8 + i / 10 + k, 1); P(g, cx + hash(i, k) * 108, cy + 70 + v * 20, rgba('#FFFFFF', 1 - v)); }
  }
  monAt(g, 260, 236, 5, { col: CL.her, clip: 'dry', eyes: 'up', ol: '#0E0A1E', rim: ['#BFDFFF', 'r'] });
  paperPlaneSpr(g, 286, 196, 1);
  if (u > 5.2) { g.save(); g.globalAlpha = seg(u, 5.2, 6) * .6; R(g, 0, 0, W, H, '#FFE8D0'); g.restore(); }
}

/* ---------------- D-1 日出：城市醒过来 ---------------- */
function shSunriseCity(g, t, u, s) {
  const k = E.io(seg(u, 0, 3.6));
  vgrad(g, 0, 0, W, 200, [[0, mix('#1A2A6A', '#4A7AC8', k)], [.5, mix('#6A4A8A', '#FFB08A', k)], [.8, mix('#C86A7A', '#FFD08A', k)], [1, mix('#FFA070', '#FFF0C0', k)]], .6);
  const sy = lerp(200, 120, k); sglow(g, 240, sy, 220, '#FFD890', .45); glow(g, 240, sy, 40, '#FFF0C0', .9, 6); disc(g, 240, sy, 16, '#FFF8E0');
  rays(g, 240, sy, t, { n: 10, ang: 0, len: 0, a: 0 });
  for (let i = 0; i < 8; i++) { const a = -PI / 2 + (i - 3.5) * .3, len = 300; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .07 * k; poly(g, [[240, sy], [240 + Math.cos(a - .04) * len, sy + Math.sin(a - .04) * len], [240 + Math.cos(a + .04) * len, sy + Math.sin(a + .04) * len]], '#FFF2C0'); g.restore(); }
  for (let i = 0; i < 6; i++) blit(g, cloudSpr(90 + i, 160, 36, [mix('#3A2A5A', '#E88A8A', k), mix('#5A3A7A', '#FFB0A0', k), mix('#7A4A8A', '#FFD0B0', k), mix('#9A5A9A', '#FFF0D0', k)]), mod(i * 120 + t * 5, W + 170) - 160, 20 + (i % 3) * 24);
  const CP = cityParts();
  g.save(); drawCity(g, CP.far, -20, -40, t); drawCity(g, CP.mid, -60, -40, t); g.restore();
  g.save(); g.globalCompositeOperation = 'soft-light'; g.globalAlpha = .6 * k; vgrad(g, 0, 0, W, H, [[0, '#FFD090'], [1, '#FF9050']], 1); g.restore();
  birds(g, t - s.t, { n: 9, x: 200, y: 120, sp: 40, dir: 1, col: '#2A1A2A', seed: 4 });
  // 站台栏杆上的她（剪影，镶一道金边）
  R(g, 0, 236, W, 34, '#14101E'); R(g, 0, 226, W, 3, '#2A2030'); for (let x = 6; x < W; x += 14) R(g, x, 226, 2, 10, '#2A2030');
  monAt(g, 300, 236, 6, { col: '#2A1A2A', clip: 'dry', eyes: 'up', rim: ['#FFD890', 'l'] });
}
/* ---------------- D-2 早上的母校门口：骑单车的学生，栀子树开着花 ---------------- */
function shSchoolGate(g, t, u, s) {
  campus(g, t);
  tree(g, 300, 236, { s: 1.9, flowers: 14, seed: 7, pal: LEAF, sway: 1.5, clumps: [[-24, -50, 15], [14, -58, 16], [-6, -72, 17], [26, -42, 12], [-30, -34, 12], [4, -44, 14], [-16, -64, 12], [24, -66, 12]] }, t);
  bench(g, 265, 236, {});
  R(g, 40, 160, 12, 80, '#D8D0C0'); R(g, 140, 160, 12, 80, '#D8D0C0'); R(g, 36, 152, 120, 10, '#B83A3A'); txt(g, '栀子路一中', 96, 152, '#FFE6A0', { align: 'c' });
  for (let i = 0; i < 4; i++) { const x = mod(i * 140 + t * 50, W + 80) - 40; bike(g, x, 250, ['#3A7AC8', '#C83A5A', '#E8C040', '#4AB84A'][i]); monAt(g, x + 16, 238, 2, { col: CROWD[i + 4], skirt: i % 2 === 0, eyes: 'r', legs: 'tuck' }); }
  const x = lerp(-20, 110, E.out(seg(u, 0, 2.4))); monAt(g, x, 240, 3, { col: CL.her, clip: 'dry', eyes: 'r', legs: u < 2.4 ? walk(t).legs : 0, ol: '#2A3A2A' });
  petals(g, t, { n: 26, x: 200, y: 80, w: 240, h: 170, seed: 33 });
  sunFlare(g, 450, 24, t, .6);
}
/* D-3 长椅上新的一对十七岁：男孩凑过去说悄悄话，女孩脸红（和十七岁那天一模一样的镜头） */
function shNewCouple(g, t, u, s) { whisperScene(g, t, u, s, { a: '#E8A0C0', b: '#7AC8A0' }); }
/* D-4 她远远地看着，笑着，眼里有泪 */
function shSheWatches(g, t, u, s) {
  campus(g, t);
  tree(g, 380, 236, { s: 1.6, flowers: 12, seed: 8, pal: LEAF, sway: 1.5 }, t);
  bench(g, 350, 236, {}); monAt(g, 372, 230, 2, { col: '#E8A0C0', skirt: true, legs: 0, eyes: 'happy' }); monAt(g, 392, 230, 2, { col: '#7AC8A0', cowlick: true, legs: 0, eyes: 'l' });
  monAt(g, 150, 262, 9, { col: CL.her, clip: 'dry', eyes: 'happy', tear: seg(u, .5, 2.5), blush: .3, ol: '#2A3A2A', rim: ['#FFF0C0', 'r'] });
  petals(g, t, { n: 30, sp: 18, wind: 8, seed: 62, big: true });
  sunFlare(g, 450, 30, t, .5);
}
/* D-5 她蹲在树下，把头上的干栀子花发夹取下来放在树根；一片新的花瓣落在上面 */
function shLeaveClip(g, t, u, s) {
  benchScene(g, t);
  g.save(); g.globalAlpha = .2; R(g, 0, 0, W, H, '#1A3A20'); g.restore();
  R(g, 300, 60, 40, 180, '#6A4A34'); R(g, 300, 60, 6, 180, '#8A6448'); R(g, 334, 60, 6, 180, '#4A3424'); for (let y = 70; y < 240; y += 18) R(g, 308, y, 24, 1, '#5A3E2A');
  R(g, 290, 236, 60, 6, '#5A3E2A');
  const put = seg(u, .4, 1.8), has = u < 1.2;
  monAt(g, 230, 248, 6, { col: CL.her, clip: has ? 'dry' : undefined, eyes: 'dn', legs: 'tuck', arms: put > 0 && put < 1 ? 'reachR' : 'n', ol: '#2A3A2A' });
  if (!has) { const cx = lerp(222, 296, E.io(seg(u, 1.2, 1.8))), cy = lerp(200, 234, E.io(seg(u, 1.2, 1.8))); gardeniaBig(g, cx, cy, 6, .4, { dry: true }); }
  if (u > 1.9) { const v = seg(u, 1.9, 2.9), px = lerp(316, 298, v), py = lerp(60, 230, E.out(v)); ell(g, px, py, v < 1 ? ri(Math.abs(Math.cos(u * 4)) * 4) + 2 : 4, 2, '#FFFFFF'); }
  petals(g, t, { n: 24, sp: 14, wind: 6, seed: 72, big: true });
}
/* D-6 笑着哭：阳光里眼泪一闪 */
function shSmileCry(g, t, u, s) {
  vgrad(g, 0, 0, W, H, [[0, '#FFE0B0'], [.5, '#C8E0A0'], [1, '#6AA860']], 1);
  bokeh(g, t, { n: 20, seed: 51, rmin: 10, rmax: 30, a: .25, cols: ['#FFFFFF', '#FFF0B0', '#FFD8E8'] });
  rays(g, 420, -10, t, { n: 7, ang: -.4, len: 320, col: '#FFF6D8', a: .1, spread: 200 });
  monAt(g, 230, 290, 14, { col: CL.her, clip: 'dry', eyes: 'happy', blush: .5, tear: seg(u, .2, 1.6), ol: '#3A3A2A', rim: ['#FFF0C0', 'r'] });
  const tx = 230 + 2.3 * 14 - 6 * 14 + 14 * 8 - 14 * 6 + 5, ty = 290 - 8 * 14 + 2 * 14 + seg(u, .2, 1.6) * 3.4 * 14;
  if (u > 1.2) { const v = seg(u, 1.2, 2.2); R(g, tx - 3, ty, 7, 1, '#FFFFFF'); R(g, tx, ty - 3, 1, 7, '#FFFFFF'); glow(g, tx, ty, 10 + v * 8, '#FFFFFF', .7 * (1 - v * .5), 4); }
  petals(g, t, { n: 24, sp: 14, wind: 6, seed: 82, big: true });
}
/* D-7 学校楼顶把纸飞机扔出去：镜头跟着它飞过小镇 */
function shThrowPlane(g, t, u, s) {
  const thr = u > 1.4, v = seg(u, 1.4, 6.4), pan = E.io(seg(u, 1.6, 6.4)) * 260;
  vgrad(g, 0, 0, W, 180, SKY_DAY, .6);
  for (let i = 0; i < 6; i++) blit(g, cloudSpr(20 + i, 150, 44, CLOUD_DAY), mod(i * 120 + t * 6 - pan * .2, W + 200) - 180, 14 + (i % 3) * 22);
  sunFlare(g, 420, 30, t, .6);
  hills(g, 160, t);
  for (let i = 0, x = -mod(pan * .5, 40) - 20; x < W + 40; i++) {           // 小镇：一排排屋顶和窗，树
    const w = 26 + fl(hash(i, 51) * 22), h = 18 + fl(hash(i, 52) * 26), c = ['#C0504D', '#4A78B0', '#D8A050', '#8A6AB0'][fl(hash(i, 53) * 4)], y = 196 - (i % 2) * 10;
    R(g, x, y - h, w, h, '#EADFCC'); R(g, x + w - 3, y - h, 3, h, '#C8BCA8'); for (let k = 0; k < 5; k++) R(g, x - 2 + k, y - h - 5 + k, w + 4 - 2 * k, 1, c);
    for (let k = 0; k < fl(w / 9); k++) R(g, x + 3 + k * 9, y - h + 6, 4, 5, '#7EB8E0');
    if (hash(i, 54) < .4) blit(g, leafClump(9, LEAF, 300 + i, 2), x + w - 8, y - 22);
    x += w + 4;
  }
  R(g, 0, 196, W, 74, '#5AA850'); grass(g, 0, W, 198, t, { h: 4, pal: GRASSC, step: 2 }); for (let i = 0; i < 8; i++) blit(g, leafClump(12, LEAF, 400 + i, 3), mod(i * 70 - pan * .8, W + 70) - 40, 214 + (i % 3) * 14);
  // 楼顶（随镜头往左退出）
  const rx = -pan; R(g, rx, 214, 300, 56, '#C8C0B0'); R(g, rx, 214, 300, 2, '#E8E0D0'); R(g, rx, 204, 300, 3, '#8A8A9A'); for (let x = 6; x < 300; x += 12) R(g, rx + x, 204, 2, 10, '#8A8A9A');
  R(g, rx + 220, 150, 40, 54, '#B8B0A0'); R(g, rx + 228, 160, 24, 44, '#6A5A4A');
  monAt(g, rx + 120, 214, 5, { col: CL.her, eyes: 'up', arms: thr ? 'up' : 'holdR', ol: '#3A3A4A', blush: .2 });
  const px = thr ? lerp(rx + 150, 330, E.out(v)) + Math.sin(v * 5) * 10 : rx + 148, py = thr ? 170 - Math.sin(v * PI) * 80 - v * 30 + Math.sin(v * 12) * 4 : 180;
  paperPlaneSpr(g, px, py, thr ? 2 : 1);
  if (thr) for (let k = 1; k < 14; k++) P(g, px - 14 - k * 3, py + 4 + Math.sin(v * 12 - k * .3) * 2, rgba('#FFFFFF', .55 - k * .035));
  birds(g, t, { n: 5, x: 0, y: 60, sp: 30, col: '#3A4A6A', seed: 12 });
  petals(g, t, { n: 16, sp: 12, wind: 20, seed: 92 });
}
/* ---------------- O-1 纸飞机飞过海，天从早上一路变到星空 ---------------- */
function shPlaneFlight(g, t, u, s) {
  const k = clamp(u / 6.2);
  const skyA = [[0, '#3A86E0'], [.6, '#8ACCF4'], [1, '#D8F0FA']], skyB = [[0, '#3A2A7A'], [.5, '#C85A8A'], [1, '#FFC08A']], skyC2 = [[0, '#05061A'], [.6, '#14164A'], [1, '#3A2A6A']];
  const blendS = (A2, B2, f) => [0, .5, 1].map(y => [y, mix(sampleStops(A2, y), sampleStops(B2, y), f)]);
  vgrad(g, 0, 0, W, 160, k < .5 ? blendS(skyA, skyB, k * 2) : blendS(skyB, skyC2, (k - .5) * 2), 1);
  if (k > .55) { g.save(); g.globalAlpha = seg(k, .55, 1); g.drawImage(milkyWay(W, 160, 7, { ang: -.3, cx: .5, cy: .4, wid: 30 }), 0, 0); g.restore(); stars(g, t, { seed: 71, n: 200, h: 150, a: seg(k, .55, 1) }); }
  for (let i = 0; i < 6; i++) blit(g, cloudSpr(30 + i, 150, 34, [mix('#A6C0E4', '#2A2050', k), mix('#D4E4F6', '#C86A8A', Math.min(1, k * 1.5)), mix('#F2F8FF', '#FF9A8A', Math.min(1, k * 1.5)), mix('#FFFFFF', '#FFD0A0', Math.min(1, k * 1.5))]), mod(i * 110 - t * 50, W + 170) - 160, 60 + (i % 3) * 26, { a: 1 - seg(k, .7, 1) * .8 });
  sea(g, 160, 270, t * 3, { pal: [mix('#1C3C7A', '#0A0A2A', k), mix('#2A5AA0', '#14143A', k), mix('#3E78C0', '#2A2050', k)], sunX: 240, sunW: 20, hl: k > .6 ? '#C8D0FF' : '#FFF0C0' });
  const sp = mod(t, 4), blinkA = sp < .2 || (sp > .4 && sp < .6) ? 1 : .45; if (k > .6) { R(g, 352, 30, 1, 1, '#FFFFFF'); glow(g, 352, 30, 8, '#BFE4FF', .6 * blinkA, 3); }
  const px = 240 + Math.sin(u * 1.2) * 30 + k * 60, py = 140 - k * 60 + Math.sin(u * 2) * 8;
  paperPlaneSpr(g, px, py, 3);
  for (let i = 1; i < 30; i++) P(g, px - 24 - i * 4, py + 6 + Math.sin(u * 2 - i * .2) * 3, rgba('#FFFFFF', .5 - i * .016));
  for (let i = 0; i < 3; i++) { const bx = mod(i * 160 - t * 80, W + 60) - 30; birds(g, 0, { n: 1, x: bx, y: 120 + i * 10, col: '#2A2A3A' }); }
}
/* ---------------- O-2 有一个男孩爱着那个女孩：十七岁的他坐在窗边，看着树下的她，本子上画了一朵栀子花 ---------------- */
function shBoyLoves(g, t, u, s) {
  // 教室：窗外是栀子树下和同学说笑的她
  R(g, 0, 0, W, H, '#E8DCC0'); R(g, 0, 0, W, 8, '#F8F0E0');
  const wx = 40, wy = 30, ww = 300, wh = 150, q = layer('clsWin', ww, wh);
  vgrad(q, 0, 0, ww, wh, SKY_DAY, .6); blit(q, cloudSpr(3, 120, 30, CLOUD_DAY), 40 + ri(t * 3), 10);
  R(q, 0, 100, ww, 50, '#5AB050'); tree(q, 180, 120, { s: 1.2, flowers: 10, seed: 7 }, t);
  monAt(q, 150, 132, 2, { col: CL.her, skirt: true, clip: 'fresh', eyes: 'happy' }); monAt(q, 120, 132, 2, { col: CROWD[2], skirt: true, eyes: 'r' }); monAt(q, 176, 132, 2, { col: CROWD[5], skirt: true, eyes: 'l' });
  petals(q, t, { n: 14, w: ww, h: wh, seed: 4 });
  g.drawImage(LAYER.clsWin, wx, wy);
  R(g, wx - 6, wy - 6, ww + 12, 6, '#8AA8C0'); R(g, wx - 6, wy + wh, ww + 12, 8, '#8AA8C0'); R(g, wx - 6, wy, 6, wh, '#8AA8C0'); R(g, wx + ww, wy, 6, wh, '#8AA8C0'); R(g, wx + ww / 2 - 2, wy, 4, wh, '#8AA8C0');
  for (let k = 0; k < 2; k++) { const sw = ri(Math.sin(t * 1.2 + k) * 2); for (let j = 0; j < 24; j++) R(g, (k ? wx + ww + 6 : wx - 30) + j + (j > 16 ? sw : 0), wy - 8, 1, wh + 20, j % 6 < 3 ? '#F4F4F0' : '#E4E4E0'); }
  R(g, 360, 30, 100, 70, '#2A5A3A'); ring2(g, 360, 30, 100, 70, '#8A6A4A'); txt(g, '7月17日', 372, 40, '#F4F4F0'); tiny(g, 'HW: P.17', 372, 60, '#E8E8D8');   // 黑板
  rays(g, 200, 0, t, { n: 5, ang: .5, len: 320, col: '#FFF6D0', a: .1, spread: 200 });
  // 课桌和他
  R(g, 150, 200, 240, 8, '#B88A5A'); R(g, 150, 200, 240, 2, '#D0A070'); R(g, 160, 208, 6, 62, '#8A6A4A'); R(g, 374, 208, 6, 62, '#8A6A4A');
  monAt(g, 300, 200, 6, { col: CL.him, cowlick: true, eyes: 'l', blush: .5, legs: 'tuck', ol: '#3A3A2A', rim: ['#FFF0C0', 'l'] });
  // 本子上：一朵栀子花、一颗心
  R(g, 190, 188, 60, 14, '#F8F8F4'); R(g, 219, 188, 1, 14, '#D8D8D0'); for (let k = 0; k < 3; k++) R(g, 224, 191 + k * 4, 22, 1, '#B8C8E0');
  const draw = seg(u, .5, 3); gardenia(g, 204, 195, 4 * draw); if (u > 3) tiny(g, '♥', 230, 192, '#E84A5A');
  for (let i = 0; i < 20; i++) { const x = 200 + hash(i, 5) * 260, y = mod(hash(i, 6) * 200 - t * 4, 200); g.globalAlpha = .5; P(g, x, y, '#FFFBE0'); g.globalAlpha = 1; }
}

/* ---------------- 尾奏 ---------------- */
/* E-1 桌上那张拼好的照片（两半用胶带粘在一起），旁边玻璃瓶里换了一朵新开的栀子花；早上的光 */
function dayView(q, tt, w, h) { vgrad(q, 0, 0, w, h, SKY_DAY, .6); blit(q, cloudSpr(5, 100, 30, CLOUD_DAY), 30 + ri(tt * 3), 10); const CP = dayParts(); drawCity(q, CP.far, -80, -40, tt); drawCity(q, CP.mid, -120, -60, tt); birds(q, tt, { n: 4, x: 0, y: 30, sp: 20, col: '#3A4A6A' }); }
function shPhotoWhole(g, t, u, s) {
  roomBase(g, t, { night: false, view: dayView });
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .12; poly(g, [[150, 26], [350, 26], [420, 270], [100, 270]], '#FFF2C0'); g.restore();
  const pan = u * 6;
  R(g, 0, 150, W, 120, '#A88868'); R(g, 0, 150, W, 3, '#C8A888'); for (let y = 160; y < H; y += 9) R(g, 0, y, W, 1, '#9A7A5C');
  const px = 150 - pan, py = 44, pw = 200, ph = 160;
  R(g, px + 5, py + 5, pw, ph, 'rgba(40,20,10,.35)'); R(g, px, py, pw, ph, '#F4F0E8');
  const q = layer('wholeP', pw - 16, ph - 40); photoSceneBoth(q, 0, pw - 16, ph - 40); g.drawImage(LAYER.wholeP, px + 8, py + 8);
  for (let yy = py; yy < py + ph; yy++) P(g, px + pw / 2 + ri(Math.sin(yy * .9) * 2), yy, '#D8D4C8');
  R(g, px + pw / 2 - 8, py + 20, 16, 30, rgba('#FFF8D0', .55)); R(g, px + pw / 2 - 8, py + 100, 16, 30, rgba('#FFF8D0', .55));   // 胶带
  tiny(g, "'09 7 17", px + pw - 50, py + ph - 22, '#FF8A2A');
  R(g, 380 - pan, 140, 20, 50, rgba('#CFE8FF', .4)); R(g, 380 - pan, 140, 2, 50, rgba('#FFFFFF', .6)); R(g, 389 - pan, 110, 2, 34, '#4A8A4A');
  gardeniaBig(g, 390 - pan, 104, 14, t * .1); bigLeaf(g, 390 - pan, 124, 16, -.5);
  paperCrane(g, 60 - pan, 190);
  dapples(g, 100, 460, 150, 260, t, { n: 20, a: .14 });
  for (let i = 0; i < 30; i++) { const x = 160 + hash(i, 5) * 240, y = mod(hash(i, 6) * 260 - t * 5, 260); g.globalAlpha = .45; P(g, x, y, '#FFFBE0'); g.globalAlpha = 1; }
}
/* E-1b 她推开窗：窗帘鼓起来，花瓣被风吹进屋，猫伸懒腰，窗外早上的城市和鸟 */
function shMorningWindow(g, t, u, s) {
  R(g, 0, 0, W, H, '#E8D8C0'); for (let x = 0; x < W; x += 12) R(g, x, 0, 1, 200, '#E0D0B6');
  const wx = 110, wy = 20, ww = 260, wh = 170, q = layer('mwin', ww, wh); dayView(q, t, ww, wh); g.drawImage(LAYER.mwin, wx, wy);
  const open = E.io(seg(u, .2, 1.4));
  R(g, wx - 8, wy - 8, ww + 16, 8, '#8A6A50'); R(g, wx - 8, wy + wh, ww + 16, 10, '#A88868'); R(g, wx - 8, wy - 8, 8, wh + 18, '#8A6A50'); R(g, wx + ww, wy - 8, 8, wh + 18, '#8A6A50');
  const lw = ri(lerp(ww / 2, 14, open)); R(g, wx, wy, lw, wh, rgba('#DDEEFF', .35)); ring2(g, wx, wy, lw, wh, '#8A6A50'); R(g, wx + ww - lw, wy, lw, wh, rgba('#DDEEFF', .35)); ring2(g, wx + ww - lw, wy, lw, wh, '#8A6A50');
  for (let k = 0; k < 2; k++) { const bil = open * (6 + 4 * Math.sin(t * 2 + k)); for (let j = 0; j < 34; j++) { const cx = k ? wx + ww + 4 + j - ri(bil * (1 - j / 34)) : wx - 38 + j + ri(bil * (j / 34)); R(g, cx, wy - 12, 1, wh + 50 - (j % 5 === 0 ? 2 : 0), j % 6 < 3 ? '#F4EEE4' : '#E2DACC'); } }
  rays(g, wx + ww - 40, wy, t, { n: 6, ang: .45, len: 280, col: '#FFF2C0', a: .12, spread: 160 });
  R(g, 0, 196, W, 74, '#B89878'); R(g, 0, 196, W, 2, '#D0B090');
  monAt(g, 240, 262, 9, { col: CL.her, eyes: u > 1.6 ? 'happy' : 'up', blush: .3, ol: '#3A2A2A', rim: ['#FFF0C0', 'r'], arms: u < 1.4 ? 'up' : 'n' });
  cat(g, wx + ww - 60, wy + wh - 8, u > 2 ? 'sit' : 'loaf', t);
  if (open > .3) { petals(g, t, { n: ri(40 * open), x: wx, y: wy, w: ww + 120, h: 200, sp: 10, wind: -30, seed: 15, big: true }); birds(g, t - s.t, { n: 5, x: wx, y: wy + 40, sp: 40, col: '#4A5A7A', seed: 6 }); }
}
/* 白天的城市 */
function dayParts() {
  return {
    far: makeCity('dayFar', { seed: 11, w: 520, h: 260, base: 260, hmin: 50, hmax: 150, wmin: 12, wmax: 30, gap: 1, col: '#9AB0D4', col2: '#A8BCDC', ws: 1, lit: .2, warm: .1, fog: '#EEF4FF', fogA: .55 }),
    mid: makeCity('dayMid', { seed: 23, w: 560, h: 320, base: 320, hmin: 80, hmax: 230, wmin: 20, wmax: 44, gap: 3, col: '#6E86B4', col2: '#7E96C0', ws: 2, lit: .18, warm: .1, fog: '#E2ECFA', fogA: .32, tallAt: 180 }),
  };
}
/* E-2 早上的河边步道：她带着猫往前走（镜头跟着）。跑步的人、单车、放风筝的小孩、过桥的轻轨、帆船、鸟 */
function shWalkOn(g, t, u, s) {
  const cam = u * 22;
  vgrad(g, 0, 0, W, 170, [[0, '#4A8EE0'], [.6, '#9ACCF2'], [1, '#E8F2F8']], .6);
  sunFlare(g, 410, 40, t, .6);
  for (let i = 0; i < 6; i++) blit(g, cloudSpr(50 + i, 150, 36, CLOUD_DAY), mod(i * 110 + t * 4 - cam * .1, W + 180) - 170, 16 + (i % 3) * 20);
  const CP = dayParts(); drawCity(g, CP.far, -mod(cam * .2, 40) - 20, -96, t); drawCity(g, CP.mid, -mod(cam * .35, 80) - 40, -140, t);
  // 跨河的轻轨桥
  R(g, 0, 146, W, 5, '#5A6A8A'); R(g, 0, 146, W, 1, '#8A9ABA'); for (let x = -mod(cam * .5, 70); x < W; x += 70) R(g, x, 151, 5, 24, '#4A5A7A');
  lightRail(g, W + 40 - mod(t * 110, W + 400), 146, t, { cars: 3 });
  sea(g, 175, 214, t, { pal: ['#3A6AA8', '#5A8AC8', '#8AB8E0'], sunX: 410, sunW: 14, hl: '#FFF6D8' });
  for (let i = 0; i < 2; i++) { const bx = mod(i * 260 - cam * .6 + t * 8, W + 80) - 40, by = 196 + i * 8; poly(g, [[bx, by], [bx + 18, by], [bx + 15, by + 4], [bx + 3, by + 4]], '#F4F0E8'); poly(g, [[bx + 8, by - 1], [bx + 8, by - 18], [bx + 17, by - 2]], i ? '#E85A5A' : '#FFFFFF'); }
  // 步道：栏杆、行道树、路灯、长椅、花坛
  R(g, 0, 214, W, 56, '#D8C8A8'); R(g, 0, 214, W, 2, '#F0E0C0'); for (let x = -mod(cam, 26); x < W; x += 26) R(g, x, 214, 1, 56, '#C8B898');
  R(g, 0, 206, W, 2, '#8A7A6A'); for (let x = -mod(cam, 14); x < W; x += 14) R(g, x, 206, 2, 8, '#8A7A6A');
  for (let i = 0; i < 4; i++) { const x = mod(i * 150 - cam, W + 150) - 60; tree(g, x, 214, { s: .9, flowers: i % 2 ? 6 : 0, seed: 30 + i, pal: LEAF, sway: 1 }, t); }
  for (let i = 0; i < 3; i++) { const x = mod(i * 190 + 80 - cam, W + 190) - 60; R(g, x, 160, 2, 54, '#4A5060'); R(g, x - 4, 158, 10, 3, '#4A5060'); }
  // 放风筝的小孩
  const kx = mod(330 - cam * .9, W + 100) - 40; monAt(g, kx, 250, 2, { col: '#E8A0C0', skirt: true, eyes: 'up', arms: 'up', legs: walk(t, 3).legs });
  const fx = kx + 60 + Math.sin(t * 1.3) * 8, fy = 70 + Math.cos(t * 1.7) * 6; for (let k = 0; k <= 30; k++) { const v = k / 30; P(g, lerp(kx + 4, fx, v), lerp(236, fy + 6, v) + Math.sin(v * PI) * 16, '#F4F4F4'); }
  poly(g, [[fx, fy - 7], [fx + 6, fy], [fx, fy + 9], [fx - 6, fy]], '#FF5A5A'); line(g, fx, fy - 7, fx, fy + 9, '#FFE04A'); for (let k = 0; k < 6; k++) R(g, fx + Math.sin(t * 6 + k) * 2, fy + 10 + k * 3, 2, 2, ['#FFE04A', '#5AC8FF'][k % 2]);
  for (let i = 0; i < 2; i++) { const x = mod(i * 240 + t * 34, W + 60) - 30; monAt(g, x, 256, 2, { col: CROWD[i + 2], legs: walk(t + i, 6).legs, eyes: 'r' }); }   // 跑步的人
  const bx = W + 30 - mod(t * 70, W + 60); bike(g, bx, 266, '#E8C040'); monAt(g, bx + 16, 254, 2, { col: CROWD[7], eyes: 'l', legs: 'tuck' });
  const wk = walk(t, 3, 4);
  monAt(g, 200, 252 + wk.bob, 4, { col: CL.her, eyes: blinkAt(t, 9) ? 'blink' : 'r', legs: wk.legs, ol: '#3A3A4A', rim: ['#FFF0C0', 'l'], blush: .2 });
  cat(g, 158 + Math.sin(t * 2) * 2, 244, 'walk', t, { flip: true });
  birds(g, t, { n: 7, x: 0, y: 50, sp: 26, col: '#3A4A6A', seed: 21 });
  petals(g, t, { n: 14, sp: 10, wind: 14, seed: 102 });
}
/* E-3 片尾：星空，那颗星眨两下，一颗慢慢的流星；字由 main.js 画 */
function shEndCard(g, t, u, s) {
  vgrad(g, 0, 0, W, H, [[0, '#04051A'], [.5, '#0E1038'], [1, '#2A1E50']], .6);
  g.save(); g.globalAlpha = .7; g.drawImage(milkyWay(W, H, 21, { ang: -.5, cx: .5, cy: .45, wid: 36 }), 0, 0); g.restore();
  stars(g, t, { seed: 91, n: 280, h: H, a: 1, big: .03 });
  const sp = mod(t, 4), blinkA = sp < .2 || (sp > .4 && sp < .6) ? 1 : .45; R(g, 352, 40, 1, 1, '#FFFFFF'); glow(g, 352, 40, 8, '#BFE4FF', .65 * blinkA, 3); if (blinkA > .9) { R(g, 350, 40, 5, 1, '#FFFFFF'); R(g, 352, 38, 1, 5, '#FFFFFF'); }
  meteor(g, t, s.t + 1.2, 440, 20, -200, 80, { len: 40, dur: 1.8 });
  for (let x = 0; x < W; x++) { const y = 240 + Math.sin(x / W * PI) * -16; R(g, x, y, 1, H - y, '#06060E'); }
  const a = E.out(seg(u, .3, 1.6)) * (1 - seg(t, 313.8, 315.3));
  if (a > 0) { const c = bigGlyph('后', 1), c2 = bigGlyph('来', 1); g.save(); g.globalAlpha = a; g.drawImage(tint(c, '#FFF6E6'), 240 - 25, 66); g.drawImage(tint(c2, '#FFF6E6'), 240 + 1, 66); g.restore(); }
  monAt(g, 120, 236, 2, { col: '#0E0C1E', clip: 'dry', eyes: 'up' }); cat(g, 98, 228, 'sit', t, { col: '#0E0C1E', col2: '#0E0C1E' });
}
