'use strict';
/* ui.js：游戏界面（直接画在屏幕上，像素单位 u 个屏幕像素）：对话框、选项菜单、提示条、获得道具、1P / 2P 状态栏、电量、读取条、报错窗。
   横屏 1920×1080 的安全区：四周 5%（x 96~1824、y 54~1026），右边 x>1650 且 y>256 会被按钮挡住；
   关键的字放在 x 96~1650、y 54~900，避开底部歌词那一条（y 920~1010）。 */
const UI = { fill: '#141A3A', fill2: '#1E2650', line: '#F4F1E8', shadow: '#05060F', text: '#FFFFFF', hi: '#FFE27A' };

/* 像素框：深色底、白边、四个角缺一格；(x, y, w, h) 屏幕坐标，u 一个像素多大 */
function uiBox(g, x, y, w, h, u = 6, o = {}) {
  x = ri(x / u) * u; y = ri(y / u) * u; w = ri(w / u) * u; h = ri(h / u) * u;
  const a = o.alpha ?? 1; if (a <= 0) return;
  g.save(); g.globalAlpha *= a;
  const line = o.line || UI.line, fill = o.fill || UI.fill;
  g.fillStyle = UI.shadow; g.fillRect(x + u, y + u, w, h);                       // 往右下错开一格的影子
  g.fillStyle = line; g.fillRect(x + u, y, w - 2 * u, h); g.fillRect(x, y + u, w, h - 2 * u);
  g.fillStyle = fill; g.fillRect(x + 2 * u, y + u, w - 4 * u, h - 2 * u); g.fillRect(x + u, y + 2 * u, w - 2 * u, h - 4 * u);
  if (o.inner !== false) { g.fillStyle = rgba('#FFFFFF', .08); g.fillRect(x + 2 * u, y + 2 * u, w - 4 * u, u); }
  g.restore();
  return { x, y, w, h };
}
/* 对话框：t0 开始打字，每秒 cps 个字；name 说话人小标签；返回打完的时刻 */
function uiDialog(g, t, t0, x, y, w, str, o = {}) {
  const k = o.k || 4, u = o.u || 6, cps = o.cps || 12, a = o.alpha ?? 1;
  const appear = E.out(seg(t, t0 - .25, t0)); if (appear <= 0 || a <= 0) return t0 + str.length / cps;
  const lines = str.split('\n'), lh = 14 * k, h = lines.length * lh + 6 * u;
  g.save(); g.globalAlpha *= a;
  const sy = y + (1 - appear) * 3 * u;
  uiBox(g, x, sy, w, h, u, { alpha: appear });
  let n = Math.floor((t - t0) * cps), shown = 0;
  lines.forEach((ln, j) => {
    const m = clamp(n - shown, 0, ln.length); shown += ln.length;
    if (m > 0) ptext(g, ln.slice(0, m), x + 4 * u, sy + 3 * u + j * lh, k, o.col || UI.text, { alpha: appear });
  });
  const done = t0 + str.replace(/\n/g, '').length / cps;
  if (o.name) { const nw = textW12(o.name) * 3 + 6 * u; uiBox(g, x + 3 * u, sy - 5 * u, nw, 7 * u, u, { alpha: appear, fill: o.nameFill || '#3B2F6E' }); ptext(g, o.name, x + 6 * u, sy - 3 * u, 3, UI.hi, { alpha: appear }); }
  if (t > done && Math.floor(t * 2.5) % 2 === 0) ptext(g, '▼', x + w - 7 * u, sy + h - 6 * u, 3, UI.text, { alpha: appear });
  g.restore();
  return done;
}
/* 选项菜单：items 文字数组，sel 当前选中第几个（可以是小数：光标在两项之间移动），blink 光标闪 */
function uiChoice(g, t, x, y, w, title, items, sel, o = {}) {
  const k = o.k || 4, u = o.u || 6, a = o.alpha ?? 1; if (a <= 0) return;
  const lh = 15 * k, th = title ? 16 * k : 0, h = th + items.length * lh + 5 * u;
  g.save(); g.globalAlpha *= a;
  uiBox(g, x, y, w, h, u, { fill: o.fill });
  if (title) ptext(g, title, x + 4 * u, y + 3 * u, k, UI.hi);
  items.forEach((it, j) => ptext(g, it, x + 4 * u + 12 * k, y + 3 * u + th + j * lh, k, o.dim && o.dim[j] ? '#8C90A8' : UI.text));
  const cy = y + 3 * u + th + sel * lh;
  if (!(o.blink && Math.floor(t * 4) % 2)) ptext(g, '▶', x + 4 * u, cy, k, o.cursorCol || UI.hi);
  if (o.picked != null) {                                 // 选中的那一项闪两下
    const u2 = t - o.picked;
    if (u2 >= 0 && u2 < .5 && Math.floor(u2 * 8) % 2 === 0) { g.fillStyle = rgba('#FFFFFF', .35); g.fillRect(x + 2 * u, cy - u, w - 4 * u, lh); }
  }
  g.restore();
}
/* 提示条：从上面滑下来停一会儿再收回去（ta 出现，tb 收回） */
function uiToast(g, t, ta, tb, str, o = {}) {
  const u = o.u || 6, k = o.k || 4;
  const a = E.out(seg(t, ta, ta + .25)) * (1 - E.in2(seg(t, tb - .25, tb))); if (a <= 0) return;
  const tw = textW12(str) * k, w = tw + 10 * u + (o.icon ? 14 * k : 0), h = 13 * k + 6 * u, cx = o.cx || 880;
  const y = (o.y || 150) - (1 - a) * 6 * u;
  g.save(); g.globalAlpha *= clamp(a * 1.5);
  uiBox(g, cx - w / 2, y, w, h, u, { fill: o.fill || UI.fill2, line: o.line });
  let x = cx - w / 2 + 5 * u;
  if (o.icon) { o.icon(g, x, y + 3 * u, k); x += 14 * k; }
  ptext(g, str, x, y + 3 * u + k, k, o.col || UI.text);
  g.restore();
}
/* 获得道具：框里一个图标（spr 小精灵）+ 一行字，出现时一圈闪光 */
function uiItemGet(g, t, ta, tb, spr, str, o = {}) {
  const u = o.u || 6, k = 4;
  const a = E.back(seg(t, ta, ta + .3)) * (1 - E.in2(seg(t, tb - .3, tb))); if (a <= 0) return;
  const cx = o.cx || 880, cy = o.cy || 420, tw = textW12(str) * k, w = tw + 26 * u, h = 22 * u;
  g.save();
  const s = clamp(a, 0, 1.1);
  g.translate(cx, cy); g.scale(1, s); g.translate(-cx, -cy);
  uiBox(g, cx - w / 2, cy - h / 2, w, h, u, { fill: '#2A1E52' });
  const ix = cx - w / 2 + 4 * u, iy = cy - spr.height * u / 2;
  g.imageSmoothingEnabled = false; g.drawImage(spr, ri(ix), ri(iy), spr.width * u, spr.height * u);
  ptext(g, str, ix + spr.width * u + 3 * u, cy - 6 * k, k, UI.text);
  g.restore();
  // 闪光：四角的小星星
  const sp = seg(t, ta, ta + .8);
  if (sp > 0 && sp < 1) for (let i = 0; i < 6; i++) {
    const ang = i / 6 * TAU + .3, rr = (w / 2 + 20) * E.out(sp);
    const x = cx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr * .5, al = 1 - sp;
    g.fillStyle = rgba('#FFF4B0', al); g.fillRect(ri(x) - u, ri(y), 3 * u, u); g.fillRect(ri(x), ri(y) - u, u, 3 * u);
  }
}
/* 1P / 2P 状态栏（回忆里，画面上方）。st：{p2: 'none' | 'wait' | 'on' | 'off', heart: 0..1, broken: 0..1, flash: 时刻}
   她的小头像在左，他的在右（x<1650，躲开右边的按钮），中间一颗心（满的程度 heart，broken 裂开） */
function uiHud(g, t, st, a = 1) {
  if (a <= 0) return;
  const y = 72;
  g.save(); g.globalAlpha *= a; g.imageSmoothingEnabled = false;
  // 左：1P
  ptext(g, '1P', 120, y, 3, '#FFB49A', { ol: UI.shadow });
  g.drawImage(smon({ col: COL.her, skirt: true }), 176, y - 18, 16 * 4, 13 * 4);
  // 右：2P
  const p2 = st.p2 || 'none';
  const p2a = p2 === 'on' ? 1 : p2 === 'off' ? .35 : p2 === 'wait' ? (Math.floor(t * 2) % 2 ? .8 : .25) : 0;
  ptext(g, '2P', 1620, y, 3, p2 === 'off' ? '#8890A8' : '#9AF0DC', { ol: UI.shadow, align: 'right', alpha: p2 === 'none' ? .35 : 1 });
  if (p2 === 'wait') ptext(g, '等待加入', 1490, y + 6, 2, '#C8D0E8', { align: 'right', alpha: p2a });
  if (p2a > 0 && p2 !== 'wait') {
    const s = p2 === 'off' ? silhouette(smon({ col: COL.him, cowlick: true }), '#5A607A', 'hud2') : smon({ col: COL.him, cowlick: true });
    g.drawImage(s, 1500, y - 18, 16 * 4, 13 * 4);
  }
  // 中间的心：外框 + 按 heart 从下往上填
  const hs = 6, hx = 960 - 33, hy = y - 8, H11 = heart11('#FF5A7A');
  const hv = clamp(st.heart ?? 0), br = clamp(st.broken ?? 0);
  const empty = silhouette(H11, '#3A3550', 'hudEmpty');
  if (br <= 0) {
    g.drawImage(empty, hx, hy, 11 * hs, 10 * hs);
    if (hv > 0) { const fh = Math.ceil(10 * hv); g.drawImage(H11, 0, 10 - fh, 11, fh, hx, hy + (10 - fh) * hs, 11 * hs, fh * hs); }
  } else {                                               // 裂成两半，往两边掉
    const off = ri(br * 3) * hs, drop = ri(br * br * 4) * hs;
    g.drawImage(H11, 0, 0, 5, 10, hx - off, hy + drop, 5 * hs, 10 * hs);
    g.drawImage(H11, 6, 0, 5, 10, hx + 6 * hs + off, hy + drop, 5 * hs, 10 * hs);
  }
  if (st.flash != null) { const f = seg(t, st.flash, st.flash + .5); if (f > 0 && f < 1) { g.globalAlpha = a * (1 - f); g.fillStyle = '#FFFFFF'; g.fillRect(hx - 6, hy - 6, 11 * hs + 12, 10 * hs + 12); } }
  g.restore();
}
/* 电量图标：level 0..1；blink 低电量时一闪一闪 */
function battery(g, x, y, s, level, t) {
  const low = level < .25;
  if (low && Math.floor(t * 3) % 2) return;
  prect(g, x, y, 10 * s, 5 * s, '#F4F1E8'); prect(g, x + s, y + s, 8 * s, 3 * s, '#141A3A'); prect(g, x + 10 * s, y + 1.5 * s, s, 2 * s, '#F4F1E8');
  const n = Math.ceil(level * 4);
  for (let i = 0; i < n; i++) prect(g, x + s + i * 2 * s, y + s, 2 * s - (i < 3 ? 0 : 0), 3 * s, low ? '#FF4A4A' : '#7BE07B');
}
/* 读取条 */
function loadingBar(g, x, y, w, u, p, label = '读取中') {
  uiBox(g, x, y, w, 15 * u, u);
  ptext(g, label + '…'.slice(0, 1), x + 4 * u, y + 3 * u, 3, UI.text);
  const bx = x + 4 * u, by = y + 9 * u, bw = w - 8 * u;
  prect(g, bx, by, bw, 3 * u, '#05060F');
  const n = Math.floor(p * (bw / (2 * u)));
  for (let i = 0; i < n; i++) prect(g, bx + i * 2 * u, by, u * 1.5, 3 * u, '#9AF0DC');
}
