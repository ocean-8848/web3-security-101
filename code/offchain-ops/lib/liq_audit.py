#!/usr/bin/env python3
"""强平延迟、穿仓与保险基金检查（对 data_x/liquidations.csv，可选 positions.csv）。

检查项：
  delayed_liquidation  触发到执行的延迟超过 --sla 秒（默认 60）
  bankruptcy           强平后权益为负（穿仓），缺口不少于 --min-shortfall 美元（默认 0.01）
  fund_exhausted       保险基金耗尽，出现未覆盖亏损 unfunded_loss（触发 ADL）
  equity_mismatch      --verify：用持仓与成交价重算的权益与记录不一致
  fund_discontinuity   --verify：保险基金余额不连续（fund_before 不等于上一行的 fund_after）

示例：
  python3 code/offchain-ops/lib/liq_audit.py --score S13
  python3 code/offchain-ops/lib/liq_audit.py --min-shortfall 5000 --score S13 --max-fp 0
  python3 code/offchain-ops/lib/liq_audit.py --naive --score S13          # SLA 30 秒、任何穿仓都报
  python3 code/offchain-ops/lib/liq_audit.py --verify
模块用法：from liq_audit import detect; detect(sla=60, min_shortfall=5000)
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import minix  # noqa: E402


def detect(sla=60, min_shortfall=0.01, verify=False, liqs=None):
    liqs = liqs if liqs is not None else minix.rows("liquidations")
    out = []
    prev_after = None
    for x in sorted(liqs, key=lambda x: x["liq_id"]):
        base = {"liq_id": x["liq_id"], "account_id": x["account_id"], "symbol": x["symbol"], "exec_ts": x["exec_ts"]}
        delay = (minix.parse_ts(x["exec_ts"]) - minix.parse_ts(x["trigger_ts"])).total_seconds()
        if delay > sla:
            out.append(dict(base, kind="delayed_liquidation", delay_s=int(delay)))
        if x["shortfall"] >= min_shortfall:
            out.append(dict(base, kind="bankruptcy", shortfall=x["shortfall"], delay_s=int(delay)))
        if x["unfunded_loss"] > 0:
            out.append(dict(base, kind="fund_exhausted", unfunded_loss=x["unfunded_loss"], fund_before=x["fund_before"], adl=int(x["adl"])))
        if verify:
            eq = x["margin"] + ((x["exec_price"] - x["entry_price"]) if x["side"] == "long" else (x["entry_price"] - x["exec_price"])) * x["qty"]
            if abs(eq - x["equity_at_exec"]) > 0.05:
                out.append(dict(base, kind="equity_mismatch", recomputed=round(eq, 2), recorded=x["equity_at_exec"]))
            if prev_after is not None and abs(prev_after - x["fund_before"]) > 0.01:
                out.append(dict(base, kind="fund_discontinuity", expected=prev_after, recorded=x["fund_before"]))
        prev_after = x["fund_after"]
    return out


def main(argv=None):
    ap = minix.new_parser(__doc__)
    ap.add_argument("--sla", type=int, default=60, help="强平延迟 SLA（秒，默认 60）")
    ap.add_argument("--min-shortfall", type=float, default=0.01, help="穿仓缺口低于该值（美元）不报（默认 0.01，即任何穿仓都报）")
    ap.add_argument("--verify", action="store_true", help="重算权益并检查保险基金余额连续性")
    ap.add_argument("--naive", action="store_true", help="没调过的参数：--sla 30（穿仓仍是任何缺口都报）")
    minix.common_args(ap)
    a = ap.parse_args(argv)
    if a.naive:
        a.sla = 30
    params = {"sla": a.sla, "min_shortfall": a.min_shortfall, "verify": a.verify}
    return minix.finish("liq_audit", detect(**params), a, params)


if __name__ == "__main__":
    main()
