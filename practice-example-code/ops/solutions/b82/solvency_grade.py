#!/usr/bin/env python3
"""B82 参考实现：按（日期，资产）算储备覆盖率，给差额分级，可做"如果这笔钱没出去"的假设对账。只用标准库。

用法（从 web3-security-handbook/ 出发）：
  python3 practice-example-code/ops/solutions/b82/solvency_grade.py --from 2026-03-09 --to 2026-03-13
  python3 practice-example-code/ops/solutions/b82/solvency_grade.py --only-breach
  python3 practice-example-code/ops/solutions/b82/solvency_grade.py --no-netting --only-breach
  python3 practice-example-code/ops/solutions/b82/solvency_grade.py --adjust USD@2026-03-10:2026-03-12=480000 --only-breach

口径（本手册示例，对应 X38 3.4 与 6.2，不是行业标准）：
  覆盖率 = 储备合计 / 负债合计（按币数，--basis usd 改按美元）
  分级：>= 100% 绿；95%–100% 黄；< 95% 红
  升级：同一资产连续 2 天及以上不是绿，黄升为红（按日快照，用"连续天数"近似"超过 24 小时未解释"）
  --no-netting：负余额科目（margin_net 为负的日子）不与正余额互抵，负债只汇总正数行
  --adjust 资产@起:止=金额：把一笔"已解释的外流 / 在途款"加回储备（币数），看缺口是否消失
退出码：0 正常；1 存在红级。
"""
import argparse
import csv
import os
import sys
from decimal import Decimal

OPS = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_X = os.path.join(OPS, "data_x")


def cents(s):
    return int((Decimal(s) * 100).to_integral_value())


def load(basis, netting):
    col = "amount" if basis == "native" else "amount_usd"
    res, liab, neg = {}, {}, {}
    with open(os.path.join(DATA_X, "reserve_snapshots.csv"), newline="") as f:
        for r in csv.DictReader(f):
            k = (r["date"], r["asset"])
            res[k] = res.get(k, 0) + cents(r[col])
    with open(os.path.join(DATA_X, "liabilities.csv"), newline="") as f:
        for r in csv.DictReader(f):
            k = (r["date"], r["asset"])
            v = cents(r[col])
            if v < 0 and not netting:
                neg[k] = neg.get(k, 0) + v
                continue
            liab[k] = liab.get(k, 0) + v
    return res, liab, neg


def parse_adjust(text):
    left, amt = text.split("=")
    asset, rng = left.split("@")
    lo, hi = rng.split(":")
    return asset, lo, hi, cents(amt)


def level_of(cov):
    return "绿" if cov >= 1 else ("黄" if cov >= 0.95 else "红")


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--from", dest="lo", default="0000-00-00")
    ap.add_argument("--to", dest="hi", default="9999-99-99")
    ap.add_argument("--basis", choices=["native", "usd"], default="native")
    ap.add_argument("--no-netting", action="store_true", help="负余额科目不与正余额互抵")
    ap.add_argument("--adjust", action="append", default=[], help="资产@起:止=金额（币数），加回储备；可重复")
    ap.add_argument("--assets", default="USD,USDT,BTC,ETH")
    ap.add_argument("--only-breach", action="store_true", help="只显示非绿的行")
    a = ap.parse_args(argv)
    res, liab, neg = load(a.basis, not a.no_netting)
    for t in a.adjust:
        asset, lo, hi, c = parse_adjust(t)
        for k in list(res):
            if k[1] == asset and lo <= k[0] <= hi:
                res[k] += c
    rows, streak = [], {}
    for k in sorted(liab, key=lambda k: (k[1], k[0])):
        d, asset = k
        if asset not in a.assets.split(",") or not (a.lo <= d <= a.hi):
            continue
        cov = res.get(k, 0) / liab[k]
        lv = level_of(cov)
        streak[asset] = (streak.get(asset, 0) + 1) if lv != "绿" else 0
        esc = ""
        if lv == "黄" and streak[asset] >= 2:
            lv, esc = "红", "升级"
        rows.append((d, asset, res.get(k, 0), liab[k], cov, res.get(k, 0) - liab[k], lv, streak[asset], esc, neg.get(k, 0)))
    rows.sort()
    print("基准 %s  互抵 %s  调整 %d 项" % (a.basis, "是" if not a.no_netting else "否", len(a.adjust)))
    print("%-10s %-5s %15s %15s %9s %14s %-3s %3s %-4s" % ("date", "asset", "reserve", "liability", "coverage", "gap", "级", "连续", "备注"))
    n_red = n_nongreen = 0
    for d, asset, r, l, cov, gap, lv, st, esc, ng in rows:
        if lv != "绿":
            n_nongreen += 1
        if lv == "红":
            n_red += 1
        if a.only_breach and lv == "绿":
            continue
        print("%-10s %-5s %15.2f %15.2f %8.2f%% %14.2f %-3s %3d %-4s" % (d, asset, r / 100, l / 100, cov * 100, gap / 100, lv, st, esc))
    print("合计 %d 行，非绿 %d 行，其中红 %d 行" % (len(rows), n_nongreen, n_red))
    return 1 if n_red else 0


if __name__ == "__main__":
    sys.exit(main())
