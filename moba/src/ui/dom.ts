/** 界面通用的小工具：建元素、颜色转换、全屏、界面缩放 */

export const hex = (c: number): string => `#${c.toString(16).padStart(6, '0')}`;

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, parent?: HTMLElement, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  parent?.appendChild(e);
  return e;
}

export const canFullscreen = (): boolean => typeof document.documentElement.requestFullscreen === 'function' && document.fullscreenEnabled !== false;

/** 切换全屏；手机上顺便锁定横屏 */
export async function toggleFullscreen(): Promise<void> {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    const o = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
    await o.lock?.('landscape').catch(() => undefined);
  } catch {
    // 浏览器不支持时静默忽略
  }
}

/** 按屏幕尺寸计算界面缩放（手机横屏约 0.6，1080p 约 1.2），写入 CSS 变量 --ui */
export function applyUiScale(): void {
  const s = Math.max(0.56, Math.min(1.25, Math.min(window.innerHeight / 650, window.innerWidth / 1150)));
  document.documentElement.style.setProperty('--ui', s.toFixed(3));
}
