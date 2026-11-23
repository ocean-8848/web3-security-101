#!/usr/bin/env python3
"""B72 规则互补矩阵：把多条规则都回放一遍，列出每个答案（S1-01 ...）被哪些规则命中。

用法（从 web3-security-101/ 出发）：
  python3 practice-example-code/ops/solutions/b72/coverage.py rule1.sql rule2.sql ... [--scenarios S1,S2]
规则参数写在文件名后面：my_rules/s3.sql::min_in_usd=8000,only_new=1（"::" 后用逗号分隔 name=value）。
行是答案编号，列是规则；X 表示该规则命中了这个答案，. 表示没有。
最后一行"误报"是每条规则的误报条数（噪声 + 未解释）。最后会列出没有任何规则命中的答案。
"""
import argparse
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OPS = os.path.join(HERE, "..", "..")
REPLAY = os.path.join(OPS, "lib", "replay.py")
sys.path.insert(0, os.path.join(OPS, "lib"))
import mini  # noqa: E402


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("rules", nargs="+")
    ap.add_argument("--scenarios", default="S1,S2,S3,S4")
    a = ap.parse_args()
    wanted = a.scenarios.split(",")
    pos, _ = mini.load_answers()
    ids = [p["id"] for p in pos if p["scenario"] in wanted]
    results = []
    names = []
    for spec in a.rules:
        rule, _, plist = spec.partition("::")
        cmd = [sys.executable, REPLAY, rule, "--scenario", a.scenarios, "--json"]
        for kv in filter(None, plist.split(",")):
            cmd += ["--param", kv]
        names.append(os.path.basename(rule)[:-4])
        out = subprocess.run(cmd, capture_output=True, text=True)
        if out.returncode not in (0, 1):
            sys.exit(out.stderr or out.stdout)
        results.append(json.loads(out.stdout))
    w = max(len(n) for n in names)
    print(f"{'答案':<7}" + "  ".join(f"{n:<{w}}" for n in names))
    for i in ids:
        cells = ["X" if i in r["recalled_ids"] else "." for r in results]
        print(f"{i:<7}" + "  ".join(f"{c:<{w}}" for c in cells))
    print(f"{'误报':<7}" + "  ".join(f"{r['fp_unique']:<{w}}" for r in results))
    uncovered = [i for i in ids if not any(i in r["recalled_ids"] for r in results)]
    print("没有任何规则命中的答案：" + (", ".join(uncovered) if uncovered else "无"))


if __name__ == "__main__":
    main()
