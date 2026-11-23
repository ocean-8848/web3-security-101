#!/usr/bin/env python3
"""B73：计算规则的 MTTD（从事后还原的真实起点，到告警触发的时间）。

用法（从 web3-security-101/ 出发）：
  python3 practice-example-code/ops/solutions/b73/mttd.py 规则.sql[:调度间隔分钟] ...

起点：answers/ 里每个正例的 window.start（事后还原的真实起点）。
触发时间：规则输出的 fire_ts 列（没有就用 ts 列），再向后取整到下一个调度时刻。
调度间隔默认 5 分钟：规则每 5 分钟跑一次，事件发生后最多再等 5 分钟才出告警。
"""
import math
import os
import sys
from datetime import timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.path.join(os.path.dirname(os.path.dirname(HERE)), "lib")
sys.path.insert(0, LIB)
import mini  # noqa: E402
import replay  # noqa: E402


def ceil_to(t, minutes):
    step = minutes * 60
    sec = int(t.timestamp()) if t.tzinfo else int((t - mini.parse_ts("1970-01-01T00:00:00Z")).total_seconds())
    return mini.parse_ts("1970-01-01T00:00:00Z") + timedelta(seconds=math.ceil(sec / step) * step)


def main(args):
    if not args:
        sys.exit(__doc__)
    db = mini.connect()
    positives = {p["id"]: p for p in mini.load_answers()[0]}
    print("%-26s %-7s %-20s %-20s %s" % ("规则", "答案", "真实起点", "告警时间", "MTTD"))
    for arg in args:
        path, _, interval = arg.partition(":")
        interval = int(interval or 5)
        res, detail = replay.run_rule(db, path)
        best = {}
        for label, ids, hit in detail:
            if label != "TP":
                continue
            fire = hit.get("fire_ts") or hit.get("ts")
            alert = ceil_to(mini.parse_ts(fire), interval)
            for pid in ids:
                if pid not in best or alert < best[pid]:
                    best[pid] = alert
        for pid in sorted(best):
            start = mini.parse_ts(positives[pid]["window"]["start"])
            delta = best[pid] - start
            print("%-26s %-7s %-20s %-20s %s" % (res["rule"], pid, start.strftime("%m-%d %H:%M:%S"), best[pid].strftime("%m-%d %H:%M:%S"), str(delta)))
        for pid in res["missed"]:
            print("%-26s %-7s %-20s %-20s %s" % (res["rule"], pid, "-", "未检出", "-"))


if __name__ == "__main__":
    main(sys.argv[1:])
