# B28 高频漏洞模式库

> 学习目标：读完本章，你能——
> 1. 用触发点在陌生代码里定位候选问题。
> 2. 把每个候选问题转成一个可以用测试回答的问题。
> 3. 区分"模式命中"和"漏洞成立"。
>
> 前置章节：[B27 专业审计流程](B27-what-is-audit.md)、[04 重入](../04-reentrancy.md)、[07 外部调用与代币](../07-external-calls-tokens.md)；[B45 Yul 与操作码](B45-yul-opcodes.md)（可选，阶段 6 学；只有底层与 calldata 类模式用到）
> 预计时间：通读 90 分钟；之后作为工具书反复查阅。
> 交互实验：[severity-drill.html](../interactive/severity-drill.html) ｜ 示例：[practice-example-code/range/abi](../../practice-example-code/range/abi)、[practice-example-code/range/thinkaloud](../../practice-example-code/range/thinkaloud)

> ⚠️ 警告：本章只用于审计自己的代码、获授权的代码和本地靶场。不要用这些模式探测未授权的在线合约。有效的路径是赏金计划和审计竞赛，并遵守它们的规则。

---

## 开场：一个 grep 命中不等于一个漏洞

你在一份合约里搜到 `ecrecover`。这是发现吗？不是。这只是一个开始提问的位置。

<details class="predict"><summary>🤔 先猜再看：一个合约用 `ecrecover` 验签，并且接受高 s 值。它一定有签名可延展漏洞吗？</summary>

不一定。可延展性只在"用签名字节做防重放标记"时才能被利用。如果合约用 nonce 防重放，翻转后的签名恢复出同一地址，但 nonce 已经变了，摘要不同，验证失败。[thinkaloud 的测试](../../practice-example-code/range/thinkaloud/test/PoC.t.sol) 里的 `test_Rejected_HighSSignatureCannotReplay` 证明了这一点。

</details>

## 1. 一句话理解

**模式是提问的位置，不是答案。**

> 🎯 打个比方：模式库像医生的鉴别诊断表。"胸痛"提示几种可能，医生还要做检查才能确诊。
>
> 比喻的局限：病人不会主动配合疾病。合约的攻击者会主动组合多个小问题，所以单项检查正常不代表整体安全。

## 2. 怎样使用这张表

每个模式有五项内容：

| 列 | 含义 |
|---|---|
| 触发点 | 用 `grep` 搜什么，或者读代码时看什么 |
| 例子 | 一行示意，不来自真实项目 |
| 要问 | 能用测试回答的问题 |
| 倾向 | 常见等级，按 [A02](../assessment/A02-risk-rating-reporting.md) 的等级词 |
| 链接 | 相关章节或可运行测试 |

使用步骤：

1. 选一个分组。
2. 对目标运行触发点搜索。
3. 记下每个命中的文件和行号。
4. 对每个命中回答"要问"一列。
5. 如果答案是"可能成立"，写一个测试。
6. 用影响和可能性重新定级。

> 💡 注意："倾向"只是统计印象。最终等级取决于这份代码的影响和可能性。一个模式在一个项目里是严重，在另一个项目里可能只是信息。

### 2.1 本章术语

| 术语 | 英文 | 定义 |
|---|---|---|
| 外部调用 | External Call | 合约把执行权交给另一个地址的操作 |
| 回滚 | Revert | 撤销当前调用的全部状态修改 |
| 重入 | Reentrancy | 函数尚未结束时被外部调用再次进入 |
| 份额 | Share | 金库发给存款人的凭证，按比例兑换资产 |
| 预言机 | Oracle | 把外部数据（例如价格）带上链的系统 |
| 滑点 | Slippage | 成交价和预期价之间的差 |
| 抢跑 | Front-running | 攻击者看到待打包交易后，让自己的交易排在它前面 |
| 拒绝服务 | DoS (Denial of Service) | 让合法用户无法使用某个功能 |
| 代理 | Proxy | 把逻辑委托给另一个合约执行，自己保存状态的合约 |
| 可延展性 | Malleability | 同一条消息存在另一份同样有效的签名 |

## 3. 模式库

<details><summary><strong>A. 外部调用（7 个）</strong></summary>

| 编号 | 模式 | 触发点 | 例子 | 要问 | 倾向 | 链接 |
|---|---|---|---|---|---|---|
| BP-01 | 任意调用目标 | `.call(`、`functionCall(`，且目标来自参数 | `route.target.call(route.data)` | 这个合约持有授权或余额吗？目标有白名单吗？ | 严重 | [07](../07-external-calls-tokens.md) · [RouterCallback](../../practice-example-code/foundry/test/RouterCallback.t.sol) |
| BP-02 | 用户控制委托目标 | `delegatecall`，目标不是常量 | `impl.delegatecall(data)` 中 `impl` 来自参数 | 谁能决定目标？被委托代码能写哪些槽？ | 严重 | [10](../10-upgradeable-proxy.md) |
| BP-03 | 未检查调用结果 | `.call{`、`.send(`，后面没有 `require` | `to.call{value: v}("");` | 失败时账本是否已经改变？ | 高 | [07](../07-external-calls-tokens.md) |
| BP-04 | 调用无代码地址 | 低级调用目标可为空账户 | `token.call(data)` 且 `token` 未部署 | 目标没有代码时，调用返回成功。后续逻辑是否把它当作转账完成？ | 高 | [Returndata 测试](../../practice-example-code/range/abi/test/Returndata.t.sol) |
| BP-05 | 返回炸弹 | 调用不受信目标，且需要在失败后继续执行 | `(ok,) = user.call{gas: g}("")` | 对方返回大量数据时，调用方的复制成本够吗？ | 中 | [B46](B46-calldata-memory.md) |
| BP-06 | gas 不足仍继续 | `gasleft()`、`call{gas:`、中继器提交的执行 | `try this.run() {} catch { failed = true; }` | 中继者少给 gas，内层失败，外层标记"已处理"吗？63/64 规则留下的 gas 够收尾吗？ | 中 | [07](../07-external-calls-tokens.md) |
| BP-07 | 陈旧输出缓冲 | 汇编 `call`、`staticcall` 的输出长度大于 0 | `staticcall(gas(), t, 0, 4, 0, 0x20)` | 对方没有返回数据时，缓冲区里是什么？有检查 `returndatasize()` 吗？ | 高 | [Returndata 测试](../../practice-example-code/range/abi/test/Returndata.t.sol) |

</details>

<details><summary><strong>B. 重入形态（5 个）</strong></summary>

| 编号 | 模式 | 触发点 | 例子 | 要问 | 倾向 | 链接 |
|---|---|---|---|---|---|---|
| BP-08 | 单函数重入 | 外部调用在余额更新之前 | 先 `call` 后 `bal[u] = 0` | 回调发生时，账本是旧值吗？ | 严重 | [04](../04-reentrancy.md) · [Reentrancy](../../practice-example-code/foundry/test/Reentrancy.t.sol) |
| BP-09 | 跨函数重入 | 只有部分入口有 `nonReentrant` | `withdraw` 有锁，`transferShares` 没有 | 回调期间，哪些未加锁的函数读写同一状态？ | 高 | [04](../04-reentrancy.md) |
| BP-10 | 跨合约重入 | 多合约共享状态，但各自持有独立的锁 | 金库加锁，配套的份额代币未加锁 | 锁的范围和状态的范围一致吗？ | 高 | [04](../04-reentrancy.md) |
| BP-11 | 只读重入 | 其他协议读取本协议的 `view` 函数 | 回调中 `getPrice()` 返回半更新值 | 交互中途的 `view` 结果还正确吗？谁依赖它？ | 高 | [04](../04-reentrancy.md) |
| BP-12 | 隐藏回调 | `safeTransferFrom`、`_safeMint`、ERC-777、闪电贷回调 | `_safeMint(to, id)` 后才写 `minted++` | 这个"普通转账"会执行接收方代码吗？ | 高 | [04](../04-reentrancy.md) |

</details>

<details><summary><strong>C. 代币边界情况（13 个）</strong></summary>

| 编号 | 模式 | 触发点 | 例子 | 要问 | 倾向 | 链接 |
|---|---|---|---|---|---|---|
| BP-13 | 转账无返回值 | 直接用 `IERC20.transfer`，未用 `SafeERC20` | 主网 USDT 的 `transfer` 不返回 bool | 高层调用按 bool 解码时会回滚吗？ | 中 | [SafeTokenOps](../../practice-example-code/foundry/test/SafeTokenOps.t.sol) |
| BP-14 | 失败时返回 false | `transfer` 的结果未检查 | `token.transfer(u, a);` | 代币失败时不回滚，账本照常更新吗？ | 高 | [07](../07-external-calls-tokens.md) |
| BP-15 | 收税转账 | `transferFrom` 后按参数入账 | `bal[u] += amount` | 实收金额等于参数吗？最后一个取款人能取到钱吗？ | 高 | [07](../07-external-calls-tokens.md) |
| BP-16 | 余额自动变化 | 协议缓存余额，代币是变基代币 | `cached = token.balanceOf(this)` | 余额增加时谁获利？余额减少时谁亏损？ | 中 | [07](../07-external-calls-tokens.md) |
| BP-17 | 黑名单 | 推送式转账，代币有黑名单 | 循环中 `usdc.transfer(u[i], a)` | 一个地址被封，其他人的付款也失败吗？ | 中 | [07](../07-external-calls-tokens.md) |
| BP-18 | 代币可暂停 | 清算或还款依赖转账 | 清算时 `collateral.transfer` | 暂停期间利息继续累积，清算却不可用，结果是什么？ | 中 | [11](../11-defi-economic-security.md) |
| BP-19 | 非零改非零授权 | `approve(x, n)`，未先清零 | 主网 USDT 要求先把授权改为 0 | 上一次授权没用完时，下一次 `approve` 会回滚吗？ | 中 | [07](../07-external-calls-tokens.md) |
| BP-20 | 零额转账回滚 | 没有过滤 0 金额的分账逻辑 | `token.transfer(fee, 0)` | 部分代币拒绝 0 额转账，流程会卡住吗？ | 低 | [07](../07-external-calls-tokens.md) |
| BP-21 | 精度不是 18 | 写死 `1e18`，或假定精度 | `price * amt / 1e18`，`amt` 是 6 位 | 把精度换成 6 或 24，结果还对吗？ | 高 | [06](../06-arithmetic-precision.md) |
| BP-22 | 大额授权被截断 | `type(uint256).max` 配合 `uint96` 内部表示的代币 | 无限授权在代币内部另作处理 | 这个代币对超出 `uint96` 的金额怎样处理？ | 低 | [07](../07-external-calls-tokens.md) |
| BP-23 | 一个余额两个地址 | 用代币地址判断"受保护资产" | `require(token != protected)` | 同一余额有第二个入口地址时，判断还有效吗？ | 高 | [07](../07-external-calls-tokens.md) |
| BP-24 | permit 静默成功 | 调用 `permit` 后没有确认授权 | 代币没有 `permit`，但 `fallback` 不回滚 | `permit` 调用不回滚就代表授权成功吗？ | 高 | [09](../09-mev-signatures.md) |
| BP-25 | 余额可被捐赠 | `balanceOf(address(this))` 进入关键计算 | `rate = balance / supply` | 直接转账给合约，会改变这个结果吗？ | 高 | [ORA-2](../08-oracle-flashloan.md) · [VaultInflation](../../practice-example-code/foundry/test/VaultInflation.t.sol) |

</details>

<details><summary><strong>D. 取整与金库（5 个）</strong></summary>

| 编号 | 模式 | 触发点 | 例子 | 要问 | 倾向 | 链接 |
|---|---|---|---|---|---|---|
| BP-26 | 先除后乘 | 同一表达式里 `/` 在 `*` 之前 | `a / b * c` | `a < b` 时结果是 0 吗？ | 中 | [06](../06-arithmetic-precision.md) |
| BP-27 | 取整方向有利用户 | 份额和资产互换的除法 | 取款按向下取整算要烧的份额 | 重复小额操作能凭空得到资产吗？ | 高 | [ERC4626Rounding](../../practice-example-code/foundry/test/ERC4626Rounding.t.sol) · [audit-rounding](../interactive/audit-rounding.html) |
| BP-28 | 首存者膨胀 | 金库 `totalSupply == 0` 分支，无虚拟份额 | 存 1 wei，再捐赠大额 | 下一个存款人得到 0 份额吗？ | 严重 | [vault-inflation-lab](../interactive/vault-inflation-lab.html) |
| BP-29 | 累积器债务不同步 | `accPerShare`、`rewardDebt`，以及改变份额的所有入口 | 转移份额时只结算发送方 | 每个改变份额的入口都同时结算了双方吗？ | 严重 | [B30](B30-think-aloud.md) |
| BP-30 | 向下转型截断 | `uint128(`、`uint64(`、`unchecked` | `uint64(amount)` | 输入超过目标类型上限时，会静默截断吗？ | 高 | [06](../06-arithmetic-precision.md) |

</details>

<details><summary><strong>E. 预言机（5 个）</strong></summary>

| 编号 | 模式 | 触发点 | 例子 | 要问 | 倾向 | 链接 |
|---|---|---|---|---|---|---|
| BP-31 | 现货价作价格源 | `getReserves`、`slot0`、`balanceOf` 除法 | `price = r1 / r0` | 一笔交易内能移动这个值吗？ | 严重 | [08](../08-oracle-flashloan.md) · [SpotOracle](../../practice-example-code/foundry/test/SpotOracle.t.sol) |
| BP-32 | 不检查时效 | `latestRoundData` 后没有用 `updatedAt` | `(,p,,,) = feed.latestRoundData()` | 喂价停更 3 小时，协议还放贷吗？ | 高 | [08](../08-oracle-flashloan.md) |
| BP-33 | 精度混用 | 喂价的 `decimals()` 未读取 | 把 8 位价格当 18 位 | 不同喂价的精度相同吗？ | 高 | [08](../08-oracle-flashloan.md) |
| BP-34 | 不检查排序器 | 部署到 L2，没有排序器在线喂价 | 恢复瞬间就允许清算 | 排序器恢复后有宽限期吗？ | 中 | [ORA-5](../08-oracle-flashloan.md) |
| BP-35 | 喂价回滚堵死流程 | 还款、清算直接调用喂价 | 喂价下线，`repay` 一起回滚 | 预言机失败时，用户还能还款吗？ | 中 | [ORA-7](../08-oracle-flashloan.md) |

</details>

<details><summary><strong>F. 签名（6 个）</strong></summary>

| 编号 | 模式 | 触发点 | 例子 | 要问 | 倾向 | 链接 |
|---|---|---|---|---|---|---|
| BP-36 | 无 nonce | 摘要字段没有计数器 | `hash(user, amount)` | 同一签名能提交两次吗？ | 严重 | [SignatureReplay](../../practice-example-code/foundry/test/SignatureReplay.t.sol) |
| BP-37 | 缺少域绑定 | 摘要没有 `chainid` 或 `address(this)` | 域分隔符在构造时缓存 | 分叉链或同地址部署能重放吗？ | 高 | [signature-replay-lab](../interactive/signature-replay-lab.html) |
| BP-38 | 可延展性 | 用签名字节作 `used[sig]`，或接受高 s | `used[keccak256(sig)] = true` | 翻转 s 和 v 后，标记还能命中吗？ | 高 | [09](../09-mev-signatures.md) |
| BP-39 | `ecrecover` 返回零地址 | 没有 `!= address(0)` | 未设置的 `signer == ecrecover(...)` | 非法签名恢复出 0，配置项默认也是 0，会相等吗？ | 严重 | [09](../09-mev-signatures.md) |
| BP-40 | 签名未覆盖关键字段 | 函数参数中有字段不在结构哈希内 | `receiver` 由提交者指定 | 把每个参数改掉，签名还有效吗？ | 高 | [B30](B30-think-aloud.md) |
| BP-41 | 拼接碰撞 | `abi.encodePacked` 接两个以上动态类型 | `encodePacked(name, tag)` | 把边界挪一个字符，哈希还相同吗？ | 中 | [Encoding 测试](../../practice-example-code/range/abi/test/Encoding.t.sol) |

</details>

<details><summary><strong>G. 权限与初始化（4 个）</strong></summary>

| 编号 | 模式 | 触发点 | 例子 | 要问 | 倾向 | 链接 |
|---|---|---|---|---|---|---|
| BP-42 | 缺失权限检查 | 列出所有 `external`、`public` 状态修改函数 | `setFeeTo` 没有修饰符 | 这个函数应该由谁调用？ | 严重 | [05](../05-access-control.md) · [AccessControl](../../practice-example-code/foundry/test/AccessControl.t.sol) |
| BP-43 | 用 `tx.origin` 鉴权 | `tx.origin` | `require(tx.origin == owner)` | 钓鱼合约转发调用时，这个检查还成立吗？ | 高 | [05](../05-access-control.md) |
| BP-44 | 判断调用者是否为 EOA | `extcodesize`、`code.length`、`tx.origin == msg.sender` | `require(msg.sender.code.length == 0)` | 构造函数期间和 EIP-7702 账户下，这个判断还对吗？ | 中 | [EIP7702](../../practice-example-code/foundry/test/EIP7702.t.sol) |
| BP-45 | 初始化可被抢占 | `initialize` 无 `initializer`，或部署与初始化分开 | 部署后第二笔交易才初始化 | 这两笔交易之间，别人能先调用吗？ | 严重 | [10](../10-upgradeable-proxy.md) |

</details>

<details><summary><strong>H. 升级（4 个）</strong></summary>

| 编号 | 模式 | 触发点 | 例子 | 要问 | 倾向 | 链接 |
|---|---|---|---|---|---|---|
| BP-46 | 存储槽冲突 | 比对新旧实现的变量顺序 | 在旧变量之前插入新变量 | 旧数据被解释成什么？ | 严重 | [ProxyStorage](../../practice-example-code/foundry/test/ProxyStorage.t.sol) · [storage-proxy-lab](../interactive/storage-proxy-lab.html) |
| BP-47 | 实现合约未封锁 | 实现合约构造函数没有 `_disableInitializers` | 任何人能初始化实现合约 | 实现合约被接管后，能影响代理吗？ | 中 | [10](../10-upgradeable-proxy.md) |
| BP-48 | UUPS 授权缺失 | `_authorizeUpgrade` 函数体为空 | 新实现漏掉升级入口 | 谁能升级？升级后还能再升级吗？ | 严重 | [10](../10-upgradeable-proxy.md) |
| BP-49 | `immutable` 随实现变化 | 升级前后的 `immutable` | 新实现部署时写错代币地址 | 新实现的不可变量和代理的旧数据一致吗？ | 高 | [UPG-7](../10-upgradeable-proxy.md) |

</details>

<details><summary><strong>I. 拒绝服务（4 个）</strong></summary>

| 编号 | 模式 | 触发点 | 例子 | 要问 | 倾向 | 链接 |
|---|---|---|---|---|---|---|
| BP-50 | 无界循环 | `for` 遍历可由用户增长的数组 | `for (i; i < stakers.length; ...)` | 攻击者加入多少条目后，交易超过区块 gas 上限？ | 中 | [07](../07-external-calls-tokens.md) |
| BP-51 | 推送付款被卡住 | 循环内转账，失败即回滚 | 退款给合约，合约的 `receive` 回滚 | 一个收款方能卡住所有人吗？ | 中 | [EXT-5](../07-external-calls-tokens.md) |
| BP-52 | 除以可归零的值 | 除数是总量或余额 | `x / totalStaked` | 最后一个用户离开时，除数是 0 吗？ | 中 | [B30](B30-think-aloud.md) |
| BP-53 | 严格相等 | `require(balance == x)` | 捐赠 1 wei，等式失败 | 外部能让这个值偏离吗？ | 中 | [06](../06-arithmetic-precision.md) |

</details>

<details><summary><strong>J. MEV、滑点与期限（4 个）</strong></summary>

| 编号 | 模式 | 触发点 | 例子 | 要问 | 倾向 | 链接 |
|---|---|---|---|---|---|---|
| BP-54 | 零滑点保护 | `minOut`、`amountOutMin` 传 0，或在合约内计算 | `swap(a, 0, path)` | 夹击能拿走多少？ | 高 | [09](../09-mev-signatures.md) · [audit-frontrun](../interactive/audit-frontrun.html) |
| BP-55 | 无意义的期限 | `deadline: block.timestamp` | 打包时才赋值，永远通过 | 交易在内存池等待一周后，还会执行吗？ | 低 | [MEV-1](../09-mev-signatures.md) |
| BP-56 | 抢跑结算 | 一个公开动作改变下一个人的结算结果 | 收益入账前瞬间存入 | 抢在分配前进入、分配后退出，能分到收益吗？ | 高 | [DFI-6](../11-defi-economic-security.md) · [B30](B30-think-aloud.md) |
| BP-57 | 冷却期可预先触发 | 只在首次设置的时间戳 | `if (readyAt == 0) readyAt = now + d` | 先用极小金额排队，再追加大额，能跳过延迟吗？ | 高 | [B30](B30-think-aloud.md) |

</details>

<details><summary><strong>K. 治理（3 个）</strong></summary>

| 编号 | 模式 | 触发点 | 例子 | 要问 | 倾向 | 链接 |
|---|---|---|---|---|---|---|
| BP-58 | 按当前余额计票 | 投票权读取 `balanceOf` | 闪电贷投票 | 投票权取历史快照吗？ | 严重 | [DFI-5](../11-defi-economic-security.md) · [audit-governance](../interactive/audit-governance.html) |
| BP-59 | 时间锁可绕过 | 列出不经过 timelock 的特权路径 | 紧急函数能改同一参数 | 所有高权限路径都有延迟吗？ | 高 | [ACC-7](../05-access-control.md) |
| BP-60 | 法定人数可被稀释 | quorum 按当前总量计算 | 增发后法定人数变化 | 提案投票期间，总量能变化吗？ | 中 | [11](../11-defi-economic-security.md) |

</details>

<details><summary><strong>L. 跨链（4 个）</strong></summary>

| 编号 | 模式 | 触发点 | 例子 | 要问 | 倾向 | 链接 |
|---|---|---|---|---|---|---|
| BP-61 | 不验证来源 | 接收函数只查 `msg.sender == endpoint` | 忽略源链发送者 | 别的合约能通过同一端点发来消息吗？ | 严重 | [12](../12-cross-chain-bridges.md) · [CrossChain](../../practice-example-code/foundry/test/CrossChain.t.sol) |
| BP-62 | 消息重放 | 处理后没有 `processed[id]` | 同一证明提交两次 | 消息 ID 的字段包含源链和 nonce 吗？ | 严重 | [BRG-1](../12-cross-chain-bridges.md) |
| BP-63 | 跨链精度余数 | 两侧精度换算 | 18 位转 6 位，余数丢失 | 小数部分归谁？累积后账能对上吗？ | 中 | [ARI-7](../06-arithmetic-precision.md) |
| BP-64 | 目标链失败无恢复 | 接收逻辑回滚时没有重试路径 | 目标合约回滚，资金锁在桥上 | 失败后资金在哪里？谁能取回？ | 高 | [12](../12-cross-chain-bridges.md) |

</details>

<details><summary><strong>M. EVM 特性（5 个）</strong></summary>

| 编号 | 模式 | 触发点 | 例子 | 要问 | 倾向 | 链接 |
|---|---|---|---|---|---|---|
| BP-65 | 循环中使用 `msg.value` | `multicall` 配合 `payable`、`delegatecall` | `for (...) deposit(msg.value)` | 一份 ETH 被记账几次？ | 严重 | [03](../03-evm-solidity-basics.md) |
| BP-66 | 强制转入 ETH | `address(this).balance` 用于判断 | `require(address(this).balance == sum)` | `selfdestruct` 转入 ETH 不触发 `receive`，等式还成立吗？ | 中 | [03](../03-evm-solidity-basics.md) |
| BP-67 | 固定偏移读取 calldata | `calldataload(` 配合常量偏移 | 从 `0x44` 读内层选择器 | 编码方能把动态参数放到别的位置吗？ | 严重 | [Malformed 测试](../../practice-example-code/range/abi/test/Malformed.t.sol) |
| BP-68 | 用 `msg.data` 做唯一标识 | `keccak256(msg.data)` | 防重放标记取整段 calldata | 同一语义有多种编码吗？ | 高 | [Malformed 测试](../../practice-example-code/range/abi/test/Malformed.t.sol) |
| BP-69 | 移植到其他链 | `block.number`、`PUSH0`、预编译地址、原生币行为 | L2 的 `block.number` 含义不同 | 这条链的操作码和时间语义相同吗？ | 中 | [C 专题](../chains/) |

</details>

## 4. 动手：用触发点扫描靶场

在仓库根目录（`Web3-Security/` 的上一级）运行下面的命令。这是一次搜索签名、低级调用和冷却逻辑的扫描。

```bash
# -n 显示行号，-E 用扩展正则；一次搜多个触发点
grep -nE 'ecrecover|delegatecall|\.call\{?\(|exitReadyAt == 0' practice-example-code/range/thinkaloud/src/MooringPool.sol
```

实际输出：

```text
131:        if (b.exitReadyAt == 0) {
162:        address signer = ecrecover(digest, v, r, s);
```

现在只有两个候选位置。下一步是提问：

1. 第 162 行对应 BP-38、BP-39、BP-40。
2. 第 131 行对应 BP-57。

> 🧪 动手验证：先不读 [B30](B30-think-aloud.md)。对这两行回答"要问"一列，把判断写下来。然后到 B30 核对。

> 🧪 动手验证：打开 [severity-drill.html](../interactive/severity-drill.html)，练习给模式命中后的场景定级。

## 5. 外部资料

| 资料 | 用途 |
|---|---|
| [Solodit](https://solodit.cyfrin.io) | 搜索公开审计发现 |
| [weird-erc20](https://github.com/d-xo/weird-erc20) | 非标准代币行为清单 |
| [Solidity ABI 规范](https://docs.soliditylang.org/en/latest/abi-spec.html) | 编码规则 |

## 如果出错

| 现象 | 原因 | 处理 |
|---|---|---|
| `grep` 没有输出 | 不在仓库根目录 | 先 `cd` 到仓库根目录，再运行 |
| `grep: invalid` 报错 | 系统没有 `-E` 支持 | 使用 GNU 或 BSD 版 grep |
| 命中太多，读不完 | 搜索词太宽 | 限定到一个分组，再按外部入口排序 |
| 这张表里没有对应模式 | 表是有限的 | 从价值流入手，见 [B29](B29-why-audits-miss.md) |
| 折叠块没有展开 | 阅读器不渲染 `<details>` | 用手册的网页阅读版 |

## 过关标准

- [ ] 你不看表，能写出至少 8 种代币边界情况。
- [ ] 对 BP-29、BP-40、BP-57，你能各写出一条搜索命令或阅读线索。
- [ ] 你能在 `MooringPool.sol` 中，把至少 3 个候选位置转成测试问题。
- [ ] 你能说出 2 个"模式命中但漏洞不成立"的例子。

> 🪞 反思：你最近读过的合约里，哪个模式你从不检查？把它加进你的审计清单。

## 思考题

1. 合约用 `SafeERC20` 处理了所有转账。BP-13 到 BP-25 中，哪些问题仍然存在？
2. 同一个模式 BP-52（除以可归零的值）在两个合约中，一个定为高危，一个定为低危。这种差异合理吗？差异来自哪里？
3. 为什么 BP-67 中的绕过，不会被 Solidity 的高层解码器拦下？

下一章：[B29 为什么会漏掉漏洞](B29-why-audits-miss.md)
