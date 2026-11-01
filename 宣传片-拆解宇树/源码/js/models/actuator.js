// 一颗关节电机的六个零件，沿 x 轴排开（和书的封面同一个顺序）：
//   外壳 → 定子 → 转子 → 行星减速器 → 编码器 → 输出法兰
// explode=0 时装在一起，explode=1 时完全拆开。转子、齿轮会转。
import * as THREE from 'three';
import { RB, cyl, mesh, group } from './materials.js';
import { TAU } from '../core/util.js';

const polar = (r, a) => new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r);

// 齿轮外形（外齿）
function gearPath(rRoot, rTip, n, phase = 0) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (k) => phase + ((i + k) / n) * TAU;
    pts.push(polar(rRoot, a(0.0)), polar(rRoot, a(0.12)), polar(rTip, a(0.3)), polar(rTip, a(0.55)), polar(rRoot, a(0.73)));
  }
  return pts;
}
function gearGeo(rRoot, rTip, n, depth, holeR = 0, phase = 0) {
  const s = new THREE.Shape(gearPath(rRoot, rTip, n, phase));
  if (holeR > 0) { const h = new THREE.Path(); h.absarc(0, 0, holeR, 0, TAU, true); s.holes.push(h); }
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.005, bevelSegments: 2, curveSegments: 8 });
  g.translate(0, 0, -depth / 2);
  g.rotateY(Math.PI / 2); // 挤出方向 z → x
  return g;
}
// 内齿圈：外圆 + 带齿的孔
function ringGearGeo(rOut, rRoot, rTip, n, depth, phase = 0) {
  const s = new THREE.Shape(); s.absarc(0, 0, rOut, 0, TAU, false);
  const hole = new THREE.Path(gearPath(rRoot, rTip, n, phase).reverse());
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.005, bevelSegments: 2, curveSegments: 48 });
  g.translate(0, 0, -depth / 2);
  g.rotateY(Math.PI / 2);
  return g;
}
// 绕 x 轴的回转体：profile 是 [r, x] 点列
function lathe(profile, seg = 96) {
  const g = new THREE.LatheGeometry(profile.map(([r, x]) => new THREE.Vector2(r, x)), seg);
  g.rotateZ(-Math.PI / 2); // 回转轴 y → x
  return g;
}

// 一圈色环（空心），厚 w，沿 x
function band(rIn, rOut, w) { return lathe([[rIn, -w / 2], [rOut, -w / 2], [rOut, w / 2], [rIn, w / 2]], 96); }

// 编码器码盘贴图
function encoderTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d');
  x.fillStyle = '#1b1f25'; x.fillRect(0, 0, 512, 512);
  x.translate(256, 256);
  for (let ring = 0; ring < 3; ring++) {
    const n = [64, 32, 16][ring], r0 = [200, 160, 125][ring], r1 = [235, 195, 155][ring];
    for (let i = 0; i < n; i++) {
      if (i % 2) continue;
      const a0 = (i / n) * TAU, a1 = ((i + 1) / n) * TAU;
      x.beginPath(); x.arc(0, 0, r1, a0, a1); x.arc(0, 0, r0, a1, a0, true); x.closePath();
      x.fillStyle = ring === 0 ? '#e9e4da' : '#9aa3ad'; x.fill();
    }
  }
  x.beginPath(); x.arc(0, 0, 70, 0, TAU); x.fillStyle = '#2b2f36'; x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

export const PART_NAMES = ['外壳', '定子', '转子', '行星减速器', '编码器', '输出法兰'];

export function buildActuator(M) {
  const root = new THREE.Group();
  const parts = [];
  const P = () => { const g = group(root); parts.push(g); return g; };

  // 1 外壳：一个带散热筋的杯子，后面封口，前面开口
  const housing = P();
  mesh(lathe([[0.0, -0.2], [0.5, -0.2], [0.53, -0.17], [0.53, 0.16], [0.5, 0.18], [0.47, 0.18], [0.47, -0.16], [0.0, -0.16]]), M.alu, housing);
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * TAU;
    mesh(RB(0.3, 0.045, 0.03, 0.01), M.alu, housing, [0, Math.cos(a) * 0.545, Math.sin(a) * 0.545], [a, 0, 0]);
  }
  mesh(band(0.525, 0.545, 0.03), M.orange, housing, [0.12, 0, 0]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + 0.3;
    mesh(cyl(0.025, 0.02, 'x', 16), M.steel, housing, [-0.205, Math.cos(a) * 0.38, Math.sin(a) * 0.38]);
  }
  mesh(cyl(0.07, 0.03, 'x'), M.steel, housing, [-0.21, 0, 0]);

  // 2 定子：铁芯圆环 + 向内的齿 + 铜线圈
  const stator = P();
  mesh(lathe([[0.31, -0.09], [0.45, -0.09], [0.45, 0.09], [0.31, 0.09]]), M.aluLight, stator);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    const tooth = mesh(RB(0.17, 0.09, 0.05, 0.008), M.aluLight, stator, [0, Math.cos(a) * 0.27, Math.sin(a) * 0.27], [a, 0, 0]);
    tooth.rotation.set(a, 0, 0);
    mesh(RB(0.2, 0.06, 0.085, 0.02), M.copper, stator, [0, Math.cos(a) * 0.275, Math.sin(a) * 0.275], [a, 0, 0]);
  }

  // 3 转子：钢心 + 一圈 N/S 交替的磁钢 + 轴
  const rotor = P();
  const rotorSpin = group(rotor);
  mesh(cyl(0.2, 0.16, 'x', 64), M.steel, rotorSpin);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU;
    mesh(RB(0.16, 0.035, 0.11, 0.008), i % 2 ? M.magnetS : M.magnetN, rotorSpin, [0, Math.cos(a) * 0.205, Math.sin(a) * 0.205], [a, 0, 0]);
  }
  mesh(cyl(0.045, 0.62, 'x', 24), M.steel, rotorSpin);

  // 4 行星减速器：模数 0.016，太阳轮 12 齿、行星轮 15 齿、内齿圈 42 齿（42 = 12 + 2×15），
  //   三个行星轮均布要求 (12 + 42) / 3 为整数。初始相位按啮合算好，转速按无滑动滚动算，齿不会互相穿过去。
  const gear = P();
  mesh(ringGearGeo(0.46, 0.356, 0.32, 42, 0.13, 0.086), M.aluLight, gear);
  mesh(band(0.43, 0.47, 0.02), M.orange, gear, [0.07, 0, 0]);
  const sun = group(gear);
  mesh(gearGeo(0.076, 0.112, 12, 0.13, 0.03, 0.301), M.steel, sun);
  const planets = [];
  const carrier = group(gear);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU;
    const pg = group(carrier, [0, Math.cos(a) * 0.216, Math.sin(a) * 0.216]);
    mesh(gearGeo(0.1, 0.136, 15, 0.12, 0.02), M.steel, pg);
    planets.push(pg);
  }
  mesh(cyl(0.29, 0.025, 'x', 64), M.alu, carrier, [-0.08, 0, 0]);

  // 5 编码器：码盘 + 一小块电路板 + 一颗亮着的读头
  const enc = P();
  const disk = group(enc);
  const dm = new THREE.MeshStandardMaterial({ map: encoderTexture(), metalness: 0.6, roughness: 0.3 });
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.26, 96).rotateY(Math.PI / 2), dm); disk.add(face); face.position.x = 0.012;
  mesh(cyl(0.26, 0.022, 'x', 96), M.alu, disk);
  mesh(RB(0.02, 0.16, 0.26, 0.006), M.pcb, enc, [-0.05, -0.3, 0]);
  mesh(RB(0.025, 0.06, 0.06, 0.004), M.graphite, enc, [-0.04, -0.28, 0.05]);
  mesh(new THREE.SphereGeometry(0.018, 16, 12), M.glowC, enc, [-0.03, -0.24, -0.06]);

  // 6 输出法兰：大圆盘 + 轮毂 + 六个螺孔
  const flange = P();
  mesh(lathe([[0.06, -0.03], [0.4, -0.03], [0.42, -0.01], [0.42, 0.01], [0.4, 0.03], [0.17, 0.03], [0.16, 0.11], [0.06, 0.11]]), M.aluLight, flange);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    mesh(cyl(0.032, 0.065, 'x', 20), M.graphite, flange, [0, Math.cos(a) * 0.3, Math.sin(a) * 0.3]);
  }
  mesh(band(0.405, 0.43, 0.014), M.orange, flange, [0, 0, 0]);

  // 装配位置（explode=0）和拆开位置（explode=1）
  const assembled = [0, 0, 0, 0.27, -0.23, 0.36];
  const exploded = [0, 0.75, 1.45, 2.2, 2.9, 3.55];
  const api = {
    root, parts, rotorSpin, sun, carrier, planets, disk,
    names: PART_NAMES,
    layout(explode, t = 0, { wobble = 0 } = {}) {
      parts.forEach((p, i) => {
        const e = Math.max(0, Math.min(1, explode));
        p.position.x = assembled[i] + (exploded[i] - assembled[i]) * e;
        p.rotation.x = wobble * Math.sin(t * 1.3 + i) * 0.15 * e;
      });
    },
    // 转动：太阳轮跟转子一起转；齿圈不动时行星架转速是太阳轮的 12/54，行星轮相对行星架反转 12/15
    spin(angle) {
      rotorSpin.rotation.x = angle;
      sun.rotation.x = angle;
      const carrierA = angle * 12 / 54;
      carrier.rotation.x = carrierA;
      for (const pg of planets) pg.rotation.x = 0.136 - (angle - carrierA) * 12 / 15;
      disk.rotation.x = angle;
      flange.rotation.x = carrierA;
    },
    // 每个零件的标注锚点（零件上方）
    anchor(i) { const v = new THREE.Vector3(0, [0.56, 0.47, 0.25, 0.48, 0.28, 0.44][i], 0); parts[i].localToWorld(v); return v; },
  };
  return api;
}
