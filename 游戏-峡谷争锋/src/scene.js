'use strict';
/* scene.js：三维地图（开局建一次）。
   地面：一张大平面，片元里按“控制图”混合草地、石板路、基地地砖、沙土四种贴图（贴图都是开局用画布画的），再乘一层烘焙的树影。
   河：沿 y = x 的一条，河床往下凹，上面一层会动的水面；两个龙坑是河中间的圆形石台。
   墙：长草的石崖（按墙的形状挤出来，边上加噪声），上面种树；地图四周一圈石崖 + 两排树 + 远处一片起伏的树冠。
   草丛：一簇簇草叶，会随风摆；玩家站进去时这一丛变半透明。
   坐标：游戏里的 (x, y) → three 的 (x, 高度, y)；镜头在南边（+z）往北看，蓝方基地在左下。 */

const RIVER_W = 175;                        // 河道半宽（中线 y = x）
const PITS = DRAGONS.map(d => d.p);         // 龙坑
const PIT_R = 250;
const CLIFF_H = 62;                         // 石崖高
const SPRING_VIS = [250, 4750], SPRING_VR = 320;   // 泉水台子画在这儿（回血的范围还是按 SPRING 算），四周的石崖让出半径 SPRING_VR 的圆
const SUN = new THREE.Vector3(-0.42, 1, 0.3).normalize();   // 太阳方向（从地面指向太阳）：影子往右上落
const S3 = { r: null, scene: null, cam: null, sun: null, hemi: null, w: 1, h: 1, dpr: 1, bushes: [], bushMats: [], groundMat: null, water: null,
  t: 0, shadows: true, camDist: 1500, uWind: { value: 0 } };

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function smooth01(a, b, x) { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); }
function hash2(x, y) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y) { return vnoise(x, y) * 0.55 + vnoise(x * 2.1 + 7, y * 2.1 + 3) * 0.3 + vnoise(x * 4.3 + 1, y * 4.3 + 9) * 0.15; }
function prng(seed) {
  let a = seed | 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function mkc(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

/* ---------- 地面高度：河床往下凹，龙坑是平的 ---------- */
function groundH(x, y) {
  const d = Math.abs(x - y) * Math.SQRT1_2;
  if (d > RIVER_W + 30) return 0;
  let k = smooth01(RIVER_W + 30, RIVER_W - 80, d);
  for (const p of PITS) { const dd = Math.hypot(x - p[0], y - p[1]); if (dd < PIT_R + 70) k *= smooth01(PIT_R, PIT_R + 70, dd); }
  return -30 * k;
}

/* ---------- 贴图（能平铺） ---------- */
// 在 N×N 的平铺图上画一个东西：靠边的在对边再画一次
function wrapDraw(N, x, y, r, fn) {
  for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) {
    const px = x + ox, py = y + oy;
    if (px + r < 0 || py + r < 0 || px - r > N || py - r > N) continue;
    fn(px, py);
  }
}
function texFrom(c, rep) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = rep ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  t.anisotropy = 4;
  return t;
}
function texGrass() {
  const N = 512, c = mkc(N, N), g = c.getContext('2d'), R = prng(11);
  g.fillStyle = '#74B04A'; g.fillRect(0, 0, N, N);
  for (let i = 0; i < 70; i++) {
    const x = R() * N, y = R() * N, r = 25 + R() * 70, col = R() < 0.55 ? 'rgba(70,128,46,0.28)' : 'rgba(160,206,96,0.24)';
    wrapDraw(N, x, y, r, (px, py) => { const gr = g.createRadialGradient(px, py, 0, px, py, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(px - r, py - r, 2 * r, 2 * r); });
  }
  const cols = ['#5E9A3A', '#82BE55', '#93CC63', '#57903A', '#6FAE48', '#A2D46E'];
  g.lineCap = 'round';
  for (let i = 0; i < 14000; i++) {
    const x = R() * N, y = R() * N, l = 3 + R() * 6, a = -Math.PI / 2 + (R() - 0.5) * 1.1;
    g.strokeStyle = cols[(R() * cols.length) | 0]; g.lineWidth = 1 + R() * 0.8;
    wrapDraw(N, x, y, l, (px, py) => { g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); g.stroke(); });
  }
  for (let i = 0; i < 40; i++) {                 // 小花
    const x = R() * N, y = R() * N, col = ['#FFF4C8', '#FFD86A', '#F7A8C8', '#FFFFFF'][(R() * 4) | 0];
    wrapDraw(N, x, y, 4, (px, py) => { g.fillStyle = col; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(px + Math.cos(k * 1.57) * 1.6, py + Math.sin(k * 1.57) * 1.6, 1.3, 0, 7); g.fill(); } g.fillStyle = '#E8A030'; g.fillRect(px - 0.7, py - 0.7, 1.4, 1.4); });
  }
  return texFrom(c, true);
}
// 石板（沃罗诺伊）：每格一块石头，石头之间是缝
function voronoiTex(N, cells, seed, palette, opt) {
  const c = mkc(N, N), g = c.getContext('2d'), R = prng(seed), im = g.createImageData(N, N), D = im.data;
  const cs = N / cells, pts = [];
  for (let j = 0; j < cells; j++) for (let i = 0; i < cells; i++) {
    const jit = opt.jitter == null ? 0.8 : opt.jitter;
    pts.push([(i + 0.5 + (R() - 0.5) * jit) * cs, (j + 0.5 + (R() - 0.5) * jit) * cs, palette[(R() * palette.length) | 0], 0.88 + R() * 0.24]);
  }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const ci = Math.floor(x / cs), cj = Math.floor(y / cs);
    let d1 = 1e9, d2 = 1e9, best = null, bx = 0, by = 0;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      let ii = ci + di, jj = cj + dj, ox = 0, oy = 0;
      if (ii < 0) { ii += cells; ox = -N; } else if (ii >= cells) { ii -= cells; ox = N; }
      if (jj < 0) { jj += cells; oy = -N; } else if (jj >= cells) { jj -= cells; oy = N; }
      const p = pts[jj * cells + ii], px = p[0] + ox, py = p[1] + oy;
      const d = opt.square ? Math.max(Math.abs(px - x), Math.abs(py - y)) : Math.hypot(px - x, py - y);
      if (d < d1) { d2 = d1; d1 = d; best = p; bx = px; by = py; } else if (d < d2) d2 = d;
    }
    const edge = d2 - d1;                       // 离缝多远
    const k = (y * N + x) * 4;
    const col = best[2], sh = best[3];
    const gap = opt.gap || 2.2;
    let f = edge < gap ? 0.55 : edge < gap + 2 ? 0.8 : 1;
    // 每块石头左上亮、右下暗，看着有点立体
    const lx = (x - bx) / cs, ly = (y - by) / cs;
    f *= 1 - 0.18 * (lx + ly) * (edge > gap ? 1 : 0);
    const n = 0.92 + 0.16 * hash2(x * 7 + seed, y * 13);
    D[k] = Math.min(255, col[0] * sh * f * n); D[k + 1] = Math.min(255, col[1] * sh * f * n); D[k + 2] = Math.min(255, col[2] * sh * f * n); D[k + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  return c;
}
function texStone() {
  const c = voronoiTex(256, 9, 21, [[184, 170, 144], [170, 158, 134], [192, 180, 156], [160, 150, 132], [178, 164, 132]], { gap: 2.4 });
  return texFrom(c, true);
}
function texPlaza() {
  const c = voronoiTex(256, 4, 33, [[150, 150, 152], [140, 140, 144], [160, 158, 156]], { square: true, jitter: 0, gap: 2 });
  const g = c.getContext('2d');
  g.strokeStyle = 'rgba(120,110,95,0.35)'; g.lineWidth = 2;   // 地砖上的花纹
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { if ((i + j) % 2) continue; g.beginPath(); g.arc(i * 64 + 32, j * 64 + 32, 16, 0, 7); g.stroke(); }
  return texFrom(c, true);
}
function texSand() {
  const N = 256, c = mkc(N, N), g = c.getContext('2d'), R = prng(44);
  g.fillStyle = '#C9B48A'; g.fillRect(0, 0, N, N);
  for (let i = 0; i < 3000; i++) { const x = R() * N, y = R() * N; g.fillStyle = R() < 0.5 ? 'rgba(150,128,90,0.35)' : 'rgba(230,214,176,0.35)'; g.fillRect(x, y, 1.5, 1.5); }
  for (let i = 0; i < 70; i++) {
    const x = R() * N, y = R() * N, r = 1.5 + R() * 3.5;
    wrapDraw(N, x, y, r, (px, py) => { g.fillStyle = ['#9A8A70', '#B8A888', '#8A7A62'][(R() * 3) | 0]; g.beginPath(); g.ellipse(px, py, r, r * 0.75, R() * 3, 0, 7); g.fill(); });
  }
  return texFrom(c, true);
}
function texNoise() {
  const N = 128, c = mkc(N, N), g = c.getContext('2d'), im = g.createImageData(N, N), D = im.data;
  const P = 8;                                  // 周期：能平铺
  const per = (x, y) => { const a = (n, m) => hash2(((n % P) + P) % P, ((m % P) + P) % P); const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return a(xi, yi) * (1 - u) * (1 - v) + a(xi + 1, yi) * u * (1 - v) + a(xi, yi + 1) * (1 - u) * v + a(xi + 1, yi + 1) * u * v; };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const v = per(x / N * P, y / N * P) * 0.65 + per(x / N * P * 2 + 0.5, y / N * P * 2 + 0.5) * 0.35;
    const k = (y * N + x) * 4; D[k] = D[k + 1] = D[k + 2] = v * 255; D[k + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  return texFrom(c, true);
}

/* ---------- 控制图：R 石板路、G 基地地砖、B 沙土；另一张是烘焙的树影 ---------- */
const CTL_N = 1024, CTL_S = CTL_N / L;
function blurRGB(im, N, rad) {
  const D = im.data, tmp = new Float32Array(N * N * 3);
  for (let pass = 0; pass < 2; pass++) {
    for (let a = 0; a < N; a++) {
      for (let ch = 0; ch < 3; ch++) {
        let s = 0, n = 0;
        const get = b => (pass === 0 ? D[(a * N + b) * 4 + ch] : tmp[(b * N + a) * 3 + ch]);
        for (let b = -rad; b <= rad; b++) { if (b >= 0 && b < N) { s += get(b); n++; } }
        for (let b = 0; b < N; b++) {
          const v = s / n;
          if (pass === 0) tmp[(a * N + b) * 3 + ch] = v; else D[(b * N + a) * 4 + ch] = v;
          const o = b - rad, i = b + rad + 1;
          if (o >= 0) { s -= get(o); n--; }
          if (i < N) { s += get(i); n++; }
        }
      }
    }
  }
}
function strokeShape(g, s, pad) {
  g.beginPath();
  if (s.c) g.arc(s.c[0] * CTL_S, s.c[1] * CTL_S, (s.c[2] + pad) * CTL_S, 0, 7);
  else { g.lineCap = 'round'; g.lineWidth = (s.k[4] + pad) * 2 * CTL_S; g.moveTo(s.k[0] * CTL_S, s.k[1] * CTL_S); g.lineTo(s.k[2] * CTL_S, s.k[3] * CTL_S); }
  if (s.c) g.fill(); else g.stroke();
}
function buildControl() {
  const N = CTL_N, c = mkc(N, N), g = c.getContext('2d'), s = CTL_S;
  g.fillStyle = '#000'; g.fillRect(0, 0, N, N);
  g.globalCompositeOperation = 'lighter';
  // 沙土：河床、河岸、野怪窝
  g.strokeStyle = 'rgb(0,0,255)'; g.lineCap = 'butt'; g.lineWidth = (RIVER_W + 42) * 2 * s;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(N, N); g.stroke();
  g.fillStyle = 'rgb(0,0,150)';
  for (const side of [0, 1]) for (const cp of CAMPS_BLUE) { const p = side ? mir(cp.p) : cp.p; g.beginPath(); g.arc(p[0] * s, p[1] * s, 125 * s, 0, 7); g.fill(); }
  // 石板路
  g.strokeStyle = 'rgb(255,0,0)'; g.lineJoin = 'round'; g.lineCap = 'round';
  LANES.forEach((ln, i) => {
    g.lineWidth = (i === 1 ? 250 : 236) * s;
    g.beginPath(); ln.forEach((p, k) => (k ? g.lineTo(p[0] * s, p[1] * s) : g.moveTo(p[0] * s, p[1] * s))); g.stroke();
  });
  // 基地地砖、泉水、龙坑
  g.fillStyle = 'rgb(0,255,0)';
  for (const team of [0, 1]) {
    const f = team ? mir : p => p;
    const sp = f(SPRING_VIS), cr = f(CRYSTAL);
    g.beginPath(); g.arc(sp[0] * s, sp[1] * s, 420 * s, 0, 7); g.fill();
    g.beginPath(); g.arc(cr[0] * s, cr[1] * s, 330 * s, 0, 7); g.fill();
  }
  g.fillStyle = 'rgb(255,0,0)';
  for (const p of PITS) { g.beginPath(); g.arc(p[0] * s, p[1] * s, PIT_R * s, 0, 7); g.fill(); }
  g.globalCompositeOperation = 'source-over';
  const im = g.getImageData(0, 0, N, N);
  blurRGB(im, N, 2);
  g.putImageData(im, 0, 0);
  const t = texFrom(c, false);
  t.anisotropy = 1; t.flipY = false;
  return t;
}
// 树影、崖影：往影子落的方向偏一点，糊开
function buildShade(trees) {
  const N = 1024, c = mkc(N, N), g = c.getContext('2d'), s = N / L;
  g.fillStyle = '#fff'; g.fillRect(0, 0, N, N);
  const ox = -SUN.x / SUN.y, oy = -SUN.z / SUN.y;
  g.fillStyle = 'rgba(0,0,0,0.30)';
  for (const sh of WALLS) {
    const h = CLIFF_H * 0.9;
    const off = sh.c ? { c: [sh.c[0] + ox * h, sh.c[1] + oy * h, sh.c[2]] } : { k: [sh.k[0] + ox * h, sh.k[1] + oy * h, sh.k[2] + ox * h, sh.k[3] + oy * h, sh.k[4]] };
    g.strokeStyle = 'rgba(0,0,0,0.30)';
    strokeShape(g, off, 10);
  }
  for (const tr of trees) {
    const h = tr.y + tr.h * 0.65;
    const x = (tr.x + ox * h) * s, y = (tr.z + oy * h) * s, r = tr.r * 1.05 * s;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(0,0,0,0.42)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const t = texFrom(c, false);
  t.anisotropy = 1; t.flipY = false;
  return t;
}

/* ---------- 地面材质 ---------- */
function groundMaterial(tex) {
  const m = new THREE.MeshLambertMaterial({ color: '#ffffff' });
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, { tCtl: { value: tex.ctl }, tShade: { value: tex.shade }, tGrass: { value: tex.grass }, tStone: { value: tex.stone },
      tPlaza: { value: tex.plaza }, tSand: { value: tex.sand }, tNoise: { value: tex.noise } });
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
varying vec3 vWP;
uniform sampler2D tCtl, tShade, tGrass, tStone, tPlaza, tSand, tNoise;`)
      .replace('#include <map_fragment>', `
vec2 wp = vWP.xz;
vec2 cuv = wp / ${L.toFixed(1)};
vec3 ctl = texture2D(tCtl, cuv).rgb;
float shade = texture2D(tShade, cuv).r;
float nz = texture2D(tNoise, wp / 1700.0).r;
float nz2 = texture2D(tNoise, wp / 330.0 + 0.37).r;
vec3 grass = texture2D(tGrass, wp / 430.0).rgb * (0.82 + 0.36 * nz);
grass = mix(grass, grass * vec3(0.92, 1.04, 0.86), smoothstep(0.55, 0.75, nz2));
vec3 stone = mix(texture2D(tStone, wp / 230.0).rgb, vec3(0.8, 0.76, 0.66), 0.22);
vec3 plaza = texture2D(tPlaza, wp / 360.0).rgb;
float side = clamp((wp.y - wp.x) / 900.0, -1.0, 1.0);          // 蓝方那半边 > 0
plaza *= mix(vec3(1.06, 0.96, 0.92), vec3(0.92, 0.98, 1.08), side * 0.5 + 0.5);
vec3 sand = texture2D(tSand, wp / 380.0).rgb;
vec3 c = grass;
float kb = smoothstep(0.32, 0.62, ctl.b + (nz2 - 0.5) * 0.35);
c = mix(c, sand, kb);
float kr = smoothstep(0.38, 0.6, ctl.r + (nz2 - 0.5) * 0.3);
c = mix(c, stone, kr);
float kg = smoothstep(0.4, 0.6, ctl.g);
c = mix(c, plaza, kg);
// 地图外：深一点的林地
float out1 = max(max(${BORDER}.0 - wp.x, wp.x - ${L - BORDER}.0), max(${BORDER}.0 - wp.y, wp.y - ${L - BORDER}.0));
c *= 1.0 - 0.35 * smoothstep(-40.0, 160.0, out1);
c *= mix(0.6, 1.0, shade);
diffuseColor.rgb *= c;`);
  };
  return m;
}

/* ---------- 树、石头（合并成一块静态几何，按区块切开好让镜头裁掉看不见的） ---------- */
function treeParts(kind, R) {
  // 返回 [几何, 颜色] 的列表（未变换）
  const out = [];
  const trunkC = new THREE.Color(R() < 0.5 ? '#7A5232' : '#6A4628');
  if (kind === 'pine') {
    const tg = new THREE.CylinderGeometry(4, 6, 34, 6); tg.translate(0, 17, 0); out.push([tg, trunkC]);
    const greens = ['#2E7A45', '#3B8E50', '#24683A'];
    for (let i = 0; i < 3; i++) {
      const cg = new THREE.ConeGeometry(34 - i * 8, 46 - i * 6, 7); cg.translate(0, 40 + i * 24, 0);
      out.push([cg, new THREE.Color(greens[i]).offsetHSL((R() - 0.5) * 0.03, 0, (R() - 0.5) * 0.06)]);
    }
  } else {
    const tg = new THREE.CylinderGeometry(5, 7.5, 44, 6); tg.translate(0, 22, 0); out.push([tg, trunkC]);
    const greens = ['#3F9440', '#56AE48', '#2F7E38', '#6ABF55'];
    const blobs = [[0, 66, 0, 34], [-20, 54, 8, 24], [20, 56, -6, 25], [4, 86, -4, 24]];
    for (const [x, y, z, r] of blobs) {
      const s = r * (0.85 + R() * 0.3);
      const bg = blobGeo(s, r > 30 ? 1 : 0); bg.translate(x, y, z);
      out.push([bg, new THREE.Color(greens[(R() * greens.length) | 0]).offsetHSL((R() - 0.5) * 0.04, 0, (R() - 0.5) * 0.08)]);
    }
  }
  return out;
}
// 圆团（树冠）：二十面体，法线按球面算，看着圆一些
function blobGeo(r, detail) {
  const g = new THREE.IcosahedronGeometry(r, detail), p = g.attributes.position, n = g.attributes.normal;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), l = Math.hypot(x, y, z) || 1; n.setXYZ(i, x / l, y / l, z / l); }
  return g;
}
function rockParts(R) {
  const g = new THREE.DodecahedronGeometry(1, 0);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setXYZ(i, pos.getX(i) * (0.8 + R() * 0.4), pos.getY(i) * (0.6 + R() * 0.3), pos.getZ(i) * (0.8 + R() * 0.4));
  return [[g, new THREE.Color(['#8C8A84', '#9E9A90', '#7E7A72'][(R() * 3) | 0])]];
}
// 一批 [几何, 颜色, 矩阵] 合成一个网格（顶点色）
function mergeParts(list) {
  let n = 0;
  const gs = list.map(([g, c, m]) => { const q = g.index ? g.toNonIndexed() : g.clone(); q.applyMatrix4(m); n += q.attributes.position.count; return [q, c]; });
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3);
  let o = 0;
  for (const [q, c] of gs) {
    if (!q.attributes.normal) q.computeVertexNormals();
    const k = q.attributes.position.count, cc = q.attributes.color;
    pos.set(q.attributes.position.array, o * 3); nor.set(q.attributes.normal.array, o * 3);
    for (let i = 0; i < k; i++) {
      // 顶点色：上面亮一点、下面暗一点
      const y = q.attributes.position.array[i * 3 + 1];
      const sh = cc ? 1 : 1;
      col[(o + i) * 3] = (cc ? cc.getX(i) : c.r) * sh; col[(o + i) * 3 + 1] = (cc ? cc.getY(i) : c.g) * sh; col[(o + i) * 3 + 2] = (cc ? cc.getZ(i) : c.b) * sh;
      void y;
    }
    o += k;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.computeBoundingSphere();
  return out;
}
// 按 1000×1000 的区块分开合并
function chunked(items, mat, shadow) {
  const groups = new Map();
  for (const it of items) {
    const key = Math.floor(it.x / 1000) + ',' + Math.floor(it.z / 1000);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(...it.parts);
  }
  const meshes = [];
  for (const list of groups.values()) {
    const m = new THREE.Mesh(mergeParts(list), mat);
    m.castShadow = !!shadow; m.receiveShadow = false; m.matrixAutoUpdate = false;
    meshes.push(m);
  }
  return meshes;
}
function placeTree(list, x, z, y, sc, kind, R) {
  const rot = R() * Math.PI * 2;
  const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot), new THREE.Vector3(sc, sc * (0.9 + R() * 0.25), sc));
  const parts = treeParts(kind, R).map(([g, c]) => [g, c, m]);
  list.push({ x, z, y, h: (kind === 'pine' ? 100 : 108) * sc, r: 42 * sc, parts });
}

/* ---------- 石崖 ---------- */
function shapeOutline(s, n) {                    // 形状轮廓（逆时针），带一点噪声
  const pts = [];
  if (s.c) {
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; pts.push([s.c[0] + Math.cos(a) * s.c[2], s.c[1] + Math.sin(a) * s.c[2]]); }
  } else {
    const [x1, y1, x2, y2, r] = s.k, a0 = Math.atan2(y2 - y1, x2 - x1), h = Math.max(4, n >> 1);
    for (let i = 0; i <= h; i++) { const a = a0 - Math.PI / 2 + i / h * Math.PI; pts.push([x2 + Math.cos(a) * r, y2 + Math.sin(a) * r]); }
    for (let i = 0; i <= h; i++) { const a = a0 + Math.PI / 2 + i / h * Math.PI; pts.push([x1 + Math.cos(a) * r, y1 + Math.sin(a) * r]); }
  }
  return pts;
}
function cliffColorize(g, top, seedish) {
  const pos = g.attributes.position, nor = g.attributes.normal, n = pos.count;
  const col = new Float32Array(n * 3);
  const rock = [new THREE.Color('#8E8274'), new THREE.Color('#A39684'), new THREE.Color('#7A6E62')];
  const grassC = new THREE.Color('#5A9A3C'), grassD = new THREE.Color('#3F7A30');
  for (let i = 0; i < n; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), ny = nor.getY(i);
    let c;
    if (ny > 0.55 && y > top - 14) { c = grassC.clone().lerp(grassD, fbm(x / 90, z / 90)); }
    else {
      const k = fbm(x / 40 + seedish, z / 40 + y / 25);
      c = rock[0].clone().lerp(k < 0.5 ? rock[2] : rock[1], Math.abs(k - 0.5) * 2);
      c.multiplyScalar(0.72 + 0.34 * clamp01(y / top));    // 底下暗
      if (y > top - 20 && ny > 0.1) c.lerp(grassD, 0.55);   // 崖边长草
    }
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
}
// 一个形状挤成石崖：挤出 + 斜边，再按位置加噪声让轮廓像石头
function cliffGeo(outline, hole, height, seed) {
  const shp = new THREE.Shape(outline.map(p => new THREE.Vector2(p[0], -p[1])));
  if (hole) shp.holes.push(new THREE.Path(hole.map(p => new THREE.Vector2(p[0], -p[1]))));
  let g = new THREE.ExtrudeGeometry(shp, { depth: height - 12, bevelEnabled: true, bevelThickness: 12, bevelSize: 16, bevelOffset: 0, bevelSegments: 2, curveSegments: 4, steps: 2 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, 12, 0);
  if (g.index) g = g.toNonIndexed();
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const qx = Math.round(x * 2), qz = Math.round(z * 2), qy = Math.round(y * 2);
    const nx = vnoise(qx / 70 + seed, qz / 70 + qy / 60) - 0.5, nz = vnoise(qz / 70 + seed + 9, qx / 70 - qy / 60) - 0.5;
    const ny = y > 2 ? (vnoise(qx / 50, qz / 50) - 0.5) * 10 : 0;
    pos.setXYZ(i, x + nx * 26, Math.max(0, y + ny), z + nz * 26);
  }
  g.computeVertexNormals();
  cliffColorize(g, height, seed);
  return g;
}

// 地图边石崖的内轮廓：正方形，两个泉水角换成绕泉水的圆弧
function borderInner() {
  const B = BORDER - 6, out = [], P = SPRING_VIS, Q = mir(SPRING_VIS), r = SPRING_VR;
  const arc = (c, a0, a1) => { for (let k = 0; k <= 16; k++) { const a = (a0 + (a1 - a0) * k / 16) * Math.PI / 180; out.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]); } };
  const dx = Math.sqrt(r * r - (P[0] - B) ** 2);
  const side = (a, b, n) => { for (let k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); };
  side([B, B], [Q[0] - dx, B], 40);                       // 上边（往右）
  arc(Q, Math.atan2(B - Q[1], -dx) * 180 / Math.PI + 360, 360 + Math.atan2(dx, L - B - Q[0]) * 180 / Math.PI + (Math.atan2(dx, L - B - Q[0]) < 0 ? 360 : 0));
  side([L - B, Q[1] + dx], [L - B, L - B], 40);           // 右边（往下）
  side([L - B, L - B], [P[0] + dx, L - B], 40);           // 下边（往左）
  arc(P, Math.atan2(L - B - P[1], dx) * 180 / Math.PI, 360 + Math.atan2(-dx, B - P[0]) * 180 / Math.PI);
  side([B, P[1] - dx], [B, B], 40);                       // 左边（往上）
  return out;
}
const nearSpringVis = (x, y, pad) => Math.hypot(x - SPRING_VIS[0], y - SPRING_VIS[1]) < SPRING_VR + pad || Math.hypot(x - SPRING_VIS[1], y - SPRING_VIS[0]) < SPRING_VR + pad;

/* ---------- 草丛 ---------- */
function bushClump(R) {
  // 七八片草叶：底宽顶尖，往外斜
  const blades = [];
  const n = 7 + ((R() * 3) | 0);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + R() * 0.6, lean = 0.25 + R() * 0.35, h = 52 + R() * 26, w = 7 + R() * 4;
    const g = new THREE.BufferGeometry();
    const dx = Math.cos(a), dz = Math.sin(a), px = -dz, pz = dx;
    const tipX = dx * h * lean, tipZ = dz * h * lean;
    const v = [px * w, 0, pz * w, -px * w, 0, -pz * w, tipX, h, tipZ,
      -px * w, 0, -pz * w, px * w, 0, pz * w, tipX, h, tipZ];
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    g.computeVertexNormals();
    const nor = g.attributes.normal;
    for (let k = 0; k < 6; k++) nor.setXYZ(k, nor.getX(k) * 0.4, 0.9, nor.getZ(k) * 0.4);   // 法线朝上，草叶两面一样亮
    const col = [], base = new THREE.Color('#2F7F52'), tip = new THREE.Color(R() < 0.5 ? '#7FD08A' : '#6CC47E');
    for (let k = 0; k < 6; k++) { const c = (k % 3 === 2) ? tip : base; col.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    blades.push(g);
  }
  return blades;
}
function bushMaterial() {
  const m = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, transparent: false });
  m.onBeforeCompile = sh => {
    sh.uniforms.uWind = S3.uWind;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uWind;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
vec4 wpb = modelMatrix * vec4(transformed, 1.0);
float sway = sin(uWind * 1.7 + wpb.x * 0.013 + wpb.z * 0.011) * 0.5 + sin(uWind * 2.9 + wpb.x * 0.031) * 0.25;
transformed.x += sway * transformed.y * 0.09;
transformed.z += sway * transformed.y * 0.05;`);
  };
  return m;
}

/* ---------- 水 ---------- */
function waterMaterial() {
  const u = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uT: { value: 0 } }]);
  return new THREE.ShaderMaterial({
    uniforms: u, transparent: true, depthWrite: false, fog: true,
    vertexShader: `varying vec3 vW;
#include <fog_pars_vertex>
void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
#include <fog_vertex>
}`,
    fragmentShader: `uniform float uT; varying vec3 vW;
#include <common>
#include <fog_pars_fragment>
void main() {
  float d = abs(vW.x - vW.z) * 0.70710678;
  float inside = smoothstep(${(RIVER_W + 22).toFixed(1)}, ${(RIVER_W - 18).toFixed(1)}, d);
  float pit = 1.0;
  ${PITS.map(p => `pit *= smoothstep(${(PIT_R - 6).toFixed(1)}, ${(PIT_R + 26).toFixed(1)}, distance(vW.xz, vec2(${p[0].toFixed(1)}, ${p[1].toFixed(1)})));`).join('\n  ')}
  inside *= pit;
  float out1 = max(max(${BORDER}.0 - vW.x, vW.x - ${L - BORDER}.0), max(${BORDER}.0 - vW.z, vW.z - ${L - BORDER}.0));
  inside *= 1.0 - smoothstep(-30.0, 30.0, out1);
  if (inside < 0.01) discard;
  float deep = smoothstep(${(RIVER_W - 10).toFixed(1)}, 40.0, d);
  vec3 col = mix(vec3(0.42, 0.82, 0.86), vec3(0.12, 0.47, 0.66), deep);
  float w1 = sin(vW.x * 0.021 + uT * 1.3) * sin(vW.z * 0.024 - uT * 1.1);
  float w2 = sin((vW.x + vW.z) * 0.047 + uT * 2.1) * sin((vW.x - vW.z) * 0.033 - uT * 1.6);
  col += vec3(0.05, 0.07, 0.08) * (w1 + 0.6 * w2);
  float sp = pow(max(0.0, sin(vW.x * 0.09 + uT * 2.3 + w1) * sin(vW.z * 0.11 - uT * 1.7 + w2)), 30.0);
  col += vec3(0.9) * sp;
  float foam = smoothstep(${(RIVER_W - 34).toFixed(1)}, ${(RIVER_W - 6).toFixed(1)}, d + w2 * 8.0) * (1.0 - smoothstep(${(RIVER_W + 2).toFixed(1)}, ${(RIVER_W + 18).toFixed(1)}, d));
  col = mix(col, vec3(0.92, 0.98, 1.0), foam * 0.55);
  gl_FragColor = vec4(col, inside * mix(0.62, 0.86, deep));
  #include <fog_fragment>
}`,
  });
}

/* ---------- 塔、水晶、泉水 ---------- */
const TEAM3 = [{ main: '#3D8BFF', glow: '#7CC4FF', dark: '#1E4E9A', trim: '#E6C46A' }, { main: '#FF4D4D', glow: '#FF9A7A', dark: '#9A2424', trim: '#E6C46A' }];
function buildTower(team, tier) {
  const T = TEAM3[team], root = new THREE.Group(), st = new THREE.Group();
  const sc = tier === 2 ? 1.08 : 1;
  const stone = '#B8BCC6', stone2 = '#8E939E', gold = T.trim;
  st.add(M(GEO.cyl(64, 70, 16, 8), lam(stone2), 0, 8, 0));
  st.add(M(GEO.cyl(52, 58, 14, 8), lam(stone), 0, 23, 0));
  st.add(M(GEO.cyl(30, 38, 150, 8), lam(stone), 0, 104, 0));
  for (const y of [40, 110, 172]) st.add(M(GEO.cyl(y > 150 ? 33 : 37 - (y - 40) * 0.05, y > 150 ? 33 : 38 - (y - 40) * 0.05, 7, 8), lam(gold), 0, y, 0));
  for (let i = 0; i < 4; i++) {                 // 竖着的队伍色饰条
    const a = i * Math.PI / 2 + Math.PI / 8;
    const bar = M(GEO.box(9, 110, 5), lam(T.main), Math.cos(a) * 33, 104, Math.sin(a) * 33);
    bar.rotation.y = -a; bar.rotation.z = 0; st.add(bar);
  }
  st.add(M(GEO.cyl(44, 26, 30, 8), lam(gold), 0, 192, 0));
  for (let i = 0; i < 4; i++) {                 // 托着球的四根爪
    const a = i * Math.PI / 2 + Math.PI / 4, cl = new THREE.Group();
    cl.position.set(Math.cos(a) * 36, 200, Math.sin(a) * 36); cl.rotation.y = -a;
    const p1 = M(GEO.box(8, 48, 10), lam(gold), 0, 20, 0); p1.rotation.z = 0.32; cl.add(p1);
    const p2 = M(GEO.cone(6, 18, 4), lam(gold), -10, 50, 0); p2.rotation.z = 0.7; cl.add(p2);
    st.add(cl);
  }
  st.scale.setScalar(sc);
  const body = new THREE.Mesh(bakeGroup(st), VCOL());
  body.castShadow = true; body.receiveShadow = true;
  root.add(body);
  const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(23 * sc, 1), new THREE.MeshLambertMaterial({ color: T.main, emissive: T.glow, emissiveIntensity: 0.85 }));
  orb.position.y = 236 * sc; root.add(orb);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(40 * sc, 14, 10), new THREE.MeshBasicMaterial({ color: T.glow, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.position.y = 236 * sc; root.add(halo);
  return { root, body, orb, halo, top: 236 * sc, team };
}
function buildRubble(team) {
  const g = new THREE.Group(), R = prng(team * 7 + 3);
  g.add(M(GEO.cyl(64, 70, 16, 8), lam('#7E838E'), 0, 8, 0));
  g.add(M(GEO.cyl(30, 38, 34, 8), lam('#9EA2AC'), 0, 30, 0));
  for (let i = 0; i < 9; i++) { const a = R() * 7, d = 40 + R() * 50, s = 10 + R() * 14; const b = M(GEO.box(s, s * 0.7, s), lam(R() < 0.5 ? '#9EA2AC' : '#7E838E'), Math.cos(a) * d, s * 0.3, Math.sin(a) * d); b.rotation.set(R(), R(), R()); g.add(b); }
  const m = new THREE.Mesh(bakeGroup(g), VCOL());
  m.receiveShadow = true;
  return m;
}
function buildCrystal(team) {
  const T = TEAM3[team], root = new THREE.Group(), st = new THREE.Group();
  st.add(M(GEO.cyl(108, 118, 18, 6), lam('#8E939E'), 0, 9, 0));
  st.add(M(GEO.cyl(90, 98, 18, 6), lam('#B8BCC6'), 0, 27, 0));
  st.add(M(GEO.cyl(70, 76, 10, 6), lam(T.trim), 0, 41, 0));
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3, x = Math.cos(a) * 96, z = Math.sin(a) * 96;
    st.add(M(GEO.cyl(9, 12, 80, 6), lam('#B8BCC6'), x, 76, z));
    st.add(M(GEO.cyl(13, 13, 8, 6), lam(T.trim), x, 118, z));
    st.add(M(GEO.oct(9), lam(T.main), x, 132, z));
  }
  const body = new THREE.Mesh(bakeGroup(st), VCOL());
  body.castShadow = true; body.receiveShadow = true;
  root.add(body);
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(52, 0), new THREE.MeshLambertMaterial({ color: T.main, emissive: T.glow, emissiveIntensity: 0.6 }));
  gem.scale.set(1, 1.75, 1); gem.position.y = 175; gem.castShadow = true; root.add(gem);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(80, 3.5, 6, 40), new THREE.MeshBasicMaterial({ color: T.glow, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
  ring.rotation.x = Math.PI / 2; ring.position.y = 150; root.add(ring);
  const ring2 = ring.clone(); ring2.scale.setScalar(0.72); ring2.position.y = 210; root.add(ring2);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(95, 16, 12), new THREE.MeshBasicMaterial({ color: T.glow, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.position.y = 175; root.add(halo);
  return { root, body, gem, ring, ring2, halo, top: 270, team };
}
function buildSpring(team) {
  const T = TEAM3[team], g = new THREE.Group(), st = new THREE.Group();
  st.add(M(GEO.cyl(150, 160, 12, 12), lam('#B8BCC6'), 0, 6, 0));
  st.add(M(GEO.cyl(120, 124, 8, 12), lam(T.trim), 0, 14, 0));
  st.add(M(GEO.cyl(108, 110, 6, 12), lam('#5F7FA8'), 0, 18, 0));
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; st.add(M(GEO.box(14, 46, 14), lam('#B8BCC6'), Math.cos(a) * 140, 30, Math.sin(a) * 140)); st.add(M(GEO.oct(8), lam(T.main), Math.cos(a) * 140, 60, Math.sin(a) * 140)); }
  const body = new THREE.Mesh(bakeGroup(st), VCOL());
  body.receiveShadow = true; g.add(body);
  const pool = new THREE.Mesh(new THREE.CylinderGeometry(106, 106, 2, 24), new THREE.MeshBasicMaterial({ color: T.glow, transparent: true, opacity: 0.55 }));
  pool.position.y = 21; g.add(pool);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(40, 70, 220, 18, 1, true), new THREE.MeshBasicMaterial({ color: T.glow, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  beam.position.y = 130; g.add(beam);
  return { root: g, pool, beam };
}
// 龙坑：一圈矮石墙
function buildPit(p) {
  const g = new THREE.Group(), R = prng(p[0] | 0);
  for (let i = 0; i < 22; i++) {
    const a = i / 22 * Math.PI * 2;
    if (Math.abs(Math.sin(a - Math.PI / 4)) < 0.3) continue;   // 沿河的两个口子
    const s = 26 + R() * 10;
    const b = M(GEO.dod(s), lam(R() < 0.5 ? '#9A9488' : '#8A8478'), p[0] + Math.cos(a) * (PIT_R + 8), 6, p[1] + Math.sin(a) * (PIT_R + 8));
    b.scale.y = 0.55 + R() * 0.3; g.add(b);
  }
  const m = new THREE.Mesh(bakeGroup(g), VCOL());
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

/* ---------- 建场景 ---------- */
function buildScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#9FC6D8');
  scene.fog = new THREE.Fog('#A9CBD6', 3000, 6200);
  const hemi = new THREE.HemisphereLight('#E6F2FF', '#5A6A3A', 0.62);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#FFF3DC', 0.78);
  sun.castShadow = true;
  const touch = typeof navigator !== 'undefined' && (navigator.maxTouchPoints > 0 || 'ontouchstart' in window);
  sun.shadow.mapSize.set(touch ? 1024 : 2048, touch ? 1024 : 2048);   // 手机上影子贴图小一点
  const sc = sun.shadow.camera;
  sc.left = -1300; sc.right = 1300; sc.top = 1300; sc.bottom = -1300; sc.near = 10; sc.far = 3000;
  sun.shadow.bias = -0.0015; sun.shadow.normalBias = 0;
  scene.add(sun); scene.add(sun.target);
  S3.sun = sun; S3.hemi = hemi; S3.scene = scene;

  const tex = { grass: texGrass(), stone: texStone(), plaza: texPlaza(), sand: texSand(), noise: texNoise(), ctl: buildControl() };
  const R = prng(1234);
  // 树
  const trees = [];
  for (const s of WALLS) {
    const bb = s.c ? [s.c[0] - s.c[2], s.c[1] - s.c[2], s.c[0] + s.c[2], s.c[1] + s.c[2]]
      : [Math.min(s.k[0], s.k[2]) - s.k[4], Math.min(s.k[1], s.k[3]) - s.k[4], Math.max(s.k[0], s.k[2]) + s.k[4], Math.max(s.k[1], s.k[3]) + s.k[4]];
    const sp = 58;
    for (let y = bb[1] + sp / 2; y < bb[3]; y += sp) for (let x = bb[0] + sp / 2; x < bb[2]; x += sp) {
      const px = x + (R() - 0.5) * sp * 0.7, py = y + (R() - 0.5) * sp * 0.7;
      if (shapeDist(s, px, py) > -22) continue;
      placeTree(trees, px, py, CLIFF_H - 4, 0.85 + R() * 0.35, R() < 0.22 ? 'pine' : 'round', R);
    }
  }
  // 地图边：两排树
  const edgeRow = (off, sp, sc0) => {
    for (let a = -300; a < L + 300; a += sp) {
      for (const side of [0, 1, 2, 3]) {
        const t = a + (R() - 0.5) * sp * 0.6, o = off + (R() - 0.5) * 30;
        const [x, y] = side === 0 ? [t, BORDER - o] : side === 1 ? [t, L - BORDER + o] : side === 2 ? [BORDER - o, t] : [L - BORDER + o, t];
        if (nearSpringVis(x, y, 40)) continue;
        placeTree(trees, x, y, CLIFF_H - 4, sc0 * (0.8 + R() * 0.4), R() < 0.3 ? 'pine' : 'round', R);
      }
    }
  };
  edgeRow(70, 80, 1.0); edgeRow(165, 88, 1.15);
  tex.shade = buildShade(trees);
  // 地面
  const gg = new THREE.PlaneGeometry(L + 4400, L + 4400, 176, 176);
  gg.rotateX(-Math.PI / 2);
  gg.translate(L / 2, 0, L / 2);
  const gp = gg.attributes.position;
  for (let i = 0; i < gp.count; i++) gp.setY(i, groundH(gp.getX(i), gp.getZ(i)));
  gg.computeVertexNormals();
  const gm = groundMaterial(tex);
  const ground = new THREE.Mesh(gg, gm);
  ground.receiveShadow = true; ground.matrixAutoUpdate = false;
  scene.add(ground);
  S3.groundMat = gm;
  // 水
  const wg = new THREE.PlaneGeometry(L * Math.SQRT2 + 400, (RIVER_W + 30) * 2, 1, 1);
  wg.rotateX(-Math.PI / 2);
  wg.rotateY(-Math.PI / 4);
  const water = new THREE.Mesh(wg, waterMaterial());
  water.position.set(L / 2, -7, L / 2); water.renderOrder = 2;
  scene.add(water);
  S3.water = water;
  // 石崖：墙 + 地图四周
  const cliffMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const cliffParts = [];
  WALLS.forEach((s, i) => cliffParts.push(cliffGeo(shapeOutline(s, s.c ? 18 : 16), null, CLIFF_H, i * 3.7)));
  const outer = [[-2000, -2000], [L + 2000, -2000], [L + 2000, L + 2000], [-2000, L + 2000]];
  cliffParts.push(cliffGeo(outer, borderInner(), CLIFF_H, 99));
  for (const g of cliffParts) {
    const m = new THREE.Mesh(g, cliffMat);
    m.receiveShadow = true; m.castShadow = true; m.matrixAutoUpdate = false;
    scene.add(m);
  }
  // 树、石头、远处的密林
  const treeMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  for (const m of chunked(forestBlobs(R), treeMat, false)) scene.add(m);
  for (const m of chunked(trees, treeMat, false)) scene.add(m);
  const rocks = [];
  for (const s of WALLS) {
    const out = shapeOutline(s, 10);
    for (const p of out) {
      if (R() < 0.45) continue;
      const cx = s.c ? s.c[0] : (s.k[0] + s.k[2]) / 2, cy = s.c ? s.c[1] : (s.k[1] + s.k[3]) / 2;
      const dx = p[0] - cx, dy = p[1] - cy, d = Math.hypot(dx, dy) || 1;
      const x = p[0] + dx / d * 18, y = p[1] + dy / d * 18, sc = 12 + R() * 14;
      const m = new THREE.Matrix4().compose(new THREE.Vector3(x, sc * 0.2, y), new THREE.Quaternion().setFromEuler(new THREE.Euler(R(), R() * 6, R())), new THREE.Vector3(sc, sc, sc));
      rocks.push({ x, z: y, parts: rockParts(R).map(([g, c]) => [g, c, m]) });
    }
  }
  for (const m of chunked(rocks, treeMat, false)) scene.add(m);
  // 草丛
  const bm = [];
  BUSHES.forEach((s, bi) => {
    const parts = [];
    const bb = s.c ? [s.c[0] - s.c[2], s.c[1] - s.c[2], s.c[0] + s.c[2], s.c[1] + s.c[2]]
      : [Math.min(s.k[0], s.k[2]) - s.k[4], Math.min(s.k[1], s.k[3]) - s.k[4], Math.max(s.k[0], s.k[2]) + s.k[4], Math.max(s.k[1], s.k[3]) + s.k[4]];
    const sp = 26;
    for (let y = bb[1]; y <= bb[3]; y += sp) for (let x = bb[0]; x <= bb[2]; x += sp) {
      const px = x + (R() - 0.5) * sp * 0.8, py = y + (R() - 0.5) * sp * 0.8;
      if (shapeDist(s, px, py) > -6) continue;
      const sc = 0.8 + R() * 0.45;
      const m = new THREE.Matrix4().compose(new THREE.Vector3(px, groundH(px, py) - 2, py), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), R() * 6.28), new THREE.Vector3(sc, sc, sc));
      for (const g of bushClump(R)) parts.push([g, null, m]);
    }
    const mat = bushMaterial();
    const mesh = new THREE.Mesh(mergeParts(parts), mat);
    mesh.castShadow = false; mesh.receiveShadow = false; mesh.matrixAutoUpdate = false;
    scene.add(mesh);
    bm.push({ mesh, mat, idx: bi + 1 });
  });
  S3.bushes = bm;
  // 龙坑、泉水
  for (const p of PITS) scene.add(buildPit(p));
  S3.springs = [0, 1].map(team => {
    const sp = buildSpring(team), p = team ? mir(SPRING_VIS) : SPRING_VIS;
    sp.root.position.set(p[0], 0, p[1]);
    scene.add(sp.root);
    return sp;
  });
  return scene;
}
function forestBlobs(R) {
  // 地图外一圈：一团团低多边形的树冠挤在一起，看着像密林
  const out = [], greens = ['#2E7438', '#3A8A40', '#25622F', '#468F3E', '#2B6A34'];
  const sp = 92;
  for (let z = -1500; z < L + 1500; z += sp) for (let x = -1500; x < L + 1500; x += sp) {
    const px = x + (R() - 0.5) * sp * 0.8, pz = z + (R() - 0.5) * sp * 0.8;
    const o = Math.max(BORDER - px, px - (L - BORDER), BORDER - pz, pz - (L - BORDER));
    if (o < 250 || nearSpringVis(px, pz, 120)) continue;
    const r = 52 + R() * 26, h = CLIFF_H + 40 + R() * 40 + Math.min(60, (o - 250) * 0.06);
    const m = new THREE.Matrix4().compose(new THREE.Vector3(px, h, pz), new THREE.Quaternion().setFromEuler(new THREE.Euler(R(), R() * 6, R())), new THREE.Vector3(r, r * (0.75 + R() * 0.3), r));
    const g = blobGeo(1, 0);
    out.push({ x: px, z: pz, parts: [[g, new THREE.Color(greens[(R() * greens.length) | 0]).offsetHSL(0, 0, (R() - 0.5) * 0.05), m]] });
  }
  return out;
}
function canopyMesh() {
  // 地图外一圈起伏的树冠（四条带子），顶点色深浅绿
  const parts = [];
  const strips = [[-2200, -2200, L + 2200, -60], [-2200, L + 60, L + 2200, L + 2200], [-2200, -60, -60, L + 60], [L + 60, -60, L + 2200, L + 60]];
  for (const [x0, z0, x1, z1] of strips) {
    const nx = Math.max(2, Math.round((x1 - x0) / 60)), nz = Math.max(2, Math.round((z1 - z0) / 60));
    const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz);
    g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
    const p = g.attributes.position, col = new Float32Array(p.count * 3);
    const c1 = new THREE.Color('#2F7A3A'), c2 = new THREE.Color('#5AAE4A'), c3 = new THREE.Color('#24602E');
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const n = fbm(x / 160, z / 160), bump = Math.abs(Math.sin(x / 47 + n * 4) * Math.sin(z / 53 - n * 3));
      const edge = Math.min(Math.abs(x - BORDER), Math.abs(x - (L - BORDER)), Math.abs(z - BORDER), Math.abs(z - (L - BORDER)));
      p.setY(i, 120 + n * 70 + bump * 26 - Math.max(0, 260 - edge) * 0.25);
      const c = c1.clone().lerp(c2, bump * 0.7).lerp(c3, clamp01((0.5 - n) * 1.6));
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    parts.push(g);
  }
  let n = 0; for (const g of parts) n += (g.index ? g.index.count : g.attributes.position.count);
  const merged = mergeParts(parts.map(g => [g, null, new THREE.Matrix4()]));
  const m = new THREE.Mesh(merged, new THREE.MeshLambertMaterial({ vertexColors: true }));
  m.matrixAutoUpdate = false;
  return m;
}

/* ---------- 渲染器、镜头 ---------- */
const CAMC = { fov: 28, pitch: 54 * Math.PI / 180, lookUp: 120 };   // 视角窄一点：高的塔在屏幕边上不那么歪
function initRenderer(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  S3.r = r;
  S3.cam = new THREE.PerspectiveCamera(CAMC.fov, 1, 40, 10000);
  return r;
}
function resize3D(w, h, dpr) {
  S3.w = w; S3.h = h; S3.dpr = dpr;
  S3.r.setPixelRatio(dpr);
  S3.r.setSize(w, h, false);
  const cam = S3.cam, asp = w / h;
  cam.aspect = asp;
  // 横着看大约 1500 单位宽、竖着至少 720；窄屏就拉远一点
  const th = Math.tan(CAMC.fov / 2 * Math.PI / 180);
  S3.camDist = Math.max(750 / (asp * th), 360 / th);
  cam.updateProjectionMatrix();
}
const _v = new THREE.Vector3();
function placeCamera(x, y, shake) {
  const cam = S3.cam, d = S3.camDist;
  const tx = x, tz = y - CAMC.lookUp;
  cam.position.set(tx + (shake ? shake[0] : 0), d * Math.sin(CAMC.pitch), tz + d * Math.cos(CAMC.pitch) + (shake ? shake[1] : 0));
  cam.lookAt(tx + (shake ? shake[0] : 0), 0, tz + (shake ? shake[1] : 0));
  // 太阳跟着镜头走（影子贴图只盖住看得见的那块），按影子贴图的格子对齐，免得影子边闪
  const sun = S3.sun, step = 2600 / sun.shadow.mapSize.x;
  const cx = Math.round(x / step) * step, cz = Math.round((y - 200) / step) * step;
  sun.target.position.set(cx, 0, cz);
  sun.position.set(cx + SUN.x * 1500, SUN.y * 1500, cz + SUN.z * 1500);
}
// 屏幕坐标（CSS 像素）↔ 地面
const _ray = new THREE.Raycaster(), _ndc = new THREE.Vector2(), _plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
function screenToGround(sx, sy) {
  _ndc.set(sx / S3.w * 2 - 1, -(sy / S3.h) * 2 + 1);
  _ray.setFromCamera(_ndc, S3.cam);
  const p = _ray.ray.intersectPlane(_plane, _v);
  return p ? [p.x, p.z] : null;
}
function worldToScreen(x, h, y, out) {
  _v.set(x, h, y).project(S3.cam);
  out[0] = (_v.x + 1) / 2 * S3.w; out[1] = (1 - _v.y) / 2 * S3.h; out[2] = _v.z;
  return out;
}

if (typeof module !== 'undefined') module.exports = {};
