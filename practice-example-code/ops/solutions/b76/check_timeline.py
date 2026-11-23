#!/usr/bin/env python3
"""检查你的时间线 CSV 是否包含某个答案的全部关键事件 ID。

用法：python3 check_timeline.py S1-01 my_b76/s1-01.csv
CSV 需有 id 列（timeline.py --fmt csv 的输出即可）。不达标退出码 1。
"""
import csv, json, sys
from pathlib import Path

ANS = Path("practice-example-code/ops/answers")


def evidence_ids(ans_id):
    d = json.load(open(ANS / f"{ans_id.split('-')[0]}.json", encoding="utf-8"))
    for p in d["positives"]:
        if p["id"] == ans_id:
            return [i for ids in p["evidence"].values() for i in ids]
    sys.exit(f"没有这个答案编号：{ans_id}")


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    ans_id, path = sys.argv[1:]
    need = evidence_ids(ans_id)
    with open(path, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    have = {r["id"] for r in rows}
    miss = [i for i in need if i not in have]
    print(f"{ans_id}：关键事件 {len(need)} 个，时间线 {len(rows)} 行，覆盖 {len(need) - len(miss)}/{len(need)}")
    for i in miss:
        print(f"  缺失 {i}")
    sys.exit(1 if miss else 0)


if __name__ == "__main__":
    main()
