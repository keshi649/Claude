'use strict';
/* icons.js：技能、装备、召唤师技能的图标（画布上用渐变和路径画，按尺寸缓存）。 */

const ICON_CACHE = {};
const SKILL_THEME = {
  t1: ['#C9963F', '#5A3A12'], t2: ['#8FA6C8', '#2A3A5A'], t3: ['#D9A63E', '#5A2A12'],
  w1: ['#7FB8FF', '#1A3A7A'], w2: ['#FFB060', '#7A2A12'], w3: ['#FFD86A', '#8A2A1A'],
  a1: ['#B07CFF', '#2A1650'], a2: ['#8A8FB0', '#1A1A2E'], a3: ['#E05AFF', '#3A0E50'],
  m1: ['#FF8A3A', '#6A1A0A'], m2: ['#9CE8FF', '#0E3A6A'], m3: ['#FFB040', '#4A1050'],
  s1: ['#7CE0A0', '#0E4A2A'], s2: ['#C8F08A', '#2A4A0E'], s3: ['#9CF0FF', '#0E3A4A'],
  h1: ['#9CFF9C', '#0E5A2A'], h2: ['#8AD860', '#1E4A0E'], h3: ['#FFE89A', '#7A4A0E'],
  flash: ['#FFF0A0', '#7A5A0E'], heal: ['#9CFF9C', '#0E5A2A'], recall: ['#9CC8FF', '#0E2A6A'], atk: ['#F4E2B0', '#5A3A12'],
  lasthit: ['#F4E2B0', '#4A3A20'], tower: ['#F4E2B0', '#3A3A4A'],
};
function iconBg(g, s, c1, c2) {
  const gr = g.createRadialGradient(s * 0.42, s * 0.35, s * 0.05, s * 0.5, s * 0.5, s * 0.72);
  gr.addColorStop(0, c1); gr.addColorStop(1, c2);
  g.fillStyle = gr; g.fillRect(0, 0, s, s);
}
function glowStroke(g, col, w, fn) {
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  g.shadowColor = col; g.shadowBlur = w * 2.2; g.strokeStyle = col; g.lineWidth = w; g.beginPath(); fn(); g.stroke();
  g.shadowBlur = 0; g.strokeStyle = '#FFFFFF'; g.lineWidth = w * 0.45; g.beginPath(); fn(); g.stroke();
  g.restore();
}
function glowFill(g, col, fn) {
  g.save(); g.shadowColor = col; g.shadowBlur = 10; g.fillStyle = col; g.beginPath(); fn(); g.fill();
  g.shadowBlur = 0; g.globalAlpha = 0.55; g.fillStyle = '#FFFFFF'; g.beginPath(); fn(); g.fill(); g.restore();
}
function swordPath(g, x, y, len, ang, w) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.moveTo(-w, 0); g.lineTo(-w, -len * 0.82); g.lineTo(0, -len); g.lineTo(w, -len * 0.82); g.lineTo(w, 0); g.closePath();
  g.moveTo(-w * 3, 0); g.lineTo(w * 3, 0); g.lineTo(w * 3, w * 1.4); g.lineTo(-w * 3, w * 1.4); g.closePath();
  g.moveTo(-w * 0.7, w * 1.4); g.lineTo(w * 0.7, w * 1.4); g.lineTo(w * 0.7, len * 0.22); g.lineTo(-w * 0.7, len * 0.22); g.closePath();
  g.restore();
}
function drawSkillGlyph(g, id, s) {
  const c = s / 2, k = s / 64, col = (SKILL_THEME[id] || ['#FFFFFF'])[0];
  const P = (fn) => () => fn();
  switch (id) {
    case 't1': glowFill(g, col, P(() => { g.moveTo(22 * k, 14 * k); g.lineTo(44 * k, 14 * k); g.lineTo(46 * k, 36 * k); g.lineTo(33 * k, 50 * k); g.lineTo(20 * k, 36 * k); g.closePath(); }));
      glowStroke(g, col, 3 * k, () => { for (const y of [22, 32, 42]) { g.moveTo(6 * k, y * k); g.lineTo(15 * k, y * k); } }); break;
    case 't2': glowFill(g, col, P(() => { for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 - Math.PI / 2; g.lineTo(c + Math.cos(a) * 22 * k, c + Math.sin(a) * 22 * k); } g.closePath(); }));
      glowStroke(g, col, 3 * k, () => { g.moveTo(c, c - 12 * k); g.lineTo(c, c + 12 * k); g.moveTo(c - 10 * k, c - 2 * k); g.lineTo(c + 10 * k, c - 2 * k); }); break;
    case 't3': glowStroke(g, col, 4 * k, () => { for (const r of [12, 20, 28]) { g.moveTo(c - r * k, 46 * k); g.quadraticCurveTo(c, (46 - r * 0.5) * k, c + r * k, 46 * k); } });
      glowFill(g, col, P(() => { g.moveTo(c - 8 * k, 8 * k); g.lineTo(c + 8 * k, 8 * k); g.lineTo(c + 10 * k, 32 * k); g.lineTo(c - 10 * k, 32 * k); g.closePath(); })); break;
    case 'w1': glowStroke(g, col, 4 * k, () => { for (let i = 0; i < 70; i++) { const a = i / 70 * Math.PI * 5, r = (4 + i * 0.36) * k; i ? g.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r) : g.moveTo(c + Math.cos(a) * r, c + Math.sin(a) * r); } }); break;
    case 'w2': glowStroke(g, col, 4 * k, () => { g.moveTo(10 * k, 46 * k); g.quadraticCurveTo(c, 2 * k, 50 * k, 40 * k); });
      glowFill(g, col, P(() => { g.moveTo(54 * k, 48 * k); g.lineTo(42 * k, 40 * k); g.lineTo(52 * k, 32 * k); g.closePath(); }));
      glowStroke(g, col, 3 * k, () => { g.moveTo(36 * k, 54 * k); g.lineTo(58 * k, 54 * k); }); break;
    case 'w3': glowFill(g, col, P(() => { g.arc(c - 8 * k, c + 8 * k, 26 * k, -Math.PI * 0.55, Math.PI * 0.15); g.arc(c - 16 * k, c + 14 * k, 22 * k, Math.PI * 0.12, -Math.PI * 0.5, true); g.closePath(); })); break;
    case 'a1': glowFill(g, col, P(() => swordPath(g, 38 * k, 40 * k, 30 * k, Math.PI / 4, 3 * k)));
      glowStroke(g, col, 2.5 * k, () => { for (const [x, y] of [[8, 30], [12, 40], [18, 50]]) { g.moveTo(x * k, y * k); g.lineTo((x + 14) * k, (y - 14) * k); } }); break;
    case 'a2': glowStroke(g, col, 3.5 * k, () => { g.moveTo(10 * k, c); g.quadraticCurveTo(c, 12 * k, 54 * k, c); g.quadraticCurveTo(c, 52 * k, 10 * k, c); });
      glowStroke(g, col, 3.5 * k, () => { g.moveTo(12 * k, 52 * k); g.lineTo(52 * k, 12 * k); }); break;
    case 'a3': glowStroke(g, col, 3 * k, () => { for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI + 0.3; g.moveTo(c - Math.cos(a) * 24 * k, c - Math.sin(a) * 24 * k); g.lineTo(c + Math.cos(a) * 24 * k, c + Math.sin(a) * 24 * k); } }); break;
    case 'm1': glowFill(g, col, P(() => { g.moveTo(c + 14 * k, c - 4 * k); g.quadraticCurveTo(c + 16 * k, c + 18 * k, c - 2 * k, c + 18 * k); g.quadraticCurveTo(c - 20 * k, c + 14 * k, c - 14 * k, c - 6 * k); g.quadraticCurveTo(c - 8 * k, c - 20 * k, c + 2 * k, c - 26 * k); g.quadraticCurveTo(c - 2 * k, c - 10 * k, c + 14 * k, c - 4 * k); }));
      glowFill(g, '#FFE070', P(() => g.arc(c, c + 5 * k, 7 * k, 0, 7))); break;
    case 'm2': glowStroke(g, col, 3.5 * k, () => { for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; g.moveTo(c, c); g.lineTo(c + Math.cos(a) * 22 * k, c + Math.sin(a) * 22 * k); g.moveTo(c + Math.cos(a) * 13 * k, c + Math.sin(a) * 13 * k); g.lineTo(c + Math.cos(a + 0.5) * 18 * k, c + Math.sin(a + 0.5) * 18 * k); } }); break;
    case 'm3': for (const [x, y, r] of [[40, 22, 7], [26, 36, 6], [46, 46, 5]]) { glowStroke(g, col, 3 * k, () => { g.moveTo((x - 16) * k, (y - 16) * k); g.lineTo(x * k, y * k); }); glowFill(g, col, P(() => g.arc(x * k, y * k, r * k, 0, 7))); } break;
    case 's1': glowStroke(g, col, 3 * k, () => { for (const a of [-0.5, -0.25, 0, 0.25, 0.5]) { g.moveTo(10 * k, 54 * k); g.lineTo(10 * k + Math.cos(-Math.PI / 4 + a) * 44 * k, 54 * k + Math.sin(-Math.PI / 4 + a) * 44 * k); } }); break;
    case 's2': glowStroke(g, col, 4 * k, () => { g.moveTo(10 * k, 44 * k); g.lineTo(44 * k, 20 * k); g.moveTo(32 * k, 18 * k); g.lineTo(46 * k, 18 * k); g.lineTo(46 * k, 32 * k); g.moveTo(8 * k, 30 * k); g.lineTo(18 * k, 24 * k); g.moveTo(16 * k, 54 * k); g.lineTo(28 * k, 46 * k); }); break;
    case 's3': glowStroke(g, col, 5 * k, () => { g.moveTo(8 * k, 56 * k); g.lineTo(54 * k, 10 * k); });
      glowFill(g, col, P(() => { g.moveTo(58 * k, 6 * k); g.lineTo(40 * k, 12 * k); g.lineTo(52 * k, 24 * k); g.closePath(); }));
      glowStroke(g, '#FFFFFF', 2 * k, () => { g.arc(30 * k, 34 * k, 12 * k, 0, 7); }); break;
    case 'h1': case 'heal': glowFill(g, col, P(() => { const w = 7 * k, l = 20 * k; g.rect(c - w, c - l, w * 2, l * 2); g.rect(c - l, c - w, l * 2, w * 2); })); break;
    case 'h2': glowStroke(g, col, 4 * k, () => { for (let i = 0; i < 60; i++) { const t = i / 60, x = 8 * k + t * 48 * k, y = c + Math.sin(t * Math.PI * 3) * 14 * k; i ? g.lineTo(x, y) : g.moveTo(x, y); } });
      glowFill(g, col, P(() => { for (const x of [20, 36, 50]) { g.moveTo(x * k, (c - 6) * k); g.ellipse(x * k, (c / k - 10) * k, 5 * k, 3 * k, -0.6, 0, 7); } })); break;
    case 'h3': glowStroke(g, col, 4 * k, () => { g.arc(c, c + 14 * k, 24 * k, Math.PI, 0); g.moveTo(c - 26 * k, c + 14 * k); g.lineTo(c + 26 * k, c + 14 * k); });
      glowFill(g, col, P(() => { g.moveTo(c, c - 8 * k); g.lineTo(c + 5 * k, c + 2 * k); g.lineTo(c, c + 10 * k); g.lineTo(c - 5 * k, c + 2 * k); g.closePath(); })); break;
    case 'flash': glowFill(g, col, P(() => { g.moveTo(36 * k, 6 * k); g.lineTo(16 * k, 36 * k); g.lineTo(30 * k, 36 * k); g.lineTo(24 * k, 58 * k); g.lineTo(48 * k, 26 * k); g.lineTo(34 * k, 26 * k); g.closePath(); })); break;
    case 'recall': glowStroke(g, col, 3.5 * k, () => { g.moveTo(14 * k, 32 * k); g.lineTo(c, 12 * k); g.lineTo(50 * k, 32 * k); g.moveTo(20 * k, 28 * k); g.lineTo(20 * k, 52 * k); g.lineTo(44 * k, 52 * k); g.lineTo(44 * k, 28 * k); g.moveTo(28 * k, 52 * k); g.lineTo(28 * k, 40 * k); g.lineTo(36 * k, 40 * k); g.lineTo(36 * k, 52 * k); }); break;
    case 'atk': glowFill(g, col, P(() => swordPath(g, c, c + 18 * k, 40 * k, 0, 4 * k))); break;
    case 'lasthit':                              // 补刀：小兵的头盔
      glowFill(g, col, P(() => { g.arc(c, c + 4 * k, 17 * k, Math.PI, 0); g.lineTo(c + 17 * k, c + 12 * k); g.lineTo(c - 17 * k, c + 12 * k); g.closePath(); }));
      glowStroke(g, col, 3 * k, () => { g.moveTo(c, c - 13 * k); g.lineTo(c, c - 22 * k); g.moveTo(c - 10 * k, c + 18 * k); g.lineTo(c + 10 * k, c + 18 * k); });
      break;
    case 'tower':                                // 推塔：一座塔
      glowFill(g, col, P(() => { g.moveTo(c - 9 * k, c + 22 * k); g.lineTo(c - 6 * k, c - 8 * k); g.lineTo(c + 6 * k, c - 8 * k); g.lineTo(c + 9 * k, c + 22 * k); g.closePath(); g.moveTo(c - 13 * k, c + 24 * k); g.lineTo(c + 13 * k, c + 24 * k); g.lineTo(c + 13 * k, c + 18 * k); g.lineTo(c - 13 * k, c + 18 * k); g.closePath(); }));
      glowFill(g, '#9CC8FF', P(() => g.arc(c, c - 16 * k, 7 * k, 0, 7)));
      break;
  }
}
// 圆形的技能图标（按钮里用）
function skillIcon(id, size) {
  const key = 's' + id + size;
  if (ICON_CACHE[key]) return ICON_CACHE[key];
  const c = mkc(size, size), g = c.getContext('2d'), th = SKILL_THEME[id] || ['#888', '#222'];
  g.save(); g.beginPath(); g.arc(size / 2, size / 2, size / 2, 0, 7); g.clip();
  iconBg(g, size, th[1], '#0A0814');
  const gr = g.createRadialGradient(size * 0.5, size * 0.5, 0, size * 0.5, size * 0.5, size * 0.5);
  gr.addColorStop(0, th[0] + '55'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, size, size);
  drawSkillGlyph(g, id, size);
  g.restore();
  ICON_CACHE[key] = c;
  return c;
}

/* ---------- 装备图标（方形圆角） ---------- */
const ITEM_THEME = { atk: ['#E06A3A', '#3A120A'], mag: ['#8A6AFF', '#160A3A'], def: ['#4AA86A', '#0A2A16'], move: ['#D8B04A', '#3A2A0A'] };
function drawItemGlyph(g, id, s) {
  const k = s / 64, c = s / 2;
  const gold = '#FFD86A', steel = '#DDE6F0', red = '#FF5A5A', blue = '#7CC0FF', purp = '#C8A0FF', green = '#8AE08A';
  const boot = (col, wing) => { glowFill(g, col, () => { g.moveTo(22 * k, 10 * k); g.lineTo(38 * k, 10 * k); g.lineTo(38 * k, 38 * k); g.lineTo(54 * k, 44 * k); g.lineTo(54 * k, 54 * k); g.lineTo(18 * k, 54 * k); g.closePath(); }); if (wing) glowStroke(g, wing, 3 * k, () => { g.moveTo(40 * k, 18 * k); g.lineTo(56 * k, 10 * k); g.moveTo(40 * k, 26 * k); g.lineTo(58 * k, 22 * k); }); };
  switch (id) {
    case 'sword': glowFill(g, steel, () => swordPath(g, 34 * k, 46 * k, 36 * k, 0.6, 3.5 * k)); break;
    case 'dagger': glowFill(g, steel, () => swordPath(g, 30 * k, 44 * k, 24 * k, 0.6, 3 * k)); break;
    case 'glove': glowFill(g, '#E8A060', () => { g.roundRect ? g.roundRect(18 * k, 16 * k, 28 * k, 32 * k, 8 * k) : g.rect(18 * k, 16 * k, 28 * k, 32 * k); }); glowStroke(g, '#5A3A1A', 2 * k, () => { for (const x of [26, 32, 38]) { g.moveTo(x * k, 18 * k); g.lineTo(x * k, 28 * k); } }); break;
    case 'book': glowFill(g, purp, () => { g.rect(16 * k, 14 * k, 32 * k, 38 * k); }); glowStroke(g, gold, 2.5 * k, () => { g.rect(20 * k, 18 * k, 24 * k, 30 * k); }); break;
    case 'ruby': glowFill(g, red, () => { g.moveTo(c, 10 * k); g.lineTo(50 * k, 26 * k); g.lineTo(c, 54 * k); g.lineTo(14 * k, 26 * k); g.closePath(); }); break;
    case 'vest': glowFill(g, '#C89A6A', () => { g.moveTo(18 * k, 14 * k); g.lineTo(26 * k, 12 * k); g.lineTo(c, 20 * k); g.lineTo(38 * k, 12 * k); g.lineTo(46 * k, 14 * k); g.lineTo(48 * k, 52 * k); g.lineTo(16 * k, 52 * k); g.closePath(); }); break;
    case 'cape': glowFill(g, blue, () => { g.moveTo(22 * k, 12 * k); g.lineTo(42 * k, 12 * k); g.quadraticCurveTo(56 * k, 40 * k, 50 * k, 54 * k); g.lineTo(14 * k, 54 * k); g.quadraticCurveTo(8 * k, 40 * k, 22 * k, 12 * k); }); break;
    case 'shoe': boot('#C8A070'); break;
    case 'bootA': boot('#E8C060', '#FFFFFF'); break;
    case 'bootM': boot(purp, '#FFFFFF'); break;
    case 'bootD': boot(steel, gold); break;
    case 'fang': glowFill(g, '#FFF0E0', () => { g.moveTo(16 * k, 14 * k); g.quadraticCurveTo(30 * k, 30 * k, 26 * k, 54 * k); g.quadraticCurveTo(46 * k, 30 * k, 48 * k, 12 * k); g.closePath(); }); glowFill(g, red, () => g.arc(32 * k, 26 * k, 5 * k, 0, 7)); break;
    case 'storm': glowFill(g, steel, () => swordPath(g, 32 * k, 50 * k, 44 * k, 0.5, 4.5 * k)); glowStroke(g, '#9CE8FF', 2.5 * k, () => { g.moveTo(44 * k, 8 * k); g.lineTo(36 * k, 20 * k); g.lineTo(44 * k, 22 * k); g.lineTo(36 * k, 34 * k); }); break;
    case 'bow': glowStroke(g, '#E8C060', 4 * k, () => { g.arc(14 * k, c, 30 * k, -1.1, 1.1); }); glowStroke(g, '#FFFFFF', 1.5 * k, () => { g.moveTo(27 * k, 6 * k); g.lineTo(27 * k, 58 * k); }); glowStroke(g, steel, 3 * k, () => { g.moveTo(14 * k, c); g.lineTo(56 * k, c); }); break;
    case 'spear': glowStroke(g, '#C8A070', 3.5 * k, () => { g.moveTo(10 * k, 56 * k); g.lineTo(44 * k, 20 * k); }); glowFill(g, steel, () => { g.moveTo(56 * k, 8 * k); g.lineTo(38 * k, 18 * k); g.lineTo(46 * k, 26 * k); g.closePath(); }); break;
    case 'axe': glowStroke(g, '#C8A070', 4 * k, () => { g.moveTo(18 * k, 56 * k); g.lineTo(40 * k, 10 * k); }); glowFill(g, steel, () => { g.moveTo(34 * k, 14 * k); g.quadraticCurveTo(58 * k, 12 * k, 54 * k, 36 * k); g.lineTo(38 * k, 28 * k); g.closePath(); }); break;
    case 'staff': glowStroke(g, '#C8A070', 3.5 * k, () => { g.moveTo(16 * k, 56 * k); g.lineTo(42 * k, 20 * k); }); glowFill(g, purp, () => g.arc(44 * k, 16 * k, 9 * k, 0, 7)); break;
    case 'orb': glowFill(g, '#9CE8FF', () => g.arc(c, c, 18 * k, 0, 7)); glowStroke(g, '#FFFFFF', 2 * k, () => { g.arc(c, c, 11 * k, 3.6, 5.2); }); break;
    case 'wand': glowStroke(g, '#3A2A5A', 4 * k, () => { g.moveTo(14 * k, 54 * k); g.lineTo(44 * k, 18 * k); }); glowFill(g, purp, () => { for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r = i % 2 ? 6 : 14; g.lineTo(46 * k + Math.cos(a) * r * k, 16 * k + Math.sin(a) * r * k); } g.closePath(); }); break;
    case 'glass': glowStroke(g, gold, 3 * k, () => { g.moveTo(18 * k, 10 * k); g.lineTo(46 * k, 10 * k); g.moveTo(18 * k, 54 * k); g.lineTo(46 * k, 54 * k); }); glowFill(g, '#FFE8A0', () => { g.moveTo(20 * k, 12 * k); g.lineTo(44 * k, 12 * k); g.lineTo(c, c); g.lineTo(44 * k, 52 * k); g.lineTo(20 * k, 52 * k); g.lineTo(c, c); g.closePath(); }); break;
    case 'belt': glowFill(g, '#C87A3A', () => { g.rect(8 * k, 24 * k, 48 * k, 16 * k); }); glowFill(g, gold, () => { g.rect(26 * k, 20 * k, 12 * k, 24 * k); }); break;
    case 'thorn': glowFill(g, '#9AA8B8', () => { g.moveTo(18 * k, 14 * k); g.lineTo(46 * k, 14 * k); g.lineTo(48 * k, 52 * k); g.lineTo(16 * k, 52 * k); g.closePath(); }); glowStroke(g, red, 2.5 * k, () => { for (const [x, y, dx] of [[16, 20, -8], [16, 36, -8], [48, 20, 8], [48, 36, 8]]) { g.moveTo(x * k, y * k); g.lineTo((x + dx) * k, (y - 4) * k); } }); break;
    case 'cloak': glowFill(g, green, () => { g.moveTo(22 * k, 10 * k); g.lineTo(42 * k, 10 * k); g.quadraticCurveTo(58 * k, 40 * k, 50 * k, 56 * k); g.lineTo(14 * k, 56 * k); g.quadraticCurveTo(6 * k, 40 * k, 22 * k, 10 * k); }); glowFill(g, gold, () => g.arc(c, 18 * k, 4 * k, 0, 7)); break;
    case 'totem': glowFill(g, '#8AE0A0', () => { g.rect(24 * k, 10 * k, 16 * k, 44 * k); }); glowFill(g, '#FFFFFF', () => { g.arc(c, 20 * k, 5 * k, 0, 7); }); glowFill(g, red, () => { g.arc(c, 38 * k, 5 * k, 0, 7); }); break;
    default: glowFill(g, '#FFFFFF', () => g.arc(c, c, 14 * k, 0, 7));
  }
}
function itemIcon(id, size) {
  const key = 'i' + id + size;
  if (ICON_CACHE[key]) return ICON_CACHE[key];
  const c = mkc(size, size), g = c.getContext('2d'), I = ITEMS[id], th = ITEM_THEME[I ? I.cat : 'atk'];
  const r = size * 0.16;
  g.save(); g.beginPath();
  g.moveTo(r, 0); g.arcTo(size, 0, size, size, r); g.arcTo(size, size, 0, size, r); g.arcTo(0, size, 0, 0, r); g.arcTo(0, 0, size, 0, r); g.closePath(); g.clip();
  iconBg(g, size, th[0] + 'AA', th[1]);
  drawItemGlyph(g, id, size);
  g.restore();
  g.strokeStyle = 'rgba(255,220,140,0.75)'; g.lineWidth = Math.max(1, size / 32);
  g.beginPath(); g.moveTo(r, 1); g.arcTo(size - 1, 1, size - 1, size - 1, r); g.arcTo(size - 1, size - 1, 1, size - 1, r); g.arcTo(1, size - 1, 1, 1, r); g.arcTo(1, 1, size - 1, 1, r); g.stroke();
  ICON_CACHE[key] = c;
  return c;
}
function iconURL(c) { return c.toDataURL(); }

if (typeof module !== 'undefined') module.exports = {};
