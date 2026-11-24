#!/usr/bin/env python3
"""B73：估算告警量与分诊工作量。

用法（从 web3-security-101/ 出发）：
  python3 code/offchain-ops/solutions/b73/triage.py 规则.sql=P2 规则2.sql=P3 ...

每条规则要带级别（P1–P4）。每条告警的分诊时间是示例值（分钟）：P1 30、P2 20、P3 10、P4 3。
靶场数据共 14 天。输出：每条规则的告警数、噪声告警数、日均告警数、分诊总时间。
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(HERE)), "lib"))
import mini  # noqa: E402
import replay  # noqa: E402

MINUTES = {"P1": 30, "P2": 20, "P3": 10, "P4": 3}
DAYS = 14


def main(args):
    if not args:
        sys.exit(__doc__)
    db = mini.connect()
    tot_alerts = tot_min = tot_fp = 0
    print("%-28s %-3s %6s %6s %8s %8s" % ("规则", "级别", "告警", "误报", "日均告警", "分诊分钟"))
    for arg in args:
        path, _, level = arg.partition("=")
        res, detail = replay.run_rule(db, path)
        n, fp = res["hits"], res["fp_hits"]
        minutes = n * MINUTES[level]
        tot_alerts += n
        tot_fp += fp
        tot_min += minutes
        print("%-28s %-3s %6d %6d %8.1f %8d" % (res["rule"], level, n, fp, n / DAYS, minutes))
    print("%-28s %-3s %6d %6d %8.1f %8d" % ("合计", "", tot_alerts, tot_fp, tot_alerts / DAYS, tot_min))
    print("分诊总时间 %.1f 小时；日均 %.1f 分钟" % (tot_min / 60, tot_min / DAYS))


if __name__ == "__main__":
    main(sys.argv[1:])
