#!/usr/bin/env python3
"""把章节各段 out/<seg>.mp4 拼成完整版，段间 0.4 秒交叉淡化（只覆盖段首段尾的静音）。
用法：python3 tools/concat.py <章节目录>
读 script.json：segments 顺序、每段 title（章节名）、可选 "trim": {"seg1": 45.9}（截短某段结尾）、"title"（整集标题）、"ep"（集号）。
输出：out/<ep>-full.mp4（内嵌章节）和 out/<ep>-full.srt（字幕不含句号逗号）。
"""
import json, os, subprocess, sys

X = 0.4
chdir = os.path.abspath(sys.argv[1]); os.chdir(chdir)
S = json.load(open("script.json")); EP = S.get("ep", os.path.basename(chdir)); TRIM = S.get("trim", {})
SEGS = [s["id"] for s in S["segments"]]; CHAP = {s["id"]: s.get("chapter", s["title"]) for s in S["segments"]}

def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]))

D = [min(dur(f"out/{s}.mp4"), TRIM.get(s, 1e9)) for s in SEGS]
starts, t = [], 0.0
for i, d in enumerate(D):
    starts.append(t); t += d - (X if i < len(D) - 1 else 0)
total = t
ins = sum([(["-t", str(TRIM[s])] if s in TRIM else []) + ["-i", f"out/{s}.mp4"] for s in SEGS], [])
fv, fa, pv, pa, acc = [], [], "[0:v]", "[0:a]", D[0]
for i in range(1, len(SEGS)):
    off = acc - X
    fv.append(f"{pv}[{i}:v]xfade=transition=fade:duration={X}:offset={off:.3f}[v{i}]")
    fa.append(f"{pa}[{i}:a]acrossfade=d={X}:c1=tri:c2=tri[a{i}]")
    pv, pa = f"[v{i}]", f"[a{i}]"; acc = off + D[i]
fa.append(f"{pa}loudnorm=I=-16:TP=-1.5:LRA=11[aout]")
meta = [";FFMETADATA1", f"title={S.get('title', EP)}"]
for i, s in enumerate(SEGS):
    st = int(starts[i] * 1000); en = int((starts[i + 1] if i + 1 < len(SEGS) else total) * 1000)
    meta += ["[CHAPTER]", "TIMEBASE=1/1000", f"START={st}", f"END={en}", f"title={CHAP[s]}"]
open("out/chapters.txt", "w").write("\n".join(meta) + "\n")
filt = ";".join(fv + fa) if fv else "[0:a]loudnorm=I=-16:TP=-1.5:LRA=11[aout]"
subprocess.run(["ffmpeg", "-y", "-v", "error", *ins, "-i", "out/chapters.txt", "-filter_complex", filt,
                "-map", pv, "-map", "[aout]", "-map_metadata", str(len(SEGS)), "-map_chapters", str(len(SEGS)),
                "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", f"out/{EP}-full.mp4"], check=True)

def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
out, n = [], 1
for i, s in enumerate(SEGS):
    tj = f"timing/{s}.json" if os.path.exists(f"timing/{s}.json") else f"{s}/timing.json"
    for c in json.load(open(tj))["captions"]:
        if c["start"] >= D[i]: continue
        out += [str(n), f"{ts(starts[i] + c['start'])} --> {ts(starts[i] + min(c['end'], D[i]))}", c["text"], ""]; n += 1
open(f"out/{EP}-full.srt", "w").write("\n".join(out))
print(f"{EP}: {total:.2f} 秒（{total / 60:.2f} 分钟），{n - 1} 条字幕")
for i, s in enumerate(SEGS):
    print(f"  {int(starts[i] // 60):02d}:{starts[i] % 60:05.2f}  {CHAP[s]}")
