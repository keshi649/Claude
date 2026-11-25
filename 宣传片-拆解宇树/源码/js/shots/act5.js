// 第五部“看懂这门生意”（50.75–56）：售价往下、毛利率往上的两条线 → 安全六问
import * as THREE from 'three';
import { Particles } from '../core/fx3d.js';
import { kinetic, text, tag, F, font } from '../core/text.js';
import { grid, roundRect, slate } from '../core/hud.js';
import { clamp, ease, lerp, COL, window01, TAU, rng, hash } from '../core/util.js';
import { shot, cam } from './common.js';

// 书里第 16 章表 16-1（四足机器人，来自招股书）
const YEARS = ['2023', '2024', '2025'];
const PRICE = [3.83, 3.23, 3.03];
const MARGIN = [43.71, 51.65, 56.72];

const SIX = ['固件是最新的吗？', '默认密码改了吗？', '远程访问关了吗？', '网络隔离了吗？', '相机和麦克风的数据去了哪？', '知道怎么一键急停吗？'];

export function act5(E) {
  const out = [];
  // 背景里缓慢上升的光点（两个镜头共用）
  const scene = new THREE.Scene();
  const P = new Particles(260, { intensity: 1.4 }); P.mat.uniforms.scale.value = 2500 * E.scale; scene.add(P.points);
  const R = rng(55);
  const base = Array.from({ length: 260 }, () => [R() * 8 - 4, R() * 12 - 6, -R() * 6 - 1, R(), R()]);
  const camera = cam(40); camera.position.set(0, 0, 4); camera.lookAt(0, 0, 0);
  const tickBg = (t, warm) => {
    for (let i = 0; i < base.length; i++) {
      const b = base[i];
      const y = ((b[1] + t * (0.3 + 0.5 * b[3]) + 6) % 12) - 6;
      P.set(i, b[0], y, b[2], 0.03 + 0.05 * b[4], 0.4 + 0.4 * b[3], warm ? 1 : 0.6, warm ? 0.6 : 0.9, warm ? 0.3 : 1);
    }
    P.commit();
  };

  out.push(shot({
    id: 'S22', start: 50.75, end: 54, scene, camera, clear: 0x0d0f13,
    look: { grain: 0.05, vignette: 0.6, chroma: 0.3 },
    baseBloom: { strength: 0.5, radius: 0.5, threshold: 1.0 },
    frame(E, lt, ctx) {
      tickBg(lt, true);
      grid(ctx, 1080, 1920, 60, { alpha: 0.06 });
      kinetic(ctx, '越卖越便宜，', 540, 250, lt - 0.05, { size: 104, family: F.title, weight: 400, mode: 'drop', stagger: 0.05 });
      kinetic(ctx, '却越来越赚钱？', 540, 385, lt - 0.4, { size: 104, family: F.title, weight: 400, mode: 'drop', stagger: 0.05, color: COL.orange });
      // 图表区
      const L = 150, Rr = 930, T = 600, B = 1300;
      const a = clamp((lt - 0.3) / 0.3);
      ctx.save(); ctx.globalAlpha = a;
      ctx.strokeStyle = 'rgba(243,240,233,0.25)'; ctx.lineWidth = 2;
      for (let i = 0; i <= 4; i++) { const y = T + (B - T) * i / 4; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(Rr, y); ctx.stroke(); }
      font(ctx, 40, F.num, 400); ctx.fillStyle = COL.steel; ctx.textAlign = 'center';
      const xs = YEARS.map((_, i) => L + 60 + (Rr - L - 120) * i / 2);
      YEARS.forEach((y, i) => ctx.fillText(y, xs[i], B + 60));
      font(ctx, 30, F.sans, 700); ctx.textAlign = 'left'; ctx.fillStyle = COL.bone; ctx.fillText('平均售价（万元）', L, T - 40);
      ctx.textAlign = 'right'; ctx.fillStyle = COL.orange; ctx.fillText('毛利率', Rr, T - 40);
      ctx.restore();
      // 两条线：各用自己的纵轴，画成一个 X
      const yP = (v) => lerp(T + 60, B - 60, (3.95 - v) / (3.95 - 2.95));
      const yM = (v) => lerp(B - 60, T + 60, (v - 42) / (58 - 42));
      const draw = (vals, yf, color, fmt, t0) => {
        const p = clamp((lt - t0) / 1.3);
        const seg = p * 2;
        ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 10; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.shadowColor = color; ctx.shadowBlur = 18;
        ctx.beginPath(); ctx.moveTo(xs[0], yf(vals[0]));
        for (let i = 1; i <= 2; i++) {
          const k = clamp(seg - (i - 1));
          if (k <= 0) break;
          ctx.lineTo(lerp(xs[i - 1], xs[i], k), lerp(yf(vals[i - 1]), yf(vals[i]), k));
        }
        ctx.stroke(); ctx.shadowBlur = 0;
        for (let i = 0; i <= 2; i++) {
          const k = clamp((seg - i + 0.15) / 0.3);
          if (k <= 0) continue;
          ctx.fillStyle = color; ctx.beginPath(); ctx.arc(xs[i], yf(vals[i]), 14 * ease.outBack(k), 0, TAU); ctx.fill();
          font(ctx, 56, F.num, 400); ctx.textAlign = 'center'; ctx.globalAlpha = k;
          ctx.fillText(fmt(vals[i]), xs[i], yf(vals[i]) + (color === COL.orange ? -34 : 64));
          ctx.globalAlpha = 1;
        }
        ctx.restore();
      };
      draw(PRICE, yP, COL.bone, (v) => v.toFixed(2), 0.55);
      draw(MARGIN, yM, COL.orange, (v) => v.toFixed(2) + '%', 0.75);
      // 结论
      const c = clamp((lt - 2.25) / 0.25);
      if (c > 0) {
        ctx.save(); ctx.globalAlpha = c;
        ctx.fillStyle = 'rgba(13,15,19,0.8)'; roundRect(ctx, 110, 1440, 860, 250, 24); ctx.fill();
        font(ctx, 44, F.sans, 700); ctx.textAlign = 'left'; ctx.fillStyle = COL.bone;
        ctx.fillText('售价', 160, 1520); ctx.fillText('毛利率', 160, 1630);
        font(ctx, 78, F.num, 400); ctx.textAlign = 'right';
        ctx.fillStyle = COL.bone; ctx.fillText('3.83 → 3.03 万', 920, 1532);
        ctx.fillStyle = COL.orange; ctx.fillText('43.71% → 56.72%', 920, 1642);
        ctx.restore();
      }
      text(ctx, '四足机器人 · 2023–2025 · 数据来自招股书', 540, 1745, { size: 30, weight: 700, color: COL.steel, alpha: window01(lt, 1.0, 3.4, 0.3, 0.2) });
      tag(ctx, '第 16 章 · 便宜的秘密', 540, 1815, { size: 30, bg: 'rgba(243,240,233,0.12)', color: COL.steel, weight: 700, alpha: window01(lt, 1.0, 3.4, 0.3, 0.2) });
    },
  }));

  out.push(shot({
    id: 'S23', start: 54, end: 56, scene, camera, clear: 0x0d0f13,
    look: { grain: 0.05, vignette: 0.65, chroma: 0.3 },
    baseBloom: { strength: 0.5, radius: 0.5, threshold: 1.0 },
    frame(E, lt, ctx) {
      tickBg(lt + 3.25, false);
      grid(ctx, 1080, 1920, 60, { alpha: 0.06 });
      kinetic(ctx, '安全六问', 540, 250, lt, { size: 130, family: F.title, weight: 400, mode: 'slam', dur: 0.2 });
      text(ctx, '机器人进家门之前', 540, 380, { size: 48, weight: 700, color: COL.steel, alpha: clamp((lt - 0.15) / 0.2) });
      SIX.forEach((q, i) => {
        const t0 = 0.25 + i * 0.125;
        const k = clamp((lt - t0) / 0.22);
        if (k <= 0) return;
        const e = ease.outBack(k, 1.4);
        const y = 520 + i * 158;
        const x = 540 + (1 - e) * (i % 2 ? 900 : -900);
        ctx.save(); ctx.translate(x, y); ctx.rotate((i % 2 ? 1 : -1) * 0.025 * (1 - k * 0.6));
        const last = i === 5;
        ctx.fillStyle = last ? COL.orange : '#1f232a'; roundRect(ctx, -440, -62, 880, 124, 18); ctx.fill();
        ctx.strokeStyle = last ? COL.orange : 'rgba(243,240,233,0.25)'; ctx.lineWidth = 3; roundRect(ctx, -440, -62, 880, 124, 18); ctx.stroke();
        font(ctx, 64, F.num, 400); ctx.fillStyle = last ? '#14161A' : COL.orange; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), -400, 4);
        font(ctx, q.length > 11 ? 46 : 52, F.sans, 900); ctx.fillStyle = last ? '#14161A' : COL.bone;
        ctx.fillText(q, -330, 2);
        ctx.restore();
      });
      // 急停按钮
      const kb = clamp((lt - 1.25) / 0.15);
      if (kb > 0) {
        const press = lt > 1.5 ? 1 : 0;
        const cx = 540, cy = 1560, r = 120 * ease.outBack(kb, 2);
        ctx.save();
        ctx.fillStyle = '#E8C340'; ctx.beginPath(); ctx.arc(cx, cy, r * 1.25, 0, TAU); ctx.fill();
        ctx.fillStyle = press ? '#B3262B' : COL.red; ctx.shadowColor = COL.red; ctx.shadowBlur = press ? 40 : 10;
        ctx.beginPath(); ctx.arc(cx, cy + press * 8, r * (press ? 0.92 : 1), 0, TAU); ctx.fill();
        ctx.shadowBlur = 0; font(ctx, 54, F.sans, 900); ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('急停', cx, cy + press * 8);
        ctx.restore();
      }
      tag(ctx, '第 17 章 · 附录', 540, 1790, { size: 30, bg: 'rgba(243,240,233,0.12)', color: COL.steel, weight: 700, alpha: window01(lt, 0.5, 2.2, 0.3, 0.2) });
    },
  }));
  return out;
}
