# B07 阶段 1 导读：初窥门径——合约安全入门

> 学习目标：读完本篇，你能——
> 1. 说出阶段 1 要掌握的 7 个主题，以及每个主题怎样算掌握。
> 2. 按顺序安排阶段 1 的章节，并用过关标准判断能否进入阶段 2。
>
> 前置：完成阶段 0（[阶段 0 导读](B01-stage0-guide.md)）：B06 的 `forge test` 全部通过，阶段 0 测验 ≥ 80%。
> 预计用时：各章用时见第 3 节；周计划示例见 [B00 第 4 节](B00-roadmap.md)。

---

## 1. 本阶段学完能做什么

- 写一个 ERC-20 代币和一个小金库，并说清 `approve` + `transferFrom` 的两步流程。
- 亲手破坏一个合约，再用测试证明破坏的后果。这是你写的第一批 PoC。
- 按"侦察 → 由小到大读代码 → 写笔记"读一个小合约，用攻击者思维提出问题。
- 把 Ethernaut 和 Capture the Ether 的关卡对应到漏洞类型，并用 Foundry 写出题解。

## 2. 要掌握的主题

| 主题 | 在哪学 | 掌握标准 |
|---|---|---|
| ERC-20 与授权流程 | [B08 第 1–4 节](B08-tokens-and-vault.md)、主线 [07](../07-external-calls-tokens.md) | 你能从 anvil 读到 `BOOT` 余额，并在没有授权时看到 `ERC20InsufficientAllowance`。 |
| 用测试证明一个缺陷 | [B08 第 5 节](B08-tokens-and-vault.md) | 破坏 A、B、C 的测试都通过，你能各用一句话说出根因和修复。 |
| 审计的最小流程 | [B09 第 1 节](B09-reading-code-mindset.md) | 你能不看书写出范围、nSLOC、发现、PoC、覆盖率 5 个词的定义，并画出最小审计流程。 |
| 侦察与由小到大读代码 | [B09 第 2–3 节](B09-reading-code-mindset.md) | 你的工作副本里至少有 5 条 `@audit` 系列笔记，其中至少 1 条是 `@audit-ok`。 |
| 攻击者思维与常见攻击向量 | [B09 第 4–5 节](B09-reading-code-mindset.md) | 你能对 LunchPool 的任意一行回答第 4 节的 3 个问题；看答案之前，自己找到至少 2 个问题。 |
| 漏洞类型地图 | 主线 [03](../03-evm-solidity-basics.md)–[07](../07-external-calls-tokens.md)、[B10 第 2–3 节](B10-ctf-practice.md) | 你能把做过的 Ethernaut 关卡各对应到一个漏洞类型和一个主线章节。 |
| CTF 解题方法 | [B10 第 1 节](B10-ctf-practice.md) | 你能按"读胜利条件 → 找写入点 → 找守卫 → 破守卫 → 写 PoC"解一关，并写出被打破的假设。 |

> 💡 注意：本阶段只"认识"漏洞类型。在完整合约里找到并证明它们，是阶段 2 的事。DeFi 关卡（Damn Vulnerable DeFi）放在阶段 3（[B24](B24-defi-ctf.md)）。审计的受理、排期和交付流程放在阶段 4（[B27](B27-what-is-audit.md)）。

## 3. 章节顺序

1. [B08 代币与小金库](B08-tokens-and-vault.md)：先自己写，再自己破坏。写过的代码最容易读懂。约 3–4 小时。
2. [B09 读代码与攻击者思维](B09-reading-code-mindset.md)：有了"破坏"的经验，再学系统地读代码。约 2 小时。
3. 主线 [03](../03-evm-solidity-basics.md)–[07](../07-external-calls-tokens.md)：按需要查阅。做 CTF 卡住时，回到关卡对应的章节。
4. [B10 CTF 入门关卡](B10-ctf-practice.md)：用前面学到的方法逐关练习。每周 3–5 关，可以一直练到阶段 2。

## 4. 本阶段交互实验

- [授权流程](../interactive/audit-approve.html)、[重入](../interactive/reentrancy-lab.html)（B08、B10）
- [审计自查清单](../interactive/audit-checklist.html)（B09）
- [存储与代理](../interactive/storage-proxy-lab.html)（B10）

## 5. 过关标准

- [ ] [阶段测验](../interactive/bootcamp-quiz.html)选择阶段 1，得分 ≥ 80%。
- [ ] B08 的 `balanceOf` 最后显示 `6e18`，破坏 A 的 PoC 在 `bootcamp-lab` 里通过。
- [ ] LunchPool 工作副本里至少有 5 条 `@audit` 系列笔记，你在看答案前找到至少 2 个问题（B09）。
- [ ] 至少完成 Ethernaut 中对应 02–07 章的 10 关，每关有一个 Foundry 题解测试，并写了一句"被打破的假设"（B10）。
- [ ] 至少完成 Capture the Ether 的 1 道 Accounts 组题目（B10）。

## 6. 下一步

进入 [阶段 2 导读：小试牛刀——能审小合约](B11-stage2-guide.md)。
链下赛道从这里开始可以并行：[链下赛道 L1 导读](B56-offchain-l1-guide.md)。
