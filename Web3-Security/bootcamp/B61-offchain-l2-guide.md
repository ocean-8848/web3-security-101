# B61 链下赛道 L2 导读：固若金汤——基础设施与运营

> 学习目标：读完本篇，你能——
> 1. 说出链下赛道 L2 要掌握的 8 个主题，以及每个主题怎样算掌握。
> 2. 按顺序安排 L2 的章节，并用过关标准判断整条链下赛道是否完成。
>
> 前置：完成链下赛道 L1（[L1 导读](B56-offchain-l1-guide.md)）：密钥分级表、签前复核单和 T07 第 2 部分完成，L1 测验 ≥ 80%。
> 预计用时：各章用时见第 3 节；整条链下赛道的周计划示例见 [B00 第 4 节](B00-roadmap.md)。

---

## 1. 本阶段学完能做什么

- 加固一个前端：从依赖、构建、发布、浏览器防护到 DNS。
- 验证 RPC 数据，为每条链定出入账条件，并盘点节点自身的暴露面。
- 为一个示例交易所定热钱包水位、写提现风控规则、在签名前重算多签哈希，并写出应急 runbook。
- 从一笔交易哈希追踪资金，写冻结请求包；识别签名、随机数、ZK 和跨链桥的实现风险。

## 2. 要掌握的主题

| 主题 | 在哪学 | 掌握标准 |
|---|---|---|
| 前端依赖与构建 | [B62](B62-frontend-supply-chain-practice.md)、主线 [20](../20-frontend-dns-supply-chain.md) | 你拿到 `EINTEGRITY`，并能从 `git diff` 里指出被换的那一行；grep 找出 4 个命中，每个写出一句影响。 |
| 前端发布、浏览器防护与 DNS | [B62](B62-frontend-supply-chain-practice.md) | 你在控制台看到 SRI、CSP 的 3 条拦截，比对脚本输出 `MISMATCH app.js`，并能解释 `ad` 标志。 |
| RPC 多源仲裁与入账确认 | [B63](B63-node-rpc-practice.md)、主线 [17](../17-node-rpc-infrastructure.md)、[16](../16-consensus-chain-security.md) | 你跑出冲突暂停、达不到法定数、降级后放行 3 种结论，并看到一笔已到账的充值在重组后消失。 |
| 节点暴露面与验证者风险 | [B63](B63-node-rpc-practice.md)、主线 [17](../17-node-rpc-infrastructure.md) | 你的网关拦下 4 种请求，只放行带令牌的 `eth_blockNumber`。 |
| 热钱包水位、提现风控与多签哈希 | [B64](B64-custody-ops-ir-practice.md)、主线 [23](../23-custody-exchange-ops.md)、[29](../29-signing-path-2026.md) | 你算出热钱包上下限 24.0M 和 7.1M；`sh safe-hash.sh 1` 的输出与多签实验 #42 的重算哈希相同。 |
| 链上委托检查与应急 runbook | [B65](B65-incident-response-practice.md)、主线 [29](../29-signing-path-2026.md)、[A09](../assessment/A09-incident-response.md) | 你在本地链完成"委托 → ALERT → 撤销 → OK"，并交付 RB-01 runbook。 |
| 资金追踪、冻结与隐私合规 | [B66](B66-tracing-privacy-practice.md)、[B67](B67-privacy-compliance-practice.md)、主线 [25](../25-fund-tracing-response.md)、[24](../24-data-privacy.md)、[23](../23-custody-exchange-ops.md) | 你从起点哈希写出 4 行地址清单，每行都有交易哈希和可冻结方；你能用枚举命中不加盐的邮箱哈希。 |
| 密码学、ZK 与跨链实现风险 | [B68](B68-crypto-zk-bridge-practice.md)、[B69](B69-zk-bridge-practice.md)、主线 [02](../02-cryptography-randomness.md)、[14](../14-zk-proof-systems.md)、[12](../12-cross-chain-bridges.md) | 你用两笔共享 r 的签名恢复私钥，并在 ZK 实验里复现 `b4 = 30` 和 `a = 96 → r = 21` 两组恶意见证。 |

> 💡 注意：L1 的弱随机数练习针对钱包工具生成的私钥。本阶段 B68 针对签名实现：nonce 重用和时间戳种子。阶段 4 的 [B32](B32-audit-5-echobridge.md) 审计桥合约代码；本阶段 B69 评审桥的消息绑定、Merkle 哈希域和验证者门限。

## 3. 章节顺序

1. [B62 前端供应链：依赖、构建、发布与 DNS](B62-frontend-supply-chain-practice.md)：用户最先接触的是前端。先查构建，再查线上和域名。约 2–3 小时。
2. [B63 节点、RPC、确认与暴露面](B63-node-rpc-practice.md)：前端读的数据来自节点。先定"信哪个节点"，再查"节点自己安全吗"。约 3–3.5 小时。
3. [B64 热钱包水位、提现风控与多签复核](B64-custody-ops-ir-practice.md)：入账可信了，再管出账。约 1.5–2 小时。
4. [B65 应急：检查链上委托、沙盘与 runbook](B65-incident-response-practice.md)：事前控制失效时怎么响应。约 1.5–2 小时。
5. [B66 资金追踪与处置](B66-tracing-privacy-practice.md)：资金已经流出后怎么追。约 2–3 小时。
6. [B67 数据隐私与合规](B67-privacy-compliance-practice.md)：追踪结论也会冤枉人。约 1–1.5 小时。
7. [B68 密码学实现风险](B68-crypto-zk-bridge-practice.md)：看签名和随机数的底层实现。约 1.5–2 小时。
8. [B69 ZK 与跨链实现风险](B69-zk-bridge-practice.md)：把实现风险扩展到证明系统和桥。约 2 小时。

## 4. 本阶段交互实验

- [多签签前复核](../interactive/multisig-review-lab.html)（B62 可选、B64）
- [RPC 多源仲裁](../interactive/rpc-quorum-lab.html)、[确认深度](../interactive/confirmation-depth-lab.html)（B63）
- [热钱包应急演练](../interactive/incident-response-sim.html)、[安全事故浏览器](../interactive/incident-explorer.html)（B65）
- [链上去匿名化](../interactive/deanonymization-lab.html)（B67）
- [ZK 约束不足](../interactive/zk-constraint-lab.html)、[Merkle 证明与验证者门限](../interactive/audit-merkle.html)、[链迁移风险检查器](../interactive/chain-porting-lab.html)（B69）

## 5. 过关标准

- [ ] [阶段测验](../interactive/bootcamp-quiz.html)选择链下赛道 L2，得分 ≥ 80%。
- [ ] 对一个真实前端填完 FE-1 至 FE-10；NoteDAO 的 T06 第 3 部分红线判断与参考答案一致（B62）。
- [ ] NoteEx 的数据源与入账策略表，5 条链都写明依据（B63）。
- [ ] RB-01 runbook 和推演卡点记录，至少 3 个卡点有负责人和期限（B65）。
- [ ] 冻结请求包，证据文件有 SHA-256 指纹（B66）。
- [ ] MiniBridge 评审笔记，检查清单 7 项都有状态和证据（B69）。
- [ ] 按 [T06](../templates/T06-ops-security-self-check.md) 为一个示例组织完成自查。

## 6. 下一步

链下赛道到此完成。术语和外部资源查 [B70 术语表与资源索引](B70-glossary-resources.md)；回到 [B00 训练营路线](B00-roadmap.md)，选下一条路线或继续合约主线。
