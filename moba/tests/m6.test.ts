import { describe, expect, it } from 'vitest';
import { killTitle } from '../src/ui/announcer';
import { AIDirector, makeLineup } from '../src/sim/ai/director';
import { World } from '../src/sim/world';

describe('击杀播报标题', () => {
  const base = { multi: 1, firstBlood: false, shutdown: false, streak: 1 };
  it('多杀优先于第一滴血、终结与连杀', () => {
    expect(killTitle({ ...base, multi: 2, firstBlood: true })).toEqual({ text: '双杀', big: true });
    expect(killTitle({ ...base, multi: 5, shutdown: true, streak: 6 })).toEqual({ text: '五杀', big: true });
    expect(killTitle({ ...base, multi: 7 }).text).toBe('五杀');
  });
  it('第一滴血、终结、连杀称号、普通击败', () => {
    expect(killTitle({ ...base, firstBlood: true }).text).toBe('第一滴血');
    expect(killTitle({ ...base, shutdown: true, streak: 4 }).text).toBe('终结');
    expect(killTitle({ ...base, streak: 3 }).text).toBe('势不可挡');
    expect(killTitle({ ...base, streak: 9 }).text).toBe('独步天下');
    expect(killTitle(base)).toEqual({ text: '击败', big: false });
  });
});

describe('性能', () => {
  it('压力测试：200+ 单位时逻辑帧（含 10 个 AI）平均耗时远低于 33ms 的帧预算', { timeout: 60_000 }, () => {
    const lineup = makeLineup({ seed: 3, allyDifficulty: 'normal', enemyDifficulty: 'normal' });
    const w = new World({ seed: 3, mode: 'match', players: lineup.players });
    const ai = new AIDirector(w, lineup.difficulties, lineup.positions);
    for (let i = 0; i < 30 * 90; i++) {
      w.step(ai.think(w));
      w.drainEvents();
    }
    w.spawnStress(150);
    expect(w.list.filter((u) => u.alive).length).toBeGreaterThanOrEqual(150);
    const n = 30 * 10;
    const t0 = performance.now();
    for (let i = 0; i < n; i++) {
      w.step(ai.think(w));
      w.drainEvents();
    }
    const avg = (performance.now() - t0) / n;
    // 本机约 1ms；给慢机器留足余量
    expect(avg).toBeLessThan(8);
  });
});
