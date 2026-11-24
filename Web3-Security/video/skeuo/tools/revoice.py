#!/usr/bin/env python3
"""换配音后不重做动画：按新旧逐句时间把画面分段拉伸，再叠上按新时间渲染的字幕层，合上新配音。
用法：python3 tools/revoice.py <章节目录> <段 id> [...] [--step nocap|caps|merge]（默认三步都做）
前提：<章节目录>/timing_old/<seg>.json 是做动画时的旧时间；<章节目录>/timing/<seg>.json 和 audio/<seg>.wav 是新配音。
步骤：
  nocap  用当前画面文件（旧时间）渲染一份不带字幕的视频 → <seg>/renders/<seg>-nocap.mp4
  caps   建字幕层工程 <章节目录>/caps/<seg>（透明底，只有新时间的字幕），渲染为带透明通道的 mov
  merge  分段拉伸画面 → 叠字幕 → 合新配音 → out/<seg>.mp4，同时把新配音/时间/字幕写回段工程
"""
import json, os, re, shutil, subprocess, sys

hf = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]; step = None
if "--step" in args:
    i = args.index("--step"); step = args[i + 1]; del args[i:i + 2]
chdir = os.path.abspath(args[0]); segs = args[1:]

def run(cmd, cwd=None):
    subprocess.run(cmd, cwd=cwd, check=True)

def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]))

def knots(T):
    k = [0.0]
    for L in T["lines"]:
        k += [L["start"], L["start"] + L["dur"]]
    return k + [T["total"]]

for sid in segs:
    proj = os.path.join(chdir, sid)
    old = json.load(open(os.path.join(chdir, "timing_old", f"{sid}.json")))
    new = json.load(open(os.path.join(chdir, "timing", f"{sid}.json")))
    assert len(old["lines"]) == len(new["lines"]), f"{sid} 句数不一致"
    nocap = os.path.join(proj, "renders", f"{sid}-nocap.mp4")
    if step in (None, "nocap"):
        idx = os.path.join(proj, "index.html"); s0 = open(idx).read()
        s1 = re.sub(r'(<div\s+id="captions")', r'\1 data-hidden', s0, count=1)
        open(idx, "w").write(s1)
        try:
            run(["npx", "hyperframes", "render", "-o", f"renders/{sid}-nocap.mp4", "--quiet"], cwd=proj)
        finally:
            open(idx, "w").write(s0)
        print(f"{sid}: 无字幕画面已渲染")
    capdir = os.path.join(chdir, "caps", sid); capmov = os.path.join(capdir, "renders", "caps.mov")
    if step in (None, "caps"):
        if os.path.exists(capdir): shutil.rmtree(capdir)
        shutil.copytree(os.path.join(hf, "template"), capdir, ignore=shutil.ignore_patterns(".hyperframes", "renders"))
        shutil.copy(os.path.join(chdir, "timing", f"{sid}.json"), os.path.join(capdir, "timing.json"))
        run([sys.executable, os.path.join(hf, "tools", "gen_captions.py"), capdir])
        p = os.path.join(capdir, "index.html"); s = open(p).read(); tot = str(new["total"])
        s = re.sub(r'data-duration="[0-9.]+"', f'data-duration="{tot}"', s)
        s = s.replace("--cap-ink: #141414;", "--cap-ink: #1c1c1c; --cap-bg: #fffdf8; --cap-pad: 10px 28px; --cap-radius: 14px; --cap-size: 46px; --cap-weight: 900;")
        s = s.replace("background: var(--ground);", "background: transparent;").replace('<div id="bg"></div>', "")
        s = re.sub(r'\s*<div\s+id="story"[^>]*></div>', "", s, flags=re.S)
        s = re.sub(r'\s*<audio[^>]*></audio>', "", s)
        open(p, "w").write(s)
        run(["npx", "hyperframes", "render", "--format", "mov", "-o", "renders/caps.mov", "--quiet"], cwd=capdir)
        print(f"{sid}: 字幕层已渲染")
    if step in (None, "merge"):
        ko, kn = knots(old), knots(new)
        vd = dur(nocap); ko[-1] = min(ko[-1], vd)
        parts = []
        for a, b, c, d in zip(ko, ko[1:], kn, kn[1:]):
            if b - a > 1e-3 and d - c > 1e-3:
                parts.append((a, b, (d - c) / (b - a)))
        n = len(parts)
        f = [f"[0:v]split={n}" + "".join(f"[s{i}]" for i in range(n))]
        for i, (a, b, k) in enumerate(parts):
            f.append(f"[s{i}]trim=start={a:.4f}:end={b:.4f},setpts=(PTS-STARTPTS)*{k:.5f}[p{i}]")
        f.append("".join(f"[p{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0,fps=30,trim=duration={new['total']}[w]")
        f.append("[w][1:v]overlay=0:0:format=auto[v]")
        out = os.path.join(chdir, "out", f"{sid}.mp4"); os.makedirs(os.path.dirname(out), exist_ok=True)
        run(["ffmpeg", "-y", "-v", "error", "-i", nocap, "-i", capmov, "-i", os.path.join(chdir, "audio", f"{sid}.wav"),
             "-filter_complex", ";".join(f), "-map", "[v]", "-map", "2:a", "-t", str(new["total"]),
             "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", out])
        # 段工程同步为新配音（画面文件不动，旧时间留在 timing_old）
        shutil.copy(os.path.join(chdir, "audio", f"{sid}.wav"), os.path.join(proj, "assets", "narration.wav"))
        shutil.copy(os.path.join(chdir, "timing", f"{sid}.json"), os.path.join(proj, "timing-new.json"))
        print(f"{sid}: 合成完成 {dur(out):.2f}s（画面按 {n} 段拉伸）")
