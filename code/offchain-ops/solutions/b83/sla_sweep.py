#!/usr/bin/env python3
"""B83 回报 SLA 扫描：对 case_audit 的 --report-sla 取多个值，打印命中、TP、误报与召回。

用法（从 web3-security-101/ 出发）：
  python3 code/offchain-ops/solutions/b83/sla_sweep.py 60,300,600,1200,1800,3600
只是 lib/case_audit.py 的 detect() 的包装：每个取值调用一次，对 S15 评分。
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "lib"))
import case_audit  # noqa: E402
import minix  # noqa: E402


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    print("%10s  %4s  %3s  %4s  %s" % ("report_sla", "命中", "TP", "误报", "召回"))
    for v in sys.argv[1].split(","):
        res, _ = minix.score(case_audit.detect(report_sla=int(v)), minix.targets_of("S15"))
        print("%10s  %4d  %3d  %4d  %d/%d" % (v, res["hits"], res["tp_hits"], res["fp_hits"], res["recalled"], res["positives"]))


if __name__ == "__main__":
    main()
