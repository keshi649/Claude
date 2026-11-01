// 第四部“让它懂”（44.75–50）：激光雷达边走边画图 → 端一杯水，洒了，瓶颈是数据
import * as THREE from 'three';
import { makeMats, RB, cyl, mesh, group } from '../models/materials.js';
import { studioLights, withEnv, gridFloor, Particles, glow, dustField } from '../core/fx3d.js';
import { kinetic, text, tag, F, font } from '../core/text.js';
import { stamp, slate, grid, scanline } from '../core/hud.js';
import { clamp, ease, lerp, COL, window01, TAU, rng } from '../core/util.js';
import { shot, cam, toScreen } from './common.js';

export function act4(E) {
  const out = [];
  // ---------- S19 激光雷达建图 ----------
  {
    const scene = new THREE.Scene();
    const R = rng(44);
    const pts = [];
    const add = (x, y, z) => pts.push([x + (R() - 0.5) * 0.02, y + (R() - 0.5) * 0.02, z + (R() - 0.5) * 0.02]);
    // 一个 L 形的走廊 + 房间：地面、墙、几个箱子、一扇门
    const W = 9, D = 7;
    for (let i = 0; i < 9000; i++) add(-W / 2 + R() * W, 0, -D / 2 + R() * D);
    for (let i = 0; i < 4200; i++) { const x = -W / 2 + R() * W, y = R() * 2.4; add(x, y, -D / 2); }
    for (let i = 0; i < 3400; i++) { const z = -D / 2 + R() * D, y = R() * 2.4; add(-W / 2, y, z); }
    for (let i = 0; i < 3400; i++) { const z = -D / 2 + R() * D, y = R() * 2.4; if (z > 0.6 && z < 1.8 && y < 2.0) continue; add(W / 2, y, z); }
    const box = (cx, cz, sx, sy, sz, n) => { for (let i = 0; i < n; i++) { const f = Math.floor(R() * 5); const u = R(), v = R(); let x, y, z; if (f === 0) { x = cx - sx / 2 + u * sx; y = sy; z = cz - sz / 2 + v * sz; } else if (f === 1) { x = cx - sx / 2; y = u * sy; z = cz - sz / 2 + v * sz; } else if (f === 2) { x = cx + sx / 2; y = u * sy; z = cz - sz / 2 + v * sz; } else if (f === 3) { x = cx - sx / 2 + u * sx; y = v * sy; z = cz - sz / 2; } else { x = cx - sx / 2 + u * sx; y = v * sy; z = cz + sz / 2; } add(x, y, z); } };
    box(-2.6, -2.2, 1.2, 0.8, 1.0, 900); box(2.4, -2.5, 1.6, 1.1, 0.8, 1000); box(0.8, 1.6, 0.9, 0.5, 0.9, 600); box(-3.2, 2.2, 1.0, 1.4, 0.6, 800);
    // 走过的路线
    const path = new THREE.CatmullRomCurve3([new THREE.Vector3(-3.5, 0, 3), new THREE.Vector3(-1.5, 0, 0.8), new THREE.Vector3(0.2, 0, -0.6), new THREE.Vector3(2.0, 0, -0.4), new THREE.Vector3(3.6, 0, 1.2)]);
    const NS = 200, samples = Array.from({ length: NS + 1 }, (_, i) => path.getPoint(i / NS));
    const P = new Particles(pts.length, { intensity: 1.6 });
    P.mat.uniforms.scale.value = 2500 * E.scale;
    const reveal = new Float32Array(pts.length);
    pts.forEach((p, i) => {
      let s = 1.2;
      for (let k = 0; k <= NS; k++) { const q = samples[k]; if ((p[0] - q.x) ** 2 + (p[2] - q.z) ** 2 < 3.2 * 3.2) { s = k / NS; break; } }
      reveal[i] = s;
    });
    scene.add(P.points);
    const trail = new THREE.Line(new THREE.BufferGeometry().setFromPoints(samples.map((v) => v.clone().setY(0.03))), new THREE.LineBasicMaterial({ color: new THREE.Color(0xff7a2a).multiplyScalar(3) }));
    scene.add(trail);
    const bot = glow(0xff8a3d, 0.5, 5); scene.add(bot);
    const ringM = new THREE.Mesh(new THREE.RingGeometry(0.98, 1.0, 96).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x5ce1e6).multiplyScalar(2.5), transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    scene.add(ringM);
    const camera = cam(40);
    out.push(shot({
      id: 'S19', start: 44.75, end: 47, scene, camera, clear: 0x06080b,
      look: { grain: 0.05, vignette: 0.7, chroma: 0.35 },
      baseBloom: { strength: 0.7, radius: 0.5, threshold: 0.95 },
      frame(E, lt, ctx) {
        const s = clamp(lt / 2.1);
        const bp = path.getPoint(s);
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          const age = (s - reveal[i]) * 2.1;
          if (age < 0) { P.set(i, 0, -50, 0, 0, 0); continue; }
          const fresh = Math.exp(-age * 4);
          const h = clamp(p[1] / 2.4);
          const c = [lerp(0.36, 1.0, h) + fresh, lerp(0.88, 0.75, h) + fresh * 0.6, lerp(0.9, 0.55, h) + fresh * 0.3];
          P.set(i, p[0], p[1], p[2], 0.018 + 0.04 * fresh, p[1] < 0.01 ? 0.45 : 0.85, c[0], c[1], c[2]);
        }
        P.commit();
        trail.geometry.setDrawRange(0, Math.floor(s * NS) + 1);
        bot.position.set(bp.x, 0.25, bp.z);
        const rk = (lt * 1.6) % 1;
        ringM.position.set(bp.x, 0.02, bp.z); ringM.scale.setScalar(0.2 + rk * 3.2); ringM.material.opacity = 0.9 * (1 - rk);
        const a = 0.6 + lt * 0.18;
        camera.position.set(bp.x * 0.3 + Math.sin(a) * 10.5, 9.5 - lt * 0.4, Math.cos(a) * 10.5);
        camera.lookAt(bp.x * 0.5, 0, bp.z * 0.5); camera.updateMatrixWorld();
        slate(ctx, 'LIDAR · SLAM', `${Math.round(s * pts.length).toLocaleString()} 点`, 150, 1);
        kinetic(ctx, '边走边画图，', 540, 1460, lt - 0.2, { size: 92, family: F.title, weight: 400, mode: 'drop', stagger: 0.05 });
        kinetic(ctx, '边画边找自己', 540, 1590, lt - 0.6, { size: 92, family: F.title, weight: 400, mode: 'drop', stagger: 0.05, color: COL.cyan });
        tag(ctx, '第 14 章 · 建图、定位和导航', 540, 1780, { size: 30, bg: 'rgba(243,240,233,0.12)', color: COL.steel, weight: 700, alpha: window01(lt, 0.5, 2.4, 0.3, 0.2) });
      },
    }));
  }

  // ---------- S20 端一杯水 ----------
  {
    const M = makeMats();
    const scene = withEnv(E, new THREE.Scene(), 0.7);
    studioLights(scene, { keyI: 2.4, rimI: 4.5, coolI: 2.2, shadow: true });
    const table = mesh(RB(3, 0.08, 1.6, 0.02), new THREE.MeshPhysicalMaterial({ color: 0x101216, roughness: 0.25, metalness: 0.2, clearcoat: 0.8 }), scene, [0, -0.04, 0]);
    table.receiveShadow = true;
    // 杯子和水
    const cupG = new THREE.LatheGeometry([[0.0, 0.0], [0.11, 0.0], [0.115, 0.01], [0.13, 0.3], [0.123, 0.3], [0.108, 0.012], [0.0, 0.012]].map(([r, y]) => new THREE.Vector2(r, y)), 64);
    const cupMat = new THREE.MeshPhysicalMaterial({ color: 0xdff6ff, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.32, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false });
    const cup = new THREE.Group(); scene.add(cup);
    const cupMesh = new THREE.Mesh(cupG, cupMat); cup.add(cupMesh);
    const water = new THREE.Mesh(new THREE.CylinderGeometry(0.118, 0.108, 0.2, 48), new THREE.MeshPhysicalMaterial({ color: 0x5ce1e6, roughness: 0.1, transparent: true, opacity: 0.55, emissive: 0x1b6d72, emissiveIntensity: 0.6 }));
    water.position.y = 0.11; cup.add(water);
    // 机械臂：底座在右边，和杯子在同一个竖直平面（z=0）里；两节臂 + 两指夹爪（手指前后夹）
    const arm = new THREE.Group(); scene.add(arm);
    arm.position.set(0.95, 0, 0);
    mesh(cyl(0.16, 0.12), M.graphite, arm, [0, 0.06, 0]);
    const j1 = group(arm, [0, 0.14, 0]);
    mesh(cyl(0.09, 0.14, 'z'), M.orange, j1);
    const up = group(j1);
    mesh(RB(0.1, 0.62, 0.11, 0.04), M.shell, up, [0, 0.31, 0]);
    const j2 = group(up, [0, 0.62, 0]);
    mesh(cyl(0.075, 0.13, 'z'), M.orange, j2);
    const fo = group(j2);
    mesh(RB(0.085, 0.56, 0.09, 0.035), M.graphite, fo, [0, 0.28, 0]);
    const wr = group(fo, [0, 0.56, 0]);
    mesh(cyl(0.05, 0.08, 'y'), M.orange, wr, [0, 0.02, 0]);
    mesh(RB(0.05, 0.05, 0.3, 0.015), M.graphite, wr, [0, 0.06, 0]);
    const f1 = mesh(RB(0.03, 0.15, 0.03, 0.01), M.graphite, wr, [0, 0.14, 0.15]);
    const f2 = mesh(RB(0.03, 0.15, 0.03, 0.01), M.graphite, wr, [0, 0.14, -0.15]);
    const drops = new Particles(220, { intensity: 2.2 }); drops.mat.uniforms.scale.value = 2500 * E.scale; scene.add(drops.points);
    const DR = rng(3);
    const dd = Array.from({ length: 220 }, () => ({ t0: 1.08 + DR() * 0.5, vx: -0.3 - DR() * 0.9, vy: 0.1 + DR() * 0.7, vz: (DR() - 0.5) * 0.6, s: 0.022 + DR() * 0.035 }));
    const camera = cam(32);
    const freeze = 1.5;
    const CX = -0.15; // 杯子中心
    // 两节臂的平面解析逆解：手腕到 (X, Y)（相对肩），返回 [肩转角, 肘转角]（绕 z，臂原本朝 +y）
    const ik = (X, Y) => {
      const a = 0.62, b = 0.56, d = Math.min(Math.hypot(X, Y), a + b - 1e-3);
      const q2 = Math.acos(clamp((d * d - a * a - b * b) / (2 * a * b), -1, 1));
      const q1 = Math.atan2(Y, X) - Math.atan2(b * Math.sin(q2), a + b * Math.cos(q2));
      return [q1 - Math.PI / 2, q2];
    };
    const cupLocal = new THREE.Matrix4().makeTranslation(-0.16, 0.12, 0).multiply(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
    const tmpM = new THREE.Matrix4();
    out.push(shot({
      id: 'S20', start: 47, end: 50, scene, camera, clear: 0x0b0d11,
      look: { grain: 0.05, vignette: 0.7, chroma: 0.3 },
      baseBloom: { strength: 0.5, radius: 0.5, threshold: 1.05 },
      frame(E, lt, ctx) {
        const t = Math.min(lt, freeze);
        // 手腕（相对肩）：收着 → 伸到杯子旁 → 夹住往上端 → 手一抖
        const reach = ease.inOutCubic(clamp(t / 0.55));
        const lift = ease.inOutQuad(clamp((t - 0.7) / 0.35));
        const shake = t > 1.0 ? Math.sin((t - 1.0) * 20) * 0.32 * clamp((t - 1.0) / 0.15) : 0;
        const wx = lerp(0.45, CX + 0.12, reach) - 0.95, wy = lerp(0.8, 0.16, reach) + lift * 0.3 - 0.14;
        const [th1, th2] = ik(wx, wy);
        j1.rotation.set(0, 0, th1);
        j2.rotation.set(0, 0, th2);
        // 手腕朝 -x（水平），再加上抖动
        wr.rotation.set(0, 0, Math.PI / 2 - (th1 + th2) + shake);
        const grip = clamp((t - 0.55) / 0.12);
        f1.position.z = lerp(0.15, 0.142, grip); f2.position.z = -f1.position.z;
        arm.updateMatrixWorld(true);
        // 杯子：夹住以前放在桌上；夹住以后跟着手腕的坐标系走
        if (t < 0.6) { cup.matrixAutoUpdate = true; cup.position.set(CX, 0, 0); cup.rotation.set(0, 0, 0); cup.updateMatrixWorld(true); }
        else { cup.matrixAutoUpdate = false; tmpM.multiplyMatrices(wr.matrixWorld, cupLocal); cup.matrix.copy(tmpM); cup.updateMatrixWorld(true); }
        // 水从杯沿洒出来
        const rim = new THREE.Vector3(-0.12, 0.3, 0).applyMatrix4(cup.matrixWorld);
        for (let i = 0; i < dd.length; i++) {
          const d = dd[i], a = t - d.t0;
          if (a < 0) { drops.set(i, 0, -9, 0, 0, 0); continue; }
          const x = rim.x + d.vx * a, y = rim.y + d.vy * a - 4.9 * a * a, z = rim.z + d.vz * a;
          if (y < 0.005) { drops.set(i, x, 0.005, z, d.s * 1.8, 0.35, 0.4, 0.9, 1.0); continue; }
          drops.set(i, x, y, z, d.s, 0.9, 0.5, 1.0, 1.05);
        }
        drops.commit();
        camera.position.set(0.95, 1.05, 3.5 - t * 0.12); camera.lookAt(0.18, 0.36, 0); camera.updateMatrixWorld();
        if (lt > freeze) {
          const k = clamp((lt - freeze) / 0.15);
          this.grade.saturation = 1 - 0.9 * k; this.grade.keepOrange = 1; this.grade.contrast = 1 + 0.2 * k;
        }
        kinetic(ctx, '会翻跟头，', 540, 250, lt - 0.1, { size: 84, weight: 900, mode: 'pop', stagger: 0.04 });
        kinetic(ctx, '为什么端不稳一杯水？', 540, 370, lt - 0.45, { size: 72, weight: 900, mode: 'pop', stagger: 0.035 });
        if (lt > freeze + 0.1) {
          text(ctx, '瓶颈是', 540, 1430, { size: 64, weight: 900, color: COL.bone, alpha: clamp((lt - freeze - 0.1) / 0.1) });
          kinetic(ctx, '数据', 540, 1600, lt - freeze - 0.25, { size: 220, family: F.title, weight: 400, mode: 'slam', dur: 0.2, color: COL.orange, glow: 30, glowColor: 'rgba(238,106,31,0.6)' });
        }
        tag(ctx, '第 3、15 章', 540, 1780, { size: 30, bg: 'rgba(243,240,233,0.12)', color: COL.steel, weight: 700, alpha: window01(lt, 0.6, 3.2, 0.3, 0.2) });
      },
    }));
  }
  return out;
}
