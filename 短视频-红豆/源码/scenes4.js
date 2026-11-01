'use strict';
/* scenes4.js —— 第二遍副歌（114.3 ~ 150 秒）和间奏（150 ~ 176.4 秒）。
   副歌：公园长椅上一年过去（春天她靠在他身上 → 秋天两个人坐到长椅两头，中间只剩一根红线）；雨夜吵架，她转身走了，红线绷得紧紧的；
   门砰地关上，架子上的罐子被震下来，慢镜头摔碎，红豆和纸条撒了一地；他坐在地上一颗颗捡，捡起"一起看一场雪"；
   她回来了，坐下来握住他的手，红线重新系上；四处风景（海边灯塔、雪山日出、花田、极光）；溪边的石头上看日落。
   间奏：院子里种下红豆，冒出芽；红豆树一年年长大，两个人慢慢变老；墙上的照片一张张多起来；老了以后在树下坐到天黑。 */

/* 照片：把某个镜头某一时刻的画面画下来，一半一半地缩小（不出锯齿），缓存起来（同一个 id、时刻、大小只画一次） */
const _snapCache = {};
let _snapBig = null;
function snap(id, at, w, h) {
  const key = id + '@' + at + '@' + w + 'x' + h;
  if (_snapCache[key]) return _snapCache[key];
  const sc = SCENES.find(x => x.id === id);
  if (!_snapBig) _snapBig = mk();
  if (sc) drawScene(sc, _snapBig.getContext('2d'), sc.a + at);
  let src = _snapBig;
  while (src.width / 2 >= w * 2) { const c = mk(ri(src.width / 2), ri(src.height / 2)), cg = c.getContext('2d'); cg.imageSmoothingEnabled = true; cg.drawImage(src, 0, 0, c.width, c.height); src = c; }
  const out = mk(w, h), og = out.getContext('2d'); og.imageSmoothingEnabled = true; og.imageSmoothingQuality = 'high'; og.drawImage(src, 0, 0, w, h);
  return (_snapCache[key] = out);
}
const MEMORIES = [['V1c', 2.0], ['V1f', 2.0], ['C1i', 2.2], ['V2c', 2.1], ['V2h', 1.4], ['C2h', .5], ['V1g', 1.2]];
/* 雨夜的窗外；flash 打闪 */
function outsideRain(b, x, y, w, h, t, flash = 0) {
  b.save(); b.translate(x, y);
  psky(b, w, h, [[0, mix('#0E1430', '#C8D0FF', flash)], [1, mix('#262E52', '#9AA4E0', flash)]]);
  for (let i = 0; i < 6; i++) prect(b, i * 11 - 2, h - 10 - (i * 7) % 9, 10, 20, mix('#141A34', '#4A5288', flash));
  rain(b, t, w, h, { n: ri(w * h / 40), v: 140, len: 5, col: 'rgba(200,215,255,.5)', seed: 12 });
  b.restore();
}
/* 一片碎玻璃 */
function pshard(b, x, y, a, sz, col) { const c = Math.cos(a), s = Math.sin(a); pline(b, x, y, x + c * sz, y + s * sz, col); pline(b, x, y, x - s * sz * .6, y + c * sz * .6, col); }
/* 生气的小记号（红色的"井"字） */
function pangry(b, x, y) { for (const [dx, dy] of [[1, 0], [3, 0], [0, 1], [1, 1], [3, 1], [4, 1], [0, 3], [1, 3], [3, 3], [4, 3], [1, 4], [3, 4]]) pdot(b, x + dx, y + dy, RED); }

SCENES_DEF.push(() => {
  // C2a：公园长椅，一年过去：春天她靠在他身上；"我会相信一切有尽头"时到了秋天，两个人坐到了长椅两头，中间只剩一根红线
  scene('C2a', CUT(24), (g, s, k) => {
    const yr = lerp(0, .64, clamp(k / 7.6)), apart = E.io(seg(s, Lt(25) - .3, Lt(25) + 1.2));
    shot(g, 'c2a', 320, 180, 6, (b, gl) => {
      park(b, gl, s, yr);
      pbench(b, 160, 140, 124);
      const sx = ri(lerp(138, 106, apart)), hx = ri(lerp(158, 198, apart));
      monAt(b, sx, 142, { who: 'she', sit: 1, eyes: apart > .5 ? 'dn' : 'shut', blush: apart < .5 ? 1 : 0, lean: apart < .3 ? 1 : 0 }, 1);
      monAt(b, hx, 142, { who: 'he', sit: 1, eyes: apart > .5 ? 'l' : 'happy', blush: apart < .5 ? 1 : 0 }, 1);
      if (apart > .05) pcurve(b, sx + 19, 135, (sx + 19 + hx - 3) / 2, 141, hx - 3, 135, RED);
      if (apart < .1) for (let i = 0; i < 3; i++) { const u = ((s * .45 + i / 3) % 1); pheart(b, 156 + (i - 1) * 6, 124 - u * 16, rgba('#FF7A90', Math.sin(Math.PI * u) * .9)); }
    }, { zoom: 1.4, cx: 160, cy: 114 });
  }, { tr: { type: 'flash', dur: .4 } });

  // C2d：雨夜，吵架了——两个人背过脸去；"离开"时窗外打了一个闪；"都有时候"她转身走出画面，门开了又砰地关上，红线绷得紧紧的
  scene('C2d', CUT(26), (g, s, k) => {
    const go = seg(s, Lc(26, 4) - .1, Lc(26, 4) + 1.3), fl = Math.max(0, 1 - Math.abs(s - Lc(26, 2) - .05) / .12) + .5 * Math.max(0, 1 - Math.abs(s - Lc(26, 2) - .3) / .08);
    const door = seg(s, Lc(26, 4) + .55, Lc(26, 4) + .75) * (1 - seg(s, Lc(26, 7) + .3, Lc(26, 7) + .38));
    shot(g, 'c2d', 240, 135, 8, (b, gl) => {
      room(b, gl, s, { mood: 'rain', lampOn: .55, outside: (bb, x, y, w, h) => outsideRain(bb, x, y, w, h, s, fl), onShelf: (bb, sx) => pjar(bb, sx + 50, 32, 1.2, { fill: .45, slips: 4, seed: 7 }) });
      if (fl > 0) prect(b, 0, 0, 240, 135, rgba('#C8D4FF', .12 * fl));
      if (door > 0) { pbeam(b, 196, 240, 92, 135, -.5, '#FFD090', .3 * door); prect(b, 236, 30, 4, 62, rgba('#FFD090', .5 * door)); if (gl) prect(gl, 232, 30, 8, 62, rgba('#FFC070', .5 * door)); }
      const sx = ri(lerp(122, 262, E.in2(go))), walking = go > 0 && go < 1;
      monAt(b, 34, 114, { who: 'he', eyes: go > .3 ? 'sad' : 'l' }, 2);
      monAt(b, sx, 114 - (walking ? Math.floor(s * 6) % 2 : 0), { who: 'she', eyes: 'r', tear: go > 0 ? 1 : 0, legs: walking ? walkLeg(s, 6) : 0 }, 2);
      if (go < .2) { pangry(b, 58, 72); pangry(b, 146, 72); }
      // 红线：他的右手 → 她的左手；她越走越远，线越绷越直，还在抖
      const a = [70, 95], c = [sx - 2, 95], tight = clamp((c[0] - a[0] - 40) / 60), jit = tight > .5 ? (Math.floor(s * 30) % 2) : 0;
      pcurve(b, a[0], a[1], (a[0] + c[0]) / 2, a[1] + lerp(14, 0, tight) + jit, c[0], c[1], RED);
      if (gl && tight > 0) pcurve(gl, a[0], a[1], (a[0] + c[0]) / 2, a[1] + jit, c[0], c[1], rgba('#FF4060', .6 * tight));
      roomShade(b, 'night', 140, 60);
    });
  }, { tr: { type: 'dither', dur: .4 } });

  // C2e：门砰地关上，架子一震，罐子一点点挪到边上，"永"字时掉下来，慢镜头摔碎，红豆和纸条撒了一地
  scene('C2e', CUT(27), (g, s, k) => {
    const hit = Lc(27, 5) - CUT(27);                         // 摔到地上的时刻（镜头内）
    const camY = ri(60 * E.io(seg(k, hit - .35, hit + .05)));
    shot(g, 'c2e', 160, 150, 12, (b, gl) => {
      prect(b, 0, 0, 160, 124, '#343A52'); for (let y = 6; y < 120; y += 10) for (let x = (y / 10 % 2) * 6 + 2; x < 160; x += 12) pdot(b, x, y, '#3C4260');
      prect(b, 0, 110, 160, 14, '#3E4058'); prect(b, 0, 109, 160, 1, '#4A4C66');
      prect(b, 0, 124, 160, 26, '#4E3E36'); for (let i = 0; i < 4; i++) prect(b, 0, 124 + ri(Math.pow(i / 3, 1.4) * 26), 160, 1, '#43352E'); for (let i = -6; i <= 6; i++) pline(b, 80 + i * 14, 124, 80 + i * 30, 150, '#43352E');
      pbeam(b, -10, 30, 0, 124, .7, '#AAB8FF', .08);
      // 架子和书
      const shake = k < .5 ? (Math.floor(k * 30) % 2 ? 1 : -1) * (1 - k / .5) : 0;
      prect(b, 30, 40, 80, 3, '#6E5140'); prect(b, 34, 43, 3, 6, '#5A4030'); prect(b, 102, 43, 3, 6, '#5A4030');
      const rs = R(77); let bx = 34; while (bx < 76) { const bw = 3 + ri(rs() * 3), bh = 12 + ri(rs() * 8); prect(b, bx + ri(shake), 40 - bh, bw, bh, ['#8E5A4A', '#4E6A7A', '#C9A66B', '#6B7A5A', '#A88A9A'][Math.floor(rs() * 5)]); bx += bw; }
      if (k < .8) for (let i = 0; i < 6; i++) { const u = clamp(k / .8 - i * .08); pdot(b, 40 + i * 13, 44 + u * 70, rgba('#B8B0C8', .7 * (1 - u))); }
      // 罐子：先震、再一点点挪到边上、翻下去
      const inch = Math.floor(clamp((k - .5) / (hit - .8)) * 7) * 2;
      const tip = E.in2(seg(k, hit - .5, hit - .3)), fall = E.in2(seg(k, hit - .3, hit));
      const jx = 92 + inch + ri(shake) + fall * 8, jy = lerp(22, 106, fall), ang = tip * .4 + fall * 1.3;
      if (k < hit) {
        const jb = pbuf('_jar2', 34, 44); pjar(jb, 17, 40, 2, { fill: .45, slips: 4, seed: 7 });
        protSpr(b, BUF._jar2, jx, jy, ang);
      } else {
        const t2 = k - hit, slow = 1 - Math.exp(-t2 * 2.2);          // 慢镜头：一下子飞出去，越来越慢
        if (t2 < .12) prect(b, 0, 0, 160, 150, rgba('#FFFFFF', .5 * (1 - t2 / .12)));
        for (let i = 0; i < 42; i++) {                                // 红豆
          const a = Math.PI + hash(i, 1) * Math.PI, sp = 20 + hash(i, 2) * 46, d = sp * slow;
          const x = jx + Math.cos(a) * d * 1.3, hop = Math.abs(Math.sin(slow * Math.PI * (1 + hash(i, 3) * 2))) * (1 - slow) * 10;
          const y = 126 + Math.abs(Math.sin(a)) * d * .22 - hop;
          pbeanRot(b, x, y, 2.4, hash(i, 4) * 6 + slow * 8, i % 6 === 0 ? gl : null);
        }
        for (let i = 0; i < 12; i++) {                               // 碎玻璃
          const a = Math.PI + hash(i, 11) * Math.PI, d = (10 + hash(i, 12) * 30) * slow;
          const x = jx + Math.cos(a) * d * 1.2, y = 126 + Math.abs(Math.sin(a)) * d * .2 - (1 - slow) * 8 * hash(i, 13);
          pshard(b, x, y, hash(i, 14) * 6 + slow * 3, 2 + hash(i, 15) * 2, rgba('#E6F6FF', .55));
          if (Math.sin(s * 9 + i) > .7) pdot(b, x, y, '#FFFFFF');
        }
        for (let i = 0; i < 4; i++) { const d = (8 + i * 9) * slow; proll(b, jx - 18 + (i - 1.5) * d * .9, 127 + i * 2, 8, false); }
        if (gl) pdisc(gl, jx, 124, 18 * (1 - slow), 'rgba(255,255,255,.6)');
      }
    }, { camY, glow: .7 });
  }, { tr: { type: 'dither', dur: .25 } });

  // C2f：他坐在地上，一颗一颗捡红豆；捡起一张纸条，摊开——"一起看一场雪"
  scene('C2f', CUT(28), (g, s, k) => {
    const find = Lc(28, 3) - .2, op = seg(s, find + .35, find + .9);
    shot(g, 'c2f', 160, 90, 12, (b, gl) => {
      prect(b, 0, 0, 160, 40, '#30344E'); for (let y = 6; y < 36; y += 10) for (let x = (y / 10 % 2) * 6 + 2; x < 160; x += 12) pdot(b, x, y, '#383E5A');
      prect(b, 0, 26, 160, 14, '#3A3C54'); prect(b, 0, 25, 160, 1, '#464862');
      prect(b, 0, 40, 160, 50, '#4E3E36'); for (let i = 0; i < 5; i++) prect(b, 0, 40 + ri(Math.pow(i / 4, 1.4) * 50), 160, 1, '#43352E'); for (let i = -7; i <= 7; i++) pline(b, 80 + i * 12, 40, 80 + i * 30, 90, '#43352E');
      pbeam(b, 40, 90, 0, 90, .5, '#AAB8FF', .08);
      // 撒了一地的豆子，一颗颗被捡走
      const picked = Math.floor(clamp(k / 3.6) * 18);
      for (let i = 0; i < 30; i++) { if (i < picked) continue; pbean(b, 70 + hash(i, 21) * 86, 50 + hash(i, 22) * 36, 2); }
      for (let i = 0; i < 9; i++) pshard(b, 76 + hash(i, 31) * 80, 52 + hash(i, 32) * 32, hash(i, 33) * 6, 2, 'rgba(230,246,255,.7)');
      // 碗里的豆子越来越多
      prect(b, 56, 70, 16, 5, '#F2EEE6'); prect(b, 58, 75, 12, 2, '#E0D8CC'); for (let i = 0; i < Math.min(picked, 14); i++) pdot(b, 57 + (i * 5) % 14, 70 - Math.floor(i / 7), i % 3 ? RED : RED_D);
      const reach = Math.floor(k / .55) % 2 === 1 && op <= 0;
      monAt(b, 16, 74, { who: 'he', sit: 1, eyes: op > .8 ? 'sad' : 'dn', armR: op > 0 ? 'front' : reach ? 'reach' : 'front', armL: 'front', tear: s > Lc(28, 5) ? 1 : 0 }, 2);
      // 纸条：从地上拿起来，摊开
      if (op <= 0) proll(b, ri(lerp(104, 44, E.io(seg(s, find, find + .35)))), ri(lerp(66, 60, E.io(seg(s, find, find + .35)))), 9, false);
      else pslip(b, 88, ri(lerp(56, 26, E.out(op))), ri(lerp(10, 96, E.out(op))), op > .7 ? '一起看一场雪' : '', 1, { h: 16 });
    }, { glow: .5 });
  }, { tr: { type: 'dither', dur: .4 } });

  // C2g：门开了，暖光照进来，她回来了，坐到他面前握住他的手；红线重新系上、亮起来
  scene('C2g', CUT(29), (g, s, k) => {
    const door = seg(s, CUT(29), CUT(29) + .3), walk = seg(s, Lt(29), Lc(29, 4) - .1), sit = s > Lc(29, 4) - .1;
    const tie = seg(s, Lc(29, 6), Lc(29, 8)), hold = s > Lc(29, 4) + .1;
    shot(g, 'c2g', 240, 135, 8, (b, gl) => {
      room(b, gl, s, { mood: 'rain', lampOn: .5, door, outside: (bb, x, y, w, h) => outsideRain(bb, x, y, w, h, s, 0) });
      pbeam(b, 190, 240, 70, 135, -.9, '#FFD090', .22 * door);
      for (let i = 0; i < 12; i++) pbean(b, 20 + hash(i, 41) * 200, 112 + hash(i, 42) * 20, 1);
      const sx = ri(lerp(250, 96, E.out(walk))), walking = walk > 0 && walk < 1;
      monAt(b, 40, 112, { who: 'he', sit: 1, eyes: hold ? 'happy' : walk > 0 ? 'wide' : 'dn', tear: hold ? 0 : 1, armR: hold ? 'hold' : 'n', blush: hold ? 1 : 0 }, 2);
      if (sit) monAt(b, sx, 112, { who: 'she', sit: 1, eyes: hold ? 'happy' : 'l', armL: hold ? 'hold' : 'n', blush: 1, tear: hold && !tie ? 1 : 0 }, 2);
      else monAt(b, sx, 116 - (walking ? Math.floor(s * 7) % 2 : 0), { who: 'she', eyes: 'l', legs: walking ? walkLeg(s, 7) : 0 }, 2);
      // 两只手握在一起的地方：红线绕上去、打个结，坠一颗红豆，亮起来
      if (hold) {
        const kx = 84, ky = 98;
        prect(b, kx - 3, ky - 3, 2, 7, RED); prect(b, kx + 3, ky - 3, 2, 7, RED);
        if (tie > 0) { prect(b, kx - 3, ky - 4, 8, 1, RED_L); const sw = ri(Math.sin(s * 2) * 1.5), ln = ri(lerp(0, 9, tie)); pline(b, kx + 1, ky + 4, kx + 1 + sw, ky + 4 + ln, RED); if (tie > .6) pbean(b, kx + sw, ky + 5 + ln, 1); }
        if (gl) pdisc(gl, kx + 1, ky, 6 + tie * 8, rgba('#FF5060', .35 + tie * .45));
        for (let i = 0; i < 5; i++) { const u = seg(s, Lc(29, 7) + i * .15, Lc(29, 7) + .9 + i * .15); if (u > 0 && u < 1) pheart(b, kx + (i - 2) * 6, ky - 16 - u * 20, rgba('#FF5A78', 1 - u)); }
      }
      roomShade(b, 'evening', 120, 90);
    }, { zoom: 1.35, cx: 120, cy: 84 });
  }, { tr: { type: 'dither', dur: .4 } });

  // C2h："等到风景都看透"——几个字换一个地方：海边的灯塔、雪山日出、花田、极光；两个人小小的背影
  scene('C2h', Lt(30) - .3, (g, s, k) => {
    const cuts = [Lt(30) - .3, Lc(30, 1) - .1, Lc(30, 3) - .1, Lc(30, 5) - .1];
    let i = 0; for (let j = 0; j < 4; j++) if (s >= cuts[j]) i = j;
    const kinds = ['sea', 'snowpeak', 'flowers', 'aurora'], kk = s - cuts[i];
    shot(g, 'c2h_' + i, 320, 180, 6, (b, gl) => {
      const [x, y, col] = vista(b, gl, s, kinds[i]);
      monSil(b, x - 20, y, { who: 'she', back: 1, armR: 'hold' }, 1, col);
      monSil(b, x, y, { who: 'he', back: 1, armL: 'hold' }, 1, col);
    }, { zoom: 1.04 + kk * .03, cx: 160 + kk * 4, cy: 90 });
    // 换地方的时候闪一下白（分 8 级）
    const f = Math.max(...cuts.slice(1).map(c => s >= c ? Math.exp(-(s - c) * 12) : 0));
    if (f > .02) { g.fillStyle = `rgba(255,250,240,${(Math.round(f * 8) / 8 * .7).toFixed(3)})`; g.fillRect(0, 0, W, H); }
  }, { tr: { type: 'mosaic', dur: .5, max: 40 } });

  // C2i：溪边的石头上，看日落；她把头靠在他身上（长音一直到间奏）
  scene('C2i', CUT(31), (g, s, k) => {
    const lean = E.io(seg(s, Lc(31, 3), Lc(31, 6)));
    shot(g, 'c2i', 320, 180, 6, (b, gl) => {
      streamSet(b, gl, s, { time: 'sunset', sunX: 126, sunY: ri(88 + k * 1.2) });
      pbirds(b, s, ri(40 + k * 18), ri(40 + k), 9, 1, '#4A3A50');
      monAt(b, 216, 130, { who: 'he', sit: 1, back: 1 }, 1);
      monAt(b, 196 + (lean > .5 ? 1 : 0), 130, { who: 'she', sit: 1, back: 1, lean: lean > .5 ? 1 : 0 }, 1);
      if (lean > .9) for (let i = 0; i < 3; i++) { const u = ((s * .4 + i / 3) % 1); pheart(b, 214 + (i - 1) * 7, 108 - u * 14, rgba('#FF7A90', Math.sin(Math.PI * u) * .8)); }
    }, { zoom: lerp(1.7, 1.25, E.io(clamp(k / 8))), cx: lerp(214, 180, E.io(clamp(k / 8))), cy: lerp(118, 104, E.io(clamp(k / 8))) });
  }, { tr: { type: 'dither', dur: .6 } });

  // ---------- 间奏 ----------
  // X1：春天的院子，两个人把红豆种下去；最后冒出一棵小芽
  scene('X1', 150.0, (g, s, k) => {
    shot(g, 'x1', 320, 180, 6, (b, gl) => {
      yard(b, gl, s, { season: .05, grow: seg(s, 154.6, 155.4) * .06 });
      const filled = s > 154.4;
      pell(b, YD.treeX, YD.gy + 5, 7, 2, filled ? '#7A5E48' : '#4A3426'); if (filled) pell(b, YD.treeX, YD.gy + 4, 5, 1, '#8A6E56');
      const dig = Math.floor(s * 3.5) % 2;
      monAt(b, 170, YD.gy + 6, { who: 'he', sit: 1, eyes: 'dn', armR: dig ? 'front' : 'n' }, 1);
      const tx = 188, ty = YD.gy - 2 + (dig ? 2 : 0); pline(b, 184, YD.gy - 1, tx, ty, '#6B5546'); prect(b, tx, ty, 3, 3, '#9A9AA0');
      monAt(b, 206, YD.gy + 6, { who: 'she', sit: 1, eyes: 'dn', armL: 'front', blush: 1 }, 1);
      if (s < 154.2) for (let i = 0; i < 3; i++) { const u = ((s * 1.4 + i / 3) % 1); pbean(b, lerp(205, YD.treeX - 1 + (i - 1) * 2, u), lerp(YD.gy - 4, YD.gy + 4, u * u), 1); }
      if (s > 154.6) for (let i = 0; i < 6; i++) { const u = seg(s, 154.6 + i * .08, 155.3 + i * .08); if (u > 0 && u < 1) pdot(b, YD.treeX + Math.cos(i) * u * 8, YD.gy - 2 - u * 8 + Math.sin(i) * 3, rgba('#FFF6C0', 1 - u)); }
      // 挖出来的土往外溅；一朵云慢慢飘过；两只蝴蝶绕着他们飞
      if (s < 154.4 && dig) for (let i = 0; i < 3; i++) pdot(b, 190 + i * 2 + ri(hash(Math.floor(s * 3.5), i) * 4), YD.gy - 4 - ri(hash(Math.floor(s * 3.5), i + 5) * 4), '#7A5E48');
      pcloud(b, 110 + k * 7, 92, 30, '#FFFFFF', '#E0ECF4');
      for (let i = 0; i < 2; i++) { const bx = 196 + Math.sin(s * .9 + i * 3) * 34, by = 118 + Math.sin(s * 1.7 + i * 2) * 7, up = Math.floor(s * 9 + i) % 2, c = i ? '#FFD24A' : '#F7A9C0'; pdot(b, bx, by, '#4A3A30'); pdot(b, bx, by + 1, '#4A3A30'); prect(b, bx - 2, by - up, 2, 2, c); prect(b, bx + 1, by - up, 2, 2, c); }
    }, { zoom: 2, cx: 196, cy: 128 });
  }, { tr: { type: 'dither', dur: 1.0 } });

  // X2：同一个院子，时间飞快地过——日夜、四季转了好几圈，红豆树一年年长大，两个人在树下慢慢变老；角上很淡的"一年……三十年"
  scene('X2', 155.5, (g, s, k) => {
    const T = clamp(k / 9.9), years = T * 2.4, season = (.05 + years) % 1;
    const night = Math.round(Math.pow(Math.max(0, Math.sin(k * 5.5)), 3) * .85 * 4) / 4, old = T > .55;
    shot(g, 'x2', 320, 180, 6, (b, gl) => {
      yard(b, gl, s, { season, grow: lerp(.06, .85, E.out(T)), night });
      const idx = Math.floor(years * 4) % 4, gy = YD.gy + 6;
      const spots = [
        [['he', 150, { eyes: 'r' }], ['she', 226, { eyes: 'l' }]],
        [['he', 172, { sit: 1, eyes: 'happy' }], ['she', 200, { sit: 1, eyes: 'happy', lean: -1 }]],
        [['she', 96, { armR: 'hold', legs: walkLeg(s, 6) }], ['he', 118, { armL: 'hold', legs: walkLeg(s + .3, 6) }]],
        [['he', 168, { eyes: 'up' }], ['she', 214, { armL: 'hi', eyes: 'up' }]],
      ][idx];
      b.save(); b.globalAlpha = 1 - night * .75;
      for (const [who, x, o] of spots) monAt(b, x, gy, Object.assign({ who, old: old ? 1 : 0 }, o), 1);
      b.restore();
    }, { zoom: 1.15, cx: 180, cy: 100 });
    const n = Math.min(7, Math.floor(T * 8));
    if (!window.PEEK) ptext(g, ['一', '二', '三', '五', '八', '十二', '二十', '三十'][n] + '年', 130, 84, 5, '#FFFFFF', { alpha: .55, ol: '#0A0C1C' });   // 前奏里借这个镜头时不写年数
  }, { tr: { type: 'dither', dur: .5 } });

  // X3：屋里的墙上，照片一张张多起来（都是前面的日子，用前面镜头的画面缩小的）；柜子上的新罐子插满了纸条
  scene('X3', 165.4, (g, s, k) => {
    shot(g, 'x3', 240, 135, 8, (b, gl) => {
      room(b, gl, s, { mood: 'evening', shelf: false, lamp: false, window: false });
      const slots = [[16, 14], [68, 14], [120, 14], [172, 14], [30, 48], [82, 48], [134, 48]];
      MEMORIES.forEach(([id, at], i) => {
        const t0 = i * .62, a = seg(k, t0, t0 + .25); if (a <= 0) return;
        const [x, y] = slots[i], dy = ri((1 - E.out(a)) * -4);
        photoFrame(b, x, y + dy, 40, 22, snap(id, at, 40, 22), 1);
        if (a < 1) prect(b, x, y + dy, 40, 22, rgba('#FFFFFF', .7 * (1 - a)));
      });
      prect(b, 186, 66, 40, 26, '#7A5440'); prect(b, 186, 66, 40, 2, '#9A7058'); prect(b, 205, 72, 2, 14, '#5E4030');
      pjar(b, 206, 66, 1.3, { fill: .3, slips: 3 + Math.floor(k * 1.4), seed: 17 });
      roomShade(b, 'evening', 120, 40);
    }, { zoom: 1.2, cx: lerp(104, 136, E.io(clamp(k / 5.6))), cy: 56 });
  }, { tr: { type: 'iris', dur: .7, cx: 1180, cy: 500 } });

  // X4：老了——两个人坐在大红豆树下的长椅上，天慢慢黑了，萤火虫亮起来；音乐快停时画面也暗下来
  scene('X4', 171.0, (g, s, k) => {
    const dusk = clamp(k / 5.0);
    shot(g, 'x4', 320, 180, 6, (b, gl) => {
      yard(b, gl, s, { season: .42, grow: 1, night: Math.round(dusk * .85 * 24) / 24, lit: dusk, pods: true });
      pbench(b, YD.treeX, YD.gy + 2, 46, '#7A5A44');
      const tint = dusk > .2 ? mix('#FFFFFF', '#8A8AB8', Math.round(dusk * 6) / 6) : null;
      monAt(b, YD.treeX - 18, YD.gy + 4, { who: 'she', sit: 1, old: 1, eyes: 'shut', lean: 1, blush: 1 }, 1, tint);
      monAt(b, YD.treeX + 2, YD.gy + 4, { who: 'he', sit: 1, old: 1, eyes: 'happy' }, 1, tint);
      for (let i = 0; i < 18; i++) { const tw = Math.max(0, Math.sin(s * (1.5 + hash(i, 3)) + i * 2)), a = dusk * tw; if (a < .1) continue; const x = 140 + hash(i, 1) * 120 + Math.sin(s * .7 + i) * 6, y = 96 + hash(i, 2) * 44 + Math.cos(s * .6 + i) * 4; pdot(b, x, y, rgba('#F0FFB0', a)); if (gl) pdisc(gl, x, y, 2, rgba('#E8FF9A', a * .8)); }
    }, { zoom: 1.8, cx: 196, cy: 116 });
    const dim = seg(s, 175.0, 176.3);
    if (dim > 0) { g.fillStyle = `rgba(4,4,10,${(Math.round(dim * 6) / 6 * .55).toFixed(3)})`; g.fillRect(0, 0, W, H); }
  }, { tr: { type: 'dither', dur: 1.0 } });
});
