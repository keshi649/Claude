// 时间：成片时间 T = 歌曲时间 t − OFFSET（剪掉歌曲开头 1 秒的静音）。镜头、歌词、音效都按歌曲时间写。
// 节拍由 analyze.py 算出：67 BPM、4/4 拍，一小节 3.582 秒，第 0 小节的强拍在歌曲 0.840 秒；全曲不漂移（各段相位偏差 ≤ 12 ms）。
const OFFSET = 1.0;
const BAR0 = 0.8398, BAR = 3.582179;
const bar = n => BAR0 + n * BAR;
const FPS = 30;
const SONG_END = 282.1;           // 成片在歌曲 282.1 秒处结束（歌尾自然淡出、片尾卡）
const DURATION = SONG_END - OFFSET;

// 歌词：第 i 句、第 k 个字的开始时刻（歌曲时间）
const LY = i => LYRICS[i];
const chT = (i, k) => LYRICS[i].ch[Math.min(k, LYRICS[i].ch.length - 1)][1];
const lineT0 = i => LYRICS[i].ch[0][1];
const lineT1 = i => LYRICS[i].ch[LYRICS[i].ch.length - 1][2];

// 画外音：开头的问话 h1、结尾的问话 e1（成片里放在哪儿，mix.py 也读这里）
const VO = { h1: 1.45, e1: 276.5 };   // 歌曲时间
