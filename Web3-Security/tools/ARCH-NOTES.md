# 写作中发现的需回头对齐的事项（arch 章节）

| 来源章 | 涉及现有章节 | 问题 | 处理 |
|---|---|---|---|
| X04 | 20-frontend-dns-supply-chain.md §5「2025-12 Trust Wallet 扩展」行 | 现有章写“泄露的 GitHub secrets → 发布恶意扩展版本”；X04 独立查证只找到泄露的 Chrome Web Store API key，没有来源把它与 GitHub secrets 联系起来 | 待用户确认后回改 20 章措辞 |
| X03 | — | SCP 条件键 `ec2:MetadataHttpTokens` 未能在搜索中确认，发布前需本地测试 | 待测试 |
| X05 | — | Balancer v2（2025-11）小时级时间线与金额只来自搜索摘要 | 发布前确认或删除 |
| X07 | 23 / 29 | 2026-10 Binance 事件金额：23/29 章写 $6.34B（Binance）与 63.6–64.3 亿（TRM/Elliptic），X07 未复核；FBI 与 Binance 原文均 403 | 待人工复核 |
| X20 | — | 前缀 DAT 已被 24 章占用，X20 改用 XDT | 已在简报中记录 |
| X20 | — | GDPR 72 小时、SEC 8-K 四个工作日、NYDFS 72 小时、CloudTrail 日志校验、对象锁合规模式等出自作者知识，未重新抓取官方页 | 发布前核对 |
| X07/X14/X17 | — | Binance 2026 与 2025 价格事件在 X07、X14、X17 重复出现；Bitget 2026-09 报道金额（约 3.88 亿 vs 交易合计约 3.61 亿）不一致，章内如实标注 | 发布前核对 |
| X28 | — | 以太坊官方赏金页最高奖金按抓取值写（严重漏洞最高 100 万美元）；有二手来源写 25 万，可能已过时 | 发布前核对官网现行页面 |
| X28 | — | Polygon 2021、@solana/web3.js 2024 两案例官方原文 404，仅凭媒体与安全厂商转述；web3.js 约 13 万美元损失为媒体转述的 CEO 估算 | 章内已注明 |
| X23 | — | 值班 SecOps 可先暂停单链提币（15 分钟内由事件指挥官确认）是示例策略，非通用事实 | 待用户确认是否保留为默认 |
| X29 | 12-cross-chain-bridges.md | 12 章已用 BRG-1–BRG-8，X29 的检查项从 BRG-9 起；是否把 12 章改前缀待定 | 暂保留 |
| X29 | — | Linea 2024 排序器停摆案例偏旧；预言机节点运营方本身没有找到合格公开事故，预言机部分靠 Moonwell（消费方失败）支撑 | 若能找到更新案例再换 |
| X33 | — | SEAL Safe Harbor 上限 100 万美元（SEAL 页）与 Lido 采纳页 200 万美元不同，章内均作示例；发布前核对 SEAL 现行页；DOJ CFAA 2022 政策来自律所转述 | 发布前核对 |
| X34 | 18-wallet-key-management.md | Trust Wallet v2.68 案例与 18 章摘要重复，X34 换“发布面控制”角度、重新查证；资损 101 链接在 arch/ 下会使 md2data 报 unresolved，章内用纯文字 | 保留 |
| X36 | — | USDC 脱锚最低约 0.88 美元仅媒体口径；Garantex 只作对手方 / 制裁风险案例 | 章内已注明 |
| X30 | — | Balancer v2 损失估计 9480 万–1.28 亿美元区间；Radiant 与 Safe 对根因有争议；PauseGuardian 合约未编译，cast 命令未对链执行 | 发布前编译 / 运行一次；章内已标注 |
| X31 | 11-defi-economic-security.md | 稳定币 / RWA 监管：OCC GENIUS 最终规则细节（2026-10 发布、2027-01 生效、两个工作日赎回、5% / 40% 储备限制）来自律所摘要，未读 OCC 原文；Resolv 事件 Blockaid 称“铸造合约漏洞”，11 章等称“服务密钥被控”，章内并列 | 发布前核对 |
| X37 | — | 案例 3（MEV 机器人诱饵交易）无罪裁定仅 The Block 一源；案例 4 Lighter、案例 5 SignalPlus 为近一周（2026-11）事件，来源多为二手媒体，未读官方原文；SignalPlus 未强制 IP 白名单、损失低于 8.2 万美元只见少数媒体；Gotbit 刑期各报道不一致 | 章内已标“来源较少”；发布前决定是否保留最新事件 |
| X35 | — | 托管机构案例都不是黑客盗币（Prime Trust、StakeHound v. Fireblocks 为争议未决、BitForge 厂商自述、Coinbase 内部人）；SEC SAB 122 / 无异议函条件、MAS 规则来自律所摘要；香港托管主体结构二手来源冲突已不写；SOC 阅读顺序、红线与评分权重是本章建议 | 章内已标注 |
| X32 | 17-node-rpc-infrastructure.md | MetaMask 质押事件（2026-09）根因与签名密钥暴露未披露，约 1.7 万验证者退出为研究者估算，官方 11 月更新只经聚合站读到；Prysm Fusaka 后事故官方复盘页 404，仅靠 Potuz 技术分析与媒体；Ankr 无自己的复盘；Lighthouse doppelganger 文档未读到 | 章内已注明 |
| B76 | X 章 INF-20 | S7 中 `prod/signing-config` 被读取映射到 INF-20，该条原文针对“签名密钥”，属推断式映射 | 酌情改 |
| 靶场 | ops/API.md | W000889（S1-03，25,000 美元提币）只有 1 个审批人，已在 API.md 标为“有意设计”，是主会话据 S1-03 含义的推断，需靶场作者确认 | 待确认 |
| 学习站 | ans/out | X01–X48、B71–B76 的参考答案已写；B77 待写；x02 Q1 的落地顺序、x03 Q2 的 Mixin 延伸、x14 Q2 / x15 Q2 的三问与取舍为答案作者的判断 | 发布前过目 |

## 第二轮（X00、X09–X48、B79–B83）发布前待核事实（2026-11-23）

字数口径：多数章节汉字 7,300–9,100，低于简报 9,000 下限（简报的字符上限与汉字下限冲突，代理按字符上限取舍）。

- X18 引用的 X17 的 Bitget 案例（17 笔、1 小时 11 分钟、对账 7 分钟发现）与 BleepingComputer 的时间线不一致，建议复核 X17。
- X24：OFAC / DOJ / DFS 原文未抓取，处罚金额与日期来自二手来源；X25：美国法规条款与时限（31 CFR 1022.320、501.603、501.806/807；18 U.S.C. 2703(f)）为美国示例，以法务为准。
- X26：Poloniex 与 Coinbase ETC 重组的原文链接当时抓取失败，依据多家媒体摘要。
- X27：Mt. Gox 事实来自 Wikipedia；Binance zk-SNARK 升级年份未写。
- X41 与 X29 的 KelpDAO rsETH 数字口径不同（Galaxy / LayerZero vs Chainalysis），需统一。
- X42：Dencun（EIP-6780）对 selfdestruct 的说法凭已有知识；cast 脚本未在真实合约上跑；案例 2–4 为第三方转述。
- X43：欧盟 AMLR 第 79 条生效日期（2027-07-01 或 10）与 FinCEN 撤回混币提案（2026-10）仅二手来源；Samourai 刑期取司法部口径。
- X44：App Attest、Secure Enclave P-256、FLAG_SECURE、filterTouchesWhenObscured、API 34 无障碍属性为凭已有知识；案例 3 Crocodilus 为媒体转述。
- X45：DNSSEC 根仪式细节与 FIPS 140-3 级别未逐条核对；Wintermute 与 Profanity 的关联是分析推测。
- X47：Coinbase 事实仅二手；ISO 27001:2022 Annex A 与 NIST 800-53 PS 引用凭已有知识。
- X48：SolarWinds 撤诉为 2025-11 的新事件，仅二手来源；Sullivan 量刑未单独核对。
- 案例取向：X10 的 Robinhood / 23andMe / Roku、X16 的 Knight / CME、X22 的 UniSuper / OVH / AWS 为非加密案例，因加密公开复盘少；X12 的两个案例是控制成功拦截的案例。
- 靶场：API_X.md 的 S13-03 数字已按数据修正；并行跑 setup.sh 会偶发 sqlite 错误，单独运行全部通过（34 项）。
