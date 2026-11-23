# B01 阶段 0 导读：整装待发——环境与第一个合约

> 学习目标：读完本篇，你能——
> 1. 说出阶段 0 要掌握的 6 个主题，以及每个主题怎样算掌握。
> 2. 按顺序安排阶段 0 的章节，并用过关标准判断能否进入阶段 1。
>
> 前置：无。你不需要编程经验，也不需要区块链知识。
> 预计用时：各章用时见第 3 节；周计划示例见 [B00 第 4 节](B00-roadmap.md)。

---

## 1. 本阶段学完能做什么

- 说清区块链怎样记账：哈希链、账户、一笔交易从签名到最终确认。
- 说出本训练营的法律与道德边界：所有练习只在本机运行。
- 在自己的电脑上装好 Foundry，从空文件写出一个能收款、记账、提款的合约。
- 用 `forge test`、调用追踪、cheatcode、`cast` 和 `anvil` 测试并操作这个合约。

## 2. 要掌握的主题

| 主题 | 在哪学 | 掌握标准 |
|---|---|---|
| 学习路线与每日循环 | [B00](B00-roadmap.md)、[B02 第 2 节](B02-study-method.md) | 你写下了路线、每周学习时间，并按每日循环写完一次学习日志。 |
| 法律边界与负责任披露 | [B04 第 1 节](B04-setup.md)、[B02 第 1 节](B02-study-method.md) | 你能按顺序说出负责任披露的步骤。 |
| 区块链怎样记账 | [B03](B03-blockchain-basics.md)、主线 [02](../chapters/02-cryptography-randomness.md)、[03](../chapters/03-evm-solidity-basics.md) | 你能解释哈希链为什么防篡改，区分 EOA 与合约账户，并算出一笔 EIP-1559 手续费。 |
| 终端、git 与 Foundry 安装 | [B04](B04-setup.md) | `practice-example-code/bootcamp-lab` 里 `forge test` 显示 `3 tests passed`。 |
| Solidity 基本语法 | [B05](B05-first-contract.md)、主线 [03](../chapters/03-evm-solidity-basics.md) | 不看书说出 `public` 与 `external`、`msg.sender` 与 `msg.value` 的区别。 |
| Foundry 测试与本地链 | [B06](B06-foundry-basics.md) | 你能从 `-vvvv` 输出说出每一行的调用者和 gas，并在 anvil 上部署合约、读状态。 |

> 💡 注意：本阶段只学"怎样运行和测试"。模糊测试、分叉测试和读存储放在阶段 2（[B12](B12-foundry-advanced.md)）。EVM 字节码和 Yul 放在阶段 6。

## 3. 章节顺序

1. [B00 训练营路线](B00-roadmap.md)（训练营总览，不属于本阶段；还没读过就先读）：先看全局地图，选路线。约 30 分钟。
2. [B02 学习心法与每日训练](B02-study-method.md)：出发前定下职业底线和学习循环。约 30 分钟。
3. [B03 区块链基础](B03-blockchain-basics.md)：先懂"账"怎样记，再写记账的代码。用时未标注。
4. [B04 环境搭建](B04-setup.md)：装工具，跑通第一个测试。约 1–2 小时。
5. [B05 第一个合约](B05-first-contract.md)：分 8 步从空文件写出合约。约 2–3 小时。
6. [B06 Foundry 基本功](B06-foundry-basics.md)：给 B05 的合约读追踪、写测试、部署到本地链。约 2 小时。

## 4. 本阶段交互实验

- [学习路径诊断](../interactive/learning-paths.html)（B00）
- [哈希链](../interactive/audit-hashchain.html)、[EIP-1559 手续费](../interactive/audit-fee1559.html)（B03）
- [调用树分析](../interactive/audit-trace.html)（B06）

## 5. 过关标准

- [ ] [阶段测验](../interactive/bootcamp-quiz.html)选择阶段 0，得分 ≥ 80%。
- [ ] B05 的 8 步代码全部 `forge build` 成功，`ClubSmokeTest` 显示 `1 passed`。
- [ ] B06 配套工程 `forge test` 显示 `27 tests passed, 0 failed, 1 skipped`。
- [ ] 删掉 `onlyOwner` 后，你看到对应测试失败，并已恢复。
- [ ] 你能用一句话说出本训练营的规则：所有练习只在本机运行。

## 6. 下一步

进入 [阶段 1 导读：初窥门径——合约安全入门](B07-stage1-guide.md)。
如果你只做链下与运营安全，完成阶段 0–1 后进入 [链下赛道 L1 导读](B56-offchain-l1-guide.md)。
