# GuardVault（教学靶场）

> 本项目只用于本地练习（`forge test`）。不要把它部署到任何公共网络。合约含有故意植入的缺陷。

GuardVault 是一个带治理和策略分配的收益金库。

## 审计范围

| 文件 | 说明 |
|---|---|
| `src/GuardVault.sol` | ERC-4626 风格金库 |
| `src/StrategyManager.sol` | 角色管理和策略分配 |
| `src/YieldStrategy.sol` | 持有资金，收割时卖出奖励代币 |
| `src/GuardGovernor.sol` | 代币加权治理，持有 ADMIN 角色 |
| `src/GuardCredit.sol` | 以金库份额为抵押的信用额度 |
| `src/MiniSwap.sol` | 收割时使用的恒定乘积池 |
| `src/Tokens.sol` | 治理代币和带接收钩子的金库资产 |

## 角色（团队提供）

| 角色 | 持有者 | 预期权限 |
|---|---|---|
| ADMIN | 治理合约 | 全部配置 |
| STRATEGIST | 策略团队多签 | 添加策略、分配资金 |
| KEEPER | 自动化机器人（热钱包） | 只能调用 `harvest` |

团队的不变量：有债务的用户不能转移或赎回份额。

## 运行

```bash
forge build
forge test
```

`test/` 和 `solution/` 含答案。审计完成前不要打开。
