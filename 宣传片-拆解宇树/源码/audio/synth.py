"""配乐和音效用的合成小工具（48 kHz，单声道数组为主，最后再做声像）。"""
import numpy as np
from scipy import signal

SR = 48000
rng = np.random.default_rng(20261101)


def n_(dur):
    return max(1, int(round(dur * SR)))


def t_(dur):
    return np.arange(n_(dur)) / SR


def midi_hz(m):
    return 440.0 * 2 ** ((np.asarray(m, dtype=float) - 69) / 12)


# ---------- 振荡器（带限：polyBLEP） ----------
def _phase(freq, n):
    f = np.broadcast_to(np.asarray(freq, dtype=float), (n,))
    inc = f / SR
    ph = np.cumsum(inc) - inc[0]
    return ph % 1.0, inc


def _blep(t, dt):
    y = np.zeros_like(t)
    m = t < dt
    x = t[m] / dt[m]
    y[m] = x + x - x * x - 1.0
    m2 = t > 1.0 - dt
    x = (t[m2] - 1.0) / dt[m2]
    y[m2] = x * x + x + x + 1.0
    return y


def saw(freq, dur, phase0=0.0):
    n = n_(dur)
    ph, inc = _phase(freq, n)
    ph = (ph + phase0) % 1.0
    return 2 * ph - 1 - _blep(ph, inc)


def square(freq, dur, pw=0.5):
    n = n_(dur)
    ph, inc = _phase(freq, n)
    s = np.where(ph < pw, 1.0, -1.0)
    s += _blep(ph, inc)
    s -= _blep((ph + 1 - pw) % 1.0, inc)
    return s


def sine(freq, dur, phase0=0.0):
    n = n_(dur)
    f = np.broadcast_to(np.asarray(freq, dtype=float), (n,))
    return np.sin(2 * np.pi * (np.cumsum(f) / SR + phase0))


def tri(freq, dur):
    return 2 * np.abs(saw(freq, dur)) - 1


def noise(dur):
    return rng.standard_normal(n_(dur))


# ---------- 包络 ----------
def adsr(dur, a=0.005, d=0.1, s=0.7, r=0.2):
    n = n_(dur)
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-6), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-6)))
    rel = n_(r)
    if rel < n:
        e[-rel:] *= np.linspace(1, 0, rel) ** 2
    return e


def expdec(dur, tau):
    return np.exp(-t_(dur) / tau)


def fade(x, fi=0.002, fo=0.01):
    x = x.copy()
    a, b = n_(fi), n_(fo)
    a, b = min(a, len(x)), min(b, len(x))
    if a > 0:
        x[:a] *= np.linspace(0, 1, a)
    if b > 0:
        x[-b:] *= np.linspace(1, 0, b)
    return x


# ---------- 滤波 ----------
def lp(x, fc, q=0.707, order=2):
    fc = min(fc, SR * 0.45)
    sos = signal.butter(order, fc, 'low', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def hp(x, fc, order=2):
    sos = signal.butter(order, min(fc, SR * 0.45), 'high', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, min(hi, SR * 0.45)], 'band', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def peak(x, fc, gain_db, q=1.0):
    """RBJ 峰值均衡"""
    A = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * fc / SR
    al = np.sin(w0) / (2 * q)
    b = [1 + al * A, -2 * np.cos(w0), 1 - al * A]
    a = [1 + al / A, -2 * np.cos(w0), 1 - al / A]
    return signal.lfilter(np.array(b) / a[0], np.array(a) / a[0], x)


def sweep_lp(x, f0, f1, q=1.0, curve='exp', block=128):
    """截止频率随时间变化的低通（逐块更新系数，带状态）"""
    n = len(x)
    out = np.zeros(n)
    zi = np.zeros(2)
    nb = (n + block - 1) // block
    for i in range(nb):
        k = i / max(nb - 1, 1)
        fc = f0 * (f1 / f0) ** k if curve == 'exp' else f0 + (f1 - f0) * k
        fc = min(max(fc, 20), SR * 0.45)
        w0 = 2 * np.pi * fc / SR
        al = np.sin(w0) / (2 * q)
        cw = np.cos(w0)
        b = np.array([(1 - cw) / 2, 1 - cw, (1 - cw) / 2]) / (1 + al)
        a = np.array([1, -2 * cw / (1 + al), (1 - al) / (1 + al)])
        seg = x[i * block:(i + 1) * block]
        y, zi = signal.lfilter(b, a, seg, zi=zi)
        out[i * block:i * block + len(seg)] = y
    return out


def env_lp(x, env, fmin, fmax, q=0.9, block=64):
    """包络控制的低通：env 是 0–1 数组，和 x 同长"""
    n = len(x)
    out = np.zeros(n)
    zi = np.zeros(2)
    for i in range(0, n, block):
        e = env[min(i, n - 1)]
        fc = min(max(fmin * (fmax / fmin) ** e, 20), SR * 0.45)
        w0 = 2 * np.pi * fc / SR
        al = np.sin(w0) / (2 * q)
        cw = np.cos(w0)
        b = np.array([(1 - cw) / 2, 1 - cw, (1 - cw) / 2]) / (1 + al)
        a = np.array([1, -2 * cw / (1 + al), (1 - al) / (1 + al)])
        seg = x[i:i + block]
        y, zi = signal.lfilter(b, a, seg, zi=zi)
        out[i:i + len(seg)] = y
    return out


# ---------- 效果 ----------
def sat(x, drive=1.5):
    return np.tanh(x * drive) / np.tanh(drive)


def make_ir(dur=2.2, damp=0.35, predelay=0.012, seed=1):
    g = np.random.default_rng(seed)
    n = n_(dur)
    t = np.arange(n) / SR
    env = np.exp(-t / (dur / 6.9))
    ir = np.zeros((n + n_(predelay), 2))
    for c in range(2):
        nz = g.standard_normal(n) * env
        # 越往后越暗
        nz = lp(nz, 9000) * (1 - damp) + lp(nz, 2500) * damp
        ir[n_(predelay):, c] = nz
    ir /= np.sqrt((ir ** 2).sum(axis=0, keepdims=True))
    return ir


_IR = {}


def reverb(x, dur=2.2, wet=0.3, damp=0.35):
    """x: 单声道或立体声；返回立体声（干 + 湿）"""
    key = (dur, damp)
    if key not in _IR:
        _IR[key] = make_ir(dur, damp)
    ir = _IR[key]
    st = to_stereo(x)
    out = np.zeros((len(st) + len(ir) - 1, 2))
    for c in range(2):
        out[:, c] = signal.fftconvolve(st[:, c], ir[:, c])
    out[:len(st)] = out[:len(st)] * wet + st * (1 - wet) * 1.0
    out[len(st):] *= wet
    return out


def to_stereo(x, pan=0.0):
    if x.ndim == 2:
        return x
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    return np.stack([x * l * 1.414, x * r * 1.414], axis=1)


def widen(st, amount=0.3, delay_ms=12):
    d = n_(delay_ms / 1000)
    out = st.copy()
    out[d:, 1] = st[d:, 1] * (1 - amount) + st[:-d, 0] * amount if d > 0 else st[:, 1]
    return out


def delay(st, time=0.375, fb=0.35, mix=0.3, lp_fc=4000):
    st = to_stereo(st)
    d = n_(time)
    out = st.copy()
    tap = st.copy()
    for k in range(1, 6):
        tap = lp(tap.T, lp_fc).T * fb if k > 1 else tap * fb
        sh = np.zeros_like(st)
        if d * k < len(st):
            sh[d * k:] = tap[:len(st) - d * k][:, ::-1] if k % 2 else tap[:len(st) - d * k]
        out += sh * mix
    return out


def limiter(st, ceiling_db=-1.2, look=0.005, release=0.08):
    """前视峰值限幅（立体声联动）"""
    c = 10 ** (ceiling_db / 20)
    a = np.max(np.abs(st), axis=1)
    lk = n_(look)
    # 前视：每点取未来 lk 内的最大值
    from scipy.ndimage import maximum_filter1d
    pk = maximum_filter1d(a, size=2 * lk + 1, origin=0)
    g = np.minimum(1.0, c / np.maximum(pk, 1e-9))
    # 释放平滑：增益只能慢慢回升
    rel = np.exp(-1 / (release * SR))
    out_g = np.empty_like(g)
    cur = 1.0
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else g[i] + (cur - g[i]) * rel
        out_g[i] = cur
    out_g = signal.lfilter([1 - 0.0, ], [1], out_g)
    sm = signal.filtfilt(*signal.butter(1, 400, fs=SR), out_g)
    return st * np.minimum(sm, out_g)[:, None]


def place(bus, x, t, gain=1.0, pan=0.0):
    """把一段声音放到总线（立体声 N×2）的 t 秒处"""
    st = to_stereo(x, pan) * gain
    i = int(round(t * SR))
    if i < 0:
        st = st[-i:]
        i = 0
    j = min(len(bus), i + len(st))
    if j > i:
        bus[i:j] += st[:j - i]
