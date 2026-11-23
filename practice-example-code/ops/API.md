# MiniEx 靶场 API（给练习章作者与读者）

所有命令从 `web3-security-101/` 出发；下文把 `practice-example-code/ops` 简写为 `$OPS`：

```bash
OPS=practice-example-code/ops
```

- 种子 20260301；时间窗 2026-03-01T00:00:00Z（周日）至 2026-03-15，UTC。
- 所有 ID、数量、数值在默认种子下固定；`answers/*.json` 是权威，本文的摘要与之一致（`tests/test_miniex.py` 校验）。
- 办公出口 IP：`192.0.2.0/24`；VPN / 云 / 商业代理：`198.18.0.0/15`；居民宽带：`100.64.0.0/10`；服务内网：`10.0.0.0/8`；攻击来源：`198.51.100.0/24`、`203.0.113.0/24`。

## 1. 数据字典

SQLite 库 `data/miniex.db` 由 `lib/load_sqlite.py` 生成（`mini.connect()` 与 `logread.py`、`replay.py` 会在数据更新后自动重建）。**空字符串与 JSON null 在库里都是 NULL**；JSONL 里的嵌套对象（`detail`、`annotations`）存成 JSON 文本，用 `json_extract(detail, '$.x')` 取值。CSV 原文件里空值是空字符串。

### 1.1 CSV 文件

| 表 | 行数（CSV 含表头行；装入 SQLite 后少 1 行） | 列 | 说明 |
|---|---:|---|---|
| accounts | 2000 | account_id, country, kyc_level(0–3), registered_at, risk_tag | risk_tag：normal / vip / institution / market_maker / new_user / watch |
| logins | 15301 | login_id, ts, account_id, ip, device_id, result, mfa_method | result：success / failed_password / failed_mfa；mfa_method：none / sms / totp / passkey / recovery_flow |
| recoveries | 37 | recovery_id, ts, account_id, ip, device_id, channel, result, review_type, completed_ts | channel：email / sms / support_kyc；result：success / denied / pending |
| account_events | 230 | event_id, ts, account_id, event_type, ip, device_id, detail | event_type：phone_change / mfa_reset / mfa_unbind / add_withdraw_address / create_api_key / api_key_perm_add；detail 形如 `key=K0001;perm=withdraw` |
| api_keys | 32 | key_id, account_id, created_ts, perms, ip_allowlist, status | perms 逗号分隔：read / trade / withdraw；ip_allowlist 空 = 未绑定 |
| api_calls | 31595 | call_id, ts, key_id, account_id, ip, perm_used, action, result | perm_used：read / trade / withdraw；action 含 create_withdrawal |
| orders_trades | 11803 | trade_id, ts, symbol, price, qty, quote_qty, buy_order_id, sell_order_id, buyer_account_id, seller_account_id, buyer_ip, seller_ip, buyer_device, seller_device | 一行一笔成交（订单信息折进成交行）；symbol：BTC-USDT / ETH-USDT / XYZ-USDT / ABC-USDT（后两者薄盘） |
| marks | 16133 | ts, symbol, index_price, mark_price, source_count | 每 5 分钟一行、每标的一条；source_count 为有效外部价格来源数 |
| ledger | 104621 | entry_id, ts, txn_id, account_id, sub, asset, direction, amount, amount_usd, entry_type, ref_id | 双分录：同一 `txn_id` + `asset` 下借贷相等（自检校验）；sub：available / frozen / asset / revenue；account_id 可为 `HOUSE:WALLET`、`HOUSE:FEE`；entry_type：deposit / withdrawal / freeze / unfreeze / fee / trade / internal_transfer |
| withdrawals | 1308 | wd_id, ts, account_id, chain, asset, to_address, amount, amount_usd, status, channel, key_id, addr_added_ts, approval_id, tx_hash | status：completed / rejected / pending / frozen；channel：web / api；addr_added_ts 是该地址加入地址簿的时间（判断“新地址”）；completed 才有 approval_id 与 tx_hash |
| chain_txs | 2552 | tx_hash, ts, chain, asset, from_addr, to_addr, from_tier, to_tier, amount, amount_usd, kind, wd_id, account_id, request_id | tier：external / deposit / hot / warm / cold；kind：deposit / withdrawal / rebalance；withdrawal 行的 wd_id 指向提币申请；request_id 指向签名请求 |
| approvals | 1298 | approval_id, ts, type, subject_id, to_address, asset, amount, approved_by, approver_count, status | type：withdrawal（`AP-<wd_id>`，≥ 20,000 美元为 2 人人工，其余为 risk-engine）/ treasury_transfer（`AP-Txxxx`、`AP-Exxx`）；status：approved / approved_post_hoc |
| staff | 67 | staff_id, role, team, shift, employed, left_date, privilege, granted_ts, expires_ts, approver_id | 每个（员工, 特权）一行；role：support / developer / sre / treasury / security / finance / compliance |
| support_access | 4866 | access_id, ts, staff_id, action, target_account_id, field_group, ticket_id, ip | action：view_profile / view_kyc / export_kyc；ticket_id 空 = 无工单；客服日班办公时间 08:00–20:00 UTC，ST012–ST014 为夜班 |
| controls_matrix_template.csv | 10 | domain, related_chapters, control_id, control, priority, verification_method, owner, status, evidence_ref | 空白模板，只有 domain 与 related_chapters 已填 |

（`controls_matrix_template.csv` 不装入 SQLite。）

### 1.2 JSONL 文件

| 表 | 行数 | 字段 | 说明 |
|---|---:|---|---|
| signing_requests | 1302 | request_id, ts, source, requester, wallet_tier, chain, asset, to_address, amount, amount_usd, approval_id, calldata_hash, signer_result | source：hot-withdraw-svc / treasury-transfer；signer_result：signed / rejected_duplicate；approval_id 可为空 |
| cloud_audit | 4586 | event_id, ts, identity, identity_type, action, resource, source_ip, user_agent, result, detail | identity 为员工号（user）或 `role/...`；detail.access_key 形如 `AKSIMxxx`（合成） |
| k8s_audit | 2235 | event_id, ts, user, user_type, verb, resource, subresource, namespace, name, source_ip, response_code, annotations | user_type：human / serviceaccount；exec = resource `pods` + subresource `exec`；annotations 可含 change_id；命名空间 signing 为签名服务 |
| ci_events | 4822 | event_id, ts, run_id, repo, workflow, event_type, actor, branch, detail | event_type：workflow_trigger / action_use / dependency_install / artifact_build / artifact_sign / publish；detail 见下 |
| endpoint_events | 2540 | event_id, ts, host, user, event_type, image, parent_image, cmdline, dest_ip, dest_port | 开发机（`dev-mbp-0xx`）进程与外联；event_type：process_start / net_connect |

`ci_events.detail`：`action_use` → `{action, ref}`（ref 为 40 位提交哈希或标签 / 分支）；`dependency_install` → `{package, version, integrity, lock_integrity, ...}`；`artifact_build` → `{artifact, sha256, channel}`；`artifact_sign` → `{artifact, sha256, signature}`；`publish` → `{artifact, sha256, channel, signature}`（channel：ci / nightly / release）；`workflow_trigger` → `{trigger}`。

### 1.3 workflows/

`data/workflows/ci.yml`（合规）、`docs.yml`（官方 Action 用标签引用，低风险）、`release.yml`（**故意有 9 处缺陷**，清单在 `answers/S8.json` 的 `workflow_defects`），以及 `lockfile.sample.json`（package-lock 片段，含 6 个依赖的 integrity，对应 `ci_events` 里的 `lock_integrity`）。

### 1.4 常用事实（练习章可直接引用）

- 热钱包地址 = `wallet('hot', chain)`；chain_txs 里 `from_tier='hot' AND kind='withdrawal'` 是用户提币出金。数据里的地址都用 `0x` + 40 位十六进制表示（BTC、TRON 也是，纯属合成，不代表真实格式）。
- 正常提币：风控自动审批（risk-engine）→ 签名请求 → 链上转出；≥ 20,000 美元为 2 人审批，审批晚于申请 30–120 分钟。**例外（有意设计）**：S1-03 那笔 25,000 美元提币（`W000889`，审批单 `AP-W000889`）只有 1 个审批人（ST033），用于练习“金额门槛下的审批缺口”（见 B72、B74、B76）。
- 新增提币地址的正常用户行为：多数在使用前 25 小时以上添加；约 3% 的小额提币在添加后一小时内使用（噪声）。
- 员工治理发现（非 S 场景）见 `answers/governance.json`：G1 离职员工 ST015 的 kyc_read 仍有效且有一次访问；G2 ST050 的 prod_exec 已过期仍 exec 成功；G3 ST051 的 cloud_admin 无审批人。

## 2. 场景答案摘要（S1–S9）

答案文件：`answers/S1.json` … `answers/S9.json`、`answers/index.json`。每个正例含 `id`、`window`、`match`（可用于匹配的字段值）、`summary`、`evidence`（涉及的行 ID）；每个场景文件还有 `expected_detections`（应触发的检测）与 `expected_response`（应有的处置）。

| ID | 时间窗（UTC，2026-03-） | 涉及实体（`match`） | 一句话 |
|---|---|---|---|
| S1-01 | 04 01:00–02:00 | A01367；IP 203.0.113.10–15；wd W000279 | 无 MFA 账户撞库成功 -> 改手机 -> 加新地址 -> 28 分钟后提走 18,400 USDT，已完成 |
| S1-02 | 04 01:20–05:00 | A00981；同上 6 个 IP；wd W000293 | 短信找回 -> 重置 MFA -> 加新地址 -> 3 小时后申请 9,200 美元等值 ETH，被风控冻结 |
| S1-03 | 09 06:00–10 14:00 | A01432；IP 203.0.113.31/32；wd W000889 | 低慢撞库（40 账户 8 小时）-> 找回 -> 重置 MFA -> 新地址 -> 22 小时后提 25,000 USDT |
| S2-01 | 06 03:00–04:00 | key K0001（账户 A00208）；IP 198.51.100.21；wd W000476、W000478 | 已有 Key 被加提币权限，新 IP 两次提币共 12,900 USDT |
| S2-02 | 11 22:30–23:30 | key K9001（A01399）；IP 198.51.100.45/46/47；wd W001035 | 新建带提币权限且无白名单的 Key，3 个新 IP 轮换，提币被拒绝 |
| S3-01 | 08 09:00–17:00 | 归集账户 A00476 等共 10 个账户；wd W000717–719 | 9 个新账户小额入金 -> 内部转归集账户 -> 3 个地址提走 95% |
| S3-02 / S3-03 | 13 08:00–16:00 | A01228 / A00112；wd W001171 / W001182 | 6 笔 1.1–1.9k 入金后 2.5 小时整笔提走；总额约 9k，低于 20k 阈值 |
| S4-01 | 06 02:10–04:15 | A01486、A00177、A01297；2 个共用 IP | XYZ-USDT 三账户环形对敲，2 小时 90 笔 |
| S4-02 | 10 06:00–22:00 | 4 个账户（A01976、A00006 等），共用 IP 100.107.140.199 | ETH-USDT 四账户全天对敲 120 笔 |
| S4-03 | 12 13:30–14:00 | symbol ABC-USDT；A01699、A01052 | 标记价偏离指数 5%–15%，连续 6 个采样点，来源数 3 |
| S5-01 | 07（周六）02:07–03:42 | ST007 | 186 个账户 KYC，无工单，非办公 IP |
| S5-02 | 11 23:48–12 00:38 | ST011 | 74 个账户 KYC + 一次导出，无工单 |
| S6-01 | 06 16:20 | SR000538；to 0xd687f6ac…；tx 0xe4e30013… | 热钱包签名请求无审批单，链上已转出约 48,000 美元（无对应提币申请） |
| S6-02 | 09 21:05 | SR000828；审批 AP-W000829；to 0xbf491b67… | 借用 150 USDT 提币审批单，地址与金额都被换（60,000 USDT），已上链 |
| S6-03 | 12 02:15 | SR001044；审批 AP-T0048；to 0x8dc7d972… | 温 -> 热 调拨审批目标是热钱包，请求目标被换成陌生地址，金额一致（250,000 USDT） |
| S7-01 | 09 11:02–11:52 | ST021；host dev-mbp-021；IP 203.0.113.77（隧道）、198.51.100.77（云凭证来源） | 外联隧道 -> 云凭证外部读取 prod/signing-config -> signing 命名空间 get secret + exec 成功 |
| S7-02 | 12 15:10–16:00 | ST024；host dev-mbp-024；IP 203.0.113.78 / 198.51.100.78 | 同样的前半段，k8s 读取 secret 返回 403 |
| S8-01 | 10 15:20 | run-00503；package web3-helper | 安装 2.3.1，哈希与 lockfile（2.3.0）不符 |
| S8-02 | 11 11:00 | run-00504；action thirdparty/setup-foo | release.yml 用未固定的第三方 Action（@main），pull_request_target 触发 |
| S8-03 | 13 17:40 | run-00505；artifact wallet-service:v1.8.0 | release 通道发布无签名制品 |

**S9 噪声**（`answers/S9.json`，共 103 个，字段同上，另有 `mimics`、`category`、`why_benign`）：

| 模拟 | 数量 | 例子 |
|---|---:|---|
| S1 | 12 | 8 个真实用户找回后用老地址提币 ≥ 1000；3 个换手机时整理地址簿；周一早晨办公室 NAT 出口 30 人输错密码（IP 198.18.250.7） |
| S2 | 6 | 4 个机器人迁服务器（新 IP，无权限变更）；2 个所有者本人给带白名单的 Key 加提币权限 |
| S3 | 7 | 2 个做市商日周转、3 个机构结算、2 个清户的普通用户 |
| S4 | 4 | 做市商同机房两账户对冲 140 笔；家庭共用设备 3 笔小额；ETH 单点尖峰 5.3%；XYZ 单来源故障偏离 9% |
| S5 | 3 | 合规集中复核（有工单、办公 IP）；夜班客服 3 晚各 70 条（有工单）；主管峰值一小时 80 条资料 |
| S6 | 12 | 4 笔地址大小写不同；3 笔重试（rejected_duplicate）；2 笔紧急调拨补签；3 笔实际金额小于审批 |
| S7 | 11 | 3 个开发者开演示隧道（ngrok / cloudflared）；2 个在家用商业 VPN 读 dev/db；6 次值班 SRE 持变更单 exec 进入 signing |
| S8 | 48 | 14 个每晚 nightly 无签名发布；28 次文档站标签引用；3 次带 lockfile 更新的依赖升级；3 次无 lockfile 的实验仓库 |

另有未单独登记的背景噪声：随机输错密码、新设备登录、新增地址与改绑、API 机器人调用等。

## 3. lib 脚本

### 3.1 `lib/mini.py`（Python 模块）

```python
import sys; sys.path.insert(0, "practice-example-code/ops/lib")
import mini
db = mini.connect()                      # sqlite3.Connection，row_factory=Row，必要时自动重建
rows = mini.q(db, "SELECT * FROM withdrawals WHERE amount_usd > :x", {"x": 10000})   # list[dict]
for r in mini.iter_csv("logins"): ...    # 逐行读 CSV（空串 -> None）
for r in mini.iter_jsonl("cloud_audit"): ...   # 逐行读 JSONL，嵌套字段保持 dict
pos, dec = mini.load_answers()           # 标准答案正例 / S9 噪声
```

### 3.2 `lib/load_sqlite.py`

`python3 $OPS/lib/load_sqlite.py [--db 路径]` 把 `data/` 装进 SQLite 并打印各表行数。

### 3.3 `lib/logread.py`

```bash
python3 $OPS/lib/logread.py --tables                       # 表与行数
python3 $OPS/lib/logread.py --schema withdrawals           # 列
python3 $OPS/lib/logread.py logins --where result=failed_password --since 2026-03-04T01:00:00Z --until 2026-03-04T01:10:00Z --limit 5
python3 $OPS/lib/logread.py k8s_audit --where namespace=signing --where subresource=exec --fmt json
python3 $OPS/lib/logread.py withdrawals --where status=frozen --count
python3 $OPS/lib/logread.py --sql "SELECT status, COUNT(*) n FROM withdrawals GROUP BY status"
```

选项：`--where 列=值`（可重复，`NULL` 表示 IS NULL）、`--since/--until`（对 `ts`）、`--limit`（默认 20）、`--fmt table|csv|json`、`--count`、`--sql`（只允许 SELECT / WITH）。

### 3.4 `lib/replay.py`：规则回放

输入一个规则文件，在数据上运行，输出命中，并对标准答案给出召回、误报、精确率。

**SQL 规则**（SQLite 方言；一条 SELECT，每行是一次告警）：

```sql
-- id: my_rule
-- scenario: S1            要召回的场景，或具体答案编号如 S4-03、S1,S2-01
-- param: min_users=20     可调参数，SQL 里写 :min_users
SELECT ip, MIN(ts) AS ts, COUNT(DISTINCT account_id) AS users
FROM logins WHERE result = 'failed_password'
GROUP BY ip, CAST(strftime('%s', ts) / 600 AS INTEGER)
HAVING users >= :min_users
```

**Python 规则**：定义 `META = {"id": ..., "scenario": "S7", "params": {...}}` 与 `detect(db, params)`，返回 dict 列表（`db` 是 sqlite3 连接，可用 `mini.q`）。

**命中字段（用于对答案）**：规则输出里出现下列任一列名即可参与匹配（值与答案 `match` 中的任一值相同即命中该答案）：`account_id`、`ip`、`key_id`、`wd_id`、`request_id`、`to_address`、`tx_hash`、`staff_id`、`host`、`run_id`、`symbol`、`approval_id`、`package`、`action`、`artifact`。可选 `ts`（ISO 时间），`symbol` 类答案会按时间窗（±30 分钟）校验。

**判定口径**：命中 -> 目标场景的答案 = **TP**；其他场景的答案 = 其他场景真阳性（不算误报）；匹配 S9 噪声 = **FP-噪声**；都不匹配 = **FP-未解释**。召回 = 目标答案中被至少一次命中的比例。

```bash
python3 $OPS/lib/replay.py $OPS/answers/reference_rules/r03_change_then_add_address.sql
python3 $OPS/lib/replay.py my_rule.sql --param min_users=40 --show 20       # 覆盖参数
python3 $OPS/lib/replay.py my_rule.sql --scenario S1 --min-recall 1.0 --max-fp 3   # 不达标退出码 1
python3 $OPS/lib/replay.py my_rule.sql --json                               # 全量 JSON 结果
python3 $OPS/lib/replay.py --dir $OPS/answers/reference_rules               # 汇总所有规则
```

示例输出：

```text
规则：r03_change_then_add_address   参数：{'gap_min': 30, 'wd_hours': 24, 'min_usd': 1000}
目标场景：S1
命中 3 条：TP 3，误报 0（噪声/未解释的不同实体 0），其他场景的真阳性 0
召回：3/3 = 100%   精确率：100%
```

## 4. 参考规则与基准结果（`answers/reference_rules/`，练习做完再看）

默认参数下的结果（也是 `tests/test_miniex.py` 的断言）：

| 规则文件 | 对应 X 章 | 目标 | 命中 | TP | 误报 | 召回 | 备注 |
|---|---|---|---:|---:|---:|---:|---|
| r01_credential_stuffing | X08 规则 1 | S1 | 12 | 11 | 1 | 2/3 | 误报是办公室 NAT；`min_users=40` 去掉；S1-03 低慢撞库本规则抓不到 |
| r02_recovery_withdraw_naive | X08 规则 2 | S1 | 11 | 2 | 9 | 2/3 | 朴素版，误报多；S1-01 没有找回动作 |
| r02b_recovery_withdraw_tuned | X08 规则 2 调优 | S1 | 2 | 2 | 0 | 2/3 | 加“新地址”条件后误报归零 |
| r03_change_then_add_address | X08 规则 3 | S1 | 3 | 3 | 0 | 3/3 | 加“24 小时内向该地址提币 ≥ 1000”后 |
| r04_api_key_new_ip_withdraw | X08 规则 4/7 | S2 | 2 | 2 | 0 | 2/2 | 开权限 / 建 Key 后 60 分钟内新 IP 提币类调用 |
| r05_funnel_fast_in_out | X13 规则示例 1 | S3 | 3 | 3 | 0 | 3/3 | `min_in_usd=20000`（手册示例）只召回 1/3，需调到 8000 并加来源数 |
| r06_wash_trading | X10 市场监测 | S4-01、S4-02 | 8 | 6 | 2 | 2/2 | 误报是做市商；`exclude_mm=1` 归零 |
| r07_mark_deviation | X10 标记价 | S4-03 | 1 | 1 | 0 | 1/1 | 连续 3 点 + 来源 ≥ 3；`--param min_rows=1` 多 1 个误报（ETH 单点尖峰），再加 `--param min_sources=1` 共多 2 个（含 XYZ 单来源故障） |
| r08_support_bulk_no_ticket | X08 规则 6 | S5 | 3 | 3 | 0 | 2/2 | 无工单 + 小时内 ≥ 40 个账户或有导出 |
| r09_signing_without_approval | X11 / X05 | S6 | 5 | 3 | 2 | 3/3 | 2 个误报是紧急调拨补签（approvals.status = approved_post_hoc），需结合应急流程判断 |
| r10_chain_tx_without_request | X11 三方对账 / X05 | S6-01、S6-02 | 2 | 2 | 0 | 2/2 | 只能抓到“无提币申请”的出金，抓不到 S6-03 |
| r11_dev_chain_to_signing | X05 链式关联 | S7 | 2 | 2 | 0 | 2/2 | 端点 -> 云 -> K8s 三步关联 |
| r12_ci_pinning | X04 | S8-02 | 1 | 1 | 0 | 1/1 | 只看 release.yml；去掉 workflow 限制会多出文档站的 56 条误报（28 次运行） |
| r13_ci_dependency_integrity | X04 | S8-01 | 1 | 1 | 0 | 1/1 | 实验仓库无 lockfile 要排除 |
| r14_ci_unsigned_release | X04 | S8-03 | 1 | 1 | 0 | 1/1 | 只看 channel=release |

调参实验（均有自检）：

```bash
python3 $OPS/lib/replay.py $OPS/answers/reference_rules/r01_credential_stuffing.sql --param min_users=40   # 误报 1 -> 0，召回仍 2/3
python3 $OPS/lib/replay.py $OPS/answers/reference_rules/r06_wash_trading.sql --param exclude_mm=1          # 误报 2 -> 0
python3 $OPS/lib/replay.py $OPS/answers/reference_rules/r05_funnel_fast_in_out.sql --param min_in_usd=20000   # 召回 3/3 -> 1/3
```

## 5. 给练习章作者的约定

- 过关标准用 `replay.py` 的数值表达，例如“回放中召回 S1 的全部 3 次，误报不超过 N 条”；N 取自上表（可略放宽，但不要比参考规则更严）。
- 新增脚本放 `$OPS/lib/`（共用）或 `$OPS/solutions/<章>/`（参考实现），不要改别人的脚本。
- 章内引用的 ID、路径、数值以 `answers/` 与本文为准；章内命令请在本机逐条运行确认。
- 练习用的规则文件放在读者自己的工作目录（如 `my_rules/`），`replay.py` 接受任意路径。
