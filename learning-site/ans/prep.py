"""Write one input file per chapter that has 思考题: chapter text + numbered questions (same order the layer numbers them)."""
import html, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from build import block_end
HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)

def text(h):
    h = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', h, flags=re.S)
    h = re.sub(r'<pre class="mmd">(.*?)</pre>', lambda m: '\n[图]\n' + m.group(1) + '\n[/图]\n', h, flags=re.S)
    h = re.sub(r'<(h[1-4])[^>]*>(.*?)</\1>', lambda m: '\n' + '#' * int(m.group(1)[1]) + ' ' + re.sub('<[^>]+>', '', m.group(2)) + '\n', h, flags=re.S)
    h = re.sub(r'<li[^>]*>', '\n- ', h); h = re.sub(r'</(p|tr|div|blockquote|table|pre|figure)>', '\n', h); h = re.sub(r'<t[dh][^>]*>', ' | ', h)
    return re.sub(r'\n{3,}', '\n\n', html.unescape(re.sub('<[^>]+>', '', h)))

def questions(h):
    out = []
    for m in re.finditer(r'<(h[23])[^>]*>(.*?)</\1>', h, re.S):
        if '思考题' not in re.sub('<[^>]+>', '', m.group(2)):
            continue
        pos = m.end()
        while True:
            t = re.compile(r'\s*<([a-zA-Z0-9]+)').match(h, pos)
            if not t or t.group(1).lower() in ('h1', 'h2', 'h3'):
                break
            end = block_end(h, pos)
            if t.group(1).lower() in ('ol', 'ul'):
                body = h[t.start():end]
                inner = body[body.index('>') + 1: body.rindex('<')]
                # top-level <li> only
                i = 0
                while True:
                    li = re.compile(r'\s*<li\b').search(inner, i)
                    if not li: break
                    e = block_end(inner, li.start())
                    out.append(re.sub(r'\s+', ' ', html.unescape(re.sub('<[^>]+>', '', inner[li.start():e]))).strip())
                    i = e
                break
            if end <= pos: break
            pos = end
    return out

def emit(site, cid, title, h):
    qs = questions(h)
    if not qs:
        return 0
    with open(os.path.join(HERE, 'in', f'{site}__{cid}.txt'), 'w', encoding='utf-8') as f:
        f.write(f'# 章节：{title}\n\n## 思考题（共 {len(qs)} 题，按顺序作答）\n')
        for i, q in enumerate(qs, 1):
            f.write(f'Q{i}. {q}\n')
        f.write('\n## 章节正文\n' + text(h))
    return len(qs)

n = {}
for site in ['cex', 'contract', 'security']:
    s = open(os.path.join(SITE, site, 'index.html'), encoding='utf-8').read()
    d = json.loads(re.search(r'const DATA = (\{.*?\});\n', s, re.S).group(1))['docs']
    n[site] = sum(emit(site, k, v['title'], v['html']) for k, v in d.items() if k not in ('home', 'guide') and not k.startswith('lab-'))
s = open(os.path.join(SITE, 'sca', 'index.html'), encoding='utf-8').read()
n['sca'] = sum(emit('sca', i, t, b) for i, t, b in re.findall(r'<section class="ch" id="([^"]+)"[^>]*data-title="([^"]*)"[^>]*>(.*?)</section>', s, re.S) if i != 'home')
w = json.load(open(os.path.join(HERE, '..', 'ans', 'web3-docs.json'), encoding='utf-8'))
n['web3'] = sum(emit('web3', k, v['title'], v['html']) for k, v in w.items())
print(n, sum(n.values()), 'questions in', len(os.listdir(os.path.join(HERE, 'in'))), 'files')
