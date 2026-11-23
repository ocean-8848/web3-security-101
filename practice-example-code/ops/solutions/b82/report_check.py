#!/usr/bin/env python3
"""B82 参考实现：检查一份偿付能力月报 + 对外披露草稿是否具备"该有的东西"。只用标准库。

用法（从 web3-security-101/ 出发）：
  python3 practice-example-code/ops/solutions/b82/report_check.py b82-lab/monthly_report.md

约定：文件里要有一个标题含"对外披露"的小节；它之前是内部月报，之后（含该标题）是对外草稿。
检查项（每项 通过 / 不通过）：
  内部月报：数字（95.31、97.41、480,000、380,000、40,000）、三个日期、红与黄、负责人与截止日期、局限
  对外草稿：说明范围与局限、没有"完全偿付"之类的断言、不含对手账户号 ACCT-、单据号 PW / PD、用户号 A 开头编号
退出码：0 全部通过；1 有不通过项；2 文件或小节缺失。
"""
import re
import sys


def has(text, *alts):
    return any(re.search(a, text) for a in alts)


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    try:
        text = open(sys.argv[1], encoding="utf-8").read()
    except OSError as e:
        print("读不到文件：%s" % e)
        return 2
    m = re.search(r"^#+\s*.*对外披露.*$", text, re.M)
    if not m:
        print("缺少标题含“对外披露”的小节")
        return 2
    internal, external = text[: m.start()], text[m.start():]
    checks = [
        ("内部：写了 USD 最低覆盖率 95.31%", has(internal, r"95\.31")),
        ("内部：写了 USDT 最低覆盖率 97.41%", has(internal, r"97\.41")),
        ("内部：写了 480,000 美元的汇出", has(internal, r"480,?000")),
        ("内部：写了 380,000 USDT 的记账延迟", has(internal, r"380,?000")),
        ("内部：写了 40,000 USDT 假回执", has(internal, r"40,?000")),
        ("内部：写了缺口起止日期 03-10 与 03-12", has(internal, r"03-10") and has(internal, r"03-12")),
        ("内部：区分了黄与红", has(internal, "黄") and has(internal, "红")),
        ("内部：行动项有负责人和截止日期", has(internal, "负责人") and has(internal, r"20\d\d-\d\d-\d\d|截止")),
        ("内部：写了局限（不含的科目）", has(internal, "不含|不包括|局限")),
        ("对外：写了范围与局限", has(external, "不包含|不含|局限") and has(external, "鉴证|保证")),
        ("对外：没有“完全偿付”类断言", not has(external, "完全偿付|全面偿付|绝对安全|无任何风险|100% 安全")),
        ("对外：没有对手账户号 ACCT-", not has(external, r"ACCT-")),
        ("对外：没有内部单据号 PW / PD", not has(external, r"\bP[WD]\d{6}\b")),
        ("对外：没有用户号", not has(external, r"\bA\d{5}\b")),
    ]
    bad = 0
    for name, ok in checks:
        print("%s  %s" % ("通过" if ok else "不通过", name))
        bad += not ok
    print("合计 %d 项，不通过 %d 项" % (len(checks), bad))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
