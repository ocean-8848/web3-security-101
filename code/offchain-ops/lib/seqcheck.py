#!/usr/bin/env python3
"""订单序号连续性与重复检查（对 data_x/order_events.jsonl）。

每个品种有自己的序号（seq）。本脚本按品种检查：
  gap             序号缺口（缺失区间）；运维公告的预留区间（seq_skip 事件）算 gap_announced，默认不报
  dup_conflict    同一序号对应内容不同的事件（序号服务双发 / 计数器回退）
  dup_identical   同一序号、内容完全相同（网关重传），默认不报
  out_of_order    文件里序号比已见最大值小（到达乱序），默认不检查（--check-order）

示例（从 web3-security-101/ 出发）：
  python3 code/offchain-ops/lib/seqcheck.py
  python3 code/offchain-ops/lib/seqcheck.py --symbol BTC-USDT --show 20
  python3 code/offchain-ops/lib/seqcheck.py --score S10 --max-fp 0
  python3 code/offchain-ops/lib/seqcheck.py --naive --score S10      # 没调过的参数：公告预留、重传、乱序全报
模块用法：from seqcheck import detect; detect(symbol="BTC-USDT")
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import minix  # noqa: E402


def _ranges(nums):
    out = []
    for n in sorted(nums):
        if out and n == out[-1][1] + 1:
            out[-1][1] = n
        else:
            out.append([n, n])
    return out


def detect(symbol=None, ignore_identical=True, include_announced=False, check_order=False, rows=None):
    rows = rows if rows is not None else minix.rows("order_events")
    by = {}
    for r in rows:
        if symbol and r["symbol"] != symbol:
            continue
        by.setdefault(r["symbol"], []).append(r)
    out = []
    for sym in sorted(by):
        lines = by[sym]
        seen = {}
        ann = set()
        for r in lines:
            seen.setdefault(r["seq"], []).append(r)
            if r["event_type"] == "seq_skip" and r["seq_to"]:
                ann.update(range(r["seq"] + 1, r["seq_to"] + 1))
        top = max(seen)
        missing = [n for n in range(1, top + 1) if n not in seen]
        for lo, hi in _ranges(missing):
            announced = all(n in ann for n in range(lo, hi + 1))
            if announced and not include_announced:
                continue
            out.append({"kind": "gap_announced" if announced else "gap", "symbol": sym, "gap_key": "%s:%d-%d" % (sym, lo, hi), "seq_from": lo, "seq_to": hi, "missing": hi - lo + 1})
        for seq in sorted(seen):
            rs = seen[seq]
            if len(rs) < 2:
                continue
            same = len({json.dumps(x, sort_keys=True) for x in rs}) == 1
            if same and ignore_identical:
                continue
            out.append({"kind": "dup_identical" if same else "dup_conflict", "symbol": sym, "seq_key": "%s:%d" % (sym, seq), "seq": seq, "event_ids": sorted({x["event_id"] for x in rs})})
        if check_order:
            top_seen = 0
            done = set()
            for r in lines:
                if r["seq"] < top_seen and r["seq"] not in done and len(seen[r["seq"]]) == 1:
                    out.append({"kind": "out_of_order", "symbol": sym, "seq_key": "%s:%d" % (sym, r["seq"]), "seq": r["seq"], "event_id": r["event_id"]})
                    done.add(r["seq"])
                top_seen = max(top_seen, r["seq"])
    return out


def main(argv=None):
    ap = minix.new_parser(__doc__)
    ap.add_argument("--symbol", help="只查一个品种，如 BTC-USDT")
    ap.add_argument("--include-identical", dest="ignore_identical", action="store_false", help="也报内容完全相同的重复序号（重传）")
    ap.add_argument("--include-announced", action="store_true", help="也报运维公告的序号预留区间")
    ap.add_argument("--check-order", action="store_true", help="检查文件里的到达乱序")
    ap.add_argument("--naive", action="store_true", help="没调过的参数：等价于 --include-identical --include-announced --check-order")
    minix.common_args(ap)
    a = ap.parse_args(argv)
    if a.naive:
        a.ignore_identical, a.include_announced, a.check_order = False, True, True
    params = {"symbol": a.symbol, "ignore_identical": a.ignore_identical, "include_announced": a.include_announced, "check_order": a.check_order}
    return minix.finish("seqcheck", detect(**params), a, params)


if __name__ == "__main__":
    main()
