import './ui/styles.css';
import { GameSession } from './game/session';

/**
 * 入口（局外流程在 M6 实现）。
 * URL 参数：?seed=数字 指定随机种子；?mode=training 进入训练场，默认为正式对局。
 */
const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
document.body.classList.toggle('desktop', !isTouch);

const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed')) || (Date.now() & 0x7fffffff);

const app = document.getElementById('app')!;
const mode = params.get('mode') === 'training' ? 'training' : 'match';
const session = new GameSession(app, { seed, mode, heroId: 'lifeng', startLevel: mode === 'training' ? 4 : 1 });
void session.start();

// 便于在控制台调试
(window as unknown as { game: GameSession }).game = session;
