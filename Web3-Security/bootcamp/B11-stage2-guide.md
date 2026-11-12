# B11 阶段 2 导读：小试牛刀——能审小合约

> 学习目标：读完本篇，你能——
> 1. 说出阶段 2 要掌握的 6 个主题，以及每个主题怎样算掌握。
> 2. 按顺序安排阶段 2 的章节，并用过关标准判断能否进入阶段 3。
>
> 前置：完成阶段 1（[阶段 1 导读](B07-stage1-guide.md)）：B08 的 PoC 通过，至少 10 关 Ethernaut 有 Foundry 题解，阶段 1 测验 ≥ 80%。
> 预计用时：各章用时见第 3 节；周计划示例见 [B00 第 4 节](B00-roadmap.md)。

---

## 1. 本阶段学完能做什么

- 用模糊测试、不变量测试、只读分叉、读存储和交易重放检查一个合约。
- 独立审计一个 100–300 行的合约：范围 → 笔记 → 发现 → PoC → 报告。
- 用静态分析工具扫描合约，并逐条判断结果是真问题还是误报。
- 写出"根因 + 影响"的发现，按影响 × 可能性定级，并生成报告。

## 2. 要掌握的主题

| 主题 | 在哪学 | 掌握标准 |
|---|---|---|
| 模糊测试与不变量测试入门 | [B12 第 1 节](B12-foundry-advanced.md)、主线 [27](../27-audit-testing-workflow.md) | 你跑出 `BuggyInvariantDemo` 的失败，并手工解释缩减后的调用序列。 |
| 审计员的工作台 | [B12 第 2–3 节](B12-foundry-advanced.md) | 你能用 `cast storage` 读出一个字符串，用 `cast run` 重放一笔交易，并说出 PoC 的 5 条标准。 |
| 第一次完整审计与覆盖率 | [B13](B13-audit-1-notebox.md)、主线 [05](../05-access-control.md) | 你独立找到 NB-01 和 NB-03，并能解释 38.46% 和 100.00% 两个覆盖率数字的差异。 |
| 写一条发现与定级 | [B14](B14-writing-findings.md)、[A02](../assessment/A02-risk-rating-reporting.md)、[T03](../templates/T03-finding-report.md) | 你能把 3 个差标题改写成"根因 + 影响"，`BrokenVaultB` 的发现自检表全部通过。 |
| 静态分析与误报分诊 | [B15 第 1 节、第 6 节](B15-audit-2-luckypot.md) | Slither 的 18 条结果，每条都有结论和理由。 |
| 在完整合约里证明漏洞 | [B15](B15-audit-2-luckypot.md)、主线 [02](../02-cryptography-randomness.md)、[04](../04-reentrancy.md)、[06](../06-arithmetic-precision.md)、[07](../07-external-calls-tokens.md) | 不看提示 3，你在 LuckyPot 里独立找到至少 5 个发现，每条高危都有能运行的 PoC。 |

> 💡 注意：本阶段的不变量测试只到"跑出并解释一个失败"。基于 Handler 的有状态不变量测试和 Echidna 放在阶段 3（[B19](B19-audit-3-miniswap.md)）。受理、内部评审和修复复查等完整的审计流程放在阶段 4。

## 3. 章节顺序

1. [B12 Foundry 进阶](B12-foundry-advanced.md)：先把工具准备好，后面三章都会用到。约 2–3 小时。
2. [B13 第 1 次审计：NoteBox](B13-audit-1-notebox.md)：用最小的合约走完一次完整审计。约 2–3 小时。
3. [B14 写好一个发现](B14-writing-findings.md)：有了第一份报告，再学怎样把发现写得站得住。约 3–4 小时。
4. [B15 第 2 次审计：LuckyPot](B15-audit-2-luckypot.md)：漏洞更多，并加入静态分析工具。约 5–8 小时。

## 4. 本阶段交互实验

- [模糊测试](../interactive/audit-fuzz.html)（B12）
- [风险评级计算器](../interactive/severity-calculator.html)、[审计自查清单](../interactive/audit-checklist.html)（B14）
- [重入](../interactive/reentrancy-lab.html)（B15）

## 5. 过关标准

- [ ] [阶段测验](../interactive/bootcamp-quiz.html)选择阶段 2，得分 ≥ 80%。
- [ ] NoteBox 报告：3 个发现，每个都有位置、影响、PoC 和建议；`forge test` 显示 `14 tests passed, 0 failed`。
- [ ] LuckyPot 报告：包含 Informational 和 Gas 两节；`forge test` 显示 `15 tests passed, 0 failed`。
- [ ] 两份报告合计，不看提示找出参考答案 ≥ 70% 的发现；每条高危和中危都有能运行的 PoC。
- [ ] 你生成了 LunchPool 的 PDF 报告，打开后中文正常。

## 6. 下一步

进入 [阶段 3 导读：渐入佳境——能审 DeFi](B16-stage3-guide.md)。
