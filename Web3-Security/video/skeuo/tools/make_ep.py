#!/usr/bin/env python3
"""一集一键出片：生成画面 → check → 版面检查 → 渲染（不带字幕）→ 叠字幕 → 拼接 → 720p 预览 → 字幕核对。
整个过程一个进程，适合放后台跑，跑完只通知一次。结果写进 <章节目录>/out/BUILD.md。

用法：python3 tools/make_ep.py <章节目录> [段 id ...] [--caps-only] [--no-preview]
  不给段 id：处理全部段。
  --caps-only：只重叠字幕再拼接（改了字幕或配音文字、但画面和时间没变时用），不重渲。
规则：
  - 渲染失败（例如被别的进程中断）自动重试一次。整台机器同一时间只跑一个渲染，排队是正常的。
  - 不许用 pkill / killall 停渲染，会杀掉别的集排队中的渲染。
  - check 有 error 的段不渲染，记在 BUILD.md 里。版面检查只报告，不拦截。
"""
import json, os, re, subprocess, sys, time

HF = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]
caps_only = "--caps-only" in args; no_prev = "--no-preview" in args
args = [a for a in args if not a.startswith("--")]
CH = os.path.abspath(args[0])
S = json.load(open(os.path.join(CH, "script.json"))); EP = S.get("ep", os.path.basename(CH))
SEGS = args[1:] or [s["id"] for s in S["segments"]]
log = []

def say(s):
    print(s, flush=True); log.append(s)

def run(cmd, cwd=None, ok=(0,)):
    p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    return p.returncode, (p.stdout or "") + (p.stderr or "")

def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]))

def render_nocap(seg, d):
    idx = os.path.join(d, "index.html"); s0 = open(idx).read()
    s1 = s0 if 'id="captions" data-hidden' in s0 else re.sub(r'(<div\s+id="captions")', r'\1 data-hidden', s0, count=1)
    open(idx, "w").write(s1)
    try:
        for attempt in (1, 2, 3):
            rc, out = run(["npx", "hyperframes", "render", "-o", f"renders/{seg}-nocap.mp4", "--quiet"], cwd=d)
            if rc == 0:
                return True
            say(f"  {seg} 渲染失败（第 {attempt} 次）：{out.strip().splitlines()[-1] if out.strip() else rc}")
            time.sleep(30 * attempt)  # npx 偶发报错，多等一会再试
        return False
    finally:
        open(idx, "w").write(s0)

t0 = time.time()
for seg in SEGS:
    d = os.path.join(CH, seg); T = json.load(open(os.path.join(d, "timing.json")))
    if not caps_only:
        if os.path.exists(os.path.join(d, "src", "build-story.mjs")):
            rc, out = run(["node", "src/build-story.mjs"], cwd=d)
            if rc: say(f"✗ {seg} 生成画面失败：{out.strip()[-300:]}"); continue
        rc, out = run(["npx", "hyperframes", "check", "--no-contrast"], cwd=d)
        m = re.search(r"(\d+) error", out)
        if m and int(m.group(1)) > 0:
            say(f"✗ {seg} check 有 {m.group(1)} 个 error，未渲染"); continue
        rc, lint = run(["node", os.path.join(HF, "tools", "layout_lint.mjs"), d])
        say("  " + lint.strip().splitlines()[0] if lint.strip() else f"  {seg} 版面检查无输出")
        if rc: log.extend("    " + l for l in lint.strip().splitlines()[1:])
        if not render_nocap(seg, d):
            say(f"✗ {seg} 渲染三次都失败"); continue
    nocap = os.path.join(d, "renders", f"{seg}-nocap.mp4")
    if not os.path.exists(nocap):
        say(f"✗ {seg} 没有无字幕画面 {nocap}"); continue
    rc, out = run([sys.executable, os.path.join(HF, "tools", "burn_caps.py"), d])
    if rc: say(f"✗ {seg} 叠字幕失败：{out.strip()[-300:]}"); continue
    o = os.path.join(CH, "out", f"{seg}.mp4"); dv = dur(o)
    flag = "" if abs(dv - T["total"]) < 0.25 else f"（时长 {dv:.2f} 与配音 {T['total']:.2f} 不符）"
    say(f"✓ {seg} {dv:.2f}s{flag}")

rc, out = run([sys.executable, os.path.join(HF, "tools", "concat.py"), CH])
say(out.strip().splitlines()[0] if rc == 0 else f"✗ 拼接失败：{out.strip()[-400:]}")
full = os.path.join(CH, "out", f"{EP}-full.mp4"); srt = os.path.join(CH, "out", f"{EP}-full.srt")
if rc == 0 and not no_prev:
    prev = os.path.join(CH, "out", f"{EP}-full-preview-720p.mp4")
    run(["ffmpeg", "-y", "-v", "error", "-i", full, "-vf", "scale=1280:720", "-c:v", "libx264", "-preset", "slow", "-b:v", "270k",
         "-maxrate", "400k", "-bufsize", "800k", "-c:a", "aac", "-b:a", "64k", "-ac", "1", "-movflags", "+faststart", prev])
    mb = os.path.getsize(prev) / 1048576
    say(f"预览 {mb:.1f} MB" + ("（超过 30 MB）" if mb > 30 else ""))
if os.path.exists(srt):
    txt = open(srt).read()
    bad = {"手册/本章/本书/以后单独讲": len(re.findall(r"手册|本章|本书|以后单独讲", txt.replace("规程手册", ""))),
           "句号逗号": len(re.findall(r"[。，]", txt)),
           "章节集编号": len(re.findall(r"第\s*[0-9一二三四五六七八九十]+\s*[章节集]", txt)),
           "清单编号": len([x for x in re.findall(r"\b[A-Z]{2,5}-\d+\b", txt) if not re.match(r"(ERC|EIP|BIP|RFC|CVE|BSC)-", x)])}
    say("字幕核对：" + "，".join(f"{k} {v}" for k, v in bad.items()))
say(f"用时 {(time.time() - t0) / 60:.1f} 分钟")
open(os.path.join(CH, "out", "BUILD.md"), "w").write(f"# {EP} 出片记录\n\n" + "\n".join(log) + "\n")
