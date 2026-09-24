import type { Vec2 } from '../core/vec2';

/**
 * 镜头：平滑跟随目标、限制在地图内、震屏。
 * zoom = 每米多少像素，随屏幕尺寸自适应（横屏约显示 28×15 米）。
 */
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
    this.zoom = Math.min(w / 28, h / 15);
  }

  /** 立即对准 */
  snap(p: Vec2): void {
    this.x = p.x;
    this.y = p.y;
    this.clamp();
  }

  /** 每帧平滑跟随（指数插值，与帧率无关） */
  follow(p: Vec2, dtSec: number): void {
    const k = 1 - Math.exp(-dtSec * 12);
    this.x += (p.x - this.x) * k;
    this.y += (p.y - this.y) * k;
    this.clamp();
    if (this.shakeTime > 0) {
      this.shakeTime -= dtSec;
      const a = this.shakeAmp * Math.max(0, this.shakeTime / 0.25);
      this.offsetX = (Math.random() * 2 - 1) * a;
      this.offsetY = (Math.random() * 2 - 1) * a;
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
    }
  }

  /** 震屏：amp 为米 */
  shake(amp: number): void {
    this.shakeAmp = Math.max(this.shakeAmp * (this.shakeTime > 0 ? 1 : 0), amp);
    this.shakeTime = 0.25;
  }

  private clamp(): void {
    const hw = this.screenW / this.zoom / 2;
    const hh = this.screenH / this.zoom / 2;
    const m = 2;
    this.x = hw * 2 + m * 2 >= this.mapSize ? this.mapSize / 2 : Math.max(hw - m, Math.min(this.mapSize - hw + m, this.x));
    this.y = hh * 2 + m * 2 >= this.mapSize ? this.mapSize / 2 : Math.max(hh - m, Math.min(this.mapSize - hh + m, this.y));
  }

  worldToScreen(x: number, y: number): Vec2 {
    return {
      x: (x - this.x - this.offsetX) * this.zoom + this.screenW / 2,
      y: (y - this.y - this.offsetY) * this.zoom + this.screenH / 2,
    };
  }

  screenToWorld(sx: number, sy: number): Vec2 {
    return {
      x: (sx - this.screenW / 2) / this.zoom + this.x + this.offsetX,
      y: (sy - this.screenH / 2) / this.zoom + this.y + this.offsetY,
    };
  }
}
