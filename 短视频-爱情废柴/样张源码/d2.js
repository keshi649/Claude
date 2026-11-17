'use strict';
/* 方向 2：16 位复古 RPG。2a 主歌：小镇地图 + 状态栏、任务、对话框；2b 副歌：打不过的 Boss 战 */
function panel(g, x, y, w, h, o = {}) {
  const bg = o.bg || '#101A44'; R(g, x + 1, y, w - 2, h, bg); R(g, x, y + 1, w, h - 2, bg);
  field(g, x + 1, y + 1, w - 2, h - 2, '#1C2C6A', (px, py) => (py - y) / h * .6);
  R(g, x + 2, y, w - 4, 1, '#FFFFFF'); R(g, x + 2, y + h - 1, w - 4, 1, '#FFFFFF'); R(g, x, y + 2, 1, h - 4, '#FFFFFF'); R(g, x + w - 1, y + 2, 1, h - 4, '#FFFFFF');
  R(g, x + 1, y + 1, 1, 1, '#FFFFFF'); R(g, x + w - 2, y + 1, 1, 1, '#FFFFFF'); R(g, x + 1, y + h - 2, 1, 1, '#FFFFFF'); R(g, x + w - 2, y + h - 2, 1, 1, '#FFFFFF');
  R(g, x + 3, y + 2, w - 6, 1, '#6A7CC8'); R(g, x + 2, y + 3, 1, h - 6, '#6A7CC8'); R(g, x + 3, y + h - 3, w - 6, 1, '#2A3A80'); R(g, x + w - 3, y + 3, 1, h - 6, '#2A3A80');
}
function bar(g, x, y, w, v, c, bgc = '#0A0E24') { R(g, x - 1, y - 1, w + 2, 6, '#FFFFFF'); R(g, x, y, w, 4, bgc); R(g, x, y, Math.max(1, Math.round(w * v)), 4, c); R(g, x, y, Math.max(1, Math.round(w * v)), 1, lt(c, .45)); }
function bubble(g, x, y, w, h, tail = 1) { R(g, x + 1, y, w - 2, h, '#FFFFFF'); R(g, x, y + 1, w, h - 2, '#FFFFFF'); R(g, x + 1, y - 1, w - 2, 1, '#1A1F40'); R(g, x + 1, y + h, w - 2, 1, '#1A1F40'); R(g, x - 1, y + 1, 1, h - 2, '#1A1F40'); R(g, x + w, y + 1, 1, h - 2, '#1A1F40'); if (tail) { R(g, x + fl(w / 2) - 1, y + h, 3, 1, '#FFFFFF'); R(g, x + fl(w / 2), y + h + 1, 1, 1, '#FFFFFF'); R(g, x + fl(w / 2) - 2, y + h, 1, 1, '#1A1F40'); R(g, x + fl(w / 2) + 2, y + h, 1, 1, '#1A1F40'); R(g, x + fl(w / 2) - 1, y + h + 1, 1, 1, '#1A1F40'); R(g, x + fl(w / 2) + 1, y + h + 1, 1, 1, '#1A1F40'); R(g, x + fl(w / 2), y + h + 2, 1, 1, '#1A1F40'); } }
function pine(g, x, base, h) { R(g, x - 1, base - 3, 3, 3, '#5A3422'); ell(g, x, base, 7, 2, '#8FA4D4', .6); for (let j = 0; j < h; j++) { const w = 1 + fl(((j % fl(h / 3)) + j * .5) * .55); R(g, x - w, base - 3 - h + j, 2 * w + 1, 1, '#1F6B45'); R(g, x - w, base - 3 - h + j, Math.max(1, fl(w * .6)), 1, '#2E9060'); if (j % fl(h / 3) < 2) R(g, x - w + (j % 2), base - 3 - h + j, 2 * w - 1, 1, '#FFFFFF'); } }
function sparkle(g, G, x, y, c = '#FFFFFF', s = 2) { R(g, x - s, y, 2 * s + 1, 1, c); R(g, x, y - s, 1, 2 * s + 1, c); if (G) soft(G, x + .5, y + .5, s * 2.5, c, .9); }

FRAMES['2a'] = async (main) => {
  const g = mk(PW, PH), G = mk(PW, PH), GY = 106;
  // 地面：雪地的格子
  R(g, 0, 0, PW, PH, '#DCE6F5'); for (let y = 96; y < PH; y += 16) for (let x = 0; x < PW; x += 16) { if (((x + y) / 16) & 1) R(g, x, y, 16, 16, '#D0DCF1'); R(g, x + 3, y + 5, 2, 1, '#FFFFFF'); R(g, x + 10, y + 12, 2, 1, '#B8C8E8'); }
  // 石板路和广场
  const cob = (x, y, w, h) => { R(g, x, y, w, h, '#8E9CC0'); for (let j = 0; j < h; j += 4) for (let i = (j / 4 & 1) * 4 - 4; i < w; i += 8) { R(g, x + Math.max(0, i), y + j, Math.min(7, w - Math.max(0, i)), 3, (i + j) % 3 ? '#A4B1D2' : '#B4C0DC'); } R(g, x, y, w, 1, '#FFFFFF'); };
  cob(0, 108, PW, 22); cob(226, 130, 28, 80);
  field(g, 190, 128, 100, 64, '#8E9CC0', (x, y) => ((x - 240) / 48) ** 2 + ((y - 160) / 30) ** 2 < 1 ? 1 : 0);
  field(g, 190, 128, 100, 64, '#B4C0DC', (x, y) => ((x - 240) / 48) ** 2 + ((y - 160) / 30) ** 2 < 1 && ((x + fl(y / 4) * 4) % 8 < 6) && (y % 4 < 3) ? 1 : 0);
  field(g, 186, 124, 108, 72, '#FFFFFF', (x, y) => { const d = ((x - 240) / 48) ** 2 + ((y - 160) / 30) ** 2; return d >= 1 && d < 1.12 ? 1 : 0; });
  // 上面一排铺子
  shop(g, G, 2, 84, 78, GY, { wall: '#B5654A', roof: '#5A2E3A', sign: '面包房', awn: ['#E0423A', '#FFF4E0'], win: WIN.bread, seed: 2, lit: [1, 1], sil: [0, 1], chimX: .6 });
  shop(g, G, 96, 78, 86, GY, { wall: '#4E7A8C', roof: '#2E3E5A', sign: '玩具屋', signCol: '#9FE8FF', win: WIN.globes, seed: 5, lit: [1, 0], doorL: 1, door: '#C8553D', curt: '#3A8A6A' });
  shop(g, G, 184, 80, 74, GY, { wall: '#7A5A8C', roof: '#3A2A4E', sign: '唱片行', signCol: '#FF9AD8', awn: ['#5A3A8A', '#F0D8FF'], win: WIN.records, seed: 8, lit: [0, 1], chim: false, door: '#3A2A4E', curt: '#E0A040' });
  shop(g, G, 276, 82, 84, GY, { wall: '#C89858', roof: '#6A3A2A', sign: '咖啡', awn: ['#2E7D4F', '#FFF4E0'], win: WIN.cafe, seed: 11, lit: [1, 1], sil: [1, 0], doorL: 1, door: '#2E5A4A', winCol: '#FFC870', panes: 1 });
  shop(g, G, 370, 104, 76, GY, { wall: '#A84A5A', roof: '#4A2A3A', sign: '花店', signCol: '#B8FFB0', win: WIN.flowers, seed: 14, lit: [1, 0, 1], nw: 3, chimX: .3, curt: '#F0D8C0' });
  [[4, 44], [100, 40], [188, 44], [292, 46], [376, 60]].forEach(([x, w]) => field(g, x - 6, GY, w + 12, 16, '#FFD9A0', (px, py) => .45 * (1 - (py - GY) / 16) * Math.min(1, (px - x + 6) / 6, (x + w + 6 - px) / 6)));
  // 树、栅栏、长椅、结冰的小池
  [[14, 156], [34, 176], [10, 200], [56, 150], [470, 150], [452, 172], [474, 196], [432, 148], [150, 202], [338, 204], [96, 196], [394, 204]].forEach(([x, y]) => pine(g, x, y, 22 + (x % 3) * 3));
  for (let x = 66; x < 186; x += 6) { R(g, x, 196, 2, 9, '#8A5A38'); R(g, x, 195, 2, 1, '#FFFFFF'); } R(g, 66, 199, 120, 2, '#6A4028'); for (let x = 296; x < 420; x += 6) { R(g, x, 196, 2, 9, '#8A5A38'); R(g, x, 195, 2, 1, '#FFFFFF'); } R(g, 296, 199, 124, 2, '#6A4028');
  ell(g, 370, 168, 30, 13, '#FFFFFF'); ell(g, 370, 168, 27, 11, '#9CC8F0'); ell(g, 364, 165, 14, 4, '#C8E4FF'); line(g, 356, 172, 384, 164, '#FFFFFF'); R(g, 376, 170, 6, 1, '#FFFFFF');
  R(g, 100, 162, 26, 3, '#8A5A38'); R(g, 100, 161, 26, 1, '#FFFFFF'); R(g, 102, 165, 2, 5, '#5A3422'); R(g, 122, 165, 2, 5, '#5A3422'); R(g, 100, 154, 26, 2, '#8A5A38'); R(g, 100, 153, 26, 1, '#FFFFFF');
  lamp(g, G, 88, 132, 30, 0); lamp(g, G, 268, 132, 30, 0); lamp(g, G, 172, 190, 30, 0); lamp(g, G, 312, 190, 30, 0); lights(g, G, 172, 162, 312, 162, 10, 6, 3);
  snowman(g, 176, 150); xtree(g, G, 240, 166, 52, 4);
  // 人：一对一对的，头上冒心；主角一个人，头上是"…"
  const P = (x, fy, o) => { ell(g, x, fy, 9, 2.4, '#7F93C6', .7); chibi(g, x, fy, 26, o); };
  P(70, 140, { hair: '#7A4A2A', coat: '#F08AB0', scarf: '#FFFFFF', girl: 1, hat: '#FFFFFF', pom: '#FF5A7A', eyes: 'happy', mouth: 'smile', step: 1 }); P(92, 140, { hair: '#1B1420', coat: '#5AA0E8', scarf: '#FFD54A', eyes: 'happy', mouth: 'smile', step: 2 }); bubble(g, 74, 96, 13, 11); heart(g, 78, 99);
  P(330, 150, { hair: '#C8742E', coat: '#6CC58A', scarf: '#FFFFFF', girl: 1, mouth: 'smile' }); P(352, 150, { hair: '#3A2A20', coat: '#7A6AD8', scarf: '#E0423A', mouth: 'smile', step: 1 }); bubble(g, 334, 106, 13, 11); heart(g, 338, 109);
  P(408, 192, { hair: '#1B1420', coat: '#F2C94C', scarf: '#5AB8FF', girl: 1, eyes: 'happy', mouth: 'smile', hat: '#E0423A', pom: '#FFFFFF' }); P(430, 192, { hair: '#8A5A2A', coat: '#E07A5A', scarf: '#FFFFFF', eyes: 'happy', mouth: 'smile' }); bubble(g, 412, 146, 13, 11); heart(g, 416, 149);
  P(122, 186, { hair: '#5A3A6A', coat: '#7ADFD0', scarf: '#FF8AD8', girl: 1, mouth: 'smile', step: 2 }); P(144, 186, { hair: '#2A2438', coat: '#C8553D', scarf: '#FFFFFF', mouth: 'smile', step: 1 }); bubble(g, 126, 142, 13, 11); heart(g, 130, 145);
  cat(g, 300, 142);
  // 主角脚下的选中圈
  field(g, 190, 188, 44, 14, '#FFE066', (x, y) => { const d = ((x - 212) / 15) ** 2 + ((y - 195) / 4.5) ** 2; return d < 1 && d > .6 ? 1 : 0; }); soft(G, 212, 195, 12, '#FFD54A', .6);
  chibi(g, 212, 196, 30, { ...HERO, eyes: 'dn', mouth: 'flat', snow: 1 }); bubble(g, 202, 144, 21, 11); R(g, 207, 149, 2, 2, '#1A1F40'); R(g, 211, 149, 2, 2, '#1A1F40'); R(g, 215, 149, 2, 2, '#1A1F40');
  R(g, 209, 136, 7, 1, '#FFE066'); R(g, 210, 137, 5, 1, '#FFE066'); R(g, 211, 138, 3, 1, '#FFE066'); R(g, 212, 139, 1, 1, '#FFE066');
  snow(g, 21, 120, 1, '#FFFFFF', 1, [0, 0, PW, 206]); snow(g, 22, 34, 2, '#FFFFFF', 1, [0, 0, PW, 206]);
  g.fillStyle = 'rgba(20,26,84,.34)'; g.fillRect(0, 0, PW, PH);
  // ---- 界面 ----（界面底下不要光晕）
  [[6, 6, 150, 50], [162, 6, 152, 20], [372, 6, 102, 126], [380, 180, 94, 22], [6, 202, 468, 62]].forEach(([x, y, w, h]) => G.clearRect(x - 2, y - 2, w + 4, h + 4));
  panel(g, 6, 6, 150, 50);
  R(g, 11, 11, 40, 40, '#FFFFFF'); R(g, 12, 12, 38, 38, '#2A3A80'); { const b = chibi(null, 0, 0, 58, { ...HERO, eyes: 'sad', mouth: 'flat', buf: 1 }); g.drawImage(b.canvas, fl(b.canvas.width / 2) - 19, b.canvas.height - 2 - 60, 38, 38, 12, 12, 38, 38); }
  ptext(g, '废柴', 56, 10, '#FFFFFF'); ptext(g, 'Lv.1', 86, 10, '#FFE066');
  ptext(g, '心', 56, 24, '#FF8AA0'); bar(g, 72, 29, 50, .1, '#FF5A6A'); ptext(g, '12', 127, 24, '#FFFFFF');
  ptext(g, '勇', 56, 38, '#9FE8FF'); bar(g, 72, 43, 50, .02, '#5AB8FF'); ptext(g, '0', 127, 38, '#FFFFFF');
  panel(g, 162, 6, 152, 20, { bg: '#3A2A10' }); R(g, 168, 11, 9, 9, '#FFD54A'); R(g, 171, 9, 3, 13, '#FFD54A'); R(g, 166, 14, 13, 3, '#FFD54A'); ptext(g, '成就解锁：剩单节', 183, 9, '#FFE9A0');
  panel(g, 372, 6, 102, 62); ptext(g, '十二月二十五 夜', 378, 9, '#FFFFFF'); R(g, 378, 24, 90, 38, '#0A0E24');
  for (let i = 0; i < 5; i++) R(g, 380 + i * 18, 27, 14, 9, ['#B5654A', '#4E7A8C', '#7A5A8C', '#C89858', '#A84A5A'][i]); R(g, 380, 39, 86, 4, '#8E9CC0'); R(g, 420, 43, 6, 16, '#8E9CC0'); ell(g, 423, 50, 9, 5, '#8E9CC0');
  [[392, 46, '#FF5A7A'], [396, 46, '#FF5A7A'], [440, 48, '#FF5A7A'], [444, 48, '#FF5A7A'], [454, 56, '#FF5A7A'], [458, 56, '#FF5A7A'], [400, 55, '#FF5A7A'], [404, 55, '#FF5A7A']].forEach(([x, y, c]) => R(g, x, y, 2, 2, c)); R(g, 416, 55, 3, 3, '#FFE066'); R(g, 415, 54, 5, 1, '#FFFFFF');
  panel(g, 372, 72, 102, 34); ptext(g, '任务', 378, 75, '#FFE066'); ptext(g, '一个人过完圣诞', 378, 89, '#FFFFFF');
  panel(g, 372, 110, 102, 22); ptext(g, '队友', 378, 114, '#9FE8FF'); ptext(g, '—— 空 ——', 408, 114, '#8090C8');
  // 道具栏：麦克风、围巾、热可可、半张合照（伏笔）
  for (let i = 0; i < 4; i++) { const x = 380 + i * 24, y = 180; panel(g, x, y, 22, 22, { bg: i === 3 ? '#3A2A10' : '#101A44' }); }
  R(g, 389, 186, 4, 6, '#9A9AB8'); R(g, 390, 192, 2, 7, '#2A2438'); R(g, 389, 186, 4, 2, '#E0E0F0');
  R(g, 409, 187, 12, 4, '#D8323C'); R(g, 416, 191, 4, 8, '#D8323C'); R(g, 409, 187, 12, 1, '#F06A74');
  R(g, 433, 188, 9, 10, '#F4EAD8'); R(g, 442, 190, 3, 5, '#F4EAD8'); R(g, 434, 189, 7, 2, '#6A3A20'); R(g, 436, 184, 1, 3, '#C9D3EE'); R(g, 439, 183, 1, 3, '#C9D3EE');
  R(g, 456, 185, 9, 13, '#FFFFFF'); R(g, 457, 186, 7, 9, '#6A70B0'); mini(g, 457, 196, {}); for (let j = 0; j < 13; j += 2) R(g, 465, 185 + j, 1, 1, '#FFFFFF'); ptext(g, '？', 464, 176, '#FFE066', { ol: '#3A2A10' }); soft(G, 462, 192, 12, '#FFD54A', .7);
  // 对话框
  panel(g, 6, 210, 468, 54); panel(g, 14, 202, 46, 16, { bg: '#3A2A10' }); ptext(g, '旁白', 24, 203, '#FFE9A0');
  ptext(g, '圣诞节 剩下单人的剩单节', 22, 224, '#FFFFFF', { s: 2, sh: '#0A0E24' });
  R(g, 452, 250, 9, 1, '#FFE066'); R(g, 453, 251, 7, 1, '#FFE066'); R(g, 454, 252, 5, 1, '#FFE066'); R(g, 455, 253, 3, 1, '#FFE066'); R(g, 456, 254, 1, 1, '#FFE066');
  ptext(g, '甜菜', 366, 9, '#FFFFFF', { align: 'r', ol: '#0A0E24' });
  compose(main, g, G, { vig: .3, g1: .55, g2: .35 });
};

FRAMES['2b'] = async (main) => {
  const g = mk(PW, PH), G = mk(PW, PH);
  // 战斗背景：她身后放光
  vgrad(g, 0, 0, PW, 150, ['#1A1040', '#3A1A60', '#6A2A78', '#B04A7A', '#F08A80']);
  const BX = 340, BY = 96;
  field(g, 0, 0, PW, 150, '#FFE9A0', (x, y) => { const a = Math.atan2(y - BY, x - BX), d = Math.hypot(x - BX, y - BY); return (fl((a + Math.PI) / (Math.PI / 14)) & 1) ? Math.max(0, .5 - d / 520) : 0; });
  soft(g, BX, BY, 120, '#FFF4C0', .6); soft(G, BX, BY, 90, '#FFB870', .35);
  for (let x = 0; x < PW; x++) { const h = 16 + 10 * Math.sin(x / 31) + 5 * Math.sin(x / 11 + 2); R(g, x, 150 - h, 1, h, '#3A2060'); R(g, x, 150 - h, 1, 2, '#C8A0E0'); }
  // 地面：往远处收的格子
  vgrad(g, 0, 150, PW, 60, ['#B8A8E8', '#D8D0F8', '#EEF0FF']);
  for (let i = -12; i <= 12; i++) line(g, 240 + i * 14, 150, 240 + i * 60, 210, '#A898D8'); for (let j = 0; j < 6; j++) R(g, 0, 150 + fl(j * j * 1.9 + j * 2), PW, 1, '#A898D8');
  // Boss：她的笑容
  ell(g, BX, 190, 46, 8, '#8878C0', .7);
  chibi(g, BX, 190, 124, { ...GIRL, eyes: 'happy', mouth: 'smile', rim: '#FFF4C0' });
  [[270, 40], [410, 34], [286, 96], [424, 110], [300, 20], [392, 70], [258, 130], [438, 60]].forEach(([x, y], i) => sparkle(g, G, x, y, i % 2 ? '#FFFFFF' : '#FFE9A0', 2 + (i % 3)));
  // 笑容打过来的光
  field(g, 90, 60, 250, 120, '#FFF4C0', (x, y) => { const t = (BX - 40 - x) / 190; if (t < 0 || t > 1) return 0; const cy = 104 + t * 44, hw = 3 + t * 16; const d = Math.abs(y - cy) / hw; return d < 1 ? .75 * (1 - d * d) : 0; });
  field(G, 90, 60, 250, 120, '#FFB040', (x, y) => { const t = (BX - 40 - x) / 190; if (t < 0 || t > 1) return 0; const cy = 104 + t * 44, hw = 3 + t * 16; return Math.abs(y - cy) < hw ? .9 : 0; });
  // 主角：被打飞一点，眼泪
  ell(g, 104, 192, 20, 4, '#8878C0', .7);
  { const b = chibi(null, 0, 0, 50, { ...HERO, eyes: 'shut', mouth: 'o', tear: 1.2, arms: 'mic', wind: 1, buf: 1 }); rotBlit(g, b, 100, 152, -.22); }
  for (let i = 0; i < 9; i++) { const a = -2.4 + i * .5; line(g, 104 + Math.cos(a) * 34, 150 + Math.sin(a) * 30, 104 + Math.cos(a) * 44, 150 + Math.sin(a) * 39, '#FFFFFF'); }
  ptext(g, '-9999', 76, 84, '#FF3A4A', { s: 2, ol: '#FFFFFF' }); ptext(g, '会心一击！', 66, 70, '#FFE066', { ol: '#3A1A60' });
  ptext(g, 'MISS', 236, 116, '#C8D4FF', { ol: '#3A1A60' }); ptext(g, '唱歌 没有效果', 196, 44, '#FFFFFF', { ol: '#3A1A60' });
  // 状态图标：依赖、耍赖
  panel(g, 132, 118, 30, 16, { bg: '#5A2A6A' }); ptext(g, '依赖', 135, 119, '#FFB8E8'); panel(g, 132, 136, 30, 16, { bg: '#2A4A6A' }); ptext(g, '耍赖', 135, 137, '#9FE8FF');
  snow(g, 31, 120, 1, '#FFFFFF', 1, [0, 0, PW, 206]); snow(g, 32, 30, 2, '#FFFFFF', 1, [0, 0, PW, 206]);
  // ---- 界面 ----
  panel(g, 196, 6, 232, 30, { bg: '#40102A' }); ptext(g, 'BOSS', 202, 9, '#FF6A8A'); ptext(g, '你的笑容', 234, 9, '#FFFFFF'); ptext(g, 'Lv.99', 392, 9, '#FFE066');
  bar(g, 203, 26, 218, 1, '#FF5A8A');
  panel(g, 6, 6, 108, 20); ptext(g, '第 3 回合', 12, 9, '#FFFFFF'); ptext(g, '逃不掉', 70, 9, '#FF8AA0');
  // 指令
  panel(g, 6, 206, 100, 60); ['唱歌', '耍赖', '哭个痛快', '逃跑'].forEach((s, i) => { ptext(g, s, 28, 209 + i * 13, i === 3 ? '#5A6AA0' : i === 2 ? '#FFE066' : '#FFFFFF'); });
  R(g, 14, 239, 2, 7, '#FFE066'); R(g, 16, 240, 2, 5, '#FFE066'); R(g, 18, 241, 2, 3, '#FFE066'); R(g, 20, 242, 1, 1, '#FFE066'); R(g, 28, 258, 24, 1, '#5A6AA0');
  // 歌词在战斗记录里
  panel(g, 110, 206, 238, 60); ptext(g, '我承认', 122, 213, '#FFFFFF', { s: 2, sh: '#0A0E24' }); ptext(g, '我是爱情里的废柴', 122, 238, '#FFE066', { s: 2, sh: '#0A0E24' });
  // 主角状态
  panel(g, 352, 206, 122, 60); ptext(g, '废柴', 358, 209, '#FFFFFF'); ptext(g, 'Lv.1', 388, 209, '#FFE066');
  ptext(g, '心', 358, 223, '#FF8AA0'); bar(g, 374, 228, 60, .02, '#FF5A6A'); ptext(g, '1', 440, 223, '#FF6A6A');
  ptext(g, '勇', 358, 237, '#9FE8FF'); bar(g, 374, 242, 60, 0, '#5AB8FF'); ptext(g, '0', 440, 237, '#FFFFFF');
  ptext(g, '状态 依赖 耍赖', 358, 251, '#C8B0F0');
  ptext(g, '甜菜', PW - 10, 12, '#FFFFFF', { align: 'r', ol: '#0A0E24' });
  compose(main, g, G, { vig: .3, g1: .5, g2: .4 });
};
