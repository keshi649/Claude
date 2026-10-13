'use strict';
/* scenes6.js：桥段（男声，第 66~74 小节，白天，下雨）、最后一遍副歌（男声，第 74~82 小节：这次换他飞过去找她）、
   尾声（凌晨 3:47，两部手机同时亮起）和片尾卡。 */

/* ---------------- 雨天的街：咖啡店、行人和伞 ---------------- */
const CAFE_X = 900;
function rainStreet(g, s, x, o = {}) {
  g.fillStyle = vgrad(g, 0, 760, [[0, '#7E899C'], [1, '#AEB6C4']]); g.fillRect(0, 0, W, 760);
  // 远处的楼
  for (let i = -1; i < 8; i++) {
    const id = Math.floor(x * .3 / 300) + i, bx = id * 300 - x * .3, bh = 380 + hash(id, 1) * 260;
    g.fillStyle = mixc('#8D96A8', '#9AA2B2', hash(id, 2)); g.fillRect(bx, 760 - bh, 290, bh);
    for (let j = 0; j < 6; j++) for (let k = 0; k < 4; k++) { g.fillStyle = hash(id, j, k) < .2 ? 'rgba(255,230,180,.5)' : 'rgba(60,70,90,.25)'; g.fillRect(bx + 24 + k * 66, 760 - bh + 30 + j * 64, 36, 40); }
  }
  // 近处的楼面和咖啡店
  const cx = CAFE_X - x;
  g.fillStyle = '#5E6678'; g.fillRect(cx - 900, 150, 2600, 610);
  for (let k = -4; k < 6; k++) { if (k === 0) continue; const wx = cx + k * 320; g.fillStyle = 'rgba(40,46,60,.6)'; g.fillRect(wx - 110, 260, 220, 300); g.fillStyle = 'rgba(160,175,200,.25)'; g.fillRect(wx - 110, 260, 220, 6); }
  // 咖啡店：暖光的大窗、条纹雨棚、招牌
  glow(g, cx, 470, 520, '#FFC27A', .35);
  g.fillStyle = '#3A2A24'; g.fillRect(cx - 300, 300, 600, 460);
  g.fillStyle = vgrad(g, 340, 740, [[0, '#FFD9A0'], [1, '#E8A46A']]); g.fillRect(cx - 270, 340, 380, 400);
  g.fillStyle = '#C98E5A'; g.fillRect(cx + 140, 360, 130, 380); g.fillStyle = '#FFE2B0'; circ(g, cx + 160, 560, 6); g.fill();
  // 窗里：桌子、灯、两个人影
  for (const lx of [cx - 180, cx]) { g.strokeStyle = '#5A3A28'; g.lineWidth = 3; g.beginPath(); g.moveTo(lx, 340); g.lineTo(lx, 400); g.stroke(); glow(g, lx, 410, 60, '#FFE6B8', .9); g.fillStyle = '#FFF0D0'; circ(g, lx, 408, 10); g.fill(); }
  g.fillStyle = '#8A5A3A'; g.fillRect(cx - 230, 620, 240, 12);
  if (o.inside !== false) { g.fillStyle = 'rgba(90,60,50,.75)'; circ(g, cx - 190, 560, 22); g.fill(); rr(g, cx - 220, 580, 60, 50, 18); g.fill(); circ(g, cx - 40, 556, 20); g.fill(); rr(g, cx - 70, 576, 60, 54, 18); g.fill(); }
  g.save(); g.beginPath(); g.moveTo(cx - 320, 300); g.lineTo(cx + 320, 300); g.lineTo(cx + 360, 220); g.lineTo(cx - 360, 220); g.closePath(); g.clip();
  for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#2E5A4A' : '#EDE6D6'; g.fillRect(cx - 360 + i * 45, 200, 45, 120); }
  g.restore();
  g.fillStyle = '#2A2422'; rr(g, cx - 170, 120, 340, 84, 12); g.fill();
  text(g, '月光咖啡', cx, 152, 46, { k: 'kai', col: '#FFE2A8', glow: '#FFB86A', gr: 18, ls: 8 });
  text(g, 'MOON CAFÉ', cx, 188, 20, { k: 'serif', col: '#FFE2A8', ls: 8 });
  // 人行道（湿的，倒映着店里的光）
  g.fillStyle = vgrad(g, 760, H, [[0, '#4A5262'], [1, '#2E3442']]); g.fillRect(0, 760, W, H - 760);
  g.save(); g.globalCompositeOperation = 'lighter';
  g.fillStyle = lgrad(g, 0, 770, 0, H, [[0, 'rgba(255,190,120,.35)'], [1, 'rgba(255,190,120,0)']]); g.fillRect(cx - 270, 770, 380, H - 770);
  g.restore();
  g.fillStyle = 'rgba(200,210,230,.25)'; g.fillRect(0, 760, W, 3);
  // 水花
  for (let i = 0; i < 50; i++) { const ph = (s * 2.5 + hash(i, 3)) % 1, px = hash(i, 4) * W, py = 790 + hash(i, 5) * 280; g.strokeStyle = `rgba(220,230,255,${.5 * (1 - ph)})`; g.lineWidth = 1.5; g.beginPath(); g.ellipse(px, py, 4 + ph * 18, (4 + ph * 18) * .3, 0, 0, TAU); g.stroke(); }
}
/* 打伞的行人（灰色），x 屏幕位置，y 脚底，k 大小 */
function walker(g, s, x, y, k, col, umb, ph, face = 1) {
  const p = walkPose(ph, 0);
  g.save(); g.translate(x, y); g.scale(face * k, k);
  g.fillStyle = col;
  const leg = (a) => { g.save(); g.rotate(-a * .8); rr(g, -8, -160, 16, 160, 8); g.fill(); g.restore(); };
  g.save(); g.translate(0, -150); leg(p.lN[0]); leg(p.lF[0]); g.restore();
  rr(g, -26, -300, 52, 170, 22); g.fill(); circ(g, 4, -326, 24); g.fill();
  g.restore();
  umbrella(g, x + 10 * face * k, y - 360 * k, 110 * k, umb, 1, -.05 * face);
}

/* ---------- 第 66 小节：再路过那家咖啡店 ---------- */
function sCafe(g, s, k) {
  const x = lerp(-500, 200, k / 2.53);
  rainStreet(g, s, x);
  for (let i = 0; i < 5; i++) walker(g, s, ((hash(i, 1) * 2400 - s * (90 + hash(i, 2) * 60) - x) % 2400 + 2400) % 2400 - 200, 980 + hash(i, 3) * 60, .78 + hash(i, 4) * .2, '#3A4050', ['#2A2E3A', '#44506A', '#5A4A62'][i % 3], s * 1.6 + i, -1);
  // 他：撑着透明伞，从左往右走过店门口
  const hx = 760 + Math.sin(s * .5) * 10;
  person(g, { who: 'he', x: hx, y: 860, u: 46, face: 1, pose: walkPose(s * 1.5, 0), t: s, eyes: 'half', mouth: 'n', outfit: 'coat', light: LIGHT.rain });
  clearUmbrella(g, hx + 30, 600, 170, -.05);
  rain(g, s, 420, { col: 'rgba(225,232,245,.45)', sp: 1600, len: 50, ang: .08 });
}
/* ---------- 第 67 小节：熟悉又陌生的地点 ----------
   隔着雨水的玻璃往里看：靠窗的那张桌子，现在坐着两个陌生人；有一瞬间，他们变回了当年的他和她。 */
function sCafeWindow(g, s, k) {
  g.fillStyle = '#E8B47A'; g.fillRect(0, 0, W, H);
  g.fillStyle = vgrad(g, 0, H, [[0, '#FFDDA8'], [1, '#D89A62']]); g.fillRect(0, 0, W, H);
  for (const lx of [500, 1400]) { glow(g, lx, 200, 260, '#FFF0D0', .7); g.fillStyle = '#5A3A28'; g.fillRect(lx - 2, 0, 4, 170); g.fillStyle = '#FFF4DC'; ell(g, lx, 190, 40, 24); g.fill(); }
  g.fillStyle = '#8A5A3A'; g.fillRect(560, 760, 800, 26); g.fillRect(940, 786, 40, 300);
  mug(g, 800, 760, 1.4, '#FFFFFF'); mug(g, 1120, 760, 1.4, '#FFFFFF');
  const mem = win(s, 170.6, 171.6, .2, .3);
  // 陌生人
  withAlpha(g, 1 - mem, () => {
    person(g, { who: 'stranger', x: 690, y: 820, u: 52, face: 1, pose: POSE.sit, t: s, eyes: 'happy', mouth: 'smile', outfit: 'coat', light: LIGHT.warm });
    person(g, { who: 'he', x: 1230, y: 820, u: 54, face: -1, pose: POSE.sit, t: s, eyes: 'happy', mouth: 'smile', outfit: 'coat', light: { ...LIGHT.warm, amb: '#A08070', ambA: .5 } });
  });
  // 当年的他们
  withAlpha(g, mem, () => {
    person(g, { who: 'she', x: 690, y: 820, u: 52, face: 1, pose: POSE.sit, t: s, eyes: 'happy', mouth: 'smile', blush: .8, outfit: 'day', light: LIGHT.warm });
    person(g, { who: 'he', x: 1230, y: 820, u: 54, face: -1, pose: POSE.sit, t: s, eyes: 'happy', mouth: 'smile', outfit: 'shirt', light: LIGHT.warm });
    glow(g, 960, 600, 700, '#FFE8C8', .3);
  });
  // 玻璃：雨滴、往下流的水痕、他的倒影
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(140,150,175,.45)'; g.fillRect(0, 0, W, H); g.restore();
  withAlpha(g, .3, () => bust(g, { who: 'he', x: 1500, y: 470, u: 150, eyes: 'half', mouth: 'n', outfit: 'coat', light: LIGHT.rain, t: s }));
  for (let i = 0; i < 120; i++) { const dx = hash(i, 1) * W, dy = hash(i, 2) * H, r = 3 + hash(i, 3) * 9; g.fillStyle = 'rgba(255,255,255,.25)'; ell(g, dx, dy, r * .8, r); g.fill(); g.fillStyle = 'rgba(255,255,255,.6)'; circ(g, dx - r * .25, dy - r * .3, r * .25); g.fill(); }
  for (let i = 0; i < 14; i++) { const dx = hash(i, 8) * W, y0 = ((s * 120 * (.5 + hash(i, 9))) + hash(i, 10) * H) % (H + 200) - 100; g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(dx, y0 - 140); g.quadraticCurveTo(dx + 6, y0 - 70, dx, y0); g.stroke(); }
  g.strokeStyle = '#2A2422'; g.lineWidth = 40; g.strokeRect(0, 0, W, H);
}
/* ---------- 第 68~69 小节：驻足希望你的身影会出现 ----------
   他停在路中间，周围的人和伞一阵阵涌过去（快放），只有他站着不动。一把粉色的伞走过——他回头，不是她。 */
function sStand(g, s, k) {
  rainStreet(g, s, 1400, { inside: true });
  g.fillStyle = 'rgba(120,130,150,.25)'; g.fillRect(0, 0, W, H);
  // 快放的人流（带残影）
  for (let i = 0; i < 16; i++) {
    const dir_ = i % 2 ? 1 : -1, sp = 700 + hash(i, 5) * 600;
    const x = ((hash(i, 6) * 2600 + dir_ * s * sp) % 2600 + 2600) % 2600 - 340;
    const y = 900 + hash(i, 7) * 160, sc = .7 + hash(i, 8) * .35;
    for (let j = 3; j >= 0; j--) withAlpha(g, j ? .12 : .75, () => walker(g, s, x - dir_ * j * 40, y, sc, '#3A4050', ['#2A2E3A', '#44506A', '#5A4A62', '#2E3A4E'][i % 4], s * 5 + i, dir_));
  }
  // 粉色的伞（陌生人）走过，回头
  const pu = seg(s, 173.6, 176.2);
  const turn = seg(s, 174.9, 175.2);
  if (pu > 0 && pu < 1) {
    const px = lerp(1700, 1200, E.out(pu));
    person(g, { who: 'stranger', x: px, y: 880, u: 44, face: turn > .5 ? 1 : -1, pose: turn > 0 ? POSE.stand : walkPose(s * 1.4, 0), t: s, eyes: 'open', mouth: 'n', outfit: 'coat', light: LIGHT.rain });
    umbrella(g, px - 20, 640, 150, '#F28CB0', 1, .05);
  }
  // 他：站着不动
  const look = seg(s, 174.6, 175.0), down = seg(s, 175.4, 176.0);
  person(g, { who: 'he', x: 820, y: 880, u: 48, face: 1, pose: { ...POSE.stand, head: lerp(lerp(0, -.1, look), .35, down) }, t: s, eyes: down > .5 ? 'half' : (look > .5 ? 'wide' : 'open'), mouth: 'n', outfit: 'coat', light: LIGHT.rain });
  clearUmbrella(g, 850, 610, 175, -.05);
  rain(g, s, 360, { col: 'rgba(225,232,245,.42)', sp: 1600, len: 50, ang: .08 });
}
/* ---------- 第 70 小节：还没说出口的抱歉 ----------
   雨打在手机屏幕上。他打出"对不起"，看了一会儿，又一个字一个字删掉。 */
function sSorry(g, s, k) {
  g.fillStyle = vgrad(g, 0, H, [[0, '#5E6678'], [1, '#3A4050']]); g.fillRect(0, 0, W, H);
  bokeh(g, s, 77, 40, ['#FFC27A', '#FFE0B0', '#AFC4E8'], { rmin: 30, rmax: 90, a: .25, vx: 5 });
  rain(g, s, 300, { col: 'rgba(225,232,245,.3)', sp: 1500, len: 60, ang: .08 });
  const typed = '对不起';
  const n1 = Math.floor(seg(s, 177.6, 178.5) * 3.99), n2 = Math.floor(seg(s, 178.9, 179.5) * 3.99);
  const input = typed.slice(0, Math.max(0, n1 - n2));
  phoneUI(g, s, 960, 470, 430, { name: '她', time: '15:47', msgs: [['her', '晚安', -99], ['me', '晚安', -99]], input, glowA: .3, rot: -.04 });   // 手机下沿在 y≈910，不压底部歌词
  // 输入框里的字放大写在旁边，看得清
  if (input) text(g, input, 1420, 420, 110, { k: 'sans', col: '#FFFFFF', glow: '#9FC4FF', gr: 26, alpha: .95 });
  // 屏幕上的雨滴
  for (let i = 0; i < 30; i++) { const dx = 790 + hash(i, 1) * 340, dy = 60 + hash(i, 2) * 820, r = 4 + hash(i, 3) * 8; g.fillStyle = 'rgba(255,255,255,.28)'; ell(g, dx, dy, r * .8, r); g.fill(); g.fillStyle = 'rgba(255,255,255,.65)'; circ(g, dx - r * .25, dy - r * .3, r * .25); g.fill(); }
  // 拇指
  g.fillStyle = '#F2CFB8'; rr(g, 1120 + Math.sin(s * 6) * 4, 820, 80, 150, 40); g.fill();
}
/* ---------- 第 71 小节：曾和你约定的诺言（回忆） ----------
   两只小拇指勾在一起。拍立得下面写着：约好了，一起去看日出。 */
function sPromise(g, s, k) {
  g.fillStyle = vgrad(g, 0, H, [[0, '#F4B98A'], [.6, '#E8907A'], [1, '#B8687A']]); g.fillRect(0, 0, W, H);
  glow(g, 960, 300, 800, '#FFE6C0', .3);
  for (const p of floaters(s, 91, 30, [0, 0, W, H], { vy: 10, amp: 10 })) { g.fillStyle = `rgba(255,240,210,${.2 + .4 * p.tw})`; circ(g, p.x, p.y, 2 + p.sz * 2); g.fill(); }
  const z = 1 + k * .03;
  g.save(); g.translate(W / 2, 470); g.scale(z, z);
  // 两只手：拳头 + 伸出来勾在一起的小拇指。左边她（粉袖口），右边他（浅蓝袖口）
  const hand = (sgn, sleeve, skin) => {
    g.save(); g.scale(sgn, 1);
    g.fillStyle = sleeve; rr(g, -820, -40, 480, 180, 70); g.fill();
    g.fillStyle = shade(sleeve, .85); rr(g, -380, -50, 60, 200, 26); g.fill();
    g.fillStyle = skin; rr(g, -340, -70, 230, 210, 90); g.fill();
    // 弯着的四根手指
    g.strokeStyle = shade(skin, .82); g.lineWidth = 6; g.lineCap = 'round';
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-150, -30 + i * 50); g.quadraticCurveTo(-110, -10 + i * 50, -150, 10 + i * 50); g.stroke(); }
    // 大拇指
    g.fillStyle = skin; rr(g, -300, -100, 150, 64, 32); g.fill();
    // 小拇指：伸出来，往上弯，勾住对方
    g.save(); g.translate(-130, 110); g.rotate(-.35);
    rr(g, -10, -26, 150, 50, 25); g.fill();
    g.restore();
    g.restore();
  };
  hand(1, '#F3B9C8', '#F6D7C3'); hand(-1, '#CFE0F4', '#F2CFB8');
  // 勾在一起的地方发光
  glow(g, 0, 70, 160, '#FFF2DA', .8 + .2 * Math.sin(s * 3));
  g.restore();
  // 拍立得一样的白边字条
  const cu = E.out(seg(k, .5, 1.3));
  g.save(); g.translate(960, 850); g.rotate(-.02); g.globalAlpha *= cu;
  g.fillStyle = 'rgba(0,0,0,.2)'; rr(g, -380 + 6, -60 + 8, 760, 120, 8); g.fill();
  g.fillStyle = '#FBF5E9'; rr(g, -380, -60, 760, 120, 8); g.fill();
  text(g, '约好了，一起去看日出', 0, 4, 60, { k: 'hand', col: '#6A3E3A' });
  g.restore();
}

/* ---------- 第 72~73 小节：抬头闭眼让泪流进心里面 ----------
   他把伞放下，仰起头，闭上眼。雨打在脸上——第 73 小节，雨停在了半空；接着一颗颗往上飘，变成星星，天黑了。 */
function sLookUp(g, s, k) {
  const frz = s >= bar(73) ? 1 : 0, up = seg(s, 185.3, 187.2);
  const night = E.io(seg(s, 185.0, 187.0));
  g.fillStyle = vgrad(g, 0, H, [[0, mixc('#7E899C', '#050722', night)], [1, mixc('#A6AFBE', '#1E1C50', night)]]); g.fillRect(0, 0, W, H);
  stars(g, s, 600, 0, night);
  bokeh(g, s, 79, 30, ['#FFC27A', '#AFC4E8'], { rmin: 40, rmax: 110, a: .18 * (1 - night), vx: 3 });
  // 他：大特写，侧脸仰着
  const tilt = E.io(seg(k, .2, 1.2));
  person(g, { who: 'he', x: 860, y: 1180, u: 150, face: 1, pose: { ...POSE.lookUp, head: lerp(0, -.75, tilt), tilt: lerp(0, -.15, tilt), aN: [.1, .1], aF: [-.1, .1] }, t: s, eyes: tilt > .4 ? 'closed' : 'half', mouth: 'n', tear: seg(s, 183.6, 184.6), outfit: 'coat', light: night > .5 ? LIGHT.night : LIGHT.rain });
  // 雨：停住 → 往上飘 → 变星星
  const ts = frz ? bar(73) : s;
  if (up <= 0) { rain(g, s, 420, { col: 'rgba(240,244,255,.7)', sp: frz ? 0 : 1400, len: frz ? 16 : 54, ang: .06, ts, lw: 2.2 }); if (frz) for (let i = 0; i < 160; i++) { const x = hash(i, 11) * W, y = hash(i, 12) * H; glow(g, x, y, 8, '#FFFFFF', .35); } }
  else {
    for (let i = 0; i < 260; i++) {
      const x = hash(i, 11) * W, y0 = hash(i, 12) * H, rise = E.in(clamp(up * 1.4 - hash(i, 13) * .4)) * (500 + hash(i, 14) * 600);
      const y = y0 - rise, a = .5 + .5 * clamp(up * 2);
      g.fillStyle = `rgba(230,236,255,${a})`; circ(g, x, y, 1.5 + up * 2); g.fill();
      if (up > .3) glow(g, x, y, 10 + up * 10, '#DDE6FF', a * .5);
    }
  }
}

/* ================= 最后一遍副歌：换他飞过去找她 ================= */
function leader(g, s, hand, col = PLUSH.orange) {
  const mx = hand[0] + 260 + Math.sin(s * 3) * 20, my = hand[1] - 40 + Math.cos(s * 2) * 20;
  redThread(g, s, [hand, [mx - 120, my + 10], [mx, my]], { w: 3 });
  redThread(g, s, [[mx, my], [mx + 300, my - 40], [mx + 700, my - 100], [W + 100, my - 160]], { w: 3 });
  pixelMon(g, mx, my, 4.5, col, 1);
}
function heFly(g, s, x, y, u, light, rot = 0) {
  const P = { ...POSE.fly, aN: [2.2, .1], aF: [2.6, .2] };
  person(g, { who: 'he', x, y, u, face: 1, rot, pose: P, t: s, eyes: 'open', mouth: 'n', brow: .3, wind: [-2.4, -.3], light });
  return handPos({ x, y, u, face: 1, rot, pose: P }, 'N');
}
function sForest3(g, s, k) {
  glowForest(g, s, 20000 + k * 1300, { deer: win(s, 187.6, 189.7, .3, .3), deerX0: 20000 + (187.6 - bar(74)) * 1300 });
  bigWord(g, s, 188.94, '森林', 1380, 330, 220, '#5FFFE0');
  leader(g, s, heFly(g, s, 640, 500 + Math.sin(s * 2) * 20, 34, LIGHT.forest));
  speedLines(g, s, 20, .2, '200,255,230');
}
function sSea3(g, s, k) {
  underwater(g, s, { whale: false });
  // 鲸鱼驮着他往上游
  const wy = 720 - k * 70;
  whale(g, 1000, wy, 1.6, s, 1);
  bigWord(g, s, 190.22, '海底', 520, 260, 220, '#7FE8FF');
  person(g, { who: 'he', x: 960, y: wy - 120, u: 34, face: 1, pose: { ...POSE.sit, aN: [1.9, .2], aF: [.5, .8] }, t: s, eyes: 'open', mouth: 'smile', wind: [-1, -1.4], light: LIGHT.sea });
  for (let i = 0; i < 16; i++) { const ph = (s * .9 + i / 16) % 1; bubble(g, 700 + hash(i, 3) * 700, H - ph * 1100, 8 + hash(i, 4) * 14, .9, s); }
}
/* 第 76~77 小节：沿着像素桥一路跑，身后太阳升起又落下 */
function sBridgeRun(g, s, k) {
  const u = lerp(.16, .9, seg(k, 0, 5));
  cloudSeaDay(g, s, u);
  bigWord(g, s, 193.74, '日出', 420, 260, 190, '#FFC88A', 1.0);
  bigWord(g, s, 194.68, '日落', 1500, 260, 190, '#FF8A6A', 1.2);
  // 像素桥：一道弧，从左下到右下
  const arc = v => [lerp(-100, W + 100, v), 900 - Math.sin(Math.PI * v) * 330];
  for (let i = 0; i < 60; i++) { const [x, y] = arc(i / 59); const col = i < 30 ? PLUSH.orange : PLUSH.pink; g.fillStyle = col; g.fillRect(x - 17, y - 10, 34, 14); g.fillStyle = mixc(col, '#FFFFFF', .3); g.fillRect(x - 17, y + 4, 34, 12); glow(g, x, y, 34, col, .25); }
  const v = lerp(.12, .72, seg(k, 0, 5)), [hx, hy] = arc(v);
  const ang = Math.atan2(arc(v + .01)[1] - hy, arc(v + .01)[0] - hx);
  person(g, { who: 'he', x: hx, y: hy - 118, u: 32, face: 1, rot: ang * .6, pose: walkPose(s * 2.6, 1), t: s, eyes: 'open', mouth: 'n', wind: [-1.5, 0], light: u < .5 ? LIGHT.day : LIGHT.sunset });
  pixelMon(g, hx + 200, hy - 190 + Math.sin(s * 4) * 10, 3.5, PLUSH.orange, 1);
}
function sGreenwich3(g, s, k) {
  g.save(); g.translate(-k * 220, 0);
  observatory(g, s, { x: 1180, y: 820, k: 1.45, ball: E.in(seg(s, 198.6, 199.0)), laser: 1 });
  g.restore();
  bigWord(g, s, 198.17, '格林威治', 470, 640, 120, '#7CFFA8', 1.3);
  leader(g, s, heFly(g, s, lerp(200, 1100, E.io(seg(k, 0, 1.6))), 420, 30, LIGHT.night, -.15));
}
/* 时间飞行：所有表盘的指针转着转着，停在 3:47 */
function sClock347(g, s, k) {
  const stop = E.io(seg(s, 200.0, 200.9));
  clockTunnel(g, lerp(s, 200.9, stop), k * .7 * (1 - stop) + .4);
  // 停下来以后，中间出现一个大表盘：03:47
  if (stop > 0) withAlpha(g, stop, () => {
    const cx = 960, cy = 470, r = 260;
    g.fillStyle = 'rgba(20,14,40,.6)'; circ(g, cx, cy, r * 1.05); g.fill();
    g.strokeStyle = '#F4E6C8'; g.lineWidth = 10; circ(g, cx, cy, r); g.stroke();
    g.fillStyle = '#F4E6C8'; g.font = F(48, 'serif'); g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let h = 0; h < 12; h++) { const a = h / 12 * TAU; g.save(); g.translate(cx + Math.sin(a) * r * .75, cy - Math.cos(a) * r * .75); g.rotate(a); g.fillText(ROMAN[h], 0, 0); g.restore(); }
    const ha = (3 + 47 / 60) / 12 * TAU, ma = 47 / 60 * TAU;
    line(g, cx, cy, cx + Math.sin(ha) * r * .5, cy - Math.cos(ha) * r * .5, '#F4E6C8', 14);
    line(g, cx, cy, cx + Math.sin(ma) * r * .78, cy - Math.cos(ma) * r * .78, '#F4E6C8', 8);
    glow(g, cx, cy, r * 1.6, '#FFE7C0', .4);
    text(g, '03:47', cx, cy + r + 70, 60, { k: 'sans', col: '#FFE9C8', glow: '#FFB870', gr: 24, ls: 8 });
  });
  bigWord(g, s, 199.67, '时间', 960, 140, 150, '#FFE0A8', 1.0);
  if (stop < 1) person(g, { who: 'he', x: 960, y: 640, u: 30, face: 1, rot: Math.sin(s * 2) * .1, pose: POSE.fly, t: s, eyes: 'open', mouth: 'n', wind: [-2, -.3], light: LIGHT.warm, alpha: 1 - stop });
}
/* 第 80~81 小节：我想见你，穿过教堂和人海，拥抱你 ----------
   人海往两边分开，她就站在中间，抱着粉色的小怪。他跑过去，抱住她。钟声、鸽子、花瓣，满天的星。 */
function sReunion(g, s, k) {
  const part = E.io(seg(s, 202.3, 203.6));
  const hug = seg(s, 205.0, 205.45), burst = seg(s, 205.4, 206.6);
  const spin = E.io(seg(s, 205.4, 206.9));
  const z = 1 + spin * .18;
  g.save(); g.translate(W / 2, H / 2); g.rotate(spin * .06); g.scale(z, z); g.translate(-W / 2, -H / 2 + spin * 60);
  plaza(g, s, { churchX: 960 });
  // 人群往两边让开
  const rows = [[690, .45, 34, 21], [740, .55, 30, 25], [800, .68, 24, 22], [870, .82, 18, 23]];
  g.save();
  for (const [y, kk, n, seed] of rows) {
    for (let i = 0; i < n; i++) {
      const x0 = ((hash(i, seed, 2) * (W + 200)) % (W + 200)) - 100, side = x0 < 960 ? -1 : 1;
      const x = x0 + side * part * (380 + 200 * kk) * (1 - Math.abs(x0 - 960) / 1200);
      const bob = Math.abs(Math.sin(s * 5 + i)) * 4 * kk;
      g.fillStyle = mixc(mixc('#2A2852', '#4A4678', hash(i, seed, 3) * .7), '#14122C', clamp(kk - .5));
      circ(g, x, y - 112 * kk - bob, 20 * kk); g.fill(); rr(g, x - 30 * kk, y - 92 * kk - bob, 60 * kk, 100 * kk, 22 * kk); g.fill();
    }
  }
  g.restore();
  // 她在中间等着；他从左边跑进来
  const run = E.io(seg(s, 203.2, 205.0));
  const hx = lerp(200, 905, run);
  const herP = hug > 0 ? lerpPose(POSE.stand, POSE.hug, hug) : { ...POSE.stand, aN: [.6, 1.4], aF: [.5, 1.5] };
  person(g, { who: 'she', x: 1010, y: 884, u: 40, face: -1, pose: herP, t: s, eyes: hug > .5 ? 'closed' : (s > 204.0 ? 'wide' : 'open'), mouth: 'smile', blush: .8, light: LIGHT.night, tear: hug > .5 ? 0 : seg(s, 204.2, 205.0) * .6 });
  if (hug < .5) plush(g, { x: 990, y: 790, s: 5, col: PLUSH.pink, eyes: 'glow', glow: .6 });
  person(g, { who: 'he', x: hx, y: 880, u: 41, face: 1, pose: hug > 0 ? lerpPose(walkPose(s * 2.4, 1), POSE.hug, hug) : walkPose(s * 2.4, 1), t: s, eyes: hug > .5 ? 'closed' : 'open', mouth: 'smile', light: LIGHT.night });
  g.restore();
  // 抱住：光、花瓣、鸽子
  if (burst > 0) {
    glow(g, 960, 720, 1200 * E.out(burst), '#FFE3F0', (1 - burst) * .8 + .2);
    for (let i = 0; i < 70; i++) { const a = hash(i, 5) * TAU, d = E.out(burst) * (200 + hash(i, 6) * 900); const px = 960 + Math.cos(a) * d, py = 720 + Math.sin(a) * d * .6 + burst * 160; g.save(); g.translate(px, py); g.rotate(s * 3 + i); g.fillStyle = rgba(i % 3 ? '#FFB3D1' : '#FFE9A8', 1 - burst * .6); ell(g, 0, 0, 12, 6); g.fill(); g.restore(); }
    for (let i = 0; i < 8; i++) dove(g, 960 + (hash(i, 7) - .5) * 400 + (hash(i, 8) - .5) * 1600 * burst, 640 - burst * 700 - hash(i, 9) * 200, .8 + burst, s + i, 1 - seg(burst, .8, 1));
  }
  bigWord(g, s, 204.47, '人海', 420, 220, 150, '#9FC8FF', 1.0);
  bigWord(g, s, 205.11, '拥抱你', 1440, 220, 170, '#FFB3D1', 1.6);
}

/* ================= 尾声：凌晨 3:47，两部手机同时亮起 ================= */
function sEpilogue(g, s, k) {
  g.fillStyle = '#05050F'; g.fillRect(0, 0, W, H);
  const send = SONG_DUR + 1.1, read = SONG_DUR + 1.9;
  const fadeIn = seg(k, 0, .4);
  withAlpha(g, fadeIn, () => {
    splitScreen(g, s, W / 2,
      gg => { hisBedroom(gg, s, {}); gg.fillStyle = 'rgba(4,4,16,.55)'; gg.fillRect(0, 0, W, H); },
      gg => { gg.drawImage(PROP.wallHer, 0, 0); gg.fillStyle = 'rgba(4,4,16,.55)'; gg.fillRect(0, 0, W, H); });
    // 他（左）、她（右）：躺着，脸被手机照亮
    const smile = seg(s, read, read + .4);
    bust(g, { who: 'he', x: 420, y: 560, u: 110, tiltH: -Math.PI / 2 + .1, eyes: smile > .5 ? 'happy' : 'open', mouth: smile > .5 ? 'smile' : 'n', light: { amb: '#7FA6E8', ambA: .4, lx: 1, ly: 0, rim: '#CFE0FF', rimA: .8, shadeA: .35 }, t: s });
    bust(g, { who: 'she', x: 1500, y: 560, u: 110, tiltH: Math.PI / 2 - .1, eyes: smile > .5 ? 'happy' : 'open', mouth: smile > .5 ? 'smile' : 'n', blush: smile, light: { amb: '#E8A6C8', ambA: .4, lx: -1, ly: 0, rim: '#FFE0EE', rimA: .8, shadeA: .35 }, t: s });
    const buzz = s > read - .3 && s < read + .3 ? Math.sin(s * 80) * 4 : 0;
    phoneUI(g, s, 720 + buzz, 600, 300, { name: '她', time: '03:47', msgs: [['me', '睡了吗？', send], ['her', '睡了吗？', read]], input: s < send ? '睡了吗？' : '', glowA: .45, rot: .06 });
    phoneUI(g, s, 1200 - buzz, 600, 300, { name: '他', time: '03:47', msgs: [['me', '睡了吗？', send], ['her', '睡了吗？', read]], input: s < send ? '睡了吗？' : '', glowA: .45, rot: -.06 });
    // 两条"睡了吗？"从手机里冒出来，飞过中线，落到对方的手机上
    const pop = seg(s, send - .25, send), fu = seg(s, send, read), land = seg(s, read, read + .5);
    for (const [x0, x1, col] of [[720, 1200, '#9DE07A'], [1200, 720, '#FFFFFF']]) {
      if (pop <= 0 || land >= 1) continue;
      const e = E.io(fu), px = lerp(x0, x1, e), py = 300 - Math.sin(Math.PI * e) * 120;
      const sc = E.back(pop) * (1 - land * .6);
      g.save(); g.translate(px, py); g.scale(sc, sc); g.globalAlpha *= 1 - land;
      glow(g, 0, 0, 160, '#FFE6F4', .5);
      g.fillStyle = col; rr(g, -150, -50, 300, 100, 30); g.fill();
      g.beginPath(); g.moveTo(x1 > x0 ? -110 : 110, 40); g.lineTo(x1 > x0 ? -140 : 140, 74); g.lineTo(x1 > x0 ? -70 : 70, 46); g.fill();
      text(g, '睡了吗？', 0, 2, 52, { k: 'sans', col: '#222' });
      g.restore();
    }
    if (fu > .42 && fu < .75) sparkleBurst(g, 960, 190, (fu - .42) / .33, '#FFE6F4', 14, 160);
    text(g, '03:47', 960, 110, 44, { k: 'sans', col: '#E8EEFF', ls: 10, alpha: .85 });
  });
  // 留给评论区的一句话
  const q = seg(s, read + .5, read + 1.0);
  if (q > 0) { g.fillStyle = `rgba(4,4,16,${q * .5})`; g.fillRect(0, 0, W, H); text(g, '你失眠的时候，在想谁？', 960, 540, 96, { k: 'kai', col: '#FFFFFF', alpha: E.out(q), glow: '#FFB8DA', gr: 40, ls: 6 }); }
}
/* 片尾卡（2.5 秒）：夜空、像素桥、片名、出处、甜菜 出品 */
function sEndCard(g, s, k) {
  skyGrad(g, SKY.deep); stars(g, s, 3000, 0, 1); milkyWay(g, 960, 300, 2400, -.2, .5);
  const arc = v => [lerp(260, 1660, v), 700 - Math.sin(Math.PI * v) * 260];
  for (let i = 0; i < 40; i++) { const [x, y] = arc(i / 39); const col = i < 20 ? PLUSH.orange : PLUSH.pink; g.fillStyle = col; g.fillRect(x - 12, y - 7, 24, 12); glow(g, x, y, 26, col, .25); }
  pixelMon(g, 940, 440 + Math.sin(s * 3) * 4, 3, PLUSH.orange, 1); pixelMon(g, 990, 440 + Math.sin(s * 3 + 1) * 4, 3, PLUSH.pink, 1);
  const a = E.out(seg(k, 0, .4));
  text(g, '你失眠的时候，在想谁？', 960, 150, 64, { k: 'kai', col: '#FFFFFF', alpha: a, glow: '#FFB8DA', gr: 30, ls: 4 });
  text(g, '失眠飞行', 960, 800, 80, { k: 'kai', col: '#FFFFFF', alpha: a, glow: '#9FB4FF', gr: 26, ls: 24 });
  text(g, '歌曲：《失眠飞行》 接个吻，开一枪 / 沈以诚 / 薛黛霏', 960, 880, 30, { k: 'kai', col: '#CFCBEF', alpha: a * .9, ls: 2 });
  text(g, '画面、动画、音效：Claude 用代码生成', 960, 930, 28, { k: 'kai', col: '#B8B4DA', alpha: a * .85, ls: 2 });
  text(g, '甜菜 出品', 960, 1000, 40, { k: 'kai', col: '#FFE2B0', alpha: a, glow: '#FFB870', gr: 16, ls: 10 });
}

SCENES_DEF.push(() => {
  scene('cafe', bar(66), sCafe, { tr: { type: 'fade', dur: 1.0 }, bloom: .3 });
  scene('cafewin', bar(67), sCafeWindow, { tr: { type: 'blur', dur: .5 }, bloom: .4 });
  scene('stand', bar(68), sStand, { tr: { type: 'fade', dur: .5 }, bloom: .3 });
  scene('sorry', bar(70), sSorry, { tr: { type: 'blur', dur: .5 }, bloom: .35 });
  scene('promise', bar(71), sPromise, { tr: { type: 'fade', dur: .5 }, bloom: .3, grade: 'sepia(.15) saturate(1.05) brightness(.94)' });
  scene('lookup', bar(72), sLookUp, { tr: { type: 'leak', dur: .6 }, bloom: s => .3 + .3 * seg(s, 185, 187) });
  scene('forest3', bar(74), sForest3, { tr: { type: 'flash', dur: .6 }, bloom: .6 });
  scene('sea3', 189.55, sSea3, { tr: { type: 'ripple', dur: .4 }, bloom: .55 });
  scene('bridgerun', bar(76), sBridgeRun, { tr: { type: 'whipV', dur: .45, dir: -1 }, bloom: s => .5 - .3 * Math.sin(Math.PI * seg(s, 192.6, 196.5)) });
  scene('greenwich3', bar(78), sGreenwich3, { tr: { type: 'cloud', dur: .6, pal: CLOUD.dusk }, bloom: .5 });
  scene('clock347', 199.0, sClock347, { tr: { type: 'zoom', dur: .5, cx: 1100, cy: 420, zoom: 3 }, bloom: .55 });
  scene('reunion', bar(80), sReunion, { tr: { type: 'flash', dur: .5 }, bloom: s => .5 + .2 * seg(s, 205.4, 206) });
  scene('epilogue', SONG_DUR, sEpilogue, { tr: { type: 'black', dur: .5, pre: .1 }, bloom: .4 });
  scene('endcard', SONG_DUR + EPI, sEndCard, { tr: { type: 'fade', dur: .5 }, bloom: .5 });
});
