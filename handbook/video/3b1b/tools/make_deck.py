#!/usr/bin/env python3
"""Build one chapter's 3b1b-style knowledge deck: a single self-contained HTML file.

Usage: python3 tools/make_deck.py <EPNN-slug> [--out DIR] [--sheet PNG]

Reads  <ep>/deck.json  {chapter, title, sections:{scene: label}, slides:[{scene, lines:[a,b], title, points}], quiz:[{q,a}]}
       <ep>/cues.json  (scene starts, line times, line text)
       output/raw/<ep>.mp4  (the render without subtitles)
Writes DIR/<chNN>.html  (default output/deck/): pictures are inlined as WebP data URIs, so the file
needs nothing else. A page's picture is the frame just after its last narration line has finished;
its 讲稿 is the narration of lines a..b (a closing "下一集…" line is dropped).
--sheet writes a labelled contact sheet of all pages for review.
"""
import base64, html, io, json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H, QUALITY = 1600, 900, 80
SPARSE = 0.012                        # warn when fewer than 1.2% of pixels are brighter than the background
AFTER_MID, AFTER_LAST = 0.35, 0.55   # s after the last line: next line starts at +0.45; the scene fades out at +0.6


def frame(video, t):
    png = subprocess.check_output(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", video, "-frames:v", "1",
                                   "-vf", f"scale={W}:{H}:flags=lanczos", "-f", "image2pipe", "-vcodec", "png", "-"])
    return Image.open(io.BytesIO(png)).convert("RGB")


def webp_uri(im):
    b = io.BytesIO()
    im.save(b, "WEBP", quality=QUALITY, method=6)
    return "data:image/webp;base64," + base64.b64encode(b.getvalue()).decode(), len(b.getvalue())


def main():
    args = sys.argv[1:]
    ep = args[0].rstrip("/")
    out = os.path.join(ROOT, "output", "deck")
    sheet = None
    if "--out" in args:
        out = os.path.abspath(args[args.index("--out") + 1])
    if "--sheet" in args:
        sheet = os.path.abspath(args[args.index("--sheet") + 1])
    spec = json.load(open(os.path.join(ROOT, ep, "deck.json"), encoding="utf-8"))
    cues = json.load(open(os.path.join(ROOT, ep, "cues.json"), encoding="utf-8"))
    scenes = {s["id"]: s for s in cues["scenes"]}
    video = os.path.join(ROOT, "output", "raw", ep + ".mp4")
    if not os.path.exists(video):
        video = os.path.join(ROOT, "output", ep + ".mp4")

    slides, ims, total = [], [], 0
    prev_end = {}
    for s in spec["slides"]:
        sc = scenes[s["scene"]]
        a, b = s["lines"]
        n = len(sc["lines"])
        assert 0 <= a <= b < n, f"{ep}: bad line range {s['lines']} in {s['scene']} ({n} lines)"
        assert prev_end.get(s["scene"], -1) < a, f"{ep}: pages overlap in {s['scene']} at line {a}"
        assert 1 <= len(s["points"]) <= 3, f"{ep}: '{s['title']}' needs 1-3 points"
        prev_end[s["scene"]] = b
        fl = s.get("frame_line", b)   # take the picture from the end of this line (default: the page's last line)
        assert a <= fl <= b, f"{ep}: frame_line {fl} outside {s['lines']}"
        t = sc["start"] + sc["lines"][fl]["e"] + (AFTER_LAST if fl == n - 1 else AFTER_MID)
        im = frame(video, t)
        ink = im.convert("L").resize((400, 225)).point(lambda v: 255 if v > 60 else 0).histogram()[255] / (400 * 225)
        if ink < SPARSE:
            print(f"WARNING {ep} page {len(slides) + 1} '{s['title']}': picture is nearly empty (ink {ink:.3f}) - try frame_line")
        uri, size = webp_uri(im)
        total += size
        notes = [l["text"] for l in sc["lines"][a:b + 1] if not l["text"].startswith("下一集")]
        slides.append(dict(scene=s["scene"], title=s["title"], points=s["points"], notes=notes, img=uri, t=round(t, 2), **({"sources": s["sources"]} if s.get("sources") else {})))
        ims.append((s["title"], im))
    missing = [i for i in scenes if i not in prev_end]
    if missing:
        print("note: scenes without a page:", ", ".join(missing))

    data = dict(chapter=spec["chapter"], title=spec["title"], sections=spec["sections"], slides=slides, quiz=spec.get("quiz", []))
    tpl = open(os.path.join(ROOT, "tools", "deck-viewer.html"), encoding="utf-8").read()
    page = tpl.replace("/*DECK_DATA*/null", json.dumps(data, ensure_ascii=False).replace("</", "<\\/")) \
              .replace("{{TITLE}}", html.escape(spec["title"]))
    os.makedirs(out, exist_ok=True)
    path = os.path.join(out, spec["chapter"].replace("s", "ch", 1) + ".html")
    open(path, "w", encoding="utf-8").write(page)
    print(f"{path}: {len(slides)} pages + {len(data['quiz'])} quiz, {len(page) / 1e6:.2f} MB (pictures {total / 1e6:.2f} MB)")

    if sheet:
        cols, tw = 4, 480
        th = tw * H // W
        rows = (len(ims) + cols - 1) // cols
        font = ImageFont.truetype(os.path.join(ROOT, "tools", ".cache", "NotoSansSC.ttf"), 20)
        img = Image.new("RGB", (cols * tw, rows * (th + 34)), "#1a1a17")
        d = ImageDraw.Draw(img)
        for i, (title, im) in enumerate(ims):
            x, y = (i % cols) * tw, (i // cols) * (th + 34)
            img.paste(im.resize((tw - 4, th - 2)), (x + 2, y + 34))
            d.text((x + 8, y + 5), f"{i + 1} {title}", font=font, fill="#e8e6df")
        img.save(sheet)
        print("sheet", sheet)


main()
