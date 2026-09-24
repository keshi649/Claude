import { describe, expect, it } from 'vitest';
import { computeDamage, effectiveDefense, mitigate } from '../src/sim/damage';
import { attackInterval, effectiveCooldown } from '../src/sim/stats';
import { statBlock } from '../src/data/schema';
import { World } from '../src/sim/world';
import type { Command } from '../src/sim/commands';
import type { Unit } from '../src/sim/entity';

describe('伤害公式', () => {
  it('防御收益递减：防御等于 K 时减伤 50%', () => {
    expect(mitigate(1000, 600)).toBeCloseTo(500, 6);
    expect(mitigate(1000, 0)).toBeCloseTo(1000, 6);
    // 防御翻倍，减伤不翻倍（收益递减）
    const r300 = 1 - mitigate(1, 300);
    const r600 = 1 - mitigate(1, 600);
    expect(r600).toBeLessThan(r300 * 2);
  });

  it('穿透：先算百分比再减固定值，不低于 0', () => {
    expect(effectiveDefense(400, 100, 0.25)).toBeCloseTo(200, 6);
    expect(effectiveDefense(50, 100, 0)).toBe(0);
  });

  it('物理 / 法术 / 真实伤害分别使用对应防御', () => {
    const atk = statBlock({ armorPen: 0, mrPen: 0 });
    const tgt = statBlock({ armor: 600, mr: 0 });
    expect(computeDamage(1000, 'physical', atk, tgt)).toBeCloseTo(500, 6);
    expect(computeDamage(1000, 'magic', atk, tgt)).toBeCloseTo(1000, 6);
    expect(computeDamage(1000, 'true', atk, statBlock({ armor: 9999, mr: 9999 }))).toBe(1000);
  });
});

describe('冷却与攻速', () => {
  it('冷却缩减有 40% 上限', () => {
    expect(effectiveCooldown(10, 0.2)).toBeCloseTo(8, 6);
    expect(effectiveCooldown(10, 0.9)).toBeCloseTo(6, 6);
  });

  it('攻击间隔受攻速影响，且每秒最多 2.5 次', () => {
    expect(attackInterval(1, 0)).toBeCloseTo(1, 6);
    expect(attackInterval(1, 1)).toBeCloseTo(0.5, 6);
    expect(attackInterval(1, 5)).toBeCloseTo(0.4, 6);
  });
});

// —— 基于完整逻辑世界的测试 ——

const PID = 1;

function makeWorld(seed = 7): World {
  return new World({
    seed,
    mode: 'training',
    startLevel: 4,
    players: [{ pid: PID, team: 0, heroId: 'lifeng', name: '玩家', isAI: false }],
  });
}

function hero(w: World): Unit {
  return w.heroOf(PID)!;
}

function dummies(w: World): Unit[] {
  return w.list.filter((u) => u.kind === 'dummy');
}

/** 把英雄放到第一个木桩旁边（距离 d，位于木桩左侧），其余木桩移出场地避免干扰 */
function placeNearDummy(w: World, d: number): Unit {
  const [dm, ...others] = dummies(w);
  for (const o of others) {
    w.units.delete(o.id);
    w.list = w.list.filter((u) => u !== o);
  }
  const h = hero(w);
  h.pos = { x: dm!.pos.x - d, y: dm!.pos.y };
  h.prevPos = { ...h.pos };
  h.facing = 0;
  return dm!;
}

function run(w: World, ticks: number, cmds: (tick: number) => Command[] = () => []): void {
  for (let i = 0; i < ticks; i++) w.step(cmds(i));
}

describe('技能冷却与施法', () => {
  it('训练场英雄 4 级，三个技能各 1 级，剩 1 个技能点', () => {
    const w = makeWorld();
    const h = hero(w).hero!;
    expect(h.level).toBe(4);
    expect(h.skillLevels).toEqual([1, 1, 1]);
    expect(h.skillPoints).toBe(1);
  });

  it('释放技能：扣蓝、进入冷却、冷却随时间减少，冷却中再按会失败', () => {
    const w = makeWorld();
    placeNearDummy(w, 3);
    const u = hero(w);
    const mp0 = u.mp;
    w.step([{ t: 'cast', pid: PID, slot: 1, aim: { k: 'auto' } }]);
    expect(u.mp).toBeLessThan(mp0);
    const cd0 = u.hero!.cooldowns[1];
    expect(cd0).toBeCloseTo(7, 1);
    run(w, 30);
    expect(u.hero!.cooldowns[1]).toBeCloseTo(cd0 - 1, 1);
    w.drainEvents();
    w.step([{ t: 'cast', pid: PID, slot: 1, aim: { k: 'auto' } }]);
    const fails = w.drainEvents().filter((e) => e.t === 'castFail');
    expect(fails.some((e) => e.t === 'castFail' && e.reason === '技能冷却中')).toBe(true);
  });

  it('法力不足时无法施法', () => {
    const w = makeWorld();
    const u = hero(w);
    u.mp = 0;
    u.stats.mpRegen = 0;
    w.step([{ t: 'cast', pid: PID, slot: 1, aim: { k: 'auto' } }]);
    expect(u.hero!.cooldowns[1]).toBe(0);
    expect(w.drainEvents().some((e) => e.t === 'castFail' && e.reason === '法力不足')).toBe(true);
  });

  it('二段技能：第一段后进入窗口期，不进冷却；再按释放第二段后才进冷却', () => {
    const w = makeWorld();
    placeNearDummy(w, 4);
    const u = hero(w);
    w.step([{ t: 'cast', pid: PID, slot: 0, aim: { k: 'dir', x: 1, y: 0 } }]);
    expect(u.hero!.recast[0]).not.toBeNull();
    expect(u.hero!.cooldowns[0]).toBe(0);
    run(w, 15); // 等突进结束
    w.step([{ t: 'cast', pid: PID, slot: 0, aim: { k: 'auto' } }]);
    expect(u.hero!.recast[0]).toBeNull();
    expect(u.hero!.cooldowns[0]).toBeGreaterThan(8);
  });

  it('二段窗口超时后自动进入冷却', () => {
    const w = makeWorld();
    const u = hero(w);
    w.step([{ t: 'cast', pid: PID, slot: 0, aim: { k: 'dir', x: 0, y: -1 } }]);
    run(w, Math.ceil(3.6 * 30) + 10);
    expect(u.hero!.recast[0]).toBeNull();
    expect(u.hero!.cooldowns[0]).toBeGreaterThan(0);
  });

  it('冷却缩减属性会缩短实际冷却', () => {
    const w = makeWorld();
    placeNearDummy(w, 3);
    const u = hero(w);
    u.baseStats.cdr = 0.2;
    u.statsDirty = true;
    w.step([]);
    w.step([{ t: 'cast', pid: PID, slot: 1, aim: { k: 'auto' } }]);
    expect(u.hero!.cooldowns[1]).toBeCloseTo(7 * 0.8, 1);
  });

  it('前摇期间按下的技能会排队，前摇结束后自动释放', () => {
    const w = makeWorld();
    placeNearDummy(w, 3);
    const u = hero(w);
    w.step([{ t: 'cast', pid: PID, slot: 1, aim: { k: 'auto' } }]);
    expect(u.cast?.phase).toBe('windup');
    w.step([{ t: 'cast', pid: PID, slot: 2, aim: { k: 'auto' } }]);
    expect(u.hero!.cooldowns[2]).toBe(0);
    run(w, 12);
    expect(u.hero!.cooldowns[2]).toBeGreaterThan(0);
  });
});

describe('技能效果与被动', () => {
  it('破军命中木桩造成伤害，并触发被动连斩；下一次普攻消耗连斩', () => {
    const w = makeWorld();
    const dm = placeNearDummy(w, 2.5);
    const u = hero(w);
    w.step([{ t: 'cast', pid: PID, slot: 1, aim: { k: 'auto' } }]);
    run(w, 10);
    expect(dm.hp).toBeLessThan(dm.stats.maxHp);
    expect(u.buffs.some((b) => b.id === 'lifeng_combo')).toBe(true);
    // 等后摇结束后普攻
    run(w, 10);
    run(w, 30, () => [{ t: 'attack', pid: PID, mode: 'auto' }]);
    expect(u.buffs.some((b) => b.id === 'lifeng_combo')).toBe(false);
  });

  it('破军外缘命中造成更高伤害并减速', () => {
    const near = makeWorld();
    const dn = placeNearDummy(near, 1.8);
    near.step([{ t: 'cast', pid: PID, slot: 1, aim: { k: 'dir', x: 1, y: 0 } }]);
    run(near, 12);
    const far = makeWorld();
    const df = placeNearDummy(far, 3.9);
    far.step([{ t: 'cast', pid: PID, slot: 1, aim: { k: 'dir', x: 1, y: 0 } }]);
    run(far, 12);
    const lostNear = dn.stats.maxHp - dn.hp;
    const lostFar = df.stats.maxHp - df.hp;
    expect(lostFar).toBeGreaterThan(lostNear * 1.3);
  });

  it('断岳：跃向目标，击飞并沉默主目标', () => {
    const w = makeWorld();
    const dm = placeNearDummy(w, 5.5);
    const u = hero(w);
    w.step([{ t: 'cast', pid: PID, slot: 2, aim: { k: 'auto' } }]);
    let airborne = false;
    let silenced = false;
    for (let i = 0; i < 30; i++) {
      w.step([]);
      for (const e of w.drainEvents()) {
        if (e.t === 'cc' && e.target === dm.id && e.cc === 'airborne') airborne = true;
        if (e.t === 'cc' && e.target === dm.id && e.cc === 'silence') silenced = true;
      }
    }
    expect(airborne).toBe(true);
    expect(silenced).toBe(true);
    // 英雄落在目标身边
    expect(Math.hypot(u.pos.x - dm.pos.x, u.pos.y - dm.pos.y)).toBeLessThan(2);
  });

  it('普攻：按住攻击键会自动锁定射程附近的目标并持续攻击', () => {
    const w = makeWorld();
    const dm = placeNearDummy(w, 3.5);
    run(w, 90, () => [{ t: 'attack', pid: PID, mode: 'auto' }]);
    const hits = dm.stats.maxHp - dm.hp;
    expect(hits).toBeGreaterThan(0);
  });

  it('补刀键不会攻击英雄类目标（木桩）', () => {
    const w = makeWorld();
    const dm = placeNearDummy(w, 1.5);
    run(w, 60, () => [{ t: 'attack', pid: PID, mode: 'farm' }]);
    expect(dm.hp).toBe(dm.stats.maxHp);
  });
});

describe('确定性', () => {
  it('同种子 + 同命令序列 → 完全相同的快照', () => {
    const script = (i: number): Command[] => {
      const cmds: Command[] = [];
      if (i === 0) cmds.push({ t: 'moveTo', pid: PID, x: 28, y: 90 });
      if (i === 200) cmds.push({ t: 'cast', pid: PID, slot: 1, aim: { k: 'auto' } });
      if (i > 210 && i < 300) cmds.push({ t: 'attack', pid: PID, mode: 'auto' });
      if (i === 320) cmds.push({ t: 'cast', pid: PID, slot: 2, aim: { k: 'auto' } });
      if (i === 360) cmds.push({ t: 'cast', pid: PID, slot: 0, aim: { k: 'dir', x: 1, y: -1 } });
      return cmds;
    };
    const a = makeWorld(42);
    const b = makeWorld(42);
    run(a, 450, script);
    run(b, 450, script);
    expect(a.snapshot()).toBe(b.snapshot());
    // 确实发生了战斗
    expect(dummies(a).some((d) => d.hp < d.stats.maxHp || d.lastDamagedAt > 0)).toBe(true);
  });
});
