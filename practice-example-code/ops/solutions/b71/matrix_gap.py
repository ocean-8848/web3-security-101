#!/usr/bin/env python3
"""B71 参考实现：读一份填好的控制矩阵 CSV，按保护域算覆盖率并给缺口排序。

用法（从 web3-security-handbook/ 出发）：
  python3 practice-example-code/ops/solutions/b71/matrix_gap.py b71-lab/my_matrix.csv
  python3 practice-example-code/ops/solutions/b71/matrix_gap.py b71-lab/my_matrix.csv --top 3
  python3 practice-example-code/ops/solutions/b71/matrix_gap.py b71-lab/my_matrix.csv --min-domain-coverage 0.5

口径（本手册示例，不是行业标准）：
  权重：P0=3，P1=2，P2=1
  得分：implemented=1，partial=0.5，missing=0
  覆盖率 = sum(权重 x 得分) / sum(权重)；缺口分 = sum(权重 x (1 - 得分))
  状态为 implemented / partial 但 evidence_ref 为空的行，降级为 missing（T08：没有证据按未通过处理）
退出码：0 正常；1 有域低于 --min-domain-coverage；2 矩阵格式有问题。
"""
import argparse
import csv
import os
import re
import sys
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
OPS = os.path.dirname(os.path.dirname(HERE))
DEFAULT_TEMPLATE = os.path.join(OPS, "data", "controls_matrix_template.csv")

WEIGHT = {"P0": 3, "P1": 2, "P2": 1}
SCORE = {"implemented": 1.0, "partial": 0.5, "missing": 0.0}
TYPES = ["预防", "检测", "阻断扩散", "恢复", "证据保全", "治理"]
REQUIRED = ["domain", "control_id", "control", "priority", "verification_method", "owner", "status"]


def pad(text, width):
    """按显示宽度补空格（中文字符占 2 格），让表格列对齐。"""
    w = sum(2 if unicodedata.east_asian_width(c) in "WF" else 1 for c in text)
    return text + " " * max(0, width - w)


def read_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def control_types(text):
    m = re.match(r"\s*\[([^\]]+)\]", text or "")
    if not m:
        return []
    return [t.strip() for t in re.split(r"[/、,]", m.group(1)) if t.strip()]


def main():
    ap = argparse.ArgumentParser(description="控制矩阵覆盖率与缺口排序")
    ap.add_argument("matrix", help="填好的控制矩阵 CSV")
    ap.add_argument("--template", default=DEFAULT_TEMPLATE, help="空白模板，用来取域列表与顺序")
    ap.add_argument("--top", type=int, default=5, help="缺口排序显示前几个域")
    ap.add_argument("--min-domain-coverage", type=float, default=None, help="任一域覆盖率低于该值则退出码为 1")
    args = ap.parse_args()

    domains = [r["domain"] for r in read_csv(args.template)]
    rows = [r for r in read_csv(args.matrix) if (r.get("control_id") or "").strip()]

    errors, seen = [], set()
    for i, r in enumerate(rows, 2):
        cid = r["control_id"].strip()
        if cid in seen:
            errors.append(f"第 {i} 行：control_id {cid} 重复")
        seen.add(cid)
        for k in REQUIRED:
            if not (r.get(k) or "").strip():
                errors.append(f"第 {i} 行（{cid}）：{k} 为空")
        if r.get("domain") not in domains:
            errors.append(f"第 {i} 行（{cid}）：domain「{r.get('domain')}」不在模板的 10 个域里")
        if (r.get("priority") or "").strip() not in WEIGHT:
            errors.append(f"第 {i} 行（{cid}）：priority 必须是 P0 / P1 / P2")
        if (r.get("status") or "").strip() not in SCORE:
            errors.append(f"第 {i} 行（{cid}）：status 必须是 implemented / partial / missing")
        if not control_types(r.get("control")):
            errors.append(f"第 {i} 行（{cid}）：control 要以 [类型] 开头，类型取自 {'/'.join(TYPES)}")
    if errors:
        print("矩阵格式有问题：")
        for e in errors:
            print("  -", e)
        return 2

    stat = {d: {"n": 0, "w": 0.0, "got": 0.0, "types": set(), "eff_types": set(), "downgraded": []} for d in domains}
    p0_open = []
    for r in rows:
        d, pr, st = r["domain"], r["priority"].strip(), r["status"].strip()
        if st in ("implemented", "partial") and not (r.get("evidence_ref") or "").strip():
            stat[d]["downgraded"].append(r["control_id"].strip())
            st = "missing"
        w = WEIGHT[pr]
        s = stat[d]
        s["n"] += 1
        s["w"] += w
        s["got"] += w * SCORE[st]
        types = control_types(r["control"])
        s["types"].update(types)
        if st != "missing":
            s["eff_types"].update(types)
        if pr == "P0" and st != "implemented":
            p0_open.append((r["control_id"].strip(), d, st, r["control"].strip()))

    n_p0 = sum(1 for r in rows if r["priority"].strip() == "P0")
    n_p1 = sum(1 for r in rows if r["priority"].strip() == "P1")
    n_p2 = sum(1 for r in rows if r["priority"].strip() == "P2")
    print(f"矩阵：{args.matrix}   控制 {len(rows)} 条（P0 {n_p0}，P1 {n_p1}，P2 {n_p2}）")
    print("口径：权重 P0=3 P1=2 P2=1；implemented=1 partial=0.5 missing=0；无证据的 implemented/partial 降级为 missing")
    print()

    result = []
    for d in domains:
        s = stat[d]
        cov = s["got"] / s["w"] if s["w"] else 0.0
        result.append((d, s["n"], cov, s["w"] - s["got"], s))
    tw = sum(x[4]["w"] for x in result)
    tg = sum(x[4]["got"] for x in result)

    print(f"{pad('保护域', 14)}{'控制数':>4}{'覆盖率':>9}{'缺口分':>8}   有效预防  有效检测  有效恢复")
    for d, n, cov, gap, s in result:
        def mark(t):
            return "是" if t in s["eff_types"] else "否"
        print(f"{pad(d, 14)}{n:>6}{cov * 100:>8.1f}%{gap:>8.1f}      {mark('预防')}        {mark('检测')}        {mark('恢复')}")
    print(f"{pad('合计', 14)}{len(rows):>6}{(tg / tw * 100 if tw else 0):>8.1f}%{tw - tg:>8.1f}")
    print()

    ranked = sorted(result, key=lambda x: (-x[3], x[2], domains.index(x[0])))  # 缺口分相同时，覆盖率低的在前
    print(f"缺口排序（按缺口分从大到小，前 {args.top} 个）：")
    for i, (d, n, cov, gap, s) in enumerate(ranked[: args.top], 1):
        print(f"  {i}. {d}   缺口分 {gap:.1f}，覆盖率 {cov * 100:.1f}%")
    print()

    print(f"未完全实施的 P0 控制（{len(p0_open)} 条）：")
    for cid, d, st, text in p0_open:
        print(f"  {cid}  {st:<8} {d} | {text}")

    flagged = [(d, s["downgraded"]) for d, _, _, _, s in result if s["downgraded"]]
    if flagged:
        print()
        print("因缺少 evidence_ref 被降级为 missing：", "; ".join(f"{d}: {','.join(ids)}" for d, ids in flagged))

    if args.min_domain_coverage is not None:
        low = [d for d, _, cov, _, _ in result if cov < args.min_domain_coverage]
        if low:
            print()
            print(f"覆盖率低于 {args.min_domain_coverage:.0%} 的域：{'、'.join(low)}")
            return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
