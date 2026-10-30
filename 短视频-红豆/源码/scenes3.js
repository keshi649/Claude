'use strict';
/* scenes3.js —— 第二段主歌（"还没为你把红豆" ~ "孤独的自由"，82.9 ~ 114.3 秒）：
   罐子一倾，红豆像下雨一样落进锅里；厨房里他端锅烫了手（"伤口"），她跑过来拉着他的手吹，锅上的热气绕成一颗心；
   雨夜一碗红豆汤，一人一勺，她舀一颗喂他；分屏两地，同一个月亮，"相思"时中间的线变红，一根红线穿过去；
   早晨她还睡着，他趴在床边看；他亲她的额头，她醒了；阳台上她看着鸟飞远，他在门口看着她；
   山坡上她拉着风筝跑，"孤独的自由"时镜头跟着风筝上天。 */

/* 精灵转一个角度贴到缓冲上：逐像素最近邻取样（转出来的边还是一格一格的，不糊） */
function protSpr(b, spr, cx, cy, ang) {
  const sw = spr.width, sh = spr.height, R2 = Math.ceil(Math.hypot(sw, sh) / 2) + 1, D = R2 * 2;
  const src = spr.getContext('2d').getImageData(0, 0, sw, sh).data;
  const t = pbuf('_rot', D, D), out = t.createImageData(D, D), od = out.data;
  const cs = Math.cos(ang), sn = Math.sin(ang);
  for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
    const dx = x + .5 - R2, dy = y + .5 - R2;
    const sx = Math.floor(dx * cs + dy * sn + sw / 2), sy = Math.floor(-dx * sn + dy * cs + sh / 2);
    if (sx < 0 || sy < 0 || sx >= sw || sy >= sh) continue;
    const i = (sy * sw + sx) * 4, o = (y * D + x) * 4;
    od[o] = src[i]; od[o + 1] = src[i + 1]; od[o + 2] = src[i + 2]; od[o + 3] = src[i + 3];
  }
  t.putImageData(out, 0, 0);
  b.drawImage(BUF._rot, ri(cx) - R2, ri(cy) - R2);
}
/* 心形上的第 i 个点（共 n 个），r 大小 */
function heartPt(cx, cy, r, i, n) {
  const a = i / n * TAU, x = 16 * Math.pow(Math.sin(a), 3), y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
  return [cx + x * r / 16, cy + y * r / 16];
}
/* 小小的 z（睡着了） */
function pzz(b, x, y, c) { prect(b, x, y, 3, 1, c); pdot(b, x + 1, y + 1, c); prect(b, x, y + 2, 3, 1, c); }
/* 勺子：从手 (x0, y0) 到勺头 (x1, y1) */
function pspoon(b, x0, y0, x1, y1) { pline(b, x0, y0, x1, y1, '#D9DCE4'); prect(b, x1 - 1, y1, 3, 2, '#C4C8D2'); pdot(b, x1 - 1, y1, '#EEF0F6'); }
/* 小怪尺寸的厨房（240×135）：墙 0~100（下半截贴瓷砖），窗外下着雨，架子上一排瓶罐和红豆罐；人站在前景中岛的后面 */
function kitchenM(b, gl, t) {
  prect(b, 0, 0, 240, 100, '#EEE2CC'); prect(b, 0, 0, 240, 4, '#E2D4BA');
  prect(b, 0, 58, 240, 42, '#E4D5BA');
  for (let y = 58; y < 100; y += 6) { prect(b, 0, y, 240, 1, '#D2C0A0'); for (let x = ((y - 58) / 6 % 2) * 3; x < 240; x += 6) prect(b, x, y, 1, 6, '#D2C0A0'); }
  // 雨夜的窗
  prect(b, 156, 12, 56, 36, '#1A2244'); b.save(); b.beginPath(); b.rect(156, 12, 56, 36); b.clip(); b.translate(156, 12); rain(b, t, 56, 36, { n: 30, v: 120, len: 4, col: 'rgba(200,215,255,.45)', seed: 4 }); b.restore();
  prect(b, 154, 10, 60, 2, '#F4EEE4'); prect(b, 154, 48, 60, 3, '#F4EEE4'); prect(b, 154, 12, 2, 36, '#F4EEE4'); prect(b, 212, 12, 2, 36, '#F4EEE4'); prect(b, 183, 12, 2, 36, '#F4EEE4');
  // 架子上的瓶罐，红豆罐里只剩一点
  prect(b, 14, 36, 104, 2, '#B98B62');
  for (let i = 0; i < 6; i++) { prect(b, 18 + i * 14, 24, 9, 12, ['#E9E1D3', '#C9D8D0', '#E6C8B0', '#D8D0E0'][i % 4]); prect(b, 19 + i * 14, 22, 7, 2, '#9A7050'); }
  pjar(b, 108, 36, 1, { fill: .12, slips: 3, seed: 9 });
  // 挂着的锅铲、汤勺
  for (const [hx, kind] of [[130, 0], [138, 1], [146, 0]]) { prect(b, hx, 40, 1, 12, '#8A8A94'); if (kind) pell(b, hx, 53, 2, 1, '#8A8A94'); else prect(b, hx - 1, 52, 3, 3, '#8A8A94'); }
  // 吊灯
  prect(b, 112, 0, 1, 16, '#1E1A20'); for (let j = 0; j < 4; j++) prect(b, 110 - j, 16 + j, 5 + j * 2, 1, '#C79A6A'); prect(b, 109, 20, 7, 1, '#FFE7A8');
  pcone(b, 112, 21, 135, 8, 120, '#FFCF8A', .16, .05); if (gl) pdisc(gl, 112, 22, 8, 'rgba(255,200,120,.6)');
  prect(b, 0, 100, 240, 35, '#9A7458'); prect(b, 0, 100, 240, 1, '#86644A');
}
/* 前景的中岛：台面 y（默认 108） */
function islandM(b, x0, x1, y = 108) {
  prect(b, x0, y, x1 - x0, 3, '#F2EBE0'); prect(b, x0, y + 2, x1 - x0, 1, '#DCD2C2'); prect(b, x0, y + 3, x1 - x0, 135 - y - 3, '#8A6A54'); prect(b, x0, y + 3, x1 - x0, 1, '#6E5240');
  for (let x = x0 + 4; x < x1 - 24; x += 32) { prect(b, x, y + 7, 28, 1, '#6E5240'); prect(b, x, y + 7, 1, 18, '#6E5240'); prect(b, x + 27, y + 7, 1, 18, '#6E5240'); prect(b, x + 11, y + 12, 6, 1, '#C9A06A'); }
}
/* 床（侧面）：x0 床头（左），x1 床尾，y 床垫面 */
function pbed(b, x0, x1, y) {
  prect(b, x0 - 5, y - 24, 5, 40, '#8A6248'); prect(b, x0 - 5, y - 25, 5, 1, '#A47A5C');
  prect(b, x1, y - 8, 3, 24, '#8A6248');
  prect(b, x0, y + 6, x1 - x0, 6, '#7A563E'); prect(b, x0, y + 6, x1 - x0, 1, '#5E4232');
  prect(b, x0 + 1, y + 12, 3, 4, '#5E4232'); prect(b, x1 - 4, y + 12, 3, 4, '#5E4232');
  prect(b, x0, y, x1 - x0, 6, '#F4F0EA');
  prect(b, x0 + 2, y - 6, 22, 6, '#FFFFFF'); prect(b, x0 + 2, y - 1, 22, 1, '#E2DAD0'); pdot(b, x0 + 2, y - 6, '#E2DAD0');
}
/* 被子：从 x0 到 x1，上沿 y0，盖到床垫面 y；上沿翻过来一道白边 */
function pquilt(b, x0, x1, y0, y) {
  for (let x = x0; x < x1; x++) { const top = y0 + ri(Math.max(0, Math.sin((x - x0) / (x1 - x0) * Math.PI * 1.6)) * 1.5); prect(b, x, top, 1, y + 6 - top, '#F2C4CE'); }
  for (let i = 0; i < 12; i++) { const x = x0 + 6 + i * ((x1 - x0 - 10) / 12); pdot(b, x, y0 + 6 + (i % 2) * 3, '#E8A2B2'); }
  prect(b, x0, y0, x1 - x0, 2, '#FBF2F4'); prect(b, x0, y + 5, x1 - x0, 1, '#D8A0AE');
}

SCENES_DEF.push(() => {
  // V2a：慢镜头——罐子一倾，红豆像下雨一样落进锅里；"红豆"时一颗大红豆从镜头前面落过去
  scene('V2a', CUT(16), (g, s, k) => {
    shot(g, 'v2a', 160, 90, 12, (b, gl) => {
      prect(b, 0, 0, 160, 90, '#EADCC4');
      for (let y = 4; y < 78; y += 8) prect(b, 0, y, 160, 1, '#DCCAB0');
      for (let y = 4; y < 78; y += 8) for (let x = ((y - 4) / 8 % 2) * 4; x < 160; x += 8) prect(b, x, y, 1, 8, '#DCCAB0');
      pbeam(b, -30, 20, 0, 90, .55, '#FFE6B8', .2);
      pdisc(b, 70, 40, 46, 'rgba(255,214,160,.10)');
      const PX = 72, PT = 50, N = 46, G = 60;
      // 灶台、蓝火
      prect(b, 0, 78, 160, 12, '#2E2A30'); prect(b, 0, 78, 160, 1, '#4A4450'); for (const kx of [14, 140]) { pdisc(b, kx, 84, 3, '#4A4450'); pdot(b, kx, 82, '#8A8494'); }
      for (let i = 0; i < 9; i++) { const fx = 49 + i * 6, fh = 1 + ri((Math.sin(s * 18 + i * 2) * .5 + .5) * 2); prect(b, fx, 78 - fh, 2, fh, i % 2 ? '#6A9AFF' : '#9ABAFF'); if (gl) prect(gl, fx, 76, 2, 2, 'rgba(110,150,255,.8)'); }
      // 锅（侧面，稍微俯视，看得见锅里）
      for (let y = PT; y < 77; y++) { const inset = y > 72 ? (y - 72) * 2 : 0; prect(b, PX - 28 + inset, y, 56 - inset * 2, 1, '#2E5A60'); }
      prect(b, PX - 22, PT + 6, 2, 16, 'rgba(255,255,255,.16)'); prect(b, PX + 20, PT + 6, 1, 14, 'rgba(255,255,255,.1)');
      prect(b, PX - 34, PT + 6, 6, 2, '#24242A'); prect(b, PX + 28, PT + 6, 6, 2, '#24242A');
      // 罐子（她的手拿着），慢慢倾过来
      const JX = 124, JY = 22, ang = -2.2 * E.io(seg(k, .1, .9)) + 1.0 * E.io(seg(k, 3.5, 4.0));
      const mouthAt = kk => { const a = -2.2 * E.io(seg(kk, .1, .9)); return [JX + 15 * Math.sin(a), JY - 15 * Math.cos(a)]; };
      // 每颗豆子：从罐口飞出来，慢慢落下，掉进锅里溅起一点水
      const flying = [], splashes = []; let landed = 0;
      for (let i = 0; i < N; i++) {
        const te = .55 + i * .068 + hash(i, 3) * .04; if (te > k) break;
        const [mx, my] = mouthAt(te), vx = -22 - hash(i, 4) * 16, vy = 1 + hash(i, 5) * 4;
        const x0 = mx + (hash(i, 6) - .5) * 3, y0 = my + (hash(i, 7) - .5) * 2;
        const th = (-vy + Math.sqrt(vy * vy + 2 * G * (PT - y0))) / G, tau = k - te;
        if (tau >= th) { landed++; if (tau - th < .4) splashes.push([x0 + vx * th, tau - th]); continue; }
        flying.push([x0 + vx * tau, y0 + vy * tau + .5 * G * tau * tau, hash(i, 8) * 6 + tau * (3 + hash(i, 9) * 4), i]);
      }
      pell(b, PX, PT, 28, 5, '#5E949A'); pell(b, PX, PT, 26, 4, mix('#1E3236', '#6A1E24', clamp(landed / 36)));
      prect(b, PX - 14, PT - 2, 8, 1, 'rgba(255,255,255,.25)');
      for (let j = 0; j < landed; j++) { const a = hash(j, 11) * TAU, r = Math.sqrt(hash(j, 12)); pbean(b, PX + Math.cos(a) * r * 22 - 1, PT + Math.sin(a) * r * 3, 1); }
      for (const [sx, st] of splashes) { const u = st / .4; pring(b, sx, PT, 2 + u * 5, 1 + u * 1.5, rgba('#E8F4F4', .7 * (1 - u))); for (let j = 0; j < 3; j++) pdot(b, sx + (j - 1) * (1 + u * 4), PT - 1 - Math.sin(Math.PI * u) * (3 + j), rgba('#F4FAFA', .8 * (1 - u))); }
      for (let j = 0; j < 4; j++) psteam(b, PX - 15 + j * 10, PT - 3, s + j * .37, 3, 16, .45);
      for (const [x, y, a, i] of flying) pbeanRot(b, x, y, 2.2, a, i % 4 === 0 ? gl : null);
      const jb = pbuf('_jar', 34, 44); pjar(jb, 17, 40, 2, { fill: lerp(.45, .1, seg(k, .6, 3.6)), slips: 0, tag: false, lid: false });
      protSpr(b, BUF._jar, JX, JY, ang);
      prect(b, 132, 14, 30, 10, MON.she); prect(b, 132, 14, 30, 1, shade(MON.she, 1.12)); prect(b, 132, 23, 30, 1, shade(MON.she, .8));
      // "红豆"：一颗大红豆从镜头前面落过去
      const fb = seg(s, Lc(16, 5) - .25, Lc(16, 6) + .3);
      if (fb > 0 && fb < 1) pbeanRot(b, 30, lerp(-12, 104, E.in2(fb)), 8, s * 2.4, gl);
    }, { glow: .7 });
  }, { tr: { type: 'bean', dur: .7, cx: 960, cy: 540 } });

  // V2b：厨房——他搅着锅，"伤"的时候去端锅烫了手；她跑过来拉着他的手吹；锅上的热气绕成一颗心
  scene('V2b', CUT(17), (g, s, k) => {
    const burn = Lc(17, 5);
    shot(g, 'v2b', 240, 135, 8, (b, gl) => {
      kitchenM(b, gl, s);
      const stir = s < burn - .7, grab = s >= burn - .45 && s < burn, hurt = s >= burn && s < burn + .6, hold = s >= burn + .6;
      const jump = s >= burn && s < burn + .16 ? 2 : 0;
      const run = seg(s, burn + .05, burn + .6), sx = ri(lerp(184, 120, E.io(run)));
      monAt(b, 92, 116 - jump, { who: 'he', eyes: hurt ? 'wide' : hold ? 'happy' : 'l', armL: hurt ? 'hi' : (stir || grab) ? 'reach' : 'n', armR: hold ? 'reach' : 'n', blush: hold ? 1 : 0 }, 1);
      const chop = !run && Math.floor(s * 5) % 2;
      monAt(b, sx, 116 - (run > 0 && run < 1 ? Math.floor(s * 10) % 2 : 0), { who: 'she', eyes: hold ? 'shut' : run > 0 ? 'l' : 'dn', armL: hold ? 'reach' : run > 0 ? 'n' : 'front', armR: run > 0 ? 'n' : chop ? 'front' : 'n', mouth: hold ? 'o' : '', blush: hold ? 1 : 0 }, 1);
      islandM(b, 0, 240, 112);
      // 灶、锅
      prect(b, 52, 110, 40, 2, '#3A3640');
      for (let i = 0; i < 6; i++) { const fx = 58 + i * 5; pdot(b, fx, 109, (Math.floor(s * 12) + i) % 2 ? '#6A9AFF' : '#9ABAFF'); if (gl) pdot(gl, fx, 109, 'rgba(110,150,255,.8)'); }
      prect(b, 58, 97, 28, 12, '#2E5A60'); prect(b, 58, 97, 28, 2, '#3E6E74'); prect(b, 61, 100, 1, 7, 'rgba(255,255,255,.18)');
      prect(b, 54, 106, 4, 2, '#24242A'); prect(b, 86, 106, 4, 2, '#24242A');
      // 她那边：砧板上切好的东西、两只碗
      prect(b, 168, 110, 26, 2, '#C89A64'); for (let i = 0; i < 4; i++) pdot(b, 172 + i * 4, 109, '#F2EBE0');
      for (const bx of [204, 216]) { prect(b, bx, 108, 8, 4, '#F4F0EA'); prect(b, bx, 108, 8, 1, '#E0D8CC'); }
      // 搅锅的木勺
      if (stir) { const tx = 74 + ri(Math.cos(s * 7) * 3), ty = 96 + ri(Math.sin(s * 7)); pline(b, 88, 105, tx, ty, '#C89A64'); }
      // 热气；"伤"以后，锅上的热气慢慢绕成一颗心
      for (let j = 0; j < 3; j++) psteam(b, 64 + j * 8, 95, s + j * .41, 3, 18, .5);
      const hu = seg(s, burn + .4, burn + 1.35);
      if (hu > 0) for (let i = 0; i < 28; i++) {
        const [hx, hy] = heartPt(72, 80, 9, i, 28), sx0 = 64 + hash(i, 5) * 16, sy0 = 94 - hash(i, 6) * 8;
        const m = E.out(clamp(hu * 1.6)), a = Math.sin(Math.PI * hu) * .85;
        pdot(b, lerp(sx0, hx, m), lerp(sy0, hy - hu * 6, m), rgba('#FFFFFF', a));
      }
      // 烫着了：手一缩，头上一个红色的"！"，手边冒一小股烟
      if (hurt) { prect(b, 103, 89 - jump, 2, 5, RED); prect(b, 103, 95 - jump, 2, 2, RED); for (let i = 0; i < 3; i++) { const u = clamp((s - burn) / .5 - i * .15); if (u > 0 && u < 1) pdot(b, 92 + i * 2, 94 - u * 6, rgba('#FFFFFF', .7 * (1 - u))); } }
      // 拉着手吹一吹
      if (hold) { pbreath(b, 120, 106, s, burn + .65, -1); pbreath(b, 120, 106, s, burn + 1.15, -1); prect(b, 116, 105, 1, 1, RED); }
      if (hold) for (let i = 0; i < 3; i++) { const u = seg(s, burn + .8 + i * .2, burn + 1.6 + i * .2); if (u > 0 && u < 1) pheart(b, 112 + i * 6, 96 - u * 14, rgba('#FF5A78', 1 - u)); }
      roomShade(b, 'evening', 112, 60);
    }, { zoom: 2, cx: lerp(106, 116, clamp(k / 3.8)), cy: 101 });
  }, { tr: { type: 'dither', dur: .4 } });

  // V2c：雨夜，一碗红豆汤，两把勺子；"一起"两个人一起舀起来吃，"分享"她舀一颗喂他
  scene('V2c', CUT(18), (g, s, k) => {
    shot(g, 'v2c', 160, 90, 12, (b, gl) => {
      prect(b, 0, 0, 160, 90, '#2C2F4A');
      b.save(); b.beginPath(); b.rect(14, 4, 132, 38); b.clip(); b.translate(14, 4);
      psky(b, 132, 38, [[0, '#0E1434'], [1, '#2A3058']]);
      for (let i = 0; i < 14; i++) pdisc(b, hash(i, 71) * 132, 22 + hash(i, 72) * 16, 1 + hash(i, 73) * 2, rgba(['#FFC870', '#FF9A9A', '#9AD0FF'][i % 3], .2));
      rain(b, s, 132, 38, { n: 40, v: 90, len: 4, col: 'rgba(200,215,255,.5)', seed: 6 });
      b.restore();
      for (let i = 0; i < 10; i++) { const x = 16 + hash(i, 81) * 128, y = 6 + ((s * (3 + hash(i, 82) * 4) + hash(i, 83) * 34) % 34); pdot(b, x, y, 'rgba(220,235,255,.6)'); pdot(b, x, y - 1, 'rgba(220,235,255,.3)'); }
      prect(b, 12, 2, 136, 2, '#4A4058'); prect(b, 12, 42, 136, 2, '#4A4058'); prect(b, 12, 4, 2, 38, '#4A4058'); prect(b, 146, 4, 2, 38, '#4A4058'); prect(b, 79, 4, 2, 38, '#4A4058');
      // 吊灯的暖光照在桌上
      prect(b, 79, 0, 2, 3, '#1E1A20'); for (let j = 0; j < 3; j++) prect(b, 77 - j, 3 + j, 6 + j * 2, 1, '#C79A6A'); if (gl) pdisc(gl, 80, 7, 6, 'rgba(255,210,140,.7)');
      pcone(b, 80, 6, 66, 8, 120, '#FFCF8A', .18, .07);
      // 一人一勺
      const dipH = Math.max(0, Math.sin(s * 3.2)), dipS = Math.max(0, Math.sin(s * 3.2 + 2));
      const both = Math.sin(Math.PI * seg(s, Lc(18, 2) - .1, Lc(18, 3) + .15));
      const feed = E.io(seg(s, Lc(18, 4) - .15, Lc(18, 4) + .2)) * (1 - E.io(seg(s, Lc(18, 5) + .25, Lc(18, 5) + .5)));
      const ate = s > Lc(18, 5) - .05;
      const hEat = Math.max(both, s < Lc(18, 2) - .1 ? Math.sin(Math.PI * seg(s, CUT(18) + .3, CUT(18) + .9)) : 0);
      const sEat = Math.max(both, s < Lc(18, 2) - .1 ? Math.sin(Math.PI * seg(s, CUT(18) + .8, CUT(18) + 1.35)) : 0);
      monAt(b, 34, 68, { who: 'he', sit: 1, eyes: hEat > .6 || ate ? 'happy' : 'r', mouth: feed > .7 && !ate ? 'o' : '', blush: ate ? 1 : 0, lean: feed > .5 ? 1 : 0 }, 2);
      monAt(b, 94, 68, { who: 'she', sit: 1, eyes: sEat > .6 || ate ? 'happy' : 'l', blush: feed > .3 ? 1 : 0 }, 2);
      prect(b, 0, 66, 160, 3, '#9A6A4C'); prect(b, 0, 66, 160, 1, '#B4825E'); prect(b, 0, 69, 160, 21, '#6E4A36');
      // 碗、红豆汤
      for (let y = 0; y < 7; y++) { const ww = ri(lerp(11, 7, Math.pow(y / 6, 1.6))); prect(b, 80 - ww, 59 + y, ww * 2 + 1, 1, y < 1 ? '#FFFFFF' : '#F2EEE6'); }
      prect(b, 78, 64, 6, 1, RED);
      pell(b, 80, 59, 10, 2, '#8E2A2E'); for (let i = 0; i < 7; i++) pdot(b, 72 + hash(i, 91) * 16, 58 + hash(i, 92) * 2, i % 2 ? RED_L : RED_D);
      psteam(b, 78, 56, s, 4, 14, .5); psteam(b, 83, 56, s + .5, 3, 12, .4);
      // 勺子：手 → 碗里 / 嘴边；她喂他的那一勺上有一颗红豆
      const hT = [lerp(77, 68, hEat), lerp(59, 46, hEat) + ri(dipH * (1 - hEat))];
      pspoon(b, 73, 52, hT[0], hT[1]);
      const sT = feed > 0 ? [lerp(lerp(83, 92, sEat), 70, feed), lerp(lerp(59, 46, sEat), 46, feed)] : [lerp(83, 92, sEat), lerp(59, 46, sEat) + ri(dipS * (1 - sEat))];
      pspoon(b, 86, 52, sT[0], sT[1]);
      if (feed > 0 && !ate) pbean(b, sT[0] - 1, sT[1] - 1, 1);
      if (ate) for (let i = 0; i < 3; i++) { const u = seg(s, Lc(18, 5) + i * .2, Lc(18, 5) + .8 + i * .2); if (u > 0 && u < 1) pheart(b, 72 + i * 8, 40 - u * 14, rgba('#FF5A78', 1 - u)); }
    }, { glow: .8 });
  }, { tr: { type: 'dither', dur: .4 } });

  // V2d：分屏——左边她在外地的旅馆（霓虹、雨），右边他在家；两扇窗里是同一个月亮；
  // 两个人手里各捏着一颗红豆；"相思"时中间那条线变红，一根红线从她手里穿过去，连到他手里
  scene('V2d', CUT(19), (g, s, k) => {
    const red = seg(s, Lc(19, 4) - .15, Lc(19, 4) + .25), thr = seg(s, Lc(19, 4), Lc(19, 5) + .3), look = s > Lc(19, 5) - .15, sad = s > Lc(19, 7) - .1;
    shot(g, 'v2d', 320, 180, 6, (b, gl) => {
      // 左：旅馆
      b.save(); b.beginPath(); b.rect(0, 0, 159, 180); b.clip();
      prect(b, 0, 0, 159, 180, '#2C2440'); for (let y = 8; y < 140; y += 10) for (let x = (y / 10 % 2) * 5 + 2; x < 159; x += 10) pdot(b, x, y, '#352C4C');
      b.save(); b.beginPath(); b.rect(16, 20, 78, 72); b.clip(); b.translate(16, 20);
      psky(b, 78, 72, [[0, '#0C1030'], [1, '#2A2050']]); pstars(b, s, 78, 30, 14, 14, .6); pmoon(b, null, 48, 20, 7);
      for (let i = 0; i < 6; i++) { const bx = i * 14 - 4, bh = 30 + ri(hash(i, 5) * 24); prect(b, bx, 72 - bh, 12, bh, '#181430'); for (let j = 0; j < 4; j++) if (hash(i, j + 9) < .5) prect(b, bx + 3, 72 - bh + 4 + j * 6, 3, 2, '#FFC870'); }
      for (const [nx, ny, nw, nc] of [[6, 40, 14, '#FF5AA0'], [40, 48, 18, '#4AE0F0'], [22, 58, 10, '#FFD24A']]) { const on = (Math.floor(s * 3 + nx) % 7) ? 1 : .4; prect(b, nx, ny, nw, 3, rgba(nc, on)); }
      rain(b, s, 78, 72, { n: 30, v: 110, len: 4, col: 'rgba(210,200,255,.45)', seed: 8 });
      b.restore();
      if (gl) { pdisc(gl, 64, 40, 9, 'rgba(255,240,200,.7)'); prect(gl, 22, 60, 14, 3, 'rgba(255,90,160,.8)'); prect(gl, 56, 68, 18, 3, 'rgba(74,224,240,.8)'); }
      prect(b, 14, 18, 82, 2, '#4A3E5E'); prect(b, 14, 92, 82, 3, '#4A3E5E'); prect(b, 14, 20, 2, 72, '#4A3E5E'); prect(b, 94, 20, 2, 72, '#4A3E5E'); prect(b, 54, 20, 2, 72, '#4A3E5E');
      pbeam(b, 16, 94, 92, 180, .6, '#FF7AB8', .07); pbeam(b, 40, 80, 92, 180, .8, '#6ADCF0', .05);
      prect(b, 0, 150, 159, 30, '#3A2E4A'); prect(b, 0, 150, 159, 1, '#4A3C5C');
      // 床，床头柜上的小灯，行李箱
      prect(b, 84, 134, 75, 6, '#E8DCE8'); prect(b, 84, 140, 75, 10, '#6A5070'); prect(b, 84, 128, 30, 6, '#F6F0F6');
      prect(b, 60, 132, 16, 18, '#5A4250'); prect(b, 66, 124, 4, 8, '#C9A06A'); prect(b, 62, 118, 12, 6, '#F6D6A0'); if (gl) pdisc(gl, 68, 121, 8, 'rgba(255,210,150,.6)');
      pspr(b, suitcase(), 22, 141, 1);
      monAt(b, 98, 140, { who: 'she', sit: 1, armL: 'front', eyes: sad ? 'sad' : look ? 'up' : 'dn', tear: sad ? 1 : 0 }, 2);
      pbean(b, 102, 121, 2);
      b.restore();
      // 右：家里
      b.save(); b.beginPath(); b.rect(161, 0, 159, 180); b.clip();
      prect(b, 161, 0, 159, 180, '#363C5A'); for (let y = 8; y < 140; y += 10) for (let x = 163 + (y / 10 % 2) * 5; x < 320; x += 10) pdot(b, x, y, '#40466A');
      b.save(); b.beginPath(); b.rect(226, 20, 78, 72); b.clip(); b.translate(226, 20);
      psky(b, 78, 72, [[0, '#0B1230'], [1, '#2E3462']]); pstars(b, s, 78, 40, 15, 22, .8); pmoon(b, null, 48, 20, 7);
      for (let i = 0; i < 7; i++) prect(b, i * 12 - 2, 60 - (i * 7) % 9, 11, 20, '#141A38');
      b.restore();
      if (gl) pdisc(gl, 274, 40, 9, 'rgba(255,240,200,.7)');
      prect(b, 224, 18, 82, 2, '#D9D0C2'); prect(b, 224, 92, 82, 3, '#D9D0C2'); prect(b, 224, 20, 2, 72, '#D9D0C2'); prect(b, 304, 20, 2, 72, '#D9D0C2'); prect(b, 264, 20, 2, 72, '#D9D0C2');
      prect(b, 220, 95, 90, 2, '#BFB4A4'); pjar(b, 236, 95, 1, { fill: .26, slips: 2 });
      pbeam(b, 226, 304, 95, 180, -.5, '#AABEFF', .12);
      prect(b, 161, 150, 159, 30, '#5A4438'); prect(b, 161, 150, 159, 1, '#6A5244');
      monAt(b, 180, 152, { who: 'he', armR: 'front', eyes: sad ? 'sad' : look ? 'up' : 'dn' }, 2);
      pbean(b, 214, 129, 2);
      b.restore();
      // 中间的线；"相思"时变红，一根红线从她手里穿过去连到他手里
      prect(b, 159, 0, 2, 180, mix('#0A0A14', RED, red));
      if (gl && red > 0) prect(gl, 158, 0, 4, 180, rgba('#FF4060', .6 * red));
      if (thr > 0) {
        const pts = []; for (let i = 0; i <= 30; i++) { const u = i / 30; pts.push(u < .5 ? [lerp(106, 160, u * 2), lerp(124, 112, u * 2) + Math.sin(u * 2 * Math.PI) * 6] : [lerp(160, 216, u * 2 - 1), lerp(112, 131, u * 2 - 1) + Math.sin((u * 2 - 1) * Math.PI) * 6]); }
        const n = Math.max(2, ri(thr * 30) + 1); ppath(b, pts.slice(0, n), RED); if (gl) ppath(gl, pts.slice(0, n), 'rgba(255,80,100,.8)');
      }
    }, { glow: .85 });
  }, { tr: { type: 'push', dur: .5, dir: 1 } });

  // V2e：早晨的卧室，晨光和浮尘；她还窝在被子里睡着，他趴在床边看着她
  scene('V2e', CUT(20), (g, s, k) => {
    const pz = E.io(clamp(k / 3.9));
    shot(g, 'v2e', 240, 135, 8, (b, gl) => {
      room(b, gl, s, { mood: 'morning', lamp: false, outside: (bb, x, y, w, h) => outsideMorning(bb, x, y, w, h, s) });
      pbed(b, 40, 160, 100);
      monAt(b, 44, 104, { who: 'she', eyes: 'shut' }, 1);
      pquilt(b, 40, 160, 95, 100);
      pbeam(b, RM.winX + 2, RM.winX + RM.winW - 6, RM.winY + RM.winH, 135, .9, '#FFF0C8', .2);
      drift(s, 240, 135, { n: 26, v: 2, vx: 3, seed: 121 }, (x, y) => { const inBeam = x > 30 + (y - 64) * .9 && x < 76 + (y - 64) * .9 && y > 60; if (inBeam) pdot(b, x, y, rgba('#FFF8E0', .7)); });
      for (let i = 0; i < 3; i++) { const u = ((s * .5 + i / 3) % 1); pzz(b, 66 + u * 10, 86 - u * 16, rgba('#8A90C0', Math.sin(Math.PI * u))); }
      const smile = k > 2.3;
      monAt(b, 76, 118, { who: 'he', sit: 1, armL: 'up', armR: 'up', eyes: smile ? 'happy' : 'l', blush: smile ? 1 : 0 }, 1);
    }, { zoom: lerp(1, 1.22, pz), cx: lerp(120, 88, pz), cy: lerp(67.5, 92, pz), glow: .7 });
  }, { tr: { type: 'flash', dur: .5 } });

  // V2f：近景——他俯下来亲她的额头，冒出小小的心；"温柔"时她睁开眼睛笑了
  scene('V2f', CUT(21), (g, s, k) => {
    const lean = E.io(seg(s, Lc(21, 1) + .1, Lc(21, 3))) * (1 - E.io(seg(s, Lc(21, 4) - .2, Lc(21, 4) + .3))), wake = s > Lc(21, 5) - .1;
    shot(g, 'v2f', 160, 90, 12, (b, gl) => {
      psky(b, 160, 90, [[0, '#F6E8D6'], [1, '#EAD6C0']]);
      pbeam(b, -20, 30, 0, 90, .7, '#FFF4D8', .3);
      pbokeh(b, s, 160, 90, 131, 8, ['#FFFFFF', '#FFE8C8'], .2);
      prect(b, 14, 16, 8, 74, '#8A6248'); prect(b, 14, 15, 8, 1, '#A47A5C');
      prect(b, 24, 42, 54, 14, '#FFFFFF'); prect(b, 24, 55, 54, 1, '#E2DAD0'); prect(b, 24, 42, 1, 14, '#E2DAD0');
      monAt(b, 34, 74, { who: 'she', eyes: wake ? 'happy' : 'shut', blush: wake ? 1 : 0 }, 2);
      const hx = ri(lerp(104, 64, lean)), hy = ri(lerp(78, 70, lean));
      monAt(b, hx, hy, { who: 'he', eyes: lean > .7 ? 'shut' : wake ? 'happy' : 'l', blush: lean > .5 || wake ? 1 : 0, lean: lean > .6 ? -1 : 0 }, 2);
      for (let x = 22; x < 160; x++) { const top = 54 + ri(Math.max(0, Math.sin((x - 22) / 50)) * 2); prect(b, x, top, 1, 90 - top, '#F2C4CE'); }
      prect(b, 22, 54, 138, 3, '#FBF2F4'); for (let i = 0; i < 10; i++) pdot(b, 30 + i * 13, 66 + (i % 2) * 8, '#E8A2B2');
      if (!wake) for (let i = 0; i < 2; i++) { const u = ((s * .5 + i / 2) % 1); pzz(b, 84 + u * 8, 36 - u * 12, rgba('#8A90C0', Math.sin(Math.PI * u) * (1 - lean))); }
      const kiss = Lc(21, 3);
      for (let i = 0; i < 5; i++) { const u = seg(s, kiss + i * .15, kiss + .9 + i * .15); if (u > 0 && u < 1) pheart(b, 66 + (i - 2) * 5 + Math.sin(u * 6 + i) * 2, 36 - u * 22, rgba('#FF5A78', 1 - u)); }
      if (wake) for (let i = 0; i < 3; i++) { const u = seg(s, Lc(21, 5) + i * .2, Lc(21, 5) + .8 + i * .2); if (u > 0 && u < 1) pheart(b, 52 + i * 8, 36 - u * 16, rgba('#FF7A90', 1 - u)); }
    }, { glow: .6 });
  }, { tr: { type: 'dither', dur: .5 } });

  // V2g：阳台——她趴在栏杆上看一群鸟飞远（背影）；他站在门口看着她
  scene('V2g', CUT(22), (g, s, k) => {
    shot(g, 'v2g', 160, 90, 12, (b, gl) => {
      psky(b, 160, 90, [[0, '#86BEEA'], [.6, '#CCE4F4'], [1, '#F6EEDC']]);
      pdisc(b, 136, 14, 6, '#FFF8E4'); if (gl) pdisc(gl, 136, 14, 11, 'rgba(255,246,220,.7)');
      pcloud(b, ((s * 2) % 220) - 50, 20, 30, '#FFFFFF', '#E2ECF6'); pcloud(b, ((s * 1.4 + 110) % 220) - 50, 34, 22, '#FFFFFF', '#E2ECF6');
      for (let i = 0; i < 12; i++) { const c = ['#C9A48E', '#9FB0C4', '#D8C2A0', '#B4A0B8'][i % 4], hx = i * 14 - 4, hh = 6 + ri(hash(i, 3) * 8), hy = 58 - hh; prect(b, hx, hy, 12, hh + 4, c); for (let j = 0; j < 4; j++) prect(b, hx - 1 + j, hy - j, 14 - j * 2, 1, shade(c, .65)); if (hash(i, 4) < .6) prect(b, hx + 4, hy + 2, 3, 2, shade(c, .8)); }
      const fl = clamp(k / 2.4);
      pbirds(b, s, ri(lerp(104, 172, fl)), ri(lerp(40, 4, fl)), 7, 1, '#4A4458');
      // 栏杆
      prect(b, 34, 58, 126, 2, '#F2ECE2'); prect(b, 34, 68, 126, 2, '#F2ECE2'); for (let x = 36; x < 160; x += 5) prect(b, x, 60, 1, 8, '#F2ECE2');
      prect(b, 0, 70, 160, 20, '#D8CFC2'); for (let x = 0; x < 160; x += 10) prect(b, x, 70, 1, 20, '#C6BCAE'); prect(b, 0, 70, 160, 1, '#BFB4A4');
      for (const px of [138, 150]) { prect(b, px, 62, 8, 8, '#B86A48'); pdisc(b, px + 4, 58, 4, '#6EA058'); pdot(b, px + 2, 56, '#FFD6E0'); }
      // 门口
      prect(b, 2, 14, 28, 56, '#5A4038'); prect(b, 0, 12, 32, 2, '#F2ECE2'); prect(b, 0, 14, 2, 56, '#F2ECE2'); prect(b, 30, 14, 2, 56, '#F2ECE2');
      if (gl) prect(gl, 3, 15, 26, 54, 'rgba(255,190,120,.25)');
      for (let i = 0; i < 6; i++) prect(b, 24 + ri(Math.sin(s * 2 + i * .5) * 1.5), 15 + i * 9, 4, 9, i % 2 ? '#EADCD0' : '#F4EAE0');
      monAt(b, 4, 70, { who: 'he', eyes: 'r' }, 1);
      monAt(b, 84, 74, { who: 'she', back: 1, armL: 'up', armR: 'up' }, 1);
      drift(s, 160, 90, { n: 5, v: 4, vx: 24, seed: 141 }, (x, y) => pdot(b, x, y, '#FFD6E0'));
    }, { glow: .6 });
  }, { tr: { type: 'dither', dur: .4 } });

  // V2h：山坡上起风了——她拉着风筝往前跑，他在后面笑着追；"孤独的自由"时镜头跟着风筝往上摇，只剩风筝在天上
  scene('V2h', CUT(23), (g, s, k) => {
    const tilt = E.io(seg(s, Lc(23, 4) - .2, Lc(23, 4) + 1.8));
    shot(g, 'v2h', 320, 180, 6, (b, gl) => {
      const ty = meadow(b, gl, s, { tilt });
      const run = clamp(k / 3.2), sx = ri(lerp(70, 200, run)), hx = ri(lerp(14, 160, clamp((k - .15) / 3.2)));
      const sgy = meadowY(sx + 12) + ty, hgy = meadowY(hx + 12) + ty;
      monAt(b, hx, hgy - (Math.floor(s * 9) % 2), { who: 'he', eyes: 'happy', armL: 'up', armR: 'up', legs: walkLeg(s, 9), blush: 1 }, 1);
      monAt(b, sx, sgy - (Math.floor(s * 9 + 1) % 2), { who: 'she', eyes: 'happy', armR: 'hi', legs: walkLeg(s + .2, 9) }, 1);
      // 风筝：先在她身后低低地飞，越飞越高；镜头往上摇的时候风筝留在画面上方
      const rise = E.out(seg(k, .2, 2.4)), kyW = lerp(lerp(sgy - 30 - ty, 34, rise), -86, tilt), kx = ri(sx - 34 + rise * 6 + tilt * 70 + Math.sin(s * 1.7) * 3), ky = ri(kyW + ty + Math.sin(s * 2.3) * 2);
      const hand = [sx + 18, sgy - 21];
      pcurve(b, hand[0], hand[1], (hand[0] + kx) / 2 + 10, (hand[1] + ky) / 2 + 14, kx, ky + 8, '#F4F0E8', 30);
      pkite(b, kx, ky, s, 1);
      drift(s, 320, 180, { n: 18, v: 3, vx: -60, seed: 151 }, (x, y) => { prect(b, x, y, 4, 1, 'rgba(255,255,255,.45)'); });
      if (tilt > 0) drift(s, 320, 180, { n: 10, v: 8, vx: 40, seed: 152 }, (x, y) => { pdot(b, x, y, rgba('#FFD6E0', tilt)); pdot(b, x + 1, y, rgba('#FFD6E0', tilt)); });
    });
  }, { tr: { type: 'whip', dur: .45 } });
});
