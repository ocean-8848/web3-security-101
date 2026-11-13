# fv：B48 配套代码

本目录只用于本地验证。配套章节：[B48 形式化验证](../../../Web3-Security/bootcamp/B48-formal-verification.md)。

| 文件 | 内容 |
|---|---|
| `src/BitMath.sol` | 边界 bug 的最高有效位函数 |
| `src/ToyVault.sol` | 只记账的份额金库 |
| `src/SmtDemo.sol` | SMTChecker 示例 |
| `test/*.t.sol` | `test*` 由 forge 运行；`check_*` 由 Halmos 运行 |
| `certora/` | CVL 规格示例。只通过了本地类型检查，没有在证明器上运行 |

```bash
forge test -vv
halmos --contract BitMathTest
```
