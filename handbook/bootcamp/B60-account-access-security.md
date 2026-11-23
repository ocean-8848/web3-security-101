# B60 账号、SIM 与权限：人身账号安全与离职回收

> 学习目标：做完本章，你能——
> 1. 为自己和团队关键人员做一次账号与 SIM 劫持防护盘点，排出前 3 个整改动作。
> 2. 为一个示例团队填写 T07 防社工清单，并写出权限与离职回收的发现。
>
> 前置章节：[B59 识破社工：假作业、假文件与假域名](B59-social-engineering-practice.md)
> 前置知识：完成阶段 0–1（[阶段 1 导读](B07-stage1-guide.md)）；会用终端的 `cd`、`ls`；本机有 `python3`。
> 预计用时：约 1 小时（本篇与 [B59](B59-social-engineering-practice.md) 合计 2–3 小时）。
> 交互实验：[关键人员风险自评](../interactive/personal-risk-lab.html)
> 关联章节：[22 人身与账号安全](../chapters/22-physical-account-security.md)｜[21 社工与内部人](../chapters/21-social-engineering-insiders.md)｜[20 前端、DNS 与供应链](../chapters/20-frontend-dns-supply-chain.md)｜[T07 员工防社工清单](../templates/T07-staff-anti-social-engineering.md)｜[T06 运营安全自查](../templates/T06-ops-security-self-check.md)｜[A06 运营与密钥安全](../assessment/A06-operational-key-security.md)｜[B59 识破社工](B59-social-engineering-practice.md)
> 最后核对：2026-11-10（node v26.12.1、npm 11.20.0、git、unzip、file、python3、dig 均在本机运行过；下文输出来自真实运行；两个实验页的题目和计算逻辑已逐条读过）

> ⚠️ 警告：法律与道德边界。本章的"恶意"样本都是你自己在空目录里造的无害文件。只在你自己的设备和账号上练习。对同事做钓鱼演练、假招聘测试或电话社工，必须先有公司的书面授权（例如安全团队主办的意识培训项目），并事先约定范围和数据处理方式。不要用本章的方法测试陌生人或其他公司。

---

## 开场：攻击者已经到了门里

[B59](B59-social-engineering-practice.md) 练的是在攻击链的前两环打断社工：接触和诱饵。本篇练后两环。攻击者拿到了你的密码、验证码或手机号码；或者一个已经离职的人，仍握着发布和签名权限。到了这一步，只能靠抗钓鱼 MFA、最小权限和离职回收兜底。

## 1. 本章怎么练

原理不在这里重讲。账号与 SIM 劫持见 [22 章 §3](../chapters/22-physical-account-security.md)，内部人风险的信号和流程见 [21 章 §4.3–4.4](../chapters/21-social-engineering-insiders.md)。第 1 步盘点你自己的账号与 SIM 劫持防护，第 2 步审一张示例团队的权限表。

**准备**：第 1 步的练习文件放在 [B59](B59-social-engineering-practice.md) 用过的练习目录 `b50-lab` 里。如果你没有做 B59，先新建它：

```bash
mkdir b50-lab && cd b50-lab   # 练习目录，做完可以整个删除
```

## 2. 第 1 步：账号与 SIM 劫持防护盘点

原理见 [22 章 §3.2](../chapters/22-physical-account-security.md)。2024 年 1 月，攻击者对 SEC 官方 X 账号绑定的号码做 SIM 劫持。SEC 承认此前曾请 X 关闭该账号的 MFA（[SEC 声明](https://www.sec.gov/secgov-x-account)）。

### 2.1 看懂验证码到底是什么

1. 在 `b50-lab` 新建 `totp.py`。密钥是本地随机生成的，只用于练习：

```python
# 练习用：本地计算 TOTP（RFC 6238）。密钥是随机生成的，只用于练习。
import base64, hmac, hashlib, os, struct, time
secret = base64.b32encode(os.urandom(10)).decode()
def totp(key_b32, t=None, step=30):
    counter = int((t or time.time()) // step)
    mac = hmac.new(base64.b32decode(key_b32), struct.pack(">Q", counter), hashlib.sha1).digest()
    off = mac[-1] & 0x0F
    code = (struct.unpack(">I", mac[off:off+4])[0] & 0x7FFFFFFF) % 1_000_000
    return f"{code:06d}"
now = time.time()
print("practice secret :", secret)
print("code now        :", totp(secret, now))
print("code +30s       :", totp(secret, now + 30))
print("seconds left    :", 30 - int(now) % 30)
```

2. 运行：

```bash
python3 -I totp.py   # -I：隔离模式，不加载当前目录的模块
```

真实输出（你的值会不同）：

```text
practice secret : H5XD2E6LJRNTP5KG
code now        : 654410
code +30s       : 108122
seconds left    : 19
```

验证码只由"密钥 + 时间"算出。它不知道你在哪个网站输入它。

<details class="predict"><summary>🤔 先猜再看：你在一个仿冒的交易所登录页输入了密码和 TOTP 验证码。攻击者能用吗？</summary>

能，只要在验证码失效前转发到真网站。上面的输出显示，一个码大约有效 30 秒，足够自动化脚本转发。硬件安全密钥（FIDO2 / 通行密钥）会把签名绑定到真实域名，仿冒域名拿不到可用的签名。所以 [22 章 §4.3](../chapters/22-physical-account-security.md) 要求关键账号用硬件密钥。短信码比 TOTP 更弱：它还能被 SIM 劫持截走。

</details>

### 2.2 盘点你的恢复路径

第二因素的强度，等于恢复流程里最弱的一环。打开你自己的账号设置页，逐个查看，填下表。不要把密码或恢复码写进表里：

| 账号 | 第二因素 | 能用短信重置吗 | 恢复邮箱 / 号码是否公开过 | 动作 |
|---|---|---|---|---|
| 主邮箱 | | | | |
| 交易所 | | | | |
| 代码托管（GitHub 等） | | | | |
| 域名注册商 | | | | |
| X / Discord / Telegram | | | | |

然后联系你的运营商，询问号码转移锁或 SIM 更换 PIN 怎么开（对应 PHY-3）。

### 2.3 用实验排优先级

> 🧪 动手验证：打开[关键人员风险自评](../interactive/personal-risk-lab.html)。先用下面的示例人物"小林"作答，确认你读结果的方式正确；再用你自己的答案作答。

"小林"的 15 个答案，按页面题目顺序（L=第 1 个选项，M=第 2 个，R=第 3 个）：

```text
SIM 卡劫持 5 题：R R M M R
账号接管 5 题：  M R L M R
人身暴露 5 题：  L M L R M
```

岗位选"多签签名人"时，页面应显示下面的内容（摘要；页面还会显示每项的分类和优先级数值，权重是示例）：

```text
SIM 卡劫持：高 81%   账号接管：高 61%   人身暴露：中 41%
优先动作：
1. 大额资产改用异地多签或时间锁，随身只放少量资产（约 1 周）
2. 在邮箱、交易所、域名注册商关闭短信恢复，改用硬件密钥（约 1 小时）
3. 官方账号迁入组织账号管理，写明交接流程，禁止关闭 MFA（约 2 天）
```

把岗位改成"官方社交账号管理员"，三项百分比不变。第 1 项变成"关闭短信恢复"，第 3 项变成"开启号码转移锁"。

<details class="predict"><summary>🤔 先猜再看：答案没变，为什么换岗位后优先动作的顺序变了？</summary>

分项百分比只看答案。优先级还要乘以岗位系数：签名人的"人身暴露"系数是 1.3，社交账号管理员是 0.8。所以"一人能立即转出大额资产"对签名人排第一，对账号管理员排不进前三。这些系数是本手册的示例权重，不是行业标准。

</details>

## 3. 第 2 步：权限最小化与离职回收

内部人风险的信号和流程见 [21 章 §4.3–4.4](../chapters/21-social-engineering-insiders.md)。这一步你审一张示例团队的权限表。

示例团队"NoteDAO"（虚构）有 5 个人。下表是你从各系统导出的权限：

| 人员 | 岗位 | 代码合并 | 合约部署 | npm 发布 | 多签签名人 | 官方 X 账号 | 客服后台 |
|---|---|---|---|---|---|---|---|
| A | CTO | ✅ 可自合并 | ✅ | ✅ | ✅ | — | — |
| B | 后端 | 需审查 | — | ✅ | ✅ | — | — |
| C | 运营 | — | — | — | ✅ | ✅（个人账号登录） | 全量用户 |
| D | 外包客服 | — | — | — | — | — | 全量用户 |
| E | 前员工（上月离职） | — | — | ✅ | ✅ | — | — |

1. 逐行找问题。每个问题写成一条发现，标上检查项编号。
2. 先自己找 10 分钟，再打开提示。

<details class="predict"><summary>🤔 提示：至少有 6 个问题。按"单人可完成 / 边缘权限 / 数据访问"三类去找。</summary>

1. A 可以自合并并部署合约，单人能完成"改代码 → 上线"（SOC-4、SOC-5）。
2. E 离职一个月，仍有 npm 发布权和多签签名人身份（SOC-7）。Ledger Connect Kit 事件就是漏了 npm 权限（[20 章 5.3 节](../chapters/20-frontend-dns-supply-chain.md)）。
3. 多签移除 E 之前，应先确认阈值和剩余签名人是否足够独立。
4. C 用个人账号登录官方 X，交接时容易关闭 MFA（PHY-4）。
5. C 和 D 都能查全量用户，超出岗位需要（SOC-8）。2025 年 Coinbase 泄露来自被收买的外包客服（[21 章 5.6 节](../chapters/21-social-engineering-insiders.md)）。
6. B 有 npm 发布权但不是发布负责人，应收回或改成短期凭证（T07 D3）。

</details>

## 4. 交付物：为 NoteDAO 填 T07 第 2 部分

把 [B59](B59-social-engineering-practice.md) 第 1–4 步和本篇第 1–2 步的结论填进 [T07](../templates/T07-staff-anti-social-engineering.md) 的关键岗位附加检查。下面是"开发与运维"和"招聘与入离职"两节的示范。其余各节你自己填：

```markdown
### 2.3 开发与运维（NoteDAO，2026-11-10，核对人：你的名字）
| # | 检查项 | 状态 | 备注 |
|---|---|---|---|
| D1 ★ | 外部项目只在隔离环境运行 | ❌ | 无一次性 VM 规定；B59 第 1 步样本在工作机可直接运行 |
| D2 | 打开陌生仓库前检查 tasks.json、package.json 脚本 | ⚠️ | 已写入入职培训，未抽查 |
| D3 | 发布凭证为短期凭证 | ❌ | A、B、E 持有长期 npm token |
| D4 | 合并需他人审查；合约发布双人确认 | ❌ | A 可自合并并部署 |

### 2.6 招聘与入离职
| # | 检查项 | 状态 | 备注 |
|---|---|---|---|
| H3 ★ | 离职当天回收全部权限 | ❌ | E 仍有 npm 与多签签名人身份 |

### 2.7 结论
- 红线项未通过：D1、H3（另见 2.1 K1，待第 1 步盘点结果）
- 整改：E 的权限 24 小时内回收；npm 改用短期 token；A 的合并需第二人审查
```

再附一页"演练记录"：你在 [B59](B59-social-engineering-practice.md) 第 4 步的两次得分、最弱手法、本篇第 1 步的前 3 个动作和完成日期。

## 5. 检查清单

检查项编号沿用 [21 章 §6](../chapters/21-social-engineering-insiders.md)（SOC）和 [22 章 §6](../chapters/22-physical-account-security.md)（PHY），含义相同。用 NoteDAO 或你自己的团队填写：

| 检查项 | 本章对应练习 | 结论（✅ / ⚠️ / ❌） | 证据 |
|---|---|---|---|
| **SOC-3** 硬件密钥 MFA、短会话、异地告警 | 第 1 步 2.1 | | |
| **SOC-5** 发起、审批、执行、审计分离 | 第 2 步 | | |
| **SOC-7** 离职回收覆盖边缘权限 | 第 2 步 | | |
| **SOC-8** 客服与外包数据访问最小化 | 第 2 步 | | |
| **PHY-2** 关键账号硬件密钥，关闭短信恢复 | 第 1 步 2.2 | | |
| **PHY-3** 运营商号码转移锁 | 第 1 步 2.2 | | |
| **PHY-4** 官方账号由组织管理，交接不关 MFA | 第 2 步 | | |

SOC-1、SOC-2、SOC-4、SOC-6、SOC-9、SOC-10 在 [B59](B59-social-engineering-practice.md)。第 2 步 NoteDAO 的发现也会用到 SOC-4。

定级用 [A02](../assessment/A02-risk-rating-reporting.md) 复核。涉及个人隐私的证据只写结论，不写住址和号码。

> 🪞 反思：打开你自己的账号设置页。
> 1. 你的哪个账号今天仍能只凭短信验证码重置？

## 6. 如果出错

| 现象 | 原因 | 处理 |
|---|---|---|
| 风险自评结果和本章不同 | 选项顺序数错，或岗位不同 | 按 L / M / R 重新逐题核对；先确认岗位 |

## 7. 过关标准

- [ ] 用"小林"的答案复现 81% / 61% / 41%，并解释换岗位后排序变化的原因。
- [ ] 在 NoteDAO 权限表中找出至少 5 个问题，每个都标出 SOC 或 PHY 编号。
- [ ] 交付一份填好的 T07 第 2 部分，至少写明 2 个红线项结论和整改期限。

## 8. 思考题

1. 一位签名人说："我的交易所账号用了 TOTP，所以不怕 SIM 劫持。"用第 1 步的结果，指出这句话成立需要哪个前提，以及它仍然防不住哪种攻击。
2. NoteDAO 准备把前员工 E 移出多签。移除本身也是一笔多签交易。按 [21 章 §4.3](../chapters/21-social-engineering-insiders.md) 和本章第 2 步，写出你会按什么顺序回收 E 的各项权限，并说明理由。

- 下一章：[链下赛道 L2 导读：固若金汤——基础设施与运营](B61-offchain-l2-guide.md)
