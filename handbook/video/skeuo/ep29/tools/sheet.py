#!/usr/bin/env python3
"""从视频按给定秒数抽帧拼成一张审片图（3 列）。用法：sheet.py <video> <out.png> t1 t2 ..."""
import subprocess, sys, tempfile, os
v, out, ts = sys.argv[1], sys.argv[2], sys.argv[3:]
tmp = tempfile.mkdtemp()
ins = []
for i, t in enumerate(ts):
    p = os.path.join(tmp, f"{i}.png")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", t, "-i", v, "-frames:v", "1", "-vf", "scale=640:360", p], check=True)
    ins += ["-i", p]
n = len(ts); cols = 3
while n % cols:  # 补空白帧凑满
    p = os.path.join(tmp, f"pad{n}.png")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", "color=c=white:s=640x360", "-frames:v", "1", p], check=True)
    ins += ["-i", p]; n += 1
lay = "|".join(f"{(i % cols) * 640}_{(i // cols) * 360}" for i in range(n))
subprocess.run(["ffmpeg", "-y", "-v", "error", *ins, "-filter_complex", f"xstack=inputs={n}:layout={lay}", out], check=True)
print(out)
