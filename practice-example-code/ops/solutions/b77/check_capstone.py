#!/usr/bin/env python3
"""B77 毕业项目自动检查与评分（只用标准库）。

用法（从 web3-security-101/ 出发）：
  python3 practice-example-code/ops/solutions/b77/check_capstone.py [--dir b77-lab] [--capacity 200] [--manual 0]

读取目录里的 6 个文件：assets.csv、my_matrix.csv、evidence.csv、findings.csv、risks.csv、roadmap.csv。
自动判分 72 分（评分表第 2、3、4、5、7 项）；第 1、6、8、9 项（共 28 分）由人工评分，用 --manual 填入。
红线任一触发即"不通过"。退出码：0 = 通过（总分 >= 80 且无红线）；1 = 未通过。
"""
import argparse, csv, os, re, subprocess, sys
from datetime import date, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
MATRIX_GAP = os.path.join(HERE, "..", "b71", "matrix_gap.py")
MUST = ["S1-01", "S1-02", "S1-03", "S2-01", "S2-02", "S3-01", "S3-02", "S3-03", "S4-01", "S4-02", "S4-03",
        "S5-01", "S5-02", "S6-01", "S6-02", "S6-03", "S7-01", "S7-02", "S8-01", "S8-02", "S8-03", "G1", "G2", "G3"]
SEV = {"严重", "高", "中", "低"}
CTRL = re.compile(r"^(IC|TRS|INF|DET|SDL|FRD|TRD|XDT|RES)-\d+$")
RANK = {"P0": 0, "P1": 1, "P2": 2}
fails, redlines = [], []


def rd(path):
    if not os.path.exists(path):
        fails.append("缺少文件 " + path)
        return []
    with open(path, encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def split(s):
    return [x.strip() for x in (s or "").replace("，", ";").replace(",", ";").split(";") if x.strip()]


def num(r, k):
    try:
        return float(r[k])
    except (ValueError, KeyError, TypeError):
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", default="b77-lab")
    ap.add_argument("--capacity", type=float, default=200, help="90 天内可用人天（示例值）")
    ap.add_argument("--asof", default="2026-03-15", help="评估日（靶场日志最后一天）")
    ap.add_argument("--manual", type=float, default=0, help="人工评分项得分（满分 28）")
    a = ap.parse_args()
    asof = date.fromisoformat(a.asof)
    P = lambda n: os.path.join(a.dir, n)
    matrix, evid = rd(P("my_matrix.csv")), rd(P("evidence.csv"))
    finds, risks, road = rd(P("findings.csv")), rd(P("risks.csv")), rd(P("roadmap.csv"))
    score = {}

    # 第 2 项：控制矩阵（10 分）
    doms = {r["domain"] for r in matrix if r.get("control_id")}
    s2 = 4.0 * min(len(doms), 10) / 10
    with_ev = sum(1 for r in matrix if r.get("evidence_ref", "").strip())
    s2 += 3.0 * with_ev / max(len(matrix), 1)
    cov = "未运行"
    if matrix:
        p = subprocess.run([sys.executable, MATRIX_GAP, P("my_matrix.csv")], capture_output=True, text=True)
        if p.returncode == 0:
            s2 += 3.0
            m = re.search(r"合计\s+\d+\s+([\d.]+%)\s+([\d.]+)", p.stdout)
            cov = "覆盖率 %s，缺口分 %s" % (m.group(1), m.group(2)) if m else ""
        else:
            fails.append("matrix_gap.py 运行失败")
    score["2 控制矩阵与缺口排序"] = (round(s2, 1), 10, "域 %d/10，有证据行 %d/%d，%s" % (len(doms), with_ev, len(matrix), cov))
    mid = {r["control_id"]: r for r in matrix if r.get("control_id")}
    unfinished = {c: r for c, r in mid.items() if r["status"] != "implemented"}

    # 第 3、4 项：发现清单
    ev_by = {e["evidence_id"]: e for e in evid}
    covered, valid, no_ev, bad = set(), 0, [], []
    for f in finds:
        ids = split(f.get("evidence_ids"))
        ok_ids = [i for i in ids if i in ev_by]
        if not ok_ids or len(ok_ids) != len(ids):
            no_ev.append(f["finding_id"])  # 没有证据（或引用了不存在的证据）的发现不得分
            continue
        for i in ok_ids:
            covered.update(split(ev_by[i].get("answer_ids")))
        problems = []
        if f.get("severity") not in SEV:
            problems.append("严重度")
        if not f.get("impact", "").strip():
            problems.append("影响")
        if not f.get("recommendation", "").strip():
            problems.append("建议")
        cs = split(f.get("control_ids"))
        if not cs or not all(CTRL.match(c) for c in cs):
            problems.append("X 章控制 ID")
        ms = split(f.get("matrix_ids"))
        if not ms or not all(m in mid for m in ms):
            problems.append("矩阵行")
        if problems:
            bad.append("%s（%s）" % (f["finding_id"], "、".join(problems)))
        else:
            valid += 1
    got = [m for m in MUST if m in covered]
    score["3 发现清单：覆盖"] = (round(25.0 * len(got) / len(MUST), 1), 25,
                              "覆盖 %d/%d；遗漏：%s" % (len(got), len(MUST), "、".join(m for m in MUST if m not in covered) or "无"))
    score["4 发现清单：质量"] = (round(15.0 * valid / len(finds), 1) if finds else 0, 15,
                              "合格 %d/%d；无证据：%s；字段问题：%s" % (valid, len(finds), "、".join(no_ev) or "无", "；".join(bad) or "无"))
    for f in finds:
        if f["finding_id"] in no_ev and f.get("severity") in ("严重", "高"):
            redlines.append("红线：%s 是%s发现，但没有有效证据" % (f["finding_id"], f["severity"]))
    miss6 = [m for m in ("S6-01", "S6-02", "S6-03") if m not in covered]
    if miss6:
        redlines.append("红线：遗漏 S6 类高危：" + "、".join(miss6))

    # 第 5 项：风险登记（8 分）
    rc = {c for r in risks for c in split(r.get("control_ids"))}
    p0u = [c for c, r in unfinished.items() if r["priority"] == "P0"]
    p0_reg = sum(1 for c in p0u if c in rc)
    s5 = 4.0 * p0_reg / max(len(p0u), 1)
    lv_ok = 0
    for r in risks:
        try:
            v = int(r["likelihood"]) * int(r["impact"])
            lv_ok += (r.get("level") == ("高" if v >= 15 else "中" if v >= 8 else "低"))
        except (ValueError, KeyError):
            pass
    s5 += 2.0 * lv_ok / max(len(risks), 1)
    acc = [r for r in risks if r.get("treatment") == "接受"]
    acc_ok = 0
    for r in acc:
        try:
            exp_ok = date.fromisoformat(r["accept_expiry"]) <= asof + timedelta(days=183)
        except (ValueError, KeyError):
            exp_ok = False
        good = exp_ok and r.get("accepted_by", "").strip() and r.get("compensating_control", "").strip()
        acc_ok += bool(good)
        if not good:
            redlines.append("红线：已接受风险 %s 缺批准人、补偿控制或到期日（或到期日超过 6 个月）" % r.get("risk_id"))
    s5 += 2.0 * (acc_ok / len(acc) if acc else 0)
    score["5 风险登记与已接受风险"] = (round(s5, 1), 8, "未完全实施的 P0 有登记 %d/%d；等级一致 %d/%d；已接受风险合格 %d/%d" % (p0_reg, len(p0u), lv_ok, len(risks), acc_ok, len(acc)))

    # 第 7 项：90 天路线图（14 分）
    items = {r["item_id"]: r for r in road if r.get("item_id")}

    def best_end(c):
        ends = [num(r, "end_day") for r in items.values() if c in split(r.get("control_ids"))]
        ends = [e for e in ends if e is not None]
        return min(ends) if ends else None

    p0_in = [c for c in p0u if best_end(c) is not None and best_end(c) <= 90]
    p1u = [c for c, r in unfinished.items() if r["priority"] == "P1"]
    p1_in = [c for c in p1u if best_end(c) is not None and best_end(c) <= 180]
    s7 = 6.0 * len(p0_in) / max(len(p0u), 1) + 2.0 * len(p1_in) / max(len(p1u), 1)

    def prio_ok(r):
        ranks = [RANK[mid[c]["priority"]] for c in split(r.get("control_ids")) if c in mid]
        mine = RANK.get(r.get("priority"), 9)
        if not ranks or mine > min(ranks):
            return False                     # 路线图优先级不能低于矩阵
        return mine == min(ranks) or bool(r.get("override_reason", "").strip())   # 调高要写理由

    s7 += 1.0 * sum(1 for r in items.values() if prio_ok(r)) / max(len(items), 1)
    dep_ok = sum(1 for r in items.values()
                 if all(d in items and num(items[d], "end_day") is not None and num(items[d], "end_day") <= (num(r, "start_day") or 0)
                        for d in split(r.get("depends_on"))))
    s7 += 2.0 * dep_ok / max(len(items), 1)
    full = sum(1 for r in items.values() if r.get("owner_role", "").strip() and (num(r, "person_days") or 0) > 0
               and r.get("metric", "").strip() and r.get("target", "").strip())
    s7 += 2.0 * full / max(len(items), 1)
    load = sum(num(r, "person_days") or 0 for r in items.values() if (num(r, "end_day") or 999) <= 90)
    s7 += 1.0 if load <= a.capacity else 0
    score["7 90 天路线图"] = (round(s7, 1), 14, "P0 在 90 天内 %d/%d；P1 在 180 天内 %d/%d；依赖合法 %d/%d；90 天内 %.0f 人天（上限 %.0f）" % (len(p0_in), len(p0u), len(p1_in), len(p1u), dep_ok, len(items), load, a.capacity))
    if len(p0_in) < len(p0u):
        redlines.append("红线：未完全实施的 P0 控制没有在 90 天内排入路线图：" + "、".join(c for c in p0u if c not in p0_in))

    auto = sum(v[0] for v in score.values())
    print("自动判分（目录 %s，评估日 %s）" % (a.dir, a.asof))
    for k, (s, m, note) in score.items():
        print("  %-22s %5.1f / %-3d %s" % (k, s, m, note))
    print("  %-22s %5.1f / 72" % ("自动判分合计", auto))
    print("  %-22s %5.1f / 28   第 1、6、8、9 项由人工评分（--manual 填入）" % ("人工评分", a.manual))
    total = auto + a.manual
    for x in fails:
        print("问题：" + x)
    for x in redlines:
        print(x)
    verdict = "通过" if (total >= 80 and not redlines and not fails) else "不通过"
    print("总分 %.1f / 100，红线 %d 条 -> %s" % (total, len(redlines), verdict))
    sys.exit(0 if verdict == "通过" else 1)


if __name__ == "__main__":
    main()
