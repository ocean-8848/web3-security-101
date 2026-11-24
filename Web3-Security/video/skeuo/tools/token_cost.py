#!/usr/bin/env python3
"""统计一段时间内主会话和子代理的 token 用量。

用法：python3 tools/token_cost.py <会话 jsonl> <起始时间 ISO> [结束时间 ISO] [--md 输出文件]
  子代理从 <会话 jsonl 同名目录>/subagents/ 读取，只算起始时间之后启动的。
  同一条消息（message.id）在 jsonl 里会出现多次，只算一次。
  "折算"按缓存读取 0.1 倍、缓存写入 1.25 倍、输出 5 倍折成输入 token，便于比较成本。
"""
import glob, json, os, sys

args = [a for a in sys.argv[1:]]
md = None
if "--md" in args:
    i = args.index("--md"); md = args[i + 1]; del args[i:i + 2]
main, t0 = args[0], args[1]
t1 = args[2] if len(args) > 2 else "9999"


def tally(path, lo=t0, hi=t1):
    seen, u, imgs, first = {}, dict(inp=0, cw=0, cr=0, out=0, turns=0), 0, None
    for line in open(path, errors="ignore"):
        try:
            r = json.loads(line)
        except Exception:
            continue
        ts = r.get("timestamp", "")
        if not ts or ts < lo or ts > hi:
            continue
        first = first or ts
        m = r.get("message") or {}
        if r.get("type") == "user" and isinstance(m.get("content"), list):
            for c in m["content"]:
                if c.get("type") == "tool_result" and isinstance(c.get("content"), list):
                    imgs += sum(1 for x in c["content"] if x.get("type") == "image")
        if r.get("type") != "assistant" or not m.get("usage"):
            continue
        seen[m.get("id") or id(r)] = m["usage"]
    for us in seen.values():
        u["inp"] += us.get("input_tokens", 0); u["cw"] += us.get("cache_creation_input_tokens", 0)
        u["cr"] += us.get("cache_read_input_tokens", 0); u["out"] += us.get("output_tokens", 0); u["turns"] += 1
    u["imgs"] = imgs; u["first"] = first
    u["total"] = u["inp"] + u["cw"] + u["cr"] + u["out"]
    u["eq"] = u["inp"] + 1.25 * u["cw"] + 0.1 * u["cr"] + 5 * u["out"]
    return u


rows = [("主会话（统筹）", "", tally(main))]
sub = os.path.join(os.path.splitext(main)[0], "subagents")
for j in sorted(glob.glob(os.path.join(sub, "agent-*.jsonl"))):
    u = tally(j)
    if not u["turns"]:
        continue
    meta = j[:-6] + ".meta.json"
    m = json.load(open(meta)) if os.path.exists(meta) else {}
    rows.append((m.get("description", os.path.basename(j)), m.get("pickedEffortModel", ""), u))
rows.sort(key=lambda r: r[2]["first"] or "")

M = lambda n: f"{n / 1e6:.2f}M"
out = ["| 角色 | 模型 | 轮数 | 缓存读 | 缓存写 | 输出 | 合计 | 折算 | 看图 |", "|---|---|---|---|---|---|---|---|---|"]
tot = dict(inp=0, cw=0, cr=0, out=0, turns=0, imgs=0, total=0, eq=0)
for name, model, u in rows:
    out.append(f"| {name} | {model.replace('claude-', '')} | {u['turns']} | {M(u['cr'])} | {M(u['cw'])} | {M(u['out'])} | {M(u['total'])} | {M(u['eq'])} | {u['imgs']} |")
    for k in tot:
        tot[k] += u[k]
out.append(f"| **合计** | | {tot['turns']} | {M(tot['cr'])} | {M(tot['cw'])} | {M(tot['out'])} | **{M(tot['total'])}** | **{M(tot['eq'])}** | {tot['imgs']} |")
txt = "\n".join(out)
print(txt)
if md:
    open(md, "w").write(txt + "\n")
