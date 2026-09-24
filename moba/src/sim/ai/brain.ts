import type { Rng } from '../../core/rng';
import { norm, type Vec2 } from '../../core/vec2';
import { FOUNTAIN } from '../../data/balance';
import { getHero } from '../../data/heroes';
import type { LaneId } from '../../data/map';
import type { Command } from '../commands';
import type { EntityId, Team, Unit } from '../entity';
import { canLevelSkill } from '../hero';
import { edgeDist } from '../query';
import { isStructure, isInvulnerable } from '../status';
import { visibleTo } from '../vision';
import type { World } from '../world';
import { chooseSkill, chooseSummoner, power, targetScore, type CombatCtx } from './combat';
import type { DifficultyParams } from './difficulty';
import type { TeamKnowledge } from './perception';
import { laneOf, type Position } from './roles';

/**
 * 单个 AI 英雄的大脑：
 *   决策层（效用 AI）：每隔 decisionTicks 给各个目标打分，选分最高的（带滞后防抖、带难度噪声）
 *   执行层：每帧按当前目标生成命令；放技能 / 换目标 / 躲技能只在反应帧进行
 * 只能通过 TeamKnowledge 获得敌方信息（不开图）。输出与玩家完全相同的 Command。
 */
export type Goal = 'laning' | 'jungle' | 'roam' | 'fight' | 'retreat' | 'recall' | 'defend' | 'gank' | 'objective' | 'group';

export const GOAL_NAMES: Record<Goal, string> = {
  laning: '对线',
  jungle: '打野',
  roam: '游走',
  fight: '团战',
  retreat: '撤退',
  recall: '回城',
  defend: '守塔',
  gank: '抓人',
  objective: '打龙',
  group: '推进',
};

export interface TeamPlan {
  /** 集体目标（Boss 单位 id），0 表示没有 */
  objective: EntityId;
  members: Set<EntityId>;
  /** 后期抱团推进的路线 */
  groupLane: LaneId | null;
  /** 人数优势、趁机推塔（比普通抱团优先级更高、更敢越塔） */
  push: boolean;
  /** 正被敌方多人进攻的己方建筑（全队回防），0 表示没有 */
  defendAt: EntityId;
}

const dist = (a: Vec2, b: Vec2): number => Math.hypot(a.x - b.x, a.y - b.y);

/** 路线上的累计长度，用来把位置换算成“推进进度” */
function progressOf(path: readonly Vec2[], p: Vec2): number {
  let best = 0;
  let bestD = Infinity;
  let acc = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const l = Math.hypot(abx, aby) || 1;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / (l * l)));
    const d = Math.hypot(a.x + abx * t - p.x, a.y + aby * t - p.y);
    if (d < bestD) {
      bestD = d;
      best = acc + t * l;
    }
    acc += l;
  }
  return best;
}

function pointAt(path: readonly Vec2[], d: number): Vec2 {
  d = Math.max(0, d);
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    const l = Math.hypot(b.x - a.x, b.y - a.y);
    if (d <= l) return { x: a.x + ((b.x - a.x) * d) / l, y: a.y + ((b.y - a.y) * d) / l };
    d -= l;
  }
  return { ...path[path.length - 1]! };
}

export class AIBrain {
  goal: Goal;
  goalTarget: EntityId = 0;
  scores: [Goal, number][] = [];
  private fightTarget: EntityId = 0;
  private lastMove: Vec2 | null = null;
  private lastMoveAt = -99;
  private dodgeUntil = 0;
  private dodgeDir: Vec2 | null = null;
  private kiting = false;
  private charging: { slot: 0 | 1 | 2; releaseAt: number } | null = null;
  private lastRecallAt = -99;
  private nextBuyAt = 0;
  private defendTarget: EntityId = 0;

  constructor(
    readonly pid: number,
    readonly unitId: EntityId,
    readonly position: Position,
    readonly diff: DifficultyParams,
    private readonly rng: Rng,
  ) {
    this.goal = position === 'jungle' ? 'jungle' : position === 'roam' ? 'roam' : 'laning';
  }

  get debugText(): string {
    const top = this.scores
      .slice()
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([g, s]) => `${GOAL_NAMES[g]}${s.toFixed(2)}`)
      .join(' ');
    return `${GOAL_NAMES[this.goal]}｜${top}`;
  }

  // ————————————————————————— 主循环 —————————————————————————

  think(w: World, K: TeamKnowledge, plan: TeamPlan): Command[] {
    const u = w.get(this.unitId);
    const out: Command[] = [];
    if (!u || !u.hero) return out;
    if (!u.alive) {
      this.charging = null;
      this.lastMove = null;
      this.fightTarget = 0;
      return out;
    }
    const h = u.hero;
    const pid = this.pid;

    // 加点：大招优先，然后按配置顺序
    if (h.skillPoints > 0) {
      const order = [2, ...getHero(u.defId).skillOrder, 0, 1] as (0 | 1 | 2)[];
      const s = order.find((x) => canLevelSkill(u, x));
      if (s !== undefined) out.push({ t: 'levelSkill', pid, slot: s });
    }
    // 买装备（任意位置都能买）
    if (w.time >= this.nextBuyAt) {
      this.nextBuyAt = w.time + 2 + this.rng.next();
      out.push({ t: 'buyRecommended', pid });
    }

    const off = w.tick + this.unitId * 7;
    const decide = off % this.diff.decisionTicks === 0;
    const react = off % this.diff.reactionTicks === 0;

    const enemies = K.visibleEnemyHeroes(w).filter((e) => dist(e.pos, u.pos) < 12);
    const allies = w.list.filter((a) => a.hero && a.alive && a.team === u.team && dist(a.pos, u.pos) < 12);

    if (decide) this.decide(w, u, K, plan, enemies, allies);

    // 躲技能（困难 / 普通有概率）
    if (react && this.diff.dodge > 0 && w.time > this.dodgeUntil) this.checkDodge(w, u);
    if (w.time < this.dodgeUntil && this.dodgeDir) {
      out.push({ t: 'move', pid, dir: this.dodgeDir });
      this.kiting = true;
      return out;
    }
    if (this.kiting) {
      out.push({ t: 'move', pid, dir: null });
      this.kiting = false;
    }

    // 蓄力中：到时间松手
    if (this.charging) {
      const c = this.charging;
      if (!u.cast || u.cast.phase !== 'charging') this.charging = null;
      else if (w.time >= c.releaseAt) {
        const t = w.get(this.fightTarget) ?? enemies[0];
        const aim = t ? { k: 'point' as const, x: t.pos.x, y: t.pos.y } : { k: 'auto' as const };
        out.push({ t: 'cast', pid, slot: c.slot, aim, phase: 'release' });
        this.charging = null;
      }
      return out;
    }

    switch (this.goal) {
      case 'retreat':
        this.doRetreat(w, u, enemies, allies, react, out);
        break;
      case 'recall':
        this.doRecall(w, u, out);
        break;
      case 'fight':
      case 'gank':
        this.doFight(w, u, K, enemies, allies, react, out);
        break;
      case 'jungle':
        this.doJungle(w, u, K, enemies, allies, react, out);
        break;
      case 'objective':
        this.doObjective(w, u, K, plan, enemies, allies, react, out);
        break;
      case 'defend':
        this.doDefend(w, u, K, enemies, allies, react, out);
        break;
      case 'roam':
        this.doRoam(w, u, K, enemies, allies, react, out);
        break;
      case 'group':
        this.doLane(w, u, K, plan.groupLane ?? 'mid', enemies, allies, react, out, plan.push ? 'push' : 'group');
        break;
      default:
        this.doLane(w, u, K, laneOf(this.position) ?? 'mid', enemies, allies, react, out, 'lane');
    }
    return out;
  }

  // ————————————————————————— 决策（效用 AI） —————————————————————————

  private decide(w: World, u: Unit, K: TeamKnowledge, plan: TeamPlan, enemies: Unit[], allies: Unit[]): void {
    const h = u.hero!;
    const hp = u.hp / u.stats.maxHp;
    const mp = u.stats.maxMp > 0 ? u.mp / u.stats.maxMp : 1;
    // 己方塔下作战：把塔算作约一名英雄的战力
    const underOwnTower = w.list.some((t) => isStructure(t) && t.alive && t.team === u.team && !isInvulnerable(t) && dist(t.pos, u.pos) < t.stats.range + 2);
    const myPow = allies.reduce((s, a) => s + power(a), 0) + (underOwnTower ? power(u) : 0);
    const enPow = enemies.reduce((s, e) => s + power(e), 0);
    // 看不见但刚出现过的敌人也算威胁
    const missing = K.missingNear(w, u.pos, 14, 6);
    const ratio = myPow / Math.max(1, enPow + missing * power(u) * 0.8);
    const team = u.team as 0 | 1;
    const fountain = w.map.fountain[team];
    const atFountain = dist(u.pos, fountain) < FOUNTAIN.radius;
    const underEnemyTower = w.list.some((t) => isStructure(t) && t.alive && t.team !== u.team && dist(t.pos, u.pos) < t.stats.range + 1.5);

    const s: Partial<Record<Goal, number>> = {};
    // 撤退
    if (enemies.length > 0 && (hp < 0.3 || ratio < 0.55)) s.retreat = 0.95 - hp * 0.3;
    else if (hp < 0.18 && !atFountain) s.retreat = 0.8;
    // 回城
    if (enemies.length === 0 && !atFountain) {
      // 装备随处可买，所以只因血量 / 法力回城
      if (hp < 0.4) s.recall = 0.8;
      else if (mp < 0.15 && u.stats.maxMp > 0) s.recall = 0.65;
    }
    if (atFountain && hp < 0.9) s.recall = 0.9;
    // 团战 / 击杀
    if (enemies.length > 0) {
      const need = this.diff.engageRatio * (underEnemyTower ? 1.7 : 1);
      if (ratio >= need) s.fight = 0.62 + Math.min(0.25, (ratio - need) * 0.2);
      const weak = enemies.find((e) => e.hp / e.stats.maxHp < 0.3);
      if (weak && ratio > 0.8 && hp > 0.35) s.fight = Math.max(s.fight ?? 0, 0.82);
    }
    // 守塔：身边的塔挨打时就近防守；多名敌人进攻某座建筑时全队回防（越核心的建筑越优先）
    this.defendTarget = 0;
    for (const t of w.list) {
      if (t.kind !== 'tower' && t.kind !== 'crystal') continue;
      if (!t.alive || t.team !== u.team || w.time - t.lastDamagedAt > 2) continue;
      const d = dist(t.pos, u.pos);
      if (d > 38) continue;
      const threat = K.visibleEnemies(w).some((e) => dist(e.pos, t.pos) < 10);
      if (!threat) continue;
      const sc = 0.58 - d * 0.004 + (t.kind === 'crystal' ? 0.25 : t.lane?.idx === 2 ? 0.15 : 0);
      if (sc > (s.defend ?? 0)) {
        s.defend = sc;
        this.defendTarget = t.id;
      }
    }
    const base = w.get(plan.defendAt);
    if (base && base.alive) {
      const sc = 0.8 - dist(base.pos, u.pos) * 0.003 + (base.kind === 'crystal' ? 0.15 : base.lane?.idx === 2 ? 0.08 : 0);
      if (sc > (s.defend ?? 0)) {
        s.defend = sc;
        this.defendTarget = base.id;
      }
    }
    // 集体目标
    if (plan.objective && plan.members.has(u.id)) s.objective = 0.72;
    if (plan.groupLane) s.group = plan.push ? 0.74 : 0.5;
    // 抓人（打野 / 游走）
    if ((this.position === 'jungle' || this.position === 'roam') && h.level >= 3 && hp > 0.55) {
      let best: Unit | null = null;
      let bestS = 0;
      for (const e of K.visibleEnemyHeroes(w)) {
        const d = dist(e.pos, u.pos);
        if (d > 40) continue;
        const nearTheirTower = w.list.some((t) => isStructure(t) && t.alive && t.team === e.team && dist(t.pos, e.pos) < 11);
        if (nearTheirTower) continue;
        const sc = (1 - e.hp / e.stats.maxHp) * 0.5 + 0.35 - d * 0.004;
        if (sc > bestS) {
          bestS = sc;
          best = e;
        }
      }
      if (best && bestS > 0.3) {
        s.gank = 0.45 + bestS * 0.35;
        this.goalTarget = best.id;
      }
    }
    // 默认目标
    if (this.position === 'jungle') s.jungle = this.ownCamps(w, u).length > 0 ? 0.45 : 0.2;
    else if (this.position === 'roam') s.roam = 0.45;
    else s.laning = 0.45;
    if (this.position === 'jungle' && !s.jungle) s.laning = 0.3;
    if (this.position === 'jungle' && (s.jungle ?? 0) < 0.3) s.laning = 0.35;

    const list = Object.entries(s) as [Goal, number][];
    for (const e of list) {
      e[1] += this.rng.range(-this.diff.noise, this.diff.noise) * 0.5;
      if (e[0] === this.goal) e[1] += 0.07;
    }
    this.scores = list;
    const best = list.reduce((a, b) => (b[1] > a[1] ? b : a), list[0]!);
    if (best[0] !== this.goal) {
      this.goal = best[0];
      this.lastMove = null;
      if (best[0] !== 'fight' && best[0] !== 'gank') this.fightTarget = 0;
    }
  }

  // ————————————————————————— 执行 —————————————————————————

  private moveTo(w: World, out: Command[], p: Vec2): void {
    if (this.lastMove && dist(this.lastMove, p) < 1.5 && w.time - this.lastMoveAt < 2) return;
    this.lastMove = { ...p };
    this.lastMoveAt = w.time;
    out.push({ t: 'moveTo', pid: this.pid, x: p.x, y: p.y });
  }

  private attack(out: Command[], t: Unit): void {
    out.push({ t: 'attackUnit', pid: this.pid, id: t.id });
    this.lastMove = null;
  }

  private combat(w: World, u: Unit, c: Omit<CombatCtx, 'w' | 'self' | 'diff' | 'rng'>, react: boolean, out: Command[]): void {
    if (!react) return;
    const ctx: CombatCtx = { ...c, w, self: u, diff: this.diff, rng: this.rng };
    const sum = chooseSummoner(ctx);
    if (sum) out.push({ t: 'summoner', pid: this.pid, aim: sum });
    if (u.cast && u.cast.phase !== 'recovery') return;
    const ch = chooseSkill(ctx);
    if (!ch) return;
    if (ch.charge) {
      out.push({ t: 'cast', pid: this.pid, slot: ch.slot, aim: ch.aim, phase: 'start' });
      this.charging = { slot: ch.slot, releaseAt: w.time + 0.4 + this.rng.next() * 0.8 };
    } else out.push({ t: 'cast', pid: this.pid, slot: ch.slot, aim: ch.aim });
  }

  /** 附近可见的敌方小兵 / 野怪 */
  private creeps(w: World, u: Unit, r: number, neutral = false): Unit[] {
    return w.list.filter(
      (m) =>
        m.alive &&
        (m.kind === 'minion' || m.kind === 'summon' || (neutral && m.kind === 'monster')) &&
        m.team !== u.team &&
        (neutral || m.team !== 2) &&
        visibleTo(m, u.team) &&
        dist(m.pos, u.pos) < r,
    );
  }

  private enemyTowerThreat(w: World, u: Unit, p: Vec2): Unit | null {
    for (const t of w.list) {
      if (!isStructure(t) || !t.alive || t.team === u.team) continue;
      if (dist(t.pos, p) < t.stats.range + 1.2) return t;
    }
    return null;
  }

  /** 普攻对某单位的预计伤害 */
  private hitDamage(u: Unit, m: Unit): number {
    return (u.stats.ad * 600) / (600 + Math.max(0, m.stats.armor * (1 - u.stats.armorPenPct) - u.stats.armorPen));
  }

  private doLane(w: World, u: Unit, K: TeamKnowledge, lane: LaneId, enemies: Unit[], allies: Unit[], react: boolean, out: Command[], mode: 'lane' | 'group' | 'push'): void {
    const grouping = mode !== 'lane';
    const team = u.team as 0 | 1;
    const path = w.map.lanes[team][lane];
    const ranged = u.stats.range > 3;
    // 己方前线：本路最靠前的己方小兵 / 先锋
    let front = -1;
    for (const m of w.list) {
      if (!m.alive || m.team !== u.team || (m.kind !== 'minion' && m.kind !== 'summon') || m.lane?.id !== lane) continue;
      front = Math.max(front, progressOf(path, m.pos));
    }
    // 敌方这一路下一座塔
    let enemyTowerProg = Infinity;
    let enemyTower: Unit | null = null;
    for (const t of w.list) {
      if (!t.alive || t.team === u.team || !isStructure(t)) continue;
      if (t.kind === 'tower' && t.lane?.id !== lane) continue;
      const p = progressOf(path, t.pos);
      if (dist(pointAt(path, p), t.pos) > 8) continue;
      if (p < enemyTowerProg) {
        enemyTowerProg = p;
        enemyTower = t;
      }
    }
    // 己方最外面的塔
    let ownTowerProg = 8;
    for (const t of w.list) {
      if (!t.alive || t.team !== u.team || t.kind !== 'tower' || t.lane?.id !== lane) continue;
      ownTowerProg = Math.max(ownTowerProg, progressOf(path, t.pos));
    }
    let stand = front >= 0 ? front - (ranged ? 3 : 1.5) : ownTowerProg + 3;
    // 能不能进塔：至少 2 个己方小兵在塔下、附近没有敌方英雄、塔没有在打自己
    const tanks = enemyTower
      ? w.list.filter((m) => m.alive && m.team === u.team && (m.kind === 'minion' || m.kind === 'summon') && dist(m.pos, enemyTower!.pos) < enemyTower!.stats.range + 0.5).length
      : 0;
    // 刚在附近消失的敌人可能埋伏在草丛里：有这种风险时不进塔
    // 抱团推进时：身边有 3 个以上队友且塔没在打自己，也可以强推
    const squad = w.list.filter((a) => a.hero && a.alive && a.team === u.team && dist(a.pos, u.pos) < 12).length;
    const hpOk = u.hp / u.stats.maxHp > 0.5;
    // 人数优势推进时：3 人以上、血量健康，就算有一两个敌人守塔也强推
    const tanky = hpOk && squad >= 4 && mode === 'push';
    const canDive =
      !!enemyTower &&
      (enemyTower.lockTarget !== u.id || tanky) &&
      (mode === 'push' || K.missingNear(w, enemyTower.pos, 14, 5) === 0) &&
      ((tanks >= 2 && enemies.length === 0) ||
        (grouping && squad >= 3 && hpOk && enemies.length <= (mode === 'push' ? squad - 2 : 1) && (tanks >= 1 || squad >= 4)));
    if (enemyTower && !canDive) stand = Math.min(stand, enemyTowerProg - (enemyTower.stats.range + 2.5));
    if (grouping) {
      // 抱团推进：跟在队伍前线附近
      const mates = w.list.filter((a) => a.hero && a.alive && a.team === u.team && a !== u);
      if (mates.length) stand = Math.min(stand, Math.max(...mates.map((a) => progressOf(path, a.pos))) + 1);
    }
    const standPos = pointAt(path, stand);

    // 塔在打自己：马上退出塔的范围
    const threat = this.enemyTowerThreat(w, u, u.pos);
    if (threat && threat.lockTarget === u.id && !(tanky && canDive)) {
      const away = norm({ x: u.pos.x - threat.pos.x, y: u.pos.y - threat.pos.y });
      this.moveTo(w, out, { x: u.pos.x + away.x * 6, y: u.pos.y + away.y * 6 });
      return;
    }

    const creeps = this.creeps(w, u, u.stats.range + 5);
    // 对线消耗：敌方英雄在射程附近、自己不在敌塔下、血量不低
    const eh = enemies.find((e) => edgeDist(u, e) <= u.stats.range + 1.5 && !this.enemyTowerThreat(w, u, e.pos));
    const hp = u.hp / u.stats.maxHp;
    this.combat(w, u, { target: eh ?? null, enemies, allies, intent: eh && hp > 0.5 ? 'poke' : 'farm', creeps }, react, out);

    // 推塔
    if (canDive && enemyTower && !isInvulnerable(enemyTower) && edgeDist(u, enemyTower) < u.stats.range + 4) {
      this.attack(out, enemyTower);
      return;
    }
    // 补刀：能一下打死的小兵优先
    const dmgMul = this.diff.lastHitSlack;
    const killable = creeps
      .filter((m) => m.kind === 'minion' && (canDive || !this.enemyTowerThreat(w, u, m.pos)))
      .filter((m) => m.hp <= this.hitDamage(u, m) * dmgMul)
      .sort((a, b) => a.hp - b.hp)[0];
    if (killable) {
      this.attack(out, killable);
      return;
    }
    // 对面没英雄：直接清线推进；有英雄：偶尔用普攻消耗
    if (enemies.length === 0) {
      const safe = creeps.filter((m) => !this.enemyTowerThreat(w, u, m.pos) || canDive).sort((a, b) => a.hp - b.hp)[0];
      if (safe) {
        this.attack(out, safe);
        return;
      }
    } else if (eh && hp > 0.55 && this.rng.chance(0.02)) {
      this.attack(out, eh);
      return;
    }
    this.moveTo(w, out, standPos);
  }

  private doFight(w: World, u: Unit, K: TeamKnowledge, enemies: Unit[], allies: Unit[], react: boolean, out: Command[]): void {
    let t = w.get(this.fightTarget);
    if (this.goal === 'gank') t = w.get(this.goalTarget) ?? t;
    if (!t || !t.alive || !visibleTo(t, u.team) || dist(t.pos, u.pos) > 16) t = undefined;
    if (react || !t) {
      const cands = K.visibleEnemyHeroes(w).filter((e) => dist(e.pos, u.pos) < (this.goal === 'gank' ? 45 : 12));
      if (cands.length) {
        const best = cands.reduce((a, b) => (targetScore(u, b) > targetScore(u, a) ? b : a));
        if (!t || targetScore(u, best) > targetScore(u, t) + 0.6) t = best;
      }
    }
    if (!t) {
      // 附近没有看得见的敌人：清附近小兵
      const c = this.creeps(w, u, 8)[0];
      if (c) this.attack(out, c);
      return;
    }
    this.fightTarget = t.id;
    const d = dist(t.pos, u.pos);
    // 抓人路上：先跑过去
    if (this.goal === 'gank' && d > 8) {
      this.moveTo(w, out, t.pos);
      return;
    }
    // 不追进敌方塔下（除非对方残血、自己状态好）
    const tower = this.enemyTowerThreat(w, u, t.pos);
    const hp = u.hp / u.stats.maxHp;
    if (tower && !(t.hp / t.stats.maxHp < 0.2 && hp > 0.5 && tower.lockTarget !== u.id)) {
      this.combat(w, u, { target: t, enemies, allies, intent: 'poke', creeps: [] }, react, out);
      const away = norm({ x: u.pos.x - tower.pos.x, y: u.pos.y - tower.pos.y });
      this.moveTo(w, out, { x: tower.pos.x + away.x * (tower.stats.range + 3), y: tower.pos.y + away.y * (tower.stats.range + 3) });
      return;
    }
    this.combat(w, u, { target: t, enemies, allies, intent: 'fight', creeps: [] }, react, out);
    // 远程拉扯：攻击间隙里，离近身的敌人远一点
    const ranged = u.stats.range > 3;
    if (ranged && this.diff.kite && u.attack.cd > 0.3 && u.attack.windup <= 0) {
      const close = enemies.find((e) => e.stats.range < 3 && dist(e.pos, u.pos) < e.stats.range + 1.5);
      if (close) {
        const away = norm({ x: u.pos.x - close.pos.x, y: u.pos.y - close.pos.y });
        out.push({ t: 'move', pid: this.pid, dir: away });
        this.kiting = true;
        return;
      }
    }
    this.attack(out, t);
  }

  private doRetreat(w: World, u: Unit, enemies: Unit[], allies: Unit[], react: boolean, out: Command[]): void {
    const f = w.map.spawn[u.team as 0 | 1];
    this.combat(w, u, { target: enemies[0] ?? null, enemies, allies, intent: 'retreat', creeps: [] }, react, out);
    // 身边没敌人了就回城
    if (enemies.length === 0 && u.hp / u.stats.maxHp < 0.6 && dist(u.pos, f) > 20) {
      this.goal = 'recall';
      return;
    }
    this.moveTo(w, out, f);
  }

  private doRecall(w: World, u: Unit, out: Command[]): void {
    const f = w.map.fountain[u.team as 0 | 1];
    if (dist(u.pos, f) < FOUNTAIN.radius) return; // 在泉水里等回满
    if (u.hero!.recall > 0) return;
    if (w.time - this.lastRecallAt > 1) {
      this.lastRecallAt = w.time;
      this.lastMove = null;
      out.push({ t: 'recall', pid: this.pid });
    }
  }

  private ownCamps(w: World, u: Unit): { pos: Vec2; ids: EntityId[] }[] {
    const team: Team = u.team;
    // 本方野区 + 附近的河道之灵
    return w.camps.filter(
      (c) =>
        c.kind !== 'turtle' &&
        c.kind !== 'dragon' &&
        c.ids.length > 0 &&
        (c.kind === 'riverSprite' ? dist(c.pos, u.pos) < 22 : team === 0 ? c.pos.y > c.pos.x : c.pos.y < c.pos.x),
    );
  }

  private doJungle(w: World, u: Unit, K: TeamKnowledge, enemies: Unit[], allies: Unit[], react: boolean, out: Command[]): void {
    const camps = this.ownCamps(w, u);
    if (camps.length === 0) {
      this.doLane(w, u, K, 'mid', enemies, allies, react, out, 'lane');
      return;
    }
    const camp = camps.reduce((a, b) => (dist(a.pos, u.pos) < dist(b.pos, u.pos) ? a : b));
    if (dist(camp.pos, u.pos) > 5) {
      this.moveTo(w, out, camp.pos);
      return;
    }
    const monsters = camp.ids.map((id) => w.get(id)).filter((m): m is Unit => !!m && m.alive);
    // 先打大的（猎击留给大怪），小怪一起用技能清
    const target = monsters.reduce((a, b) => (b.stats.maxHp > a.stats.maxHp ? b : a), monsters[0]!);
    this.combat(w, u, { target: null, enemies, allies, intent: 'jungle', creeps: monsters }, react, out);
    if (target) this.attack(out, target);
  }

  private doObjective(w: World, u: Unit, K: TeamKnowledge, plan: TeamPlan, enemies: Unit[], allies: Unit[], react: boolean, out: Command[]): void {
    const boss = w.get(plan.objective);
    if (!boss || !boss.alive) {
      this.goal = 'laning';
      return;
    }
    if (enemies.length > 0) {
      this.doFight(w, u, K, enemies, allies, react, out);
      return;
    }
    if (dist(boss.pos, u.pos) > u.stats.range + boss.radius + 2) {
      this.moveTo(w, out, boss.pos);
      return;
    }
    this.combat(w, u, { target: null, enemies, allies, intent: 'jungle', creeps: [boss] }, react, out);
    this.attack(out, boss);
  }

  private doDefend(w: World, u: Unit, K: TeamKnowledge, enemies: Unit[], allies: Unit[], react: boolean, out: Command[]): void {
    const tower = w.get(this.defendTarget);
    if (!tower || !tower.alive) {
      this.goal = 'laning';
      return;
    }
    // 还在赶路：远处的敌人不理，先回到塔下
    if (dist(tower.pos, u.pos) > 16) {
      this.moveTo(w, out, tower.pos);
      return;
    }
    if (enemies.length > 0) {
      this.doFight(w, u, K, enemies, allies, react, out);
      return;
    }
    const c = this.creeps(w, u, 10)[0];
    if (c && dist(c.pos, tower.pos) < 14) {
      this.combat(w, u, { target: null, enemies, allies, intent: 'farm', creeps: this.creeps(w, u, 8) }, react, out);
      this.attack(out, c);
      return;
    }
    this.moveTo(w, out, tower.pos);
  }

  private doRoam(w: World, u: Unit, K: TeamKnowledge, enemies: Unit[], allies: Unit[], react: boolean, out: Command[]): void {
    // 游走：跟着发育路的队友（前期）或最近在打架的队友
    const mates = w.list.filter((a) => a.hero && a.alive && a.team === u.team && a !== u);
    if (mates.length === 0) {
      this.doLane(w, u, K, 'bot', enemies, allies, react, out, 'lane');
      return;
    }
    const fighting = mates.find((m) => w.time - m.lastDamagedAt < 2 && dist(m.pos, u.pos) < 30);
    const carry = fighting ?? mates.find((m) => getHero(m.defId).role === 'marksman') ?? mates[0]!;
    if (enemies.length > 0) {
      this.combat(w, u, { target: enemies[0]!, enemies, allies, intent: 'fight', creeps: [] }, react, out);
      if (dist(enemies[0]!.pos, u.pos) < u.stats.range + 1.5) this.attack(out, enemies[0]!);
      else this.moveTo(w, out, carry.pos);
      return;
    }
    const f = w.map.fountain[u.team as 0 | 1];
    const back = norm({ x: f.x - carry.pos.x, y: f.y - carry.pos.y });
    this.moveTo(w, out, { x: carry.pos.x + back.x * 2.2, y: carry.pos.y + back.y * 2.2 });
  }

  /** 躲技能：敌方弹道 / 延迟区域会命中自己时侧向移动 */
  private checkDodge(w: World, u: Unit): void {
    if (!this.rng.chance(this.diff.dodge)) return;
    for (const p of w.projectiles) {
      if (p.team === u.team || p.isAttack) continue;
      const rx = u.pos.x - p.pos.x;
      const ry = u.pos.y - p.pos.y;
      const along = rx * p.dirX + ry * p.dirY;
      if (along < 0 || along > 9) continue;
      const perp = rx * -p.dirY + ry * p.dirX;
      if (Math.abs(perp) > p.width + u.radius + 0.4) continue;
      const side = perp >= 0 ? 1 : -1;
      this.dodgeDir = { x: -p.dirY * side, y: p.dirX * side };
      this.dodgeUntil = w.time + 0.35;
      return;
    }
    for (const a of w.pending) {
      if (a.team === u.team) continue;
      const r = a.shape.k === 'circle' ? a.shape.r : a.shape.k === 'cone' ? a.shape.r : 3;
      const d = dist(a.pos, u.pos);
      if (d > r + u.radius) continue;
      this.dodgeDir = d > 0.01 ? norm({ x: u.pos.x - a.pos.x, y: u.pos.y - a.pos.y }) : { x: 1, y: 0 };
      this.dodgeUntil = w.time + Math.min(0.6, a.remaining + 0.1);
      return;
    }
  }
}
