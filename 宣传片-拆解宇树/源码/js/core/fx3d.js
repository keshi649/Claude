// 三维里的特效零件：粒子、体积光束、冲击环、接触阴影、发光点、网格地面、灯光组。
import * as THREE from 'three';
import { rng, clamp } from './util.js';

// ---------- 粒子（加色混合的柔光点） ----------
const P_VERT = /* glsl */ `
attribute float size; attribute float alpha; attribute vec3 color;
varying float vA; varying vec3 vC;
uniform float scale;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = clamp(size * scale / max(-mv.z, 0.05), 1.0, 256.0);
  gl_Position = projectionMatrix * mv;
  vA = alpha; vC = color;
}`;
const P_FRAG = /* glsl */ `
varying float vA; varying vec3 vC;
uniform float intensity;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.0, d);
  a = a * a;
  gl_FragColor = vec4(vC * intensity, a * vA);
}`;

export class Particles {
  constructor(n, { intensity = 2, scale = 900 } = {}) {
    this.n = n;
    const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(n * 3);
    this.size = new Float32Array(n);
    this.alpha = new Float32Array(n);
    this.col = new Float32Array(n * 3).fill(1);
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('size', new THREE.BufferAttribute(this.size, 1));
    g.setAttribute('alpha', new THREE.BufferAttribute(this.alpha, 1));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    this.mat = new THREE.ShaderMaterial({
      vertexShader: P_VERT, fragmentShader: P_FRAG,
      uniforms: { scale: { value: scale }, intensity: { value: intensity } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.points = new THREE.Points(g, this.mat);
    this.points.frustumCulled = false;
    this.geo = g;
  }
  set(i, x, y, z, size, alpha, r = 1, gg = 1, b = 1) {
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.size[i] = size; this.alpha[i] = alpha;
    this.col[i * 3] = r; this.col[i * 3 + 1] = gg; this.col[i * 3 + 2] = b;
  }
  commit() {
    for (const k of ['position', 'size', 'alpha', 'color']) this.geo.attributes[k].needsUpdate = true;
  }
}

// 漂浮的尘埃：在一个盒子里缓慢漂移，位置只由 t 决定
export function dustField(n, box, seed = 1, { color = [1, 0.85, 0.7], size = [8, 22], alpha = [0.15, 0.55], speed = 0.05 } = {}) {
  const P = new Particles(n, { intensity: 1.6 });
  const R = rng(seed);
  const base = [];
  for (let i = 0; i < n; i++) base.push([R(), R(), R(), R(), R(), R()]);
  P.update = (t) => {
    for (let i = 0; i < n; i++) {
      const b = base[i];
      const x = box[0][0] + (box[1][0] - box[0][0]) * ((b[0] + t * speed * (b[3] - 0.5)) % 1 + 1) % 1;
      const y = box[0][1] + (box[1][1] - box[0][1]) * ((b[1] + t * speed * 0.6 * (b[4] + 0.2)) % 1 + 1) % 1;
      const z = box[0][2] + (box[1][2] - box[0][2]) * b[2];
      const tw = 0.6 + 0.4 * Math.sin(t * (1 + b[5] * 2) + b[3] * 20);
      P.set(i, x, y, z, size[0] + (size[1] - size[0]) * b[4], (alpha[0] + (alpha[1] - alpha[0]) * b[5]) * tw, ...color);
    }
    P.commit();
  };
  return P;
}

// ---------- 体积光束（锥形，加色，边缘和远端渐隐） ----------
const B_VERT = /* glsl */ `
varying vec3 vN; varying vec3 vV; varying float vY;
void main() {
  vY = -position.y; // 锥尖在原点，向 -y 张开
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const B_FRAG = /* glsl */ `
uniform vec3 color; uniform float intensity, len, time;
varying vec3 vN; varying vec3 vV; varying float vY;
void main() {
  float edge = pow(abs(dot(vN, vV)), 2.2);
  float along = smoothstep(0.0, 0.08 * len, vY) * (1.0 - smoothstep(0.35 * len, len, vY));
  float flick = 0.92 + 0.08 * sin(time * 9.0 + vY * 3.0);
  gl_FragColor = vec4(color * intensity * edge * along * flick, 1.0);
}`;
export function beam(color = 0xffd2a8, { len = 12, radius = 2.2, intensity = 0.35 } = {}) {
  const geo = new THREE.ConeGeometry(radius, len, 48, 1, true);
  geo.translate(0, -len / 2, 0); // 锥尖在原点
  const mat = new THREE.ShaderMaterial({
    vertexShader: B_VERT, fragmentShader: B_FRAG,
    uniforms: { color: { value: new THREE.Color(color) }, intensity: { value: intensity }, len: { value: len }, time: { value: 0 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  const m = new THREE.Mesh(geo, mat);
  m.frustumCulled = false;
  // 让锥朝向某个目标点
  m.aim = (from, to) => {
    m.position.copy(from);
    const d = new THREE.Vector3().subVectors(to, from).normalize();
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), d);
  };
  return m;
}

// ---------- 冲击环 ----------
export function shockRing(color = 0xffb37a) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { color: { value: new THREE.Color(color) }, k: { value: 0 }, intensity: { value: 2.5 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform vec3 color; uniform float k, intensity; varying vec2 vUv;
      void main(){ float r = length(vUv - 0.5) * 2.0; float w = mix(0.08, 0.02, k);
        float a = smoothstep(w, 0.0, abs(r - k)) * (1.0 - k);
        gl_FragColor = vec4(color * intensity, a); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  m.rotation.x = -Math.PI / 2;
  m.setK = (k, size) => { mat.uniforms.k.value = clamp(k); m.scale.set(size, size, size); m.visible = k > 0 && k < 1; };
  return m;
}

// ---------- 柔和的圆形贴图（接触阴影、发光点共用） ----------
let _radial = null;
export function radialTexture() {
  if (_radial) return _radial;
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  _radial = new THREE.CanvasTexture(c);
  return _radial;
}
export function contactShadow(size = 1, opacity = 0.6) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: radialTexture(), color: 0x000000, transparent: true, opacity, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.renderOrder = 1;
  return m;
}
export function glow(color = 0xff8a3d, size = 1, intensity = 3) {
  const c = new THREE.Color(color).multiplyScalar(intensity);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTexture(), color: c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  s.scale.set(size, size, 1);
  return s;
}

// ---------- 网格地面：远处渐隐的线网格 ----------
export function gridFloor({ size = 60, step = 1, color = 0x8a96a3, major = 5, intensity = 0.5, fade = 22, base = 0x0b0d11 } = {}) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { color: { value: new THREE.Color(color) }, base: { value: new THREE.Color(base) }, step: { value: step }, major: { value: major }, intensity: { value: intensity }, fade: { value: fade }, glowAt: { value: new THREE.Vector3(0, 0, 0) }, glowCol: { value: new THREE.Color(0xee6a1f) }, glowAmt: { value: 0 } },
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform vec3 color, base, glowAt, glowCol; uniform float step, major, intensity, fade, glowAmt; varying vec3 vW;
      float line(float x, float w){ float d = abs(fract(x - 0.5) - 0.5) / fwidth(x); return 1.0 - clamp(d / w, 0.0, 1.0); }
      void main(){
        vec2 p = vW.xz / step;
        float l = max(line(p.x, 1.0), line(p.y, 1.0)) * 0.5 + max(line(p.x / major, 1.4), line(p.y / major, 1.4));
        float d = length(vW.xz - glowAt.xz);
        float f = 1.0 - smoothstep(fade * 0.3, fade, length(vW.xz));
        vec3 c = base + color * l * intensity * f + glowCol * glowAmt * exp(-d * 0.7);
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  mat.extensions = { derivatives: true };
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
  m.rotation.x = -Math.PI / 2;
  m.receiveShadow = false;
  return m;
}

// ---------- 灯光组 ----------
export function studioLights(scene, { key = 0xfff1e0, keyI = 2.2, rim = 0xee6a1f, rimI = 3.5, cool = 0x7fd8ff, coolI = 1.4, amb = 0.25, shadow = false } = {}) {
  const g = new THREE.Group();
  const k = new THREE.DirectionalLight(key, keyI); k.position.set(3, 5, 4); g.add(k); g.add(k.target);
  if (shadow) {
    k.castShadow = true; k.shadow.mapSize.set(2048, 2048);
    const c = k.shadow.camera; c.left = -3; c.right = 3; c.top = 3; c.bottom = -3; c.near = 0.5; c.far = 20;
    k.shadow.bias = -0.0005; k.shadow.radius = 4;
  }
  const r = new THREE.DirectionalLight(rim, rimI); r.position.set(-4, 3, -4); g.add(r);
  const c2 = new THREE.DirectionalLight(cool, coolI); c2.position.set(4, 1.5, -3); g.add(c2);
  const h = new THREE.HemisphereLight(0x9fb4c8, 0x1a1410, amb); g.add(h);
  scene.add(g);
  g.key = k; g.rim = r; g.cool = c2; g.hemi = h;
  return g;
}

// 给一个场景装上环境贴图（金属反光）
export function withEnv(E, scene, intensity = 0.6) {
  scene.environment = E.envMap;
  scene.environmentIntensity = intensity;
  return scene;
}
