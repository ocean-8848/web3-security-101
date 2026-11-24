#!/usr/bin/env python3
"""MiniEx 靶场数据生成器。

固定随机种子，只用 Python 3 标准库。所有数据都是合成的：
- 居民 IP 来自 100.64.0.0/10（运营商级 NAT 保留段），云与代理 IP 来自 198.18.0.0/15，
  办公出口为 192.0.2.0/24，攻击来源为 198.51.100.0/24 与 203.0.113.0/24（文档保留段）；
- 链上地址是由种子与标签哈希出来的随机十六进制串，不对应任何真实地址；
- 员工、账户、密钥、仓库都是虚构的。

用法：python3 gen/generate.py [--seed 20260301] [--out data] [--answers answers]
"""
import argparse
import csv
import hashlib
import json
import math
import os
import random
import sys
from datetime import datetime, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
OPS = os.path.dirname(HERE)
DEFAULT_SEED = 20260301
START = datetime(2026, 3, 1)  # 周日
DAYS = 14
STEPS = DAYS * 288 + 1  # 5 分钟一格

R = random.Random(DEFAULT_SEED)
SEED = DEFAULT_SEED


def iso(t):
    return t.strftime("%Y-%m-%dT%H:%M:%SZ")


def at(day, h=0, m=0, s=0):
    return START + timedelta(days=day, hours=h, minutes=m, seconds=s)


def jit(t, lo, hi):
    return t + timedelta(seconds=R.randint(lo, hi))


def H(label):
    return hashlib.sha256(("%s:%s" % (SEED, label)).encode()).hexdigest()


def addr(label):
    return "0x" + H("addr:" + label)[:40]


def txh(label):
    return "0x" + H("tx:" + label)[:64]


def hexid(n=8):
    return "%0*x" % (n, R.getrandbits(n * 4))


# ----------------------------------------------------------------- 表定义
COLS = {
    "accounts": "account_id,country,kyc_level,registered_at,risk_tag",
    "logins": "login_id,ts,account_id,ip,device_id,result,mfa_method",
    "recoveries": "recovery_id,ts,account_id,ip,device_id,channel,result,review_type,completed_ts",
    "account_events": "event_id,ts,account_id,event_type,ip,device_id,detail",
    "api_keys": "key_id,account_id,created_ts,perms,ip_allowlist,status",
    "api_calls": "call_id,ts,key_id,account_id,ip,perm_used,action,result",
    "orders_trades": "trade_id,ts,symbol,price,qty,quote_qty,buy_order_id,sell_order_id,buyer_account_id,seller_account_id,buyer_ip,seller_ip,buyer_device,seller_device",
    "marks": "ts,symbol,index_price,mark_price,source_count",
    "ledger": "entry_id,ts,txn_id,account_id,sub,asset,direction,amount,amount_usd,entry_type,ref_id",
    "withdrawals": "wd_id,ts,account_id,chain,asset,to_address,amount,amount_usd,status,channel,key_id,addr_added_ts,approval_id,tx_hash",
    "chain_txs": "tx_hash,ts,chain,asset,from_addr,to_addr,from_tier,to_tier,amount,amount_usd,kind,wd_id,account_id,request_id",
    "approvals": "approval_id,ts,type,subject_id,to_address,asset,amount,approved_by,approver_count,status",
    "staff": "staff_id,role,team,shift,employed,left_date,privilege,granted_ts,expires_ts,approver_id",
    "support_access": "access_id,ts,staff_id,action,target_account_id,field_group,ticket_id,ip",
}
JSONL = {
    "signing_requests": "request_id,ts,source,requester,wallet_tier,chain,asset,to_address,amount,amount_usd,approval_id,calldata_hash,signer_result",
    "cloud_audit": "event_id,ts,identity,identity_type,action,resource,source_ip,user_agent,result,detail",
    "k8s_audit": "event_id,ts,user,user_type,verb,resource,subresource,namespace,name,source_ip,response_code,annotations",
    "ci_events": "event_id,ts,run_id,repo,workflow,event_type,actor,branch,detail",
    "endpoint_events": "event_id,ts,host,user,event_type,image,parent_image,cmdline,dest_ip,dest_port",
}
ID_PREFIX = {
    "logins": ("login_id", "L"), "recoveries": ("recovery_id", "RC"), "account_events": ("event_id", "AE"),
    "api_calls": ("call_id", "AC"), "orders_trades": ("trade_id", "T"), "ledger": ("entry_id", "LE"),
    "withdrawals": ("wd_id", "W"), "signing_requests": ("request_id", "SR"), "cloud_audit": ("event_id", "CA"),
    "k8s_audit": ("event_id", "K8"), "ci_events": ("event_id", "CI"), "endpoint_events": ("event_id", "EP"),
    "support_access": ("access_id", "SA"),
}
T = {k: [] for k in list(COLS) + list(JSONL)}
SEQ = [0]
REFS = {}      # 供答案引用的命名行
POS = []       # 标准答案（正例）
DEC = []       # 噪声（S9 误报陷阱）


def add(table, **row):
    SEQ[0] += 1
    row["_seq"] = SEQ[0]
    T[table].append(row)
    return row


def resolve(v):
    while callable(v):
        v = v()
    return v


# ----------------------------------------------------------------- 价格与账户
ASSETS = {"USDT": None, "BTC": "BTC-USDT", "ETH": "ETH-USDT"}
SYMBOLS = ["BTC-USDT", "ETH-USDT", "XYZ-USDT", "ABC-USDT"]
START_PX = {"BTC-USDT": 62000.0, "ETH-USDT": 3100.0, "XYZ-USDT": 2.10, "ABC-USDT": 0.45}
VOL = {"BTC-USDT": 0.0012, "ETH-USDT": 0.0016, "XYZ-USDT": 0.0035, "ABC-USDT": 0.005}
IDX = {}


def build_index():
    for s in SYMBOLS:
        p = START_PX[s]
        arr = []
        for _ in range(STEPS):
            arr.append(p)
            p *= math.exp(R.gauss(0, VOL[s]))
        IDX[s] = arr


def step_of(t):
    return max(0, min(STEPS - 1, int((t - START).total_seconds() // 300)))


def px(sym, t):
    return IDX[sym][step_of(t)]


def usd_price(asset, t):
    return 1.0 if asset == "USDT" else px(ASSETS[asset], t)


HW = [1, 1, 1, 1, 1, 2, 3, 5, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 7, 6, 4, 3, 2]
TZ = {"SG": 8, "DE": 1, "BR": -3, "TR": 3, "VN": 7, "NG": 1, "AR": -3, "PH": 8, "ID": 7, "PL": 1, "MX": -6, "TH": 7}
COUNTRIES = list(TZ)
ACC = {}
ACC_LIST = []


def home_ip():
    return "100.%d.%d.%d" % (R.randint(64, 127), R.randint(0, 255), R.randint(1, 254))


def cloud_ip():
    return "198.18.%d.%d" % (R.randint(0, 255), R.randint(1, 254))


def corp_ip():
    return "192.0.2.%d" % R.randint(1, 254)


def new_dev():
    return "dv-" + hexid(8)


def rand_ts(d0=0, d1=DAYS, tz=0):
    d = R.randrange(d0, d1)
    h = (R.choices(range(24), HW)[0] - tz) % 24
    return at(d, h, R.randrange(60), R.randrange(60))


def make_accounts(n=2000):
    for i in range(1, n + 1):
        aid = "A%05d" % i
        c = R.choices(COUNTRIES, [10, 9, 10, 8, 10, 9, 6, 8, 9, 6, 8, 7])[0]
        a = {
            "account_id": aid, "country": c, "kyc": R.choices([0, 1, 2, 3], [8, 30, 45, 17])[0],
            "reg": START - timedelta(days=R.randint(10, 1000), seconds=R.randrange(86400)),
            "tag": "normal", "ips": [home_ip()], "devs": [new_dev()], "act": R.random() ** 2,
            "mfa": R.choices(["none", "sms", "totp", "passkey"], [12, 40, 40, 8])[0],
            "addrs": [], "special": False,
        }
        a["addrs"] = [(addr("user:%s:%d" % (aid, k)), START - timedelta(days=R.randint(5, 300))) for k in range(R.randint(1, 3))]
        if R.random() < 0.3:
            a["devs"].append(new_dev())
        ACC[aid] = a
        ACC_LIST.append(a)
    pool = list(ACC_LIST)
    R.shuffle(pool)
    return pool


POOL = []


def take(n, tag=None, kyc=None, new=False):
    out = []
    for _ in range(n):
        a = POOL.pop()
        a["special"] = True
        if tag:
            a["tag"] = tag
        if kyc is not None:
            a["kyc"] = kyc
        if new:
            a["reg"] = START - timedelta(days=R.randint(2, 9), seconds=R.randrange(86400))
            a["tag"] = "new_user"
            a["kyc"] = 1
        out.append(a)
    return out


def finish_accounts():
    for a in ACC_LIST:
        if a["tag"] == "normal":
            x = R.random()
            if x < 0.03:
                a["tag"] = "watch"
            elif x < 0.06:
                a["reg"] = START - timedelta(days=R.randint(1, 20), seconds=R.randrange(86400))
                a["tag"] = "new_user"
        add("accounts", account_id=a["account_id"], country=a["country"], kyc_level=a["kyc"], registered_at=iso(a["reg"]), risk_tag=a["tag"], _ts=iso(a["reg"]))


# ----------------------------------------------------------------- 钱包与账务
CHAINS = {"USDT": ["ETH", "TRON"], "ETH": ["ETH"], "BTC": ["BTC"]}
TIERS = {}


def wallet(tier, chain):
    return addr("%s:%s" % (tier, chain))


def fmt_amt(asset, v):
    return round(v, 2 if asset == "USDT" else 6)


def ledger_pair(ts, txn, entry_type, ref, legs, asset, amount, usd):
    """legs: [(account, sub, direction)]"""
    for acct, sub, d in legs:
        add("ledger", ts=iso(ts), txn_id=txn, account_id=acct, sub=sub, asset=asset, direction=d,
            amount=amount, amount_usd=round(usd, 2), entry_type=entry_type, ref_id=ref, _ts=iso(ts))


def emit_deposit(ts, acct, asset, usd, from_label=None, chain=None, ref=None):
    chain = chain or R.choice(CHAINS[asset])
    amt = fmt_amt(asset, usd / usd_price(asset, ts))
    usd = round(amt * usd_price(asset, ts), 2)
    frm = addr("ext:" + (from_label or hexid(10)))
    th = txh("dep:%d" % SEQ[0])
    row = add("chain_txs", tx_hash=th, ts=iso(ts), chain=chain, asset=asset, from_addr=frm, to_addr=addr("dep:" + acct),
              from_tier="external", to_tier="deposit", amount=amt, amount_usd=usd, kind="deposit", wd_id="", account_id=acct,
              request_id="", _ts=iso(ts))
    ledger_pair(ts, "TX-" + th[:12], "deposit", th, [(acct, "available", "credit"), ("HOUSE:WALLET", "asset", "debit")], asset, amt, usd)
    if ref:
        REFS[ref] = row
    return row


def emit_internal(ts, a, b, asset, usd, ref=None):
    amt = fmt_amt(asset, usd / usd_price(asset, ts))
    usd = round(amt * usd_price(asset, ts), 2)
    rid = "IT-" + H("it:%d" % SEQ[0])[:10]
    ledger_pair(ts, "TX-" + rid, "internal_transfer", rid, [(a, "available", "debit"), (b, "available", "credit")], asset, amt, usd)
    if ref:
        REFS[ref] = rid
    return rid


def emit_signing(ts, source, requester, tier, chain, asset, to, amt, usd, approval_id, result="signed"):
    return add("signing_requests", ts=iso(ts), source=source, requester=requester, wallet_tier=tier, chain=chain,
               asset=asset, to_address=to, amount=amt, amount_usd=round(usd, 2), approval_id=approval_id,
               calldata_hash=H("cd:%s|%s|%s|%s" % (chain, asset, to.lower(), amt))[:16], signer_result=result, _ts=iso(ts))


def emit_withdrawal(ts, acct, asset, usd, to=None, addr_added=None, status="completed", channel="web", key_id="",
                    chain=None, ref=None, approver=None, approval_delay=None):
    a = ACC[acct]
    chain = chain or R.choice(CHAINS[asset])
    if to is None:
        to, addr_added = R.choice(a["addrs"])
    amt = fmt_amt(asset, usd / usd_price(asset, ts))
    usd = round(amt * usd_price(asset, ts), 2)
    wd = add("withdrawals", ts=iso(ts), account_id=acct, chain=chain, asset=asset, to_address=to, amount=amt, amount_usd=usd,
             status=status, channel=channel, key_id=key_id, addr_added_ts=iso(addr_added) if addr_added else "",
             approval_id="", tx_hash="", _ts=iso(ts))
    wid = lambda w=wd: w["wd_id"]
    ledger_pair(ts, lambda w=wd: "TX-" + w["wd_id"], "freeze", wid, [(acct, "available", "debit"), (acct, "frozen", "credit")], asset, amt, usd)
    if status == "rejected":
        ledger_pair(jit(ts, 1, 5), lambda w=wd: "TX-" + w["wd_id"] + "-R", "unfreeze", wid, [(acct, "frozen", "debit"), (acct, "available", "credit")], asset, amt, usd)
    if status == "completed":
        large = usd >= 20000
        by = approver or ("ST031,ST032" if large else "risk-engine")
        n = len(by.split(","))
        ats = ts + timedelta(seconds=approval_delay if approval_delay is not None else (R.randint(1800, 7200) if large else R.randint(2, 40)))
        ap = add("approvals", ts=iso(ats), type="withdrawal", subject_id=wid, to_address=to, asset=asset, amount=amt,
                 approved_by=by, approver_count=n, status="approved", _ts=iso(ats))
        ap["approval_id"] = lambda w=wd: "AP-" + w["wd_id"]
        wd["approval_id"] = ap["approval_id"]
        rts = ats + timedelta(seconds=R.randint(1, 20))
        sr = emit_signing(rts, "hot-withdraw-svc", "svc-withdraw", "hot", chain, asset, to, amt, usd, ap["approval_id"])
        cts = rts + timedelta(seconds=R.randint(20, 120))
        th = txh("wd:%d" % SEQ[0])
        wd["tx_hash"] = th
        add("chain_txs", tx_hash=th, ts=iso(cts), chain=chain, asset=asset, from_addr=wallet("hot", chain), to_addr=to,
            from_tier="hot", to_tier="external", amount=amt, amount_usd=usd, kind="withdrawal", wd_id=wid,
            account_id=acct, request_id=lambda s=sr: s["request_id"], _ts=iso(cts))
        ledger_pair(cts, lambda w=wd: "TX-" + w["wd_id"] + "-S", "withdrawal", wid, [(acct, "frozen", "debit"), ("HOUSE:WALLET", "asset", "credit")], asset, amt, usd)
        fee = fmt_amt(asset, 1.0 / usd_price(asset, ts) if usd < 5000 else 5.0 / usd_price(asset, ts))
        ledger_pair(cts, lambda w=wd: "TX-" + w["wd_id"] + "-F", "fee", wid, [(acct, "available", "debit"), ("HOUSE:FEE", "revenue", "credit")], asset, fee, fee * usd_price(asset, ts))
        wd["_sr"] = sr
    if ref:
        REFS[ref] = wd
    return wd


def add_event(ts, acct, etype, ip, dev, detail="", ref=None):
    r = add("account_events", ts=iso(ts), account_id=acct, event_type=etype, ip=ip, device_id=dev, detail=detail, _ts=iso(ts))
    if ref:
        REFS[ref] = r
    return r


def add_login(ts, acct, ip, dev, result="success", mfa=None, ref=None):
    r = add("logins", ts=iso(ts), account_id=acct, ip=ip, device_id=dev, result=result,
            mfa_method=mfa if mfa is not None else ACC[acct]["mfa"], _ts=iso(ts))
    if ref:
        REFS[ref] = r
    return r


def add_recovery(ts, acct, ip, dev, channel, result, review="auto", done=None, ref=None):
    r = add("recoveries", ts=iso(ts), account_id=acct, ip=ip, device_id=dev, channel=channel, result=result,
            review_type=review, completed_ts=iso(done) if done else "", _ts=iso(ts))
    if ref:
        REFS[ref] = r
    return r


def decoy(did, mimics, category, match, why, window=None, match_window=False, evidence=None):
    DEC.append({"id": did, "mimics": mimics, "category": category, "match": match, "why_benign": why,
                "window": window, "match_window": match_window, "evidence": evidence or {}})


def positive(pid, scen, name, win, match, summary, evidence):
    POS.append({"id": pid, "scenario": scen, "name": name, "window": {"start": iso(win[0]), "end": iso(win[1])},
                "match": match, "summary": summary, "evidence": evidence})


# ----------------------------------------------------------------- 员工
STAFF = []


def make_staff():
    spec = []
    for i in range(1, 15):
        spec.append(("ST%03d" % i, "support", "support", "night" if i in (12, 13, 14) else "day", ["kyc_read", "profile_read"]))
    for i in range(20, 30):
        spec.append(("ST%03d" % i, "developer", "engineering", "day", ["repo_write"]))
    for i in range(34, 39):
        spec.append(("ST%03d" % i, "sre", "platform", "day", ["prod_exec", "cloud_admin"]))
    for i in range(31, 34):
        spec.append(("ST%03d" % i, "treasury", "treasury", "day", ["transfer_approve"]))
    for i in range(40, 43):
        spec.append(("ST%03d" % i, "security", "security", "day", ["siem_admin"]))
    for i in range(44, 47):
        spec.append(("ST%03d" % i, "finance", "finance", "day", ["ledger_read"]))
    for i in range(48, 50):
        spec.append(("ST%03d" % i, "compliance", "compliance", "day", ["kyc_read", "case_manage"]))
    spec.append(("ST015", "support", "support", "day", ["kyc_read"]))  # 已离职但特权仍有效（治理发现 G1）
    spec.append(("ST050", "developer", "engineering", "day", ["repo_write", "prod_exec"]))  # prod_exec 已过期（G2）
    spec.append(("ST051", "developer", "engineering", "day", ["repo_write", "cloud_admin"]))  # 特权无审批人（G3）
    for sid, role, team, shift, privs in spec:
        left = ""
        employed = "yes"
        if sid == "ST015":
            employed, left = "no", "2026-01-20"
        if not privs:
            privs = [""]
        for p in privs:
            granted = iso(datetime(2025, R.randint(1, 12), R.randint(1, 28)))
            expires = iso(datetime(2026, 12, 31))
            appr = "ST040"
            if sid == "ST050" and p == "prod_exec":
                expires = iso(datetime(2026, 2, 15))
            if sid == "ST051" and p == "cloud_admin":
                appr = ""
            if p in ("prod_exec", "cloud_admin") and sid not in ("ST050", "ST051"):
                expires = iso(datetime(2026, 6, 30))
            add("staff", staff_id=sid, role=role, team=team, shift=shift, employed=employed, left_date=left, privilege=p,
                granted_ts=granted, expires_ts=expires, approver_id=appr, _ts=sid)
    return [s for s in spec]


# ----------------------------------------------------------------- 基线：登录、事件、API、交易、提币
def base_logins():
    for a in ACC_LIST:
        p = 1.0 if a["tag"] in ("vip", "institution", "market_maker") else 0.1 + 0.8 * a["act"]
        for d in range(DAYS):
            if R.random() > p:
                continue
            for _ in range(R.choice([1, 1, 1, 2])):
                ts = at(d, (R.choices(range(24), HW)[0] - TZ[a["country"]]) % 24, R.randrange(60), R.randrange(60))
                ip = a["ips"][0] if R.random() < 0.92 else home_ip()
                dev = a["devs"][0] if R.random() < 0.9 else R.choice(a["devs"])
                x = R.random()
                if x < 0.022:
                    add_login(jit(ts, -60, -20), a["account_id"], ip, dev, "failed_password")
                elif x < 0.03:
                    add_login(jit(ts, -60, -20), a["account_id"], ip, dev, "failed_mfa")
                add_login(ts, a["account_id"], ip, dev)
    # 偶发的新设备 / 新 IP 的正常登录
    for _ in range(120):
        a = R.choice(ACC_LIST)
        add_login(rand_ts(tz=TZ[a["country"]]), a["account_id"], home_ip(), new_dev())
    # 几个用户连续输错密码
    for a in R.sample(ACC_LIST, 40):
        t0 = rand_ts(tz=TZ[a["country"]])
        for k in range(R.randint(3, 6)):
            add_login(t0 + timedelta(seconds=30 * k), a["account_id"], a["ips"][0], a["devs"][0], "failed_password")
        add_login(t0 + timedelta(minutes=5), a["account_id"], a["ips"][0], a["devs"][0])


def base_recoveries_events():
    for a in R.sample(ACC_LIST, 26):
        t = rand_ts(tz=TZ[a["country"]])
        res = R.choices(["success", "denied", "pending"], [70, 22, 8])[0]
        add_recovery(t, a["account_id"], a["ips"][0] if R.random() < 0.6 else home_ip(), R.choice(a["devs"]) if R.random() < 0.5 else new_dev(),
                     R.choice(["email", "sms", "support_kyc"]), res, R.choice(["auto", "manual"]), t + timedelta(hours=R.randint(1, 30)) if res == "success" else None)
    for a in R.sample(ACC_LIST, 60):
        t = rand_ts()
        add_event(t, a["account_id"], R.choice(["phone_change", "mfa_reset", "mfa_unbind"]), a["ips"][0], a["devs"][0])
    for a in R.sample(ACC_LIST, 130):  # 窗口内新增提币地址，随后多数会放 24 小时以上
        t = rand_ts(0, DAYS - 2)
        ad = addr("user:%s:new%d" % (a["account_id"], SEQ[0]))
        a["addrs"].append((ad, t))
        add_event(t, a["account_id"], "add_withdraw_address", a["ips"][0], a["devs"][0], "addr=" + ad[:12])


def base_withdrawals():
    cand = [a for a in ACC_LIST if not a["special"]]
    wd_users = R.sample(cand, 480)
    n = 0
    while n < 1250:
        a = R.choice(wd_users)
        ts = rand_ts(tz=TZ[a["country"]])
        asset = R.choices(["USDT", "ETH", "BTC"], [60, 20, 20])[0]
        usd = min(40000, max(20, R.lognormvariate(5.9, 1.3)))
        # 选地址：窗口内新增的地址要在 ts 之前至少 25 小时（正常行为），少数“马上用”的金额很小
        usable = [(ad, t) for ad, t in a["addrs"] if t <= ts - timedelta(hours=25)]
        if usable and R.random() > 0.03:
            to, added = R.choice(usable)
        else:
            if R.random() < 0.5 or not a["addrs"]:
                continue
            to = addr("user:%s:q%d" % (a["account_id"], SEQ[0]))
            added = ts - timedelta(minutes=R.randint(2, 50))
            usd = min(usd, 450)
            a["addrs"].append((to, added))
            add_event(added, a["account_id"], "add_withdraw_address", a["ips"][0], a["devs"][0], "addr=" + to[:12])
        st = R.choices(["completed", "rejected", "pending"], [94, 4, 2])[0]
        if usd < 25:
            st = "completed"
        emit_withdrawal(ts, a["account_id"], asset, usd, to, added, st)
        n += 1


def base_deposits():
    cand = [a for a in ACC_LIST if not a["special"]]
    dep_users = R.sample(cand, 600)
    for _ in range(1200):
        a = R.choice(dep_users)
        ts = rand_ts(tz=TZ[a["country"]])
        asset = R.choices(["USDT", "ETH", "BTC"], [60, 20, 20])[0]
        emit_deposit(ts, a["account_id"], asset, min(60000, max(15, R.lognormvariate(6.0, 1.4))))


def base_trades(traders):
    w = [1.0 / (i + 1) ** 0.6 for i in range(len(traders))]
    for _ in range(11500):
        b, s = R.choices(traders, w, k=2)
        if b is s:
            continue
        sym = R.choices(SYMBOLS, [45, 35, 12, 8])[0]
        ts = rand_ts()
        emit_trade(ts, sym, b, s, px(sym, ts) * (1 + R.gauss(0, 0.0006)), min(60000, R.lognormvariate(5.7, 1.1)))


def emit_trade(ts, sym, b, s, price, quote_usd, ips=None, devs=None):
    base, quote = sym.split("-")
    qty = round(quote_usd / price, 6 if price > 1 else 2)
    price = round(price, 4 if price < 10 else 2)
    qq = round(qty * price, 2)
    bi = ips[0] if ips else (b["ips"][0] if R.random() < 0.85 else home_ip())
    si = ips[1] if ips else (s["ips"][0] if R.random() < 0.85 else home_ip())
    bd = devs[0] if devs else b["devs"][0]
    sd = devs[1] if devs else s["devs"][0]
    tr = add("orders_trades", ts=iso(ts), symbol=sym, price=price, qty=qty, quote_qty=qq,
             buy_order_id="O%s" % hexid(10), sell_order_id="O%s" % hexid(10), buyer_account_id=b["account_id"],
             seller_account_id=s["account_id"], buyer_ip=bi, seller_ip=si, buyer_device=bd, seller_device=sd, _ts=iso(ts))
    tid = lambda t=tr: t["trade_id"]
    q_usd = qq
    b_usd = qty * usd_price(base, ts) if base in ASSETS else qq
    ledger_pair(ts, tid, "trade", tid, [(b["account_id"], "available", "debit"), (s["account_id"], "available", "credit")], quote, qq, q_usd)
    ledger_pair(ts, lambda t=tr: t["trade_id"] + "-B", "trade", tid, [(s["account_id"], "available", "debit"), (b["account_id"], "available", "credit")], base, qty, qq)
    fee = round(qty * 0.001, 6)
    ledger_pair(ts, lambda t=tr: t["trade_id"] + "-FB", "fee", tid, [(b["account_id"], "available", "debit"), ("HOUSE:FEE", "revenue", "credit")], base, fee, fee * price)
    fee2 = round(qq * 0.001, 2)
    ledger_pair(ts, lambda t=tr: t["trade_id"] + "-FS", "fee", tid, [(s["account_id"], "available", "debit"), ("HOUSE:FEE", "revenue", "credit")], quote, fee2, fee2)
    return tr


def base_marks():
    for s in SYMBOLS:
        for i in range(STEPS):
            t = START + timedelta(minutes=5 * i)
            idxp = IDX[s][i]
            mark = idxp * (1 + R.gauss(0, 0.0004))
            nd = 5 if s in ("BTC-USDT", "ETH-USDT") else 3
            REFS.setdefault("marks_%s" % s, []).append(add("marks", ts=iso(t), symbol=s, index_price=round(idxp, 4), mark_price=round(mark, 4), source_count=nd, _ts=iso(t)))


def base_api(keyed):
    """keyed: 已有 key 的账户列表。返回 key 信息。"""
    keys = []
    for k, a in enumerate(keyed):
        kid = "K%04d" % (k + 1)
        perms = R.choices(["read,trade", "read", "read,trade,withdraw"], [80, 8, 12])[0]
        server = cloud_ip()
        created = START - timedelta(days=R.randint(10, 300))
        allow = server if ("withdraw" in perms or R.random() < 0.4) else ""
        add("api_keys", key_id=kid, account_id=a["account_id"], created_ts=iso(created), perms=perms, ip_allowlist=allow,
            status="active", _ts=iso(created))
        keys.append({"id": kid, "acct": a["account_id"], "perms": perms, "ip": server, "migrate": None})
    for ky in keys:
        for d in range(DAYS):
            for _ in range(R.randint(40, 110)):
                ts = at(d, R.randrange(24), R.randrange(60), R.randrange(60))
                ip = ky["ip"]
                if ky["migrate"] is not None and d >= ky["migrate"][0]:
                    ip = ky["migrate"][1]
                kind = R.choices(["get_balance", "place_order", "cancel_order", "get_orders"], [30, 30, 25, 15])[0]
                perm = "trade" if kind in ("place_order", "cancel_order") else "read"
                add("api_calls", ts=iso(ts), key_id=ky["id"], account_id=ky["acct"], ip=ip, perm_used=perm, action=kind,
                    result="ok" if R.random() < 0.985 else "rate_limited", _ts=iso(ts))
    return keys


# ----------------------------------------------------------------- 金库调拨
def treasury(emit_ref_start):
    tn = [0]

    def transfer(ts, src, dst, chain, asset, usd, by, count, delay=None, to=None, approved_ts=None):
        tn[0] += 1
        amt = fmt_amt(asset, usd / usd_price(asset, ts))
        usd = round(amt * usd_price(asset, ts), 2)
        to_addr = to or wallet(dst, chain)
        aid = "AP-T%04d" % tn[0]
        ats = approved_ts or (ts - timedelta(minutes=R.randint(20, 90)))
        add("approvals", ts=iso(ats), type="treasury_transfer", subject_id="TR%04d" % tn[0], to_address=wallet(dst, chain),
            asset=asset, amount=amt, approved_by=by, approver_count=count, status="approved", approval_id=aid, _ts=iso(ats))
        sr = emit_signing(ts, "treasury-transfer", "svc-treasury", src, chain, asset, to_addr, amt, usd, aid)
        th = txh("tr:%d" % tn[0])
        cts = ts + timedelta(seconds=R.randint(30, 200))
        add("chain_txs", tx_hash=th, ts=iso(cts), chain=chain, asset=asset, from_addr=wallet(src, chain), to_addr=to_addr,
            from_tier=src, to_tier=dst, amount=amt, amount_usd=usd, kind="rebalance", wd_id="", account_id="",
            request_id=lambda s=sr: s["request_id"], _ts=iso(cts))
        return sr, aid

    for d in range(DAYS):
        for asset, chain in (("USDT", "ETH"), ("USDT", "TRON"), ("ETH", "ETH"), ("BTC", "BTC")):
            if d % 2 == 0 or asset == "USDT":
                transfer(at(d, R.randint(9, 16), R.randrange(60), R.randrange(60)), "warm", "hot", chain, asset, R.randint(80, 300) * 1000, "ST031,ST032", 2)
    for d, chain, asset in ((2, "ETH", "ETH"), (7, "BTC", "BTC"), (11, "ETH", "USDT")):
        transfer(at(d, 14, R.randrange(60)), "cold", "warm", chain, asset, R.randint(800, 2500) * 1000, "ST031,ST032,ST041", 3, approved_ts=at(d - 1, 15))
    for d in (4, 9):
        transfer(at(d, 11, R.randrange(60)), "hot", "warm", "ETH", "USDT", 150000, "ST031,ST032", 2)
    return transfer


# ----------------------------------------------------------------- 日志基线：云、K8s、端点、CI、客服
UA_NORMAL = ["aws-cli/2.15.30", "Terraform/1.7.5", "console.amazonaws.com", "Boto3/1.34.7 Python/3.11"]


def base_cloud_k8s_endpoint(devs_staff, sre_staff):
    ids = devs_staff + sre_staff
    for d in range(DAYS):
        wk = (START + timedelta(days=d)).weekday() < 5
        for _ in range(R.randint(300, 420) if wk else R.randint(60, 120)):
            sid = R.choice(ids)
            ts = at(d, R.choices(range(24), HW)[0], R.randrange(60), R.randrange(60))
            act = R.choices(["DescribeInstances", "GetObject", "PutObject", "AssumeRole", "ConsoleLogin", "GetSecretValue", "ListBuckets", "RunInstances", "UpdateFunctionCode"],
                            [25, 20, 12, 12, 8, 6, 8, 3, 6])[0]
            sec = ""
            if act == "GetSecretValue":
                sec = R.choice(["dev/db", "dev/api-token", "stage/db", "prod/web-config"])
            add("cloud_audit", ts=iso(ts), identity=sid, identity_type="user", action=act, resource=sec or "arn:synthetic:%s" % R.choice(["ec2", "s3", "lambda", "iam"]),
                source_ip=corp_ip(), user_agent=R.choice(UA_NORMAL), result="success" if R.random() < 0.97 else "denied", detail={}, _ts=iso(ts))
        for _ in range(R.randint(30, 60)):  # 服务角色
            ts = at(d, R.randrange(24), R.randrange(60), R.randrange(60))
            add("cloud_audit", ts=iso(ts), identity=R.choice(["role/svc-withdraw", "role/svc-risk", "role/svc-indexer", "role/ci-deploy"]), identity_type="role",
                action=R.choice(["AssumeRole", "GetSecretValue", "PutObject", "Decrypt"]), resource="arn:synthetic:svc", source_ip="10.20.%d.%d" % (R.randint(0, 3), R.randint(1, 254)),
                user_agent="aws-sdk-go/1.50", result="success", detail={}, _ts=iso(ts))
        # k8s
        for _ in range(R.randint(120, 200)):
            ts = at(d, R.randrange(24), R.randrange(60), R.randrange(60))
            if R.random() < 0.45:  # 服务账号读自己命名空间的 secret
                ns = R.choice(["signing", "risk", "web", "indexer"])
                add("k8s_audit", ts=iso(ts), user="sa:%s/app" % ns, user_type="serviceaccount", verb="get", resource="secrets", subresource="",
                    namespace=ns, name="%s-config" % ns, source_ip="10.20.%d.%d" % (R.randint(4, 9), R.randint(1, 254)), response_code=200, annotations={}, _ts=iso(ts))
            else:
                sid = R.choice(sre_staff)
                ns = R.choice(["web", "risk", "indexer", "monitoring"])
                add("k8s_audit", ts=iso(ts), user=sid, user_type="human", verb=R.choice(["get", "list", "get", "list", "create"]),
                    resource=R.choice(["pods", "pods", "deployments", "services"]), subresource="", namespace=ns, name="obj-%s" % hexid(4),
                    source_ip=corp_ip(), response_code=200, annotations={}, _ts=iso(ts))
    # 开发机进程基线
    imgs = ["git", "node", "python3", "docker", "kubectl", "aws", "code", "npm", "make", "ssh", "cargo", "forge"]
    for sid in devs_staff:
        host = "dev-mbp-%s" % sid[2:]
        for d in range(DAYS):
            if (START + timedelta(days=d)).weekday() >= 5 and R.random() < 0.8:
                continue
            for _ in range(R.randint(15, 35)):
                ts = at(d, R.randint(8, 19), R.randrange(60), R.randrange(60))
                im = R.choice(imgs)
                add("endpoint_events", ts=iso(ts), host=host, user=sid, event_type="process_start", image=im, parent_image=R.choice(["zsh", "code", "iterm"]),
                    cmdline="%s ..." % im, dest_ip="", dest_port="", _ts=iso(ts))
            if R.random() < 0.5:
                ts = at(d, R.randint(8, 19), R.randrange(60))
                add("endpoint_events", ts=iso(ts), host=host, user=sid, event_type="net_connect", image="git", parent_image="zsh", cmdline="git fetch",
                    dest_ip="198.18.%d.%d" % (R.randint(0, 255), R.randint(1, 254)), dest_port=443, _ts=iso(ts))


def base_support():
    day = [("ST%03d" % i) for i in range(1, 12)]
    night = ["ST012", "ST013", "ST014"]
    tk = [0]

    def tick():
        tk[0] += 1
        return "TK-%06d" % tk[0]

    for d in range(DAYS):
        wk = (START + timedelta(days=d)).weekday() < 5
        for sid in day:
            if not wk and R.random() < 0.6:
                continue
            for _ in range(R.randint(15, 45)):
                ts = at(d, R.randint(8, 19), R.randrange(60), R.randrange(60))
                kind = R.choices(["view_profile", "view_kyc"], [75, 25])[0]
                add("support_access", ts=iso(ts), staff_id=sid, action=kind, target_account_id=R.choice(ACC_LIST)["account_id"],
                    field_group="kyc_document" if kind == "view_kyc" else "profile", ticket_id=tick(), ip=corp_ip(), _ts=iso(ts))
        for sid in night:
            for _ in range(R.randint(10, 25)):
                ts = at(d, (R.choice([22, 23, 0, 1, 2, 3, 4, 5])), R.randrange(60), R.randrange(60))
                add("support_access", ts=iso(ts), staff_id=sid, action="view_profile", target_account_id=R.choice(ACC_LIST)["account_id"],
                    field_group="profile", ticket_id=tick(), ip=corp_ip(), _ts=iso(ts))
    return tick


# ----------------------------------------------------------------- CI 基线
ACTION_SHA = {a: H("sha:" + a)[:40] for a in ["actions/checkout", "actions/setup-node", "actions/upload-artifact", "sigstore/cosign-installer", "foundry-rs/foundry-toolchain"]}
LOCK = {}  # pkg@ver -> integrity
PKGS = [("ethers", "6.11.1"), ("viem", "2.7.9"), ("axios", "1.6.7"), ("web3-helper", "2.3.0"), ("pino", "8.19.0"), ("zod", "3.22.4")]
for _p, _v in PKGS:
    LOCK[_p] = (_v, "sha256-" + H("lock:%s@%s" % (_p, _v))[:32])
REPOS = {"miniex/wallet-service": "ci.yml", "miniex/exchange-web": "ci.yml", "miniex/infra": "ci.yml", "miniex/docs": "docs.yml"}
CI_N = [0]


def ci_run(ts, repo, wf, actor, branch, steps, event="push"):
    CI_N[0] += 1
    run = "run-%05d" % CI_N[0]
    rows = []
    rows.append(add("ci_events", ts=iso(ts), run_id=run, repo=repo, workflow=wf, event_type="workflow_trigger", actor=actor, branch=branch,
                    detail={"trigger": event}, _ts=iso(ts)))
    t = ts
    for et, det in steps:
        t = t + timedelta(seconds=R.randint(3, 40))
        rows.append(add("ci_events", ts=iso(t), run_id=run, repo=repo, workflow=wf, event_type=et, actor=actor, branch=branch, detail=det, _ts=iso(t)))
    return run, rows


def pinned(name):
    return {"action": name, "ref": ACTION_SHA[name]}


def base_ci(devs):
    pk = lambda: [("dependency_install", {"package": p, "version": v, "integrity": i, "lock_integrity": i}) for p, (v, i) in sorted(LOCK.items())]
    for _ in range(560):
        repo = R.choice(["miniex/wallet-service", "miniex/exchange-web", "miniex/infra"])
        ts = rand_ts(0, DAYS)
        if ts.weekday() >= 5 and R.random() < 0.7:
            continue
        steps = [("action_use", pinned("actions/checkout")), ("action_use", pinned("actions/setup-node"))] + pk()
        steps.append(("artifact_build", {"artifact": repo.split("/")[1], "sha256": H("art:%d" % CI_N[0])[:32], "channel": "ci"}))
        ci_run(ts, repo, "ci.yml", R.choice(devs), R.choice(["main", "feat/%s" % hexid(3), "fix/%s" % hexid(3)]), steps, R.choice(["push", "pull_request"]))
    # 签名的正式发布
    for d, repo, ver in ((3, "miniex/wallet-service", "v1.6.2"), (6, "miniex/exchange-web", "v3.14.0"), (8, "miniex/wallet-service", "v1.7.0"), (12, "miniex/exchange-web", "v3.15.0")):
        sha = H("rel:%s:%s" % (repo, ver))[:32]
        ci_run(at(d, 10, R.randrange(60)), repo, "release.yml", "ST022", "main",
               [("action_use", pinned("actions/checkout")), ("action_use", pinned("sigstore/cosign-installer"))] + pk() +
               [("artifact_build", {"artifact": repo.split("/")[1] + ":" + ver, "sha256": sha, "channel": "release"}),
                ("artifact_sign", {"artifact": repo.split("/")[1] + ":" + ver, "sha256": sha, "signature": "cosign:" + H("sig:" + sha)[:24]}),
                ("publish", {"artifact": repo.split("/")[1] + ":" + ver, "sha256": sha, "channel": "release", "signature": "cosign:" + H("sig:" + sha)[:24]})], "workflow_dispatch")
    # 噪声：每晚构建不签名，发到内部 nightly 通道
    for d in range(DAYS):
        sha = H("nightly:%d" % d)[:32]
        run, rows = ci_run(at(d, 2, 30), "miniex/wallet-service", "release.yml", "ci-bot", "main",
                           [("action_use", pinned("actions/checkout"))] + pk() +
                           [("artifact_build", {"artifact": "wallet-service:nightly", "sha256": sha, "channel": "nightly"}),
                            ("publish", {"artifact": "wallet-service:nightly", "sha256": sha, "channel": "nightly", "signature": None})], "schedule")
        decoy("S9-S8-N%02d" % d, "S8", "ci_unsigned_nightly", {"run_id": [run]}, "每晚构建只发到内部 nightly 通道，不进入生产，按策略不要求签名")
    # 噪声：文档站 workflow 用官方 Action 的标签引用（未固定到提交）
    for d in range(DAYS):
        for _ in range(2):
            ts = at(d, R.randint(8, 18), R.randrange(60))
            run, rows = ci_run(ts, "miniex/docs", "docs.yml", R.choice(devs), "main",
                               [("action_use", {"action": "actions/checkout", "ref": "v4"}), ("action_use", {"action": "actions/setup-node", "ref": "v4"})], "push")
            decoy("S9-S8-D%d-%d" % (d, _), "S8", "ci_tag_pinned_docs", {"run_id": [run]}, "文档站只构建静态页面，没有密钥与发布权限；官方 Action 用标签引用，风险已接受并登记")
    # 噪声：依赖升级，lockfile 同步更新，哈希与新 lockfile 一致
    for k, (p, nv) in enumerate([("axios", "1.6.8"), ("pino", "8.19.1"), ("zod", "3.22.5")]):
        ts = at(2 + k * 3, 14, R.randrange(60))
        ni = "sha256-" + H("lock:%s@%s" % (p, nv))[:32]
        run, rows = ci_run(ts, "miniex/exchange-web", "ci.yml", R.choice(devs), "chore/bump-%s" % p,
                           [("action_use", pinned("actions/checkout")), ("dependency_install", {"package": p, "version": nv, "integrity": ni, "lock_integrity": ni, "lock_changed_in_commit": True})], "pull_request")
        decoy("S9-S8-B%d" % k, "S8", "ci_dependency_bump", {"run_id": [run]}, "依赖升级的 PR，lockfile 在同一提交里更新，实际哈希与新 lockfile 一致")
    # 噪声：实验仓库没有 lockfile
    for k in range(3):
        ts = at(1 + k * 4, 16, R.randrange(60))
        run, rows = ci_run(ts, "miniex/infra", "ci.yml", R.choice(devs), "exp/sandbox",
                           [("action_use", pinned("actions/checkout")), ("dependency_install", {"package": "left-pad-x", "version": "1.0.%d" % k, "integrity": "sha256-" + hexid(16), "lock_integrity": None})], "push")
        decoy("S9-S8-X%d" % k, "S8", "ci_no_lockfile_sandbox", {"run_id": [run]}, "实验分支，不产出制品，没有 lockfile 是已知状态")


# ----------------------------------------------------------------- 场景
MIG = []
ATT = ["203.0.113.%d" % i for i in range(10, 16)]


def s1():
    """账户接管。"""
    victims = take(3)
    v1, v2, v3 = victims
    # 撞库活动 1（Mar 4 01:00-01:25）
    targets = [a for a in R.sample(ACC_LIST, 400) if not a["special"]][:330]
    base = at(3, 1, 0)
    first = []
    for a in targets + [v1, v2]:
        for _ in range(R.choice([2, 3, 3, 4])):
            ts = base + timedelta(seconds=R.randint(0, 1500))
            ip = R.choice(ATT)
            r = add_login(ts, a["account_id"], ip, "dv-bot-" + ip[-2:], "failed_password", "none")
            if a is v1 and not first:
                first.append(r)
    # V1：无 MFA，登录成功 -> 手机换绑 -> 新地址 -> 大额提币
    ip1 = ATT[2]
    dv1 = "dv-" + hexid(8)
    l1 = add_login(at(3, 1, 12, 10), v1["account_id"], ip1, dv1, "success", "none")
    e1 = add_event(at(3, 1, 15, 40), v1["account_id"], "phone_change", ip1, dv1)
    ad1 = addr("s1:v1:out")
    e2 = add_event(at(3, 1, 20, 5), v1["account_id"], "add_withdraw_address", ip1, dv1, "addr=" + ad1[:12])
    emit_deposit(at(2, 20, 0), v1["account_id"], "USDT", 18800, "s1v1", "ETH")
    w1 = emit_withdrawal(at(3, 1, 48, 30), v1["account_id"], "USDT", 18400, ad1, at(3, 1, 20, 5), ref="S1-01:wd", chain="ETH")
    # V2：短信找回 -> 改邮箱 -> 新地址 -> 提币被风控冻结
    ip2 = ATT[4]
    dv2 = "dv-" + hexid(8)
    l2 = add_login(at(3, 1, 25, 20), v2["account_id"], ip2, dv2, "success", "sms")
    rc2 = add_recovery(at(3, 1, 31, 0), v2["account_id"], ip2, dv2, "sms", "success", "auto", at(3, 1, 34, 0))
    e3 = add_event(at(3, 1, 40, 0), v2["account_id"], "mfa_reset", ip2, dv2)
    ad2 = addr("s1:v2:out")
    e4 = add_event(at(3, 1, 55, 0), v2["account_id"], "add_withdraw_address", ip2, dv2, "addr=" + ad2[:12])
    emit_deposit(at(2, 18, 0), v2["account_id"], "ETH", 9400, "s1v2", "ETH")
    w2 = emit_withdrawal(at(3, 4, 30, 0), v2["account_id"], "ETH", 9200, ad2, at(3, 1, 55, 0), status="frozen", ref="S1-02:wd", chain="ETH")
    # V3：低慢撞库（Mar 9 06:00-14:00，40 个账户 2 个 IP），改绑 + 找回，22 小时后提币
    ips3 = ["203.0.113.31", "203.0.113.32"]
    tg3 = [a for a in R.sample(ACC_LIST, 80) if not a["special"]][:39] + [v3]
    for a in tg3:
        add_login(at(8, 6, 0) + timedelta(seconds=R.randint(0, 8 * 3600)), a["account_id"], R.choice(ips3), "dv-bot-31", "failed_password", "none")
    dv3 = "dv-" + hexid(8)
    emit_deposit(at(7, 12, 0), v3["account_id"], "USDT", 25500, "s1v3", "TRON")
    l3 = add_login(at(8, 14, 10, 22), v3["account_id"], ips3[0], dv3, "success", "recovery_flow")
    rc3 = add_recovery(at(8, 14, 20, 0), v3["account_id"], ips3[0], dv3, "email", "success", "manual", at(8, 14, 30, 0))
    e5 = add_event(at(8, 14, 35, 0), v3["account_id"], "mfa_reset", ips3[0], dv3)
    ad3 = addr("s1:v3:out")
    e6 = add_event(at(8, 14, 50, 0), v3["account_id"], "add_withdraw_address", ips3[0], dv3, "addr=" + ad3[:12])
    w3 = emit_withdrawal(at(9, 12, 40, 0), v3["account_id"], "USDT", 25000, ad3, at(8, 14, 50, 0), ref="S1-03:wd", chain="TRON", approver="ST033", approval_delay=2400)
    positive("S1-01", "S1", "无 MFA 账户撞库成功后改绑并提币", (at(3, 1, 0), at(3, 2, 0)), {"account_id": [v1["account_id"]], "wd_id": [lambda w=w1: w["wd_id"]], "ip": ATT},
             "撞库活动 1 命中；改手机 -> 加新地址 -> 28 分钟后提走 18,400 USDT（已完成）。",
             {"logins": [l1], "account_events": [e1, e2], "withdrawals": [w1]})
    positive("S1-02", "S1", "短信找回后加新地址提币，被风控冻结", (at(3, 1, 20), at(3, 5, 0)), {"account_id": [v2["account_id"]], "wd_id": [lambda w=w2: w["wd_id"]], "ip": ATT},
             "撞库活动 1 命中；短信找回成功 -> 重置 MFA -> 加新地址 -> 3 小时后申请提 9,200 美元等值 ETH，状态 frozen。",
             {"logins": [l2], "recoveries": [rc2], "account_events": [e3, e4], "withdrawals": [w2]})
    positive("S1-03", "S1", "低慢撞库，找回后 22 小时提币", (at(8, 6, 0), at(9, 14, 0)), {"account_id": [v3["account_id"]], "wd_id": [lambda w=w3: w["wd_id"]], "ip": ips3},
             "40 个账户 8 小时内由 2 个 IP 慢速尝试，不触发撞库阈值；找回 + 改 MFA + 新地址，22 小时后提 25,000 USDT（已完成，人工审批 1 人）。",
             {"logins": [l3], "recoveries": [rc3], "account_events": [e5, e6], "withdrawals": [w3]})

    # ---- S9 噪声：S1 周围
    # 8 个正常用户：找回成功后 2-20 小时内提币 >= 1000，地址是老地址
    cand = [a for a in POOL[-40:]]
    for k in range(8):
        a = POOL.pop()
        a["special"] = True
        t = rand_ts(1, 12, TZ[a["country"]])
        dv = new_dev()
        rc = add_recovery(t, a["account_id"], a["ips"][0], dv, R.choice(["email", "sms"]), "success", "auto", t + timedelta(minutes=10))
        emit_deposit(t - timedelta(days=1), a["account_id"], "USDT", 3000 + R.randint(0, 3000), "s9r%d" % k)
        w = emit_withdrawal(t + timedelta(hours=R.randint(2, 20)), a["account_id"], "USDT", R.randint(1200, 2800), a["addrs"][0][0], a["addrs"][0][1])
        decoy("S9-S1-R%02d" % (k + 1), "S1", "legit_recovery_then_withdraw", {"account_id": [a["account_id"]], "wd_id": [lambda w=w: w["wd_id"]]},
              "真实用户换手机找回账号，随后用老地址提币；提币地址已存在 5 天以上，设备是找回时登记的同一台", evidence={"recoveries": [rc], "withdrawals": [w]})
    # 3 个正常用户：换手机的同时整理地址簿，之后很久才使用
    for k in range(3):
        a = POOL.pop()
        a["special"] = True
        t = rand_ts(1, 10, TZ[a["country"]])
        dv = a["devs"][0]
        e1_ = add_event(t, a["account_id"], "phone_change", a["ips"][0], dv)
        ad = addr("s9:addr:%d" % k)
        e2_ = add_event(t + timedelta(minutes=R.randint(3, 20)), a["account_id"], "add_withdraw_address", a["ips"][0], dv, "addr=" + ad[:12])
        a["addrs"].append((ad, t))
        decoy("S9-S1-P%02d" % (k + 1), "S1", "legit_phone_change_then_add_address", {"account_id": [a["account_id"]]},
              "用户换手机，设备与 IP 都是历史常用的，30 分钟内顺手整理地址簿，之后两天都没有提币", evidence={"account_events": [e1_, e2_]})
    # 办公室 NAT：周一早晨大量输错密码
    nat = "198.18.250.7"
    users = R.sample([a for a in ACC_LIST if not a["special"]], 30)
    t0 = at(7, 9, 0)  # Mar 8 周日？改用周一
    t0 = at(1, 9, 0)  # Mar 2 周一
    for a in users:
        for _ in range(R.choice([2, 2, 3])):
            add_login(t0 + timedelta(seconds=R.randint(0, 540)), a["account_id"], nat, new_dev(), "failed_password")
        add_login(t0 + timedelta(minutes=R.randint(11, 40)), a["account_id"], nat, new_dev(), "success")
    decoy("S9-S1-NAT", "S1", "office_nat_failures", {"ip": [nat]}, "一家合作公司办公室共用出口 IP，周一早晨 30 人集中输错密码后成功登录", window={"start": iso(t0), "end": iso(t0 + timedelta(hours=1))})


def s2(keys):
    """API Key 滥用。"""
    # S2-01：已有 key 的受害账户，开提币权限 -> 新 IP 调用 -> 提币
    kv = [k for k in keys if k["perms"] == "read,trade"][0]
    acct = kv["acct"]
    atk = "198.51.100.21"
    dv = "dv-" + hexid(8)
    ev = add_event(at(5, 3, 5), acct, "api_key_perm_add", atk, dv, "key=%s;perm=withdraw" % kv["id"])
    ad = addr("s2:01:out")
    ev2 = add_event(at(5, 3, 2), acct, "add_withdraw_address", atk, dv, "addr=" + ad[:12])
    calls = []
    for k, off in enumerate((4, 9, 10)):
        calls.append(add("api_calls", ts=iso(at(5, 3, off, 5)), key_id=kv["id"], account_id=acct, ip=atk, perm_used="withdraw" if k else "read",
                         action="create_withdrawal" if k else "get_balance", result="ok", _ts=iso(at(5, 3, off))))
    emit_deposit(at(4, 20, 0), acct, "USDT", 13500, "s2a")
    wa = emit_withdrawal(at(5, 3, 9, 20), acct, "USDT", 6500, ad, at(5, 3, 2), channel="api", key_id=kv["id"], ref="S2-01:wa", chain="ETH")
    wb = emit_withdrawal(at(5, 3, 10, 20), acct, "USDT", 6400, ad, at(5, 3, 2), channel="api", key_id=kv["id"], ref="S2-01:wb", chain="ETH")
    positive("S2-01", "S2", "已有 Key 被加上提币权限，从新 IP 调用", (at(5, 3, 0), at(5, 4, 0)),
             {"key_id": [kv["id"]], "account_id": [acct], "ip": [atk], "wd_id": [lambda w=wa: w["wd_id"], lambda w=wb: w["wd_id"]]},
             "Key 原为 read,trade，无 IP 白名单；3:05 从陌生设备加提币权限，3:09 和 3:10 从 198.51.100.21 两次 create_withdrawal，合计 12,900 USDT（已完成）。",
             {"account_events": [ev2, ev], "api_calls": calls, "withdrawals": [wa, wb]})
    # S2-02：新建 Key 带提币权限，无白名单，3 个新 IP，提币被拒绝（新地址延迟）
    a2 = [a for a in POOL[-30:] if not a["special"]][0]
    POOL.remove(a2)
    a2["special"] = True
    acct2 = a2["account_id"]
    kid = "K9001"
    atk2 = ["198.51.100.%d" % i for i in (45, 46, 47)]
    dv2 = "dv-" + hexid(8)
    ls = add_login(at(10, 22, 30), acct2, atk2[0], dv2, "success", "sms")
    ev3 = add_event(at(10, 22, 41), acct2, "create_api_key", atk2[0], dv2, "key=%s;perms=read,trade,withdraw;allowlist=" % kid)
    add("api_keys", key_id=kid, account_id=acct2, created_ts=iso(at(10, 22, 41)), perms="read,trade,withdraw", ip_allowlist="", status="active", _ts=iso(at(10, 22, 41)))
    calls2 = []
    for k, ip in enumerate(atk2):
        for off in range(3):
            calls2.append(add("api_calls", ts=iso(at(10, 22, 45 + k * 3, off * 10)), key_id=kid, account_id=acct2, ip=ip,
                              perm_used="withdraw" if (k == 2 and off == 2) else "read", action="create_withdrawal" if (k == 2 and off == 2) else "get_balance", result="ok", _ts=iso(at(10, 22, 45))))
    emit_deposit(at(10, 20, 0), acct2, "USDT", 3300, "s2b")
    wc = emit_withdrawal(at(10, 22, 55, 20), acct2, "USDT", 3100, addr("s2:02:out"), at(10, 22, 50), status="rejected", channel="api", key_id=kid, ref="S2-02:wc", chain="TRON")
    positive("S2-02", "S2", "新建带提币权限且无白名单的 Key，三个新 IP 轮换", (at(10, 22, 30), at(10, 23, 30)),
             {"key_id": [kid], "account_id": [acct2], "ip": atk2, "wd_id": [lambda w=wc: w["wd_id"]]},
             "登录后 11 分钟创建 Key（read,trade,withdraw，白名单为空），12 分钟内从 3 个 IP 调用，最后一次 create_withdrawal 3,100 USDT 被新地址延迟规则拒绝。",
             {"logins": [ls], "account_events": [ev3], "api_calls": calls2, "withdrawals": [wc]})
    # ---- 噪声
    # 4 个 key 迁移了服务器（新 IP，但没有提币权限变更）
    for k, ky in enumerate(MIG):
        decoy("S9-S2-M%d" % (k + 1), "S2", "key_server_migration", {"key_id": [ky["id"]]}, "机器人迁移到新云主机，调用 IP 变了；权限没有变更，调用只有 read / trade", window={"start": iso(at(6 + k, 0)), "end": iso(at(DAYS, 0))}, match_window=False)
    # 两个机构 Key 开提币权限，来自白名单内的老 IP，账户所有者本人从常用设备操作
    inst = [k for k in keys if k["perms"] == "read,trade,withdraw"][:2]
    for k, ky in enumerate(inst):
        a = ACC[ky["acct"]]
        e_ = add_event(at(2 + k * 4, 9, 20), a["account_id"], "api_key_perm_add", a["ips"][0], a["devs"][0], "key=%s;perm=withdraw;ticket=CHG-%d" % (ky["id"], 100 + k))
        decoy("S9-S2-P%d" % (k + 1), "S2", "legit_perm_add", {"key_id": [ky["id"]]}, "账户所有者从常用设备与常用 IP 给 Key 加提币权限，Key 带 IP 白名单，之后调用仍来自白名单 IP", evidence={"account_events": [e_]})


def s3():
    """洗钱漏斗。"""
    # 漏斗 A：9 个新账户小额入金 -> 内部转账给归集账户 -> 3 个地址快速提走
    mules = take(9, new=True)
    coll = take(1, kyc=1)[0]
    coll["tag"] = "new_user"
    coll["reg"] = START - timedelta(days=6)
    evid = {"deposits": [], "internal_transfers": [], "withdrawals": []}
    tot = 0.0
    for k, m in enumerate(mules):
        t = at(7, 9, 0) + timedelta(minutes=k * 38 + R.randint(0, 20))
        usd = R.randint(2000, 2900)
        tot += usd
        evid["deposits"].append(emit_deposit(t, m["account_id"], "USDT", usd, "s3a%d" % k, "TRON"))
        evid["internal_transfers"].append(emit_internal(t + timedelta(minutes=R.randint(10, 30)), m["account_id"], coll["account_id"], "USDT", usd - 2))
    outs = [addr("s3:a:out%d" % i) for i in range(3)]
    ws = []
    t0 = at(7, 15, 30)
    share = tot * 0.95 / 3
    for k, o in enumerate(outs):
        ws.append(emit_withdrawal(t0 + timedelta(minutes=k * 12), coll["account_id"], "USDT", share, o, t0 - timedelta(minutes=40 - k), chain="TRON", ref="S3-01:w%d" % k))
    evid["withdrawals"] = ws
    positive("S3-01", "S3", "漏斗：9 个新账户小额入金汇聚到 1 个账户，3 个地址提走", (at(7, 9, 0), at(7, 17, 0)),
             {"account_id": [coll["account_id"]] + [m["account_id"] for m in mules], "wd_id": [lambda w=w: w["wd_id"] for w in ws][:0] or [lambda w=w: w["wd_id"] for w in ws]},
             "9 个注册不足 10 天的 KYC1 账户各入金 2,000–2,900 USDT（总计约 %d），内部转给归集账户 %s，约 6 小时后 3 个新地址分三笔提走约 %.0f%%。" % (tot, coll["account_id"], 95),
             {"chain_txs": evid["deposits"], "internal_transfer_refs": evid["internal_transfers"], "withdrawals": ws})
    # 漏斗 B：两个归集账户各收 6 笔 1.1–1.9k 的入金，90 分钟内整笔提走（总额低于 20k 阈值）
    for j, (cc, day) in enumerate([(take(1, kyc=1)[0], 12), (take(1, kyc=1)[0], 12)]):
        cc["tag"] = "new_user"
        cc["reg"] = START - timedelta(days=4)
        deps = []
        tot = 0
        for k in range(6):
            usd = R.randint(1100, 1900)
            tot += usd
            deps.append(emit_deposit(at(day, 8 + j * 3, 0) + timedelta(minutes=k * 22 + R.randint(0, 10)), cc["account_id"], "USDT", usd, "s3b%d%d" % (j, k), "ETH"))
        o = addr("s3:b:out%d" % j)
        t = at(day, 8 + j * 3, 0) + timedelta(minutes=150)
        w = emit_withdrawal(t, cc["account_id"], "USDT", tot * 0.97, o, t - timedelta(minutes=30), ref="S3-0%d:w" % (j + 2), chain="ETH")
        positive("S3-0%d" % (j + 2), "S3", "漏斗：6 笔小额入金后整笔提走（低于 20k）", (at(day, 8 + j * 3, 0), at(day, 13 + j * 3, 0)),
                 {"account_id": [cc["account_id"]], "wd_id": [lambda w=w: w["wd_id"]]},
                 "新账户 6 笔 1,100–1,900 USDT 入金（来源地址互不相同），入金总额 %d USDT，约 2.5 小时后单笔提走 97%%；总额低于“24 小时 20,000”的阈值，需要调参才能召回。" % tot,
                 {"chain_txs": deps, "withdrawals": [w]})
    # ---- 噪声：做市商 / 机构 / 清户用户，快进快出
    mm = [a for a in ACC_LIST if a["tag"] == "market_maker"]
    ins = [a for a in ACC_LIST if a["tag"] == "institution"]
    nz = []
    for k, a in enumerate(mm[2:4]):
        ws_ = []
        for d in (3 + k, 8 + k):
            emit_deposit(at(d, 6, 0), a["account_id"], "USDT", 300000, "mm%d%d" % (k, d), "ETH")
            for j in range(3):
                t = at(d, 7 + j, 20)
                ws_.append(emit_withdrawal(t, a["account_id"], "USDT", 97000, addr("mm:%d:%d" % (k, j)), START - timedelta(days=200), chain="ETH", approver="ST031,ST032"))
        decoy("S9-S3-M%d" % (k + 1), "S3", "market_maker_turnover", {"account_id": [a["account_id"]]}, "登记在册的做市商，资金每日周转，出金到固定的 3 个老地址", evidence={"withdrawals": ws_})
    for k, a in enumerate(ins[:3]):
        d = 5 + k
        emit_deposit(at(d, 9, 0), a["account_id"], "USDT", 31000, "ins%d" % k, "ETH")
        ws_ = [emit_withdrawal(at(d, 10, 30 + j * 5), a["account_id"], "USDT", 9000, addr("ins:%d:%d" % (k, j)), START - timedelta(days=150), chain="ETH", approver="ST031,ST032") for j in range(3)]
        decoy("S9-S3-I%d" % (k + 1), "S3", "institution_settlement", {"account_id": [a["account_id"]]}, "机构账户日常结算，入金 31,000 USDT 后拆给 3 个已登记的收款地址", evidence={"withdrawals": ws_})
    for k in range(2):  # 清户的普通用户：KYC 低，入金后拆多个地址提走
        a = take(1, kyc=1)[0]
        d = 9 + k * 2
        emit_deposit(at(d, 10, 0), a["account_id"], "USDT", 24000, "close%d" % k, "ETH")
        ws_ = [emit_withdrawal(at(d, 12, j * 8), a["account_id"], "USDT", 7900, None, None, chain="ETH") for j in range(3)]
        for wsx in ws_:
            pass
        for adr in a["addrs"]:
            pass
        decoy("S9-S3-C%d" % (k + 1), "S3", "retail_account_closing", {"account_id": [a["account_id"]]}, "用户出售资产后一次性清户，提到自己地址簿里的老地址", evidence={"withdrawals": ws_})


def s4(traders):
    """对敲与操纵。"""
    # 环 A：XYZ，3 个账户，两个同 IP，第三个同设备，2 小时 90 笔环形成交
    ring = take(3)
    ipa, ipb = home_ip(), home_ip()
    ring_ips = [ipa, ipa, ipb]
    dvr = new_dev()
    for k, a in enumerate(ring):
        a["ips"][0] = ring_ips[k]
        a["devs"][0] = dvr if k < 2 else new_dev()
        a["devs"].append(dvr)
    trs = []
    t0 = at(5, 2, 10)
    for k in range(90):
        b, s = ring[(k + 1) % 3], ring[k % 3]
        ts = t0 + timedelta(seconds=k * 80 + R.randint(0, 40))
        trs.append(emit_trade(ts, "XYZ-USDT", b, s, px("XYZ-USDT", ts) * (1 + R.gauss(0, 0.0004)), R.randint(3000, 5000),
                              (b["ips"][0], s["ips"][0]), (dvr, dvr)))
    for a in ring:
        emit_deposit(at(4, 22, 0), a["account_id"], "USDT", 15000, "s4a" + a["account_id"], "ETH")
        add_login(at(5, 1, 50), a["account_id"], a["ips"][0], a["devs"][0])
    positive("S4-01", "S4", "XYZ-USDT 三账户环形对敲刷量", (t0, t0 + timedelta(minutes=125)),
             {"account_id": [a["account_id"] for a in ring], "ip": [ipa, ipb]},
             "3 个账户（2 个共 IP + 设备，第 3 个共设备）在 2 小时内互为买卖双方 90 笔，每笔 3–5k 美元，合计约 36 万美元，XYZ 日常日成交约 3 万；价格贴着指数。",
             {"orders_trades": trs})
    POS[-1]["match_window"] = False
    # 环 B：ETH-USDT，4 个账户，一整天，120 笔，涉及 3 个同 IP 账户
    rb = take(4)
    ipc = home_ip()
    for k, a in enumerate(rb):
        if k < 3:
            a["ips"][0] = ipc
    trs2 = []
    for k in range(120):
        b, s = R.sample(rb, 2)
        ts = at(9, 6, 0) + timedelta(seconds=R.randint(0, 16 * 3600))
        trs2.append(emit_trade(ts, "ETH-USDT", b, s, px("ETH-USDT", ts) * (1 + R.gauss(0, 0.0003)), R.randint(8000, 14000), (b["ips"][0], s["ips"][0])))
    for a in rb:
        emit_deposit(at(8, 20, 0), a["account_id"], "USDT", 40000, "s4b" + a["account_id"], "ETH")
    positive("S4-02", "S4", "ETH-USDT 四账户全天对敲（刷手续费返佣）", (at(9, 6, 0), at(9, 22, 0)),
             {"account_id": [a["account_id"] for a in rb], "ip": [ipc]},
             "4 个账户（3 个共 IP）全天互相成交 120 笔，每笔 8–14k 美元，合计约 130 万美元，对手方集中在这 4 个账户内。",
             {"orders_trades": trs2})
    # S4-03：ABC-USDT 标记价偏离，2 个账户 20 分钟内连续高价成交
    p1, p2 = take(2)
    tw = at(11, 13, 30)
    trs3 = []
    devs = [0.06, 0.11, 0.15, 0.14, 0.09, 0.05]
    i0 = step_of(tw)
    marks = REFS["marks_ABC-USDT"]
    for k, dv in enumerate(devs):
        r = marks[i0 + k]
        r["mark_price"] = round(r["index_price"] * (1 + dv), 4)
    for k in range(14):
        ts = tw + timedelta(seconds=90 * k + R.randint(0, 40))
        dv = devs[min(5, k // 2)]
        trs3.append(emit_trade(ts, "ABC-USDT", p1 if k % 2 == 0 else p2, p2 if k % 2 == 0 else p1, px("ABC-USDT", ts) * (1 + dv), R.randint(500, 1500)))
    for a in (p1, p2):
        emit_deposit(at(11, 12, 0), a["account_id"], "USDT", 20000, "s4c" + a["account_id"], "ETH")
    positive("S4-03", "S4", "ABC-USDT 标记价偏离指数 5%–15%（持续 30 分钟）", (tw, tw + timedelta(minutes=30)),
             {"symbol": ["ABC-USDT"], "account_id": [p1["account_id"], p2["account_id"]]},
             "两个账户在薄盘的 ABC-USDT 上连续以高于指数 6%–15% 的价格互相成交 14 笔，标记价随之偏离指数，连续 6 个 5 分钟采样点 >= 5%，来源数为 3。",
             {"orders_trades": trs3, "marks": [{"ts": marks[i0 + k]["ts"], "symbol": "ABC-USDT"} for k in range(6)]})
    POS[-1]["match_window"] = True
    # ---- 噪声
    mm = [a for a in ACC_LIST if a["tag"] == "market_maker"]
    shared = "198.18.99.9"
    for a in mm[:2]:
        a["ips"][0] = shared
        a["devs"][0] = "dv-mmco-" + a["account_id"][-2:]
    trm = []
    for k in range(140):
        ts = at(R.randint(0, DAYS - 1), R.randint(0, 23), R.randrange(60), R.randrange(60))
        b, s = (mm[0], mm[1]) if k % 2 else (mm[1], mm[0])
        trm.append(emit_trade(ts, "ETH-USDT", b, s, px("ETH-USDT", ts), R.randint(2000, 9000), (shared, shared)))
    decoy("S9-S4-M1", "S4", "market_maker_internal_flow", {"account_id": [mm[0]["account_id"], mm[1]["account_id"]], "ip": [shared]},
          "同一家做市商的两个账户在同一机房互相对冲库存，成交分散在整个 14 天，且登记为 market_maker", evidence={"orders_trades": trm})
    fam = take(2)
    fam[1]["ips"][0] = fam[0]["ips"][0]
    fam[1]["devs"][0] = fam[0]["devs"][0]
    trf = []
    for k in range(3):
        ts = at(3 + k, 12, 5)
        trf.append(emit_trade(ts, "BTC-USDT", fam[0], fam[1], px("BTC-USDT", ts), 700, (fam[0]["ips"][0], fam[1]["ips"][0]), (fam[0]["devs"][0], fam[1]["devs"][0])))
    decoy("S9-S4-F1", "S4", "family_shared_device", {"account_id": [fam[0]["account_id"], fam[1]["account_id"]]}, "同一家庭共用一台电脑的两个账户，3 笔小额成交，没有持续性", evidence={"orders_trades": trf})
    marks_e = REFS["marks_ETH-USDT"]
    i = step_of(at(4, 16, 0))
    marks_e[i]["mark_price"] = round(marks_e[i]["index_price"] * 1.053, 4)
    decoy("S9-S4-SP", "S4", "news_spike_single_row", {"symbol": ["ETH-USDT"]}, "重大消息引发的 5 分钟尖峰，标记价偏离指数 5.3%，只持续一个采样点，没有对应的异常成交",
          window={"start": iso(at(4, 16, 0)), "end": iso(at(4, 16, 5))}, match_window=True)
    marks_x = REFS["marks_XYZ-USDT"]
    i = step_of(at(2, 8, 0))
    for k in range(2):
        marks_x[i + k]["mark_price"] = round(marks_x[i + k]["index_price"] * 1.09, 4)
        marks_x[i + k]["source_count"] = 1
    decoy("S9-S4-GL", "S4", "price_source_glitch", {"symbol": ["XYZ-USDT"]}, "外部行情源故障，只剩 1 个来源，标记价偏离 9%，持续 10 分钟；来源数不足时本就暂停开新仓",
          window={"start": iso(at(2, 8, 0)), "end": iso(at(2, 8, 10))}, match_window=True)


def s5(tick):
    """内部人批量查看。"""
    # S5-01 ST007 周六 02:07 – 03:41，186 笔 KYC 查看，无工单
    rows1 = []
    t = at(6, 2, 7)
    for k in range(186):
        ts = t + timedelta(seconds=int(k * 30.2) + R.randint(0, 10))
        rows1.append(add("support_access", ts=iso(ts), staff_id="ST007", action="view_kyc", target_account_id=R.choice(ACC_LIST)["account_id"],
                         field_group="kyc_document", ticket_id="", ip="100.88.14.201", _ts=iso(ts)))
    positive("S5-01", "S5", "客服在周六凌晨批量查看 KYC 证件（无工单）", (t, t + timedelta(minutes=95)), {"staff_id": ["ST007"]},
             "ST007 在周六 02:07–03:41 从非办公 IP 100.88.14.201 查看 186 个账户的 KYC 证件，全部没有工单号；该客服平时每个工作日约 30 条且均有工单。",
             {"support_access": [rows1[0], rows1[-1]]})
    t = at(10, 23, 48)
    rows2 = []
    for k in range(74):
        ts = t + timedelta(seconds=int(k * 35) + R.randint(0, 10))
        rows2.append(add("support_access", ts=iso(ts), staff_id="ST011", action="view_kyc", target_account_id=R.choice(ACC_LIST)["account_id"],
                         field_group="kyc_document", ticket_id="", ip="100.88.14.77", _ts=iso(ts)))
    ex = add("support_access", ts=iso(t + timedelta(minutes=46)), staff_id="ST011", action="export_kyc", target_account_id="BULK-74", field_group="kyc_document",
             ticket_id="", ip="100.88.14.77", _ts=iso(t))
    positive("S5-02", "S5", "客服深夜查看 74 个账户并导出 KYC", (t, t + timedelta(minutes=50)), {"staff_id": ["ST011"]},
             "ST011 在周三 23:48 起 46 分钟内查看 74 个账户的 KYC，随后执行一次 export_kyc（导出 74 个账户），均无工单；总量低于“60 个 / 小时”的朴素阈值，需要结合无工单与非办公时段才召回。",
             {"support_access": [rows2[0], ex]})
    # ---- 噪声
    t = at(4, 11, 0)  # 周四合规集中复核
    for k in range(95):
        ts = t + timedelta(seconds=int(k * 113) + R.randint(0, 20))
        add("support_access", ts=iso(ts), staff_id="ST003", action="view_kyc", target_account_id=R.choice(ACC_LIST)["account_id"],
            field_group="kyc_document", ticket_id="COMP-2026-014", ip=corp_ip(), _ts=iso(ts))
    decoy("S9-S5-C1", "S5", "compliance_campaign", {"staff_id": ["ST003"]}, "合规集中复核（工单 COMP-2026-014），白天办公 IP，95 个账户，均有工单", window={"start": iso(t), "end": iso(t + timedelta(hours=3))})
    for d in (1, 5, 9):  # 夜班客服某晚处理活动工单，量大
        for k in range(70):
            ts = at(d, 23, 0) + timedelta(seconds=int(k * 150) + R.randint(0, 20))
            add("support_access", ts=iso(ts), staff_id="ST012", action="view_kyc", target_account_id=R.choice(ACC_LIST)["account_id"],
                field_group="kyc_document", ticket_id=tick(), ip=corp_ip(), _ts=iso(ts))
    decoy("S9-S5-N1", "S5", "night_shift_ticketed", {"staff_id": ["ST012"]}, "夜班客服，非办公时段本来就是工作时间；三个晚上各看 70 个账户，均有各自工单、办公 IP")
    t = at(8, 14, 0)  # 周一，值班主管峰值
    for k in range(80):
        ts = t + timedelta(seconds=int(k * 45) + R.randint(0, 10))
        add("support_access", ts=iso(ts), staff_id="ST001", action="view_profile", target_account_id=R.choice(ACC_LIST)["account_id"],
            field_group="profile", ticket_id=tick(), ip=corp_ip(), _ts=iso(ts))
    decoy("S9-S5-L1", "S5", "supervisor_peak", {"staff_id": ["ST001"]}, "客服主管在上线事故期间一小时看 80 个账户资料，有工单，办公 IP，只读基础资料而非证件", window={"start": iso(t), "end": iso(t + timedelta(hours=1))})
    # 治理发现：已离职员工仍有 kyc_read 且有一次访问；ST050 的 prod_exec 已过期仍使用
    ts = at(6, 15, 0)
    add("support_access", ts=iso(ts), staff_id="ST015", action="view_kyc", target_account_id=R.choice(ACC_LIST)["account_id"], field_group="kyc_document", ticket_id="", ip="100.88.20.3", _ts=iso(ts))


def s6(transfer):
    """签名服务异常。"""
    atk_to = [addr("s6:atk:%d" % i) for i in range(3)]
    # S6-01：热钱包签名请求没有审批单（执行了）
    t = at(5, 16, 20)
    amt = fmt_amt("ETH", 48000 / usd_price("ETH", t))
    sr1 = emit_signing(t, "hot-withdraw-svc", "svc-withdraw", "hot", "ETH", "ETH", atk_to[0], amt, amt * usd_price("ETH", t), "")
    th = txh("s6:1")
    add("chain_txs", tx_hash=th, ts=iso(t + timedelta(seconds=60)), chain="ETH", asset="ETH", from_addr=wallet("hot", "ETH"), to_addr=atk_to[0], from_tier="hot",
        to_tier="external", amount=amt, amount_usd=round(amt * usd_price("ETH", t), 2), kind="withdrawal", wd_id="", account_id="", request_id=lambda s=sr1: s["request_id"], _ts=iso(t))
    positive("S6-01", "S6", "热钱包签名请求没有审批单，链上已转出", (t, t + timedelta(minutes=5)),
             {"request_id": [lambda s=sr1: s["request_id"]], "to_address": [atk_to[0]], "tx_hash": [th]},
             "hot-withdraw-svc 在 16:20 提交 %s ETH（约 48,000 美元）到 %s...，approval_id 为空，签名服务照签并上链；链上这笔转出没有对应的提币申请（wd_id 为空）。" % (amt, atk_to[0][:10]),
             {"signing_requests": [sr1], "chain_txs": [th]})
    # S6-02：审批单属于一笔正常的 150 USDT 提币，但请求的目标地址与金额都变了
    base = emit_withdrawal(at(8, 20, 55), R.choice([a for a in ACC_LIST if not a["special"]])["account_id"], "USDT", 150, ref="S6-02:base", chain="ETH")
    t = at(8, 21, 5)
    sr2 = emit_signing(t, "hot-withdraw-svc", "svc-withdraw", "hot", "ETH", "USDT", atk_to[1], 60000.0, 60000.0, base["approval_id"])
    th2 = txh("s6:2")
    add("chain_txs", tx_hash=th2, ts=iso(t + timedelta(seconds=45)), chain="ETH", asset="USDT", from_addr=wallet("hot", "ETH"), to_addr=atk_to[1], from_tier="hot",
        to_tier="external", amount=60000.0, amount_usd=60000.0, kind="withdrawal", wd_id="", account_id="", request_id=lambda s=sr2: s["request_id"], _ts=iso(t))
    positive("S6-02", "S6", "审批单被借用：目标地址与金额都与审批单不一致", (t, t + timedelta(minutes=5)),
             {"request_id": [lambda s=sr2: s["request_id"]], "to_address": [atk_to[1]], "tx_hash": [th2], "approval_id": [lambda b=base: b["approval_id"]]},
             "签名请求引用一张 150 USDT 的正常提币审批单，但目标地址换成陌生地址、金额改成 60,000 USDT，签名服务照签并上链。",
             {"signing_requests": [sr2], "chain_txs": [th2], "withdrawals": [base]})
    # S6-03：温 -> 热 调拨审批的目标是热钱包，请求的目标是陌生地址（金额一致）
    t = at(11, 2, 15)
    sr3, aid = transfer(t, "warm", "hot", "ETH", "USDT", 250000, "ST031,ST032", 2, to=atk_to[2], approved_ts=at(11, 1, 40))
    positive("S6-03", "S6", "调拨审批的目标地址被换成陌生地址（金额一致）", (t, t + timedelta(minutes=5)),
             {"request_id": [lambda s=sr3: s["request_id"]], "to_address": [atk_to[2]], "approval_id": [aid]},
             "treasury-transfer 在凌晨 02:15 请求温钱包转 250,000 USDT；审批单 %s 批准的目标是热钱包，请求里的目标是陌生地址，金额与审批一致，因此只看“有无审批单”或“金额是否超限”都会漏掉。" % aid,
             {"signing_requests": [sr3]})
    # ---- 噪声
    # 4 笔：地址大小写不同（校验和写法）
    for k in range(4):
        a = R.choice([a for a in ACC_LIST if not a["special"]])
        t = at(R.randint(1, 12), R.randint(9, 17), R.randrange(60))
        ad, added = a["addrs"][0]
        w = emit_withdrawal(t, a["account_id"], "USDT", R.randint(300, 900), ad, added, chain="ETH")
        sr = w["_sr"]
        mixed = "0x" + "".join(c.upper() if (i % 3 == 0 and c.isalpha()) else c for i, c in enumerate(ad[2:]))
        sr["to_address"] = mixed
        decoy("S9-S6-C%d" % (k + 1), "S6", "address_case_difference", {"request_id": [lambda s=sr: s["request_id"]]}, "签名请求用校验和大小写，审批单用小写，地址相同；比较前要统一大小写")
    # 3 笔：重试（同一审批单、同一内容请求两次）
    for k in range(3):
        a = R.choice([a for a in ACC_LIST if not a["special"]])
        t = at(R.randint(1, 12), R.randint(9, 17), R.randrange(60))
        ad, added = a["addrs"][0]
        w = emit_withdrawal(t, a["account_id"], "USDT", R.randint(300, 900), ad, added, chain="ETH")
        o = w["_sr"]
        sr = add("signing_requests", ts=o["ts"], source=o["source"], requester=o["requester"], wallet_tier="hot", chain="ETH", asset="USDT", to_address=o["to_address"],
                 amount=o["amount"], amount_usd=o["amount_usd"], approval_id=o["approval_id"], calldata_hash=o["calldata_hash"], signer_result="rejected_duplicate", _ts=o["_ts"])
        sr["ts"] = iso(datetime.strptime(o["ts"], "%Y-%m-%dT%H:%M:%SZ") + timedelta(seconds=30))
        sr["_ts"] = sr["ts"]
        decoy("S9-S6-R%d" % (k + 1), "S6", "retry_duplicate_request", {"request_id": [lambda s=sr: s["request_id"]]}, "网络超时后的重试，同一审批单同一内容再请求一次，签名服务已按幂等拒绝（rejected_duplicate）")
    # 2 笔：紧急调拨，审批在请求之后 6 分钟补签
    for k in range(2):
        t = at(3 + k * 5, 23, 10)
        amt = 60000
        aid = "AP-E%03d" % (k + 1)
        sr = emit_signing(t, "treasury-transfer", "svc-treasury", "warm", "ETH", "USDT", wallet("hot", "ETH"), float(amt), float(amt), aid)
        add("approvals", ts=iso(t + timedelta(minutes=6)), type="treasury_transfer", subject_id="EMG%03d" % (k + 1), to_address=wallet("hot", "ETH"), asset="USDT",
            amount=float(amt), approved_by="ST031,ST032", approver_count=2, status="approved_post_hoc", approval_id=aid, _ts=iso(t))
        decoy("S9-S6-E%d" % (k + 1), "S6", "emergency_post_hoc_approval", {"request_id": [lambda s=sr: s["request_id"]], "approval_id": [aid]}, "热钱包水位告急的紧急调拨，值班按应急流程先请求、6 分钟内补签审批，状态为 approved_post_hoc，事后复核通过")
        th = txh("s6e:%d" % k)
        add("chain_txs", tx_hash=th, ts=iso(t + timedelta(minutes=7)), chain="ETH", asset="USDT", from_addr=wallet("warm", "ETH"), to_addr=wallet("hot", "ETH"),
            from_tier="warm", to_tier="hot", amount=float(amt), amount_usd=float(amt), kind="rebalance", wd_id="", account_id="", request_id=lambda s=sr: s["request_id"], _ts=iso(t))
    # 3 笔：实际金额小于审批金额（部分执行）
    for k in range(3):
        a = R.choice([a for a in ACC_LIST if not a["special"]])
        t = at(R.randint(1, 12), R.randint(9, 17), R.randrange(60))
        ad, added = a["addrs"][0]
        w = emit_withdrawal(t, a["account_id"], "USDT", 900, ad, added, chain="ETH")
        sr = w["_sr"]
        sr["amount"] = 880.0
        sr["amount_usd"] = 880.0
        decoy("S9-S6-P%d" % (k + 1), "S6", "partial_amount", {"request_id": [lambda s=sr: s["request_id"]]}, "请求金额小于审批金额（扣除链上手续费后的净额），目标地址与审批一致；只应在请求金额大于审批金额时告警")


def s7(devs_staff):
    """开发终端失陷痕迹。"""
    def chain(sid, d, h, m, atk_ip, tun_ip, ok, tag, ev, extra_secret="prod/signing-config"):
        host = "dev-mbp-%s" % sid[2:]
        t = at(d, h, m)
        r = []
        r.append(add("endpoint_events", ts=iso(t), host=host, user=sid, event_type="process_start", image="node", parent_image="npm",
                     cmdline="npm run postinstall", dest_ip="", dest_port="", _ts=iso(t)))
        r.append(add("endpoint_events", ts=iso(t + timedelta(seconds=6)), host=host, user=sid, event_type="process_start", image="rtunnel-agent", parent_image="node",
                     cmdline="rtunnel-agent --relay %s" % tun_ip, dest_ip="", dest_port="", _ts=iso(t)))
        for k in range(5):
            r.append(add("endpoint_events", ts=iso(t + timedelta(seconds=10 + 60 * k)), host=host, user=sid, event_type="net_connect", image="rtunnel-agent", parent_image="node",
                         cmdline="", dest_ip=tun_ip, dest_port=443, _ts=iso(t)))
        c = []
        for k, (act, res, rs) in enumerate([("GetCallerIdentity", "success", ""), ("ListSecrets", "success", ""), ("GetSecretValue", "success", extra_secret)]):
            ts = t + timedelta(minutes=24 + k)
            c.append(add("cloud_audit", ts=iso(ts), identity=sid, identity_type="user", action=act, resource=rs or "arn:synthetic:secretsmanager", source_ip=atk_ip,
                         user_agent="python-requests/2.31.0", result=res, detail={"access_key": "AKSIM" + sid[2:]}, _ts=iso(ts)))
        k8 = []
        ts = t + timedelta(minutes=40)
        k8.append(add("k8s_audit", ts=iso(ts), user=sid, user_type="human", verb="get", resource="secrets", subresource="", namespace="signing", name="signer-keys",
                      source_ip=atk_ip, response_code=200 if ok else 403, annotations={}, _ts=iso(ts)))
        if ok:
            ts = t + timedelta(minutes=44)
            k8.append(add("k8s_audit", ts=iso(ts), user=sid, user_type="human", verb="create", resource="pods", subresource="exec", namespace="signing", name="signer-0",
                          source_ip=atk_ip, response_code=101, annotations={}, _ts=iso(ts)))
        positive(tag, "S7", ev[0], (t, t + timedelta(minutes=50)), {"staff_id": [sid], "host": [host], "ip": [atk_ip, tun_ip]}, ev[1],
                 {"endpoint_events": [r[1]], "cloud_audit": c, "k8s_audit": k8})

    chain("ST021", 8, 11, 2, "198.51.100.77", "203.0.113.77", True, "S7-01", ("开发机拉起外联隧道 -> 云凭证从外部 IP 被使用 -> 签名命名空间 exec",
          "ST021 的开发机 dev-mbp-021 在 npm postinstall 后拉起 rtunnel-agent（向 203.0.113.77:443 持续外联）；24 分钟后该员工的云凭证从 198.51.100.77（非办公出口，UA 为 python-requests）读取 prod/signing-config；40 分钟起访问 signing 命名空间，读取 secret 并 exec 进入 signer-0（成功）。"))
    chain("ST024", 11, 15, 10, "198.51.100.78", "203.0.113.78", False, "S7-02", ("同样的前半段，进入签名命名空间被拒绝",
          "ST024 的开发机 dev-mbp-024 出现同样的外联隧道；云凭证从 198.51.100.78 读取 prod/signing-config；k8s 读取 signing 命名空间 secret 返回 403。属于“失陷已发生但被权限挡住”的事件，仍要召回并处置。"))
    # ---- 噪声：开发者演示用的合法隧道（ngrok / cloudflared）
    for k, sid in enumerate(["ST023", "ST025", "ST026"]):
        host = "dev-mbp-%s" % sid[2:]
        t = at(2 + k * 3, 15, 10)
        add("endpoint_events", ts=iso(t), host=host, user=sid, event_type="process_start", image=["ngrok", "cloudflared", "ngrok"][k], parent_image="zsh", cmdline="%s http 3000" % ["ngrok", "cloudflared", "ngrok"][k], dest_ip="", dest_port="", _ts=iso(t))
        for j in range(4):
            add("endpoint_events", ts=iso(t + timedelta(seconds=20 + 60 * j)), host=host, user=sid, event_type="net_connect", image=["ngrok", "cloudflared", "ngrok"][k], parent_image="zsh",
                cmdline="", dest_ip="198.18.77.%d" % (10 + k), dest_port=443, _ts=iso(t))
        decoy("S9-S7-T%d" % (k + 1), "S7", "dev_demo_tunnel", {"staff_id": [sid]}, "开发者为联调 webhook 临时开的公开隧道工具，之后没有任何云凭证外部使用或签名命名空间访问")
    # 开发者在家用商业 VPN 读 dev 密钥
    for k, sid in enumerate(["ST027", "ST028"]):
        ts = at(4 + k * 5, 21, 30)
        add("cloud_audit", ts=iso(ts), identity=sid, identity_type="user", action="GetSecretValue", resource="dev/db", source_ip="198.18.%d.%d" % (140 + k, 20), user_agent="aws-cli/2.15.30",
            result="success", detail={"access_key": "AKSIM" + sid[2:]}, _ts=iso(ts))
        decoy("S9-S7-V%d" % (k + 1), "S7", "dev_secret_from_vpn", {"staff_id": [sid]}, "开发者晚上在家用商业 VPN 出口读取 dev/db（非生产密钥），UA 是常用的 aws-cli，没有端点外联异常")
    # 值班 SRE 带变更单 exec 进入 signing 命名空间
    for k in range(6):
        sid = R.choice(["ST034", "ST035"])
        ts = at(1 + k * 2, R.randint(9, 17), R.randrange(60))
        add("k8s_audit", ts=iso(ts), user=sid, user_type="human", verb="create", resource="pods", subresource="exec", namespace="signing", name="signer-0", source_ip=corp_ip(),
            response_code=101, annotations={"change_id": "CHG-%04d" % (200 + k)}, _ts=iso(ts))
        decoy("S9-S7-E%d" % (k + 1), "S7", "sre_exec_with_change", {"staff_id": [sid]}, "值班 SRE 持变更单（annotations.change_id）从办公出口进入 signing 命名空间", window={"start": iso(ts), "end": iso(ts + timedelta(minutes=1))}, match_window=True)
    # 治理发现 G2：ST050 过期的 prod_exec 仍被用于 exec（办公 IP，非攻击）
    ts = at(6, 10, 0)
    add("k8s_audit", ts=iso(ts), user="ST050", user_type="human", verb="create", resource="pods", subresource="exec", namespace="risk", name="risk-0", source_ip=corp_ip(), response_code=101, annotations={}, _ts=iso(ts))


def s8(devs):
    """供应链。"""
    # S8-01：依赖被篡改，integrity 与 lockfile 不一致
    t = at(9, 15, 20)
    pk = [("dependency_install", {"package": p, "version": v, "integrity": i, "lock_integrity": i}) for p, (v, i) in sorted(LOCK.items()) if p != "web3-helper"]
    bad = ("dependency_install", {"package": "web3-helper", "version": "2.3.1", "integrity": "sha256-" + H("tampered")[:32], "lock_integrity": LOCK["web3-helper"][1], "lock_version": "2.3.0"})
    run1, rows1 = ci_run(t, "miniex/wallet-service", "ci.yml", "ST029", "main", [("action_use", pinned("actions/checkout"))] + pk + [bad,
                         ("artifact_build", {"artifact": "wallet-service:ci", "sha256": H("s8a")[:32], "channel": "ci"})], "push")
    positive("S8-01", "S8", "安装的依赖版本与哈希同 lockfile 不一致", (t, t + timedelta(minutes=5)), {"run_id": [run1], "package": ["web3-helper"]},
             "wallet-service 主干构建安装了 web3-helper@2.3.1，哈希与 lockfile（2.3.0）不符，且这次提交没有改 lockfile。",
             {"ci_events": [rows1[0]]})
    # S8-02：release.yml 使用未固定的第三方 Action，且 pull_request_target 触发
    t = at(10, 11, 0)
    run2, rows2 = ci_run(t, "miniex/exchange-web", "release.yml", "ST022", "main",
                         [("action_use", {"action": "thirdparty/setup-foo", "ref": "main"}), ("action_use", pinned("actions/checkout")), ("action_use", pinned("sigstore/cosign-installer"))] +
                         [("dependency_install", {"package": p, "version": v, "integrity": i, "lock_integrity": i}) for p, (v, i) in sorted(LOCK.items())] +
                         [("artifact_build", {"artifact": "exchange-web:v3.15.0-rc", "sha256": H("s8b")[:32], "channel": "release"}),
                          ("artifact_sign", {"artifact": "exchange-web:v3.15.0-rc", "sha256": H("s8b")[:32], "signature": "cosign:" + H("sigb")[:24]}),
                          ("publish", {"artifact": "exchange-web:v3.15.0-rc", "sha256": H("s8b")[:32], "channel": "release", "signature": "cosign:" + H("sigb")[:24]})], "pull_request_target")
    positive("S8-02", "S8", "发布流水线引用未固定的第三方 Action（@main）", (t, t + timedelta(minutes=5)), {"run_id": [run2], "action": ["thirdparty/setup-foo"]},
             "release.yml 的一次运行使用 thirdparty/setup-foo@main（可变引用），触发方式为 pull_request_target；其余 Action 都固定到了 40 位提交哈希。",
             {"ci_events": [rows2[1]]})
    # S8-03：未签名制品发布到 release 通道
    t = at(12, 17, 40)
    sha = H("s8c")[:32]
    run3, rows3 = ci_run(t, "miniex/wallet-service", "release.yml", "ST022", "main",
                         [("action_use", pinned("actions/checkout"))] +
                         [("dependency_install", {"package": p, "version": v, "integrity": i, "lock_integrity": i}) for p, (v, i) in sorted(LOCK.items())] +
                         [("artifact_build", {"artifact": "wallet-service:v1.8.0", "sha256": sha, "channel": "release"}),
                          ("publish", {"artifact": "wallet-service:v1.8.0", "sha256": sha, "channel": "release", "signature": None})], "workflow_dispatch")
    positive("S8-03", "S8", "未签名制品被发布到 release 通道", (t, t + timedelta(minutes=5)), {"run_id": [run3], "artifact": ["wallet-service:v1.8.0"]},
             "wallet-service:v1.8.0 的 release.yml 运行里没有 artifact_sign 步骤，publish 事件的 signature 为 null，通道为 release。",
             {"ci_events": [rows3[-1]]})


# ----------------------------------------------------------------- 治理发现
def governance():
    return {
        "id": "G", "name": "员工与权限治理发现（非 S 场景，供控制矩阵与权限审计练习）",
        "findings": [
            {"id": "G1", "staff_id": "ST015", "finding": "已于 2026-01-20 离职，kyc_read 特权仍有效（到 2026-12-31），并在 2026-03-07 15:00 有一次 view_kyc 访问",
             "evidence": "staff.csv + support_access.csv", "expected_control": "离职联动停用 / 特权到期自动回收"},
            {"id": "G2", "staff_id": "ST050", "finding": "prod_exec 特权已于 2026-02-15 过期，2026-03-07 10:00 仍在 risk 命名空间 exec 成功",
             "evidence": "staff.csv + k8s_audit.jsonl", "expected_control": "特权到期后在网关侧失效，而不只是目录里的字段"},
            {"id": "G3", "staff_id": "ST051", "finding": "cloud_admin 特权没有审批人（approver_id 为空）", "evidence": "staff.csv", "expected_control": "特权授予必须有审批记录"},
        ],
    }


def controls_template():
    rows = [("身份与账户", "X11"), ("提币与风控", "X11/X13/X16"), ("交易与清算", "X13"), ("钱包与资金", "X14"), ("签名服务", "X14"), ("云与生产环境", "X03"),
            ("开发与发布", "X04"), ("检测与响应", "X05"), ("数据与合规", "X15/X16"), ("内部人与权限", "X01/X11")]
    return rows


# ----------------------------------------------------------------- 写出
def finalize():
    for name, rows in T.items():
        rows.sort(key=lambda r: (r.get("_ts", ""), r["_seq"]))
    for name, (col, pre) in ID_PREFIX.items():
        for i, r in enumerate(T[name], 1):
            r[col] = "%s%06d" % (pre, i)
    for name in ("accounts", "marks", "approvals", "api_keys", "chain_txs", "staff", "recoveries"):
        pass


def val(v):
    v = resolve(v)
    return v


def write_all(out):
    os.makedirs(out, exist_ok=True)
    for name, cols in COLS.items():
        cl = cols.split(",")
        with open(os.path.join(out, name + ".csv"), "w", newline="") as f:
            w = csv.writer(f, lineterminator="\n")
            w.writerow(cl)
            rows = T[name]
            if name in ("approvals", "marks", "chain_txs", "api_keys", "recoveries", "accounts", "staff"):
                rows = sorted(rows, key=lambda r: (r.get("_ts", ""), r["_seq"]))
            for r in rows:
                w.writerow([val(r.get(c, "")) for c in cl])
    for name, cols in JSONL.items():
        cl = cols.split(",")
        with open(os.path.join(out, name + ".jsonl"), "w") as f:
            for r in T[name]:
                f.write(json.dumps({c: val(r.get(c, "")) for c in cl}, ensure_ascii=False, sort_keys=False) + "\n")
    # 控制矩阵模板
    with open(os.path.join(out, "controls_matrix_template.csv"), "w", newline="") as f:
        w = csv.writer(f, lineterminator="\n")
        w.writerow(["domain", "related_chapters", "control_id", "control", "priority", "verification_method", "owner", "status", "evidence_ref"])
        for d, ch in controls_template():
            w.writerow([d, ch, "", "", "", "", "", "", ""])
    os.makedirs(os.path.join(out, "workflows"), exist_ok=True)
    for fn, txt in WORKFLOWS.items():
        with open(os.path.join(out, "workflows", fn), "w") as f:
            f.write(txt)
    with open(os.path.join(out, "workflows", "lockfile.sample.json"), "w") as f:
        lock = {"lockfileVersion": 3, "name": "wallet-service", "packages": {"node_modules/" + p: {"version": v, "integrity": i} for p, (v, i) in sorted(LOCK.items())}}
        json.dump(lock, f, indent=2)
        f.write("\n")


WORKFLOWS = {
    "ci.yml": """# 合成示例：常规 CI（所有 Action 固定到提交哈希，最小权限）
name: ci
on:
  push:
    branches: [main]
  pull_request:
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@%(checkout)s
      - uses: actions/setup-node@%(node)s
        with:
          node-version: 20
      - run: npm ci --ignore-scripts
      - run: npm test
""" % {"checkout": ACTION_SHA["actions/checkout"], "node": ACTION_SHA["actions/setup-node"]},
    "docs.yml": """# 合成示例：文档站构建（官方 Action 用标签引用，无密钥，无发布权限）
name: docs
on:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci && npm run build
""",
    "release.yml": """# 合成示例：发布流水线（故意有缺陷，供 B75 审查；缺陷已标注在 ops/answers/S8.json）
name: release
on:
  pull_request_target:          # 缺陷 1：在带密钥的上下文里运行外部 PR 的代码
  workflow_dispatch:
permissions: write-all          # 缺陷 2：权限过大
jobs:
  publish:
    runs-on: ubuntu-latest
    environment: ""             # 缺陷 3：没有环境审批
    steps:
      - uses: thirdparty/setup-foo@main              # 缺陷 4：第三方 Action 使用可变引用
      - uses: actions/checkout@%(checkout)s
        with:
          ref: ${{ github.event.pull_request.head.sha }}   # 缺陷 5：检出不可信 PR 的提交
      - run: npm install                              # 缺陷 6：没有 --ignore-scripts / 没有用 npm ci
      - run: npm run build
      - run: ./scripts/publish.sh ${{ github.event.inputs.version }}   # 缺陷 7：输入直接拼进命令
        env:
          REGISTRY_TOKEN: ${{ secrets.REGISTRY_TOKEN }}   # 缺陷 8：长期令牌，而不是短期身份
      # 缺陷 9：没有签名步骤，也没有发布前验证签名
""" % {"checkout": ACTION_SHA["actions/checkout"]},
}


def resolve_match(m):
    return {k: [resolve(x) for x in v] for k, v in m.items()}


KEYCOL = {"logins": "login_id", "recoveries": "recovery_id", "account_events": "event_id", "api_calls": "call_id", "orders_trades": "trade_id",
          "withdrawals": "wd_id", "signing_requests": "request_id", "support_access": "access_id", "ci_events": "event_id", "cloud_audit": "event_id",
          "k8s_audit": "event_id", "endpoint_events": "event_id", "chain_txs": "tx_hash", "approvals": "approval_id"}


def ids_of(ev):
    out = {}
    for tbl, rows in ev.items():
        lst = []
        for r in rows:
            r = resolve(r)
            if isinstance(r, dict) and "_seq" in r:
                lst.append(resolve(r[KEYCOL[tbl]]))
            else:
                lst.append(r)
        out[tbl] = lst
    return out


SCEN = {
    "S1": ("账户接管：撞库成功 -> 改密 / 找回 -> 新地址大额提币", ["X11 规则 1 凭证填充", "X11 规则 2 找回后 24 小时内提币", "X11 规则 3 改绑后 30 分钟内加地址", "X16 受害者介入 / 新地址延迟 IC-07"],
           ["冻结账户提币并重置会话", "撤销找回结果、通知用户走人工身份核验", "对涉及 IP 做封禁并检查同批撞库账户", "已提出资金的链上追踪与交易所协查"]),
    "S2": ("API Key 滥用：新开提币权限的 Key 从新 IP 调用", ["X11 规则 4 提币权限无 IP 绑定", "X11 规则 7 Key 新 IP 调用", "IC-10 IP 绑定、IC-11 批量撤销"],
           ["立即停用 Key，冻结该账户 API 提币", "核对 Key 创建 / 权限变更来源是否为账户所有者", "通知用户并要求重新绑定白名单"]),
    "S3": ("洗钱漏斗：多个小额入账汇聚到少数账户后快速提走", ["X16 规则示例 1 快进快出", "关联账户（同新注册、同入金来源模式）", "入金来源污染 X16 规则示例 2"],
           ["暂缓放行提币，升级到 L3 人工复核", "合规官决定是否上报可疑交易", "保留证据（入金来源、IP、设备）"]),
    "S4": ("对敲刷量与价格操纵：同一实体多账户互相成交、标记价偏离", ["X13 市场监测：自成交 / 对手方集中度 / 同 IP 设备", "X13 标记价偏离指数 + 连续采样点", "价格服务来源数不足时暂停开新仓"],
           ["限制相关账户下单与提币，保留订单与登录证据", "撮合方向与保证金复核（避免错误强平）", "对价格服务启用价格带 / 熔断"]),
    "S5": ("内部人批量查看 / 导出：客服账号在非工作时间批量读取 KYC", ["X11 规则 6 客服批量查看", "基线规则：按人 30 天基线 + 无工单 + 非办公时段", "X16 内部人风险"],
           ["暂停该客服账号的 KYC 访问权限，保留会话与导出文件", "调取工单系统核对，通知合规与法务", "评估数据泄露通报义务"]),
    "S6": ("签名服务异常：有签名请求缺少对应审批单；目标地址与审批单不一致", ["X05 跨域规则：链上转出 + 链下无审批单", "X14 签名服务独立校验：审批单 / 地址 / 金额三者一致", "X14 三方对账"],
           ["立即冻结签名服务并切到应急开关状态", "核对热钱包水位与链上转出，必要时转移剩余资金", "取证：调用方身份、请求来源、审批系统日志"]),
    "S7": ("开发终端失陷痕迹：开发机拉起外联工具 -> 云凭证被使用 -> 访问签名命名空间", ["X05 端点 + 云审计 + K8s 审计的链式关联", "云凭证来源 IP 不在办公出口", "X03 签名命名空间访问控制"],
           ["隔离该开发机、吊销该员工的云凭证与会话令牌", "核查签名命名空间内被读取的 secret，必要时轮换", "回溯同一依赖 / 同一来源的其他开发机"]),
    "S8": ("供应链：CI 中被篡改的依赖版本 / 未固定的 Action / 未签名制品被发布", ["X04 依赖哈希与 lockfile 校验", "X04 Action 固定到提交哈希", "X04 发布前验证制品签名"],
           ["阻断发布并回滚制品", "吊销发布令牌，换为短期身份", "对受影响依赖版本做全库扫描"]),
}


def write_answers(out):
    os.makedirs(out, exist_ok=True)
    by = {}
    for p in POS:
        by.setdefault(p["scenario"], []).append(p)
    index = []
    for sid in sorted(SCEN):
        title, dets, resp = SCEN[sid]
        ps = by[sid]
        for p in ps:
            p["match"] = resolve_match(p["match"])
            p["evidence"] = ids_of(p["evidence"])
        win = {"start": min(p["window"]["start"] for p in ps), "end": max(p["window"]["end"] for p in ps)}
        doc = {"id": sid, "name": title, "window": win, "expected_detections": dets, "expected_response": resp, "positive_count": len(ps), "positives": ps}
        if sid == "S8":
            doc["workflow_defects"] = {"file": "workflows/release.yml", "defects": ["pull_request_target 触发", "permissions: write-all", "无环境审批", "第三方 Action 使用 @main", "检出不可信 PR 的提交",
                                                                           "npm install 未 --ignore-scripts", "输入直接拼进命令", "长期 REGISTRY_TOKEN", "没有签名与验证步骤"]}
        with open(os.path.join(out, sid + ".json"), "w") as f:
            json.dump(doc, f, ensure_ascii=False, indent=2)
            f.write("\n")
        index.append({"id": sid, "name": title, "positive_count": len(ps), "window": win, "file": "answers/%s.json" % sid})
    for d in DEC:
        d["match"] = resolve_match(d["match"])
        d["evidence"] = ids_of(d["evidence"])
    dd = {"id": "S9", "name": "误报与噪声：每个场景周围“看起来可疑但正常”的事件", "decoy_count": len(DEC),
          "by_scenario": {s: sum(1 for d in DEC if d["mimics"] == s) for s in sorted(SCEN)}, "decoys": DEC}
    with open(os.path.join(out, "S9.json"), "w") as f:
        json.dump(dd, f, ensure_ascii=False, indent=2)
        f.write("\n")
    index.append({"id": "S9", "name": dd["name"], "positive_count": 0, "decoy_count": len(DEC), "file": "answers/S9.json"})
    with open(os.path.join(out, "governance.json"), "w") as f:
        json.dump(governance(), f, ensure_ascii=False, indent=2)
        f.write("\n")
    with open(os.path.join(out, "index.json"), "w") as f:
        json.dump({"seed": SEED, "start": iso(START), "days": DAYS, "scenarios": index}, f, ensure_ascii=False, indent=2)
        f.write("\n")


def main():
    global R, SEED, POOL
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", type=int, default=DEFAULT_SEED)
    ap.add_argument("--out", default=os.path.join(OPS, "data"))
    ap.add_argument("--answers", default=os.path.join(OPS, "answers"))
    args = ap.parse_args()
    SEED = args.seed
    R = random.Random(SEED)
    build_index()
    POOL = make_accounts()
    # 角色
    mm = take(6, "market_maker", 3)
    ins = take(15, "institution", 3)
    take(30, "vip", 3)
    for a in mm:
        a["special"] = False
    for a in ins:
        a["special"] = False
    for a in ACC_LIST:
        if a["tag"] in ("vip",):
            a["special"] = False
    for a in mm + ins:
        a["ips"][0] = cloud_ip()
    staff = make_staff()
    sids = [s[0] for s in staff]
    devs_staff = ["ST%03d" % i for i in range(21, 30)]
    sres = ["ST034", "ST035", "ST036", "ST037", "ST038"]
    # 在 finish_accounts 之前预留场景账户：先跑场景需要 POOL，保持 POOL 顺序稳定
    finish_accounts_later = True
    base_marks()
    base_logins()
    base_recoveries_events()
    base_deposits()
    base_withdrawals()
    traders = [a for a in ACC_LIST if not a["special"]]
    traders = R.sample(traders, 500)
    base_trades(traders)
    cand = [a for a in ACC_LIST if not a["special"]]
    keyed = R.sample(cand, 26) + [a for a in ACC_LIST if a["tag"] in ("institution",)][:4]
    keys = base_api(keyed)
    # 几个 key 迁移服务器（噪声，在场景里登记）
    transfer = treasury(0)
    base_cloud_k8s_endpoint(devs_staff, sres)
    tick = base_support()
    base_ci(devs_staff)
    # 迁移噪声：重写部分 key 的后半段调用 IP
    kv0 = [k for k in keys if k["perms"] == "read,trade"][0]
    MIG.extend([k for k in keys if k["perms"] == "read,trade" and k is not kv0][:4])
    for k, ky in enumerate(MIG):
        newip = cloud_ip()
        cutoff = iso(at(6 + k, 0))
        for r in T["api_calls"]:
            if r["key_id"] == ky["id"] and r["ts"] >= cutoff:
                r["ip"] = newip
    s1()
    s2(keys)
    s3()
    s4(traders)
    s5(tick)
    s6(transfer)
    s7(devs_staff)
    s8(devs_staff)
    # 账户表在最后写入（场景改了 tag / kyc / reg）
    finish_accounts()
    finalize()
    write_all(args.out)
    write_answers(args.answers)
    print("生成完成：seed=%d  out=%s" % (SEED, args.out))


if __name__ == "__main__":
    main()
