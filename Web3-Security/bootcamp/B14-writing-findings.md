# B14 写好一个发现

> 学习目标：读完本章，你能——
> 1. 写出"根因 + 影响"的标题。
> 2. 按描述、影响、PoC、修复的结构写一条发现。
> 3. 用影响 × 可能性定级，并说明竞赛平台的规则差异。
> 4. 在发现里引用最佳实践和安全标准，说清"为什么这是问题"。
> 5. 把 Markdown 报告生成 PDF。
>
> 前置章节：[B09 读代码与攻击者思维](B09-reading-code-mindset.md)（LunchPool 的 4 个问题）、[B13 第 1 次审计：NoteBox](B13-audit-1-notebox.md)
> 交互实验：[评级计算器](../interactive/severity-calculator.html) ｜ [审计自查清单](../interactive/audit-checklist.html)
> 预计用时：3～4 小时
> 最后核对：2026-11-10
> 配套文件：[examples/range/basics/report/](../../examples/range/basics/report)

---

## 开场：同一个漏洞，两种命运

示例场景：两位审计员发现了同一个漏洞。第一位写："存在权限问题，建议修复。"第二位写："`setOrganizer` 缺少权限检查，任何人都能夺取组织者身份并转走资金池。"附一个可运行的测试。

第一条被开发者标记为"待讨论"。第二条在当天被修复。

<details class="predict"><summary>🤔 先猜再看：决定一条发现是否被认真对待的，是漏洞本身，还是写法？</summary>

两者都决定。没写清楚的漏洞不会被修复。写不出 PoC 的漏洞，经常被开发者以"理论上不可能"驳回。审计员的产出是报告，报告质量就是工作质量。

</details>

> 🎯 打个比方：发现报告像医生的诊断书。"你不太健康"没有用。"左肺下叶 2 厘米结节，建议 3 个月内活检"才能行动。
>
> 比喻的局限：诊断书的读者只有一个病人。发现报告的读者有开发者、管理者、用户和未来的审计员。

---

## 1. 标题：根因 + 影响

标题公式：**[根因]，[影响]**。读者只看标题，也要知道什么东西坏了、后果是什么。

| 差标题 | 问题 | 好标题 |
|---|---|---|
| 权限问题 | 没有位置，没有后果 | `setOrganizer` 缺少权限检查，任何人都能夺取组织者身份并转走资金池 |
| 重入漏洞 | 没有说明是哪里、会怎样 | `refund` 在清零出资记录前转账，攻击合约可重入并提走资金池 |
| DoS 风险 | 太泛 | `cancelAll` 循环推送 ETH，一个拒收地址就能阻止全员退款 |
| 时间比较错误 | 只有现象 | `refund` 使用 `<=` 比较，截止时刻当秒仍可退款，违反规格 |

---

## 2. 一条发现的结构

| 字段 | 回答的问题 |
|---|---|
| 描述（Description） | 代码做了什么？规格要求什么？差在哪里？ |
| 影响（Impact） | 谁损失什么？最多多少？攻击者需要什么？ |
| 复现（PoC） | 怎样运行一次，亲眼看到问题？ |
| 修复建议（Mitigation） | 具体改哪几行？ |
| 参考（References，可选） | 这违反了哪条最佳实践或标准？见第 4 节 |

PoC（Proof of Concept，概念验证）是证明漏洞真实存在的最小可运行示例。

空白模板在 [report/finding-template.md](../../examples/range/basics/report/finding-template.md)。

### 2.1 差和好的完整对比

**差的写法：**

> **重入**
> refund 函数可能存在重入风险，攻击者也许能取走资金。建议使用重入锁或者其他方式提高安全性。

问题清单：

- 标题没有位置和后果。
- "可能""也许"：作者自己没有验证。
- 没有说明顺序错在哪里。
- 没有 PoC，读者无法复现。
- 建议是一个方向，不是一个改法。

**好的写法**（节选自模型报告的 H-02）：

> **[H-02] `refund` 在清零出资记录前转账，攻击合约可重入并提走资金池**
>
> **严重度：** 高（影响：高；可能性：高）
> **位置：** `src/b05/LunchPool.sol#L38-L47`
>
> **描述：** `refund` 先用 `call` 发送 ETH，然后才把 `paidBy[msg.sender]` 清零。接收方是合约时，它的 `receive` 函数在清零之前运行，可以再次调用 `refund`。每次嵌套读到的都是旧金额。
>
> **影响：** 在 PoC 中，攻击者出资 1 ETH，最终持有 11 ETH（净赚 10 ETH），Alice 的 10 ETH 全部丢失。
>
> **复现：** `forge test --match-test test_PoC_H02 -vvv`
>
> **修复：** 按 CEI 顺序，先执行 `paidBy[msg.sender] = 0; total -= amount;`，再转账。

### 2.2 写影响时要用数字

| 差 | 好 |
|---|---|
| 用户会损失资金 | 攻击者一笔交易取走合约全部余额。PoC 中是 10 ETH |
| 协议可能不可用 | 一个出资 0.001 ETH 的合约永久阻塞 `cancelAll` |
| 影响较大 | 所有用餐者的出资都处于风险中，不需要任何权限 |

### 2.3 写修复时要给代码

- "使用 CEI"不够。把调整后的语句顺序写出来。
- 写清楚修复的副作用。例如 M-01 改成拉取模式后，用户要自己发一笔交易。
- 提供验证修复的测试。LunchPool 的每条发现都有一个 `test_Fix_*`。

---

## 3. 定级

### 3.1 影响 × 可能性

定级用 [A02 第 2 节](../assessment/A02-risk-rating-reporting.md) 的影响 × 可能性矩阵。

用 [评级计算器](../interactive/severity-calculator.html) 试几组组合。

LunchPool 的定级过程：

| 发现 | 影响 | 可能性 | 结果 | 理由 |
|---|---|---|---|---|
| H-01 | 高：资金全失 | 高：任何人，两笔交易 | 高 | |
| H-02 | 高：资金全失 | 高：任何合约 | 高 | |
| M-01 | 中：取消功能失效 | 高：0.001 ETH 成本 | 中 | 组织者仍可调用 `payVendor`，资金没有被盗 |
| L-01 | 低：规格偏差，没有资金损失 | 高：每轮都存在 | 低 | |

<details class="predict"><summary>🤔 先猜再看：如果 LunchPool 没有 `payVendor`，M-01 还是中危吗？</summary>

应该上调。这种情况下取消是资金离开合约的唯一路径，一个拒收地址会永久冻结全部资金。永久冻结属于高影响，甚至严重影响。**定级要结合上下文，同样的代码模式在不同协议里等级不同。**

</details>

### 3.2 竞赛平台的规则不一样

提交之前必须读目标平台的现行规则。下表是 2026-11-10 查阅的摘要，以官方页面为准。

| 平台 | 等级 | 特点 |
|---|---|---|
| [Code4rena](https://docs.code4rena.com/competitions/severity-categorization) | High / Medium / QA | High：资产可被直接盗取或损失。Medium：资产没有直接风险，但功能或可用性受影响，或者在外部条件下损失价值。QA：低风险问题、治理和中心化风险。不鼓励提交代码风格类信息项。（2026 年 5 月宣布关停，规则仅供阅读历史报告时参考；现状见 [B53 第 2 节](B53-contests-and-habits.md)） |
| [Sherlock](https://docs.sherlock.xyz/audits/judging/guidelines) | High / Medium | 只关注 High 和 Medium。**可能性不参与定级**。有金额门槛：例如 High 要求用户损失超过 1% 且超过 10 美元。 |
| [CodeHawks](https://docs.codehawks.com/hawks-auditors/how-to-evaluate-a-finding-severity) | High / Medium / Low | 使用影响 × 可能性矩阵。不接受 Gas、QA 和 Informational。 |
| [Immunefi v2.3](https://immunefi.com/immunefi-vulnerability-severity-classification-system-v2-3/) | Critical / High / Medium / Low | 漏洞赏金分级，按影响类型列举。 |

> ⚠️ 警告：同一个 bug 在不同平台等级不同。这不是矛盾。私人审计用你和客户约定的矩阵。竞赛用平台的规则。报告里要写明使用的标准。

---

## 4. 引用标准：让发现站得住

**最佳实践告诉你"去哪里找"。安全标准告诉你"为什么这是问题"。** 一条发现引用了公认的标准，开发者就很难用"这是我们的设计选择"把它驳回。

### 4.1 七份常用资料

| 资料 | 类型 | 审计时怎么用 |
|---|---|---|
| Solidity Patterns（fravoll） | 设计模式 | 行为、安全、升级、经济、Gas 五类模式。例如 Checks-Effects-Interactions、Pull over Push、Emergency Stop、Rate Limit。修复建议可以直接引用模式名 |
| Solcurity（transmissions11） | 审计检查清单 | 按"变量 / 结构体 / 函数 / 修饰器 / 代码 / 外部调用 / 静态调用 / 事件 / 合约 / 项目 / DeFi"逐项提问。适合作为人工审计的骨架 |
| ConsenSys Smart Contract Best Practices | 最佳实践（有中文版） | 通用原则：为失败做准备、谨慎发布、保持简单、跟踪更新 |
| Secureum Security Pitfalls & Best Practices 101 / 201 | 要点合集（共 200 条） | 101 偏 Solidity 语言层，201 偏应用与 DeFi 层。适合面试前快速复习 |
| SCSVS v2（Securing） | 验证标准 | 按架构、访问控制、通信、算术、恶意输入、Gas、DeFi 等分节的可验证要求 |
| EEA EthTrust Security Levels | 认证规范 | `[S]` / `[M]` / `[Q]` 三个等级。从"工具可自动检查"到"需要理解业务" |
| Foundry 测试最佳实践 | 测试规范 | 测试命名、组织、分叉测试、模糊测试与不变量。评价"代码成熟度"里的测试一项时用 |

前 2 份帮你**找**问题。中间 3 份帮你**解释**问题。EthTrust 和测试规范帮你**评价**整个项目。

### 4.2 在发现里怎么引用

以 H-02 为例，参考字段可以这样写：

> **参考：** Solidity Patterns · Checks-Effects-Interactions；Solcurity 的"外部调用"一节。

引用的规则：

1. 写出资料名和具体条目，不只写资料名。
2. 引用只说明"为什么是问题"。**引用不决定等级。** 等级仍然用第 3 节的方法。
3. 竞赛平台不要求引用。私人审计的客户通常欢迎引用，因为它便于内部复核。

> 🧪 动手验证：打开 [审计自查清单](../interactive/audit-checklist.html)，对 LunchPool 逐项勾选。记录每一项对应的是 H-01、H-02、M-01、L-01 中的哪一条，还是没有对应的发现。没有对应的项，说明你可能漏了问题，或者这一项不适用。

### 4.3 审计在哪一层

写"范围与假设"时，你要清楚审计覆盖什么、不覆盖什么。审计只是安全流水线上的一个关口，报告写"无高危"不等于协议安全。完整的关口见 [27 章第 2 节](../27-audit-testing-workflow.md)。运维层的签名流程和前端供应链通常不在合约审计范围内，2025 年 2 月的 Bybit 事件属于这一类（[CertiK 技术分析](https://www.certik.com/blog/bybit-incident-technical-analysis)）。报告仍应提示中心化风险，例如"owner 可以挪走全部资金"。

> 💡 注意：中心化风险通常不按"可被利用的漏洞"定级。私人审计常把它写成信息项或单独一节。Code4rena 曾把它放进 QA（见第 3.2 节）。

---

## 5. 信息、Gas 和代码成熟度

没有直接风险的内容，放在单独的章节。

| 类型 | 写什么 | LunchPool 的例子 |
|---|---|---|
| 信息（Informational） | 不是漏洞，影响可读性或可运维性 | `setOrganizer` 没有事件（I-01） |
| Gas | 不影响正确性的优化 | 循环里重复读 `eaters.length`（G-01） |
| 代码成熟度（Code Maturity） | 按类别评价工程质量 | 访问控制"弱"，文档"中"，测试"弱" |

代码成熟度从整体上告诉客户：问题是偶发的，还是流程缺陷的结果。

> 💡 注意：私人审计的报告需要这些内容。竞赛平台通常不接受或单独处理这类内容，规则见第 3.2 节。提交前读规则。

---

## 6. 生成报告

### 6.1 报告的结构

模型报告是 [report/LunchPool-report.md](../../examples/range/basics/report/LunchPool-report.md)。它包含：

1. 概览表（提交哈希、范围、方法）
2. 摘要（上线结论、数量统计）
3. 范围与假设
4. 发现详情
5. 信息与 Gas
6. 代码成熟度
7. 免责声明

打开它，通读一遍。

### 6.2 生成 PDF

配套工具 `report/build_report.py` 做 3 件事：

1. 核对摘要的数量和正文的发现数量。不一致时报错退出。
2. 把 Markdown 套入 `template.html`。
3. 调用 Chrome 无头模式打印成 PDF。

需要：Python 3 和 Chrome（或 Chromium）。

```bash
cd examples/range/basics/report  # 进入报告目录
python3 -m venv .venv  # 建一个独立的 Python 虚拟环境
.venv/bin/pip install markdown  # 在虚拟环境里安装 markdown 库
# 核对数量，生成 HTML 和 PDF
.venv/bin/python build_report.py LunchPool-report.md
```

实际输出：

```text
findings: 7
html: out/LunchPool-report.html
pdf:  out/LunchPool-report.pdf (595 KB)
```

打开 `out/LunchPool-report.pdf`。手册的运行结果是 5 页 A4。

> 💡 注意：`findings: 7` 包含 H、M、L、I、G 全部 7 项。PDF 文件大小会随系统字体变化。

这个脚本还是一道质量门。把摘要里的 `| 高 | 2 |` 改成 `| 高 | 3 |`，再运行：

```text
摘要与正文不一致：高: 摘要写 3，正文有 2
```

运行后改回 2。

> 💡 注意：社区常用 Pandoc + LaTeX 模板生成 PDF。手册运行环境没有安装 Pandoc，所以没有验证这条路径。

> 🧪 动手验证：修改 `template.html` 里 `h1` 的颜色，重新生成 PDF，确认模板生效。然后给报告加一条你自己写的 `[I-03]`，同时把摘要的信息数量改为 3。

### 6.3 练习：自己写一条

1. 选择 [B08](B08-tokens-and-vault.md) 的破坏 B（`BrokenVaultB`）。
2. 复制 `report/finding-template.md`。
3. 填写全部字段。严重度用第 3.1 节的矩阵。
4. PoC 指向 `test_BreakB_FeeTokenMakesVaultInsolvent`。
5. 对照下面的自检表。

| 自检项 | 通过？ |
|---|---|
| 标题里有根因和后果 | |
| 没有"可能""也许""建议加强" | |
| 影响里有具体数字 | |
| PoC 是一条能直接运行的命令 | |
| 修复建议里有代码 | |
| 引用了一条最佳实践或标准（可选） | |
| 定级写明了影响和可能性 | |

<details class="predict"><summary>🤔 参考定级和标题</summary>

标题：`deposit` 按请求金额记账，收费代币使金库资不抵债，最后取款的用户无法取回。

定级取决于金库支持哪些代币。如果规格允许任意 ERC-20，影响为高、可能性为中，矩阵结果是高。如果规格明确只支持标准代币，这个问题降级，或者作为规格说明处理。**你需要在报告里写出这个假设。**

</details>

---

## 7. 如果出错

| 现象 | 原因 | 处理 |
|---|---|---|
| `没有找到 Chrome 或 Chromium` | Chrome 不在默认路径 | 脚本已生成 HTML，用浏览器打印为 PDF；或者把路径加入 `CHROME_CANDIDATES` |
| `ModuleNotFoundError: markdown` | 没有用虚拟环境的 Python | 使用 `.venv/bin/python` |
| `摘要与正文不一致` | 数量对不上 | 按提示修改摘要表 |
| 表格没有渲染 | 表格前没有空行 | 在表格前加一个空行 |
| PDF 中文显示成方块 | 系统没有中文字体 | 在 `template.html` 的 `font-family` 中加入你系统上的中文字体 |
| 报错提示 Chrome 超时 | 无头 Chrome 启动失败 | 重新运行；确认 Chrome 能正常打开 |

---

## 8. 过关标准

- [ ] 你能把 3 个差标题改写成"根因 + 影响"。
- [ ] 你写完了 `BrokenVaultB` 的发现，自检表全部通过。
- [ ] 你生成了 LunchPool 的 PDF，打开后中文正常。
- [ ] 你能说出 Sherlock 和 CodeHawks 在"可能性"上的区别。
- [ ] 你能说出第 4.1 节 7 份资料各自的用途，并用审计自查清单完成一次 LunchPool 自审。
- [ ] 你试过把摘要数量改错，并看到脚本报错。

---

## 9. 相关章节

- [A02 风险评级与报告](../assessment/A02-risk-rating-reporting.md)
- [A01 审计方法论](../assessment/A01-methodology.md)、[A04 DeFi 协议审查](../assessment/A04-defi-protocol-review.md)
- [04 重入](../04-reentrancy.md)、[27 审计与测试](../27-audit-testing-workflow.md)
- [T03 发现报告模板](../templates/T03-finding-report.md)
- [B09 读代码与攻击者思维](B09-reading-code-mindset.md)、[B27 专业审计流程](B27-what-is-audit.md)（阶段 4）、[B53 竞赛与赏金](B53-contests-and-habits.md)（阶段 7）
- [B25 毕业设计](B25-capstone-minilend.md)
- 交互实验：[评级计算器](../interactive/severity-calculator.html)、[审计自查清单](../interactive/audit-checklist.html)

> 🪞 反思：
> 1. 回看你在 B09 写的笔记。哪一条写得最含糊？用本章的公式重写它。
> 2. 取出你团队现有的开发规范。其中哪一条能对应到外部标准？哪一条只是"大家都这么做"？
> 3. 上一次违反规范时，谁发现了？

---

## 10. 思考题

1. 把"合约存在精度问题，建议使用更高精度"改写成一条合格的发现标题和修复建议（自己设定一个具体场景）。
2. 一个发现：只有 owner 能触发，owner 是 2/3 多签，后果是挪走全部用户资金。用矩阵定级，并说明你还需要了解什么。
3. Sherlock 不把可能性纳入定级，CodeHawks 纳入。各自的好处和代价是什么？
4. 从 Solcurity 中挑 5 个你没想到过的问题，各举一个能触发它的代码例子。
5. EthTrust `[S]` 级要求和 `[Q]` 级要求的本质区别是什么？哪一级可以完全依赖工具？

下一章：[B15 第 2 次审计：LuckyPot](B15-audit-2-luckypot.md)
