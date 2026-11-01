// 镜头共用：三维点投到屏幕、把模型“烘焙”成可拆散的零件、镜头工厂。
import * as THREE from 'three';
import { DW, DH } from '../core/engine.js';
import { clamp } from '../core/util.js';

const _v = new THREE.Vector3();
export function toScreen(v, camera) {
  _v.copy(v).project(camera);
  return { x: (_v.x + 1) / 2 * DW, y: (1 - _v.y) / 2 * DH, behind: _v.z > 1 };
}

// 把一个摆好姿势的模型拆成平铺的网格（各自带世界变换），给“炸开”用
export function bakeParts(obj) {
  obj.updateMatrixWorld(true);
  const parts = [];
  obj.traverse((o) => {
    if (!o.isMesh) return;
    const m = new THREE.Mesh(o.geometry, o.material);
    o.matrixWorld.decompose(m.position, m.quaternion, m.scale);
    m.castShadow = true;
    const c = new THREE.Vector3();
    o.geometry.computeBoundingBox();
    o.geometry.boundingBox.getCenter(c);
    m.userData.center = c.applyMatrix4(o.matrixWorld);
    m.userData.tag = o.userData.tag;
    m.userData.p0 = m.position.clone();
    m.userData.q0 = m.quaternion.clone();
    parts.push(m);
  });
  return parts;
}

// 镜头定义的小工厂：统一默认值
export function shot(def) {
  return Object.assign({ clear: 0x0d0f13, look: {}, baseGrade: {}, baseBloom: { strength: 0.55, radius: 0.5, threshold: 1.05 } }, def);
}

// 一个透视相机
export function cam(fov = 35) { return new THREE.PerspectiveCamera(fov, DW / DH, 0.05, 200); }

// 在 [a,b] 秒内的局部进度
export const seg = (lt, a, b) => clamp((lt - a) / (b - a));
