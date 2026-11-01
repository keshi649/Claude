// 片子里共用的材质。机器人是自己设计的通用造型：石墨色骨架、米白外壳、橙色关节。
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function makeMats() {
  const hdr = (c, k) => new THREE.Color(c).multiplyScalar(k);
  return {
    graphite: new THREE.MeshPhysicalMaterial({ color: 0x2b2f36, metalness: 0.7, roughness: 0.33, clearcoat: 0.5, clearcoatRoughness: 0.25 }),
    shell: new THREE.MeshPhysicalMaterial({ color: 0xbdb8ae, metalness: 0.12, roughness: 0.36, clearcoat: 0.8, clearcoatRoughness: 0.18 }),
    orange: new THREE.MeshPhysicalMaterial({ color: 0xee6a1f, metalness: 0.35, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.2, emissive: 0xee6a1f, emissiveIntensity: 0.1 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.88, metalness: 0 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x06070a, metalness: 0.3, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.03 }),
    glowO: new THREE.MeshBasicMaterial({ color: hdr(0xff7a2a, 6) }),
    glowC: new THREE.MeshBasicMaterial({ color: hdr(0x5ce1e6, 5) }),
    glowW: new THREE.MeshBasicMaterial({ color: hdr(0xfff1dc, 5) }),
    steel: new THREE.MeshStandardMaterial({ color: 0xaab2bb, metalness: 1, roughness: 0.2 }),
    alu: new THREE.MeshStandardMaterial({ color: 0x3a3f47, metalness: 0.85, roughness: 0.3 }),
    aluLight: new THREE.MeshStandardMaterial({ color: 0x8a929c, metalness: 0.9, roughness: 0.28 }),
    copper: new THREE.MeshStandardMaterial({ color: 0xc8793c, metalness: 1, roughness: 0.26, emissive: 0x6a2a08, emissiveIntensity: 0.25 }),
    magnetN: new THREE.MeshPhysicalMaterial({ color: 0xee6a1f, metalness: 0.5, roughness: 0.25, clearcoat: 0.8 }),
    magnetS: new THREE.MeshPhysicalMaterial({ color: 0x23272e, metalness: 0.8, roughness: 0.22, clearcoat: 0.8 }),
    pcb: new THREE.MeshStandardMaterial({ color: 0x0f3d2e, metalness: 0.2, roughness: 0.5 }),
  };
}

export const RB = (w, h, d, r = 0.02, seg = 3) => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4));
export const cyl = (r, h, axis = 'y', seg = 32, r2) => {
  const g = new THREE.CylinderGeometry(r, r2 ?? r, h, seg);
  if (axis === 'x') g.rotateZ(Math.PI / 2);
  if (axis === 'z') g.rotateX(Math.PI / 2);
  return g;
};
export const cap = (r, len) => new THREE.CapsuleGeometry(r, len, 6, 18);

export function mesh(geo, mat, parent, pos = [0, 0, 0], rot = [0, 0, 0]) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...pos);
  m.rotation.set(...rot);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
export function group(parent, pos = [0, 0, 0]) {
  const g = new THREE.Group();
  g.position.set(...pos);
  parent.add(g);
  return g;
}

// 把一个模型的所有网格换成同一种材质的克隆（做残影、剪影用）
export function cloneWithMaterial(obj, mat) {
  const c = obj.clone(true);
  c.traverse((o) => { if (o.isMesh) { o.material = mat; o.castShadow = false; o.receiveShadow = false; } });
  // 重新建立关节索引
  if (obj.userData.J) {
    const J = {};
    const names = Object.keys(obj.userData.J);
    for (const n of names) J[n] = c.getObjectByName(obj.userData.J[n].name);
    c.userData.J = J;
  }
  return c;
}
