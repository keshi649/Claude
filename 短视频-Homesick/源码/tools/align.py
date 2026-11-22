# 逐字（韩文一个音节 / 英文一个词）对齐：MMS_FA，韩文按罗马字母，按 LRC 开窗
import json, sys, re, torch, torchaudio, numpy as np, soundfile as sf
lrc = json.load(open(sys.argv[1]))
voc, sr0 = sf.read(sys.argv[2]); voc = voc.mean(1).astype(np.float32)
wav = torchaudio.functional.resample(torch.from_numpy(voc), sr0, 16000)
SR = 16000
I = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h']
M = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i']
F = ['','k','k','k','n','n','n','t','l','k','m','p','l','l','p','l','m','p','p','t','t','ng','t','t','k','t','p','t']
def rom(syl):
    c = ord(syl) - 0xAC00
    if not (0 <= c < 11172): return None
    return I[c // 588] + M[(c % 588) // 28] + F[c % 28]
def units(text):
    """把一行拆成显示单位：韩文每个音节、英文每个词；返回 [(显示文字, 罗马字母)]"""
    out = []
    for w in text.split(' '):
        if not w: continue
        if re.search('[가-힣]', w):
            for ch in w:
                r = rom(ch)
                if r: out.append((ch, r))
        else:
            r = re.sub("[^a-z]", '', w.lower())
            if r: out.append((w, r))
    return out
bundle = torchaudio.pipelines.MMS_FA
model = bundle.get_model(with_star=True)
tok = bundle.get_tokenizer()
aligner = bundle.get_aligner()
res = []
for i, L in enumerate(lrc):
    a = L['lrc'] - 0.45
    b = (lrc[i+1]['lrc'] + 0.35) if i + 1 < len(lrc) else L['lrc'] + 6
    b = min(b, a + 8.5)
    seg = wav[int(a*SR):int(b*SR)].unsqueeze(0)
    us = units(L['ko'])
    words = ['*'] + [r for _, r in us] + ['*']
    with torch.inference_mode():
        em, _ = model(seg)
    em = torch.log_softmax(em, dim=-1)
    spans = aligner(em[0], tok(words))
    ratio = seg.size(1) / em.size(1) / SR
    out = []
    for (disp, r), sp in zip(us, spans[1:-1]):
        s = a + sp[0].start * ratio; e = a + sp[-1].end * ratio
        sc = float(np.mean([x.score for x in sp]))
        out.append(dict(u=disp, s=round(s, 3), e=round(e, 3), sc=round(sc, 3)))
    res.append(dict(i=i, ko=L['ko'], lrc=L['lrc'], units=out))
    print(i, L['lrc'], ' '.join(f"{o['u']}{o['s']:.2f}" for o in out[:6]), '...', f"{out[-1]['u']}{out[-1]['s']:.2f}-{out[-1]['e']:.2f}", 'min sc', min(o['sc'] for o in out))
json.dump(res, open(sys.argv[3], 'w'), ensure_ascii=False, indent=1)
