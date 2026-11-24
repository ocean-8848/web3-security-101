# 3b1b 风格知识讲解：并入学习站

学习站的源在 `web3-security-101/` 克隆里（含尚未提交的「拟物化知识讲解」改动）。本目录只放让构建脚本认识新章节的补丁。

- `3b1b-deck.patch`：给克隆里的 `handbook/tools/build.mjs` 加「3b1b 风格知识讲解」一篇（每章 `dNN`，读 `handbook/decks/3b1b/chNN.html`），并给 `learning-site/build.py` 把 `deck3b/` 带进发布文件。在克隆根目录运行 `git apply <本补丁>`。
- 页面本身由 `tools/make_deck.py EPNN-slug` 生成到 `output/deck/chNN.html`（不入库，可重新生成）；复制到克隆的 `handbook/decks/3b1b/` 后，运行 `node handbook/tools/build.mjs` 和 `python3 learning-site/build.py security`。
- 每章的页面内容在 `EPNN-slug/deck.json`。
