import { settings } from '../game/settings';

/**
 * 语音播报（对标手游的“第一滴血”“双杀”“全军出击”）：
 * 用浏览器自带的语音合成（Web Speech API）朗读播报文字，不使用任何音频文件。
 * 浏览器不支持或设置里关闭时静默。高优先级的播报会打断正在读的低优先级播报。
 */
export class Voice {
  private speakingPriority = 0;
  private zh: SpeechSynthesisVoice | null = null;

  constructor() {
    if (!this.supported) return;
    const pick = (): void => {
      const list = window.speechSynthesis.getVoices();
      this.zh = list.find((v) => v.lang === 'zh-CN') ?? list.find((v) => v.lang.startsWith('zh')) ?? null;
    };
    pick();
    window.speechSynthesis.addEventListener?.('voiceschanged', pick);
  }

  get supported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  }

  /** priority：1 普通（击杀、推塔），2 重要（多杀、团灭、胜负） */
  say(text: string, priority = 1): void {
    if (!settings.voice || !this.supported) return;
    const synth = window.speechSynthesis;
    if (synth.speaking) {
      if (priority <= this.speakingPriority) return;
      synth.cancel();
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    if (this.zh) u.voice = this.zh;
    u.rate = 1.1;
    u.pitch = 0.85;
    u.volume = 1;
    this.speakingPriority = priority;
    u.onend = () => (this.speakingPriority = 0);
    synth.speak(u);
  }

  stop(): void {
    if (this.supported) window.speechSynthesis.cancel();
    this.speakingPriority = 0;
  }
}
