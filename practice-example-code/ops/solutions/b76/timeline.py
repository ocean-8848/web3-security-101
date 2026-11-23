#!/usr/bin/env python3
"""B76 参考实现：把多源日志按时间合并成一条事故时间线（只用标准库）。

用法（从 web3-security-handbook/ 出发）：
  python3 practice-example-code/ops/solutions/b76/timeline.py \
      --entity A01367 --entity 203.0.113.10 --since 2026-03-04T00:55:00Z --until 2026-03-04T03:00:00Z
"""
import argparse, csv, json, sys
from pathlib import Path

DATA = Path("practice-example-code/ops/data")


def rows_csv(name):
    with open(DATA / f"{name}.csv", newline="", encoding="utf-8") as f:
        yield from csv.DictReader(f)


def rows_jsonl(name):
    with open(DATA / f"{name}.jsonl", encoding="utf-8") as f:
        for line in f:
            yield json.loads(line)


def short(addr, n=12):
    return (addr or "-")[:n] + "…" if addr and len(addr) > n else (addr or "-")


# 每个来源：(读取函数, id 字段, 实体字段列表, 摘要函数)。实体 = 以后能拿来"换个角度再查"的值。
SOURCES = {
    "logins": (lambda: rows_csv("logins"), "login_id",
               ["account_id", "ip", "device_id"],
               lambda r: f"登录 {r['result']} ip={r['ip']} mfa={r['mfa_method']}"),
    "recoveries": (lambda: rows_csv("recoveries"), "recovery_id",
                   ["account_id", "ip", "device_id"],
                   lambda r: f"找回 {r['channel']} {r['result']} 审核={r['review_type']}"),
    "account_events": (lambda: rows_csv("account_events"), "event_id",
                       ["account_id", "ip", "device_id"],
                       lambda r: f"{r['event_type']} {r['detail']} ip={r['ip']}"),
    "withdrawals": (lambda: rows_csv("withdrawals"), "wd_id",
                    ["account_id", "to_address", "approval_id", "tx_hash", "key_id"],
                    lambda r: (f"提币申请 {r['amount']} {r['asset']}(约{r['amount_usd']}美元) -> {short(r['to_address'])} "
                               f"status={r['status']} 地址加入={r['addr_added_ts'] or '-'} 审批={r['approval_id'] or '-'}")),
    "approvals": (lambda: rows_csv("approvals"), "approval_id",
                  ["approval_id", "subject_id", "to_address"],
                  lambda r: (f"审批 {r['type']} {r['amount']} {r['asset']} -> {short(r['to_address'])} "
                             f"{r['approved_by']}×{r['approver_count']} {r['status']}")),
    "signing_requests": (lambda: rows_jsonl("signing_requests"), "request_id",
                         ["request_id", "approval_id", "to_address"],
                         lambda r: (f"签名请求 {r['source']} {r['wallet_tier']} {r['amount']} {r['asset']}(约{r['amount_usd']}美元) "
                                    f"-> {short(r['to_address'])} 审批={r['approval_id'] or '无'} {r['signer_result']}")),
    "chain_txs": (lambda: rows_csv("chain_txs"), "tx_hash",
                  ["tx_hash", "to_addr", "from_addr", "wd_id", "account_id", "request_id"],
                  lambda r: (f"链上 {r['from_tier']}->{r['to_tier']} {r['kind']} {r['amount']} {r['asset']}"
                             f"(约{r['amount_usd']}美元) 提币单={r['wd_id'] or '无'} 请求={r['request_id'] or '-'}")),
    "cloud_audit": (lambda: rows_jsonl("cloud_audit"), "event_id",
                    ["identity", "source_ip"],
                    lambda r: f"云 {r['identity']} {r['action']} {r['resource']} ip={r['source_ip']} ua={r['user_agent']} {r['result']}"),
    "k8s_audit": (lambda: rows_jsonl("k8s_audit"), "event_id",
                  ["user", "source_ip"],
                  lambda r: (f"k8s {r['user']} {r['verb']} {r['resource']}"
                             f"{'/' + r['subresource'] if r['subresource'] else ''} {r['namespace']}/{r['name']} "
                             f"code={r['response_code']} ip={r['source_ip']}")),
    "endpoint_events": (lambda: rows_jsonl("endpoint_events"), "event_id",
                        ["host", "user", "dest_ip"],
                        lambda r: (f"端点 {r['host']} {r['event_type']} {r['image']}<-{r['parent_image']} "
                                   f"{r['cmdline'] or ''}{('->' + r['dest_ip'] + ':' + str(r['dest_port'])) if r['dest_ip'] else ''}")),
}


def collect(entities, since, until, only):
    out = []
    for name, (reader, idf, ents, summ) in SOURCES.items():
        if only and name not in only:
            continue
        for r in reader():
            ts = r["ts"]
            if (since and ts < since) or (until and ts > until):
                continue
            if not entities & {str(r.get(e)) for e in ents if r.get(e) not in (None, "")}:
                continue
            out.append({"ts": ts, "source": name, "id": r[idf], "summary": summ(r)})
    out.sort(key=lambda e: (e["ts"], e["source"], e["id"]))
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--entity", action="append", required=True, help="实体值（账户、IP、地址、员工号、主机、请求号……），可重复")
    ap.add_argument("--since"); ap.add_argument("--until")
    ap.add_argument("--source", action="append", help="只看某些来源，可重复")
    ap.add_argument("--fmt", choices=["table", "csv"], default="table")
    ap.add_argument("--limit", type=int, default=0, help="最多输出几行（0=不限）")
    a = ap.parse_args()
    ev = collect(set(a.entity), a.since, a.until, set(a.source or []))
    total = len(ev)
    if a.limit:
        ev = ev[:a.limit]
    if a.fmt == "csv":
        w = csv.DictWriter(sys.stdout, fieldnames=["ts", "source", "id", "summary"])
        w.writeheader(); w.writerows(ev)
        return
    for e in ev:
        print(f"{e['ts']}  {e['source']:<16} {e['id'][:14]:<14} {e['summary']}")
    print(f"（共 {total} 行，显示 {len(ev)} 行）")


if __name__ == "__main__":
    main()
