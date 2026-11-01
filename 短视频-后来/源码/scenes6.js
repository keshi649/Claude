'use strict';
/* scenes6.js —— 第三遍"你都如何回忆我"到第三遍副歌（204.7~242.8 秒）：
   S48 他那边：深夜的书桌，他翻开本子——里面也夹着那朵干了的栀子（就是当年水洼里捡起来的那朵）。
   S49 他站在窗前看手机：聊天的最后一条还是"毕业快乐"，顶上忽然出现"对方正在输入…"，又消失了。
   S50 冬天，地铁站台，车进站。   S51 车厢里，她起身给老奶奶让座。
   S52 对面的列车擦身而过，那扇窗里站着他；她回头时，车已经过去了。
   S53 俯拍换乘大厅的人流：他被人潮带走，她逆着人流挤过去。
   S54 她跑上出站的台阶，外面下雪了。   S55 人潮从身边流过，她站着不动，笑着流泪。
   S56 她抬头，一片雪花落在手心，变成一片栀子花瓣。 */

const MAN_L = { x: .6, y: -.7, rim: '#FFD9A8', rimA: .6, sh: .35, col: '#141026' };

/* ---------------- S48 他的书桌 ---------------- */
function shHisDesk(g, t, s) {
  const lt = t - s.t, z = 1 + lt * .03;
  g.save(); g.translate(W * .45, H * .6); g.scale(z, z); g.translate(-W * .45, -H * .6);
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#1E2232'], [1, '#0E0E16']]); g.fillRect(0, 0, W, H);
  // 窗外的城市
  g.save(); g.beginPath(); g.rect(560, 260, 440, 640); g.clip();
  g.fillStyle = '#0A1028'; g.fillRect(560, 260, 440, 640); g.drawImage(skyline(221, 600, 500, { col: '#141A30', lit: .4 }), 500, 420);
  g.restore();
  g.strokeStyle = '#2A2830'; g.lineWidth = 18; g.strokeRect(560, 260, 440, 640);
  // 台灯、桌子
  g.fillStyle = '#222'; g.fillRect(830, 1030, 12, 290); ell(g, 836, 1318, 60, 12, 0, '#222');
  g.fillStyle = '#D8C08A'; poly(g, [[760, 1030], [910, 1030], [880, 940], [790, 940]]); g.fill();
  glow(g, 836, 1080, 520, '#FFC880', .6);
  // 他坐着，低头看本子
  const sm = env(t, ch(37, 1), ch(37, 2) + .2, ch(37, 4) - .3, ch(37, 5));
  const u = 1100 / 7.3, floor = 1320 + 2.0 * u;
  // 椅子
  g.fillStyle = '#2A2028'; g.fillRect(180, floor - 2.05 * u, 230, 22); g.fillRect(190, floor - 2.05 * u, 16, 2.05 * u); g.fillRect(384, floor - 2.05 * u, 16, 2.05 * u); g.fillRect(180, floor - 4.0 * u, 18, 2.0 * u);
  const F = { x: 290, y: floor, h: 1100, who: 'man', view: 'side', dir: 1, light: { x: .9, y: -.3, rim: '#FFD08A', rimA: .7, sh: .45, col: '#0E0A14' }, eyes: t > ch(37, 5) ? 'closed' : 'down', smile: sm > .5, pose: Object.assign(POSE.sit(2.05), { lean: .22, head: .38, arms: [{ sh: .75, el: 1.0 }, { sh: .65, el: 1.1 }] }) };
  // 桌面挡住腿：先画人，再画桌子
  fig(g, F);
  g.fillStyle = '#2A2230'; g.fillRect(470, 1320, W, 600); g.fillStyle = '#4A3A40'; g.fillRect(470, 1310, W, 22);
  // 本子：翻开，里面夹着干了的栀子
  g.save(); g.translate(600, 1300); g.scale(1, .32);
  g.fillStyle = '#E4D8BE'; g.fillRect(-200, -170, 400, 340); g.fillStyle = 'rgba(80,60,40,.25)'; g.fillRect(-4, -170, 8, 340);
  const open = E.out(seg(lt, .2, 1.2));
  g.globalAlpha = open; gardenia(g, 60, 0, 90, 1.2, { aged: .9 });
  g.restore();
  g.restore();
}

/* ---------------- S49 他的手机："对方正在输入…" ---------------- */
function shHisPhone(g, t, s) {
  const lt = t - s.t;
  g.fillStyle = '#0A0C18'; g.fillRect(0, 0, W, H);
  // 窗外的灯（虚的）
  bokeh(g, t, { n: 30, seed: 231, size: 120, a: .35, cols: ['#FFC880', '#9FD0FF', '#FF8AA8'] });
  // 他的肩膀和侧脸（左边，剪影）
  fig(g, { x: 200, y: 3900, h: 3600, who: 'man', view: 'side', dir: 1, sil: '#08080E', light: { x: 1, y: -.2, rim: '#FFC890', rimA: .7, rimW: .002 }, pose: { head: .3 } });
  // 手机
  const px = 640, py = 1000, pw = 520, ph = 1000;
  g.save(); g.translate(px, py); g.rotate(-.06);
  g.fillStyle = '#16161C'; g.beginPath(); g.roundRect(-pw / 2, -ph / 2, pw, ph, 54); g.fill();
  g.fillStyle = '#F2F2F4'; g.beginPath(); g.roundRect(-pw / 2 + 18, -ph / 2 + 18, pw - 36, ph - 36, 40); g.fill();
  const x0 = -pw / 2 + 18, y0 = -ph / 2 + 18, sw = pw - 36;
  g.fillStyle = '#E4E4E8'; g.fillRect(x0, y0 + 36, sw, 100);
  // "对方正在输入…"：她那边打字的那几秒（和 S36 是同一个时刻）
  const typing = env(t, ch(38, 1), ch(38, 1) + .2, ch(38, 9), ch(38, 9) + .15);
  if (typing > 0) text(g, '对方正在输入…', 0, y0 + 86, 30, `rgba(80,80,90,${typing})`, { weight: 500 });
  else circ(g, 0, y0 + 86, 30, '#C8A890');
  text(g, '2010 年 6 月 30 日', 0, y0 + 200, 24, '#999');
  g.fillStyle = '#95EC69'; g.beginPath(); g.roundRect(x0 + sw - 30 - 230, y0 + 240, 230, 84, 18); g.fill();
  text(g, '毕业快乐', x0 + sw - 30 - 115, y0 + 282, 34, '#222', { weight: 500 });
  g.restore();
  glow(g, px, py, 500, '#C0D8FF', .15);
}

/* ---------------- 地铁（S50~S52） ---------------- */
function subwayPlatform(g, t) {
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#1A1E28'], [1, '#2A2A32']]); g.fillRect(0, 0, W, H);
  g.fillStyle = '#D8D8D0'; for (let i = 0; i < 6; i++) { g.fillRect(i * 200 + 30, 120, 140, 16); glow(g, i * 200 + 100, 130, 160, '#F0F4FF', .25); }
  g.fillStyle = '#3A4A5A'; g.fillRect(0, 500, W, 700);
  g.fillStyle = '#C8C0B0'; g.fillRect(0, 1200, W, 720); g.fillStyle = '#E8C850'; g.fillRect(0, 1210, W, 18);
}
function shSubwayArrive(g, t, s) {
  const lt = t - s.t;
  subwayPlatform(g, t);
  // 车从右边冲进来，车头的灯一扫
  const k = E.out(seg(lt, 0, 1.6)), tx = lerp(W + 2400, -200, k);
  g.fillStyle = '#C8CCD4'; g.fillRect(tx, 560, 4000, 620);
  for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(255,248,230,.85)'; g.fillRect(tx + 80 + i * 260, 640, 180, 260); }
  g.fillStyle = '#C04A3A'; g.fillRect(tx, 960, 4000, 30);
  if (k < 1) { glow(g, tx + 40, 900, 300, '#FFFFFF', .7 * (1 - k)); for (let i = 0; i < 8; i++) { g.fillStyle = `rgba(255,255,255,${.08 * (1 - k)})`; g.fillRect(tx + i * 120, 560, 600, 620); } }
  fig(g, { x: 360, y: 1760, h: 1000, who: 'woman', view: 'side', dir: 1, light: { x: .4, y: -.9, rim: '#F0F4FF', rimA: .5, sh: .35, col: '#141026' }, pose: { head: -.05 }, wind: .3 * (1 - k) });
}
function trainCar(g, t, o = {}) {
  // 车厢里：一排座位、扶杆、窗外是黑的隧道和一闪一闪的灯
  g.fillStyle = '#C8CCD2'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#0A0C14'; g.fillRect(40, 380, W - 80, 560);
  for (let i = 0; i < 6; i++) { const x = mod(i * 260 - t * 2200, W + 400) - 200; g.fillStyle = 'rgba(255,220,160,.7)'; g.fillRect(x, 640, 140, 8); }
  g.fillStyle = '#B0B4BA'; g.fillRect(0, 360, W, 24); g.fillRect(0, 936, W, 24); g.fillRect(W / 2 - 10, 380, 20, 560);
  g.fillStyle = '#5A8AB8'; g.fillRect(0, 1260, W, 120); g.fillStyle = '#4A7AA8'; g.fillRect(0, 1380, W, 40);
  g.fillStyle = '#9A9EA4'; g.fillRect(0, 1420, W, 500);
  g.strokeStyle = '#D8DCE0'; g.lineWidth = 16; g.beginPath(); g.moveTo(100, 0); g.lineTo(100, H); g.moveTo(980, 0); g.lineTo(980, H); g.stroke();
}
function shGiveSeat(g, t, s) {
  const lt = t - s.t;
  trainCar(g, t);
  const up = E.io(seg(lt, .4, 1.6));
  // 老奶奶拄着拐杖走过来，坐下
  const sitK = E.io(seg(lt, 2.0, 3.0));
  const ox = lerp(1250, 700, E.out(seg(lt, 0, 2.0)));
  const old = { hair: '#C8C8CC', coat: '#7A5A6A', coatD: '#5A4050', pants: '#3A3A40', shoe: '#2A2A2A', fem: 1 };
  fig(g, { x: lerp(ox, 640, sitK), y: 1800 - sitK * 0, h: 860, look: old, view: 'side', dir: -1, light: { x: .3, y: -1, sh: .25 }, eyes: 'closed', smile: sitK > .5, pose: sitK > .2 ? Object.assign(POSE.sit(2.1), { lean: .1 }) : Object.assign(POSE.walk(lt * .7, .5), { lean: .2, head: .1, arms: [{ sh: .5, el: .2 }, { sh: .1, el: .2 }] }) });
  // 她从座位上站起来，笑着让开
  fig(g, { x: lerp(560, 300, up), y: 1800, h: 1000, who: 'woman', view: 'side', dir: 1, light: { x: .3, y: -1, sh: .3 }, eyes: up > .7 ? 'closed' : 'open', smile: up > .5, blush: .1, pose: up < .5 ? Object.assign(POSE.sit(2.1), { lean: .1 + up * .4 }) : { lean: .05, head: .1, arms: [{ sh: .2, el: .2 }, { sh: 2.9, el: .1 }] } });
}
function shTrainsPass(g, t, s) {
  const lt = t - s.t;
  // 她的车厢里往外看：对面的车擦身而过，窗一扇扇闪过去，其中一扇里是他
  g.fillStyle = '#0A0C14'; g.fillRect(0, 0, W, H);
  const pass = seg(lt, .2, 2.8);
  if (pass > 0 && pass < 1) {
    const off = pass * 3300;
    g.fillStyle = '#B8BCC4'; g.fillRect(0, 300, W, 1100);
    for (let i = 0; i < 12; i++) {
      const x = i * 420 - off + W;
      if (x < -400 || x > W + 400) continue;
      for (let k = 3; k >= 0; k--) { g.fillStyle = `rgba(255,246,220,${k ? .18 : .9})`; g.fillRect(x + k * 60, 420, 300, 520); }   // 往后拖的虚影
      if (i === 2) fig(g, { x: x + 150, y: 940 + 640, h: 900, who: 'man', view: 'side', dir: 1, light: { x: .3, y: -1, sh: .3 }, eyes: 'down', pose: { head: .35, arms: [{ sh: .9, el: 1.5 }, { sh: .1, el: .2 }] } });
    }
  }
  // 车窗框和她的倒影（左边）
  g.fillStyle = '#C8CCD2'; g.fillRect(0, 0, W, 300); g.fillRect(0, 1400, W, 520); g.fillRect(0, 0, 60, H); g.fillRect(W - 60, 0, 60, H);
  const turn = E.io(seg(lt, 1.6, 2.2));
  fig(g, { x: 200, y: 3200, h: 2800, who: 'woman', view: 'side', dir: 1, light: { x: .5, y: -1, rim: '#FFF0D0', rimA: .5, sh: .35 }, eyes: 'open', pose: { head: -.05 + turn * .05 } });
}

/* ---------------- S53 换乘大厅的人流（俯拍） ---------------- */
function personTop(g, x, y, s, col, rot) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(s * .1, s * .15, s * .6, s * .4, 0, 0, TAU); g.fill();
  g.fillStyle = col; g.beginPath(); g.ellipse(0, 0, s * .58, s * .34, 0, 0, TAU); g.fill();   // 肩
  g.fillStyle = '#1E1A20'; circ(g, 0, 0, s * .22);                                          // 头顶
  g.restore();
}
function shStationCrowd(g, t, s) {
  const lt = t - s.t;
  g.fillStyle = '#5A5A60'; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 3; for (let i = 0; i < 20; i++) { g.beginPath(); g.moveTo(i * 60, 0); g.lineTo(i * 60, H); g.stroke(); g.beginPath(); g.moveTo(0, i * 100); g.lineTo(W, i * 100); g.stroke(); }
  const r = R(241), cols = ['#2A2E38', '#3A3A44', '#4A3A3A', '#2A3440', '#5A4A40', '#3A4A3A'];
  for (let i = 0; i < 160; i++) {
    const lane = r() * W, sp = 120 + r() * 90, dir = r() > .3 ? -1 : 1, y = mod(r() * (H + 200) + dir * sp * t, H + 200) - 100;
    personTop(g, lane + Math.sin(t * 2 + i) * 8, y, 60, cols[i % cols.length], dir > 0 ? PI / 2 : -PI / 2);
  }
  // 他（深蓝大衣）被人流往上带走；她（米色）逆着往上挤
  const hy = lerp(900, -100, seg(lt, 0, 3.0)), sy = lerp(1900, 1300, E.out(seg(lt, 0, 3.2)));
  personTop(g, 600, hy, 64, '#2B3A5C', -PI / 2); glow(g, 600, hy, 60, '#9FC0FF', .3);
  personTop(g, 480 + Math.sin(lt * 6) * 30, sy, 64, '#CDB592', -PI / 2); glow(g, 480, sy, 80, '#FFE0B0', .35);
}

/* ---------------- 雪（S54~S56） ---------------- */
function snow(g, t, o = {}) {
  const n = o.n || 160, r = R(o.seed || 251);
  for (let i = 0; i < n; i++) {
    const sp = 60 + r() * 120, s = (o.size || 4) * (.5 + r() * 1.2), y = mod(r() * (H + 100) + t * sp, H + 100) - 50, x = r() * W + Math.sin(t * (.5 + r()) + i) * 40;
    g.fillStyle = `rgba(255,255,255,${.5 + r() * .5})`; circ(g, x, y, s);
  }
}
function shStairsSnow(g, t, s) {
  const lt = t - s.t;
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#1A1E30'], [.5, '#3A3E50'], [1, '#2A2A34']]); g.fillRect(0, 0, W, H);
  glow(g, 540, 300, 600, '#FFE0B0', .3);
  // 台阶从右下往左上
  for (let i = 0; i < 14; i++) { const y = 1900 - i * 110, x = 1100 - i * 40; g.fillStyle = shade('#6A6A72', 1 - i * .02); g.fillRect(-200, y - 110, x + 200, 110); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-200, y - 110, x + 200, 8); }
  const k = seg(lt, 0, 1.95), x = lerp(900, 380, k), y = lerp(1900, 1050, k) + 60;
  fig(g, { x, y, h: 860, who: 'woman', view: 'side', dir: -1, light: { x: -.3, y: -1, rim: '#F0F4FF', rimA: .6, sh: .35, col: '#141026' }, pose: Object.assign(POSE.run(lt * 1.6), { lean: .3 }), eyes: 'open', wind: .3 });
  snow(g, t, { n: 140 });
}
function shStandStill(g, t, s) {
  const lt = t - s.t;
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#141826'], [.6, '#2A2E40'], [1, '#3A3A46']]); g.fillRect(0, 0, W, H);
  g.drawImage(shopRow(), -600, 400, 2700, 675);
  g.fillStyle = 'rgba(20,24,40,.4)'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#C8CCD8'; g.fillRect(0, 1450, W, 470);
  // 人潮：快进一样，拉成一道道虚影
  const q = layer('crowdBlur');
  for (let i = 0; i < 26; i++) {
    const dir = i % 2 ? 1 : -1, sp = 1400 + hash(i, 2) * 900, x = mod(hash(i, 1) * 3000 + dir * t * sp, 3000) - 900, depth = hash(i, 3);
    const h = 700 + depth * 700, y = 1500 + depth * 380;
    q.globalAlpha = .6;
    for (let k = 0; k < 4; k++) tiny(q, x - dir * k * 50, y, h, ['#2A2E38', '#4A3A40', '#3A4450', '#2A2A30'][i % 4], { coat: 1 });
  }
  g.save(); g.filter = 'blur(3px)'; g.globalAlpha = .95; g.drawImage(LAYER.crowdBlur, 0, 0); g.restore();
  // 她站着不动，笑着流泪
  const tear = seg(lt, .8, 3.6);
  fig(g, { x: 540, y: 1830, h: 1150, who: 'woman', view: 'front', light: { x: .4, y: -1, rim: '#F0F4FF', rimA: .5, sh: .25 }, eyes: lt > 2.6 ? 'closed' : 'open', smile: lt > 1.5 ? 1 : 0, tear: .9, tearY: tear, wind: .15 });
  snow(g, t, { n: 160, seed: 253 });
}
function shSnowPetal(g, t, s) {
  const lt = t - s.t;
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#0E1220'], [1, '#2A2E40']]); g.fillRect(0, 0, W, H);
  bokeh(g, t, { n: 24, seed: 261, size: 120, a: .35, cols: ['#FFC880', '#FFFFFF', '#9FD0FF'] });
  snow(g, t, { n: 120, size: 6, seed: 262 });
  // 抬头的侧脸（上半）、伸出的手心（下半）
  fig(g, { x: 380, y: 2900, h: 2600, who: 'woman', view: 'side', dir: 1, light: { x: .5, y: -1, rim: '#F0F4FF', rimA: .7, sh: .35, col: '#141026' }, eyes: lt > 3 ? 'closed' : 'open', smile: lt > 3.4, pose: { head: -.35, arms: [{ sh: 0, el: 0 }, { sh: 0, el: 0 }] } });
  hand(g, 160, 1520, 1.9, -.12, 'up', '#CDB592');
  // 一片雪花飘下来，落到手心里变成花瓣，再化成光
  const k = seg(lt, .6, 3.0), x = lerp(760, 560, k) + Math.sin(k * 8) * 40 * (1 - k), y = lerp(200, 1470, E.out2(k));
  const morph = seg(lt, 3.0, 3.8), melt = seg(lt, 4.6, 5.9);
  if (morph < 1) { g.fillStyle = `rgba(255,255,255,${1 - morph})`; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + k * 2; g.strokeStyle = `rgba(255,255,255,${1 - morph})`; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 26, y + Math.sin(a) * 26); g.stroke(); } }
  if (morph > 0) { withAlpha(g, morph * (1 - melt), () => { g.save(); g.translate(x, y); g.rotate(1.2); g.drawImage(petalImg(), -30, -45, 60, 90); g.restore(); }); glow(g, x, y, 120 + melt * 200, '#FFF6D8', .6 * Math.sin(morph * PI * .5) * (1 - melt * .5)); }
}
