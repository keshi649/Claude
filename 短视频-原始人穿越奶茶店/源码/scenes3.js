'use strict';
/* scenes3.js：假蛋、换成你、怎么办、通知、三分糖、片尾 */

/* ---------- 假蛋 ---------- */
function beachBg(g, t) {
  const gr = g.createLinearGradient(0, 0, 0, 940); gr.addColorStop(0, '#8FD3EE'); gr.addColorStop(1, '#D9F1F8');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  cloud(g, 220 + Math.sin(t * .3) * 20, 380, .8, 'rgba(255,255,255,.95)'); cloud(g, 860, 300, .6, 'rgba(255,255,255,.9)');
  g.fillStyle = '#4FA7D6'; g.fillRect(0, 900, W, 140);
  g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 5; g.lineCap = 'round';
  for (let i = 0; i < 9; i++) { const x = (i * 140 + t * 30) % (W + 140) - 70, y = 930 + (i % 3) * 35; g.beginPath(); g.moveTo(x - 30, y); g.quadraticCurveTo(x, y - 12, x + 30, y); g.stroke(); }
  g.fillStyle = '#EAD9B2'; g.beginPath(); g.moveTo(0, 1020); for (let x = 0; x <= W; x += 60) g.lineTo(x, 1020 - Math.sin(x * .008 + 1) * 18); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
  for (let i = 0; i < 40; i++) { ell(g, hash(i, 51) * W, 1060 + hash(i, 52) * 700, 8 + hash(i, 53) * 14, 6 + hash(i, 54) * 9); fs(g, mix('#B8AFA0', '#8E8576', hash(i, 55)), null); }
}
function eggScene(g, t) {
  const tB = S('p29') - .15;
  if (t < tB) {
    beachBg(g, t);
    const pc = pop(t, S('p27') - .1, .35);
    if (pc) { g.save(); g.translate(540, 520); g.scale(pc, pc); card(g, 0, 0, 760, 200, { fill: '#FFFFFF' }); text(g, '尼科 · 丁伯根', 0, -34, 60, INK, 'black'); text(g, '动物行为学家 · 1973 年诺贝尔奖', 0, 46, 36, '#6B6375', 'bold'); g.restore(); }
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; circ(g, 300 + Math.cos(a) * 110, 1236 + Math.sin(a) * 30, 15); fs(g, '#A9A196', INK, 3); }
    egg(g, 300, 1200, 34, 44, .1);
    const gx = lerp(1350, 790, E.out(seg(t, S('p28') - .35, S('p28') + .25)));
    egg(g, gx, 1060, 180, 230, 0, true);
    const pg = pop(t, S('p28') + .3, .3); if (pg) tag(g, gx, 1060, '假蛋', 64, { sc: pg, fill: YEL, rot: -.05 });
    const j0 = S('p28') + .55, j1 = CK('p28', 1) + .25, ju = seg(t, j0, j1);
    let bx = 300, by = 1238, legs = 0, rot = 0;
    if (t >= j0) {
      bx = lerp(300, 770, E.io(ju)); by = lerp(1238, 860, ju) - Math.sin(Math.PI * ju) * 260; legs = ju < 1 ? 1 : 0;
      if (ju >= 1) rot = Math.sin(t * 5) * .07;
    }
    oyster(g, { x: bx, y: by, s: .85, t, legs, rot, eyes: t >= S('p28') + .15 ? 'heart' : 'dot' });
    const pr = pop(t, j0 + .3, .3); if (pr) tag(g, 300, 1120, '真蛋', 44, { sc: pr, fill: '#FFFFFF' });
    if (t >= j1) questionMark(g, 380, 1060, win(t, j1, tB + 1, .2, 0), .7);
    return;
  }
  burst(g, 540, 900, t * .3, '#FFE3EA', '#FFD0DC', 22);
  teaCup(g, { x: 560, y: 1330, s: 1.95, t, fill: .78, pearls: 30, foam: 1, lid: 1, straw: 0, label: '假蛋', labelPx: 50 });
  person(g, {
    x: 560, y: 700, s: 1.0, t, outfit: 'cave', legs: 'dangle', rot: -.12 + Math.sin(t * 5) * .05,
    eyes: 'heart', mouth: 'smile', blush: 1, headRot: .1, arms: { l: [-150, 30], r: [150, 30] },
  });
  // 画中画：蛎鹬孵假蛋
  g.save(); g.translate(195, 560); circ(g, 0, 0, 140); fs(g, '#D9F1F8', INK, 7); g.save(); circ(g, 0, 0, 136); g.clip();
  g.fillStyle = '#EAD9B2'; g.fillRect(-150, 60, 300, 100); egg(g, 10, 30, 64, 82, 0, true); oyster(g, { x: 20, y: -40, s: .38, t, legs: 0, eyes: 'heart', rot: Math.sin(t * 5) * .07 });
  g.restore(); g.restore();
  text(g, '同一个姿势', 195, 730, 34, INK, 'black');
  stamp(g, 560, 1190, '超常刺激', seg(t, CK('p29', 1) + .35, CK('p29', 1) + 1.35), { px: 66, rot: .08 });
}

/* ---------- 换成你 ---------- */
function officeBg(g, t) {
  g.fillStyle = '#2B3256'; g.fillRect(0, 0, W, H);
  rr(g, 90, 260, 900, 600, 16); fs(g, '#16193A', INK, 10);
  g.save(); rr(g, 90, 260, 900, 600, 16); g.clip();
  const gr = g.createLinearGradient(0, 260, 0, 860); gr.addColorStop(0, '#1B2150'); gr.addColorStop(1, '#3E3A78'); g.fillStyle = gr; g.fillRect(90, 260, 900, 600);
  for (let i = 0; i < 12; i++) {
    const x = 90 + i * 80, h = 180 + hash(i, 61) * 330; g.fillStyle = '#12142C'; g.fillRect(x, 860 - h, 70, h);
    for (let r = 0; r < h / 34 - 1; r++) for (let c = 0; c < 3; c++) if (hash(i * 31 + r, c, 7) > .55) { g.fillStyle = hash(i, r, c) > .5 ? '#FFD87A' : '#9FD7FF'; g.fillRect(x + 10 + c * 20, 860 - h + 14 + r * 34, 10, 16); }
  }
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.moveTo(540, 260); g.lineTo(540, 860); g.moveTo(90, 560); g.lineTo(990, 560); g.stroke();
}
function desk(g, t) {
  rr(g, -40, 1110, W + 80, 40, 8); fs(g, '#B9875A', INK, 7);
  g.fillStyle = '#8A5E3B'; g.fillRect(-40, 1150, W + 80, 800); g.strokeStyle = INK; g.lineWidth = 7; g.strokeRect(-40, 1150, W + 80, 800);
  rr(g, 800, 1020, 170, 90, 12); fs(g, '#1E1B22', INK, 6); text(g, '23:47', 885, 1066, 44, '#FF5E6E', 'black');
}
function you(g, t) {
  const tB = S('p31') - .15, tC = S('p32') - .1, tD = S('p33') - .1;
  if (t < tB) {
    burst(g, 540, 900, t * .2, '#FFF4E2', '#FFEBCF', 20);
    const ts = S('p30') + (EN('p30') - S('p30')) * .6;
    const cupF = gg => teaCup(gg, { x: 120, y: 20, s: .55, t, fill: .75, pearls: 20, foam: .8, lid: 1, straw: 1 });
    if (t < ts + .12) person(g, { x: 540, y: 1180, s: 1.3, t, outfit: 'cave', eyes: 'dot', mouth: 'smile', arms: { l: [-40, -60], r: [90, -60] }, front: cupF });
    else person(g, { x: 540, y: 1180, s: 1.3, t, outfit: 'office', eyes: 'dot', mouth: 'smile', look: [3, 2], arms: { l: [-60, -110], r: [90, -60] }, front: cupF, hands: (gg, L) => { rr(gg, L[0] - 24, L[1] - 50, 48, 84, 10); fs(gg, '#1E1B22', INK, 5); } });
    puff(g, 540, 820, t, ts - .05, 1.3);
    const p = pop(t, ts + .2, .35);
    if (p) { g.save(); g.translate(820, 500); g.scale(p, p); rich(g, '你', 0, 0, 150, { font: 'fun', col: YEL, stroke: 22 }); g.restore(); g.strokeStyle = INK; g.lineWidth = 10; g.lineCap = 'round'; withAlpha(g, clamp(p), () => { g.beginPath(); g.moveTo(760, 590); g.quadraticCurveTo(700, 660, 650, 680); g.stroke(); }); }
    return;
  }
  if (t < tC) {
    const x1 = CK('p31', 1), xr = E.io(seg(t, x1 - .1, x1 + .35)), zm = E.io(seg(t, x1 - .25, x1 + .3));
    const hx = 540, hy = 1190 - 246 * 1.15;
    g.save(); g.translate(lerp(hx, 540, zm), lerp(hy, 820, zm)); g.scale(1 + 1.7 * zm, 1 + 1.7 * zm); g.translate(-hx, -hy);
    officeBg(g, t);
    person(g, {
      x: 540, y: 1190, s: 1.15, t, outfit: 'office', legs: 'none', eyes: 'dot', mouth: 'sip', look: [4, 2],
      arms: { l: [-60, -60], r: [70, -140] }, xray: xr, brainO: { cave: true, eyes: 'happy', mouth: 'grin', s: .36 },
      hands: (gg, L, Rr) => teaCup(gg, { x: Rr[0] + 10, y: Rr[1] + 70, s: .38, t, fill: .7, pearls: 16, foam: .8, lid: 1, straw: 1 }),
    });
    desk(g, t);
    rr(g, 140, 960, 260, 160, 10); fs(g, '#20243A', INK, 7); g.fillStyle = 'rgba(120,200,255,.5)'; g.fillRect(156, 976, 228, 128);
    g.restore();
    const p1 = pop(t, S('p31') + .05, .3) * (1 - zm); if (p1 > .01) tag(g, 290, 1250, '身体：写字楼里', 46, { sc: p1, fill: '#FFFFFF' });
    const p2 = pop(t, x1 + .25, .3); if (p2) tag(g, 540, 440, '大脑：还在山洞里', 56, { sc: p2, fill: YEL, rot: -.03 });
    return;
  }
  if (t < tD) {
    officeBg(g, t); g.fillStyle = 'rgba(10,10,30,.55)'; g.fillRect(0, 0, W, H);
    phone(g, 540, 880, 1.12, gg => {
      gg.fillStyle = '#FFF4F6'; gg.fillRect(-170, -356, 340, 712);
      gg.fillStyle = HOT; gg.fillRect(-170, -356, 340, 110); text(gg, '今日订单', 0, -282, 40, '#FFFFFF', 'black');
      const items = [['珍珠奶茶', TEA], ['芋泥波波', '#B79BD6'], ['芝士奶盖', '#F2C063']];
      items.forEach(([n, c], i) => {
        const p = pop(t, S('p32') + .05 + i * .4, .3); if (!p) return;
        gg.save(); gg.translate(0, -170 + i * 150); gg.scale(p, p);
        rr(gg, -150, -60, 300, 124, 18); fs(gg, '#FFFFFF', 'rgba(42,35,48,.25)', 3);
        miniCup(gg, -105, 40, .8, c, i === 2);
        text(gg, n, 30, -20, 34, INK, 'black'); text(gg, '全糖 · 大杯', 30, 24, 26, '#8D8496', 'bold');
        tag(gg, 118, -48, `第${i + 1}杯`, 22, { fill: YEL, shadow: false, lw: 3 });
        gg.restore();
      });
    });
    const pw = pop(t, CK('p32', 1) - .05, .3);
    if (pw) {
      g.save(); g.translate(540, 300); g.scale(pw, pw); tag(g, 0, 0, '意志力差？', 64, { fill: '#FFFFFF' });
      const k = E.out(seg(t, CK('p32', 1) + .35, CK('p32', 1) + .6)); g.strokeStyle = '#E8202F'; g.lineWidth = 14; g.lineCap = 'round';
      if (k > 0) { g.beginPath(); g.moveTo(-200, 10); g.lineTo(-200 + 400 * k, -10); g.stroke(); }
      g.restore();
    }
    return;
  }
  // 原始大脑认真盖章
  skullBg(g, t, false);
  const cards = [640, 860, 1080], st = [S('p33') + .15, S('p33') + .6, S('p33') + 1.05];
  const pt = pop(t, CK('p33', 1) - .05, .35);
  if (pt) { g.save(); g.translate(270, 640); g.scale(pt * .6, pt * .6); const gl = .6 + .4 * Math.sin(t * 6); g.shadowColor = `rgba(255,214,90,${gl})`; g.shadowBlur = 40; tablet(g, 0, 0, 380, 460); g.shadowBlur = 0; carve(g, '铁律', 0, -60, 110, 1, 'fun'); carve(g, '见甜就吃', 0, 90, 64, 1, 'black'); g.restore(); }
  cards.forEach((y, i) => {
    g.save(); g.translate(760, y); g.rotate((i - 1) * .03);
    card(g, 0, 0, 440, 170, { fill: '#FFFFFF', lw: 6 });
    miniCup(g, -160, 50, .7, [TEA, '#B79BD6', '#F2C063'][i], i === 2);
    text(g, ['珍珠奶茶 · 全糖', '芋泥波波 · 全糖', '芝士奶盖 · 全糖'][i], 40, -6, 36, INK, 'black');
    g.restore();
    stamp(g, 840, y + 10, '批准', seg(t, st[i], st[i] + 1), { px: 56, rot: -.15 + i * .1, sc: .9 });
  });
  let cur = 0; st.forEach((a, i) => { if (t >= a - .3) cur = i; });
  const dn = st.map(a => Math.max(0, 1 - Math.abs(t - a) / .18)).reduce((a, b) => Math.max(a, b), 0);
  const bx = 250, by = 1330, bs = 1.0;
  const hx = (840 - bx) / bs, hy = (cards[cur] - 60 - dn * -40 - by) / bs - BC;
  brain(g, {
    x: bx, y: by, s: bs, t, eyes: 'dot', mouth: 'flat', siren: 0, look: [6, 0],
    arms: { l: pt ? [-110, -160] : [-150, 40], r: [hx, hy - 60 + dn * 50] },
    hands: (gg, L, Rr) => { gg.save(); gg.translate(Rr[0], Rr[1] + 30); rr(gg, -14, -90, 28, 80, 10); fs(gg, '#A8743F', INK, 5); rr(gg, -60, -14, 120, 44, 10); fs(gg, '#C0392B', INK, 5); gg.restore(); },
  });
}

/* ---------- 怎么办 ---------- */
function fingerPtr(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-.35);
  rr(g, -16, 0, 32, 90, 16); fs(g, SKIN.office, INK, 5);
  rr(g, -44, 60, 88, 110, 36); fs(g, SKIN.office, INK, 5);
  g.restore();
}
function fix(g, t) {
  const tB = S('p35') - .1, tC = S('p36') - .1, tD = S('p37') - .1, tE = CK('p38', 1) - .1;
  if (t < tB) {
    g.fillStyle = '#CFE6DF'; g.fillRect(0, 0, W, H); g.fillStyle = '#B7D3CA'; g.fillRect(0, 1300, W, H);
    rr(g, 130, 400, 820, 480, 18); fs(g, '#FFFFFF', INK, 9);
    text(g, '糖的危害', 540, 470, 60, INK, 'black');
    for (let i = 0; i < 4; i++) { rr(g, 190, 545 + i * 70, 300 + hash(i, 9) * 160, 24, 12); g.fillStyle = '#D6D2DE'; g.fill(); }
    g.strokeStyle = HOT; g.lineWidth = 8; g.beginPath(); g.moveTo(700, 820); g.lineTo(770, 760); g.lineTo(820, 790); g.lineTo(890, 620); g.stroke();
    const nope = EN('p34') - .45;
    person(g, { x: 190, y: 1260, s: .95, t, outfit: 'office', eyes: 'dot', mouth: t < nope ? 'open' : 'frown', brow: t < nope ? 'normal' : 'sad', arms: { l: [-40, -60], r: [130, -300] }, hands: (gg, L, Rr) => { gg.strokeStyle = '#8A5A34'; gg.lineWidth = 9; gg.beginPath(); gg.moveTo(Rr[0], Rr[1]); gg.lineTo(Rr[0] + 200, Rr[1] - 210); gg.stroke(); } });
    rr(g, 690, 1200, 160, 30, 8); fs(g, '#A8743F', INK, 6); for (const x of [710, 830]) { rr(g, x - 8, 1230, 16, 100, 6); fs(g, '#A8743F', INK, 5); }
    const huh = t >= S('c2') - .05;
    brain(g, { x: 770, y: 1290, s: .8, t, legs: 'sit', eyes: huh ? 'wide' : 'tiny', mouth: huh ? 'o' : 'flat', rot: huh ? .14 : 0 });
    if (t >= nope) stamp(g, 540, 640, '无效', seg(t, nope, nope + 1), { px: 90, rot: -.12 });
    bubble(g, 830, 920, '嗷？', 66, pop(t, S('c2') - .05, .3), [790, 1060]);
    return;
  }
  if (t < tC) {
    paperBg(g, '#FFF6EE');
    const p1 = pop(t, tB + .05, .3), p2 = pop(t, CK('p35', 0) + .7, .35);
    if (p1) withAlpha(g, .55, () => { g.save(); g.translate(540, 680); g.scale(p1, p1); card(g, 0, 0, 780, 170, { fill: '#F1EEF6' }); text(g, '跟大脑讲道理', 40, 0, 58, '#6B6375', 'black'); cross(g, -300, 0, 1.4); g.restore(); });
    if (p2) { g.save(); g.translate(540, 960); g.scale(p2, p2); card(g, 0, 0, 840, 230, { fill: '#FFFFFF' }); text(g, '改环境', 50, -20, 96, HOT, 'black'); text(g, '改它每天看到、点到的东西', 50, 60, 34, '#6B6375', 'bold'); check(g, -310, -10, 1.8); g.restore(); }
    return;
  }
  if (t < tD) {
    paperBg(g, '#FFEFF3');
    const sel = t >= CK('p36', 1) + .45, on = t >= CK('p36', 1) + 1.0;
    phone(g, 540, 870, 1.12, gg => {
      gg.fillStyle = '#FFFFFF'; gg.fillRect(-170, -356, 340, 712);
      text(gg, '选择甜度', 0, -290, 40, INK, 'black');
      ['全糖', '七分糖', '五分糖', '三分糖', '不另外加糖'].forEach((n, i) => {
        const y = -200 + i * 82, hi = sel ? i === 3 : i === 0;
        rr(gg, -140, y - 32, 280, 64, 32); fs(gg, hi ? '#FFE3EA' : '#F5F3F8', hi ? HOT : null, 4);
        text(gg, n, -10, y + 2, 32, hi ? HOT : INK, 'black');
        circ(gg, 110, y, 14); fs(gg, hi ? HOT : '#FFFFFF', '#B8B2C2', 3);
      });
      text(gg, '设为默认甜度', -40, 250, 30, INK, 'black');
      rr(gg, 70, 228, 80, 44, 22); fs(gg, on ? '#2FB36B' : '#D6D2DE', null); circ(gg, on ? 128 : 92, 250, 18); fs(gg, '#FFFFFF', null);
      if (t >= CK('p36', 1) + 1.2) { rr(gg, -110, 300, 220, 44, 22); gg.fillStyle = 'rgba(30,22,40,.8)'; gg.fill(); text(gg, '已保存', 0, 322, 26, '#FFFFFF', 'black'); }
    });
    const tapA = CK('p36', 1) + .45, tapB = CK('p36', 1) + 1.0;
    let fx = 760, fy = 1250;
    if (t < tapA) { const u = E.io(seg(t, tC + .2, tapA)); fx = lerp(900, 680, u); fy = lerp(1500, 1018, u); }
    else if (t < tapB) { const u = E.io(seg(t, tapA + .15, tapB)); fx = lerp(680, 690, u); fy = lerp(1018, 1150, u); }
    else { fx = 690; fy = 1150; }
    const press = Math.max(1 - Math.abs(t - tapA) / .1, 1 - Math.abs(t - tapB) / .1, 0);
    fingerPtr(g, fx, fy, 1 - press * .1);
    return;
  }
  if (t < tE) {
    paperBg(g, '#F2F7FF');
    g.save(); g.translate(540, 860);
    card(g, 0, 0, 560, 600, { fill: '#FFFFFF' });
    rr(g, -280, -300, 560, 120, [30, 30, 0, 0]); fs(g, '#E8453C', INK, 7);
    text(g, '减 糖', 0, -238, 60, '#FFFFFF', 'black');
    const pages = ['第 1 天', '1 个月', '2 个月', '3 个月'], fl = [S('p38') + .15, S('p38') + .55, S('p38') + .95];
    let k = 0; fl.forEach(a => { if (t >= a) k++; });
    text(g, pages[k], 0, 60, k === 3 ? 120 : 100, k === 3 ? '#E8453C' : INK, 'black');
    fl.forEach((a, i) => {
      const u = seg(t, a, a + .4); if (u <= 0 || u >= 1) return;
      g.save(); g.translate(-200 + u * 260, -170 + u * u * 600); g.rotate(u * 1.4); rr(g, -260, 0, 520, 420, 10); fs(g, '#FFFFFF', INK, 5); text(g, pages[i], 0, 220, 90, INK, 'black'); g.restore();
    });
    g.restore();
    if (t < S('p38')) { g.save(); g.translate(880, 500); g.rotate(Math.sin(t * 3) * .2); poly(g, [[-50, -70], [50, -70], [0, 0]]); fs(g, '#FFE08A', INK, 5); poly(g, [[-50, 70], [50, 70], [0, 0]]); fs(g, '#FFE08A', INK, 5); rr(g, -60, -84, 120, 16, 6); fs(g, '#A8743F', INK, 4); rr(g, -60, 68, 120, 16, 6); fs(g, '#A8743F', INK, 4); g.restore(); }
    return;
  }
  paperBg(g, '#FFF6EE');
  tag(g, 540, 470, '同一份布丁', 54, { fill: YEL, sc: pop(t, tE + .05, .3) });
  pudding(g, 540, 850, 1.05, t);
  const up = t >= CK('p38', 2) ? E.el(seg(t, CK('p38', 2), CK('p38', 2) + .8)) : 0;
  gauge(g, 290, 1180, 170, .45, '照常吃糖的人', { px: 36 });
  gauge(g, 790, 1180, 170, .45 + .4 * up, '减糖 3 个月的人', { px: 36 });
  const p = pop(t, CK('p38', 2) + .3, .3); if (p) tag(g, 870, 940, '更甜！', 56, { sc: p, fill: HOT, col: '#FFFFFF', rot: .08 });
  text(g, '数据：Wise 等，2016，《美国临床营养学杂志》', 540, 1300, 28, '#8D8496', 'bold');
}

/* ---------- 通知 ---------- */
function notice(g, t) {
  caveBg(g, t); g.fillStyle = 'rgba(10,6,20,.35)'; g.fillRect(0, 0, W, H);
  const got = t >= S('p40') - .1, ok = t >= S('p41') + .2;
  const nod = ok ? Math.sin(t * 7) * .07 : 0;
  brain(g, {
    x: 540, y: 1330, s: 1.25, t, rot: nod, eyes: ok ? 'closed' : got ? 'wide' : 'dot', mouth: ok ? 'smile' : got ? 'o' : 'flat', blush: ok ? 1 : 0,
    arms: { l: [-150, 110], r: [150, 110] },
    hands: (gg) => {
      gg.save(); gg.translate(0, 110); rr(gg, -150, -100, 300, 200, 24); fs(gg, '#8C8A84', INK, 6);
      rr(gg, -122, -74, 244, 148, 14); fs(gg, got ? '#FFF8E0' : '#3E3A44', INK, 4);
      text(gg, got ? '1 条新通知' : '暂无新通知', 0, 0, 36, got ? HOT : '#9A94A3', 'black');
      gg.restore();
    },
  });
  const nb = E.out(seg(t, S('p40') - .15, S('p40') + .25));
  if (nb > 0) {
    g.save(); g.translate(540, lerp(-150, 520, nb));
    card(g, 0, 0, 920, ok ? 300 : 230, { fill: '#FFFFFF', r: 40 });
    rr(g, -420, -82, 80, 80, 20); fs(g, HOT, INK, 4); text(g, '!', -380, -40, 56, '#FFFFFF', 'black');
    g.font = F(34, 'bold'); g.fillStyle = '#8D8496'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('系统通知 · 现在', -320, -46);
    rich(g, '糖，{已经不稀缺了。}', -400, 40, 62, { align: 'left', col: INK, hl: HOT, stroke: 0, maxW: 820 });
    if (ok) { const p = pop(t, S('p41') + .2, .3); g.save(); g.translate(-400, 112); g.scale(p, p); rich(g, '来自：{你}', 0, 0, 40, { align: 'left', col: '#6B6375', hl: '#3B6FD8', stroke: 0, font: 'black' }); g.restore(); }
    g.restore();
  }
}

/* ---------- 三分糖 ---------- */
function order(g, t) {
  g.save(); g.translate(540, 640); g.scale(1.08, 1.08); g.translate(-540, -640);
  shopBack(g, t, {});
  const ok = t >= S('k2') - .05;
  person(g, { x: 770, y: 1180, s: .95, t, outfit: 'clerk', legs: 'none', ph: 2, eyes: 'happy', mouth: ok ? 'grin' : 'smile', blush: .8, arms: { l: [-40, -60], r: ok ? [120, -200] : [40, -60] }, hands: (gg, L, Rr) => { if (ok) { rr(gg, Rr[0] - 8, Rr[1] - 50, 18, 40, 9); fs(gg, SKIN.clerk, INK, 4); } } });
  shopCounter(g, t, {});
  const cu = E.out(seg(t, S('k2'), S('k2') + .5));
  if (cu > 0) teaCup(g, { x: lerp(700, 520, cu), y: 1072, s: .5, t, fill: .7, pearls: 16, foam: .6, lid: 1, straw: 1, label: '三分糖', labelPx: 46, labelCol: '#E6F7EF' });
  person(g, { x: 330, y: 1250, s: 1.05, t, outfit: 'cave', eyes: ok ? 'happy' : 'squint', mouth: ok ? 'grin' : 'wavy', brow: ok ? 'normal' : 'angry', sweat: ok ? 0 : 1, arms: { l: [-36, -58], r: [90, -300] }, hands: (gg, L, Rr) => { rr(gg, Rr[0] - 7, Rr[1] - 52, 16, 44, 8); fs(gg, SKIN.cave, INK, 4); } });
  g.restore();
  bubble(g, 360, 640, '三……三分糖！', 64, pop(t, S('c3') - .05, .3), [350, 880]);
  bubble(g, 800, 600, '好嘞！', 64, pop(t, S('k2') - .05, .3), [800, 820]);
  const pi = pop(t, S('c3') + .9, .3);
  if (pi) { g.save(); g.translate(170, 380); g.scale(pi, pi); circ(g, 0, 0, 120); fs(g, '#26336A', INK, 7); g.save(); circ(g, 0, 0, 114); g.clip(); brain(g, { x: 0, y: 70, s: .42, t, legs: 'none', eyes: 'happy', mouth: 'grin', arms: { l: [-150, 40], r: [150, -120] } }); g.restore(); tag(g, 0, 140, '大脑：收到', 32, { fill: YEL, shadow: false }); g.restore(); }
}

/* ---------- 片尾 ---------- */
function endCard(g, t) {
  burst(g, 540, 1000, t * .25, '#FF8FAB', '#FF7A9C', 24);
  const p = pop(t, T.card + .1, .45);
  g.save(); g.translate(540, 560); g.scale(p, p);
  rich(g, '你的大脑', 0, -90, 132, { font: 'fun', col: '#FFFFFF', stroke: 22 });
  rich(g, '还住在{山洞}里', 0, 70, 132, { font: 'fun', col: '#FFFFFF', hl: YEL, stroke: 22 });
  g.restore();
  const p2 = pop(t, T.card + .5, .35);
  if (p2) tag(g, 540, 870, '糖已经不稀缺了，记得通知它。', 46, { sc: p2, fill: '#FFFFFF' });
  brain(g, {
    x: 540, y: 1330, s: 1.1, t, eyes: 'happy', mouth: 'grin', blush: 1,
    arms: { l: [-160, 40], r: [175, -150 + Math.sin(t * 9) * 35] },
    hands: (gg, L) => teaCup(gg, { x: L[0], y: L[1] + 60, s: .3, t, fill: .7, pearls: 14, foam: .6, lid: 1, straw: 1 }),
  });
  const p3 = pop(t, T.card + 1.0, .3);
  if (p3) { g.save(); g.translate(540, 1450); g.scale(p3, p3); rich(g, '（转给那个每天一杯的朋友）', 0, 0, 46, { col: '#FFFFFF', stroke: 12 }); g.restore(); }
}
