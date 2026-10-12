window.TEST = function (t) {
  g = MAIN; p = LC;
  R(0, 0, LW, LH, PAL.night2);
  const names = ['xiaomo', 'you', 'deepseek', 'gpt', 'claude', 'gemini', 'doubao', 'kimi', 'qwen', 'grok', 'daiyu', 'lu', 'rater1', 'rater2', 'rater3'];
  names.forEach((n, i) => actor(n, 0.5, 30 + (i % 5) * 52, 80 + Math.floor(i / 5) * 70, { still: true }));
  const ex = ['normal', 'happy', 'blink', 'spiral', 'star', 'x', 'shock', 'smug', 'sweat'];
  ex.forEach((e, i) => put(chibi('xiaomo', e, i % 2 ? 'talk' : 'smile'), 18 + i * 29, 290, { ax: 0.5 }));
  put(PROP.cat(0), 30, 330); put(PROP.catTeacher(), 70, 340); put(PROP.alpaca('n'), 110, 350); put(PROP.egg(2), 140, 340);
  put(PROP.mooncake(), 170, 330); put(PROP.moon(), 200, 330); put(PROP.strawberry(), 230, 330); put(PROP.tree(0), 40, 420); put(PROP.tree(1), 90, 420);
  put(PROP.gpu(1), 140, 380); put(PROP.keyboard(), 200, 380); put(PROP.thumb(1), 140, 410); put(PROP.thumb(0), 160, 410); put(PROP.magnifier(), 190, 420); put(PROP.coin(), 220, 420); put(PROP.heart(), 240, 420); put(PROP.fire(1), 255, 420);
  put(PROP.book('#ef4655', 0), 120, 440); put(PROP.bulb(1), 140, 440); put(PROP.shell(), 170, 445);
  MAIN.drawImage(LO, 0, 0, W, H);
  dialog('h3', 12, { y: 1500 });
  text('像素字体 TOKEN 1,234 测试', 40, 1800, { size: 48 });
};
