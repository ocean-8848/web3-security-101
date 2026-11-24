#!/usr/bin/env python3
"""B77 参考实现：把 B71–B76 的检查重新运行一遍，生成证据表 evidence.csv（只用标准库）。

用法（从 web3-security-101/ 出发）：
  python3 code/offchain-ops/solutions/b77/evidence.py --out b77-lab/evidence.csv
  python3 code/offchain-ops/solutions/b77/evidence.py --show        # 只打印，不写文件

每条证据 = 一条可单独复跑的命令 + 它的真实输出摘要 + 它支持的标准答案 ID（answer_ids）。
answer_ids 的来源：回放类证据取 replay.py 的 recalled_ids；SQL 类证据按 STATIC 表登记，
并用 expect 校验输出里真的出现了对应实体（ST015、K9001 ...）。校验失败时状态为 mismatch，退出码 1。
"""
import argparse, csv, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OPS_ABS = os.path.abspath(os.path.join(HERE, "..", ".."))
OPS = "code/offchain-ops"      # 章内展示的命令前缀（读者从 web3-security-101/ 出发）
RULES = OPS + "/answers/reference_rules/"
LOGREAD = "python3 %s/lib/logread.py" % OPS
REPLAY = "python3 %s/lib/replay.py" % OPS

# (id, 来源, 类型, 参数, 附加参数, expect, 静态 answer_ids)
E = [
 ("E01", "B71 Q10", "sql", "SELECT COUNT(DISTINCT account_id) no_mfa_accounts FROM logins WHERE result='success' AND mfa_method='none'", "", "no_mfa_accounts=213", ""),
 ("E02", "B71 Q11", "sql", "SELECT a.approval_id, a.approved_by, a.approver_count, w.amount_usd FROM approvals a JOIN withdrawals w ON a.subject_id=w.wd_id WHERE w.amount_usd>=20000 AND a.approver_count<2", "", "AP-W000889", "S1-03"),
 ("E03", "B71 Q12", "sql", "SELECT COUNT(*) fast_new_addr_withdrawals FROM withdrawals WHERE amount_usd>=1000 AND (julianday(ts)-julianday(addr_added_ts))*24<24", "", "fast_new_addr_withdrawals=11", ""),
 ("E04", "B71 Q13", "sql", "SELECT key_id, perms FROM api_keys WHERE perms LIKE '%withdraw%' AND ip_allowlist IS NULL", "", "K9001", "S2-02"),
 ("E05", "B71 Q14", "sql", "SELECT COUNT(*) unbalanced FROM (SELECT txn_id, asset, SUM(CASE direction WHEN 'debit' THEN amount ELSE -amount END) d FROM ledger GROUP BY 1,2 HAVING ABS(d)>0.000001)", "", "unbalanced=0", ""),
 ("E06", "B71 Q15", "sql", "SELECT COUNT(*) withdrawals_on_chain, SUM(wd_id IS NULL) without_request FROM chain_txs WHERE kind='withdrawal'", "", "without_request=2", "S6-01;S6-02"),
 ("E07", "B71 Q16", "sql", "SELECT COUNT(*) requests, SUM(approval_id IS NULL) without_approval FROM signing_requests", "", "without_approval=1", "S6-01"),
 ("E08", "B76 §4.2", "sql", "SELECT approval_id, COUNT(*) signed FROM signing_requests WHERE signer_result='signed' AND approval_id IS NOT NULL GROUP BY approval_id HAVING COUNT(*)>1", "", "AP-W000829", "S6-02"),
 ("E09", "B76 §4.2", "sql", "SELECT COUNT(*) n, SUM(signer_result='signed') signed FROM signing_requests WHERE ts>'2026-03-06T16:21:00Z' AND ts<'2026-03-09T21:05:00Z'", "", "signed=289", ""),
 ("E10", "B71 Q17", "sql", "SELECT COUNT(*) execs, SUM(json_extract(annotations,'$.change_id') IS NOT NULL) with_change_id FROM k8s_audit WHERE namespace='signing' AND subresource='exec'", "", "execs=7", "S7-01"),
 ("E11", "B71 Q18", "sql", "SELECT COUNT(*) action_uses, SUM(length(json_extract(detail,'$.ref'))=40) pinned FROM ci_events WHERE event_type='action_use'", "", "pinned=932", ""),
 ("E12", "B71 Q19", "sql", "SELECT (SELECT COUNT(*) FROM ci_events WHERE event_type='publish' AND json_extract(detail,'$.channel')='release') release_publishes, (SELECT COUNT(*) FROM ci_events WHERE event_type='artifact_sign') sign_events", "", "release_publishes=6", "S8-03"),
 ("E13", "B71 Q20", "sql", "SELECT COUNT(*) mismatched FROM ci_events WHERE event_type='dependency_install' AND json_extract(detail,'$.integrity') != json_extract(detail,'$.lock_integrity')", "", "mismatched=1", "S8-01"),
 ("E14", "B71 Q21", "sql", "SELECT COUNT(*) accesses, ROUND(SUM(ticket_id IS NULL)*100.0/COUNT(*),1) pct_no_ticket FROM support_access", "", "pct_no_ticket=5.4", ""),
 ("E15", "B71 Q22", "sql", "SELECT s.staff_id, s.left_date, s.privilege, a.ts, a.action FROM staff s JOIN support_access a ON a.staff_id=s.staff_id WHERE s.employed='no' AND a.ts > s.left_date", "", "ST015", "G1"),
 ("E16", "B71 Q23", "sql", "SELECT s.staff_id, s.privilege, s.expires_ts, k.ts, k.namespace, k.response_code FROM staff s JOIN k8s_audit k ON k.user=s.staff_id WHERE s.privilege='prod_exec' AND k.subresource='exec' AND k.ts > s.expires_ts", "", "ST050", "G2"),
 ("E17", "B71 Q24", "sql", "SELECT staff_id, role, privilege, granted_ts FROM staff WHERE approver_id IS NULL", "", "ST051", "G3"),
 ("E18", "B76 §4", "sql", "SELECT status, COUNT(*) n FROM withdrawals GROUP BY status", "", "status=frozen，n=1", ""),
 ("E19", "B76 §4", "sql", "SELECT event_type, COUNT(*) n FROM account_events GROUP BY event_type", "", "event_type=mfa_reset，n=19", ""),
 ("E20", "B76 §4.3", "sql", "SELECT COUNT(*) n, MAX(ts) last_ts FROM cloud_audit WHERE identity='ST021' AND ts>'2026-03-09T12:00:00Z'", "", "n=131", ""),
 ("E21", "B72", "replay", RULES + "r01_credential_stuffing.sql", "", "召回 2/3", ""),
 ("E22", "B72", "replay", RULES + "r03_change_then_add_address.sql", "", "召回 3/3", ""),
 ("E23", "B72", "replay", RULES + "r04_api_key_new_ip_withdraw.sql", "", "召回 2/2", ""),
 ("E24", "B72", "replay", RULES + "r05_funnel_fast_in_out.sql", "", "召回 3/3", ""),
 ("E25", "B72", "replay", RULES + "r05_funnel_fast_in_out.sql", "--param min_in_usd=20000", "召回 1/3", ""),
 ("E26", "B72", "replay", RULES + "r06_wash_trading.sql", "", "召回 2/2", ""),
 ("E27", "B72", "replay", RULES + "r07_mark_deviation.sql", "", "召回 1/1", ""),
 ("E28", "B73", "replay", RULES + "r08_support_bulk_no_ticket.sql", "", "召回 2/2", ""),
 ("E29", "B73", "replay", RULES + "r09_signing_without_approval.sql", "", "召回 3/3", ""),
 ("E30", "B73", "replay", RULES + "r10_chain_tx_without_request.sql", "", "召回 2/2", ""),
 ("E31", "B73", "replay", RULES + "r11_dev_chain_to_signing.sql", "", "召回 2/2", ""),
 ("E32", "B75", "replay", RULES + "r12_ci_pinning.sql", "", "召回 1/1", ""),
 ("E33", "B75", "replay", RULES + "r13_ci_dependency_integrity.sql", "", "召回 1/1", ""),
 ("E34", "B75", "replay", RULES + "r14_ci_unsigned_release.sql", "", "召回 1/1", ""),
 ("E35", "B74", "engine", "", "", "放行 1293，拒绝 6，升级人工 3；漏掉的 S6：无", "S6-01;S6-02;S6-03"),
 ("E36", "B75", "lint", "code/offchain-ops/data/workflows/release.yml", "", "发现 9 条", ""),
]


def run(args):
    p = subprocess.run(args, capture_output=True, text=True, cwd=os.path.join(OPS_ABS, "..", ".."))
    return p.returncode, p.stdout


def fmt_rows(text):
    rows = [r for r in csv.reader(text.splitlines()) if r]
    if len(rows) < 2:
        return "（无行）"
    head, body = rows[0], rows[1:]
    out = ["，".join("%s=%s" % (h, v) for h, v in zip(head, r)) for r in body[:6]]
    if len(body) > 6:
        out.append("…共 %d 行" % len(body))
    return " | ".join(out)


def collect():
    result = []
    for eid, src, kind, arg, extra, expect, static in E:
        answers = static
        if kind == "sql":
            cmd = '%s --sql "%s" --fmt csv' % (LOGREAD, arg)
            rc, out = run(["python3", OPS + "/lib/logread.py", "--sql", arg, "--fmt", "csv"])
            res = fmt_rows(out)
        elif kind == "replay":
            cmd = "%s %s %s" % (REPLAY, arg, extra)
            cmd = cmd.strip()
            rc, out = run(["python3", OPS + "/lib/replay.py", arg, "--json"] + extra.split())
            d = json.loads(out)
            res = "命中 %d，TP %d，误报 %d，召回 %d/%d" % (d["hits"], d["tp_hits"], d["fp_hits"], d["recalled"], d["positives"])
            answers = ";".join(d["recalled_ids"])
        elif kind == "engine":
            cmd = "python3 %s/solutions/b74/policy_engine.py" % OPS
            rc, out = run(["python3", OPS + "/solutions/b74/policy_engine.py", "--json"])
            d = json.loads(out)
            c = d["counts"]
            res = "放行 %d，拒绝 %d，升级人工 %d；漏掉的 S6：%s" % (c["allow"], c["reject"], c["escalate"], "无" if not d["missed"] else ",".join(d["missed"]))
            if d["missed"]:
                answers = ""
        else:  # lint
            cmd = "python3 %s/solutions/b75/lint_workflow.py %s" % (OPS, arg)
            rc, out = run(["python3", OPS + "/solutions/b75/lint_workflow.py", arg, "--json"])
            d = json.loads(out)
            items = d if isinstance(d, list) else next(iter(d.values()))
            if isinstance(items, dict):
                items = next(iter(items.values()))
            high = sum(1 for x in items if x.get("severity") == "HIGH")
            res = "发现 %d 条，其中 HIGH %d 条" % (len(items), high)
        status = "ok" if expect in res else "mismatch"
        result.append({"evidence_id": eid, "source": src, "command": cmd, "result": res,
                       "answer_ids": answers, "status": status})
    return result


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out")
    ap.add_argument("--show", action="store_true")
    a = ap.parse_args()
    rows = collect()
    bad = [r for r in rows if r["status"] != "ok"]
    if a.out:
        os.makedirs(os.path.dirname(a.out) or ".", exist_ok=True)
        with open(a.out, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            w.writeheader()
            w.writerows(rows)
        print("已写入 %s：%d 条证据，%d 条与预期不符" % (a.out, len(rows), len(bad)))
    if a.show or not a.out:
        for r in rows:
            print("%s [%s] %s\n    %s\n    -> %s  answers=%s" % (r["evidence_id"], r["status"], r["source"], r["command"][:150], r["result"], r["answer_ids"] or "-"))
    for r in bad:
        print("与预期不符：%s %s" % (r["evidence_id"], r["result"]), file=sys.stderr)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
