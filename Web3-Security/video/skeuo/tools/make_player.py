#!/usr/bin/env python3
"""生成本地视频浏览页 hf/player.html（数据内嵌，视频/幻灯片用相对路径）。用法：python3 tools/make_player.py"""
import json, os, re
HF = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GROUPS = [("第一篇 · 全景与基础", [1,2,3]), ("第二篇 · 合约代码层", [4,5,6,7]), ("第三篇 · DeFi 与协议层", [8,9,10,11,12]),
          ("第四篇 · 非 EVM 与新范式", [13,14,15]), ("第五篇 · 链与基础设施", [16,17,30]),
          ("第六篇 · 钱包、用户与运营", [18,19,20,21,22,23,24,25]), ("第七篇 · AI 与前沿", [26]), ("第八篇 · 工程与复盘", [27,28,29])]
eps = {}
for n in range(1, 31):
    ep = f"ep{n:02d}"; S = json.load(open(f"{HF}/{ep}/script.json"))
    ch = open(f"{HF}/{ep}/out/chapters.txt").read()
    starts = [int(x) / 1000 for x in re.findall(r"START=(\d+)", ch)]
    eps[n] = {"n": n, "title": S.get("title", ep), "dur": None,
              "segs": [{"t": s["title"], "at": a, "lines": s["lines"]} for s, a in zip(S["segments"], starts)]}
data = {"groups": [{"name": g, "eps": [eps[i] for i in ids]} for g, ids in GROUPS]}
html = open(os.path.join(HF, "tools", "player-template.html")).read().replace("__DATA__", json.dumps(data, ensure_ascii=False))
open(os.path.join(HF, "player.html"), "w").write(html)
print("player.html", len(html) // 1024, "KB")
