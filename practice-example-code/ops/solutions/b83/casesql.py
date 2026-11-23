#!/usr/bin/env python3
"""B83 案件库 SQL 回放：把第二批的案件数据装进内存 SQLite，运行一条 SELECT，并可对 S15 标准答案评分。

表：
  case_actions   案件处置动作（action_id ts case_id account_id action scope actor authorizer authority_ref report_status report_ts retry_of）
  cases          案件（case_id opened_ts account_id type source severity status closed_ts）
  staff_roles    员工角色（staff_id role），取自第一批 staff.csv，每人一行
  order_events   订单事件（event_id seq ts symbol event_type order_id account_id side price qty ...）
空值是 NULL。规则文件写法同 B72：开头 `-- id:`、`-- scenario:`、`-- param: name=value`，其余是一条 SELECT，参数在 SQL 里写 :name。

用法（从 web3-security-101/ 出发）：
  python3 practice-example-code/ops/solutions/b83/casesql.py --tables
  python3 practice-example-code/ops/solutions/b83/casesql.py --sql "SELECT action, COUNT(*) n FROM case_actions GROUP BY 1"
  python3 practice-example-code/ops/solutions/b83/casesql.py my_rules/f1.sql --score S15-01 [--param name=value] [--show N]
评分口径同 lib/minix.py：命中字段用 action_id 或 account_id 对答案；输出召回与误报。
"""
import argparse
import os
import re
import sqlite3
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.path.join(HERE, "..", "..", "lib")
sys.path.insert(0, LIB)
import csv  # noqa: E402
import minix  # noqa: E402

COLS = {
    "case_actions": ["action_id", "ts", "case_id", "account_id", "action", "scope", "actor", "authorizer", "authority_ref", "report_status", "report_ts", "retry_of"],
    "cases": ["case_id", "opened_ts", "account_id", "type", "source", "severity", "status", "closed_ts"],
    "order_events": ["event_id", "seq", "ts", "symbol", "event_type", "order_id", "account_id", "side", "price", "qty", "reason", "source"],
}


def connect():
    db = sqlite3.connect(":memory:")
    db.row_factory = sqlite3.Row
    for t, cols in COLS.items():
        db.execute("CREATE TABLE %s (%s)" % (t, ", ".join(cols)))
        db.executemany("INSERT INTO %s VALUES (%s)" % (t, ",".join("?" * len(cols))),
                       [tuple(r.get(c) for c in cols) for r in minix.rows(t)])
    db.execute("CREATE TABLE staff_roles (staff_id, role)")
    seen = {}
    with open(os.path.join(minix.DATA, "staff.csv"), newline="") as f:
        for r in csv.DictReader(f):
            seen[r["staff_id"]] = r["role"]
    db.executemany("INSERT INTO staff_roles VALUES (?,?)", sorted(seen.items()))
    return db


def load_rule(path):
    text = open(path).read()
    meta = {"params": {}}
    for line in text.splitlines():
        m = re.match(r"--\s*(\w+):\s*(.*)$", line)
        if not m:
            continue
        k, v = m.group(1), m.group(2).strip()
        if k == "param":
            n, _, val = v.partition("=")
            meta["params"][n.strip()] = val.strip()
        else:
            meta[k] = v
    sql = "\n".join(l for l in text.splitlines() if not l.lstrip().startswith("--")).strip().rstrip(";")
    return meta, sql


def coerce(v):
    for f in (int, float):
        try:
            return f(v)
        except ValueError:
            pass
    return v


def table(rows):
    if not rows:
        print("（0 行）")
        return
    cols = list(rows[0].keys())
    cells = [[("" if r[c] is None else str(r[c])) for c in cols] for r in rows]
    w = [max(len(c), *(len(x[i]) for x in cells)) for i, c in enumerate(cols)]
    print("（%d 行）" % len(rows))
    print("  ".join(c.ljust(w[i]) for i, c in enumerate(cols)))
    print("  ".join("-" * w[i] for i in range(len(cols))))
    for x in cells:
        print("  ".join(v.ljust(w[i]) for i, v in enumerate(x)))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("rule", nargs="?", help="规则文件（.sql）")
    ap.add_argument("--sql", help="直接运行一条 SELECT，输出表格")
    ap.add_argument("--tables", action="store_true", help="列出表与行数")
    ap.add_argument("--param", action="append", default=[], help="name=value，覆盖规则里的 -- param")
    ap.add_argument("--score", help="对答案评分：场景或答案编号，如 S15 或 S15-01")
    ap.add_argument("--show", type=int, default=5, help="评分模式下最多显示多少条命中（默认 5）")
    ap.add_argument("--min-recall", type=float)
    ap.add_argument("--max-fp", type=int)
    a = ap.parse_args()
    db = connect()
    if a.tables:
        for t in list(COLS) + ["staff_roles"]:
            print("%-14s %d" % (t, db.execute("SELECT COUNT(*) FROM " + t).fetchone()[0]))
        return
    if a.sql:
        table([dict(r) for r in db.execute(a.sql)])
        return
    if not a.rule:
        ap.error("需要规则文件、--sql 或 --tables")
    meta, sql = load_rule(a.rule)
    params = {k: coerce(v) for k, v in meta["params"].items()}
    for kv in a.param:
        k, _, v = kv.partition("=")
        params[k] = coerce(v)
    hits = [dict(r) for r in db.execute(sql, params)]
    print("规则：%s   参数：%s" % (meta.get("id", os.path.basename(a.rule)), params or "无"))
    tgt = a.score or meta.get("scenario")
    res, detail = minix.score(hits, minix.targets_of(tgt))
    print("目标：%s" % ",".join(sorted(res["targets"])))
    print("命中 %d 条：TP %d，误报 %d（噪声 %d、未解释 %d），其他场景 %d" %
          (res["hits"], res["tp_hits"], res["fp_hits"], res["fp_noise"], res["fp_unexplained"], res["other_hits"]))
    print("召回：%d/%d = %.0f%%" % (res["recalled"], res["positives"], 100 * (res["recall"] or 0)))
    if res["missed"]:
        print("漏掉：%s" % ", ".join(res["missed"]))
    for k, ids, h in detail[:a.show]:
        print("  [%s] %s  %s" % (k, ",".join(ids), " ".join("%s=%s" % (x, h[x]) for x in sorted(h) if h[x] is not None)[:150]))
    if len(detail) > a.show:
        print("  ……还有 %d 条（--show N）" % (len(detail) - a.show))
    bad = (a.min_recall is not None and (res["recall"] or 0) < a.min_recall) or (a.max_fp is not None and res["fp_hits"] > a.max_fp)
    if bad:
        print("未达标：召回或误报不满足 --min-recall / --max-fp", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
