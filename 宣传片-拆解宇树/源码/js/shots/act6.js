// 第六部“走进来”（56.75–62）：六种背景接到机器人身上 → 90 天日历
import * as THREE from 'three';
import { makeMats } from '../models/materials.js';
import { buildHumanoid, placeOnGround, POSE } from '../models/humanoid.js';
import { studioLights, withEnv, gridFloor, contactShadow, dustField } from '../core/fx3d.js';
import { kinetic, text, tag, F, font } from '../core/text.js';
import { grid, roundRect, stamp } from '../core/hud.js';
import { clamp, ease, lerp, COL, window01, TAU } from '../core/util.js';
import { shot, cam, toScreen } from './common.js';

// 第 18 章“六种背景，六个接口”：每种背景接到机器人的哪一段
const LINKS = [
  ['互联网后端', '软件和云端', 'spine', [0, 0.2, -0.12], 'L'],
  ['算法工程师', '大脑', 'head', [0, 0.16, 0], 'R'],
  ['自动驾驶', '感知和定位', 'head', [0.06, 0.09, 0.08], 'L'],
  ['电机电控', '关节', 'kneeR', [0, 0, 0], 'R'],
  ['机械结构', '骨架和外壳', 'hipL', [0, -0.16, 0], 'L'],
  ['工业自动化', '部署和产线', 'ankleR', [0, -0.03, 0.08], 'R'],
];

export function act6(E) {
  const out = [];
  {
    const M = makeMats();
    const scene = withEnv(E, new THREE.Scene(), 0.5);
    studioLights(scene, { keyI: 2.2, rimI: 4.5, coolI: 2.2 });
    const floor = gridFloor({ size: 40, step: 0.5, intensity: 0.3, fade: 8 }); scene.add(floor);
    const H = buildHumanoid(M); scene.add(H);
    const sh = contactShadow(1.0, 0.6); sh.position.y = 0.002; scene.add(sh);
    const dust = dustField(160, [[-3, 0, -3], [3, 3, 1]], 12, { size: [0.01, 0.03] }); dust.mat.uniforms.scale.value = 2500 * E.scale; scene.add(dust.points);
    const camera = cam(32);
    out.push(shot({
      id: 'S25', start: 56.75, end: 59, scene, camera, clear: 0x0b0d11,
      look: { grain: 0.05, vignette: 0.65, chroma: 0.3 },
      baseBloom: { strength: 0.45, radius: 0.5, threshold: 1.35 },
      baseGrade: { exposure: 0.9 },
      frame(E, lt, ctx) {
        dust.update(lt);
        placeOnGround(H, { ...POSE.stand, spine: 0.02 + Math.sin(lt * 2) * 0.01 }, { yaw: -0.35 + lt * 0.12 });
        camera.position.set(0.25, 0.8, 4.1 - lt * 0.12); camera.lookAt(0, 0.95, 0); camera.updateMatrixWorld();
        H.updateMatrixWorld(true);
        const tg = ctx.createLinearGradient(0, 120, 0, 520); tg.addColorStop(0, 'rgba(11,13,17,0.9)'); tg.addColorStop(1, 'rgba(11,13,17,0)');
        ctx.fillStyle = tg; ctx.fillRect(0, 120, 1080, 400);
        kinetic(ctx, '你的经验，', 540, 240, lt - 0.05, { size: 96, family: F.title, weight: 400, mode: 'drop', stagger: 0.05 });
        kinetic(ctx, '能接上哪一段？', 540, 370, lt - 0.35, { size: 96, family: F.title, weight: 400, mode: 'drop', stagger: 0.05, color: COL.orange });
        LINKS.forEach(([who, part, joint, off, side], i) => {
          const t0 = 0.5 + i * 0.25;
          const k = clamp((lt - t0) / 0.32);
          if (k <= 0) return;
          const v = new THREE.Vector3(...off); H.userData.J[joint].localToWorld(v);
          const s = toScreen(v, camera);
          const lx = side === 'L' ? 70 : 965;
          const ly = 560 + i * 200;
          const e = ease.outCubic(k);
          // 标签从屏幕外飞到侧边，再拉一根线到身体上
          const tx = side === 'L' ? lerp(-420, lx, e) : lerp(1500, lx, e);
          ctx.save();
          font(ctx, 46, F.sans, 900);
          const w = Math.max(ctx.measureText(who).width, 0) + 40;
          const bx = side === 'L' ? tx : tx - w;
          ctx.fillStyle = 'rgba(13,15,19,0.85)'; roundRect(ctx, bx, ly - 50, w, 100, 16); ctx.fill();
          ctx.strokeStyle = COL.orange; ctx.lineWidth = 3; roundRect(ctx, bx, ly - 50, w, 100, 16); ctx.stroke();
          ctx.fillStyle = COL.bone; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(who, bx + w / 2, ly - 8);
          font(ctx, 28, F.sans, 700); ctx.fillStyle = COL.orange; ctx.fillText('→ ' + part, bx + w / 2, ly + 30);
          const lk = clamp((lt - t0 - 0.25) / 0.25);
          if (lk > 0) {
            const ex = side === 'L' ? bx + w : bx, ey = ly;
            ctx.strokeStyle = 'rgba(238,106,31,0.85)'; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
            ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(lerp(ex, s.x, lk), lerp(ey, s.y, lk)); ctx.stroke(); ctx.setLineDash([]);
            if (lk >= 1) { ctx.fillStyle = COL.orange; ctx.shadowColor = COL.orange; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(s.x, s.y, 12, 0, TAU); ctx.fill(); }
          }
          ctx.restore();
        });
        tag(ctx, '第 18 章 · 岗位地图', 540, 1800, { size: 30, bg: 'rgba(243,240,233,0.12)', color: COL.steel, weight: 700, alpha: window01(lt, 0.5, 2.4, 0.3, 0.2) });
      },
    }));
  }
  {
    const MILES = [[30, '让机器狗站起来'], [60, '训练会走路的策略'], [90, '模仿学习小项目']];
    out.push(shot({
      id: 'S26', start: 59, end: 62, clear: 0x0d0f13,
      look: { grain: 0.05, vignette: 0.6, chroma: 0.3 },
      baseBloom: { strength: 0 },
      frame(E, lt, ctx) {
        grid(ctx, 1080, 1920, 60, { alpha: 0.07, oy: lt * 30 });
        kinetic(ctx, '不买真机，', 540, 240, lt - 0.05, { size: 100, family: F.title, weight: 400, mode: 'drop', stagger: 0.05 });
        kinetic(ctx, '90 天上车', 540, 380, lt - 0.3, { size: 120, family: F.title, weight: 400, mode: 'drop', stagger: 0.05, color: COL.orange });
        // 日历：翻页的数字
        const fk = clamp((lt - 0.35) / 2.15);
        const day = Math.max(1, Math.min(90, Math.round(1 + 89 * ease.inOutQuad(fk))));
        const flip = (lt * 18) % 1;
        const cx = 540, cy = 860, w = 560, h = 520;
        ctx.save();
        ctx.fillStyle = '#E9E4DA'; roundRect(ctx, cx - w / 2, cy - h / 2, w, h, 30); ctx.fill();
        ctx.fillStyle = COL.orange; roundRect(ctx, cx - w / 2, cy - h / 2, w, 120, 30); ctx.fill(); ctx.fillRect(cx - w / 2, cy - h / 2 + 60, w, 60);
        for (const rx of [-170, 170]) { ctx.fillStyle = '#2b2f36'; roundRect(ctx, cx + rx - 14, cy - h / 2 - 40, 28, 80, 14); ctx.fill(); }
        font(ctx, 52, F.sans, 900); ctx.fillStyle = '#14161A'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('第', cx - 190, cy - h / 2 + 62); ctx.fillText('天', cx + 190, cy - h / 2 + 62);
        // 数字在翻：上半页往下压的效果
        const sq = day < 90 && fk < 1 ? 1 - 0.25 * Math.sin(flip * Math.PI) : 1;
        ctx.save(); ctx.translate(cx, cy + 60); ctx.scale(1, sq);
        font(ctx, 330, F.num, 400); ctx.fillStyle = '#14161A'; ctx.fillText(String(day), 0, 18);
        ctx.restore();
        ctx.strokeStyle = 'rgba(20,22,26,0.18)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx - w / 2 + 20, cy + 60); ctx.lineTo(cx + w / 2 - 20, cy + 60); ctx.stroke();
        ctx.restore();
        // 进度条和三个里程碑
        const bx0 = 140, bx1 = 940, by = 1240;
        ctx.fillStyle = 'rgba(243,240,233,0.15)'; ctx.fillRect(bx0, by, bx1 - bx0, 14);
        ctx.fillStyle = COL.orange; ctx.fillRect(bx0, by, (bx1 - bx0) * (day / 90), 14);
        MILES.forEach(([d, label], i) => {
          const x = bx0 + (bx1 - bx0) * d / 90;
          const on = day >= d;
          ctx.fillStyle = on ? COL.orange : '#2b2f36'; ctx.beginPath(); ctx.arc(x, by + 7, 22, 0, TAU); ctx.fill();
          font(ctx, 36, F.num, 400); ctx.fillStyle = on ? '#14161A' : COL.steel; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(i + 1), x, by + 9);
          const tOn = 0.35 + 2.25 * ((d - 1) / 89 === 1 ? 1 : 0) ;
          void tOn;
          if (on) {
            const ly = 1360 + i * 120;
            font(ctx, 42, F.sans, 900); ctx.textAlign = 'left'; ctx.fillStyle = COL.bone;
            ctx.fillText(`第 ${d} 天`, 150, ly);
            ctx.fillStyle = COL.orange; ctx.fillText(label, 360, ly);
          }
        });
        if (day >= 90) stamp(ctx, '上车', 860, 1000, lt - 2.5, { size: 90, rot: -0.2, color: COL.orange, seed: 9 });
        tag(ctx, '第 19 章 · 三个仿真项目', 540, 1800, { size: 30, bg: 'rgba(243,240,233,0.12)', color: COL.steel, weight: 700, alpha: window01(lt, 0.5, 3.2, 0.3, 0.2) });
      },
    }));
  }
  return out;
}
