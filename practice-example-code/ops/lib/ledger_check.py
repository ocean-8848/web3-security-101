#!/usr/bin/env python3
"""成交—分录平衡与估值检查（对 data_x/trade_ledger_link.csv 与 match_log.jsonl 里的成交）。

检查项：
  missing_legs   成交在关联表里没有任何分录
  unbalanced     同一笔成交（txn）按资产汇总，借方与贷方之差超过 --tol
  valuation      买方计价币借方金额 ≠ 价格 × 数量（四舍五入到分）超过 --tol
  qty_mismatch   卖方基础币借方金额 ≠ 成交数量
  price_off_mark 成交价偏离第一批标记价超过 --mark-tol（默认 0 = 不查）
  late_posting   分录比成交晚超过 --late-sec 秒（默认 0 = 不查）
  missing_fee    成交额 ≥ --min-fee-notional 但没有手续费分录（默认不查，加 --require-fee）

示例：
  python3 practice-example-code/ops/lib/ledger_check.py
  python3 practice-example-code/ops/lib/ledger_check.py --score S10 --max-fp 0
  python3 practice-example-code/ops/lib/ledger_check.py --naive --score S10     # tol=0、查手续费与延迟
  python3 practice-example-code/ops/lib/ledger_check.py --mark-tol 0.10 --score S11
模块用法：from ledger_check import detect; detect(tol=0.011)
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import minix  # noqa: E402


def detect(tol=0.011, mark_tol=0.0, late_sec=0, require_fee=False, min_fee_notional=10.0, trades=None, links=None):
    ml = trades if trades is not None else [r for r in minix.iter_jsonl("match_log") if r["event_type"] == "trade"]
    links = links if links is not None else minix.rows("trade_ledger_link")
    by = {}
    for x in links:
        by.setdefault(x["trade_id"], []).append(x)
    mk = minix.marks() if mark_tol else None
    out = []
    for t in sorted(ml, key=lambda r: r["match_id"]):
        mid = t["match_id"]
        legs = by.get(mid)
        if not legs:
            out.append({"kind": "missing_legs", "trade_id": mid, "symbol": t["symbol"], "ts": t["ts"]})
            continue
        txn = legs[0]["txn_id"]
        net = {}
        for x in legs:
            net[x["asset"]] = round(net.get(x["asset"], 0.0) + (x["amount"] if x["direction"] == "debit" else -x["amount"]), 6)
        for asset in sorted(net):
            if abs(net[asset]) > tol:
                out.append({"kind": "unbalanced", "trade_id": mid, "txn_id": txn, "asset": asset, "diff": round(net[asset], 4), "symbol": t["symbol"]})
        quote_debit = [x for x in legs if x["leg"] == "quote" and x["direction"] == "debit"]
        exp = round(t["price"] * t["qty"], 2)
        if quote_debit and abs(quote_debit[0]["amount"] - exp) > tol:
            out.append({"kind": "valuation", "trade_id": mid, "txn_id": txn, "expected": exp, "booked": quote_debit[0]["amount"], "symbol": t["symbol"]})
        base_debit = [x for x in legs if x["leg"] == "base" and x["direction"] == "debit"]
        if base_debit and abs(base_debit[0]["amount"] - t["qty"]) > 1e-6:
            out.append({"kind": "qty_mismatch", "trade_id": mid, "txn_id": txn, "expected": t["qty"], "booked": base_debit[0]["amount"]})
        if require_fee and exp >= min_fee_notional and not any(x["leg"] == "fee" for x in legs):
            out.append({"kind": "missing_fee", "trade_id": mid, "txn_id": txn, "notional": exp})
        if late_sec:
            delay = (minix.parse_ts(max(x["ts"] for x in legs)) - minix.parse_ts(t["ts"])).total_seconds()
            if delay > late_sec:
                out.append({"kind": "late_posting", "trade_id": mid, "txn_id": txn, "delay_s": int(delay)})
        if mark_tol:
            m = minix.mark_at(mk, t["symbol"], t["ts"])
            if m and abs(t["price"] / m - 1) > mark_tol:
                out.append({"kind": "price_off_mark", "trade_id": mid, "txn_id": txn, "price": t["price"], "mark": m, "deviation": round(t["price"] / m - 1, 4)})
    return out


def main(argv=None):
    ap = minix.new_parser(__doc__)
    ap.add_argument("--tol", type=float, default=0.011, help="借贷差与金额的容忍度（默认 0.011，吸收一分钱舍入）")
    ap.add_argument("--mark-tol", type=float, default=0.0, help="成交价偏离标记价的比例，超过则报（默认 0 = 不查）")
    ap.add_argument("--late-sec", type=int, default=0, help="分录晚于成交多少秒算延迟（默认 0 = 不查）")
    ap.add_argument("--require-fee", action="store_true", help="要求每笔成交都有手续费分录")
    ap.add_argument("--min-fee-notional", type=float, default=10.0, help="低于该成交额（美元）不要求手续费分录（默认 10）")
    ap.add_argument("--naive", action="store_true", help="没调过的参数：--tol 0 --require-fee --min-fee-notional 0 --late-sec 300")
    minix.common_args(ap)
    a = ap.parse_args(argv)
    if a.naive:
        a.tol, a.require_fee, a.min_fee_notional, a.late_sec = 0.0, True, 0.0, 300
    params = {"tol": a.tol, "mark_tol": a.mark_tol, "late_sec": a.late_sec, "require_fee": a.require_fee, "min_fee_notional": a.min_fee_notional}
    return minix.finish("ledger_check", detect(**params), a, params)


if __name__ == "__main__":
    main()
