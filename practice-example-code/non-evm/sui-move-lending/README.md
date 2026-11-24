# Sui Move 最小安全靶场（sui-move-lending）

本靶场配套 [C05 Move（Sui / Aptos）：对象与资源安全专题](../../../Web3-Security/chains/C05-move-sui-aptos.md) 与 [B51 Move 审计实战](../../../Web3-Security/bootcamp/B51-move-audit.md)。代码仅用于本地学习防御原理。

## 预埋的 3 类典型漏洞与修复对照

| 函数 | 状态 | 漏洞点 / 修复要点 |
|---|---|---|
| `repay_vulnerable` | `// ❌ 漏洞` | 闪电贷热土豆凭证 `FlashReceipt` 未校验 `pool_id`，攻击者可跨池还款盗走高价值池本金 |
| `repay_safe` | `// ✅ 修复` | 强制校验 `receipt.pool_id == object::id(pool)` 且实还金额不低于 `principal + fee` |
| `set_fee_vulnerable` | `// ❌ 漏洞` | 漏传 `AdminCap` 权限对象，任何调用者均可将费率改为 100% 或 0% |
| `set_fee_safe` | `// ✅ 修复` | 强制要求传入与池子绑定的 `&AdminCap` 并校验 `cap.pool_id == object::id(pool)` |
| `unsafe_shl64` / `safe_shl64` | `// ❌ 漏洞` vs `// ✅ 修复` | 演示 Move 位左移 `<<` 静默截断溢出与严格上界防御（Cetus 事故同源机制） |

## 本地运行测试

从 `web3-security-handbook/` 根目录出发（需提前安装 Sui CLI）：

```bash
cd practice-example-code/non-evm/sui-move-lending
sui move test
```
