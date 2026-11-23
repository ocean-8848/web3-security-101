# MiniEx 靶场（链下 L3 赛道共用）

MiniEx 是一个**虚构**的小型交易所。所有数据由 `gen/generate.py` 按固定随机种子合成，不含真实用户、真实地址或真实密钥；IP 只用保留段（100.64.0.0/10、198.18.0.0/15、192.0.2.0/24、198.51.100.0/24、203.0.113.0/24、10.0.0.0/8），链上地址是哈希出来的随机十六进制串，云密钥以 `AKSIM` 开头。

只用 Python 3（≥ 3.9）标准库，不联网。数据与答案由种子决定：同一种子两次生成，所有文件逐字节一致。

## 一键生成

在 `web3-security-101/` 目录运行：

```bash
bash practice-example-code/ops/setup.sh              # 生成数据 + 装载 SQLite + 跑自检 + 回放参考规则
bash practice-example-code/ops/setup.sh --no-tests   # 只生成与装载
```

第一批生成约 2 秒、第二批约 1 秒；`data/` 约 66 MB（含 SQLite 库），`data_x/` 约 13 MB；两批自检共约 20 秒。`data/` 不进仓库（`ops/.gitignore`），可随时重新生成；`answers/` 进仓库。

## 目录

```
ops/
├── README.md        本文件
├── API.md           数据字典、场景答案摘要、脚本用法（给练习章作者与读者查）
├── API_X.md         第二批（S10–S15）的数据字典、场景答案摘要、脚本用法与召回 / 误报基线
├── setup.sh         一键生成与自检
├── gen/generate.py  数据生成器（固定种子 20260301）
├── gen/generate_x.py 第二批数据生成器（固定种子 20260302，S10–S15）
├── data/            生成的数据（忽略）：20 个日志 / 表文件 + workflows/ + miniex.db
├── data_x/          第二批数据（忽略）：13 个文件，见下文“第二批靶场”
├── answers/         S1–S9 标准答案、governance.json、index.json、reference_rules/（参考规则，做完练习再看）；S10–S15 与 index_x.json（第二批）
├── lib/             mini.py（读日志、SQLite）、load_sqlite.py、logread.py、replay.py（规则回放）；
│                    minix.py 与 seqcheck / ledger_check / replay_match / recon3 / state_audit / case_audit / order_audit / liq_audit / reserve_check（第二批）
└── tests/           test_miniex.py（13 项自检）、test_miniex_x.py（第二批，21 项）
```

## 场景速览

| 场景 | 内容 | 答案条数 | 对应练习章 |
|---|---|---|---|
| S1 | 账户接管：撞库成功 -> 改绑 / 找回 -> 新地址大额提币 | 3 | B72、B76 |
| S2 | API Key 滥用：新开提币权限的 Key 从新 IP 调用 | 2 | B72 |
| S3 | 洗钱漏斗：小额入账汇聚后快速提走 | 3 | B72 |
| S4 | 对敲刷量与标记价偏离 | 3 | B72 |
| S5 | 客服非工作时间批量查看 / 导出 KYC | 2 | B73 |
| S6 | 签名服务异常：缺审批单、地址 / 金额与审批单不一致 | 3 | B73、B74、B76 |
| S7 | 开发终端失陷痕迹：外联工具 -> 云凭证外部使用 -> 签名命名空间 | 2 | B73、B76 |
| S8 | 供应链：被篡改依赖、未固定 Action、未签名发布 | 3 | B75 |
| S9 | 误报与噪声：103 个“看起来可疑但正常”的事件 | — | 全部（调参） |

## 常用命令

```bash
python3 practice-example-code/ops/lib/logread.py --tables                  # 所有表与行数
python3 practice-example-code/ops/lib/logread.py logins --where result=failed_password --limit 5
python3 practice-example-code/ops/lib/logread.py --sql "SELECT status, COUNT(*) n FROM withdrawals GROUP BY status"
python3 practice-example-code/ops/lib/replay.py my_rule.sql                # 回放你的规则，对答案
python3 practice-example-code/ops/lib/replay.py --dir practice-example-code/ops/answers/reference_rules
python3 -m unittest discover -s practice-example-code/ops/tests -v         # 靶场自检
```

完整说明见 [API.md](API.md)。

## 第二批靶场：工程验收与运营恢复（S10–S15）

在第一批之上新增六个场景，练习“工程验收”（订单序号、撮合回放、成交与分录、储备与对账）和“运营恢复”（切主、强平与穿仓、复付与复市）。**数据与答案独立**：种子 20260302，数据写在 `data_x/`（不进仓库），第一批的数据、答案、脚本、自检一概不改。`setup.sh` 会一并生成并自检。

| 场景 | 内容 | 答案条数 | 主要脚本 | 对应练习章 |
|---|---|---|---|---|
| S10 | 订单序号缺口与冲突；成交—分录缺失、借贷不平、估值错 | 5 | `seqcheck.py`、`ledger_check.py` | B79 |
| S11 | 异常价格成交；撤单 / 撤权后仍成交 | 3 | `order_audit.py` | B79、B83 |
| S12 | 撮合过载与切主：脑裂窗口内双主写入、重复成交、超量成交 | 3 | `replay_match.py` | B79、B80 |
| S13 | 强平延迟导致穿仓，保险基金耗尽 | 3 | `liq_audit.py` | B80 |
| S14 | 储备与负债差额；银行 / 链上 / 账务三方对账不平，含假回执与悬挂 | 5 | `reserve_check.py`、`recon3.py`、`state_audit.py` | B81、B82 |
| S15 | 事故后复付与复市：解除限制无授权人、业务端未回报、法定冻结被无依据解除 | 4 | `case_audit.py` | B80、B83 |

新增数据集：`order_events.jsonl`、`match_log.jsonl`、`trade_ledger_link.csv`、`positions.csv`、`liquidations.csv`、`bank_statements.csv`、`wallet_balances.csv`、`onchain_transfers.csv`、`reserve_snapshots.csv`、`liabilities.csv`、`pending_states.jsonl`、`cases.csv`、`case_actions.jsonl`（共约 6.4 万行）。每个场景周围有大量正常事件与“看起来可疑但正常”的噪声（公告的序号预留、合法的部分成交、周末入账、中间行费、超时重广播……），用于练习调参。

```bash
bash practice-example-code/ops/setup.sh                                   # 一并生成第二批并自检
python3 practice-example-code/ops/lib/seqcheck.py --score S10-01,S10-02       # 序号缺口与冲突
python3 practice-example-code/ops/lib/ledger_check.py --score S10-03,S10-04,S10-05
python3 practice-example-code/ops/lib/replay_match.py --score S12             # 切主窗口与重复成交
python3 practice-example-code/ops/lib/recon3.py --tol-days 5 --amount-tol 25 --score S14-02,S14-03,S14-04,S14-05
python3 practice-example-code/ops/lib/recon3.py --asof 2026-03-11T23:59:59Z --tol-days 5 --amount-tol 25   # 03-11 日终的差异
python3 practice-example-code/ops/lib/state_audit.py --score S14-03,S14-04,S14-05
python3 practice-example-code/ops/lib/case_audit.py --score S15
python3 -W ignore -m unittest discover -s practice-example-code/ops/tests -p 'test_miniex_x.py' -v   # 第二批自检（21 项）
```

九个脚本都有 `--help`、可 `import`、输出稳定，并带 `--score` 对答案评分、`--naive` 对比“没调过”的参数。默认参数下，全部 23 条答案都能被召回；基线的召回与误报数字、数据字典、场景答案摘要见 [API_X.md](API_X.md)。**先做练习，再看 `answers/S10.json … S15.json`。**

## 使用约定

- **先做练习，再看 `answers/`。** 练习章会告诉你何时对照。
- 数据里的“攻击”只描述事件长什么样（日志与账务上的痕迹），没有针对真实系统的步骤。
- 时间基准：2026-03-01 00:00 UTC（周日）起 14 天，所有时间戳为 UTC、ISO 8601、以 `Z` 结尾。
- 要换种子：`setup.sh --seed N`。答案文件会随之改变，练习章与自检里的数值都按默认种子 20260301。
