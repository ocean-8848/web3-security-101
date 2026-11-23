#!/usr/bin/env python3
"""B79 参考实现：不用 lib 的检测器，自己写四条回放检查，再用 minix.score 对答案。

用法（从 web3-security-handbook/ 出发）：
  python3 practice-example-code/ops/solutions/b79/own_checks.py seq      # 序号缺口与冲突（S10-01、S10-02）
  python3 practice-example-code/ops/solutions/b79/own_checks.py ledger   # 无分录、借贷不平、估值（S10-03、04、05）
  python3 practice-example-code/ops/solutions/b79/own_checks.py cancel   # 撤单确认之后仍成交（S11-02）
  python3 practice-example-code/ops/solutions/b79/own_checks.py band     # 成交价偏离标记价超过 10%（S11-01）
只读 data_x/ 与第一批 data/marks.csv，只用标准库加 lib/minix.py。
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "lib"))
import minix  # noqa: E402


def seq():
    by, hits = {}, []
    for e in minix.iter_jsonl("order_events"):
        by.setdefault(e["symbol"], []).append(e)
    for sym, evs in sorted(by.items()):
        seen = {}
        for e in evs:
            seen.setdefault(e["seq"], []).append(e)
        covered = set(seen)
        for e in evs:                                    # 公告预留的区间算"已解释"
            if e["event_type"] == "seq_skip":
                covered.update(range(e["seq"], e["seq_to"] + 1))
        missing = [s for s in range(1, max(seen) + 1) if s not in covered]
        start = None
        for i, s in enumerate(missing):                  # 把连续缺失合并成区间
            if start is None:
                start = prev = s
            elif s == prev + 1:
                prev = s
            else:
                hits.append({"kind": "gap", "gap_key": "%s:%d-%d" % (sym, start, prev)})
                start = prev = s
        if start is not None:
            hits.append({"kind": "gap", "gap_key": "%s:%d-%d" % (sym, start, prev)})
        for s, rows in sorted(seen.items()):             # 同一个序号、内容不同 = 冲突；内容相同 = 原样重传
            if len({(r["order_id"], r["event_type"], r["ts"]) for r in rows}) > 1:
                hits.append({"kind": "dup_conflict", "seq_key": "%s:%d" % (sym, s)})
    return hits


def ledger():
    legs, hits = {}, []
    for x in minix.iter_csv("trade_ledger_link"):
        legs.setdefault(x["trade_id"], []).append(x)
    for t in minix.iter_jsonl("match_log"):
        if t["event_type"] != "trade":
            continue
        ls = legs.get(t["match_id"])
        if not ls:
            hits.append({"kind": "missing_legs", "trade_id": t["match_id"]})
            continue
        net = {}
        for x in ls:
            net[x["asset"]] = net.get(x["asset"], 0.0) + (x["amount"] if x["direction"] == "debit" else -x["amount"])
        if any(abs(v) > 0.011 for v in net.values()):
            hits.append({"kind": "unbalanced", "trade_id": t["match_id"]})
        quote = [x["amount"] for x in ls if x["leg"] == "quote" and x["direction"] == "debit"]
        if quote and abs(quote[0] - round(t["price"] * t["qty"], 2)) > 0.011:
            hits.append({"kind": "valuation", "trade_id": t["match_id"]})
    return hits


def cancel():
    ev = sorted(minix.iter_jsonl("order_events"), key=lambda e: (e["symbol"], e["seq"]))
    cancelled, hits = {}, []
    for e in ev:
        if e["event_type"] == "cancel":
            cancelled[e["order_id"]] = e["seq"]
        elif e["event_type"] in ("fill", "partial_fill") and e["order_id"] in cancelled:
            hits.append({"kind": "fill_after_cancel", "order_id": e["order_id"], "trade_id": e["match_id"]})
    return hits


def band(tol=0.10):
    mk, hits = minix.marks(), []
    for t in minix.iter_jsonl("match_log"):
        if t["event_type"] == "trade":
            m = minix.mark_at(mk, t["symbol"], t["ts"])
            if m and abs(t["price"] / m - 1) > tol:
                hits.append({"kind": "price_off_band", "trade_id": t["match_id"]})
    return hits


TARGET = {"seq": "S10-01,S10-02", "ledger": "S10-03,S10-04,S10-05", "cancel": "S11-02", "band": "S11-01"}

if __name__ == "__main__":
    name = sys.argv[1] if len(sys.argv) > 1 else ""
    if name not in TARGET:
        sys.exit(__doc__)
    hits = globals()[name]()
    res, _ = minix.score(hits, minix.targets_of(TARGET[name]))
    print("%s：命中 %d，TP %d，误报 %d，召回 %d/%d%s" % (name, res["hits"], res["tp_hits"], res["fp_hits"], res["recalled"], res["positives"],
                                                    ("，漏掉 " + ",".join(res["missed"])) if res["missed"] else ""))
