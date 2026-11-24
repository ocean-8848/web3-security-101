#!/usr/bin/env python3
"""Write <ep>/<name>.srt from <ep>/cues.json (one subtitle per narration line).

Usage: python3 tools/srt.py <episode dir> <output .srt>
"""
import json, os, sys

ep, out = os.path.abspath(sys.argv[1]), sys.argv[2]
cues = json.load(open(os.path.join(ep, "cues.json")))


def ts(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


n, rows = 0, []
for sc in cues["scenes"]:
    for l in sc["lines"]:
        n += 1
        rows.append(f"{n}\n{ts(sc['start'] + l['s'])} --> {ts(sc['start'] + l['e'])}\n{l['text']}\n")
open(out, "w", encoding="utf-8").write("\n".join(rows))
print(out, n, "subtitles")
