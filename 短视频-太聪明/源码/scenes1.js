'use strict';
/* scenes1.js：片头（桌面上的标题卡）、填字格、夜里的房间。
   所有时间都是歌曲时间 t（秒）。 */

/* ---------------- 俯视的书桌 ---------------- */
function deskTop(g, t, o = {}) {
  // 木纹桌面：横向木板
  for (let j = -30; j < 200; j += 18) {
    rect(g, -60, j, 460, 18, '#a7673d');
    rect(g, -60, j, 460, 1, '#b97a4b'); rect(g, -60, j + 17, 460, 1, '#7b4729');
    for (let k = 0; k < 26; k++) {
      const x0 = -60 + hash(j, k) * 460, w = 8 + hash(k, j) * 40, y0 = j + 2 + fl(hash(j, k, 3) * 14);
      rect(g, x0, y0, w, 1, hash(j, k, 4) > .5 ? '#97592f' : '#b2724a');
    }
  }
  // 左边：一页写满提示的横线纸
  rect(g, -40, -10, 78, 190, '#e6dfd2'); rect(g, 38, -10, 2, 190, '#bfb6a6');
  for (let j = 4; j < 170; j += 9) rect(g, -40, j, 78, 1, '#b9c4d6');
  rect(g, 2, -10, 1, 190, '#d99a9a');
  const clues = ['横1 我是什么', '提示：一个谜', '竖2 太聪明的', '反义词是？', '横3 忽冷又忽', '竖4 再一次'];
  clues.forEach((c, i) => ptext(g, c, 5, 6 + i * 18, '#4b5274', { size: 10 }));
  // 右上：一杯茶（俯视）
  const mx = 300, my = 22;
  disc(g, mx + 2, my + 3, 13, 'rgba(60,30,10,.35)');
  disc(g, mx, my, 13, '#e9e2d6'); disc(g, mx, my, 11, '#cfc5b6'); disc(g, mx, my, 10, '#8c4f22'); disc(g, mx - 2, my - 3, 3, '#b0713d');
  rect(g, mx + 12, my - 3, 6, 6, '#e9e2d6'); rect(g, mx + 14, my - 1, 3, 2, '#a7673d');
  // 右下：便利贴
  rect(g, 280, 102, 30, 28, 'rgba(60,30,10,.3)'); rect(g, 277, 99, 30, 28, '#f2d46c'); rect(g, 277, 99, 30, 4, '#e8c55a');
  ptext(g, '10/06', 292, 104, '#6b4a1f', { size: 10, align: 'c' });
  ptext(g, '早点睡', 292, 115, '#6b4a1f', { size: 10, align: 'c' });
  // 铅笔
  for (let i = 0; i < 70; i++) { const x0 = 120 + i, y0 = 147 - rd(i * .16); rect(g, x0, y0, 1, 3, i < 6 ? '#3a3a3a' : i < 10 ? '#e8c9a0' : i > 64 ? '#e6a0a8' : '#e2b23c'); }
  // 卡片
  titleCard(g, 55, 18, t, o);
}
/* 标题卡：像一张写着歌名的明信片。上面一排十个红格子（填字格），右上角邮票格里盖着 Clawd */
function titleCard(g, cx, cy, t, o = {}) {
  const W0 = 210, H0 = o.row2 ? 128 : 112;
  rect(g, cx + 4, cy + 4, W0, H0, 'rgba(50,25,10,.4)');
  rect(g, cx, cy, W0, H0, '#efe6d5');
  rect(g, cx, cy, W0, 1, '#f9f3e7'); rect(g, cx, cy + H0 - 1, W0, 1, '#d6cab5');
  dith(g, cx + 1, cy + 1, W0 - 2, H0 - 2, 'rgba(210,198,176,.25)');
  // 十个格子
  const red = '#d2473b';
  for (let i = 0; i < 10; i++) {
    const bx = cx + 10 + i * 16, by = cy + 10;
    const hi = o.hl !== undefined && o.hl === i;
    if (hi) rect(g, bx, by, 14, 14, '#f8e6a6');
    rect(g, bx, by, 14, 1, red); rect(g, bx, by + 13, 14, 1, red); rect(g, bx, by, 1, 14, red); rect(g, bx + 13, by, 1, 14, red);
  }
  if (o.fill) ptext(g, o.fill.s, cx + 11, cy + 11, '#2b3060', { times: o.fill.times, t, pop: .1, gap: 4 });
  // 邮票格（虚线）+ Clawd 邮票
  const sxx = cx + 180, syy = cy + 8;
  for (let i = 0; i < 22; i += 3) { rect(g, sxx + i, syy, 2, 1, red); rect(g, sxx + i, syy + 25, 2, 1, red); }
  for (let j = 0; j < 26; j += 3) { rect(g, sxx, syy + j, 1, 2, red); rect(g, sxx + 22, syy + j, 1, 2, red); }
  if (o.stamp !== false) {
    rect(g, sxx + 3, syy + 3, 17, 20, '#f6efe0');
    clawd(g, sxx + 11, syy + 18, { u: 1, t, noShadow: true, eyes: o.stampEyes || 'n', blinkOK: false });
    for (let k = 0; k < 14; k++) { const a = k / 14 * TAU; px(g, sxx + 16 + Math.cos(a) * 7, syy + 16 + Math.sin(a) * 7, 'rgba(70,80,140,.45)'); }
  }
  // 歌名
  ptext(g, '太聪明', cx + W0 / 2, cy + 36, '#2b3060', { size: 24, align: 'c', gap: 4, alpha: o.titleA ?? 1 });
  ptext(g, '陈绮贞 · Claude 版', cx + W0 / 2, cy + 66, '#2b3060', { align: 'c', alpha: o.titleA ?? 1 });
  rect(g, cx + 18, cy + 82, W0 - 36, 1, red);
  ptext(g, 'No.0419', cx + W0 - 12, cy + (o.row2 ? 112 : 94), '#6a7090', { size: 10, align: 'r' });
  if (o.row2) o.row2(g, cx, cy);
}

/* 片头 + 第一句（填字格） */
function shotTitle(t, T) {
  // 摄像机：开场慢慢拉远，第一句前推向那排格子
  const zin = E.io(seg(t, 5.6, 6.9));
  const cam = { x: lerp(2, -16, zin) + Math.sin(t * .3) * 1.2, y: lerp(4, -12, zin) + Math.cos(t * .23) * .8 };
  // Clawd：从下面走进来，停在卡片下沿；第一句时沿着格子一格一格跳过去
  const L0 = L(0);
  layer(g => {
    deskTop(g, t, { fill: { s: L0.text, times: L0.t }, hl: hlBox(t, L0) });
    clawdOnCard(g, t, L0);
  }, cam);
  const z = lerp(kf(t, [[-2, 1.1], [4.5, 1.0]], E.out), 1.42, zin);
  zoomView(z, .5, lerp(.5, .3, zin));
  // 光：左上角台灯的暖光，右边窗外偶尔扫过的车灯
  const gr = vg.createRadialGradient(VW * .28, -80, 60, VW * .4, VH * .3, 1500);
  gr.addColorStop(0, '#ffffff'); gr.addColorStop(.45, '#d8c0a8'); gr.addColorStop(1, '#3a2c3e');
  vg.save(); vg.globalCompositeOperation = 'multiply'; vg.fillStyle = gr; vg.fillRect(0, 0, VW, VH); vg.restore();
  glow(VW * .3, VH * .15, 900, '#ffcf8a', .22);
  const car = seg(t, -1.0, 3.5);
  if (car > 0 && car < 1) shafts([{ x: lerp(-600, 2200, E.sine(car)), w: 260, a: .16 * Math.sin(car * Math.PI), col: '#cfe2ff' }], .5, 14);
  bloom(.3, 1.1);
  dust(t, 26, 7, { a: .4, vx: 6, vy: -4 });
  vignette(.55, .4);
}
/* 第一句时高亮的格子 */
function hlBox(t, L0) { for (let i = L0.t.length - 1; i >= 0; i--) if (t >= L0.t[i] - .25) return i; return undefined; }
function clawdOnCard(g, t, L0) {
  const cy = 18, cx = 55;
  if (t < 1.8) return;
  // 走进来
  let x = 160, y = lerp(178, 136, E.out(seg(t, 1.8, 4.2))), o = { u: 2, t, walk: t < 4.2 ? t * 2.2 : undefined, eyes: 'n' };
  if (t > 4.2 && t < 5.4) o.look = Math.sin((t - 4.2) * 3) > 0 ? -1 : 1;
  if (t >= 5.4 && t < 6.3) { const u = seg(t, 5.4, 6.3); x = lerp(160, cx + 17, E.io(u)); y = lerp(136, cy + 8, E.io(u)) - Math.sin(u * Math.PI) * 14; o.u = lerp(2, 1, u) > 1.5 ? 2 : 1; }
  if (t >= 6.3) {
    // 跳格子：第 i 个字出现前 0.22 秒起跳，落在格子上方
    o.u = 1; let i = -1;
    for (let k = 0; k < L0.t.length; k++) if (t >= L0.t[k] - .22) i = k;
    const bx = k => cx + 17 + k * 16;
    if (i < 0) { x = bx(0); y = cy + 8; }
    else {
      const u = clamp((t - (L0.t[i] - .22)) / .22), from = i === 0 ? bx(0) : bx(i - 1);
      x = lerp(from, bx(i), E.io(u)); y = cy + 8 - Math.sin(u * Math.PI) * 5;
      if (u >= 1) o.sq = clamp(1 - (t - L0.t[i]) / .1) > .5 ? 1 : 0;
    }
    if (i === L0.t.length - 1 && t > L0.t[i] + .15) { o.armR = 1; o.eyes = 'wide'; }
    if (t > 12.5) o.eyes = 'n';
  }
  clawd(g, x, y, o);
  if (t > L0.t[9] + .35) mark(g, x, y - 12, '?', t, L0.t[9] + .35, 13.6, '#d2473b');
}

/* ---------------- 夜里的房间 ---------------- */
/* 房间里的光：整体压成夜色，台灯一圈暖光，笔记本屏幕一点冷光，霓虹招牌的粉光 */
function roomLight(cam, t, o = {}) {
  const lx = sx(cam, o.lx ?? 222), ly = sy(cam, o.ly ?? 96);
  const lampOn = o.lamp ?? 1, day = o.day ?? 0;
  const gr = vg.createRadialGradient(lx, ly, 20, lx, ly, o.r ?? 1250);
  let c0 = mix('#3c3e66', '#ffffff', lampOn), c1 = mix('#33355a', '#e2cdbf', lampOn), c2 = mix('#2a2c4c', '#6c6a98', lampOn), c3 = '#22233f';
  // 白天：光从窗户进来，整体亮
  if (day > 0) { c0 = mix(c0, '#ffffff', day); c1 = mix(c1, '#f4ece6', day); c2 = mix(c2, '#c9bfc4', day); c3 = mix(c3, '#8d8396', day); }
  gr.addColorStop(0, c0); gr.addColorStop(.2, c1); gr.addColorStop(.5, c2); gr.addColorStop(1, c3);
  vg.save(); vg.globalCompositeOperation = 'multiply'; vg.fillStyle = gr; vg.fillRect(0, 0, VW, VH); vg.restore();
  if (o.tint) grade(o.tint, o.tintA ?? .35, o.tintMode || 'soft-light');
  if (lampOn > 0) { glow(lx, ly + 40, 520, '#ffb562', .42 * lampOn); glow(lx, ly + 10, 160, '#fff1c8', .35 * lampOn); }
  if (o.screen !== undefined) glow(sx(cam, o.screen[0]), sy(cam, o.screen[1]), 230, '#86c8ff', .28 * (o.screenA ?? 1));
  if (o.neon) glow(sx(cam, o.neon[0]), sy(cam, o.neon[1]), 420, '#ff6fb0', o.neon[2]);
}
/* 房间里的人和物：她坐在桌前，Clawd 在桌上 */
function roomDesk(g, t, o = {}) {
  const D = ROOM.desk, F = ROOM.floor;
  lamp(g, 236, D, o.lamp ?? 1);
  laptop(g, 180, D, o.screen ?? 1);
  mug(g, 210, D, t, 1);
  // 填字杂志
  rect(g, 216, D - 1, 18, 1, '#efe6d5'); rect(g, 217, D - 2, 16, 1, '#d2473b');
  pot(g, 262, ROOM.wy + ROOM.wh + 2, t, o.pot ?? 0);
  chair(g, 118);
}

/* 第二句：她揭开纸袋，Clawd 其实也没什么；窗外的霓虹招牌一个字一个字亮 */
function shotRoomL1(t, T, lt) {
  const L1 = L(1), D = ROOM.desk;
  const cam = { x: 90 + lt * 1.0, y: 40 - lt * .2, k: 1.5 };
  const sign = { x: 168, y: 58, w: 88, h: 32, lines: [{ s: '在你了解了以后', times: L1.t.slice(0, 7) }, { s: '其实也没什么', times: L1.t.slice(7) }] };
  // 她的手：13.9 伸手，14.2–14.9 掀起纸袋，16.2 放下，17.6 摸摸头
  const reach = seg(t, 13.75, 14.15), lift = E.io(seg(t, 14.15, 14.95)), down = E.io(seg(t, 16.0, 16.6));
  const pat = seg(t, 17.5, 19.3);
  layer(g => {
    room(g, t, { tod: 0, sign });
    roomDesk(g, t);
    let armA, armLen = 10, hand = null;
    if (t < 13.75) { girl(g, 120, ROOM.floor - 2, 'chin', { t }); }
    else {
      if (t < 16.6) { armA = lerp(lerp(.5, -.05, reach), -1.1, lift * (1 - down)); armLen = lerp(lerp(9, 16, reach), 22, lift * (1 - down)); }
      else if (pat > 0 && pat < 1) { armA = -.1 + Math.sin(pat * TAU * 3) * .12; armLen = 16; }
      girl(g, 120, ROOM.floor - 2, 'sit', { t, armA, armLen, eyes: t > 17.6 ? 'happy' : 'n' });
    }
    // Clawd
    const cx = 146;
    const shown = t > 14.6;
    clawd(g, cx, D, { u: 2, t, eyes: t < 15.3 ? 'n' : t < 17.4 ? 'wide' : t < 19.4 ? 'squint' : 'happy', blush: clamp((t - 17.6) * 2), sq: pat > 0 && pat < 1 && Math.sin(pat * TAU * 3) > .3 ? 1 : 0, look: t < 15.3 ? 0 : -1 });
    // 纸袋：被手提起来，再放到桌子另一边
    const hx = 121 + Math.cos(armA ?? 0) * armLen, hy = ROOM.floor - 2 - 14 + 3 + Math.sin(armA ?? 0) * armLen;
    let bx = cx, by = D;
    if (t >= 14.15 && t < 16.0) { bx = lerp(cx, hx + 14, lift); by = lerp(D, hy - 1, lift); }
    else if (t >= 16.0) { bx = lerp(hx + 14, 172, down); by = lerp(hy - 1, D, down) - Math.sin(down * Math.PI) * 6; }
    paperBag(g, bx, Math.min(D, by), t);
    if (shown && t > 16.4) mark(g, cx, D - 18, '…', t, 17.4, 19.6, '#fff6e0');
  }, cam);
  const lit = L1.t.filter(x => t >= x).length / L1.t.length;
  roomLight(cam, t, { screen: [186, D - 10], neon: [212, 72, .18 + .25 * Math.min(1, lit * 1.5)] });
  bloom(.38, 1.15);
  dust(t, 24, 3, { a: .3 });
  vignette(.55);
}

/* 第三句：忽冷又忽热。Clawd 拿着遥控器，空调一会儿 16 度一会儿 30 度；窗上的霜里写出歌词 */
function shotRoomL2(t, T, lt) {
  const L2 = L(2), D = ROOM.desk;
  const cam = { x: 88 + lt * 1.2, y: 10 + Math.sin(lt * .5) * .5, k: 1.25 };
  // 冷热：字"冷"之后变冷，"热"之后变热，"隐藏"之后回到常温
  const tc = L2.t[4], th = L2.t[7], th2 = L2.t[8];
  const cold = seg(t, tc - .1, tc + .5) * (1 - seg(t, th - .1, th + .4));
  const hot = seg(t, th - .1, th + .4) * (1 - seg(t, th2 + .6, th2 + 1.6));
  const temp = t < tc - .1 ? 24 : t < th - .1 ? 16 : t < th2 + .6 ? 30 : 24;
  const frostAmt = lerp(.25, 1, E.out(seg(t, 20.0, 20.9))) * (1 - .2 * seg(t, th, th + 1.2));
  const hide = E.io(seg(t, L2.t[8] - .1, L2.t[8] + .5));
  layer(g => {
    room(g, t, {
      tod: 0, moon: true, acTemp: temp, acWind: cold > .05 ? -cold : hot > .05 ? hot : 0,
      frost: frostAmt, fog: t > th, drips: seg(t, th + .3, th + 2),
      glass: g2 => {
        // 霜上用手指抹出来的字（抹开的地方露出夜色）：上一行"我总是忽冷又忽热"，下一行"隐藏我的感受"
        ptext(g2, '我总是忽冷又忽热', ROOM.wx + ROOM.ww / 2, ROOM.wy + 23, '#1d2449', { align: 'c', times: L2.t.slice(0, 8), t, pop: .2, shadow: 'rgba(250,253,255,.9)', sdx: 0, sdy: 1 });
        ptext(g2, '隐藏我的感受', ROOM.wx + ROOM.ww / 2, ROOM.wy + 41, '#2a2247', { align: 'c', times: L2.t.slice(8), t, pop: .2, shadow: 'rgba(255,246,236,.9)', sdx: 0, sdy: 1 });
      },
    });
    roomDesk(g, t, { screen: 1 });
    // 她：冷的时候抱着胳膊发抖，热的时候拿手扇风
    const shiver = cold > .4 ? (fl(t * 18) % 2) : 0;
    if (hot > .4) girl(g, 120 + shiver, ROOM.floor - 2, 'sit', { t, armA: -1.2 + Math.sin(t * 14) * .35, armLen: 9, eyes: 'closed' });
    else if (cold > .4) girl(g, 120 + shiver, ROOM.floor - 2, 'hold', { t, eyes: 'closed' });
    else girl(g, 120, ROOM.floor - 2, 'chin', { t, eyes: t > th2 + 1 ? 'n' : 'n' });
    // Clawd：举着遥控器对着空调；"隐藏"时一溜烟钻回纸袋里
    const cx = lerp(148, 172, hide), hopY = Math.sin(hide * Math.PI) * 8;
    clawd(g, cx, D - hopY, { u: 2, t, armR: hide < .5 ? 2 : 0, eyes: cold > .4 ? 'squint' : hot > .4 ? 'happy' : 'n', walk: hide > 0 && hide < 1 ? t * 4 : undefined });
    if (hide < .5) { rect(g, cx + 10, D - 18, 3, 6, '#f2efe8'); px(g, cx + 11, D - 18, '#e8473b'); }
    paperBag(g, 172, D - (hide > .8 ? rd(Math.max(0, Math.sin((t - L2.t[8] - .4) * 9)) * 2 * (1 - seg(t, L2.t[8] + .4, L2.t[8] + 1.2))) : 0), t);
  }, cam);
  roomLight(cam, t, { screen: [186, D - 10], tint: cold > hot ? '#2f7dff' : '#ff7a2a', tintA: Math.max(cold, hot) * .38, tintMode: 'soft-light' });
  if (cold > 0) grade('#9fd4ff', cold * .05, 'screen');
  if (hot > 0) grade('#ffb070', hot * .05, 'screen');
  bloom(.36, 1.15);
  dust(t, 22, 4, { a: .3 });
  vignette(.55);
}
