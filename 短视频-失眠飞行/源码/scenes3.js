'use strict';
/* scenes3.js：第一遍副歌（她的梦：和他一起飞）和间奏。第 18~34 小节。
   森林 → 海底 → 云海上的日出日落 → 格林威治 → 钟表隧道（手松开了）→ 教堂 → 人海里抱住他 → 他化成光点 →
   一个人飘在星空里 → 天亮了，回到床上 → 又到了 03:07。 */

/* 两个人手拉手地飞：她在前（近），他在后上方，握住她往后伸的那只手 */
function couple(g, s, x, y, u, o = {}) {
  const sheP = o.sheP || { ...POSE.fly, aF: [-1.05, .05], aN: [2.5, .15] };
  const heP = o.heP || { ...POSE.fly, aN: [2.05, .1], aF: [2.6, .2], tilt: 1.15 };
  const sO = { who: 'she', x, y, u, face: o.face ?? 1, pose: sheP, t: s, eyes: o.sheEyes || 'happy', mouth: 'smile', blush: .7, wind: o.wind || [-2, -.3], light: o.light || LIGHT.dream, rot: o.rot || 0 };
  const hO = { who: 'he', u, face: o.face ?? 1, pose: heP, t: s, eyes: o.heEyes || 'happy', mouth: 'smile', blush: .4, wind: o.wind || [-2, -.3], light: o.light || LIGHT.dream, rot: o.rot || 0, alpha: o.heA ?? 1 };
  const hand = handPos(sO, 'F'), hh = handPos({ ...hO, x: 0, y: 0 }, 'N');
  hO.x = hand[0] - hh[0] + (o.apart || 0) * -1; hO.y = hand[1] - hh[1] - (o.apart || 0) * .4;
  if (o.heA !== 0) person(g, hO);
  person(g, sO);
  if (!o.apart) glow(g, hand[0], hand[1], 40, '#FFE6F4', .8);
  return { hand, he: [hO.x, hO.y] };
}
/* 副歌里的大字：毛笔字，在背景里亮一下就散 */
function bigWord(g, s, t0, str, x, y, px, col, dur = 1.1) {
  const u = seg(s, t0 - .05, t0 + dur); if (u <= 0 || u >= 1) return;
  const a = Math.min(1, u * 6) * (1 - E.in(seg(u, .55, 1)));
  g.save();
  if (u > .55) g.filter = `blur(${((u - .55) * 18).toFixed(1)}px)`;
  text(g, str, x, y - u * 30, px, { k: 'brush', col: rgba('#FFFFFF', .9), alpha: a * .85, glow: col, gr: px * .4, ga: .8, sc: .9 + E.out(Math.min(1, u * 3)) * .1, ls: px * .05 });
  g.restore();
}

/* ---------- 第 18 小节：一起闯进森林 ---------- */
function sForest(g, s, k) {
  const cx = k * 900;
  glowForest(g, s, cx, { deer: win(s, 46.3, 48.4, .4, .3), deerX0: (46.3 - bar(18)) * 900 });
  bigWord(g, s, 47.46, '森林', 1380, 330, 220, '#5FFFE0');
  const y = 520 + Math.sin(s * 2) * 30 - E.in(seg(k, 1.9, 2.4)) * -260;
  couple(g, s, 820 + Math.sin(s * 1.3) * 40, y, 32, { light: LIGHT.forest, rot: seg(k, 1.9, 2.4) * .5 });
  // 萤火虫绕着他们转
  for (let i = 0; i < 18; i++) { const a = s * 2.2 + i / 18 * TAU, r = 160 + Math.sin(s * 3 + i) * 40; const fx = 820 + Math.cos(a) * r * 1.4, fy = 470 + Math.sin(a) * r * .5; glow(g, fx, fy, 18, '#C8FF8A', .8); g.fillStyle = '#F2FFD8'; circ(g, fx, fy, 2.5); g.fill(); }
}
/* ---------- 潜入海底（48.0 秒起） ---------- */
function sSea(g, s, k) {
  underwater(g, s, { whaleX: 1500 - k * 160, whaleY: 640, whaleK: 1.25 });
  bigWord(g, s, 48.72, '海底', 560, 300, 220, '#7FE8FF');
  const y = 470 + Math.sin(s * 1.5) * 24;
  const sw = { ...POSE.fly, tilt: 1.05, head: -.6, aN: [2.3, .4 + Math.sin(s * 3) * .2], lN: [-.05 + Math.sin(s * 4) * .25, -.4], lF: [-.25 - Math.sin(s * 4) * .25, -.5] };
  couple(g, s, 900 + k * 60, y, 32, { light: LIGHT.sea, wind: [-1.2, -1.2], sheP: { ...sw, aF: [-1.05, .05] }, heP: { ...sw, aN: [2.05, .1], tilt: .95 } });
  // 他们吐出的泡泡
  for (let i = 0; i < 10; i++) { const ph = (s * .8 + i / 10) % 1; bubble(g, 960 + k * 60 + Math.sin(i + s * 2) * 30, y - 40 - ph * 400, 6 + hash(i, 3) * 8, 1 - ph, s); }
  // 一进水时的白浪
  const sp = seg(k, 0, .5);
  if (sp < 1) { g.fillStyle = `rgba(230,250,255,${(1 - sp) * .8})`; g.fillRect(0, 0, W, H); for (let i = 0; i < 30; i++) bubble(g, hash(i, 8) * W, H - sp * 1400 * (.6 + hash(i, 9) * .6), 10 + hash(i, 10) * 40, 1 - sp, s); }
}

/* ---------- 第 20~21 小节：一起看日出到日落天气 ----------
   两个人坐在云边上。太阳从左边升起来（日出），划过头顶，从右边落下去（日落），天黑了。 */
function sSunDay(g, s, k) {
  const u = s < 52.28 ? lerp(.04, .26, seg(s, bar(20) - .2, 52.28)) : s < 53.53 ? lerp(.26, .78, seg(s, 52.28, 53.53)) : lerp(.78, 1, seg(s, 53.53, 55.4));
  const { sx, sy } = cloudSeaDay(g, s, u);
  bigWord(g, s, 52.28, '日出', 420, 330, 200, '#FFC88A', 1.0);
  bigWord(g, s, 53.21, '日落', 1500, 330, 200, '#FF8A6A', 1.2);
  // 他们坐的那朵云
  const d = dayAt(u);
  cloud(g, 4, 960, 820, 1100, d.palA, 1); if (d.f > 0) cloud(g, 4, 960, 820, 1100, d.palB, d.f);
  const dark = Math.min(seg(u, .3, .4), 1 - seg(u, .7, .8)) > 0 ? 0 : 1;
  const L = u < .3 || u > .72 ? { ...LIGHT.sunset, lx: sx < 960 ? -.9 : .9 } : LIGHT.day;
  person(g, { who: 'he', x: 1010, y: 730, u: 34, face: 1, pose: { ...POSE.sit, head: -.1, aF: [.6, 1.2] }, t: s, eyes: 'open', mouth: 'smile', light: L });
  person(g, { who: 'she', x: 905, y: 734, u: 33, face: 1, pose: { ...POSE.sit, tilt: .12, head: .2, aN: [.9, 1.0] }, t: s, eyes: u > .5 ? 'happy' : 'open', mouth: 'smile', blush: .6, light: L });
  // 时间飞快：云影掠过
  g.save(); g.globalCompositeOperation = 'lighter';
  g.fillStyle = `rgba(255,240,220,${.05 * (1 - dark)})`; g.fillRect(0, 0, W, H);
  g.restore();
}

/* ---------- 第 22 小节：穿过格林威治 ---------- */
function sGreenwich(g, s, k) {
  const pan = E.io(seg(k, 0, 2.4));
  g.save(); g.translate(-pan * 200, pan * 20);
  observatory(g, s, { x: 1180, y: 820, k: 1.45, ball: E.in(seg(s, 57.5, 57.9)), laser: .6 + .4 * seg(k, .2, .8) });
  g.restore();
  // 标签：GREENWICH 0°
  const la = win(s, 56.4, 58.3, .3, .3);
  text(g, 'GREENWICH', 1480 - pan * 200, 560, 40, { k: 'serif', col: '#D8FFE4', alpha: la, glow: '#5AFF8C', gr: 22, ls: 10 });
  text(g, '0° 00′ 00″', 1480 - pan * 200, 612, 30, { k: 'serif', col: '#D8FFE4', alpha: la * .9, ls: 6 });
  bigWord(g, s, 56.64, '格林威治', 470, 640, 120, '#7CFFA8', 1.4);
  couple(g, s, lerp(200, 1250, E.io(seg(k, 0, 2.3))), 430 - Math.sin(Math.PI * seg(k, 0, 2.3)) * 80, 28, { light: LIGHT.night });
}
/* ---------- 时间飞行（58.1 秒起）：钟表隧道，他的手松开了 ---------- */
function sClocks(g, s, k) {
  clockTunnel(g, s, k * .7);
  bigWord(g, s, 58.21, '时间', 960, 220, 180, '#FFE0A8', 1.1);
  const ap = E.in(seg(s, 59.3, 60.6));
  const res = couple(g, s, 960 - ap * 120, 600 + Math.sin(s * 3) * 12, 30 * (1 - ap * .2), { light: LIGHT.warm, apart: ap * 160, heA: 1 - ap, sheEyes: ap > .2 ? 'wide' : 'happy', heEyes: ap > .2 ? 'wide' : 'happy', rot: Math.sin(s * 2) * .05 });
  if (ap > 0) glow(g, 960, 540, 300 * ap, '#FFF0D8', ap * .6);
}

/* ---------- 第 24 小节：我想见你 穿过教堂 ---------- */
function sChurch(g, s, k) {
  cathedral(g, s, k * 2.6);
  bigWord(g, s, 61.99, '教堂', 960, 160, 160, '#C9A2FF', 1.0);
  // 鸽子迎面飞过
  for (let i = 0; i < 9; i++) { const u = seg(k, .2 + i * .1, 1.3 + i * .1); if (u <= 0 || u >= 1) continue; const e = E.in(u); dove(g, 960 + (hash(i, 1) - .5) * 400 + (hash(i, 2) - .5) * 1800 * e, 470 + (hash(i, 3) - .7) * 200 - e * 500, .3 + e * 2.4, s + i, Math.min(1, u * 4)); }
  person(g, { who: 'she', x: 960, y: 640 + Math.sin(s * 2) * 14, u: 34, face: 1, rot: -.15, pose: { ...POSE.fly, tilt: 1.1, head: -.55, aN: [2.6, .1], aF: [2.3, .2] }, t: s, eyes: 'open', mouth: 'n', blush: .5, wind: [-2, -.2], light: { ...LIGHT.dream, lx: 0, ly: -1 } });
}
/* ---------- 和人海：在人群里找到他，抱住 ---------- */
const meetG = s => E.io(seg(s, 62.6, 63.7));
function sCrowd(g, s, k) {
  const hug = seg(s, 63.55, 63.95), burst = seg(s, 64.2, 65.0), fade = seg(s, 64.6, 65.85);
  const stop = Math.max(burst, 0) > 0 ? 1 : 0;
  const ts = stop ? 64.2 : s;          // 抱住的那一刻，人群停下来
  plaza(g, s, { churchX: 960 });
  withAlpha(g, 1 - fade * .8, () => crowdRows(g, ts, [[690, .45, 34, 1], [740, .55, 30, 5], [800, .68, 24, 2], [870, .82, 18, 3]], { gap: [960, 200 * (1 - meetG(s))] }));
  // 两个人从两边挤过来
  const meet = E.io(seg(s, 62.6, 63.7));
  const sx = lerp(520, 900, meet), hx = lerp(1420, 1010, meet);
  const walk = meet < 1 ? walkPose(s * 2.2, .7) : POSE.hug;
  const heA = 1 - E.in(seg(s, 64.5, 65.6));
  if (heA > 0) person(g, { who: 'he', x: hx, y: 880, u: 40, face: -1, pose: hug > 0 ? lerpPose(walk, POSE.hug, hug) : walk, t: s, eyes: hug > .5 ? 'closed' : 'open', mouth: 'smile', light: LIGHT.night, alpha: heA });
  person(g, { who: 'she', x: sx, y: 884, u: 38, face: 1, pose: hug > 0 ? lerpPose(walk, POSE.hug, hug) : walk, t: s, eyes: hug > .5 ? (fade > .6 ? 'open' : 'closed') : 'open', mouth: fade > .6 ? 'sad' : 'smile', blush: .7, light: LIGHT.night });
  withAlpha(g, 1 - fade * .8, () => crowdRows(g, ts, [[980, 1.0, 12, 6], [1080, 1.25, 9, 4]], { gap: [960, 320] }));
  // 抱住的一瞬间：光和花瓣
  if (burst > 0) {
    glow(g, 960, 760, 900 * E.out(burst), '#FFE3F0', (1 - burst) * .9);
    for (let i = 0; i < 40; i++) { const a = hash(i, 5) * TAU, d = E.out(burst) * (200 + hash(i, 6) * 700); const px = 960 + Math.cos(a) * d, py = 760 + Math.sin(a) * d * .6 + burst * 120; g.save(); g.translate(px, py); g.rotate(s * 3 + i); g.fillStyle = rgba(i % 2 ? '#FFB3D1' : '#FFE0EC', 1 - burst * .7); ell(g, 0, 0, 10, 5); g.fill(); g.restore(); }
  }
  // 他化成光点往上飘
  if (fade > 0) for (let i = 0; i < 60; i++) { const ph = (fade * 1.2 + hash(i, 8) * .4); if (ph > 1.4) continue; const px = 1010 + (hash(i, 9) - .5) * 120 + Math.sin(s * 2 + i) * 20 * ph, py = 760 - ph * 500 + hash(i, 10) * 140; glow(g, px, py, 12, '#FFE6F4', (1 - ph / 1.4) * .9); g.fillStyle = rgba('#FFFFFF', (1 - ph / 1.4)); circ(g, px, py, 2); g.fill(); }
  bigWord(g, s, 62.99, '人海', 520, 240, 150, '#9FC8FF', 1.0);
  bigWord(g, s, 63.63, '拥抱你', 1380, 230, 150, '#FFB3D1', 1.4);
}

/* ---------- 间奏（第 26~30 小节）：一个人飘在星空里 ----------
   他化成的光点升到天上，连成一个心形的星座。粉色的小怪变回像素的样子，绕着她飞。 */
const HEART_PTS = (() => { const p = []; for (let i = 0; i < 14; i++) { const t = i / 14 * TAU; p.push([16 * Math.pow(Math.sin(t), 3), -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]); } return p; })();
function sStars(g, s, k) {
  const rise = E.io(seg(k, 0, 10));
  const zc = 1 + E.io(seg(k, 0, 10)) * .12;          // 慢慢推近、往右上移
  g.save(); g.translate(W / 2, H / 2); g.scale(zc, zc); g.translate(-W / 2 - rise * 80, -H / 2 + rise * 30);
  g.save(); g.translate(0, rise * 90);
  skyGrad(g, [[0, '#050620'], [.6, '#120F3E'], [1, '#2A1F5A']]);
  stars(g, s, 1700, -80 - rise * 90, 1);
  milkyWay(g, 960, 380, 2600, -.5, .95);
  // 心形星座：一颗一颗亮起来，再连上线
  const cx = 1240, cy = 300, sc = 14;
  HEART_PTS.forEach(([x, y], i) => {
    const on = seg(k, .4 + i * .18, .8 + i * .18);
    if (on <= 0) return;
    const px = cx + x * sc, py = cy + y * sc;
    glow(g, px, py, 40, '#FFD6EA', on); g.fillStyle = '#FFFFFF'; circ(g, px, py, 3.5); g.fill();
    const nx = HEART_PTS[(i + 1) % 14], ln = seg(k, 1.0 + i * .18, 1.4 + i * .18);
    if (ln > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(255,214,234,${.55 * ln})`; g.lineWidth = 2; g.beginPath(); g.moveTo(px, py); g.lineTo(lerp(px, cx + nx[0] * sc, ln), lerp(py, cy + nx[1] * sc, ln)); g.stroke(); g.restore(); }
  });
  // 每两小节一颗流星
  for (let j = 0; j < 4; j++) shootingStar(g, s, bar(26 + j) + .1, 200 + j * 350, 60 + (j % 2) * 80, .5, 300, .9);
  g.restore();
  // 云海
  for (let i = 0; i < 6; i++) { const w = 1000 + hash(i, 3) * 400; cloud(g, i, ((i * 420 - s * 18) % (W + w) + W + w) % (W + w) - w / 2, 960 + hash(i, 4) * 60 - rise * 40, w, CLOUD.dream, .9); }
  // 她：飘着，朝星座伸手
  const reach = E.io(seg(k, 2.5, 3.5));
  person(g, { who: 'she', x: 700, y: 640 + Math.sin(s * 1.4) * 16, u: 40, face: 1, rot: -.1, pose: { ...POSE.float, aN: [lerp(.9, 2.55, reach), .1], head: lerp(-.1, -.45, reach) }, t: s, eyes: 'open', mouth: 'n', blush: .5, wind: [-.6, -.6], light: LIGHT.dream });
  // 像素小怪先绕着她飞；第 28 小节飞去把星座点亮一遍，再飞回来
  const go = seg(s, bar(28), bar(28) + 2.2), back = seg(s, bar(29), bar(29) + 1.6);
  const a = s * 1.6, ox = 700 + Math.cos(a) * 260, oy = 520 + Math.sin(a) * 90;
  let px = ox, py = oy;
  if (go > 0 && back < 1) {
    const hp = HEART_PTS[Math.floor(clamp(go) * 13.99)], hx = 1240 + hp[0] * 14, hy = 300 + hp[1] * 14;
    const f = go < 1 ? E.io(Math.min(1, go * 3)) : 1 - E.io(back);
    px = lerp(ox, hx, f); py = lerp(oy, hy, f);
    if (go < 1) sparkleBurst(g, hx, hy, (go * 14) % 1, '#FFE6F4', 6, 40);
  }
  for (let j = 1; j < 10; j++) { const b = a - j * .09; glow(g, (go > 0 && back < 1) ? px - j * 10 : 700 + Math.cos(b) * 260, (go > 0 && back < 1) ? py : 520 + Math.sin(b) * 90, 10, '#FFB3D1', .6 - j * .06); }
  pixelMon(g, px, py, 4, PLUSH.pink, 1);
  g.restore();
}
/* ---------- 间奏（第 30~34 小节）：天亮了 ----------
   星星淡下去，天边粉了。她穿过云往下落，回到自己的床上，终于睡着了（05:47）。
   太阳升起来，又落下去；第二天夜里，钟又停在 03:07——她睁开了眼睛。 */
function sDawn(g, s, k) {
  const room = seg(k, 4.4, 5.0);
  if (room < 1) {
    const d = E.io(seg(k, 0, 4.6));
    skyGrad(g, [[0, mixc('#0B0F33', '#3A4C8E', d)], [.6, mixc('#1E1A50', '#E8A2B0', d)], [1, mixc('#3A2A6A', '#FFD3A8', d)]]);
    stars(g, s, 1800, 0, 1 - d);
    glow(g, 960, 1000, 900, '#FFC8A0', d * .6);
    // 往下落：云从下往上掠过
    for (let i = 0; i < 10; i++) { const w = 900 + hash(i, 8) * 500, y = H + 300 - ((k * (260 + hash(i, 9) * 200) + hash(i, 10) * 1500) % (H + 700)); cloud(g, i, hash(i, 11) * W, y, w, d > .5 ? CLOUD.dawn : CLOUD.dream, .85); }
    person(g, { who: 'she', x: 960, y: 520 + Math.sin(s) * 10, u: 40, face: 1, rot: .2, pose: { ...POSE.float, aN: [.5, .3], aF: [-.3, .3], lN: [.4, -.9], lF: [.1, -.6] }, t: s, eyes: 'half', mouth: 'smile', blush: .5, wind: [.2, -1.6], light: { ...LIGHT.dawn || LIGHT.warm, amb: '#FFC8B8', ambA: .2 } });
    pixelMon(g, 1120 + Math.sin(s * 2) * 20, 420, 3.5, PLUSH.pink, 1);
  }
  if (room > 0) withAlpha(g, room, () => dawnRoom(g, s, k));
}
function dawnRoom(g, s, k) {
  // 她的卧室：早上（05:47）→ 白天 → 又到夜里（03:07），她睁开眼
  const day = E.io(seg(k, 5.0, 7.4)), night = E.io(seg(k, 7.6, 9.2));
  const T = 99;
  g.save(); g.translate(W / 2, H / 2); g.scale(1.25, 1.25); g.translate(-760, -600);
  herRoom(g, s, { T, open: 0, wind: 0, float: 0, sit: 0, lift: 0, beam: .5, plush: night > .9 ? .6 : 0, eyes: night > .95 ? 'open' : 'closed', mouth: night > .95 ? 'n' : 'smile', clock: night > .5 ? '03:07' : '05:47' });
  g.restore();
  // 天色：清晨的粉 → 白天的亮 → 夜里的蓝
  const tint = night > 0 ? 0 : day;
  g.save(); g.globalCompositeOperation = 'screen';
  g.fillStyle = `rgba(255,190,170,${.35 * (1 - day) * (1 - night)})`; g.fillRect(0, 0, W, H);
  g.fillStyle = `rgba(255,245,225,${.4 * tint})`; g.fillRect(0, 0, W, H);
  g.restore();
}

SCENES_DEF.push(() => {
  scene('forest', bar(18), sForest, { tr: { type: 'flash', dur: .5 }, bloom: .6 });
  scene('sea', 48.0, sSea, { tr: { type: 'cut', dur: .01 }, bloom: .55 });
  scene('sunday', bar(20), sSunDay, { tr: { type: 'whipV', dur: .45, dir: -1 }, bloom: s => .5 - .3 * Math.sin(Math.PI * seg(s, 51.8, 54.0)) });
  scene('greenwich', bar(22), sGreenwich, { tr: { type: 'cloud', dur: .6, pal: CLOUD.dusk }, bloom: .5 });
  scene('clocks', 58.1, sClocks, { tr: { type: 'zoom', dur: .6, cx: 1240, cy: 470, zoom: 3 }, bloom: .55 });
  scene('church', bar(24), sChurch, { tr: { type: 'flash', dur: .5 }, bloom: .55 });
  scene('crowd', 62.45, sCrowd, { tr: { type: 'zoom', dur: .5, cx: 960, cy: 410, zoom: 3 }, bloom: .5 });
  scene('stars', bar(26), sStars, { tr: { type: 'blur', dur: .8 }, bloom: .6 });
  scene('dawn', bar(30), sDawn, { tr: { type: 'fade', dur: 1.0 }, bloom: .5 });
});
