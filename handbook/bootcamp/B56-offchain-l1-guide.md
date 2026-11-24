# B56 链下赛道 L1 导读：守好家门——个人与终端安全

> 学习目标：读完本篇，你能——
> 1. 说出链下赛道 L1 要掌握的 6 个主题，以及每个主题怎样算掌握。
> 2. 按顺序安排 L1 的章节，并用过关标准判断能否进入 L2。
>
> 前置：完成阶段 0–1（[阶段 1 导读](B07-stage1-guide.md)）：会用终端、`cast` 和 `anvil`，阶段 1 测验 ≥ 80%。L1 可以和阶段 2–7 交替学习。只做链下安全的读者，阶段 1 里的合约章节可以先跳过，需要看懂合约风险时再补。
> 预计用时：各章用时见第 3 节；整条链下赛道的周计划示例见 [B00 第 4 节](B00-roadmap.md)。

---

## 1. 本阶段学完能做什么

- 说清"熵 → 助记词 → 种子 → 派生路径 → 地址"每一步，为一个团队做密钥分级和方案选择。
- 读懂钱包弹出的每一种签名请求，在签名前用本地链模拟结果，并撤销已有授权。
- 不运行任何代码，拆开一份可疑的"面试作业"或"复盘 PDF"，用换渠道核实识破社工。
- 盘点自己和团队关键人员的账号与 SIM 风险，写出权限与离职回收的发现。

## 2. 要掌握的主题

| 主题 | 在哪学 | 掌握标准 |
|---|---|---|
| 助记词派生与密钥分级 | [B57 第 1–2 步、第 6–7 步](B57-wallet-key-practice.md)、主线 [18](../chapters/18-wallet-key-management.md)、[15](../chapters/15-account-abstraction-wallets.md) | 你演示了索引 1、账户号 1、带 passphrase 三个派生结果；分级表 4 行填完，WAL-1 至 WAL-9 每项都有结论。 |
| 弱随机数私钥与密钥泄露扫描 | [B57 第 3–5 步](B57-wallet-key-practice.md)、主线 [02](../chapters/02-cryptography-randomness.md) | `weak-seed.js` 在 16 位下找到种子，你用本机速度估算了 2³² 所需时间；日志扫描找到 1 个助记词和 1 个私钥。 |
| 读懂签名请求 | [B58](B58-signing-phishing-practice.md)、主线 [19](../chapters/19-user-scams.md)、[29](../chapters/29-signing-path-2026.md)、[09](../chapters/09-mev-signatures.md) | 你写出 `0x095ea7b3`、`0xa22cb465`、`0xd505accf` 对应的函数，钓鱼签名实验用解码视图重做后 10/10。 |
| 签前模拟、撤销与地址投毒 | [B58](B58-signing-phishing-practice.md) | 你在本地链完成"模拟 → 授权 → 被转 100 枚 → 撤销 → 再转失败"，并测出 6 字符相似地址的生成耗时。 |
| 识破社工：假作业、假文件、假域名 | [B59](B59-social-engineering-practice.md)、主线 [21](../chapters/21-social-engineering-insiders.md)、[20](../chapters/20-frontend-dns-supply-chain.md) | 不运行任何脚本，你找出仓库里 2 个自动执行入口；社工场景判断第二遍得分 ≥ 30 / 33。 |
| 账号、SIM 与权限回收 | [B60](B60-account-access-security.md)、主线 [22](../chapters/22-physical-account-security.md)、[T07](../templates/T07-staff-anti-social-engineering.md) | 你在 NoteDAO 权限表中找出至少 5 个问题，每个都标出 SOC 或 PHY 编号。 |

> 💡 注意：本赛道只练习，不重讲原理。原理在主线章节里。签名服务、多签提现和 MPC 应急属于机构运营，放在 L2（[B64](B64-custody-ops-ir-practice.md)）。签名 nonce 重用属于密码学实现，放在 L2（[B68](B68-crypto-zk-bridge-practice.md)）。

## 3. 章节顺序

1. [B57 钱包与私钥实操](B57-wallet-key-practice.md)：一切从私钥开始。约 2–3 小时。
2. [B58 读懂签名请求与本地链演练](B58-signing-phishing-practice.md)：有了私钥，再看它会签下什么；然后在本地链上模拟、撤销授权，测地址投毒。约 3–4 小时。
3. [B59 识破社工](B59-social-engineering-practice.md)：攻击者拿不到私钥时，会先攻击人和终端。约 1.5–2 小时。
4. [B60 账号、SIM 与权限](B60-account-access-security.md)：从个人终端扩展到账号和团队权限。约 1 小时。

## 4. 本阶段交互实验

- [钱包方案对比器](../interactive/wallet-scheme-lab.html)（B57）
- [钓鱼签名识别](../interactive/phishing-signature-lab.html)（B58）
- [地址投毒比对](../interactive/address-poisoning-lab.html)、[签名与重放](../interactive/signature-replay-lab.html)、[多签签前复核](../interactive/multisig-review-lab.html)（B58）
- [社工场景判断](../interactive/social-engineering-lab.html)（B59）
- [关键人员风险自评](../interactive/personal-risk-lab.html)（B60）

## 5. 过关标准

- [ ] [阶段测验](../interactive/bootcamp-quiz.html)选择链下赛道 L1，得分 ≥ 80%。
- [ ] 一份示例团队的密钥分级表（B57）。
- [ ] 一份签名解码记录和一份签前复核单，SGN-1 至 SGN-10 每项都有结论（B58）。
- [ ] 一份社工判断记录（B59）。
- [ ] 一份填好的 T07 第 2 部分，至少写明 2 个红线项结论和整改期限（B60）。
- [ ] 4 章的过关标准全部勾选。

## 6. 下一步

进入 [链下赛道 L2 导读：固若金汤——基础设施与运营](B61-offchain-l2-guide.md)。
