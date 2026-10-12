/* 第三组画面：脑内视图（幻觉是怎么来的）、修好之后、毕业典礼、结尾。 */

// ================= 脑内视图：幻觉 =================
function debugBg(t) {
  R(0, 0, LW, LH, '#020a05');
  p.fillStyle = '#0b3a1c';
  for (let x = 0; x < LW; x += 18) p.fillRect(x, 0, 1, 345);
  for (let y = 0; y < 345; y += 18) p.fillRect(0, y, LW, 1);
  // 透视地板
  p.fillStyle = '#16692f';
  for (let i = -8; i <= 8; i++) line(135, 250, 135 + i * 40, 345, '#0f4a22');
  for (let k = 0; k < 6; k++) { const y = 260 + ((k * 16 + t * 20) % 90); p.fillRect(0, Math.round(y), LW, 1); }
  floorDark('#020a05', '#000000');
}
const NEXT = [
  { tok: '这是', p: 62 }, { tok: '林黛玉', p: 18 }, { tok: '据说', p: 9 }, { tok: '我不知道', p: 0.3 },
];
const OUT_TOK = ['这是', '《红楼梦》', '中的', '经典', '情节', '！', '林黛玉', '虽然', '体弱多病', '…'];
SCENES.halluc = {
  lo(t, lt) {
    debugBg(t);
    const img = chibi('xiaomo', t >= T('x4') && t < T('x5') ? 'sweat' : 'normal', 'smile');
    const wf = wire(img, 'xiaomo-dbg', '#39ff88');
    const bob = Math.round(Math.sin(t * 3));
    put(wf, 135, 330 + bob, { scale: 2 });
    // 两个记忆节点
    const na = vis(t, T('x2') - 0.1, T('x3') - 0.1, 0.2);
    if (na > 0) {
      p.save(); p.globalAlpha = na;
      put(wire(chibi('daiyu', 'normal', 'smile'), 'daiyu-dbg', '#39ff88'), 60, 205, { scale: 1 });
      put(wire(PROP.tree(0), 'tree-dbg', '#39ff88'), 210, 210, { scale: 1 });
      const u = seg(t, T('x2') + 1.6, T('x2') + 2.4);
      for (let i = 0; i < 20; i++) if (i / 20 < u && i % 2 === 0) { line(lerp(80, 190, i / 20), 180, lerp(80, 190, (i + 1) / 20), 180, PAL.yellow); }
      for (let i = 0; i < 10; i += 2) { line(lerp(60, 135, i / 10), lerp(210, 250, i / 10), lerp(60, 135, (i + 1) / 10), lerp(210, 250, (i + 1) / 10), '#39ff88'); line(lerp(210, 135, i / 10), lerp(215, 250, i / 10), lerp(210, 135, (i + 1) / 10), lerp(215, 250, (i + 1) / 10), '#39ff88'); }
      p.restore();
    }
    // 故障条
    if (t < SCN.halluc.t0 + 0.5 || (t > CUE.stamp_x6 && t < CUE.stamp_x6 + 0.3)) {
      for (let i = 0; i < 10; i++) R(0, hash(i + Math.floor(t * 24)) * 345, LW, 1 + hash(i) * 4, i % 2 ? '#39ff88' : '#ff3a5a');
    }
  },
  hi(t, lt) {
    const G = PAL.dgreen;
    // 输入
    const pa = seg(t, SCN.halluc.t0 + 0.3, SCN.halluc.t0 + 0.6);
    g.save(); g.globalAlpha *= pa;
    g.strokeStyle = G; g.lineWidth = 4; g.setLineDash([12, 8]);
    g.strokeRect(48, 236, 984, 100); g.setLineDash([]);
    text('> 输入：' + typed('林黛玉倒拔垂杨柳，是怎么回事？', t, SCN.halluc.t0 + 0.6, SCN.halluc.t0 + 2.2), 76, 302, { size: 36, color: G });
    g.restore();
    // 记忆节点标签
    const na = vis(t, T('x2') - 0.1, T('x3') - 0.1, 0.2);
    if (na > 0) {
      tag('林黛玉 ·《红楼梦》', 240, 860, { size: 36, bg: '#0f4a22', color: G, align: 'center', alpha: na });
      tag('倒拔垂杨柳 ·《水浒传》', 840, 860, { size: 36, bg: '#0f4a22', color: G, align: 'center', alpha: na });
      const u = seg(t, T('x2') + 2.0, T('x2') + 2.3);
      if (u > 0) tag('都眼熟，拼起来！', 540, 640, { size: 48, bg: PAL.yellow, color: PAL.ink, align: 'center', alpha: na * u });
    }
    // 下一个词的概率
    const ba = vis(t, T('x3') - 0.1, T('x4') - 0.1, 0.2);
    if (ba > 0) {
      g.save(); g.globalAlpha *= ba;
      g.fillStyle = 'rgba(0,20,8,0.9)'; g.fillRect(48, 370, 984, 520);
      g.strokeStyle = G; g.lineWidth = 4; g.strokeRect(48, 370, 984, 520);
      text('下一个词（示意）', 80, 430, { size: 36, color: G });
      NEXT.forEach((n, i) => {
        const y = 470 + i * 78;
        const u = E.out(seg(t, T('x3') + 0.1 + i * 0.1, T('x3') + 0.9 + i * 0.1));
        text(n.tok, 80, y + 44, { size: 48, color: i === 0 ? PAL.yellow : G });
        g.fillStyle = '#0f4a22'; g.fillRect(320, y + 8, 560, 44);
        g.fillStyle = i === 0 ? PAL.yellow : G; g.fillRect(320, y + 8, Math.max(4, 560 * n.p / 70 * u), 44);
        text(n.p + '%', 1000, y + 44, { size: 36, color: G, align: 'right' });
      });
      // 生成的句子一块块长出来
      const k = Math.floor(seg(t, T('x3') + 1.2, TE('x3')) * OUT_TOK.length);
      let x = 80; g.font = FONTS.pix(36);
      OUT_TOK.slice(0, k).forEach((w, i) => {
        const ww = g.measureText(w).width + 16;
        if (x + ww > 1000) return;
        g.fillStyle = i === k - 1 ? PAL.yellow : '#1d7a3a'; g.fillRect(x, 812, ww, 52);
        text(w, x + 8, 852, { size: 36, color: i === k - 1 ? PAL.ink : '#d8ffe6' });
        x += ww + 8;
      });
      g.restore();
    }
    // 查证按钮：找不到
    const ca = vis(t, T('x4') - 0.1, T('x5') - 0.1, 0.2);
    if (ca > 0) {
      g.save(); g.globalAlpha *= ca;
      g.strokeStyle = G; g.lineWidth = 6; g.setLineDash([16, 10]); g.strokeRect(240, 440, 600, 200); g.setLineDash([]);
      text('[ 查证 ]', 540, 560, { f: 'blk', size: 84, color: '#1d7a3a', align: 'center' });
      if (t > T('x4') + 1.0 && Math.floor(t * 4) % 2) text('NOT FOUND', 540, 730, { size: 60, color: PAL.red, align: 'center' });
      g.restore();
    }
    // 考试：蒙一个 vs 白卷
    const ea = vis(t, T('x5') - 0.1, T('x6') + 0.4, 0.2);
    if (ea > 0) {
      g.save(); g.globalAlpha *= ea;
      [['蒙一个', '可能得分', PAL.yellow, '?'], ['交白卷', '一定 0 分', PAL.red, '']].forEach(([a, b, c, ans], i) => {
        const t0 = i ? T('x5') + 2.3 : T('x5') + 0.2;
        const u = seg(t, t0, t0 + 0.25);
        if (u <= 0) return;
        const x = 80 + i * 480, y = 380;
        g.save(); g.globalAlpha *= u;
        g.fillStyle = PAL.ink; g.fillRect(x - 4, y - 4, 448, 488);
        g.fillStyle = PAL.paper; g.fillRect(x, y, 440, 480);
        for (let j = 0; j < 5; j++) { g.fillStyle = '#d8d0ba'; g.fillRect(x + 40, y + 150 + j * 56, 360, 4); }
        text(a, x + 220, y + 90, { f: 'blk', size: 64, color: PAL.ink, align: 'center' });
        if (ans) text('答：C', x + 60, y + 196, { size: 48, color: PAL.blue2 });
        text(b, x + 220, y + 420, { f: 'blk', size: 56, color: c === PAL.yellow ? PAL.orange2 : c, align: 'center' });
        g.restore();
      });
      g.restore();
    }
    stamp('幻 觉', 540, 620, t, CUE.stamp_x6, { size: 160, rot: -8 });
    if (t >= CUE.stamp_x6 + 0.3) text('HALLUCINATION', 540, 860, { size: 48, color: PAL.red, align: 'center', alpha: seg(t, CUE.stamp_x6 + 0.3, CUE.stamp_x6 + 0.5) });
  },
};

// ================= 修好之后 =================
function fieldBg(t) {
  vgrad(0, 0, LW, 260, '#7fd0ff', '#d8f2ff');
  [[40, 60], [190, 40], [120, 90]].forEach(([x, y], i) => { const xx = (x + t * 4 * (i + 1)) % 300 - 20; ell(xx, y, 16, 5, '#fff'); ell(xx + 8, y - 3, 9, 5, '#fff'); });
  vgrad(0, 250, LW, 95, '#7ccf6a', '#4fa64a');
  for (let i = 0; i < 40; i++) P(hash(i) * LW, 260 + hash(i * 3) * 80, '#3f8a3a');
  floorDark('#2a5a2a', '#0e200e');
}
SCENES.fix = {
  lo(t, lt) {
    if (t < T('f3') - 0.3) {
      labBg(t);
      actor('xiaomo', t, 135, 296, { expr: t > T('f2') ? 'happy' : 'normal', scale: 2 });
      if (t > CUE.search + 0.2) put(PROP.magnifier(), 172, 260 + Math.round(Math.sin(t * 4)), { scale: 2 });
    } else if (t < T('f5') - 0.15) {
      roomBg(t); phoneLo(t);
    } else {
      fieldBg(t);
      // 远处：鲁智深扛着倒拔起来的树走过
      const lx = lerp(300, 170, seg(t, T('f5') - 0.2, SCN.fix.t1));
      put(PROP.tree(1), lx, 238, { scale: 1 });
      actor('lu', t, lx - 2, 262, { expr: 'happy', mouth: 'grin', bobSpeed: 10 });
      // 近处：林黛玉和好好长着的柳树
      put(PROP.tree(0), 70, 318, { scale: 2 });
      actor('daiyu', t, 130, 318, { expr: 'happy', mouth: 'smile', scale: 2 });
    }
  },
  hi(t, lt) {
    // 获得道具
    const items = [['获得道具：搜索', '先查，再答', CUE.search, T('f2') - 0.1], ['获得技能：说「我不确定」', '不会就说不会', T('f2') + 0.1, T('f3') - 0.3]];
    items.forEach(([a, b, t0, t1]) => {
      const ia = vis(t, t0, t1, 0.2);
      if (ia <= 0) return;
      const k = E.back(seg(t, t0, t0 + 0.3));
      g.save(); g.translate(540, 470); g.scale(k, k);
      panel(-440, -120, 880, 240, { alpha: ia, bg: '#3a2a6e', border: PAL.yellow });
      text(a, 0, -20, { size: 48, color: PAL.yellow, align: 'center', alpha: ia });
      text(b, 0, 70, { f: 'blk', size: 72, color: '#fff', align: 'center', alpha: ia, stroke: PAL.ink, sw: 10 });
      g.restore();
      sparkle(540, 470, t, t0, PAL.yellow, 12, 220);
    });
    if (t >= T('f2') && t < T('f3') - 0.3) bubble('我不确定，我查一下～', 700, 800, { size: 44, scale: E.back(seg(t, T('f2') + 0.3, T('f2') + 0.5)) });
    if (t >= T('f3') - 0.3 && t < T('f5') - 0.15) {
      phoneHi(t, [
        { side: 'U', text: '林黛玉倒拔垂杨柳，是怎么回事？', t0: CUE.send_f3 },
        { side: 'M', text: '倒拔垂杨柳的是{鲁智深}，出自《水浒传》第七回。林黛玉拔不动。', t0: CUE.recv_f4 + 0.6, t1: TE('f4'), chip: '已搜索 3 个网页', face: 'happy' },
      ], { typing: [CUE.send_f3 + 0.4, CUE.recv_f4 + 0.6], status: '在线' });
      const sa = seg(t, CUE.recv_f4, CUE.recv_f4 + 0.6);
      if (sa > 0 && sa < 1) tag('搜索中 ' + '.'.repeat(1 + Math.floor(t * 6) % 3), 540, 1180, { size: 36, bg: '#5a7bd6', align: 'center' });
    }
    if (t >= T('f5') - 0.15) {
      bubble('不用拔了～', 640, 840, { size: 48, scale: E.back(seg(t, T('f5'), T('f5') + 0.25)) });
      sparkle(520, 1000, t, CUE.levelup_f5, PAL.yellow, 10, 80);
      statPanel(t, [['靠谱', lerp(25, 85, E.out(seg(t, CUE.levelup_f5, CUE.levelup_f5 + 0.8))), PAL.yellow]], {
        alpha: vis(t, CUE.levelup_f5 - 0.1, SCN.fix.t1, 0.2), y: 230, pops: [[0, '+60', CUE.levelup_f5, PAL.yellow]],
      });
    }
  },
};

// ================= 毕业典礼 =================
const GRADS = [
  ['deepseek', 'DeepSeek', '服务器繁忙…'], ['gpt', 'ChatGPT', '出道最早'], ['claude', 'Claude', '代码写不停'],
  ['gemini', 'Gemini', '看图又听音'], ['doubao', '豆包', '名字最好吃'], ['kimi', 'Kimi', '能读200万字'],
  ['qwen', '通义千问', '开源全家桶'], ['llama', 'Llama', '开源羊驼'], ['grok', 'Grok', '自带毒舌'],
];
function gradPortrait(id, t, happy) {
  if (id === 'llama') {
    const k = 'llama-port';
    if (!PORT[k]) {
      const c = document.createElement('canvas'); c.width = 36; c.height = 36;
      const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(PROP.alpaca('n'), -4, -1); PORT[k] = c;
    }
    return PORT[k];
  }
  const ph = (t + hash(id.length * 7) * 3) % 3.3;
  return portraitOf(id, happy ? 'happy' : ph < 0.12 ? 'blink' : 'normal', happy ? 'open' : 'smile');
}
SCENES.grads = {
  lo(t, lt) {
    vgrad(0, 0, LW, 345, '#2a1a5e', '#120a2e');
    stars(t, 21, 40, 0, 300);
    floorDark('#120a2e', '#05030f');
  },
  hi(t, lt) {
    const t0 = SCN.grads.t0;
    // 横幅
    const k = E.back(seg(t, t0 + 0.1, t0 + 0.5));
    g.save(); g.translate(540, 210); g.scale(k, k);
    panel(-460, -70, 920, 140, { bg: PAL.red2, border: PAL.yellow });
    text('第一届 · 大模型毕业典礼', 0, 22, { f: 'blk', size: 64, color: '#fff', align: 'center', stroke: PAL.ink, sw: 8 });
    g.restore();
    // 小模的大卡片
    const xa = seg(t, t0 + 0.4, t0 + 0.7);
    g.save(); g.globalAlpha *= xa;
    panel(60, 330, 960, 200, { bg: '#1f4a4a', border: PAL.teal });
    g.imageSmoothingEnabled = false;
    g.drawImage(portraitOf('xiaomo', 'happy', 'open'), 92, 354, 152, 152);
    tag('1P', 92, 300, { size: 36, bg: PAL.red });
    text('小模', 280, 420, { f: 'blk', size: 72, color: '#fff' });
    text('刚毕业 · 偶尔胡说', 280, 492, { size: 36, color: PAL.teal });
    g.restore();
    // 同届同学
    GRADS.forEach(([id, name, trait], i) => {
      const c = i % 3, r = Math.floor(i / 3);
      const x = 60 + c * 330, y = 570 + r * 270;
      const ti = T('g1') + 0.1 + i * 0.62;
      const u = seg(t, ti, ti + 0.25);
      if (u <= 0) return;
      g.save(); g.translate(x + 150, y + 125); g.scale(E.back(u), 1); g.translate(-(x + 150), -(y + 125));
      const lit = t > T('g3') + i * 0.3 && t < T('g3') + i * 0.3 + 0.9;
      panel(x, y, 300, 250, { bg: '#211a40', border: lit ? PAL.yellow : PAL.cream });
      g.imageSmoothingEnabled = false;
      g.drawImage(gradPortrait(id, t, lit), x + 78, y + 14, 144, 144);
      text(name, x + 150, y + 196, { size: 36, color: '#fff', align: 'center' });
      const ta = seg(t, T('g3') + i * 0.3, T('g3') + i * 0.3 + 0.2);
      text(trait, x + 150, y + 236, { size: 36, color: PAL.orange, align: 'center', alpha: Math.max(0.0, ta) });
      g.restore();
    });
    // 彩带
    for (let i = 0; i < 60; i++) {
      const sp = 200 + hash(i) * 260, x = (hash(i * 3) * W + Math.sin(t * 2 + i) * 30) % W;
      const y = ((t - t0) * sp + hash(i * 7) * H) % (H + 100) - 50;
      g.fillStyle = ['#ff7aa8', '#ffe066', '#3fe0c8', '#4f7cff', '#ffb53b'][i % 5];
      g.fillRect(Math.round(x / 4) * 4, Math.round(y / 4) * 4, 12, (i % 2 ? 20 : 12));
    }
  },
};

// ================= 结尾 =================
SCENES.end = {
  lo(t, lt) {
    roomBg(t); phoneLo(t, { screen: '#f4f0ff' });
    const wave = Math.floor(t * 4) % 2;
    actor('xiaomo', t, 135, 300, { expr: t > T('e3') ? 'happy' : 'normal', mouth: 'smile', scale: 2 });
    // 挥手
    R(158, 236 + wave * 2, 8, 6, SKIN); R(158, 236 + wave * 2, 8, 1, PAL.ink);
  },
  hi(t, lt) {
    const sx = (PH.x + 6) * S, sy = (PH.y + 14) * S;
    g.fillStyle = '#ffffff'; g.fillRect(sx, sy, (PH.w - 12) * S, 92);
    g.drawImage(portraitOf('xiaomo', 'happy', 'smile'), sx + 24, sy + 14, 64, 64);
    text('小模', sx + 104, sy + 58, { size: 36, color: PAL.ink });
    bubble('下次见～', 640, 680, { size: 48, scale: E.back(seg(t, T('e2') + 0.5, T('e2') + 0.8)), alpha: seg(t, T('e2') + 0.5, T('e2') + 0.6) });
    stamp('以上内容由 AI 生成\n仅供参考', 540, 900, t, CUE.stamp_e3, { size: 76, rot: -7 });
    // 片尾字卡
    const ea = seg(t, TE('e3') + 0.4, TE('e3') + 0.8);
    if (ea > 0) {
      g.fillStyle = `rgba(20,15,38,${0.85 * ea})`; g.fillRect(0, 0, W, H);
      text('大模型养成计划', 540, 820, { f: 'blk', size: 110, color: PAL.yellow, align: 'center', alpha: ea, stroke: PAL.ink, sw: 14 });
      text('GAME CLEAR', 540, 940, { size: 60, color: PAL.teal, align: 'center', alpha: ea });
      text('甜菜 出品', 540, 1080, { size: 48, color: PAL.cream, align: 'center', alpha: ea });
    }
  },
};
