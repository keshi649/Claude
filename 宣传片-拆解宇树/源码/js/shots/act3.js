// 第三部“让它动”（28.75–44）：掌心立扫帚 → 仿真里几百只狗一起学走路 → 动作捕捉 → 多机位后空翻
import * as THREE from 'three';
import { makeMats, RB, cap, mesh, group } from '../models/materials.js';
import { buildHumanoid, applyPose, placeFlip, placeOnGround, yanggePose, POSE, footMinY } from '../models/humanoid.js';
import { THIGH, SHIN, STAND, trot, flail, standHeight } from '../models/dog.js';
import { studioLights, withEnv, gridFloor, dustField, shockRing, contactShadow, glow, Particles, beam } from '../core/fx3d.js';
import { kinetic, text, tag, F, font } from '../core/text.js';
import { grid, brackets, slate, roundRect } from '../core/hud.js';
import { clamp, ease, lerp, COL, window01, TAU, rng, hash, smoothstep } from '../core/util.js';
import { shot, cam, toScreen } from './common.js';

// ---------- S14 掌心立扫帚：倒立摆 + 手的 PD 控制，逐步仿真（确定性） ----------
function broomSim() {
  const dt = 1 / 480, g = 9.8, L = 1.2;
  let th = 0.16, w = 0, x = 0, v = 0;
  const out = [];
  for (let i = 0; i < 480 * 3; i++) {
    const t = i * dt;
    const push = t > 0.9 && t < 0.95 ? -6 : 0; // 中途被推一下
    const a = 38 * th + 9 * w + 1.4 * x + 2.2 * v; // 手往扫帚倒的方向追
    const alpha = (g * Math.sin(th) - a * Math.cos(th)) / L + push;
    w += alpha * dt; th += w * dt; v += a * dt; x += v * dt;
    if (i % 16 === 0) out.push([th, x]);
  }
  return (t) => { const k = clamp(t * 30, 0, out.length - 1); const i = Math.floor(k), f = k - i; const a = out[i], b = out[Math.min(i + 1, out.length - 1)]; return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)]; };
}

// 竖起一根食指的手（扫帚立在指尖上）。(x, y) 是指尖
function drawHand(ctx, x, y, a) {
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = a;
  const p = new Path2D(
    'M -14 0 Q 0 -14 14 0 L 18 150 Q 40 140 62 150 Q 78 160 74 182 Q 96 180 104 200 Q 110 222 96 236 ' +
    'Q 112 248 108 270 Q 100 300 70 304 L 60 420 L -86 420 L -92 300 Q -120 280 -140 240 Q -158 205 -136 196 ' +
    'Q -112 190 -92 222 L -60 250 L -40 160 Q -32 150 -18 150 Z');
  ctx.fillStyle = '#1d2026'; ctx.fill(p);
  ctx.strokeStyle = COL.bone; ctx.lineWidth = 6; ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(243,240,233,0.45)'; ctx.shadowBlur = 14; ctx.stroke(p);
  ctx.shadowBlur = 0; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(243,240,233,0.5)';
  ctx.beginPath(); ctx.moveTo(18, 190); ctx.quadraticCurveTo(40, 200, 70, 192); ctx.moveTo(22, 240); ctx.quadraticCurveTo(50, 250, 96, 238); ctx.stroke();
  ctx.restore();
}

export function act3(E) {
  const out = [];
  {
    const sim = broomSim();
    out.push(shot({
      id: 'S14', start: 28.75, end: 31.5, clear: 0x0d0f13,
      look: { grain: 0.05, vignette: 0.6, chroma: 0.3 },
      baseBloom: { strength: 0 },
      frame(E, lt, ctx) {
        grid(ctx, 1080, 1920, 60, { alpha: 0.07 });
        const morph = clamp((lt - 1.75) / 0.45);
        const s = 260; // 1 米 = 260 像素
        if (morph < 1) {
          // 尾迹：过去 0.3 秒的扫帚
          for (let k = 6; k >= 0; k--) {
            const tt = Math.max(0, lt - k * 0.05);
            const [th, x] = sim(tt);
            const hx = 540 + x * s * 1.4, hy = 1300;
            const tx = hx + Math.sin(th) * 1.2 * s * 1.7, ty = hy - Math.cos(th) * 1.2 * s * 1.7;
            ctx.save(); ctx.globalAlpha = (k === 0 ? 1 : 0.12 * (1 - k / 7)) * (1 - morph);
            ctx.strokeStyle = k === 0 ? COL.orange : COL.orange; ctx.lineWidth = k === 0 ? 12 : 8; ctx.lineCap = 'round';
            if (k === 0) { ctx.shadowColor = COL.orange; ctx.shadowBlur = 24; }
            ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(tx, ty); ctx.stroke();
            if (k === 0) {
              // 扫帚头
              ctx.translate(tx, ty); ctx.rotate(th);
              ctx.fillStyle = COL.orange; ctx.beginPath(); ctx.moveTo(-50, -10); ctx.lineTo(50, -10); ctx.lineTo(70, -110); ctx.lineTo(-70, -110); ctx.closePath(); ctx.fill();
              ctx.rotate(-th); ctx.translate(-tx, -ty);
              // 角度读数
              font(ctx, 40, F.mono, 700); ctx.fillStyle = COL.cyan; ctx.textAlign = 'left'; ctx.shadowBlur = 0;
              ctx.fillText(`θ = ${(th * 57.3).toFixed(1)}°`, Math.min(tx + 40, 760), ty + 80);
              // 竖直参考线和角度弧
              ctx.setLineDash([12, 10]); ctx.strokeStyle = 'rgba(243,240,233,0.45)'; ctx.lineWidth = 3;
              ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx, hy - 520); ctx.stroke(); ctx.setLineDash([]);
              ctx.strokeStyle = COL.cyan; ctx.beginPath(); ctx.arc(hx, hy, 180, -Math.PI / 2, -Math.PI / 2 + th, th < 0); ctx.stroke();
            }
            ctx.restore();
          }
          const [, x] = sim(lt);
          drawHand(ctx, 540 + x * s * 1.4, 1306, 1 - morph);
        }
        if (morph > 0) {
          // 变成两条交替迈步的腿（复摆步态）
          const ph = (lt - 1.75) * 4.2;
          const hipx = 540 + Math.sin(ph * 0.25) * 10, hipy = 960 + Math.abs(Math.sin(ph)) * -28;
          const legL = 420;
          const a1 = Math.sin(ph) * 0.42, a2 = -Math.sin(ph) * 0.42;
          ctx.save(); ctx.globalAlpha = morph; ctx.lineCap = 'round';
          [[a1, COL.orange], [a2, COL.bone]].forEach(([a, c]) => {
            ctx.strokeStyle = c; ctx.lineWidth = 14; ctx.shadowColor = c; ctx.shadowBlur = 20;
            ctx.beginPath(); ctx.moveTo(hipx, hipy); ctx.lineTo(hipx + Math.sin(a) * legL, hipy + Math.cos(a) * legL); ctx.stroke();
          });
          ctx.fillStyle = COL.bone; ctx.beginPath(); ctx.arc(hipx, hipy, 26, 0, TAU); ctx.fill();
          ctx.strokeStyle = 'rgba(243,240,233,0.4)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(140, hipy + legL + 8); ctx.lineTo(940, hipy + legL + 8); ctx.stroke();
          // 质心的轨迹：一段段圆弧
          ctx.strokeStyle = COL.cyan; ctx.setLineDash([8, 10]); ctx.lineWidth = 3; ctx.shadowBlur = 0;
          ctx.beginPath(); for (let i = 0; i <= 60; i++) { const xx = 160 + i * 13; ctx.lineTo(xx, 905 - Math.abs(Math.sin(i * 0.18 + ph)) * 40); } ctx.stroke(); ctx.setLineDash([]);
          ctx.restore();
        }
        kinetic(ctx, '走路，就是不停地摔倒，', 540, 300, lt - 0.25, { size: 76, weight: 900, mode: 'pop', stagger: 0.035 });
        kinetic(ctx, '再不停地接住自己。', 540, 420, lt - 1.25, { size: 76, weight: 900, mode: 'pop', stagger: 0.035, color: COL.orange });
        tag(ctx, '第 10 章 · 平衡的物理学', 540, 1780, { size: 30, bg: 'rgba(243,240,233,0.12)', color: COL.steel, weight: 700, alpha: window01(lt, 0.5, 3, 0.3, 0.2) });
      },
    }));
  }

  // ---------- S15 在梦里练一万遍：几百只狗一起在仿真里学走路 ----------
  {
    const N = 24, COUNT = N * N, SP = 1.25;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0d12, 8, 30);
    scene.add(new THREE.HemisphereLight(0xbfe8ff, 0x101418, 1.4));
    const dl = new THREE.DirectionalLight(0xffffff, 2.2); dl.position.set(4, 8, 3); scene.add(dl);
    const rl = new THREE.DirectionalLight(0xff8a3d, 2.0); rl.position.set(-5, 3, -4); scene.add(rl);
    const floor = gridFloor({ size: 120, step: SP, major: 4, intensity: 0.5, fade: 26, color: 0x5ce1e6, base: 0x0a0d12 }); scene.add(floor);
    const mk = (geo, color, rough = 0.5, metal = 0.4) => {
      const m = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal }), COUNT);
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); return m;
    };
    const body = mk(RB(0.6, 0.14, 0.25, 0.05), 0xffffff, 0.45, 0.2);
    const headI = mk(RB(0.12, 0.12, 0.22, 0.04), 0x9aa3ad, 0.35, 0.6);
    const thighArr = [0, 1, 2, 3].map(() => mk(RB(0.055, THIGH + 0.02, 0.045, 0.018), 0x8a929c, 0.35, 0.6));
    const shinArr = [0, 1, 2, 3].map(() => mk(cap(0.02, SHIN - 0.04), 0xb8bec6, 0.4, 0.5));
    const hipArr = [0, 1, 2, 3].map(() => mk(new THREE.CylinderGeometry(0.048, 0.048, 0.05, 16).rotateX(Math.PI / 2), 0xee6a1f, 0.35, 0.3));
    const R = rng(31);
    const dogs = [];
    for (let i = 0; i < COUNT; i++) {
      const gx = (i % N) - (N - 1) / 2, gz = Math.floor(i / N) - (N - 1) / 2;
      dogs.push({ x: gx * SP, z: gz * SP, seed: R() * 100, roll: R(), yaw: (R() - 0.5) * 0.6, fall: R(), d: Math.hypot(gx, gz) * SP });
    }
    const camera = cam(38);
    const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S1 = new THREE.Vector3(1, 1, 1), EU = new THREE.Euler();
    const bodyM = new THREE.Matrix4(), tmp = new THREE.Matrix4(), tmp2 = new THREE.Matrix4();
    const LEGP = { FL: [0.215, 0.16], FR: [0.215, -0.16], RL: [-0.215, 0.16], RR: [-0.215, -0.16] };
    const red = new THREE.Color(1.0, 0.35, 0.3), white = new THREE.Color(0.86, 0.84, 0.8), cyanC = new THREE.Color(0.55, 1.2, 1.25);
    const col = new THREE.Color();
    const tWave = 2.5;
    out.push(shot({
      id: 'S15', start: 31.5, end: 36, scene, camera, clear: 0x0a0d12,
      look: { grain: 0.05, vignette: 0.7, chroma: 0.35 },
      baseBloom: { strength: 0.6, radius: 0.5, threshold: 1.0 },
      frame(E, lt, ctx) {
        const waveR = Math.max(0, (lt - tWave) * 13);
        for (let i = 0; i < COUNT; i++) {
          const D = dogs[i];
          const learned = D.d < waveR;
          const tl = learned ? (waveR - D.d) / 13 : 0; // 学会以后过了多久
          let px = D.x, py, pz = D.z, rx, ry = D.yaw, rz, legs;
          const t = lt + D.seed;
          if (!learned) {
            // 摔：在地上打滚、四脚朝天、乱蹬
            const f = D.fall;
            const roll = f < 0.35 ? Math.PI * 0.95 : f < 0.7 ? Math.PI / 2 * Math.sign(D.roll - 0.5) : 0.35 * Math.sin(t * 6);
            rz = roll + 0.25 * Math.sin(t * 7.3);
            rx = 0.3 * Math.sin(t * 5.1);
            ry = D.yaw + 0.8 * Math.sin(t * 0.9);
            py = 0.16 + 0.05 * Math.abs(Math.sin(t * 8));
            legs = flail(t, D.seed);
          } else {
            const up = ease.outBack(clamp(tl / 0.35), 2.2);
            const g = trot(lt, { freq: 2.6, stride: 0.3 });
            rz = lerp(0.6 * Math.sign(D.roll - 0.5), 0, up); rx = 0; ry = lerp(D.yaw, 0, clamp(tl / 0.4));
            py = lerp(0.18, standHeight() + g.bob, up) + Math.sin(clamp(tl / 0.35) * Math.PI) * 0.12;
            px = D.x + Math.max(0, tl - 0.3) * 0.9;
            legs = {};
            for (const k of Object.keys(g.legs)) legs[k] = g.legs[k].map((v, j) => lerp([0, -0.4, 1.2][j], v, up));
          }
          EU.set(rx, ry, rz, 'YXZ'); Q.setFromEuler(EU);
          bodyM.compose(V.set(px, py, pz), Q, S1);
          body.setMatrixAt(i, bodyM);
          tmp.makeTranslation(0.33, 0.015, 0); headI.setMatrixAt(i, M4.multiplyMatrices(bodyM, tmp));
          ['FL', 'FR', 'RL', 'RR'].forEach((k, j) => {
            const [hx, hz] = LEGP[k];
            const v = legs[k] || [0, STAND.thigh, STAND.knee];
            // 髋：平移到髋点，外展绕 x，俯仰绕 z
            tmp.makeTranslation(hx, -0.005, hz);
            tmp2.makeRotationX(v[0]); tmp.multiply(tmp2);
            tmp2.makeRotationZ(v[1]); tmp.multiply(tmp2);
            const hipM = M4.multiplyMatrices(bodyM, tmp).clone();
            hipArr[j].setMatrixAt(i, hipM);
            tmp.makeTranslation(0, -THIGH / 2, 0);
            thighArr[j].setMatrixAt(i, M4.multiplyMatrices(hipM, tmp));
            tmp.makeTranslation(0, -THIGH, 0); tmp2.makeRotationZ(v[2]); tmp.multiply(tmp2);
            const kneeM = M4.multiplyMatrices(hipM, tmp).clone();
            tmp.makeTranslation(0, -SHIN / 2 + 0.01, 0);
            shinArr[j].setMatrixAt(i, M4.multiplyMatrices(kneeM, tmp));
          });
          // 颜色：没学会的偏红，刚学会的一闪青色，之后是白
          if (!learned) col.copy(white).lerp(red, 0.35 + 0.25 * Math.sin(lt * 3 + D.seed));
          else col.copy(cyanC).lerp(white, clamp(tl / 0.5));
          body.setColorAt(i, col);
        }
        for (const m of [body, headI, ...thighArr, ...shinArr, ...hipArr]) m.instanceMatrix.needsUpdate = true;
        body.instanceColor.needsUpdate = true;
        floor.material.uniforms.glowAmt.value = 0;
        // 镜头：从高处斜着往前飞
        const k = ease.inOutQuad(clamp(lt / 4.5));
        camera.position.set(-1.0 + 2.6 * k, 2.4 - 0.5 * k, 8.6 - 2.2 * k);
        camera.lookAt(0.8 + 1.4 * k, 0.15, 2.0 - 1.5 * k);
        camera.updateMatrixWorld();
        // HUD
        slate(ctx, 'SIM · 并行仿真', lt < tWave ? '第 1 轮' : '学会了', 150, 1);
        if (lt < tWave + 0.2) {
          font(ctx, 26, F.mono, 700); ctx.fillStyle = COL.red; ctx.textAlign = 'left';
          for (let j = 0; j < 9; j++) {
            const d = dogs[Math.floor(hash(j * 31 + Math.floor(lt * 3)) * COUNT)];
            const s = toScreen(new THREE.Vector3(d.x, 0.5, d.z), camera);
            ctx.globalAlpha = 0.85 * (1 - clamp((lt - tWave) / 0.2));
            ctx.fillText('✕ 摔倒', s.x, s.y);
          }
          ctx.globalAlpha = 1;
        }
        kinetic(ctx, '在梦里练一万遍', 540, 330, lt - 0.1, { size: 112, family: F.title, weight: 400, mode: 'drop', stagger: 0.05 });
        kinetic(ctx, '几千只虚拟机器狗，同时在电脑里摔跤', 540, 460, lt - 0.55, { size: 48, weight: 700, mode: 'pop', stagger: 0.022, out: tWave - 0.1 });
        if (lt > tWave) {
          // 训练时间条：0–4 分钟，填到 4 分钟之前就停（书里只说“不到 4 分钟”，不编具体秒数）
          const tt = ease.outCubic(clamp((lt - tWave) / 1.0));
          const a = clamp((lt - tWave) / 0.25);
          ctx.save(); ctx.globalAlpha = a;
          ctx.fillStyle = 'rgba(10,13,18,0.75)'; roundRect(ctx, 110, 1300, 860, 380, 26); ctx.fill();
          ctx.strokeStyle = 'rgba(92,225,230,0.55)'; ctx.lineWidth = 3; roundRect(ctx, 110, 1300, 860, 380, 26); ctx.stroke();
          font(ctx, 46, F.sans, 700); ctx.fillStyle = COL.bone; ctx.textAlign = 'left'; ctx.fillText('平地走路，训练用时', 160, 1380);
          const x0 = 160, x1 = 920, by = 1470;
          ctx.fillStyle = 'rgba(243,240,233,0.15)'; ctx.fillRect(x0, by, x1 - x0, 26);
          ctx.fillStyle = COL.cyan; ctx.shadowColor = COL.cyan; ctx.shadowBlur = 16; ctx.fillRect(x0, by, (x1 - x0) * 0.88 * tt, 26); ctx.shadowBlur = 0;
          font(ctx, 30, F.mono, 700); ctx.textAlign = 'center';
          for (let m = 0; m <= 4; m++) { const x = x0 + (x1 - x0) * m / 4; ctx.fillStyle = m === 4 ? COL.orange : COL.steel; ctx.fillRect(x - 1.5, by - 14, 3, 54); ctx.fillText(`${m} 分`, x, by + 84); }
          if (lt > tWave + 1.0) { kinetic(ctx, '不到 4 分钟', 540, 1612, lt - tWave - 1.0, { size: 84, weight: 900, mode: 'slam', dur: 0.18, color: COL.orange }); }
          ctx.restore();
          font(ctx, 28, F.mono, 700); ctx.fillStyle = COL.steel; ctx.textAlign = 'center'; ctx.globalAlpha = a;
          ctx.fillText('2021 · 苏黎世联邦理工学院 × 英伟达', 540, 1730); ctx.globalAlpha = 1;
        }
        tag(ctx, '第 12 章 · 强化学习和仿真', 540, 1810, { size: 30, bg: 'rgba(243,240,233,0.12)', color: COL.steel, weight: 700, alpha: window01(lt, 0.8, 4.5, 0.3, 0.2) });
      },
    }));
  }
  // ---------- S16 动作捕捉：人跳，机器人跟着跳 ----------
  {
    const M = makeMats();
    const scene = withEnv(E, new THREE.Scene(), 0.45);
    studioLights(scene, { keyI: 2.2, rimI: 4.5, coolI: 2.2 });
    const floor = gridFloor({ size: 40, step: 0.5, intensity: 0.3, fade: 9 }); scene.add(floor);
    const skin = new THREE.MeshStandardMaterial({ color: 0x1b1d22, roughness: 0.85, metalness: 0.05 });
    const human = buildHumanoid(M, { ghost: skin }); scene.add(human);
    const robot = buildHumanoid(M); scene.add(robot);
    const cloth = (c) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.24, 6, 6), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.5, side: THREE.DoubleSide, roughness: 0.6 })); return m; };
    const hk1 = cloth(0xd8261f), hk2 = cloth(0xe0401c);
    human.userData.J.handR.add(hk1); hk1.position.set(0, -0.16, 0.06);
    robot.userData.J.handR.add(hk2); hk2.position.set(0, -0.16, 0.06);
    // 动作捕捉的反光点
    const markerJoints = ['head', 'shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'handL', 'handR', 'hipL', 'hipR', 'kneeL', 'kneeR', 'ankleL', 'ankleR', 'spine'];
    for (const n of markerJoints) {
      const g = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10), M.glowW);
      human.userData.J[n].add(g); g.position.set(0, n === 'head' ? 0.17 : 0, 0.06);
    }
    const sh1 = contactShadow(1.0, 0.6), sh2 = contactShadow(1.0, 0.6); scene.add(sh1, sh2);
    const camera = cam(32);
    const bones = [['head', 'spine'], ['spine', 'shoulderL'], ['spine', 'shoulderR'], ['shoulderL', 'elbowL'], ['elbowL', 'handL'], ['shoulderR', 'elbowR'], ['elbowR', 'handR'], ['spine', 'hipL'], ['spine', 'hipR'], ['hipL', 'kneeL'], ['kneeL', 'ankleL'], ['hipR', 'kneeR'], ['kneeR', 'ankleR']];
    const jp = (h, n) => { const v = new THREE.Vector3(0, n === 'head' ? 0.17 : 0, 0); h.userData.J[n].localToWorld(v); return v; };
    out.push(shot({
      id: 'S16', start: 36, end: 39.5, scene, camera, clear: 0x0b0d11,
      look: { grain: 0.05, vignette: 0.65, chroma: 0.3 },
      baseBloom: { strength: 0.5, radius: 0.5, threshold: 1.3 },
      baseGrade: { exposure: 0.92 },
      frame(E, lt, ctx) {
        const t = lt + 0.25;
        const P1 = yanggePose(t), P2 = yanggePose(t - 0.22);
        placeOnGround(human, P1, { x: -0.42 + P1.pos[0] * 0.6, z: 0.45, yaw: P1.rot[1] + 0.18 });
        placeOnGround(robot, P2, { x: 0.46 + P2.pos[0] * 0.6, z: -0.45, yaw: P2.rot[1] - 0.18 });
        sh1.position.set(human.position.x, 0.002, 0.45); sh2.position.set(robot.position.x, 0.002, -0.45);
        for (const [hk, h] of [[hk1, human], [hk2, robot]]) hk.rotation.set(0.4 + Math.sin(t * 9) * 0.3, t * 10, 0);
        camera.position.set(0.1 * Math.sin(lt), 1.15, 6.4 - lt * 0.25); camera.lookAt(0, 0.95, 0); camera.updateMatrixWorld();
        human.updateMatrixWorld(true); robot.updateMatrixWorld(true);
        // 人身上的骨架线
        ctx.save(); ctx.strokeStyle = 'rgba(92,225,230,0.9)'; ctx.lineWidth = 4; ctx.shadowColor = COL.cyan; ctx.shadowBlur = 12;
        const a0 = clamp(lt / 0.3);
        ctx.globalAlpha = a0;
        for (const [a, b] of bones) { const p = toScreen(jp(human, a), camera), q = toScreen(jp(human, b), camera); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        ctx.restore();
        // 数据流：人 → 机器人，三条弧线上跑着光点
        const links = [['handR', 0], ['head', 0.15], ['kneeL', 0.3]];
        links.forEach(([n, d]) => {
          const p = toScreen(jp(human, n), camera), q = toScreen(jp(robot, n), camera);
          const k = clamp((lt - 0.5 - d) / 0.4);
          if (k <= 0) return;
          const mx = (p.x + q.x) / 2, my = Math.min(p.y, q.y) - 160;
          ctx.save(); ctx.globalAlpha = k * 0.85; ctx.strokeStyle = 'rgba(238,106,31,0.75)'; ctx.lineWidth = 3; ctx.setLineDash([10, 10]); ctx.lineDashOffset = -lt * 60;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.quadraticCurveTo(mx, my, q.x, q.y); ctx.stroke(); ctx.setLineDash([]);
          for (let j = 0; j < 3; j++) {
            const u = ((lt * 0.9 + j / 3 + d) % 1);
            const x = (1 - u) * (1 - u) * p.x + 2 * (1 - u) * u * mx + u * u * q.x, y = (1 - u) * (1 - u) * p.y + 2 * (1 - u) * u * my + u * u * q.y;
            ctx.fillStyle = COL.orange; ctx.shadowColor = COL.orange; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill();
          }
          ctx.restore();
        });
        const hs = toScreen(new THREE.Vector3(human.position.x, 0, 0.75), camera), rs = toScreen(new THREE.Vector3(robot.position.x, 0, -0.15), camera);
        tag(ctx, '人', hs.x, hs.y + 40, { size: 36, bg: 'rgba(92,225,230,0.9)', color: '#0D0F13', weight: 900, alpha: a0 });
        tag(ctx, '机器人', rs.x, rs.y + 40, { size: 36, bg: COL.orange, color: '#0D0F13', weight: 900, alpha: a0 });
        slate(ctx, '2025 · 春晚《秧BOT》', '动作捕捉', 150, window01(lt, 0, 3.6, 0.3, 0.2));
        kinetic(ctx, '不写分数，', 540, 1450, lt - 0.25, { size: 84, weight: 900, mode: 'pop', stagger: 0.04 });
        kinetic(ctx, '直接给它看人是怎么做的。', 540, 1570, lt - 0.75, { size: 66, weight: 900, mode: 'pop', stagger: 0.03, color: COL.orange });
        tag(ctx, '第 13 章', 540, 1780, { size: 30, bg: 'rgba(243,240,233,0.12)', color: COL.steel, weight: 700, alpha: window01(lt, 0.8, 3.6, 0.3, 0.2) });
      },
    }));
  }

  // ---------- S17 多机位后空翻 ----------
  {
    const M = makeMats();
    const scene = withEnv(E, new THREE.Scene(), 0.4);
    scene.fog = new THREE.FogExp2(0x08090c, 0.04);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0x0c0d10, roughness: 0.45, metalness: 0.4 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const gf = gridFloor({ size: 30, step: 0.5, intensity: 0.22, fade: 7 }); gf.position.y = 0.001; scene.add(gf);
    scene.add(new THREE.HemisphereLight(0x9fb4c8, 0x140f0c, 0.4));
    const spot = new THREE.SpotLight(0xfff0dc, 42, 25, 0.45, 0.55, 2); spot.position.set(0.6, 7.5, 2.5); spot.target.position.set(0, 1, 0);
    spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -0.0004; scene.add(spot, spot.target);
    const rim1 = new THREE.SpotLight(0xff8a3d, 170, 25, 0.6, 0.6, 2); rim1.position.set(-3, 4, -3.5); rim1.target.position.set(0, 1, 0); scene.add(rim1, rim1.target);
    const rim2 = new THREE.SpotLight(0x8fd8ff, 140, 25, 0.6, 0.6, 2); rim2.position.set(3.5, 3.5, -3); rim2.target.position.set(0, 1, 0); scene.add(rim2, rim2.target);
    const bm = beam(0xfff0dc, { len: 9, radius: 1.6, intensity: 0.18 }); scene.add(bm);
    const H = buildHumanoid(M); scene.add(H);
    const ghosts = [1, 2, 3, 4].map((k) => {
      const gm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff8a3d).multiplyScalar(0.8), transparent: true, opacity: 0.16 * (1 - k / 5), blending: THREE.AdditiveBlending, depthWrite: false });
      const g = buildHumanoid(M, { ghost: gm }); g.traverse((o) => { if (o.isMesh) o.castShadow = false; }); scene.add(g); return g;
    });
    const ring = shockRing(0xffb37a); scene.add(ring);
    const dust = new Particles(260, { intensity: 1.8 }); dust.mat.uniforms.scale.value = 2500 * E.scale; scene.add(dust.points);
    const DR = rng(17);
    const dd = Array.from({ length: 260 }, () => ({ a: DR() * TAU, v: 0.6 + 2.2 * DR(), up: 0.2 + 0.9 * DR(), s: 0.02 + 0.05 * DR(), l: 0.5 + 0.8 * DR() }));
    const camera = cam(36);
    const KEYS = [[0, 0], [1.25, 0.42], [2.25, 0.75], [2.75, 0.86], [3.25, 1.0]];
    const uOf = (lt) => { for (let i = 0; i < KEYS.length - 1; i++) { const [a, ua] = KEYS[i], [b, ub] = KEYS[i + 1]; if (lt <= b) return lerp(ua, ub, clamp((lt - a) / (b - a))); } return 1; };
    const LAND = 2.75;
    const hip = new THREE.Vector3();
    out.push(shot({
      id: 'S17', start: 39.5, end: 44, scene, camera, clear: 0x08090c,
      look: { grain: 0.06, vignette: 0.75, chroma: 0.35 },
      baseBloom: { strength: 0.5, radius: 0.55, threshold: 1.45 },
      baseGrade: { exposure: 0.88, contrast: 1.06 },
      frame(E, lt, ctx) {
        const u = uOf(lt);
        placeFlip(H, u, { rise: 1.1 });
        ghosts.forEach((g, k) => { const uu = uOf(Math.max(0, lt - (k + 1) * 0.045)); g.visible = u > 0.3 && u < 0.86; placeFlip(g, uu, { rise: 1.1 }); });
        H.userData.J.spine.getWorldPosition(hip);
        bm.aim(new THREE.Vector3(0.6, 9, 1.5), new THREE.Vector3(0, 0, 0)); bm.material.uniforms.time.value = lt;
        // 机位：正面低角度 → 侧面全景 → 斜后方低角度，落地后推近
        if (lt < 1.25) { camera.position.set(0.35, 0.45, 3.3 - lt * 0.2); camera.lookAt(0, 0.7 + (hip.y - 0.7) * 0.6, 0); }
        else if (lt < 2.25) { camera.position.set(4.6, 1.5, 0.2 - (lt - 1.25) * 0.4); camera.lookAt(0, hip.y * 0.85, -0.25); }
        else { const k = ease.outCubic(clamp((lt - 2.9) / 1.4)); camera.position.set(lerp(-1.7, -0.95, k), lerp(0.35, 0.75, k), lerp(2.7, 1.95, k)); camera.lookAt(0, lerp(0.9, 0.8, k), -0.35); }
        camera.updateMatrixWorld();
        // 落地：冲击环、扬尘
        const dl = lt - LAND;
        ring.position.set(0, 0.01, -0.45);
        ring.setK(clamp(dl / 0.55), 4.2);
        for (let i = 0; i < dd.length; i++) {
          const d = dd[i], a = dl;
          if (a < 0 || a > d.l) { dust.set(i, 0, -9, 0, 0, 0); continue; }
          const k = a / d.l, r = d.v * a * (1 - k * 0.4);
          dust.set(i, Math.cos(d.a) * r, d.up * a * (1 - k) * 0.6 + 0.03, -0.45 + Math.sin(d.a) * r, d.s * (1 + k * 2), (1 - k) * 0.7, 1, 0.8, 0.6);
        }
        dust.commit();
        slate(ctx, lt < 1.25 ? 'CAM A · 正面' : lt < 2.25 ? 'CAM B · 侧面' : 'CAM C · 斜后方', '后空翻', 150, 1);
        kinetic(ctx, '后空翻、秧歌和醉拳，', 540, 1440, lt - 3.0, { size: 70, weight: 900, mode: 'pop', stagger: 0.03 });
        kinetic(ctx, '是怎么从人身上', 540, 1560, lt - 3.35, { size: 70, weight: 900, mode: 'pop', stagger: 0.03 });
        kinetic(ctx, '“搬”到机器人身上的？', 540, 1675, lt - 3.6, { size: 70, weight: 900, mode: 'pop', stagger: 0.03, color: COL.orange });
      },
    }));
  }
  return out;
}
