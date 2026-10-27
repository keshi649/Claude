"""把 src/ 里的脚本和播报语音拼成一个能直接打开的网页：峡谷争锋.html。
three.js（r128）在页面里从 cdnjs 加载（src/shell.html 里的 <script src>），不打包进来；没加载上时“加载中”那行字换成提示。
用法：python3 build.py
"""
import base64
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
ORDER = ['data.js', 'sim.js', 'ai.js', 'models.js', 'scene.js', 'render3d.js', 'icons.js', 'hud.js', 'input.js', 'audio.js', 'main.js']
OUT = os.path.join(HERE, '峡谷争锋.html')
GUARD = ("if (typeof THREE === 'undefined') { const b = document.getElementById('bootTxt'); "
         "if (b) b.textContent = '三维引擎没加载上（要联网），请检查网络后刷新。'; throw new Error('three.js 没加载上'); }")


def main():
    for f in ORDER:
        r = subprocess.run(['node', '--check', os.path.join(SRC, f)], capture_output=True, text=True)
        if r.returncode:
            sys.exit(r.stderr)
    js = []
    for f in ORDER:
        s = open(os.path.join(SRC, f), encoding='utf-8').read()
        s = re.sub(r"\nif \(typeof module !== 'undefined'\) module\.exports = \{\};\n?", '\n', s)
        js.append(f'/* ===== {f} ===== */\n' + s)
    # 播报语音
    vdir = os.path.join(HERE, 'voice', 'mp3')
    voice = {}
    if os.path.isdir(vdir):
        for f in sorted(os.listdir(vdir)):
            if f.endswith('.mp3'):
                voice[f[:-4]] = base64.b64encode(open(os.path.join(vdir, f), 'rb').read()).decode()
    js.insert(0, GUARD + '\nconst VOICE = ' + json.dumps(voice) + ';')
    script = '\n'.join(js)
    shell = open(os.path.join(SRC, 'shell.html'), encoding='utf-8').read()
    page = shell.replace('__SCRIPT__', script)
    open(OUT, 'w', encoding='utf-8').write(page)
    kb = os.path.getsize(OUT) / 1024
    print(f'{OUT}：{kb:.0f} KB（脚本 {len(script.encode()) / 1024:.0f} KB，语音 {len(voice)} 句）')


if __name__ == '__main__':
    main()
