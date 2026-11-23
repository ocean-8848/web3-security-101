"""MiniEx 第二批（S10–S15）共用库：路径、读数据、答案匹配与评分、统一的命令行输出。只用标准库。

第二批的数据在 data_x/，答案在 answers/S10.json … S15.json 与 answers/index_x.json；
第一批的 mini.py、replay.py 不受影响。每个 *_audit / *_check 脚本都 import 本模块。
"""
import argparse
import csv
import json
import os
import sys
from datetime import datetime

LIB = os.path.dirname(os.path.abspath(__file__))
OPS = os.path.dirname(LIB)
DATA = os.path.join(OPS, "data")
DATA_X = os.path.join(OPS, "data_x")
ANSWERS = os.path.join(OPS, "answers")

CSV_X = ["trade_ledger_link", "positions", "liquidations", "bank_statements", "wallet_balances", "reserve_snapshots", "liabilities", "onchain_transfers", "cases"]
JSONL_X = ["order_events", "match_log", "pending_states", "case_actions"]
TABLES_X = CSV_X + JSONL_X
NUM = {"amount", "amount_usd", "price", "qty", "balance", "balance_usd", "entry_price", "mark_price", "margin", "notional", "equity", "margin_ratio", "mmr", "leverage",
       "trigger_mark", "exec_price", "equity_at_exec", "shortfall", "fund_delta", "fund_before", "fund_after", "unfunded_loss", "adl", "delay_s", "confirmations"}
ALIAS = {"match_id": "trade_id"}


def parse_ts(s):
    return datetime.strptime(s, "%Y-%m-%dT%H:%M:%SZ")


def need(name):
    p = path_of(name)
    if not os.path.exists(p):
        raise SystemExit("找不到 %s，请先运行 bash practice-example-code/ops/setup.sh（或 python3 practice-example-code/ops/gen/generate_x.py）" % p)


def path_of(name):
    return os.path.join(DATA_X, name + (".csv" if name in CSV_X else ".jsonl"))


def iter_csv(name, base=None):
    p = os.path.join(base, name + ".csv") if base else path_of(name)
    if not os.path.exists(p):
        raise SystemExit("找不到 %s，请先运行 bash practice-example-code/ops/setup.sh" % p)
    with open(p, newline="") as f:
        for row in csv.DictReader(f):
            out = {}
            for k, v in row.items():
                if v == "":
                    out[k] = None
                elif k in NUM:
                    out[k] = float(v)
                else:
                    out[k] = v
            yield out


def iter_jsonl(name):
    need(name)
    with open(path_of(name)) as f:
        for line in f:
            if line.strip():
                yield json.loads(line)


def rows(name):
    return list(iter_csv(name) if name in CSV_X else iter_jsonl(name))


def marks():
    """第一批的标记价：{(symbol, step): mark_price}，step 为自 2026-03-01 起的 5 分钟序号。"""
    start = datetime(2026, 3, 1)
    d = {}
    for r in iter_csv("marks", base=DATA):
        d[(r["symbol"], int((parse_ts(r["ts"]) - start).total_seconds() // 300))] = float(r["mark_price"])
    return d


def mark_at(mk, symbol, ts):
    step = int((parse_ts(ts) - datetime(2026, 3, 1)).total_seconds() // 300)
    return mk.get((symbol, max(0, min(4032, step))))


# ------------------------------------------------------------------ 答案与评分
def load_answers():
    with open(os.path.join(ANSWERS, "index_x.json")) as f:
        idx = json.load(f)
    pos, dec = [], []
    for s in idx["scenarios"]:
        with open(os.path.join(ANSWERS, s["id"] + ".json")) as f:
            d = json.load(f)
        pos.extend(d["positives"])
        dec.extend(d["decoys"])
    return pos, dec


def norm(h):
    out = dict(h)
    for a, b in ALIAS.items():
        if a in out and b not in out:
            out[b] = out[a]
    return out


def item_matches(item, hit):
    h = norm(hit)
    for f, vals in item["match"].items():
        f = ALIAS.get(f, f)
        if f in h and h[f] is not None and str(h[f]) in [str(x) for x in vals]:
            return True
    return False


def targets_of(text):
    return set(x.strip() for x in str(text).split(",") if x.strip())


def in_targets(p, targets):
    return p["scenario"] in targets or p["id"] in targets


def score(hits, targets):
    """命中对答案：TP（目标正例）、OTHER（其他场景的正例）、FP（噪声或未解释）。返回 (汇总, 明细)。"""
    positives, decoys = load_answers()
    tp_ids, other_ids, detail, fp_sigs = set(), set(), [], set()
    for h in hits:
        mp = [p for p in positives if item_matches(p, h)]
        tgt = [p for p in mp if in_targets(p, targets)]
        if tgt:
            tp_ids.update(p["id"] for p in tgt)
            detail.append(("TP", [p["id"] for p in tgt], h))
        elif mp:
            other_ids.update(p["id"] for p in mp)
            detail.append(("OTHER", [p["id"] for p in mp], h))
        else:
            md = [d for d in decoys if item_matches(d, h)]
            if md:
                detail.append(("FP-噪声", ["%s(%s)" % (md[0]["id"], md[0]["category"])], h))
                fp_sigs.add(md[0]["id"])
            else:
                detail.append(("FP-未解释", [], h))
                fp_sigs.add(json.dumps(h, sort_keys=True, default=str))
    total = [p for p in positives if in_targets(p, targets)]
    missed = [p["id"] for p in total if p["id"] not in tp_ids]
    res = {"targets": sorted(targets), "hits": len(hits), "tp_hits": sum(1 for d in detail if d[0] == "TP"),
           "fp_hits": sum(1 for d in detail if d[0].startswith("FP")), "fp_noise": sum(1 for d in detail if d[0] == "FP-噪声"),
           "fp_unexplained": sum(1 for d in detail if d[0] == "FP-未解释"), "other_hits": sum(1 for d in detail if d[0] == "OTHER"),
           "positives": len(total), "recalled": len(total) - len(missed), "missed": missed}
    res["recall"] = round(res["recalled"] / len(total), 3) if total else None
    return res, detail


# ------------------------------------------------------------------ 统一的命令行
def common_args(ap):
    ap.add_argument("--score", metavar="目标", help="对标准答案评分，目标是场景或答案编号，逗号分隔，如 S10 或 S10-03,S10-04")
    ap.add_argument("--show", type=int, default=10, help="最多显示多少条发现（默认 10；0 不显示）")
    ap.add_argument("--json", action="store_true", help="输出 JSON（全部发现 + 评分）")
    ap.add_argument("--min-recall", type=float, help="召回低于该值则退出码 1（需要 --score）")
    ap.add_argument("--max-fp", type=int, help="误报条数高于该值则退出码 1（需要 --score）")


def stable(findings):
    return sorted(findings, key=lambda f: json.dumps(f, sort_keys=True, default=str))


def fmt(f):
    return " ".join("%s=%s" % (k, f[k]) for k in sorted(f) if k != "kind" and f[k] is not None)[:200]


def finish(tool, findings, args, params):
    findings = stable(findings)
    res = detail = None
    if args.score:
        res, detail = score(findings, targets_of(args.score))
    if args.json:
        out = {"tool": tool, "params": params, "findings": findings}
        if res:
            out["score"] = res
        print(json.dumps(out, ensure_ascii=False, indent=2, sort_keys=True, default=str))
    else:
        print("工具：%s   参数：%s" % (tool, json.dumps(params, ensure_ascii=False, sort_keys=True)))
        kinds = {}
        for f in findings:
            kinds[f["kind"]] = kinds.get(f["kind"], 0) + 1
        print("发现 %d 条：%s" % (len(findings), "，".join("%s %d" % (k, kinds[k]) for k in sorted(kinds)) or "无"))
        if args.show:
            lab = {}
            if detail:
                lab = {json.dumps(h, sort_keys=True, default=str): (k, ids) for k, ids, h in detail}
            for f in findings[:args.show]:
                tag = ""
                if lab:
                    k, ids = lab[json.dumps(f, sort_keys=True, default=str)]
                    tag = "  <%s %s>" % (k, ",".join(ids))
                print("  [%s] %s%s" % (f["kind"], fmt(f), tag))
            if len(findings) > args.show:
                print("  ……还有 %d 条（--show N 查看更多）" % (len(findings) - args.show))
        if res:
            rc = "n/a" if res["recall"] is None else "%d/%d = %.0f%%" % (res["recalled"], res["positives"], res["recall"] * 100)
            print("评分（目标 %s）：命中 %d，TP %d，误报 %d（噪声 %d、未解释 %d），其他场景 %d；召回 %s" %
                  (",".join(res["targets"]), res["hits"], res["tp_hits"], res["fp_hits"], res["fp_noise"], res["fp_unexplained"], res["other_hits"], rc))
            if res["missed"]:
                print("漏掉：%s" % ", ".join(res["missed"]))
    bad = False
    if res:
        if args.min_recall is not None and (res["recall"] or 0) < args.min_recall:
            bad = True
        if args.max_fp is not None and res["fp_hits"] > args.max_fp:
            bad = True
    if bad:
        print("未达标：召回或误报不满足 --min-recall / --max-fp", file=sys.stderr)
        sys.exit(1)
    return res


def parse_params(ap, argv, naive):
    """--naive 把参数换成“没调过”的一组，其余命令行参数仍可覆盖。"""
    a = ap.parse_args(argv)
    if getattr(a, "naive", False):
        for k, v in naive.items():
            if getattr(a, k) == ap.get_default(k):
                setattr(a, k, v)
    return a


def new_parser(doc):
    return argparse.ArgumentParser(description=doc, formatter_class=argparse.RawDescriptionHelpFormatter)
