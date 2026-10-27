'use strict';
/* input.js：触屏（多指）和键盘鼠标，坐标都是 HUD 画布上的 CSS 像素。
   左下按住 = 摇杆（按在哪儿摇杆就出现在哪儿，松手回原位）；按住普攻键自动打范围里的目标（英雄优先、再补刀）；
   技能键：点一下自动瞄最近的敌方英雄，按住拖动 = 自己瞄（地上出现范围圈、方向箭头或落点圈），拖到“取消施法”上松手就不放；闪现同理。
   镜头是斜着往下看的：屏幕上往上拖一段，对应地上往北走得更远一点（除以俯角的正弦），这样指的方向和看到的方向一致。
   键盘：WASD / 方向键移动，J / 空格普攻，1 2 3（或 Q E R）技能朝鼠标放，F 闪现，H 恢复，B 回城，P / Esc 暂停。 */

const INP = { ptr: {}, joy: null, atk: null, aim: null, keys: {}, keyAtk: false, mouse: null, mouseT: -9, onPause: null, onShop: null };
const JOY_DEAD = 6;
const SIN_P = Math.sin(CAMC.pitch);

function inpReset() { INP.ptr = {}; INP.joy = null; INP.atk = null; INP.aim = null; INP.keyAtk = false; INP.keys = {}; R3.peek = null; R3.aimCam = null; }
function hitBtn(b, x, y, pad) { return Math.hypot(x - b.x, y - b.y) <= b.r + (pad || 6); }
// 屏幕上的方向 → 地上的方向
function scrDir(dx, dy) { const wx = dx, wy = dy / SIN_P, d = Math.hypot(wx, wy) || 1; return [wx / d, wy / d]; }

function onPointerDown(W, me, id, x, y) {
  const Lt = HUD.L;
  const m = Lt.mini;
  if (x >= m.x && y >= m.y && x < m.x + m.s && y < m.y + m.s) { INP.ptr[id] = { role: 'mini' }; miniPeek(x, y); return; }
  if (hitBtn(Lt.pause, x, y, 10)) { INP.onPause && INP.onPause(); return; }
  if (hitBtn(Lt.shop, x, y, 6)) { INP.onShop && INP.onShop(); return; }
  if (HUD.nb && hitBtn(Lt.buy, x, y, 6)) { if (!buy(W, me, HUD.nb)) toast('金币不够', C.dim); return; }
  if (me.dead) { if (x < HUD.w * 0.45) startJoy(id, x, y); return; }
  if (hitBtn(Lt.atk, x, y, 10)) { INP.atk = id; INP.ptr[id] = { role: 'atk' }; return; }
  for (let s = 0; s < 3; s++) {
    if (hitBtn(Lt.s[s], x, y, 7)) {
      const st = me.sk[s];
      if (!st.rank) { toast(s === 2 ? '4 级解锁大招' : '2 级解锁这个技能', C.dim); return; }
      if (st.cd > 0) { toast('技能冷却中', C.dim); return; }
      INP.aim = { id, s, x0: Lt.s[s].x, y0: Lt.s[s].y, dx: 0, dy: -1, mag: 0.6, moved: false, cancel: false, tgt: null };
      const [fx, fy] = faceDir(me); INP.aim.dx = fx; INP.aim.dy = fy;
      INP.ptr[id] = { role: 'aim' };
      return;
    }
  }
  if (hitBtn(Lt.flash, x, y, 6)) {
    if (me.flashCd > 0) { toast('闪现冷却中', C.dim); return; }
    const [fx, fy] = joyDir(me);
    INP.aim = { id, s: 'flash', x0: Lt.flash.x, y0: Lt.flash.y, dx: fx, dy: fy, mag: 1, moved: false, cancel: false, tgt: null };
    INP.ptr[id] = { role: 'aim' };
    return;
  }
  if (hitBtn(Lt.heal, x, y, 5)) { if (me.healCd > 0) toast('恢复冷却中', C.dim); else me.cmd.heal = true; return; }
  if (hitBtn(Lt.recall, x, y, 5)) { me.cmd.recall = true; return; }
  if (x < HUD.w * 0.45 && y > m.y + m.s + 8 && !INP.joy) { startJoy(id, x, y); return; }
}
function startJoy(id, x, y) {
  const J = HUD.L.joy;
  const bx = clamp(x, J.r + 6 + HUD.ins.l, HUD.w * 0.45), by = clamp(y, HUD.L.mini.y + HUD.L.mini.s + J.r * 0.5, HUD.h - J.r - 6 - HUD.ins.b);
  INP.joy = { id, bx, by, x, y };
  INP.ptr[id] = { role: 'joy' };
  moveJoy(x, y);
}
function moveJoy(x, y) {
  const j = INP.joy, J = HUD.L.joy;
  let dx = x - j.bx, dy = y - j.by, d = Math.hypot(dx, dy);
  if (d > J.r) {                              // 拖出圈外：底座跟着手指走
    j.bx += dx / d * (d - J.r); j.by += dy / d * (d - J.r);
    dx = x - j.bx; dy = y - j.by; d = J.r;
  }
  j.x = j.bx + dx; j.y = j.by + dy;
}
function miniPeek(x, y) {
  const m = HUD.L.mini;
  R3.peek = [clamp((x - m.x) / m.s * L, 0, L), clamp((y - m.y) / m.s * L, 0, L)];
}
function onPointerMove(W, me, id, x, y) {
  const p = INP.ptr[id];
  if (!p) return;
  if (p.role === 'joy' && INP.joy && INP.joy.id === id) moveJoy(x, y);
  else if (p.role === 'mini') miniPeek(x, y);
  else if (p.role === 'aim' && INP.aim && INP.aim.id === id) {
    const a = INP.aim, px = x - a.x0, py = y - a.y0, d = Math.hypot(px, py);
    const R = 62 * HUD.L.u;
    if (d > JOY_DEAD) { a.moved = true; const [wx, wy] = scrDir(px, py); a.dx = wx; a.dy = wy; a.mag = Math.min(1, d / R); }
    a.cancel = a.moved && hitBtn(HUD.L.cancel, x, y, 8);
    if (a.s !== 'flash') {
      const def = sdef(me, a.s);
      if (def.aim === 'unit') a.tgt = pickDirTarget(W, me, def, a.dx, a.dy);
      // 射程很远的技能：镜头往瞄的方向挪
      R3.aimCam = def.range > 1000 && a.moved ? [a.dx * Math.min(def.range * 0.5, 1500) * a.mag, a.dy * Math.min(def.range * 0.5, 1500) * a.mag] : null;
    }
  }
}
function onPointerUp(W, me, id) {
  const p = INP.ptr[id];
  delete INP.ptr[id];
  if (!p) return;
  if (p.role === 'joy' && INP.joy && INP.joy.id === id) INP.joy = null;
  else if (p.role === 'atk' && INP.atk === id) INP.atk = null;
  else if (p.role === 'mini') R3.peek = null;
  else if (p.role === 'aim' && INP.aim && INP.aim.id === id) {
    const a = INP.aim; INP.aim = null; R3.aimCam = null;
    if (a.cancel || me.dead) return;
    if (a.s === 'flash') { me.cmd.flash = [me.x + a.dx * 100, me.y + a.dy * 100]; return; }
    if (a.moved) castAimed(W, me, a.s, a.dx, a.dy, a.mag);
    else smartCast(W, me, a.s);
  }
}
function faceDir(me) {
  const v = R3.heroes.get(me.id);
  if (v) return [Math.sin(v.yaw), Math.cos(v.yaw)];
  return [me.face, 0];
}
function joyDir(me) { return moveVec() || faceDir(me); }
// 朝某个方向挑一个最近的敌方英雄（指定目标的技能用）
function pickDirTarget(W, me, def, dx, dy) {
  let best = null, bs = 1e9;
  for (const e of W._heroes) {
    if (e.team === me.team || e.dead || !canSee(W, me.team, e) || untarg(e)) continue;
    const ex = e.x - me.x, ey = e.y - me.y, d = Math.hypot(ex, ey);
    if (d > def.range + 80) continue;
    const ang = Math.acos(clamp((ex * dx + ey * dy) / (d || 1), -1, 1));
    const sc = ang * 400 + d;
    if (sc < bs) { bs = sc; best = e; }
  }
  return best;
}
function castAimed(W, me, s, dx, dy, mag) {
  const def = sdef(me, s);
  if (def.aim === 'point') me.cmd.cast = { s, x: me.x + dx * mag * def.range, y: me.y + dy * mag * def.range };
  else if (def.aim === 'dir') me.cmd.cast = { s, x: me.x + dx * 300, y: me.y + dy * 300 };
  else if (def.aim === 'unit') { const t = pickDirTarget(W, me, def, dx, dy); if (!t) { toast('附近没有敌方英雄', C.dim); return; } me.cmd.cast = { s, id: t.id }; }
  else me.cmd.cast = { s };
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
    if (d > JOY_DEAD) return scrDir(dx, dy);
    return null;
  }
  const k = INP.keys;
  const x = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0), y = (k.KeyS || k.ArrowDown ? 1 : 0) - (k.KeyW || k.ArrowUp ? 1 : 0);
  if (!x && !y) return null;
  return scrDir(x, y);
}
// 每帧：把摇杆、普攻键写进玩家的指令
function playerCmd(W, me) {
  const c = me.cmd || (me.cmd = {});
  c.mv = moveVec();
  c.atkAuto = INP.atk != null || INP.keyAtk;
  c.goto = null; c.atk = 0;
}
// 键盘
function mouseWorld() {
  if (!INP.mouse || R3.t - INP.mouseT > 4) return null;
  return screenToGround(INP.mouse[0], INP.mouse[1]);
}
function onKey(W, me, code, down) {
  if (down) HUD.keyboard = true;
  INP.keys[code] = down;
  if (code === 'KeyJ' || code === 'Space') INP.keyAtk = down;
  if (!down || !me || me.dead) return;
  const sk = { Digit1: 0, KeyQ: 0, KeyU: 0, Digit2: 1, KeyE: 1, KeyI: 1, Digit3: 2, KeyR: 2, KeyO: 2 }[code];
  if (sk != null) {
    const st = me.sk[sk];
    if (!st.rank) { toast(sk === 2 ? '4 级解锁大招' : '2 级解锁这个技能', C.dim); return; }
    if (st.cd > 0) { toast('技能冷却中', C.dim); return; }
    const mw = mouseWorld();
    if (mw) {
      const def = sdef(me, sk), dx = mw[0] - me.x, dy = mw[1] - me.y, d = Math.hypot(dx, dy) || 1;
      castAimed(W, me, sk, dx / d, dy / d, Math.min(1, d / (def.range || 1)));
    } else smartCast(W, me, sk);
    return;
  }
  if (code === 'KeyF') {
    if (me.flashCd > 0) { toast('闪现冷却中', C.dim); return; }
    const mw = mouseWorld();
    me.cmd.flash = mw ? [mw[0], mw[1]] : (() => { const [dx, dy] = joyDir(me); return [me.x + dx * 100, me.y + dy * 100]; })();
  }
  if (code === 'KeyH' || code === 'KeyC') { if (me.healCd > 0) toast('恢复冷却中', C.dim); else me.cmd.heal = true; }
  if (code === 'KeyB') me.cmd.recall = true;
}
if (typeof module !== 'undefined') module.exports = {};
