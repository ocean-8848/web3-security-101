#!/usr/bin/env python3
"""B74 参考实现：冷 -> 温 -> 热 调拨审批流程模拟。

用同一批场景，对比"朴素签名服务"（只看有无审批单、金额是否不超）与"严格签名服务"。
场景 1-8 用虚构地址；场景 9 用靶场里真实的 S6-03（SR001044 / AP-T0048）。
用法（从 web3-security-handbook/ 出发）：python3 practice-example-code/ops/solutions/b74/transfer_sim.py
只用标准库。
"""
import sys
from dataclasses import dataclass, field
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "lib"))
import mini  # noqa: E402

# 每条路径的策略（示例，数值取自 X11 的示例策略并按靶场数据调整）
POLICY = {
    "cold_to_warm": dict(min_approvers=2, delay_min=240, window_min=72 * 60, max_single_usd=20_000_000, daily_usd=None),
    "warm_to_hot": dict(min_approvers=2, delay_min=0, window_min=120, max_single_usd=500_000, daily_usd=1_000_000),
}
REGISTERED = {"0xaaaa000000000000000000000000000000000001": "warm", "0xbbbb000000000000000000000000000000000002": "hot"}


@dataclass
class Approval:
    id: str
    path: str
    to: str
    asset: str
    amount: float
    usd: float
    approvers: list
    initiator: str
    ts: int                      # 分钟
    used: bool = False


@dataclass
class Request:
    approval_id: str
    to: str
    asset: str
    amount: float
    usd: float
    ts: int
    chain: str = "ETH"


@dataclass
class Signer:
    mode: str                    # "naive" 或 "strict"
    book: dict = field(default_factory=dict)
    daily: dict = field(default_factory=dict)
    registered: dict = field(default_factory=lambda: dict(REGISTERED))

    def sign(self, req: Request):
        ap = self.book.get(req.approval_id)
        if ap is None:
            return "reject", ["NO_APPROVAL"]
        if self.mode == "naive":                       # 只看"有单"和"金额不超"
            return ("allow", []) if req.amount <= ap.amount else ("reject", ["AMOUNT_EXCEEDS"])
        pol, why = POLICY[ap.path], []
        if req.to.lower() != ap.to.lower():
            why.append("ADDRESS_MISMATCH")
        if req.asset != ap.asset:
            why.append("ASSET_MISMATCH")
        if req.amount > ap.amount:
            why.append("AMOUNT_EXCEEDS")
        if ap.to.lower() not in self.registered:
            why.append("DESTINATION_NOT_REGISTERED")
        if ap.used:
            why.append("APPROVAL_ALREADY_USED")
        people = set(ap.approvers) - {ap.initiator}
        if len(people) < pol["min_approvers"]:
            why.append("DUAL_CONTROL_MISSING")
        lag = req.ts - ap.ts
        if lag < pol["delay_min"]:
            why.append("DELAY_NOT_ELAPSED")
        elif lag > pol["window_min"]:
            why.append("APPROVAL_EXPIRED")
        if req.usd > pol["max_single_usd"]:
            why.append("SINGLE_LIMIT")
        day = req.ts // 1440
        if pol["daily_usd"] and self.daily.get(day, 0) + req.usd > pol["daily_usd"]:
            return ("escalate", why + ["DAILY_LIMIT"]) if not why else ("reject", why + ["DAILY_LIMIT"])
        if why:
            return "reject", why
        ap.used = True
        self.daily[day] = self.daily.get(day, 0) + req.usd
        return "allow", []


def fresh(mode):
    s = Signer(mode)
    return s


def scenarios():
    A, B = "0xbbbb000000000000000000000000000000000002", "0xdddd000000000000000000000000000000000009"
    ok = lambda i, **k: Approval(i, k.get("path", "warm_to_hot"), k.get("to", A), "USDT", k.get("amount", 150_000), k.get("amount", 150_000),
                                 k.get("approvers", ["ST031", "ST032"]), k.get("initiator", "ST033"), 0)
    rq = lambda i, **k: Request(i, k.get("to", A), "USDT", k.get("amount", 150_000), k.get("amount", 150_000), k.get("ts", 40))
    out = []
    out.append(("1 正常：温 -> 热 15 万 USDT", [ok("AP-1")], [rq("AP-1")]))
    out.append(("2 审批单重复使用（同一单签两次）", [ok("AP-2")], [rq("AP-2"), rq("AP-2", ts=45)]))
    out.append(("3 地址被换（金额不变）", [ok("AP-3")], [rq("AP-3", to=B)]))
    out.append(("4 金额放大 15 万 -> 60 万", [ok("AP-4")], [rq("AP-4", amount=600_000)]))
    out.append(("5 审批人只有 1 个真人（另一个是发起人）", [ok("AP-5", approvers=["ST031", "ST033"])], [rq("AP-5")]))
    out.append(("6 冷 -> 温 只等了 30 分钟（要求 240）", [ok("AP-6", path="cold_to_warm", to="0xaaaa000000000000000000000000000000000001")],
                [rq("AP-6", to="0xaaaa000000000000000000000000000000000001", ts=30)]))
    out.append(("7 审批单过期：3 小时后才来签", [ok("AP-7")], [rq("AP-7", ts=180)]))
    out.append(("8 日限额：同日 3 笔各 40 万（日限额 100 万）", [ok("AP-8a", amount=400_000), ok("AP-8b", amount=400_000), ok("AP-8c", amount=400_000)],
                [rq("AP-8a", amount=400_000), rq("AP-8b", amount=400_000, ts=50), rq("AP-8c", amount=400_000, ts=60)]))
    return out


def real_s6_03():
    """场景 8：把真实的 AP-T0048 / SR001044 放进模拟器。"""
    db = mini.connect()
    a = mini.q(db, "SELECT * FROM approvals WHERE approval_id='AP-T0048'")[0]
    s = mini.q(db, "SELECT * FROM signing_requests WHERE request_id='SR001044'")[0]
    ts = lambda x: int(__import__("datetime").datetime.strptime(x, "%Y-%m-%dT%H:%M:%SZ").timestamp() // 60)
    ap = Approval(a["approval_id"], "warm_to_hot", a["to_address"], a["asset"], a["amount"], a["amount"],
                  a["approved_by"].split(","), "ST030", ts(a["ts"]))
    rq = Request(s["approval_id"], s["to_address"], s["asset"], s["amount"], s["amount_usd"], ts(s["ts"]), s["chain"])
    reg = {a["to_address"].lower(): "hot"}
    return ap, rq, reg


def run():
    print("场景 | 朴素签名 | 严格签名 | 严格签名的原因")
    blocked_by_strict = 0
    for name, aps, rqs in scenarios():
        res = {}
        for mode in ("naive", "strict"):
            sg = fresh(mode)
            for a in aps:
                sg.book[a.id] = Approval(**a.__dict__)
            res[mode] = [sg.sign(r) for r in rqs]
        n = "/".join(d for d, _ in res["naive"])
        st = "/".join(d for d, _ in res["strict"])
        print("%s | %s | %s | %s" % (name, n, st, ";".join(",".join(w) for _, w in res["strict"] if w) or "-"))
        blocked_by_strict += any(d != "allow" for d, _ in res["strict"])
    ap, rq, reg = real_s6_03()
    rows = {}
    for mode in ("naive", "strict"):
        sg = fresh(mode)
        sg.book[ap.id] = Approval(**ap.__dict__)
        sg.registered = dict(reg)
        rows[mode] = sg.sign(rq)
    print("9 真实 S6-03：SR001044 / AP-T0048（金额一致） | %s | %s | %s" % (rows["naive"][0], rows["strict"][0], ",".join(rows["strict"][1])))
    print("\n严格签名对场景 2-8 全部拦下或升级：%d/7；场景 1 放行；真实 S6-03：朴素=%s，严格=%s" % (blocked_by_strict, rows["naive"][0], rows["strict"][0]))


if __name__ == "__main__":
    run()
