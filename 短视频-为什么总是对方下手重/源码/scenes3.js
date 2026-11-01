'use strict';
/* scenes3.js：回到打闹（你按出去的力，大脑静音了差不多一半；你觉得一样重，其实重了一截；对方也这样，就越打越重；
   "所以每次都是他先下狠手！"——他也是这么想你的）→ 大脑静音键的使用说明 → 结尾（同桌）→ 片尾。 */

/* ================= 回到打闹 ================= */
function back(g, t) {
  if (t < S('b2') - .15) { backPress(g, t); return; }
  backFight(g, t);
}
/* 一格格的力度条：(x, y) 左上，n 格里亮 v 格（可以是小数） */
function cells(g, x, y, n, v, col, o = {}) {
  const cw = o.cw || 52, ch = o.ch || 44;
  for (let i = 0; i < n; i++) {
    g.fillStyle = C.ink; g.fillRect(x + i * (cw + 6) - 6, y - 6, cw + 12, ch + 12);
    const f = clamp(v - i);
    g.fillStyle = o.empty || '#3B3363'; g.fillRect(x + i * (cw + 6), y, cw, ch);
    if (f > 0) { g.fillStyle = (o.over && i >= o.over) ? '#FF5A4F' : col; g.fillRect(x + i * (cw + 6), y, Math.round(cw * f / 6) * 6, ch); }
  }
}
/* 浅蓝方格纸："你"按"他"的手；大脑把"你按出去的力"静音一半 */
function backPress(g, t) {
  bgPaper(g, '#EEF4FC', 'rgba(90,120,190,.10)');
  const k = 11, yx = 250, hx = 720, by = 1180;
  popTag(g, t, SS('back') + .1, 480, 250, '打闹也一样', 44, { fill: C.gold });
  const tp = CH('b1', 1) - .25, tm = CH('b1', 2) - .2;
  const press = t > tp ? E.out(clamp((t - tp) / .3)) : 0;
  shadowAt(g, yx, by, k); shadowAt(g, hx, by, k);
  crabAt(g, yx, by, k, youO(t, press > .5 ? { eyes: 'n', mouth: 'smile' } : {}));
  crabAt(g, hx, by, k, himO(t, press > .5 ? { eyes: 'shut', mouth: 'o' } : {}), true);
  const gap = (hx - 12 * k - (yx + 12 * k)) / k;
  if (press > 0) reachArm(g, yx, by, k, lerp(1, gap + 1, press), C.clawd);
  if (press > .8) burst(g, hx - 12 * k, by - 11 * k, 40, 6, { text: '啪' });
  // 两根力度条：按出去的 vs 你感觉到的
  const pb = E.out(clamp((t - tp - .1) / .3));
  if (pb > 0) withAlpha(g, pb, () => {
    ptext(g, '你按出去的', 110, 360 + 40, 36, C.ink);
    cells(g, 380, 362, 8, 8 * clamp((t - tp) / .5), '#FF8A3D', { cw: 50 });
    ptext(g, '你感觉到的', 110, 470 + 40, 36, C.ink);
    const half = t > tm ? lerp(8, 4, E.io(clamp((t - tm) / .5))) : 8 * clamp((t - tp) / .5);
    cells(g, 380, 472, 8, half, '#9FD3FF', { cw: 50 });
  });
  // 大脑小窗：小人把"力"推子拉到一半
  const pz = pop(t, tm - .2, .35);
  if (pz > 0) {
    const bx = 330, byy = 760, r = 130;
    g.save(); g.translate(bx, byy); g.scale(pz, pz); g.translate(-bx, -byy);
    const vol = lerp(1, .5, E.io(clamp((t - tm) / .5)));
    brainRoom(g, bx, byy, r, t, { vol, mode: 'on', push: t < tm + .8, op: { eyes: 'happy' }, label: '力' });
    g.restore();
    popTag(g, t, tm + .35, 690, 760, '静音了差不多一半', 36, { fill: '#D3D0DE' });
  }
  source(g, 'Shergill 等 2003：另外 12 个人，用手指去对一样的力', 880, 1250);
}
/* 客厅："你觉得一样重，其实重了一截；对方也这样，就越打越重" */
function backFight(g, t) {
  const b = pbuf('lv2', 108, 192);
  livingBG(b, t);
  blit(g, 'lv2', 10);
  const t1 = CH('b2', 1) - .2, t2 = CH('b2', 2) - .2, t3 = CH('b2', 3) - .25;
  // 念着的时候只有画面；这句念完、对话框的时候才噼里啪啦（和 audio.py 对应）
  const hits = [[S('b2') + .05, 'him', 1], [CH('b2', 1) - .1, 'you', 1.5], [t2 + .2, 'him', 2.2], [t3 + .15, 'you', 2.8], [t3 + .5, 'him', 3.4],
    [EN('b2') + .05, 'you', 4], [S('d4') + .3, 'him', 4.6, true], [S('d4') + .62, 'you', 5.2, true], [S('d4') + .94, 'him', 5.8, true]];
  const blame = t > S('d4') - .05;
  brawl(g, t, hits, {
    face: (who, tt) => {
      if (hits.some(h => h[1] !== who && tt > h[0] && tt < h[0] + .35)) return { eyes: 'shut', mouth: 'o' };
      if (tt > S('b3') - .1) return who === 'him' ? { eyes: 'angry', mouth: 'grit', arms: 'upR' } : { eyes: 'wide', mouth: 'o', sweat: true };
      if (blame) return who === 'you' ? { eyes: 'angry', mouth: 'grit', arms: 'upR' } : { eyes: 'angry' };
      return { eyes: 'angry', mouth: 'grit' };
    },
  });
  // 上面：你觉得 vs 其实
  if (t > S('b2') - .15 && t < t3 + .1) {
    const a = E.out(clamp((t - S('b2') + .15) / .3)) * clamp((t3 + .1 - t) / .2);
    withAlpha(g, a, () => {
      pbox(g, 80, 300, 800, t > t2 ? 420 : 300, { k: 6, fill: 'rgba(255,255,255,.94)', rim: '#F4E9D8' });
      ptext(g, '他打你', 120, 390, 36, C.ink); cells(g, 340, 356, 8, 3, TONES.blue, { cw: 50, empty: '#E8E0D0' });
      ptext(g, '你还手', 120, 480, 36, C.ink);
      const real = t > t1 ? lerp(3, 4.4, E.out(clamp((t - t1) / .4))) : 3;
      cells(g, 340, 446, 8, real, '#FF8A3D', { cw: 50, empty: '#E8E0D0', over: 3 });
      ptext(g, t > t1 ? '其实' : '你觉得', 120, 540, 28, t > t1 ? '#E8443A' : '#7A86A8');
      if (t > t2) { ptext(g, '他再还手', 120, 640, 36, C.ink); cells(g, 340, 606, 8, lerp(4.4, 6.1, E.out(clamp((t - t2) / .4))), TONES.blue, { cw: 50, empty: '#E8E0D0', over: 4 }); }
    });
    if (t > t1) popTag(g, t, t1 + .2, 700, 560, '多了一截', 32, { fill: '#FFC2BE', t1: t3 + .1 });
  }
  if (t > EN('b2') - .05) bigStamp(g, t, EN('b2') - .05, 480, 520, '越打越重', { px: 84, rot: -.08 });
  dialogBox(g, t, 'd4', PORTRAIT.youMad);
  // 他也是这么想你的
  if (t > S('b3') - .1) {
    speech(g, t, S('b3') - .1, SE('back') + .3, 690, 920, '每次都是他先下狠手！', { px: 36, side: -120 });
  }
}

/* ================= 大脑静音键的使用说明 ================= */
function guide(g, t) {
  const b = pbuf('gd', 108, 192);
  livingBG(b, t);
  blit(g, 'gd', 10);
  // 两个人和好了，坐在地毯上
  crabAt(g, 330, 1190, 12, youO(t, { eyes: 'happy', mouth: 'smile', pose: 'sit' }));
  crabAt(g, 640, 1190, 12, himO(t, { eyes: 'happy', mouth: 'smile', pose: 'sit' }), true);
  g.fillStyle = 'rgba(20,14,40,.3)'; g.fillRect(0, 0, W, H);
  const pp = E.out(clamp((t - S('g1') + .3) / .4));
  if (pp > 0) {
    g.save(); g.translate(0, (1 - pp) * 500); g.globalAlpha *= pp;
    pbox(g, 60, 290, 840, 560, { k: 6 });
    g.fillStyle = '#3E9E4F'; g.fillRect(72, 302, 816, 72);
    ptext(g, '★ 大脑静音键 · 使用说明 ★', 480, 356, 48, C.white, { align: 'center', sh: 1 });
    ptext(g, '自己的动作，大脑会调小：', 110, 446, 32, '#CFC6E8');
    const rows = [
      [S('g2') - .2, '怕痒：手{搭在对方手上}', 550],
      [S('g3') - .2, '还手：只用你觉得的{一半力}', 650],
      [S('g4') - .2, '嫌他重：{你可能也一样}', 750],
    ];
    rows.forEach(([t0, s, y]) => {
      const u = pop(t, t0 - .16, .35); if (u <= 0) return;
      withAlpha(g, u, () => { g.fillStyle = C.green; g.fillRect(100, y - 32, 36, 36); g.fillStyle = C.ink; g.fillRect(106, y - 26, 24, 24); if (t > t0 + .4) checkMark(g, 104, y - 30, 4, C.green); prich(g, s, 160, y, 40, C.white, C.gold); });
    });
    source(g, '第 1 条：医生给怕痒的人检查时用的小技巧（Dobson 等 2016）', 880, 800, { px: 22, col: '#9C93C0' });
    source(g, '第 2、3 条：从实验推出来的建议', 880, 830, { px: 22, col: '#9C93C0' });
    g.restore();
  }
}

/* ================= 结尾：同桌 ================= */
/* 黑板上的粉笔字 */
function chalk(g) {
  ptext(g, '上课不许打闹！', 410, 560, 48, 'rgba(255,255,255,.85)', { align: 'center' });
  ptext(g, '值日：你、他', 410, 640, 36, 'rgba(255,233,168,.8)', { align: 'center' });
}
function endScene(g, t) {
  const b = pbuf('en', 108, 192);
  classroomBG(b, t);
  blit(g, 'en', 10);
  const k = 11, yx = 300, hx = 660, top = 1080, fy = top + 3 * k;
  chalk(g);
  // 两个人坐在课桌后面（露出上半身和红领巾），手肘越过中间那条线
  const nudge = Math.floor(t * 1.6) % 2;
  crabAt(g, yx, fy, k, youO(t, t > S('z1') + .3 ? { eyes: 'happy', mouth: 'smile' } : { eyes: nudge ? 'angry' : 'n' }));
  crabAt(g, hx, fy, k, himO(t, Object.assign({ scarf: true }, t > S('z1') + .3 ? { eyes: 'happy', mouth: 'smile' } : { eyes: nudge ? 'n' : 'angry' })), true);
  if (t < S('z1') + .3) {
    if (nudge) reachArm(g, yx, fy, k, 6, C.clawd, false, 8);
    else reachArm(g, hx, fy, k, 6, TONES.blue, true, 8);
  }
  schoolDesk(g, 480, top, k);
  dialogBox(g, t, 'd5', PORTRAIT.youShock);
  // 都说对方下手重 → 其实都没撒谎
  if (t > CH('z1', 1) - .2 && t < CH('z1', 3) - .2) {
    speech(g, t, CH('z1', 1) - .2, CH('z1', 3) - .3, yx, fy - 17 * k, '你先打的！', { px: 40 });
    speech(g, t, CH('z1', 1), CH('z1', 3) - .3, hx, fy - 17 * k, '你打得重！', { px: 40 });
  }
  if (t > CH('z1', 3) - .2) {
    const p = pop(t, CH('z1', 3) - .2, .35);
    g.save(); g.translate(480, 470); g.scale(p, p);
    pbox(g, -390, -120, 780, 240, { k: 6 });
    prich(g, '你俩可能', 0, -20, 48, C.white, C.gold, { align: 'center' });
    prich(g, '{都没撒谎}。', 0, 60, 48, C.white, C.gold, { align: 'center' });
    g.restore();
  }
}

/* ================= 片尾 ================= */
function endCard(g, t) {
  const b = pbuf('cd', 108, 192);
  classroomBG(b, t);
  blit(g, 'cd', 10);
  const k = 11, top = 1080;
  chalk(g);
  crabAt(g, 300, top + 3 * k, k, youO(t, { eyes: 'happy', mouth: 'smile', arms: 'upR' }));
  crabAt(g, 660, top + 3 * k, k, himO(t, { scarf: true, eyes: 'happy', mouth: 'smile', arms: 'upR' }), true);
  schoolDesk(g, 480, top, k);
  g.fillStyle = 'rgba(10,8,24,.45)'; g.fillRect(0, 0, W, H);
  const p = E.out(clamp((t - SS('card') - .05) / .3));
  g.save(); g.globalAlpha *= p;
  pbox(g, 60, 520, 840, 420, { k: 6, fill: 'rgba(27,23,48,.92)' });
  ptext(g, '为什么总是对方下手重？', 480, 640, 48, C.white, { align: 'center', sh: 1 });
  prich(g, '你俩可能{都没撒谎}。', 480, 740, 40, C.white, C.gold, { align: 'center' });
  g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(130, 790, 700, 4);
  ptext(g, '甜菜  出品', 480, 860, 36, C.amber, { align: 'center' });
  // 配音也是 AI 合成的，一并写明
  ptext(g, '画面、字幕、音效：Claude 用代码生成 · 配音：CosyVoice 3 合成', 480, 905, 24, '#9C93C0', { align: 'center' });
  g.restore();
}
