#!/usr/bin/env python3
"""B80 第 3 步参考实现：复市决策矩阵。只读 data_x/，不改靶场任何文件。

把 X19 的复市门槛写成可计算的检查：每项给出"当前值""门槛""通过/不通过"，再按阶段汇总，
告诉你当前最高能进入哪一档（验证未过 / 仅撤单 / 仅平仓 / 限价交易）。"全面交易"要靠观察时间，数据算不出，脚本只提示。

数据能算的项自动算；数据算不出的人工项（例如公告发了没有）和"你打算做的整改"用 --assume 声明：
  reverse-dups   已冲销 16 笔重复副本
  rule-stale     已对 12 笔单边陈旧成交做出裁定（冲销或补写到新主）
  adl-announced  ADL 与补偿规则已公告（人工项）
  topup=金额     向保险基金注资这么多美元
  fix-s15        限制 / 解除限制的授权与回报缺口已补齐
示例（从 web3-security-101/ 根目录）：
  python3 code/offchain-ops/solutions/b80/resume_gate.py
  python3 code/offchain-ops/solutions/b80/resume_gate.py --assume reverse-dups,rule-stale
"""
import argparse
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
sys.path.insert(0, HERE)
import minix  # noqa: E402
import ledger_check  # noqa: E402
import case_audit  # noqa: E402
import split_brain  # noqa: E402
import fund_walk  # noqa: E402

STAGES = ["仅撤单", "仅平仓", "限价交易"]  # 每项门槛标的是"要进入这一档必须先满足"


def gates(assume, topup):
    sb = split_brain.analyze()
    w_ids = {x["match_id"] for x in sb["old_t"] + sb["new_t"]}
    dup_n = 0 if "reverse-dups" in assume else len(sb["dup"])
    over_n = 0 if "reverse-dups" in assume else len([f for f in sb["found"] if f["kind"] == "overfill"])
    stale_orders = {e["order_id"] for e in sb["events"] if e["match_id"] in {x["match_id"] for x in sb["only_old"]}}
    stale_n = 0 if "rule-stale" in assume else len(stale_orders)
    # 围栏后旧主是否还写
    after = [x for x in sb["log"] if x["event_type"] == "trade" and x["node"] == sb["stale"]["node"] and x["ts"] > sb["w1"]]
    # 窗口内分录借贷平衡
    led = [f for f in ledger_check.detect() if f.get("trade_id") in w_ids]
    miss = [f for f in sb["found"] if f["kind"] in ("report_missing", "report_orphan", "report_mismatch") and f.get("trade_id") in w_ids]
    # 强平与基金
    rows, _, _ = fund_walk.walk("2026-03-12T09:15:00Z", "2026-03-12T09:55:00Z", 60)
    end_w = max(x["exec_ts"] for x in rows)
    later = [x for x in minix.rows("liquidations") if x["trigger_ts"] > end_w]
    worst_after = int(max(x["delay_s"] for x in later))
    fund_now = [x for x in minix.rows("liquidations")][-1]["fund_after"] + topup
    need_fund = max(x["shortfall"] for x in rows)
    unfunded = sum(x["unfunded_loss"] for x in rows)
    # S15
    s15 = case_audit.detect()
    bad_actions = {f["action_id"] for f in s15}
    bad_n = 0 if "fix-s15" in assume else len(bad_actions)
    G = [
        ("V1", "仅撤单", "围栏后旧主成交数", len(after), "= 0", len(after) == 0, ""),
        ("V2", "仅撤单", "重复成交未冲销（笔）", dup_n, "= 0", dup_n == 0, "reverse-dups"),
        ("V3", "仅撤单", "未决订单：超量成交 + 陈旧单边（张）", over_n + stale_n, "= 0", over_n + stale_n == 0, "reverse-dups、rule-stale"),
        ("V4", "仅撤单", "窗口内成交分录借贷差异（笔）", len(led), "= 0", len(led) == 0, ""),
        ("V5", "仅撤单", "窗口内成交回报缺失 / 不符（笔）", len(miss), "= 0", len(miss) == 0, ""),
        ("P1", "仅平仓", "事故后强平最大延迟（秒）", worst_after, "<= 60", worst_after <= 60, ""),
        ("P2", "仅平仓", "ADL 与补偿规则已公告（未覆盖亏损 %.2f）" % unfunded, 1 if "adl-announced" in assume else 0, "= 1（人工项）", "adl-announced" in assume, "adl-announced"),
        ("C1", "限价交易", "保险基金余额（USD）", round(fund_now, 2), ">= %.2f（最大单笔缺口）" % need_fund, fund_now >= need_fund, "topup="),
        ("C2", "限价交易", "限制 / 解除授权与回报缺口（动作数）", bad_n, "= 0", bad_n == 0, "fix-s15"),
    ]
    return G


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--assume", default="", help="逗号分隔：reverse-dups,rule-stale,adl-announced,fix-s15,topup=金额")
    a = ap.parse_args()
    assume, topup = set(), 0.0
    for t in [s for s in a.assume.split(",") if s]:
        if t.startswith("topup="):
            topup = float(t.split("=", 1)[1])
            assume.add("topup")
        elif t in ("reverse-dups", "rule-stale", "adl-announced", "fix-s15"):
            assume.add(t)
        else:
            raise SystemExit("未知假设：%s" % t)
    G = gates(assume, topup)
    print("假设：%s" % (a.assume or "无（按数据现状）"))
    print()
    print("| 项 | 要进入 | 检查 | 当前值 | 门槛 | 判定 |")
    for gid, stage, name, val, thr, ok, _ in G:
        print("| %s | %s | %s | %s | %s | %s |" % (gid, stage, name, val, thr, "通过" if ok else "不通过"))
    print()
    best, blocked = "无（停在验证）", None
    for s in STAGES:
        bad = [g[0] for g in G if g[1] == s and not g[5]]
        if bad:
            blocked = (s, bad)
            break
        best = s
    print("结论：当前最高可进入阶段 = %s" % best)
    if blocked:
        print("卡点：要进入「%s」，门槛 %s 未过" % (blocked[0], "、".join(blocked[1])))
    else:
        print("卡点：数据上已无阻塞；全面交易还要等 2 小时稳定观察期（时间门槛，数据算不出）")


if __name__ == "__main__":
    main()
