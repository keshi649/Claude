"""渲染前检查（build.sh 之前跑一遍，省得渲染到一半才报错）：
1. 每个 .js 用 node --check 查语法；
2. scenes*.js、main.js、audio.py 里写死的 S('编号')、EN、CH('编号', 第几段)、MK、SS('幕名')、SE，
   在 timeline.json 里都找得到（改了旁白分段以后，CH 的段号最容易越界）；
3. audio.py 的 build() 里调用的函数都有定义（从别的集复制过来删改时容易漏，build.sh 跑到音频那步才会报错）。
用法：python3 工具/precheck.py 源码目录（先跑过 narration.py 或 fake_tl.py）"""
import ast
import builtins
import glob
import json
import os
import re
import subprocess
import sys

src = sys.argv[1]
tl = json.load(open(os.path.join(src, 'timeline.json'), encoding='utf-8'))
LN = {l['id']: l for l in tl['lines']}
SC = {s['name'] for s in tl['scenes']}
bad = 0


def problem(msg):
    global bad
    bad += 1
    print('  ✗', msg)


print('1. JS 语法')
for f in sorted(glob.glob(os.path.join(src, '*.js'))):
    r = subprocess.run(['node', '--check', f], capture_output=True, text=True)
    if r.returncode:
        err = r.stderr.strip().splitlines()
        where = next((ln for ln in err if ln.startswith(f)), err[0]).replace(f, os.path.basename(f))
        what = next((ln for ln in err if 'Error' in ln), err[-1])
        problem(f'{where} {what}')

print('2. 时间轴里的编号')
files = sorted(glob.glob(os.path.join(src, 'scenes*.js'))) + [os.path.join(src, n) for n in ('main.js', 'audio.py')]
q = r"""['"]([^'"]+)['"]"""
for f in files:
    if not os.path.exists(f):
        continue
    code = open(f, encoding='utf-8').read()
    name = os.path.basename(f)
    for fn, key in re.findall(r'\b(S|EN)\(\s*' + q + r'\s*\)', code):
        if key not in LN:
            problem(f'{name}：{fn}({key!r}) 没有这句')
    for fn, key in re.findall(r'\b(SS|SE)\(\s*' + q + r'\s*\)', code):
        if key not in SC:
            problem(f'{name}：{fn}({key!r}) 没有这一幕')
    for fn, key, k in re.findall(r'\b(CH|MK)\(\s*' + q + r'\s*,\s*(\d+)\s*\)', code):
        if key not in LN:
            problem(f'{name}：{fn}({key!r}, {k}) 没有这句')
            continue
        n = len(LN[key]['chunks'] if fn == 'CH' else LN[key]['marks'])
        if int(k) >= n:
            problem(f"{name}：{fn}({key!r}, {k}) 越界，这句只有 {n} {'段字幕' if fn == 'CH' else '个标记'}")

print('3. audio.py 里调用的函数')
ap = os.path.join(src, 'audio.py')
if os.path.exists(ap):
    tree = ast.parse(open(ap, encoding='utf-8').read())
    defined = {n.name for n in tree.body if isinstance(n, (ast.FunctionDef, ast.ClassDef))}
    defined |= {t.id for n in tree.body if isinstance(n, ast.Assign) for t in n.targets if isinstance(t, ast.Name)}
    defined |= {(a.asname or a.name).split('.')[0] for n in tree.body if isinstance(n, (ast.Import, ast.ImportFrom)) for a in n.names}
    defined |= set(dir(builtins))
    for fn in (n for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)):
        local = {a.arg for a in fn.args.args} | {t.id for n in ast.walk(fn) if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Store) for t in [n]}
        for c in ast.walk(fn):
            if isinstance(c, ast.Call) and isinstance(c.func, ast.Name) and c.func.id not in defined | local:
                problem(f'audio.py：{fn.name}() 里调用了没定义的 {c.func.id}()')

print('没发现问题' if not bad else f'一共 {bad} 处问题')
sys.exit(1 if bad else 0)
