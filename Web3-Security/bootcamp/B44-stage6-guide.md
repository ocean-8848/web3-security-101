# B44 阶段 6 导读：追本溯源——EVM 底层与形式化

> 学习目标：读完本篇，你能——
> 1. 说出阶段 6 要掌握的 6 个主题，以及每个主题怎样算掌握。
> 2. 按顺序安排阶段 6 的章节，并用过关标准判断能否进入阶段 7。
>
> 前置：完成阶段 5（[阶段 5 导读](B34-stage5-guide.md)）：1 份真实协议审计底稿和 PerpLite 报告完成，阶段 5 测验 ≥ 80%。
> 预计用时：各章用时见第 3 节；周计划示例见 [B00 第 4 节](B00-roadmap.md)。

---

## 1. 本阶段学完能做什么

- 单步执行字节码，预测栈变化，并把一个小合约改写成 Yul。
- 从字节码中找出分发器，手算映射槽位和 ERC-1967 槽，识别四类汇编审计陷阱。
- 手工解码 ABI 编码，找出信任 calldata 偏移量和返回数据的错误写法。
- 判断一项 Gas 优化的安全代价；用 SMTChecker 和 Halmos 找到反例，并读懂一份 Certora 规格。

## 2. 要掌握的主题

| 主题 | 在哪学 | 掌握标准 |
|---|---|---|
| EVM 机器模型、操作码与 Yul | [B45](B45-yul-opcodes.md)、主线 [03](../03-evm-solidity-basics.md) | 你给 `TallyAsm` 增加一个 `reset()` 函数（选择器自己算），测试通过，`testFuzz_SameState` 仍然通过。 |
| 读字节码与存储布局 | [B45 第 6–7 节](B45-yul-opcodes.md) | 你能手工指出 `Tally.yul` 分发器中两个选择器的位置，并手算一个 mapping 键的槽位，与 `cast index` 结果相同。 |
| 汇编审计陷阱 | [B45 第 8 节](B45-yul-opcodes.md) | 你能在 3 分钟内说清脏高位、内存安全、返回数据和汇编 `return` 四个陷阱的根因。 |
| 内存、ABI 编码与 calldata | [B46](B46-calldata-memory.md) | 你能手工解码 4.3 节的嵌套数组，并写出 5.1 节的畸形 calldata，说明每个字的作用。 |
| Gas 优化的安全代价 | [B47](B47-gas.md)、主线 [07](../07-external-calls-tokens.md) | 你能说出 8 种常见优化各自的安全代价，并用 63/64 规则分析一次 Gas 不足攻击。 |
| 符号测试与形式化验证 | [B48](B48-formal-verification.md) | 你得到 `check_MsbBuggy` 的反例和 `check_MsbFixed` 的 PASS，并能解释 FAIL、PASS 和 TIMEOUT 的区别。 |

> 💡 注意：阶段 2 学的是模糊测试，阶段 3 学的是有状态不变量测试。本阶段学的是"证明"：符号测试和形式化验证。三者的差别见 [B48 第 1 节](B48-formal-verification.md)。

## 3. 章节顺序

1. [B45 深入 EVM：机器模型、操作码、Yul 与字节码审计](B45-yul-opcodes.md)：先会单步执行和写 Yul，再在同一份 Yul 合约上读字节码、存储布局和汇编陷阱。后面每章都要读栈和内存。约 8–10 小时。
2. [B46 calldata 与内存](B46-calldata-memory.md)：从存储转到内存和输入数据。约 120 分钟。
3. [B47 Gas 优化与 Gas 安全](B47-gas.md)：需要 B45 和 B46 的成本知识。用时未标注。
4. [B48 形式化验证](B48-formal-verification.md)：最后学"证明"，它用到前面的不变量经验。约 6–8 小时。

## 4. 本阶段交互实验

- [EVM 单步执行器](../interactive/audit-evm.html)、[选择器与槽位计算器](../interactive/audit-abi.html)（B45、B46）
- [存储与代理](../interactive/storage-proxy-lab.html)（B45）
- [Gas 对比器](../interactive/audit-gas.html)（B47）
- [模糊测试](../interactive/audit-fuzz.html)（B48）

## 5. 过关标准

- [ ] [阶段测验](../interactive/bootcamp-quiz.html)选择阶段 6，得分 ≥ 80%。
- [ ] B45 的 `TallyTest` 6 个测试通过；你写的 `reset()` 和测试也通过。
- [ ] B45 的 `forge test` 显示 17 个测试全部通过。
- [ ] B46 的 `forge test` 显示 32 个测试通过。
- [ ] 你复现了 Halmos 反例，并在 `ToyVault` 中新增一条性质，写成 `check_` 测试并运行。

## 6. 下一步

进入 [阶段 7 导读：登堂入室——走向专家](B49-stage7-guide.md)。
