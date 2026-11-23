#!/usr/bin/env python3
"""B79 取证小工具：给定一个对象，把支持"这是真问题"的原始证据摆出来，不看标准答案。

用法（从 web3-security-101/ 出发）：
  python3 practice-example-code/ops/solutions/b79/explain.py trade MT000802      # 一笔成交：撮合日志、两侧回报、分录、重算金额
  python3 practice-example-code/ops/solutions/b79/explain.py order OX006542      # 一张订单的全部事件，按 seq 排序
  python3 practice-example-code/ops/solutions/b79/explain.py gap BTC-USDT 1548 1559   # 序号区间两侧的事件，以及区间内的成交与回报
  python3 practice-example-code/ops/solutions/b79/explain.py account A01736      # 账户的处置动作，以及动作之后的订单
只读 data_x/，只用标准库。
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "lib"))
import minix  # noqa: E402


def short(e):
    keys = ("seq", "ts", "event_type", "order_id", "account_id", "side", "price", "qty", "filled_qty", "match_id", "reason", "source")
    return " ".join("%s=%s" % (k, e[k]) for k in keys if e.get(k) is not None)


def trade(mid):
    t = [r for r in minix.iter_jsonl("match_log") if r["match_id"] == mid and r["event_type"] == "trade"]
    if not t:
        sys.exit("撮合日志里没有 " + mid)
    for r in t:
        print("撮合日志  %s %s node=%s epoch=%s price=%s qty=%s 买=%s 卖=%s" % (r["ts"], r["symbol"], r["node"], r["epoch"], r["price"], r["qty"], r["buy_order_id"], r["sell_order_id"]))
    t = t[0]
    rep = [e for e in minix.iter_jsonl("order_events") if e["match_id"] == mid]
    print("成交回报  %d 条" % len(rep))
    for e in sorted(rep, key=lambda e: e["seq"]):
        print("  " + short(e))
    legs = [x for x in minix.rows("trade_ledger_link") if x["trade_id"] == mid]
    print("分录      %d 条" % len(legs))
    net = {}
    for x in legs:
        print("  %s %s %-7s %-6s %s %s" % (x["ts"], x["leg"], x["asset"], x["direction"], x["account_id"], x["amount"]))
        net[x["asset"]] = round(net.get(x["asset"], 0.0) + (x["amount"] if x["direction"] == "debit" else -x["amount"]), 6)
    print("按资产借方减贷方  " + (", ".join("%s=%s" % (a, net[a]) for a in sorted(net)) or "（无分录）"))
    exp = round(t["price"] * t["qty"], 2)
    q = [x["amount"] for x in legs if x["leg"] == "quote" and x["direction"] == "debit"]
    print("重算 价格×数量 = %s；买方计价币借方 = %s" % (exp, q[0] if q else "（无）"))
    mk = minix.marks()
    m = minix.mark_at(mk, t["symbol"], t["ts"])
    if m:
        print("标记价 %s；成交价偏离 %+.1f%%" % (m, (t["price"] / m - 1) * 100))


def order(oid):
    ev = [e for e in minix.iter_jsonl("order_events") if e["order_id"] == oid]
    if not ev:
        sys.exit("没有订单 " + oid)
    for e in sorted(ev, key=lambda e: (e["symbol"], e["seq"])):
        print(short(e))


def gap(symbol, a, b):
    a, b = int(a), int(b)
    ev = sorted([e for e in minix.iter_jsonl("order_events") if e["symbol"] == symbol], key=lambda e: e["seq"])
    near = [e for e in ev if a - 2 <= e["seq"] <= b + 2]
    print("区间 %d–%d 两侧的事件（%s）" % (a, b, symbol))
    for e in near:
        print("  " + short(e))
    left = [e for e in ev if e["seq"] == a - 1]
    right = [e for e in ev if e["seq"] == b + 1]
    if not (left and right):
        return
    t0, t1 = left[0]["ts"], right[0]["ts"]
    trades = [r for r in minix.iter_jsonl("match_log") if r["event_type"] == "trade" and r["symbol"] == symbol and t0 <= r["ts"] <= t1]
    have = {e["match_id"] for e in ev if e["match_id"]}
    print("缺口时间窗 %s 至 %s，撮合日志里的成交 %d 笔：" % (t0, t1, len(trades)))
    for r in trades:
        print("  %s %s qty=%s  成交回报：%s" % (r["match_id"], r["ts"], r["qty"], "有" if r["match_id"] in have else "全缺"))


def account(aid):
    for c in minix.iter_jsonl("case_actions"):
        if c["account_id"] == aid:
            print("处置 %s %s %s scope=%s 授权=%s 回报=%s %s" % (c["action_id"], c["ts"], c["action"], c["scope"], c["authorizer"], c["report_status"], c["report_ts"]))
    acts = [c for c in minix.iter_jsonl("case_actions") if c["account_id"] == aid]
    if not acts:
        sys.exit("没有该账户的处置动作")
    t0 = min(c["ts"] for c in acts)
    print("该账户 %s 之后的订单事件：" % t0)
    for e in sorted(minix.iter_jsonl("order_events"), key=lambda e: e["ts"]):
        if e["account_id"] == aid and e["ts"] >= t0 and e["event_type"] in ("new", "reject", "fill", "partial_fill", "cancel"):
            print("  " + short(e))


if __name__ == "__main__":
    a = sys.argv[1:]
    fn = {"trade": trade, "order": order, "gap": gap, "account": account}.get(a[0] if a else "")
    if not fn:
        sys.exit(__doc__)
    fn(*a[1:])
