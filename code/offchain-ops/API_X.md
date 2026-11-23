# MiniEx 靶场 API · 第二批（S10–S15：工程验收与运营恢复）

给练习章作者（B79–B83）与读者查。第一批（S1–S9）见 [API.md](API.md)，本文件只写第二批新增的数据、场景与脚本；两批互不改动。

所有命令从 `web3-security-101/` 出发；下文把 `code/offchain-ops` 简写为 `$OPS`：

```bash
OPS=code/offchain-ops
bash $OPS/setup.sh        # 生成第一批 + 第二批数据，跑两批自检（约 20 秒）
```

- 第二批种子 **20260302**（`gen/generate_x.py`），与第一批种子 20260301 独立；时间窗相同：2026-03-01T00:00:00Z（周日）起 14 天，UTC。
- 数据写入 `$OPS/data_x/`（不进仓库，可随时重新生成）。**没有放进 `data/`**：第一批自检会把整个 `data/` 与重新生成的结果逐字节比较，放进去会让原有自检失败。
- 只读取第一批的 `data/accounts.csv`（账户）、`marks.csv`（标记价）、`chain_txs.csv`（钱包地址）、`staff.csv`（员工角色），不改写任何第一批文件。
- 答案：`$OPS/answers/S10.json … S15.json` 与 `index_x.json`。格式同第一批（`positives`），噪声放在每个场景自己的 `decoys` 里（按类别分组，`match` 列出该类别的全部编号）。**做完练习再看。**
- 全部合成：不含真实用户、地址、密钥，没有 IP；银行账户是 `ACCT-` 加 6 位十六进制；链上地址是哈希出来的随机串。
- 数值在默认种子下固定，`tests/test_miniex_x.py`（21 项）校验数据行数、答案与数据一致、以及下文每个脚本的召回 / 误报基线。
- 只用 Python 3 标准库（≥ 3.9，已在 macOS 系统 python3 3.9.6 上跑通）。

## 1. 数据字典

空值：CSV 里是空字符串，JSONL 里是 `null`。`lib/minix.py` 读取时统一成 `None`，数值列转成 float。

| 文件 | 行数（不含表头） | 一行是什么 |
|---|---:|---|
| order_events.jsonl | 22,242 | 订单事件（每个品种各自编号 seq） |
| match_log.jsonl | 4,962 | 撮合引擎日志（含主备节点、epoch） |
| trade_ledger_link.csv | 17,819 | 成交到分录的关联表（一行一条分录） |
| positions.csv | 13,174 | 永续合约持仓的小时快照 |
| liquidations.csv | 107 | 强平记录（含保险基金变动） |
| bank_statements.csv | 248 | 银行流水 |
| wallet_balances.csv | 168 | 热 / 温 / 冷钱包日终余额 |
| onchain_transfers.csv | 680 | 链上转账（热钱包对外转入 / 转出，及内部调拨）。**简报没列，补充的外部事实源** |
| reserve_snapshots.csv | 168 | 每日储备快照 |
| liabilities.csv | 168 | 每日负债快照 |
| pending_states.jsonl | 3,469 | 提币 / 充值状态机事件（764 个单据） |
| cases.csv | 245 | 反欺诈案件 |
| case_actions.jsonl | 424 | 案件处置动作（限制、解除、法定冻结、撤权） |

### 1.1 order_events.jsonl

| 列 | 说明 |
|---|---|
| event_id | `OE000001` 起；原样重传的行 event_id 相同；序号冲突的额外行是 `OE9xxxxx` |
| seq | **按品种**从 1 连续编号的网关序号 |
| ts | 事件时间（秒） |
| symbol | BTC-USDT / ETH-USDT / XYZ-USDT / ABC-USDT |
| event_type | new 下单；cancel 撤单确认；partial_fill 部分成交；fill 全部成交（累计量达到订单量）；reject 拒绝；seq_skip 运维公告的序号预留 |
| order_id | `OX000001` 起；冲突序号的额外订单是 `OXD0000x` |
| account_id, side | 账户（取自第一批 accounts.csv）、buy / sell |
| price, qty | new / reject：订单价与订单量；fill / partial_fill：成交价与本次成交量；cancel：撤掉的剩余量 |
| order_qty | 该订单的总量（所有事件都带，用于核对超量成交） |
| filled_qty | 到该事件为止的累计成交量 |
| match_id | fill / partial_fill 对应的撮合成交编号（`MT000001` 起） |
| reason | reject 的原因：insufficient_balance、rate_limit、price_band、account_restricted、too_late_to_cancel、overload_shed；seq_skip 为 reserved_range |
| source | 网关 gw-1 / gw-2；序号服务 seq-svc |
| seq_to | 仅 seq_skip：被预留的区间是 seq+1 … seq_to |

事件类型计数：new 10,846；fill 5,228；cancel 3,986；partial_fill 1,914；reject 260；seq_skip 8。

### 1.2 match_log.jsonl

| 列 | 说明 |
|---|---|
| log_id, ts | `ML000001` 起 |
| node, epoch, role | 引擎节点 me-a / me-b；该节点当时的 epoch；primary / standby |
| engine_seq | 该节点的撮合序号。正常切主时新主**接续**旧主的序号；脑裂时两个节点从同一个值各自往下数（序号撞车） |
| event_type | trade 成交；role_change 角色变更；heartbeat 心跳（每 30 分钟，主备各一条）；overload_shed 过载限流 |
| symbol, match_id, price, qty, buy_order_id, sell_order_id | 仅 trade |
| shed | 仅 overload_shed：被限流的订单数 |

主备时间线：03-01 起 me-a 为 primary（epoch 1）；03-06 03:00 **计划切主**，me-a 02:59:58 降为 standby，me-b 03:00:00 以 epoch 2 晋升；03-11 14:07:10 me-a 以 epoch 3 晋升，me-b 直到 14:09:40 才被围栏（S12）。

### 1.3 trade_ledger_link.csv

| 列 | 说明 |
|---|---|
| link_id, ts | `LK000001` 起；入账时间（正常比成交晚 0.5–4 秒，批量入账会晚 5–25 分钟） |
| trade_id, txn_id | 对应 match_log 的 match_id；`TXN-` + match_id |
| account_id | 账户；手续费池是 `FEE-POOL` |
| asset, direction, amount, amount_usd | 资产、debit / credit、金额、按成交价折美元 |
| leg | quote 计价币、base 基础币、fee 手续费 |
| symbol | 品种 |

记账约定：买方计价币借方 = 价格 × 数量（四舍五入到分）；卖方计价币贷方 = 该金额 − 手续费；`FEE-POOL` 贷方 = 手续费（费率 0.05%，四舍五入到分）；卖方基础币借方 = 数量；买方基础币贷方 = 数量。每个 txn 按资产汇总借贷应相等。

### 1.4 positions.csv 与 liquidations.csv

`positions.csv`：永续合约（BTC-PERP、ETH-PERP、XYZ-PERP、ABC-PERP 的标记价取自第一批 marks.csv；**QRS-PERP 是只在 S13 出现的薄流动性合约，标记价在本表里自带**）。每个持仓每小时整点一行。

| 列 | 说明 |
|---|---|
| ts, account_id, position_id, symbol, side | `PS00001` 起；long / short |
| qty, entry_price, mark_price, leverage | |
| margin | 保证金（低杠杆持仓在接近强平线时会追加，是噪声） |
| notional, equity, margin_ratio, mmr | 名义价值 = qty × mark；权益 = margin + 浮盈亏；margin_ratio = equity / notional；mmr 维持保证金率（BTC / ETH 2%，XYZ 4%，ABC 5%，QRS 3%）。margin_ratio ≤ mmr 触发强平 |

`liquidations.csv`：

| 列 | 说明 |
|---|---|
| liq_id, trigger_ts, exec_ts | `LQ00001` 起；触发时间与执行时间 |
| account_id, position_id, symbol, side, qty, entry_price, margin | |
| trigger_mark, exec_price | 触发时标记价；实际成交价（带滑点） |
| equity_at_exec | 执行后权益；**负数 = 穿仓** |
| shortfall | 穿仓缺口（权益为负时的绝对值） |
| fund_delta, fund_before, fund_after | 保险基金变动：正常强平收到 0.5% 清算费，穿仓时从基金里支付 |
| unfunded_loss, adl | 基金不够时未覆盖的亏损；是否触发自动减仓 |
| delay_s | exec − trigger 的秒数 |

保险基金起始 120,000 美元。

### 1.5 银行、链上、钱包、储备、负债

`bank_statements.csv`：stmt_id（`BS000001` 起）、ts、bank_account（BK-OPS-1 / BK-OPS-2）、channel（wire 电汇、fee 银行手续费、sweep 行间划转、return 退回 / 回拨、interest 利息）、direction（debit / credit）、amount（美元）、counterparty_account、ref（银行参考号 `BK000001`；手续费行是原 ref + `-FEE`）、status（settled / pending）、balance（该账户的已结算余额）。只有工作日有电汇。

`onchain_transfers.csv`：tx_hash、ts、chain（ETH / TRON / BTC）、asset、from_addr、to_addr、from_tier / to_tier（hot / warm / external）、amount、status、confirmations、direction（out 对外提币；in 外部转入；internal 热—温调拨）。

`wallet_balances.csv`：date（日终，03-01 … 03-14）、tier（hot / warm / cold）、chain、asset、address（热温冷地址取自第一批 chain_txs.csv；只有第一批没出现的 TRON / USDT 冷钱包是新派生的）、balance、balance_usd。

`reserve_snapshots.csv`：date、asset（USDT / BTC / ETH / USD）、source（onchain_hot / onchain_warm / onchain_cold = 钱包日终余额合计；bank = 两个银行账户日终余额；custodian = 第三方托管，USDT 与 BTC 固定值）、amount、amount_usd（按当日 23:55 标记价）。

`liabilities.csv`：date、asset、category（user_balance、pending_withdrawal、accrued_fees、margin_net 仅 USDT）、amount、amount_usd（**按当日 00:00 标记价**）。

说明：储备与负债是**自上而下**构造的（先定负债，再定覆盖缓冲 1%–4%，再拆到钱包与银行），所以不要拿 onchain_transfers 去滚动推算钱包余额。USD 的 bank 储备与银行流水的日终余额严格一致（`reserve_check.py --verify` 校验）。

### 1.6 pending_states.jsonl

| 列 | 说明 |
|---|---|
| event_id, ts | `PE000001` 起 |
| item_id | 单据：`PW` 提币、`PD` 充值，共 764 个 |
| kind, rail | withdrawal / deposit；chain / bank |
| event_type | 提币：reserve 预留 → approve 批准 → sign 签名 → broadcast 广播（银行是“发给银行”）→ [timeout 超时 → rebroadcast 重广播]* → confirm 确认回执 → book 记账；失败 / 取消走 fail / release。充值：detect → [rollback → detect]* → confirm → book |
| account_id, asset, chain, amount | 银行单据 asset 为 USD、chain 为 BANK |
| ref | 链上交易哈希 / 银行参考号 |
| receipt_id, confirmations, required | 确认回执编号；确认数与要求的确认数（ETH 12、TRON 20、BTC 3） |
| actor, approval_id | 执行者；批准单号 `AP-` + item_id |

事件计数：confirm 771、book 753、reserve 385、approve 385、detect 385、sign 375、broadcast 374、timeout 13、rebroadcast 13、release 7、rollback 6、fail 2。

### 1.7 cases.csv 与 case_actions.jsonl

`cases.csv`：case_id（`CS00001` 起）、opened_ts、account_id、type（fraud_suspected、ato、aml、sanction、legal_order、market_abuse、kyc_review、incident_review）、source（rule / ticket / agency）、severity、status（open / closed）、closed_ts。

`case_actions.jsonl`：action_id（`CT00001` 起）、ts、case_id、account_id、action（restrict 限制、release 解除、legal_freeze 法定冻结、legal_unfreeze 解除法定冻结、revoke_trade 撤销交易权限）、scope（trade / withdraw / all）、actor（执行人；`system:*` 是自动动作）、authorizer（授权人；自动动作是 `policy:*`；**null = 没有授权人**）、authority_ref（法律文书 / 制裁编号）、report_status（业务端回报：applied / failed / null = 没回报）、report_ts、retry_of（重试指向的原动作）。

授权规则（`case_audit.py` 里的 RULES）：scope = all 的限制 / 解除、法定冻结 / 解除必须由合规（compliance）授权；trade / withdraw 由安全（security）或合规授权；自动动作的授权来自策略。角色取自第一批 staff.csv（合规 ST048、ST049；安全 ST040–ST042；客服 ST001–ST014）。

## 2. 场景与答案摘要

每个场景在 `answers/Sxx.json` 里有唯一 ID、时间窗（`window`）、`expected_detections`、`expected_response`、`positives`、`decoys`。下表的编号在默认种子下固定。

### S10 订单序号缺口与成交—分录不平（账务一致性）· 2026-03-04 10:00–11:30

对应 B79；X18、X10。

| 答案 | 内容 | 匹配字段 |
|---|---|---|
| S10-01 | BTC-USDT 序号 1548–1559 缺失（12 个），其间 3 笔成交（MT000775–777）撮合日志有、成交回报全缺 | gap_key、trade_id |
| S10-02 | ETH-USDT 序号 1530、1546、1557 各对应两个内容不同的事件（序号服务双发） | seq_key |
| S10-03 | 4 笔大额成交没有任何分录（MT000767、770、778、782） | trade_id |
| S10-04 | 3 笔成交分录借贷不平：2 笔卖方多记了手续费部分（差 28.21、49.94 USDT），1 笔买方基础币少记 5%（差 0.0954 BTC） | trade_id、txn_id |
| S10-05 | 2 笔成交（MT000802、803）计价币分录是 价格 × 数量 的 10 倍，借贷仍平衡——只有重算估值才发现 | trade_id、txn_id |

噪声（S10-N01…N06）：公告的序号预留 8 处（`seq_skip` 事件）、到达乱序 14 处、原样重传 15 行、分录延迟 5–25 分钟入账 86 笔、一分钱舍入差 17 笔、不足 10 美元的微额成交没有手续费分录 21 笔。

应有处置：冻结受影响品种的对外成交回报与清算；从撮合日志与网关重放补齐缺失事件；对不平的分录冲正重记（保留原分录）；复核估值口径；把序号缺口、冲突序号、分录不平回灌成日常对账。

### S11 异常价格成交与撤单 / 撤权后仍成交（价格保护与权限撤销）· 2026-03-09

对应 B79、B83；X18、X24。

| 答案 | 内容 | 匹配字段 |
|---|---|---|
| S11-01 | 02:41–02:44，XYZ-USDT 3 笔成交价偏离标记价 +36%、+38.5%、+41%（价格带 ±10%），共约 13 万美元（MT001901–903） | trade_id |
| S11-02 | 16:04–16:40，5 张 ETH-USDT 买单在撤单确认 20–90 秒后仍成交（成交的 seq 在撤单之后） | order_id |
| S11-03 | 账户 A01736 在 15:30 被撤销交易权限（case_actions 的 revoke_trade），15:33–15:58 之后 6 张订单仍被受理，其中 2 张成交；起初 3 张被正确拒绝，之后放行 | order_id、account_id |

噪声（S11-N01…N07）：价格带内的 6%–9% 偏离 6 笔、引擎正确拒绝的价格带订单 56 张、撤单与成交同一秒但成交在前 8 笔、晚到的撤单被拒绝 40 笔、只限制提币的账户继续交易 12 张、受限账户的订单被拒 12 张、解除限制后正常交易 9 张。

应有处置：暂停该品种撮合或收紧价格带并保留证据；对异常价格成交按规则裁定撤销或保留，通知对手方；核对撤单与撤权在撮合侧的生效路径（缓存 / 订阅延迟）；撤权后的订单全部复核。

### S12 撮合过载与主备切换：脑裂窗口内双主写入与重复成交 · 2026-03-11 14:07:10–14:09:40

对应 B79、B80；X19、X23。过载从 14:00 开始（限流事件与限流拒绝），14:07:10 me-a 以 epoch 3 晋升，me-b（epoch 2）直到 14:09:40 才被围栏。

| 答案 | 内容 | 匹配字段 |
|---|---|---|
| S12-01 | 旧主 me-b（epoch 2）在窗口内仍写 28 笔成交；其中 25 个 engine_seq 与新主撞车；split_key `me-b:e2>e3` | split_key |
| S12-02 | 16 对成交重复：同一对订单、同价同量，各被两个节点成交一次（共 32 个 match_id） | trade_id |
| S12-03 | 32 张订单累计成交量 = 订单量的 2 倍（超量成交） | order_id |

噪声（S12-N01…N04）：同一对订单的合法两次部分成交（订单量是单笔的 2 倍，同节点，累计不超量）12 对 = 24 个成交、03-06 03:00 的计划切主（没有重叠）、过载限流拒绝 25 张、备节点心跳。

应有处置：**停写停发**——先隔离旧主，停止对外成交回报与清算；以新主日志为准，冲销旧主在窗口内写入的重复与陈旧成交；核对受影响账户余额与持仓，必要时先限制再复核；修复 fencing（旧主须在新 epoch 生效前停写）。

### S13 强平延迟导致穿仓，保险基金不足 · 2026-03-12 09:15–09:55

对应 B80；X19、X27。QRS-PERP 在 09:15–09:40 下跌 30%；10 个高杠杆（12–25 倍）多头的强平被积压。

| 答案 | 内容 | 匹配字段 |
|---|---|---|
| S13-01 | 10 笔强平（LQ00082–91）触发到执行用了 70–660 秒（SLA 60 秒） | liq_id |
| S13-02 | 其中 8 笔执行后权益为负（穿仓），缺口合计 178,985 美元（最小 8,826，最大 38,853） | liq_id |
| S13-03 | 保险基金在 LQ00090 耗尽（耗尽前余约 6,475.73 美元，全部用掉），LQ00090 与 LQ00091 出现未覆盖亏损约 27,388.13 与 20,128.52 美元并触发 ADL（以数据为准） | liq_id |

噪声（S13-N01…N03）：高峰期慢速强平 6 笔（延迟 31–48 秒，无穿仓）、价格跳空造成的小额穿仓 4 笔（延迟 1–8 秒，缺口 125–1,520 美元，基金正常覆盖）、不足 5 美元的穿仓 3 笔。另有大量低杠杆持仓接近强平线后追加保证金（positions.csv 里 margin 上升）。

应有处置：先让强平引擎恢复并清空积压，限制新开仓；按穿仓规则动用保险基金，不足部分启动 ADL 并公告；复盘延迟原因；恢复授信前核对保险基金与风险敞口。

### S14 储备与负债差额，及银行 / 链上 / 账务三方对账不平 · 2026-03-06 至 03-13

对应 B81、B82；X20、X21、X26、X27。几件事叠加：

- 03-10 11:42 BK-OPS-1 向陌生账户 `ACCT-9F31A2` 汇出 **480,000 美元**，账务没有任何记录；03-13 10:15 同额回拨，也没有记录（USD 储备 03-10 至 03-12 低于负债）。
- 03-10 08:00 一笔 **380,000 USDT**（TRON）已上链，状态机停在 broadcast，03-12 09:00 才补记（USDT 储备 03-10、03-11 低于负债，03-12 补记后关闭）。
- 03-10 14:00 一笔 **40,000 USDT** 提币没有广播，却收到“已确认”回执并记账——**假回执**，链上不存在，账务已扣减（掩盖了部分 USDT 缺口，所以 USDT 覆盖率只低到 97.4%–97.8%）。
- 03-09 17:00 一笔 3,200 USDT 充值收到两份编号不同的回执并记了两次账。
- 03-06 16:00 一笔 15,000 美元的银行提币批准后再没有签名，悬挂到统计截止。

| 答案 | 内容 | 匹配字段 |
|---|---|---|
| S14-01 | 覆盖率 < 100%：USD@03-10、03-11、03-12，USDT@03-10、03-11（USD 最低 95.3%） | reserve_key |
| S14-02 | 银行外流 BKX-77001 与回拨 RTX-77001，均无账务单据 | ref |
| S14-03 | 假回执：PW000762，回执哈希在链上不存在，状态从 sign 直接跳到 confirm | item_id、ref |
| S14-04 | 悬挂：PW000761（已上链 48.7 小时后才记账）、PW000764（批准后 8 天未签名） | item_id、ref |
| S14-05 | PD000763 重复回执并重复记账 | item_id、ref |

噪声（S14-N01…N15）：按美元算覆盖率低于 1 的 BTC / ETH 日（9 个，取价时点不同）、USDT 在途窗口的 99.85%–99.92%（2 个）、周末造成的 2–5 天入账日期差（16 笔）、中间行费 15 美元（3 笔）、银行手续费行 70 行、行间划转 10 组、先 pending 后 settled 9 笔、银行退回 2 笔、利息 1 行、微额不明转入 15 笔、超时后重广播 13 笔、重复回执只记一次账 18 笔、充值重组 6 笔、批准后取消 5 笔、截止前创建仍在处理 4 笔。

应有处置：先确认储备差额原因再决定是否暂停提币；向银行发起回拨 / 查询并向对手账户追索；冲销假回执记账，查调用方与来源，必要时停用该回执通道；补记已上链的提币，清理悬挂项并设超时告警；对重复记账冲正并加幂等键。

### S15 事故后复付与复市：限制与解除限制的授权缺口 · 2026-03-11 至 03-13

对应 B80、B83；X19、X24、X25。S12 的重复成交参与者与 S13 的穿仓账户（共 40 个）在事故当天被限制（scope = all，授权人为合规）；03-13 09:00–10:40 批量解除；另有 3 个账户的限制没有落地。

| 答案 | 内容 | 匹配字段 |
|---|---|---|
| S15-01 | 批量解除里 5 笔没有授权人、2 笔授权人就是执行人（共 7 个动作） | action_id |
| S15-02 | 4 笔解除没有业务端回报（report_status 为 null） | action_id |
| S15-03 | 03-12 18:20 法定冻结（账户 A00122）被客服执行、安全人员授权解除，没有法律文书编号 | action_id、account_id |
| S15-04 | 3 个账户（A00690、A00881、A01162）的限制指令回报 failed 且无人重试，其后各提交 3 张订单仍被受理 | action_id、account_id |

噪声（S15-N01…N04）：策略自动限制 / 到期自动解除 74 个动作（actor 为 system:*，授权来自 policy:R-KYC-HOLD）、回报失败后重试成功 8 个动作、回报偏慢（实测最慢 865 秒，约 14 分钟）8 个动作、有文书编号且合规授权的法定冻结解除 2 个。

应有处置：暂停批量解除，逐项补授权并复核；向业务端核对每一笔限制 / 解除是否落地，补回报；法定冻结恢复并通知合规与法务；对限制未落地的账户立即重新执行并复核其间交易。

## 3. lib 脚本

九个脚本共用 `lib/minix.py`（读数据、答案匹配与评分、统一输出）。每个脚本：`--help` 有说明与示例；可 `import` 后调用 `detect(**参数)`，返回发现列表（每条是 dict，有 `kind`）；输出按内容排序，两次运行完全一致。

统一的命令行选项：

| 选项 | 说明 |
|---|---|
| `--score 目标` | 对标准答案评分。目标是场景（`S10`）或答案编号（`S10-03,S10-04`），逗号分隔。输出命中、TP、误报（噪声 / 未解释）、其他场景命中、召回 |
| `--show N` | 最多显示 N 条发现（默认 10，0 不显示） |
| `--json` | 输出 JSON（全部发现 + 评分） |
| `--min-recall X` `--max-fp N` | 不达标则退出码 1（给自检与练习的“过关标准”用） |
| `--naive` | 一组“没调过”的参数，用来对比调参的效果 |

评分口径：一条发现命中某个目标答案的 `match` 字段就是 TP；命中其他场景的答案算“其他场景”，不算误报；其余都是误报，其中命中 `decoys` 的是“噪声”，都不命中的是“未解释”。召回按答案条数计。

### 3.1 seqcheck.py：序号连续性与重复

输入 order_events。按品种查缺口（`gap`）、冲突序号（`dup_conflict`）；可选查原样重传（`dup_identical`）、公告预留（`gap_announced`）、到达乱序（`out_of_order`）。

```bash
python3 $OPS/lib/seqcheck.py --score S10-01,S10-02
python3 $OPS/lib/seqcheck.py --symbol BTC-USDT --show 20
python3 $OPS/lib/seqcheck.py --naive --score S10-01,S10-02     # 全报，看噪声
```

选项：`--symbol`、`--include-identical`、`--include-announced`、`--check-order`。

### 3.2 ledger_check.py：成交—分录平衡与估值

输入 match_log 的成交与 trade_ledger_link。`missing_legs`、`unbalanced`、`valuation`（价格 × 数量重算）、`qty_mismatch`；可选 `price_off_mark`（`--mark-tol`）、`late_posting`（`--late-sec`）、`missing_fee`（`--require-fee`）。

```bash
python3 $OPS/lib/ledger_check.py --score S10-03,S10-04,S10-05
python3 $OPS/lib/ledger_check.py --mark-tol 0.10 --score S10-03,S10-04,S10-05,S11-01
python3 $OPS/lib/ledger_check.py --tol 0 --show 5        # 容忍度 0：一分钱舍入全报
```

选项：`--tol`（默认 0.011）、`--mark-tol`、`--late-sec`、`--require-fee`、`--min-fee-notional`。

### 3.3 replay_match.py：撮合日志与成交回报对账、切主窗口检测

输入 match_log 与 order_events。`report_missing`、`report_orphan`、`report_mismatch`；`stale_epoch_write`（旧 epoch 在新主晋升后仍写，给出 split_key、条数、窗口、engine_seq 撞车数）；`duplicate_match`（同一对订单同价同量，默认要求来自不同节点或超量）；`overfill`；可选 `epoch_change`、`standby_write`。

```bash
python3 $OPS/lib/replay_match.py --score S12
python3 $OPS/lib/replay_match.py --score S10-01 --show 5        # 缺口期间的成交缺回报
python3 $OPS/lib/replay_match.py --no-confirm-dups --show 40    # 不确认：合法的两次部分成交也报
```

选项：`--dup-window`（默认 60 秒）、`--no-confirm-dups`、`--epoch-changes`、`--standby-heartbeats`。

### 3.4 recon3.py：链上 / 账务 / 银行三方对账并按差异分类

“账务”取状态机的 book 事件，“外部”取 onchain_transfers 与 bank_statements，按单据逐笔对，再反查外部里没有单据的行。分类：`external_only`、`external_unbooked`、`internal_only`、`duplicate_booking`、`amount_mismatch`、`timing`、`late_booking`。默认不报银行手续费行、行间划转、利息、不足 5 USDT 的微额转入、pending 行。

```bash
python3 $OPS/lib/recon3.py --score S14-02,S14-03,S14-04,S14-05
python3 $OPS/lib/recon3.py --tol-days 5 --amount-tol 25 --score S14-02,S14-03,S14-04,S14-05
python3 $OPS/lib/recon3.py --asof 2026-03-11T23:59:59Z --tol-days 5 --amount-tol 25     # 03-11 日终时的差异：380,000 USDT 还没记账
```

选项：`--asof`、`--tol-days`（默认 1）、`--amount-tol`（默认 1.0 美元）、`--dust`、`--late-hours`、`--include-fees`、`--include-sweeps`、`--include-interest`。

### 3.5 state_audit.py：状态机事件校验

输入 pending_states（默认再核对 onchain_transfers 与 bank_statements）。`state_skip`、`double_book`、`dup_receipt_conflict`、`slow_transition`、`hanging`、`receipt_unverified`、`receipt_low_conf`；可选 `timeout`、`reorg`、`dup_receipt_same`。SLA（秒）：reserve 86400、approve 3600、sign 600、broadcast 21600（银行 432000）、confirm 3600、detect 21600（银行 86400）等，可用 `--sla 状态=秒` 覆盖。

```bash
python3 $OPS/lib/state_audit.py --score S14-03,S14-04,S14-05
python3 $OPS/lib/state_audit.py --sla approve=600 --show 20
python3 $OPS/lib/state_audit.py --asof 2026-03-10T20:00:00Z --show 20      # 当时的悬挂：380,000 USDT 那笔已上链 12 小时未确认
```

选项：`--asof`、`--no-verify`、`--sla`、`--flag-timeouts`、`--flag-dup-same`、`--flag-reorg`。

### 3.6 case_audit.py：案件授权与回报校验

输入 case_actions 与第一批 staff.csv。`release_no_authorizer`、`self_authorized`、`authorizer_role`、`legal_no_ref`、`no_report`、`slow_report`、`report_failed`。

```bash
python3 $OPS/lib/case_audit.py --score S15
python3 $OPS/lib/case_audit.py --report-sla 300 --show 20     # 回报 SLA 收紧到 5 分钟，慢回报全报
python3 $OPS/lib/case_audit.py --no-allow-policy --show 5     # 不放行策略自动动作
```

选项：`--report-sla`（默认 1800）、`--no-allow-policy`、`--include-retried`、`--asof`。

### 3.7 order_audit.py：价格保护与权限撤销（补充脚本）

输入 order_events、case_actions、第一批 marks.csv。`price_off_band`、`fill_after_cancel`（默认按 seq 判断）、`post_restriction_order`（交易受限后仍被受理的新订单；默认只看 scope 为 trade / all 的限制，宽限 60 秒）。

```bash
python3 $OPS/lib/order_audit.py --score S11
python3 $OPS/lib/order_audit.py --band 0.05 --score S11       # 价格带收紧到 5%，6% 以上的合法偏离也报
python3 $OPS/lib/order_audit.py --by-ts --score S11            # 按时间戳判断撤单后成交：同一秒的竞态会被误报
```

选项：`--band`、`--by-ts`、`--grace`、`--any-scope`、`--include-rejects`、`--effective action|report`。

### 3.8 liq_audit.py：强平延迟、穿仓与保险基金（补充脚本）

输入 liquidations。`delayed_liquidation`（延迟 > `--sla`，默认 60 秒）、`bankruptcy`（缺口 ≥ `--min-shortfall`，默认 0.01）、`fund_exhausted`；`--verify` 重算权益并检查保险基金余额连续。

```bash
python3 $OPS/lib/liq_audit.py --score S13
python3 $OPS/lib/liq_audit.py --min-shortfall 5000 --score S13 --max-fp 0
python3 $OPS/lib/liq_audit.py --verify
```

### 3.9 reserve_check.py：储备与负债覆盖（补充脚本）

输入 reserve_snapshots、liabilities。`shortfall`（覆盖率低于 `--threshold`，默认 1.0）；`--basis native|usd`；`--verify` 核对储备与 wallet_balances、bank_statements 一致。

```bash
python3 $OPS/lib/reserve_check.py --score S14-01
python3 $OPS/lib/reserve_check.py --threshold 0.995 --score S14-01 --max-fp 0
python3 $OPS/lib/reserve_check.py --basis usd --score S14-01       # 按美元算：BTC / ETH 的价格噪声全冒出来
```

### 3.10 模块用法

```python
import sys
sys.path.insert(0, "code/offchain-ops/lib")
import minix, recon3, state_audit

findings = recon3.detect(asof="2026-03-11T23:59:59Z", tol_days=5, amount_tol=25)
res, detail = minix.score(findings, minix.targets_of("S14-02,S14-03,S14-04,S14-05"))
print(res["recalled"], res["positives"], res["fp_hits"])      # 4 4 0
```

自己写规则（SQL / Python 都行）时，直接用 `minix.rows("order_events")` 读表；评分用 `minix.score(hits, targets)`，命中字段与答案 `match` 里的字段对应：`trade_id`（别名 `match_id`）、`order_id`、`txn_id`、`seq_key`、`gap_key`、`split_key`、`liq_id`、`item_id`、`ref`、`reserve_key`、`action_id`、`account_id`。

## 4. 召回 / 误报基线

下表是 `tests/test_miniex_x.py` 校验的数字。“命中”是发现条数；“TP”是命中目标答案的条数（一个答案可以被多条发现命中）；“误报”是既不命中目标答案也不命中其他场景答案的条数；“其他”是命中其他场景答案的条数；“召回”按答案条数。**默认**是脚本的默认参数；**调过**是文中给的调参；**没调过**是 `--naive`。

| 脚本（目标） | 配置 | 命中 | TP | 误报 | 召回 | 其他 |
|---|---|---:|---:|---:|---:|---:|
| seqcheck（S10-01、S10-02） | 默认 | 4 | 4 | 0 | 2/2 | 0 |
| | 没调过（重传、公告预留、乱序全报） | 41 | 4 | 37 | 2/2 | 0 |
| ledger_check（S10-03、04、05） | 默认 | 9 | 9 | 0 | 3/3 | 0 |
| | 没调过（tol 0、查手续费与延迟） | 133 | 9 | 123 | 3/3 | 1 |
| ledger_check + `--mark-tol 0.10`（S10-03、04、05、S11-01） | 默认 | 12 | 12 | 0 | 4/4 | 0 |
| replay_match（S12） | 默认 | 52 | 49 | 0 | 3/3 | 3 |
| | 没调过（不确认的重复、计划切主、备心跳） | 67 | 50 | 14 | 3/3 | 3 |
| replay_match（S10-01） | 默认 | 52 | 3 | 0 | 1/1 | 49 |
| order_audit（S11） | 默认 | 23 | 14 | 0 | 3/3 | 9 |
| | `--band 0.05` | 29 | 14 | 6 | 3/3 | 9 |
| | 没调过（5%、按时间戳、含拒绝） | 47 | 15 | 23 | 3/3 | 9 |
| liq_audit（S13） | 默认（任何穿仓都报） | 27 | 20 | 7 | 3/3 | 0 |
| | 调过 `--min-shortfall 5000` | 20 | 20 | 0 | 3/3 | 0 |
| | 没调过 `--sla 30` | 33 | 20 | 13 | 3/3 | 0 |
| reserve_check（S14-01） | 默认 | 7 | 5 | 2 | 1/1 | 0 |
| | 调过 `--threshold 0.995` | 5 | 5 | 0 | 1/1 | 0 |
| | 没调过 `--basis usd` | 16 | 5 | 11 | 1/1 | 0 |
| recon3（S14-02、03、04、05） | 默认 | 24 | 6 | 18 | 4/4 | 0 |
| | 调过 `--tol-days 5 --amount-tol 25` | 5 | 5 | 0 | 4/4 | 0 |
| | 没调过（全报） | 175 | 6 | 169 | 4/4 | 0 |
| | 调过 + `--asof 2026-03-11T23:59:59Z` | 4 | 4 | 0 | 4/4 | 0 |
| state_audit（S14-03、04、05） | 默认 | 7 | 7 | 0 | 3/3 | 0 |
| | 没调过 | 228 | 8 | 220 | 3/3 | 0 |
| case_audit（S15） | 默认 | 16 | 16 | 0 | 4/4 | 0 |
| | 没调过（回报 SLA 300 秒、不放行策略、含已重试） | 102 | 16 | 86 | 4/4 | 0 |

要点（给练习章当过关标准的素材）：

- 全部 6 个场景共 23 条答案，用 9 个脚本在默认参数下**全部召回**（`tests` 里的 `test_every_positive_recalled_by_some_tool` 校验）。
- 误报最多的三处是练习调参的重点：`recon3` 的日期容忍与金额容忍（18 → 0）、`liq_audit` 的穿仓下限（7 → 0）、`reserve_check` 的覆盖率阈值（2 → 0）。
- `replay_match` 默认不确认就会把 12 对合法的两次部分成交当成重复成交（`--no-confirm-dups` 多 12 条误报），要靠“不同节点或超量”来确认。
- `order_audit` 的“其他 9”是 S15-04 的 3 个账户 × 3 张订单：限制指令回报失败，订单仍被受理，在 S11 视角下不是误报。

## 5. 与练习章的对应

| 章 | 用到的场景 / 脚本 |
|---|---|
| B79 交易与账务回放验收 | S10、S11、S12；seqcheck、ledger_check、replay_match、order_audit |
| B80 复市与恢复演练：对账差异与分阶段恢复 | S12、S13、S15；replay_match、liq_audit、case_audit、recon3 |
| B81 钱包与渠道三方对账与未决状态 | S14；recon3、state_audit |
| B82 储备与偿付对账 | S14-01；reserve_check、recon3 |
| B83 反欺诈规则验收与调查取证 | S15、S11-03；case_audit、order_audit |

## 6. 口径与限制（写章时注意）

- 第二批的订单、成交、分录自成一套编号（`OX…`、`MT…`、`LK…`），**不与**第一批的 orders_trades.csv、ledger.csv 关联；账户、标记价、钱包地址、员工与第一批一致。
- 基础交易流不模拟限制：受限期内本来会下单的普通订单已换成别的账户，所以“受限账户仍在下单”只出现在 S11-03 与 S15-04 里。
- QRS-PERP 只在 positions.csv 与 liquidations.csv 里出现，不在 marks.csv。
- 储备与负债是自上而下构造的，覆盖缓冲是故意留出的；不要用 onchain_transfers 去滚动推算钱包余额。
- 三方对账里“账务”一侧用状态机的 book 事件，不是第一批的 ledger.csv。
- 想换种子：`python3 gen/generate_x.py --seed N`（答案随之改变；本文与自检里的数值按默认种子 20260302）。

## 附：评分口径的提醒

`--score` 的召回栏按**答案条数**计算：一个答案条目可对应多个具体发现（例如 S14-01 对应 5 个币种日、S10-05 对应多笔成交）。调大容忍度后，召回栏可能仍显示满分，但真阳性条数已减少（例如 `ledger_check --tol 5` 会漏掉 MT000793）。判断是否做对，要同时看真阳性条数与误报，不要只看召回栏。
