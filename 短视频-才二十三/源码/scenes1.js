'use strict';
/* scenes1.js：前半段（安静的编曲）——唱片机开场、片名、一个 23 岁的普通一天，直到火苗熄灭。
   每个场景 draw(g, s)：s 是歌曲时间（秒）。画面上的字都是原创的旁白和拟声，不放歌词。 */

const sing = s => clamp((voc(s) - .22) * 1.7);   // 跟着人声张嘴

/* ================= 0 唱片机 ================= */
function turntable(g, s, o = {}) {
  const spin = o.spin ?? 0;            // 唱片转过的角度
  const armU = o.arm ?? 0;             // 唱臂：0 停放，1 落在唱片上
  // 背景：斜条纹 + 网点
  g.fillStyle = C.pinkL; g.fillRect(0, 0, W, H);
  g.save(); g.fillStyle = C.pink;
  for (let i = -20; i < 40; i++) { g.beginPath(); g.moveTo(i * 90, 0); g.lineTo(i * 90 + 45, 0); g.lineTo(i * 90 + 45 - 700, H); g.lineTo(i * 90 - 700, H); g.fill(); }
  g.restore();
  dots(g, .05);
  const bx = 760, by = 540;
  // 机身（复古手提箱唱机）
  g.fillStyle = 'rgba(60,20,30,.22)'; rr(g, bx - 560 + 18, by - 380 + 24, 1120, 760, 46); g.fill();
  rr(g, bx - 560, by - 380, 1120, 760, 46); fs(g, C.teal, INK, 6);
  rr(g, bx - 520, by - 340, 1040, 680, 30); fs(g, C.tealD);
  dots(g, .1, true, bx - 520, by - 340, 1040, 680);
  rr(g, bx - 520, by - 340, 1040, 680, 30); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 3; g.stroke();
  // 唱盘
  const px = bx - 90, py = by;
  circ(g, px + 10, py + 14, 310); fs(g, 'rgba(0,0,0,.25)');
  circ(g, px, py, 310); fs(g, '#C9CED6', INK, 5);
  circ(g, px, py, 292); fs(g, '#16151A');
  for (let r = 120; r < 288; r += 7) { circ(g, px, py, r); g.strokeStyle = r % 21 ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.1)'; g.lineWidth = 2; g.stroke(); }
  // 唱片反光
  g.save(); g.translate(px, py); g.rotate(-.6);
  g.fillStyle = 'rgba(255,255,255,.08)';
  g.beginPath(); g.arc(0, 0, 285, -.5, .15); g.arc(0, 0, 130, .15, -.5, true); g.fill();
  g.beginPath(); g.arc(0, 0, 285, Math.PI - .5, Math.PI + .1); g.arc(0, 0, 130, Math.PI + .1, Math.PI - .5, true); g.fill();
  g.restore();
  // 标签（跟着转）
  g.save(); g.translate(px, py); g.rotate(spin);
  circ(g, 0, 0, 112); fs(g, C.red);
  circ(g, 0, 0, 104); g.strokeStyle = C.cream; g.lineWidth = 2; g.stroke();
  text(g, '才二十三', 0, -18, 46, { k: 'brush', col: C.cream });
  text(g, 'KHALIL FONG', 0, 30, 17, { k: 'en', col: C.cream, ls: 3 });
  text(g, 'SIDE A · 33⅓', 0, 56, 12, { k: 'en', col: 'rgba(246,238,223,.8)', ls: 2 });
  circ(g, 0, 0, 9); fs(g, '#E6E2DA', INK, 2);
  g.restore();
  // 旋钮和指示灯
  [[bx + 360, by + 230], [bx + 440, by + 230]].forEach(([x, y], i) => { circ(g, x, y, 30); fs(g, C.cream, INK, 4); line(g, x, y, x + Math.cos(s * (i ? 1 : -.7)) * 20, y + Math.sin(s * (i ? 1 : -.7)) * 20, INK, 5); });
  circ(g, bx + 400, by + 150, 10); fs(g, spin ? (bphase(s, 2) < .5 ? '#FF5A4E' : '#B33A33') : '#5A3A3A', INK, 2);
  text(g, '33', bx + 360, by + 290, 18, { k: 'en', col: C.cream }); text(g, '45', bx + 440, by + 290, 18, { k: 'en', col: C.cream });
  // 唱臂
  const ax = bx + 370, ay = by - 230;
  circ(g, ax, ay, 52); fs(g, '#D8DCE2', INK, 5); circ(g, ax, ay, 22); fs(g, '#8A909A', INK, 3);
  const ang = lerp(.18, .62, armU);   // 绕支点转
  g.save(); g.translate(ax, ay); g.rotate(ang);
  line(g, 0, 0, -8, 400, INK, 18); line(g, 0, 0, -8, 400, '#E9ECF0', 11);
  g.translate(-8, 400); g.rotate(.5);
  rr(g, -22, -10, 44, 70, 8); fs(g, C.mustard, INK, 4);
  g.restore();
  rr(g, ax + 50, ay + 340, 60, 26, 8); fs(g, '#8A909A', INK, 3);
  return { px, py, ax, ay, ang };
}
function noteGlyph(g, x, y, sz, col, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  ell(g, 0, 0, sz * .55, sz * .4, -.4); fs(g, col);
  line(g, sz * .48, -sz * .1, sz * .48, -sz * 1.5, col, sz * .16);
  g.beginPath(); g.moveTo(sz * .48, -sz * 1.5); g.quadraticCurveTo(sz * 1.1, -sz * 1.2, sz * .95, -sz * .7); g.strokeStyle = col; g.lineWidth = sz * .16; g.stroke();
  g.restore();
}
const S_INTRO = {
  draw(g, s) {
    const drop = -.55;                              // 唱针落下
    const arm = E.io(seg(s, -1.7, -.6));
    const spin = s < -1 ? 0 : (s + 1) * .55 * TAU * E.out(seg(s, -1, -.2));
    // 推镜头：第 3 小节开始推进标签
    const z = E.in(seg(s, bar(3) - .2, bar(4))), zoom = 1 + z * 7;
    g.save();
    const fx = 670, fy = 540;
    g.translate(W / 2, H / 2); g.scale(zoom, zoom); g.translate(-lerp(W / 2, fx, z), -lerp(H / 2, fy, z));
    const tt = turntable(g, s, { spin, arm });
    // 小烛：从右边走进来，推唱臂，坐在机身边上
    let cx, cy = 990, pose = {};
    if (s < -1.9) { cx = lerp(2000, 1420, E.out(seg(s, -3, -1.9))); pose = { walk: s * 2.2, face: 'smile', look: -6 }; }
    else if (s < -.6) { cx = 1420; pose = { armL: lerp(.3, 2.3, E.out(seg(s, -1.9, -1.6))), face: 'surprise', look: -8, lookY: -6 }; }
    else { cx = 1420; pose = { face: s > 1 ? 'happy' : 'smile', mouth: sing(s) * .8, armL: .5 + bob(s) * .3, armR: .5 + bob(s) * .3, tilt: Math.sin(beatIdx(s) * Math.PI / 2) * .06 }; }
    candle(g, cx, cy + (s > -.6 ? -bob(s) * 10 : 0), s, { s: 1.35, flame: 1, ...pose });
    if (s >= -.6) { sfx(g, '咔', 1250, 560, 70, C.yel, s, drop, -.15, .6); }
    // 音符
    if (s > 0) {
      for (let i = 0; i < 8; i++) {
        const k = Math.floor(beatIdx(s) / 2) - i; if (k < 0) continue;
        const t0 = BEAT0 + k * 2 * BEAT, u = (s - t0) / 2.6; if (u > 1) continue;
        const x = tt.px + 150 + hash(k, 1) * 260 + Math.sin(u * 6 + k) * 20, y = 300 - u * 260;
        withAlpha(g, Math.sin(u * Math.PI), () => noteGlyph(g, x, y, 22 + hash(k, 2) * 12, [C.red, C.cream, C.mustard][k % 3], Math.sin(u * 5) * .3));
      }
    }
    g.restore();
    // 竖排片名（不跟着推镜头）
    withAlpha(g, 1 - z, () => {
      const xs = 1730;
      [...'才二十三'].forEach((ch, i) => { const t0 = -2.5 + i * .3; if (s > t0) text(g, ch, xs, 190 + i * 160, 150, { k: 'brush', col: C.redD, alpha: clamp((s - t0) / .25), sc: 1 + .4 * (1 - E.out(clamp((s - t0) / .3))) }); });
      [...'方大同'].forEach((ch, i) => { const t0 = -1.2 + i * .15; if (s > t0) text(g, ch, xs - 140, 230 + i * 62, 48, { k: 'serif', col: INK, alpha: clamp((s - t0) / .25) }); });
      if (s > -.3) withAlpha(g, clamp((s + .3) / .2), () => seal(g, xs - 140, 470, 62, '廿三', -.06));
      text(g, 'KHALIL FONG', xs - 140, 610, 22, { k: 'en', col: INK, rot: Math.PI / 2, ls: 4, alpha: clamp((s + 1) / .5) });
    });
    if (z > .6) { g.fillStyle = `rgba(215,38,61,${(z - .6) / .4})`; g.fillRect(0, 0, W, H); }
  },
};

/* ================= 1 片名 ================= */
const S_TITLE = {
  draw(g, s) {
    const L = s - bar(4);
    sunburst(g, W / 2, 1300, 32, C.cream, C.pinkL, s * .06);
    dots(g, .05);
    g.fillStyle = C.paper; g.fillRect(0, 860, W, 220);
    line(g, 0, 860, W, 860, INK, 5);
    dots(g, .06, false, 0, 860, W, 220);
    // 四个字依次砸下
    const chars = [...'才二十三'];
    chars.forEach((ch, i) => {
      const t0 = bar(4) + .1 + i * 2 * BEAT;
      if (s < t0) return;
      const u = clamp((s - t0) / .5);
      const y = 330 - (1 - E.bounce(u)) * 500;
      const [sx, sy] = shake(s, t0 + .2, 6, .3);
      text(g, ch, 470 + i * 330 + sx, y + sy - 60, 270, { k: 'brush', col: C.red, ext: 16, extCol: C.redD, sc: 1 + .06 * Math.sin(Math.PI * clamp((s - t0 - .3) / .3)) });
    });
    // 副标题
    popText(g, s, bar(6), 'ONLY  TWENTY - THREE', W / 2, 470, 44, { k: 'en', col: INK, ls: 10 });
    popText(g, s, bar(6) + .3, '方大同  Khalil Fong', W / 2, 530, 34, { k: 'serif', col: C.redD });
    // 小烛走进来，火苗"噗"地点亮
    const lit = bar(6) + 2 * BEAT;
    const cx = lerp(-120, 960, E.out(seg(s, bar(4) + .4, bar(5) + 2 * BEAT)));
    const walking = s < bar(5) + 2 * BEAT;
    const fl = s < lit ? 0 : E.elastic(clamp((s - lit) / .6)) * 1.1;
    candle(g, cx, 860 - (walking ? 0 : bob(s) * 10), s, {
      s: 1.05, walk: walking ? s * 2.5 : null, flame: fl, glow: .6,
      face: s < lit ? 'smile' : s < lit + .5 ? 'surprise' : 'happy', look: walking ? 6 : 0,
      armL: s > lit + .5 ? 2.5 - bob(s) * .4 : .3, armR: s > lit + .5 ? 2.5 - bob(s) * .4 : .3, mouth: s > lit + .5 ? sing(s) : 0,
    });
    sfx(g, '噗!', 1140, 620, 64, C.orange, s, lit, .1, .7);
    if (s > lit) for (let i = 0; i < 10; i++) { const a = i * TAU / 10, u = clamp((s - lit) / .6); withAlpha(g, 1 - u, () => sparkle(g, 960 + Math.cos(a) * (60 + u * 160), 650 + Math.sin(a) * (60 + u * 160), 12 * (1 - u * .5), C.mustard)); }
    seal(g, 1790, 110, 76, '廿三', .05);
  },
};

/* ================= 2 早上 ================= */
const S_MORNING = {
  draw(g, s) {
    // 墙
    g.fillStyle = '#F7D9A8'; g.fillRect(0, 0, W, H);
    g.save(); g.globalAlpha = .25; for (let i = 0; i < 30; i++) { g.fillStyle = i % 2 ? '#F2C88A' : '#F7D9A8'; g.fillRect(i * 70, 0, 35, 780); } g.restore();
    dots(g, .05);
    g.fillStyle = '#C98B5A'; g.fillRect(0, 780, W, 300); line(g, 0, 780, W, 780, INK, 5);
    for (let i = 0; i < 12; i++) line(g, i * 180 + 40, 790, i * 180 - 60, 1080, 'rgba(0,0,0,.08)', 4);
    // 窗：日出
    const wx = 1270, wy = 120, ww = 460, wh = 380;
    rr(g, wx - 16, wy - 16, ww + 32, wh + 32, 12); fs(g, C.cream, INK, 5);
    g.save(); rr(g, wx, wy, ww, wh, 6); g.clip();
    const rise = E.out(seg(s, bar(8), bar(11)));
    g.fillStyle = vgrad(g, wy, wy + wh, [[0, mixc('#7FA7D9', '#9ED4E8', rise)], [.7, mixc('#F7A98B', '#FCE3B0', rise)], [1, '#FCE3B0']]); g.fillRect(wx, wy, ww, wh);
    const sy = wy + wh - 40 - rise * 170;
    circ(g, wx + 300, sy, 70); fs(g, C.orange);
    g.save(); g.translate(wx + 300, sy); face(g, { face: s < bar(10) ? 'sleep' : 'smile', blush: 1 }, s); g.restore();
    g.fillStyle = '#86B98A'; g.beginPath(); g.moveTo(wx, wy + wh); g.quadraticCurveTo(wx + 120, wy + wh - 90, wx + 260, wy + wh - 30); g.quadraticCurveTo(wx + 380, wy + wh - 100, wx + ww, wy + wh - 40); g.lineTo(wx + ww, wy + wh); g.fill();
    cloud(g, wx + 110 + s * 6 % 80, wy + 90, .6);
    g.restore();
    line(g, wx + ww / 2, wy, wx + ww / 2, wy + wh, C.cream, 12); line(g, wx, wy + wh / 2, wx + ww, wy + wh / 2, C.cream, 12);
    // 窗帘
    [[wx - 70, 1], [wx + ww + 70, -1]].forEach(([x, d]) => { g.beginPath(); g.moveTo(x - 50 * d, wy - 40); g.lineTo(x + 50 * d, wy - 40); g.quadraticCurveTo(x + 20 * d, wy + 250, x + 60 * d, wy + wh + 40); g.lineTo(x - 50 * d, wy + wh + 40); g.closePath(); fs(g, C.rose, INK, 4); });
    // 日历
    const cx0 = 760, cy0 = 170;
    rr(g, cx0, cy0, 220, 250, 10); fs(g, C.white, INK, 4);
    rr(g, cx0, cy0, 220, 64, [10, 10, 0, 0]); fs(g, C.red, INK, 4);
    text(g, '十月', cx0 + 110, cy0 + 34, 34, { k: 'brush', col: C.cream });
    text(g, '23', cx0 + 110, cy0 + 160, 120, { k: 'en', col: INK });
    g.beginPath(); g.ellipse(cx0 + 110, cy0 + 160, 92, 66, -.1, 0, TAU * E.out(seg(s, bar(9), bar(10)))); g.strokeStyle = C.red; g.lineWidth = 7; g.stroke();
    circ(g, cx0 + 60, cy0 - 6, 8); fs(g, INK); circ(g, cx0 + 160, cy0 - 6, 8); fs(g, INK);
    // 床
    const bx = 120, byy = 800;
    rr(g, bx, 430, 60, 380, 12); fs(g, C.brown, INK, 5);
    rr(g, bx + 980, 600, 50, 210, 12); fs(g, C.brown, INK, 5);
    rr(g, bx + 30, 640, 1000, 110, 16); fs(g, C.white, INK, 5);
    // 枕头
    rr(g, bx + 70, 560, 220, 100, 40); fs(g, C.white, INK, 5);
    // 小烛：在被子下面，醒来坐起
    const wake = bar(9) + 2 * BEAT, up = E.back(clamp((s - wake) / .5));
    const yawn = s > bar(10) && s < bar(10) + 1.2;
    const lightOn = s < wake ? 0 : E.out(clamp((s - wake - .3) / .5));
    candle(g, bx + 200 + up * 40, 700 - up * 70, s, {
      s: .95, sit: true, tilt: lerp(-1.35, 0, up), flame: lightOn * (yawn ? 1.2 : .9), face: s < wake ? 'sleep' : yawn ? 'surprise' : s > bar(11) ? 'smile' : 'tired',
      mouth: yawn ? .9 * Math.sin(Math.PI * clamp((s - bar(10)) / 1.1)) : 0, armL: yawn ? 2.7 : .3, armR: yawn ? 2.7 : s > bar(11) - .3 ? lerp(.3, 1.6, E.out(seg(s, bar(11) - .3, bar(11)))) : .3, shadow: false,
    });
    if (s < wake) { const z = (s * 1.2) % 1; text(g, 'z', bx + 330 + z * 60, 480 - z * 90, 40 + z * 20, { k: 'en', col: C.navy, alpha: Math.sin(z * Math.PI) }); }
    // 被子
    g.beginPath(); g.moveTo(bx + 260, 640); g.quadraticCurveTo(bx + 600, 600 - 0 * 10, bx + 1040, 630); g.lineTo(bx + 1040, 800); g.lineTo(bx + 230, 800); g.quadraticCurveTo(bx + 200, 700, bx + 260, 640); g.closePath();
    fs(g, C.red, INK, 5);
    g.save(); g.clip(); g.fillStyle = C.rose; for (let i = 0; i < 14; i++) g.fillRect(bx + 250 + i * 60, 560, 28, 300); g.restore();
    g.beginPath(); g.moveTo(bx + 260, 640); g.quadraticCurveTo(bx + 600, 600, bx + 1040, 630); g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
    // 床头柜 + 闹钟（每拍跳一下）
    rr(g, bx + 1080, 640, 200, 160, 8); fs(g, C.brownL, INK, 5); line(g, bx + 1090, 720, bx + 1270, 720, INK, 3);
    const ringing = s > bar(8) && s < bar(11);
    const jig = ringing ? Math.sin(s * 70) * 5 : 0;
    g.save(); g.translate(bx + 1180 + jig, 580); g.rotate(ringing ? Math.sin(s * 60) * .08 : 0);
    circ(g, -38, -66, 20); fs(g, C.mustard, INK, 4); circ(g, 38, -66, 20); fs(g, C.mustard, INK, 4);
    line(g, -30, 50, -44, 66, INK, 6); line(g, 30, 50, 44, 66, INK, 6);
    clock(g, 0, 0, 62, 7, 0, C.teal);
    g.restore();
    if (ringing) {
      for (let k = Math.floor(beatIdx(bar(8))); k < beatIdx(bar(11)); k += 2) { const t0 = BEAT0 + k * BEAT; sfx(g, '叮铃铃!', bx + 1180 + (k % 4 ? 150 : -150), 420, 54, C.red, s, t0, k % 4 ? .15 : -.15, .6); }
    }
    if (s > bar(11) && s < bar(11) + .8) sfx(g, '啪', bx + 1180, 470, 70, C.yel, s, bar(11), 0, .8);
    if (yawn) text(g, '哈～欠', bx + 420, 420, 52, { k: 'cute', col: C.navy, alpha: win(s, bar(10), bar(10) + 1.2, .15, .3), rot: -.06 });
    caption(g, s, bar(8) + .3, bar(12) - .1, '07:00', '闹钟响了第三遍');
  },
};

/* ================= 3 地铁早高峰 ================= */
function subwayCar(g, s, opt) {
  const speed = opt.speed ?? 1;
  // 车厢墙
  g.fillStyle = '#DCE9E4'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#C5D9D2'; g.fillRect(0, 0, W, 120);
  dots(g, .04);
  // 车窗（外面：隧道里一闪而过的灯）
  const wins = [[120, 230], [760, 230], [1400, 230]];
  wins.forEach(([x, y]) => {
    rr(g, x - 10, y - 10, 420, 280, 34); fs(g, '#9FB8B0', INK, 5);
    g.save(); rr(g, x, y, 400, 260, 26); g.clip();
    g.fillStyle = opt.outside || '#1E2433'; g.fillRect(x, y, 400, 260);
    if (opt.drawOutside) opt.drawOutside(g, x, y);
    else {
      const off = (opt.travel ?? s * 1400) % 600;
      for (let i = -1; i < 3; i++) { const lx = x + 600 - off - i * 600 + (x * .37 % 600); g.fillStyle = 'rgba(255,214,120,.85)'; g.fillRect(lx, y + 60, 160 * Math.min(1, speed), 10); g.fillRect(lx + 40, y + 190, 100 * Math.min(1, speed), 8); }
    }
    g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.moveTo(x + 60, y); g.lineTo(x + 140, y); g.lineTo(x + 40, y + 260); g.lineTo(x - 40, y + 260); g.fill();
    g.restore();
  });
  // 线路图
  g.fillStyle = C.white; rr(g, 260, 30, 1400, 70, 12); g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
  line(g, 330, 65, 1590, 65, opt.lineCol || C.red, 10);
  const stops = opt.stops;
  stops.forEach((name, i) => {
    const x = 330 + i * (1260 / (stops.length - 1));
    const cur = i === opt.cur;
    const blink = cur && bphase(s, 2) < .5;
    circ(g, x, 65, cur ? 18 : 12); fs(g, cur ? (blink ? C.mustard : C.white) : C.white, INK, 4);
    text(g, name, x, 65 + (cur ? 0 : 0), cur ? 18 : 15, { k: 'en', col: INK });
  });
  // 扶手杆
  line(g, 0, 150, W, 150, '#A9B4B8', 12);
}
function strap(g, x, s, sway) {
  g.save(); g.translate(x, 150); g.rotate(sway);
  line(g, 0, 0, 0, 120, '#5B6168', 8);
  circ(g, 0, 145, 26); g.strokeStyle = C.mustard; g.lineWidth = 9; g.stroke();
  g.restore();
}
const S_SUBWAY = {
  draw(g, s) {
    const L = s - bar(12);
    const stopT = bar(16), push = bar(16) + 2 * BEAT, eject = bar(19) + 2 * BEAT;
    const brake = 1 - win(s, stopT - .6, push + .4, .6, .4) * .9;
    const sway = Math.sin(beatIdx(s) * Math.PI / 2) * .06 * brake + (s > stopT - .6 && s < stopT ? .12 * Math.sin(Math.PI * seg(s, stopT - .6, stopT)) : 0);
    subwayCar(g, s, { speed: brake, travel: s * 1400 - (s > stopT - .6 ? (s - stopT + .6) * 1400 * (1 - brake) : 0), stops: ['18', '19', '20', '21', '22', '23', '24', '25', '26', '27'], cur: 5 });
    for (let i = 0; i < 9; i++) strap(g, 120 + i * 210, s, sway * (1 + (i % 3) * .2) + Math.sin(s * 3 + i) * .02);
    const ox = sway * 120;
    // 后排人群
    const r = R(11);
    for (let i = 0; i < 9; i++) {
      const x = 40 + i * 235 + r() * 40, h = 360 + r() * 90;
      commuter(g, x + ox * .6, 1150, s, { s: 1.2, h, w: 100, col: mixc('#8F8C96', '#B6B3BC', r()), tilt: sway * .8, face: 'tired', seed: i, phone: i % 3 === 0, look: i % 3 === 0 ? 6 : 0 });
    }
    // 前排：小烛被挤在中间
    const squeeze = .08 + .2 * E.out(seg(s, push, push + .3)) - .25 * E.in(seg(s, eject - .1, eject + .2));
    const gap = 120 - squeeze * 200;
    const cx = 960 + ox + (s > eject ? (s - eject) * 3000 : 0), cy = 1000 - (s > eject ? Math.sin(Math.PI * clamp((s - eject) / .5)) * 260 : 0);
    const lx = 960 + ox;
    commuter(g, lx - 150 - gap, 1290, s, { s: 1.5, h: 420, w: 110, col: '#8F8C96', tilt: sway + .05, tie: C.navy, seed: 3, face: 'tired' });
    commuter(g, lx + 150 + gap, 1290, s, { s: 1.5, h: 440, w: 110, col: '#A3A0AA', tilt: sway - .05, tie: C.redD, seed: 5, face: 'tired', phone: true });
    commuter(g, 230 + ox, 1300, s, { s: 1.5, h: 400, w: 110, col: '#9B98A3', tilt: sway, seed: 8, face: 'tired' });
    commuter(g, 1700 + ox, 1300, s, { s: 1.5, h: 430, w: 110, col: '#87848F', tilt: sway, seed: 9, face: 'tired', tie: C.teal });
    candle(g, cx, cy, s, {
      s: 1.25, squash: squeeze * 1.2, tilt: sway * 1.4 + (s > eject ? (s - eject) * 6 : 0), wickBend: -sway * 60 - squeeze * 30,
      face: s > push && s < push + .8 ? 'surprise' : s > eject - .3 ? 'surprise' : 'worry', armR: 2.9 + Math.sin(s * 9) * .1, bendR: 0, armL: .2, lookY: -6, look: 4, sweat: s > push ? 1 : 0, flame: .75, glow: .2,
    });
    if (s < eject) sfx(g, '挤!', cx + 250, 560, 90, C.red, s, push, .12, 1);
    if (s > bar(13) && s < bar(15)) text(g, '够…不…着…', cx + 10, 600, 44, { k: 'cute', col: C.navy, stroke: C.white, lw: 8, alpha: win(s, bar(13), bar(15), .3, .3), rot: -.08 });
    if (s > stopT - .1 && s < push + .5) text(g, '◀ ▶  开门', 960, 196, 26, { k: 'sans', col: C.redD, alpha: bphase(s * 2) < .5 ? 1 : .3 });
    caption(g, s, bar(12) + .3, bar(16) - .2, '08:12', '早高峰，挤不上第一班');
  },
};

/* ================= 4 工位 ================= */
function deskScene(g, s, o) {
  // 墙
  g.fillStyle = o.wall || '#C9DCE8'; g.fillRect(0, 0, W, H);
  dots(g, .05);
  if (o.window) o.window(g);
  // 钟
  const tick = Math.floor(beatIdx(s));
  clock(g, 1700, 170, 90, 10, 30 + (o.clockFast ? s * 40 : tick * .5), C.red);
  // 桌子
  g.fillStyle = '#B58459'; g.fillRect(0, 760, W, 320); line(g, 0, 760, W, 760, INK, 6);
  g.fillStyle = '#9A6C45'; g.fillRect(0, 790, W, 16);
  // 显示器
  rr(g, 620, 180, 680, 450, 24); fs(g, '#3A3F4A', INK, 6);
  rr(g, 650, 210, 620, 390, 10); fs(g, o.screenCol || '#EAF3F7');
  if (o.screen) { g.save(); rr(g, 650, 210, 620, 390, 10); g.clip(); o.screen(g, 650, 210, 620, 390); g.restore(); }
  rr(g, 920, 630, 80, 90, 6); fs(g, '#3A3F4A', INK, 5); rr(g, 840, 710, 240, 40, 12); fs(g, '#3A3F4A', INK, 5);
  // 键盘
  rr(g, 680, 840, 480, 70, 14); fs(g, '#E7E2D8', INK, 5);
  for (let i = 0; i < 12; i++) for (let j = 0; j < 2; j++) { const hit = o.typing && hash(Math.floor(s * 12), i, j) < .15; rr(g, 700 + i * 38, 852 + j * 26 + (hit ? 3 : 0), 30, 20, 4); fs(g, hit ? C.mustard : C.white, INK, 2); }
  // 咖啡
  rr(g, 1400, 800, 110, 120, [8, 8, 30, 30]); fs(g, C.white, INK, 5);
  g.beginPath(); g.arc(1515, 855, 28, -Math.PI / 2, Math.PI / 2); g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
  text(g, 'DDL', 1455, 862, 30, { k: 'en', col: C.red });
}
const S_OFFICE = {
  draw(g, s) {
    const L = s - bar(20);
    const nb = Math.max(0, Math.floor(beatIdx(s) - beatIdx(bar(20))) + 1);
    deskScene(g, s, {
      typing: true,
      screen: (g, x, y, w, h) => {
        g.fillStyle = '#F4F7FA'; g.fillRect(x, y, w, h);
        g.fillStyle = '#D9E3EA'; g.fillRect(x, y, w, 40);
        [C.red, C.mustard, C.grass].forEach((c, i) => { circ(g, x + 24 + i * 26, y + 20, 8); fs(g, c); });
        text(g, '周报_最终版_改8.doc', x + w / 2, y + 20, 18, { k: 'sans', col: C.greyD });
        text(g, '加载中…', x + w / 2, y + 150, 46, { k: 'sans', col: INK });
        rr(g, x + 80, y + 220, w - 160, 44, 22); fs(g, '#DDE5EA', INK, 4);
        rr(g, x + 80, y + 220, (w - 160) * .23, 44, 22); fs(g, C.red);
        text(g, '23%', x + w / 2, y + 310, 44, { k: 'en', col: C.red });
        g.save(); g.translate(x + w - 110, y + 150); g.rotate(s * 6);
        for (let i = 0; i < 8; i++) { g.rotate(TAU / 8); withAlpha(g, (i + 1) / 8, () => { circ(g, 0, -26, 6); fs(g, INK); }); }
        g.restore();
      },
    });
    // 纸堆：每拍长一张
    [[200, 1], [1640, -1]].forEach(([x, d], k) => {
      const n = Math.min(40, 6 + nb * (k ? 1 : 1));
      for (let i = 0; i < n; i++) { const jit = (hash(i, k) - .5) * 24; rr(g, x - 120 + jit, 760 - 12 - i * 13, 240, 12, 2); fs(g, i % 5 ? C.white : '#F3E9C7', INK, 2.5); }
    });
    // 便利贴
    const notes = [['周报', 560, 260, C.yel], ['开会', 1360, 260, C.pink], ['改第8版', 540, 470, C.tealL], ['DDL!!', 1380, 470, C.mustard], ['报销', 980, 140, C.pinkL]];
    notes.forEach(([t, x, y, c], i) => {
      const t0 = bar(20) + (1 + i * 2.5) * BEAT;
      if (s < t0) return;
      const u = E.back(clamp((s - t0) / .3));
      g.save(); g.translate(x, y); g.rotate((hash(i, 4) - .5) * .3); g.scale(u, u);
      g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(-70 + 6, -60 + 8, 140, 120);
      g.fillStyle = c; g.fillRect(-70, -60, 140, 120);
      text(g, t, 0, 4, 36, { k: 'cute', col: INK }); g.restore();
    });
    // 小烛打字（坐在桌前，只露上半身）
    candle(g, 560, 905, s, { s: 1.3, face: 'tired', sweat: .8, flame: .7, glow: .2, armL: .6 + Math.sin(s * 40) * .2, armR: 1.35 + Math.cos(s * 43) * .25, bendR: .5, look: 10, lookY: -8 });
    caption(g, s, bar(20) + .2, bar(24) - .1, '10:30', '周报改到第 8 版');
  },
};

/* ================= 5 刷手机 ================= */
const POSTS = [
  { who: 'cake', name: '小糕', msg: '买房啦！', pic: 'house', likes: 233 },
  { who: 'cup', name: '小杯', msg: '升职加薪～', pic: 'chart', likes: 520 },
  { who: 'donut', name: '小圈', msg: '冰岛看极光', pic: 'aurora', likes: 999 },
  { who: 'cake', name: '小糕', msg: '订婚了', pic: 'ring', likes: 1314 },
  { who: 'cup', name: '小杯', msg: '全马完赛', pic: 'medal', likes: 666 },
  { who: 'donut', name: '小圈', msg: '自己的小店开业', pic: 'shop', likes: 888 },
  { who: 'cake', name: '小糕', msg: '提车', pic: 'car', likes: 321 },
];
function postPic(g, kind, x, y, w, h, s) {
  const bgc = { house: '#BDE3F0', chart: '#F7E3B5', aurora: '#1E2A4A', ring: '#F9D9D3', medal: '#D8F0E3', shop: '#FCE3B0', car: '#CFEAF3' }[kind];
  g.fillStyle = bgc; g.fillRect(x, y, w, h);
  const cx = x + w / 2, cy = y + h / 2;
  if (kind === 'house') { poly(g, [[cx - 90, cy], [cx, cy - 80], [cx + 90, cy]]); fs(g, C.red, INK, 4); rr(g, cx - 70, cy, 140, 90, 4); fs(g, C.cream, INK, 4); rr(g, cx - 20, cy + 30, 40, 60, 4); fs(g, C.brown, INK, 3); }
  if (kind === 'chart') { [40, 70, 100, 150].forEach((hh, i) => { rr(g, cx - 110 + i * 60, cy + 80 - hh, 40, hh, 4); fs(g, i === 3 ? C.red : C.teal, INK, 3); }); line(g, cx - 120, cy + 10, cx + 110, cy - 90, C.red, 6); }
  if (kind === 'aurora') { starfield(g, s, 30, 5, y + h); for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x, cy + i * 20); g.bezierCurveTo(x + w * .3, cy - 80 + i * 20, x + w * .6, cy + 40 + i * 20, x + w, cy - 60 + i * 20); g.strokeStyle = `rgba(110,240,180,${.6 - i * .15})`; g.lineWidth = 24; g.stroke(); } }
  if (kind === 'ring') { circ(g, cx, cy + 20, 50); g.strokeStyle = C.mustard; g.lineWidth = 14; g.stroke(); poly(g, [[cx - 24, cy - 34], [cx + 24, cy - 34], [cx + 34, cy - 54], [cx, cy - 74], [cx - 34, cy - 54]]); fs(g, '#BDEBFF', INK, 3); }
  if (kind === 'medal') { poly(g, [[cx - 40, cy - 90], [cx - 10, cy - 90], [cx + 10, cy - 20], [cx - 20, cy - 20]]); fs(g, C.red); poly(g, [[cx + 40, cy - 90], [cx + 10, cy - 90], [cx - 10, cy - 20], [cx + 20, cy - 20]]); fs(g, C.teal); circ(g, cx, cy + 20, 50); fs(g, C.mustard, INK, 4); text(g, '42', cx, cy + 22, 40, { k: 'en', col: INK }); }
  if (kind === 'shop') { rr(g, cx - 110, cy - 40, 220, 120, 4); fs(g, C.cream, INK, 4); for (let i = 0; i < 6; i++) { poly(g, [[cx - 120 + i * 40, cy - 60], [cx - 80 + i * 40, cy - 60], [cx - 80 + i * 40, cy - 30], [cx - 120 + i * 40, cy - 30]]); fs(g, i % 2 ? C.white : C.red, INK, 2); } text(g, 'OPEN', cx, cy + 30, 34, { k: 'en', col: C.red }); }
  if (kind === 'car') { rr(g, cx - 120, cy - 10, 240, 60, 20); fs(g, C.red, INK, 4); rr(g, cx - 70, cy - 60, 140, 60, [20, 20, 0, 0]); fs(g, C.red, INK, 4); rr(g, cx - 55, cy - 50, 50, 36, 4); fs(g, C.skyL); rr(g, cx + 5, cy - 50, 50, 36, 4); fs(g, C.skyL); [-70, 70].forEach(d => { circ(g, cx + d, cy + 52, 24); fs(g, INK); circ(g, cx + d, cy + 52, 10); fs(g, C.grey); }); }
}
function phoneFeed(g, s, x, y, w, h, scroll, t0) {
  rr(g, x - 26 + 14, y - 26 + 18, w + 52, h + 52, 64); fs(g, 'rgba(30,10,40,.3)');
  rr(g, x - 26, y - 26, w + 52, h + 52, 64); fs(g, '#26222E', INK, 6);
  g.save(); rr(g, x, y, w, h, 40); g.clip();
  g.fillStyle = '#F4F1EC'; g.fillRect(x, y, w, h);
  const cardH = 470;
  POSTS.forEach((p, i) => {
    const cy = y + 110 + i * (cardH + 24) - scroll;
    if (cy > y + h || cy + cardH < y) return;
    rr(g, x + 20, cy, w - 40, cardH, 22); fs(g, C.white, '#DDD5CC', 3);
    g.save(); circ(g, x + 70, cy + 48, 30); fs(g, C.pinkL); circ(g, x + 70, cy + 48, 30); g.clip(); friend(g, p.who, x + 70, cy + 92, s, { s: .32, shadow: false, face: 'happy' }); g.restore();
    text(g, p.name, x + 120, cy + 36, 26, { k: 'sans', col: INK, align: 'left' });
    text(g, '刚刚', x + 120, cy + 66, 18, { k: 'sans', col: C.grey, align: 'left' });
    text(g, p.msg, x + 46, cy + 116, 34, { k: 'sans', col: INK, align: 'left' });
    g.save(); rr(g, x + 40, cy + 150, w - 80, 240, 14); g.clip(); postPic(g, p.pic, x + 40, cy + 150, w - 80, 240, s); g.restore();
    const lk = Math.floor(p.likes * E.out(clamp((s - t0 - (i - 1) * BAR) / 1.6)));
    heart(g, x + 60, cy + 428, 30, C.red); text(g, String(lk), x + 90, cy + 428, 26, { k: 'en', col: INK, align: 'left' });
  });
  // 顶栏
  g.fillStyle = 'rgba(244,241,236,.95)'; g.fillRect(x, y, w, 80);
  text(g, '朋友圈', x + w / 2, y + 48, 30, { k: 'sans', col: INK });
  g.restore();
  rr(g, x + w / 2 - 70, y - 10, 140, 26, 13); fs(g, '#26222E');
}
const S_FEED = {
  draw(g, s) {
    const t0 = bar(24);
    g.fillStyle = vgrad(g, 0, H, [[0, '#C7B4E3'], [1, '#F3BCB8']]); g.fillRect(0, 0, W, H);
    dots(g, .07);
    // 每小节往上翻一条（弹簧）
    const bi = (s - t0) / BAR, k = Math.floor(bi), f = bi - k;
    const scroll = (Math.max(0, k) + (k >= 0 ? E.back(clamp(f / .35)) : 0)) * 494;
    phoneFeed(g, s, 700, 60, 520, 960, scroll, t0);
    // 飘起来的爱心
    for (let i = 0; i < 14; i++) {
      const kk = Math.floor(beatIdx(s)) - i, tt = BEAT0 + kk * BEAT, u = (s - tt) / 2;
      if (u < 0 || u > 1 || tt < t0) continue;
      heart(g, 1260 + hash(kk, 3) * 260, 900 - u * 700, 30 + hash(kk, 4) * 20, `rgba(215,38,61,${1 - u})`);
    }
    // 小烛：越刷越小，火苗越来越暗
    const p = clamp((s - t0) / (bar(30) - t0));
    candle(g, 430, 980, s, { s: lerp(1.25, .7, E.io(p)), face: p < .25 ? 'smile' : p < .6 ? 'worry' : 'sad', flame: lerp(1, .45, p), glow: .2, armR: 1.4, bendR: -1.2, look: 8, lookY: -6,
      prop: (g, hl, hr) => { g.save(); g.translate(hr[0] + 4, hr[1] - 20); rr(g, -14, -24, 28, 46, 5); fs(g, '#26222E'); g.fillStyle = '#F4F1EC'; g.fillRect(-10, -19, 20, 36); g.restore(); } });
    if (p > .55) text(g, '唉', 300, 640, 56, { k: 'cute', col: C.navy, alpha: win(s, bar(28), bar(30), .3, .3), rot: -.1 });
    caption(g, s, t0 + .2, bar(27), '12:47', '午休，刷一下手机');
  },
};

/* ================= 6 日历（时间在跑） ================= */
const S_CALENDAR = {
  draw(g, s) {
    const t0 = bar(30);
    g.fillStyle = '#9E2335'; g.fillRect(0, 0, W, H);
    dots(g, .12);
    // 跑步机
    const run = s * 3.2;
    rr(g, 180, 860, 760, 60, 30); fs(g, '#3A3F4A', INK, 5);
    for (let i = 0; i < 16; i++) { const x = 200 + ((i * 52 - s * 600) % 832 + 832) % 832; if (x < 920) line(g, x, 868, x, 912, '#5A6070', 4); }
    line(g, 880, 860, 1000, 560, INK, 12); rr(g, 960, 520, 120, 50, 12); fs(g, '#3A3F4A', INK, 5);
    text(g, '∞ km', 1020, 545, 22, { k: 'en', col: C.mustard });
    // 小烛在跑
    candle(g, 560, 860 - Math.abs(Math.sin(run * Math.PI)) * 18, s, { s: 1.15, walk: run, face: 'worry', sweat: 1, flame: .6, wickBend: -14, glow: .25,
      armL: Math.sin(run * TAU) * .9 + .3, armR: -Math.sin(run * TAU) * .9 + .3, bendL: -1, bendR: -1, tilt: .08 });
    for (let i = 0; i < 4; i++) line(g, 380 - i * 10, 640 + i * 50, 300 - i * 10, 640 + i * 50, 'rgba(255,240,220,.5)', 6);
    // 撕日历：每两拍一页
    const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const icons = ['❄', '✿', '✿', '✿', '☀', '☀', '☀', '❀', '❀', '❀', '❄', '❄'];
    const cx = 1350, cy = 180;
    const ti = Math.max(0, Math.floor((s - t0) / (2 * BEAT)));
    const pageAt = i => {
      const m = i % 12;
      rr(g, cx - 210, cy, 420, 460, 12); fs(g, C.white, INK, 5);
      rr(g, cx - 210, cy, 420, 90, [12, 12, 0, 0]); fs(g, i % 2 ? C.teal : C.mustard, INK, 5);
      text(g, months[m], cx, cy + 48, 48, { k: 'brush', col: C.white });
      text(g, '23', cx, cy + 270, 190, { k: 'en', col: INK });
      text(g, '交房租', cx, cy + 410, 30, { k: 'sans', col: C.red });
    };
    // 下面一页
    pageAt(ti + 1);
    // 正在飞走的几页
    for (let j = 0; j < 4; j++) {
      const i = ti - j; if (i < 0) continue;
      const tt = t0 + (i + 1) * 2 * BEAT, u = (s - tt + 2 * BEAT) / (2 * BEAT);
      if (j === 0 && s < tt - 2 * BEAT) continue;
      const fly = clamp((s - (t0 + i * 2 * BEAT) - BEAT * 1.4) / 1.4);
      if (fly >= 1) continue;
      g.save();
      g.translate(cx + fly * 900, cy + 230 - Math.sin(fly * Math.PI) * 260 + fly * 400);
      g.rotate(fly * 3 * (i % 2 ? 1 : -1)); g.scale(1 - fly * .5, 1 - fly * .5); g.translate(-cx, -cy - 230);
      pageAt(i); g.restore();
    }
    // 订书钉
    rr(g, cx - 210, cy - 20, 420, 40, 10); fs(g, INK);
    // 天数计数
    const days = 8401 + Math.floor((s - t0) / BEAT) * 3;
    text(g, `第 ${days.toLocaleString()} 天`, 1350, 760, 64, { k: 'sans', col: C.cream });
    // 账单飞进来
    [['房租', 0], ['花呗', 1], ['水电', 2], ['信用卡', 3]].forEach(([nm, i]) => {
      const tt = bar(32) + i * BAR, u = clamp((s - tt) / .6);
      if (s < tt) return;
      const x = lerp(-200, 220 + i * 150, E.out(u)), y = 160 + i * 90;
      g.save(); g.translate(x, y); g.rotate(-.15 + i * .08);
      rr(g, -110, -60, 220, 120, 8); fs(g, C.cream, INK, 4);
      poly(g, [[-110, -60], [0, 10], [110, -60]]); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
      g.save(); g.translate(30, 20); g.rotate(-.2); rr(g, -60, -24, 120, 48, 6); g.strokeStyle = C.red; g.lineWidth = 5; g.stroke(); text(g, nm, 0, 2, 30, { k: 'sans', col: C.red }); g.restore();
      g.restore();
    });
    caption(g, s, t0 + .2, bar(33), '18:30', '一眨眼，又一个月');
  },
};

/* ================= 7 天台（夜） ================= */
function rooftop(g, s, o = {}) {
  const party = o.party || 0;
  g.fillStyle = vgrad(g, 0, H, [[0, mixc('#1B2149', '#24164A', party)], [.6, mixc('#3B3F7A', '#7A3F7E', party)], [1, mixc('#6A5C93', '#E07A8C', party)]]); g.fillRect(0, 0, W, H);
  starfield(g, s, 120, 21, 620);
  dots(g, .05, true);
  // 月亮
  const mx = 1620, my = 200;
  g.fillStyle = rgrad(g, mx, my, 60, 260, [[0, 'rgba(255,240,190,.35)'], [1, 'rgba(255,240,190,0)']]); g.fillRect(mx - 300, my - 300, 600, 600);
  circ(g, mx, my, 120); fs(g, '#FFE9A8');
  circ(g, mx - 40, my - 30, 18); fs(g, 'rgba(220,190,120,.5)'); circ(g, mx + 46, my + 40, 12); fs(g, 'rgba(220,190,120,.5)'); circ(g, mx + 30, my - 60, 10); fs(g, 'rgba(220,190,120,.5)');
  g.save(); g.translate(mx - 10, my + 20); face(g, { face: party ? 'happy' : 'sleep', blush: 1, mouth: party ? sing(o.s ?? s) * .5 : 0 }, s); g.restore();
  if (o.moonHat) { g.save(); g.translate(mx + 50, my - 105); g.rotate(.4); poly(g, [[-40, 0], [40, 0], [0, -100]]); fs(g, C.teal, INK, 4); circ(g, 0, -104, 12); fs(g, C.pink, INK, 3); g.restore(); }
  // 远处的楼
  skyline(g, s, 4, 700, 160, 380, mixc('#2A2F5E', '#3A2A66', party), '#FFD98A', (b, i, j) => party ? hash(b, i * 7 + j, Math.floor(beatIdx(s) / 2)) < .75 : hash(b, i * 7 + j, Math.floor(s / 3)) < .3);
  skyline(g, s, 9, 780, 80, 220, mixc('#1D2148', '#2A1E52', party), '#FFC86A', (b, i, j) => party ? hash(b, i, j + Math.floor(beatIdx(s))) < .7 : hash(b, i * 5 + j, 2) < .22);
  // 天台
  g.fillStyle = '#3A3550'; g.fillRect(0, 820, W, 260);
  g.fillStyle = '#5A5470'; g.fillRect(0, 800, W, 40); line(g, 0, 800, W, 800, INK, 5);
  dots(g, .08, false, 0, 840, W, 240);
  // 水塔
  const tx = 300;
  [[-70, 0], [70, 0]].forEach(([d]) => line(g, tx + d, 800, tx + d * .7, 560, INK, 8));
  line(g, tx - 66, 700, tx + 66, 640, INK, 5); line(g, tx + 66, 700, tx - 66, 640, INK, 5);
  rr(g, tx - 100, 400, 200, 170, 10); fs(g, '#8A5A3C', INK, 5);
  for (let i = 0; i < 4; i++) line(g, tx - 100, 430 + i * 38, tx + 100, 430 + i * 38, 'rgba(0,0,0,.25)', 3);
  poly(g, [[tx - 115, 400], [tx + 115, 400], [tx, 330]]); fs(g, '#6B3F2A', INK, 5);
}
const S_ROOF = {
  draw(g, s) {
    const t0 = bar(36);
    rooftop(g, s);
    // 流星
    const st = bar(40);
    if (s > st && s < st + 1.2) { const u = (s - st) / 1.2; const x = lerp(400, 1200, u), y = lerp(80, 360, u); g.save(); g.globalAlpha = Math.sin(u * Math.PI); line(g, x, y, x - 220, y - 80, 'rgba(255,240,200,.6)', 5); sparkle(g, x, y, 18, '#FFF3C8'); g.restore(); }
    // 猫沿着墙沿走过
    const catX = lerp(1900, 1200, seg(s, bar(41), bar(44)));
    const cw = s * 6;
    g.save(); g.translate(catX, 800); g.fillStyle = '#16142A';
    ell(g, 0, -34, 46, 22); g.fill(); circ(g, -44, -54, 20); g.fill();
    poly(g, [[-58, -66], [-52, -86], [-40, -70]]); g.fill(); poly(g, [[-38, -70], [-30, -88], [-24, -68]]); g.fill();
    for (let i = 0; i < 4; i++) line(g, -26 + i * 18, -20, -26 + i * 18 + Math.sin(cw + i * 2) * 8, 0, '#16142A', 7);
    g.beginPath(); g.moveTo(42, -40); g.quadraticCurveTo(80, -60, 70, -100); g.strokeStyle = '#16142A'; g.lineWidth = 8; g.stroke();
    circ(g, -50, -56, 3.5); fs(g, '#FFE27A'); g.restore();
    // 小烛坐在墙沿上
    const look = s > st && s < st + 2.4;
    candle(g, 960, 812, s, { s: 1.2, sit: true, kick: s * 2, face: look ? 'surprise' : 'sad', look: look ? -10 : 4, lookY: look ? -8 : 2, flame: .55, glow: 1, armL: .5, armR: .5, bendL: -.8, bendR: -.8 });
    // 想法泡泡：飘过几张朋友圈里的图
    if (s > bar(38) && s < bar(44)) {
      const a = win(s, bar(38), bar(44) - .2, .5, .5);
      withAlpha(g, a, () => {
        circ(g, 1080, 580, 14); fs(g, C.white); circ(g, 1120, 520, 22); fs(g, C.white);
        ell(g, 1300, 400, 190, 120); fs(g, C.white, INK, 4);
        const kinds = ['house', 'ring', 'car', 'aurora'], kk = Math.floor((s - bar(38)) / (2 * BAR * .75)) % 4;
        g.save(); ell(g, 1300, 400, 170, 100); g.clip(); postPic(g, kinds[kk], 1130, 300, 340, 200, s); g.restore();
        text(g, '?', 1470, 300, 60, { k: 'cute', col: C.red });
      });
    }
    if (s > st + 2.4 && s < st + 4) text(g, '……', 1010, 560, 40, { k: 'sans', col: C.cream, alpha: win(s, st + 2.4, st + 4) });
    caption(g, s, t0 + .2, bar(39), '23:23', '一个人在天台吹风');
  },
};

/* ================= 8 身高尺 / 火苗熄灭 ================= */
const S_MELT = {
  draw(g, s) {
    const t0 = bar(44), dim = seg(s, bar(48), bar(50)), out = bar(50) + .05;
    // 墙和门框
    g.fillStyle = mixc('#E8D7BC', '#141019', E.in(dim) * .95); g.fillRect(0, 0, W, H);
    withAlpha(g, 1 - dim * .9, () => {
      dots(g, .06);
      g.fillStyle = '#C49A6C'; g.fillRect(1100, 0, 70, 900); g.fillRect(1530, 0, 70, 900); line(g, 1100, 0, 1100, 900, INK, 5); line(g, 1170, 0, 1170, 900, INK, 4);
      g.fillStyle = '#9A6C45'; g.fillRect(0, 900, W, 180); line(g, 0, 900, W, 900, INK, 5);
      // 身高刻度和铅笔记号
      for (let i = 0; i <= 18; i++) { const y = 880 - i * 44; line(g, 1170, y, 1170 + (i % 5 ? 20 : 40), y, INK, 3); }
      [['6岁', 760], ['12岁', 620], ['18岁', 470], ['20岁', 430], ['22岁', 400]].forEach(([t, y], i) => {
        const tt = t0 + i * BEAT * 2; if (s < tt) return;
        line(g, 1180, y, 1290, y, C.red, 5); text(g, t, 1360, y, 34, { k: 'cute', col: C.redD, alpha: clamp((s - tt) / .2) });
      });
      const t23 = bar(46);
      if (s > t23) { line(g, 1180, 388, 1290, 388, C.navy, 6); text(g, '23岁', 1360, 380, 40, { k: 'cute', col: C.navy, sc: E.back(clamp((s - t23) / .3)) }); }
      // 墙上的钟：滴答
      clock(g, 520, 260, 110, 11, 55 + beatIdx(s) * .02, C.teal);
      for (let k = Math.ceil(beatIdx(t0)); k < beatIdx(bar(48)); k += 2) sfx(g, k % 4 ? '答' : '滴', 520 + (k % 4 ? 170 : -170), 150, 46, C.mustard, s, BEAT0 + k * BEAT, k % 4 ? .15 : -.15, .5);
    });
    // 蜡油一滴滴往下掉，脚下积了一小滩
    const melt = E.io(seg(s, t0, bar(50)));
    const fl = s > out ? 0 : lerp(.9, .3, E.in(seg(s, bar(46), bar(49)))) * (1 - E.in(seg(s, bar(49), out)) * .85) + noise1(s * 9) * .05 * dim;
    const cx = 900, cy = 900;
    ell(g, cx, cy + 4, 70 + melt * 60, 12 + melt * 6); fs(g, '#FFF6E6', 'rgba(51,38,42,.4)', 2);
    candle(g, cx, cy, s, { s: 1.6, short: melt * .18, melt, face: s > bar(49) ? 'sad' : s > bar(46) + 1 ? 'worry' : 'tired', flame: Math.max(0, fl), glow: .4 + dim * 1.4, look: s < bar(46) + 1 ? 10 : 0, lookY: s > bar(47) ? 8 : -6, armL: .2, armR: .2 });
    // 掉下的蜡滴
    for (let k = 0; k < 6; k++) { const tt = t0 + 1 + k * BAR * .9, u = (s - tt) / .7; if (u < 0 || u > 1) continue; ell(g, cx + 40, cy - 200 * 1.6 * .5 + u * 300, 7, 10); fs(g, '#FFF6E6', INK, 2); }
    // 熄灭后：一缕烟
    if (s > out) {
      const u = (s - out) / 1.6;
      g.save(); g.globalAlpha = clamp(1 - u) * .8;
      g.beginPath(); const top = cy - 38 * 1.6 - 138 * 1.6 * (1 - melt * .18) - 30;
      g.moveTo(cx, top);
      for (let i = 1; i <= 20; i++) { const yy = top - i * 14 * (1 + u); g.lineTo(cx + Math.sin(i * .6 + s * 3) * (6 + i * 2.2), yy); }
      g.strokeStyle = 'rgba(200,200,210,.8)'; g.lineWidth = 6; g.lineCap = 'round'; g.stroke(); g.restore();
    }
    // 全黑罩上去：只剩火苗的光
    if (dim > 0) {
      g.save();
      const fx = cx, fy = cy - 330;
      const r = s > out ? 40 : 200 + fl * 300;
      g.fillStyle = rgrad(g, fx, fy, r * .3, r * 2.4, [[0, 'rgba(10,8,14,0)'], [1, `rgba(10,8,14,${dim})`]]);
      g.fillRect(0, 0, W, H);
      if (s > out) { g.fillStyle = `rgba(10,8,14,${clamp((s - out) / .3) * .9})`; g.fillRect(0, 0, W, H); }
      g.restore();
    }
    caption(g, s, t0 + .2, bar(47), '23:59', '量一量，好像也没长高');
  },
};
