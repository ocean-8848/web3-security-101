#!/usr/bin/env python3
"""B71 参考实现：用 staff / support_access / k8s_audit 查出员工权限治理发现，并与 answers/governance.json 对照。

用法（从 web3-security-handbook/ 出发）：
  python3 practice-example-code/ops/solutions/b71/staff_audit.py
退出码：0 = 查出的 G1-G3 与标准答案完全一致；1 = 有漏查或多查。
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OPS = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(OPS, "lib"))
import mini  # noqa: E402

db = mini.connect()
END = "2026-03-15T00:00:00Z"  # 靶场时间窗结束

found = {}

# G1：已离职、特权仍有效、离职后仍有访问
for r in mini.q(db, """
    SELECT s.staff_id, s.left_date, s.privilege, s.expires_ts, a.ts, a.action, a.target_account_id
    FROM staff s JOIN support_access a ON a.staff_id = s.staff_id
    WHERE s.employed = 'no' AND s.expires_ts > :end AND a.ts > s.left_date""", {"end": END}):
    found.setdefault("G1", []).append(r)

# G2：特权已过期，之后仍 exec 成功（101 = 升级到 exec 流，代表成功）
for r in mini.q(db, """
    SELECT s.staff_id, s.privilege, s.expires_ts, k.ts, k.namespace, k.response_code
    FROM staff s JOIN k8s_audit k ON k.user = s.staff_id
    WHERE s.privilege = 'prod_exec' AND k.subresource = 'exec' AND k.ts > s.expires_ts
      AND k.response_code IN (101, 200)"""):
    found.setdefault("G2", []).append(r)

# G3：高危特权没有审批人
for r in mini.q(db, """
    SELECT staff_id, privilege, granted_ts FROM staff
    WHERE approver_id IS NULL AND privilege IN ('cloud_admin', 'prod_exec', 'transfer_approve', 'siem_admin')"""):
    found.setdefault("G3", []).append(r)

with open(os.path.join(OPS, "answers", "governance.json"), encoding="utf-8") as f:
    gold = {g["id"]: g for g in json.load(f)["findings"]}

ok = True
print("查询结果与 answers/governance.json 对照：")
for gid in sorted(set(gold) | set(found)):
    got = {r["staff_id"] for r in found.get(gid, [])}
    want = {gold[gid]["staff_id"]} if gid in gold else set()
    good = got == want
    ok = ok and good
    print(f"  {gid}  查出 {sorted(got) or '-'}  标准答案 {sorted(want) or '-'}  {'一致' if good else '不一致'}")
    for r in found.get(gid, []):
        print("      ", {k: v for k, v in r.items()})
print("结论：" + ("3 条治理发现全部找到，没有多余" if ok else "与标准答案不一致，回头检查查询条件"))
sys.exit(0 if ok else 1)
