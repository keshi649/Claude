'use strict';
/* scenes5.js —— 第三遍副歌（176.4 ~ 210.5 秒）和尾奏（210.5 ~ 232.6 秒），以及封面。
   副歌：老了——黄昏的屋里她在扶手椅里织红围巾，他戴着眼镜看书；他站在照片墙前；两个人跟着唱片慢慢跳舞；
   秋风里的红豆树落叶、落豆子，窗里亮着灯；他从罐子里取出最后一张纸条——"陪你看细水长流"；两个老了的小怪再一次伸出手，红线还在；
   拄着拐杖、慢慢走过红豆树下；坐在当年那块石头上看日落，红豆顺水漂走。
   尾奏：溪面上红豆和一只纸船漂远；窗外又下雪了，罐子旁边一张新纸条——"明年还一起看雪"，一只老手把它卷起来放进罐子；
   大雪里的小房子和红豆树，镜头升上星空，片尾字。 */

/* 黄昏的窗外 */
function outsideDusk(b, x, y, w, h, t) {
  b.save(); b.translate(x, y);
  psky(b, w, h, [[0, '#6A5A92'], [.55, '#E89A86'], [1, '#FFD6A0']]);
  pdisc(b, w * .3, h * .62, 5, '#FFF0D0');
  for (let i = 0; i < 6; i++) { const hx = i * 11 - 3, hy = h - 10 - (i * 5) % 7; prect(b, hx, hy, 10, 20, '#5A4058'); if (i % 2) pdot(b, hx + 4, hy + 4, '#FFC870'); }
  b.restore();
}
/* 扶手椅（正面）：x 中线，座面 y */
function parmchair(b, x, y, col) {
  const d = shade(col, .82);
  prect(b, x - 12, y - 18, 24, 18, d); prect(b, x - 11, y - 19, 22, 1, d); prect(b, x - 10, y - 16, 20, 14, col);
  prect(b, x - 15, y - 8, 4, 12, d); prect(b, x + 11, y - 8, 4, 12, d); prect(b, x - 15, y - 9, 4, 1, shade(col, 1.1)); prect(b, x + 11, y - 9, 4, 1, shade(col, 1.1));
  prect(b, x - 12, y, 24, 4, shade(col, 1.08)); prect(b, x - 12, y + 4, 24, 2, d);
  prect(b, x - 13, y + 6, 2, 3, '#4A3428'); prect(b, x + 11, y + 6, 2, 3, '#4A3428');
}
/* 音符 ♪ */
function pnote(b, x, y, c) { x = ri(x); y = ri(y); prect(b, x + 2, y, 1, 5, c); prect(b, x + 3, y, 2, 1, c); pdot(b, x + 4, y + 1, c); prect(b, x, y + 4, 3, 2, c); }
/* 老了的手臂（一截方块，从画面边上伸进来）：从 (x0, y) 伸到 (x1, y)，粗 th */
function parm(b, x0, x1, y, th, col) { const a = Math.min(x0, x1), w = Math.abs(x1 - x0); prect(b, a, y, w, th, col); prect(b, a, y, w, 1, shade(col, 1.12)); prect(b, a, y + th - 1, w, 1, shade(col, .8)); }
const OLD_HE = mix(MON.he, '#B8A898', .32), OLD_SHE = mix(MON.she, '#D0BCC4', .32);

SCENES_DEF.push(() => {
  // C3a：黄昏的屋里——她坐在扶手椅里织一条红围巾，他戴着眼镜看书；第二个"有时候"两个人抬头看了对方一眼
  scene('C3a', CUT(32), (g, s, k) => {
    const glance = s > Lc(32, 3) - .1 && s < Lc(32, 5) + .6, smile = s > Lc(32, 4);
    shot(g, 'c3a', 240, 135, 8, (b, gl) => {
      room(b, gl, s, { mood: 'evening', lampX: 120, outside: (bb, x, y, w, h) => outsideDusk(bb, x, y, w, h, s) });
      parmchair(b, 92, 110, '#6A7A5A'); parmchair(b, 150, 110, '#9A5A4A');
      monAt(b, 84, 112, { who: 'he', sit: 1, old: 1, eyes: glance ? (smile ? 'happy' : 'r') : 'dn', armL: 'front', armR: 'front', blush: smile && glance ? 1 : 0 }, 1);
      prect(b, 84, 103, 16, 7, '#8E5A4A'); prect(b, 85, 103, 14, 6, '#F4EEE2'); prect(b, 92, 103, 1, 6, '#C9B8A0'); for (let i = 0; i < 3; i++) { prect(b, 86, 104 + i * 2, 5, 1, '#C9C0B0'); prect(b, 94, 104 + i * 2, 4, 1, '#C9C0B0'); }
      monAt(b, 142, 112, { who: 'she', sit: 1, old: 1, eyes: glance ? (smile ? 'happy' : 'l') : 'dn', armL: 'front', armR: 'front', blush: smile && glance ? 1 : 0 }, 1);
      // 织毛衣：两根针交替动，红围巾一点点变长，线连到地上的毛线球
      const kn = Math.sin(s * 9) > 0 ? 1 : 0, len = ri(lerp(6, 12, clamp(k / 3.6)));
      for (let j = 0; j < len; j++) prect(b, 147, 107 + j, 6, 1, j % 2 ? RED_D : RED);
      pline(b, 143, 106 - kn, 150, 100, '#D8C8A8'); pline(b, 157, 106 - (1 - kn), 150, 100, '#D8C8A8');
      pdisc(b, 172, 124, 3, RED); pdot(b, 171, 123, RED_L); pcurve(b, 152, 107, 164, 118, 170, 122, RED);
      roomShade(b, 'evening', 120, 60);
    }, { zoom: 1.6, cx: 120, cy: 92 });
  }, { tr: { type: 'dither', dur: .9 } });

  // C3b：他站在照片墙前（背影），镜头慢慢扫过一张张照片
  scene('C3b', CUT(33), (g, s, k) => {
    const u = E.io(clamp(k / 3.8));
    shot(g, 'c3b', 240, 135, 8, (b, gl) => {
      room(b, gl, s, { mood: 'evening', shelf: false, lamp: false, window: false });
      const slots = [[16, 14], [68, 14], [120, 14], [172, 14], [30, 48], [82, 48], [134, 48]];
      MEMORIES.forEach(([id, at], i) => photoFrame(b, slots[i][0], slots[i][1], 40, 22, snap(id, at, 40, 22), 1));
      prect(b, 186, 66, 40, 26, '#7A5440'); prect(b, 186, 66, 40, 2, '#9A7058'); prect(b, 205, 72, 2, 14, '#5E4030');
      pjar(b, 206, 66, 1.3, { fill: .3, slips: 11, seed: 17 });
      pbeam(b, 40, 120, 0, 135, .4, '#FFE0B0', .1);
      monAt(b, 104, 124, { who: 'he', back: 1, old: 1 }, 1);
      roomShade(b, 'evening', lerp(60, 160, u), 40);
    }, { zoom: 1.4, cx: lerp(86, 154, u), cy: lerp(50, 82, u) });
  }, { tr: { type: 'push', dur: .5, dir: 1 } });

  // C3c：唱片机转着，两个人在屋里慢慢跳舞
  scene('C3c', CUT(34), (g, s, k) => {
    shot(g, 'c3c', 240, 135, 8, (b, gl) => {
      room(b, gl, s, { mood: 'evening', lampX: 150, outside: (bb, x, y, w, h) => outsideDusk(bb, x, y, w, h, s) });
      // 唱片机
      prect(b, 18, 100, 34, 18, '#7A5440'); prect(b, 18, 100, 34, 2, '#9A7058'); prect(b, 20, 118, 2, 4, '#5A3E30'); prect(b, 48, 118, 2, 4, '#5A3E30');
      pell(b, 32, 98, 10, 2, '#1E1A1E'); pell(b, 32, 98, 3, 1, RED); const ra = s * 4; pdot(b, 32 + Math.cos(ra) * 7, 98 + Math.sin(ra) * 1.5, '#5A5460');
      pline(b, 44, 96, 37, 98, '#C9B48A');
      for (let j = 0; j < 14; j++) { const ww = ri(1 + j * .5); prect(b, 44 + j - ww, 94 - j, ww * 2 + 1, 1, j > 10 ? '#E0B85A' : '#C9A04A'); }
      for (let i = 0; i < 4; i++) { const uu = ((s * .45 + i / 4) % 1); pnote(b, 56 + uu * 30 + Math.sin(uu * 6 + i) * 3, 78 - uu * 44, rgba('#FFF2E0', Math.sin(Math.PI * uu))); }
      // 两个人牵着手，慢慢地左右摇
      const sw = ri(Math.sin(s * 1.7) * 5), bob = Math.floor(s * 1.7 / Math.PI) % 2;
      monAt(b, 112 + sw, 120 - bob, { who: 'he', old: 1, armR: 'hold', eyes: 'happy', legs: bob ? 1 : 0, blush: 1 }, 1);
      monAt(b, 138 + sw, 120 - (1 - bob), { who: 'she', old: 1, armL: 'hold', eyes: 'shut', legs: bob ? 0 : 2, blush: 1 }, 1);
      for (let i = 0; i < 3; i++) { const uu = ((s * .35 + i / 3) % 1); pheart(b, 134 + sw + (i - 1) * 6, 96 - uu * 16, rgba('#FF7A90', Math.sin(Math.PI * uu) * .8)); }
      roomShade(b, 'evening', 130, 70);
    }, { zoom: 1.7, cx: 100, cy: 92 });
  }, { tr: { type: 'mosaic', dur: .5, max: 30 } });

  // C3d：秋风里的红豆树，叶子和红豆一起落下来；屋里亮着灯，窗里是他们两个小小的剪影
  scene('C3d', CUT(35), (g, s, k) => {
    shot(g, 'c3d', 320, 180, 6, (b, gl) => {
      yard(b, gl, s, { season: .62, grow: 1, night: .35, lit: 1, pods: true });
      // 窗户放大一点：里面两个小小的剪影
      prect(b, 64, 112, 20, 13, '#FFC870'); prect(b, 73, 112, 2, 13, '#E6D2BC'); if (gl) pdisc(gl, 74, 118, 12, 'rgba(255,190,100,.6)');
      for (const [mx, c] of [[66, '#6A4048'], [76, '#5A3A30']]) { prect(b, mx, 119, 6, 4, c); pdot(b, mx + 1, 123, c); pdot(b, mx + 4, 123, c); }
      prect(b, 63, 111, 22, 1, '#E6D2BC'); prect(b, 63, 125, 22, 1, '#E6D2BC');
      drift(s, 320, 180, { n: 40, v: 14, vx: 40, seed: 191 }, (x, y, i) => { if (y < 60) return; prect(b, x, y, 2, 1, ['#C8A048', '#B86A3A', '#D88A4A'][i % 3]); });
      drift(s, 320, 180, { n: 14, v: 20, vx: 30, seed: 192 }, (x, y) => { if (y < 70) return; pbean(b, x, y, 1); });
    }, { zoom: 1.5, cx: 148, cy: 110 });
  }, { tr: { type: 'wipe', dur: .6, dir: -1 } });

  // C3e：他把手伸进罐子，取出最后一张纸条，慢慢摊开——"陪你看细水长流"
  scene('C3e', CUT(36), (g, s, k) => {
    const reach = E.io(seg(s, CUT(36) + .1, Lc(36, 1))), pull = E.io(seg(s, Lc(36, 2) - .05, Lc(36, 2) + .5)), open = E.out(seg(s, Lc(36, 3) - .4, Lc(36, 3) + .3));
    shot(g, 'c3e', 160, 90, 12, (b, gl) => {
      prect(b, 0, 0, 160, 62, '#C9A487'); for (let y = 6; y < 58; y += 9) for (let x = (y / 9 % 2) * 5 + 2; x < 160; x += 10) pdot(b, x, y, '#C29C80');
      prect(b, 0, 62, 160, 28, '#7E5A44'); prect(b, 0, 62, 160, 2, '#9A7058');
      pcone(b, 70, 0, 90, 20, 140, '#FFCF8A', .16, .06);
      pjar(b, 116, 74, 2.6, { fill: .55, slips: open > 0 || pull > .5 ? 0 : 1, seed: 23 });
      // 他的手：从右边伸进来，到罐口，捏住纸条拿出来
      const hx = ri(lerp(170, 118, reach) - pull * 30), hy = ri(lerp(30, 22, reach) - pull * 6);
      if (open <= 0) {
        if (pull > 0) proll(b, hx - 3, hy + 4, 12, true);
        parm(b, hx, 170, hy, 9, OLD_HE);
      } else {
        parm(b, ri(lerp(118, 170, open)), 170, 22, 9, OLD_HE);
        pslip(b, 62, 34, ri(lerp(8, 104, open)), open > .9 ? '陪你看细水长流' : '', 1, { h: 16 });
        const gw = seg(s, Lc(36, 5), Lc(36, 5) + .6); if (gl && gw > 0) pdisc(gl, 13, 30, 6, rgba('#FF5060', .7 * Math.sin(Math.PI * gw)));
      }
    }, { glow: .7 });
  }, { tr: { type: 'dither', dur: .4 } });

  // C3f：两个老了的小怪，再一次从两边伸出手，手一碰，系着的红线又亮起来（和第一段"牵着手"那个镜头一样）
  scene('C3f', CUT(37), (g, s, k) => {
    const meet = E.io(seg(s, CUT(37) + .1, Lc(37, 4) - .05)), hit = seg(s, Lc(37, 4) - .05, Lc(37, 4) + .5), shine = seg(s, Lc(37, 6) - .1, Lc(37, 8) + .3);
    shot(g, 'c3f', 160, 90, 12, (b, gl) => {
      psky(b, 160, 90, [[0, '#E8A07A'], [1, '#F6D3A0']]);
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + s * .1; for (let d = 14; d < 90; d++) if ((d + i) % 3 !== 0) pdot(b, 80 + Math.cos(a) * d * 1.4, 46 + Math.sin(a) * d, rgba('#FFF2D8', .14 * (1 - d / 90) * (.4 + shine))); }
      pbokeh(b, s, 160, 90, 151, 10, ['#FFF0C8', '#FFC890', '#FFFFFF'], .2);
      const sx = ri(lerp(-30, 26, meet)), hx = ri(lerp(170, 86, meet));
      monAt(b, sx, 74, { who: 'she', old: 1, armR: 'reach', eyes: hit > 0 ? 'happy' : 'r', blush: hit > 0 ? 1 : 0 }, 2);
      monAt(b, hx, 74, { who: 'he', old: 1, armL: 'reach', eyes: hit > 0 ? 'happy' : 'l', blush: hit > 0 ? 1 : 0 }, 2);
      const ax = sx + 46, ay = 52;
      if (meet > .92) {
        prect(b, ax - 3, ay - 3, 2, 8, RED); prect(b, ax + 3, ay - 3, 2, 8, RED); prect(b, ax - 3, ay - 4, 8, 1, RED_L);
        if (gl) prect(gl, ax - 4, ay - 4, 10, 10, rgba('#FF6070', .4 + hit * .3 + shine * .3));
        const sw = ri(Math.sin(s * 2) * 1.5); pline(b, ax + 1, ay + 5, ax + 1 + sw, ay + 14, RED); pbean(b, ax + sw, ay + 15, 1);
      } else {
        const bx = hx - 14, by = ay;
        prect(b, ax - 2, ay - 3, 2, 8, RED); prect(b, bx, by - 3, 2, 8, RED);
        pcurve(b, ax, ay + 4, (ax + bx) / 2, ay + 4 + lerp(18, 2, meet), bx + 1, by + 4, RED);
      }
      if (hit > 0 && hit < 1) for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, d = 6 + hit * 30; pheart(b, ax + 1 + Math.cos(a) * d, ay + Math.sin(a) * d * .6, rgba('#FF5A78', 1 - hit)); }
      if (shine > 0 && shine < 1) for (let i = 0; i < 5; i++) { const uu = clamp(shine * 1.4 - i * .1); if (uu > 0 && uu < 1) pheart(b, ax - 10 + i * 5, ay - 6 - uu * 26, rgba('#FF7A90', 1 - uu)); }
    }, { glow: .9 });
  }, { tr: { type: 'flash', dur: .5 } });

  // C3g：金色的傍晚，两个人慢慢走——他拄着拐杖，她挽着他，走过红豆树下，叶子落在路上
  scene('C3g', CUT(38), (g, s, k) => {
    shot(g, 'c3g', 320, 180, 6, (b, gl) => {
      streamSet(b, gl, s, { time: 'gold', sunX: 70, sunY: 84, rock: false, tree: false });
      ptree(b, 262, 136, 1, .45, { pods: true });
      const x = ri(118 + k * 11), gy = 150;
      monAt(b, x, gy, { who: 'she', old: 1, armR: 'hold', eyes: 'happy', legs: walkLeg(s, 3) }, 1);
      monAt(b, x + 26, gy, { who: 'he', old: 1, armL: 'hold', eyes: 'happy', legs: walkLeg(s + .5, 3) }, 1);
      const cx = x + 26 + 19, tap = Math.floor(s * 3) % 2; pline(b, cx, gy - 9, cx + 2 + tap, gy, '#5A4234'); prect(b, cx - 1, gy - 10, 3, 1, '#5A4234');
      drift(s, 320, 180, { n: 26, v: 12, vx: 26, seed: 201 }, (xx, yy, i) => prect(b, xx, yy, 2, 1, ['#C8A048', '#B86A3A', '#D88A4A'][i % 3]));
      drift(s, 320, 180, { n: 6, v: 16, vx: 20, seed: 202 }, (xx, yy) => { if (xx > 200) pbean(b, xx, yy, 1); });
    }, { zoom: 1.3, cx: 150 + k * 5, cy: 110 });
  }, { tr: { type: 'dither', dur: .5 } });

  // C3h：还是那块石头、那条溪——老了的两个人坐着看日落，红豆顺着溪水漂走；"细水"后面停了两秒，画面也静下来；"长流"时镜头升起来
  scene('C3h', CUT(39), (g, s, k) => {
    const P0 = 207.3, P1 = 209.2;
    const tt = s < P0 ? s : s < P1 ? P0 + (s - P0) * .15 : P0 + (P1 - P0) * .15 + (s - P1);   // 停顿的两秒里，动的东西都放慢
    const pause = Math.sin(Math.PI * seg(s, P0, P1)), up = E.io(seg(s, Lc(39, 9), Lc(39, 10) + 1.2)), lean = E.io(seg(s, Lc(39, 3), Lc(39, 6)));
    const zk = E.io(clamp(k / 7));
    shot(g, 'c3h', 320, 180, 6, (b, gl) => {
      streamSet(b, gl, tt, { time: 'sunset', sunX: 126, sunY: ri(88 + (tt - CUT(39)) * 1.1), redBean: true, treeX: 290 });
      pbirds(b, tt, ri(300 - (tt - CUT(39)) * 16), ri(36 + (tt - CUT(39))), 9, -1, '#4A3A50');
      for (let i = 0; i < 9; i++) { const ph = ((tt * .045 + i / 9) % 1), [cx, cy, cw] = streamC(lerp(.8, .12, ph)); pbean(b, cx + Math.sin(i * 3) * cw * .2, cy - 1, ph < .5 ? 2 : 1); }
      monAt(b, 216, 130, { who: 'he', sit: 1, back: 1, old: 1 }, 1);
      monAt(b, 196 + (lean > .5 ? 1 : 0), 130, { who: 'she', sit: 1, back: 1, old: 1, lean: lean > .5 ? 1 : 0 }, 1);
    }, { zoom: lerp(1.7, 1.3, zk) - up * .15, cx: lerp(214, 180, zk), cy: lerp(118, 104, zk) - up * 25 });
    if (pause > 0) { g.fillStyle = `rgba(20,10,30,${(Math.round(pause * 4) / 4 * .14).toFixed(3)})`; g.fillRect(0, 0, W, H); }
  }, { tr: { type: 'dither', dur: .6 } });

  // ---------- 尾奏 ----------
  // O1：溪面的特写——红豆和一只纸船（船上放着一颗红豆）顺水慢慢漂远
  scene('O1', 210.5, (g, s, k) => {
    shot(g, 'o1', 160, 90, 12, (b, gl) => {
      psky(b, 160, 90, [[0, '#F2B48E'], [.5, '#B08AA8'], [1, '#5E5A8E']]);
      for (let i = 0; i < 26; i++) { const y = ((hash(i, 1) * 100 - s * 5) % 100 + 100) % 100 - 5, x = hash(i, 2) * 160, w = 6 + hash(i, 3) * 14; prect(b, x - w / 2, y, w, 1, rgba('#FFE6D8', .22 + .12 * Math.sin(s + i))); }
      for (let i = 0; i < 30; i++) { const a = Math.max(0, Math.sin(s * 3 + i * 1.7)); if (a > .4) prect(b, hash(i, 3) * 160, ((hash(i, 4) * 90 - s * 5) % 90 + 90) % 90, 1 + ri(hash(i, 5) * 3), 1, rgba('#FFFAE6', a * .8)); }
      for (let i = 0; i < 8; i++) { const x = hash(i, 11) * 150 + 5 + Math.sin(s * .8 + i) * 3, y = ((hash(i, 12) * 110 - s * 4.5) % 110 + 110) % 110 - 10; pring(b, x + 2, y + 2, 5, 1.5, 'rgba(255,240,230,.35)'); pbean(b, x, y, 2); }
      const bx = ri(80 + Math.sin(s * .7) * 6), by = ri(lerp(64, 30, k / 6.1));
      pring(b, bx, by + 4, 12 + Math.sin(s * 2) * 1, 3, 'rgba(255,240,230,.45)');
      pboat(b, bx, by, 2); pbean(b, bx - 4, by - 3, 1);
      if (gl) pdisc(gl, bx - 3, by - 2, 5, 'rgba(255,90,110,.5)');
    }, { glow: .7 });
  }, { tr: { type: 'ripple', dur: .8 } });

  // O2：窗台上的罐子，窗外又下雪了；罐子旁边一张新写的纸条——"明年还一起看雪"，一只老手把它卷起来，放进罐子
  scene('O2', 216.6, (g, s, k) => {
    const write = clamp((k - .2) / 1.6), arrive = E.io(seg(k, 2.2, 2.8)), roll = E.io(seg(k, 2.8, 3.5)), lift = E.io(seg(k, 3.5, 4.3)), done = k > 4.3;
    shot(g, 'o2', 160, 90, 12, (b, gl) => {
      prect(b, 0, 0, 160, 90, '#3A3F5C');
      outsideSnow(b, 14, 2, 132, 52, s, .7);
      prect(b, 12, 0, 136, 2, '#D9D0C2'); prect(b, 12, 54, 136, 2, '#D9D0C2'); prect(b, 12, 2, 2, 52, '#D9D0C2'); prect(b, 146, 2, 2, 52, '#D9D0C2'); prect(b, 79, 2, 2, 52, '#D9D0C2');
      prect(b, 4, 56, 152, 5, '#C9BCA8'); prect(b, 4, 61, 152, 2, '#A89A84'); prect(b, 0, 63, 160, 27, '#30344E');
      pcone(b, 120, 0, 90, 10, 90, '#FFCF8A', .12, .05);
      pjar(b, 30, 56, 2.2, { fill: .3, slips: done ? 10 : 9, seed: 17 });
      // 纸条：先一个字一个字写出来，再被卷起来，提到罐口放进去
      const sx = ri(lerp(138, 30, lift)), sy = ri(lerp(70, 14, lift) + Math.sin(Math.PI * lift) * -10);
      // 卷的时候从左边往右卷：卷起来的那一截是一根小纸卷，手跟着纸卷走
      const rx = ri(lerp(40, 138, roll));
      if (roll <= 0) pslip(b, 90, 70, 100, '明年还一起看雪', write, { h: 16 });
      else if (lift <= 0) { b.save(); b.beginPath(); b.rect(rx, 50, 120, 40); b.clip(); pslip(b, 90, 70, 100, '明年还一起看雪', 1, { h: 16 }); b.restore(); proll(b, rx - 1, 62, 16, true); }
      else if (!done) proll(b, sx - 1, sy - 8, 16, true);
      // 她的老手（粉色）：先伸到纸条右头，跟着纸卷往右卷，卷好就缩回去，纸条卷画一道弧落进罐子
      if (arrive > 0 && !done) { const hx = roll <= 0 ? lerp(170, 142, arrive) : lift <= 0 ? rx + 2 : lerp(140, 172, lift); parm(b, ri(hx), 172, 64, 9, OLD_SHE); }
      psnow(b, s, 160, 90, { n: 14, v: 10, bloom: .5, seed: 221, bigRate: .5 });
    }, { glow: .6 });
  }, { tr: { type: 'dither', dur: .8 } });

  // O3：大雪里的小房子和红豆树，窗户亮着；镜头慢慢升上星空（片尾字在 main.js 里叠）
  scene('O3', 222.0, (g, s, k) => {
    const rise = E.io(clamp((k - 2.0) / 7.5)), camY = ri(lerp(150, 0, rise));
    shot(g, 'o3', 320, 330, 6, (b, gl) => {
      psky(b, 320, 152, [[0, '#04061A'], [1, '#0B1030']]);
      for (let i = 0; i < 900; i++) { const u = hash(i, 231), off = (hash(i, 232) + hash(i, 233) + hash(i, 234) - 1.5) * 30; pdot(b, u * 320, 30 + u * 70 + off, rgba(hash(i, 235) < .3 ? '#C8B0F0' : '#E8E0FF', .2 + hash(i, 236) * .45)); }
      pstars(b, s, 320, 150, 91, 220, 1);
      b.save(); b.translate(0, 150); gl.save(); gl.translate(0, 150);
      yard(b, gl, s, { season: .85, grow: 1, night: .9, lit: 1, snow: true });
      b.restore(); gl.restore();
      psnow(b, s, 320, 330, { n: 300, v: 16, bloom: .8, seed: 211, bigRate: .3 });
    }, { camY, glow: .8 });
  }, { tr: { type: 'dither', dur: 1.2 } });
});

/* 封面：两只小怪伸出手，手上系着红线、坠一颗红豆；大字"红豆"放在正中间（抖音主页的格子按中间裁成 3:4，也看得全） */
function drawCoverArt() {
  const g = ctx; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.imageSmoothingEnabled = false;
  const s = 30;
  shot(g, 'cover', 240, 135, 8, (b, gl) => {
    psky(b, 240, 135, [[0, '#F4C2A8'], [.6, '#F8D8BC'], [1, '#FBE8D2']]);
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + .2; for (let d = 16; d < 140; d++) if ((d + i) % 3 !== 0) pdot(b, 120 + Math.cos(a) * d * 1.4, 92 + Math.sin(a) * d, rgba('#FFF4E0', .16 * (1 - d / 140))); }
    pbokeh(b, s, 240, 135, 301, 16, ['#FFF0C8', '#FFC890', '#FFFFFF'], .22);
    psnow(b, s, 240, 135, { n: 40, v: 0, bloom: 1, seed: 303, bigRate: .5, col: '#FFFFFF' });
    monAt(b, 82, 112, { who: 'she', armR: 'reach', eyes: 'happy', blush: 1 }, 2);
    monAt(b, 126, 112, { who: 'he', armL: 'reach', eyes: 'happy', blush: 1 }, 2);
    const ax = 120, ay = 90;
    prect(b, ax - 4, ay - 3, 2, 8, RED); prect(b, ax + 2, ay - 3, 2, 8, RED); prect(b, ax - 4, ay - 4, 8, 1, RED_L);
    if (gl) pdisc(gl, ax, ay, 9, 'rgba(255,90,100,.7)');
    pline(b, ax, ay + 5, ax, ay + 15, RED); pbeanRot(b, ax, ay + 19, 3.2, -.4, gl);
    for (let i = 0; i < 5; i++) pheart(b, ax - 22 + i * 11, ay - 14 - (i % 2) * 6, rgba('#FF5A78', .9));
  }, { glow: .9 });
  ptext(g, '红豆', 960, 96, 16, '#C81E32', { align: 'center', ol: '#FFF6EE', shadow: '#7A1020' });
  ptext(g, '方大同', 960, 330, 5, '#6B3A34', { align: 'center' });
  ptext(g, '甜菜', 1876, 42, 3, '#FFFFFF', { align: 'right', alpha: .8, ol: '#0A0C1C' });
}
