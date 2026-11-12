# B05 第一个合约

> 学习目标：读完本章，你能——
> 1. 说出状态变量、函数、可见性、映射、结构体、事件、自定义错误、修饰器和 `payable` 的作用。
> 2. 从空文件写出一个能收款、能记账、能提款的合约。
> 3. 看懂编译器的报错，并自己改对。
>
> 前置章节：[B04 环境搭建](B04-setup.md)
> 预计用时：2～3 小时
> 配套代码：[examples/range/basics/src/b02/](../../examples/range/basics/src/b02)（8 步的完整文件）

---

## 开场：一本会自己收钱的社团账本

示例场景：你的读书社收会费，每人 0.01 ETH。现在的账本是一张表格。表格的管理员可以随手改数字，也可以把钱挪走。

你要写一个合约替代这张表格。合约的规则对所有人公开。部署之后，没有人能悄悄改规则。

我们一共走 8 步。每一步都是一份完整文件，每一步都能编译通过。

<details class="predict"><summary>🤔 先猜再看：合约部署之后，它存的钱和数据放在哪里？</summary>

放在区块链的状态里。每个合约有自己的余额和自己的存储（Storage）。存储是合约的永久数据区。你的电脑只保存源代码，不保存这些数据。

</details>

> 🎯 打个比方：合约像一台放在广场上的自动售货机。规则写死在机器里，谁投币都一样。机器的内部账本永久保留。
>
> 比喻的局限：售货机可以被砸开。合约不能被物理破坏，但是写错的规则同样会被任何人照着执行。

---

## 0. 准备

在 B04 创建的工程里工作。

```bash
cd ~/bootcamp-lab  # 进入 B04 建好的工程
touch src/Club.sol  # 新建一个空的合约文件
```

下面每一步都**用完整内容覆盖** `src/Club.sol`，然后运行：

```bash
forge build  # 编译合约，检查语法和类型
```

每一步的预期输出都包含这一行：

```text
Compiler run successful!
```

> 💡 注意：如果文件没有变化，`forge build` 输出 `No files changed, compilation skipped`。这也算成功。
>
> 💡 注意：`forge build` 还会打印以 `note[...]` 开头的代码风格建议，例如建议把 `immutable` 变量写成全大写。这些是 forge lint 的提示，不是错误。本章的命名保持初学者容易读的写法。

---

## 1. 第 1 步：类型、状态变量、函数

先记住三个概念：

- 类型（Type）：数据的种类。例如 `uint256` 是 0 到 2²⁵⁶−1 的无符号整数，`bool` 是真或假，`address` 是 20 字节的账户地址，`string` 是文本。
- 状态变量（State Variable）：写在函数外的变量。它的值永久保存在存储里。
- 函数（Function）：合约对外提供的操作。

```solidity
// 下一行声明开源协议
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;  // 编译器版本 ≥0.8.20 且 <0.9.0

contract Club {  // contract 定义一个合约
    string public name = "Book Club";  // string 文本；public 自动生成读取函数
    uint256 public memberCount;  // uint256 无符号整数，初始值 0

    function addMember() external {  // external：只能从合约外部调用
        memberCount = memberCount + 1;  // 写入状态变量；溢出会自动回滚
    }
}
```

逐行解释：

| 代码 | 含义 |
|---|---|
| `SPDX-License-Identifier` | 声明开源协议。缺少这一行，编译器给出警告。 |
| `pragma solidity ^0.8.20` | 要求编译器版本不低于 0.8.20，且低于 0.9.0。 |
| `contract Club` | 定义一个合约。 |
| `uint256 public memberCount` | 状态变量，初始值是 0。 |
| `external` | 这个函数只能从合约外部调用。 |

> 💡 注意：Solidity 0.8 起，加减乘默认检查溢出。溢出时交易回滚（Revert）。回滚指这笔交易的所有状态修改全部撤销。

---

## 2. 第 2 步：可见性和只读函数

可见性（Visibility）决定谁能调用一个函数。

| 关键字 | 谁能调用 |
|---|---|
| `public` | 外部和合约内部 |
| `external` | 只有外部 |
| `internal` | 本合约和继承它的合约 |
| `private` | 只有本合约 |

状态变量写 `public` 时，编译器自动生成一个同名的读取函数。

`view` 表示函数只读状态、不改状态。`pure` 表示函数既不读也不改状态。

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Club {
    string public name = "Book Club";
    uint256 public memberCount;

    function addMember() external {  // external 函数调用内部的 private 函数
        _increase();
    }

    // view：只读状态；returns 声明返回类型
    function isEmpty() public view returns (bool) {
        return memberCount == 0;  // bool：比较结果是真或假
    }

    function _increase() private {  // private：只有本合约能调用，下划线是惯例
        memberCount = memberCount + 1;
    }
}
```

> ⚠️ 警告：`private` 只限制其他合约调用，不隐藏数据。链上所有存储都能被任何人读取。不要把密码写进合约。

---

## 3. 第 3 步：`mapping` 和 `msg.sender`

映射（Mapping）是一张键值表。没有写入过的键，读出来是该类型的零值。

`msg.sender` 是当前这次调用的直接调用者地址。调用者不能伪造它。

现在，每个人只能把自己登记为成员。

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Club {
    string public name = "Book Club";
    uint256 public memberCount;
    // mapping：地址→是否成员，未写入默认 false
    mapping(address => bool) public isMember;

    function join() external {
        // msg.sender：直接调用者，无法伪造
        // 条件为假时回滚，并带上说明
        require(!isMember[msg.sender], "already member");
        isMember[msg.sender] = true;  // 只能登记自己，不能替别人登记
        memberCount = memberCount + 1;
    }
}
```

`require(条件, "说明")` 的含义：如果条件为假，交易回滚。

<details class="predict"><summary>🤔 先猜再看：如果 A 合约调用 Club，而 A 是被用户 U 调用的，Club 里的 msg.sender 是谁？</summary>

是 A 合约的地址。`msg.sender` 永远是**直接**调用者。这一点在权限检查里非常重要。[05 访问控制](../05-access-control.md) 专门讲了相关的错误。

</details>

---

## 4. 第 4 步：`struct`

结构体（Struct）把多个字段打包成一个自定义类型。现在，每个成员有昵称和已付金额。

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Club {
    struct Member {  // struct 把多个字段打包成一个类型
        string nickname;
        uint256 paid;
        bool active;
    }

    string public name = "Book Club";
    uint256 public memberCount;
    mapping(address => Member) public members;  // 值可以是结构体

    // calldata：只读参数，不复制到内存
    function join(string calldata nickname) external {
        require(!members[msg.sender].active, "already member");
        // 按字段顺序构造结构体并写入
        members[msg.sender] = Member(nickname, 0, true);
        memberCount = memberCount + 1;
    }

    // view 函数可以按需读取任意地址
    function isMember(address who) external view returns (bool) {
        return members[who].active;
    }
}
```

`calldata` 表示参数放在调用数据里，只读，不复制到内存，比 `memory` 省 gas。gas 是执行交易要支付的计算费用。

---

## 5. 第 5 步：事件

事件（Event）是合约写进交易日志的记录。合约自己读不到日志。链下程序（网页、监控）靠它知道发生了什么。

`indexed` 字段可以被链下程序按值过滤。

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Club {
    struct Member {
        string nickname;
        uint256 paid;
        bool active;
    }

    string public name = "Book Club";
    uint256 public memberCount;
    mapping(address => Member) public members;

    // event 声明日志格式；indexed 可被过滤
    event Joined(address indexed who, string nickname, uint256 paid);

    function join(string calldata nickname) external {
        require(!members[msg.sender].active, "already member");
        members[msg.sender] = Member(nickname, 0, true);
        memberCount = memberCount + 1;
        // emit 写入一条日志，合约自己读不到
        emit Joined(msg.sender, nickname, 0);
    }

    function isMember(address who) external view returns (bool) {
        return members[who].active;
    }
}
```

---

## 6. 第 6 步：自定义错误

自定义错误（Custom Error）用 `revert 错误名(参数)` 抛出。它比字符串省 gas，还能带上现场数据。

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Club {
    struct Member {
        string nickname;
        uint256 paid;
        bool active;
    }

    string public name = "Book Club";
    uint256 public memberCount;
    mapping(address => Member) public members;

    event Joined(address indexed who, string nickname, uint256 paid);

    error AlreadyMember(address who);  // 自定义错误，可携带现场数据

    function join(string calldata nickname) external {
        // revert 抛出错误，回滚整笔交易
        if (members[msg.sender].active) revert AlreadyMember(msg.sender);
        members[msg.sender] = Member(nickname, 0, true);
        memberCount = memberCount + 1;
        emit Joined(msg.sender, nickname, 0);
    }

    function isMember(address who) external view returns (bool) {
        return members[who].active;
    }
}
```

---

## 7. 第 7 步：构造函数和修饰器

构造函数（Constructor）只在部署时运行一次。

修饰器（Modifier）把重复的检查提取出来。`_;` 表示"在这里执行函数体"。

`immutable` 变量只能在构造函数里赋值，之后不能改。

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Club {
    struct Member {
        string nickname;
        uint256 paid;
        bool active;
    }

    address public immutable owner;  // immutable：只能在构造函数里赋值
    string public name = "Book Club";
    uint256 public memberCount;
    mapping(address => Member) public members;

    event Joined(address indexed who, string nickname, uint256 paid);
    event Renamed(string newName);

    error AlreadyMember(address who);
    error NotOwner(address caller);

    modifier onlyOwner() {  // modifier 抽出可复用的检查
        if (msg.sender != owner) revert NotOwner(msg.sender);
        _;  // _; 表示在这里执行函数体
    }

    constructor() {  // 构造函数只在部署时运行一次
        owner = msg.sender;  // 部署者成为 owner
    }

    function join(string calldata nickname) external {
        if (members[msg.sender].active) revert AlreadyMember(msg.sender);
        members[msg.sender] = Member(nickname, 0, true);
        memberCount = memberCount + 1;
        emit Joined(msg.sender, nickname, 0);
    }

    // 加上 onlyOwner，先跑修饰器检查
    function rename(string calldata newName) external onlyOwner {
        name = newName;
        emit Renamed(newName);
    }

    function isMember(address who) external view returns (bool) {
        return members[who].active;
    }
}
```

<details class="predict"><summary>🤔 先猜再看：如果删掉 rename 上的 onlyOwner，编译器会报错吗？</summary>

不会。编译器只检查语法和类型，不知道你的业务规则。漏掉权限检查是真实事故里的常见根因。这正是审计存在的原因。

</details>

---

## 8. 第 8 步：`payable`、收款和提款

`payable` 函数可以在调用时接收 ETH。`msg.value` 是这次调用附带的金额，单位是 wei。1 ether 等于 10¹⁸ wei。

`withdraw` 的写法遵循"先改状态、后转账"。这叫 CEI（Checks-Effects-Interactions，检查—生效—交互）。[04 重入](../04-reentrancy.md) 解释了为什么要这样写。

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Club {
    struct Member {
        string nickname;
        uint256 paid;
        bool active;
    }

    address public immutable owner;
    uint256 public immutable fee;
    string public name = "Book Club";
    uint256 public memberCount;
    mapping(address => Member) public members;

    event Joined(address indexed who, string nickname, uint256 paid);
    event Renamed(string newName);
    event Withdrawn(address indexed to, uint256 amount);

    error AlreadyMember(address who);
    error NotOwner(address caller);
    error WrongFee(uint256 sent, uint256 expected);
    error TransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner(msg.sender);
        _;
    }

    constructor(uint256 _fee) {  // 部署时传入会费金额（单位 wei）
        owner = msg.sender;
        fee = _fee;
    }

    // payable：调用时可以附带 ETH
    function join(string calldata nickname) external payable {
        if (members[msg.sender].active) revert AlreadyMember(msg.sender);
        // msg.value：本次附带的金额，单位 wei
        if (msg.value != fee) revert WrongFee(msg.value, fee);
        members[msg.sender] = Member(nickname, msg.value, true);
        memberCount = memberCount + 1;
        emit Joined(msg.sender, nickname, msg.value);
    }

    function rename(string calldata newName) external onlyOwner {
        name = newName;
        emit Renamed(newName);
    }

    function withdraw() external onlyOwner {
        uint256 amount = address(this).balance;  // 本合约当前持有的 ETH
        emit Withdrawn(owner, amount);  // 先发事件，再做外部调用
        // Interactions：转账，控制权交给接收方
        (bool ok, ) = owner.call{value: amount}("");
        if (!ok) revert TransferFailed();  // call 失败不自动回滚，必须自己检查
    }

    function isMember(address who) external view returns (bool) {
        return members[who].active;
    }
}
```

这个函数里有 3 个新写法：

| 写法 | 含义 |
|---|---|
| `address(this).balance` | 本合约当前持有的 ETH，单位 wei |
| `owner.call{value: amount}("")` | 向 `owner` 发送 ETH，并把控制权交给接收方 |
| `(bool ok, ) = …` | `call` 失败时不自动回滚。代码必须自己检查 `ok`。 |

> ⚠️ 警告：`call` 返回 `false` 时，如果你不检查，转账失败会被当作成功。[07 外部调用](../07-external-calls-tokens.md) 列出了这一类错误。

> 🧪 动手验证：把第 8 步的 `if (!ok) revert TransferFailed();` 删掉，然后运行 `forge build`。观察输出变成 `Compiler run successful with warnings:`，并带有 `Warning (2072): Unused local variable.`。编译依然成功。然后恢复这一行。

---

## 9. 第一次运行合约

创建测试文件 `test/Club.t.sol`。B06 会讲每一行的含义，这里只需要看到合约真的能跑。

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";  // forge-std 的测试基类
import {Club} from "../src/Club.sol";  // 导入要测试的合约

contract ClubSmokeTest is Test {  // is Test：继承测试工具
    function test_JoinWorks() public {  // test 开头的函数会被当作测试运行
        Club club = new Club(0.01 ether);  // new 部署合约，参数是会费
        address alice = makeAddr("alice");  // 生成一个带标签的测试地址
        vm.deal(alice, 1 ether);  // 作弊码：直接给 alice 1 ETH

        vm.prank(alice);  // 作弊码：下一次调用以 alice 身份发出
        // {value: …} 附带 ETH 调用 payable 函数
        club.join{value: 0.01 ether}("alice");

        assertTrue(club.isMember(alice));  // 断言为真，否则测试失败
        assertEq(club.memberCount(), 1);  // 断言两个值相等
    }
}
```

```bash
# 只运行名字匹配的测试合约
forge test --match-contract ClubSmokeTest
```

预期输出（耗时和 gas 数字可能不同）：

```text
Ran 1 test for test/Club.t.sol:ClubSmokeTest
[PASS] test_JoinWorks() (gas: 1032479)
Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 830.92µs (614.17µs CPU time)

Ran 1 test suite in 398.21ms (830.92µs CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```

---

## 10. 如果出错

| 现象 | 原因 | 处理 |
|---|---|---|
| `Source "forge-std/Test.sol" not found` | 工程没有 `lib/forge-std` | 运行 `forge install foundry-rs/forge-std`；如果工程没有用 git，加 `--no-git` |
| `Expected ';' but got …` | 上一行缺分号 | 看报错指向的行和它的上一行 |
| `Undeclared identifier` | 变量名拼错，或没有定义 | 对比本章对应步骤的代码 |
| `Member "x" not found` | 结构体或合约没有这个成员 | 检查字段名和大小写 |
| `Type uint256 is not implicitly convertible…` | 类型不匹配 | 检查函数参数和返回值的类型 |
| `Cannot write to immutable here` | 在构造函数之外给 `immutable` 赋值 | `immutable` 只能在声明处或构造函数里赋值 |
| `"msg.value" … only be used in payable` | 函数没有写 `payable` | 给函数加 `payable` |
| `Wrong argument count for function call` | 第 8 步构造函数需要 `_fee` | 使用 `new Club(0.01 ether)` |

---

## 11. 过关标准

- [ ] 8 步代码全部运行过 `forge build`，全部成功。
- [ ] `forge test --match-contract ClubSmokeTest` 显示 `1 passed`。
- [ ] 不看本章，能说出 `public` 和 `external` 的区别。
- [ ] 不看本章，能解释 `msg.sender` 和 `msg.value`。
- [ ] 你故意删掉一个分号，并能根据报错找回它。

---

## 12. 相关章节

- [03 EVM 与 Solidity 安全基础](../03-evm-solidity-basics.md)
- [04 重入](../04-reentrancy.md)
- [05 访问控制](../05-access-control.md)
- [07 外部调用与代币](../07-external-calls-tokens.md)
- 下一章：[B06 Foundry 基本功](B06-foundry-basics.md)

> 🪞 反思：你的 `Club` 里，owner 拥有什么权力？如果你是社员，你愿意相信这个 owner 吗？这个问题在审计里叫"中心化风险"。

---

## 13. 思考题

1. 第 8 步的 `withdraw` 把全部余额转给 `owner`。`Member.paid` 字段在提款后还准确吗？它记录的是什么？
2. 把 `join` 的两个 `if` 检查放到函数末尾，合约还安全吗？回答时考虑回滚的含义。
3. `name` 是 `string public`，有人说"这样比 `private` 更不安全，因为别人能看到"。这句话对吗？

下一章：[B06 Foundry 基本功](B06-foundry-basics.md)
