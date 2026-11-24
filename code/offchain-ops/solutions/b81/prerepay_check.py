#!/usr/bin/env python3
"""B81 参考实现：复付前核对。对指定单据逐项核对状态机、外部流水与记账，给出"能不能复付"的结论。

用法（从 web3-security-101/ 出发；只用标准库）：
  python3 code/offchain-ops/solutions/b81/prerepay_check.py PW000761 PW000762 PW000764 PD000763
  python3 code/offchain-ops/solutions/b81/prerepay_check.py PW000762 --asof 2026-03-10T14:40:00Z
  python3 code/offchain-ops/solutions/b81/prerepay_check.py --json PW000762
结论只有三种：PAID（外部已执行，禁止复付）、NOT_PAID（外部没有，复付前必须先过清单）、FIX_BOOK（只需改账）。
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "lib"))
import minix  # noqa: E402

END = "2026-03-15T00:00:00Z"
FRESH_HOURS = 24          # 批准超过这么久，视为过期，复付要重新批准
AMOUNT_TOL = 25.0


def hours(a, b):
    return (minix.parse_ts(b) - minix.parse_ts(a)).total_seconds() / 3600


def load(asof):
    ev = {}
    for e in minix.rows("pending_states"):
        if e["ts"] <= asof:
            ev.setdefault(e["item_id"], []).append(e)
    chain = {r["tx_hash"]: r for r in minix.rows("onchain_transfers") if r["ts"] <= asof}
    bank = {}
    for r in minix.rows("bank_statements"):
        if r["ts"] <= asof:
            bank.setdefault(r["ref"], []).append(r)
    return ev, chain, bank


def check(item, ev, chain, bank, asof):
    es = sorted(ev.get(item, []), key=lambda e: (e["ts"], e["event_id"]))
    if not es:
        return {"item": item, "error": "找不到单据（或 --asof 之前还没有事件）"}
    first = es[0]
    types = [e["event_type"] for e in es]
    ref = next((e["ref"] for e in es if e["ref"]), None)
    ext = chain.get(ref) if first["rail"] == "chain" else (bank.get(ref) or [None])[0]
    books = types.count("book")
    confirms = [e for e in es if e["event_type"] == "confirm"]
    c = {}
    c["C1 外部流水存在（按 ref）"] = ext is not None
    c["C2 外部金额与单据一致"] = bool(ext) and abs(ext["amount"] - first["amount"]) <= AMOUNT_TOL
    if first["kind"] == "withdrawal":
        c["C3 路径完整（有 sign 与 broadcast 才有 confirm）"] = (not confirms) or ("sign" in types and "broadcast" in types)
    else:
        c["C3 路径完整（有 detect 才有 confirm）"] = (not confirms) or ("detect" in types)
    c["C4 回执来自常规通道（actor 为 svc-chain / svc-bank / svc-watch）"] = all(e["actor"] in ("svc-chain", "svc-bank", "svc-watch") for e in confirms)
    c["C5 同一单据只有一次记账"] = books <= 1
    appr = next((e for e in es if e["event_type"] == "approve"), None)
    stale = bool(appr) and hours(appr["ts"], asof) > FRESH_HOURS and "sign" not in types
    c["C6 批准未过期（未签名的批准不超过 %d 小时）" % FRESH_HOURS] = not stale
    # 结论
    if ext is not None:
        verdict = "PAID"
        if books == 0:
            action = "外部已执行但没记账：补记，不要复付；盯住账务延迟"
        elif books > 1:
            action = "外部已执行且重复记账：冲正多出的记账，不要复付"
        else:
            action = "外部已执行并已记账：无需处理，不要复付"
    elif books >= 1 and first["kind"] == "withdrawal":
        verdict = "NOT_PAID"
        action = "账务已扣减但外部没有流水：先冲销记账并查回执来源；复付必须走新单、重新批准，禁止按旧回执复付"
    elif first["kind"] == "withdrawal":
        verdict = "NOT_PAID"
        action = "外部没有流水：旧批准%s；复付走新单重新批准，并先确认客户资金仍在预留中" % ("已过期，作废" if stale else "仍在有效期内，可继续但要有人盯")
    else:
        verdict = "FIX_BOOK"
        action = "充值外部无对应流水，核对 ref"
    if first["kind"] == "deposit" and books > 1:
        verdict, action = "FIX_BOOK", "充值被重复记账 %d 次：冲正多出的 %d 次，补幂等键（receipt_id 或 ref）" % (books, books - 1)
    return {"item": item, "kind": first["kind"], "rail": first["rail"], "asset": first["asset"], "amount": first["amount"],
            "states": types, "checks": {k: bool(v) for k, v in c.items()}, "verdict": verdict, "action": action}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("items", nargs="+")
    ap.add_argument("--asof", default=END)
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    ev, chain, bank = load(a.asof)
    out = [check(i, ev, chain, bank, a.asof) for i in a.items]
    if a.json:
        print(json.dumps(out, ensure_ascii=False))
        return
    for r in out:
        if "error" in r:
            print("%s  %s" % (r["item"], r["error"]))
            continue
        print("%s  %s/%s  %s %s" % (r["item"], r["kind"], r["rail"], r["amount"], r["asset"]))
        print("  状态：" + " > ".join(r["states"]))
        for k, v in r["checks"].items():
            print("  [%s] %s" % ("通过" if v else "不通过", k))
        print("  结论：%s；%s" % (r["verdict"], r["action"]))


if __name__ == "__main__":
    main()
