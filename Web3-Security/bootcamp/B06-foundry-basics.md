# B06 Foundry 基本功

> 学习目标：读完本章，你能——
> 1. 运行测试，并读懂 `-vvvv` 的调用追踪。
> 2. 用 cheatcode 控制调用者、余额和时间。
> 3. 用 `cast`、`chisel`、`anvil` 操作本地链。
>
> 前置章节：[B05 第一个合约](B05-first-contract.md)
> 交互实验：[调用树分析](../interactive/audit-trace.html)
> 预计用时：2 小时
> 最后核对：2026-11-10
> 配套代码：[examples/range/basics/](../examples/range/basics/)

---

## 开场：编译通过，只说明语法没错

示例场景：`Club` 编译通过了。可是，陌生人能提款吗？付错金额会怎样？1 万个用户操作之后账还平吗？

编译器回答不了这些问题。测试可以。

<details class="predict"><summary>🤔 先猜再看：自己写 100 个测试用例，和让工具随机生成 10,000 个输入，哪个更容易发现你没想到的 bug？</summary>

随机生成更容易发现"你没想到"的情况，因为手写用例只覆盖你想到的情况。可是，随机测试需要你先写出"什么永远应该成立"。本章练手写测试，[B12](B12-foundry-advanced.md) 练随机测试。

</details>

> 🎯 打个比方：单元测试像按清单验车。模糊测试像找一千个新手随便开。不变量测试是全程盯着一条规则：油箱里的油不能凭空变多。
>
> 比喻的局限：真车开坏了就停了。合约测试每轮都从干净状态重来，所以可以一直试。

准备工作：进入配套工程。

```bash
cd Web3-Security/examples/range/basics  # 进入配套工程目录
forge test  # 运行工程里的全部测试
```

最后一行的预期输出：

```text
Ran 7 test suites in 409.71ms (412.44ms CPU time): 27 tests passed, 0 failed, 1 skipped (28 total tests)
```

跳过的 1 个测试是分叉测试。[B12 第 2 节](B12-foundry-advanced.md)会启用它。

---

## 1. forge build 和 forge test

| 命令 | 作用 |
|---|---|
| `forge build` | 编译 |
| `forge test` | 运行全部测试 |
| `forge test --match-test 名字` | 只跑名字匹配的测试函数。简写 `--mt` |
| `forge test --match-contract 名字` | 只跑匹配的测试合约。简写 `--mc` |
| `forge test -vv` | 显示 `console2.log` 的日志 |
| `forge test -vvv` | 失败的测试显示追踪 |
| `forge test -vvvv` | 所有测试显示追踪 |

测试的规则：测试函数以 `test` 开头。名字以 `testFuzz` 开头的习惯写法表示模糊测试。`setUp()` 在每个测试前运行一次。

---

## 2. 读懂调用追踪

调用追踪（Trace）是一笔交易里的完整调用树。审计员每天都读它。

```bash
# --match-test 只跑这一个测试；-vvvv 打印全部调用追踪
forge test --match-test test_OwnerWithdraws -vvvv
```

实际输出：

```text
Ran 1 test for test/b02/Club.t.sol:ClubTest
[PASS] test_OwnerWithdraws() (gas: 120507)
Traces:
  [120507] ClubTest::test_OwnerWithdraws()
    ├─ [0] VM::prank(alice: [0x328809Bc894f92807417D2dAD6b7C998c1aFdac6])
    │   └─ ← [Return]
    ├─ [93067] Club::join{value: 10000000000000000}("alice")
    │   ├─ emit Joined(who: alice: [0x328809Bc894f92807417D2dAD6b7C998c1aFdac6], nickname: "alice", paid: 10000000000000000 [1e16])
    │   └─ ← [Stop]
    ├─ [8989] Club::withdraw()
    │   ├─ emit Withdrawn(to: ClubTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496], amount: 10000000000000000 [1e16])
    │   ├─ [55] ClubTest::receive{value: 10000000000000000}()
    │   │   └─ ← [Stop]
    │   └─ ← [Stop]
    └─ ← [Stop]
```

读法：

| 片段 | 含义 |
|---|---|
| `[93067]` | 这次调用用掉的 gas |
| `Club::join{value: …}("alice")` | 合约、函数、附带的 ETH、参数 |
| `VM::prank` | cheatcode 调用，只在测试里存在 |
| 缩进 | 被谁调用。`receive` 缩进在 `withdraw` 里面，说明是 `withdraw` 触发的 |
| `← [Stop]` / `← [Return]` | 正常结束 |
| `← [Revert] 错误名` | 这一层回滚 |

再看一个回滚：

```bash
# 看一个期望回滚的测试的追踪
forge test --match-test test_RevertWhen_StrangerWithdraws -vvvv
```

其中的关键行：

```text
    ├─ [478] Club::withdraw()
    │   └─ ← [Revert] NotOwner(0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e)
```

> 💡 注意：这个测试显示 `[PASS]`，因为它期望回滚。回滚发生了，测试就通过。

---

## 3. cheatcode：测试里的超能力

Cheatcode 是只在 Foundry 测试里可用的特殊函数，通过 `vm.` 调用。打开 `test/b02/Club.t.sol` 对照阅读。

| Cheatcode | 作用 |
|---|---|
| `makeAddr("alice")` | 生成一个带标签的地址（`forge-std` 的辅助函数） |
| `vm.deal(addr, amount)` | 设置地址的 ETH 余额 |
| `deal(token, addr, amount)` | 设置地址的 ERC-20 代币余额（`forge-std` 的辅助函数） |
| `vm.prank(addr)` | 下一次调用的 `msg.sender` 改为 `addr` |
| `vm.startPrank` / `vm.stopPrank` | 持续切换调用者 |
| `vm.warp(ts)` | 设置当前时间戳 |
| `vm.roll(n)` | 设置当前区块号 |
| `vm.expectRevert(…)` | 断言下一次调用回滚 |
| `vm.expectEmit(…)` | 断言下一次调用触发事件 |
| `vm.createSelectFork(url)` | 分叉一条链并切换过去。`vm.createSelectFork(url, 区块号)` 固定区块 |
| `vm.load(addr, slot)` / `vm.store(addr, slot, val)` | 直接读 / 写任意存储槽 |

> ⚠️ 警告：`vm.prank` 只影响**下一次外部调用**。如果你在它和目标调用之间又调用了别的合约，它就用掉了。

测试函数的固定结构是 3 段：准备、执行、断言。

```solidity
// 名字说明：期望陌生人提款时回滚
function test_RevertWhen_StrangerWithdraws() public {
    vm.prank(bob);                                               // 准备
    // 断言回滚
    vm.expectRevert(abi.encodeWithSelector(Club.NotOwner.selector, bob));
    club.withdraw();                                             // 执行
}
```

> 🧪 动手验证：把 `src/b02/step8/Club.sol` 的 `withdraw` 里的 `onlyOwner` 删掉，运行 `forge test --match-contract ClubTest`。`test_RevertWhen_StrangerWithdraws` 必须失败。然后恢复。一个永远不会失败的测试没有价值。

---

## 4. cast：命令行里的瑞士军刀

下面的命令都不需要网络。

```bash
cast sig 'join(string)'  # 算函数选择器：签名哈希前 4 字节
cast keccak 'Hello'  # 计算任意文本的 keccak256 哈希
cast to-wei 0.01  # ETH 换算成 wei
cast from-wei 10000000000000000  # wei 换算成 ETH
# 按返回类型解码一段 ABI 数据
cast abi-decode 'f()(uint256)' 0x000000000000000000000000000000000000000000000000000000000000002a
cast --to-base 255 hex  # 数字转换成十六进制
```

实际输出：

```text
0x6a786b07
0x06b3dfaec148fb1bb2b066f10ec285e7c9bf402ab32aa78a5d38e34566810cd2
10000000000000000
0.010000000000000000
42
0xff
```

函数选择器（Selector）是函数签名哈希的前 4 字节。交易靠它决定调用哪个函数。第 1 行就是 `join(string)` 的选择器。

---

## 5. chisel：试一行代码

`chisel` 是 Solidity 的交互环境。

```bash
chisel  # 打开 Solidity 交互环境
```

在提示符后输入：

```text
uint256 a = 7;
a * 6
!quit
```

实际输出：

```text
Type: uint256
├ Hex: 0x2a
├ Hex (full word): 0x000000000000000000000000000000000000000000000000000000000000002a
└ Decimal: 42
```

---

## 6. anvil：本地部署

`anvil` 在你的电脑上启动一条测试链。它默认启用 10 个账户，每个账户 10000 ETH。这些 ETH 只存在于你的电脑上。

打开**第一个**终端：

```bash
anvil  # 启动本地测试链，占用这个终端
```

你会看到账户列表和最后一行：

```text
Listening on 127.0.0.1:8545
```

打开**第二个**终端。进入配套工程，部署 `Club`，会费是 0.01 ETH（10¹⁶ wei）：

```bash
cd Web3-Security/examples/range/basics
export RPC=http://127.0.0.1:8545  # 本地链的地址，后面命令复用
# anvil 的 0 号默认账户，私钥公开
export ME=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
# 部署合约：--unlocked 由 anvil 代签，--broadcast 真正发送，--constructor-args 传会费
forge create src/b02/step8/Club.sol:Club --rpc-url $RPC --unlocked --from $ME --broadcast --constructor-args 10000000000000000
```

实际输出：

```text
Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

> 💡 注意：`--unlocked` 让 anvil 代签。全新启动的 anvil 里，同一账户的第一笔部署总是得到这个地址。

读状态和发交易：

```bash
# 上一步部署得到的合约地址
export CLUB=0x5FbDB2315678afecb367f032d93F642f64180aa3
export ALICE=0x70997970C51812dc3A010C7d01b50e0d17dc79C8  # anvil 的 1 号默认账户
# cast call：只读调用，不产生交易
cast call $CLUB 'memberCount()(uint256)' --rpc-url $RPC
# cast send：以 alice 身份发交易并附带 0.01 ETH；grep 只看状态行
cast send $CLUB 'join(string)' alice --value 0.01ether --unlocked --from $ALICE --rpc-url $RPC | grep -E '^status'
cast call $CLUB 'memberCount()(uint256)' --rpc-url $RPC
cast balance $CLUB --rpc-url $RPC  # 查询合约持有的 ETH
# 读 public mapping，按结构体字段解码
cast call $CLUB 'members(address)(string,uint256,bool)' $ALICE --rpc-url $RPC
```

实际输出：

```text
0
status               1 (success)
1
10000000000000000
"alice"
10000000000000000 [1e16]
true
```

`cast call` 只读，不产生交易。`cast send` 发送交易，改变链上状态。

保持 anvil 运行。[B12](B12-foundry-advanced.md) 的第 2、3 节还要用。

---

## 7. forge coverage：测到了多少

覆盖率（Coverage）显示测试执行了哪些代码行和分支。

```bash
# 统计覆盖率，不统计脚本、测试和演示目录
forge coverage --no-match-coverage 'script|test|demo'
```

输出的一行（完整表格很长）：

```text
| src/b02/step8/Club.sol          | 85.71% (18/21)   | 84.21% (16/19)   | 75.00% (3/4)   | 83.33% (5/6)   |
```

4 列依次是行、语句、分支、函数。`Club` 的分支和函数没有全覆盖：`rename` 没有测试，转账失败的分支也没有测试。

> ⚠️ 警告：100% 覆盖率不代表没有漏洞。覆盖率只说明"代码运行过"，不说明"断言检查过正确性"。[B12 第 1 节](B12-foundry-advanced.md)的 bug 就藏在覆盖率 100% 的函数里。

---

## 8. 如果出错

| 现象 | 原因 | 处理 |
|---|---|---|
| `Connection refused` | anvil 没有运行 | 在另一个终端运行 `anvil` |
| `Address already in use` | 8545 端口被占用 | 关闭旧的 anvil，或用 `anvil --port 8546` 并同步修改 `RPC` |
| `next call did not revert as expected` | 被期望回滚的调用没有回滚 | 检查 `vm.prank` 的位置，确认合约确实有这个检查 |
| `Error != expected error` | 回滚了，但错误数据不同 | 比较 `expectRevert` 的选择器和参数 |
| 地址和本章不同 | anvil 不是全新启动 | 重启 anvil，或使用部署输出的地址 |

---

## 9. 过关标准

- [ ] `forge test` 显示 `27 tests passed, 0 failed, 1 skipped`。
- [ ] 你能从 `-vvvv` 输出里说出每一行的调用者和 gas。
- [ ] 删掉 `onlyOwner` 后，你看到对应测试失败，并已恢复。
- [ ] 在 anvil 上完成部署、`join`、读状态。

---

## 10. 相关章节

- [03 EVM 与 Solidity 基础](../03-evm-solidity-basics.md)
- 交互实验：[调用树分析](../interactive/audit-trace.html)
- 进阶：[B12 Foundry 进阶：模糊测试、分叉与审计工作台](B12-foundry-advanced.md)（阶段 2）
- 下一章：[B07 阶段 1 导读](B07-stage1-guide.md)

---

## 11. 思考题

1. 在 `test_RevertWhen_StrangerWithdraws` 里，如果在 `vm.prank(bob)` 之后、`vm.expectRevert` 之前先调用了另一个合约，`club.withdraw()` 看到的 `msg.sender` 是谁？测试会得到什么结果？
2. 项目只有 Hardhat 测试，覆盖率 95%。这能说明代码安全吗？

阶段 0 到此结束。下一章：[B07 阶段 1 导读](B07-stage1-guide.md)
