#!/usr/bin/env python3
"""整集换成 edge-tts 云希配音，不重渲画面：旧画面按逐句时间拉伸对齐新配音，重叠字幕，拼接，出 720p 预览。
用法：python3 tools/revoice_edge.py <章节目录> [--no-tts] [--no-preview]
前提：每段有 <段>/renders/<段>-nocap.mp4（无字幕画面）；<章节目录>/timing_old/<段>.json 是画面对应的旧时间
      （没有就把当前 timing/ 备份成 timing_old/，即"做画面时的时间"）。
步骤：备份旧配音 → ENGINE=edge tts.py 全部段（多音字表照常生效）→ 逐段拉伸 + 新配音 + 新字幕 → concat → 预览。
"""
import json, os, shutil, subprocess, sys, tempfile
HF = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]; no_tts = "--no-tts" in args; no_prev = "--no-preview" in args
CH = os.path.abspath([a for a in args if not a.startswith("--")][0])
S = json.load(open(os.path.join(CH, "script.json"))); EP = S.get("ep", os.path.basename(CH))
SEGS = [s["id"] for s in S["segments"]]

def run(c, **k): subprocess.run(c, check=True, **k)
def dur(p): return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]))

old = os.path.join(CH, "timing_old")
if not os.path.exists(old):
    shutil.copytree(os.path.join(CH, "timing"), old)
if not no_tts:
    if not os.path.exists(os.path.join(CH, "audio_qwen")):
        shutil.copytree(os.path.join(CH, "audio"), os.path.join(CH, "audio_qwen"))
    env = dict(os.environ, ENGINE="edge")
    run([sys.executable, os.path.join(HF, "tools", "tts.py"), CH], env=env)

def knots(T):
    k = [0.0]
    for L in T["lines"]: k += [L["start"], L["start"] + L["dur"]]
    return k + [T["total"]]

os.makedirs(os.path.join(CH, "out"), exist_ok=True)
for sid in SEGS:
    To = json.load(open(os.path.join(old, f"{sid}.json"))); Tn = json.load(open(os.path.join(CH, "timing", f"{sid}.json")))
    assert len(To["lines"]) == len(Tn["lines"]), f"{sid} 句数不一致"
    nocap = os.path.join(CH, sid, "renders", f"{sid}-nocap.mp4")
    ko, kn = knots(To), knots(Tn); ko[-1] = min(ko[-1], dur(nocap))
    parts = [(a, b, (d - c) / (b - a)) for a, b, c, d in zip(ko, ko[1:], kn, kn[1:]) if b - a > 1e-3 and d - c > 1e-3]
    n = len(parts)
    f = [f"[0:v]split={n}" + "".join(f"[s{i}]" for i in range(n))]
    for i, (a, b, k) in enumerate(parts):
        f.append(f"[s{i}]trim=start={a:.4f}:end={b:.4f},setpts=(PTS-STARTPTS)*{k:.5f}[p{i}]")
    f.append("".join(f"[p{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0,fps=30,trim=duration={Tn['total']}[v]")
    tmp = tempfile.mkdtemp(prefix="rv-")
    gp = os.path.join(tmp, "g.txt"); open(gp, "w").write(";".join(f))
    st = os.path.join(tmp, "stretch.mp4")
    run(["ffmpeg", "-y", "-v", "error", "-i", nocap, "-i", os.path.join(CH, "audio", f"{sid}.wav"), "-/filter_complex", gp,
         "-map", "[v]", "-map", "1:a", "-t", str(Tn["total"]), "-c:v", "libx264", "-crf", "14", "-preset", "fast", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", st])
    fake = os.path.join(tmp, sid); os.makedirs(fake)
    shutil.copy(os.path.join(CH, "timing", f"{sid}.json"), os.path.join(fake, "timing.json"))
    run([sys.executable, os.path.join(HF, "tools", "burn_caps.py"), fake, st, os.path.join(CH, "out", f"{sid}.mp4")])
    shutil.copy(os.path.join(CH, "timing", f"{sid}.json"), os.path.join(CH, sid, "timing-new.json"))
    ratios = [round(k, 2) for _, _, k in parts]
    print(f"{sid}: {Tn['total']:.1f}s（原 {To['total']:.1f}s） 拉伸 {min(ratios)}–{max(ratios)}", flush=True)
    shutil.rmtree(tmp)

run([sys.executable, os.path.join(HF, "tools", "concat.py"), CH])
if not no_prev:
    full = os.path.join(CH, "out", f"{EP}-full.mp4")
    prev = os.path.join(CH, "out", f"{EP}-full-preview-720p.mp4")
    run(["ffmpeg", "-y", "-v", "error", "-i", full, "-vf", "scale=1280:720", "-c:v", "libx264", "-preset", "slow", "-b:v", "270k",
         "-maxrate", "400k", "-bufsize", "800k", "-c:a", "aac", "-b:a", "64k", "-ac", "1", "-movflags", "+faststart", prev])
print(f"{EP} 完成")
