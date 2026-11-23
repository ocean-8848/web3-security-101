#!/usr/bin/env python3
"""B75 参考实现：用 ci_events.jsonl 与 lockfile 找供应链事件（只用标准库）。

用法（从 web3-security-101/ 根出发）：
  python3 practice-example-code/ops/solutions/b75/check_ci_events.py [--all] [--json]
默认只报"会进入发布路径、且没有正当解释"的发现；--all 同时列出被排除的噪声及原因。
"""
import argparse, json, os, re, sys
OPS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
SHA = re.compile(r"^[0-9a-f]{40}$")


def events():
    with open(os.path.join(OPS, "data", "ci_events.jsonl"), encoding="utf-8") as f:
        return [json.loads(l) for l in f]


def lock_index():
    pk = json.load(open(os.path.join(OPS, "data", "workflows", "lockfile.sample.json")))["packages"]
    return {k.split("node_modules/")[-1]: v for k, v in pk.items()}


def scan(evs):
    hits, noise = [], []
    triggers = {e["run_id"]: e["detail"].get("trigger") for e in evs if e["event_type"] == "workflow_trigger"}
    signed = {(e["run_id"], e["detail"]["artifact"]): e["detail"]["sha256"] for e in evs if e["event_type"] == "artifact_sign"}
    for e in evs:
        d, t = e["detail"], e["event_type"]
        base = {"event_id": e["event_id"], "ts": e["ts"], "run_id": e["run_id"], "repo": e["repo"], "workflow": e["workflow"]}
        if t == "dependency_install":
            if d.get("lock_integrity") is None:
                noise.append({**base, "rule": "C1", "package": d["package"], "why": "仓库没有 lockfile（实验仓库），本规则无从比对，另行治理"})
            elif d["integrity"] != d["lock_integrity"]:
                hits.append({**base, "rule": "C1", "package": d["package"],
                             "msg": "安装 %s@%s，哈希与 lockfile（%s）不符" % (d["package"], d["version"], d.get("lock_version", "?"))})
        elif t == "action_use" and not SHA.match(d["ref"]):
            item = {**base, "rule": "C2", "action": d["action"], "ref": d["ref"], "trigger": triggers.get(e["run_id"])}
            if e["workflow"] == "release.yml":
                hits.append({**item, "msg": "发布流水线使用 %s@%s（可变引用），触发方式 %s" % (d["action"], d["ref"], item["trigger"])})
            else:
                noise.append({**item, "why": "非发布流水线的官方标签引用，按 LOW 另行治理"})
        elif t == "publish":
            a = d["artifact"]
            if d["channel"] == "release" and not d.get("signature"):
                hits.append({**base, "rule": "C3", "artifact": a, "msg": "release 通道发布 %s，signature 为空" % a})
            elif not d.get("signature"):
                noise.append({**base, "rule": "C3", "artifact": a, "why": "%s 通道（非 release）的无签名发布" % d["channel"]})
            elif signed.get((e["run_id"], a)) != d["sha256"]:
                hits.append({**base, "rule": "C3", "artifact": a, "msg": "发布的摘要与签名时的摘要不一致"})
    return hits, noise


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    evs = events()
    hits, noise = scan(evs)
    # 交叉检查：wallet-service 的安装是否与 lockfile.sample.json 一致
    lock = lock_index()
    for e in evs:
        d = e["detail"]
        if e["event_type"] == "dependency_install" and e["repo"] == "miniex/wallet-service" and d["package"] in lock:
            l = lock[d["package"]]
            if (l["version"], l["integrity"]) != (d["version"], d["integrity"]) and not any(h["event_id"] == e["event_id"] for h in hits):
                hits.append({"event_id": e["event_id"], "ts": e["ts"], "run_id": e["run_id"], "repo": e["repo"], "workflow": e["workflow"],
                             "rule": "C1", "package": d["package"], "msg": "与 lockfile.sample.json 不一致"})
    if a.json:
        print(json.dumps({"hits": hits, "noise": noise}, ensure_ascii=False, indent=1)); return
    print("扫描 %d 条 CI 事件" % len(evs))
    for h in hits:
        print("%s %s %s %s %s" % (h["rule"], h["event_id"], h["run_id"], h["ts"], h["msg"]))
    print("发现 %d 条；排除的噪声 %d 条" % (len(hits), len(noise)))
    if a.all:
        from collections import Counter
        c = Counter((n["rule"], n["why"]) for n in noise)
        for (r, w), k in sorted(c.items()):
            print("  噪声 %s x%d：%s" % (r, k, w))


if __name__ == "__main__":
    main()
