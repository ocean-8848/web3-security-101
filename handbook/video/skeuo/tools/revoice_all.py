#!/usr/bin/env python3
"""全部章节换 edge 云希配音：先补渲缺的无字幕画面（串行，一次一个渲染），再 3 路并行换声。进度写 revoice-all.log。"""
import glob, json, os, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor
HF = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(HF)
eps = sorted(glob.glob("ep[0-9][0-9]"))
def log(s):
    open("revoice-all.log", "a").write(time.strftime("%H:%M:%S ") + s + "\n")
# 1 补无字幕画面
for ep in eps:
    S = json.load(open(f"{ep}/script.json"))
    miss = [s["id"] for s in S["segments"] if not os.path.exists(f"{ep}/{s['id']}/renders/{s['id']}-nocap.mp4")]
    if miss:
        if not os.path.exists(f"{ep}/timing_old"):
            subprocess.run(["cp", "-r", f"{ep}/timing", f"{ep}/timing_old"])
        r = subprocess.run([sys.executable, "tools/revoice.py", ep, *miss, "--step", "nocap"], capture_output=True, text=True)
        log(f"{ep} 补渲 {miss} rc={r.returncode} {r.stderr[-200:] if r.returncode else ''}")
# 2 换声
def one(ep):
    if os.path.exists(f"{ep}/out/.edge_done"): return
    r = subprocess.run([sys.executable, "tools/revoice_edge.py", ep], capture_output=True, text=True)
    open(f"{ep}/out/revoice.log", "w").write(r.stdout + r.stderr)
    if r.returncode == 0: open(f"{ep}/out/.edge_done", "w").write("ok")
    log(f"{ep} rc={r.returncode} " + (r.stderr[-300:] if r.returncode else ""))
with ThreadPoolExecutor(3) as ex: list(ex.map(one, eps))
log("ALL DONE")
