# EchoBridge（教学靶场）

> 本项目只用于本地练习（`forge test`）。不要把它部署到任何公共网络。合约含有故意植入的缺陷。

EchoBridge 是一个锁定并铸造（lock-and-mint）跨链桥：用户在源链把代币锁进 `EchoVault`，签名者集合批准后，用户在目标链从 `EchoMinter` 得到包装代币。回程由 `EchoVault.release` 放行。

## 审计范围

| 文件 | 说明 |
|---|---|
| `src/EchoSigCheck.sol` | m-of-n 签名校验（含内联汇编） |
| `src/EchoVault.sol` | 源链金库 |
| `src/EchoMinter.sol` | 目标链铸币器和包装代币 |
| `src/EchoFactory.sol` | 确定性地址部署工厂 |

不在范围内：`src/MockERC20.sol`、链下签名者程序。

## 部署计划（团队提供）

- 签名者：2-of-3。
- 部署到以太坊、一条 OP Stack 类 L2，以及一条 ZKsync 类 ZK Rollup（EraVM）。
- 三条链使用同一份合约代码和同一组签名者。

## 运行

```bash
forge build
forge test
```

`test/` 和 `solution/` 含答案。审计完成前不要打开。
