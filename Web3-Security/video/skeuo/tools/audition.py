#!/usr/bin/env python3
"""多音字试听：把本章所有"含多音字风险词"的句子按顺序拼成一个音频，配一张清单，给人耳听。
用法：python3 tools/audition.py <章节目录> [<章节目录> ...]
输出：<章节目录>/out/polyphone-audition.wav 和 polyphone-audition.md（每条：编号、时间点、段/句、风险词、原句）。
听到读错，只要报编号；修正后用 tools/tts.py <章节目录> --fix 只重配这些句子。
"""
import json, os, re, subprocess, sys

here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, here)
from polyphone_scan import RISK  # noqa: E402

def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]))

for chdir in map(os.path.abspath, sys.argv[1:]):
    pairs = json.load(open(os.path.join(here, "pron.json")))["pairs"]
    if os.path.exists(os.path.join(chdir, "pron.json")):
        pairs += json.load(open(os.path.join(chdir, "pron.json")))["pairs"]
    S = json.load(open(os.path.join(chdir, "script.json")))
    items, heard = [], set()
    for seg in S["segments"]:
        T = json.load(open(os.path.join(chdir, "timing", f"{seg['id']}.json")))
        for i, L in enumerate(T["lines"]):
            line = L["text"]
            words = [a for a, _ in pairs if a in line]
            for pat in RISK:
                for m in re.finditer(pat, line):
                    w = m.group(0).strip("，、 ")
                    if not any(w in x or x in w for x in words):
                        words.append(w)
            words = [w for w in words if w not in heard]
            heard.update(words)
            if words:
                items.append((seg["id"], i, L["src"], sorted(set(words)), line))
    os.makedirs(os.path.join(chdir, "out"), exist_ok=True)
    gap = os.path.join(chdir, "out", "_gap.wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", "0.8", gap], check=True)
    lst, md, t = [], [f"# {S.get('title', os.path.basename(chdir))} · 多音字试听", "",
                     "听到读错，报编号即可。", "", "| 编号 | 时间 | 段/句 | 风险词 | 原句 |", "|---|---|---|---|---|"], 0.0
    for n, (sid, i, src, ws, line) in enumerate(items, 1):
        lst += [f"file '{src}'", f"file '{gap}'"]
        md.append(f"| {n} | {int(t // 60):02d}:{t % 60:04.1f} | {sid} L{i} | {'、'.join(ws)} | {line} |")
        t += dur(src) + 0.8
    lp = os.path.join(chdir, "out", "_list.txt"); open(lp, "w").write("\n".join(lst))
    out = os.path.join(chdir, "out", "polyphone-audition.wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lp, "-ar", "24000", "-ac", "1", out], check=True)
    open(os.path.join(chdir, "out", "polyphone-audition.md"), "w").write("\n".join(md) + "\n")
    os.remove(lp); os.remove(gap)
    print(f"{os.path.basename(chdir)}：{len(items)} 句，{t / 60:.1f} 分钟 → {out}")
