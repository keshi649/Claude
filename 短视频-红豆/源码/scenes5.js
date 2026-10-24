'use strict';
/* scenes5.js —— 第三遍副歌（176.4 ~ 210.5 秒）和尾奏（210.5 ~ 232.6 秒），以及封面。
   副歌：老了——黄昏的屋里她织红围巾，他戴着老花镜看书；他站在照片墙前；两个人跟着唱片慢慢跳舞；
   秋风里的红豆树落叶、落豆子；他从罐子里取出最后一张纸条——"陪你看细水长流"；两只老手再拉一次钩；
   拄着拐杖、慢慢走到溪边；坐在当年那块石头上看日落，红豆落进溪里漂走。
   尾奏：溪面上红豆和一只纸船漂远；窗外又下雪了，罐子旁边一张新纸条——"明年还一起看雪"；
   大雪里的小房子和红豆树，镜头升上星空，片尾字。 */

/* 扶手椅（侧面）：x 坐的位置，y 地面，f 朝向 */
function armchair(g, x, y, f, col = '#8E5A4A') {
  g.save(); g.translate(x, y); g.scale(f, 1);
  g.fillStyle = shade(col, .8); rr(g, -110, -300, 70, 300, 24); g.fill();
  g.fillStyle = col; rr(g, -100, -140, 210, 70, 20); g.fill(); rr(g, 70, -200, 50, 130, 18); g.fill();
  g.fillStyle = '#4A3428'; g.fillRect(-90, -70, 14, 70); g.fillRect(90, -70, 14, 70);
  g.restore();
}
/* 唱片机 */
function recordPlayer(g, x, y, s) {
  g.fillStyle = '#7A5440'; g.fillRect(x - 90, y - 50, 180, 50); g.fillStyle = '#5A3E30'; g.fillRect(x - 70, y, 14, 120); g.fillRect(x + 56, y, 14, 120);
  g.fillStyle = '#1E1A1E'; g.beginPath(); g.ellipse(x - 10, y - 54, 70, 16, 0, 0, TAU); g.fill(); g.fillStyle = RED; g.beginPath(); g.ellipse(x - 10, y - 54, 18, 5, 0, 0, TAU); g.fill();
  g.strokeStyle = '#C9B48A'; g.lineWidth = 6; g.beginPath(); g.moveTo(x + 70, y - 60); g.lineTo(x + 30, y - 56); g.stroke();
  // 喇叭
  g.fillStyle = '#C9A04A'; g.beginPath(); g.moveTo(x + 60, y - 60); g.lineTo(x + 30, y - 170); g.quadraticCurveTo(x + 90, y - 250, x + 160, y - 190); g.closePath(); g.fill();
  for (let i = 0; i < 3; i++) { const u = ((s * .5 + i / 3) % 1); text(g, '♪', x + 120 + u * 80, y - 220 - u * 120, 34, { col: `rgba(255,240,220,${Math.sin(Math.PI * u)})` }); }
}
const LT_EVE = { dir: -1, shade: .22, amb: '#6A3A30', ambA: .14, rim: '#FFD39A', rimA: .65 };

SCENES_DEF.push(() => {
  // C3a：黄昏的屋里，她坐在扶手椅里织一条红围巾，他戴着老花镜看书
  scene('C3a', CUT(32), (g, s, k) => {
    camera(g, 1000, 700, 1.45 + k * .02, () => {
      room(g, s, { mood: 'evening', lampX: 1000, outside: (gg, x, y, w, h) => { gg.fillStyle = vgrad(gg, y, y + h, [[0, '#E89A7A'], [1, '#FFD8A8']]); gg.fillRect(x, y, w, h); glow(gg, x + w * .3, y + h * .8, 200, '#FFF0C0', .8); },
        sill: (gg, x, y, w) => jar(gg, x + 400, y, .5, { fill: .32, slips: 9, seed: 17, seed2: 5 }) });
      armchair(g, 780, 1000, 1, '#9A5E4E'); armchair(g, 1260, 1000, -1, '#5E7A6A');
      const knit = Math.sin(s * 6);
      const Ps = { who: 'she', u: 38, x: 790, seat: 870, f: 1, age: 1, out: OUTFIT.sheOld, pose: pose('sit', { tb: 6, hd: 16, aN1: 52 + knit * 4, aN2: 70, aF1: 48 - knit * 4, aF2: 74 }), light: LT_EVE, t: s, eyes: 'down', mouth: 'smile' };
      const Ph = { who: 'he', u: 40, x: 1250, seat: 870, f: -1, age: 1, out: OUTFIT.heOld, pose: pose('sit', { tb: 4, hd: 14, aN1: 58, aN2: 64, aF1: 54, aF2: 68 }), light: { ...LT_EVE, dir: 1 }, t: s, eyes: 'down', mouth: 'smile' };
      person(g, Ps); person(g, Ph);
      // 她手里的红围巾（一截一截长长）、毛线团
      const hp = handPos(Ps); g.fillStyle = RED; rr(g, hp[0] - 10, hp[1] - 6, 46, 30 + k * 10, 6); g.fill(); g.strokeStyle = '#C9B48A'; g.lineWidth = 3; g.beginPath(); g.moveTo(hp[0] - 6, hp[1] - 20); g.lineTo(hp[0] + 30, hp[1] + 4); g.stroke();
      g.fillStyle = RED; circ(g, 880, 990, 22); g.fill(); redThread(g, [[880, 975], [860, 940], [hp[0] + 10, hp[1] + 20]], 2, 1, 0);
      // 他手里的书
      const bp = handPos(Ph); g.fillStyle = '#F2ECE2'; poly(g, [[bp[0] - 50, bp[1] - 30], [bp[0], bp[1] - 20], [bp[0], bp[1] + 20], [bp[0] - 50, bp[1] + 10]]); g.fill(); g.fillStyle = '#5A6E8A'; g.fillRect(bp[0] - 2, bp[1] - 22, 6, 44);
      roomLight(g, 'evening', { lx: 1000, ly: 500 });
    });
  }, { tr: { type: 'fade', dur: .9 }, bloom: .3, grade: 'saturate(1.02) sepia(.06)' });

  // C3b：他站在照片墙前，镜头慢慢扫过一张张照片（前面的日子）
  scene('C3b', CUT(33), (g, s, k) => {
    const pan = E.io(clamp(k / 3.8)) * 900;
    g.fillStyle = '#B48E72'; g.fillRect(0, 0, W, H);
    g.fillStyle = rgba('#FFFFFF', .04); for (let y = 30; y < H; y += 70) for (let x = ((y / 70) % 2) * 50 - pan * .9 % 100; x < W; x += 100) { circ(g, x, y, 4); g.fill(); }
    MEMORIES.forEach(([id, at], i) => {
      const x = 360 + i * 470 - pan, y = 390 + (i % 2) * 60;
      if (x < -300 || x > W + 300) return;
      photoFrame(g, x, y, 380, 214, snap(id, at), { rot: (hash(i, 7) - .5) * .07 });
    });
    glow(g, W * .5, 300, 900, '#FFD8A0', .25);
    // 前景：他的背影（老），慢慢往右挪
    person(g, { who: 'he', u: 58, x: 520 + k * 30, y: 1240, view: 'back', age: 1, out: OUTFIT.heOld, pose: { aN1: 6, aF1: 6 }, light: LT_EVE, t: s });
  }, { tr: { type: 'slide', dur: .5 }, bloom: .3, grade: 'sepia(.1)' });

  // C3c：唱片机转着，两个人在屋里慢慢地跳舞
  scene('C3c', CUT(34), (g, s, k) => {
    camera(g, 860, 700, 1.55, () => {
      room(g, s, { mood: 'evening', lampX: 1100, outside: (gg, x, y, w, h) => { gg.fillStyle = vgrad(gg, y, y + h, [[0, '#6A5A8A'], [1, '#E89A7A']]); gg.fillRect(x, y, w, h); } });
      recordPlayer(g, 560, 900, s);
      const sway = Math.sin((s - CUT(34)) * Math.PI / BEAT / 2) * 10;
      const Ps = { who: 'she', u: 40, x: 960 + sway, y: 1010, f: 1, age: 1, out: OUTFIT.sheOld, pose: Object.assign({}, HUG, { tb: 4, hd: -6 }), light: LT_EVE, t: s, eyes: 'closed', mouth: 'smile', blush: .7 };
      const Ph = { who: 'he', u: 42, x: 1030 + sway, y: 1010, f: -1, age: 1, out: OUTFIT.heOld, pose: Object.assign({}, HUG, { tb: 6, hd: 6 }), light: { ...LT_EVE, dir: 1 }, t: s, eyes: 'closed', mouth: 'smile' };
      person(g, Ps); person(g, Ph);
      for (const p of floaters(s, 151, 30, [600, 300, 1500, 1000], { vy: 10, amp: 30, wob: .3 })) { g.fillStyle = `rgba(255,236,200,${.6 * p.tw})`; circ(g, p.x, p.y, 1.5 + p.sz * 2); g.fill(); }
      roomLight(g, 'evening', { lx: 1000, ly: 600 });
    });
  }, { tr: { type: 'blur', dur: .5 }, bloom: .35, grade: 'sepia(.06)' });

  // C3d：秋风里的红豆树——叶子和红豆一起往下落；屋里亮着灯，窗里是他们两个
  scene('C3d', CUT(35), (g, s, k) => {
    const push = E.io(clamp(k / 3.5));
    camera(g, 1000 + push * 120, 560 - push * 60, 1.05 + push * .25, () => {
      yard(g, s, { season: .62, grow: 1, night: .25, houseLit: 1, pods: true });
      // 窗里的两个剪影
      for (const [wx, who] of [[YARD.houseX - 115, 'she'], [YARD.houseX + 105, 'he']]) person(g, { who, u: 14, x: wx, y: YARD.groundY - 128, view: 'front', age: 1, sil: '#7A4A30', out: OUTFIT[who + 'Old'] });
    });
    // 落叶和落下来的红豆（风从左往右）
    for (const p of floaters(s, 161, 50, [-100, -100, W + 100, H + 100], { vy: -110, vx: 160, amp: 50 })) {
      g.save(); g.translate(p.x, p.y); g.rotate(p.ph + s * 2);
      if (p.i % 3 === 0) bean(g, 0, 0, 9 + p.sz * 5, 0); else { g.fillStyle = ['#C8A048', '#B86A3A', '#D88A4A'][p.i % 3]; ell(g, 0, 0, 12 + p.sz * 8, 5 + p.sz * 3); g.fill(); }
      g.restore();
    }
  }, { tr: { type: 'leak', dur: .6, dir: -1 }, bloom: .3, grade: 'saturate(1.08)' });

  // C3e：他从罐子里取出最后一张纸条，慢慢摊开——"陪你看细水长流"
  scene('C3e', CUT(36), (g, s, k) => {
    g.fillStyle = rgrad(g, 960, 500, 100, 1300, [[0, '#F2D6B4'], [1, '#B8866A']]); g.fillRect(0, 0, W, H);
    bokeh(g, s, 171, 14, ['#FFF0D0', '#FFD0A0'], { r0: 50, r1: 120, a: .3 });
    const open = E.io(seg(s, Lc(36, 2), Lc(36, 5)));
    jar(g, 460, 980, 1.6, { fill: .3, slips: 0, seed: 17 });
    // 纸条：从罐口被拿出来、展开
    const sx = lerp(560, 1060, E.out(seg(k, 0, 1.4))), sy = lerp(640, 520, E.out(seg(k, 0, 1.4)));
    if (open < .05) slipRoll(g, sx, sy, 160, lerp(1.2, .1, seg(k, 0, 1.2)));
    else slip(g, sx, sy, lerp(200, 900, open), '陪你看细水长流', seg(s, Lc(36, 4), Lc(36, 5) + .9), { rot: lerp(.3, -.02, open) });
    // 两只老手捏着纸条的两头（没展开时捏着纸卷）
    const w = open < .05 ? 160 : lerp(200, 900, open);
    mitt(g, sx - w / 2 - 70, sy + 34, 1.15, -.2, { fist: true, sleeve: OUTFIT.heOld.top, skin: '#E2BC9C' });
    mitt(g, sx + w / 2 + 70, sy + 34, 1.15, Math.PI + .2, { fist: true, sleeve: OUTFIT.heOld.top, skin: '#E2BC9C', flip: true });
  }, { tr: { type: 'fade', dur: .4 }, bloom: .3 });

  // C3f：两只老了的手，再拉一次钩——小指上还系着那根红线
  scene('C3f', CUT(37), (g, s, k) => {
    g.fillStyle = vgrad(g, 0, H, [[0, '#E8A07A'], [1, '#F6D3A0']]); g.fillRect(0, 0, W, H);
    bokeh(g, s, 181, 16, ['#FFF0C8', '#FFC890'], { r0: 60, r1: 140, a: .25 });
    for (const p of floaters(s, 182, 40, [0, 0, W, H], { vy: 30, amp: 30 })) { g.fillStyle = `rgba(255,240,220,${.5 * p.tw})`; circ(g, p.x, p.y, 2 + p.sz * 3); g.fill(); }
    const meet = E.io(seg(s, CUT(37), CUT(37) + 1.3)), hook = E.io(seg(s, CUT(37) + 1.1, CUT(37) + 1.8));
    const A = mitt(g, lerp(-80, lerp(600, 700, hook), meet), 470, 2.3, .1, { fist: true, pinky: .3 + hook * .7, sleeve: OUTFIT.sheOld.top, skin: '#EBCBB4' });
    const B = mitt(g, lerp(W + 80, lerp(1330, 1230, hook), meet), 670, 2.35, Math.PI + .1, { fist: true, pinky: .3 + hook * .7, sleeve: OUTFIT.heOld.top, skin: '#E2BC9C' });
    const a = A.pinkyMid, b = B.pinkyMid, m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + lerp(80, 24, hook)];
    redThread(g, [a, m, b], 5, 1, .6 + hook);
    for (const p of [a, b]) { g.strokeStyle = RED; g.lineWidth = 6; g.beginPath(); g.ellipse(p[0], p[1], 10, 22, .2, 0, TAU); g.stroke(); }
    redThread(g, [m, [m[0] + 6 + Math.sin(s * 2) * 6, m[1] + 70], [m[0] + Math.sin(s * 2 + .5) * 12, m[1] + 140]], 4, 1, .5);
    bean(g, m[0] + Math.sin(s * 2 + .5) * 12, m[1] + 156, 14, .3 + Math.sin(s * 2) * .2, { glow: .5 });
    if (hook > 0) glow(g, W / 2, 600, 800 * Math.sin(Math.PI * clamp(hook * 1.1)), '#FFB080', .5);
  }, { tr: { type: 'flash', dur: .5 }, bloom: s => .35 + .2 * Math.exp(-Math.abs(s - CUT(37) - 1.6) * 2), grade: 'saturate(1.05)' });

  // C3g：金色的傍晚，两个人慢慢走——他拄着拐杖，她挽着他，红豆树的叶子落在路上
  scene('C3g', CUT(38), (g, s, k) => {
    streamLand(g, s, { time: 'gold', sunX: 400, sunY: 470, rock: false, tree: false });
    redBeanTree(g, s, 1500, 830, 1, .45, 0, { pods: true });
    const x = 520 + k * 60, y = 930;
    const Ps = { who: 'she', u: 36, x: x - 10, y, f: 1, age: 1, out: OUTFIT.sheOld, pose: walkPose(s * 4, 0, { aF1: 40, aF2: 30 }), light: LT.gold, t: s, eyes: 'happy', mouth: 'smile' };
    const Ph = { who: 'he', u: 38, x: x + 40, y: y + 4, f: 1, age: 1, out: OUTFIT.heOld, pose: walkPose(s * 4 + Math.PI, 0, { aN1: 26, aN2: 10, tb: 10 }), light: LT.gold, t: s, eyes: 'happy', mouth: 'smile' };
    person(g, Ps); person(g, Ph);
    const hp = handPos(Ph); g.strokeStyle = '#5A4234'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(hp[0], hp[1] - 6); g.lineTo(hp[0] + 18, y + 6); g.stroke();
    for (const p of floaters(s, 191, 30, [-100, -100, W + 100, H], { vy: -70, vx: 50, amp: 50 })) { g.save(); g.translate(p.x, p.y); g.rotate(p.ph + s * 2); g.fillStyle = ['#C8A048', '#B86A3A', '#D88A4A'][p.i % 3]; ell(g, 0, 0, 10 + p.sz * 6, 4 + p.sz * 2); g.fill(); g.restore(); }
  }, { tr: { type: 'fade', dur: .5 }, bloom: .4, grade: 'saturate(1.06)' });

  // C3h：还是那块石头，还是那条溪——老了的两个人坐着看日落，红豆从树上落进溪里，顺水漂走
  scene('C3h', CUT(39), (g, s, k) => {
    const pause = seg(s, 207.3, 209.2), up = E.io(seg(s, Lc(39, 9), Lc(39, 10) + 1.2));
    camera(g, 1180 - k * 14, 640 - k * 6 - up * 160, 1.6 - k * .04 - up * .2, () => {
      streamLand(g, s, { time: 'sunset', sunX: 700, sunY: 540 + k * 8, tree: false });
      birds(g, s, 1900 - k * 170, 240 + k * 8, 9, -1, '#4A3A50');
      redBeanTree(g, s, 1640, 760, .9, .45, .1, { pods: true });
      const rx = STREAM.rockX, ry = STREAM.rockY;
      const lean = E.io(seg(s, Lc(39, 3), Lc(39, 6)));
      const Ph = { who: 'he', u: 30, x: rx + 40, seat: ry - 34, view: 'back', age: 1, out: OUTFIT.heOld, pose: { sitF: true, aN1: 14, tilt: lean * .08 }, light: LT.gold, t: s };
      const Ps = { who: 'she', u: 30, x: rx - 30 + lean * 8, seat: ry - 32, view: 'back', age: 1, out: OUTFIT.sheOld, pose: { sitF: true, aF1: 14, lean: lean * 6, tilt: lean * .32 }, light: LT.gold, t: s };
      person(g, Ph); person(g, Ps);
      // 落进溪里、顺水漂走的红豆
      for (let i = 0; i < 8; i++) {
        const ph = ((s * .12 + i / 8) % 1), [x, y, w] = streamCurve(lerp(.62, .98, ph));
        bean(g, x + Math.sin(i * 3) * w * .2, y - 4, 4 + ph * 8, s + i);
      }
    });
    // "细水"后面停了两秒：画面也慢慢暗一点、静下来
    g.fillStyle = `rgba(20,10,30,${Math.sin(Math.PI * pause) * .15})`; g.fillRect(0, 0, W, H);
  }, { tr: { type: 'fade', dur: .6 }, bloom: .45, grade: 'saturate(1.08)' });

  // ---------- 尾奏 ----------
  // O1：溪面的特写——红豆和一只纸船（船上放着一颗红豆）慢慢漂远
  scene('O1', 210.5, (g, s, k) => {
    g.fillStyle = vgrad(g, 0, H, [[0, '#F2B48E'], [.5, '#B08AA8'], [1, '#5E5A8E']]); g.fillRect(0, 0, W, H);
    // 水面的波纹（从上往下流）
    for (let i = 0; i < 40; i++) {
      const y = ((i * 37 + s * 40) % (H + 80)) - 40, x = hash(i, 1) * W;
      g.strokeStyle = `rgba(255,230,210,${.25 + .2 * Math.sin(s + i)})`; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 80, y); g.quadraticCurveTo(x, y - 8, x + 80, y); g.stroke();
    }
    for (let i = 0; i < 60; i++) { const a = Math.max(0, Math.sin(s * 3 + i * 1.7)); g.fillStyle = `rgba(255,250,230,${a * .7})`; g.fillRect(hash(i, 3) * W, ((hash(i, 4) * H + s * 40) % H), 10 + hash(i, 5) * 30, 3); }
    // 红豆
    for (let i = 0; i < 9; i++) { const x = hash(i, 11) * W, y = ((hash(i, 12) * H * 1.3 + s * 55) % (H + 200)) - 100; bean(g, x + Math.sin(s + i) * 20, y, 16, s * .3 + i); g.strokeStyle = 'rgba(255,240,230,.4)'; g.lineWidth = 2; g.beginPath(); g.ellipse(x + Math.sin(s + i) * 20, y + 6, 30, 8, 0, 0, TAU); g.stroke(); }
    // 纸船
    const by = 300 + k * 60, bx = 900 + Math.sin(s * .7) * 60;
    g.strokeStyle = 'rgba(255,240,230,.5)'; g.lineWidth = 3; g.beginPath(); g.ellipse(bx, by + 20, 120, 18, 0, 0, TAU); g.stroke();
    paperBoat(g, bx, by, 1.8, Math.sin(s * 1.3) * .08, true);
    glow(g, bx - 60, by - 30, 80, '#FF6070', .3);
  }, { tr: { type: 'ripple', dur: .8 }, bloom: .45 });

  // O2：窗台上的罐子，窗外又下雪了；罐子旁边一张新写的纸条——"明年还一起看雪"，一只老手把它卷起来放进罐子
  scene('O2', 216.6, (g, s, k) => {
    camera(g, 540, 560, 2.5, () => {
      room(g, s, { mood: 'night', lampX: 1200, outside: (gg, x, y, w, h) => nightSnowOutside(gg, x, y, w, h, s, { bloom: .7 }), frost: .25 });
      const sy = ROOM.winY + ROOM.winH + 14;
      jar(g, 400, sy, .62, { fill: .3, slips: 9, seed: 17, seed2: 5 });
      const pick = seg(k, 2.8, 4.2);
      if (pick < .4) slip(g, 610, sy - 40 - pick * 60, 250, '明年还一起看雪', clamp(k / 1.8), { rot: -.04 });
      else slipRoll(g, lerp(600, 410, (pick - .4) / .6), lerp(sy - 60, sy - 150, Math.sin(Math.PI * (pick - .4) / .6 * .5)), 50, 1.4);
      if (k > 2.4) mitt(g, lerp(820, 520, E.io(seg(k, 2.4, 3.6))) + (pick > .4 ? lerp(0, -190, (pick - .4) / .6) : 0), sy - 10 - pick * 80, .42, Math.PI + .3, { fist: true, sleeve: OUTFIT.sheOld.top, skin: '#EBCBB4', flip: true });
    });
    bloomSnow(g, s, 201, 30, [-40, -60, W + 40, H + 40], { r: 10, vy: 40, a: .5 });
  }, { tr: { type: 'fade', dur: .8 }, bloom: .35 });

  // O3：大雪里的小房子和红豆树，窗户亮着；镜头慢慢升上星空——片尾字
  scene('O3', 222.0, (g, s, k) => {
    const rise = E.io(clamp((k - 2.5) / 7));
    g.save(); g.translate(0, rise * 520);
    yard(g, s, { season: .85, grow: 1, night: .9, houseLit: 1, snow: true });
    g.restore();
    // 往上升以后：上面是星空
    if (rise > 0) { g.save(); g.globalAlpha = rise; g.fillStyle = vgrad(g, 0, 520 * rise, [[0, '#060820'], [1, 'rgba(11,16,48,0)']]); g.fillRect(0, 0, W, 520 * rise + 10); g.restore(); stars(g, s, 0, 0, rise, rise); milkyWay(g, W * .5, 200, 2000, -.25, rise * .6); }
    bloomSnow(g, s, 211, 110, [-40, -60, W + 40, H + 40], { r: 9, vy: 55 });
    bloomSnow(g, s, 212, 20, [-40, -60, W + 40, H + 40], { r: 16, vy: 90, a: .8 });
  }, { tr: { type: 'fade', dur: 1.2 }, bloom: .4 });
});

/* 封面：两只手拉钩，红线、红豆；大字"红豆"放在正中间（抖音主页的格子按中间裁成 3:4，也看得全） */
function drawCoverArt() {
  const g = ctx; g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = vgrad(g, 0, H, [[0, '#F4C9A8'], [1, '#F8E2C4']]); g.fillRect(0, 0, W, H);
  bokeh(g, 3, 181, 18, ['#FFF0C8', '#FFC890', '#FFFFFF'], { r0: 60, r1: 140, a: .3 });
  glow(g, W / 2, 780, 600, '#FFB080', .3);
  const A = mitt(g, 700, 680, 2.0, .1, { fist: true, pinky: 1, sleeve: OUTFIT.sheWinter.top, skin: SKIN.she });
  const B = mitt(g, 1230, 860, 2.05, Math.PI + .1, { fist: true, pinky: 1, sleeve: OUTFIT.heWinter.top, skin: SKIN.he });
  const a = A.pinkyMid, b = B.pinkyMid, m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 24];
  redThread(g, [a, m, b], 5, 1, 1);
  for (const p of [a, b]) { g.strokeStyle = RED; g.lineWidth = 6; g.beginPath(); g.ellipse(p[0], p[1], 10, 22, .2, 0, TAU); g.stroke(); }
  redThread(g, [m, [m[0] + 6, m[1] + 60], [m[0], m[1] + 120]], 4, 1, .5);
  bean(g, m[0], m[1] + 136, 15, .3, { glow: .6 });
  text(g, '红豆', W / 2, 330, 260, { k: 'brush', col: '#B81F33', ls: 30, glow: 'rgba(255,255,255,.95)', gr: 34, ga: .7 });
  text(g, '方大同', W / 2, 520, 50, { k: 'serif', col: '#6B3A34', ls: 20 });
  g.fillStyle = rgba('#B81F33', .6); g.fillRect(W / 2 - 130, 478, 260, 2);
  text(g, '甜菜', 1886, 48, 30, { k: 'serif', align: 'right', col: 'rgba(255,255,255,.8)', shadow: 'rgba(0,0,0,.35)', sblur: 6, ls: 3 });
}
