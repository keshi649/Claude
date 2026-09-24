import type { Vec2 } from '../../core/vec2';
import type { CampKind } from '../../data/map';
import { BOSSES, CAMPS, RIVER_SPRITE_CAMP } from '../../data/monsters';
import { getUnitDef } from '../../data/units';
import type { EntityId, Unit } from '../entity';
import { makeCtx, runEffects } from '../skills/effects';
import { canAct, isTargetable } from '../status';
import type { World } from '../world';

/**
 * 野区：
 *   - 营地定时生成 / 重生；Boss 在固定时间首次出现
 *   - 野怪被攻击后整营反击攻击者；离营地超过脱战距离或 4 秒没挨打就回营、无敌并回满血
 *   - Boss 每隔几秒释放范围技能（先在地面预警）
 */

export interface CampState {
  kind: CampKind | 'turtle' | 'dragon' | 'riverSprite';
  pos: Vec2;
  members: { def: string; dx: number; dy: number }[];
  ids: EntityId[];
  respawn: number;
  /** 下次生成时刻；0 表示营地里还有活着的野怪 */
  spawnAt: number;
}

export function createCamps(w: World): CampState[] {
  const out: CampState[] = [];
  for (const side of [0, 1] as const) {
    for (const c of w.map.camps[side]) {
      const def = CAMPS[c.kind];
      out.push({ kind: c.kind, pos: c.pos, members: def.members, ids: [], respawn: def.respawn, spawnAt: def.firstSpawn });
    }
  }
  for (const k of ['turtle', 'dragon'] as const) {
    const b = BOSSES[k];
    out.push({ kind: k, pos: w.map.bossPits[k], members: [{ def: b.def, dx: 0, dy: 0 }], ids: [], respawn: b.respawn, spawnAt: b.firstSpawn });
  }
  for (const pos of w.map.riverSprites) {
    const r = RIVER_SPRITE_CAMP;
    out.push({ kind: 'riverSprite', pos, members: [{ def: r.def, dx: 0, dy: 0 }], ids: [], respawn: r.respawn, spawnAt: r.firstSpawn });
  }
  return out;
}

export function updateCamps(w: World): void {
  for (const c of w.camps) {
    if (c.ids.length > 0) {
      c.ids = c.ids.filter((id) => w.get(id)?.alive);
      if (c.ids.length === 0) c.spawnAt = w.time + c.respawn;
      continue;
    }
    if (w.time >= c.spawnAt) {
      // Boss 到时间后以进化形态重生
      if (c.kind === 'turtle' || c.kind === 'dragon') {
        const b = BOSSES[c.kind];
        c.members = [{ def: w.time >= b.evolveAt ? b.evolved : b.def, dx: 0, dy: 0 }];
      }
      for (const m of c.members) {
        const u = w.spawnMonster(getUnitDef(m.def), { x: c.pos.x + m.dx, y: c.pos.y + m.dy });
        c.ids.push(u.id);
      }
      c.spawnAt = 0;
      w.emit({ t: 'campSpawn', kind: c.kind, def: c.members[0]!.def, x: c.pos.x, y: c.pos.y });
    }
  }
}

function campOf(w: World, u: Unit): CampState | undefined {
  return w.camps.find((c) => c.ids.includes(u.id));
}

function startReset(u: Unit): void {
  u.resetting = true;
  u.lockTarget = 0;
  u.attack.orderTime = 0;
  u.attack.windup = 0;
  u.innate.invulnerable = true;
  u.navGoal = { ...u.home };
  u.navPath = [];
  u.navRepathAt = 0;
}

export function updateMonsters(w: World): void {
  for (const u of w.list) {
    if (u.kind !== 'monster' || !u.alive) continue;
    const def = getUnitDef(u.defId);
    const leash = def.leash ?? 8;

    if (u.resetting) {
      u.hp = Math.min(u.stats.maxHp, u.hp + u.stats.maxHp * 0.25 * w.dt);
      if (Math.hypot(u.pos.x - u.home.x, u.pos.y - u.home.y) < 0.6 || !u.navGoal) {
        u.resetting = false;
        u.innate.invulnerable = false;
        u.hp = u.stats.maxHp;
        u.navGoal = null;
        u.skillTimer = 0;
      }
      continue;
    }

    // 被攻击：整营锁定攻击者
    const attacker = w.get(u.lastAttacker);
    let t = w.get(u.lockTarget);
    if (t && (!t.alive || !isTargetable(t))) t = undefined;
    if (!t && attacker && attacker.alive && isTargetable(attacker) && w.time - u.lastDamagedAt < 0.5) {
      t = attacker;
      const camp = campOf(w, u);
      if (camp) for (const id of camp.ids) {
        const m = w.get(id);
        if (m && m.alive && !m.lockTarget && !m.resetting) {
          m.lockTarget = attacker.id;
          // 被同营伙伴拉入战斗：从此刻开始计算脱战时间
          m.lastDamagedAt = Math.max(m.lastDamagedAt, w.time);
        }
      }
    }

    const fromHome = Math.hypot(u.pos.x - u.home.x, u.pos.y - u.home.y);
    const targetFar = t && Math.hypot(t.pos.x - u.home.x, t.pos.y - u.home.y) > leash + 3;
    const idle = w.time - u.lastDamagedAt > 4 && u.hp < u.stats.maxHp;
    if (fromHome > leash || targetFar || (!t && idle) || (t && w.time - u.lastDamagedAt > 6)) {
      startReset(u);
      continue;
    }
    if (!t) {
      u.lockTarget = 0;
      continue;
    }
    u.lockTarget = t.id;
    u.attack.orderTarget = t.id;
    u.attack.orderTime = 0.4;
    u.attack.orderMode = 'auto';

    // Boss 周期技能
    if (def.skill && canAct(u)) {
      if (u.skillWindup > 0) {
        u.skillWindup -= w.dt;
        if (u.skillWindup <= 0) {
          const dir = { x: Math.cos(u.facing), y: Math.sin(u.facing) };
          runEffects(w, def.skill.effects, makeCtx(u, { dir, point: { ...t.pos }, targetId: t.id, rank: 1 }));
        }
      } else {
        u.skillTimer += w.dt;
        if (u.skillTimer >= def.skill.every) {
          u.skillTimer = 0;
          u.skillWindup = def.skill.windup;
          u.attack.windup = 0;
          u.facing = Math.atan2(t.pos.y - u.pos.y, t.pos.x - u.pos.x);
          const area = def.skill.effects.find((e) => e.t === 'area');
          if (area && area.t === 'area') {
            w.emit({ t: 'area', team: 2, owner: u.id, x: u.pos.x, y: u.pos.y, dirX: Math.cos(u.facing), dirY: Math.sin(u.facing), shape: area.shape, vfx: area.vfx ?? null, warn: def.skill.windup });
          }
        }
      }
    }
  }
}
