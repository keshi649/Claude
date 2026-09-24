import { saveSettings, settings, type CameraDist, type Quality } from '../game/settings';
import { el } from './dom';

/**
 * 设置面板（主菜单与局内共用）：音效、语音播报、画质、帧率显示、镜头远近。
 * 改动立即生效并保存在本机。
 */
export interface SettingsHooks {
  isMuted: () => boolean;
  setMuted: (m: boolean) => void;
  voiceSupported: boolean;
}

export function openSettings(parent: HTMLElement, hooks: SettingsHooks): () => void {
  const modal = el('div', 'set-modal', parent);
  const box = el('div', 'set-box', modal);
  el('h3', '', box, '设置');

  const row = (label: string, hint?: string): HTMLElement => {
    const r = el('div', 'set-row', box);
    const l = el('div', 'set-label', r);
    l.innerHTML = `<b>${label}</b>${hint ? `<small>${hint}</small>` : ''}`;
    return el('div', 'seg', r);
  };
  const seg = <T extends string>(parentEl: HTMLElement, opts: readonly (readonly [T, string])[], get: () => T, set: (v: T) => void): void => {
    const btns: HTMLButtonElement[] = [];
    const refresh = (): void => btns.forEach((b, i) => b.classList.toggle('on', opts[i]![0] === get()));
    for (const [v, text] of opts) {
      const b = el('button', '', parentEl, text);
      b.addEventListener('click', () => {
        set(v);
        refresh();
      });
      btns.push(b);
    }
    refresh();
  };

  seg(row('音效'), [['on', '开'], ['off', '关']] as const, () => (hooks.isMuted() ? 'off' : 'on'), (v) => hooks.setMuted(v === 'off'));
  seg(
    row('语音播报', hooks.voiceSupported ? '第一滴血、多杀、推塔、胜负等语音' : '当前浏览器不支持语音合成'),
    [['on', '开'], ['off', '关']] as const,
    () => (settings.voice ? 'on' : 'off'),
    (v) => {
      settings.voice = v === 'on';
      saveSettings();
    },
  );
  seg(
    row('画质', '低画质可以提高手机帧率、减少发热'),
    [['high', '高'], ['medium', '中'], ['low', '低']] as const,
    () => settings.quality,
    (v: Quality) => {
      settings.quality = v;
      saveSettings();
    },
  );
  seg(
    row('镜头距离', '远：视野更大；近：人物更大'),
    [['near', '近'], ['normal', '标准'], ['far', '远']] as const,
    () => settings.camera,
    (v: CameraDist) => {
      settings.camera = v;
      saveSettings();
    },
  );
  seg(
    row('显示帧率'),
    [['on', '开'], ['off', '关']] as const,
    () => (settings.showFps ? 'on' : 'off'),
    (v) => {
      settings.showFps = v === 'on';
      saveSettings();
    },
  );

  const close = (): void => modal.remove();
  const ok = el('button', 'pill set-ok', box, '完成');
  ok.addEventListener('click', close);
  modal.addEventListener('pointerdown', (e) => {
    if (e.target === modal) close();
  });
  return close;
}
