# yul：B45 配套代码

本目录只用于本地 `forge test`。配套章节：[B45 Yul 与字节码](../../../handbook/bootcamp/B45-yul-opcodes.md)。

| 文件 | 内容 |
|---|---|
| `src/TallySol.sol` | Solidity 版计数器，gas 基线 |
| `src/TallyAsm.sol` | 内联汇编版，手写分发 |
| `src/Tally.yul` | 纯 Yul 版，含部署代码和运行时代码 |
| `src/Pitfalls.sol` | 脏高位、内存安全、返回数据、汇编 return 四组对照 |
| `test/` | 等价性测试、gas 对比、陷阱复现 |

```bash
forge test -vv
```

预期：17 个测试全部通过。
