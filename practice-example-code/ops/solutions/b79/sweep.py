#!/usr/bin/env python3
"""B79 参数扫描：对 lib 里某个检测器的一个参数取多个值，逐个回放并评分，打印一张表。

用法（从 web3-security-handbook/ 出发）：
  python3 practice-example-code/ops/solutions/b79/sweep.py order_audit band 0.03,0.05,0.08,0.10,0.15 S11
  python3 practice-example-code/ops/solutions/b79/sweep.py ledger_check tol 0,0.005,0.011,0.05 S10-03,S10-04,S10-05
  python3 practice-example-code/ops/solutions/b79/sweep.py order_audit grace 0,60,300 S11-03
参数名与 lib/<检测器>.py 里 detect() 的参数一致；取值自动转成数字。
"""
import importlib
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "lib"))
import minix  # noqa: E402


def num(s):
    try:
        return int(s)
    except ValueError:
        return float(s)


def main():
    if len(sys.argv) != 5:
        sys.exit(__doc__)
    mod, param, values, target = sys.argv[1:]
    det = importlib.import_module(mod).detect
    print("%10s  命中  TP  误报  其他  召回" % param)
    for v in values.split(","):
        res, _ = minix.score(det(**{param: num(v)}), minix.targets_of(target))
        print("%10s  %4d  %2d  %4d  %4d  %d/%d" % (v, res["hits"], res["tp_hits"], res["fp_hits"], res["other_hits"], res["recalled"], res["positives"]))


if __name__ == "__main__":
    main()
