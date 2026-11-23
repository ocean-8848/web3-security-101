# B21 第 4 次审计：FlashDesk

> 学习目标：完成本章后，你能——
> 1. 用 `forge inspect` 比较升级前后的存储布局，并指出冲突的槽位。
> 2. 按"影响 × 可能性 + 信任假设"给中心化风险定级。
> 3. 对范围外依赖写出"假设失效时会怎样"的发现。
>
> 前置知识：[10 可升级代理](../10-upgradeable-proxy.md)、[08 预言机与闪电贷](../08-oracle-flashloan.md)。
> 预计用时：5–7 小时。
> 交互实验：[storage-proxy-lab.html](../interactive/storage-proxy-lab.html) ｜ [oracle-manipulation-lab.html](../interactive/oracle-manipulation-lab.html)
> 靶场目录：`practice-example-code/range/flashdesk/`
> 最后核对：2026-11-10

> ⚠️ 警告：本章只在本地运行玩具合约。不要对任何真实在线合约尝试这些攻击。未经授权测试他人系统可能违法。发现真实漏洞时，走项目方的漏洞赏金或负责任披露渠道。

---

## 开场：同一份代码，升级后账本全空了

团队给 V2 加了一个变量。代码审查通过了，测试也通过了，因为测试部署的是全新的 V2。上线后，所有存款人的余额都读出 0，资金还在合约里，却没有人能取。

<details class="predict"><summary>🤔 先猜再看：只加一行变量声明，为什么会让余额变成 0？</summary>

代理合约的存储按槽位编号。新变量如果插在中间，后面每个变量都向后移动一个槽位。新代码去新槽位读旧数据，读到的是别的变量。第 4 步用工具把这件事看清楚。

</details>

> 🎯 打个比方：存储槽位像一排编号的储物柜。V1 约定 5 号柜放手续费、8 号柜放余额。V2 换了一张标签表，5 号柜贴"贷款上限"，所有后面的标签都错开一格。柜子里的东西没动，标签全错了。
>
> 比喻的局限：真实的映射（mapping）内容不在标号柜里，而在按哈希计算的位置。标号变了，哈希结果也全变，所以余额读出 0，而不是读到别人的余额。

## 1. 术语

| 术语 | 定义 |
|---|---|
| 代理（Proxy） | 保存状态的合约。它用 `delegatecall` 执行实现合约的代码。 |
| 实现（Implementation） | 只提供代码的合约。升级就是更换它。 |
| 存储布局（Storage Layout） | 每个状态变量对应的槽位编号和偏移量。 |
| 存储冲突（Storage Collision） | 新旧实现对同一槽位的含义不一致。 |
| 现货价格（Spot Price） | 由池子当前余额算出的价格。一笔交易内可被改变。 |
| 中心化风险（Centralization Risk） | 单个特权账户可以单方面损害用户的风险。 |

## 2. 范围与简报

打开 `practice-example-code/range/flashdesk/README.md`，读范围表和部署流程。**不要打开 `test/` 和 `solution/`。**

审计范围：`FlashDesk.sol`、`FlashDeskV2.sol`、`FlashDeskProxy.sol`、`SpotPool.sol`。

合作方的奖励合约（`IRewardsSink`）不在范围内。团队说它"可信"。这句话本身就是一个需要检查的假设。

## 3. 第一步：构建靶场

```bash
cd practice-example-code/range/flashdesk  # 从 web3-security-101/ 出发，进入 FlashDesk 靶场目录
forge build # 编译全部合约
```

预期输出包含这一行：

```text
Compiler run successful!
```

编译输出之后还会出现 forge-lint 的 `note` 和 `warning` 风格提示。它们不是编译错误。

## 4. 第二步：比较存储布局

先看 V1 的布局。

```bash
# 打印 V1 存储布局：变量、类型、槽位、偏移
forge inspect FlashDesk storage-layout
```

预期输出（节选）：

```text
| rewards       | contract IRewardsSink       | 4    | 0      | 20    | src/FlashDesk.sol:FlashDesk |
| feeBps        | uint256                     | 5    | 0      | 32    | src/FlashDesk.sol:FlashDesk |
| totalShares   | uint256                     | 6    | 0      | 32    | src/FlashDesk.sol:FlashDesk |
| shares        | mapping(address => uint256) | 8    | 0      | 32    | src/FlashDesk.sol:FlashDesk |
```

表格很长，不适合用眼睛比较。下面这条命令只输出 `槽位 偏移 变量名`，然后做 diff。它需要 `jq` 和 zsh 或 bash。

```bash
# 定义函数 L：只输出“槽位 偏移 变量名”
L(){ forge inspect "$1" storage-layout --json | jq -r '.storage[] | "\(.slot) \(.offset) \(.label)"'; }
# 逐行比较 V1 与 V2 的布局，差异即升级风险
diff <(L FlashDesk) <(L FlashDeskV2)
```

实际输出：

```text
7,13c7,14
< 5 0 feeBps
< 6 0 totalShares
< 7 0 totalDeposits
< 8 0 shares
< 9 0 collateralOf
< 10 0 debtOf
< 11 0 lock
---
> 5 0 maxFlashBps
> 6 0 feeBps
> 7 0 totalShares
> 8 0 totalDeposits
> 9 0 shares
> 10 0 collateralOf
> 11 0 debtOf
> 12 0 lock
```

**读图要点：**

- 安全的升级，diff 只有 `>` 行，而且都在末尾。
- 这里 7 行 `<` 全部被改写。这是冲突的直接证据。
- `feeBps` 从 5 号槽移到 6 号槽，会读到旧的 `totalShares`。
- 这个方法的局限：它只比较名字和位置。类型变化也要看，把 jq 表达式加上 `\(.type)` 即可。

> 🧪 动手验证：打开 [storage-proxy-lab.html](../interactive/storage-proxy-lab.html)，在中间插入一个变量，观察后续槽位的变化。把结果和上面的 diff 对照。

## 5. 第三步：中心化风险怎么定级

中心化问题的影响几乎总是"全部资金"。如果只看影响，每个带 owner 的合约都是 Critical。这样的报告没有用。

用下面的流程定级：

| 问题 | 回答 | 对定级的作用 |
|---|---|---|
| 特权账户单方面能做什么？ | 列出最坏动作 | 决定影响 |
| 有延迟吗？用户来得及退出吗？ | 时间锁时长 | 决定用户有没有退路 |
| 谁持有权限？ | EOA / 多签 / DAO | 决定可能性 |
| 项目是否公开声明了这一信任？ | 文档、README | 决定是发现还是已知假设 |

经验规则（本手册的约定，不是行业标准）：

| 情况 | 建议定级 |
|---|---|
| 单 EOA，无延迟，可直接取走用户资金 | Medium，并在报告中明确写出信任假设 |
| 多签，有时间锁，用户可退出 | Low 或 Informational |
| 权限超出文档声明，或普通用户可以取得 | 不算中心化问题，按权限漏洞定级（通常 High 以上） |

> 💡 注意：竞赛平台的规则不同。部分比赛把 owner 恶意行为定为无效发现。提交前先读该比赛的规则。私人审计通常要求写出，并由客户决定是否接受风险。

## 6. 第四步：独立审计

用时盒 3 小时。按检查项族走一遍：`UPG`（升级）、`ACC`（权限）、`ORA`（预言机）、`EXT`（外部依赖）。

按下面的格式记录每个发现：编号、严重性、位置、影响、PoC 思路、修复建议。

### 分阶段提示

卡住超过 30 分钟再展开。每个发现按顺序展开，不要跳级。

**发现 1**

<details class="predict"><summary>🤔 提示 1</summary>

读 README 的部署流程。第 2 步和第 3 步之间发生了什么？

</details>

<details class="predict"><summary>🤔 提示 2</summary>

`initialize` 检查了调用者吗？代理部署后，谁都能看到这笔交易。

</details>

<details class="predict"><summary>🤔 发现</summary>

FD-UPG-4：攻击者抢先调用 `initialize`，成为 owner。

</details>

**发现 2**

<details class="predict"><summary>🤔 提示 1</summary>

第 4 节的 diff 已经给出了证据。接着算：升级后 `shares(alice)` 读的是哪个槽？

</details>

<details class="predict"><summary>🤔 发现</summary>

FD-UPG-2：V2 在 `rewards` 后插入 `maxFlashBps`，后续槽位整体后移。

</details>

**发现 3**

<details class="predict"><summary>🤔 提示 1</summary>

`maxBorrow` 的价格来自哪里？这个价格在一笔交易内能变吗？

</details>

<details class="predict"><summary>🤔 提示 2</summary>

`flashLoan` 有重入锁，`borrow` 有吗？回调里能做什么？

</details>

<details class="predict"><summary>🤔 发现</summary>

FD-ORA-1：闪电贷拉高现货价，在回调中按虚高价借款。

</details>

**发现 4**

<details class="predict"><summary>🤔 提示 1</summary>

`initialize` 最后一行给了合作方什么？额度是多少？

</details>

<details class="predict"><summary>🤔 提示 2</summary>

如果合作方的钥匙泄露，或者它的合约被升级，后果是什么？这个后果在我们的审计范围内吗？

</details>

<details class="predict"><summary>🤔 发现</summary>

FD-EXT-1：对范围外合约的无限授权，让"合作方可信"变成全部资金的单点假设。

</details>

**发现 5、6、7**

<details class="predict"><summary>🤔 提示</summary>

用第 5 节的流程看 `upgradeTo` 和 `setFeeBps`。再找一找：实现合约自身能被初始化吗？管理函数发事件了吗？

</details>

<details class="predict"><summary>🤔 发现</summary>

FD-ACC-7（单钥匙无延迟升级、费率无上限）、FD-UPG-3（实现合约未锁定）、FD-EVT（管理操作无事件）。

</details>

## 7. 发现清单

| 编号 | 严重性 | 标题 | 检查项 |
|---|---|---|---|
| FD-UPG-4 | High | 初始化可被抢跑 | UPG-4、ACC-3 |
| FD-UPG-2 | High | V2 存储冲突导致存款人仓位丢失 | UPG-2 |
| FD-ORA-1 | High | 现货价格被闪电贷操纵，产生坏账 | ORA-1、ORA-2 |
| FD-ACC-7 | Medium | 单钥匙无延迟升级，费率无上限 | ACC-7、UPG-8 |
| FD-EXT-1 | Medium（有条件） | 对范围外合约的无限授权 | EXT 族 |
| FD-UPG-3 | Low | 实现合约可被直接初始化 | UPG-3 |
| FD-EVT | Low | 管理操作不发事件 | 无对应编号 |

`FD-EVT` 没有对应的手册检查项编号，所以只用目标前缀。

## 8. 验证：运行 PoC

审计完成后再运行。

```bash
forge test # 运行全部 PoC 和修复测试
```

实际输出：

```text
Ran 7 tests for test/PoC.t.sol:FlashDeskFixTest
[PASS] test_fix_adminChangesEmitEvents() (gas: 28319)
[PASS] test_fix_borrowUsesFeedNotSpot() (gas: 162807)
[PASS] test_fix_implementationLocked() (gas: 2327617)
[PASS] test_fix_initializeCannotBeFrontrun() (gas: 34153)
[PASS] test_fix_partnerHasNoAllowance() (gas: 13234)
[PASS] test_fix_upgradeKeepsLayout() (gas: 2421481)
[PASS] test_fix_upgradeNeedsDelayAndFeeCapped() (gas: 2426671)
Suite result: ok. 7 passed; 0 failed; 0 skipped

Ran 8 tests for test/PoC.t.sol:FlashDeskPoC
[PASS] test_FD_ACC_7_feeHasNoCap() (gas: 2317768)
[PASS] test_FD_ACC_7_ownerInstantRug() (gas: 2533012)
[PASS] test_FD_EVT_adminChangesEmitNothing() (gas: 4197255)
[PASS] test_FD_EXT_1_compromisedDependencyDrains() (gas: 2532988)
[PASS] test_FD_ORA_1_spotOracleManipulation() (gas: 3632582)
[PASS] test_FD_UPG_2_storageCollision() (gas: 4358564)
[PASS] test_FD_UPG_3_implementationNotLocked() (gas: 2056740)
[PASS] test_FD_UPG_4_frontrunInitialize() (gas: 2513234)
Suite result: ok. 8 passed; 0 failed; 0 skipped
```

> 💡 注意：PoC 测试"通过"表示攻击成功。`FixTest` 通过表示修复版挡住了攻击。gas 数字会随工具版本变化。

看一下操纵攻击的数字：

```bash
forge test --match-test ORA -vv # 只跑名字含 ORA 的测试；-vv 打印日志
```

实际输出（节选）：

```text
  attacker profit: 2420.000000000000000001
  unpaid debt: 27440.000000000000000000
  collateral at fair price: 20000.000000000000000000
```

验证修复版的布局只在末尾追加：

```bash
# 修复版：V2 应只在 V1 末尾追加变量
diff <(L FlashDeskFixed) <(L FlashDeskV2Fixed)
```

实际输出：

```text
15a16
> 14 0 maxFlashBps
```

## 9. 模型报告

下面是一份可以直接提交的完整报告。把你的报告和它对比。

````markdown
# FlashDesk 安全审计报告

| 项目 | 内容 |
|---|---|
| 审计对象 | FlashDesk V1、V2、代理、SpotPool |
| 方法 | 人工审查、存储布局比对、Foundry PoC |
| 发现 | High 3、Medium 2、Low 2 |

## 范围与假设

范围：`src/FlashDesk.sol`、`src/FlashDeskV2.sol`、`src/FlashDeskProxy.sol`、`src/SpotPool.sol`。
范围外：`IRewardsSink` 的实现。本报告把"合作方合约诚实"列为假设，并在 FD-EXT-1 中说明假设失效的后果。
owner 按团队部署流程是单个 EOA。

## [H-1] FD-UPG-4：初始化可被抢跑

**位置**：`FlashDesk.sol:47`（`initialize`）、README 部署流程第 2–3 步。

**描述**：代理部署和初始化分属两笔交易。`initialize` 不检查调用者。

**影响**：攻击者抢先初始化后成为 owner。存款进入后，攻击者把实现升级为后门合约，并转走全部资金。PoC 中攻击者取走 100,000 代币。

**PoC**：`test_FD_UPG_4_frontrunInitialize`。

**修复**：代理构造函数接收初始化数据，在同一笔交易内用 `delegatecall` 执行初始化。

## [H-2] FD-UPG-2：V2 存储冲突导致存款人仓位丢失

**位置**：`FlashDeskV2.sol`，`maxFlashBps` 声明处。

**描述**：V2 在 `rewards` 与 `feeBps` 之间插入新变量。5 号槽以后的变量全部后移 1 个槽位。

**证据**：`diff <(L FlashDesk) <(L FlashDeskV2)` 显示槽位 5–11 全部改变。

**影响**：升级后 `shares(alice)` 从 100,000e18 变成 0，`withdraw` 回滚。`feeBps` 读到旧 `totalShares`，闪电贷手续费失效。资金留在合约内，用户无法提取。

**PoC**：`test_FD_UPG_2_storageCollision`。

**修复**：只在末尾追加变量。把存储布局比对加入 CI。

## [H-3] FD-ORA-1：现货价格被闪电贷操纵，产生坏账

**位置**：`FlashDesk.sol:129`（`maxBorrow`）、`:134`（`borrow`）。

**描述**：借款额度使用 `SpotPool.price()`。这个价格在一笔交易内可变。`borrow` 没有重入锁，可在闪电贷回调中调用。

**影响**：示例场景中，攻击者零本金获利约 2,420 代币，留下 27,440 债务，抵押品按公允价值只值 20,000。协议净坏账约 7,440 代币。攻击可重复。

**PoC**：`test_FD_ORA_1_spotOracleManipulation`。

**修复**：改用带时效校验的外部喂价或 TWAP。给 `borrow` 加重入锁。

## [M-1] FD-ACC-7：单钥匙无延迟升级，费率无上限

**位置**：`FlashDesk.sol:76`（`upgradeTo`）、`:68`（`setFeeBps`）。

**描述**：单个 EOA 可在一笔交易内替换实现并取走资金。`setFeeBps` 没有上限。

**定级依据**：影响为全部资金，但需要特权账户作恶或被盗，所以可能性按中评估。团队的部署文档已声明 owner 为单 EOA，因此定为 Medium，并作为明确的信任假设。

**PoC**：`test_FD_ACC_7_ownerInstantRug`、`test_FD_ACC_7_feeHasNoCap`。

**修复**：owner 改为多签；升级加 48 小时时间锁；费率设置上限。

## [M-2] FD-EXT-1：对范围外合约的无限授权

**位置**：`FlashDesk.sol:63`。

**描述**：`initialize` 给 `rewards` 无限授权。合作方合约不在审计范围内。

**定级依据**：触发条件是范围外合约被攻破或作恶，所以是有条件发现，不定为 High。修复完全在范围内，所以应当报告。

**影响**：合作方合约一旦被攻破，可转走柜台全部资产。

**PoC**：`test_FD_EXT_1_compromisedDependencyDrains`。

**修复**：删除长期授权。每次按实际分成金额转账。

## [L-1] FD-UPG-3：实现合约可被直接初始化

**位置**：`FlashDesk.sol:47`。

**描述**：实现合约没有在构造函数中禁用初始化。任何人可以成为实现合约的 owner。

**影响**：本合约中，实现合约不被代理之外的逻辑使用，所以没有资金影响。若以后增加 `delegatecall` 或自毁路径，风险会上升。

**修复**：在构造函数中锁定初始化。

## [L-2] FD-EVT：管理操作不发事件

**位置**：`setFeeBps`、`setOracle`、`upgradeTo`。

**影响**：监控系统看不到费率、预言机和实现的变化。EIP-1967 建议（SHOULD）在实现变更时发出 `Upgraded` 事件。

**PoC**：`test_FD_EVT_adminChangesEmitNothing`。

**修复**：为每个管理操作发事件，包含旧值和新值。

## 附加观察（未定级）

- 合约没有清算逻辑和利息逻辑，坏账没有处置路径。
- 合作方不拉取分成时，分成金额滞留在合约内。
- 合约没有转移 owner 的函数。
````

## 10. 复盘表

| 我的发现 | 模型报告对应项 | 定级差异 | 原因 |
|---|---|---|---|
| | | | |

## 如果出错

| 现象 | 原因 | 解决 |
|---|---|---|
| `forge-std/Test.sol` 找不到 | 符号链接断开或目录被移动 | 在 `web3-security-101/` 目录运行 `bash practice-example-code/setup.sh` |
| `jq: command not found` | 没有安装 jq | macOS 运行 `brew install jq` |
| `diff <(...)` 语法错误 | 当前 shell 是 sh | 运行 `bash` 后重新定义 `L` 函数 |
| `forge inspect` 输出的 JSON 没有 `.storage` | Foundry 版本较旧 | 运行 `foundryup`。本章使用 forge 1.5.1 |
| PoC 失败 | 你改动了 `src/` | 还原 `src/` 后重新运行 |

## 过关标准

- [ ] 独立找到至少 5 个发现，其中包含全部 3 个 High。
- [ ] 能解释 diff 输出中每一行的含义。
- [ ] `forge test` 显示 15 个测试全部通过。
- [ ] 报告中的 FD-ACC-7 写明了信任假设和定级依据。
- [ ] 报告中的 FD-EXT-1 写明了假设失效的后果。

> 🪞 反思：想一个你用过或关注的协议。它的文档有没有写清谁能升级合约、延迟多久？如果 owner 钥匙今晚被盗，用户有多少时间退出？

## 思考题

1. 把 V2 的 `maxFlashBps` 移到合约变量的最后一行。`diff` 输出会变成什么？这样修改后，V2 就完全安全了吗？
2. FD-EXT-1 的合作方合约不在审计范围内。为什么仍然要写这个发现？什么情况下应该把它降为 Informational？
3. 如果把 `FlashDesk` 的预言机换成 30 分钟 TWAP，FD-ORA-1 就彻底消除了吗？还要考虑什么？
