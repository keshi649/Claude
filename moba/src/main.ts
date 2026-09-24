import './ui/styles.css';
import { GameSession } from './game/session';

/**
 * 入口。M1：直接进入训练场（局外流程在 M6 实现）。
 * URL 参数 ?seed=数字 可指定随机种子。
 */
const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
document.body.classList.toggle('desktop', !isTouch);

const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed')) || (Date.now() & 0x7fffffff);

const app = document.getElementById('app')!;
const session = new GameSession(app, { seed, mode: 'training', heroId: 'lifeng', startLevel: 4 });
void session.start();

// 便于在控制台调试
(window as unknown as { game: GameSession }).game = session;
