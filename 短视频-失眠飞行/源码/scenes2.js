'use strict';
/* scenes2.js：主歌 B 第一遍（男声，他的现实）。第 10~18 小节。
   热牛奶的时间、没看完的电影、两扇亮着的窗、镜子里的黑眼圈、她送的玩偶、浮起来的回忆。 */

/* ---------- 第 10 小节：又过了每晚给你热牛奶的时间 ----------
   深夜的厨房。微波炉里转着他的蓝杯子，台面上放着她那只粉色的。叮——他看了一眼粉色的杯子。 */
function sMilk(g, s, k) {
  const z = 1.32 + k * .03;
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-760, -575);
  const done = k > 2.42;   // 叮：落在这句唱完、下一句开口之前的空隙里（歌曲 27.86 秒）
  hisKitchen(g, s, { micro: done ? 0 : 1, disp: done ? '23:00' : '0:0' + Math.max(0, Math.ceil(2.42 - k)), clock: '23:00' });
  const look = E.io(seg(k, 1.0, 1.4)) * (1 - E.io(seg(k, 2.2, 2.5)));
  person(g, { who: 'he', x: 440, y: 762, u: 56, face: 1, pose: { tilt: .06, head: .18 + look * .25, aN: [.25, .3], aF: [.15, .35], lN: [.02, 0], lF: [-.05, 0] }, t: s, eyes: 'half', tired: .7, mouth: look > .5 ? 'sad' : 'n', light: LIGHT.lamp });
  // 微波炉里的热气
  if (!done) for (let i = 0; i < 5; i++) { const ph = (s * .6 + i / 5) % 1; withAlpha(g, Math.sin(Math.PI * ph) * .25, () => { g.strokeStyle = '#FFFFFF'; g.lineWidth = 4; g.beginPath(); g.moveTo(885 + i * 10, 640 - ph * 40); g.quadraticCurveTo(895 + i * 10 + Math.sin(s * 3 + i) * 8, 620 - ph * 60, 885 + i * 10, 600 - ph * 80); g.stroke(); }); }
  g.restore();
  // 叮——
  const du = seg(k, 2.42, 2.9);
  if (du > 0 && du < 1) { text(g, '叮', 1240, 300, 80 + E.out(du) * 20, { k: 'brush', col: '#FFF6D8', alpha: 1 - du, glow: '#FFD08A', gr: 30 }); sparkleBurst(g, 1240, 300, du, '#FFE8B0', 8, 110); }
}

/* ---------- 第 11 小节：床头还写着我们没看完的影片 ----------
   床头的笔记本停在 1:12:05，屏幕上贴着她写的便利贴。镜头从电脑慢慢移到便利贴上。 */
function sMovie(g, s, k) {
  const u = E.io(seg(k, 0, 2.5));
  g.fillStyle = vgrad(g, 0, H, [[0, '#0E1230'], [1, '#171A3A']]); g.fillRect(0, 0, W, H);
  g.save(); g.translate(-u * 260, 0);
  // 床头板、两个枕头、被子
  g.fillStyle = '#2A2448'; rr(g, 200, 260, 1700, 360, 26); g.fill();
  g.fillStyle = 'rgba(160,180,255,.12)'; rr(g, 200, 260, 1700, 12, 6); g.fill();
  pillow(g, 320, 560, 420, 130, '#D8D7EE'); pillow(g, 820, 560, 420, 130, '#D8D7EE');
  g.fillStyle = vgrad(g, 640, H, [[0, '#7C7FC4'], [1, '#4F5292']]); g.beginPath(); g.moveTo(200, 700); g.quadraticCurveTo(900, 640, 1960, 690); g.lineTo(1960, H); g.lineTo(200, H); g.fill();
  laptop(g, 1180, 900, 560, { prog: .585, cur: '1:12:05', tot: '2:03:40' });
  // 她的便利贴，贴在电脑屏幕的角上
  stickyNote(g, 1530, 420, 210, .1 + Math.sin(s * 1.2) * .01, ['《月亮背面》', '看到 1:12:05', '下次一起看完 ♡']);
  // 空着的那个枕头上，一根长头发
  g.strokeStyle = 'rgba(58,38,48,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(900, 600); g.bezierCurveTo(960, 570, 1000, 640, 1080, 590); g.stroke();
  g.restore();
  // 屏幕的光照在被子上
  glow(g, 1180 - u * 260, 760, 520, '#7FA6FF', .25);
}

/* ---------- 第 12 小节：离开后的时间里你是否还失眠 ----------
   从他亮着灯的窗口拉远：整座城都黑了，只剩两扇窗还亮着——他的，和远处她的。两扇窗都是 03:07。 */
function sTwoWindows(g, s, k) {
  const zu = E.io(seg(k, 0, 2.2));
  const z = lerp(3.2, 1, zu);
  const fx = 520, fy = 470;
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-lerp(fx, 960, zu), -lerp(fy, 540, zu));
  skyGrad(g, SKY.deep);
  stars(g, s, 400, 0, .8);
  moon(g, 1500, 180, 54, { haloA: .5 });
  cityLayer(g, CITY.far, 600, 860, .9, .8);
  // 他的楼（左）、她的楼（右，远一点）
  facade(g, s, 300, 300, 5, 9, 90, 90, { seed: 3, lit: .04, highlight: [[2, 2, '#FFD48A', (gg, x, y, w, h) => { backView(gg, { who: 'he', x: x + w / 2, y: y + h * .62, u: 9, light: LIGHT.lamp }); }]] });
  facade(g, s, 1300, 430, 4, 8, 64, 64, { seed: 8, lit: .05, wall: '#121733', highlight: [[1, 3, '#FFC9DE', (gg, x, y, w, h) => { backView(gg, { who: 'she', x: x + w / 2, y: y + h * .64, u: 6.5, light: LIGHT.lamp }); }]] });
  cityLayer(g, CITY.mid, 1800, 1140, 1, .9);
  g.restore();
  // 两扇窗之间的一根光线，和两个 03:07
  const lu = seg(k, 1.3, 2.3);
  if (lu > 0) {
    const ax = 525, ay = 470, bx = 1395, by = 655;
    g.save(); g.globalCompositeOperation = 'lighter'; g.setLineDash([10, 14]); g.lineDashOffset = -s * 40;
    g.strokeStyle = `rgba(255,220,240,${.7 * lu})`; g.lineWidth = 3;
    g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo((ax + bx) / 2, Math.min(ay, by) - 220, lerp(ax, bx, E.out(lu)), lerp(ay, by, E.out(lu)) - Math.sin(Math.PI * E.out(lu)) * 0); g.stroke();
    g.restore();
    text(g, '03:07', ax, ay - 90, 40, { k: 'sans', col: '#FFE3B0', alpha: lu, glow: '#FFB870', gr: 16, ls: 3 });
    text(g, '03:07', bx, by - 80, 40, { k: 'sans', col: '#FFD3E6', alpha: E.out(seg(k, 1.6, 2.2)), glow: '#FF8CC0', gr: 16, ls: 3 });
  }
}

/* ---------- 第 13 小节：从不熬夜的我也明显黑了眼圈 ----------
   浴室的镜子，冷白的灯闪了一下。镜子里是他：黑眼圈，打了个哈欠。手机上 04:12。 */
function sMirror(g, s, k) {
  const z = 1.02 + k * .02;
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2);
  const yawn = win(k, 1.1, 1.75, .15, .2);
  const fl = mirrorScene(g, s, { phone: '04:12', inside: mg => {
    bust(mg, { who: 'he', x: 960, y: 540, u: 150, eyes: yawn > .5 ? 'closed' : 'half', tired: 1, mouth: yawn > .3 ? 'o' : 'n', brow: .6, light: { ...LIGHT.room, amb: '#9FC2D8', ambA: .3, lx: 0, ly: -1, rim: '#E8F6FF', rimA: .5 }, t: s });
  } });
  g.restore();
  if (fl < 1) { g.fillStyle = 'rgba(0,0,10,.25)'; g.fillRect(0, 0, W, H); }
}

/* ---------- 第 14~15 小节：你送的玩偶依然陪在身边 ----------
   他侧躺着，抱着那只橙色的小怪玩偶，睁着眼。月光慢慢移过来，玩偶的眼睛亮了一下。 */
function sPlushHim(g, s, k) {
  const z = 1.0 + E.io(seg(k, 0, 5)) * .16;
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-960, -560);
  hisBedroom(g, s, {});
  // 床：从侧面看，枕头在左
  g.fillStyle = '#2C2550'; rr(g, 160, 640, 1560, 90, 20); g.fill();
  pillow(g, 220, 470, 400, 160, '#D9D8EE');
  // 他：侧躺，脸朝镜头（正面半身转 90°），身子在被子里
  const blink = [1.2, 3.1].some(b => k > b && k < b + .14);
  bust(g, { who: 'he', x: 470, y: 548, u: 92, tiltH: -Math.PI / 2 + .1, eyes: blink ? 'closed' : 'half', tired: .8, mouth: 'n', light: { ...LIGHT.room, lx: .9, ly: -.4 }, t: s });
  // 被子：盖过肩膀，鼓起一个包
  g.fillStyle = vgrad(g, 430, H, [[0, '#8487CC'], [1, '#474A8A']]);
  g.beginPath(); g.moveTo(560, 1100); g.lineTo(560, 640); g.bezierCurveTo(590, 430, 760, 360, 920, 410); g.bezierCurveTo(1150, 480, 1400, 560, 1720, 600); g.lineTo(1720, 1100); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(40,30,90,.25)'; g.lineWidth = 4; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(900 + i * 180, 470 + i * 25); g.quadraticCurveTo(930 + i * 180, 700, 880 + i * 180, 1000); g.stroke(); }
  // 玩偶：抱在下巴底下，一半露在被子外面
  const pg = E.out(seg(k, 3.2, 3.8)) * (1 - seg(k, 4.4, 5.0) * .5);
  plush(g, { x: 690, y: 690, s: 15, col: PLUSH.orange, eyes: pg > .3 ? 'glow' : (blink ? 'blink' : 'n'), glow: pg, tilt: -.12, blush: 1 });
  // 搭在玩偶上的手
  g.fillStyle = '#8A93A8'; rr(g, 560, 610, 120, 54, 26); g.fill();
  g.fillStyle = '#F2CFB8'; circ(g, 680, 636, 26); g.fill();
  g.restore();
}

/* ---------- 第 16~17 小节：记忆逐渐浮现从开始到终点 又重演 ----------
   拍立得一张张从床上浮起来：初遇的雨伞、咖啡店、一起看电影、海边的日落、车站分开。
   排成一条胶片，从开始走到终点；"又重演"时整条倒带，转成漩涡，白光一闪进副歌。 */
const MEMS = [
  ['那天下雨', (g, w, h) => { g.fillStyle = '#5C6F9E'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(220,230,255,.5)'; g.lineWidth = 1.5; for (let i = 0; i < 26; i++) { const x = hash(i, 1) * w, y = hash(i, 2) * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y + 12); g.stroke(); } g.fillStyle = '#E58BAA'; g.beginPath(); g.arc(w / 2, h * .45, w * .3, Math.PI, 0); g.fill(); g.fillStyle = '#2A2440'; g.fillRect(w / 2 - 1, h * .45, 2, h * .3); circ(g, w * .42, h * .62, w * .07); g.fill(); circ(g, w * .58, h * .62, w * .07); g.fill(); g.fillRect(w * .36, h * .68, w * .12, h * .3); g.fillRect(w * .52, h * .68, w * .12, h * .3); }],
  ['常去的咖啡店', (g, w, h) => { g.fillStyle = '#E9B97A'; g.fillRect(0, 0, w, h); g.fillStyle = '#FFF0D0'; g.fillRect(w * .1, h * .08, w * .8, h * .45); g.fillStyle = '#8A5A3A'; g.fillRect(0, h * .7, w, h * .3); g.fillStyle = '#FFFFFF'; rr(g, w * .25, h * .55, w * .16, h * .16, 4); g.fill(); rr(g, w * .58, h * .55, w * .16, h * .16, 4); g.fill(); g.fillStyle = '#6A3F2A'; ell(g, w * .33, h * .57, w * .06, h * .02); g.fill(); ell(g, w * .66, h * .57, w * .06, h * .02); g.fill(); }],
  ['一起看电影', (g, w, h) => { g.fillStyle = '#1C2148'; g.fillRect(0, 0, w, h); g.fillStyle = '#BFD6FF'; g.fillRect(w * .15, h * .12, w * .7, h * .38); glow(g, w / 2, h * .3, w * .6, '#BFD6FF', .5); g.fillStyle = '#0B0D22'; circ(g, w * .4, h * .7, w * .1); g.fill(); circ(g, w * .6, h * .68, w * .1); g.fill(); rr(g, w * .1, h * .78, w * .8, h * .3, 8); g.fill(); }],
  ['海边的日落', (g, w, h) => { g.fillStyle = vgrad(g, 0, h, [[0, '#F7A072'], [.55, '#F4C27A'], [.56, '#5C7FB0'], [1, '#2E4A7A']]); g.fillRect(0, 0, w, h); g.fillStyle = '#FFE9B0'; circ(g, w * .5, h * .55, w * .14); g.fill(); g.fillStyle = '#2A2440'; circ(g, w * .35, h * .66, w * .05); g.fill(); circ(g, w * .47, h * .66, w * .05); g.fill(); g.fillRect(w * .31, h * .7, w * .08, h * .2); g.fillRect(w * .43, h * .7, w * .08, h * .2); }],
  ['车站', (g, w, h) => { g.fillStyle = '#8D93A6'; g.fillRect(0, 0, w, h); g.fillStyle = '#B7BCCB'; g.fillRect(0, h * .65, w, h * .35); g.fillStyle = '#5A6078'; for (let i = 0; i < 4; i++) g.fillRect(w * (.05 + i * .25), h * .1, w * .03, h * .55); g.fillStyle = '#3A3348'; circ(g, w * .75, h * .48, w * .05); g.fill(); g.fillRect(w * .71, h * .52, w * .08, h * .2); g.fillStyle = '#2A2440'; circ(g, w * .25, h * .5, w * .06); g.fill(); g.fillRect(w * .2, h * .55, w * .1, h * .22); }],
];
function sMemories(g, s, k) {
  hisBedroom(g, s, {});
  g.fillStyle = 'rgba(8,8,24,.45)'; g.fillRect(0, 0, W, H);
  // 床上躺着的他（小一点，在下面）
  g.fillStyle = '#2C2550'; rr(g, 380, 900, 1160, 80, 20); g.fill();
  bust(g, { who: 'he', x: 640, y: 860, u: 46, tiltH: -Math.PI / 2 + .1, eyes: k > 2.8 ? 'closed' : 'open', mouth: 'n', light: LIGHT.room, t: s });
  g.fillStyle = vgrad(g, 820, H, [[0, '#6F72B8'], [1, '#3F4282']]); g.beginPath(); g.moveTo(700, 880); g.bezierCurveTo(900, 820, 1300, 830, 1540, 870); g.lineTo(1540, H); g.lineTo(680, H); g.fill();
  // 拍立得：先浮起来，再排成一条，最后倒带、转成漩涡
  const line_ = E.io(seg(k, 1.4, 2.2)), rew = seg(k, 2.75, 3.9), spin = E.in(seg(k, 3.9, 5.1));
  MEMS.forEach(([cap, paint], i) => {
    const t0 = i * .28, rise = E.out(seg(k, t0, t0 + 1.0));
    if (rise <= 0) return;
    const fx = 380 + i * 300 + Math.sin(s * .8 + i) * 20, fy = 900 - rise * (520 + (i % 2) * 90) + Math.sin(s * 1.1 + i * 2) * 10;
    const lx = 300 + ((((i * 330 + rew * 2600 * E.in(rew)) % 1650) + 1650) % 1650), ly = 380;   // 倒带：整条往右飞快地卷，卷出去的从左边回来
    let x = lerp(fx, lx, line_), y = lerp(fy, ly, line_), rot = lerp((hash(i, 4) - .5) * .4, 0, line_), sc = 1;
    if (spin > 0) { const a = i / 5 * TAU + spin * 9, r = (1 - spin) * 420; x = lerp(x, 960 + Math.cos(a) * r, spin); y = lerp(y, 480 + Math.sin(a) * r, spin); rot += spin * 6; sc = 1 - spin * .8; }
    for (const ghost of rew > 0 ? [0, 1, 2] : [0]) {
      withAlpha(g, ghost ? .25 / ghost : 1, () => polaroid(g, x + ghost * 70 * rew, y, 230 * sc, rot, paint, { caption: cap, a: rise }));
    }
    glow(g, x, y, 240 * sc, '#FFE9C8', .2 * rise);
  });
  // 胶片的齿孔条
  if (line_ > 0 && spin < 1) withAlpha(g, line_ * (1 - spin), () => {
    for (const yy of [210, 550]) { g.fillStyle = 'rgba(20,16,30,.8)'; g.fillRect(0, yy - 14, W, 28); g.fillStyle = 'rgba(255,240,220,.6)'; for (let x = -((s * 60 + rew * 2600) % 60); x < W; x += 60) rr(g, x, yy - 7, 26, 14, 3), g.fill(); }
    text(g, '开始', 120, 170, 34, { k: 'kai', col: '#FFE8C8', alpha: 1 - rew });
    text(g, '终点', 1800, 170, 34, { k: 'kai', col: '#FFE8C8', alpha: 1 - rew });
  });
  // 倒带的标志
  if (rew > 0 && spin < .5) { text(g, '◀◀', 960, 120, 64, { k: 'sans', col: '#FFFFFF', alpha: (Math.floor(s * 6) % 2 ? .9 : .4) * (1 - spin * 2) }); }
  if (spin > 0) glow(g, 960, 480, 900 * spin, '#FFF2FA', spin);
}

SCENES_DEF.push(() => {
  scene('milk', bar(10), sMilk, { tr: { type: 'zoom', dur: .7, pre: .45, cx: 1640, cy: 820, zoom: 6 }, bloom: .4 });
  scene('movie', bar(11), sMovie, { tr: { type: 'fade', dur: .4 }, bloom: .45 });
  scene('twowin', bar(12), sTwoWindows, { tr: { type: 'blur', dur: .45 }, bloom: .5 });
  scene('mirror', bar(13), sMirror, { tr: { type: 'whip', dur: .4 }, bloom: .35, grade: 'saturate(.85)' });
  scene('plushHim', bar(14), sPlushHim, { tr: { type: 'fade', dur: .6 }, bloom: .45 });
  scene('memories', bar(16), sMemories, { tr: { type: 'blur', dur: .6 }, bloom: .5, grade: s => `sepia(${(.15 * seg(s, bar(16), bar(16) + 1)).toFixed(2)})` });
});
