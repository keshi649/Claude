import { Sfx, type SfxName } from '../audio/sfx';
import { FixedStepLoop } from '../core/loop';
import { BALANCE } from '../data/balance';
import { getHero } from '../data/heroes';
import { CommandMapper, liveSnapshot, stageOf } from '../input/commandMapper';
import { KeyboardMouse } from '../input/keyboardMouse';
import { InputState } from '../input/state';
import { GameRenderer, type AimRender } from '../render/renderer';
import type { Command } from '../sim/commands';
import type { SimEvent } from '../sim/events';
import { World, type WorldConfig } from '../sim/world';
import { DebugPanel } from '../ui/debugPanel';
import { Hud } from '../ui/hud';

const PLAYER_PID = 1;

/**
 * 一局游戏：把逻辑（World）、渲染、输入、界面、音效串起来。
 * 每帧：输入 → 命令队列 → 固定步长推进逻辑 → 消费事件（打击感 / 音效 / 提示）→ 插值渲染 → 更新界面。
 */
export class GameSession {
  readonly world: World;
  private renderer: GameRenderer;
  private input = new InputState();
  private mapper = new CommandMapper(PLAYER_PID);
  private keyboard: KeyboardMouse;
  private sfx = new Sfx();
  private hud!: Hud;
  private debug!: DebugPanel;
  private loop: FixedStepLoop;
  private pending: Command[] = [];
  private raf = 0;
  private last = 0;
  private fps = 60;
  private stepMs = 0;
  private minimapAt = 0;

  constructor(
    private readonly container: HTMLElement,
    cfg: Omit<WorldConfig, 'players'> & { heroId: string },
  ) {
    this.world = new World({
      ...cfg,
      players: [{ pid: PLAYER_PID, team: 0, heroId: cfg.heroId, name: '玩家', isAI: false }],
    });
    const hero = this.world.heroOf(PLAYER_PID)!;
    this.renderer = new GameRenderer(this.world, hero.id);
    this.loop = new FixedStepLoop(BALANCE.tickRate, () => {
      const t0 = performance.now();
      this.world.step(this.pending);
      this.pending = [];
      this.stepMs = this.stepMs * 0.9 + (performance.now() - t0) * 0.1;
    });
    this.keyboard = new KeyboardMouse(this.input, { onToggleDebug: () => this.debug.toggle() });
  }

  async start(): Promise<void> {
    const hero = this.world.heroOf(PLAYER_PID)!;
    const gameEl = document.createElement('div');
    gameEl.id = 'game';
    this.container.appendChild(gameEl);
    await this.renderer.init(gameEl);
    const vignette = document.createElement('div');
    vignette.id = 'vignette';
    this.container.appendChild(vignette);

    this.hud = new Hud(this.container, this.world, hero, this.input, {
      onAttack: (a, f, t) => this.keyboard.setTouchAttack(a, f, t),
      onToggleDebug: () => this.debug.toggle(),
      onToggleMute: () => {
        this.sfx.setMuted(!this.sfx.muted);
        return this.sfx.muted;
      },
      isMuted: () => this.sfx.muted,
    });
    this.debug = new DebugPanel(
      this.hud.root,
      (s) => {
        this.renderer.debugOptions = { colliders: s.colliders, paths: s.paths };
        this.loop.timeScale = s.fast ? 4 : 1;
      },
      (op, value) => this.pending.push({ t: 'debug', pid: PLAYER_PID, op, value }),
    );

    // 调试：点击地图寻路
    gameEl.addEventListener('pointerdown', (e) => {
      if (!this.debug.state.clickPath) return;
      const p = this.renderer.camera.screenToWorld(e.clientX, e.clientY);
      this.input.actions.push({ k: 'moveTo', x: p.x, y: p.y });
    });

    window.addEventListener('resize', this.onResize);
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private onResize = (): void => {
    this.renderer.resize();
  };

  /** 事件 → 音效（按与自己英雄的距离衰减） */
  private playSounds(events: readonly SimEvent[], heroId: number): void {
    const w = this.world;
    const me = w.get(heroId);
    const vol = (x: number, y: number): number => {
      if (!me) return 0.5;
      const d = Math.hypot(x - me.pos.x, y - me.pos.y);
      return Math.max(0, 1 - d / 22);
    };
    const play = (n: SfxName, x: number, y: number, k = 1): void => this.sfx.play(n, vol(x, y) * k);
    for (const e of events) {
      switch (e.t) {
        case 'damage': {
          const mine = e.src === heroId || e.target === heroId;
          const k = mine ? 1 : 0.5;
          if (e.crit) play('crit', e.x, e.y, k);
          else if (e.impact >= 2) play('heavy', e.x, e.y, k);
          else play('hit', e.x, e.y, k * (e.isAttack ? 0.8 : 1));
          break;
        }
        case 'attackStart': {
          const u = w.get(e.unit);
          if (u && u.kind === 'hero') play(getHero(u.defId).attack.projectile ? 'shoot' : 'swing', u.pos.x, u.pos.y, 0.8);
          break;
        }
        case 'castStart': {
          const u = w.get(e.unit);
          if (u) play('skill', u.pos.x, u.pos.y);
          break;
        }
        case 'dash': {
          const u = w.get(e.unit);
          if (u) play('dash', u.pos.x, u.pos.y);
          break;
        }
        case 'blink':
          play('blink', e.toX, e.toY);
          break;
        case 'area':
          if (e.warn === 0 && e.vfx?.style === 'slam') play('slam', e.x, e.y);
          break;
        case 'levelUp':
          if (e.unit === heroId) this.sfx.play('levelup', 1);
          break;
        case 'castFail':
          if (e.unit === heroId) this.sfx.play('fail', 0.6);
          break;
        case 'recall':
          if (e.unit === heroId && e.state !== 'cancel') this.sfx.play('recall', 0.8);
          break;
        case 'death': {
          const u = w.get(e.unit);
          if (u && u.kind === 'hero') play('death', u.pos.x, u.pos.y);
          break;
        }
        default:
          break;
      }
    }
  }

  private frame = (now: number): void => {
    this.raf = requestAnimationFrame(this.frame);
    const dt = now - this.last;
    this.last = now;
    if (dt > 0) this.fps = this.fps * 0.95 + (1000 / dt) * 0.05;

    const w = this.world;
    const hero = w.heroOf(PLAYER_PID);
    const cam = this.renderer.camera;
    const ms = this.input.mouseScreen;
    this.input.mouseWorld = ms ? cam.screenToWorld(ms.x, ms.y) : null;

    this.pending.push(...this.mapper.build(this.input, w, hero));
    const { alpha } = this.loop.advance(dt);

    const events = w.drainEvents();
    for (const e of events) {
      if (e.t === 'castFail' && hero && e.unit === hero.id) this.hud.toast(e.reason);
      if (e.t === 'recall' && hero && e.unit === hero.id && e.state === 'cancel') this.hud.toast('回城被打断');
      if (e.t === 'kill' && hero) this.hud.pushKill(w, e.killer, e.victim, hero.team);
      if (e.t === 'structureDown' && hero) this.hud.toast(e.team === hero.team ? '我方防御塔被摧毁' : '摧毁敌方防御塔！');
      if (e.t === 'gameOver' && hero) this.onGameOver(e.winner === hero.team);
    }
    this.renderer.handleEvents(events);
    if (hero) this.playSounds(events, hero.id);

    let aim: AimRender | null = null;
    const snap = liveSnapshot(this.input);
    if (hero && snap && this.input.aiming) {
      const slot = this.input.aiming.slot;
      if (slot === 3 || hero.hero!.skillLevels[slot] > 0) {
        aim = { stage: stageOf(hero, slot), preview: this.mapper.preview(w, hero, slot, snap), cancel: this.input.aiming.cancel };
      }
    }
    this.renderer.render(alpha, aim);
    if (hero) this.hud.update(w, hero, this.fps);
    if (now - this.minimapAt > 100 && hero) {
      this.minimapAt = now;
      this.hud.minimap.draw(w, hero.id, cam.viewRect(0));
    }
    this.debug.setStats(
      [
        `FPS ${this.fps.toFixed(0)}  逻辑帧 ${w.tick}`,
        `单帧逻辑耗时 ${this.stepMs.toFixed(2)} ms`,
        `单位 ${w.list.filter((u) => u.alive).length}  弹道 ${w.projectiles.length}  区域 ${w.zones.length}`,
        `A* 上次展开 ${w.astar.lastExpanded} 格`,
        hero ? `位置 (${hero.pos.x.toFixed(1)}, ${hero.pos.y.toFixed(1)})` : '',
      ].join('\n'),
    );
  };

  private onGameOver(win: boolean): void {
    const hero = this.world.heroOf(PLAYER_PID)!;
    const h = hero.hero!;
    const t = Math.floor(this.world.time);
    this.sfx.play(win ? 'levelup' : 'death', 1);
    this.hud.showResult(
      win,
      [
        `对局时长 ${Math.floor(t / 60)} 分 ${t % 60} 秒`,
        `击杀 / 死亡 / 助攻：${h.kills} / ${h.deaths} / ${h.assists}`,
        `补刀 ${h.lastHits}　·　获得金币 ${Math.floor(h.goldEarned)}　·　等级 ${h.level}`,
      ],
      () => location.reload(),
    );
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    this.keyboard.destroy();
    this.hud.destroy();
    this.renderer.destroy();
  }
}
