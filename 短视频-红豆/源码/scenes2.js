'use strict';
/* scenes2.js —— 第一遍副歌（"有时候 有时候" ~ "也许你会陪我看细水长流"，47.5 ~ 82.9 秒）：
   沙漏里流的是红豆；窗外从冬天到春天，做完的心愿一张张摊在窗台上打了钩；雪人化了，红豆眼睛掉下来；
   站台上分别，车门关上，小指上的红线从门缝里穿过去；火车开走，线越拉越长；夜里他一个人，把线绕在手指上攥紧，
   线跨过一片屋顶，一直连到夜车上的她；早晨她回来，扑进他怀里；两个人沿着溪往日出走。 */

function nightMoonOutside(g, x, y, w, h, s) {
  g.fillStyle = vgrad(g, y, y + h, [[0, '#0B1230'], [1, '#2E3462']]); g.fillRect(x, y, w, h);
  stars(g, s, 0, 0, .6, .6);
  moon(g, x + w * .68, y + h * .3, 44, { halo: '#9FB2FF', haloA: .4 });
  const rs = R(8); g.fillStyle = '#141A38';
  for (let i = 0; i < 7; i++) { const bx = x + i * w / 6 - 30, bh = 60 + rs() * 90; g.fillRect(bx, y + h - bh, 80 + rs() * 40, bh); }
}
const HUG = { tb: 6, hd: -4, aN1: 78, aN2: 55, aF1: 84, aF2: 50, lN1: 4, lN2: 0, lF1: -6, lF2: 0 };

SCENES_DEF.push(() => {
  // C1a：沙漏的特写，里面流下来的是红豆；窗外的光一明一暗地扫过（时间在走）
  scene('C1a', CUT(8), (g, s, k) => {
    const day = .5 + .5 * Math.sin(s * 2.6);
    g.fillStyle = vgrad(g, 0, H, [[0, mixc('#2E3352', '#E2D3C0', day)], [1, mixc('#1E2238', '#C9B49C', day)]]); g.fillRect(0, 0, W, H);
    // 窗台
    g.fillStyle = mixc('#4A4258', '#E9E1D3', day); g.fillRect(0, 760, W, 40); g.fillStyle = mixc('#3A3448', '#D8CCBA', day); g.fillRect(0, 800, W, 300);
    // 斜着扫过去的光
    const sweep = ((s * .9) % 1);
    g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = `rgba(255,220,160,${.35 * day})`;
    poly(g, [[sweep * 2600 - 700, 0], [sweep * 2600 - 300, 0], [sweep * 2600 - 900, H], [sweep * 2600 - 1300, H]]); g.fill(); g.restore();
    jar(g, 1450, 772, 1.1, { fill: .3, slips: 3, seed: 7 });
    hourglass(g, 860, 600, 1.45, lerp(.15, .55, k / 2.1), s);
    bokeh(g, s, 91, 10, ['#FFE0B0', '#FFFFFF'], { r0: 40, r1: 90, a: .18 * day });
  }, { tr: { type: 'flash', dur: .4 }, bloom: .3 });

  // C1b：窗台上的罐子，窗外从下雪到开花（日夜飞快地换）；做完的心愿一张张摊开、打钩
  scene('C1b', Lc(8, 3) - .3, (g, s, k) => {
    const yr = clamp(k / 1.9);
    const outside = (gg, x, y, w, h) => {
      const day = .5 + .5 * Math.sin(s * 9);
      gg.fillStyle = vgrad(gg, y, y + h, [[0, mixc(mixc('#0E1534', '#7AB0DC', day), '#9CC8E8', yr * day)], [1, mixc('#2E3462', '#E8F0F2', day)]]); gg.fillRect(x, y, w, h);
      if (yr < .5) bloomSnow(gg, s, 15, 30, [x, y - 20, x + w, y + h], { r: 6, vy: 80, bloomK: .5, a: .9 * (1 - yr * 2) });
      // 一根伸进窗口的树枝：先是雪，后是花
      gg.strokeStyle = '#5A4436'; gg.lineWidth = 12; gg.lineCap = 'round'; gg.beginPath(); gg.moveTo(x + w + 20, y + 120); gg.quadraticCurveTo(x + w * .6, y + 160, x + w * .25, y + 110); gg.stroke();
      for (let i = 0; i < 14; i++) { const t = i / 13, bx = lerp(x + w + 10, x + w * .25, t), by = y + 120 + Math.sin(t * 3) * 40 - 10; const bl = clamp(yr * 2.2 - hash(i, 3)); if (bl > 0) bloomFlake(gg, bx, by + (hash(i, 4) - .5) * 30, 14, i, bl, 1, '#FFD4E0'); else { gg.fillStyle = '#F4F7FB'; ell(gg, bx, by - 6, 14, 5); gg.fill(); } }
    };
    camera(g, 520, 560, 1.75, () => {
      room(g, s, { mood: 'morning', outside, lamp: false, shelf: false });
      jar(g, 470, ROOM.winY + ROOM.winH + 14, .62, { fill: .3, slips: 3 - Math.floor(clamp(k / 1.9) * 2.2), seed: 7 });
      // 摊开、打了钩的纸条
      const sl = [['一起看一场雪', 360, .2], ['牵手走过沙丘', 610, .9]];
      sl.forEach(([t, x, at], i) => { const a = seg(k, at, at + .4); if (a > 0) withAlpha(g, a, () => slip(g, x, ROOM.winY + ROOM.winH + 30 - i * 4, 150, t, 1, { rot: -.04 + i * .07, check: seg(k, at + .3, at + .8) })); });
    });
  }, { tr: { type: 'fade', dur: .35 }, bloom: .25 });

  // C1c：春天，路灯下的雪人化了；"有尽头"时两颗红豆眼睛掉进水洼里
  scene('C1c', CUT(9), (g, s, k) => {
    const melt = lerp(.25, 1, E.io(clamp(k / 3.2)));
    camera(g, 660, 880, 2.1, () => {
      snowTown(g, s, { season: 'spring', lamps: [[1180, 1000, 1.5]], hz: 600, lampOn: 0 });
      snowman(g, 620, 1000, 1.25, melt, s, { eyesDrop: seg(s, Lc(9, 7) - .2, Lc(9, 7) + .5) });
      // 水滴
      for (let i = 0; i < 6; i++) { const ph = ((s * 1.2 + i / 6) % 1); g.fillStyle = `rgba(190,215,240,${.7 * (1 - ph)})`; ell(g, 560 + i * 24, 880 + ph * 110, 3, 5); g.fill(); }
      // 冒出来的小芽
      for (let i = 0; i < 5; i++) { const gx = 480 + i * 70, gy = 1004, h = 18 * E.out(seg(k, .5 + i * .3, 1.4 + i * .3)); g.strokeStyle = '#6EA058'; g.lineWidth = 4; g.beginPath(); g.moveTo(gx, gy); g.lineTo(gx, gy - h); g.stroke(); g.fillStyle = '#86B866'; ell(g, gx - 6, gy - h, 7, 4, -.5); g.fill(); ell(g, gx + 6, gy - h, 7, 4, .5); g.fill(); }
    });
  }, { tr: { type: 'blur', dur: .45 }, bloom: .25, grade: 'saturate(1.05)' });

  // C1d：站台上分别——她站在车门里，他在站台上；"都有时候"车门关上，小指上的红线从门缝里穿过去
  scene('C1d', CUT(10), (g, s, k) => {
    camera(g, 960, 610, 1.15, () => {
      station(g, s, { time: 'grey' });
      const door = E.io(seg(s, Lc(10, 4) - .25, Lc(10, 4) + .45));
      const Ps = { who: 'she', u: 38, x: 760, y: 800, f: 1, out: OUTFIT.sheTravel, pose: pose('stand', { aN1: lerp(20, 48, seg(k, .3, 1.2)), aN2: 10 }), light: LT.day, t: s, eyes: door > .5 ? 'down' : 'open', mouth: 'flat' };
      trainCar(g, 200, 1400, { doorX: 560, door, inFn: (gg) => { gg.fillStyle = '#4A4250'; gg.fillRect(600, 300, 400, 600); person(gg, Ps); } });
      platform(g, s, { time: 'grey', signX: 1500, clockX: 1300 });
      suitcase(g, 680, 798, .7, '#C47F5A');
      const Ph = { who: 'he', u: 42, x: 1020, y: 975, f: -1, out: OUTFIT.heTravel, pose: pose('stand', { aN1: lerp(15, 42, seg(k, .5, 1.5)), aN2: 12, hd: 4 }), light: LT.day, t: s, mouth: 'flat' };
      person(g, Ph);
      // 红线：她的手 → （门缝）→ 他的手
      const a = handPos(Ps), b = handPos(Ph), gap = [760, lerp(a[1], b[1], .4)];
      redThread(g, door > .9 ? [a, gap, [lerp(gap[0], b[0], .5), lerp(gap[1], b[1], .5) + 18], b] : [a, [lerp(a[0], b[0], .5), lerp(a[1], b[1], .5) + 30], b], 3, 1, .6);
      // 落叶
      for (const p of floaters(s, 101, 14, [0, 100, W, 1000], { vy: -50, vx: -60, amp: 40 })) { g.fillStyle = '#C8904A'; g.save(); g.translate(p.x, p.y); g.rotate(p.ph + s * 2); ell(g, 0, 0, 9, 4); g.fill(); g.restore(); }
    });
  }, { tr: { type: 'whip', dur: .45 }, bloom: .2, grade: 'saturate(.92) contrast(1.03)' });

  // C1e：火车开走了，他一个人站在站台上，红线越拉越长
  scene('C1e', CUT(11), (g, s, k) => {
    const go = Math.pow(clamp(k / 3.3), 2.2) * 2600;
    camera(g, 960, 610, 1.15, () => {
      station(g, s, { time: 'grey' });
      trainCar(g, 200 + go, 1400, { doorX: 560, door: 1 });
      trainCar(g, 200 + go - 1420, 1400, { doorX: 700, door: 1 });
      platform(g, s, { time: 'grey', signX: 1500, clockX: 1300 });
      const Ph = { who: 'he', u: 42, x: 1020, y: 975, f: 1, out: OUTFIT.heTravel, pose: pose('stand', { aN1: lerp(30, 70, seg(k, 0, 2.5)), aN2: 8, hd: lerp(0, 10, seg(k, 2, 3.5)) }), light: LT.day, t: s, mouth: 'sad', eyes: k > 2.2 ? 'down' : 'open' };
      person(g, Ph);
      const b = handPos(Ph), dx = 760 + go;
      const end = dx < W + 300 ? [dx, 620] : [W + 400, 600];
      redThread(g, [b, [lerp(b[0], end[0], .5), lerp(b[1], end[1], .5) + 20 * (1 - clamp(k / 2))], end], 3, 1, .8);
      for (const p of floaters(s, 102, 24, [0, 100, W, 1000], { vy: -60, vx: -140 - go * .05, amp: 40 })) { g.fillStyle = '#C8904A'; g.save(); g.translate(p.x, p.y); g.rotate(p.ph + s * 3); ell(g, 0, 0, 9, 4); g.fill(); g.restore(); }
    });
  }, { tr: { type: 'fade', dur: .3 }, bloom: .2, grade: 'saturate(.9) contrast(1.03)' });

  // C1f：夜里，他一个人坐在窗边，手里是那张"一起看一场雪"
  scene('C1f', CUT(12), (g, s, k) => {
    camera(g, 800, 640, 1.3 + k * .02, () => {
      room(g, s, { mood: 'night', outside: (gg, x, y, w, h) => nightMoonOutside(gg, x, y, w, h, s), lampOn: .35,
        sill: (gg, x, y, w) => { jar(gg, x + 140, y, .5, { fill: .26, slips: 1, seed: 7 }); hourglass(gg, x + 380, y - 85, .55, .7, s); } });
      g.fillStyle = '#9A7254'; g.fillRect(1000, 914, 140, 14); g.fillRect(1010, 926, 11, 76); g.fillRect(1120, 926, 11, 76); g.fillRect(1128, 740, 13, 188); g.fillRect(1128, 760, 40, 10);
      const Ph = { who: 'he', u: 40, x: 1065, seat: 912, f: -1, out: OUTFIT.heHome, pose: pose('sit', { tb: 10, hd: 18, aN1: 48, aN2: 62, aF1: 44, aF2: 66 }), light: { dir: -1, shade: .3, amb: '#2A3060', ambA: .35, rim: '#C8D4FF', rimA: .7 }, t: s, eyes: 'down', mouth: 'flat' };
      person(g, Ph);
      const hp = handPos(Ph);
      slip(g, hp[0] - 30, hp[1] - 20, 120, '一起看一场雪', 1, { rot: .25 });
      // 月光
      g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = lgrad(g, ROOM.winX, ROOM.winY, 1100, 1000, [[0, 'rgba(170,190,255,.25)'], [1, 'rgba(170,190,255,0)']]);
      poly(g, [[ROOM.winX, ROOM.winY], [ROOM.winX + ROOM.winW, ROOM.winY], [1500, 1080], [700, 1080]]); g.fill(); g.restore();
      roomLight(g, 'night', { lx: 600, ly: 500 });
    });
  }, { tr: { type: 'black', dur: .5 }, bloom: .25, grade: 'saturate(.95)' });

  // C1g：他把红线一圈圈绕在手指上、攥紧；镜头顺着线往右，线跨过一片屋顶，一直伸到远处
  scene('C1g', CUT(13), (g, s, k) => {
    const pan = E.io(clamp((k - 1.2) / 2.7)) * 2400;
    rooftops(g, s, { pan });
    const fx = 420 - pan, fy = 600;
    if (fx > -500) {
      const wind = E.out(seg(k, .1, 1.3));
      // 拳头
      const P = mitt(g, fx, fy, 2.4, -.25, { fist: true, sleeve: OUTFIT.heHome.top, skin: SKIN.he });
      // 绕在手上的几圈红线
      g.strokeStyle = RED; g.lineWidth = 6;
      for (let i = 0; i < Math.round(1 + wind * 4); i++) { g.beginPath(); g.ellipse(fx + 150 + i * 14, fy - 40 + i * 4, 30, 80, -.25, 0, TAU); g.stroke(); }
    }
    // 线：从手里一直往右伸到远方（远处山坡上一列亮着灯的小火车）
    const a = [fx + 210, fy - 30], far = [W - 180 + (2400 - pan) * .9, 520];
    redThread(g, [a, [lerp(a[0], far[0], .3), 560], [lerp(a[0], far[0], .7), 500], far], 4, 1, .8);
    const tx = W - 220 + (2400 - pan) * .9 + k * 20;
    if (tx < W + 200) { for (let i = 0; i < 6; i++) { g.fillStyle = '#1A1F3A'; g.fillRect(tx + i * 46, 505, 42, 24); g.fillStyle = '#FFD290'; g.fillRect(tx + i * 46 + 6, 510, 30, 8); } glow(g, tx + 140, 515, 160, '#FFC070', .4); }
  }, { tr: { type: 'fade', dur: .4 }, bloom: .35 });

  // C1h：夜车上的她，看着窗外飞过去的风景；小指上的红线轻轻一拽，她笑了
  scene('C1h', CUT(14), (g, s, k) => {
    g.fillStyle = '#3A3040'; g.fillRect(0, 0, W, H);
    g.fillStyle = vgrad(g, 0, H, [[0, '#5A4A50'], [1, '#2E2630']]); g.fillRect(0, 0, W, H);
    trainView(g, s, 120, 140, 1000, 640, { speed: 1 });
    g.strokeStyle = '#2A2228'; g.lineWidth = 30; rr(g, 120, 140, 1000, 640, 30); g.stroke();
    // 玻璃上她的倒影
    withAlpha(g, .14, () => bust(g, 760, 430, 120, { who: 'she', out: OUTFIT.sheTravel, eyes: 'open', mouth: 'flat' }));
    const tug = seg(s, Lc(14, 3), Lc(14, 3) + .5), smile = seg(s, Lc(14, 4), Lc(14, 5));
    // 车厢里的暖灯
    glow(g, 1500, 120, 600, '#FFC880', .4);
    bust(g, 1440, 470, 170, { who: 'she', out: OUTFIT.sheTravel, light: { dir: -1, shade: .25, amb: '#3A2A50', ambA: .25, rim: '#BFD0FF', rimA: .6 }, t: s, gaze: [-1, -.2], tilt: .06, mouth: smile > .3 ? 'smile' : 'flat', blush: .3 + smile * .7, eyes: smile > .6 ? 'happy' : 'open' });
    // 她举起的手、小指上的红线，从窗户穿出去
    const hx = 1180, hy = 820 + Math.sin(Math.PI * tug) * -18;
    const M = mitt(g, hx, hy, 1.15, -Math.PI / 2 - .35, { sleeve: OUTFIT.sheTravel.top, skin: SKIN.she, palm: true });
    g.strokeStyle = RED; g.lineWidth = 5; g.beginPath(); g.ellipse(M.pinkyMid[0], M.pinkyMid[1], 9, 16, -.35, 0, TAU); g.stroke();
    redThread(g, [M.pinkyMid, [900, 700 - Math.sin(Math.PI * tug) * 40], [500, 600], [140, 560]], 4, 1, .5 + tug);
  }, { tr: { type: 'slide', dur: .5, dir: 1 }, bloom: .3 });

  // C1i：早晨，她回来了——跳下车，跑过站台，扑进他怀里
  scene('C1i', CUT(15), (g, s, k) => {
    const run = seg(k, .2, 1.5), hug = E.out(seg(k, 1.3, 1.7));
    camera(g, 1000 + hug * 60, 610, 1.15 + hug * .2, () => {
      station(g, s, { time: 'dawn' });
      trainCar(g, -300, 1400, { doorX: 900, door: 0, col: '#EDE6D6' });
      platform(g, s, { time: 'dawn', signX: 1650, clockX: 1350, pillars: [160, 1840] });
      const sx = lerp(620, 1080, E.io(run)), sy = 975 - (run < .15 ? 0 : 0);
      const Ps = { who: 'she', u: 42, x: sx, y: sy, f: 1, out: OUTFIT.sheTravel, pose: hug > 0 ? lerpPose(walkPose(s * 8, .55), HUG, hug) : walkPose(s * 8, .55), light: LT.gold, t: s, eyes: hug > .5 ? 'closed' : 'happy', mouth: 'open', blush: 1, hairFly: (1 - hug) * .6 };
      const Ph = { who: 'he', u: 44, x: 1150, y: 975, f: -1, out: OUTFIT.heTravel, pose: hug > 0 ? lerpPose(pose('stand', { aN1: 50, aN2: 20 }), HUG, hug) : pose('stand', { aN1: lerp(5, 50, seg(k, .6, 1.2)), aN2: 20 }), light: LT.gold, t: s, eyes: hug > .5 ? 'closed' : 'happy', mouth: 'smile', blush: .8 };
      person(g, Ps); person(g, Ph);
      if (hug > .5) for (const p of floaters(s, 111, 12, [900, 500, 1300, 900], { vy: 60, amp: 30 })) { g.fillStyle = `rgba(255,220,200,${.8 * p.tw * hug})`; circ(g, p.x, p.y, 3 + p.sz * 3); g.fill(); }
    });
    glow(g, 1500, 400, 900, '#FFD8A0', .25);
  }, { tr: { type: 'leak', dur: .6 }, bloom: .4, grade: 'saturate(1.06)' });

  // C1j：两个人沿着溪往日出走（"细水长流"），一直到间奏
  scene('C1j', Lc(15, 7) - .3, (g, s, k) => {
    camera(g, 960 - k * 14, 540 - k * 10, 1.04 + k * .035, () => {
      streamLand(g, s, { time: 'sunrise', sunX: 1000, sunY: 560 - k * 26, rock: false });
      birds(g, s, -300 + k * 260, 300 - k * 20, 7, 1);
      const t = .8 - k * .085;
      const [cx, cy, cw] = streamCurve(t);
      const px = cx + cw / 2 + 60, py = cy;
      const Ps = { who: 'she', u: 26 - k * 1.2, x: px, y: py, view: 'back', out: OUTFIT.sheTravel, pose: { aF1: 22, aF2: 0, bob: Math.abs(Math.sin(s * 3.5)) * .06 }, light: LT.gold, t: s };
      const Ph = { who: 'he', u: 27 - k * 1.2, x: px + 64 - k * 3, y: py + 2, view: 'back', out: OUTFIT.heTravel, pose: { aN1: 22, aN2: 0, bob: Math.abs(Math.sin(s * 3.5 + 1.5)) * .06 }, light: LT.gold, t: s };
      person(g, Ps); person(g, Ph);
      const a = handPos(Ps, 'F'), b = handPos(Ph, 'N');
      g.fillStyle = SKIN.she; circ(g, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 6); g.fill();
    });
  }, { tr: { type: 'fade', dur: .8 }, bloom: .45, grade: 'saturate(1.05)' });
});
