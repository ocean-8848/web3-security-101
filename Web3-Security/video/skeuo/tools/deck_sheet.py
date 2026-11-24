#!/usr/bin/env python3
"""Contact sheet of every slide's end picture for one deck (frames from the segment renders).

Usage: python3 tools/deck_sheet.py ep12 [out.jpg]
Run make_deck.py first. Prints the slide list with times; tiles are in slide order, 6 per row.
"""
import glob, json, os, re, subprocess, sys, tempfile

HF = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DECK = os.path.expanduser('~/Workon/Learning/web3/web3-security-handbook/Web3-Security/deck')

ep = sys.argv[1]
num = re.sub(r'\D', '', ep)
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(tempfile.gettempdir(), f'deck-{ep}.jpg')
h = open(f'{DECK}/ch{num}/index.html', encoding='utf-8').read()
d = json.loads(re.search(r'var D = (\{.*?\});\n', h, re.S).group(1))
tmp = tempfile.mkdtemp()
for i, s in enumerate(d['slides']):
    seg = s['seg']
    vids = sorted(glob.glob(f'{HF}/{ep}/seg{seg}/renders/*nocap*.mp4')) or sorted(glob.glob(f'{HF}/{ep}/seg{seg}/renders/seg{seg}.mp4')) or sorted(glob.glob(f'{HF}/{ep}/seg{seg}/renders/*.mp4'))
    if not vids:
        sys.exit(f'no render for seg{seg}')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(s['t1']), '-i', vids[0], '-frames:v', '1', '-vf', 'scale=480:-1',
                    os.path.join(tmp, f'{i + 1:02d}.png')], check=True)
    print(f'{i + 1:2d} seg{seg} {s["t0"]:6.1f}-{s["t1"]:6.1f} {s["title"]}')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-pattern_type', 'glob', '-i', os.path.join(tmp, '*.png'),
                '-filter_complex', 'tile=6x7:padding=6:color=white', '-frames:v', '1', '-q:v', '4', out], check=True)
print('sheet:', out)
