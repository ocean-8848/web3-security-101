# B18 DEX 与 AMM：x·y=k、集中流动性与 StableSwap

> 学习目标：推导恒定乘积公式的成交量与价格影响；说明 Uniswap V3 集中流动性与 Curve StableSwap 的区别；计算夹击攻击利润与无常损失。  
> 前置章节：[B17 DeFi 地图与头部协议](B17-defi-basics.md)  

> 🔗 关联：主线 [08 章](../08-oracle-flashloan.md)、[09 章](../09-mev-signatures.md)、[11 章](../11-defi-economic-security.md) ｜ 实验 [AMM 工作台](../interactive/audit-amm.html)、[抢跑](../interactive/audit-frontrun.html)、[K 值检查](../interactive/audit-v2k.html) ｜ 评估 [A04](../assessment/A04-defi-protocol-review.md) ｜ 衔接 [B36](B36-case-uniswap-v2.md)、深入 [B37](B37-clamm-v4.md)

## 1. 一句话理解

**AMM（自动做市商）用一个数学公式代替订单簿。池子里两种代币的数量决定价格。任何人都能和公式交易。**

> 🎯 打个比方：一个跷跷板两端放着苹果和橙子。你从一端拿走苹果，就必须往另一端放橙子，让"苹果数 × 橙子数"保持不变。拿得越多，每个苹果越贵。
>
> 比喻的局限：跷跷板不收手续费。真实池子每笔交易扣手续费，k 会慢慢变大。

> 💡 项目实例：[B36 Uniswap V2 完整审计底稿](B36-case-uniswap-v2.md)。

## 2. Uniswap V2：恒定乘积

```text
不变量:   x · y = k
买入 dx（扣 0.3% 手续费后为 dx' = dx · 0.997）
得到:     dy = y · dx' / (x + dx')
现货价格: P = y / x
价格影响: 交易后价格 / 交易前价格 − 1
```

V2 的关键实现细节（审计时逐一核对）：

- `swap()` 先转出代币，再检查 `balance0Adjusted × balance1Adjusted ≥ reserve0 × reserve1 × 1000²`。这支持"闪电兑换"：先拿币，在 `uniswapV2Call` 回调里付款。
- 其余实现细节（`lock`、`MINIMUM_LIQUIDITY`、`skim` / `sync`、累积价格）见 [B36 第 4、5 节](B36-case-uniswap-v2.md)（阶段 5 精读）。

## 3. Uniswap V3：集中流动性（概览）

- LP 只在一个价格区间 [P<sub>a</sub>, P<sub>b</sub>] 内提供流动性。同样的资金在区间内更深，资本效率更高。
- 价格离开区间后，这个 LP 不再赚手续费，并且只持有一种代币。
- 合约用 tick 和 `sqrtPriceX96` 表示价格，并在价格穿越 tick 时加减活跃流动性。
- 对集成方最重要的一条：`slot0` 里的现货价格可被单笔交易操纵，不能直接当预言机。

tick 的数学、区间代币数量、手续费增长的回绕、取整方向与 KyberSwap 事故、V3 TWAP 和 V4 Hooks，见专题 [B37 集中流动性与 V4 Hooks](B37-clamm-v4.md)。

## 4. Curve StableSwap

Curve 用于锚定资产（USDC/USDT、ETH/stETH）。它把恒定和（x + y = 常数，零滑点但会被抽干）与恒定乘积混合，放大系数 A 控制混合比例。

```text
A·nⁿ·Σxᵢ + D = A·D·nⁿ + Dⁿ⁺¹ / (nⁿ·Πxᵢ)
D: 池子在平衡状态下的总价值
求解: 没有闭式解，合约用牛顿迭代计算 D 和 y（最多 255 轮）
```

审计关注：牛顿迭代的收敛条件与取整；A 值渐变（ramp）期间的价格跳变；`get_virtual_price()` 在 `remove_liquidity` 回调中可被读取（只读重入）；Vyper 编译器版本。

> 🧪 交互实验：[AMM 工作台](../interactive/audit-amm.html)

## 5. 无常损失

当价格比值变为 r 倍时，相对于持有：`IL = 2·√r / (1 + r) − 1`。价格翻倍时 IL 约 −5.7%；价格变为 5 倍时约 −25.5%。集中流动性在区间内放大收益，也放大 IL。

## 6. AMM 审计检查清单

- 所有 swap 入口是否有 `minOut` 和 `deadline`？
- 协议是否把 AMM 现货价格当预言机？
- 是否支持转账收费、rebase、ERC777 代币？储备与余额如何同步？
- 首次添加流动性是否有最小锁定？
- 手续费计算是否在整数边界上可被反复利用？
- 回调（闪电兑换、V3 的 `uniswapV3SwapCallback`）是否验证 `msg.sender` 是真正的池子？
- 集中流动性和 V4 Hook 的专项检查：见 [B37 第 11 节](B37-clamm-v4.md) 的 AMM-1～AMM-15。

> ⚠️ 警告：V3 回调中如果不验证调用者是官方工厂部署的池子，攻击者可以伪造一个"池子"调用你的回调，让你付款给攻击者。

> 🪞 反思：回想你最近一次链上兑换。
> 1. 你设置的滑点是多少？依据是什么？
> 2. 你的合约有没有把现货价当作公允价？
> 3. 回调入口验证了调用方吗？

## 7. 思考题

1. 在夹击实验中把受害者的滑点设为 0.5%。攻击者的最优抢先金额大约是多少？利润怎样随池子深度变化？
2. StableSwap 标签中，把 A 从 1 调到 2000。曲线在哪里接近直线？在哪里突然变陡？这对脱锚时的 LP 意味着什么？
