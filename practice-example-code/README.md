# 示例合约

本目录下的 01–08 文件同时包含 `// ❌ 漏洞` 版本和 `// ✅ 修复` 版本。这些文件不依赖外部库，使用 Solidity `^0.8.20`，已用 solc 0.8.24（`evmVersion: paris`）编译通过。

> ⚠️ 警告：示例只用于学习原理。示例中的简化实现（例如简化版 `mulDiv`、重入锁、初始化修饰器）不能替代 OpenZeppelin 等经过审计的库。不要部署到主网。

| 文件 | 配套章节 | 漏洞版 | 修复版 |
|---|---|---|---|
| [01-Reentrancy.sol](01-Reentrancy.sol) | [04 重入](../handbook/chapters/04-reentrancy.md) | `VulnerableBank` + `ReentrancyAttacker` | `SafeBank`（CEI + 共享锁） |
| [02-AccessControl.sol](02-AccessControl.sol) | [05 访问控制](../handbook/chapters/05-access-control.md) | `VulnerableWallet`（未保护初始化、`tx.origin`、任意调用、单步转移） | `SafeWallet` |
| [03-VaultInflation.sol](03-VaultInflation.sol) | [06 算术与精度](../handbook/chapters/06-arithmetic-precision.md) | `NaiveVault` | `OffsetVault`（虚拟份额 + 偏移 + 最小输出） |
| [04-SpotOracle.sol](04-SpotOracle.sol) | [08 预言机](../handbook/chapters/08-oracle-flashloan.md) | `SpotPriceLending` | `FeedPriceLending`（时效、上下限、精度、L2 排序器状态） |
| [05-SafeTokenOps.sol](05-SafeTokenOps.sol) | [07 外部调用](../handbook/chapters/07-external-calls-tokens.md)、[C02 TRON](../handbook/chains/C02-tron.md) | — | `SafeTokenOps`（无代码检查、可选返回值、TRON USDT 余额差校验、按实收记账）、`MultiChainVault` |
| [06-SignatureReplay.sol](06-SignatureReplay.sol) | [09 签名](../handbook/chapters/09-mev-signatures.md) | `VulnerableClaim` | `SafeClaim`（EIP-712、nonce、deadline、低 s、零地址） |
| [07-ProxyStorage.sol](07-ProxyStorage.sol) | [03](../handbook/chapters/03-evm-solidity-basics.md)、[10 代理](../handbook/chapters/10-upgradeable-proxy.md) | `NaiveProxy`、`BankV2Broken` | `EIP1967Proxy`、`BankV2Good` |
| [08-RouterCallback.sol](08-RouterCallback.sol) | [C00 以太坊案例](../handbook/chains/C00-ethereum.md) 4.7、[07](../handbook/chapters/07-external-calls-tokens.md) | `VulnerableRouter`（用户指定池子 + 回调付款人可伪造，Sushi RouteProcessor2 模式） | `SafeRouter`（CREATE2 计算池子地址、付款人存于本合约、单次支付） |

## 运行靶场

靶场只运行本地玩具合约。靶场没有主网分叉，没有 RPC 配置，也不包含真实地址。

下面的命令从 `web3-security-101/` 目录出发。克隆后先运行一次 `bash practice-example-code/setup.sh` 下载依赖（`lib/` 不进仓库）。

```bash
# 主题靶场（导入上面的 01–08 示例，并包含新增演示）
cd practice-example-code/foundry && forge test

# 审计靶场 MiniLend（共用 practice-example-code/foundry/lib 中的 forge-std）
cd ../minilend && forge test  # 接着上一条命令，已在 foundry 目录里
```

需要 Foundry（已用 forge 1.5.1 验证）。配置使用 solc 0.8.30 和 EVM 版本 `prague`，因为 EIP-7702 需要 `prague`。`forge-std` 由 `setup.sh` 安装在 `practice-example-code/foundry/lib`，各靶场的 `lib/forge-std` 是指向它的链接。

> ⚠️ 警告：`src/` 下的演示合约同样只用于学习。不要部署到主网。

### 测试文件对照表

| 测试文件 | 配套章节 | 证明什么 |
|---|---|---|
| [foundry/test/Reentrancy.t.sol](foundry/test/Reentrancy.t.sol) | [04 重入](../handbook/chapters/04-reentrancy.md) | 单函数和跨函数重入提走资金；CEI 加共享锁后回滚 |
| [foundry/test/AccessControl.t.sol](foundry/test/AccessControl.t.sol) | [05 访问控制](../handbook/chapters/05-access-control.md) | 重复初始化、`tx.origin` 钓鱼、任意调用、单步转移的损失；修复版拒绝 |
| [foundry/test/VaultInflation.t.sol](foundry/test/VaultInflation.t.sol) | [06 算术与精度](../handbook/chapters/06-arithmetic-precision.md) | 首存者攻击吞掉受害者存款；虚拟份额加偏移后攻击者亏损 |
| [foundry/test/SpotOracle.t.sol](foundry/test/SpotOracle.t.sol) | [08 预言机](../handbook/chapters/08-oracle-flashloan.md) | 现货价格被操纵后借空资金；喂价不受储备影响，并拒绝过期、非正、越界价格 |
| [foundry/test/SafeTokenOps.t.sol](foundry/test/SafeTokenOps.t.sol) | [07 外部调用](../handbook/chapters/07-external-calls-tokens.md)、[C02 TRON](../handbook/chains/C02-tron.md) | 假返回、收税、无代码代币造成虚假入账；安全封装拒绝或按实收记账 |
| [foundry/test/SignatureReplay.t.sol](foundry/test/SignatureReplay.t.sol) | [09 签名](../handbook/chapters/09-mev-signatures.md) | 可塑性、跨部署重放、零地址签名者；EIP-712、nonce、deadline、低 s 全部拦截 |
| [foundry/test/ProxyStorage.t.sol](foundry/test/ProxyStorage.t.sol) | [03](../handbook/chapters/03-evm-solidity-basics.md)、[10 代理](../handbook/chapters/10-upgradeable-proxy.md) | 槽位冲突劫持实现、错误升级打乱账本；EIP-1967 和追加式升级保持状态 |
| [foundry/test/RouterCallback.t.sol](foundry/test/RouterCallback.t.sol) | [C00 以太坊案例](../handbook/chains/C00-ethereum.md) 4.7、[07](../handbook/chapters/07-external-calls-tokens.md) | 恶意池子伪造回调盗取授权；CREATE2 校验池子，付款人固定 |
| [foundry/test/EIP7702.t.sol](foundry/test/EIP7702.t.sol) | [15 账户抽象](../handbook/chapters/15-account-abstraction-wallets.md) | 委托后被清空、委托在交易后持续、委托给 `address(0)` 清除；安全委托目标和白名单 |
| [foundry/test/Permit2Style.t.sol](foundry/test/Permit2Style.t.sol) | [09 签名](../handbook/chapters/09-mev-signatures.md) | 玩具实现：撤销后重放、替换 spender、过期仍可花费；nonce、过期和 lockdown 拦截 |
| [foundry/test/CrossChain.t.sol](foundry/test/CrossChain.t.sol) | [12 跨链桥](../handbook/chapters/12-cross-chain-bridges.md) | 单验证者私钥泄露可伪造；M-of-N 拒绝伪造、重复签名、错误目标；M 把私钥全泄露仍失守 |
| [foundry/test/ERC4626Rounding.t.sol](foundry/test/ERC4626Rounding.t.sol) | [06](../handbook/chapters/06-arithmetic-precision.md)、[B41](../handbook/bootcamp/B41-case-erc4626.md) | 取整错误导致免费取款；集成方少扣份额造成资不抵债；修复版账本有足额份额支撑 |
| [minilend/test/MiniLendPoC.t.sol](minilend/test/MiniLendPoC.t.sol) | [B25 实战](../handbook/bootcamp/B25-capstone-minilend.md) | 8 个预埋漏洞的 PoC；同一场景在修复版失败 |
| [minilend/test/MiniLendInvariant.t.sol](minilend/test/MiniLendInvariant.t.sol) | [B25 实战](../handbook/bootcamp/B25-capstone-minilend.md) | 修复版的账实相符、份额总和、资金流、取整和 LTV 不变量 |

新增演示合约：`foundry/src/EIP7702Demo.sol`、`ToyPermit2.sol`、`CrossChainMessaging.sol`、`ERC4626Rounding.sol`。

> 💡 注意：Foundry 的一个测试函数在单个交易上下文内运行。EIP-7702 测试把委托放在 `setUp` 中，再用 `vm.roll` 和 `vm.warp` 表示后续区块。这模拟了委托跨交易持续，不是真实网络上的两笔交易。

## MiniEx 靶场（链下 L3 赛道）

`ops/` 是训练营 L3「架构与运营」赛道共用的虚构交易所靶场：数据全部由脚本合成（固定随机种子），只用 Python 3 标准库，不联网、不含任何真实地址或用户。一键生成：

```bash
bash practice-example-code/ops/setup.sh
```

数据字典、9 个注入场景（账户接管、API Key 滥用、洗钱漏斗、对敲与标记价偏离、内部人批量读取、签名服务异常、开发终端失陷痕迹、供应链、噪声）和脚本用法见 `ops/README.md` 与 `ops/API.md`。练习在训练营 B70–B77。

## 自己编译

```bash
# 方式一：Foundry（foundry 项目已导入 01–08 示例）
cd practice-example-code/foundry && forge build

# 方式二：solc-js
npm i solc@0.8.24
npx solcjs --bin practice-example-code/01-Reentrancy.sol
```

## 查看存储布局

```bash
# 打印合约的存储布局：变量、槽位、偏移
cd practice-example-code/foundry && forge inspect BankV2Broken storage-layout
```

预期输出（与 [10 章](../handbook/chapters/10-upgradeable-proxy.md) 3.1 节表格一致）：`feeBps@0, owner@1, totalDeposits@2, balances@3`。

## 部署到不同链的注意事项

| 链 | 注意 |
|---|---|
| BNB Chain | 直接兼容；注意代币精度和区块计时（[C01](../handbook/chains/C01-bnb-chain.md)） |
| TRON | 使用 TRON 适配的编译器；`MultiChainVault` 部署时 `useBalanceCheckForPush = true`（[C02](../handbook/chains/C02-tron.md)） |
| Mantle | `payable` 收的是 MNT；`FeedPriceLending` 传入排序器在线状态喂价（[C03](../handbook/chains/C03-mantle.md)） |
