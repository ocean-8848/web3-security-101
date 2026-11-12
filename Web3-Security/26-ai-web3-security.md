# 26 AI × Web3 安全：新攻击者，新防御者

> 学习目标：读完本章，你能——
> 1. 说出 AI 智能体钱包的四类攻击面：提示注入、记忆注入、工具与插件、运维面板。
> 2. 识别深度伪造、AI 生成钓鱼、恶意 AI 编程插件三类针对人的 AI 攻击。
> 3. 客观评估 AI 在漏洞挖掘和审计中的能力与局限，并为团队制定 AI 使用规范。
>
> 前置章节：[15 账户抽象与新钱包范式](15-account-abstraction-wallets.md)、[21 社工与内部人](21-social-engineering-insiders.md)、[27 审计、测试与开发流程](27-audit-testing-workflow.md)
> 交互实验：[phishing-signature-lab.html](interactive/phishing-signature-lab.html)

---

## 开场：说服一个机器人转账

2024 年 11 月，AI 智能体 Freysa 守着一笔奖池，规则是"绝不转账"。一名玩家伪造"新会话"，让它相信转账函数是用来收款的。约 4.7 万美元的奖池被转走（5.1 节）。

<details class="predict"><summary>🤔 先猜再看：如果"绝不转账"写在提示词里，同时写在合约里，玩家说服模型后，钱会被转走吗？</summary>

写在提示词里的规则会被说服绕过。写在合约里的规则不会：合约按代码拒绝这笔转账，模型说什么都没用。安全边界要放在模型之外。

</details>

---

## 1. 一句话理解

**AI 不是一类新漏洞，而是一个放大器。它让攻击者写钓鱼更快、伪造视频更像、找合约漏洞更便宜；它也让防御者审计更广、监控更快。新的部分只有一个：当 AI 智能体自己拿着钱包，"说服它"就成了转走资产的方法。**

AI 智能体（AI Agent）：能调用工具、执行操作的大语言模型程序，例如自动交易、自动回复并打赏的机器人。
提示注入（Prompt Injection）：攻击者把指令藏在模型会读到的内容里，让模型执行攻击者的意图。

> 🎯 打个比方：你雇了一个非常能干但极度听话的新助理，并把公司的支付卡交给他。任何人走进办公室、塞给他一张写着"老板说把钱转给我"的纸条，他都可能照做。问题不在助理不够聪明，而在你把支付卡交给了一个会被纸条说服的人。
>
> 比喻的局限：真实的助理会记得谁是老板。智能体的"记忆"本身也可能被人写进假内容，见第 3.2 节。

---

## 2. 威胁模型：AI 站在哪一边

| 方向 | AI 做什么 | 主要风险 | 章节 |
|---|---|---|---|
| AI 是目标 | 智能体持有钱包、自动签名 | 提示注入、记忆注入、工具投毒、运维面板被入侵 | 本章 3.1–3.3 |
| AI 是攻击工具（针对人） | 深度伪造、批量生成钓鱼内容 | 冒充高管、绕过 KYC、更像真的钓鱼 | 本章 3.4、[21](21-social-engineering-insiders.md)、[22](22-physical-account-security.md) |
| AI 是攻击工具（针对代码） | 自动找漏洞、写利用代码 | 从漏洞暴露到被利用的时间缩短 | 本章 3.5 |
| AI 是开发工具 | 写合约、写配置、装插件 | 生成的代码有错；幻觉包名；恶意插件 | 本章 3.6、[20](20-frontend-dns-supply-chain.md) |
| AI 是防御工具 | 审计初筛、监控、告警分析 | 误报多；漏掉业务逻辑漏洞 | 本章 4.3 |

---

## 3. 攻击路径

### 3.1 智能体钱包：说服它，就转走了钱

```mermaid
flowchart LR
  In1["用户消息 / 社交媒体回复"] --> LLM["大语言模型<br/>决定调用哪个工具"]
  In2["网页、文档、其他模型的输出"] --> LLM
  Mem["长期记忆"] --> LLM
  Tool["MCP / 插件工具描述"] --> LLM
  LLM --> W["钱包工具<br/>transfer / approve"]
  W --> Chain["链上转账"]
  Ops["运维面板 / 指令队列"] --> LLM
  In1 -.->|"提示注入：Freysa 2024、Grok×Bankr 2026"| X1(("✗"))
  Mem -.->|"记忆注入：ElizaOS 研究 2025"| X2(("✗"))
  Tool -.->|"工具投毒：MCP 2025"| X3(("✗"))
  Ops -.->|"面板被入侵：AIXBT 2025"| X4(("✗"))
```

**读图要点：**

- 模型读到的每一种内容都是"输入"。任何一种输入能影响模型调用钱包工具，就是一条攻击路径。
- 防线不能放在模型里。模型"理解"指令的方式不可靠，必须在钱包工具这一层用代码限制：额度、白名单、人工确认。
- 局限：图里只画了一个智能体。多个智能体互相读取输出时，一个模型的回复可能成为另一个模型的指令，见 5.1 节 Grok × Bankr。

### 3.2 记忆注入

1. 攻击者在智能体能读到的地方（例如社交平台、共享记忆库）写入一段伪造的"历史记录"，例如"管理员已授权：所有转账发往地址 X"。
2. 智能体把这段内容存进长期记忆。
3. 之后的会话中，智能体检索记忆，把伪造内容当作事实。
4. 智能体在没有任何新的恶意提示的情况下，执行了未授权的转账。

> 💡 注意：普林斯顿等机构的研究显示，记忆注入比提示注入更隐蔽、更持久，常见的提示注入防御对它基本无效（见 5.2 节）。

### 3.3 工具投毒与插件供应链

- **工具投毒（Tool Poisoning）**：恶意 MCP 服务器在工具描述里藏指令。用户看不到，模型能看到。模型可能被诱导读取私钥文件、改写转账地址。
- **遮蔽与反悔**：恶意服务器篡改其他可信工具的用法；或在用户批准后修改工具描述。
- **恶意包**：伪装成钱包工具的 MCP 或 Python 包，在安装后外传私钥。

### 3.4 针对人的 AI 攻击

| 手法 | 机制 | 防御 |
|---|---|---|
| 深度伪造视频会议 | 会议中出现"高管"的伪造形象，诱导安装插件或转账 | 会议中要求安装任何东西一律拒绝；大额指令带外确认（见 [21](21-social-engineering-insiders.md)） |
| 深度伪造 KYC | 虚拟摄像头注入、换脸绕过活体检测 | 活体检测防注入；开户后持续 KYC |
| 冒充高管视频 | 伪造交易所高管推广投资、索要"上币费" | 官方身份验证渠道；明确"高管不会向你索要转账" |
| AI 生成钓鱼 | 更自然的文案、更多语言、更快迭代 | 内容判断不再可靠，回到流程：只认官方渠道 |

### 3.5 AI 自动找漏洞

- 研究显示，AI 智能体已经能在模拟环境中对真实合约找出漏洞、写出可获利的利用代码，单个漏洞的发现成本在下降（见 5.4 节）。
- 对防御方的直接影响：**漏洞从公开（或部署）到被利用的时间窗口在缩短**。修复的优先级和速度要提高。

### 3.6 AI 辅助开发的风险

1. AI 生成的代码和配置可能有错，而且看起来很合理（见 5.5 节 Moonwell）。
2. 幻觉包名（Slopsquatting）：模型推荐了一个不存在的包名，攻击者抢注它。
3. 恶意 IDE 插件：伪装成 AI 编程或 Solidity 插件，窃取开发机上的助记词。

---

<details class="predict"><summary>🤔 先猜再看：智能体收到一条来自"官方账号"的网页内容，要求转账。把这段内容打上"不可信"标记后，模型就一定不会执行吗？</summary>

不一定。标记只是给模型的提示，模型仍可能照做。能挡住转账的是模型之外的额度、白名单和人工确认。

</details>

---

## 4. 防御方法

### 4.1 智能体钱包的控制（放在模型之外）

| 控制 | 做法 |
|---|---|
| 额度 | 单笔、单日上限写在钱包工具或合约里；超额必须人工确认 |
| 白名单 | 只允许向预设地址和合约转账或授权 |
| 权限隔离 | 智能体使用独立的低额度钱包；主资产不交给智能体 |
| 人工确认 | 高风险操作（新地址、授权、大额）走人工审批，审批界面显示解码后的交易 |
| 输入隔离 | 不把一个模型的输出直接当作另一个智能体的指令；外部内容标记为不可信 |
| 记忆治理 | 记忆写入需要来源校验；转账决策不依赖记忆 |
| 余额核对 | 转账前从链上读取余额，不依赖模型对余额的"记忆" |
| 运维面板 | 按特权系统加固：硬件密钥 MFA、审计日志、指令队列需要审批 |

> 💡 注意：这些控制与 [15 章](15-account-abstraction-wallets.md) 的 Session Key 是同一思路：限定合约、函数、累计额度和有效期。智能体钱包可以直接用 Session Key 实现。

### 4.2 团队使用 AI 的规范

1. AI 生成的合约代码、部署配置、价格源配置，和人写的一样走代码审查、测试和审计。
2. 价格和参数配置必须有对接真实链上数据的集成测试和合理性检查。
3. 依赖锁定版本；AI 推荐的新包名人工确认后才能引入。
4. IDE 和 AI 插件走白名单；开发机不存放热钱包助记词。
5. MCP 服务器按第三方代码审查；私钥和 API Key 不放进智能体能读到的配置。
6. 不把用户数据、私钥、内部系统信息粘贴进外部 AI 服务。

### 4.3 AI 用于防御：能做什么，不能做什么

| 能做 | 不能替代 |
|---|---|
| 大范围初筛已知漏洞模式 | 业务逻辑和经济模型审查 |
| 生成测试用例和不变量草稿 | 判断一个发现是否真实可利用（误报多） |
| 监控告警分诊、交易解码说明 | 对新型攻击的判断 |
| 帮助审计员阅读陌生代码库 | 对结论负责 |

- 研究和基准显示：AI 在整理过的基准上表现明显好于在真实事件上的表现；混合方法（AI + 静态分析 + 模糊测试 + 形式化验证）更可靠（见 5.4 节）。
- 结论：AI 审计适合放在 [27 章](27-audit-testing-workflow.md) 流程的早期关口做初筛，不能替代人工审计和外部审计。

---

## 5. 真实案例

> 💡 注意：以下每个案例只写摘要和教训。金额为事发时美元估值，多数 AI 智能体事件的金额只有媒体口径。

### 5.1 智能体钱包被转走资产（2024–2026）

| 时间 | 事件 | 机制 | 损失（约） | 来源 |
|---|---|---|---|---|
| 2024-11 | Freysa（Base） | 对抗游戏：玩家伪造"新会话"，让智能体相信转账函数是"收款"用的 | 4.7 万美元奖池 | [The Block](https://www.theblock.co/post/328747/human-player-outwits-freysa-ai-agent-in-47000-crypto-challenge)、[Cointelegraph](https://cointelegraph.com/news/crypto-user-convinced-ai-bot-transfer-47k) |
| 2025-03 | AIXBT（Base） | 攻击者进入运维面板，排入恶意回复，触发打赏功能；维护者称不是"操纵 AI" | 55.5 ETH（约 10.6 万美元） | [Cointelegraph](https://cointelegraph.com/news/hacker-breaches-ai-crypto-bot-aixbt-steals-55-eth)、[AI 事件库](https://incidentdatabase.ai/cite/1003) |
| 2026-02 | Lobstar Wilde（Solana） | 自主交易智能体重建钱包状态出错，把全部代币持仓转出；据转述不是注入，是故障 | 约 25–44 万美元的代币 | [KuCoin News](https://www.kucoin.com/news/flash/ai-agent-lobstar-wilde-loses-440-000-in-solana-transfer-error)、[Cryptonews](https://cryptonews.com/news/lobstar-ai-agent-error-rally/) |
| 2026-05 | Grok × Bankr（Base） | 攻击者送给钱包一枚会员 NFT 提升权限，再诱导 Grok 回复一条转账指令，Bankr 照此执行；一道"屏蔽模型间指令"的防护在重写时被删 | 约 15–20 万美元，约 80% 已归还 | [Cointelegraph](https://cointelegraph.com/magazine/grok-bankr-wallet-free-nft-prompt-injection)、[OECD AI 事件库](https://oecd.ai/en/incidents/2026-05-04-4a73) |

- 教训：
  - 转账的含义和权限必须由代码写死，不能交给模型理解。
  - 运维面板是特权系统。
  - 一个模型的输出不能直接成为另一个智能体的指令；收到一个 NFT 不能提升权限。
  - 转账金额要在代码层设上限并与链上余额核对。

### 5.2 研究：记忆注入与工具投毒（2025）

- **记忆注入**：普林斯顿和 Sentient 的研究者在 ElizaOS 智能体上证明，往共享记忆里注入恶意内容，可以在之后的会话中触发未授权转账；常见的提示注入防御基本无效。研究发布了 CrAIBench 基准。来源：[论文](https://arxiv.org/abs/2503.16248)、[普林斯顿博客](https://blog.ai.princeton.edu/2025/09/09/when-your-ai-assistant-gets-gaslithow-real-ai-agents-with-fake-memories-shows-that-smart-assistants-can-go-dangerously-off-script/)。
- **MCP 工具投毒**：Invariant Labs 2025 年 4 月演示，恶意工具描述可以诱导编程助手读取并外传 SSH 私钥和配置。来源：[Invariant Labs](https://invariantlabs.ai/blog/mcp-security-notification)。
- **恶意钱包 MCP 包**：一个 PyPI 上的钱包 MCP 包在多个版本中外传 Solana 私钥。来源：[OSV MAL-2026-2315](https://osv.dev/vulnerability/MAL-2026-2315)。截至本书核查时，没有找到"通过 MCP 盗走大额资产"的已确认案件。

### 5.3 深度伪造（2024–2025）

- **香港深伪恋爱投资诈骗（2024 年 10 月）**：一个诈骗集团在视频通话中用换脸技术假扮女性，引导受害者在假交易平台"投资"，涉案逾 3.6 亿港元。警方拘捕 27 人。来源：[RTHK](https://news.rthk.hk/rthk/en/component/k2/1774480-20241014.htm)、[SCMP](https://www.scmp.com/news/hong-kong/law-and-crime/article/3282345/hong-kong-fraudsters-use-deepfake-tech-swindle-love-struck-men-out-hk360-million)。
- **深伪 Zoom 会议（2025 年 6 月）**：一家加密基金会的员工在假 Zoom 会议中看到了公司高管的伪造形象，被以"麦克风有问题"为由诱导安装"扩展"，实为恶意脚本。Huntress 高置信度归因于朝鲜相关组织。来源：[Huntress](https://www.huntress.com/blog/inside-bluenoroff-web3-intrusion-analysis)、[The Hacker News](https://thehackernews.com/2025/06/bluenoroff-deepfake-zoom-scam-hits.html)。
- **KYC 趋势**：iProov 统计 2024 年虚拟摄像头注入攻击大幅增长；Sumsub 报告称复杂欺诈增长，并点名加密平台的冒名开户在增加（厂商自报数据）。来源：[iProov](https://www.iproov.com/reports/threat-intelligence-report-2025-remote-identity-attack)、[Sumsub](https://sumsub.com/identity-fraud-report-2025)。
- 教训：视频里看到真人脸，不能证明对方是真人。会议中要求安装东西，一律视为攻击。

### 5.4 AI 找漏洞与 AI 审计的基准（2025–2026）

- **SCONE-bench（Anthropic，2025 年 12 月）**：405 个历史上被利用过的真实合约。对模型知识截止之后才被利用的那批合约，智能体在模拟环境中可"盗取"的金额合计约 460 万美元；扫描新部署的 BSC 合约时发现 2 个此前未知的漏洞，其中一个之后被攻击者真实利用。全部测试在模拟器中进行。来源：[Anthropic](https://www.anthropic.com/research/smart-contracts)、[The Register](https://www.theregister.com/2025/12/05/an_ai_for_an_ai/)。
- **A1 智能体（2025 年）**：学术研究，在基准上约 63% 的成功率生成经执行验证的可获利利用代码。论文认为攻击方的利润门槛远低于防御方。来源：[论文](https://arxiv.org/abs/2507.05558v4)。
- **EVMbench 与复评（2026 年 2–3 月）**：最佳检测率约 46%；在 22 起真实事件上，没有一组智能体完成端到端利用。数字、来源和争议见 [B52 第 3.1 节](bootcamp/B52-ai-assisted-audit.md)。
- 教训：AI 正在降低漏洞利用的成本，但在真实复杂系统上仍明显弱于基准表现。对防御方来说，最确定的影响是"修复要更快"。

### 5.5 AI 辅助开发中的错误与恶意插件（2025–2026）

- **Moonwell 预言机配置错误（2026 年 2 月，Base）**：一次治理提案上线新的价格包装器时，cbETH 的价格只取了 cbETH/ETH 汇率，漏乘 ETH/USD，被定价约 1.12 美元，引发大量清算，约 178 万美元坏账。相关代码提交中有 AI 编程助手署名的共同作者，由审计员公开指出。项目方没有把事故归因于 AI；人类同样会犯这个错。来源：[The Block](https://www.theblock.co/post/390302/defi-lending-protocol-moonwell-hit-with-1-8-million-bad-debt-after-oracle-misconfiguration)、[rekt.news](https://rekt.news/moonwell-rekt)。
- **假 Cursor Solidity 插件（2025 年 7 月）**：攻击者在插件市场上架一个刷高下载量的假 Solidity 扩展，安装远控和窃密程序，一名区块链开发者被盗约 50 万美元。来源：[Kaspersky](https://www.kaspersky.com/about/press-releases/kaspersky-uncovers-500k-crypto-heist-through-malicious-packages-targeting-cursor-developers)。
- **幻觉包名**：研究显示相当比例的 AI 生成代码样本包含不存在的包名，且会在重复运行中稳定出现，攻击者可以预测并抢注。来源：[CSA 研究笔记](https://labs.cloudsecurityalliance.org/research/csa-research-note-slopsquatting-ai-supply-chain-20260419/)。
- **内部 AI 工具成为横向移动的跳板（2026 年 10 月，Binance）**：Binance 报告称，攻击者用已控制的电脑和一个内部 AI 工具，控制了另外两名钱包工程师的电脑。Binance 没有公开工具名称和机制，也没有确认存在提示注入或 MCP 漏洞。另一名工程师是在搜索 AI 编码工具的安装方式时，下载了被篡改的 Homebrew。来源：[Binance 初步报告](https://www.linkedin.com/pulse/29-october-binance-security-incident-initial-findings-response-modgf/)、[StepSecurity 分析](https://www.stepsecurity.io/blog/binance-hack-developer-machine-security)。
- 教训：AI 写的代码和配置要走同样的审查和集成测试；插件和依赖走白名单。能在员工电脑上执行操作的内部 AI 工具，要按用户隔离身份，并按特权系统审计。

### 5.6 AI 对诈骗规模的影响

- Chainalysis 统计 2025 年诈骗损失约 140 亿美元（已确认）至 170 亿美元（估算），冒充类诈骗大幅增长；与 AI 服务供应商有链上关联的诈骗团伙，平均获利约是无关联团伙的 4.5 倍。来源：[Chainalysis](https://www.chainalysis.com/blog/crypto-scams-2026/)。
- FBI 2024 年 12 月公告提醒：AI 被用于生成钓鱼文本、虚假证件、语音克隆和实时深伪视频，并建议家人之间约定暗语。来源：[FBI IC3](https://www.ic3.gov/PSA/2024/PSA241203)。
- 教训：AI 抬高的是单起诈骗的获利能力。风控应重点识别冒充类话术和大额异常。

### 5.7 智能体支付协议（2025–2026）

- Coinbase 2025 年 5 月发布 x402：复用 HTTP 402 状态码，客户端在请求中附上签名的稳定币付款。研究者审计 SDK 和线上端点后发现重放等问题，其中一个端点对同一笔付款授予了 248 次访问。来源：[Coinbase](https://www.coinbase.com/developer-platform/discover/launches/x402)、[论文](https://arxiv.org/abs/2605.11781)。
- 教训：付款必须与资源绑定并做幂等检查；客户端强制设置支付上限。

---

## 6. 评估检查点

**持有钱包的 AI 智能体：**

- [ ] **AIX-1** 智能体使用独立的低额度钱包；主资产不交给智能体。
- [ ] **AIX-2** 单笔、单日额度和地址白名单写在代码或合约里，不在提示词里。
- [ ] **AIX-3** 新地址、授权、大额操作需要人工确认，确认界面显示解码后的交易。
- [ ] **AIX-4** 外部内容和其他模型的输出被标记为不可信，不能直接触发转账。
- [ ] **AIX-5** 记忆写入有来源校验；转账决策不依赖记忆；转账前从链上读取余额。
- [ ] **AIX-6** 运维面板有硬件密钥 MFA、审计日志和指令审批。
- [ ] **AIX-7** MCP 服务器和插件经过审查并锁定版本。

**团队与流程：**

- [ ] **AIX-8** AI 生成的代码和配置走同样的审查、测试和审计。
- [ ] **AIX-9** 价格源和参数配置有对接真实数据的集成测试。
- [ ] **AIX-10** IDE 和 AI 插件、依赖包走白名单。
- [ ] **AIX-11** 视频会议中的安装请求和大额指令有带外确认流程。
- [ ] **AIX-12** KYC 活体检测能防虚拟摄像头注入。
- [ ] **AIX-13** 漏洞修复的时效目标已根据"利用窗口缩短"调整。

**把检查结果写进报告：**

| 检查项 | 发现时的证据 | 常见定级（用 [A02](assessment/A02-risk-rating-reporting.md) 复核） | 练习位置 |
|---|---|---|---|
| AIX-1 至 AIX-3 | 钱包额度、合约限额、确认界面 | Critical / High | [A06](assessment/A06-operational-key-security.md) |
| AIX-4、AIX-5 | 注入测试用例和结果 | High | [钓鱼实验](interactive/phishing-signature-lab.html) |
| AIX-6、AIX-7、AIX-10 | 运维面板配置、MCP 和插件白名单 | High | [20 章](20-frontend-dns-supply-chain.md) |
| AIX-8、AIX-9 | 代码审查记录、集成测试 | High / Medium | [27 章](27-audit-testing-workflow.md) |
| AIX-11、AIX-12 | 带外确认流程、活体检测测试 | High | [21 章](21-social-engineering-insiders.md)、[T07](templates/T07-staff-anti-social-engineering.md) |
| AIX-13 | 修复时效目标 | Medium | [A07](assessment/A07-external-audit-bounty.md) |

发现按 [T03 报告模板](templates/T03-finding-report.md) 记录。

---

## 7. 用户侧防护

1. 不要把主钱包交给任何 AI 机器人或"AI 交易助手"。如果要用，给它一个只放少量资金的独立钱包。
2. 视频里的"名人""高管""客服"可能是伪造的。任何人在视频里让你转账、装软件，都先停下来。
3. 和家人约定一个暗语，用于确认紧急求助是否真实。
4. AI 生成的投资建议、合约代码、交易脚本，不能直接用于真实资金。
5. 只从官方市场安装编程插件和钱包工具，并检查发布者。
6. 宣称"AI 自动套利、保证收益"的平台，按 [19 章](19-user-scams.md) 的骗局清单检查。

---

## 8. 术语表

| 术语 | 英文 | 定义 |
|---|---|---|
| AI 智能体 | AI Agent | 能调用工具、执行操作的大语言模型程序 |
| 提示注入 | Prompt Injection | 把指令藏在模型会读到的内容里，改变模型行为 |
| 记忆注入 | Memory Injection | 往智能体的长期记忆中写入伪造内容 |
| 工具投毒 | Tool Poisoning | 在工具描述中隐藏恶意指令 |
| MCP | Model Context Protocol | 让模型连接外部工具和数据的协议 |
| 深度伪造 | Deepfake | 用 AI 生成的伪造视频、图像或语音 |
| 幻觉包名 | Slopsquatting | 抢注 AI 编造出来的不存在的包名 |
| 活体检测 | Liveness Detection | KYC 中确认镜头前是真人的检测 |
| 智能体支付 | Agentic Payment | 由 AI 智能体自动完成的付款，例如 x402 |

---

> 🪞 反思：想想你今天用过的 AI 工具。
> 1. 它能读到什么？能执行什么？
> 2. 如果它读到的一段内容里藏着指令，最坏会发生什么？
> 3. 哪一条限制不依赖模型"听话"？

## 9. 思考题

1. 你的团队想做一个"AI 自动帮用户撤销危险授权"的机器人。按第 4.1 节，列出它必须具备的五项控制。
2. Freysa 和 Grok × Bankr 都是"说服模型转账"。如果把转账额度和白名单写在合约里，这两起事件还会发生吗？会变成什么样？
3. AI 让漏洞被利用的时间窗口缩短。对照 [27 章](27-audit-testing-workflow.md) 的安全关口，你会调整哪一个关口的时效要求？

下一章：[27 审计、测试与开发流程](27-audit-testing-workflow.md) —— 把前面所有知识变成一套可执行的流程。
