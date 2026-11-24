#!/usr/bin/env python3
"""读日志与表：筛选、统计、直接跑 SQL。

示例（从 web3-security-101/ 出发）：
  python3 code/offchain-ops/lib/logread.py --tables
  python3 code/offchain-ops/lib/logread.py --schema withdrawals
  python3 code/offchain-ops/lib/logread.py logins --where result=failed_password --since 2026-03-04T01:00:00Z --until 2026-03-04T01:10:00Z --limit 5
  python3 code/offchain-ops/lib/logread.py k8s_audit --where namespace=signing --where subresource=exec --fmt json
  python3 code/offchain-ops/lib/logread.py --sql "SELECT status, COUNT(*) n FROM withdrawals GROUP BY status"
"""
import argparse
import csv
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mini  # noqa: E402


def emit(rows, fmt):
    if not rows:
        print("（无结果）")
        return
    cols = list(rows[0].keys())
    if fmt == "json":
        for r in rows:
            print(json.dumps(r, ensure_ascii=False))
    elif fmt == "csv":
        w = csv.writer(sys.stdout, lineterminator="\n")
        w.writerow(cols)
        for r in rows:
            w.writerow([r[c] for c in cols])
    else:
        width = [min(40, max(len(str(c)), *(len(str(r[c])) for r in rows))) for c in cols]
        print("  ".join(str(c).ljust(w) for c, w in zip(cols, width)))
        print("  ".join("-" * w for w in width))
        for r in rows:
            print("  ".join(str(r[c])[:40].ljust(w) for c, w in zip(cols, width)))
    print("（%d 行）" % len(rows), file=sys.stderr)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("table", nargs="?", help="表名（见 --tables）")
    ap.add_argument("--where", action="append", default=[], help="列=值，可重复；值写 NULL 表示 IS NULL")
    ap.add_argument("--since", help="ts >= 该时间（ISO，如 2026-03-04T01:00:00Z）")
    ap.add_argument("--until", help="ts < 该时间")
    ap.add_argument("--limit", type=int, default=20)
    ap.add_argument("--fmt", choices=["table", "csv", "json"], default="table")
    ap.add_argument("--count", action="store_true", help="只数行数")
    ap.add_argument("--sql", help="直接执行一条 SELECT")
    ap.add_argument("--tables", action="store_true", help="列出所有表与行数")
    ap.add_argument("--schema", metavar="TABLE", help="显示表的列")
    a = ap.parse_args()
    db = mini.connect()
    if a.tables:
        for t in mini.TABLES:
            n = db.execute("SELECT COUNT(*) FROM %s" % t).fetchone()[0]
            print("%-18s %7d" % (t, n))
        return
    if a.schema:
        for r in db.execute("PRAGMA table_info(%s)" % a.schema):
            print("%-22s %s" % (r["name"], r["type"]))
        return
    if a.sql:
        if not a.sql.lstrip().lower().startswith(("select", "with")):
            sys.exit("只允许 SELECT / WITH 查询")
        emit(mini.q(db, a.sql), a.fmt)
        return
    if not a.table or a.table not in mini.TABLES:
        sys.exit("请给出表名之一：" + ", ".join(mini.TABLES))
    conds, params = [], {}
    for i, w in enumerate(a.where):
        c, _, v = w.partition("=")
        if not c.isidentifier():
            sys.exit("列名不合法：" + c)
        if v == "NULL":
            conds.append("%s IS NULL" % c)
        else:
            conds.append("%s = :w%d" % (c, i))
            params["w%d" % i] = v
    if a.since:
        conds.append("ts >= :since")
        params["since"] = a.since
    if a.until:
        conds.append("ts < :until")
        params["until"] = a.until
    where = (" WHERE " + " AND ".join(conds)) if conds else ""
    if a.count:
        print(db.execute("SELECT COUNT(*) FROM %s%s" % (a.table, where), params).fetchone()[0])
        return
    order = " ORDER BY ts" if a.table != "staff" and a.table != "accounts" else ""
    emit(mini.q(db, "SELECT * FROM %s%s%s LIMIT %d" % (a.table, where, order, a.limit), params), a.fmt)


if __name__ == "__main__":
    main()
