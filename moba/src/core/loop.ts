/**
 * 固定步长循环（累积器）。与浏览器无关，可在 Node / 测试中直接驱动。
 * advance(真实经过毫秒) → 执行若干次 step，返回插值系数 alpha 供渲染层使用。
 */
export interface AdvanceResult {
  /** 本帧执行的逻辑步数 */
  steps: number;
  /** 渲染插值系数 [0,1)：当前累积时间 / 步长 */
  alpha: number;
}

export class FixedStepLoop {
  readonly stepMs: number;
  /** 时间倍率（调试用的 ×4 等） */
  timeScale = 1;
  /** 暂停时 advance 不推进逻辑 */
  paused = false;
  private acc = 0;

  constructor(
    readonly tickRate: number,
    private readonly step: () => void,
    /** 单帧最多补几步（按倍率放大），防止卡顿后“死亡螺旋” */
    private readonly maxStepsPerFrame = 5,
  ) {
    this.stepMs = 1000 / tickRate;
  }

  advance(elapsedMs: number): AdvanceResult {
    if (this.paused) return { steps: 0, alpha: this.acc / this.stepMs };
    // 单帧真实时间上限 250ms（切后台回来等情况）
    const clamped = Math.min(Math.max(elapsedMs, 0), 250);
    this.acc += clamped * this.timeScale;
    const cap = Math.ceil(this.maxStepsPerFrame * Math.max(1, this.timeScale));
    let steps = 0;
    while (this.acc >= this.stepMs && steps < cap) {
      this.step();
      this.acc -= this.stepMs;
      steps++;
    }
    // 补不完的时间直接丢弃，避免越积越多
    if (steps >= cap && this.acc >= this.stepMs) this.acc = this.acc % this.stepMs;
    return { steps, alpha: this.acc / this.stepMs };
  }

  reset(): void {
    this.acc = 0;
  }
}
