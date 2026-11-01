'use strict';
/* audio.js：音效全部用 WebAudio 现场合成——不用方波、锯齿波那种 8 位游戏的声音，改成滤波噪声的“呼”声、正弦的闷响、
   调频（FM）合成的金属声和铃声，再走一条混响（开局时算一段衰减的噪声当冲激响应）。离镜头越远越小声。
   播报语音是 CosyVoice 3 合成的小 mp3（build 时嵌进来，VOICE 里是 base64）。浏览器要先点一下才能出声：点“开始对战”时调 audioInit()。 */

const AU = { ctx: null, master: null, sfxBus: null, voiceBus: null, rev: null, on: true, noise: null, voices: {}, last: {}, playing: null, queue: [], camX: 0, camY: 0 };

function audioInit() {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  AU.ctx = ctx;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
  AU.master = ctx.createGain(); AU.master.gain.value = AU.on ? 0.9 : 0;
  AU.master.connect(comp); comp.connect(ctx.destination);
  AU.sfxBus = ctx.createGain(); AU.sfxBus.gain.value = 0.6; AU.sfxBus.connect(AU.master);
  AU.voiceBus = ctx.createGain(); AU.voiceBus.gain.value = 1.0; AU.voiceBus.connect(AU.master);
  // 混响：1.6 秒衰减的立体声噪声
  const len = Math.floor(ctx.sampleRate * 1.6), ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
  const conv = ctx.createConvolver(); conv.buffer = ir;
  AU.rev = ctx.createGain(); AU.rev.gain.value = 0.22;
  AU.rev.connect(conv); conv.connect(AU.master);
  const n = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = n.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  AU.noise = n;
  if (typeof VOICE !== 'undefined') {
    for (const id in VOICE) {
      try {
        const bin = atob(VOICE[id]), buf = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
        ctx.decodeAudioData(buf.buffer, b => { AU.voices[id] = b; }, () => {});
      } catch (e) { /* 解不开就没有这句语音，画面上的字照常出 */ }
    }
  }
  if (ctx.state === 'suspended') ctx.resume();
}
// 环境声：一层很轻的风（低通噪声，慢慢起伏），隔几秒一声鸟叫。没有配乐
function ambientStart() {
  if (!AU.ctx || AU.amb) return;
  const c = AU.ctx;
  const src = c.createBufferSource(); src.buffer = AU.noise; src.loop = true;
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420;
  const g = c.createGain(); g.gain.value = 0.05;
  const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.09; lg.gain.value = 0.03;
  lfo.connect(lg); lg.connect(g.gain);
  src.connect(f); f.connect(g); g.connect(AU.master);
  src.start(); lfo.start();
  AU.amb = { src, g, lfo }; AU.birdT = 2;
}
function ambientTick(dt) {
  if (!AU.amb || !AU.on) return;
  AU.birdT -= dt;
  if (AU.birdT > 0) return;
  AU.birdT = 3 + Math.random() * 7;
  const t = AU.ctx.currentTime, n = 2 + Math.floor(Math.random() * 3), f0 = 2400 + Math.random() * 1400;
  for (let i = 0; i < n; i++) chirp(f0 * (1 + (Math.random() - 0.5) * 0.1), t + i * (0.1 + Math.random() * 0.05), 0.03);
}
function chirp(f, t, vol) {
  const c = AU.ctx, o = c.createOscillator(), m = c.createOscillator(), mg = c.createGain(), g = c.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.3, t + 0.06); o.frequency.exponentialRampToValueAtTime(f * 0.9, t + 0.1);
  m.frequency.value = 38; mg.gain.value = f * 0.04; m.connect(mg); mg.connect(o.frequency);
  env(g, t, 0.008, vol, 0.09);
  o.connect(g); g.connect(AU.master); g.connect(AU.rev);
  o.start(t); m.start(t); o.stop(t + 0.15); m.stop(t + 0.15);
}
function setSound(on) {
  AU.on = on;
  if (AU.master) AU.master.gain.setTargetAtTime(on ? 0.9 : 0, AU.ctx.currentTime, 0.05);
}

/* ---------- 合成的小零件 ---------- */
function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
function out2(g, o, wet) { g.connect(o); if (wet) { const s = AU.ctx.createGain(); s.gain.value = wet; g.connect(s); s.connect(AU.rev); } }
// 正弦（或三角）音：频率从 f0 滑到 f1
function tone(type, f0, f1, t, dur, vol, o, wet) {
  const c = AU.ctx, os = c.createOscillator(), g = c.createGain();
  os.type = type; os.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) os.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  env(g, t, 0.006, vol, dur);
  os.connect(g); out2(g, o, wet); os.start(t); os.stop(t + dur + 0.05);
}
// 调频：载波 f，调制比 ratio、调制深度 idx（金属、铃声）
function fm(f, ratio, idx, t, dur, vol, o, wet) {
  const c = AU.ctx, car = c.createOscillator(), mod = c.createOscillator(), mg = c.createGain(), g = c.createGain();
  car.frequency.value = f; mod.frequency.value = f * ratio;
  mg.gain.setValueAtTime(f * idx, t); mg.gain.exponentialRampToValueAtTime(Math.max(1, f * idx * 0.05), t + dur);
  mod.connect(mg); mg.connect(car.frequency);
  env(g, t, 0.003, vol, dur);
  car.connect(g); out2(g, o, wet);
  car.start(t); mod.start(t); car.stop(t + dur + 0.05); mod.stop(t + dur + 0.05);
}
// 滤波噪声：滤波器频率从 f0 扫到 f1
function noise(t, dur, vol, ftype, f0, f1, q, o, wet, attack) {
  const c = AU.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = AU.noise; s.loop = true;
  f.type = ftype; f.frequency.setValueAtTime(f0, t); if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t + dur); f.Q.value = q || 1;
  env(g, t, attack || 0.004, vol, dur);
  s.connect(f); f.connect(g); out2(g, o, wet); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.08);
}
const SYN = {
  swing(t, v, o) { noise(t, 0.16, 0.55 * v, 'bandpass', 600, 2600, 1.4, o, 0, 0.03); },
  whirl(t, v, o) { for (let i = 0; i < 4; i++) noise(t + i * 0.12, 0.18, 0.45 * v, 'bandpass', 500, 2200, 1.6, o, 0.2, 0.04); },
  hit(t, v, o) { noise(t, 0.07, 0.55 * v, 'lowpass', 2400, 500, 0.8, o); tone('sine', 140, 55, t, 0.12, 0.6 * v, o); },
  thud(t, v, o) { tone('sine', 110, 40, t, 0.25, 0.8 * v, o, 0.2); noise(t, 0.2, 0.4 * v, 'lowpass', 900, 150, 0.8, o); },
  shoot(t, v, o) { noise(t, 0.09, 0.4 * v, 'highpass', 2500, 5000, 0.8, o); tone('triangle', 520, 300, t, 0.07, 0.18 * v, o); },
  magic(t, v, o) { fm(880, 2.01, 1.2, t, 0.22, 0.16 * v, o, 0.5); tone('sine', 1320, 1760, t, 0.18, 0.08 * v, o, 0.5); },
  heart(t, v, o) { fm(1046, 1.5, 0.8, t, 0.18, 0.13 * v, o, 0.4); fm(1568, 1.5, 0.6, t + 0.05, 0.18, 0.1 * v, o, 0.4); },
  tower(t, v, o) { fm(220, 1.41, 3, t, 0.35, 0.22 * v, o, 0.4); noise(t, 0.2, 0.3 * v, 'bandpass', 1800, 600, 1, o, 0.3); },
  boom(t, v, o) { noise(t, 0.7, 0.9 * v, 'lowpass', 1800, 90, 0.7, o, 0.35); tone('sine', 90, 32, t, 0.5, 0.75 * v, o); },
  fire(t, v, o) { noise(t, 0.45, 0.45 * v, 'bandpass', 500, 1400, 0.9, o, 0.3, 0.05); tone('sine', 180, 90, t, 0.35, 0.3 * v, o); },
  ice(t, v, o) { for (const [f, d] of [[2093, 0], [2637, 0.05], [3136, 0.1], [3951, 0.14]]) fm(f, 3.01, 0.6, t + d, 0.35, 0.07 * v, o, 0.6); noise(t, 0.35, 0.25 * v, 'highpass', 4000, 7000, 0.8, o, 0.3); },
  dash(t, v, o) { noise(t, 0.28, 0.5 * v, 'bandpass', 300, 2600, 1.1, o, 0.15, 0.05); },
  stealth(t, v, o) { noise(t, 0.6, 0.35 * v, 'bandpass', 2400, 400, 2, o, 0.5, 0.1); tone('sine', 600, 300, t, 0.5, 0.08 * v, o, 0.5); },
  stun(t, v, o) { fm(1200, 2.76, 1.5, t, 0.3, 0.14 * v, o, 0.4); fm(1600, 2.76, 1.2, t + 0.06, 0.25, 0.1 * v, o, 0.4); },
  heal(t, v, o) { [523, 659, 784, 1046].forEach((f, i) => fm(f, 2, 0.5, t + i * 0.06, 0.35, 0.09 * v, o, 0.6)); },
  shield(t, v, o) { tone('sine', 330, 495, t, 0.5, 0.2 * v, o, 0.5); tone('sine', 660, 990, t, 0.45, 0.08 * v, o, 0.5); noise(t, 0.4, 0.15 * v, 'bandpass', 1200, 3000, 2, o, 0.5, 0.05); },
  coin(t, v, o) { fm(1760, 3.5, 0.7, t, 0.12, 0.09 * v, o, 0.3); fm(2637, 3.5, 0.6, t + 0.06, 0.2, 0.08 * v, o, 0.3); },
  levelup(t, v, o) { [523, 659, 784, 1046, 1318].forEach((f, i) => fm(f, 2, 0.7, t + i * 0.07, 0.4, 0.09 * v, o, 0.6)); },
  kill(t, v, o) { tone('sine', 120, 45, t, 0.4, 0.6 * v, o, 0.3); noise(t, 0.3, 0.35 * v, 'bandpass', 400, 2400, 1, o, 0.3, 0.02); fm(880, 1.41, 2, t + 0.05, 0.6, 0.08 * v, o, 0.6); },
  death(t, v, o) { tone('sine', 300, 70, t, 0.7, 0.3 * v, o, 0.5); noise(t, 0.5, 0.2 * v, 'lowpass', 1200, 200, 0.8, o, 0.4); },
  pop(t, v, o) { tone('sine', 420, 160, t, 0.08, 0.2 * v, o); noise(t, 0.05, 0.15 * v, 'bandpass', 1500, 800, 1, o); },
  click(t, v, o) { tone('sine', 1400, 900, t, 0.04, 0.12 * v, o); noise(t, 0.02, 0.08 * v, 'highpass', 4000, 4000, 1, o); },
  recall(t, v, o) { tone('sine', 300, 900, t, 1.2, 0.1 * v, o, 0.6); fm(450, 2, 0.5, t + 0.1, 1.1, 0.05 * v, o, 0.6); },
  flash(t, v, o) { noise(t, 0.18, 0.4 * v, 'highpass', 2500, 7000, 0.8, o, 0.3); fm(1800, 1.5, 1, t, 0.15, 0.08 * v, o, 0.4); },
  meteor(t, v, o) { noise(t, 0.8, 0.3 * v, 'bandpass', 3000, 300, 1.2, o, 0.3, 0.2); },
  big(t, v, o) { noise(t, 0.55, 0.6 * v, 'bandpass', 250, 2800, 0.9, o, 0.35, 0.04); tone('sine', 130, 50, t, 0.45, 0.4 * v, o, 0.3); },
  crumble(t, v, o) { noise(t, 1.3, 0.85 * v, 'lowpass', 1600, 80, 0.7, o, 0.4); for (let i = 0; i < 6; i++) tone('sine', 110 - i * 12, 40, t + i * 0.13, 0.25, 0.35 * v, o, 0.2); },
  win(t, v, o) { [523, 659, 784, 1046].forEach((f, i) => { fm(f, 2, 0.6, t + i * 0.12, 1.2, 0.1 * v, o, 0.7); tone('triangle', f / 2, f / 2, t + i * 0.12, 1.2, 0.07 * v, o, 0.7); }); },
  lose(t, v, o) { [392, 370, 349, 262].forEach((f, i) => tone('triangle', f, f * 0.98, t + i * 0.26, 0.8, 0.13 * v, o, 0.7)); },
  wave(t, v, o) { [392, 523, 659].forEach((f, i) => fm(f, 1.5, 0.8, t + i * 0.1, 0.4, 0.09 * v, o, 0.6)); tone('sine', 98, 98, t, 0.6, 0.15 * v, o, 0.5); },
};
const SFX_GAP = { hit: 0.035, swing: 0.04, shoot: 0.04, tower: 0.08, coin: 0.05, pop: 0.05, magic: 0.05, heart: 0.06, boom: 0.06, thud: 0.06 };
// x, y：世界坐标（null = 不按距离衰减）
function sfx(name, x, y, vol) {
  if (!AU.ctx || !AU.on || !SYN[name]) return;
  const now = AU.ctx.currentTime;
  if (AU.last[name] && now - AU.last[name] < (SFX_GAP[name] || 0.02)) return;
  let v = vol == null ? 1 : vol;
  if (x != null) {
    const d = Math.hypot(x - AU.camX, y - AU.camY);
    v *= clamp(1 - (d - 450) / 1300, 0, 1);
    if (v < 0.04) return;
  }
  AU.last[name] = now;
  SYN[name](now + 0.005, v, AU.sfxBus);
}
// 播报语音：一句一句来，后来的排队（最多排两句）
function sayVoice(id) {
  if (!AU.ctx || !AU.on) return;
  const b = AU.voices[id];
  if (!b) return;
  const now = AU.ctx.currentTime;
  if (AU.playing && AU.playing.end > now + 0.05) {
    if (AU.queue.length < 2) AU.queue.push(id); else AU.queue[1] = id;   // 排满了：换掉后面那句，最新的先播
    return;
  }
  const s = AU.ctx.createBufferSource();
  s.buffer = b; s.connect(AU.voiceBus); s.start(now);
  AU.playing = { end: now + b.duration };
  AU.sfxBus.gain.setTargetAtTime(0.32, now, 0.05);
  AU.sfxBus.gain.setTargetAtTime(0.6, now + b.duration, 0.15);
  s.onended = () => { AU.playing = null; const n = AU.queue.shift(); if (n) sayVoice(n); };
}
if (typeof module !== 'undefined') module.exports = {};
