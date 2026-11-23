#!/usr/bin/env python3
"""B79 验收报告生成器：把 S10、S11 的回放结果汇成一份报告（Markdown，输出固定，可直接贴进验收单）。

用法（从 web3-security-101/ 出发）：
  python3 code/offchain-ops/solutions/b79/report.py
报告含：范围与方法、每个检查的参数与召回 / 误报、逐条答案的发现情况、噪声账、结论与待办。
调参前后的对比用 --naive 查看（同样的检查，用没调过的参数）。
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
import minix  # noqa: E402
import ledger_check  # noqa: E402
import order_audit  # noqa: E402
import seqcheck  # noqa: E402

TUNED = [
    ("序号缺口与冲突", "seqcheck", seqcheck.detect, {}, "S10-01,S10-02"),
    ("成交—分录平衡与估值", "ledger_check", ledger_check.detect, {"tol": 0.011}, "S10-03,S10-04,S10-05"),
    ("价格带（成交价偏离标记价）", "ledger_check", ledger_check.detect, {"tol": 0.011, "mark_tol": 0.10}, "S11-01"),
    ("撤单与撤权后行为", "order_audit", order_audit.detect, {"band": 0.10}, "S11-02,S11-03"),
]
NAIVE = [
    ("序号缺口与冲突", "seqcheck", seqcheck.detect, {"ignore_identical": False, "include_announced": True, "check_order": True}, "S10-01,S10-02"),
    ("成交—分录平衡与估值", "ledger_check", ledger_check.detect, {"tol": 0.0, "late_sec": 300, "require_fee": True, "min_fee_notional": 0.0}, "S10-03,S10-04,S10-05"),
    ("价格带（成交价偏离标记价）", "ledger_check", ledger_check.detect, {"tol": 0.011, "mark_tol": 0.05}, "S11-01"),
    ("撤单与撤权后行为", "order_audit", order_audit.detect, {"band": 0.05, "by_ts": True, "include_rejects": True}, "S11-02,S11-03"),
]


def main():
    naive = "--naive" in sys.argv
    plan = NAIVE if naive else TUNED
    positives, _ = minix.load_answers()
    found = {}
    print("# MiniEx 交易与账务回放验收报告（%s）" % ("未调参" if naive else "调参后"))
    print()
    print("范围：2026-03-04（S10）与 2026-03-09（S11）；数据 data_x/，种子 20260302。")
    print()
    print("| 检查 | 工具 | 参数 | 命中 | TP | 误报 | 其他场景 | 召回 |")
    print("|---|---|---|---:|---:|---:|---:|---:|")
    tot_tp = tot_fp = tot_hit = tot_ot = 0
    for name, tool, det, params, target in plan:
        hits = det(**params)
        if name.startswith("价格带"):                    # 这一行只看价格偏离，分录问题已在上一行统计
            hits = [h for h in hits if h["kind"] == "price_off_mark"]
        res, detail = minix.score(hits, minix.targets_of(target))
        for kind, ids, _h in detail:
            if kind == "TP":
                for i in ids:
                    found.setdefault(i, set()).add(tool)
        tot_hit += res["hits"]
        tot_tp += res["tp_hits"]
        tot_fp += res["fp_hits"]
        tot_ot += res["other_hits"]
        print("| %s | %s | %s | %d | %d | %d | %d | %d/%d |" % (name, tool, ", ".join("%s=%s" % kv for kv in sorted(params.items())) or "默认", res["hits"], res["tp_hits"], res["fp_hits"], res["other_hits"], res["recalled"], res["positives"]))
    print("| 合计 |  |  | %d | %d | %d | %d |  |" % (tot_hit, tot_tp, tot_fp, tot_ot))
    print()
    print("## 逐条答案")
    print()
    want = [p for p in positives if p["scenario"] in ("S10", "S11")]
    for p in sorted(want, key=lambda p: p["id"]):
        who = found.get(p["id"])
        print("- %s %s：%s" % (p["id"], p["summary"], ("已发现（%s）" % ",".join(sorted(who))) if who else "未发现"))
    print()
    print("## 结论")
    print()
    print("- 召回 %d/%d；误报 %d 条。" % (sum(1 for p in want if p["id"] in found), len(want), tot_fp))
    print("- “其他场景”列不是误报：order_audit 同时命中 S11-01 的 3 笔价格带成交（上一行已统计），以及 S15-04 的 9 张受限账户订单（第二批的另一个场景）。")
    print("- %s" % ("误报来自噪声，需要先调参再上线。" if tot_fp else "误报为 0，参数可作为日常对账的起点。"))


if __name__ == "__main__":
    main()
