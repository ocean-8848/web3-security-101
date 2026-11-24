#!/usr/bin/env python3
"""提币 / 充值状态机事件校验（对 data_x/pending_states.jsonl）。

状态机：
  提币 reserve -> approve -> sign -> broadcast -> [timeout -> rebroadcast]* -> confirm -> book；失败 / 取消走 fail / release
  充值 detect -> [rollback -> detect]* -> confirm -> book
检查项：
  state_skip            出现状态机不允许的跳转（如 sign 直接 confirm、book 之后又 book）
  double_book           同一单据被 book 多次
  dup_receipt_conflict  同一单据收到编号不同的两份确认回执
  dup_receipt_same      编号相同的重复回执（幂等重试），默认不报（--flag-dup-same）
  slow_transition       相邻两个事件间隔超过该状态的 SLA
  hanging               最后一个事件不是终态，且距 --asof 超过该状态的 SLA
  receipt_unverified    确认回执里的 ref 在链上流水 / 银行流水里找不到（--no-verify 关闭）
  receipt_low_conf      确认数低于要求
  timeout / reorg       超时重广播、重组回滚，默认不报（--flag-timeouts / --flag-reorg）

示例：
  python3 code/offchain-ops/lib/state_audit.py --score S14-03,S14-04,S14-05
  python3 code/offchain-ops/lib/state_audit.py --sla approve=600 --show 20
  python3 code/offchain-ops/lib/state_audit.py --naive --score S14-03,S14-04,S14-05
模块用法：from state_audit import detect; detect(asof="2026-03-12T00:00:00Z")
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import minix  # noqa: E402

END = "2026-03-15T00:00:00Z"
NEXT = {
    "withdrawal": {"reserve": {"approve", "release"}, "approve": {"sign", "release"}, "sign": {"broadcast"}, "broadcast": {"timeout", "confirm", "fail"},
                   "timeout": {"rebroadcast", "fail"}, "rebroadcast": {"timeout", "confirm", "fail"}, "confirm": {"book", "confirm"}, "book": set(), "fail": {"release"}, "release": set()},
    "deposit": {"detect": {"rollback", "confirm"}, "rollback": {"detect"}, "confirm": {"book", "confirm"}, "book": set()},
}
TERMINAL = {"book", "release"}
SLA = {"reserve": 86400, "approve": 3600, "sign": 600, "broadcast": 21600, "timeout": 3600, "rebroadcast": 21600, "confirm": 3600, "detect": 21600, "rollback": 21600, "fail": 3600}
SLA_BANK = {"broadcast": 432000, "detect": 86400}


def detect(asof=END, verify=True, sla=None, flag_timeouts=False, flag_dup_same=False, flag_reorg=False, events=None, onchain=None, bank=None):
    events = events if events is not None else [e for e in minix.iter_jsonl("pending_states") if e["ts"] <= asof]
    by = {}
    for e in events:
        by.setdefault(e["item_id"], []).append(e)
    ext = set()
    if verify:
        ext = {x["tx_hash"] for x in (onchain if onchain is not None else minix.iter_csv("onchain_transfers"))}
        ext |= {x["ref"] for x in (bank if bank is not None else minix.iter_csv("bank_statements"))}
    limits = dict(SLA)
    limits.update(sla or {})
    end_dt = minix.parse_ts(asof)
    out = []

    def add(item, kind, **kw):
        out.append(dict({"kind": kind, "item_id": item}, **kw))

    for item in sorted(by):
        allevs = sorted(by[item], key=lambda e: (e["ts"], e["event_id"]))
        kind, rail = allevs[0]["kind"], allevs[0]["rail"]
        evs, got = [], set()
        for e in allevs:  # 编号相同的重复回执是幂等重试，不参与状态跳转
            if e["event_type"] == "confirm" and e["receipt_id"] in got:
                continue
            if e["event_type"] == "confirm":
                got.add(e["receipt_id"])
            evs.append(e)
        nxt = NEXT[kind]
        refs = [e["ref"] for e in evs if e["ref"]]
        ref = refs[-1] if refs else None
        lim = dict(limits)
        if rail == "bank":
            for k, v in SLA_BANK.items():
                if not (sla and k in sla):
                    lim[k] = v
        prev = None
        flagged = set()
        for e in evs:
            t = e["event_type"]
            if prev is not None:
                if t not in nxt.get(prev["event_type"], set()):
                    key = ("double_book" if (prev["event_type"] == "book" and t == "book") else "state_skip")
                    if key not in flagged:
                        add(item, key, ref=ref, from_state=prev["event_type"], to_state=t, ts=e["ts"])
                        flagged.add(key)
                gap = (minix.parse_ts(e["ts"]) - minix.parse_ts(prev["ts"])).total_seconds()
                if gap > lim.get(prev["event_type"], 10 ** 9) and "slow_transition" not in flagged:
                    add(item, "slow_transition", ref=ref, from_state=prev["event_type"], to_state=t, hours=round(gap / 3600, 1))
                    flagged.add("slow_transition")
            prev = e
        last = evs[-1]
        if last["event_type"] not in TERMINAL:
            age = (end_dt - minix.parse_ts(last["ts"])).total_seconds()
            if age > lim.get(last["event_type"], 10 ** 9):
                add(item, "hanging", ref=ref, state=last["event_type"], hours=round(age / 3600, 1), amount=last["amount"])
        confirms = [e for e in evs if e["event_type"] == "confirm"]
        receipts = {e["receipt_id"] for e in confirms}
        if len(receipts) > 1:
            add(item, "dup_receipt_conflict", ref=ref, receipts=sorted(receipts))
        elif sum(1 for e in allevs if e["event_type"] == "confirm") > 1 and flag_dup_same:
            add(item, "dup_receipt_same", ref=ref, receipts=sorted(receipts))
        if verify and confirms and confirms[0]["ref"] and confirms[0]["ref"] not in ext:
            add(item, "receipt_unverified", ref=confirms[0]["ref"], amount=confirms[0]["amount"])
        for c in confirms[:1]:
            if c["required"] and c["confirmations"] is not None and c["confirmations"] < c["required"]:
                add(item, "receipt_low_conf", ref=c["ref"], confirmations=c["confirmations"], required=c["required"])
        if flag_timeouts and any(e["event_type"] == "timeout" for e in evs):
            add(item, "timeout", ref=ref)
        if flag_reorg and any(e["event_type"] == "rollback" for e in evs):
            add(item, "reorg", ref=ref)
    return out


def main(argv=None):
    ap = minix.new_parser(__doc__)
    ap.add_argument("--asof", default=END, help="统计截止时间（默认 2026-03-15T00:00:00Z）")
    ap.add_argument("--no-verify", dest="verify", action="store_false", help="不核对回执 ref 是否在链上 / 银行流水里")
    ap.add_argument("--sla", action="append", default=[], metavar="状态=秒", help="覆盖某状态的 SLA，如 approve=600，可重复")
    ap.add_argument("--flag-timeouts", action="store_true", help="报超时重广播的单据")
    ap.add_argument("--flag-dup-same", action="store_true", help="报编号相同的重复回执")
    ap.add_argument("--flag-reorg", action="store_true", help="报充值重组回滚")
    ap.add_argument("--naive", action="store_true", help="没调过的参数：--sla approve=600 --sla reserve=600 并报超时、相同回执、重组")
    minix.common_args(ap)
    a = ap.parse_args(argv)
    sla = {k: int(v) for k, _, v in (s.partition("=") for s in a.sla)}
    if a.naive:
        for k, v in (("approve", 600), ("reserve", 600)):
            sla.setdefault(k, v)
        a.flag_timeouts = a.flag_dup_same = a.flag_reorg = True
    params = {"asof": a.asof, "verify": a.verify, "sla": sla, "flag_timeouts": a.flag_timeouts, "flag_dup_same": a.flag_dup_same, "flag_reorg": a.flag_reorg}
    return minix.finish("state_audit", detect(**params), a, params)


if __name__ == "__main__":
    main()
