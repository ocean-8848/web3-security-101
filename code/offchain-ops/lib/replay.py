#!/usr/bin/env python3
"""规则回放：输入一个规则文件，在靶场数据上运行，输出命中事件，并对标准答案统计召回与误报。

规则文件两种写法
1) SQL（SQLite 方言）。文件头部用 `-- key: value` 声明元数据，其余是一条 SELECT：
     -- id: my-rule
     -- scenario: S1,S2-01     要召回的场景或具体答案编号（决定“召回”与“其他场景命中”的口径）
     -- param: min_users=20    可调参数，SQL 里写 :min_users；命令行用 --param min_users=30 覆盖
   结果的每一行是一次告警，列名即命中字段。用于对答案的字段见下表。
2) Python：定义 META 字典与 detect(db, params)，返回 dict 列表。db 是 sqlite3 连接（row_factory=Row），可用 mini.q(db, sql, params)。

命中字段（任选其一或多个输出）：account_id、ip、key_id、wd_id、request_id、to_address、tx_hash、staff_id、host、run_id、symbol、approval_id、package、action、artifact；
可选 ts（命中时间，用于按时间窗匹配 symbol 类答案）。

示例（从 web3-security-101/ 出发）：
  python3 code/offchain-ops/lib/replay.py code/offchain-ops/answers/reference_rules/r01_credential_stuffing.sql
  python3 code/offchain-ops/lib/replay.py my_rule.sql --param min_users=30 --show 10
  python3 code/offchain-ops/lib/replay.py my_rule.sql --scenario S1 --min-recall 1.0 --max-fp 5
  python3 code/offchain-ops/lib/replay.py --dir code/offchain-ops/answers/reference_rules
"""
import argparse
import glob
import importlib.util
import json
import os
import re
import sqlite3
import sys
from datetime import timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mini  # noqa: E402

TOL = timedelta(minutes=30)


def load_rule(path):
    ext = os.path.splitext(path)[1]
    if ext == ".sql":
        with open(path) as fh:
            text = fh.read()
        meta = {"params": {}}
        for line in text.splitlines():
            m = re.match(r"--\s*(\w+):\s*(.*)$", line)
            if not m:
                continue
            k, v = m.group(1), m.group(2).strip()
            if k == "param":
                n, _, val = v.partition("=")
                meta["params"][n.strip()] = val.strip()
            else:
                meta[k] = v
        sql = "\n".join(l for l in text.splitlines() if not l.lstrip().startswith("--")).strip().rstrip(";")
        low = sql.lower().lstrip()
        if not low.startswith(("select", "with")) or ";" in sql:
            raise SystemExit("SQL 规则必须是单条 SELECT / WITH 语句")

        def detect(db, params):
            return mini.q(db, sql, params)
        return meta, detect
    if ext == ".py":
        spec = importlib.util.spec_from_file_location("rule_" + os.path.basename(path)[:-3], path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        meta = dict(getattr(mod, "META", {}))
        meta.setdefault("params", {})
        return meta, mod.detect
    raise SystemExit("规则文件须为 .sql 或 .py")


def coerce(v):
    for f in (int, float):
        try:
            return f(v)
        except ValueError:
            pass
    return v


def item_matches(item, hit):
    ok = False
    for f, vals in item["match"].items():
        if f in hit and hit[f] is not None and str(hit[f]) in [str(x) for x in vals]:
            ok = True
            break
    if not ok:
        return False
    w = item.get("window")
    if item.get("match_window") and w and hit.get("ts"):
        t = mini.parse_ts(str(hit["ts"]))
        if not (mini.parse_ts(w["start"]) - TOL <= t <= mini.parse_ts(w["end"]) + TOL):
            return False
    return True


def score(hits, targets, positives, decoys):
    tp_ids, other_ids = set(), set()
    detail = []
    fp_sigs = set()
    for h in hits:
        mp = [p for p in positives if item_matches(p, h)]
        tgt = [p for p in mp if p["scenario"] in targets or p["id"] in targets]
        if tgt:
            for p in tgt:
                tp_ids.add(p["id"])
            detail.append(("TP", [p["id"] for p in tgt], h))
            continue
        if mp:
            for p in mp:
                other_ids.add(p["id"])
            detail.append(("OTHER", [p["id"] for p in mp], h))
            continue
        md = [d for d in decoys if item_matches(d, h)]
        if md:
            detail.append(("FP-噪声", [md[0]["id"] + "(" + md[0]["category"] + ")"], h))
            fp_sigs.add(md[0]["id"])
        else:
            detail.append(("FP-未解释", [], h))
            fp_sigs.add(json.dumps(h, sort_keys=True, default=str))
    total = [p for p in positives if p["scenario"] in targets or p["id"] in targets]
    missed = [p["id"] for p in total if p["id"] not in tp_ids]
    fp_hits = sum(1 for d in detail if d[0].startswith("FP"))
    tp_hits = sum(1 for d in detail if d[0] == "TP")
    return {
        "targets": sorted(targets), "hits": len(hits), "tp_hits": tp_hits, "fp_hits": fp_hits, "other_scenario_hits": sum(1 for d in detail if d[0] == "OTHER"),
        "fp_unique": len(fp_sigs), "positives": len(total), "recalled": len(total) - len(missed), "recall": round((len(total) - len(missed)) / len(total), 3) if total else None,
        "missed": missed, "precision": round(tp_hits / len(hits), 3) if hits else None, "recalled_ids": sorted(tp_ids),
    }, detail


def run_rule(db, path, scenario=None, params=None):
    meta, detect = load_rule(path)
    p = {k: coerce(v) for k, v in meta["params"].items()}
    p.update({k: coerce(v) for k, v in (params or {}).items()})
    hits = detect(db, p)
    hits = [dict(h) for h in hits]
    sc = scenario or meta.get("scenario") or ",".join("S%d" % i for i in range(1, 9))
    targets = set(x.strip() for x in str(sc).split(",") if x.strip())
    positives, decoys = mini.load_answers()
    res, detail = score(hits, targets, positives, decoys)
    res.update({"rule": meta.get("id") or os.path.basename(path), "file": path, "params": p})
    return res, detail


def print_report(res, detail, show):
    print("规则：%s   参数：%s" % (res["rule"], res["params"] or "无"))
    print("目标场景：%s" % ",".join(res["targets"]))
    print("命中 %d 条：TP %d，误报 %d（噪声/未解释的不同实体 %d），其他场景的真阳性 %d" % (res["hits"], res["tp_hits"], res["fp_hits"], res["fp_unique"], res["other_scenario_hits"]))
    rc = "n/a" if res["recall"] is None else "%d/%d = %.0f%%" % (res["recalled"], res["positives"], res["recall"] * 100)
    pr = "n/a" if res["precision"] is None else "%.0f%%" % (res["precision"] * 100)
    print("召回：%s   精确率：%s" % (rc, pr))
    if res["missed"]:
        print("漏掉：%s" % ", ".join(res["missed"]))
    if show:
        order = {"TP": 0, "OTHER": 1, "FP-噪声": 2, "FP-未解释": 3}
        for kind, ids, h in sorted(detail, key=lambda d: order[d[0]])[:show]:
            print("  [%s] %s  %s" % (kind, ",".join(ids), json.dumps(h, ensure_ascii=False, default=str)[:160]))
        if len(detail) > show:
            print("  ……还有 %d 条（用 --show N 查看更多）" % (len(detail) - show))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("rule", nargs="?", help="规则文件 .sql / .py")
    ap.add_argument("--dir", help="回放目录下所有规则，打印汇总表")
    ap.add_argument("--scenario", help="覆盖规则头里的目标场景，如 S1 或 S1,S2")
    ap.add_argument("--param", action="append", default=[], help="覆盖参数，name=value，可重复")
    ap.add_argument("--show", type=int, default=8, help="最多显示多少条命中（默认 8）")
    ap.add_argument("--json", action="store_true", help="输出 JSON 结果（含全部命中）")
    ap.add_argument("--min-recall", type=float, help="召回低于该值则退出码 1")
    ap.add_argument("--max-fp", type=int, help="误报条数高于该值则退出码 1")
    a = ap.parse_args()
    db = mini.connect()
    params = dict(p.partition("=")[::2] for p in a.param)
    if a.dir:
        files = sorted(glob.glob(os.path.join(a.dir, "*.sql")) + glob.glob(os.path.join(a.dir, "*.py")))
        print("%-34s %-8s %5s %4s %4s %9s" % ("规则", "场景", "命中", "TP", "误报", "召回"))
        for f in files:
            res, _ = run_rule(db, f, a.scenario)
            print("%-34s %-8s %5d %4d %4d %9s" % (os.path.basename(f)[:34], ",".join(res["targets"])[:8], res["hits"], res["tp_hits"], res["fp_hits"],
                                                  "n/a" if res["recall"] is None else "%d/%d" % (res["recalled"], res["positives"])))
        return
    if not a.rule:
        ap.error("需要规则文件或 --dir")
    res, detail = run_rule(db, a.rule, a.scenario, params)
    if a.json:
        out = dict(res)
        out["detail"] = [{"label": k, "matched": ids, "hit": h} for k, ids, h in detail]
        print(json.dumps(out, ensure_ascii=False, indent=2, default=str))
    else:
        print_report(res, detail, a.show)
    bad = False
    if a.min_recall is not None and (res["recall"] or 0) < a.min_recall:
        bad = True
    if a.max_fp is not None and res["fp_hits"] > a.max_fp:
        bad = True
    if bad:
        print("未达标：召回或误报不满足 --min-recall / --max-fp", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
