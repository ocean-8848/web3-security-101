#!/usr/bin/env python3
"""Subset Noto Sans SC (OFL) to the characters an episode uses, as assets/fonts/noto-sc.woff2.

Usage: python3 tools/subset_font.py <NotoSansSC[wght].ttf> <episode dir>
Get the source font from https://github.com/google/fonts/tree/main/ofl/notosanssc .
Re-run after changing any on-screen text.
"""
import glob, os, sys
from fontTools import subset

src, ep = sys.argv[1], os.path.abspath(sys.argv[2])
text = set()
for p in glob.glob(os.path.join(ep, "*.html")) + glob.glob(os.path.join(ep, "compositions", "*.html")) + [os.path.join(ep, "narration.json")]:
    text |= set(open(p, encoding="utf-8").read())
text |= set("0123456789０１２３４５６７８９ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,:;!?()[]{}<>+-=≥≤×·…—–/\\'\"%#$&*_|~ ，。：；！？（）「」、①②③④⑤⑥✓✕→←↑↓")
out = os.path.join(ep, "assets", "fonts", "noto-sc.woff2")
os.makedirs(os.path.dirname(out), exist_ok=True)
opts = subset.Options()
opts.flavor = "woff2"
opts.layout_features = ["*"]
f = subset.load_font(src, opts)
s = subset.Subsetter(opts)
s.populate(text="".join(sorted(text)))
s.subset(f)
subset.save_font(f, out, opts)
print(out, os.path.getsize(out) // 1024, "KB,", len(text), "chars")
