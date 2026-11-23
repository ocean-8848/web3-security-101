#!/usr/bin/env python3
"""B83 规则验收报告：把第一批的风控规则（B72）和第二批的案件审计（case_audit、order_audit）放在一张验收表里。

每一行是一条规则或一个检查器：它声明要抓的答案（目标）、回放得到的召回与误报、门禁结论、已知盲区。
门禁：目标全部召回，且误报 = 0，才算通过。任何一行不通过，整体不放行，退出码 1。
整体覆盖：S1–S4 与 S15（以及 S11-03）里的全部答案，每个至少被一行命中。

用法（从 web3-security-101/ 出发）：
  python3 practice-example-code/ops/solutions/b83/acceptance_report.py            # 调过的配置
  python3 practice-example-code/ops/solutions/b83/acceptance_report.py --naive    # 没调过的配置
  python3 practice-example-code/ops/solutions/b83/acceptance_report.py --markdown # 输出 Markdown 表格，可贴进报告
规则文件来自 solutions/b72/rules/（B72 的参考实现），只读取，不修改。
"""
import argparse
import json
import os
import subprocess
import sys
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
OPS = os.path.normpath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, os.path.join(OPS, "lib"))
import minix  # noqa: E402
import case_audit  # noqa: E402
import order_audit  # noqa: E402

REPLAY = os.path.join(OPS, "lib", "replay.py")
RULES = os.path.join(OPS, "solutions", "b72", "rules")
ANS_ALL = ["S1-01", "S1-02", "S1-03", "S2-01", "S2-02", "S3-01", "S3-02", "S3-03", "S4-01", "S4-02", "S4-03",
           "S11-03", "S15-01", "S15-02", "S15-03", "S15-04"]

# (名称, 规则文件, 参数 tuned, 参数 naive, 目标, 盲区)
SQL_ROWS = [
    ("撞库", "s1_stuffing.sql", {"window_min": 1440, "min_users": 15, "max_ratio": 2}, {}, "S1",
     "每账户多试几次可绕过 max_ratio"),
    ("找回后提币", "s1_recovery_tuned.sql", {}, "naive:s1_recovery_naive.sql", "S1-02,S1-03",
     "看不到不经找回的接管（S1-01）"),
    ("改绑后加地址", "s1_change_addr.sql", {}, {}, "S1", "要求改绑与加地址在 30 分钟内"),
    ("API Key 权限变更", "s2_perm_change.sql", {"need_no_ticket": 1}, {"need_no_ticket": 0}, "S2",
     "变更单字段要去工单系统核实"),
    ("API Key 新 IP 提币", "s2_new_ip_withdraw.sql", {}, "naive:s2_new_ip_any.sql", "S2",
     "攻击者先用无提币权限的调用养 IP"),
    ("洗钱漏斗", "s3_funnel.sql", {"min_in_usd": 8000}, {}, "S3", "阈值在 9,000 与 10,000 附近有悬崖"),
    ("对敲", "s4_wash.sql", {"exclude_mm": 1}, {}, "S4-01,S4-02", "做市商账户整体被排除"),
    ("标记价偏离", "s4_mark.sql", {}, {"min_rows": 1}, "S4-03", "按小时分组，偏离横跨整点会被切开"),
]


def replay(rule, params, target):
    cmd = [sys.executable, REPLAY, os.path.join(RULES, rule), "--scenario", target, "--json"]
    for k, v in params.items():
        cmd += ["--param", "%s=%s" % (k, v)]
    out = subprocess.run(cmd, capture_output=True, text=True)
    if out.returncode not in (0, 1):
        sys.exit(out.stderr or out.stdout)
    d = json.loads(out.stdout)
    return {"recalled_ids": d["recalled_ids"], "positives": d["positives"], "fp": d["fp_hits"], "hits": d["hits"]}


def audit_row(findings, target):
    res, detail = minix.score(findings, minix.targets_of(target))
    ids = sorted({i for k, idl, h in detail if k == "TP" for i in idl})
    return {"recalled_ids": ids, "positives": res["positives"], "fp": res["fp_hits"], "hits": res["hits"]}


def width(t):
    return sum(2 if unicodedata.east_asian_width(ch) in "WF" else 1 for ch in t)


def pad(t, n):
    return t + " " * max(1, n - width(t))


def collect(naive):
    rows = []
    for name, rule, tuned, naive_cfg, target, blind in SQL_ROWS:
        file, params = rule, tuned
        if naive:
            if isinstance(naive_cfg, str):
                file, params = naive_cfg.split(":", 1)[1], {}
            else:
                params = naive_cfg
        r = replay(file, params, target)
        r.update(name=name, target=target, blind=blind, cfg=(file[:-4] + (" " + ",".join("%s=%s" % kv for kv in params.items()) if params else "")))
        rows.append(r)
    if naive:
        f = case_audit.detect(report_sla=300, allow_policy=False, include_retried=True)
        cfg = "case_audit --naive"
    else:
        f = case_audit.detect()
        cfg = "case_audit 默认"
    r = audit_row(f, "S15")
    r.update(name="案件授权与回报", target="S15", blind="只看案件库自己的记录，不回读业务端状态", cfg=cfg)
    rows.append(r)
    if naive:
        f = order_audit.detect(band=0.05, by_ts=True, include_rejects=True)
        cfg = "order_audit --naive"
    else:
        f = order_audit.detect()
        cfg = "order_audit 默认"
    r = audit_row(f, "S11-03,S15-04")
    r.update(name="受限后仍下单", target="S11-03,S15-04", blind="宽限 60 秒内的订单不报；withdraw 范围的限制不算交易限制", cfg=cfg)
    rows.append(r)
    return rows


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--naive", action="store_true", help="用没调过的配置")
    ap.add_argument("--markdown", action="store_true", help="输出 Markdown 表格")
    a = ap.parse_args()
    rows = collect(a.naive)
    covered = set()
    fails = []
    lines = []
    for r in rows:
        r["recall"] = "%d/%d" % (len(r["recalled_ids"]), r["positives"])
        ok = len(r["recalled_ids"]) == r["positives"] and r["fp"] == 0
        r["gate"] = "通过" if ok else "未通过"
        if not ok:
            why = []
            if len(r["recalled_ids"]) < r["positives"]:
                why.append("召回不足")
            if r["fp"] > 0:
                why.append("误报 %d" % r["fp"])
            fails.append("%s（%s）" % (r["name"], "，".join(why)))
        covered.update(r["recalled_ids"])
    uncovered = [i for i in ANS_ALL if i not in covered]
    if a.markdown:
        print("| 规则 | 配置 | 目标 | 召回 | 误报 | 门禁 | 盲区 |")
        print("|---|---|---|---|---:|---|---|")
        for r in rows:
            print("| %s | %s | %s | %s | %d | %s | %s |" % (r["name"], r["cfg"], r["target"], r["recall"], r["fp"], r["gate"], r["blind"]))
    else:
        cols = [("规则", 22), ("目标", 15), ("召回", 6), ("误报", 5), ("门禁", 6)]
        print("".join(pad(c, n) for c, n in cols).rstrip())
        for r in rows:
            vals = [r["name"], r["target"], r["recall"], str(r["fp"]), r["gate"]]
            print("".join(pad(v, n) for v, (c, n) in zip(vals, cols)).rstrip())
    print("整体覆盖：%d/%d 个答案至少被一行命中%s" % (len(ANS_ALL) - len(uncovered), len(ANS_ALL), ("；未覆盖：" + ", ".join(uncovered)) if uncovered else ""))
    print("结论：" + ("放行" if not fails and not uncovered else "不放行。" + "；".join(fails)))
    if fails or uncovered:
        sys.exit(1)


if __name__ == "__main__":
    main()
