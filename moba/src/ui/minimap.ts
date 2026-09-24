import { getHero } from '../data/heroes';
import { LANE_HALF_WIDTH, RIVER_HALF_WIDTH, type BuiltMap } from '../data/map';
import type { Vec2 } from '../core/vec2';
import type { World } from '../sim/world';
import { visibleTo } from '../sim/vision';

const css = (c: number): string => `#${c.toString(16).padStart(6, '0')}`;
const TEAM = ['#3fb6ff', '#ff5a3c'];

/**
 * 小地图（左上角，Canvas 2D）：地形只预渲染一次；
 * 动态层每秒刷新约 10 次：建筑、英雄头像、小兵、镜头视野框。
 */
export class Minimap {
  readonly el: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private terrain: HTMLCanvasElement;
  private sizePx = 0;

  constructor(parent: HTMLElement, private readonly map: BuiltMap) {
    this.el = document.createElement('canvas');
    this.el.className = 'minimap';
    parent.appendChild(this.el);
    this.ctx = this.el.getContext('2d')!;
    this.terrain = document.createElement('canvas');
  }

  private ensureSize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const px = Math.round(this.el.clientWidth * dpr);
    if (px === this.sizePx || px <= 0) return;
    this.sizePx = px;
    this.el.width = this.el.height = px;
    this.terrain.width = this.terrain.height = px;
    this.paintTerrain();
  }

  private paintTerrain(): void {
    const m = this.map;
    const S = this.sizePx / m.size;
    const c = this.terrain.getContext('2d')!;
    c.fillStyle = '#2f4a26';
    c.fillRect(0, 0, this.sizePx, this.sizePx);
    const line = (pts: readonly Vec2[], w: number, color: string): void => {
      c.strokeStyle = color;
      c.lineWidth = w * S;
      c.lineCap = 'round';
      c.lineJoin = 'round';
      c.beginPath();
      pts.forEach((p, i) => (i ? c.lineTo(p.x * S, p.y * S) : c.moveTo(p.x * S, p.y * S)));
      if (pts.length === 1) c.lineTo(pts[0]!.x * S + 0.01, pts[0]!.y * S);
      c.stroke();
    };
    line([{ x: -5, y: -5 }, { x: m.size + 5, y: m.size + 5 }], RIVER_HALF_WIDTH * 2, '#2f78a8');
    for (const k of ['top', 'mid', 'bot'] as const) line(m.lanes[0][k], LANE_HALF_WIDTH * 2, '#9c8a62');
    for (const w of m.walls) line(w.pts, w.w + 0.8, '#18301a');
    for (const b of m.bushes) line(b.pts, b.w, '#3f8a3a');
    for (const t of [0, 1] as const) {
      const f = m.fountain[t];
      c.fillStyle = TEAM[t]!;
      c.globalAlpha = 0.35;
      c.beginPath();
      c.arc(f.x * S, f.y * S, 9 * S, 0, Math.PI * 2);
      c.fill();
      c.globalAlpha = 1;
    }
    c.strokeStyle = 'rgba(255,255,255,0.35)';
    c.lineWidth = 1;
    c.strokeRect(0.5, 0.5, this.sizePx - 1, this.sizePx - 1);
  }

  private pings: { x: number; y: number; color: string; t: number }[] = [];
  ping(x: number, y: number, color: string): void {
    this.pings.push({ x, y, color, t: performance.now() });
  }

  /** 把小地图上的屏幕坐标换成世界坐标（点击小地图用） */
  toWorld(clientX: number, clientY: number): Vec2 {
    const r = this.el.getBoundingClientRect();
    return { x: ((clientX - r.left) / r.width) * this.map.size, y: ((clientY - r.top) / r.height) * this.map.size };
  }

  draw(w: World, selfId: number, view: { x0: number; y0: number; x1: number; y1: number }, fog: HTMLCanvasElement | null): void {
    this.ensureSize();
    const c = this.ctx;
    const S = this.sizePx / this.map.size;
    const dpr = this.sizePx / Math.max(1, this.el.clientWidth);
    c.drawImage(this.terrain, 0, 0);
    if (fog) c.drawImage(fog, 0, 0, this.sizePx, this.sizePx);
    const team = w.get(selfId)?.team ?? 0;
    const seen = (u: (typeof w.list)[number]): boolean => visibleTo(u, team);

    // 建筑
    for (const u of w.list) {
      if (u.kind !== 'tower' && u.kind !== 'crystal') continue;
      const x = u.pos.x * S;
      const y = u.pos.y * S;
      const r = (u.kind === 'crystal' ? 5 : 3.6) * dpr;
      c.fillStyle = u.alive ? TEAM[u.team]! : '#555';
      c.strokeStyle = '#0b0f14';
      c.lineWidth = 1.2 * dpr;
      c.beginPath();
      if (u.kind === 'crystal') {
        c.moveTo(x, y - r);
        c.lineTo(x + r, y);
        c.lineTo(x, y + r);
        c.lineTo(x - r, y);
        c.closePath();
      } else c.rect(x - r, y - r, r * 2, r * 2);
      c.fill();
      c.stroke();
      // 己方建筑正在被攻击：红色脉冲圈
      if (u.alive && u.team === team && w.time - u.lastDamagedAt < 1.5 && w.get(u.lastAttacker)?.team !== team) {
        const k = (performance.now() % 700) / 700;
        c.strokeStyle = `rgba(255,60,40,${1 - k})`;
        c.lineWidth = 2 * dpr;
        c.beginPath();
        c.arc(x, y, r + (4 + k * 8) * dpr, 0, Math.PI * 2);
        c.stroke();
      }
    }
    // 小兵 / 木桩
    for (const u of w.list) {
      if (!u.alive || (u.kind !== 'minion' && u.kind !== 'dummy' && u.kind !== 'monster' && u.kind !== 'summon') || !seen(u)) continue;
      c.fillStyle = u.kind === 'dummy' ? '#c8a878' : u.kind === 'monster' ? '#e8c64a' : TEAM[u.team]!;
      c.beginPath();
      c.arc(u.pos.x * S, u.pos.y * S, 1.8 * dpr, 0, Math.PI * 2);
      c.fill();
    }
    // 英雄头像
    for (const u of w.list) {
      if (u.kind !== 'hero' || !u.alive || !seen(u)) continue;
      const def = getHero(u.defId);
      const x = u.pos.x * S;
      const y = u.pos.y * S;
      const r = 7 * dpr;
      c.fillStyle = css(def.palette.primary);
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
      c.lineWidth = 2 * dpr;
      c.strokeStyle = u.id === selfId ? '#6dff7a' : TEAM[u.team]!;
      c.stroke();
      c.fillStyle = '#fff';
      c.font = `bold ${8 * dpr}px sans-serif`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(def.name[0]!, x, y + 0.5 * dpr);
    }
    // 野怪营地与 Boss：视野内活着的营地画图标；己方野区与中立目标在重生前 90 秒显示倒计时
    for (const camp of w.camps) {
      const boss = camp.kind === 'turtle' || camp.kind === 'dragon';
      const sprite = camp.kind === 'riverSprite';
      const known = boss || sprite || (team === 0 ? camp.pos.y > camp.pos.x : camp.pos.y < camp.pos.x);
      const x = camp.pos.x * S;
      const y = camp.pos.y * S;
      if (camp.spawnAt > 0) {
        const left = camp.spawnAt - w.time;
        if (!known || left > 90) continue;
        const t = Math.ceil(left);
        c.font = `bold ${(boss ? 9 : 8) * dpr}px sans-serif`;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.lineWidth = 2.5 * dpr;
        c.strokeStyle = '#0b0f14';
        const txt = t >= 60 ? `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}` : String(t);
        c.strokeText(txt, x, y);
        c.fillStyle = boss ? '#d8b8ff' : sprite ? '#9fe0ff' : '#ffe27a';
        c.fillText(txt, x, y);
        continue;
      }
      // 只显示本队视野里能看到的营地
      if (!camp.ids.some((id) => { const m = w.get(id); return !!m && m.alive && seen(m); })) continue;
      c.fillStyle = boss ? '#b08ae0' : sprite ? '#60c8ff' : '#e8c64a';
      c.strokeStyle = '#0b0f14';
      c.lineWidth = dpr;
      c.beginPath();
      c.arc(x, y, (boss ? 5 : 3) * dpr, 0, Math.PI * 2);
      c.fill();
      c.stroke();
    }
    // 信号标记：4 秒内闪烁的圆圈
    const now = performance.now();
    this.pings = this.pings.filter((p) => now - p.t < 4000);
    for (const p of this.pings) {
      const k = ((now - p.t) % 800) / 800;
      c.strokeStyle = p.color;
      c.globalAlpha = 1 - k;
      c.lineWidth = 2 * dpr;
      c.beginPath();
      c.arc(p.x * S, p.y * S, (3 + k * 10) * dpr, 0, Math.PI * 2);
      c.stroke();
      c.globalAlpha = 1;
      c.fillStyle = p.color;
      c.beginPath();
      c.arc(p.x * S, p.y * S, 3 * dpr, 0, Math.PI * 2);
      c.fill();
    }
    // 镜头视野框
    c.strokeStyle = 'rgba(255,255,255,0.8)';
    c.lineWidth = 1.2 * dpr;
    c.strokeRect(view.x0 * S, view.y0 * S, (view.x1 - view.x0) * S, (view.y1 - view.y0) * S);
  }
}
