// 第一部“认识它”：参数表（10.75–13.5）、看演示视频的五个问题（13.5–16）
import * as THREE from 'three';
import { makeMats } from '../models/materials.js';
import { buildDog, poseDog, trot, standHeight } from '../models/dog.js';
import { studioLights, withEnv, gridFloor, dustField } from '../core/fx3d.js';
import { kinetic, text, tag, F, font } from '../core/text.js';
import { stamp, roundRect, brackets, grid, scanline } from '../core/hud.js';
import { clamp, ease, lerp, COL, rng, window01, hash } from '../core/util.js';
import { shot, cam, toScreen } from './common.js';

// ---------- S06 参数表 ----------
const ROWS = [
  ['重量', 'kg', '带不带电池？'],
  ['自由度', '个', null],
  ['最大关节扭矩', 'N·m', '峰值还是额定？'],
  ['最高速度', 'm/s', '在哪测的？'],
  ['续航', 'h', '什么工况？'],
  ['算力', 'TOPS', null],
];

function drawSheet(c, t, scanY) {
  const x = c.getContext('2d');
  const W = c.width, H = c.height;
  x.fillStyle = '#E9E4DA'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#16181D'; x.fillRect(0, 0, W, 170);
  font(x, 40, F.mono, 800); x.fillStyle = COL.orange; x.textAlign = 'left'; x.textBaseline = 'middle';
  x.fillText('SPECIFICATIONS', 60, 62);
  font(x, 64, F.sans, 900); x.fillStyle = '#F3F0E9'; x.fillText('产品参数表', 60, 120);
  // 一只简笔狗
  x.strokeStyle = '#F3F0E9'; x.lineWidth = 6; x.lineCap = 'round';
  x.strokeRect(800, 60, 140, 40); x.strokeRect(930, 45, 46, 34);
  for (const lx of [815, 850, 905, 935]) { x.beginPath(); x.moveTo(lx, 100); x.lineTo(lx - 14, 128); x.lineTo(lx, 156); x.stroke(); }
  const rowH = 190, y0 = 230;
  ROWS.forEach(([name, unit, q], i) => {
    const y = y0 + i * rowH;
    const hit = scanY > y + 40;
    if (q && hit) { x.fillStyle = 'rgba(238,106,31,0.16)'; x.fillRect(0, y, W, rowH - 12); x.fillStyle = COL.orange; x.fillRect(0, y, 14, rowH - 12); }
    font(x, 58, F.sans, 900); x.fillStyle = '#16181D'; x.textAlign = 'left';
    x.fillText(name, 60, y + 70);
    // 打码的数值
    const bw = 210 + 80 * hash(i * 9);
    x.fillStyle = '#16181D'; x.fillRect(560, y + 38, bw, 64);
    x.fillStyle = 'rgba(243,240,233,0.25)';
    for (let k = 0; k < 6; k++) x.fillRect(570 + k * (bw / 6), y + 46 + ((t * 7 + k + i) % 3) * 14, bw / 9, 10);
    font(x, 40, F.mono, 700); x.fillStyle = '#4b525c'; x.fillText(unit, 580 + bw, y + 72);
    x.fillStyle = 'rgba(22,24,29,0.15)'; x.fillRect(60, y + rowH - 16, W - 120, 3);
  });
  font(x, 30, F.mono, 400); x.fillStyle = '#6b727c'; x.textAlign = 'left';
  x.fillText('* 数值已打码：这里只看“该先问什么”', 60, H - 60);
}

// ---------- S07 手机里的演示视频 ----------
const QS5 = ['遥控？', '剪辑？', '倍速？', '布置过？', '成功率？'];

export function act1(E) {
  const out = [];
  {
    const scene = withEnv(E, new THREE.Scene(), 0.3);
    const camera = cam(32);
    const sheetCanvas = document.createElement('canvas'); sheetCanvas.width = 1024; sheetCanvas.height = 1400;
    const tex = new THREE.CanvasTexture(sheetCanvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6 * 1400 / 1024), new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(0.85, 0.85, 0.85) }));
    scene.add(sheet);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 2.35), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 }));
    shadow.position.set(0.06, -0.08, -0.12); sheet.add(shadow);
    const dust = dustField(200, [[-2, -2, -2], [2, 2, 1]], 3, { color: [1, 0.8, 0.6], size: [0.01, 0.03], alpha: [0.1, 0.4] });
    dust.mat.uniforms.scale.value = 2500 * E.scale; scene.add(dust.points);
    const rowWorld = (i) => {
      const v = new THREE.Vector3((560 / 1024 - 0.5) * 1.6, (0.5 - (230 + i * 190 + 70) / 1400) * 1.6 * 1400 / 1024, 0.01);
      return sheet.localToWorld(v);
    };
    out.push(shot({
      id: 'S06', start: 10.75, end: 13.5, scene, camera, clear: 0x0d0f13,
      look: { grain: 0.05, vignette: 0.7, chroma: 0.3 },
      baseBloom: { strength: 0.3, radius: 0.4, threshold: 1.2 },
      frame(E, lt, ctx) {
        dust.update(lt);
        // 扫描线按节拍走：0.5、1.0、1.5、2.0 秒正好扫到四行要贴便签的位置
        const KEYS = [[0.2, 150], [0.5, 310], [1.0, 650], [1.5, 840], [2.0, 1030], [2.6, 1400]];
        let scanY = 150;
        for (let i = 0; i < KEYS.length - 1; i++) { const [a, ya] = KEYS[i], [b, yb] = KEYS[i + 1]; if (lt >= a) scanY = lerp(ya, yb, ease.inOutQuad(clamp((lt - a) / (b - a)))); }
        drawSheet(sheetCanvas, lt, scanY); tex.needsUpdate = true;
        const k = ease.outCubic(clamp(lt / 0.6));
        sheet.position.set(0.02, -0.3 + (1 - k) * -0.5, 0);
        sheet.rotation.set(-0.22 + 0.06 * lt / 2.75, 0.42 - 0.18 * (lt / 2.75), 0.05);
        camera.position.set(0, 0, 6.2 - 0.3 * lt); camera.lookAt(0, -0.12, 0); camera.updateMatrixWorld();
        grid(ctx, 1080, 1920, 60, { alpha: 0.05 });
        // 扫描线（贴在纸面上）
        const sy = (0.5 - scanY / 1400) * 1.6 * 1400 / 1024;
        const a = toScreen(sheet.localToWorld(new THREE.Vector3(-0.8, sy, 0.02)), camera);
        const b = toScreen(sheet.localToWorld(new THREE.Vector3(0.8, sy, 0.02)), camera);
        if (scanY > 160 && scanY < 1390) {
          ctx.save(); ctx.strokeStyle = 'rgba(92,225,230,0.95)'; ctx.lineWidth = 5; ctx.shadowColor = '#5CE1E6'; ctx.shadowBlur = 20;
          ctx.beginPath(); ctx.moveTo(a.x - 30, a.y); ctx.lineTo(b.x + 30, b.y); ctx.stroke(); ctx.restore();
        }
        // 便签：扫到哪一行，就贴一张
        ROWS.forEach(([name, , q], i) => {
          if (!q) return;
          const rowY = 230 + i * 190 + 40;
          if (scanY < rowY) return;
          const tIn = lt - ({ 0: 0.5, 2: 1.0, 3: 1.5, 4: 2.0 })[i];
          const p = toScreen(rowWorld(i), camera);
          const s = 1 + 0.6 * Math.pow(1 - ease.outBack(clamp(tIn / 0.25), 2.5), 1);
          tag(ctx, q, p.x + 120, p.y - 10, { size: 50, bg: COL.orange, color: '#14161A', rot: (i % 2 ? 0.06 : -0.07), scale: s, alpha: clamp(tIn / 0.08), weight: 900, pad: 20 });
        });
        kinetic(ctx, '十分钟读懂', 540, 250, lt, { size: 120, family: F.title, weight: 400, mode: 'drop', stagger: 0.05 });
        kinetic(ctx, '一张参数表', 540, 390, lt - 0.15, { size: 120, family: F.title, weight: 400, mode: 'drop', stagger: 0.05, color: COL.orange });
        text(ctx, '每个数字，先问一句', 540, 1690, { size: 50, weight: 700, color: COL.bone, alpha: window01(lt, 0.9, 3, 0.3, 0.2) });
        tag(ctx, '第 2 章 · 附录速查卡', 540, 1780, { size: 30, bg: 'rgba(243,240,233,0.12)', color: COL.steel, weight: 700, alpha: window01(lt, 1.1, 3, 0.3, 0.2) });
      },
    }));
  }
  {
    const M = makeMats();
    const scene = withEnv(E, new THREE.Scene(), 0.5);
    studioLights(scene, { keyI: 2.4, rimI: 4, coolI: 2 });
    const floor = gridFloor({ size: 60, step: 0.5, intensity: 0.45, fade: 14 }); scene.add(floor);
    const dog = buildDog(M); dog.rotation.order = 'YXZ'; scene.add(dog);
    const camera = cam(30);
    out.push(shot({
      id: 'S07', start: 13.5, end: 16, scene, camera, clear: 0x0b0d11,
      look: { grain: 0.05, vignette: 0.6, chroma: 0.3 },
      baseBloom: { strength: 0.5, radius: 0.5, threshold: 1.1 },
      baseGrade: { saturation: 0.9, contrast: 1.05 },
      frame(E, lt, ctx) {
        const t = lt + 2;
        const g = trot(t, { freq: 2.4, stride: 0.34 });
        const x = t * 0.9;
        poseDog(dog, { pos: [x, standHeight() + g.bob, 0], rot: [0, 0, 0], legs: g.legs });
        floor.position.x = Math.floor(x / 2.5) * 2.5;
        camera.position.set(x + 1.3, 0.75, 3.7); camera.lookAt(x - 0.08, 0.24, 0); camera.updateMatrixWorld();
        // 手机：屏幕以外全部压黑
        const px = 200, py = 470, pw = 680, ph = 1160, r = 64;
        ctx.save();
        ctx.fillStyle = '#0D0F13'; ctx.fillRect(0, 0, 1080, 1920);
        grid(ctx, 1080, 1920, 60, { alpha: 0.06 });
        ctx.globalCompositeOperation = 'destination-out';
        roundRect(ctx, px, py, pw, ph, r); ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = '#2b2f36'; ctx.lineWidth = 26; roundRect(ctx, px - 13, py - 13, pw + 26, ph + 26, r + 13); ctx.stroke();
        ctx.strokeStyle = 'rgba(243,240,233,0.55)'; ctx.lineWidth = 3; roundRect(ctx, px - 26, py - 26, pw + 52, ph + 52, r + 26); ctx.stroke();
        ctx.fillStyle = '#0D0F13'; roundRect(ctx, 540 - 70, py + 18, 140, 34, 17); ctx.fill();
        // 视频界面
        font(ctx, 32, F.mono, 800); ctx.textAlign = 'left'; ctx.fillStyle = '#E5484D';
        if (Math.floor(lt * 2.5) % 2 === 0) { ctx.beginPath(); ctx.arc(px + 50, py + 96, 11, 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = COL.bone; ctx.fillText('REC', px + 72, py + 107);
        ctx.textAlign = 'right'; ctx.fillText('4K · 60', px + pw - 40, py + 107);
        const prog = 0.18 + lt / 2.5 * 0.5;
        ctx.fillStyle = 'rgba(243,240,233,0.25)'; ctx.fillRect(px + 40, py + ph - 70, pw - 80, 6);
        ctx.fillStyle = COL.orange; ctx.fillRect(px + 40, py + ph - 70, (pw - 80) * prog, 6);
        ctx.beginPath(); ctx.arc(px + 40 + (pw - 80) * prog, py + ph - 67, 12, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // 五个问题依次盖章
        const pos = [[300, 640, -0.14], [770, 820, 0.1], [330, 1040, 0.08], [760, 1250, -0.12], [470, 1420, -0.05]];
        QS5.forEach((q, i) => stamp(ctx, q, pos[i][0], pos[i][1], lt - 0.5 - i * 0.25, { size: 76, rot: pos[i][2], color: COL.orange, seed: i + 3 }));
        kinetic(ctx, '看演示视频', 540, 205, lt, { size: 110, family: F.title, weight: 400, mode: 'drop', stagger: 0.05 });
        kinetic(ctx, '先问五个问题', 540, 335, lt - 0.2, { size: 64, weight: 900, mode: 'pop', stagger: 0.04, color: COL.orange });
        text(ctx, '附录 · 一页速查卡', 540, 1760, { size: 32, weight: 700, color: COL.steel, alpha: window01(lt, 1.0, 2.6, 0.3, 0.2) });
      },
    }));
  }
  return out;
}
