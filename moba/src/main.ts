import './ui/styles.css';
import { GameSession } from './game/session';
import { HEROES } from './data/heroes';
import { SUMMONERS } from './data/summoners';

/**
 * 入口（局外流程在 M6 实现）。
 * URL 参数：?seed=数字 随机种子；?mode=training 训练场（默认正式对局）；
 * ?hero=英雄id；?summoner=blink|smite|heal|sprint。
 */
const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
document.body.classList.toggle('desktop', !isTouch);

const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed')) || (Date.now() & 0x7fffffff);

const app = document.getElementById('app')!;
const mode = params.get('mode') === 'training' ? 'training' : 'match';
const heroId = HEROES[params.get('hero') ?? ''] ? params.get('hero')! : 'lifeng';
const summoner = SUMMONERS[params.get('summoner') ?? ''] ? params.get('summoner')! : 'blink';
const dp = params.get('difficulty');
const difficulty = dp === 'easy' || dp === 'hard' ? dp : 'normal';
const solo = params.get('solo') === '1';
const session = new GameSession(app, { seed, mode, heroId, summoner, difficulty, solo, startLevel: mode === 'training' ? 4 : 1 });
void session.start();

// 便于在控制台调试
(window as unknown as { game: GameSession }).game = session;
