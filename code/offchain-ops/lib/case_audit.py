#!/usr/bin/env python3
"""案件处置授权与业务端回报校验（对 data_x/cases.csv、case_actions.jsonl，角色取自第一批 data/staff.csv）。

授权规则（脚本里的 RULES，可按需改）：
  scope=all 的限制 / 解除、legal_freeze / legal_unfreeze：授权人必须是合规（compliance）
  scope=trade / withdraw：授权人是安全（security）或合规
  actor 以 system: 开头的自动动作，授权来自 policy:*（默认放行，--no-allow-policy 关闭）
检查项：
  release_no_authorizer  解除 / 解除法定冻结没有授权人
  self_authorized        授权人就是执行人
  authorizer_role        授权人的角色不符合上面的规则
  legal_no_ref           法定冻结 / 解除没有法律文书编号（authority_ref）
  no_report              业务端回报缺失，且距 --asof 超过 --report-sla 秒
  slow_report            回报晚于 --report-sla 秒才到
  report_failed          回报 failed，且之后没有重试成功（retry_of 指向它）；--include-retried 连重试成功的也报

示例：
  python3 code/offchain-ops/lib/case_audit.py --score S15
  python3 code/offchain-ops/lib/case_audit.py --report-sla 300 --show 20
  python3 code/offchain-ops/lib/case_audit.py --naive --score S15
模块用法：from case_audit import detect; detect(report_sla=1800)
"""
import csv
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import minix  # noqa: E402

END = "2026-03-15T00:00:00Z"
RULES = {"all": {"compliance"}, "legal": {"compliance"}, "trade": {"security", "compliance"}, "withdraw": {"security", "compliance"}}
AUTH_ACTIONS = {"restrict", "release", "legal_freeze", "legal_unfreeze", "revoke_trade"}


def roles():
    p = os.path.join(minix.DATA, "staff.csv")
    out = {}
    with open(p, newline="") as f:
        for r in csv.DictReader(f):
            out[r["staff_id"]] = r["role"]
    return out


def detect(report_sla=1800, allow_policy=True, include_retried=False, asof=END, actions=None, staff=None):
    acts = actions if actions is not None else minix.rows("case_actions")
    staff = staff if staff is not None else roles()
    end = minix.parse_ts(asof)
    retried = {a["retry_of"] for a in acts if a["retry_of"] and a["report_status"] == "applied"}
    out = []
    for a in sorted(acts, key=lambda a: a["action_id"]):
        if a["ts"] > asof:
            continue
        base = {"action_id": a["action_id"], "account_id": a["account_id"], "case_id": a["case_id"], "action": a["action"], "ts": a["ts"]}
        auto = a["actor"].startswith("system:") and (a["authorizer"] or "").startswith("policy:")
        if a["action"] in ("release", "legal_unfreeze") and not a["authorizer"]:
            out.append(dict(base, kind="release_no_authorizer", actor=a["actor"]))
        elif a["authorizer"] and a["authorizer"] == a["actor"]:
            out.append(dict(base, kind="self_authorized", actor=a["actor"]))
        elif a["action"] in AUTH_ACTIONS and a["authorizer"] and not (auto and allow_policy):
            need = RULES["legal"] if a["action"].startswith("legal_") else RULES.get(a["scope"], {"security", "compliance"})
            role = staff.get(a["authorizer"], "unknown")
            if role not in need:
                out.append(dict(base, kind="authorizer_role", authorizer=a["authorizer"], role=role, need=",".join(sorted(need))))
        if a["action"] in ("legal_freeze", "legal_unfreeze") and not a["authority_ref"]:
            out.append(dict(base, kind="legal_no_ref", actor=a["actor"], authorizer=a["authorizer"]))
        if a["report_status"] is None:
            age = (end - minix.parse_ts(a["ts"])).total_seconds()
            if age > report_sla:
                out.append(dict(base, kind="no_report", age_s=int(age)))
        else:
            delay = (minix.parse_ts(a["report_ts"]) - minix.parse_ts(a["ts"])).total_seconds()
            if delay > report_sla:
                out.append(dict(base, kind="slow_report", delay_s=int(delay)))
            if a["report_status"] == "failed" and (include_retried or a["action_id"] not in retried):
                out.append(dict(base, kind="report_failed", retried=a["action_id"] in retried))
    return out


def main(argv=None):
    ap = minix.new_parser(__doc__)
    ap.add_argument("--report-sla", type=int, default=1800, help="业务端回报允许的最长延迟（秒，默认 1800）")
    ap.add_argument("--no-allow-policy", dest="allow_policy", action="store_false", help="不放行 system:* 执行、policy:* 授权的自动动作")
    ap.add_argument("--include-retried", action="store_true", help="回报失败但已重试成功的也报")
    ap.add_argument("--asof", default=END, help="统计截止时间（默认 2026-03-15T00:00:00Z）")
    ap.add_argument("--naive", action="store_true", help="没调过的参数：--report-sla 300 --no-allow-policy --include-retried")
    minix.common_args(ap)
    a = ap.parse_args(argv)
    if a.naive:
        a.report_sla, a.allow_policy, a.include_retried = 300, False, True
    params = {"report_sla": a.report_sla, "allow_policy": a.allow_policy, "include_retried": a.include_retried, "asof": a.asof}
    return minix.finish("case_audit", detect(**params), a, params)


if __name__ == "__main__":
    main()
