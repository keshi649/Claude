'use strict';
/* scenes3.js：磨牙腾地方 → 进化错配 → 智齿攻略 → 结尾 → 片尾。 */

/* 深色"菜单"背景：网格慢慢滚动 */
function menuBG(g, t, tint = '#1E1A3A') {
  g.fillStyle = tint; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,.04)';
  for (let x = 0; x < W; x += 60) g.fillRect(x, 0, 2, H);
  for (let y = (t * 20) % 60; y < H; y += 60) g.fillRect(0, y, W, 2);
}

/* ================= 磨牙：前面的牙磨短了，整排往前挪 ================= */
function wearScene(g, t) {
  const modern = t > S('w3') - .2;
  const b = pbuf('site', SITE_W, SITE_H);
  siteBG(b, t, modern ? 'city' : 'savanna');
  const R = modern ? R_SHORT : 118;
  const wear = modern ? 0 : .5 * E.io(seg(t, S('w1') + .6, S('w2') + 1.6));
  const up = modern ? 0 : clamp((t - S('w2') - 1.4) / 1.4);
  const wis = modern ? { mode: 'stuck', ang: .95, face: 'sad', dy: 4 } : (up > 0 ? { mode: 'up', p: up, face: up >= 1 ? 'happy' : 'n' } : { mode: 'up', p: -.2, face: 'n' });
  drawSite(b, t, { R, wear, wis, crew: 'hidden', pal: wear > .05 ? 'worn' : 'real' });
  // 沙粒：落在牙面上
  if (!modern && t < S('w2') + .8) for (let i = 0; i < 26; i++) { const u = ((t * .8 + hash(i)) % 1), x = 20 + hash(i, 1) * 90, y = 100 + u * 32; pdot(b, x, y, hash(i, 2) < .5 ? '#B9935A' : '#8C6A3E'); }
  blit(g, 'site', 6, 0, CAMY);
  if (modern) slotOverlay(g, t, R, .9);           // 磨耗之后牙的位置变了，车位线只在现代那段画
  // 磨耗读数
  if (!modern) {
    const p = pop(t, S('w1') + .4, .35);
    if (p > 0) {
      g.save(); g.translate(300, 300); g.scale(p, p); pbox(g, -240, -60, 480, 120, { k: 6 });
      ptext(g, '磨耗', -200, 18, 48, C.gold);
      for (let k = 0; k < 5; k++) { g.fillStyle = k < Math.round(wear * 8) ? C.gold : '#3B3363'; g.fillRect(-60 + k * 56, -22, 44, 44); }
      g.restore();
    }
    // 往前挪的箭头
    const aa = win(t, S('w2') + .2, S('w3') - .3, .3, .2);
    if (aa > 0) withAlpha(g, aa, () => { for (let i = 0; i < 3; i++) { const x = SX(60 + i * 18) - ((t * 60) % 40), y = SY(JAW.gum - 36); g.fillStyle = C.amber; for (let j = 0; j < 5; j++) g.fillRect(x + j * 8, y - j * 8 + 32, 8, 8 + j * 16 - 32 + 32); } ptag(g, SX(70), SY(JAW.gum - 52), '整排往前挪', 36, { fill: C.amber }); });
    speech(g, t, S('w2') + 2.6, S('w3') - .4, SX(SLOT_X[7] + 6), SY(JAW.gum - 16), '空出来了！', { side: 40 });
  } else {
    // 现代的牙：亮晶晶，几乎不磨
    for (let i = 0; i < 4; i++) { const x = SX(SLOT_X[i * 2] + 3), y = SY(JAW.gum - 12); if (Math.floor(t * 4 + i) % 3 === 0) { g.fillStyle = '#FFFFFF'; g.fillRect(x, y - 12, 6, 30); g.fillRect(x - 12, y, 30, 6); } }
    const p = pop(t, S('w3') + .3, .35);
    if (p > 0) { g.save(); g.translate(300, 300); g.scale(p, p); pbox(g, -220, -60, 440, 120, { k: 6 }); ptext(g, '牙齿磨耗 ≈ 0', 0, 20, 48, '#9FD3FF', { align: 'center' }); g.restore(); }
  }
}

/* ================= 进化错配 ================= */
function mismatch(g, t) {
  const b = pbuf('site', SITE_W, SITE_H);
  siteBG(b, t, 'city');
  drawSite(b, t, { R: R_SHORT, wis: { mode: 'stuck', ang: .95, face: 'sad', dy: 4 }, crew: 'idle' });
  blit(g, 'site', 6, 0, CAMY);
  g.fillStyle = 'rgba(10,8,24,.6)'; g.fillRect(0, 0, W, H);
  const cp = pop(t, S('m1') - .05, .4);
  if (cp > 0) { g.save(); g.translate(540, 330); g.scale(cp, cp); ptext(g, '进化错配', 0, 40, 144, C.amber, { align: 'center', ol: C.ink, olw: 10, sh: 1 }); g.restore(); }
  const mp = pop(t, S('m2') - .1, .35);
  if (mp > 0) {
    g.save(); g.translate(540, 760); g.scale(mp, mp);
    sysWindow(g, -470, -260, 940, 470, '⚠ 版本不兼容', { bar: '#D9443B' });
    const rows = [['牙齿配置', '32 颗（老版本）', '#3B3363'], ['下巴车位', '28 个（软饭版）', '#3B3363'], ['状态', '智齿没地方停', '#D9443B']];
    rows.forEach(([a, v, col], i) => {
      const u = clamp((t - S('m2') - .3 - i * .45) / .2); if (u <= 0) return;
      withAlpha(g, u, () => { ptext(g, a, -410, -110 + i * 100, 48, '#6B6488'); ptext(g, v, -150, -110 + i * 100, 48, col); });
    });
    g.restore();
  }
}

/* ================= 智齿攻略 ================= */
function guide(g, t) {
  const b = pbuf('clinic', 135, 240);
  const fy = 96;                                   // 地板线：放高一点，让人物落在攻略面板上方
  pbands(b, 0, 135, [[0, '#CFE9E4'], [fy - 8, '#BFDDD6'], [fy, '#BFDDD6']], 2);
  prect(b, 0, fy, 135, 4, '#9FC4BB'); pbands(b, 0, 135, [[fy + 4, '#E8E2D4'], [240, '#D8D0BE']], 2);
  for (let x = 0; x < 135; x += 16) prect(b, x, fy + 4, 1, 240 - fy, '#CFC6B2');
  // 观片灯
  prect(b, 60, 10, 66, 40, '#4E5A6A'); prect(b, 62, 12, 62, 36, '#E8F2FF');
  // 牙椅
  prect(b, 10, fy - 26, 46, 6, '#3E7FC1'); prect(b, 48, fy - 44, 8, 24, '#3E7FC1'); prect(b, 26, fy - 20, 4, 20, '#9AA1AD'); prect(b, 18, fy - 2, 22, 3, '#7E8494');
  // 医生和病人
  drawSwollen(b, 20, fy - 42, t, { scarf: true, glasses: true });
  drawDentist(b, 84, fy - 16, t, { arms: t > S('g2') && t < S('g3') ? 'upL' : 'n' });
  blit(g, 'clinic', 8);
  const pb = pbuf('pano', PANO_W, PANO_H); drawPanoramic(pb, t, { stuck: true });
  g.save(); g.imageSmoothingEnabled = false; g.drawImage(BUF.pano, 0, 30, PANO_W, 100, 62 * 8, 14 * 8, 62 * 8, 32 * 8); g.restore();
  speech(g, t, S('g1') + .2, S('g2') - .2, 32 * 8, (fy - 42) * 8, '疼……要不要拔？', { side: 60 });
  // 攻略面板
  const pp = E.out(clamp((t - S('g2') + .3) / .4));
  if (pp > 0) {
    g.save(); g.translate(0, (1 - pp) * 500); g.globalAlpha *= pp;
    pbox(g, 40, 760, 1000, 470, { k: 6 });
    g.fillStyle = '#D9443B'; g.fillRect(52, 772, 976, 72);
    ptext(g, '★ 智齿攻略 ★', 540, 826, 48, C.white, { align: 'center', sh: 1 });
    const rows = [
      [S('g2') + .2, '先{拍片}，让牙医判断', ''],
      [S('g2') + 1.8, '长正了、不疼、刷得干净 → {先观察}', ''],
      [S('g3') + .1, '反复发炎、顶坏邻牙 → {该拔就拔}', ''],
      [S('g4') + .1, '孩子多嚼点？{可能}有帮助', '证据主要来自动物实验和考古'],
    ];
    rows.forEach(([t0, a, s], i) => {
      const u = pop(t, t0, .35); if (u <= 0) return;
      const y = 910 + i * 82;
      g.fillStyle = C.green; g.fillRect(76, y - 30, 34, 34); g.fillStyle = C.ink; g.fillRect(81, y - 25, 24, 24);
      withAlpha(g, u, () => { prich(g, a, 130, y, 40, C.white, C.gold); if (s) ptext(g, s, 130, y + 36, 24, '#CFC6E8'); });
    });
    g.restore();
  }
}

/* ================= 结尾：智齿的心里话 ================= */
function endScene(g, t) {
  const b = pbuf('end1', 108, 192);
  pbands(b, 0, 108, [[0, '#7CC8F2'], [70, '#B9E4F8'], [118, '#D3EEF8'], [124, '#D3EEF8']], 2);
  pbands(b, 0, 108, [[124, '#E3C46A'], [150, '#D3AE58'], [192, '#C09A48']], 2);
  // 放大的下巴后段：第二磨牙 + 卡住的智齿 + 后墙
  const ox = -58, oy = -75;
  b.save(); b.translate(ox, oy); drawJaw(b, R_SHORT); drawTeeth(b, { wis: { mode: 'stuck', ang: .95, face: 'sad', dy: 4 } }); b.restore();
  // 原始人走过来，递上一块肉干
  const kp = E.out(clamp((t - S('e1') - .3) / .8));
  if (kp > 0) { const x = Math.round(lerp(112, 80, kp)); feetShadow(b, x, 118); drawClawd(b, x, 102, { hat: 'bone', eyes: 'happy', arms: 'upL', legs: kp < 1 ? walkLegs(t, 8) : 0 }, true); pspr(b, FOOD.jerky(), x - 8, 97); }
  blit(g, 'end1', 10);
  speech(g, t, S('e0') + .2, S('e1') + 1.2, (SLOT_X[7] + ox + 6) * 10, (JAW.gum + oy + 2) * 10, '我没长错……只是来晚了。', { side: -160, px: 48 });
  if (kp >= 1) speech(g, t, S('e1') + 1.2, EN('e1') + .3, 900, 1000, '嚼嚼？', { side: -40 });
}

/* ================= 片尾 ================= */
function endCard(g, t) {
  const b = pbuf('card', 108, 192);
  drawSavanna(b, t, 108, 192, 120, { sunX: 54, sunY: 40 });
  const bob = i => Math.floor(t * 4 + i) % 2;
  feetShadow(b, 6, 146); drawClawd(b, 6, 130 - bob(0), { hat: 'bone', eyes: 'happy', arms: 'upR' }); pspr(b, FOOD.jerky(), 26, 128 - bob(0));
  feetShadow(b, 42, 146); drawSwollen(b, 42, 130 - bob(1), t, { scarf: true, glasses: true, eyes: 'happy' });
  feetShadow(b, 76, 146); drawDentist(b, 76, 130 - bob(2), t, { eyes: 'happy' });
  pspr(b, tooth('wis', 'real', 0, 'happy'), 47, 104 - bob(3) * 2);
  blit(g, 'card', 10);
  const gr = g.createRadialGradient(540, 400, 10, 540, 400, 700); gr.addColorStop(0, 'rgba(255,244,190,.6)'); gr.addColorStop(1, 'rgba(255,244,190,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, 1300);
  const p = E.out(clamp((t - SS('card') - .1) / .5));
  g.save(); g.globalAlpha *= p;
  pbox(g, 70, 560, 940, 420, { k: 6, fill: 'rgba(27,23,48,.9)' });
  ptext(g, '原始人为什么不用拔智齿？', 540, 680, 60, C.white, { align: 'center', sh: 1 });
  prich(g, '他们的下巴，是{嚼}大的。', 540, 790, 60, C.white, C.gold, { align: 'center' });
  g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(140, 840, 800, 4);
  ptext(g, '甜菜  出品', 540, 910, 36, C.amber, { align: 'center' });
  ptext(g, '画面、字幕、音效：Claude 用代码生成', 540, 952, 24, '#9C93C0', { align: 'center' });
  g.restore();
}
