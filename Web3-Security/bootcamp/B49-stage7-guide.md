# B49 阶段 7 导读：登堂入室——走向专家

> 学习目标：读完本篇，你能——
> 1. 说出阶段 7 要掌握的 7 个主题，以及每个主题怎样算掌握。
> 2. 按顺序安排阶段 7 的章节，并为自己定下长期的过关标准。
>
> 前置：完成阶段 6（[阶段 6 导读](B44-stage6-guide.md)）：B45、B46 的测试全部通过，复现了 Halmos 反例，阶段 6 测验 ≥ 80%。
> 预计用时：各章用时见第 3 节。本阶段是持续的过程，长期计划按 [B54](B54-expert.md) 的 12 个月计划。

---

## 1. 本阶段学完能做什么

- 审计 EVM 以外的程序：Solana 指令的账户校验，Move 的对象、能力和权限模型。
- 用 AI 辅助审计，同时要求每一条输出都有证据。
- 参加公开练习赛和赏金计划，写出评委能直接复核的提交。
- 用技能矩阵定位自己，选一个专精方向，准备作品集和面试。

## 2. 要掌握的主题

| 主题 | 在哪学 | 掌握标准 |
|---|---|---|
| Solana 程序审计 | [B50](B50-solana-audit.md)、主线 [13](../13-non-evm-ecosystems.md) | 你能审查一条 Solana 指令的 signer、owner、PDA、CPI 和重复初始化，并说出每个 Anchor 约束不能替你检查什么。 |
| Move 审计 | [B51](B51-move-audit.md)、主线 [13](../13-non-evm-ecosystems.md) | 你能说明 Sui 和 Aptos 的对象与能力模型差异，并找出泛型类型混淆和算术位移溢出。 |
| AI 辅助审计 | [B52](B52-ai-assisted-audit.md)、主线 [26](../26-ai-web3-security.md) | 你能用公开基准说明 AI 擅长和不擅长什么，你的工作流规定每条 AI 输出都要有证据才进入报告。 |
| 竞赛与赏金提交 | [B53 第 1–6 节](B53-contests-and-habits.md)、[A02](../assessment/A02-risk-rating-reporting.md) | 你完成 1 次 First Flight 或 AI First Flight，至少提交 1 条带 PoC 的发现，并能引用当期规则解释判定结果。 |
| 刻意练习与事故复现 | [B53 第 7–9 节](B53-contests-and-habits.md) | 你连续 14 天完成 Solodit 训练，并用玩具合约复现 1 个历史事故，测试包含修复验证。 |
| 职业路径与个人方法 | [B54](B54-expert.md) | 你给技能矩阵每一项打了等级并附证据链接，写下了专精方向和个人方法文档。 |
| 面试表达 | [B55](B55-interview.md) | 你能按"原理 + 例子 + 修复"回答 30 道题中的每一道。 |

> 💡 注意：B02 的"每日循环"是学习方法；本阶段的 Solodit 训练和刻意练习日志是职业训练，面向竞赛和赏金。

## 3. 章节顺序

1. [B50 Solana 程序审计实战](B50-solana-audit.md)：先扩展到非 EVM 生态。用时未标注。
2. [B51 Move 审计实战](B51-move-audit.md)：同样以主线 13 章为基础。用时未标注。
3. [B52 AI 辅助审计工作流](B52-ai-assisted-audit.md)：你已能独立完成报告，才能判断 AI 的输出。用时未标注。
4. [B53 竞赛、赏金与每日训练](B53-contests-and-habits.md)：把前面所有能力拿到公开平台检验。第一次练习赛 15–20 小时；之后每天 30–45 分钟。
5. [B54 求职与专家之路](B54-expert.md)：有了公开成绩，再做求职和长期计划。阅读 2.5 小时；求职冲刺 90 天；专家计划 12 个月。
6. [B55 面试题库](B55-interview.md)：求职前的自测。用时未标注。

## 4. 本阶段交互实验

- [治理攻击](../interactive/audit-governance.html)（B50）
- [整数溢出与精度](../interactive/audit-overflow.html)（B51）
- [不变量模糊测试器](../interactive/audit-fuzz.html)、[风险评级计算器](../interactive/severity-calculator.html)（B52、B53）
- [学习路径诊断](../interactive/learning-paths.html)、[审计自查清单](../interactive/audit-checklist.html)、[MiniLend 审计练习台](../interactive/audit-capstone.html)（B54）
- [综合自测与结业任务](../interactive/certification-mock-exam.html)

## 5. 过关标准

- [ ] [阶段测验](../interactive/bootcamp-quiz.html)选择阶段 7，得分 ≥ 80%。
- [ ] 在 First Flight 或竞赛中至少获得 1 条有效发现。
- [ ] 一份 14 行的 Solodit 训练日志和 1 个历史事故复现。
- [ ] 个人方法文档、公开作品集和 12 个月计划。
- [ ] 累计 ≥ 5 条竞赛或赏金有效发现；至少指导 1 人完成一个靶场。

## 6. 下一步

- 想补链下与运营安全：进入 [链下赛道 L1 导读：守好家门——个人与终端安全](B56-offchain-l1-guide.md)（可选）。
- 术语和外部资源随时查 [B78 术语表与资源索引](B78-glossary-resources.md)。
