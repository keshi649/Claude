'use strict';
/* art4.js：结尾部分用到的画法 —— 旋钮、月亮、鸡蛋、体重秤、医院、树、日历、双胞胎 */

function iconKnob(g, x, y, s, val, col = C.fat) {           // val 0..1：音量旋钮，指针从 -135° 转到 +135°
  g.save(); g.translate(x, y); g.scale(s, s);
  for (let i = 0; i <= 10; i++) { const a = -Math.PI * .75 + i / 10 * Math.PI * 1.5, on = i / 10 <= val + .001; g.strokeStyle = on ? col : 'rgba(160,190,235,.35)'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(Math.cos(a) * 92, Math.sin(a) * 92); g.lineTo(Math.cos(a) * 110, Math.sin(a) * 110); g.stroke(); }
  circ(g, 0, 0, 78); const gr = g.createRadialGradient(-24, -28, 6, 0, 0, 80); gr.addColorStop(0, '#6A7FA8'); gr.addColorStop(1, '#2A3858'); fs(g, gr, '#9FB4DA', 4);
  const a = -Math.PI * .75 + val * Math.PI * 1.5; g.strokeStyle = col; g.lineWidth = 10; g.beginPath(); g.moveTo(Math.cos(a) * 18, Math.sin(a) * 18); g.lineTo(Math.cos(a) * 66, Math.sin(a) * 66); g.stroke();
  g.restore();
}
function iconMoon(g, x, y, s = 1, t = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.arc(0, 0, 62, Math.PI * .22, Math.PI * 1.78); g.bezierCurveTo(10, -50, 10, 50, 40, 36); g.closePath();
  const gr = g.createLinearGradient(-40, -50, 40, 50); gr.addColorStop(0, '#FFF3BE'); gr.addColorStop(1, '#F4C84A'); fs(g, gr, '#C99A1C', 4);
  for (let i = 0; i < 3; i++) text(g, 'z', 60 + i * 26, -50 - i * 26 - Math.sin(t * 2 + i) * 4, 30 + i * 8, '#BFD0F0', 'fun');
  g.restore();
}
function iconEgg(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.moveTo(0, -64); g.bezierCurveTo(52, -56, 62, 40, 0, 62); g.bezierCurveTo(-62, 40, -52, -56, 0, -64); g.closePath(); fs(g, '#FFFDF3', '#D8D2C0', 4);
  circ(g, 0, 6, 22); const gr = g.createRadialGradient(-6, 0, 2, 0, 6, 24); gr.addColorStop(0, '#FFE27A'); gr.addColorStop(1, '#FFAA1E'); fs(g, gr, null);
  g.restore();
}
function iconClock(g, x, y, s = 1, t = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  circ(g, 0, 0, 64); fs(g, '#F2F6FF', '#6A7FA8', 6);
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.strokeStyle = '#6A7FA8'; g.lineWidth = i % 3 ? 3 : 5; g.beginPath(); g.moveTo(Math.cos(a) * 50, Math.sin(a) * 50); g.lineTo(Math.cos(a) * 58, Math.sin(a) * 58); g.stroke(); }
  g.strokeStyle = '#2A3858'; g.lineWidth = 6; g.lineCap = 'round'; const ah = t * .6 - Math.PI / 2, am = t * 7.2 - Math.PI / 2;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(ah) * 30, Math.sin(ah) * 30); g.stroke(); g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(am) * 44, Math.sin(am) * 44); g.stroke();
  g.restore();
}
function iconScale(g, x, y, s = 1, ang = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  rr(g, -74, -50, 148, 100, 20); fs(g, '#E6EDF9', '#7F93BA', 5);
  g.beginPath(); g.arc(0, -4, 40, Math.PI, 0); g.closePath(); fs(g, '#FFFFFF', '#7F93BA', 3);
  const a = Math.PI + .3 + ang; g.strokeStyle = C.red; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -4); g.lineTo(Math.cos(a) * 34, -4 + Math.sin(a) * 34); g.stroke();
  rr(g, -58, 22, 116, 14, 7); fs(g, '#C8D4EA', null);
  g.restore();
}
function iconHospital(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  rr(g, -86, -64, 172, 140, 12); fs(g, '#F2F6FF', '#7F93BA', 5);
  rr(g, -32, 30, 64, 46, 6); fs(g, '#9DB4DD', '#5C78B0', 3);
  for (const [wx, wy] of [[-62, -4], [48, -4], [-62, 34], [48, 34]]) { rr(g, wx, wy, 24, 22, 4); fs(g, '#BFD6F5', '#7F93BA', 2.5); }
  rr(g, -16, -52, 32, 84, 6); g.fillStyle = C.red; g.fill(); rr(g, -38, -30, 76, 32, 6); g.fill();
  g.restore();
}
/* 树：树干 + 一团树冠。leaf：树冠绿的程度 0 光秃 → 1 繁茂 */
function iconTree(g, x, y, s = 1, leaf = 1, t = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.moveTo(-26, 0); g.lineTo(-18, -190); g.lineTo(18, -190); g.lineTo(26, 0); g.closePath(); fs(g, '#8A5B34', '#5A3A1C', 5);
  g.strokeStyle = '#8A5B34'; g.lineWidth = 16; g.lineCap = 'round';
  g.beginPath(); g.moveTo(0, -150); g.lineTo(-90, -250); g.moveTo(0, -160); g.lineTo(96, -262); g.moveTo(-10, -180); g.lineTo(-10, -290); g.stroke();
  const r = R(7);
  for (let i = 0; i < 16; i++) {
    const a = r() * TAU, d = 40 + r() * 120, cx = Math.cos(a) * d * 1.1, cy = -290 + Math.sin(a) * d * .75, rad = 48 + r() * 30, k = clamp(leaf * 1.4 - r() * .4);
    if (k <= 0) continue; circ(g, cx + Math.sin(t * .8 + i) * 2, cy, rad * k); const gr = g.createRadialGradient(cx - 14, cy - 18, 4, cx, cy, rad); gr.addColorStop(0, '#9BE89F'); gr.addColorStop(1, '#2F9A58'); g.fillStyle = gr; g.fill();
  }
  g.restore();
}
/* 一对双胞胎（两个一模一样的小人），col 是这一对的颜色 */
function twinPair(g, x, y, s, col, a = 1) {
  g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha *= a;
  for (const dx of [-20, 20]) { circ(g, dx, -22, 12); g.fillStyle = col; g.fill(); g.beginPath(); g.moveTo(dx - 15, 20); g.quadraticCurveTo(dx - 17, -6, dx, -6); g.quadraticCurveTo(dx + 17, -6, dx + 15, 20); g.closePath(); g.fill(); }
  g.restore();
}
/* 日历翻页 */
function iconCalendar(g, x, y, s, label, p = 1) {
  g.save(); g.translate(x, y); g.scale(s * p, s * p);
  rr(g, -84, -76, 168, 152, 16); fs(g, '#FFFFFF', '#9AA9C4', 5); rr(g, -84, -76, 168, 44, 16); g.fillStyle = C.red; g.fill(); g.fillRect(-84, -52, 168, 20);
  text(g, label, 0, 20, 60, '#2A2230', 'fun'); g.restore();
}
