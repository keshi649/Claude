'use strict';
/* main.js：页面、各个画面（开头、怎么玩、选英雄、对阵、对局、暂停、商店、结算）、主循环，以及把对局里的事件变成特效、声音、播报。
   开头画面后面跑着一局电脑打电脑的真对局；选英雄时后面的画布换成一个展台，转着看英雄的三维模型。
   手机竖着拿时盖一层“请横过来”，对局暂停。帧率跟不上时自动降低清晰度、再关掉实时影子。 */

const STEP = 1 / 60;
const G = { scr: 'boot', W: null, me: null, demo: null, demoCam: null, demoT: 0, diff: 1, hero: 'warrior', paused: false, acc: 0, last: 0,
  endShown: false, crystalWarnT: -99, stats: { win: 0, lose: 0 }, img: {}, sc: null, dprGL: 1, dprMax: 1,
  perf: { t: 0, n: 0, off: false, warm: 1, good: 0, capped: false }, rotate: false, freeze: false };
const $ = s => document.querySelector(s);
const STORE = 'xgzf-v1';
function loadPrefs() {
  try { const p = JSON.parse(localStorage.getItem(STORE) || '{}'); if (p.diff != null) G.diff = p.diff; if (p.hero && HERO_BY_ID[p.hero]) G.hero = p.hero; if (p.sound === false) AU.on = false; if (p.stats) G.stats = p.stats; } catch (e) { /* 没有存档也能玩 */ }
}
function savePrefs() { try { localStorage.setItem(STORE, JSON.stringify({ diff: G.diff, hero: G.hero, sound: AU.on, stats: G.stats })); } catch (e) { /* 存不了就算了 */ } }

/* ---------- 尺寸 ---------- */
function layout() {
  const app = $('#app'), w = app.clientWidth, h = app.clientHeight;
  resize3D(w, h, G.dprGL);
  const cs = getComputedStyle(document.documentElement);
  const px = v => parseFloat(cs.getPropertyValue(v)) || 0;
  HUD.ins = { l: px('--sal'), r: px('--sar'), t: 0, b: px('--sab') };   // 底下一排按钮让开 iPhone 的横条（回到桌面的手势区）
  hudResize(w, h, Math.min(window.devicePixelRatio || 1, 2));
  G.rotate = h > w * 1.05;
  $('#rotate').classList.toggle('on', G.rotate && G.scr !== 'boot');
  if (G.rotate && G.scr === 'game' && G.W && G.W.winner < 0 && !G.paused) openPause();
}

/* ---------- 画面切换 ---------- */
function show(id) {
  for (const el of document.querySelectorAll('.scr')) el.hidden = el.id !== id;
  G.scr = id; G.perf.warm = 1;
  $('#rotate').classList.toggle('on', G.rotate && id !== 'boot');
}
function hideAll() { for (const el of document.querySelectorAll('.scr')) el.hidden = true; }
const pimg = hid => G.img['h' + hid] || '';
function iimg(id) { return G.img['i' + id] || (G.img['i' + id] = itemIcon(id, 64).toDataURL()); }
function simg(id) { return G.img['s' + id] || (G.img['s' + id] = skillIcon(id, 80).toDataURL()); }

/* ---------- 开头 ---------- */
function buildTitle() {
  const s = $('#title');
  s.innerHTML = `
    <div class="logo"><div class="l1">峡谷争锋</div><div class="l2">5V5 三路对战 · 推掉对面的水晶</div></div>
    <div class="menu">
      <button class="btn big" id="bStart">开始对战</button>
      <div class="seg" id="diffSeg" role="group" aria-label="难度">${DIFF.map((d, i) => `<button data-d="${i}" class="${i === G.diff ? 'on' : ''}">${d.name}</button>`).join('')}</div>
      <div class="row"><button class="btn sm" id="bHelp">怎么玩</button><button class="btn sm" id="bSound">${AU.on ? '音效：开' : '音效：关'}</button></div>
      <div class="rec" id="rec"></div>
    </div>`;
  $('#bStart').onclick = () => { audioInit(); ambientStart(); sfx('click'); buildSelect(); show('select'); };
  for (const b of s.querySelectorAll('#diffSeg button')) b.onclick = () => { G.diff = +b.dataset.d; savePrefs(); for (const x of s.querySelectorAll('#diffSeg button')) x.classList.toggle('on', x === b); audioInit(); sfx('click'); };
  $('#bSound').onclick = () => { audioInit(); setSound(!AU.on); $('#bSound').textContent = AU.on ? '音效：开' : '音效：关'; savePrefs(); sfx('click'); };
  $('#bHelp').onclick = () => { audioInit(); sfx('click'); show('help'); };
  $('#rec').textContent = G.stats.win + G.stats.lose ? `战绩：${G.stats.win} 胜 ${G.stats.lose} 负` : '';
  const h = $('#help');
  h.innerHTML = `<div class="box">
    <div class="hd">怎么玩</div>
    <p>你在<b class="b">蓝方</b>（左下），和 4 个电脑队友一起推掉右上角<b class="r">红方的水晶</b>就赢。三条路每路三座塔，一座一座推过去；小兵每 30 秒出一波。</p>
    <p><b>手机</b>（横着拿）：左下按住是摇杆。右下大圆键普攻，按住一直打（英雄优先）；旁边两个小键：左下<b>补刀</b>只打小兵野怪，右上<b>推塔</b>只打塔。</p>
    <p><b>技能</b>：开局先点技能左上角的金色“+”学技能，升级了再点。技能键点一下自动放；按住拖动自己瞄，拖到右上的“取消施法”松手就不放。</p>
    <p><b>锁定</b>：普攻打到的敌方英雄会自动锁定；点屏幕上的敌人、或技能上方的敌方头像也能锁定，之后普攻和技能都先打它，点空地取消。</p>
    <p><b>电脑</b>：WASD 移动，J 或空格普攻，K 补刀，L 推塔，1 2 3 放技能（朝鼠标），Shift+1 2 3 升级技能，F 闪现，H 恢复，B 回城，P 暂停。</p>
    <p>左边的金币是商店，推荐装备钱够了会亮，点一下就买。野区有红、蓝 BUFF，河道里有小龙和大龙；打掉大龙，三条路会出先锋帮你推塔。</p>
    <button class="btn" id="bHelpOk">知道了</button></div>`;
  $('#bHelpOk').onclick = () => { sfx('click'); show('title'); };
}

/* ---------- 选英雄：后面的画布是展台 ---------- */
function buildShowcase() {
  const sc = new THREE.Scene();
  sc.background = new THREE.Color('#0B1638');
  sc.fog = new THREE.Fog('#0B1638', 700, 1500);
  sc.add(new THREE.HemisphereLight('#C8DAFF', '#2A2030', 0.6));
  const key = new THREE.DirectionalLight('#FFF0D8', 0.85);
  key.position.set(-220, 420, 320); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -220, right: 220, top: 220, bottom: -220, near: 10, far: 1500 });
  sc.add(key);
  const rim = new THREE.DirectionalLight('#7FB0FF', 0.55); rim.position.set(260, 200, -320); sc.add(rim);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(900, 48).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#16224A' }));
  floor.receiveShadow = true; sc.add(floor);
  const ped = new THREE.Group();
  ped.add(M(GEO.cyl(118, 128, 16, 32), lam('#3A4A78'), 0, 8, 0));
  ped.add(M(GEO.cyl(104, 108, 6, 32), lam('#C9A24A'), 0, 19, 0));
  const pm = new THREE.Mesh(bakeGroup(ped), VCOL()); pm.receiveShadow = true; pm.castShadow = true; sc.add(pm);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(132, 2.2, 6, 64), new THREE.MeshBasicMaterial({ color: '#FBE6A6', transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
  ring.rotation.x = Math.PI / 2; ring.position.y = 4; sc.add(ring);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(110, 130, 600, 32, 1, true), new THREE.MeshBasicMaterial({ color: '#6A9CFF', transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  beam.position.y = 300; sc.add(beam);
  const cam = new THREE.PerspectiveCamera(30, 1, 10, 3000);
  G.sc = { scene: sc, cam, rig: null, hid: null, t: 0, castT: 9, ring };
}
function showcaseHero(hid) {
  const S = G.sc;
  if (S.hid === hid) return;
  if (S.rig) S.scene.remove(S.rig.root);
  S.rig = rigToSkinned(buildHero(hid));
  S.rig.root.scale.setScalar(HSCALE);
  S.rig.root.position.y = 22;
  S.scene.add(S.rig.root);
  S.hid = hid; S.castT = 0; S.t = 0;
}
function renderShowcase(dt) {
  const S = G.sc;
  S.t += dt; S.castT += dt;
  const cam = S.cam;
  cam.aspect = S3.w / S3.h; cam.updateProjectionMatrix();
  const far = S3.w / S3.h < 1.6 ? 520 : 440;
  cam.position.set(14, 150, far); cam.lookAt(14, 92, 0);
  if (S.rig) {
    S.rig.root.rotation.y = -0.35 + Math.sin(S.t * 0.45) * 0.35;
    animHero(S.rig, { move: 0, atk: S.castT > 1.2 && S.castT < 1.62 ? S.castT - 1.2 : -1, cast: S.castT < 0.45 ? S.castT : -1, stun: false, dead: -1 }, S.t);
  }
  S.ring.material.opacity = 0.6 + 0.25 * Math.sin(S.t * 2.5);
  S3.r.render(S.scene, cam);
}
function buildSelect() {
  const s = $('#select');
  const card = h => `<button class="card ${h.id === G.hero ? 'on' : ''}" data-h="${h.id}"><img src="${pimg(h.id)}" alt=""><span class="nm">${h.name}</span><span class="rl">${h.role}</span></button>`;
  s.innerHTML = `
    <div class="selL"><div class="hd">选择英雄 <small>你在蓝方 · ${DIFF[G.diff].name}</small></div><div class="cards">${HEROES.map(card).join('')}</div></div>
    <div class="selR"><div id="detail"></div>
      <div class="selBtns"><button class="btn sm" id="bBack">返回</button><button class="btn big" id="bGo">确定出战</button></div></div>`;
  const pick = hid => {
    G.hero = hid; savePrefs();
    for (const c of s.querySelectorAll('.card')) c.classList.toggle('on', c.dataset.h === hid);
    const h = HERO_BY_ID[hid];
    $('#detail').innerHTML = `
      <div class="dn">${h.name} <span>${h.role} · ${ROLE_LANE[h.lane]}</span></div>
      <div class="pas"><b>被动 · ${h.passive.name}</b>：${h.passive.desc}</div>
      ${h.skills.map((k, i) => `<div class="sk"><img src="${simg(k.id)}" alt=""><div><b>${i === 2 ? '大招' : '技能' + (i + 1)} · ${k.name}</b>（冷却 ${k.cd[0]} 秒）<br>${k.desc}</div></div>`).join('')}`;
    showcaseHero(hid);
    sfx('click');
  };
  for (const c of s.querySelectorAll('.card')) c.onclick = () => pick(c.dataset.h);
  pick(G.hero);
  $('#bBack').onclick = () => { sfx('click'); show('title'); };
  $('#bGo').onclick = () => { sfx('click'); startLoading(); };
}

/* ---------- 对阵、开局 ---------- */
function rosters(hid, seed) {
  // 蓝方：我 + 另外 4 个（6 个英雄里去掉一个）；红方：随机去掉一个
  const others = HEROES.map(h => h.id).filter(id => id !== hid);
  let r = seed;
  const rnd2 = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
  const dropB = others[Math.floor(rnd2() * others.length)];
  const blue = [hid, ...others.filter(id => id !== dropB)];
  const all = HEROES.map(h => h.id);
  const dropR = all[Math.floor(rnd2() * all.length)];
  const red = all.filter(id => id !== dropR);
  for (let i = red.length - 1; i > 0; i--) { const j = Math.floor(rnd2() * (i + 1)); [red[i], red[j]] = [red[j], red[i]]; }
  return { blue, red };
}
function startLoading() {
  const seed = (Date.now() % 100000) + 7;
  const { blue, red } = rosters(G.hero, seed);
  const s = $('#vs');
  const row = (list, team) => list.map((hid, i) => `<div class="vsh ${team ? 'r' : 'b'} ${team === 0 && i === 0 ? 'me' : ''}"><img src="${pimg(hid)}" alt=""><span>${HERO_BY_ID[hid].name}</span><small>${team === 0 && i === 0 ? '你' : '电脑'}</small></div>`).join('');
  s.innerHTML = `<div class="vsrow">${row(blue, 0)}</div><div class="vsmid"><span class="vb">蓝方</span><b>VS</b><span class="vr">红方</span></div><div class="vsrow">${row(red, 1)}</div>
    <div class="load"><div class="bar"><i id="ldbar"></i></div><span id="ldtxt">加载中 0%</span></div>`;
  show('vs');
  // 对局在后面先建好、先画一帧（着色器编译放在这时候），再揭开
  setTimeout(() => { prepGame(blue, red, seed); }, 60);
  let p = 0;
  const tick = () => {
    p = Math.min(100, p + 8 + Math.random() * 12);
    const bar = $('#ldbar'); if (bar) bar.style.width = p + '%';
    const tx = $('#ldtxt'); if (tx) tx.textContent = '加载中 ' + Math.floor(p) + '%';
    if (p < 100 || !G.W) setTimeout(tick, 100);
    else setTimeout(() => { hideAll(); G.scr = 'game'; G.paused = false; G.perf.warm = 1.5; G.last = performance.now(); }, 300);
  };
  tick();
}
function prepGame(blue, red, seed) {
  reset3D();
  G.W = newWorld({ blue, red, player: 0, diff: G.diff, seed });
  G.me = G.W.units.find(u => u.isPlayer);
  G.demo = null;
  HUD.ann.length = 0; HUD.feed.length = 0; HUD.floats.length = 0; HUD.toasts.length = 0;
  R3.camX = G.me.x; R3.camY = G.me.y;
  G.endShown = false; G.acc = 0; G.crystalWarnT = -99;
  inpReset();
  render3D(G.W, G.me, G.me, 0, null);
}

/* ---------- 暂停（战绩）、商店、结算 ---------- */
function board(W) {
  const row = h => `<tr class="${h.team ? 'r' : 'b'} ${h.isPlayer ? 'me' : ''}"><td><img src="${pimg(h.hid)}" alt=""></td><td>${HERO_BY_ID[h.hid].name}${h.isPlayer ? '（你）' : ''}</td><td>${h.lvl}</td><td>${h.kills}/${h.deaths}/${h.assists}</td><td>${Math.round(h.goldTotal)}</td><td class="its">${h.items.map(i => `<img src="${iimg(i)}" alt="${ITEMS[i].name}">`).join('')}</td></tr>`;
  return `<table class="board"><tr><th></th><th>英雄</th><th>级</th><th>击杀/死亡/助攻</th><th>经济</th><th>装备</th></tr>${W._heroes.filter(h => h.team === 0).map(row).join('')}<tr class="gap"><td colspan="6"></td></tr>${W._heroes.filter(h => h.team === 1).map(row).join('')}</table>`;
}
function openPause() {
  if (G.scr !== 'game' || G.W.winner >= 0) return;
  G.paused = true; inpReset();
  const s = $('#pause');
  s.innerHTML = `<div class="box wide"><div class="hd">暂停 <small>${fmtTime(G.W.t)} · 蓝 ${G.W.kills[0]} : ${G.W.kills[1]} 红</small></div>
    <div class="row"><button class="btn" id="pResume">继续</button><button class="btn sm" id="pSound">${AU.on ? '音效：开' : '音效：关'}</button><button class="btn sm red" id="pQuit">投降</button></div>
    ${board(G.W)}</div>`;
  show('pause');
  $('#pResume').onclick = () => { sfx('click'); closePause(); };
  $('#pSound').onclick = () => { setSound(!AU.on); savePrefs(); $('#pSound').textContent = AU.on ? '音效：开' : '音效：关'; };
  $('#pQuit').onclick = () => { sfx('click'); G.paused = false; hideAll(); G.scr = 'game'; surrender(); };
}
function closePause() { if (G.rotate) return; G.paused = false; hideAll(); G.scr = 'game'; G.last = performance.now(); }
function surrender() {
  const c = G.W.units.find(u => u.kind === 'crystal' && u.team === 0);
  if (c && !c.dead) { c.inv = false; hurt(G.W, null, c, 1e9, 't', { force: 1 }); }
}
function openShop() {
  if (G.scr !== 'game') return;
  inpReset();
  renderShop(null);
  show('shop');
}
function renderShop(sel) {
  const me = G.me, s = $('#shop');
  const nb = nextBuy(me);
  sel = sel || (nb && nb.id) || 'sword';
  const cats = [['推荐', HERO_BY_ID[me.hid].build], ['攻击', Object.keys(ITEMS).filter(k => ITEMS[k].cat === 'atk')], ['法术', Object.keys(ITEMS).filter(k => ITEMS[k].cat === 'mag')], ['防御', Object.keys(ITEMS).filter(k => ITEMS[k].cat === 'def')], ['移动', Object.keys(ITEMS).filter(k => ITEMS[k].cat === 'move')]];
  const I = ITEMS[sel];
  const have = me.items.slice(), owned = [];
  for (const c of I.from || []) { const i = have.indexOf(c); if (i >= 0) { owned.push(c); have.splice(i, 1); } }
  const price = I.cost - owned.reduce((a, c) => a + ITEMS[c].cost, 0);
  const full = me.items.length - owned.length >= 6;
  const stats = Object.keys(STAT_NAME).filter(k => I[k]).map(k => `+${I[k]}${['as', 'crit', 'critd', 'ls', 'cdr', 'apen', 'mpen'].includes(k) ? '%' : ''} ${STAT_NAME[k]}`);
  if (I.thorn) stats.push(`受到普攻时反弹 ${I.thorn}% 伤害`);
  if (I.frost) stats.push('技能打中英雄会减速');
  s.innerHTML = `<div class="box wide shopbox"><div class="hd">商店 <small>金币 ${Math.floor(me.gold)} · 随时能买</small><button class="x" id="sClose">关闭</button></div>
    <div class="shopwrap"><div class="shoplist">${cats.map(([nm, ids]) => `<div class="cat">${nm}</div><div class="its">${ids.map(id => `<button class="it ${id === sel ? 'on' : ''} ${me.items.includes(id) ? 'own' : ''}" data-i="${id}"><img src="${iimg(id)}" alt=""><span>${ITEMS[id].name}</span><small>${ITEMS[id].cost}</small></button>`).join('')}</div>`).join('')}</div>
    <div class="shopd"><img src="${iimg(sel)}" alt=""><div class="dn" style="font-size:20px;letter-spacing:2px">${I.name}</div><div>${stats.join('<br>')}</div>
    ${I.from ? `<div class="from">合成：${I.from.map(c => ITEMS[c].name).join(' + ')} + ${I.cost - I.from.reduce((a, c) => a + ITEMS[c].cost, 0)} 金</div>` : ''}
    <div class="inv">身上：${me.items.map(i => `<img src="${iimg(i)}" alt="${ITEMS[i].name}">`).join('') || '还没有装备'}</div>
    <button class="btn" id="sBuy" ${me.gold >= price && !full ? '' : 'disabled'}>${full ? '格子满了' : `购买 ${price} 金`}</button></div></div></div>`;
  for (const b of s.querySelectorAll('.it')) b.onclick = () => { sfx('click'); renderShop(b.dataset.i); };
  $('#sClose').onclick = () => { sfx('click'); hideAll(); G.scr = 'game'; };
  $('#sBuy').onclick = () => { if (buy(G.W, me, { id: sel, price, use: owned })) { sfx('coin'); renderShop(sel); } };
}
function showResult() {
  const W = G.W, win = W.winner === 0;
  if (win) G.stats.win++; else G.stats.lose++;
  savePrefs();
  const score = h => h.kills * 3 + h.assists * 1.5 - h.deaths * 1.2 + h.dmgH / 900 + h.goldTotal / 2500;
  const mvp = W._heroes.filter(h => h.team === W.winner).sort((a, b) => score(b) - score(a))[0];
  const me = G.me;
  const s = $('#result');
  s.innerHTML = `<div class="box wide"><div class="res ${win ? 'win' : 'lose'}">${win ? '胜利' : '失败'}</div>
    <div class="sub">用时 ${fmtTime(W.t)} · 蓝 ${W.kills[0]} : ${W.kills[1]} 红 · 你 ${me.kills}/${me.deaths}/${me.assists}${mvp ? ` · MVP：${HERO_BY_ID[mvp.hid].name}${mvp.isPlayer ? '（你）' : ''}` : ''}</div>
    <div class="row"><button class="btn" id="rAgain">再来一局</button><button class="btn sm" id="rHome">返回主页</button></div>
    ${board(W)}</div>`;
  show('result');
  $('#rAgain').onclick = () => { sfx('click'); startDemo(); buildSelect(); show('select'); };
  $('#rHome').onclick = () => { sfx('click'); startDemo(); buildTitle(); show('title'); };
}

/* ---------- 开头背景：电脑打电脑的真对局 ---------- */
function startDemo() {
  reset3D();
  const ids = HEROES.map(h => h.id);
  const sd = (Date.now() % 9999) + 1;
  G.demo = newWorld({ blue: ids.slice(0, 5), red: ids.slice(1), player: -1, diff: 1, seed: sd });
  for (let i = 0; i < 70 * 30; i++) { step(G.demo, 1 / 30); G.demo.ev.length = 0; }   // 快进 70 秒，开头就有兵线在打
  G.demoT = 0; G.demoCam = G.demo._heroes[0];
  R3.camX = G.demoCam.x; R3.camY = G.demoCam.y;
  G.W = null; G.me = null;
}

/* ---------- 事件 → 特效、声音、播报 ---------- */
const SPREE = { 3: ['大杀特杀', 'spree3'], 4: ['主宰比赛', 'spree4'], 5: ['杀人如麻', 'spree5'], 6: ['无人能挡', 'spree6'], 7: ['横扫千军', 'spree7'] };
const MULTI = { 2: ['双杀', 'double'], 3: ['三杀', 'triple'], 4: ['四杀', 'quadra'], 5: ['五杀', 'penta'] };
const CAST_SFX = { t1: 'dash', t2: 'shield', t3: 'big', w1: 'whirl', w2: 'dash', w3: 'big', a1: 'dash', a2: 'stealth', a3: 'big', m1: 'fire', m2: 'ice', m3: 'meteor', s1: 'shoot', s2: 'dash', s3: 'big', h1: 'heal', h2: 'magic', h3: 'shield' };
function handleEvents(W, me, quiet) {
  for (const e of W.ev) {
    switch (e.t) {
      case 'dmg': {
        if (quiet) break;
        if (me && e.src === me.id && e.v >= 1) {
          const col = e.crit ? '#FFC23A' : e.ty === 'm' ? '#D9A8FF' : e.ty === 't' ? '#FFFFFF' : '#FFF4E0';
          const u = byId(W, e.id);
          floatText(e.x, e.y, u ? unitTop(u) * 0.75 : 80, String(Math.round(e.v)), col, { size: e.crit ? 21 : 15, crit: e.crit });
        } else if (me && e.id === me.id && e.v >= 1) {
          floatText(me.x, me.y, 110, '-' + Math.round(e.v), '#FF6A5A', { size: 14 });
          if (e.v > me.maxHp * 0.12) R3.shake = Math.max(R3.shake, 3);
        }
        const u = byId(W, e.id);
        if (u && u.kind === 'crystal' && u.team === 0 && W.t - G.crystalWarnT > 20 && e.src) {
          const s = byId(W, e.src); if (s && s.team === 1) { G.crystalWarnT = W.t; announce('我方水晶正在遭受攻击', C.red, { voice: 'crystal' }); }
        }
        if (u && (u.kind === 'hero' || u.kind === 'monster' || u.kind === 'tower' || u.kind === 'crystal')) sfx('hit', e.x, e.y, e.crit ? 1 : 0.55);
        break;
      }
      case 'heal': if (!quiet && me && e.id === me.id && e.v >= 20) floatText(me.x, me.y, 120, '+' + Math.round(e.v), '#7CFF7C', { size: 14 }); break;
      case 'gold': if (!quiet && me && e.id === me.id) { floatText(me.x + 30, me.y, 140, '+' + e.v, C.gold, { size: 13, dur: 0.8 }); sfx('coin', null, null, 0.5); } break;
      case 'lvl': {
        fx3Unit(W, e);
        if (!quiet && me && e.id === me.id) {
          sfx('levelup');
          floatText(me.x, me.y, 175, '升级', C.gold2, { size: 18, dur: 1.2 });
          if (me.manual && me.skillPts > 0) toast(e.lvl === 4 || e.lvl === 8 || e.lvl === 12 ? '可以升级大招了：点技能左上角的 +' : '可以升级技能：点技能左上角的 +', C.gold2);
        }
        break;
      }
      case 'atk': {
        if (me && e.id === me.id) { const t = byId(W, e.tid); if (t && t.kind === 'hero') INP.lock = t.id; }
        if (quiet) break;
        if (e.kind === 'hero') sfx(e.proj === 'arrow' ? 'shoot' : e.proj === 'orb' ? 'magic' : e.proj === 'heart' ? 'heart' : 'swing', e.x, e.y, 0.7);
        else if (e.kind === 'tower' || e.kind === 'crystal') sfx('tower', e.x, e.y, 0.8);
        else if (e.kind === 'monster') sfx('swing', e.x, e.y, 0.5);
        break;
      }
      case 'cast': { fx3Unit(W, e); const h = byId(W, e.id); if (!quiet && h) sfx(CAST_SFX[e.sid], h.x, h.y, 0.9); break; }
      case 'fx': {
        fx3Event(W, e);
        if (quiet) break;
        const snd = { quake: 'boom', land: 'thud', boom: 'boom', ice: 'ice', meteorHit: 'boom', bonk: 'stun', blink: 'flash', flash: 'flash', cut: 'swing', dome: 'shield' }[e.k];
        if (snd) sfx(snd, e.x, e.y, e.k === 'meteorHit' ? 0.45 : e.k === 'boom' ? 0.6 : 0.9);
        if (e.k === 'quake') R3.shake = Math.max(R3.shake, 5);
        break;
      }
      case 'die': {
        fx3Unit(W, e);
        if (quiet) break;
        if (e.kind === 'hero') sfx('death', e.x, e.y);
        else if (e.kind === 'minion') sfx('pop', e.x, e.y, 0.5);
        else if (e.kind === 'tower' || e.kind === 'crystal') { sfx('crumble', e.x, e.y, 1); R3.shake = 7; }
        break;
      }
      case 'kill': if (!quiet) killEvent(W, me, e); break;
      case 'tower': if (!quiet) { const mine = e.team === 0; announce(mine ? '我方防御塔被摧毁了' : '摧毁一座敌方防御塔', mine ? C.red : C.gold, { voice: mine ? 'towerLost' : 'towerKill' }); } break;
      case 'dragon': if (!quiet) { const ours = e.team === 0, big = e.mt === 'lord'; announce(`${ours ? '我方' : '敌方'}击败了${big ? '大龙' : '小龙'}`, ours ? C.gold : C.red, { voice: (big ? 'lord' : 'drake') + (ours ? 'B' : 'R'), sub: big ? (ours ? '三条路出现了我方先锋' : '小心敌方先锋') : (ours ? '全队金币 +' + MONSTER.drake.teamGold : '') }); } break;
      case 'dragonSpawn': if (!quiet && W.t > 5) announce(e.mt === 'lord' ? '大龙出现了' : '小龙出现了', '#D8B0FF', { voice: e.mt === 'lord' ? 'lordUp' : 'drakeUp', dur: 2 }); break;
      case 'say': if (!quiet) { if (e.k === 'welcome') { announce('欢迎来到峡谷争锋', C.gold, { voice: 'welcome', dur: 2.6 }); if (me && me.manual) setTimeout(() => toast('点技能左上角的 + 学技能', C.gold2), 2600); } else if (e.k === 'five') announce('敌军还有 5 秒到达战场', C.gold, { voice: 'five' }); else if (e.k === 'go') { announce('全军出击', C.gold, { voice: 'go', dur: 1.8 }); sfx('wave'); } } break;
      case 'recall': if (!quiet && me && e.id === me.id) sfx('recall'); break;
      case 'buy': if (!quiet && me && e.id === me.id) { toast('购买了 ' + ITEMS[e.item].name, C.gold2); sfx('coin'); } break;
      case 'respawn': fx3Unit(W, e); break;
      case 'skillUp': if (!quiet && me && e.id === me.id) { HUD.lvlFlash[e.s] = 0.9; sfx('coin', null, null, 0.8); } break;
      case 'end': R3.shake = 9; break;
    }
  }
  W.ev.length = 0;
}
function killEvent(W, me, e) {
  const k = byId(W, e.k), v = byId(W, e.v);
  if (!v) return;
  HUD.feed.unshift({ k: k ? k.hid : null, kt: 1 - v.team, v: v.hid, vt: v.team, t: 0 });
  const ours = v.team === 1;
  const col = ours ? C.gold : C.red;
  const opt = { k: k ? [k.hid, k.team] : null, v: [v.hid, v.team] };
  sfx('kill', null, null, 0.7);
  if (e.first) announce('第一滴血', col, Object.assign({ voice: 'first' }, opt));
  else if (e.multi >= 2) { const m = MULTI[Math.min(5, e.multi)]; announce(m[0], col, Object.assign({ voice: m[1] }, opt)); }
  else if (e.streak >= 3) { const s = e.streak >= 8 ? ['超神了', 'legend'] : SPREE[e.streak]; announce(s[0], col, Object.assign({ voice: s[1] }, opt)); }
  else if (e.shut) announce('终结', col, Object.assign({ voice: 'shut' }, opt));
  else if (me && k && k.id === me.id) announce('你击败了一个敌人', C.gold, Object.assign({ voice: 'youkill', dur: 2 }, opt));
  else if (me && v.id === me.id) announce('你被击败了', C.red, Object.assign({ voice: 'youdie', dur: 2 }, opt));
  else announce(ours ? '我方击败了敌人' : '敌方击败了我方英雄', col, Object.assign({ dur: 1.6 }, opt));
  if (e.ace) announce('团灭', col, { voice: 'ace', dur: 2, sub: ours ? '趁现在去推塔！' : '守住高地！' });
}

/* ---------- 帧率：跟不上就降清晰度、再关实时影子；很流畅就往上加清晰度 ---------- */
// 手机起步 1.5 倍（电脑 2 倍），1.5 秒看一次：低于 48 帧降一档，之后就不再往上加；连着两次 57 帧以上、没降过，加 0.25（最多到设备的像素比，封顶 2）
function perfTick(dt) {
  const P = G.perf;
  if (P.off) return;
  if (P.warm > 0) { P.warm -= dt; P.t = 0; P.n = 0; return; }   // 刚换画面、刚编译完着色器的那一下不算
  P.t += dt; P.n++;
  if (P.t < 1.5) return;
  const fps = P.n / P.t;
  P.t = 0; P.n = 0;
  if (fps < 48) {
    P.capped = true; P.good = 0;
    if (G.dprGL > 1.01) { G.dprGL = Math.max(1, G.dprGL - 0.25); layout(); }
    else if (S3.sun.castShadow) {
      S3.sun.castShadow = false; S3.r.shadowMap.enabled = false;
      S3.scene.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.needsUpdate = true; }); });
    } else if (G.dprGL > 0.76) { G.dprGL = Math.max(0.75, G.dprGL - 0.25); layout(); }
    P.warm = 0.5;
  } else if (fps > 57 && !P.capped && G.dprGL < G.dprMax - 0.01) {
    if (++P.good >= 2) { P.good = 0; G.dprGL = Math.min(G.dprMax, G.dprGL + 0.25); layout(); P.warm = 0.5; }
  }
}
// 每一步模拟之前记下位置，画的时候在两步之间插值
function savePrev(W) {
  for (const u of W.units) { u._px = u.x; u._py = u.y; }
  for (const p of W.projs) { p._px = p.x; p._py = p.y; }
}

/* ---------- 主循环 ---------- */
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, Math.max(0, (now - G.last) / 1000));
  G.last = now;
  if (G.scr === 'boot') return;
  if (G.scr === 'select' && G.sc) { renderShowcase(dt); HUD.g.setTransform(1, 0, 0, 1, 0, 0); HUD.g.clearRect(0, 0, HUD.cv.width, HUD.cv.height); return; }
  const W = G.W;
  if (W && ['game', 'shop', 'pause', 'result', 'vs'].includes(G.scr)) {
    const run = G.scr !== 'vs' && G.scr !== 'result' && !G.paused && !G.rotate;
    if (run) {
      playerCmd(W, G.me);
      G.acc += dt;
      let n = 0;
      while (G.acc >= STEP && n < 4) { savePrev(W); step(W, STEP); G.acc -= STEP; n++; }
      if (n === 4) G.acc = 0;
      R3.alpha = clamp(G.acc / STEP, 0, 1);
      handleEvents(W, G.me, false);
      perfTick(dt);
    } else R3.alpha = 1;
    if (W.winner >= 0 && !G.endShown) {
      G.endShown = true;
      const cr = W.units.find(u => u.kind === 'crystal' && u.team !== W.winner);
      R3.peek = cr ? [cr.x, cr.y] : null;
      setTimeout(() => {
        announce(W.winner === 0 ? '胜利' : '失败', W.winner === 0 ? C.gold : C.red, { voice: W.winner === 0 ? 'win' : 'lose', dur: 3, urgent: true });
        sfx(W.winner === 0 ? 'win' : 'lose');
      }, 900);
      setTimeout(() => { R3.peek = null; showResult(); }, 3600);
    }
    AU.camX = R3.camX; AU.camY = R3.camY;
    if (run) ambientTick(dt);
    render3D(W, G.me, G.me, run ? dt : 0, G.scr === 'game' ? INP.aim : null);
    if (G.scr === 'game' || G.scr === 'shop' || G.scr === 'pause') drawHUD(W, G.me, run ? dt : 0, 'game');
    else drawHUD(null, null, 0);
  } else if (G.demo) {
    const D = G.demo;
    G.acc += dt;
    let n = 0;
    while (!G.freeze && G.acc >= 1 / 30 && n < 3) { savePrev(D); step(D, 1 / 30); G.acc -= 1 / 30; n++; }
    if (n === 3) G.acc = 0;
    R3.alpha = G.freeze ? 1 : clamp(G.acc * 30, 0, 1);
    if (G.scr === 'title') perfTick(dt);
    handleEvents(D, null, true);
    G.demoT += dt;
    if (!G.freeze && (G.demoT > 9 || G.demoCam.dead)) {        // 换一个英雄跟拍，挑离敌人最近的（有架打）
      G.demoT = 0;
      let best = null, bd = 1e9;
      for (const h of D._heroes) { if (h.dead) continue; for (const e of D._heroes) if (e.team !== h.team && !e.dead) { const d = dist(h, e); if (d < bd) { bd = d; best = h; } } }
      G.demoCam = best || D._heroes[0];
    }
    if (D.winner >= 0) startDemo();
    render3D(G.demo, G.demoCam, null, G.freeze ? 0 : dt, null);
    drawHUD(G.demo, null, G.freeze ? 0 : dt, 'demo');
  }
}

/* ---------- 启动 ---------- */
function bindInput() {
  const cv = HUD.cv;
  const pos = ev => { const r = cv.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
  cv.addEventListener('pointerdown', ev => {
    ev.preventDefault();
    try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* 有的浏览器不支持 */ }
    audioInit();
    if (G.scr !== 'game' || G.paused) return;
    const [x, y] = pos(ev);
    onPointerDown(G.W, G.me, ev.pointerId, x, y);
  });
  cv.addEventListener('pointermove', ev => {
    const [x, y] = pos(ev);
    if (ev.pointerType === 'mouse') { INP.mouse = [x, y]; INP.mouseT = R3.t; }
    if (G.scr !== 'game') return;
    onPointerMove(G.W, G.me, ev.pointerId, x, y);
  });
  const up = ev => { if (!G.me) return; onPointerUp(G.W, G.me, ev.pointerId); };
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', up);
  cv.addEventListener('contextmenu', ev => ev.preventDefault());
  window.addEventListener('keydown', ev => {
    if (G.scr === 'game' && !G.paused) {
      if (ev.code === 'KeyP' || ev.code === 'Escape') { openPause(); return; }
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(ev.code)) ev.preventDefault();
      if (!ev.repeat) onKey(G.W, G.me, ev.code, true, ev.shiftKey);
      else INP.keys[ev.code] = true;
    } else if (G.scr === 'pause' && (ev.code === 'KeyP' || ev.code === 'Escape')) closePause();
    else if (G.scr === 'shop' && ev.code === 'Escape') { hideAll(); G.scr = 'game'; }
  });
  window.addEventListener('keyup', ev => { onKey(G.W, G.me, ev.code, false); });
  window.addEventListener('blur', () => { INP.keys = {}; INP.keyAtk = false; });
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.scr === 'game' && G.W && G.W.winner < 0) openPause(); });
  INP.onPause = openPause;
  INP.onShop = openShop;
}
// 页面更新（重新发布）时保住正在打的这一局：对局数据是纯 JSON（下划线开头的是缓存，不存）
function snapshotState() {
  const base = { hero: G.hero, diff: G.diff };
  if (!G.W || !G.me || G.W.winner >= 0 || !['game', 'pause', 'shop'].includes(G.scr)) return base;
  try { base.save = JSON.stringify(G.W, (k, v) => (k[0] === '_' ? undefined : v)); base.camX = R3.camX; base.camY = R3.camY; } catch (e) { /* 存不了就不存 */ }
  return base;
}
function restoreGame(data) {
  try {
    const W = JSON.parse(data.save);
    relink(W);
    const me = W.units.find(u => u.isPlayer);
    if (!me) return false;
    reset3D();
    G.W = W; G.me = me; G.demo = null;
    R3.camX = data.camX || me.x; R3.camY = data.camY || me.y;
    G.endShown = false; G.acc = 0; G.crystalWarnT = -99;
    inpReset(); hideAll(); G.scr = 'game';
    openPause();
    return true;
  } catch (e) { return false; }
}
function boot(data) {
  data = data || {};
  const bootTxt = $('#bootTxt');
  if (typeof THREE === 'undefined') { if (bootTxt) bootTxt.textContent = '三维引擎没加载上，请检查网络后刷新。'; return; }
  loadPrefs();
  if (data.hero && HERO_BY_ID[data.hero]) G.hero = data.hero;
  if (data.diff != null) G.diff = data.diff;
  HUD.keyboard = !(('ontouchstart' in window) || navigator.maxTouchPoints > 0);
  G.dprMax = Math.min(window.devicePixelRatio || 1, 2);
  G.dprGL = HUD.keyboard ? G.dprMax : Math.min(G.dprMax, 1.5);
  HUD.cv = $('#hud'); HUD.g = HUD.cv.getContext('2d');
  try { initRenderer($('#gl')); } catch (e) { if (bootTxt) bootTxt.textContent = '这个浏览器不支持 WebGL，玩不了三维画面。'; return; }
  layout();
  window.addEventListener('resize', () => setTimeout(layout, 50));
  if (window.visualViewport) window.visualViewport.addEventListener('resize', () => setTimeout(layout, 50));
  bindInput();
  // 分几步建，中间让“加载中”画出来
  const steps = [
    ['地图', () => { initGrid(); S3.scene = buildScene(); init3D(S3.scene); }],
    ['英雄', () => { const ps = heroPortraits(96); HUD.portraits = ps; for (const id in ps) G.img['h' + id] = ps[id].toDataURL(); }],
    ['界面', () => { HUD.mini = buildMinimap(256); buildShowcase(); buildTitle(); }],
    ['开场', () => { if (!(data.save && restoreGame(data))) { startDemo(); show('title'); } G.last = performance.now(); }],
  ];
  let i = 0;
  const next = () => {
    if (i >= steps.length) return;
    const [nm, fn] = steps[i++];
    if (bootTxt) bootTxt.textContent = '加载中：' + nm + '…';
    setTimeout(() => {
      try { fn(); } catch (e) { if (bootTxt) bootTxt.textContent = '出错了：' + e.message; throw e; }
      next();
    }, 16);
  };
  next();
  requestAnimationFrame(frame);
}
function start(data) {
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', () => boot(data));
  else boot(data);
}
const HOT = window.claude && window.claude.hot;
if (HOT && HOT.snapshot) HOT.snapshot(snapshotState);
if (HOT && HOT.ready) HOT.ready(start); else start((HOT && HOT.data) || {});
