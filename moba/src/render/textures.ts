import { Texture } from 'pixi.js';
import { Rng } from '../core/rng';

/**
 * 程序生成的贴图（Canvas 2D 绘制，不使用任何外部图片）。
 * 地面平铺贴图（草地、泥土路、石板、河水、林地）与立体道具（树、灌木、岩石、草丛）。
 */

function makeCanvas(w: number, h: number, draw: (ctx: CanvasRenderingContext2D, rng: Rng) => void, seed: number): Texture {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  draw(ctx, new Rng(seed));
  return Texture.from(c);
}

/** 在平铺贴图上画一个元素，并在边界处环绕绘制，保证无缝 */
function wrap(size: number, x: number, y: number, r: number, fn: (x: number, y: number) => void): void {
  for (const dx of [-size, 0, size]) {
    for (const dy of [-size, 0, size]) {
      const px = x + dx;
      const py = y + dy;
      if (px + r < 0 || py + r < 0 || px - r > size || py - r > size) continue;
      fn(px, py);
    }
  }
}

const rgba = (r: number, g: number, b: number, a = 1): string => `rgba(${r | 0},${g | 0},${b | 0},${a})`;

export interface GameTextures {
  grass: Texture;
  dirt: Texture;
  stone: Texture;
  water: Texture;
  forestFloor: Texture;
  trees: Texture[];
  pines: Texture[];
  rocks: Texture[];
  grassClumps: Texture[];
  glow: Texture;
  dot: Texture;
}

export function createTextures(): GameTextures {
  const T = 256;

  const grass = makeCanvas(T, T, (ctx, rng) => {
    ctx.fillStyle = '#3f6a30';
    ctx.fillRect(0, 0, T, T);
    // 大块明暗斑
    for (let i = 0; i < 26; i++) {
      const x = rng.range(0, T);
      const y = rng.range(0, T);
      const r = rng.range(20, 60);
      const light = rng.chance(0.5);
      wrap(T, x, y, r, (px, py) => {
        const g = ctx.createRadialGradient(px, py, 0, px, py, r);
        g.addColorStop(0, light ? 'rgba(110,160,70,0.35)' : 'rgba(30,60,25,0.35)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(px - r, py - r, r * 2, r * 2);
      });
    }
    // 草叶
    for (let i = 0; i < 1600; i++) {
      const x = rng.range(0, T);
      const y = rng.range(0, T);
      const l = rng.range(3, 8);
      const a = rng.range(-0.5, 0.5);
      const c = rng.chance(0.5) ? rgba(90 + rng.range(0, 50), 140 + rng.range(0, 50), 60, 0.7) : rgba(40, 80 + rng.range(0, 30), 35, 0.7);
      wrap(T, x, y, l, (px, py) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.sin(a) * l, py - Math.cos(a) * l);
        ctx.stroke();
      });
    }
    // 小花
    for (let i = 0; i < 14; i++) {
      const x = rng.range(0, T);
      const y = rng.range(0, T);
      const c = rng.pick(['#f4e27a', '#f0f0f0', '#e79ad0']);
      wrap(T, x, y, 3, (px, py) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(px, py, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, 11);

  const dirt = makeCanvas(T, T, (ctx, rng) => {
    ctx.fillStyle = '#a58d63';
    ctx.fillRect(0, 0, T, T);
    for (let i = 0; i < 40; i++) {
      const x = rng.range(0, T);
      const y = rng.range(0, T);
      const r = rng.range(15, 45);
      wrap(T, x, y, r, (px, py) => {
        const g = ctx.createRadialGradient(px, py, 0, px, py, r);
        g.addColorStop(0, rng.chance(0.5) ? 'rgba(190,165,120,0.35)' : 'rgba(120,95,60,0.3)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(px - r, py - r, r * 2, r * 2);
      });
    }
    // 石板（道路铺装）
    for (let i = 0; i < 38; i++) {
      const x = rng.range(0, T);
      const y = rng.range(0, T);
      const w = rng.range(14, 30);
      const h = rng.range(10, 22);
      wrap(T, x, y, 30, (px, py) => {
        ctx.fillStyle = rgba(170 + rng.range(-15, 15), 155 + rng.range(-15, 15), 125, 0.55);
        ctx.strokeStyle = 'rgba(90,70,45,0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(px, py, w, h, 4);
        ctx.fill();
        ctx.stroke();
      });
    }
    for (let i = 0; i < 500; i++) {
      const x = rng.range(0, T);
      const y = rng.range(0, T);
      wrap(T, x, y, 2, (px, py) => {
        ctx.fillStyle = rng.chance(0.5) ? 'rgba(90,70,45,0.5)' : 'rgba(210,190,150,0.5)';
        ctx.fillRect(px, py, rng.range(1, 3), rng.range(1, 3));
      });
    }
  }, 12);

  const stone = makeCanvas(T, T, (ctx, rng) => {
    ctx.fillStyle = '#6b7079';
    ctx.fillRect(0, 0, T, T);
    const s = 32;
    for (let row = 0; row < T / s; row++) {
      for (let col = 0; col < T / s + 1; col++) {
        const x = col * s + (row % 2 ? s / 2 : 0);
        const y = row * s;
        const v = rng.range(-18, 18);
        wrap(T, x, y, s, (px, py) => {
          ctx.fillStyle = rgba(118 + v, 124 + v, 134 + v);
          ctx.fillRect(px + 1.5, py + 1.5, s - 3, s - 3);
          ctx.fillStyle = 'rgba(255,255,255,0.08)';
          ctx.fillRect(px + 1.5, py + 1.5, s - 3, 3);
        });
      }
    }
  }, 13);

  const water = makeCanvas(T, T, (ctx, rng) => {
    const g = ctx.createLinearGradient(0, 0, T, T);
    g.addColorStop(0, '#2f7fae');
    g.addColorStop(0.5, '#2a6f9c');
    g.addColorStop(1, '#2f7fae');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, T, T);
    for (let i = 0; i < 70; i++) {
      const x = rng.range(0, T);
      const y = rng.range(0, T);
      const l = rng.range(12, 34);
      wrap(T, x, y, l, (px, py) => {
        ctx.strokeStyle = `rgba(170,220,245,${rng.range(0.15, 0.4)})`;
        ctx.lineWidth = rng.range(1, 2.2);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.quadraticCurveTo(px + l / 2, py - 4, px + l, py);
        ctx.stroke();
      });
    }
  }, 14);

  const forestFloor = makeCanvas(T, T, (ctx, rng) => {
    ctx.fillStyle = '#23361f';
    ctx.fillRect(0, 0, T, T);
    for (let i = 0; i < 700; i++) {
      const x = rng.range(0, T);
      const y = rng.range(0, T);
      wrap(T, x, y, 4, (px, py) => {
        ctx.fillStyle = rng.chance(0.6) ? 'rgba(20,40,18,0.8)' : 'rgba(70,85,40,0.5)';
        ctx.beginPath();
        ctx.ellipse(px, py, rng.range(1.5, 4), rng.range(1, 2.5), rng.range(0, 3), 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, 15);

  // —— 树（阔叶）：一团团明暗不同的树冠 ——
  const trees = [0, 1, 2, 3].map((v) =>
    makeCanvas(256, 300, (ctx, rng) => {
      const cx = 128;
      // 树干
      ctx.fillStyle = '#4a3222';
      ctx.beginPath();
      ctx.moveTo(cx - 12, 290);
      ctx.lineTo(cx + 12, 290);
      ctx.lineTo(cx + 8, 190);
      ctx.lineTo(cx - 8, 190);
      ctx.fill();
      const hue = [[52, 110, 42], [44, 98, 38], [66, 118, 44], [58, 104, 50]][v]!;
      const blobs: [number, number, number][] = [];
      for (let i = 0; i < 9; i++) blobs.push([cx + rng.range(-62, 62), 130 + rng.range(-70, 45), rng.range(42, 66)]);
      blobs.push([cx, 125, 80]);
      // 阴影层
      for (const [x, y, r] of blobs) {
        ctx.fillStyle = rgba(hue[0] * 0.45, hue[1] * 0.45, hue[2] * 0.45);
        ctx.beginPath();
        ctx.arc(x + 4, y + 8, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // 主体（左上受光的径向渐变）
      for (const [x, y, r] of blobs) {
        const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, rgba(hue[0] * 1.6, hue[1] * 1.45, hue[2] * 1.3));
        g.addColorStop(0.6, rgba(hue[0], hue[1], hue[2]));
        g.addColorStop(1, rgba(hue[0] * 0.7, hue[1] * 0.7, hue[2] * 0.7));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // 叶片高光
      for (let i = 0; i < 60; i++) {
        const x = cx + rng.range(-80, 80);
        const y = 110 + rng.range(-80, 60);
        ctx.fillStyle = rgba(hue[0] * 1.9, hue[1] * 1.6, hue[2] * 1.3, 0.35);
        ctx.beginPath();
        ctx.ellipse(x, y, 5, 3, rng.range(0, 3), 0, Math.PI * 2);
        ctx.fill();
      }
    }, 100 + v),
  );

  // —— 松树 ——
  const pines = [0, 1].map((v) =>
    makeCanvas(200, 320, (ctx, rng) => {
      const cx = 100;
      ctx.fillStyle = '#3e2a1c';
      ctx.fillRect(cx - 8, 250, 16, 60);
      const layers = 4;
      for (let i = 0; i < layers; i++) {
        const top = 20 + i * 55;
        const w = 50 + i * 22 + rng.range(-5, 5);
        const g = ctx.createLinearGradient(cx - w, 0, cx + w, 0);
        g.addColorStop(0, v ? '#1f4a2a' : '#224d26');
        g.addColorStop(0.4, v ? '#3a7a45' : '#3d7a38');
        g.addColorStop(1, v ? '#163a20' : '#17391a');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(cx, top);
        ctx.lineTo(cx + w, top + 95);
        ctx.quadraticCurveTo(cx, top + 110, cx - w, top + 95);
        ctx.closePath();
        ctx.fill();
      }
    }, 200 + v),
  );

  // —— 岩石 ——
  const rocks = [0, 1, 2].map((v) =>
    makeCanvas(200, 160, (ctx, rng) => {
      const pts: [number, number][] = [];
      const n = 8;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const r = rng.range(60, 90);
        pts.push([100 + Math.cos(a) * r, 95 + Math.sin(a) * r * 0.6 - (Math.sin(a) < 0 ? 20 : 0)]);
      }
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(104, 140, 88, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      const g = ctx.createLinearGradient(40, 20, 160, 150);
      const base = [[128, 124, 112], [112, 116, 110], [136, 128, 116]][v]!;
      g.addColorStop(0, rgba(base[0] * 1.35, base[1] * 1.35, base[2] * 1.35));
      g.addColorStop(1, rgba(base[0] * 0.55, base[1] * 0.55, base[2] * 0.55));
      ctx.fillStyle = g;
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(30,28,24,0.6)';
      ctx.lineWidth = 3;
      ctx.stroke();
      // 苔藓
      for (let i = 0; i < 18; i++) {
        ctx.fillStyle = 'rgba(80,120,50,0.55)';
        ctx.beginPath();
        ctx.arc(100 + rng.range(-50, 50), 50 + rng.range(-10, 20), rng.range(4, 10), 0, Math.PI * 2);
        ctx.fill();
      }
    }, 300 + v),
  );

  // —— 草丛（高草，英雄可以藏身） ——
  const grassClumps = [0, 1, 2].map((v) =>
    makeCanvas(160, 170, (ctx, rng) => {
      for (let i = 0; i < 70; i++) {
        const x = 80 + rng.range(-62, 62);
        const h = rng.range(80, 150);
        const bend = rng.range(-25, 25);
        const g = ctx.createLinearGradient(0, 165 - h, 0, 165);
        g.addColorStop(0, v === 2 ? '#8fcf5a' : '#7cc24e');
        g.addColorStop(1, '#1f5a24');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x - 5, 165);
        ctx.quadraticCurveTo(x + bend * 0.5, 165 - h * 0.6, x + bend, 165 - h);
        ctx.quadraticCurveTo(x + bend * 0.5 + 3, 165 - h * 0.5, x + 5, 165);
        ctx.fill();
      }
    }, 400 + v),
  );

  const glow = makeCanvas(128, 128, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.45)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  }, 1);

  const dot = makeCanvas(32, 32, (ctx) => {
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.6, 'rgba(255,255,255,0.8)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 32);
  }, 2);

  return { grass, dirt, stone, water, forestFloor, trees, pines, rocks, grassClumps, glow, dot };
}
