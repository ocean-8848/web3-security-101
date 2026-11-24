#!/usr/bin/env python3
"""储备与负债覆盖检查（对 data_x/reserve_snapshots.csv、liabilities.csv，核对 wallet_balances.csv 与 bank_statements.csv）。

覆盖率 = 储备 / 负债，按（日期，资产）计算：
  --basis native  按币数（默认；储备与负债取价时点不同不会造成假差额）
  --basis usd     按美元（BTC / ETH 价格日内波动会造成假差额）
检查项：
  shortfall        覆盖率低于 --threshold（默认 1.0）；reserve_key 形如 USD@2026-03-10
  wallet_mismatch  --verify：onchain_* 储备合计与 wallet_balances 日终余额不一致
  bank_mismatch    --verify：USD 的 bank 储备与银行流水日终余额不一致

示例：
  python3 code/offchain-ops/lib/reserve_check.py --score S14-01
  python3 code/offchain-ops/lib/reserve_check.py --threshold 0.995 --score S14-01 --max-fp 0
  python3 code/offchain-ops/lib/reserve_check.py --naive --score S14-01      # 按美元算
  python3 code/offchain-ops/lib/reserve_check.py --verify
模块用法：from reserve_check import detect; detect(threshold=0.995)
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import minix  # noqa: E402


def detect(threshold=1.0, basis="native", verify=False, res=None, liab=None):
    res = res if res is not None else minix.rows("reserve_snapshots")
    liab = liab if liab is not None else minix.rows("liabilities")
    col = "amount" if basis == "native" else "amount_usd"
    R, L = {}, {}
    for x in res:
        R[(x["date"], x["asset"])] = R.get((x["date"], x["asset"]), 0.0) + x[col]
    for x in liab:
        L[(x["date"], x["asset"])] = L.get((x["date"], x["asset"]), 0.0) + x[col]
    out = []
    for k in sorted(L):
        cov = R.get(k, 0.0) / L[k]
        if cov < threshold:
            out.append({"kind": "shortfall", "reserve_key": "%s@%s" % (k[1], k[0]), "asset": k[1], "date": k[0], "coverage": round(cov, 4), "gap": round(R.get(k, 0.0) - L[k], 2), "basis": basis})
    if verify:
        w = {}
        for x in minix.iter_csv("wallet_balances"):
            key = (x["date"], x["asset"], x["tier"])
            w[key] = round(w.get(key, 0.0) + x["balance"], 4)
        for x in res:
            if x["source"].startswith("onchain_"):
                key = (x["date"], x["asset"], x["source"][8:])
                if abs(w.get(key, 0.0) - x["amount"]) > 0.01:
                    out.append({"kind": "wallet_mismatch", "reserve_key": "%s@%s" % (x["asset"], x["date"]), "tier": x["source"][8:], "reserve": x["amount"], "wallets": w.get(key)})
        bal = {}
        for b in sorted(minix.iter_csv("bank_statements"), key=lambda b: b["stmt_id"]):
            if b["status"] == "settled":
                bal.setdefault(b["bank_account"], []).append((b["ts"], b["balance"]))
        opening = {"BK-OPS-1": 3200000.0, "BK-OPS-2": 2800000.0}
        for x in res:
            if x["source"] == "bank":
                cut = x["date"] + "T24"
                tot = 0.0
                for acct, o in opening.items():
                    last = o
                    for ts, b in bal.get(acct, []):
                        if ts[:10] <= x["date"]:
                            last = b
                    tot += last
                if abs(tot - x["amount"]) > 0.01:
                    out.append({"kind": "bank_mismatch", "reserve_key": "%s@%s" % (x["asset"], x["date"]), "reserve": x["amount"], "statement": round(tot, 2)})
    return out


def main(argv=None):
    ap = minix.new_parser(__doc__)
    ap.add_argument("--threshold", type=float, default=1.0, help="覆盖率阈值，低于则报（默认 1.0）")
    ap.add_argument("--basis", choices=["native", "usd"], default="native", help="按币数还是按美元计覆盖率（默认 native）")
    ap.add_argument("--verify", action="store_true", help="核对 onchain 储备与钱包余额、bank 储备与银行流水")
    ap.add_argument("--naive", action="store_true", help="没调过的参数：--basis usd")
    minix.common_args(ap)
    a = ap.parse_args(argv)
    if a.naive:
        a.basis = "usd"
    params = {"threshold": a.threshold, "basis": a.basis, "verify": a.verify}
    return minix.finish("reserve_check", detect(**params), a, params)


if __name__ == "__main__":
    main()
