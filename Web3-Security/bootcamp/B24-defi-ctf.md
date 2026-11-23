# B24 DeFi CTF 攻防

> 学习目标：把 Damn Vulnerable DeFi 的每一关映射到 DeFi 漏洞模式；用"找被打破的不变量"的方法解题；了解其他 CTF 平台的现状。  
> 前置章节：[B10 CTF 入门关卡](B10-ctf-practice.md)（解题方法）、[B17 DeFi 地图与头部协议](B17-defi-basics.md)、[B18 DEX 与 AMM](B18-dex-amm.md)；主线 [08](../08-oracle-flashloan.md)、[11](../11-defi-economic-security.md) 章。借贷类关卡还需要 [B20](B20-lending-cdp.md)。  
> 使用方式：和本阶段的 B19、B21 交替练习。做完一类关卡，就去审对应的靶场。

> 🔗 关联：主线 [08 章](../08-oracle-flashloan.md)、[09 章](../09-mev-signatures.md)、[10 章](../10-upgradeable-proxy.md)、[11 章](../11-defi-economic-security.md) ｜ 实验 [预言机操纵](../interactive/oracle-manipulation-lab.html)、[金库通胀](../interactive/vault-inflation-lab.html)、[签名重放](../interactive/signature-replay-lab.html) ｜ 评估 [A08](../assessment/A08-reproduce-attacks.md) ｜ 衔接 [B53](B53-contests-and-habits.md)（阶段 7）

> ⚠️ 警告：只在 CTF 官方靶场、本地环境或测试网练习。练习规则见 [B04 第 1 节](B04-setup.md)。

## 1. DeFi 关卡怎样用同一套方法

解题方法见 [B10 第 1 节](B10-ctf-practice.md)：读胜利条件 → 找写入点 → 找守卫 → 破守卫 → 写 PoC。DeFi 关卡有两点不同：

- 胜利条件通常是"池子余额归零"或"金库停止服务"。
- 守卫通常是一条不变量，例如"还款后余额不低于借出前"，或"价格读取不能被单笔交易改变"。破守卫，就是找到让检查通过、真实状态却被破坏的那条路径。

> 🎯 打个比方：入门关卡像撬一把锁。DeFi 关卡像骗过一个只看账本总数的会计：总数对上了，钱却换了主人。
>
> 比喻的局限：会计可以事后对账。链上交易一旦确认，被转走的资金通常追不回来。

## 2. Damn Vulnerable DeFi（v4，Foundry 版）

进阶关卡把你放进一个模拟的 DeFi 环境。你扮演攻击者，手上有闪电贷、AMM、预言机和治理合约。每一关都对应一种真实的 DeFi 漏洞模式。

| 关卡 | 考点 |
|---|---|
| Unstoppable | 余额严格相等检查 → 捐赠造成 DoS（ERC-4626 闪电贷金库） |
| Naive Receiver | 闪电贷接收方不校验发起者；meta-transaction 中 `_msgSender` 伪造 |
| Truster | 闪电贷执行任意调用 → 让池子给自己 approve |
| Side Entrance | 闪电贷回调中把借来的钱"存回"池子，记成自己的存款 |
| The Rewarder | Merkle 分发重复领取 |
| Selfie | 闪电贷借治理票 → 提案提取资金 |
| Compromised | 泄露的预言机私钥 → 操纵喂价 |
| Puppet / Puppet V2 / Puppet V3 | 用 Uniswap V1 / V2 现货 / V3 短窗口 TWAP 当预言机 |
| Free Rider | NFT 市场用 `msg.value` 支付多个 NFT；付款给"新 owner" |
| Backdoor | Safe 钱包创建时的 `setup` 模块注入 |
| Climber | 时间锁"先执行后检查"→ 在执行中给自己授权 |
| Wallet Mining | CREATE2 地址预测（找回丢失的 nonce）；代理的 `upgrader` 与实现的 `needsInit` 占同一存储槽，导致可重复初始化 |
| ABI Smuggling | 手工构造 calldata 偏移绕过选择器权限检查 |
| Shards | 分数计算取整 |
| Curvy Puppet | Curve 只读重入 + 借贷清算 |
| Withdrawal | L2 → L1 提款证明与桥的操作员权限 |

> 💡 注意：Backdoor、Wallet Mining、ABI Smuggling 用到 Safe、CREATE2 和 calldata 编码的细节。这些内容在阶段 5（[B40](B40-case-safe.md)）和阶段 6（[B45](B45-yul-opcodes.md)、[B46](B46-calldata-memory.md)）展开。本阶段可以先跳过，学完再回来做。

> 🧪 动手验证：做完 Puppet 系列后，打开[预言机操纵实验](../interactive/oracle-manipulation-lab.html)。调整池子深度，记录现货价格被拉偏一倍需要多少资金。做完 Unstoppable 后，打开[金库通胀实验](../interactive/vault-inflation-lab.html)，对比"捐赠"在两种场景中的作用。

## 3. 其他平台

| 平台 | 特点 |
|---|---|
| Paradigm CTF | 年度高难度赛，题目覆盖 EVM 底层、DeFi、Solana；往届题目与官方题解公开 |
| Curta | 链上谜题，按解题速度排名；题目偏 EVM 与数学 |
| EtherHack（Positive） | 已停止维护（截至 2026 年 11 月域名无法解析） |
| SI Blockchain CTF（Security Innovation） | 已停止维护（基于已退役的 Ropsten 测试网，截至 2026 年 11 月站点连接失败）；[题目仓库](https://github.com/SecurityInnovation/Smart-Contract-CTF)仍在 |
| [QuillCTF](https://www.quillaudits.com/academy/ctf)、[Cipher Shastra](https://ciphershastra.com/) | 中级题集，侧重 DeFi 与真实漏洞改编；QuillCTF 已迁至 QuillAudits Academy；Cipher Shastra 站点在线，页脚仍为 2023 年，维护状态不明 |
| [unhackedctf](https://github.com/unhackedctf) | 已停止维护（GitHub 最后更新于 2022 年） |

各平台的链接汇总见 [B78 资源索引](B78-glossary-resources.md) 的 "CTF" 一行。

## 4. 过关标准

- [ ] 完成 Unstoppable、Naive Receiver、Truster、Side Entrance、Selfie、Puppet 系列，每关有一个 Foundry 题解测试。
- [ ] 每个题解都用一句话写出被打破的不变量。
- [ ] 至少为 1 关写一条不变量测试，证明它能在修复前失败、修复后通过。

> 🪞 反思：回想你最近解过的一道 DeFi 关卡。
> 1. 你能用一句话写出被打破的不变量吗？
> 2. 这个不变量，或相似的回调和价格读取，在你自己的合约里存在吗？
> 3. 你用的攻击路径，和哪个真实事件的哪一步相同？

## 5. 思考题

1. Side Entrance 中，池子的哪个不变量被打破了？写成一句话。
2. Climber 的根因是"先执行，后检查"。它违反了[第 04 章](../04-reentrancy.md)的哪条原则？
3. Unstoppable 的金库用"余额严格相等"做检查。按第 1 节的方法，写出胜利条件、守卫和被打破的假设，并说明怎样修复。

下一章：[B25 实战项目：端到端审计 MiniLend](B25-capstone-minilend.md)
