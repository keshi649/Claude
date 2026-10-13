'use strict';
/* scenes4.js：第二遍主歌。A 段（女声，第 34~42 小节）：第二天夜里她又飞起来，这次小指上系着一根红线，一路牵向城市的另一头；
   B 段（男声，第 42~50 小节）：他的第二个夜里，魔法一点点找上门——红线穿过窗户碰到那只粉杯子，
   电影终于往下放了，对方正在输入…，橙色的小怪玩偶活了过来，拉着他飞出窗外。 */

/* ---------- 第 34 小节：想要和你低空飞行（第二夜） ----------
   贴着河面飞，红线从她的小指一直牵到画面右边很远的地方。 */
function sRiverFly(g, s, k) {
  const x = 3000 + k * 700;
  riverNight(g, s, x, { moonX: 1550, moonY: 180 });
  const bx = 640, by = 520 + Math.sin(s * 2.4) * 8;
  flyingBed(g, s, bx, by, .62, { plush: PLUSH.pink, eyes: 'open', mouth: 'n', plushEyes: 'glow', plushGlow: .7, wind: .7,
    pose: { tilt: .08, head: -.05, aN: [1.6, .1], aF: [.4, .9], lN: [1.5, -1.45], lF: [1.45, -1.5] } });
  const hand = handPos({ x: bx + (-150) * .62, y: by + 8 * .62, u: 46 * .62, face: 1, pose: { tilt: .08, aN: [1.6, .1] } }, 'N');
  redThread(g, s, [hand, [hand[0] + 300, hand[1] - 40], [hand[0] + 700, hand[1] + 30], [1500, 470], [W + 80, 430]], { u: E.out(seg(k, 0, .9)), w: 3 });
  glow(g, hand[0], hand[1], 26, '#FF6A8A', .9);
}
/* ---------- 第 35 小节：和你到处收集氧气 ----------
   屋顶上的一片蒲公英。她弯下腰摘一朵，吹一口气，种子带着光飞起来。 */
function sDandelion(g, s, k) {
  flightBg(g, s, { x: 5200 + k * 120, moon: [1560, 200, 86], cloudA: .5, cloudY: 560 });
  // 屋顶草地
  g.fillStyle = '#121638'; g.fillRect(0, 820, W, 260); g.fillStyle = '#2A3270'; g.fillRect(0, 812, W, 10);
  g.fillStyle = '#16244A'; g.beginPath(); g.moveTo(0, 830); for (let x = 0; x <= W; x += 20) g.lineTo(x, 800 - hash(x, 3) * 30 - Math.sin(x * .02 + s * 2) * 4); g.lineTo(W, 830); g.fill();
  for (let i = 0; i < 18; i++) dandelion(g, 80 + i * 105 + hash(i, 1) * 40, 815, .9 + hash(i, 2) * .4, s, i === 7 ? seg(k, 1.05, 2.4) : 0);
  const bx = 900, by = 600 + Math.sin(s * 2) * 6;
  const lean = E.io(seg(k, .2, .7)) * (1 - E.io(seg(k, 1.6, 2.2)));
  flyingBed(g, s, bx, by, .62, { plush: PLUSH.pink, eyes: k > 1.0 && k < 1.6 ? 'closed' : 'happy', mouth: k > 1.0 && k < 1.6 ? 'o' : 'smile', plushEyes: 'happy', wind: .3, trail: false,
    pose: { tilt: lerp(.05, .55, lean), head: lerp(0, .3, lean), aN: [lerp(.5, 1.3, lean), .3], aF: [.4, .9], lN: [1.5, -1.45], lF: [1.45, -1.5] } });
  // 她手里那朵，吹散
  const hu = seg(k, 1.05, 2.4);
  if (k > .6) dandelion(g, 960, 560, .8, s, hu);
}
/* ---------- 第 36 小节：假如迷雾你看不清 ----------
   河上起了大雾，什么都看不清，只有那根红线还亮着，一直通到雾里。 */
function sFogThread(g, s, k) {
  riverNight(g, s, 9000 + k * 300, { moonX: 1500, moonY: 200 });
  const thick = .45 + E.io(seg(k, 0, 2)) * .4;
  fogLayer(g, s, '#B8BEE6', 250, 1050, thick * .6, 40, 0, 2.2);
  g.fillStyle = `rgba(170,176,220,${thick * .5})`; g.fillRect(0, 0, W, H);
  const bx = 560, by = 560 + Math.sin(s * 2.2) * 8;
  flyingBed(g, s, bx, by, .55, { plush: PLUSH.pink, eyes: 'open', mouth: 'n', plushEyes: 'glow', plushGlow: .8, wind: .5,
    pose: { tilt: .1, head: -.05, aN: [1.65, .05], aF: [.4, .9], lN: [1.5, -1.45], lF: [1.45, -1.5] } });
  fogLayer(g, s, '#C8CDF0', 0, H, thick * .55, 70, 1, 2.0);
  const hand = handPos({ x: bx - 150 * .55, y: by + 8 * .55, u: 46 * .55, face: 1, pose: { tilt: .1, aN: [1.65, .05] } }, 'N');
  redThread(g, s, [hand, [hand[0] + 400, hand[1] - 30], [1200, 520], [1600, 470], [W + 60, 440]], { w: 4 });
  for (let i = 0; i < 8; i++) glow(g, lerp(hand[0], W, i / 8) + Math.sin(s * 2 + i) * 20, lerp(hand[1], 440, i / 8), 40, '#FF6A8A', .25);
}
/* ---------- 第 37 小节：不如坠入我的心里 ----------
   她从床上跳进河里月亮的倒影——画面翻过来，掉进倒过来的天空里。 */
function sMirrorFall(g, s, k) {
  const flip = E.io(seg(k, .9, 1.7));
  g.save();
  g.translate(W / 2, H / 2); g.rotate(flip * Math.PI); g.scale(1 + flip * .15, 1 + flip * .15); g.translate(-W / 2, -H / 2);
  riverNight(g, s, 12000, { moonX: 960, moonY: 220, horizon: 560 });
  g.restore();
  // 她跳下去：从床边往下（翻转以后变成往"上"掉进天空）
  const ju = seg(k, .2, 2.5);
  const py = lerp(380, 980, E.in2(ju)), px = 960 + Math.sin(s * 2) * 20;
  if (ju < .9) person(g, { who: 'she', x: px, y: flip > .5 ? H - py : py, u: 40, face: 1, rot: lerp(.3, Math.PI * .95, E.io(ju)) + (flip > .5 ? Math.PI : 0), pose: { tilt: .3, head: -.4, aN: [2.8, .1], aF: [2.6, .1], lN: [-.2, -.3], lF: [-.4, -.5] }, t: s, eyes: 'closed', mouth: 'smile', blush: .7, wind: [0, -2], light: LIGHT.moon });
  // 月亮的倒影变成一个亮洞
  const portal = E.out(seg(k, 1.4, 2.5));
  glow(g, 960, 540, 200 + portal * 900, '#FFF2D8', portal * .9);
}
/* ---------- 第 38 小节：想带你从吵闹到安宁 ----------
   高架桥上的车灯拖成长长的光带，喇叭响个不停。她举起手——时间停了，光带变成一颗颗静止的光点。 */
function sFreeze(g, s, k) {
  const fz = E.io(seg(s, 97.1, 97.7));
  overpass(g, s, fz, { t0: 97.1 });
  if (fz < 1) [['嘀——', 300, 420, .1], ['叭!', 1500, 360, .5], ['嘀嘀', 900, 300, .9]].forEach(([w, x, y, t0], i) => {
    const u = seg(k, t0, t0 + .3); if (u <= 0) return;
    text(g, w, x, y, 80, { k: 'brush', col: '#FFF3A0', alpha: Math.min(1, u * 3) * (1 - fz), sc: .6 + E.back(u) * .4, rot: (hash(i, 7) - .5) * .4, glow: '#FF4FA8', gr: 20 });
  });
  if (fz > 0 && fz < 1) glow(g, 960, 300, 1400 * fz, '#E8F0FF', (1 - fz) * .6);
  const reach = E.out(seg(s, 96.6, 97.2));
  flyingBed(g, s, 900, 330 + Math.sin(s * 2) * 8 * (1 - fz), .55, { plush: PLUSH.pink, eyes: fz > .5 ? 'closed' : 'open', mouth: fz > .5 ? 'smile' : 'n', plushEyes: fz > .5 ? 'happy' : 'n', wind: .6 * (1 - fz), trail: fz < .5,
    pose: { tilt: -.05, head: -.2, aN: [lerp(.5, 2.7, reach), .1], aF: [.4, .9], lN: [1.5, -1.45], lF: [1.45, -1.5] } });
}
/* ---------- 第 39 小节：想带你从多云到转晴 ----------
   下雨了。她撑开一把粉色的伞，雨停了，云散开，夜空里挂出一道淡淡的月虹。 */
function sMoonbow(g, s, k) {
  const stop = E.io(seg(k, 1.0, 1.8));
  skyGrad(g, [[0, mixc('#1A1E3A', '#0B1240', stop)], [.7, mixc('#2E3456', '#2B2E70', stop)], [1, mixc('#3A3F62', '#4A3A7E', stop)]]);
  stars(g, s, 900, 0, stop);
  moon(g, 1560, 200, 78, { a: .3 + stop * .7, haloA: .6 });
  // 月虹
  if (stop > 0) {
    g.save(); g.globalCompositeOperation = 'lighter';
    ['#FF8A8A', '#FFD08A', '#F4FF9A', '#9AFFB8', '#9AD8FF', '#B89AFF'].forEach((c, i) => { g.strokeStyle = rgba(c, .16 * stop); g.lineWidth = 16; g.beginPath(); g.arc(960, 1200, 900 - i * 16, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); });
    g.restore();
  }
  cityLayer(g, CITY.far, 7000, 1000, .9); cityLayer(g, CITY.mid, 6000, 1120, 1);
  for (let i = 0; i < 9; i++) { const side = i % 2 ? 1 : -1; cloud(g, i, 960 + side * (200 + i * 80) + side * stop * 900, 120 + (i % 4) * 90, 1000, CLOUD.rain, (1 - stop * .8)); }
  rain(g, s, 360, { col: `rgba(200,215,255,${.4 * (1 - stop)})`, sp: 1500, len: 40, ang: .1 });
  const open = E.back(seg(k, .2, .7));
  const bx = 900, by = 640 + Math.sin(s * 2) * 6;
  flyingBed(g, s, bx, by, .6, { plush: PLUSH.pink, eyes: stop > .5 ? 'happy' : 'open', mouth: 'smile', plushEyes: stop > .5 ? 'happy' : 'n', wind: .3, trail: false,
    pose: { tilt: -.02, head: -.25, aN: [2.4, -.3], aF: [.5, .9], lN: [1.5, -1.45], lF: [1.45, -1.5] } });
  const hp = handPos({ x: bx - 150 * .6, y: by + 8 * .6, u: 46 * .6, face: 1, pose: { tilt: -.02, aN: [2.4, -.3] } }, 'N');
  umbrella(g, hp[0] + 6, hp[1] - 110 * .6, 150 * .6, '#F28CB0', open, -.1);
}
/* ---------- 第 40 小节：想要为你整理衬衣 ----------
   她打开衣柜，他留下的那件浅蓝衬衫还挂着。她踮脚理了理领子，然后把它抱在怀里。 */
function sShirt(g, s, k) {
  const z = 1.12 + k * .03;
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-930, -560);
  g.save(); g.translate(0, 190); closet(g, s, { collar: E.io(seg(k, .4, .9)), lift: E.io(seg(k, 1.4, 2.0)) * 30 }); g.restore();
  g.fillStyle = '#100D26'; g.fillRect(0, 0, W, 270);
  glow(g, 1500, 300, 600, '#FFC98A', .25);
  const hug = E.io(seg(k, 1.4, 2.0));
  const reachP = { tilt: .02, head: -.4, aN: [2.55, -.3], aF: [2.45, -.2], lN: [.02, 0], lF: [-.06, 0] };
  const hugP = { tilt: .1, head: .2, aN: [1.4, 1.35], aF: [1.3, 1.45], lN: [.02, 0], lF: [-.06, 0] };
  person(g, { who: 'she', x: 840 + hug * 40, y: 770, u: 64, face: 1, pose: lerpPose(reachP, hugP, hug), t: s, eyes: hug > .5 ? 'closed' : 'open', mouth: 'smile', blush: .8, light: LIGHT.lamp });
  g.restore();
}
/* ---------- 第 41 小节：为你到处收集诗句 ----------
   她在起雾的窗玻璃上，用手指写下"晚安"。字擦开的地方，看得见远处那根红线一直通到他的楼。 */
function sFogWin(g, s, k) {
  g.fillStyle = '#100E28'; g.fillRect(0, 0, W, H);
  const write = seg(k, .15, 1.8);
  fogWindow(g, s, 260, 90, 1400, 860, '晚安', write, { behind: gg => {
    gg.fillStyle = vgrad(gg, 90, 950, [[0, '#0A0F2C'], [1, '#2C2A66']]); gg.fillRect(260, 90, 1400, 860);
    gg.save(); gg.translate(260, 0); gg.scale(.7, .7); gg.drawImage(TEX.stars, -200, 0); gg.restore();
    moon(gg, 1400, 240, 60, { haloA: .5 });
    cityLayer(gg, CITY.far, 4000, 950, .9); cityLayer(gg, CITY.mid, 2600, 1010, .95);
    redThread(gg, s, [[260, 700], [700, 640], [1100, 600], [1420, 560]], { w: 3 });
    glow(gg, 1420, 560, 50, '#FFD08A', .9); gg.fillStyle = '#FFE0A8'; gg.fillRect(1412, 552, 16, 18);
  } });
  // 窗框
  g.strokeStyle = '#2E3264'; g.lineWidth = 30; g.strokeRect(260, 90, 1400, 860); g.lineWidth = 16; g.beginPath(); g.moveTo(960, 90); g.lineTo(960, 950); g.stroke();
  // 写字的手指
  if (write > 0 && write < 1) {
    const ch = Math.min(1, Math.floor(write * 2)), cu = write * 2 - ch;
    const fx = 960 + (ch - .5) * 448 - 120 + cu * 240, fy = 500 + Math.sin(cu * 12) * 70;
    g.fillStyle = '#F6D7C3'; rr(g, fx - 18, fy, 36, 260, 18); g.fill(); g.fillStyle = '#F3B9C8'; rr(g, fx - 40, fy + 220, 80, 200, 30); g.fill();
  }
}

/* ================= 第二遍主歌 B（他的第二夜） ================= */
/* ---------- 第 42 小节：又过了每晚给你热牛奶的时间 ----------
   这次他热了两杯，把粉色那杯放在窗台上。窗外的红线穿过玻璃，轻轻绕上了杯子的把手。 */
function sMilk2(g, s, k) {
  const z = 1.25 + k * .03;
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-1080, -520);
  hisKitchen(g, s, { micro: 0, disp: '23:00', clock: '23:00', blueMug: [700, 760] });
  // 窗台上的粉杯子
  const put = E.io(seg(k, .2, .9));
  mug(g, lerp(620, 1300, put), lerp(760, 528, put), 1.1, '#F3B9C8', { ears: true, milk: true });
  for (let i = 0; i < 4; i++) { const ph = (s * .5 + i / 4) % 1; withAlpha(g, Math.sin(Math.PI * ph) * .35 * put, () => { g.strokeStyle = '#FFFFFF'; g.lineWidth = 4; g.beginPath(); g.moveTo(1300 + i * 8, 470 - ph * 30); g.quadraticCurveTo(1310 + Math.sin(s * 3 + i) * 10, 440 - ph * 50, 1300 + i * 8, 410 - ph * 70); g.stroke(); }); }
  const walking = put > 0 && put < 1;
  const wp = walking ? walkPose(s * 1.8, 0) : { tilt: .05, head: .1, aN: [.3 * (1 - E.io(seg(k, 1.1, 1.5))) + .1, .4], aF: [.15, .35], lN: [.02, 0], lF: [-.05, 0] };
  if (walking) wp.aN = [lerp(.5, 1.0, put), .5];
  person(g, { who: 'he', x: lerp(520, 1120, put), y: 762, u: 56, face: 1, pose: wp, t: s, eyes: 'half', tired: .6, mouth: 'smile', light: LIGHT.lamp });
  redThread(g, s, [[1720, 300], [1560, 380], [1420, 450], [1325, 505]], { u: E.out(seg(k, 1.2, 2.3)), w: 3 });
  g.restore();
}
/* ---------- 第 43 小节：床头还写着我们没看完的影片 ----------
   他按下播放。进度条终于从 1:12:05 往下走了，屏幕里的电影，两个小人在夜空里飞。 */
function sPlay(g, s, k) {
  g.fillStyle = vgrad(g, 0, H, [[0, '#0E1230'], [1, '#171A3A']]); g.fillRect(0, 0, W, H);
  const play = k > .5;
  const prog = .585 + Math.max(0, k - .5) * .0016;
  const secs = 4325 + Math.max(0, Math.floor((k - .5)));
  const cur = `1:${String(Math.floor(secs / 60) % 60).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  g.save(); g.translate(960, 960); g.scale(1.7, 1.7);
  laptop(g, 0, 0, 760, { prog, cur, tot: '2:03:40' });
  g.restore();
  // 屏幕里：播放以后两个小人飞起来（盖在暂停画面上）
  if (play) withAlpha(g, seg(k, .5, .8), () => {
    g.save(); g.beginPath(); g.rect(960 - 760 * .85 + 20, 960 - 760 * .62 * 1.7 + 20, 760 * 1.7 - 40, 760 * .62 * 1.7 - 80); g.clip();
    g.fillStyle = vgrad(g, 160, 900, [[0, '#1B2A5E'], [1, '#6A4C8E']]); g.fillRect(0, 0, W, H);
    stars(g, s, 500, 0, .8);
    moon(g, 1380, 330, 70, { haloA: .5 });
    const fx = 500 + (k - .5) * 300;
    pixelMon(g, fx + 220, 470, 4, PLUSH.orange, 1); pixelMon(g, fx + 300, 440, 4, PLUSH.pink, 1);
    g.restore();
  });
  if (k < .55) text(g, '▶', 960, 560, 120, { k: 'sans', col: '#FFFFFF', alpha: (1 - seg(k, .45, .55)) * .9 });
}
/* ---------- 第 44 小节：离开后的时间里你是否还失眠 ----------
   凌晨三点，聊天框的顶上出现"对方正在输入…"，又消失了。屏幕的光照着他的脸。 */
function sTyping(g, s, k) {
  g.fillStyle = vgrad(g, 0, H, [[0, '#0B0E26'], [1, '#141838']]); g.fillRect(0, 0, W, H);
  const typing = win(k, .5, 1.9, .1, .1) * (.6 + .4 * Math.sin(s * 9));
  bust(g, { who: 'he', x: 1330, y: 520, u: 120, eyes: typing > .3 ? 'wide' : 'half', tired: .6, mouth: typing > .3 ? 'o' : 'n', look: -1, light: { amb: '#7FA6E8', ambA: .35, lx: -1, ly: .1, rim: '#CFE0FF', rimA: .8, shadeA: .35 }, t: s });
  phoneUI(g, s, 640, 480, 410, { name: '她', time: '03:07', typing, msgs: [['her', '晚安', -99], ['me', '晚安', -99]] });   // 手机下沿在 y≈900，不压底部歌词
  if (typing > 0) text(g, '对方正在输入…', 640, 92, 40, { k: 'sans', col: '#E8EEFF', alpha: typing, glow: '#9FC4FF', gr: 18 });
}
/* ---------- 第 45 小节：从不熬夜的我也明显黑了眼圈 ----------
   他坐在书桌前，窗外的月亮慢慢走过去，天边泛白。钟从 04:12 跳到 05:30。 */
function sDesk(g, s, k) {
  const tl = E.io(seg(k, 0, 2.5));
  deskScene(g, s, tl);
  // 椅子
  g.fillStyle = '#2A2238'; g.fillRect(1150, 806, 170, 18); g.fillRect(1300, 600, 18, 330); g.fillRect(1160, 824, 14, 106);
  // 他：坐着，一只手撑着头，侧脸朝着窗
  const nod = Math.max(0, Math.sin(s * 1.3)) * .08;
  person(g, { who: 'he', x: 1215, y: 806, u: 66, face: -1, pose: { tilt: .22, head: .3 + nod, aN: [1.95, 2.0], aF: [1.15, 1.0], lN: [1.55, -1.5], lF: [1.5, -1.55] }, t: s, eyes: 'half', tired: 1, mouth: 'n', light: LIGHT.lamp });
  const tt = Math.round(lerp(4 * 60 + 12, 5 * 60 + 30, tl));
  g.fillStyle = '#16142C'; rr(g, 1500, 670, 160, 64, 10); g.fill();
  seg7(g, `${String(Math.floor(tt / 60)).padStart(2, '0')}:${String(tt % 60).padStart(2, '0')}`, 1517, 683, 36, '#FF6F7D', { glow: .5 });
}
/* ---------- 第 46~47 小节：你送的玩偶依然陪在身边 ----------
   枕头上的橙色小怪睁开发光的眼睛，眨了眨，跳起来朝他挥手，又指指窗外——它的手上系着红线。窗户被风推开。 */
function sAlive(g, s, k) {
  const z = 1.05 + E.io(seg(k, 0, 5)) * .1;
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-960, -560);
  hisBedroom(g, s, {});
  g.fillStyle = '#2C2550'; rr(g, 160, 640, 1560, 90, 20); g.fill();
  pillow(g, 220, 470, 400, 160, '#D9D8EE');
  const wake = seg(k, 1.2, 1.6);
  bust(g, { who: 'he', x: 470, y: 548, u: 92, tiltH: -Math.PI / 2 + .1, eyes: wake > 0 ? 'wide' : 'half', tired: .7, mouth: wake > 0 ? 'o' : 'n', light: { ...LIGHT.room, lx: .9, ly: -.4 }, t: s });
  g.fillStyle = vgrad(g, 430, H, [[0, '#8487CC'], [1, '#474A8A']]);
  g.beginPath(); g.moveTo(560, 1100); g.lineTo(560, 640); g.bezierCurveTo(590, 430, 760, 360, 920, 410); g.bezierCurveTo(1150, 480, 1400, 560, 1720, 600); g.lineTo(1720, 1100); g.closePath(); g.fill();
  // 玩偶：活了
  const hop = seg(k, 1.6, 2.6), jump = Math.sin(Math.PI * clamp(hop * 2)) * 120 + Math.sin(Math.PI * clamp(hop * 2 - 1)) * 80;
  const px = lerp(690, 1240, E.io(hop)), py = lerp(690, 520, E.io(hop)) - jump;
  const wave = k > 2.6 && k < 3.6 ? Math.abs(Math.sin(s * 8)) : 0;
  plush(g, { x: px, y: py, s: 15, col: PLUSH.orange, eyes: k < .6 ? 'n' : (k > .9 && k < 1.05 ? 'blink' : 'glow'), glow: E.out(seg(k, .5, 1.0)), tilt: hop > 0 && hop < 1 ? Math.sin(s * 10) * .2 : -.1, blush: 1, wave, waveR: wave > 0 ? 1 : 0, squash: hop > 0 && hop < 1 ? Math.sin(s * 12) * .5 : 0 });
  if (k > 2.6) redThread(g, s, [[px + 80, py - 70], [1400, 400], [1560, 300], [1700, 200], [1900, 120]], { u: E.out(seg(k, 2.6, 3.4)), w: 3 });
  g.restore();
  // 窗户被风推开：一阵亮光
  const op = seg(k, 3.8, 4.4);
  if (op > 0) { glow(g, 1500, 330, 900 * op, '#CFD9FF', op * .55); speedLines(g, s, 16, .25 * op); }
}
/* ---------- 第 48~49 小节：记忆逐渐浮现 又重演 ----------
   他跟着红线飞出窗外，像素小怪在前面带路，回忆的拍立得像鸟一样围着他飞；"又重演"时全部倒卷回去。 */
function sFlyOut(g, s, k) {
  const x = 14000 + k * 900;
  flightBg(g, s, { x, moon: [1600, 210, 100], roofs: true, roofDY: 170, cloudA: .5, cloudY: 600 });
  const rew = seg(s, 124.6, 125.6);
  const hx = 820, hy = 470 + Math.sin(s * 2) * 20;
  MEMS.forEach(([cap, paint], i) => {
    const a = s * 1.2 + i / 5 * TAU - rew * 14, r = 330 + Math.sin(s + i) * 30;
    const px = hx + Math.cos(a) * r * 1.5, py = hy + Math.sin(a) * r * .55;
    withAlpha(g, seg(k, .3 + i * .2, .8 + i * .2) * (1 - seg(rew, .6, 1)), () => polaroid(g, px, py, 150, Math.sin(a) * .3, paint, { caption: cap }));
  });
  person(g, { who: 'he', x: hx, y: hy, u: 36, face: 1, pose: { ...POSE.fly, aN: [2.2, .1], aF: [2.6, .2] }, t: s, eyes: 'open', mouth: 'n', wind: [-2, -.3], light: LIGHT.moon });
  const hand = handPos({ x: hx, y: hy, u: 36, face: 1, pose: { ...POSE.fly, aN: [2.2, .1] } }, 'N');
  const mx = hand[0] + 260 + Math.sin(s * 3) * 20, my = hand[1] - 40 + Math.cos(s * 2) * 20;
  redThread(g, s, [hand, [mx - 120, my + 10], [mx, my]], { w: 3 });
  redThread(g, s, [[mx, my], [mx + 300, my - 40], [mx + 700, my - 120], [W + 100, my - 200]], { w: 3 });
  pixelMon(g, mx, my, 4.5, PLUSH.orange, 1);
  if (rew > 0) { text(g, '◀◀', 960, 160, 70, { k: 'sans', col: '#FFFFFF', alpha: (Math.floor(s * 6) % 2 ? .9 : .4) * (1 - seg(rew, .7, 1)) }); glow(g, hx, hy, 900 * rew, '#FFF2FA', rew * .8); }
}

SCENES_DEF.push(() => {
  scene('riverfly', bar(34), sRiverFly, { tr: { type: 'zoom', dur: .7, cx: 1500, cy: 330, zoom: 3 }, bloom: .5 });
  scene('dandelion', bar(35), sDandelion, { tr: { type: 'whip', dur: .45 }, bloom: .5 });
  scene('fogthread', bar(36), sFogThread, { tr: { type: 'cloud', dur: .6, pal: CLOUD.nightL }, bloom: .55 });
  scene('mirrorfall', bar(37), sMirrorFall, { tr: { type: 'blur', dur: .5 }, bloom: .55 });
  scene('freeze', bar(38), sFreeze, { tr: { type: 'ripple', dur: .6 }, bloom: .5 });
  scene('moonbow', bar(39), sMoonbow, { tr: { type: 'fade', dur: .5 }, bloom: .5 });
  scene('shirt', bar(40), sShirt, { tr: { type: 'blur', dur: .5 }, bloom: .45 });
  scene('fogwin', bar(41), sFogWin, { tr: { type: 'fade', dur: .5 }, bloom: .5 });
  scene('milk2', bar(42), sMilk2, { tr: { type: 'zoom', dur: .7, cx: 1420, cy: 560, zoom: 4 }, bloom: .45 });
  scene('play', bar(43), sPlay, { tr: { type: 'fade', dur: .4 }, bloom: .45 });
  scene('typing', bar(44), sTyping, { tr: { type: 'blur', dur: .45 }, bloom: .45 });
  scene('desk', bar(45), sDesk, { tr: { type: 'fade', dur: .45 }, bloom: .45 });
  scene('alive', bar(46), sAlive, { tr: { type: 'fade', dur: .5 }, bloom: .5 });
  scene('flyout', bar(48), sFlyOut, { tr: { type: 'zoom', dur: .6, cx: 1500, cy: 330, zoom: 4 }, bloom: .55 });
});
