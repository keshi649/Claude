'use strict';
/* 方向 4：漫画分格。粗墨线、网点、速度线、拟声字；歌词写在黄色的旁白框和对话气泡里。 */
const NIGHT = '#1F3558', NIGHT2 = '#2F4E7E', PAPER = '#F6EEDD', RED = '#D8323C', MUS = '#E3A23C', CAPY = '#FFE066', INKC = '#1A1420';
function tone(c, x, y, w, h, col, step, rad) { c.fillStyle = col; for (let j = 0, yy = y; yy < y + h; yy += step * .5, j++) for (let xx = x + (j % 2) * step * .5; xx < x + w; xx += step) { const r = typeof rad === 'function' ? rad(xx, yy) : rad; if (r > .3) { c.beginPath(); c.arc(xx, yy, r, 0, 7); c.fill(); } } }
function panelClip(c, pts, draw) { c.save(); c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.clip(); draw(); c.restore(); c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.lineWidth = 9; c.strokeStyle = INKC; c.lineJoin = 'miter'; c.stroke(); }
function cap(c, text, x, y, o = {}) { const fs = o.fs || 46; c.save(); c.font = `${fs}px "ZCOOL KuaiLe"`; const w = c.measureText(text).width + fs * .9, h = fs * 1.5; c.translate(x, y); c.rotate(o.rot || 0); c.fillStyle = INKC; c.fillRect(7, 7, w, h); c.fillStyle = o.bg || CAPY; c.fillRect(0, 0, w, h); c.lineWidth = 5; c.strokeStyle = INKC; c.strokeRect(0, 0, w, h); c.fillStyle = INKC; c.textBaseline = 'middle'; c.fillText(text, fs * .45, h * .54); c.restore(); }
function sfx(c, text, x, y, size, rot, fill, stroke = INKC, lw = .12) { c.save(); c.translate(x, y); c.rotate(rot); c.font = `${size}px "ZCOOL QingKe HuangYou"`; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = size * lw * 2; c.strokeStyle = stroke; c.strokeText(text, 0, 0); c.fillStyle = fill; c.fillText(text, 0, 0); c.restore(); }
function speed(c, cx, cy, r0, r1, n, seed, col = INKC) { const r = rng(seed); c.fillStyle = col; for (let i = 0; i < n; i++) { const a = r() * 6.283, w = .004 + r() * .012, q0 = r0 * (.85 + r() * .5); c.beginPath(); c.moveTo(cx + Math.cos(a) * q0, cy + Math.sin(a) * q0); c.lineTo(cx + Math.cos(a - w) * r1, cy + Math.sin(a - w) * r1); c.lineTo(cx + Math.cos(a + w) * r1, cy + Math.sin(a + w) * r1); c.fill(); } }
function csnow(c, seed, n, x, y, w, h, rmax = 9) { const r = rng(seed); for (let i = 0; i < n; i++) { const q = 2 + r() * rmax; c.beginPath(); c.arc(x + r() * w, y + r() * h, q, 0, 7); c.fillStyle = '#FFFFFF'; c.fill(); if (q > 6) { c.lineWidth = 3; c.strokeStyle = INKC; c.stroke(); } } }
function cbuild(c, x, base, w, h, col, o = {}) { c.fillStyle = col; c.fillRect(x, base - h, w, h); c.lineWidth = 6; c.strokeStyle = INKC; c.strokeRect(x, base - h, w, h); c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(x - 10, base - h); c.lineTo(x + w + 10, base - h); c.lineTo(x + w + 10, base - h - 16); c.quadraticCurveTo(x + w * .5, base - h - 34, x - 10, base - h - 16); c.closePath(); c.fill(); c.stroke(); const cols = o.cols || 3, rows = o.rows || 3; for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const wx = x + w * (i + .5) / cols - w * .1, wy = base - h + 30 + j * (h - 50) / rows; c.fillStyle = ((i + j + (o.k || 0)) % 3) ? '#FFD25A' : '#16264A'; c.fillRect(wx, wy, w * .2, (h - 50) / rows * .56); c.lineWidth = 4; c.strokeRect(wx, wy, w * .2, (h - 50) / rows * .56); } }
function balloon(c, cx, cy, rx, ry, n, seed, text, fs, lines) { const r = rng(seed); c.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * 6.283, k = i % 2 ? .78 + r() * .06 : 1 + r() * .12; c.lineTo(cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k); } c.closePath(); c.fillStyle = INKC; c.save(); c.translate(8, 10); c.fill(); c.restore(); c.fillStyle = '#FFFFFF'; c.fill(); c.lineWidth = 8; c.lineJoin = 'round'; c.strokeStyle = INKC; c.stroke(); c.fillStyle = INKC; c.font = `${fs}px "ZCOOL KuaiLe"`; c.textAlign = 'center'; c.textBaseline = 'middle'; lines.forEach((s, i) => c.fillText(s, cx, cy + (i - (lines.length - 1) / 2) * fs * 1.2)); c.textAlign = 'left'; }
function cmark(c) { c.save(); c.font = '44px "ZCOOL KuaiLe"'; c.textAlign = 'right'; c.lineWidth = 8; c.lineJoin = 'round'; c.strokeStyle = INKC; c.strokeText('甜菜', 1846, 112); c.fillStyle = '#FFFFFF'; c.fillText('甜菜', 1846, 112); c.restore(); }

FRAMES['4a'] = async (c) => {
  c.fillStyle = PAPER; c.fillRect(0, 0, VW, VH); tone(c, 0, 0, VW, VH, 'rgba(120,90,60,.12)', 14, 2);
  // 第一格：整条街
  panelClip(c, [[50, 50], [1870, 50], [1870, 468], [50, 520]], () => {
    c.fillStyle = NIGHT; c.fillRect(0, 0, VW, 560); tone(c, 0, 40, VW, 300, NIGHT2, 18, (x, y) => Math.max(0, (y - 40) / 300) * 8);
    c.fillStyle = '#FFF2C8'; c.beginPath(); c.arc(1640, 150, 62, 0, 7); c.fill(); c.lineWidth = 6; c.strokeStyle = INKC; c.stroke();
    [[60, 220, 250, '#B5654A', 0], [300, 200, 300, '#4E7A8C', 1], [520, 230, 240, '#7A5A8C', 2], [1060, 210, 270, '#C89858', 1], [1290, 240, 230, '#A84A5A', 0], [1550, 200, 290, '#4E7A8C', 2], [1760, 160, 250, '#B5654A', 1]].forEach(([x, w, h, col, k]) => cbuild(c, x, 420, w, h, col, { k }));
    // 彩灯
    c.lineWidth = 4; c.strokeStyle = INKC; c.beginPath(); c.moveTo(50, 150); c.quadraticCurveTo(500, 250, 960, 150); c.quadraticCurveTo(1400, 250, 1870, 140); c.stroke();
    for (let i = 0; i < 30; i++) { const t = i / 29, x = 50 + t * 1820, y = t < .5 ? 150 + 100 * 4 * (t * 2) * (1 - t * 2) * .5 : 145 + 100 * 4 * ((t - .5) * 2) * (1 - (t - .5) * 2) * .5; c.fillStyle = ['#FF5A5A', '#FFD54A', '#5ADB7A', '#5AB8FF'][i % 4]; c.beginPath(); c.arc(x, y + 12, 9, 0, 7); c.fill(); c.lineWidth = 3; c.stroke(); }
    // 树
    for (let i = 0; i < 4; i++) { const y0 = 430 - i * 62, w = 120 - i * 24; c.fillStyle = i % 2 ? '#2E7D5A' : '#3A9068'; c.beginPath(); c.moveTo(900 - w, y0); c.lineTo(900, y0 - 110); c.lineTo(900 + w, y0); c.closePath(); c.fill(); c.lineWidth = 6; c.stroke(); } c.fillStyle = '#FFD54A'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 14 : 32; c.lineTo(900 + Math.cos(a) * rr, 120 + Math.sin(a) * rr); } c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#F2F6FF'; c.beginPath(); c.moveTo(0, 420); c.quadraticCurveTo(900, 380, 1920, 410); c.lineTo(1920, 560); c.lineTo(0, 560); c.fill(); c.lineWidth = 6; c.stroke(); tone(c, 0, 430, VW, 110, 'rgba(95,130,190,.5)', 16, (x, y) => (y - 430) / 110 * 5);
    vguy(c, 250, 500, 170, { hair: '#7A4A2A', coat: '#F08AB0', scarf: '#FFFFFF', girl: 1, hat: '#FFFFFF', pom: '#FF5A7A', eyes: 'happy', mouth: 'smile', ink: 5 }); vguy(c, 370, 500, 176, { hair: '#1B1420', coat: '#5AA0E8', scarf: '#FFD54A', eyes: 'happy', mouth: 'smile', ink: 5 });
    vguy(c, 1420, 492, 160, { hair: '#C8742E', coat: '#6CC58A', scarf: '#FFFFFF', girl: 1, mouth: 'smile', ink: 5 }); vguy(c, 1530, 492, 168, { hair: '#3A2A20', coat: '#7A6AD8', scarf: '#E0423A', mouth: 'smile', eyes: 'happy', ink: 5 });
    [[310, 290], [1476, 296]].forEach(([x, y]) => { c.fillStyle = '#FF5A7A'; c.beginPath(); c.moveTo(x, y + 30); c.bezierCurveTo(x - 36, y - 6, x - 14, y - 30, x, y - 8); c.bezierCurveTo(x + 14, y - 30, x + 36, y - 6, x, y + 30); c.fill(); c.lineWidth = 5; c.stroke(); });
    // 主角：小小的，一个人
    c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.moveTo(760, 60); c.lineTo(630, 520); c.lineTo(890, 520); c.fill();
    vguy(c, 760, 486, 150, { ...HERO, eyes: 'dn', mouth: 'flat', wind: 1, step: 1, ink: 5 });
    csnow(c, 5, 60, 50, 50, 1820, 460, 8);
    sfx(c, '沙', 590, 462, 66, -.2, '#FFFFFF', INKC, .07); sfx(c, '沙', 880, 474, 52, .15, '#FFFFFF', INKC, .07);
  });
  cap(c, '圣诞节', 84, 78, { fs: 54, rot: -.02 });
  // 第二格：脸的特写，一片雪落在鼻尖
  panelClip(c, [[50, 548], [690, 530], [660, 1030], [50, 1030]], () => {
    c.fillStyle = NIGHT2; c.fillRect(0, 500, 720, 560); speed(c, 360, 800, 250, 700, 70, 4, NIGHT); tone(c, 50, 520, 660, 520, 'rgba(255,255,255,.1)', 16, 3);
    vguy(c, 360, 1400, 760, { ...HERO, eyes: 'up', mouth: 'flat', ink: 9 });
    c.fillStyle = '#FFFFFF'; c.lineWidth = 5; c.strokeStyle = INKC; c.beginPath(); c.arc(366, 866, 15, 0, 7); c.fill(); c.stroke(); c.lineWidth = 4;[[330, 840], [404, 838], [366, 826]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x, y); c.lineTo(x + (366 - x) * .3, y + (866 - y) * .3); c.stroke(); });
    csnow(c, 9, 10, 50, 540, 130, 480, 11); csnow(c, 19, 8, 560, 540, 120, 480, 11);
  });
  cap(c, '剩下单人的', 80, 566, { fs: 46, rot: -.03 });
  // 第三格：别人成双成对，他在后面
  panelClip(c, [[718, 529], [1290, 513], [1320, 1030], [688, 1030]], () => {
    c.fillStyle = '#FFD25A'; c.fillRect(680, 500, 660, 560); tone(c, 680, 500, 660, 560, '#F0A040', 20, (x, y) => (y - 500) / 560 * 9);
    c.fillStyle = '#F2F6FF'; c.fillRect(680, 940, 660, 120); c.lineWidth = 6; c.strokeStyle = INKC; c.beginPath(); c.moveTo(680, 940); c.lineTo(1340, 940); c.stroke();
    vguy(c, 1004, 950, 120, { ...HERO, eyes: 'sad', mouth: 'frown', ink: 4 });
    vguy(c, 850, 1150, 430, { hair: '#7A4A2A', coat: '#F08AB0', scarf: '#FFFFFF', girl: 1, hat: '#FFFFFF', pom: '#FF5A7A', eyes: 'happy', mouth: 'smile', ink: 8 });
    vguy(c, 1170, 1150, 450, { hair: '#1B1420', coat: '#5AA0E8', scarf: '#FFD54A', eyes: 'happy', mouth: 'smile', ink: 8 });
    sfx(c, '哈哈', 760, 600, 70, -.12, '#FFFFFF'); sfx(c, '嘻', 1190, 640, 60, .1, '#FFFFFF');
    c.fillStyle = INKC; c.font = '40px "ZCOOL KuaiLe"'; c.fillText('……', 978, 780);
  });
  // 第四格：手机上打好了没发出去的"圣诞快乐"
  panelClip(c, [[1318, 512], [1870, 498], [1870, 1030], [1348, 1030]], () => {
    c.fillStyle = RED; c.fillRect(1300, 480, 600, 580); tone(c, 1300, 480, 600, 580, '#A01E2A', 18, (x, y) => (x - 1300) / 600 * 8);
    c.save(); c.translate(1600, 790); c.rotate(.1);
    c.fillStyle = INKC; c.beginPath(); c.roundRect(-150, -250, 320, 540, 36); c.fill(); c.fillStyle = '#F2F6FF'; c.beginPath(); c.roundRect(-136, -230, 280, 500, 22); c.fill();
    c.fillStyle = NIGHT; c.fillRect(-136, -230, 280, 70); c.fillStyle = '#FFFFFF'; c.font = '40px "ZCOOL KuaiLe"'; c.textAlign = 'center'; c.fillText('你', 4, -182); c.textAlign = 'left';
    c.fillStyle = '#C9D3EE'; c.beginPath(); c.roundRect(-120, -130, 170, 50, 16); c.fill(); c.beginPath(); c.roundRect(-120, -64, 110, 50, 16); c.fill(); c.fillStyle = '#8090B0'; c.font = '24px "ZCOOL KuaiLe"'; c.fillText('去年今天', -70, 20);
    c.fillStyle = '#FFFFFF'; c.strokeStyle = INKC; c.lineWidth = 5; c.beginPath(); c.roundRect(-124, 170, 196, 66, 14); c.fill(); c.stroke(); c.fillStyle = INKC; c.font = '38px "ZCOOL KuaiLe"'; c.fillText('圣诞快乐', -112, 216); c.fillRect(46, 182, 4, 42);
    c.fillStyle = '#5ADB7A'; c.beginPath(); c.roundRect(82, 170, 54, 66, 14); c.fill(); c.stroke(); c.fillStyle = '#FFFFFF'; c.font = '26px "ZCOOL KuaiLe"'; c.fillText('发', 96, 212);
    c.restore();
    // 悬在"发"字上面的大拇指
    c.fillStyle = '#F9DABF'; c.strokeStyle = INKC; c.lineWidth = 8; c.beginPath(); c.moveTo(1900, 1060); c.lineTo(1900, 900); c.quadraticCurveTo(1800, 840, 1730, 900); c.quadraticCurveTo(1690, 940, 1730, 970); c.quadraticCurveTo(1790, 990, 1800, 1060); c.closePath(); c.fill(); c.stroke();
    c.lineWidth = 5;[[1690, 880, 1660, 850], [1720, 862, 1706, 826], [1670, 912, 1634, 900]].forEach(([x0, y0, x1, y1]) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); });
    csnow(c, 15, 12, 1320, 500, 550, 520, 10);
  });
  cap(c, '剩单节', 1352, 536, { fs: 54, rot: -.02 });
  cmark(c);
};

FRAMES['4b'] = async (c) => {
  const CX = 960, CY = 520;
  // 放射底
  for (let i = 0; i < 36; i++) { const a0 = i / 36 * 6.283, a1 = (i + 1) / 36 * 6.283; c.fillStyle = i % 2 ? '#E8452E' : '#C8262E'; c.beginPath(); c.moveTo(CX, CY); c.lineTo(CX + Math.cos(a0) * 1600, CY + Math.sin(a0) * 1600); c.lineTo(CX + Math.cos(a1) * 1600, CY + Math.sin(a1) * 1600); c.fill(); }
  tone(c, 0, 0, VW, VH, 'rgba(255,230,120,.35)', 22, (x, y) => Math.max(0, 9 - Math.hypot(x - CX, y - CY) / 110));
  const g = c.createRadialGradient(CX, CY, 100, CX, CY, 700); g.addColorStop(0, 'rgba(255,240,170,.85)'); g.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = g; c.fillRect(0, 0, VW, VH);
  speed(c, CX, CY, 560, 1500, 120, 7);
  // 背后的大字
  c.save(); c.translate(CX, 560); c.rotate(-.07); c.font = '540px "ZCOOL QingKe HuangYou"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  [['废', -650], ['柴', 650]].forEach(([s, dx]) => { c.lineWidth = 46; c.strokeStyle = INKC; c.strokeText(s, dx, -70); c.lineWidth = 18; c.strokeStyle = '#FFFFFF'; c.strokeText(s, dx, -70); c.fillStyle = CAPY; c.fillText(s, dx, -70); }); c.restore();
  // 主角：对着麦喊，眼泪横飞
  vguy(c, CX, 1290, 920, { ...HERO, eyes: 'shut', mouth: 'shout', arms: 'mic', wind: 1, ink: 11 });
  c.fillStyle = '#8FDCFF'; c.strokeStyle = INKC; c.lineWidth = 7;
  [[-1, 0], [1, 0], [-1, 1], [1, 1]].forEach(([sd, k]) => { c.save(); c.translate(CX + sd * (250 + k * 150), 560 - k * 70); c.rotate(sd * (-1.1 + k * .2)); c.beginPath(); c.moveTo(0, -46 + k * 10); c.quadraticCurveTo(36 - k * 8, 10, 0, 34 - k * 8); c.quadraticCurveTo(-36 + k * 8, 10, 0, -46 + k * 10); c.fill(); c.stroke(); c.restore(); });
  csnow(c, 3, 46, 0, 0, VW, VH, 13);
  // 小格：她挥手走远；麦克风的线被拔了
  c.save(); c.translate(230, 890); c.rotate(-.06); c.scale(.86, .86); panelClip(c, [[-190, -170], [190, -170], [190, 170], [-190, 170]], () => { c.fillStyle = NIGHT2; c.fillRect(-200, -180, 400, 360); tone(c, -200, -180, 400, 360, NIGHT, 16, (x, y) => (170 - y) / 340 * 7); c.fillStyle = '#F2F6FF'; c.fillRect(-200, 110, 400, 80); vguy(c, 20, 130, 210, { ...GIRL, eyes: 'happy', mouth: 'smile', arms: 'upR', ink: 6 }); csnow(c, 8, 14, -190, -170, 380, 280, 7); }); cap(c, 'Goodbye', -176, -212, { fs: 40, bg: '#FFFFFF' }); c.restore();
  c.save(); c.translate(1700, 900); c.rotate(.05); c.scale(.86, .86); panelClip(c, [[-180, -150], [180, -150], [180, 150], [-180, 150]], () => { c.fillStyle = '#F6EEDD'; c.fillRect(-190, -160, 380, 320); tone(c, -190, -160, 380, 320, 'rgba(216,50,60,.35)', 16, (x, y) => (x + 190) / 380 * 7); c.strokeStyle = INKC; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(-190, 60); c.bezierCurveTo(-100, -40, -60, 120, -20, 30); c.stroke(); c.fillStyle = '#9A9AB8'; c.lineWidth = 6; c.beginPath(); c.roundRect(-30, 0, 60, 40, 8); c.fill(); c.stroke(); c.fillRect(30, 8, 26, 8); c.fillRect(30, 24, 26, 8); c.fillStyle = '#2A2438'; c.beginPath(); c.roundRect(100, -20, 90, 90, 10); c.fill(); c.stroke(); c.fillStyle = INKC; c.fillRect(112, 6, 16, 10); c.fillRect(112, 28, 16, 10); c.lineWidth = 5;[[70, -30, 50, -60], [84, -40, 80, -76], [60, -14, 30, -30]].forEach(([x0, y0, x1, y1]) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }); }); sfx(c, '啪', 60, -150, 90, .1, CAPY); c.restore();
  // 歌词
  balloon(c, 400, 150, 350, 120, 14, 5, '', 56, ['我承认——', '我是爱情里的废柴！']);
  sfx(c, '呜哇——', 1500, 120, 96, .1, '#FFFFFF');
  cmark(c);
};
