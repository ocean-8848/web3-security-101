#!/usr/bin/env python3
"""Build a 拟物化知识讲解 slide deck from a finished video episode.

Each video segment (epNN/segK/compositions/story.html) becomes a standalone page that a
parent viewer drives over postMessage (seek / play a time range). Slides come from
epNN/deck.json: {seg, lines:[a,b], title, points}. A slide's picture is the segment's
state just before the next slide's first line starts.

Usage:
  python3 tools/make_deck.py ep11 [ep12 ...]    # writes <repo>/handbook/decks/skeuomorphic/chNN/
  python3 tools/make_deck.py --fonts            # (re)subset shared fonts for every deck present
"""
import glob, html, json, os, re, sys

HF = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HANDBOOK = os.path.expanduser('~/Workon/Learning/web3/web3-security-101/handbook')
OUT = os.path.join(HANDBOOK, 'deck')
GSAP = 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js'
FONTS = [('Noto Sans SC', 'NotoSansSC', '100 900'), ('Noto Serif SC', 'NotoSerifSC', '200 900'),
         ('LXGW WenKai', 'LXGWWenKai-Medium', '500'), ('Smiley Sans', 'SmileySans', '400')]
LEAD = 0.45  # outs/camera moves for a line are scheduled ~0.2 s before it starts

CONTROL = r"""<script>
(function () {
  var SEG = %s, tl = window.__timelines && window.__timelines.story, tw = null;
  function post(k, v) { if (parent !== window) parent.postMessage({ deck: k, seg: SEG, v: v }, '*'); }
  if (!tl) { post('error', 'no timeline'); return; }
  tl.pause(0);
  function stop() { if (tw) { tw.kill(); tw = null; } }
  addEventListener('message', function (e) {
    var m = e.data || {};
    if (m.deck !== 'cmd') return;
    stop(); tl.pause();
    if (m.seek != null) { tl.seek(m.seek, false); post('done', m.seek); }
    else if (m.play) {
      tl.seek(m.play[0], false);
      tw = gsap.to(tl, { time: m.play[1], duration: Math.max(0.05, (m.play[1] - m.play[0]) / (m.rate || 1)), ease: 'none',
        onComplete: function () { tw = null; post('done', m.play[1]); } });
    }
  });
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { post('ready'); });
})();
</script>"""


def seg_page(ep, k):
    src = open(f'{HF}/{ep}/seg{k}/compositions/story.html', encoding='utf-8').read()
    m = re.search(r'<template>(.*)</template>', src, re.S)
    body = m.group(1)
    faces = ''.join(f'@font-face{{font-family:"JetBrains Mono";src:url("../fonts/JetBrainsMono-{w}.woff2") format("woff2");font-weight:{r};font-display:block}}'
                    for w, r in (('400', '100 500'), ('700', '600 900'))) + ''.join(f'@font-face{{font-family:"{fam}";src:url("../fonts/{f}.woff2") format("woff2");font-weight:{w};font-display:block}}'
                    for fam, f, w in FONTS)
    return ('<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">'
            f'<script src="{GSAP}"></script><script>window.__timelines = window.__timelines || {{}};</script><style>{faces}'
            '*{margin:0;padding:0;box-sizing:border-box}html,body{width:1920px;height:1080px;overflow:hidden;background:#efebe3}'
            '#root{position:relative;width:1920px;height:1080px}</style></head><body>'
            + body + CONTROL % json.dumps(str(k)) + '</body></html>')


def slides_for(ep):
    spec = json.load(open(f'{HF}/{ep}/deck.json', encoding='utf-8'))
    timing = {}
    out = []
    for i, s in enumerate(spec['slides']):
        k = str(s['seg'])
        t = timing.setdefault(k, json.load(open(f'{HF}/{ep}/timing/seg{k}.json', encoding='utf-8')))
        a, b = s['lines']
        nxt = spec['slides'][i + 1] if i + 1 < len(spec['slides']) else None
        if nxt and str(nxt['seg']) == k:
            t1 = t['lines'][nxt['lines'][0]]['start'] - LEAD
        else:
            # last slide of a segment: hold just after its last line (skips an end card that follows)
            last = b + 1 < len(t['lines']) and t['lines'][b + 1]['start'] - LEAD or t['total'] - 0.1
            t1 = min(last, t['total'] - 0.1)
        prev = out[-1] if out and out[-1]['seg'] == k else None
        t0 = prev['t1'] if prev else 0.0
        out.append(dict(seg=k, t0=round(t0, 2), t1=round(t1, 2), title=s['title'], points=s['points'],
                        notes=[n for n in (re.sub(r'下一集讲[^。]*。?', '', l['text']).strip() for l in t['lines'][a:b + 1]) if n],
                        section=t['title']))
    kf = f'{HF}/{ep}/deck-keys.json'
    keys = json.load(open(kf)) if os.path.exists(kf) else []
    for i, s in enumerate(out):
        s['k'] = keys[i]['k'] if i < len(keys) and s['t0'] <= keys[i]['k'] <= s['t1'] + 0.01 else s['t1']
    return spec, out


def viewer(spec, slides, nseg):
    data = json.dumps(dict(chapter=spec['chapter'], title=spec['title'], segs=nseg, slides=slides),
                      ensure_ascii=False).replace('</', '<\\/')
    tpl = open(os.path.join(HF, 'tools', 'deck-viewer.html'), encoding='utf-8').read()
    return tpl.replace('/*DECK_DATA*/null', data).replace('{{TITLE}}', html.escape(spec['title']))


def build(ep):
    num = re.sub(r'\D', '', ep)
    spec, slides = slides_for(ep)
    segs = sorted({s['seg'] for s in slides}, key=lambda x: (int(re.match(r'\d+', x).group()), x))
    d = os.path.join(OUT, f'ch{num}')
    os.makedirs(d, exist_ok=True)
    for f in glob.glob(os.path.join(d, '*.html')):
        os.remove(f)
    total = 0
    for k in segs:
        page = seg_page(ep, k)
        open(os.path.join(d, f's{k}.html'), 'w', encoding='utf-8').write(page)
        total += len(page.encode())
    v = viewer(spec, slides, len(segs))
    open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(v)
    print(f'{ep}: {len(slides)} slides, {len(segs)} segment pages, {total / 1e6:.1f} MB -> {d}')


def fonts():
    from fontTools import subset
    chars = set(chr(c) for c in range(0x20, 0x7f)) | set('，。：；！？、（）《》「」“”‘’—…·①②③④⑤⑥⑦⑧⑨⑩→←↑↓×÷≥≤％')
    for f in glob.glob(os.path.join(OUT, 'ch*', '*.html')):
        chars |= set(open(f, encoding='utf-8').read())
    text = ''.join(sorted(c for c in chars if ord(c) >= 0x20))
    src_dir = f'{HF}/ep11/seg1/assets/fonts'
    os.makedirs(os.path.join(OUT, 'fonts'), exist_ok=True)
    import shutil
    for f in ('JetBrainsMono-400.woff2', 'JetBrainsMono-700.woff2'):
        shutil.copyfile(os.path.join(HF, 'tools', 'deck-fonts', f), os.path.join(OUT, 'fonts', f))
    for _, f, _ in FONTS:
        opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']
        font = subset.load_font(f'{src_dir}/{f}.woff2', opts)
        sub = subset.Subsetter(opts); sub.populate(text=text); sub.subset(font)
        dst = os.path.join(OUT, 'fonts', f + '.woff2')
        subset.save_font(font, dst, opts)
        print(f'font {f}: {os.path.getsize(dst) / 1e3:.0f} KB')


if __name__ == '__main__':
    args = sys.argv[1:]
    for a in args:
        if a != '--fonts':
            build(a)
    if '--fonts' in args or not os.path.isdir(os.path.join(OUT, 'fonts')):
        fonts()
