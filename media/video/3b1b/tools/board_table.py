#!/usr/bin/env python3
"""Print the storyboard shot table (Markdown) for an episode: one shot per narration line.

Usage: python3 tools/board_table.py <episode dir> [shots.json]

shots.json (optional): {"<scene id>": [["画面内容", "动画动作", "屏幕文字"], ...one per line...], ...}
Without it, those three columns are left as TODO. A shot runs from the middle of the pause before
its line to the middle of the pause after it, so the durations add up to the film's length.
"""
import json, os, sys

ep = os.path.abspath(sys.argv[1])
cues = json.load(open(os.path.join(ep, "cues.json")))
shots = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else {}
print("| 镜号 | 时长 | 画面内容 | 动画动作 | 旁白 | 屏幕文字 |")
print("|---|---|---|---|---|---|")
n, total = 0, 0.0
for sc in cues["scenes"]:
    ls = sc["lines"]
    v = shots.get(sc["id"], [["TODO", "TODO", "TODO"]] * len(ls))
    assert len(v) == len(ls), f"{sc['id']}: {len(v)} shots for {len(ls)} lines"
    for i, l in enumerate(ls):
        st = 0 if i == 0 else (ls[i - 1]["e"] + l["s"]) / 2
        en = sc["duration"] if i == len(ls) - 1 else (l["e"] + ls[i + 1]["s"]) / 2
        n += 1
        total += en - st
        a, b, t = v[i]
        print(f"| {n} | {en - st:.1f} 秒 | {a} | {b} | {l['text']} | {t} |")
print(f"\n<!-- {n} 镜，合计 {total:.1f} 秒 -->")
