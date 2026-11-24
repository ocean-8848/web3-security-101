#!/usr/bin/env python3
"""Build the Web3 安全学习站: the handbook page (handbook/dist/index.html) plus the learning layer
(src/: learn.js, visual.js, docs-config.js), reference answers (answers/out) and diagrams (diagrams/out),
with the handbook's labs, example contracts and decks copied alongside.
Usage: python3 learning-site/build.py   (build handbook/tools/build.mjs first)
Output: learning-site/security/ (index.html, preview.html, files.json and supporting files)."""
import glob, html as html_mod, json, os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
NAME = 'security'  # output folder; also the file prefix in answers/ and diagrams/

def files_in(src_dir, dst_prefix, exts):
    out = []
    for dp, dirs, fs in os.walk(src_dir):
        dirs[:] = [d for d in dirs if d not in ('lib', 'out', 'cache', 'node_modules', 'broadcast')]
        for f in sorted(fs):
            if os.path.splitext(f)[1] in exts:
                full = os.path.join(dp, f)
                out.append((dst_prefix + os.path.relpath(full, src_dir), full))
    return out

SITE = dict(
    src=f'{ROOT}/handbook/dist/index.html', title=('Web3 安全学习手册', 'Web3 安全学习站'),
    cfg=dict(key='cshb', name='Web3 安全'), config='docs-config.js',
    aux=lambda: files_in(f'{ROOT}/handbook/interactive', 'interactive/', {'.html', '.css', '.js'})
                + files_in(f'{ROOT}/code', 'code/', {'.sol'})
                + files_in(f'{ROOT}/media/decks/skeuo', 'decks/skeuo/', {'.html', '.woff2', '.webp'})
                + files_in(f'{ROOT}/media/decks/3b1b', 'decks/3b1b/', {'.html'}))

# Old 合约安全学习手册 chapter ids -> Web3 安全学习手册 ids (same map as handbook/tools/build.mjs ALIASES).
REMAP = {f'c{i:02d}': f's{j:02d}' for i, j in zip(range(1, 14), [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 27, 28])}
# Diagrams whose anchor sections were rewritten away (A06 slimmed to a checklist in the Web3 upgrade).
DROP_DIAG = {'a06'}

def remap(key):
    return REMAP.get(key, key)


NOTE = {'flow': '数据流', 'fail': '出错点', 'limit': '局限', 'risk': '风险', 'key': '关键'}

def block_end(h, pos):
    """End index of the first top-level element starting at/after pos (skips whitespace)."""
    m = re.compile(r'\s*<([a-zA-Z0-9]+)[^>]*>').match(h, pos)
    if not m:
        return pos
    tag = m.group(1).lower()
    depth, i = 0, m.start()
    for t in re.finditer(r'<(/?)' + tag + r'\b[^>]*>', h[i:]):
        depth += -1 if t.group(1) else 1
        if depth == 0:
            return i + t.end()
    return m.end()

def figure(d):
    src = html_mod.escape(d['mermaid'], quote=False)
    notes = ''.join(f'<li><strong>{NOTE.get(t, t)}：</strong>{html_mod.escape(x, quote=False)}</li>' for t, x in d['notes'])
    cap = f'<div class="lv-figcap"><span>图 · {html_mod.escape(d["title"])}</span><span class="new">新增图解</span></div>'
    wrap = f'<div class="mmd-wrap"><pre class="mmd">{src}</pre></div>'
    read = f'<p><strong>读图要点：</strong></p>\n<ul>{notes}</ul>'
    return '\n' + cap + wrap + '\n' + read + '\n'

def insert_after_heading(h, after, block):
    want = re.sub(r'\s+', '', after)
    for m in re.finditer(r'<(h[1-4])[^>]*>(.*?)</\1>', h, re.S):
        text = re.sub(r'\s+', '', html_mod.unescape(re.sub('<[^>]+>', '', m.group(2))))
        if text == want:
            nxt = re.compile(r'\s*<(p|div|blockquote|ul|ol)\b').match(h, m.end())
            at = block_end(h, m.end()) if nxt else m.end()
            return h[:at] + block + h[at:], True
    return h, False

def inject_diagrams(html):
    items = {}
    for f in sorted(glob.glob(os.path.join(HERE, 'diagrams', 'out', NAME + '__*.json'))):
        k = os.path.basename(f)[len(NAME) + 2:-5]
        if k in DROP_DIAG: continue
        items[remap(k)] = json.load(open(f, encoding='utf-8'))
    missed = []
    m = re.search(r'const DATA = (\{.*?\});\n', html, re.S)
    data = json.loads(m.group(1))
    for did, ds in items.items():
        doc = data['docs'][did]
        for d in ds:
            doc['html'], ok = insert_after_heading(doc['html'], d['after'], figure(d))
            if not ok: missed.append((did, d['after']))
    dumped = json.dumps(data, ensure_ascii=False).replace('</', '<\\/').replace('<!--', '<\\!--')
    html = html[:m.start(1)] + dumped + html[m.end(1):]
    n = sum(len(v) for v in items.values())
    print(f'{NAME}: injected {n - len(missed)}/{n} diagrams' + (f', missed {missed}' if missed else ''))
    return html

def build():
    s = SITE
    html = open(s['src'], encoding='utf-8').read()
    html = inject_diagrams(html)
    old, new = s['title']
    assert f'<title>{old}</title>' in html[:8192], s['src']
    html = html.replace(f'<title>{old}</title>', f'<title>{new}</title>', 1)
    layer = open(os.path.join(HERE, 'src', 'learn.js'), encoding='utf-8').read()
    cfg = open(os.path.join(HERE, 'src', s['config']), encoding='utf-8').read()
    pre = f'const LL_SITE = {json.dumps(s["cfg"], ensure_ascii=False)};\n'
    visual = open(os.path.join(HERE, 'src', 'visual.js'), encoding='utf-8').read()
    sys.path.insert(0, os.path.join(HERE, 'tools'))
    import emit
    raw = {remap(k): v for k, v in emit.answers(NAME).items()}
    ans = 'window.LL_ANSWERS = ' + json.dumps(raw, ensure_ascii=False).replace('</', '<\\/') + ';\n'
    script = (ans + layer + '\n' + pre + cfg + '\n' + visual).replace('</script', '<\\/script')
    html = html.rstrip() + '\n<script>\n' + script + '\n</script>\n'
    out = os.path.join(HERE, NAME)
    if os.path.isdir(out):
        shutil.rmtree(out)
    os.makedirs(out)
    open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(html)
    manifest = []
    for path, src in s['aux']():
        dst = os.path.join(out, path)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copyfile(src, dst)
        manifest.append(path)
    json.dump(manifest, open(os.path.join(out, 'files.json'), 'w'), indent=0)
    # local preview copy with the skeleton's charset/viewport
    open(os.path.join(out, 'preview.html'), 'w', encoding='utf-8').write(
        '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px -apple-system,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>' + html)
    print(f'{NAME}: index {len(html.encode())} bytes, {len(manifest)} supporting files')

if __name__ == '__main__':
    if any(a != NAME for a in sys.argv[1:]):
        sys.exit(f'usage: python3 build.py [{NAME}]  (other learning sites are built outside this repository)')
    build()
