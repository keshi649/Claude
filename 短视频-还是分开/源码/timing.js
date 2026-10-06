'use strict';
/* timing.js —— 由 analyze.py 生成，别手改。时间都是歌曲时间（秒，相对于音频开头）。
   节拍网格：在伴奏 onset 包络上搜索恒定速度和相位，全曲没有漂移；强拍取和弦变化最集中的拍位。
   LYR：每个字开口的时刻（Demucs 人声 → wav2vec2 CTC 强制对齐 → 吸附到人声 onset），end 是这一句唱完。
   VOC：人声轨音量包络（30fps，0–1，编码成 0-9A-Za-z）。BEATS：伴奏轨每一拍的力度（0–1）。 */
const SONG_DUR = 65.226;
const BEAT = 0.447795;          // 133.99 BPM
const BEAT0 = 0.292;           // 第 0 拍
const BAR0 = 1.188;           // 第 0 小节的强拍（和弦 IV–V–iii–vi 每小节换一个）
const BAR = 4 * BEAT;
const bar = n => BAR0 + n * BAR;
const ENV_FPS = 30;
const LYR = [
  { s: '你掐灭没吸的烟', t: [0.00, 0.16, 0.54, 0.73, 1.15, 1.45, 1.88], end: 2.51 },
  { s: '大步流星地掠过我向前', t: [3.62, 3.87, 4.06, 4.19, 4.50, 4.73, 5.18, 5.41, 5.80, 6.25], end: 6.69 },
  { s: '我用力去抓你的衣角', t: [7.20, 7.55, 7.66, 7.81, 8.07, 8.59, 8.74, 9.03, 9.44], end: 9.95 },
  { s: '以为我挽留你', t: [10.38, 10.59, 10.71, 11.02, 11.24, 11.45], end: 11.58 },
  { s: '结局就会改变', t: [11.63, 11.84, 12.28, 12.64, 13.06, 13.51], end: 13.66 },
  { s: '你不说一句就要离开', t: [13.91, 14.00, 14.09, 14.18, 14.42, 14.56, 14.76, 15.05, 15.27], end: 15.45 },
  { s: '我在原地喊了又喊', t: [15.74, 15.84, 15.95, 16.19, 16.34, 16.57, 16.78, 17.09], end: 17.47 },
  { s: '你不回头', t: [17.52, 17.75, 17.98, 18.13], end: 18.35 },
  { s: '仿佛就当我不存在', t: [18.40, 18.63, 18.78, 19.04, 19.53, 19.88, 20.21, 20.43], end: 20.70 },
  { s: '我的故事里只有你', t: [21.09, 21.19, 21.29, 21.46, 21.75, 21.97, 22.19, 22.44], end: 22.59 },
  { s: '你却走得迫不及待', t: [22.92, 23.01, 23.11, 23.31, 23.56, 23.82, 24.03, 24.28], end: 24.61 },
  { s: '剩下来的情节全是无奈', t: [24.66, 24.83, 25.15, 25.35, 25.56, 25.80, 26.62, 27.14, 27.62, 28.01], end: 29.57 },
  { s: '竟是空白', t: [30.62, 31.04, 31.29, 32.05], end: 33.95 },
  { s: '我和你猜了又猜', t: [34.53, 34.67, 34.98, 35.18, 35.50, 35.66, 35.91], end: 36.05 },
  { s: '想过再想决定分开', t: [36.10, 36.41, 36.55, 36.74, 37.00, 37.29, 37.45, 37.67], end: 37.96 },
  { s: '为什么我们的结局还是没有例外', t: [38.03, 38.28, 38.63, 38.83, 39.11, 39.27, 39.50, 39.68, 39.88, 40.15, 40.33, 40.61, 40.93, 41.29], end: 41.51 },
  { s: '你说我没有想法', t: [41.76, 41.93, 42.07, 42.38, 42.55, 42.70, 43.06], end: 43.21 },
  { s: '不懂浪漫惹人厌烦', t: [43.26, 43.43, 43.72, 43.90, 44.14, 44.36, 44.50, 44.87], end: 45.09 },
  { s: '为什么曾经不说', t: [45.17, 45.32, 45.73, 45.95, 46.08, 46.35, 46.57], end: 46.99 },
  { s: '却拖到了现在', t: [47.04, 47.23, 47.56, 47.79, 48.15, 48.47], end: 48.79 },
  { s: '我和你吵了又吵', t: [48.84, 49.10, 49.34, 49.45, 49.82, 49.95, 50.15], end: 50.38 },
  { s: '闹过再闹还是分开', t: [50.43, 50.71, 50.86, 51.12, 51.30, 51.59, 51.76, 51.97], end: 52.24 },
  { s: '为什么我在你眼里是如此的不堪', t: [52.49, 52.60, 52.94, 53.12, 53.39, 53.57, 53.75, 54.01, 54.17, 54.47, 54.68, 54.90, 55.25, 55.52], end: 55.81 },
  { s: '我还是追了出去', t: [56.06, 56.26, 56.45, 56.65, 56.87, 57.09, 57.29], end: 57.45 },
  { s: '不想在这傻傻等待', t: [57.52, 57.83, 58.04, 58.28, 58.50, 58.68, 59.08, 59.20], end: 59.42 },
  { s: '最后却看着车门在我面前', t: [59.65, 59.84, 60.10, 60.23, 60.52, 60.69, 60.94, 61.18, 61.39, 61.63, 61.95], end: 62.43 },
  { s: '用力地关', t: [62.80, 62.96, 63.16, 63.67], end: 64.49 },
];
const VOC_S = '0000GXbaZfkkkklllmoqssrponnnmlhcXTSYeijkkkjjorsrqpooonoqsuuuutrqpoonnnnmlkgaSLGC9754322111000000000000000000HTdilkhZWXbdglprqpnmllklllllkifdbdlqssttvvwvskbXafhhhhjknqstuutsrpmkhefjkjlonnmljigimonnkhecZTMGCA876544322SfjjjmnnmkkklmnmlhdcbbflmmmlnppoomiYPJEB87JQVYcbZYXWQKFckoooqpomlkgdelpuvvvvvtsqonljbSLGC9754328WcddcbjmmllkifbXVUVZfijjhhhjjjiihggfdbellkdVSSYdkorssrrrrqpqsrrqnfUUlruuuttssroeciquxyyyyxwvtplihfcUMHD97NaaYXghfdnuxxwwwvuttrollnnljedhjjjjigfffecbbkkkfYPJFCA8WXdnqqoorrpoopsssrojjqvutrnkfbZXWUSSRQLHGGYkoqqqomlifaZdiigaXYdfecXTSSPJFadknpokhkmlgYQTflnnnljheWOIPZmsvwxyzzzzxuromlmqvzzzzxsmhcTMIHQaddgnopqtspmjheaRKGFEB8653QSVffdadijjhffeeffhlmljhfccfnrvvutsrqqqrrrqomibVRMIEBWafecZWVahklkkkllkgVNOfnqpnkfiqtsrnighiifYPJYnuutssssrnjffhjiiilsxxxwurokcUbkprqokiinrttspmlsuttsrkYRNKIFEDCA865CWbdjnprvxyxvrnkhedfkmpqqqpppqsuwxxxwusrqqqqpprtttuuuuuutttvxyzzzzzzzzzzxxyzzzzzxwutspmhdYUNIDA76432211110000355334533211IaikkknnnlkjlrvwwvslgehsuuuzzzzyxwutsssuvurrwyzzzzzyyxyzzzyzzzzzzzzzzzzzzzzzzzzzzzzzyyxxxxyzzyywvsojeWOIDA86432211110glmiebaahkkjihgfbVSRZnxzzzzzzyyxwvvxxxwuqnmmigdemrtuvutpnnmlgnxzzzywqonmkgekswxxxwusrpjcbouvutsppxzzzzywncTNIEIKPVZZcimmljhhlkieboxzzzzzwusroiiuzzzzxvuusmaWhqvxwunhdaZYZotutrpmlljfaVYkouzzzzzzzyxvtrqqpoosxzzzzytfVNHDAcegedekquvvtpkgdccejmmlifedcaYXXbhhgecZabaXVUTgossroidZWRORcfhjihfedbZXVeqxyyxwuqkeaYYWRKFHXeiswwvusnfXRONUYYXVUXdhgfeeedaWRPPbiklnpppppppprssrpmjjpuyzzyxvsokfcaYWSPOhptvxyxwvvyxwussvvvwxyxvrpqsssrttsnmvzzzyxvtrqmfbbgfdaYfkmmlifcZVVZbrzzzzzyvutsrrrstttrpnnonootvwvvwwvuspfYnwzzzzyxutrnejtyyyyxvqjeYPJgmponmmkpxzzzzxshZSMHFNOOOTWaglnmliiiigdYmxzzzzywtvzzxvttssrooqxxwrlknrqoiedkoonnmmonmifffcTMGNmwzzzzzxoehprrpojbYWfquvwwvrhbWTSakmlhbcloonlifbWQLLPSfmqpnlllkfXUUXegihgebYVRRVbinnmjdbccaXSScgiihecbbaXVTfouxzzytjbVROLGC97KUXgptttttqgXRMIHddcTMMfpuutohaVQLKKZmrrqolihgfcZYglnnnmlkihgeacmstsqpnkifcZYcedZUSQOMfottssssrrqolfaVOJGEDCCA7SafffdcbbadedbYXWdggfcaYXYZjnppppooonljiggfedddbaZXUQJFB865332111100000000';
const BEATS_S = 'U6nbwZQKzEuYX6z6iCnLoYMKzifYsMO7kMxTYYYJzZddT5KQmAXHnCX6lCeMeCb4lJrQhbUGzRzFFaCAP88Fj8F8QBCViB8CR86Je9C8Y7HRUBB5I698uED7NDAOY9H6HBDPeCB7OJGJROF990';
