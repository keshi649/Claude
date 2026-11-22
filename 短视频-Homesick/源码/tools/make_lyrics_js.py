# 把定稿的逐字时间写成 lyrics.js（画面用）
import json, sys, os
d = os.path.dirname(os.path.abspath(__file__))
L = json.load(open(os.path.join(d, 'lyrics_timed.json')))
out = []
for x in L:
    out.append({'ko': x['ko'], 'zh': x['zh'], 'sec': x.get('sec', ''), 'u': [[u['u'], u['s']] for u in x['units']], 'e': x.get('end', x.get('last_end'))})
js = '// 歌词和逐字时间（成片时间，秒）；由 tools/make_lyrics_js.py 从 tools/lyrics_timed.json 生成\nconst LYR = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')).replace('},{', '},\n{') + ';\n'
open(os.path.join(d, '..', 'lyrics.js'), 'w').write(js)
print(len(out), 'lines')
