'use strict';
/* input.js：触屏（多指）和键盘鼠标。
   左半屏按下 = 摇杆（按在哪儿摇杆就出现在哪儿）；按住普攻键自动打范围里的目标；
   技能键：点一下自动瞄最近的敌方英雄，按住拖动 = 自己瞄（方向 / 落点），拖到“取消”上松手不放；闪现同理。
   键盘：WASD / 方向键移动，J / 空格普攻，1 2 3（或 Q E R）技能朝鼠标放，F 闪现，H 恢复，B 回城，P / Esc 暂停。 */

const INP = { ptr: {}, joy: null, atk: null, aim: null, keys: {}, keyAtk: false, mouse: null, mouseT: -9, peek: null, onPause: null, onShop: null, onAuto: null };
const JOY_DEAD = 4;

function inpReset() { INP.ptr = {}; INP.joy = null; INP.atk = null; INP.aim = null; INP.keyAtk = false; INP.keys = {}; R.peek = null; }
function hitBtn(b, x, y, pad) { return Math.hypot(x - b.x, y - b.y) <= b.r + (pad || 5); }

function onPointerDown(W, me, id, x, y) {
  const Lt = HUD.L || hudLayout();
  const m = Lt.mini;
  if (x >= m.x && y >= m.y && x < m.x + m.s && y < m.y + m.s) { INP.ptr[id] = { role: 'mini' }; miniPeek(x, y); return; }
  if (hitBtn(Lt.pause, x, y, 6)) { INP.onPause && INP.onPause(); return; }
  if (hitBtn(Lt.auto, x, y, 6)) { INP.onAuto && INP.onAuto(); return; }
  if (hitBtn(Lt.rally, x, y, 6)) { callRally(W, me); return; }
  const s = Lt.shop;
  if (x >= s.x - 4 && y >= s.y - 4 && x < s.x + s.w + 4 && y < s.y + s.h + 4) { INP.onShop && INP.onShop(); return; }
  if (hitBtn(Lt.buy, x, y, 5) && HUD.nb) { if (!buy(W, me, HUD.nb)) toast('金币不够', C.dim); return; }
  if (me.dead) { if (x < R.bw * 0.5) startJoy(id, x, y); return; }
  if (hitBtn(Lt.atk, x, y, 7)) { INP.atk = id; INP.ptr[id] = { role: 'atk' }; return; }
  for (let s2 = 0; s2 < 3; s2++) {
    if (hitBtn(Lt.s[s2], x, y, 6)) {
      const st = me.sk[s2];
      if (!st.rank) { toast(s2 === 2 ? '4 级解锁大招' : '2 级解锁', C.dim); return; }
      if (st.cd > 0) { toast('技能冷却中', C.dim); return; }
      INP.aim = { id, s: s2, x0: Lt.s[s2].x, y0: Lt.s[s2].y, px: 0, py: 0, dx: me.face, dy: 0, mag: 0.6, moved: false, cancel: false };
      INP.ptr[id] = { role: 'aim' };
      return;
    }
  }
  if (hitBtn(Lt.flash, x, y, 6)) {
    if (me.flashCd > 0) { toast('闪现冷却中', C.dim); return; }
    INP.aim = { id, s: 'flash', kind: 'flash', x0: Lt.flash.x, y0: Lt.flash.y, px: 0, py: 0, dx: me.face, dy: 0, mag: 1, moved: false, cancel: false };
    INP.ptr[id] = { role: 'aim' };
    return;
  }
  if (hitBtn(Lt.heal, x, y, 5)) { if (me.healCd > 0) toast('恢复冷却中', C.dim); else me.cmd.heal = true; return; }
  if (hitBtn(Lt.recall, x, y, 5)) { me.cmd.recall = true; return; }
  if (x < R.bw * 0.5 && !INP.joy) { startJoy(id, x, y); return; }
}
// 集合：队友过来跟着你，你打什么他们帮着打（25 秒，冷却 20 秒）
function callRally(W, me) {
  if (me.dead) return;
  if (W.rallyCd && W.t < W.rallyCd) { toast('集合冷却中', C.dim); return; }
  W.rally = { team: me.team, id: me.id, until: W.t + 25 };
  W.rallyCd = W.t + 20;
  announce('请求集合', C.blue, { dur: 1.6, sub: '队友正在赶过来，跟着你打' });
  sfx('wave');
}
function startJoy(id, x, y) {
  const J = (HUD.L || hudLayout()).joy;
  const bx0 = clamp(x, J.r + 4 + INS.l, R.bw * 0.5), by0 = clamp(y, 80, R.bh - J.r - 4 - INS.b);
  INP.joy = { id, bx: bx0, by: by0, x, y };
  INP.ptr[id] = { role: 'joy' };
  moveJoy(x, y);
}
function moveJoy(x, y) {
  const j = INP.joy, J = (HUD.L || hudLayout()).joy;
  let dx = x - j.bx, dy = y - j.by, d = Math.hypot(dx, dy);
  if (d > J.r) { // 拖出圈外：底座跟着手指走
    j.bx += dx / d * (d - J.r); j.by += dy / d * (d - J.r);
    dx = x - j.bx; dy = y - j.by; d = J.r;
  }
  j.x = j.bx + dx; j.y = j.by + dy;
}
function miniPeek(x, y) {
  const m = (HUD.L || hudLayout()).mini;
  R.peek = [clamp((x - m.x) / m.s * L, 0, L), clamp((y - m.y) / m.s * L, 0, L)];
}
function onPointerMove(W, me, id, x, y) {
  const p = INP.ptr[id];
  if (!p) return;
  if (p.role === 'joy' && INP.joy && INP.joy.id === id) moveJoy(x, y);
  else if (p.role === 'mini') miniPeek(x, y);
  else if (p.role === 'aim' && INP.aim && INP.aim.id === id) {
    const a = INP.aim, px = x - a.x0, py = y - a.y0, d = Math.hypot(px, py);
    a.px = px; a.py = py;
    if (d > JOY_DEAD) { a.moved = true; a.dx = px / d; a.dy = py / d; a.mag = Math.min(1, d / 30); }
    a.cancel = a.moved && hitBtn((HUD.L || hudLayout()).cancel, x, y, 4);
  }
}
function onPointerUp(W, me, id, x, y) {
  const p = INP.ptr[id];
  delete INP.ptr[id];
  if (!p) return;
  if (p.role === 'joy' && INP.joy && INP.joy.id === id) INP.joy = null;
  else if (p.role === 'atk' && INP.atk === id) INP.atk = null;
  else if (p.role === 'mini') R.peek = null;
  else if (p.role === 'aim' && INP.aim && INP.aim.id === id) {
    const a = INP.aim; INP.aim = null;
    if (a.cancel || me.dead) return;
    if (a.s === 'flash') {
      const [dx, dy] = a.moved ? [a.dx, a.dy] : joyDir(me);
      me.cmd.flash = [me.x + dx * 100, me.y + dy * 100];
      return;
    }
    if (a.moved) castAimed(W, me, a.s, a.dx, a.dy, a.mag);
    else smartCast(W, me, a.s);
  }
}
function joyDir(me) {
  const v = moveVec();
  if (v) return v;
  return [me.face, 0];
}
function castAimed(W, me, s, dx, dy, mag) {
  const def = sdef(me, s);
  if (def.aim === 'point') me.cmd.cast = { s, x: me.x + dx * mag * def.range, y: me.y + dy * mag * def.range };
  else if (def.aim === 'dir') me.cmd.cast = { s, x: me.x + dx * 300, y: me.y + dy * 300 };
  else if (def.aim === 'unit') {
    // 朝拖的方向挑最近的敌方英雄
    let best = null, bs = 1e9;
    for (const e of W._heroes) {
      if (e.team === me.team || e.dead || !canSee(W, me.team, e)) continue;
      const ex = e.x - me.x, ey = e.y - me.y, d = Math.hypot(ex, ey);
      if (d > def.range + 80) continue;
      const ang = Math.acos(clamp((ex * dx + ey * dy) / (d || 1), -1, 1));
      const sc = ang * 400 + d;
      if (sc < bs) { bs = sc; best = e; }
    }
    me.cmd.cast = { s, id: best ? best.id : 0 };
  } else me.cmd.cast = { s };
}
// 点一下：自动找目标
function smartCast(W, me, s) {
  const def = sdef(me, s);
  if (def.aim === 'self') { me.cmd.cast = { s }; return; }
  const reach = def.aim === 'unit' ? def.range + 80 : Math.min(def.range, 1100) + (def.aim === 'point' ? (def.rad || 100) * 0.6 : 60);
  let tgt = null, bd = 1e9;
  for (const e of W._heroes) {
    if (e.team === me.team || e.dead || !canSee(W, me.team, e) || untarg(e)) continue;
    const d = dist(me, e);
    if (d < reach && d < bd) { bd = d; tgt = e; }
  }
  if (!tgt && def.aim !== 'unit') {
    near(W, me.x, me.y, Math.min(reach, 700), u => {
      if ((u.kind === 'minion' || u.kind === 'monster') && u.team !== me.team && !u.dead && !u.reset) { const d = dist(me, u); if (d < bd) { bd = d; tgt = u; } }
    });
  }
  if (def.aim === 'unit') { if (!tgt) { toast('附近没有敌方英雄', C.dim); return; } me.cmd.cast = { s, id: tgt.id }; return; }
  if (tgt) {
    const lead = tgt.kind === 'hero' ? 0.25 : 0;
    me.cmd.cast = { s, x: tgt.x + (tgt.vx || 0) * lead, y: tgt.y + (tgt.vy || 0) * lead };
    return;
  }
  const [dx, dy] = joyDir(me);
  const r = def.aim === 'point' ? def.range * 0.6 : 300;
  me.cmd.cast = { s, x: me.x + dx * r, y: me.y + dy * r };
}
function moveVec() {
  if (INP.joy) {
    const j = INP.joy, dx = j.x - j.bx, dy = j.y - j.by, d = Math.hypot(dx, dy);
    if (d > JOY_DEAD) return [dx / d, dy / d];
    return null;
  }
  const k = INP.keys;
  let x = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0), y = (k.KeyS || k.ArrowDown ? 1 : 0) - (k.KeyW || k.ArrowUp ? 1 : 0);
  if (!x && !y) return null;
  const d = Math.hypot(x, y);
  return [x / d, y / d];
}
// 每帧：把摇杆、普攻键写进玩家的指令
function playerCmd(W, me) {
  const c = me.cmd || (me.cmd = {});
  if (W.auto) return;
  c.mv = moveVec();
  c.atkAuto = INP.atk != null || INP.keyAtk;
  c.goto = null; c.atk = 0;
}
// 键盘
function mouseWorld(me) {
  if (!INP.mouse || R.t - INP.mouseT > 4) return null;
  return bufToWorld(INP.mouse[0], INP.mouse[1]);
}
function onKey(W, me, code, down) {
  if (down) HUD.keyboard = true;
  INP.keys[code] = down;
  if (code === 'KeyJ' || code === 'Space') INP.keyAtk = down;
  if (!down || !me || me.dead) return;
  const sk = { Digit1: 0, KeyQ: 0, KeyU: 0, Digit2: 1, KeyE: 1, KeyI: 1, Digit3: 2, KeyR: 2, KeyO: 2 }[code];
  if (sk != null) {
    const st = me.sk[sk];
    if (!st.rank || st.cd > 0) return;
    const mw = mouseWorld(me);
    if (mw) {
      const def = sdef(me, sk), dx = mw[0] - me.x, dy = mw[1] - me.y, d = Math.hypot(dx, dy) || 1;
      castAimed(W, me, sk, dx / d, dy / d, Math.min(1, d / (def.range || 1)));
    } else smartCast(W, me, sk);
    return;
  }
  if (code === 'KeyF') {
    const mw = mouseWorld(me);
    me.cmd.flash = mw ? [mw[0], mw[1]] : (() => { const [dx, dy] = joyDir(me); return [me.x + dx * 100, me.y + dy * 100]; })();
  }
  if (code === 'KeyH' || code === 'KeyC') me.cmd.heal = true;
  if (code === 'KeyB') me.cmd.recall = true;
  if (code === 'KeyG') callRally(W, me);
}
if (typeof module !== 'undefined') module.exports = {};
