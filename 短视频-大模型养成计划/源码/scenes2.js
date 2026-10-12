/* 第二组画面：基座模型（只会接龙）、支线任务 token、第二课微调、第三课人类打分。 */

// ================= 基座模型：只会接龙 =================
const CHAIN = ['今天', '天气', '怎么样', '？', '明天', '天气', '怎么样', '？', '后天', '天气', '怎么样', '？', '大后天', '天气', '怎么样', '？', '大大后天', '…'];
SCENES.base = {
  lo(t, lt) {
    labBg(t);
    let expr = 'normal', mouth = 'smile';
    if (t >= T('q3')) { expr = 'happy'; }
    if (t >= T('q4')) { expr = 'smug'; }
    actor('xiaomo', t, 135, 296, { expr, mouth, scale: 2, spk: 'M' });
  },
  hi(t, lt) {
    // 称号
    const ta = vis(t, T('q1') + 0.4, T('q2') - 0.1, 0.2);
    if (ta > 0) {
      const k = E.back(seg(t, T('q1') + 0.4, T('q1') + 0.7));
      g.save(); g.translate(540, 470); g.scale(k, k);
      panel(-380, -110, 760, 220, { alpha: ta, bg: '#3a2a6e', border: PAL.yellow });
      text('获得称号', 0, -30, { size: 48, color: PAL.yellow, align: 'center', alpha: ta });
      text('基座模型', 0, 70, { f: 'blk', size: 96, color: '#fff', align: 'center', alpha: ta, stroke: PAL.ink, sw: 12 });
      g.restore();
      sparkle(540, 470, t, T('q1') + 0.45, PAL.yellow, 12, 200);
    }
    if (t >= T('q2') - 0.2 && t < T('q3')) dialog('q2', t);
    if (t >= T('q3') - 0.2 && t < T('q4')) dialog('q3', t, { expr: 'happy' });
    // 接龙：词块一路排下去
    if (t >= T('q3') + 0.3) {
      const a = 1 - seg(t, SCN.base.t1 - 0.4, SCN.base.t1 - 0.1);
      const cols = 3, cw = 300, ch = 112;
      CHAIN.forEach((w, i) => {
        const t0 = T('q3') + 0.3 + i * 0.32;
        if (t < t0) return;
        const r = Math.floor(i / cols), c0 = i % cols, c = r % 2 ? cols - 1 - c0 : c0;
        const x = 90 + c * 330, y = 270 + r * 135;
        const k = E.back(seg(t, t0, t0 + 0.2));
        g.save(); g.globalAlpha *= a; g.translate(x + cw / 2, y + ch / 2); g.scale(k, k);
        const q = w === '？' || w === '…';
        g.fillStyle = PAL.ink; g.fillRect(-cw / 2 - 4, -ch / 2 - 4, cw + 8, ch + 8);
        g.fillStyle = q ? PAL.pink : i < 4 ? PAL.orange : PAL.cream; g.fillRect(-cw / 2, -ch / 2, cw, ch);
        text(w, 0, 22, { f: 'blk', size: 60, color: PAL.ink, align: 'center' });
        g.restore();
      });
      const la = seg(t, T('q4'), T('q4') + 0.3) * a;
      if (la > 0) tag('它在：接龙', 540, 1110, { size: 72, bg: PAL.pink2, align: 'center', alpha: la });
    }
  },
};

// ================= 支线任务：token =================
function questBg(t) {
  vgrad(0, 0, LW, 345, '#1d1640', '#0f0b24');
  p.fillStyle = '#2a2156';
  for (let x = (Math.floor(t * 8) % 16) - 16; x < LW; x += 16) p.fillRect(x, 0, 1, 345);
  for (let y = (Math.floor(t * 8) % 16) - 16; y < 345; y += 16) p.fillRect(0, y, LW, 1);
  floorDark('#0f0b24', '#07051a');
}
const STRAW = [['str', PAL.orange], ['aw', PAL.teal], ['berry', PAL.pink]];
SCENES.token = {
  lo(t, lt) {
    questBg(t);
    let expr = 'normal', mouth = 'smile';
    if (t > CUE.wrong_k4 && t < T('k6')) expr = 'x';
    if (t > CUE.wrong_k7) expr = 'sweat';
    actor('xiaomo', t, 135, 300, { expr, mouth, scale: 2, spk: 'M' });
    // 栽过这道题的模型们（灰色剪影，摔倒）
    const fa = vis(t, T('k5') - 0.1, T('k6') - 0.1, 0.2);
    if (fa > 0) {
      ['rater1', 'rater2', 'rater3', 'you'].forEach((n, i) => {
        const x = [34, 72, 198, 238][i];
        const t0 = T('k5') + 0.2 + i * 0.25;
        const fall = E.in(seg(t, t0, t0 + 0.3));
        const img = tinted(chibi(n, 'x', 'wave'), n, '#6a6490');
        p.save(); p.globalAlpha = fa;
        p.translate(x, 300); p.rotate((i % 2 ? -1 : 1) * fall * 0.35);
        p.drawImage(img, -img.width / 2, -img.height);
        p.restore();
      });
    }
  },
  hi(t, lt) {
    // 支线任务横幅
    const qa = vis(t, SCN.token.t0 + 0.1, T('k1') + 1.2, 0.2);
    if (qa > 0) {
      const k = E.back(seg(t, SCN.token.t0 + 0.1, SCN.token.t0 + 0.45));
      g.save(); g.translate(540, 300); g.scale(k, k);
      panel(-340, -60, 680, 120, { alpha: qa, bg: '#5a3a10', border: PAL.yellow });
      text('！ 支线任务：它眼里的字', 0, 18, { size: 48, color: PAL.yellow, align: 'center', alpha: qa });
      g.restore();
    }
    // strawberry
    const sa = vis(t, T('k1') + 0.8, T('k6') - 0.2, 0.2);
    if (sa > 0) {
      g.save(); g.globalAlpha *= sa;
      panel(60, 400, 960, 420, { bg: '#211a40' });
      hiSprite(PROP.strawberry(), 950, 470, 4);
      const chop = seg(t, CUE.chop, CUE.chop + 0.35);
      g.font = FONTS.blk(96);
      const parts = STRAW.map(([s]) => g.measureText(s).width);
      const gap = 60 * E.back(chop);
      const total = parts.reduce((a, b) => a + b, 0) + gap * 2;
      let x = 540 - total / 2;
      STRAW.forEach(([s, c], i) => {
        const w = parts[i];
        if (chop > 0) {
          g.fillStyle = PAL.ink; g.fillRect(x - 16, 470, w + 32, 140);
          g.fillStyle = c; g.globalAlpha = sa * chop; g.fillRect(x - 12, 474, w + 24, 132); g.globalAlpha = sa;
          text(`块${i + 1}`, x + w / 2, 660, { size: 36, color: c, align: 'center', alpha: chop });
        }
        text(s, x, 580, { f: 'blk', size: 96, color: chop > 0 ? PAL.ink : '#fff' });
        x += w + gap;
      });
      // 刀光
      const ka = vis(t, CUE.chop - 0.05, CUE.chop + 0.15, 0.05);
      if (ka > 0) { g.save(); g.globalAlpha = ka; g.fillStyle = '#fff'; g.translate(540, 540); g.rotate(-0.5); g.fillRect(-500, -6, 1000, 12); g.restore(); }
      text('它看到的是 TOKEN：一块一块的', 540, 730, { size: 36, color: PAL.gray, align: 'center', alpha: seg(t, CUE.chop + 0.3, CUE.chop + 0.6) * (1 - seg(t, CUE.wrong_k4, CUE.wrong_k4 + 0.2)) });
      // 揭晓：其实有 3 个 r
      const ra = seg(t, CUE.wrong_k4 + 0.3, CUE.wrong_k4 + 0.6);
      if (ra > 0) {
        const letters = [...'strawberry'];
        letters.forEach((c, i) => {
          const r = c === 'r';
          const xx = 180 + i * 80, yy = 770;
          text(c, xx, yy, { f: 'blk', size: 64, color: r ? PAL.red : PAL.gray, align: 'center', alpha: ra });
          if (r) { g.strokeStyle = PAL.red; g.lineWidth = 6; g.globalAlpha = sa * ra; g.strokeRect(xx - 30, yy - 62, 60, 80); g.globalAlpha = sa; }
        });
        tag('其实有 3 个 r', 540, 850, { size: 48, bg: PAL.red, align: 'center', alpha: ra });
      }
      g.restore();
    }
    if (t >= T('k3') - 0.2 && t < T('k4')) dialog('k3', t);
    if (t >= T('k4') - 0.2 && t < T('k5')) dialog('k4', t);
    bigMark('x', 860, 900, t, CUE.wrong_k4, 1.0);
    tag('不少模型都栽过', 540, 1160, { size: 60, bg: PAL.night3, align: 'center', alpha: vis(t, T('k5') + 0.3, T('k6') - 0.2, 0.2) });
    // 9.11 vs 9.9
    const na = vis(t, T('k6') - 0.2, SCN.token.t1 - 0.3, 0.2);
    if (na > 0) {
      g.save(); g.globalAlpha *= na;
      panel(60, 300, 960, 300, { bg: '#211a40' });
      text('9.11', 270, 490, { f: 'blk', size: 140, color: '#fff', align: 'center', stroke: PAL.ink, sw: 12 });
      text('VS', 540, 470, { size: 60, color: PAL.yellow, align: 'center' });
      text('9.9', 810, 490, { f: 'blk', size: 140, color: '#fff', align: 'center', stroke: PAL.ink, sw: 12 });
      g.restore();
      // 解释：版本号和日期
      const rows = [
        ['版本号', 'v9.9  →  v9.11', '新版本', PAL.sky],
        ['日 期', '9月9日 → 9月11日', '更晚', PAL.orange],
        ['数 学', '9.9  >  9.11', '正解', PAL.green],
      ];
      rows.forEach(([a, b, c, col], i) => {
        const t0 = T('k8') + 0.2 + i * 1.2;
        const ra = seg(t, t0, t0 + 0.2) * na;
        if (ra <= 0) return;
        const y = 640 + i * 150;
        panel(60, y, 960, 120, { alpha: ra, bg: i === 2 ? '#1d3a2a' : '#2b2453', border: col });
        text(a, 110, y + 78, { size: 48, color: col, alpha: ra });
        text(b, 300, y + 80, { f: 'blk', size: 56, color: '#fff', alpha: ra });
        text(c, 980, y + 78, { size: 36, color: col, align: 'right', alpha: ra });
      });
    }
    if (t >= T('k6') - 0.2 && t < T('k7')) dialog('k6', t);
    if (t >= T('k7') - 0.2 && t < T('k8')) dialog('k7', t, { expr: 'happy' });
    bigMark('x', 860, 900, t, CUE.wrong_k7, 0.9);
  },
};

// ================= 第二课：微调 =================
function classroomBg(t) {
  vgrad(0, 0, LW, 300, '#e8d9b0', '#cdb98c');
  R(0, 280, LW, 20, '#b49c6a');
  // 黑板
  R(14, 54, 242, 122, PAL.wood0); R(18, 58, 234, 114, '#2f5a46'); dither(18, 58, 234, 114, '#386a53', 0.25);
  R(18, 172, 234, 4, PAL.wood2); R(60, 170, 8, 2, '#fff'); R(80, 170, 5, 2, '#ffd6e5');
  // 窗
  R(4, 190, 40, 60, PAL.wood0); R(6, 192, 36, 56, '#9fd8ff'); R(23, 192, 2, 56, PAL.wood0); R(6, 219, 36, 2, PAL.wood0);
  // 地板
  for (let i = 0; i < 9; i++) R(i * 32, 300, 31, 45, i % 2 ? PAL.wood2 : PAL.wood3);
  floorDark('#3a2118', '#140a06');
}
const QA_CARDS = [
  ['问：泡面怎么煮？', '答：水开下面，煮三分钟。'],
  ['问：帮我写个请假条', '答：好的，以下是请假条……'],
  ['问：hello 是什么意思？', '答：「你好」。'],
];
SCENES.sft = {
  lo(t, lt) {
    classroomBg(t);
    const tap = Math.sin(t * 8) > 0 && t > T('s2') && t < TE('s3');
    put(PROP.catTeacher(), 50, 300 - (tap ? 1 : 0), { scale: 2 });
    let expr = 'normal', mouth = 'smile';
    if (t >= CUE.levelup_s3) expr = 'happy';
    if (t >= T('s5')) { expr = 'normal'; }
    actor('xiaomo', t, 190, 300, { expr, mouth, scale: 2, spk: 'M' });
    // 「助手」胸牌
    if (t >= CUE.levelup_s3) { R(196, 252, 18, 9, PAL.ink); R(197, 253, 16, 7, PAL.yellow); R(199, 255, 12, 1, PAL.orange2); R(199, 257, 8, 1, PAL.orange2); }
  },
  hi(t, lt) {
    lessonCard(t, T('s1') - 0.2, TE('s1') + 0.1, '微调 · 上岗培训', 'LESSON 02 · 第二课', PAL.orange);
    // 黑板上的内容
    const bx = 18 * S, by = 58 * S, bw = 234 * S, bh = 114 * S;
    if (t >= T('s2') - 0.1 && t < T('s3')) {
      const i = clamp(Math.floor((t - T('s2')) / 1.0), 0, 2);
      const [q, a] = QA_CARDS[i];
      const ca = seg(t, T('s2') - 0.1, T('s2') + 0.1);
      text(q, bx + 48, by + 130, { size: 48, color: '#fff', alpha: ca });
      text(a, bx + 48, by + 230, { size: 48, color: '#ffe680', alpha: ca });
      tag(`第 ${(i + 1) * 3271} 份`, bx + bw - 40, by + 300, { size: 36, bg: PAL.orange2, align: 'right', alpha: ca });
    }
    if (t >= T('s3') - 0.1 && t < SCN.sft.t1) {
      const ca = seg(t, T('s3') - 0.1, T('s3') + 0.1);
      text('别接龙了！', bx + bw / 2, by + 150, { f: 'blk', size: 84, color: '#fff', align: 'center', alpha: ca });
      text('你现在是个 助手', bx + bw / 2, by + 300, { f: 'blk', size: 72, color: '#ffe680', align: 'center', alpha: seg(t, T('s3') + 0.8, T('s3') + 1.0) });
    }
    // 飞来的问答卡片堆
    if (t >= T('s2') && t < T('s4')) {
      for (let k = 0; k < 18; k++) {
        const t0 = T('s2') + 0.1 + k * 0.16, u = seg(t, t0, t0 + 0.4);
        if (u <= 0) continue;
        const x = lerp(k % 2 ? -100 : 1180, 860, E.out(u)), y = lerp(500, 1060 - k * 10, E.out(u));
        g.save(); g.translate(x, y); g.rotate((hash(k) - 0.5) * 0.3);
        g.fillStyle = PAL.ink; g.fillRect(-84, -52, 168, 104); g.fillStyle = PAL.paper; g.fillRect(-80, -48, 160, 96);
        g.fillStyle = PAL.teal2; g.fillRect(-64, -28, 60, 12); g.fillStyle = PAL.gray; g.fillRect(-64, 0, 120, 8); g.fillRect(-64, 16, 90, 8);
        g.restore();
      }
      tag('× 成千上万', 860, 1110, { size: 48, bg: PAL.night3, align: 'center', alpha: seg(t, T('s2') + 1.2, T('s2') + 1.4) * (1 - seg(t, T('s3') + 1, T('s3') + 1.2)) });
    }
    sparkle(760, 1000, t, CUE.levelup_s3, PAL.yellow, 10, 60);
    if (t >= CUE.levelup_s3 && t < CUE.levelup_s3 + 1.6) tag('LEVEL UP!', 760, 760, { size: 48, bg: PAL.green2, align: 'center', alpha: vis(t, CUE.levelup_s3, CUE.levelup_s3 + 1.3, 0.15) });
    statPanel(t, [['礼貌', lerp(8, 70, E.out(seg(t, CUE.levelup_s3, CUE.levelup_s3 + 0.8))), PAL.green]], {
      alpha: vis(t, CUE.levelup_s3 - 0.3, TE('s4'), 0.2), y: 760, x: 40, pops: [[0, '+60', CUE.levelup_s3, PAL.green]],
    });
    // 成就：经典台词
    const aa = vis(t, CUE.ding_s5 + 0.2, SCN.sft.t1 - 0.2, 0.2);
    if (aa > 0) {
      const k = E.back(seg(t, CUE.ding_s5 + 0.2, CUE.ding_s5 + 0.5));
      g.save(); g.translate(540, 760); g.scale(k, k);
      panel(-360, -70, 720, 140, { alpha: aa, bg: '#5a3a10', border: PAL.yellow });
      g.fillStyle = PAL.yellow; g.globalAlpha *= aa;
      g.fillRect(-300, -30, 48, 36); g.fillRect(-288, 6, 24, 12); g.fillRect(-300, 18, 48, 8);
      text('成就解锁：经典台词', 40, 18, { size: 48, color: PAL.yellow, align: 'center' });
      g.restore();
    }
    if (t >= T('s5') - 0.2) dialog('s5', t, { expr: 'normal' });
  },
};

// ================= 第三课：人类打分 =================
function stageBg(t, alarm) {
  vgrad(0, 0, LW, 300, '#2a1240', '#140826');
  // 聚光灯
  [[60, 1], [210, -1]].forEach(([x, d]) => {
    p.save(); p.globalAlpha = 0.12; poly([[x - 6, 0], [x + 6, 0], [x + 50 * d + 40, 300], [x + 50 * d - 40, 300]], alarm ? '#ff6070' : '#fff6c8'); p.restore();
  });
  // 幕布
  for (let i = 0; i < 4; i++) { R(i * 8, 0, 7, 300, i % 2 ? '#a82634' : '#c8303f'); R(LW - 32 + i * 8, 0, 7, 300, i % 2 ? '#a82634' : '#c8303f'); }
  R(0, 0, LW, 16, '#8a1f2b'); for (let i = 0; i < 27; i++) ell(5 + i * 10, 16, 5, 4, '#8a1f2b');
  // 灯泡边框
  for (let i = 0; i < 20; i++) P(40 + i * 10, 24, Math.floor(t * 4 + i) % 2 ? PAL.yellow : '#7a5a20');
  // 舞台
  R(0, 296, LW, 6, '#5a2a1a'); for (let i = 0; i < 9; i++) R(i * 32, 302, 31, 43, i % 2 ? '#7a3a24' : '#8a4a2e');
  floorDark('#2a120a', '#0e0604');
  // 评委桌
  R(4, 262, 120, 40, PAL.ink); R(6, 264, 116, 36, '#3a3360'); R(6, 264, 116, 4, '#5a5480');

}
SCENES.rlhf = {
  lo(t, lt) {
    const alarm = t >= CUE.alarm - 0.3;
    stageBg(t, alarm);
    // 评委：举牌
    ['rater1', 'rater2', 'rater3'].forEach((n, i) => {
      const x = 24 + i * 40;
      const cheer = (t > CUE.vote && t < CUE.vote + 1.6) || (t > CUE.clap - 0.6 && t < T('r6') + 1);
      actor(n, t, x, 268, { expr: cheer ? 'happy' : 'normal', mouth: cheer ? 'open' : 'smile', phase: i, bobSpeed: cheer ? 12 : 3 });
      if (cheer) put(PROP.thumb(1), x + 10, 214 + (Math.sin(t * 12 + i) > 0 ? -1 : 0));
    });
    let expr = 'normal', mouth = 'smile';
    if (t >= T('r5') - 0.1 && t < T('r6') + 1) { expr = 'star'; }
    if (t >= T('r7')) expr = 'sweat';
    actor('xiaomo', t, 196, 296, { expr, mouth, scale: 2, spk: 'M' });
    // 警报灯
    if (alarm) {
      const on = Math.floor(t * 6) % 2;
      R(127, 30, 16, 6, PAL.ink); ell(135, 30, 8, 8, on ? PAL.red : PAL.red2); P(132, 26, '#fff');
      if (on) { p.save(); p.globalAlpha = 0.15; R(0, 0, LW, 345, PAL.red); p.restore(); }
    }
  },
  hi(t, lt) {
    lessonCard(t, T('r1') - 0.2, TE('r1') + 0.1, '人类打分', 'LESSON 03 · 第三课', PAL.pink);
    text('评委席', 64 * S, 284 * S, { size: 36, color: PAL.cream, align: 'center' });
    // 两个回答
    const ca = vis(t, T('r2') - 0.1, T('r4') - 0.2, 0.2);
    if (ca > 0) {
      const win = t > CUE.vote;
      [['A', '这个问题嘛，首先，其次，再其次，总而言之……', PAL.gray], ['B', '一句话说清楚，还附了例子。', PAL.teal]].forEach(([k, s, col], i) => {
        const x = 80 + i * 480, y = 300;
        const won = win && i === 1;
        const sc = won ? 1 + 0.06 * E.back(seg(t, CUE.vote, CUE.vote + 0.3)) : 1;
        g.save(); g.translate(x + 200, y + 190); g.scale(sc, sc); g.translate(-(x + 200), -(y + 190));
        panel(x, y, 400, 380, { alpha: ca * (win && i === 0 ? 0.5 : 1), bg: '#211a40', border: won ? PAL.yellow : PAL.cream });
        text('回答 ' + k, x + 200, y + 76, { size: 48, color: col, align: 'center', alpha: ca });
        const rows = wrapRich(rich(s), 'pix', 36, 320);
        rows.forEach((r, j) => drawRichLine(r, x + 40, y + 150 + j * 52, { f: 'pix', size: 36, color: PAL.cream, hi: PAL.orange }));
        g.restore();
        if (won) {
          for (let j = 0; j < 5; j++) hiSprite(PROP.coin(), x + 120 + j * 40, y + 360 - E.back(seg(t, CUE.vote + j * 0.08, CUE.vote + 0.3 + j * 0.08)) * 60, 6, { alpha: ca });
          tag('+1 分', x + 200, y - 70, { size: 48, bg: PAL.green2, align: 'center', alpha: ca * seg(t, CUE.vote, CUE.vote + 0.2) });
        }
      });
    }
    // 人类爱听好话：爱心
    const ha = vis(t, T('r3') - 0.1, T('r4') - 0.1, 0.2);
    if (ha > 0) {
      tag('夸人 = 高分', 540, 760, { size: 72, bg: PAL.pink2, align: 'center', alpha: ha });
      for (let i = 0; i < 12; i++) {
        const t0 = T('r3') + i * 0.15, u = seg(t, t0, t0 + 1.4);
        if (u <= 0 || u >= 1) continue;
        hiSprite(PROP.heart(), 120 + hash(i) * 400, 1040 - u * 500, 8, { alpha: 1 - u });
      }
    }
    if (t >= T('r4') - 0.2 && t < T('r5')) dialog('r4', t);
    if (t >= T('r5') - 0.2 && t < T('r6')) dialog('r5', t, { expr: 'star' });
    statPanel(t, [['嘴甜', lerp(30, 100, E.out(seg(t, CUE.clap, CUE.clap + 0.5))), PAL.pink]], {
      alpha: vis(t, T('r5') + 1, T('r7'), 0.2), y: 300, x: 40, pops: [[0, '+999', CUE.clap, PAL.pink]],
    });
    // 谄媚
    stamp('谄 媚', 540, 640, t, T('r6') + 0.15, { size: 150, rot: -8, alpha: 1 - seg(t, T('r7') - 0.1, T('r7') + 0.2) });
    if (t >= T('r6') + 0.4 && t < T('r7')) text('SYCOPHANCY', 540, 860, { size: 48, color: PAL.red, align: 'center', alpha: seg(t, T('r6') + 0.4, T('r6') + 0.6) });
    // 紧急撤回
    const aa = vis(t, CUE.alarm - 0.2, SCN.rlhf.t1, 0.2);
    if (aa > 0) {
      g.save(); g.globalAlpha *= aa;
      panel(80, 330, 920, 460, { bg: '#3a0d14', border: PAL.red });
      g.fillStyle = PAL.yellow; g.beginPath(); g.moveTo(540, 380); g.lineTo(600, 480); g.lineTo(480, 480); g.fill();
      text('!', 540, 470, { f: 'blk', size: 72, color: PAL.ink, align: 'center' });
      text('紧急撤回', 540, 590, { f: 'blk', size: 96, color: '#fff', align: 'center', stroke: PAL.ink, sw: 10 });
      text('2025 年 4 月 · GPT-4o 的一次更新', 540, 670, { size: 36, color: PAL.cream, align: 'center' });
      text('原因：太爱拍马屁', 540, 730, { size: 36, color: PAL.pink, align: 'center' });
      const u = seg(t, CUE.alarm + 0.8, SCN.rlhf.t1 - 0.6);
      g.fillStyle = PAL.ink; g.fillRect(180, 820, 720, 56); g.fillStyle = PAL.red2; g.fillRect(188, 828, 704 * u, 40);
      text('回滚中 ' + Math.round(u * 100) + '%', 540, 862, { size: 36, color: '#fff', align: 'center' });
      g.restore();
    }
  },
};
