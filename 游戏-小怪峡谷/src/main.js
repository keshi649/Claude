'use strict';
/* main.js：页面、各个画面（开头、选英雄、对阵、对局、暂停、商店、结算）、主循环，以及把对局里的事件变成特效、声音、播报。
   手机竖着拿时，整个画面转 90 度（横着玩）；触摸坐标跟着换算。 */

const STEP = 1 / 60;
const G = { scr: 'boot', W: null, me: null, demo: null, demoCam: 0, demoT: 0, diff: 1, hero: 'warrior', paused: false, acc: 0, last: 0,
  rot: false, cssW: 0, cssH: 0, shopOpen: false, endShown: false, crystalWarnT: -99, stats: { win: 0, lose: 0 } };
const $ = s => document.querySelector(s);
const STORE = 'xgxg-v1';
function loadPrefs() {
  try { const p = JSON.parse(localStorage.getItem(STORE) || '{}'); if (p.diff != null) G.diff = p.diff; if (p.hero && HERO_BY_ID[p.hero]) G.hero = p.hero; if (p.sound === false) AU.on = false; if (p.stats) G.stats = p.stats; } catch (e) { /* 没有存档也能玩 */ }
}
function savePrefs() { try { localStorage.setItem(STORE, JSON.stringify({ diff: G.diff, hero: G.hero, sound: AU.on, stats: G.stats })); } catch (e) { /* 存不了就算了 */ } }

/* ---------- 尺寸和旋转 ---------- */
function layout() {
  const app = $('#app'), st = $('#stage');
  const vw = app.clientWidth, vh = app.clientHeight;
  G.rot = vh > vw * 1.05;                    // 竖屏：整个画面转 90 度
  G.cssW = G.rot ? vh : vw; G.cssH = G.rot ? vw : vh;
  st.style.width = G.cssW + 'px'; st.style.height = G.cssH + 'px';
  st.style.transform = G.rot ? `translate(${vw}px,0) rotate(90deg)` : 'none';
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  resizeRender(G.cssW, G.cssH, dpr);
  // 刘海让出的地方（横屏时左右）
  const cs = getComputedStyle(document.documentElement);
  const px = v => (parseFloat(cs.getPropertyValue(v)) || 0) * dpr / R.k;
  INS.l = Math.round(px('--sal')); INS.r = Math.round(px('--sar')); INS.t = 0; INS.b = Math.round(px('--sab') * 0.5);
  if (G.rot) { INS.l = INS.r = 0; }
}
function toGame(cx, cy) {                   // 视口坐标 → 舞台里的 CSS 坐标
  const r = $('#app').getBoundingClientRect();
  const x = cx - r.left, y = cy - r.top;
  return G.rot ? [y, r.width - x] : [x, y];
}

/* ---------- 画面切换 ---------- */
function show(id) {
  for (const el of document.querySelectorAll('.scr')) el.hidden = el.id !== id;
  G.scr = id;
}
function hideAll() { for (const el of document.querySelectorAll('.scr')) el.hidden = true; }
function imgURL(c, scale) {
  const o = mkc(c.width * scale, c.height * scale), g = o.getContext('2d');
  g.imageSmoothingEnabled = false; g.drawImage(c, 0, 0, o.width, o.height);
  return o.toDataURL();
}
function heroImg(hid, scale) { return imgURL(heroSprite(hid, 'idle', 0, 1, false), scale || 3); }
function iconImg(name, scale) { return imgURL(icon(name), scale || 2); }

/* ---------- 开头 ---------- */
function buildTitle() {
  const s = $('#title');
  s.innerHTML = `
    <div class="logo"><div class="l1">小怪峡谷</div><div class="l2">5V5 像素对战 · 推掉对面的水晶</div></div>
    <div class="menu">
      <button class="btn big" id="bStart">开始对战</button>
      <div class="seg" id="diffSeg">${DIFF.map((d, i) => `<button data-d="${i}" class="${i === G.diff ? 'on' : ''}">${d.name}</button>`).join('')}</div>
      <div class="row"><button class="btn sm" id="bHelp">怎么玩</button><button class="btn sm" id="bSound">${AU.on ? '音效：开' : '音效：关'}</button></div>
      <div class="rec" id="rec"></div>
    </div>
    <div class="credit">甜菜 出品 · 画面和音效：Claude 用代码生成 · 播报配音：CosyVoice 3 合成</div>`;
  $('#bStart').onclick = () => { audioInit(); ambientStart(); sfx('click'); buildSelect(); show('select'); };
  for (const b of s.querySelectorAll('#diffSeg button')) b.onclick = () => { G.diff = +b.dataset.d; savePrefs(); for (const x of s.querySelectorAll('#diffSeg button')) x.classList.toggle('on', x === b); audioInit(); sfx('click'); };
  $('#bSound').onclick = () => { audioInit(); setSound(!AU.on); $('#bSound').textContent = AU.on ? '音效：开' : '音效：关'; savePrefs(); sfx('click'); };
  $('#bHelp').onclick = () => { audioInit(); sfx('click'); show('help'); };
  $('#rec').textContent = G.stats.win + G.stats.lose ? `战绩：${G.stats.win} 胜 ${G.stats.lose} 负` : '';
  const h = $('#help');
  h.innerHTML = `<div class="box">
    <div class="hd">怎么玩</div>
    <p>你是<b class="b">蓝方</b>，和 4 个电脑队友一起，推掉右上角<b class="r">红方的水晶</b>就赢。三条路上每路三座塔，一座一座推过去；小兵每 30 秒出一波。</p>
    <p><b>手机</b>：横着拿。左手按住屏幕左半边任意地方就是摇杆；右手按住大圆键普攻（自动打身边血最少的敌人）。技能键点一下自动放，按住拖动可以自己瞄准，拖到“取消”上松手就不放。</p>
    <p><b>电脑</b>：WASD 移动，J 或空格普攻，1 2 3 技能（朝鼠标的方向），F 闪现，H 恢复，B 回城，P 暂停。</p>
    <p>金币够了左边的<b class="g">推荐装备</b>会闪，点一下就买。2 级解锁第二个技能，4 级解锁大招。野区有红、蓝 BUFF，河道里有小龙和大龙；打掉大龙，三条路会出先锋帮你推塔。残血就按回城。</p>
    <button class="btn" id="bHelpOk">知道了</button></div>`;
  $('#bHelpOk').onclick = () => { sfx('click'); show('title'); };
}

/* ---------- 选英雄 ---------- */
function buildSelect() {
  const s = $('#select');
  const card = h => `<button class="card ${h.id === G.hero ? 'on' : ''}" data-h="${h.id}"><img src="${heroImg(h.id, 2)}" alt=""><span class="nm">${h.name}</span><span class="rl">${h.role}</span></button>`;
  s.innerHTML = `
    <div class="hd">选择你的英雄 <small>你在蓝方 · 难度：${DIFF[G.diff].name}</small></div>
    <div class="selwrap">
      <div class="cards">${HEROES.map(card).join('')}</div>
      <div class="detail" id="detail"></div>
    </div>
    <div class="row"><button class="btn sm" id="bBack">返回</button><button class="btn big" id="bGo">确定出战</button></div>`;
  const pick = hid => {
    G.hero = hid; savePrefs();
    for (const c of s.querySelectorAll('.card')) c.classList.toggle('on', c.dataset.h === hid);
    const h = HERO_BY_ID[hid];
    $('#detail').innerHTML = `
      <div class="dtop"><img src="${heroImg(hid, 3)}" alt=""><div><div class="dn">${h.name} <span>${h.role} · ${ROLE_LANE[h.lane]}</span></div>
      <div class="pas"><b>被动 · ${h.passive.name}</b>：${h.passive.desc}</div></div></div>
      ${h.skills.map((k, i) => `<div class="sk"><img src="${iconImg(k.id, 2)}" alt=""><div><b>${i === 2 ? '大招' : '技能' + (i + 1)} · ${k.name}</b>（冷却 ${k.cd[0]} 秒）<br>${k.desc}</div></div>`).join('')}`;
    sfx('click');
  };
  for (const c of s.querySelectorAll('.card')) c.onclick = () => pick(c.dataset.h);
  pick(G.hero);
  $('#bBack').onclick = () => { sfx('click'); show('title'); };
  $('#bGo').onclick = () => { sfx('click'); startLoading(); };
}

/* ---------- 对阵、开局 ---------- */
function rosters(hid, seed) {
  // 蓝方：我 + 另外 4 个（6 个英雄里去掉一个，优先保留打野、射手）；红方：随机去掉一个
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
  const row = (list, team) => list.map((hid, i) => `<div class="vsh ${team ? 'r' : 'b'} ${team === 0 && i === 0 ? 'me' : ''}"><img src="${heroImg(hid, 2)}" alt=""><span>${HERO_BY_ID[hid].name}</span><small>${team === 0 && i === 0 ? '你' : '电脑'}</small></div>`).join('');
  s.innerHTML = `<div class="vsrow">${row(blue, 0)}</div><div class="vsmid"><span class="vb">蓝方</span><b>VS</b><span class="vr">红方</span></div><div class="vsrow">${row(red, 1)}</div>
    <div class="load"><div class="bar"><i id="ldbar"></i></div><span id="ldtxt">加载中 0%</span></div>`;
  show('vs');
  let p = 0;
  const tick = () => {
    p = Math.min(100, p + 7 + Math.random() * 12);
    const bar = $('#ldbar'); if (bar) bar.style.width = p + '%';
    const tx = $('#ldtxt'); if (tx) tx.textContent = '加载中 ' + Math.floor(p) + '%';
    if (p < 100) setTimeout(tick, 90);
    else setTimeout(() => startGame(blue, red, seed), 350);
  };
  tick();
}
function startGame(blue, red, seed) {
  G.W = newWorld({ blue, red, player: 0, diff: G.diff, seed });
  G.me = G.W.units.find(u => u.isPlayer);
  G.demo = null;
  R.parts.length = 0; R.floats.length = 0; R.fxs.length = 0; HUD.ann.length = 0; HUD.feed.length = 0; HUD.tips = 12;
  R.camX = G.me.x; R.camY = G.me.y;
  G.paused = false; G.endShown = false; G.acc = 0; G.crystalWarnT = -99;
  inpReset();
  hideAll(); G.scr = 'game';
}

/* ---------- 暂停（战绩）、商店、结算 ---------- */
function board(W) {
  const row = h => `<tr class="${h.team ? 'r' : 'b'} ${h.isPlayer ? 'me' : ''}"><td><img src="${heroImg(h.hid, 1)}" alt=""></td><td>${HERO_BY_ID[h.hid].name}${h.isPlayer ? '（你）' : ''}</td><td>${h.lvl}</td><td>${h.kills}/${h.deaths}/${h.assists}</td><td>${Math.round(h.goldTotal)}</td><td class="its">${h.items.map(i => `<img src="${iconImg(i, 1)}" alt="${ITEMS[i].name}">`).join('')}</td></tr>`;
  return `<table class="board"><tr><th></th><th>英雄</th><th>级</th><th>击杀/死亡/助攻</th><th>经济</th><th>装备</th></tr>${W._heroes.filter(h => h.team === 0).map(row).join('')}<tr class="gap"><td colspan="6"></td></tr>${W._heroes.filter(h => h.team === 1).map(row).join('')}</table>`;
}
function openPause() {
  if (G.scr !== 'game' || G.W.winner >= 0) return;
  G.paused = true; inpReset();
  const s = $('#pause');
  s.innerHTML = `<div class="box wide"><div class="hd">暂停 · ${fmtTime(G.W.t)} · 蓝 ${G.W.kills[0]} : ${G.W.kills[1]} 红</div>
    <div class="row"><button class="btn" id="pResume">继续</button><button class="btn sm" id="pAuto">${G.W.auto ? '取消托管' : '托管'}</button><button class="btn sm" id="pSound">${AU.on ? '音效：开' : '音效：关'}</button><button class="btn sm red" id="pQuit">投降</button></div>
    ${board(G.W)}</div>`;
  show('pause');
  $('#pResume').onclick = () => { sfx('click'); closePause(); };
  $('#pAuto').onclick = () => { G.W.auto = !G.W.auto; sfx('click'); closePause(); };
  $('#pSound').onclick = () => { setSound(!AU.on); savePrefs(); $('#pSound').textContent = AU.on ? '音效：开' : '音效：关'; };
  $('#pQuit').onclick = () => { sfx('click'); G.paused = false; hideAll(); G.scr = 'game'; surrender(); };
}
function closePause() { G.paused = false; hideAll(); G.scr = 'game'; G.last = performance.now(); }
function surrender() {
  const c = G.W.units.find(u => u.kind === 'crystal' && u.team === 0);
  if (c && !c.dead) { c.inv = false; hurt(G.W, null, c, 1e9, 't', { force: 1 }); }
}
function openShop() {
  if (G.scr !== 'game') return;
  G.shopOpen = true; inpReset();
  renderShop(null);
  show('shop');
}
function renderShop(sel) {
  const me = G.me, s = $('#shop');
  const nb = nextBuy(me);
  sel = sel || (nb && nb.id) || 'sword';
  const cats = [['推荐', HERO_BY_ID[me.hid].build], ['攻击', Object.keys(ITEMS).filter(k => ITEMS[k].cat === 'atk')], ['法术', Object.keys(ITEMS).filter(k => ITEMS[k].cat === 'mag')], ['防御', Object.keys(ITEMS).filter(k => ITEMS[k].cat === 'def')], ['鞋子', Object.keys(ITEMS).filter(k => ITEMS[k].cat === 'move')]];
  const I = ITEMS[sel];
  const have = me.items.slice(), owned = [];
  for (const c of I.from || []) { const i = have.indexOf(c); if (i >= 0) { owned.push(c); have.splice(i, 1); } }
  const price = I.cost - owned.reduce((a, c) => a + ITEMS[c].cost, 0);
  const full = me.items.length - owned.length >= 6;
  const stats = Object.keys(STAT_NAME).filter(k => I[k]).map(k => `+${I[k]}${['as', 'crit', 'critd', 'ls', 'cdr', 'apen', 'mpen'].includes(k) ? '%' : ''} ${STAT_NAME[k]}`);
  if (I.thorn) stats.push(`受到普攻时反弹 ${I.thorn}% 伤害`);
  if (I.frost) stats.push('技能打中英雄会减速');
  s.innerHTML = `<div class="box wide shopbox"><div class="hd">商店 <small>金币 ${Math.floor(me.gold)} · 不用回城，随时能买</small><button class="x" id="sClose">关闭</button></div>
    <div class="shopwrap"><div class="shoplist">${cats.map(([nm, ids]) => `<div class="cat">${nm}</div><div class="its">${ids.map(id => `<button class="it ${id === sel ? 'on' : ''} ${me.items.includes(id) ? 'own' : ''}" data-i="${id}"><img src="${iconImg(id, 2)}" alt=""><span>${ITEMS[id].name}</span><small>${ITEMS[id].cost}</small></button>`).join('')}</div>`).join('')}</div>
    <div class="shopd"><img src="${iconImg(sel, 3)}" alt=""><div class="dn">${I.name}</div><div>${stats.join('<br>')}</div>
    ${I.from ? `<div class="from">合成：${I.from.map(c => ITEMS[c].name).join(' + ')} + ${I.cost - I.from.reduce((a, c) => a + ITEMS[c].cost, 0)} 金</div>` : ''}
    <div class="inv">身上：${me.items.map(i => `<img src="${iconImg(i, 1)}" alt="${ITEMS[i].name}">`).join('') || '还没有装备'}</div>
    <button class="btn" id="sBuy" ${me.gold >= price && !full ? '' : 'disabled'}>${full ? '格子满了' : `购买 ${price} 金`}</button></div></div></div>`;
  for (const b of s.querySelectorAll('.it')) b.onclick = () => { sfx('click'); renderShop(b.dataset.i); };
  $('#sClose').onclick = () => { sfx('click'); G.shopOpen = false; hideAll(); G.scr = 'game'; };
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
    ${board(W)}
    <div class="credit">甜菜 出品</div></div>`;
  show('result');
  $('#rAgain').onclick = () => { sfx('click'); buildSelect(); show('select'); startDemo(); };
  $('#rHome').onclick = () => { sfx('click'); buildTitle(); show('title'); startDemo(); };
}

/* ---------- 开头背景：电脑打电脑的真对局 ---------- */
function startDemo() {
  const ids = HEROES.map(h => h.id);
  const sd = (Date.now() % 9999) + 1;
  G.demo = newWorld({ blue: ids.slice(0, 5), red: ids.slice(1), player: -1, diff: 1, seed: sd });
  // 快进 70 秒，开头就有兵线在打
  for (let i = 0; i < 70 * 30; i++) { step(G.demo, 1 / 30); G.demo.ev.length = 0; }
  G.demoT = 0; G.demoCam = G.demo._heroes[0];
  R.camX = G.demoCam.x; R.camY = G.demoCam.y;
  G.W = null;
}

/* ---------- 事件 → 特效、声音、播报 ---------- */
function pid(W, id) { return byId(W, id); }
function handleEvents(W, me, quiet) {
  for (const e of W.ev) {
    switch (e.t) {
      case 'dmg': {
        if (quiet) break;
        if (me && e.src === me.id && e.v >= 1) {
          const col = e.crit ? '#FFD34D' : e.ty === 'm' ? '#E0B8FF' : e.ty === 't' ? '#FFFFFF' : '#FFF0D8';
          floatText(e.x + (Math.random() - 0.5) * 30, e.y, digitsImg(String(Math.round(e.v)), col, e.crit ? 2 : 1), { big: e.crit });
        } else if (me && e.id === me.id && e.v >= 1) {
          floatText(me.x + (Math.random() - 0.5) * 20, me.y, digitsImg('-' + Math.round(e.v), '#FF6A6A', 1), {});
          if (e.v > me.maxHp * 0.12) R.shake = Math.max(R.shake, 3);
        }
        const u = pid(W, e.id);
        if (u && u.kind === 'crystal' && u.team === 0 && W.t - G.crystalWarnT > 20 && e.src) {
          const s = pid(W, e.src); if (s && s.team === 1) { G.crystalWarnT = W.t; announce('我方水晶正在遭受攻击', C.red, { voice: 'crystal' }); }
        }
        if (u && (u.kind === 'hero' || u.kind === 'monster' || u.kind === 'tower' || u.kind === 'crystal')) sfx('hit', e.x, e.y, e.crit ? 1 : 0.55);
        break;
      }
      case 'heal': if (!quiet && me && e.id === me.id && e.v >= 20) floatText(me.x, me.y, digitsImg('+' + Math.round(e.v), '#7CFF7C', 1), {}); break;
      case 'gold': if (!quiet && me && e.id === me.id) { floatText(me.x + 18, me.y - 10, digitsImg('+' + e.v, C.gold, 1), { dur: 0.8 }); sfx('coin', null, null, 0.6); } break;
      case 'lvl': {
        const h = pid(W, e.id); if (!h) break;
        if (me && (h.id === me.id || dist(h, me) < 900)) addFxv({ k: 'ring', x: h.x, y: h.y, r: 90, col: '#FFE070', dur: 0.5 });
        if (me && h.id === me.id) {
          sfx('levelup');
          addFxv({ k: 'text', x: h.x, y: h.y - 10, img: textImg('升级', C.gold2, { ol: C.ink }), dur: 1.2 });
          const s = SKILL_ORDER[e.lvl - 1]; if (s != null) HUD.lvlFlash[s] = 0.8;
          if (e.lvl === 2) toast('解锁了第二个技能', C.gold2);
          if (e.lvl === 4) toast('大招解锁了！', C.gold2);
        }
        break;
      }
      case 'atk': {
        if (quiet) break;
        if (e.kind === 'hero') sfx(e.proj === 'arrow' ? 'shoot' : e.proj === 'orb' ? 'magic' : e.proj === 'heart' ? 'heart' : 'swing', e.x, e.y, 0.7);
        else if (e.kind === 'tower' || e.kind === 'crystal') sfx('tower', e.x, e.y, 0.8);
        else if (e.kind === 'monster') sfx('swing', e.x, e.y, 0.5);
        break;
      }
      case 'cast': {
        const h = pid(W, e.id); if (!h) break;
        const snd = { t1: 'dash', t2: 'shield', t3: 'big', w1: 'swing', w2: 'dash', w3: 'big', a1: 'dash', a2: 'flash', a3: 'big', m1: 'fire', m2: 'ice', m3: 'meteor', s1: 'shoot', s2: 'dash', s3: 'big', h1: 'heal', h2: 'magic', h3: 'shield' }[e.sid];
        if (!quiet) sfx(snd, h.x, h.y, 0.9);
        if (e.sid === 'a1' || e.sid === 't1' || e.sid === 's2') burst(h.x, h.y, 8, ['#E8E0D0', '#C8B8A0'], { spd: 90, up: 40, life: 0.4 });
        break;
      }
      case 'fx': fxEvent(W, e, quiet); break;
      case 'die': {
        if (e.kind === 'hero') { burst(e.x, e.y, 26, [HERO_BY_ID[e.hid].col, '#FFFFFF', '#1A121E'], { spd: 200, up: 220, life: 0.9 }); if (!quiet) sfx('death', e.x, e.y); }
        else if (e.kind === 'minion') { burst(e.x, e.y, 8, [TEAM_COL[e.team], TEAM_LT[e.team]], { spd: 110, up: 120, life: 0.5 }); if (!quiet) sfx('pop', e.x, e.y, 0.5); }
        else if (e.kind === 'monster') { burst(e.x, e.y, 18, ['#F2A03A', '#FFE070', '#8A6A4A'], { spd: 160, up: 160, life: 0.7 }); }
        else if (e.kind === 'tower' || e.kind === 'crystal') { burst(e.x, e.y, 60, ['#B8B2A6', '#8A8478', TEAM_COL[e.team], '#FFFFFF'], { spd: 260, up: 300, life: 1.3, z: 60 }); if (!quiet) { sfx('crumble', e.x, e.y, 1); R.shake = 6; } }
        break;
      }
      case 'kill': if (!quiet) killEvent(W, me, e); else { const v = pid(W, e.v), k = pid(W, e.k); HUD.feed.unshift({ k: k ? k.hid : null, kt: v ? 1 - v.team : 0, v: v ? v.hid : 'warrior', vt: v ? v.team : 0, t: 0 }); } break;
      case 'tower': if (!quiet) { const mine = e.team === 0; announce(mine ? '我方防御塔被摧毁了' : '摧毁一座敌方防御塔', mine ? C.red : C.gold, { voice: mine ? 'towerLost' : 'towerKill' }); } break;
      case 'dragon': if (!quiet) { const ours = e.team === 0, big = e.mt === 'lord'; announce(`${ours ? '我方' : '敌方'}击败了${big ? '大龙' : '小龙'}`, ours ? C.gold : C.red, { voice: (big ? 'lord' : 'drake') + (ours ? 'B' : 'R'), sub: big ? (ours ? '三条路出现了我方先锋' : '小心敌方先锋') : (ours ? '全队金币 +' + MONSTER.drake.teamGold : '') }); } break;
      case 'dragonSpawn': if (!quiet && W.t > 5) announce(e.mt === 'lord' ? '大龙出现了' : '小龙出现了', '#C8A0FF', { voice: e.mt === 'lord' ? 'lordUp' : 'drakeUp', dur: 2 }); break;
      case 'say': if (!quiet) { if (e.k === 'welcome') announce('欢迎来到小怪峡谷', C.gold, { voice: 'welcome', dur: 2.6 }); else if (e.k === 'five') announce('敌军还有 5 秒到达战场', C.gold, { voice: 'five' }); else if (e.k === 'go') { announce('全军出击', C.gold, { voice: 'go', dur: 1.8 }); sfx('wave'); } } break;
      case 'recall': if (!quiet && me && e.id === me.id) sfx('recall'); break;
      case 'buy': if (!quiet && me && e.id === me.id) { toast('购买了 ' + ITEMS[e.item].name, C.gold2); sfx('coin'); } break;
      case 'respawn': { const h = pid(W, e.id); if (h) addFxv({ k: 'ring', x: h.x, y: h.y, r: 90, col: '#9CF09C', dur: 0.7 }); break; }
      case 'end': R.shake = 8; break;
    }
  }
  W.ev.length = 0;
}
function fxEvent(W, e, quiet) {
  switch (e.k) {
    case 'ring': addFxv({ k: 'ring', x: e.x, y: e.y, r: e.r, col: '#C8D0E0', dur: 0.3 }); break;
    case 'slash': addFxv({ k: 'slash', x: e.x, y: e.y, dx: e.dx, dy: e.dy, r: e.r, col: e.col, dur: 0.3 }); break;
    case 'quake': addFxv({ k: 'quake', x: e.x, y: e.y, r: e.r, dur: 0.4 }); burst(e.x, e.y, 30, ['#B89A6A', '#8A6A4A', '#FFE070'], { spd: 260, up: 200, life: 0.7 }); if (!quiet) { sfx('boom', e.x, e.y); R.shake = Math.max(R.shake, 5); } break;
    case 'land': addFxv({ k: 'land', x: e.x, y: e.y, r: e.r, dur: 0.4 }); burst(e.x, e.y, 14, ['#B89A6A', '#E8E0D0'], { spd: 160, up: 100, life: 0.5 }); if (!quiet) sfx('hit', e.x, e.y, 1); break;
    case 'boom': addFxv({ k: 'boom', x: e.x, y: e.y, r: e.r, dur: 0.4 }); burst(e.x, e.y, 18, ['#FF5A2A', '#FFB040', '#FFE070'], { spd: 200, up: 160, life: 0.5 }); if (!quiet) sfx('boom', e.x, e.y, 0.6); break;
    case 'ice': addFxv({ k: 'ice', x: e.x, y: e.y, r: e.r, dur: 0.35 }); burst(e.x, e.y, 22, ['#9CE8FF', '#FFFFFF', '#5FB4E8'], { spd: 150, up: 140, life: 0.7 }); if (!quiet) sfx('ice', e.x, e.y); break;
    case 'meteorArea': addFxv({ k: 'meteorArea', x: e.x, y: e.y, r: e.r, dur: e.dur }); break;
    case 'meteorHit': addFxv({ k: 'meteorHit', x: e.x, y: e.y, r: e.r, dur: 0.35 }); burst(e.x, e.y, 12, ['#FF5A2A', '#FFB040', '#5A3A2A'], { spd: 180, up: 180, life: 0.5 }); if (!quiet) sfx('boom', e.x, e.y, 0.45); break;
    case 'dome': { const h = pid(W, e.id0); burst(e.x, e.y, 30, ['#FFE070', '#FFFFFF', '#FFD0E0'], { spd: 260, up: 120, grav: 60, life: 0.7 }); for (const a of W._heroes) if (a.team === (h ? h.team : 0) && !a.dead && dist(a, e) < e.r) burst(a.x, a.y, 6, ['#FFE070', '#FFFFFF'], { spd: 50, up: 140, grav: 0, life: 0.6 }); break; }
    case 'heal': burst(e.x, e.y, 10, ['#7CFF7C', '#C8FFC8'], { spd: 40, up: 160, grav: 0, life: 0.8 }); break;
    case 'healbeam': addFxv({ k: 'beam', x: e.x, y: e.y, x2: e.x2, y2: e.y2, col: '#8EF08E', dur: 0.4 }); burst(e.x2, e.y2, 8, ['#7CFF7C', '#C8FFC8'], { spd: 40, up: 160, grav: 0, life: 0.7 }); break;
    case 'bonk': burst(e.x, e.y, 8, ['#FFE45C', '#FFFFFF'], { spd: 120, up: 160, life: 0.5 }); if (!quiet) sfx('stun', e.x, e.y); break;
    case 'smoke': burst(e.x, e.y, 20, ['#56586E', '#8A8FA0', '#33343F'], { spd: 90, up: 60, grav: 0, life: 0.8 }); break;
    case 'blink': case 'flash':
      burst(e.x, e.y, 12, e.k === 'flash' ? ['#FFE45C', '#FFFFFF'] : ['#C8323C', '#33343F'], { spd: 120, up: 90, life: 0.4 });
      burst(e.x2, e.y2, 12, e.k === 'flash' ? ['#FFE45C', '#FFFFFF'] : ['#C8323C', '#33343F'], { spd: 120, up: 90, life: 0.4 });
      if (!quiet) sfx('flash', e.x2, e.y2, 0.8);
      break;
    case 'cut': burst(e.x, e.y, 6, ['#FFFFFF', '#C8323C'], { spd: 150, up: 80, life: 0.25 }); addFxv({ k: 'slash', x: e.x, y: e.y, dx: Math.cos(e.n * 2.1), dy: Math.sin(e.n * 2.1), r: 90, dur: 0.18 }); if (!quiet) sfx('swing', e.x, e.y, 1); break;
    case 'recallDone': burst(e.x2, e.y2, 16, ['#7FB4FF', '#FFFFFF'], { spd: 60, up: 200, grav: 0, life: 0.7 }); break;
    case 'springHeal': if (Math.random() < 0.5) burst(e.x, e.y, 2, ['#7CFF7C'], { spd: 20, up: 120, grav: 0, life: 0.6 }); break;
    case 'springShot': addFxv({ k: 'beam', x: e.x, y: e.y, x2: e.x2, y2: e.y2, col: '#FFFFFF', dur: 0.2 }); break;
  }
}
const SPREE = { 3: ['大杀特杀', 'spree3'], 4: ['主宰比赛', 'spree4'], 5: ['杀人如麻', 'spree5'], 6: ['无人能挡', 'spree6'], 7: ['横扫千军', 'spree7'] };
const MULTI = { 2: ['双杀', 'double'], 3: ['三杀', 'triple'], 4: ['四杀', 'quadra'], 5: ['五杀', 'penta'] };
function killEvent(W, me, e) {
  const k = pid(W, e.k), v = pid(W, e.v);
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

/* ---------- 主循环 ---------- */
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, Math.max(0, (now - G.last) / 1000));
  G.last = now;
  if (G.scr === 'boot') return;
  const W = G.W;
  if (W && (G.scr === 'game' || G.scr === 'shop' || G.scr === 'pause' || G.scr === 'result')) {
    if (!G.paused && G.scr !== 'result') {
      playerCmd(W, G.me);
      G.acc += dt;
      let n = 0;
      while (G.acc >= STEP && n < 4) { step(W, STEP); G.acc -= STEP; n++; }
      if (n === 4) G.acc = 0;
      handleEvents(W, G.me, false);
    }
    if (W.winner >= 0 && !G.endShown) {
      G.endShown = true;
      const cr = W.units.find(u => u.kind === 'crystal' && u.team !== W.winner);
      R.peek = cr ? [cr.x, cr.y] : null;
      setTimeout(() => {
        announce(W.winner === 0 ? '胜利' : '失败', W.winner === 0 ? C.gold : C.red, { voice: W.winner === 0 ? 'win' : 'lose', dur: 3, urgent: true });
        sfx(W.winner === 0 ? 'win' : 'lose');
      }, 900);
      setTimeout(() => { R.peek = null; showResult(); }, 3600);
    }
    AU.camX = R.camX; AU.camY = R.camY;
    if (!G.paused) ambientTick(dt);
    renderWorld(W, G.me, G.paused ? 0 : dt);
    if (G.scr !== 'result') drawHUD(W, G.me, dt);
  } else if (G.demo) {
    const D = G.demo;
    G.acc += dt;
    let n = 0;
    while (!G.freeze && G.acc >= 1 / 30 && n < 3) { step(D, 1 / 30); G.acc -= 1 / 30; n++; }
    if (n === 3) G.acc = 0;
    handleEvents(D, null, true);
    HUD.feed.length = 0;
    G.demoT += dt;
    if (!G.freeze && (G.demoT > 9 || G.demoCam.dead)) {        // 换一个英雄跟拍，挑离敌人最近的（有架打）
      G.demoT = 0;
      let best = null, bd = 1e9;
      for (const h of D._heroes) { if (h.dead) continue; for (const e of D._heroes) if (e.team !== h.team && !e.dead) { const d = dist(h, e); if (d < bd) { bd = d; best = h; } } }
      G.demoCam = best || D._heroes[0];
    }
    if (D.winner >= 0) startDemo();
    renderWorld(D, G.demoCam, G.freeze ? 0 : dt);
  }
  // 放大到屏幕
  const ctx = R.ctx;
  ctx.fillStyle = '#0E0B16'; ctx.fillRect(0, 0, R.cv.width, R.cv.height);
  ctx.drawImage(R.buf, 0, 0, R.bw, R.bh, R.ox, R.oy, R.bw * R.k, R.bh * R.k);
}

/* ---------- 启动 ---------- */
function bindInput() {
  const cv = R.cv;
  const pos = ev => { const [x, y] = toGame(ev.clientX, ev.clientY); return cssToBuf(x, y); };
  cv.addEventListener('pointerdown', ev => {
    ev.preventDefault();
    try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* 有的浏览器不支持 */ }
    if (G.scr !== 'game' || G.paused) return;
    audioInit();
    const [x, y] = pos(ev);
    onPointerDown(G.W, G.me, ev.pointerId, x, y);
  });
  cv.addEventListener('pointermove', ev => {
    const [x, y] = pos(ev);
    if (ev.pointerType === 'mouse') { INP.mouse = [x, y]; INP.mouseT = R.t; }
    if (G.scr !== 'game') return;
    onPointerMove(G.W, G.me, ev.pointerId, x, y);
  });
  const up = ev => { if (G.scr !== 'game' && G.scr !== 'shop' && G.scr !== 'pause') return; const [x, y] = pos(ev); onPointerUp(G.W, G.me, ev.pointerId, x, y); };
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', up);
  cv.addEventListener('contextmenu', ev => ev.preventDefault());
  window.addEventListener('keydown', ev => {
    if (G.scr === 'game' && !G.paused) {
      if (ev.code === 'KeyP' || ev.code === 'Escape') { openPause(); return; }
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(ev.code)) ev.preventDefault();
      if (!ev.repeat) onKey(G.W, G.me, ev.code, true);
      else INP.keys[ev.code] = true;
    } else if (G.scr === 'pause' && (ev.code === 'KeyP' || ev.code === 'Escape')) closePause();
  });
  window.addEventListener('keyup', ev => { onKey(G.W, G.me, ev.code, false); });
  window.addEventListener('blur', () => { INP.keys = {}; INP.keyAtk = false; });
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.scr === 'game' && G.W && G.W.winner < 0) openPause(); });
  INP.onPause = openPause;
  INP.onShop = openShop;
  INP.onAuto = () => { G.W.auto = !G.W.auto; toast(G.W.auto ? '托管：电脑替你打' : '取消托管', '#9CF09C'); if (!G.W.auto) G.me.cmd = {}; };
}
// 页面更新（重新发布）时保住正在打的这一局：对局数据是纯 JSON（下划线开头的是缓存，不存）
function snapshotState() {
  const base = { hero: G.hero, diff: G.diff };
  if (!G.W || !G.me || G.W.winner >= 0 || !['game', 'pause', 'shop'].includes(G.scr)) return base;
  try { base.save = JSON.stringify(G.W, (k, v) => (k[0] === '_' ? undefined : v)); base.camX = R.camX; base.camY = R.camY; } catch (e) { /* 存不了就不存 */ }
  return base;
}
function restoreGame(data) {
  try {
    const W = JSON.parse(data.save);
    relink(W);
    const me = W.units.find(u => u.isPlayer);
    if (!me) return false;
    G.W = W; G.me = me; G.demo = null;
    R.camX = data.camX || me.x; R.camY = data.camY || me.y;
    G.endShown = false; G.acc = 0; G.crystalWarnT = -99;
    inpReset(); hideAll(); G.scr = 'game';
    openPause();
    return true;
  } catch (e) { return false; }
}
function boot(data) {
  data = data || {};
  loadPrefs();
  if (data.hero && HERO_BY_ID[data.hero]) G.hero = data.hero;
  if (data.diff != null) G.diff = data.diff;
  HUD.keyboard = !(('ontouchstart' in window) || navigator.maxTouchPoints > 0);
  R.cv = $('#cv'); R.buf = document.createElement('canvas');
  layout();
  window.addEventListener('resize', () => setTimeout(layout, 50));
  if (window.visualViewport) window.visualViewport.addEventListener('resize', () => setTimeout(layout, 50));
  bindInput();
  const bootTxt = $('#bootTxt');
  const go = () => {
    initGrid();
    R.mapTex = buildMapTex();
    R.mini = buildMinimap(R.mapTex, 64);
    buildTitle();
    if (!(data.save && restoreGame(data))) { startDemo(); show('title'); }
    G.last = performance.now();
  };
  // 先让“加载中”画出来，再算地图（要几百毫秒）
  const fontReady = document.fonts && document.fonts.load ? document.fonts.load('12px XGPixel', '小怪峡谷') : Promise.resolve();
  fontReady.catch(() => {}).then(() => setTimeout(() => { try { go(); } catch (e) { if (bootTxt) bootTxt.textContent = '出错了：' + e.message; throw e; } }, 30));
  requestAnimationFrame(frame);
}
function start(data) {
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', () => boot(data));
  else boot(data);
}
const HOT = window.claude && window.claude.hot;
if (HOT && HOT.snapshot) HOT.snapshot(snapshotState);
if (HOT && HOT.ready) HOT.ready(start); else start((HOT && HOT.data) || {});
