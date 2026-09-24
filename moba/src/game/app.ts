import { Sfx } from '../audio/sfx';
import { Voice } from '../audio/voice';
import type { MatchSummary } from '../sim/summary';
import { applyUiScale } from '../ui/dom';
import { openSettings } from '../ui/settingsPanel';
import { recordMatch, showHistory } from '../ui/history';
import { HeroSelect, LoadingScreen, MainMenu, ResultScreen, loadSetup, type MatchSetup } from '../ui/menu';
import type { PlayerConfig } from '../sim/world';
import { GameSession, sessionLineup } from './session';

const PLAYER_PID = 1;

/**
 * 局外流程总控：主菜单 → 选英雄 → 加载 → 对局 → 结算 → 再来一局 / 返回主页。
 * 同一时间只存在一个界面或一局对局；切换时销毁上一个（Pixi 画布、DOM、全局监听）。
 * 音效对象全局只有一个。
 */
export class App {
  private readonly sfx = new Sfx();
  private readonly voice = new Voice();
  private screen: { destroy(): void } | null = null;
  private session: GameSession | null = null;
  private setup: MatchSetup = loadSetup();
  /** 每次开局自增，用来丢弃过期的异步开局流程 */
  private playToken = 0;

  constructor(private readonly root: HTMLElement) {
    applyUiScale();
    window.addEventListener('resize', applyUiScale);
  }

  private clear(): void {
    this.playToken++;
    this.screen?.destroy();
    this.screen = null;
    if (this.session) {
      this.session.destroy();
      this.session = null;
      (window as unknown as { game?: GameSession }).game = undefined;
    }
  }

  private click = (): void => this.sfx.play('click', 0.7);

  home(): void {
    this.clear();
    this.screen = new MainMenu(this.root, {
      onPlay: (mode) => this.select(mode),
      onToggleMute: () => {
        this.sfx.setMuted(!this.sfx.muted);
        return this.sfx.muted;
      },
      isMuted: () => this.sfx.muted,
      onClick: this.click,
      onSettings: () =>
        openSettings(this.root, {
          isMuted: () => this.sfx.muted,
          setMuted: (m) => this.sfx.setMuted(m),
          voiceSupported: this.voice.supported,
        }),
      onHistory: () => showHistory(this.root),
    });
  }

  select(mode: 'match' | 'training'): void {
    this.clear();
    this.setup = { ...this.setup, mode };
    this.screen = new HeroSelect(this.root, this.setup, {
      onStart: (s) => void this.play(s),
      onBack: () => this.home(),
      onClick: this.click,
    });
  }

  /** 开一局（seed 不传则随机） */
  async play(s: MatchSetup, seed?: number, opts: { solo?: boolean } = {}): Promise<void> {
    this.clear();
    this.setup = s;
    const token = ++this.playToken;
    const sd = seed ?? ((Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0);
    const match5v5 = s.mode === 'match' && !opts.solo;
    const lineup = match5v5 ? sessionLineup({ seed: sd, heroId: s.heroId, summoner: s.summoner, difficulty: s.difficulty }) : undefined;
    const players: PlayerConfig[] = lineup?.players ?? [{ pid: PLAYER_PID, team: 0, heroId: s.heroId, name: '玩家', isAI: false, summoner: s.summoner }];
    // 先把加载界面画出来，再做建图、生成贴图这些耗时的同步工作
    const loading = new LoadingScreen(this.root, players, PLAYER_PID, s.mode, lineup?.positions);
    const t0 = performance.now();
    await nextPaint();
    if (token !== this.playToken) {
      loading.destroy();
      return;
    }
    const session = new GameSession(this.root, {
      seed: sd,
      mode: s.mode,
      heroId: s.heroId,
      summoner: s.summoner,
      difficulty: s.difficulty,
      solo: opts.solo,
      lineup,
      startLevel: s.mode === 'training' ? 4 : 1,
      sfx: this.sfx,
      voice: this.voice,
      onEnd: (sum) => this.result(sum),
      onQuit: () => this.home(),
    });
    this.session = session;
    (window as unknown as { game?: GameSession }).game = session;
    await session.start();
    if (this.session !== session) {
      loading.destroy();
      return;
    }
    // 加载页至少停留一小会儿，避免一闪而过
    const wait = Math.max(0, 1200 - (performance.now() - t0));
    window.setTimeout(() => loading.destroy(), wait);
  }

  result(sum: MatchSummary): void {
    recordMatch(sum, PLAYER_PID, this.setup);
    this.clear();
    this.screen = new ResultScreen(this.root, sum, PLAYER_PID, {
      onAgain: () => this.select(this.setup.mode),
      onHome: () => this.home(),
      onClick: this.click,
    });
  }
}

/** 等浏览器真正画出一帧（两次 requestAnimationFrame） */
function nextPaint(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}
