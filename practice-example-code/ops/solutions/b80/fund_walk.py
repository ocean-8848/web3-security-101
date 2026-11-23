#!/usr/bin/env python3
"""B80 第 2 步参考实现：强平延迟、穿仓缺口与保险基金耗尽点（S13）。只读 data_x/liquidations.csv。

对窗口内的强平，按执行时间逐笔走一遍保险基金：
  - 延迟 = exec - trigger，对照 SLA
  - 穿仓缺口 = 执行后权益为负的绝对值
  - 基金余额逐笔变化，找出第一笔"基金不够付"的强平（耗尽点）
  - 反事实：如果按触发时的标记价成交，账户权益是多少（只用来衡量"延迟的代价"）
  - 核对：基金余额链连续；缺口 = 基金支付 + 未覆盖亏损

用法（从 web3-security-101/ 根目录）：
  python3 practice-example-code/ops/solutions/b80/fund_walk.py
  python3 practice-example-code/ops/solutions/b80/fund_walk.py --start 2026-03-12T09:15:00Z --end 2026-03-12T09:55:00Z --sla 60
"""
import argparse
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
import minix  # noqa: E402


def walk(start, end, sla):
    liqs = [x for x in minix.rows("liquidations") if start <= x["trigger_ts"] <= end]
    liqs.sort(key=lambda x: (x["exec_ts"], x["liq_id"]))
    out = []
    cum = 0.0
    exhausted = None
    prev_after = None
    chain_ok = True
    for x in liqs:
        sign = 1 if x["side"] == "long" else -1
        eq_trigger = x["margin"] + sign * (x["trigger_mark"] - x["entry_price"]) * x["qty"]
        paid = -x["fund_delta"] if x["fund_delta"] < 0 else 0.0
        cum += x["shortfall"]
        if prev_after is not None and abs(prev_after - x["fund_before"]) > 0.01:
            chain_ok = False
        prev_after = x["fund_after"]
        if exhausted is None and x["unfunded_loss"] > 0:
            exhausted = x["liq_id"]
        out.append(dict(x, eq_trigger=eq_trigger, paid=paid, cum=cum,
                        late=x["delay_s"] > sla, broke=x["shortfall"] > 0,
                        split_ok=abs(x["shortfall"] - paid - x["unfunded_loss"]) < 0.01 if x["shortfall"] > 0 else True))
    return out, exhausted, chain_ok


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--start", default="2026-03-12T09:15:00Z", help="按触发时间筛选的起点（默认 S13 时间窗）")
    ap.add_argument("--end", default="2026-03-12T09:55:00Z")
    ap.add_argument("--sla", type=int, default=60)
    a = ap.parse_args()
    rows, exhausted, chain_ok = walk(a.start, a.end, a.sla)
    if not rows:
        raise SystemExit("时间窗内没有强平")
    print("%-8s %-8s %5s %-7s %11s %11s %11s %11s %11s" % ("liq_id", "账户", "延迟s", "穿仓?", "缺口", "基金支付", "基金余额", "未覆盖亏损", "触发价权益"))
    for x in rows:
        print("%-8s %-8s %5d %-7s %11.2f %11.2f %11.2f %11.2f %11.2f%s" % (
            x["liq_id"], x["account_id"], x["delay_s"], "穿仓" if x["broke"] else "-", x["shortfall"], x["paid"],
            x["fund_after"], x["unfunded_loss"], x["eq_trigger"], "  <- 耗尽点" if x["liq_id"] == exhausted else ""))
    late = [x for x in rows if x["late"]]
    broke = [x for x in rows if x["broke"]]
    first = rows[0]
    ex = [x for x in rows if x["liq_id"] == exhausted][0]
    print()
    print("== 汇总（窗口 %s 至 %s，SLA %d 秒）" % (a.start, a.end, a.sla))
    print("强平 %d 笔；超 SLA %d 笔（延迟 %d–%d 秒）" % (len(rows), len(late), min(x["delay_s"] for x in late), max(x["delay_s"] for x in late)))
    print("穿仓 %d 笔，缺口合计 %.2f（最小 %.2f，最大 %.2f）" % (len(broke), sum(x["shortfall"] for x in broke), min(x["shortfall"] for x in broke), max(x["shortfall"] for x in broke)))
    print("窗口起点基金余额 %.2f；耗尽点 %s（基金余额 %.2f 不够付缺口 %.2f）" % (first["fund_before"], ex["liq_id"], ex["fund_before"], ex["shortfall"]))
    print("未覆盖亏损合计 %.2f（%s），触发 ADL %d 笔" % (sum(x["unfunded_loss"] for x in rows), "+".join(x["liq_id"] for x in rows if x["unfunded_loss"] > 0), sum(int(x["adl"]) for x in rows)))
    print("耗尽点之前的累计缺口 %.2f = 起点基金 %.2f + 期间清算费 %.2f - 耗尽点余额 %.2f" % (
        ex["cum"] - ex["shortfall"], first["fund_before"], sum(x["fund_delta"] for x in rows if x["fund_delta"] > 0 and x["exec_ts"] < ex["exec_ts"]), ex["fund_before"]))
    print("反事实：10 笔若按触发价成交，权益合计 %.2f，全部为正（%s）" % (
        sum(x["eq_trigger"] for x in rows), "是" if all(x["eq_trigger"] > 0 for x in rows) else "否"))
    print("核对：基金余额链连续 %s；缺口 = 基金支付 + 未覆盖亏损 %s" % ("是" if chain_ok else "否", "是" if all(x["split_ok"] for x in rows) else "否"))


if __name__ == "__main__":
    main()
