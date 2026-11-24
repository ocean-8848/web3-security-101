#!/usr/bin/env python3
"""Check every EPNN-slug/deck.json against its narration (cues.json).

Usage: python3 tools/check_deck.py [EPNN-slug ...]    (default: every episode that has a deck.json)

Hard errors (exit 1): wrong slide count (15-20), quiz != 3, a scene without a page or a section label,
bad line ranges / overlaps, points not 1-3, title > 24 chars, a title > 36 or a point > 70 chars, a point ending in 。 (titles > 24 and points > 40 are warnings).
Warnings (to read by eye): a number in a page or quiz answer that the episode's narration never says
(deck text must not add numbers the video does not state).
"""
import glob, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NUM = re.compile(r"\d[\d,\.]*\d|\d")


def nums(text):
    return {n.replace(",", "").rstrip(".") for n in NUM.findall(text)}


def check(ep):
    errs, warns = [], []
    spec = json.load(open(os.path.join(ROOT, ep, "deck.json"), encoding="utf-8"))
    cues = json.load(open(os.path.join(ROOT, ep, "cues.json"), encoding="utf-8"))
    scenes = {s["id"]: s for s in cues["scenes"]}
    narr = " ".join(l["text"] for s in cues["scenes"] for l in s["lines"])
    said = nums(narr)
    sl = spec["slides"]
    if not 15 <= len(sl) <= 20:
        errs.append(f"{len(sl)} slides (need 15-20)")
    if len(spec.get("quiz", [])) != 3:
        errs.append(f"{len(spec.get('quiz', []))} quiz questions (need 3)")
    if spec["chapter"] != "s" + ep[2:4]:
        errs.append(f"chapter {spec['chapter']} does not match {ep}")
    for sid in scenes:
        if sid not in spec["sections"]:
            errs.append(f"scene {sid} has no section label")
    last = {}
    for i, s in enumerate(sl, 1):
        sc = scenes.get(s["scene"])
        if not sc:
            errs.append(f"page {i}: unknown scene {s['scene']}"); continue
        a, b = s["lines"]
        if not (0 <= a <= b < len(sc["lines"])):
            errs.append(f"page {i}: bad lines {s['lines']}")
        if last.get(s["scene"], -1) >= a:
            errs.append(f"page {i}: overlaps the previous page of {s['scene']}")
        last[s["scene"]] = b
        if not 1 <= len(s["points"]) <= 3:
            errs.append(f"page {i}: {len(s['points'])} points")
        if len(s["title"]) > 36:
            errs.append(f"page {i}: title {len(s['title'])} chars: {s['title']}")
        elif len(s["title"]) > 24:
            warns.append(f"page {i}: title {len(s['title'])} chars: {s['title']}")
        for p in s["points"]:
            if len(p) > 70:
                errs.append(f"page {i}: point {len(p)} chars: {p}")
            elif len(p) > 40:
                warns.append(f"page {i}: point {len(p)} chars")
            if p.endswith("。"):
                errs.append(f"page {i}: point ends with 。")
        extra = nums(s["title"] + " " + " ".join(s["points"])) - said
        if extra:
            warns.append(f"page {i} '{s['title']}': numbers not in narration: {sorted(extra)}")
    for sid in scenes:
        if sid not in last:
            errs.append(f"scene {sid} has no page")
    for j, q in enumerate(spec.get("quiz", []), 1):
        extra = nums(q["q"] + " " + q["a"]) - said
        if extra:
            warns.append(f"quiz {j}: numbers not in narration: {sorted(extra)}")
    return errs, warns


def main():
    eps = sys.argv[1:] or sorted(os.path.basename(os.path.dirname(p)) for p in glob.glob(os.path.join(ROOT, "EP*-*", "deck.json")))
    bad = 0
    for ep in eps:
        try:
            errs, warns = check(ep)
        except Exception as e:  # invalid JSON, missing key
            errs, warns = [f"cannot read: {e}"], []
        print(f"{ep}: {'OK' if not errs else 'ERRORS'}" + (f", {len(warns)} warning(s)" if warns else ""))
        for e in errs:
            print("  ERROR", e)
        for w in warns:
            print("  warn ", w)
        bad += bool(errs)
    print(f"{len(eps)} decks, {bad} with errors")
    sys.exit(1 if bad else 0)


main()
