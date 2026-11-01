// 字幕层上的动态文字。坐标都是 1080×1920 的设计坐标。
import { clamp, ease, prog, rng, hash, spring, COL } from './util.js';

export const F = {
  title: '"Smiley", "Noto Sans CJK SC", sans-serif',
  sans: '"Noto Sans CJK SC", sans-serif',
  num: '"Bebas", "Noto Sans CJK SC", sans-serif',
  mono: '"JBMono", "Noto Sans CJK SC", monospace',
};

export function font(ctx, size, family = F.sans, weight = 900) {
  ctx.font = `${weight} ${size}px ${family}`;
}

const chars = (s) => Array.from(s);

// 逐字排版：返回每个字的 x 偏移和总宽
export function layout(ctx, str, spacing = 0) {
  const cs = chars(str);
  const xs = [];
  let x = 0;
  for (const c of cs) { xs.push(x); x += ctx.measureText(c).width + spacing; }
  return { cs, xs, w: x - spacing };
}

// 静态文字（带描边、发光、阴影）
export function text(ctx, str, x, y, o = {}) {
  ctx.save();
  font(ctx, o.size || 60, o.family || F.sans, o.weight ?? 900);
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = o.baseline || 'middle';
  ctx.globalAlpha = o.alpha ?? 1;
  if (o.spacing) ctx.letterSpacing = `${o.spacing}px`;
  if (o.glow) { ctx.shadowColor = o.glowColor || o.color || COL.bone; ctx.shadowBlur = o.glow; }
  if (o.stroke) { ctx.lineWidth = o.stroke; ctx.strokeStyle = o.strokeColor || COL.ink; ctx.lineJoin = 'round'; ctx.strokeText(str, x, y); }
  if (!o.outlineOnly) { ctx.fillStyle = o.color || COL.bone; ctx.fillText(str, x, y); }
  ctx.restore();
}

// 逐字动画。mode：
//   pop   —— 每个字从大缩回原尺寸、淡入
//   drop  —— 从上面掉下来，弹簧落定
//   rise  —— 从基线下方被遮罩“长”出来
//   slam  —— 整体从很大砸到原尺寸（逐字错开很小）
//   type  —— 打字机，带光标
//   decode—— 乱码逐字解出来
// lt 是这一行开始后的秒数；out 给出场时刻（相对），出场时逐字向上淡出
export function kinetic(ctx, str, x, y, lt, o = {}) {
  const size = o.size || 72;
  const mode = o.mode || 'pop';
  const stag = o.stagger ?? 0.04;
  const dur = o.dur ?? 0.45;
  ctx.save();
  font(ctx, size, o.family || F.sans, o.weight ?? 900);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const sp = o.spacing || 0;
  const L = layout(ctx, str, sp);
  const align = o.align || 'center';
  const x0 = align === 'center' ? x - L.w / 2 : align === 'right' ? x - L.w : x;
  const R = rng(o.seed || 7);
  const glyphs = '01机器人电机关节扭矩算法数据#%&@$▓░▒<>/\\';
  const n = L.cs.length;
  for (let i = 0; i < n; i++) {
    const c = L.cs[i];
    const ti = lt - i * stag;
    let a = 1, sx = 1, dy = 0, dx = 0, rot = 0, ch = c, blur = 0;
    if (mode === 'pop') {
      const k = clamp(ti / dur);
      a = ease.outCubic(k); sx = 1 + 0.9 * (1 - ease.outBack(k, 2.2)); dy = 0;
    } else if (mode === 'drop') {
      const k = Math.max(0, ti);
      a = clamp(ti / 0.12); dy = -(1 - spring(k, 2.6, 0.32)) * size * 1.4; rot = (1 - clamp(k / 0.35)) * (R() - 0.5) * 0.5;
    } else if (mode === 'rise') {
      const k = ease.outExpo(clamp(ti / dur));
      a = 1; dy = (1 - k) * size * 1.1;
      // 遮罩：只显示基线以上
      ctx.save();
      ctx.beginPath(); ctx.rect(x0 + L.xs[i] - 4, y - size * 0.75, size * 1.5, size * 1.42); ctx.clip();
      drawGlyph(ctx, ch, x0 + L.xs[i], y + dy, a, 1, 0, o, size);
      ctx.restore();
      continue;
    } else if (mode === 'slam') {
      const k = clamp(lt / (o.dur ?? 0.22));
      sx = 1 + 1.8 * Math.pow(1 - ease.outQuart(k), 2);
      a = clamp(lt / 0.06);
      blur = (1 - k) * 18;
    } else if (mode === 'type') {
      a = ti >= 0 ? 1 : 0;
    } else if (mode === 'decode') {
      const res = ti - 0.18;
      a = ti >= 0 ? 1 : 0;
      if (ti >= 0 && res < 0) ch = glyphs[Math.floor(hash(i * 131 + Math.floor(lt * 24) * 7) * glyphs.length)];
    }
    if (o.out !== undefined && lt > o.out) {
      const ko = clamp((lt - o.out - i * (o.outStagger ?? 0.015)) / (o.outDur ?? 0.25));
      a *= 1 - ease.inCubic(ko); dy -= ease.inCubic(ko) * size * 0.5;
    }
    if (a <= 0.001) continue;
    const gx = x0 + L.xs[i] + dx;
    const gw = ctx.measureText(c).width;
    ctx.save();
    ctx.translate(gx + gw / 2, y + dy);
    ctx.rotate(rot);
    ctx.scale(sx, sx);
    if (blur > 0.5) ctx.filter = `blur(${blur.toFixed(1)}px)`;
    drawGlyph(ctx, ch, -gw / 2, 0, a, 1, 0, o, size);
    ctx.restore();
  }
  if (mode === 'type') { // 光标
    const shown = clamp(Math.floor(lt / stag) + 1, 0, n);
    const cx = x0 + (shown < n ? L.xs[shown] : L.w + 6);
    if (Math.floor(lt * 3) % 2 === 0 && (o.out === undefined || lt < o.out)) {
      ctx.fillStyle = o.cursorColor || COL.orange;
      ctx.fillRect(cx, y - size * 0.42, Math.max(4, size * 0.08), size * 0.84);
    }
  }
  ctx.restore();
  return { x0, w: L.w };
}

function drawGlyph(ctx, ch, x, y, a, s, r, o, size) {
  ctx.globalAlpha = a * (o.alpha ?? 1);
  if (o.glow) { ctx.shadowColor = o.glowColor || o.color || COL.bone; ctx.shadowBlur = o.glow; }
  if (o.stroke) { ctx.lineWidth = o.stroke; ctx.strokeStyle = o.strokeColor || COL.ink; ctx.lineJoin = 'round'; ctx.strokeText(ch, x, y); }
  if (o.gradient) {
    const g = ctx.createLinearGradient(0, y - size / 2, 0, y + size / 2);
    o.gradient.forEach((c, i) => g.addColorStop(i / (o.gradient.length - 1), c));
    ctx.fillStyle = g;
  } else ctx.fillStyle = o.color || COL.bone;
  if (!o.outlineOnly) ctx.fillText(ch, x, y);
  ctx.shadowBlur = 0;
}

// 带底条的标签（像便签或贴纸）
export function tag(ctx, str, x, y, o = {}) {
  ctx.save();
  font(ctx, o.size || 36, o.family || F.sans, o.weight ?? 700);
  const w = ctx.measureText(str).width;
  const pad = o.pad ?? 16;
  const h = (o.size || 36) * 1.45;
  const bx = o.align === 'left' ? x : o.align === 'right' ? x - w - pad * 2 : x - w / 2 - pad;
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.translate(bx + (w + pad * 2) / 2, y);
  ctx.rotate(o.rot || 0);
  ctx.scale(o.scale ?? 1, o.scale ?? 1);
  ctx.fillStyle = o.bg || COL.orange;
  ctx.fillRect(-(w + pad * 2) / 2, -h / 2, w + pad * 2, h);
  if (o.border) { ctx.strokeStyle = o.border; ctx.lineWidth = 3; ctx.strokeRect(-(w + pad * 2) / 2, -h / 2, w + pad * 2, h); }
  ctx.fillStyle = o.color || COL.ink;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(str, 0, 2);
  ctx.restore();
  return { w: w + pad * 2, h };
}

// 数字读数：从 a 跳到 b
export function countText(v, decimals = 0, sep = true) {
  const s = v.toFixed(decimals);
  if (!sep) return s;
  const [i, d] = s.split('.');
  return i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (d ? '.' + d : '');
}
