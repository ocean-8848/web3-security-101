"""MiniEx 靶场自检：确定性、数据一致性、合成性（无真实地址 / IP）、答案与数据对得上、参考规则的召回与误报。
运行：python3 -m unittest discover -s practice-example-code/ops/tests -v
"""
import hashlib
import ipaddress
import json
import os
import re
import subprocess
import sys
import tempfile
import unittest

OPS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(OPS, "lib"))
import mini  # noqa: E402
import replay  # noqa: E402

COUNTS = {"S1": 3, "S2": 2, "S3": 3, "S4": 3, "S5": 2, "S6": 3, "S7": 2, "S8": 3}
# 参考规则的预期结果：(命中, TP, 误报, 召回的答案数, 答案总数)
EXPECTED = {
    "r01_credential_stuffing": (12, 11, 1, 2, 3),
    "r02_recovery_withdraw_naive": (11, 2, 9, 2, 3),
    "r02b_recovery_withdraw_tuned": (2, 2, 0, 2, 3),
    "r03_change_then_add_address": (3, 3, 0, 3, 3),
    "r04_api_key_new_ip_withdraw": (2, 2, 0, 2, 2),
    "r05_funnel_fast_in_out": (3, 3, 0, 3, 3),
    "r06_wash_trading": (8, 6, 2, 2, 2),
    "r07_mark_deviation": (1, 1, 0, 1, 1),
    "r08_support_bulk_no_ticket": (3, 3, 0, 2, 2),
    "r09_signing_without_approval": (5, 3, 2, 3, 3),
    "r10_chain_tx_without_request": (2, 2, 0, 2, 2),
    "r11_dev_chain_to_signing": (2, 2, 0, 2, 2),
    "r12_ci_pinning": (1, 1, 0, 1, 1),
    "r13_ci_dependency_integrity": (1, 1, 0, 1, 1),
    "r14_ci_unsigned_release": (1, 1, 0, 1, 1),
}
ALLOWED_NETS = [ipaddress.ip_network(n) for n in ("100.64.0.0/10", "198.18.0.0/15", "192.0.2.0/24", "198.51.100.0/24", "203.0.113.0/24", "10.0.0.0/8")]


def tree_hash(root):
    h = hashlib.sha256()
    for dp, dn, fn in sorted(os.walk(root)):
        dn.sort()
        for f in sorted(fn):
            p = os.path.join(dp, f)
            h.update(os.path.relpath(p, root).encode())
            h.update(open(p, "rb").read())
    return h.hexdigest()


class Base(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db = mini.connect(rebuild=True)
        cls.pos, cls.dec = mini.load_answers()


class TestDeterminism(unittest.TestCase):
    def test_two_runs_identical_and_match_repo(self):
        with tempfile.TemporaryDirectory() as t:
            outs = []
            for i in (1, 2):
                d, a = os.path.join(t, "d%d" % i), os.path.join(t, "a%d" % i)
                subprocess.run([sys.executable, os.path.join(OPS, "gen", "generate.py"), "--out", d, "--answers", a], check=True, capture_output=True)
                outs.append((tree_hash(d), tree_hash(a)))
            self.assertEqual(outs[0], outs[1], "同一种子两次生成的数据或答案不一致")
            # 与当前 data/ 比较（排除 SQLite 库文件）
            cur = hashlib.sha256()
            for dp, dn, fn in sorted(os.walk(mini.DATA)):
                dn.sort()
                for f in sorted(fn):
                    if f.endswith(".db"):
                        continue
                    p = os.path.join(dp, f)
                    cur.update(os.path.relpath(p, mini.DATA).encode())
                    cur.update(open(p, "rb").read())
            fresh = hashlib.sha256()
            for dp, dn, fn in sorted(os.walk(os.path.join(t, "d1"))):
                dn.sort()
                for f in sorted(fn):
                    p = os.path.join(dp, f)
                    fresh.update(os.path.relpath(p, os.path.join(t, "d1")).encode())
                    fresh.update(open(p, "rb").read())
            self.assertEqual(cur.hexdigest(), fresh.hexdigest(), "data/ 与重新生成的结果不一致，请重新运行 setup.sh")


class TestData(Base):
    def n(self, sql):
        return self.db.execute(sql).fetchone()[0]

    def test_row_counts(self):
        self.assertEqual(self.n("SELECT COUNT(*) FROM accounts"), 2000)
        for t, lo in (("logins", 10000), ("withdrawals", 1000), ("orders_trades", 10000), ("ledger", 50000), ("cloud_audit", 3000), ("k8s_audit", 1500), ("ci_events", 3000)):
            self.assertGreater(self.n("SELECT COUNT(*) FROM " + t), lo, t)

    def test_ledger_balanced(self):
        bad = self.n("""SELECT COUNT(*) FROM (SELECT txn_id, asset,
            ROUND(SUM(CASE direction WHEN 'debit' THEN amount ELSE -amount END), 4) AS d FROM ledger GROUP BY txn_id, asset HAVING ABS(d) > 0.0001)""")
        self.assertEqual(bad, 0, "存在借贷不平的分录")

    def test_completed_withdrawals_have_approval_signing_tx(self):
        self.assertEqual(self.n("""SELECT COUNT(*) FROM withdrawals w WHERE status='completed' AND (approval_id IS NULL OR tx_hash IS NULL
            OR NOT EXISTS (SELECT 1 FROM signing_requests s WHERE s.approval_id = w.approval_id AND s.signer_result='signed'))"""), 0)

    def test_foreign_keys(self):
        self.assertEqual(self.n("SELECT COUNT(*) FROM withdrawals WHERE account_id NOT IN (SELECT account_id FROM accounts)"), 0)
        self.assertEqual(self.n("SELECT COUNT(*) FROM logins WHERE account_id NOT IN (SELECT account_id FROM accounts)"), 0)
        self.assertEqual(self.n("SELECT COUNT(*) FROM chain_txs WHERE wd_id IS NOT NULL AND wd_id NOT IN (SELECT wd_id FROM withdrawals)"), 0)
        self.assertEqual(self.n("SELECT COUNT(*) FROM api_calls WHERE key_id NOT IN (SELECT key_id FROM api_keys)"), 0)

    def test_time_window(self):
        for t in ("logins", "withdrawals", "orders_trades", "signing_requests", "cloud_audit"):
            lo, hi = self.db.execute("SELECT MIN(ts), MAX(ts) FROM " + t).fetchone()
            self.assertGreaterEqual(lo, "2026-03-01T00:00:00Z", t)
            self.assertLess(hi, "2026-03-15T01:00:00Z", t)

    def test_synthetic_only(self):
        ip_re = re.compile(r"(?<![\d.])(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?![\d.])")
        for t in mini.TABLES:
            seen = set()
            with open(mini.table_path(t)) as f:
                for line in f:
                    for m in ip_re.findall(line):
                        seen.add(m)
            for ip in seen:
                try:
                    a = ipaddress.ip_address(ip)
                except ValueError:
                    continue  # 版本号之类
                self.assertTrue(any(a in n for n in ALLOWED_NETS), "%s 出现非保留段 IP：%s" % (t, ip))
        addr_re = re.compile(r"0x[0-9a-fA-F]+")
        for t in ("withdrawals", "chain_txs"):
            for r in mini.iter_table(t):
                for k in ("to_address", "to_addr", "from_addr"):
                    if r.get(k):
                        self.assertRegex(r[k], r"^0x[0-9a-fA-F]{40}$")
        self.assertEqual(self.n("SELECT COUNT(*) FROM cloud_audit WHERE json_extract(detail, '$.access_key') NOT LIKE 'AKSIM%'"), 0)


class TestAnswers(Base):
    def test_counts(self):
        got = {}
        for p in self.pos:
            got[p["scenario"]] = got.get(p["scenario"], 0) + 1
        self.assertEqual(got, COUNTS)
        self.assertGreaterEqual(len(self.dec), 60)
        for s in ("S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"):
            self.assertGreater(sum(1 for d in self.dec if d["mimics"] == s), 0, s)

    def test_evidence_exists(self):
        key = {"logins": "login_id", "recoveries": "recovery_id", "account_events": "event_id", "api_calls": "call_id", "orders_trades": "trade_id", "withdrawals": "wd_id",
               "signing_requests": "request_id", "support_access": "access_id", "ci_events": "event_id", "cloud_audit": "event_id", "k8s_audit": "event_id",
               "endpoint_events": "event_id", "chain_txs": "tx_hash", "approvals": "approval_id"}
        for item in self.pos + self.dec:
            for tbl, ids in item["evidence"].items():
                if tbl not in key:
                    continue
                for i in ids:
                    self.assertEqual(self.db.execute("SELECT COUNT(*) FROM %s WHERE %s=?" % (tbl, key[tbl]), (i,)).fetchone()[0], 1, "%s 的证据 %s.%s 不存在" % (item["id"], tbl, i))

    def test_match_nonempty(self):
        for item in self.pos + self.dec:
            self.assertTrue(item["match"] and all(v for v in item["match"].values()), item["id"])
            for vals in item["match"].values():
                for v in vals:
                    self.assertIsInstance(v, str)


class TestReferenceRules(Base):
    def test_expected_results(self):
        d = os.path.join(mini.ANSWERS, "reference_rules")
        for name, (hits, tp, fp, rec, tot) in sorted(EXPECTED.items()):
            f = [x for x in os.listdir(d) if x.startswith(name)][0]
            res, _ = replay.run_rule(self.db, os.path.join(d, f))
            self.assertEqual((res["hits"], res["tp_hits"], res["fp_hits"], res["recalled"], res["positives"]), (hits, tp, fp, rec, tot), name)

    def test_tuning_helps(self):
        d = os.path.join(mini.ANSWERS, "reference_rules")
        a, _ = replay.run_rule(self.db, os.path.join(d, "r02_recovery_withdraw_naive.sql"))
        b, _ = replay.run_rule(self.db, os.path.join(d, "r02b_recovery_withdraw_tuned.sql"))
        self.assertGreater(a["fp_hits"], b["fp_hits"])
        self.assertEqual(a["recalled"], b["recalled"])
        # 调高 min_users 去掉办公室 NAT 的误报；召回不变
        r, _ = replay.run_rule(self.db, os.path.join(d, "r01_credential_stuffing.sql"), params={"min_users": "40"})
        self.assertEqual((r["fp_hits"], r["recalled"]), (0, 2))
        # 排除做市商后对敲规则没有误报
        r, _ = replay.run_rule(self.db, os.path.join(d, "r06_wash_trading.sql"), params={"exclude_mm": "1"})
        self.assertEqual((r["fp_hits"], r["recalled"]), (0, 2))
        # funnel 阈值 20000 会漏掉两个小额漏斗
        r, _ = replay.run_rule(self.db, os.path.join(d, "r05_funnel_fast_in_out.sql"), params={"min_in_usd": "20000"})
        self.assertEqual(r["recalled"], 1)

    def test_cli_exit_code(self):
        rule = os.path.join(mini.ANSWERS, "reference_rules", "r03_change_then_add_address.sql")
        cp = subprocess.run([sys.executable, os.path.join(OPS, "lib", "replay.py"), rule, "--min-recall", "1.0", "--max-fp", "0"], capture_output=True, text=True)
        self.assertEqual(cp.returncode, 0, cp.stdout + cp.stderr)
        rule = os.path.join(mini.ANSWERS, "reference_rules", "r02_recovery_withdraw_naive.sql")
        cp = subprocess.run([sys.executable, os.path.join(OPS, "lib", "replay.py"), rule, "--max-fp", "2"], capture_output=True, text=True)
        self.assertEqual(cp.returncode, 1)


if __name__ == "__main__":
    unittest.main()
