#!/usr/bin/env python3
"""渲染后叠字幕：画面渲染时不带字幕，字幕卡由本脚本画成 PNG，再用 ffmpeg 按时间叠上去。
改字幕、改配音文字（时间不变）时只需重跑本脚本，不用重渲画面。

用法：python3 tools/burn_caps.py <段目录> [无字幕视频] [输出]
  默认无字幕视频 = <段目录>/renders/<段>-nocap.mp4，输出 = <章节目录>/out/<段>.mp4
  字幕取 <段目录>/timing.json 的 captions；声音取无字幕视频自带的音轨。
  --png <秒>  只画出该时刻的一帧对照图（<段目录>/renders/cap-at-<秒>.png），不编码视频。

字幕卡样式与原 HTML 字幕完全一致：白底 #fffdf8、圆角 14、内边距 10/28、
Noto Sans SC 900 46px、字距 0.02em、行高 1.25、墨色 #1c1c1c，卡片底边距画面底 84px。
"""
import json, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

HF = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 1920, 1080
SIZE, LH, PADX, PADY, RAD, BOTTOM, TRACK = 46, 1.25, 28, 10, 14, 84, 0.02
BG, INK = (255, 253, 248, 255), (28, 28, 28, 255)
TTF = os.path.join(HF, "tools", ".cache", "NotoSansSC.ttf")


def font():
    if not os.path.exists(TTF):  # 由模板里的 woff2 转出，与 HTML 用的是同一份字体
        from fontTools.ttLib import TTFont
        os.makedirs(os.path.dirname(TTF), exist_ok=True)
        f = TTFont(os.path.join(HF, "template", "assets", "fonts", "NotoSansSC.woff2")); f.flavor = None; f.save(TTF)
    ft = ImageFont.truetype(TTF, SIZE)
    try:
        ft.set_variation_by_axes([900])
    except Exception:
        pass
    return ft


def card(text, ft):
    """返回 (RGBA 图, x, y)：字幕卡在 1920×1080 画面里的位置。"""
    track = SIZE * TRACK
    adv = [ft.getlength(c) for c in text]
    tw = sum(adv) + track * len(text)          # 浏览器在每个字后加字距（含最后一个）
    th = SIZE * LH
    cw, ch = round(tw + 2 * PADX), round(th + 2 * PADY)
    im = Image.new("RGBA", (cw, ch), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, cw - 1, ch - 1], RAD, fill=BG)
    asc, desc = ft.getmetrics()
    y = PADY + (th - (asc + desc)) / 2
    x = PADX
    for c, a in zip(text, adv):
        d.text((x, y), c, font=ft, fill=INK); x += a + track
    return im, (W - cw) // 2, H - BOTTOM - ch


def main():
    args = sys.argv[1:]
    at = None
    if "--png" in args:
        i = args.index("--png"); at = float(args[i + 1]); del args[i:i + 2]
    seg = os.path.abspath(args[0]); sid = os.path.basename(seg)
    raw = os.path.abspath(args[1]) if len(args) > 1 else os.path.join(seg, "renders", f"{sid}-nocap.mp4")
    out = os.path.abspath(args[2]) if len(args) > 2 else os.path.join(os.path.dirname(seg), "out", f"{sid}.mp4")
    caps = [c for c in json.load(open(os.path.join(seg, "timing.json")))["captions"] if c["end"] > c["start"]]
    ft = font()
    if at is not None:
        frame = os.path.join(seg, "renders", f"cap-at-{at:g}.png")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(at), "-i", raw, "-frames:v", "1", frame], check=True)
        bg = Image.open(frame).convert("RGBA")
        for c in caps:
            if c["start"] <= at < c["end"]:
                im, x, y = card(c["text"], ft); bg.alpha_composite(im, (x, y))
        bg.convert("RGB").save(frame); print(frame); return
    tmp = tempfile.mkdtemp(prefix="caps-")
    ins, chain, prev = [], [], "0:v"
    for i, c in enumerate(caps):
        im, x, y = card(c["text"], ft); p = os.path.join(tmp, f"{i:03d}.png"); im.save(p)
        ins += ["-i", p]
        chain.append(f"[{prev}][{i + 1}:v]overlay={x}:{y}:enable='between(t,{c['start']:.3f},{c['end'] - 0.001:.3f})'[v{i}]")
        prev = f"v{i}"
    os.makedirs(os.path.dirname(out), exist_ok=True)
    # 滤镜图写进文件，避免几百个字幕时命令行过长
    graph = os.path.join(tmp, "graph.txt"); open(graph, "w").write(";".join(chain) if chain else "[0:v]null[v0]")
    last = f"[{prev}]" if chain else "[v0]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", raw, *ins, "-/filter_complex", graph,
                    "-map", last, "-map", "0:a?", "-c:v", "libx264", "-crf", "18", "-preset", "medium",
                    "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", out], check=True)
    print(f"{sid}: 叠字幕 {len(caps)} 条 → {out}")


if __name__ == "__main__":
    main()
