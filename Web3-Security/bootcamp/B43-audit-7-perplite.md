# B43 第 7 次审计：PerpLite

> 学习目标：做完本章，你能——
> 1. 用 PRP 清单审计一个单市场永续合约，并找出 8 个预埋漏洞。
> 2. 为每个漏洞写出能通过的 Foundry PoC 和修复证明。
> 3. 用 Handler 不变量测试检查偿付和 OI 记账。
>
> 前置知识：[B42 永续合约](B42-perps.md)；会写 Foundry 测试。
> 预计用时：4–6 小时。
> 靶场：[practice-example-code/range/perplite/](../../practice-example-code/range/perplite/README.md)
> 交互实验：[perp-lab.html](../interactive/perp-lab.html)
> 关联章节：[08 预言机](../08-oracle-flashloan.md)｜[07 外部调用](../07-external-calls-tokens.md)｜[11 DeFi 经济安全](../11-defi-economic-security.md)｜[27 审计流程](../27-audit-testing-workflow.md)｜[B25 综合实战](B25-capstone-minilend.md)
> 最后核对：2026-11-10（forge 1.5.1、solc 0.8.28 本地运行；下文输出来自真实运行）

> ⚠️ 警告：法律与道德边界。PerpLite 是本地玩具合约。不要部署到公开网络。不要把这些方法用于未经书面授权的目标。

---

## 开场：账本有五本，错一本就出事

PerpLite 只有一个合约文件，约 240 行。它有 LP 金库、两步下单、资金费、清算。它也有 8 个漏洞。有的漏洞让人白赚钱。有的漏洞让协议卡死。有的漏洞不偷钱，只是让账本悄悄偏离现实。

这次审计，你的任务不是读懂每一行，而是**核对账本**。

> 🎯 打个比方：永续合约像一家同时开了柜台和赌场的银行。金库是银行的钱，保证金是客户押金，OI 是赌桌上的总筹码。审计员不问"这家银行看起来诚实吗"，而是逐本对账。
>
> 比喻的局限：真实银行有监管和停业机制。链上合约的账本错了，攻击者能立刻提现。

## 1. 项目简报

| 项 | 内容 |
|---|---|
| 协议 | PerpLite，单市场永续合约 |
| 对手方 | LP 金库。交易者盈利由金库支付 |
| 下单 | 两步：`requestIncrease` / `requestClose`，Keeper 调用 `executeNext(roundId)` |
| 价格 | 8 位小数，来自 `MockOracle`，按轮次保存历史 |
| 金额 | 6 位小数。仓位按美元名义价值计价 |
| 资金费 | 偏斜法：多头 OI 大于空头时，多头付钱 |

协议的承诺（来自 NatSpec 和这份简报）：

1. 开仓价来自订单之后的价格。
2. 协议不用过期价格清算。
3. Keeper 执行不会被任何单个用户阻塞。
4. 任何亏损超过保证金的仓位都能被清算。
5. OI 等于所有未平仓位名义价值之和。

## 2. 范围

| 文件 | 在范围内 |
|---|---|
| `src/PerpLite.sol` | 是 |
| `src/mocks/*` | 否（测试替身） |
| `test/`、`solution/`、`demo/` | 否。第一遍审计不要打开 |

已知的简化，不算发现：LP 份额价格不含未实现盈亏（报告中记为信息项）；没有首存保护；使用单一价格，没有标记价和价格影响。

## 3. 环境

```bash
cd practice-example-code/range/perplite # 进入 PerpLite 靶场目录
forge build # 编译全部合约
```

预期输出（首次编译后）：

```text
Compiler run successful!
```

先写下五本账。每看到一个函数，就问它改了哪几本：

| 账本 | 变量 |
|---|---|
| LP 资金 | `poolAmount`、`totalShares` |
| 保证金 | `totalCollateral` |
| 待执行押金 | `pendingCollateral` |
| OI | `longOI`、`shortOI` |
| 资金费 | `cumFunding`、`lastFundingAt` |

## 4. 分阶段提示

先自己审计 45 分钟。卡住时，每次只展开一层。

### F-01

<details class="predict"><summary>🤔 提示 1：哪些函数读取"最新价"？</summary>

`liquidate` 调用 `oracle.latest()`。它返回两个值，代码只用了第一个。

</details>

<details class="predict"><summary>🤔 提示 2：第二个返回值是什么？</summary>

是 `updatedAt`。代码没有用它。

</details>

<details class="predict"><summary>🤔 发现：过期价格可清算健康仓位</summary>

喂价停止两天，合约仍用旧价计算。价格早已回升的仓位，会按旧的崩盘价被清算。

</details>

### F-02

<details class="predict"><summary>🤔 提示 1：`executeNext(roundId)` 里的 `roundId` 由谁决定？</summary>

由调用者决定。函数只检查 `price > 0`。

</details>

<details class="predict"><summary>🤔 提示 2：`roundId` 对应的时间有什么要求？</summary>

没有任何要求。可以比订单创建时间更早。

</details>

<details class="predict"><summary>🤔 发现：执行者挑选旧价开仓</summary>

用户下单后，自己调用 `executeNext(1)`，按下单之前的旧价成交。价格已涨 10% 时，这是无风险利润。

</details>

### F-03

<details class="predict"><summary>🤔 提示 1：队列是怎么前进的？</summary>

`executeNext` 只处理 `head`。这一笔回滚，`head` 就不动。

</details>

<details class="predict"><summary>🤔 提示 2：`executeNext` 末尾的 `call` 发给谁？失败会怎样？</summary>

退款发给 `o.owner`。`require(ok, "refund")` 让整笔交易回滚。

</details>

<details class="predict"><summary>🤔 发现：一个回滚的 `receive` 卡住所有人</summary>

攻击者用拒收 ETH 的合约下单，队列永久卡住。滑点失败等 `require` 同样会卡住。

</details>

### F-04

<details class="predict"><summary>🤔 提示 1：`_executeIncrease` 里 OI 的更新和资金费累计，谁在前？</summary>

OI 先更新，`accrueFunding()` 后调用。

</details>

<details class="predict"><summary>🤔 提示 2：`accrueFunding` 用哪个时段、哪个偏斜？</summary>

用"上次累计到现在"的全部时间，但使用**当前**的偏斜。

</details>

<details class="predict"><summary>🤔 发现：一笔大单改写过去的资金费，加仓还会清零旧账</summary>

过去 7 天多空平衡，本应无资金费。一笔大额多单把新偏斜套用到过去 7 天，已有多头被收费，空头白拿钱。另外，加仓直接覆盖 `entryFunding`，旧的应付资金费被清零。

</details>

### F-05

<details class="predict"><summary>🤔 提示 1：`liquidate` 里 `equity` 是有符号数。下一步怎么用它？</summary>

`uint256 remaining = uint256(equity);`

</details>

<details class="predict"><summary>🤔 提示 2：`equity = -1` 时，`uint256(equity)` 是多少？</summary>

是 `2^256 − 1`。显式转换不会回滚。下一行的乘法会溢出并回滚。

</details>

<details class="predict"><summary>🤔 发现：负权益的仓位无法被清算</summary>

坏账仓位永远留在系统里。

</details>

### F-06

<details class="predict"><summary>🤔 提示：`removeCollateral` 的杠杆检查用了哪些变量？</summary>

只用了 `p.size` 和 `left`，没有用价格。所以带着未实现亏损也能提走保证金。

</details>

### F-07

<details class="predict"><summary>🤔 提示：仓位按美元名义计价。加仓时的均价应该是算术平均吗？</summary>

不是。用美元名义价值计价时，合计数量是 `size / price` 之和，均价是**调和平均**。算术平均会高估空头收益。

</details>

### F-08

<details class="predict"><summary>🤔 提示：对比 `_executeClose` 和 `liquidate`，少了什么？</summary>

`liquidate` 没有减 OI。

</details>

## 5. 发现清单

| 编号 | 严重性 | 标题 | 手册检查项 |
|---|---|---|---|
| F-01 | High | 清算使用过期价格 | ORA-4、PRP-4 |
| F-02 | Critical | 执行者可挑选订单之前的价格轮次 | ORA-1、PRP-3 |
| F-03 | High | 回调和业务失败阻塞 Keeper 队列 | EXT-5、PRP-12 |
| F-04 | High | 资金费按错误的偏斜累计，加仓丢失应付资金费 | DFI-1、PRP-5、PRP-6 |
| F-05 | High | 负权益仓位无法清算 | ARI-2、PRP-9 |
| F-06 | High | 提取保证金忽略未实现亏损 | DFI-2、PRP-11 |
| F-07 | High | 名义计价的均价使用算术平均 | ARI-5、PRP-7 |
| F-08 | Medium | 清算不减少 OI | DFI-1、PRP-2 |

## 6. 运行全部 PoC

`test/PoC.t.sol` 的 `PoC` 合约跑在漏洞版上，`FixProofs` 跑在修复版上。测试通过，表示坏事真的发生了，或者修复真的有效。

```bash
forge test # 运行 PoC、修复证明和不变量测试
```

真实输出（已删去 gas 数字）：

```text
[PASS] test_F01_staleOracleLiquidatesHealthyPosition()
[PASS] test_F02_executorPicksOldRoundForRisklessProfit()
[PASS] test_F03_revertingRefundBlocksQueue()
[PASS] test_F04_oiChangeRepricesPastFunding()
[PASS] test_F04b_increaseErasesOwedFunding()
[PASS] test_F05_underwaterPositionCannotBeLiquidated()
[PASS] test_F06_removeCollateralIgnoresUnrealizedLoss()
[PASS] test_F07_arithmeticAverageEntryOverpaysShort()
[PASS] test_F08_liquidationLeavesOpenInterest()
Suite result: ok. 9 passed; 0 failed; 0 skipped
[PASS] test_fix_F01_stalePriceRejected()
[PASS] test_fix_F02_laterRoundAlsoRejected()
[PASS] test_fix_F02_oldRoundRejected()
[PASS] test_fix_F03_queueMovesPastRevertingOwner()
[PASS] test_fix_F03_slippageCancelsAndRefunds()
[PASS] test_fix_F04_noRetroactiveFunding()
[PASS] test_fix_F04b_increaseSettlesOwedFunding()
[PASS] test_fix_F05_underwaterLiquidates()
[PASS] test_fix_F06_removeCollateralChecksEquity()
[PASS] test_fix_F07_harmonicEntry()
[PASS] test_fix_F08_liquidationClearsOpenInterest()
Suite result: ok. 11 passed; 0 failed; 0 skipped
Ran 3 test suites: 23 tests passed, 0 failed, 0 skipped (23 total tests)
```

PoC 打印的金额（6 位小数）：

```bash
# 只看 PoC 日志中以 F0x 开头的金额行
forge test --match-contract PoC -vv 2>&1 | grep -E "F0[0-9]b? "
```

```text
  F02 profit (6 decimals) 9899970000
  F04 bob funding income 1512005000
  F04b funding forgiven 1814300000
  F07 reported pnl 666666666
```

读数：F-02 用 2 万美元保证金净赚约 9,900 美元。F-07 的真实盈亏应为 500 美元，合约却算出约 666.67 美元。

> 🧪 动手验证：打开 `test/PoC.t.sol`，把 F-02 的 `perp.executeNext(1)` 改成 `perp.executeNext(2)`。重新运行，记录利润变成了多少，并解释原因。测试会因 `assertGt` 不成立而失败，这是预期结果；看日志里的 profit 读数。

## 7. Handler 不变量测试

单个 PoC 只能证明你想到的路径。不变量测试让随机序列去碰你没想到的路径。

`test/Handler.sol` 把随机输入约束成合法操作。每次开平仓都走完整的两步流程。`test/Invariant.t.sol` 检查：

| 不变量 | 含义 |
|---|---|
| `invariant_solvency` | 合约持有的代币 = LP 资金 + 保证金 + 待执行押金 |
| `invariant_openInterestMatchesPositions` | OI = 所有仓位名义价值之和 |
| `invariant_collateralMatchesPositions` | `totalCollateral` = 所有仓位保证金之和 |

```bash
forge test --match-contract InvariantFixed # 对修复版运行 Handler 不变量
```

真实输出：

```text
[PASS] invariant_collateralMatchesPositions() (runs: 128, calls: 7680, reverts: 1437)
[PASS] invariant_openInterestMatchesPositions() (runs: 128, calls: 7680, reverts: 1339)
[PASS] invariant_solvency() (runs: 128, calls: 7680, reverts: 1406)
```

用同一个 Handler 跑漏洞版。下面这条命令**预期失败**：

```bash
FOUNDRY_PROFILE=vuln forge test # 切换到 vuln 配置，同一 Handler 跑漏洞版
```

真实输出（节选）：

```text
[FAIL: long: 31266457255 != 0]
	[Sequence] (original: 5, shrunk: 3)
		... calldata=open(...)
		... calldata=movePrice(...)
		... calldata=liquidate(...)
 invariant_openInterestMatchesPositions()
```

读法：模糊器把序列缩减到几步，常见的是开仓、跌价、清算。具体步数和多空方向每次运行可能不同。清算后仓位没了，`longOI` 还在。这就是 F-08。

> 💡 注意：不变量测试的 `fail_on_revert` 设为 `false`。Handler 的部分操作（比如清算健康仓位）本来就该回滚。反过来，如果你把它设成 `true`，就在要求协议永不回滚，这不是这里要测的性质。

## 8. 修复对照

完整代码在 `solution/PerpLiteFixed.sol`，每处修复用 ✅ 和发现编号标注。两处最容易错：

```solidity
// ❌ 漏洞：OI 先变，再累计资金费
if (o.isLong) longOI += o.size;  // OI 已改变
accrueFunding();  // 用新偏斜结算了旧时段的资金费

// ✅ 修复：先按旧偏斜结算，再改变 OI
accrueFunding();  // 先用旧 OI 结算到当前时刻
if (o.isLong) longOI = nextOi;  // 再更新 OI
```

```solidity
// ❌ 漏洞：名义计价却用算术平均
// 按价格加权，名义计价下会错
p.entryPrice = (p.entryPrice * p.size + price * o.size) / newSize;

// ✅ 修复：调和平均，对用户不利方向取整
// 把名义价值换算成代币数量后相加
uint256 tokens = (p.size * 1e18) / p.entryPrice + (o.size * 1e18) / price;
// 多头向上取整、空头向下，都对用户不利
p.entryPrice = o.isLong ? (newSize * 1e18 + tokens - 1) / tokens : (newSize * 1e18) / tokens;
```

<details class="predict"><summary>🤔 先猜再看：F-02 的修复只写 `updatedAt > createdAt` 够吗？</summary>

不够。如果价格轮次 2 和 3 都晚于订单，执行者仍能在两轮之间挑选。修复版要求 `previousAt <= createdAt`，即只接受订单之后的**第一轮**。`test_fix_F02_laterRoundAlsoRejected` 验证这一点。

</details>

## 9. 完整示范报告

```markdown
# PerpLite 安全审计报告

- 审计对象：src/PerpLite.sol
- 方法：人工审阅 + Foundry PoC + Handler 不变量
- 结论：发现 1 个 Critical、6 个 High、1 个 Medium。全部已在修复版中修复并复测。

## [C-01] 执行者可挑选订单之前的价格轮次（F-02）
**位置**：executeNext。
**描述**：roundId 由调用者提供，合约只检查价格大于 0，不检查价格时间晚于订单时间。
**影响**：用户在下单后用更早的价格成交，获得无风险利润，损失由 LP 承担。
**证据**：test_F02_executorPicksOldRoundForRisklessProfit，净赚约 9,900 mUSD。
**修复**：只接受订单创建后的第一轮价格，并设置订单有效期。

## [H-01] 清算使用过期价格（F-01）
**位置**：liquidate。**描述**：未检查 updatedAt。
**影响**：喂价中断时，健康仓位按旧价被清算。
**证据**：test_F01_staleOracleLiquidatesHealthyPosition。
**修复**：所有用价路径检查最大价格年龄，超过时回滚。

## [H-02] 回调和业务失败阻塞 Keeper 队列（F-03）
**位置**：executeNext、_executeIncrease、_executeClose。
**描述**：FIFO 队列中任一订单回滚，后续订单全部无法执行。
**影响**：单个攻击者能让所有用户无法开平仓。
**证据**：test_F03_revertingRefundBlocksQueue。
**修复**：ETH 退款改为拉取式；业务失败时取消订单并退款。

## [H-03] 资金费按错误偏斜累计，加仓丢失应付资金费（F-04）
**位置**：_executeIncrease。
**描述**：OI 更新先于 accrueFunding，历史时段按新偏斜计算；加仓直接覆盖 entryFunding。
**影响**：大单在开仓瞬间改写历史资金费；付费方加仓即可清零旧账。
**证据**：test_F04_oiChangeRepricesPastFunding、test_F04b_increaseErasesOwedFunding。
**修复**：先累计资金费，再改变 OI；加仓时把应付资金费计入保证金。

## [H-04] 负权益仓位无法清算（F-05）
**位置**：liquidate。**描述**：uint256(equity) 对负数得到极大值，后续乘法溢出回滚。
**影响**：坏账仓位无法清除，OI 和风险持续累积。
**证据**：test_F05_underwaterPositionCannotBeLiquidated。
**修复**：权益不大于 0 时剩余按 0 处理，并记录坏账。

## [H-05] 提取保证金忽略未实现亏损（F-06）
**位置**：removeCollateral。**描述**：只校验名义杠杆。
**影响**：用户取走多于真实权益的资金，留下坏账。
**证据**：test_F06_removeCollateralIgnoresUnrealizedLoss。
**修复**：提取后的权益必须满足初始保证金要求。

## [H-06] 名义计价的均价使用算术平均（F-07）
**位置**：_executeIncrease。**描述**：应使用调和平均。
**影响**：空头在加仓后盈亏被高估，示例中多得约 166 美元。
**证据**：test_F07_arithmeticAverageEntryOverpaysShort。
**修复**：按代币数量计算均价，取整方向不利于用户。

## [M-01] 清算不减少 OI（F-08）
**位置**：liquidate。**描述**：缺少 longOI/shortOI 更新。
**影响**：幽灵 OI 扭曲资金费并占用 OI 上限。
**证据**：test_F08_liquidationLeavesOpenInterest；不变量失败序列。
**修复**：清算同步减少 OI。

## [I-01] LP 份额价格不含未实现盈亏
**描述**：份额按 poolAmount 定价。先退出的 LP 可把未实现亏损留给后退出者。
**建议**：把未实现盈亏计入金库估值（见 B42 第 9 节）。

## 修复复查
FixProofs 11 个测试通过。Handler 不变量 3 项，各 128 轮 × 60 步，全部通过。
本报告不保证修复版没有其他问题。修复版未经第三方审计。
```

> 💡 注意：H-06 里的"多得约 166 美元"来自 PoC 打印的 666.67 美元与真实 500 美元之差。报告中的每个数字都要能追溯到 PoC 输出。

> 🪞 反思：你维护的系统里，有几本账是"分开记的"？如果其中一本漏更新，你多久能发现？

## 10. 如果出错

| 现象 | 原因 | 解决 |
|---|---|---|
| `forge: command not found` | Foundry 未安装 | 按 [B04](B04-setup.md) 安装 |
| `Source "forge-std/Test.sol" not found` | `lib/forge-std` 符号链接失效 | 在项目目录运行 `ln -sfn ../../../foundry/lib/forge-std lib/forge-std` |
| 自己写的 PoC 报 `keeper` 回滚 | `vm.prank` 被紧跟的外部调用消耗 | 先把 `oracle.latestRoundId()` 存进变量，再 `vm.prank` |
| 不变量全部 `reverts` 很高 | Handler 常命中合法回滚 | 这是正常现象；检查有效调用足够多，比如 `open` 不回滚 |
| `FOUNDRY_PROFILE=vuln` 也通过 | 模糊器没遇到清算 | 把 `depth` 调大，或换 `--fuzz-seed` |
| 修复版 F-02 总是 `WrongRound` | 没有在订单之后推送新价格 | 下单后先 `vm.warp` 再 `oracle.push` |

## 11. 过关标准

- [ ] 不看提示，自己找到至少 5 个漏洞。
- [ ] `forge test` 显示 `23 tests passed, 0 failed`。
- [ ] `FOUNDRY_PROFILE=vuln forge test` 打印失败序列，并能说出它对应 F-08。
- [ ] 自己写一个不在本章里的不变量，比如"关闭全部仓位后 OI 为 0"，并让它通过。
- [ ] 按示范格式写完报告，每个数字都能追溯到输出。

## 思考题

1. 修复版的 Handler 不变量全部通过。这能证明 PerpLiteFixed 没有漏洞吗？举一个不变量测试发现不了的问题。
2. 修复 F-03 时，为什么把失败订单改成"取消并退款"，而不是用 `try/catch` 忽略错误？
3. 如果把清算价格换成带时间加权的标记价，F-01 和 F-05 还存在吗？分别说明。
