#!/usr/bin/env python3
"""Build the learning-site editions of the four DATA/section handbooks.

Each edition = the handbook page as currently published + the learning layer,
plus the handbook's supporting files (labs, slides, examples) from the project folders.
Usage: python3 build.py [cex|contract|security|sca ...]
"""
import glob, html as html_mod, json, os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PUB = os.path.expanduser('~/.claude/projects/-Users-k-Workon-Learning-web3/bbc04ca6-cd6d-4953-9130-b4c0641a8d46/tool-results')
SCRATCH = '/private/tmp/claude-501/-Users-k-Workon-Learning-web3/bbc04ca6-cd6d-4953-9130-b4c0641a8d46/scratchpad'

# The published CEX labs carry this snippet before </body>; it hands lab links to the outer reader.
CEX_NAV = """<script>(function(){if(window.parent===window)return;document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;var h=a.getAttribute('href');var m;if((m=h.match(/(?:^|\\/)([\\w-]+)\\.html$/))&&!/^https?:/.test(h)){e.preventDefault();parent.postMessage({cexNav:m[1]==='index'?'labs':'lab-'+m[1]},'*');return;}if(/\\.md(#.*)?$/.test(h)){e.preventDefault();parent.postMessage({cexNavMd:h},'*');}},true);})();</script>"""

def files_in(src_dir, dst_prefix, exts):
    out = []
    for dp, dirs, fs in os.walk(src_dir):
        dirs[:] = [d for d in dirs if d not in ('lib', 'out', 'cache', 'node_modules', 'broadcast')]
        for f in sorted(fs):
            if os.path.splitext(f)[1] in exts:
                full = os.path.join(dp, f)
                out.append((dst_prefix + os.path.relpath(full, src_dir), full))
    return out

SITES = {
    'cex': dict(
        src='artifact-85feec36-1792082050-805b.html', title=('CEX 交易所学习手册', 'CEX 交易所学习站'),
        cfg=dict(key='cexhb', name='CEX 交易所'), config='docs-config.js',
        extra_css='.lv-prog{display:none!important}',  # kept from the live CEX page: reading line hidden there
        aux=lambda: [(p, s, 'cexnav' if p.startswith('interactive/') and p.endswith('.html') else None)
                     for p, s in files_in(f'{ROOT}/CEX/interactive', 'interactive/', {'.html', '.css'})]
                    + [(p, s, None) for p, s in files_in(f'{ROOT}/CEX/video/slides', 'slides/', {'.html', '.css', '.js'}) if 'EP00-template' not in p]
                    + [('slides/index.html', f'{SCRATCH}/cex-pub/slides/index.html', None)]),
    'contract': dict(
        src=f'{ROOT}/Contract/dist/index.html', title=('Web3 合约学习手册', 'Web3 合约学习站'),
        cfg=dict(key='w3chb', name='Web3 合约'), config='docs-config.js',
        aux=lambda: [(p, s, None) for p, s in files_in(f'{ROOT}/Contract/interactive', 'interactive/', {'.html', '.css', '.js'})]),
    'security': dict(
        # Built straight from the Web3 安全学习手册 build output (Web3-Security/tools/build.mjs).
        src=f'{ROOT}/Web3-Security/dist/index.html', title=('Web3 安全学习手册', 'Web3 安全学习站'),
        cfg=dict(key='cshb', name='Web3 安全'), config='docs-config.js',
        aux=lambda: [(p, s, None) for p, s in files_in(f'{ROOT}/Web3-Security/interactive', 'interactive/', {'.html', '.css', '.js'})]
                    + [(p, s, None) for p, s in files_in(f'{ROOT}/Web3-Security/examples', 'examples/', {'.sol'})]),
    'scsec': dict(
        # Independent site: the original 13-chapter smart contract security book (Contract-Security/tools/build.mjs).
        src=f'{ROOT}/Contract-Security/dist/index.html', title=('Web3 智能合约安全手册', 'Web3 智能合约安全学习站'),
        cfg=dict(key='scsb', name='Web3 智能合约安全'), config='docs-config.js',
        aux=lambda: [(p, s, None) for p, s in files_in(f'{ROOT}/Contract-Security/interactive', 'interactive/', {'.html', '.css'})]
                    + [(p, s, None) for p, s in files_in(f'{ROOT}/Contract-Security/examples', 'examples/', {'.sol'})]),
    'sca': dict(
        src='artifact-9a3413f5-1792776906-3336.html', title=('智能合约安全审计 101', '合约审计 101 学习站'),
        cfg=None, config='sca-config.js', aux=lambda: []),
}

# Old 合约安全学习手册 chapter ids -> Web3 安全学习手册 ids (same map as Web3-Security/tools/build.mjs ALIASES).
REMAP = {'security': {f'c{i:02d}': f's{j:02d}' for i, j in zip(range(1, 14), [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 27, 28])}}
# Diagrams whose anchor sections were rewritten away (A06 slimmed to a checklist in the Web3 upgrade).
DROP_DIAG = {'security': {'a06'}}

def remap(name, key):
    return REMAP.get(name, {}).get(key, key)

SKELETON_END = '</style></head><body>'

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

def figure(d, style):
    src = html_mod.escape(d['mermaid'], quote=False)
    notes = ''.join(f'<li><strong>{NOTE.get(t, t)}：</strong>{html_mod.escape(x, quote=False)}</li>' for t, x in d['notes'])
    cap = f'<div class="lv-figcap"><span>图 · {html_mod.escape(d["title"])}</span><span class="new">新增图解</span></div>'
    wrap = f'<div class="mmd-wrap"><pre class="mmd">{src}</pre></div>'
    read = (f'<div class="read"><b>读图要点</b><ul>{notes}</ul></div>' if style == 'sca'
            else f'<p><strong>读图要点：</strong></p>\n<ul>{notes}</ul>')
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

def inject_diagrams(name, html):
    prefix = {'security': 'security', 'scsec': 'security', 'contract': 'contract', 'sca': 'sca'}.get(name)
    if not prefix:
        return html
    items = {}
    for f in sorted(glob.glob(os.path.join(HERE, 'diag', 'out', prefix + '__*.json'))):
        k = os.path.basename(f)[len(prefix) + 2:-5]
        if k in DROP_DIAG.get(name, set()): continue
        items[remap(name, k)] = json.load(open(f, encoding='utf-8'))
    missed = []
    if name == 'sca':
        for sid, ds in items.items():
            m = re.search(r'(<section class="ch" id="' + re.escape(sid) + r'"[^>]*>)(.*?)(</section>)', html, re.S)
            body = m.group(2)
            for d in ds:
                body, ok = insert_after_heading(body, d['after'], figure(d, 'sca'))
                if not ok: missed.append((sid, d['after']))
            html = html[:m.start(2)] + body + html[m.end(2):]
    else:
        m = re.search(r'const DATA = (\{.*?\});\n', html, re.S)
        data = json.loads(m.group(1))
        for did, ds in items.items():
            doc = data['docs'][did]
            for d in ds:
                doc['html'], ok = insert_after_heading(doc['html'], d['after'], figure(d, 'docs'))
                if not ok: missed.append((did, d['after']))
        dumped = json.dumps(data, ensure_ascii=False).replace('</', '<\\/').replace('<!--', '<\\!--')
        html = html[:m.start(1)] + dumped + html[m.end(1):]
    n = sum(len(v) for v in items.values())
    print(f'{name}: injected {n - len(missed)}/{n} diagrams' + (f', missed {missed}' if missed else ''))
    return html

def build(name):
    s = SITES[name]
    html = open(os.path.join(PUB, s['src']), encoding='utf-8').read()
    # drop the platform skeleton the read-back carries; publish re-adds it
    i = html.find(SKELETON_END)
    if html.startswith('<!doctype html><html><head>') and i > 0:
        html = html[i + len(SKELETON_END):]
    if html.rstrip().endswith('</body></html>'):
        html = html.rstrip()[:-len('</body></html>')]
    html = inject_diagrams(name, html)
    old, new = s['title']
    assert f'<title>{old}</title>' in html[:8192], name
    html = html.replace(f'<title>{old}</title>', f'<title>{new}</title>', 1)
    layer = open(os.path.join(HERE, 'learn.js'), encoding='utf-8').read()
    cfg = open(os.path.join(HERE, s['config']), encoding='utf-8').read()
    pre = f'const LL_SITE = {json.dumps(s["cfg"], ensure_ascii=False)};\n' if s['cfg'] else ''
    visual = open(os.path.join(HERE, 'visual.js'), encoding='utf-8').read()
    sys.path.insert(0, os.path.join(HERE, 'ans'))
    import emit
    raw = emit.answers({'cex': 'cex', 'contract': 'contract', 'security': 'security', 'scsec': 'scsec', 'sca': 'sca'}[name])
    raw = {remap(name, k): v for k, v in raw.items()}
    ans = 'window.LL_ANSWERS = ' + json.dumps(raw, ensure_ascii=False).replace('</', '<\\/') + ';\n'
    script = (ans + layer + '\n' + pre + cfg + '\n' + visual).replace('</script', '<\\/script')
    html = html.rstrip() + '\n<script>\n' + script + '\n</script>\n'
    if s.get('extra_css'):
        html += f'<style>{s["extra_css"]}</style>\n'
    out = os.path.join(HERE, name)
    if os.path.isdir(out):
        shutil.rmtree(out)
    os.makedirs(out)
    open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(html)
    manifest = []
    for path, src, patch in s['aux']():
        dst = os.path.join(out, path)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        data = open(src, encoding='utf-8').read()
        if patch == 'cexnav':
            assert '</body>' in data, src
            data = data.replace('</body>', CEX_NAV + '</body>', 1)
        open(dst, 'w', encoding='utf-8').write(data)
        manifest.append(path)
    json.dump(manifest, open(os.path.join(out, 'files.json'), 'w'), indent=0)
    # local preview copy with the skeleton's charset/viewport
    open(os.path.join(out, 'preview.html'), 'w', encoding='utf-8').write(
        '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px -apple-system,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>' + html)
    print(f'{name}: index {len(html.encode())} bytes, {len(manifest)} supporting files')

if __name__ == '__main__':
    for n in sys.argv[1:] or SITES:
        build(n)
