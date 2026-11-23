#!/usr/bin/env python3
"""MiniEx 靶场第二批数据生成器（S10–S15：工程验收与运营恢复）。

独立种子 20260302，与第一批（generate.py，种子 20260301）互不干扰：
- 只读取第一批的 data/accounts.csv、marks.csv、chain_txs.csv、staff.csv（保持账户、标记价、钱包地址、员工一致），不改写任何原文件；
- 输出写到 data_x/（不进仓库），答案写到 answers/S10.json … S15.json 与 answers/index_x.json；
- 全部合成：不含真实用户、地址、密钥；IP 不出现；银行账户是 ACCT- 开头的随机串；
- 只用 Python 3 标准库；同一种子两次生成逐字节一致。

用法：python3 gen/generate_x.py [--seed 20260302] [--src data] [--out data_x] [--answers answers]
"""
import argparse
import csv
import hashlib
import json
import math
import os
import random
from datetime import datetime, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
OPS = os.path.dirname(HERE)
DEFAULT_SEED = 20260302
START = datetime(2026, 3, 1)  # 周日
DAYS = 14
STEPS = DAYS * 288 + 1
SEED = DEFAULT_SEED


def rng(name):
    return random.Random("%d:%s" % (SEED, name))


def iso(t):
    return t.strftime("%Y-%m-%dT%H:%M:%SZ")


def at(day, h=0, m=0, s=0, ms=0):
    return START + timedelta(days=day, hours=h, minutes=m, seconds=s, milliseconds=ms)


def sec(x):
    return timedelta(seconds=x)


def H(label):
    return hashlib.sha256(("%d:%s" % (SEED, label)).encode()).hexdigest()


def addr(label):
    return "0x" + H("addr:" + label)[:40]


def txh(label):
    return "0x" + H("tx:" + label)[:64]


def numstr(x):
    if x is None:
        return ""
    if isinstance(x, float):
        s = ("%.8f" % x).rstrip("0").rstrip(".")
        return "0" if s in ("-0", "") else s
    return str(x)


# ----------------------------------------------------------------- 读取第一批数据（只读）
class Ctx:
    pass


C = Ctx()


def load_ctx(src):
    with open(os.path.join(src, "accounts.csv"), newline="") as f:
        C.accounts = sorted(csv.DictReader(f), key=lambda r: r["account_id"])
    C.marks = {}
    with open(os.path.join(src, "marks.csv"), newline="") as f:
        for r in csv.DictReader(f):
            t = datetime.strptime(r["ts"], "%Y-%m-%dT%H:%M:%SZ")
            C.marks.setdefault(r["symbol"], {})[int((t - START).total_seconds() // 300)] = float(r["mark_price"])
    C.wallets = {}
    with open(os.path.join(src, "chain_txs.csv"), newline="") as f:
        for r in csv.DictReader(f):
            if r["from_tier"] in ("hot", "warm", "cold"):
                C.wallets[(r["from_tier"], r["chain"], r["asset"])] = r["from_addr"]
            if r["to_tier"] in ("hot", "warm", "cold"):
                C.wallets[(r["to_tier"], r["chain"], r["asset"])] = r["to_addr"]
    C.staff = {}
    with open(os.path.join(src, "staff.csv"), newline="") as f:
        for r in csv.DictReader(f):
            if r["employed"] == "yes":
                C.staff.setdefault(r["role"], set()).add(r["staff_id"])
    C.staff = {k: sorted(v) for k, v in C.staff.items()}
    C.staff_role = {}
    with open(os.path.join(src, "staff.csv"), newline="") as f:
        for r in csv.DictReader(f):
            C.staff_role[r["staff_id"]] = r["role"]


def wallet(tier, chain, asset):
    w = C.wallets.get((tier, chain, asset))
    return w or addr("wallet:%s:%s:%s" % (tier, chain, asset))


def mark(sym, dt):
    k = max(0, min(STEPS - 1, int((dt - START).total_seconds() // 300)))
    return C.marks[sym][k]


def usd_px(asset, dt):
    return 1.0 if asset in ("USDT", "USD") else mark(asset + "-USDT", dt)


# ----------------------------------------------------------------- 答案登记
POS = []
DEC = []
SCEN = {}


def pos(sid, n, name, win, match, summary, evidence=None):
    POS.append({"id": "%s-%02d" % (sid, n), "scenario": sid, "name": name, "win": win, "match": match, "summary": summary, "evidence": evidence or {}})


def dec(sid, n, category, name, match, summary, count=None, evidence=None):
    DEC.append({"id": "%s-N%02d" % (sid, n), "mimics": sid, "category": category, "name": name, "match": match, "summary": summary, "count": count, "evidence": evidence or {}})


def L(f):
    """延迟求值（对象 id 在最后才分配）。"""
    return f


def resolve(v):
    while callable(v):
        v = v()
    if isinstance(v, dict):
        return {k: resolve(x) for k, x in v.items()}
    if isinstance(v, (list, tuple)):
        return [resolve(x) for x in v]
    return v


# ----------------------------------------------------------------- 交易流：订单与成交
SYMS = ["BTC-USDT", "ETH-USDT", "XYZ-USDT", "ABC-USDT"]
DP = {"BTC-USDT": 2, "ETH-USDT": 2, "XYZ-USDT": 4, "ABC-USDT": 4}
QDP = {"BTC-USDT": 6, "ETH-USDT": 4, "XYZ-USDT": 2, "ABC-USDT": 2}
QR = {"BTC-USDT": (0.002, 0.25), "ETH-USDT": (0.05, 4.0), "XYZ-USDT": (80, 4000), "ABC-USDT": (300, 15000)}
PER_DAY = {"BTC-USDT": 90, "ETH-USDT": 90, "XYZ-USDT": 50, "ABC-USDT": 40}
HW = [1, 1, 1, 1, 1, 1, 2, 3, 5, 6, 7, 7, 6, 6, 7, 8, 8, 7, 6, 5, 4, 3, 2, 1]
ORDERS = []
TRADES = []
POOL = []


def mk_order(acct, sym, side, price, qty, new_dt, cancel_dt=None, gw=None, reject=None, tag=None):
    o = {"acct": acct, "sym": sym, "side": side, "price": price, "qty": qty, "new_dt": new_dt, "cancel_dt": cancel_dt,
         "gw": gw or "gw-%d" % (1 + len(ORDERS) % 2), "reject": reject, "tag": tag, "trades": [], "oid": None, "idx": len(ORDERS)}
    ORDERS.append(o)
    return o


def mk_trade(sym, dt, price, qty, buy, sell, node=None, tag=None):
    t = {"sym": sym, "dt": dt, "price": price, "qty": qty, "buy": buy, "sell": sell, "node": node, "tag": tag, "mid": None,
         "idx": len(TRADES), "ledger": "ok", "late": 0, "rounding": 0, "dust": False}
    buy["trades"].append(t)
    sell["trades"].append(t)
    TRADES.append(t)
    return t


def quote_of(price, qty):
    return round(price * qty, 2)


def pair_trade(r, sym, dt, price, qty, buyer, seller, buy_mult=None, sell_mult=None, cancel_rest=True, node=None, tag=None, lead=None):
    """一笔成交与它的两张订单。订单量默认 72% 等于成交量，其余更大（剩余部分之后撤单或挂着）。"""
    dp, qd = DP[sym], QDP[sym]
    ld = lead if lead is not None else (r.uniform(0.3, 90), r.uniform(0.3, 90))
    bq = qty if (buy_mult is None and r.random() < 0.72) else round(qty * (buy_mult or r.uniform(1.3, 3.0)), qd)
    sq = qty if (sell_mult is None and r.random() < 0.72) else round(qty * (sell_mult or r.uniform(1.3, 3.0)), qd)
    bp = round(price * (1 + r.uniform(0, 0.0006)), dp)
    sp = round(price * (1 - r.uniform(0, 0.0006)), dp)
    bc = sc = None
    if bq > qty and cancel_rest and r.random() < 0.6:
        bc = dt + sec(r.uniform(5, 7200))
    if sq > qty and cancel_rest and r.random() < 0.6:
        sc = dt + sec(r.uniform(5, 7200))
    bo = mk_order(buyer, sym, "buy", bp, bq, dt - sec(ld[0]), bc)
    so = mk_order(seller, sym, "sell", sp, sq, dt - sec(ld[1]), sc)
    return mk_trade(sym, dt, price, qty, bo, so, node=node, tag=tag)


def rand_qty(r, sym):
    lo, hi = QR[sym]
    return round(lo * (hi / lo) ** (r.random() ** 1.8), QDP[sym])


def base_flow():
    r = rng("flow")
    for d in range(DAYS):
        wk = (START + timedelta(days=d)).weekday() >= 5
        f = 0.6 if wk else 1.0
        for sym in SYMS:
            n = int(PER_DAY[sym] * f * r.uniform(0.85, 1.15))
            for _ in range(n):
                h = r.choices(range(24), HW)[0]
                dt = at(d, h, r.randrange(60), r.randrange(60), r.randrange(1000))
                price = round(mark(sym, dt) * (1 + r.gauss(0, 0.0008)), DP[sym])
                b, s = r.sample(POOL, 2)
                pair_trade(r, sym, dt, price, rand_qty(r, sym), b, s)
    # 看起来可疑但正常：偏离标记价 6%–9% 的成交（仍在 10% 价格带内）
    r2 = rng("band_inside")
    NOISE["band_inside"] = []
    for _ in range(6):
        d = r2.choice([1, 2, 3, 5, 6, 8, 9, 12])
        sym = r2.choice(["XYZ-USDT", "ABC-USDT"])
        dt = at(d, r2.randint(9, 20), r2.randrange(60), r2.randrange(60), r2.randrange(1000))
        price = round(mark(sym, dt) * (1 + r2.choice([-1, 1]) * r2.uniform(0.06, 0.09)), DP[sym])
        b, s = r2.sample(POOL, 2)
        NOISE["band_inside"].append(pair_trade(r2, sym, dt, price, rand_qty(r2, sym), b, s))
    # 微额成交（手续费四舍五入后为 0）
    r3 = rng("dust")
    NOISE["dust"] = []
    for _ in range(25):
        d = r3.randrange(DAYS)
        dt = at(d, r3.randint(8, 21), r3.randrange(60), r3.randrange(60), r3.randrange(1000))
        price = round(mark("ABC-USDT", dt) * (1 + r3.gauss(0, 0.0008)), 4)
        qty = round(r3.uniform(2, 18), 2)
        b, s = r3.sample(POOL, 2)
        t = pair_trade(r3, "ABC-USDT", dt, price, qty, b, s, buy_mult=1.0, sell_mult=1.0)
        t["dust"] = quote_of(price, qty) < 10
        NOISE["dust"].append(t)
    # 部分成交的孪生成交：同一对订单、相同价格与数量，先后成交两次，累计不超量（合法）
    r4 = rng("twins")
    NOISE["twins"] = []
    for _ in range(12):
        d = r4.choice([0, 1, 2, 4, 5, 6, 7, 8, 9, 12, 13])
        sym = r4.choice(SYMS)
        dt = at(d, r4.randint(9, 20), r4.randrange(60), r4.randrange(60), r4.randrange(1000))
        price = round(mark(sym, dt) * (1 + r4.gauss(0, 0.0008)), DP[sym])
        q = rand_qty(r4, sym)
        b, s = r4.sample(POOL, 2)
        t1 = pair_trade(r4, sym, dt, price, q, b, s, buy_mult=2.0, sell_mult=2.0, cancel_rest=False)
        bo, so = t1["buy"], t1["sell"]
        bo["qty"] = round(q * 2, QDP[sym])
        so["qty"] = round(q * 2, QDP[sym])
        t2 = mk_trade(sym, dt + sec(r4.uniform(2, 25)), price, q, bo, so)
        NOISE["twins"].append((t1, t2))


NOISE = {}


def noise_orders():
    """没有成交的订单：下单后撤单或挂着；独立的拒绝事件。"""
    r = rng("orders")
    NOISE["price_band_reject"] = []
    NOISE["too_late"] = []
    for d in range(DAYS):
        f = 0.6 if (START + timedelta(days=d)).weekday() >= 5 else 1.0
        for _ in range(int(300 * f)):
            sym = r.choice(SYMS)
            h = r.choices(range(24), HW)[0]
            dt = at(d, h, r.randrange(60), r.randrange(60), r.randrange(1000))
            side = r.choice(["buy", "sell"])
            dev = r.uniform(0.002, 0.03)
            price = round(mark(sym, dt) * (1 - dev if side == "buy" else 1 + dev), DP[sym])
            cd = dt + sec(r.uniform(3, 900)) if r.random() < 0.75 else None
            mk_order(r.choice(POOL), sym, side, price, rand_qty(r, sym), dt, cd)
        for _ in range(6):  # 余额不足
            sym = r.choice(SYMS)
            dt = at(d, r.randrange(24), r.randrange(60), r.randrange(60), r.randrange(1000))
            mk_order(r.choice(POOL), sym, "buy", round(mark(sym, dt), DP[sym]), rand_qty(r, sym), dt, reject="insufficient_balance")
        for _ in range(3):
            sym = r.choice(SYMS)
            dt = at(d, r.randrange(24), r.randrange(60), r.randrange(60), r.randrange(1000))
            mk_order(r.choice(POOL), sym, "sell", round(mark(sym, dt), DP[sym]), rand_qty(r, sym), dt, reject="rate_limit")
        for _ in range(4):  # 价格带拒绝：引擎正确拦截
            sym = r.choice(SYMS)
            dt = at(d, r.randrange(24), r.randrange(60), r.randrange(60), r.randrange(1000))
            side = r.choice(["buy", "sell"])
            dev = r.uniform(0.12, 0.45)
            o = mk_order(r.choice(POOL), sym, side, round(mark(sym, dt) * (1 + dev if side == "buy" else 1 - dev), DP[sym]), rand_qty(r, sym), dt, reject="price_band")
            NOISE["price_band_reject"].append(o)
    full = [t for t in TRADES if t["buy"]["qty"] == t["qty"] and len(t["buy"]["trades"]) == 1 and t["tag"] is None]
    for t in r.sample(full, 40):  # 已成交后才来的撤单：正确拒绝
        o = t["buy"]
        NOISE["too_late"].append(mk_order(o["acct"], o["sym"], o["side"], o["price"], o["qty"], t["dt"] + sec(r.uniform(1, 45)), reject="too_late_to_cancel"))


# ----------------------------------------------------------------- S10：订单序号缺口与成交—分录不平（2026-03-04 10:00–11:30）
S10 = {}


def inject_s10():
    r = rng("s10")
    d = 3
    S10["btc_gap_trades"] = []
    for i, off in enumerate((20, 38, 61)):  # BTC：缺口窗口 10:20:00–10:21:30 内 3 笔成交
        dt = at(d, 10, 20, 5 + off % 50, 200 * (i + 1))
        px = round(mark("BTC-USDT", dt) * (1 + r.gauss(0, 0.0005)), 2)
        b, s = r.sample(POOL, 2)
        S10["btc_gap_trades"].append(pair_trade(r, "BTC-USDT", dt, px, round(r.uniform(0.3, 0.9), 6), b, s, buy_mult=1.0, sell_mult=1.0, lead=(2 + i, 3 + i)))
    specs = [("ETH-USDT", 10, 5, "missing"), ("BTC-USDT", 10, 12, "missing"), ("XYZ-USDT", 10, 33, "missing"), ("ETH-USDT", 10, 47, "missing"),
             ("ETH-USDT", 10, 58, "unbalanced_fee"), ("BTC-USDT", 11, 6, "unbalanced_base"), ("XYZ-USDT", 11, 14, "unbalanced_fee"),
             ("ETH-USDT", 11, 21, "valuation"), ("BTC-USDT", 11, 26, "valuation"),
             ("ETH-USDT", 10, 8, "ok"), ("BTC-USDT", 11, 2, "ok"), ("XYZ-USDT", 10, 52, "ok")]
    big = {"BTC-USDT": (0.6, 2.2), "ETH-USDT": (12, 40), "XYZ-USDT": (15000, 40000)}
    S10["ledger"] = {}
    for sym, h, m, kind in specs:
        dt = at(d, h, m, r.randrange(60), r.randrange(1000))
        px = round(mark(sym, dt) * (1 + r.gauss(0, 0.0005)), DP[sym])
        lo, hi = big[sym]
        b, s = r.sample(POOL, 2)
        t = pair_trade(r, sym, dt, px, round(r.uniform(lo, hi), QDP[sym]), b, s, buy_mult=1.0, sell_mult=1.0, tag="s10")
        t["ledger"] = kind
        S10["ledger"].setdefault(kind, []).append(t)
    # 序号冲突要用到的 ETH 事件在事件阶段处理
    NOISE["late"] = []
    NOISE["rounding"] = []


# ----------------------------------------------------------------- S11：异常价格、撤单 / 撤权后仍成交（2026-03-09）
S11 = {}


def inject_s11():
    r = rng("s11")
    d = 8
    mm = [a["account_id"] for a in C.accounts if a["risk_tag"] == "market_maker"]
    ab = r.sample(POOL, 3)
    S11["abn"] = []
    for i, (m, s_) in enumerate(((41, 12), (41, 40), (43, 5))):
        dt = at(d, 2, m, s_, 300)
        px = round(mark("XYZ-USDT", dt) * (1.36 + 0.025 * i), 4)
        S11["abn"].append(pair_trade(r, "XYZ-USDT", dt, px, round(r.uniform(9000, 15000), 2), ab[i], mm[i % len(mm)], buy_mult=1.0, sell_mult=1.0, tag="s11", lead=(5, 40)))
    # 撤单后仍成交：撤单确认在成交前 20–90 秒
    S11["cxl"] = []
    for i in range(5):
        dt = at(d, 16, 4 + i * 7, r.randrange(60), 400)
        px = round(mark("ETH-USDT", dt) * (1 + r.gauss(0, 0.0005)), 2)
        b, s = r.sample(POOL, 2)
        t = pair_trade(r, "ETH-USDT", dt, px, round(r.uniform(0.5, 3), 4), b, s, buy_mult=1.0, sell_mult=1.0, tag="s11", lead=(150, 150))
        t["buy"]["cancel_dt"] = dt - sec(r.uniform(20, 90))
        S11["cxl"].append(t)
    # 竞态：撤单与成交同一秒，成交在前（合法）
    NOISE["race"] = []
    for i in range(8):
        dd = r.choice([1, 2, 3, 4, 5, 6, 7, 9, 10])
        sym = r.choice(SYMS)
        dt = at(dd, r.randint(9, 20), r.randrange(60), r.randrange(60), 100)
        px = round(mark(sym, dt) * (1 + r.gauss(0, 0.0005)), DP[sym])
        b, s = r.sample(POOL, 2)
        q = rand_qty(r, sym)
        t = pair_trade(r, sym, dt, px, q, b, s, buy_mult=2.0, sell_mult=1.0, cancel_rest=False)
        t["buy"]["cancel_dt"] = dt + sec(0.5)
        NOISE["race"].append(t)


# ----------------------------------------------------------------- S12：过载与切主，脑裂窗口（2026-03-11 14:07:10–14:09:40）
S12 = {}
W0 = at(10, 14, 7, 10)
W1 = at(10, 14, 9, 40)
FAILOVER = at(5, 3, 0, 0)


def inject_s12():
    r = rng("s12")
    d = 10
    # 窗口前后的过载：额外成交（按规则由当班主节点处理）
    for _ in range(70):
        sym = r.choice(["ETH-USDT", "BTC-USDT"])
        dt = at(d, 14, 0, 0) + sec(r.uniform(0, 720))
        if W0 - sec(2) <= dt <= W1 + sec(2):
            dt = at(d, 14, 10, 0) + sec(r.uniform(0, 100))
        px = round(mark(sym, dt) * (1 + r.gauss(0, 0.0006)), 2)
        b, s = r.sample(POOL, 2)
        pair_trade(r, sym, dt, px, rand_qty(r, sym), b, s)
    S12["dups"] = []
    S12["stale"] = []
    S12["newonly"] = []
    people = POOL[:300]
    for i in range(16):
        sym = "ETH-USDT" if i % 2 == 0 else "BTC-USDT"
        dt = W0 + sec(r.uniform(3, 140))
        px = round(mark(sym, dt) * (1 + r.gauss(0, 0.0006)), 2)
        q = round(r.uniform(0.4, 2.5), 4) if sym == "ETH-USDT" else round(r.uniform(0.02, 0.12), 6)
        b, s = r.sample(people, 2)
        t1 = pair_trade(r, sym, dt, px, q, b, s, buy_mult=1.0, sell_mult=1.0, node="me-b", tag="s12", lead=(30, 30))
        t2 = mk_trade(sym, dt + sec(r.uniform(0.2, 2.5)), px, q, t1["buy"], t1["sell"], node="me-a", tag="s12")
        S12["dups"].append((t1, t2))
    for i in range(12):  # 只有旧主在写的成交
        sym = "ETH-USDT" if i % 2 else "BTC-USDT"
        dt = W0 + sec(r.uniform(3, 148))
        px = round(mark(sym, dt) * (1 + r.gauss(0, 0.0006)), 2)
        q = round(r.uniform(0.4, 2.5), 4) if sym == "ETH-USDT" else round(r.uniform(0.02, 0.12), 6)
        b, s = r.sample(POOL, 2)
        S12["stale"].append(pair_trade(r, sym, dt, px, q, b, s, node="me-b", tag="s12", lead=(20, 20)))
    for i in range(10):  # 只有新主在写的成交
        sym = "ETH-USDT" if i % 2 else "BTC-USDT"
        dt = W0 + sec(r.uniform(3, 148))
        px = round(mark(sym, dt) * (1 + r.gauss(0, 0.0006)), 2)
        q = round(r.uniform(0.4, 2.5), 4) if sym == "ETH-USDT" else round(r.uniform(0.02, 0.12), 6)
        b, s = r.sample(POOL, 2)
        S12["newonly"].append(pair_trade(r, sym, dt, px, q, b, s, node="me-a", tag="s12", lead=(20, 20)))
    NOISE["shed_rejects"] = []
    for _ in range(25):  # 过载期间的限流拒绝（正常）
        sym = r.choice(["ETH-USDT", "BTC-USDT"])
        dt = at(d, 14, 0, 0) + sec(r.uniform(0, 420))
        NOISE["shed_rejects"].append(mk_order(r.choice(POOL), sym, "buy", round(mark(sym, dt), DP[sym]), rand_qty(r, sym), dt, reject="overload_shed"))


def node_for(t):
    if t["node"]:
        return t["node"]
    if t["dt"] < FAILOVER:
        return "me-a"
    if t["dt"] < W0:
        return "me-b"
    return "me-a"


# ----------------------------------------------------------------- 撮合日志 / 订单事件 / 分录
MATCH_LOG = []
EVENTS = []
LINKS = []


def build_match_log():
    for i, t in enumerate(sorted(TRADES, key=lambda t: (t["dt"], t["idx"])), 1):
        t["mid"] = "MT%06d" % i
    ctl = []
    ctl.append((at(0), "role", "me-a", 1, "primary"))
    ctl.append((at(0), "role", "me-b", 1, "standby"))
    ctl.append((FAILOVER - sec(2), "role", "me-a", 2, "standby"))
    ctl.append((FAILOVER, "role", "me-b", 2, "primary"))
    ctl.append((W0, "role", "me-a", 3, "primary"))
    ctl.append((W1, "role", "me-b", 3, "standby"))
    state = {"me-a": ("primary", 1), "me-b": ("standby", 1)}
    cnt = {"me-a": 0, "me-b": 0}
    recs = []
    items = [(t["dt"], 1, t["idx"], "trade", t) for t in TRADES] + [(c[0], 0, k, "role", c) for k, c in enumerate(ctl)]
    for dt, _, _, kind, obj in sorted(items, key=lambda x: (x[0], x[1], x[2])):
        if kind == "role":
            _, _, node, epoch, role = obj
            if role == "primary" and epoch > 1:  # 晋升时接续上一任主节点的序号（正常切换）
                other = "me-b" if node == "me-a" else "me-a"
                cnt[node] = cnt[other]
            state[node] = (role, epoch)
            recs.append({"dt": dt, "node": node, "epoch": epoch, "role": role, "engine_seq": cnt[node], "event_type": "role_change"})
        else:
            t = obj
            node = node_for(t)
            cnt[node] += 1
            t["_node"] = node
            t["_epoch"] = state[node][1]
            recs.append({"dt": dt, "node": node, "epoch": state[node][1], "role": state[node][0], "engine_seq": cnt[node], "event_type": "trade", "t": t})
    # 心跳：每 30 分钟，主备各一条；窗口内再补一次，双方都自称主
    for tick in range(DAYS * 48):
        dt = at(0) + timedelta(minutes=30 * tick)
        for node in ("me-a", "me-b"):
            role, epoch = "standby", 1
            if node == "me-a":
                role, epoch = ("primary", 1) if dt < FAILOVER - sec(2) else (("standby", 2) if dt < W0 else ("primary", 3))
            else:
                role, epoch = ("standby", 1) if dt < FAILOVER else (("primary", 2) if dt < W1 else ("standby", 3))
            recs.append({"dt": dt + sec(1 if node == "me-b" else 0), "node": node, "epoch": epoch, "role": role, "engine_seq": None, "event_type": "heartbeat"})
    hb = at(10, 14, 8, 0)
    recs.append({"dt": hb, "node": "me-a", "epoch": 3, "role": "primary", "engine_seq": None, "event_type": "heartbeat"})
    recs.append({"dt": hb + sec(1), "node": "me-b", "epoch": 2, "role": "primary", "engine_seq": None, "event_type": "heartbeat"})
    # 过载限流事件（正常）
    r = rng("shed")
    for _ in range(30):
        d = r.randrange(DAYS)
        dt = at(d, r.randint(13, 16), r.randrange(60), r.randrange(60))
        node = "me-a" if dt < FAILOVER else ("me-b" if dt < W0 else "me-a")
        recs.append({"dt": dt, "node": node, "epoch": 1 if dt < FAILOVER else (2 if dt < W0 else 3), "role": "primary", "engine_seq": None, "event_type": "overload_shed", "shed": r.randint(5, 60)})
    for k in range(8):
        dt = at(10, 14, 0, 0) + sec(45 * k)
        recs.append({"dt": dt, "node": "me-b", "epoch": 2, "role": "primary", "engine_seq": None, "event_type": "overload_shed", "shed": r.randint(80, 220)})
    recs.sort(key=lambda x: (x["dt"], x["node"], x["event_type"]))
    last = {"me-a": 0, "me-b": 0}
    for i, x in enumerate(recs, 1):
        x["log_id"] = "ML%06d" % i
        if x["event_type"] != "trade":
            if x["event_type"] == "heartbeat":
                x["engine_seq"] = last[x["node"]]
        else:
            last[x["node"]] = x["engine_seq"]
        MATCH_LOG.append(x)


# ----------------------------------------------------------------- 订单事件
def build_events():
    ev = []
    for o in ORDERS:
        base = {"o": o, "sym": o["sym"]}
        if o["reject"]:
            ev.append(dict(base, dt=o["new_dt"], type="reject", price=o["price"], qty=o["qty"], filled=0, reason=o["reject"], prio=0, trade=None))
            continue
        ev.append(dict(base, dt=o["new_dt"], type="new", price=o["price"], qty=o["qty"], filled=0, reason=None, prio=0, trade=None))
        cum = 0.0
        qd = QDP[o["sym"]]
        for t in sorted(o["trades"], key=lambda t: (t["dt"], t["idx"])):
            cum = round(cum + t["qty"], qd)
            typ = "fill" if cum >= o["qty"] - 1e-9 else "partial_fill"
            ev.append(dict(base, dt=t["dt"] + timedelta(microseconds=1), type=typ, price=t["price"], qty=t["qty"], filled=cum, reason=None, prio=1, trade=t))
        if o["cancel_dt"] is not None:
            fb = round(sum(t["qty"] for t in o["trades"] if t["dt"] < o["cancel_dt"]), qd)
            ev.append(dict(base, dt=o["cancel_dt"], type="cancel", price=o["price"], qty=round(o["qty"] - fb, qd), filled=fb, reason=None, prio=2, trade=None))
    return ev


def finalize_events(ev):
    by = {}
    for i, e in enumerate(ev):
        e["i"] = i
        by.setdefault(e["sym"], []).append(e)
    # 公告的序号预留（正常）：每个品种若干处
    r = rng("seqskip")
    NOISE["skips"] = []
    for sym in SYMS:
        lst = sorted(by[sym], key=lambda e: (e["dt"], e["prio"], e["i"]))
        marks = {}
        for _ in range(2):
            marks[r.randrange(200, len(lst) - 200)] = r.randint(5, 50)
        c = 0
        out = []
        for k, e in enumerate(lst):
            if k in marks:
                c += 1
                sk = {"dt": e["dt"] - timedelta(microseconds=1), "sym": sym, "type": "seq_skip", "o": None, "price": None, "qty": None, "filled": None, "reason": "reserved_range",
                      "seq": c, "seq_to": c + marks[k], "prio": -1, "i": -1, "trade": None}
                out.append(sk)
                c += marks[k]
                NOISE["skips"].append((sym, c - marks[k] + 1, c))  # 被预留的缺失区间
            c += 1
            e["seq"] = c
            out.append(e)
        by[sym] = out
    allev = [e for sym in SYMS for e in by[sym]]
    allev.sort(key=lambda e: (e["dt"], e["sym"], e["seq"]))
    for k, e in enumerate(allev, 1):
        e["event_id"] = "OE%06d" % k
    return allev, by


def event_row(e):
    o = e["o"]
    return {"event_id": e["event_id"], "seq": e["seq"], "ts": iso(e["dt"]), "symbol": e["sym"], "event_type": e["type"],
            "order_id": o["oid"] if o else None, "account_id": o["acct"] if o else None, "side": o["side"] if o else None,
            "price": e["price"], "qty": e["qty"], "order_qty": o["qty"] if o else None, "filled_qty": e["filled"],
            "match_id": e["trade"]["mid"] if e.get("trade") else None, "reason": e["reason"], "source": o["gw"] if o else "seq-svc", "seq_to": e.get("seq_to")}


# ----------------------------------------------------------------- 分录
FEE_RATE = 0.0005


def build_links():
    r = rng("ledger")
    n = [0]
    NOISE["late_posting"] = []
    NOISE["rounding_cent"] = []
    NOISE["dust_nofee"] = []
    trades = sorted(TRADES, key=lambda t: (t["dt"], t["idx"]))
    pick_late = set(r.sample(range(len(trades)), int(len(trades) * 0.025)))
    pick_round = set(r.sample(range(len(trades)), int(len(trades) * 0.015)))
    rows = []
    for k, t in enumerate(trades):
        if t["ledger"] == "missing":
            continue
        sym = t["sym"]
        base, quote = sym.split("-")
        q = t["qty"]
        quote_qty = quote_of(t["price"], q)
        if t["ledger"] == "valuation":
            quote_qty = round(quote_qty * 10, 2)
        fee = round(quote_qty * FEE_RATE, 2)
        txn = "TXN-" + t["mid"]
        delay = r.uniform(0.5, 4.0)
        if k in pick_late and t["tag"] is None and t["ledger"] == "ok":
            delay = r.uniform(300, 1500)
            NOISE["late_posting"].append(t)
        ts = t["dt"] + sec(delay)
        buyer, seller = t["buy"]["acct"], t["sell"]["acct"]
        seller_credit = round(quote_qty - fee, 2)
        fee_credit = fee
        base_credit = q
        if t["ledger"] == "unbalanced_fee":
            seller_credit = quote_qty  # 多记了手续费部分
        if t["ledger"] == "unbalanced_base":
            base_credit = round(q * 0.95, QDP[sym])
        if k in pick_round and t["tag"] is None and t["ledger"] == "ok" and fee > 0.5:
            seller_credit = round(seller_credit + r.choice([-0.01, 0.01]), 2)
            NOISE["rounding_cent"].append(t)
        legs = [(buyer, quote, "debit", quote_qty, quote_qty, "quote"), (seller, quote, "credit", seller_credit, seller_credit, "quote")]
        if t["dust"]:
            legs[1] = (seller, quote, "credit", quote_qty, quote_qty, "quote")
            NOISE["dust_nofee"].append(t)
        else:
            legs.append(("FEE-POOL", quote, "credit", fee_credit, fee_credit, "fee"))
        bu = round(q * t["price"], 2)
        legs.append((seller, base, "debit", q, bu, "base"))
        legs.append((buyer, base, "credit", base_credit, round(base_credit * t["price"], 2), "base"))
        for a, asset, d, amt, usd, leg in legs:
            rows.append({"dt": ts, "trade_id": t["mid"], "txn_id": txn, "account_id": a, "asset": asset, "direction": d, "amount": amt, "amount_usd": usd, "leg": leg, "symbol": sym})
    rows.sort(key=lambda x: (x["dt"], x["trade_id"]))
    for i, x in enumerate(rows, 1):
        x["link_id"] = "LK%06d" % i
        LINKS.append(x)


# ----------------------------------------------------------------- S13：保证金、强平、穿仓、保险基金
PERP = {"BTC-PERP": ("BTC-USDT", 0.02), "ETH-PERP": ("ETH-USDT", 0.02), "XYZ-PERP": ("XYZ-USDT", 0.04), "ABC-PERP": ("ABC-USDT", 0.05), "QRS-PERP": (None, 0.03)}
POSITIONS = []
LIQS = []
S13 = {}
QRS_BASE = []
CRASH0 = at(11, 9, 15)
CRASH1 = at(11, 9, 40)
FUND0 = 120000.0


def init_qrs():
    r = rng("qrs")
    p = 12.0
    for _ in range(DAYS * 24 + 2):
        QRS_BASE.append(p)
        p *= math.exp(r.gauss(0, 0.004))


def pmark(sym, dt):
    spot, _ = PERP[sym]
    if spot:
        return mark(spot, dt)
    x = (dt - START).total_seconds() / 3600.0
    i = max(0, min(len(QRS_BASE) - 2, int(x)))
    b = QRS_BASE[i] + (QRS_BASE[i + 1] - QRS_BASE[i]) * (x - i)
    if dt < CRASH0:
        f = 1.0
    elif dt < CRASH1:
        f = 1 - 0.30 * (dt - CRASH0).total_seconds() / (CRASH1 - CRASH0).total_seconds()
    elif dt < at(11, 12):
        f = 0.70
    elif dt < at(12):
        f = 0.70 + 0.15 * (dt - at(11, 12)).total_seconds() / (at(12) - at(11, 12)).total_seconds()
    else:
        f = 0.85
    return round(b * f, 4)


def equity(side, qty, entry, margin, mk):
    return margin + ((mk - entry) if side == "long" else (entry - mk)) * qty


def pos_row(dt, pid, acct, sym, side, qty, entry, margin, lev):
    mk = pmark(sym, dt)
    eq = equity(side, qty, entry, margin, mk)
    notional = qty * mk
    return {"dt": dt, "account_id": acct, "position_id": pid, "symbol": sym, "side": side, "qty": qty, "entry_price": entry, "mark_price": mk, "leverage": lev,
            "margin": round(margin, 2), "notional": round(notional, 2), "equity": round(eq, 2), "margin_ratio": round(eq / notional, 6), "mmr": PERP[sym][1]}


def gen_derivs(margin_accts):
    r = rng("derivs")
    NOISE["topup"] = []
    pn = [0]
    cands = []
    end = at(DAYS - 1, 23, 0)
    for acct in margin_accts[:-10]:
        cur = at(0) + sec(r.uniform(0, 36 * 3600))
        while cur < end - timedelta(hours=6):
            sym = r.choice(["BTC-PERP", "ETH-PERP", "XYZ-PERP", "ABC-PERP"])
            side = r.choice(["long", "short"])
            hi = r.random() < 0.28
            lev = r.choice([15, 18, 20]) if hi else r.choice([3, 5, 8, 10])
            op = cur.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
            notional = round(math.exp(r.uniform(math.log(5000), math.log(120000))), 2)
            entry = pmark(sym, op)
            qty = round(notional / entry, 4 if "BTC" not in sym else 6)
            margin = qty * entry / lev
            pn[0] += 1
            pid = "PS%05d" % pn[0]
            mmr = PERP[sym][1]
            dur = r.randint(4, 60) if not hi else r.randint(24, 72)
            rows = []
            liq = None
            step = op
            k = 0
            while step < min(op + timedelta(hours=dur), end):
                mk = pmark(sym, step)
                eq = equity(side, qty, entry, margin, mk)
                ratio = eq / (qty * mk)
                if step.minute == 0 and step.second == 0:
                    if not hi and ratio < 1.5 * mmr:
                        need = 3 * mmr * qty * mk - eq
                        margin += need
                        NOISE["topup"].append(pid)
                    rows.append(pos_row(step, pid, acct, sym, side, qty, entry, margin, lev))
                if ratio <= mmr and (hi or ratio <= mmr):
                    liq = step
                    break
                step += timedelta(minutes=5)
                k += 1
            POSITIONS.extend(rows)
            if liq is not None:
                cands.append({"pid": pid, "acct": acct, "sym": sym, "side": side, "qty": qty, "entry": entry, "margin": margin, "trigger": liq, "lev": lev})
                cur = liq + timedelta(hours=r.uniform(1, 24))
            else:
                cur = step + timedelta(hours=r.uniform(1, 24))
            S13["last_pid"] = pn[0]
    # 慢速强平（高峰期 30–50 秒，仍在 60 秒 SLA 内）、价格跳空穿仓（延迟正常）、微额穿仓
    cands.sort(key=lambda c: c["trigger"])
    for c in cands:
        c["delay"] = r.uniform(1, 8)
        c["slip"] = r.uniform(0.0005, 0.003)
        c["kind"] = "normal"
    slow = [c for c in cands if (c["trigger"] - START).days in (5, 9)][:6]
    for c in slow:
        c["delay"] = r.uniform(31, 48)
        c["kind"] = "slow_peak"
    gap = [c for c in cands if (c["trigger"] - START).days == 4 and c["kind"] == "normal"][:2]
    for c in gap:
        c["kind"] = "gap"
    others = [c for c in cands if c["kind"] == "normal"]
    dust = r.sample(others, 3)
    for c in dust:
        c["kind"] = "dust"
    S13["cands"] = cands
    # 事故：QRS-PERP 暴跌，强平引擎积压
    inc = [("ST", 25, 280000, 300), ("ST", 24, 340000, 420), ("ST", 22, 410000, 540), ("ST", 22, 300000, 660), ("ST", 20, 260000, 240),
           ("ST", 20, 220000, 360), ("ST", 18, 380000, 480), ("ST", 18, 200000, 600), ("ST", 12, 150000, 75), ("ST", 12, 180000, 70)]
    accts = margin_accts[-10:]
    S13["inc"] = []
    for k, (_, lev, notional, delay) in enumerate(inc):
        acct = accts[k]
        opn = at(11, 5 + k % 3, 0)
        entry = round(pmark("QRS-PERP", opn) * 0.985, 4)
        qty = round(notional / entry, 2)
        margin = qty * entry / lev
        pn[0] += 1
        pid = "PS%05d" % pn[0]
        t = opn
        while t <= at(11, 9, 0):
            if t.minute == 0:
                POSITIONS.append(pos_row(t, pid, acct, "QRS-PERP", "long", qty, entry, margin, lev))
            t += timedelta(hours=1)
        trig = None
        t = CRASH0
        while t < CRASH1 + timedelta(hours=1):
            mk = pmark("QRS-PERP", t)
            if equity("long", qty, entry, margin, mk) / (qty * mk) <= PERP["QRS-PERP"][1]:
                trig = t
                break
            t += timedelta(minutes=1)
        S13["inc"].append({"pid": pid, "acct": acct, "sym": "QRS-PERP", "side": "long", "qty": qty, "entry": entry, "margin": margin, "trigger": trig, "delay": delay, "slip": 0.004, "kind": "incident", "lev": lev})
    # 生成强平行
    allc = S13["cands"] + S13["inc"]
    allc.sort(key=lambda c: c["trigger"] + sec(c["delay"]))
    fund = FUND0
    ln = 0
    for c in allc:
        side, qty, entry, margin = c["side"], c["qty"], c["entry"], c["margin"]
        ex_ts = c["trigger"] + timedelta(seconds=int(c["delay"]))
        mk_t = pmark(c["sym"], c["trigger"])
        mk_e = pmark(c["sym"], ex_ts)
        slip = c["slip"]
        px = mk_e * (1 - slip) if side == "long" else mk_e * (1 + slip)
        px = round(px, 4)
        if c["kind"] in ("gap", "dust"):
            notional = qty * mk_e
            tgt = -min(r.uniform(2500, 4500), 0.08 * notional) if c["kind"] == "gap" else -r.uniform(0.5, 4.0)
            pnl = tgt - margin
            px = round(entry + pnl / qty if side == "long" else entry - pnl / qty, 4)
        eq = equity(side, qty, entry, margin, px)
        if c["kind"] in ("gap", "dust") and eq >= 0:  # 四舍五入后仍应为负
            px = round(px + (-0.0001 if side == "long" else 0.0001), 4)
            eq = equity(side, qty, entry, margin, px)
        shortfall = round(max(0.0, -eq), 2)
        before = fund
        unfunded = 0.0
        if shortfall > 0:
            pay = min(shortfall, fund)
            delta = -pay
            unfunded = round(shortfall - pay, 2)
        else:
            delta = round(min(eq, 0.005 * qty * px), 2)
        fund = round(fund + delta, 2)
        ln += 1
        c["row"] = {"dt": ex_ts, "trigger_dt": c["trigger"], "account_id": c["acct"], "position_id": c["pid"], "symbol": c["sym"], "side": side, "qty": qty, "entry_price": entry,
                    "margin": round(margin, 2), "trigger_mark": mk_t, "exec_price": px, "equity_at_exec": round(eq, 2), "shortfall": shortfall, "fund_delta": delta,
                    "fund_before": before, "fund_after": fund, "unfunded_loss": unfunded, "adl": 1 if unfunded > 0 else 0, "delay_s": int(c["delay"]), "kind": c["kind"]}
        LIQS.append(c["row"])
    for x in LIQS:
        if x["kind"] == "normal" and x["shortfall"] > 0:  # 自然产生的小额穿仓（价格跳空）
            x["kind"] = "gap"
    LIQS.sort(key=lambda x: (x["dt"], x["position_id"]))
    for i, x in enumerate(LIQS, 1):
        x["liq_id"] = "LQ%05d" % i
    POSITIONS.sort(key=lambda x: (x["dt"], x["position_id"]))


# ----------------------------------------------------------------- 案件与处置（S11 撤权、S15 复市）
CASES = []
ACTS = []
S15 = {}


def mk_case(dt, acct, typ, source="rule", severity="medium", owner=None):
    c = {"dt": dt, "acct": acct, "type": typ, "source": source, "severity": severity, "owner": owner, "closed": None, "id": None}
    CASES.append(c)
    return c


def mk_act(case, dt, action, scope, actor, authorizer, ref=None, report="applied", rdelay=None, retry_of=None, r=None, tag=None):
    rt = None
    if report is not None:
        rt = dt + sec(rdelay if rdelay is not None else (r.uniform(2, 180) if r else 30))
    a = {"case": case, "dt": dt, "action": action, "scope": scope, "actor": actor, "authorizer": authorizer, "authority_ref": ref, "report_status": report, "report_dt": rt,
         "retry_of": retry_of, "tag": tag, "id": None}
    ACTS.append(a)
    return a


def base_cases():
    r = rng("cases")
    sup, sec_, comp = C.staff["support"], C.staff["security"], C.staff["compliance"]
    NOISE["retry"] = []
    NOISE["slow_report"] = []
    NOISE["auto"] = []
    NOISE["legal_ok"] = []
    types = ["fraud_suspected"] * 40 + ["ato"] * 15 + ["aml"] * 15 + ["sanction"] * 5 + ["legal_order"] * 6 + ["market_abuse"] * 6 + ["kyc_review"] * 20
    end = at(DAYS, 0)
    for i in range(190):
        typ = r.choice(types)
        d = r.randrange(0, 13)
        dt = at(d, r.randint(0, 23), r.randrange(60), r.randrange(60))
        acct = r.choice(POOL)
        c = mk_case(dt, acct, typ, severity=r.choice(["low", "medium", "high"]))
        t0 = dt + sec(r.uniform(120, 2400))
        if typ == "fraud_suspected":
            a = mk_act(c, t0, "restrict", "withdraw", r.choice(sup), r.choice(sec_), r=r)
            rel = t0 + timedelta(hours=r.uniform(6, 72))
            if r.random() < 0.85 and rel < end - timedelta(hours=1):
                mk_act(c, rel, "release", "withdraw", r.choice(sup), r.choice(sec_), r=r)
                c["closed"] = rel + sec(60)
        elif typ == "ato":
            a = mk_act(c, t0, "restrict", "all", r.choice(sec_), r.choice(comp), r=r)
            rel = t0 + timedelta(hours=r.uniform(24, 120))
            if r.random() < 0.8 and rel < end - timedelta(hours=1):
                mk_act(c, rel, "release", "all", r.choice(sec_), r.choice(comp), r=r)
                c["closed"] = rel + sec(60)
        elif typ == "aml":
            ac, au = r.sample(comp, 2)
            a = mk_act(c, t0, "restrict", "withdraw", ac, au, r=r)
            rel = t0 + timedelta(hours=r.uniform(72, 240))
            if r.random() < 0.6 and rel < end - timedelta(hours=1):
                mk_act(c, rel, "release", "withdraw", au, ac, r=r)
                c["closed"] = rel + sec(60)
        elif typ == "sanction":
            ac, au = r.sample(comp, 2)
            a = mk_act(c, t0, "legal_freeze", "all", ac, au, ref="SAN-2026-%04d" % r.randint(1, 999), r=r)
        elif typ == "legal_order":
            ac, au = r.sample(comp, 2)
            ref = "LO-2026-%04d" % r.randint(100, 999)
            a = mk_act(c, t0, "legal_freeze", "all", ac, au, ref=ref, r=r)
            rel = t0 + timedelta(hours=r.uniform(120, 240))
            if r.random() < 0.5 and rel < end - timedelta(hours=1):
                rr = mk_act(c, rel, "legal_unfreeze", "all", ac, au, ref=ref + "-R", r=r)
                c["closed"] = rel + sec(60)
                NOISE["legal_ok"].append(rr)
        elif typ == "market_abuse":
            ac, au = r.sample(sec_, 2)
            a = mk_act(c, t0, "restrict", "trade", ac, au, r=r)
            rel = t0 + timedelta(hours=r.uniform(24, 72))
            if rel < end - timedelta(hours=1):
                mk_act(c, rel, "release", "trade", au, ac, r=r)
                c["closed"] = rel + sec(60)
        else:  # kyc_review：系统自动限制 24 小时后自动解除（授权来自策略）
            a = mk_act(c, t0, "restrict", "withdraw", "system:risk-engine", "policy:R-KYC-HOLD", r=r)
            rel = t0 + timedelta(hours=24)
            ra = None
            if rel < end - timedelta(hours=1):
                ra = mk_act(c, rel, "release", "withdraw", "system:auto-expire", "policy:R-KYC-HOLD", r=r)
                c["closed"] = rel + sec(60)
            NOISE["auto"].append(a)
            if ra:
                NOISE["auto"].append(ra)
        # 噪声：回报失败后重试；回报偏慢
        x = r.random()
        if x < 0.04 and a["action"] in ("restrict",):
            a["report_status"] = "failed"
            a["report_dt"] = a["dt"] + sec(r.uniform(5, 90))
            rt = mk_act(c, a["dt"] + sec(r.uniform(300, 1500)), "restrict", a["scope"], a["actor"], a["authorizer"], retry_of=a, r=r)
            NOISE["retry"].extend([a, rt])
        elif x < 0.09:
            a["report_dt"] = a["dt"] + sec(r.uniform(240, 1500))
            NOISE["slow_report"].append(a)


def s11_cases():
    """撤权与限制的订单侧场景（2026-03-09）。"""
    r = rng("s11cases")
    sup, sec_ = C.staff["support"], C.staff["security"]
    d = 8
    others = [a for a in POOL[100:200]]
    NOISE["wd_only_trading"] = []
    NOISE["restricted_rejected"] = []
    NOISE["released_trading"] = []
    # 1) 只限制提币的账户继续交易（正常）
    for a in others[:4]:
        c = mk_case(at(d, 9, 50), a, "fraud_suspected")
        mk_act(c, at(d, 10, 0, r.randrange(60)), "restrict", "withdraw", r.choice(sup), r.choice(sec_), r=r)
        for k in range(3):
            dt = at(d, 13 + k, r.randrange(60), r.randrange(60))
            sym = r.choice(SYMS)
            o = mk_order(a, sym, "buy", round(mark(sym, dt) * 0.99, DP[sym]), rand_qty(r, sym), dt, dt + sec(r.uniform(30, 600)))
            NOISE["wd_only_trading"].append(o)
    # 2) 限制交易后订单被正确拒绝
    for a in others[4:7]:
        c = mk_case(at(d, 11, 50), a, "market_abuse")
        ac, au = r.sample(sec_, 2)
        mk_act(c, at(d, 12, 0, r.randrange(60)), "restrict", "trade", ac, au, r=r)
        for k in range(3):
            dt = at(d, 12, 10 + 5 * k, r.randrange(60))
            sym = r.choice(SYMS)
            o = mk_order(a, sym, "sell", round(mark(sym, dt) * 1.01, DP[sym]), rand_qty(r, sym), dt, reject="account_restricted")
            o["keep"] = True
            NOISE["restricted_rejected"].append(o)
    # 3) 限制后又解除，之后正常交易
    for a in others[7:10]:
        c = mk_case(at(d, 8, 50), a, "market_abuse")
        ac, au = r.sample(sec_, 2)
        mk_act(c, at(d, 9, 0, r.randrange(60)), "restrict", "trade", ac, au, r=r)
        rl = mk_act(c, at(d, 11, 0, r.randrange(60)), "release", "trade", au, ac, r=r)
        c["closed"] = at(d, 11, 1)
        for k in range(3):
            dt = at(d, 12 + k, r.randrange(60), r.randrange(60))
            sym = r.choice(SYMS)
            NOISE["released_trading"].append(mk_order(a, sym, "buy", round(mark(sym, dt) * 0.99, DP[sym]), rand_qty(r, sym), dt, dt + sec(r.uniform(30, 600))))
    # 4) 撤权后仍被受理的订单（正例）
    z = POOL[210]
    c = mk_case(at(d, 15, 20), z, "market_abuse", severity="high")
    ac, au = r.sample(sec_, 2)
    S11["revoke_act"] = mk_act(c, at(d, 15, 30, 0), "revoke_trade", "trade", ac, au, rdelay=41)
    S11["z"] = z
    S11["rejects"] = []
    for k in range(3):  # 起初被拒绝
        dt = at(d, 15, 30, 50 + 7 * k)
        o = mk_order(z, "BTC-USDT", "buy", round(mark("BTC-USDT", dt) * 0.995, 2), 0.05, dt, reject="account_restricted")
        o["keep"] = True
        S11["rejects"].append(o)
    S11["post"] = []
    for k, (m, s_) in enumerate(((33, 10), (38, 5), (41, 20), (47, 40), (52, 10), (58, 30))):
        dt = at(d, 15, m, s_)
        if k in (2, 4):
            px = round(mark("BTC-USDT", dt) * (1 + r.gauss(0, 0.0004)), 2)
            cp = r.choice([a for a in POOL[:100]])
            t = pair_trade(r, "BTC-USDT", dt, px, round(r.uniform(0.05, 0.2), 6), z, cp, buy_mult=1.0, sell_mult=1.0, tag="s11", lead=(20, 20))
            S11["post"].append(t["buy"])
        else:
            S11["post"].append(mk_order(z, "BTC-USDT", "buy", round(mark("BTC-USDT", dt) * 0.99, 2), round(r.uniform(0.05, 0.2), 6), dt, dt + sec(r.uniform(60, 900))))
    for o in S11["post"]:
        o["keep"] = True


def s15_cases():
    r = rng("s15")
    sup, sec_, comp = C.staff["support"], C.staff["security"], C.staff["compliance"]
    S15["pos"] = {}
    # 受限账户：S12 重复成交的参与者 + S13 穿仓账户（共 40 个）；另 3 个“限制未落地”的账户
    s12acc = sorted({t1["buy"]["acct"] for t1, _ in S12["dups"]} | {t1["sell"]["acct"] for t1, _ in S12["dups"]})
    s13acc = sorted({c["acct"] for c in S13["inc"][:8]})
    inc = sorted(set(s12acc + s13acc))
    for a in POOL[260:300]:
        if len(inc) >= 40:
            break
        if a not in inc:
            inc.append(a)
    inc = inc[:40]
    failed = [a for a in POOL[220:240] if a not in inc][:3]
    cases = {}
    for a in inc:
        t = at(10, 14, 40) + sec(r.uniform(0, 900)) if a in s12acc else at(11, 10, 30) + sec(r.uniform(0, 900))
        c = mk_case(t, a, "incident_review", severity="high", source="ticket")
        ac, au = r.choice(sup), r.choice(comp)
        mk_act(c, t + sec(r.uniform(60, 300)), "restrict", "all", ac, au, r=r)
        cases[a] = c
    fcases = {}
    S15["failed_acts"] = []
    for a in failed:
        t = at(10, 15, 10) + sec(r.uniform(0, 600))
        c = mk_case(t, a, "incident_review", severity="high", source="ticket")
        act = mk_act(c, t + sec(90), "restrict", "all", r.choice(sup), r.choice(comp), report="failed", rdelay=20)
        S15["failed_acts"].append(act)
        fcases[a] = c
        for k in range(3):  # 限制未落地，账户继续下单
            dt = at(10, 16, 20 + 25 * k, r.randrange(60))
            sym = r.choice(["ETH-USDT", "BTC-USDT"])
            mk_order(a, sym, "buy", round(mark(sym, dt) * 0.99, 2), rand_qty(r, sym), dt, dt + sec(r.uniform(60, 600)), tag="s15")["keep"] = True
    # 解除限制（复市日 2026-03-13 09:00–11:40）
    order = list(inc)
    r.shuffle(order)
    cats = ["noauth"] * 5 + ["self"] * 2 + ["noreport"] * 4 + ["ok"] * (len(order) - 11)
    S15["noauth"], S15["self"], S15["noreport"], S15["ok"] = [], [], [], []
    for k, (a, cat) in enumerate(zip(order, cats)):
        t = at(12, 9, 0) + sec(150 * k + r.uniform(0, 60))
        c = cases[a]
        ac, au = r.choice(sup), r.choice(comp)
        if cat == "noauth":
            act = mk_act(c, t, "release", "all", ac, None, r=r)
        elif cat == "self":
            act = mk_act(c, t, "release", "all", ac, ac, r=r)
        elif cat == "noreport":
            act = mk_act(c, t, "release", "all", ac, au, report=None)
        else:
            act = mk_act(c, t, "release", "all", ac, au, r=r)
        S15[cat].append(act)
        c["closed"] = t + sec(120)
    # 法定冻结被无依据解除
    a = POOL[250]
    c = mk_case(at(2, 11, 0), a, "legal_order", source="agency")
    ac, au = r.sample(comp, 2)
    mk_act(c, at(2, 11, 20), "legal_freeze", "all", ac, au, ref="LO-2026-0417", r=r)
    S15["legal_bad"] = mk_act(c, at(11, 18, 20), "legal_unfreeze", "all", sup[0], sec_[0], ref=None, r=r)
    c["closed"] = at(11, 18, 21)
    S15["legal_acct"] = a
    S15["inc"] = inc
    S15["failed"] = failed


def reassign_restricted():
    """基础交易流不模拟限制：把受限期内的普通订单换成别的账户（账户只是标签），保证“受限账户仍在交易”只出现在注入的场景里。"""
    r = rng("reassign")
    end = at(DAYS)
    iv = {}
    for c in CASES:
        start = None
        for a in sorted([a for a in ACTS if a["case"] is c], key=lambda a: a["dt"]):
            if a["scope"] not in ("trade", "all"):
                continue
            if a["action"] in ("restrict", "revoke_trade", "legal_freeze") and start is None:
                start = a["dt"]
            elif a["action"] in ("release", "legal_unfreeze") and start is not None:
                iv.setdefault(c["acct"], []).append((start, a["dt"]))
                start = None
        if start is not None:
            iv.setdefault(c["acct"], []).append((start, end))

    def restricted(acct, dt):
        return any(s <= dt < e for s, e in iv.get(acct, []))
    n = 0
    for o in ORDERS:
        if o.get("keep") or not restricted(o["acct"], o["new_dt"]):
            continue
        banned = {t["buy"]["acct"] for t in o["trades"]} | {t["sell"]["acct"] for t in o["trades"]}
        while True:
            a = r.choice(POOL)
            if a != o["acct"] and a not in banned and not restricted(a, o["new_dt"]):
                break
        o["acct"] = a
        n += 1
    return n


def finalize_cases():
    CASES.sort(key=lambda c: (c["dt"], c["acct"], c["type"]))
    for i, c in enumerate(CASES, 1):
        c["id"] = "CS%05d" % i
    ACTS.sort(key=lambda a: (a["dt"], a["case"]["id"], a["action"]))
    for i, a in enumerate(ACTS, 1):
        a["id"] = "CT%05d" % i


# ----------------------------------------------------------------- 资金侧：提币 / 充值状态机、链上流水、银行流水、钱包、储备
PEND = []
ONCHAIN = []
BANK = []
FUNDS = {}
REQ_CONF = {"BTC": 3, "ETH": 12, "TRON": 20}
BKS = ["BK-OPS-1", "BK-OPS-2"]
BANK_OWN = {"BK-OPS-1": "ACCT-0A11F2", "BK-OPS-2": "ACCT-0B22C7"}
inum = [0]


def next_item(kind, rail):
    inum[0] += 1
    return "%s%06d" % ("PW" if kind == "withdrawal" else "PD", inum[0])


def pe(dt, item, kind, rail, etype, acct, asset, chain, amount, ref=None, receipt=None, conf=None, actor=None, approval=None):
    PEND.append({"dt": dt, "item_id": item, "kind": kind, "rail": rail, "event_type": etype, "account_id": acct, "asset": asset, "chain": chain, "amount": amount, "ref": ref,
                 "receipt_id": receipt, "confirmations": conf, "required": REQ_CONF.get(chain) if rail == "chain" else None, "actor": actor, "approval_id": approval})


def oc(dt, h, chain, asset, frm, to, ftier, ttier, amt, direction, conf=None):
    ONCHAIN.append({"dt": dt, "tx_hash": h, "chain": chain, "asset": asset, "from_addr": frm, "to_addr": to, "from_tier": ftier, "to_tier": ttier, "amount": amt,
                    "status": "confirmed", "confirmations": conf if conf is not None else REQ_CONF[chain] + 5, "direction": direction})


def pick_asset(r):
    x = r.random()
    if x < 0.5:
        return "USDT", "ETH"
    if x < 0.7:
        return "USDT", "TRON"
    if x < 0.85:
        return "ETH", "ETH"
    return "BTC", "BTC"


def amt_for(r, asset, dt):
    usd = math.exp(r.uniform(math.log(60), math.log(40000)))
    a = usd / usd_px(asset, dt)
    return round(a, {"USDT": 2, "ETH": 4, "BTC": 6}[asset])


def next_bday(dt, n=1):
    d = dt
    while n > 0:
        d += timedelta(days=1)
        if d.weekday() < 5:
            n -= 1
    return d


def bank_line(dt, acct, channel, direction, amount, cp, ref, status="settled"):
    BANK.append({"dt": dt, "bank_account": acct, "channel": channel, "direction": direction, "amount": round(amount, 2), "counterparty_account": cp, "ref": ref, "status": status})


def gen_funds():
    r = rng("funds")
    NOISE["f_timeout"] = []
    NOISE["f_dupconf"] = []
    NOISE["f_reorg"] = []
    NOISE["f_cancel"] = []
    NOISE["f_open_end"] = []
    NOISE["f_weekend"] = []
    NOISE["f_fee_mismatch"] = []
    NOISE["f_bank_return"] = []
    NOISE["f_pending_line"] = []
    NOISE["f_dust_in"] = []
    NOISE["f_fee_line"] = []
    NOISE["f_sweep"] = []
    NOISE["f_interest"] = []
    approvers = "ST031,ST032"
    brn = [0]

    def cp_for(a):
        return "ACCT-" + H("cp:" + a)[:6].upper()

    # --- 链上提币（~25/天）
    for d in range(DAYS):
        n = 25 if (START + timedelta(days=d)).weekday() < 5 else 14
        for _ in range(n):
            asset, chain = pick_asset(r)
            t0 = at(d, r.choices(range(24), HW)[0], r.randrange(60), r.randrange(60))
            if t0 > at(DAYS, 0) - timedelta(hours=3):
                continue
            acct = r.choice(POOL)
            amount = amt_for(r, asset, t0)
            item = next_item("withdrawal", "chain")
            ap = "AP-" + item
            t = t0
            pe(t, item, "withdrawal", "chain", "reserve", acct, asset, chain, amount, actor="svc-wd")
            x = r.random()
            if x < 0.02:
                pe(t + sec(r.uniform(60, 900)), item, "withdrawal", "chain", "approve", acct, asset, chain, amount, actor=approvers.split(",")[0], approval=ap)
                pe(t + sec(r.uniform(1000, 2000)), item, "withdrawal", "chain", "release", acct, asset, chain, amount, actor="svc-wd")
                NOISE["f_cancel"].append(item)
                continue
            t += sec(r.uniform(30, 900))
            pe(t, item, "withdrawal", "chain", "approve", acct, asset, chain, amount, actor=r.choice(approvers.split(",")), approval=ap)
            t += sec(r.uniform(3, 90))
            pe(t, item, "withdrawal", "chain", "sign", acct, asset, chain, amount, actor="svc-sign")
            t += sec(r.uniform(2, 40))
            h = txh("w:" + item)
            pe(t, item, "withdrawal", "chain", "broadcast", acct, asset, chain, amount, ref=h, actor="svc-chain")
            to = addr("ext:" + acct)
            lo, hi = {"BTC": (20, 50), "ETH": (3, 5), "TRON": (1, 3)}[chain]
            if r.random() < 0.04:  # 超时 -> 重广播（正常）
                pe(t + timedelta(minutes=30), item, "withdrawal", "chain", "timeout", acct, asset, chain, amount, ref=h, actor="svc-chain")
                t += timedelta(minutes=31)
                h = txh("w2:" + item)
                pe(t, item, "withdrawal", "chain", "rebroadcast", acct, asset, chain, amount, ref=h, actor="svc-chain")
                NOISE["f_timeout"].append(item)
                oc(t + sec(r.uniform(30, 120)), h, chain, asset, wallet("hot", chain, asset), to, "hot", "external", amount, "out")
            else:
                oc(t + sec(r.uniform(5, 60)), h, chain, asset, wallet("hot", chain, asset), to, "hot", "external", amount, "out")
            t += timedelta(minutes=r.uniform(lo, hi))
            rc = "RC-" + h[2:14]
            pe(t, item, "withdrawal", "chain", "confirm", acct, asset, chain, amount, ref=h, receipt=rc, conf=REQ_CONF[chain] + r.randint(0, 3), actor="svc-chain")
            if r.random() < 0.03:  # 回执重复，只记一次账（正常）
                pe(t + sec(r.uniform(20, 120)), item, "withdrawal", "chain", "confirm", acct, asset, chain, amount, ref=h, receipt=rc, conf=REQ_CONF[chain] + 4, actor="svc-chain")
                NOISE["f_dupconf"].append(item)
            pe(t + sec(r.uniform(2, 90)), item, "withdrawal", "chain", "book", acct, asset, chain, amount, ref=h, actor="svc-ledger")
    # --- 链上充值（~25/天）
    for d in range(DAYS):
        n = 25 if (START + timedelta(days=d)).weekday() < 5 else 14
        for _ in range(n):
            asset, chain = pick_asset(r)
            t0 = at(d, r.choices(range(24), HW)[0], r.randrange(60), r.randrange(60))
            if t0 > at(DAYS, 0) - timedelta(hours=3):
                continue
            acct = r.choice(POOL)
            amount = amt_for(r, asset, t0)
            item = next_item("deposit", "chain")
            h = txh("d:" + item)
            frm = addr("depsrc:" + acct)
            hot = wallet("hot", chain, asset)
            t = t0
            if r.random() < 0.02:  # 重组：先看到后回滚，再换一个哈希出现
                pe(t, item, "deposit", "chain", "detect", acct, asset, chain, amount, ref=h, conf=1, actor="svc-watch")
                pe(t + sec(r.uniform(60, 300)), item, "deposit", "chain", "rollback", acct, asset, chain, amount, ref=h, actor="svc-watch")
                t += sec(r.uniform(400, 900))
                h = txh("d2:" + item)
                NOISE["f_reorg"].append(item)
            pe(t, item, "deposit", "chain", "detect", acct, asset, chain, amount, ref=h, conf=1, actor="svc-watch")
            oc(t - sec(r.uniform(20, 60)), h, chain, asset, frm, hot, "external", "hot", amount, "in")
            lo, hi = {"BTC": (20, 50), "ETH": (3, 5), "TRON": (1, 3)}[chain]
            t += timedelta(minutes=r.uniform(lo, hi))
            rc = "RC-" + h[2:14]
            pe(t, item, "deposit", "chain", "confirm", acct, asset, chain, amount, ref=h, receipt=rc, conf=REQ_CONF[chain] + r.randint(0, 3), actor="svc-watch")
            if r.random() < 0.03:
                pe(t + sec(r.uniform(20, 120)), item, "deposit", "chain", "confirm", acct, asset, chain, amount, ref=h, receipt=rc, conf=REQ_CONF[chain] + 4, actor="svc-watch")
                NOISE["f_dupconf"].append(item)
            pe(t + sec(r.uniform(2, 90)), item, "deposit", "chain", "book", acct, asset, chain, amount, ref=h, actor="svc-ledger")
    # --- 银行提币 / 充值（工作日）
    for d in range(12):
        dd = START + timedelta(days=d)
        if dd.weekday() >= 5:
            continue
        for _ in range(8):  # 提币
            t0 = at(d, r.randint(8, 16), r.randrange(60), r.randrange(60))
            acct = r.choice(POOL)
            amount = round(math.exp(r.uniform(math.log(1500), math.log(90000))), 2)
            item = next_item("withdrawal", "bank")
            brn[0] += 1
            ref = "BK%06d" % brn[0]
            t = t0
            pe(t, item, "withdrawal", "bank", "reserve", acct, "USD", "BANK", amount, actor="svc-wd")
            t += sec(r.uniform(300, 3600))
            pe(t, item, "withdrawal", "bank", "approve", acct, "USD", "BANK", amount, actor=r.choice(approvers.split(",")), approval="AP-" + item)
            t += sec(r.uniform(60, 300))
            pe(t, item, "withdrawal", "bank", "sign", acct, "USD", "BANK", amount, actor="svc-sign")
            t += sec(r.uniform(5, 60))
            pe(t, item, "withdrawal", "bank", "broadcast", acct, "USD", "BANK", amount, ref=ref, actor="svc-bank")
            bt = next_bday(t, 1).replace(hour=r.randint(9, 16), minute=r.randrange(60), second=r.randrange(60))
            cp = cp_for(acct)
            x = r.random()
            if x < 0.04:  # 银行退回
                bank_line(bt, "BK-OPS-1", "wire", "debit", amount, cp, ref)
                bank_line(next_bday(bt, 1).replace(hour=10, minute=r.randrange(60), second=0), "BK-OPS-1", "return", "credit", amount, cp, ref)
                pe(next_bday(bt, 1).replace(hour=11, minute=0, second=0), item, "withdrawal", "bank", "fail", acct, "USD", "BANK", amount, ref=ref, actor="svc-bank")
                pe(next_bday(bt, 1).replace(hour=11, minute=1, second=0), item, "withdrawal", "bank", "release", acct, "USD", "BANK", amount, ref=ref, actor="svc-wd")
                NOISE["f_bank_return"].append((item, ref))
                continue
            t += timedelta(minutes=r.uniform(2, 30))
            pe(t, item, "withdrawal", "bank", "confirm", acct, "USD", "BANK", amount, ref=ref, receipt="BR-" + H("br:" + item)[:10], actor="svc-bank")
            pe(t + sec(r.uniform(2, 90)), item, "withdrawal", "bank", "book", acct, "USD", "BANK", amount, ref=ref, actor="svc-ledger")
            if r.random() < 0.12:  # 周五等：先 pending 再 settled
                bank_line(bt, "BK-OPS-1", "wire", "debit", amount, cp, ref, status="pending")
                bt2 = next_bday(bt, r.randint(1, 2)).replace(hour=r.randint(9, 16))
                bank_line(bt2, "BK-OPS-1", "wire", "debit", amount, cp, ref, status="settled")
                NOISE["f_pending_line"].append((item, ref))
                bt = bt2
            else:
                bank_line(bt, "BK-OPS-1", "wire", "debit", amount, cp, ref)
            bank_line(bt + sec(r.uniform(1, 30)), "BK-OPS-1", "fee", "debit", 25.0, "BANK-FEE", ref + "-FEE")
            NOISE["f_fee_line"].append(ref + "-FEE")
            if (t.date() != bt.date()) and (bt.date() - t.date()).days > 1:
                NOISE["f_weekend"].append(item)
        for _ in range(8):  # 充值
            t0 = at(d, r.randint(8, 16), r.randrange(60), r.randrange(60))
            acct = r.choice(POOL)
            amount = round(math.exp(r.uniform(math.log(2000), math.log(120000))), 2)
            item = next_item("deposit", "bank")
            brn[0] += 1
            ref = "BK%06d" % brn[0]
            cp = cp_for(acct)
            stmt = round(amount - 15.0, 2) if r.random() < 0.03 else amount
            if stmt != amount:
                NOISE["f_fee_mismatch"].append(item)
            bank_line(t0, r.choice(BKS), "wire", "credit", stmt, cp, ref)
            t = t0 + sec(r.uniform(60, 1200))
            pe(t, item, "deposit", "bank", "detect", acct, "USD", "BANK", amount, ref=ref, actor="svc-bank")
            t += sec(r.uniform(60, 600))
            pe(t, item, "deposit", "bank", "confirm", acct, "USD", "BANK", amount, ref=ref, receipt="BR-" + H("br:" + item)[:10], actor="svc-bank")
            pe(t + sec(r.uniform(2, 90)), item, "deposit", "bank", "book", acct, "USD", "BANK", amount, ref=ref, actor="svc-ledger")
    # 银行：行间划转（正常）、利息
    for d in range(DAYS):
        if (START + timedelta(days=d)).weekday() < 5:
            t = at(d, 15, r.randrange(60), r.randrange(60))
            a = round(r.uniform(200000, 500000), 2)
            ref = "SW%04d" % d
            if r.random() < 0.5:
                bank_line(t, "BK-OPS-1", "sweep", "debit", a, BANK_OWN["BK-OPS-2"], ref)
                bank_line(t + sec(2), "BK-OPS-2", "sweep", "credit", a, BANK_OWN["BK-OPS-1"], ref)
            else:
                bank_line(t, "BK-OPS-2", "sweep", "debit", a, BANK_OWN["BK-OPS-1"], ref)
                bank_line(t + sec(2), "BK-OPS-1", "sweep", "credit", a, BANK_OWN["BK-OPS-2"], ref)
            NOISE["f_sweep"].append(ref)
    bank_line(at(13, 6, 0, 0), "BK-OPS-1", "interest", "credit", 3812.45, "BANK-INTEREST", "INT-0314")
    NOISE["f_interest"].append("INT-0314")
    # 链上：热—温调拨（内部）、微额来历不明的转入（正常噪声）
    for d in range(DAYS):
        for chain, asset in (("ETH", "USDT"), ("TRON", "USDT"), ("ETH", "ETH"), ("BTC", "BTC")):
            amt = round(r.uniform(50, 200) * 1000 / usd_px(asset, at(d, 10)), 4 if asset != "USDT" else 2)
            t = at(d, r.randint(9, 16), r.randrange(60), r.randrange(60))
            oc(t, txh("rb:%d:%s:%s" % (d, chain, asset)), chain, asset, wallet("warm", chain, asset), wallet("hot", chain, asset), "warm", "hot", amt, "internal")
    NOISE["f_dust"] = []
    for i in range(15):
        d = r.randrange(DAYS)
        t = at(d, r.randrange(24), r.randrange(60), r.randrange(60))
        chain = r.choice(["ETH", "TRON"])
        a = round(r.uniform(0.3, 4.5), 2)
        h = txh("dust:%d" % i)
        oc(t, h, chain, "USDT", addr("dustsrc:%d" % i), wallet("hot", chain, "USDT"), "external", "hot", a, "in")
        NOISE["f_dust"].append(h)
    # 每天一次的“窗口末尾仍在处理”的小额提币（离统计截止不足 1 小时，未终结）
    for k in range(4):
        asset, chain = pick_asset(r)
        acct = r.choice(POOL)
        t0 = at(DAYS, 0) - timedelta(minutes=r.randint(20, 50))
        amount = amt_for(r, asset, t0)
        item = next_item("withdrawal", "chain")
        pe(t0, item, "withdrawal", "chain", "reserve", acct, asset, chain, amount, actor="svc-wd")
        pe(t0 + sec(r.uniform(30, 300)), item, "withdrawal", "chain", "approve", acct, asset, chain, amount, actor="ST031", approval="AP-" + item)
        NOISE["f_open_end"].append(item)
    inject_s14(r)


S14 = {}


def inject_s14(r):
    inst = [a["account_id"] for a in C.accounts if a["risk_tag"] == "institution"]
    # A：银行外流 480,000 USD 无账务记录；3 天后同额回拨（均无账务）
    S14["A_out"] = "BKX-77001"
    S14["A_in"] = "RTX-77001"
    bank_line(at(9, 11, 42, 17), "BK-OPS-1", "wire", "debit", 480000.0, "ACCT-9F31A2", S14["A_out"])
    bank_line(at(12, 10, 15, 3), "BK-OPS-1", "return", "credit", 480000.0, "ACCT-9F31A2", S14["A_in"])
    # B：380,000 USDT（TRON）已上链，但状态机停在 broadcast，直到 03-12 09:00 才补记
    acct = inst[3]
    item = next_item("withdrawal", "chain")
    S14["B"] = item
    h = txh("B:" + item)
    S14["B_hash"] = h
    t = at(9, 8, 0)
    pe(t, item, "withdrawal", "chain", "reserve", acct, "USDT", "TRON", 380000.0, actor="svc-wd")
    pe(t + sec(1100), item, "withdrawal", "chain", "approve", acct, "USDT", "TRON", 380000.0, actor="ST031", approval="AP-" + item)
    pe(t + sec(1180), item, "withdrawal", "chain", "sign", acct, "USDT", "TRON", 380000.0, actor="svc-sign")
    pe(t + sec(1210), item, "withdrawal", "chain", "broadcast", acct, "USDT", "TRON", 380000.0, ref=h, actor="svc-chain")
    oc(t + sec(1260), h, "TRON", "USDT", wallet("hot", "TRON", "USDT"), addr("ext:" + acct), "hot", "external", 380000.0, "out")
    tb = at(11, 9, 0)
    pe(tb, item, "withdrawal", "chain", "confirm", acct, "USDT", "TRON", 380000.0, ref=h, receipt="RC-" + h[2:14], conf=31, actor="svc-chain")
    pe(tb + sec(40), item, "withdrawal", "chain", "book", acct, "USDT", "TRON", 380000.0, ref=h, actor="svc-ledger")
    # C：假回执：没有广播，没有链上交易，却收到“已确认”并记了账
    acct = inst[5]
    item = next_item("withdrawal", "chain")
    S14["C"] = item
    h = txh("C:" + item)
    S14["C_hash"] = h
    t = at(9, 14, 0)
    pe(t, item, "withdrawal", "chain", "reserve", acct, "USDT", "ETH", 40000.0, actor="svc-wd")
    pe(t + sec(600), item, "withdrawal", "chain", "approve", acct, "USDT", "ETH", 40000.0, actor="ST032", approval="AP-" + item)
    pe(t + sec(650), item, "withdrawal", "chain", "sign", acct, "USDT", "ETH", 40000.0, actor="svc-sign")
    pe(t + sec(1800), item, "withdrawal", "chain", "confirm", acct, "USDT", "ETH", 40000.0, ref=h, receipt="RC-" + h[2:14], conf=12, actor="svc-chain-callback")
    pe(t + sec(1860), item, "withdrawal", "chain", "book", acct, "USDT", "ETH", 40000.0, ref=h, actor="svc-ledger")
    # D：充值重复回执并重复记账
    acct = inst[7]
    item = next_item("deposit", "chain")
    S14["D"] = item
    h = txh("D:" + item)
    S14["D_hash"] = h
    t = at(8, 17, 0)
    hot = wallet("hot", "ETH", "USDT")
    oc(t - sec(30), h, "ETH", "USDT", addr("depsrc:" + acct), hot, "external", "hot", 3200.0, "in")
    pe(t, item, "deposit", "chain", "detect", acct, "USDT", "ETH", 3200.0, ref=h, conf=1, actor="svc-watch")
    pe(t + sec(300), item, "deposit", "chain", "confirm", acct, "USDT", "ETH", 3200.0, ref=h, receipt="RC-" + h[2:14], conf=13, actor="svc-watch")
    pe(t + sec(330), item, "deposit", "chain", "confirm", acct, "USDT", "ETH", 3200.0, ref=h, receipt="RC-" + h[2:12] + "ff", conf=13, actor="svc-watch")
    pe(t + sec(360), item, "deposit", "chain", "book", acct, "USDT", "ETH", 3200.0, ref=h, actor="svc-ledger")
    pe(t + sec(480), item, "deposit", "chain", "book", acct, "USDT", "ETH", 3200.0, ref=h, actor="svc-ledger")
    # H：银行提币已批准，一直没签名（悬挂 8 天）
    acct = inst[9]
    item = next_item("withdrawal", "bank")
    S14["H"] = item
    t = at(5, 16, 0)
    pe(t, item, "withdrawal", "bank", "reserve", acct, "USD", "BANK", 15000.0, actor="svc-wd")
    pe(t + sec(1800), item, "withdrawal", "bank", "approve", acct, "USD", "BANK", 15000.0, actor="ST031", approval="AP-" + item)


def finalize_funds():
    PEND.sort(key=lambda e: (e["dt"], e["item_id"]))
    for i, e in enumerate(PEND, 1):
        e["event_id"] = "PE%06d" % i
    ONCHAIN.sort(key=lambda x: (x["dt"], x["tx_hash"]))
    BANK.sort(key=lambda x: (x["dt"], x["ref"], x["status"]))
    bal = {"BK-OPS-1": 3200000.0, "BK-OPS-2": 2800000.0}
    for i, x in enumerate(BANK, 1):
        x["stmt_id"] = "BS%06d" % i
        if x["status"] == "settled":
            bal[x["bank_account"]] = round(bal[x["bank_account"]] + (x["amount"] if x["direction"] == "credit" else -x["amount"]), 2)
        x["balance"] = bal[x["bank_account"]]


def build_reserves():
    r = rng("reserves")
    # 银行日终余额（自流水推出）
    bank_eod = {}
    for d in range(DAYS):
        cut = at(d + 1)
        tot = 0.0
        for acct, o in (("BK-OPS-1", 3200000.0), ("BK-OPS-2", 2800000.0)):
            last = o
            for x in BANK:
                if x["bank_account"] == acct and x["status"] == "settled" and x["dt"] < cut:
                    last = x["balance"]
            tot += last
        bank_eod[d] = round(tot, 2)
    base = {"USDT": 9_000_000.0, "BTC": 150.0, "ETH": 3000.0}
    walk = {a: 0.0 for a in base}
    WALLETS, RES, LIAB = [], [], []
    NOISE["res_price_skew"] = []
    NOISE["res_inflight"] = []
    B_amt, C_amt, A_amt = 380000.0, 40000.0, 480000.0
    custody = {"USDT": 500000.0, "BTC": 10.0}
    nd = {"USDT": 2, "BTC": 4, "ETH": 4}
    for d in range(DAYS):
        ds = iso(at(d))[:10]
        for asset, b0 in base.items():
            k = nd[asset]
            walk[asset] += r.gauss(0, 0.004)
            user0 = round(b0 * (1 + walk[asset]), k)
            pend = round(user0 * r.uniform(0.01, 0.02), k)
            fees = round(user0 * 0.0005, k)
            margin = round(user0 * r.uniform(-0.01, 0.01), k) if asset == "USDT" else 0.0
            l0t = user0 + pend + fees + margin  # 反事实总负债（没有 S14 事件）
            b = r.uniform(0.010, 0.020) if asset == "USDT" else r.uniform(0.006, 0.015)
            if asset == "USDT" and ds in ("2026-03-04", "2026-03-08"):
                b = -r.uniform(0.0008, 0.0015)
            res = l0t * (1 + b)
            user = user0
            if asset == "USDT":
                if d >= 9:
                    res -= B_amt  # 380,000 已经付出
                    user -= C_amt  # 假回执：账务多扣了 40,000
                if d >= 11:
                    user -= B_amt  # 03-12 补记
            cats = [("user_balance", round(user, k)), ("pending_withdrawal", pend), ("accrued_fees", fees)]
            if asset == "USDT":
                cats.append(("margin_net", margin))
            pb = usd_px(asset, at(d))
            pe_ = usd_px(asset, at(d, 23, 55))
            for cat, v in cats:
                LIAB.append({"date": ds, "asset": asset, "category": cat, "amount": v, "amount_usd": round(v * pb, 2)})
            cust = custody.get(asset, 0.0)
            onchain = res - cust
            hot_s, warm_s = 0.07 * r.uniform(0.9, 1.1), 0.18 * r.uniform(0.9, 1.1)
            tiers = {"hot": onchain * hot_s, "warm": onchain * warm_s, "cold": onchain * (1 - hot_s - warm_s)}
            chains = [("ETH", 0.58), ("TRON", 0.42)] if asset == "USDT" else [(asset, 1.0)]
            for tier, amt in tiers.items():
                acc = 0.0
                for i, (chain, w) in enumerate(chains):
                    v = round(amt * w, k) if i < len(chains) - 1 else round(amt - acc, k)
                    acc += v
                    WALLETS.append({"date": ds, "tier": tier, "chain": chain, "asset": asset, "address": wallet(tier, chain, asset), "balance": v, "balance_usd": round(v * pe_, 2)})
            for tier in tiers:
                v = round(sum(w["balance"] for w in WALLETS if w["date"] == ds and w["asset"] == asset and w["tier"] == tier), k)
                RES.append({"date": ds, "asset": asset, "source": "onchain_" + tier, "amount": v, "amount_usd": round(v * pe_, 2)})
            if cust:
                RES.append({"date": ds, "asset": asset, "source": "custodian", "amount": cust, "amount_usd": round(cust * pe_, 2)})
        # USD：以银行余额为储备；负债 = (银行余额 + 未入账外流) / (1+b)
        bal = bank_eod[d]
        adj = A_amt if 9 <= d <= 11 else 0.0
        b = r.uniform(0.020, 0.040)
        luser = round((bal + adj) / (1 + b), 2)
        pend = round(luser * 0.01, 2)
        for cat, v in (("user_balance", round(luser - pend, 2)), ("pending_withdrawal", pend)):
            LIAB.append({"date": ds, "asset": "USD", "category": cat, "amount": v, "amount_usd": v})
        RES.append({"date": ds, "asset": "USD", "source": "bank", "amount": bal, "amount_usd": bal})
    S14["wallets"], S14["res"], S14["liab"] = WALLETS, RES, LIAB
    cov = {}
    for x in RES:
        c = cov.setdefault((x["date"], x["asset"]), [0.0, 0.0, 0.0, 0.0])
        c[0] += x["amount"]
        c[1] += x["amount_usd"]
    for x in LIAB:
        c = cov.setdefault((x["date"], x["asset"]), [0.0, 0.0, 0.0, 0.0])
        c[2] += x["amount"]
        c[3] += x["amount_usd"]
    for (ds, asset), v in sorted(cov.items()):
        if asset in ("BTC", "ETH") and v[1] < v[3] and v[0] >= v[2]:
            NOISE["res_price_skew"].append("%s@%s" % (asset, ds))
        if asset == "USDT" and ds in ("2026-03-04", "2026-03-08"):
            NOISE["res_inflight"].append("%s@%s" % (asset, ds))
    S14["gaps"] = ["%s@%s" % (a, ds) for (ds, a), v in sorted(cov.items()) if v[0] < v[2] * 0.995]
    S14["cov"] = cov


# ----------------------------------------------------------------- 写文件
def wcsv(path, cols, rows):
    with open(path, "w", newline="") as f:
        w = csv.writer(f, lineterminator="\n")
        w.writerow(cols)
        for r in rows:
            w.writerow([numstr(r.get(c)) for c in cols])


def wjsonl(path, rows, cols):
    with open(path, "w") as f:
        for r in rows:
            f.write(json.dumps({c: r.get(c) for c in cols}, ensure_ascii=False, sort_keys=False) + "\n")


def write_all(out, order_rows):
    os.makedirs(out, exist_ok=True)
    wjsonl(os.path.join(out, "order_events.jsonl"), order_rows,
           "event_id,seq,ts,symbol,event_type,order_id,account_id,side,price,qty,order_qty,filled_qty,match_id,reason,source,seq_to".split(","))
    ml = []
    for x in MATCH_LOG:
        t = x.get("t")
        ml.append({"log_id": x["log_id"], "ts": iso(x["dt"]), "node": x["node"], "epoch": x["epoch"], "role": x["role"], "engine_seq": x["engine_seq"], "event_type": x["event_type"],
                   "symbol": t["sym"] if t else None, "match_id": t["mid"] if t else None, "price": t["price"] if t else None, "qty": t["qty"] if t else None,
                   "buy_order_id": t["buy"]["oid"] if t else None, "sell_order_id": t["sell"]["oid"] if t else None, "shed": x.get("shed")})
    wjsonl(os.path.join(out, "match_log.jsonl"), ml, "log_id,ts,node,epoch,role,engine_seq,event_type,symbol,match_id,price,qty,buy_order_id,sell_order_id,shed".split(","))
    wcsv(os.path.join(out, "trade_ledger_link.csv"), "link_id,ts,trade_id,txn_id,account_id,asset,direction,amount,amount_usd,leg,symbol".split(","),
         [dict(x, ts=iso(x["dt"])) for x in LINKS])
    wcsv(os.path.join(out, "positions.csv"), "ts,account_id,position_id,symbol,side,qty,entry_price,mark_price,leverage,margin,notional,equity,margin_ratio,mmr".split(","),
         [dict(x, ts=iso(x["dt"])) for x in POSITIONS])
    wcsv(os.path.join(out, "liquidations.csv"),
         "liq_id,trigger_ts,exec_ts,account_id,position_id,symbol,side,qty,entry_price,margin,trigger_mark,exec_price,equity_at_exec,shortfall,fund_delta,fund_before,fund_after,unfunded_loss,adl,delay_s".split(","),
         [dict(x, trigger_ts=iso(x["trigger_dt"]), exec_ts=iso(x["dt"])) for x in LIQS])
    wcsv(os.path.join(out, "bank_statements.csv"), "stmt_id,ts,bank_account,channel,direction,amount,counterparty_account,ref,status,balance".split(","),
         [dict(x, ts=iso(x["dt"])) for x in BANK])
    wcsv(os.path.join(out, "wallet_balances.csv"), "date,tier,chain,asset,address,balance,balance_usd".split(","), S14["wallets"])
    wcsv(os.path.join(out, "reserve_snapshots.csv"), "date,asset,source,amount,amount_usd".split(","), S14["res"])
    wcsv(os.path.join(out, "liabilities.csv"), "date,asset,category,amount,amount_usd".split(","), S14["liab"])
    wcsv(os.path.join(out, "onchain_transfers.csv"), "tx_hash,ts,chain,asset,from_addr,to_addr,from_tier,to_tier,amount,status,confirmations,direction".split(","),
         [dict(x, ts=iso(x["dt"])) for x in ONCHAIN])
    wjsonl(os.path.join(out, "pending_states.jsonl"), [dict(x, ts=iso(x["dt"])) for x in PEND],
           "event_id,ts,item_id,kind,rail,event_type,account_id,asset,chain,amount,ref,receipt_id,confirmations,required,actor,approval_id".split(","))
    wcsv(os.path.join(out, "cases.csv"), "case_id,opened_ts,account_id,type,source,severity,status,closed_ts".split(","),
         [{"case_id": c["id"], "opened_ts": iso(c["dt"]), "account_id": c["acct"], "type": c["type"], "source": c["source"], "severity": c["severity"],
           "status": "closed" if c["closed"] else "open", "closed_ts": iso(c["closed"]) if c["closed"] else None} for c in CASES])
    wjsonl(os.path.join(out, "case_actions.jsonl"), [
        {"action_id": a["id"], "ts": iso(a["dt"]), "case_id": a["case"]["id"], "account_id": a["case"]["acct"], "action": a["action"], "scope": a["scope"], "actor": a["actor"],
         "authorizer": a["authorizer"], "authority_ref": a["authority_ref"], "report_status": a["report_status"], "report_ts": iso(a["report_dt"]) if a["report_dt"] else None,
         "retry_of": a["retry_of"]["id"] if a["retry_of"] else None} for a in ACTS],
        "action_id,ts,case_id,account_id,action,scope,actor,authorizer,authority_ref,report_status,report_ts,retry_of".split(","))


# ----------------------------------------------------------------- 答案
def win(a, b):
    return {"start": iso(a), "end": iso(b)}


def register_answers(order_rows_by_id):
    ev = order_rows_by_id
    mids = lambda ts: [t["mid"] for t in ts]
    oids = lambda os_: [o["oid"] for o in os_]
    SCEN["S10"] = ("订单序号缺口与成交—分录不平（账务一致性）",
                   ["订单序号连续性检查：缺口与冲突序号（X29）", "撮合日志与成交回报对账：成交缺回报（X29）", "成交—分录平衡与估值检查（X29、X10）"],
                   ["冻结受影响品种的对外成交回报与清算，等待补齐序号", "从撮合日志与网关重放补齐缺失事件，核对订单状态", "对不平的分录做冲正与重记，保留原分录；复核估值口径", "回灌检测：序号缺口、冲突序号、分录不平进入日常对账"])
    SCEN["S11"] = ("异常价格成交与撤单 / 撤权后仍成交（价格保护与权限撤销）",
                   ["成交价偏离标记价超过价格带（X29）", "撤单确认之后仍有成交（X29）", "撤销交易权限之后仍被受理的订单（X35、X29）"],
                   ["立即暂停该品种撮合或收紧价格带，保留证据", "对异常价格成交按规则裁定撤销或保留，并通知对手方", "核对撤单与撤权在撮合侧的生效路径（缓存 / 订阅延迟）", "撤权后的订单全部复核，必要时冻结账户"])
    SCEN["S12"] = ("撮合过载与主备切换：脑裂窗口内双主写入与重复成交（停写停发）",
                   ["主备 epoch 重叠：旧主在新主晋升后仍写成交（X30、X34）", "同一对订单被两个节点各成交一次（X30）", "订单累计成交量超过订单量（X29）"],
                   ["停写停发：先隔离旧主，停止对外成交回报与清算", "以新主日志为准，冲销旧主在窗口内写入的重复与陈旧成交", "核对受影响账户余额与持仓，必要时先限制再复核", "修复 fencing：旧主必须在新 epoch 生效前停写"])
    SCEN["S13"] = ("强平延迟导致穿仓，保险基金不足",
                   ["强平触发到执行的延迟超过 SLA（X30）", "强平后权益为负（穿仓）（X30）", "保险基金耗尽、出现未覆盖亏损（X30、X38）"],
                   ["先让强平引擎恢复并清空积压，限制新开仓", "按穿仓规则动用保险基金，不足部分启动 ADL 并公告", "复盘延迟原因（积压、行情、限流），评估是否应该暂停该品种", "恢复授信前核对保险基金与风险敞口"])
    SCEN["S14"] = ("储备与负债差额，及银行流水 / 链上 / 账务三方对账不平（含假回执与悬挂）",
                   ["储备覆盖率低于 100%（X38）", "银行流水与账务三方对账：无记录的外流（X31、X37）", "回执核验：已记账但链上不存在（X31）", "状态机悬挂：已上链未记账、已批准未签名（X37）", "重复回执导致重复记账（X37）"],
                   ["先确认储备差额的原因再决定是否暂停提币", "向银行发起回拨 / 查询，向对手账户追索", "冲销假回执记账，查调用方与来源，必要时停用该回执通道", "补记已上链的提币，清理悬挂项并设超时告警", "对重复记账冲正并加幂等键"])
    SCEN["S15"] = ("事故后复付与复市：限制与解除限制的授权缺口",
                   ["解除限制没有授权人或授权人即执行人（X35、X36）", "解除后业务端没有回报（X36）", "法定冻结被无依据解除（X36）", "限制回报失败且账户继续交易（X35）"],
                   ["暂停批量解除，逐项补授权并复核", "向业务端核对每一笔限制 / 解除是否落地，补回报", "法定冻结恢复，并通知合规与法务", "对限制未落地的账户立即重新执行并复核其间交易"])
    # ---- 正例
    pos("S10", 1, "BTC-USDT 订单序号缺口，期间的成交缺少成交回报", win(at(3, 10, 20), at(3, 10, 22)),
        L(lambda: {"gap_key": [S10["gap_key"]], "trade_id": mids(S10["unreported"])}),
        L(lambda: "BTC-USDT 序号 %s 缺失（%d 个），其间 %d 笔成交在撮合日志里有、成交回报里缺" % (S10["gap_key"].split(":")[1], S10["gap_n"], len(S10["unreported"]))),
        L(lambda: {"order_events": [S10["gap_before"], S10["gap_after"]], "match_log": [t["_ml"] for t in S10["unreported"]]}))
    pos("S10", 2, "ETH-USDT 同一序号出现两条内容不同的事件", win(at(3, 10, 30), at(3, 11, 5)),
        L(lambda: {"seq_key": S10["dup_keys"]}), "同一序号对应两个不同订单（序号服务双发），冲突序号共 3 处",
        L(lambda: {"order_events": S10["dup_ids"]}))
    pos("S10", 3, "成交没有任何分录", win(at(3, 10, 0), at(3, 11, 30)),
        L(lambda: {"trade_id": mids(S10["ledger"]["missing"])}), "4 笔大额成交（ETH / BTC / XYZ）在 trade_ledger_link 里没有任何分录", L(lambda: {"match_log": [t["_ml"] for t in S10["ledger"]["missing"]]}))
    pos("S10", 4, "分录借贷不平", win(at(3, 10, 0), at(3, 11, 30)),
        L(lambda: {"trade_id": mids(S10["ledger"]["unbalanced_fee"] + S10["ledger"]["unbalanced_base"]),
                   "txn_id": ["TXN-" + t["mid"] for t in S10["ledger"]["unbalanced_fee"] + S10["ledger"]["unbalanced_base"]]}),
        "3 笔成交的分录借贷不平：2 笔卖方多记手续费部分、1 笔买方基础币少记 5%", None)
    pos("S10", 5, "分录平衡但估值错误（计价币金额放大 10 倍）", win(at(3, 10, 0), at(3, 11, 30)),
        L(lambda: {"trade_id": mids(S10["ledger"]["valuation"]), "txn_id": ["TXN-" + t["mid"] for t in S10["ledger"]["valuation"]]}),
        "2 笔成交的计价币分录金额是 价格×数量 的 10 倍，借贷仍平衡", None)
    pos("S11", 1, "XYZ-USDT 成交价高于标记价 36%–41%，未被价格带拦截", win(at(8, 2, 41), at(8, 2, 44)),
        L(lambda: {"trade_id": mids(S11["abn"])}), "3 笔成交价偏离标记价 +36% 到 +41%（价格带为 ±10%），共约 13 万美元", L(lambda: {"match_log": [t["_ml"] for t in S11["abn"]]}))
    pos("S11", 2, "撤单确认之后订单仍成交", win(at(8, 16, 4), at(8, 16, 40)),
        L(lambda: {"order_id": oids([t["buy"] for t in S11["cxl"]])}), "5 张 ETH-USDT 买单在撤单确认 20–90 秒后仍被成交", L(lambda: {"match_log": [t["_ml"] for t in S11["cxl"]]}))
    pos("S11", 3, "撤销交易权限后仍被受理的订单", win(at(8, 15, 30), at(8, 16, 0)),
        L(lambda: {"order_id": oids(S11["post"]), "account_id": [S11["z"]]}), L(lambda: "账户 %s 在 15:30 撤销交易权限，之后 6 张订单被受理，其中 2 张成交" % S11["z"]),
        L(lambda: {"case_actions": [S11["revoke_act"]["id"]]}))
    pos("S12", 1, "切主窗口内旧主（epoch 2）在新主（epoch 3）晋升后仍写成交", win(W0, W1),
        {"split_key": ["me-b:e2>e3"]}, "14:07:10 me-a 以 epoch 3 晋升，14:09:40 me-b 才被围栏；其间两节点都在写成交", L(lambda: {"match_log": S12["ml_ids"]}))
    pos("S12", 2, "同一对订单被两个节点各成交一次", win(W0, W1),
        L(lambda: {"trade_id": [t["mid"] for p in S12["dups"] for t in p]}), "16 对成交重复（价格、数量、订单对相同，match_id 不同），旧主 16 笔 + 新主 16 笔", L(lambda: {"match_log": [t["_ml"] for p in S12["dups"] for t in p]}))
    pos("S12", 3, "订单累计成交量超过订单量", win(W0, W1),
        L(lambda: {"order_id": [o["oid"] for p in S12["dups"] for o in (p[0]["buy"], p[0]["sell"])]}), "32 张订单被成交两次，累计成交量是订单量的 2 倍", None)
    pos("S13", 1, "强平延迟远超 SLA", win(at(11, 9, 15), at(11, 9, 55)),
        L(lambda: {"liq_id": [x["liq_id"] for x in LIQS if x["kind"] == "incident"]}), L(lambda: "QRS-PERP 暴跌期间 %d 笔强平从触发到执行用了 %d–%d 秒（SLA 60 秒）" % (len(S13["inc"]), min(c["delay"] for c in S13["inc"]), max(c["delay"] for c in S13["inc"]))), L(lambda: {"liquidations": [x["liq_id"] for x in LIQS if x["kind"] == "incident"]}))
    pos("S13", 2, "强平后权益为负（穿仓）", win(at(11, 9, 15), at(11, 9, 55)),
        L(lambda: {"liq_id": [x["liq_id"] for x in LIQS if x["kind"] == "incident" and x["shortfall"] > 0]}), L(lambda: "其中 %d 笔强平执行后权益为负（合计缺口 %.0f 美元）" % (sum(1 for x in LIQS if x["kind"] == "incident" and x["shortfall"] > 0), sum(x["shortfall"] for x in LIQS if x["kind"] == "incident"))), L(lambda: {"liquidations": [x["liq_id"] for x in LIQS if x["kind"] == "incident" and x["shortfall"] > 0]}))
    pos("S13", 3, "保险基金耗尽，出现未覆盖亏损并触发 ADL", win(at(11, 9, 15), at(11, 9, 55)),
        L(lambda: {"liq_id": [x["liq_id"] for x in LIQS if x["unfunded_loss"] > 0]}), "保险基金被穿仓亏损耗尽，之后的穿仓只能由 ADL 与公司承担", L(lambda: {"liquidations": [x["liq_id"] for x in LIQS if x["unfunded_loss"] > 0]}))
    pos("S14", 1, "储备覆盖率低于 100%", win(at(9), at(12)),
        L(lambda: {"reserve_key": S14["gaps"]}), "USD 在 03-10 至 03-12 的储备低于负债（银行外流未入账），USDT 在 03-10 与 03-11 低于负债（已上链提币未记账）", None)
    pos("S14", 2, "银行外流 480,000 美元没有账务记录，3 天后同额回拨也没有记录", win(at(9, 11, 42), at(12, 10, 16)),
        {"ref": [S14["A_out"], S14["A_in"]]}, "BK-OPS-1 在 03-10 11:42 向陌生账户 ACCT-9F31A2 汇出 480,000 美元，03-13 10:15 同额回拨；账务没有任何对应记录", None)
    pos("S14", 3, "假回执：已确认并记账，但没有广播也没有链上交易", win(at(9, 14), at(9, 15)),
        L(lambda: {"item_id": [S14["C"]], "ref": [S14["C_hash"]]}), "40,000 USDT 提币从签名直接跳到确认，回执哈希在链上不存在，账务已扣减", L(lambda: {"pending_states": S14["C_ev"]}))
    pos("S14", 4, "状态机悬挂：已上链未记账、已批准未签名", win(at(5, 16), at(11, 9, 1)),
        L(lambda: {"item_id": [S14["B"], S14["H"]], "ref": [S14["B_hash"]]}), "380,000 USDT 已上链却 48 小时后才确认记账；15,000 美元银行提币批准后 8 天未签名", L(lambda: {"pending_states": S14["BH_ev"]}))
    pos("S14", 5, "重复回执与重复记账", win(at(8, 17), at(8, 17, 10)),
        L(lambda: {"item_id": [S14["D"]], "ref": [S14["D_hash"]]}), "3,200 USDT 充值收到两份不同编号的回执，并被记账两次", L(lambda: {"pending_states": S14["D_ev"]}))
    pos("S15", 1, "解除限制没有授权人，或授权人就是执行人", win(at(12, 9), at(12, 11, 45)),
        L(lambda: {"action_id": [a["id"] for a in S15["noauth"] + S15["self"]]}), "复市日批量解除中 5 笔没有授权人、2 笔自授权", None)
    pos("S15", 2, "解除限制后业务端没有回报", win(at(12, 9), at(12, 11, 45)),
        L(lambda: {"action_id": [a["id"] for a in S15["noreport"]]}), "4 笔解除指令没有收到业务端的“已执行”回报", None)
    pos("S15", 3, "法定冻结被无依据解除", win(at(11, 18, 20), at(11, 18, 21)),
        L(lambda: {"action_id": [S15["legal_bad"]["id"]], "account_id": [S15["legal_acct"]]}), "法定冻结在 03-12 18:20 被客服执行、安全人员授权解除，没有法律文书编号，也不是合规裁定", None)
    pos("S15", 4, "限制指令回报失败且无人重试，账户继续下单", win(at(10, 15, 10), at(10, 17)),
        L(lambda: {"action_id": [a["id"] for a in S15["failed_acts"]], "account_id": S15["failed"]}), "3 个账户的限制指令回报失败，之后各提交 3 张订单仍被受理", None)
    # ---- 噪声
    d = dec
    d("S10", 1, "seq_announced_skip", "公告的序号预留", L(lambda: {"gap_key": ["%s:%d-%d" % (s, a, b) for s, a, b in NOISE["skips"]]}), "运维预先公告的序号预留区间（seq_skip 事件），不是丢失", len(NOISE["skips"]) if "skips" in NOISE else None)
    d("S10", 2, "seq_out_of_order", "到达乱序", L(lambda: {"seq_key": NOISE["ooo_keys"]}), "文件里相邻两行顺序颠倒，序号集合完整", None)
    d("S10", 3, "seq_identical_retransmit", "原样重传", L(lambda: {"seq_key": NOISE["retx_keys"]}), "同一事件（event_id 与内容全同）出现两次，是网关重传，幂等处理即可", None)
    d("S10", 4, "late_posting", "分录延迟入账", L(lambda: {"trade_id": mids(NOISE["late_posting"])}), "批量入账：分录比成交晚 5–25 分钟，最终齐全且平衡", None)
    d("S10", 5, "rounding_cent", "一分钱舍入差", L(lambda: {"trade_id": mids(NOISE["rounding_cent"])}), "借贷差 0.01，属于舍入", None)
    d("S10", 6, "dust_no_fee", "微额成交无手续费分录", L(lambda: {"trade_id": mids([t for t in NOISE["dust_nofee"]])}), "成交额不足 10 美元，手续费四舍五入为 0，没有手续费分录", None)
    d("S11", 1, "band_inside", "价格带内的大偏离", L(lambda: {"trade_id": mids(NOISE["band_inside"])}), "成交价偏离标记价 6%–9%，仍在 10% 价格带内", None)
    d("S11", 2, "price_band_reject", "价格带拒绝", L(lambda: {"order_id": oids(NOISE["price_band_reject"])}), "引擎正确拒绝了偏离超过 10% 的订单（reject / price_band）", None)
    d("S11", 3, "cancel_fill_race", "撤单与成交同一秒（成交在前）", L(lambda: {"order_id": oids([t["buy"] for t in NOISE["race"]])}), "成交序号在撤单之前，只是时间戳同一秒", None)
    d("S11", 4, "too_late_to_cancel", "晚到的撤单被拒绝", L(lambda: {"order_id": oids(NOISE["too_late"])}), "订单已成交后才来的撤单，引擎拒绝（too_late_to_cancel）", None)
    d("S11", 5, "withdraw_only_restricted", "只限制提币的账户继续交易", L(lambda: {"order_id": oids(NOISE["wd_only_trading"])}), "限制范围是 withdraw，不限制交易", None)
    d("S11", 6, "restricted_rejected", "受限账户的订单被拒", L(lambda: {"order_id": oids(NOISE["restricted_rejected"] + S11["rejects"])}), "交易受限后订单被拒绝（reject / account_restricted），这是正确行为", None)
    d("S11", 7, "released_trading", "解除限制后正常交易", L(lambda: {"order_id": oids(NOISE["released_trading"])}), "限制已解除（有授权、有回报），之后交易正常", None)
    d("S12", 1, "twin_partial_fills", "同一对订单的两次部分成交", L(lambda: {"trade_id": [t["mid"] for p in NOISE["twins"] for t in p]}), "订单量是单笔成交量的 2 倍，先后各成交一半，同一节点、累计不超量", None)
    d("S12", 2, "planned_failover", "计划内切主", {"split_key": ["me-a:e1>e2"]}, "03-06 03:00 的计划切主：旧主先停（02:59:58），新主 03:00:00 晋升，没有重叠", None)
    d("S12", 3, "overload_shed", "过载限流", L(lambda: {"order_id": oids(NOISE["shed_rejects"])}), "过载期间被限流拒绝的订单（reject / overload_shed）", None)
    d("S12", 4, "standby_heartbeat", "备节点心跳", {"split_key": ["heartbeat:standby"]}, "非主节点只发心跳，不写成交", None)
    d("S13", 1, "slow_peak", "高峰期慢速强平（30–50 秒）", L(lambda: {"liq_id": [x["liq_id"] for x in LIQS if x["kind"] == "slow_peak"]}), "延迟 31–48 秒，仍在 60 秒 SLA 内，且无穿仓", None)
    d("S13", 2, "gap_shortfall", "价格跳空导致的小额穿仓（延迟正常）", L(lambda: {"liq_id": [x["liq_id"] for x in LIQS if x["kind"] == "gap"]}), "延迟 1–8 秒，价格跳空造成的小额穿仓（不足 2,000 美元），由保险基金正常覆盖", None)
    d("S13", 2 + 1, "dust_shortfall", "微额穿仓", L(lambda: {"liq_id": [x["liq_id"] for x in LIQS if x["kind"] == "dust"]}), "穿仓不足 5 美元，属于数值舍入", None)
    d("S14", 1, "price_skew", "估值口径差异", L(lambda: {"reserve_key": NOISE["res_price_skew"]}), "按美元计的覆盖率低于 1，但按币数覆盖率高于 1（储备与负债取价时点不同）", None)
    d("S14", 2, "usdt_inflight", "在途款项造成的小幅覆盖率不足", L(lambda: {"reserve_key": NOISE["res_inflight"]}), "USDT 覆盖率 99.85%–99.92%，是已付款未记账的在途窗口", None)
    d("S14", 3, "timing_weekend", "周末造成的入账日期差", L(lambda: {"item_id": NOISE["f_weekend"]}), "银行次日 / 下周一入账，账务与流水相差 2–3 天", None)
    d("S14", 4, "intermediary_fee", "中间行费用", L(lambda: {"item_id": NOISE["f_fee_mismatch"]}), "银行入账比账务少 15 美元（中间行费）", None)
    d("S14", 5, "bank_fee_line", "银行手续费行", L(lambda: {"ref": NOISE["f_fee_line"]}), "每笔电汇另有一行 25 美元的银行费用，没有账务对应", None)
    d("S14", 6, "own_sweep", "行间划转", L(lambda: {"ref": NOISE["f_sweep"]}), "BK-OPS-1 与 BK-OPS-2 之间的划转，两侧都在流水里", None)
    d("S14", 7, "pending_then_settled", "先 pending 后 settled", L(lambda: {"item_id": [i for i, _ in NOISE["f_pending_line"]], "ref": [x for _, x in NOISE["f_pending_line"]]}), "同一笔先出现 pending 行，之后 settled", None)
    d("S14", 8, "bank_return", "银行退回", L(lambda: {"item_id": [i for i, _ in NOISE["f_bank_return"]], "ref": [x for _, x in NOISE["f_bank_return"]]}), "汇出后被银行退回，状态机走 fail / release，流水净额为 0", None)
    d("S14", 9, "bank_interest", "利息", L(lambda: {"ref": NOISE["f_interest"]}), "银行利息入账，没有账务对应", None)
    d("S14", 10, "dust_inbound", "微额来历不明转入", L(lambda: {"ref": NOISE["f_dust"]}), "不足 5 USDT 的转入，没有充值申请，未入账", None)
    d("S14", 11, "timeout_rebroadcast", "超时后重广播", L(lambda: {"item_id": NOISE["f_timeout"]}), "30 分钟未确认后超时、重广播（新哈希），随后确认并记账", None)
    d("S14", 12, "dup_confirm_idempotent", "重复回执但只记一次账", L(lambda: {"item_id": NOISE["f_dupconf"]}), "同一回执编号再次到达，只记账一次", None)
    d("S14", 13, "reorg_deposit", "充值重组", L(lambda: {"item_id": NOISE["f_reorg"]}), "先看到后回滚，随后换哈希再确认", None)
    d("S14", 14, "cancel_after_approve", "批准后取消", L(lambda: {"item_id": NOISE["f_cancel"]}), "用户取消，预留已释放", None)
    d("S14", 15, "open_at_end", "统计截止时仍在处理", L(lambda: {"item_id": NOISE["f_open_end"]}), "截止前 1 小时内才创建，尚未超时", None)
    d("S15", 1, "auto_policy", "策略自动限制与到期自动解除", L(lambda: {"action_id": [a["id"] for a in NOISE["auto"]]}), "actor 为 system:*，授权来自策略 policy:R-KYC-HOLD", None)
    d("S15", 2, "failed_then_retried", "回报失败后重试成功", L(lambda: {"action_id": [a["id"] for a in NOISE["retry"]]}), "第一次回报 failed，随后重试并回报 applied", None)
    d("S15", 3, "slow_report", "回报偏慢", L(lambda: {"action_id": [a["id"] for a in NOISE["slow_report"]]}), "回报在 4–25 分钟后到达，仍在 30 分钟内", None)
    d("S15", 4, "legal_release_ok", "有文书、有合规裁定的法定冻结解除", L(lambda: {"action_id": [a["id"] for a in NOISE["legal_ok"]]}), "解除带有文书编号，授权人为合规", None)


def write_answers(out, answers_dir):
    os.makedirs(answers_dir, exist_ok=True)
    index = []
    for sid in sorted(SCEN, key=lambda s: int(s[1:])):
        title, dets, resp = SCEN[sid]
        ps = []
        for p in [p for p in POS if p["scenario"] == sid]:
            q = dict(p)
            q["window"] = q.pop("win")
            q["match"] = resolve(q["match"])
            q["summary"] = resolve(q["summary"])
            q["evidence"] = resolve(q["evidence"])
            ps.append(q)
        ds = []
        for p in [p for p in DEC if p["mimics"] == sid]:
            q = dict(p)
            q["match"] = resolve(q["match"])
            q["evidence"] = resolve(q["evidence"])
            q["count"] = len(next(iter(q["match"].values())))
            ds.append(q)
        w = {"start": min(p["window"]["start"] for p in ps), "end": max(p["window"]["end"] for p in ps)}
        doc = {"id": sid, "name": title, "window": w, "expected_detections": dets, "expected_response": resp, "positive_count": len(ps), "positives": ps,
               "decoy_count": len(ds), "decoys": ds}
        with open(os.path.join(answers_dir, sid + ".json"), "w") as f:
            json.dump(doc, f, ensure_ascii=False, indent=2)
            f.write("\n")
        index.append({"id": sid, "name": title, "positive_count": len(ps), "decoy_count": len(ds), "window": w, "file": "answers/%s.json" % sid})
    with open(os.path.join(answers_dir, "index_x.json"), "w") as f:
        json.dump({"seed": SEED, "start": iso(START), "days": DAYS, "scenarios": index}, f, ensure_ascii=False, indent=2)
        f.write("\n")


# ----------------------------------------------------------------- 主流程
def main():
    global SEED
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", type=int, default=DEFAULT_SEED)
    ap.add_argument("--src", default=os.path.join(OPS, "data"))
    ap.add_argument("--out", default=os.path.join(OPS, "data_x"))
    ap.add_argument("--answers", default=os.path.join(OPS, "answers"))
    args = ap.parse_args()
    SEED = args.seed
    if not os.path.exists(os.path.join(args.src, "accounts.csv")):
        raise SystemExit("找不到第一批数据 %s，请先运行 setup.sh（或 gen/generate.py）" % args.src)
    load_ctx(args.src)
    init_qrs()
    r = rng("pool")
    ids = [a["account_id"] for a in C.accounts if a["risk_tag"] in ("normal", "vip", "new_user")]
    POOL.extend(r.sample(ids, 400))
    base_flow()
    noise_orders()
    inject_s10()
    inject_s11()
    inject_s12()
    margin = POOL[-70:]
    gen_derivs(margin)
    base_cases()
    s11_cases()
    s15_cases()
    finalize_cases()
    reassign_restricted()
    # 订单编号：按下单时间
    for i, o in enumerate(sorted(ORDERS, key=lambda o: (o["new_dt"], o["idx"])), 1):
        o["oid"] = "OX%06d" % i
    build_match_log()
    ev = build_events()
    allev, by = finalize_events(ev)
    by_id = {e["event_id"]: e for e in allev}
    # S10-01：BTC 序号缺口（删掉 10:20:00–10:21:30 内全部 BTC 事件）
    lo, hi = at(3, 10, 20, 0), at(3, 10, 21, 30)
    gone = [e for e in by["BTC-USDT"] if e["type"] != "seq_skip" and lo <= e["dt"] < hi]
    gone_ids = set(e["event_id"] for e in gone)
    seqs = sorted(e["seq"] for e in gone)
    assert seqs == list(range(seqs[0], seqs[-1] + 1)), "缺口不连续"
    prev = [e for e in by["BTC-USDT"] if e["seq"] == seqs[0] - 1][0]
    nxt = [e for e in by["BTC-USDT"] if e["seq"] == seqs[-1] + 1][0]
    S10["gap_key"] = "BTC-USDT:%d-%d" % (seqs[0], seqs[-1])
    S10["gap_n"] = len(seqs)
    S10["gap_before"], S10["gap_after"] = prev["event_id"], nxt["event_id"]
    allev = [e for e in allev if e["event_id"] not in gone_ids]
    # 成交回报缺失的成交
    have = {}
    for e in allev:
        if e.get("trade"):
            have.setdefault(e["trade"]["mid"], 0)
            have[e["trade"]["mid"]] += 1
    S10["unreported"] = [t for t in TRADES if t["sym"] == "BTC-USDT" and have.get(t["mid"], 0) < 2 and any(g.get("trade") is t for g in gone)]
    ml_by_mid = {x["t"]["mid"]: x["log_id"] for x in MATCH_LOG if x["event_type"] == "trade"}
    for t in TRADES:
        t["_ml"] = ml_by_mid[t["mid"]]
    # S10-02：ETH 同序号冲突（插入一条新订单事件，序号取已有事件的序号）
    rr = rng("seqdup")
    eth = [e for e in by["ETH-USDT"] if e["type"] not in ("seq_skip",) and at(3, 10, 30) <= e["dt"] < at(3, 11, 5)]
    S10["dup_keys"], S10["dup_ids"] = [], []
    extra = []
    for k, e in enumerate(rr.sample(eth, 3)):
        o = {"acct": rr.choice(POOL), "sym": "ETH-USDT", "side": "buy", "price": round(mark("ETH-USDT", e["dt"]) * 0.995, 2), "qty": 0.5, "gw": "gw-2", "oid": "OXD%05d" % (k + 1), "trades": []}
        x = {"dt": e["dt"] + timedelta(milliseconds=3), "sym": "ETH-USDT", "type": "new", "o": o, "price": o["price"], "qty": o["qty"], "filled": 0, "reason": None, "seq": e["seq"],
             "event_id": "OE9%05d" % (k + 1), "trade": None, "prio": 0}
        extra.append(x)
        S10["dup_keys"].append("ETH-USDT:%d" % e["seq"])
        S10["dup_ids"].extend([e["event_id"], x["event_id"]])
    allev.extend(extra)
    allev.sort(key=lambda e: (e["dt"], e["sym"], e["seq"], e["event_id"]))
    rows = [event_row(e) for e in allev]
    # 噪声：相邻两行颠倒（到达乱序）、原样重传
    ro = rng("ooo")
    NOISE["ooo_keys"], NOISE["retx_keys"] = [], []
    idxs = sorted(ro.sample(range(300, len(rows) - 300, 7), 25))
    for i in idxs:
        if rows[i]["symbol"] == rows[i + 1]["symbol"] and rows[i]["seq"] < rows[i + 1]["seq"] and rows[i]["event_type"] != "seq_skip":
            rows[i], rows[i + 1] = rows[i + 1], rows[i]
            NOISE["ooo_keys"].append("%s:%d" % (rows[i + 1]["symbol"], rows[i + 1]["seq"]))
    ins = sorted(ro.sample(range(304, len(rows) - 300, 7), 15), reverse=True)
    for i in ins:
        if rows[i]["event_type"] != "seq_skip":
            rows.insert(i + 1, dict(rows[i]))
            NOISE["retx_keys"].append("%s:%d" % (rows[i]["symbol"], rows[i]["seq"]))
    # 去除与冲突 / 缺口 / 乱序重叠的重传键，保证噪声分类互斥
    dup_set = set(S10["dup_keys"])
    NOISE["retx_keys"] = [k for k in NOISE["retx_keys"] if k not in dup_set]
    build_links()
    gen_funds()
    finalize_funds()
    # 证据登记用的编号
    S12["ml_ids"] = [x["log_id"] for x in MATCH_LOG if x["event_type"] == "trade" and W0 <= x["dt"] < W1]
    S14["C_ev"] = [e["event_id"] for e in PEND if e["item_id"] == S14["C"]]
    S14["BH_ev"] = [e["event_id"] for e in PEND if e["item_id"] in (S14["B"], S14["H"])]
    S14["D_ev"] = [e["event_id"] for e in PEND if e["item_id"] == S14["D"]]
    build_reserves()
    register_answers({})
    write_all(args.out, rows)
    write_answers(args.out, args.answers)
    print("生成完成：seed=%d  out=%s" % (SEED, args.out))


if __name__ == "__main__":
    main()
