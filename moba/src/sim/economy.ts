import { ECONOMY, respawnTime, xpToNext } from '../data/balance';
import { getUnitDef } from '../data/units';
import type { Team, Unit } from './entity';
import { levelUp } from './hero';
import { addBuff, isStructure } from './status';
import { MONSTERS, TURTLE_REWARD } from '../data/monsters';
import { LANES } from '../data/map';
import type { World } from './world';

/**
 * 经济与成长：金币、经验、击杀 / 助攻赏金、连杀与终结、推塔奖励、死亡复活。
 * 所有数值来自 data/balance.ts 的 ECONOMY。
 */

export function grantGold(w: World, hero: Unit, amount: number, popup = true): void {
  if (!hero.hero || amount <= 0) return;
  hero.hero.gold += amount;
  hero.hero.goldEarned += amount;
  if (popup) w.emit({ t: 'gold', unit: hero.id, amount: Math.round(amount), x: hero.pos.x, y: hero.pos.y });
}

export function grantXp(w: World, hero: Unit, amount: number): void {
  const h = hero.hero;
  if (!h || amount <= 0) return;
  h.xp += amount;
  while (h.level < 15 && h.xp >= xpToNext(h.level)) {
    h.xp -= xpToNext(h.level);
    levelUp(w, hero);
  }
  if (h.level >= 15) h.xp = 0;
}

/** 某队在 pos 附近（经验分享半径内）的存活英雄 */
function heroesNear(w: World, team: Team, x: number, y: number, r: number): Unit[] {
  return w.list.filter((u) => u.hero && u.alive && u.team === team && Math.hypot(u.pos.x - x, u.pos.y - y) <= r);
}

/** 经验分享：多人分享时总经验略增，再平分 */
function shareXp(w: World, team: Team, x: number, y: number, xp: number, mustInclude?: Unit): void {
  const list = heroesNear(w, team, x, y, ECONOMY.xpRadius);
  if (mustInclude && mustInclude.alive && !list.includes(mustInclude)) list.push(mustInclude);
  if (list.length === 0) return;
  const total = xp * (1 + ECONOMY.xpShareBonus * (list.length - 1));
  for (const h of list) grantXp(w, h, total / list.length);
}

/** 找出击杀归属：直接击杀者是英雄则归他；否则归最近伤害过受害者的敌方英雄 */
function creditHero(w: World, victim: Unit, killer: Unit | null): Unit | null {
  if (killer && killer.hero && killer.team !== victim.team) return killer;
  let best: Unit | null = null;
  let bestT = -Infinity;
  for (const a of victim.recentAttackers) {
    if (w.time - a.t > ECONOMY.assistWindow) continue;
    const u = w.get(a.id);
    if (u && u.hero && u.team !== victim.team && a.t > bestT) {
      bestT = a.t;
      best = u;
    }
  }
  return best;
}

/** 单位死亡时的所有结算 */
export function onKill(w: World, victim: Unit, killer: Unit | null): void {
  if (victim.hero) {
    onHeroKilled(w, victim, killer);
    return;
  }
  const enemyTeam: Team = victim.team === 0 ? 1 : 0;
  if (isStructure(victim)) {
    const def = getUnitDef(victim.defId);
    // 推塔：进攻方全队金币；最后一击是英雄则额外奖励
    const attackers: Team = killer ? killer.team : enemyTeam;
    for (const u of w.list) if (u.hero && u.team === attackers) grantGold(w, u, ECONOMY.towerTeamGold, u === killer);
    if (killer?.hero) grantGold(w, killer, ECONOMY.towerLastHitGold);
    shareXp(w, attackers, victim.pos.x, victim.pos.y, def.xp);
    w.emit({ t: 'structureDown', unit: victim.id, team: victim.team, killer: killer?.id ?? 0 });
    return;
  }
  // 小兵 / 野怪：最后一击的英雄得金币，附近敌方英雄分享经验
  const def = getUnitDef(victim.defId);
  if (victim.kind === 'monster' && killer && killer.team !== 2) monsterRewards(w, victim, killer);
  if (killer?.hero && killer.team !== victim.team) {
    grantGold(w, killer, def.gold);
    killer.hero.lastHits++;
  }
  if (victim.team === 2) {
    // 中立单位：击杀方分享经验
    if (killer && killer.team !== 2) shareXp(w, killer.team, victim.pos.x, victim.pos.y, def.xp, killer.hero ? killer : undefined);
  } else {
    shareXp(w, enemyTeam, victim.pos.x, victim.pos.y, def.xp);
  }
}

/** 野怪 / Boss 的特殊奖励：增益、全队金币经验、召唤先锋 */
function monsterRewards(w: World, victim: Unit, killer: Unit): void {
  const def = getUnitDef(victim.defId);
  const team = killer.team as 0 | 1;
  if (def.buffOnKill && killer.hero) addBuff(w, killer, def.buffOnKill.id, killer.id, def.buffOnKill.duration, 1, killer.hero.level);
  if (def.reward === 'teamGoldXp') {
    for (const u of w.list) {
      if (!u.hero || u.team !== team) continue;
      grantGold(w, u, TURTLE_REWARD.gold);
      grantXp(w, u, TURTLE_REWARD.xp);
    }
  }
  if (def.reward === 'vanguard') {
    for (const lane of LANES) {
      const path = w.map.lanes[team][lane];
      w.spawnSummon(MONSTERS.vanguard!, team, { ...path[1]! }, lane);
    }
  }
  if (def.reward) w.emit({ t: 'bossKilled', boss: def.id, team, killer: killer.id });
}

function onHeroKilled(w: World, victim: Unit, killer: Unit | null): void {
  const vh = victim.hero!;
  const credit = creditHero(w, victim, killer);
  vh.deaths++;
  const victimStreak = vh.streak;
  vh.streak = 0;
  vh.multiKill = 0;
  vh.recall = 0;
  vh.respawnAt = w.time + respawnTime(vh.level);

  let bounty = 0;
  const shutdown = victimStreak >= 3;
  if (shutdown) bounty += Math.min(ECONOMY.shutdownMax, ECONOMY.shutdownPerStreak * (victimStreak - 2));
  bounty += ECONOMY.heroBounty;

  const assists: Unit[] = [];
  for (const a of victim.recentAttackers) {
    if (w.time - a.t > ECONOMY.assistWindow) continue;
    const u = w.get(a.id);
    if (u && u.hero && u !== credit && u.team !== victim.team && !assists.includes(u)) assists.push(u);
  }
  victim.recentAttackers = [];

  let firstBlood = false;
  let multi = 1;
  let streak = 0;
  if (credit) {
    const kh = credit.hero!;
    firstBlood = !w.firstBloodDone;
    w.firstBloodDone = true;
    kh.kills++;
    kh.streak++;
    streak = kh.streak;
    kh.multiKill = w.time - kh.lastKillAt <= ECONOMY.multiKillWindow ? kh.multiKill + 1 : 1;
    kh.lastKillAt = w.time;
    multi = kh.multiKill;
    grantGold(w, credit, bounty);
    if (assists.length > 0) {
      const each = Math.max(ECONOMY.assistMinGold, (bounty * ECONOMY.assistShare) / assists.length);
      for (const a of assists) {
        a.hero!.assists++;
        grantGold(w, a, each);
      }
    }
    const xp = ECONOMY.heroKillXpBase + ECONOMY.heroKillXpPerLevel * vh.level;
    shareXp(w, credit.team, victim.pos.x, victim.pos.y, xp, credit);
  }
  w.emit({
    t: 'kill',
    killer: credit?.id ?? killer?.id ?? 0,
    victim: victim.id,
    assists: assists.map((a) => a.id),
    gold: credit ? bounty : 0,
    firstBlood,
    multi,
    streak,
    shutdown: shutdown && !!credit,
  });
}

/** 每帧：自然增长金币、复活计时 */
export function updateEconomy(w: World): void {
  if (w.config.mode !== 'match') return;
  for (const u of w.list) {
    const h = u.hero;
    if (!h) continue;
    grantGold(w, u, ECONOMY.passiveGold * w.dt, false);
    if (!u.alive && h.respawnAt > 0 && w.time >= h.respawnAt) respawnHero(w, u);
  }
}

export function respawnHero(w: World, u: Unit): void {
  const h = u.hero!;
  const sp = w.map.spawn[u.team as 0 | 1];
  u.alive = true;
  u.pos = { ...sp };
  u.prevPos = { ...sp };
  u.hp = u.stats.maxHp;
  u.mp = u.stats.maxMp;
  u.status = { stun: 0, airborne: 0, airborneTotal: 0, silence: 0, slows: [] };
  u.buffs = [];
  u.shields = [];
  u.forced = null;
  u.cast = null;
  u.moveDir = null;
  u.navGoal = null;
  u.navPath = [];
  u.attack.orderTime = 0;
  u.attack.windup = 0;
  u.statsDirty = true;
  h.respawnAt = 0;
  w.emit({ t: 'respawn', unit: u.id });
}
