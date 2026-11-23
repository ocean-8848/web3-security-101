#!/usr/bin/env python3
"""B72 参数扫描：对一条规则的一个参数取多个值，逐个回放，打印召回与误报表。

用法（从 web3-security-101/ 出发）：
  python3 code/offchain-ops/solutions/b72/sweep.py my_rules/s3.sql min_in_usd 20000,15000,10000,8000,5000
可选：--fixed name=value（固定其他参数，可重复）。
这个脚本只是 replay.py --json 的包装：每个取值调用一次 replay.py，读它的 JSON 结果。
"""
import argparse
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPLAY = os.path.join(HERE, "..", "..", "lib", "replay.py")


def run(rule, params):
    cmd = [sys.executable, REPLAY, rule, "--json"]
    for k, v in params.items():
        cmd += ["--param", f"{k}={v}"]
    out = subprocess.run(cmd, capture_output=True, text=True)
    if out.returncode not in (0, 1):
        sys.exit(out.stderr or out.stdout)
    return json.loads(out.stdout)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("rule")
    ap.add_argument("param")
    ap.add_argument("values", help="逗号分隔的取值")
    ap.add_argument("--fixed", action="append", default=[], help="name=value，固定其他参数")
    a = ap.parse_args()
    fixed = dict(p.split("=", 1) for p in a.fixed)
    print(f"{a.param:>14}  命中  TP  误报  召回")
    for v in a.values.split(","):
        r = run(a.rule, {**fixed, a.param: v})
        print(f"{v:>14}  {r['hits']:>4}  {r['tp_hits']:>2}  {r['fp_unique']:>4}  {r['recalled']}/{r['positives']}")


if __name__ == "__main__":
    main()
