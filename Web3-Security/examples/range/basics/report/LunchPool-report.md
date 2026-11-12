# LunchPool 安全审计报告（教学示例）

| 项目 | 内容 |
|---|---|
| 协议 | LunchPool：合买午餐的 ETH 资金池 |
| 审计对象提交 | `37dba9ccb5d62067054b2d327d04bd9d164db676`（示例哈希） |
| 范围 | `src/b05/LunchPool.sol`（nSLOC 62） |
| 规格 | `docs/lunchpool-spec.md` |
| 工作量 | 示例：0.5 人日 |
| 方法 | 人工审阅、Slither、Foundry PoC |

## 1. 摘要

结论：**暂缓上线**。两个高危问题都能让陌生人取走资金池全部资金。修复后需要复查。

| 严重度 | 数量 |
|---|---|
| 高 | 2 |
| 中 | 1 |
| 低 | 1 |
| 信息 | 2 |
| Gas | 1 |

## 2. 范围与假设

- 组织者诚实地选择商家。组织者作恶不在范围内。
- 本次不覆盖前端、部署脚本和私钥管理。
- 审计不能保证合约没有其他漏洞。

## 3. 发现详情

### [H-01] `setOrganizer` 缺少权限检查，任何人都能夺取组织者身份并转走资金池

**严重度：** 高（影响：高；可能性：高）
**位置：** `src/b05/LunchPool.sol#L49-L51`，函数 `setOrganizer`
**类别：** ACC

#### 描述

规格规定，只有当前组织者可以转交身份。`setOrganizer` 没有 `onlyOrganizer` 修饰器。任何地址都能把 `organizer` 改成自己。`payVendor` 的收款地址由组织者指定。

#### 影响

攻击者在截止后取走合约的全部 ETH。攻击只需要两笔交易，不需要本金。

#### 复现（PoC）

1. Alice 出资 10 ETH。
2. Mallory 调用 `setOrganizer(mallory)`。
3. 截止后，Mallory 调用 `payVendor(mallory)`。

运行命令：`forge test --match-test test_PoC_H01 -vvv`

#### 修复建议

```solidity
function setOrganizer(address newOrganizer) external onlyOrganizer {
    require(newOrganizer != address(0), "zero address");
    emit OrganizerChanged(organizer, newOrganizer);
    organizer = newOrganizer;
}
```

#### 状态

已在 `solution/LunchPoolFixed.sol` 修复，由 `test_Fix_H01_StrangerCannotSetOrganizer` 验证。

### [H-02] `refund` 在清零出资记录前转账，攻击合约可重入并提走资金池

**严重度：** 高（影响：高；可能性：高）
**位置：** `src/b05/LunchPool.sol#L38-L47`，函数 `refund`
**类别：** REN

#### 描述

`refund` 先用 `call` 发送 ETH，然后才把 `paidBy[msg.sender]` 清零。接收方是合约时，它的 `receive` 函数在清零之前运行，可以再次调用 `refund`。每次嵌套读到的都是旧金额。

#### 影响

攻击者只要出资一次，就能提走合约内的其他人的资金。在 PoC 中，攻击者出资 1 ETH，最终持有 11 ETH（净赚 10 ETH），Alice 的 10 ETH 全部丢失。Alice 的账面余额保持 10 ETH，但合约已经没有 ETH。

#### 复现（PoC）

1. Alice 出资 10 ETH。
2. 攻击合约出资 1 ETH，然后调用 `refund`。
3. 攻击合约在 `receive` 中重复调用 `refund`，直到合约余额不足。

运行命令：`forge test --match-test test_PoC_H02 -vvv`

#### 修复建议

按 CEI 顺序，先清零，后转账：

```solidity
paidBy[msg.sender] = 0;
total -= amount;
(bool ok, ) = msg.sender.call{value: amount}("");
require(ok, "transfer failed");
```

#### 状态

已在 `solution/LunchPoolFixed.sol` 修复，由 `test_Fix_H02_ReentryGetsNothingExtra` 验证。

### [M-01] `cancelAll` 循环推送 ETH，一个拒收地址就能阻止全员退款

**严重度：** 中（影响：中；可能性：高）
**位置：** `src/b05/LunchPool.sol#L62-L74`，函数 `cancelAll`
**类别：** EXT

#### 描述

`cancelAll` 在一个循环里向每位用餐者转账。任何一次转账失败，整笔交易回滚。截止之后，`refund` 已经关闭。规格第 5 条要求：任何一位用餐者都不能阻止其他人拿回资金。

#### 影响

攻击者用一个拒收 ETH 的合约出资 0.001 ETH，`cancelAll` 永远回滚。组织者仍然可以调用 `payVendor`，资金没有直接被盗，所以定为中危。但是取消这条路径永久失效。`eaters` 数组也没有长度上限，大量小额地址会放大循环的 gas 消耗。

#### 复现（PoC）

1. Alice 出资 1 ETH。
2. 拒收合约出资 0.001 ETH。
3. 截止后，组织者调用 `cancelAll`，交易回滚。

运行命令：`forge test --match-test test_PoC_M01 -vvv`

#### 修复建议

使用拉取模式。`cancelAll` 只设置 `cancelled = true`。用餐者自己调用 `refund` 领取。

#### 状态

已在 `solution/LunchPoolFixed.sol` 修复，由 `test_Fix_M01_RejecterCannotBlockOthers` 验证。

### [L-01] `refund` 使用 `<=` 比较，截止时刻当秒仍可退款，违反规格

**严重度：** 低（影响：低；可能性：高）
**位置：** `src/b05/LunchPool.sol#L39`，函数 `refund`
**类别：** 其他（规格偏差）

#### 描述

规格第 2 条规定，截止时刻当秒不再允许退款。代码使用 `block.timestamp <= deadline`。`contribute` 使用 `<`，两者不一致。

#### 影响

在 `deadline` 这一秒，用餐者可以退款，组织者也可以结算。两者的先后决定结果。没有资金被盗。

#### 复现（PoC）

运行命令：`forge test --match-test test_PoC_L01 -vvv`

#### 修复建议

把比较改成 `block.timestamp < deadline`。

#### 状态

已在 `solution/LunchPoolFixed.sol` 修复，由 `test_Fix_L01_RefundRejectedAtDeadline` 验证。

## 4. 信息与 Gas

### [I-01] `setOrganizer` 没有事件

链下监控无法发现组织者变更。建议增加 `OrganizerChanged` 事件。

### [I-02] `total` 与合约余额可能分叉

`payVendor` 转出 `address(this).balance`，而不是 `total`。强制转入的 ETH 也会被转出。建议在文档中写明，或转出 `total`。

### [G-01] 循环中重复读取 `eaters.length`

把 `eaters.length` 缓存到局部变量，可以减少重复的存储读取。

## 5. 代码成熟度

| 类别 | 评价 | 说明 |
|---|---|---|
| 访问控制 | 弱 | 关键函数缺少权限检查 |
| 算术 | 中 | 使用 0.8 默认检查；没有复杂算术 |
| 外部交互 | 弱 | 重入和推送模式问题 |
| 文档 | 中 | 有规格和不变量 |
| 测试 | 弱 | 项目方没有提供测试 |

## 6. 免责声明

本报告只反映示例提交在审计期间的状态。审计不能证明代码没有漏洞。
