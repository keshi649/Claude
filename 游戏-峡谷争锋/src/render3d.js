'use strict';
/* render3d.js：每帧把对局（W）同步进三维场景。
   英雄、野怪：蒙皮网格（一个一次绘制）；小兵：按（兵种、队伍、身子 / 左腿 / 右腿）分的实例化网格；塔、水晶：建一次，倒了换成废墟。
   弹道、地面特效（圈、扇形、冰、流星……）、粒子（两套：叠加发光的、普通的），技能瞄准的地面指示，脚下的队伍圈。
   镜头跟着玩家（或开头画面里跟拍的英雄）；血条、飘字在 hud.js 里画（这里算好每个单位头顶在屏幕上的位置）。 */

const MSCALE = 1.22;                         // 小兵放大
const R3 = {
  scene: null, t: 0, alpha: 1, camX: 2500, camY: 2500, shake: 0, peek: null, aimCam: null,
  heroes: new Map(), monsters: new Map(), structs: new Map(), minion: {}, mcache: new Map(), corpses: [],
  projs: new Map(), pool: {}, fx: [], decals: [], bars: [], W: null, me: null, tex: {}, view: [0, 0, L, L],
  towerRing: null, aimG: null,
};

/* ---------- 插值：模拟固定 60 步/秒，画面按屏幕刷新；画的时候取上一步和这一步之间的位置，走起来不一顿一顿 ---------- */
const _ip = [0, 0];
function ip(u) {
  const a = R3.alpha;
  if (u._px == null || a >= 1 || Math.abs(u.x - u._px) + Math.abs(u.y - u._py) > 200) { _ip[0] = u.x; _ip[1] = u.y; }
  else { _ip[0] = u._px + (u.x - u._px) * a; _ip[1] = u._py + (u.y - u._py) * a; }
  return _ip;
}

/* ---------- 画布贴图：圈、实心圆、虚线圈、箭头、刀光、光点 ---------- */
function decalTex(kind) {
  if (R3.tex[kind]) return R3.tex[kind];
  const N = 256, c = mkc(N, N), g = c.getContext('2d'), h = N / 2;
  if (kind === 'ring') {
    const gr = g.createRadialGradient(h, h, 0, h, h, h);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.72, 'rgba(255,255,255,0.08)'); gr.addColorStop(0.9, 'rgba(255,255,255,0.9)');
    gr.addColorStop(0.95, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, N, N);
  } else if (kind === 'disc') {
    const gr = g.createRadialGradient(h, h, 0, h, h, h);
    gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.8, 'rgba(255,255,255,0.4)'); gr.addColorStop(0.94, 'rgba(255,255,255,0.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, N, N);
  } else if (kind === 'soft') {
    const gr = g.createRadialGradient(h, h, 0, h, h, h);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, N, N);
  } else if (kind === 'dash') {
    g.strokeStyle = '#fff'; g.lineWidth = 5; g.setLineDash([16, 12]);
    g.beginPath(); g.arc(h, h, h - 6, 0, Math.PI * 2); g.stroke();
    g.setLineDash([]); g.lineWidth = 1.5; g.globalAlpha = 0.5; g.beginPath(); g.arc(h, h, h - 6, 0, Math.PI * 2); g.stroke();
    const gr = g.createRadialGradient(h, h, h * 0.6, h, h, h);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,0.12)');
    g.globalAlpha = 1; g.fillStyle = gr; g.beginPath(); g.arc(h, h, h - 6, 0, Math.PI * 2); g.fill();
  } else if (kind === 'arrow') {               // 竖着的箭头：底边是起点，顶上是箭头
    const gr = g.createLinearGradient(0, N, 0, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0.15)'); gr.addColorStop(1, 'rgba(255,255,255,0.55)');
    g.fillStyle = gr; g.fillRect(N * 0.2, N * 0.16, N * 0.6, N * 0.84);
    g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = 6;
    g.strokeRect(N * 0.2, N * 0.16, N * 0.6, N * 0.84);
    g.fillStyle = 'rgba(255,255,255,0.95)';
    g.beginPath(); g.moveTo(N * 0.06, N * 0.2); g.lineTo(h, 2); g.lineTo(N * 0.94, N * 0.2); g.closePath(); g.fill();
  } else if (kind === 'slash') {               // 月牙形的刀光
    g.translate(h, N * 0.9);
    const gr = g.createRadialGradient(0, 0, N * 0.5, 0, 0, N * 0.85);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.75, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, N * 0.85, -Math.PI * 0.86, -Math.PI * 0.14); g.arc(0, 0, N * 0.5, -Math.PI * 0.14, -Math.PI * 0.86, true); g.fill();
  } else if (kind === 'crack') {               // 地裂
    g.strokeStyle = 'rgba(40,24,10,0.9)'; g.lineCap = 'round';
    const R = prng(5);
    for (let i = 0; i < 9; i++) {
      let a = i / 9 * Math.PI * 2 + R() * 0.4, x = h, y = h, r = 0;
      g.lineWidth = 6; g.beginPath(); g.moveTo(x, y);
      while (r < h * 0.95) { r += 14 + R() * 12; a += (R() - 0.5) * 0.6; x = h + Math.cos(a) * r; y = h + Math.sin(a) * r; g.lineTo(x, y); g.lineWidth *= 0.85; }
      g.stroke();
    }
  } else if (kind === 'dot') {
    const gr = g.createRadialGradient(h, h, 0, h, h, h);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, N, N);
  }
  const t = new THREE.CanvasTexture(c);
  R3.tex[kind] = t;
  return t;
}

/* ---------- 地面贴花（圈、扇形……）：一池子平铺在地上的方片 ---------- */
const _decalGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
function decal(kind, col, opt) {
  opt = opt || {};
  let d = R3.decals.find(x => !x.used && x.kind === kind && x.add === !!opt.add);
  if (!d) {
    const mat = new THREE.MeshBasicMaterial({ map: decalTex(kind), transparent: true, depthWrite: false, blending: opt.add ? THREE.AdditiveBlending : THREE.NormalBlending,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const m = new THREE.Mesh(_decalGeo, mat);
    m.renderOrder = 3; m.frustumCulled = true;
    d = { kind, add: !!opt.add, mesh: m, used: false };
    R3.decals.push(d);
    R3.scene.add(m);
  }
  d.used = true;
  d.mesh.visible = true;
  d.mesh.material.color.set(col || '#ffffff');
  d.mesh.material.opacity = opt.op == null ? 1 : opt.op;
  d.mesh.rotation.set(0, 0, 0);
  return d;
}
function freeDecal(d) { if (d) { d.used = false; d.mesh.visible = false; } }
function placeDecal(d, x, y, w, l, yaw, lift) {
  d.mesh.position.set(x, groundH(x, y) + (lift || 2), y);
  d.mesh.scale.set(w, 1, l == null ? w : l);
  d.mesh.rotation.y = yaw || 0;
}

/* ---------- 粒子：两套 Points（叠加发光 / 普通），每帧在 CPU 上更新 ---------- */
function makeParticles(additive, max) {
  const geo = new THREE.BufferGeometry();
  const P = { max, n: 0, pos: new Float32Array(max * 3), col: new Float32Array(max * 3), size: new Float32Array(max), alpha: new Float32Array(max),
    vel: new Float32Array(max * 3), life: new Float32Array(max), age: new Float32Array(max), grav: new Float32Array(max), s0: new Float32Array(max), grow: new Float32Array(max) };
  geo.setAttribute('position', new THREE.BufferAttribute(P.pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aColor', new THREE.BufferAttribute(P.col, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aSize', new THREE.BufferAttribute(P.size, 1).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aAlpha', new THREE.BufferAttribute(P.alpha, 1).setUsage(THREE.DynamicDrawUsage));
  geo.setDrawRange(0, 0);
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTex: { value: decalTex('dot') }, uScale: { value: 600 } },
    vertexShader: `attribute vec3 aColor; attribute float aSize; attribute float aAlpha; uniform float uScale; varying vec3 vC; varying float vA;
void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = aSize * uScale / -mv.z; gl_Position = projectionMatrix * mv; vC = aColor; vA = aAlpha; }`,
    fragmentShader: `uniform sampler2D uTex; varying vec3 vC; varying float vA;
void main() { vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(vC * t.rgb, t.a * vA); if (gl_FragColor.a < 0.01) discard; }`,
    transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false; pts.renderOrder = 5;
  P.geo = geo; P.mesh = pts; P.mat = mat;
  return P;
}
const _pc = new THREE.Color();
// 一个粒子：位置、速度、寿命、大小、颜色、重力（正数往下掉）
function part(add, x, h, y, vx, vh, vy, life, size, col, grav, grow) {
  const P = add ? R3.pa : R3.pn;
  if (!P || P.n >= P.max) return;
  const i = P.n++;
  P.pos[i * 3] = x; P.pos[i * 3 + 1] = h; P.pos[i * 3 + 2] = y;
  P.vel[i * 3] = vx; P.vel[i * 3 + 1] = vh; P.vel[i * 3 + 2] = vy;
  _pc.set(col);
  P.col[i * 3] = _pc.r; P.col[i * 3 + 1] = _pc.g; P.col[i * 3 + 2] = _pc.b;
  P.life[i] = life; P.age[i] = 0; P.size[i] = size; P.s0[i] = size; P.alpha[i] = 1; P.grav[i] = grav || 0; P.grow[i] = grow || 0;
}
// 一团：n 个粒子往四周散
function burst3(x, y, n, cols, o) {
  o = o || {};
  const h0 = groundH(x, y) + (o.h == null ? 30 : o.h);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = (o.spd || 120) * (0.35 + Math.random() * 0.75);
    part(o.add !== false, x + (Math.random() - 0.5) * (o.spread || 10), h0 + (Math.random() - 0.5) * 10, y + (Math.random() - 0.5) * (o.spread || 10),
      Math.cos(a) * s, (o.up == null ? 120 : o.up) * (0.5 + Math.random() * 0.8), Math.sin(a) * s,
      (o.life || 0.6) * (0.6 + Math.random() * 0.6), (o.size || 22) * (0.6 + Math.random() * 0.8), cols[(Math.random() * cols.length) | 0], o.grav == null ? 300 : o.grav, o.grow || 0);
  }
}
function stepParticles(P, dt) {
  let i = 0;
  while (i < P.n) {
    P.age[i] += dt;
    if (P.age[i] >= P.life[i]) {             // 换成最后一个
      const j = --P.n;
      if (i !== j) {
        for (let k = 0; k < 3; k++) { P.pos[i * 3 + k] = P.pos[j * 3 + k]; P.vel[i * 3 + k] = P.vel[j * 3 + k]; P.col[i * 3 + k] = P.col[j * 3 + k]; }
        P.life[i] = P.life[j]; P.age[i] = P.age[j]; P.size[i] = P.size[j]; P.s0[i] = P.s0[j]; P.alpha[i] = P.alpha[j]; P.grav[i] = P.grav[j]; P.grow[i] = P.grow[j];
      }
      continue;
    }
    const k = P.age[i] / P.life[i];
    P.vel[i * 3 + 1] -= P.grav[i] * dt;
    const drag = Math.pow(0.4, dt);
    P.vel[i * 3] *= drag; P.vel[i * 3 + 2] *= drag;
    P.pos[i * 3] += P.vel[i * 3] * dt; P.pos[i * 3 + 1] += P.vel[i * 3 + 1] * dt; P.pos[i * 3 + 2] += P.vel[i * 3 + 2] * dt;
    if (P.pos[i * 3 + 1] < 1) { P.pos[i * 3 + 1] = 1; P.vel[i * 3 + 1] *= -0.3; }
    P.alpha[i] = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85;
    P.size[i] = P.s0[i] * (1 + P.grow[i] * k);
    i++;
  }
  P.geo.setDrawRange(0, P.n);
  for (const nm of ['position', 'aColor', 'aSize', 'aAlpha']) P.geo.attributes[nm].needsUpdate = true;
}

/* ---------- 初始化 ---------- */
function init3D(scene) {
  R3.scene = scene;
  R3.pa = makeParticles(true, 1800);
  R3.pn = makeParticles(false, 900);
  scene.add(R3.pa.mesh); scene.add(R3.pn.mesh);
  // 小兵的实例化网格
  for (const mt of Object.keys(MINION)) for (const team of [0, 1]) {
    const P = minionParts(mt, team);
    const max = mt === 'vanguard' ? 8 : mt === 'siege' ? 16 : 70;
    const ent = { pivot: P.pivot, height: P.height * MSCALE, meshes: [] };
    for (const g of [P.body, P.legL, P.legR]) {
      const m = new THREE.InstancedMesh(g, VCOL(), max);
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.count = 0; m.frustumCulled = false; m.castShadow = false; m.visible = false;
      scene.add(m);
      ent.meshes.push(m);
    }
    ent.max = max;
    R3.minion[mt + team] = ent;
  }
  // 小兵脚下的淡影子（一块实例化的软圆片）
  const bm = new THREE.InstancedMesh(_decalGeo, new THREE.MeshBasicMaterial({ map: decalTex('soft'), color: '#000000', transparent: true, opacity: 0.35, depthWrite: false }), 260);
  bm.instanceMatrix.setUsage(THREE.DynamicDrawUsage); bm.frustumCulled = false; bm.count = 0; bm.renderOrder = 1;
  scene.add(bm);
  R3.blob = { mesh: bm, n: 0, max: 260 };
  // 敌方塔的攻击范围圈；锁定目标脚下的红圈
  R3.towerRing = decal('dash', '#FF4A3A', { op: 0.85 }); freeDecal(R3.towerRing); R3.towerRing.used = true;
  R3.lockRing = decal('ring', '#FF3A2E', { op: 0.95 }); freeDecal(R3.lockRing); R3.lockRing.used = true;
}
// 换一局：清掉上一局的英雄、塔、特效
function reset3D() {
  for (const v of R3.heroes.values()) removeHeroVis(v);
  for (const v of R3.monsters.values()) { R3.scene.remove(v.rig.root); disposeRig(v.rig); }
  for (const v of R3.structs.values()) { R3.scene.remove(v.vis.root); disposeTree(v.vis.root); if (v.rubble) { R3.scene.remove(v.rubble); disposeTree(v.rubble); } }
  for (const p of R3.projs.values()) { p.obj.visible = false; p.obj.userData.busy = false; }
  R3.heroes.clear(); R3.monsters.clear(); R3.structs.clear(); R3.projs.clear(); R3.mcache.clear(); R3.corpses.length = 0;
  for (const f of R3.fx) endFx(f);
  R3.fx.length = 0;
  for (const d of R3.decals) if (d !== R3.towerRing && d !== R3.lockRing) freeDecal(d);
  R3.pa.n = 0; R3.pn.n = 0;
}

/* ---------- 用完的网格要还给显卡（几何体、材质、骨骼贴图），不然一局下来越积越多 ---------- */
function disposeRig(rig) {
  rig.mesh.geometry.dispose(); rig.mats.lit.dispose(); rig.mats.glow.dispose();
  if (rig.glow) rig.glow.geometry.dispose();
  if (rig.mesh.skeleton) rig.mesh.skeleton.dispose();
}
function disposeTree(o) {                      // 塔、水晶这类自己建的一组网格；共用的材质（VCOL）留着
  o.traverse(m => {
    if (!m.isMesh) return;
    m.geometry.dispose();
    for (const mt of Array.isArray(m.material) ? m.material : [m.material]) if (mt !== VCOL() && mt !== R3.flashMat && !Object.values(MATS).includes(mt)) mt.dispose();
  });
}

/* ---------- 英雄 ---------- */
const TEAM_RING = ['#4AA8FF', '#FF4A4A'];
function makeHeroVis(u) {
  const rig = rigToSkinned(buildHero(u.hid));
  rig.root.scale.setScalar(HSCALE);
  R3.scene.add(rig.root);
  const ring = decal('ring', TEAM_RING[u.team], { op: 0.9 });
  const v = { u, rig, ring, yaw: u.team ? Math.PI * 0.75 : -Math.PI * 0.25, lx: u.x, ly: u.y, spd: 0, mvT: 0, shield: null, stars: null, extra: null };
  return v;
}
function removeHeroVis(v) {
  R3.scene.remove(v.rig.root);
  disposeRig(v.rig);
  freeDecal(v.ring); freeDecal(v.extra);
  for (const k of ['shield', 'stars', 'recall']) if (v[k]) { R3.scene.remove(v[k]); disposeTree(v[k]); }
}
function angLerp(a, b, k) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
}
// 单位该朝哪：在打谁就朝谁，在走就朝走的方向
function faceYaw(W, u, v, dt) {
  const dx = u.x - v.lx, dy = u.y - v.ly, d = Math.hypot(dx, dy);
  v.spd = v.spd * 0.8 + (dt > 0 ? d / dt : 0) * 0.2;
  let want = null;
  if (W.t - u.atkT < 0.6 || (u.castT && W.t - u.castT < 0.4)) {
    const t = u.atkTgt && W.t - u.atkT < 0.6 ? byId(W, u.atkTgt) : null;
    if (t) want = Math.atan2(t.x - u.x, t.y - u.y);
  }
  if (want == null && d > 0.6 && d < 120) want = Math.atan2(dx, dy);
  if (want != null) v.yaw = angLerp(v.yaw, want, 1 - Math.exp(-dt * 24));
  v.lx = u.x; v.ly = u.y;
}
function syncHero(W, u, v, me, dt, vis) {
  const root = v.rig.root;
  const deadT = u.dead ? W.t - (u.dieT || W.t) : -1;
  const show = vis && (!u.dead || deadT < 1.6);
  root.visible = show;
  if (!show) { v.ring.mesh.visible = false; if (v.shield) v.shield.visible = false; if (v.stars) v.stars.visible = false; if (v.recall) v.recall.visible = false; if (v.extra) v.extra.mesh.visible = false; return; }
  faceYaw(W, u, v, dt);
  const P = ip(u), px = P[0], py = P[1];
  const gh = groundH(px, py);
  root.position.set(px, gh + (u.z || 0), py);
  root.rotation.y = v.yaw;
  const spin = fxOn(u, 'spin');
  animHero(v.rig, {
    move: u.dead ? 0 : clamp01(v.spd / 140), atk: W.t - u.atkT < 0.42 ? W.t - u.atkT : -1, cast: u.castT && W.t - u.castT < 0.45 ? W.t - u.castT : -1,
    stun: !u.dead && !!fxOn(u, 'stun'), dead: deadT, spin: !!spin,
  }, R3.t + u.id * 0.37);
  // 受击闪白、隐身半透明、死后变暗
  const mat = v.rig.mats.lit;
  const fl = W.t - (u.flashT || -9) < 0.07 ? 0.55 : 0;
  mat.emissive.setRGB(fl, fl, fl);
  const inv = !!fxOn(u, 'invis');
  const op = inv ? 0.42 : u.dead ? Math.max(0, 1 - deadT / 1.6) : 1;
  if (op < 1 !== mat.transparent) { mat.transparent = op < 1; mat.needsUpdate = true; }
  mat.opacity = op;
  if (v.rig.mats.glow) v.rig.mats.glow.opacity = op;
  // 脚下的圈：自己金色、队友蓝、敌人红
  const ring = v.ring;
  ring.mesh.visible = !u.dead;
  const isMe = me && u.id === me.id;
  ring.mesh.material.color.set(isMe ? '#7CFF6A' : TEAM_RING[u.team]);
  ring.mesh.material.opacity = isMe ? 0.95 : 0.75;
  placeDecal(ring, px, py, isMe ? 92 : 84, null, 0, 3);
  // 护盾：一个半透明的泡泡
  const sh = !u.dead && shieldOf(u) > 0;
  if (sh && !v.shield) {
    v.shield = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12), new THREE.MeshBasicMaterial({ color: '#FFE89A', transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending }));
    R3.scene.add(v.shield);
  }
  if (v.shield) {
    v.shield.visible = sh;
    if (sh) { v.shield.position.set(px, gh + 62, py); v.shield.scale.set(64, 76, 64); v.shield.material.opacity = 0.16 + 0.06 * Math.sin(R3.t * 6); }
  }
  // 眩晕：头顶转圈的星星
  const st = !u.dead && fxOn(u, 'stun');
  if (st && !v.stars) {
    v.stars = new THREE.Group();
    for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(new THREE.OctahedronGeometry(6, 0), new THREE.MeshBasicMaterial({ color: '#FFE45C' })); v.stars.add(s); }
    R3.scene.add(v.stars);
  }
  if (v.stars) {
    v.stars.visible = !!st;
    if (st) { v.stars.position.set(px, gh + (u.z || 0) + 150, py); v.stars.children.forEach((s, i) => { const a = R3.t * 5 + i * 2.09; s.position.set(Math.cos(a) * 22, Math.sin(R3.t * 7 + i) * 3, Math.sin(a) * 22); s.rotation.y = R3.t * 4; }); }
  }
  // 被冻住 / 缠住：脚下一圈
  const rt = !u.dead && fxOn(u, 'root');
  if (rt) { if (!v.extra) v.extra = decal('ring', '#9CE8FF', { add: true }); placeDecal(v.extra, px, py, 70 + Math.sin(R3.t * 10) * 4, null, 0, 4); v.extra.mesh.visible = true; }
  else if (v.extra) { freeDecal(v.extra); v.extra = null; }
  // 回城：一根蓝色光柱
  if (!u.dead && u.recall) {
    if (!v.recall) {
      v.recall = new THREE.Mesh(new THREE.CylinderGeometry(48, 48, 260, 20, 1, true), new THREE.MeshBasicMaterial({ color: '#7FB4FF', transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
      R3.scene.add(v.recall);
    }
    const k = clamp01((W.t - u.recall) / RECALL_T);
    v.recall.visible = true; v.recall.position.set(px, gh + 130, py); v.recall.scale.set(1 - k * 0.4, 0.3 + k * 0.7, 1 - k * 0.4);
    if (Math.random() < 0.5) part(true, u.x + (Math.random() - 0.5) * 70, gh + 10, u.y + (Math.random() - 0.5) * 70, 0, 120 + k * 120, 0, 0.8, 18, '#9CC8FF', 0);
  } else if (v.recall) v.recall.visible = false;
  // 红蓝 buff：身上冒一点红 / 蓝的火星
  if (!u.dead && Math.random() < 0.25) {
    if (fxOn(u, 'red')) part(true, u.x + (Math.random() - 0.5) * 40, gh + 20 + Math.random() * 60, u.y + (Math.random() - 0.5) * 40, 0, 60, 0, 0.6, 16, '#FF5A3A', 0);
    if (fxOn(u, 'blue')) part(true, u.x + (Math.random() - 0.5) * 40, gh + 20 + Math.random() * 60, u.y + (Math.random() - 0.5) * 40, 0, 60, 0, 0.6, 16, '#4AB8FF', 0);
  }
  if (spin && Math.random() < 0.8) {           // 旋风斩
    const a = Math.random() * Math.PI * 2;
    part(true, u.x + Math.cos(a) * 110, gh + 30 + Math.random() * 40, u.y + Math.sin(a) * 110, -Math.sin(a) * 400, 20, Math.cos(a) * 400, 0.25, 26, '#CFE8FF', 0);
  }
  if (u.dash && Math.random() < 0.9) part(true, u.x, gh + 50, u.y, 0, 0, 0, 0.3, 40, u.hid === 'assassin' ? '#B07CFF' : '#E8E0C8', 0, -0.6);
}

/* ---------- 野怪 ---------- */
const MON_SCALE = { blue: 1.15, red: 1.15, wolf: 1.2, bird: 1.2, golem: 1.15, drake: 1.05, lord: 1.05 };
function syncMonster(W, u, v, dt) {
  const root = v.rig.root;
  const deadT = u.dead ? W.t - (u.dieT || W.t) : -1;
  root.visible = !u.dead || deadT < 1.2;
  if (!root.visible) return;
  faceYaw(W, u, v, dt);
  if (v.spd < 5 && !u.aggro && !u.dead) {       // 没事的时候朝营地外面（朝地图中间）
    v.yaw = angLerp(v.yaw, Math.atan2(L / 2 - u.x, L / 2 - u.y), 0.02);
  }
  const P = ip(u);
  root.position.set(P[0], groundH(P[0], P[1]) - (u.dead ? deadT * 20 : 0), P[1]);
  root.rotation.y = v.yaw;
  animMonster(v.rig, { move: clamp01(v.spd / 150), atk: W.t - u.atkT < 0.5 ? W.t - u.atkT : -1, dead: deadT }, R3.t + u.id);
  const mat = v.rig.mats.lit;
  const fl = W.t - (u.flashT || -9) < 0.07 ? 0.5 : 0;
  mat.emissive.setRGB(fl, fl, fl);
  const op = u.dead ? Math.max(0, 1 - deadT / 1.2) : u.reset ? 0.6 : 1;
  if (op < 1 !== mat.transparent) { mat.transparent = op < 1; mat.needsUpdate = true; }
  mat.opacity = op;
}

/* ---------- 小兵（实例化） ---------- */
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p3 = new THREE.Vector3(), _s3 = new THREE.Vector3(), _lm = new THREE.Matrix4(), _fm = new THREE.Matrix4();
function syncMinions(W, dt) {
  for (const k in R3.minion) R3.minion[k].n = 0;
  R3.blob.n = 0;
  const [x0, y0, x1, y1] = R3.view;
  const seen = new Set();
  const put = (u, yaw, ph, mv, fall, sink) => {
    const ent = R3.minion[u.mt + u.team];
    if (!ent || ent.n >= ent.max) return;
    const i = ent.n++;
    const P = u.kind === 'minion' ? ip(u) : [u.x, u.y], ux = P[0], uy = P[1];
    const gh = groundH(ux, uy) - sink;
    const bob = Math.abs(Math.sin(ph)) * 2.5 * mv;
    if (R3.blob.n < R3.blob.max && sink < 1) {
      const sz = u.mt === 'vanguard' ? 120 : u.mt === 'siege' ? 80 : u.mt === 'super' ? 70 : 52;
      _m4.makeScale(sz, 1, sz); _m4.setPosition(ux + 6, groundH(ux, uy) + 1.5, uy - 4);
      R3.blob.mesh.setMatrixAt(R3.blob.n++, _m4);
    }
    _e.set(fall, yaw, 0, 'YXZ'); _q.setFromEuler(_e);
    _p3.set(ux, gh + bob, uy); _s3.set(MSCALE, MSCALE, MSCALE);
    _m4.compose(_p3, _q, _s3);
    ent.meshes[0].setMatrixAt(i, _m4);
    for (let j = 0; j < 2; j++) {
      const sw = Math.sin(ph + j * Math.PI) * 0.7 * mv;
      const pv = ent.pivot[j];
      _lm.makeRotationX(u.mt === 'siege' ? ph * 1.5 : sw);
      _lm.setPosition(pv.x, pv.y, pv.z);
      _fm.multiplyMatrices(_m4, _lm);
      ent.meshes[1 + j].setMatrixAt(i, _fm);
    }
  };
  for (const u of W.units) {
    if (u.kind !== 'minion' || u.dead) continue;
    if (u.x < x0 || u.x > x1 || u.y < y0 || u.y > y1) { R3.mcache.delete(u.id); continue; }
    let c = R3.mcache.get(u.id);
    if (!c) { c = { lx: u.x, ly: u.y, yaw: u.team ? Math.PI * 0.75 : -Math.PI * 0.25, spd: 0, ph: Math.random() * 6 }; R3.mcache.set(u.id, c); }
    faceYaw(W, u, c, dt);
    const mv = clamp01(c.spd / 120);
    c.ph += dt * 10 * mv;
    let atkLean = 0;
    if (W.t - u.atkT < 0.3) atkLean = Math.sin((W.t - u.atkT) / 0.3 * Math.PI) * 0.25;
    put(u, c.yaw, c.ph, mv, atkLean, 0);
    seen.add(u.id);
  }
  // 死掉的小兵：往后倒、沉下去
  for (let i = R3.corpses.length - 1; i >= 0; i--) {
    const c = R3.corpses[i];
    c.t += dt;
    if (c.t > 0.9) { R3.corpses.splice(i, 1); continue; }
    put(c, c.yaw, 0, 0, -Math.min(1, c.t / 0.35) * 1.4, Math.max(0, c.t - 0.45) * 60);
  }
  for (const k in R3.minion) {
    const ent = R3.minion[k];
    for (const m of ent.meshes) { m.count = ent.n; m.visible = ent.n > 0; m.instanceMatrix.needsUpdate = true; }
  }
  R3.blob.mesh.count = R3.blob.n; R3.blob.mesh.visible = R3.blob.n > 0; R3.blob.mesh.instanceMatrix.needsUpdate = true;
  if (R3.mcache.size > 400) for (const id of R3.mcache.keys()) if (!seen.has(id)) R3.mcache.delete(id);
}
function minionDiedVis(e) {
  const c = R3.mcache.get(e.id);
  R3.corpses.push({ x: e.x, y: e.y, mt: e.mt, team: e.team, yaw: c ? c.yaw : 0, t: 0 });
  R3.mcache.delete(e.id);
}

/* ---------- 塔、水晶 ---------- */
function syncStruct(W, u, s, me) {
  const v = s.vis;
  if (u.dead) {
    if (!s.fallen) {
      s.fallen = W.t;
      if (u.kind === 'tower') { s.rubble = buildRubble(u.team); s.rubble.position.set(u.x, 0, u.y); s.rubble.scale.setScalar(1.25); R3.scene.add(s.rubble); }
    }
    const k = (W.t - s.fallen) / 1.4;
    if (k < 1) { v.root.position.y = -k * k * 260; v.root.rotation.z = k * 0.25; v.root.visible = true; if (Math.random() < 0.6) burst3(u.x, u.y, 2, ['#B8B2A6', '#8A8478'], { add: false, spd: 160, up: 120, life: 0.8, size: 34, spread: 90 }); }
    else v.root.visible = false;
    return;
  }
  const t = R3.t + u.id;
  const firing = W.t - u.atkT < 0.25;
  if (u.kind === 'tower') {
    v.orb.rotation.y = t * 0.8; v.orb.rotation.x = t * 0.5;
    v.orb.position.y = v.top + Math.sin(t * 2) * 4;
    v.halo.position.y = v.orb.position.y;
    v.halo.scale.setScalar(firing ? 1.35 : 1 + Math.sin(t * 3) * 0.05);
    v.orb.material.emissiveIntensity = firing ? 1.4 : 0.85;
  } else {
    v.gem.rotation.y = t * 0.5;
    v.gem.position.y = 175 + Math.sin(t * 1.5) * 8;
    v.halo.position.y = v.gem.position.y;
    v.ring.rotation.z = t * 0.7; v.ring2.rotation.z = -t * 1.1;
    v.halo.scale.setScalar(firing ? 1.25 : 1 + Math.sin(t * 2) * 0.04);
  }
  // 受伤闪一下
  const fl = W.t - (u.flashT || -9) < 0.07;
  v.body.material = fl ? (R3.flashMat || (R3.flashMat = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: '#666666' }))) : VCOL();
}

/* ---------- 弹道 ---------- */
const PROJ_LOOK = {
  tower: { col: '#FFFFFF', size: 18, glow: 46 }, crystal: { col: '#FFFFFF', size: 22, glow: 56 },
  arrow: { col: '#E8FFE8', size: 0, arrow: 1 }, orb: { col: '#B8A0FF', size: 10, glow: 30 }, heart: { col: '#FF8CC0', size: 9, glow: 28 },
  bolt: { col: '#9CC8FF', size: 7, glow: 22 }, shell: { col: '#3A3A44', size: 11, glow: 0 }, fireball: { col: '#FFB040', size: 20, glow: 70 },
  bigarrow: { col: '#E8FFE8', size: 0, arrow: 2.6 }, vine: { col: '#7CE07C', size: 9, glow: 34 },
};
// 同一种弹道共用几何体和材质（池子里的每一个只是一组网格）
const PROJ_RES = {};
function projRes(key, vis, team) {
  if (PROJ_RES[key]) return PROJ_RES[key];
  const L2 = PROJ_LOOK[vis] || PROJ_LOOK.bolt;
  const tc = vis === 'tower' || vis === 'crystal' || vis === 'bolt' ? (team ? '#FF7A6A' : '#7AC0FF') : L2.col;
  const parts = [];
  if (L2.arrow) {
    const s = L2.arrow;
    parts.push({ geo: new THREE.BoxGeometry(2 * s, 2 * s, 44 * s), mat: new THREE.MeshBasicMaterial({ color: '#F4E6C8' }) });
    parts.push({ geo: new THREE.ConeGeometry(4 * s, 12 * s, 4).rotateX(Math.PI / 2).translate(0, 0, 26 * s), mat: new THREE.MeshBasicMaterial({ color: '#E8F8FF' }) });
    parts.push({ geo: new THREE.BoxGeometry(6 * s, 6 * s, 60 * s), mat: new THREE.MeshBasicMaterial({ color: '#B8FFD8', transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }) });
  } else {
    if (L2.size) parts.push({ geo: new THREE.IcosahedronGeometry(L2.size, 1), mat: vis === 'shell' ? new THREE.MeshLambertMaterial({ color: L2.col }) : new THREE.MeshBasicMaterial({ color: '#FFFFFF' }) });
    if (L2.glow) parts.push({ geo: new THREE.PlaneGeometry(1, 1), mat: new THREE.MeshBasicMaterial({ map: decalTex('dot'), color: tc, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), bill: L2.glow * 2 });
  }
  return (PROJ_RES[key] = { parts, L2, tc });
}
function projObj(vis, team) {
  const key = vis + (vis === 'tower' || vis === 'crystal' || vis === 'bolt' ? team : '');
  const list = R3.pool[key] || (R3.pool[key] = []);
  let o = list.find(x => !x.userData.busy);
  if (!o) {
    const res = projRes(key, vis, team);
    o = new THREE.Group();
    for (const p of res.parts) {
      const m = new THREE.Mesh(p.geo, p.mat);
      if (p.bill) { m.scale.setScalar(p.bill); m.userData.bill = true; }
      o.add(m);
    }
    o.userData.look = res.L2; o.userData.tc = res.tc;
    R3.scene.add(o);
    list.push(o);
  }
  o.userData.busy = true; o.visible = true;
  return o;
}
const _camQ = new THREE.Quaternion(), _qi = new THREE.Quaternion();
function syncProjs(W, dt) {
  const alive = new Set();
  _camQ.copy(S3.cam.quaternion);
  for (const p of W.projs) {
    if (p.dead) continue;
    alive.add(p.id);
    let e = R3.projs.get(p.id);
    if (!e) {
      const src = byId(W, p.src);
      const h0 = p.vis === 'tower' ? 236 * 1.25 : p.vis === 'crystal' ? 210 : src && src.kind === 'hero' ? 70 : 50;
      const off0 = p.vis === 'tower' ? 90 : p.vis === 'crystal' ? 110 : 14;
      const t = p.tid ? byId(W, p.tid) : null;
      e = { obj: projObj(p.vis, p.team), h0, off0, d0: t ? Math.max(1, Math.hypot(t.x - p.x, t.y - 14 - p.y)) : 1 };
      R3.projs.set(p.id, e);
    }
    let vz = p.y + 14, h = 55;
    if (p.kind === 'home') {
      const t = byId(W, p.tid);
      const d = t ? Math.hypot(t.x - p.x, t.y - 14 - p.y) : 0;
      const f = clamp01(d / e.d0);
      vz = p.y + e.off0 * f + 14 * (1 - f);
      const th = t ? (t.kind === 'hero' ? 60 : t.kind === 'minion' ? 40 : 60) : 50;
      h = th + (e.h0 - th) * f + Math.sin(f * Math.PI) * (p.vis === 'shell' ? 80 : 20);
    } else if (p.vis === 'bigarrow') h = 70;
    const o = e.obj;
    const PP = ip(p), pxx = PP[0], vzz = vz + (PP[1] - p.y);
    o.position.set(pxx, groundH(pxx, vzz) + h, vzz);
    const dir = p.kind === 'home' ? (p.ang != null ? p.ang : 0) : Math.atan2(p.dy, p.dx);
    o.rotation.set(0, Math.atan2(Math.cos(dir), Math.sin(dir)), 0);
    _qi.setFromEuler(o.rotation).invert();
    for (const c of o.children) if (c.userData.bill) c.quaternion.copy(_camQ).premultiply(_qi);
    // 拖尾
    const L2 = o.userData.look;
    if (p.vis === 'fireball') { part(true, p.x, o.position.y, vz, (Math.random() - 0.5) * 40, 20, (Math.random() - 0.5) * 40, 0.4, 46, Math.random() < 0.5 ? '#FF6A2A' : '#FFC040', -60, -0.5); }
    else if (p.vis === 'vine') part(false, p.x, o.position.y, vz, 0, 0, 0, 0.35, 18, '#4EB04E', 0, -0.4);
    else if (L2.glow && Math.random() < 0.7) part(true, p.x, o.position.y, vz, 0, 0, 0, 0.22, L2.glow * 0.6, o.userData.tc, 0, -0.7);
    else if (L2.arrow && Math.random() < 0.6) part(true, p.x, o.position.y, vz, 0, 0, 0, 0.2, 14 * L2.arrow, '#C8FFE0', 0, -0.6);
  }
  for (const [id, e] of R3.projs) if (!alive.has(id)) { e.obj.visible = false; e.obj.userData.busy = false; R3.projs.delete(id); }
}

/* ---------- 特效（事件触发，自己按时间演完） ---------- */
// f：{ t0, dur, step(f, k, dt), end(f) }
function addFx3(dur, step, end, o) { const f = Object.assign({ t0: R3.t, dur, step, end }, o || {}); R3.fx.push(f); return f; }
function endFx(f) { if (f.end) f.end(f); if (f.decals) f.decals.forEach(freeDecal); if (f.objs) f.objs.forEach(o => R3.scene.remove(o)); }
function stepFx(dt) {
  for (let i = R3.fx.length - 1; i >= 0; i--) {
    const f = R3.fx[i], k = (R3.t - f.t0) / f.dur;
    if (k >= 1) { endFx(f); R3.fx.splice(i, 1); continue; }
    f.step(f, k, dt);
  }
}
function fxRing(x, y, r, col, dur, o) {        // 往外扩的圈
  o = o || {};
  const d = decal(o.kind || 'ring', col, { add: true });
  addFx3(dur, (f, k) => { placeDecal(d, x, y, 2 * r * (o.from == null ? 0.3 + 0.7 * Math.sqrt(k) : o.from + (1 - o.from) * k)); d.mesh.material.opacity = (o.op || 1) * (1 - k); }, null, { decals: [d] });
}
function fxFlashDisc(x, y, r, col, dur) {
  const d = decal('soft', col, { add: true });
  addFx3(dur, (f, k) => { placeDecal(d, x, y, 2 * r * (0.6 + 0.4 * k)); d.mesh.material.opacity = 0.9 * (1 - k); }, null, { decals: [d] });
}
function fxSlash(x, y, dx, dy, r, col, dur) {
  const d = decal('slash', col, { add: true });
  const yaw = Math.atan2(dx, dy);
  addFx3(dur, (f, k) => {
    placeDecal(d, x + dx * r * 0.42, y + dy * r * 0.42, r * 1.25 * (0.8 + 0.3 * k), r * 1.05, yaw + Math.PI, 30);
    d.mesh.material.opacity = 1 - k;
  }, null, { decals: [d] });
}
function fxBeam(x1, y1, h1, x2, y2, h2, col, dur, w) {
  const geo = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true);
  geo.translate(0, 0.5, 0); geo.rotateX(Math.PI / 2);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  const a = new THREE.Vector3(x1, groundH(x1, y1) + h1, y1), b = new THREE.Vector3(x2, groundH(x2, y2) + h2, y2);
  m.position.copy(a); m.lookAt(b);
  const len = a.distanceTo(b);
  R3.scene.add(m);
  addFx3(dur, (f, k) => { const ww = (w || 8) * (1 - k * 0.6); m.scale.set(ww, ww, len); m.material.opacity = 0.9 * (1 - k); }, () => { geo.dispose(); m.material.dispose(); }, { objs: [m] });
}
function fxDome(x, y, r, col, dur) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  m.position.set(x, groundH(x, y), y);
  R3.scene.add(m);
  addFx3(dur, (f, k) => { const s = r * (0.3 + 0.7 * Math.sqrt(k)); m.scale.set(s, s * 0.55, s); m.material.opacity = 0.35 * (1 - k); }, () => { m.geometry.dispose(); m.material.dispose(); }, { objs: [m] });
}
let _iceGeo = null;
function fxIce(x, y, r) {
  if (!_iceGeo) {
    const parts = [], R = prng(77);
    for (let i = 0; i < 16; i++) {
      const a = R() * Math.PI * 2, d = Math.sqrt(R()) * 0.85, s = 0.18 + R() * 0.2;
      const g = new THREE.ConeGeometry(s * 0.45, s * 2.4, 5);
      g.translate(0, s * 1.2, 0);
      g.rotateX((R() - 0.5) * 0.6); g.rotateZ((R() - 0.5) * 0.6);
      g.translate(Math.cos(a) * d, 0, Math.sin(a) * d);
      parts.push([g, new THREE.Color(R() < 0.5 ? '#BFF2FF' : '#7FD8F8'), new THREE.Matrix4()]);
    }
    _iceGeo = mergeParts(parts);
  }
  const m = new THREE.Mesh(_iceGeo, new THREE.MeshLambertMaterial({ vertexColors: true, emissive: '#4AA8D8', emissiveIntensity: 0.5, transparent: true }));
  m.position.set(x, groundH(x, y), y);
  R3.scene.add(m);
  const d = decal('disc', '#9CE8FF', { add: true });
  addFx3(1.3, (f, k) => {
    const g = k < 0.12 ? k / 0.12 : 1;
    m.scale.set(r, r * g * (k > 0.75 ? 1 - (k - 0.75) * 4 : 1), r);
    m.material.opacity = k > 0.75 ? 1 - (k - 0.75) * 4 : 1;
    placeDecal(d, x, y, r * 2); d.mesh.material.opacity = 0.6 * (1 - k);
  }, () => m.material.dispose(), { objs: [m], decals: [d] });
}
function fxCrack(x, y, r, dur) {
  const d = decal('crack', '#ffffff');
  addFx3(dur, (f, k) => { placeDecal(d, x, y, r * 2.1); d.mesh.material.opacity = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3; }, null, { decals: [d] });
}
// 流星：从天上斜着砸下来（按地面效果的倒计时走）
function syncZones(W) {
  const seen = new Set();
  for (const z of W.zones) {
    seen.add(z.id);
    let e = R3.zoneVis && R3.zoneVis.get(z.id);
    if (!R3.zoneVis) R3.zoneVis = new Map();
    if (!e) {
      e = { warn: decal(z.vis === 'frost' ? 'disc' : 'ring', z.vis === 'frost' ? '#9CE8FF' : '#FF7A2A', { add: true }) };
      if (z.vis === 'meteor') {
        const m = new THREE.Mesh(new THREE.IcosahedronGeometry(28, 1), new THREE.MeshBasicMaterial({ color: '#FFD070' }));
        R3.scene.add(m); e.rock = m;
      }
      R3.zoneVis.set(z.id, e);
    }
    const k = clamp01((W.t - z.t0) / z.delay);
    placeDecal(e.warn, z.x, z.y, 2 * z.r * (z.vis === 'frost' ? 0.4 + 0.6 * k : 1));
    e.warn.mesh.material.opacity = z.vis === 'frost' ? 0.25 + 0.35 * k : 0.35 + 0.5 * k;
    if (e.rock) {
      const h = (1 - k) * 900, ox = (1 - k) * -260;
      const gh = groundH(z.x, z.y);
      e.rock.position.set(z.x + ox, gh + h, z.y - (1 - k) * 200);
      e.rock.visible = k > 0.05;
      if (k > 0.05) for (let i = 0; i < 2; i++) part(true, e.rock.position.x, e.rock.position.y, e.rock.position.z, (Math.random() - 0.5) * 60, 40, (Math.random() - 0.5) * 60, 0.35, 60, Math.random() < 0.5 ? '#FF6A2A' : '#FFC040', 0, -0.5);
    }
  }
  if (R3.zoneVis) for (const [id, e] of R3.zoneVis) if (!seen.has(id)) { freeDecal(e.warn); if (e.rock) { R3.scene.remove(e.rock); e.rock.geometry.dispose(); } R3.zoneVis.delete(id); }
}

// 对局事件 → 三维特效（main.js 的 handleEvents 调）
function fx3Event(W, e) {
  const gh = (x, y) => groundH(x, y);
  switch (e.k) {
    case 'ring': fxRing(e.x, e.y, e.r, '#DDE8FF', 0.35); burst3(e.x, e.y, 14, ['#DDE8FF', '#FFFFFF'], { spd: 220, up: 40, life: 0.4, size: 20, grav: 0 }); break;
    case 'slash': fxSlash(e.x, e.y, e.dx, e.dy, e.r, e.col === 'gold' ? '#FFD86A' : '#FFFFFF', 0.32); burst3(e.x + e.dx * e.r * 0.6, e.y + e.dy * e.r * 0.6, 12, ['#FFE08A', '#FFFFFF'], { spd: 200, up: 60, life: 0.35, size: 20, grav: 0 }); break;
    case 'quake': fxRing(e.x, e.y, e.r, '#FFE070', 0.45); fxCrack(e.x, e.y, e.r * 0.8, 1.6); burst3(e.x, e.y, 40, ['#B89A6A', '#8A6A4A', '#D8C8A8'], { add: false, spd: 300, up: 260, life: 0.8, size: 34 }); burst3(e.x, e.y, 16, ['#FFE070'], { spd: 260, up: 120, life: 0.5, size: 26 }); break;
    case 'land': fxRing(e.x, e.y, e.r, '#FFFFFF', 0.4); burst3(e.x, e.y, 22, ['#C8B08A', '#E8E0D0'], { add: false, spd: 220, up: 120, life: 0.6, size: 30 }); break;
    case 'boom': fxFlashDisc(e.x, e.y, e.r, '#FF8A3A', 0.35); fxRing(e.x, e.y, e.r, '#FFB040', 0.35); burst3(e.x, e.y, 26, ['#FF5A2A', '#FFB040', '#FFE070'], { spd: 260, up: 200, life: 0.55, size: 40, h: 50 }); burst3(e.x, e.y, 10, ['#5A4A40', '#3A302A'], { add: false, spd: 120, up: 160, life: 0.9, size: 40, grav: -40, grow: 1 }); break;
    case 'ice': fxIce(e.x, e.y, e.r); burst3(e.x, e.y, 26, ['#9CE8FF', '#FFFFFF', '#5FB4E8'], { spd: 200, up: 160, life: 0.7, size: 22 }); break;
    case 'meteorArea': {
      const d = decal('dash', '#FF8A3A', { add: true });
      addFx3(e.dur, (f, k) => { placeDecal(d, e.x, e.y, e.r * 2); d.mesh.material.opacity = 0.7 * (k > 0.85 ? (1 - k) / 0.15 : 1); }, null, { decals: [d] });
      break;
    }
    case 'meteorHit': fxFlashDisc(e.x, e.y, e.r, '#FF7A2A', 0.3); fxCrack(e.x, e.y, e.r * 0.7, 1.0); burst3(e.x, e.y, 18, ['#FF5A2A', '#FFB040', '#FFE070'], { spd: 220, up: 220, life: 0.5, size: 36 }); burst3(e.x, e.y, 8, ['#5A3A2A', '#3A2A20'], { add: false, spd: 200, up: 240, life: 0.8, size: 22 }); break;
    case 'dome': fxDome(e.x, e.y, e.r, '#FFE89A', 0.9); fxRing(e.x, e.y, e.r, '#FFE070', 0.6); burst3(e.x, e.y, 40, ['#FFE070', '#FFFFFF', '#FFD0E0'], { spd: 300, up: 140, grav: 40, life: 0.8, size: 24 }); break;
    case 'heal': { const u = e.id ? byId(W, e.id) : null; const x = u ? u.x : e.x, y = u ? u.y : e.y; fxRing(x, y, 90, '#7CFF7C', 0.5); burst3(x, y, 16, ['#7CFF7C', '#C8FFC8'], { spd: 50, up: 200, grav: 0, life: 0.9, size: 22, h: 10 }); break; }
    case 'healbeam': { const t = byId(W, e.id2); fxBeam(e.x, e.y, 70, t ? t.x : e.x2, t ? t.y : e.y2, 70, '#8EF08E', 0.45, 10); burst3(e.x2, e.y2, 12, ['#7CFF7C', '#C8FFC8'], { spd: 40, up: 180, grav: 0, life: 0.8, size: 22 }); break; }
    case 'bonk': burst3(e.x, e.y, 14, ['#FFE45C', '#FFFFFF'], { spd: 200, up: 200, life: 0.5, size: 22, h: 80 }); fxRing(e.x, e.y, 70, '#FFE45C', 0.3); break;
    case 'smoke': burst3(e.x, e.y, 30, ['#56586E', '#8A8FA0', '#33343F'], { add: false, spd: 120, up: 60, grav: -30, life: 1.0, size: 50, grow: 1.2, h: 40 }); break;
    case 'blink': case 'flash': {
      const cols = e.k === 'flash' ? ['#FFF4A0', '#FFFFFF', '#FFD84A'] : ['#B07CFF', '#E8D8FF', '#4A2E8A'];
      burst3(e.x, e.y, 18, cols, { spd: 160, up: 120, life: 0.45, size: 26, h: 50 });
      burst3(e.x2, e.y2, 22, cols, { spd: 200, up: 120, life: 0.5, size: 28, h: 50 });
      fxBeam(e.x, e.y, 60, e.x2, e.y2, 60, e.k === 'flash' ? '#FFF0A0' : '#C8A0FF', 0.25, 14);
      break;
    }
    case 'cut': { const a = e.n * 2.1; fxSlash(e.x - Math.cos(a) * 40, e.y - Math.sin(a) * 40, Math.cos(a), Math.sin(a), 110, '#E8D0FF', 0.2); burst3(e.x, e.y, 8, ['#FFFFFF', '#C8A0FF'], { spd: 200, up: 80, life: 0.25, size: 18, h: 60 }); break; }
    case 'recallDone': fxRing(e.x2, e.y2, 110, '#7FB4FF', 0.6); burst3(e.x2, e.y2, 24, ['#7FB4FF', '#FFFFFF'], { spd: 60, up: 260, grav: 0, life: 0.8, size: 24 }); break;
    case 'springHeal': if (Math.random() < 0.5) burst3(e.x, e.y, 3, ['#7CFF7C'], { spd: 20, up: 140, grav: 0, life: 0.7, size: 18, h: 10 }); break;
    case 'springShot': { const sp = e.x < L / 2 ? SPRING_VIS : mir(SPRING_VIS); fxBeam(sp[0], sp[1], 140, e.x2, e.y2, 50, '#FFFFFF', 0.22, 12); break; }
  }
  void gh;
}
// 其它事件：死亡、升级、复活、放技能
function fx3Unit(W, e) {
  if (e.t === 'die') {
    if (e.kind === 'minion') { minionDiedVis(e); burst3(e.x, e.y, 6, [e.team ? '#FF8A7A' : '#8AC0FF', '#FFFFFF'], { spd: 90, up: 120, life: 0.45, size: 16 }); }
    else if (e.kind === 'hero') { burst3(e.x, e.y, 30, ['#FFFFFF', e.team ? '#FF8A7A' : '#8AC0FF'], { spd: 120, up: 260, grav: -40, life: 1.2, size: 26 }); }
    else if (e.kind === 'monster') burst3(e.x, e.y, 22, ['#F2A03A', '#FFE070', '#FFFFFF'], { spd: 160, up: 200, life: 0.8, size: 26 });
    else if (e.kind === 'tower' || e.kind === 'crystal') {
      fxFlashDisc(e.x, e.y, 260, '#FFFFFF', 0.5); fxRing(e.x, e.y, 380, e.team ? '#FF8A7A' : '#8AC0FF', 0.8);
      burst3(e.x, e.y, 60, ['#B8B2A6', '#8A8478', '#E8E0D0'], { add: false, spd: 320, up: 360, life: 1.4, size: 44, h: 120, spread: 80 });
      burst3(e.x, e.y, 40, [e.team ? '#FF7A6A' : '#7AC0FF', '#FFFFFF'], { spd: 300, up: 300, life: 1.0, size: 34, h: 200 });
    }
  } else if (e.t === 'lvl') {
    const h = byId(W, e.id); if (!h) return;
    fxRing(h.x, h.y, 100, '#FFE070', 0.6);
    burst3(h.x, h.y, 20, ['#FFE070', '#FFF6C0'], { spd: 40, up: 260, grav: 0, life: 0.9, size: 22, h: 10 });
  } else if (e.t === 'respawn') {
    const h = byId(W, e.id); if (!h) return;
    fxRing(h.x, h.y, 100, '#9CF09C', 0.7);
    burst3(h.x, h.y, 16, ['#9CF09C', '#FFFFFF'], { spd: 40, up: 220, grav: 0, life: 0.8, size: 22, h: 10 });
  } else if (e.t === 'cast') {
    const h = byId(W, e.id); if (!h) return;
    if (e.sid === 'a1' || e.sid === 't1' || e.sid === 's2') burst3(h.x, h.y, 10, ['#E8E0D0', '#C8B8A0'], { add: false, spd: 120, up: 60, life: 0.45, size: 26, h: 8 });
  }
}

/* ---------- 技能瞄准：地上的范围圈、方向箭头、落点圈 ---------- */
function syncAim(me, aim) {
  if (!R3.aimG) R3.aimG = { range: null, arrow: null, spot: null, tgt: null };
  const A = R3.aimG;
  const hide = () => { for (const k in A) if (A[k]) { freeDecal(A[k]); A[k] = null; } };
  if (!aim || !me || me.dead) { hide(); return; }
  const col = aim.cancel ? '#FF4A4A' : '#9CD8FF';
  const need = (k, kind) => { if (!A[k]) A[k] = decal(kind, col, { op: 0.9 }); A[k].mesh.material.color.set(col); return A[k]; };
  const drop = k => { if (A[k]) { freeDecal(A[k]); A[k] = null; } };
  const flash = aim.s === 'flash';
  const def = flash ? { aim: 'dir', range: FLASH_DIST } : sdef(me, aim.s);
  const range = def.range;
  if (range < 2000) placeDecal(need('range', 'dash'), me.x, me.y, range * 2 + (def.aim === 'self' ? 0 : 60));
  else drop('range');
  const dx = aim.dx, dy = aim.dy;
  if (def.aim === 'dir') {
    const len = Math.min(range, 1800), w = flash ? 60 : (def.id === 's1' ? 120 : def.id === 's3' ? 110 : def.id === 'w3' ? 180 : 80);
    const a = need('arrow', 'arrow');
    placeDecal(a, me.x + dx * len / 2, me.y + dy * len / 2, w, len, Math.atan2(dx, dy) + Math.PI, 5);
    a.mesh.material.opacity = 0.85;
    drop('spot'); drop('tgt');
  } else if (def.aim === 'point') {
    const r = def.rad || 120, d = aim.mag * range;
    placeDecal(need('spot', 'disc'), me.x + dx * d, me.y + dy * d, r * 2);
    drop('arrow'); drop('tgt');
  } else if (def.aim === 'unit') {
    drop('arrow'); drop('spot');
    if (aim.tgt) placeDecal(need('tgt', 'ring'), aim.tgt.x, aim.tgt.y, 110); else drop('tgt');
  } else { drop('arrow'); drop('spot'); drop('tgt'); }
}

/* ---------- 每帧 ---------- */
// follow：镜头跟谁；me：玩家（可能为空）；aim：正在瞄的技能（INP.aim）
function render3D(W, follow, me, dt, aim) {
  R3.t += dt;
  R3.W = W; R3.me = me;
  S3.uWind.value = R3.t;
  if (S3.water) S3.water.material.uniforms.uT.value = R3.t;
  // 镜头
  const FP = follow ? ip(follow) : null;
  let tx = FP ? FP[0] : R3.camX, ty = FP ? FP[1] : R3.camY;
  if (R3.peek) { tx = R3.peek[0]; ty = R3.peek[1]; }
  else if (R3.aimCam) { tx += R3.aimCam[0]; ty += R3.aimCam[1]; }
  const kk = R3.peek ? 1 - Math.exp(-dt * 16) : R3.aimCam ? 1 - Math.exp(-dt * 8) : 1 - Math.exp(-dt * 22);
  R3.camX += (tx - R3.camX) * kk; R3.camY += (ty - R3.camY) * kk;
  R3.camX = clamp(R3.camX, 300, L - 300); R3.camY = clamp(R3.camY, 380, L - 200);
  R3.shake = Math.max(0, R3.shake - dt * 18);
  const sh = R3.shake > 0 ? [(Math.random() - 0.5) * R3.shake * 3, (Math.random() - 0.5) * R3.shake * 3] : null;
  placeCamera(R3.camX, R3.camY, sh);
  S3.cam.updateMatrixWorld();
  // 看得见的范围（地面上的外框，放宽一点）
  const c1 = screenToGround(0, 0) || [R3.camX - 1500, R3.camY - 1500], c2 = screenToGround(S3.w, 0) || [R3.camX + 1500, R3.camY - 1500];
  const c3 = screenToGround(0, S3.h) || [R3.camX - 1000, R3.camY + 600], c4 = screenToGround(S3.w, S3.h) || [R3.camX + 1000, R3.camY + 600];
  R3.view = [Math.min(c1[0], c3[0]) - 250, Math.min(c1[1], c2[1]) - 250, Math.max(c2[0], c4[0]) + 250, Math.max(c3[1], c4[1]) + 320];
  const [vx0, vy0, vx1, vy1] = R3.view;
  const inView = u => u.x > vx0 && u.x < vx1 && u.y > vy0 && u.y < vy1;
  const myTeam = me ? me.team : 0;
  R3.bars.length = 0;
  // 草丛：玩家在哪丛，哪丛变透明
  const myBush = me && !me.dead ? bushOf(me.x, me.y) : 0;
  for (const b of S3.bushes) {
    const fade = b.idx === myBush;
    if (fade !== b.mat.transparent) { b.mat.transparent = fade; b.mat.opacity = fade ? 0.42 : 1; b.mat.depthWrite = !fade; b.mat.needsUpdate = true; }
  }
  for (const u of W.units) {
    if (u.kind === 'hero') {
      let v = R3.heroes.get(u.id);
      if (!v) { v = makeHeroVis(u); R3.heroes.set(u.id, v); }
      const vis = canSee(W, myTeam, u) && inView(u);
      syncHero(W, u, v, me, dt, vis);
      if (vis && !u.dead) R3.bars.push(u);
    } else if (u.kind === 'monster') {
      let v = R3.monsters.get(u.id);
      if (!v) {
        const rig = rigToSkinned(buildMonster(u.mt), 0.18);
        rig.root.scale.setScalar(MON_SCALE[u.mt] || 1);
        R3.scene.add(rig.root);
        v = { u, rig, yaw: Math.atan2(L / 2 - u.x, L / 2 - u.y), lx: u.x, ly: u.y, spd: 0 };
        R3.monsters.set(u.id, v);
      }
      const vis = inView(u);
      v.rig.root.visible = vis;
      if (vis) syncMonster(W, u, v, dt);
      if (vis && !u.dead) R3.bars.push(u);
    } else if (u.kind === 'tower' || u.kind === 'crystal') {
      let s = R3.structs.get(u.id);
      if (!s) {
        const vis = u.kind === 'tower' ? buildTower(u.team, u.tier) : buildCrystal(u.team);
        vis.root.position.set(u.x, 0, u.y);
        if (u.kind === 'tower') vis.root.scale.setScalar(1.25);
        R3.scene.add(vis.root);
        s = { vis, fallen: 0, rubble: null };
        R3.structs.set(u.id, s);
      }
      if (inView(u)) syncStruct(W, u, s, me);
      if (!u.dead && inView(u)) R3.bars.push(u);
    } else if (u.kind === 'minion' && !u.dead && inView(u)) R3.bars.push(u);
  }
  // 死了、已经从 W.units 里拿掉的野怪
  for (const [id, v] of R3.monsters) {
    if (!W._byId.has(id)) {
      v.gone = (v.gone || 0) + dt;
      if (v.gone > 1.2) { R3.scene.remove(v.rig.root); disposeRig(v.rig); R3.monsters.delete(id); }
      else { v.u.dead = true; syncMonster(W, v.u, v, dt); }
    }
  }
  syncMinions(W, dt);
  syncProjs(W, dt);
  syncZones(W);
  // 敌方塔的攻击范围：玩家走近了才显示
  const tr = R3.towerRing;
  tr.mesh.visible = false;
  if (me && !me.dead) {
    let best = null, bd = 1e9;
    for (const u of W.units) {
      if ((u.kind !== 'tower' && u.kind !== 'crystal') || u.dead || u.team === me.team) continue;
      const d = Math.hypot(u.x - me.x, u.y - me.y);
      if (d < u.range + 260 && d < bd) { bd = d; best = u; }
    }
    if (best) {
      tr.mesh.visible = true;
      placeDecal(tr, best.x, best.y, (best.range + me.r) * 2, null, R3.t * 0.2, 2);
      const tgt = best.tgt === me.id;
      tr.mesh.material.opacity = tgt ? 0.95 : 0.6;
      if (tgt && Math.random() < 0.3) part(true, me.x, groundH(me.x, me.y) + 4, me.y, 0, 0, 0, 0.3, 120, '#FF3A2A', 0, -0.3);
    }
  }
  // 锁定的目标：脚下一个转着的红圈
  const lr = R3.lockRing, lk = me && INP.lock ? byId(W, INP.lock) : null;
  if (lk && !lk.dead && canSee(W, me.team, lk)) {
    const P = ip(lk);
    placeDecal(lr, P[0], P[1], lk.r * 2 + 46 + Math.sin(R3.t * 6) * 6, null, R3.t * 1.5, 4);
    lr.mesh.visible = true;
  } else lr.mesh.visible = false;
  syncAim(me, aim);
  stepFx(dt);
  stepParticles(R3.pa, dt);
  stepParticles(R3.pn, dt);
  const sc = S3.h * S3.dpr * 0.5 / Math.tan(S3.cam.fov * Math.PI / 360);
  R3.pa.mat.uniforms.uScale.value = sc; R3.pn.mat.uniforms.uScale.value = sc;
  S3.r.render(S3.scene, S3.cam);
}
// 单位头顶在屏幕上的位置（画血条用）
function unitTop(u) {
  if (u.kind === 'hero') return 150 + (u.z || 0);
  if (u.kind === 'minion') { const e = R3.minion[u.mt + u.team]; return e ? e.height + 12 : 90; }
  if (u.kind === 'monster') return { blue: 150, red: 110, wolf: 90, bird: 100, golem: 120, drake: 190, lord: 270 }[u.mt] || 120;
  if (u.kind === 'tower') return 340;
  if (u.kind === 'crystal') return 300;
  return 100;
}

/* ---------- 头像：把英雄的半身渲到一张小图上（选人、对阵、击杀播报、小地图用） ---------- */
function heroPortraits(size) {
  const out = {};
  const r = S3.r, N = size * 2;
  const rt = new THREE.WebGLRenderTarget(N, N);
  const sc = new THREE.Scene();
  sc.add(new THREE.HemisphereLight('#FFFFFF', '#7A6A5A', 0.75));
  const dl = new THREE.DirectionalLight('#FFF6E8', 0.75); dl.position.set(-0.5, 0.8, 1); sc.add(dl);
  const cam = new THREE.PerspectiveCamera(30, 1, 10, 2000);
  const buf = new Uint8Array(N * N * 4);
  for (const hd of HEROES) {
    const rig = rigToSkinned(buildHero(hd.id));
    animHero(rig, { move: 0, atk: -1, cast: -1, stun: false, dead: -1 }, 0.4);
    rig.root.rotation.y = hd.id === 'warrior' || hd.id === 'mage' || hd.id === 'support' ? 0.45 : -0.35;   // 武器别挡脸
    sc.add(rig.root);
    rig.root.updateMatrixWorld(true);
    cam.position.set(0, 108, 118); cam.lookAt(0, 82, 0);
    r.setRenderTarget(rt);
    r.setClearColor(0x000000, 0);
    r.clear();
    r.render(sc, cam);
    r.readRenderTargetPixels(rt, 0, 0, N, N, buf);
    r.setRenderTarget(null);
    sc.remove(rig.root);
    const c = mkc(N, N), g = c.getContext('2d'), im = g.createImageData(N, N);
    for (let y = 0; y < N; y++) im.data.set(buf.subarray((N - 1 - y) * N * 4, (N - y) * N * 4), y * N * 4);
    g.putImageData(im, 0, 0);
    const o = mkc(size, size), og = o.getContext('2d');
    og.imageSmoothingQuality = 'high';
    og.drawImage(c, 0, 0, size, size);
    out[hd.id] = o;
  }
  r.setClearColor(0x000000, 1);
  rt.dispose();
  return out;
}

if (typeof module !== 'undefined') module.exports = {};
