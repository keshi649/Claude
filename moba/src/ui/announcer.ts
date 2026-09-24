import type { SfxName } from '../audio/sfx';
import { getHero } from '../data/heroes';
import type { SimEvent } from '../sim/events';
import type { World } from '../sim/world';
import { faceHtml } from './portrait';

type KillEvent = Extract<SimEvent, { t: 'kill' }>;

/** 连杀称号（按连杀数，3 起） */
const STREAK_TITLES = ['', '', '', '势不可挡', '锐不可当', '所向披靡', '独步天下'];
const MULTI_TITLES = ['', '', '双杀', '三杀', '四杀', '五杀'];

/**
 * 击杀播报的标题：多杀 > 第一滴血 > 终结 > 连杀称号 > 普通击败。
 * big 表示大号播报（带特殊音效）。
 */
export function killTitle(e: Pick<KillEvent, 'multi' | 'firstBlood' | 'shutdown' | 'streak'>): { text: string; big: boolean } {
  if (e.multi >= 2) return { text: MULTI_TITLES[Math.min(e.multi, 5)]!, big: true };
  if (e.firstBlood) return { text: '第一滴血', big: true };
  if (e.shutdown) return { text: '终结', big: true };
  if (e.streak >= 3) return { text: STREAK_TITLES[Math.min(e.streak, 6)]!, big: true };
  return { text: '击败', big: false };
}

interface Banner {
  html: string;
  cls: string;
  sound: SfxName;
  vol: number;
  dur: number;
  /** 语音播报的文字与优先级（没有则不朗读） */
  speech?: string;
  priority?: number;
}

/**
 * 屏幕上方居中的击杀播报：击杀者头像 · 标题 · 被击杀者头像，己方蓝金色、敌方红色。
 * 播报排队显示，队列过长时丢掉较旧的普通击杀。团灭时追加一条“团灭”。
 */
export class Announcer {
  private readonly el: HTMLElement;
  private queue: Banner[] = [];
  private showingUntil = 0;

  constructor(
    parent: HTMLElement,
    private readonly play: (n: SfxName, vol: number) => void,
    private readonly speak: (text: string, priority: number) => void = () => undefined,
  ) {
    this.el = document.createElement('div');
    this.el.className = 'announcer';
    parent.appendChild(this.el);
  }

  onKill(w: World, e: KillEvent, selfTeam: number, selfId: number): void {
    const victim = w.get(e.victim);
    const killer = w.get(e.killer);
    if (!victim?.hero) return;
    const allyKill = victim.team !== selfTeam;
    const { text, big } = killTitle(e);
    const kFace = killer?.hero ? faceHtml(killer.defId, killer.team) : `<b class="face neutral">${killer?.kind === 'tower' || killer?.kind === 'crystal' ? '塔' : '兵'}</b>`;
    const kName = killer?.hero ? getHero(killer.defId).name : killer?.kind === 'tower' || killer?.kind === 'crystal' ? '防御塔' : '小兵';
    const vName = getHero(victim.defId).name;
    const me = e.killer === selfId ? ' me' : e.victim === selfId ? ' mine-dead' : '';
    const sub = `${kName} 击败了 ${vName}`;
    this.push({
      html: `${kFace}<div class="txt"><b>${text}</b><small>${sub}</small></div>${faceHtml(victim.defId, victim.team)}`,
      cls: `${allyKill ? 'ally' : 'enemy'}${big ? ' big' : ''}${me}`,
      sound: allyKill ? (e.multi >= 3 ? 'multikill' : 'announce') : 'announceBad',
      vol: big || me ? 1 : 0.6,
      dur: big ? 2.4 : 1.7,
      // 语音：大播报都读；普通击杀只读和自己有关的
      speech: big ? text : e.killer === selfId ? '击败敌人' : e.victim === selfId ? '你已阵亡' : undefined,
      priority: big && e.multi >= 2 ? 2 : 1,
    });
    // 团灭：被击杀一方的英雄全部阵亡
    const team = w.list.filter((u) => u.hero && u.team === victim.team);
    if (team.length >= 2 && team.every((u) => !u.alive)) {
      this.push({
        html: `<div class="txt"><b>团灭</b><small>${allyKill ? '敌方' : '我方'}英雄全部阵亡</small></div>`,
        cls: `${allyKill ? 'ally' : 'enemy'} big ace`,
        sound: allyKill ? 'multikill' : 'announceBad',
        vol: 1,
        dur: 2.6,
        speech: '团灭',
        priority: 2,
      });
    }
  }

  /** 通用播报（Boss、推塔等），不排挤击杀播报 */
  pushText(text: string, sub: string, ally: boolean): void {
    this.push({ html: `<div class="txt"><b>${text}</b><small>${sub}</small></div>`, cls: `${ally ? 'ally' : 'enemy'} big`, sound: ally ? 'announce' : 'announceBad', vol: 0.8, dur: 2.2, speech: text });
  }

  private push(b: Banner): void {
    this.queue.push(b);
    // 最多积压 3 条：优先丢掉普通击杀
    while (this.queue.length > 3) {
      const i = this.queue.findIndex((x) => !x.cls.includes('big'));
      this.queue.splice(i >= 0 ? i : 0, 1);
    }
  }

  /** 每帧调用（now 为毫秒） */
  tick(now: number): void {
    if (now < this.showingUntil) return;
    const b = this.queue.shift();
    if (!b) {
      if (this.el.firstChild && now >= this.showingUntil) this.el.replaceChildren();
      return;
    }
    const row = document.createElement('div');
    row.className = `banner ${b.cls}`;
    row.innerHTML = b.html;
    row.style.setProperty('--dur', `${b.dur}s`);
    this.el.replaceChildren(row);
    this.play(b.sound, b.vol);
    if (b.speech) this.speak(b.speech, b.priority ?? 1);
    this.showingUntil = now + b.dur * 1000;
  }
}
