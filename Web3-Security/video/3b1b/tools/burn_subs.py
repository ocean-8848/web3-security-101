#!/usr/bin/env python3
"""Burn Chinese subtitles into a rendered episode without covering the picture.

Usage: python3 tools/burn_subs.py <episode dir> <raw.mp4> <out.mp4> [out.srt]

The picture is scaled to 88% (1690×950) and placed at the top centre; the 130 px band underneath
(the film's own background colour) holds the subtitles, so no subtitle ever covers a drawing.
Each narration line is split at punctuation into chunks of at most ~24 characters; a chunk's time
is its share (by character count) of the line's span in cues.json. The same chunks are written to
the .srt so the soft and burned subtitles match.
"""
import json, os, re, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

W, H = 1920, 1080
PW, PH = 1690, 950           # picture after scaling (16:9, even sizes)
PX = (W - PW) // 2           # picture x offset
BAND = H - PH                # subtitle band height (130 px)
BG = "#0f1117"
FONT = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cache", "NotoSansSC.ttf")
SIZE, MAXW = 42, 26          # font px; max weight per chunk (CJK char = 1, ASCII = 0.55)

ep, raw, out = (os.path.abspath(a) for a in sys.argv[1:4])
srt_out = sys.argv[4] if len(sys.argv) > 4 else None
cues = json.load(open(os.path.join(ep, "cues.json")))


def weight(s):
    return sum(1 if ord(c) > 0x2E7F else 0.55 for c in s)


def chunks(text):
    parts = [p for p in re.split(r"(?<=[，。；：？！、])", text) if p.strip()]
    out, cur = [], ""
    for p in parts:
        if cur and weight(cur + p) > MAXW:
            out.append(cur)
            cur = p
        else:
            cur += p
    if cur:
        out.append(cur)
    res = []
    for c in out:  # a single clause that is still too long: cut it in the middle
        while weight(c) > MAXW * 1.35:
            k = len(c) // 2
            res.append(c[:k])
            c = c[k:]
        res.append(c)
    return [c.rstrip("，、；：。") for c in res]


subs = []
for sc in cues["scenes"]:
    for l in sc["lines"]:
        cs = chunks(l["text"])
        total = sum(weight(c) for c in cs)
        t = sc["start"] + l["s"]
        span = l["e"] - l["s"]
        for c in cs:
            d = span * weight(c) / total
            subs.append((t, t + d, c))
            t += d

font = ImageFont.truetype(FONT, SIZE)
try:
    font.set_variation_by_name("Medium")
except Exception:
    pass

tmp = tempfile.mkdtemp(prefix="subs-")
inputs, chain, prev = [], [], "base"
for i, (a, b, text) in enumerate(subs):
    img = Image.new("RGBA", (W, BAND), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    box = d.textbbox((0, 0), text, font=font)
    tw, th = box[2] - box[0], box[3] - box[1]
    d.text(((W - tw) / 2 - box[0], (BAND - th) / 2 - box[1] - 4), text, font=font, fill="#e8e6df")
    p = os.path.join(tmp, f"{i:03d}.png")
    img.save(p)
    inputs += ["-i", p]
    nxt = f"v{i}"
    chain.append(f"[{prev}][{i + 1}:v]overlay=0:{PH}:enable='between(t,{a:.3f},{b:.3f})'[{nxt}]")
    prev = nxt

graph = f"[0:v]scale={PW}:{PH}:flags=lanczos,pad={W}:{H}:{PX}:0:color={BG}[base];" + ";".join(chain)
cmd = ["ffmpeg", "-v", "error", "-y", "-i", raw, *inputs, "-filter_complex", graph, "-map", f"[{prev}]",
       "-map", "0:a", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
       "-c:a", "copy", "-movflags", "+faststart", out]
subprocess.check_call(cmd)

if srt_out:
    def ts(t):
        ms = int(round(t * 1000))
        return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"
    with open(srt_out, "w", encoding="utf-8") as f:
        for i, (a, b, text) in enumerate(subs, 1):
            f.write(f"{i}\n{ts(a)} --> {ts(b)}\n{text}\n\n")
print(out, len(subs), "subtitles")
