/**
 * 玩家设置（对标手游的设置面板）：语音播报、画质、帧率显示、镜头远近。
 * 音效开关由 Sfx 自己保存。设置只存在本机 localStorage（读写失败时用默认值）。
 */
export type Quality = 'high' | 'medium' | 'low';
export type CameraDist = 'near' | 'normal' | 'far';

export interface Settings {
  voice: boolean;
  quality: Quality;
  showFps: boolean;
  camera: CameraDist;
}

const KEY = 'jinghe.settings';

const DEFAULTS: Settings = { voice: true, quality: 'high', showFps: true, camera: 'normal' };

function load(): Settings {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<Settings> | null;
    if (!raw) return { ...DEFAULTS };
    return {
      voice: raw.voice !== false,
      quality: raw.quality === 'medium' || raw.quality === 'low' ? raw.quality : 'high',
      showFps: raw.showFps !== false,
      camera: raw.camera === 'near' || raw.camera === 'far' ? raw.camera : 'normal',
    };
  } catch {
    return { ...DEFAULTS };
  }
}

/** 全局设置（可变），改动后调用 saveSettings 通知监听者 */
export const settings: Settings = load();

const listeners = new Set<() => void>();

export function onSettingsChange(f: () => void): () => void {
  listeners.add(f);
  return () => listeners.delete(f);
}

export function saveSettings(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // 隐私模式不可写，忽略
  }
  for (const f of listeners) f();
}

/** 画质 → 渲染分辨率上限（手机再多一档限制，省填充率） */
export function resolutionFor(q: Quality): number {
  const dpr = window.devicePixelRatio || 1;
  const touch = matchMedia('(pointer: coarse)').matches;
  const cap = q === 'high' ? (touch ? 1.5 : 2) : q === 'medium' ? (touch ? 1.15 : 1.5) : 1;
  return Math.min(dpr, cap);
}

/** 镜头远近 → 缩放倍率（远 = 看得更多） */
export function zoomScaleFor(c: CameraDist): number {
  return c === 'far' ? 0.85 : c === 'near' ? 1.12 : 1;
}
