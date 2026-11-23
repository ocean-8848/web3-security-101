#!/usr/bin/env python3
"""从事件表计算 MTTD / MTTR / 处置窗口（分钟）。

输入 CSV 列：id,started_at,detected_at,impact_at,contained_at（UTC，ISO 8601，以 Z 结尾）
  started_at   第一条恶意证据的时间（来自你的时间线）
  detected_at  规则或人第一次能发现的时间（链式规则取最后一步出现的时间）
  impact_at    资金离开或关键资产被触达的时间
  contained_at 遏制完成的时间（本章用桌面推演里的决策时刻）
输出：MTTD = detected - started；窗口 = impact - detected（< 0 表示先出事后发现）；MTTR = contained - detected。
"""
import csv, sys
from datetime import datetime


def t(s):
    return datetime.strptime(s, "%Y-%m-%dT%H:%M:%SZ")


def mins(a, b):
    return (t(b) - t(a)).total_seconds() / 60


def main():
    rows = list(csv.DictReader(open(sys.argv[1], newline="", encoding="utf-8")))
    print(f"{'事件':<8} {'MTTD(分)':>9} {'窗口(分)':>9} {'MTTR(分)':>9}")
    d, r = [], []
    for x in rows:
        mttd = mins(x["started_at"], x["detected_at"])
        win = mins(x["detected_at"], x["impact_at"])
        mttr = mins(x["detected_at"], x["contained_at"])
        d.append(mttd); r.append(mttr)
        print(f"{x['id']:<8} {mttd:>9.1f} {win:>9.1f} {mttr:>9.1f}")
    print(f"平均 MTTD = {sum(d) / len(d):.1f} 分钟；平均 MTTR = {sum(r) / len(r):.1f} 分钟")


if __name__ == "__main__":
    main()
