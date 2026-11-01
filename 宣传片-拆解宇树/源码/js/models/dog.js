// 四足机器狗：自己设计的通用造型。根节点在机身中心，面朝 +x，左侧在 +z。
// 腿：髋外展（绕 x）→ 大腿俯仰（绕 z，正值往前摆）→ 膝（绕 z，正值让小腿往前收）。四条腿的膝盖都朝后。
import * as THREE from 'three';
import { RB, cyl, cap, mesh, group } from './materials.js';
import { TAU, clamp } from '../core/util.js';

export const LEGS = ['FL', 'FR', 'RL', 'RR'];
export const THIGH = 0.22, SHIN = 0.215;

export function buildDog(M, { ghost = null } = {}) {
  const root = new THREE.Group();
  root.name = 'D_root';
  const J = { root };
  const m = (geo, mat, parent, pos, rot) => mesh(geo, ghost || mat, parent, pos, rot);
  m(RB(0.6, 0.14, 0.25, 0.05), M.graphite, root);
  m(RB(0.46, 0.035, 0.2, 0.016), M.shell, root, [-0.02, 0.083, 0]);
  m(RB(0.3, 0.012, 0.006, 0.004), M.orange, root, [-0.02, 0.02, 0.127]);
  m(RB(0.3, 0.012, 0.006, 0.004), M.orange, root, [-0.02, 0.02, -0.127]);
  m(RB(0.08, 0.02, 0.12, 0.008), M.graphite, root, [-0.1, 0.105, 0]); // 背上的扣板
  // 头
  const head = group(root, [0.33, 0.015, 0]); head.name = 'D_head'; J.head = head;
  m(RB(0.12, 0.12, 0.22, 0.045), M.shell, head);
  m(RB(0.02, 0.075, 0.17, 0.01), M.glass, head, [0.056, 0.005, 0]);
  m(new THREE.SphereGeometry(0.013, 16, 12), M.glowC, head, [0.068, 0.014, 0.045]);
  m(new THREE.SphereGeometry(0.013, 16, 12), M.glowC, head, [0.068, 0.014, -0.045]);
  m(cyl(0.018, 0.02, 'x'), M.graphite, head, [0.06, -0.045, 0]);
  // 激光雷达
  m(cyl(0.045, 0.04), M.glass, root, [0.22, 0.11, 0]);
  m(new THREE.TorusGeometry(0.046, 0.005, 8, 40).rotateX(Math.PI / 2), M.glowO, root, [0.22, 0.112, 0]);
  for (const leg of LEGS) {
    const fx = leg[0] === 'F' ? 1 : -1, sz = leg[1] === 'L' ? 1 : -1;
    const hip = group(root, [0.215 * fx, -0.005, 0.105 * sz]); hip.name = 'D_hip' + leg; J['hip' + leg] = hip;
    m(cyl(0.044, 0.075, 'x'), M.graphite, hip);
    m(cyl(0.046, 0.012, 'x'), M.orange, hip, [0.04 * fx, 0, 0]);
    const th = group(hip, [0, 0, 0.055 * sz]); th.name = 'D_thigh' + leg; J['thigh' + leg] = th;
    m(cyl(0.048, 0.05, 'z'), M.graphite, th);
    m(cyl(0.05, 0.01, 'z'), M.orange, th, [0, 0, 0.028 * sz]);
    m(RB(0.055, THIGH + 0.02, 0.042, 0.018), M.graphite, th, [0, -THIGH / 2, 0]);
    m(RB(0.04, THIGH * 0.7, 0.01, 0.005), M.shell, th, [0, -THIGH / 2, 0.024 * sz]);
    const kn = group(th, [0, -THIGH, 0]); kn.name = 'D_knee' + leg; J['knee' + leg] = kn;
    m(cyl(0.026, 0.045, 'z'), M.graphite, kn);
    m(cap(0.017, SHIN - 0.04), M.graphite, kn, [0, -SHIN / 2 + 0.01, 0]);
    m(new THREE.SphereGeometry(0.026, 18, 14), M.rubber, kn, [0, -SHIN, 0]);
  }
  root.userData.J = J;
  return root;
}

// 站姿：大腿往后 0.72、膝盖 1.44，脚正好在髋下面
export const STAND = { thigh: -0.72, knee: 1.44 };

export function standHeight(thigh = STAND.thigh, knee = STAND.knee) {
  return THIGH * Math.cos(thigh) + SHIN * Math.cos(thigh + knee) + 0.026 + 0.005;
}

// 设定四条腿的角度：legs = { FL: [abd, thigh, knee], ... }
export function poseDog(d, { pos, rot, legs, head = 0 }) {
  const J = d.userData.J;
  if (pos) d.position.set(...pos);
  if (rot) d.rotation.set(...rot);
  for (const leg of LEGS) {
    const v = legs[leg] || [0, STAND.thigh, STAND.knee];
    J['hip' + leg].rotation.set(v[0], 0, 0);
    J['thigh' + leg].rotation.set(0, 0, v[1]);
    J['knee' + leg].rotation.set(0, 0, v[2]);
  }
  J.head.rotation.set(0, 0, head);
}

// 小跑步态：对角线两条腿同相。t 秒，freq 每秒步数周期，返回 legs 和机身起伏
export function trot(t, { freq = 2.2, stride = 0.32, lift = 0.55, phase = 0 } = {}) {
  const legs = {};
  const off = { FL: 0, RR: 0, FR: Math.PI, RL: Math.PI };
  let bob = 0;
  for (const leg of LEGS) {
    const ph = TAU * freq * t + off[leg] + phase;
    const sw = Math.cos(ph); // >0：这条腿在空中往前摆
    const th = STAND.thigh + stride * Math.sin(ph);
    const kn = STAND.knee + lift * Math.max(0, sw) * (0.6 + 0.4 * Math.max(0, Math.sin(ph)));
    legs[leg] = [0, th, kn];
    bob += Math.max(0, -sw);
  }
  return { legs, bob: 0.012 * Math.sin(TAU * freq * 2 * t + phase) };
}

// 摔倒乱蹬：每条腿随机乱动（由 seed 决定）
export function flail(t, seed) {
  const legs = {};
  LEGS.forEach((leg, i) => {
    const a = seed * 13.7 + i * 2.1;
    legs[leg] = [0.3 * Math.sin(t * 7 + a), -0.4 + 1.1 * Math.sin(t * 9.3 + a * 1.7), 0.8 + 0.7 * Math.sin(t * 11.1 + a * 0.6)];
  });
  return legs;
}
