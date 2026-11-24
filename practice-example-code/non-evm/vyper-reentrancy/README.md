# Vyper 编译器重入锁示例（vyper-reentrancy）

本示例配套 [32 dApp 连接层、编译器工具链与硬件钱包底层安全](../../../Web3-Security/32-dapp-connector-compiler-hardware.md) 与 [04 重入攻击](../../../Web3-Security/04-reentrancy.md)，演示 2023 年 7 月 Curve Finance 事故同源的 **Vyper 0.2.15–0.3.0 编译器重入锁缺陷** 与防御写法。

## 文件说明

| 文件 | 状态 | 说明 |
|---|---|---|
| `VulnerablePool.vy` | `// ❌ 漏洞` | 源码写了 `@nonreentrant('lock')` 但未遵守 CEI；在 Vyper 0.2.15–0.3.0 下，编译器为不同函数分配了独立锁槽位，导致跨函数重入锁失效 |
| `SafePool.vy` | `// ✅ 修复` | 升级至 Vyper `^0.3.10`（修复统一锁键）**并且**严格遵守 CEI 模式（先扣余额、再做外部转账） |

## 关键教训

1. **不要单靠编译器语法糖兜底**：即使加了 `@nonreentrant`，依然要坚持 CEI（Checks-Effects-Interactions）纵深防御。
2. **编译器版本属于审计范围**：发布前必须核对 `solc` / `vyper` 官方已知漏洞列表。
