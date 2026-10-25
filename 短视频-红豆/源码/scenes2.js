'use strict';
/* scenes2.js —— 第一遍副歌（"有时候 有时候" ~ "也许你会陪我看细水长流"，47.5 ~ 82.9 秒）：
   沙漏里流的是红豆；窗外从冬天到春天，做完的心愿摊在窗台上打了钩；雪人化了，红豆眼睛掉下来；
   站台上分别，车门关上，红线从门缝里穿过去；火车开走，线越拉越长；夜里他一个人，把线一圈圈绕在胳膊上，
   线跨过一片屋顶，一直连到夜车上的她；早晨她回来，扑过来抱住他；两个人沿着溪往日出走。 */

SCENES_DEF.push(() => {
  // C1a：沙漏的特写，里面流下来的是红豆；窗外的光一明一暗地扫过（时间在走）
  scene('C1a', CUT(8), (g, s, k) => {
    shot(g, 'c1a', 160, 90, 12, (b, gl) => {
      const day = .5 + .5 * Math.sin(s * 2.6), q = Math.round(day * 4) / 4;
      prect(b, 0, 0, 160, 66, mix('#2E3352', '#E2D3C0', q)); prect(b, 0, 66, 160, 4, mix('#4A4258', '#F2EBE0', q)); prect(b, 0, 70, 160, 20, mix('#3A3448', '#D8CCBA', q));
      for (let y = 6; y < 60; y += 8) for (let x = (y / 8 % 2) * 5 + 2; x < 160; x += 10) pdot(b, x, y, mix('#363C5C', '#D8C8B2', q));
      const sw = ((s * .9) % 1) * 260 - 60; pbeam(b, sw, sw + 24, 0, 70, -.6, '#FFE0A0', .3 * day);
      phourglass(b, 64, 14, 52, lerp(.15, .6, k / 2.1), s);
      pjar(b, 118, 66, 2, { fill: .3, slips: 3 });
      pbokeh(b, s, 160, 90, 91, 6, ['#FFE0B0', '#FFFFFF'], .12 * day);
    });
  }, { tr: { type: 'flash', dur: .4 } });

  // C1b：窗台上的罐子，窗外从下雪到开花（日夜飞快地换）；做完的心愿一张张摊开、打钩
  scene('C1b', Lc(8, 3) - .3, (g, s, k) => {
    const yr = clamp(k / 1.9);
    shot(g, 'c1b', 160, 90, 12, (b, gl) => {
      const day = Math.round((.5 + .5 * Math.sin(s * 9)) * 3) / 3;
      prect(b, 0, 0, 160, 90, '#E8DCCA');
      // 窗
      b.save(); b.beginPath(); b.rect(14, 4, 132, 50); b.clip();
      psky(b, 160, 60, [[0, mix(mix('#0E1534', '#7AB0DC', day), '#9CC8E8', yr * day)], [1, mix('#2E3462', '#E8F0F2', day)]]);
      if (yr < .55) psnow(b, s, 160, 60, { n: 50, v: 16, seed: 15, bigRate: .3 });
      // 伸进窗口的一根树枝：先是雪，后是花
      pline(b, 150, 14, 110, 20, '#5A4436'); pline(b, 110, 20, 70, 14, '#5A4436'); pline(b, 110, 20, 96, 30, '#5A4436');
      for (let i = 0; i < 14; i++) { const u = i / 13, bx = ri(lerp(148, 72, u)), by = ri(lerp(14, 18, u) + Math.sin(u * 6) * 4); const bl = clamp(yr * 2.4 - hash(i, 3) * 1.2); if (bl > .4) { pdot(b, bx, by - 1, '#FFC0D4'); pdot(b, bx - 1, by, '#FFC0D4'); pdot(b, bx + 1, by, '#FFC0D4'); pdot(b, bx, by + 1, '#FFC0D4'); pdot(b, bx, by, '#FFE38A'); } else prect(b, bx - 1, by - 1, 3, 1, '#F4F7FB'); }
      b.restore();
      prect(b, 12, 2, 136, 2, '#F4EEE4'); prect(b, 12, 54, 136, 3, '#F4EEE4'); prect(b, 12, 4, 2, 50, '#F4EEE4'); prect(b, 146, 4, 2, 50, '#F4EEE4'); prect(b, 79, 4, 2, 50, '#F4EEE4');
      prect(b, 6, 57, 148, 4, '#D8CCBA');
      pjar(b, 26, 57, 1.6, { fill: .3, slips: 3 - Math.min(2, Math.floor(yr * 2.2)) });
      // 做完的心愿：第一张摊开、打钩，第二张从右边滑进来把它推出去，再打钩
      const out = E.io(seg(k, .95, 1.25)), x1 = ri(lerp(92, -60, out)), x2 = ri(lerp(220, 92, out));
      if (k > .2 && out < 1) pslip(b, x1, ri(lerp(70, 64, E.out(seg(k, .2, .45)))), 84, '一起看一场雪', 1, { check: seg(k, .45, .85) });
      if (out > 0) pslip(b, x2, 64, 84, '牵手走过沙丘', 1, { check: seg(k, 1.3, 1.7) });
    });
  }, { tr: { type: 'dither', dur: .35 } });

  // C1c：春天，路灯下的雪人化了；"有尽头"时两颗红豆眼睛掉进水洼里；地上冒出小芽
  scene('C1c', CUT(9), (g, s, k) => {
    const melt = lerp(.25, 1, E.io(clamp(k / 3.2)));
    shot(g, 'c1c', 160, 90, 12, (b, gl) => {
      psky(b, 160, 60, [[0, '#8EC1E6'], [1, '#E6F0EE']]);
      pcloud(b, 20, 18, 40, '#FFFFFF', '#E0ECF4'); pcloud(b, 100, 10, 34, '#FFFFFF', '#E0ECF4');
      for (let x = 0; x < 160; x++) { const top = ri(46 - (noise1(x / 30, 7) * .5 + .5) * 8); prect(b, x, top, 1, 54 - top, '#9CB7A8'); }
      prect(b, 0, 52, 160, 38, '#A9C79A'); for (let i = 0; i < 30; i++) pdot(b, hash(i, 8) * 160, 54 + hash(i, 9) * 30, ['#FFFFFF', '#FFD6E0', '#FFE9A8'][i % 3]);
      pell(b, 34, 58, 12, 2, '#EEF3F8'); pell(b, 132, 64, 10, 2, '#EEF3F8');
      streetLamp(b, gl, 120, 70, 64, 0);
      psnowman(b, 70, 70, melt, seg(s, Lc(9, 7) - .2, Lc(9, 7) + .5), s);
      for (let i = 0; i < 6; i++) { const ph = ((s * 1.2 + i / 6) % 1); pdot(b, 62 + i * 3, 52 + ri(ph * 16), rgba('#BED7F0', .8 * (1 - ph))); }
      for (let i = 0; i < 5; i++) { const gx = 30 + i * 22, hgt = ri(4 * E.out(seg(k, .5 + i * .3, 1.4 + i * .3))); if (hgt > 0) { prect(b, gx, 72 - hgt, 1, hgt, '#6EA058'); pdot(b, gx - 1, 72 - hgt, '#86B866'); pdot(b, gx + 1, 72 - hgt, '#86B866'); } }
    });
  }, { tr: { type: 'mosaic', dur: .45, max: 30 } });

  // C1d：站台上分别——她站在车门里，他在站台上；"都有时候"车门关上，红线从门缝里穿过去
  scene('C1d', CUT(10), (g, s, k) => {
    const door = E.io(seg(s, Lc(10, 4) - .25, Lc(10, 4) + .45));
    shot(g, 'c1d', 320, 180, 6, (b, gl) => {
      stationBg(b, gl, s, { time: 'grey' });
      const reach = seg(k, .3, 1.2);
      trainCar(b, 40, 250, { doorX: 96, door, inFn: (bb, dx) => { prect(bb, dx - 11, 68, 22, 60, '#4A4250'); monAt(bb, dx - 12, 128, { who: 'she', eyes: door > .5 ? 'dn' : 'r', armR: reach > .5 ? 'reach' : 'n' }, 1); } });
      platform(b, gl, s, { time: 'grey', signX: 256, clockX: 196 });
      pspr(b, suitcase(), 74, 119);
      monAt(b, 160, 152, { who: 'he', eyes: 'l', armL: seg(k, .5, 1.5) > .5 ? 'reach' : 'n', mouth: '' }, 1);
      // 红线：她的手 → （门缝）→ 他的手
      const a = [146, 117], hb = [153, 141];
      if (door > .6) pcurve(b, 136, 118, 144, 134, hb[0], hb[1], RED);
      else pcurve(b, a[0], a[1], (a[0] + hb[0]) / 2, (a[1] + hb[1]) / 2 + 8, hb[0], hb[1], RED);
      drift(s, 320, 180, { n: 12, v: 10, vx: -14, seed: 101 }, (x, y) => { pdot(b, x, y, '#C8904A'); pdot(b, x + 1, y, '#B87A3A'); });
    });
  }, { tr: { type: 'whip', dur: .45 } });

  // C1e：火车开走了，他一个人站在站台上，红线越拉越长
  scene('C1e', CUT(11), (g, s, k) => {
    const go = ri(Math.pow(clamp(k / 3.3), 2.2) * 420);
    shot(g, 'c1e', 320, 180, 6, (b, gl) => {
      stationBg(b, gl, s, { time: 'grey' });
      trainCar(b, 40 + go, 250, { doorX: 96, door: 1 }); trainCar(b, 40 + go - 254, 250, { doorX: 120, door: 1 });
      platform(b, gl, s, { time: 'grey', signX: 256, clockX: 196 });
      const sad = k > 2.2;
      monAt(b, 160, 152, { who: 'he', eyes: sad ? 'sad' : 'r', armR: 'reach' }, 1);
      const hx = 183, hy = 141, ex = 136 + go < 330 ? 136 + go : 330, ey = 120;
      pcurve(b, hx, hy, (hx + ex) / 2, (hy + ey) / 2 + 6 * (1 - clamp(k / 2)), ex, ey, RED);
      drift(s, 320, 180, { n: 22, v: 12, vx: -40 - go * .2, seed: 102 }, (x, y) => { pdot(b, x, y, '#C8904A'); pdot(b, x + 1, y, '#B87A3A'); });
    });
  }, { tr: { type: 'dither', dur: .3 } });

  // C1f：夜里，他一个人坐在窗边，手里是那张"一起看一场雪"
  scene('C1f', CUT(12), (g, s, k) => {
    shot(g, 'c1f', 240, 135, 8, (b, gl) => {
      room(b, gl, s, { mood: 'night', lampOn: .3, outside: (bb, x, y, w, h) => outsideMoon(bb, x, y, w, h, s),
        sill: (bb, x, y, w) => { pjar(bb, x + 14, y, 1, { fill: .26, slips: 1 }); phourglass(bb, x + 48, y - 18, 18, .7, s); } });
      pbeam(b, RM.winX, RM.winX + RM.winW, RM.winY + RM.winH, 135, .9, '#AABEFF', .16);
      prect(b, 94, 112, 18, 2, '#9A7254'); prect(b, 95, 114, 2, 10, '#9A7254'); prect(b, 109, 114, 2, 10, '#9A7254'); prect(b, 110, 98, 2, 14, '#9A7254');
      monAt(b, 92, 114, { who: 'he', sit: 1, eyes: 'dn', armL: 'front', armR: 'front' }, 1);
      prect(b, 96, 106, 12, 6, '#F7EFDF'); prect(b, 96, 111, 12, 1, '#E4D6BC'); pdot(b, 97, 107, RED); prect(b, 99, 108, 7, 1, '#B8A88E');
      roomShade(b, 'night', 50, 60);
    }, { zoom: lerp(1, 1.3, E.io(clamp(k / 3.8))), cx: lerp(120, 92, E.io(clamp(k / 3.8))), cy: lerp(67.5, 84, E.io(clamp(k / 3.8))) });
  }, { tr: { type: 'black', dur: .5 } });

  // C1g：他把红线一圈圈绕在胳膊上、攥紧；镜头顺着线往右，线跨过一片屋顶，一直伸到远处山坡上的一列夜车
  scene('C1g', CUT(13), (g, s, k) => {
    const camX = ri(E.io(clamp((k - .7) / 2.3)) * 320);
    const tx = ri(540 + k * 5);
    shot(g, 'c1g', 640, 180, 6, (b, gl) => {
      // 远处山坡和一列亮着灯的小火车（在屋顶后面）
      rooftops(b, gl, s, { pan: 0, far: bb => {
        for (let x = 380; x < 640; x++) { const top = ri(92 - Math.sin((x - 380) / 90) * 14); prect(bb, x, top, 1, 180 - top, '#1A1F40'); }
        for (let i = 0; i < 5; i++) { const cx = tx + i * 10, cy = ri(92 - Math.sin((cx + 5 - 380) / 90) * 14) - 6; prect(bb, cx, cy, 9, 5, '#2A2F50'); prect(bb, cx + 1, cy + 1, 7, 2, '#FFD290'); if (gl) prect(gl, cx + 1, cy + 1, 7, 2, 'rgba(255,200,120,.9)'); }
      } });
      // 左边：他站在窗口，把线一圈圈绕在胳膊上
      prect(b, 0, 70, 64, 110, '#232848'); prect(b, 6, 80, 50, 60, '#3A3F5C'); prect(b, 4, 78, 54, 2, '#D9D0C2'); prect(b, 4, 140, 54, 3, '#D9D0C2');
      if (gl) prect(gl, 6, 80, 50, 60, 'rgba(255,200,130,.25)');
      const wind = Math.round(E.out(seg(k, .1, 1.3)) * 4);
      monAt(b, 18, 140, { who: 'he', armR: 'reach', eyes: wind >= 4 ? 'shut' : 'r' }, 1);
      for (let i = 0; i < wind; i++) prect(b, 35 + i * 2, 127, 1, 6, RED);
      const ty = ri(92 - Math.sin((tx + 25 - 380) / 90) * 14) - 4, path = [[41, 130], [90, 126], [160, 116], [270, 104], [420, 92], [tx + 25, ty]];
      ppath(b, path, RED);
      if (gl) ppath(gl, path, 'rgba(255,90,110,.6)');
    }, { camX });
  }, { tr: { type: 'dither', dur: .4 } });

  // C1h：夜车上的她，看着窗外飞过去的风景；手上的红线轻轻一拽，她笑了
  scene('C1h', CUT(14), (g, s, k) => {
    const tug = seg(s, Lc(14, 3), Lc(14, 3) + .5), smile = seg(s, Lc(14, 4), Lc(14, 5));
    shot(g, 'c1h', 160, 90, 12, (b, gl) => {
      prect(b, 0, 0, 160, 90, '#4A3C48'); prect(b, 0, 70, 160, 20, '#3A2E38');
      trainView(b, gl, s, 8, 8, 92, 56, 1);
      prect(b, 6, 6, 96, 2, '#2A2228'); prect(b, 6, 64, 96, 3, '#2A2228'); prect(b, 6, 8, 2, 56, '#2A2228'); prect(b, 100, 8, 2, 56, '#2A2228');
      // 玻璃上她的倒影
      b.save(); b.globalAlpha = .18; monAt(b, 56, 58, { who: 'she', eyes: 'l' }, 1); b.restore();
      if (gl) pdisc(gl, 140, 6, 16, 'rgba(255,200,128,.4)');
      monAt(b, 104, 82, { who: 'she', eyes: smile > .6 ? 'happy' : 'l', blush: smile > .3 ? 1 : 0, armL: 'reach' }, 2);
      // 手上的红线，从窗户穿出去
      const ax = 104 - 8 - 4 * 2 + 2, ay = 82 - 32 + 10, dy = ri(Math.sin(Math.PI * tug) * -3);
      prect(b, ax, ay - 2, 2, 6, RED);
      ppath(b, [[ax, ay + dy], [70, 46 + dy], [40, 40], [8, 38]], RED);
      if (gl) ppath(gl, [[ax, ay + dy], [70, 46 + dy], [40, 40], [8, 38]], `rgba(255,90,110,${.4 + tug * .5})`);
    });
  }, { tr: { type: 'push', dur: .5, dir: 1 } });

  // C1i：早晨，她回来了——跳下车，跑过站台，扑过来抱住他
  scene('C1i', CUT(15), (g, s, k) => {
    const run = seg(k, .2, 1.4), hug = seg(k, 1.3, 1.6);
    shot(g, 'c1i', 320, 180, 6, (b, gl) => {
      stationBg(b, gl, s, { time: 'dawn' });
      trainCar(b, -60, 250, { doorX: 150, door: 0, col: '#EDE6D6' });
      platform(b, gl, s, { time: 'dawn', signX: 270, clockX: 220, pillars: [12, 308] });
      const sx = ri(lerp(80, 166, E.io(run)));
      if (hug < 1) {
        monAt(b, sx, 152 - (run > 0 && run < 1 ? (Math.floor(s * 8) % 2) : 0), { who: 'she', eyes: 'happy', blush: 1, legs: run > 0 && run < 1 ? walkLeg(s, 10) : 0, armR: run > .7 ? 'hug' : 'n' }, 1);
        monAt(b, 196, 152, { who: 'he', eyes: run > .5 ? 'happy' : 'l', armL: run > .6 ? 'hug' : 'n', blush: run > .6 ? 1 : 0 }, 1);
      } else {
        monAt(b, 196, 152, { who: 'he', eyes: 'shut', armL: 'hug', blush: 1 }, 1);
        monAt(b, 172, 152, { who: 'she', eyes: 'shut', armR: 'hug', blush: 1, lean: 1 }, 1);
        for (let i = 0; i < 5; i++) { const u = seg(s, CUT(15) + 1.6 + i * .2, CUT(15) + 2.6 + i * .2); if (u > 0 && u < 1) pheart(b, 186 + (i - 2) * 6, 128 - u * 26, rgba('#FF5A78', 1 - u)); }
      }
    }, { zoom: lerp(1, 1.5, E.io(seg(k, 1.2, 2.2))), cx: lerp(160, 190, E.io(seg(k, 1.2, 2.2))), cy: lerp(90, 120, E.io(seg(k, 1.2, 2.2))) });
  }, { tr: { type: 'wipe', dur: .6, dir: -1 } });

  // C1j：两个人沿着一条小溪往日出走（"细水长流"），一直到间奏
  scene('C1j', Lc(15, 7) - .3, (g, s, k) => {
    shot(g, 'c1j', 320, 180, 6, (b, gl) => {
      streamSet(b, gl, s, { time: 'sunrise', sunX: 172, sunY: ri(94 - k * 4), rock: false });
      pbirds(b, s, ri(-20 + k * 34), ri(40 - k * 2), 7, 1);
      const u = .78 - k * .07, [cx, cy, cw] = streamC(u), px = ri(cx + cw / 2 + 8), py = ri(cy);
      monAt(b, px, py, { who: 'she', back: 1, armR: 'hold', legs: walkLeg(s, 4) }, 1);
      monAt(b, px + 28, py + 1, { who: 'he', back: 1, armL: 'hold', legs: walkLeg(s + .4, 4) }, 1);
    }, { zoom: 1 + k * .03, cx: 160, cy: 96 });
  }, { tr: { type: 'dither', dur: .8 } });
});
