"""MiniEx 第二批（S10–S15）自检：确定性、数据一致性、合成性、答案与数据对得上、lib 脚本的召回与误报基线。
运行：python3 -m unittest discover -s practice-example-code/ops/tests -p 'test_miniex_x.py' -v
需要先运行 setup.sh（生成 data/ 与 data_x/）。
"""
import csv
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import unittest

OPS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(OPS, "lib"))
import minix  # noqa: E402
import case_audit  # noqa: E402
import ledger_check  # noqa: E402
import liq_audit  # noqa: E402
import order_audit  # noqa: E402
import recon3  # noqa: E402
import replay_match  # noqa: E402
import reserve_check  # noqa: E402
import seqcheck  # noqa: E402
import state_audit  # noqa: E402

# 数据行数（不含表头）
COUNTS = {"order_events": 22242, "match_log": 4962, "trade_ledger_link": 17819, "positions": 13174, "liquidations": 107, "bank_statements": 248, "wallet_balances": 168,
          "reserve_snapshots": 168, "liabilities": 168, "onchain_transfers": 680, "pending_states": 3469, "cases": 245, "case_actions": 424}
POSITIVES = {"S10": 5, "S11": 3, "S12": 3, "S13": 3, "S14": 5, "S15": 4}
DECOYS = {"S10": 6, "S11": 7, "S12": 4, "S13": 3, "S14": 15, "S15": 4}
S14_ALL = "S14-02,S14-03,S14-04,S14-05"
# 基线：(脚本 / 配置, 调用, 目标) -> (命中, TP 命中, 误报, 召回的答案数, 答案总数, 其他场景命中)
BASELINES = [
    ("seqcheck 默认", lambda: seqcheck.detect(), "S10-01,S10-02", (4, 4, 0, 2, 2, 0)),
    ("seqcheck 没调过", lambda: seqcheck.detect(ignore_identical=False, include_announced=True, check_order=True), "S10-01,S10-02", (41, 4, 37, 2, 2, 0)),
    ("ledger_check 默认", lambda: ledger_check.detect(), "S10-03,S10-04,S10-05", (9, 9, 0, 3, 3, 0)),
    ("ledger_check 没调过", lambda: ledger_check.detect(tol=0, require_fee=True, min_fee_notional=0, late_sec=300), "S10-03,S10-04,S10-05", (133, 9, 123, 3, 3, 1)),
    ("ledger_check 标记价", lambda: ledger_check.detect(mark_tol=0.10), "S10-03,S10-04,S10-05,S11-01", (12, 12, 0, 4, 4, 0)),
    ("replay_match 默认 S12", lambda: replay_match.detect(), "S12", (52, 49, 0, 3, 3, 3)),
    ("replay_match 默认 S10-01", lambda: replay_match.detect(), "S10-01", (52, 3, 0, 1, 1, 49)),
    ("replay_match 没调过", lambda: replay_match.detect(confirm_dups=False, epoch_changes=True, standby_heartbeats=True), "S12", (67, 50, 14, 3, 3, 3)),
    ("order_audit 默认", lambda: order_audit.detect(), "S11", (23, 14, 0, 3, 3, 9)),
    ("order_audit 价格带 5%", lambda: order_audit.detect(band=0.05), "S11", (29, 14, 6, 3, 3, 9)),
    ("order_audit 没调过", lambda: order_audit.detect(band=0.05, by_ts=True, include_rejects=True), "S11", (47, 15, 23, 3, 3, 9)),
    ("liq_audit 默认", lambda: liq_audit.detect(), "S13", (27, 20, 7, 3, 3, 0)),
    ("liq_audit 调过", lambda: liq_audit.detect(min_shortfall=5000), "S13", (20, 20, 0, 3, 3, 0)),
    ("liq_audit 没调过", lambda: liq_audit.detect(sla=30), "S13", (33, 20, 13, 3, 3, 0)),
    ("reserve_check 默认", lambda: reserve_check.detect(), "S14-01", (7, 5, 2, 1, 1, 0)),
    ("reserve_check 调过", lambda: reserve_check.detect(threshold=0.995), "S14-01", (5, 5, 0, 1, 1, 0)),
    ("reserve_check 没调过", lambda: reserve_check.detect(basis="usd"), "S14-01", (16, 5, 11, 1, 1, 0)),
    ("recon3 默认", lambda: recon3.detect(), S14_ALL, (24, 6, 18, 4, 4, 0)),
    ("recon3 调过", lambda: recon3.detect(tol_days=5, amount_tol=25), S14_ALL, (5, 5, 0, 4, 4, 0)),
    ("recon3 没调过", lambda: recon3.detect(tol_days=0, amount_tol=0, dust=0, late_hours=1, include_fees=True, include_sweeps=True, include_interest=True), S14_ALL, (175, 6, 169, 4, 4, 0)),
    ("recon3 截至 03-11", lambda: recon3.detect(asof="2026-03-11T23:59:59Z", tol_days=5, amount_tol=25), S14_ALL, (4, 4, 0, 4, 4, 0)),
    ("state_audit 默认", lambda: state_audit.detect(), "S14-03,S14-04,S14-05", (7, 7, 0, 3, 3, 0)),
    ("state_audit 没调过", lambda: state_audit.detect(sla={"approve": 600, "reserve": 600}, flag_timeouts=True, flag_dup_same=True, flag_reorg=True), "S14-03,S14-04,S14-05", (228, 8, 220, 3, 3, 0)),
    ("case_audit 默认", lambda: case_audit.detect(), "S15", (16, 16, 0, 4, 4, 0)),
    ("case_audit 没调过", lambda: case_audit.detect(report_sla=300, allow_policy=False, include_retried=True), "S15", (102, 16, 86, 4, 4, 0)),
]
SCRIPTS = ["seqcheck", "ledger_check", "replay_match", "recon3", "state_audit", "case_audit", "order_audit", "liq_audit", "reserve_check"]
ID_COL = {"order_events": "event_id", "match_log": "log_id", "trade_ledger_link": "link_id", "pending_states": "event_id", "case_actions": "action_id",
          "liquidations": "liq_id", "cases": "case_id", "bank_statements": "stmt_id", "onchain_transfers": "tx_hash"}


def tree_hash(root, skip=()):
    h = hashlib.sha256()
    for dp, dn, fn in sorted(os.walk(root)):
        dn.sort()
        for f in sorted(fn):
            if f in skip or f.endswith(".db"):
                continue
            p = os.path.join(dp, f)
            h.update(os.path.relpath(p, root).encode())
            with open(p, "rb") as fh:
                h.update(fh.read())
    return h.hexdigest()


def load(name):
    with open(os.path.join(minix.ANSWERS, name)) as f:
        return json.load(f)


def n_lines(path):
    with open(path) as f:
        return sum(1 for _ in f)


class TestDeterminism(unittest.TestCase):
    def test_two_runs_identical_match_repo_and_leave_batch1_alone(self):
        before = tree_hash(minix.DATA)
        old_answers = tree_hash(minix.ANSWERS, skip=tuple("S%d.json" % i for i in range(10, 16)) + ("index_x.json",))
        with tempfile.TemporaryDirectory() as t:
            outs = []
            for i in (1, 2):
                d, a = os.path.join(t, "d%d" % i), os.path.join(t, "a%d" % i)
                subprocess.run([sys.executable, os.path.join(OPS, "gen", "generate_x.py"), "--out", d, "--answers", a], check=True, capture_output=True)
                outs.append((tree_hash(d), tree_hash(a)))
            self.assertEqual(outs[0], outs[1], "同一种子两次生成的数据或答案不一致")
            self.assertEqual(outs[0][0], tree_hash(minix.DATA_X), "data_x/ 与重新生成的结果不一致，请重新运行 setup.sh")
            cur = hashlib.sha256()
            for s in ["S%d.json" % i for i in range(10, 16)] + ["index_x.json"]:
                with open(os.path.join(minix.ANSWERS, s), "rb") as f:
                    cur.update(s.encode() + f.read())
            fresh = hashlib.sha256()
            for s in ["S%d.json" % i for i in range(10, 16)] + ["index_x.json"]:
                with open(os.path.join(t, "a1", s), "rb") as f:
                    fresh.update(s.encode() + f.read())
            self.assertEqual(cur.hexdigest(), fresh.hexdigest(), "answers/S10–S15 与重新生成的结果不一致")
        self.assertEqual(before, tree_hash(minix.DATA), "generate_x.py 不应改动第一批的 data/")
        self.assertEqual(old_answers, tree_hash(minix.ANSWERS, skip=tuple("S%d.json" % i for i in range(10, 16)) + ("index_x.json",)))
        self.assertEqual([s["id"] for s in load("index.json")["scenarios"]], ["S%d" % i for i in range(1, 10)])
        self.assertEqual(load("index_x.json")["seed"], 20260302)


class Base(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        for t in minix.TABLES_X:
            minix.need(t)
        cls.pos, cls.dec = minix.load_answers()
        cls.accounts = {r["account_id"] for r in minix.iter_csv("accounts", base=minix.DATA)}


class TestData(Base):
    def test_row_counts(self):
        for t, n in COUNTS.items():
            self.assertEqual(len(minix.rows(t)), n, t)
            self.assertEqual(n_lines(minix.path_of(t)) - (1 if t in minix.CSV_X else 0), n, t)

    def test_accounts_exist(self):
        for t, col in (("order_events", "account_id"), ("trade_ledger_link", "account_id"), ("positions", "account_id"), ("liquidations", "account_id"),
                       ("cases", "account_id"), ("case_actions", "account_id"), ("pending_states", "account_id")):
            for r in minix.rows(t):
                if r[col] and r[col] != "FEE-POOL":
                    self.assertIn(r[col], self.accounts, "%s.%s" % (t, col))

    def test_wallet_addresses_from_batch1(self):
        known = set()
        for r in minix.iter_csv("chain_txs", base=minix.DATA):
            known.update([r["from_addr"], r["to_addr"]])
        unknown = set()
        for r in minix.iter_csv("wallet_balances"):
            if r["address"] not in known:
                unknown.add(r["address"])
            self.assertRegex(r["address"], r"^0x[0-9a-f]{40}$")
        self.assertEqual(len(unknown), 1, "只有第一批没出现过的冷钱包（TRON / USDT）使用新派生的地址")
        for r in minix.iter_csv("onchain_transfers"):
            self.assertRegex(r["from_addr"], r"^0x[0-9a-f]{40}$")
            self.assertRegex(r["to_addr"], r"^0x[0-9a-f]{40}$")
            self.assertRegex(r["tx_hash"], r"^0x[0-9a-f]{64}$")

    def test_time_window(self):
        for t in ("order_events", "match_log", "pending_states", "case_actions"):
            ts = [r["ts"] for r in minix.rows(t)]
            self.assertGreaterEqual(min(ts), "2026-03-01T00:00:00Z", t)
            self.assertLess(max(ts), "2026-03-15T01:00:00Z", t)

    def test_order_seq_and_ids(self):
        ev = minix.rows("order_events")
        ids = [e["event_id"] for e in ev]
        self.assertEqual(len(ids) - len(set(ids)), 15, "原样重传应为 15 行")
        ml = {r["match_id"]: r for r in minix.rows("match_log") if r["event_type"] == "trade"}
        orders = {e["order_id"] for e in ev if e["order_id"]}
        lost = {o for m in ml.values() for o in (m["buy_order_id"], m["sell_order_id"]) if o not in orders}
        self.assertLessEqual(len(lost), 6, "只有 S10-01 缺口里的订单可以缺下单事件")
        fills = {e["match_id"] for e in ev if e["match_id"]}
        self.assertLessEqual(fills, set(ml))
        self.assertEqual(len(set(ml) - fills), 3, "只有 S10-01 缺口里的 3 笔成交没有任何回报")

    def test_ledger_balanced_except_injected(self):
        bad = {f["trade_id"] for f in ledger_check.detect() if f["kind"] == "unbalanced"}
        self.assertEqual(len(bad), 3)
        ml = {r["match_id"] for r in minix.rows("match_log") if r["event_type"] == "trade"}
        linked = {r["trade_id"] for r in minix.rows("trade_ledger_link")}
        self.assertEqual(len(ml - linked), 4)
        self.assertLessEqual(linked, ml)

    def test_positions_and_fund_consistency(self):
        kinds = {f["kind"] for f in liq_audit.detect(verify=True)}
        self.assertNotIn("equity_mismatch", kinds)
        self.assertNotIn("fund_discontinuity", kinds)
        liqs = minix.rows("liquidations")
        self.assertEqual(liqs[0]["fund_before"], 120000.0)
        self.assertEqual(min(x["fund_after"] for x in liqs), 0.0)
        pos = {p["position_id"] for p in minix.rows("positions")}
        for x in liqs:
            self.assertIn(x["position_id"], pos)

    def test_reserves_tie_to_wallets_and_bank(self):
        self.assertEqual([f for f in reserve_check.detect(verify=True) if f["kind"] != "shortfall"], [])

    def test_synthetic_only(self):
        ip_re = re.compile(r"(?<![\d.])(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?![\d.])")
        for t in minix.TABLES_X:
            with open(minix.path_of(t)) as f:
                for line in f:
                    self.assertIsNone(ip_re.search(line), "%s 出现 IP 样式的字符串：%s" % (t, line[:80]))
        for r in minix.iter_csv("bank_statements"):
            self.assertRegex(r["counterparty_account"], r"^(ACCT-[0-9A-F]{6}|BANK-FEE|BANK-INTEREST)$")
        self.assertEqual(len({r["bank_account"] for r in minix.iter_csv("bank_statements")}), 2)


class TestAnswers(Base):
    def test_counts(self):
        got, dec = {}, {}
        for p in self.pos:
            got[p["scenario"]] = got.get(p["scenario"], 0) + 1
        for d in self.dec:
            dec[d["mimics"]] = dec.get(d["mimics"], 0) + 1
        self.assertEqual(got, POSITIVES)
        self.assertEqual(dec, DECOYS)
        ids = [p["id"] for p in self.pos] + [d["id"] for d in self.dec]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual({s["id"]: s["positive_count"] for s in load("index_x.json")["scenarios"]}, POSITIVES)

    def test_scenario_format(self):
        for sid in POSITIVES:
            d = load(sid + ".json")
            for k in ("id", "name", "window", "expected_detections", "expected_response", "positive_count", "positives", "decoys"):
                self.assertIn(k, d)
            self.assertTrue(d["expected_detections"] and d["expected_response"])
            for p in d["positives"]:
                self.assertTrue(p["window"]["start"] <= p["window"]["end"])
                self.assertTrue(p["summary"] and p["name"])

    def test_evidence_exists(self):
        for item in self.pos + self.dec:
            for tbl, ids in item["evidence"].items():
                have = {str(r[ID_COL[tbl]]) for r in minix.rows(tbl)}
                for i in ids:
                    self.assertIn(i, have, "%s 的证据 %s.%s 不存在" % (item["id"], tbl, i))

    def test_match_values_exist(self):
        """答案里的每个编号都能在数据里找到。"""
        ev = minix.rows("order_events")
        have = {"trade_id": {r["match_id"] for r in minix.rows("match_log") if r["event_type"] == "trade"}, "order_id": {e["order_id"] for e in ev if e["order_id"]},
                "action_id": {a["action_id"] for a in minix.rows("case_actions")}, "liq_id": {x["liq_id"] for x in minix.rows("liquidations")},
                "item_id": {e["item_id"] for e in minix.rows("pending_states")}, "account_id": self.accounts,
                "txn_id": {r["txn_id"] for r in minix.rows("trade_ledger_link")}}
        have["seq_key"] = {"%s:%d" % (e["symbol"], e["seq"]) for e in ev}
        have["ref"] = ({e["ref"] for e in minix.rows("pending_states") if e["ref"]} | {x["ref"] for x in minix.rows("bank_statements")} | {x["tx_hash"] for x in minix.rows("onchain_transfers")})
        have["reserve_key"] = {"%s@%s" % (r["asset"], r["date"]) for r in minix.rows("liabilities")}
        for item in self.pos + self.dec:
            self.assertTrue(item["match"] and all(v for v in item["match"].values()), item["id"])
            for f, vals in item["match"].items():
                for v in vals:
                    self.assertIsInstance(v, str)
                    if f in have:
                        self.assertIn(v, have[f], "%s 的 %s=%s 在数据里找不到" % (item["id"], f, v))

    def test_scenario_facts(self):
        by = {p["id"]: p for p in self.pos}
        self.assertEqual(len(by["S10-01"]["match"]["trade_id"]), 3)
        self.assertEqual(len(by["S10-02"]["match"]["seq_key"]), 3)
        self.assertEqual((len(by["S10-03"]["match"]["trade_id"]), len(by["S10-04"]["match"]["trade_id"]), len(by["S10-05"]["match"]["trade_id"])), (4, 3, 2))
        self.assertEqual(len(by["S12-02"]["match"]["trade_id"]), 32)
        self.assertEqual(len(by["S12-03"]["match"]["order_id"]), 32)
        self.assertEqual((len(by["S13-01"]["match"]["liq_id"]), len(by["S13-02"]["match"]["liq_id"]), len(by["S13-03"]["match"]["liq_id"])), (10, 8, 2))
        self.assertEqual(by["S14-01"]["match"]["reserve_key"], ["USD@2026-03-10", "USDT@2026-03-10", "USD@2026-03-11", "USDT@2026-03-11", "USD@2026-03-12"])
        self.assertEqual(len(by["S15-01"]["match"]["action_id"]), 7)
        self.assertEqual(len(by["S15-02"]["match"]["action_id"]), 4)
        self.assertEqual(len(by["S15-04"]["match"]["account_id"]), 3)
        # 数值
        liqs = {x["liq_id"]: x for x in minix.rows("liquidations")}
        self.assertEqual(round(sum(liqs[i]["shortfall"] for i in by["S13-02"]["match"]["liq_id"])), 178985)
        self.assertEqual(max(liqs[i]["delay_s"] for i in by["S13-01"]["match"]["liq_id"]), 660)
        self.assertEqual(min(liqs[i]["delay_s"] for i in by["S13-01"]["match"]["liq_id"]), 70)


class TestTools(Base):
    def test_baselines(self):
        for name, fn, targets, expect in BASELINES:
            res, _ = minix.score(fn(), minix.targets_of(targets))
            got = (res["hits"], res["tp_hits"], res["fp_hits"], res["recalled"], res["positives"], res["other_hits"])
            self.assertEqual(got, expect, name)

    def test_every_positive_recalled_by_some_tool(self):
        """每个场景的全部正例都能被某个脚本在默认参数下召回。"""
        want = {p["id"] for p in self.pos}
        got = set()
        for _, fn, targets, _ in BASELINES:
            if "没调过" in _ or "5%" in _:
                continue
            res, detail = minix.score(fn(), minix.targets_of(targets))
            for k, ids, h in detail:
                if k == "TP":
                    got.update(ids)
        self.assertEqual(want - got, set())

    def test_stable_output(self):
        a = subprocess.run([sys.executable, os.path.join(OPS, "lib", "recon3.py"), "--score", S14_ALL], capture_output=True, text=True).stdout
        b = subprocess.run([sys.executable, os.path.join(OPS, "lib", "recon3.py"), "--score", S14_ALL], capture_output=True, text=True).stdout
        self.assertEqual(a, b)
        self.assertIn("召回 4/4 = 100%", a)

    def test_help_and_exit_codes(self):
        for s in SCRIPTS:
            cp = subprocess.run([sys.executable, os.path.join(OPS, "lib", s + ".py"), "--help"], capture_output=True, text=True)
            self.assertEqual(cp.returncode, 0, s)
            self.assertIn("示例", cp.stdout, s)
        ok = subprocess.run([sys.executable, os.path.join(OPS, "lib", "seqcheck.py"), "--score", "S10-01,S10-02", "--min-recall", "1.0", "--max-fp", "0"], capture_output=True, text=True)
        self.assertEqual(ok.returncode, 0, ok.stdout + ok.stderr)
        bad = subprocess.run([sys.executable, os.path.join(OPS, "lib", "seqcheck.py"), "--naive", "--score", "S10-01,S10-02", "--max-fp", "0"], capture_output=True, text=True)
        self.assertEqual(bad.returncode, 1)

    def test_tuning_helps(self):
        def fp(fn, t):
            return minix.score(fn(), minix.targets_of(t))[0]["fp_hits"]
        self.assertGreater(fp(lambda: recon3.detect(), S14_ALL), fp(lambda: recon3.detect(tol_days=5, amount_tol=25), S14_ALL))
        self.assertGreater(fp(lambda: liq_audit.detect(), "S13"), fp(lambda: liq_audit.detect(min_shortfall=5000), "S13"))
        self.assertGreater(fp(lambda: reserve_check.detect(), "S14-01"), fp(lambda: reserve_check.detect(threshold=0.995), "S14-01"))
        self.assertGreater(fp(lambda: order_audit.detect(band=0.05), "S11"), fp(lambda: order_audit.detect(), "S11"))

    def test_asof_shows_unbooked_withdrawal(self):
        f = recon3.detect(asof="2026-03-11T23:59:59Z", tol_days=5, amount_tol=25)
        self.assertIn("external_unbooked", {x["kind"] for x in f})
        self.assertNotIn("external_unbooked", {x["kind"] for x in recon3.detect(tol_days=5, amount_tol=25)})


if __name__ == "__main__":
    unittest.main()
