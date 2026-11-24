#!/usr/bin/env python3
"""B82 参考实现：Merkle 求和树负债证明（教学版，只用标准库，未做生产级加固）。

用法（从 web3-security-101/ 出发）：
  P=code/offchain-ops/solutions/b82/merkle_sum.py
  python3 $P build  --date 2026-03-10 --asset USDT --out b82-lab/tree
  python3 $P check  --dir b82-lab/tree
  python3 $P prove  --dir b82-lab/tree --user A00689 --out b82-lab/proof_A00689.json
  python3 $P verify --root b82-lab/tree/root.json --proof b82-lab/proof_A00689.json
  python3 $P build  --date 2026-03-10 --asset USDT --out b82-lab/tree_omit --omit A00689   # 演示"被剔除的用户"

编码约定（自己写版本时照此，根哈希才会一致）：
  叶子   = (sha256("leaf|"+用户号+"|"+盐+"|"+余额分), 余额分)
  父节点 = (sha256("node|"+左哈希+"|"+左和+"|"+右哈希+"|"+右和), 左和+右和)；哈希写成 64 位小写十六进制
  叶子按用户号升序排列；某层个数为奇数时补一个 (sha256("pad"), 0)
  盐   = sha256("b82-demo-salt|"+用户号) 的前 16 个十六进制字符（演示用；生产必须是每用户随机盐并保密）
  余额 = 靶场只有负债合计，没有逐用户余额：用 accounts.csv 的 2000 个账户，按 sha256("w|"+用户号) 前 8 位十六进制
         对 1000 取余再加 1 作权重，把 liabilities.csv 当日 user_balance 的总额（分）按权重比例分摊，
         余数加到排序后的第一个用户。这是教学用的合成数据，不是真实余额。
"""
import argparse
import csv
import hashlib
import json
import os
import sys
from decimal import Decimal

OPS = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ACCOUNTS = os.path.join(OPS, "data", "accounts.csv")
LIAB = os.path.join(OPS, "data_x", "liabilities.csv")


def H(s):
    return hashlib.sha256(s.encode()).hexdigest()


def salt_of(uid):
    return H("b82-demo-salt|" + uid)[:16]


def leaf(uid, salt, cents):
    if cents < 0:
        raise ValueError("负余额必须在建树之前单独处理：%s" % uid)
    return (H("leaf|%s|%s|%d" % (uid, salt, cents)), cents)


def parent(l, r):
    return (H("node|%s|%d|%s|%d" % (l[0], l[1], r[0], r[1])), l[1] + r[1])


PAD = (H("pad"), 0)


def ledger_total_cents(date, asset):
    with open(LIAB, newline="") as f:
        for r in csv.DictReader(f):
            if r["date"] == date and r["asset"] == asset and r["category"] == "user_balance":
                return int((Decimal(r["amount"]) * 100).to_integral_value())
    raise SystemExit("liabilities.csv 里没有 %s %s 的 user_balance" % (date, asset))


def allocate(total, uids):
    w = {u: int(H("w|" + u)[:8], 16) % 1000 + 1 for u in uids}
    sw = sum(w.values())
    bal = {u: total * w[u] // sw for u in uids}
    bal[uids[0]] += total - sum(bal.values())
    return bal


def levels(leaves):
    lv = [leaves]
    cur = leaves
    while len(cur) > 1:
        if len(cur) % 2:
            cur = cur + [PAD]
            lv[-1] = cur
        cur = [parent(cur[i], cur[i + 1]) for i in range(0, len(cur), 2)]
        lv.append(cur)
    return lv


def read_leaves(d):
    with open(os.path.join(d, "leaves.csv"), newline="") as f:
        return [(r["user"], r["salt"], int(r["cents"])) for r in csv.DictReader(f)]


def cmd_build(a):
    with open(ACCOUNTS, newline="") as f:
        uids = sorted(r["account_id"] for r in csv.DictReader(f))
    total = ledger_total_cents(a.date, a.asset)
    bal = allocate(total, uids)
    if a.omit:
        uids = [u for u in uids if u not in a.omit]
    os.makedirs(a.out, exist_ok=True)
    rows = [(u, salt_of(u), bal[u]) for u in uids]
    with open(os.path.join(a.out, "leaves.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["user", "salt", "cents"])
        w.writerows(rows)
    lv = levels([leaf(*r) for r in rows])
    root = lv[-1][0]
    meta = {"date": a.date, "asset": a.asset, "root_hash": root[0], "total_cents": root[1], "leaves": len(rows)}
    with open(os.path.join(a.out, "root.json"), "w") as f:
        json.dump(meta, f, indent=1, ensure_ascii=False)
    print("已建树：%s %s，叶子 %d，总额 %.2f，根哈希 %s" % (a.date, a.asset, len(rows), root[1] / 100, root[0][:16]))


def cmd_check(a):
    meta = json.load(open(os.path.join(a.dir, "root.json")))
    led = ledger_total_cents(meta["date"], meta["asset"])
    diff = meta["total_cents"] - led
    print("树总额 %.2f，账务 user_balance %.2f，差额 %.2f" % (meta["total_cents"] / 100, led / 100, diff / 100))
    if diff == 0:
        print("结论：一致")
        return 0
    print("结论：不一致，树少算了 %.2f（有用户被漏掉，或余额被改小）" % (-diff / 100) if diff < 0 else "结论：不一致，树多算了 %.2f" % (diff / 100))
    return 1


def cmd_prove(a):
    rows = read_leaves(a.dir)
    idx = next((i for i, r in enumerate(rows) if r[0] == a.user), None)
    if idx is None:
        print("用户 %s 不在这棵树里" % a.user)
        return 1
    lv = levels([leaf(*r) for r in rows])
    path, i = [], idx
    for level in lv[:-1]:
        sib = i ^ 1
        node = level[sib]
        path.append({"side": "L" if sib < i else "R", "hash": node[0], "sum": node[1]})
        i //= 2
    proof = {"user": a.user, "salt": rows[idx][1], "cents": rows[idx][2], "path": path}
    with open(a.out, "w") as f:
        json.dump(proof, f, indent=1)
    print("已生成证明：%s，路径 %d 层，写入 %s" % (a.user, len(path), a.out))


def cmd_verify(a):
    meta = json.load(open(a.root))
    p = json.load(open(a.proof))
    try:
        cur = leaf(p["user"], p["salt"], p["cents"])
        for s in p["path"]:
            if s["sum"] < 0:
                raise ValueError("兄弟节点余额为负")
            sib = (s["hash"], s["sum"])
            cur = parent(sib, cur) if s["side"] == "L" else parent(cur, sib)
    except ValueError as e:
        print("验证失败：%s" % e)
        return 1
    if cur[0] != meta["root_hash"] or cur[1] != meta["total_cents"]:
        print("验证失败：算出的根与公布的根不一致")
        return 1
    print("验证通过：%s 的余额 %.2f 已计入根（总额 %.2f）" % (p["user"], p["cents"] / 100, meta["total_cents"] / 100))
    return 0


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = ap.add_subparsers(dest="cmd", required=True)
    b = sp.add_parser("build")
    b.add_argument("--date", required=True)
    b.add_argument("--asset", required=True)
    b.add_argument("--out", required=True)
    b.add_argument("--omit", action="append", default=[])
    c = sp.add_parser("check")
    c.add_argument("--dir", required=True)
    p = sp.add_parser("prove")
    p.add_argument("--dir", required=True)
    p.add_argument("--user", required=True)
    p.add_argument("--out", required=True)
    v = sp.add_parser("verify")
    v.add_argument("--root", required=True)
    v.add_argument("--proof", required=True)
    a = ap.parse_args(argv)
    return {"build": cmd_build, "check": cmd_check, "prove": cmd_prove, "verify": cmd_verify}[a.cmd](a) or 0


if __name__ == "__main__":
    sys.exit(main())
