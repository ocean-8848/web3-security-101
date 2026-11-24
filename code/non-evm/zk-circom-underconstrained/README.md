# ZK Circom 欠约束电路最小靶场（zk-circom-underconstrained）

本靶场配套 [14 ZK 与证明系统](../../../handbook/chapters/14-zk-proof-systems.md) 与 [B69 ZK 与跨链实现风险](../../../handbook/bootcamp/B69-zk-bridge-practice.md)。代码仅用于演示零知识电路最常见的“欠约束（Under-constrained）”漏洞及修复方法。

## 文件说明

| 文件 | 状态 | 演示机制 |
|---|---|---|
| `circuits/vulnerable_multiplier.circom` | `// ❌ 漏洞` | 仅使用 `<--` 计算信号赋值而漏写 `===` R1CS 约束，恶意证明者可篡改见证（Witness）伪造任意 `out` 通过验证 |
| `circuits/safe_multiplier.circom` | `// ✅ 修复` | 使用 `<==`（同时赋值并生成二次约束）且添加二进制范围位约束（防止有限域回绕） |
| `scripts/verify_demo.js` | 教学脚本 | 打印正常见证 vs 伪造见证在 R1CS 约束方程下的满足情况 |

## 本地运行

从 `web3-security-101/` 根目录出发：

```bash
# 方式一：无需安装 circom，直接用 Node 演示 R1CS 约束校验原理
node code/non-evm/zk-circom-underconstrained/scripts/verify_demo.js

# 方式二：若已安装 circom 与 snarkjs，编译对比约束数
cd code/non-evm/zk-circom-underconstrained
circom circuits/vulnerable_multiplier.circom --r1cs --wasm
circom circuits/safe_multiplier.circom --r1cs --wasm
```
