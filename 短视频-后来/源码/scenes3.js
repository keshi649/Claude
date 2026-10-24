'use strict';
/* scenes3.js —— 主歌（38.5~89.8 秒），十七岁的夏天，日期戳 '09 7 17：
   S12 栀子花特写，"白花瓣"时一片花瓣落下。
   S13 校园的长椅，她在栀子花丛边看书。
   S14 花瓣一片片落在蓝色百褶裙上。
   S15 他坐过来，凑到她耳边——"爱你"。花瓣停在半空。
   S16 他递过来一朵栀子，她低下头闻，香气像金色的烟。
   S17 白天到夜晚：天一层层暗下去，路灯亮了，星星出来。
   S18 河边的草地，萤火虫飞起来（"十七岁仲夏"）。
   S19 银河下两个人的剪影，流星划过——他吻了她。
   S20 镜头从星空往下摇，回到现在：她一个人在阳台上看天。
   S21 加班的夜、夜车的窗、天桥上：每一次抬头都有一颗星。
   S22 她眼睛里映着那天的星光，镜头扎进瞳孔里的星空。 */

const SUM_L = { x: .75, y: -.6, rim: '#FFF4D0', rimA: .5, sh: .2, warm: '#FFD7A0', warmA: .25 };

/* 侧面的长椅 */
function benchSide(g, x, y, w, u) {
  // y 是地面，凳面高约 1.95u
  const sy = y - 1.95 * u;
  g.fillStyle = '#3A3634'; g.fillRect(x + 20, sy, 12, 1.95 * u); g.fillRect(x + w - 32, sy, 12, 1.95 * u);
  g.fillStyle = '#8A5A3A'; g.fillRect(x, sy - 16, w, 18); g.fillStyle = '#6E4630'; g.fillRect(x, sy + 2, w, 8);
  // 靠背
  g.fillStyle = '#3A3634'; g.fillRect(x + 26, sy - 1.6 * u, 10, 1.6 * u);
  g.fillStyle = '#8A5A3A'; g.fillRect(x + 10, sy - 1.5 * u, w - 20, 16); g.fillRect(x + 10, sy - 1.05 * u, w - 20, 16);
}
/* 一本书（侧面看是一块，拿在手里） */
function bookIn(g, x, y, w, rot, c = '#E8DCC0') {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = '#5A6A8A'; g.fillRect(-w / 2, -6, w, 12); g.fillStyle = c; g.fillRect(-w / 2 + 3, -10, w - 6, 8);
  g.restore();
}

/* ---------------- S12 栀子花特写 ---------------- */
function shGardeniaClose(g, t, s) {
  const lt = t - s.t, z = 1 + lt * .03;
  skyGrad(g, [[0, '#7FC0EE'], [.5, '#CDE8F2'], [1, '#B9D49A']]);
  bokeh(g, t, { n: 26, seed: 15, size: 120, a: .35, cols: ['#FFF4C8', '#CFEFA0', '#FFFFFF', '#9FD48A'] });
  g.save(); g.translate(W / 2, H * .5); g.scale(z, z); g.translate(-W / 2, -H * .5);
  // 枝叶
  g.strokeStyle = '#4A5A30'; g.lineWidth = 16; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-60, 1500); g.bezierCurveTo(300, 1300, 420, 1000, 620, 860); g.stroke();
  g.lineWidth = 10; g.beginPath(); g.moveTo(330, 1210); g.quadraticCurveTo(250, 900, 300, 640); g.stroke();
  const r = R(8);
  const lv = [[180, 1380, 300, -.6], [420, 1150, 280, -1.2], [520, 980, 300, -.2], [260, 980, 260, -2.0], [700, 900, 260, .4], [320, 700, 240, -1.7], [120, 1180, 280, 2.6], [600, 1150, 260, .9], [380, 600, 220, -.8]];
  for (const [x, y, l, a] of lv) leaf(g, x, y, l, a + Math.sin(t * .8 + x) * .02, '#2F6B3A');
  // 三朵花
  gardenia(g, 640, 820, 250, .2 + Math.sin(t * .5) * .02);
  gardenia(g, 300, 630, 170, -.4, { tilt: .8 });
  gardenia(g, 470, 1240, 190, .9, { tilt: .75 });
  // 露珠
  for (let i = 0; i < 9; i++) { const x = 560 + r() * 200, y = 740 + r() * 160, sz = 6 + r() * 7; circ(g, x, y, sz, 'rgba(255,255,255,.5)'); circ(g, x - sz * .3, y - sz * .3, sz * .35, 'rgba(255,255,255,.95)'); }
  g.restore();
  sunRays(g, t, 980, 80, .8, { ang: 2.0 });
  // "白花瓣"：一片花瓣从大花上掉下来，往下飘出画面
  const u = seg(t, ch(7, 3) - .1, s.e + .3);
  if (u > 0) {
    const img = petalImg(), x = 700 + Math.sin(u * 6) * 90 + u * 60, y = 860 + E.in2(u) * 1300, sz = 120;
    g.save(); g.translate(x, y); g.rotate(u * 4); g.scale(Math.max(.2, Math.abs(Math.cos(u * 5))), 1); g.drawImage(img, -sz * .33, -sz * .5, sz * .66, sz); g.restore();
  }
  petalsNear(g, t, { n: 2, seed: 9, a: .6 });
}

/* ---------------- 校园的长椅一角（S13、S15、S17 共用） ---------------- */
function benchScene(g, t, o = {}) {
  const night = o.night || 0, u = (o.h || 820) / 7.3, gy = 1640;
  // 天：白天 → 黄昏 → 夜
  const day = [[0, '#6FB2E8'], [.5, '#B8DDF2'], [.75, '#EAF2E8']], dusk = [[0, '#3A3A78'], [.45, '#C86A78'], [.75, '#FFB070']], nite = [[0, '#060820'], [.5, '#141A48'], [.75, '#2A2A5A']];
  const sky = (a, b, k) => a.map((p, i) => [p[0], mix(p[1], b[i][1], k)]);
  const st = night < .5 ? sky(day, dusk, night * 2) : sky(dusk, nite, night * 2 - 1);
  g.fillStyle = lg(g, 0, 0, 0, gy, st); g.fillRect(0, 0, W, gy);
  if (night > .55) { withAlpha(g, seg(night, .55, 1), () => { stars(g, t, { n: 300, y1: 1200, seed: 3 }); g.globalAlpha *= .6; g.drawImage(milkyWay(2), 0, -200); }); }
  if (night < .6) { withAlpha(g, 1 - seg(night, .3, .6), () => { g.drawImage(cloudImg(1), 300 + t * (o.fast ? 60 : 4), 260, 700, 360); g.drawImage(cloudImg(2), -200 + t * (o.fast ? 40 : 3), 520, 560, 290); }); }
  if (night > .2 && night < .8) glow(g, 300, gy - 200, 600, '#FF9050', .5 * Math.sin(seg(night, .2, .8) * PI));
  // 远处的楼和树
  const dark = night * .75;
  g.fillStyle = shade('#E9E2D2', 1 - dark); g.fillRect(-40, gy - 520, 700, 360);
  for (let r2 = 0; r2 < 3; r2++) for (let c = 0; c < 8; c++) { g.fillStyle = night > .6 && (r2 + c) % 3 === 0 ? '#FFD890' : shade('#9CC3DA', 1 - dark); g.fillRect(-10 + c * 84, gy - 480 + r2 * 100, 54, 56); }
  for (let i = 0; i < 9; i++) { const x = -60 + i * 150; g.fillStyle = shade(i % 2 ? '#5E9A55' : '#4F8B4A', 1 - dark); g.beginPath(); g.ellipse(x, gy - 230, 120, 150, 0, 0, TAU); g.fill(); }
  // 草地
  g.fillStyle = lg(g, 0, gy - 80, 0, H, [[0, shade('#9DBB76', 1 - dark)], [1, shade('#6E8E52', 1 - dark)]]); g.fillRect(0, gy - 80, W, H);
  // 栀子花丛在右边
  g.drawImage(gardeniaBush(760, 560, 4, { night: night > .6 }), 520, gy - 620, 820, 604);
  // 路灯：天黑以后亮
  const lx = 140, ly = gy - 1150, on = seg(night, .55, .62);
  g.fillStyle = '#25282E'; g.fillRect(lx, ly, 14, 1150); g.fillRect(lx, ly, 110, 12);
  if (on > 0) { glow(g, lx + 100, ly + 24, 420, '#FFD49A', .6 * on); circ(g, lx + 100, ly + 24, 16, `rgba(255,243,214,${on})`); g.fillStyle = `rgba(255,214,150,${.2 * on})`; poly(g, [[lx + 100, ly + 24], [lx - 260, gy], [lx + 520, gy]]); g.fill(); }
  benchSide(g, 260, gy, 520, u);
  return { gy, u };
}

/* ---------------- S13 长椅看书 ---------------- */
function shBenchRead(g, t, s) {
  const lt = t - s.t;
  const { gy, u } = benchScene(g, t, {});
  const F = { x: 600, y: gy, h: 820, who: 'girl', view: 'side', dir: 1, pose: Object.assign(POSE.sit(), { head: .3, lean: .05, arms: [{ sh: .5, el: 1.35 }, { sh: .42, el: 1.45 }] }), light: SUM_L, eyes: 'down', blush: .2 };
  fig(g, F);
  bookIn(g, F.hand0[0] + 6, F.hand0[1] - 14, 120, -.5);
  petals(g, t, { n: 22, seed: 13, fall: 90, size: 26, wind: 25 });
  sunRays(g, t, 1000, 60, .7);
}

/* ---------------- S14 花瓣落在百褶裙上 ---------------- */
/* 她低头看自己腿上的主观镜头：上面是捧着的书，中间是百褶裙，下面是膝盖、白袜、鞋，再往下是地面 */
function shSkirtPetals(g, t, s) {
  const lt = t - s.t;
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#9AB878'], [1, '#C8B898']]); g.fillRect(0, 0, W, H);
  // 地上的小路和光斑
  g.fillStyle = '#D8C8A8'; g.fillRect(0, 1500, W, 420);
  for (let i = 0; i < 16; i++) { g.fillStyle = `rgba(255,248,215,${.18 + .08 * Math.sin(t + i)})`; g.beginPath(); g.ellipse(hash(i, 1) * W, 1550 + hash(i, 2) * 350, 50 + hash(i, 3) * 60, 18, 0, 0, TAU); g.fill(); }
  // 长椅的木板，从裙子两边露出来
  g.fillStyle = '#8A5A3A'; for (let i = 0; i < 3; i++) { g.fillRect(0, 760 + i * 190, W, 150); g.fillStyle = i % 2 ? '#8A5A3A' : '#7E5236'; }
  g.fillStyle = '#5A3A26'; for (let i = 0; i < 3; i++) g.fillRect(0, 905 + i * 190, W, 8);
  const cx = 540, sw = Math.sin(t * 1.1) * 5;
  // 小腿、白袜、鞋（往下缩）
  for (const sd of [-1, 1]) {
    const kx = cx + sd * 150;
    capsule(g, kx, 1330, 100, kx + sd * 10, 1640, 62, '#EBC2AA');
    capsule(g, kx + sd * 8, 1600, 66, kx + sd * 12, 1760, 58, '#F7F6F2');
    g.fillStyle = '#2A2526'; g.beginPath(); g.ellipse(kx + sd * 14, 1820, 80, 62, 0, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(kx + sd * 4, 1800, 40, 20, 0, 0, TAU); g.fill();
  }
  // 膝盖
  for (const sd of [-1, 1]) { const kx = cx + sd * 150; g.fillStyle = rg(g, kx - 30, 1290, 0, 150, [[0, '#F8DCC8'], [1, '#E2B49C']]); g.beginPath(); g.ellipse(kx, 1300, 128, 112, 0, 0, TAU); g.fill(); }
  // 裙子：腰在最上面，往下散开到膝盖上面
  const top = -40, bot = 1220, n = 18;
  g.save();
  g.beginPath(); g.moveTo(cx - 330, top); g.lineTo(cx + 330, top); g.lineTo(cx + 420 + sw, bot); 
  for (let i = n; i >= 0; i--) g.lineTo(lerp(cx - 420, cx + 420, i / n) + sw, bot + (i % 2 ? 26 : 0));
  g.closePath(); g.fillStyle = '#3A5DA6'; g.fill(); g.clip();
  for (let i = 0; i < n; i++) {
    const a0 = i / n, a1 = (i + .5) / n;
    g.beginPath(); g.moveTo(lerp(cx - 330, cx + 330, a0), top); g.lineTo(lerp(cx - 330, cx + 330, a1), top); g.lineTo(lerp(cx - 420, cx + 420, a1) + sw, bot + 30); g.lineTo(lerp(cx - 420, cx + 420, a0) + sw, bot + 30); g.closePath();
    g.fillStyle = 'rgba(30,50,110,.45)'; g.fill();
  }
  g.fillStyle = lg(g, 0, top, 0, bot, [[0, 'rgba(255,240,210,.12)'], [1, 'rgba(10,20,60,.2)']]); g.fillRect(0, top, W, bot - top + 40);
  g.restore();
  // 捧着的书
  g.save(); g.translate(cx, 420); g.rotate(-.03);
  g.shadowColor = 'rgba(20,30,70,.35)'; g.shadowBlur = 30; g.shadowOffsetY = 16;
  g.fillStyle = '#5A6A8A'; g.fillRect(-330, -230, 660, 460); g.shadowColor = 'transparent';
  g.fillStyle = '#F6EEDA'; g.fillRect(-318, -220, 312, 440); g.fillRect(6, -220, 312, 440);
  g.fillStyle = lg(g, -40, 0, 40, 0, [[0, 'rgba(0,0,0,0)'], [.5, 'rgba(90,70,50,.25)'], [1, 'rgba(0,0,0,0)']]); g.fillRect(-40, -220, 80, 440);
  g.strokeStyle = 'rgba(90,70,50,.3)'; g.lineWidth = 6; for (let l = 0; l < 11; l++) { const y = -180 + l * 36; g.beginPath(); g.moveTo(-290, y); g.lineTo(-40 - (l % 4 === 3 ? 120 : 0), y); g.moveTo(40, y); g.lineTo(290 - (l % 5 === 2 ? 100 : 0), y); g.stroke(); }
  g.restore();
  hand(g, cx - 470, 560, 1.35, -.5, 'open', '#F6F3EC');
  hand(g, cx + 470, 560, 1.35, PI + .5, 'open', '#F6F3EC');
  // 花瓣：在"蓝""褶"时各落下一片，停在裙子上；之前已经有两片
  const img = petalImg();
  const land = [[ch(8, 3), 400, 960, .4], [ch(8, 6), 690, 1080, -.7], [-1, 560, 1160, 1.2], [-1, 280, 1120, 2.2]];
  for (const [t0, x, y, rot] of land) {
    const u = t0 < 0 ? 1 : seg(t, t0 - 1.2, t0);
    if (u <= 0) continue;
    const fx = x + (1 - u) * Math.sin(u * 8) * 120, fy = lerp(y - 1100, y, E.out2(u));
    g.save(); g.translate(fx, fy); g.rotate(rot + (1 - u) * 4); g.scale(u < 1 ? Math.max(.3, Math.abs(Math.cos(u * 6))) : 1, 1);
    g.shadowColor = 'rgba(20,30,70,.4)'; g.shadowBlur = 14; g.shadowOffsetY = 8 * u;
    g.drawImage(img, -42, -63, 84, 126); g.restore();
  }
  petals(g, t, { n: 10, seed: 31, fall: 110, size: 44, y1: 1200 });
  sunRays(g, t, 1000, 40, .6);
}

/* ---------------- S15 他坐过来，轻声说"爱你" ---------------- */
function shWhisper(g, t, s) {
  const lt = t - s.t;
  const freeze = env(t, ch(9, 2) - .1, ch(9, 2) + .3, ch(9, 5) + .4, ch(9, 5) + 1.4);   // "你轻声说"时时间停住
  const { gy, u } = benchScene(g, t, {});
  // 他从左边走过来坐下（0~0.8 秒），然后凑过去（"爱你"）
  const sitU = E.io(seg(lt, 0, .8)), lean = E.io(seg(t, ch(9, 0) - .3, ch(9, 1))) * (1 - E.io(seg(t, ch(9, 5) + .6, ch(9, 5) + 1.6)) * .6);
  const BL = { x: .75, y: -.6, rim: '#FFF4D0', rimA: .45, sh: .22 };
  const bx = lerp(-200, 400, sitU);
  if (sitU < 1) fig(g, { x: bx, y: gy, h: 860, who: 'boy', view: 'side', dir: 1, pose: POSE.walk(lt * 1.2, 1 - sitU), light: BL });
  else fig(g, { x: 400, y: gy, h: 860, who: 'boy', view: 'side', dir: 1, pose: Object.assign(POSE.sit(1.86), { lean: .1 + lean * .42, head: .05 + lean * .12, arms: [{ sh: .15 + lean * .15, el: .25 }, { sh: .1, el: .3 }] }), light: BL });
  const blush = .25 + .6 * seg(t, ch(9, 1), ch(9, 2) + .5);
  const F = { x: 640, y: gy, h: 820, who: 'girl', view: 'side', dir: 1, pose: Object.assign(POSE.sit(), { head: .3 - seg(t, ch(9, 1), ch(9, 2)) * .15, lean: .05, arms: [{ sh: .5, el: 1.35 }, { sh: .42, el: 1.45 }] }), light: SUM_L, eyes: freeze > .5 ? 'open' : 'down', blush };
  fig(g, F);
  bookIn(g, F.hand0[0] + 6, F.hand0[1] - 14, 120, -.5);
  // 花瓣：说"你轻声说"的时候停在半空，光一圈圈荡开
  const pt = t - freeze * (t - (ch(9, 2) - .1)) * .97;
  petals(g, pt, { n: 26, seed: 13, fall: 90, size: 28, wind: 25 });
  if (freeze > 0) {
    g.save(); g.globalCompositeOperation = 'screen';
    for (let i = 0; i < 3; i++) { const k = mod(t * .5 + i / 3, 1); g.strokeStyle = `rgba(255,236,200,${(1 - k) * .35 * freeze})`; g.lineWidth = 6; g.beginPath(); g.arc(700, gy - 700, 80 + k * 700, 0, TAU); g.stroke(); }
    g.restore();
    tint(g, '#FFC0A0', .25 * freeze, 'soft-light');
  }
  sunRays(g, t, 1000, 60, .7);
}

/* ---------------- S16 低头闻花 ---------------- */
function shSmell(g, t, s) {
  const lt = t - s.t;
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#A8D4EE'], [.6, '#CFE6C8'], [1, '#8AB078']]); g.fillRect(0, 0, W, H);
  bokeh(g, t, { n: 30, seed: 41, size: 150, a: .4, cols: ['#FFF4C8', '#D8F0B0', '#FFFFFF', '#FFE0A0'] });
  sunRays(g, t, 900, 100, .7);
  const down = E.io(seg(t, ch(10, 1) - .2, ch(10, 3) + .2));
  const F = { x: 380, y: 3300, h: 2900, who: 'girl', view: 'side', dir: 1, pose: { lean: .05 + down * .12, head: .05 + down * .42, legs: [{ th: 0, kn: 0 }, { th: 0, kn: 0 }], arms: [{ sh: .2, el: 2.6 - down * .3 }, { sh: 0, el: 0 }] }, light: SUM_L, eyes: down > .4 ? 'closed' : 'open', blush: .3 + down * .4 };
  fig(g, F);
  // 他的手从右边递过来一朵栀子（0~1 秒），她接住，捧到鼻子前
  const give = E.io(seg(lt, 0, 1.0)), take = seg(lt, 1.0, 1.6);
  const fx = take < 1 ? lerp(1100, 840, give) : lerp(840, 740, E.io(seg(t, ch(10, 1) - .2, ch(10, 3) + .2))), fy = lerp(1050, 1000, give) + down * 40;
  if (take < 1) hand(g, fx + 80, fy + 70, 1.3, PI + .25, 'open', '#F4F3EF');
  else hand(g, fx - 120, fy + 140, 1.3, -.55, 'open', '#F6F3EC');
  gardenia(g, fx, fy, 95, t * .1, { tilt: .9 });
  leaf(g, fx + 30, fy + 70, 120, .7);
  // 香气：一缕缕金色的烟往上飘
  const k = seg(t, ch(10, 4) - .3, ch(10, 9));
  if (k > 0) {
    g.save(); g.globalCompositeOperation = 'screen';
    for (let i = 0; i < 26; i++) {
      const ph = mod(t * .45 + i / 26, 1), x = fx + Math.sin(ph * 9 + i) * 60 * ph - ph * 120, y = fy - ph * 600;
      glow(g, x, y, 30 + ph * 40, '#FFE6A8', (1 - ph) * .6 * k);
    }
    g.restore();
  }
  petals(g, t, { n: 14, seed: 52, fall: 80, size: 40, wind: 30 });
}

/* ---------------- S17 白天到夜晚 ---------------- */
function shDayToNight(g, t, s) {
  const lt = t - s.t, night = E.sine(seg(lt, .3, s.e - s.t - .4));
  const { gy, u } = benchScene(g, t, { night, fast: 1 });
  const L = { x: -.6, y: -.6, rim: night > .5 ? '#FFD49A' : '#FFF4D0', rimA: .55, sh: .25 + night * .4, col: '#0A0A1E' };
  fig(g, { x: 400, y: gy, h: 860, who: 'boy', view: 'side', dir: 1, pose: Object.assign(POSE.sit(1.86), { lean: .05, head: -.15 }), light: L });
  fig(g, { x: 640, y: gy, h: 820, who: 'girl', view: 'side', dir: 1, pose: Object.assign(POSE.sit(), { head: -.25, lean: -.02 }), light: L, eyes: 'open', blush: .3 });
  g.fillStyle = `rgba(6,8,30,${night * .45})`; g.fillRect(0, 0, W, H);
  if (night > .6) fireflies(g, t, { n: 16, y0: 1100, y1: 1700, a: seg(night, .6, 1) });
}

/* ---------------- 夜里的河边草地（S18、S65 共用） ---------------- */
function nightField(g, t, o = {}) {
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#04061A'], [.55, '#121A4A'], [.72, '#2A2A5E']]); g.fillRect(0, 0, W, H);
  g.drawImage(milkyWay(1), 0, o.mwY || 0);
  stars(g, t, { n: 500, y1: 1300, seed: 7 });
  // 远山、河
  g.fillStyle = '#0B0F26'; spline(g, [[-50, 1240], [200, 1150], [420, 1210], [700, 1120], [1130, 1200], [1130, 1400], [-50, 1400]], true, .4); g.fill();
  g.fillStyle = lg(g, 0, 1260, 0, 1420, [[0, '#1E2A5A'], [1, '#0E1430']]); g.fillRect(0, 1260, W, 160);
  g.fillStyle = 'rgba(200,210,255,.25)'; for (let i = 0; i < 30; i++) { const x = hash(i, 4) * W; g.fillRect(x + Math.sin(t + i) * 10, 1280 + hash(i, 5) * 120, 40 + hash(i, 6) * 80, 3); }
  // 草坡
  g.fillStyle = '#070A16'; spline(g, [[-50, 1500], [300, 1420], [700, 1450], [1130, 1380], [1130, H + 10], [-50, H + 10]], true, .4); g.fill();
  // 草叶
  g.strokeStyle = '#0C1020'; g.lineWidth = 4;
  for (let i = 0; i < 160; i++) { const x = hash(i, 9) * W, y = 1440 + hash(i, 10) * 500, h = 40 + hash(i, 11) * 90, b = Math.sin(t * 1.3 + i) * 8; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + b, y - h * .5, x + b * 2 + 6, y - h); g.stroke(); }
}
/* ---------------- S18 萤火虫、十七岁仲夏 ---------------- */
function shFireflies(g, t, s) {
  const lt = t - s.t;
  nightField(g, t, { mwY: -lt * 20 });
  // 两个人并排坐在草坡上的背影
  const L = { x: 0, y: -1, rim: '#AFC4FF', rimA: .55, sh: 0 };
  const lean = E.io(seg(lt, .8, 2.5));
  fig(g, { x: 420, y: 2080, h: 900, who: 'boy', view: 'back', sil: '#0A0D1E', light: L, pose: { tilt: lean * .1 } });
  fig(g, { x: 640, y: 2100, h: 860, who: 'girl', view: 'back', sil: '#0A0D1E', light: L, pose: { tilt: -lean * .22, hx: -lean * .2 } });
  // 前景的草挡住腿
  g.fillStyle = '#060812'; spline(g, [[-50, 1700], [300, 1650], [700, 1690], [1130, 1640], [1130, H + 10], [-50, H + 10]], true, .4); g.fill();
  fireflies(g, t, { n: 60, y0: 900, y1: 1800, rise: 30, size: 26 });
}

/* ---------------- S19 银河下的吻（剪影） ---------------- */
/* 侧脸剪影：头、脖子、肩膀一整块。(x,y) 是头的中心，s 是头高，dir 1 朝右。who 'girl' 有马尾和碎发、'boy' 短发 */
function profileBust(g, x, y, s, dir, who, rot = 0) {
  g.save(); g.translate(x, y); g.scale(dir * s, s); g.rotate(rot * dir);
  g.beginPath();
  if (who === 'girl') {
    g.moveTo(.22, -.56);
    g.bezierCurveTo(.33, -.45, .38, -.25, .37, -.1);       // 额头
    g.quadraticCurveTo(.39, .0, .42, .06);                  // 鼻梁
    g.lineTo(.49, .14); g.quadraticCurveTo(.46, .19, .41, .19);   // 鼻尖
    g.quadraticCurveTo(.43, .23, .43, .26); g.quadraticCurveTo(.4, .28, .42, .3);   // 嘴唇
    g.quadraticCurveTo(.42, .34, .38, .36);
    g.bezierCurveTo(.38, .42, .32, .47, .22, .47);          // 下巴
    g.quadraticCurveTo(.15, .5, .13, .62); g.lineTo(.12, .95);   // 脖子
    g.bezierCurveTo(.3, 1.05, .5, 1.15, .66, 2.4); g.lineTo(-1.0, 2.4);   // 肩
    g.bezierCurveTo(-.85, 1.2, -.5, 1.05, -.26, .95);
    g.bezierCurveTo(-.2, .8, -.2, .6, -.3, .4);              // 后颈（马尾垂在这）
    g.bezierCurveTo(-.62, .5, -.66, .9, -.58, 1.1);          // 马尾
    g.bezierCurveTo(-.78, .7, -.7, .2, -.5, -.08);
    g.bezierCurveTo(-.55, -.4, -.3, -.66, .0, -.66);         // 后脑勺、头顶
    g.bezierCurveTo(.12, -.66, .18, -.62, .22, -.56);
  } else {
    g.moveTo(.24, -.55);
    g.bezierCurveTo(.36, -.44, .4, -.26, .39, -.1);
    g.quadraticCurveTo(.41, .0, .44, .06);
    g.lineTo(.52, .15); g.quadraticCurveTo(.48, .2, .43, .2);
    g.quadraticCurveTo(.45, .24, .44, .27); g.quadraticCurveTo(.41, .29, .43, .31);
    g.quadraticCurveTo(.43, .36, .4, .4);
    g.bezierCurveTo(.4, .5, .3, .53, .2, .52);               // 下巴方一点
    g.quadraticCurveTo(.16, .56, .16, .66); g.lineTo(.16, .95);
    g.bezierCurveTo(.4, 1.05, .62, 1.15, .8, 2.4); g.lineTo(-1.05, 2.4);
    g.bezierCurveTo(-.9, 1.2, -.55, 1.05, -.28, .95);
    g.bezierCurveTo(-.24, .75, -.26, .55, -.36, .38);
    g.bezierCurveTo(-.56, .2, -.6, -.3, -.4, -.55);
    // 短发，额前翘起一撮
    g.bezierCurveTo(-.25, -.72, .1, -.76, .3, -.62); g.quadraticCurveTo(.36, -.6, .28, -.52);
  }
  g.closePath(); g.fill();
  g.restore();
}
function shKiss(g, t, s) {
  const lt = t - s.t;
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#03051A'], [.6, '#18185A'], [1, '#3A2A6A']]); g.fillRect(0, 0, W, H);
  g.drawImage(milkyWay(3), 0, -100 - lt * 10);
  stars(g, t, { n: 500, seed: 9 });
  glow(g, 540, 1350, 800, '#9A8AF0', .4);
  const k = E.io(seg(t, ch(13, 0) - .3, ch(13, 4))), zoom = 1 + lt * .02;
  // 两张侧脸先画到一块画布上，再加月光的轮廓
  const q = layer('kiss');
  q.fillStyle = '#05061A';
  q.translate(540, 1150); q.scale(zoom, zoom); q.translate(-540, -1150);
  const S = 470;
  profileBust(q, lerp(150, 300, k), 1030, S * 1.05, 1, 'boy', .1 * k);
  profileBust(q, lerp(930, 768, k), 1062, S, -1, 'girl', -.06 * k);
  const r = layer('kissRim');
  r.drawImage(LAYER.kiss, 0, 0); r.globalCompositeOperation = 'source-in'; r.fillStyle = '#D6DEFF'; r.fillRect(0, 0, W, H);
  r.globalCompositeOperation = 'destination-out'; r.drawImage(LAYER.kiss, 0, 7);
  g.drawImage(LAYER.kiss, 0, 0);
  g.save(); g.globalAlpha = .9; g.drawImage(LAYER.kissRim, 0, 0); g.filter = 'blur(6px)'; g.globalCompositeOperation = 'screen'; g.drawImage(LAYER.kissRim, 0, 0); g.restore();
  // 流星
  const m = seg(t, ch(13, 4) - .1, ch(13, 4) + .7);
  if (m > 0 && m < 1) {
    const x = lerp(900, 200, m), y = lerp(200, 620, m);
    g.save(); g.globalCompositeOperation = 'screen';
    g.strokeStyle = lg(g, x, y, x + 300, y - 180, [[0, 'rgba(255,255,255,.95)'], [1, 'rgba(255,255,255,0)']]); g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + 300, y - 180); g.stroke(); glow(g, x, y, 60, '#FFFFFF', .9 * (1 - m));
    g.restore();
  }
  fireflies(g, t, { n: 24, y0: 900, y1: 1900, size: 30, seed: 8 });
}

/* ---------------- S20 回到现在：阳台上看天 ---------------- */
function shBalconySky(g, t, s) {
  const lt = t - s.t, pan = E.io(seg(lt, 0, 1.8));
  // 镜头往下摇：上面是那天的星空，下面是现在的城市和阳台
  g.save(); g.translate(0, pan * -1200 + 0);
  g.fillStyle = lg(g, 0, -200, 0, 3200, [[0, '#03051A'], [.35, '#18204A'], [.6, '#2A2A4A'], [1, '#0E0C14']]); g.fillRect(0, -200, W, 3400);
  withAlpha(g, 1 - pan * .7, () => { g.drawImage(milkyWay(3), 0, -300); stars(g, t, { n: 400, y1: 1500, seed: 9 }); });
  stars(g, t, { n: 30, y1: 2000, seed: 77 });
  // 现在的城市：楼群剪影、远处的灯
  g.drawImage(skyline(51, 1200, 900, { col: '#121626', lit: .3 }), -60, 2100);
  glow(g, 540, 2900, 900, '#FF9A5A', .25);
  // 阳台栏杆
  const ry = 2560;
  const L = { x: .3, y: -1, rim: '#B8C8FF', rimA: .6, sh: .4, col: '#0A0A18' };
  fig(g, { x: 640, y: ry + 700, h: 1000, who: 'woman', view: 'side', dir: -1, light: L, pose: { lean: .12, head: -.32, arms: [{ sh: .55, el: .9 }, { sh: .45, el: 1.0 }] }, eyes: 'open' });
  g.fillStyle = '#1A1A22'; g.fillRect(0, ry, W, 22); for (let i = 0; i < 20; i++) g.fillRect(i * 60, ry, 8, 400);
  g.fillStyle = '#121218'; g.fillRect(0, ry + 400, W, 400);
  g.restore();
}

/* ---------------- S21 每当有感叹：三次抬头 ---------------- */
function shSighs(g, t, s) {
  const lt = t - s.t, k = lt < .95 ? 0 : lt < 1.95 ? 1 : 2;
  const L = { x: -.4, y: -.8, rim: '#B8D0FF', rimA: .6, sh: .4, col: '#0A0A18' };
  if (k === 0) {   // 加班：办公室的大窗
    g.fillStyle = '#0B0E1C'; g.fillRect(0, 0, W, H);
    g.drawImage(skyline(61, 1080, 900, { col: '#141A30', lit: .35 }), 0, 500);
    stars(g, t, { n: 40, y1: 500, seed: 61 }); glow(g, 760, 260, 90, '#FFFFFF', .8); circ(g, 760, 260, 5, '#FFFFFF');
    g.fillStyle = '#16141C'; g.fillRect(0, 1350, W, 600); g.fillStyle = '#2A2630'; g.fillRect(0, 1340, W, 20);
    g.fillStyle = '#C8D8FF'; poly(g, [[440, 1340], [640, 1340], [620, 1170], [460, 1170]]); g.fill(); glow(g, 540, 1260, 300, '#9FC0FF', .4);
    fig(g, { x: 300, y: 1750, h: 1000, who: 'woman', view: 'side', dir: 1, light: L, pose: Object.assign(POSE.sit(2.6), { head: -.45, arms: [{ sh: 1.3, el: .2 }, { sh: 1.2, el: .3 }] }), eyes: 'open' });
  } else if (k === 1) {   // 夜车：车窗、她的倒影、窗外流过的灯
    g.fillStyle = '#0A0C16'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 14; i++) { const x = mod(i * 260 - lt * 1800, W + 400) - 200, y = 900 + hash(i, 2) * 500; g.fillStyle = lg(g, x, 0, x + 300, 0, [[0, 'rgba(255,200,120,0)'], [1, 'rgba(255,200,120,.7)']]); g.fillRect(x, y, 300, 6); }
    stars(g, t, { n: 20, y1: 700, seed: 62 }); glow(g, 300, 380, 90, '#FFFFFF', .8); circ(g, 300, 380, 5, '#FFFFFF');
    withAlpha(g, .45, () => fig(g, { x: 620, y: 3100, h: 2500, who: 'woman', view: 'side', dir: -1, light: L, pose: { head: -.3 }, eyes: 'open' }));
    g.fillStyle = '#1C1E28'; g.fillRect(0, 0, W, 180); g.fillRect(0, 1700, W, 220); g.fillRect(0, 0, 90, H); g.fillRect(W - 90, 0, 90, H);
  } else {   // 天桥：一个人走着，抬头
    g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#070A1C'], [1, '#1E1A30']]); g.fillRect(0, 0, W, H);
    stars(g, t, { n: 50, y1: 900, seed: 63 }); glow(g, 600, 300, 90, '#FFFFFF', .8); circ(g, 600, 300, 5, '#FFFFFF');
    g.drawImage(skyline(64, 1080, 700, { col: '#10142A', lit: .4 }), 0, 1000);
    for (let i = 0; i < 12; i++) { const x = mod(i * 200 + lt * 600, W + 300) - 150; g.fillStyle = 'rgba(255,90,80,.8)'; g.fillRect(x, 1780, 60, 6); g.fillStyle = 'rgba(255,240,210,.8)'; g.fillRect(W - x, 1820, 60, 6); }
    g.fillStyle = '#16161E'; g.fillRect(0, 1640, W, 40); for (let i = 0; i < 24; i++) g.fillRect(i * 48, 1460, 6, 180); g.fillRect(0, 1450, W, 14);
    fig(g, { x: 480, y: 1650, h: 900, who: 'woman', view: 'side', dir: 1, light: L, pose: Object.assign(POSE.walk(lt * .6, .5), { head: -.4 }), eyes: 'open' });
  }
}

/* ---------------- S22 眼睛里的星光 ---------------- */
function eyeMacro(g, t, o = {}) {
  const cx = 540, cy = 900, w = 820, h = 380;
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#E8BCA6'], [.5, '#F2CDB8'], [1, '#D8A890']]); g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(80,40,40,.12)'; g.beginPath(); g.ellipse(cx, cy - 40, w * .62, h * .9, 0, 0, TAU); g.fill();
  // 眼白和虹膜
  g.save();
  g.beginPath(); g.moveTo(cx - w / 2, cy); g.bezierCurveTo(cx - w * .25, cy - h * .75, cx + w * .2, cy - h * .8, cx + w / 2, cy - h * .05); g.bezierCurveTo(cx + w * .25, cy + h * .55, cx - w * .2, cy + h * .55, cx - w / 2, cy); g.closePath();
  g.fillStyle = '#F4EEEC'; g.fill(); g.clip();
  const ir = 205, ix = cx + 10, iy = cy - 20;
  g.fillStyle = rg(g, ix, iy, 0, ir, [[0, '#0B0A14'], [.35, '#1A1430'], [.75, '#3A2A3A'], [1, '#1A1218']]); g.beginPath(); g.arc(ix, iy, ir, 0, TAU); g.fill();
  // 虹膜里映着星空和两个人
  g.save(); g.beginPath(); g.arc(ix, iy, ir * .96, 0, TAU); g.clip();
  g.globalAlpha = .9 * (o.refl || 1);
  g.drawImage(milkyWay(3), ix - 300, iy - 500, 600, 1066);
  const r = R(5); for (let i = 0; i < 80; i++) { g.fillStyle = `rgba(255,255,255,${r()})`; g.fillRect(ix + (r() - .5) * 2 * ir, iy + (r() - .5) * 2 * ir, 2, 2); }
  g.fillStyle = 'rgba(5,5,20,.9)'; spline(g, [[ix - ir, iy + ir * .5], [ix - 40, iy + ir * .4], [ix + 60, iy + ir * .45], [ix + ir, iy + ir * .4], [ix + ir, iy + ir], [ix - ir, iy + ir]], true, .4); g.fill();
  if (!o.dive) { circ(g, ix - 30, iy + ir * .3, 9, 'rgba(5,5,20,.95)'); circ(g, ix + 2, iy + ir * .31, 9, 'rgba(5,5,20,.95)'); }
  g.restore();
  if (!o.dive) { g.fillStyle = 'rgba(255,255,255,.75)'; ell(g, ix - 80, iy - 90, 34, 24, -.5); circ(g, ix + 70, iy + 60, 10, 'rgba(255,255,255,.5)'); }
  g.fillStyle = 'rgba(60,30,30,.25)'; g.fillRect(cx - w, cy - h, w * 2, h * .45);
  g.restore();
  // 睫毛
  g.strokeStyle = '#1A1218'; g.lineCap = 'round';
  g.lineWidth = 14; g.beginPath(); g.moveTo(cx - w / 2, cy); g.bezierCurveTo(cx - w * .25, cy - h * .75, cx + w * .2, cy - h * .8, cx + w / 2, cy - h * .05); g.stroke();
  for (let i = 0; i < 16; i++) {
    const a = i / 15, x = lerp(cx - w * .4, cx + w * .45, a), y = cy - h * .62 * Math.sin(a * PI * .95 + .1) - 6;
    g.lineWidth = 6; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 20 + a * 30, y - 50, x + 40 + a * 60, y - 70 + Math.sin(a * 3) * 10); g.stroke();
  }
  if (o.tear) {   // 下眼睑上涌起来的泪
    const k = o.tear;
    g.strokeStyle = `rgba(230,240,255,${.6 * k})`; g.lineWidth = 10; g.beginPath(); g.moveTo(cx - w * .4, cy + 20); g.bezierCurveTo(cx - w * .2, cy + h * .5, cx + w * .2, cy + h * .5, cx + w * .44, cy); g.stroke();
    const tx = cx + w * .12, ty = cy + h * .44, tr = 8 + k * 30;
    g.fillStyle = `rgba(220,235,255,${.35 + .4 * k})`; g.beginPath(); g.ellipse(tx, ty + tr * .4, tr * .8, tr, 0, 0, TAU); g.fill();
    circ(g, tx - tr * .3, ty + tr * .1, tr * .25, `rgba(255,255,255,${.9 * k})`);
  }
  g.lineWidth = 4; g.strokeStyle = 'rgba(40,20,20,.5)'; g.beginPath(); g.moveTo(cx - w * .45, cy + 10); g.bezierCurveTo(cx - w * .2, cy + h * .5, cx + w * .2, cy + h * .5, cx + w * .45, cy - h * .02); g.stroke();
  // 眉毛
  g.strokeStyle = 'rgba(40,24,24,.8)'; g.lineWidth = 34; g.beginPath(); g.moveTo(cx - w * .5, cy - h * 1.15); g.quadraticCurveTo(cx, cy - h * 1.5, cx + w * .55, cy - h * 1.1); g.stroke();
}
function shEyeStars(g, t, s) {
  const lt = t - s.t, dive = E.in(seg(t, ch(16, 6), s.e));
  const z = 1 + lt * .04 + dive * 14;
  g.save(); g.translate(550, 880); g.scale(z, z); g.translate(-550, -880);
  eyeMacro(g, t, { dive: dive > .05 });
  g.restore();
  // 扎进瞳孔以后就是满天星
  if (dive > .12) withAlpha(g, seg(dive, .12, .4), () => { g.fillStyle = '#03051A'; g.fillRect(0, 0, W, H); g.drawImage(milkyWay(3), 0, 0); stars(g, t, { n: 500 }); });
}
