# 训练营 L3「架构与运营」赛道简报

## 1. 目标

在 `Web3 安全训练营` 里新增一条赛道 **链下 L3 运筹帷幄：架构与运营**，把 X01–X24 的方法变成能在笔记本上**亲手跑通**的练习。读者走完后能：为一家机构建控制矩阵、写并调风控规则、写检测规则并回放验证、做签名策略独立校验、审发布流水线、主持桌面推演、写事故复盘、交付一份带 90 天路线图的安全架构评估。

## 2. 共用靶场：MiniEx（模拟交易所）

一个**虚构**的小型交易所"MiniEx"，所有数据由脚本按固定随机种子**合成**，不含任何真实用户、真实地址、真实密钥。

目录（在仓库根目录 `practice-example-code/ops/`，与 `practice-example-code/foundry/` 同级）：

```
practice-example-code/ops/
├── README.md              靶场说明、场景表、命令速查
├── setup.sh               一键生成数据并跑自检（只依赖 python3 标准库）
├── gen/                   数据生成器（固定种子）
├── data/                  生成出的数据（.gitignore 忽略，可随时重新生成）
├── answers/               每个注入场景的标准答案（练习做完再看）
├── lib/                   练习共用的小库（日志读取、SQLite 装载、规则回放框架）
└── tests/                 靶场自检（生成的数据与答案一致）
```

硬性要求：

- 只用 Python 3（≥ 3.9）标准库（sqlite3、csv、json、argparse、datetime、hashlib、re、statistics）；不用第三方包，不联网。
- 同一个种子生成的数据完全一致；`setup.sh` 可重复运行。
- 命令从 `web3-security-handbook/` 根目录出发（读者的工作目录），例如 `bash practice-example-code/ops/setup.sh`、`python3 practice-example-code/ops/lib/replay.py ...`。
- 数据与答案里**不出现**针对真实系统的攻击步骤；注入场景只写"事件长什么样"，用于检测与处置练习。

## 3. 数据集与注入场景

数据集（均为合成）：

| 文件 | 内容 |
|---|---|
| accounts.csv | 约 2000 个账户：国家、KYC 等级、注册时间、风险标签 |
| logins.csv | 登录事件：时间、账户、IP、设备指纹、结果、MFA 方式 |
| recoveries.csv | 账户找回事件与审核结果 |
| api_calls.csv | API Key 调用：Key、IP、权限、动作 |
| orders_trades.csv | 订单与成交（含价格、数量、账户） |
| ledger.csv | 账务分录（双分录，含冻结、手续费） |
| withdrawals.csv | 提币申请：账户、链、地址、金额、状态、审批单号 |
| chain_txs.csv | 热 / 温 / 冷钱包链上转账（与 withdrawals 部分对应） |
| signing_requests.jsonl | 签名服务收到的请求：来源、审批单号、目标地址、金额、calldata 摘要 |
| cloud_audit.jsonl | 类 CloudTrail 的云审计日志：身份、动作、来源 IP、用户代理 |
| k8s_audit.jsonl | 类 K8s 审计事件（exec、secret 读取、角色绑定变更） |
| ci_events.jsonl | CI/CD 事件：workflow 触发、依赖安装、发布、制品签名 |
| workflows/ | 3 份示例 GitHub Actions workflow（1 份故意有缺陷）与一份示例 lockfile 片段 |
| staff.csv | 员工与权限：角色、是否离职、特权授予与到期时间 |
| controls_matrix_template.csv | 空白控制矩阵模板（域 × 控制 × 优先级 × 验证方式） |

注入场景（每个有唯一 ID，标准答案写入 `answers/`，含时间窗、涉及实体、应触发的检测与应有的处置）：

- S1 账户接管：撞库成功 → 改密 / 找回 → 新地址大额提币。
- S2 API Key 滥用：新开提币权限的 Key 从新 IP 调用。
- S3 洗钱漏斗：多个小额入账汇聚到少数账户后快速提走。
- S4 对敲刷量与价格操纵：同一实体多账户互相成交、标记价偏离。
- S5 内部人批量查看 / 导出：客服账号在非工作时间批量读取 KYC。
- S6 签名服务异常：有签名请求缺少对应审批单；目标地址与审批单不一致。
- S7 开发终端失陷痕迹：开发机拉起外联工具 → 云凭证被使用 → 访问签名命名空间。
- S8 供应链：CI 中出现被篡改的依赖版本 / 未固定的 Action / 未签名制品被发布。
- S9 误报与噪声：每个场景周围有大量正常事件与"看起来可疑但正常"的事件，用于练习调参。

## 4. 练习章清单（写在 `bootcamp/` 下，ids 见 build.mjs 的 BOOT_IDS）

| 章 | slug | 标题 | 配套 X 章 | 用到的场景 |
|---|---|---|---|---|
| B70 | offchain-l3-guide | 链下 L3 导读：从懂攻击到建体系 | X01、X07 | — |
| B71 | control-matrix-practice | 控制矩阵实战：给 MiniEx 建资产清单、威胁模型与控制矩阵 | X01、X02、X07 | — |
| B72 | withdrawal-risk-rules-practice | 提币与账户风控规则实战：写规则、回放、调阈值 | X08、X10、X11、X13 | S1 S2 S3 S4 S9 |
| B73 | detection-engineering-practice | 检测工程实战：把日志变成告警，并证明它有效 | X05、X03 | S5 S6 S7 S9 |
| B74 | signing-policy-practice | 签名服务独立校验与调拨审批实战 | X11、X21 | S6 |
| B75 | release-gate-practice | 发布门禁实战：审流水线、查供应链、做发布清单 | X04 | S8 |
| B76 | tabletop-postmortem-practice | 桌面推演与事故复盘实战 | X06、X13 | S1 S6 S7 |
| B77 | security-architecture-capstone | 毕业项目：为 MiniEx 交付安全架构评估与 90 天路线图 | 全部 | 全部 |
| B78 | glossary-resources | 术语表与资源索引（原 B70，顺延） | — | — |

每章格式沿用训练营章节：先读 `bootcamp/B56`、`bootcamp/B64` 了解训练营练习章的写法（准备、步骤、命令、预期输出、过关标准、常见错误、思考题）。每章要有"过关标准"和"和标准答案对照"小节。

## 5. 工作分工

1. **靶场代理**：做 `practice-example-code/ops/`（生成器、数据、答案、`lib/`、`tests/`、`setup.sh`、README），并写一份给练习章代理用的 `ops/API.md`：数据字典、各场景的答案摘要（场景 ID、时间窗、实体）、`lib/` 里每个脚本的用法与示例命令。
2. **练习章代理**（每章一个）：读 `ops/API.md` 与对应 X 章，写练习章，并**逐条在本机运行**章内的命令，确认输出与章内所写一致；需要新增脚本放在 `ops/lib/` 或 `ops/solutions/<章>/`（参考实现），不得修改别人的脚本。
3. **集成**（主会话）：`tools/build.mjs` 的 NAV / BOOT_IDS / ALIASES、训练营路线图 B00、README、学习路径、topics.json、模板与实验页、`setup.sh` 说明、检查与预览。

## 6. 质量要求

- 命令必须在 macOS 上用系统 `python3` 跑通；预期输出写进章里，与实际一致（数值因种子固定而稳定）。
- 每个练习都有"没有标准答案也能判断做对没有"的过关标准（例如"在回放中召回 S1 的全部 3 次事件，且误报不超过 N 条"），数值来自靶场自检结果。
- 不引入需要真实云账号、真实链节点或付费服务的步骤。
- 所有 ID、路径、文件名与 `ops/API.md` 一致。
