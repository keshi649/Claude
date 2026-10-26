'use strict';
/* audio.js：音效全部用 WebAudio 现场合成（8 位游戏风），离镜头越远越小声；播报语音是 CosyVoice 3 合成的小 mp3（build 时嵌进来，VOICE 里是 base64）。
   浏览器要求先点一下才能出声：点“开始”时调用 audioInit()。 */

const AU = { ctx: null, master: null, sfxBus: null, voiceBus: null, on: true, noise: null, voices: {}, last: {}, playing: null, queue: [], camX: 0, camY: 0 };

function audioInit() {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  AU.ctx = ctx;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14; comp.ratio.value = 4;
  AU.master = ctx.createGain(); AU.master.gain.value = AU.on ? 0.9 : 0;
  AU.master.connect(comp); comp.connect(ctx.destination);
  AU.sfxBus = ctx.createGain(); AU.sfxBus.gain.value = 0.55; AU.sfxBus.connect(AU.master);
  AU.voiceBus = ctx.createGain(); AU.voiceBus.gain.value = 1.0; AU.voiceBus.connect(AU.master);
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
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 480;
  const g = c.createGain(); g.gain.value = 0.05;
  const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.11; lg.gain.value = 0.03;
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
  const t = AU.ctx.currentTime, n = 2 + Math.floor(Math.random() * 3), f0 = 2300 + Math.random() * 1200;
  for (let i = 0; i < n; i++) osc('sine', f0, f0 * 1.35, t + i * 0.09, 0.06, 0.035, AU.master);
}
function setSound(on) {
  AU.on = on;
  if (AU.master) AU.master.gain.setTargetAtTime(on ? 0.9 : 0, AU.ctx.currentTime, 0.05);
}

/* ---------- 合成的小零件 ---------- */
function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
function osc(type, f0, f1, t, dur, vol, out) {
  const c = AU.ctx, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  env(g, t, 0.005, vol, dur);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05);
}
function noise(t, dur, vol, ftype, f0, f1, q, out) {
  const c = AU.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = AU.noise; s.loop = true;
  f.type = ftype; f.frequency.setValueAtTime(f0, t); if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t + dur); f.Q.value = q || 1;
  env(g, t, 0.004, vol, dur);
  s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
}
const SYN = {
  swing(t, v, o) { noise(t, 0.12, 0.5 * v, 'bandpass', 900, 3200, 2, o); },
  hit(t, v, o) { noise(t, 0.06, 0.6 * v, 'lowpass', 1600, 400, 1, o); osc('sine', 160, 70, t, 0.08, 0.5 * v, o); },
  shoot(t, v, o) { osc('triangle', 950, 420, t, 0.07, 0.35 * v, o); noise(t, 0.04, 0.2 * v, 'highpass', 3000, 3000, 1, o); },
  magic(t, v, o) { osc('sine', 620, 1250, t, 0.14, 0.3 * v, o); osc('triangle', 930, 1870, t, 0.1, 0.12 * v, o); },
  heart(t, v, o) { osc('sine', 880, 880, t, 0.1, 0.25 * v, o); osc('sine', 1320, 1320, t + 0.05, 0.1, 0.2 * v, o); },
  tower(t, v, o) { osc('square', 320, 90, t, 0.22, 0.22 * v, o); noise(t, 0.15, 0.25 * v, 'lowpass', 2400, 300, 1, o); },
  boom(t, v, o) { noise(t, 0.55, 0.9 * v, 'lowpass', 2200, 120, 1, o); osc('sine', 110, 40, t, 0.4, 0.6 * v, o); },
  fire(t, v, o) { noise(t, 0.3, 0.35 * v, 'bandpass', 700, 300, 1.5, o); osc('sine', 260, 120, t, 0.25, 0.25 * v, o); },
  ice(t, v, o) { for (const [f, d] of [[1760, 0], [2349, 0.04], [2637, 0.08], [3520, 0.12]]) osc('sine', f, f * 0.98, t + d, 0.25, 0.12 * v, o); noise(t, 0.3, 0.2 * v, 'highpass', 5000, 5000, 1, o); },
  dash(t, v, o) { noise(t, 0.22, 0.45 * v, 'bandpass', 400, 2400, 1.2, o); },
  stun(t, v, o) { osc('sine', 900, 280, t, 0.16, 0.4 * v, o); osc('square', 1400, 1400, t + 0.02, 0.04, 0.1 * v, o); },
  heal(t, v, o) { [523, 659, 784].forEach((f, i) => osc('sine', f, f, t + i * 0.06, 0.18, 0.18 * v, o)); },
  shield(t, v, o) { osc('sine', 440, 660, t, 0.35, 0.22 * v, o); osc('sine', 660, 990, t, 0.35, 0.12 * v, o); },
  coin(t, v, o) { osc('square', 988, 988, t, 0.05, 0.12 * v, o); osc('square', 1319, 1319, t + 0.055, 0.12, 0.12 * v, o); },
  levelup(t, v, o) { [523, 659, 784, 1047].forEach((f, i) => osc('square', f, f, t + i * 0.07, 0.1, 0.13 * v, o)); },
  kill(t, v, o) { [220, 277, 330].forEach(f => osc('sawtooth', f, f * 0.98, t, 0.35, 0.09 * v, o)); noise(t, 0.2, 0.3 * v, 'lowpass', 3000, 300, 1, o); },
  death(t, v, o) { osc('square', 420, 90, t, 0.5, 0.16 * v, o); },
  pop(t, v, o) { osc('square', 600, 200, t, 0.06, 0.12 * v, o); },
  click(t, v, o) { osc('square', 1200, 1200, t, 0.03, 0.12 * v, o); },
  recall(t, v, o) { osc('sine', 300, 900, t, 1.2, 0.12 * v, o); osc('sine', 450, 1350, t + 0.1, 1.1, 0.06 * v, o); },
  flash(t, v, o) { noise(t, 0.15, 0.4 * v, 'highpass', 2500, 6000, 1, o); osc('sine', 2200, 500, t, 0.12, 0.2 * v, o); },
  meteor(t, v, o) { osc('sine', 1800, 300, t, 0.45, 0.12 * v, o); },
  big(t, v, o) { noise(t, 0.5, 0.6 * v, 'bandpass', 300, 3000, 1, o); osc('sawtooth', 110, 55, t, 0.4, 0.15 * v, o); },
  crumble(t, v, o) { noise(t, 1.1, 0.8 * v, 'lowpass', 1800, 100, 0.8, o); for (let i = 0; i < 5; i++) osc('sine', 120 - i * 15, 50, t + i * 0.12, 0.2, 0.3 * v, o); },
  win(t, v, o) { [523, 659, 784, 1047, 1319].forEach((f, i) => { osc('square', f, f, t + i * 0.12, 0.25, 0.12 * v, o); osc('triangle', f / 2, f / 2, t + i * 0.12, 0.3, 0.12 * v, o); }); },
  lose(t, v, o) { [440, 415, 392, 330].forEach((f, i) => osc('triangle', f, f * 0.97, t + i * 0.22, 0.4, 0.18 * v, o)); },
  wave(t, v, o) { [392, 523, 659].forEach((f, i) => osc('square', f, f, t + i * 0.1, 0.18, 0.1 * v, o)); },
};
const SFX_GAP = { hit: 0.035, swing: 0.04, shoot: 0.04, tower: 0.08, coin: 0.05, pop: 0.05, magic: 0.05, heart: 0.06 };
// x, y：世界坐标（null = 不按距离衰减）
function sfx(name, x, y, vol) {
  if (!AU.ctx || !AU.on || !SYN[name]) return;
  const now = AU.ctx.currentTime;
  if (AU.last[name] && now - AU.last[name] < (SFX_GAP[name] || 0.02)) return;
  let v = vol == null ? 1 : vol;
  if (x != null) {
    const d = Math.hypot(x - AU.camX, y - AU.camY);
    v *= clamp(1 - (d - 350) / 1000, 0, 1);
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
  AU.sfxBus.gain.setTargetAtTime(0.3, now, 0.05);
  AU.sfxBus.gain.setTargetAtTime(0.55, now + b.duration, 0.15);
  s.onended = () => { AU.playing = null; const n = AU.queue.shift(); if (n) sayVoice(n); };
}
if (typeof module !== 'undefined') module.exports = {};
