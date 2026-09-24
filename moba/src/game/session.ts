import { FixedStepLoop } from '../core/loop';
import { BALANCE } from '../data/balance';
import { CommandMapper, liveSnapshot } from '../input/commandMapper';
import { KeyboardMouse } from '../input/keyboardMouse';
import { InputState } from '../input/state';
import { GameRenderer, type AimRender } from '../render/renderer';
import type { Command } from '../sim/commands';
import { currentStage } from '../sim/hero';
import { World, type WorldConfig } from '../sim/world';
import { DebugPanel } from '../ui/debugPanel';
import { Hud } from '../ui/hud';

const PLAYER_PID = 1;

/**
 * 一局游戏：把逻辑（World）、渲染、输入、界面串起来。
 * 每帧：输入 → 命令队列 → 固定步长推进逻辑 → 消费事件 → 插值渲染 → 更新界面。
 */
export class GameSession {
  readonly world: World;
  private renderer: GameRenderer;
  private input = new InputState();
  private mapper = new CommandMapper(PLAYER_PID);
  private keyboard: KeyboardMouse;
  private hud!: Hud;
  private debug!: DebugPanel;
  private loop: FixedStepLoop;
  /** 两个逻辑帧之间累积的命令，下一帧统一执行 */
  private pending: Command[] = [];
  private raf = 0;
  private last = 0;
  private fps = 60;
  private stepMs = 0;

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
    this.keyboard = new KeyboardMouse(this.input, { onToggleDebug: () => this.toggleDebug() });
  }

  async start(): Promise<void> {
    const hero = this.world.heroOf(PLAYER_PID)!;
    const gameEl = document.createElement('div');
    gameEl.id = 'game';
    this.container.appendChild(gameEl);
    await this.renderer.init(gameEl);

    this.hud = new Hud(this.container, hero, this.input, {
      onAttack: (a, f) => this.keyboard.setTouchAttack(a, f),
      onToggleDebug: () => this.toggleDebug(),
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

  private toggleDebug(): void {
    this.debug.toggle();
    this.hud.debugBtn.classList.toggle('on', this.debug.visible);
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
    }
    this.renderer.handleEvents(events);

    let aim: AimRender | null = null;
    const snap = liveSnapshot(this.input);
    if (hero && snap && this.input.aiming) {
      const slot = this.input.aiming.slot;
      if (hero.hero!.skillLevels[slot] > 0) {
        const stage = currentStage(hero, slot).stage;
        aim = { stage, preview: this.mapper.preview(w, hero, slot, snap), cancel: this.input.aiming.cancel };
      }
    }
    this.renderer.render(alpha, aim);
    if (hero) this.hud.update(w, hero, this.fps);
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

  destroy(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    this.keyboard.destroy();
    this.hud.destroy();
    this.renderer.destroy();
  }
}
