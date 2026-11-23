#!/usr/bin/env python3
"""价格保护与权限撤销检查（对 data_x/order_events.jsonl、case_actions.jsonl，标记价取自第一批 data/marks.csv）。

检查项：
  price_off_band          成交价偏离同一时刻标记价超过 --band（默认 10%）
  fill_after_cancel       撤单确认之后，同一订单仍有成交（默认按序号 seq 判断，--by-ts 改按时间戳）
  post_restriction_order  交易受限（restrict / revoke_trade 且 scope 为 trade 或 all，或 legal_freeze）之后仍被受理的新订单
                          （超过 --grace 秒；reject 不算；--any-scope 连 withdraw 范围的限制也算；--include-rejects 把被拒绝的也算）

示例：
  python3 practice-example-code/ops/lib/order_audit.py --score S11
  python3 practice-example-code/ops/lib/order_audit.py --band 0.05 --score S11
  python3 practice-example-code/ops/lib/order_audit.py --naive --score S11
  python3 practice-example-code/ops/lib/order_audit.py --effective report --score S11,S15-04   # 限制按业务端回报时间生效
模块用法：from order_audit import detect; detect(band=0.10)
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import minix  # noqa: E402

END = "2026-03-15T00:00:00Z"
START_ACTS = {"restrict", "revoke_trade", "legal_freeze"}
END_ACTS = {"release", "legal_unfreeze"}


def intervals(actions, effective="action", any_scope=False):
    """账户 -> [(开始, 结束, action_id)]。effective=report 时开始取业务端回报时间，回报失败 / 缺失的限制不生效。"""
    iv = {}
    cur = {}
    for a in sorted(actions, key=lambda a: (a["ts"], a["action_id"])):
        if not any_scope and a["scope"] not in ("trade", "all"):
            continue
        key = (a["case_id"], a["account_id"])
        when = a["ts"]
        if effective == "report":
            if a["report_status"] != "applied":
                continue
            when = a["report_ts"]
        if a["action"] in START_ACTS and key not in cur:
            cur[key] = (when, a["action_id"])
        elif a["action"] in END_ACTS and key in cur:
            s, aid = cur.pop(key)
            iv.setdefault(a["account_id"], []).append((s, when, aid))
    for (case, acct), (s, aid) in cur.items():
        iv.setdefault(acct, []).append((s, END, aid))
    return iv


def detect(band=0.10, by_ts=False, grace=60, any_scope=False, include_rejects=False, effective="action", events=None, actions=None):
    ev = events if events is not None else minix.rows("order_events")
    actions = actions if actions is not None else minix.rows("case_actions")
    seen, rows = set(), []
    for e in ev:
        if e["event_id"] in seen:
            continue
        seen.add(e["event_id"])
        rows.append(e)
    mk = minix.marks()
    out = []
    done = set()
    for e in sorted(rows, key=lambda e: e["event_id"]):
        if e["event_type"] in ("fill", "partial_fill") and e["match_id"] not in done:
            done.add(e["match_id"])
            m = minix.mark_at(mk, e["symbol"], e["ts"])
            if m and abs(e["price"] / m - 1) > band:
                out.append({"kind": "price_off_band", "trade_id": e["match_id"], "symbol": e["symbol"], "price": e["price"], "mark": m, "deviation": round(e["price"] / m - 1, 4), "ts": e["ts"]})
    cancels = {}
    for e in rows:
        if e["event_type"] == "cancel":
            cur = cancels.get(e["order_id"])
            if cur is None or e["seq"] < cur["seq"]:
                cancels[e["order_id"]] = e
    for e in sorted(rows, key=lambda e: e["event_id"]):
        if e["event_type"] in ("fill", "partial_fill") and e["order_id"] in cancels:
            c = cancels[e["order_id"]]
            late = (e["ts"] >= c["ts"]) if by_ts else (e["seq"] > c["seq"])
            if late:
                out.append({"kind": "fill_after_cancel", "order_id": e["order_id"], "trade_id": e["match_id"], "cancel_seq": c["seq"], "fill_seq": e["seq"], "cancel_ts": c["ts"], "fill_ts": e["ts"]})
    iv = intervals(actions, effective, any_scope)
    kinds = ("new", "reject") if include_rejects else ("new",)
    for e in sorted(rows, key=lambda e: e["event_id"]):
        if e["event_type"] not in kinds or e["account_id"] not in iv:
            continue
        t = minix.parse_ts(e["ts"])
        for s, en, aid in iv[e["account_id"]]:
            if minix.parse_ts(s).timestamp() + grace < t.timestamp() < minix.parse_ts(en).timestamp():
                out.append({"kind": "post_restriction_order", "order_id": e["order_id"], "account_id": e["account_id"], "action_id": aid, "ts": e["ts"], "event_type": e["event_type"]})
                break
    return out


def main(argv=None):
    ap = minix.new_parser(__doc__)
    ap.add_argument("--band", type=float, default=0.10, help="价格带：成交价偏离标记价的比例（默认 0.10）")
    ap.add_argument("--by-ts", action="store_true", help="撤单后成交按时间戳判断（默认按序号 seq；同一秒的竞态会被误报）")
    ap.add_argument("--grace", type=int, default=60, help="限制生效后的宽限秒数（默认 60）")
    ap.add_argument("--any-scope", action="store_true", help="连 scope=withdraw 的限制也当作交易限制")
    ap.add_argument("--include-rejects", action="store_true", help="被拒绝的订单也算")
    ap.add_argument("--effective", choices=["action", "report"], default="action", help="限制按指令时间（action，默认）还是业务端回报时间（report）生效")
    ap.add_argument("--naive", action="store_true", help="没调过的参数：--band 0.05 --by-ts --include-rejects")
    minix.common_args(ap)
    a = ap.parse_args(argv)
    if a.naive:
        a.band, a.by_ts, a.include_rejects = 0.05, True, True
    params = {"band": a.band, "by_ts": a.by_ts, "grace": a.grace, "any_scope": a.any_scope, "include_rejects": a.include_rejects, "effective": a.effective}
    return minix.finish("order_audit", detect(**params), a, params)


if __name__ == "__main__":
    main()
