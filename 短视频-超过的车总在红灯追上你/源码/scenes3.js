'use strict';
/* scenes3.js：为什么你"总觉得"甩不掉、开车卡、结尾、片尾卡。
   mirror：甩开他的时候，你一路往前看，他被红灯拦在后面，后视镜里根本看不见（上下两块画面）；被追上的时候，他就停在你旁边（大特写，举着保温杯）；
           所以你记住的全是"又是你"（软木板上的一排照片，甩开的那次是空的）。
   guide：红灯定律·开车卡（三条，最后一条停 3 秒以上）。
   end：傍晚的红灯前，你们俩并排；绿灯一亮，一起开走。片尾卡：标题、金句、甜菜 出品、AI 声明、出处。 */

/* ================= mirror：甩开他你看不见，被追上他就在旁边 ================= */
function mirrorScene(g, t) {
  const t1 = CH('w1', 2) - .12, t2 = CH('w1', 4) - .12;
  if (t < t1) {
    // 上下两块：上面"你"一路往前开（只看前面），下面他被红灯拦在后面——你根本看不见
    bgGrid(g, t, '#1C2238', 'rgba(120,200,255,.07)');
    const panel = (y0, h, st, wy0, label, fill) => {
      g.save(); g.beginPath(); g.rect(60, y0, 840, h); g.clip();
      g.translate(0, y0 - wy0 * 10);
      street(g, t, st, { buf: 'stp' });
      g.restore();
      g.fillStyle = C.ink; g.fillRect(54, y0 - 6, 852, 6); g.fillRect(54, y0 + h, 852, 6); g.fillRect(54, y0, 6, h); g.fillRect(900, y0, 6, h);
      ptag(g, 84, y0 + 36, label, 36, { align: 'left', fill });
    };
    const sp = 30, ux = 40 - (t - SS('mirror')) * sp;
    panel(230, 470, {
      camX: ux - 20, stopX: -999, light: null, sky: 'day',
      you: { x: ux, lane: 'near', col: CAR_COL.you, spin: ux * .5, drv: youO(t, { eyes: 'l', mouth: 'smile' }) },
      others: [{ x: ux + 70, lane: 'far', col: CAR_COL.gray, spin: ux * .6, drv: person(1, {}) }],
    }, 82, '你：一路往前', '#FFE27A');
    // 速度线 + 视线箭头（只看前面）
    for (let i = 0; i < 4; i++) { const u = (t * 3 + i / 4) % 1; g.fillStyle = `rgba(255,255,255,${(.8 * (1 - u)).toFixed(2)})`; g.fillRect(Math.round(620 + u * 220), 560 + i * 26, 50, 6); }
    pixArrow(g, 300, 520, 110, 520, 6, '#FFE27A', 1);
    const pB = E.out(clamp((t - SS('mirror') - .2) / .3));
    if (pB > 0) withAlpha(g, pB, () => {
      panel(760, 470, {
        camX: -4, stopX: HOOK_STOP, light: 'red', num: 48 - Math.floor(t - SS('mirror')), sky: 'day',
        him: { x: HOOK_STOP + 1, lane: 'near', col: CAR_COL.him, puff: t, drv: himO(t, { eyes: blinkEyes(t, 3) }), cup: true, cupDy: 5 },
        others: [{ x: HOOK_STOP + 2, lane: 'far', col: CAR_COL.white, roof: 'rack', drv: person(2, {}), puff: t + .4 }],
      }, 82, '他：被红灯拦在后面', '#A8E6FF');
    });
    // "你看不见"：下面这块盖上一层暗，画一只打叉的眼睛
    const pC = E.out(clamp((t - (CH('w1', 1) - .2)) / .25));
    if (pC > 0) withAlpha(g, pC, () => {
      g.fillStyle = 'rgba(10,8,24,.62)'; g.fillRect(60, 760, 840, 470);
      const ex = 480, ey = 980, k = 12;
      pix(g, ['...#######...', '..#.......#..', '.#...###...#.', '#...#####...#', '.#...###...#.', '..#.......#..', '...#######...'], { '#': C.white }, ex, ey, k);
      g.fillStyle = '#FF5A4F'; for (let i = 0; i < 13; i++) { g.fillRect(ex - 78 + i * 12, ey - 78 + i * 12, 14, 14); }
      ptext(g, '后视镜里：看不见', ex, ey + 150, 48, C.white, { align: 'center', ol: C.ink, olw: 4 });
    });
    return;
  }
  if (t < t2) {
    // 被追上：红灯前，他就停在你旁边——拉近的特写
    const st = hookStreetState(2.2);
    st.walkers = []; st.others = [];
    st.him.drv = himO(t, { eyes: 'happy', mouth: 'smile', arms: 'upR' }); st.him.cupDy = -1 + (Math.floor(t * 4) % 2); st.him.puff = t;
    st.you.drv = youO(t, { eyes: 'tired', mouth: 'flat' }); st.you.puff = t;
    st.num = 21 - Math.floor(t - t1);
    const z = E.out(clamp((t - t1) / .5));
    const P = Math.round(lerp(12, 18, z)), bx = lerp(8, 20, z), by = lerp(30, 52, z);
    street(g, t, st, { P, bx, camY: by });
    speech(g, t, t1 + .25, t2 + .3, Math.round((st.him.x + 21 - bx) * P), Math.round((LANE_FAR - 22 - by) * P) - 10, '嗨～又是我', { px: 36 });
    if (t > CH('w1', 3) - .25) popTag(g, t, CH('w1', 3) - .25, 480, 330, '就停在你旁边！', 48, { fill: '#FFE27A' });
    return;
  }
  // 你的记忆：一排"又是你"的照片，甩开的那次是空的
  g.fillStyle = '#B98A55'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 900; i++) { g.fillStyle = i % 2 ? 'rgba(90,50,20,.18)' : 'rgba(255,230,190,.14)'; g.fillRect(Math.floor(hash(i, 1) * 180) * 6, Math.floor(hash(i, 2) * 320) * 6, 6, 6); }
  g.fillStyle = '#7A5230'; g.fillRect(0, 0, W, 24); g.fillRect(0, 0, 24, H); g.fillRect(W - 24, 0, 24, H);
  ptag(g, 480, 300, '你的记忆', 48, { fill: '#FFFFFF' });
  const spots = [[200, 590, -.06], [480, 570, .04], [760, 600, -.03], [200, 940, .05], [480, 930, -.05], [760, 950, .07]];
  spots.forEach(([x, y, r], i) => {
    const ta = t2 + .1 + i * .28, p = pop(t, ta, .3); if (p <= 0) return;
    g.save(); g.translate(x, y); g.scale(p, p); g.translate(-x, -y);
    if (i === 4) {
      polaroid(g, x, y, 240, 290, r, (gg, x0, y0, w, h) => { gg.fillStyle = '#D9D4C8'; gg.fillRect(x0, y0, w, h); ptext(gg, '？', x0 + w / 2, y0 + h / 2 + 24, 72, '#A8A090', { align: 'center' }); }, { label: '甩开的那次', lc: '#9A9080', pin: '#6E9BD6' });
      withAlpha(g, .5, () => { g.fillStyle = '#B98A55'; g.fillRect(x - 124, y - 149, 248, 298); });
      ptext(g, '没看见', x, y + 20, 36, '#6A5A40', { align: 'center' });
    } else {
      polaroid(g, x, y, 240, 290, r, (gg, x0, y0, w, h) => {
        gg.fillStyle = ['#BFE6FA', '#FBD49A', '#C9E8D8', '#E8D5F5', '#FFE0C8'][i % 5]; gg.fillRect(x0, y0, w, h);
        gg.fillStyle = CAR_COL.him; gg.fillRect(x0, y0 + h - 60, w, 60); gg.fillStyle = '#27304A'; gg.fillRect(x0 + 20, y0 + 30, w - 40, h - 100);
        crabAt(gg, x0 + w / 2 - 6, y0 + h - 40, 6, himO(0, { eyes: i % 2 ? 'happy' : 'n', mouth: 'smile', arms: 'upR' }));
        gg.save(); gg.imageSmoothingEnabled = false; gg.drawImage(THERMOS(), Math.round(x0 + w / 2 + 50), Math.round(y0 + h - 40 - 16 * 6 - 36), 18, 42); gg.restore();
      }, { label: '又是你', pin: ['#E5483B', '#3E9E6A', '#F2C230', '#5F86D6', '#E58BAA'][i % 5] });
    }
    g.restore();
  });
  if (t > CH('w1', 4) + .4) popTag(g, t, CH('w1', 4) + .4, 480, 1180, '记住的全是"又是你"', 36, { fill: '#FFE27A' });
}

/* ================= guide：红灯定律·开车卡 ================= */
const GUIDE = [['g1', '冒险超车：平均只省{几秒}'], ['g2', '红灯越多：领先越容易{清零}'], ['g3', '下次超车：看他{几个路口}追上你']];
function duskStreet(g, t, o = {}) {
  const st = hookStreetState(3);
  st.sky = 'dusk'; st.walkers = []; st.num = o.num ?? (60 - Math.floor(t) % 40);
  st.light = o.light || 'red';
  st.him.drv = himO(t, o.himFace || { eyes: blinkEyes(t, 3) }); st.him.cupDy = o.cupUp ? -1 + (Math.floor(t * 4) % 2) : 5; st.him.puff = t;
  st.you.drv = youO(t, o.youFace || {}); st.you.puff = t;
  st.others[1].x = 68;
  if (o.go !== undefined) {
    const u = Math.max(0, t - o.go), dx = 18 * u * u;
    st.you.x -= dx; st.him.x -= dx * .96; st.others[0].x -= Math.max(0, 18 * (u - .4) ** 2) * (u > .4 ? 1 : 0); st.others[1].x -= Math.max(0, 18 * (u - .3) ** 2) * (u > .3 ? 1 : 0);
    st.you.spin = st.you.x; st.him.spin = st.him.x; st.you.brake = st.him.brake = false;
  }
  street(g, t, st);
  return st;
}
function guide(g, t) {
  duskStreet(g, t);
  g.fillStyle = 'rgba(10,8,24,.45)'; g.fillRect(0, 0, W, H);
  const t0 = S('g1') - .45, p = E.out(clamp((t - t0) / .3));
  if (p <= 0) return;
  g.save(); g.globalAlpha *= p; g.translate(0, Math.round((1 - p) * -10) * 6);
  pbox(g, 60, 330, 840, 760, { k: 6, fill: 'rgba(27,23,48,.95)' });
  g.fillStyle = '#2E9E4F'; g.fillRect(72, 342, 816, 96); g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(72, 342, 816, 6);
  ptext(g, '★ 红灯定律·开车卡 ★', 480, 410, 48, C.white, { align: 'center', sh: 1 });
  GUIDE.forEach(([id, s], i) => {
    const ta = S(id) - .25, pa = E.out(clamp((t - ta) / .25)); if (pa <= 0) return;
    const y = 540 + i * 118;
    withAlpha(g, pa, () => {
      g.fillStyle = C.ink; g.fillRect(96, y - 46, 60, 60); g.fillStyle = '#F4E9D8'; g.fillRect(102, y - 40, 48, 48);
      const tick = EN(id) + .02;
      if (t > tick) checkMark(g, 104, y - 32, 6, '#2E9E4F');
      prich(g, s, 180, y, 48, C.white, C.gold);
    });
  });
  // 卡片下半截：一小段街（112×32，6 倍），红灯前你们俩又并排了，他举着保温杯；第三条出来时他冒一句"又见面了～"
  {
    const mb = pbuf('gmini', 112, 32);
    mb.fillStyle = '#4A4470'; mb.fillRect(0, 0, 112, 32);
    for (let i = 0; i < 8; i++) { const bx = i * 15 - 3, hh = 6 + Math.round(hash(i, 21) * 7); prect(mb, bx, 13 - hh, 13, hh, ['#8E7FB0', '#B07AA0', '#9EA0C0'][i % 3]); for (let yy = 14 - hh; yy < 12; yy += 3) pdot(mb, bx + 3 + (yy % 6), yy, '#FFD98A'); }
    prect(mb, 0, 13, 112, 19, '#4B4F5C'); for (let x = 0; x < 112; x += 6) prect(mb, x, 23, 3, 1, '#C8C8C0');
    prect(mb, 10, 1, 1, 12, '#5E6573'); prect(mb, 8, 1, 5, 7, '#2B2F38'); pdisc(mb, 10, 3, 1, '#FF3B30');
    carSide(mb, 42, 22, { col: CAR_COL.him, drv: himO(t, { eyes: 'happy', mouth: 'smile', arms: 'upR' }), cup: true, cupDy: -1 + (Math.floor(t * 4) % 2), puff: t });
    carSide(mb, 40, 31, { col: CAR_COL.you, drv: youO(t, t > S('g3') ? { eyes: 'up', mouth: 'smile' } : {}), puff: t + .5 });
    g.save(); g.imageSmoothingEnabled = false;
    g.fillStyle = C.ink; g.fillRect(138, 834, 684, 204);
    g.drawImage(BUF.gmini, 0, 0, 112, 32, 144, 840, 672, 192);
    g.restore();
    if (t > S('g3') + .1) { popTag(g, t, S('g3') + .1, 700, 884, '又见面了～', 24, { fill: '#FFFFFF' }); pixArrow(g, 618, 884, 572, 884, 6, '#FFFFFF', 1); }
  }
  ptext(g, '建议由论文的模型推出 · 安全驾驶第一', 480, 1066, 24, '#9C93C0', { align: 'center' });
  g.restore();
}

/* ================= end：傍晚的红灯，绿灯一亮，一起开走 ================= */
function endScene(g, t) {
  const tg = CH('z1', 1) - .23, go = CH('z1', 2) - .1;
  duskStreet(g, t, {
    light: t > tg ? 'green' : 'red', num: t > tg ? 25 : 3 - Math.min(2, Math.floor(t - SS('end'))), go,
    himFace: { eyes: 'happy', mouth: 'smile', arms: 'upR' }, cupUp: true,
    youFace: t > S('z1') + .6 ? { eyes: 'happy', mouth: 'laugh', arms: 'upR' } : { eyes: 'up', mouth: 'smile' },
  });
  if (t < go + .6) speech(g, t, SS('end') + .2, go + .3, 470, 930, '一起走呗～', { px: 36 });
  if (t > S('z1') + .1) popTag(g, t, S('z1') + .1, 480, 560, '评论区：你被追上过几次？', 36, { fill: '#FFFFFF' });
}
function endCard(g, t) {
  duskStreet(g, t, { light: 'green', num: 20, go: SS('end') + 3 });
  g.fillStyle = 'rgba(10,8,24,.55)'; g.fillRect(0, 0, W, H);
  const p = E.out(clamp((t - SS('card') - .05) / .3));
  g.save(); g.globalAlpha *= p;
  pbox(g, 60, 500, 840, 520, { k: 6, fill: 'rgba(27,23,48,.94)' });
  ptext(g, '超过的车，总在红灯追上你？', 480, 610, 48, C.white, { align: 'center', sh: 1 });
  prich(g, '跑得快，{不如赶得巧}。', 480, 712, 48, C.white, C.gold, { align: 'center' });
  g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(130, 770, 700, 4);
  ptext(g, '甜菜  出品', 480, 846, 48, C.amber, { align: 'center' });
  ptext(g, '论文：Boland 2026《皇家学会开放科学》', 480, 920, 24, '#9C93C0', { align: 'center' });
  ptext(g, '画面、字幕、音效：Claude 用代码生成 · 配音：CosyVoice 3 合成', 480, 966, 24, '#9C93C0', { align: 'center' });
  g.restore();
}
