# MiniSwap（审计靶场 3）

> ⚠️ 警告：本项目只用于本地学习。不要把它部署到任何公开网络。

## 协议说明（审计时把这一节当作客户文档）

MiniSwap 是单交易对的恒定乘积做市池。

- 流动性提供者（LP）存入两种代币，得到 LP 份额。
- 交易者可以按精确输入（`swapExactIn`）或精确输出（`swapExactOut`）交易。
- 每笔交易向 LP 收取输入金额 0.30% 的手续费。
- 协议另外收取输入金额 0.05% 的协议费。`feeCollector` 可以提取协议费。
- 每个交易和流动性函数都带 `deadline`。交易在 `deadline` 之后必须回滚。
- 交易对可以使用任意 ERC-20 代币。

## 审计范围

`src/MiniSwap.sol`，约 262 nSLOC。

## 运行

```bash
forge test --match-path test/PoC.t.sol
```

配套章节：[B19 第 3 次审计：MiniSwap](../../../handbook/bootcamp/B19-audit-3-miniswap.md)。`test/` 和 `solution/` 含答案，第一遍审计前不要打开。

> 💡 注意：`test/Fuzz.t.sol` 和 `test/Invariant.t.sol` 里针对漏洞版的测试会失败。这是预期结果。
