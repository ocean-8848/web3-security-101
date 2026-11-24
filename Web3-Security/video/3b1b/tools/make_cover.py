#!/usr/bin/env python3
"""Make a 1920×1080 cover for each episode: a dimmed frame from the episode behind large title text.

Usage: python3 tools/make_cover.py <eps.json> <out dir>
eps.json: [{ep, slug, name, q}]. The background is the raw render's frame 1 s before the third scene ends
(the most built-up drawing of the opening), falling back to the final MP4.
"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT = os.path.join(ROOT, "tools", ".cache", "NotoSansSC.ttf")
W, H = 1920, 1080


def font(size, weight="Bold"):
    f = ImageFont.truetype(FONT, size)
    try:
        f.set_variation_by_name(weight)
    except Exception:
        pass
    return f


def fit(d, text, weight, size, maxw):
    while True:
        f = font(size, weight)
        if d.textlength(text, font=f) <= maxw or size < 40:
            return f
        size -= 4


eps, out = json.load(open(sys.argv[1])), sys.argv[2]
os.makedirs(out, exist_ok=True)
for e in eps:
    cues = json.load(open(os.path.join(ROOT, e["slug"], "cues.json")))
    sc = cues["scenes"][2]
    t = sc["start"] + sc["duration"] - 1.0
    raw = os.path.join(ROOT, "output", "raw", e["slug"] + ".mp4")
    src = raw if os.path.exists(raw) else os.path.join(ROOT, "output", e["slug"] + ".mp4")
    frame = os.path.join(out, e["slug"] + "-bg.png")
    subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", src, "-frames:v", "1",
                           "-vf", f"scale={W}:{H}", frame])
    bg = Image.open(frame).convert("RGB")
    bg = ImageEnhance.Brightness(bg.filter(ImageFilter.GaussianBlur(6))).enhance(0.45)
    # darken the left side further so the text reads at thumbnail size
    shade = Image.new("L", (W, H))
    sd = ImageDraw.Draw(shade)
    for x in range(W):
        sd.line([(x, 0), (x, H)], fill=int(200 * max(0, 1 - x / (W * 0.85))))
    bg = Image.composite(Image.new("RGB", (W, H), "#0f1117"), bg, shade)
    d = ImageDraw.Draw(bg)
    x = 120
    d.text((x, 150), e["ep"], font=font(120, "Black"), fill="#F0B90B")
    d.text((x + d.textlength(e["ep"], font=font(120, "Black")) + 36, 196), "Web3 安全", font=font(64, "Bold"), fill="#58C4DD")
    tf = fit(d, e["name"], "Black", 190, W - 2 * x)
    d.text((x, 330), e["name"], font=tf, fill="#e8e6df")
    qf = fit(d, e["q"], "Bold", 76, W - 2 * x)
    d.text((x, 640), e["q"], font=qf, fill="#FF9F43")
    d.rectangle([x, 800, x + 160, 808], fill="#83C167")
    d.text((x, 850), "Web3 安全学习手册 · 动画讲解", font=font(48, "Medium"), fill="#8a8f99")
    p = os.path.join(out, e["slug"] + ".jpg")
    bg.save(p, quality=90)
    os.remove(frame)
    print(p)
