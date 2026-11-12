"""Print `window.LL_ANSWERS = {...};` for one site from ans/out/<site>__<chapter>.json.
Answers are escaped; only <code>, <b>, <strong>, <em>, <i>, <sup>, <sub> and <br> survive as markup."""
import glob, html, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))

def clean(a):
    # Unescape first so an answer that already wrote &lt; is not escaped twice.
    t = html.escape(html.unescape(str(a).strip()), quote=False)
    t = re.sub(r'&lt;(/?)(code|b|strong|em|i|sup|sub)&gt;', r'<\1\2>', t)
    return re.sub(r'&lt;br\s*/?&gt;', '<br>', t)

def answers(site):
    out = {}
    for f in sorted(glob.glob(os.path.join(HERE, 'out', site + '__*.json'))):
        cid = os.path.basename(f)[len(site) + 2:-5]
        try:
            out[cid] = [clean(a) for a in json.load(open(f, encoding='utf-8'))['answers']]
        except Exception as e:
            print(f'skip {f}: {e}', file=sys.stderr)
    return out

def js(site):
    return 'window.LL_ANSWERS = ' + json.dumps(answers(site), ensure_ascii=False).replace('</', '<\\/') + ';\n'

if __name__ == '__main__':
    sys.stdout.write(js(sys.argv[1]))
