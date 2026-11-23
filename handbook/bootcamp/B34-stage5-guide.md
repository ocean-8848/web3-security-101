# B34 阶段 5 导读：庖丁解牛——头部协议与高级 DeFi

> 学习目标：读完本篇，你能——
> 1. 说出阶段 5 要掌握的 8 个主题，以及每个主题怎样算掌握。
> 2. 按顺序安排阶段 5 的章节，并用过关标准判断能否进入阶段 6。
>
> 前置：完成阶段 4（[阶段 4 导读](B26-stage4-guide.md)）：EchoBridge 和 GuardVault 两份报告完成，GuardVault 评分 ≥ 70，阶段 4 测验 ≥ 80%。
> 预计用时：各章用时见第 3 节；周计划示例见 [B00 第 4 节](B00-roadmap.md)。

---

## 1. 本阶段学完能做什么

- 按固定顺序读一个大型协议的源码，产出资产表、角色表、入口表、不变量和集成方清单五份底稿。
- 审计五类头部协议及其分叉或集成方：AMM、借贷、变化余额代币、多签、ERC-4626 金库。
- 手算集中流动性的 tick 和 `sqrtPriceX96`，并审计一个 V4 Hook。
- 解释永续合约的保证金、资金费和清算，并审计一个单市场永续合约。

## 2. 要掌握的主题

| 主题 | 在哪学 | 掌握标准 |
|---|---|---|
| 底稿方法与 Uniswap V2 精读 | [B35](B35-case-method.md)、[B36](B36-case-uniswap-v2.md)、主线 [27](../chapters/27-audit-testing-workflow.md) | 你按 B35 模板产出五份底稿，并能逐行解释 Uniswap V2 `swap()` 的每一个安全设计。 |
| 集中流动性数学与 V4 Hooks | [B37](B37-clamm-v4.md)、主线 [06](../chapters/06-arithmetic-precision.md) | 你能手算 tick 0 的 `sqrtPriceX96` 是 `2^96`，并说出 Hook 里 `msg.sender` 和参数 `sender` 分别是谁。 |
| 借贷协议的权限分层与分叉审计 | [B38](B38-case-aave-v3.md)、主线 [08](../chapters/08-oracle-flashloan.md) | 你能确认每一个让账户变得更危险的入口，都经过了同一套校验。 |
| 变化余额代币的集成 | [B39](B39-case-lido.md)、主线 [07](../chapters/07-external-calls-tokens.md) | 你能说出集成方把 stETH 当普通 ERC20 时，会在记账、转账断言和估值三处出错。 |
| 多签的流程审计 | [B40](B40-case-safe.md)、主线 [05](../chapters/05-access-control.md)、[18](../chapters/18-wallet-key-management.md) | 你能列出 SafeTx 的字段，并说明签名者看到的内容要怎样与实际签名的内容独立核对。 |
| ERC-4626 取整与资产来源 | [B41](B41-case-erc4626.md) | 你能判断每个换算函数的取整方向，并说出 `totalAssets()` 被低成本操纵的途径。 |
| 永续合约机制 | [B42](B42-perps.md) | 你不看书算出：3,000 美元名义、600 美元保证金、1% 维持保证金的多头，清算价是 2,430 美元。 |
| 永续合约审计 | [B43](B43-audit-7-perplite.md) | 不看提示，你在 PerpLite 里找到至少 5 个漏洞，并自己写一条通过的不变量。 |

> 💡 注意：AMM 和借贷的业务模型在阶段 3 已经学过。本阶段只学"读真实源码"和"审分叉与集成方"。Safe 多签的签名人操作练习在链下赛道（[B58](B58-signing-phishing-practice.md)、[B64](B64-custody-ops-ir-practice.md)）。

## 3. 章节顺序

1. [B35 项目实例分析方法](B35-case-method.md)：先学底稿模板，后面五个协议都用它。用时未标注。
2. [B36 Uniswap V2](B36-case-uniswap-v2.md)：约 500 行，是最小的完整底稿。用时未标注。
3. [B37 集中流动性与 V4 Hooks](B37-clamm-v4.md)：在 V2 的基础上推导 V3 和 V4。约 3–4 小时。
4. [B38 Aave V3](B38-case-aave-v3.md)：从 AMM 转到借贷。用时未标注。
5. [B39 Lido stETH](B39-case-lido.md)：借贷和金库常常集成它。用时未标注。
6. [B40 Safe 多签](B40-case-safe.md)：协议管理员和金库常用它，审计范围要覆盖流程。用时未标注。
7. [B41 ERC-4626 金库](B41-case-erc4626.md)：把取整、资产来源和策略风险收在一起。用时未标注。
8. [B42 永续合约](B42-perps.md)：最复杂的 DeFi 业务，放在最后。约 3–4 小时。
9. [B43 第 7 次审计：PerpLite](B43-audit-7-perplite.md)：用 B42 的 PRP 清单审计。约 4–6 小时。

## 4. 本阶段交互实验

- [逐行源码讲解](../interactive/audit-codewalk.html)、[K 值检查](../interactive/audit-v2k.html)、[检查覆盖矩阵](../interactive/audit-hfmatrix.html)（B35、B36、B37）
- [健康因子](../interactive/audit-lending.html)（B38）
- [份额换算](../interactive/audit-steth.html)（B39）
- [多签复核](../interactive/audit-safetx.html)（B40）
- [取整判定](../interactive/audit-rounding.html)、[金库通胀](../interactive/vault-inflation-lab.html)（B41）
- [永续计算器](../interactive/perp-lab.html)（B42、B43）

## 5. 过关标准

- [ ] [阶段测验](../interactive/bootcamp-quiz.html)选择阶段 5，得分 ≥ 80%。
- [ ] 1 份真实协议的审计底稿：五份底稿加疑点清单（按 B35 模板）。
- [ ] B37 的 `forge test` 显示 13 个测试全部通过。
- [ ] 在 B42 实验页把价格跳到 2,200，确认坏账显示 200 美元。
- [ ] PerpLite 报告按示范格式写完；`forge test` 显示 `23 tests passed, 0 failed`。

## 6. 下一步

进入 [阶段 6 导读：追本溯源——EVM 底层与形式化](B44-stage6-guide.md)。
