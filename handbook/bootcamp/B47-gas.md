# B47 Gas 优化与 Gas 安全：省钱的代码与被饿死的调用

> 学习目标：说出 8 种常见优化及其安全代价；用 63/64 规则分析 Gas 不足攻击。  
> 前置章节：[B45 深入 EVM](B45-yul-opcodes.md)、[B46 calldata 与内存](B46-calldata-memory.md)  

> 🔗 关联：主线 [03 章](../chapters/03-evm-solidity-basics.md)、[07 章](../chapters/07-external-calls-tokens.md) ｜ 实验 [Gas 对比器](../interactive/audit-gas.html) ｜ 评估 [A03](../assessment/A03-exchange-contracts-wallets.md) ｜ 衔接 [B45](B45-yul-opcodes.md)

## 1. 一句话理解

**每条指令都要付 Gas。优化降低用户成本，但激进的优化（内联汇编、unchecked、打包）会删掉安全检查。审计员要判断：省下的 Gas 是否值得承担新增的风险。**

## 2. 关键成本表（以太坊主网，Cancun 之后）

> 💡 注意：截至 2026 年 11 月，下表仍适用于主网。Glamsterdam 拟调整 Gas 计量，尚未确定主网时间，上线后需复核。状态和审计含义见 [C00 2.3 节](../chains/C00-ethereum.md)。

| 操作 | Gas | 说明 |
|---|---|---|
| 交易基础费用 | 21,000 | 每笔交易固定 |
| calldata 字节 | 16（非零）/ 4（零） | EIP-7623（Pectra）对数据密集型交易提高了下限 |
| SLOAD | 2,100 冷 / 100 热 | EIP-2929：交易内首次访问为冷 |
| SSTORE 0 → 非 0 | 20,000（+2,100 冷） | 最贵的常见操作 |
| SSTORE 非 0 → 非 0 | 2,900（+2,100 冷） |  |
| SSTORE 非 0 → 0 | 返还最多 4,800 | EIP-3529：返还上限为交易 Gas 的 1/5 |
| TLOAD / TSTORE | 100 | EIP-1153 瞬态存储，交易结束清空，无冷热之分 |
| 内存扩展 | 3 × 字数 + 字数² / 512 | 按已用内存的总字数计费，越大越贵（二次增长）；数据区域见 [B45 第 2 节](B45-yul-opcodes.md) |
| 外部账户访问 | 2,600 冷 / 100 热 | CALL、BALANCE、EXTCODESIZE |
| CALL 附带 ETH | +9,000 | 其中 2,300 作为津贴转给被调用方 |
| LOG | 375 + 375 × topic + 8 × 字节 | 事件 |

## 3. 常见优化及安全代价

| 优化 | 做法 | 安全代价 / 审计注意 |
|---|---|---|
| 变量打包 | 把多个小类型放进同一槽（打包规则见 [B45 第 7 节](B45-yul-opcodes.md)） | uint128 / uint96 等窄类型更容易溢出；强转截断 |
| 缓存存储变量 | 循环外读一次到 memory / 栈 | 缓存值在外部调用后可能已过期（重入时尤其危险） |
| calldata 代替 memory | external 函数的数组参数用 calldata | 基本无风险 |
| `unchecked` 自增 | `unchecked { ++i; }` | 只在确定不会溢出时使用。审计时逐个验证边界 |
| 自定义错误 | `revert Err()` 代替字符串 | 无风险 |
| `immutable` / `constant` | 不占存储 | immutable 值写在字节码里（B45 第 2 节）；代理模式下它属于实现合约，代理读不到自己的值（见 [10 章](../chapters/10-upgradeable-proxy.md)） |
| 短路求值 | 便宜的条件放前面 | 无风险，但改变了外部调用是否发生 |
| 内联汇编 | 手写内存操作 | 跳过所有类型和溢出检查；内存指针、脏高位是常见错误（见 [B45 第 8 节](B45-yul-opcodes.md)）。实测省下的 Gas 通常不到 10%（B45 第 5 节） |
| 位图与位运算 | 用一个 uint256 存 256 个布尔值 | 索引越界、位移方向错误 |

> 🧪 交互实验：[Gas 优化对比器](../interactive/audit-gas.html)

## 4. Gas 安全：63/64 规则

EIP-150 规定：一次 CALL 最多转发当前剩余 Gas 的 63/64。父调用至少保留 1/64。

- 攻击：中继者给一笔元交易提供"刚好不够"的 Gas。内层调用耗尽 Gas 失败，外层用剩下的 1/64 完成执行，并把请求标记为"已处理"。用户的操作永远丢失。
- 防御：在调用前检查 `gasleft() >= requiredGas * 64 / 63 + buffer`；或在内层失败时整体 revert。
- ERC-4337 和跨链消息协议的执行器都要考虑这个问题。

> 💡 注意：Glamsterdam 的 gas 重定价会改变 1/64 的假设，见 [C00 2.3 节](../chains/C00-ethereum.md) 的 INV-1、INV-6。

## 5. 学习资源（路线图原文条目）

Alchemy Solidity Gas Optimization；RareSkills The RareSkills Book of Gas Optimization；结构体打包最佳实践（CoinsBench）。

> 🪞 反思：打开你最近优化过的一段代码。
> 1. 省下的 Gas 换来了哪项检查的减少？
> 2. 外部调用的 Gas 是否可能被调用者控制？
> 3. 循环有上界吗？上界由谁决定？

## 6. 思考题

1. 在 Gas 对比器中打开"缓存存储变量"。如果循环体内有一次外部调用，这个优化在什么情况下会引入漏洞？
2. 在 63/64 计算器中，子调用需要 100,000 Gas。外层至少要提供多少 Gas 才能保证子调用不会因 Gas 不足失败？
