#!/usr/bin/env python3
"""B83 案件卷宗：把一个案件整理成"证据链 + 执行复核记录"（对 data_x/ 与第一批 staff.csv）。

输出五部分：案件摘要；处置时间线（每个动作的执行人、授权人、角色、文书编号、业务端回报）；授权与回报核对（逐项，引用 case_audit 的发现）；
同账户在窗口内的订单（只列受理的新订单，按受限状态标注）；执行复核记录（能由数据填的已填，需要人确认的写"待填"）。
证据清单：每条引用的原始行给出所在文件、行号与 SHA-256（取该行文本），清单本身再取一个 SHA-256，用来说明"证据没被改过"。

用法（从 web3-security-101/ 出发）：
  python3 practice-example-code/ops/solutions/b83/casefile.py CS00033
  python3 practice-example-code/ops/solutions/b83/casefile.py CS00204 --window-hours 4
"""
import argparse
import hashlib
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
import case_audit  # noqa: E402
import minix  # noqa: E402

NEED = case_audit.RULES


def raw_lines(name):
    out = {}
    with open(minix.path_of(name)) as f:
        for i, line in enumerate(f, 1):
            if line.strip():
                out[json.loads(line)["action_id" if name == "case_actions" else "event_id"]] = (i, line.rstrip("\n"))
    return out


def need_roles(a):
    if a["action"].startswith("legal_"):
        return NEED["legal"]
    if a["action"] in case_audit.AUTH_ACTIONS:
        return NEED.get(a["scope"], {"security", "compliance"})
    return set()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("case_id")
    ap.add_argument("--window-hours", type=float, default=6, help="限制指令之后多少小时内的订单要列出（默认 6）")
    a = ap.parse_args()
    cases = {c["case_id"]: c for c in minix.rows("cases")}
    if a.case_id not in cases:
        sys.exit("没有这个案件：%s" % a.case_id)
    case = cases[a.case_id]
    acct = case["account_id"]
    acts = minix.rows("case_actions")
    mine = sorted([x for x in acts if x["case_id"] == a.case_id], key=lambda x: x["action_id"])
    retried = {x["retry_of"] for x in acts if x["retry_of"] and x["report_status"] == "applied"}
    staff = case_audit.roles()
    find = {}
    for f in case_audit.detect():
        find.setdefault(f["action_id"], []).append(f)
    ev_raw, act_raw = raw_lines("order_events"), raw_lines("case_actions")
    evidence = []  # (文件, 行号, 引用编号, sha256)

    def cite(name, rawmap, key):
        n, line = rawmap[key]
        h = hashlib.sha256(line.encode()).hexdigest()
        evidence.append(("%s.jsonl" % name, n, key, h))
        return "%s:%d" % (name, n)

    print("## 1. 案件摘要")
    print("案件 %s  账户 %s  类型 %s  来源 %s  严重度 %s  状态 %s  开立 %s  关闭 %s" % (
        case["case_id"], acct, case["type"], case["source"], case["severity"], case["status"], case["opened_ts"], case["closed_ts"] or "—"))
    print("法律保留（legal_hold）：%s" % ("是（类型为 legal_order / sanction）" if case["type"] in ("legal_order", "sanction") else "否"))
    print()
    print("## 2. 处置时间线")
    print("动作 | 时间 | 操作 | 范围 | 执行人(角色) | 授权人(角色) | 文书编号 | 回报 | 证据")
    problems = []
    for x in mine:
        who = lambda s: "—" if not s else "%s(%s)" % (s, staff.get(s, "策略" if s.startswith(("system:", "policy:")) else "未知"))
        rep = "无回报" if x["report_status"] is None else "%s +%ds" % (x["report_status"], (minix.parse_ts(x["report_ts"]) - minix.parse_ts(x["ts"])).total_seconds())
        print(" | ".join([x["action_id"], x["ts"], x["action"], x["scope"], who(x["actor"]), who(x["authorizer"]), x["authority_ref"] or "—", rep,
                         cite("case_actions", act_raw, x["action_id"])]))
    print()
    print("## 3. 授权与回报核对")
    for x in mine:
        fs = find.get(x["action_id"], [])
        need = sorted(need_roles(x))
        if fs:
            for f in fs:
                problems.append((x["action_id"], f["kind"]))
                print("  [不符] %s  %s  （要求授权角色：%s）" % (x["action_id"], f["kind"], "/".join(need) or "—"))
        else:
            print("  [符合] %s  授权链与回报均通过" % x["action_id"])
    print()
    win_end = None
    print("## 4. 同账户的订单（受理的新订单）")
    starts = [x for x in mine if x["action"] in ("restrict", "legal_freeze", "revoke_trade") and x["scope"] in ("trade", "all")]
    n_orders = 0
    if not starts:
        print("  本案没有交易范围的限制指令，不列订单。")
    for x in starts:
        lo = minix.parse_ts(x["ts"]).timestamp() + 60
        hi = lo - 60 + a.window_hours * 3600
        state = "未落地（回报 %s，无人重试）" % (x["report_status"] or "缺失") if (x["report_status"] != "applied" and x["action_id"] not in retried) else "已落地"
        print("  指令 %s（%s，%s）之后 %g 小时内：" % (x["action_id"], x["ts"], state, a.window_hours))
        for e in minix.rows("order_events"):
            if e["account_id"] == acct and e["event_type"] == "new" and lo < minix.parse_ts(e["ts"]).timestamp() < hi:
                n_orders += 1
                print("    %s  %s  %s %s  订单 %s  %s" % (e["ts"], e["symbol"], e["side"], e["qty"], e["order_id"], cite("order_events", ev_raw, e["event_id"])))
        if not any(e["account_id"] == acct and e["event_type"] == "new" and lo < minix.parse_ts(e["ts"]).timestamp() < hi for e in minix.rows("order_events")):
            print("    无")
    print()
    manifest = hashlib.sha256("\n".join("%s:%d:%s:%s" % e for e in sorted(evidence)).encode()).hexdigest()
    print("## 5. 执行复核记录")
    print("case_id: %s" % case["case_id"])
    print("subjects: [%s]" % acct)
    print("actions: " + ", ".join(x["action_id"] for x in mine))
    print("授权链结论: %s" % ("存在 %d 项不符（%s）" % (len(problems), ", ".join("%s/%s" % p for p in problems)) if problems else "全部符合"))
    unapplied = [x["action_id"] for x in mine if x["action"] in ("restrict", "legal_freeze", "revoke_trade") and x["report_status"] != "applied" and x["action_id"] not in retried]
    print("限制落地: %s" % ("未落地 %s；其后受理订单 %d 张" % (",".join(unapplied), n_orders) if unapplied else "回报已落地（仍需复核人独立回读：提币、交易、内部划转）"))
    print("复核结论: %s" % ("不一致，需要补救" if problems or unapplied else "一致（以回读为准）"))
    print("复核人: 待填    回读时间: 待填    回读结果（提币/交易/划转）: 待填")
    print("身份问 / 资金归属问: 本靶场没有对应数据，待填")
    print("evidence_manifest_sha256: %s  （%d 条引用）" % (manifest, len(evidence)))
    print()
    print("## 6. 证据清单")
    for f, n, k, h in sorted(evidence):
        print("  %-20s 行 %-6d %-9s %s" % (f, n, k, h[:16]))


if __name__ == "__main__":
    main()
