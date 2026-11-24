# Web3 安全学习手册与学习站

本仓库存放三部分源码：

| 目录 | 内容 | 构建 |
|---|---|---|
| `handbook/` | 《Web3 安全学习手册》Markdown 源稿、交互实验页、构建脚本 | `node handbook/tools/build.mjs` → `handbook/dist/index.html` |
| `code/` | 示例代码与靶场（结构见下表） | `bash code/setup.sh` 装依赖，再在各 Foundry 目录下运行 `forge test` |
| `learning-site/` | Web3 安全学习站：学习进度层（`learn.js`、`visual.js`）、参考答案（`answers/`）、补充图解（`diagrams/`）、构建脚本 | `python3 learning-site/build.py` → `learning-site/security/index.html` |

```
web3-security-101/
├── handbook/        手册源稿
│   ├── chapters/      知识正文 01–33
│   ├── bootcamp/      训练营 B00–B83
│   ├── architecture/  架构与运营 X00–X48
│   ├── chains/  assessment/  templates/
│   ├── interactive/   交互实验页
│   ├── decks/         skeuomorphic/、3b1b/ 两套知识讲解幻灯
│   ├── video/         视频工程与选集播放器
│   ├── docs/          写作规范与写作简报
│   └── tools/         构建与链接检查脚本
├── code/            示例代码与靶场
└── learning-site/   学习站
```

`handbook/` 的结构：

| 路径 | 内容 | 文件前缀 → 站内 ID |
|---|---|---|
| `README.md` | 手册首页 | `home` |
| `chapters/` | 知识正文 33 章 | `01`–`33` → `s01`–`s33` |
| `bootcamp/` | Web3 安全训练营 | `B00`–`B83` → `w..`（映射见 `tools/build.mjs` 的 `BOOT_IDS`） |
| `architecture/` | Web3 安全架构与运营：A 通用底座 X00–X09、B 交易所 X10–X30、C 公链与项目方 X31–X36、D 其他应用场景 X37–X48 | `X00`–`X06` → `x00`–`x06`；`X07`–`X48` → `y07`–`y48`（旧编号的 `x07`–`x48` 经 `ALIASES` 跳转） |
| `chains/` | 链专题：以太坊、BNB Chain、TRON、Mantle、Solana、Move（Sui / Aptos）、TON、比特币、Rollup | `C00`–`C08` → `k00`–`k08` |
| `assessment/` | 评估篇 | `A01`–`A11` → `a01`–`a11` |
| `templates/` | 评估模板 | `T01`–`T12` → `t01`–`t12` |
| `interactive/` | 交互实验页 | `lab-<文件名>` |
| `decks/skeuomorphic/` | 拟物化知识讲解（每章一个目录 `chNN/`） | `v01`–`v30` |
| `decks/3b1b/` | 3b1b 风格知识讲解（每章一个文件 `chNN.html`） | `d01`–`d30` |
| `video/` | 视频工程：拟物化（`skeuo/`）、3b1b 风格（`3b1b/`）、讲解页（`scripts/`、`slides/`）、渲染工具（`tools/`）；`index.html` 是选集播放器，由 `node handbook/video/tools/make-player.mjs` 生成 | — |
| `docs/` | 写作规范、写作简报和待对齐事项 | `WRITING-GUIDE.md` → `guide` |
| `tools/` | 构建与链接检查脚本、专题映射 `topics.json` | — |

`code/` 的结构：

| 路径 | 内容 |
|---|---|
| `snippets/` | 单文件示例合约 01–08，正文章节直接引用 |
| `foundry-demos/` | Foundry 演示工程：每个示例的攻击与修复测试，含形式化 / 模糊测试示例 |
| `ranges/` | 训练营审计靶场（NoteBox、LuckyPot、MiniSwap、FlashDesk 等），`minilend/` 是 B25 实战靶场 |
| `bootcamp-lab/` | 训练营 B04–B08 手敲练习工程（`Counter`、`Club`）的参考副本 |
| `offchain-ops/` | 链下 L3 赛道共用的虚构交易所靶场 MiniEx：合成数据、检查库、参考解答（Python） |
| `non-evm/` | 非 EVM 与编译器靶场：Solana（Anchor）、Sui Move、Circom、Vyper |
| `setup.sh` | 下载 forge-std、OpenZeppelin，并为各靶场建好 `lib/` 链接 |

## 准备

```bash
git clone https://github.com/ocean-8848/web3-security-101.git
cd web3-security-101
bash code/setup.sh  # 示例代码的依赖
cd handbook/tools && npm install
```

- 构建学习站之前，先构建手册。学习站读取 `handbook/dist/index.html`。
- 发布前运行链接检查：`node handbook/tools/check-links.mjs`。
- 示例代码用 Foundry。依赖（`lib/`）和构建产物（`out/`、`cache/`）不进仓库。克隆后在仓库根目录运行一次 `bash code/setup.sh`，它下载固定版本的 forge-std（v1.11.0）和 OpenZeppelin（v5.6.1），并为各靶场建好 `lib/forge-std` 链接。
- 学习时的根目录就是克隆下来的 `web3-security-101/`。手册里的命令（例如 `cd code/foundry-demos`）都从这里运行。步骤见训练营 B04 第 6 节。
- 视频成品不进仓库，只保留脚本、幻灯片和工具源码：`handbook/video/output/`、`handbook/video/skeuo/epNN/out/`、`handbook/video/3b1b/output/`，以及视频工程里的字体和配乐。
- 构建产物不进仓库，都能从源码重建：`handbook/dist/`、`handbook/preview.html`、`learning-site/security/`。

## 说明

- 本仓库只构建 Web3 安全学习站。其他学习站（CEX、合约等）的源码和构建在仓库之外。
- 写作规范见 `handbook/docs/WRITING-GUIDE.md`。
