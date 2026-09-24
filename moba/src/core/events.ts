/**
 * 类型化事件总线。事件表以 { 事件名: 载荷类型 } 描述。
 * 逻辑层把事件写入缓冲，表现层（渲染 / 界面 / 音效）在帧末统一订阅处理。
 */
export type Handler<T> = (payload: T) => void;

export class EventBus<M extends { [K in keyof M]: unknown }> {
  private handlers: { [K in keyof M]?: Handler<M[K]>[] } = {};

  on<K extends keyof M>(type: K, fn: Handler<M[K]>): () => void {
    const list = (this.handlers[type] ??= []);
    list.push(fn);
    return () => this.off(type, fn);
  }

  off<K extends keyof M>(type: K, fn: Handler<M[K]>): void {
    const list = this.handlers[type];
    if (!list) return;
    const i = list.indexOf(fn);
    if (i >= 0) list.splice(i, 1);
  }

  emit<K extends keyof M>(type: K, payload: M[K]): void {
    const list = this.handlers[type];
    if (!list) return;
    for (const fn of list.slice()) fn(payload);
  }

  clear(): void {
    this.handlers = {};
  }
}
