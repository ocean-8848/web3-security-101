#!/usr/bin/env python3
"""为章节的每一段建 HyperFrames 工程（在 tools/tts.py 之后运行）。
用法：python3 tools/scaffold.py <章节目录> [段 id ...]
每段：从 hf/template 复制 → 放入配音、timing.json → 生成字幕 → 根时长 = 段时长 → 套用定稿的字幕卡样式。
已存在的段目录只更新配音、timing 和字幕，不动画面文件。
"""
import json, os, re, shutil, subprocess, sys

hf = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
chdir = os.path.abspath(sys.argv[1]); want = sys.argv[2:]
S = json.load(open(os.path.join(chdir, "script.json")))
for seg in S["segments"]:
    sid = seg["id"]
    if want and sid not in want:
        continue
    d = os.path.join(chdir, sid); T = json.load(open(os.path.join(chdir, "timing", f"{sid}.json")))
    fresh = not os.path.exists(d)
    if fresh:
        shutil.copytree(os.path.join(hf, "template"), d, ignore=shutil.ignore_patterns(".hyperframes", "renders"))
    shutil.copy(os.path.join(chdir, "audio", f"{sid}.wav"), os.path.join(d, "assets", "narration.wav"))
    shutil.copy(os.path.join(chdir, "timing", f"{sid}.json"), os.path.join(d, "timing.json"))
    subprocess.run([sys.executable, os.path.join(hf, "tools", "gen_captions.py"), d], check=True, stdout=subprocess.DEVNULL)
    tot = str(T["total"])
    for f in ["index.html", "compositions/story.html"] if fresh else ["index.html"]:
        p = os.path.join(d, f); s = open(p).read()
        s = re.sub(r'data-duration="[0-9.]+"', f'data-duration="{tot}"', s)
        if f == "index.html":
            s = s.replace("--ground: #f3efe6;", "--ground: #efebe3;")
            s = s.replace("--cap-ink: #141414;", "--cap-ink: #1c1c1c; --cap-bg: #fffdf8; --cap-pad: 10px 28px; --cap-radius: 14px; --cap-size: 46px; --cap-weight: 900;")
        open(p, "w").write(s)
    print(f"{sid}: {'新建' if fresh else '更新'}，{tot}s")
