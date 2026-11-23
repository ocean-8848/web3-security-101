#!/usr/bin/env python3
"""链上 / 账务 / 银行三方对账，并按差异分类（对 data_x/pending_states.jsonl、onchain_transfers.csv、bank_statements.csv）。

“账务”一侧用状态机里的 book 事件；“外部”一侧用链上转账（热钱包对外的转入 / 转出）与银行流水。
按提币 / 充值单（item_id）逐笔对，再反过来查外部流水里没有对应单据的行。分类：
  external_only       外部有流水，账务没有任何单据（无记录的外流 / 回拨）
  external_unbooked   外部已执行，账务单据存在但没有 book（截至 --asof）
  internal_only       账务已 book，外部没有对应流水（假回执 / 未到账）
  duplicate_booking   同一单据被记账多次
  amount_mismatch     外部金额与记账金额之差超过 --amount-tol
  timing              外部与记账日期相差超过 --tol-days 天（仍视为同一笔）
  late_booking        记账比外部执行晚超过 --late-hours 小时
默认不报：银行手续费行（-FEE）、行间划转（sweep）、利息、不足 --dust 的 USDT 微额转入、先 pending 后 settled 的 pending 行、银行退回净额为 0 的单据。

示例：
  python3 code/offchain-ops/lib/recon3.py --score S14-02,S14-03,S14-04,S14-05
  python3 code/offchain-ops/lib/recon3.py --asof 2026-03-11T23:59:59Z      # 看 03-11 日终时的差异（380,000 USDT 尚未记账）
  python3 code/offchain-ops/lib/recon3.py --tol-days 5 --amount-tol 25 --score S14-02,S14-03,S14-04,S14-05
  python3 code/offchain-ops/lib/recon3.py --naive --score S14-02,S14-03,S14-04,S14-05
模块用法：from recon3 import detect; detect(asof="2026-03-11T23:59:59Z")
"""
import os
import sys
from datetime import timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import minix  # noqa: E402

END = "2026-03-15T00:00:00Z"


def detect(asof=END, tol_days=1, amount_tol=1.0, dust=5.0, late_hours=24.0, include_fees=False, include_sweeps=False, include_interest=False,
           pend=None, onchain=None, bank=None):
    pend = pend if pend is not None else [e for e in minix.iter_jsonl("pending_states") if e["ts"] <= asof]
    onchain = onchain if onchain is not None else [x for x in minix.iter_csv("onchain_transfers") if x["ts"] <= asof and x["direction"] in ("in", "out")]
    bank = bank if bank is not None else [x for x in minix.iter_csv("bank_statements") if x["ts"] <= asof]
    items = {}
    for e in pend:
        it = items.setdefault(e["item_id"], {"kind": e["kind"], "rail": e["rail"], "asset": e["asset"], "refs": set(), "books": [], "released": False, "amount": e["amount"]})
        if e["ref"]:
            it["refs"].add(e["ref"])
        if e["event_type"] == "book":
            it["books"].append(e)
        if e["event_type"] in ("release", "fail"):
            it["released"] = True
    oc = {x["tx_hash"]: x for x in onchain}
    bk = {}
    for x in bank:
        bk.setdefault(x["ref"], []).append(x)
    used_hash, used_ref = set(), set()
    out = []
    end_dt = minix.parse_ts(asof)
    for item_id in sorted(items):
        it = items[item_id]
        ext_amt = ext_ts = ext_ref = None
        if it["rail"] == "chain":
            for h in sorted(it["refs"]):
                if h in oc:
                    ext_amt, ext_ts, ext_ref = oc[h]["amount"], oc[h]["ts"], h
                    used_hash.add(h)
        else:
            for ref in sorted(it["refs"]):
                lines = [x for x in bk.get(ref, []) if x["status"] == "settled"]
                used_ref.add(ref)
                if lines:
                    sign = {"withdrawal": -1, "deposit": 1}[it["kind"]]
                    net = sum((x["amount"] if x["direction"] == "credit" else -x["amount"]) for x in lines) * sign
                    ext_amt, ext_ts, ext_ref = round(net, 2), min(x["ts"] for x in lines), ref
        ref_show = ext_ref or (sorted(it["refs"])[-1] if it["refs"] else None)
        nbook = len(it["books"])
        book_amt = it["books"][0]["amount"] if it["books"] else None
        base = {"item_id": item_id, "ref": ref_show, "rail": it["rail"], "asset": it["asset"]}
        if nbook > 1:
            out.append(dict(base, kind="duplicate_booking", booked=nbook, amount=it["amount"]))
        executed = ext_amt is not None and ext_amt > 0
        if executed:
            if nbook == 0:
                out.append(dict(base, kind="external_unbooked", amount=ext_amt, ext_ts=ext_ts, hours=round((end_dt - minix.parse_ts(ext_ts)).total_seconds() / 3600, 1)))
                continue
            if abs(ext_amt - book_amt) > (amount_tol if it["rail"] == "bank" else 1e-9):
                out.append(dict(base, kind="amount_mismatch", external=ext_amt, booked=book_amt))
            bt = minix.parse_ts(it["books"][0]["ts"])
            et = minix.parse_ts(ext_ts)
            if abs((bt.date() - et.date()).days) > tol_days:
                out.append(dict(base, kind="timing", days=abs((bt.date() - et.date()).days), book_ts=it["books"][0]["ts"], ext_ts=ext_ts))
            if (bt - et).total_seconds() / 3600 > late_hours:
                out.append(dict(base, kind="late_booking", hours=round((bt - et).total_seconds() / 3600, 1), book_ts=it["books"][0]["ts"], ext_ts=ext_ts))
        elif nbook >= 1 and not it["released"]:
            if it["rail"] == "bank" and (end_dt - minix.parse_ts(it["books"][-1]["ts"])).days < 3:
                continue  # 银行次日 / 周末才入账，还在途
            out.append(dict(base, kind="internal_only", amount=book_amt))
    for h in sorted(oc):
        x = oc[h]
        if h in used_hash:
            continue
        if x["asset"] == "USDT" and x["amount"] < dust:
            continue
        out.append({"kind": "external_only", "ref": h, "rail": "chain", "asset": x["asset"], "amount": x["amount"], "direction": x["direction"], "ts": x["ts"]})
    for ref in sorted(bk):
        if ref in used_ref:
            continue
        lines = bk[ref]
        x = lines[0]
        if ref.endswith("-FEE") and not include_fees:
            continue
        if x["channel"] == "sweep" and not include_sweeps:
            continue
        if x["channel"] == "interest" and not include_interest:
            continue
        if not any(l["status"] == "settled" for l in lines):
            continue
        out.append({"kind": "external_only", "ref": ref, "rail": "bank", "asset": "USD", "amount": x["amount"], "direction": x["direction"], "channel": x["channel"],
                    "counterparty": x["counterparty_account"], "ts": x["ts"]})
    return out


def main(argv=None):
    ap = minix.new_parser(__doc__)
    ap.add_argument("--asof", default=END, help="对账截止时间（默认 2026-03-15T00:00:00Z），晚于该时间的单据事件与流水都不看")
    ap.add_argument("--tol-days", type=int, default=1, help="外部与记账日期允许相差几天（默认 1）")
    ap.add_argument("--amount-tol", type=float, default=1.0, help="银行金额容忍度（美元，默认 1.0）")
    ap.add_argument("--dust", type=float, default=5.0, help="低于该值的 USDT 无单据转入视为微额噪声（默认 5；0 = 全报）")
    ap.add_argument("--late-hours", type=float, default=24.0, help="记账晚于外部执行多少小时算延迟记账（默认 24）")
    ap.add_argument("--include-fees", action="store_true", help="报银行手续费行")
    ap.add_argument("--include-sweeps", action="store_true", help="报行间划转")
    ap.add_argument("--include-interest", action="store_true", help="报利息")
    ap.add_argument("--naive", action="store_true", help="没调过的参数：--tol-days 0 --amount-tol 0 --dust 0 --late-hours 1 并报手续费、划转、利息")
    minix.common_args(ap)
    a = ap.parse_args(argv)
    if a.naive:
        a.tol_days, a.amount_tol, a.dust, a.late_hours = 0, 0.0, 0.0, 1.0
        a.include_fees = a.include_sweeps = a.include_interest = True
    params = {"asof": a.asof, "tol_days": a.tol_days, "amount_tol": a.amount_tol, "dust": a.dust, "late_hours": a.late_hours,
              "include_fees": a.include_fees, "include_sweeps": a.include_sweeps, "include_interest": a.include_interest}
    return minix.finish("recon3", detect(**params), a, params)


if __name__ == "__main__":
    main()
