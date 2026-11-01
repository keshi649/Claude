'use strict';
/* scenes5.js —— 第二遍副歌和间奏（153~204.7 秒），现在：
   S37 秋夜，落叶，她一个人走。   S38 花店里，她买了一盆还没开的栀子，捧着笑了。
   S39 出门抬头，一架飞机闪着灯飞过。   S40 人海：一片人组成的海浪，他从海面上走远，她站在岸边。
   S41 她的眼睛，泪水涌上来。   S42 眼泪慢慢落下，泪珠里倒映着那年夏天。
   S43 泪落地；母校的那丛栀子没了，只剩一个树桩和工地的围挡。
   间奏：S44 她摸一摸树桩，树桩发光，一丛发光的栀子长出来、开花。
         S45 四周变回那年夏天，十七岁的他们（半透明）骑车从她身边经过、在长椅上笑。
         S46 花瓣旋成一阵风，把她围在中间，十七岁的他们挥挥手，化成花瓣。
         S47 花瓣升上夜空变成星星，一片落在她手心。 */

const NOW_L = { x: .4, y: -.9, rim: '#FFD9A8', rimA: .6, sh: .35, col: '#141026' };

/* ---------------- S37 秋夜落叶 ---------------- */
function autumnLeaves(g, t, o = {}) {
  const r = R(o.seed || 131), n = o.n || 40;
  for (let i = 0; i < n; i++) {
    const sp = 80 + r() * 120, y = mod(r() * (H + 300) + t * sp, H + 300) - 150, x = r() * W + Math.sin(t * (1 + r()) + i) * 90;
    const c = ['#D9822B', '#C25A2A', '#E8A33A', '#A84A2A'][i % 4], s = (o.size || 28) * (.7 + r() * .6);
    g.save(); g.translate(x, y); g.rotate(t * (r() - .5) * 3 + i); g.scale(Math.abs(Math.cos(t * 1.5 + i)) * .8 + .2, 1);
    leaf(g, -s / 2, 0, s, 0, c); g.restore();
  }
}
function shAutumn(g, t, s) {
  const lt = t - s.t;
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#0C0A16'], [.6, '#241A28'], [1, '#1A1210']]); g.fillRect(0, 0, W, H);
  // 公园的树和路灯
  for (let i = 0; i < 4; i++) { const x = 100 + i * 300; g.fillStyle = '#1A1210'; g.fillRect(x - 18, 300, 36, 1300); g.fillStyle = ['#6A3A1E', '#7A4A20', '#5A2E1A', '#804A22'][i]; g.beginPath(); g.ellipse(x, 320, 260, 300, 0, 0, TAU); g.fill(); }
  const lx = 760; g.fillStyle = '#121014'; g.fillRect(lx, 600, 14, 1000); glow(g, lx + 7, 600, 500, '#FFC07A', .6); circ(g, lx + 7, 600, 18, '#FFF0D0');
  g.fillStyle = 'rgba(255,190,120,.16)'; poly(g, [[lx + 7, 600], [lx - 380, 1600], [lx + 400, 1600]]); g.fill();
  g.fillStyle = '#2A1E1A'; g.fillRect(0, 1600, W, 320);
  for (let i = 0; i < 60; i++) leaf(g, hash(i, 1) * W, 1620 + hash(i, 2) * 280, 26, hash(i, 3) * 6, ['#9A4A22', '#B8662A', '#7A3A1E'][i % 3]);
  fig(g, { x: lerp(820, 380, lt / 2.2), y: 1700, h: 900, who: 'woman', view: 'side', dir: -1, light: NOW_L, pose: POSE.walk(lt * .9, .9), eyes: 'down', wind: .1 });
  autumnLeaves(g, t, { n: 46 });
}

/* ---------------- S38 花店 ---------------- */
function potGardenia(g, x, y, s, bloom = 0) {
  // 一盆栀子：陶盆 + 叶子 + 花苞（bloom 0~1 开花）
  g.fillStyle = '#B0623A'; poly(g, [[x - 70 * s, y - 120 * s], [x + 70 * s, y - 120 * s], [x + 52 * s, y], [x - 52 * s, y]]); g.fill();
  g.fillStyle = '#C8784A'; g.fillRect(x - 78 * s, y - 136 * s, 156 * s, 22 * s);
  const r = R(7);
  for (let i = 0; i < 22; i++) { const a = -PI / 2 + (r() - .5) * 2.6, d = 40 + r() * 90; leaf(g, x + Math.cos(a) * d * .4 * s, y - 140 * s + Math.sin(a) * d * .6 * s, (50 + r() * 30) * s, a + (r() - .5), '#2F6B3A'); }
  for (let i = 0; i < 5; i++) {
    const a = -PI / 2 + (i - 2) * .5, d = 95, fx = x + Math.cos(a) * d * .5 * s, fy = y - 150 * s + Math.sin(a) * d * .7 * s;
    if (bloom > .05) gardenia(g, fx, fy, 26 * s * (.4 + bloom * .6), i, { tilt: .8 });
    else { g.fillStyle = '#DDE8C8'; g.beginPath(); g.ellipse(fx, fy, 8 * s, 15 * s, a + PI / 2, 0, TAU); g.fill(); }
  }
}
function shFlowerShop(g, t, s) {
  const lt = t - s.t;
  // 店里：暖光、一架架的花
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#5A3A2A'], [1, '#2A1A16']]); g.fillRect(0, 0, W, H);
  glow(g, 540, 600, 900, '#FFC880', .55);
  for (let r2 = 0; r2 < 3; r2++) { g.fillStyle = '#3A2418'; g.fillRect(0, 700 + r2 * 300, W, 18); for (let i = 0; i < 9; i++) { const x = 60 + i * 120; g.fillStyle = ['#E86A8A', '#F2D24A', '#FFFFFF', '#C86AE8', '#FF8A5A'][(i + r2) % 5]; for (let k = 0; k < 5; k++) circ(g, x + Math.sin(k * 2.1) * 30, 640 + r2 * 300 - k * 14, 18); g.fillStyle = '#3A6A3A'; g.fillRect(x - 4, 660 + r2 * 300, 8, 40); } }
  const smile = E.io(seg(lt, 1.6, 2.6));
  const F = { x: 520, y: 1900, h: 1300, who: 'woman', view: 'side', dir: 1, light: { x: -.6, y: -.7, rim: '#FFE0B0', rimA: .6, sh: .25, warm: '#FFB060', warmA: .3 }, eyes: smile > .5 ? 'closed' : 'down', blush: smile * .3, pose: { lean: .05, head: .25, arms: [{ sh: .6, el: 1.2 }, { sh: .55, el: 1.25 }] } };
  fig(g, F);
  potGardenia(g, F.hand0[0] + 40, F.hand0[1] + 30, 1.1, 0);
  // 窗玻璃上的反光（镜头在店外）
  g.save(); g.globalCompositeOperation = 'screen';
  g.fillStyle = lg(g, 0, 0, W, H, [[0, 'rgba(120,160,255,.0)'], [.45, 'rgba(160,190,255,.12)'], [.5, 'rgba(200,220,255,.18)'], [.55, 'rgba(160,190,255,.0)']]); g.fillRect(0, 0, W, H);
  g.restore();
  bokeh(g, t, { n: 12, seed: 141, size: 110, a: .25, cols: ['#5FE0FF', '#FF7FA8'] });
  text(g, '花 店', 540, 220, 90, '#FFE6C0', { weight: 700, shadow: '#FF8AA8', blur: 30, alpha: .85 });
}

/* ---------------- S39 飞机飞过 ---------------- */
function shPlane(g, t, s) {
  const lt = t - s.t;
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#060918'], [.7, '#1C2240'], [1, '#2E2A40']]); g.fillRect(0, 0, W, H);
  stars(g, t, { n: 80, y1: 1300, seed: 151 });
  g.drawImage(skyline(152, 1300, 700, { col: '#0E1020', lit: .3 }), -100, 1300);
  // 飞机：从右往左，闪灯；身后一道被城市照亮的尾迹
  const k = lt / 2.8, px = lerp(1200, -200, k), py = lerp(520, 330, k);
  g.strokeStyle = lg(g, px, py, px + 900, py + 120, [[0, 'rgba(255,220,200,.35)'], [1, 'rgba(255,220,200,0)']]); g.lineWidth = 14; g.lineCap = 'round';
  g.beginPath(); g.moveTo(px, py); g.lineTo(px + 900, py + 120); g.stroke();
  g.fillStyle = '#C8C8D0'; g.save(); g.translate(px, py); g.rotate(-.13); g.fillRect(-40, -5, 80, 10); poly(g, [[-5, 0], [15, -40], [25, -40], [15, 0]]); g.fill(); poly(g, [[-5, 0], [15, 40], [25, 40], [15, 0]]); g.fill(); g.restore();
  if (Math.floor(t * 2.5) % 2 === 0) { glow(g, px - 30, py, 40, '#FF4A4A', .9); glow(g, px + 30, py, 40, '#FFFFFF', .9); }
  g.fillStyle = '#100E16'; g.fillRect(0, 1760, W, 160); g.fillStyle = 'rgba(255,200,140,.2)'; g.fillRect(0, 1760, W, 6);
  // 她站在楼下，捧着花盆，抬头
  fig(g, { x: 560, y: 1820, h: 640, who: 'woman', view: 'side', dir: -1, light: NOW_L, pose: { head: -.45, arms: [{ sh: .6, el: 1.2 }, { sh: .55, el: 1.25 }] }, eyes: 'open' });
  potGardenia(g, 470, 1600, .55, 0);
}

/* ---------------- S40 人海 ---------------- */
function seaOfPeople(g, t, o = {}) {
  const hor = o.hor || 980, N = 42;
  for (let r2 = 0; r2 < N; r2++) {
    const f = Math.pow(r2 / (N - 1), 1.8), y0 = hor + f * 1050, h = 18 + f * 250, gap = h * .42;
    const shadeK = .55 + f * .45, wave = h * .55;
    const off = (r2 * 37) % gap;
    for (let x = -gap + off; x < W + gap; x += gap) {
      const ph = x * .006 + r2 * .55 - t * 1.6, crest = Math.sin(ph), y = y0 - crest * wave;
      const c = mix('#0E1430', crest > .6 ? '#5A6AA0' : '#26305A', shadeK * (.6 + .4 * Math.max(0, crest)));
      tiny(g, x + Math.sin(t + x) * 2, y + h, h, c, { p: (x + r2) * .1, walk: 0, coat: 1 });
    }
  }
}
function shSeaPeople(g, t, s) {
  const lt = t - s.t, z = 1.08 - lt * .03;
  g.save(); g.translate(W / 2, H * .6); g.scale(z, z); g.translate(-W / 2, -H * .6);
  g.fillStyle = lg(g, 0, 0, 0, 1000, [[0, '#04061A'], [1, '#2A3060']]); g.fillRect(-200, -200, W + 400, 1300);
  stars(g, t, { n: 160, y1: 900, seed: 161 });
  glow(g, 700, 560, 380, '#E8EEFF', .5); circ(g, 700, 560, 80, '#F4F6FF');
  g.fillStyle = 'rgba(220,230,255,.18)'; g.fillRect(-200, 960, W + 400, 30);
  seaOfPeople(g, t);
  // 他：在"海面"上越走越远，最后被浪吞掉
  const k = seg(lt, 0, 3.0), hx = lerp(560, 640, k), hy = lerp(1350, 1000, E.out2(k)), hh = lerp(260, 30, E.out2(k));
  if (k < .95) fig(g, { x: hx, y: hy, h: hh, who: 'man', view: 'back', light: { x: 0, y: -1, rim: '#E8EEFF', rimA: .9, sh: .4 }, alpha: 1 - seg(k, .7, .95), pose: POSE.walk(lt, .5) });
  g.restore();
  // 岸边的她（前景，背影）
  g.fillStyle = '#05060E'; spline(g, [[-60, 1700], [300, 1640], [520, 1720], [640, 1920], [-60, 1960]], true, .4); g.fill();
  fig(g, { x: 230, y: 1880, h: 900, who: 'woman', view: 'back', light: { x: .4, y: -1, rim: '#C8D4FF', rimA: .8, sh: .5, col: '#0A0A18' }, wind: .25, pose: { arms: [{ sh: .1 }, { sh: .3 + E.out(seg(lt, .3, 1.2)) * .5, el: .1 }] } });
}

/* ---------------- S41 涌上来的泪 ---------------- */
function shTearEye(g, t, s) {
  const lt = t - s.t;
  eyeMacro(g, t, { tear: seg(lt, 0, 1.6) });
  tint(g, '#2A3A70', .45, 'multiply');
  glow(g, 300, 400, 600, '#FF8AB0', .15);
}

/* ---------------- S42 泪珠里的夏天 ---------------- */
function shTearDrop(g, t, s) {
  const lt = t - s.t;
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#0A0C1C'], [1, '#141026']]); g.fillRect(0, 0, W, H);
  bokeh(g, t, { n: 20, seed: 171, size: 140, a: .3, cols: ['#5FE0FF', '#FF7FA8', '#FFD49A'] });
  // 一滴很大的泪，慢慢往下落；里面倒着映出那年夏天的长椅
  const y = lerp(520, 1120, E.in2(seg(lt, 0, 4.8))), r = 300;
  const q = layer('dropIn', 640, 640);
  q.save(); q.translate(320, 320); q.scale(1, -1); q.translate(-320, -320);   // 倒过来（像真的水珠）
  q.drawImage(photoBench(), 0, 0, 640, 640);
  q.restore();
  g.save(); g.translate(540, y);
  g.beginPath(); g.moveTo(0, -r * 1.45); g.bezierCurveTo(r * .55, -r * .7, r, -r * .15, r, r * .25); g.arc(0, r * .25, r, 0, PI); g.bezierCurveTo(-r, -r * .15, -r * .55, -r * .7, 0, -r * 1.45); g.closePath();
  g.save(); g.clip(); g.globalAlpha = .9; g.drawImage(LAYER.dropIn, -r, -r * .8, r * 2, r * 2.2); g.globalAlpha = 1;
  g.fillStyle = rg(g, 0, r * .2, r * .3, r * 1.2, [[0, 'rgba(255,255,255,0)'], [1, 'rgba(160,190,255,.45)']]); g.fillRect(-r, -r * 1.5, r * 2, r * 2.8);
  g.restore();
  g.strokeStyle = 'rgba(220,235,255,.6)'; g.lineWidth = 4; g.stroke();
  g.fillStyle = 'rgba(255,255,255,.8)'; ell(g, -r * .45, -r * .1, r * .12, r * .25, .4);
  g.restore();
}
/* 那年夏天长椅上的两个人（缓存成一张图，给泪珠、回忆用） */
function photoBench() {
  return cached('photoBench', 640, 640, (q) => {
    const tmp = layer('photoBenchSrc');
    const { gy } = benchScene(tmp, 50, {});
    fig(tmp, { x: 400, y: gy, h: 860, who: 'boy', view: 'side', dir: 1, pose: Object.assign(POSE.sit(1.86), { lean: .05 }), light: SUM_L });
    fig(tmp, { x: 640, y: gy, h: 820, who: 'girl', view: 'side', dir: 1, pose: Object.assign(POSE.sit(), { head: .1 }), light: SUM_L, eyes: 'closed', blush: .4 });
    petals(tmp, 50, { n: 20, seed: 13, size: 28 });
    q.drawImage(LAYER.photoBenchSrc, 40, 760, 1000, 1000, 0, 0, 640, 640);
  });
}

/* ---------------- S43 母校：那丛栀子没了 ---------------- */
function oldCampusNight(g, t, o = {}) {
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#05081A'], [.6, '#161C38'], [1, '#0C0C14']]); g.fillRect(0, 0, W, H);
  stars(g, t, { n: 120, y1: 900, seed: 181 });
  // 新盖的玻璃楼、塔吊
  g.fillStyle = '#141A2C'; g.fillRect(380, 420, 520, 1100);
  for (let i = 0; i < 9; i++) for (let j = 0; j < 5; j++) { g.fillStyle = (i * 7 + j * 3) % 5 === 0 ? 'rgba(170,210,255,.55)' : 'rgba(60,80,120,.35)'; g.fillRect(400 + j * 100, 450 + i * 115, 80, 90); }
  g.strokeStyle = '#1E2236'; g.lineWidth = 10; g.beginPath(); g.moveTo(180, 1500); g.lineTo(180, 260); g.lineTo(900, 260); g.moveTo(180, 300); g.lineTo(100, 260); g.stroke();
  circ(g, 860, 262, 10, '#FF4A4A'); glow(g, 860, 262, 60, '#FF4A4A', .6 * (Math.floor(t * 1.5) % 2));
  // 工地的蓝色围挡
  g.fillStyle = '#2A4A8A'; g.fillRect(0, 1300, W, 260); g.fillStyle = '#244080'; for (let i = 0; i < 12; i++) g.fillRect(i * 96, 1300, 6, 260);
  g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(640, 1316, 260, 60); text(g, '施工重地  注意安全', 770, 1346, 24, '#2A4A8A', { weight: 700 });
  // 地面、树桩
  g.fillStyle = '#16141C'; g.fillRect(0, 1560, W, 360);
  const sx = 540, sy = 1700;
  g.fillStyle = '#4A3A2E'; g.beginPath(); g.ellipse(sx, sy, 110, 34, 0, 0, TAU); g.fill(); g.fillRect(sx - 110, sy, 220, 50);
  g.fillStyle = '#6A5444'; g.beginPath(); g.ellipse(sx, sy, 96, 28, 0, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(40,30,20,.6)'; g.lineWidth = 3; for (let i = 1; i < 4; i++) { g.beginPath(); g.ellipse(sx, sy, 24 * i, 7 * i, 0, 0, TAU); g.stroke(); }
  // 一盏工地的灯照着这里
  g.fillStyle = 'rgba(255,230,190,.12)'; poly(g, [[540, 900], [200, 1800], [880, 1800]]); g.fill();
  return { sx, sy };
}
function shCampusGone(g, t, s) {
  const lt = t - s.t, z = 1 + lt * .018;
  g.save(); g.translate(W * .45, H * .8); g.scale(z, z); g.translate(-W * .45, -H * .8);
  // 开头：泪滴砸在地上的水花
  oldCampusNight(g, t);
  const k = seg(lt, 0, .8);
  if (k < 1) { g.strokeStyle = `rgba(220,235,255,${(1 - k) * .8})`; g.lineWidth = 5; for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(540, 1760, 30 + k * 500 + i * 60, (30 + k * 500 + i * 60) * .25, 0, 0, TAU); g.stroke(); } }
  fig(g, { x: 300, y: 1800, h: 1000, who: 'woman', view: 'back', light: { x: .6, y: -.8, rim: '#FFE6C0', rimA: .6, sh: .45, col: '#0A0A18' }, wind: .2 + .25 * Math.sin(t * 1.3), pose: { tilt: .05 } });
  g.restore();
  autumnLeaves(g, t, { n: 16, seed: 183, size: 22 });
}

/* ---------------- 间奏 S44 树桩发光，栀子长出来 ---------------- */
function glowBush(g, t, x, y, grow, bloom, o = {}) {
  // 发光的栀子：枝条从树桩里长出来，叶子、花一点点出现
  const r = R(o.seed || 191), n = 26;
  g.save(); g.globalCompositeOperation = 'screen';
  glow(g, x, y - 300 * grow, 520 * grow + 40, '#BFFFE0', .55 * grow);
  g.restore();
  for (let i = 0; i < n; i++) {
    const a = -PI / 2 + (r() - .5) * 2.2, len = (220 + r() * 380) * clamp(grow * 1.4 - r() * .4);
    if (len <= 0) continue;
    const ex = x + Math.cos(a) * len * .8, ey = y + Math.sin(a) * len;
    g.strokeStyle = 'rgba(190,255,220,.7)'; g.lineWidth = 6; g.beginPath(); g.moveTo(x + (r() - .5) * 40, y); g.quadraticCurveTo(x + Math.cos(a) * len * .3, y + Math.sin(a) * len * .6, ex, ey); g.stroke();
    for (let j = 0; j < 3; j++) leaf(g, lerp(x, ex, .4 + j * .25), lerp(y, ey, .4 + j * .25), 60 * clamp(grow * 1.5 - .3), a + (j % 2 ? .8 : -.8), '#3A9A6A');
    const b = clamp(bloom * 1.6 - r() * .6);
    if (b > 0) { glow(g, ex, ey, 90 * b, '#FFFFFF', .5 * b); gardenia(g, ex, ey, 46 * b, i, { tilt: .85 }); }
  }
}
function shStumpGlow(g, t, s) {
  const lt = t - s.t;
  const { sx, sy } = oldCampusNight(g, t);
  const grow = E.io(seg(lt, 1.6, 5.2)), bloom = E.out(seg(lt, 4.2, 6.4));
  // 她蹲下来，手伸过去摸树桩
  const crouch = E.io(seg(lt, 0, 1.2));
  // 单膝跪下：近侧的腿膝盖朝前、小腿竖着；远侧的膝盖着地、小腿往后
  fig(g, { x: 290, y: 1800, h: 1000, who: 'woman', view: 'side', dir: 1, light: { x: .8, y: -.4, rim: '#BFFFE0', rimA: .3 + grow * .6, sh: .4, col: '#0A0A18' }, eyes: 'down', pose: { lean: .3 * crouch, head: .35 * crouch, hip: 1.75 * crouch, legs: [{ th: 1.45 * crouch, kn: 1.5 * crouch }, { th: .15 * crouch, kn: 1.9 * crouch }], arms: [{ sh: .3 + crouch * .55, el: .15 }, { sh: .15 + crouch * .3, el: .4 }] } });
  glowBush(g, t, sx, sy, grow, bloom);
  fireflies(g, t, { n: Math.floor(30 * grow), x0: 200, x1: 900, y0: 900, y1: 1700, rise: 40 });
}

/* ---------------- S45 十七岁的他们从身边经过 ---------------- */
function shGhosts(g, t, s) {
  const lt = t - s.t;
  // 四周变回夏天（半透明叠在夜里），十七岁的他们骑车经过，又坐回长椅
  const dayK = E.io(seg(lt, 0, 1.6));
  oldCampusNight(g, t);
  withAlpha(g, dayK * .85, () => { const L2 = layer('ghostDay'); const r = benchScene(L2, t, {}); g.drawImage(LAYER.ghostDay, 0, 0); });
  // 发光的花丛还在
  glowBush(g, t, 540, 1700, 1, 1);
  // 骑车的两个人，半透明、发光
  const q = layer('ghostKids');
  const bx = lerp(-500, 1500, seg(lt, .8, 4.6));
  const bike = bicycle(q, bx, 1880, 150, t, lt * 12);
  const u = 720 / 7.3;
  fig(q, { x: bike.seat[0] + .1 * u, y: bike.seat[1] + 3.72 * u, h: 720, who: 'boy', view: 'side', dir: 1, light: SUM_L, pose: { lean: .32, head: -.2, legs: [{ th: 1.1, kn: 1.2 }, { th: .9, kn: 1.0 }], arms: [{ sh: 1.05, el: .2 }, { sh: 1.0, el: .25 }] } });
  fig(q, { x: bike.rack[0] - 10, y: bike.rack[1] + 2.82 * 96, h: 700, who: 'girl', view: 'front', light: SUM_L, eyes: 'closed', smile: 1, blush: .5, pose: { sitF: 1, hip: 1.0, legs: [{ sw: .2 }, { sw: -.1 }], arms: [{ sh: .9, el: .3 }, { sh: .9, el: .9 }] }, swing: .3 });
  // 骑过去以后，两个人又出现在长椅上（半透明），他在说什么，她笑得歪过去
  const sitIn = seg(lt, 4.4, 5.2);
  if (sitIn > 0) {
    const q2 = layer('ghostBench'), ub = 640 / 7.3;
    fig(q2, { x: 250, y: 1640, h: 640, who: 'boy', view: 'side', dir: 1, light: SUM_L, pose: Object.assign(POSE.sit(1.86), { lean: .05, head: -.05, arms: [{ sh: .8 + Math.sin(t * 6) * .2, el: .6 }, { sh: .3, el: .4 }] }) });
    fig(q2, { x: 420, y: 1640, h: 610, who: 'girl', view: 'side', dir: -1, light: SUM_L, eyes: 'closed', blush: .5, pose: Object.assign(POSE.sit(), { lean: .15 + Math.sin(t * 4) * .05, head: .1 }) });
    g.save(); g.globalAlpha = .7 * sitIn; g.globalCompositeOperation = 'screen'; g.filter = 'blur(2px)'; g.drawImage(LAYER.ghostBench, 0, 0); g.restore();
    g.save(); g.globalAlpha = .55 * sitIn; g.drawImage(LAYER.ghostBench, 0, 0); g.restore();
  }
  // 现在的她站在一边看着，笑了
  fig(g, { x: 900, y: 1800, h: 1000, who: 'woman', view: 'side', dir: -1, light: { x: -.8, y: -.5, rim: '#FFF0C8', rimA: .8, sh: .35, col: '#1A1428' }, eyes: lt > 3 ? 'closed' : 'open', blush: .2, wind: .2 });
  g.save(); g.globalAlpha = .75; g.globalCompositeOperation = 'screen'; g.filter = 'blur(2px)'; g.drawImage(LAYER.ghostKids, 0, 0); g.restore();
  g.save(); g.globalAlpha = .6; g.drawImage(LAYER.ghostKids, 0, 0); g.restore();
  petals(g, t, { n: 30, seed: 201, fall: 90, wind: 120, size: 30 });
}

/* ---------------- S46 花瓣旋风 ---------------- */
function shVortex(g, t, s) {
  const lt = t - s.t, rise = E.io(seg(lt, 2.5, 6.4));
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, mix('#8EC8F0', '#1A1E48', rise)], [1, mix('#F2E6C8', '#2A2448', rise)]]); g.fillRect(0, 0, W, H);
  glow(g, 540, 1100, 900, '#FFFFFF', .4 * (1 - rise));
  // 她站在中间，抬头；十七岁的两个人在旋涡里挥手、化成花瓣
  const cx = 540, cy = 1500 + rise * 200;
  fig(g, { x: cx, y: cy + 380, h: 900 - rise * 300, who: 'woman', view: 'front', light: { x: 0, y: -1, rim: '#FFFFFF', rimA: .7, sh: .2 }, eyes: 'closed', smile: 1, wind: .3, pose: { tilt: -.08, arms: [{ sh: .5 + rise * .6, el: .1 }, { sh: .5 + rise * .6, el: .1 }] } });
  const fade = seg(lt, 1.2, 3.4);
  if (fade < 1) {
    withAlpha(g, (1 - fade) * .8, () => {
      fig(g, { x: 260, y: 1500, h: 620, who: 'boy', view: 'front', light: SUM_L, eyes: 'closed', smile: 1, pose: { arms: [{ sh: .1 }, { sh: 2.6 + Math.sin(t * 8) * .2, el: -.3 }] } });
      fig(g, { x: 830, y: 1500, h: 600, who: 'girl', view: 'front', light: SUM_L, eyes: 'closed', smile: 1, blush: .5, pose: { arms: [{ sh: 2.6 + Math.sin(t * 8 + 1) * .2, el: -.3 }, { sh: .1 }] } });
    });
  }
  // 花瓣绕着她转、往上升
  const img = petalImg(), n = 220;
  for (let i = 0; i < n; i++) {
    const h0 = hash(i, 1), rad = 120 + h0 * 520, sp = 1.4 + hash(i, 2) * 1.2, a = t * sp + hash(i, 3) * TAU;
    const y = cy - mod(hash(i, 4) * 1700 + lt * (120 + hash(i, 5) * 200), 1900) + 200;
    const x = cx + Math.cos(a) * rad * (1 - rise * .3), depth = Math.sin(a), sz = 26 + 20 * (depth + 1) + hash(i, 6) * 20;
    g.save(); g.translate(x, y + depth * 40); g.rotate(a * 2); g.scale(Math.abs(Math.cos(a * 3)) * .8 + .2, 1); g.globalAlpha = .6 + .4 * (depth + 1) / 2;
    g.drawImage(img, -sz * .33, -sz * .5, sz * .66, sz); g.restore();
  }
  // 化成花瓣的两个人：从原来的位置散开的光点
  if (fade > 0 && fade < 1) for (let i = 0; i < 40; i++) { const sx = i % 2 ? 260 : 830, a = hash(i, 9) * TAU, d = fade * 400 * hash(i, 8); glow(g, sx + Math.cos(a) * d, 1200 - fade * 300 + Math.sin(a) * d, 30, '#FFF6D8', (1 - fade) * .8); }
}

/* ---------------- S47 花瓣变成星星，一片落在手心 ---------------- */
function shPalmPetal(g, t, s) {
  const lt = t - s.t;
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#04061A'], [.7, '#1A1E48'], [1, '#2A2448']]); g.fillRect(0, 0, W, H);
  g.drawImage(milkyWay(4), 0, 0);
  stars(g, t, { n: 400, seed: 211, a: seg(lt, 0, 2) });
  // 往上飘的花瓣，越高越小、变成星星
  const img = petalImg();
  for (let i = 0; i < 60; i++) {
    const k = mod(hash(i, 1) + lt * .18, 1), x = hash(i, 2) * W + Math.sin(lt + i) * 40, y = 1900 - k * 1700, sz = 40 * (1 - k);
    if (k > .75) { const a = seg(k, .75, 1); glow(g, x, y, 12, '#FFFFFF', 1 - a * .3); continue; }
    g.save(); g.translate(x, y); g.rotate(lt + i); g.globalAlpha = 1 - k; g.drawImage(img, -sz * .33, -sz * .5, sz * .66, sz); g.restore();
  }
  // 手心朝上，一片花瓣慢慢落下来（最后 2.5 秒）
  const h = E.out(seg(lt, 2.4, 3.4));
  if (h > 0) {
    hand(g, lerp(-300, 360, h), 1500, 2.0, -.08, 'up', '#CDB592');
    const pu = seg(lt, 3.2, 5.6), px = 640 + Math.sin(pu * 7) * 80 * (1 - pu), py = lerp(400, 1440, E.out2(pu));
    glow(g, px, py, 110, '#FFF6D8', .5);
    g.save(); g.translate(px, py); g.rotate(1.3 + (1 - pu) * 3); g.scale(pu < 1 ? Math.max(.3, Math.abs(Math.cos(pu * 8))) : 1, 1); g.drawImage(img, -36, -54, 72, 108); g.restore();
  }
}
