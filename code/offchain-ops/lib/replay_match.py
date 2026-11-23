#!/usr/bin/env python3
"""撮合日志与成交回报对账、切主窗口检测（对 data_x/match_log.jsonl 与 order_events.jsonl）。

检查项：
  report_missing    撮合日志里有成交，订单事件里缺一边或两边的成交回报（fill / partial_fill）
  report_orphan     订单事件里有成交回报，撮合日志里没有这笔成交
  report_mismatch   回报与撮合日志的价格或数量不一致
  stale_epoch_write 节点用旧 epoch 写成交，而新 epoch 的主节点已晋升（脑裂 / 围栏失效）；split_key 形如 me-b:e2>e3
  duplicate_match   同一对订单、相同价格与数量被成交两次（默认要求：两次来自不同节点，或订单被超量成交）
  overfill          订单累计成交量超过订单量
  epoch_change      主节点更换（计划内也会出现），默认不报（--epoch-changes）
  standby_write     非主节点的心跳记录，默认不报（--standby-heartbeats）

示例：
  python3 code/offchain-ops/lib/replay_match.py --score S12
  python3 code/offchain-ops/lib/replay_match.py --score S10-01 --show 5
  python3 code/offchain-ops/lib/replay_match.py --naive --score S12         # 不确认的重复、计划切主、备节点心跳全报
模块用法：from replay_match import detect; detect(dup_window=60)
"""
import os
import sys
from datetime import timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import minix  # noqa: E402


def detect(dup_window=60, confirm_dups=True, epoch_changes=False, standby_heartbeats=False, log=None, events=None):
    log = log if log is not None else minix.rows("match_log")
    events = events if events is not None else minix.rows("order_events")
    trades = sorted([x for x in log if x["event_type"] == "trade"], key=lambda x: x["match_id"])
    by_mid = {t["match_id"]: t for t in trades}
    fills = {}
    seen_ev = set()
    order_qty = {}
    for e in events:
        if e["event_id"] in seen_ev:
            continue
        seen_ev.add(e["event_id"])
        if e["order_qty"] is not None and e["order_id"]:
            order_qty[e["order_id"]] = e["order_qty"]
        if e["event_type"] in ("fill", "partial_fill") and e["match_id"]:
            fills.setdefault(e["match_id"], []).append(e)
    out = []
    # 成交回报对账
    for t in trades:
        got = {f["order_id"]: f for f in fills.get(t["match_id"], [])}
        miss = [s for s, oid in (("buy", t["buy_order_id"]), ("sell", t["sell_order_id"])) if oid not in got]
        if miss:
            out.append({"kind": "report_missing", "trade_id": t["match_id"], "missing": "+".join(miss), "symbol": t["symbol"], "ts": t["ts"]})
        for oid, f in sorted(got.items()):
            if abs(f["price"] - t["price"]) > 1e-9 or abs(f["qty"] - t["qty"]) > 1e-9:
                out.append({"kind": "report_mismatch", "trade_id": t["match_id"], "order_id": oid, "log_price": t["price"], "report_price": f["price"], "log_qty": t["qty"], "report_qty": f["qty"]})
    for mid in sorted(fills):
        if mid not in by_mid:
            out.append({"kind": "report_orphan", "trade_id": mid, "event_ids": sorted(f["event_id"] for f in fills[mid])})
    # epoch 与切主
    promos = sorted([(x["ts"], x["node"], x["epoch"]) for x in log if x["event_type"] == "role_change" and x["role"] == "primary"])
    grp = {}
    for t in trades:
        newer = max([e for ts, n, e in promos if ts <= t["ts"]] or [0])
        if newer > t["epoch"]:
            g = grp.setdefault((t["node"], t["epoch"], newer), {"count": 0, "first": t["ts"], "last": t["ts"], "seqs": {}})
            g["count"] += 1
            g["last"] = max(g["last"], t["ts"])
            g["first"] = min(g["first"], t["ts"])
    for (node, ep, newer), g in sorted(grp.items()):
        new_seqs = {t["engine_seq"] for t in trades if t["epoch"] == newer and g["first"] <= t["ts"] <= g["last"]}
        old_seqs = {t["engine_seq"] for t in trades if t["node"] == node and t["epoch"] == ep and g["first"] <= t["ts"] <= g["last"]}
        out.append({"kind": "stale_epoch_write", "split_key": "%s:e%d>e%d" % (node, ep, newer), "node": node, "epoch": ep, "newer_epoch": newer, "count": g["count"],
                    "first_ts": g["first"], "last_ts": g["last"], "engine_seq_collisions": len(new_seqs & old_seqs)})
    if epoch_changes:
        prev = None
        for ts, node, ep in promos:
            if prev and ep > prev[2]:
                out.append({"kind": "epoch_change", "split_key": "%s:e%d>e%d" % (prev[1], prev[2], ep), "ts": ts})
            prev = (ts, node, ep)
    if standby_heartbeats:
        n = sum(1 for x in log if x["event_type"] == "heartbeat" and x["role"] == "standby")
        out.append({"kind": "standby_write", "split_key": "heartbeat:standby", "count": n})
    # 重复成交与超量成交
    groups = {}
    for t in trades:
        groups.setdefault((t["symbol"], t["buy_order_id"], t["sell_order_id"], t["price"], t["qty"]), []).append(t)
    filled = {}
    for t in trades:
        for oid in (t["buy_order_id"], t["sell_order_id"]):
            filled[oid] = round(filled.get(oid, 0.0) + t["qty"], 8)
    over = {oid for oid, q in filled.items() if oid in order_qty and q > order_qty[oid] + 1e-9}
    for key in sorted(groups, key=lambda k: groups[k][0]["match_id"]):
        g = sorted(groups[key], key=lambda x: (x["ts"], x["match_id"]))
        for a, b in zip(g, g[1:]):
            if minix.parse_ts(b["ts"]) - minix.parse_ts(a["ts"]) > timedelta(seconds=dup_window):
                continue
            if confirm_dups and a["node"] == b["node"] and a["buy_order_id"] not in over and a["sell_order_id"] not in over:
                continue
            out.append({"kind": "duplicate_match", "trade_id": a["match_id"], "dup_trade_id": b["match_id"], "nodes": "%s,%s" % (a["node"], b["node"]), "symbol": a["symbol"], "qty": a["qty"]})
    for oid in sorted(over):
        out.append({"kind": "overfill", "order_id": oid, "order_qty": order_qty[oid], "filled": filled[oid]})
    return out


def main(argv=None):
    ap = minix.new_parser(__doc__)
    ap.add_argument("--dup-window", type=int, default=60, help="同一对订单的两次相同成交相隔多少秒内算重复候选（默认 60）")
    ap.add_argument("--no-confirm-dups", dest="confirm_dups", action="store_false", help="不确认，所有重复候选都报（会报合法的部分成交）")
    ap.add_argument("--epoch-changes", action="store_true", help="报告每次主节点更换（含计划内）")
    ap.add_argument("--standby-heartbeats", action="store_true", help="报告备节点心跳")
    ap.add_argument("--naive", action="store_true", help="没调过的参数：--no-confirm-dups --epoch-changes --standby-heartbeats")
    minix.common_args(ap)
    a = ap.parse_args(argv)
    if a.naive:
        a.confirm_dups, a.epoch_changes, a.standby_heartbeats = False, True, True
    params = {"dup_window": a.dup_window, "confirm_dups": a.confirm_dups, "epoch_changes": a.epoch_changes, "standby_heartbeats": a.standby_heartbeats}
    return minix.finish("replay_match", detect(**params), a, params)


if __name__ == "__main__":
    main()
