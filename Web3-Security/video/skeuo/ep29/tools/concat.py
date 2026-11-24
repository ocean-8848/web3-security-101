#!/usr/bin/env python3
"""把 out/seg*.mp4 拼成完整版：段间 0.4 秒交叉淡化（只覆盖段首段尾的静音），
生成 out/ep29-full.mp4（内嵌章节）和 out/ep29-full.srt（字幕不含句号逗号）。在 ep29/ 目录运行。"""
import json, os, subprocess

SEGS = ["seg1", "seg2", "seg3a", "seg3b", "seg4", "seg5a", "seg5b"]
CHAP = {"seg1": "① 钥匙还在，钱没了", "seg2": "② 七道关", "seg3a": "③ 断在哪一关", "seg3b": "③ 断在哪一关 · Binance",
        "seg4": "④ 三个共同点", "seg5a": "⑤ 怎么守", "seg5b": "⑤ 你今天能做什么"}
X = 0.4
TRIM = {"seg1": 45.9}   # 开场片头卡只保留约 2 秒静止，缩短段间静音
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(root)

def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]))

D = [min(dur(f"out/{s}.mp4"), TRIM.get(s, 1e9)) for s in SEGS]
starts, t = [], 0.0
for i, d in enumerate(D):
    starts.append(t); t += d - (X if i < len(D) - 1 else 0)
total = t

# 视频 xfade + 音频 acrossfade 链
ins = sum([(["-t", str(TRIM[s])] if s in TRIM else []) + ["-i", f"out/{s}.mp4"] for s in SEGS], [])
fv, fa, prev_v, prev_a, acc = [], [], "[0:v]", "[0:a]", D[0]
for i in range(1, len(SEGS)):
    off = acc - X
    fv.append(f"{prev_v}[{i}:v]xfade=transition=fade:duration={X}:offset={off:.3f}[v{i}]")
    fa.append(f"{prev_a}[{i}:a]acrossfade=d={X}:c1=tri:c2=tri[a{i}]")
    prev_v, prev_a = f"[v{i}]", f"[a{i}]"
    acc = off + D[i]
fa.append(f"{prev_a}loudnorm=I=-16:TP=-1.5:LRA=11[aout]")

# 章节元数据
meta = [";FFMETADATA1", "title=第 29 章 攻击者不再偷私钥，而是控制签名路径"]
for i, s in enumerate(SEGS):
    st = int(starts[i] * 1000); en = int((starts[i + 1] if i + 1 < len(SEGS) else total) * 1000)
    meta += ["[CHAPTER]", "TIMEBASE=1/1000", f"START={st}", f"END={en}", f"title={CHAP[s]}"]
open("out/chapters.txt", "w").write("\n".join(meta) + "\n")

subprocess.run(["ffmpeg", "-y", "-v", "error", *ins, "-i", "out/chapters.txt", "-filter_complex", ";".join(fv + fa),
                "-map", prev_v, "-map", "[aout]", "-map_metadata", str(len(SEGS)), "-map_chapters", str(len(SEGS)),
                "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", "out/ep29-full.mp4"], check=True)

# SRT
def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
out, n = [], 1
for i, s in enumerate(SEGS):
    tj = f"{s}/timing.json"
    if not os.path.exists(tj):
        continue
    for c in json.load(open(tj))["captions"]:
        out += [str(n), f"{ts(starts[i] + c['start'])} --> {ts(starts[i] + c['end'])}", c["text"], ""]; n += 1
open("out/ep29-full.srt", "w").write("\n".join(out))
print(f"完成：{total:.2f} 秒（{total / 60:.2f} 分钟），{n - 1} 条字幕")
for i, s in enumerate(SEGS):
    print(f"  {int(starts[i] // 60):02d}:{starts[i] % 60:05.2f}  {CHAP[s]}")
