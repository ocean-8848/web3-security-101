#!/usr/bin/env python3
"""B80 第 1 步参考实现：切主窗口分析（S12）。只读 data_x/，不改靶场任何文件。

做四件事：
  1. 从 role_change 事件找出新主晋升与旧主被围栏的时刻，得到"双主重叠窗口"
  2. 按分钟 x 节点统计窗口内成交
  3. 把旧主成交分成两类：与新主重复的（可冲销）、只有旧主写过的（陈旧，待裁定）
  4. 算受影响账户与金额；--out 写出冲销清单；再模拟"冲销重复副本"后用 replay_match 复查

用法（从 web3-security-handbook/ 根目录）：
  python3 practice-example-code/ops/solutions/b80/split_brain.py
  python3 practice-example-code/ops/solutions/b80/split_brain.py --out my_b80/reversal.csv
"""
import argparse
import csv
import os
import sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.path.join(HERE, "..", "..", "lib")
sys.path.insert(0, LIB)
import minix  # noqa: E402
from replay_match import detect  # noqa: E402


def analyze():
    log = minix.rows("match_log")
    events = minix.rows("order_events")
    links = minix.rows("trade_ledger_link")
    found = detect()
    stale = [f for f in found if f["kind"] == "stale_epoch_write"][0]
    old, e_old, e_new = stale["node"], stale["epoch"], stale["newer_epoch"]
    promo = [x for x in log if x["event_type"] == "role_change" and x["role"] == "primary" and x["epoch"] == e_new][0]
    fence = [x for x in log if x["event_type"] == "role_change" and x["node"] == old and x["epoch"] == e_new][0]
    w0, w1 = promo["ts"], fence["ts"]
    trades = [x for x in log if x["event_type"] == "trade" and w0 <= x["ts"] <= w1]
    old_t = [x for x in trades if x["node"] == old]
    new_t = [x for x in trades if x["node"] == promo["node"]]
    key = lambda x: (x["buy_order_id"], x["sell_order_id"], x["price"], x["qty"])
    new_by_key = {key(x): x for x in new_t}
    dup = [(x, new_by_key[key(x)]) for x in old_t if key(x) in new_by_key]
    only_old = [x for x in old_t if key(x) not in new_by_key]
    # 账户与金额
    acct = defaultdict(set)
    for e in events:
        if e["match_id"] and e["account_id"]:
            acct[e["match_id"]].add(e["account_id"])
    quote = {}
    for l in links:
        if l["leg"] == "quote" and l["direction"] == "debit":
            quote[l["trade_id"]] = l["amount_usd"]
    return dict(log=log, events=events, found=found, stale=stale, promo=promo, fence=fence, w0=w0, w1=w1,
                old_t=old_t, new_t=new_t, dup=dup, only_old=only_old, acct=acct, quote=quote)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", help="把冲销清单写到这个 CSV")
    a = ap.parse_args()
    r = analyze()
    st = r["stale"]
    span = (minix.parse_ts(r["w1"]) - minix.parse_ts(r["w0"])).total_seconds()
    print("== 双主重叠窗口")
    print("新主晋升  %s  %s epoch %d" % (r["w0"], r["promo"]["node"], r["promo"]["epoch"]))
    print("旧主围栏  %s  %s 降为 standby（epoch %d -> %d）" % (r["w1"], r["fence"]["node"], st["epoch"], st["newer_epoch"]))
    print("重叠时长  %d 秒" % span)
    print()
    print("== 窗口内成交（分钟 x 节点）")
    cnt = Counter((x["ts"][11:16], x["node"]) for x in r["old_t"] + r["new_t"])
    mins = sorted({m for m, _ in cnt})
    print("%-6s %6s %6s" % ("分钟", "me-a", "me-b"))
    for m in mins:
        print("%-6s %6d %6d" % (m, cnt[(m, "me-a")], cnt[(m, "me-b")]))
    print("%-6s %6d %6d" % ("合计", len(r["new_t"]), len(r["old_t"])))
    print()
    dup_ids = [o["match_id"] for o, _ in r["dup"]]
    dup_acct = set().union(*[r["acct"][m] for o, n in r["dup"] for m in (o["match_id"], n["match_id"])])
    old_acct = set().union(*[r["acct"][x["match_id"]] for x in r["only_old"]])
    old_orders = {e["order_id"] for e in r["events"] if e["match_id"] in {x["match_id"] for x in r["only_old"]}}
    dup_value = sum(r["quote"][m] for m in dup_ids)
    stale_value = sum(x["price"] * x["qty"] for x in r["only_old"])
    over = [f for f in r["found"] if f["kind"] == "overfill"]
    print("== 汇总")
    print("旧主 %s 在窗口内写成交      %d 笔（engine_seq 与新主撞车 %d 个）" % (st["node"], len(r["old_t"]), st["engine_seq_collisions"]))
    print("  其中与新主重复（同一对订单同价同量） %d 对，副本已入账金额 %.2f USD，涉及账户 %d 个" % (len(r["dup"]), dup_value, len(dup_acct)))
    print("  其中只有旧主写过（陈旧，待裁定）     %d 笔，成交额 %.2f USD，涉及账户 %d 个、订单 %d 张" % (len(r["only_old"]), stale_value, len(old_acct), len(old_orders)))
    print("超量成交订单（累计成交 = 订单量 2 倍）  %d 张" % len(over))
    print("过载限流拒绝（14:00 起，窗口之前）       %d 张订单" % sum(1 for e in r["events"] if e["reason"] == "overload_shed"))
    # 冲销模拟：去掉重复副本后复查
    rev = set(dup_ids)
    log2 = [x for x in r["log"] if x.get("match_id") not in rev]
    ev2 = [e for e in r["events"] if e.get("match_id") not in rev]
    f2 = detect(log=log2, events=ev2)
    c2 = Counter(f["kind"] for f in f2)
    print()
    print("== 模拟冲销 %d 笔重复副本后，再跑 replay_match" % len(rev))
    print("duplicate_match=%d  overfill=%d  stale_epoch_write=%d（旧主陈旧写入记录仍在，剩余 %d 笔单边成交待裁定）"
          % (c2["duplicate_match"], c2["overfill"], c2["stale_epoch_write"], len(r["only_old"])))
    if a.out:
        os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
        with open(a.out, "w", newline="") as f:
            w = csv.writer(f)
            w.writerow(["trade_id", "node", "symbol", "price", "qty", "notional_usd", "action", "kept_trade_id"])
            for o, n in sorted(r["dup"], key=lambda p: p[0]["match_id"]):
                w.writerow([o["match_id"], o["node"], o["symbol"], o["price"], o["qty"], r["quote"][o["match_id"]], "reverse", n["match_id"]])
            for x in sorted(r["only_old"], key=lambda t: t["match_id"]):
                w.writerow([x["match_id"], x["node"], x["symbol"], x["price"], x["qty"], round(x["price"] * x["qty"], 2), "hold_for_review", ""])
        print()
        print("冲销清单已写入 %s（%d 行：reverse %d，hold_for_review %d）" % (a.out, len(r["dup"]) + len(r["only_old"]), len(r["dup"]), len(r["only_old"])))


if __name__ == "__main__":
    main()
