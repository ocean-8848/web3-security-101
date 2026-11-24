# B26 阶段 4 导读：独当一面——独立审计

> 学习目标：读完本篇，你能——
> 1. 说出阶段 4 要掌握的 8 个主题，以及每个主题怎样算掌握。
> 2. 按顺序安排阶段 4 的章节，并用过关标准判断能否进入阶段 5。
>
> 前置：完成阶段 3（[阶段 3 导读](B16-stage3-guide.md)）：MiniSwap、FlashDesk、MiniLend 三份报告完成，高危和中危召回率 ≥ 60%，阶段 3 测验 ≥ 80%。
> 预计用时：各章用时见第 3 节；周计划示例见 [B00 第 4 节](B00-roadmap.md)。

---

## 1. 本阶段学完能做什么

- 按专业流程接一个审计：判断准备度、确定范围、排期、内部评审、修复复查和交付终版报告。
- 用漏洞模式库定位候选问题，用"笔记 → 假设 → 证明或否定"的节奏审计，并检查自己漏掉了什么。
- 把重复的检查交给工具：自定义检测器、Semgrep 规则、不变量测试桩和 CI。
- 在时盒内独立完成一次多合约审计，并用评分表衡量结果。

## 2. 要掌握的主题

| 主题 | 在哪学 | 掌握标准 |
|---|---|---|
| 受理、范围与排期 | [B27 第 1–4 节](B27-what-is-audit.md)、主线 [27](../chapters/27-audit-testing-workflow.md)、[T01](../templates/T01-intake-checklist.md) | 你能为一次 2 周、2 人的审计写出范围表和日历，并说明每个角色不做什么。 |
| 评审、沟通与修复复查 | [B27 第 5–8 节](B27-what-is-audit.md)、[A02](../assessment/A02-risk-rating-reporting.md) | 你能说出修复复查的步骤，以及终版报告的提交哈希为什么必须等于部署代码。 |
| 漏洞模式库与触发点 | [B28](B28-bug-patterns.md) | 你能在 `MooringPool.sol` 中把至少 3 个候选位置转成测试问题，并说出 2 个"模式命中但漏洞不成立"的例子。 |
| 漏报机制与自审 | [B29](B29-why-audits-miss.md) | 你对最近一次代码审查，能指出至少 2 种自己的机制失误，并为每种选一个对策。 |
| 假设驱动的审计节奏 | [B30](B30-think-aloud.md) | 你写下了至少 2 个被自己否定的假设，并能解释 TA-1、TA-4 的等级为什么被修正。 |
| 工具工程化 | [B31](B31-automation-tools.md)、主线 [26](../chapters/26-ai-web3-security.md) | 你写出一个自定义检测器，并能说出静态分析、模糊测试、符号执行、形式化验证各自不能发现什么。 |
| 跨链签名绑定与 L2 差异 | [B32](B32-audit-5-echobridge.md)、主线 [12](../chapters/12-cross-chain-bridges.md)、[09](../chapters/09-mev-signatures.md) | 你找到 EchoBridge 全部 3 个 Critical；EB-L2-1 写明了"什么已验证、什么没有"。 |
| 时盒多合约审计 | [B33](B33-audit-6-guardvault.md) | 你在 8 小时时盒内提交完整报告，评分表总分不低于 70。 |

> 💡 注意：B32 第 3 节只讲读懂靶场所需的 Yul。系统学操作码、字节码和 Yul 放在阶段 6（[B45](B45-yul-opcodes.md)）。竞赛和赏金的提交规则放在阶段 7（[B53](B53-contests-and-habits.md)）。

## 3. 章节顺序

1. [B27 专业审计流程](B27-what-is-audit.md)：做过一次 DeFi 审计后，再把完整生命周期定下来。约 3 小时。
2. [B28 高频漏洞模式库](B28-bug-patterns.md)：通读一遍，之后作为工具书。约 90 分钟。
3. [B29 为什么会漏掉漏洞](B29-why-audits-miss.md)：知道了"找什么"，再看"为什么会漏"。阅读和练习各约 60 分钟。
4. [B30 跟审实录](B30-think-aloud.md)：看一个审计员怎样把 B28、B29 用在一份合约上。独立审计 90 分钟，跟读 90 分钟。
5. [B31 工具工程化](B31-automation-tools.md)：手工流程熟了，再把重复的部分交给工具。用时未标注。
6. [B32 第 5 次审计：EchoBridge](B32-audit-5-echobridge.md)：跨链签名和 L2 差异，是本阶段第一个新领域靶场。约 5–7 小时。
7. [B33 毕业审计：GuardVault](B33-audit-6-guardvault.md)：没有提示的多合约审计，作为本阶段的毕业考试。时盒 8 小时，复盘 2 小时。

## 4. 本阶段交互实验

- [风险评级计算器](../interactive/severity-calculator.html)（B27）
- [定级训练](../interactive/severity-drill.html)（B28、B30）
- [取整判定](../interactive/audit-rounding.html)（B28）
- [不变量模糊测试器](../interactive/audit-fuzz.html)（B31）
- [签名重放](../interactive/signature-replay-lab.html)（B32）
- [治理攻击](../interactive/audit-governance.html)、[金库通胀](../interactive/vault-inflation-lab.html)、[重入](../interactive/reentrancy-lab.html)（B33）

## 5. 过关标准

- [ ] [阶段测验](../interactive/bootcamp-quiz.html)选择阶段 4，得分 ≥ 80%。
- [ ] 一份范围表和一份 2 周审计日历（B27）。
- [ ] B30 独立审计找到至少 3 个发现，并写了 PoC；`forge test` 显示 16 个测试通过。
- [ ] EchoBridge 报告：找到全部 3 个 Critical；`forge test` 显示 11 个测试全部通过。
- [ ] GuardVault 报告：时盒内提交，评分表 ≥ 70，至少 3 个发现带可运行的 PoC，并找到 GV-REN-2。
- [ ] 两份靶场报告经同伴复查。

## 6. 下一步

进入 [阶段 5 导读：庖丁解牛——头部协议与高级 DeFi](B34-stage5-guide.md)。
