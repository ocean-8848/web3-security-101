#!/usr/bin/env python3
"""Pack each deck's stills (deck/chNN/img/NN.webp) into one sprite deck/chNN/stills.webp.

Grid: 6 columns of 1280x720 tiles, slide i at (i % 6, i // 6). The viewer shows a tile with
background-position, so a chapter's pictures load in one request and the site stays under
the artifact's file-count limit. Usage: python3 tools/deck_sprite.py [ch11 ...] (default: all).
"""
import glob, math, os, shutil, sys
from PIL import Image

DECK = os.path.expanduser('~/Workon/Learning/web3/web3-security-handbook/Web3-Security/deck')
COLS, W, H = 6, 1280, 720

chs = sys.argv[1:] or sorted(os.path.basename(d) for d in glob.glob(os.path.join(DECK, 'ch*')))
for ch in chs:
    files = sorted(glob.glob(os.path.join(DECK, ch, 'img', '*.webp')))
    if not files:
        print(ch, 'no stills'); continue
    rows = math.ceil(len(files) / COLS)
    sheet = Image.new('RGB', (COLS * W, rows * H), (239, 235, 227))
    for i, f in enumerate(files):
        im = Image.open(f).convert('RGB')
        if im.size != (W, H):
            im = im.resize((W, H), Image.LANCZOS)
        sheet.paste(im, ((i % COLS) * W, (i // COLS) * H))
    out = os.path.join(DECK, ch, 'stills.webp')
    sheet.save(out, 'WEBP', quality=76, method=6)
    shutil.rmtree(os.path.join(DECK, ch, 'img'))
    print(f'{ch}: {len(files)} stills -> {os.path.getsize(out) / 1e6:.1f} MB')
