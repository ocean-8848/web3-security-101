# B13 第 1 次审计：NoteBox

> 学习目标：做完本章，你能——
> 1. 独立走完一次最小审计：范围 → 笔记 → 发现 → PoC → 报告。
> 2. 解释 `private` 为什么不等于保密，并亲手从存储槽读出一条"私密"笔记。
> 3. 用覆盖率回答"我审完了吗"，并说出覆盖率不能证明什么。
>
> 前置章节：[B09 读代码与攻击者思维](B09-reading-code-mindset.md)（审计的最小流程与 5 个术语）、[B12 Foundry 进阶](B12-foundry-advanced.md)（读存储、PoC 骨架）
> 预计用时：2–3 小时。
> 靶场：[code/ranges/notebox/](../../code/ranges/notebox/README.md)
> 关联章节：[05 访问控制](../chapters/05-access-control.md)｜[03 EVM 与 Solidity 安全基础](../chapters/03-evm-solidity-basics.md)｜[A02 风险定级与报告](../assessment/A02-risk-rating-reporting.md)｜[T03 发现报告模板](../templates/T03-finding-report.md)｜[B25 实战项目](B25-capstone-minilend.md)
> 最后核对：2026-11-10（forge 1.5.1、anvil、cast 均在本地运行过；下文输出来自真实运行）

> ⚠️ 警告：法律与道德边界。本章只审计你本机上的玩具合约。未经书面授权，不要对任何真实合约做测试或攻击，也不要读取、公开他人的链上数据用于牟利。漏洞赏金只在项目方公开的范围内进行。

---

## 开场：一个写着"只有我能看"的笔记本

朋友做了一本链上笔记本。朋友说："这条笔记是 `private`，还加了 `onlyOwner`。别人看不到。"

朋友请你审一下。合约只有 54 行有效代码。你从没审过合约。

<details class="predict"><summary>🤔 先猜再看：合约变量标记为 private，部署到公链后，外部的人能读到它的值吗？</summary>

能。`private` 只限制**其他合约的 Solidity 代码**访问这个变量。所有节点都保存完整状态。任何人都能读任何存储槽。第 5 步你会亲手读出来。

</details>

> 🎯 打个比方：第一次审计像第一次验房。你不用会盖楼。你要有一张清单，逐个房间看，并且把每个问题拍照。
>
> 比喻的局限：房子不会反击。合约的攻击者会主动寻找清单之外的路径。

## 1. 审计是什么

审计的定义、范围、nSLOC、发现、PoC、覆盖率 5 个词，以及最小审计流程，见 [B09 第 1 节](B09-reading-code-mindset.md)。本章按那张流程图走完全程：定范围 → 读文档和代码 → 提出疑点 → 写 PoC → 覆盖率检查 → 报告。

## 2. 第 1 步：准备环境

1. 打开终端。
2. 进入靶场目录。路径以 `web3-security-101/` 目录（学习仓库根目录）为起点：

```bash
cd code/ranges/notebox  # 从 web3-security-101/ 出发，进入 NoteBox 靶场
```

3. 编译：

```bash
forge build  # 先确认靶场能编译
```

预期输出包含这一行（之后还有 forge-lint 的 note 提示，不是错误）：

```text
Compiler run successful!
```

> 💡 注意：第一遍审计时，只打开 `README.md` 和 `src/NoteBox.sol`。`test/PoC.t.sol`、`solution/` 和本章的折叠块都含答案。

## 3. 第 2 步：定范围

报告的第一件事是写清楚你审了什么。新建一个 `notes.md`，放在靶场目录外的任意位置，写入：

```markdown
# NoteBox 审计笔记
- 范围：src/NoteBox.sol
- 不在范围内：test/、lib/、部署脚本、前端
- 编译器：Solidity 0.8.30（foundry.toml）；pragma 是 ^0.8.20
- 代码量：54 nSLOC（aderyn 统计）
- 文档：README.md "协议说明"
```

运行下面的命令，取得代码指纹。真实审计里，指纹把报告绑定到一个具体版本。

```bash
# 算文件的 SHA-256 指纹，把报告绑定到这个版本
shasum -a 256 src/NoteBox.sol
```

输出是一个 64 位十六进制串和文件名。把它写进笔记。

## 4. 第 3 步：读文档，写下"承诺"

逐句读 `README.md` 的协议说明。把每句话改写成一个可以验证的承诺。

| 编号 | 文档的承诺 | 验证方法 |
|---|---|---|
| P1 | 只有 owner 能修改秘密笔记 | 用陌生地址调用修改函数，预期回滚 |
| P2 | 只有 owner 能读取秘密笔记 | 不用 getter，尝试其他读取途径 |
| P3 | owner 每 24 小时最多修改一次 | 改一次，过一段时间再改，看几小时后能成功 |
| P4 | 只有 owner 能提取打赏 | 陌生地址调用，预期回滚 |
| P5 | 最低打赏 0.001 ETH | 发送 1 wei，预期回滚 |

> 💡 注意：**文档和代码不一致，本身就是发现。** 用户依据文档作决定。

## 5. 第 4 步：读代码，列入口

现在打开 `src/NoteBox.sol`。先不找 bug，先建表。列出每个可以从外部调用的函数。

| 函数 | 改状态？ | 收 ETH？ | 权限 | 我的疑点 |
|---|---|---|---|---|
| `setSecret` | 是 | 否 | ？ | |
| `getSecret` | 否 | 否 | `onlyOwner` | |
| `setPublicNote` | 是 | 否 | `onlyOwner` | |
| `tip` | 是 | 是 | 任何人 | |
| `withdrawTips` | 是 | 发 ETH | `onlyOwner` | |

请你自己把"权限"和"疑点"两列填完。再把 P1–P5 逐条和代码对照。下面是分阶段提示。先自己想 15 分钟，再逐级打开。

### 发现 NB-01 的提示

<details class="predict"><summary>🤔 提示 1：入口表中，哪一行的"改状态"和"权限"放在一起看最奇怪？</summary>

看入口表的第一行。把它和 `setPublicNote` 的函数声明逐词对比。

</details>

<details class="predict"><summary>🤔 提示 2：两个函数声明差了哪个词？</summary>

`setPublicNote(...) external onlyOwner`，`setSecret(...) external`。NatSpec 注释写了"Only the owner can do this"。注释不执行，修饰符才执行。

</details>

<details class="predict"><summary>🤔 完整发现：NB-01 缺少访问控制（检查项 ACC-1）</summary>

```solidity
// ❌ 漏洞：任何地址都能调用
// 根因：声明里没有 onlyOwner
function setSecret(string calldata newSecret) external {
```

任何人都能覆盖 owner 的秘密笔记。攻击者还会重置 `lastEdit`，让 owner 在冷却期内无法改回。详见第 8 节报告。

</details>

### 发现 NB-02 的提示

<details class="predict"><summary>🤔 提示 1：P2 说"只有 owner 能读"。getter 有 onlyOwner，这就够了吗？</summary>

`onlyOwner` 只拦住**调用这个 getter** 的人。问题是：数据本身存放在哪里？谁能看到那里？

</details>

<details class="predict"><summary>🤔 提示 2：secretNote 存在第几个存储槽？</summary>

运行 `forge inspect NoteBox storageLayout`。`secretNote` 在第 2 槽。公链节点对外提供 `eth_getStorageAt`，任何人都能读任何槽。

</details>

<details class="predict"><summary>🤔 完整发现：NB-02 私密数据公开可读（检查项 ACC-1 延伸；参见 03 章存储布局）</summary>

```solidity
// ❌ 漏洞：private 不提供保密性
string private secretNote;  // 根因：数据仍以明文存在第 2 槽
```

原文还出现在部署交易和 `setSecret` 交易的 calldata 中。修复不能靠改关键字。修复必须在链下加密，链上只存密文。第 8 节有完整修复建议。

</details>

### 发现 NB-03 的提示

<details class="predict"><summary>🤔 提示 1：把 P3 的数字和代码里的常量对一下。</summary>

找到 `EDIT_COOLDOWN` 的定义。注释写的时长和代码写的时长一样吗？

</details>

<details class="predict"><summary>🤔 提示 2：1 hours 是多少秒？24 小时是多少秒？</summary>

`1 hours` 是 3,600 秒。文档要求 86,400 秒。Solidity 的时间单位是字面量，编译器不会检查它和注释是否一致。

</details>

<details class="predict"><summary>🤔 完整发现：NB-03 文档与代码不一致（检查项 ARI-8 的同类错误：常数改动未同步）</summary>

```solidity
/// @notice The owner can edit the secret note at most once every 24 hours.
// 根因：数值与 NatSpec 的 24 小时不符
uint256 public constant EDIT_COOLDOWN = 1 hours; // ❌ 漏洞：代码是 1 小时
```

</details>

## 6. 第 5 步：写 PoC，把疑点变成证据

疑点不是发现。能运行的 PoC 才把疑点变成发现。

### 6.1 Foundry 测试的三个工具

| 写法 | 作用 |
|---|---|
| `makeAddr("name")` | 生成一个带标签的测试地址 |
| `vm.prank(addr)` | 下一次外部调用的 `msg.sender` 变成 `addr` |
| `vm.warp(t)` | 把区块时间设为 `t` |

### 6.2 自己先写 NB-01 的 PoC

1. 新建 `test/MyPoC.t.sol`，内容如下：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {NoteBox} from "../src/NoteBox.sol";

contract MyPoC is Test {
    NoteBox box;  // 被审合约实例
    address owner = makeAddr("owner");  // 合约主人
    address stranger = makeAddr("stranger");  // 攻击者：一个毫无权限的地址

    function setUp() public {  // 每个测试前都会重新运行
        vm.warp(1_000_000);  // 把区块时间设到一个固定值
        vm.prank(owner);  // 下一次调用（部署）以 owner 身份发出
        box = new NoteBox("my diary password");  // owner 部署并写入初始秘密
    }

    function test_StrangerOverwritesSecret() public {
        vm.prank(stranger);  // 步骤 1：切换成陌生人
        box.setSecret("hacked");  // 步骤 2：陌生人改写秘密，没有回滚

        vm.prank(owner);  // 步骤 3：owner 读取，确认已被覆盖
        assertEq(box.getSecret(), "hacked");  // 断言通过 = 攻击成功
    }
}
```

2. 运行：

```bash
forge test --match-contract MyPoC -vv  # 只跑你的 PoC；-vv 显示日志
```

3. 预期输出中有：

```text
[PASS] test_StrangerOverwritesSecret()
```

> 💡 注意：测试**通过**表示攻击**成功**。PoC 里的断言描述的是"坏事发生了"。

### 6.3 不用 getter 读出 NB-02 的秘密

这一步在本机的测试链 Anvil 上做。Anvil 是 Foundry 自带的本地链，数据只在你的电脑上。

1. 打开第二个终端窗口，启动本地链：

```bash
anvil --port 18545  # 在 18545 端口启动本地链
```

2. 回到第一个终端，部署合约。下面的私钥是 Anvil 公开的默认测试私钥，只用于本地：

```bash
# 部署 NoteBox；\ 表示命令换行继续
forge create src/NoteBox.sol:NoteBox --broadcast \
  --rpc-url http://127.0.0.1:18545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --constructor-args "my diary password"
```

预期输出：

```text
Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

3. 以陌生人身份调用 getter：

```bash
# 以陌生人身份调用 getter，预期被 onlyOwner 拦下
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 'getSecret()(string)' --rpc-url http://127.0.0.1:18545
```

预期结果是回滚。getter 的权限检查有效：

```text
Error: server returned an error response: error code 3: execution reverted: custom error 0x30cd7471
```

4. 查看存储布局：

```bash
forge inspect NoteBox storageLayout  # 打印每个状态变量所在的存储槽
```

输出显示 `secretNote` 的 Slot 是 `2`。

5. 直接读第 2 槽：

```bash
# 绕过 getter，直接读第 2 槽的原始数据
cast storage 0x5FbDB2315678afecb367f032d93F642f64180aa3 2 --rpc-url http://127.0.0.1:18545
```

预期输出：

```text
0x6d792064696172792070617373776f7264000000000000000000000000000022
```

6. 解码。短字符串（31 字节以内）的内容放在高位，最低字节等于"长度 × 2"。`0x22` 是 34，所以长度是 17。

```bash
# 把高位的 17 字节内容解码成文字
cast to-ascii 0x6d792064696172792070617373776f7264
```

预期输出：

```text
my diary password
```

7. 在第二个终端按 `Ctrl+C` 关闭 Anvil。

> 🧪 动手验证：把部署时的字符串改成 40 个字符，重新部署，再读第 2 槽。记录你看到的值。长字符串的内容存在 `keccak256(2)` 开始的槽里，第 2 槽只存"长度 × 2 + 1"。

### 6.4 运行全部 PoC

```bash
forge test --match-path test/PoC.t.sol  # 只运行官方 PoC 文件
```

预期输出的最后一行：

```text
Ran 2 test suites ...: 6 tests passed, 0 failed, 0 skipped (6 total tests)
```

6 个测试中，3 个证明漏洞存在（`test_NB0x_...`），3 个证明修复有效（`test_Fix_NB0x_...`）。

## 7. 第 6 步："我审完了吗？"用覆盖率检查

你找到了 3 个问题。你审完了吗？

<details class="predict"><summary>🤔 先猜再看：只跑 PoC 时，NoteBox 的行覆盖率是多少？覆盖率 100% 能说明没有 bug 吗？</summary>

只跑 PoC 时只有 38.46%。下面的命令会显示。覆盖率 100% **不能**说明没有 bug。NB-01 就是例子：修复前 PoC 能执行到 `setSecret` 的每一行，bug 仍然存在，因为 bug 是"缺少一行代码"。覆盖率只能告诉你**哪里你肯定没看过**。

</details>

1. 只统计 PoC 的覆盖率：

```bash
# 只用 PoC 统计覆盖率，排除测试和答案目录
forge coverage --match-path test/PoC.t.sol --no-match-coverage "(test|solution)"
```

预期输出：

```text
| src/NoteBox.sol | 38.46% (10/26) | 30.77% (8/26) | 0.00% (0/5) | 42.86% (3/7) |
```

四列分别是行、语句、分支、函数。最后一列的 42.86% 表示 7 个函数里只有 3 个被执行过。

2. 问自己：`tip`、`withdrawTips`、`setPublicNote` 我测过吗？它们的回滚分支测过吗？

3. 打开 `test/Coverage.t.sol`。这个文件补上了打赏、提款和权限拒绝的路径。

4. 统计全部测试：

```bash
# 用全部测试统计覆盖率
forge coverage --no-match-coverage "(test|solution)"
```

预期输出：

```text
| src/NoteBox.sol | 100.00% (26/26) | 96.15% (25/26) | 80.00% (4/5) | 100.00% (7/7) |
```

5. 找出剩下的 1 个分支。它是 `withdrawTips` 里 `if (!ok) revert TransferFailed()`。要触发它，owner 必须是拒收 ETH 的合约。这个分支只影响 owner 自己，所以你把它记入笔记，不写成发现。

现在回答"审完了吗"。用下面的清单：

- [ ] 文档的每条承诺（P1–P5）都有结论。
- [ ] 入口表的每一行都填完了。
- [ ] 每个疑点要么有 PoC，要么写明了排除原因。
- [ ] 覆盖率报告的每个盲区，都有解释。

> 💡 注意：真实审计永远不能证明"没有漏洞"。报告只陈述"在这个范围和时间内，我们发现了这些问题"。

## 8. 第 7 步：写第一份报告

### 8.1 严重性怎么定

严重性（Severity）由影响和可能性决定。本章使用 [A02 第 2 节](../assessment/A02-risk-rating-reporting.md) 的矩阵。你也可以打开[评级计算器](../interactive/severity-calculator.html)核对。例如 NB-03：影响低（没有资金风险），可能性高（每轮都存在），按矩阵为 Low。

### 8.2 发现清单

| 编号 | 标题 | 严重性 | 检查项 |
|---|---|---|---|
| NB-01 | `setSecret` 缺少访问控制 | High | ACC-1 |
| NB-02 | "私密"笔记可被任何人读取 | High | ACC-1（延伸） |
| NB-03 | 冷却时间 1 小时，文档写 24 小时 | Low | ARI-8 |

### 8.3 完整示范报告

下面是你的第一份报告的完整样子。一份好的发现，让没参加审计的人也能复现。

````markdown
# NoteBox 安全审计报告

- 版本：src/NoteBox.sol（记录审计时的 SHA-256）
- 审计日期：2026-11-10
- 方法：人工审查、Foundry PoC、覆盖率检查
- 声明：本报告只陈述在上述范围和时间内发现的问题，不保证没有其他漏洞。

## 摘要

| 严重性 | 数量 |
|---|---|
| High | 2 |
| Low | 1 |

## [H-01] 任何地址都能修改秘密笔记（NB-01）

**位置**：`src/NoteBox.sol` `setSecret()`

**描述**：文档和 NatSpec 都规定只有 owner 能修改秘密笔记。函数缺少 `onlyOwner` 修饰符。

**影响**：任何地址都能永久覆盖笔记。攻击者每次修改都会重置 `lastEdit`，因此也能阻止 owner 修改。

**PoC**：`test/PoC.t.sol::test_NB01_StrangerOverwritesSecret`

```bash
forge test --match-test test_NB01 -vv
```

**建议**：为函数加上 `onlyOwner`。

```solidity
function setSecret(bytes calldata newCiphertext) external onlyOwner { // ✅ 修复
```

## [H-02] "私密"笔记可被任何人读取（NB-02）

**位置**：`src/NoteBox.sol` `secretNote`（第 2 存储槽）、构造函数、`setSecret()`

**描述**：`private` 只阻止其他合约通过 Solidity 访问变量。链上存储和交易 calldata 对所有人公开。

**影响**：文档的核心承诺"其他人不能知道内容"不成立。任何人都能用 `eth_getStorageAt` 读出笔记。

**PoC**：`test/PoC.t.sol::test_NB02_AnyoneReadsPrivateNote`，以及 `cast storage <addr> 2`。

**建议**：不要在链上存储明文。owner 在链下加密，链上只存密文。如果笔记已上链，把旧内容视为已泄露。

## [L-01] 冷却时间与文档不一致（NB-03）

**位置**：`src/NoteBox.sol` `EDIT_COOLDOWN`

**描述**：README 和 NatSpec 规定 24 小时，常量值是 `1 hours`。

**影响**：owner 的修改频率比文档允许的高 24 倍。没有资金风险，但用户依赖文档的假设不成立。

**PoC**：`test/PoC.t.sol::test_NB03_CooldownIsOneHourNotOneDay`

**建议**：把常量改为 `24 hours`，并在测试中固定这个值。

## 修复复查

`solution/NoteBoxFixed.sol` 修复了全部 3 项。复查证据：`test/PoC.t.sol::NoteBoxFixTest`（3 个测试通过）。
````

> 🪞 反思：回想你写过或用过的一个"权限"功能。它的权限检查，是写在数据旁边，还是只写在入口上？如果有人绕过入口，数据还安全吗？

## 9. 如果出错

| 现象 | 原因 | 处理 |
|---|---|---|
| `forge: command not found` | 没有安装 Foundry | 运行 `curl -L https://foundry.paradigm.xyz \| bash`，然后运行 `foundryup` |
| `Source "forge-std/Test.sol" not found` | `lib/forge-std` 软链接失效 | 在 `web3-security-101/` 目录运行 `bash code/setup.sh` |
| `forge create` 没有部署，只打印提示 | 缺少 `--broadcast` | 按第 6.3 节的完整命令运行 |
| `Connection refused` | Anvil 没启动，或端口不一致 | 确认第二个终端的 `anvil --port 18545` 正在运行 |
| 部署地址和本章不同 | Anvil 没有重启，nonce 变了 | 用你自己的输出地址，或重启 Anvil |
| `cast storage` 返回全 0 | 地址错误 | 确认地址来自部署输出 |
| 覆盖率包含 `solution/` | 漏了过滤参数 | 加上 `--no-match-coverage "(test\|solution)"` |

## 10. 过关标准

- [ ] 不看答案，至少独立找到 NB-01 和 NB-03。
- [ ] 用 `cast storage` 读出字符串，并解释 `0x22` 的含义。
- [ ] `forge test` 显示 `14 tests passed, 0 failed`。如果你保留了 `test/MyPoC.t.sol`，数字是 15。
- [ ] 能说出两个覆盖率数字：38.46% 和 100.00%，并解释差异来自哪里。
- [ ] 按第 8.3 节格式，独立写完 3 个发现，每个都有位置、影响、PoC 和建议。

## 思考题

1. NB-01 的修复前，`setSecret` 的行覆盖率已经是 100%。为什么覆盖率没有帮你发现这个漏洞？
2. 如果把 `string private secretNote` 改成存 `keccak256(note)` 的哈希，能满足"只有 owner 能读"吗？这个方案解决了什么，没解决什么？
3. owner 要修复 NB-02，但笔记已经上链。升级合约、把变量清零以后，旧内容还能被读到吗？

下一章：[B14 写好一个发现](B14-writing-findings.md)
