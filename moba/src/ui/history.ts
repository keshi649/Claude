import { getHero } from '../data/heroes';
import { DIFFICULTY_NAMES, type Difficulty } from '../sim/ai/difficulty';
import type { MatchSummary } from '../sim/summary';
import { el } from './dom';
import { portrait } from './portrait';

/**
 * 历史战绩（对标手游的战绩页）：每局结束后记录一条，最多保留 30 条。
 * 只存在本机 localStorage（读写失败时忽略，不影响游戏）。
 */
export interface MatchRecord {
  date: number;
  heroId: string;
  win: boolean;
  k: number;
  d: number;
  a: number;
  score: number;
  mvp: boolean;
  minutes: number;
  difficulty: Difficulty;
}

const KEY = 'jinghe.history';

export function loadHistory(): MatchRecord[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]') as MatchRecord[];
    return Array.isArray(raw) ? raw.filter((r) => r && typeof r.heroId === 'string') : [];
  } catch {
    return [];
  }
}

export function recordMatch(sum: MatchSummary, selfPid: number, setup: { mode: string; difficulty: Difficulty }): void {
  if (setup.mode !== 'match' || sum.winner === null) return;
  const me = sum.players.find((p) => p.pid === selfPid);
  if (!me) return;
  const rec: MatchRecord = {
    date: Date.now(),
    heroId: me.heroId,
    win: sum.winner === me.team,
    k: me.kills,
    d: me.deaths,
    a: me.assists,
    score: me.score,
    mvp: me.mvp !== null,
    minutes: Math.round((sum.duration / 60) * 10) / 10,
    difficulty: setup.difficulty,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify([rec, ...loadHistory()].slice(0, 30)));
  } catch {
    // 隐私模式不可写，忽略
  }
}

export function showHistory(parent: HTMLElement): void {
  const list = loadHistory();
  const modal = el('div', 'set-modal', parent);
  const box = el('div', 'set-box hist-box', modal);
  el('h3', '', box, '历史战绩');
  if (list.length === 0) {
    el('p', 'hist-empty', box, '还没有对局记录，去打一局吧！');
  } else {
    const wins = list.filter((r) => r.win).length;
    const mvps = list.filter((r) => r.mvp).length;
    const avg = list.reduce((s, r) => s + r.score, 0) / list.length;
    const sumEl = el('div', 'hist-sum', box);
    sumEl.innerHTML = `<span>场次 <b>${list.length}</b></span><span>胜率 <b>${Math.round((wins / list.length) * 100)}%</b></span><span>MVP <b>${mvps}</b></span><span>平均评分 <b>${avg.toFixed(1)}</b></span>`;
    const rows = el('div', 'hist-list', box);
    for (const r of list) {
      const d = new Date(r.date);
      const when = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      const row = el('div', `hist-row ${r.win ? 'win' : 'lose'}`, rows);
      row.innerHTML = `<img src="${portrait(r.heroId)}" alt=""><b class="res">${r.win ? '胜利' : '失败'}</b><span class="nm">${getHero(r.heroId).name}</span>
        <span class="kda">${r.k}/${r.d}/${r.a}</span><span class="sc">${r.score.toFixed(1)}${r.mvp ? '<i class="mvp">MVP</i>' : ''}</span>
        <small>${DIFFICULTY_NAMES[r.difficulty]} · ${r.minutes} 分钟 · ${when}</small>`;
    }
  }
  const ok = el('button', 'pill set-ok', box, '关闭');
  ok.addEventListener('click', () => modal.remove());
  modal.addEventListener('pointerdown', (e) => {
    if (e.target === modal) modal.remove();
  });
}
