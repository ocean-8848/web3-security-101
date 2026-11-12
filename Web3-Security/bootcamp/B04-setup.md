# B04 环境搭建

> 学习目标：读完本章，你能——
> 1. 在终端里移动目录、查看文件、运行命令。
> 2. 用 git 记录每一次修改。
> 3. 安装 Foundry，并跑通第一个测试。
> 4. 说清楚什么目标可以测试、什么目标绝对不能碰。
>
> 前置章节：无。你不需要任何编程经验。
> 预计用时：1～2 小时
> 最后核对：2026-11-10

---

## 开场：先定规矩，再装工具

这个训练营教你找智能合约的漏洞。同样的技能，用在自己的本地合约上是学习，用在别人的线上合约上可能是犯罪。

所以第一节不是安装，而是边界。

<details class="predict"><summary>🤔 先猜再看：你在一个线上合约里发现了漏洞。你想"验证一下"，转走 1 美元再还回去。这样可以吗？</summary>

不可以。"小额"和"打算归还"都不构成授权。正确做法是不动手，在本地分叉上验证，然后走项目方公开的漏洞报告渠道。下一节解释原因。

</details>

---

## 1. 法律和道德边界（必读）

> ⚠️ 警告：本节是通用安全常识，不是法律意见。具体问题请咨询你所在地区的律师。

**本训练营的规则只有一条：所有练习只在你自己的电脑上运行。**

| 可以做 | 不可以做 |
|---|---|
| 攻击你自己写的本地合约（`forge test`、`anvil`） | 向任何真实网络上的他人合约发送攻击交易 |
| 用只读分叉读取状态，在本机模拟 | 在分叉上验证后，把交易发到真实网络 |
| 参加明确授权的审计竞赛和漏洞赏金，遵守其规则 | 超出赏金范围测试，或用真实资金"试一下" |
| 把漏洞私下报告给项目方 | 公开未修复的漏洞，或以此勒索 |

三件事必须记住：

1. **授权必须事先取得，并且写明范围。** 代码开源不等于允许攻击。
2. **多个司法辖区把未经授权访问或破坏计算机系统定为犯罪。** 例如中国《刑法》第 285、286 条和美国《计算机欺诈与滥用法》（CFAA，18 U.S.C. § 1030）。
3. **"代码即法律"不是抗辩。** 美国的 Mango Markets 案中，法官在 2025 年 5 月撤销了对操纵者的定罪，理由涉及审判地和证据问题。这个结果没有确立"利用合约漏洞合法"的规则，当事人事前也经历了刑事起诉。

漏洞赏金平台也有自己的规则。[Immunefi 的规则页](https://immunefi.com/rules/)把在主网或公共测试网上测试列为禁止行为，违反者会被永久封禁。SEAL 的白帽安全港（Safe Harbor）只适用于正在发生的攻击，并且只覆盖协议登记的资产，它不是日常测试的许可。

资料来源：[Immunefi Safe Harbor](https://immunefi.com/safe-harbor/)、[SEAL Safe Harbor](https://frameworks.securityalliance.org/safe-harbor)、[Bloomberg 对 Mango 案的报道](https://www.bloomberg.com/news/articles/2025-05-24/crypto-trader-s-convictions-vacated-in-mango-markets-fraud-case)。

> 🎯 打个比方：开锁课上，老师给你一把练习锁。你可以把它拆开一百次。你不能拿同样的手法去开邻居的门，"我只是看看，没拿东西"也不行。
>
> 比喻的局限：邻居的门是一个人的财产。一个线上合约可能同时托管几万人的资金，一次"试试"的影响面更大。

---

## 2. 终端基础

终端（Terminal）是用文字操作电脑的窗口。macOS 打开"终端"应用。Windows 请安装 WSL（Windows Subsystem for Linux），然后打开 Ubuntu。Foundry 官方说明：Windows 上不支持 PowerShell 和 CMD，要用 Git Bash 或 WSL。

一条命令的结构是"程序名 + 参数"。按回车运行。

依次运行：

```bash
cd ~                     # 回到主目录
pwd                      # 打印当前所在目录
mkdir -p bootcamp-try    # 新建练习目录，已存在也不报错
cd bootcamp-try          # 进入练习目录
echo "hello" > note.txt  # 把 hello 写进 note.txt
cat note.txt             # 显示文件内容
ls                       # 列出当前目录的文件
```

预期输出（第 1 行的路径取决于你的用户名）：

```text
/Users/你的用户名
hello
note.txt
```

| 命令 | 作用 |
|---|---|
| `pwd` | 显示当前目录 |
| `ls` | 列出当前目录的文件 |
| `cd 目录` | 进入目录。`cd ..` 回到上一级，`cd ~` 回到主目录 |
| `mkdir -p 目录` | 创建目录 |
| `cat 文件` | 显示文件内容 |
| `echo 文字 > 文件` | 把文字写入文件（覆盖） |

> 💡 注意：按 `Tab` 键可以补全文件名。按 `↑` 键可以调出上一条命令。按 `Ctrl+C` 可以中止正在运行的程序。

---

## 3. git：给代码存档

git 是版本控制工具。它记录每次修改，让你能回到任何一次存档。

先设置你的名字（只需一次）：

```bash
# --global：对本机所有仓库生效
git config --global user.name "your-name"
# 邮箱会写进每条提交记录
git config --global user.email "you@example.com"
```

然后练习一次完整流程：

```bash
cd ~/bootcamp-try
git init                   # 把当前目录变成 git 仓库
git add note.txt           # 把文件放入暂存区
git commit -m "first note" # 存档，-m 后面是说明
git log --oneline          # 每条存档显示为一行
```

预期输出的最后一行（前 7 位哈希每次都不同）：

```text
a1b2c3d first note
```

提交哈希（Commit Hash）是这次存档的唯一编号。审计报告用它精确指明审的是哪个版本。[B09](B09-reading-code-mindset.md) 会用到。

| 命令 | 作用 |
|---|---|
| `git status` | 查看哪些文件有改动 |
| `git diff` | 查看具体改了什么 |
| `git add 文件` | 把改动放入暂存区 |
| `git commit -m "说明"` | 存档 |
| `git log --oneline` | 查看存档历史 |

---

## 4. 编辑器

推荐 [VS Code](https://code.visualstudio.com/)。安装后：

1. 打开扩展面板。
2. 搜索 `Solidity`，安装发布者为 Nomic Foundation 的扩展。

Nomic 的扩展提供语法高亮和跳转。任何能编辑文本的工具都可以完成本训练营。

---

## 5. 安装 Foundry

Foundry 是智能合约开发和测试工具集。它包含 4 个程序：

| 程序 | 作用 |
|---|---|
| `forge` | 编译和测试合约 |
| `cast` | 在命令行里和链交互 |
| `anvil` | 在本机运行一条测试链 |
| `chisel` | 交互式运行 Solidity 片段 |

1. 下载安装器：

```bash
# curl 下载安装脚本，-L 跟随跳转，| bash 直接运行它
curl -L https://foundry.paradigm.xyz | bash
```

2. 关闭终端，重新打开一个。
3. 安装 Foundry：

```bash
# 下载并安装 forge、cast、anvil、chisel
foundryup
```

4. 检查版本：

```bash
# 能打印版本号，说明安装成功
forge --version
```

本手册的运行环境输出：

```text
forge Version: 1.5.1-stable
Commit SHA: b0a9dd9ceda36f63e2326ce530c10e6916f4b8a2
Build Timestamp: 2025-12-22T11:41:09.812070000Z (1766403669)
Build Profile: maxperf
```

> 💡 注意：本训练营的全部示例输出都在 1.5.1-stable 上实际运行得到。2026-11-10 查询 GitHub，Foundry 已有版本标签 v1.9.0，手册未在该版本上运行。你的版本更新时，输出的格式和 gas 数字会有差别。需要完全一致时，运行 `foundryup --install 1.5.1`。

> ⚠️ 警告：`curl … | bash` 会运行下载的脚本。只对你信任的官方地址这样做。[20 章](../20-frontend-dns-supply-chain.md) 讲解了供应链攻击。

---

## 6. 创建你的练习工程

```bash
cd ~
forge init bootcamp-lab  # 生成带示例合约的新工程
cd bootcamp-lab
forge build              # 编译 src/ 里的合约
forge test               # 运行 test/ 里的测试
```

`forge init` 创建工程。最后的预期输出：

```text
Ran 2 tests for test/Counter.t.sol:CounterTest
[PASS] testFuzz_SetNumber(uint256) (runs: 256, μ: 27734, ~: 29289)
[PASS] test_Increment() (gas: 28783)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 3.37ms (3.13ms CPU time)

Ran 1 test suite in 400.67ms (3.37ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)
```

工程目录的含义：

| 路径 | 内容 |
|---|---|
| `src/` | 合约源码 |
| `test/` | 测试 |
| `script/` | 部署脚本 |
| `lib/` | 依赖库，`forge-std` 在这里 |
| `foundry.toml` | 工程配置 |

存一次档。`forge init` 已经创建了 git 仓库：

```bash
git add .                       # . 表示当前目录下所有改动
git commit -m "chore: init lab"
```

---

## 7. 测试专用钱包规范

钱包（Wallet）管理私钥。私钥（Private Key）能花掉一个地址上的全部资金。

本训练营**完全不需要真实钱包，不需要真实 ETH，也不需要测试网代币**。

| 规则 | 原因 |
|---|---|
| 练习时不打开你的真实钱包 | 一次误签就可能造成损失 |
| 不把真实私钥或助记词写进代码、`.env`、聊天或终端命令 | 文件和命令历史会泄露 |
| `anvil` 的默认账户只能用于本地 | 它们的私钥是公开的。任何人都能转走这些地址在真实网络上的资金 |
| 需要浏览器钱包练习时，新建独立的浏览器配置 | 隔离真实资产 |
| 把 `.env` 写进 `.gitignore` | 防止把配置提交到公开仓库 |

后面的章节用 `--unlocked` 参数向 `anvil` 发交易。这个参数让本地节点代签，你不需要输入任何私钥。

> ⚠️ 警告：任何网站、私信或"技术支持"要求你提供助记词，都是骗局。详见 [18 钱包与密钥](../18-wallet-key-management.md) 和 [19 用户诈骗](../19-user-scams.md)。

---

## 8. 如果出错

| 现象 | 原因 | 处理 |
|---|---|---|
| `command not found: forge` | 新路径没有生效 | 关闭并重新打开终端；如果仍失败，运行 `source ~/.zshrc`（bash 用 `source ~/.bashrc`），再运行 `foundryup` |
| `foundryup: command not found` | 安装器脚本没有运行成功 | 重新运行第 5 节第 1 步 |
| `forge init` 报目录非空 | 目标目录已存在 | 换一个名字，或删除旧目录 |
| `Please tell me who you are` | 没有配置 git 用户名 | 运行第 3 节的两条 `git config` |
| 下载 `forge-std` 失败 | 网络连不上 GitHub | 检查网络和代理设置，再重试 |
| Windows 上命令不可用 | 在 PowerShell 或 CMD 里运行 | 改用 WSL |

---

## 9. 过关标准

- [ ] 你能背出 `pwd`、`ls`、`cd`、`cat` 的作用。
- [ ] `git log --oneline` 至少显示 1 条提交。
- [ ] `forge --version` 正常输出版本。
- [ ] `~/bootcamp-lab` 里 `forge test` 显示 `2 tests passed`。
- [ ] 你能用一句话说出本训练营的规则：所有练习只在本机运行。

---

## 10. 相关章节

- [01 安全全景](../01-security-landscape.md)
- [18 钱包与密钥管理](../18-wallet-key-management.md)
- [B53 竞赛与赏金](B53-contests-and-habits.md)
- 下一章：[B05 第一个合约](B05-first-contract.md)

> 🪞 反思：你现在的电脑上有没有真实钱包？你准备用什么办法把练习环境和它隔开？

---

## 11. 思考题

1. 你在开源仓库里读到一个合约，它有明显的漏洞，已部署到主网。列出你**可以**做的事和**不可以**做的事。
2. 为什么 `anvil` 的默认私钥公开也没关系？在什么情况下它会造成真实损失？
3. 审计报告为什么要写提交哈希，只写"main 分支"有什么问题？

下一章：[B05 第一个合约](B05-first-contract.md)
