// 逐帧渲染入口。
//   node render.js video 起始帧 结束帧          → 往 stdout 写 480×270 的 RGB24 原始帧（交给 ffmpeg 放大、编码）
//   node render.js sheet 时刻,时刻,… 输出.ppm [列数] [倍数]   → 拼一张预览图（左上角写时刻）
//   node render.js check                        → 查各文件有没有重名函数
//   node render.js cover 输出.ppm                → 封面（1920×1080）
'use strict';
const vm = require('vm'), fs = require('fs'), path = require('path');
const FILES = ['engine.js', 'girls.js', 'props.js', 'scenes1.js', 'scenes2.js', 'scenes3.js', 'scenes4.js', 'main.js'];
globalThis.__glyphs = JSON.parse(fs.readFileSync(path.join(__dirname, 'glyphs.json'), 'utf8'));
const seen = new Map(); let dup = 0;
for (const f of FILES) {
  const p = path.join(__dirname, f); if (!fs.existsSync(p)) continue;
  const src = fs.readFileSync(p, 'utf8');
  for (const m of src.matchAll(/^function\s+([A-Za-z0-9_$]+)\s*\(/gm)) {
    if (seen.has(m[1])) { console.error(`重名函数 ${m[1]}：${seen.get(m[1])} 和 ${f}`); dup++; } else seen.set(m[1], f);
  }
  vm.runInThisContext(src, { filename: p });
}
const mode = process.argv[2];
const W = 480, H = 270, FPS = 30;
const out = new Uint8Array(W * H * 3);

function writePPM(file, w, h, rgb) {
  const head = Buffer.from(`P6\n${w} ${h}\n255\n`);
  fs.writeFileSync(file, Buffer.concat([head, Buffer.from(rgb.buffer, rgb.byteOffset, rgb.length)]));
}

if (mode === 'check') { process.exit(dup ? 1 : 0); }
else if (mode === 'video') {
  const a = +process.argv[3], b = +process.argv[4]; const t0 = Date.now();
  for (let f = a; f < b; f++) {
    globalThis.frame(f / FPS);
    globalThis.toRGB(out);
    let off = 0; const buf = Buffer.from(out.buffer);
    while (off < buf.length) { try { off += fs.writeSync(1, buf, off, buf.length - off); } catch (e) { if (e.code !== 'EAGAIN') throw e; } }
    if ((f - a) % 300 === 0) process.stderr.write(`帧 ${f} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
  }
  process.stderr.write(`done in ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);
}
else if (mode === 'sheet') {
  const ts = process.argv[3].split(',').map(Number), file = process.argv[4];
  const cols = +(process.argv[5] || 4), sc = +(process.argv[6] || 1);
  const rows = Math.ceil(ts.length / cols), SW = W * sc, SH = H * sc;
  const sheet = new Uint8Array(cols * SW * rows * SH * 3);
  ts.forEach((t, n) => {
    globalThis.frame(t); globalThis.toRGB(out);
    // 时刻标签（直接写像素字）
    const lab = t.toFixed(2);
    const ox = (n % cols) * SW, oy = Math.floor(n / cols) * SH;
    for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) {
      const s = ((Math.floor(y / sc)) * W + Math.floor(x / sc)) * 3, d = ((oy + y) * cols * SW + ox + x) * 3;
      sheet[d] = out[s]; sheet[d + 1] = out[s + 1]; sheet[d + 2] = out[s + 2];
    }
    const G = globalThis.__glyphs; let cx = ox + 2;
    for (let y = 0; y < 12; y++) for (let x = 0; x < lab.length * 7 + 3; x++) { const d = ((oy + y) * cols * SW + ox + x) * 3; sheet[d] = 0; sheet[d + 1] = 0; sheet[d + 2] = 0; }
    for (const ch of lab) { const g = G[ch]; for (let r = 4; r < 16; r++) for (let k = 0; k < g.rows[r].length; k++) if (g.rows[r][k] === '1') { const d = ((oy + r - 4) * cols * SW + cx + k) * 3; sheet[d] = 255; sheet[d + 1] = 230; sheet[d + 2] = 0; } cx += g.adv; }
  });
  writePPM(file, cols * SW, rows * SH, sheet);
}
else if (mode === 'cover') { // node render.js cover 输出.ppm → 1920×1080
  vm.runInThisContext('resetState(); F.d.fill(0); GL.d.fill(0); shCover(1.3); resetState(); overlays(1);');
  globalThis.toRGB(out); const S = 4, big = new Uint8Array(W * S * H * S * 3);
  for (let y = 0; y < H * S; y++) for (let x = 0; x < W * S; x++) { const s = ((y / S | 0) * W + (x / S | 0)) * 3, d = (y * W * S + x) * 3; big[d] = out[s]; big[d + 1] = out[s + 1]; big[d + 2] = out[s + 2]; }
  writePPM(process.argv[3], W * S, H * S, big);
}
else { console.error('用法见文件开头'); process.exit(2); }
