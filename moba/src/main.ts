import './ui/styles.css';
import { App } from './game/app';
import { HEROES } from './data/heroes';
import { SUMMONERS } from './data/summoners';
import { loadSetup } from './ui/menu';

/**
 * 入口：默认进入主菜单。
 * 带 URL 参数时跳过菜单直接开局（调试 / 截图用）：
 *   ?seed=数字 随机种子；?mode=training 训练场；?hero=英雄id；?summoner=blink|smite|heal|sprint；
 *   ?difficulty=easy|normal|hard 敌方难度；?solo=1 对局里只有玩家一人。
 */
const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
document.body.classList.toggle('desktop', !isTouch);

const params = new URLSearchParams(location.search);
const app = new App(document.getElementById('app')!);

const direct = ['seed', 'mode', 'hero', 'summoner', 'difficulty', 'solo'].some((k) => params.has(k));
if (direct) {
  const base = loadSetup();
  const dp = params.get('difficulty');
  void app.play(
    {
      mode: params.get('mode') === 'training' ? 'training' : 'match',
      heroId: HEROES[params.get('hero') ?? ''] ? params.get('hero')! : base.heroId,
      summoner: SUMMONERS[params.get('summoner') ?? ''] ? params.get('summoner')! : base.summoner,
      difficulty: dp === 'easy' || dp === 'hard' || dp === 'normal' ? dp : base.difficulty,
    },
    Number(params.get('seed')) || undefined,
    { solo: params.get('solo') === '1' },
  );
} else app.home();
