'use strict';
/* hud.js：游戏里的界面，画在和世界同一块像素缓冲上（所以像素一样大）。布局照王者荣耀：
   左上小地图，上面中间比分和时间，右上暂停 / 托管；左边金币和推荐装备；左下摇杆；右下普攻和三个技能，旁边闪现、恢复、回城。
   hudLayout() 同时给 input.js 判断按到了哪个按钮。 */

const HUD = { ann: [], feed: [], toast: null, toastT: 0, lvlFlash: [0, 0, 0], tips: 10, keyboard: false, lowT: 0 };
const INS = { l: 0, r: 0, t: 0, b: 0 };     // 刘海、圆角让出来的地方（缓冲像素）

function hudLayout() {
  const bw = R.bw, bh = R.bh;
  const il = INS.l, ir = INS.r, it = INS.t, ib = INS.b;
  const ax = bw - ir - 31, ay = bh - ib - 31;
  return {
    mini: { x: il + 3, y: it + 3, s: 64 },
    pause: { x: bw - ir - 12, y: it + 11, r: 9 },
    auto: { x: bw - ir - 33, y: it + 11, r: 9 },
    rally: { x: bw - ir - 54, y: it + 11, r: 9 },
    shop: { x: il + 3, y: it + 70, w: 44, h: 13 },
    buy: { x: il + 15, y: it + 100, r: 12 },
    atk: { x: ax, y: ay, r: 22 },
    s: [{ x: ax - 52, y: ay + 6, r: 14 }, { x: ax - 43, y: ay - 37, r: 14 }, { x: ax - 6, y: ay - 56, r: 14 }],
    flash: { x: ax - 88, y: ay + 10, r: 11 },
    heal: { x: ax - 113, y: ay + 13, r: 10 },
    recall: { x: ax - 137, y: ay + 13, r: 10 },
    cancel: { x: ax - 12, y: ay - 100, r: 14 },
    joy: { x: il + 48, y: bh - ib - 48, r: 27 },
  };
}

/* ---------- 缓存的小图 ---------- */
function discImg(r, fill, edge, alpha) {
  const key = 'disc' + r + fill + edge + alpha;
  if (SH[key]) return SH[key];
  const c = mkc(r * 2 + 1, r * 2 + 1), g = c.getContext('2d');
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
    const d = Math.hypot(x, y);
    if (d > r + 0.3) continue;
    g.globalAlpha = d > r - 1.2 ? 1 : alpha;
    g.fillStyle = d > r - 1.2 ? edge : fill;
    g.fillRect(x + r, y + r, 1, 1);
  }
  SH[key] = c;
  return c;
}
function pieImg(r, frac) {                    // 冷却的扇形遮罩
  const q = Math.round(frac * 24);
  const key = 'pie' + r + q;
  if (SH[key]) return SH[key];
  const c = mkc(r * 2 + 1, r * 2 + 1), g = c.getContext('2d');
  g.fillStyle = 'rgba(8,6,14,0.72)';
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
    if (Math.hypot(x, y) > r - 1) continue;
    let a = Math.atan2(x, -y); if (a < 0) a += Math.PI * 2;
    if (a / (Math.PI * 2) < q / 24) g.fillRect(x + r, y + r, 1, 1);
  }
  SH[key] = c;
  return c;
}
function grayOf(img) {
  const key = 'gray' + (img._k || (img._k = Math.random().toString(36).slice(2)));
  if (SH[key]) return SH[key];
  const c = mkc(img.width, img.height), g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height), p = d.data;
  for (let i = 0; i < p.length; i += 4) { const v = (p[i] * 0.3 + p[i + 1] * 0.59 + p[i + 2] * 0.11) * 0.7; p[i] = p[i + 1] = p[i + 2] = v; }
  g.putImageData(d, 0, 0);
  SH[key] = c;
  return c;
}
function panel(x, y, w, h, alpha) {
  const g = R.g;
  g.fillStyle = `rgba(16,14,26,${alpha == null ? 0.72 : alpha})`; g.fillRect(x, y, w, h);
  g.fillStyle = C.ink; g.fillRect(x, y - 1, w, 1); g.fillRect(x, y + h, w, 1); g.fillRect(x - 1, y, 1, h); g.fillRect(x + w, y, 1, h);
}
function fmtTime(t) { const s = Math.floor(t); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
function heroColor(h) { return HERO_BY_ID[h.hid].col; }
function miniPortrait(hid, team) {           // 击杀播报里的小头像：14×14，队伍色的框
  const key = 'mp' + hid + team;
  if (SH[key]) return SH[key];
  const c = mkc(16, 16), g = c.getContext('2d');
  g.fillStyle = team === 0 ? C.blue2 : C.red2; g.fillRect(0, 0, 16, 16);
  g.fillStyle = '#211A2A'; g.fillRect(1, 1, 14, 14);
  const s = heroSprite(hid, 'idle', 0, 1, false);
  g.save(); g.beginPath(); g.rect(1, 1, 14, 14); g.clip();
  g.drawImage(s, HX + 2, HY - 2, 22, 16, 1, 3, 14, 10);
  g.restore();
  SH[key] = c;
  return c;
}

/* ---------- 播报 ---------- */
function announce(text, col, o) {
  o = o || {};
  const a = { text, col: col || C.gold, t: 0, dur: o.dur || 2.4, k: o.k, v: o.v, sub: o.sub, voice: o.voice };
  if (o.urgent) HUD.ann.length = 0;
  HUD.ann.push(a);
  // 只留正在播的和最新的一条：团战里一下子来好几条，中间的跳过
  if (HUD.ann.length > 2) HUD.ann.splice(1, HUD.ann.length - 2);
}
function toast(text, col) { HUD.toast = { text, col: col || C.white }; HUD.toastT = 1.6; }

/* ---------- 画界面 ---------- */
function drawHUD(W, me, dt) {
  const g = R.g, Lt = hudLayout();
  HUD.L = Lt;
  // 死了：画面压暗，中间倒计时
  if (me.dead && W.winner < 0) {
    g.fillStyle = 'rgba(20,18,30,0.5)'; g.fillRect(0, 0, R.bw, R.bh);
    const left = Math.max(0, Math.ceil(me.respawnAt - W.t));
    const t1 = textImg('复活倒计时', C.white, { ol: C.ink });
    const d1 = digitsImg(String(left), C.gold, 4);
    g.drawImage(t1, (R.bw >> 1) - (t1.width >> 1), (R.bh >> 1) - 34);
    g.drawImage(d1, (R.bw >> 1) - (d1.width >> 1), (R.bh >> 1) - 18);
  } else if (!me.dead && me.hp / me.maxHp < 0.3) {     // 残血：四边一闪一闪的红
    HUD.lowT += dt;
    const a = 0.25 + 0.2 * Math.sin(HUD.lowT * 7);
    g.fillStyle = `rgba(220,30,30,${a})`;
    g.fillRect(0, 0, R.bw, 3); g.fillRect(0, R.bh - 3, R.bw, 3); g.fillRect(0, 0, 3, R.bh); g.fillRect(R.bw - 3, 0, 3, R.bh);
  }
  drawMinimap(W, me, Lt.mini);
  drawScore(W, me);
  drawTopRight(W, me, Lt);
  drawEconomy(W, me, Lt);
  drawFeed(W, dt);
  drawAnnounce(dt);
  drawControls(W, me, Lt);
  // 提示
  if (HUD.tips > 0 && W.t < 14) {
    HUD.tips -= dt;
    const s = HUD.keyboard ? 'WASD移动  J普攻  1/2/3技能  F闪现  B回城' : '左手摇杆移动  右手按住普攻  拖动技能瞄准';
    const im = textImg(s, C.white, { ol: C.ink });
    g.globalAlpha = Math.min(1, HUD.tips);
    g.drawImage(im, (R.bw >> 1) - (im.width >> 1), R.bh - INS.b - 74);
    g.globalAlpha = 1;
  }
  if (HUD.toastT > 0 && HUD.toast) {
    HUD.toastT -= dt;
    const im = textImg(HUD.toast.text, HUD.toast.col, { ol: C.ink });
    g.globalAlpha = Math.min(1, HUD.toastT * 3);
    g.drawImage(im, (R.bw >> 1) - (im.width >> 1), (R.bh >> 1) + 30);
    g.globalAlpha = 1;
  }
  if (W.auto && !me.dead) {
    const im = textImg('托管中 · 点右上角“托”取消', '#9CF09C', { ol: C.ink });
    g.drawImage(im, (R.bw >> 1) - (im.width >> 1), R.bh - INS.b - 56);
  }
}
function drawMinimap(W, me, m) {
  const g = R.g, s = m.s, sc = s / L;
  panel(m.x - 1, m.y - 1, s + 2, s + 2, 0.9);
  g.drawImage(R.mini, m.x, m.y);
  const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(m.x + Math.round(x * sc - w / 2), m.y + Math.round(y * sc - h / 2), w, h); };
  for (const u of W.units) {
    if (u.dead) continue;
    if (u.kind === 'minion') P(u.x, u.y, 1, 1, u.team ? '#FF8A7A' : '#8AB8FF');
    else if (u.kind === 'tower') { P(u.x, u.y, 4, 4, C.ink); P(u.x, u.y, 2, 2, u.team ? C.red : C.blue); }
    else if (u.kind === 'crystal') { P(u.x, u.y, 5, 5, C.ink); P(u.x, u.y, 3, 3, u.team ? C.red : C.blue); }
    else if (u.kind === 'monster') P(u.x, u.y, u.mt === 'lord' || u.mt === 'drake' ? 3 : 2, u.mt === 'lord' || u.mt === 'drake' ? 3 : 2, u.mt === 'lord' ? '#C080FF' : u.mt === 'drake' ? '#60D080' : '#F2A03A');
  }
  for (const h of W._heroes) {
    if (h.dead) continue;
    if (h.team !== 0 && h.hidden && h.hidden[0]) continue;
    const col = h.id === me.id ? '#7CFF7C' : h.team ? C.red : C.blue;
    P(h.x, h.y, 5, 5, C.ink); P(h.x, h.y, 3, 3, col);
    if (h.id === me.id) P(h.x, h.y, 1, 1, '#FFFFFF');
  }
  // 镜头框
  const vx = m.x + Math.round(R.vx * sc), vy = m.y + Math.round(R.vy * sc), vw = Math.round(R.bw * PXU * sc), vh = Math.round(R.bh * PXU * sc);
  g.fillStyle = 'rgba(255,255,255,0.75)';
  const x0 = Math.max(m.x, vx), y0 = Math.max(m.y, vy), x1 = Math.min(m.x + s, vx + vw), y1 = Math.min(m.y + s, vy + vh);
  if (x1 > x0 && y1 > y0) { g.fillRect(x0, y0, x1 - x0, 1); g.fillRect(x0, y1 - 1, x1 - x0, 1); g.fillRect(x0, y0, 1, y1 - y0); g.fillRect(x1 - 1, y0, 1, y1 - y0); }
}
function drawScore(W, me) {
  const g = R.g, w = 78, x = (R.bw >> 1) - (w >> 1), y = INS.t + 3;
  panel(x, y, w, 13, 0.82);
  const b = digitsImg(String(W.kills[0]), C.blue, 1), r = digitsImg(String(W.kills[1]), C.red, 1), t = digitsImg(fmtTime(W.t), C.white, 1);
  g.drawImage(b, x + 14 - (b.width >> 1), y + 3);
  g.drawImage(r, x + w - 14 - (r.width >> 1), y + 3);
  g.drawImage(t, x + (w >> 1) - (t.width >> 1), y + 3);
  g.fillStyle = C.blue; g.fillRect(x + 2, y + 2, 2, 9); g.fillStyle = C.red; g.fillRect(x + w - 4, y + 2, 2, 9);
  // 自己的 KDA、补刀
  const kda = digitsImg(`${me.kills}/${me.deaths}/${me.assists}`, C.gold2, 1);
  g.drawImage(kda, (R.bw >> 1) - (kda.width >> 1), y + 16);
}
function drawTopRight(W, me, Lt) {
  const g = R.g;
  drawAt(discImg(Lt.pause.r, '#241C2E', C.gold, 0.85), Lt.pause.x, Lt.pause.y);
  drawAt(icon('pause'), Lt.pause.x, Lt.pause.y);
  const rcd = Math.max(0, (W.rallyCd || 0) - W.t), ron = W.rally && W.t < W.rally.until;
  drawAt(discImg(Lt.rally.r, ron ? '#1E3A6A' : '#241C2E', ron ? C.blue : rcd > 0 ? '#6A6478' : C.gold, 0.85), Lt.rally.x, Lt.rally.y);
  g.drawImage(icon('rally'), 0, 0, 18, 18, Lt.rally.x - 6, Lt.rally.y - 6, 12, 12);
  if (rcd > 0 && !ron) { drawAt(pieImg(Lt.rally.r, Math.min(1, rcd / 20)), Lt.rally.x, Lt.rally.y); }
  drawAt(discImg(Lt.auto.r, W.auto ? '#1E5A2E' : '#241C2E', W.auto ? '#7CFF7C' : C.gold, 0.85), Lt.auto.x, Lt.auto.y);
  const t = textImg('托', W.auto ? '#C8FFC8' : C.white, {});
  g.drawImage(t, Lt.auto.x - (t.width >> 1), Lt.auto.y - 9);
}
function drawEconomy(W, me, Lt) {
  const g = R.g, s = Lt.shop;
  panel(s.x, s.y, s.w, s.h, 0.82);
  g.drawImage(icon('gold'), s.x - 1, s.y - 3);
  const gd = digitsImg(String(Math.floor(me.gold)), C.gold, 1);
  g.drawImage(gd, s.x + 16, s.y + 3);
  // 推荐装备
  const nb = nextBuy(me);
  HUD.nb = nb;
  if (nb) {
    const b = Lt.buy, ok = me.gold >= nb.price && me.items.length - nb.use.length < 6 + (nb.use.length ? 0 : 0);
    const blink = ok && Math.floor(R.t * 3) % 2;
    drawAt(discImg(b.r, ok ? '#3A2A10' : '#241C2E', ok ? (blink ? C.gold2 : C.gold) : '#6A6478', 0.88), b.x, b.y);
    const ic = icon(nb.id);
    drawAt(ok ? ic : grayOf(ic), b.x, b.y - 1);
    const pr = digitsImg(String(nb.price), ok ? C.gold2 : C.dim, 1);
    g.drawImage(pr, b.x - (pr.width >> 1), b.y + b.r + 1);
    if (ok) { const t = textImg('购买', C.gold2, { ol: C.ink }); g.drawImage(t, b.x + b.r + 1, b.y - 9); }
  }
  // 身上的装备（小格子）
  const x0 = Lt.shop.x, y0 = Lt.buy.y + Lt.buy.r + 10;
  for (let i = 0; i < 6; i++) {
    const x = x0 + (i % 3) * 14, y = y0 + Math.floor(i / 3) * 14;
    g.fillStyle = 'rgba(16,14,26,0.6)'; g.fillRect(x, y, 13, 13);
    if (me.items[i]) g.drawImage(icon(me.items[i]), 0, 0, 18, 18, x, y, 13, 13);
  }
}
function drawFeed(W, dt) {
  const g = R.g;
  let y = INS.t + 24, n = 0;
  for (const f of HUD.feed) {
    f.t += dt;
    if (f.t > 6) continue;
    const x = R.bw - INS.r - 46;
    g.globalAlpha = f.t > 5.5 ? (6 - f.t) * 2 : 1;
    panel(x, y, 44, 16, 0.6);
    if (f.k) g.drawImage(miniPortrait(f.k, f.kt), x, y);
    else { g.fillStyle = f.kt ? C.red2 : C.blue2; g.fillRect(x + 3, y + 3, 10, 10); }
    g.drawImage(icon('a3'), 0, 0, 18, 18, x + 16, y + 2, 12, 12);
    g.drawImage(miniPortrait(f.v, f.vt), x + 28, y);
    g.globalAlpha = 1;
    y += 18;
    HUD.feed[n++] = f;
    if (n >= 4) break;
  }
  HUD.feed.length = n;
}
function drawAnnounce(dt) {
  const g = R.g;
  const a = HUD.ann[0];
  if (!a) return;
  if (!a.started) { a.started = true; if (a.voice) sayVoice(a.voice); }
  a.t += dt;
  // 后面还有一条在等：这条最多再显示一会儿就让位
  if (HUD.ann.length > 1 && a.t > 1.2 && a.t < a.dur - 0.25) a.t = a.dur - 0.25;
  if (a.t > a.dur) { HUD.ann.shift(); return; }
  const k = a.t / a.dur;
  const im = textImg(a.text, a.col, { ol: C.ink, scale: 2 });
  const y0 = INS.t + 36 + (k < 0.08 ? Math.round((0.08 - k) * 120) : 0);
  g.globalAlpha = k > 0.85 ? (1 - k) / 0.15 : 1;
  // 光带
  const bwid = Math.max(180, im.width + 16);
  g.fillStyle = 'rgba(16,14,26,0.55)'; g.fillRect((R.bw >> 1) - (bwid >> 1), y0 + 1, bwid, 30);
  g.fillStyle = a.col; g.fillRect((R.bw >> 1) - (bwid >> 1), y0 + 1, bwid, 1); g.fillRect((R.bw >> 1) - (bwid >> 1), y0 + 30, bwid, 1);
  g.drawImage(im, (R.bw >> 1) - (im.width >> 1), y0);
  if (a.k || a.v) {
    const yy = y0 + im.height + 2;
    if (a.k) g.drawImage(miniPortrait(a.k[0], a.k[1]), (R.bw >> 1) - 26, yy);
    g.drawImage(icon('a3'), 0, 0, 18, 18, (R.bw >> 1) - 6, yy + 2, 12, 12);
    if (a.v) g.drawImage(miniPortrait(a.v[0], a.v[1]), (R.bw >> 1) + 10, yy);
  }
  if (a.sub) { const s = textImg(a.sub, C.white, { ol: C.ink }); g.drawImage(s, (R.bw >> 1) - (s.width >> 1), y0 + im.height + (a.k ? 20 : 2)); }
  g.globalAlpha = 1;
}
function drawControls(W, me, Lt) {
  const g = R.g;
  // 摇杆
  const j = INP.joy, J = Lt.joy;
  const jx = j ? j.bx : J.x, jy = j ? j.by : J.y;
  drawAt(discImg(J.r, '#FFFFFF', 'rgba(255,255,255,0.55)', j ? 0.12 : 0.06), jx, jy);
  const kx = j ? j.x : jx, ky = j ? j.y : jy;
  drawAt(discImg(11, j ? '#FFFFFF' : '#D8D4E0', '#FFFFFF', j ? 0.55 : 0.3), kx, ky);
  if (me.dead) return;
  // 普攻
  const A = Lt.atk, held = INP.atk != null || INP.keyAtk;
  drawAt(discImg(A.r, held ? '#5A3A1A' : '#2A2034', held ? C.gold2 : C.gold, 0.88), A.x, A.y);
  const ai = icon(me.hid === 'marksman' ? 'bow' : me.hid === 'mage' ? 'staff' : me.hid === 'tank' ? 'shield' : me.hid === 'assassin' ? 'dagger' : me.hid === 'support' ? 'wand' : 'atk');
  g.drawImage(ai, 0, 0, 18, 18, A.x - 13, A.y - 13, 27, 27);
  // 技能
  for (let s = 0; s < 3; s++) {
    const b = Lt.s[s], st = me.sk[s], def = sdef(me, s);
    const ready = st.rank > 0 && st.cd <= 0;
    const aiming = INP.aim && INP.aim.s === s;
    const flash = HUD.lvlFlash[s] > 0;
    if (flash) HUD.lvlFlash[s] -= 1 / 60;
    drawAt(discImg(b.r, '#241C2E', flash ? '#FFFFFF' : ready ? C.gold : '#6A6478', 0.88), b.x, b.y);
    const ic = icon(def.id);
    drawAt(st.rank ? ic : grayOf(ic), b.x, b.y);
    if (st.rank && st.cd > 0) {
      const full = cdOf(me, s);
      drawAt(pieImg(b.r, Math.min(1, st.cd / full)), b.x, b.y);
      const d = digitsImg(String(Math.ceil(st.cd)), C.white, 1);
      g.drawImage(d, b.x - (d.width >> 1), b.y - 3);
    }
    if (!st.rank) { const t = textImg(s === 2 ? '4级' : '2级', C.dim, { ol: C.ink }); g.drawImage(t, b.x - (t.width >> 1), b.y - 9); }
    for (let r = 0; r < (s === 2 ? 3 : 6); r++) { g.fillStyle = r < st.rank ? C.gold : 'rgba(255,255,255,0.18)'; g.fillRect(b.x - (s === 2 ? 5 : 11) + r * 4, b.y + b.r + 2, 2, 2); }
    if (aiming) drawAimPad(b, INP.aim);
  }
  // 召唤师技能
  const sm = [['flash', Lt.flash, me.flashCd, FLASH_CD], ['heal', Lt.heal, me.healCd, HEAL_CD], ['recall', Lt.recall, me.recall ? 1 : 0, 0]];
  for (const [name, b, cd, full] of sm) {
    const ready = cd <= 0;
    drawAt(discImg(b.r, '#241C2E', name === 'recall' && me.recall ? '#7FB4FF' : ready ? '#C8C0D8' : '#6A6478', 0.85), b.x, b.y);
    g.drawImage(icon(name), 0, 0, 18, 18, b.x - 7, b.y - 7, 14, 14);
    if (name !== 'recall' && cd > 0) {
      drawAt(pieImg(b.r, Math.min(1, cd / full)), b.x, b.y);
      const d = digitsImg(String(Math.ceil(cd)), C.white, 1);
      g.drawImage(d, b.x - (d.width >> 1), b.y - 3);
    }
  }
  if (INP.aim && INP.aim.s === 'flash') drawAimPad(Lt.flash, INP.aim);
  // 取消施法
  if (INP.aim && INP.aim.moved) {
    const cb = Lt.cancel, on = INP.aim.cancel;
    drawAt(discImg(cb.r, on ? '#8A1A1A' : '#241C2E', on ? '#FF8A8A' : '#C8C0D8', 0.85), cb.x, cb.y);
    const t = textImg('取消', on ? '#FFFFFF' : C.white, {});
    g.drawImage(t, cb.x - (t.width >> 1), cb.y - 9);
  }
}
function drawAimPad(b, aim) {               // 按住技能时按钮外面的大圈和小圆点
  drawAt(circleRing(30, '#FFFFFF', 0.5, 0), b.x, b.y);
  const r = Math.min(30, Math.hypot(aim.px, aim.py));
  const a = Math.atan2(aim.py, aim.px);
  drawAt(discImg(8, aim.cancel ? '#FF8A8A' : '#FFFFFF', '#FFFFFF', 0.7), b.x + Math.cos(a) * r, b.y + Math.sin(a) * r);
}
if (typeof module !== 'undefined') module.exports = {};
