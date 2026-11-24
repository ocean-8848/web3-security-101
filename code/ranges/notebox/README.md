# NoteBox（审计靶场 1）

> ⚠️ 警告：本项目只用于本地学习。不要把它部署到任何公开网络。

## 协议说明（审计时把这一节当作客户文档）

NoteBox 是一本链上笔记本。

- 部署者是 owner。
- 每个笔记本有一条秘密笔记和一条公开笔记。
- 只有 owner 能修改秘密笔记。
- 只有 owner 能读取秘密笔记。其他人不能知道内容。
- owner 每 24 小时最多修改一次秘密笔记。
- 任何人都能打赏，最低 0.001 ETH。只有 owner 能提取打赏。

## 审计范围

`src/NoteBox.sol`，约 54 nSLOC。

## 运行

```bash
forge test
```

配套章节：[B13 第 1 次审计：NoteBox](../../../handbook/bootcamp/B13-audit-1-notebox.md)。`test/` 和 `solution/` 含答案，第一遍审计前不要打开。
