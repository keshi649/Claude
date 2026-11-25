// 抬头显示（HUD）元素：标注线、角标、准星、标尺、网格、扫描线、盖章。
import { clamp, ease, prog, hash, COL, TAU } from './util.js';
import { F, font } from './text.js';

// 四角括号框，p 控制“画出来”的程度
export function brackets(ctx, x, y, w, h, o = {}) {
  const len = o.len ?? 36, p = o.p ?? 1;
  ctx.save();
  ctx.strokeStyle = o.color || COL.bone; ctx.lineWidth = o.lw ?? 4; ctx.globalAlpha = o.alpha ?? 1;
  const l = len * ease.outCubic(clamp(p));
  const corners = [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]];
  ctx.beginPath();
  for (const [cx, cy, sx, sy] of corners) { ctx.moveTo(cx + sx * l, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + sy * l); }
  ctx.stroke();
  ctx.restore();
}

// 准星：外圈旋转的虚线环 + 十字
export function crosshair(ctx, x, y, r, t, o = {}) {
  const p = o.p ?? 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = (o.alpha ?? 1) * clamp(p * 2);
  ctx.strokeStyle = o.color || COL.orange; ctx.lineWidth = o.lw ?? 3;
  const rr = r * (1 + 1.2 * (1 - ease.outCubic(clamp(p))));
  ctx.rotate(t * 1.2);
  ctx.setLineDash([rr * 0.35, rr * 0.18]);
  ctx.beginPath(); ctx.arc(0, 0, rr, 0, TAU); ctx.stroke();
  ctx.setLineDash([]);
  ctx.rotate(-t * 2.0);
  ctx.beginPath();
  for (let i = 0; i < 4; i++) { const a = (i * TAU) / 4; ctx.moveTo(Math.cos(a) * rr * 0.55, Math.sin(a) * rr * 0.55); ctx.lineTo(Math.cos(a) * rr * 1.25, Math.sin(a) * rr * 1.25); }
  ctx.stroke();
  ctx.fillStyle = o.color || COL.orange;
  ctx.beginPath(); ctx.arc(0, 0, 4, 0, TAU); ctx.fill();
  ctx.restore();
}

// 标注线：从点 (ax, ay) 拉到 (bx, by)，再水平延伸，末端写字。p 0→1 逐段画出
export function callout(ctx, ax, ay, bx, by, label, p, o = {}) {
  ctx.save();
  ctx.globalAlpha = o.alpha ?? 1;
  const col = o.color || COL.bone;
  const dirx = o.dir ?? (bx >= ax ? 1 : -1);
  const hl = o.hlen ?? 120;
  const p1 = ease.outCubic(clamp(p / 0.45)), p2 = ease.outCubic(clamp((p - 0.35) / 0.4)), p3 = clamp((p - 0.55) / 0.45);
  ctx.strokeStyle = col; ctx.lineWidth = o.lw ?? 3;
  ctx.beginPath(); ctx.arc(ax, ay, 7 * clamp(p * 4), 0, TAU); ctx.fillStyle = o.dot || COL.orange; ctx.fill();
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + (bx - ax) * p1, ay + (by - ay) * p1); ctx.stroke();
  if (p2 > 0) { ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + dirx * hl * p2, by); ctx.stroke(); }
  if (p3 > 0 && label) {
    font(ctx, o.size || 40, o.family || F.sans, o.weight ?? 700);
    ctx.textAlign = dirx > 0 ? 'left' : 'right';
    ctx.textBaseline = 'bottom';
    ctx.globalAlpha = (o.alpha ?? 1) * ease.outCubic(p3);
    ctx.fillStyle = o.textColor || col;
    const s = Array.from(label);
    const shown = s.slice(0, Math.ceil(s.length * clamp(p3 * 1.6))).join('');
    ctx.fillText(shown, bx + dirx * 6, by - 10);
    if (o.sub) {
      font(ctx, o.subSize || 28, F.mono, 500);
      ctx.textBaseline = 'top';
      ctx.fillStyle = o.subColor || COL.steel;
      ctx.fillText(o.sub, bx + dirx * 6, by + 10);
    }
  }
  ctx.restore();
}

// 竖直标尺：从 y0（底）到 y1（顶），value 0–1 表示读数位置
export function ruler(ctx, x, y0, y1, value, o = {}) {
  ctx.save();
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.strokeStyle = o.color || COL.bone; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
  const n = o.ticks ?? 30;
  for (let i = 0; i <= n; i++) {
    const y = y0 + (y1 - y0) * (i / n);
    const big = i % 5 === 0;
    ctx.lineWidth = big ? 3 : 1.5;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - (big ? 28 : 14), y); ctx.stroke();
  }
  const vy = y0 + (y1 - y0) * clamp(value);
  ctx.fillStyle = o.accent || COL.orange;
  ctx.beginPath(); ctx.moveTo(x + 6, vy); ctx.lineTo(x + 30, vy - 14); ctx.lineTo(x + 30, vy + 14); ctx.closePath(); ctx.fill();
  ctx.fillRect(x - 40, vy - 2, 40, 4);
  if (o.label) {
    font(ctx, o.size || 64, F.num, 400);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = o.accent || COL.orange;
    ctx.fillText(o.label, x + 40, vy);
  }
  ctx.restore();
}

// 蓝图网格（2D）
export function grid(ctx, w, h, step, o = {}) {
  ctx.save();
  ctx.strokeStyle = o.color || COL.steel; ctx.globalAlpha = o.alpha ?? 0.12; ctx.lineWidth = o.lw ?? 1;
  const ox = ((o.ox || 0) % step + step) % step, oy = ((o.oy || 0) % step + step) % step;
  ctx.beginPath();
  for (let x = ox; x <= w; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
  for (let y = oy; y <= h; y += step) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
  ctx.stroke();
  ctx.restore();
}

// 一条发光的横向扫描线
export function scanline(ctx, y, w, o = {}) {
  ctx.save();
  const g = ctx.createLinearGradient(0, y - 60, 0, y + 6);
  g.addColorStop(0, 'rgba(92,225,230,0)');
  g.addColorStop(1, o.color || 'rgba(92,225,230,0.35)');
  ctx.fillStyle = g; ctx.fillRect(0, y - 60, w, 66);
  ctx.fillStyle = o.line || 'rgba(160,250,255,0.95)';
  ctx.shadowColor = o.line || '#a0faff'; ctx.shadowBlur = 18;
  ctx.fillRect(0, y - 2, w, 4);
  ctx.restore();
}

// 盖章：从大到小砸下，带一点旋转和墨色不匀
export function stamp(ctx, str, x, y, lt, o = {}) {
  if (lt < 0) return;
  const k = clamp(lt / 0.16);
  const s = 1 + 1.6 * Math.pow(1 - ease.outQuart(k), 2);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(o.rot ?? -0.12);
  ctx.scale(s, s);
  ctx.globalAlpha = clamp(lt / 0.05) * (o.alpha ?? 1);
  const size = o.size || 64;
  font(ctx, size, o.family || F.sans, 900);
  const w = ctx.measureText(str).width;
  const pad = size * 0.35;
  ctx.strokeStyle = o.color || COL.orange; ctx.lineWidth = size * 0.09;
  roundRect(ctx, -w / 2 - pad, -size * 0.75, w + pad * 2, size * 1.5, size * 0.18);
  ctx.stroke();
  ctx.fillStyle = o.color || COL.orange;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(str, 0, size * 0.04);
  // 墨色不匀：随机挖掉一些小点
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 70; i++) {
    const rx = (hash(i * 13 + (o.seed || 1)) - 0.5) * (w + pad * 2), ry = (hash(i * 29 + 5 + (o.seed || 1)) - 0.5) * size * 1.5;
    ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(rx, ry, 1.5 + hash(i * 7) * 3.5, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// 顶部的小标题条（时间码风格）
export function slate(ctx, left, right, y, a = 1) {
  ctx.save();
  ctx.globalAlpha = a;
  font(ctx, 30, F.mono, 700);
  ctx.textBaseline = 'middle';
  ctx.fillStyle = COL.orange;
  ctx.fillRect(64, y - 14, 10, 28);
  ctx.textAlign = 'left'; ctx.fillStyle = COL.bone; ctx.fillText(left, 90, y);
  if (right) { ctx.textAlign = 'right'; ctx.fillStyle = COL.steel; ctx.fillText(right, 1016, y); }
  ctx.restore();
}
