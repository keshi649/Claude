import type { Vec2 } from '../core/vec2';

/**
 * 2.5D 斜视角镜头：
 *   - 地面在屏幕上纵向压缩 TILT 倍（模拟摄像机斜向下看地面）
 *   - 立体物体（英雄、树、塔）直立绘制，高度 h 向屏幕上方偏移
 *   - 玩家英雄位于屏幕略偏下（ANCHOR_Y），前方视野更多
 * 逻辑层完全不知道这些，仍然是俯视 2D。
 */
export const TILT = 0.72;
const ANCHOR_Y = 0.56;

export class Camera {
  x = 0;
  y = 0;
  zoom = 40;
  screenW = 1;
  screenH = 1;
  private shakeAmp = 0;
  private shakeTime = 0;
  offsetX = 0;
  offsetY = 0;

  constructor(private readonly mapSize: number) {}

  resize(w: number, h: number): void {
    this.screenW = w;
    this.screenH = h;
    // 横屏约显示 30 米宽的地面；矮屏幕保证纵深至少约 16 米
    this.zoom = Math.min(w / 30, h / (16 * TILT));
  }

  get anchorY(): number {
    return this.screenH * ANCHOR_Y;
  }

  snap(p: Vec2): void {
    this.x = p.x;
    this.y = p.y;
    this.clamp();
  }

  /** 每帧平滑跟随（指数插值，与帧率无关） */
  follow(p: Vec2, dtSec: number): void {
    const k = 1 - Math.exp(-dtSec * 14);
    this.x += (p.x - this.x) * k;
    this.y += (p.y - this.y) * k;
    this.clamp();
    if (this.shakeTime > 0) {
      this.shakeTime -= dtSec;
      const a = this.shakeAmp * Math.max(0, this.shakeTime / 0.22);
      this.offsetX = (Math.random() * 2 - 1) * a;
      this.offsetY = (Math.random() * 2 - 1) * a;
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
    }
  }

  /** 震屏（单位：米） */
  shake(amp: number): void {
    this.shakeAmp = this.shakeTime > 0 ? Math.max(this.shakeAmp, amp) : amp;
    this.shakeTime = 0.22;
  }

  private clamp(): void {
    const hw = this.screenW / this.zoom / 2;
    const top = this.anchorY / (this.zoom * TILT);
    const bottom = (this.screenH - this.anchorY) / (this.zoom * TILT);
    const m = 3;
    this.x = Math.max(hw - m, Math.min(this.mapSize - hw + m, this.x));
    this.y = Math.max(top - m, Math.min(this.mapSize - bottom + m, this.y));
  }

  /** 图层原点（地面层 / 物体层的平移量） */
  originX(): number {
    return this.screenW / 2 - (this.x + this.offsetX) * this.zoom;
  }

  originY(): number {
    return this.anchorY - (this.y + this.offsetY) * this.zoom * TILT;
  }

  /** 世界坐标（含离地高度 h 米）→ 屏幕像素 */
  worldToScreen(x: number, y: number, h = 0): Vec2 {
    return {
      x: this.originX() + x * this.zoom,
      y: this.originY() + y * this.zoom * TILT - h * this.zoom,
    };
  }

  /** 屏幕像素 → 地面上的世界坐标 */
  screenToWorld(sx: number, sy: number): Vec2 {
    return {
      x: (sx - this.originX()) / this.zoom,
      y: (sy - this.originY()) / (this.zoom * TILT),
    };
  }

  /** 当前屏幕能看到的地面范围（世界坐标，外扩 margin 米） */
  viewRect(margin = 3): { x0: number; y0: number; x1: number; y1: number } {
    const a = this.screenToWorld(0, 0);
    const b = this.screenToWorld(this.screenW, this.screenH);
    return { x0: a.x - margin, y0: a.y - margin, x1: b.x + margin, y1: b.y + margin + 4 };
  }
}
