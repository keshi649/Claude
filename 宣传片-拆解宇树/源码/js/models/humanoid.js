// 人形机器人：自己设计的通用造型，约 1.36 米高。根节点在骨盆中心，面朝 +z，它的左手在 +x。
// 关节角约定：髋、肩、肘绕 x 轴转时，负值是往前（屈髋、抬臂、屈肘）；膝盖正值是弯曲。
import * as THREE from 'three';
import { RB, cyl, cap, mesh, group } from './materials.js';
import { lerp, clamp, ease, smoothstep, TAU } from '../core/util.js';

export function buildHumanoid(M, { ghost = null } = {}) {
  const root = new THREE.Group();
  root.name = 'J_root';
  root.rotation.order = 'YXZ';
  const J = { root };
  const g = (parent, pos, name) => { const x = group(parent, pos); x.name = 'J_' + name; J[name] = x; return x; };
  const m = (geo, mat, parent, pos, rot) => mesh(geo, ghost || mat, parent, pos, rot);

  m(RB(0.26, 0.12, 0.16, 0.04), M.graphite, root);
  const spine = g(root, [0, 0.06, 0], 'spine');
  m(RB(0.18, 0.06, 0.15, 0.02), M.graphite, spine, [0, 0.03, 0]);
  m(RB(0.31, 0.29, 0.19, 0.06), M.shell, spine, [0, 0.21, 0]);
  m(RB(0.22, 0.035, 0.012, 0.006), M.orange, spine, [0, 0.29, 0.096]);
  m(RB(0.06, 0.12, 0.012, 0.006), M.graphite, spine, [0, 0.17, 0.096]);
  m(new THREE.CircleGeometry(0.022, 32), M.glowO, spine, [0, 0.19, 0.103]);
  m(RB(0.23, 0.23, 0.07, 0.02), M.graphite, spine, [0, 0.2, -0.115]).userData.tag = 'battery';
  m(RB(0.16, 0.03, 0.02, 0.008), M.orange, spine, [0, 0.12, -0.152]);
  const neck = g(spine, [0, 0.36, 0], 'neck');
  m(cyl(0.035, 0.07), M.graphite, neck, [0, 0.02, 0]);
  const head = g(neck, [0, 0.06, 0], 'head');
  m(RB(0.17, 0.18, 0.17, 0.05), M.shell, head, [0, 0.08, 0]).userData.tag = 'head';
  m(RB(0.15, 0.072, 0.03, 0.015), M.glass, head, [0, 0.09, 0.078]);
  m(RB(0.11, 0.012, 0.006, 0.004), M.glowO, head, [0, 0.09, 0.095]);
  m(cyl(0.035, 0.03, 'x'), M.graphite, head, [0.095, 0.08, 0]);
  m(cyl(0.035, 0.03, 'x'), M.graphite, head, [-0.095, 0.08, 0]);

  for (const s of [1, -1]) {
    const L = s > 0 ? 'L' : 'R';
    const sh = g(spine, [0.195 * s, 0.33, 0], 'shoulder' + L);
    m(cyl(0.052, 0.075, 'x'), M.orange, sh, [0.01 * s, 0, 0]);
    m(cap(0.043, 0.15), M.graphite, sh, [0.025 * s, -0.12, 0]);
    m(RB(0.07, 0.12, 0.075, 0.03), M.shell, sh, [0.025 * s, -0.09, 0]);
    const el = g(sh, [0.025 * s, -0.245, 0], 'elbow' + L);
    m(cyl(0.04, 0.065, 'x'), M.orange, el);
    m(cap(0.036, 0.14), M.shell, el, [0, -0.11, 0]);
    const ha = g(el, [0, -0.225, 0], 'hand' + L);
    m(RB(0.05, 0.09, 0.065, 0.02), M.graphite, ha, [0, -0.045, 0.005]);
    const hip = g(root, [0.088 * s, -0.06, 0], 'hip' + L);
    m(cyl(0.056, 0.085, 'x'), M.orange, hip);
    m(cap(0.06, 0.19), M.shell, hip, [0, -0.16, 0]);
    m(RB(0.05, 0.16, 0.02, 0.008), M.graphite, hip, [0, -0.16, 0.06]);
    const kn = g(hip, [0, -0.32, 0], 'knee' + L);
    m(cyl(0.05, 0.085, 'x'), M.orange, kn).userData.tag = 'knee' + L;
    m(cap(0.047, 0.21), M.graphite, kn, [0, -0.16, 0]);
    const an = g(kn, [0, -0.32, 0], 'ankle' + L);
    m(cyl(0.032, 0.065, 'x'), M.graphite, an);
    m(RB(0.095, 0.045, 0.215, 0.02), M.graphite, an, [0, -0.035, 0.04]);
    m(RB(0.07, 0.012, 0.05, 0.005), M.orange, an, [0, -0.012, 0.12]);
  }
  root.userData.J = J;
  return root;
}

const JOINTS = ['spine', 'neck', 'head', 'shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'handL', 'handR', 'hipL', 'hipR', 'kneeL', 'kneeR', 'ankleL', 'ankleR'];

export function applyPose(h, P) {
  const J = h.userData.J;
  if (P.pos) h.position.set(P.pos[0], P.pos[1], P.pos[2]);
  if (P.rot) h.rotation.set(P.rot[0], P.rot[1], P.rot[2]);
  for (const n of JOINTS) {
    const v = P[n];
    const j = J[n];
    if (!j) continue;
    if (v === undefined) j.rotation.set(0, 0, 0);
    else if (typeof v === 'number') j.rotation.set(v, 0, 0);
    else j.rotation.set(v[0] || 0, v[1] || 0, v[2] || 0);
  }
}

// 两个姿态插值（角度逐分量线性插值）
export function mixPose(A, B, t) {
  const out = {};
  const keys = new Set([...Object.keys(A), ...Object.keys(B)]);
  for (const k of keys) {
    const a = A[k] ?? (Array.isArray(B[k]) ? [0, 0, 0] : 0), b = B[k] ?? (Array.isArray(A[k]) ? [0, 0, 0] : 0);
    if (Array.isArray(a) || Array.isArray(b)) {
      const aa = Array.isArray(a) ? a : [a, 0, 0], bb = Array.isArray(b) ? b : [b, 0, 0];
      out[k] = [lerp(aa[0], bb[0], t), lerp(aa[1] || 0, bb[1] || 0, t), lerp(aa[2] || 0, bb[2] || 0, t)];
    } else out[k] = lerp(a, b, t);
  }
  return out;
}

// 关键帧序列：[[u, pose], ...]，u 递增；用平滑插值
export function samplePoses(keys, u) {
  if (u <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [u0, p0] = keys[i], [u1, p1] = keys[i + 1];
    if (u <= u1) return mixPose(p0, p1, ease.inOutQuad((u - u0) / (u1 - u0)));
  }
  return keys[keys.length - 1][1];
}

const sym = (o) => { // 左右对称：给 L 自动配 R（z 方向、y 方向取反）
  const r = { ...o };
  for (const k of Object.keys(o)) if (k.endsWith('L')) {
    const v = o[k];
    r[k.slice(0, -1) + 'R'] = Array.isArray(v) ? [v[0], -(v[1] || 0), -(v[2] || 0)] : v;
  }
  return r;
};

export const POSE = {
  stand: sym({ spine: 0.02, neck: 0, hipL: [-0.08, 0, 0.02], kneeL: 0.16, ankleL: -0.08, shoulderL: [0.05, 0, 0.12], elbowL: -0.25 }),
  crouch: sym({ spine: 0.42, neck: -0.25, hipL: [-1.15, 0, 0.06], kneeL: 1.95, ankleL: -0.8, shoulderL: [0.95, 0, 0.18], elbowL: -0.15 }),
  launch: sym({ spine: -0.28, neck: -0.2, hipL: [0.12, 0, 0.02], kneeL: 0.05, ankleL: 0.65, shoulderL: [-2.95, 0, 0.12], elbowL: -0.1 }),
  tuck: sym({ spine: 0.55, neck: 0.3, hipL: [-2.15, 0, 0.12], kneeL: 2.35, ankleL: 0.2, shoulderL: [-1.05, 0, 0.25], elbowL: -1.35 }),
  open: sym({ spine: 0.12, neck: 0.05, hipL: [-0.75, 0, 0.06], kneeL: 0.75, ankleL: -0.1, shoulderL: [-1.7, 0, 0.35], elbowL: -0.3 }),
  land: sym({ spine: 0.42, neck: -0.15, hipL: [-1.05, 0, 0.08], kneeL: 1.65, ankleL: -0.62, shoulderL: [-1.35, 0, 0.45], elbowL: -0.35 }),
  ready: sym({ spine: 0.06, neck: -0.04, hipL: [-0.25, 0, 0.04], kneeL: 0.42, ankleL: -0.17, shoulderL: [-0.35, 0, 0.3], elbowL: -0.55 }),
};

// 后空翻：u ∈ [0,1]。只给关节角、翻转角和前后位移；高度由 placeFlip 算（着地时脚踩在地上，腾空时走抛物线）
export const FLIP_TAKE = 0.29, FLIP_LAND = 0.84;
export function flipPose(u) {
  const P = samplePoses([[0, POSE.ready], [0.17, POSE.crouch], [FLIP_TAKE, POSE.launch], [0.42, POSE.tuck], [0.62, POSE.tuck], [0.76, POSE.open], [0.86, POSE.land], [1, POSE.ready]], u);
  P.rot = [-TAU * ease.inOutCubic(clamp((u - 0.25) / (0.82 - 0.25))), 0, 0];
  P.zoff = -0.45 * smoothstep(0.27, 0.86, u);
  return P;
}

// 当前姿态下，脚底最低点相对根节点的高度（根节点放在 y=0 时）
const _v = new THREE.Vector3();
export function footMinY(h) {
  const y0 = h.position.y;
  h.position.y = 0;
  h.updateMatrixWorld(true);
  let m = Infinity;
  for (const L of ['L', 'R']) {
    const an = h.userData.J['ankle' + L];
    for (const p of [[0, -0.058, 0.147], [0, -0.058, -0.067]]) { _v.set(p[0], p[1], p[2]); an.localToWorld(_v); m = Math.min(m, _v.y); }
  }
  h.position.y = y0;
  return m;
}

// 把人形机器人摆到后空翻的第 u 个瞬间。x、z 是起跳点，floor 是地面高度，rise 是腾空时骨盆升高多少米
export function placeFlip(h, u, { x = 0, z = 0, floor = 0, rise = 1.4, yaw = 0 } = {}) {
  const cache = h.userData.flipCache || (h.userData.flipCache = {});
  const groundAt = (uu) => {
    const P = flipPose(uu);
    applyPose(h, { ...P, pos: [x, 0, z + P.zoff], rot: [P.rot[0], yaw, 0] });
    return -footMinY(h);
  };
  if (cache.take === undefined) { cache.take = groundAt(FLIP_TAKE); cache.land = groundAt(FLIP_LAND); }
  const P = flipPose(u);
  let y;
  if (u <= FLIP_TAKE || u >= FLIP_LAND) y = groundAt(u);
  else { const s = (u - FLIP_TAKE) / (FLIP_LAND - FLIP_TAKE); y = lerp(cache.take, cache.land, s) + 4 * rise * s * (1 - s); }
  applyPose(h, { ...P, pos: [x, floor + y, z + P.zoff], rot: [P.rot[0], yaw, 0] });
  return y;
}

// 站在地上：给一个姿态，自动把脚放到地面
export function placeOnGround(h, P, { x = 0, z = 0, floor = 0, yaw = 0 } = {}) {
  applyPose(h, { ...P, pos: [x, 0, z], rot: [P.rot ? P.rot[0] : 0, yaw + (P.rot ? P.rot[1] : 0), P.rot ? P.rot[2] : 0] });
  const y = -footMinY(h);
  h.position.y = floor + y;
  return y;
}

// 扭秧歌：t 秒；一拍 0.5 秒。手绢手在右边
export function yanggePose(t) {
  const b = (t / 0.5) * Math.PI; // 每拍半圈
  const step = Math.sin(b);
  const sway = Math.sin(b * 0.5);
  const P = {
    spine: [0.08, sway * 0.18, -sway * 0.08], neck: [0, -sway * 0.15, 0],
    hipL: [-0.3 - 0.35 * Math.max(0, step), 0, 0.08], kneeL: 0.45 + 0.55 * Math.max(0, step), ankleL: -0.15,
    hipR: [-0.3 - 0.35 * Math.max(0, -step), 0, -0.08], kneeR: 0.45 + 0.55 * Math.max(0, -step), ankleR: -0.15,
    shoulderL: [-0.9 - 0.5 * sway, 0.2, 0.9 + 0.35 * step], elbowL: -0.9 + 0.3 * step,
    shoulderR: [-1.0 + 0.5 * sway, -0.2, -0.95 + 0.35 * step], elbowR: -0.7 - 0.3 * step,
    handR: [0, Math.sin(b * 2) * 0.8, 0], handL: [0, -Math.sin(b * 2) * 0.6, 0],
  };
  P.pos = [Math.sin(b * 0.5) * 0.18, 0.66 + 0.03 * Math.abs(Math.sin(b)), 0];
  P.rot = [0, sway * 0.35, 0];
  return P;
}
