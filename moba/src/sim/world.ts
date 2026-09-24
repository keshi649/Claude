import { Rng } from '../core/rng';
import { norm, type Vec2 } from '../core/vec2';
import { DT, WAVES } from '../data/balance';
import { getHero } from '../data/heroes';
import { buildMap, type BuiltMap } from '../data/map';
import type { StatBlock, StatKey, UnitDef } from '../data/schema';
import type { LaneId } from '../data/map';
import { CRYSTAL, TOWERS } from '../data/structures';
import { DUMMY } from '../data/units';
import { MINIONS } from '../data/minions';
import type { Command } from './commands';
import { NEUTRAL, type EntityId, type PendingArea, type Projectile, type Team, type Unit, type UnitKind, type Zone } from './entity';
import { createCamps, updateCamps, updateMonsters, type CampState } from './systems/jungle';
import { BushGrid, updateVision } from './vision';
import type { SimEvent } from './events';
import { autoLevelSkills, levelSkill, levelUp } from './hero';
import { buyItem, nextRecommended, sellItem } from './shop';
import { START_GOLD } from '../data/items';
import { AStar } from './nav/astar';
import { NavGrid } from './nav/grid';
import { WallField } from './nav/walls';
import { cancelCharge, commandCast, updateCasts } from './skills/cast';
import { firePassive } from './skills/effects';
import { SpatialHash } from './spatial';
import { recomputeStats, statsAtLevel } from './stats';
import { commandAttack, commandAttackUnit, updateAttacks } from './systems/attack';
import { separateUnits, updateMovement } from './systems/movement';
import { updateProjectiles, updateZones } from './systems/projectiles';
import { updateDummies, updateStatus } from './systems/status';
import { updateMinions, updateWaves } from './systems/minions';
import { updateFountains, updateProtection, updateTowers } from './systems/structures';
import { onKill, updateEconomy } from './economy';
import { cancelRecall, commandRecall, commandRestore, commandSummoner, updateUtility } from './systems/utility';

export interface PlayerConfig {
  pid: number;
  team: 0 | 1;
  heroId: string;
  name: string;
  isAI: boolean;
  /** 召唤师技能 id（默认瞬影） */
  summoner?: string;
}

export interface PlayerSlot extends PlayerConfig {
  unitId: EntityId;
}

export interface WorldConfig {
  seed: number;
  /** training：训练场（木桩 + 不可破坏的建筑）；match：正式对局（兵线、推塔、胜负） */
  mode: 'training' | 'match';
  players: PlayerConfig[];
  /** 英雄初始等级 */
  startLevel?: number;
}

/** 静态地图数据只构建一次，多局 / 多个 World 共享（导航网格按局复制动态层） */
let staticCache: { map: BuiltMap; walls: WallField; nav: NavGrid; bushes: BushGrid } | null = null;
function staticMap(): { map: BuiltMap; walls: WallField; nav: NavGrid; bushes: BushGrid } {
  if (!staticCache) {
    const map = buildMap();
    const walls = new WallField(map.walls, map.size);
    staticCache = { map, walls, nav: new NavGrid(walls), bushes: new BushGrid(map) };
  }
  return staticCache;
}

/**
 * 逻辑世界：固定步长推进，不依赖 DOM / 渲染。
 * 同样的种子 + 同样的命令序列 = 完全相同的结果。
 */
export class World {
  readonly dt = DT;
  tick = 0;
  time = 0;
  readonly rng: Rng;
  readonly map: BuiltMap;
  readonly walls: WallField;
  readonly nav: NavGrid;
  readonly astar: AStar;
  readonly spatial: SpatialHash;
  readonly bushes: BushGrid;
  readonly units = new Map<EntityId, Unit>();
  list: Unit[] = [];
  projectiles: Projectile[] = [];
  zones: Zone[] = [];
  pending: PendingArea[] = [];
  events: SimEvent[] = [];
  players: PlayerSlot[] = [];
  readonly debug = { noCooldown: false };
  /** 英雄之间的攻击记录（小兵 / 塔转火用），保留约 3 秒 */
  aggro: { attacker: EntityId; victim: EntityId; t: number }[] = [];
  firstBloodDone = false;
  nextWaveAt: number = WAVES.firstWaveAt;
  waveIndex = 0;
  /** 获胜方，null 表示对局进行中 */
  winner: Team | null = null;
  /** 野怪营地与 Boss */
  camps: CampState[] = [];
  private idSeq = 1;
  private castSeq = 1;

  constructor(readonly config: WorldConfig) {
    this.rng = new Rng(config.seed);
    const st = staticMap();
    this.map = st.map;
    this.walls = st.walls;
    this.bushes = st.bushes;
    this.nav = st.nav.clone();
    this.astar = new AStar(this.nav);
    this.spatial = new SpatialHash(this.map.size);
    this.setup();
    updateVision(this);
  }

  // ————————————————————————— 基础 API —————————————————————————

  nextId(): EntityId {
    return this.idSeq++;
  }

  newCastId(): number {
    return this.castSeq++;
  }

  get(id: EntityId): Unit | undefined {
    return id ? this.units.get(id) : undefined;
  }

  emit(ev: SimEvent): void {
    this.events.push(ev);
  }

  /**
   * 本帧的结算顺序：奇数帧正序、偶数帧倒序。
   * 实体表里蓝方总是排在前面，如果总按同一顺序结算，“同一帧互相致命”时蓝方永远先出手，
   * 兵线对拼会系统性偏向蓝方；交替顺序消除这种偏差（仍然完全确定）。
   */
  ordered<T>(list: readonly T[]): readonly T[] {
    return this.tick % 2 === 1 ? list : list.slice().reverse();
  }

  /** 取出并清空累计的事件（表现层每帧调用） */
  drainEvents(): SimEvent[] {
    const ev = this.events;
    this.events = [];
    return ev;
  }

  heroOf(pid: number): Unit | undefined {
    const p = this.players.find((s) => s.pid === pid);
    return p ? this.get(p.unitId) : undefined;
  }

  // ————————————————————————— 生成 —————————————————————————

  private addUnit(u: Unit): Unit {
    this.units.set(u.id, u);
    this.list.push(u);
    return u;
  }

  private makeUnit(kind: UnitKind, team: Team, defId: string, name: string, pos: Vec2, radius: number, base: StatBlock): Unit {
    const u: Unit = {
      id: this.nextId(),
      kind,
      team,
      defId,
      name,
      pos: { ...pos },
      prevPos: { ...pos },
      facing: team === 0 ? -Math.PI / 4 : (Math.PI * 3) / 4,
      prevFacing: 0,
      radius,
      static: false,
      alive: true,
      hp: base.maxHp,
      mp: base.maxMp,
      baseStats: { ...base },
      stats: { ...base },
      bonusAd: 0,
      statsDirty: true,
      status: { stun: 0, airborne: 0, airborneTotal: 0, silence: 0, slows: [] },
      buffs: [],
      shields: [],
      forced: null,
      attack: { cd: 0, windup: 0, swingTarget: 0, orderTarget: 0, orderTime: 0, orderMode: 'auto' },
      cast: null,
      moveDir: null,
      navGoal: null,
      navPath: [],
      navRepathAt: 0,
      chaseTarget: 0,
      hero: null,
      innate: { untargetable: false, invulnerable: false, immortal: false },
      lastDamagedAt: -999,
      home: { ...pos },
      patrol: null,
      patrolIdx: 0,
      queuedCast: null,
      lane: null,
      rampTarget: 0,
      rampStacks: 0,
      recentAttackers: [],
      lockTarget: 0,
      bornAt: this.time,
      lastAttacker: 0,
      resetting: false,
      skillTimer: 0,
      skillWindup: 0,
      visibleMask: 3,
      revealUntil: 0,
      bush: 0,
    };
    u.prevFacing = u.facing;
    recomputeStats(u);
    u.hp = u.stats.maxHp;
    u.mp = u.stats.maxMp;
    return u;
  }

  spawnHero(cfg: PlayerConfig, level: number): Unit {
    const def = getHero(cfg.heroId);
    const pos = this.map.spawn[cfg.team];
    const base = statsAtLevel(def.base, def.growth, 1);
    const u = this.makeUnit('hero', cfg.team, def.id, def.name, pos, def.radius, base);
    u.hero = {
      pid: cfg.pid,
      level: 1,
      xp: 0,
      skillLevels: [0, 0, 0],
      skillPoints: 1,
      cooldowns: [0, 0, 0],
      cooldownTotals: [1, 1, 1],
      recast: [null, null, null],
      passiveStamp: def.passive.triggers.map(() => -1),
      gold: this.config.mode === 'match' ? START_GOLD : 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      lastHits: 0,
      streak: 0,
      respawnAt: 0,
      damageDealt: 0,
      damageTaken: 0,
      towerDamage: 0,
      support: 0,
      recall: 0,
      summoner: { id: cfg.summoner ?? 'blink', cd: 0 },
      items: [null, null, null, null, null, null],
      goldEarned: 0,
      restoreCd: 0,
      lastKillAt: -999,
      multiKill: 0,
      passiveTimer: 0,
      itemCd: {},
    };
    this.addUnit(u);
    for (let l = 1; l < level; l++) levelUp(this, u);
    recomputeStats(u);
    u.hp = u.stats.maxHp;
    u.mp = u.stats.maxMp;
    this.players.push({ ...cfg, unitId: u.id });
    return u;
  }

  /** 生成小兵：属性按对局时间成长 */
  spawnMinion(def: UnitDef, team: Team, pos: Vec2, lane: LaneId): Unit {
    const min = this.time / 60;
    const base = { ...def.base };
    const g = def.growthPerMin ?? {};
    for (const k of Object.keys(g) as StatKey[]) base[k] = base[k] * (1 + (g[k] ?? 0) * min);
    const u = this.makeUnit('minion', team, def.id, def.name, pos, def.radius, base);
    u.lane = { id: lane, idx: 1 };
    u.facing = Math.atan2(this.map.lanes[team as 0 | 1][lane][1]!.y - pos.y, this.map.lanes[team as 0 | 1][lane][1]!.x - pos.x);
    u.prevFacing = u.facing;
    return this.addUnit(u);
  }

  /** 生成野怪 / Boss（中立阵营） */
  spawnMonster(def: UnitDef, pos: Vec2): Unit {
    const u = this.makeUnit('monster', NEUTRAL, def.id, def.name, pos, def.radius, this.scaledBase(def));
    u.facing = Math.PI / 2;
    u.prevFacing = u.facing;
    return this.addUnit(u);
  }

  /** 生成召唤物（霆角先锋）：沿指定路线推进 */
  spawnSummon(def: UnitDef, team: Team, pos: Vec2, lane: LaneId): Unit {
    const u = this.makeUnit('summon', team, def.id, def.name, pos, def.radius, this.scaledBase(def));
    u.lane = { id: lane, idx: 1 };
    return this.addUnit(u);
  }

  /** 按对局时间成长后的属性 */
  private scaledBase(def: UnitDef): StatBlock {
    const min = this.time / 60;
    const base = { ...def.base };
    const g = def.growthPerMin ?? {};
    for (const k of Object.keys(g) as StatKey[]) base[k] = base[k] * (1 + (g[k] ?? 0) * min);
    return base;
  }

  spawnDummy(pos: Vec2, team: Team, patrol: Vec2[] | null = null): Unit {
    const def = DUMMY;
    const u = this.makeUnit('dummy', team, def.id, def.name, pos, def.radius, def.base);
    u.innate.immortal = true;
    u.patrol = patrol;
    return this.addUnit(u);
  }

  private spawnStructures(): void {
    // 训练场里建筑只作为地图元素：不可选中、不会被破坏；正式对局中启用攻防
    const inert = this.config.mode === 'training';
    const tierIdx = { outer: 0, inner: 1, high: 2 } as const;
    for (const team of [0, 1] as const) {
      for (const t of this.map.towers[team]) {
        const def = TOWERS[t.tier];
        const u = this.makeUnit('tower', team, def.id, def.name, t.pos, def.radius, def.base);
        u.static = true;
        u.lane = { id: t.lane, idx: tierIdx[t.tier] };
        u.innate.untargetable = inert;
        u.innate.invulnerable = inert;
        this.addUnit(u);
        this.nav.setCircleObstacle(u.pos, u.radius, true);
      }
      const c = this.makeUnit('crystal', team, CRYSTAL.id, CRYSTAL.name, this.map.crystal[team], CRYSTAL.radius, CRYSTAL.base);
      c.static = true;
      c.innate.untargetable = inert;
      c.innate.invulnerable = inert;
      this.addUnit(c);
      this.nav.setCircleObstacle(c.pos, c.radius, true);
    }
  }

  private setup(): void {
    this.spawnStructures();
    if (this.config.mode === 'match') this.camps = createCamps(this);
    const level = this.config.startLevel ?? 1;
    for (const p of this.config.players) {
      const u = this.spawnHero(p, level);
      // 训练场：自动学会每个技能 1 级，剩余技能点留给玩家分配；出生在木桩旁边
      if (this.config.mode === 'training') {
        for (const s of [0, 1, 2] as const) levelSkill(this, u, s);
        if (p.team === 0) {
          u.pos = { x: 24, y: 94 };
          u.prevPos = { ...u.pos };
          u.facing = -Math.PI / 4;
          u.prevFacing = u.facing;
        }
      }
    }
    if (this.config.mode === 'training') {
      // 中路基地前方的木桩群（测试范围技能与连招），以及一个来回走动的移动木桩（测试预判）
      this.spawnDummy({ x: 30, y: 88 }, 1);
      this.spawnDummy({ x: 32.6, y: 90.2 }, 1);
      this.spawnDummy({ x: 28.2, y: 85.4 }, 1);
      this.spawnDummy({ x: 36, y: 86 }, 1);
      this.spawnDummy({ x: 47, y: 69 }, 1, [
        { x: 47, y: 69 },
        { x: 54, y: 62 },
      ]);
    }
    // 出生时不产生事件噪音
    this.events = [];
  }

  // ————————————————————————— 推进 —————————————————————————

  step(commands: readonly Command[]): void {
    if (this.winner !== null) return;
    this.tick++;
    this.time = this.tick * this.dt;
    for (const u of this.list) {
      u.prevPos.x = u.pos.x;
      u.prevPos.y = u.pos.y;
      u.prevFacing = u.facing;
    }
    // 先建空间索引与视野，命令里的索敌 / 自动瞄准才能查到最新位置
    this.spatial.rebuild(this.list);
    if (this.tick % 3 === 1) updateVision(this);
    for (const c of commands) this.apply(c);

    if (this.aggro.length && this.tick % 15 === 0) this.aggro = this.aggro.filter((a) => this.time - a.t < 3);
    const match = this.config.mode === 'match';
    if (match) {
      updateWaves(this);
      updateCamps(this);
      updateProtection(this);
      updateMinions(this);
      updateMonsters(this);
      updateTowers(this);
    }
    updateCasts(this);
    updateUtility(this);
    updateAttacks(this);
    updateMovement(this);
    this.spatial.rebuild(this.list);
    separateUnits(this);
    updateProjectiles(this);
    updateZones(this);
    updateStatus(this);
    updateDummies(this);
    if (match) {
      updateFountains(this);
      updateEconomy(this);
    }
    this.cleanup();
  }

  /** 移除死亡的小兵 / 野怪 / 召唤物（英雄等待复活，建筑保留废墟） */
  private cleanup(): void {
    let removed = false;
    for (const u of this.list) {
      if (!u.alive && (u.kind === 'minion' || u.kind === 'monster' || u.kind === 'summon')) {
        this.units.delete(u.id);
        removed = true;
      }
    }
    if (removed) this.list = this.list.filter((u) => this.units.has(u.id));
  }

  private apply(c: Command): void {
    const u = this.heroOf(c.pid);
    if (!u) return;
    switch (c.t) {
      case 'move': {
        const d = c.dir ? norm(c.dir) : null;
        u.moveDir = d && (d.x !== 0 || d.y !== 0) ? d : null;
        if (u.moveDir) cancelRecall(this, u);
        return;
      }
      case 'moveTo':
        cancelRecall(this, u);
        u.moveDir = null;
        u.navGoal = { x: c.x, y: c.y };
        u.navPath = [];
        u.navRepathAt = 0;
        return;
      case 'stop':
        u.moveDir = null;
        u.navGoal = null;
        u.navPath = [];
        u.attack.orderTime = 0;
        return;
      case 'attack':
        cancelRecall(this, u);
        commandAttack(this, u, c.mode);
        return;
      case 'attackUnit':
        cancelRecall(this, u);
        commandAttackUnit(this, u, c.id);
        return;
      case 'cast':
        cancelRecall(this, u);
        commandCast(this, u, c.slot, c.aim, c.phase);
        return;
      case 'recall':
        commandRecall(this, u);
        return;
      case 'cancelCast':
        cancelCharge(this, u);
        return;
      case 'restore':
        commandRestore(this, u);
        return;
      case 'summoner':
        commandSummoner(this, u, c.aim);
        return;
      case 'levelSkill':
        levelSkill(this, u, c.slot);
        return;
      case 'buy':
        buyItem(this, u, c.item);
        return;
      case 'sell':
        sellItem(this, u, c.slot);
        return;
      case 'buyRecommended': {
        const id = nextRecommended(u);
        if (id) buyItem(this, u, id);
        return;
      }
      case 'debug':
        this.applyDebug(u, c.op, c.value);
        return;
    }
  }

  private applyDebug(u: Unit, op: Extract<Command, { t: 'debug' }>['op'], value?: number): void {
    const h = u.hero;
    if (!h) return;
    switch (op) {
      case 'refreshCd':
        h.cooldowns = [0, 0, 0];
        h.summoner.cd = 0;
        h.restoreCd = 0;
        return;
      case 'noCooldown':
        this.debug.noCooldown = !!value;
        if (value) h.cooldowns = [0, 0, 0];
        return;
      case 'levelUp':
        levelUp(this, u);
        return;
      case 'maxLevel':
        while (levelUp(this, u));
        autoLevelSkills(this, u);
        return;
      case 'addGold':
        h.gold += value ?? 1000;
        return;
      case 'heal':
        u.hp = u.stats.maxHp;
        u.mp = u.stats.maxMp;
        return;
      case 'dummyArmor':
        for (const d of this.list) {
          if (d.kind !== 'dummy') continue;
          d.baseStats.armor = value ?? 0;
          d.baseStats.mr = value ?? 0;
          d.statsDirty = true;
        }
        return;
      case 'stress':
        this.spawnStress(value ?? 120);
        return;
    }
  }

  /** 压力测试：在三路的己方塔前为双方各刷一批近战 / 远程小兵（共 n 个），让它们对推 */
  spawnStress(n: number): void {
    const per = Math.max(1, Math.round(n / 6));
    for (const team of [0, 1] as const) {
      for (const lane of ['top', 'mid', 'bot'] as const) {
        const path = this.map.lanes[team][lane];
        const a = path[Math.min(2, path.length - 1)]!;
        for (let i = 0; i < per; i++) {
          const pos = { x: a.x + ((i % 4) - 1.5) * 1.1, y: a.y + (Math.floor(i / 4) - 1) * 1.1 };
          const p = this.nav.walkableAt(pos) ? pos : { ...a };
          this.spawnMinion(i % 3 === 2 ? MINIONS.ranged : MINIONS.melee, team, p, lane);
        }
      }
    }
  }

  /** 单位死亡：结算赏金 / 经验，建筑移除寻路障碍，水晶被毁则分出胜负 */
  killUnit(u: Unit, killer: Unit | null): void {
    if (!u.alive) return;
    u.alive = false;
    u.hp = 0;
    u.cast = null;
    u.forced = null;
    u.queuedCast = null;
    u.attack.orderTime = 0;
    u.attack.windup = 0;
    this.emit({ t: 'death', unit: u.id, killer: killer?.id ?? 0 });
    if (killer?.hero && killer.alive && killer.team !== u.team) firePassive(this, killer, 'kill', u);
    if (u.static) this.nav.setCircleObstacle(u.pos, u.radius, false);
    if (this.config.mode === 'match') onKill(this, u, killer);
    if (u.kind === 'crystal' && this.winner === null) {
      this.winner = u.team === 0 ? 1 : 0;
      this.emit({ t: 'gameOver', winner: this.winner });
    }
  }

  /** 可序列化快照（联机同步 / 回放 / 确定性校验用） */
  snapshot(): string {
    return JSON.stringify({
      tick: this.tick,
      rng: this.rng.state,
      units: this.list,
      projectiles: this.projectiles,
      zones: this.zones,
      pending: this.pending,
    });
  }
}
