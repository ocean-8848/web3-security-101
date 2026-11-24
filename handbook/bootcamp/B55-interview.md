# B55 面试题库：30 道常见问题

> 用法：先自己回答，再展开参考答案。答案要能说清"原理 + 例子 + 修复"。

## 基础

<details><summary>1. msg.sender 和 tx.origin 有什么区别？</summary>

msg.sender 是直接调用者；tx.origin 是发起交易的 EOA。用 tx.origin 鉴权会被中间合约利用。EIP-7702 之后，EOA 也可以有代码，基于 tx.origin 的"非合约"判断不再可靠。

</details>

<details><summary>2. call、delegatecall、staticcall 的区别？</summary>

call 在被调用方上下文执行；delegatecall 用被调用方代码、在调用方存储上执行，msg.sender 不变；staticcall 禁止修改状态。代理合约依赖 delegatecall。

</details>

<details><summary>3. Solidity 0.8 之后还会有溢出问题吗？</summary>

会。unchecked 块、内联汇编、类型强转截断、移位运算不检查溢出。

</details>

<details><summary>4. private 变量安全吗？</summary>

不保密。任何人可以用 eth_getStorageAt 读取存储。

</details>

<details><summary>5. 存储布局规则是什么？mapping 的值存在哪里？</summary>

按声明顺序从 slot 0 开始，小于 32 字节的相邻变量打包。mapping 在 slot p，键 k 的值在 keccak256(pad(k) ‖ pad(p))。

</details>

<details><summary>6. CREATE 和 CREATE2 的地址如何计算？</summary>

CREATE：keccak256(rlp(sender, nonce))；CREATE2：keccak256(0xff ‖ sender ‖ salt ‖ keccak256(initCode))。都取后 20 字节。

</details>

<details><summary>7. EIP-6780 改变了什么？</summary>

selfdestruct 只在创建合约的同一交易中删除代码；其他情况只转出余额。

</details>

## 漏洞

<details><summary>8. 重入有哪几种？如何防御？</summary>

单函数、跨函数、跨合约、只读重入。防御：CEI 模式；共享的重入锁；view 函数检查锁状态；集成方检查被读协议的锁。

</details>

<details><summary>9. 什么是只读重入？举一个例子。</summary>

第三方协议在回调期间读取了某协议 view 函数的中间状态。例：读取 Curve 池在移除流动性回调中的虚拟价格。

</details>

<details><summary>10. ERC4626 首存者问题是什么？如何防御？</summary>

份额取整与捐赠结合，使后续存款人得到过少份额。防御：虚拟份额和偏移、死份额、内部记账、最小份额参数。

</details>

<details><summary>11. 签名方案要包含哪些字段？</summary>

nonce、chainId、verifyingContract、deadline；限制 s 低半区；检查恢复地址非零；合约钱包用 ERC-1271。

</details>

<details><summary>12. 为什么不能用 AMM 现货价格做预言机？</summary>

单笔交易可以改变储备比例，闪电贷让这种改变几乎零成本。应使用 Chainlink 或足够长、足够深的 TWAP。

</details>

<details><summary>13. Chainlink 要做哪些校验？</summary>

answer 大于 0；updatedAt 在心跳内；L2 检查排序器状态和宽限期；处理小数位；考虑熔断边界和失效降级。

</details>

<details><summary>14. 代理合约有哪些常见问题？</summary>

存储冲突、实现合约未初始化、初始化可被抢先、UUPS 升级函数缺失或无权限、选择器冲突、实现合约中的 immutable。

</details>

<details><summary>15. 什么是怪代币？列举 5 种。</summary>

不返回 bool、失败返回 false、转账收费、rebase、ERC777 钩子、黑名单、可暂停、小数位非 18、多入口地址。

</details>

<details><summary>16. 什么是 63/64 规则？有什么安全影响？</summary>

CALL 最多转发剩余 Gas 的 63/64。中继场景下内层调用可能因 Gas 不足失败而外层继续执行，需要检查 gasleft。

</details>

<details><summary>17. 推送支付和拉取支付的区别？</summary>

推送由合约主动转账，接收方失败会阻塞流程；拉取由用户自己提款，单个失败不影响其他人。

</details>

<details><summary>18. 取整方向的原则？</summary>

取整永远有利于协议：给用户的向下取整，从用户收的向上取整。

</details>

## DeFi 与经济

<details><summary>19. 健康因子如何计算？</summary>

Σ(抵押 × 价格 × 清算阈值) / 债务价值。小于 1 可被清算。

</details>

<details><summary>20. 闪电贷对审计假设有什么影响？</summary>

不能假设攻击者资金有限。任何依赖资金量的逻辑都要按"无限资金、单交易"评估。

</details>

<details><summary>21. 治理系统如何抵抗闪电贷？</summary>

投票权快照在提案创建之前；执行时间锁；合理的法定人数；提案内容不可修改。

</details>

<details><summary>22. 什么是无常损失？</summary>

LP 相对于单纯持有的价值差：2√r/(1+r) − 1，r 为价格比值变化。

</details>

<details><summary>23. 奖励累积算法中最常见的错误？</summary>

修改余额前没有更新奖励；totalSupply 为 0 时奖励去向未定义；精度不足导致每秒奖励为 0。

</details>

## 方法与实践

<details><summary>24. 拿到一个陌生协议，你的前两个小时做什么？</summary>

读文档写下资产、角色、公式；编译和跑测试；画合约关系图；列出入口函数表和状态变量读写表；写下初步不变量。

</details>

<details><summary>25. 如何给一个发现定级？</summary>

按影响 × 可能性，参考客户或平台的标准；说明前提条件；用 PoC 证明影响。

</details>

<details><summary>26. 静态分析、fuzz、形式化验证各自的局限？</summary>

静态分析误报多、看不懂业务；fuzz 依赖不变量质量，不能证明没有问题；形式化验证只证明符合规范，规范可能不完整。

</details>

<details><summary>27. 如何写一条好的发现？</summary>

标题说后果；描述说根因和位置；影响量化；PoC 可运行；建议可执行。

</details>

<details><summary>28. 发现线上漏洞后怎么做？</summary>

只在本地 fork 复现；通过私密渠道（项目方、赏金平台、安全团队）报告；协调修复后再公开。

</details>

<details><summary>29. 修复复查要注意什么？</summary>

修复是否完整覆盖所有同类位置；是否引入新问题；是否改变了存储布局或接口。

</details>

<details><summary>30. 审计报告&quot;无高危&quot;能说明什么？</summary>

只说明在给定范围、给定时间、给定代码版本内没有发现。不覆盖运维、私钥、前端和未来升级。

</details>

合约审计主线到此结束。链下赛道见 [B56 链下赛道 L1 导读](B56-offchain-l1-guide.md)。
