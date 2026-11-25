// 第二部“拆开它”（16.75–28）：钻进关节 → 拆成六片 → 530 克、23.7 N·m → 减速器 ×6.33 和杠杆
import * as THREE from 'three';
import { makeMats, RB, cyl, mesh, group } from '../models/materials.js';
import { buildDog, poseDog, STAND, standHeight } from '../models/dog.js';
import { buildActuator, PART_NAMES } from '../models/actuator.js';
import { studioLights, withEnv, gridFloor, dustField, contactShadow, glow } from '../core/fx3d.js';
import { kinetic, text, tag, F, font, countText } from '../core/text.js';
import { callout, crosshair, brackets, grid } from '../core/hud.js';
import { clamp, ease, lerp, COL, window01, TAU } from '../core/util.js';
import { shot, cam, toScreen } from './common.js';

const EN = ['HOUSING', 'STATOR', 'ROTOR', 'PLANETARY GEAR', 'ENCODER', 'OUTPUT FLANGE'];

export function act2(E) {
  const out = [];
  // ---------- S09 机器狗，镜头钻进一个关节 ----------
  {
    const M = makeMats();
    const scene = withEnv(E, new THREE.Scene(), 0.55);
    const L = studioLights(scene, { keyI: 2.6, rimI: 5, coolI: 2.2, shadow: true });
    const floor = gridFloor({ size: 40, step: 0.25, intensity: 0.35, fade: 6 }); scene.add(floor);
    const dog = buildDog(M); dog.rotation.order = 'YXZ'; scene.add(dog);
    const sh = contactShadow(1.3, 0.7); sh.position.y = 0.002; scene.add(sh);
    const camera = cam(30);
    const target = new THREE.Vector3();
    out.push(shot({
      id: 'S09', start: 16.75, end: 20, scene, camera, clear: 0x0b0d11,
      look: { grain: 0.05, vignette: 0.65, chroma: 0.3 },
      baseBloom: { strength: 0.5, radius: 0.5, threshold: 1.1 },
      frame(E, lt, ctx) {
        const br = Math.sin(lt * 2.2) * 0.006;
        const legs = {};
        for (const k of ['FL', 'FR', 'RL', 'RR']) legs[k] = [0, STAND.thigh + br, STAND.knee - br * 2];
        poseDog(dog, { pos: [0, standHeight() + br * 0.5, 0], rot: [0, -0.55 + lt * 0.05, 0], legs, head: Math.sin(lt * 1.3) * 0.08 });
        dog.updateMatrixWorld(true);
        dog.userData.J.thighFL.getWorldPosition(target);
        // 推镜：从全身推到前左腿的关节
        const k = ease.inOutCubic(clamp((lt - 0.9) / 2.3));
        this.grade.exposure = 1 - 0.3 * k; this.bloomP.threshold = 1.1 + 0.4 * k;
        const far = new THREE.Vector3(2.1, 0.85, 2.6), near = target.clone().add(new THREE.Vector3(0.16, 0.05, 0.3));
        camera.position.lerpVectors(far, near, k);
        const look = new THREE.Vector3(0.05, 0.25, 0).lerp(target, ease.inOutQuad(clamp((lt - 0.7) / 2)));
        camera.lookAt(look); camera.updateMatrixWorld();
        // 一条腿三个关节：编号
        const js = [['hipFL', '1'], ['thighFL', '2'], ['kneeFL', '3']];
        const a = window01(lt, 0.3, 2.1, 0.25, 0.3);
        js.forEach(([n, lab], i) => {
          const v = new THREE.Vector3(); dog.userData.J[n].getWorldPosition(v);
          const s = toScreen(v, camera);
          const p = clamp((lt - 0.3 - i * 0.18) / 0.25);
          if (p <= 0 || a <= 0) return;
          ctx.save(); ctx.globalAlpha = a * p;
          ctx.fillStyle = COL.orange; ctx.beginPath(); ctx.arc(s.x, s.y, 30 * ease.outBack(p), 0, TAU); ctx.fill();
          font(ctx, 40, F.num, 400); ctx.fillStyle = '#14161A'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lab, s.x, s.y + 2);
          ctx.restore();
        });
        kinetic(ctx, '一条腿，三个关节', 540, 1500, lt - 0.35, { size: 76, weight: 900, mode: 'pop', stagger: 0.04, out: 1.9 });
        if (lt > 2.0) {
          const s = toScreen(target, camera);
          crosshair(ctx, s.x, s.y, 120, lt * 1.5, { p: clamp((lt - 2.0) / 0.3), color: COL.orange, lw: 5 });
          kinetic(ctx, '拆开其中一个', 540, 1500, lt - 2.0, { size: 80, weight: 900, mode: 'pop', stagger: 0.04, color: COL.bone });
        }
      },
    }));
  }

  // ---------- 共用的关节电机场景（S10–S12） ----------
  const M = makeMats();
  const scene = withEnv(E, new THREE.Scene(), 0.8);
  const L = studioLights(scene, { key: 0xfff4e8, keyI: 2.2, rim: 0xff7a2a, rimI: 4.5, cool: 0x7fd8ff, coolI: 2.4, amb: 0.3 });
  const floor = gridFloor({ size: 60, step: 0.5, intensity: 0.32, fade: 10, color: 0x6f8ea8 }); floor.position.y = -1.9; scene.add(floor);
  const A = buildActuator(M);
  const pivot = new THREE.Group(); pivot.add(A.root); scene.add(pivot);
  const dust = dustField(260, [[-3, -1, -3], [4, 3, 2]], 8, { color: [1, 0.85, 0.7], size: [0.01, 0.035], alpha: [0.1, 0.4] });
  dust.mat.uniforms.scale.value = 2500 * E.scale; scene.add(dust.points);
  // 杠杆和配重（S12 用）
  // 关节直径约 1.06 个单位 ≈ 10 厘米，所以杆长也取 1.0
  const lever = group(A.parts[5], [0.16, 0, 0]);
  mesh(RB(0.08, 1.12, 0.1, 0.03), M.orange, lever, [0, 0.5, 0]);
  mesh(cyl(0.05, 0.12, 'x', 20), M.steel, lever, [0, 1.0, 0]);
  const hook = group(lever, [0, 1.0, 0]);
  const cable = mesh(cyl(0.008, 1, 'y', 8), M.steel, hook, [0, -0.5, 0]);
  const weight = mesh(RB(0.42, 0.34, 0.36, 0.04), M.graphite, hook, [0, -1.15, 0]);
  const labelCanvas = document.createElement('canvas'); labelCanvas.width = 256; labelCanvas.height = 128;
  { const c = labelCanvas.getContext('2d'); c.fillStyle = '#EE6A1F'; c.fillRect(0, 0, 256, 128); font(c, 84, F.num, 400); c.fillStyle = '#14161A'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('20+ KG', 128, 68); }
  const lt2 = new THREE.CanvasTexture(labelCanvas); lt2.colorSpace = THREE.SRGBColorSpace;
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.17), new THREE.MeshBasicMaterial({ map: lt2 }));
  plate.position.set(0.212, 0, 0); plate.rotation.y = Math.PI / 2; weight.add(plate);
  const setLever = (on, ang = 0, cableLen = 1) => {
    lever.visible = on;
    lever.rotation.x = ang;
    hook.rotation.x = -ang; // 吊绳始终竖直
    cable.scale.y = cableLen; cable.position.y = -cableLen / 2;
    weight.position.y = -cableLen - 0.15;
  };
  const camera = cam(30);
  const compact = [0, 0.32, 0.58, 0.82, 1.06, 1.24];
  const exploded = [0, 0.75, 1.45, 2.2, 2.9, 3.55];
  const assembled = [0, 0, 0, 0.27, -0.23, 0.36];
  const tSplit = [0.0, 0.5, 1.0, 1.5, 2.0, 2.5];
  const explodedAt = (lt) => {
    const k0 = ease.inOutCubic(clamp(lt / 0.45));
    const pos = assembled.map((a, i) => lerp(a, compact[i], k0));
    for (let j = 1; j < 6; j++) {
      const e = ease.outBack(clamp((lt - tSplit[j]) / 0.38), 1.6);
      const d = (exploded[j] - exploded[j - 1]) - (compact[j] - compact[j - 1]);
      for (let i = j; i < 6; i++) pos[i] += d * e;
    }
    return pos;
  };
  const place = (xs) => A.parts.forEach((p, i) => { p.position.x = xs[i]; p.rotation.x = 0; p.visible = true; });
  const lights = (env, key, rim, cool) => { scene.environmentIntensity = env; L.key.intensity = key; L.rim.intensity = rim; L.cool.intensity = cool; };

  // ---------- S10 拆成六片 ----------
  out.push(shot({
    id: 'S10', start: 20, end: 23, scene, camera, clear: 0x0b0d11,
    look: { grain: 0.05, vignette: 0.7, chroma: 0.3 },
    baseBloom: { strength: 0.55, radius: 0.5, threshold: 1.1 },
    frame(E, lt, ctx) {
      dust.update(lt + 20);
      setLever(false);
      lights(0.7, 2.0, 4.5, 2.4);
      floor.position.y = -1.9;
      const xs = explodedAt(lt);
      place(xs);
      A.spin(lt * 3.2);
      // 拆开的方向放得很陡（左下 → 右上），竖屏才装得下
      pivot.position.set(-0.55, -0.85, 0);
      pivot.rotation.set(0, -0.5 + lt * 0.06, 1.18);
      camera.fov = 34;
      camera.position.set(0.9 + lt * 0.1, 0.35, 9.4 - lt * 0.2); camera.lookAt(0.12, 0.42, 0); camera.updateMatrixWorld();
      // 标签：零件上方的锚点 → 交错往左右拉出
      for (let i = 0; i < 6; i++) {
        const tIn = lt - (i === 0 ? 0.0 : tSplit[i] + 0.05);
        if (tIn < 0) continue;
        const s = toScreen(A.anchor(i), camera);
        const left = s.x > 600 ? true : s.x < 420 ? false : i % 2 === 0;
        const bx = s.x + (left ? -70 : 70), by = s.y - (left ? 90 : 120);
        callout(ctx, s.x, s.y, bx, by, PART_NAMES[i], clamp(tIn / 0.4), { dir: left ? -1 : 1, hlen: 150, size: 46, sub: EN[i], weight: 900 });
      }
      kinetic(ctx, '一颗关节电机', 540, 250, lt, { size: 96, family: F.title, weight: 400, mode: 'drop', stagger: 0.05 });
      kinetic(ctx, '拆开是六片', 540, 380, lt - 0.2, { size: 96, family: F.title, weight: 400, mode: 'drop', stagger: 0.05, color: COL.orange });
      tag(ctx, '第 5、6 章', 540, 1780, { size: 30, bg: 'rgba(243,240,233,0.12)', color: COL.steel, weight: 700, alpha: window01(lt, 0.6, 3, 0.3, 0.2) });
    },
  }));

  // ---------- S11 合回去：530 克、23.7 N·m ----------
  const bottle = (ctx, x, y, s, fill, a) => {
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
    const path = new Path2D('M -32 -150 L 32 -150 L 32 -125 Q 70 -95 70 -40 L 70 140 Q 70 160 50 160 L -50 160 Q -70 160 -70 140 L -70 -40 Q -70 -95 -32 -125 Z');
    ctx.save(); ctx.clip(path);
    ctx.fillStyle = 'rgba(92,225,230,0.55)'; ctx.fillRect(-80, 160 - 290 * fill, 160, 300);
    ctx.fillStyle = 'rgba(160,250,255,0.9)'; ctx.fillRect(-80, 160 - 290 * fill, 160, 4);
    ctx.restore();
    ctx.strokeStyle = COL.bone; ctx.lineWidth = 6; ctx.stroke(path);
    ctx.fillStyle = COL.bone; ctx.fillRect(-36, -175, 72, 22);
    ctx.restore();
  };
  out.push(shot({
    id: 'S11', start: 23, end: 25.5, scene, camera, clear: 0x0b0d11,
    look: { grain: 0.05, vignette: 0.7, chroma: 0.3 },
    baseBloom: { strength: 0.55, radius: 0.5, threshold: 1.1 },
    frame(E, lt, ctx) {
      dust.update(lt + 23);
      setLever(false);
      lights(0.6, 2.0, 4.5, 2.4);
      floor.position.y = -1.0;
      const k = ease.inExpo(clamp(lt / 0.5));
      const xs = explodedAt(3).map((x, i) => lerp(x, assembled[i], k));
      place(xs);
      A.spin((lt + 3) * 3.2);
      pivot.position.set(0.15, 0.55, 0);
      pivot.rotation.set(0.3, -0.9 + lt * 0.35, 0.25);
      camera.fov = 30;
      camera.position.set(0.2, 0.8, 4.9 - lt * 0.15); camera.lookAt(0.05, 0.2, 0); camera.updateMatrixWorld();
      const a1 = window01(lt, 0.5, 2.6, 0.25, 0.2);
      const n = Math.round(530 * ease.outCubic(clamp((lt - 0.5) / 0.7)));
      font(ctx, 300, F.num, 400); ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = COL.bone; ctx.globalAlpha = a1;
      ctx.fillText(String(n), 650, 1450);
      font(ctx, 90, F.sans, 900); ctx.textAlign = 'left'; ctx.fillText('克', 668, 1440);
      ctx.globalAlpha = 1;
      bottle(ctx, 880, 1330, 0.75, ease.outCubic(clamp((lt - 0.7) / 0.9)), a1);
      text(ctx, '≈ 一瓶矿泉水', 820, 1540, { size: 44, weight: 700, color: COL.cyan, alpha: clamp((lt - 1.0) / 0.3) * a1 });
      const a2 = clamp((lt - 1.35) / 0.25);
      if (a2 > 0) {
        text(ctx, '峰值扭矩', 540, 1640, { size: 50, weight: 700, color: COL.steel, alpha: a2 });
        const v = 23.7 * ease.outCubic(clamp((lt - 1.35) / 0.6));
        text(ctx, `${v.toFixed(1)} N·m`, 540, 1760, { size: 150, family: F.num, weight: 400, color: COL.orange, alpha: a2, glow: 20, glowColor: 'rgba(238,106,31,0.5)' });
      }
      kinetic(ctx, '装回去，一只手掌大', 540, 250, lt - 0.45, { size: 72, weight: 900, mode: 'pop', stagger: 0.035 });
      tag(ctx, '第 5 章', 540, 360, { size: 30, bg: 'rgba(243,240,233,0.12)', color: COL.steel, weight: 700, alpha: window01(lt, 0.8, 3, 0.3, 0.2) });
    },
  }));

  // ---------- S12 减速器 ×6.33，10 厘米的杆吊起 20 多千克 ----------
  out.push(shot({
    id: 'S12', start: 25.5, end: 28, scene, camera, clear: 0x0b0d11,
    look: { grain: 0.05, vignette: 0.7, chroma: 0.3 },
    baseBloom: { strength: 0.6, radius: 0.5, threshold: 1.1 },
    frame(E, lt, ctx) {
      dust.update(lt + 25.5);
      const phase2 = clamp((lt - 1.15) / 0.5);
      floor.position.y = -1.6;
      if (phase2 <= 0) { lights(0.06, 0.5, 2.6, 1.4); this.grade.exposure = 0.75; this.bloomP.threshold = 1.35; }
      else lights(0.45, 1.6, 4.0, 2.0);
      // 前半段：齿轮特写（只留减速器）；后半段：拉远看杠杆
      const xs = assembled.slice();
      place(xs);
      A.parts.forEach((p, i) => (p.visible = phase2 > 0 ? true : i === 3));
      // 杆在画面平面里转：从右下 30° 抬到右上 15°（绕关节轴）
      const ang = lerp(-2.094, -1.309, ease.inOutCubic(clamp((lt - 1.45) / 0.9)));
      if (phase2 <= 0) {
        A.spin(lt * 9);
        setLever(false);
        pivot.position.set(0, 0.4, 0); pivot.rotation.set(0, -Math.PI / 2 + 0.08, 0.06);
        camera.fov = 30;
        camera.position.set(0, 0.42, 2.45 - lt * 0.2); camera.lookAt(0, 0.4, 0);
      } else {
        A.spin(0);
        setLever(true, ang, 1.0);
        pivot.position.set(-0.45, 0.4, 0); pivot.rotation.set(0, -Math.PI / 2 + 0.32, 0);
        camera.fov = 30;
        const k = ease.outCubic(phase2);
        camera.position.set(lerp(0.2, 0.35, k), lerp(0.3, 0.2, k), lerp(2.6, 5.0, k)); camera.lookAt(0.3, -0.28, 0);
      }
      camera.updateMatrixWorld();
      if (phase2 <= 0.01) {
        const a = window01(lt, 0, 1.2, 0.15, 0.12);
        text(ctx, '转子本身只有约 3.7 N·m', 540, 330, { size: 58, weight: 900, color: COL.bone, alpha: a });
        kinetic(ctx, '×6.33', 540, 1520, lt - 0.5, { size: 300, family: F.num, weight: 400, mode: 'slam', dur: 0.2, color: COL.orange, glow: 30, glowColor: 'rgba(238,106,31,0.6)', alpha: a });
        text(ctx, '行星减速器把力气放大', 540, 1690, { size: 52, weight: 700, color: COL.bone, alpha: clamp((lt - 0.55) / 0.2) * a });
      } else {
        // 尺寸线：杆长 10 cm
        const p0 = new THREE.Vector3(0, 0.0, 0); lever.localToWorld(p0);
        const p1 = new THREE.Vector3(0, 1.0, 0); lever.localToWorld(p1);
        const s0 = toScreen(p0, camera), s1 = toScreen(p1, camera);
        const a = clamp((lt - 1.5) / 0.3);
        ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = COL.bone; ctx.lineWidth = 3;
        const nx = -(s1.y - s0.y), ny = s1.x - s0.x, nl = Math.hypot(nx, ny), ox = nx / nl * 46, oy = ny / nl * 46;
        ctx.beginPath(); ctx.moveTo(s0.x + ox, s0.y + oy); ctx.lineTo(s1.x + ox, s1.y + oy); ctx.stroke();
        font(ctx, 52, F.num, 400); ctx.fillStyle = COL.bone; ctx.textAlign = 'center';
        ctx.fillText('10 CM', (s0.x + s1.x) / 2 + ox * 2.2, (s0.y + s1.y) / 2 + oy * 2.2);
        ctx.restore();
        kinetic(ctx, '10 厘米的杆', 540, 270, lt - 1.25, { size: 80, weight: 900, mode: 'pop', stagger: 0.04 });
        kinetic(ctx, '吊起 20 多千克', 540, 390, lt - 1.55, { size: 80, weight: 900, mode: 'pop', stagger: 0.04, color: COL.orange });
        text(ctx, '23.7 N·m ÷ 0.1 m ≈ 237 N', 540, 1720, { size: 46, family: F.mono, weight: 700, color: COL.steel, alpha: clamp((lt - 1.9) / 0.3) });
      }
    },
  }));
  return out;
}
