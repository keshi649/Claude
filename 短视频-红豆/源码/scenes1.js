'use strict';
/* scenes1.js —— 前奏（0 ~ 15.8 秒）和第一段主歌（"还没好好的感受" ~ "天长和地久"）。
   前奏："闪回到未来"——一颗像素红豆一直落在画面中间同一个位置，背后一拍左右换一个后面真会出现的镜头（直接借后面镜头的画面函数），
   每次的转场都不一样（像素风：抖动溶解、马赛克、方块圆孔、台阶擦除、百叶窗……），最后落进她举起的手里，片名出来。 */

/* 一个镜头：把场景画进 w×h 的像素缓冲，再放大 P 倍贴满屏幕（o.camX/camY 视野左上角，或 o.zoom/cx/cy 推拉） */
function shot(g, name, w, h, P, fn, o = {}) {
  const b = pbuf(name, w, h), gl = glowBuf(name, w, h);
  fn(b, gl);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  if (o.zoom) {
    // 推近时视野不出画框（不露黑边）；拉远到比画框还大时（片头那颗红豆）不管
    const hw = W / 2 / (P * o.zoom), hh = H / 2 / (P * o.zoom);
    const cx = hw * 2 <= w ? clamp(o.cx, hw, w - hw) : o.cx, cy = hh * 2 <= h ? clamp(o.cy, hh, h - hh) : o.cy;
    blitZoom(g, name, P, o.zoom, cx, cy); glowBlitZoom(g, name, P, o.zoom, cx, cy, o.glow ?? .8, o.rad ?? 2);
  }
  else { blit(g, name, P, o.camX || 0, o.camY || 0); glowBlit(g, name, P, o.camX || 0, o.camY || 0, o.glow ?? .8, o.rad ?? 2); }
}
/* 前奏用：借后面某个镜头的画面（at：那个镜头开始后第几秒；rate：时间流多快） */
function peek(id, at, rate = 1) {
  return (g, s, k) => {
    const sc = SCENES.find(x => x.id === id);
    if (!sc) { g.fillStyle = '#333'; g.fillRect(0, 0, W, H); ptext(g, id, W / 2, H / 2, 6, '#fff', { align: 'center' }); return; }
    const kk = at + k * rate;
    window.PEEK = true; sc.draw(g, sc.a + kk, kk); window.PEEK = false;
  };
}
/* 前奏里一直往下落的那颗红豆（画在最上层，转场时也不动）：屏幕上按 6 倍像素画 */
const BEAN_X = 960, BEAN_Y = 456;
function fallingBean(g, s) {
  if (s > 14.25 || s < 1.6) return;
  let y = BEAN_Y, x = BEAN_X + ri(Math.sin(s * 1.1) * 2) * 6;
  if (s > 13.5) y = lerp(BEAN_Y, 690, E.in2(seg(s, 13.5, 14.25)));
  const b = pbuf('fbean', 24, 40), gl = glowBuf('fbean', 24, 40);
  for (let i = 1; i <= 5; i++) prect(b, 11, 20 - i * 3, 2, 2, rgba('#FF8890', .35 * (1 - i / 6)));       // 落下来的光迹
  pbeanRot(b, 12, 24, 4.5, -.6 + s * 1.1, gl);
  const X = ri(x / 6) * 6 - 12 * 6, Y = ri(y / 6) * 6 - 24 * 6;
  g.save(); g.imageSmoothingEnabled = false; g.drawImage(BUF.fbean, X, Y, 24 * 6, 40 * 6); g.restore();
  g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = .8; g.imageSmoothingEnabled = true; g.filter = 'blur(10px)'; g.drawImage(BUF.glow_fbean, X, Y, 24 * 6, 40 * 6); g.restore();
  // 周围往上飘的光点（看起来像在落）
  for (let i = 0; i < 10; i++) { const u = ((s * 1.6 + i / 10) % 1), px = ri((x + (hash(i, 7) - .5) * 520) / 6) * 6, py = ri((y + 260 - u * 520) / 6) * 6; g.fillStyle = `rgba(255,236,220,${(.35 * Math.sin(Math.PI * u)).toFixed(2)})`; g.fillRect(px, py, 6, 18); }
}
/* 像素的光斑（散景）：几个半透明的圆 */
function pbokeh(b, t, w, h, seed, n, cols, a = .25) {
  for (let i = 0; i < n; i++) { const x = hash(i, seed) * w + Math.sin(t * .3 + i) * 3, y = hash(i, seed + 1) * h + Math.cos(t * .25 + i) * 3, r = 3 + hash(i, seed + 2) * 7; pdisc(b, x, y, r, rgba(cols[i % cols.length], a * (.6 + .4 * Math.sin(t + i)))); }
}

SCENES_DEF.push(() => {
  // ---------- 前奏 ----------
  // I0：一开场就是一颗很大的像素红豆，在暖色光斑里慢慢翻转、放射着光；1.45 秒镜头猛地拉远
  scene('I0', 0, (g, s, k) => {
    const pull = E.in(seg(s, 1.4, 1.85));
    shot(g, 'i0', 96, 54, 20, (b, gl) => {
      for (let r = 60; r > 0; r -= 4) pdisc(b, 48, 27, r, mix('#14080E', '#5A1C2A', Math.pow(1 - r / 60, 1.4)));
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + s * .15; for (let d = 12; d < 60; d += 1) if ((d + i) % 3 !== 0) pdot(b, 48 + Math.cos(a) * d, 27 + Math.sin(a) * d, rgba('#FF8A8A', .16 * (1 - d / 60))); }
      pbokeh(b, s, 96, 54, 3, 14, ['#FF9A7A', '#FFD3A0', '#FF5A6A', '#FFE9C8'], .18);
      for (let i = 0; i < 16; i++) { const u = ((s * .25 + i / 16) % 1); pdot(b, hash(i, 9) * 96, 54 - u * 60, rgba('#FFE0D0', .6 * Math.sin(Math.PI * u))); }
      pbeanRot(b, 48, 27, 11, -.6 + s * 1.1, gl);
    }, { zoom: lerp(1, .22, pull), cx: 48, cy: 27, glow: .9, rad: 3 });
  }, {});
  // I1~I9：闪回（借后面镜头的画面），每次的转场都不一样
  const flash = [
    ['I1', 1.72, 'V1c', 1.2, { type: 'flash', dur: .5 }],
    ['I2', 3.08, 'V1f', 1.6, { type: 'whip', dur: .45 }],
    ['I3', 4.62, 'V2a', 1.8, { type: 'bean', dur: .6, cx: BEAN_X, cy: BEAN_Y }],
    ['I4', 5.65, 'C1h', 1.4, { type: 'mosaic', dur: .5 }],
    ['I5', 7.40, 'V2h', 2.6, { type: 'push', dur: .5, dir: -1 }],
    ['I6', 9.17, 'C2e', 1.9, { type: 'flash', dur: .32, pre: .08 }],
    ['I7', 10.53, 'X2', 4.0, { type: 'dither', dur: .5 }],
    ['I8', 11.52, 'C3f', 1.6, { type: 'blinds', dur: .5 }],
    ['I9', 12.63, 'O1', 2.0, { type: 'wipe', dur: .5 }],
  ];
  for (const [id, a, src, at, tr] of flash) scene(id, a, peek(src, at, id === 'I7' ? 2.5 : 1), { tr, over: (g, s) => fallingBean(g, s) });
  // I10：红豆落下来，她举起手接住；片名
  scene('I10', 13.50, (g, s, k) => {
    const land = 14.25, got = s >= land;
    shot(g, 'i10', 160, 90, 12, (b, gl) => {
      psky(b, 160, 90, [[0, '#FFF2E4'], [1, '#F4D2C0']]);
      pbokeh(b, s, 160, 90, 13, 12, ['#FFFFFF', '#FFE2C8', '#FFC9C0'], .35);
      const up = E.out(seg(s, 13.45, 13.9));
      const y0 = ri(lerp(110, 82, up));
      monAt(b, 68, y0, { who: 'she', armL: 'up', armR: 'up', eyes: got ? 'happy' : 'up', blush: got ? 1 : 0 }, 1);
      if (got) { const bo = ri(Math.exp(-(s - land) * 8) * Math.abs(Math.sin((s - land) * 20)) * 4); pbeanRot(b, 80, y0 - 19 - bo, 3.2, .4 + (s - land) * .5, gl); for (let i = 0; i < 4; i++) { const u = seg(s, land + i * .12, land + .9 + i * .12); if (u > 0 && u < 1) pheart(b, 70 + i * 6, y0 - 22 - u * 18, rgba('#FF5A78', 1 - u)); } }
    }, { glow: .8 });
    if (!got) fallingBean(g, s);
    // 片名：像素大字"红豆"（红）+"方大同"
    const ta = seg(s, 14.3, 14.75), tb = seg(s, 14.7, 15.1);
    if (ta > 0) {
      const q = Math.ceil(ta * 4) / 4;                  // 分 4 级"冒"出来
      ptext(g, '红豆', 960, 120 + ri((1 - q) * 4) * 12, 16, '#C81E32', { align: 'center', alpha: q, ol: '#FFF6EE', shadow: '#7A1020' });
      ptext(g, '方大同', 960, 360, 5, '#6B3A34', { align: 'center', alpha: tb });
    }
  }, { tr: { type: 'iris', dur: .5, cx: BEAN_X, cy: BEAN_Y } });

  // ---------- 第一段主歌 ----------
  // V1a：特写——桌上的纸条，她（粉色的手）握着铅笔写"一起看一场雪"
  scene('V1a', CUT(0), (g, s, k) => {
    shot(g, 'v1a', 160, 90, 12, (b, gl) => {
      prect(b, 0, 0, 160, 90, '#7A5640');
      for (let y = 4; y < 90; y += 9) { prect(b, 0, y, 160, 1, '#6A4834'); for (let x = 0; x < 160; x += 37) pdot(b, x + (y % 7), y + 3, '#86624A'); }
      pdisc(b, 76, 44, 70, 'rgba(255,200,130,.10)'); pdisc(b, 76, 44, 46, 'rgba(255,200,130,.08)');
      pmug(b, 134, 22, s); for (let i = 0; i < 6; i++) pbean(b, 14 + hash(i, 1) * 26, 66 + hash(i, 2) * 14, 1);
      proll(b, 118, 70, 12); proll(b, 124, 76, 12);
      const rev = seg(s, Lt(0) - .1, Lc(0, 6) + .3), n = 6;
      pslip(b, 76, 44, 100, '一起看一场雪', rev, { h: 22 });
      // 握着铅笔的手（她的胳膊：粉色方块）跟着写到的字往右
      const cw = textW12('一起看一场雪') / n, px = ri(34 + Math.min(rev * n, n - .2) * cw + 2 + Math.sin(s * 14) * (rev < 1 ? 1 : 0)), py = 50;
      pline(b, px, py, px + 9, py - 12, '#2C2A33'); pline(b, px + 1, py, px + 10, py - 12, '#2C2A33'); prect(b, px + 8, py - 14, 3, 3, RED); pdot(b, px, py + 1, '#C9B48A');
      prect(b, px + 5, py - 8, 9, 8, MON.she); prect(b, px + 5, py - 8, 9, 1, shade(MON.she, 1.15)); prect(b, px + 13, py - 10, 30, 12, MON.she); prect(b, px + 13, py + 1, 30, 1, shade(MON.she, .8));
    });
  }, { tr: { type: 'dither', dur: .5 } });

  // V1a2：冬夜的屋里——她卷好纸条放进红豆罐；他端着两杯热茶走进来；窗外开始下雪
  scene('V1a2', Lc(0, 5) - .25, (g, s, k) => {
    shot(g, 'v1a2', 240, 135, 8, (b, gl) => {
      room(b, gl, s, { mood: 'night', outside: (bb, x, y, w, h) => outsideSnow(bb, x, y, w, h, s, seg(s, Lt(1) - .8, Lt(1) + .5)), lampX: 140 });
      // 椅子、桌子
      prect(b, 70, 112, 18, 2, '#5E4334'); prect(b, 71, 114, 2, 10, '#5E4334'); prect(b, 85, 114, 2, 10, '#5E4334'); prect(b, 70, 98, 2, 14, '#5E4334');
      const drop = seg(s, Lt(0) + 2.4, Lt(0) + 3.2);
      monAt(b, 72, 114, { who: 'she', sit: 1, eyes: 'r', armR: drop > 0 && drop < 1 ? 'up' : 'reach', blush: drop >= 1 ? 1 : 0 }, 1);
      prect(b, 98, 110, 64, 3, '#7B5843'); prect(b, 100, 113, 2, 12, '#5E4334'); prect(b, 158, 113, 2, 12, '#5E4334');
      pjar(b, 122, 110, 1.15, { fill: .3, slips: 2 + (drop >= 1 ? 1 : 0) });
      if (drop < 1) { const hx = 99, hy = lerp(103, 98, drop); proll(b, hx + drop * 18, hy - drop * 4 + E.in2(drop) * 8, 6, drop > .5); }
      pmug(b, 146, 110, s);
      // 他端着两杯茶进来
      const wk = seg(s, Lt(0) + 2.2, Lt(0) + 4.4), hx = ri(lerp(250, 184, E.out(wk)));
      monAt(b, hx, 124, { who: 'he', armL: 'front', armR: 'front', eyes: 'l', legs: wk > 0 && wk < 1 ? walkLeg(s) : 0 }, 1);
      pmug(b, hx - 2, 118, s, '#D8C9B4'); pmug(b, hx + 12, 118, s, '#D8C9B4');
      roomShade(b, 'night', 140, 70);
    });
  }, { tr: { type: 'mosaic', dur: .45, max: 30 } });

  // V1b：雪夜小镇——雪花一边落一边开成小花；两个人推门出来，抬头看雪
  scene('V1b', CUT(1), (g, s, k) => {
    const camY = ri(lerp(36, 30, E.io(clamp(k / 3.6))));
    shot(g, 'v1b', 320, 216, 6, (b, gl) => {
      b.save(); b.translate(0, 30); town(b, gl, s, { lamps: [[226, 64]], gy: 140 }); b.restore();
      prect(b, 92, 152, 10, 18, '#FFC774'); if (gl) prect(gl, 92, 152, 10, 18, 'rgba(255,190,100,.7)');
      const out = E.out(seg(s, Lt(1) + .5, Lt(1) + 2.4));
      monAt(b, ri(lerp(92, 116, out)), 176, { who: 'he', eyes: out >= 1 ? 'up' : 'r', legs: out > 0 && out < 1 ? walkLeg(s) : 0 }, 1);
      monAt(b, ri(lerp(92, 146, out)), 177, { who: 'she', eyes: out >= 1 ? 'up' : 'r', armR: out >= 1 ? 'hi' : 'n', legs: out > 0 && out < 1 ? walkLeg(s + .3) : 0 }, 1);
      psnow(b, s, 320, 216, { n: 160, v: 12, bloom: 1, seed: 21, bigRate: .35 });
    }, { camY });
  }, { tr: { type: 'dither', dur: .5 } });

  // V1c：路灯下、雪人旁（眼睛是两颗红豆），冻得直哆嗦；她把长长的红围巾绕过来，一条围巾围两个人
  scene('V1c', CUT(2), (g, s, k) => {
    shot(g, 'v1c', 320, 180, 6, (b, gl) => {
      town(b, gl, s, { lamps: [[196, 70]], gy: 128, moonX: 40, moonY: 30 });
      psnowman(b, 104, 150, 0, 0, s);
      const shiv = i => (Math.floor(s * 18 + i) % 2);
      const wrap = E.io(seg(s, Lt(2) + .9, Lt(2) + 2.2));
      const hx = 140 + shiv(0), sx = 166 + shiv(1);
      monAt(b, hx, 150, { who: 'he', eyes: 'happy', blush: 1, scarf: wrap > .85 ? 1 : 0 }, 1);
      monAt(b, sx, 150, { who: 'she', eyes: 'happy', blush: 1, scarf: 1 }, 1);
      // 一条长围巾：从她脖子绕到他脖子
      if (wrap < .85) { const ex = ri(lerp(sx, hx + 12, wrap)); prect(b, Math.min(ex, sx), 142, Math.abs(sx - ex) + 2, 2, RED); }
      else prect(b, hx + 16, 142, sx - hx - 16, 2, RED);
      pbreath(b, hx + 18, 138, s, Lt(2) + .2, 1); pbreath(b, sx, 138, s, Lt(2) + 1.3, -1); pbreath(b, hx + 18, 138, s, Lt(2) + 2.0, 1);
      psnow(b, s, 320, 180, { n: 110, v: 10, bloom: 1, seed: 31 });
    }, { zoom: 4 / 3, cx: 156, cy: 112 });
  }, { tr: { type: 'mosaic', dur: .45, max: 24 } });

  // V1d：近景——两个人一起捧着一杯热茶，呵着白气；"什么是温柔"时她把头靠到他身上
  scene('V1d', CUT(3), (g, s, k) => {
    const lean = E.io(seg(s, Lc(3, 4) - .3, Lc(3, 4) + .6));
    shot(g, 'v1d', 160, 90, 12, (b, gl) => {
      psky(b, 160, 90, [[0, '#1A2148'], [1, '#3A3A68']]);
      pbokeh(b, s, 160, 90, 41, 10, ['#FFC680', '#FFE0A8', '#9FB2FF'], .2);
      const hx = 26, sx = ri(lerp(88, 84, lean));
      monAt(b, hx, 76, { who: 'he', armR: 'front', eyes: lean > .5 ? 'happy' : 'r', blush: 1, scarf: 1 }, 2);
      monAt(b, sx, 76, { who: 'she', armL: 'front', eyes: lean > .4 ? 'shut' : 'happy', blush: 1, scarf: 1, lean: lean > .5 ? -1 : 0 }, 2);
      // 两个人中间捧着的那杯热茶
      const mx = ri((hx + 32 + sx) / 2) - 6;
      prect(b, mx, 56, 12, 11, '#EFE7DA'); prect(b, mx, 56, 12, 2, '#D8CFC0'); pbean(b, mx + 4, 61, 1); psteam(b, mx + 6, 54, s, 6, 16, .6);
      pbreath(b, hx + 36, 50, s, Lt(3) + .2, 1); pbreath(b, sx - 2, 50, s, Lt(3) + 1.6, -1);
      if (lean > .6) for (let i = 0; i < 3; i++) { const u = seg(s, Lc(3, 4) + .4 + i * .3, Lc(3, 4) + 1.6 + i * .3); if (u > 0 && u < 1) pheart(b, 76 + i * 6, 34 - u * 20, rgba('#FF5A78', 1 - u)); }
      psnow(b, s, 160, 90, { n: 30, v: 6, bloom: 1, seed: 43, bigRate: .5 });
    });
  }, { tr: { type: 'dither', dur: .4 } });

  // V1e："还没跟你牵着手"——两个人面对面伸出手，手一碰（全乐队进来的那一拍），系在手上的红线亮起来；
  // 背景从雪夜的蓝慢慢变成沙漠的金，雪变成风里的沙
  scene('V1e', CUT(4), (g, s, k) => {
    const warm = E.io(seg(s, Lt(4) + .3, Lt(5) - .2)), meet = E.io(seg(s, Lt(4) + .1, bar(8) - .1)), hit = seg(s, bar(8) - .05, bar(8) + .5);
    shot(g, 'v1e', 160, 90, 12, (b, gl) => {
      psky(b, 160, 90, [[0, mix('#1A2148', '#E8A07A', warm)], [1, mix('#3A3A68', '#F6D3A0', warm)]]);
      pbokeh(b, s, 160, 90, 51, 8, warm < .5 ? ['#FFC680', '#9FB2FF'] : ['#FFF0C8', '#FFC890'], .18);
      drift(s, 160, 90, { n: 40, v: lerp(8, 1, warm), vx: lerp(0, 40, warm), seed: 52 }, (x, y) => { if (warm < .5) pdot(b, x, y, rgba('#FFFFFF', .7 * (1 - warm * 2))); else prect(b, x, y, 2, 1, rgba('#FFE6BE', .7 * (warm * 2 - 1))); });
      const sx = ri(lerp(-30, 26, meet)), hx = ri(lerp(170, 86, meet));
      monAt(b, sx, 74, { who: 'she', armR: 'reach', eyes: 'r', blush: hit > 0 ? 1 : 0 }, 2);
      monAt(b, hx, 74, { who: 'he', armL: 'reach', eyes: 'l', blush: hit > 0 ? 1 : 0 }, 2);
      // 两只手碰在一起的地方：红线绕一圈，打个结，垂下来坠一颗红豆
      const ax = sx - 8 + 27 * 2, ay = 74 - 32 + 5 * 2;
      if (meet > .92) {
        prect(b, ax - 3, ay - 3, 2, 8, RED); prect(b, ax + 3, ay - 3, 2, 8, RED); prect(b, ax - 3, ay - 4, 8, 1, RED_L);
        if (gl) prect(gl, ax - 4, ay - 4, 10, 10, rgba('#FF6070', .4 + hit * .5));
        const sw = ri(Math.sin(s * 2) * 1.5); pline(b, ax + 1, ay + 5, ax + 1 + sw, ay + 14, RED); pbean(b, ax + sw, ay + 15, 1);
      } else { // 还没碰上：红线已经系在两只手上，松松地垂着
        const bx = hx - 8 - 4 * 2 + 2, by = ay;
        prect(b, ax - 2, ay - 3, 2, 8, RED); prect(b, bx, by - 3, 2, 8, RED);
        pcurve(b, ax, ay + 4, (ax + bx) / 2, ay + 4 + lerp(18, 2, meet), bx + 1, by + 4, RED);
      }
      if (hit > 0 && hit < 1) for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, d = 6 + hit * 30; pheart(b, ax + 1 + Math.cos(a) * d, ay + Math.sin(a) * d * .6, rgba('#FF5A78', 1 - hit)); }
    }, { glow: .9 });
  }, { tr: { type: 'dither', dur: .5 } });

  // V1f：黄昏的沙漠——两个人牵着手走在沙丘的脊线上，身后一串脚印
  scene('V1f', CUT(5), (g, s, k) => {
    shot(g, 'v1f', 320, 180, 6, (b, gl) => {
      const ridge = desert(b, gl, s, { pan: k * 8, sunX: 250, sunY: 92 });
      const wx = ri(110 + k * 12);
      for (let i = 1; i < 26; i++) { const fx = wx - 6 - i * 7; pdot(b, fx, ridge(fx) + 2 + (i % 2), '#B07048'); pdot(b, fx - 12, ridge(fx - 12) + 3 + (i % 2), '#B07048'); }
      monAt(b, wx, ridge(wx + 12) + 1, { who: 'she', armR: 'hold', eyes: 'r', legs: walkLeg(s, 5) }, 1);
      monAt(b, wx + 30, ridge(wx + 42) + 1, { who: 'he', armL: 'hold', eyes: 'happy', legs: walkLeg(s + .4, 5) }, 1);
    });
  }, { tr: { type: 'wipe', dur: .6 } });

  // V1g：沙漠的夜——篝火旁坐着；她把一颗红豆举向银河，"学会珍惜"时一颗流星划过
  scene('V1g', CUT(6), (g, s, k) => {
    shot(g, 'v1g', 320, 180, 6, (b, gl) => {
      const ridge = desert(b, gl, s, { night: true, ridgeY: 150 });
      pfire(b, gl, 110, ridge(110) + 2, s);
      const raise = E.io(seg(s, Lt(6) + .4, Lt(6) + 1.4)), lower = E.io(seg(s, Lc(6, 6) + .6, Lc(6, 6) + 1.6)), up = raise * (1 - lower);
      monAt(b, 140, ridge(152) + 2, { who: 'she', sit: 1, eyes: up > .3 ? 'up' : 'l', armR: up > .5 ? 'hi' : 'n', blush: lower > .5 ? 1 : 0 }, 1);
      monAt(b, 172, ridge(184) + 2, { who: 'he', sit: 1, eyes: up > .3 ? 'up' : 'l' }, 1);
      if (up > .5) pbeanRot(b, 165, ridge(152) - 22, 2, s, gl);
      // 流星
      const u = seg(s, Lc(6, 6) - .1, Lc(6, 6) + 1.0);
      if (u > 0 && u < 1) { const x = ri(40 + u * 160), y = ri(16 + u * 40); for (let i = 0; i < 14; i++) pdot(b, x - i * 2, y - i * .5 | 0, rgba('#FFF2E0', (1 - i / 14) * Math.sin(Math.PI * u))); if (gl) pdisc(gl, x, y, 3, 'rgba(255,255,255,.9)'); }
    });
  }, { tr: { type: 'black', dur: .5 } });

  // V1h：镜头从沙丘上两个小小的背影往上摇到银河——"天长和地久"
  scene('V1h', CUT(7), (g, s, k) => {
    const tilt = E.io(clamp(k / 3.2)), camY = ri(lerp(120, 0, tilt));
    shot(g, 'v1h', 320, 300, 6, (b, gl) => {
      psky(b, 320, 300, [[0, '#04061A'], [.5, '#0D1238'], [.85, '#1E2052'], [1, '#2D2A5E']]);
      for (let i = 0; i < 1400; i++) { const u = hash(i, 61), off = (hash(i, 62) + hash(i, 63) + hash(i, 64) - 1.5) * 40; pdot(b, u * 320, 40 + u * 150 + off, rgba(hash(i, 65) < .3 ? '#C8B0F0' : '#E8E0FF', .2 + hash(i, 66) * .55)); }
      for (let i = 0; i < 24; i++) pdisc(b, hash(i, 67) * 320, 40 + hash(i, 67) * 150 + (hash(i, 68) - .5) * 30, 5 + hash(i, 69) * 6, 'rgba(160,130,220,.08)');
      pstars(b, s, 320, 280, 71, 260, 1);
      for (let x = 0; x < 320; x++) { const top = ri(272 - Math.sin(x / 80) * 8); prect(b, x, top, 1, 30, '#14162E'); }
      monSil(b, 150, ri(272 - Math.sin(150 / 80) * 8) + 2, { who: 'she', back: 1, sit: 1 }, 1, '#0A0C20');
      monSil(b, 172, ri(272 - Math.sin(172 / 80) * 8) + 2, { who: 'he', back: 1, sit: 1 }, 1, '#0A0C20');
    }, { camY });
  }, { tr: { type: 'dither', dur: .6 } });
});
