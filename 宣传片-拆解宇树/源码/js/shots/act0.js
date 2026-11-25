// 开场（0–10 秒）：舞台慢动作空翻 → 时间冻住、三个问题 → 炸成零件 → 片名
import * as THREE from 'three';
import { makeMats } from '../models/materials.js';
import { buildHumanoid, placeFlip, footMinY } from '../models/humanoid.js';
import { buildActuator } from '../models/actuator.js';
import { Particles, dustField, beam, glow, withEnv } from '../core/fx3d.js';
import { kinetic, text, F, font } from '../core/text.js';
import { crosshair, callout, ruler, slate, grid, brackets } from '../core/hud.js';
import { clamp, lerp, ease, prog, rng, smoothstep, window01, COL, TAU, hash } from '../core/util.js';
import { shot, cam, toScreen, bakeParts, seg } from './common.js';

const LED_FRAG = /* glsl */ `
uniform float time, intensity, mono; uniform vec3 c1, c2; varying vec2 vUv;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  vec2 g = vUv * vec2(150.0, 36.0);
  vec2 cell = floor(g); vec2 f = fract(g) - 0.5;
  float sq = smoothstep(0.5, 0.15, max(abs(f.x), abs(f.y)));
  float x = cell.x / 150.0, y = cell.y / 36.0;
  float w1 = 0.5 + 0.5 * sin((x * 9.0 - y * 4.0) - time * 2.2);
  float w2 = 0.5 + 0.5 * sin(length(vec2(x - 0.5, (y - 0.3) * 0.6)) * 30.0 - time * 5.0);
  float v = pow(w1 * 0.55 + w2 * 0.45, 3.0);
  float sparkle = step(0.988, h(cell + floor(time * 10.0)));
  vec3 col = mix(c1, c2, w2) * (0.05 + 0.95 * v) + c2 * sparkle;
  col *= smoothstep(0.0, 0.18, y) * smoothstep(1.0, 0.82, y);
  gl_FragColor = vec4(col * sq * intensity, 1.0);
}`;

function buildStage(E) {
  const M = makeMats();
  const scene = withEnv(E, new THREE.Scene(), 0.3);
  scene.fog = new THREE.FogExp2(0x07080b, 0.022);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0x0a0b0e, roughness: 0.42, metalness: 0.5 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const ring = null;
  const led = new THREE.Mesh(new THREE.PlaneGeometry(46, 6), new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, intensity: { value: 0.55 }, mono: { value: 0 }, c1: { value: new THREE.Color(0xee6a1f) }, c2: { value: new THREE.Color(0xffd9b0) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: LED_FRAG,
  }));
  led.position.set(0, 4.2, -18); scene.add(led);
  // 舞台深处的光柱和虚焦光斑，给画面纵深
  const pillarMat = new THREE.ShaderMaterial({
    uniforms: { c: { value: new THREE.Color(0xff8a3d) }, k: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 c; uniform float k; varying vec2 vUv; void main(){ float a = pow(smoothstep(0.5, 0.0, abs(vUv.x - 0.5)), 2.0) * smoothstep(0.0, 0.45, vUv.y) * smoothstep(1.0, 0.6, vUv.y); gl_FragColor = vec4(c * a * 0.55 * k, 1.0); }',
    blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
  });
  const pillars = [];
  for (let i = 0; i < 8; i++) {
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 12), pillarMat);
    pl.position.set(-12.25 + i * 3.5, 6, -16); scene.add(pl); pillars.push(pl);
  }
  const bokeh = [];
  const BR = rng(9);
  for (let i = 0; i < 26; i++) {
    const s = glow(BR() < 0.5 ? 0xff9a55 : 0x7fd8ff, 0.8 + 1.6 * BR(), 0.35 + 0.5 * BR());
    s.position.set(-14 + 28 * BR(), 0.5 + 9 * BR(), -13 - 5 * BR());
    scene.add(s); bokeh.push(s);
  }
  scene.add(new THREE.HemisphereLight(0x8fa6c0, 0x140f0c, 0.35));
  const key = new THREE.SpotLight(0xfff0dc, 75, 30, 0.42, 0.6, 2);
  key.position.set(1.2, 8, 5); key.target.position.set(0, 2, 0); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.radius = 3;
  scene.add(key, key.target);
  const rimL = new THREE.SpotLight(0xff8a3d, 260, 30, 0.5, 0.7, 2); rimL.position.set(-3.5, 6.5, -4.5); rimL.target.position.set(0, 2.2, 0); scene.add(rimL, rimL.target);
  const rimR = new THREE.SpotLight(0x8fd8ff, 230, 30, 0.5, 0.7, 2); rimR.position.set(3.5, 6, -4); rimR.target.position.set(0, 2.2, 0); scene.add(rimR, rimR.target);
  const beams = [];
  const bx = [-5.5, -3.3, -1.2, 1.2, 3.3, 5.5];
  bx.forEach((x, i) => {
    const b = beam(i % 2 ? 0xff9a55 : 0xd8ecff, { len: 14, radius: 1.3, intensity: 0.22 });
    scene.add(b); beams.push({ b, x, i });
  });
  const dust = dustField(500, [[-5, 0, -6], [5, 7, 3]], 11, { color: [1.0, 0.82, 0.62], size: [0.025, 0.07], alpha: [0.1, 0.5], speed: 0.03 });
  dust.mat.uniforms.scale.value = 2500 * E.scale;
  scene.add(dust.points);
  // 观众席的闪光灯
  const flashes = [];
  const R = rng(5);
  for (let i = 0; i < 14; i++) {
    const s = glow(0xffffff, 0.5, 6); s.position.set(-6 + 12 * R(), 0.3 + 1.2 * R(), 2 + 4 * R());
    s.userData.t0 = R() * 3; s.userData.p = 0.5 + R();
    scene.add(s); flashes.push(s);
  }
  const H = buildHumanoid(M);
  H.rotation.order = 'YXZ';
  scene.add(H);
  const ghosts = [];
  for (let k = 1; k <= 6; k++) {
    const gm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff8a3d).multiplyScalar(0.9), transparent: true, opacity: 0.15 * (1 - k / 7), blending: THREE.AdditiveBlending, depthWrite: false });
    const g = buildHumanoid(M, { ghost: gm }); g.rotation.order = 'YXZ';
    g.traverse((o) => { if (o.isMesh) o.castShadow = false; });
    scene.add(g); ghosts.push(g);
  }
  const camera = cam(42);
  return { M, scene, floor, ring, led, key, rimL, rimR, beams, dust, flashes, H, ghosts, camera, pillars, bokeh, pillarMat };
}

// 观众席闪光灯的时刻（秒）
const FLASHES = [0.32, 0.9, 1.37, 1.8, 2.41, 2.77];

// 慢动作：S01 的 3 秒里，空翻从 u=0.36 走到 0.555
const U0 = 0.36, U1 = 0.555, RISE = 2.25;
const uAt = (t) => lerp(U0, U1, ease.outQuad(clamp(t / 3)));

export function act0(E) {
  const st = buildStage(E);
  const { scene, H, ghosts, camera } = st;

  const stageTick = (t, frozenT, { beams = true } = {}) => {
    const tt = frozenT ?? t;
    st.beams.forEach(({ b }) => (b.visible = beams));
    st.pillars.forEach((p) => (p.visible = beams));
    st.key.intensity = beams ? 75 : 40;
    st.led.material.uniforms.time.value = tt;
    st.beams.forEach(({ b, x, i }) => {
      b.material.uniforms.time.value = tt;
      b.aim(new THREE.Vector3(x, 10, -5), new THREE.Vector3(x * 0.25 + Math.sin(tt * 0.7 + i) * 0.9, 0.5, 1.0));
    });
    st.dust.update(tt);
    // 闪光灯：和配乐里的快门声用同一张时间表（audio/score.py 的 FLASHES）
    st.flashes.forEach((s, i) => {
      const ft = FLASHES[i % FLASHES.length] + (i >= FLASHES.length ? 0.04 : 0);
      s.visible = frozenT === undefined && tt >= ft && tt < ft + 0.067;
    });
  };
  const poseAt = (u) => placeFlip(H, u, { x: 0, z: 0, rise: RISE });
  const poseGhosts = (u, k0 = 1) => ghosts.forEach((g, k) => { placeFlip(g, u - (k + k0) * 0.011, { rise: RISE }); g.visible = true; });

  // 冻住时刻的姿态，以及“炸开”用的零件
  poseAt(U1);
  const centre = new THREE.Vector3(); H.userData.J.spine.getWorldPosition(centre);
  centre.y += 0.1;
  const parts = bakeParts(H);
  const partsGroup = new THREE.Group(); parts.forEach((p) => partsGroup.add(p)); scene.add(partsGroup);
  const R = rng(21);
  parts.forEach((p) => {
    const d = p.userData.center.clone().sub(centre);
    if (d.lengthSq() < 1e-4) d.set(R() - 0.5, R() - 0.5, R() - 0.5);
    d.normalize().add(new THREE.Vector3(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(0.6)).normalize();
    p.userData.dir = d;
    p.userData.dist = 0.9 + 1.7 * R();
    p.userData.axis = new THREE.Vector3(R() - 0.5, R() - 0.5, R() - 0.5).normalize();
    p.userData.spin = (R() - 0.5) * 5;
  });
  const coreGlow = glow(0xffb070, 1, 3); coreGlow.position.copy(centre); scene.add(coreGlow);

  // 屏幕上某个关节的位置
  const jointScreen = (name, off = [0, 0, 0]) => {
    const v = new THREE.Vector3(...off); H.userData.J[name].localToWorld(v); return toScreen(v, camera);
  };

  // ---------------- S01 舞台慢动作空翻 ----------------
  // 镜头跟着机器人往上摇；右边是一根立在机器人身旁的“世界坐标标尺”，刻度随镜头滚动
  const hipW = new THREE.Vector3();
  const topOf = () => {
    H.updateMatrixWorld(true);
    let top = -Infinity;
    const v = new THREE.Vector3();
    H.traverse((o) => { if (o.isMesh) { o.getWorldPosition(v); top = Math.max(top, v.y + 0.09); } });
    return top;
  };
  const S01 = shot({
    id: 'S01', start: 0, end: 3, scene, camera,
    look: { grain: 0.06, vignette: 0.8, chroma: 0.35 },
    baseBloom: { strength: 0.7, radius: 0.55, threshold: 1.15 },
    baseGrade: { exposure: 0.95, contrast: 1.08 },
    frame(E, lt, ctx) {
      stageTick(lt);
      st.M.orange.emissiveIntensity = 0.1;
      H.visible = true; partsGroup.visible = false; coreGlow.visible = false;
      const u = uAt(lt);
      poseAt(u); poseGhosts(u);
      H.userData.J.spine.getWorldPosition(hipW);
      const k = ease.inOutQuad(clamp(lt / 3));
      camera.position.set(1.55 - 0.9 * k, hipW.y - 1.05 + 0.25 * k, 4.1 - 0.3 * k);
      camera.lookAt(0.05, hipW.y + 0.15, -0.35);
      camera.rotateZ(-0.05 + 0.03 * k);
      camera.updateMatrixWorld();
      // 世界坐标标尺：立在机器人右边 1.15 米处
      const top = topOf();
      const a = window01(lt, 0.2, 3.3, 0.35, 0.1);
      const RX = 0.78, RZ = -0.35;
      ctx.save(); ctx.globalAlpha = a;
      ctx.strokeStyle = COL.bone; ctx.lineWidth = 3;
      const p0 = toScreen(new THREE.Vector3(RX, 0, RZ), camera), p4 = toScreen(new THREE.Vector3(RX, 4, RZ), camera);
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p4.x, p4.y); ctx.stroke();
      for (let i = 0; i <= 40; i++) {
        const q = toScreen(new THREE.Vector3(RX, i * 0.1, RZ), camera);
        if (q.y < -50 || q.y > 1970) continue;
        const big = i % 5 === 0;
        ctx.lineWidth = big ? 3 : 1.5;
        ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x - (big ? 34 : 16), q.y); ctx.stroke();
        if (i % 10 === 0 && i > 0) { font(ctx, 34, F.mono, 700); ctx.fillStyle = i === 30 ? COL.orange : COL.steel; ctx.textAlign = 'right'; ctx.fillText(`${i / 10} m`, q.x - 44, q.y + 12); }
      }
      const pt = toScreen(new THREE.Vector3(RX, top, RZ), camera);
      ctx.fillStyle = COL.orange;
      ctx.beginPath(); ctx.moveTo(pt.x + 8, pt.y); ctx.lineTo(pt.x + 36, pt.y - 16); ctx.lineTo(pt.x + 36, pt.y + 16); ctx.closePath(); ctx.fill();
      ctx.setLineDash([10, 8]); ctx.strokeStyle = 'rgba(238,106,31,0.7)'; ctx.lineWidth = 2;
      const hs = toScreen(new THREE.Vector3(0, top, 0), camera);
      ctx.beginPath(); ctx.moveTo(hs.x + 60, pt.y); ctx.lineTo(pt.x - 4, pt.y); ctx.stroke(); ctx.setLineDash([]);
      if (top > 3) {
        const kk = clamp((lt - 2.35) / 0.25);
        font(ctx, 92, F.num, 400); ctx.textAlign = 'left'; ctx.fillStyle = COL.orange; ctx.globalAlpha = a * kk;
        ctx.shadowColor = 'rgba(238,106,31,0.8)'; ctx.shadowBlur = 24;
        ctx.fillText('3 M+', Math.min(pt.x + 44, 900), pt.y + 32);
      }
      ctx.restore();
      slate(ctx, '2026 · 春晚舞台', '慢放', 150, window01(lt, 0.05, 3.2, 0.3, 0.1));
      // 底部压暗，字更清楚
      const gr = ctx.createLinearGradient(0, 1200, 0, 1920); gr.addColorStop(0, 'rgba(7,8,11,0)'); gr.addColorStop(1, 'rgba(7,8,11,0.75)');
      ctx.fillStyle = gr; ctx.fillRect(0, 1200, 1080, 720);
      kinetic(ctx, '一个最高超过 3 米的', 540, 1415, lt - 0.25, { size: 60, weight: 700, mode: 'pop', stagger: 0.035 });
      kinetic(ctx, '弹射空翻', 540, 1585, lt - 1.0, { size: 230, family: F.title, weight: 400, mode: 'slam', dur: 0.25, gradient: ['#FFC08F', '#EE6A1F'], glow: 26, glowColor: 'rgba(238,106,31,0.55)' });
    },
  });

  // ---------------- S02 时间冻住，三个问题 ----------------
  const qs = [['它是遥控的，', '还是自己在动？'], ['为什么能翻跟头，', '却端不稳一杯水？'], ['凭什么把人形机器人', '卖到十万元以内？']];
  const orbitCam = (lt, extra = 0) => {
    const k = ease.inOutCubic(clamp(lt / 3)) + extra;
    const ang = 0.15 + k * 1.55;
    const r = 4.6 - 1.0 * ease.outCubic(clamp(lt / 3));
    camera.position.set(centre.x + Math.sin(ang) * r, centre.y - 0.6 + k * 0.5, centre.z + Math.cos(ang) * r);
    camera.lookAt(centre.x, centre.y - 0.95, centre.z);
    camera.updateMatrixWorld();
  };
  const S02 = shot({
    id: 'S02', start: 3, end: 6, scene, camera,
    look: { grain: 0.07, vignette: 0.8, chroma: 0.45 },
    baseBloom: { strength: 0.6, radius: 0.5, threshold: 1.1 },
    baseGrade: { exposure: 0.9, saturation: 0.04, keepOrange: 1, contrast: 1.25, lift: -0.03 },
    frame(E, lt, ctx) {
      stageTick(3, 3, { beams: false });
      st.M.orange.emissiveIntensity = 0.1;
      H.visible = true; partsGroup.visible = false; coreGlow.visible = false;
      poseAt(U1); poseGhosts(U1);
      orbitCam(lt);
      // 暂停标记
      font(ctx, 34, F.mono, 800); ctx.textAlign = 'left'; ctx.fillStyle = COL.orange;
      ctx.globalAlpha = 0.6 + 0.4 * (Math.floor(lt * 4) % 2);
      ctx.fillRect(84, 136, 12, 34); ctx.fillRect(104, 136, 12, 34);
      ctx.fillStyle = COL.bone; ctx.fillText('时间停止 · 00:03.00', 134, 165); ctx.globalAlpha = 1;
      // 准星锁住三个关节
      const pts = [['kneeL', [0, 0, 0], '关节 · 07'], ['shoulderR', [0, 0, 0], '关节 · 03'], ['head', [0, 0.08, 0], '头部 · 传感器']];
      pts.forEach(([n, off, lab], i) => {
        const s = jointScreen(n, off);
        const lp = lt - 0.15 - i * 0.22;
        if (lp > 0) {
          crosshair(ctx, s.x, s.y, 34, lt * 2 + i, { p: clamp(lp / 0.3), color: COL.orange, alpha: 0.95 });
          font(ctx, 24, F.mono, 700); ctx.fillStyle = COL.bone; ctx.globalAlpha = clamp(lp / 0.3); ctx.textAlign = 'left';
          ctx.fillText(lab, s.x + 48, s.y - 30); ctx.globalAlpha = 1;
        }
      });
      // 三个问题：新的在下面放大，旧的往上缩
      qs.forEach((q, i) => {
        const t0 = i * 1.0;
        if (lt < t0) return;
        const age = lt - t0;
        const level = Math.min(2 - i, Math.floor(clamp((lt - t0) / 1.0, 0, 2.999))); // 之后每过一拍往上一级
        const kUp = (j) => ease.outCubic(clamp((lt - t0 - j) / 0.25));
        const lift = (kUp(1) + kUp(2)) * (i < 2 ? 1 : 0);
        const y = 1440 - lift * 190;
        const size = 78 - lift * 16;
        const alpha = 1 - lift * 0.3;
        font(ctx, 54, F.num, 400);
        ctx.globalAlpha = alpha * clamp(age / 0.1); ctx.fillStyle = COL.orange; ctx.textAlign = 'left';
        ctx.fillText(`Q${i + 1}`, 92, y - size * 0.05);
        ctx.globalAlpha = 1;
        kinetic(ctx, q[0], 560, y - size * 0.62, age, { size, weight: 900, mode: 'pop', stagger: 0.03, alpha });
        kinetic(ctx, q[1], 560, y + size * 0.62, age - 0.12, { size, weight: 900, mode: 'pop', stagger: 0.03, alpha, color: i === 1 ? '#FFFFFF' : COL.bone });
        void level;
      });
    },
  });

  // ---------------- S03 炸开 ----------------
  const S03 = shot({
    id: 'S03', start: 6, end: 8, scene, camera,
    look: { grain: 0.07, vignette: 0.8, chroma: 0.4 },
    baseBloom: { strength: 0.9, radius: 0.6, threshold: 1.0 },
    baseGrade: { saturation: 0.35, keepOrange: 1, contrast: 1.12 },
    frame(E, lt, ctx) {
      stageTick(3, 3, { beams: false });
      orbitCam(3, lt * 0.12);
      const tBoom = 0.25, tBack = 1.35, tGone = 1.72;
      const boom = lt >= tBoom;
      H.visible = !boom;
      ghosts.forEach((g) => (g.visible = !boom && lt < 0.15));
      if (!boom) { poseAt(U1); }
      partsGroup.visible = boom && lt < tGone;
      // 炸开前：缝里透出橙光
      coreGlow.visible = lt < tGone;
      const pre = clamp(lt / tBoom);
      const back = clamp((lt - tBack) / (tGone - tBack));
      const gs = boom ? (lt < tBack ? 0.55 * Math.exp(-(lt - tBoom) * 4) + 0.08 : 0.08 + 1.1 * ease.inExpo(back)) : 0.05 + pre * pre * 0.35;
      coreGlow.scale.set(gs, gs, 1);
      st.M.orange.emissiveIntensity = boom ? 0.1 + 2.5 * Math.exp(-(lt - tBoom) * 5) : 0.1 + 5 * pre * pre;
      if (boom) {
        const k = ease.outExpo(clamp((lt - tBoom) / 1.1));
        const q = new THREE.Quaternion();
        parts.forEach((p) => {
          const u = p.userData;
          const off = u.dir.clone().multiplyScalar(u.dist * k);
          const pos = u.p0.clone().add(off);
          const ib = ease.inExpo(back);
          pos.lerp(centre, ib);
          p.position.copy(pos);
          q.setFromAxisAngle(u.axis, u.spin * k + ib * 3);
          p.quaternion.copy(u.q0).premultiply(q);
          const s = 1 - ib * 0.95;
          p.scale.set(s, s, s);
        });
      }
      // 标注三个零件
      if (boom && lt < tBack) {
        const lab = [['kneeL', '关节电机', 'MOTOR'], ['battery', '电池', 'BATTERY'], ['head', '传感器', 'SENSORS']];
        lab.forEach(([tg, name, en], i) => {
          const p = parts.find((q) => q.userData.tag === tg) || parts[0];
          const s = toScreen(p.position, camera);
          const lp = clamp((lt - 0.45 - i * 0.12) / 0.45);
          const la = 1 - clamp((lt - 1.12) / 0.2);
          let dir = i % 2 ? -1 : 1;
          if (s.x + 330 > 1010) dir = -1;
          if (s.x - 330 < 70) dir = 1;
          const bx = s.x + dir * 130, by = s.y - 110;
          callout(ctx, s.x, s.y, bx, by, name, lp, { dir, hlen: 170, size: 40, sub: en, color: COL.bone, alpha: la });
        });
      }
      kinetic(ctx, '答案，拆开就知道。', 540, 1500, lt - 0.32, { size: 84, weight: 900, mode: 'pop', stagger: 0.04, out: 1.25, glow: 18, glowColor: 'rgba(0,0,0,0.6)' });
    },
  });

  // ---------------- S04 片名 ----------------
  const tScene = withEnv(E, new THREE.Scene(), 0.4);
  const tCam = cam(32);
  const A = buildActuator(makeMats());
  const wire = new THREE.Group();
  const lineMat = new THREE.LineBasicMaterial({ color: new THREE.Color(0xff7a2a).multiplyScalar(1.6), transparent: true, opacity: 0.55 });
  A.root.traverse((o) => {
    if (o.isMesh) {
      const l = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 28), lineMat);
      l.position.copy(o.position); l.quaternion.copy(o.quaternion); l.scale.copy(o.scale);
      o.parent.add(l); o.visible = false;
    }
  });
  A.root.rotation.set(0.35, -0.75, 0.15);
  A.root.position.set(-1.6, 0.2, -2.5);
  tScene.add(A.root);
  const sparks = new Particles(420, { intensity: 3.2 });
  sparks.mat.uniforms.scale.value = 2500 * E.scale;
  tScene.add(sparks.points);
  const SR = rng(77);
  const sp = Array.from({ length: 420 }, () => {
    const th = SR() * TAU, ph = Math.acos(2 * SR() - 1), v = 1.5 + 5 * Math.pow(SR(), 2);
    return { vx: Math.sin(ph) * Math.cos(th) * v, vy: Math.cos(ph) * v * 0.8 + 1, vz: Math.sin(ph) * Math.sin(th) * v * 0.4, life: 0.6 + SR() * 1.3, s: 0.02 + SR() * 0.05, w: SR() };
  });
  const titleCanvas = document.createElement('canvas'); titleCanvas.width = 1080; titleCanvas.height = 400;
  {
    const c = titleCanvas.getContext('2d');
    font(c, 290, F.title, 400); c.textAlign = 'center'; c.textBaseline = 'middle';
    const g = c.createLinearGradient(0, 80, 0, 320); g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, '#E9E2D4');
    c.fillStyle = g; c.fillText('拆解宇树', 540, 210);
  }
  const S04 = shot({
    id: 'S04', start: 8, end: 10, scene: tScene, camera: tCam,
    look: { grain: 0.05, vignette: 0.7, chroma: 0.3 },
    baseBloom: { strength: 0.9, radius: 0.6, threshold: 0.9 },
    frame(E, lt, ctx) {
      tCam.position.set(0.3 * lt, 0.1, 4.4 - lt * 0.25); tCam.lookAt(-0.4, 0.1, -2); tCam.updateMatrixWorld();
      A.layout(0.55 + 0.45 * ease.outCubic(clamp(lt / 1.5)), lt);
      A.spin(lt * 2.5);
      A.root.rotation.y = -0.75 + lt * 0.12;
      for (let i = 0; i < sp.length; i++) {
        const s = sp[i], a = lt - 0.02 * s.w;
        const k = a / s.life;
        if (a < 0 || k > 1) { sparks.set(i, 0, 0, -100, 0, 0); continue; }
        const x = s.vx * a, y = s.vy * a - 4.9 * a * a * 0.6, z = s.vz * a;
        const hot = 1 - k;
        sparks.set(i, x * 0.6, y * 0.6 + 0.3, z * 0.6 - 0.5, s.s * (1 + hot), hot * hot, 1, 0.55 + 0.4 * hot, 0.25 + 0.5 * hot * hot);
      }
      sparks.commit();
      // 背景网格和四角框
      grid(ctx, 1080, 1920, 54, { alpha: 0.08 + 0.05 * Math.exp(-lt * 3), ox: lt * 10, oy: lt * 6 });
      brackets(ctx, 70, 640, 940, 640, { p: clamp((lt - 0.15) / 0.4), len: 50, color: COL.orange, lw: 5, alpha: 0.9 });
      const rg = ctx.createRadialGradient(540, 960, 60, 540, 960, 620);
      rg.addColorStop(0, 'rgba(10,11,14,0.82)'); rg.addColorStop(1, 'rgba(10,11,14,0)');
      ctx.fillStyle = rg; ctx.fillRect(0, 300, 1080, 1320);
      // 片名：沿一条斜缝错开，0.22 秒合上
      const k = ease.outExpo(clamp(lt / 0.22));
      const off = (1 - k) * 70;
      const sc = 1 + 0.35 * Math.pow(1 - ease.outQuart(clamp(lt / 0.3)), 2) + 0.03 * Math.max(0, lt - 0.3);
      const cx = 540, cy = 960;
      const halves = [[1, -1], [-1, 1]];
      halves.forEach(([sx, sy], hi) => {
        ctx.save();
        ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
        ctx.beginPath();
        if (hi === 0) { ctx.moveTo(0, 0); ctx.lineTo(1080, 0); ctx.lineTo(1080, cy - 120); ctx.lineTo(0, cy + 120); }
        else { ctx.moveTo(0, cy + 120); ctx.lineTo(1080, cy - 120); ctx.lineTo(1080, 1920); ctx.lineTo(0, 1920); }
        ctx.closePath(); ctx.clip();
        ctx.globalAlpha = clamp(lt / 0.05);
        ctx.drawImage(titleCanvas, sx * off * 1.4 - (1080 - 1080) / 2, cy - 210 + sy * off);
        ctx.restore();
      });
      // 缝上的亮线
      const seamA = (1 - clamp((lt - 0.2) / 0.9)) * clamp(lt / 0.2);
      if (seamA > 0) {
        ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
        ctx.strokeStyle = COL.orange; ctx.lineWidth = 6; ctx.shadowColor = COL.orange; ctx.shadowBlur = 30; ctx.globalAlpha = seamA;
        ctx.beginPath(); ctx.moveTo(60, cy + 106); ctx.lineTo(1020, cy - 106); ctx.stroke(); ctx.restore();
      }
      kinetic(ctx, '从一颗电机到会翻跟头的机器人', 540, 1215, lt - 0.5, { size: 50, weight: 500, mode: 'decode', stagger: 0.035, color: COL.bone, spacing: 4 });
      ctx.fillStyle = COL.orange; ctx.globalAlpha = clamp((lt - 0.4) / 0.3);
      const bw = 520 * ease.outCubic(clamp((lt - 0.4) / 0.5)); ctx.fillRect(540 - bw / 2, 1150, bw, 5); ctx.globalAlpha = 1;
    },
  });

  return [S01, S02, S03, S04];
}
