'use strict';
/* models.js：三维模型，全部用代码拼出来的低多边形。
   英雄：六个原创人物（战士凌锋、坦克石岳、刺客夜影、法师星璃、射手追月、辅助灵溪），髋、膝、肩、肘、头都能动。
   小兵：拆成“身子、左腿、右腿”三块，各自合并成一个带顶点色的几何体，用 InstancedMesh 一次画一批。
   野怪、龙：一组网格，身子、翅膀、尾巴能动。
   约定：模型面朝 +Z，脚底 y = 0，1 单位 = 游戏里 1 单位。 */

const MATS = {};
function lam(col, o) {
  const key = 'l' + col + (o ? JSON.stringify(o) : '');
  if (!MATS[key]) MATS[key] = new THREE.MeshLambertMaterial(Object.assign({ color: col }, o || {}));
  return MATS[key];
}
function glowMat(col, opacity) {
  const key = 'g' + col + (opacity || 1);
  if (!MATS[key]) MATS[key] = new THREE.MeshBasicMaterial({ color: col, transparent: (opacity || 1) < 1, opacity: opacity || 1, depthWrite: (opacity || 1) >= 1 });
  return MATS[key];
}
function M(geo, mat, x, y, z) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x || 0, y || 0, z || 0);
  m.castShadow = true;
  return m;
}
const GEO = {
  box: (w, h, d) => new THREE.BoxGeometry(w, h, d),
  cyl: (rt, rb, h, s) => new THREE.CylinderGeometry(rt, rb, h, s || 8),
  sph: (r, w, h) => new THREE.SphereGeometry(r, w || 10, h || 8),
  cone: (r, h, s) => new THREE.ConeGeometry(r, h, s || 8),
  oct: r => new THREE.OctahedronGeometry(r, 0),
  ico: (r, d) => new THREE.IcosahedronGeometry(r, d || 0),
  dod: r => new THREE.DodecahedronGeometry(r, 0),
  torus: (r, t, rs, ts, arc) => new THREE.TorusGeometry(r, t, rs || 6, ts || 12, arc || Math.PI * 2),
};
function rot(o, x, y, z) { o.rotation.set(x || 0, y || 0, z || 0); return o; }
function grp(x, y, z) { const g = new THREE.Group(); g.position.set(x || 0, y || 0, z || 0); return g; }

/* ---------- 把一组网格烤成一个带顶点色的几何体（小兵、塔、树用） ---------- */
function bakeGroup(root) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const parts = [];
  root.traverse(o => {
    if (!o.isMesh || o.userData.noBake) return;
    const m = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld);
    let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    g.applyMatrix4(m);
    const c = o.material.color ? o.material.color.clone() : new THREE.Color('#ffffff');
    parts.push([g, c]);
  });
  let n = 0;
  for (const [g] of parts) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3);
  let o = 0;
  for (const [g, c] of parts) {
    const k = g.attributes.position.count;
    pos.set(g.attributes.position.array, o * 3);
    if (!g.attributes.normal) g.computeVertexNormals();
    nor.set(g.attributes.normal.array, o * 3);
    for (let i = 0; i < k; i++) { col[(o + i) * 3] = c.r; col[(o + i) * 3 + 1] = c.g; col[(o + i) * 3 + 2] = c.b; }
    o += k;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.computeBoundingSphere();
  return out;
}
const VCOL = () => MATS.vcol || (MATS.vcol = new THREE.MeshLambertMaterial({ vertexColors: true }));

/* ---------- 人形 ---------- */
// o：配色和体型 { skin, body, belly, sleeve, forearm, pants, shin, boots, glove, belt, eye, bulk, robe, robeCol, robeTrim }
function sc3(o, x, y, z) { o.scale.set(x, y, z); return o; }
function humanoid(o) {
  const B = o.bulk || 1;
  const root = new THREE.Group();
  const body = grp(); root.add(body);
  const hips = grp(0, 41, 0); body.add(hips);
  hips.add(sc3(M(GEO.cyl(10.4 * B, 9.4 * B, 9, 10), lam(o.pants), 0, -1, 0), 1, 1, 0.75));
  const legs = [-1, 1].map(s => {
    const hip = grp(s * 5.6 * B, -2, 0); hips.add(hip);
    hip.add(M(GEO.cyl(5.1 * B, 4.2 * B, 20, 8), lam(o.pants), 0, -10, 0));
    const knee = grp(0, -20, 0); hip.add(knee);
    knee.add(M(GEO.cyl(4.3 * B, 3.6 * B, 15, 8), lam(o.shin || o.pants), 0, -7.5, 0));
    knee.add(M(GEO.cyl(4.9 * B, 4.6 * B, 6, 8), lam(o.boots), 0, -11.5, 0));
    knee.add(sc3(M(GEO.sph(5.2 * B, 10, 6), lam(o.boots), 0, -16.6, 2.4), 0.95, 0.62, 1.45));
    return { hip, knee };
  });
  const torso = grp(0, 3, 0); hips.add(torso);
  torso.add(sc3(M(GEO.cyl(9.6 * B, 9.4 * B, 11, 10), lam(o.belly || o.body), 0, 5, 0), 1, 1, 0.78));
  torso.add(sc3(M(GEO.cyl(13.4 * B, 10 * B, 17, 10), lam(o.body), 0, 18.5, 0), 1, 1, 0.74));
  torso.add(sc3(M(GEO.cyl(10.4 * B, 10.4 * B, 3.6, 10), lam(o.belt || '#5A3E24'), 0, 0.6, 0), 1, 1, 0.8));
  torso.add(M(GEO.cyl(3.8, 4.4, 6, 8), lam(o.skin), 0, 29, 0));
  if (o.robe) {                                // 长袍：腰下一圈裙摆
    torso.add(M(GEO.cyl(10.5 * B, 21 * B, 34, 12), lam(o.robeCol || o.body), 0, -16, 0));
    torso.add(M(GEO.cyl(21.2 * B, 21.6 * B, 3.4, 12), lam(o.robeTrim || o.body), 0, -32.5, 0));
  }
  const head = grp(0, 31, 0); torso.add(head);
  head.add(sc3(M(GEO.sph(11, 16, 12), lam(o.skin), 0, 11.5, 0), 1, 1.03, 0.97));
  for (const s of [-1, 1]) {
    head.add(M(GEO.box(2.7, 3.9, 1.6), lam(o.eye || '#2A2238'), s * 4.1, 11.2, 9.9));
    head.add(M(GEO.box(1, 1.2, 0.8), lam('#FFFFFF'), s * 4.1 - 0.6, 12.4, 10.7));
  }
  const arms = [-1, 1].map(s => {
    const sh = grp(s * (12.6 * B + 2.6), 25, 0); torso.add(sh);
    sh.add(M(GEO.sph(4.9 * B, 10, 8), lam(o.sleeve || o.body), 0, 0, 0));
    sh.add(M(GEO.cyl(4.1 * B, 3.6 * B, 14, 8), lam(o.sleeve || o.body), 0, -7, 0));
    const el = grp(0, -14, 0); sh.add(el);
    el.add(M(GEO.cyl(3.6 * B, 3.1 * B, 12, 8), lam(o.forearm || o.skin), 0, -6, 0));
    const hand = grp(0, -13, 0); el.add(hand);
    hand.add(M(GEO.sph(3.7 * B, 8, 6), lam(o.glove || o.skin), 0, 0, 0));
    return { sh, el, hand };
  });
  return { root, body, hips, torso, head, legs, arms };
}
// 头发：一个盖住后脑的半球 + 刘海；style：spiky 刺猬头、long 长发、pony 马尾、twin 双马尾
function hair(head, col, style) {
  const c = lam(col);
  const cap = M(new THREE.SphereGeometry(11.9, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.52), c, 0, 12, -1.2);
  cap.scale.set(1.05, 1.08, 1.08); cap.rotation.x = -0.42; head.add(cap);   // 往后仰：前面只盖到额头，后面盖住后脑勺
  for (let i = -2; i <= 2; i++) {               // 刘海：几片往下垂的尖，停在眉毛上面
    const b = M(GEO.cone(3.4, 7, 4), c, i * 3.7, 18.2 - Math.abs(i) * 0.9, 9.6 - Math.abs(i) * 1.0);
    b.rotation.set(Math.PI - 0.5, 0, i * 0.2); head.add(b);
  }
  if (style === 'spiky') {
    for (const [x, y, z, rx, rz, h] of [[0, 22, 2, -0.2, 0, 15], [-6, 21, 0, -0.1, 0.5, 13], [6, 21, 0, -0.1, -0.5, 13], [-3, 21, -6, -0.7, 0.3, 14], [4, 21, -6, -0.7, -0.3, 14], [0, 18, -10, -1.2, 0, 13], [-9, 15, -4, -0.5, 0.9, 11], [9, 15, -4, -0.5, -0.9, 11]])
      head.add(rot(M(GEO.cone(4.6, h, 5), c, x, y, z), rx, 0, rz));
  } else if (style === 'long') {
    head.add(sc3(M(GEO.cyl(11.5, 13, 30, 10), c, 0, 0, -6.5), 1, 1, 0.55));
    for (const s of [-1, 1]) head.add(rot(M(GEO.box(4.5, 22, 5), c, s * 10.2, 5, 4), 0, 0, s * 0.08));
  } else if (style === 'pony') {
    head.add(M(GEO.sph(4, 8, 6), lam('#C0392B'), 0, 16, -11));
    head.add(rot(M(GEO.cone(6, 26, 8), c, 0, 4, -16), 0.5, 0, 0));
  } else if (style === 'twin') {
    for (const s of [-1, 1]) {
      head.add(M(GEO.sph(3.4, 8, 6), lam('#FFFFFF'), s * 10, 17, -5));
      head.add(rot(M(GEO.cone(5.4, 24, 8), c, s * 13.5, 4, -6), 0.25, 0, -s * 0.35));
    }
  }
  return cap;
}

/* ---------- 六个英雄 ---------- */
const HERO_LOOK = {
  warrior: { skin: '#F4CDB0', body: '#DCE4EE', belly: '#2F64C8', sleeve: '#2F64C8', forearm: '#DCE4EE', pants: '#26324F', shin: '#DCE4EE', boots: '#6A4528', glove: '#6A4528', belt: '#C99A3A', hair: '#EEF2F8' },
  tank: { skin: '#E0AE88', body: '#D9A63E', belly: '#9A6A26', sleeve: '#7A4E22', forearm: '#D9A63E', pants: '#4A3626', shin: '#D9A63E', boots: '#3E2B1E', glove: '#7A4E22', bulk: 1.3, belt: '#5A3A22' },
  assassin: { skin: '#F0CDB4', body: '#4A3F86', belly: '#2C2552', sleeve: '#2C2552', forearm: '#4A3F86', pants: '#2C2552', shin: '#4A3F86', boots: '#1E1A34', glove: '#1E1A34', bulk: 0.93, belt: '#B58BFF', eye: '#E6D2FF' },
  mage: { skin: '#F8DCC8', body: '#6E4FD8', belly: '#F4EEFF', sleeve: '#6E4FD8', forearm: '#F4EEFF', pants: '#4A3394', boots: '#3A2878', robe: true, robeCol: '#6E4FD8', robeTrim: '#F0C860', belt: '#F0C860', hair: '#E2DCFF', eye: '#4A3394' },
  marksman: { skin: '#F6D2B4', body: '#F2F0E6', belly: '#2E9E6A', sleeve: '#F2F0E6', forearm: '#2E9E6A', pants: '#3A4A3A', shin: '#7A5432', boots: '#7A5432', glove: '#7A5432', belt: '#7A5432', hair: '#F4CF6A', eye: '#2E6E4A' },
  support: { skin: '#FCE0D0', body: '#FFF2F8', belly: '#FF74AC', sleeve: '#FFF2F8', forearm: '#FCE0D0', pants: '#FFF2F8', boots: '#FF74AC', robe: true, robeCol: '#FFF2F8', robeTrim: '#FF74AC', belt: '#FF74AC', hair: '#FF9CCB', eye: '#B03070' },
};
const HSCALE = 1.4;                             // 英雄整体放大（碰撞半径不变，画面上大一点好认）
function buildHero(hid) {
  const o = HERO_LOOK[hid];
  const h = humanoid(o);
  h.hid = hid;
  const [L, R] = h.arms;
  const gold = '#F0C24E';
  if (hid === 'warrior') {
    hair(h.head, o.hair, 'spiky');
    for (const s of [-1, 1]) {                   // 肩甲
      const p = M(new THREE.SphereGeometry(8.6, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), lam('#DCE4EE'), 0, 2, 0); p.scale.set(1.15, 0.9, 1.1);
      h.arms[(s + 1) / 2].sh.add(p);
      h.arms[(s + 1) / 2].sh.add(sc3(M(GEO.torus(8.4, 1.2, 4, 14), lam(gold), 0, 2, 0), 1.15, 1.1, 1).rotateX(Math.PI / 2));
    }
    h.torso.add(sc3(M(GEO.cyl(13.8, 11, 3, 10), lam(gold), 0, 26, 0), 1, 1, 0.76));
    h.torso.add(M(GEO.box(6, 12, 2), lam('#2F64C8'), 0, 18, 10.5));
    h.torso.add(M(GEO.cyl(8.6, 9.6, 5, 10), lam('#E0383E'), 0, 30, 0));       // 红围巾
    const scarf = grp(0, 30, -7); h.torso.add(scarf);
    scarf.add(rot(M(GEO.box(9, 1.6, 34), lam('#E0383E'), 3, -1, -16), 0.45, 0.25, 0));
    scarf.add(rot(M(GEO.box(7, 1.4, 26), lam('#C42E36'), -4, -2, -12), 0.6, -0.3, 0));
    h.scarf = scarf;
    const sw = grp(0, -1.5, 2); R.hand.add(sw);  // 大剑
    sw.add(M(GEO.cyl(1.9, 1.9, 13, 6), lam('#4A2E1C'), 0, -1, 0));
    sw.add(M(GEO.box(20, 3.6, 6), lam(gold), 0, 6.5, 0));
    sw.add(M(GEO.box(8, 66, 2.2), lam('#EAF2FF'), 0, 41, 0));
    sw.add(M(GEO.box(2, 62, 2.6), glowMat('#7FE0FF'), 0, 40, 0));
    sw.add(rot(M(GEO.cone(4, 9, 4), lam('#EAF2FF'), 0, 78.5, 0), 0, Math.PI / 4, 0));
    sw.add(M(GEO.sph(3, 6, 5), lam(gold), 0, -8.5, 0));
    sw.rotation.x = Math.PI / 2 - 0.35;
    h.weapon = sw; h.wkind = 'sword';
  } else if (hid === 'tank') {
    h.head.add(M(new THREE.SphereGeometry(13.4, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.6), lam('#D9A63E'), 0, 11.5, 0));   // 头盔
    h.head.add(M(GEO.box(26, 3, 3.4), lam('#9A6A26'), 0, 13.5, 10.6));
    for (let i = 0; i < 6; i++) h.head.add(rot(M(GEO.box(3.4, 7, 4), lam('#E2403C'), 0, 25.5 - i * 0.4, 6 - i * 4.4), -0.25 - i * 0.12, 0, 0));   // 红缨
    for (const s of [-1, 1]) {                   // 大肩甲
      const p = M(new THREE.SphereGeometry(11, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), lam('#D9A63E'), 0, 3, 0); p.scale.set(1.25, 0.95, 1.2);
      h.arms[(s + 1) / 2].sh.add(p);
      h.arms[(s + 1) / 2].sh.add(rot(M(GEO.cone(2.6, 8, 5), lam('#F4E2B0'), s * 3, 12, 0), 0, 0, -s * 0.4));
    }
    h.torso.add(M(GEO.oct(5), lam('#F4E2B0'), 0, 20, 11.6));
    const cape = grp(0, 30, -10); h.torso.add(cape);   // 披风
    cape.add(rot(M(GEO.box(34, 48, 2.4), lam('#B0303A'), 0, -23, -2.5), 0.1, 0, 0));
    h.cape = cape;
    const sh = grp(-3, 4, 7); L.el.add(sh);      // 大盾
    sh.add(sc3(M(GEO.cyl(22, 22, 5, 6), lam('#8E5A24'), 0, -4, 0), 0.86, 1, 1.15).rotateX(Math.PI / 2));
    sh.add(sc3(M(GEO.torus(21, 2.4, 4, 6), lam(gold), 0, -4, 1.6), 0.86, 1.15, 1).rotateZ(Math.PI / 6));
    sh.add(M(GEO.oct(8), lam('#F4E2B0'), 0, -4, 4));
    rot(sh, 0, -0.25, 0);
    const mc = grp(0, -1.5, 2); R.hand.add(mc);  // 锤
    mc.add(M(GEO.cyl(2, 2, 32, 6), lam('#4A2E1C'), 0, 9, 0));
    mc.add(M(GEO.dod(9), lam('#A9B2BE'), 0, 29, 0));
    for (const [x, y, z] of [[9, 29, 0], [-9, 29, 0], [0, 29, 9], [0, 29, -9], [0, 38, 0]]) mc.add(rot(M(GEO.cone(2.4, 7, 4), lam('#DDE3EA'), x, y, z), z ? Math.sign(z) * Math.PI / 2 : 0, 0, x ? -Math.sign(x) * Math.PI / 2 : 0));
    mc.rotation.x = Math.PI / 2 - 0.4;
    h.weapon = mc; h.wkind = 'mace';
  } else if (hid === 'assassin') {
    const hood = M(new THREE.SphereGeometry(12.8, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.64), lam('#3A3170'), 0, 12, -1); hood.scale.set(1.04, 1.08, 1.12); h.head.add(hood);
    h.head.add(rot(M(GEO.cone(7, 16, 6), lam('#3A3170'), 0, 19, -12), -1.0, 0, 0));
    h.head.add(M(new THREE.CylinderGeometry(11.3, 11.5, 9, 12, 1, true, -1.15, 2.3), new THREE.MeshLambertMaterial({ color: '#1E1A34', side: THREE.DoubleSide }), 0, 6, 0));   // 面罩
    for (const s of [-1, 1]) h.head.add(M(GEO.box(3.2, 1.4, 1), glowMat('#D9A8FF'), s * 4.1, 12, 10.9));
    const scarf = grp(0, 30, -7); h.torso.add(scarf);
    scarf.add(rot(M(GEO.box(7, 1.6, 40), lam('#A070FF'), -3, -2, -19), 0.42, -0.3, 0));
    scarf.add(rot(M(GEO.box(5, 1.4, 30), lam('#7E4FE0'), 4, -2, -14), 0.55, 0.25, 0));
    h.scarf = scarf;
    h.torso.add(M(GEO.cyl(8.4, 9.2, 5, 10), lam('#A070FF'), 0, 30, 0));
    for (const s of [-1, 1]) h.arms[(s + 1) / 2].sh.add(sc3(M(new THREE.SphereGeometry(7, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), lam('#2C2552'), 0, 2, 0), 1.1, 0.8, 1.1));
    for (let i = 0; i < 2; i++) h.torso.add(rot(M(GEO.box(1.4, 22, 1), glowMat('#C08CFF'), (i ? 1 : -1) * 6, 17, 10.4), 0, 0, (i ? -1 : 1) * 0.35));
    for (const hd of [L.hand, R.hand]) {         // 双匕首
      const d = grp(0, -1, 2); hd.add(d);
      d.add(M(GEO.box(3.4, 6, 3.4), lam('#1E1A34'), 0, 0, 0));
      d.add(M(GEO.box(5, 2, 5), lam('#B58BFF'), 0, 3.5, 0));
      d.add(rot(M(GEO.cone(2.6, 30, 4), lam('#E8ECFA'), 0, 19, 0), 0, Math.PI / 4, 0));
      d.add(M(GEO.box(0.9, 24, 0.9), glowMat('#C08CFF'), 0, 17, 1.4));
      d.rotation.x = Math.PI / 2 - 0.2;
    }
    h.wkind = 'dagger';
  } else if (hid === 'mage') {
    hair(h.head, o.hair, 'long');
    for (const [x, y, z] of [[-7, 22, 5], [7, 22, 5]]) h.head.add(M(GEO.oct(2.6), glowMat('#FFE57A'), x, y, z));
    const crown = M(GEO.torus(9, 1.1, 4, 16), lam(gold), 0, 21, 0); crown.rotation.x = Math.PI / 2 - 0.25; h.head.add(crown);
    h.head.add(M(GEO.oct(3), glowMat('#9FF3FF'), 0, 23, 8.4));
    h.torso.add(M(GEO.box(5, 20, 1.6), lam(gold), 0, 16, 10.2));
    for (const s of [-1, 1]) h.arms[(s + 1) / 2].sh.add(sc3(M(GEO.sph(6.6, 10, 8), lam('#4A3394'), 0, 1, 0), 1.1, 0.8, 1.1));
    for (const s of [-1, 1]) h.arms[(s + 1) / 2].el.add(M(GEO.cyl(3.4, 6.2, 9, 8), lam('#6E4FD8'), 0, -9, 0));   // 喇叭袖
    const st = grp(0, -1.5, 2); R.hand.add(st);  // 法杖 + 月牙 + 发光的球
    st.add(M(GEO.cyl(1.8, 2.2, 78, 6), lam('#F0EAD8'), 0, 18, 0));
    st.add(rot(M(GEO.torus(10, 2, 5, 14, Math.PI * 1.35), lam(gold), 0, 61, 0), 0, 0, -0.75));
    const orb = M(GEO.ico(6.5, 1), glowMat('#9FF3FF'), 0, 61, 0); st.add(orb);
    st.rotation.x = 0.15;
    h.weapon = st; h.orb = orb; h.wkind = 'staff';
    h.motes = [0, 1, 2].map(() => { const m = M(GEO.oct(2.8), glowMat('#CFC2FF'), 0, 70, 0); m.castShadow = false; h.root.add(m); return m; });
  } else if (hid === 'marksman') {
    hair(h.head, o.hair, 'pony');
    const band = M(GEO.torus(11.6, 1.3, 4, 16), lam('#2E9E6A'), 0, 16, 0); band.rotation.x = Math.PI / 2 - 0.2; h.head.add(band);
    h.head.add(rot(M(GEO.box(1.6, 13, 4), lam('#FFFFFF'), 10, 24, -6), 0.4, 0, -0.35));
    h.head.add(rot(M(GEO.box(1.6, 5, 4), lam('#E2403C'), 12.4, 31, -8.6), 0.4, 0, -0.35));
    for (const s of [-1, 1]) h.arms[(s + 1) / 2].sh.add(sc3(M(new THREE.SphereGeometry(6.6, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), lam('#2E9E6A'), 0, 2, 0), 1.1, 0.8, 1.1));
    h.torso.add(rot(M(GEO.box(4.6, 30, 2), lam('#7A5432'), 0, 17, 10.2), 0, 0, 0.6));
    const q = grp(7, 20, -11); h.torso.add(q);   // 箭筒
    q.add(rot(M(GEO.cyl(4.6, 4.2, 26, 8), lam('#7A5432'), 0, 0, 0), 0, 0, -0.35));
    for (const dx of [-1.6, 1.6]) { q.add(rot(M(GEO.box(1.2, 12, 1.2), lam('#F2F0E6'), dx + 4.6, 15, 0), 0, 0, -0.35)); q.add(rot(M(GEO.box(3, 4, 0.6), lam('#E2403C'), dx + 6.6, 21, 0), 0, 0, -0.35)); }
    const bw = grp(0, -1.5, 3); L.hand.add(bw);  // 长弓
    bw.add(rot(M(GEO.torus(33, 2, 5, 18, Math.PI * 0.92), lam('#C08A3A'), -4, 0, 0), 0, 0, Math.PI / 2 + Math.PI * 0.04));
    for (const s of [-1, 1]) bw.add(M(GEO.oct(2.6), lam(gold), -4 + Math.cos(Math.PI / 2 + Math.PI * 0.04 + (s > 0 ? Math.PI * 0.92 : 0)) * 33, Math.sin(Math.PI / 2 + Math.PI * 0.04 + (s > 0 ? Math.PI * 0.92 : 0)) * 33, 0));
    bw.add(M(GEO.box(0.7, 64, 0.7), glowMat('#C8FFE6'), -26, 0, 0));
    bw.rotation.set(Math.PI / 2, 0, Math.PI / 2);
    h.weapon = bw; h.wkind = 'bow';
  } else if (hid === 'support') {
    hair(h.head, o.hair, 'twin');
    for (let i = 0; i < 8; i++) {                // 花环
      const a = (i / 8) * Math.PI * 2;
      h.head.add(M(GEO.sph(2.6, 6, 5), lam(i % 2 ? '#FFFFFF' : '#FFD34D'), Math.cos(a) * 11, 21 - Math.sin(a) * 1.5, Math.sin(a) * 11));
    }
    h.torso.add(M(GEO.oct(4), lam('#FF74AC'), 0, 22, 10.2));
    for (const s of [-1, 1]) h.arms[(s + 1) / 2].sh.add(sc3(M(GEO.sph(6, 10, 8), lam('#FFD2E6'), 0, 1, 0), 1.1, 0.8, 1.1));
    for (const s of [-1, 1]) {                   // 半透明的小翅膀
      const w = grp(s * 6, 26, -9); h.torso.add(w);
      const a = M(new THREE.SphereGeometry(13, 10, 8), glowMat('#BDEBFF', 0.55), s * 12, 8, -6);
      a.scale.set(1, 1.5, 0.14); a.rotation.z = s * 0.5; a.castShadow = false; w.add(a);
      const b = M(new THREE.SphereGeometry(9, 10, 8), glowMat('#FFD0EA', 0.5), s * 10, -10, -5);
      b.scale.set(1, 1.3, 0.14); b.rotation.z = s * 1.1; b.castShadow = false; w.add(b);
      w.rotation.y = s * 0.5;
      (h.wings = h.wings || []).push(w);
    }
    const st = grp(0, -1.5, 2); R.hand.add(st);  // 法杖 + 莲花
    st.add(M(GEO.cyl(1.8, 2.2, 66, 6), lam(gold), 0, 16, 0));
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; st.add(rot(M(GEO.cone(4.2, 13, 4), lam('#FF86B8'), Math.cos(a) * 5, 54, Math.sin(a) * 5), Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7)); }
    const orb = M(GEO.sph(4.6, 8, 6), glowMat('#FFF0F8'), 0, 55, 0); st.add(orb);
    st.rotation.x = 0.15;
    h.weapon = st; h.orb = orb; h.wkind = 'staff';
  }
  return h;
}

/* ---------- 把一套关节（Group）换成骨骼，整个英雄烤成一个蒙皮网格：一次绘制 ---------- */
// 每个 Group 变成一根骨头，挂在它下面的网格的顶点 100% 绑在这根骨头上。会自己动的网格（法球、翅膀、光点）先包一层 Group
function wrapMesh(m) {
  const g = new THREE.Group();
  g.position.copy(m.position); g.quaternion.copy(m.quaternion); g.scale.copy(m.scale);
  const p = m.parent; p.add(g); p.remove(m);
  m.position.set(0, 0, 0); m.quaternion.identity(); m.scale.set(1, 1, 1);
  g.add(m);
  return g;
}
function skinMats(rim) {
  const lit = new THREE.MeshLambertMaterial({ vertexColors: true, skinning: true });
  lit.onBeforeCompile = sh => {           // 边缘光：人物从地上“跳”出来
    sh.uniforms.uRim = { value: rim || 0.32 };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vRimN; varying vec3 vRimV;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvRimN = normalize(normalMatrix * objectNormal); vRimV = -mvPosition.xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vRimN; varying vec3 vRimV; uniform float uRim;')
      .replace('#include <dithering_fragment>', '#include <dithering_fragment>\nfloat rimK = 1.0 - max(0.0, dot(normalize(vRimN), normalize(vRimV)));\ngl_FragColor.rgb += uRim * pow(rimK, 2.6) * vec3(1.0, 0.97, 0.9);');
  };
  const glow = new THREE.MeshBasicMaterial({ vertexColors: true, skinning: true, transparent: true, depthWrite: true });
  return { lit, glow };
}
function rigToSkinned(h, rim) {
  for (const k of ['orb']) if (h[k] && h[k].isMesh) h[k] = wrapMesh(h[k]);
  for (const k of ['wings', 'motes']) if (h[k]) h[k] = h[k].map(m => (m.isMesh ? wrapMesh(m) : m));
  const bones = [], map = new Map();
  const visit = (o, pb) => {
    if (o.isMesh) return;
    const b = new THREE.Bone();
    b.position.copy(o.position); b.quaternion.copy(o.quaternion); b.scale.copy(o.scale);
    map.set(o, b); bones.push(b);
    if (pb) pb.add(b);
    for (const c of o.children.slice()) visit(c, b);
  };
  visit(h.root, null);
  h.root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(h.root.matrixWorld).invert();
  const sets = { lit: [], glow: [] };
  h.root.traverse(o => {
    if (!o.isMesh) return;
    const bi = bones.indexOf(map.get(o.parent));
    const m = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld);
    const glow = !!o.material.isMeshBasicMaterial;
    sets[glow ? 'glow' : 'lit'].push([o.geometry, o.material.color, m, bi, glow ? o.material.opacity : 1]);
  });
  const build = list => {
    let n = 0;
    const gs = list.map(([g, c, m, bi, a]) => { const q = g.index ? g.toNonIndexed() : g.clone(); q.applyMatrix4(m); n += q.attributes.position.count; return [q, c, bi, a]; });
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 4), si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
    let o = 0;
    for (const [q, c, bi, a] of gs) {
      const k = q.attributes.position.count;
      pos.set(q.attributes.position.array, o * 3);
      if (!q.attributes.normal) q.computeVertexNormals();
      nor.set(q.attributes.normal.array, o * 3);
      for (let i = 0; i < k; i++) { const j = o + i; col[j * 4] = c.r; col[j * 4 + 1] = c.g; col[j * 4 + 2] = c.b; col[j * 4 + 3] = a; si[j * 4] = bi; sw[j * 4] = 1; }
      o += k;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 4));
    g.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4));
    g.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4));
    g.computeBoundingSphere();
    g.boundingSphere.radius *= 1.8;            // 动起来会伸出去一点
    return g;
  };
  const mats = skinMats(rim);
  const mesh = new THREE.SkinnedMesh(build(sets.lit), mats.lit);
  mesh.castShadow = true;
  mesh.add(bones[0]);
  const skel = new THREE.Skeleton(bones);
  mesh.bind(skel);
  let glow = null;
  if (sets.glow.length) {
    glow = new THREE.SkinnedMesh(build(sets.glow), mats.glow);
    glow.castShadow = false;
    mesh.add(glow);
    glow.bind(skel, new THREE.Matrix4());
  }
  // 原来的引用全部换成对应的骨头
  const B = o => map.get(o) || o;
  for (const k of ['body', 'hips', 'torso', 'head', 'weapon', 'scarf', 'cape', 'orb']) if (h[k]) h[k] = B(h[k]);
  if (h.legs) h.legs = h.legs.map(l => ({ hip: B(l.hip), knee: B(l.knee) }));
  if (h.arms) h.arms = h.arms.map(a => ({ sh: B(a.sh), el: B(a.el), hand: B(a.hand) }));
  for (const k of ['wings', 'motes']) if (h[k]) h[k] = h[k].map(B);
  if (h.parts) for (const k in h.parts) h.parts[k] = Array.isArray(h.parts[k]) ? h.parts[k].map(B) : B(h.parts[k]);
  h.root = mesh; h.mesh = mesh; h.glow = glow; h.mats = mats;
  return h;
}

/* ---------- 英雄动画 ---------- */
// s：{ move 0~1, atk 普攻开始后的秒数（没有为 -1）, cast 放技能后的秒数, stun, dead 死后的秒数, spin }
function animHero(h, s, t) {
  const [L, R] = h.arms, [LL, LR] = h.legs;
  for (const a of h.arms) { a.sh.rotation.set(0, 0, 0); a.el.rotation.set(0, 0, 0); }
  for (const l of h.legs) { l.hip.rotation.set(0, 0, 0); l.knee.rotation.set(0, 0, 0); }
  h.torso.rotation.set(0, 0, 0); h.head.rotation.set(0, 0, 0); h.body.position.set(0, 0, 0); h.body.rotation.set(0, 0, 0);
  const mv = s.move;
  const ph = t * 11;
  if (mv > 0.01) {                               // 跑
    const sw = Math.sin(ph);
    LL.hip.rotation.x = -sw * 0.85 * mv; LR.hip.rotation.x = sw * 0.85 * mv;
    LL.knee.rotation.x = Math.max(0, Math.sin(ph + 1.6)) * 1.2 * mv; LR.knee.rotation.x = Math.max(0, -Math.sin(ph + 1.6)) * 1.2 * mv;
    L.sh.rotation.x = sw * 0.7 * mv; R.sh.rotation.x = -sw * 0.7 * mv;
    L.el.rotation.x = -0.6 * mv; R.el.rotation.x = -0.6 * mv;
    h.body.position.y = Math.abs(Math.cos(ph)) * 3 * mv;
    h.torso.rotation.x = 0.16 * mv;
    h.torso.rotation.y = sw * 0.12 * mv;
  } else {                                       // 站着：呼吸
    h.body.position.y = Math.sin(t * 2.2) * 0.7;
    L.sh.rotation.z = -0.12; R.sh.rotation.z = 0.12;
    L.el.rotation.x = -0.18; R.el.rotation.x = -0.3;
    h.torso.rotation.x = Math.sin(t * 2.2) * 0.02;
  }
  if (h.wkind === 'bow') { L.sh.rotation.x += -0.45; L.el.rotation.x += -0.5; }
  if (h.wkind === 'staff') { R.el.rotation.x += -0.7; }
  if (h.wkind === 'mace' || h.wkind === 'sword') { R.el.rotation.x += -0.5; }
  if (h.hid === 'tank') { L.el.rotation.x += -1.0; L.sh.rotation.x += -0.2; }
  if (s.atk >= 0 && s.atk < 0.42) {              // 普攻
    const p = s.atk / 0.36;
    if (h.wkind === 'sword' || h.wkind === 'mace') {
      const up = p < 0.35 ? p / 0.35 : 0, down = p >= 0.35 ? Math.min(1, (p - 0.35) / 0.25) : 0;
      R.sh.rotation.x = p < 0.35 ? -2.6 * up : p < 1 ? -2.6 + 3.1 * down : 0;
      R.el.rotation.x = -0.4;
      h.torso.rotation.y = p < 0.35 ? -0.35 * up : p < 1 ? -0.35 + 0.8 * down : 0;
    } else if (h.wkind === 'dagger') {
      const a = Math.sin(Math.min(1, p) * Math.PI);
      (p < 0.5 ? R : L).sh.rotation.x = -1.5 * a; (p < 0.5 ? R : L).el.rotation.x = 0.1;
      h.torso.rotation.y = (p < 0.5 ? 0.3 : -0.3) * a;
    } else if (h.wkind === 'bow') {
      L.sh.rotation.x = -1.55; L.el.rotation.x = 0; L.sh.rotation.y = 0.2;
      const pull = p < 0.6 ? p / 0.6 : 0;
      R.sh.rotation.x = -1.5; R.el.rotation.x = -1.8 * pull; R.sh.rotation.y = -0.3;
      h.torso.rotation.y = -0.4;
    } else {
      const a = Math.sin(Math.min(1, p) * Math.PI);
      R.sh.rotation.x = -1.4 * a; R.el.rotation.x = -0.3 * (1 - a);
      h.torso.rotation.y = 0.2 * a;
    }
  }
  if (s.cast >= 0 && s.cast < 0.45) {            // 放技能：双手举起
    const a = Math.sin(Math.min(1, s.cast / 0.45) * Math.PI);
    L.sh.rotation.x = -2.5 * a; R.sh.rotation.x = -2.5 * a;
    L.sh.rotation.z = -0.4 * a; R.sh.rotation.z = 0.4 * a;
  }
  if (s.spin) { h.body.rotation.y = t * 18; R.sh.rotation.z = 1.3; R.sh.rotation.x = -0.2; L.sh.rotation.z = -1.1; }
  if (s.stun) { h.head.rotation.z = Math.sin(t * 7) * 0.25; h.torso.rotation.z = Math.sin(t * 7) * 0.06; L.sh.rotation.x = 0.2; R.sh.rotation.x = 0.2; }
  if (h.scarf) h.scarf.rotation.x = -0.2 - mv * 0.55 + Math.sin(t * 9) * 0.08;
  if (h.cape) h.cape.rotation.x = -mv * 0.38 + Math.sin(t * 6) * 0.04;
  if (h.wings) h.wings.forEach((w, i) => { w.rotation.y = (i ? -1 : 1) * (0.45 + Math.sin(t * 6) * 0.28); });
  if (h.orb) h.orb.rotation.y = t * 2;
  if (h.motes) h.motes.forEach((m, i) => { const a = t * 2.2 + i * Math.PI * 2 / 3; m.position.set(Math.cos(a) * 28, 66 + Math.sin(t * 3 + i * 2) * 6, Math.sin(a) * 28); });
  if (s.dead >= 0) {                             // 倒下
    const k = Math.min(1, s.dead / 0.4);
    h.body.rotation.x = -k * Math.PI / 2;
    h.body.position.y = 8 * k;
    h.body.position.z = -30 * k;
  }
}

/* ---------- 小兵：身子 + 两条腿，三块各自合并，按队伍上色 ---------- */
const TEAMC = [{ main: '#3F7FE0', dark: '#24508F', light: '#9CC8FF' }, { main: '#D9473C', dark: '#8E2A24', light: '#FFB0A0' }];
function minionParts(mt, team) {
  const T = TEAMC[team];
  const body = new THREE.Group(), legL = new THREE.Group(), legR = new THREE.Group();
  const add = (g, m) => { g.add(m); return m; };
  let hipY = 26, hipX = 6, sc = 1;
  if (mt === 'melee' || mt === 'super' || mt === 'ranged') {
    sc = mt === 'super' ? 1.45 : 1;
    const robe = mt === 'ranged';
    add(body, M(GEO.box(20, 22, 14), lam(robe ? T.main : T.main), 0, 37, 0));
    add(body, M(GEO.box(22, 4, 15), lam('#5A3E24'), 0, 27, 0));
    if (robe) add(body, M(GEO.cyl(10, 15, 18, 8), lam(T.main), 0, 20, 0));
    add(body, M(GEO.sph(9.5, 10, 8), lam('#F0C8A8'), 0, 56, 0));
    add(body, M(GEO.box(2.4, 3, 1), lam('#211B2B'), -3.5, 57, 8.6)); add(body, M(GEO.box(2.4, 3, 1), lam('#211B2B'), 3.5, 57, 8.6));
    if (robe) {
      add(body, rot(M(GEO.cone(11, 20, 8), lam(T.dark), 0, 70, -1), -0.15, 0, 0));
      add(body, M(GEO.cyl(13, 13, 3, 10), lam(T.dark), 0, 61, 0));
      add(body, M(GEO.cyl(1.6, 1.6, 50, 5), lam('#6A4A2C'), 15, 40, 6));
      const o = add(body, M(GEO.oct(5), lam(T.light, { emissive: T.light, emissiveIntensity: 0.6 }), 15, 66, 6));
      o.rotation.y = 0.5;
    } else {
      add(body, M(new THREE.SphereGeometry(10.6, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), lam(mt === 'super' ? '#E3B341' : T.dark), 0, 57, 0));
      add(body, M(GEO.box(3, 8, 14), lam(T.light), 0, 68, -1));
      add(body, M(GEO.cyl(9, 9, 3, 10), lam(T.dark), -14, 38, 5)).rotation.z = Math.PI / 2;
      add(body, rot(M(GEO.box(3, 30, 2), lam('#E6ECF2'), 14, 46, 10), 0.5, 0, 0));
      add(body, M(GEO.box(10, 2.5, 4), lam('#E3B341'), 14, 34, 4));
      if (mt === 'super') { for (const s of [-1, 1]) add(body, M(GEO.box(9, 7, 16), lam('#E3B341'), s * 13, 47, 0)); }
    }
    for (const [g, s] of [[legL, -1], [legR, 1]]) {
      add(g, M(GEO.cyl(4, 3.6, 20, 6), lam(robe ? T.dark : '#3A3A48'), 0, -10, 0));
      add(g, M(GEO.box(6.5, 5, 10), lam('#4A3426'), 0, -22, 2));
    }
  } else if (mt === 'siege') {                // 炮车：木头车 + 大炮 + 旗子；两只"腿"当轮子
    hipY = 10; hipX = 15;
    add(body, M(GEO.box(34, 12, 42), lam('#7A5A3A'), 0, 20, 0));
    add(body, M(GEO.box(36, 3, 44), lam('#9A7A52'), 0, 27, 0));
    add(body, rot(M(GEO.cyl(6.5, 8, 36, 10), lam('#3C3F48'), 0, 34, 10), Math.PI / 2 - 0.25, 0, 0));
    add(body, M(GEO.sph(8, 8, 6), lam('#2A2C33'), 0, 33, -6));
    add(body, M(GEO.cyl(1.2, 1.2, 40, 5), lam('#6A4A2C'), -12, 46, -16));
    add(body, M(GEO.box(14, 10, 1), lam(T.main), -5, 60, -16));
    for (const g of [legL, legR]) {
      add(g, rot(M(GEO.cyl(9, 9, 5, 10), lam('#3A2A1E'), 0, 0, 12), 0, 0, Math.PI / 2));
      add(g, rot(M(GEO.cyl(9, 9, 5, 10), lam('#3A2A1E'), 0, 0, -12), 0, 0, Math.PI / 2));
    }
  } else if (mt === 'vanguard') {             // 先锋：石头巨人，胸口发光
    sc = 1; hipY = 34; hipX = 14;
    add(body, M(GEO.box(46, 40, 30), lam('#6E6A82'), 0, 60, 0));
    add(body, M(GEO.box(30, 24, 26), lam('#6E6A82'), 0, 90, 2));
    add(body, M(GEO.oct(9), lam(T.light, { emissive: T.light, emissiveIntensity: 1 }), 0, 62, 16));
    for (const s of [-1, 1]) {
      add(body, M(GEO.box(16, 40, 16), lam('#5A566E'), s * 32, 52, 0));
      add(body, M(GEO.box(4, 4, 2), lam(T.light, { emissive: T.light, emissiveIntensity: 1 }), s * 6, 94, 15));
    }
    for (const g of [legL, legR]) add(g, M(GEO.box(16, 34, 18), lam('#5A566E'), 0, -17, 0));
  }
  legL.position.set(-hipX, hipY, 0); legR.position.set(hipX, hipY, 0);
  body.scale.setScalar(sc); legL.scale.setScalar(sc); legR.scale.setScalar(sc);
  legL.position.multiplyScalar(sc); legR.position.multiplyScalar(sc);
  const pivot = [legL.position.clone(), legR.position.clone()];
  legL.position.set(0, 0, 0); legR.position.set(0, 0, 0);
  return { body: bakeGroup(body), legL: bakeGroup(legL), legR: bakeGroup(legR), pivot, height: (mt === 'vanguard' ? 110 : mt === 'siege' ? 60 : 75) * sc };
}

/* ---------- 野怪和龙 ---------- */
function buildMonster(mt) {
  const root = new THREE.Group(), body = grp(); root.add(body);
  const r = { root, body, mt, parts: {} };
  if (mt === 'blue' || mt === 'golem') {     // 石像：蓝 buff 身上长蓝水晶；小石头怪长苔藓
    const big = mt === 'blue', s = big ? 1.15 : 0.85;
    const stone = big ? '#6F7A8C' : '#8C8478', dk = big ? '#4E5868' : '#625B51';
    body.add(M(GEO.dod(30 * s), lam(stone), 0, 52 * s, 0));
    body.add(M(GEO.dod(18 * s), lam(stone), 0, 88 * s, 6 * s));
    for (const sx of [-1, 1]) {
      const arm = grp(sx * 34 * s, 70 * s, 0); body.add(arm);
      arm.add(M(GEO.dod(13 * s), lam(dk), 0, -20 * s, 4));
      arm.add(M(GEO.dod(11 * s), lam(dk), 0, -40 * s, 8));
      (r.parts.arms = r.parts.arms || []).push(arm);
      const leg = grp(sx * 15 * s, 26 * s, 0); body.add(leg);
      leg.add(M(GEO.box(16 * s, 28 * s, 18 * s), lam(dk), 0, -12 * s, 0));
    }
    for (const sx of [-1, 1]) body.add(M(GEO.box(5, 5, 2), glowMat(big ? '#7FE8FF' : '#FFE070'), sx * 7 * s, 92 * s, 21 * s));
    if (big) for (const [x, y, z, sz] of [[0, 112, 0, 13], [-18, 100, -8, 9], [16, 102, -6, 10], [-34, 82, 0, 8], [32, 84, 2, 8]]) {
      const c = M(GEO.oct(sz), glowMat('#5FD4FF'), x * s, y * s, z * s); c.scale.y = 1.8; body.add(c);
    } else for (const [x, z] of [[-10, 8], [12, -4], [0, -14]]) body.add(M(GEO.box(14, 3, 10), lam('#6FBF5A'), x * s, 74 * s, z * s));
  } else if (mt === 'red') {                  // 火焰蜥蜴
    body.add(M(GEO.box(46, 28, 70), lam('#D2483A'), 0, 36, 0));
    body.add(M(GEO.box(40, 6, 60), lam('#F0A040'), 0, 21, 2));
    const head = grp(0, 44, 38); body.add(head);
    head.add(M(GEO.box(34, 24, 32), lam('#D2483A'), 0, 0, 12));
    head.add(M(GEO.box(30, 8, 20), lam('#9E2F26'), 0, -12, 22));
    for (const sx of [-1, 1]) head.add(M(GEO.box(5, 5, 2), glowMat('#FFE070'), sx * 10, 6, 28));
    r.parts.head = head;
    const tail = grp(0, 36, -34); body.add(tail);
    tail.add(rot(M(GEO.cone(14, 60, 6), lam('#D2483A'), 0, 0, -28), -Math.PI / 2, 0, 0));
    r.parts.tail = tail;
    for (let i = 0; i < 5; i++) { const f = M(GEO.cone(7, 22, 5), glowMat(i % 2 ? '#FFB040' : '#FFE070'), 0, 58, 26 - i * 14); f.castShadow = false; body.add(f); (r.parts.flames = r.parts.flames || []).push(f); }
    for (const [x, z] of [[-24, 22], [24, 22], [-24, -20], [24, -20]]) { const l = grp(x, 26, z); l.add(M(GEO.box(12, 24, 12), lam('#9E2F26'), 0, -12, 0)); body.add(l); (r.parts.legs = r.parts.legs || []).push(l); }
  } else if (mt === 'wolf') {
    body.add(M(GEO.box(26, 26, 54), lam('#8A8F9C'), 0, 38, 0));
    body.add(M(GEO.box(22, 8, 44), lam('#B3B8C4'), 0, 52, -2));
    const head = grp(0, 50, 30); body.add(head);
    head.add(M(GEO.box(22, 20, 22), lam('#8A8F9C'), 0, 0, 6));
    head.add(M(GEO.box(14, 10, 16), lam('#B3B8C4'), 0, -4, 20));
    for (const sx of [-1, 1]) { head.add(M(GEO.cone(5, 12, 4), lam('#6E7380'), sx * 7, 14, 2)); head.add(M(GEO.box(3, 3, 1), glowMat('#FFE45C'), sx * 6, 3, 17.5)); }
    r.parts.head = head;
    const tail = grp(0, 44, -27); body.add(tail);
    tail.add(rot(M(GEO.box(8, 8, 26), lam('#B3B8C4'), 0, 4, -12), 0.5, 0, 0));
    r.parts.tail = tail;
    for (const [x, z] of [[-9, 18], [9, 18], [-9, -18], [9, -18]]) { const l = grp(x, 26, z); l.add(M(GEO.box(8, 26, 8), lam('#6E7380'), 0, -13, 0)); body.add(l); (r.parts.legs = r.parts.legs || []).push(l); }
  } else if (mt === 'bird') {
    body.add(M(GEO.sph(26, 10, 8), lam('#E8C25A'), 0, 40, 0));
    body.add(M(GEO.sph(18, 10, 8), lam('#FFE69A'), 0, 36, 10));
    body.add(rot(M(GEO.cone(7, 14, 4), lam('#F08A30'), 0, 44, 30), Math.PI / 2, 0, 0));
    for (const sx of [-1, 1]) { body.add(M(GEO.box(4, 5, 2), lam('#1B1012'), sx * 10, 52, 22)); const w = grp(sx * 24, 46, 0); w.add(M(GEO.box(4, 18, 30), lam('#C79A30'), sx * 4, -6, -2)); body.add(w); (r.parts.wings = r.parts.wings || []).push(w); }
    for (const sx of [-1, 1]) body.add(M(GEO.box(3, 16, 3), lam('#F08A30'), sx * 8, 8, 2));
    for (const [x, rz] of [[-4, 0.3], [4, -0.3]]) body.add(rot(M(GEO.box(3, 12, 3), lam('#C79A30'), x, 70, -4), 0, 0, rz));
  } else if (mt === 'drake' || mt === 'lord') {   // 龙：小龙绿色，大龙紫色带角，翅膀会扇
    const big = mt === 'lord', s = big ? 1.55 : 1;
    const c1 = big ? '#7A4FB8' : '#4FAF6A', c2 = big ? '#4E2E80' : '#2F7A45', belly = big ? '#E8C8F0' : '#E8E0A0', wing = big ? '#5A3A92' : '#3A8A55';
    body.add(M(GEO.box(56 * s, 44 * s, 90 * s), lam(c1), 0, 56 * s, 0));
    body.add(M(GEO.box(48 * s, 12 * s, 80 * s), lam(belly), 0, 36 * s, 4 * s));
    const neck = grp(0, 70 * s, 40 * s); body.add(neck);
    neck.add(rot(M(GEO.box(26 * s, 26 * s, 40 * s), lam(c1), 0, 10 * s, 14 * s), -0.6, 0, 0));
    const head = grp(0, 30 * s, 34 * s); neck.add(head);
    head.add(M(GEO.box(36 * s, 30 * s, 40 * s), lam(c1), 0, 0, 10 * s));
    head.add(M(GEO.box(28 * s, 12 * s, 26 * s), lam(c2), 0, -12 * s, 24 * s));
    for (const sx of [-1, 1]) {
      head.add(M(GEO.box(6 * s, 5 * s, 2), glowMat(big ? '#FF5A5A' : '#FFE45C'), sx * 11 * s, 6 * s, 30.5 * s));
      head.add(rot(M(GEO.cone(5 * s, (big ? 30 : 16) * s, 5), lam(big ? '#F0E6C8' : belly), sx * 12 * s, 22 * s, -2 * s), -0.5, 0, sx * -0.3));
    }
    r.parts.head = head; r.parts.neck = neck;
    const tail = grp(0, 56 * s, -44 * s); body.add(tail);
    tail.add(rot(M(GEO.cone(22 * s, 90 * s, 6), lam(c1), 0, 0, -40 * s), -Math.PI / 2, 0, 0));
    r.parts.tail = tail;
    for (const sx of [-1, 1]) {
      const w = grp(sx * 26 * s, 80 * s, 6 * s); body.add(w);
      w.add(M(GEO.box(70 * s, 3 * s, 50 * s), lam(wing), sx * 36 * s, 6 * s, -6 * s));
      w.add(M(GEO.box(70 * s, 5 * s, 6 * s), lam(c2), sx * 36 * s, 8 * s, 18 * s));
      (r.parts.wings = r.parts.wings || []).push(w);
    }
    for (const [x, z] of [[-22, 30], [22, 30], [-22, -26], [22, -26]]) { const l = grp(x * s, 36 * s, z * s); l.add(M(GEO.box(16 * s, 36 * s, 18 * s), lam(c2), 0, -18 * s, 0)); body.add(l); (r.parts.legs = r.parts.legs || []).push(l); }
  }
  return r;
}
function animMonster(m, s, t) {
  const P = m.parts;
  m.body.position.y = Math.sin(t * 2) * 1.5;
  m.body.rotation.x = 0;
  const atk = s.atk >= 0 && s.atk < 0.5 ? Math.sin(s.atk / 0.5 * Math.PI) : 0;
  const mv = s.move;
  if (P.legs) P.legs.forEach((l, i) => { l.rotation.x = Math.sin(t * 10 + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI : 0)) * 0.6 * mv; });
  if (P.head) P.head.rotation.x = -atk * 0.5;
  if (P.neck) P.neck.rotation.x = atk * 0.3;
  if (P.tail) P.tail.rotation.y = Math.sin(t * 3) * 0.3;
  if (P.wings) P.wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * (Math.sin(t * (m.mt === 'bird' ? 12 : 3)) * 0.35 + (m.mt === 'bird' ? 0 : 0.2)); });
  if (P.arms) P.arms.forEach((a, i) => { a.rotation.x = -atk * 1.6 * (i ? 1 : 0.6); });
  if (P.flames) P.flames.forEach((f, i) => { f.scale.y = 0.8 + 0.3 * Math.sin(t * 9 + i); });
  if (atk) m.body.rotation.x = atk * 0.12;
  if (s.dead >= 0) { const k = Math.min(1, s.dead / 0.5); m.body.rotation.z = k * Math.PI / 2; m.body.position.y = -10 * k; }
}

if (typeof module !== 'undefined') module.exports = {};
