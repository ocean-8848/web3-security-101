# FlashDesk（教学靶场）

> 本项目只用于本地练习（`forge test`）。不要把它部署到任何公共网络。合约含有故意植入的缺陷。

FlashDesk 是一个可升级的闪电贷柜台：存款人提供资产并赚取闪电贷手续费，借款人用抵押品开信用额度。

## 审计范围

| 文件 | 说明 |
|---|---|
| `src/FlashDesk.sol` | V1 实现（当前版本） |
| `src/FlashDeskV2.sol` | V2 实现（计划上线） |
| `src/FlashDeskProxy.sol` | EIP-1967 代理 |
| `src/SpotPool.sol` | 恒定乘积池，同时作为价格来源 |

不在范围内：`src/MockERC20.sol`（测试代币）、合作方的奖励合约（`IRewardsSink`）。团队的说法是"合作方合约是可信的"。

## 部署流程（团队提供）

1. 部署 `FlashDesk` 实现。
2. 部署 `FlashDeskProxy`。
3. 在下一笔交易中调用 `initialize`。
4. 部署者钱包（单个 EOA）成为 owner。

## 运行

```bash
forge build
forge test
```

`test/` 和 `solution/` 含答案。审计完成前不要打开。
