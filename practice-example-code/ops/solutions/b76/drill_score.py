#!/usr/bin/env python3
"""按 T10 第 3 部分的口径给桌面推演算分。

输入 CSV 两类行：
  维度行  A,12      （维度,得分；满分 A15 B20 C15 D15 E15 F10 G10）
  红线行  ★1,ok     （★1–★4，状态 ok 或 fail）
"""
import csv, sys

MAX = {"A": 15, "B": 20, "C": 15, "D": 15, "E": 15, "F": 10, "G": 10}


def main():
    total, fails = 0, []
    for k, v in csv.reader(open(sys.argv[1], encoding="utf-8")):
        if k in MAX:
            s = int(v)
            if not 0 <= s <= MAX[k]:
                sys.exit(f"维度 {k} 得分 {s} 超出 0–{MAX[k]}")
            total += s
        elif k.startswith("★"):
            if v == "fail":
                fails.append(k)
    verdict = "不通过" if fails or total < 70 else ("通过" if total >= 85 else "附条件通过")
    print(f"总分 {total}/100；红线失败：{','.join(fails) or '无'}；结论：{verdict}")


if __name__ == "__main__":
    main()
