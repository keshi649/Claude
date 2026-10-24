'use strict';
/* scenes3.js —— 第二段主歌（"还没为你把红豆" ~ "你才追求 孤独的自由"，82.9 ~ 114.3 秒）：
   慢镜头里红豆从罐子倒进锅里；他揭锅盖烫了手指（"伤口"），她跑过来捧着他的手吹；一碗红豆汤、两把勺子；
   分开两地的分屏——两个窗口、同一个月亮，中间那条线是红的；早晨的光里他亲她的额头；
   阳台上她看着飞走的鸟；山坡上她拉着风筝往前跑，他站在后面笑着看，镜头跟着风筝飞上天。 */

/* 厨房（侧面）：灶台在左边，窗外下着雨 */
function kitchen(g, s, o = {}) {
  g.fillStyle = vgrad(g, 0, 760, [[0, '#E9DCC6'], [1, '#DCCBB0']]); g.fillRect(-200, -200, W + 400, 1000);
  // 瓷砖
  g.strokeStyle = rgba('#B8A488', .5); g.lineWidth = 2;
  for (let y = 420; y < 690; y += 46) { g.beginPath(); g.moveTo(-200, y); g.lineTo(W + 200, y); g.stroke(); }
  for (let x = -200; x < W + 200; x += 46) { g.beginPath(); g.moveTo(x, 420); g.lineTo(x, 690); g.stroke(); }
  // 窗（雨夜）
  windowFrame(g, 1180, 140, 420, 300, (gg, x, y, w, h) => { gg.fillStyle = vgrad(gg, y, y + h, [[0, '#1A2244'], [1, '#3A4068']]); gg.fillRect(x, y, w, h); rain(gg, s, 60, { box: [x, y, x + w, y + h], col: 'rgba(200,215,255,.35)', len: 30, sp: 900 }); for (let i = 0; i < 8; i++) { gg.fillStyle = 'rgba(220,230,255,.3)'; const dy = ((s * 40 + i * 47) % h); ell(gg, x + 30 + i * 50, y + dy, 3, 6); gg.fill(); } }, { frame: '#F4EEE4' });
  // 吊柜、架子上的瓶瓶罐罐
  g.fillStyle = '#B98B62'; g.fillRect(100, 300, 700, 14);
  const cols = ['#E9E1D3', '#C9D8D0', '#E6C8B0', '#D8D0E0'];
  for (let i = 0; i < 6; i++) { g.fillStyle = cols[i % 4]; rr(g, 130 + i * 110, 210, 70, 90, 12); g.fill(); g.fillStyle = '#9A7050'; g.fillRect(140 + i * 110, 200, 50, 14); }
  // 台面
  g.fillStyle = '#F2EBE0'; g.fillRect(-200, 690, W + 400, 26);
  g.fillStyle = '#8A6A54'; g.fillRect(-200, 716, W + 400, 380);
  g.strokeStyle = rgba('#000000', .12); g.lineWidth = 3; for (let x = -100; x < W + 200; x += 260) { g.strokeRect(x, 740, 230, 300); g.beginPath(); g.moveTo(x + 100, 800); g.lineTo(x + 130, 800); g.stroke(); }
  // 灶
  g.fillStyle = '#4A4A50'; rr(g, 260, 670, 420, 24, 6); g.fill();
  if (o.flame !== false) for (let i = 0; i < 9; i++) { const fx = 470 + (i - 4) * 18; g.fillStyle = `rgba(90,150,255,${.7 + Math.sin(s * 20 + i) * .2})`; ell(g, fx, 664, 6, 10 + Math.sin(s * 17 + i * 2) * 3); g.fill(); }
  glow(g, 470, 660, 120, '#6A9AFF', .3);
}
/* 锅（侧面）：x 中心，y 锅底；lid 盖子揭开多少（0 盖着 ~ 1 拿起来） */
function pot(g, x, y, sc, s, lid = 0, steam = 1) {
  g.save(); g.translate(x, y);
  g.fillStyle = '#2E5A60'; rr(g, -140 * sc, -170 * sc, 280 * sc, 170 * sc, 26 * sc); g.fill();
  g.fillStyle = '#3E6E74'; g.fillRect(-140 * sc, -170 * sc, 280 * sc, 26 * sc);
  g.fillStyle = '#F2EBE0'; circ(g, -60 * sc, -80 * sc, 12 * sc); g.fill(); circ(g, 70 * sc, -100 * sc, 8 * sc); g.fill();
  g.fillStyle = '#2A2A2E'; rr(g, -176 * sc, -150 * sc, 40 * sc, 16 * sc, 6 * sc); g.fill(); rr(g, 136 * sc, -150 * sc, 40 * sc, 16 * sc, 6 * sc); g.fill();
  // 盖子
  const ly = -170 * sc - lid * 120 * sc, lx = lid * 120 * sc, lr = lid * .5;
  g.save(); g.translate(lx, ly); g.rotate(lr);
  g.fillStyle = '#3E6E74'; g.beginPath(); g.ellipse(0, 0, 150 * sc, 30 * sc, 0, Math.PI, TAU); g.fill(); g.fillStyle = '#2A2A2E'; rr(g, -22 * sc, -44 * sc, 44 * sc, 16 * sc, 6 * sc); g.fill();
  g.restore();
  g.restore();
  if (steam > 0) steamWisps(g, x, y - 180 * sc - lid * 40 * sc, 90 * sc, s, steam * (.6 + lid), 4);
}

SCENES_DEF.push(() => {
  // V2a：慢镜头——罐子一倾，红豆像下雨一样落进锅里
  scene('V2a', CUT(16), (g, s, k) => {
    g.fillStyle = rgrad(g, 960, 500, 100, 1300, [[0, '#6A4434'], [1, '#2A1A16']]); g.fillRect(0, 0, W, H);
    bokeh(g, s, 121, 18, ['#FFC680', '#FFE0A8', '#FF9A70'], { r0: 40, r1: 100, a: .3 });
    const z = 1 + k * .03;
    camera(g, 960, 540, z, () => {
      // 锅（俯视一点）：锅口是椭圆，里面是水
      const px = 1000, py = 760;
      g.fillStyle = '#2E5A60'; g.beginPath(); g.moveTo(px - 360, py); g.lineTo(px - 330, py + 300); g.lineTo(px + 330, py + 300); g.lineTo(px + 360, py); g.fill();
      g.fillStyle = '#3E6E74'; ell(g, px, py, 360, 90); g.fill();
      g.fillStyle = '#5A3A30'; ell(g, px, py + 8, 330, 76); g.fill();
      // 锅里的豆子越积越多
      const n = Math.floor(10 + k * 30);
      for (let i = 0; i < n; i++) bean(g, px + (hash(i, 1) - .5) * 520, py + 8 + (hash(i, 2) - .5) * 110, 16, hash(i, 3) * 6);
      // 水面的涟漪
      for (let i = 0; i < 4; i++) { const ph = ((s * .8 + i / 4) % 1); g.strokeStyle = `rgba(255,230,200,${.35 * (1 - ph)})`; g.lineWidth = 3; g.beginPath(); g.ellipse(px - 40, py + 10, 40 + ph * 260, (40 + ph * 260) * .22, 0, 0, TAU); g.stroke(); }
      // 罐子（倾斜着倒）
      const tilt = lerp(-1.6, -2.15, E.io(clamp(k / 1.2)));
      g.save(); g.translate(640, 330); g.rotate(tilt); jar(g, 0, 110, 1.3, { fill: .45, slips: 0, lid: false, tag: false, seed: 9 }); g.restore();
      // 一道"豆子瀑布"：从罐口到锅里，慢动作
      const mx = 640 + Math.cos(tilt + Math.PI / 2) * -150, my = 330 + Math.sin(tilt + Math.PI / 2) * -150;
      for (let i = 0; i < 46; i++) {
        const u = ((s * .55 + i / 46) % 1), sp = (hash(i, 7) - .5);
        const bx = lerp(mx + 40, px - 60 + sp * 180, u) + Math.sin(u * 3) * 40, by = my + 60 + u * u * (py - my - 40) + sp * 20;
        bean(g, bx, by, 15 + hash(i, 8) * 5, s * 2 * (hash(i, 9) - .5) + i);
        if (u > .92) { g.fillStyle = 'rgba(255,240,220,.5)'; circ(g, bx + (u - .92) * 400 * sp, by - (u - .92) * 300, 4); g.fill(); }
      }
      steamWisps(g, px + 100, py - 40, 120, s, .8, 4);
    });
  }, { tr: { type: 'bean', dur: .7, cx: 960, cy: 540 }, bloom: .35, grade: 'saturate(1.08)' });

  // V2b：厨房——他揭开锅盖，烫着手指（"伤口"）；她跑过来，捧着他的手吹一吹；锅里冒出的热气绕成一颗心
  scene('V2b', CUT(17), (g, s, k) => {
    camera(g, 700, 560, 1.6, () => {
      kitchen(g, s);
      const burn = Lc(17, 5);
      const lid = E.out(seg(s, burn - .7, burn - .1)) * (1 - E.in2(seg(s, burn, burn + .3)));
      pot(g, 470, 672, .85, s, lid, 1);
      // 他：站在灶台右边，朝左
      const jerk = seg(s, burn, burn + .25), hold = E.io(seg(s, burn + .45, burn + 1.0));
      const aN1 = s < burn ? lerp(20, 80, E.io(seg(s, burn - .9, burn - .5))) : lerp(80, 40, jerk) - hold * 0;
      const Ph = { who: 'he', u: 46, x: 700, y: 905, f: -1, out: OUTFIT.heHome, pose: pose('stand', { aN1, aN2: s < burn ? 20 : lerp(20, 100, jerk), hd: 8, tb: 6 }), light: LT.warm, t: s, eyes: jerk > 0 && jerk < 1 ? 'closed' : 'open', mouth: jerk > 0 && hold < .5 ? 'o' : 'smile' };
      // 她：从右边跑进来，捧住他的手
      const come = E.out(seg(s, burn + .1, burn + .8));
      const Ps = { who: 'she', u: 44, x: lerp(1300, 860, come), y: 905, f: -1, out: OUTFIT.sheHome, pose: come < 1 ? walkPose(s * 9, .5) : pose('stand', { aN1: 70, aN2: 40, aF1: 66, aF2: 44, tb: 10, hd: 12 }), light: LT.warm, t: s, eyes: hold > .5 ? 'closed' : 'open', mouth: hold > .5 ? 'o' : 'open' };
      person(g, Ps);
      person(g, Ph);
      const hp = handPos(Ph);
      if (s > burn && s < burn + .6) { g.strokeStyle = 'rgba(255,120,100,.8)'; g.lineWidth = 3; for (let i = 0; i < 3; i++) { const a = -1.2 + i * .5; g.beginPath(); g.moveTo(hp[0] + Math.cos(a) * 20, hp[1] + Math.sin(a) * 20); g.lineTo(hp[0] + Math.cos(a) * 40, hp[1] + Math.sin(a) * 40); g.stroke(); } }
      if (hold > .5) { puff(g, hp[0] + 40, hp[1] - 30, s, burn + 1.0, -1, .5); }
      // 热气绕成的心
      const hk = seg(s, burn + .8, burn + 2.2);
      if (hk > 0) {
        g.save(); g.translate(470, 420 - hk * 120); g.scale(1 + hk * .4, 1 + hk * .4); g.strokeStyle = `rgba(255,255,255,${.6 * Math.sin(Math.PI * hk)})`; g.lineWidth = 8; g.lineCap = 'round';
        g.beginPath(); g.moveTo(0, 40); g.bezierCurveTo(-70, -10, -40, -70, 0, -30); g.bezierCurveTo(40, -70, 70, -10, 0, 40); g.stroke(); g.restore();
      }
    });
  }, { tr: { type: 'fade', dur: .4 }, bloom: .3 });

  // V2c：雨夜，桌上一碗红豆汤，两把勺子；两个人面对面坐着，一人一勺
  scene('V2c', CUT(18), (g, s, k) => {
    camera(g, 1050, 720, 1.55, () => {
      room(g, s, { mood: 'rain', outside: (gg, x, y, w, h) => { gg.fillStyle = vgrad(gg, y, y + h, [[0, '#141C3A'], [1, '#2E3860']]); gg.fillRect(x, y, w, h); rain(gg, s, 120, { box: [x, y, x + w, y + h], col: 'rgba(200,215,255,.35)' }); }, lampX: 1060, lampOn: 1.2 });
      const tx = 1060, ty = 862;
      g.fillStyle = '#5E4334';
      g.fillRect(800, 914, 140, 14); g.fillRect(802, 742, 13, 186); g.fillRect(1180, 914, 140, 14); g.fillRect(1305, 742, 13, 186);
      const sip1 = Math.max(0, Math.sin((s - Lt(18)) * 2.4)), sip2 = Math.max(0, Math.sin((s - Lt(18)) * 2.4 + 2.6));
      const Ps = { who: 'she', u: 40, x: 870, seat: 914, f: 1, out: OUTFIT.sheHome, pose: pose('sit', { tb: 8 + sip1 * 10, aN1: 60 + sip1 * 30, aN2: 50 + sip1 * 40, aF1: 50, aF2: 60, hd: 6 }), light: LT.lamp, t: s, eyes: sip1 > .5 ? 'happy' : 'open', mouth: 'smile', blush: .8 };
      const Ph = { who: 'he', u: 42, x: 1250, seat: 914, f: -1, out: OUTFIT.heHome, pose: pose('sit', { tb: 8 + sip2 * 10, aN1: 60 + sip2 * 30, aN2: 50 + sip2 * 40, aF1: 50, aF2: 60, hd: 6 }), light: { ...LT.lamp, dir: 1 }, t: s, eyes: sip2 > .5 ? 'happy' : 'open', mouth: 'smile', blush: .6 };
      person(g, Ps); person(g, Ph);
      g.fillStyle = '#7B5843'; rr(g, tx - 200, ty, 400, 20, 6); g.fill(); g.fillStyle = '#5E4334'; g.fillRect(tx - 175, ty + 20, 15, 120); g.fillRect(tx + 160, ty + 20, 15, 120);
      // 一碗红豆汤
      g.fillStyle = '#F2EBE0'; g.beginPath(); g.ellipse(tx, ty - 34, 70, 18, 0, 0, Math.PI); g.lineTo(tx - 70, ty - 34); g.fill(); g.beginPath(); g.moveTo(tx - 70, ty - 34); g.quadraticCurveTo(tx - 64, ty + 2, tx, ty); g.quadraticCurveTo(tx + 64, ty + 2, tx + 70, ty - 34); g.fill();
      g.fillStyle = '#8A2A30'; ell(g, tx, ty - 34, 64, 14); g.fill();
      for (let i = 0; i < 8; i++) bean(g, tx - 40 + i * 11, ty - 36 + Math.sin(i * 2) * 5, 6, i);
      steamWisps(g, tx, ty - 50, 60, s, .9, 3);
      // 两把勺子
      for (const [P, d] of [[Ps, 1], [Ph, -1]]) { const h = handPos(P); g.strokeStyle = '#D8D0C4'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(h[0], h[1]); g.lineTo(h[0] + d * 34, h[1] - 10); g.stroke(); g.fillStyle = '#D8D0C4'; ell(g, h[0] + d * 40, h[1] - 12, 9, 6); g.fill(); }
      roomLight(g, 'rain', { lx: 1060, ly: 520 });
    });
  }, { tr: { type: 'fade', dur: .4 }, bloom: .32 });

  // V2d：分屏——她在外地的旅馆，他在家；两个窗口，同一个月亮；"相思"时中间那条线亮成红色
  scene('V2d', CUT(19), (g, s, k) => {
    const join = E.io(seg(s, Lc(19, 4) - .2, Lc(19, 4) + .8));
    const half = (left, fn) => { g.save(); g.beginPath(); g.rect(left ? 0 : W / 2, 0, W / 2, H); g.clip(); fn(); g.restore(); };
    // 左：她（霓虹的城市、下雨）
    half(true, () => {
      g.fillStyle = vgrad(g, 0, H, [[0, '#2A2040'], [1, '#41304E']]); g.fillRect(0, 0, W / 2, H);
      windowFrame(g, 140, 120, 640, 460, (gg, x, y, w, h) => {
        gg.fillStyle = vgrad(gg, y, y + h, [[0, '#0E1030'], [1, '#3A2A5A']]); gg.fillRect(x, y, w, h);
        moon(gg, x + w - 120 + join * 60, y + 120, 46, { halo: '#B0A0FF', haloA: .35 });
        for (let i = 0; i < 9; i++) { const bx = x + i * 74, bh = 120 + hash(i, 4) * 200; gg.fillStyle = '#1C1636'; gg.fillRect(bx, y + h - bh, 66, bh); for (let j = 0; j < 6; j++) { gg.fillStyle = ['#FF6AA0', '#6AD8FF', '#FFC870'][(i + j) % 3]; gg.fillRect(bx + 10 + (j % 2) * 26, y + h - bh + 20 + Math.floor(j / 2) * 40, 16, 12); } }
        rain(gg, s, 50, { box: [x, y, x + w, y + h], col: 'rgba(220,200,255,.3)' });
      }, { frame: '#5A4A60' });
      bust(g, 520, 760, 150, { who: 'she', out: OUTFIT.sheTravel, light: { dir: 1, shade: .25, amb: '#4A2A6A', ambA: .3, rim: '#FFB0D0', rimA: .6 }, t: s, gaze: [.8, -.5], tilt: .05, mouth: 'flat', blush: .5 });
    });
    // 右：他（家里，窗外月亮）
    half(false, () => {
      g.fillStyle = vgrad(g, 0, H, [[0, '#2E3248'], [1, '#3E3A52']]); g.fillRect(W / 2, 0, W / 2, H);
      windowFrame(g, W / 2 + 180, 120, 640, 460, (gg, x, y, w, h) => { nightMoonOutside(gg, x, y, w, h, s); }, { frame: '#D9D0C2' });
      bust(g, W / 2 + 440, 760, 155, { who: 'he', out: OUTFIT.heHome, light: { dir: -1, shade: .25, amb: '#2A3060', ambA: .3, rim: '#C8D4FF', rimA: .6 }, t: s, gaze: [-.8, -.5], tilt: -.05, mouth: 'flat', blush: .4 });
    });
    // 两只手各捏着一颗红豆，靠向中间那条线
    const r1 = [W / 2 - 150 + join * 90, 900], r2 = [W / 2 + 150 - join * 90, 900];
    mitt(g, r1[0] - 120, r1[1] + 90, 1.1, -.7, { fist: true, sleeve: OUTFIT.sheTravel.top, skin: SKIN.she });
    mitt(g, r2[0] + 120, r2[1] + 90, 1.1, Math.PI + .7, { fist: true, sleeve: OUTFIT.heHome.top, skin: SKIN.he, flip: true });
    bean(g, r1[0] - 18, r1[1] - 16, 14, .4, { glow: .4 + join * .4 }); bean(g, r2[0] + 18, r2[1] - 16, 14, -.4, { glow: .4 + join * .4 });
    // 中间的分隔线
    g.fillStyle = mixc('#14101C', RED, join); g.fillRect(W / 2 - 4, 0, 8, H);
    if (join > 0) { glow(g, W / 2, H / 2, 500 * join, '#FF5060', .35 * join); g.save(); g.shadowColor = RED_L; g.shadowBlur = 30 * join; g.fillStyle = RED; g.fillRect(W / 2 - 3, 0, 6, H); g.restore(); }
  }, { tr: { type: 'slide', dur: .5 }, bloom: .3 });

  // V2e：早晨的卧室——晨光从窗帘缝里照进来，她还睡着，他坐在床边看着她
  scene('V2e', CUT(20), (g, s, k) => {
    camera(g, 960, 760, 1.9 + k * .03, () => {
      room(g, s, { mood: 'morning', lamp: false, shelf: false, outside: (gg, x, y, w, h) => { gg.fillStyle = vgrad(gg, y, y + h, [[0, '#F6D8B0'], [1, '#FFF2DA']]); gg.fillRect(x, y, w, h); glow(gg, x + w * .3, y + h * .7, 300, '#FFFFFF', .8); } });
      // 床
      const bx = 1050, by = 880;
      g.fillStyle = '#B98B62'; rr(g, bx - 420, by - 260, 30, 330, 10); g.fill(); g.fillRect(bx - 420, by + 40, 840, 40);
      g.fillStyle = '#F7F2EA'; rr(g, bx - 400, by - 70, 800, 110, 20); g.fill();
      g.fillStyle = '#FFFFFF'; rr(g, bx - 390, by - 120, 200, 70, 30); g.fill();   // 枕头
      // 她躺着（头在枕头上，侧着脸，被子盖到肩）
      g.save(); g.translate(bx - 290, by - 110); g.rotate(-1.35);
      bust(g, 0, 0, 52, { who: 'she', out: OUTFIT.sheHome, eyes: 'closed', mouth: 'smile', blush: .7, light: LT.warm });
      g.restore();
      g.fillStyle = '#E9C9B3'; g.beginPath(); g.moveTo(bx - 260, by - 80); g.quadraticCurveTo(bx, by - 150, bx + 380, by - 80); g.lineTo(bx + 400, by + 40); g.lineTo(bx - 280, by + 40); g.closePath(); g.fill();
      g.strokeStyle = rgba('#000000', .08); g.lineWidth = 4; g.beginPath(); g.moveTo(bx - 150, by - 90); g.quadraticCurveTo(bx - 60, by - 20, bx - 120, by + 30); g.stroke();
      // 他坐在床边
      const Ph = { who: 'he', u: 42, x: bx + 280, seat: by - 60, f: -1, out: OUTFIT.heSummer, pose: pose('sit', { tb: 12, hd: 14, aN1: 40, aN2: 50 }), light: LT.warm, t: s, eyes: 'happy', mouth: 'smile' };
      person(g, Ph);
      mug(g, bx + 520, by - 100, .6, '#E9E1D3', s, 1);
      roomLight(g, 'morning', { s });
    });
  }, { tr: { type: 'leak', dur: .7 }, bloom: .45, grade: 'saturate(1.04) brightness(1.03)' });

  // V2f：特写——他低头亲她的额头，她睁开眼睛笑了
  scene('V2f', CUT(21), (g, s, k) => {
    g.fillStyle = vgrad(g, 0, H, [[0, '#FBE6CC'], [1, '#F2D2B0']]); g.fillRect(0, 0, W, H);
    g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = 'rgba(255,240,210,.5)'; poly(g, [[0, 0], [600, 0], [1400, H], [500, H]]); g.fill(); g.restore();
    // 她躺在枕头上（侧脸朝上，头在左，身子往右盖着被子）；他从左上方俯下来，亲她的额头
    const kiss = Lc(21, 3), wake = E.io(seg(s, kiss + .7, kiss + 1.4));
    const lean = E.io(seg(s, CUT(21) + .2, kiss)), back = E.io(seg(s, kiss + 1.0, kiss + 1.7));
    const u = 150, cx = 980, cy = 640;
    g.fillStyle = '#FFFFFF'; rr(g, 560, 560, 900, 300, 140); g.fill();
    g.fillStyle = mixc(HAIR.she[0], '#000000', .05);
    for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(cx - 40 - i * 30, cy + 40 + Math.sin(i) * 20, 210 - i * 10, 70, -.2 + i * .06, 0, TAU); g.fill(); }   // 散在枕头上的头发
    g.fillStyle = OUTFIT.sheHome.top; rr(g, cx + 60, cy + 20, 520, 220, 90); g.fill();
    headAt(g, cx, cy, u, -Math.PI / 2, { who: 'she', f: 1, eyes: wake > .5 ? 'happy' : 'closed', mouth: 'smile', blush: .6 + wake * .5 });
    g.fillStyle = '#EFD3BE'; g.beginPath(); g.moveTo(cx + 120, H); g.quadraticCurveTo(cx + 140, cy + 60, cx + 420, cy + 20); g.lineTo(W, cy + 10); g.lineTo(W, H); g.fill();
    // 他：额头在她额头的左上方
    const hx = lerp(500, cx - 1.45 * u, lean * (1 - back * .6)), hy = lerp(200, cy - 1.55 * u, lean * (1 - back * .4));
    g.fillStyle = OUTFIT.heSummer.top; g.save(); g.translate(hx, hy); g.rotate(.62); rr(g, -1.4 * u, 1.0 * u, 2.6 * u, 3 * u, u * .8); g.fill(); g.restore();
    headAt(g, hx, hy, u * 1.02, .62, { who: 'he', f: 1, eyes: 'closed', mouth: 'smile', blush: .7 });
    void ROOM;
    // 小小的心
    for (let i = 0; i < 5; i++) {
      const u = seg(s, kiss + .1 + i * .18, kiss + 1.6 + i * .18); if (u <= 0 || u >= 1) continue;
      const x = 760 + i * 40 + Math.sin(u * 6 + i) * 20, y = 360 - u * 220;
      g.save(); g.translate(x, y); g.scale(.6 + i * .1, .6 + i * .1); g.fillStyle = rgba(RED_L, Math.sin(Math.PI * u) * .9);
      g.beginPath(); g.moveTo(0, 18); g.bezierCurveTo(-30, -4, -18, -30, 0, -14); g.bezierCurveTo(18, -30, 30, -4, 0, 18); g.fill(); g.restore();
    }
  }, { tr: { type: 'blur', dur: .5 }, bloom: .45, grade: 'saturate(1.04)' });

  // V2g：阳台——她趴在栏杆上看一群鸟飞远；他站在门口看着她
  scene('V2g', CUT(22), (g, s, k) => {
    skyGrad(g, [[0, '#7FB2DE'], [.7, '#C4DDEE'], [1, '#F2EAD8']]);
    glow(g, 300, 200, 500, '#FFF6D8', .6);
    for (let i = 0; i < 4; i++) cloud(g, i + 3, ((i * 520 + s * 20) % (W + 700)) - 350, 160 + i * 50, 560, CLOUD.day, .9, i % 2 === 0);
    g.fillStyle = '#A8C4B4'; g.beginPath(); g.moveTo(0, 760); for (let x = 0; x <= W; x += 30) g.lineTo(x, 640 - (noise1(x / 300, 4) * .5 + .5) * 120); g.lineTo(W, 760); g.fill();
    const rs = R(5); g.fillStyle = '#C9C2BC'; for (let x = 0; x < W;) { const bw = 60 + rs() * 80, bh = 40 + rs() * 90; g.fillRect(x, 720 - bh, bw, bh + 80); x += bw + 8; }
    // 一群鸟
    for (let i = 0; i < 9; i++) {
      const u = (k * .22 + i * .02), bx = 900 + u * 1400 + (i % 3) * 40 + i * 20, by = 360 - u * 300 + Math.floor(i / 3) * 30 + Math.sin(s * 3 + i) * 6;
      const fl = Math.sin(s * 10 + i * 2) * 10; g.strokeStyle = '#3A3A48'; g.lineWidth = 3; g.beginPath(); g.moveTo(bx - 14, by - fl); g.quadraticCurveTo(bx - 6, by - 6, bx, by); g.quadraticCurveTo(bx + 6, by - 6, bx + 14, by - fl); g.stroke();
    }
    camera(g, 860, 600, 1.25, () => {
    // 墙、门、栏杆
    g.fillStyle = '#E8DCCB'; g.fillRect(0, 0, 330, H); g.fillStyle = '#C9B49C'; g.fillRect(320, 0, 14, H);
    g.fillStyle = '#5A4A44'; g.fillRect(60, 220, 220, 640);
    person(g, { who: 'he', u: 44, x: 200, y: 1010, f: 1, out: OUTFIT.heSummer, pose: pose('stand', { aN1: 10, aF1: -5 }), light: LT.day, t: s, mouth: 'smile', eyes: 'open' });
    g.fillStyle = '#B9A48C'; g.fillRect(330, 1010, W, 80);
    person(g, { who: 'she', u: 44, x: 1060, y: 1010, f: 1, out: OUTFIT.sheSummer, pose: pose('stand', { tb: 16, aN1: 80, aN2: 70, aF1: 76, aF2: 70, hd: -14 }), light: LT.day, t: s, wind: .3 + Math.sin(s * .8) * .1, eyes: 'up', mouth: 'flat' });
    g.fillStyle = '#F2EEE6'; g.fillRect(330, 800, W, 16); for (let x = 360; x < W; x += 60) g.fillRect(x, 816, 10, 200);
    });
  }, { tr: { type: 'fade', dur: .4 }, bloom: .3 });

  // V2h：山坡上起风了——她拉着风筝往前跑，头发、裙子都飞起来；他站在后面笑着看；"孤独的自由"时镜头跟着风筝飞上天
  scene('V2h', CUT(23), (g, s, k) => {
    const tilt = E.io(seg(s, Lc(23, 4) - .3, Lc(23, 4) + 2.2));
    meadow(g, s, { tilt });
    g.save(); g.translate(0, tilt * 700);
    const run = clamp(k / 2.6), sx = lerp(820, 1240, E.out(run));
    const Ps = { who: 'she', u: 36, x: sx, y: meadowY(sx) + 30, f: 1, out: OUTFIT.sheSummer, pose: run < 1 ? walkPose(s * 8, .6, { aN1: 130, aN2: -10 }) : pose('stand', { aN1: 140, aN2: -10, tb: -6 }), light: LT.day, t: s, wind: -.8, eyes: 'happy', mouth: 'open', blush: .8 };
    const Ph = { who: 'he', u: 38, x: 520, y: meadowY(520) + 40, f: 1, out: OUTFIT.heSummer, pose: pose('stand', { aN1: 6 }), light: LT.day, t: s, eyes: 'happy', mouth: 'smile' };
    person(g, Ph); person(g, Ps);
    const hp = handPos(Ps);
    const kx = 1500 + Math.sin(s * .9) * 60, ky = lerp(260, -220, tilt) + Math.sin(s * 1.3) * 30;
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(hp[0], hp[1]); g.quadraticCurveTo((hp[0] + kx) / 2, (hp[1] + ky) / 2 + 60, kx, ky + 60); g.stroke();
    kite(g, kx, ky, 1.1, .3 + Math.sin(s * 1.5) * .15, s, 1);
    g.restore();
    // 飞上天以后：云从身边掠过
    if (tilt > .3) for (let i = 0; i < 3; i++) cloud(g, i + 8, ((i * 700 - s * 300) % (W + 900) + W + 900) % (W + 900) - 450, 300 + i * 220, 700, CLOUD.day, (tilt - .3) * .9, i % 2 === 0);
  }, { tr: { type: 'whip', dur: .45 }, bloom: .3, grade: 'saturate(1.06)' });
});
