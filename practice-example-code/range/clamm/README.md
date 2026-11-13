# CLAMM 数学演示（本地）

配套章节：[B37 集中流动性与 V4 Hooks](../../../Web3-Security/bootcamp/B37-clamm-v4.md)。只做本地测试。

```bash
forge test -vv
```

`ClammMath.sol` 是教学实现：tick 范围限制在 ±200000，精度低于 Uniswap 的 TickMath。不要用于生产。
