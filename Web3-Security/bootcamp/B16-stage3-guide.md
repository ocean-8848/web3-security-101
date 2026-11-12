# B16 阶段 3 导读：渐入佳境——能审 DeFi

> 学习目标：读完本篇，你能——
> 1. 说出阶段 3 要掌握的 8 个主题，以及每个主题怎样算掌握。
> 2. 按顺序安排阶段 3 的章节，并用过关标准判断能否进入阶段 4。
>
> 前置：完成阶段 2（[阶段 2 导读](B11-stage2-guide.md)）：NoteBox 和 LuckyPot 两份报告完成，参考答案召回 ≥ 70%，阶段 2 测验 ≥ 80%。
> 预计用时：各章用时见第 3 节；周计划示例见 [B00 第 4 节](B00-roadmap.md)。本阶段章节最多，通常最耗时。

---

## 1. 本阶段学完能做什么

- 画出 DeFi 的主要类别和依赖关系，用"协议卡"拆解一个头部协议。
- 手算 AMM 的成交量、借贷的健康因子和清算价格。
- 分析闪电贷、预言机操纵、存储冲突和经济模型风险，并写成可验证的发现。
- 先给一个陌生协议建模、写不变量，再端到端审计它，最后对照模型报告自评。

## 2. 要掌握的主题

| 主题 | 在哪学 | 掌握标准 |
|---|---|---|
| DeFi 地图与协议卡 | [B17](B17-defi-basics.md)、主线 [11](../11-defi-economic-security.md) | 你能用"钱从哪来、存在哪里、谁能动它、价格从哪来、什么必须永远成立"五个问题拆解一个协议。 |
| AMM 数学与 DEX 审计 | [B18](B18-dex-amm.md)、[B19](B19-audit-3-miniswap.md)、主线 [09](../09-mev-signatures.md) | 你能手算 `1,000/1,000` 的池子放入 100 个 A 的输出，误差小于 1。 |
| 有状态不变量测试与 Echidna | [B19 第 3 节](B19-audit-3-miniswap.md) | `HandlerInvariantVulnerable` 失败 2 项、`HandlerInvariantFixed` 通过 3 项；你能解释开放式测试 PASS 为什么没有价值。 |
| 借贷、健康因子与清算 | [B20](B20-lending-cdp.md) | 你能算出一个仓位的健康因子和清算价格，并画出一次存借的调用链。 |
| 闪电贷与预言机操纵 | [B17 第 4 节](B17-defi-basics.md)、[B21](B21-audit-4-flashdesk.md)、[B24](B24-defi-ctf.md)、主线 [08](../08-oracle-flashloan.md) | 你在 FlashDesk 里找到 FD-ORA-1；Puppet 系列每关有 Foundry 题解，并写出被打破的不变量。 |
| 代理存储布局与中心化风险定级 | [B21](B21-audit-4-flashdesk.md)、主线 [10](../10-upgradeable-proxy.md) | 你能用 `forge inspect` 的 diff 指出冲突的槽位；FD-ACC-7 写明了信任假设和定级依据。 |
| 经济模型与协议建模 | [B22](B22-economics-governance.md)、[B23](B23-complex-protocols.md) | 你能用"操纵成本 vs 收益"评估一次攻击，并为一个陌生协议填完建模四张表、写出不变量。 |
| 端到端 DeFi 审计 | [B25](B25-capstone-minilend.md)、[A02](../assessment/A02-risk-rating-reporting.md)、[T03](../templates/T03-finding-report.md) | 你按 T03 模板写完 MiniLend 报告，并按 B25 逐字段自评。 |

> 💡 注意：集中流动性、V4 Hooks 和头部协议的源码精读放在阶段 5（[B37](B37-clamm-v4.md)、[B35](B35-case-method.md)–[B41](B41-case-erc4626.md)）。本阶段只建立 DeFi 的业务模型和审计方法。

## 3. 章节顺序

1. [B17 DeFi 地图与头部协议](B17-defi-basics.md)：先有地图，再进具体协议。用时未标注。
2. [B18 DEX 与 AMM](B18-dex-amm.md)：AMM 是其他协议的价格来源，先学。用时未标注。
3. [B19 第 3 次审计：MiniSwap](B19-audit-3-miniswap.md)：马上用 AMM 知识审一个池子，并学有状态不变量测试。约 8–10 小时。
4. [B20 借贷与清算](B20-lending-cdp.md)：借贷依赖价格，所以放在 AMM 之后。用时未标注。
5. [B21 第 4 次审计：FlashDesk](B21-audit-4-flashdesk.md)：把借贷、预言机和可升级代理放进一次审计。约 5–7 小时。
6. [B22 经济模型风险](B22-economics-governance.md)：代码没错时，再看公式会不会自我毁灭。用时未标注。
7. [B23 建模与不变量](B23-complex-protocols.md)：把前面的方法用在一个从没见过的协议上。用时未标注。
8. [B24 DeFi CTF 攻防](B24-defi-ctf.md)：用攻击者的身份把闪电贷、AMM、预言机和治理再练一遍。可以和第 3–7 步交替做。
9. [B25 实战项目：端到端审计 MiniLend 与模型报告](B25-capstone-minilend.md)：端到端审计，作为本阶段的毕业作业。先独立写完报告，再读第 11 节的模型报告。先读答案会失去练习机会。

## 4. 本阶段交互实验

- [APR/APY](../interactive/audit-apy.html)、[份额换算](../interactive/audit-steth.html)（B17）
- [AMM 工作台](../interactive/audit-amm.html)、[抢跑](../interactive/audit-frontrun.html)、[K 值检查](../interactive/audit-v2k.html)（B18、B19）
- [不变量模糊测试器](../interactive/audit-fuzz.html)（B19、B23）
- [健康因子](../interactive/audit-lending.html)、[检查覆盖矩阵](../interactive/audit-hfmatrix.html)（B20）
- [存储与代理](../interactive/storage-proxy-lab.html)、[预言机操纵](../interactive/oracle-manipulation-lab.html)（B21、B24）
- [金库通胀](../interactive/vault-inflation-lab.html)、[签名重放](../interactive/signature-replay-lab.html)（B24）
- [死亡螺旋](../interactive/audit-spiral.html)、[治理攻击](../interactive/audit-governance.html)（B22）
- [MiniLend 审计练习台](../interactive/audit-capstone.html)（B25）

## 5. 过关标准

- [ ] [阶段测验](../interactive/bootcamp-quiz.html)选择阶段 3，得分 ≥ 80%。
- [ ] MiniSwap 报告包含全部 6 项发现；Echidna 对漏洞版给出 `falsified`，对修复版给出 `passing`。
- [ ] FlashDesk 报告：独立找到至少 5 个发现，其中包含全部 3 个 High。
- [ ] DVDeFi 的 Unstoppable、Naive Receiver、Truster、Side Entrance、Selfie、Puppet 系列各有一个 Foundry 题解测试；至少 1 关写了修复前失败、修复后通过的不变量测试（B24）。
- [ ] MiniLend 报告按 T03 格式写完，并按 B25 完成自评。
- [ ] 三份报告合计：高危和中危召回率 ≥ 60%，至少写 3 条不变量，误报 ≤ 2 条。

## 6. 下一步

进入 [阶段 4 导读：独当一面——独立审计](B26-stage4-guide.md)。
