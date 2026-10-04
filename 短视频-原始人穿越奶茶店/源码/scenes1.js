'use strict';
/* scenes1.js：钩子、野外、穿越、奶茶店、做奶茶 */

/* ---------- 关键时刻（都从配音时间轴推出来） ---------- */
const T = {};
T.boom = MK('h1') + .2;                       // 第一口下去：爆炸
T.zoom = S('h2') - .12;                       // 镜头钻进脑袋
T.same = S('h3') - .14;                       // 同款
T.wild = S('p1') - .5;                        // 倒回一万年前
T.dusk = S('p3');                             // 变天
T.bolt = S('p3') + (EN('p3') - S('p3')) * .64; // 劈下闪电
T.shop = T.bolt + 1.3;                        // 从传送门掉进奶茶店
T.cup = S('p6') - .2;                         // 做奶茶
T.past = S('p9') - .55;                       // 远古的甜
T.rule = S('p15') - .45;                      // 铁律
T.combo = S('p21') - .5;                      // 回到奶茶店
T.egg = S('p27') - .5;                        // 假蛋
T.you = S('p30') - .5;                        // 换成你
T.fix = S('p34') - .5;                        // 怎么办
T.end = S('p39') - .5;                        // 通知
T.order = S('c3') - .25;                      // 三分糖
T.card = EN('k2') + .3;                       // 片尾卡

function club(g, x, y, ang, s = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  g.beginPath(); g.moveTo(-9, 24); g.lineTo(9, 24); g.lineTo(30, -150); g.quadraticCurveTo(0, -200, -30, -150); g.closePath(); fs(g, '#A8743F', INK, 6);
  g.fillStyle = 'rgba(80,45,15,.45)'; for (const [a, b] of [[-10, -120], [12, -90], [-4, -50], [14, -150]]) { ell(g, a, b, 7, 5); g.fill(); }
  g.restore();
}
function questionMark(g, x, y, a, s = 1) { withAlpha(g, a, () => { g.save(); g.translate(x, y); g.scale(s, s); rich(g, '？', 0, 0, 120, { font: 'fun', col: '#FFFFFF', stroke: 16 }); g.restore(); }); }
function dazedStars(g, x, y, t, a) { withAlpha(g, a, () => { for (let i = 0; i < 4; i++) { const ang = t * 6 + i * TAU / 4; star(g, x + Math.cos(ang) * 90, y + Math.sin(ang) * 26, 20, 9); fs(g, YEL, INK, 4); } }); }

/* ================= 钩子 ================= */
const HOOK_PARTS = (() => { const r = R(41); return Array.from({ length: 30 }, (_, i) => ({ a: r() * TAU, v: 500 + r() * 900, k: i % 3, rot: r() * 6, sp: (r() - .5) * 10 })); })();
function hookSip(g, t) {
  const tb = T.boom, boomed = t >= tb;
  const zu = E.in(seg(t, T.zoom, T.zoom + .42));
  const HX = 400, HY = 760, sc = 2.1;
  g.save();
  if (zu > 0) { const z = 1 + zu * 6; g.translate(HX, HY); g.scale(z, z); g.translate(-HX, -HY); }
  const [sx, sy] = shake(t, tb, 30, .8);
  g.translate(sx, sy);
  if (!boomed) {
    shopBack(g, t, { menu: true });
    g.fillStyle = 'rgba(255,214,226,.55)'; g.fillRect(-400, -400, W + 800, H + 800);
    for (let i = 0; i < 14; i++) { const x = hash(i, 3) * W, y = 200 + hash(i, 4) * 1100, r = 40 + hash(i, 5) * 90; g.fillStyle = `rgba(255,255,255,${.18 + .2 * hash(i, 6)})`; circ(g, x, y, r); g.fill(); }
  } else {
    burst(g, HX, HY, t, '#FFE066', '#FF9BB8', 20);
    speedLines(g, HX, HY, t, clamp(1.4 - (t - tb)), 'rgba(255,255,255,.85)');
  }
  const u = t - tb, up = boomed ? E.el(clamp(u / .7)) : 0;
  const prog = seg(t, .05, tb - .05);
  const cupL = [(780 - HX) / sc, (1330 - (HY + 246 * sc)) / sc];
  person(g, {
    x: HX, y: HY + 246 * sc, s: sc, t, outfit: 'cave', legs: 'none', ph: 1,
    eyes: boomed ? 'star' : 'cross', mouth: boomed ? 'grin' : 'sip', brow: boomed ? 'up' : 'normal',
    hairUp: up, blush: boomed ? 1 : .3 * prog, headRot: boomed ? -.08 + Math.sin(t * 30) * .03 * clamp(1 - u) : .1, headDX: boomed ? 0 : 10,
    xray: zu > 0 ? clamp(zu * 3) : 0, brainO: { eyes: 'wide', mouth: 'shout', siren: 1 },
    arms: boomed ? { l: [-170, -330 + Math.sin(t * 22) * 20], r: [cupL[0] - 60, cupL[1] - 120] } : { l: [cupL[0] - 70, cupL[1] - 40], r: [cupL[0] - 50, cupL[1] - 150] },
    front: gg => teaCup(gg, { x: cupL[0], y: cupL[1], s: 1.2 / sc, t, fill: .78 - .05 * prog, pearls: 24, foam: 0, lid: 1, straw: boomed ? 1 : 0, slosh: boomed ? 3 : 1 }),
    top: gg => {
      if (!boomed) {
        const x0 = cupL[0] + 46 * 1.2 / sc, y0 = cupL[1] - 340 * 1.2 / sc;
        strawTube(gg, x0, y0, 16, -212, prog, t, 1.15 / sc);
      }
    },
  });
  if (boomed) {
    for (const p of HOOK_PARTS) {
      const d = p.v * E.out(clamp(u / 1.4)), x = HX + Math.cos(p.a) * d, y = HY + Math.sin(p.a) * d;
      const al = clamp(1.6 - u);
      withAlpha(g, al, () => {
        if (p.k === 0) sugarCube(g, x, y, .7, p.rot + u * p.sp);
        else if (p.k === 1) { heart(g, x, y, 26); fs(g, HOT, INK, 4); }
        else { star(g, x, y, 26, 11, 5, p.rot + u * p.sp); fs(g, '#FFFFFF', INK, 4); }
      });
    }
    const sp = pop(t, tb + .02, .3);
    g.save(); g.translate(790, 600); g.rotate(.14 + Math.sin(t * 20) * .03 * clamp(1 - u)); g.scale(sp, sp);
    rich(g, '甜！！！', 0, 0, 170, { font: 'fun', col: YEL, stroke: 22, maxW: 700 }); g.restore();
  }
  g.restore();
  if (t >= tb && t < tb + .12) { g.fillStyle = `rgba(255,255,255,${1 - (t - tb) / .12})`; g.fillRect(0, 0, W, H); }
}

function skullBg(g, t, alarm) {
  const gr = g.createRadialGradient(540, 900, 100, 540, 900, 1200); gr.addColorStop(0, '#26336A'); gr.addColorStop(1, '#0C1029');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(110,210,255,.12)'; g.lineWidth = 2;
  for (let k = 0; k < W; k += 60) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, H); g.stroke(); }
  for (let k = 0; k < H; k += 60) { g.beginPath(); g.moveTo(0, k); g.lineTo(W, k); g.stroke(); }
  g.strokeStyle = 'rgba(230,225,210,.55)'; g.lineWidth = 34; ell(g, 540, 930, 700, 860); g.stroke();
  if (alarm) { g.fillStyle = `rgba(255,30,50,${.16 + .14 * Math.sin(t * 18)})`; g.fillRect(0, 0, W, H); }
}
function hazard(g, x, y, w, h, t, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  rr(g, -w / 2, -h / 2, w, h, 10); g.save(); g.clip();
  g.fillStyle = YEL; g.fillRect(-w / 2, -h / 2, w, h);
  g.fillStyle = '#1D1822'; const off = (t * 120) % 80;
  for (let k = -w; k < w; k += 80) { g.beginPath(); g.moveTo(k + off, -h / 2); g.lineTo(k + off + 40, -h / 2); g.lineTo(k + off - 20, h / 2); g.lineTo(k + off - 60, h / 2); g.closePath(); g.fill(); }
  g.restore(); rr(g, -w / 2, -h / 2, w, h, 10); g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
  g.restore();
}
function hookAlarm(g, t) {
  skullBg(g, t, true);
  const t0 = S('h2');
  const [sx, sy] = shake(t, t0, 14, 2.4, 23);
  brain(g, {
    x: 540 + sx, y: 1290 + sy, s: 1.9, t, eyes: 'wide', mouth: 'shout', siren: 1, legs: 'run',
    arms: { l: [-190, -60 + Math.sin(t * 22) * 60], r: [190, -80 + Math.cos(t * 22) * 60] }, sweat: 1,
  });
  const bp = pop(t, t0 - .05, .35);
  g.save(); g.translate(540, 470); g.scale(bp, bp);
  hazard(g, 0, 0, 920, 150, t, -.03);
  rr(g, -330, -60, 660, 120, 20); fs(g, '#E8202F', INK, 7);
  poly(g, [[-232, -40], [-188, 40], [-276, 40]]); fs(g, YEL, INK, 5); text(g, '!', -232, 14, 52, INK, 'black');
  text(g, '一级警报', 50, 4, 92, '#FFFFFF', 'black');
  g.restore();
  const lines = [['检测到：大量糖分！', t0 + .35], ['稀有度：★★★★★', t0 + .75], ['指令：全部吃掉！', t0 + 1.15]];
  lines.forEach(([s, a], i) => {
    const p = pop(t, a, .25); if (!p) return;
    g.save(); g.translate(540, 640 + i * 70); g.scale(p, p);
    rich(g, s, 0, 0, 54, { col: '#7CFFB2', stroke: 12, strokeCol: '#0B1530', hl: YEL });
    g.restore();
  });
}
function hookSame(g, t) {
  g.fillStyle = '#FBD08A'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#BFE4F4'; poly(g, [[600, 0], [W, 0], [W, H], [480, H]]); g.fill();
  g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(600, 0); g.lineTo(480, H); g.stroke();
  g.fillStyle = 'rgba(160,100,40,.12)'; for (let i = 0; i < 18; i++) { circ(g, hash(i, 1) * 480, hash(i, 2) * H, 30 + hash(i, 3) * 60); g.fill(); }
  const t0 = S('h3'), sc = 1.8, hy = 830;
  const bO = { eyes: 'wide', mouth: 'o', siren: 0 };
  const sl = E.out(seg(t, T.same, T.same + .35));
  person(g, { x: lerp(-200, 270, sl), y: hy + 246 * sc, s: sc, t, outfit: 'cave', legs: 'none', xray: 1, brainO: bO, ph: 0 });
  person(g, { x: lerp(1300, 815, sl), y: hy + 246 * sc, s: sc, t, outfit: 'hoodie', legs: 'none', xray: 1, brainO: bO, ph: 0 });
  const p1 = pop(t, T.same + .2, .3);
  if (p1) { tag(g, 270, 520, '一万年前的他', 46, { sc: p1, fill: '#FFFFFF' }); tag(g, 815, 520, '现在的你', 46, { sc: p1, fill: '#FFFFFF' }); }
  const pe = pop(t, t0 + .25, .3);
  if (pe) { g.save(); g.translate(545, 830); g.scale(pe, pe); rich(g, '＝', 0, 0, 170, { font: 'black', col: '#FFFFFF', stroke: 20 }); g.restore(); }
  stamp(g, 545, 1110, '同 款', seg(t, CK('h3', 1) + .12, CK('h3', 1) + 1.12), { px: 96, rot: -.1 });
}

/* ================= 野外 ================= */
function wild(g, t) {
  const sunU = lerp(.22, .55, E.io(seg(t, S('p2'), CK('p2', 1)))), storm = E.io(seg(t, T.dusk, T.dusk + .9));
  wildBack(g, t, { sun: sunU, storm });
  const walkEnd = S('p1') + 1.9;
  const wx = lerp(-140, 430, E.out(seg(t, T.wild, walkEnd)) * .3 + seg(t, T.wild, walkEnd) * .7);
  const walking = t < walkEnd;
  const rum = t >= S('p2') && t < CK('p2', 1) - .05;
  const shown = t >= CK('p2', 1) - .05, eat = CK('p2', 1) + .75, sour = eat + .25;
  bush(g, 690, 1300, 1.3, t, { shake: rum ? 1 : 0, berries: 0, col: mix('#6FA14E', '#3E4A55', storm) });
  if (rum) for (let i = 0; i < 8; i++) { const u = ((t - S('p2')) * 1.6 + i / 8) % 1; withAlpha(g, 1 - u, () => { g.save(); g.translate(690 + Math.cos(i * 2.1) * u * 260, 1150 - u * 260 + u * u * 300); g.rotate(u * 8 + i); ell(g, 0, 0, 18, 9); fs(g, '#7DB35A', INK, 3); g.restore(); }); }
  const bolted = t >= T.bolt, skel = bolted && t < T.bolt + .5 && Math.floor((t - T.bolt) / .07) % 2 === 0;
  const suck = seg(t, T.bolt + .55, T.shop - .1);
  const px = wx, py = 1200;
  if (t >= T.bolt + .4) portal(g, px, 1080, 300 * E.back(seg(t, T.bolt + .4, T.bolt + .75)) * (1 - E.in(seg(t, T.shop - .25, T.shop))), t);
  if (skel) skeleton(g, px, py, 1.05);
  else if (suck < 1) {
    let eyes = 'dot', mouth = 'smile', brow = 'normal', arms = { l: [-36, -58], r: [36, -58] }, look = [0, 0], headRot = 0, sweat = 0, swell = 0;
    if (walking) { arms = { l: [-50, -40 + Math.sin(t * 9) * 16], r: [70, -150] }; }
    if (rum) { arms = { l: [-40, -60], r: [150 + Math.sin(t * 30) * 20, -30] }; eyes = 'squint'; mouth = 'flat'; brow = 'angry'; }
    if (shown) { arms = { l: [-40, -60], r: [100, -140] }; look = [5, 0]; mouth = 'smile'; }
    if (t >= eat && t < sour) { arms = { l: [-40, -60], r: [20, -200] }; mouth = 'o'; }
    if (t >= sour) { eyes = 'squint'; mouth = 'sour'; brow = 'angry'; headRot = Math.sin(t * 50) * .06 * clamp(1 - (t - sour) / 1.2); arms = { l: [-40, -60], r: [90, -100] }; }
    if (t >= T.dusk + .3) { eyes = 'wide'; mouth = 'o'; look = [0, -7]; brow = 'up'; sweat = 1; headRot = 0; arms = { l: [-60, -40], r: [60, -40] }; }
    if (bolted) { eyes = 'x'; mouth = 'wavy'; sweat = 0; }
    const sc = 1.05 * (1 - E.in(suck));
    const ry = lerp(py, 1080 + 246 * sc * .4, E.in(suck));
    person(g, {
      x: px, y: ry, s: sc, t, outfit: 'cave', legs: walking ? 'walk' : 'stand', walkPh: t * 9, rot: suck * 14,
      eyes, mouth, brow, look, arms, headRot, sweat, swell, hairUp: bolted ? .8 : 0,
      hands: (gg, L, Rr) => {
        if (!bolted) club(gg, L[0], L[1], walking ? -.3 : -.15, .9);
        if (shown && t < eat + .2) { for (let k = 0; k < (t < eat ? 3 : 2); k++) berry(gg, Rr[0] - 12 + k * 13, Rr[1] - 14 - (k % 2) * 6, 7); }
      },
    });
    if (bolted) { g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(70,60,60,.0)'; g.restore(); }
  }
  // 放大镜：三颗酸果子
  const mag = win(t, CK('p2', 1) + .1, eat - .05, .2, .2);
  if (mag) withAlpha(g, mag, () => {
    g.save(); g.translate(810, 700); g.scale(.85 + .15 * mag, .85 + .15 * mag);
    g.strokeStyle = INK; g.lineWidth = 26; g.beginPath(); g.moveTo(-120, 120); g.lineTo(-230, 230); g.stroke();
    circ(g, 0, 0, 190); fs(g, '#FFF6E6', INK, 12);
    g.save(); circ(g, 0, 0, 184); g.clip();
    for (let f = 0; f < 4; f++) { rr(g, -118 + f * 62, -60 + Math.abs(f - 1.5) * 14, 50, 110, 25); fs(g, SKIN.cave, INK, 6); }
    ell(g, 0, 40, 150, 90); fs(g, SKIN.cave, INK, 6);
    rr(g, 120, -10, 46, 100, 23); fs(g, SKIN.cave, INK, 6);
    for (const [x, y] of [[-50, 10], [10, 30], [60, 0]]) berry(g, x, y, 20, '#B5463C');
    g.restore();
    tag(g, 0, -150, '3 颗', 44, { fill: YEL, shadow: false });
    g.restore();
  });
  if (t >= sour && t < T.dusk) { const p = pop(t, sour, .25); g.save(); g.translate(px + 170, 760); g.rotate(-.15); g.scale(p, p); rich(g, '酸！', 0, 0, 120, { font: 'fun', col: '#C6F06A', stroke: 18 }); g.restore(); }
  // 今日糖分
  const meter = win(t, S('p2') + .2, T.dusk + .4, .3, .3);
  if (meter) withAlpha(g, meter, () => {
    g.save(); g.translate(540, 470);
    rr(g, -330, -62, 660, 124, 26); fs(g, 'rgba(255,255,255,.92)', INK, 6);
    text(g, '今日糖分', -200, 0, 44, INK, 'black');
    rr(g, -90, -22, 380, 44, 22); fs(g, '#EFE7DA', INK, 5);
    const blink = Math.sin(t * 10) > 0 ? '#E8202F' : '#FF8A8A'; rr(g, -88, -20, 16, 40, 8); g.fillStyle = blink; g.fill();
    text(g, '3%', 230, -50, 32, '#E8202F', 'black');
    g.restore();
  });
  if (t >= T.bolt - .02 && t < T.bolt + .5) {
    const k = Math.floor((t - T.bolt) * 30);
    bolt(g, px + 40 + (k % 2) * 30, -50, px, py - 300, 7 + k, 1);
  }
}

/* ================= 奶茶店 ================= */
function shop(g, t) {
  const camZ = 1.08 + .14 * E.io(seg(t, S('p4') - .1, S('p4') + .6)) * (1 - E.io(seg(t, S('c1') - .5, S('c1') - .1)));
  g.save(); g.translate(540, 640); g.scale(camZ, camZ); g.translate(-540, -640);
  const glow = MENU.map((_, i) => seg(t, S('p5') + .1 + i * .28, S('p5') + .4 + i * .28));
  shopBack(g, t, { glow });
  const k1 = t >= S('k1') - .1 && t < EN('k1') + .3, slam = S('c1') - .05, shocked = t >= slam;
  person(g, {
    x: 770, y: 1180, s: .95, t, outfit: 'clerk', legs: 'none', ph: 2,
    eyes: shocked ? 'wide' : (k1 ? 'happy' : 'dot'), mouth: shocked ? 'wavy' : (k1 ? 'grin' : 'smile'), blush: .8, sweat: shocked ? 1 : 0,
    arms: { l: [-40, -60], r: k1 ? [110 + Math.sin(t * 14) * 25, -250] : [40, -60] },
  });
  shopCounter(g, t, { register: true });
  // 原始人
  const drop = seg(t, T.shop + .05, T.shop + .45), land = T.shop + .45;
  const sq = t >= land ? 1 - .22 * Math.exp(-(t - land) * 7) * Math.cos((t - land) * 22) : 1;
  const dazed = t < T.shop + 1.25;
  const lookAround = t >= T.shop + 1.25 && t < S('k1') + .2;
  const sniff = t >= CK('p4', 1) && t < S('p5');
  const starry = t >= CK('p5', 1) - .1;
  const raise = t >= S('c1') - .45 && t < slam;
  let eyes = 'dot', mouth = 'smile', brow = 'normal', look = [0, 0], headRot = 0, arms = { l: [-36, -58], r: [60, -110] }, blush = 0;
  if (dazed) { eyes = 'spiral'; mouth = 'wavy'; }
  if (lookAround) { look = [Math.sin(t * 4) * 6, 0]; mouth = 'o'; brow = 'up'; }
  if (t >= S('k1')) { look = [6, -2]; mouth = 'smile'; brow = 'normal'; }
  if (t >= S('p4') && t < CK('p4', 1)) { look = [5, -6]; brow = 'sad'; mouth = 'flat'; }
  if (sniff) { eyes = 'closed'; mouth = 'o'; headRot = -.12 + Math.sin(t * 9) * .04; }
  if (t >= S('p5')) { look = [5, -6]; eyes = 'wide'; mouth = 'o'; }
  if (starry) { eyes = 'star'; mouth = 'drool'; blush = 1; }
  if (raise) arms = { l: [-36, -58], r: [70, -300] };
  if (shocked) { eyes = 'star'; mouth = 'shout'; blush = 1; arms = { l: [-36, -58], r: [190, -150] }; }
  if (t >= EN('c1') + .2) { mouth = 'grin'; }
  const fall = t < land;
  const cy = fall ? lerp(560, 1250, E.in(drop)) : 1250, cs = fall ? lerp(.25, 1.05, drop) : 1.05;
  if (t < T.shop + .7) portal(g, 330, 560, 230 * (1 - E.in(seg(t, T.shop + .25, T.shop + .7))), t);
  const [ssx, ssy] = shake(t, slam, 16, .4);
  g.translate(ssx, ssy);
  person(g, {
    x: 330, y: cy, s: cs, sy: sq, t, outfit: 'cave', legs: fall ? 'jump' : 'stand', rot: fall ? (1 - drop) * 6 : 0,
    eyes, mouth, brow, look, headRot, arms, blush,
    hands: (gg, L, Rr) => club(gg, Rr[0], Rr[1], shocked ? 1.75 : (raise ? -.2 : .25), .95),
  });
  if (dazed && !fall) dazedStars(g, 330, 1250 - 246 * 1.05 - 90, t, 1);
  if (lookAround) questionMark(g, 330, 720, win(t, T.shop + 1.25, S('k1') + .2, .2, .2), 1);
  g.restore();
  // 气泡与气味
  bubble(g, 760, 590, '欢迎光临！\n喝点什么？', 50, pop(t, S('k1') - .05, .3) * win(t, S('k1') - .1, EN('k1') + .35, 0, .2), [800, 820]);
  const conf = win(t, S('p4'), CK('p4', 1), .2, .2);
  if (conf) bubble(g, 300, 760, '＠#￥%？？', 54, conf, [330, 900], { fill: '#FFFFFF' });
  if (sniff || (t >= S('p5') && t < S('c1'))) {
    const a = sniff ? win(t, CK('p4', 1), S('p5') + .5, .3, .4) : win(t, S('p5'), S('c1') - .3, 0, .3);
    withAlpha(g, a, () => {
      g.lineCap = 'round';
      for (let k = 0; k < 4; k++) {
        const sx0 = 380 + k * 170, sy0 = 620 + (k % 2) * 140, ex = 345, ey = 990;
        g.strokeStyle = 'rgba(255,111,145,.75)'; g.lineWidth = 12; g.beginPath();
        for (let i = 0; i <= 30; i++) { const u = i / 30, ph = t * 6 + k; g.lineTo(lerp(sx0, ex, u) + Math.sin(u * 12 - ph) * 24 * (1 - u * .7), lerp(sy0, ey, u)); }
        g.stroke();
        const hu = ((t * .8 + k * .27) % 1); heart(g, lerp(sx0, ex, hu) + Math.sin(hu * 12 - t * 6 - k) * 24, lerp(sy0, ey, hu), 16); fs(g, HOT, INK, 3);
      }
    });
  }
  bubble(g, 420, 640, '全……全都要！', 70, pop(t, S('c1'), .3) * win(t, S('c1') - .05, EN('c1') + .5, 0, .25), null, { jag: true });
}

/* ================= 做奶茶 + 含糖量 ================= */
function cupBuild(g, t) {
  burst(g, 540, 900, t * .3, '#FFD9E3', '#FFC7D6', 22);
  const t0 = S('p6'), tP = CK('p6', 1), tF = CK('p6', 2), tL = EN('p6') + .05;
  const mv = E.io(seg(t, S('p7') - .25, S('p7') + .3));
  const cx = lerp(540, 250, mv), cs = lerp(1.6, 1.05, mv), cby = lerp(1250, 1270, mv);
  // 果糖泵
  const pumpA = win(t, T.cup, tP + .1, .2, .25);
  if (pumpA) withAlpha(g, pumpA, () => {
    g.save(); g.translate(cx, lerp(380, 330, mv));
    rr(g, -150, -100, 300, 150, 22); fs(g, '#E8EEF4', INK, 7);
    rr(g, -110, -78, 220, 70, 10); fs(g, '#1E2B3A', INK, 5);
    const n = Math.min(5, Math.max(0, Math.floor((t - t0 + .05) / .17) + 1));
    text(g, t < t0 ? '全糖' : `全糖 ×${n}`, 0, -42, 46, '#5CFF9D', 'black');
    rr(g, -26, 50, 52, 60, 8); fs(g, '#9AA6B4', INK, 6);
    g.restore();
    for (let k = 0; k < 5; k++) {
      const a = t0 + k * .17, u = (t - a) / .45; if (u < 0 || u > 1) continue;
      const y = lerp(lerp(380, 330, mv) + 110, cby - 330 * cs * .7, u * u);
      ell(g, cx, y, 16, 22); fs(g, '#F3B33D', INK, 4);
    }
  });
  const fill = lerp(.55, .78, seg(t, t0, tP));
  teaCup(g, {
    x: cx, y: cby, s: cs, t, fill, pearls: t >= tP ? 30 : 0, pearlDrop: seg(t, tP, tP + .8),
    foam: E.out(seg(t, tF, tF + .5)), lid: seg(t, tL, tL + .25), straw: seg(t, tL + .25, tL + .45), slosh: 2,
  });
  if (t >= tF - .15 && t < tF + .65) { // 奶盖从奶缸里倒进去
    const u = seg(t, tF - .15, tF + .65), a = win(t, tF - .15, tF + .65, .12, .15), topY = cby - 330 * cs;
    withAlpha(g, a, () => {
      if (u > .15 && u < .9) {
        g.fillStyle = '#FFF4DF'; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(cx + 60, 470);
        for (let y = 470; y <= topY + 10; y += 20) g.lineTo(cx + 22 + Math.sin(y * .05 + t * 20) * 6, y);
        for (let y = topY + 10; y >= 470; y -= 20) g.lineTo(cx - 22 + Math.sin(y * .05 + t * 20 + 1) * 6, y);
        g.closePath(); g.fill(); g.stroke();
      }
      g.save(); g.translate(cx + 120, 420); g.rotate(-.9);
      rr(g, -70, -90, 140, 180, 26); fs(g, '#E9EEF4', INK, 7); poly(g, [[-70, -90], [-100, -120], [-40, -90]]); fs(g, '#E9EEF4', INK, 7);
      g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.arc(80, 0, 44, -1.2, 1.2); g.stroke(); g.strokeStyle = '#E9EEF4'; g.lineWidth = 8; g.stroke();
      text(g, '奶盖', 0, 10, 40, '#C2557A', 'black');
      g.restore();
    });
  }
  if (t >= tP && t < tP + .5) { // 一勺珍珠
    withAlpha(g, 1 - seg(t, tP + .3, tP + .5), () => { g.save(); g.translate(cx + 40, 420); g.rotate(-.6); rr(g, -20, -160, 40, 160, 14); fs(g, '#C0C7D2', INK, 6); ell(g, 0, 20, 70, 44); fs(g, '#C0C7D2', INK, 6); g.restore(); });
  }
  const labs = [['全糖', t0, -1, .5], ['+珍珠', tP, 1, .3], ['+奶盖', tF, 1, .68]];
  for (const [s, a, side, hy] of labs) {
    const p = pop(t, a, .3) * (1 - mv);
    if (p) tag(g, cx + side * 330, cby - 330 * cs * hy, s, 62, { sc: p, fill: side < 0 ? YEL : '#FFFFFF', rot: side * .08 });
  }
  // 测评卡
  const cd = E.out(seg(t, S('p7') - .1, S('p7') + .35)), tc = S('p8') - .1, up = E.io(seg(t, tc - .2, tc + .3));
  if (cd > 0) {
    g.save(); g.translate(lerp(1400, 700, cd), lerp(780, 680, up)); g.scale(lerp(1, .86, up), lerp(1, .86, up));
    rr(g, -310, -270, 620, 540, 30); fs(g, '#FFFFFF', INK, 7);
    rr(g, -310, -270, 620, 100, [30, 30, 0, 0]); fs(g, '#3B6FD8', INK, 7);
    text(g, '消委会测评', 0, -218, 50, '#FFFFFF', 'black');
    text(g, '10 款珍珠奶茶 · 每杯总糖', 0, -122, 36, '#6B6375', 'bold');
    const hl = t >= CK('p7', 1) - .05;
    rr(g, -250, -80, 500, 64, 32); fs(g, hl ? '#FFE3EA' : '#F3F1F6', null);
    text(g, '最甜的一杯', 0, -48, 40, hl ? HOT : INK, 'black');
    const nu = E.out(seg(t, CK('p7', 2), CK('p7', 2) + .7));
    if (t >= CK('p7', 2) - .05) {
      g.save(); g.translate(0, 70); const sp = 1 + .15 * Math.exp(-(t - CK('p7', 2) - .7) * 8) * (t > CK('p7', 2) + .7 ? 1 : 0);
      g.scale(sp, sp); rich(g, `{${(60.9 * nu).toFixed(1)}} 克`, 0, 0, 130, { col: INK, hl: HOT, stroke: 0, maxW: 560 }); g.restore();
    }
    text(g, '数据：深圳市光明区消委会，2019', 0, 222, 28, '#8D8496', 'bold');
    g.restore();
  }
  // 13 块方糖
  if (t >= tc) {
    const pos = []; [[5, 0], [4, 1], [3, 2], [1, 3]].forEach(([n, row]) => { for (let i = 0; i < n; i++) pos.push([700 + (i - (n - 1) / 2) * 78, 1290 - row * 70]); });
    pos.forEach(([x, y], i) => {
      const a = tc + i * .07, u = seg(t, a, a + .32); if (u <= 0) return;
      sugarCube(g, x, lerp(y - 700, y, E.bounce(u)), 1.0, (1 - u) * 1.5);
    });
    const p = pop(t, tc + .95, .3);
    if (p) tag(g, 700, 990, '≈ 13 块方糖', 54, { sc: p, fill: YEL, rot: -.05 });
  }
}
