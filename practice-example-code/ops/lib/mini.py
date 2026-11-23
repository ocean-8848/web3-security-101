"""MiniEx 靶场共用库：路径、日志读取、SQLite 装载。只用标准库。"""
import csv
import json
import os
import sqlite3
from datetime import datetime

LIB = os.path.dirname(os.path.abspath(__file__))
OPS = os.path.dirname(LIB)
DATA = os.path.join(OPS, "data")
ANSWERS = os.path.join(OPS, "answers")
DB_PATH = os.path.join(DATA, "miniex.db")

CSV_TABLES = ["accounts", "logins", "recoveries", "account_events", "api_keys", "api_calls", "orders_trades", "marks", "ledger",
              "withdrawals", "chain_txs", "approvals", "staff", "support_access"]
JSONL_TABLES = ["signing_requests", "cloud_audit", "k8s_audit", "ci_events", "endpoint_events"]
TABLES = CSV_TABLES + JSONL_TABLES

REAL = {"amount", "amount_usd", "price", "qty", "quote_qty", "index_price", "mark_price"}
INT = {"kyc_level", "source_count", "approver_count", "response_code", "dest_port"}


def table_path(name):
    return os.path.join(DATA, name + (".csv" if name in CSV_TABLES else ".jsonl"))


def parse_ts(s):
    return datetime.strptime(s, "%Y-%m-%dT%H:%M:%SZ")


def iter_csv(name):
    """逐行读 CSV，返回 dict；空字符串变成 None。"""
    with open(table_path(name), newline="") as f:
        for row in csv.DictReader(f):
            yield {k: (v if v != "" else None) for k, v in row.items()}


def iter_jsonl(name):
    """逐行读 JSONL，返回 dict（嵌套字段保持 dict）。"""
    with open(table_path(name)) as f:
        for line in f:
            if line.strip():
                yield json.loads(line)


def iter_table(name):
    return iter_csv(name) if name in CSV_TABLES else iter_jsonl(name)


def _coltype(c):
    if c in REAL:
        return "REAL"
    if c in INT:
        return "INTEGER"
    return "TEXT"


def _cell(c, v):
    if v is None or v == "":
        return None
    if isinstance(v, (dict, list)):
        return json.dumps(v, ensure_ascii=False, sort_keys=True)
    if c in REAL:
        return float(v)
    if c in INT:
        return int(v)
    return v


def build_db(path=DB_PATH, quiet=False):
    """把 data/ 下的所有文件装进 SQLite。空字符串与 JSON null 都变成 NULL；JSON 嵌套字段存成 JSON 文本，可用 json_extract 取值。"""
    if os.path.exists(path):
        os.remove(path)
    db = sqlite3.connect(path)
    counts = {}
    for t in TABLES:
        it = iter_table(t)
        first = next(it, None)
        if first is None:
            continue
        cols = list(first.keys())
        db.execute("CREATE TABLE %s (%s)" % (t, ", ".join("%s %s" % (c, _coltype(c)) for c in cols)))
        ins = "INSERT INTO %s VALUES (%s)" % (t, ",".join("?" * len(cols)))
        n = 0
        batch = []
        for r in [first] + list(it):
            batch.append([_cell(c, r.get(c)) for c in cols])
            n += 1
        db.executemany(ins, batch)
        for c in cols:
            if c.endswith("_id") or c in ("ts", "ip", "source_ip", "symbol", "to_address", "tx_hash", "user", "host", "identity"):
                db.execute("CREATE INDEX idx_%s_%s ON %s(%s)" % (t, c, t, c))
        counts[t] = n
    db.commit()
    db.close()
    if not quiet:
        for t in TABLES:
            print("  %-18s %7d 行" % (t, counts.get(t, 0)))
    return counts


def connect(path=DB_PATH, rebuild=False):
    """打开 SQLite；不存在或数据比库新时自动重建。row_factory 为 sqlite3.Row。"""
    newest = max(os.path.getmtime(table_path(t)) for t in TABLES)
    if rebuild or not os.path.exists(path) or os.path.getmtime(path) < newest:
        build_db(path, quiet=True)
    db = sqlite3.connect(path)
    db.row_factory = sqlite3.Row
    return db


def q(db, sql, params=None):
    """执行查询，返回 dict 列表。params 为 dict（命名参数 :name）。"""
    return [dict(r) for r in db.execute(sql, params or {})]


def load_answers():
    """返回 (positives, decoys)。每项含 id / scenario（或 mimics） / match / window / match_window。"""
    pos, dec = [], []
    idx = json.load(open(os.path.join(ANSWERS, "index.json")))
    for s in idx["scenarios"]:
        d = json.load(open(os.path.join(ANSWERS, s["id"] + ".json")))
        if s["id"] == "S9":
            dec = d["decoys"]
        else:
            pos.extend(d["positives"])
    return pos, dec
