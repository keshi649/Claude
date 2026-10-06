'use strict';
/* scenes5.js：天亮以后（便利贴、终于开口说话）、窗台开花、霓虹灯牌、回到填字卡片的结尾。 */

/* 对话气泡（尾巴指向 tx,ty） */
function bubble(g, x, y, w, h, tx, ty, lines, t, o = {}) {
  const a = o.alpha ?? 1; if (a <= 0) return;
  g.save(); g.globalAlpha *= a;
  rect(g, x + 2, y + 2, w, h, 'rgba(0,0,0,.25)');
  rrect(g, x, y, w, h, 3, '#fffdf8');
  // 尾巴
  const bx = clamp(tx, x + 6, x + w - 6);
  for (let k = 0; k < 5; k++) rect(g, lerp(bx, tx, k / 5) - (4 - k) / 2, y + h + k, Math.max(1, 4 - k), 1, '#fffdf8');
  lines.forEach((ln, i) => ptext(g, ln.s, x + w / 2, y + 4 + i * 14, ln.col || '#2a2420', { align: 'c', times: ln.times, t, pop: .12 }));
  g.restore();
}
/* 贴在窗玻璃上的便利贴，每张一个字 */
function stickyRow(g, s, times, x, y, t, cols, o = {}) {
  [...s].forEach((ch, k) => {
    const t0 = times[k]; if (t < t0 - .15) return;
    const u = E.back(clamp((t - t0 + .15) / .2)), fall = o.fall ? E.in(seg(t, o.fall + k * .05, o.fall + .6 + k * .05)) : 0;
    const X = x + k * 15, Y = y + rd((1 - u) * -6) + rd(fall * 90), c = cols[k % cols.length];
    g.save(); if (fall > 0) g.globalAlpha *= 1 - fall * .8;
    rect(g, X + 1, Y + 1, 14, 14, 'rgba(0,0,0,.18)'); rect(g, X, Y, 14, 14, c); rect(g, X, Y, 14, 2, mix(c, '#000000', .1));
    ptext(g, ch, X + 1, Y + 2, '#3a2a20');
    g.restore();
  });
}

/* ---------------- 天亮：Clawd 往窗玻璃上贴便利贴（196.2–202.7） ---------------- */
function shotDawnNotes(t, T, lt) {
  const L24 = L(24), D = ROOM.desk;
  const cam = { x: 112 + lt * .6, y: 26, k: 1.5 };
  layer(g => {
    room(g, t, {
      tod: 1, moon: false,
      glass: g2 => {
        stickyRow(g2, '猜的没错想得太多', L24.t.slice(0, 8), ROOM.wx + 4, ROOM.wy + 20, t, ['#f6e27a', '#f4a7b9', '#9ad6f0', '#c6ef9a']);
        stickyRow(g2, '不会有结果', L24.t.slice(8), ROOM.wx + 26, ROOM.wy + 38, t, ['#f6e27a', '#f4a7b9', '#9ad6f0', '#c6ef9a']);
      },
    });
    roomDesk(g, t, { lamp: 0, screen: .2, pot: 2 });
    girl(g, 120, ROOM.floor - 2, 'sleep', { t });
    blanketOn(g, D);
    // Clawd 站在窗台上，一张一张往玻璃上贴
    let k = -1; L24.t.forEach((x, i) => { if (t >= x - .2) k = i; });
    const target = k < 0 ? ROOM.wx + 8 : k < 8 ? ROOM.wx + 11 + k * 15 : ROOM.wx + 33 + (k - 8) * 15;
    const cx = clamp(target, ROOM.wx + 12, ROOM.wx + ROOM.ww - 12), cy = ROOM.wy + ROOM.wh + 2;
    clawd(g, cx, cy, { u: 2, t, eyes: k >= 12 ? 'sad' : 'up', armR: k >= 0 && t - L24.t[Math.max(0, k)] < .3 ? 2 : 1, armL: 1, walk: undefined });
    // 揉成团的纸
    for (let i = 0; i < Math.min(6, fl((t - 196) * 1.2)); i++) disc(g, 200 + i * 6 + (i % 2) * 2, D - 2 - (i % 2) * 2, 2, '#f2efe6');
  }, cam);
  roomLight(cam, t, { lamp: .4, day: .45 + .2 * seg(t, 196.2, 202.7), lx: 210, ly: 64, r: 1500 });
  grade('#8a9ae8', .18, 'soft-light');
  shafts([{ x: 700, w: 300, a: .16, col: '#ffd8b0' }], -.4, 16);
  bloom(.3, 1.1);
  dust(t, 14, 91, { a: .25 });
  vignette(.5);
}

/* ---------------- 她醒了，Clawd 终于开口说话（202.7–216.9） ---------------- */
function shotDawnTalk(t, T, lt) {
  const L24 = L(24), L25 = L(25), L26 = L(26), D = ROOM.desk;
  const cam = { x: 92 + lt * .5, y: 40, k: 1.5 };
  const wake = seg(t, L25.t[0] - .6, L25.t[1]);
  const sun = seg(t, 202.7, 216.9);
  layer(g => {
    room(g, t, {
      tod: sun > .5 ? 2 : 1,
      glass: g2 => {
        stickyRow(g2, '猜的没错想得太多', L24.t.slice(0, 8), ROOM.wx + 4, ROOM.wy + 20, t, ['#f6e27a', '#f4a7b9', '#9ad6f0', '#c6ef9a'], { fall: L25.t[0] - .2 });
        stickyRow(g2, '不会有结果', L24.t.slice(8), ROOM.wx + 26, ROOM.wy + 38, t, ['#f6e27a', '#f4a7b9', '#9ad6f0', '#c6ef9a'], { fall: L25.t[0] - .2 });
      },
    });
    roomDesk(g, t, { lamp: 0, screen: .2, pot: 2 });
    if (wake < 1) { girl(g, 120, ROOM.floor - 2, 'sleep', { t }); blanketOn(g, D); }
    else { girl(g, 120, ROOM.floor - 2, t < L26.t[0] ? 'chin' : 'sit', { t, eyes: t < L25.t[3] ? 'wide' : t > L26.t[11] ? 'happy' : 'n' }); rect(g, 112, D - 22, 6, 12, '#7d93c4'); }
    // Clawd：被看穿 → 想躲到马克杯后面（杯子太小，躲不住）→ 走回来，低着头说话
    const hideU = seg(t, L25.t[5], L25.t[7]), back = seg(t, L25.t[12], L26.t[0]);
    const cx = lerp(lerp(150, 214, E.io(hideU)), 152, E.io(back)), cy = D;
    clawd(g, cx, cy, { u: 2, t, eyes: t < L25.t[5] ? 'wide' : back < 1 ? 'closed' : t < L26.t[9] ? 'sad' : 'n', sweat: hideU > 0 && back < 1 ? 1 : 0, blush: t > L26.t[0] ? 1 : 0, look: -1, walk: (hideU > 0 && hideU < 1) || (back > 0 && back < 1) ? t * 3 : undefined });
    mug(g, 210, D, t, 0);
    // 对话气泡
    if (t > L25.t[0] - .3) bubble(g, rd(cx - 50), 66, 100, 32, cx, cy - 18, [{ s: '被你看穿了以后', times: L25.t.slice(0, 7) }, { s: '我更无处可躲', times: L25.t.slice(7) }], t, { alpha: 1 - seg(t, L26.t[0] - .5, L26.t[0] - .2) });
    if (t > L26.t[0] - .3) bubble(g, rd(cx - 50), 66, 100, 32, cx, cy - 18, [{ s: '我开始后悔不', times: L26.t.slice(0, 6) }, { s: '应该太聪明的卖弄', times: L26.t.slice(6) }], t);
  }, cam);
  roomLight(cam, t, { lamp: 0, day: .65 + .35 * sun, lx: 210, ly: 60, r: 1700 });
  grade(mix('#8a9ad8', '#ffd8a8', sun), .2, 'soft-light');
  shafts([{ x: 640, w: 320, a: .18 * sun, col: '#ffe0b0' }, { x: 1080, w: 160, a: .12 * sun, col: '#ffe0b0' }], -.45, 16);
  bloom(.32, 1.1);
  dust(t, 20, 95, { a: .35 });
  vignette(.45);
}

/* ---------------- 窗台：花苞 → 开花（216.9–231.4） ---------------- */
function shotSillMorning(t, T, lt) {
  const L27 = L(27), L28 = L(28), S0 = 110, px0 = 150;
  const cam = { x: 78 + lt * .4, y: 34 - lt * .15, k: 1.5 };
  const bloomU = seg(t, L28.t[8], L28.t[11] + .4);
  const stage = t < L28.t[0] ? 3 : 3 + bloomU * 1.6;
  layer(g => cityView(g, -20, -30, 360, S0 + 30, t, { tod: 2, sun: [270, 60 - lt * 1.5] }), cam, { blur: 1.4 });
  layer(g => {
    const useSign = t < L28.t[0] - .4;
    // 第二十九句：窗上起了一层水汽，歌词像是用手指写上去的（和"忽冷又忽热"那句呼应）
    sill(g, t, {
      noOutside: true,
      glass: useSign ? null : g2 => {
        frost(g2, 65, -30, 185, S0 - 3 + 30, .38 * seg(t, L28.t[0] - .8, L28.t[0] - .2), t, true);
        ptext(g2, '只是怕亲手', 158, 50, '#4a3a46', { align: 'c', times: L28.t.slice(0, 5), t, pop: .2, shadow: 'rgba(255,250,240,.9)', sdx: 0, sdy: 1 });
        ptext(g2, '将我的真心葬送', 158, 66, '#4a3a46', { align: 'c', times: L28.t.slice(5), t, pop: .2, shadow: 'rgba(255,250,240,.9)', sdx: 0, sdy: 1 });
      },
    });
    pot(g, px0, S0, t, stage, useSign ? { sign: { lines: [{ s: '只是怕亲手', times: L27.t.slice(0, 5) }, { s: '将我的真心葬送', times: L27.t.slice(5) }], w: 90 } } : {});
    clawd(g, 124, S0, { u: 2, t, eyes: bloomU > .6 ? 'heart' : t > L28.t[0] ? 'wide' : 'n', look: 1, blush: bloomU > .6 ? 1 : 0 });
    if (bloomU > .7) for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + t, r = 16 + Math.sin(t * 3 + k) * 2; px(g, px0 + Math.cos(a) * r, S0 - 40 + Math.sin(a) * r * .7, '#ffd0e0'); }
  }, cam);
  glow(sx(cam, px0), sy(cam, S0 - 38), 240, '#ff9dbb', .3 * bloomU);
  shafts([{ x: 900, w: 380, a: .22, col: '#fff0d0' }, { x: 1400, w: 200, a: .15, col: '#fff0d0' }], -.35, 16);
  grade('#ffe6c8', .18, 'soft-light');
  bloom(.34, 1.12);
  dust(t, 22, 101, { a: .4 });
  vignette(.42);
}

/* ---------------- 白天的房间：霓虹又亮了，Clawd 把花送给她（231.4–238.7） ---------------- */
function shotGive(t, T, lt) {
  const L29 = L(29), D = ROOM.desk;
  const cam = { x: 96 + lt * .8, y: 40, k: 1.5 };
  const sign = { x: 168, y: 58, w: 88, h: 32, lines: [{ s: '我开始后悔不应', times: L29.t.slice(0, 7), col: '#ff6fa8' }, { s: '该太聪明的卖弄', times: L29.t.slice(7), col: '#ff6fa8' }] };
  const carry = E.io(seg(t, L29.t[2], L29.t[11]));
  layer(g => {
    room(g, t, { tod: 2, sign });
    roomDesk(g, t, { lamp: 0, screen: .2, pot: 1.2 });
    girl(g, 120, ROOM.floor - 2, t > L29.t[12] ? 'sit' : 'chin', { t, eyes: t > L29.t[11] ? 'happy' : 'n', armA: t > L29.t[12] ? -.2 : undefined, armLen: 13 });
    // Clawd 捧着心形的花，从窗台那边走过来
    const cx = lerp(200, 146, carry);
    clawd(g, cx, D, { u: 2, t, eyes: 'happy', armL: 1, armR: 1, walk: carry > 0 && carry < 1 ? t * 3 : undefined, blush: 1 });
    const fx = cx - 3, fy = D - 22 + (carry > 0 && carry < 1 ? -(fl(t * 6) % 2) : 0);
    rect(g, cx, fy + 6, 1, 8, '#5fa152');
    const HP = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
    HP.forEach((r, j) => { for (let i = 0; i < 7; i++) if (r[i] === '#') px(g, fx + i, fy + j, j < 2 && i % 3 === 1 ? '#ffb3c8' : '#f2648c'); });
  }, cam);
  roomLight(cam, t, { lamp: 0, day: 1, lx: 210, ly: 60, r: 1900, neon: [212, 72, .12] });
  grade('#ffe2b8', .2, 'soft-light');
  shafts([{ x: 560, w: 340, a: .2, col: '#fff0d0' }, { x: 1040, w: 180, a: .14, col: '#fff0d0' }], -.45, 16);
  bloom(.32, 1.1);
  dust(t, 20, 111, { a: .38 });
  vignette(.42);
}

/* ---------------- 结尾：回到桌面上的填字卡片（238.7–261.6） ---------------- */
function shotFinal(t, T, lt) {
  const L30 = L(30);
  const pull = E.io(seg(t, 246.0, 252.0));
  const cam = { x: lerp(-10, 2, pull) + Math.sin(t * .3) * .8, y: lerp(-6, 4, pull) };
  layer(g => {
    const cx = 55, cy = 18, red = '#d2473b';
    deskTop(g, t, {
      hl: undefined, stampEyes: t > 250.5 && t < 250.8 ? 'blink' : 'happy',
      fill: { s: L(0).text, times: L(0).t },
      // 最后一句写在卡片下面新的一排格子里（十二格）
      row2: (g2, X, Y) => {
        for (let i = 0; i < 12; i++) {
          const bx = X + 9 + i * 16, by = Y + 92;
          rect(g2, bx, by, 14, 1, red); rect(g2, bx, by + 13, 14, 1, red); rect(g2, bx, by, 1, 14, red); rect(g2, bx + 13, by, 1, 14, red);
        }
        ptext(g2, L30.text, X + 10, Y + 93, '#2b3060', { times: L30.t, t, pop: .12, gap: 4 });
      },
    });
    // 心形花插在一个玻璃杯里，放在卡片旁边
    const gxp = 284, gyp = 62;
    rect(g, gxp - 6, gyp - 2, 12, 16, 'rgba(220,240,255,.45)'); rect(g, gxp - 6, gyp - 2, 12, 1, 'rgba(255,255,255,.8)');
    disc(g, gxp, gyp - 6, 6, '#5fa152');
    const HP = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
    HP.forEach((r, j) => { for (let i = 0; i < 7; i++) if (r[i] === '#') px(g, gxp - 3 + i, gyp - 9 + j, j < 2 && i % 3 === 1 ? '#ffb3c8' : '#f2648c'); });
    // Clawd 跳格子，和开头一样
    let i = -1; L30.t.forEach((x, k) => { if (t >= x - .22) i = k; });
    const bxk = k => cx + 15 + k * 16;
    let x = bxk(0), y = cy + 90, o = { u: 1, t, eyes: 'n' };
    if (i >= 0) { const u = clamp((t - (L30.t[i] - .22)) / .22), from = i === 0 ? bxk(0) : bxk(i - 1); x = lerp(from, bxk(i), E.io(u)); y = cy + 90 - Math.sin(u * Math.PI) * 5; }
    if (t > L30.t[11] + .3) { const u = E.io(seg(t, L30.t[11] + .3, L30.t[11] + 1.2)); x = lerp(bxk(11), 266, u); y = lerp(cy + 90, 76, u) - Math.sin(u * Math.PI) * 12; o.eyes = u >= 1 ? 'happy' : 'n'; o.blush = u >= 1 ? 1 : 0; }
    clawd(g, x, y, o);
    if (t > 247.5) mark(g, 266, 62, '♥', t, 247.5, 262);
  }, cam);
  const z = lerp(1.32, 1.0, pull);
  zoomView(z, .5, lerp(.86, .5, pull));
  const gr = vg.createRadialGradient(VW * .28, -80, 60, VW * .4, VH * .3, 1500);
  gr.addColorStop(0, '#ffffff'); gr.addColorStop(.45, '#e8d0b8'); gr.addColorStop(1, '#4a3a44');
  vg.save(); vg.globalCompositeOperation = 'multiply'; vg.fillStyle = gr; vg.fillRect(0, 0, VW, VH); vg.restore();
  shafts([{ x: 300, w: 380, a: .2, col: '#fff0d0' }, { x: 1000, w: 220, a: .14, col: '#fff0d0' }], .5, 16);
  glow(VW * .3, VH * .15, 900, '#ffcf8a', .2);
  bloom(.3, 1.1);
  dust(t, 26, 7, { a: .4, vx: 6, vy: -4 });
  vignette(.55, .4);
}
