/**
 * 程序合成音效（Web Audio，不使用任何音频文件）。
 * 浏览器要求用户交互后才能出声：首次触摸 / 按键时自动解锁。
 */
export type SfxName =
  | 'swing'
  | 'hit'
  | 'crit'
  | 'heavy'
  | 'skill'
  | 'dash'
  | 'blink'
  | 'slam'
  | 'levelup'
  | 'click'
  | 'fail'
  | 'recall'
  | 'shoot'
  | 'death'
  | 'announce'
  | 'announceBad'
  | 'multikill'
  | 'victory'
  | 'defeat';

const MUTE_KEY = 'jinghe.mute';

export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  muted = false;
  /** 同名音效的限流（避免同一帧叠加太多） */
  private lastPlay = new Map<string, number>();

  constructor() {
    try {
      this.muted = localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      this.muted = false;
    }
    const unlock = (): void => {
      this.ensure();
      void this.ctx?.resume();
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
  }

  setMuted(m: boolean): void {
    this.muted = m;
    try {
      localStorage.setItem(MUTE_KEY, m ? '1' : '0');
    } catch {
      // 隐私模式下不可写，忽略
    }
    if (this.master) this.master.gain.value = m ? 0 : 0.55;
  }

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.55;
    const comp = this.ctx.createDynamicsCompressor();
    this.master.connect(comp);
    comp.connect(this.ctx.destination);
    const len = this.ctx.sampleRate;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return this.ctx;
  }

  private noise(t: number, dur: number, f0: number, f1: number, q: number, vol: number, type: BiquadFilterType = 'bandpass'): void {
    const c = this.ctx!;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = c.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.02, dur * 0.2));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.master!);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
  }

  private tone(t: number, dur: number, f0: number, f1: number, vol: number, type: OscillatorType = 'sine'): void {
    const c = this.ctx!;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master!);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  /** 播放音效；vol 为 0~1（按与玩家的距离衰减后传入） */
  play(name: SfxName, vol = 1): void {
    if (this.muted || vol <= 0.02) return;
    const c = this.ensure();
    if (!c || c.state !== 'running') return;
    const now = performance.now();
    if (now - (this.lastPlay.get(name) ?? 0) < 35) return;
    this.lastPlay.set(name, now);
    const t = c.currentTime;
    const v = Math.min(1, vol);
    switch (name) {
      case 'swing':
        this.noise(t, 0.16, 900, 3500, 1.2, 0.35 * v);
        break;
      case 'hit':
        this.noise(t, 0.09, 2400, 600, 0.9, 0.5 * v);
        this.tone(t, 0.1, 180, 70, 0.4 * v, 'triangle');
        break;
      case 'crit':
        this.noise(t, 0.12, 3000, 700, 0.8, 0.6 * v);
        this.tone(t, 0.14, 240, 60, 0.55 * v, 'triangle');
        this.tone(t, 0.25, 1600, 1200, 0.18 * v, 'square');
        break;
      case 'heavy':
        this.tone(t, 0.35, 120, 38, 0.8 * v, 'sine');
        this.noise(t, 0.25, 800, 120, 0.7, 0.55 * v, 'lowpass');
        break;
      case 'skill':
        this.noise(t, 0.28, 500, 4200, 2.5, 0.35 * v);
        break;
      case 'dash':
        this.noise(t, 0.22, 2400, 500, 1.4, 0.4 * v);
        break;
      case 'blink':
        this.tone(t, 0.25, 500, 1800, 0.3 * v, 'sine');
        this.noise(t, 0.2, 5000, 2000, 3, 0.2 * v);
        break;
      case 'slam':
        this.tone(t, 0.5, 90, 30, 0.9 * v, 'sine');
        this.noise(t, 0.4, 600, 80, 0.6, 0.7 * v, 'lowpass');
        break;
      case 'levelup':
        [523, 659, 784, 1047].forEach((f, i) => this.tone(t + i * 0.07, 0.3, f, f, 0.22 * v, 'triangle'));
        break;
      case 'click':
        this.tone(t, 0.05, 1200, 900, 0.15 * v, 'square');
        break;
      case 'fail':
        this.tone(t, 0.18, 220, 180, 0.2 * v, 'sawtooth');
        break;
      case 'recall':
        [880, 1109, 1319].forEach((f, i) => this.tone(t + i * 0.1, 0.5, f, f * 1.01, 0.12 * v, 'sine'));
        break;
      case 'shoot':
        this.noise(t, 0.12, 1800, 900, 2, 0.25 * v);
        break;
      case 'death':
        this.tone(t, 0.6, 300, 60, 0.4 * v, 'sawtooth');
        break;
      case 'announce':
        // 己方击杀：明亮的上行两音 + 金属闪光
        this.tone(t, 0.22, 659, 659, 0.22 * v, 'triangle');
        this.tone(t + 0.1, 0.45, 988, 988, 0.24 * v, 'triangle');
        this.noise(t + 0.1, 0.35, 7000, 4000, 2, 0.08 * v, 'highpass');
        break;
      case 'announceBad':
        // 敌方击杀：低沉的下行两音
        this.tone(t, 0.25, 392, 392, 0.2 * v, 'triangle');
        this.tone(t + 0.14, 0.5, 294, 280, 0.22 * v, 'triangle');
        break;
      case 'multikill':
        // 多杀：快速上行琶音 + 低音冲击
        [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(t + i * 0.05, 0.4, f, f, 0.18 * v, 'triangle'));
        this.tone(t, 0.5, 110, 45, 0.6 * v, 'sine');
        this.noise(t + 0.2, 0.6, 8000, 3000, 1.5, 0.1 * v, 'highpass');
        break;
      case 'victory':
        [
          [523, 659, 784],
          [587, 740, 880],
          [659, 831, 988, 1319],
        ].forEach((chord, i) => chord.forEach((f) => this.tone(t + i * 0.28, i === 2 ? 1.6 : 0.35, f, f, 0.14 * v, 'triangle')));
        this.tone(t, 0.8, 130, 65, 0.5 * v, 'sine');
        break;
      case 'defeat':
        [440, 415, 392, 330].forEach((f, i) => this.tone(t + i * 0.3, i === 3 ? 1.4 : 0.4, f, f * 0.99, 0.18 * v, 'triangle'));
        this.tone(t + 0.9, 1.2, 98, 60, 0.4 * v, 'sine');
        break;
    }
  }
}
