import { RECALL, RESTORE, getSummoner } from '../../data/summoners';
import type { Aim } from '../commands';
import type { Unit } from '../entity';
import { resolveAim } from '../skills/cast';
import { makeCtx, runEffects } from '../skills/effects';
import { addBuff, canAct, canCast } from '../status';
import type { World } from '../world';

/**
 * 回城、恢复、召唤师技能。
 *   - 回城：原地引导 6 秒，移动 / 施法 / 普攻 / 受伤 / 受控都会打断，完成后传送回泉水
 *   - 恢复：5 秒内持续回复 30% 生命与法力，受到伤害中断，冷却 40 秒
 *   - 召唤师技能：数据驱动（data/summoners.ts），效果与技能共用效果树
 */

export function commandRecall(w: World, u: Unit): void {
  const h = u.hero;
  if (!h || !u.alive || h.recall > 0 || !canAct(u)) return;
  u.moveDir = null;
  u.navGoal = null;
  u.navPath = [];
  u.attack.orderTime = 0;
  u.attack.windup = 0;
  h.recall = RECALL.channel;
  w.emit({ t: 'recall', unit: u.id, state: 'start', duration: RECALL.channel });
}

export function cancelRecall(w: World, u: Unit): void {
  if (u.hero && u.hero.recall > 0) {
    u.hero.recall = 0;
    w.emit({ t: 'recall', unit: u.id, state: 'cancel', duration: 0 });
  }
}

export function commandRestore(w: World, u: Unit): void {
  const h = u.hero;
  if (!h || !u.alive) return;
  if (h.restoreCd > 0) {
    w.emit({ t: 'castFail', unit: u.id, reason: '恢复冷却中' });
    return;
  }
  h.restoreCd = w.debug.noCooldown ? 0 : RESTORE.cooldown;
  addBuff(w, u, 'restore', u.id, RESTORE.duration, 1, h.level);
}

export function commandSummoner(w: World, u: Unit, aim: Aim): void {
  const h = u.hero;
  if (!h || !u.alive) return;
  const def = getSummoner(h.summoner.id);
  if (h.summoner.cd > 0) {
    w.emit({ t: 'castFail', unit: u.id, reason: `${def.name}冷却中` });
    return;
  }
  if (!canCast(u)) {
    w.emit({ t: 'castFail', unit: u.id, reason: '无法施法' });
    return;
  }
  const r = resolveAim(w, u, def.stage, aim);
  if (!r) {
    w.emit({ t: 'castFail', unit: u.id, reason: '没有目标' });
    return;
  }
  cancelRecall(w, u);
  h.summoner.cd = w.debug.noCooldown ? 0 : def.cooldown;
  u.facing = Math.atan2(r.dir.y, r.dir.x);
  w.emit({ t: 'summoner', unit: u.id, id: def.id });
  runEffects(
    w,
    def.stage.effects,
    makeCtx(u, { dir: r.dir, point: r.point, targetId: r.targetId, primaryId: r.targetId, rank: h.level }),
  );
}

export function updateUtility(w: World): void {
  for (const u of w.list) {
    const h = u.hero;
    if (!h || !u.alive) continue;
    if (h.restoreCd > 0) h.restoreCd = Math.max(0, h.restoreCd - w.dt);
    if (h.summoner.cd > 0) h.summoner.cd = Math.max(0, h.summoner.cd - w.dt);
    if (h.recall > 0) {
      if (!canAct(u)) {
        cancelRecall(w, u);
        continue;
      }
      h.recall -= w.dt;
      if (h.recall <= 0) {
        h.recall = 0;
        const sp = w.map.spawn[u.team as 0 | 1];
        u.pos.x = sp.x;
        u.pos.y = sp.y;
        u.prevPos.x = sp.x;
        u.prevPos.y = sp.y;
        w.emit({ t: 'recall', unit: u.id, state: 'done', duration: 0 });
      }
    }
  }
}
