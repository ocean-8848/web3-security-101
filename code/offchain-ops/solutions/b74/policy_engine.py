#!/usr/bin/env python3
"""B74 参考实现：签名策略引擎。对每条 signing_requests 独立校验，输出 allow / reject / escalate。

用法（从 web3-security-101/ 出发）：
  python3 code/offchain-ops/solutions/b74/policy_engine.py
  python3 code/offchain-ops/solutions/b74/policy_engine.py --show reject
  python3 code/offchain-ops/solutions/b74/policy_engine.py --json
退出码：0 = 过关；1 = 未过关。只用标准库。
"""
import argparse, hashlib, json, sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "lib"))
import mini  # noqa: E402

# ---- 策略参数（示例，来自 X14 的调拨策略与靶场的正常数值）----
SOURCES = {  # 请求来源 -> (允许的 requester, 允许的审批单类型)
    "hot-withdraw-svc": ("svc-withdraw", "withdrawal"),
    "treasury-transfer": ("svc-treasury", "treasury_transfer"),
}
WINDOW_MIN = {           # 审批 -> 请求的允许间隔（分钟）：(最小, 最大)
    "withdrawal": (0, 30),
    "warm_to_hot": (0, 120),
    "hot_to_warm": (0, 120),
    "cold_to_warm": (240, 72 * 60),   # 冷钱包调拨要等至少 4 小时
}
HUMAN_APPROVAL_USD = 20000           # 提币 >= 此金额须 2 名真人审批
POST_HOC_GRACE_MIN = 15              # 紧急调拨允许补签的最长时间
WARM_TO_HOT_DAILY_USD = 1_000_000    # 温 -> 热 日限额（示例）
COLD_SINGLE_USD = 20_000_000


def parse_ts(s):
    return datetime.strptime(s, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)


def digest(chain, asset, to, amount):
    """靶场约定的 calldata 摘要：sha256("20260301:cd:链|代币|小写地址|金额") 的前 16 位。"""
    return hashlib.sha256(("20260301:cd:%s|%s|%s|%s" % (chain, asset, to.lower(), amount)).encode()).hexdigest()[:16]


def evaluate(db):
    approvals = {a["approval_id"]: a for a in mini.q(db, "SELECT * FROM approvals")}
    wds = {w["wd_id"]: w for w in mini.q(db, "SELECT * FROM withdrawals")}
    txs = {t["request_id"]: t for t in mini.q(db, "SELECT * FROM chain_txs WHERE request_id IS NOT NULL")}
    approvers_ok = {r["staff_id"] for r in mini.q(
        db, "SELECT staff_id FROM staff WHERE privilege='transfer_approve' AND employed='yes'")}
    reqs = mini.q(db, "SELECT * FROM signing_requests ORDER BY ts, request_id")

    used = {}                       # approval_id -> (request_id, digest) 第一次被使用
    daily = defaultdict(Decimal)    # 日期 -> 温 -> 热 累计美元
    results = []
    for s in reqs:
        rej, esc = [], []
        ts = parse_ts(s["ts"])
        # R1 请求来源
        src = SOURCES.get(s["source"])
        if not src or s["requester"] != src[0]:
            rej.append("BAD_SOURCE")
        # R2 审批单存在
        ap = approvals.get(s["approval_id"]) if s["approval_id"] else None
        if not s["approval_id"]:
            rej.append("NO_APPROVAL")
        elif not ap:
            rej.append("APPROVAL_NOT_FOUND")
        if ap:
            if src and ap["type"] != src[1]:
                rej.append("APPROVAL_TYPE_MISMATCH")
            # R3 目标地址（统一小写）、代币、金额
            if s["to_address"].lower() != ap["to_address"].lower():
                rej.append("ADDRESS_MISMATCH")
            if s["asset"] != ap["asset"]:
                rej.append("ASSET_MISMATCH")
            if Decimal(str(s["amount"])) > Decimal(str(ap["amount"])) * Decimal("1.0001"):
                rej.append("AMOUNT_EXCEEDS")
            # R4 链：提币单上有链；调拨审批单没有链字段，只能靠摘要间接绑定
            if ap["type"] == "withdrawal":
                w = wds.get(ap["subject_id"])
                if not w:
                    rej.append("WITHDRAWAL_NOT_FOUND")
                else:
                    if s["chain"] != w["chain"]:
                        rej.append("CHAIN_MISMATCH")
                    if w["status"] != "completed" or w["approval_id"] != ap["approval_id"]:
                        rej.append("WITHDRAWAL_STATE")
                    if s["to_address"].lower() != w["to_address"].lower() or Decimal(str(s["amount"])) > Decimal(str(w["amount"])) * Decimal("1.0001"):
                        rej.append("WITHDRAWAL_FIELD_MISMATCH")
            # R5 calldata 摘要：用审批单字段重算，必须与请求里的摘要相同
            if digest(s["chain"], ap["asset"], ap["to_address"], ap["amount"]) != s["calldata_hash"]:
                rej.append("DIGEST_MISMATCH")
            # R6 有效期
            lag = (ts - parse_ts(ap["ts"])).total_seconds() / 60
            if ap["type"] == "withdrawal":
                key = "withdrawal"
            else:
                key = {"cold": "cold_to_warm", "warm": "warm_to_hot", "hot": "hot_to_warm"}[s["wallet_tier"]]
            lo, hi = WINDOW_MIN[key]
            if ap["status"] == "approved_post_hoc":
                if -POST_HOC_GRACE_MIN <= lag < 0:
                    esc.append("POST_HOC_APPROVAL")
                else:
                    rej.append("POST_HOC_TOO_LATE")
            elif lag < lo:
                rej.append("APPROVAL_TOO_FRESH" if key == "cold_to_warm" else "APPROVAL_AFTER_REQUEST")
            elif lag > hi:
                rej.append("APPROVAL_EXPIRED")
            # R7 双人控制
            humans = [x for x in ap["approved_by"].split(",") if x != "risk-engine"]
            qualified = [x for x in humans if x in approvers_ok]
            need = 2 if (ap["type"] == "treasury_transfer" or s["amount_usd"] >= HUMAN_APPROVAL_USD) else 0
            if len(set(qualified)) < need:
                esc.append("DUAL_CONTROL_MISSING")
            # R8 审批单只能用一次
            first = used.get(ap["approval_id"])
            if first and first[1] == s["calldata_hash"]:
                rej.append("RETRY_OF_USED")
            elif first:
                rej.append("APPROVAL_REUSED")
        # R9 额度
        if s["source"] == "treasury-transfer":
            if s["wallet_tier"] == "cold" and s["amount_usd"] > COLD_SINGLE_USD:
                esc.append("COLD_SINGLE_LIMIT")
            if s["wallet_tier"] == "warm":
                day = s["ts"][:10]
                if daily[day] + Decimal(str(s["amount_usd"])) > WARM_TO_HOT_DAILY_USD:
                    esc.append("WARM_DAILY_LIMIT")
        # R10 链上结果回填（三方对账）：已签名的请求，链上转账必须与请求一致
        if s["signer_result"] == "signed":
            t = txs.get(s["request_id"])
            if t is None:
                esc.append("NO_CHAIN_TX")
            elif t["to_addr"].lower() != (ap["to_address"] if ap else s["to_address"]).lower() \
                    or Decimal(str(t["amount"])) > Decimal(str(ap["amount"] if ap else s["amount"])) * Decimal("1.0001"):
                rej.append("CHAIN_TX_MISMATCH")  # 链上结果对照审批单（含扣费后的净额），不对照请求自己
            elif s["source"] == "hot-withdraw-svc" and not t["wd_id"]:
                rej.append("CHAIN_TX_WITHOUT_WITHDRAWAL")
        decision = "reject" if rej else ("escalate" if esc else "allow")
        if decision == "allow" and ap and s["signer_result"] == "signed":
            used[ap["approval_id"]] = (s["request_id"], s["calldata_hash"])
            if s["source"] == "treasury-transfer" and s["wallet_tier"] == "warm":
                daily[s["ts"][:10]] += Decimal(str(s["amount_usd"]))
        elif ap and s["signer_result"] == "signed":
            used.setdefault(ap["approval_id"], (s["request_id"], s["calldata_hash"]))
        results.append({"request_id": s["request_id"], "ts": s["ts"], "decision": decision,
                        "reasons": rej + esc, "signer_result": s["signer_result"], "approval_id": s["approval_id"]})
    return results


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--show", choices=["allow", "reject", "escalate"], help="列出某一类决定")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()
    db = mini.connect()
    res = evaluate(db)
    pos, _ = mini.load_answers()
    s6 = {p["match"]["request_id"][0] for p in pos if p["scenario"] == "S6"}
    cnt = Counter(r["decision"] for r in res)
    signed_rej = {r["request_id"] for r in res if r["decision"] == "reject" and r["signer_result"] == "signed"}
    retry = [r for r in res if r["signer_result"] == "rejected_duplicate"]
    retry_ok = all(r["decision"] == "reject" for r in retry)
    false_reject = sorted(signed_rej - s6)
    missed = sorted(s6 - signed_rej)
    ok = not false_reject and not missed and retry_ok
    if args.json:
        print(json.dumps({"counts": cnt, "missed": missed, "false_reject": false_reject, "pass": ok}, ensure_ascii=False))
    else:
        print("共 %d 条签名请求：放行 %d，拒绝 %d，升级人工 %d" % (len(res), cnt["allow"], cnt["reject"], cnt["escalate"]))
        print("已签名且被拒绝：%s" % sorted(signed_rej))
        print("漏掉的 S6：%s    误拒的正常请求：%s    重试请求全部拒绝：%s" % (missed or "无", false_reject or "无", retry_ok))
        for r in res:
            if r["decision"] == "escalate" or (args.show and r["decision"] == args.show) or r["request_id"] in s6:
                print("  %-9s %-9s %-10s %s" % (r["request_id"], r["decision"], r["approval_id"] or "-", ",".join(r["reasons"])))
        print("结果：%s" % ("过关" if ok else "未过关"))
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
