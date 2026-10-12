"""《大模型养成计划》声音：配音 + 8-bit 芯片配乐 + 音效，全部在这里混成一条 WAV。

配乐用 numpy 现场合成：方波（主旋律、琶音）、三角波（低音）、噪声（鼓）。每一幕一段风格，幕间交叉淡化；
有人说话时配乐自动压低（ducking）。音效按 timeline.json 里的提示点放。

用法：python3 audio.py out/audio.wav
"""
import json
import os
import sys

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly, lfilter

SR = 44100
ROOT = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(ROOT, 'timeline.json')))
DUR = TL['duration'] + 0.5
N = int(DUR * SR)
rng = np.random.default_rng(7)

NOTE = {n: i for i, n in enumerate(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])}


def hz(name, octave):
    return 440.0 * 2 ** ((NOTE[name] + 12 * (octave + 1) - 69) / 12)


def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------------- 波形 ----------------
def pulse(f, n, duty=0.5, phase=0.0):
    t = np.arange(n) / SR
    ph = (f * t + phase) % 1.0
    return np.where(ph < duty, 1.0, -1.0)


def tri(f, n):
    t = np.arange(n) / SR
    ph = (f * t) % 1.0
    return 4 * np.abs(ph - 0.5) - 1


def noise(n):
    return rng.uniform(-1, 1, n)


def env(n, a=0.005, d=0.08, s=0.6, r=0.05):
    e = np.ones(n) * s
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    na = min(na, n); e[:na] = np.linspace(0, 1, na)
    nd2 = min(nd, max(0, n - na)); e[na:na + nd2] = np.linspace(1, s, nd2)
    if nr > 0 and n > nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def lowpass(x, k=0.15):
    return lfilter([k], [1, -(1 - k)], x)


def add(buf, x, t, gain=1.0):
    i = int(t * SR)
    if i >= len(buf) or i + len(x) <= 0:
        return
    if i < 0:
        x = x[-i:]; i = 0
    j = min(len(buf), i + len(x))
    buf[i:j] += x[:j - i] * gain


# ---------------- 配乐 ----------------
# 和弦：根音 + 三和弦（MIDI）
def chord(name):
    q = 'm' if name.endswith('m') else ''
    root = name[:-1] if q else name
    r = 48 + NOTE[root]
    return [r, r + (3 if q else 4), r + 7]


STYLES = {   # 每一幕：速度、和弦进行、各声部开关
    'hook': dict(bpm=88, ch=['Am', 'F', 'C', 'G'], drums=0, arp=0.5, lead=0, bass=0.6, duty=0.25),
    'title': dict(bpm=140, ch=['C', 'F', 'G', 'C'], drums=1, arp=1, lead=1, bass=1, duty=0.5, seed=3),
    'birth': dict(bpm=100, ch=['Dm', 'Dm', 'A#', 'C'], drums=0.4, arp=0.8, lead=0, bass=0.8, duty=0.125),
    'pretrain': dict(bpm=128, ch=['C', 'Am', 'F', 'G'], drums=1, arp=0.7, lead=1, bass=1, duty=0.25, seed=5),
    'base': dict(bpm=112, ch=['F', 'G', 'Em', 'Am'], drums=0.7, arp=0.6, lead=0.7, bass=1, duty=0.5, seed=8),
    'token': dict(bpm=120, ch=['Em', 'C', 'D', 'B'], drums=0.6, arp=0.8, lead=0.6, bass=1, duty=0.125, seed=11),
    'sft': dict(bpm=116, ch=['C', 'G', 'Am', 'F'], drums=0.6, arp=0.6, lead=0.8, bass=0.9, duty=0.5, seed=13, bell=1),
    'rlhf': dict(bpm=132, ch=['F', 'Dm', 'Gm', 'C'], drums=1, arp=0.6, lead=0.9, bass=1, duty=0.25, seed=17, swing=0.12),
    'halluc': dict(bpm=100, ch=['Am', 'Am', 'F', 'E'], drums=0.5, arp=1, lead=0, bass=1, duty=0.125, dark=1),
    'fix': dict(bpm=120, ch=['G', 'D', 'Em', 'C'], drums=0.8, arp=0.7, lead=0.9, bass=1, duty=0.25, seed=19),
    'grads': dict(bpm=124, ch=['C', 'G', 'Am', 'F'], drums=1, arp=0.8, lead=1, bass=1, duty=0.5, seed=23),
    'end': dict(bpm=96, ch=['C', 'Am', 'F', 'G'], drums=0.3, arp=0.7, lead=0.6, bass=0.8, duty=0.25, seed=29),
}


def section(name, dur):
    st = STYLES[name]
    n = int((dur + 1.0) * SR)
    out = np.zeros(n)
    beat = 60 / st['bpm']
    s16 = beat / 4
    rs = np.random.default_rng(st.get('seed', 1))
    nbars = int(dur / (beat * 4)) + 2
    # 预先生成一段 2 小节的旋律动机，后面重复并跟着和弦移调
    motif = [rs.choice([0, 1, 2, 2, 3, 4, -1]) for _ in range(16)]
    rhythm = [rs.random() < 0.55 for _ in range(16)]
    rhythm[0] = True
    for b in range(nbars):
        c = chord(st['ch'][b % len(st['ch'])])
        t0 = b * beat * 4
        # 低音：八分音符，根音与五度交替
        if st['bass']:
            for k in range(8):
                m = c[0] - 12 + (7 if k % 4 == 2 else 0)
                ln = int(beat / 2 * 0.85 * SR)
                add(out, tri(midi_hz(m), ln) * env(ln, d=0.05, s=0.7), t0 + k * beat / 2, 0.22 * st['bass'])
        # 琶音：十六分音符
        if st['arp']:
            for k in range(16):
                m = c[k % 3] + 12 + (12 if (k // 3) % 2 and st.get('dark') else 0)
                ln = int(s16 * 0.7 * SR)
                x = pulse(midi_hz(m), ln, st['duty']) * env(ln, d=0.04, s=0.3)
                sw = st.get('swing', 0) * s16 if k % 2 else 0
                add(out, x, t0 + k * s16 + sw, 0.045 * st['arp'])
        # 主旋律
        if st['lead']:
            scale = sorted(set([x % 12 for x in c] + [(c[0] + 2) % 12, (c[0] + 9) % 12]))
            for k in range(16):
                idx = (b % 2) * 8 + k // 2
                if k % 2 or not rhythm[idx % 16]:
                    continue
                deg = motif[idx % 16]
                if deg < 0:
                    continue
                m = 72 + scale[deg % len(scale)] + 12 * (deg // len(scale))
                ln = int(beat / 2 * 0.9 * SR)
                x = pulse(midi_hz(m), ln, 0.5) * env(ln, d=0.1, s=0.5)
                vib = 1 + 0.004 * np.sin(np.arange(ln) / SR * 2 * np.pi * 6)
                add(out, x * vib, t0 + k * s16, 0.05 * st['lead'])
        if st.get('bell'):
            for k in (0, 6, 10):
                m = c[k % 3] + 24
                ln = int(0.5 * SR)
                x = np.sin(2 * np.pi * midi_hz(m) * np.arange(ln) / SR) * np.exp(-np.arange(ln) / SR * 6)
                add(out, x, t0 + k * s16, 0.06)
        # 鼓
        if st['drums']:
            for k in range(4):
                tt = t0 + k * beat
                if k % 2 == 0:
                    ln = int(0.15 * SR); tt_ = np.arange(ln) / SR
                    kick = np.sin(2 * np.pi * (50 + 120 * np.exp(-tt_ * 30)) * tt_) * np.exp(-tt_ * 18)
                    add(out, kick, tt, 0.35 * st['drums'])
                else:
                    ln = int(0.12 * SR)
                    add(out, lowpass(noise(ln), 0.5) * np.exp(-np.arange(ln) / SR * 25), tt, 0.16 * st['drums'])
                for h in range(2):
                    ln = int(0.03 * SR)
                    hat = noise(ln) * np.exp(-np.arange(ln) / SR * 120)
                    hat = hat - lowpass(hat, 0.3)
                    add(out, hat, tt + h * beat / 2 + (st.get('swing', 0) * beat / 2 if h else 0), 0.07 * st['drums'])
    if st.get('dark'):
        out = lowpass(out, 0.35) * 1.4
    return out[:n]


def music():
    buf = np.zeros(N)
    XF = 0.35
    for sc in TL['scenes']:
        t0, t1 = sc['t0'], sc['t1']
        if sc['name'] == 'title':
            x = section('title', t1 - t0)
        else:
            x = section(sc['name'], t1 - t0)
        ln = int((t1 - t0 + XF) * SR)
        x = x[:ln]
        e = np.ones(len(x))
        f = int(XF * SR)
        e[:f] = np.linspace(0, 1, f)
        e[-f:] = np.linspace(1, 0, f)
        if sc['name'] == 'end':
            e *= np.clip(1 - (np.arange(len(x)) / SR - (t1 - t0 - 3)) / 3, 0, 1)
        if sc['name'] == 'rlhf':      # 警报响起后音乐退下
            alarm = next(c['t'] for c in TL['cues'] if c['name'] == 'alarm') - t0
            tt = np.arange(len(x)) / SR
            e *= np.clip(1 - (tt - alarm + 0.3) / 0.5, 0.25, 1)
        add(buf, x * e, t0 - XF / 2)
    return buf


# ---------------- 音效 ----------------
def tone_seq(notes, step, duty=0.5, g=1.0, decay=10):
    out = np.zeros(int((len(notes) * step + 0.4) * SR))
    for i, m in enumerate(notes):
        if m is None:
            continue
        ln = int(step * 1.6 * SR)
        x = pulse(midi_hz(m), ln, duty) * np.exp(-np.arange(ln) / SR * decay)
        add(out, x, i * step, g)
    return out


def sweep(f0, f1, dur, duty=0.5, kind='pulse'):
    n = int(dur * SR)
    f = np.geomspace(f0, f1, n)
    ph = np.cumsum(f) / SR
    if kind == 'sin':
        return np.sin(2 * np.pi * ph)
    return np.where(ph % 1 < duty, 1.0, -1.0)


def sfx(kind):
    if kind == 'send':
        return sweep(600, 1400, 0.09) * env(int(0.09 * SR), d=0.05, s=0.4) * 0.5
    if kind == 'recv':
        return tone_seq([79, 84], 0.07, 0.25, 0.5)
    if kind == 'stamp':
        n = int(0.4 * SR); tt = np.arange(n) / SR
        thud = np.sin(2 * np.pi * (60 + 80 * np.exp(-tt * 20)) * tt) * np.exp(-tt * 10)
        return thud * 1.2 + lowpass(noise(n), 0.2) * np.exp(-tt * 25) * 0.8
    if kind == 'start':
        return tone_seq([72, 76, 79, 84, 88, 91, 96], 0.05, 0.5, 0.45, 6)
    if kind == 'hatch':
        out = np.zeros(int(2.4 * SR))
        for i, t in enumerate([0.0, 0.35, 0.75, 1.05]):
            ln = int(0.06 * SR)
            add(out, noise(ln) * np.exp(-np.arange(ln) / SR * 60), t, 0.6)
        add(out, tone_seq([84, 88, 91, 96, 100], 0.06, 0.25, 0.4, 5), 1.15)
        return out
    if kind == 'garble':
        out = np.zeros(int(2.3 * SR))
        for i in range(30):
            m = 60 + rng.integers(0, 36)
            ln = int(0.06 * SR)
            add(out, pulse(midi_hz(m), ln, rng.choice([0.125, 0.25, 0.5])) * env(ln, d=0.02, s=0.5), i * 0.075, 0.25)
        return out
    if kind == 'meow':
        n = int(0.5 * SR)
        x = sweep(500, 900, 0.18, kind='sin')
        y = sweep(900, 420, n / SR - 0.18, kind='sin')
        z = np.concatenate([x, y]) * env(n, a=0.03, d=0.2, s=0.6, r=0.15)
        return z * 0.4
    if kind == 'quiz':
        return tone_seq([76, 79, 83, 79], 0.1, 0.25, 0.35)
    if kind == 'wrong':
        return np.concatenate([pulse(140, int(0.18 * SR), 0.5), pulse(110, int(0.32 * SR), 0.5)]) * 0.28
    if kind == 'right':
        return tone_seq([84, 88, 91, 96], 0.07, 0.5, 0.4, 6)
    if kind == 'whoosh':
        out = np.zeros(int(4 * SR))
        for i in range(8):
            n = int(0.35 * SR)
            x = noise(n); x = lowpass(x, 0.08 + 0.3 * np.sin(np.linspace(0, np.pi, n)).mean())
            add(out, x * np.sin(np.linspace(0, np.pi, n)) * 1.4, i * 0.45, 0.4)
        return out
    if kind == 'counter':
        out = np.zeros(int(2.4 * SR))
        for i in range(36):
            t = 2.2 * (i / 36) ** 0.6
            add(out, pulse(1800, int(0.012 * SR), 0.5), t, 0.12)
        add(out, tone_seq([88, 96], 0.08, 0.5, 0.3), 2.2)
        return out
    if kind == 'fire':
        n = int(3.0 * SR)
        x = lowpass(noise(n), 0.15)
        cr = (rng.random(n) > 0.9993) * rng.uniform(0.5, 1, n)
        return (x * 0.5 + cr) * env(n, a=0.3, d=0.1, s=1, r=0.6) * 0.35
    if kind == 'pop':
        return sweep(300, 1200, 0.06) * np.exp(-np.arange(int(0.06 * SR)) / SR * 30) * 0.35
    if kind == 'quest':
        return tone_seq([71, 74, 78, 83, None, 83], 0.09, 0.25, 0.4, 5)
    if kind == 'chop':
        n = int(0.25 * SR)
        x = noise(n); x = x - lowpass(x, 0.2)
        return x * np.exp(-np.arange(n) / SR * 18) * 0.7
    if kind == 'bell':
        out = np.zeros(int(1.6 * SR))
        for i, m in enumerate([88, 84, 88, 84]):
            ln = int(0.7 * SR)
            add(out, np.sin(2 * np.pi * midi_hz(m) * np.arange(ln) / SR) * np.exp(-np.arange(ln) / SR * 4), i * 0.22, 0.4)
        return out
    if kind == 'levelup':
        return tone_seq([72, 76, 79, 84, 79, 84, 88], 0.06, 0.25, 0.4, 5)
    if kind == 'ding':
        return tone_seq([88, 93, 100], 0.08, 0.125, 0.4, 4)
    if kind == 'show':
        return tone_seq([67, 71, 74, 79, None, 79, 83], 0.08, 0.5, 0.35, 5)
    if kind == 'coin':
        return tone_seq([83, 88, 83, 88, 95], 0.05, 0.5, 0.3, 8)
    if kind == 'clap':
        out = np.zeros(int(2.2 * SR))
        for i in range(60):
            ln = int(0.02 * SR)
            x = noise(ln); x = x - lowpass(x, 0.3)
            add(out, x * np.exp(-np.arange(ln) / SR * 150), rng.uniform(0, 1.9), rng.uniform(0.15, 0.35))
        return out
    if kind == 'alarm':
        out = np.zeros(int(5.0 * SR))
        for i in range(6):
            x = np.concatenate([sweep(500, 900, 0.4), sweep(900, 500, 0.4)])
            add(out, x * 0.16, i * 0.8)
        return out
    if kind == 'glitch':
        out = np.zeros(int(0.8 * SR))
        for i in range(10):
            ln = int(rng.uniform(0.02, 0.07) * SR)
            add(out, np.sign(noise(ln)) * 0.3, i * 0.06, 0.5)
        add(out, sweep(1200, 80, 0.5), 0.2, 0.15)
        return out
    if kind == 'fanfare':
        out = np.zeros(int(2.5 * SR))
        add(out, tone_seq([72, 72, 72, 76, None, 72, 76, 79], 0.12, 0.5, 0.3, 3), 0)
        ln = int(1.0 * SR)
        for m in (72, 76, 79, 84):
            add(out, pulse(midi_hz(m), ln, 0.25) * env(ln, d=0.3, s=0.5, r=0.4), 1.0, 0.08)
        return out
    raise ValueError(kind)


def sfx_track():
    buf = np.zeros(N)
    L = {l['id']: l for l in TL['lines']}
    for c in TL['cues']:
        if c['kind'] == 'pop':
            continue
        add(buf, sfx(c['kind']), c['t'], 1.0)
    # 网络梗气泡：一个一个「啵」
    p12 = L['p12']['t0']
    for i in range(7):
        x = sweep(300, 1300, 0.07) * np.exp(-np.arange(int(0.07 * SR)) / SR * 30)
        add(buf, x, p12 + 0.1 + i * 0.22, 0.35)
    add(buf, sweep(250, 1000, 0.12) * np.exp(-np.arange(int(0.12 * SR)) / SR * 15), L['p13']['t0'] - 0.1, 0.5)
    # 毕业卡片翻出来
    g1 = L['g1']['t0']
    for i in range(9):
        add(buf, tone_seq([84 + (i % 3) * 3], 0.05, 0.25, 0.25, 20), g1 + 0.1 + i * 0.62)
    # 「接龙」词块
    q3 = L['q3']['t0']
    for i in range(18):
        add(buf, tone_seq([72 + (i % 4) * 2], 0.04, 0.5, 0.18, 25), q3 + 0.3 + i * 0.32)
    # 资料标签
    p9t0, p9t1 = L['p9']['t0'], L['p9']['t1']
    for i in range(6):
        add(buf, tone_seq([79 + i], 0.05, 0.25, 0.25, 15), p9t0 + 0.15 + i * (p9t1 - p9t0 - 0.3) / 5.2)
    return buf


def voice_track():
    buf = np.zeros(N)
    duck = np.zeros(N)
    for l in TL['lines']:
        if not l['voice']:
            continue
        x, sr = sf.read(os.path.join(ROOT, 'out', 'voice', l['voice']), dtype='float64')
        if x.ndim > 1:
            x = x.mean(1)
        x = resample_poly(x, 147, 80) if sr == 24000 else x
        x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
        add(buf, x, l['t0'], 1.0)
        i0, i1 = int((l['t0'] - 0.1) * SR), int((l['t0'] + len(x) / SR + 0.15) * SR)
        duck[max(0, i0):min(N, i1)] = 1
    # 平滑压低曲线
    k = int(0.12 * SR)
    duck = np.convolve(duck, np.ones(k) / k, mode='same')
    return buf, duck


def main(out):
    m = music()
    s = sfx_track()
    v, duck = voice_track()
    gm = 0.55 - 0.33 * duck
    mix = m * gm + s * 0.55 + v * 1.0
    # 柔和限幅
    mix = np.tanh(mix * 1.1) / 1.1
    mix = np.stack([mix, mix], 1)
    sf.write(out, mix.astype(np.float32), SR)
    print('写出', out, f'{len(mix) / SR:.1f}s', 'peak', float(np.max(np.abs(mix))))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'out', 'audio.wav'))
