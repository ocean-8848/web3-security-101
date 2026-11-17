# Web3 安全学习手册与学习站

本仓库存放三部分源码：

| 目录 | 内容 | 构建 |
|---|---|---|
| `Web3-Security/` | 《Web3 安全学习手册》Markdown 源稿、交互实验页、构建脚本 | `node Web3-Security/tools/build.mjs` → `Web3-Security/dist/index.html` |
| `practice-example-code/` | 示例代码：单文件示例合约（01–08）、Foundry 工程（`foundry/`）、MiniLend 靶场、训练营靶场（`range/`）、手敲练习工程（`bootcamp-lab/`） | 在各 Foundry 目录下运行 `forge test` |
| `learning-site/` | Web3 安全学习站：学习进度层（`learn.js`、`visual.js`）、参考答案、构建脚本 | `python3 learning-site/build.py security` → `learning-site/security/index.html` |

## 准备

```bash
git clone https://github.com/ocean-8848/web3-security-handbook.git
cd web3-security-handbook
bash practice-example-code/setup.sh  # 示例代码的依赖
cd Web3-Security/tools && npm install
```

- 构建学习站之前，先构建手册。学习站读取 `Web3-Security/dist/index.html`。
- 发布前运行链接检查：`node Web3-Security/tools/check-links.mjs`。
- 示例代码用 Foundry。依赖（`lib/`）和构建产物（`out/`、`cache/`）不进仓库。克隆后在仓库根目录运行一次 `bash practice-example-code/setup.sh`，它下载固定版本的 forge-std（v1.11.0）和 OpenZeppelin（v5.6.1），并为各靶场建好 `lib/forge-std` 链接。
- 学习时的根目录就是克隆下来的 `web3-security-handbook/`。手册里的命令（例如 `cd practice-example-code/foundry`）都从这里运行。步骤见训练营 B04 第 6 节。
- 视频成品（`Web3-Security/video/output/`）不进仓库，只保留脚本、幻灯片和工具源码。

## 说明

- `learning-site/build.py` 也能构建其他学习站（CEX、合约等），但它们的源码不在本仓库，只有 `security` 目标能从本仓库直接构建。
- 写作规范见 `Web3-Security/WRITING-GUIDE.md`。
