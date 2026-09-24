import { describe, expect, it } from 'vitest';
import { Rng } from '../src/core/rng';
import { FixedStepLoop } from '../src/core/loop';
import { EventBus } from '../src/core/events';

describe('随机数', () => {
  it('同种子产生相同序列', () => {
    const a = new Rng(123);
    const b = new Rng(123);
    for (let i = 0; i < 100; i++) expect(a.next()).toBe(b.next());
  });

  it('不同种子序列不同', () => {
    const a = new Rng(1);
    const b = new Rng(2);
    const sa = Array.from({ length: 10 }, () => a.next());
    const sb = Array.from({ length: 10 }, () => b.next());
    expect(sa).not.toEqual(sb);
  });

  it('输出范围正确，状态可保存恢复', () => {
    const r = new Rng(99);
    for (let i = 0; i < 1000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
      const n = r.int(6);
      expect(Number.isInteger(n) && n >= 0 && n < 6).toBe(true);
    }
    const saved = r.state;
    const x = r.next();
    r.state = saved;
    expect(r.next()).toBe(x);
  });
});

describe('固定步长循环', () => {
  it('按累积时间执行整数步，余数作为插值系数', () => {
    let steps = 0;
    const loop = new FixedStepLoop(30, () => steps++);
    const r1 = loop.advance(50); // 50ms = 1.5 步
    expect(r1.steps).toBe(1);
    expect(r1.alpha).toBeCloseTo(0.5, 5);
    const r2 = loop.advance(20); // 累积 36.67ms → 1 步
    expect(r2.steps).toBe(1);
    expect(steps).toBe(2);
  });

  it('时间倍率 ×4 时步数翻 4 倍', () => {
    let steps = 0;
    const loop = new FixedStepLoop(30, () => steps++);
    loop.timeScale = 4;
    loop.advance(100);
    expect(steps).toBe(12);
  });

  it('单帧卡顿时限制补帧数量，避免死亡螺旋', () => {
    let steps = 0;
    const loop = new FixedStepLoop(30, () => steps++, 5);
    const r = loop.advance(1000);
    expect(r.steps).toBeLessThanOrEqual(5);
    expect(r.alpha).toBeLessThan(1);
  });

  it('暂停时不推进', () => {
    let steps = 0;
    const loop = new FixedStepLoop(30, () => steps++);
    loop.paused = true;
    loop.advance(500);
    expect(steps).toBe(0);
  });
});

describe('事件总线', () => {
  it('订阅、发送、取消订阅', () => {
    const bus = new EventBus<{ hit: number }>();
    const got: number[] = [];
    const off = bus.on('hit', (v) => got.push(v));
    bus.emit('hit', 1);
    off();
    bus.emit('hit', 2);
    expect(got).toEqual([1]);
  });
});
